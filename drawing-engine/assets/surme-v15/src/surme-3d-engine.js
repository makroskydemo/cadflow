(function(root,factory){
  if(typeof module==='object'&&module.exports) module.exports=factory(require('../vendor/three-r128/three.min.js'));
  else root.PLMRSurme3DEngine=factory(root.THREE);
})(typeof window!=='undefined'?window:globalThis,function(THREE){
  'use strict';
  if(!THREE)throw new Error('THREE_REQUIRED');

  // V15 3D profile geometry is derived from the supplied `Sürme Çizimi - v2(1).stl` reference.
  // Reference measurements (mm): side jamb 50x130, bottom base 15x130, upper profile 150x140,
  // panel frame 30x20, panel overlap 30, 10 mm reference glass, contiguous 20 mm track pitch.
  const STANDARD=Object.freeze({
    frameFace:50,
    frameDepth:130,
    frameDepthA:130,
    frameDepthK:130,
    bottomBaseHeight:15,
    topFrameHeight:130,
    topFrameDepth:140,
    topCapThickness:15,
    topWallThickness:3,
    frameDepthInset:5,
    panelFrontGap:5,
    sideTopClearance:15,
    panelTopClearance:30,
    thresholdWith:15,
    thresholdWithout:0,
    thresholdDepth:130,
    panelFace:30,
    panelDepth:20,
    panelOverlap:30,
    trackGap:0,
    compactGapX:520,
    compactGapY:460
  });
  const GLAZING=Object.freeze({
    '8 MM':Object.freeze({glassDepth:8,frameDepth:20}),
    '10 MM':Object.freeze({glassDepth:10,frameDepth:20}),
    '12 MM':Object.freeze({glassDepth:12,frameDepth:20}),
    'INSULATED GLASS':Object.freeze({glassDepth:20,frameDepth:20})
  });
  const DEFAULTS=Object.freeze({width:3000,height:2400,series:'A SERIES',type:'WITH THRESHOLD',slidingView:'OUTSIDE VIEW',openingType:'SIDE OPENING',openingDirection:'RIGHT',glassThickness:'10 MM',glassColor:'TRANSPARENT',panelCount:4,collectionState:'NORMAL',displayState:'CLOSED',showDimensions:false,systemColor:{code:'RAL 7016',hex:'#383e42',finish:'TEXTURE'}});
  // V30: default material state is intentionally schematic, never a real RAL selection.
  // Only material assignment changes in this mode; geometry/mechanics remain V15.
  const SCHEMATIC_PALETTE=Object.freeze({
    bottomFrame:0x65717f,
    leftFrame:0x5b7083,
    rightFrame:0x6f8792,
    topCap:0x7c6f91,
    topFrontWall:0x647d86,
    topBackWall:0x59636e,
    threshold:0x8a7858,
    leftStile:0x4f7f82,
    rightStile:0x65759a,
    topRail:0x7c6f91,
    bottomRail:0x7f8258
  });
  function schematicMode(systemColor){
    const c=systemColor||{},code=String(c.code||'').trim().toLocaleUpperCase('tr-TR'),finish=String(c.finish||'').trim().toLocaleUpperCase('tr-TR');
    return c.schematic===true||String(c.kind||'').toLowerCase()==='schematic'||['DEFAULT','VARSAYILAN'].includes(code)||['DEFAULT','VARSAYILAN','SCHEMATIC'].includes(finish);
  }
  const n=(v,f=0)=>Number.isFinite(Number(v))?Number(v):f;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  function hexNumber(value,fallback=0x383e42){const raw=String(value||'').trim();return /^#[0-9a-f]{6}$/i.test(raw)?parseInt(raw.slice(1),16):fallback;}
  function glazingSpec(v,custom){const raw=String(v||'8 MM').toUpperCase(),key=raw==='4MM TEMP.+12MM HB+4MM TEMP.'?'INSULATED GLASS':raw;if(key==='OTHER'){const mm=Number(String(custom||'').replace(/[^0-9.,-]/g,'').replace(',','.'));return {glassDepth:Number.isFinite(mm)&&mm>0?mm:8,frameDepth:20};}return GLAZING[key]||GLAZING['8 MM'];}
  function glassColor(v){const s=String(v||'TRANSPARENT').toUpperCase();if(s==='FUME'||s==='GREY')return 0x6b7280;if(s==='BRONZE')return 0xb68055;if(s==='LOW-E GLASS')return 0x8be7ff;if(s==='OTHER')return 0x93c5fd;return 0xb7ddff;}
  function material(color,opacity,finish,colorCode){
    if(opacity<.8)return new THREE.MeshPhysicalMaterial({color,transparent:true,opacity,roughness:.12,metalness:0,transmission:0,side:THREE.DoubleSide,depthWrite:false});
    const f=String(finish||'MAT').toUpperCase();if(typeof window!=='undefined'&&window.PLMRPowderCoat)return window.PLMRPowderCoat.create(color,f,{colorCode,transparent:opacity<1,opacity});
    return new THREE.MeshStandardMaterial({color,roughness:f==='PARLAK'?.18:(f==='TEXTURE'?.78:.5),metalness:.28});
  }
  function addBox(group,cfg,color,opacity,finish,meta){
    const geo=new THREE.BoxGeometry(Math.max(.1,cfg.w),Math.max(.1,cfg.h),Math.max(.1,cfg.t));
    const mesh=new THREE.Mesh(geo,material(color,opacity,finish,opacity===1?meta?.paintCode:undefined));
    if(mesh.material.userData.woodTransfer)window.PLMRPowderCoat.profileUV(geo);
    mesh.position.set(cfg.x,cfg.y,cfg.z);mesh.userData={name:cfg.name||'Sliding Part',isProduct:true,...(meta||{})};
    mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo),new THREE.LineBasicMaterial({color:opacity<.8?0x164e63:0x111827,transparent:true,opacity:.52})));
    group.add(mesh);return mesh;
  }
  function makeTextTexture(text,width,height,options){
    if(typeof document==='undefined')return null;
    const canvas=document.createElement('canvas'),scale=2;canvas.width=Math.max(64,Math.round(width*scale));canvas.height=Math.max(32,Math.round(height*scale));
    const ctx=canvas.getContext('2d');if(!ctx)return null;ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle=options.background||'rgba(15,23,42,0.88)';
    const radius=12*scale,w=canvas.width,h=canvas.height;ctx.beginPath();ctx.moveTo(radius,0);ctx.lineTo(w-radius,0);ctx.quadraticCurveTo(w,0,w,radius);ctx.lineTo(w,h-radius);ctx.quadraticCurveTo(w,h,w-radius,h);ctx.lineTo(radius,h);ctx.quadraticCurveTo(0,h,0,h-radius);ctx.lineTo(0,radius);ctx.quadraticCurveTo(0,0,radius,0);ctx.closePath();ctx.fill();
    ctx.strokeStyle=options.border||'rgba(248,250,252,0.94)';ctx.lineWidth=2*scale;ctx.stroke();ctx.fillStyle=options.color||'#f8fafc';ctx.font=`700 ${Math.round((options.fontSize||30)*scale)}px Segoe UI, Arial, sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(String(text||''),canvas.width/2,canvas.height/2+scale);
    const texture=new THREE.CanvasTexture(canvas);texture.needsUpdate=true;texture.minFilter=THREE.LinearFilter;texture.magFilter=THREE.LinearFilter;texture.generateMipmaps=false;return texture;
  }
  // Exact accepted Giyotin v33 label sizing discipline reused for Sürme.
  function faceLabelSpec(text,kind){
    const k=String(kind||'generic');
    if(k==='view')return{width:541,height:130,fontSize:49};
    if(k==='position'){const chars=Math.max(6,String(text||'').length);return{width:Math.max(468,Math.min(988,(110+chars*38)*1.3)),height:125,fontSize:52};}
    if(k==='dimension-width'||k==='dimension-height'){const chars=Math.max(7,String(text||'').length);return{width:Math.max(868,Math.min(2100,(150+chars*68)*1.4)),height:266,fontSize:143};}
    return{width:354,height:112,fontSize:46};
  }
  function createFaceTextMaterial(text,width,height,kind){
    const spec=faceLabelSpec(text,kind),isDimension=String(kind||'').indexOf('dimension-')===0,texture=makeTextTexture(text,width,height,isDimension?{fontSize:spec.fontSize,color:'#ef4444',border:'rgba(239,68,68,0.98)',background:'rgba(15,23,42,0.90)'}:{fontSize:spec.fontSize});
    if(texture)return new THREE.MeshBasicMaterial({map:texture,transparent:true,alphaTest:0.02,depthTest:true,depthWrite:false,side:THREE.FrontSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
    return new THREE.MeshBasicMaterial({color:0x0f172a,transparent:true,opacity:0.88,side:THREE.FrontSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
  }
  function addFaceTextLabel(group,text,x,y,z,kind,face,meta){
    const spec=faceLabelSpec(text,kind),geo=new THREE.PlaneGeometry(spec.width,spec.height),wrapper=new THREE.Group(),baseRotation=String(face||'outer').toLowerCase()==='inner'?Math.PI:0;
    wrapper.position.set(x,y,z);wrapper.renderOrder=24;wrapper.userData={name:`Face Label ${text}`,flatTextLabel:{text:String(text),kind:String(kind||'generic'),face:String(face||'outer').toLowerCase()},...meta};
    const front=new THREE.Mesh(geo,createFaceTextMaterial(text,spec.width,spec.height,kind));front.rotation.y=baseRotation;front.renderOrder=24;
    const back=new THREE.Mesh(geo,createFaceTextMaterial(text,spec.width,spec.height,kind));back.rotation.y=baseRotation+Math.PI;back.renderOrder=24;wrapper.add(front);wrapper.add(back);group.add(wrapper);return wrapper;
  }
  function addDimensionLine(group,points,meta){const mat=new THREE.LineBasicMaterial({color:0xef4444,transparent:true,opacity:.98,depthTest:false}),geo=new THREE.BufferGeometry().setFromPoints(points.map(p=>new THREE.Vector3(p[0],p[1],p[2]))),line=new THREE.LineSegments(geo,mat);line.renderOrder=50;line.userData={name:'Dimension Line',dimension:true,...(meta||{})};group.add(line);return line;}
  function formatDimensionValue(mm,units){const u=units||{mm:true,inch:false},parts=[];if(u.mm!==false)parts.push(`${Math.round(Number(mm))} mm`);if(u.inch)parts.push(`${(Number(mm)/25.4).toFixed(2)}"`);return parts.join(' - ');}
  function addDimensionArrow(group,x,y,z,dx,dy,meta){const len=48,wing=24,mag=Math.max(1,Math.hypot(dx,dy)),ux=dx/mag,uy=dy/mag,px=-uy,py=ux;return addDimensionLine(group,[[x,y,z],[x+ux*len+px*wing,y+uy*len+py*wing,z],[x,y,z],[x+ux*len-px*wing,y+uy*len-py*wing,z]],meta);}
  function addDimensions(group,W,H,meta,units){
    const z=48,half=W/2,below=-220,left=-half-220,ext=28;
    addDimensionLine(group,[[-half,0,z],[-half,below-ext,z],[half,0,z],[half,below-ext,z],[-half,below,z],[half,below,z]],meta);addDimensionArrow(group,-half,below,z,1,0,meta);addDimensionArrow(group,half,below,z,-1,0,meta);
    addDimensionLine(group,[[-half,0,z],[left-ext,0,z],[-half,H,z],[left-ext,H,z],[left,0,z],[left,H,z]],meta);addDimensionArrow(group,left,0,z,0,1,meta);addDimensionArrow(group,left,H,z,0,-1,meta);
    addFaceTextLabel(group,formatDimensionValue(W,units),0,below,z+2,'dimension-width','outer',meta);const hLabel=addFaceTextLabel(group,formatDimensionValue(H,units),left,H/2,z+2,'dimension-height','outer',meta);hLabel.rotation.z=Math.PI/2;
  }
  function normalizeInput(input){
    const s={...DEFAULTS,...(input||{})};
    const openingType=String(s.openingType||'SIDE OPENING').toUpperCase()==='CENTER OPENING'?'CENTER OPENING':'SIDE OPENING';
    let panelCount=Math.max(2,Math.trunc(n(s.panelCount,4)));if(openingType==='CENTER OPENING'){panelCount=Math.max(4,panelCount);if(panelCount%2)panelCount+=1;}
    return {...s,width:Math.max(200,n(s.width,3000)),height:Math.max(200,n(s.height,2400)),panelCount,openingType,series:(['A SERIES','B SERIES','C SERIES'].includes(String(s.series||'A SERIES').toUpperCase())?String(s.series||'A SERIES').toUpperCase():'A SERIES'),type:String(s.type||'WITH THRESHOLD').toUpperCase()==='WITHOUT THRESHOLD'?'WITHOUT THRESHOLD':'WITH THRESHOLD',slidingView:String(s.slidingView||'OUTSIDE VIEW').toUpperCase()==='INSIDE VIEW'?'INSIDE VIEW':'OUTSIDE VIEW',openingDirection:openingType==='CENTER OPENING'?(String(s.openingDirection||'OUTSIDE').toUpperCase()==='INSIDE'?'INSIDE':'OUTSIDE'):(String(s.openingDirection||'RIGHT').toUpperCase()==='LEFT'?'LEFT':'RIGHT'),displayState:String(s.displayState||'CLOSED').toUpperCase()==='OPEN'?'OPEN':'CLOSED'};
  }
  function physicalDirection(v){
    if(v.openingType==='CENTER OPENING')return v.openingDirection;
    // Opening direction is defined in the selected view. The outside camera is canonical,
    // therefore an inside-view left/right command is mirrored in world X.
    return v.slidingView==='INSIDE VIEW'?(v.openingDirection==='LEFT'?'RIGHT':'LEFT'):v.openingDirection;
  }
  function selectedViewEdgeIndex(v,panels,edge){
    const inside=v.slidingView==='INSIDE VIEW';
    if(String(edge).toUpperCase()==='LEFT')return inside?panels-1:0;
    return inside?0:panels-1;
  }
  function sideLeadPanelIndex(v,panels){
    return v.openingDirection==='RIGHT'?selectedViewEdgeIndex(v,panels,'LEFT'):selectedViewEdgeIndex(v,panels,'RIGHT');
  }
  function sideSecondaryPanelIndex(v,panels){
    return v.openingDirection==='RIGHT'?selectedViewEdgeIndex(v,panels,'RIGHT'):selectedViewEdgeIndex(v,panels,'LEFT');
  }
  function slidingTrackLevel(index,panels,openingType,direction,slidingView){
    if(openingType==='CENTER OPENING'){
      const centerDistance=Math.floor(Math.abs(index-(panels-1)/2));
      const maxDistance=Math.max(0,Math.floor((panels-1)/2));
      // level 0 = outside/front; larger level = further inside.
      return direction==='INSIDE'?maxDistance-centerDistance:centerDistance;
    }
    // Side-opening track precedence is expressed in the selected view:
    // RIGHT -> selected-view left panel leads; LEFT -> selected-view right panel leads.
    // This results in the same physical level sequence for OUTSIDE/INSIDE while the
    // selected-view edge itself mirrors through selectedViewEdgeIndex().
    const max=Math.max(0,panels-1);
    return direction==='LEFT'?max-index:index;
  }
  function slidingPanelLayout(innerW,panels,overlap,openingType,collected,direction){
    const positions=[];
    if(openingType==='CENTER OPENING'&&panels%2===0){
      const half=panels/2,centerGap=0,halfSpan=innerW/2,panelW=(halfSpan+overlap*(half-1))/half;
      for(let i=0;i<half;i++)positions.push(-innerW/2+panelW/2+i*(panelW-overlap));
      for(let i=0;i<half;i++)positions.push(panelW/2+i*(panelW-overlap));
      if(collected){
        for(let i=0;i<half;i++)positions[i]=-innerW/2+panelW/2;
        for(let i=0;i<half;i++)positions[half+i]=innerW/2-panelW/2;
      }
      return {panelW,positions,centerGap};
    }
    const panelW=(innerW+overlap*(panels-1))/panels,start=-innerW/2+panelW/2;
    for(let i=0;i<panels;i++)positions.push(start+i*(panelW-overlap));
    if(collected){
      const stackLeft=direction==='LEFT';
      const target=stackLeft?-innerW/2+panelW/2:innerW/2-panelW/2;
      for(let i=0;i<panels;i++)positions[i]=target;
    }
    return {panelW,positions,centerGap:0};
  }
  function sequentialPanelCenters(input,progress){
    const v=normalizeInput(input),frame=STANDARD.frameFace,innerW=Math.max(1,v.width-frame*2),panels=Math.max(2,Math.min(12,v.panelCount)),overlap=STANDARD.panelOverlap,p=clamp(n(progress,v.displayState==='OPEN'?1:0),0,1),physical=physicalDirection(v),closed=slidingPanelLayout(innerW,panels,overlap,v.openingType,false,physical),panelW=closed.panelW,step=Math.max(0,panelW-overlap),positions=[...closed.positions];
    if(v.openingType==='CENTER OPENING'&&panels%2===0){
      const half=panels/2,total=Math.max(0,(half-1)*step),d=total*p;
      for(let i=0;i<half;i++){
        const order=half-1-i;
        positions[i]=closed.positions[i]-Math.max(0,d-order*step);
      }
      for(let i=half;i<panels;i++){
        const order=i-half;
        positions[i]=closed.positions[i]+Math.max(0,d-order*step);
      }
    }else{
      const total=Math.max(0,(panels-1)*step),d=total*p,sign=physical==='RIGHT'?1:-1;
      for(let i=0;i<panels;i++){
        const order=physical==='RIGHT'?i:(panels-1-i);
        positions[i]=closed.positions[i]+sign*Math.max(0,d-order*step);
      }
    }
    return {panelW,positions,step,physicalDirection:physical};
  }
  function panelSpans(input,progress){
    const layout=sequentialPanelCenters(input,progress),panelW=layout.panelW;
    return layout.positions.map((x,i)=>({x1:x-panelW/2,x2:x+panelW/2,center:x,panelW,panelIndex:i}));
  }
  function arrowShape(length,thick,direction){
    const L=Math.max(90,length),shaft=thick?28:12,headW=thick?72:42,headL=Math.min(L*.3,thick?88:58),half=L/2,body=half-headL,s=new THREE.Shape();
    s.moveTo(-half,-shaft/2);s.lineTo(body,-shaft/2);s.lineTo(body,-headW/2);s.lineTo(half,0);s.lineTo(body,headW/2);s.lineTo(body,shaft/2);s.lineTo(-half,shaft/2);s.closePath();
    const g=new THREE.ShapeGeometry(s);if(direction<0)g.rotateZ(Math.PI);return g;
  }
  function addArrow(group,cfg,meta){
    const g=arrowShape(cfg.length,cfg.thick,cfg.direction),m=new THREE.MeshBasicMaterial({color:cfg.thick?0xf97316:0xf8fafc,side:THREE.DoubleSide,depthTest:true}),mesh=new THREE.Mesh(g,m);mesh.position.set(cfg.x,cfg.y,cfg.z);mesh.userData={name:cfg.name||'Sliding Direction Arrow',movementIndicator:true,arrowDirection:cfg.direction<0?'LEFT':'RIGHT',primary:Boolean(cfg.thick),isProduct:false,...meta};mesh.renderOrder=20;group.add(mesh);return mesh;
  }
  function buildSingle(input){
    const v=normalizeInput(input),W=v.width,H=v.height,root=new THREE.Group(),meta={positionId:String(v.id||''),positionNo:String(v.positionNo||''),productType:'SLIDING'},schematic=schematicMode(v.systemColor),system=hexNumber(v.systemColor&&v.systemColor.hex,0x383e42),finish=schematic?'MAT':String(v.systemColor&&v.systemColor.finish||'MAT').toUpperCase(),palette=schematic?SCHEMATIC_PALETTE:null,glazing=glazingSpec(v.glassThickness,v.customGlassThickness),gc=glassColor(v.glassColor),frame=STANDARD.frameFace,frameDepth=STANDARD.frameDepth,baseH=STANDARD.bottomBaseHeight,topH=STANDARD.topFrameHeight,topDepth=STANDARD.topFrameDepth,topCap=STANDARD.topCapThickness,topWallT=STANDARD.topWallThickness,frameInset=STANDARD.frameDepthInset,panelFrontGap=STANDARD.panelFrontGap,frameZ=-(frameInset+frameDepth/2),innerW=Math.max(1,W-frame*2),panels=Math.max(2,Math.min(12,v.panelCount)),overlap=STANDARD.panelOverlap,direction=physicalDirection(v),hasBottomBase=v.type==='WITH THRESHOLD',workingRailH=STANDARD.thresholdWith,baseOffset=hasBottomBase?baseH:0,openProgress=Number.isFinite(Number(v.openProgress))?clamp(Number(v.openProgress),0,1):(v.displayState==='OPEN'?1:0),motionLayout=sequentialPanelCenters(v,openProgress),panelW=motionLayout.panelW,panelBottom=baseOffset+workingRailH,panelTop=Math.max(panelBottom+60,H-STANDARD.panelTopClearance),panelH=Math.max(60,panelTop-panelBottom),sideBottom=hasBottomBase?baseH:0,sideH=Math.max(1,H-sideBottom-STANDARD.sideTopClearance),stile=STANDARD.panelFace,trackStep=STANDARD.panelDepth+STANDARD.trackGap,product=new THREE.Group();
    if(!schematic)meta.paintCode=v.systemColor?.code;
    root.name=`Sürme ${v.positionNo||''}`.trim();root.add(product);

    // V15 STL rule: the 130 mm deep jamb/base package sits 5 mm behind the front of
    // the 140 mm upper hat. The U-hat walls therefore wrap around the jambs without
    // occupying the same volume; the 15 mm top cap rests exactly on the jamb top.
    // EŞİKLİ = bottom base + working lower rail. EŞİKSİZ removes only the lowest base.
    if(hasBottomBase)addBox(product,{name:'Sliding Bottom Frame',x:0,y:baseH/2,z:frameZ,w:W,h:baseH,t:frameDepth},schematic?palette.bottomFrame:system,1,finish,meta);
    addBox(product,{name:'Sliding Left Frame',x:-W/2+frame/2,y:sideBottom+sideH/2,z:frameZ,w:frame,h:sideH,t:frameDepth},schematic?palette.leftFrame:system,1,finish,meta);
    addBox(product,{name:'Sliding Right Frame',x:W/2-frame/2,y:sideBottom+sideH/2,z:frameZ,w:frame,h:sideH,t:frameDepth},schematic?palette.rightFrame:system,1,finish,meta);
    // Supplied STL cross-section: 15 mm top cap + 130 mm vertical legs. The panel
    // upper rail continues inside this hat and is hidden in the outside elevation.
    const wallBottom=H-topCap-topH,wallCenter=wallBottom+topH/2;
    addBox(product,{name:'Sliding Top Frame Cap',x:0,y:H-topCap/2,z:-topDepth/2,w:W,h:topCap,t:topDepth},schematic?palette.topCap:system,1,finish,meta);
    addBox(product,{name:'Sliding Top Frame Front Wall',x:0,y:wallCenter,z:-topWallT/2,w:W,h:topH,t:topWallT},schematic?palette.topFrontWall:system,1,finish,meta);
    addBox(product,{name:'Sliding Top Frame Back Wall',x:0,y:wallCenter,z:-(topDepth-topWallT/2),w:W,h:topH,t:topWallT},schematic?palette.topBackWall:system,1,finish,meta);
    addBox(product,{name:'Sliding Threshold',x:0,y:baseOffset+workingRailH/2,z:frameZ,w:innerW,h:workingRailH,t:frameDepth},schematic?palette.threshold:system,1,finish,meta);

    const uPositions=motionLayout.positions,centerLeft=panels/2-1,centerRight=panels/2;
    for(let i=0;i<panels;i++){
      const u=uPositions[i],trackLevel=slidingTrackLevel(i,panels,v.openingType,v.openingDirection,v.slidingView),z=-(panelFrontGap+STANDARD.panelDepth/2+trackLevel*trackStep),cy=panelBottom+panelH/2,panelMeta={...meta,panelIndex:i};
      addBox(product,{name:`Sliding Glass ${i+1}`,x:u,y:cy,z,w:Math.max(20,panelW-stile*2),h:Math.max(20,panelH-stile*2),t:Math.min(glazing.glassDepth,STANDARD.panelDepth)},gc,.34,finish,panelMeta);
      addBox(product,{name:`Sliding Left Stile ${i+1}`,x:u-panelW/2+stile/2,y:cy,z,w:stile,h:panelH,t:STANDARD.panelDepth},schematic?palette.leftStile:system,1,finish,panelMeta);
      addBox(product,{name:`Sliding Right Stile ${i+1}`,x:u+panelW/2-stile/2,y:cy,z,w:stile,h:panelH,t:STANDARD.panelDepth},schematic?palette.rightStile:system,1,finish,panelMeta);
      addBox(product,{name:`Sliding Top Rail ${i+1}`,x:u,y:panelBottom+panelH-stile/2,z,w:panelW,h:stile,t:STANDARD.panelDepth},schematic?palette.topRail:system,1,finish,panelMeta);
      addBox(product,{name:`Sliding Bottom Rail ${i+1}`,x:u,y:panelBottom+stile/2,z,w:panelW,h:stile,t:STANDARD.panelDepth},schematic?palette.bottomRail:system,1,finish,panelMeta);
      if(openProgress<.02){
        if(v.openingType==='SIDE OPENING'){
          const primaryIndex=sideLeadPanelIndex(v,panels),secondaryIndex=sideSecondaryPanelIndex(v,panels),primaryDir=direction==='LEFT'?-1:1;
          if(i===primaryIndex||i===secondaryIndex){
            const thick=i===primaryIndex,dir=thick?primaryDir:(primaryDir*-1);
            addArrow(product,{name:(thick?'Primary':'Secondary')+' Sliding Direction Arrow',x:u,y:cy,z:8,length:Math.max(90,Math.min(panelW-stile*2-20,420)),direction:dir,thick},panelMeta);
          }
        }else{
          // Center opening: only middle panels show arrows and they point away from each other.
          if(i===centerLeft||i===centerRight){
            const dir=i===centerLeft?-1:1;
            addArrow(product,{name:'Primary Center Sliding Direction Arrow',x:u,y:cy,z:8,length:Math.max(90,Math.min(panelW-stile*2-20,420)),direction:dir,thick:true},panelMeta);
          }
        }
      }
    }

    const posText=String(v.positionNo||'').trim()?`${String(v.positionNo).trim()} - ${Math.max(1,Math.trunc(n(v.quantity,1)))} Adet`:'';
    const frontView='DIŞ BAKIŞ',backView='İÇ BAKIŞ',labelY=H-58,frontZ=1,backZ=-(topDepth+1),posSpec=faceLabelSpec(posText,'position'),positionX=-W/2+Math.min(W*.28,posSpec.width/2+70);
    // Canonical Giyotin v33 method: labels are actual face-text meshes on both faces of the physical upper panel.
    addFaceTextLabel(product,frontView,0,labelY,frontZ,'view','outer',meta);addFaceTextLabel(product,backView,0,labelY,backZ,'view','inner',meta);
    if(posText){addFaceTextLabel(product,posText,positionX,labelY,frontZ,'position','outer',{...meta,positionLabel:true});addFaceTextLabel(product,posText,positionX,labelY,backZ,'position','inner',{...meta,positionLabel:true});}
    if(v.showDimensions)addDimensions(root,W,H,meta,v.dimensionUnits);
    root.userData={source:'Sürme Çizimi - v2(1).stl U-hat reference + canonical outside-front labels + PLMR V15 interaction logic',input:{...v},...meta,derived:{frameFace:frame,frameDepth,frameDepthInset:frameInset,bottomBaseHeight:baseH,topFrameHeight:topH,topFrameDepth:topDepth,topCapThickness:topCap,thresholdHeight:workingRailH,bottomBaseEnabled:hasBottomBase,thresholdDepth:frameDepth,panelCount:panels,panelWidth:panelW,overlap,stile,panelDepth:STANDARD.panelDepth,panelFrontGap,panelTopClearance:STANDARD.panelTopClearance,panelHeight:panelH,trackStep,openProgress,collectionState:openProgress>0?'COLLECTED':'NORMAL',physicalDirection:direction}};
    return root;
  }
  function buildLayout(items,options){const list=(items||[]).filter(x=>x&&n(x.width)>0&&n(x.height)>0),opts=options||{},cols=Math.max(1,Math.min(list.length||1,10,Math.round(n(opts.columns,2)))),gapX=Math.max(160,Math.min(760,n(opts.gapX,STANDARD.compactGapX))),gapY=Math.max(160,Math.min(760,n(opts.gapY,STANDARD.compactGapY))),rowHeights=[],colWidths=[];list.forEach((item,i)=>{const r=Math.floor(i/cols),c=i%cols;rowHeights[r]=Math.max(rowHeights[r]||0,n(item.height,2400));colWidths[c]=Math.max(colWidths[c]||0,n(item.width,3000));});const totalW=colWidths.reduce((a,b)=>a+b,0)+Math.max(0,cols-1)*gapX,totalH=rowHeights.reduce((a,b)=>a+b,0)+Math.max(0,rowHeights.length-1)*gapY,xStarts=[];let x=-totalW/2;colWidths.forEach((w,i)=>{xStarts[i]=x;x+=w+gapX;});const yStarts=[];let top=totalH/2;rowHeights.forEach((h,i)=>{yStarts[i]=top-h;top-=h+gapY;});return{columns:cols,gapX,gapY,rowHeights,colWidths,totalW,totalH,positions:list.map((item,i)=>({item,row:Math.floor(i/cols),col:i%cols,x:xStarts[i%cols]+n(item.width)/2,y:yStarts[Math.floor(i/cols)]}))};}
  function buildMultiple(items,options){const layout=buildLayout(items,options),group=new THREE.Group();group.name='Sürme Multi Position';layout.positions.forEach(p=>{let g;if(p.item&&p.item.layoutSpacer){g=new THREE.Group();g.name='PLMR Layout Spacer';const geo=new THREE.BoxGeometry(Math.max(1,n(p.item.width,3000)),Math.max(1,n(p.item.height,2400)),1),mat=new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false});const spacer=new THREE.Mesh(geo,mat);spacer.position.set(0,n(p.item.height,2400)/2,0);spacer.userData={layoutSpacer:true,isProduct:false};g.add(spacer);}else g=buildSingle(p.item);g.position.set(p.x,p.y,0);group.add(g);});group.userData={layout,source:'PLMR V49 Sürme compact multi-position layout'};return group;}
  function inspect(group){let meshes=0,lines=0,labels=0;const names=[],screenLabels=[];group.traverse(o=>{if(o.isMesh){meshes++;if(o.userData&&o.userData.name)names.push(o.userData.name);}if(o.isLine||o.isLineSegments){lines++;if(o.userData&&o.userData.name)names.push(o.userData.name);}if(o.userData&&o.userData.screenLabel){labels++;screenLabels.push({...o.userData.screenLabel,name:o.userData.name||''});}});const box=new THREE.Box3().setFromObject(group),size=new THREE.Vector3();box.getSize(size);return{meshes,lines,labels,names,screenLabels,bounds:{min:box.min.toArray(),max:box.max.toArray(),size:size.toArray()}};}
  return Object.freeze({STANDARD,GLAZING,DEFAULTS,SCHEMATIC_PALETTE,normalizeInput,physicalDirection,selectedViewEdgeIndex,sideLeadPanelIndex,sideSecondaryPanelIndex,slidingTrackLevel,slidingPanelLayout,sequentialPanelCenters,panelSpans,buildSingle,buildMultiple,buildLayout,inspect});
});
