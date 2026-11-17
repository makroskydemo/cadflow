(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  else root.PLMRSurmeState=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  const PRODUCT='SLIDING';
  const SCHEMA='plmr-just-surme-v15';
  const VERSION='15.0.0';
  const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
  const pad=n=>String(n).padStart(2,'0');
  const uid=()=>`pos-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,10)}`;
  function today(){const d=new Date(),z=n=>String(n).padStart(2,'0');return `${d.getFullYear()}-${z(d.getMonth()+1)}-${z(d.getDate())}`;}
  function projectCode(){const d=new Date(),z=n=>String(n).padStart(2,'0');return `PLMR.SURME.${d.getFullYear()}${z(d.getMonth()+1)}${z(d.getDate())}.${z(d.getHours())}${z(d.getMinutes())}${z(d.getSeconds())}`;}

  const V49_DEFAULTS=Object.freeze({
    series:'A SERIES',
    type:'WITH THRESHOLD',
    glassType:'SINGLE GLASS',
    slidingView:'OUTSIDE VIEW',
    openingType:'SIDE OPENING',
    openingDirection:'RIGHT',
    glassThickness:'10 MM',
    customGlassThickness:'',
    glassColor:'TRANSPARENT',
    customGlassColor:'',
    panelCountMode:'AUTO',
    panelCount:4,
    collectionState:'NORMAL'
  });

  function normalizeColor(value){
    const raw=String(value||'').trim(),normalized=raw.toLocaleUpperCase('tr-TR');
    if(/^(DEFAULT|VARSAYILAN)(?:\s+(DEFAULT|VARSAYILAN))?$/.test(normalized))return {code:'Varsayılan',finish:'Varsayılan'};
    const m=raw.match(/^(.*?)(?:\s+(PARLAK|MAT|TEXTURE))?$/i);
    return {code:String(m&&m[1]||raw).trim().toUpperCase(),finish:String(m&&m[2]||'').trim().toUpperCase()};
  }
  function colorValue(code,finish){return [String(code||'').trim().toUpperCase(),String(finish||'').trim().toUpperCase()].filter(Boolean).join(' ');}
  function slidingPanelCount(width,openingType){
    let count=Math.max(2,Math.ceil(Math.max(1,Number(width)||1)/1200));
    if(String(openingType||'').toUpperCase()==='CENTER OPENING'){
      count=Math.max(4,count);if(count%2)count+=1;
    }
    return count;
  }
  function normalizeOptions(source,context){
    const input={...clone(V49_DEFAULTS),...clone(source||{})};
    const series=String(input.series||'A SERIES').toUpperCase();
    input.series=['A SERIES','B SERIES','C SERIES'].includes(series)?series:'A SERIES';
    input.type=['OTHER','VARIABLE'].includes(String(input.type).toUpperCase())?'OTHER':String(input.type||'WITH THRESHOLD').toUpperCase()==='WITHOUT THRESHOLD'?'WITHOUT THRESHOLD':'WITH THRESHOLD';
    input.glassType=['OTHER','VARIABLE'].includes(String(input.glassType).toUpperCase())?'OTHER':String(input.glassType||'SINGLE GLASS').toUpperCase()==='INSULATED GLASS'?'INSULATED GLASS':'SINGLE GLASS';
    input.slidingView=['OTHER','VARIABLE'].includes(String(input.slidingView).toUpperCase())?'OTHER':String(input.slidingView||'OUTSIDE VIEW').toUpperCase()==='INSIDE VIEW'?'INSIDE VIEW':'OUTSIDE VIEW';
    input.openingType=input.openingType===''?'':String(input.openingType||'SIDE OPENING').toUpperCase()==='CENTER OPENING'?'CENTER OPENING':'SIDE OPENING';
    input.openingDirection=['OTHER','VARIABLE'].includes(String(input.openingDirection).toUpperCase())?'OTHER':input.openingType==='CENTER OPENING'
      ?(String(input.openingDirection||'OUTSIDE').toUpperCase()==='INSIDE'?'INSIDE':'OUTSIDE')
      :(String(input.openingDirection||'RIGHT').toUpperCase()==='LEFT'?'LEFT':'RIGHT');
    input.glassThickness=String(input.glassThickness||'10 MM').toUpperCase();
    if(!['8 MM','10 MM','INSULATED GLASS','4MM TEMP.+12MM HB+4MM TEMP.','OTHER'].includes(input.glassThickness))input.glassThickness='10 MM';
    input.customGlassThickness=String(input.customGlassThickness||'').trim();
    if(['INSULATED GLASS','4MM TEMP.+12MM HB+4MM TEMP.'].includes(input.glassThickness))input.glassType='INSULATED GLASS';
    if(input.glassType==='INSULATED GLASS')input.glassThickness='4mm TEMP.+12mm HB+4mm TEMP.';
    if(input.glassType==='SINGLE GLASS'&&!['8 MM','10 MM'].includes(input.glassThickness))input.glassThickness='8 MM';
    input.glassColor=String(input.glassColor||'TRANSPARENT').toUpperCase();
    if(input.glassColor==='GREY')input.glassColor='FUME';
    if(!['TRANSPARENT','FUME','BRONZE','LOW-E GLASS','OTHER'].includes(input.glassColor))input.glassColor='TRANSPARENT';
    input.customGlassColor=String(input.customGlassColor||'').trim();
    input.panelCountMode=String(input.panelCountMode||'AUTO').toUpperCase()==='MANUAL'?'MANUAL':'AUTO';
    const requestedPanelCount=Math.trunc(Number(input.panelCount));
    if(input.panelCountMode==='AUTO'&&context&&Number(context.width)>0)input.panelCount=slidingPanelCount(context.width,input.openingType);
    else if(requestedPanelCount>=2)input.panelCount=requestedPanelCount;
    else if(context&&Number(context.width)>0)input.panelCount=slidingPanelCount(context.width,input.openingType);
    else input.panelCount=2;
    if(input.openingType==='CENTER OPENING'){
      input.panelCount=Math.max(4,input.panelCount);if(input.panelCount%2)input.panelCount+=1;
    }
    input.collectionState=String(input.collectionState||'NORMAL').toUpperCase()==='COLLECTED'?'COLLECTED':'NORMAL';
    return input;
  }
  function compactOptions(options,defaults,context){
    const base=normalizeOptions(defaults||V49_DEFAULTS,context),normalized=normalizeOptions({...base,...clone(options||{})},context),result={};
    Object.keys(normalized).forEach(k=>{if(JSON.stringify(normalized[k])!==JSON.stringify(base[k]))result[k]=clone(normalized[k]);});
    return result;
  }
  function nextPositionNo(existing){
    const nums=(existing||[]).map(p=>String(p.positionNo||'').match(/^(?:P|S)(\d+)$/i)).filter(Boolean).map(m=>Number(m[1])).filter(Number.isFinite);
    return `P${pad((nums.length?Math.max(...nums):0)+1)}`;
  }
  function commonDefaults(project){
    const c=project&&project.commonSettings||{};
    return normalizeOptions(c.defaults||c.slidingDefaults||V49_DEFAULTS,{width:3000});
  }
  function createPosition(overrides,existing,defaults){
    const s=overrides||{},ctx={width:Number(s.width)||3000},base=defaults||V49_DEFAULTS;
    return {
      id:String(s.id||uid()),positionNo:String(s.positionNo||nextPositionNo(existing||[])).trim().toUpperCase(),order:Number.isFinite(Number(s.order))?Number(s.order):(existing||[]).length+1,
      productType:PRODUCT,quantity:Math.max(1,Math.trunc(Number(s.quantity)||1)),width:Number(s.width)||3000,height:Number(s.height)||2400,
      description:String(s.description||''),hidden:Boolean(s.hidden),options:compactOptions(s.options||{},base,ctx)
    };
  }
  function blankProject(){
    const defaults=normalizeOptions(V49_DEFAULTS,{width:3000});
    return {
      schema:SCHEMA,version:VERSION,format:'PLMR_STANDALONE_MULTI_PROJECT',schemaVersion:2,productType:PRODUCT,module1:'Modül 1',submodule:'Alt Modül 1',
      projectInfo:{projectCode:'',supplierCompany:'',customerName:'',country:'',customerContact:'',customerRepresentative:'',projectRepresentative:'',designer:'Aytuğ Kılınç',projectName:'',revision:'R00',outputUnit:'mm',date:today(),createdAt:'',description:''},
      commonSettings:{color:'',systemColor:'',surface:'',glassType:'TRANSPARENT',generalDescription:'',description:'',outputScale:'AUTO',expandQuantity:false,defaultProductType:PRODUCT,variableSelections:{type:false,glassType:false,glassThickness:false,slidingView:false,openingType:false,openingDirection:false},defaults},
      layout:{mode:'AUTO',columnCount:2,horizontalGap:520,verticalGap:460,titleGap:150,pageMargin:200},
      drawingSettings:{previewMode:'2D',dimensionUnits:{mm:true,inch:false},showDimensions:true,columns:2,openState:'CLOSED',positionOpenStates:{}},
      positions:[],files:[],updatedAt:new Date().toISOString()
    };
  }
  function ensureProject(input){
    const base=blankProject(),src=input&&typeof input==='object'?input:{};
    const out={...base,...clone(src)};out.schema=SCHEMA;out.version=VERSION;out.format=base.format;out.schemaVersion=2;out.productType=PRODUCT;
    out.projectInfo={...base.projectInfo,...clone(src.projectInfo||{})};
    const incomingCommon=clone(src.commonSettings||{}),incomingDefaults=incomingCommon.defaults||incomingCommon.slidingDefaults||V49_DEFAULTS;
    out.commonSettings={...base.commonSettings,...incomingCommon,variableSelections:{...base.commonSettings.variableSelections,...clone(incomingCommon.variableSelections||{})},defaults:normalizeOptions(incomingDefaults,{width:3000})};
    if(!out.commonSettings.color&&out.commonSettings.systemColor)out.commonSettings.color=colorValue(out.commonSettings.systemColor,out.commonSettings.surface);
    const color=normalizeColor(out.commonSettings.color);out.commonSettings.systemColor=color.code;out.commonSettings.surface=color.finish;
    out.layout={...base.layout,...clone(src.layout||{})};
    out.drawingSettings={...base.drawingSettings,...clone(src.drawingSettings||{}),dimensionUnits:{...base.drawingSettings.dimensionUnits,...clone(src.drawingSettings&&src.drawingSettings.dimensionUnits||{})},positionOpenStates:{...clone(src.drawingSettings&&src.drawingSettings.positionOpenStates||{})}};
    const incoming=Array.isArray(src.positions)?src.positions:[];out.positions=[];
    incoming.forEach((p,i)=>{if(p.productType&&![PRODUCT,'SURME','SÜRME'].includes(String(p.productType).toUpperCase()))return;out.positions.push(createPosition({...p,order:i+1},out.positions,out.commonSettings.defaults));});
    out.files=Array.isArray(src.files)?src.files.map(f=>({name:String(f.name||''),size:Number(f.size)||0,type:String(f.type||'')})):[];
    normalizeOrder(out);return out;
  }
  function createProject(overrides){return ensureProject(overrides||{});}
  function normalizeOrder(project){project.positions.sort((a,b)=>(Number(a.order)||0)-(Number(b.order)||0));project.positions.forEach((p,i)=>p.order=i+1);return project;}
  function resolveOptions(project,position){
    const base=commonDefaults(project),ctx={width:position&&position.width};
    // V09: common settings are defaults, never a runtime lock. Any position-level override
    // must propagate immediately to 2D / 3D / PDF / DXF / DAE. The title block decides
    // whether a field is common or "Değişken" by comparing resolved positions.
    let out=normalizeOptions({...base,...(position&&position.options||{})},ctx);
    const ds=project&&project.drawingSettings||{},per=ds.positionOpenStates&&position&&ds.positionOpenStates[position.id],state=String(per||ds.openState||'').toUpperCase();
    if(state==='OPEN')out.collectionState='COLLECTED';else if(state==='CLOSED')out.collectionState='NORMAL';
    return out;
  }
  function setPositionOptions(project,positionId,options){const p=project.positions.find(x=>x.id===positionId);if(!p)return false;p.options=compactOptions(options,commonDefaults(project),{width:p.width});touch(project);return true;}
  function expandedPositions(project){
    const out=[];for(const p of project.positions){if(p.hidden)continue;const qty=project.commonSettings&&project.commonSettings.expandQuantity?Math.max(1,Number(p.quantity)||1):1;for(let i=0;i<qty;i++)out.push(qty===1?p:{...clone(p),id:`${p.id}-q${i+1}`,positionNo:`${p.positionNo}.${i+1}`,quantity:1});}return out;
  }
  function addPositions(project,{count=1,startNo='P01',width=3000,height=2400,quantity=1,options}={}){
    const m=String(startNo||'P01').match(/^(.*?)(\d+)$/),prefix=m?m[1]:'P',start=m?Number(m[2]):1;
    for(let i=0;i<Math.max(1,Math.min(100,Number(count)||1));i++)project.positions.push(createPosition({positionNo:`${prefix}${pad(start+i)}`,width,height,quantity,options:options||{}},project.positions,commonDefaults(project)));
    normalizeOrder(project);touch(project);return project;
  }
  function renumberPositions(project){project.positions.forEach((p,i)=>{p.positionNo=`P${pad(i+1)}`;p.order=i+1;});touch(project);return project;}
  function validateProject(project){
    const errors=[],warnings=[];
    if(!project||project.productType!==PRODUCT)errors.push({code:'PRODUCT',message:'Ürün yalnız Sürme olmalıdır.'});
    (project&&project.positions||[]).forEach(p=>{
      if(Number(p.width)<200)errors.push({code:'WIDTH',positionNo:p.positionNo,message:`${p.positionNo}: genişlik en az 200 mm olmalıdır.`});
      if(Number(p.height)<200)errors.push({code:'HEIGHT',positionNo:p.positionNo,message:`${p.positionNo}: yükseklik en az 200 mm olmalıdır.`});
      if(!(Number(p.quantity)>=1))errors.push({code:'QTY',positionNo:p.positionNo,message:`${p.positionNo}: adet en az 1 olmalıdır.`});
      const o=resolveOptions(project,p);
      if(!['SIDE OPENING','CENTER OPENING'].includes(o.openingType))errors.push({code:'OPENING_TYPE',positionNo:p.positionNo,message:`${p.positionNo}: kenardan veya merkezden açılım seçilmelidir.`});
      if(o.openingType==='CENTER OPENING'&&(o.panelCount<4||o.panelCount%2))errors.push({code:'CENTER_PANEL_COUNT',positionNo:p.positionNo,message:`${p.positionNo}: merkez açılımda panel sayısı en az 4 ve çift olmalıdır.`});
      if(o.glassThickness==='OTHER'&&!o.customGlassThickness)warnings.push({code:'GLASS_THICKNESS_OTHER',positionNo:p.positionNo,message:`${p.positionNo}: diğer cam kalınlığı girilmedi; çizimde 8 mm görsel kalınlık kullanılır.`});
      if(o.glassColor==='OTHER'&&!o.customGlassColor)warnings.push({code:'GLASS_COLOR_OTHER',positionNo:p.positionNo,message:`${p.positionNo}: diğer cam rengi açıklaması girilmedi.`});
    });
    if(!(project&&project.positions||[]).length)warnings.push({code:'NO_POSITION',message:'Henüz poz eklenmedi.'});
    return {valid:errors.length===0,errors,warnings};
  }
  function validateWorkspace(project){const v=validateProject(project);return {...v,geometryReady:true};}
  function generateProjectCode(project){
    const i=project.projectInfo;if(!i.projectCode)i.projectCode=projectCode();if(!i.projectName)i.projectName=i.projectCode;if(!i.revision||i.revision==='R00')i.revision='R01';if(!i.createdAt)i.createdAt=i.date||today();if(!i.date)i.date=i.createdAt;touch(project);return i.projectCode;
  }
  function touch(project){project.updatedAt=new Date().toISOString();return project;}
  function serialize(project){return JSON.stringify(ensureProject(project),null,2);}
  function parse(text){const obj=JSON.parse(String(text||''));if(!obj||typeof obj!=='object')throw new Error('INVALID_PROJECT_FILE');return ensureProject(obj);}
  return Object.freeze({PRODUCT,SCHEMA,VERSION,V49_DEFAULTS,blankProject,createProject,ensureProject,createPosition,nextPositionNo,normalizeOrder,renumberPositions,addPositions,slidingPanelCount,normalizeOptions,compactOptions,commonDefaults,resolveOptions,setPositionOptions,expandedPositions,validateProject,validateWorkspace,generateProjectCode,normalizeColor,colorValue,touch,serialize,parse,clone});
});
