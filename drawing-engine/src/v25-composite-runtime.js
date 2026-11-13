/* One scene/renderer and one engineering layout for Bioclimatic + all side products. */
(function(root){'use strict';root.PLMRV25Composite=function(E){const T=root.THREE,N=root.PLMRV24Native,L=root.PLMRV24Libraries,P=root.PLMRProjectLayout,clone=x=>JSON.parse(JSON.stringify(x)),host=()=>parent.PLMRV24Host;const group=new T.Group();group.name='PLMR mixed positions';E.scene.add(group);const renderer2d=L.createPLMRReference2DPreview(),preview=root.PLMRV5SheetViewport.create(renderer2d),drawing=document.createElement('div');drawing.id='v25Drawing';drawing.style.cssText='position:absolute;inset:0;background:white;z-index:2';drawing.hidden=true;document.body.append(drawing);const modeStyle=document.createElement('style');modeStyle.textContent='body.plmr-2d-mode [data-position-code],body.plmr-2d-mode .rr-dimension-overlay{display:none!important}';document.head.append(modeStyle);
const stopLocale=parent.PLMRI18n?.subscribe(()=>{root.PLMRDrawingText.refresh(E.scene);root.__PLMR_ANIMATION_VIEWER__?.repaint();invalidateDocument();if(mode==='2D')render2d();});root.addEventListener('pagehide',()=>stopLocale?.(),{once:true});
let entries=[],selected=new Set(),mode='3D',doc=null,layout={columns:2,dimensionUnits:{mm:true,inch:false},showDimensions:true},frames=0,lastSignature='',activeType=null,bioKey='';
const hasBio=()=>E.roots().some(roof=>roof.width>0&&roof.height>0),allWork=()=>host()?.getState().sceneEditor?.nativeWorkspaces||{};
function bioStamp(){return E.roots().map(o=>[o.id,o.group.uuid,o.group.children.length,o.group.children[0]?.uuid,o.group.children.at(-1)?.uuid,o.width,o.height,o.depth,JSON.stringify(o.pose||{})].join(':')).join('|');}
function bioBounds(){const b=new T.Box3();if(hasBio())for(const r of E.roots())r.group.traverse(o=>{if(!o.isMesh)return;for(let p=o;p;p=p.parent){const d=p.userData||{};if(!p.visible||d.isDimension||d.dimension||d.annotation||d.presentationAnnotation||d.positionLabel||d.flatTextLabel||d.movementIndicator||d.isZone||d.isRoofZone||d.v24Highlight)return;}o.updateWorldMatrix(true,false);if(o.isInstancedMesh){o.geometry.computeBoundingBox();const m=new T.Matrix4();for(let i=0;i<o.count;i++){o.getMatrixAt(i,m);b.union(o.geometry.boundingBox.clone().applyMatrix4(m).applyMatrix4(o.matrixWorld));}}else b.union(new T.Box3().setFromObject(o));});return b;}
function bounds(){const b=bioBounds();for(const e of entries)b.union(new T.Box3().setFromObject(e.group));return b;}
function fit(){if(mode==='2D'){preview.fit();return;}const b=bounds();if(b.isEmpty())return;const c=b.getCenter(new T.Vector3()),s=b.getSize(new T.Vector3()),f=T.MathUtils.degToRad(E.camera.fov),dist=Math.max(s.x,s.y,s.z)/(2*Math.tan(Math.min(f,2*Math.atan(Math.tan(f/2)*E.camera.aspect))/2))*1.45,d=E.camera.position.clone().sub(E.controls.target).normalize();if(!d.length())d.set(.9,.5,1.2).normalize();E.controls.target.copy(c);E.camera.position.copy(c).addScaledVector(d,dist);E.controls.update();}
// The band follows physical roof frame height, independent of moving lamellae,
// annotation visibility and the frame at which a presentation is opened.
function physicalRoofTop(fallback){
 const tops=E.roots().filter(r=>r.height>0).map(r=>{
  r.group.updateWorldMatrix(true,false);
  return r.group.localToWorld(new T.Vector3(0,r.height/2,0)).y;
 });
 return tops.length?Math.max(...tops):fallback;
}
function arrange(){const ws=allWork(),bs=bioBounds(),present=!bs.isEmpty(),lift=root.PLMRV27Scene?.lift()||0,center=present?bs.getCenter(new T.Vector3()):new T.Vector3(),ordered=P.projectPositions(ws,layout.positionOrder),map=new Map(entries.map(e=>[e.key,e]));const cells=ordered.filter(x=>map.has(x.key)).map(x=>{const e=map.get(x.key);return{key:e.key,width:e.state.width+1500,height:e.state.height+1200};}),grid=P.layoutProjectCells(cells,layout.columns,260,260),anchor=present?{x:bs.max.x+500,y:physicalRoofTop(bs.max.y)-lift-250}:{x:-grid.width/2,y:grid.height/2};for(const cell of grid.cells){const e=map.get(cell.key);e.group.position.set(anchor.x+cell.x+750+e.state.width/2,anchor.y-cell.top-e.state.height,present?center.z:0);e.group.userData.projectLayout={key:e.key,row:cell.row,column:cell.column};}group.updateMatrixWorld(true);group.userData.projectLayout={...grid,cells:[...(present?[{key:'BIO',x:bs.min.x,top:bs.max.y,width:bs.max.x-bs.min.x,height:bs.max.y-bs.min.y,row:0,column:-1}]:[]),...grid.cells]};}
function refreshSelection(){for(const e of entries)e.highlight.visible=selected.has(e.key);preview.setSelectedIds([...selected,...(parent.PLMRV24Workspace?.inspect().mixedSelection?.some(i=>i.kind==='system')?['BIO']:[])]);}
function choose(key,event={}){const append=Boolean(event.ctrlKey||event.metaKey);if(append){selected.has(key)?selected.delete(key):selected.add(key);}else selected=new Set(key?[key]:[]);refreshSelection();const e=entries.find(e=>e.key===key);if(e)parent.PLMRV24Workspace.nativeSelection([...selected],append,e.type);else if(key==='BIO'){selected.clear();refreshSelection();parent.PLMRV24Workspace.acceptBio([{kind:'system',owner:'roof-main',key:'system:roof-main'}],append);}else if(!key)parent.PLMRV24Workspace.nativeSelection([],false,null);}
function commonMotion(items=[],command){const all=!items.length,roofs=all?E.roots().map(r=>({kind:'system',owner:r.id})):items.filter(i=>i.kind==='roof'||i.kind==='system'),ms=[...E.motions.values()].filter(m=>m.type!=='fixed'&&(all||items.some(i=>i.kind==='native'?m.v25Standalone&&'native:'+i.key===m.key:i.kind==='system'?false:i.kind==='facade'?m.owner===i.owner&&[i.productKey,i.zoneId,i.slot==='zip'?'zip:'+i.zoneId:i.zoneId].includes(m.key):false)));
if(command){const t=command.seek;for(const m of ms){m.preview=null;if(t!==undefined){m.v24Paused=true;m.progress=Math.max(0,Math.min(1,t));for(const bind of m.bindings||[])bind(m.progress);}else{m.v24Paused=false;m.target=command.target?1:0;}}if(t!==undefined)E.roof.seekSelection(roofs,t);else E.roof.targetSelection(roofs,command.target);}
const movable=ms.length>0||E.roof.selectionMovable(roofs),progress=E.roof.selectionMovable(roofs)?E.roof.selectionProgress(roofs):ms[0]?.progress??0;return {movable,progress,targets:ms.map(m=>m.id),roofTargets:roofs};}

function invalidateDocument(){doc=null;}
function currentDocument(){if(!doc)doc=documentAll();return doc;}
function render2d(){currentDocument();if(!doc){drawing.innerHTML='';return;}preview.render(drawing,doc,{showDimensions:true,onSelect:choose,onClearSelection:()=>choose(null),selectedIds:[...selected]});}
function primitiveBounds(es){const b={minX:Infinity,minY:Infinity,maxX:-Infinity,maxY:-Infinity};function point(x,y){if(Number.isFinite(x)&&Number.isFinite(y)){b.minX=Math.min(b.minX,x);b.maxX=Math.max(b.maxX,x);b.minY=Math.min(b.minY,y);b.maxY=Math.max(b.maxY,y);}}for(const e of es){for(const k of [['x','y'],['x1','y1'],['x2','y2']])point(e[k[0]],e[k[1]]);for(const p of e.points||[])point(...p);for(const p of [e.p1,e.p2,e.dimLine])if(p)point(p.x,p.y);if(e.type==='arc'){point(e.x-e.radius,e.y-e.radius);point(e.x+e.radius,e.y+e.radius);}}return b;}
function documentAll(forDxf=false){const workspaces=allWork(),parts=[],styles={},blocks={},units=forDxf||!layout.dimensionUnits.mm&&!layout.dimensionUnits.inch&&!layout.dimensionUnits.ft?{mm:true,inch:false}:layout.dimensionUnits;let info={};if(hasBio()){const bio=parent.__P3DV_DOCUMENT_BRIDGE__.technical2DDrawingForTest(forDxf);if(bio){const es=bio.entities.filter(e=>!['Antetler','Dış Çerçeve','PLMR'].includes(e.layer));if(es.length){const b=primitiveBounds(es);parts.push({key:'BIO',es,b,sheetTargets:bio.sheetTargets||[]});Object.assign(styles,bio.layerStyle);info=bio.titleBlock?.data||{};}}}
const byKey=new Map(entries.map(e=>[e.key,e]));for(const row of P.projectPositions(workspaces,layout.positionOrder)){const e=byKey.get(row.key);if(!e)continue;const w=workspaces[e.type],a=N.provider(e.type),one=clone(w);one.positions=[e.position];one.drawingLayout={...one.drawingLayout,...layout,dimensionUnits:units,showDimensions:true};let d;if(a.nativeV70)d=a.document(one);else d=a.scope.PLMRReferenceDocument.build(one,[{position:e.position,state:e.state,engine:e.engine}],a.descriptor);d=N.outerDimensions(d,e.state.width,e.state.height,true);const pos=d.positions[0],es=d.entities.filter(x=>String(x.positionId)===String(pos.id));parts.push({key:e.key,es,b:pos.cellBounds});Object.assign(styles,d.layerStyle);Object.assign(blocks,d.blocks);}
if(!parts.length)return null;const first=workspaces[entries[0]?.type],projectInfo={...first?.projectInfo};if(info.projectRows)for(const[k,v]of info.projectRows){const key={'PROJE KODU':'projectCode','MÜŞTERİ':'customerName','ÜLKE':'country','PROJE ADI':'projectName','REVİZYON':'revision','TARİH':'date','AÇIKLAMA':'description'}[k];if(key)projectInfo[key]=v;}Object.assign(projectInfo,parent.PLMRFinalMetadata?.projectInfo||{});projectInfo.date=parent.PLMRProjectDate.displayProjectDate(projectInfo.date||projectInfo.createdAt||'');const titleProject={projectInfo,commonSettings:{color:'Varsayılan',generalDescription:projectInfo.description||''}},D=L.PLMRV53Document,titleApi=parent.PLMRV53TitleBlock||{layout:D.titleBlockLayout,build:D.buildTitleBlock},t=titleApi.layout(titleProject),grid=P.layoutProjectCells(parts.map(p=>({key:p.key,width:p.b.maxX-p.b.minX,height:p.b.maxY-p.b.minY})),layout.columns,520,460),H=Math.max(7320,grid.height+820,t.requiredInnerHeight+120),W=3160+420+grid.width+700,title=titleApi.build(titleProject,H,t),entities=[D.rect(60,60,W-120,H-120,D.LAYERS.outer),...title.entities],positions=[],sheetTargets=[];
for(let i=0;i<parts.length;i++){const p=parts[i],cell=grid.cells[i],dx=3580+350+cell.x-p.b.minX,dy=H-410-cell.top-p.b.maxY;for(const source of p.es){const e=root.PLMRV24Details2D.translate(source,dx,dy);e.positionId=p.key;entities.push(e);}for(const t of p.sheetTargets||[])sheetTargets.push({...t,...(t.axisOrigin?{axisOrigin:{x:t.axisOrigin.x+dx,y:t.axisOrigin.y+dy}}:{}),bounds:{minX:t.bounds.minX+dx,maxX:t.bounds.maxX+dx,minY:t.bounds.minY+dy,maxY:t.bounds.maxY+dy}});if(p.key!=='BIO')sheetTargets.push({id:p.key,kind:'standalone',title:p.key,bounds:{minX:p.b.minX+dx,maxX:p.b.maxX+dx,minY:p.b.minY+dy,maxY:p.b.maxY+dy}});positions.push({id:p.key,positionNo:p.key,width:p.b.maxX-p.b.minX,height:p.b.maxY-p.b.minY,cellBounds:{minX:p.b.minX+dx,maxX:p.b.maxX+dx,minY:p.b.minY+dy,maxY:p.b.maxY+dy},productBounds:{minX:p.b.minX+dx,maxX:p.b.maxX+dx,minY:p.b.minY+dy,maxY:p.b.maxY+dy},origin:{x:dx,y:dy}});}
for(const name of ['OLCULENDIRME_MM','OLCULENDIRME_INCH','OLCULENDIRME_MM_INCH','OLCULENDIRME_FT'])styles[name]={aci:1,stroke:'#dc2626',width:.25};Object.assign(blocks,{'PLMR - LOGO':D.buildLogoBlock()});for(const e of entities)if(!styles[e.layer])styles[e.layer]={aci:7,stroke:'#111111',width:.25};const b={minX:0,minY:0,maxX:W,maxY:H,width:W,height:H};const output={schema:'plmr-mixed-v25',units:'mm',modelScale:1,entities,positions,layers:Object.keys(styles),layerStyle:styles,blocks,titleBlock:title,bounds:b,previewBounds:b,outerFrame:{x:60,y:60,width:W-120,height:H-120},sheetTargets,metadata:{source:'V5 assembly sheet + approved product primitives',dxfProfile:'V53_R2018',dimStyle:units.mm&&units.inch?'PLMR_DIM_MM_INCH':units.inch?'PLMR_DIM_INCH':'PLMR_DIM_MM',dimensionUnits:units}};parent.PLMRCompanyDrawingLogo?.applyCompanyDrawingLogo(output,parent.PLMRFinalMetadata?.projectInfo?.drawingLogo);return root.PLMRDrawingText.document(output);}
function releaseEntry(entry){
 entry.engine.dispose();
 root.PLMRResources.disposeTree(entry.dimensions);
 root.PLMRResources.disposeTree(entry.highlight);
 entry.group.parent?.remove(entry.group);
 if(E.motions.get(entry.motion.id)===entry.motion)E.motions.delete(entry.motion.id);
}
function createEntry(type,position,state,signature,prior){
 const provider=N.provider(type),engine=provider.nativeV70?root.PLMRV70.engine(state):provider.scope.PLMRReferenceEngine.create(E.renderer,state);
 const item=new T.Group(),key=type+':'+position.id,id='roof-main|native:'+key;
 item.userData.plmrDaeGroup={key,name:type+" "+(position.positionNo||position.id)};
 item.add(engine.group);
 engine.group.traverse(object=>{object.userData.v25Position=key;if(object.userData.annotation)object.userData.presentationAnnotation=true;});
 const dimensions=root.PLMRDimensionStyle.buildFacade(state.width,state.height,layout.dimensionUnits);
 item.add(dimensions);
 const highlight=new T.Box3Helper(new T.Box3(new T.Vector3(-state.width/2,-8,-100),new T.Vector3(state.width/2,state.height+8,100)),0x148ab5);
 highlight.userData.v24Highlight=true;item.add(highlight);group.add(item);
 const motion={...(prior||{}),id,key:'native:'+key,owner:'roof-main',type,progress:prior?.progress??0,target:prior?.target??0,v24Paused:prior?.v24Paused??true,bindings:[value=>engine.seek(value)],ease:value=>value,seen:true,v25Standalone:true};
 E.motions.set(id,motion);engine.seek(motion.progress);
 return {key,type,position,state,engine,group:item,highlight,dimensions,motion,signature,dimensionUnitsKey:JSON.stringify(layout.dimensionUnits)};
}
function loadAll(ws=allWork(),newLayout={},reset=false){
 layout={...layout,...newLayout};
 const signature=JSON.stringify(ws),changed=signature!==lastSignature,previous=new Map(entries.map(entry=>[entry.key,entry]));
 if(changed){
  const next=[];
  for(const [type,work]of Object.entries(ws))for(const position of work.positions){
   const provider=N.provider(type),state={...provider.model.resolve(work,position),id:position.id,positionNo:position.positionNo,quantity:Number(position.quantity)};
   const key=type+':'+position.id,stamp=JSON.stringify(state),old=previous.get(key);previous.delete(key);
   if(old?.signature===stamp){old.position=position;next.push(old);continue;}
   const motion=old?{...old.motion}:null;if(old)releaseEntry(old);
   next.push(createEntry(type,position,state,stamp,motion));
  }
  for(const old of previous.values())releaseEntry(old);
  entries=next;lastSignature=signature;
  selected=new Set([...selected].filter(key=>entries.some(entry=>entry.key===key)));
 }
 const unitsKey=JSON.stringify(layout.dimensionUnits),filters=parent.PLMRV11Commands.dimensions();
 for(const entry of entries){
  if(entry.dimensionUnitsKey!==unitsKey){root.PLMRResources.disposeTree(entry.dimensions);entry.dimensions=root.PLMRDimensionStyle.buildFacade(entry.state.width,entry.state.height,layout.dimensionUnits);entry.group.add(entry.dimensions);entry.dimensionUnitsKey=unitsKey;}
  entry.dimensions.visible=layout.showDimensions&&filters.facades!==false&&filters.facadeByPosition?.[entry.position.id]!==false;
 }
 arrange();bioKey=bioStamp();invalidateDocument();if(mode==='2D')render2d();refreshSelection();if(reset)fit();
}
function tick(){
 frames++;
 const stamp=bioStamp();
 if(stamp!==bioKey){
  bioKey=stamp;arrange();invalidateDocument();
  if(mode==='2D')render2d();

 }
 // Read the shared, current visibility snapshot once for this frame. The host
 // returns a clone, so reading it twice for every position repeats the same work.
 const filters=entries.length?parent.PLMRV11Commands.dimensions():null;
 for(const e of entries){
  N.refreshAnnotations(e.engine,E.camera);
  e.dimensions.updateCamera?.(E.camera);
  e.dimensions.visible=layout.showDimensions&&filters.facades!==false&&filters.facadeByPosition?.[e.position.id]!==false;
 }
 root.PLMRV25Cube?.update();root.PLMRV27Scene?.tick();
}
function targets(){return entries.filter(e=>selected.has(e.key));}
function seek(t){for(const e of targets())if(e.type!=='fixed'){e.motion.preview=null;e.motion.v24Paused=true;e.motion.progress=t;e.engine.seek(t);}}
function target(open){for(const e of targets())if(e.type!=='fixed'){e.motion.preview=null;e.motion.v24Paused=false;e.motion.target=open?1:0;}}
function setMode(m){if(m===mode)return;if(m==='2D')root.dispatchEvent(new Event('plmr-view-2d'));mode=m;document.body.classList.toggle('plmr-2d-mode',m==='2D');drawing.hidden=m!=='2D';E.renderer.domElement.style.visibility=m==='2D'?'hidden':'';if(root.PLMRV25Cube)root.PLMRV25Cube.element.hidden=m==='2D';if(m==='2D')render2d();}
let down;E.renderer.domElement.addEventListener('pointerdown',e=>down={x:e.clientX,y:e.clientY,id:e.pointerId,button:e.button},true);E.renderer.domElement.addEventListener('pointerup',ev=>{const start=down;down=null;if(window.parent.PLMRFinalReadOnly?.())return;if(ev.button||!start||start.button!==0||start.id!==ev.pointerId||Math.hypot(ev.clientX-start.x,ev.clientY-start.y)>5)return;const ray=new T.Raycaster(),b=E.renderer.domElement.getBoundingClientRect();ray.setFromCamera(new T.Vector2((ev.clientX-b.x)/b.width*2-1,-(ev.clientY-b.y)/b.height*2+1),E.camera);const physical=[];E.scene.traverse(o=>{if(!o.isMesh)return;for(let p=o;p;p=p.parent){const d=p.userData||{};if(!p.visible||d.isZone||d.isRoofZone||d.isDimension||d.annotation||d.presentationAnnotation||d.movementIndicator||d.v24Highlight)return;}physical.push(o);});const hit=ray.intersectObjects(physical,false)[0];if(hit?.object.userData.v25Position){ev.__plmrNativeHandled=true;choose(hit.object.userData.v25Position,ev);}},true);
function releasePointer(){down=null;document.dispatchEvent(new PointerEvent('pointerup',{pointerType:'mouse',button:0,bubbles:true}));} E.renderer.domElement.addEventListener('pointercancel',releasePointer);root.addEventListener('blur',releasePointer);
E.controls.screenSpacePanning=true;E.controls.enableDamping=true;E.controls.dampingFactor=.08;E.controls.mouseButtons={LEFT:T.MOUSE.ROTATE,MIDDLE:T.MOUSE.DOLLY,RIGHT:T.MOUSE.PAN};
const validateSingle=L.PLMRV53Document.validateDocument;L.PLMRV53Document.validateDocument=function(d){if(d?.schema!=='plmr-mixed-v25')return validateSingle(d);const errors=[],ids=new Set();if(d.units!=='mm'||!d.positions?.length)errors.push('document');for(const p of d.positions||[]){if(ids.has(p.id)||!(p.width>0&&p.height>0)||![p.origin.x,p.origin.y].every(Number.isFinite))errors.push('position');ids.add(p.id);}for(const e of d.entities||[]){const nums=['x','y','x1','y1','x2','y2','radius','height','width'].filter(k=>e[k]!=null).map(k=>e[k]);for(const p of e.points||[])nums.push(...p);for(const p of [e.p1,e.p2,e.dimLine])if(p)nums.push(p.x,p.y);if(!nums.every(Number.isFinite))errors.push('non-finite primitive');if(e.positionId&&!ids.has(e.positionId))errors.push('position reference');if(e.type==='dimension'&&(!e.p1||!e.p2||!e.dimLine))errors.push('dimension');if(e.type==='arc'&&!(e.radius>0))errors.push('arc');}if(!d.blocks?.['PLMR - LOGO'])errors.push('logo');if(errors.length)throw Error('Birleşik çizim geçersiz: '+[...new Set(errors)].join(', '));return{valid:true,errors:[]};};
function runtimeMotion(){
 const roofs=E.roots().flatMap(r=>(r.spec?.freedomLayout?.modules||[{moduleIndex:0}]).map(m=>{const item={kind:'roof',owner:r.id,moduleIndex:m.moduleIndex};return {...item,progress:E.roof.selectionProgress([item])};}));
 return {facades:[...E.motions.values()].map(m=>({id:m.id,progress:m.progress})),roofs};
}
function restoreMotion(value){
 const saved=new Map((value?.facades||[]).map(v=>[v.id,v.progress]));
 for(const m of E.motions.values()){const p=saved.has(m.id)?Number(saved.get(m.id)):Number(m.target??m.progress??0);if(!Number.isFinite(p))continue;m.preview=null;m.v24Paused=true;m.progress=m.target=Math.max(0,Math.min(1,p));for(const bind of m.bindings||[])bind((m.ease||((v)=>v))(m.progress));}
 for(const r of E.roots())for(const mod of r.spec?.freedomLayout?.modules||[{moduleIndex:0}]){const item={kind:'roof',owner:r.id,moduleIndex:mod.moduleIndex};if(!E.roof.selectionMovable([item]))continue;const stored=value?.roofs?.find(v=>v.owner===r.id&&v.moduleIndex===mod.moduleIndex),config=root.PLMRBioclimaticRoof.config(r.spec,mod.moduleIndex);const progress=stored?Number(stored.progress):(config.open?1:0);if(Number.isFinite(progress))E.roof.seekSelection([item],Math.max(0,Math.min(1,progress)));}
 return runtimeMotion();
}
const api={refreshDocument:()=>{invalidateDocument();if(mode==='2D')render2d();},runtimeMotion,restoreMotion,refreshSelection,clearBio:E.clearBio,commonMotion,clearNativeSelection:()=>{selected.clear();refreshSelection();},syncBio:()=>{arrange();bioKey=bioStamp();invalidateDocument();if(mode==='2D')render2d();},loadAll,load:(type,w,reset)=>{activeType=type;loadAll(allWork(),{...w.drawingLayout,...parent.PLMRV25Layout?.()},reset);},setActive:()=>{},setMode,fit,choose:id=>{selected=new Set(id?[activeType+':'+id]:[]);refreshSelection();},selectKey:choose,seek,target,progress:()=>targets().find(e=>e.type!=='fixed')?.motion.progress??null,preview:()=>{for(const e of targets()){e.motion.v24Paused=false;e.motion.preview={restore:e.motion.target,stage:'out'};e.motion.target=e.motion.target?0:1;}},outputs:E.outputs,svg:()=>currentDocument()?root.PLMRV5SheetViewport.svg(renderer2d,doc,{showDimensions:true}):'',dxf:()=>{const output=documentAll(true);if(!output)throw Error('Önce poz ekleyin.');return parent.__P3DV_DOCUMENT_BRIDGE__.exportDrawingDxf(output);},document:currentDocument,tick,bounds,zoom:factor=>{if(mode==='2D')preview.zoom(factor);else{E.camera.position.sub(E.controls.target).multiplyScalar(factor).add(E.controls.target);E.controls.update();}},viewport2d:preview.inspect,restoreViewport2d:preview.restore,cameraSnapshot:()=>({position:E.camera.position.toArray(),target:E.controls.target.toArray(),up:E.camera.up.toArray(),zoom:E.camera.zoom,fov:E.camera.fov}),screenPoints:()=>{E.scene.updateMatrixWorld(true);return entries.flatMap(e=>e.engine.interactiveObjects.map(m=>{const p=new T.Box3().setFromObject(m).getCenter(new T.Vector3()).project(E.camera);return{id:e.position.id,key:e.key,type:e.type,name:m.name,x:(p.x+1)*innerWidth/2,y:(1-p.y)*innerHeight/2};}));},inspect:()=>({type:activeType,mode,frames,renderCalls:E.renderer.info.render.calls,webgl:!!E.renderer.getContext(),rendererCount:document.querySelectorAll('canvas').length,layout:group.userData.projectLayout,bioBounds:(()=>{const b=bioBounds();return b.isEmpty()?null:{min:b.min.toArray(),max:b.max.toArray()};})(),entries:entries.map(e=>({id:e.position.id,key:e.key,type:e.type,renderObjectId:e.group.uuid,...e.engine.snapshot(),dimensionsVisible:e.dimensions.visible,dimensionLabels:(()=>{const a=[];e.dimensions.traverse(o=>{if(o.userData.flatTextLabel)a.push(typeof o.userData.flatTextLabel==='object'?o.userData.flatTextLabel.text:o.userData.text);});return a;})(),physicalBounds:(()=>{e.group.updateWorldMatrix(true,true);const b=new T.Box3();for(const o of e.engine.interactiveObjects)if(!o.userData.annotation&&!o.userData.movementIndicator)b.union(new T.Box3().setFromObject(o));return {min:b.min.toArray(),max:b.max.toArray()};})()})),selected:[...selected]})};root.PLMRV27Scene?.attach({...E,bounds,nativeGroup:group,ground:()=>{const ground=Number(host()?.getState().sceneEditor?.groundY)||0;return Math.min(ground,...E.roots().map(o=>ground+Number(o.pose?.y||0)),...entries.map(e=>e.group.position.y));}});return api;};})(window);
