/* Single transactional facade form. Product fields are the actual V07/V70 forms. */
(function(root){'use strict';let current=null;const N=root.PLMRV24Native,esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function open(zone,zones,type){current?.close();const host=root.PLMRV24Host,state=host.facadeState(zone),back=document.createElement('div');back.className='v26-dialog';back.setAttribute('role','dialog');back.setAttribute('aria-label','Cepheye Ürün Yerleştir');back.innerHTML='<section class="v26-card"><header><div><small>CEPHE ÜRÜNÜ</small><h2>Cepheye Ürün Yerleştir</h2></div><button data-action="close" aria-label="Kapat">×</button></header><main><p class="v26-zone">'+esc(zones?.length>1?zones.length+' cephe':zone.label||'Cephe')+'</p><div class="v26-size"><label>Genişlik (mm)<input id="v26FacadeWidth" aria-label="Cephe ürün genişliği" type="number" min="1" step="any"></label><label>Yükseklik (mm)<input id="v26FacadeHeight" aria-label="Cephe ürün yüksekliği" type="number" min="1" step="any"></label></div><label class="v26-product">Ürün<select id="v26FacadeProduct" aria-label="Cephe ürünü"><option value="">Ürün seçin…</option>'+N.types.map(t=>'<option value="'+t+'">'+esc(N.label(t))+'</option>').join('')+'</select></label><div id="v26FacadeOptions"></div><p class="v26-status" role="status" hidden></p><p class="v26-error" role="alert"></p></main><footer><button data-action="remove">Ürünü Sil</button><span></span><button data-action="cancel">Vazgeç</button><button data-action="save" class="v26-primary">Kaydet</button></footer></section>';
(document.fullscreenElement||document.body).append(back);
 let form=null,chosen='',closed=false,sizeEdited=false,requiredChoice='';
 const q=selector=>back.querySelector(selector);
 const width=q('#v26FacadeWidth'),height=q('#v26FacadeHeight'),select=q('#v26FacadeProduct');
 const options=q('#v26FacadeOptions'),error=q('.v26-error'),status=q('.v26-status');
 const save=q('[data-action=save]'),remove=q('[data-action=remove]');
 function close(){
  if(closed)return;
  closed=true;form?.close();back.remove();
  document.removeEventListener('keydown',key,true);
  root.removeEventListener('plmr-v70-readiness',refreshReadiness);
  if(current?.element===back)current=null;
 }
 function key(e){
  if(e.key!=='Escape')return;
  if(back.querySelector('.v24-native-modal:not(.v26-inline-settings)'))return;
  const v70=back.querySelectorAll('.v26-inline-v70 [role=dialog]');
  e.preventDefault();e.stopImmediatePropagation();
  if(v70.length>1){[...v70[v70.length-1].querySelectorAll('button')].find(b=>b.textContent.trim()==='×')?.click();return;}
  close();
 }
 function readSize(){
  const w=Number(width.value),h=Number(height.value);
  if(!(w>0&&h>0))throw Error('Genişlik ve yükseklik girin.');
  return {width:w,height:h};
 }
 function syncSize(){
  const size=readSize();
  form?.setSize(size.width,size.height);
 }
 function setStatus(message){status.textContent=message;status.hidden=!message;}
 function syncSave(){
  save.disabled=!form||Boolean(requiredChoice);
  setStatus(requiredChoice);
 }
 function render(type){
  form?.close();form=null;chosen=type;sizeEdited=false;requiredChoice='';
  error.textContent='';setStatus('');options.replaceChildren();save.disabled=true;
  const existing=type==='zip'?state.zip:state.primary;
  remove.hidden=!existing||existing.type!==type;
  if(!type){width.value=Number(zone.width);height.value=Number(zone.height);return;}
  const readiness=N.readiness(type);
  options.setAttribute('aria-busy',String(readiness.state==='loading'));
  if(readiness.state==='loading'){setStatus(readiness.message);return;}
  if(readiness.state==='failed'){error.textContent=readiness.message;return;}
  try{
   const adapter=readiness.product;
   const placement=N.native(existing)&&existing.type===type?existing:N.make(type,state.ownerColor);
   const fit=N.fit(zone,placement),draft=adapter.model.initial();
   draft.settings={...draft.settings,...placement.options};
   draft.positions=[{...adapter.model.position(placement.positionCode||adapter.descriptor.reference.prefix+'-01'),
    id:placement.id||zone.id,width:fit.width,height:fit.height,overrides:{}}];
   width.value=fit.width;height.value=fit.height;
   adapter.scope.PLMR_INTEGRATION_CONTEXT={kind:'bioclimatic-facade'};
   form=adapter.forms(draft,next=>{
    try{host.commitFacade(zone,zones,type,next);close();}
    catch(e){error.textContent=e.message;throw e;}
   },{
    single:true,inlineTarget:options,onCancel:close,
    onRequiredChoice:message=>{requiredChoice=message;syncSave();}
   });
   form.settings();
   syncSave();
  }catch(e){
   form?.close();form=null;syncSave();error.textContent=e.message;
  }
 }
 function refreshReadiness(){if(chosen&&!form)render(chosen);}
 options.addEventListener('change',e=>{
  if(chosen!=='zip'||e.target.id!=='placementLocation'||sizeEdited)return;
  try{
   const placement=N.make('zip',{placementLocation:e.target.value||null}),fit=N.fit(zone,placement);
   width.value=fit.width;height.value=fit.height;syncSize();
  }catch(e){error.textContent=e.message;}
 });
 select.onchange=()=>render(select.value);
 width.oninput=height.oninput=()=>{
  sizeEdited=true;
  if(!form)return;
  try{syncSize();error.textContent='';}catch(e){error.textContent=e.message;}
 };
 save.onclick=()=>{
  if(!form||save.disabled)return;
  try{
   const size=readSize();
   if(N.readiness(chosen).product.nativeV70)form.submitInline(size);
   else{form.setSize(size.width,size.height);form.submitInline();}
  }catch(e){error.textContent=e.message;}
 };
 remove.onclick=()=>{try{host.removeFacade(zone,zones,chosen);close();}catch(e){error.textContent=e.message;}};
 q('[data-action=cancel]').onclick=q('[data-action=close]').onclick=close;
 back.onmousedown=e=>{if(e.target===back)close();};
 document.addEventListener('keydown',key,true);
 root.addEventListener('plmr-v70-readiness',refreshReadiness);
 current={element:back,close};
 select.value=type||(state.primary?.type||state.zip?.type||'');
 render(select.value);select.focus();
 return current;
}
root.PLMRV26Facade={open,close:()=>current?.close()};
function escapeDialog(){const visible=n=>n.getBoundingClientRect().height>0&&getComputedStyle(n).visibility!=='hidden',native=[...document.querySelectorAll('.v24-native-modal')].filter(visible),top=native.at(-1);if(top){if(top.classList.contains('v26-inline-settings'))current?.close();else top.querySelector('.modal-head .close')?.click();return true;}const v70=[...document.querySelectorAll('.v70-modal-root [role=dialog]')].filter(visible);if(v70.length){if(current&&v70.length===1){current.close();return true;}[...v70.at(-1).querySelectorAll('button')].find(b=>b.textContent.trim()==='×')?.click();return true;}if(current){current.close();return true;}return false;}
root.PLMRV26Dialogs={escape:escapeDialog};root.addEventListener('keydown',e=>{if(e.key==='Escape'&&escapeDialog()){e.preventDefault();e.stopImmediatePropagation();}},true);
})(window);
