/* Actual V70 adapters and React dialogs, with the host as sole commit owner. */
(function(root){
'use strict';
const N=root.PLMRV24Native;
function registerProducts(){
 if(N.readiness('sliding').state==='failed')return;
 const L=root.PLMRV70Modules,load=n=>L.load('./'+n),R=root.React,clone=x=>JSON.parse(JSON.stringify(x));
 if(L?.contract!==3)throw Error('V70 modül paketi uyumsuz veya eksik: v70/modules.js (sözleşme 3 gerekli).');
 for(const key of ['React','ReactDOM','PLMRGiyotinState','PLMRSurmeState','PLMRGiyotin3DEngine','PLMRSurme3DEngine',
  'PLMRV53FacadeAdapter','PLMRGiyotin2DDocument','PLMRSurme2DDocument','PLMRProjectLayout']){
  if(!root[key])throw Error('V70 bağımlılığı eksik: '+key);
 }
 const {hasSlidingOpeningLayout}=load('domain/slidingPanelCount');
const G=load('components/GiyotinWorkspaceFields'),S=load('components/SurmeWorkspaceFields'),D=load('domain/drawing'),SL=load('domain/sliding'),VG=load('domain/giyotinValidation'),A=load('engines/giyotinAdapter'),B=load('engines/surmeAdapter'),PG=load('engines/projectGeometry');
const names={guillotine:'Giyotin',sliding:'Sürme'},types=Object.keys(names),layout=()=>({columns:2,previewMode:'3D',dimensionUnits:{mm:true,inch:false},showDimensions:true,openState:'CLOSED'});
function initial(type){return{schema:'plmr-v70-workspace',settings:clone(type==='guillotine'?D.DEFAULT_GUILLOTINE_SETTINGS:SL.DEFAULT_SLIDING_SETTINGS),positions:[],projectInfo:{},drawingLayout:layout()};}
function position(no='P01'){return {id:crypto.randomUUID(),positionNo:no,width:'',height:'',quantity:'1',description:'',view:'Diğer',motorDirection:'Diğer',overrides:{},open:false};}
function validate(type,w){const q=clone(w),seen=new Set();for(const p of q.positions){if(!p.id||seen.has(p.id))throw Error('Poz kimliği geçersiz.');seen.add(p.id);if(!(Number(p.width)>0&&Number(p.height)>0))throw Error('Genişlik ve yükseklik zorunludur.');if(type==='guillotine'&&(Number(p.width)>5000||Number(p.height)>5000))throw Error('Giyotin ölçüsü en fazla 5000 mm olabilir.');if(!Number.isInteger(Number(p.quantity))||Number(p.quantity)<1)throw Error('Adet pozitif tam sayı olmalıdır.');if(type==='sliding'&&!hasSlidingOpeningLayout(p.overrides.openingType??q.settings.openingType))throw Error('Açılım düzenini kenardan veya merkezden olarak seçin.');if(type==='guillotine'){const e=VG.validateGiyotinSettings({...q.settings,...p.overrides});if(e)throw Error(e);}}if(type==='sliding'&&q.positions.length){const result=root.PLMRSurmeState.validateProject(input(type,q));if(!result.valid)throw Error(result.errors[0].message);}return q;}
function input(type,w){const info={projectCode:'',projectName:'',revision:'R01',outputUnit:'mm',...w.projectInfo},f=type==='guillotine'?A.buildGiyotinEngineInput:B.buildSurmeEngineInput;return f({projectInfo:info,settings:w.settings,positions:w.positions.map(p=>({...p,width:String(p.width),height:String(p.height),quantity:String(p.quantity||1)})),drawingLayout:w.drawingLayout,customerName:info.customerName||'',customerContact:info.customerRepresentative||''});}
function item(type,w){const p=input(type,w);return (type==='guillotine'?PG.giyotinItems(p,0):PG.surmeItems(p,0))[0];}
function documentFor(type,w){const p=input(type,w);return (type==='guillotine'?root.PLMRGiyotin2DDocument:root.PLMRSurme2DDocument).buildDocument(p,{columns:w.drawingLayout.columns,dimensionUnits:w.drawingLayout.dimensionUnits});}
function createForms(type,initialWork,onCommit,options={}){
 function publishOpening(value){
  options.onRequiredChoice?.(type==='sliding'&&!hasSlidingOpeningLayout(value)
   ?'Açılım düzenini kenardan veya merkezden olarak seçin.':'');
 }
 publishOpening(initialWork.settings.openingType);
 const mount=document.createElement('div');mount.className='v70-modal-root'+(options.inlineTarget?' v26-inline-v70':'');(options.inlineTarget||document.fullscreenElement||document.body).append(mount);const react=root.ReactDOM.createRoot(mount);let controller,disposed=false,current,submittedSize;
function close(){if(disposed)return;disposed=true;react.unmount();mount.remove();}function cancel(){if(options.inlineTarget)options.onCancel?.();else close();}
function Form(){const[w,setW]=R.useState(()=>clone(initialWork)),[mode,setMode]=R.useState(null),[detail,setDetail]=R.useState(null),[error,setError]=R.useState('');current=w;controller={setSize:(width,height)=>setW(prev=>({...prev,positions:prev.positions.map((p,i)=>i?p:{...p,width,height})})),positions:(add,id)=>{setW(prev=>({...prev,positions:add?[...prev.positions,position(nextNo(prev.positions))]:prev.positions}));setDetail(null);setMode('positions');},settings:id=>{setDetail(id||null);setMode('settings');}};
function commit(next){try{
 const candidate=submittedSize?{...next,positions:next.positions.map((p,index)=>index?p:{...p,...submittedSize})}:next;
 const q=validate(type,candidate);onCommit(q);close();return true;}catch(e){setError(e.message);return false;}}
function nextNo(ps){return root.PLMRV24Host.nextPositionCode(type,ps);}
const settings=type==='guillotine'?R.createElement(G.GeneralSettingsModal,{value:w.settings,onChange:v=>setW({...w,settings:v}),onClose:cancel,onSave:()=>commit(w),error}):R.createElement(S.SurmeSettingsModal,{settings:w.settings,onClose:cancel,onSave:v=>commit({...w,settings:v}),closeOnSave:false,requireOpeningLayout:true,onOpeningLayoutChange:publishOpening});
if(mode==='settings')return settings;
if(mode!=='positions')return null;
const props={unit:'mm',positions:w.positions.map(p=>({...p,width:String(p.width),height:String(p.height),quantity:String(p.quantity)})),settings:w.settings,onClose:cancel,onChange:positions=>setW({...w,positions}),maxPositions:options.single?1:Infinity,reservedPositionNos:Object.entries(root.PLMRV24Host?.getState().sceneEditor?.nativeWorkspaces||{}).filter(([t])=>t!==type).flatMap(([,w])=>w.positions.map(p=>p.positionNo)),highlightedId:initialWork.positions[0]?.id,error,errorMessage:error};
if(type==='sliding')return R.createElement(S.SurmePositionEditModal,{...props,nextNo,onSave:ps=>commit({...w,positions:ps})});
return R.createElement(R.Fragment,null,R.createElement(G.PositionEditModal,{...props,nextNo,onAdd:()=>setW({...w,positions:[...w.positions,position(nextNo(w.positions))]}),onSave:()=>commit(w),onOpenDetail:setDetail}),detail&&R.createElement(G.PositionDetailModal,{position:w.positions.find(p=>p.id===detail),settings:w.settings,onClose:()=>setDetail(null),onSave:overrides=>{setW({...w,positions:w.positions.map(p=>p.id===detail?{...p,overrides}:p)});setDetail(null);}}));}
function submitInline(size){
 const save=mount.querySelector('button[data-primary-save="true"]');
 if(!save)throw Error('Ürün ayarları henüz hazır değil.');
 submittedSize=size;
 try{root.ReactDOM.flushSync(()=>save.click());}
 finally{submittedSize=undefined;}
}
root.ReactDOM.flushSync(()=>react.render(R.createElement(Form)));
return {
 positions:(add,id)=>root.ReactDOM.flushSync(()=>controller.positions(add,id)),
 settings:id=>root.ReactDOM.flushSync(()=>controller.settings(id)),
 getState:()=>clone(current),
 setSize:(width,height)=>root.ReactDOM.flushSync(()=>controller.setSize(width,height)),
 submitInline,close
};
}
function engine(q){const a=root.PLMRV53FacadeAdapter.build(q.type,{}, {id:q.id,axis:'x',inward:-1,cx:0,cz:0,outerFaceV:0,bottomY:0,width:q.width,height:q.height},{nativeInput:{...q.nativeItem,showDimensions:false}});let progress=0,target=0;const interactive=[];a.root.traverse(o=>{if(o.isMesh&&o.userData.isProduct)interactive.push(o);if(o.userData.isDimension||o.userData.movementIndicator)o.userData.presentationAnnotation=true;});return {group:a.root,interactiveObjects:interactive,annotationObjects:[],seek:t=>{progress=t;a.update(t);},target:v=>target=v?1:0,motion:()=>({progress,target}),updateAnnotations:()=>{},dispose:()=>root.PLMRResources.disposeTree(a.root),snapshot:()=>({partCount:interactive.length})};}
function facade(renderer,zone,p,f,q){const e=engine(q),T=root.THREE,mount=new T.Group();mount.add(e.group);mount.rotation.y=root.PLMRV53FacadeAdapter.mountAngle(zone);const bs=e.interactiveObjects.filter(o=>!o.userData.movementIndicator).map(o=>new T.Box3().setFromObject(o)),b=bs.reduce((a,b)=>a.union(b),new T.Box3());const face=b.max.z,local=new T.Vector3(0,0,face).applyAxisAngle(new T.Vector3(0,1,0),mount.rotation.y);mount.position.set(f.cx+(zone.axis==='z'?Number(zone.outerFaceV)||0:0)-local.x,f.bottomY,f.cz+(zone.axis==='x'?Number(zone.outerFaceV)||0:0)-local.z);mount.userData={v24Native:true,zoneId:zone.id,productType:p.type,fit:f,exteriorLocalZ:face};e.group.traverse(o=>{if(o.isMesh&&o.userData.isProduct)o.userData.v24Native=true;});return {root:mount,engine:e,config:q,update:t=>e.seek(t),updateAnnotations:()=>{}};}
const providers={};
for(const type of types){const defaults=initial(type).settings,M={clone,initial:()=>initial(type),position,common:()=>clone(defaults),effective:opts=>({...clone(defaults),...opts}),optionKeys:[...Object.keys(defaults),'additionalRemotes'],validate:w=>validate(type,w),resolve:(w,p)=>{const q=validate(type,{...w,positions:[p]}),it=item(type,q);return {...it,id:p.id,positionNo:p.positionNo,width:Number(p.width),height:Number(p.height),quantity:Number(p.quantity),type,nativeItem:it,selectedOptions:[]};},copy:(w,ids)=>{w=clone(w);const others=Object.entries(root.PLMRV24Host?.getState().sceneEditor?.nativeWorkspaces||{}).filter(([t])=>t!==type).flatMap(([,a])=>a.positions||[]);let no=Math.max(0,...[...others,...w.positions].map(p=>Number(String(p.positionNo).match(/(\d+)$/)?.[1])||0));for(const p of w.positions.filter(p=>ids.includes(p.id)))w.positions.push({...clone(p),id:crypto.randomUUID(),positionNo:'P'+String(++no).padStart(2,'0')});return validate(type,w);}};
providers[type]={nativeV70:true,scope:{},descriptor:{type,label:names[type],reference:{prefix:type==='guillotine'?'GU':'SL'},fields:[]},model:M,forms:(w,fn,o)=>createForms(type,w,fn,o),document:w=>documentFor(type,w)};}
root.PLMRV70={engine,facade,types,names,input,item,document:documentFor,layout:root.PLMRProjectLayout,initial,position,validate};
Object.assign(root.PLMRV24Products,providers);
N.announceV70Readiness();
}
try{registerProducts();}catch(error){N.reportV70Failure(error);}
// The shared title block can initialize even when V70 product forms fail.
const clone=x=>JSON.parse(JSON.stringify(x));
function project(p){const q=clone(p||{});q.projectInfo=q.projectInfo||{};q.projectInfo.date=q.projectInfo.date||q.projectInfo.createdAt;q.projectInfo.designer=q.projectInfo.designer||q.projectInfo.projectRepresentative;q.commonSettings={...root.PLMRGiyotinState.createProject?.({})?.commonSettings,...q.commonSettings};return q;}
const title=root.PLMRGiyotin2DDocument;
if(title?.buildTitleBlock){const functions={buildTitleBlock:(p,h,l)=>title.buildTitleBlock(project(p),h,l),titleBlockLayout:p=>title.titleBlockLayout(project(p)),buildLogoBlock:title.buildLogoBlock};Object.assign(root.PLMRV24Libraries.PLMRV53Document,functions);if(root.PLMRV53TitleBlock)root.PLMRV53TitleBlock={...root.PLMRV53TitleBlock,layout:functions.titleBlockLayout,build:functions.buildTitleBlock,logo:functions.buildLogoBlock};}
})(window);
