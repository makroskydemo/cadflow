(function (root) {
  'use strict';
  const createAdapter = root.PulumurCreateProductAdapter;
  if (!createAdapter) throw new Error('Product adapter factory yüklenmedi.');

  const LAYERS = Object.freeze({ frame:'Ürün - Çerçeve', glass:'Ürün - Cam', profile:'Ürün - Bölücü', symbol:'Ürün - Sembol', dim:'Ölçüler - Detay', text:'Ürün - Açıklama' });
  const TOP_FIXED = new Set(['TOP_FIXED','LEFT_FIXED_TOP','RIGHT_FIXED_TOP','BOTH_FIXED_TOP','DOUBLE_TOP','DOUBLE_LEFT_FIXED_TOP','DOUBLE_RIGHT_FIXED_TOP','DOUBLE_BOTH_FIXED_TOP']);
  const DOUBLE = new Set(['DOUBLE','DOUBLE_TOP','DOUBLE_LEFT_FIXED','DOUBLE_LEFT_FIXED_TOP','DOUBLE_RIGHT_FIXED_TOP','DOUBLE_BOTH_FIXED_TOP']);
  const DOOR_TYPES = new Set(['SINGLE','LEFT_FIXED_RIGHT_MOVING','RIGHT_FIXED_LEFT_MOVING','TOP_FIXED','LEFT_FIXED_TOP','RIGHT_FIXED_TOP','BOTH_FIXED_TOP','DOUBLE','DOUBLE_TOP','DOUBLE_LEFT_FIXED','DOUBLE_LEFT_FIXED_TOP','DOUBLE_RIGHT_FIXED_TOP','DOUBLE_BOTH_FIXED_TOP']);
  const n=(v,f=0)=>Number.isFinite(Number(v))?Number(v):f;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const poly=(points,layer=LAYERS.frame,extra={})=>({type:'polyline',layer,color:7,closed:true,points,...extra});
  const line=(x1,y1,x2,y2,layer=LAYERS.profile,extra={})=>({type:'line',layer,color:7,x1,y1,x2,y2,...extra});
  const text=(x,y,value,height=55,extra={})=>({type:'text',layer:LAYERS.text,color:7,x,y,value:String(value),height,align:extra.align||'center',...extra});
  const rect=(x,y,w,h,layer=LAYERS.frame,extra={})=>poly([[x,y],[x+w,y],[x+w,y+h],[x,y+h]],layer,extra);
  function addDims(e,w,h){
    const o=130, tick=35;
    e.push(line(0,-o,w,-o,LAYERS.dim),line(0,-o-tick,0,-o+tick,LAYERS.dim),line(w,-o-tick,w,-o+tick,LAYERS.dim),text(w/2,-o+22,`${Math.round(w)} mm`,46));
    e.push(line(w+o,0,w+o,h,LAYERS.dim),line(w+o-tick,0,w+o+tick,0,LAYERS.dim),line(w+o-tick,h,w+o+tick,h,LAYERS.dim),text(w+o-18,h/2,`${Math.round(h)} mm`,46,{rotation:90}));
  }
  function addGlass(e,x,y,w,h){ if(w>8&&h>8) e.push(rect(x,y,w,h,LAYERS.glass)); }
  function arrow(e,x1,y1,x2,y2){
    e.push(line(x1,y1,x2,y2,LAYERS.symbol)); const dx=x2-x1,dy=y2-y1,l=Math.hypot(dx,dy)||1,ux=dx/l,uy=dy/l,p=35;
    e.push(line(x2,y2,x2-ux*p-uy*p*.45,y2-uy*p+ux*p*.45,LAYERS.symbol),line(x2,y2,x2-ux*p+uy*p*.45,y2-uy*p-ux*p*.45,LAYERS.symbol));
  }
  function frameBase(width,height,bottom=50){
    const w=Math.max(300,n(width,1000)), h=Math.max(300,n(height,2200)), f=Math.max(35,Math.min(60,Math.min(w,h)*.04));
    const e=[rect(0,0,w,h),rect(f,bottom,w-f*2,h-bottom-f)]; addDims(e,w,h); return {e,w,h,f,ix:f,iy:bottom,iw:w-f*2,ih:h-bottom-f};
  }
  function doorParts(type){
    switch(type){
      case 'LEFT_FIXED_RIGHT_MOVING': case 'LEFT_FIXED_TOP': return ['fixed','moving'];
      case 'RIGHT_FIXED_LEFT_MOVING': case 'RIGHT_FIXED_TOP': return ['moving','fixed'];
      case 'BOTH_FIXED_TOP': return ['fixed','moving','fixed'];
      case 'DOUBLE_LEFT_FIXED': case 'DOUBLE_LEFT_FIXED_TOP': return ['fixed','movingL','movingR'];
      case 'DOUBLE_RIGHT_FIXED_TOP': return ['movingL','movingR','fixed'];
      case 'DOUBLE_BOTH_FIXED_TOP': return ['fixed','movingL','movingR','fixed'];
      case 'DOUBLE': case 'DOUBLE_TOP': return ['movingL','movingR'];
      default: return ['moving'];
    }
  }
  function doorBlock(p){
    const b=frameBase(p.width,p.height,50), e=b.e, type=DOOR_TYPES.has(p.doorType)?p.doorType:'SINGLE';
    const top=TOP_FIXED.has(type); const movingH=top?clamp(n(p.movingLeafHeight,Math.max(1200,b.ih-500)),1200,b.ih-110):b.ih;
    const splitY=b.iy+movingH;
    if(top){ e.push(line(b.ix,splitY,b.ix+b.iw,splitY)); addGlass(e,b.ix+10,splitY+10,b.iw-20,b.iy+b.ih-splitY-10); }
    const parts=doorParts(type), pw=b.iw/parts.length;
    parts.forEach((part,i)=>{ const x=b.ix+i*pw; if(i) e.push(line(x,b.iy,x,splitY)); addGlass(e,x+10,b.iy+10,pw-20,movingH-20); if(part.startsWith('moving')){
      const right = part==='movingR' || (!DOUBLE.has(type) && String(p.hingeDirection||'LEFT')==='LEFT');
      const active = part==='moving' || (part==='movingL' && String(p.activeLeaf||'RIGHT')==='LEFT') || (part==='movingR' && String(p.activeLeaf||'RIGHT')==='RIGHT');
      if(active){ const hx=right?x+pw-55:x+55; e.push(line(hx,b.iy+movingH*.43,hx,b.iy+movingH*.57,LAYERS.symbol,{semanticRole:'product-handle'})); }
      const dir=String(p.doorOpenDirection||'OUTWARD')==='INWARD'?-1:1; const sx=right?x+pw:x; const ex=right?x+pw-pw*.55:x+pw*.55;
      e.push(line(sx,b.iy,ex,b.iy+dir*Math.min(280,movingH*.18),LAYERS.symbol,{semanticRole:active?'product-door-swing-active':'product-door-swing-passive'}));
    }});
    e.push(text(b.w/2,b.h+85,`KAPI · ${type.replaceAll('_',' ')}`,52));
    e.push(text(b.w/2,b.h+145,`${p.doorOpenDirection==='INWARD'?'İÇE':'DIŞA'} · ${p.handleType==='PANIC'?'PANİK BAR':'NORMAL KOL'}`,42));
    return {entities:e,bounds:{minX:-40,minY:-210,maxX:b.w+220,maxY:b.h+190}};
  }
  function fixedBlock(p){
    const b=frameBase(p.width,p.height,50), e=b.e; addGlass(e,b.ix+8,b.iy+8,b.iw-16,b.ih-16);
    const v=clamp(Math.round(n(p.verticalDivisions,0)),0,20), h=clamp(Math.round(n(p.horizontalDivisions,1)),1,10);
    for(let i=1;i<=v;i++){ const x=b.ix+b.iw*i/(v+1); e.push(line(x,b.iy,x,b.iy+b.ih)); }
    const raw=String(p.horizontalHeights||'').split(/[,;]+/).map(Number).filter(x=>Number.isFinite(x)&&x>0), sum=raw.reduce((a,c)=>a+c,0);
    if(raw.length===h && Math.abs(sum-b.h)<5){ let y=0; for(let i=0;i<raw.length-1;i++){ y+=raw[i]; if(y>b.iy&&y<b.iy+b.ih)e.push(line(b.ix,y,b.ix+b.iw,y)); } }
    else if(raw.length===h && Math.abs(sum-b.ih)<5){ let y=b.iy; for(let i=0;i<raw.length-1;i++){ y+=raw[i]; e.push(line(b.ix,y,b.ix+b.iw,y)); } }
    else for(let i=1;i<h;i++){ const y=b.iy+b.ih*i/h; e.push(line(b.ix,y,b.ix+b.iw,y)); }
    e.push(text(b.w/2,b.h+85,`SABİT DOĞRAMA · D${v} / Y${h}`,52));
    return {entities:e,bounds:{minX:-40,minY:-210,maxX:b.w+220,maxY:b.h+140}};
  }
  function foldingBlock(p){
    const b=frameBase(p.width,p.height,70), e=b.e, panels=clamp(Math.round(n(p.panels,4)),2,24);
    const view=String(p.foldingView||'INSIDE VIEW')==='OUTSIDE VIEW'?'OUTSIDE VIEW':'INSIDE VIEW';
    const selected=String(p.openingDirection||'RIGHT');
    const dir=view==='INSIDE VIEW'?(selected==='LEFT'?'RIGHT':selected==='RIGHT'?'LEFT':selected):selected;
    const collected=String(p.collectionState||'NORMAL')==='COLLECTED';
    const series=String(p.series||'A SERIES')==='K SERIES'?'K SERIES':'A SERIES';
    const subtype=series==='A SERIES'&&String(p.subtype||'STANDARD')==='TOP-HUNG'?'TOP-HUNG':'STANDARD';
    e.push(rect(b.ix,0,b.iw,70,LAYERS.profile,{semanticRole:'product-threshold'}));
    if(collected){
      const packagePitch=Math.max(33,Math.min(70,b.iw/Math.max(2,panels))), packageW=Math.max(45,Math.min(b.iw,packagePitch*Math.min(panels,8)));
      const packages=dir==='BOTH'?2:1, eachPanels=dir==='BOTH'?Math.ceil(panels/2):panels;
      const drawPackage=(left,count)=>{ const base=left?b.ix:b.ix+b.iw-packageW; const pitch=Math.max(6,Math.min(packageW/Math.max(1,count),33)); for(let i=0;i<count;i++){ const x=left?base+i*pitch:base+packageW-(i+1)*pitch; e.push(rect(x,b.iy,Math.max(5,pitch*.7),b.ih,LAYERS.frame,{semanticRole:'product-folding-package'})); } };
      if(dir==='LEFT'||dir==='BOTH')drawPackage(true,dir==='BOTH'?eachPanels:panels);
      if(dir==='RIGHT'||dir==='BOTH')drawPackage(false,dir==='BOTH'?panels-eachPanels:panels);
      e.push(text(b.w/2,b.h*.56,'TOPLANMIŞ',60,{semanticRole:'product-state-label'}));
    }else{
      const pw=b.iw/panels;
      for(let i=0;i<panels;i++){ const x=b.ix+i*pw; if(i)e.push(line(x,b.iy,x,b.iy+b.ih,LAYERS.profile,{semanticRole:'product-mullion'})); addGlass(e,x+8,b.iy+8,pw-16,b.ih-16); const hx=i%2?x+12:x+pw-12; e.push(line(hx,b.iy+b.ih*.42,hx,b.iy+b.ih*.58,LAYERS.symbol,{semanticRole:'product-handle'})); }
      if(dir==='BOTH'){ arrow(e,b.w*.48,b.h*.48,b.w*.23,b.h*.48); arrow(e,b.w*.52,b.h*.48,b.w*.77,b.h*.48); }
      else if(dir==='LEFT') arrow(e,b.w*.6,b.h*.48,b.w*.25,b.h*.48); else arrow(e,b.w*.4,b.h*.48,b.w*.75,b.h*.48);
    }
    const glass=String(p.glassColor||'TRANSPARENT')==='OTHER'&&String(p.customGlassColor||'').trim()?String(p.customGlassColor).trim():String(p.glassColor||'TRANSPARENT');
    e.push(text(b.w/2,b.h+85,`${p.displayProductName||'AKORDİYON CAM'} · ${panels} PANEL · ${selected} · ${view}`,52));
    e.push(text(b.w/2,b.h+145,`${series} · ${subtype} · ${p.foldingOpenDirection==='OUTWARD'?'DIŞA':'İÇE'} · ${p.glassThickness||'8 MM'} · ${glass} · 70 mm ALT PROFİL`,42));
    return {entities:e,bounds:{minX:-40,minY:-210,maxX:b.w+220,maxY:b.h+190}};
  }
  function canonicalGlass(v){ return ['TRANSPARENT','GREY','BRONZE','LOW-E GLASS','OTHER'].includes(v)?v:'TRANSPARENT'; }

  const door=createAdapter({
    id:'DOOR', label:'Kapı', aliases:['door','Kapı','KAPI'], accessProductId:'PERGO_RISE', schemaVersion:1, defaultWidth:1000, defaultHeight:2500,
    defaults:{id:'DOOR-001',pozNo:'K01',type:'door',doorType:'SINGLE',hingeDirection:'LEFT',activeLeaf:'RIGHT',doorOpenDirection:'OUTWARD',handleType:'NORMAL',movingLeafHeight:2200,topFixedHeight:500,view:'OUTSIDE VIEW',glassThickness:'8 MM',glassColor:'TRANSPARENT',customGlassColor:''},
    normalizePlacement(p){ const q={...p,type:'door'}; q.doorType=DOOR_TYPES.has(q.doorType)?q.doorType:'SINGLE'; q.hingeDirection=q.hingeDirection==='RIGHT'?'RIGHT':'LEFT'; q.activeLeaf=q.activeLeaf==='LEFT'?'LEFT':'RIGHT'; q.doorOpenDirection=q.doorOpenDirection==='INWARD'?'INWARD':'OUTWARD'; q.handleType=q.handleType==='PANIC'?'PANIC':'NORMAL'; q.movingLeafHeight=Math.max(1200,Math.round(n(q.movingLeafHeight,2200))); q.topFixedHeight=Math.max(110,Math.round(n(q.topFixedHeight,500))); q.glassColor=canonicalGlass(q.glassColor); return q; },
    buildBlock:doorBlock,
    validate(p){ const a=[]; if(n(p.width)<650)a.push('Kapı genişliği en az 650 mm olmalı.'); if(n(p.height)<1800)a.push('Kapı yüksekliği en az 1800 mm olmalı.'); return a; }
  });
  const fixed=createAdapter({
    id:'FIXED_JOINERY', label:'Sabit Doğrama', aliases:['fixed','Sabit Doğrama','SABIT_DOGRAMA','FIXED'], accessProductId:'PERGO_RISE', schemaVersion:1, defaultWidth:1800, defaultHeight:2200,
    defaults:{id:'FIXED-001',pozNo:'SBD01',type:'fixed',glassThickness:'8 MM',glassColor:'TRANSPARENT',customGlassColor:'',verticalDivisions:0,horizontalDivisions:1,horizontalHeights:'',horizontalHeightManual:null},
    normalizePlacement(p){ const q={...p,type:'fixed'}; q.verticalDivisions=clamp(Math.round(n(q.verticalDivisions,0)),0,20); q.horizontalDivisions=clamp(Math.round(n(q.horizontalDivisions,1)),1,10); q.horizontalHeights=String(q.horizontalHeights||''); q.glassColor=canonicalGlass(q.glassColor); return q; },
    buildBlock:fixedBlock,
    validate(p){ const a=[]; if(n(p.width)<350)a.push('Sabit Doğrama genişliği en az 350 mm olmalı.'); if(n(p.height)<500)a.push('Sabit Doğrama yüksekliği en az 500 mm olmalı.'); return a; }
  });
  const folding=createAdapter({
    id:'FOLDING_GLASS', label:'Akordiyon Cam', aliases:['folding','Katlanır Cam','KATLANIR_CAM','FOLDING'], accessProductId:'PERGO_RISE', schemaVersion:1, defaultWidth:3000, defaultHeight:2400,
    defaults:{id:'FOLDING-001',pozNo:'KC01',type:'folding',series:'A SERIES',subtype:'STANDARD',openingType:'FOLDING',openingDirection:'RIGHT',glassThickness:'8 MM',glassColor:'TRANSPARENT',customGlassColor:'',panels:5,foldingView:'INSIDE VIEW',foldingOpenDirection:'INWARD',collectionState:'NORMAL',thresholdProfile:70},
    normalizePlacement(p){ const q={...p,type:'folding',openingType:'FOLDING',thresholdProfile:70}; q.series=q.series==='K SERIES'?'K SERIES':'A SERIES'; q.subtype=q.series==='A SERIES'&&String(q.subtype||'STANDARD')==='TOP-HUNG'?'TOP-HUNG':'STANDARD'; q.panels=clamp(Math.round(n(q.panels,4)),2,24); q.openingDirection=q.panels>8?'BOTH':(['LEFT','RIGHT','BOTH'].includes(q.openingDirection)?q.openingDirection:'RIGHT'); q.foldingView=q.foldingView==='OUTSIDE VIEW'?'OUTSIDE VIEW':'INSIDE VIEW'; q.foldingOpenDirection=q.foldingOpenDirection==='OUTWARD'?'OUTWARD':'INWARD'; q.collectionState=q.collectionState==='COLLECTED'?'COLLECTED':'NORMAL'; q.glassColor=canonicalGlass(q.glassColor); return q; },
    buildBlock:foldingBlock,
    validate(p){ const a=[]; if(n(p.width)<360)a.push('Akordiyon Cam genişliği en az 360 mm olmalı.'); if(n(p.height)<500)a.push('Akordiyon Cam yüksekliği en az 500 mm olmalı.'); return a; }
  });
  root.PulumurStandaloneFacadeAdapters=Object.freeze({door,fixed,folding});
})(typeof window !== 'undefined' ? window : globalThis);
