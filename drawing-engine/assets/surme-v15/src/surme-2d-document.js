(function(root,factory){
  if(typeof module==='object'&&module.exports) module.exports=factory(require('./surme-state.js'));
  else root.PLMRSurme2DDocument=factory(root.PLMRSurmeState);
})(typeof window!=='undefined'?window:globalThis,function(State){
  'use strict';
  if(!State) throw new Error('SURME_2D_STATE_MISSING');

  const LAYERS=Object.freeze({
    post:'Dikme - Sürme', base:'Alt Baza Profili', threshold:'Alt Eşik Profili - Sürme', motor:'Üst Baza Profili - Sürme', panels:'Kasa Profilleri - Sürme',
    dimension:'Ölçümlendirme', info:'Bilgilendirme Yazıları', outer:'Dış Çerçeve',
    logo:'PLMR', title:'Antetler'
  });
  const LAYER_LIST=Object.freeze(['0',LAYERS.post,LAYERS.base,LAYERS.threshold,LAYERS.motor,LAYERS.panels,LAYERS.dimension,LAYERS.info,LAYERS.outer,LAYERS.logo,LAYERS.title,'Defpoints']);
  const LOGO_POLYLINES=[[[145.216,43.3642],[145.216,0.0],[155.2469,0.0],[155.2469,16.358],[155.4012,16.5123],[158.4877,16.5123],[158.642,16.358],[159.7222,16.358],[159.8765,16.2037],[160.3395,16.2037],[161.7284,15.5864],[162.3457,15.1234],[163.4259,13.8889],[164.0432,12.9629],[165.4321,10.1852],[165.4321,9.8765],[166.5123,7.716],[166.5123,7.4074],[167.5926,5.2469],[167.5926,4.9383],[168.2099,3.858],[168.2099,3.5494],[169.2901,1.3889],[169.2901,1.0802],[169.7531,0.3086],[169.7531,0.0],[180.4012,0.0],[180.4012,0.3086],[179.6296,1.6975],[179.6296,2.0062],[179.0123,3.0864],[179.0123,3.395],[177.3148,6.9444],[177.3148,7.2531],[176.6975,8.3333],[176.6975,8.642],[176.0802,9.7222],[176.0802,10.0308],[175.463,11.1111],[175.463,11.4197],[174.8457,12.5],[174.8457,12.8086],[173.7654,14.8148],[173.9198,15.1234],[178.7037,10.6481],[183.7963,8.0247],[184.1049,7.716],[185.4938,7.0987],[185.8025,6.7901],[188.1173,5.7099],[188.4259,5.4012],[190.1235,4.6296],[190.4321,4.321],[193.8272,2.6234],[194.1358,2.3148],[196.142,1.3889],[196.4506,1.0802],[197.8395,0.4629],[198.1481,0.1543],[199.6914,-0.6173],[200.0,-0.6173],[199.537,-0.463],[196.6049,1.5432],[196.142,1.6975],[191.9753,4.4753],[191.5123,4.6296],[189.0432,6.3271],[188.5802,6.4815],[187.3457,7.4074],[186.8827,7.5617],[184.4136,9.2592],[183.9506,9.4136],[182.2531,10.6481],[181.7901,10.8025],[178.0864,13.2716],[177.6235,13.4259],[176.3889,14.3518],[175.9259,14.5062],[173.4568,16.2037],[172.9938,16.358],[172.3765,16.9753],[171.9136,17.7469],[170.9877,18.6728],[169.9074,19.4444],[168.2099,20.216],[168.5185,20.5247],[169.1358,20.8333],[169.4444,20.8333],[171.2963,21.9136],[173.1481,23.6111],[173.9198,24.6913],[174.6914,26.2346],[174.6914,26.5432],[175.1543,27.6234],[175.1543,28.2407],[175.3086,28.395],[175.3086,29.1667],[175.463,29.321],[175.463,33.642],[175.3086,33.7963],[175.3086,34.5679],[175.1543,34.7222],[175.0,35.9568],[174.537,36.8827],[174.537,37.1913],[173.4568,39.0432],[171.7593,40.7407],[170.8333,41.358],[169.5988,41.9753],[168.8272,42.1296],[168.3642,42.4383],[167.9012,42.4383],[167.7469,42.5926],[166.6667,42.7469],[166.5123,42.9012],[165.8951,42.9012],[165.7407,43.0555],[163.5802,43.2099],[163.4259,43.3642],[145.216,43.3642]],[[155.4012,35.3395],[161.2654,35.3395],[161.4198,35.1852],[162.037,35.1852],[163.5802,34.5679],[164.8148,33.3333],[165.4321,31.7901],[165.4321,30.8642],[165.5864,30.7099],[165.5864,28.7037],[165.4321,28.5494],[165.4321,27.7778],[165.2778,27.6234],[165.1235,26.8518],[164.5062,25.7716],[163.8889,25.1543],[162.8086,24.537],[161.8827,24.3827],[161.7284,24.2284],[160.9568,24.2284],[160.8025,24.0741],[155.4012,24.0741],[155.2469,24.2284],[155.2469,35.1852],[155.4012,35.3395]],[[39.5062,43.3642],[39.5062,0.0],[67.1296,0.0],[67.1296,8.3333],[49.537,8.3333],[49.3827,8.4876],[49.3827,43.3642],[39.5062,43.3642]],[[22.6852,42.7469],[21.4506,42.9012],[21.2963,43.0555],[20.5247,43.0555],[20.3704,43.2099],[19.2901,43.2099],[19.1358,43.3642],[0.0,43.3642],[0.0,0.0],[10.0309,0.0],[10.0309,14.9691],[10.1852,15.1234],[19.2901,15.1234],[19.4444,15.2778],[20.5247,15.2778],[20.679,15.4321],[21.2963,15.4321],[21.4506,15.5864],[22.0679,15.5864],[23.3025,16.0494],[23.7654,16.0494],[26.3889,17.2839],[27.4691,18.0555],[29.0123,19.4444],[30.2469,21.142],[31.1728,22.9938],[31.1728,23.3025],[31.6358,24.3827],[31.6358,24.8457],[31.9444,25.6173],[31.9444,26.3889],[32.0988,26.5432],[32.0988,28.2407],[32.2531,28.395],[32.0988,31.9444],[31.9444,32.0987],[31.9444,32.8704],[31.7901,33.0247],[31.7901,33.4876],[31.6358,33.642],[31.6358,34.1049],[31.4815,34.2592],[31.1728,35.4938],[29.6296,38.2716],[28.7037,39.1975],[28.7037,39.3518],[27.4691,40.4321],[26.0802,41.358],[24.8457,41.9753],[24.537,41.9753],[24.0741,42.2839],[23.7654,42.2839],[22.6852,42.7469]],[[10.1852,35.3395],[17.1296,35.3395],[17.284,35.1852],[17.9012,35.1852],[19.5988,34.4136],[20.8333,33.179],[21.4506,32.0987],[21.4506,31.7901],[21.7593,31.1728],[21.7593,30.5555],[21.9136,30.4012],[21.9136,28.2407],[21.7593,28.0864],[21.7593,27.3148],[20.9877,25.4629],[19.5988,24.0741],[18.3642,23.4568],[17.4383,23.3025],[17.284,23.1481],[10.1852,23.1481],[10.0309,23.3025],[10.0309,35.1852],[10.1852,35.3395]],[[141.0494,1.0802],[139.6605,2.1605],[139.9691,2.4691],[140.7407,2.7778],[140.5864,3.395],[140.1235,4.1667],[140.1235,4.4753],[139.3519,6.0185],[139.3519,6.3271],[139.0432,6.7901],[138.7346,7.8704],[138.2716,8.642],[138.2716,8.9506],[137.963,9.4136],[137.6543,10.4938],[137.1914,11.2654],[136.8827,12.3457],[136.4198,13.1173],[136.4198,13.4259],[136.1111,13.8889],[136.1111,14.1975],[135.8025,14.6605],[135.4938,15.7407],[135.0309,16.5123],[135.0309,16.821],[134.2593,18.3642],[133.9506,19.4444],[133.4877,20.216],[133.4877,20.5247],[133.179,20.9876],[132.8704,22.0679],[132.4074,22.8395],[132.4074,23.1481],[132.0988,23.6111],[131.7901,24.6913],[130.5556,27.3148],[130.5556,27.6234],[130.2469,28.0864],[129.9383,29.1667],[128.7037,31.7901],[128.5494,32.5617],[128.0864,33.3333],[127.7778,34.4136],[126.8519,36.2654],[126.8519,36.5741],[126.5432,37.037],[126.5432,37.3457],[126.2346,37.8086],[125.9259,38.8889],[125.463,39.6605],[125.463,39.9691],[125.1543,40.4321],[124.8457,41.5123],[124.3827,42.2839],[124.3827,42.5926],[123.9198,43.3642],[123.6111,44.4444],[123.1481,45.216],[123.1481,45.5247],[122.8395,45.9876],[122.8395,46.2963],[122.5309,46.7592],[122.2222,47.8395],[121.6049,49.0741],[120.216,50.4629],[118.5185,51.0802],[116.6667,50.9259],[115.4321,50.3086],[114.1975,48.9197],[113.7346,47.9938],[113.7346,47.6852],[112.5,45.3704],[112.5,45.0617],[111.2654,42.7469],[111.2654,42.4383],[110.0309,40.1234],[110.0309,39.8148],[107.4074,34.5679],[107.4074,34.2592],[106.4815,32.5617],[106.4815,32.2531],[104.784,29.0123],[104.784,28.7037],[103.858,27.0062],[103.858,26.6975],[102.6235,24.3827],[102.6235,24.0741],[101.0802,21.142],[101.0802,20.8333],[100.463,19.5987],[100.1543,19.2901],[92.4383,29.6296],[91.6667,30.4012],[90.7407,31.0185],[90.4321,31.0185],[89.8148,31.3271],[88.1173,31.3271],[86.8827,30.8642],[85.4938,29.6296],[84.7222,28.2407],[83.179,26.0802],[83.0247,25.6173],[81.4815,23.4568],[81.3272,22.9938],[79.784,20.8333],[79.6296,20.3704],[77.4691,17.2839],[77.3148,16.821],[72.3765,9.4136],[72.2222,8.9506],[68.5185,3.395],[69.7531,2.6234],[67.9012,1.0802],[72.2222,1.0802],[74.6914,-0.6173],[76.0802,-0.6173],[89.1975,19.5987],[97.5309,8.4876],[98.4568,7.5617],[100.0,6.7901],[102.1605,6.7901],[103.2407,7.2531],[104.4753,8.3333],[104.9383,9.2592],[105.2469,9.5679],[105.2469,9.8765],[106.1728,11.5741],[106.1728,11.8827],[107.4074,14.1975],[107.4074,14.5062],[108.7963,17.1296],[108.7963,17.4383],[110.0309,19.7531],[110.0309,20.0617],[111.2654,22.3765],[111.2654,22.6852],[112.6543,25.3086],[112.6543,25.6173],[113.5802,27.3148],[113.5802,27.6234],[115.1235,30.5555],[115.1235,30.8642],[117.5926,35.9568],[117.7469,35.9568],[118.0556,35.4938],[118.0556,35.1852],[118.8272,33.642],[119.1358,32.5617],[119.5988,31.7901],[119.5988,31.4815],[119.9074,31.0185],[119.9074,30.7099],[120.216,30.2469],[120.5247,29.1667],[120.9877,28.395],[121.2963,27.3148],[121.7593,26.5432],[121.7593,26.2346],[122.5309,24.6913],[122.5309,24.3827],[122.8395,23.9197],[122.8395,23.6111],[123.1481,23.1481],[123.4568,22.0679],[123.9198,21.2963],[124.2284,20.216],[125.1543,18.3642],[125.1543,18.0555],[125.463,17.5926],[125.463,17.2839],[125.7716,16.821],[126.0802,15.7407],[126.5432,14.9691],[126.5432,14.6605],[126.8519,14.1975],[126.8519,13.8889],[127.1605,13.4259],[127.4691,12.3457],[127.9321,11.5741],[128.2407,10.4938],[129.1667,8.642],[129.1667,8.3333],[129.4753,7.8704],[129.784,6.7901],[130.2469,6.0185],[130.2469,5.7099],[130.5556,5.2469],[130.8642,4.1667],[131.3272,3.395],[131.3272,3.0864],[131.6358,2.6234],[131.6358,2.3148],[132.0988,1.5432],[132.0988,1.2346],[132.8704,-0.463],[133.9506,-0.1543],[136.5741,1.0802],[141.0494,1.0802]]];
  const TITLE_WIDTH=3100;
  const FRAME_INSET=60;
  const SHEET_MARGIN=350;
  const TITLE_GAP=420;
  const POSITION_H_GAP=520;
  const POSITION_V_GAP=460;
  const DIM_OFFSET=220;
  const DIM_TEXT_HEIGHT=100;
  const TEXT_HEIGHT=92;
  const TITLE_TEXT_HEIGHT=82;
  const PANEL_FRAME_FACE=50;
  const PANEL_OVERLAP=50;
  const PRODUCT_TABLE_WIDTH=7500;
  const PRODUCT_TABLE_TITLE_H=176;
  const PRODUCT_TABLE_TEXT_HEIGHT=60; // 70% of the 86-unit ÜRÜN / POZ DETAY LİSTESİ title text
  function glassTypeLabel(o){if(['OTHER','VARIABLE'].includes(String(o&&o.glassType).toUpperCase()))return 'Diğer';return String(o&&o.glassType||'SINGLE GLASS').toUpperCase()==='INSULATED GLASS'?'Isıcam':'Tekcam';}
  function glassThicknessLabel(o){const v=String(o&&o.glassThickness||'').toUpperCase();if(v==='INSULATED GLASS')return'4mm TEMP.+12mm HB+4mm TEMP.';if(v==='OTHER')return clean(o&&o.customGlassThickness)||'Diğer';return display(v);}
  function glassColorLabel(o){const v=String(o&&o.glassColor||'').toUpperCase();if(v==='OTHER')return clean(o&&o.customGlassColor)||'Diğer';return ({'FUME':'Füme','TRANSPARENT':'Şeffaf','BRONZE':'Bronz','LOW-E GLASS':'Low-E'}[v]||display(v));}
  function seriesLabel(v){return String(v||'').replace(/ SERIES$/i,' Serisi')||'—';}


  const finite=(v,f=0)=>Number.isFinite(Number(v))?Number(v):f;
  const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
  const clean=v=>String(v==null?'':v).trim();
  const display=v=>clean(v)||'—';
  const rect=(x,y,w,h,layer,extra)=>({type:'polyline',layer,color:256,closed:true,points:[[x,y],[x+w,y],[x+w,y+h],[x,y+h]],...(extra||{})});
  const line=(x1,y1,x2,y2,layer,extra)=>({type:'line',layer,color:256,x1,y1,x2,y2,...(extra||{})});
  const text=(x,y,value,layer,height=TEXT_HEIGHT,rotation=0,align='center',extra)=>({type:'text',layer,color:256,x,y,value:String(value==null?'':value),height,rotation,align,...(extra||{})});

  function normalizeView(v){const s=clean(v).toUpperCase();return s.includes('INSIDE')||s.includes('İÇ')?'INSIDE':'OUTSIDE';}
  function viewLabel(view){if(['OTHER','VARIABLE'].includes(String(view).toUpperCase()))return 'Diğer';return normalizeView(view)==='INSIDE'?'İÇ BAKIŞ':'DIŞ BAKIŞ';}
  function formatMm(v){return `${Math.round(finite(v))} mm`;}
  function formatInch(v){return `${(finite(v)/25.4).toFixed(2)}"`;}
  function formatDimension(v,units){
    const formatter=typeof module==='object'&&module.exports?require('../../../shared/measurement-units.js'):window.PLMRUnits;
    if(formatter)return formatter.formatMeasurement(finite(v),units);
    const u=units||{mm:true,inch:false},parts=[];
    if(u.mm!==false)parts.push(formatMm(v));
    if(u.inch)parts.push(formatInch(v));
    return parts.join(' - ')||formatMm(v);
  }
  function directionLabel(options){
    const o=options||{};
    if(['OTHER','VARIABLE'].includes(String(o.openingDirection).toUpperCase()))return 'Diğer';
    if(String(o.openingType||'').toUpperCase()==='CENTER OPENING')return String(o.openingDirection||'OUTSIDE').toUpperCase()==='INSIDE'?'(İÇTE)':'(DIŞTA)';
    return String(o.openingDirection||'RIGHT').toUpperCase()==='LEFT'?'SOL':'SAĞ';
  }
  function openingLabel(value){return String(value||'SIDE OPENING').toUpperCase()==='CENTER OPENING'?'MERKEZDEN AÇILIM':'KENARDAN AÇILIM';}
  function typeLabel(value){if(['OTHER','VARIABLE'].includes(String(value).toUpperCase()))return 'Diğer';return String(value||'WITH THRESHOLD').toUpperCase()==='WITHOUT THRESHOLD'?'EŞİKSİZ':'EŞİKLİ';}

  function dimensionGraphics(axis,p1,p2,dimLine,label,rotation){
    const tick=45,items=[];
    if(axis==='x'){
      items.push(line(p1.x,p1.y,p1.x,dimLine.y,LAYERS.dimension),line(p2.x,p2.y,p2.x,dimLine.y,LAYERS.dimension),line(p1.x,dimLine.y,p2.x,dimLine.y,LAYERS.dimension));
      items.push(line(p1.x,dimLine.y-tick,p1.x,dimLine.y+tick,LAYERS.dimension),line(p2.x,dimLine.y-tick,p2.x,dimLine.y+tick,LAYERS.dimension));
      items.push(text((p1.x+p2.x)/2,dimLine.y+95,label,LAYERS.dimension,DIM_TEXT_HEIGHT,0,'center'));
    }else{
      items.push(line(p1.x,p1.y,dimLine.x,p1.y,LAYERS.dimension),line(p2.x,p2.y,dimLine.x,p2.y,LAYERS.dimension),line(dimLine.x,p1.y,dimLine.x,p2.y,LAYERS.dimension));
      items.push(line(dimLine.x-tick,p1.y,dimLine.x+tick,p1.y,LAYERS.dimension),line(dimLine.x-tick,p2.y,dimLine.x+tick,p2.y,LAYERS.dimension));
      items.push(text(dimLine.x-95,(p1.y+p2.y)/2,label,LAYERS.dimension,DIM_TEXT_HEIGHT,90,'center'));
    }
    return items;
  }
  function makeDimension(axis,p1,p2,dimLine,actualValue,displayLabel,id){
    const graphics=dimensionGraphics(axis,p1,p2,dimLine,String(Math.round(actualValue)),axis==='y'?90:0);
    return {type:'dimension',layer:LAYERS.dimension,color:256,dimensionId:id,p1,p2,dimLine,text:axis==='x'?{x:(p1.x+p2.x)/2,y:dimLine.y+95}:{x:dimLine.x-95,y:(p1.y+p2.y)/2},textOverride:'<>',previewText:displayLabel,graphics};
  }
  function dashedLine(entities,x1,y1,x2,y2,layer,extra){
    const dx=x2-x1,dy=y2-y1,len=Math.max(1,Math.hypot(dx,dy)),ux=dx/len,uy=dy/len,dash=72,gap=46,step=dash+gap;
    for(let d=0;d<len;d+=step){const e=Math.min(len,d+dash);entities.push(line(x1+ux*d,y1+uy*d,x1+ux*e,y1+uy*e,layer,extra));}
  }
  function movementLine(entities,x1,y1,x2,y2,secondary){
    const extra={role:secondary?'movement-secondary':'movement-primary'};
    if(secondary)dashedLine(entities,x1,y1,x2,y2,LAYERS.info,extra);else entities.push(line(x1,y1,x2,y2,LAYERS.info,extra));
  }
  function slidingArrow(entities,panel,direction,y,secondary=false){
    const inset=Math.min(60,Math.max(18,(panel.x2-panel.x1)*.06)),x1=panel.x1+inset,x2=panel.x2-inset,head=Math.min(160,Math.max(45,(panel.x2-panel.x1)*.22)),half=Math.min(95,Math.max(28,head*.58));
    if(direction==='RIGHT'){
      movementLine(entities,x1,y,x2,y,secondary);movementLine(entities,x2,y,x2-head,y+half,secondary);movementLine(entities,x2,y,x2-head,y-half,secondary);
    }else{
      movementLine(entities,x2,y,x1,y,secondary);movementLine(entities,x1,y,x1+head,y+half,secondary);movementLine(entities,x1,y,x1+head,y-half,secondary);
    }
  }
  function positionLocalSpec(position,options,dimensionUnits){
    const width=finite(position.width),height=finite(position.height),count=Math.max(2,Math.trunc(finite(options&&options.panelCount,2)));
    if(!(width>0&&height>0)) throw new Error(`SURME_2D_INVALID_SIZE:${position.positionNo||position.id||''}`);
    const bounds={minX:-420,minY:-360,maxX:width+220,maxY:height+190};
    return {width,height,count,bounds,displayWidth:formatDimension(width,dimensionUnits),displayHeight:formatDimension(height,dimensionUnits),productMinX:0,productMaxX:width,productMinY:0,productMaxY:height};
  }
  function buildPositionEntities(position,options,origin,dimensionUnits){
    const s=positionLocalSpec(position,options,dimensionUnits),entities=[],x=origin.x,y=origin.y,w=s.width,h=s.height;
    const frame=50,baseH=15,topH=130,hasBottomBase=String(options.type||'WITH THRESHOLD').toUpperCase()==='WITH THRESHOLD',workingRailH=15,baseOffset=hasBottomBase?baseH:0,innerX=x+frame,innerW=Math.max(1,w-frame*2),panelBottom=y+baseOffset+workingRailH,panelTop=y+Math.max(baseOffset+workingRailH+60,h-topH),panelH=Math.max(60,panelTop-panelBottom),n=s.count,stile=30,overlap=30;
    if(hasBottomBase)entities.push(rect(x,y,w,baseH,LAYERS.base,{role:'bottom-base'}));
    entities.push(rect(x,y+(hasBottomBase?baseH:0),frame,Math.max(1,h-topH-(hasBottomBase?baseH:0)),LAYERS.post,{role:'left-jamb'}));
    entities.push(rect(x+w-frame,y+(hasBottomBase?baseH:0),frame,Math.max(1,h-topH-(hasBottomBase?baseH:0)),LAYERS.post,{role:'right-jamb'}));
    // 130 mm visible upper profile; panels terminate at the lower edge and do not intersect it.
    entities.push(rect(x,y+h-topH,w,topH,LAYERS.motor,{role:'top-profile'}));
    // Working lower rail is always present. Eşiksiz removes only the lowest base profile.
    entities.push(rect(innerX,y+baseOffset,innerW,workingRailH,LAYERS.threshold,{role:'threshold'}));
    const panels=[];
    const collected=String(options.collectionState||'NORMAL').toUpperCase()==='COLLECTED';
    const openingType=String(options.openingType||'SIDE OPENING').toUpperCase()==='CENTER OPENING'?'CENTER OPENING':'SIDE OPENING';
    const selectedDirection=openingType==='CENTER OPENING'?(String(options.openingDirection||'OUTSIDE').toUpperCase()==='INSIDE'?'INSIDE':'OUTSIDE'):(String(options.openingDirection||'RIGHT').toUpperCase()==='LEFT'?'LEFT':'RIGHT');
    const actualDirection=selectedDirection; // 2D sheet is drawn in the selected view, so left/right remain view-local.
    let panelW,closedCenters=[];
    if(openingType==='CENTER OPENING'&&n%2===0){
      const half=n/2,halfSpan=innerW/2;panelW=(halfSpan+overlap*(half-1))/half;
      for(let i=0;i<half;i++)closedCenters.push(innerX+panelW/2+i*(panelW-overlap));
      for(let i=0;i<half;i++)closedCenters.push(innerX+innerW/2+panelW/2+i*(panelW-overlap));
    }else{
      panelW=(innerW+overlap*(n-1))/n;for(let i=0;i<n;i++)closedCenters.push(innerX+panelW/2+i*(panelW-overlap));
    }
    const centers=[...closedCenters];
    if(collected){
      if(openingType==='CENTER OPENING'&&n%2===0){const half=n/2;for(let i=0;i<half;i++)centers[i]=innerX+panelW/2;for(let i=0;i<half;i++)centers[half+i]=innerX+innerW-panelW/2;}
      else{const stackLeft=actualDirection==='LEFT';for(let i=0;i<n;i++)centers[i]=stackLeft?innerX+panelW/2:innerX+innerW-panelW/2;}
    }
    centers.forEach((center,i)=>{
      const p={x1:center-panelW/2,x2:center+panelW/2,y1:panelBottom,y2:panelTop};panels.push(p);
      entities.push(rect(p.x1,p.y1,p.x2-p.x1,p.y2-p.y1,LAYERS.panels,{role:'panel-frame',panelIndex:i}));
      entities.push(rect(p.x1+stile,p.y1,Math.max(1,p.x2-p.x1-stile*2),Math.max(1,p.y2-p.y1),LAYERS.panels,{role:'panel-inner',panelIndex:i}));
    });
    if(!collected){
      const arrowY=panelBottom+panelH/2;
      if(openingType==='CENTER OPENING'){
        const leftCenter=Math.max(0,n/2-1),rightCenter=Math.min(n-1,n/2);
        // Center opening: only the two middle panels show movement arrows and they point away from each other.
        slidingArrow(entities,panels[leftCenter],'LEFT',arrowY,false);slidingArrow(entities,panels[rightCenter],'RIGHT',arrowY,false);
      }else if(selectedDirection==='LEFT'){
        // Side opening-left: edge arrows face each other; right-most lead panel moves left, left-most follower indicates the receiving direction.
        slidingArrow(entities,panels[n-1],'LEFT',arrowY,false);slidingArrow(entities,panels[0],'RIGHT',arrowY,true);
      }else{
        // Side opening-right: edge arrows face each other; left-most lead panel moves right, right-most follower indicates the receiving direction.
        slidingArrow(entities,panels[0],'RIGHT',arrowY,false);slidingArrow(entities,panels[n-1],'LEFT',arrowY,true);
      }
    }
    const labelInset=Math.max(105,Math.min(150,w*.045)),labelY=y+h-62,positionLabel=`${position.positionNo||'—'} - ${Math.max(1,Math.trunc(Number(position.quantity)||1))} Adet`;
    // Canonical Giyotin label discipline: position + view are written on the upper panel. Opening type is conveyed by the arrows/geometry.
    entities.push(text(x+labelInset,labelY,positionLabel,LAYERS.info,82,0,'left',{role:'position-label',quantityLabel:true}));
    if(['INSIDE VIEW','OUTSIDE VIEW'].includes(options.slidingView))entities.push(text(x+w/2,labelY,viewLabel(options.slidingView),LAYERS.info,82,0,'center',{role:'position-label'}));
    const widthDim=makeDimension('x',{x,y},{x:x+w,y},{x:x+w/2,y:y-DIM_OFFSET},w,s.displayWidth,`${position.id||position.positionNo}-W`);
    const heightDim=makeDimension('y',{x,y},{x,y:y+h},{x:x-DIM_OFFSET,y:y+h/2},h,s.displayHeight,`${position.id||position.positionNo}-H`);
    entities.push(widthDim,heightDim);
    return {entities,spec:s,panels,detail:{openingType,selectedDirection,actualDirection,collected}};
  }

  function wrapWords(value,width,fontH,padX=44,widthFactor=.72){
    const raw=display(value).replace(/\r\n/g,'\n').replace(/\r/g,'\n'),usable=Math.max(1,Number(width||0)-2*Number(padX||0)),maxChars=Math.max(1,Math.floor(usable/Math.max(1,Number(fontH||1)*widthFactor))),out=[];
    raw.split('\n').forEach(paragraph=>{
      const rawWords=String(paragraph).trim().split(/\s+/).filter(Boolean),words=[];
      rawWords.forEach(word=>{
        if(word.length<=maxChars){words.push(word);return;}
        for(let i=0;i<word.length;i+=maxChars)words.push(word.slice(i,i+maxChars));
      });
      if(!words.length){out.push('');return;}
      let current='';
      words.forEach(word=>{
        if(!current)current=word;
        else if((current+' '+word).length<=maxChars)current+=' '+word;
        else{out.push(current);current=word;}
      });
      if(current)out.push(current);
    });
    return out.length?out:['—'];
  }
  function fitCellValue(value,width,baseH=TITLE_TEXT_HEIGHT,padX=44,widthFactor=.72){
    const usable=Math.max(1,Number(width||0)-2*Number(padX||0)),raw=display(value),words=raw.replace(/\r\n/g,'\n').replace(/\r/g,'\n').split(/\s+/).filter(Boolean),longestWord=Math.max(1,...words.map(w=>w.length)),minH=14;
    const wordFit=usable/(longestWord*widthFactor),h=Math.max(minH,Math.min(baseH,wordFit)),lines=wrapWords(raw,width,h,padX,widthFactor),lineStep=h*1.22,blockH=h+Math.max(0,lines.length-1)*lineStep;
    return {h,lines,lineStep,blockH,padX,widthFactor};
  }
  function drawCellText(entities,x,y,w,rowH,plan,align='left'){
    const centerY=y+rowH/2,firstY=centerY+(plan.lines.length-1)*plan.lineStep/2,tx=align==='center'?x+w/2:align==='right'?x+w-plan.padX:x+plan.padX,cellWidth=Math.max(1,w-plan.padX*2),cellText=plan.lines.join('\n');
    plan.lines.forEach((value,index)=>{
      const ent=text(tx,firstY-index*plan.lineStep,value,LAYERS.title,plan.h,0,align,{cellWidth,cellHeight:rowH,wrapped:true,dxfPreviewLine:true});
      if(index===0){
        ent.dxfCellText=cellText;
        ent.dxfCellX=align==='center'?x+w/2:(align==='right'?x+w-plan.padX:x+plan.padX);
        ent.dxfCellY=centerY;
        ent.dxfCellWidth=cellWidth;
        ent.dxfCellHeight=rowH;
        ent.dxfAttachment=align==='center'?5:(align==='right'?6:4);
        ent.dxfLineSpacing=1.0;
      }else ent.dxfSkip=true;
      entities.push(ent);
    });
  }
  function sectionRowPlan(label,value,w,labelW=950){
    const labelPlan=fitCellValue(label,labelW,TITLE_TEXT_HEIGHT,44,.68),valuePlan=fitCellValue(value,w-labelW,TITLE_TEXT_HEIGHT,48,.72),rowH=Math.max(166,labelPlan.blockH+108,valuePlan.blockH+108);
    return {label,value,labelW,labelPlan,valuePlan,rowH};
  }
  function sectionRow(entities,x,y,w,plan){
    const h=plan.rowH,labelW=plan.labelW;
    entities.push(rect(x,y,w,h,LAYERS.title),line(x+labelW,y,x+labelW,y+h,LAYERS.title));
    drawCellText(entities,x,y,labelW,h,plan.labelPlan,'left');
    drawCellText(entities,x+labelW,y,w-labelW,h,plan.valuePlan,'left');
  }
  function sectionHeader(entities,x,y,w,h,label){
    const header=text(x+w/2,y+h/2,label,LAYERS.title,86,0,'center',{cellWidth:Math.max(1,w-180),cellHeight:h});
    header.dxfCellText=String(label||'');header.dxfCellX=x+w/2;header.dxfCellY=y+h/2;header.dxfCellWidth=Math.max(1,w-180);header.dxfCellHeight=h;header.dxfAttachment=5;header.dxfLineSpacing=1.0;
    entities.push(rect(x,y,w,h,LAYERS.title),header);
  }

  function productTableColumns(){
    return [
      {key:'positionNo',label:'POZ',w:200,align:'center'},
      {key:'width',label:'GENİŞLİK',w:500,align:'center'},
      {key:'height',label:'YÜKSEKLİK',w:500,align:'center'},
      {key:'quantity',label:'ADET',w:260,align:'center'},
      {key:'panelCount',label:'PANEL',w:300,align:'center'},
      {key:'view',label:'BAKIŞ',w:400,align:'center'},
      {key:'openingType',label:'AÇILIM DÜZENİ',w:560,align:'center'},
      {key:'openingDirection',label:'AÇILIM YÖNÜ\n(PANEL KONUMU)',w:800,align:'center'},
      {key:'description',label:'AÇIKLAMA',w:1050,align:'left'},
      {key:'series',label:'SERİ',w:300,align:'center'},
      {key:'systemColor',label:'SİSTEM RENGİ',w:420,align:'center'},
      {key:'surface',label:'YÜZEY',w:350,align:'center'},
      {key:'type',label:'ALT RAY / KASA',w:520,align:'center'},
      {key:'glassType',label:'CAM TİPİ',w:370,align:'center'},
      {key:'glassThickness',label:'CAM KALINLIĞI',w:520,align:'center'},
      {key:'glassColor',label:'CAM RENGİ',w:450,align:'center'}
    ];
  }
  function productTableRow(project,p){
    const o=State.resolveOptions(project,p),color=State.normalizeColor(project.commonSettings&&project.commonSettings.color||State.colorValue(project.commonSettings&&project.commonSettings.systemColor,project.commonSettings&&project.commonSettings.surface));
    return {
      positionNo:p.positionNo||'—',width:formatMm(p.width),height:formatMm(p.height),quantity:String(Math.max(1,Math.trunc(Number(p.quantity)||1))),panelCount:String(o.panelCount),
      view:viewLabel(o.slidingView),openingType:openingLabel(o.openingType),openingDirection:directionLabel(o),description:clean(p.description)||'—',series:seriesLabel(o.series),
      systemColor:color.code||'—',surface:color.finish||'—',type:typeLabel(o.type),glassType:glassTypeLabel(o),glassThickness:glassThicknessLabel(o),glassColor:glassColorLabel(o)
    };
  }
  function fixedProductCellValue(value,width,padX=24,widthFactor=.74){
    const h=PRODUCT_TABLE_TEXT_HEIGHT,raw=display(value),lines=wrapWords(raw,width,h,padX,widthFactor),lineStep=h*1.24,blockH=h+Math.max(0,lines.length-1)*lineStep;
    return {h,lines,lineStep,blockH,padX,widthFactor};
  }
  function productTablePlan(project){
    const columns=productTableColumns(),rows=(project.positions||[]).filter(p=>!p.hidden).map(p=>productTableRow(project,p));
    const headerPlans=columns.map(c=>fixedProductCellValue(c.label,c.w,24,.74));
    const headerH=Math.max(210,...headerPlans.map(p=>p.blockH+90));
    const rowPlans=rows.map(row=>{
      const cells=columns.map(c=>fixedProductCellValue(row[c.key],c.w,c.key==='description'?34:24,.74));
      const rowH=Math.max(190,...cells.map(p=>p.blockH+84));
      return {row,cells,rowH};
    });
    const height=PRODUCT_TABLE_TITLE_H+headerH+rowPlans.reduce((sum,r)=>sum+r.rowH,0);
    return {width:PRODUCT_TABLE_WIDTH,height,columns,rows,rowPlans,headerPlans,headerH,titleH:PRODUCT_TABLE_TITLE_H};
  }
  function buildProductTable(project,origin,planInput){
    const plan=planInput||productTablePlan(project),entities=[],x=origin.x,y=origin.y,w=plan.width,h=plan.height;
    entities.push(rect(x,y,w,h,LAYERS.title,{role:'product-detail-table'}));
    let cy=y+h-plan.titleH;
    sectionHeader(entities,x,cy,w,plan.titleH,'ÜRÜN / POZ DETAY LİSTESİ');
    cy-=plan.headerH;
    entities.push(rect(x,cy,w,plan.headerH,LAYERS.title,{role:'product-detail-table'}));
    let cx=x;
    plan.columns.forEach((col,i)=>{
      if(i>0)entities.push(line(cx,cy,cx,cy+plan.headerH,LAYERS.title,{role:'product-detail-table'}));
      drawCellText(entities,cx,cy,col.w,plan.headerH,plan.headerPlans[i],'center');
      cx+=col.w;
    });
    plan.rowPlans.forEach(rp=>{
      cy-=rp.rowH;entities.push(rect(x,cy,w,rp.rowH,LAYERS.title,{role:'product-detail-table'}));let rx=x;
      plan.columns.forEach((col,i)=>{if(i>0)entities.push(line(rx,cy,rx,cy+rp.rowH,LAYERS.title,{role:'product-detail-table'}));drawCellText(entities,rx,cy,col.w,rp.rowH,rp.cells[i],col.align);rx+=col.w;});
    });
    return {entities,bounds:{minX:x,minY:y,maxX:x+w,maxY:y+h,width:w,height:h},plan};
  }

  function titleBlockData(project){
    const p=project.projectInfo||{};
    return {
      projectRows:[['PROJE KODU',p.projectCode],['MÜŞTERİ',p.customerName],['ÜLKE',p.country],['PROJE ADI',p.projectName||p.projectCode],['REVİZYON',p.revision||'R01'],['TARİH',p.date||p.createdAt],['AÇIKLAMA',p.description||'']],
      representative:p.customerRepresentative||p.customerContact||'—',designer:p.designer||p.projectRepresentative||'—'
    };
  }

  function buildLogoBlock(){
    const entities=[];
    LOGO_POLYLINES.forEach(points=>entities.push({type:'polyline',layer:LAYERS.logo,color:256,closed:true,points:points.map(p=>[p[0],p[1]])}));
    return {entities};
  }

  function signatureCellPlan(label,value,width){
    const labelPlan=fitCellValue(label,width,56,48,.68),valuePlan=fitCellValue(value,width,62,48,.72),height=Math.max(540,70+labelPlan.blockH+70+valuePlan.blockH+70);
    return {labelPlan,valuePlan,height};
  }
  function titleBlockLayout(project){
    // V34 revised canonical PLMR title block: project identity + bottom logo/contact cells only.
    // Sürme product/detail data is intentionally kept out of the drawing title block.
    const data=titleBlockData(project),headH=176,labelW=950,projectPlans=data.projectRows.map(r=>sectionRowPlan(r[0],r[1],TITLE_WIDTH,labelW));
    const logoW=1150,signW=(TITLE_WIDTH-logoW)/2,repPlan=signatureCellPlan('MÜŞTERİ TEMSİLCİSİ',data.representative,signW),designerPlan=signatureCellPlan('PROJEYİ ÇİZEN',data.designer,signW),bottomH=Math.max(repPlan.height,designerPlan.height),topContentH=headH+projectPlans.reduce((sum,p)=>sum+p.rowH,0),requiredInnerHeight=topContentH+bottomH+180;
    return {data,headH,labelW,projectPlans,productPlan:null,logoW,signW,repPlan,designerPlan,bottomH,topContentH,requiredInnerHeight};
  }
  function drawSignatureText(entities,x,y,w,h,plan){
    const topPad=70,bottomPad=70,labelCenter=y+h-topPad-plan.labelPlan.blockH/2,valueCenter=y+bottomPad+plan.valuePlan.blockH/2;
    const drawAround=(subPlan,center)=>{
      const first=center+(subPlan.lines.length-1)*subPlan.lineStep/2,cellWidth=Math.max(1,w-96),cellText=subPlan.lines.join('\n');
      subPlan.lines.forEach((v,i)=>{
        const ent=text(x+w/2,first-i*subPlan.lineStep,v,LAYERS.title,subPlan.h,0,'center',{cellWidth,cellHeight:h,wrapped:true});
        if(i===0){ent.dxfCellText=cellText;ent.dxfCellX=x+w/2;ent.dxfCellY=center;ent.dxfCellWidth=cellWidth;ent.dxfAttachment=5;ent.dxfLineSpacing=0.75;}else ent.dxfSkip=true;
        entities.push(ent);
      });
    };
    drawAround(plan.labelPlan,labelCenter);drawAround(plan.valuePlan,valueCenter);
  }
  function buildTitleBlock(project,sheetHeight,layoutInput){
    const layout=layoutInput||titleBlockLayout(project),entities=[],x=FRAME_INSET,y=FRAME_INSET,w=TITLE_WIDTH,h=Math.max(1,sheetHeight-FRAME_INSET*2),data=layout.data,headH=layout.headH;
    entities.push(rect(x,y,w,h,LAYERS.title));
    const top=y+h;let cy=top-headH;
    sectionHeader(entities,x,cy,w,headH,'PROJE BİLGİLERİ');
    for(const plan of layout.projectPlans){cy-=plan.rowH;sectionRow(entities,x,cy,w,plan);}
    const productTable=null;

    const bottomH=layout.bottomH,logoW=layout.logoW,signX=x+logoW,signW=layout.signW;
    entities.push(line(x,y+bottomH,x+w,y+bottomH,LAYERS.title));
    entities.push(line(signX,y,signX,y+bottomH,LAYERS.title),line(signX+signW,y,signX+signW,y+bottomH,LAYERS.title));
    drawSignatureText(entities,signX,y,signW,bottomH,layout.repPlan);
    drawSignatureText(entities,signX+signW,y,signW,bottomH,layout.designerPlan);

    const logoPts=LOGO_POLYLINES.flat(),logoMinX=Math.min(...logoPts.map(p=>p[0])),logoMaxX=Math.max(...logoPts.map(p=>p[0])),logoMinY=Math.min(...logoPts.map(p=>p[1])),logoMaxY=Math.max(...logoPts.map(p=>p[1])),logoRawW=Math.max(1,logoMaxX-logoMinX),logoRawH=Math.max(1,logoMaxY-logoMinY),logoScale=Math.min(4.5,(logoW-180)/logoRawW,(bottomH-180)/logoRawH),logoX=x+logoW/2-((logoMinX+logoMaxX)/2)*logoScale,logoY=y+bottomH/2-((logoMinY+logoMaxY)/2)*logoScale;
    entities.push({type:'insert',layer:LAYERS.title,name:'PLMR - LOGO',x:logoX,y:logoY,scaleX:logoScale,scaleY:logoScale,rotation:0});
    return {entities,bounds:{minX:x,minY:y,maxX:x+w,maxY:y+h,width:w,height:h},data,productTable,layout:{bottomH,topContentH:layout.topContentH,requiredInnerHeight:layout.requiredInnerHeight},detailBlockRemoved:true};
  }

  function buildDocument(project,options){
    const opts=options||{},validation=State.validateProject(project);
    if(!validation.valid){const e=new Error(validation.errors[0]&&validation.errors[0].message||'SURME_2D_INVALID_PROJECT');e.code='SURME_2D_INVALID_PROJECT';e.validation=validation;throw e;}
    const columns=Math.max(1,Math.min(10,Math.trunc(finite(opts.columns,(project.layout&&project.layout.columnCount)||2))));
    const dimensionUnits=opts.dimensionUnits||project.drawingSettings&&project.drawingSettings.dimensionUnits||{mm:true,inch:false};
    const positions=State.expandedPositions(project).filter(p=>!p.hidden);
    if(!positions.length)throw new Error('SURME_2D_NO_POSITIONS');
    const prepared=positions.map(p=>{const o=State.resolveOptions(project,p),spec=positionLocalSpec(p,o,dimensionUnits);return {kind:'position',position:p,options:o,spec};});
    const rows=[];for(let i=0;i<prepared.length;i+=columns)rows.push(prepared.slice(i,i+columns));
    const rowMetrics=rows.map(row=>{const widths=row.map(e=>e.spec.bounds.maxX-e.spec.bounds.minX),heights=row.map(e=>e.spec.bounds.maxY-e.spec.bounds.minY);return {width:widths.reduce((a,b)=>a+b,0)+Math.max(0,row.length-1)*POSITION_H_GAP,height:Math.max(...heights)};});
    const drawingWidth=Math.max(...rowMetrics.map(r=>r.width)),drawingHeight=rowMetrics.reduce((a,r)=>a+r.height,0)+Math.max(0,rowMetrics.length-1)*POSITION_V_GAP,titleLayout=titleBlockLayout(project),minInnerHeight=7200;
    const innerHeight=Math.max(minInnerHeight,drawingHeight+SHEET_MARGIN*2,titleLayout.requiredInnerHeight),sheetHeight=innerHeight+FRAME_INSET*2,sheetWidth=FRAME_INSET*2+TITLE_WIDTH+TITLE_GAP+drawingWidth+SHEET_MARGIN*2,entities=[];
    const outerFrame={x:FRAME_INSET,y:FRAME_INSET,width:sheetWidth-FRAME_INSET*2,height:sheetHeight-FRAME_INSET*2};entities.push(rect(outerFrame.x,outerFrame.y,outerFrame.width,outerFrame.height,LAYERS.outer));
    const titleBlock=buildTitleBlock(project,sheetHeight,titleLayout);entities.push(...titleBlock.entities);
    const productTable=titleBlock.productTable,positionMeta=[],slotMeta=[];let topCursor=sheetHeight-FRAME_INSET-SHEET_MARGIN,slotIndex=0;
    rows.forEach((row,ri)=>{
      const rm=rowMetrics[ri];let xCursor=FRAME_INSET+TITLE_WIDTH+TITLE_GAP+SHEET_MARGIN;
      row.forEach(entry=>{
        const b=entry.spec.bounds,origin={x:xCursor-b.minX,y:topCursor-b.maxY},slotColumn=slotIndex%columns;
        const built=buildPositionEntities(entry.position,entry.options,origin,dimensionUnits);built.entities.forEach(entity=>{entity.positionId=entry.position.id;entity.positionNo=entry.position.positionNo;});entities.push(...built.entities);
        const meta={id:entry.position.id,positionNo:entry.position.positionNo,origin,cellBounds:{minX:xCursor,minY:topCursor-rm.height,maxX:xCursor+(b.maxX-b.minX),maxY:topCursor},productBounds:{minX:origin.x,minY:origin.y,maxX:origin.x+entry.spec.width,maxY:origin.y+entry.spec.height},width:entry.spec.width,height:entry.spec.height,view:viewLabel(entry.options.slidingView),opening:openingLabel(entry.options.openingType),quantity:entry.position.quantity,row:ri,column:slotColumn};positionMeta.push(meta);slotMeta.push({kind:'position',id:entry.position.id,row:ri,column:slotColumn,bounds:meta.cellBounds});
        xCursor+=(b.maxX-b.minX)+POSITION_H_GAP;slotIndex++;
      });topCursor-=rm.height+POSITION_V_GAP;
    });
    const blocks={'PLMR - LOGO':buildLogoBlock()};
    const layerStyle={
      [LAYERS.post]:{aci:5,stroke:'#0000ff',width:.35},[LAYERS.base]:{aci:5,stroke:'#0000ff',width:.35},[LAYERS.threshold]:{aci:5,stroke:'#0000ff',width:.35},[LAYERS.motor]:{aci:5,stroke:'#0000ff',width:.35},[LAYERS.panels]:{aci:5,stroke:'#0000ff',width:.30},[LAYERS.dimension]:{aci:1,stroke:'#ff0000',width:.25},[LAYERS.info]:{aci:5,stroke:'#0000ff',width:.30},[LAYERS.outer]:{aci:7,stroke:'#111111',width:.35},[LAYERS.logo]:{aci:7,stroke:'#111111',width:.30},[LAYERS.title]:{aci:7,stroke:'#111111',width:.25}
    };
    const previewBounds={minX:0,minY:0,maxX:sheetWidth,maxY:sheetHeight,width:sheetWidth,height:sheetHeight};
    const result={schema:'plmr-surme-2d-document-v3',units:'mm',modelScale:1,columns,layers:[...LAYER_LIST],layerStyle,blocks,entities,bounds:{minX:0,minY:0,maxX:sheetWidth,maxY:sheetHeight,width:sheetWidth,height:sheetHeight},previewBounds,outerFrame,titleBlock,productTable,slots:slotMeta,positions:positionMeta,metadata:{canonical:true,generatedAt:new Date().toISOString(),positionCount:positions.length,slotCount:prepared.length,rowCount:rows.length,columns,source:'standalone-surme-state-v49-v15-organized-dxf-v2',quantityExpansion:Boolean(project.commonSettings&&project.commonSettings.expandQuantity),productTableInTitleBlock:false,detailBlockRemoved:true,frameInsetMm:FRAME_INSET,dimensionUnits:{mm:dimensionUnits.mm!==false,inch:Boolean(dimensionUnits.inch)}}};
    validateDocument(result);return result;
  }

  function validateDocument(doc){
    const errors=[];
    if(!doc||doc.units!=='mm')errors.push('UNITS');
    if(!doc||!Array.isArray(doc.positions)||!doc.positions.length)errors.push('POSITIONS');
    (doc&&doc.positions||[]).forEach(p=>{if(!(p.width>0&&p.height>0))errors.push(`SIZE:${p.positionNo}`);if(!Number.isFinite(p.origin.x)||!Number.isFinite(p.origin.y))errors.push(`ORIGIN:${p.positionNo}`);});
    (doc&&doc.entities||[]).forEach((e,i)=>{
      const values=[];['x','y','x1','y1','x2','y2'].forEach(k=>{if(e[k]!=null)values.push(e[k]);});(e.points||[]).forEach(p=>values.push(...p));
      if(values.some(v=>!Number.isFinite(Number(v))))errors.push(`NAN_ENTITY:${i}`);
      if((e.type==='text'||e.type==='mtext')&&/undefined|NaN/.test(String(e.value)))errors.push(`BAD_TEXT:${i}`);
    });
    const dims=(doc&&doc.entities||[]).filter(e=>e.type==='dimension');
    if(dims.length!==(doc.positions.length*2))errors.push('DIMENSION_COUNT');
    if(!doc.blocks||!doc.blocks['PLMR - LOGO'])errors.push('LOGO_BLOCK');
    const result={valid:errors.length===0,errors};
    if(!result.valid){const err=new Error(`SURME_2D_DOCUMENT_INVALID:${errors.join(',')}`);err.validation=result;throw err;}
    return result;
  }

  return Object.freeze({LAYERS,LAYER_LIST,TITLE_WIDTH,FRAME_INSET,SHEET_MARGIN,PRODUCT_TABLE_WIDTH,buildDocument,validateDocument,formatDimension,viewLabel,openingLabel,directionLabel,typeLabel,positionLocalSpec,productTablePlan,LOGO_POLYLINES});
});
