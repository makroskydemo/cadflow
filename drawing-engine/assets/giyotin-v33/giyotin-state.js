(function(root){
'use strict';
const PRODUCT='GUILLOTINE';
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
  const V49_COMMON_DEFAULTS=Object.freeze({
    series:'A SERIES',
    glassThickness:'INSULATED GLASS',
    glassColor:'TRANSPARENT',
    customGlassColor:'',
    type:'STANDARD',
    mechanism:'CHAIN',
    panelCount:'1+2',
    motorDirection:'RIGHT',
    view:'OUTSIDE VIEW',
    motorType:'SOMFY RTS',
    remoteControl:'2 CHANNELS',
    remoteQuantity:1,
    bottomPanelMode:'VASISTAS',
    bottomPanelState:'CLOSED',
    bottomPanelHinge:'BOTTOM',
    displayState:'CLOSED',
    collectionState:'NORMAL'
  });


  function normalizeColor(value){
    const raw=String(value||'').trim(),normalized=raw.toLocaleUpperCase('tr-TR');
    if(/^(DEFAULT|VARSAYILAN)(?:\s+(DEFAULT|VARSAYILAN))?$/.test(normalized))return {code:'Varsayılan',finish:'Varsayılan'};
    const m=raw.match(/^(.*?)(?:\s+(WOOD TRANSFER|PARLAK|MAT|TEXTURE))?$/i);
    return {code:String(m&&m[1]||raw).trim().toUpperCase(),finish:String(m&&m[2]||'').trim().toUpperCase()==='WOOD TRANSFER'?'Wood Transfer':String(m&&m[2]||'').trim().toUpperCase()};
  }
  function colorValue(code,finish){return [String(code||'').trim().toUpperCase(),String(finish||'').trim().toUpperCase()].filter(Boolean).join(' ');}

  function normalizeOptions(source){
    const input={...clone(V49_COMMON_DEFAULTS),...clone(source||{})};
    input.series='A SERIES';
    input.glassThickness=String(input.glassThickness||'INSULATED GLASS').toUpperCase();
    input.glassColor=String(input.glassColor||'TRANSPARENT').toUpperCase();
    input.customGlassColor=String(input.customGlassColor||'');
    input.type=String(input.type||'STANDARD').toUpperCase();
    input.mechanism=String(input.mechanism||'CHAIN').toUpperCase();
    input.panelCount=String(input.panelCount||'1+2').toUpperCase();
    input.motorDirection=String(input.motorDirection||'RIGHT').toUpperCase();
    input.view=String(input.view||'OUTSIDE VIEW').toUpperCase();
    input.motorType=String(input.motorType||'SOMFY RTS').toUpperCase();
    input.remoteControl=String(input.remoteControl||'2 CHANNELS').toUpperCase();
    input.remoteQuantity=Math.max(0,Math.trunc(Number(input.remoteQuantity)||0));
    input.bottomPanelMode=input.type==='CLEANABLE'?'VASISTAS':'FIXED';
    input.bottomPanelState='CLOSED';
    input.bottomPanelHinge='BOTTOM';
    input.displayState='CLOSED';
    input.collectionState='NORMAL';
    if(input.glassColor==='LOW-E GLASS'&&input.glassThickness!=='INSULATED GLASS') input.glassColor='TRANSPARENT';
    return input;
  }

  function commonDefaults(project){return normalizeOptions(project&&project.commonSettings&&project.commonSettings.defaultsByProduct&&project.commonSettings.defaultsByProduct.GUILLOTINE||V49_COMMON_DEFAULTS);}
  function resolveOptions(project,position){return normalizeOptions({...commonDefaults(project),...clone(position&&position.options||{})});}
  function validateProject(project){
    const errors=[];if(!project||!Array.isArray(project.positions)||!project.positions.length)errors.push({code:'EMPTY',message:'En az bir poz eklenmelidir.'});
    const seen=new Set();
    (project&&project.positions||[]).forEach((p,i)=>{
      const label=String(p.positionNo||'').trim()||`Satır ${i+1}`,key=label.toUpperCase();
      if(!String(p.positionNo||'').trim())errors.push({id:p.id,code:'POSITION_NO',message:`${label}: Poz numarası boş.`});
      else if(seen.has(key))errors.push({id:p.id,code:'DUPLICATE_POSITION_NO',message:`${label}: Poz numarası tekrar ediyor.`});else seen.add(key);
      if(p.productType!==PRODUCT)errors.push({id:p.id,code:'PRODUCT',message:`${label}: Yalnız Giyotin desteklenir.`});
      if(!(Number(p.width)>=151))errors.push({id:p.id,code:'WIDTH',message:`${label}: Giyotin genişliği en az 151 mm olmalı.`});
      if(!(Number(p.height)>=251))errors.push({id:p.id,code:'HEIGHT',message:`${label}: Giyotin yüksekliği en az 251 mm olmalı.`});
      if(!(Number(p.quantity)>0&&Number.isInteger(Number(p.quantity))))errors.push({id:p.id,code:'QUANTITY',message:`${label}: Adet pozitif tam sayı olmalıdır.`});
    });
    const c=normalizeColor(project&&project.commonSettings&&project.commonSettings.color),defaultMaterial=String(c.code).toLocaleUpperCase('tr-TR')==='VARSAYILAN';if(!c.code)errors.push({code:'COLOR',message:'Renk seçilmelidir.'});if(!defaultMaterial&&!c.finish)errors.push({code:'FINISH',message:'Renk için yüzey seçimi zorunludur.'});
    return {valid:errors.length===0,errors};
  }

  function panelCountFromValue(value){const map={'1+1':2,'1+2':3,'1+3':4};return map[String(value||'').toUpperCase()]||Math.max(2,Math.min(8,Math.round(Number(value)||2)));}
  function expandedPositions(project){
    const source=project.positions.filter(p=>!p.hidden).sort((a,b)=>a.order-b.order);
    if(!project.commonSettings.expandQuantity)return source.map(clone);
    const out=[];source.forEach(p=>{const total=Math.max(1,Math.trunc(Number(p.quantity)||1));for(let i=0;i<total;i++){const q=clone(p);q.id=i===0?p.id:`${p.id}-Q${i+1}`;q.positionNo=i===0?p.positionNo:`${p.positionNo}.${i+1}`;q.quantity=1;q.order=out.length+1;out.push(q);}});return out;
  }
  function drawingItems(project,ralCatalog){
    const all=ralCatalog&&Array.isArray(ralCatalog.all)?ralCatalog.all:[];
    return expandedPositions(project).map(p=>{const o=resolveOptions(project,p),color=normalizeColor(o.color||project.commonSettings.color),defaultMaterial=String(color.code).toLocaleUpperCase('tr-TR')==='VARSAYILAN',swatch=all.find(x=>String(x.code).toUpperCase()===String(color.code).toUpperCase()),systemColor=defaultMaterial?{code:'Varsayılan',hex:'#64748b',finish:'SCHEMATIC',kind:'schematic',schematic:true}:{code:color.code||'RAL 7016',hex:swatch&&swatch.hex||'#383e42',finish:color.finish==='PARLAK'?'GLOSS':color.finish==='TEXTURE'?'TEXTURE':'MATTE',kind:'ral'},state=project.drawingSettings.positionOpenStates&&project.drawingSettings.positionOpenStates[p.id]||project.drawingSettings.openState||'CLOSED';return {id:p.id,positionNo:p.positionNo,width:Number(p.width),height:Number(p.height),quantity:p.quantity,series:'A SERIES',type:o.type,subtype:o.type,mechanism:o.mechanism,glassThickness:o.glassThickness,glassColor:o.glassColor,customGlassColor:o.customGlassColor,panelCount:o.panelCount,panels:panelCountFromValue(o.panelCount),panelType:o.panelCount,motorDirection:o.motorDirection,view:o.view,motorType:o.motorType,remoteControl:o.remoteControl,bottomPanelMode:o.type==='CLEANABLE'?'VASISTAS':'FIXED',bottomPanelState:state,bottomPanelHinge:'BOTTOM',collectionState:(['STANDARD','UPWARD COLLECTING','DOWNWARD COLLECTING'].includes(o.type)&&state==='OPEN')?'COLLECTED':'NORMAL',displayState:state,showDimensions:Boolean(project.drawingSettings.showDimensions),dimensionUnits:{mm:project.drawingSettings.dimensionUnits?project.drawingSettings.dimensionUnits.mm!==false:true,inch:Boolean(project.drawingSettings.dimensionUnits&&project.drawingSettings.dimensionUnits.inch)},systemColor};});
  }

root.PLMRGiyotinState=Object.freeze({normalizeColor,colorValue,normalizeOptions,commonDefaults,resolveOptions,validateProject,panelCountFromValue,expandedPositions,drawingItems});
})(window);
