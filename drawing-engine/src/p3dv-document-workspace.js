(function () {
  'use strict';
  const Core=window.PulumurDocumentWorkspace;
  let active=null;
  const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function open(session) {
    if (!Core) throw new Error('DOCUMENT_WORKSPACE_UNAVAILABLE');
    if(active){active.focus();return;}
    let inputLanguage=session.language()==='en'?'en':'tr';
    let workspace=session.workspace, tableId=Object.keys(workspace.snapshot().sheets)[0]||'',page=0,busy=false,saved=false;
    const widths={}, PAGE_SIZE=40;
    const t=key=>session.translate(key),lang=()=>session.language()==='en'?'en':'tr';
    const dialog=document.createElement('dialog');dialog.className='p3dv-document-workspace';dialog.setAttribute('aria-label',t('Belge Çalışma Alanı'));
    dialog.innerHTML=`<header class="pdw-head"><div><strong data-copy="Belge Çalışma Alanı"></strong><p data-copy="Değişiklikler yalnız bu belgeye uygulanır; çizim ve kesim optimizasyonu değişmez."></p></div><button type="button" data-action="close" data-copy="Kapat"></button></header>
      <nav class="pdw-tabs" aria-label="${escape(t('Tablolar'))}"></nav>
      <div class="pdw-toolbar">
        <label><span data-copy="Ara / Filtrele"></span><input type="search" data-search maxlength="240"></label>
        <label><span data-copy="Sütun"></span><select data-filter></select></label>
        <button type="button" data-action="add" data-copy="Satır ekle"></button><button type="button" data-action="undo" data-copy="Geri al"></button><button type="button" data-action="redo" data-copy="Yinele"></button>
        <button type="button" data-action="reset" data-copy="Tabloyu sıfırla"></button><button type="button" data-action="copy" data-copy="Tabloyu kopyala"></button><button type="button" data-action="csv" data-copy="CSV indir"></button>
      </div>
      <p class="pdw-status" role="status" aria-live="polite"></p>
      <div class="pdw-grid" tabindex="-1"></div>
      <div class="pdw-summary"><span data-summary></span><div><button type="button" data-action="previous" data-copy="Önceki"></button><span data-page></span><button type="button" data-action="next" data-copy="Sonraki"></button></div></div>
      <label class="pdw-notes"><span data-copy="Belge notları"></span><textarea data-notes maxlength="2000" rows="2"></textarea></label>
      <footer class="pdw-foot"><div><button type="button" data-action="save" data-copy="Taslağı indir"></button><button type="button" data-action="load" data-copy="Taslak dosyası aç"></button><input type="file" accept=".json,application/json" data-draft-file hidden><small data-copy="Taslak dosyası bu cihazdan indirilir; buluta kaydedilmez."></small></div><div><button type="button" data-action="regenerate" data-copy="Projeden yeniden oluştur"></button><button type="button" class="pdw-primary" data-action="pdf" data-copy="PDF Oluştur"></button></div></footer>`;
    document.body.appendChild(dialog);active=dialog;
    const $=selector=>dialog.querySelector(selector);
    const status=(message,error=false)=>{const node=$('.pdw-status');node.textContent=message;node.classList.toggle('is-error',error);};
    function message(error){const codes={DOCUMENT_ROW_TOO_TALL:'Hücre metni tek PDF sayfasına sığmıyor. Metni kısaltın veya satırlara bölün.',NUMBER_INVALID:'Geçerli bir sayı girin.',NUMBER_RANGE:'Sayı izin verilen aralıkta değil.',TEXT_INVALID:'Metin değeri geçersiz.',TEXT_TOO_LONG:'Hücre en fazla 240 karakter olabilir.',ROW_LIMIT:'Bir tabloda en fazla 500 satır olabilir.',PASTE_RANGE:'Yapıştırılacak alan tablo sınırlarını aşıyor.',PASTE_INVALID:'Yapıştırılan tablo biçimi geçersiz.',SOURCE_INVALID:'Taslak kaynağı geçersiz.',SOURCE_MISMATCH:'Taslak bu proje ve belge seçimiyle eşleşmiyor.',SELECTION_CHANGED:'Belge seçimi değişti. Alanı yeniden açın.',SOURCE_CHANGED:'Proje değişti. Belgeyi projeden yeniden oluşturun.',SESSION_CHANGED:'Oturum değişti. Belge alanını yeniden açın.',FILE_TOO_LARGE:'Taslak dosyası en fazla 5 MB olabilir.',FILE_INVALID:'Taslak dosyası geçersiz.',FIELD_INVALID:'Taslak sütunları geçersiz.',NOTES_TOO_LONG:'Belge notu en fazla 2000 karakter olabilir.',SOURCE_HASH_UNAVAILABLE:'Belge doğrulaması için güvenli HTTPS bağlantısı gerekir.'};return t(codes[error.code||error.message]||'İşlem tamamlanamadı.');}
    function download(content,name,type){const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
    function numeric(value,key){return new Intl.NumberFormat(lang()==='tr'?'tr-TR':'en-GB',{maximumFractionDigits:key==='unitPrice'?6:6}).format(value);}
    function cellValue(row,field){return field.type==='number'?numeric(row.values[field.key],field.key):session.displayCell(tableId,row,field.key);}
    function currentRows(){if(!tableId)return [];const query=$('[data-search]').value.toLocaleLowerCase(lang()),key=$('[data-filter]').value;const fields=Core.TABLES[tableId].fields.filter(field=>!key||field.key===key);return workspace.rows(tableId).filter(row=>fields.some(field=>String(cellValue(row,field)).toLocaleLowerCase(lang()).includes(query)));}
    function hasInvalid(){const input=$('[data-invalid]');if(input){input.focus();status(t('Önce işaretli hücreyi düzeltin.'),true);return true;}return false;}
    function commitInput(input){
      if(!input||!input.matches('[data-cell]'))return true;
      if(input.value===input.dataset.displayed)return !input.hasAttribute('data-invalid');
      try{workspace.edit(tableId,input.dataset.row,input.dataset.key,input.value,inputLanguage);input.removeAttribute('data-invalid');input.setCustomValidity('');input.dataset.displayed=input.value;saved=false;summary();status(t('Belge değişikliği uygulandı.'));return true;}
      catch(error){input.setAttribute('data-invalid','true');input.setCustomValidity(message(error));status(message(error),true);return false;}
    }
    function commitNotes(){try{const value=$('[data-notes]').value;if(value!==workspace.state.notes){workspace.notes(value);saved=false;}return true;}catch(error){status(message(error),true);return false;}}
    function commitActive(){for(const input of dialog.querySelectorAll('[data-cell]'))if(!commitInput(input))return false;return commitNotes()&&!hasInvalid();}
    function setBusy(value){busy=value;dialog.setAttribute('aria-busy',String(value));dialog.querySelectorAll('button,input,textarea,select').forEach(node=>{node.disabled=value;});if(!value)render();}
    function summary(){
      if(!tableId){$('[data-summary]').textContent=t('Bu seçimde düzenlenebilir tablo yok.');return;}
      const sum=workspace.totals(tableId);let label=`${sum.rows} ${t('satır')} · ${t('Toplam adet')}: ${numeric(sum.qty)}`;
      if(sum.amount!=null)label+=` · ${t('Ara toplam')}: ${new Intl.NumberFormat(lang()==='tr'?'tr-TR':'en-GB',{style:'currency',currency:'EUR'}).format(sum.amount)}`;
      if(sum.weight!=null)label+=` · ${t('Toplam Kg')}: ${numeric(sum.weight)}`;
      if(sum.length!=null)label+=` · ${t('Toplam boy (mm)')}: ${numeric(sum.length)}`;
      $('[data-summary]').textContent=label;
      $('[data-action="undo"]').disabled=busy||!workspace.undoStack.length;
      $('[data-action="redo"]').disabled=busy||!workspace.redoStack.length;
    }
    function renderTabs(){
      $('.pdw-tabs').innerHTML=Object.keys(workspace.snapshot().sheets).map(id=>`<button type="button" data-table="${id}" aria-pressed="${id===tableId}">${escape(t(Core.TABLES[id].label))}</button>`).join('');
      const previous=$('[data-filter]').value;
      $('[data-filter]').innerHTML=`<option value="">${escape(t('Tüm sütunlar'))}</option>`+(tableId?Core.TABLES[tableId].fields.map(field=>`<option value="${field.key}">${escape(t(field.label))}</option>`).join(''):'');
      if(tableId&&Core.TABLES[tableId].fields.some(f=>f.key===previous))$('[data-filter]').value=previous;
    }
    function render(){
      inputLanguage=lang();
      renderTabs();
      const rows=currentRows(),totalPages=Math.max(1,Math.ceil(rows.length/PAGE_SIZE));page=Math.min(page,totalPages-1);
      $('[data-page]').textContent=`${page+1} / ${totalPages}`;
      $('[data-action="previous"]').disabled=busy||page===0;$('[data-action="next"]').disabled=busy||page+1>=totalPages;
      for(const action of ['add','reset','copy','csv'])$(`[data-action="${action}"]`).disabled=busy||!tableId;
      if(!tableId){$('.pdw-grid').innerHTML=`<p>${escape(t('Bu seçimde düzenlenebilir tablo yok.'))}</p>`;summary();return;}
      const fields=Core.TABLES[tableId].fields,visible=rows.slice(page*PAGE_SIZE,(page+1)*PAGE_SIZE);
      $('.pdw-grid').innerHTML=`<table><colgroup><col style="width:52px">${fields.map(field=>`<col style="width:${widths[tableId+':'+field.key]|| (field.type==='number'?130:190)}px">`).join('')}<col style="width:170px"></colgroup><thead><tr><th>#</th>${fields.map(field=>`<th><div><span>${escape(t(field.label))}</span><button type="button" data-sort="${field.key}" data-desc="false" aria-label="${escape(t('Artan sırala')+' · '+t(field.label))}">↑</button><button type="button" data-sort="${field.key}" data-desc="true" aria-label="${escape(t('Azalan sırala')+' · '+t(field.label))}">↓</button></div><input type="range" min="100" max="420" step="10" data-width="${field.key}" value="${widths[tableId+':'+field.key]||(field.type==='number'?130:190)}" aria-label="${escape(t('Sütun genişliği')+' · '+t(field.label))}"></th>`).join('')}<th>${escape(t('Satır işlemleri'))}</th></tr></thead><tbody>${visible.map((row,index)=>`<tr data-row="${row.id}"><th>${page*PAGE_SIZE+index+1}</th>${fields.map(field=>{const value=cellValue(row,field);return `<td><input data-cell data-row="${row.id}" data-key="${field.key}" value="${escape(value)}" data-displayed="${escape(value)}" ${field.type==='number'?'inputmode="decimal"':'maxlength="240"'} aria-label="${escape(t(field.label)+' · '+(page*PAGE_SIZE+index+1))}"></td>`;}).join('')}<td class="pdw-row-actions"><button type="button" data-action="duplicate" data-row="${row.id}" aria-label="${escape(t('Satırı çoğalt'))}">⧉</button><button type="button" data-action="up" data-row="${row.id}" aria-label="${escape(t('Yukarı taşı'))}" ${$('[data-search]').value?'disabled':''}>↑</button><button type="button" data-action="down" data-row="${row.id}" aria-label="${escape(t('Aşağı taşı'))}" ${$('[data-search]').value?'disabled':''}>↓</button><button type="button" data-action="delete" data-row="${row.id}" aria-label="${escape(t('Satırı sil'))}">×</button></td></tr>`).join('')}</tbody></table>${visible.length?'':`<p>${escape(t('Satır bulunamadı.'))}</p>`}`;
      summary();$('[data-notes]').value=workspace.snapshot().notes;
    }
    function refreshLanguage(){if(busy)return;if(!commitActive())return;dialog.querySelectorAll('[data-copy]').forEach(node=>{node.textContent=t(node.dataset.copy);});dialog.setAttribute('aria-label',t('Belge Çalışma Alanı'));render();}
    async function action(button){
      if(busy||!button)return;
      const name=button.dataset.action;
      if(name==='close'){const valid=commitActive();if((workspace.isDirty()&&!saved||!valid)&&!window.confirm(t('Kaydedilmemiş belge değişiklikleri kapatılsın mı?')))return;dialog.close();return;}
      if(!commitActive())return;
      try{
        if(!session.ownerValid())throw new Error('SESSION_CHANGED');
        if(name==='add'){workspace.add(tableId);$('[data-search]').value='';page=Math.floor((workspace.rows(tableId).length-1)/PAGE_SIZE);}
        else if(name==='delete')workspace.remove(tableId,button.dataset.row);
        else if(name==='duplicate')workspace.duplicate(tableId,button.dataset.row);
        else if(name==='up'||name==='down')workspace.move(tableId,button.dataset.row,name==='up'?-1:1);
        else if(name==='undo')workspace.undo();else if(name==='redo')workspace.redo();
        else if(name==='reset'){if(!window.confirm(t('Bu tablo üretilen ilk verilere dönsün mü?')))return;workspace.reset(tableId);}
        else if(name==='previous'){page--;render();return;}else if(name==='next'){page++;render();return;}
        else if(name==='save'){download(workspace.exportFile(),'PLMR-belge-taslagi.json','application/json');saved=true;status(t('Taslak dosyası indirildi.'));return;}
        else if(name==='load'){$('[data-draft-file]').click();return;}
        else if(name==='csv'||name==='copy'){
          const fields=Core.TABLES[tableId].fields;
          const rows=[fields.map(f=>t(f.label)),...currentRows().map(row=>fields.map(f=>cellValue(row,f)))];
          if(name==='copy'){await navigator.clipboard.writeText(Core.delimited(rows,'\t'));status(t('Tablo kopyalandı.'));}
          else download('\ufeff'+Core.delimited(rows,lang()==='tr'?';':','),'PLMR-'+tableId+'.csv','text/csv;charset=utf-8');return;
        }else if(name==='pdf'){
          setBusy(true);status(t('PDF Hazırlanıyor'));
          try{await session.exportPDF(workspace);status(t('PDF Oluşturuldu'));}
          finally{setBusy(false);refreshLanguage();}return;
        }else if(name==='regenerate'){
          if(workspace.isDirty()&&!window.confirm(t('Belge değişiklikleri yeni proje verileriyle değiştirilsin mi?')))return;
          setBusy(true);try{const next=await session.regenerate();session=next;workspace=next.workspace;tableId=Object.keys(workspace.snapshot().sheets)[0]||'';page=0;status(t('Belge projeden yeniden oluşturuldu.'));}finally{setBusy(false);refreshLanguage();}
        }
        saved=false;render();
      }catch(error){status(message(error),true);}
    }
    dialog.addEventListener('click',event=>{
      const tab=event.target.closest('[data-table]');if(tab&&!busy&&commitActive()){tableId=tab.dataset.table;page=0;$('[data-search]').value='';render();return;}
      const sort=event.target.closest('[data-sort]');if(sort&&!busy&&commitActive()){try{workspace.sort(tableId,sort.dataset.sort,sort.dataset.desc==='true',lang());saved=false;render();}catch(error){status(message(error),true);}return;}
      void action(event.target.closest('[data-action]'));
    });
    dialog.addEventListener('change',event=>{
      if(event.target.matches('[data-cell]'))commitInput(event.target);
      if(event.target.matches('[data-notes]'))commitNotes();
      if(event.target.matches('[data-filter]')&&commitActive()){page=0;render();}
    });
    $('[data-search]').addEventListener('input',()=>{if(!commitActive())return;page=0;render();});
    dialog.addEventListener('input',event=>{if(event.target.dataset.width){const fields=Core.TABLES[tableId].fields,index=fields.findIndex(f=>f.key===event.target.dataset.width);widths[tableId+':'+event.target.dataset.width]=Number(event.target.value);$('.pdw-grid').querySelectorAll('col')[index+1].style.width=event.target.value+'px';}});
    dialog.addEventListener('paste',event=>{const input=event.target;if(!input.matches('[data-cell]')||busy)return;const value=event.clipboardData?.getData('text/plain');if(!value||!/[\t\n\r]/.test(value))return;event.preventDefault();if($('[data-search]').value){status(t('Tablo yapıştırmak için filtreyi temizleyin.'),true);return;}try{if(!session.ownerValid())throw new Error('SESSION_CHANGED');workspace.paste(tableId,input.dataset.row,input.dataset.key,value,lang());saved=false;status(t('Tablo yapıştırıldı.'));render();}catch(error){status(message(error),true);}});
    dialog.addEventListener('keydown',event=>{
      const input=event.target;
      if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='s'){event.preventDefault();void action($('[data-action="save"]'));return;}
      if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='z'&&!input.matches('input,textarea')){event.preventDefault();void action($(`[data-action="${event.shiftKey?'redo':'undo'}"]`));return;}
      if(!input.matches('[data-cell]')||!['Enter','Tab','ArrowUp','ArrowDown'].includes(event.key))return;
      if(!commitInput(input)){event.preventDefault();return;}
      const fields=Core.TABLES[tableId].fields,rows=currentRows().slice(page*PAGE_SIZE,(page+1)*PAGE_SIZE);let row=rows.findIndex(r=>r.id===input.dataset.row),col=fields.findIndex(f=>f.key===input.dataset.key);
      if(event.key==='ArrowUp')row--;else if(event.key==='ArrowDown'||event.key==='Enter')row+=event.shiftKey?-1:1;else{col+=event.shiftKey?-1:1;if(col<0){col=fields.length-1;row--;}if(col>=fields.length){col=0;row++;}}
      if(rows[row]){event.preventDefault();$(`[data-cell][data-row="${rows[row].id}"][data-key="${fields[col].key}"]`).focus();}
    });
    $('[data-draft-file]').addEventListener('change',async event=>{
      const file=event.target.files[0];event.target.value='';if(!file||busy||!commitActive())return;setBusy(true);
      try{if(file.size>Core.MAX_BYTES)throw new Error('FILE_TOO_LARGE');const content=await file.text();if(active!==dialog||!session.ownerValid())throw new Error('SESSION_CHANGED');if(workspace.isDirty()&&!window.confirm(t('Mevcut belge taslak dosyasıyla değiştirilsin mi?')))return;workspace.importFile(content);saved=true;page=0;render();status(t('Taslak dosyası açıldı.'));}catch(error){status(message(error),true);}finally{setBusy(false);refreshLanguage();}
    });
    dialog.addEventListener('cancel',event=>{event.preventDefault();if(!busy)void action($('[data-action="close"]'));});
    const observer=typeof MutationObserver==='function'?new MutationObserver(refreshLanguage):null;
    observer?.observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
    try{if(window.parent!==window)observer?.observe(window.parent.document.documentElement,{attributes:true,attributeFilter:['lang']});}catch(_){}
    dialog.addEventListener('close',()=>{observer?.disconnect();dialog.remove();active=null;session.onClose?.();});
    $('[data-notes]').value=workspace.state.notes;refreshLanguage();dialog.showModal();
  }
  window.P3DVDocumentWorkspaceUI=Object.freeze({open,isOpen:()=>Boolean(active)});
})();
