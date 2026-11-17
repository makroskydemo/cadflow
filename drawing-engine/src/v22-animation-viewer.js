/* Owns only temporary render state. No host commands, journal or snapshots are written. */
window.PLMRAnimationViewer=function(E){
 'use strict';const C=window.PLMRAnimationCore;let state=null,muted=false;
 const captureCamera=()=>C.camera({position:E.camera.position.toArray(),target:E.controls.target.toArray(),zoom:E.camera.zoom,fov:E.camera.fov,aspect:E.camera.aspect});
 function applyCamera(c){E.camera.fov=c.fov||38;E.camera.position.fromArray(c.position);E.controls.target.fromArray(c.target);E.camera.zoom=c.zoom*Math.min(1,E.camera.aspect/(c.aspect||E.camera.aspect));E.camera.updateProjectionMatrix();E.camera.lookAt(E.controls.target);}
 function facadeInventory(){
  const all=E.roofs().flatMap(o=>Object.entries(o.spec?.placements||{}).map(([zoneId,p])=>({owner:o.id,zoneId,type:p.type})).concat(Object.entries(o.spec?.zipPlacements||{}).map(([zoneId])=>({owner:o.id,zoneId,type:'zip'}))));
  const key=(owner,zone,type)=>JSON.stringify([owner,zone,type]);
  const classified=new Map(C.classifyFacade(all).map(p=>[key(p.owner,p.zoneId,p.type),p.group]));
  return [...E.facades.values()].filter(r=>r.bindings.length).map(r=>{
   const zoneId=r.key.startsWith('zip:')?r.key.slice(4):r.key;
   return {key:r.id,owner:r.owner,zoneId,type:r.type,movable:r.type!=='fixed',group:classified.get(key(r.owner,zoneId,r.type))||'sides'};
  });
 }
 function inventory(){return E.roof.state().map(r=>({key:r.owner+':'+r.moduleIndex,kind:'roof',owner:r.owner,moduleIndex:r.moduleIndex,movable:E.roofCore.product(r.id).motion!=='Fixed',group:'canopy'})).concat(facadeInventory());}
 function decoration(o){const d=o.userData||{};return Boolean(d.isZone||d.isRoofZone||d.isDimension||d.dimension||d.dimensionLabel||d.positionLabel||d.flatTextLabel||d.presentationAnnotation||d.movementIndicator||o.isSprite||(o.isLine&&o.material?.depthTest===false));}
 function clean(){if(!state)return;for(const o of E.decorations())hide(o);E.scene.traverse(o=>{if(decoration(o))hide(o);});}
 function hide(o){if(!state.saved.decorations.has(o))state.saved.decorations.set(o,o.visible);o.visible=false;}
 const cleanStyle=document.createElement('style');cleanStyle.textContent='.plmr-animation-clean body>*:not(canvas):not(script):not(style){display:none!important}';document.head.append(cleanStyle);
 function render(force=false){
  if(!state)return;
  const s=C.sample(state.plan,state.time),previous=state.sample;
  state.sample=s;
  const cameraChanged=force||s.camera!==previous?.camera;
  const canopyChanged=s.canopy!==previous?.canopy;
  const sidesChanged=s.sides!==previous?.sides;
  if(cameraChanged)applyCamera(s.camera);
  if(canopyChanged)E.roof.presentationProgress(s.canopy);
  for(const {motion,group} of state.movements){
   if(group==='canopy'?!canopyChanged:!sidesChanged)continue;
   motion.progress=motion.target=group==='canopy'?s.canopy:s.sides;
   for(const update of motion.bindings)update(E.facadeProgress(motion));
  }
  if(cameraChanged||canopyChanged||sidesChanged){
   E.renderer.render(E.scene,E.camera);
   state.framesRendered++;
  }
 }
 function begin(selected){
  stop();E.prepareScene();muted=true;E.cancelCameraPublish();E.roof.restorePreview();
  const items=inventory(),saved={camera:captureCamera(),roof:E.roof.presentationCapture(),facades:[...E.facades.values()].map(r=>({r,progress:r.progress,target:r.target,preview:r.preview?{...r.preview}:null})),controls:E.controls.enabled,damping:E.controls.enableDamping,decorations:new Map()};
  const movements=items.filter(item=>!item.kind&&item.movable).map(({key,group})=>({motion:E.facades.get(key),group}));
  state={plan:C.timeline(selected,items),inventory:items,movements,saved,time:0,playing:false,last:performance.now(),lastPaint:0,sample:null,framesRendered:0};
  document.documentElement.classList.add('plmr-animation-clean');E.controls.enabled=false;E.controls.enableDamping=false;
  E.controls.update();clean();render();return inspect();
 }
 function stop(){if(!state)return;const saved=state.saved;state=null;document.documentElement.classList.remove("plmr-animation-clean");for(const [o,visible]of saved.decorations)o.visible=visible;E.roof.presentationRestore(saved.roof);for(const {r,progress,target,preview}of saved.facades){r.progress=progress;r.target=target;r.preview=preview;for(const update of r.bindings)update(E.facadeProgress(r));}E.controls.enableDamping=false;E.controls.update();applyCamera(saved.camera);E.camera.zoom=saved.camera.zoom;E.camera.updateProjectionMatrix();E.controls.enabled=saved.controls;E.controls.enableDamping=saved.damping;E.cancelCameraPublish();E.resetFacadeClock();E.renderer.render(E.scene,E.camera);}
 function tick(){if(!state)return false;for(const object of state.saved.decorations.keys())if(object.visible)object.visible=false;const now=performance.now(),dt=Math.max(0,Math.min(250,now-state.last));state.last=now;if(state.playing&&!document.hidden){state.time=Math.min(state.plan.duration,state.time+dt);if(state.time===state.plan.duration)state.playing=false;if(now-state.lastPaint>=1000/30||!state.playing){state.lastPaint=now;render();}}return true;}
 function play(){if(!state)return;if(state.time>=state.plan.duration)state.time=0;state.playing=true;state.last=performance.now();render();}
 function pause(){if(state)state.playing=false;}
 function seek(ms){if(!state)return;state.time=Math.max(0,Math.min(state.plan.duration,Number(ms)||0));state.last=performance.now();render();}
 function status(){
  return state?{...state.sample,active:true,playing:state.playing,time:state.time,duration:state.plan.duration}:{active:false};
 }
 function inspect(){return state?{...status(),inventory:C.clone(state.inventory),framesRendered:state.framesRendered}:status();}
 // Capture edits before native product/zone listeners. Presentation supports playback only.
 const blocked=['pointerdown','pointerup','pointermove','dblclick','contextmenu','wheel','keydown','keyup'];
 for(const type of blocked)window.addEventListener(type,e=>{if(type==='pointerdown'&&!state&&!E.readOnly)muted=false;if(state||E.readOnly){e.stopImmediatePropagation();if(e.cancelable)e.preventDefault();}},{capture:true,passive:false});
 document.addEventListener('visibilitychange',()=>{if(state)state.last=performance.now();});
 return Object.freeze({captureCamera,cleanDiagnostics(){let total=0,visible=0;E.scene.traverse(o=>{if(!decoration(o))return;total++;let v=true;for(let p=o;p;p=p.parent)if(!p.visible)v=false;if(v)visible++;});return {clean:document.documentElement.classList.contains('plmr-animation-clean'),decorations:total,visibleDecorations:visible};},cameraSyncSuspended:()=>muted,freezeCamera(){const c=captureCamera(),d=E.controls.enableDamping;E.controls.enableDamping=false;E.controls.update();applyCamera(c);E.controls.enableDamping=d;E.cancelCameraPublish();E.publishCamera();E.renderer.render(E.scene,E.camera);return c;},isReady:E.isReady,repaint(){clean();render(true);},showCamera(c){if(!state){applyCamera(C.camera(c));E.controls.update();E.renderer.render(E.scene,E.camera);E.publishCamera();}},begin,stop,tick,play,pause,seek,status,inspect,active:()=>Boolean(state)});
};
