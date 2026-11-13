/* V24 bridge: the approved V07 model is the sole source for native geometry. */
(function(root){'use strict';
const clone=x=>JSON.parse(JSON.stringify(x)),types=['door','fixed','zip','folding','balcony','guillotine','sliding'];
const v70Labels={guillotine:'Giyotin',sliding:'Sürme'};
let v70Failure;
const isV70Type=type=>Object.prototype.hasOwnProperty.call(v70Labels,type);
function label(type){return root.PLMRV24Products?.[type]?.descriptor.label||v70Labels[type]||type;}
function readiness(type){
 const product=root.PLMRV24Products?.[type];
 if(product)return {product,state:'ready'};
 if(isV70Type(type)){
  return v70Failure?{state:'failed',message:v70Failure.message}:{state:'loading',message:'Ürün modülü yükleniyor…'};
 }
 return {state:'failed',message:'Ürün modülü yüklenemedi: '+type};
}
function announceV70Readiness(){
 root.document?.getElementById('plmr-v70-loading')?.remove();
 root.dispatchEvent(new Event('plmr-v70-readiness'));
}
function reportV70Failure(error){
 if(v70Failure)return;
 v70Failure=error;
 console.error('PLMR V70 ürün modülü yüklenemedi',error);
 announceV70Readiness();
}
// Resource errors are observed even when the adapter script itself never runs.
root.addEventListener?.('error',event=>{
 const asset=event.target;
 if(asset?.tagName==='SCRIPT'&&asset.hasAttribute('data-plmr-v70')){
  const path=asset.getAttribute('src').split('?')[0];
  reportV70Failure(Error('Ürün modülü yüklenemedi: '+path));
 }
},true);
function provider(type){
 const status=readiness(type);
 if(!status.product)throw Error(label(type)+' — '+status.message,{cause:v70Failure});
 return status.product;
}
function validateStoredWorkspace(type,workspace){
 // An empty V70 workspace keeps user settings but has no model to resolve.
 // Validate its positions as usual whenever the module is available.
 if(isV70Type(type)&&readiness(type).state!=='ready'&&workspace?.schema==='plmr-v70-workspace'&&
    Array.isArray(workspace.positions)&&workspace.positions.length===0)return;
 provider(type).model.validate(workspace);
}
function native(p){return !!p&&p.v07===7&&types.includes(p.type);}
function effective(p){return provider(p.type).model.effective(p.options||{});}
// Physical supports keep their full section. Only the front-mounted ZIP overlap
// is apportioned between coplanar openings sharing the same support.
function frontMountExtensions(zone){
 const values=zone.frontMountBoundaryExtensions||{};
 const read=(id,width)=>Math.max(0,Number(values[id]??width)||0);
 const left=read(zone.leftBoundaryId??zone.startBoundaryId,zone.leftBoundaryWidth??zone.startBoundaryWidth),
   right=read(zone.rightBoundaryId??zone.endBoundaryId,zone.rightBoundaryWidth??zone.endBoundaryWidth);
 return zone.frontMountDirection<0?{left:right,right:left}:{left,right};
}
function fit(zone,p){const c=effective(p),front=p.type==='zip'&&c.placementLocation==='FRONT OF POSTS',gap=p.type==='zip'?3:5;
const {left,right}=frontMountExtensions(zone);
const availableWidth=front?Number(zone.width)+left+right:Number(zone.width)-gap,availableHeight=front?Number(zone.height)+150:Number(zone.height)-gap;
const width=p.productWidth==null?availableWidth:Number(p.productWidth),height=p.productHeight==null?availableHeight:Number(p.productHeight);
if(!(width>0&&height>0&&width<=availableWidth+.001&&height<=availableHeight+.001))throw Error('Ürün ölçüsü montaj alanını aşamaz.');
const cx=Number(zone.cx)||0,cz=Number(zone.cz)||0,bottom=Number(zone.bottomY)||0,offset=front?(right-left)/2:0;
return {...zone,width,height,cx:cx+(zone.axis==='x'?offset:0),cz:cz+(zone.axis==='z'?offset:0),bottomY:bottom+(front?0:gap/2)+(availableHeight-height)/2,topY:bottom+(front?0:gap/2)+(availableHeight-height)/2+height,availableWidth,availableHeight};}
function resolve(zone,p){const a=provider(p.type),f=fit(zone,p),w=a.model.initial(),pos={...a.model.position(p.positionCode||a.descriptor.reference.prefix+'-01'),id:p.id||zone.id,width:f.width,height:f.height,overrides:clone(p.options||{}),quantity:p.quantity||1,open:false,progress:0};w.positions=[pos];const q=a.model.resolve(w,pos);if(a.nativeV70&&p.colorSource==='bio'&&p.bioProfileColor&&p.bioProfileColor.toLowerCase()!=='#ff00ff')q.nativeItem={...q.nativeItem,systemColor:{hex:p.bioProfileColor,code:'Bio',kind:'ral',finish:'MATTE',schematic:false}};return {...q,...(p.colorSource==='bio'&&p.bioProfileColor&&p.bioProfileColor.toLowerCase()!=='#ff00ff'?{color:p.bioProfileColor,colorMode:'ral'}:{}),id:pos.id,positionNo:pos.positionNo,quantity:pos.quantity};}
function sanitize(p){const a=provider(p.type),out={type:p.type,v07:7,options:{...a.model.common()},productWidth:p.productWidth??null,productHeight:p.productHeight??null};for(const k of a.model.optionKeys)if(Object.prototype.hasOwnProperty.call(p.options||{},k))out.options[k]=clone(p.options[k]);for(const k of ['positionCode','fitRevision','quantity','id','colorSource','bioProfileColor'])if(p[k]!==undefined)out[k]=clone(p[k]);return out;}
function make(type,opts={}){return sanitize({type,v07:7,options:{...provider(type).model.common(),...opts}});}
/** Display policy shared by scene documents: keep only outside W/H dimensions. */
function outerDimensions(document,width,height,visible=true){
 const near=(a,b)=>Math.abs(a-b)<0.01;
 return {...document,entities:document.entities.filter(entity=>{
  if(entity.type!=='dimension')return true;
  if(!visible||!entity.p1||!entity.p2)return false;
  const dx=Math.abs(entity.p2.x-entity.p1.x),dy=Math.abs(entity.p2.y-entity.p1.y);
  return (near(dy,0)&&near(dx,width))||(near(dx,0)&&near(dy,height));
 })};
}
/** Convert only presentation options; the saved physical side must survive an outside detail. */
function outsidePlacement(original){
 const p=clone(original),o=p.options||{},swap=v=>({LEFT:'RIGHT',RIGHT:'LEFT',Sol:'Sağ',Sağ:'Sol'})[v]||v;
 if(['folding','balcony'].includes(p.type)&&o.foldingView==='INSIDE VIEW')o.openingDirection=swap(o.openingDirection);
 if(p.type==='sliding'&&o.slidingView==='INSIDE VIEW'&&o.openingType!=='CENTER OPENING')o.openingDirection=swap(o.openingDirection);
 if(p.type==='guillotine'&&['İç','INSIDE VIEW'].includes(o.defaultView))o.defaultMotorDirection=swap(o.defaultMotorDirection);
 p.options={...o,defaultView:'OUTSIDE VIEW',slidingView:'OUTSIDE VIEW',foldingView:'OUTSIDE VIEW',view:'OUTSIDE'};
 return p;
}
function drawing(zone,p,units,options={}){
 const a=provider(p.type),q=resolve(zone,p),w=a.model.initial(),pos={...a.model.position(q.positionNo),id:q.id,width:q.width,height:q.height,quantity:q.quantity,overrides:p.options||{}};
 w.positions=[pos];w.drawingLayout.dimensionUnits=units||{mm:true,inch:false};
 const document=a.nativeV70?a.document(w):a.scope.PLMRReferenceDocument.build(w,[{position:pos,state:q,engine:{definition:a.scope.PLMRReferenceGeometry.build(q)}}],a.descriptor);
 const visible=true; // 2D dimensions are independent of 3D display filters.
 return options.detailDimensions&&visible?document:outerDimensions(document,q.width,q.height,visible);
}
function details(zone,p){const a=provider(p.type),q=resolve(zone,p),c=p.options||{},out=[{label:'Ürün',value:a.descriptor.label},{label:'Ölçü',value:q.width+' × '+q.height+' mm'}];for(const k of q.selectedOptions||[]){const f=a.descriptor.fields.find(f=>f.key===k);if(f?.internal||c[k]==null)continue;out.push({label:f?.label||({systemColor:'Sistem Rengi',surface:'Yüzey',defaultView:'Bakış'}[k]||k),value:f?.options?.find(o=>o[0]===c[k])?.[1]||String(c[k])});}return out;}
// Annotation facing depends on camera position, product transform and motion.
// Keep this derived state with the engine lifetime; a rebuilt annotation array
// or information visibility change must refresh it even at a stationary camera.
const annotationFrames=new WeakMap();
function refreshAnnotations(engine,camera,informationVisible=true){
 const group=engine.group;
 group.updateWorldMatrix(true,false);
 const annotations=engine.annotationObjects;
 const values=[camera.position.x,camera.position.y,camera.position.z,
  ...group.matrixWorld.elements,engine.motion?.().progress,group.visible,informationVisible];
 const previous=annotationFrames.get(engine);
 if(previous&&previous.annotations===annotations&&
  values.every((value,index)=>value===previous.values[index]))return false;
 engine.updateAnnotations(camera);
 annotationFrames.set(engine,{annotations,values});
 return true;
}
function dimensioned(entry,q){let dims=null,stamp='';const original=entry.updateAnnotations;function clear(){root.PLMRResources.disposeTree(dims);dims=null;}
// Dimensions belong to this adapter, not the approved engine/cache.
const disposeEngine=entry.engine.dispose;
entry.engine.dispose=()=>{clear();disposeEngine();};
entry.updateAnnotations=(camera,informationVisible)=>{original?.(camera,informationVisible);const host=root.parent?.PLMRV25Layout||root.PLMRV25Layout,layout=host?.()||{},units=layout.dimensionUnits||{mm:true},key=JSON.stringify(units),factory=root.PLMRV24Products?.door?.scope?.PLMRDimension3D;if(factory&&key!==stamp){clear();dims=factory.build(q.width,q.height,units);entry.engine.group.add(dims);stamp=key;}if(dims){const dimensions=(root.parent?.PLMRV11Commands||root.PLMRV11Commands)?.dimensions?.()||{};dims.visible=layout.showDimensions!==false&&dimensions.facades!==false&&dimensions.facadeByPosition?.[q.id]!==false&&!!(units.mm||units.inch||units.ft);dims.updateCamera?.(camera);entry.root.userData.v28Dimensions={visible:dims.visible,units};}};return entry;}
function build(renderer,zone,p){const a=provider(p.type),f=fit(zone,p),q=resolve(zone,p);if(a.nativeV70){const outside=resolve(zone,outsidePlacement(p));return dimensioned(root.PLMRV70.facade(renderer,zone,p,f,outside),outside);}const engine=a.scope.PLMRReferenceEngine.create(renderer,q),T=root.THREE,mount=new T.Group();
const zip=p.type==='zip',angle=zone.axis==='x'?(zone.inward<0?0:Math.PI):(zone.inward>0?-Math.PI/2:Math.PI/2);mount.rotation.y=angle+(zip?Math.PI:0);mount.add(engine.group);
const parts=engine.definition.parts.filter(p=>p.kind==='profile'),top=Math.max(...parts.flatMap(p=>p.outline.map(v=>v[1]))),upper=parts.filter(p=>Math.max(...p.outline.map(v=>v[1]))>=top-.01&&Math.max(...p.outline.map(v=>v[0]))-Math.min(...p.outline.map(v=>v[0]))>q.width*.45),ref=upper.length?upper:parts;
const frontMount=zip&&(q.placementLocation==='FRONT OF POSTS'||p.autoFrontOnly),face=(zip&&!frontMount?Math.min(...ref.map(p=>p.z)):Math.max(...ref.map(p=>p.z+p.depth)))+engine.group.children[0].position.z,local=new T.Vector3(0,0,face).applyAxisAngle(new T.Vector3(0,1,0),mount.rotation.y);
mount.position.set(f.cx+(zone.axis==='z'?Number(zone.outerFaceV)||0:0)-local.x,f.bottomY,f.cz+(zone.axis==='x'?Number(zone.outerFaceV)||0:0)-local.z);
mount.userData={v24Native:true,zoneId:zone.id,productType:p.type,fit:f,exteriorLocalZ:face};
engine.group.traverse(o=>{o.userData={...o.userData,zoneId:zone.id,productKey:zip?'zip:'+zone.id:zone.id};if(o.userData.annotation){o.userData.presentationAnnotation=true;if(o.userData.annotationRole==='position'||o.userData.role==='position')o.userData.positionLabel=true;}if(o.isMesh&&o.userData.isProduct){if(renderer.outputEncoding!==T.sRGBEncoding){const mat=o.material;mat.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <encodings_fragment>','gl_FragColor = LinearTosRGB(gl_FragColor);');};mat.customProgramCacheKey=()=>"V24_NATIVE_SRGB_FACE";}o.userData.name=o.name;o.userData.v24Native=true;}});
return dimensioned({root:mount,engine,config:q,update:t=>engine.seek(t),updateAnnotations:(camera,informationVisible)=>refreshAnnotations(engine,camera,informationVisible)},q);}
root.PLMRV24Native=Object.freeze({types,native,provider,label,readiness,announceV70Readiness,reportV70Failure,validateStoredWorkspace,effective,frontMountExtensions,fit,resolve,sanitize,make,drawing,outsidePlacement,outerDimensions,details,build,refreshAnnotations});
})(typeof window!=='undefined'?window:globalThis);
