/* Frame-only guided layouts, using the same form and button language as pose editing. */
(function(){'use strict';const C=window.PLMRV14Layouts,$=id=>document.getElementById(id);let dialog=null,current=null,environment='none',last={single:{width:6000,depth:4000,height:3000,columns:1,rows:1},equal:{width:12000,depth:4000,height:3000,columns:3,rows:1},variable:{width:'4000;5000;3000',depth:'4000;5000;3500',height:3000,columns:3,rows:1},grid:{width:12000,depth:8000,height:3000,columns:3,rows:2},l:{width:12000,depth:12000,height:3000,columns:3,rows:3},u:{width:12000,depth:12000,height:3000,columns:3,rows:3}};
function node(tag,attrs={},text=''){const n=document.createElement(tag);for(const[k,v]of Object.entries(attrs)){if(k==='class')n.className=v;else n.setAttribute(k,v);}if(text)n.textContent=text;return n;}
function button(text,fn,id){const b=node('button',{type:'button',...(id?{id}:{})},text);b.onclick=fn;return b;}
function close(){dialog?.remove();dialog=null;current=null;}
const lengthFields=new Set(['width','depth','height','parapetHeight']);
function convert(value,fn){return String(value??'').split(';').map(fn).join(';');}
function measure(mm,unit){return unit==='mm'?String(Math.round(mm)):(mm/window.PLMRUnits.mmPerUnit[unit]).toFixed(2);}
function frameSvg(plan,large=false,unit='mm'){const b=plan.bounds,pad=large?600:360,W=b.maxX-b.minX,H=b.maxZ-b.minZ,stroke=large?70:110;let svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="'+[b.minX-pad,b.minZ-pad,W+pad*2,H+pad*2].join(' ')+'" aria-label="Open-frame layout plan" role="img">';for(const c of plan.cells){const x=c.x-c.width/2,z=c.z-c.depth/2;svg+='<rect x="'+x+'" y="'+z+'" width="'+c.width+'" height="'+c.depth+'" fill="none" stroke="#477185" stroke-width="'+stroke+'"'+(plan.id==='equal'?' stroke-dasharray="240 120"':'')+'/>';for(const X of [x,x+c.width])for(const Z of [z,z+c.depth])svg+='<rect x="'+(X-85)+'" y="'+(Z-85)+'" width="170" height="170" fill="#334155"/>';if(large)svg+='<text x="'+c.x+'" y="'+c.z+'" font-family="Arial" font-size="210" text-anchor="middle" fill="#236192">'+(c.index+1)+' · '+measure(c.width,unit)+' × '+measure(c.depth,unit)+'</text>';}
for(const e of C.environmentEdges(plan)){const a=e.axis==='x'?[e.from,e.at]:[e.at,e.from],d=e.axis==='x'?[e.to,e.at]:[e.at,e.to];svg+='<line x1="'+a[0]+'" y1="'+a[1]+'" x2="'+d[0]+'" y2="'+d[1]+'" stroke="'+(plan.environment==='parapet'?'#e9a55c':'#9a8d7d')+'" stroke-width="220"/>';}
return svg+'</svg>';}
function open(){window.PLMRV12Commands.cancel();close();dialog=node('div',{id:'rrV14LayoutDialog',class:'rr-settings-backdrop'});const card=node('section',{class:'rr-settings-dialog rr-v14-layout-dialog',role:'dialog','aria-modal':'true','aria-label':'Modül yerleşim planları'}),head=node('header',{class:'rr-settings-head'});head.append(node('strong',{},'MODÜL · YERLEŞİM PLANI'),button('×',close));const body=node('div',{class:'rr-settings-body',id:'rrV14LayoutBody'});card.append(head,body);dialog.append(card);document.body.append(dialog);dialog.onclick=e=>{if(e.target===dialog)close();};dialog.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();if(current){current=null;catalog();}else close();}});catalog();}
function catalog(){const body=$('rrV14LayoutBody');body.replaceChildren();body.append(node('p',{class:'rr-v14-layout-hint'},'Çerçeve planını seçin, ölçüleri girin ve yerleşimi önizleyin. Tavanlar açık başlar; tavan ürünü daha sonra seçilebilir.'));for(const[env,title,sides]of [['none','Serbest çerçeveler','back'],['wall','Duvarlı yerleşimler','back-left'],['parapet','Parapetli yerleşimler','all']]){const section=node('section',{class:'rr-v14-layout-section'});section.append(node('h3',{},title));const grid=node('div',{class:'rr-v14-layout-grid'});for(const t of C.templates){const card=button('',()=>{current=t.id;environment=env;form();});card.dataset.layout=t.id;card.dataset.environment=env;const plan=C.build(t.id,{...last[t.id],environment:env,sides});const graphic=node('div',{class:'rr-v14-layout-thumb'});graphic.innerHTML=frameSvg(plan);card.append(graphic,node('strong',{},t.name),node('small',{},t.formula));grid.append(card);}section.append(grid);body.append(section);}body.append(node('p',{class:'rr-v14-layout-hint'},'Her oluşturulan poz bağımsızdır. Mevcut çizim korunur; yeni yerleşim yanına eklenir.'));}
function form(){
 const body=$('rrV14LayoutBody');
 body.replaceChildren();
 const template=C.templates.find(t=>t.id===current), grid=['grid','l','u'].includes(current), variable=current==='variable';
 const values={...last[current],environment,sides:environment==='parapet'?'all':environment==='wall'?'back-left':'back',parapetHeight:600};
 const units=window.PLMRUnits,t=window.PLMRI18n.t;
 let unit=units.positionInputUnit(window.PLMRFinalMetadata?.projectInfo?.outputUnit,'inch');
 body.append(node('strong',{class:'rr-v13-form-legend'},t(template.name)+' · '+template.formula),node('p',{class:'rr-v14-layout-hint'},t(template.description)));
 const form=node('form',{id:'rrV14LayoutForm',class:'rr-v13-position-form'}),fields=new Map();
 function row(key,label,options){
  const wrap=node('label',{class:'rr-v13-form-row'}),caption=node('span',{},label);
  const input=node(options?'select':'input',{id:'rrV14Layout'+key[0].toUpperCase()+key.slice(1),'aria-label':label});
  if(options)for(const [value,text] of options)input.add(new Option(text,value));
  else input.required=true;
  wrap.append(caption,input);form.append(wrap);
  fields.set(key,{input,caption,label});
  return input;
 }
 const selector=row('unit','Input Unit',units.positionUnits.map(key=>[key,key==='inch'?'in':key]));
 if(current!=='single')row('columns',grid?'Modules Across (N)':'System Count (N)');
 if(grid)row('rows','Modules Deep (M)');
 row('width',variable?'Individual Widths (W₁; W₂; …)':'Overall Width');
 row('depth',variable?'Individual Projections (P₁; P₂; …)':'Overall Projection');
 row('height','System Height');
 if(variable)row('alignment','Alignment',[['back','Align Rear Edges'],['front','Align Front Edges']]);
 if(environment!=='none'){
  row('sides',environment==='wall'?'Wall Location':'Parapet Location',[
   ...(environment==='parapet'?[['all','All Outer Edges']]:[]),['back','Rear'],['front','Front'],
   ['left','Left'],['right','Right'],['back-left','Rear + Left'],['back-left-right','Rear + Left + Right']]);
  if(environment==='parapet')row('parapetHeight','Parapet Height');
 }
 const preview=node('div',{id:'rrV14LayoutPreview',class:'rr-v14-layout-preview'});
 const message=node('p',{id:'rrV14LayoutError',class:'rr-v13-message',role:'status'});
 const total=node('output',{id:'rrV14LayoutTotal',class:'rr-v13-position-names'});
 const displayed=new Map();
 function read(){
  const draft={...values};
  for(const [key,{input}] of fields){
   if(key==='unit')continue;
   const old=displayed.get(key);
   draft[key]=lengthFields.has(key)?old?.text===input.value?old.mm:convert(input.value,value=>units.dimensionToMm(value,unit)):input.value;
  }
  return draft;
 }
 function fill(draft){
  selector.value=unit;
  for(const [key,{input,caption,label}] of fields){
   if(key==='unit')continue;
   const mm=String(draft[key]??'');
   if(!lengthFields.has(key)){input.value=mm;continue;}
   const display=unit==='inch'?'in':unit;
   caption.textContent=label+' ('+display+')';input.setAttribute('aria-label',caption.textContent);
   input.value=convert(mm,value=>units.dimensionFromMm(value,unit));
   displayed.set(key,{text:input.value,mm});
  }
  update();
 }
 function update(){
  try{
   const plan=C.build(current,read());
   preview.innerHTML=frameSvg(plan,true,unit);
   total.textContent=plan.cells.length+' independent positions · Overall '+[plan.width,plan.depth,plan.height].map(n=>measure(n,unit)).join(' × ')+' '+(unit==='inch'?'in':unit);
   message.textContent='';
  }catch(error){message.textContent=error.message;total.textContent='';preview.replaceChildren();}
 }
 const foot=node('footer',{class:'rr-v13-footer'});
 foot.append(button('Layouts',()=>{current=null;catalog();}),button('Reset',()=>fill(values)),button('Cancel',close),
  node('button',{id:'rrV14LayoutApply',type:'submit'},'Create Layout'));
 form.append(preview,total,message,foot);body.append(form);
 form.oninput=event=>{if(event.target!==selector)update();};
 selector.onchange=()=>{const draft=read();unit=selector.value;fill(draft);};
 form.onsubmit=event=>{
  event.preventDefault();
  try{const draft=read();window.PLMRV14Commands.applyLayout(current,draft);last[current]=draft;close();}
  catch(error){message.textContent=error.message;}
 };
 fill(values);
 fields.get('width').input.focus({preventScroll:true});
}
window.PLMRV14LayoutUI={open,close,active:()=>Boolean(dialog),frameSvg};
})();
