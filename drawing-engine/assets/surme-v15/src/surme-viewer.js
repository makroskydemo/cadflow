(function(root){
root.createPLMRSurmeViewer=function(){
  'use strict';
  const THREE=root.THREE,Engine=root.PLMRSurme3DEngine;
  if(!THREE||!Engine)throw new Error('Sürme viewer dependencies missing.');
  let container,scene,camera,renderer,controls,modelRoot,raycaster,pointer,onSelect,onToggle,onClearSelection,selectedId='',selectedIds=new Set(),animationId=0,transitionAnimationId=0,resizeObserver=null,labelLayer=null,dimensionLayer=null,labelEntries=[],dimensionEntries=[],lastViewState=null,currentRenderedItems=[],cameraHandlers={};

  function init(target,handlers){
    container=typeof target==='string'?document.getElementById(target):target;if(!container)throw new Error('3D viewport bulunamadı.');
    cameraHandlers=handlers||{};onSelect=handlers&&handlers.onSelect;onToggle=handlers&&handlers.onToggle;onClearSelection=handlers&&handlers.onClearSelection;
    scene=new THREE.Scene();scene.background=new THREE.Color(0x0f172a);
    camera=new THREE.PerspectiveCamera(38,1,1,100000);camera.position.set(0,1500,5000);
    try{
      renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,preserveDrawingBuffer:true});
      renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));renderer.shadowMap.enabled=true;if('outputColorSpace'in renderer&&THREE.SRGBColorSpace)renderer.outputColorSpace=THREE.SRGBColorSpace;
      container.innerHTML='';container.appendChild(renderer.domElement);container.dataset.webglReady='true';
      dimensionLayer=document.createElementNS('http://www.w3.org/2000/svg','svg');dimensionLayer.setAttribute('class','three-dimension-layer');dimensionLayer.setAttribute('aria-hidden','true');container.appendChild(dimensionLayer);labelLayer=document.createElement('div');labelLayer.className='three-label-layer';labelLayer.setAttribute('aria-hidden','true');container.appendChild(labelLayer);
    }catch(error){container.dataset.webglReady='false';container.innerHTML=`<div style="color:#fff;padding:24px">WebGL başlatılamadı: ${String(error.message||error)}</div>`;throw error;}
    controls=new THREE.OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.08;controls.screenSpacePanning=true;controls.minDistance=250;controls.maxDistance=50000;controls.addEventListener('change',()=>cameraHandlers.onCameraChange?.(cameraState()));
    scene.add(new THREE.HemisphereLight(0xffffff,0x223344,1.08));const key=new THREE.DirectionalLight(0xffffff,1.15);key.position.set(4000,6500,5000);key.castShadow=true;scene.add(key);const fill=new THREE.DirectionalLight(0xbfe7ff,.52);fill.position.set(-4500,2800,2500);scene.add(fill);
    raycaster=new THREE.Raycaster();pointer=new THREE.Vector2();renderer.domElement.addEventListener('click',event=>pick(event,false));renderer.domElement.addEventListener('dblclick',event=>pick(event,true));
    resize();window.addEventListener('resize',resize);if('ResizeObserver'in window){resizeObserver=new ResizeObserver(resize);resizeObserver.observe(container);}animate();return api;
  }
  function resize(){if(!renderer||!container)return;const w=Math.max(1,container.clientWidth),h=Math.max(1,container.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();updateLabels();}
  function disposeObject(rootObject){rootObject.traverse(o=>{if(o.geometry&&o.geometry.dispose)o.geometry.dispose();if(o.material){const arr=Array.isArray(o.material)?o.material:[o.material];arr.forEach(m=>{if(m.map&&m.map.dispose)m.map.dispose();if(m.dispose)m.dispose();});}});}
  function clearLabels(){labelEntries=[];dimensionEntries=[];if(labelLayer)labelLayer.innerHTML='';if(dimensionLayer)dimensionLayer.innerHTML='';}
  function clearModel(){if(modelRoot){scene.remove(modelRoot);disposeObject(modelRoot);modelRoot=null;}clearLabels();}
  function makeLabels(){
    clearLabels();if(!modelRoot||!labelLayer)return;
    modelRoot.traverse(o=>{
      const spec=o.userData&&o.userData.screenLabel;
      if(spec){const el=document.createElement('div');el.className=`three-screen-label label-${String(spec.kind||'generic').replace(/[^a-z0-9_-]/gi,'-').toLowerCase()}`;el.textContent=String(spec.text||'');labelLayer.appendChild(el);labelEntries.push({anchor:o,el,spec});}
      const guide=o.userData&&o.userData.screenDimensionGuide;
      if(guide&&dimensionLayer&&o.children.length>=4){const ns='http://www.w3.org/2000/svg',g=document.createElementNS(ns,'g'),ext1=document.createElementNS(ns,'line'),ext2=document.createElementNS(ns,'line'),main=document.createElementNS(ns,'line'),a1=document.createElementNS(ns,'polygon'),a2=document.createElementNS(ns,'polygon');g.setAttribute('class','screen-dimension-guide');[ext1,ext2,main].forEach(x=>g.appendChild(x));a1.setAttribute('class','dimension-arrow');a2.setAttribute('class','dimension-arrow');g.appendChild(a1);g.appendChild(a2);dimensionLayer.appendChild(g);dimensionEntries.push({guide:o,anchors:o.children.slice(0,4),kind:guide.kind,g,ext1,ext2,main,a1,a2});}
    });
  }
  function captureViewState(){
    if(!camera||!controls||!modelRoot)return null;
    const box=new THREE.Box3().setFromObject(modelRoot),center=new THREE.Vector3();
    if(box.isEmpty())return {cameraPosition:camera.position.clone(),target:controls.target.clone(),center:new THREE.Vector3()};
    box.getCenter(center);
    return {cameraPosition:camera.position.clone(),target:controls.target.clone(),center};
  }
  function restoreViewState(state){
    if(!state||!camera||!controls||!modelRoot)return false;
    const box=new THREE.Box3().setFromObject(modelRoot),newCenter=new THREE.Vector3();
    if(box.isEmpty())return false;
    box.getCenter(newCenter);
    const delta=newCenter.clone().sub(state.center||new THREE.Vector3());
    camera.position.copy(state.cameraPosition.clone().add(delta));
    controls.target.copy(state.target.clone().add(delta));
    camera.updateProjectionMatrix();controls.update();updateLabels();
    return true;
  }
  function restoreExactViewState(state){if(!state||!camera||!controls)return false;camera.position.copy(state.cameraPosition);controls.target.copy(state.target);camera.updateProjectionMatrix();controls.update();updateLabels();return true;}
  function cloneItems(items){return JSON.parse(JSON.stringify(items||[]));}
  function stateProgress(item){return String(item&&item.displayState||'CLOSED').toUpperCase()==='OPEN'?1:0;}
  function easedMotorProgress(t){t=Math.max(0,Math.min(1,t));return t*t*t*(t*(t*6-15)+10);}
  function replaceModel(items,opts,viewState,exactView){
    clearModel();modelRoot=Engine.buildMultiple(items,{columns:opts&&opts.columns,gapX:opts&&opts.gapX,gapY:opts&&opts.gapY});scene.add(modelRoot);makeLabels();if(selectedIds.size)highlightMany([...selectedIds]);else if(selectedId)highlight(selectedId);currentRenderedItems=cloneItems(items);
    if(viewState){if(exactView)restoreExactViewState(viewState);else restoreViewState(viewState);}return Engine.inspect(modelRoot);
  }
  function render(items,options){
    const opts=options||{},preserveView=Boolean(opts.preserveView),savedView=preserveView?captureViewState():null;
    if(transitionAnimationId){cancelAnimationFrame(transitionAnimationId);transitionAnimationId=0;}
    const inspection=replaceModel(items,opts,savedView,false);
    if(!savedView)fit(); else lastViewState=savedView;
    return inspection;
  }
  function animateTransition(fromItems,toItems,options){
    const opts=options||{},duration=Math.max(450,Number(opts.duration)||1800),savedView=captureViewState(),targetItems=cloneItems(toItems),sourceItems=cloneItems(currentRenderedItems.length?currentRenderedItems:fromItems||[]),sourceById=new Map(sourceItems.map(x=>[String(x.id),x])),targetById=new Map(targetItems.map(x=>[String(x.id),x])),start=performance.now();
    if(transitionAnimationId)cancelAnimationFrame(transitionAnimationId);
    if(!modelRoot){replaceModel(sourceItems.length?sourceItems:targetItems,opts,savedView,true);}
    const motion=[];
    if(modelRoot){
      modelRoot.traverse(o=>{
        if(!o||!o.userData||!Number.isInteger(o.userData.panelIndex))return;
        const id=String(o.userData.positionId||''),target=targetById.get(id),source=sourceById.get(id)||target;if(!target||!source)return;
        const idx=Number(o.userData.panelIndex),startP=Number.isFinite(Number(source.openProgress))?Number(source.openProgress):stateProgress(source),endP=stateProgress(target),startSpan=Engine.panelSpans(source,startP)[idx];
        if(!startSpan)return;
        motion.push({object:o,id,index:idx,offsetX:o.position.x-startSpan.center,startP,endP,target,indicator:Boolean(o.userData.movementIndicator)});
      });
    }
    function frame(now){
      const raw=Math.max(0,Math.min(1,(now-start)/duration)),ease=easedMotorProgress(raw),progressById=new Map();
      for(const m of motion){
        const p=m.startP+(m.endP-m.startP)*ease,spans=Engine.panelSpans(m.target,p),span=spans[m.index];if(span)m.object.position.x=span.center+m.offsetX;if(m.indicator)m.object.visible=p<.015;progressById.set(m.id,p);
      }
      const frameItems=targetItems.map(target=>{const source=sourceById.get(String(target.id)),startP=source&&Number.isFinite(Number(source.openProgress))?Number(source.openProgress):stateProgress(source||target),endP=stateProgress(target),p=progressById.has(String(target.id))?progressById.get(String(target.id)):startP+(endP-startP)*ease;return {...target,openProgress:p};});
      currentRenderedItems=cloneItems(frameItems);updateLabels();
      if(raw<1){transitionAnimationId=requestAnimationFrame(frame);}else{transitionAnimationId=0;replaceModel(targetItems,opts,savedView,true);}
    }
    transitionAnimationId=requestAnimationFrame(frame);return duration;
  }
  function fitOutside(padding=1.13){
    if(!modelRoot||!camera||!controls||!renderer)return;const box=new THREE.Box3().setFromObject(modelRoot);if(box.isEmpty())return;
    const size=new THREE.Vector3(),center=new THREE.Vector3();box.getSize(size);box.getCenter(center);
    const verticalFov=THREE.MathUtils.degToRad(camera.fov),aspect=Math.max(.1,camera.aspect||1),fitHeight=Math.max(1,size.y)/(2*Math.tan(verticalFov/2)),fitWidth=Math.max(1,size.x)/(2*Math.tan(verticalFov/2)*aspect),depthPad=Math.max(120,size.z*.8),distance=Math.max(650,Math.max(fitHeight,fitWidth)*Math.max(.96,Number(padding)||1.13)+depthPad);
    // Canonical PLMR Sürme fit: always return to the OUTSIDE elevation (+Z looking toward -Z).
    camera.up.set(0,1,0);camera.position.set(center.x,center.y,center.z+distance);camera.near=Math.max(.5,distance/8000);camera.far=Math.max(30000,distance*20);camera.updateProjectionMatrix();controls.target.copy(center);controls.update();lastViewState=captureViewState();updateLabels();
  }
  function fit(padding=1.13){return fitOutside(padding);}
  function updateLabels(){
    if(!renderer||!camera||!container)return;const w=renderer.domElement.clientWidth||container.clientWidth,h=renderer.domElement.clientHeight||container.clientHeight,tmp=new THREE.Vector3();
    const projectAnchor=anchor=>{anchor.getWorldPosition(tmp);tmp.project(camera);return{x:(tmp.x*.5+.5)*w,y:(-tmp.y*.5+.5)*h,z:tmp.z,visible:tmp.z>-1&&tmp.z<1&&tmp.x>-1.3&&tmp.x<1.3&&tmp.y>-1.3&&tmp.y<1.3};};
    for(const item of labelEntries){const p=projectAnchor(item.anchor);item.el.style.display=p.visible?'block':'none';if(!p.visible)continue;item.el.style.left=`${p.x}px`;item.el.style.top=`${p.y}px`;}
    for(const d of dimensionEntries){const pts=d.anchors.map(projectAnchor),visible=pts.every(p=>p.visible);d.g.style.display=visible?'block':'none';if(!visible)continue;const [o1,o2,p1,p2]=pts;d.ext1.setAttribute('x1',o1.x);d.ext1.setAttribute('y1',o1.y);d.ext1.setAttribute('x2',p1.x);d.ext1.setAttribute('y2',p1.y);d.ext2.setAttribute('x1',o2.x);d.ext2.setAttribute('y1',o2.y);d.ext2.setAttribute('x2',p2.x);d.ext2.setAttribute('y2',p2.y);d.main.setAttribute('x1',p1.x);d.main.setAttribute('y1',p1.y);d.main.setAttribute('x2',p2.x);d.main.setAttribute('y2',p2.y);const dx=p2.x-p1.x,dy=p2.y-p1.y,len=Math.max(1,Math.hypot(dx,dy)),ux=dx/len,uy=dy/len,px=-uy,py=ux,arrowLen=9,arrowHalf=4;const poly=(p,dir)=>`${p.x},${p.y} ${p.x+dir*ux*arrowLen+px*arrowHalf},${p.y+dir*uy*arrowLen+py*arrowHalf} ${p.x+dir*ux*arrowLen-px*arrowHalf},${p.y+dir*uy*arrowLen-py*arrowHalf}`;d.a1.setAttribute('points',poly(p1,1));d.a2.setAttribute('points',poly(p2,-1));}
  }
  function pointerFromEvent(event){const rect=renderer.domElement.getBoundingClientRect();pointer.x=((event.clientX-rect.left)/rect.width)*2-1;pointer.y=-((event.clientY-rect.top)/rect.height)*2+1;}
  function positionIdFromObject(obj){let current=obj;while(current){if(current.userData&&current.userData.positionId)return String(current.userData.positionId);current=current.parent;}return'';}
  function pick(event,doubleClick){if(!renderer||!modelRoot)return;pointerFromEvent(event);raycaster.setFromCamera(pointer,camera);const meshes=[];modelRoot.traverse(o=>{if(o.isMesh)meshes.push(o);});const hit=raycaster.intersectObjects(meshes,true)[0];const multi=Boolean(event&& (event.ctrlKey||event.metaKey));if(!hit){clearSelection();return;}const id=positionIdFromObject(hit.object);if(!id){clearSelection();return;}selectedId=id;if(multi){if(selectedIds.has(id))selectedIds.delete(id);else selectedIds.add(id);highlightMany([...selectedIds]);}else{selectedIds=new Set([id]);highlight(id);}if(doubleClick&&onToggle)onToggle(id,{multi,selectedIds:[...selectedIds]});else if(onSelect)onSelect(id,{multi,selectedIds:[...selectedIds],ctrlKey:Boolean(event&&event.ctrlKey),metaKey:Boolean(event&&event.metaKey)});}
  function highlightMany(ids){selectedIds=new Set((Array.isArray(ids)?ids:[ids]).filter(Boolean).map(String));selectedId=[...selectedIds].slice(-1)[0]||'';if(!modelRoot)return;modelRoot.traverse(o=>{if(!o.isMesh||!o.material)return;const pid=positionIdFromObject(o),active=selectedIds.has(pid);o.userData.__selected=active;if(o.material.emissive)o.material.emissive.setHex(active?0x153e4c:0x000000);});}
  function highlight(id){selectedId=String(id||'');selectedIds=new Set(selectedId?[selectedId]:[]);highlightMany([...selectedIds]);}
  function clearSelection(){selectedId='';selectedIds.clear();highlightMany([]);if(onClearSelection)onClearSelection();}
  function animate(){animationId=requestAnimationFrame(animate);if(controls)controls.update();if(renderer&&scene&&camera){renderer.render(scene,camera);updateLabels();}}
  function capture(){if(!renderer)return'';renderer.render(scene,camera);return renderer.domElement.toDataURL('image/png');}
  function captureFitJpeg(width=3200,height=2263,quality=.97,options){
    if(!renderer||!scene||!camera||!controls||!modelRoot)throw new Error('SURME_3D_CAPTURE_UNAVAILABLE');
    const saved=captureViewState(),oldPixelRatio=renderer.getPixelRatio(),oldSize=renderer.getSize(new THREE.Vector2()),oldAspect=camera.aspect,opts=options||{},dimensionSnapshots=[];
    try{
      if(opts.dimensionColor!=null){
        modelRoot.traverse(o=>{
          if(!o||!o.userData||!o.userData.dimension||!o.material||!o.material.color)return;
          const materials=Array.isArray(o.material)?o.material:[o.material];
          for(const m of materials){if(m&&m.color){dimensionSnapshots.push({material:m,color:m.color.getHex()});m.color.setHex(Number(opts.dimensionColor));}}
        });
      }
      renderer.setPixelRatio(1);renderer.setSize(Math.max(640,Math.trunc(Number(width)||3200)),Math.max(480,Math.trunc(Number(height)||2263)),false);
      camera.aspect=renderer.domElement.width/Math.max(1,renderer.domElement.height);camera.updateProjectionMatrix();fit(1.14);renderer.render(scene,camera);
      return {dataUrl:renderer.domElement.toDataURL('image/jpeg',Math.max(.8,Math.min(1,Number(quality)||.97))),width:renderer.domElement.width,height:renderer.domElement.height};
    }finally{
      for(const snap of dimensionSnapshots){try{snap.material.color.setHex(snap.color);}catch(_){}}
      renderer.setPixelRatio(oldPixelRatio);renderer.setSize(Math.max(1,oldSize.x),Math.max(1,oldSize.y),false);camera.aspect=oldAspect;camera.updateProjectionMatrix();if(saved)restoreExactViewState(saved);renderer.render(scene,camera);
    }
  }
  function getViewState(){
    if(!camera||!controls)return null;
    return {camera:[camera.position.x,camera.position.y,camera.position.z],target:[controls.target.x,controls.target.y,controls.target.z],outside:Boolean(camera.position.z>controls.target.z)};
  }
  function cameraState(){
    if(!camera||!controls)return null;const d=camera.position.clone().sub(controls.target),len=Math.max(1,d.length());d.divideScalar(len);
    return {direction:[d.x,d.y,d.z],position:[camera.position.x,camera.position.y,camera.position.z],target:[controls.target.x,controls.target.y,controls.target.z],up:[camera.up.x,camera.up.y,camera.up.z]};
  }
  function setStandardView(view){
    if(!camera||!controls||!modelRoot)return false;const box=new THREE.Box3().setFromObject(modelRoot);if(box.isEmpty())return false;const center=new THREE.Vector3(),size=new THREE.Vector3();box.getCenter(center);box.getSize(size);const radius=Math.max(250,size.length()/2),current=Math.max(650,camera.position.distanceTo(controls.target)),distance=Math.max(current,radius*2.35);const dirs={front:[0,0,1],back:[0,0,-1],right:[1,0,0],left:[-1,0,0],top:[0,1,0],bottom:[0,-1,0],iso:[1,.72,1]};const viewKey=String(view||'front').toLowerCase(),parts=viewKey.split('-').filter(Boolean);let raw=dirs[viewKey];if(!raw){let x=0,y=0,z=0;for(const part of parts){if(part==='right')x+=1;else if(part==='left')x-=1;else if(part==='top')y+=1;else if(part==='bottom')y-=1;else if(part==='front')z+=1;else if(part==='back')z-=1;}raw=(x||y||z)?[x,y,z]:dirs.front;}const dir=new THREE.Vector3(raw[0],raw[1],raw[2]).normalize();camera.position.copy(center.clone().add(dir.multiplyScalar(distance)));camera.up.set(0,1,0);if(parts.length===1&&parts[0]==='top')camera.up.set(0,0,-1);if(parts.length===1&&parts[0]==='bottom')camera.up.set(0,0,1);controls.target.copy(center);camera.near=Math.max(.5,distance/8000);camera.far=Math.max(30000,distance*20);camera.updateProjectionMatrix();controls.update();updateLabels();cameraHandlers.onCameraChange?.(cameraState());return true;
  }
  function dispose(){if(animationId)cancelAnimationFrame(animationId);if(transitionAnimationId)cancelAnimationFrame(transitionAnimationId);if(resizeObserver)resizeObserver.disconnect();window.removeEventListener('resize',resize);clearModel();if(renderer){renderer.dispose();if(renderer.domElement.parentNode)renderer.domElement.parentNode.removeChild(renderer.domElement);}if(labelLayer&&labelLayer.parentNode)labelLayer.parentNode.removeChild(labelLayer);if(dimensionLayer&&dimensionLayer.parentNode)dimensionLayer.parentNode.removeChild(dimensionLayer);labelLayer=dimensionLayer=null;renderer=controls=camera=scene=null;}
  const api={init,render,animateTransition,fit,fitOutside,getViewState,cameraState,setStandardView,highlight,highlightMany,clearSelection,capture,captureFitJpeg,dispose,get selectedId(){return selectedId;},get selectedIds(){return [...selectedIds];}};return api;
};root.PLMRSurmeViewer=root.createPLMRSurmeViewer();
})(window);
