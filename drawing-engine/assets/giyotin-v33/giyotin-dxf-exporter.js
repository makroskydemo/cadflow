(function(root,factory){
  if(typeof module==='object'&&module.exports) module.exports=factory(require('./giyotin-2d-document.js'),require('../vendor/dxf/ezdxfR2018Template.js'));
  else root.PLMRGiyotinDxfExporter=factory(root.PLMRGiyotin2DDocument,root.PLMREzdxfR2018Template);
})(typeof window!=='undefined'?window:globalThis,function(Document2D,Template){
  'use strict';
  if(!Document2D||!Template)throw new Error('GIYOTIN_DXF_DEPENDENCY_MISSING');

  const LF='\n';
  const DIM_LAYERS=Object.freeze({
    MM:'OLCULENDIRME_MM',
    INCH:'OLCULENDIRME_INCH',
    DUAL:'OLCULENDIRME_MM_INCH'
  });
  const DIM_STYLES=Object.freeze({
    MM:'PLMR_DIM_MM',
    INCH:'PLMR_DIM_INCH',
    DUAL:'PLMR_DIM_MM_INCH'
  });
  const DIM_STANDARD=Object.freeze({
    textStyle:'PLMR_ARIAL',
    textHeight:100,
    tickSize:45,
    textOffset:95,
    baselineSpacing:220,
    extensionOffset:0,
    extensionBeyond:0,
    textGap:45,
    color:1
  });
  const DIM_PROFILES=Object.freeze({
    MM:Object.freeze({mode:'MM',layer:DIM_LAYERS.MM,style:DIM_STYLES.MM,dimlfac:1,dimdec:0,dimalt:0,dimaltf:1/25.4,dimaltd:2,dimpost:'<> mm',dimapost:''}),
    INCH:Object.freeze({mode:'INCH',layer:DIM_LAYERS.INCH,style:DIM_STYLES.INCH,dimlfac:1/25.4,dimdec:2,dimalt:0,dimaltf:1/25.4,dimaltd:2,dimpost:'<> "',dimapost:'"'}),
    DUAL:Object.freeze({mode:'DUAL',layer:DIM_LAYERS.DUAL,style:DIM_STYLES.DUAL,dimlfac:1,dimdec:0,dimalt:1,dimaltf:1/25.4,dimaltd:2,dimpost:'<> mm -',dimapost:'"'})
  });
  const num=v=>Number.isFinite(Number(v))?String(Number(Number(v).toFixed(6))):'0';
  const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
  let handleCounter=0x1000,dimensionBlockCounter=1;
  function nextHandle(){return (handleCounter++).toString(16).toUpperCase();}
  function pair(code,value){return `${String(code).padStart(3,' ')}${LF}${value}${LF}`;}
  function entityHead(type,layer,owner){
    return pair(0,type)+pair(5,nextHandle())+pair(330,owner||Template.modelSpaceOwner||'17')+pair(100,'AcDbEntity')+pair(8,String(layer||'0'));
  }
  function utf8Text(v){return String(v==null?'':v).replace(/\r\n/g,'\n').replace(/\r/g,'\n');}
  function mtextPayload(value){
    const raw=utf8Text(value).replace(/\n/g,'\\P');
    if(raw.length<=240)return pair(1,raw);
    let out='',i=0;
    while(raw.length-i>240){out+=pair(3,raw.slice(i,i+240));i+=240;}
    out+=pair(1,raw.slice(i));return out;
  }
  function lwpolyline(e,owner){
    const pts=Array.isArray(e.points)?e.points:[];
    if(pts.length<2)return'';
    let out=entityHead('LWPOLYLINE',e.layer,owner)+pair(100,'AcDbPolyline')+pair(90,String(pts.length))+pair(70,e.closed?'1':'0');
    for(const p of pts)out+=pair(10,num(p[0]))+pair(20,num(p[1]));
    return out;
  }
  function line(e,owner){
    return entityHead('LINE',e.layer,owner)+pair(100,'AcDbLine')+pair(10,num(e.x1))+pair(20,num(e.y1))+pair(30,'0')+pair(11,num(e.x2))+pair(21,num(e.y2))+pair(31,'0');
  }
  function mtext(e,owner){
    if(e&&e.dxfSkip)return'';
    const align=String(e.align||'left').toLowerCase(),isCell=e.dxfCellText!==undefined;
    const x=Number(isCell?e.dxfCellX:e.x)||0,y=Number(isCell?e.dxfCellY:e.y)||0,text=isCell?e.dxfCellText:e.value;
    const h=Math.max(1,Number(e.height)||80),attachment=Number(isCell?e.dxfAttachment:(align==='center'?5:(align==='right'?6:4)))||4;
    const estimated=Math.max(h*1.2,String(text||'').split('\n').reduce((m,s)=>Math.max(m,s.length*h*.72+h*.4),0));
    const width=Math.max(1,Number(isCell?e.dxfCellWidth:(e.cellWidth||e.width))||estimated),rotation=Number(e.rotation)||0,lineSpacing=Math.max(.25,Number(isCell?e.dxfLineSpacing:e.lineSpacing)||1);
    let out=entityHead('MTEXT',e.layer,owner)+pair(100,'AcDbMText')+pair(10,num(x))+pair(20,num(y))+pair(30,'0')+pair(40,num(h))+pair(41,num(width))
      +pair(71,String(attachment))+pair(72,'1')+mtextPayload(text)+pair(7,'PLMR_ARIAL')+pair(44,num(lineSpacing));
    if(rotation)out+=pair(50,num(rotation));
    return out;
  }
  function transformBlockPoint(p,ins){
    const sx=Number(ins.scaleX)||1,sy=Number(ins.scaleY)||1,a=(Number(ins.rotation)||0)*Math.PI/180,px=Number(p[0]||0)*sx,py=Number(p[1]||0)*sy;
    return [(Number(ins.x)||0)+px*Math.cos(a)-py*Math.sin(a),(Number(ins.y)||0)+px*Math.sin(a)+py*Math.cos(a)];
  }
  function expandInsert(e,document){
    const block=document.blocks&&document.blocks[e.name];if(!block)return'';let out='';
    for(const be of block.entities||[]){
      if(be.type==='line'){
        const a=transformBlockPoint([be.x1,be.y1],e),b=transformBlockPoint([be.x2,be.y2],e);
        out+=line({...be,x1:a[0],y1:a[1],x2:b[0],y2:b[1],layer:be.layer||e.layer});
      }else if(be.type==='polyline'){
        const pts=(be.points||[]).map(p=>transformBlockPoint(p,e));
        out+=lwpolyline({...be,points:pts,layer:be.layer||e.layer});
      }
    }
    return out;
  }
  function entityOut(e,document){
    if(!e||e.dxfSkip||e.type==='dimension')return'';
    if(e.type==='line')return line(e);
    if(e.type==='polyline')return lwpolyline(e);
    if(e.type==='text'||e.type==='mtext')return mtext(e);
    if(e.type==='insert')return expandInsert(e,document);
    return'';
  }
  function measurementValue(d){
    const p1=d.p1||{},p2=d.p2||{};
    return Math.abs(Number(p2.x||0)-Number(p1.x||0))>=Math.abs(Number(p2.y||0)-Number(p1.y||0))
      ?Math.abs(Number(p2.x||0)-Number(p1.x||0))
      :Math.abs(Number(p2.y||0)-Number(p1.y||0));
  }
  function dimensionAxis(d){
    const p1=d.p1||{},p2=d.p2||{};
    return Math.abs(Number(p2.x||0)-Number(p1.x||0))>=Math.abs(Number(p2.y||0)-Number(p1.y||0))?'x':'y';
  }
  function dimLabel(value,mode){
    const mm=`${Math.round(Number(value)||0)} mm`,inch=`${((Number(value)||0)/25.4).toFixed(2)}\"`;
    return mode==='INCH'?inch:mode==='DUAL'?`${mm} - ${inch}`:mm;
  }
  function blockRecord(name,handle){
    return pair(0,'BLOCK_RECORD')+pair(5,handle)+pair(330,Template.blockRecordTableOwner||'9')+pair(100,'AcDbSymbolTableRecord')+pair(100,'AcDbBlockTableRecord')+pair(2,name)+pair(340,'0')+pair(70,'0')+pair(280,'1')+pair(281,'0');
  }
  function dimensionBlockGraphics(d,layer,label,owner){
    const p1=d.p1||{},p2=d.p2||{},dl=d.dimLine||{},axis=dimensionAxis(d),tick=DIM_STANDARD.tickSize,parts=[];
    if(axis==='x'){
      parts.push(line({layer,x1:p1.x,y1:p1.y,x2:p1.x,y2:dl.y},owner));
      parts.push(line({layer,x1:p2.x,y1:p2.y,x2:p2.x,y2:dl.y},owner));
      parts.push(line({layer,x1:p1.x,y1:dl.y,x2:p2.x,y2:dl.y},owner));
      parts.push(line({layer,x1:p1.x,y1:Number(dl.y)-tick,x2:p1.x,y2:Number(dl.y)+tick},owner));
      parts.push(line({layer,x1:p2.x,y1:Number(dl.y)-tick,x2:p2.x,y2:Number(dl.y)+tick},owner));
      parts.push(mtext({layer,x:(Number(p1.x)+Number(p2.x))/2,y:Number(dl.y)+DIM_STANDARD.textOffset,value:label,height:DIM_STANDARD.textHeight,align:'center',cellWidth:Math.max(420,Math.abs(Number(p2.x)-Number(p1.x))*.8)},owner));
    }else{
      parts.push(line({layer,x1:p1.x,y1:p1.y,x2:dl.x,y2:p1.y},owner));
      parts.push(line({layer,x1:p2.x,y1:p2.y,x2:dl.x,y2:p2.y},owner));
      parts.push(line({layer,x1:dl.x,y1:p1.y,x2:dl.x,y2:p2.y},owner));
      parts.push(line({layer,x1:Number(dl.x)-tick,y1:p1.y,x2:Number(dl.x)+tick,y2:p1.y},owner));
      parts.push(line({layer,x1:Number(dl.x)-tick,y1:p2.y,x2:Number(dl.x)+tick,y2:p2.y},owner));
      parts.push(mtext({layer,x:Number(dl.x)-DIM_STANDARD.textOffset,y:(Number(p1.y)+Number(p2.y))/2,value:label,height:DIM_STANDARD.textHeight,rotation:90,align:'center',cellWidth:Math.max(420,Math.abs(Number(p2.y)-Number(p1.y))*.8)},owner));
    }
    return parts.join('');
  }
  function dimensionBlockDefinition(name,recordHandle,d,layer,label){
    const beginHandle=nextHandle(),endHandle=nextHandle();
    return pair(0,'BLOCK')+pair(5,beginHandle)+pair(330,recordHandle)+pair(100,'AcDbEntity')+pair(8,'0')+pair(100,'AcDbBlockBegin')+pair(2,name)+pair(70,'1')+pair(10,'0')+pair(20,'0')+pair(30,'0')+pair(3,name)+pair(1,'')
      +dimensionBlockGraphics(d,layer,label,recordHandle)
      +pair(0,'ENDBLK')+pair(5,endHandle)+pair(330,recordHandle)+pair(100,'AcDbEntity')+pair(8,'0')+pair(100,'AcDbBlockEnd');
  }
  function nativeDimension(d,layer,label,blockName,styleName){
    const p1=d.p1||{},p2=d.p2||{},dl=d.dimLine||{},axis=dimensionAxis(d),angle=axis==='x'?0:90;
    const defX=axis==='x'?Number(p1.x):Number(dl.x),defY=axis==='x'?Number(dl.y):Number(p1.y),textX=axis==='x'?(Number(p1.x)+Number(p2.x))/2:Number(dl.x),textY=axis==='x'?Number(dl.y):(Number(p1.y)+Number(p2.y))/2;
    return entityHead('DIMENSION',layer)+pair(100,'AcDbDimension')+pair(280,'0')+pair(2,blockName)+pair(3,String(styleName||'Standard'))
      +pair(10,num(defX))+pair(20,num(defY))+pair(30,'0')+pair(11,num(textX))+pair(21,num(textY))+pair(31,'0')+pair(70,'32')+pair(71,'5')+pair(1,'<>')
      +pair(100,'AcDbAlignedDimension')+pair(13,num(p1.x))+pair(23,num(p1.y))+pair(33,'0')+pair(14,num(p2.x))+pair(24,num(p2.y))+pair(34,'0')+pair(50,num(angle))+pair(100,'AcDbRotatedDimension');
  }
  function injectBlockRecords(prefix,records){
    if(!records.length)return prefix;
    const marker='  0\nTABLE\n  2\nBLOCK_RECORD\n',start=prefix.indexOf(marker);if(start<0)throw new Error('GIYOTIN_DXF_BLOCK_RECORD_TABLE_MISSING');
    const end=prefix.indexOf('  0\nENDTAB\n',start);if(end<0)throw new Error('GIYOTIN_DXF_BLOCK_RECORD_TABLE_END_MISSING');
    let table=prefix.slice(start,end);
    table=table.replace(/(100\nAcDbSymbolTable\n 70\n)(\d+)/,(_,a,b)=>a+String(Number(b)+records.length));
    return prefix.slice(0,start)+table+records.join('')+prefix.slice(end);
  }
  function injectBlocks(prefix,blocks){
    if(!blocks.length)return prefix;
    const marker='  0\nSECTION\n  2\nBLOCKS\n',start=prefix.indexOf(marker);if(start<0)throw new Error('GIYOTIN_DXF_BLOCKS_SECTION_MISSING');
    const end=prefix.indexOf('  0\nENDSEC\n',start);if(end<0)throw new Error('GIYOTIN_DXF_BLOCKS_END_MISSING');
    return prefix.slice(0,end)+blocks.join('')+prefix.slice(end);
  }
  function setLayerVisible(prefix,layerName,visible){
    const layerTable=prefix.indexOf('  0\nTABLE\n  2\nLAYER\n'),marker=`  2\n${layerName}\n`,idx=prefix.indexOf(marker,layerTable);
    if(idx<0)throw new Error(`GIYOTIN_DXF_LAYER_MISSING:${layerName}`);
    const end=prefix.indexOf('  0\n',idx),chunkEnd=end<0?prefix.length:end,colorCode=prefix.indexOf(' 62\n',idx);
    if(colorCode<0||colorCode>=chunkEnd)throw new Error(`GIYOTIN_DXF_LAYER_COLOR_MISSING:${layerName}`);
    const valueStart=colorCode+4,valueEnd=prefix.indexOf('\n',valueStart),old=Number(prefix.slice(valueStart,valueEnd))||1,next=visible?Math.abs(old):-Math.abs(old);
    return prefix.slice(0,valueStart)+String(next)+prefix.slice(valueEnd);
  }
  function patchActiveView(prefix,document){
    const b=document.bounds||{minX:0,minY:0,maxX:1,maxY:1,width:1,height:1},width=Math.max(1,Number(b.width)||Number(b.maxX)-Number(b.minX)),height=Math.max(1,Number(b.height)||Number(b.maxY)-Number(b.minY)),aspect=1.34,centerX=(Number(b.minX)+Number(b.maxX))/2,centerY=(Number(b.minY)+Number(b.maxY))/2,viewHeight=Math.max(height,width/aspect)*1.10;
    const idx=prefix.indexOf('  2\n*Active\n');if(idx<0)return prefix;const end=prefix.indexOf('  0\nENDTAB\n',idx);let rec=prefix.slice(idx,end);
    const setGroup=(code,value)=>{const re=new RegExp(`(\\n\\s*${code}\\n)[^\\n]+`);rec=rec.replace(re,(_,g1)=>g1+num(value));};
    setGroup(12,centerX);setGroup(22,centerY);setGroup(40,viewHeight);
    return prefix.slice(0,idx)+rec+prefix.slice(end);
  }
  function patchTemplatePrefix(document,activeLayer){
    let prefix=Template.prefix;
    const b=document.bounds||{minX:0,minY:0,maxX:0,maxY:0};
    prefix=prefix.replace(/(\$HANDSEED\s*\n\s*5\s*\n)[^\n]+/,(_,g1)=>g1+'FFFFFF');
    prefix=prefix.replace(/(\$LASTSAVEDBY\s*\n\s*1\s*\n)[^\n]*/,(_,g1)=>g1+'PLMR JustGiyotin v33');
    prefix=prefix.replace(/(\$EXTMIN\s*\n\s*10\s*\n)[^\n]+(\s*\n\s*20\s*\n)[^\n]+(\s*\n\s*30\s*\n)[^\n]+/,(_,g1,g2,g3)=>g1+num(b.minX)+g2+num(b.minY)+g3+'0');
    prefix=prefix.replace(/(\$EXTMAX\s*\n\s*10\s*\n)[^\n]+(\s*\n\s*20\s*\n)[^\n]+(\s*\n\s*30\s*\n)[^\n]+/,(_,g1,g2,g3)=>g1+num(b.maxX)+g2+num(b.maxY)+g3+'0');
    prefix=setLayerVisible(prefix,DIM_LAYERS.MM,activeLayer===DIM_LAYERS.MM);
    prefix=setLayerVisible(prefix,DIM_LAYERS.INCH,activeLayer===DIM_LAYERS.INCH);
    prefix=setLayerVisible(prefix,DIM_LAYERS.DUAL,activeLayer===DIM_LAYERS.DUAL);
    prefix=patchCurrentDimensionEnvironment(prefix,document);
    return patchActiveView(prefix,document);
  }
  function selectedDimensionLayer(document){
    const u=document&&document.metadata&&document.metadata.dimensionUnits||{mm:true,inch:false};
    if(u.mm!==false&&u.inch)return DIM_LAYERS.DUAL;
    if(u.mm===false&&u.inch)return DIM_LAYERS.INCH;
    return DIM_LAYERS.MM;
  }
  function selectedDimensionStyle(document){
    const layer=selectedDimensionLayer(document);
    if(layer===DIM_LAYERS.INCH)return DIM_STYLES.INCH;
    if(layer===DIM_LAYERS.DUAL)return DIM_STYLES.DUAL;
    return DIM_STYLES.MM;
  }
  function selectedDimensionProfile(document){
    const layer=selectedDimensionLayer(document);
    if(layer===DIM_LAYERS.INCH)return DIM_PROFILES.INCH;
    if(layer===DIM_LAYERS.DUAL)return DIM_PROFILES.DUAL;
    return DIM_PROFILES.MM;
  }
  function setHeaderVar(prefix,varName,groupCode,value){
    const marker='$'+String(varName)+'\n',varStart=prefix.indexOf(marker);
    if(varStart<0)return prefix;
    const codeStart=varStart+marker.length,codeEnd=prefix.indexOf('\n',codeStart);
    if(codeEnd<0||Number(prefix.slice(codeStart,codeEnd).trim())!==Number(groupCode))return prefix;
    const valueStart=codeEnd+1,valueEnd=prefix.indexOf('\n',valueStart);
    if(valueEnd<0)return prefix;
    return prefix.slice(0,valueStart)+String(value)+prefix.slice(valueEnd);
  }
  function patchCurrentDimensionEnvironment(prefix,document){
    const p=selectedDimensionProfile(document);
    const vars=[
      ['DIMSTYLE',2,p.style],['CLAYER',8,p.layer],['TEXTSTYLE',7,DIM_STANDARD.textStyle],['DIMTXSTY',7,DIM_STANDARD.textStyle],
      ['DIMSCALE',40,1],['DIMASZ',40,DIM_STANDARD.tickSize],['DIMEXO',40,DIM_STANDARD.extensionOffset],
      ['DIMDLI',40,DIM_STANDARD.baselineSpacing],['DIMRND',40,0],['DIMDLE',40,0],['DIMEXE',40,DIM_STANDARD.extensionBeyond],
      ['DIMTXT',40,DIM_STANDARD.textHeight],['DIMCEN',40,0],['DIMTSZ',40,DIM_STANDARD.tickSize],
      ['DIMTOL',70,0],['DIMLIM',70,0],['DIMTIH',70,0],['DIMTOH',70,0],['DIMSE1',70,0],['DIMSE2',70,0],
      ['DIMTAD',70,1],['DIMZIN',70,8],['DIMPOST',1,p.dimpost],['DIMAPOST',1,p.dimapost],
      ['DIMALT',70,p.dimalt],['DIMALTD',70,p.dimaltd],['DIMALTF',40,p.dimaltf],['DIMLFAC',40,p.dimlfac],
      ['DIMTOFL',70,1],['DIMTVP',40,0],['DIMTIX',70,0],['DIMSOXD',70,0],['DIMSAH',70,0],
      ['DIMCLRD',70,DIM_STANDARD.color],['DIMCLRE',70,DIM_STANDARD.color],['DIMCLRT',70,DIM_STANDARD.color],
      ['DIMTFAC',40,1],['DIMGAP',40,DIM_STANDARD.textGap],['DIMJUST',70,0],['DIMSD1',70,0],['DIMSD2',70,0],
      ['DIMTOLJ',70,0],['DIMTZIN',70,8],['DIMALTZ',70,0],['DIMALTTZ',70,0],['DIMUPT',70,0],
      ['DIMDEC',70,p.dimdec],['DIMTDEC',70,p.dimdec],['DIMALTU',70,2],['DIMALTTD',70,2],
      ['DIMAUNIT',70,0],['DIMADEC',70,0],['DIMALTRND',40,0],['DIMAZIN',70,0],['DIMDSEP',70,46],
      ['DIMATFIT',70,3],['DIMFRAC',70,0],['DIMLUNIT',70,2],['DIMLWD',70,-2],['DIMLWE',70,-2],['DIMTMOVE',70,0]
    ];
    let out=prefix;
    for(const [name,code,value] of vars)out=setHeaderVar(out,name,code,value);
    return out;
  }
  function compatibilityDocument(document){
    Document2D.validateDocument(document);
    const out=clone(document);
    out.metadata={...(out.metadata||{}),dxfVersion:'AC1032',dxfProfile:'AutoCAD 2018',dxfContainer:'EZDXF_R2018_CLEAN_SKELETON',dxfTextMode:'MTEXT',dxfDimensionStrategy:'CANONICAL_NATIVE_DIMSTYLE_STANDARD_V32',dxfDimensionLayers:clone(DIM_LAYERS),dxfDimensionStyles:clone(DIM_STYLES),dxfActiveDimensionLayer:selectedDimensionLayer(out),dxfActiveDimensionStyle:selectedDimensionStyle(out)};
    return out;
  }
  function structuralCheck(dxf){
    const flat=String(dxf||'').replace(/\r/g,'');
    const required=[/\nSECTION\n/,/\nHEADER\n/,/AC1032/,/\$INSUNITS\n\s*70\n\s*4/,/\nCLASSES\n/,/\nTABLES\n/,/\nBLOCKS\n/,/\nENTITIES\n/,/\nOBJECTS\n/,/\nDIMENSION\n/,/OLCULENDIRME_MM/,/OLCULENDIRME_INCH/,/OLCULENDIRME_MM_INCH/,/PLMR_DIM_MM/,/PLMR_DIM_INCH/,/PLMR_DIM_MM_INCH/,/PLMR_ARIAL/,/Arial\.ttf/,/\nEOF\n?$/];
    if(required.some(r=>!r.test(flat)))throw new Error('GIYOTIN_DXF_AC1032_STRUCTURAL_CHECK_FAILED');
    if(/\nTEXT\n/.test(flat))throw new Error('GIYOTIN_DXF_TEXT_ENTITY_FORBIDDEN');
    return true;
  }
  function exportDocument(document){
    const compatible=compatibilityDocument(document),activeLayer=DIM_LAYERS.MM,modes=[['MM',DIM_LAYERS.MM,DIM_STYLES.MM],['INCH',DIM_LAYERS.INCH,DIM_STYLES.INCH],['DUAL',DIM_LAYERS.DUAL,DIM_STYLES.DUAL]];
    handleCounter=0x1000;dimensionBlockCounter=1;
    let entities='',prefix=patchTemplatePrefix(compatible,activeLayer),records=[],blocks=[];
    for(const e of compatible.entities||[])entities+=entityOut(e,compatible);
    const dimensions=(compatible.entities||[]).filter(e=>e&&e.type==='dimension');
    for(const d of dimensions){
      const value=measurementValue(d);
      for(const [mode,layer,styleName] of modes){
        const label=dimLabel(value,mode),blockName=`*D${dimensionBlockCounter++}`,recordHandle=nextHandle();
        records.push(blockRecord(blockName,recordHandle));
        blocks.push(dimensionBlockDefinition(blockName,recordHandle,d,layer,label));
        entities+=nativeDimension(d,layer,label,blockName,styleName);
      }
    }
    prefix=injectBlockRecords(prefix,records);prefix=injectBlocks(prefix,blocks);
    const dxf=prefix+entities+Template.suffix;
    structuralCheck(dxf);return dxf;
  }
  function exportProject(project,options){const document=Document2D.buildDocument(project,options||{});return {document,dxf:exportDocument(document)};}
  function exportItems(items,options){
    const list=Array.isArray(items)?items:[];if(!list.length)throw new Error('GIYOTIN_DXF_NO_ITEMS');const first=list[0]||{};
    const project={projectInfo:{projectCode:'DXF.TEST',customerName:'',country:'',projectName:'DXF.TEST',revision:'R01',designer:'',date:'2026-10-02'},commonSettings:{color:'RAL 7016 TEXTURE',generalDescription:'',expandQuantity:false,defaultsByProduct:{GUILLOTINE:{type:first.type||'STANDARD',mechanism:first.mechanism||'CHAIN',glassThickness:first.glassThickness||'INSULATED GLASS',glassColor:first.glassColor||'TRANSPARENT',panelCount:first.panelCount||'1+2',motorDirection:first.motorDirection||'RIGHT',view:first.view||'OUTSIDE VIEW',motorType:first.motorType||'SOMFY RTS',remoteControl:first.remoteControl||'2 CHANNELS'}}},layout:{columnCount:Number(options&&options.columns)||2},drawingSettings:{dimensionUnits:{mm:true,inch:false}},positions:list.map((item,index)=>({id:item.id||`item-${index+1}`,positionNo:item.positionNo||`P${String(index+1).padStart(2,'0')}`,order:index+1,productType:'GUILLOTINE',quantity:Number(item.quantity)||1,width:Number(item.width),height:Number(item.height),description:'',hidden:false,options:{type:item.type,mechanism:item.mechanism,glassThickness:item.glassThickness,glassColor:item.glassColor,panelCount:item.panelCount,motorDirection:item.motorDirection,view:item.view,motorType:item.motorType,remoteControl:item.remoteControl}}))};
    return exportProject(project,{columns:Number(options&&options.columns)||2,dimensionUnits:options&&options.dimensionUnits||{mm:true,inch:false}}).dxf;
  }
  return Object.freeze({version:'GIYOTIN-DXF-AC1032-CANONICAL-DIMSTYLE-V33',format:'AC1032-AUTOCAD-2018-MM-MTEXT-CANONICAL-DIMSTYLE',DIM_LAYERS,DIM_STYLES,DIM_STANDARD,DIM_PROFILES,buildDocument:Document2D.buildDocument,compatibilityDocument,structuralCheck,exportDocument,exportProject,exportItems});
});
