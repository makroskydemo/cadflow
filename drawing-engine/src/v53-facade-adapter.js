/* V10 boundary adapter. The V53 engines and documents in src/v53 are unmodified.
   Only host input mapping, rigid facade placement and persistent motion binding live here. */
(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory(require('../vendor/three-r128/three.min.js'),require('./v53/surme-3d-engine.js'),require('./v53/giyotin-3d-engine.js'),globalThis);
  else root.PLMRV53FacadeAdapter=factory(root.THREE,root.PLMRSurme3DEngine,root.PLMRGiyotin3DEngine,root);
})(typeof window!=='undefined'?window:globalThis,function(THREE,Sliding,Guillotine,root){
  'use strict';
  function ease(t){return t*t*t*(t*(6*t-15)+10);}
  function inputFor(type,p,zone,context){
    const color={...((context||{}).systemColor||{code:'Varsayılan',kind:'schematic',schematic:true})};
    if(type==='sliding'&&color.finish==='GLOSS')color.finish='PARLAK';
    const input={...p,id:String(p.id||zone.id||''),positionNo:'',width:zone.width,height:zone.height,
      type:p.subtype||p.type,subtype:p.subtype,panels:Number(p.panels)||GuillotineCount(p.panelCount||p.panelType),
      panelCount:Number(p.panels)||Number(p.panelCount)||GuillotineCount(p.panelCount),
      displayState:'CLOSED',openProgress:0,showDimensions:false,systemColor:color};
    if(type==='sliding'&&p.glassColor==='SMOKED')input.glassColor='FUME';
    return (type==='sliding'?Sliding:Guillotine).normalizeInput(input);
  }
  function GuillotineCount(value){const map={'1+1':2,'1+2':3,'1+3':4};return map[value]||Math.max(2,Math.round(Number(value)||3));}
  function mountAngle(zone){return zone.axis==='x'?(zone.inward<0?0:Math.PI):(zone.inward>0?-Math.PI/2:Math.PI/2);}
  function build(type,p,zone,context){
    const engine=type==='sliding'?Sliding:Guillotine,input=context?.nativeInput?engine.normalizeInput(context.nativeInput):inputFor(type,p,zone,context);
    const model=engine.buildSingle(input),mount=new THREE.Group();mount.name='V53 '+type+' facade';mount.rotation.y=mountAngle(zone);
    mount.position.set(zone.cx+(zone.axis==='z'?zone.outerFaceV:0),zone.bottomY,zone.cz+(zone.axis==='x'?zone.outerFaceV:0));mount.add(model);
    const markers=[],moving=[];model.traverse(o=>{if(o.userData.movementIndicator)markers.push(o);});
    let duration,update;
    if(type==='sliding'){
      const closed=Sliding.panelSpans(input,0);
      model.traverse(o=>{const i=o.userData.panelIndex;if(Number.isInteger(i))moving.push({object:o,index:i,offset:o.position.x-closed[i].center});});
      duration=1800;
      update=t=>{const spans=Sliding.panelSpans(input,t);moving.forEach(m=>m.object.position.x=spans[m.index].center+m.offset);markers.forEach(o=>o.visible=true);model.userData.derived.openProgress=t;};
    }else{
      const subtype=Guillotine.standardizedSubtype(input.subtype),metrics=Guillotine.panelMetrics(input.width,input.height,input.panels),closed=Guillotine.closedPanelCenters(input.height,metrics.panelH,input.panels),open=Guillotine.openPanelCenters(input.height,metrics.panelH,input.panels,subtype);
      const geometry=model.children.find(o=>o.name==='Giyotin Product Geometry');
      for(const o of [...geometry.children]){
        const marker=o.userData.movementIndicator;let index=o.userData.panelIndex;
        if(!Number.isInteger(index)&&marker){const match=String(o.userData.name||o.name).match(/Arrow (\d+)/);index=match?Number(match[1])-1:/V Marker/.test(o.userData.name||'')?0:null;}
        if(!Number.isInteger(index))continue;
        let pivot=null;
        if(index===0&&subtype==='CLEANABLE'&&!marker){pivot=new THREE.Group();pivot.position.set(o.position.x,closed[0]-metrics.panelH/2,o.position.z);geometry.add(pivot);o.position.sub(pivot.position);pivot.add(o);}
        moving.push({object:o,pivot,index,baseY:o.position.y});
      }
      const travel=Math.max(...closed.map((y,i)=>Math.abs(open[i]-y)),subtype==='CLEANABLE'?metrics.panelH*.5:0);
      duration=Math.round(Math.max(1200,Math.min(3200,850+(travel/850)*1000)));
      update=t=>{const centers=Guillotine.cascadedPanelCenters(closed,open,subtype,t);for(const m of moving){const dy=centers[m.index]-closed[m.index];if(m.pivot){m.pivot.position.y=closed[0]-metrics.panelH/2+dy;m.pivot.rotation.x=-THREE.MathUtils.degToRad(29)*t;}else m.object.position.y=m.baseY+dy;}model.userData.derived.renderedPanelCenters=centers;model.userData.derived.openProgress=t;};
    }
    mount.userData.zoneId=zone.id;mount.userData.v53Facade={type,input,derived:model.userData.derived,duration,rotation:mount.rotation.y};
    const apply=t=>{update(t);};
    return {root:mount,input,duration,update:apply};
  }
  function drawing2D(type,p,presentation={}){
    const input=inputFor(type,p,{id:p.id,width:p.width,height:p.height}),id=input.id||'facade',open=p.collectionState==='COLLECTED'||p.bottomPanelState==='OPEN';
    const options={...input,panelCount:type==='sliding'?input.panelCount:(p.panelCount||p.panelType||input.panels),color:'Varsayılan',type:input.subtype||input.type};
    let project,document;
    if(type==='sliding'){
      project=root.PLMRSurmeState.createProject({positions:[{id,positionNo:p.positionCode||'P01',productType:'SLIDING',width:input.width,height:input.height,quantity:1,options}],commonSettings:{color:'Varsayılan',defaults:options,expandQuantity:false},layout:{columnCount:1},drawingSettings:{openState:open?'OPEN':'CLOSED',showDimensions:!!presentation.detailDimensions,dimensionUnits:presentation.dimensionUnits,columns:1}});
      document=root.PLMRSurme2DDocument.buildDocument(project);
    }else{
      project={projectInfo:{},positions:[{id,positionNo:p.positionCode||'P01',productType:'GUILLOTINE',width:input.width,height:input.height,quantity:1,options,order:1}],commonSettings:{color:'Varsayılan',defaultsByProduct:{GUILLOTINE:options},expandQuantity:false},layout:{columnCount:1},drawingSettings:{openState:open?'OPEN':'CLOSED',showDimensions:!!presentation.detailDimensions,dimensionUnits:presentation.dimensionUnits,columns:1}};
      document=root.PLMRGiyotin2DDocument.buildDocument(project);
    }
    const origin=document.positions[0].origin;
    const entities=document.entities.filter(e=>e.positionId===id&&(presentation.detailDimensions||(!e.quantityLabel&&e.type!=='dimension'))).map(source=>{
      const e=JSON.parse(JSON.stringify(source));let dy=0;
      if(presentation.detailDimensions && e.type==='dimension')return root.PLMRV24Details2D.translate(e,-origin.x,-origin.y);
      // The V53 document defines the accepted closed profiles. Project their target
      // vertical positions through its 3D kinematics, using the document's own dimensions.
      if(type==='guillotine'&&open&&Number.isInteger(e.panelIndex)){
        const n=input.panels,panelH=(input.height-200+49.5*(n-1))/n;
        const closed=Guillotine.closedPanelCenters(input.height,panelH,n),target=Guillotine.openPanelCenters(input.height,panelH,n,input.subtype);dy=target[e.panelIndex]-closed[e.panelIndex];
      }
      for(const key of ['x','x1','x2'])if(e[key]!=null)e[key]-=origin.x;
      for(const key of ['y','y1','y2'])if(e[key]!=null)e[key]+=dy-origin.y;
      if(e.points)e.points=e.points.map(pt=>[pt[0]-origin.x,pt[1]-origin.y+dy]);
      e.semanticRole=e.role==='glass'?'product-glass':e.role==='movement'?'product-symbol':'product-frame';
      return e;
    });
    return {entities,source:'Arayuz_PLMR_V53',nativeDocumentSchema:document.schema};
  }
  return Object.freeze({inputFor,mountAngle,build,drawing2D,ease});
});
