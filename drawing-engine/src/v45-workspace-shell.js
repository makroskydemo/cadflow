(function(){
  'use strict';

  const BIO_V1_BUILD='PLMR_BioclimaticConfugurator_V28';
  const PRODUCT_ID='rolling-roof';
  const PRODUCT_LABEL='PLMR | Bioclimatic';
  const $=(id)=>document.getElementById(id);
  const q=(sel,root=document)=>root.querySelector(sel);
  const qa=(sel,root=document)=>Array.from(root.querySelectorAll(sel));

  function el(tag,attrs={},children=[]){
    const node=document.createElement(tag);
    Object.entries(attrs).forEach(([key,value])=>{
      if(key==='class') node.className=value;
      else if(key==='text') node.textContent=value;
      else if(key==='html') node.innerHTML=value;
      else if(key==='disabled') node.disabled=Boolean(value);
      else if(key.startsWith('data-')) node.setAttribute(key,String(value));
      else if(value!==undefined&&value!==null) node.setAttribute(key,String(value));
    });
    (Array.isArray(children)?children:[children]).filter(Boolean).forEach(child=>node.append(child));
    return node;
  }

  const productRegistry=new Map();
  let activeProductId=PRODUCT_ID;
  let shell=null;
  let engineHost=null;
  let productSelect=null;
  let messageTimer=0;
  let settingsBackdrop=null;
  let bottomDrawer=null;
  let drawerBody=null;
  let sideToolbar=null;
  let sideOpen=true;

  function notify(message){
    const target=$('rrV45ToolbarMessage');
    if(!target)return;
    target.textContent=String(message||'');
    target.classList.add('show');
    window.clearTimeout(messageTimer);
    messageTimer=window.setTimeout(()=>target.classList.remove('show'),2200);
  }

  function legacyButton(id){return $(id)}
  function clickLegacy(id,{allowDisabled=false,missingMessage='Bu komut standalone PLMR | Bioclimatic V1 içinde henüz bağlı değil.'}={}){
    const button=legacyButton(id);
    if(!button){notify(missingMessage);return false;}
    if(button.disabled&&!allowDisabled){notify(missingMessage);return false;}
    button.click();
    window.setTimeout(syncUiState,0);
    return true;
  }

  function placeholder(message){notify(message||'Bu V45 komutu standalone PLMR | Bioclimatic V1 drawing engine içinde henüz uygulanmadı.');}

  function compactSelect(label,id,options){
    const select=el('select',{id});
    options.forEach(option=>select.append(el('option',{value:option.value,text:option.label})));
    return el('label',{class:'rr-compact-select'},[el('span',{text:label}),select]);
  }

  function toolButton(label,className,onClick,options={}){
    const b=el('button',{type:'button',class:`v33-tool ${className||'light'}`,text:label});
    if(options.id)b.id=options.id;
    if(options.title)b.title=options.title;
    if(options.disabled)b.disabled=true;
    if(options['aria-pressed'])b.setAttribute('aria-pressed',options['aria-pressed']);
    b.addEventListener('click',onClick);
    return b;
  }

  function stateButton(label,id,onClick,className=''){
    const b=el('button',{type:'button',id,class:`v33-state ${className}`,text:label});
    b.addEventListener('click',onClick);
    return b;
  }

  function summaryRow(label,value,id,muted=false){
    const strong=el('strong',{text:value||'—'}); if(id)strong.id=id;if(muted)strong.classList.add('muted');
    return el('div',{class:'rr-summary-row'},[el('span',{text:label}),strong]);
  }

  function projectCard(){
    const projectCode=$('projectCodeValue')?.textContent?.trim()||'—';
    const date=$('plmrProjectDate')?.textContent?.trim()||'—';
    const card=el('section',{class:'rr-project-card'});
    const head=el('div',{class:'rr-card-head'},[el('strong',{text:'PROJE BİLGİLERİ'}),el('button',{type:'button',text:'Düzenle',disabled:true,title:'Standalone drawing-engine paketinde proje master kaydı yok.'})]);
    card.append(head,
      summaryRow('Proje Kodu',projectCode,'rrProjectCode',projectCode==='-'||projectCode==='—'),
      summaryRow('Teklif Veren Firma','—',null,true),
      summaryRow('Müşteri','—',null,true),
      summaryRow('Ülke','—',null,true),
      summaryRow('Cari Yetkilisi','—',null,true),
      summaryRow('Müşteri Temsilcisi','—',null,true),
      summaryRow('Proje Temsilcisi','—',null,true),
      summaryRow('Proje Adı','—',null,true),
      summaryRow('Revizyon','R01'),
      summaryRow('Çıktı Birimi','mm'),
      summaryRow('Oluşturma',date,'rrProjectDate',date==='—'),
      summaryRow('Proje Açıklaması','Standalone PLMR | Bioclimatic drawing-engine laboratuvarı',null,false)
    );
    return card;
  }

  function filesCard(){
    const card=el('section',{class:'rr-project-card'});
    card.append(el('div',{class:'rr-card-head blue'},[el('strong',{text:'PROJE DOSYALARI'}),el('button',{type:'button',text:'Ekle',disabled:true,title:'V45 entegrasyonunda proje dosyaları ana uygulama tarafından sağlanacak.'})]));
    card.append(summaryRow('Dosya Alanı','V45 entegrasyonunda aktif','',true));
    return card;
  }

  function statusCard(){
    const card=el('section',{class:'rr-project-card rr-status-card'});
    card.append(el('div',{class:'rr-card-head amber'},[el('strong',{text:'DURUM GEÇMİŞİ'}),el('button',{type:'button',text:'ⓘ',disabled:true})]));
    card.append(el('div',{class:'rr-milestone'},[el('i'),el('div',{},[el('b',{text:'Drawing Engine · V28'}),el('small',{text:'Ortak sahne görünümü aktif · Çoklu seçim · zone filtreleri'})])]));
    return card;
  }

  function openSettings(){
    if(!settingsBackdrop)return;
    window.PLMRV17Commands?.beginSettings();syncInstanceEditor();window.PLMRV12UI?.sync();
    settingsBackdrop.hidden=false;settingsBackdrop.setAttribute('aria-hidden','false');
    document.body.classList.add('rr-settings-open');
  }
  function closeSettings(){
    if(!settingsBackdrop)return;
    window.PLMRV17Commands?.cancelSettings();settingsBackdrop.hidden=true;settingsBackdrop.setAttribute('aria-hidden','true');
    document.body.classList.remove('rr-settings-open');
  }

  function buildSettingsModal(parameterPanel){
    settingsBackdrop=el('div',{id:'rrV45SettingsModal',class:'rr-settings-backdrop',hidden:true,'aria-hidden':'true'});
    const dialog=el('section',{class:'rr-settings-dialog',role:'dialog','aria-modal':'true','aria-label':'PLMR | Bioclimatic Ayarları'});
    const close=el('button',{type:'button',text:'×','aria-label':'Ayarları kapat'}); close.addEventListener('click',closeSettings);
    dialog.append(el('div',{class:'rr-settings-head'},[el('strong',{text:'PLMR | Bioclimatic Ayarları'}),el('small',{text:'PLMR | Bioclimatic ürün ölçüleri'}),close]));
    const body=el('div',{class:'rr-settings-body'});
    if(parameterPanel)body.append(parameterPanel);
    dialog.append(body);settingsBackdrop.append(dialog);document.body.append(settingsBackdrop);
    settingsBackdrop.addEventListener('click',e=>{if(e.target===settingsBackdrop)closeSettings();});
  }

  function syncInstanceEditor(){window.PLMRV12UI?.sync();}

  function validateDrawing(){
    try{
      const bridge=window.__P3DV_DOCUMENT_BRIDGE__;
      const ready=Boolean(bridge&&typeof bridge.isReady==='function'&&bridge.isReady());
      if(!ready){notify('Kontrol: önce geçerli PLMR | Bioclimatic ölçülerini girip modeli oluşturun.');return;}
      if(bridge&&typeof bridge.technical2DProjectionForTest==='function'){
        const projection=bridge.technical2DProjectionForTest();
        if(projection&&projection.valid===false){notify(`Kontrol gerekli: ${(projection.errors||[]).join(' · ')||'2D projection geçersiz.'}`);return;}
      }
      notify('Kontrol tamamlandı · canonical model state geçerli.');
    }catch(error){notify(`Kontrol tamamlanamadı: ${String(error&&error.message||error)}`);}
  }

  function export2dPdf(){
    if(clickLegacy('toolbarPdfBtn',{missingMessage:'PDF akışı V2 runtime içinde hazır değil.'}))notify('PLMR | Bioclimatic doküman/PDF akışı açıldı.');
  }
  function exportDxf(){clickLegacy('toolbarDxfBtn',{missingMessage:'Önce geçerli bir 2D çizim oluşturun; ardından DXF aktif olur.'});}

  function toggleUnits(key){const u=window.PLMRRollingRoofSketch.getState().sceneEditor.dimensionUnits;window.PLMRRollingRoofSketch.setDimensionUnits({...u,[key]:!u[key]});}
  document.addEventListener('plmr:units',e=>{for(const k of window.PLMRUnits.positionUnits){const b=$('rrV45'+({mm:'Mm',inch:'Inch',ft:'Feet'}[k])+'Btn');if(b){b.classList.toggle('on',e.detail[k]);b.classList.toggle('off',!e.detail[k]);b.setAttribute('aria-pressed',String(e.detail[k]));}}});
  function buildTopToolbar(){
    const top=el('div',{class:'v33-top-toolbar'});
    const left=el('div',{class:'v33-toolbar-left'});
    const productWrap=compactSelect('Ürün','rrV45ProductSelect',[{value:PRODUCT_ID,label:PRODUCT_LABEL}]);
    productSelect=q('select',productWrap);
    productSelect.addEventListener('change',()=>activateProduct(productSelect.value));
    const moduleWrap=el('label',{class:'rr-compact-select'},[el('span',{text:'Modül'}),toolButton('Yerleşim Seç…','light',()=>window.PLMRV14LayoutUI.open(),{id:'rrV14LayoutBtn'})]);
    left.append(productWrap,moduleWrap,
      toolButton('⚙ Ayarlar','light',openSettings,{id:'rrV45SettingsBtn'}),
      toolButton('Poz Ekle','blue',()=>window.PLMRV12UI.addPosition(),{id:'rrV45AddPositionBtn'}),
      toolButton('Proje Dosyası İndir','light',()=>window.PLMRV15Project.download(),{id:'rrV15ProjectDownload'}),
      toolButton('Proje Dosyası Aç','light',()=>window.PLMRV15Project.open(),{id:'rrV15ProjectOpen'}),
      toolButton('Kontrol Et','orange',validateDrawing,{id:'rrV45ValidateBtn'}),
      toolButton('PDF İndir (2D)','teal',export2dPdf,{id:'rrV45Pdf2dBtn'}),
      toolButton('DXF İndir','teal2',exportDxf,{id:'rrV45DxfBtn'}),
      toolButton('DAE İndir','forest',()=>placeholder('PLMR | Bioclimatic dedicated DAE exporter V1 içinde henüz yok.'),{id:'rrV45DaeBtn'}),
      toolButton('PDF İndir (3D)','forest',()=>placeholder('V5 içinde V45 project-level 3D PDF akışı henüz bulunmuyor.'),{id:'rrV45Pdf3dBtn'}),
      toolButton('Görüntü Al','forest',()=>placeholder('V5 içinde V45 kamera bookmark / Görüntü Al sağlayıcısı henüz bulunmuyor.'),{id:'rrV45CaptureBtn'}),
      toolButton('Sahneleri Seç','petrol',()=>window.PLMRAnimationUI.openScenes(),{id:'rrV22ScenesBtn'}),
      toolButton('Animasyon Paylaş','petrol',()=>window.PLMRAnimationUI.openShare(),{id:'rrV22ShareBtn'}),
      toolButton('Ürün Listesi PDF','teal',()=>clickLegacy('exportProductListPdfBtn'),{id:'rrV11ProductListPdfBtn'}),
      toolButton('Üretim Paketini Oluştur','gold',()=>{}, {id:'rrV45ProductionBtn',disabled:true,'aria-disabled':'true',title:'Üretim paketi oluşturma şu anda pasif.'})
    );
    const view=el('div',{class:'v33-toolbar-view'});
    const columns=el('select',{class:'v33-columns',id:'rrV45ColumnsSelect'});
    for(let i=1;i<=10;i+=1)columns.append(el('option',{value:i,text:`${i}'li`}));columns.value='2';
    columns.addEventListener('change',()=>notify(`Proje yerleşim tercihi ${columns.value}'li olarak V1 shell state'ine kaydedildi; PLMR | Bioclimatic standalone motoru tek ürün sahnesi kullanıyor.`));
    const mm=stateButton('mm','rrV45MmBtn',()=>toggleUnits('mm'),'unit on');
    const inch=stateButton('inch','rrV45InchBtn',()=>toggleUnits('inch'),'unit off');
    const feet=stateButton('ft','rrV45FeetBtn',()=>toggleUnits('ft'),'unit off');

    const expand=stateButton('Büyüt','rrV45ExpandBtn',()=>clickLegacy('previewExpandBtn',{missingMessage:'Önizleme büyütme kullanılamıyor.'}));
    const fit=stateButton('Sığdır','rrV45FitBtn',()=>clickLegacy('toolbarFitBtn',{missingMessage:'Kamera sığdırma kullanılamıyor.'}),'fit');
    const mode2d=stateButton('2D','rrV45Mode2DBtn',()=>clickLegacy('mode2DBtn',{missingMessage:'Technical 2D bu durumda kullanılamıyor.'}),'view');
    const mode3d=stateButton('3D','rrV45Mode3DBtn',()=>clickLegacy('mode3DBtn',{missingMessage:'3D viewer bu durumda kullanılamıyor.'}),'view on');
    view.append(columns,mm,inch,feet,mode2d,mode3d);top.append(left,view);return top;
  }

  function proxySideButton(label,legacyId,options={}){
    const b=el('button',{type:'button',text:label,class:options.className||''});
    const source=legacyButton(legacyId);
    b.dataset.legacyId=legacyId;b.disabled=!source||source.disabled;b.addEventListener('click',()=>clickLegacy(legacyId,{missingMessage:options.missingMessage}));
    return b;
  }

  function togglePushPull(){const api=window.PLMRRollingRoofSketch;if(!api)return;try{api.setTool($('rrV45PushPullToolBtn').classList.contains('on')?'select':'pushpull');}catch(e){notify(e.message);}}
  function buildTemplateControl(){
    const select=el('select',{id:'rrV45TemplateSelect','aria-label':'Hazır alan seç'});select.append(el('option',{value:'',text:'Hazır alan seç…'}));for(const [value,text]of [['terrace','Düz teras'],['rear-wall','Arka duvarlı alan'],['l-wall','L duvarlı alan'],['parapet','Parapetli teras'],['platform','Yükseltilmiş platform']])select.append(el('option',{value,text}));select.addEventListener('change',()=>{if(select.value)window.PLMRRollingRoofSketch.addTemplate(select.value);select.value='';});return select;
  }
  function buildParapetControl(){
    const wrap=el('label',{class:'rr-parapet-quick is-empty',id:'rrV45ParapetWrap'}),input=el('input',{id:'rrV45ParapetHeight',type:'text',inputmode:'decimal',placeholder:'0','aria-label':'Parapet yüksekliği mm'}),hint=el('small',{id:'rrV45ParapetError',role:'status'});
    wrap.append(el('span',{text:'Parapet H (mm)'}),input,hint);
    const apply=()=>{const height=Number(input.value.replace(',','.'));if(!Number.isFinite(height)||height<0){hint.textContent='Geçerli yükseklik yazın.';return;}const ok=window.PLMRRollingRoofSketch.setParapetHeight(height);hint.textContent=ok?'':'Parapet oluk alt kotunu geçemez.';wrap.classList.toggle('is-empty',!height);wrap.classList.toggle('is-filled',height>0);};
    input.addEventListener('change',apply);input.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter'){e.preventDefault();apply();input.blur();}});
    document.addEventListener('plmr:parapet',e=>{if(document.activeElement!==input)input.value=String(e.detail.height||'');wrap.classList.toggle('is-empty',!e.detail.height);wrap.classList.toggle('is-filled',e.detail.height>0);});return wrap;
  }
  let selectedProducts=[];
  function buildSideToolbar(){
    sideToolbar=el('aside',{class:'v33-side-toolbar open','aria-label':'PLMR | Bioclimatic çizim araçları'});
    const head=el('div',{class:'v33-side-head'}),toggle=el('button',{type:'button',text:'›',title:'Araç panelini daralt'});head.append(toggle);
    const grid=el('div',{class:'v33-side-grid'}),extra=el('div',{class:'rr-side-extra'});grid.append(extra);sideToolbar.append(head,grid);
    const command=()=>window.PLMRV11Commands;
    const pair=(...buttons)=>el('div',{class:'rr-side-pair'},buttons);
    const cameraGroup=el('div',{class:'rr-v11-camera-group'});
    cameraGroup.append(
      pair(proxySideButton('Çizimi Yenile','toolbarRefreshBtn',{className:'blue'}),proxySideButton('Kamerayı Sıfırla','toolboxResetCameraBtn')),
      pair(proxySideButton('Yakınlaştır','toolbarZoomInBtn'),proxySideButton('Uzaklaştır','toolbarZoomOutBtn')),
      pair(proxySideButton('AR · Gerçek Alan','toolbarArBtn',{className:'teal'}),proxySideButton('Tam Ekran','toolbarFullscreenBtn')),
      buildTemplateControl()
    );
    extra.append(cameraGroup,el('div',{class:'rr-side-divider'}),toolButton('✎ Ölçüyü Düzenle','light',()=>clickLegacy('positionEditBtn')));
    const context=el('div',{id:'rrV11SelectionActions',class:'rr-v11-context',hidden:true}),count=el('small',{role:'status'}),edit=toolButton('Düzenle','blue',()=>command().editSelection(selectedProducts),{id:'rrV11SelectionEditBtn'}),del=toolButton('Sil','danger',()=>command().deleteSelection(selectedProducts),{id:'rrV11SelectionDeleteBtn'});const motion=toolButton('Hareketi Göster','light',()=>window.PLMRV14Commands.previewSelection(selectedProducts),{id:'rrV14SelectionMotion'});context.append(count,edit,del,toolButton('Seçimi Temizle','light',()=>command().clearSelection()),motion);extra.append(context);
    let selectedZones=[];
    const equalize=toolButton('Zone Mesafelerini Eşitle','teal',()=>{
      try{window.PLMRRollingRoofSketch.equalZones(selectedZones);}
      catch(error){notify(window.PLMRDrawingText.t(error.message));}
    },{id:'rrV42EqualZones'});
    const zoneActions=pair(equalize,toolButton('Seçimi Temizle','light',()=>command().clearSelection()));
    zoneActions.hidden=true;
    extra.append(zoneActions);
    document.addEventListener('plmr-zone-selection',e=>{
      selectedZones=e.detail;
      zoneActions.hidden=!selectedZones.length;
      equalize.disabled=selectedZones.length<2;
    });
    document.addEventListener('plmr-v11-selection',e=>{selectedProducts=e.detail||[];context.hidden=!selectedProducts.length;count.textContent=selectedProducts.length+' ürün seçili';motion.disabled=!window.PLMRV14Commands.movableSelection(selectedProducts).length;edit.disabled=!selectedProducts.length||(!selectedProducts.every(x=>x.kind==='facade')&&!selectedProducts.every(x=>x.kind==='roof')&&!(selectedProducts.length===1&&selectedProducts[0].kind==='system'));});
    function split(label,id,build){const wrap=el('div',{class:'rr-v11-split'}),main=toolButton(label,'teal',()=>{if(id==='rrV45ZonesBtn')window.PLMRZones.toggle();else{const d=command().dimensions(),on=d.main||d.intermediate;command().setDimensions({main:!on,intermediate:!on,positions:!on,total:!on});}}, {id}),arrow=toolButton('⌄','teal',()=>{const opening=menu.hidden;document.querySelectorAll('.rr-v11-filter-menu').forEach(n=>n.hidden=true);menu.hidden=!opening;if(opening){build(menu);const r=arrow.getBoundingClientRect();menu.style.position='fixed';menu.style.left=Math.max(8,r.right-280)+'px';menu.style.top=Math.min(r.bottom,innerHeight-410)+'px';}},{id:id+'Arrow','title':(id==='rrV45ZonesBtn'?'Zone filtreleri':'Ölçüler filtreleri')}),menu=el('div',{class:'rr-v11-filter-menu',hidden:true});wrap.append(main,arrow,menu);return wrap;}
    function checkbox(menu,label,value,onChange){const input=el('input',{type:'checkbox'});input.checked=value;input.addEventListener('change',()=>onChange(input.checked));const row=el('label',{class:'rr-v11-filter-row'},[input,el('span',{text:label})]);menu.append(row);return row;}
    const dims=split('Ölçüler','rrV11DimensionsBtn',menu=>(window.PLMRV17UI||window.PLMRV15Project).buildDimensionMenu(menu));extra.append(dims);
    const zones=split('▧ Zone’lar Açık','rrV45ZonesBtn',buildZoneMenu);extra.append(zones);
    function buildZoneMenu(menu){window.PLMRV16UI.buildZoneMenu(menu);}
    window.addEventListener('plmr-zone-filters',()=>{const b=$('rrV45ZonesBtn'),on=window.PLMRZones.visible();b.textContent=on?'▧ Zone’lar Açık':'▧ Zone’lar Kapalı';b.setAttribute('aria-pressed',String(on));});
    document.addEventListener('plmr-v11-dimensions',()=>{if(!dims.lastChild.hidden)(window.PLMRV17UI||window.PLMRV15Project).buildDimensionMenu(dims.lastChild);});
    extra.append(pair(toolButton('⇳ Push / Pull','orange',togglePushPull,{id:'rrV45PushPullToolBtn'}),toolButton('Ortak Dikme','light',()=>window.PLMRV13Commands.startCommon(),{id:'rrV13CommonPost'})),buildParapetControl());
    const bulk=el('div',{class:'rr-v11-bulk',id:'rrV11BulkActions',hidden:true}),info=el('small',{role:'status'});bulk.append(info,toolButton('Tamam','blue',()=>command().completeBulk(),{id:'rrV11BulkDone'}),toolButton('İptal','light',()=>command().cancelBulk(),{id:'rrV11BulkCancel'}));extra.append(bulk);
    const bulkButton=(mode,label,id)=>toolButton(label,'light',()=>command().startBulk(mode),{id});
    extra.append(
      pair(bulkButton('multi-profile-add','Çoklu Profil Ekle','rrV11MultiProfileAdd'),bulkButton('multi-profile-delete','Çoklu Profil Sil','rrV11MultiProfileDelete')),
      pair(bulkButton('multi-product','Çoklu Ürün Ekle','rrV11MultiProductAdd'),bulkButton('multi-delete','Çoklu Ürün Sil','rrV11MultiProductDelete'))
    );
    document.addEventListener('plmr-v11-bulk',e=>{bulk.hidden=!e.detail.mode;info.textContent=e.detail.count+' hedef seçili';});
    extra.append(pair(toolButton('Varsayılana Döndür','danger',()=>command().reset(),{id:'rrV11ResetDefaults'}),toolButton('Resetle','danger',()=>window.PLMRV16Commands.resetAll(),{id:'rrV16ResetAll',title:'Tüm çizimi ve geçmişi temizle; başlangıca dön'})));
    toggle.addEventListener('click',()=>{sideOpen=!sideOpen;sideToolbar.classList.toggle('open',sideOpen);sideToolbar.classList.toggle('collapsed',!sideOpen);grid.hidden=!sideOpen;toggle.textContent=sideOpen?'›':'‹';});
    document.addEventListener('pointerdown',e=>{if(!e.target.closest('.rr-v11-split'))document.querySelectorAll('.rr-v11-filter-menu').forEach(n=>n.hidden=true);});
    document.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelectorAll('.rr-v11-filter-menu').forEach(n=>n.hidden=true);if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='a'&&!/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)){e.preventDefault();window.PLMRV11Commands.selectAll();}});
    document.addEventListener('plmr-v11-edit-copy',e=>window.PLMRV12UI.editPosition(e.detail.id,0));
    const style=el('style',{text:'.rr-v11-split{position:relative;display:grid;grid-template-columns:1fr 27px;gap:1px}.rr-v11-split>button{min-width:0}.rr-v11-filter-menu{position:absolute;right:0;top:100%;width:260px;max-height:390px;overflow:auto;padding:10px;background:#fff;border:1px solid #cbd5e1;box-shadow:0 8px 25px #33415533;z-index:90;color:#334155}.rr-v11-filter-menu[hidden],.rr-v11-context[hidden],.rr-v11-bulk[hidden],.rr-v11-filter-row[hidden]{display:none}.rr-v11-filter-row{display:flex;align-items:center;gap:8px;padding:5px 1px;font:12px Segoe UI;cursor:pointer}.rr-v11-filter-menu input[type=search]{width:100%;box-sizing:border-box;padding:6px;margin-bottom:6px}.rr-v11-context,.rr-v11-bulk{display:grid;grid-template-columns:1fr 1fr;gap:5px;padding:7px;background:#dbeafe;border-radius:6px}.rr-v11-context small,.rr-v11-bulk small{grid-column:1/-1}.rr-v11-zone-rows{max-height:170px;overflow:auto}.rr-v45-shell .v33-side-grid{overflow:auto;min-height:0}.v33-side-toolbar{overflow:visible}.rr-v11-camera-group select{width:100%}'});document.head.append(style);
    return sideToolbar;
  }

  function detailTable(){return el('div',{id:'rrV16ProductDetails',class:'v37-product-detail-list'});}

  function buildBottomDrawer(){
    bottomDrawer=el('section',{class:'v33-bottom-drawer collapsed'});
    const tabs=el('div',{class:'v33-product-tabs'});
    const productTab=el('button',{type:'button',class:'active',text:'▣ Ürün Detay Listesi'});
    const toggle=el('button',{type:'button',class:'v33-drawer-toggle',text:'⌃',title:'Paneli aç'});
    tabs.append(productTab,toggle);drawerBody=el('div',{class:'v33-drawer-body'});drawerBody.append(detailTable());bottomDrawer.append(tabs,drawerBody);
    let open=false;
    function setDrawer(next){open=Boolean(next);bottomDrawer.classList.toggle('collapsed',!open);bottomDrawer.style.height=open?'34%':'11%';toggle.textContent=open?'⌄':'⌃';toggle.title=open?'Paneli küçült':'Paneli aç';}
    document.addEventListener('plmr-v16-reset',()=>setDrawer(false));
    toggle.addEventListener('click',()=>setDrawer(!open));productTab.addEventListener('click',()=>setDrawer(true));
    return bottomDrawer;
  }

  function buildShell(previewWorkspace,parameterPanel){
    shell=el('div',{id:'rrV45Workspace',class:'giyotin-v33 drawing-workspace v33-workspace rr-v45-shell',tabindex:'0'});
    const grid=el('div',{class:'v33-workspace-grid'});
    const entry=el('aside',{class:'v33-entry-panel'});
    const entryHead=el('div',{class:'v33-entry-head'});
    const entryActions=el('div',{class:'v33-entry-head-actions'});
    const save=el('button',{type:'button',class:'btn-blue v33-save-btn',text:'Projeyi Kaydet',disabled:true,title:'Standalone drawing-engine paketinde proje persistence yok; Ana PLMR entegrasyonunda sağlanacak.'});
    const collapse=el('button',{type:'button',class:'btn-teal v33-entry-toggle',text:'←',title:'Girişi daralt','aria-label':'Girişi daralt'});
    entryActions.append(save,collapse);entryHead.append(el('strong',{text:'Giriş'}),entryActions);
    const saveStatus=el('div',{class:'v33-save-status'},[el('span',{class:'ok',text:'✓ Standalone Drawing Engine · V28'}),el('small',{text:'Ortak sahne ve ölçü görünümü · PLMR | Bioclimatic bağımsız çizim'})]);
    const fields=el('fieldset',{class:'v33-entry-fields'});fields.append(projectCard(),filesCard(),statusCard());
    const rail=el('div',{class:'v33-entry-rail'});rail.hidden=true;['ⓘ','▤','◷'].forEach(icon=>{const b=el('button',{type:'button',text:icon});b.addEventListener('click',()=>setEntryCollapsed(false));rail.append(b);});
    entry.append(entryHead,saveStatus,fields,rail);

    const splitter=el('div',{class:'v33-entry-splitter',title:'Giriş paneli'});
    const stageCol=el('section',{class:'v33-stage-column'});
    const previewShell=el('div',{class:'v33-preview-shell'});previewShell.append(buildTopToolbar());
    const previewStage=el('div',{class:'v33-preview-stage is-3d side-open'});
    engineHost=el('div',{class:'v33-engine-host',id:'rrV45EngineHost'});
    if(previewWorkspace){previewWorkspace.classList.add('is-toolbox-collapsed');engineHost.append(previewWorkspace);}
    const dock=el('div',{class:'v33-scene-dock open'});dock.append(buildSideToolbar());
    const message=el('div',{id:'rrV45ToolbarMessage',class:'rr-toolbar-message','aria-live':'polite'});
    previewStage.append(engineHost,dock,message);previewShell.append(previewStage);stageCol.append(previewShell,el('div',{class:'v33-drawer-splitter'},[el('span')]),buildBottomDrawer());
    grid.append(entry,splitter,stageCol);shell.append(grid);document.body.append(shell);buildSettingsModal(parameterPanel);

    let collapsed=false;
    function setEntryCollapsed(next){collapsed=Boolean(next);entry.classList.toggle('collapsed',collapsed);fields.hidden=collapsed;saveStatus.hidden=collapsed;rail.hidden=!collapsed;collapse.textContent=collapsed?'→':'←';collapse.title=collapsed?'Girişi genişlet':'Girişi daralt';collapse.setAttribute('aria-label',collapse.title);grid.style.setProperty('--v33-entry-width',collapsed?'52px':'224px');}
    collapse.addEventListener('click',()=>setEntryCollapsed(!collapsed));
    window.addEventListener('keydown',event=>{if(event.key==='Escape'){if(settingsBackdrop&&!settingsBackdrop.hidden){closeSettings();return;}if(document.body.classList.contains('preview-expanded'))clickLegacy('previewExpandBtn',{allowDisabled:true});}});
  }

  function registerProduct(definition){
    if(!definition||!definition.id)throw new Error('PLMR_PRODUCT_ID_REQUIRED');
    const def={label:definition.label||definition.id,...definition};productRegistry.set(def.id,def);
    if(productSelect&&!Array.from(productSelect.options).some(o=>o.value===def.id))productSelect.append(el('option',{value:def.id,text:def.label}));
    return def.id;
  }

  function activateProduct(id){
    const next=productRegistry.get(id);
    if(!next){notify(`Ürün sağlayıcısı kayıtlı değil: ${id}`);if(productSelect)productSelect.value=activeProductId;return false;}
    if(id===activeProductId){if(productSelect)productSelect.value=id;return true;}
    const prev=productRegistry.get(activeProductId);
    try{if(prev&&typeof prev.deactivate==='function')prev.deactivate({engineHost,shell});}catch(error){console.warn(error);}
    activeProductId=id;
    try{if(typeof next.activate==='function')next.activate({engineHost,shell});}catch(error){console.error(error);notify(`Ürün workspace'i açılamadı: ${next.label}`);activeProductId=prev?.id||PRODUCT_ID;return false;}
    if(productSelect)productSelect.value=activeProductId;
    document.dispatchEvent(new CustomEvent('plmr:workspace-product-changed',{detail:{productId:activeProductId,label:next.label}}));
    notify(`${next.label} · aynı drawing workspace içinde aktif.`);return true;
  }

  function readValue(id,fallback='—'){const node=$(id);const value=node&&('value'in node?node.value:node.textContent);const text=String(value??'').trim();return text||fallback;}
  function updateDetails(){
    window.PLMRV16UI?.updateDetails();
    const put=(id,value)=>{const node=$(id);if(node)node.textContent=value;};
    put('rrDetailSystem',readValue('pergoSystemCountInput','1'));
    put('rrDetailWidth',readValue('freedomWidthInput','—'));
    put('rrDetailDepth',readValue('freedomDepthInput','—'));
    put('rrDetailHeight',readValue('freedomHeightInput','—'));
    put('rrDetailPanel',readValue('freedomPanelCountInput','8'));
    const color=readValue('systemColorValue','—'),motor=readValue('motorInput','Yok');put('rrDetailFinish',`${color} · ${motor}`);
    const pc=$('projectCodeValue')?.textContent?.trim()||'—',pd=$('plmrProjectDate')?.textContent?.trim()||'—';if($('rrProjectCode'))$('rrProjectCode').textContent=pc;if($('rrProjectDate'))$('rrProjectDate').textContent=pd;
  }

  function syncUiState(){
    const mode2=$('mode2DBtn'),mode3=$('mode3DBtn');
    const p2=$('rrV45Mode2DBtn'),p3=$('rrV45Mode3DBtn');
    const active2=Boolean(mode2&&(mode2.classList.contains('is-active')||mode2.getAttribute('aria-pressed')==='true'));
    const active3=Boolean(mode3&&(mode3.classList.contains('is-active')||mode3.getAttribute('aria-pressed')==='true'));
    if(p2)p2.classList.toggle('on',active2);if(p3)p3.classList.toggle('on',active3||!active2);
    const stage=q('.v33-preview-stage',shell);if(stage){stage.classList.toggle('is-2d',active2);stage.classList.toggle('is-3d',!active2);}
    const replay=$('replayAnimationBtn'),openBtn=$('rrV45OpenBtn');
    if(openBtn&&replay){const text=(replay.textContent||'').toLocaleUpperCase('tr-TR');const isOpen=text.includes('AÇIK');openBtn.textContent='Ürün Durumları';openBtn.classList.toggle('on',isOpen);openBtn.classList.toggle('off',!isOpen);}
    const expand=$('rrV45ExpandBtn');if(expand){const fs=document.body.classList.contains('preview-expanded');expand.classList.toggle('on',fs);expand.textContent=fs?'Normal':'Büyüt';}
    qa('[data-legacy-id]',sideToolbar).forEach(b=>b.disabled=!$(b.dataset.legacyId)||$(b.dataset.legacyId).disabled);
    updateDetails();window.PLMRV12UI?.sync();
  }

  function bindSync(){
    ['freedomWidthInput','freedomDepthInput','freedomHeightInput','pergoSystemCountInput','freedomPanelCountInput','motorInput','systemColorValue'].forEach(id=>{const node=$(id);if(!node)return;node.addEventListener('input',updateDetails);node.addEventListener('change',updateDetails);});
    const observeTargets=['mode2DBtn','mode3DBtn','replayAnimationBtn','systemColorValue','projectCodeValue','plmrProjectDate','toolbarArBtn'].map($).filter(Boolean);
    const observer=new MutationObserver(()=>syncUiState());observeTargets.forEach(node=>observer.observe(node,{attributes:true,childList:true,subtree:true,characterData:true}));
    document.addEventListener('plmr-v12-change',updateDetails);document.addEventListener('plmr:units',updateDetails);document.addEventListener('plmr-zone-filters',updateDetails);
    document.addEventListener('plmr-v16-reset',()=>{closeSettings();sideOpen=true;sideToolbar.classList.add('open');sideToolbar.classList.remove('collapsed');sideToolbar.querySelector('.v33-side-grid').hidden=false;sideToolbar.querySelector('.v33-side-head button').textContent='›';bottomDrawer.classList.add('collapsed');bottomDrawer.style.height='11%';drawerBody.replaceChildren(detailTable());window.PLMRV16UI.reset();updateDetails();});
    document.addEventListener('fullscreenchange',syncUiState);window.addEventListener('resize',()=>window.setTimeout(syncUiState,40));
    const edit=$('rrDetailEditBtn');if(edit)edit.addEventListener('click',()=>clickLegacy('positionEditBtn',{missingMessage:'Poz ölçü editörü kullanılamıyor.'}));
  }

  function init(){
    if(document.body.classList.contains('rr-v45-shell-active'))return;
    const previewWorkspace=$('expandedPreviewWorkspace');
    const parameterPanel=q('.plmr-parameter-panel');
    if(!previewWorkspace||!parameterPanel){console.error('[PLMR V1] Legacy PLMR | Bioclimatic workspace nodes not found.');return;}
    document.body.classList.add('rr-v45-shell-active');
    registerProduct({id:PRODUCT_ID,label:PRODUCT_LABEL,activate(){return true;},deactivate(){return true;}});
    buildShell(previewWorkspace,parameterPanel);
    if(productSelect)productSelect.value=PRODUCT_ID;
    bindSync();syncUiState();
    document.addEventListener('plmr:sketch-tool',e=>{const b=$('rrV45PushPullToolBtn'),active=e.detail.tool==='pushpull';if(b){b.classList.toggle('on',active);b.setAttribute('aria-pressed',String(active));}});
    window.PLMRUnifiedDrawingWorkspaceV4=Object.freeze({
      version:'1.1.0',build:BIO_V1_BUILD,
      registerProduct,activateProduct,
      getActiveProduct:()=>activeProductId,
      listProducts:()=>Array.from(productRegistry.values()).map(({id,label})=>({id,label})),
      getEngineHost:()=>engineHost,
      openSettings,closeSettings,
      refresh:()=>clickLegacy('toolbarRefreshBtn'),
      inspect:()=>({version:'1.1.0',activeProductId,products:Array.from(productRegistry.keys()),samePage:true,engineHostId:engineHost?.id||null})
    });
    document.documentElement.dataset.plmrWorkspace='v45-unified';
    document.documentElement.dataset.plmrPackage='PLMR_BioclimaticConfugurator_V28';
    notify('PLMR | Bioclimatic V26 · çizim araçları hazır.');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>window.setTimeout(init,0),{once:true});else window.setTimeout(init,0);
})();
