(function(root,factory){
  if(typeof module==='object'&&module.exports) module.exports=factory();
  else {root.createPLMRSurme2DPreview=factory;root.PLMRSurme2DPreview=factory();}
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  let container=null,lastDocument=null,viewBox=null,drag=null,bound=false,selectedId='',selectedIds=new Set(),handlers={},pointerDownHitId='';
  const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const n=v=>Number.isFinite(Number(v))?Number(v):0;
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
  const asArray=v=>Array.isArray(v)?v.filter(Boolean).map(String):v?[String(v)]:[];
  function sy(doc,y){return doc.bounds.height-n(y);}
  function layerClass(layer){return `g2d-layer-${String(layer||'0').replace(/[^a-z0-9]+/gi,'-').toLowerCase()}`;}
  function roleClass(role){return role?` g2d-role-${String(role).replace(/[^a-z0-9]+/gi,'-').toLowerCase()}`:'';}

  function layerCss(doc){
    const styles=doc&&doc.layerStyle||{};
    return Object.entries(styles).map(([layer,st])=>{
      const cls=layerClass(layer),stroke=st&&st.stroke||'#111111',w=Math.max(.55,Number(st&&st.width||.35)*2.5);
      return `.${cls}{stroke:${stroke}!important;stroke-width:${w}!important}.g2d-text.${cls}{fill:${stroke}!important}`;
    }).join('');
  }
  function entityClass(e){return `${layerClass(e&&e.layer)}${roleClass(e&&e.role)}`;}
  function polyline(points,doc,e,closed,extraClass){
    const raw=(points||[]).map(p=>[n(p[0]),sy(doc,p[1])]);
    if(!raw.length)return '';
    const pts=raw.map(p=>`${p[0]},${p[1]}`).join(' ');
    if(closed){
      return `<polygon class="g2d-entity ${entityClass(e)} ${extraClass||''}" points="${pts}" fill="none"/>`;
    }
    return `<polyline class="g2d-entity ${entityClass(e)} ${extraClass||''}" points="${pts}" fill="none"/>`;
  }
  function renderText(e,doc,override){
    const x=n(e.x),y=sy(doc,e.y),rot=-n(e.rotation),align=e.align==='left'?'start':e.align==='right'?'end':'middle';
    const h=Math.max(22,n(e.height)||80),value=override==null?e.value:override;
    return `<text class="g2d-text ${entityClass(e)}" x="${x}" y="${y}" font-size="${h}" text-anchor="${align}" dominant-baseline="middle"${rot?` transform="rotate(${rot} ${x} ${y})"`:''}>${esc(value)}</text>`;
  }
  function renderDimension(e,doc){
    const p1=e.p1||{},p2=e.p2||{},dl=e.dimLine||{},label=e.previewText||e.textOverride||'';
    const tick=45,parts=[];
    if(Math.abs(n(p2.x)-n(p1.x))>=Math.abs(n(p2.y)-n(p1.y))){
      const y=sy(doc,dl.y),a1=sy(doc,p1.y),a2=sy(doc,p2.y),x1=n(p1.x),x2=n(p2.x);
      parts.push(`<line x1="${x1}" y1="${a1}" x2="${x1}" y2="${y}"/><line x1="${x2}" y1="${a2}" x2="${x2}" y2="${y}"/><line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}"/>`);
      parts.push(`<line x1="${x1}" y1="${y-tick}" x2="${x1}" y2="${y+tick}"/><line x1="${x2}" y1="${y-tick}" x2="${x2}" y2="${y+tick}"/>`);
      parts.push(`<text x="${(x1+x2)/2}" y="${y-95}" text-anchor="middle" dominant-baseline="middle">${esc(label)}</text>`);
    }else{
      const x=n(dl.x),x1=n(p1.x),x2=n(p2.x),y1=sy(doc,p1.y),y2=sy(doc,p2.y),mid=(y1+y2)/2;
      parts.push(`<line x1="${x1}" y1="${y1}" x2="${x}" y2="${y1}"/><line x1="${x2}" y1="${y2}" x2="${x}" y2="${y2}"/><line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}"/>`);
      parts.push(`<line x1="${x-tick}" y1="${y1}" x2="${x+tick}" y2="${y1}"/><line x1="${x-tick}" y1="${y2}" x2="${x+tick}" y2="${y2}"/>`);
      parts.push(`<text x="${x-95}" y="${mid}" text-anchor="middle" dominant-baseline="middle" transform="rotate(-90 ${x-95} ${mid})">${esc(label)}</text>`);
    }
    return `<g class="g2d-dimension ${layerClass(e.layer)}">${parts.join('')}</g>`;
  }
  function transformBlockPoint(p,ins){
    const sx=n(ins.scaleX)||1,sv=n(ins.scaleY)||1,a=n(ins.rotation)*Math.PI/180,px=n(p[0])*sx,py=n(p[1])*sv;
    return [n(ins.x)+px*Math.cos(a)-py*Math.sin(a),n(ins.y)+px*Math.sin(a)+py*Math.cos(a)];
  }
  function renderInsert(e,doc){
    const block=doc.blocks&&doc.blocks[e.name];if(!block)return'';
    const out=[];
    (block.entities||[]).forEach(be=>{
      if(be.type==='polyline')out.push(polyline((be.points||[]).map(p=>transformBlockPoint(p,e)),doc,be,be.closed,'g2d-logo-poly'));
      else if(be.type==='line'){
        const a=transformBlockPoint([be.x1,be.y1],e),b=transformBlockPoint([be.x2,be.y2],e);
        out.push(`<line class="g2d-entity ${entityClass(be)}" x1="${a[0]}" y1="${sy(doc,a[1])}" x2="${b[0]}" y2="${sy(doc,b[1])}"/>`);
      }
    });
    return `<g class="g2d-block-insert" data-block="${esc(e.name)}">${out.join('')}</g>`;
  }
  function renderEntity(e,doc,showDimensions,hidePositionEntities){
    if(!e)return'';
    if(hidePositionEntities&&e.positionId)return'';
    if(showDimensions===false&&e.type==='dimension')return'';
    if(e.type==='line')return `<line class="g2d-entity ${entityClass(e)}" x1="${n(e.x1)}" y1="${sy(doc,e.y1)}" x2="${n(e.x2)}" y2="${sy(doc,e.y2)}"/>`;
    if(e.type==='polyline')return polyline(e.points,doc,e,e.closed,e.role==='glass'?'g2d-glass':'');
    if(e.type==='text'||e.type==='mtext')return renderText(e,doc);
    if(e.type==='dimension')return renderDimension(e,doc);
    if(e.type==='insert')return renderInsert(e,doc);
    return'';
  }
  function boundsOf(doc){return doc&&doc.previewBounds||doc&&doc.bounds||{minX:0,minY:0,width:1,height:1};}
  function defaultViewBox(doc){const b=boundsOf(doc);return {x:n(b.minX),y:Math.max(0,n(doc.bounds.height)-n(b.maxY)),width:Math.max(1,n(b.width)),height:Math.max(1,n(b.height))};}
  function hitTargets(doc){return (doc.positions||[]).map(p=>{
    const src=p.productBounds||p.cellBounds||{},pad=140,b={minX:n(src.minX)-pad,minY:n(src.minY)-pad,maxX:n(src.maxX)+pad,maxY:n(src.maxY)+pad};
    const w=Math.max(1,n(b.maxX)-n(b.minX)),h=Math.max(1,n(b.maxY)-n(b.minY)),y=sy(doc,b.maxY),active=selectedIds.has(String(p.id));
    return `<rect class="g2d-position-hit${active?' is-selected':''}" data-position-id="${esc(p.id)}" data-position-no="${esc(p.positionNo)}" x="${n(b.minX)}" y="${y}" width="${w}" height="${h}" rx="14"/>`;
  }).join('');}
  function svgMarkup(doc,options){
    const opts=options||{},vb=opts.viewBox||viewBox||defaultViewBox(doc),showDimensions=opts.showDimensions!==false;
    const entities=(doc.entities||[]).map(e=>renderEntity(e,doc,showDimensions,Boolean(opts.hidePositionEntities))).join(''),hits=opts.interactive===false?'':hitTargets(doc);
    return `<svg class="surme-2d-sheet" xmlns="http://www.w3.org/2000/svg" viewBox="${vb.x} ${vb.y} ${vb.width} ${vb.height}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Sürme 2D teknik çizim paftası"><style>
      .surme-2d-sheet{width:100%;height:100%;display:block;background:#fff;touch-action:none;user-select:none;shape-rendering:geometricPrecision;text-rendering:optimizeLegibility}
      .g2d-entity,.g2d-dimension line{fill:none;stroke:#111;stroke-width:.88;vector-effect:non-scaling-stroke;stroke-linecap:square;stroke-linejoin:round}
      .g2d-text,.g2d-dimension text{fill:#111;font-family:Arial,'Segoe UI',sans-serif;font-weight:700;paint-order:stroke;stroke:none;letter-spacing:.01em;dominant-baseline:middle}
      ${layerCss(doc)}
      .g2d-text{font-weight:700}
      .g2d-role-movement-primary{stroke:#0000ff!important;stroke-width:1.10!important;stroke-linecap:round!important;stroke-linejoin:round!important}
      .g2d-role-movement-secondary{stroke:#0000ff!important;stroke-width:.75!important;stroke-linecap:round!important;stroke-linejoin:round!important}
      .g2d-dimension line{stroke:#ff0000!important;stroke-width:.70!important}
      .g2d-dimension text{fill:#ff0000;font-size:106px;font-weight:800}
      .g2d-layer-antetler,.g2d-layer-d-s-cerceve,.g2d-layer-plmr{stroke:#111!important;stroke-width:.76!important}
      .g2d-logo-poly{stroke:#111!important;stroke-width:.76!important}
      .g2d-glass{fill:none}.g2d-layer-d-s-cerceve{stroke-width:1.04!important}
      .g2d-position-hit{fill:transparent;stroke:transparent;stroke-width:0;pointer-events:all;cursor:pointer;transition:fill .12s ease,stroke .12s ease}
      .g2d-position-hit:hover{fill:#3b82f620;stroke:#60a5fa;stroke-width:1.24;vector-effect:non-scaling-stroke;stroke-dasharray:4 3}
      .g2d-position-hit.is-selected{fill:#3b82f626;stroke:#2563eb;stroke-width:1.85;vector-effect:non-scaling-stroke;stroke-dasharray:5 4}
    </style><rect x="${doc.bounds.minX}" y="0" width="${doc.bounds.width}" height="${doc.bounds.height}" fill="#fff"/>${entities}${hits}</svg>`;
  }
  function updateViewBox(){if(!container||!viewBox)return;const svg=container.querySelector('svg');if(svg)svg.setAttribute('viewBox',`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`);}
  function zoomMetrics(doc){
    const base=defaultViewBox(doc),cells=(doc.positions||[]).map(p=>p.productBounds||p.cellBounds).filter(Boolean);
    if(!cells.length)return {base,minScale:.25,maxScale:1};
    const pad=260;
    const minScale=Math.min(.95,Math.max(.08,...cells.map(b=>{
      const w=Math.max(1,n(b.maxX)-n(b.minX))+pad*2,h=Math.max(1,n(b.maxY)-n(b.minY))+pad*2;
      return Math.max(w/base.width,h/base.height);
    })));
    return {base,minScale,maxScale:1};
  }
  function clampViewBox(next){
    if(!lastDocument)return next;
    const m=zoomMetrics(lastDocument),base=m.base;
    const rawScale=Number(next&&next.width)>0?Number(next.width)/base.width:1,scale=clamp(rawScale,m.minScale,m.maxScale);
    const width=base.width*scale,height=base.height*scale;
    const minX=base.x,maxX=base.x+base.width-width,minY=base.y,maxY=base.y+base.height-height;
    const x=clamp(n(next.x),minX,Math.max(minX,maxX)),y=clamp(n(next.y),minY,Math.max(minY,maxY));
    return {x,y,width,height};
  }
  function apply(resetView){
    if(!container||!lastDocument)return;
    if(resetView||!viewBox)viewBox=defaultViewBox(lastDocument);
    viewBox=clampViewBox(viewBox);
    container.innerHTML=svgMarkup(lastDocument,{interactive:true,viewBox,showDimensions:handlers.showDimensions!==false});
  }
  function refreshSelectionClasses(){
    if(!container)return;
    container.querySelectorAll('.g2d-position-hit').forEach(el=>el.classList.toggle('is-selected',selectedIds.has(String(el.dataset.positionId))));
  }
  function setSelectedIds(ids){selectedIds=new Set(asArray(ids));selectedId=asArray(ids)[asArray(ids).length-1]||'';refreshSelectionClasses();return [...selectedIds];}
  function select(id,notify,meta){selectedId=String(id||'');selectedIds=new Set(selectedId?[selectedId]:[]);refreshSelectionClasses();if(notify&&selectedId&&handlers.onSelect)handlers.onSelect(selectedId,meta||{});return selectedId;}
  function selectMany(ids,notify,meta){setSelectedIds(ids);if(notify&&selectedId&&handlers.onSelect)handlers.onSelect(selectedId,{...(meta||{}),selectedIds:[...selectedIds]});return [...selectedIds];}
  function toggle(id,notify,meta){
    const key=String(id||'');if(!key)return [...selectedIds];
    if(selectedIds.has(key))selectedIds.delete(key); else selectedIds.add(key);
    selectedId=key;refreshSelectionClasses();
    if(notify&&handlers.onSelect)handlers.onSelect(key,{...(meta||{}),multi:true,toggle:true,selectedIds:[...selectedIds]});
    return [...selectedIds];
  }
  function clearSelection(notify){selectedId='';selectedIds.clear();refreshSelectionClasses();if(notify&&handlers.onClearSelection)handlers.onClearSelection();}
  function render(target,doc,options){if(container!==target){container=target;bound=false;}else container=target;lastDocument=doc;handlers={...(options||{})};selectedIds=new Set(asArray(handlers.selectedIds||handlers.selectedId));selectedId=asArray(handlers.selectedIds||handlers.selectedId).slice(-1)[0]||'';apply(true);bind();return inspect();}
  function fit(){if(!lastDocument)return;viewBox=defaultViewBox(lastDocument);viewBox=clampViewBox(viewBox);updateViewBox();}
  function zoomAt(factor,clientX,clientY){
    if(!container||!lastDocument||!viewBox)return;const r=container.getBoundingClientRect();if(!r.width||!r.height)return;
    const px=(clientX-r.left)/r.width,py=(clientY-r.top)/r.height,wx=viewBox.x+px*viewBox.width,wy=viewBox.y+py*viewBox.height,nw=viewBox.width*factor,nh=viewBox.height*factor;
    viewBox=clampViewBox({x:wx-px*nw,y:wy-py*nh,width:nw,height:nh});updateViewBox();
  }
  function bind(){
    if(!container||bound)return;bound=true;
    let moved=false;
    container.addEventListener('wheel',e=>{if(!lastDocument)return;e.preventDefault();zoomAt(e.deltaY>0?1.12:.89,e.clientX,e.clientY);},{passive:false});
    container.addEventListener('pointerdown',e=>{
      if(!lastDocument)return;moved=false;
      const hit=e.target&&e.target.closest?e.target.closest('.g2d-position-hit'):null;pointerDownHitId=hit&&hit.dataset?String(hit.dataset.positionId||''):'';
      if(pointerDownHitId){drag=null;return;}
      container.setPointerCapture&&container.setPointerCapture(e.pointerId);drag={x:e.clientX,y:e.clientY,v:{...viewBox}};
    });
    container.addEventListener('pointermove',e=>{if(!drag||!viewBox)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.hypot(dx,dy)>5)moved=true;const r=container.getBoundingClientRect();viewBox=clampViewBox({...drag.v,x:drag.v.x-dx*drag.v.width/Math.max(1,r.width),y:drag.v.y-dy*drag.v.height/Math.max(1,r.height)});updateViewBox();});
    container.addEventListener('pointerup',e=>{
      const hitId=String(pointerDownHitId||'');drag=null;
      if(moved){moved=false;pointerDownHitId='';return;}
      if(hitId){
        if(e.ctrlKey||e.metaKey)toggle(hitId,true,{multi:true,ctrlKey:Boolean(e.ctrlKey),metaKey:Boolean(e.metaKey)});
        else select(hitId,true,{multi:false,ctrlKey:false,metaKey:false});
      }else clearSelection(true);
      pointerDownHitId='';
    });
    container.addEventListener('pointercancel',()=>{drag=null;pointerDownHitId='';});
    container.addEventListener('dblclick',e=>{e.preventDefault();fit();});
  }
  function inspect(){return lastDocument?{schema:lastDocument.schema,bounds:{...lastDocument.bounds},positionCount:lastDocument.positions.length,columns:lastDocument.columns,titleBlock:{...lastDocument.titleBlock.bounds},outerFrame:{...lastDocument.outerFrame},selectedId,selectedIds:[...selectedIds],viewBox:viewBox?{...viewBox}:null}:null;}
  function toSvg(doc,options){const prev=lastDocument,pvb=viewBox,ps=selectedId,pset=new Set(selectedIds),lastHandlers=handlers;lastDocument=doc;selectedId='';selectedIds=new Set();handlers={...(options||{})};const s=svgMarkup(doc,{viewBox:(options&&options.viewBox)||defaultViewBox(doc),interactive:false,showDimensions:!(options&&options.showDimensions===false),hidePositionEntities:Boolean(options&&options.hidePositionEntities)});lastDocument=prev;viewBox=pvb;selectedId=ps;selectedIds=pset;handlers=lastHandlers;return s;}
  return Object.freeze({render,fit,toSvg,inspect,select,selectMany,toggle,clearSelection,setSelectedIds,getDocument:()=>lastDocument,get selectedId(){return selectedId;},get selectedIds(){return [...selectedIds];}});
});
