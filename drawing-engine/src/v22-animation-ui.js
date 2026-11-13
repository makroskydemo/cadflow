(function(){
 'use strict';const C=window.PLMRAnimationCore,$=id=>document.getElementById(id);let selected=[],panel,share,playbar,playerTimer=0,activePlayer=null,previousFocus=null,preview=false,shared=false,previewWindow=null;
 function el(tag,attrs={},children=[]){const n=document.createElement(tag);for(const [k,v]of Object.entries(attrs)){if(k==='text')n.textContent=v;else if(k==='class')n.className=v;else n.setAttribute(k,v);}for(const c of children)n.append(c);return n;}
 function button(text,id,fn){const b=el('button',{type:'button',text,id});b.addEventListener('click',()=>Promise.resolve().then(fn).catch(e=>message(e.message)));return b;}
 function message(text){const n=$('rrV22Message')||$('rrV22PlayerStatus');if(n)n.textContent=text;}
 function viewer(){const api=window.PLMRV24Workspace?.viewer()||$('viewerFrame')?.contentWindow?.__PLMR_ANIMATION_VIEWER__;if(!api||!api.isReady())throw Error('3D sahne henüz hazır değil. Biraz sonra tekrar deneyin.');return api;}
 function threeD(){if(window.PLMRV24Workspace?.active())window.PLMRV24Workspace.mode('3D');else window.__P3DV_HOST_BRIDGE__.setDrawingMode('3d');}
 async function waitReady(previous=null){const end=Date.now()+20000;while(Date.now()<end){try{const v=viewer();if(v!==previous)return v;}catch(_){}await new Promise(r=>setTimeout(r,100));}throw Error('3D sahne yüklenemedi. Sayfayı yenileyip tekrar deneyin.');}
 function capture(){return C.camera(viewer().freezeCamera());}
 function changed(){renderList();const a=$('rrV22AddScene');if(a)a.disabled=selected.length>=C.MAX_SCENES;}
 function renderList(){const list=$('rrV22SceneList');if(!list)return;list.replaceChildren();selected.forEach((s,i)=>{
  const row=el('li',{'data-scene':i},[el('span',{class:'plmr-scene-number',text:String(i+1)}),button('Git','rrV22Goto'+i,()=>viewer().showCamera(s.camera)),button('Güncelle','rrV22Update'+i,()=>{s.camera=capture();message('Sahnenin kamera açısı güncellendi.');}),button('↑','rrV22Up'+i,()=>{if(i){[selected[i-1],selected[i]]=[selected[i],selected[i-1]];changed();}}),button('Sil','rrV22Delete'+i,()=>{selected.splice(i,1);changed();})]);row.querySelector('#rrV22Up'+i).disabled=i===0;list.append(row);
 });$('rrV22SceneCount').textContent=selected.length+' / 5 sahne';$('rrV22Preview').disabled=!selected.length;
 }
 function closeScenes(){if(preview)stopPreview();if(panel)panel.hidden=true;previousFocus?.focus();}
 function ensurePanel(){if(panel)return;panel=el('aside',{id:'rrV22ScenesPanel',class:'plmr-animation-panel',hidden:'',role:'dialog','aria-label':'Animasyon sahneleri'});
  const close=button('×','rrV22CloseScenes',closeScenes);close.setAttribute('aria-label','Sahneleri kapat');
  panel.append(el('header',{},[el('strong',{text:'Sahneleri Seç'}),close]),el('p',{text:'3D görünümü istediğiniz açıya çevirin, ardından Mevcut Açıyı Ekle’ye basın. En fazla 5 açı seçebilirsiniz.'}),el('small',{id:'rrV22SceneCount'}),el('ol',{id:'rrV22SceneList'}),el('div',{class:'plmr-animation-actions'},[button('Mevcut Açıyı Ekle','rrV22AddScene',()=>{if(selected.length>=5)throw Error('En fazla 5 sahne seçebilirsiniz.');selected.push({name:'Sahne '+(selected.length+1),camera:capture()});changed();message('Kamera açısı eklendi. Görüntü dosyası oluşturulmadı.');}),button('Önizle','rrV22Preview',startPreview)]),el('p',{id:'rrV22Message',role:'status','aria-live':'polite'}),el('small',{text:'Sahne açıları bu sekmede tutulur. PDF görüntülerinden bağımsızdır; sayfa yenilenirse yeniden seçilir.'}));document.body.append(panel);
 }
 function openScenes(){if(window.__PLMR_ANIMATION_READONLY__)return;threeD();ensurePanel();previousFocus=document.activeElement;panel.hidden=false;changed();$('rrV22AddScene').focus();}
 const uiText=value=>window.PLMRLocale?.t(value)||value;
 const phaseNames={'closed':'Hazırlık','canopy-open':'Tavan ve öndeki Zip açılıyor','sides-open':'Yan ürünler açılıyor','open-hold':'Açık görünüm','sides-close':'Yan ürünler kapanıyor','canopy-close':'Tavan ve öndeki Zip kapanıyor','closed-hold':'Kapalı görünüm','transition':'Sonraki sahneye geçiş'};
 function playbackButton(text,id,icon,run){
  const control=button('',id,()=>{if(activePlayer){run(activePlayer);updatePlayer();}});
  control.classList.add('plmr-playback-button');
  control.append(el('span',{class:'plmr-playback-icon is-'+icon,'aria-hidden':'true',...(icon==='restart'?{text:'↺'}:{})}));
  const label=uiText(text);control.setAttribute('aria-label',label);control.title=label;
  return control;
 }
 function player(){
  if(playbar)return;
  playbar=el('section',{id:'rrV22Player',class:'plmr-animation-player',hidden:'','aria-label':uiText('3D sunum oynatıcısı')});
  const seek=el('input',{type:'range',id:'rrV22Seek',min:'0',max:'100',step:'10',value:'0','aria-label':uiText('Sunum zamanı')});
  seek.addEventListener('input',()=>{activePlayer?.seek(Number(seek.value));updatePlayer();});
  playbar.append(el('strong',{id:'rrV22PlayerTitle',text:uiText('3D Sistem Sunumu')}),
   el('div',{class:'plmr-animation-actions'},[
    playbackButton('Başlat','rrV22Play','play',v=>v.play()),
    playbackButton('Duraklat','rrV22Pause','pause',v=>v.pause()),
    playbackButton('Baştan','rrV22Restart','restart',v=>{v.seek(0);v.play();}),
    button('Kapat','rrV22Stop',stopPreview)
   ]),seek,el('small',{id:'rrV22PlayerStatus'}));
  document.body.append(playbar);window.PLMRI18n?.subscribe(updatePlayer);updatePlayer();
 }
 function updatePlayer(){
  clearTimeout(playerTimer);
  if(!playbar)return;
  const s=activePlayer?.status();
  const seek=$('rrV22Seek');
  $('rrV22Play').disabled=!s?.active||s.playing;
  $('rrV22Pause').disabled=!s?.playing;
  $('rrV22Restart').disabled=seek.disabled=!s?.active;
  if(!s?.active||playbar.hidden)return;
  const max=String(s.duration),position=String(s.time);
  if(seek.max!==max)seek.max=max;
  if(document.activeElement!==seek&&seek.value!==position)seek.value=position;
  const status=$('rrV22PlayerStatus');
  const description=`${s.scene+1} / ${selected.length} · ${uiText(phaseNames[s.phase]||'')} · ${Math.floor(s.time/1000)} / ${Math.ceil(s.duration/1000)} ${uiText('sn')}`;
  if(status.textContent!==description)status.textContent=description;
  if(s.playing)playerTimer=setTimeout(updatePlayer,100);
 }
 function layoutPreview(){if(!previewWindow||previewWindow.hidden)return;const box=$('rrV23PreviewScreen').getBoundingClientRect();let changed=false;for(const [k,v]of Object.entries({x:box.x,y:box.y,w:box.width,h:box.height})){const key='--plmr-preview-'+k,value=v+'px';if(document.body.style.getPropertyValue(key)!==value){document.body.style.setProperty(key,value);changed=true;}}if(changed)window.__P3DV_HOST_BRIDGE__.resize();}
 function ensurePreviewWindow(){if(previewWindow)return;previewWindow=el('div',{id:'rrV23PreviewWindow',class:'plmr-animation-preview-backdrop',hidden:''});const close=button('×','rrV23PreviewClose',stopPreview);close.setAttribute('aria-label','Önizlemeyi kapat');const dialog=el('section',{class:'plmr-animation-window',role:'dialog','aria-modal':'true','aria-label':'3D animasyon önizleme'},[el('header',{},[el('strong',{text:'3D Sunum'}),close]),el('div',{id:'rrV23PreviewScreen',class:'plmr-animation-screen'})]);previewWindow.append(dialog);document.body.append(previewWindow);}
 window.addEventListener('resize',()=>{if(preview)requestAnimationFrame(layoutPreview);});
 async function startPreview(){
 const operation=window.PLMRProcess?.begin("Animasyon hazırlanıyor…");
 try {C.scenes(selected);threeD();const v=await waitReady();player();v.begin(selected);activePlayer=v;ensurePreviewWindow();preview=true;document.body.classList.add('plmr-animation-preview-active');panel.hidden=true;playbar.hidden=false;previewWindow.hidden=false;layoutPreview();v.play();updatePlayer();$('rrV23PreviewClose').focus();
 } finally { operation?.end(); }
}
 function stopPreview(){preview=false;if(previewWindow)previewWindow.hidden=true;document.body.classList.remove('plmr-animation-preview-active');window.__P3DV_HOST_BRIDGE__.resize();activePlayer?.stop();activePlayer=null;clearTimeout(playerTimer);if(playbar)playbar.hidden=true;if(panel&&!shared){panel.hidden=false;changed();}}
 function ensureShare(){if(share)return;const backdrop=el('div',{class:'plmr-animation-backdrop',id:'rrV22ShareBackdrop',hidden:''});share=backdrop;
  const modal=el('section',{class:'plmr-animation-share',role:'dialog','aria-modal':'true','aria-label':'Animasyon paylaş'}),output=el('input',{id:'rrV22ShareUrl',type:'text',readonly:'','aria-label':'Paylaşım bağlantısı'});
  modal.append(el('header',{},[el('strong',{text:'Animasyon Paylaş'}),button('×','rrV22ShareClose',()=>{share.hidden=true;previousFocus?.focus();})]),el('p',{text:'Bağlantı, projenin şu anki durumunu gösterir. Sonradan yaptığınız değişiklikler bu sunumu değiştirmez.'}),el('p',{text:'Bağlantıya sahip kişiler 3D sunumu açabilir. Görüntü veya video kaydedilmez.'}),el('label',{text:'Sunum adı'},[el('input',{id:'rrV22Title',type:'text',value:uiText('3D Sistem Sunumu'),maxlength:'100'})]),button('Bağlantı Oluştur','rrV22CreateShare',createShare),output,el('div',{class:'plmr-animation-actions'},[button('Bağlantıyı Kopyala','rrV22CopyShare',async()=>{if(!output.value)return;try{await navigator.clipboard.writeText(output.value);$('rrV22ShareStatus').textContent='Bağlantı kopyalandı.';}catch(_){output.focus();output.select();$('rrV22ShareStatus').textContent='Bağlantı seçildi. Kopyalayıp paylaşabilirsiniz.';}}),el('a',{id:'rrV22OpenShare',target:'_blank',rel:'noopener',text:'Sunumu Aç'})]),el('p',{id:'rrV22ShareStatus',role:'status','aria-live':'polite'}));backdrop.append(modal);document.body.append(backdrop);
  backdrop.addEventListener('click',e=>{if(e.target===backdrop){backdrop.hidden=true;previousFocus?.focus();}});
 }
 function openShare(){if(!selected.length){openScenes();message('Önce en az bir kamera açısı ekleyin.');return;}if(preview)stopPreview();ensureShare();previousFocus=document.activeElement;share.hidden=false;$('rrV22ShareUrl').value='';$('rrV22OpenShare').removeAttribute('href');$('rrV22ShareStatus').textContent='';$('rrV22CreateShare').focus();}
 async function encodedLink(data){
  const bytes=new TextEncoder().encode(JSON.stringify(data));let packed=bytes,prefix='j.';
  if(typeof CompressionStream==='function'){packed=new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer());prefix='g.';}
  let binary='';for(const b of packed)binary+=String.fromCharCode(b);const token=prefix+btoa(binary).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
  if(token.length>120000)throw Error('Bu proje bağlantıya sığmıyor. Kısa bağlantı servisini bağlayın.');
  const url=new URL('index.html',location.href);url.search='?presentation=1';url.hash='data='+token;return url.href;
 }
 async function shareConfiguration(){
  const config=window.PLMR_ANIMATION_SHARE_CONFIG||{};
  return config.load?config.load():config;
 }
 async function createShare(){
 const operation=window.PLMRProcess?.begin("Paylaşım bağlantısı oluşturuluyor…");
 try {
  const b=$('rrV22CreateShare');b.disabled=true;$('rrV22ShareUrl').value='';$('rrV22OpenShare').removeAttribute('href');try{const payload=C.validate(C.create({...window.PLMRV15Project.capture(),v24ActiveProduct:window.PLMRV24Workspace?.active()||null},selected,$('rrV22Title').value),window.PLMRV15Core),config=await shareConfiguration(),endpoint=new URL(config.endpoint||'./api/animation-shares',location.href);let link;
   $('rrV22ShareStatus').textContent='Bağlantı hazırlanıyor…';
   const token=typeof config.getAccessToken==='function'?await config.getAccessToken():null,headers={'Content-Type':'application/json'};if(config.publicKey)headers.apikey=config.publicKey;if(token)headers.Authorization='Bearer '+token;
   let response;if(config.mode==='inline'||location.protocol==='file:'){response={status:404};}else try{response=await fetch(endpoint,{method:'POST',headers,body:JSON.stringify(config.mode==='cloud'?{action:'share_create',companyId:config.getCompanyId?.(),presentation:payload}:payload),signal:AbortSignal.timeout(15000)});}catch(e){throw Error('Paylaşım servisine ulaşılamadı. Bağlantı oluşturulmadı; tekrar deneyin.');}
   if(response.status===404||response.status===405||response.status===501){if(config.mode==='cloud')throw Error('Kısa bağlantı servisi hazır değil. Supabase kurulumunu tamamlayın.');link=await encodedLink(payload);$('rrV22ShareStatus').textContent='Sunum hazır. Bu bağlantı proje verisini içerdiği için uzundur. Kısa bağlantı için paylaşım servisi bağlanmalıdır.';}
   else{const data=await response.json();if(!response.ok)throw Error(data.error||'Paylaşım bağlantısı oluşturulamadı.');if(!/^[a-f0-9]{32}$/.test(data.id))throw Error('Paylaşım yanıtı geçersiz.');const url=new URL('index.html',location.href);url.search='?presentation=1';url.hash='share='+data.id;link=url.href;$('rrV22ShareStatus').textContent='Bağlantı hazır. '+(data.expiresAt?'Son kullanım: '+new Date(data.expiresAt).toLocaleDateString('en-GB')+'.':'');}
   $('rrV22ShareUrl').value=link;$('rrV22OpenShare').href=link;
  }catch(e){$('rrV22ShareStatus').textContent=e.message;}finally{b.disabled=false;}
 
 } finally { operation?.end(); }
}
 async function decodeLink(token){
  if(token.length>120000||!/^([gj])\.[A-Za-z0-9_-]+$/.test(token))throw Error('Sunum bağlantısı geçersiz.');
  const raw=atob(token.slice(2).replaceAll('-','+').replaceAll('_','/')),bytes=Uint8Array.from(raw,c=>c.charCodeAt(0));let stream=new Blob([bytes]).stream();
  if(token.startsWith('g.')){if(typeof DecompressionStream!=='function')throw Error('Bu bağlantı için güncel bir tarayıcı kullanın.');stream=stream.pipeThrough(new DecompressionStream('gzip'));}
  const reader=stream.getReader(),parts=[];let size=0;try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>C.MAX_BYTES){await reader.cancel();throw Error('Sunum verisi çok büyük.');}parts.push(value);}}finally{reader.releaseLock();}
  return JSON.parse(await new Blob(parts).text());
 }
 async function openPresentation(){
  shared=true;player();playbar.hidden=false;$('rrV22Stop').hidden=true;$('rrV22PlayerStatus').textContent='3D sunum yükleniyor…';
  try{const params=new URLSearchParams(location.hash.slice(1)),id=params.get('share');let raw;
   if(id){if(!/^[a-f0-9]{32}$/.test(id))throw Error('Sunum bağlantısı geçersiz.');const config=await shareConfiguration();const url=new URL(config.endpoint||'./api/animation-shares',location.href);url.pathname=url.pathname.replace(/\/$/,'')+'/'+id;const response=await fetch(url,{headers:config.publicKey?{apikey:config.publicKey}:{},signal:AbortSignal.timeout(15000)});const data=await response.json();if(!response.ok)throw Error(data.error||'Sunum bulunamadı veya süresi doldu.');raw=data.presentation;}
   else if(params.get('data'))raw=await decodeLink(params.get('data'));else throw Error('Sunum bağlantısı eksik.');
   const data=C.validate(raw,window.PLMRV15Core);selected=data.scenes;const previous=$('viewerFrame')?.contentWindow?.__PLMR_ANIMATION_VIEWER__||null;window.__P3DV_HOST_BRIDGE__.importProject(data.snapshot);if(data.snapshot.v24ActiveProduct)await window.PLMRV24Workspace.activate(data.snapshot.v24ActiveProduct);threeD();selected=data.scenes;const v=await waitReady(previous);v.begin(selected);activePlayer=v;$('rrV22PlayerTitle').setAttribute('data-user-content','');$('rrV22PlayerTitle').textContent=data.title;updatePlayer();
  }catch(e){$('rrV22PlayerStatus').textContent=e.message;$('rrV22Play').disabled=true;$('rrV22Pause').disabled=true;$('rrV22Restart').disabled=true;$('rrV22Seek').disabled=true;}
 }
 document.addEventListener('keydown',e=>{if((preview||shared)&&!e.target.closest('.plmr-animation-player,.plmr-animation-window')&&e.key!=='Escape'){e.stopImmediatePropagation();e.preventDefault();return;}if(e.key==='Escape'){if(share&&!share.hidden){share.hidden=true;previousFocus?.focus();}else if(preview)stopPreview();else if(panel&&!panel.hidden)closeScenes();}if(e.target.closest('.plmr-animation-panel,.plmr-animation-share,.plmr-animation-player,.plmr-animation-window'))e.stopPropagation();},true);
 window.addEventListener('pagehide',()=>{clearTimeout(playerTimer);activePlayer?.stop();activePlayer=null;});
 const workspaceScenes=new Map();let previousWorkspace='rolling-roof';document.addEventListener('plmr:workspace-product-changed',e=>{if(preview)stopPreview();workspaceScenes.set(previousWorkspace,selected);previousWorkspace=e.detail.productId;selected=workspaceScenes.get(previousWorkspace)||[];if(panel)changed();});
 window.PLMRAnimationUI=Object.freeze({openScenes,openShare,inspect:()=>({sceneCount:selected.length,scenes:C.clone(selected),preview,readOnly:shared})});
 if(window.__PLMR_ANIMATION_READONLY__){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',openPresentation,{once:true});else openPresentation();}
})();
