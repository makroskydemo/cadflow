(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.PulumurDocumentWorkspace = Object.freeze(api);
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const SCHEMA = 'plmr-document-workspace-v1';
  const MAX_ROWS = 500, MAX_TEXT = 240, MAX_BYTES = 5 * 1024 * 1024;
  const clone = value => JSON.parse(JSON.stringify(value));
  const text = (key, label) => ({ key, label, type: 'text' });
  const number = (key, label, options = {}) => ({ key, label, type: 'number', min: 0, max: 10000000, ...options });
  const quantity = () => number('qty', 'Adet', { min: 1, integer: true });
  const TABLES = Object.freeze({
    quote: { label: 'Fiyat Teklifi', fields: [text('name','Ürün'),text('size','Ölçü'),text('color','Renk'),quantity(),number('unitPrice','Birim Fiyat', { max: 100000000, decimals: 2 })] },
    production: { label: 'Üretim Formu', fields: [text('profile','Profil Adı'),text('code','Profil Kodu'),number('length','Boy (mm)',{min:1}),quantity(),text('surface','Yüzey / RAL'),number('gram','Birim Ağırlık')] },
    'product-list': { label: 'Ürün Listesi', fields: [text('name','Ürün'),text('size','Ölçü'),text('color','Renk'),quantity()] },
    'cut-list': { label: 'Kesim Listesi', fields: [text('profile','Profil'),text('code','Profil Kodu'),number('length','Kesim Boyu (mm)',{min:1}),quantity(),text('angle','Açı'),text('note','Açıklama')] },
    accessories: { label: 'Aksesuar Listesi', fields: [text('name','Aksesuar'),text('code','Kod'),quantity(),text('unit','Birim'),text('note','Açıklama')] },
    stock: { label: 'Stok Profilleri', fields: [text('profile','Profil'),text('code','Profil Kodu'),number('stock','Stok Boyu (mm)',{min:1}),quantity(),number('remaining','Tahmini Kalan (mm)'),text('note','Açıklama')] }
  });
  Object.values(TABLES).forEach(table => { table.fields.forEach(Object.freeze); Object.freeze(table.fields); Object.freeze(table); });
  const SOURCES = Object.freeze({quote:'quote',production:'production','product-list':'productRows','cut-list':'cuts',accessories:'accessories',stock:'stock'});
  function fail(code) { const error = new Error(code); error.code = code; throw error; }
  function quoteCents(rows) {
    let total = 0;
    for (const row of rows) {
      const cents = Math.round(row.values.unitPrice * row.values.qty * 100);
      if (!Number.isSafeInteger(cents) || cents < 0) fail('NUMBER_RANGE');
      total += cents;
      if (!Number.isSafeInteger(total) || total > 100000000000000) fail('NUMBER_RANGE');
    }
    return total;
  }
  function parseNumber(value, locale = 'en') {
    if (typeof value === 'number') { if (!Number.isFinite(value)) fail('NUMBER_INVALID'); return value; }
    const s=String(value).trim();
    const pattern=locale==='tr'?/^-?(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d+)?$/:/^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/;
    if (!pattern.test(s)) fail('NUMBER_INVALID');
    const result=Number(locale==='tr'?s.replace(/\./g,'').replace(',','.'):s.replace(/,/g,''));
    if (!Number.isFinite(result)) fail('NUMBER_INVALID');
    return result;
  }
  function normalize(field, value, locale) {
    if (field.type === 'text') {
      if (typeof value !== 'string' && value != null) fail('TEXT_INVALID');
      const result=String(value ?? '');
      if (result.length>MAX_TEXT || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(result)) fail('TEXT_TOO_LONG');
      return result;
    }
    let result=parseNumber(value,locale);
    if (result<field.min || result>field.max || (field.integer && !Number.isInteger(result))) fail('NUMBER_RANGE');
    if (field.decimals != null) result=Math.round((result+Number.EPSILON)*10**field.decimals)/10**field.decimals;
    return result;
  }
  function sourceRows(data, id) { return id==='quote' ? data.quote.items : data[SOURCES[id]]; }
  function rowValues(source, id) {
    const values={};
    TABLES[id].fields.forEach(field => {
      let value=source[field.key];
      if (id==='quote' && field.key==='unitPrice') value=source.kind==='system'?source.price/Math.max(1,source.qty):source.price;
      if (id==='cut-list' && field.key==='angle') value=source.angle ?? (source.section==='panel'?'90°':'90° / demo');
      if (value==null) value=field.type==='text'?'':field.min;
      // Keep generated numeric precision until the user explicitly changes it.
      values[field.key]=field.type==='number'?parseNumber(value):normalize(field,value);
    });
    return values;
  }
  function makeState(data, selection, sourceKey) {
    if (typeof sourceKey!=='string' || !/^[a-f0-9]{64}$/.test(sourceKey)) fail('SOURCE_INVALID');
    const sheets={};
    selection.forEach(id => {
      if (!TABLES[id]) return;
      const rows=sourceRows(data,id) || [];
      if (rows.length>MAX_ROWS) fail('ROW_LIMIT');
      sheets[id]=rows.map((row,index)=>({id:`${id}-${index+1}`,sourceId:`${id}-${index+1}`,values:rowValues(row,id),userFields:[]}));
    });
    return {schema:SCHEMA,sourceKey,selection:[...selection],sheets,notes:''};
  }
  function readTSV(value) {
    const text=String(value); if(text.length>MAX_BYTES) fail('FILE_TOO_LARGE');
    const rows=[]; let row=[],cell='',quoted=false,closed=false;
    for(let i=0;i<text.length;i++) {
      const char=text[i];
      if(quoted) { if(char==='"'){if(text[i+1]==='"'){cell+='"';i++;}else{quoted=false;closed=true;}}else cell+=char; continue; }
      if(char==='"'&&!cell&&!closed){quoted=true;continue;}
      if(char==='\t'){row.push(cell);cell='';closed=false;continue;}
      if(char==='\n'||char==='\r'){if(char==='\r'&&text[i+1]==='\n')i++;row.push(cell);rows.push(row);row=[];cell='';closed=false;continue;}
      if(closed)fail('PASTE_INVALID'); cell+=char;
    }
    if(quoted)fail('PASTE_INVALID');
    if(cell || row.length || !rows.length){row.push(cell);rows.push(row);}
    return rows;
  }
  function delimited(rows, separator, safeFormula = true) {
    return rows.map(row=>row.map(value=>{
      let s=String(value ?? '');
      if(safeFormula && /^[\s]*[=+@-]/.test(s))s="'"+s;
      return /["\t\r\n,;]/.test(s)||s.includes(separator)?'"'+s.replace(/"/g,'""')+'"':s;
    }).join(separator)).join('\r\n');
  }
  function stable(value) {
    if (Array.isArray(value)) return '['+value.map(stable).join(',')+']';
    if (value && typeof value==='object') return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+stable(value[k])).join(',')+'}';
    return JSON.stringify(value) ?? 'null';
  }
  async function fingerprint(value) {
    if (!globalThis.crypto || !globalThis.crypto.subtle) fail('SOURCE_HASH_UNAVAILABLE');
    const digest=await globalThis.crypto.subtle.digest('SHA-256',new TextEncoder().encode(stable(value)));
    return Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
  }
  class Workspace {
    constructor(data,selection,sourceKey) {
      this.original=makeState(data,selection,sourceKey);this.state=clone(this.original);
      this.undoStack=[];this.redoStack=[];this.nextId=1;
    }
    snapshot(){return clone(this.state);}
    changed(id){return stable(this.state.sheets[id])!==stable(this.original.sheets[id]);}
    isDirty(){return stable(this.state)!==stable(this.original);}
    commit(change){const previous=clone(this.state);try{change();if(this.state.sheets.quote)quoteCents(this.state.sheets.quote);}catch(error){this.state=previous;throw error;}if(stable(previous)===stable(this.state))return;this.undoStack.push(previous);if(this.undoStack.length>20)this.undoStack.shift();this.redoStack=[];}
    rows(id){if(!TABLES[id] || !this.state.sheets[id])fail('SHEET_INVALID');return this.state.sheets[id];}
    row(id,rowId){const row=this.rows(id).find(r=>r.id===rowId);if(!row)fail('ROW_INVALID');return row;}
    newRow(id){const values={};TABLES[id].fields.forEach(f=>{values[f.key]=f.type==='text'?'':f.min;});let key;do{key=`new-${this.nextId++}`;}while(this.rows(id).some(row=>row.id===key));return {id:key,sourceId:null,values,userFields:TABLES[id].fields.map(f=>f.key)};}
    edit(id,rowId,key,value,locale='en'){const field=TABLES[id]?.fields.find(f=>f.key===key);if(!field)fail('FIELD_INVALID');const normalized=normalize(field,value,locale);this.commit(()=>{const row=this.row(id,rowId);if(row.values[key]===normalized)return;row.values[key]=normalized;if(!row.userFields.includes(key))row.userFields.push(key);});}
    add(id,afterId){this.commit(()=>{const rows=this.rows(id);if(rows.length>=MAX_ROWS)fail('ROW_LIMIT');if(afterId)this.row(id,afterId);const at=afterId?rows.findIndex(r=>r.id===afterId)+1:rows.length;rows.splice(at,0,this.newRow(id));});}
    duplicate(id,rowId){this.commit(()=>{const rows=this.rows(id);if(rows.length>=MAX_ROWS)fail('ROW_LIMIT');const value=clone(this.row(id,rowId));value.id=this.newRow(id).id;rows.splice(rows.findIndex(r=>r.id===rowId)+1,0,value);});}
    remove(id,rowId){this.commit(()=>{this.row(id,rowId);this.state.sheets[id]=this.rows(id).filter(row=>row.id!==rowId);});}
    move(id,rowId,delta){this.commit(()=>{const rows=this.rows(id),from=rows.findIndex(r=>r.id===rowId),to=from+delta;if(from<0)fail('ROW_INVALID');if(to<0||to>=rows.length)return;const [row]=rows.splice(from,1);rows.splice(to,0,row);});}
    sort(id,key,descending=false,locale='en'){if(!TABLES[id]?.fields.some(f=>f.key===key))fail('FIELD_INVALID');this.commit(()=>this.rows(id).sort((a,b)=>{const av=a.values[key],bv=b.values[key];return (typeof av==='number'?av-bv:String(av).localeCompare(String(bv),locale))*(descending?-1:1);}));}
    paste(id,rowId,key,tsv,locale='en'){
      const cells=readTSV(tsv),fields=TABLES[id]?.fields;if(!fields)fail('SHEET_INVALID');
      const col=fields.findIndex(f=>f.key===key),start=this.rows(id).findIndex(r=>r.id===rowId);
      if(col<0||start<0)fail('PASTE_INVALID');
      if(start+cells.length>MAX_ROWS||cells.some(r=>col+r.length>fields.length))fail('PASTE_RANGE');
      const parsed=cells.map(row=>row.map((value,i)=>normalize(fields[col+i],value,locale)));
      this.commit(()=>{const rows=this.rows(id);parsed.forEach((values,i)=>{if(!rows[start+i])rows.push(this.newRow(id));values.forEach((value,j)=>{const row=rows[start+i],name=fields[col+j].key;row.values[name]=value;if(!row.userFields.includes(name))row.userFields.push(name);});});});
    }
    notes(value){if(typeof value!=='string'||value.length>2000)fail('NOTES_TOO_LONG');this.commit(()=>{this.state.notes=value;});}
    reset(id){if(!this.original.sheets[id])fail('SHEET_INVALID');this.commit(()=>{this.state.sheets[id]=clone(this.original.sheets[id]);});}
    undo(){if(!this.undoStack.length)return;this.redoStack.push(clone(this.state));this.state=this.undoStack.pop();}
    redo(){if(!this.redoStack.length)return;this.undoStack.push(clone(this.state));this.state=this.redoStack.pop();}
    visible(id,query='',key=''){const q=String(query).toLocaleLowerCase();return this.rows(id).filter(row=>(key?[row.values[key]]:Object.values(row.values)).some(value=>String(value??'').toLocaleLowerCase().includes(q)));}
    totals(id){const rows=this.rows(id);const result={rows:rows.length,qty:0};for(const row of rows){const v=row.values;result.qty+=Number(v.qty)||0;if(id==='production')result.weight=(result.weight||0)+v.length/1000*v.gram*v.qty;if(id==='cut-list')result.length=(result.length||0)+v.length*v.qty;}if(id==='quote')result.amount=quoteCents(rows)/100;return result;}
    exportFile(){return JSON.stringify(this.snapshot(),null,2);}
    importFile(raw){
      if(typeof raw!=='string'||raw.length>MAX_BYTES)fail('FILE_TOO_LARGE');let input;try{input=JSON.parse(raw);}catch(_){fail('FILE_INVALID');}
      if(!input||input.schema!==SCHEMA||input.sourceKey!==this.original.sourceKey||stable(input.selection)!==stable(this.original.selection))fail('SOURCE_MISMATCH');
      if(typeof input.notes!=='string'||input.notes.length>2000||!input.sheets||stable(Object.keys(input.sheets).sort())!==stable(Object.keys(this.original.sheets).sort()))fail('FILE_INVALID');
      const sheets={};
      for(const id of Object.keys(this.original.sheets)){
        const rows=input.sheets[id],ids=new Set(),fields=TABLES[id].fields;
        if(!Array.isArray(rows)||rows.length>MAX_ROWS)fail('ROW_LIMIT');
        sheets[id]=rows.map(row=>{
          if(!row||typeof row.id!=='string'||!/^[-a-zA-Z0-9_]{1,80}$/.test(row.id)||ids.has(row.id)||!row.values||typeof row.values!=='object')fail('FILE_INVALID');ids.add(row.id);
          if(stable(Object.keys(row.values).sort())!==stable(fields.map(f=>f.key).sort()))fail('FIELD_INVALID');
          const source=this.original.sheets[id].find(item=>item.id===row.sourceId);
          if(row.sourceId!==null&&!source)fail('SOURCE_INVALID');
          if(!Array.isArray(row.userFields)||row.userFields.some(key=>!fields.some(f=>f.key===key)))fail('FIELD_INVALID');
          const values={};fields.forEach(field=>{values[field.key]=normalize({...field,decimals:undefined},row.values[field.key]);});
          // Never accept a missing literal-text marker for a changed imported cell.
          const userFields=fields.filter(field=>row.userFields.includes(field.key)||!source||values[field.key]!==source.values[field.key]).map(field=>field.key);
          return {id:row.id,sourceId:row.sourceId,values,userFields};
        });
      }
      this.commit(()=>{this.state.sheets=sheets;this.state.notes=input.notes;});
    }
    applyTo(data){
      const result=clone(data);
      for(const id of Object.keys(this.state.sheets)){
        if(!this.changed(id))continue;
        const original=sourceRows(data,id)||[];
        const rows=this.rows(id).map(row=>{
          const index=this.original.sheets[id].findIndex(r=>r.id===row.sourceId);
          const value={...(index>=0?clone(original[index]):{}),...clone(row.values),documentRow:true,documentUserFields:[...row.userFields]};
          if(id==='production')value.totalKg=value.length/1000*value.gram*value.qty;
          if(id==='quote'){value.price=value.unitPrice;value.documentLineTotal=Math.round(value.unitPrice*value.qty*100)/100;}
          return value;
        });
        if(id==='quote'){
          const subtotal=this.totals(id).amount||0;const vat=Math.round(subtotal*20)/100;
          result.quote={...result.quote,items:rows,subtotal,vat,total:Math.round((subtotal+vat)*100)/100};
        }else result[SOURCES[id]]=rows;
      }
      result.documentNotes=this.state.notes;return result;
    }
  }
  return {SCHEMA,MAX_ROWS,MAX_TEXT,MAX_BYTES,TABLES,Workspace,parseNumber,readTSV,delimited,fingerprint,stable};
});
