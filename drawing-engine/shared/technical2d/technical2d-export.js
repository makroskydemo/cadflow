(function (root) {
  'use strict';

  const VERSION = 'PLMR Bioclimatic V21';
  const MODEL_UNITS = 'mm';
  const MODEL_SCALE = 1;
  const LAYERS = Object.freeze({
    frame:'Kiriş Profilleri',gutter:'Oluk Profilleri',vertical:'Dikme Profilleri',horizontal:'Ek Yatay Profiller',added:'Ek Dikey Profiller',support:'Tavan Destek Profilleri',panel:'Çatı Panelleri',glass:'Cam Paneller',fabric:'Kumaş Paneller',led:'LED',wall:'Duvarlar',product:'Cephe Profilleri',dimension:'OLCULENDIRME_MM',text:'Bilgilendirme Yazıları',title:'Antetler',outer:'Dış Çerçeve',logo:'PLMR'
  });
  const DIM_STYLES={mm:'PLMR_DIM_MM',inch:'PLMR_DIM_INCH',dual:'PLMR_DIM_MM_INCH'};
  const DIM_LAYERS={mm:'OLCULENDIRME_MM',inch:'OLCULENDIRME_INCH',dual:'OLCULENDIRME_MM_INCH'};
  // Schematic colors from the main 3D drawing palette, independent of selected RAL finishes.
  const PALETTE={frame:{aci:5,stroke:'#2563eb',width:.35},gutter:{aci:30,stroke:'#ff8c00',width:.35},vertical:{aci:6,stroke:'#ff00ff',width:.35},horizontal:{aci:5,stroke:'#2563eb',width:.35},added:{aci:5,stroke:'#2563eb',width:.35},support:{aci:30,stroke:'#ffb347',width:.30},panel:{aci:3,stroke:'#7cfc00',width:.30},glass:{aci:4,stroke:'#6fa9be',width:.25},fabric:{aci:8,stroke:'#8b9096',width:.25},led:{aci:2,stroke:'#ffe7b1',width:.25},wall:{aci:8,stroke:'#9a8f83',width:.35},product:{aci:5,stroke:'#2563eb',width:.30},dimension:{aci:1,stroke:'#ff0000',width:.25},text:{aci:7,stroke:'#111111',width:.25},title:{aci:7,stroke:'#111111',width:.25},outer:{aci:7,stroke:'#111111',width:.35},logo:{aci:7,stroke:'#111111',width:.30}};
  const VIEW_ORDER = Object.freeze(['rear','top','left','front','right']);
  const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;

  function addedProfileStyle(width,depth){
    const key=Number(width)+'x'+Number(depth);
    let hash=2166136261;
    for(const char of key)hash=Math.imul(hash^char.charCodeAt(0),16777619)>>>0;
    const h=(205+hash%24)/360,s=.78,l=(32+(hash>>>5)%17)/100;
    const channel=n=>{const k=(n+h*12)%12;return l-s*Math.min(l,1-l)*Math.max(-1,Math.min(k-3,9-k,1));};
    const stroke='#'+[channel(0),channel(8),channel(4)].map(v=>Math.round(v*255).toString(16).padStart(2,'0')).join('');
    return{aci:150+hash%3*10,stroke,trueColor:parseInt(stroke.slice(1),16),width:.35};
  }
  function roleLayer(item) {
    const role=String(item?.role||'').toLowerCase(),meta=item?.meta||{};
    if(item?.type==='dimension')return LAYERS.dimension;
    if(item?.type==='text'||item?.type==='mtext')return LAYERS.text;
    if(meta.kind==='sketch-wall')return LAYERS.wall;
    if(role==='led')return LAYERS.led;
    if(meta.kind==='roof-support')return LAYERS.support;
    if(role==='post')return LAYERS.vertical;
    if(meta.profileId)return meta.orientation==='horizontal'?LAYERS.horizontal:LAYERS.added;
    if(role.includes('gutter'))return LAYERS.gutter;
    if(role.includes('fabric'))return LAYERS.fabric;
    if(role.includes('glass'))return LAYERS.glass;
    if(role.includes('product'))return 'Cephe - '+({guillotine:'Giyotin',sliding:'Sürme',zip:'Zip',door:'Kapı',fixed:'Sabit Cam',folding:'Akordiyon Cam',balcony:'Katlanır Cam'}[meta.productType]||'Profiller');
    if(role.includes('panel'))return LAYERS.panel;
    return LAYERS.frame;
  }
  function styleFor(item){if(item.meta?.profileId){const p=item.meta.profile||{};return addedProfileStyle(p.width||100,p.depth||100);}const layer=roleLayer(item),key=Object.keys(LAYERS).find(key=>LAYERS[key]===layer);return PALETTE[key||'product'];}
  function exportable(item){return item&&!['zone-area','alignment-guide','module-boundary','module-outline','elevation-envelope'].includes(item.role)&&!(item.role==='panel-zone'&&item.meta?.roofProduct==='none');}

  function include(bounds, x, y) {
    x = finite(x, NaN); y = finite(y, NaN); if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    bounds.minX = Math.min(bounds.minX, x); bounds.minY = Math.min(bounds.minY, y);
    bounds.maxX = Math.max(bounds.maxX, x); bounds.maxY = Math.max(bounds.maxY, y);
  }
  function itemBounds(view) {
    const b = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
    if (view && view.bounds) { include(b, view.bounds.minX, view.bounds.minY); include(b, view.bounds.maxX, view.bounds.maxY); }
    (view && Array.isArray(view.entities) ? view.entities : []).forEach(item => {
      if (!item) return;
      if (item.type === 'rect') { include(b,item.x,item.y); include(b,finite(item.x)+finite(item.width),finite(item.y)+finite(item.height)); }
      else if (item.type === 'line') { include(b,item.x1,item.y1); include(b,item.x2,item.y2); }
      else if (item.type === 'text') include(b,item.x,item.y);
      else if (item.type === 'dimension') {
        if(item.axis==='aligned'){for(const p of [item.p1,item.p2,item.dimLine])include(b,p.x,p.y);return;}
        if (item.axis === 'x') { include(b,item.start,item.offset); include(b,item.end,item.offset); }
        else { include(b,item.offset,item.start); include(b,item.offset,item.end); }
      }
    });
    if (!Number.isFinite(b.minX)) return { minX:0,minY:0,maxX:1,maxY:1,width:1,height:1 };
    b.width = Math.max(1,b.maxX-b.minX); b.height = Math.max(1,b.maxY-b.minY); return b;
  }

  function viewLayout(projection) {
    const views = VIEW_ORDER.map(id => (projection.views || []).find(v => v.id === id)).filter(Boolean);
    const map = new Map(views.map(v => [v.id,{ view:v, bounds:itemBounds(v) }]));
    const gap = Math.max(500, ...Array.from(map.values()).map(x => Math.max(x.bounds.width,x.bounds.height)*0.10));
    const rear = map.get('rear'), top = map.get('top'), left = map.get('left'), front = map.get('front'), right = map.get('right');
    const topW = top ? top.bounds.width : 1, rearW = rear ? rear.bounds.width : 1;
    const upperW = Math.max(topW,rearW);
    const lowerW = [left,front,right].filter(Boolean).reduce((s,x)=>s+x.bounds.width,0) + Math.max(0,[left,front,right].filter(Boolean).length-1)*gap;
    const totalW = Math.max(upperW,lowerW);
    let cursorY = 0;
    // DXF/model space uses +Y upward. Keeping Top at the lower Y band and Rear
    // in the next higher band makes the rendered CAD/PDF sheet match the native
    // Technical2D page where Rear is visually above Top.
    if (top) { top.tx = (totalW-top.bounds.width)/2 - top.bounds.minX; top.ty = cursorY - top.bounds.minY; cursorY += top.bounds.height + gap; }
    if (rear) { rear.tx = (totalW-rear.bounds.width)/2 - rear.bounds.minX; rear.ty = cursorY - rear.bounds.minY; cursorY += rear.bounds.height + gap*1.3; }
    let x = (totalW-lowerW)/2;
    [left,front,right].filter(Boolean).forEach(entry => { entry.tx=x-entry.bounds.minX; entry.ty=cursorY-entry.bounds.minY; x += entry.bounds.width+gap; });
    return { map, gap, totalW, totalH: cursorY + Math.max(1,...[left,front,right].filter(Boolean).map(e=>e.bounds.height)) };
  }

  function organizedLayout(projection){
    const owners=projection.coverage?.owners||[];if(owners.length<2)return viewLayout(projection);
    const gap=600,top=(projection.views||[]).find(v=>v.id==='top'),topEntry=top?{view:top,bounds:itemBounds(top)}:null,rows=[];
    for(const owner of owners){const entries=[];for(const id of ['rear','left','front','right']){const source=projection.views.find(v=>v.id===id);if(!source)continue;const view={...source,bounds:null,title:'POZ '+(owner==='roof-main'?(projection.modelState.pozNo||1):(projection.modelState.sceneEditor.roofCopies.find(o=>o.id===owner)?.spec.pozNo||owner))+' · '+source.title.split(' · ')[0]+' · Yerel eksenler',entities:source.entities.filter(e=>(e.meta?.sceneObjectId||'roof-main')===owner&&e.meta?.kind!=='owner-label')};const bounds=itemBounds(view);view.bounds=itemBounds({entities:view.entities.filter(e=>['rect','line'].includes(e.type)&&!['zone-area','alignment-guide','module-boundary','elevation-envelope'].includes(e.role))});entries.push({view,bounds});}if(entries.length)rows.push({entries,width:entries.reduce((sum,e)=>sum+e.bounds.width,0)+(entries.length-1)*gap,height:Math.max(...entries.map(e=>e.bounds.height))+300});}
    const totalW=Math.max(topEntry?.bounds.width||1,...rows.map(r=>r.width)),totalH=(topEntry?topEntry.bounds.height+300+gap:0)+rows.reduce((sum,r)=>sum+r.height+gap,0),entries=[];let cursor=totalH;
    if(topEntry){cursor-=topEntry.bounds.height+300;topEntry.tx=(totalW-topEntry.bounds.width)/2-topEntry.bounds.minX;topEntry.ty=cursor-topEntry.bounds.minY;entries.push(topEntry);cursor-=gap;}
    for(const row of rows){cursor-=row.height;let x=(totalW-row.width)/2;for(const e of row.entries){e.tx=x-e.bounds.minX;e.ty=cursor-e.bounds.minY;entries.push(e);x+=e.bounds.width+gap;}cursor-=gap;}
    return {entries,totalW,totalH,gap};
  }

  function pushLine(entities, x1,y1,x2,y2,layer) {
    if (Math.abs(x1-x2)<1e-9 && Math.abs(y1-y2)<1e-9) return;
    entities.push({ type:'polyline', layer, color:256, closed:false, points:[[x1,y1],[x2,y2]] });
  }
  function pushRect(entities, x,y,w,h,layer) {
    if (!(w>0 && h>0)) return;
    entities.push({ type:'polyline', layer, color:256, closed:true, points:[[x,y],[x+w,y],[x+w,y+h],[x,y+h]] });
  }
  function pushText(entities, x,y,value,layer,height,rotation,align) {
    const text = String(value == null ? '' : value); if (!text) return;
    entities.push({ type:'text', layer:layer||LAYERS.text, color:0, x,y,value:text,height:Math.max(35,finite(height,70)),rotation:finite(rotation,0),align:align||'center' });
  }
  function convertDimension(entities,item,view,tx,ty,units){
    const mode=units.mm&&units.inch?'dual':units.inch?'inch':'mm',layer=DIM_LAYERS[mode]+(['canonical-measurement','zone-width','zone-height'].includes(item.meta?.kind)?' - DETAY':''),tick=45,bounds=item.referenceBounds||view.bounds||{},axis=item.axis;
    if(axis==='aligned'){
      const shift=p=>({x:p.x+tx,y:p.y+ty}),p1=shift(item.p1),p2=shift(item.p2),d=shift(item.dimLine),dx=p2.x-p1.x,dy=p2.y-p1.y,length=Math.hypot(dx,dy),nx=-dy/length,ny=dx/length,offset=(d.x-p1.x)*nx+(d.y-p1.y)*ny,a={x:p1.x+nx*offset,y:p1.y+ny*offset},b={x:p2.x+nx*offset,y:p2.y+ny*offset},graphics=[];
      pushLine(graphics,p1.x,p1.y,a.x,a.y,layer);pushLine(graphics,p2.x,p2.y,b.x,b.y,layer);pushLine(graphics,a.x,a.y,b.x,b.y,layer);for(const p of [a,b])pushLine(graphics,p.x-nx*tick,p.y-ny*tick,p.x+nx*tick,p.y+ny*tick,layer);
      pushText(graphics,(a.x+b.x)/2+nx*95,(a.y+b.y)/2+ny*95,item.text,layer,100,Math.atan2(dy,dx)*180/Math.PI,'center');
      entities.push({type:'dimension',aligned:true,layer,color:256,dimStyle:DIM_STYLES[mode],p1,p2,dimLine:d,text:{x:d.x+nx*95,y:d.y+ny*95},textOverride:'<>',previewText:item.text,graphics,sourceMeta:item.meta});return;
    }
    const p1=axis==='x'?{x:finite(item.start)+tx,y:finite(item.offset)<finite(bounds.minY)?finite(bounds.minY)+ty:finite(bounds.maxY)+ty}:{x:finite(item.offset)<finite(bounds.minX)?finite(bounds.minX)+tx:finite(bounds.maxX)+tx,y:finite(item.start)+ty};
    const p2=axis==='x'?{x:finite(item.end)+tx,y:p1.y}:{x:p1.x,y:finite(item.end)+ty};
    const dimLine=axis==='x'?{x:(p1.x+p2.x)/2,y:finite(item.offset)+ty}:{x:finite(item.offset)+tx,y:(p1.y+p2.y)/2},graphics=[];
    if(axis==='x'){pushLine(graphics,p1.x,p1.y,p1.x,dimLine.y,layer);pushLine(graphics,p2.x,p2.y,p2.x,dimLine.y,layer);pushLine(graphics,p1.x,dimLine.y,p2.x,dimLine.y,layer);for(const p of [p1,p2])pushLine(graphics,p.x,dimLine.y-tick,p.x,dimLine.y+tick,layer);pushText(graphics,dimLine.x,dimLine.y+95,item.text,layer,100,0,'center');}
    else{pushLine(graphics,p1.x,p1.y,dimLine.x,p1.y,layer);pushLine(graphics,p2.x,p2.y,dimLine.x,p2.y,layer);pushLine(graphics,dimLine.x,p1.y,dimLine.x,p2.y,layer);for(const p of [p1,p2])pushLine(graphics,dimLine.x-tick,p.y,dimLine.x+tick,p.y,layer);pushText(graphics,dimLine.x-95,dimLine.y,item.text,layer,100,90,'center');}
    entities.push({type:'dimension',layer,color:256,dimStyle:DIM_STYLES[mode],p1,p2,dimLine,text:{x:dimLine.x,y:dimLine.y},textOverride:'<>',previewText:item.text,graphics,sourceMeta:item.meta});
  }

  function convertView(entities, entry, units) {
    const view=entry.view, tx=finite(entry.tx), ty=finite(entry.ty);
    pushText(entities,(entry.bounds.minX+entry.bounds.maxX)/2+tx,entry.bounds.maxY+ty+180,String(view.title||view.id).split(' · ').map(label=>root.PLMRI18n?.t(label)||label).join(' · ').toUpperCase(),LAYERS.text,95,0,'center');
    (Array.isArray(view.entities)?view.entities:[]).forEach(item=>{
      if(!exportable(item))return; const layer=roleLayer(item),before=entities.length;
      if(item.type==='rect') pushRect(entities,finite(item.x)+tx,finite(item.y)+ty,finite(item.width),finite(item.height),layer);
      else if(item.type==='line') pushLine(entities,finite(item.x1)+tx,finite(item.y1)+ty,finite(item.x2)+tx,finite(item.y2)+ty,layer);
      else if(item.type==='text') pushText(entities,finite(item.x)+tx,finite(item.y)+ty,item.text,layer,82,0,'center');
      else if(item.type==='dimension'&&(units.mm||units.inch||units.ft)) convertDimension(entities,item,view,tx,ty,units);
      for(const e of entities.slice(before)){e.sourceMeta=item.meta;e.role=item.role;}
    });
  }

  function drawingBounds(entities) {
    const b={minX:Infinity,minY:Infinity,maxX:-Infinity,maxY:-Infinity};
    entities.forEach(e=>{
      if(e.type==='line'){include(b,e.x1,e.y1);include(b,e.x2,e.y2);} else if(e.type==='polyline')(e.points||[]).forEach(p=>include(b,p[0],p[1])); else if(e.type==='arc'){include(b,e.x-e.radius,e.y-e.radius);include(b,e.x+e.radius,e.y+e.radius);}else if(e.type==='hatch')(e.points||[]).forEach(p=>include(b,p[0],p[1]));else if(e.type==='dimension')for(const ge of e.graphics||[]){if(ge.points)ge.points.forEach(p=>include(b,p[0],p[1]));else include(b,ge.x,ge.y);} else if(e.type==='text'||e.type==='mtext'){include(b,e.x,e.y);const h=finite(e.height,80),w=finite(e.width,String(e.value||'').length*h*.68);include(b,e.x-w,e.y-h);include(b,e.x+w,e.y+h);}
    });
    if(!Number.isFinite(b.minX)) return {minX:0,minY:0,maxX:1,maxY:1,width:1,height:1};
    b.width=Math.max(1,b.maxX-b.minX);b.height=Math.max(1,b.maxY-b.minY);return b;
  }

  function toDrawing(projection, options) {
    if(!projection || projection.valid!==true || !Array.isArray(projection.views)) throw new Error('TECHNICAL2D_EXPORT_PROJECTION_INVALID');
    const units={mm:projection.modelState?.sceneEditor?.dimensionUnits?.mm!==false,inch:!!projection.modelState?.sceneEditor?.dimensionUnits?.inch,ft:!!projection.modelState?.sceneEditor?.dimensionUnits?.ft},mode=units.mm&&units.inch?'dual':units.inch?'inch':'mm';
    if(projection.productGroup==='b-cube'&&root.PLMRV5RoofSheet)return root.PLMRV5RoofSheet.build(projection,options);
    const layout=organizedLayout(projection),entities=[];
    (layout.entries||VIEW_ORDER.map(id=>layout.map.get(id)).filter(Boolean)).forEach(entry=>convertView(entities,entry,units));
    const details=projection.productDetails;if(details){const body=drawingBounds(entities),dx=body.minX-details.bounds.minX,dy=body.minY-800-details.bounds.maxY;for(const e of details.entities)entities.push(root.PLMRV24Details2D.translate(e,dx,dy));}
    const layerStyle={};for(const [key,name]of Object.entries(LAYERS))layerStyle[name]={...PALETTE[key]};for(const name of Object.values(DIM_LAYERS))layerStyle[name]={...PALETTE.dimension};for(const e of entities)if(!layerStyle[e.layer])layerStyle[e.layer]={...(e.layer.startsWith('OLCULENDIRME_')?PALETTE.dimension:PALETTE.product)};
    if(details)Object.assign(layerStyle,details.layerStyle);
    const title=root.PLMRV53TitleBlock||(typeof require!=='undefined'?require('./v53-titleblock.js'):null);if(!title)throw Error('V53_TITLEBLOCK_MISSING');
    const info={...projection.projectInfo},project={projectInfo:{...info,customerName:info.customerName||info.customer,projectName:info.projectName||info.project,designer:info.designer||info.drawnBy}},titleLayout=title.layout(project);
    const body=drawingBounds(entities),inset=title.FRAME_INSET,margin=350,titleWidth=title.TITLE_WIDTH,gap=240,sheetHeight=Math.max(7320,body.height+2*(margin+inset),titleLayout.requiredInnerHeight+2*inset),sheetWidth=titleWidth+gap+body.width+2*(margin+inset),dx=titleWidth+gap+margin+inset-body.minX,dy=sheetHeight-inset-margin-body.maxY;
    function shift(e){const q={...e};for(const k of ['x','x1','x2'])if(Number.isFinite(q[k]))q[k]+=dx;for(const k of ['y','y1','y2'])if(Number.isFinite(q[k]))q[k]+=dy;if(q.points)q.points=q.points.map(p=>[p[0]+dx,p[1]+dy]);for(const k of ['p1','p2','dimLine','text'])if(q[k]&&typeof q[k]==='object')q[k]={...q[k],x:q[k].x+dx,y:q[k].y+dy};if(q.graphics)q.graphics=q.graphics.map(shift);return q;}
    const titleBlock=title.build(project,sheetHeight,titleLayout),outerFrame={type:'polyline',layer:LAYERS.outer,color:0,closed:true,points:[[inset,inset],[sheetWidth-inset,inset],[sheetWidth-inset,sheetHeight-inset],[inset,sheetHeight-inset]]};
    const drawingEntities=[outerFrame,...titleBlock.entities,...entities.map(shift)];
    const layers=Array.from(new Set(['0','Defpoints',...Object.values(LAYERS),...Object.values(DIM_LAYERS),...drawingEntities.map(e=>e.layer)]));
    return {schema:'plmr-technical2d-export-drawing-v2',sourceSchema:projection.schema,productId:projection.productId,productGroup:projection.productGroup,productLabel:projection.productLabel,units:MODEL_UNITS,modelScale:MODEL_SCALE,layers,layerStyle,entities:drawingEntities,blocks:{'PLMR - LOGO':title.logo()},bounds:{minX:0,minY:0,maxX:sheetWidth,maxY:sheetHeight,width:sheetWidth,height:sheetHeight},titleBlock,metadata:{...(options||{}),release:VERSION,generatedAt:new Date().toISOString(),canonical:true,modelUnits:MODEL_UNITS,modelScale:MODEL_SCALE,technicalViewScale:'COMMON_1_TO_1_MODEL_SPACE',dxfProfile:'V53_R2018',dimStyle:DIM_STYLES[mode],dimensionUnits:units,coverage:projection.coverage||null}};
  }

  function assertMetricDrawing(drawing) {
    if (!drawing || drawing.units !== MODEL_UNITS || Number(drawing.modelScale) !== MODEL_SCALE) throw new Error('TECHNICAL2D_EXPORT_MODEL_UNITS_INVALID');
    return drawing;
  }

  // CAD foreground (ACI 7) follows light/dark workspace backgrounds. Explicit brand colors stay exact.
  function cadDrawing(drawing){
    const styles=Object.fromEntries(Object.entries(drawing.layerStyle||{}).map(([name,value])=>{
      const style={...value};if(style.aci===7&&/^#(?:111111|000000)$/i.test(style.stroke||'')&&style.trueColor==null)delete style.stroke;
      return[name,style];
    }));
    return{...drawing,layerStyle:styles};
  }
  function toDxf(projection, options) {
    const modelState=projection.modelState||{};
    const sceneEditor=modelState.sceneEditor||{};
    const drawing=assertMetricDrawing(toDrawing({...projection,modelState:{...modelState,sceneEditor:{...sceneEditor,dimensionUnits:{mm:true,inch:false}}}},options));
    const prepared=root.PulumurExportService && typeof root.PulumurExportService.prepareDrawing==='function' ? root.PulumurExportService.prepareDrawing(drawing) : drawing;
    if(!root.PulumurModernDXF || typeof root.PulumurModernDXF.toDxf!=='function') throw new Error('TECHNICAL2D_DXF_ENGINE_MISSING');
    return root.PulumurModernDXF.toDxf(cadDrawing(prepared));
  }

  function safeFileName(projection, extension) {
    if(root.PLMRV5RoofSheet)return root.PLMRV5RoofSheet.safeName(projection?.projectInfo,extension||'dxf');
    const base=String(projection && projection.productLabel || projection && projection.productId || 'technical-2d').toLowerCase().replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ş/g,'s').replace(/ı/g,'i').replace(/ö/g,'o').replace(/ç/g,'c').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'technical-2d';
    const input=projection && projection.summary && projection.summary.input || {};
    const dims=[input.width,input.depth,input.height].map(v=>String(v||'').replace(/[^0-9;:NO-]+/gi,'')).filter(Boolean).join('x');
    return `${base}${dims?'-'+dims:''}.${extension||'dxf'}`;
  }

  const api=Object.freeze({ INFO_HEIGHT:165, VERSION, MODEL_UNITS, MODEL_SCALE, LAYERS, PALETTE, addedProfileStyle, roleLayer, styleFor, DIM_STYLES, DIM_LAYERS, VIEW_ORDER, toDrawing, toDxf, cadDrawing, assertMetricDrawing, safeFileName, itemBounds, viewLayout, organizedLayout, convertDimension, drawingBounds });
  root.PulumurTechnical2DExport=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
