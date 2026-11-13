/* Approved V23 shell, V07 forms/engines, one canonical host document. */
(function(root){'use strict';const $=id=>document.getElementById(id),N=root.PLMRV24Native,L=root.PLMRV24Libraries;let active=null,frame=null,selected=[],facadeSelection=[],bookmarks=new Map(),workspacesReady=false,visualMode=null,bioSelection=[],mixedSelection=[],preserveSelection=false,viewportHandoff;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function api(){frame=$('viewerFrame');return frame?.contentWindow?.PLMRV24StandaloneViewer;}
root.PLMRV25Layout=()=>host().getLayout();
function host(){return root.PLMRV24Host;}
function work(){return host().getWork(active);}
function download(name,data,type){const url=URL.createObjectURL(new Blob([data],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1200);}
function modal(title,body,buttons=[]){const n=document.createElement('div');n.className='modal-overlay v24-native-modal';n.innerHTML='<section class="modal-card"><div class="modal-head"><h2>'+esc(title)+'</h2><button class="close" aria-label="Kapat">×</button></div><div class="modal-body">'+body+'</div><div class="modal-footer"></div></section>';n.querySelector('.close').onclick=()=>n.remove();for(const [text,fn]of buttons){const b=document.createElement('button');b.textContent=text;b.className='btn-blue';b.onclick=()=>fn(n);n.querySelector('.modal-footer').append(b);}(document.fullscreenElement||document.body).append(n);n.addEventListener('click',e=>{if(e.target===n)n.remove();});return n;}
function failure(e){console.error(e);modal('İşlem tamamlanamadı','<p>'+esc(e.message||e)+'</p>');}
function undo(){root.__P3DV_HOST_BRIDGE__.undoTechnical2DCommand();refresh();}function redo(){root.__P3DV_HOST_BRIDGE__.redoTechnical2DCommand();refresh();}
function selectedPositions(){const w=work();return w.positions.filter(p=>selected.includes(p.id));}
function commit(w){host().setWork(active,w);refresh();}
function select(ids){selected=ids;const w=active?work():null;document.dispatchEvent(new CustomEvent('plmr-v11-selection',{detail:w?w.positions.filter(p=>ids.includes(p.id)).map(p=>({kind:'facade',owner:'native',key:p.id,zoneId:p.id,productKey:p.id,zone:{id:p.id}})):[]}));renderDetails();}
function refresh(reset=false){buttonsStamp='';const a=api();if(a){if(active)a.load(active,work(),reset);else a.loadAll(host().getState().sceneEditor?.nativeWorkspaces||{},root.PLMRV25Layout(),reset);if(visualMode)a.setMode(visualMode);workspacesReady=true;}renderDetails();syncButtons();}
function renderDetails(){const bio=$('rrV16ProductDetails');if(bio)bio.hidden=false;$('v24NativeDetails')?.remove();root.PLMRV16UI?.updateDetails();}

function edit(id){const a=N.provider(active);a.scope.PLMR_INTEGRATION_CONTEXT=null;return a.forms(work(),commit).positions(false,id||selected[0]);}
function add(){const a=N.provider(active);a.scope.PLMR_INTEGRATION_CONTEXT=null;return a.forms(work(),commit).positions(true);}
function settings(){const a=N.provider(active);a.scope.PLMR_INTEGRATION_CONTEXT=null;a.forms(work(),commit).settings();}
let buttonsStamp='';
function syncButtons(){const layout=host().getLayout(active),m=visualMode||layout.previewMode||'3D';
 const stamp=JSON.stringify([active,m,layout.dimensionUnits,layout.showDimensions,selected]);
 if(stamp===buttonsStamp)return;
 buttonsStamp=stamp;for(const[id,on]of[['rrV45Mode2DBtn',m==='2D'],['rrV45Mode3DBtn',m==='3D']])$(id)?.classList.toggle('on',on);for(const k of root.PLMRUnits.positionUnits){const b=$('rrV45'+({mm:'Mm',inch:'Inch',ft:'Feet'}[k])+'Btn'),on=m==='2D'&&!layout.dimensionUnits?.mm&&!layout.dimensionUnits?.inch&&!layout.dimensionUnits?.ft?k==='mm':layout.dimensionUnits?.[k];b.classList.toggle('on',!!on);b.classList.toggle('off',!on);b.setAttribute('aria-pressed',String(!!on));}const dim=$('rrV11DimensionsBtn'),visible=m==='2D'||layout.showDimensions!==false&&!!(layout.dimensionUnits?.mm||layout.dimensionUnits?.inch);if(dim){dim.disabled=m==='2D';dim.dataset.visibilityState=visible?'on':'off';dim.setAttribute('aria-pressed',String(visible));dim.title=m==='2D'?'2D görünümde ölçüler her zaman açıktır.':visible?'Ölçüleri gizle':'Ölçüleri göster';dim.textContent=visible?'Ölçüler Açık':'Ölçüler Kapalı';}const bioTools=['rrV13GenerateZones','rrV45ZonesBtn','rrV45ZonesBtnArrow','rrV45PushPullToolBtn','rrV45TemplateSelect','rrV45ParapetHeight','rrV11MultiProfileAdd','rrV11MultiProfileDelete','rrV11MultiProductAdd','rrV11MultiProductDelete','rrV13CommonPost','rrV11ResetDefaults'];for(const id of bioTools)if($(id))$(id).disabled=!!active;for(const b of document.querySelectorAll('[data-legacy-id]'))if(['toolboxDrawBtn','toolboxLineBtn','toolboxPushPullBtn','toolboxWallBtn'].includes(b.dataset.legacyId))b.disabled=!!active;if(active){$('rrV14SelectionMotion').disabled=active==='fixed'||!selected.length;}}
function activate(type){active=type;if(!preserveSelection){selected=[];bioSelection=[];facadeSelection=[];mixedSelection=[];api()?.clearNativeSelection();api()?.clearBio();}root.__P3DV_HOST_BRIDGE__?.setRuntimeActive(true);const module=$('rrV14LayoutBtn');module.textContent='Modül 1';module.disabled=true;document.body.classList.add('v24-native-active');refresh(false);if(!preserveSelection)select([]);}
function deactivate(){active=null;if(!preserveSelection){selected=[];bioSelection=[];facadeSelection=[];mixedSelection=[];api()?.clearNativeSelection();api()?.clearBio();}root.__P3DV_HOST_BRIDGE__?.setRuntimeActive(true);const module=$('rrV14LayoutBtn');module.textContent='Yerleşim Seç…';module.disabled=false;document.body.classList.remove('v24-native-active');refresh(false);if(!preserveSelection)document.dispatchEvent(new CustomEvent('plmr-v11-selection',{detail:[]}));}
function mode(m){visualMode=m;api()?.setMode(m);syncButtons();}
function mainViewer(){return $('viewerFrame')?.contentWindow?.PLMRV24Viewer;}
function viewer(){return api()?.outputs||mainViewer();}
function getShots(){const key='project';if(!bookmarks.has(key))bookmarks.set(key,[]);return bookmarks.get(key);}
function capture(){const v=viewer();if(!v)throw Error('3D sahne henüz hazır değil.');const views=getShots(),next=v.cameraState();if(views.length<5){views.push(next);$('rrV45CaptureBtn').title=views.length+'/5 görüntü';return;}const m=modal('3D Görüntü Limiti','<p>Değiştirilecek görüntüyü seçin.</p>');for(const [i,c]of views.entries()){const b=document.createElement('button');b.className='v24-shot';b.innerHTML='<img src="'+v.shot(c,320,180)+'"><span>Görüntü '+(i+1)+'</span>';b.onclick=()=>{views[i]=next;m.remove();};m.querySelector('.modal-body').append(b);}}
let pdfRunning=false;
function choosePdf(run){
 if(pdfRunning)return;
 const dialog=modal('PDF Sayfa Boyutu','<div class="v36-pdf-formats" role="group" aria-label="PDF Sayfa Boyutu"></div>');
 const options=dialog.querySelector('.v36-pdf-formats');
 for(const paper of ['A0','A1','A2','A3','A4']){
  const button=document.createElement('button');
  button.type='button';button.textContent=paper;button.className='btn-blue';
  button.onclick=async()=>{
   dialog.remove();if(pdfRunning)return;pdfRunning=true;
   const operation=root.PLMRProcess?.begin('Çıktı hazırlanıyor…');
   try{await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));await run(paper);}
   catch(error){failure(error);}
   finally{pdfRunning=false;operation?.end();}
  };
  options.append(button);
 }
 options.firstElementChild.focus();
}
async function pdf3d(paper){
 const v=viewer();if(!v)throw Error('3D sahne henüz hazır değil.');
 const saved=getShots(),cameras=saved.length?saved.slice():[v.cameraState()];
 download(root.PLMRV5RoofSheet.safeName(root.PLMRFinalMetadata?.projectInfo,'pdf','3D'),await root.PLMRPdf.views(v,cameras,paper),'application/pdf');
}
async function pdf2d(paper){
 const svg=api()?.svg();if(!svg)throw Error('Önce poz ekleyin.');
 download(root.PLMRV5RoofSheet.safeName(root.PLMRFinalMetadata?.projectInfo,'pdf','2D'),await root.PLMRPdf.drawing(svg,paper),'application/pdf');
}
async function productList(){const w=work(),height=150+w.positions.length*64,svg='<svg xmlns="http://www.w3.org/2000/svg" width="1100" height="'+height+'"><rect width="1100" height="'+height+'" fill="white"/><g font-family="Arial" fill="#123c4b"><text x="30" y="40" font-size="24">PLMR · '+esc(N.provider(active).descriptor.label)+' · Ürün Listesi</text>'+w.positions.map((p,i)=>'<text x="30" y="'+(100+i*64)+'" font-size="18">'+esc(p.positionNo)+' · '+p.width+' × '+p.height+' mm · '+p.quantity+' Adet</text>').join('')+'</g></svg>';const img=await L.PLMRGiyotinPdfExporter.svgToJpeg(svg,{width:2200,height:height*2});download('PLMR_urun_listesi.pdf',L.PLMRGiyotinPdfExporter.imagePdfFromJpeg(img.bytes,img.width,img.height),'application/pdf');}
function target(open){api()?.commonMotion(mixedSelection,{target:open});}
function seek(t){api()?.commonMotion(mixedSelection,{seek:t});}
function progress(){return api()?.commonMotion(mixedSelection)?.progress??null;}
function syncPlayer(){
 const player=$('v24Player');if(!player)return;
 const status=api()?.commonMotion(mixedSelection),n=status?.progress??0;
 player.hidden=false;
 const disabled=!status?.movable;
 for(const id of ['v24Progress','v24Open','v24Close'])if($(id).disabled!==disabled)$(id).disabled=disabled;
 const slider=$('v24Progress');
 if(document.activeElement!==slider&&Number(slider.value)!==n*100)slider.value=n*100;
 const percent='%'+Math.round(n*100);
 if($('v24Percent').textContent!==percent)$('v24Percent').textContent=percent;
 const label=player.querySelector('label').firstChild,source=mixedSelection.length?'Seçili ürünlerin hareketi ':'Tüm ürünlerin hareketi ';
 if((root.PLMRI18n?.sourceText(label)||label.textContent)!==source)label.textContent=source;
}

function nativeSelection(keys,append,type){if(!append){bioSelection=[];facadeSelection=[];api()?.clearBio();}mixedSelection=[...(append?mixedSelection.filter(i=>i.kind!=='native'):[]),...keys.map(key=>({kind:'native',key}))];preserveSelection=true;try{if(type&&active!==type)root.PLMRUnifiedDrawingWorkspaceV4.activateProduct(type);}finally{preserveSelection=false;}selected=keys.filter(k=>k.startsWith(active+':')).map(k=>k.slice(active.length+1));preserveSelection=true;try{document.dispatchEvent(new CustomEvent('plmr-v11-selection',{detail:selected.map(id=>({kind:'facade',owner:'native',key:id,zoneId:id,productKey:id,zone:{id}}))}));}finally{preserveSelection=false;}api()?.refreshSelection();renderDetails();syncButtons();syncPlayer();}
function acceptBio(items,append=false){if(!append){api()?.clearNativeSelection();selected=[];mixedSelection=[];}bioSelection=items;facadeSelection=items.filter(i=>i.kind==='facade');mixedSelection=[...mixedSelection.filter(i=>i.kind==='native'),...items];if(items.length&&active){preserveSelection=true;try{root.PLMRUnifiedDrawingWorkspaceV4.activateProduct('rolling-roof');}finally{preserveSelection=false;}}api()?.refreshSelection();syncPlayer();}

function attach(){if(!root.PLMRUnifiedDrawingWorkspaceV4){setTimeout(attach,30);return;}const workspace=root.PLMRUnifiedDrawingWorkspaceV4;
const registerAvailable=()=>{for(const type of N.types){
 if(N.readiness(type).state==='ready')workspace.registerProduct({id:type,label:N.label(type),activate:()=>activate(type),deactivate});
}};
registerAvailable();
root.addEventListener('plmr-v70-readiness',registerAvailable);
document.body.classList.add('v25-common-scene');const player=document.createElement('div');player.id='v24Player';player.innerHTML='<button id="v24Close">Kapat</button><button id="v24Open">Tam Aç</button><label>Seçili pozun hareketi <input type="range" id="v24Progress" aria-label="Hareket konumu" min="0" max="100" step="0.1" value="0"></label><output id="v24Percent">%0</output>';$('rrV45Workspace').querySelector('.v33-preview-shell').after(player);$('v24Close').onclick=()=>target(false);$('v24Open').onclick=()=>target(true);$('v24Progress').oninput=()=>seek(Number($('v24Progress').value)/100);
document.addEventListener('plmr-v11-selection',e=>{if(preserveSelection)return;acceptBio((e.detail||[]).filter(i=>i.owner!=='native'),!!e.plmrAppend);});
const playerTimer=setInterval(()=>{if(!document.hidden){syncPlayer();syncButtons();}},100);
root.addEventListener('pagehide',()=>clearInterval(playerTimer),{once:true});
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const id=b.id,all={rrV45Mode2DBtn:()=>mode('2D'),rrV45Mode3DBtn:()=>mode('3D'),rrV45DxfBtn:()=>download(root.PLMRV5RoofSheet.safeName(root.PLMRFinalMetadata?.projectInfo),api().dxf(),'application/dxf'),rrV45Pdf2dBtn:()=>choosePdf(pdf2d),rrV45FitBtn:()=>api()?.fit(),rrV45MmBtn:()=>units('mm'),rrV45InchBtn:()=>units('inch'),rrV45FeetBtn:()=>units('ft'),rrV11DimensionsBtn:()=>{const l=root.PLMRV25Layout();const on=l.showDimensions===false;host().setLayout({showDimensions:on,...(on&&!l.dimensionUnits?.mm&&!l.dimensionUnits?.inch&&!l.dimensionUnits?.ft?{dimensionUnits:{mm:true,inch:false}}:{})});root.PLMRV11Commands?.setDimensions({main:on,intermediate:on,total:on,facades:on,roofs:on});refresh();},rrV45DaeBtn:()=>download(root.PLMRV5RoofSheet.safeName(root.PLMRFinalMetadata?.projectInfo,'dae'),viewer().dae(),'model/vnd.collada+xml'),rrV45CaptureBtn:capture,rrV45Pdf3dBtn:()=>choosePdf(pdf3d)};const actions={rrV11DimensionsBtn:()=>{const w=work();w.drawingLayout.showDimensions=!w.drawingLayout.showDimensions;commit(w);},rrV45AddPositionBtn:add,rrV45SettingsBtn:settings,rrV11SelectionEditBtn:()=>edit(),rrV11SelectionDeleteBtn:()=>{const w=work();w.positions=w.positions.filter(p=>!selected.includes(p.id));selected=[];commit(w);select([]);},rrV14SelectionMotion:()=>api()?.preview(),rrV45Mode2DBtn:()=>mode('2D'),rrV45Mode3DBtn:()=>mode('3D'),rrV45Pdf2dBtn:()=>choosePdf(pdf2d),rrV45DxfBtn:()=>download(root.PLMRV5RoofSheet.safeName(root.PLMRFinalMetadata?.projectInfo),api().dxf(),'application/dxf'),rrV11ProductListPdfBtn:productList,rrV45OpenBtn:()=>target((api()?.progress()||0)<.5),rrV45FitBtn:()=>api()?.fit(),rrV45MmBtn:()=>units('mm'),rrV45InchBtn:()=>units('inch'),rrV45ValidateBtn:()=>{N.provider(active).model.validate(work());modal('Kontrol tamamlandı','<p>Ölçüler, ayarlar ve ürün modeli geçerli.</p>');}};
if(['rrV11ProductListPdfBtn','exportProductListPdfBtn'].includes(id)&&root.PLMRFinalProductList?.()){e.preventDefault();e.stopImmediatePropagation();return;}
let fn=all[id]||(active?actions[id]:null);const commonLegacy=b.dataset.legacyId;if(!fn){if(commonLegacy==='toolbarZoomInBtn'||commonLegacy==='toolbarZoomOutBtn')fn=()=>api()?.zoom(commonLegacy==='toolbarZoomInBtn'?.82:1.22);else if(['toolbarFitBtn','toolboxResetCameraBtn'].includes(commonLegacy))fn=()=>api()?.fit();else if(commonLegacy==='toolbarRefreshBtn')fn=()=>refresh();else if(commonLegacy==='toolbarFullscreenBtn')fn=()=>{if(document.fullscreenElement)document.exitFullscreen();else $('rrV45Workspace').requestFullscreen();};}if(active&&!fn){const legacy=b.dataset.legacyId;if(legacy==='toolbarZoomInBtn'||legacy==='toolbarZoomOutBtn')fn=()=>api().zoom(legacy==='toolbarZoomInBtn'?.82:1.22);else if(legacy==='toolbarFullscreenBtn')fn=()=>{if(document.fullscreenElement)document.exitFullscreen();else $('rrV45Workspace').requestFullscreen();};else if(legacy==='toolbarFitBtn'||legacy==='toolbarRefreshBtn'||legacy==='toolboxResetCameraBtn')fn=()=>api().fit();else if(legacy==='positionEditBtn'||(root.PLMRI18n?.sourceText(b)||b.textContent).includes('Ölçüyü Düzenle')||(root.PLMRI18n?.sourceText(b)||b.textContent).includes('Pozları Düzenle'))fn=()=>edit();else if(id==='rrV15ProjectDownload')fn=()=>root.PLMRV15Project.download();else if((root.PLMRI18n?.sourceText(b)||b.textContent)==='Seçimi Temizle')fn=()=>{select([]);api()?.choose(null);};}
if(fn){e.preventDefault();e.stopImmediatePropagation();const operation=['rrV45DxfBtn','rrV45DaeBtn','rrV11ProductListPdfBtn','rrV15ProjectDownload','rrV45CaptureBtn'].includes(id)?root.PLMRProcess?.begin('Çıktı hazırlanıyor…'):null;Promise.resolve().then(()=>operation?new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))):undefined).then(()=>{if(['rrV45DxfBtn','rrV45DaeBtn','rrV45Pdf2dBtn','rrV45Pdf3dBtn','rrV11ProductListPdfBtn'].includes(id))host().placementRecovery.assertComplete();return fn();}).catch(failure).finally(()=>operation?.end());}},true);
function units(k){const l=root.PLMRV25Layout(),u={...l.dimensionUnits};if(visualMode==='2D'&&!u.mm&&!u.inch&&!u.ft)u.mm=true;u[k]=!u[k];if(visualMode==='2D'&&!u.mm&&!u.inch&&!u.ft)u[k]=true;const on=!!(u.mm||u.inch||u.ft);host().setLayout({dimensionUnits:u,...(visualMode==='2D'?{}:{showDimensions:on})});refresh();}
$('rrV45ColumnsSelect').addEventListener('change',e=>{e.stopImmediatePropagation();host().setLayout({columns:Number(e.target.value)});refresh();api()?.fit();},true);
document.addEventListener('plmr-v16-reset',()=>{selected=[];bioSelection=[];facadeSelection=[];mixedSelection=[];visualMode='3D';bookmarks.clear();root.PLMRUnifiedDrawingWorkspaceV4.activateProduct('rolling-roof');refresh(true);syncPlayer();});document.addEventListener('plmr-v24-native-change',()=>refresh());document.addEventListener('plmr-v11-dimensions',()=>refresh());document.addEventListener('plmr-v12-change',()=>{requestAnimationFrame(()=>refresh());});
}
document.addEventListener('keydown',e=>{if(document.querySelector('.v24-native-modal,.v70-modal-root')||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)||root.PLMRAnimationUI?.inspect().preview||root.__PLMR_ANIMATION_READONLY__)return;if(e.ctrlKey||e.metaKey){const k=e.key.toLowerCase();if(k==='z'||k==='y'){e.preventDefault();e.stopImmediatePropagation();(k==='y'||e.shiftKey?redo:undo)();}}},true);
root.PLMRV24Workspace={editPosition:(type,id)=>{root.PLMRUnifiedDrawingWorkspaceV4.activateProduct(type);return edit(id);},nativeSelection,acceptBio,undo,redo,active:()=>active,preserveViewport:box=>{viewportHandoff=box||null;},ready:()=>{const previous=viewportHandoff;viewportHandoff=undefined;refresh(previous===undefined);if(previous)api()?.restoreViewport2d(previous);},selection:select,viewer:()=>{frame=$('viewerFrame');return frame?.contentWindow?.__PLMR_ANIMATION_VIEWER__;},activate:async t=>{root.PLMRUnifiedDrawingWorkspaceV4.activateProduct(t);const end=Date.now()+30000;while(Date.now()<end){if(api()&&workspacesReady)return;await new Promise(r=>setTimeout(r,50));}throw Error('Ürün modülü yüklenemedi.');},mode,frame:()=>{frame=$('viewerFrame');return frame;},refresh,inspect:()=>({active,mixedSelection:[...mixedSelection],selected:[...selected],work:active?work():null})};
attach();
})(window);
