(function(root,factory){
  if(typeof module==='object'&&module.exports) module.exports=factory(require('../vendor/three-r128/three.min.js'));
  else root.PLMRGiyotin3DEngine=factory(root.THREE);
})(typeof window!=='undefined'?window:globalThis,function(THREE){
  'use strict';
  if(!THREE) throw new Error('THREE_REQUIRED');

  // Revised standalone Giyotin drawing geometry.
  // Page/state contract is preserved; only Giyotin drawing construction is standardized.
  const STANDARD=Object.freeze({
    postWidth:60,
    systemDepth:130,
    motorBoxHeight:150,
    baseHeight:50,
    panelFrameFace:50,
    panelFrameDepth:40,
    bottomPanelInset:80,
    targetPanelOverlap:50,
    compactGapX:520,
    compactGapY:460
  });

  const GLAZING_SECTION_SPECS=Object.freeze({
    '8 MM':Object.freeze({glassDepth:8}),
    '10 MM':Object.freeze({glassDepth:10}),
    '12 MM':Object.freeze({glassDepth:12}),
    'INSULATED GLASS':Object.freeze({glassDepth:20})
  });

  const DEFAULTS=Object.freeze({
    width:3000,height:3050,series:'A SERIES',type:'STANDARD',subtype:'STANDARD',mechanism:'CHAIN',
    glassThickness:'INSULATED GLASS',glassColor:'TRANSPARENT',panels:3,panelType:'1+2',motorDirection:'RIGHT',
    view:'OUTSIDE VIEW',motorType:'SOMFY RTS',displayState:'CLOSED',showDimensions:false,
    systemColor:{code:'RAL 7016',hex:'#383e42',finish:'TEXTURE',kind:'ral'}
  });


  // V30 default material mode: deterministic CAD-like colors communicate physical part families
  // without implying a customer-selected RAL/material. Geometry and mechanics remain untouched.
  const SCHEMATIC_PALETTE=Object.freeze({
    leftPost:0x5b7083,rightPost:0x6f8792,motorBox:0x9a7b55,bottomBase:0x65717f,
    leftStile:0x4f7f82,rightStile:0x65759a,topRail:0x7c6f91,bottomRail:0x7f8258
  });
  function schematicMode(systemColor){const c=systemColor||{},code=String(c.code||'').trim().toLocaleUpperCase('tr-TR');return Boolean(c.schematic)||String(c.kind||'').toLowerCase()==='schematic'||code==='DEFAULT'||code==='VARSAYILAN';}

  function hexNumber(value,fallback=0x383e42){const raw=String(value||'').trim();if(/^#[0-9a-f]{6}$/i.test(raw))return parseInt(raw.slice(1),16);return fallback;}
  function materialFor(color,opacity,finish,colorCode){
    if(opacity<.7)return new THREE.MeshPhysicalMaterial({color,transparent:true,opacity,roughness:.14,metalness:0,transmission:0,side:THREE.DoubleSide,depthWrite:false});
    const f=String(finish||'MATTE').toUpperCase();
    if(typeof window!=='undefined'&&window.PLMRPowderCoat)return window.PLMRPowderCoat.create(color,f,{colorCode,transparent:opacity<1,opacity});
    return new THREE.MeshStandardMaterial({color,transparent:opacity<1,opacity,roughness:f==='GLOSS'?.18:(f==='TEXTURE'?.78:.5),metalness:.28});
  }
  function edgeMaterial(opacity){return new THREE.LineBasicMaterial({color:opacity<.8?0x164e63:0x111827,transparent:true,opacity:.52});}
  function addBox(group,cfg,color,opacity,finish,meta){
    const geo=new THREE.BoxGeometry(cfg.w,cfg.h,cfg.t),mesh=new THREE.Mesh(geo,materialFor(color,opacity,finish,opacity===1?meta?.paintCode:undefined));
    if(mesh.material.userData.woodTransfer)window.PLMRPowderCoat.profileUV(geo);
    mesh.position.set(cfg.u,cfg.y,cfg.v);mesh.castShadow=opacity>.5;mesh.receiveShadow=true;
    mesh.userData={name:cfg.name||'Product part',isProduct:true,...(meta||{})};
    mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo),edgeMaterial(opacity)));
    group.add(mesh);return mesh;
  }
  function addBottomHungBox(group,cfg,color,opacity,finish,angle,hingeY,meta){
    const geo=new THREE.BoxGeometry(cfg.w,cfg.h,cfg.t),mesh=new THREE.Mesh(geo,materialFor(color,opacity,finish,opacity===1?meta?.paintCode:undefined));
    if(mesh.material.userData.woodTransfer)window.PLMRPowderCoat.profileUV(geo);
    mesh.castShadow=opacity>.5;mesh.receiveShadow=true;mesh.userData={name:cfg.name||'Product part',isProduct:true,...(meta||{})};
    mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo),edgeMaterial(opacity)));
    const pivot=new THREE.Group();pivot.name=`${cfg.name||'Panel'} Pivot`;pivot.userData={panelPivot:true,...(meta||{})};
    pivot.position.set(cfg.u,hingeY,cfg.v);mesh.position.set(0,cfg.y-hingeY,0);pivot.rotation.x=-angle;pivot.add(mesh);group.add(pivot);return mesh;
  }
  function glazingSectionSpec(placement){const k=String(placement.glassThickness||'INSULATED GLASS').toUpperCase();return GLAZING_SECTION_SPECS[k]||GLAZING_SECTION_SPECS['INSULATED GLASS'];}
  function glassVisualColor(placement){const c=String(placement.glassColor||'TRANSPARENT').toUpperCase();if(c==='FUME'||c==='SMOKED'||c==='GREY')return 0x6b7280;if(c==='BRONZE')return 0xb68055;if(c==='LOW-E GLASS')return 0x8be7ff;if(c==='OTHER')return 0x93c5fd;return 0xb7ddff;}

  function createArrowGeometry(length,shaftWidth,headWidth,headLength,direction,vertical){
    const half=length/2,shaftHalf=shaftWidth/2,headHalf=headWidth/2,bodyEnd=half-headLength,shape=new THREE.Shape();
    shape.moveTo(-half,-shaftHalf);shape.lineTo(bodyEnd,-shaftHalf);shape.lineTo(bodyEnd,-headHalf);shape.lineTo(half,0);shape.lineTo(bodyEnd,headHalf);shape.lineTo(bodyEnd,shaftHalf);shape.lineTo(-half,shaftHalf);shape.closePath();
    const geo=new THREE.ExtrudeGeometry(shape,{depth:4,bevelEnabled:false,steps:1});geo.translate(0,0,-2);if(direction<0)geo.rotateZ(Math.PI);if(vertical)geo.rotateZ(Math.PI/2);return geo;
  }
  function addArrow(group,cfg,meta){
    const length=Math.max(72,Math.min(cfg.length,Math.max(72,cfg.maxLength||cfg.length))),geo=createArrowGeometry(length,12,40,Math.min(length*.27,52),cfg.direction||1,Boolean(cfg.vertical));
    const mesh=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:0xf97316,roughness:.42,metalness:.04,side:THREE.DoubleSide}));
    mesh.position.set(cfg.u,cfg.y,cfg.v);mesh.userData={name:cfg.name||'Movement Arrow',isProduct:true,movementIndicator:true,...(meta||{})};
    mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo),new THREE.LineBasicMaterial({color:0x111827,transparent:true,opacity:.86})));group.add(mesh);return mesh;
  }
  function addVMarker(group,cfg,meta){
    const w=Math.max(80,Math.min(180,cfg.w||130)),h=Math.max(48,Math.min(120,cfg.h||80));
    const geo=new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-w/2,h/2,0),new THREE.Vector3(0,-h/2,0),
      new THREE.Vector3(0,-h/2,0),new THREE.Vector3(w/2,h/2,0)
    ]);
    const line=new THREE.LineSegments(geo,new THREE.LineBasicMaterial({color:0xf59e0b,linewidth:2,depthTest:true}));
    line.position.set(cfg.u,cfg.y,cfg.v);line.userData={name:'Cleanable Bottom Panel V Marker',movementIndicator:true,...(meta||{})};group.add(line);return line;
  }

  function makeTextTexture(text,width,height,options){
    if(typeof document==='undefined')return null;
    const canvas=document.createElement('canvas');
    const scale=2;
    canvas.width=Math.max(64,Math.round(width*scale));
    canvas.height=Math.max(32,Math.round(height*scale));
    const ctx=canvas.getContext('2d');
    if(!ctx)return null;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle=options.background||'rgba(15,23,42,0.88)';
    const radius=12*scale;
    const w=canvas.width,h=canvas.height;
    ctx.beginPath();
    ctx.moveTo(radius,0);ctx.lineTo(w-radius,0);ctx.quadraticCurveTo(w,0,w,radius);ctx.lineTo(w,h-radius);ctx.quadraticCurveTo(w,h,w-radius,h);ctx.lineTo(radius,h);ctx.quadraticCurveTo(0,h,0,h-radius);ctx.lineTo(0,radius);ctx.quadraticCurveTo(0,0,radius,0);ctx.closePath();ctx.fill();
    ctx.strokeStyle=options.border||'rgba(248,250,252,0.94)';
    ctx.lineWidth=2*scale;ctx.stroke();
    ctx.fillStyle=options.color||'#f8fafc';
    ctx.font=`700 ${Math.round((options.fontSize||30)*scale)}px Segoe UI, Arial, sans-serif`;
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(String(text||''),canvas.width/2,canvas.height/2+1*scale);
    const texture=new THREE.CanvasTexture(canvas);texture.needsUpdate=true;texture.minFilter=THREE.LinearFilter;texture.magFilter=THREE.LinearFilter;texture.generateMipmaps=false;return texture;
  }
  function faceLabelSpec(text,kind){
    const k=String(kind||'generic');
    if(k==='view')return{width:541,height:130,fontSize:49};
    if(k==='motor')return{width:354,height:112,fontSize:46};
    if(k==='position'){const chars=Math.max(6,String(text||'').length);return{width:Math.max(468,Math.min(988,(110+chars*38)*1.3)),height:125,fontSize:52};}
    if(k==='dimension-width'||k==='dimension-height'){
      const chars=Math.max(7,String(text||'').length);
      return{width:Math.max(868,Math.min(2100,(150+chars*68)*1.4)),height:266,fontSize:143};
    }
    return{width:354,height:112,fontSize:46};
  }
  function createFaceTextMaterial(text,width,height,kind){
    const spec=faceLabelSpec(text,kind),isDimension=String(kind||'').indexOf('dimension-')===0,texture=makeTextTexture(text,width,height,isDimension?{fontSize:spec.fontSize,color:'#ef4444',border:'rgba(239,68,68,0.98)',background:'rgba(15,23,42,0.90)'}:{fontSize:spec.fontSize});
    if(texture)return new THREE.MeshBasicMaterial({map:texture,transparent:true,alphaTest:0.02,depthTest:true,depthWrite:false,side:THREE.FrontSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
    return new THREE.MeshBasicMaterial({color:0x0f172a,transparent:true,opacity:0.88,side:THREE.FrontSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
  }
  function addFaceTextLabel(group,text,u,y,v,kind,face,meta){
    const spec=faceLabelSpec(text,kind),width=spec.width,height=spec.height;
    const planeGeo=new THREE.PlaneGeometry(width,height);
    const wrapper=new THREE.Group();
    const baseRotation=String(face||'outer').toLowerCase()==='inner'?Math.PI:0;
    wrapper.position.set(u,y,v);
    wrapper.renderOrder=24;
    wrapper.userData={name:`Face Label ${text}`,flatTextLabel:{text:String(text),kind:String(kind||'generic'),face:String(face||'outer').toLowerCase()},...meta};
    const front=new THREE.Mesh(planeGeo,createFaceTextMaterial(text,width,height,kind));
    front.rotation.y=baseRotation;
    front.renderOrder=24;
    const back=new THREE.Mesh(planeGeo,createFaceTextMaterial(text,width,height,kind));
    back.rotation.y=baseRotation+Math.PI;
    back.renderOrder=24;
    wrapper.add(front);wrapper.add(back);
    group.add(wrapper);return wrapper;
  }
  function addScreenLabel(group,text,u,y,v,kind,meta){
    const anchor=new THREE.Object3D();anchor.position.set(u,y,v);anchor.userData={name:`Label ${text}`,screenLabel:{text:String(text),kind:String(kind||'generic')},...meta};group.add(anchor);return anchor;
  }
  function addDimensionLine(group,points,meta){
    const mat=new THREE.LineBasicMaterial({color:0xef4444,transparent:true,opacity:.98,depthTest:false});
    const geo=new THREE.BufferGeometry().setFromPoints(points.map(p=>new THREE.Vector3(p[0],p[1],p[2]))),line=new THREE.LineSegments(geo,mat);
    line.renderOrder=50;line.userData={name:'Dimension Line',dimension:true,...(meta||{})};group.add(line);return line;
  }
  function formatDimensionValue(mm,units){
    const u=units||{mm:true,inch:false},parts=[];
    if(u.mm!==false)parts.push(`${Math.round(Number(mm))} mm`);
    if(u.inch)parts.push(`${(Number(mm)/25.4).toFixed(2)}"`);
    return parts.join(' - ');
  }
  function addDimensionArrow(group,x,y,z,dx,dy,meta){
    const len=48,wing=24,mag=Math.max(1,Math.hypot(dx,dy)),ux=dx/mag,uy=dy/mag,px=-uy,py=ux;
    return addDimensionLine(group,[[x,y,z],[x+ux*len+px*wing,y+uy*len+py*wing,z],[x,y,z],[x+ux*len-px*wing,y+uy*len-py*wing,z]],meta);
  }
  function addDimensions(group,W,H,meta,units){
    const z=48,half=W/2,below=-220,left=-half-220,ext=28;
    addDimensionLine(group,[[-half,0,z],[-half,below-ext,z],[half,0,z],[half,below-ext,z],[-half,below,z],[half,below,z]],meta);
    addDimensionArrow(group,-half,below,z,1,0,meta);addDimensionArrow(group,half,below,z,-1,0,meta);
    addDimensionLine(group,[[-half,0,z],[left-ext,0,z],[-half,H,z],[left-ext,H,z],[left,0,z],[left,H,z]],meta);
    addDimensionArrow(group,left,0,z,0,1,meta);addDimensionArrow(group,left,H,z,0,-1,meta);
    const widthLabel=addFaceTextLabel(group,formatDimensionValue(W,units),0,below,z+2,'dimension-width','outer',meta);
    const heightLabel=addFaceTextLabel(group,formatDimensionValue(H,units),left,H/2,z+2,'dimension-height','outer',meta);
    heightLabel.rotation.z=Math.PI/2;
  }

  function normalizeInput(input){
    const v={...DEFAULTS,...(input||{})};
    v.width=Math.max(151,Number(v.width)||3000);v.height=Math.max(251,Number(v.height)||3050);v.panels=Math.max(2,Math.min(8,Math.round(Number(v.panels)||3)));
    v.view=String(v.view||'OUTSIDE VIEW').toUpperCase();v.motorDirection=String(v.motorDirection||'RIGHT').toUpperCase();v.subtype=String(v.subtype||v.type||'STANDARD').toUpperCase();v.type=v.subtype;v.displayState=String(v.displayState||'CLOSED').toUpperCase();if(v.openProgress!==undefined&&v.openProgress!==null&&Number.isFinite(Number(v.openProgress)))v.openProgress=Math.max(0,Math.min(1,Number(v.openProgress)));return v;
  }
  function standardizedSubtype(value){const raw=String(value||'STANDARD').toUpperCase();if(raw==='STANDARD')return'DOWNWARD COLLECTING';if(raw==='CLEANABLE')return'CLEANABLE';if(raw==='UPWARD COLLECTING')return'UPWARD COLLECTING';if(raw==='DOWNWARD COLLECTING')return'DOWNWARD COLLECTING';return raw;}
  function panelFrontInset(index,panels){if(panels<=1)return 0;return STANDARD.bottomPanelInset*((panels-1-index)/(panels-1));}
  function closedPanelCenters(H,panelH,panels){
    const baseTop=STANDARD.baseHeight,motorBottom=H-STANDARD.motorBoxHeight,bottomCenter=baseTop+panelH/2,topCenter=motorBottom-panelH/2;
    if(panels===1)return[bottomCenter];const step=(topCenter-bottomCenter)/(panels-1);return Array.from({length:panels},(_,i)=>bottomCenter+i*step);
  }
  function openPanelCenters(H,panelH,panels,subtype){
    const closed=closedPanelCenters(H,panelH,panels);
    if(subtype==='DOWNWARD COLLECTING'||subtype==='CLEANABLE'){
      const bottomCenter=closed[0];
      return Array.from({length:panels},()=>bottomCenter);
    }
    if(subtype==='UPWARD COLLECTING'){
      const topCenter=closed[panels-1];
      return Array.from({length:panels},()=>topCenter);
    }
    return closed;
  }
  function cascadedPanelCenters(closed,open,subtype,progress){
    const p=Math.max(0,Math.min(1,Number(progress)||0)),n=closed.length;
    if(n<=1||p<=0)return closed.slice();
    if(p>=1)return open.slice();
    const out=closed.slice();
    if(subtype==='DOWNWARD COLLECTING'||subtype==='CLEANABLE'){
      const movers=Math.max(1,n-1),segment=1/movers;
      for(let step=1;step<n;step++){
        const start=(step-1)*segment,local=Math.max(0,Math.min(1,(p-start)/segment));
        if(local<=0)break;
        const delta=(closed[step-1]-closed[step])*local;
        for(let j=step;j<n;j++) out[j]+=delta;
      }
      return out;
    }
    if(subtype==='UPWARD COLLECTING'){
      const movers=Math.max(1,n-1),segment=1/movers;
      for(let phase=0;phase<movers;phase++){
        const leader=n-2-phase,start=phase*segment,local=Math.max(0,Math.min(1,(p-start)/segment));
        if(local<=0)break;
        const delta=(closed[leader+1]-closed[leader])*local;
        for(let j=0;j<=leader;j++) out[j]+=delta;
      }
      return out;
    }
    return closed.map((c,i)=>c+(open[i]-c)*p);
  }
  function panelMetrics(W,H,panels){
    const panelW=Math.max(40,W-STANDARD.postWidth*2),clearH=Math.max(1,H-STANDARD.motorBoxHeight-STANDARD.baseHeight);
    const rawOuterH=(clearH+STANDARD.targetPanelOverlap*Math.max(0,panels-1))/panels;
    const glassH=Math.max(1,Math.round(rawOuterH-STANDARD.panelFrameFace*2)),panelH=glassH+STANDARD.panelFrameFace*2;
    const actualOverlap=panels>1?(panelH*panels-clearH)/(panels-1):0;
    return{panelW,panelH,glassW:Math.max(1,panelW-STANDARD.panelFrameFace*2),glassH,actualOverlap,clearH};
  }

  function buildPanel(group,cfg,placement,index,style,meta){
    const subtype=standardizedSubtype(placement.subtype),isBottom=index===0,openProgress=Math.max(0,Math.min(1,Number(cfg.openProgress)||0)),cleanableMoving=openProgress>0&&isBottom&&subtype==='CLEANABLE',angle=cleanableMoving?THREE.MathUtils.degToRad(29)*openProgress:0,hingeY=cfg.y-cfg.panelH/2;
    const add=(part,color,opacity)=>cleanableMoving?addBottomHungBox(group,part,color,opacity,style.finish,angle,hingeY,{...meta,isTogglePanel:true,panelIndex:index,panelOpen:Boolean(cfg.productOpen),openProgress}):addBox(group,part,color,opacity,style.finish,{...meta,isTogglePanel:true,panelIndex:index,panelOpen:Boolean(cfg.productOpen),openProgress});
    const f=STANDARD.panelFrameFace,d=STANDARD.panelFrameDepth;
    add({name:`Guillotine Glass ${index+1}`,u:0,y:cfg.y,v:cfg.v,w:cfg.glassW,h:cfg.glassH,t:cfg.glassDepth},cfg.glassColor,.35);
    const pc=cfg.profileColors||{};
    add({name:`Guillotine Left Stile ${index+1}`,u:-cfg.panelW/2+f/2,y:cfg.y,v:cfg.v,w:f,h:cfg.panelH,t:d},pc.leftStile??cfg.panelColor,1);
    add({name:`Guillotine Right Stile ${index+1}`,u:cfg.panelW/2-f/2,y:cfg.y,v:cfg.v,w:f,h:cfg.panelH,t:d},pc.rightStile??cfg.panelColor,1);
    add({name:`Guillotine Top Rail ${index+1}`,u:0,y:cfg.y+cfg.panelH/2-f/2,v:cfg.v,w:cfg.panelW,h:f,t:d},pc.topRail??cfg.panelColor,1);
    add({name:`Guillotine Bottom Rail ${index+1}`,u:0,y:cfg.y-cfg.panelH/2+f/2,v:cfg.v,w:cfg.panelW,h:f,t:d},pc.bottomRail??cfg.panelColor,1);

    const arrowZ=cfg.frontPlane+4;
    const downward=(subtype==='DOWNWARD COLLECTING'||subtype==='CLEANABLE')&&index>0;
    const upward=subtype==='UPWARD COLLECTING'&&index<Math.min(2,cfg.panels);
    if(downward||upward)addArrow(group,{name:`${downward?'Downward':'Upward'} Guillotine Direction Arrow ${index+1}`,u:0,y:cfg.y,v:arrowZ,length:Math.min(Math.max(90,cfg.glassH*.42),260),maxLength:Math.max(90,cfg.glassH-36),direction:downward?-1:1,vertical:true},meta);
    if(subtype==='CLEANABLE'&&isBottom)addVMarker(group,{u:0,y:cfg.y,v:arrowZ+3,w:Math.min(170,cfg.glassW*.15),h:Math.min(100,cfg.glassH*.12)},meta);
  }

  function buildSingle(input){
    const v=normalizeInput(input),W=v.width,H=v.height,root=new THREE.Group(),meta={positionId:String(v.id||''),positionNo:String(v.positionNo||''),productType:'GUILLOTINE'};
    root.name=`Giyotin ${v.positionNo||''}`.trim();
    const subtype=standardizedSubtype(v.subtype),insideView=v.view==='INSIDE VIEW',system=hexNumber(v.systemColor&&v.systemColor.hex,0x383e42),schematic=schematicMode(v.systemColor),finish=schematic?'MATTE':String(v.systemColor&&v.systemColor.finish||'MATTE').toUpperCase(),style={finish};
    if(!schematic)meta.paintCode=v.systemColor?.code;
    const placement={...v,subtype},glassColor=glassVisualColor(placement),glazing=glazingSectionSpec(placement),productRoot=new THREE.Group();productRoot.name='Giyotin Product Geometry';root.add(productRoot);
    const sideH=Math.max(1,H-STANDARD.motorBoxHeight-STANDARD.baseHeight),sideY=STANDARD.baseHeight+sideH/2,frontCenter=-STANDARD.systemDepth/2;
    addBox(productRoot,{name:'Guillotine Left Post',u:-W/2+STANDARD.postWidth/2,y:sideY,v:frontCenter,w:STANDARD.postWidth,h:sideH,t:STANDARD.systemDepth},schematic?SCHEMATIC_PALETTE.leftPost:system,1,finish,meta);
    addBox(productRoot,{name:'Guillotine Right Post',u:W/2-STANDARD.postWidth/2,y:sideY,v:frontCenter,w:STANDARD.postWidth,h:sideH,t:STANDARD.systemDepth},schematic?SCHEMATIC_PALETTE.rightPost:system,1,finish,meta);
    addBox(productRoot,{name:'Guillotine Motor Box',u:0,y:H-STANDARD.motorBoxHeight/2,v:frontCenter,w:W,h:STANDARD.motorBoxHeight,t:STANDARD.systemDepth},schematic?SCHEMATIC_PALETTE.motorBox:system,1,finish,meta);
    addBox(productRoot,{name:'Guillotine Bottom Base',u:0,y:STANDARD.baseHeight/2,v:frontCenter,w:W,h:STANDARD.baseHeight,t:STANDARD.systemDepth},schematic?SCHEMATIC_PALETTE.bottomBase:system,1,finish,meta);

    const panels=v.panels,metrics=panelMetrics(W,H,panels),closedCenters=closedPanelCenters(H,metrics.panelH,panels),openCenters=openPanelCenters(H,metrics.panelH,panels,subtype),productOpen=v.displayState==='OPEN',openProgress=Number.isFinite(Number(v.openProgress))?Math.max(0,Math.min(1,Number(v.openProgress))):(productOpen?1:0),centers=cascadedPanelCenters(closedCenters,openCenters,subtype,openProgress);
    for(let i=0;i<panels;i++){
      const inset=panelFrontInset(i,panels),frontPlane=-inset,z=frontPlane-STANDARD.panelFrameDepth/2;
      buildPanel(productRoot,{y:centers[i],v:z,frontPlane,panelW:metrics.panelW,panelH:metrics.panelH,glassW:metrics.glassW,glassH:metrics.glassH,panelColor:system,profileColors:schematic?{leftStile:SCHEMATIC_PALETTE.leftStile,rightStile:SCHEMATIC_PALETTE.rightStile,topRail:SCHEMATIC_PALETTE.topRail,bottomRail:SCHEMATIC_PALETTE.bottomRail}:null,glassColor,glassDepth:glazing.glassDepth,panels,productOpen,openProgress},placement,i,style,meta);
    }
    if(insideView)productRoot.rotation.y=Math.PI;

    // View and motor labels are always present on both outer and inner faces, 1 mm in front of the related surface.
    const motorY=H-STANDARD.motorBoxHeight/2;
    const outerLabelZ=1,innerLabelZ=-(STANDARD.systemDepth+1);
    const selectedMotorSide=v.motorDirection==='LEFT'?-1:1;
    const physicalMotorSide=insideView?-selectedMotorSide:selectedMotorSide;
    const positionText=String(v.positionNo||'').trim()?`${String(v.positionNo).trim()} - ${Math.max(1,Math.trunc(Number(v.quantity)||1))} Adet`:'';
    const positionSpec=faceLabelSpec(positionText,'position'),motorSpec=faceLabelSpec('MOTOR','motor'),sharedInset=Math.min(W*.24,Math.max(positionSpec.width/2+70,motorSpec.width/2+70));
    const knownView=['INSIDE VIEW','OUTSIDE VIEW'].includes(v.view),knownMotor=['LEFT','RIGHT'].includes(v.motorDirection);
    const motorX=physicalMotorSide*(W/2-sharedInset),positionX=knownView&&knownMotor?-physicalMotorSide*(W/2-sharedInset):-(W/2-sharedInset);
    addFaceTextLabel(productRoot,'DIŞ BAKIŞ',0,motorY,outerLabelZ,'view','outer',meta);
    addFaceTextLabel(productRoot,'İÇ BAKIŞ',0,motorY,innerLabelZ,'view','inner',meta);
    if(knownView&&knownMotor)addFaceTextLabel(productRoot,'MOTOR',motorX,motorY,outerLabelZ,'motor','outer',meta);
    if(knownView&&knownMotor)addFaceTextLabel(productRoot,'MOTOR',motorX,motorY,innerLabelZ,'motor','inner',meta);
    if(positionText){
      addFaceTextLabel(productRoot,positionText,positionX,motorY,outerLabelZ,'position','outer',{...meta,positionLabel:true});
      addFaceTextLabel(productRoot,positionText,positionX,motorY,innerLabelZ,'position','inner',{...meta,positionLabel:true});
    }
    if(v.showDimensions)addDimensions(root,W,H,meta,v.dimensionUnits);

    root.userData={
      source:'PLMR V49 Giyotin standalone extraction revised by explicit standardized geometry prompt',input:{...v},...meta,
      derived:{
        subtype,panelCount:panels,postWidth:STANDARD.postWidth,systemDepth:STANDARD.systemDepth,sidePostHeight:sideH,
        motorBoxHeight:STANDARD.motorBoxHeight,baseHeight:STANDARD.baseHeight,panelFrameFace:STANDARD.panelFrameFace,panelFrameDepth:STANDARD.panelFrameDepth,
        panelOuterWidth:metrics.panelW,panelOuterHeight:metrics.panelH,glassWidth:metrics.glassW,glassHeight:metrics.glassH,glassDepth:glazing.glassDepth,
        panelFrontInsets:Array.from({length:panels},(_,i)=>panelFrontInset(i,panels)),closedPanelCenters:closedCenters,openPanelCenters:openCenters,renderedPanelCenters:centers,
        overlap:metrics.actualOverlap,viewText:insideView?'İÇ BAKIŞ':'DIŞ BAKIŞ',motorTextSide:physicalMotorSide<0?'LEFT':'RIGHT',selectedViewMotorTextSide:selectedMotorSide<0?'LEFT':'RIGHT',productOpen,openProgress
      }
    };
    return root;
  }

  function buildLayout(items,options){
    const list=(items||[]).filter(x=>x&&Number(x.width)>0&&Number(x.height)>0),opts=options||{},cols=Math.max(1,Math.min(list.length||1,10,Math.round(Number(opts.columns)||2)));
    const gapX=Math.max(160,Math.min(760,Number(opts.gapX)||STANDARD.compactGapX)),gapY=Math.max(160,Math.min(760,Number(opts.gapY)||STANDARD.compactGapY)),rowHeights=[],colWidths=[];
    list.forEach((item,i)=>{const r=Math.floor(i/cols),c=i%cols;rowHeights[r]=Math.max(rowHeights[r]||0,Number(item.height)||2400);colWidths[c]=Math.max(colWidths[c]||0,Number(item.width)||3000);});
    const totalW=colWidths.reduce((a,b)=>a+b,0)+Math.max(0,cols-1)*gapX,totalH=rowHeights.reduce((a,b)=>a+b,0)+Math.max(0,rowHeights.length-1)*gapY,xStarts=[];let x=-totalW/2;
    colWidths.forEach((w,i)=>{xStarts[i]=x;x+=w+gapX;});const yStarts=[];let top=totalH/2;rowHeights.forEach((h,i)=>{yStarts[i]=top-h;top-=h+gapY;});
    return{columns:cols,gapX,gapY,rowHeights,colWidths,totalW,totalH,positions:list.map((item,i)=>({item,row:Math.floor(i/cols),col:i%cols,x:xStarts[i%cols]+Number(item.width)/2,y:yStarts[Math.floor(i/cols)]}))};
  }
  function buildMultiple(items,options){const layout=buildLayout(items,options),group=new THREE.Group();group.name='Giyotin Multi Position';layout.positions.forEach(p=>{const g=buildSingle(p.item);g.position.set(p.x,p.y,0);group.add(g);});group.userData={layout,source:'Revised standalone Giyotin compact multi-position layout'};return group;}
  function inspect(group){
    let meshes=0,lines=0,labels=0;const names=[],screenLabels=[];group.traverse(o=>{if(o.isMesh){meshes++;if(o.userData&&o.userData.name)names.push(o.userData.name);}if(o.isLine||o.isLineSegments){lines++;if(o.userData&&o.userData.name)names.push(o.userData.name);}if(o.userData&&o.userData.screenLabel){labels++;screenLabels.push({...o.userData.screenLabel,name:o.userData.name||''});}});
    const box=new THREE.Box3().setFromObject(group),size=new THREE.Vector3();box.getSize(size);return{meshes,lines,labels,names,screenLabels,bounds:{min:box.min.toArray(),max:box.max.toArray(),size:size.toArray()}};
  }
  return Object.freeze({STANDARD,DEFAULTS,SCHEMATIC_PALETTE,GLAZING_SECTION_SPECS,normalizeInput,standardizedSubtype,panelFrontInset,panelMetrics,closedPanelCenters,openPanelCenters,cascadedPanelCenters,buildSingle,buildMultiple,buildLayout,inspect});
});
