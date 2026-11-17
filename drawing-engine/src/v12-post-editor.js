/* 3D post shift: existing contact/collision rules; no 2D section or canonical draft writes. */
window.PLMRV12PostEditor=function(E){
'use strict';
const T=THREE,C=window.PLMRV12Core,ray=new T.Raycaster(),mouse=new T.Vector2();
let panel=null,owner=null,mesh=null,base=null,draft=null,objects=[],directions=[],choice=null,arrows=null,unit='mm',distance=0,originalPosition=null,controlState=null;
const materials=new Map();
const palette={'x+':{label:'+X',color:'#dc2626'},'x-':{label:'−X',color:'#7c3aed'},'z+':{label:'+Y',color:'#15803d'},'z-':{label:'−Y',color:'#0369a1'}};
function sharedOwners(){const id=owner.spec.sceneEditor?.members?.[mesh.userData.rrMemberId]?.commonGroup;return id?E.roofs().filter(item=>Object.values(item.spec.sceneEditor?.members||{}).some(edit=>edit.commonGroup===id)):[owner];}
function directionLabel(text,color){
 const canvas=document.createElement('canvas');canvas.width=192;canvas.height=96;const context=canvas.getContext('2d');
 context.fillStyle='#ffffff';context.fillRect(4,4,184,88);context.strokeStyle=color;context.lineWidth=7;context.strokeRect(4,4,184,88);
 context.fillStyle=color;context.font='bold 54px Arial';context.textAlign='center';context.textBaseline='middle';context.fillText(text,96,50);
 const texture=new T.CanvasTexture(canvas),material=new T.SpriteMaterial({map:texture,depthTest:false,depthWrite:false,transparent:true}),sprite=new T.Sprite(material);
 sprite.geometry=sprite.geometry.clone();sprite.userData.postDirectionLabel=text;sprite.userData.ownedLabelTexture=true;sprite.renderOrder=901;sprite.scale.set(310,155,1);return sprite;
}
function scale(){return window.PLMRUnits.mmPerUnit[unit];}
function contacts(){return (window.PLMRV18Zones||{contactClearances:C.contacts}).contactClearances(base,objects.filter(object=>!object.support));}
function disposeArrows(){if(!arrows)return;arrows.parent?.remove(arrows);arrows.traverse(object=>{object.geometry?.dispose();if(object.material)(Array.isArray(object.material)?object.material:[object.material]).forEach(material=>{if(object.userData.ownedLabelTexture)material.map?.dispose();material.dispose();});});arrows=null;}
function close(){
 if(!panel)return;
 if(mesh&&originalPosition)mesh.position.copy(originalPosition);
 for(const [object,original]of materials){const temporary=object.material;object.material=original;(Array.isArray(temporary)?temporary:[temporary]).forEach(material=>material.dispose());}
 materials.clear();disposeArrows();panel.remove();panel=null;
 E.canvas.removeEventListener('pointerdown',pointer,true);E.canvas.removeEventListener('pointerup',pointer,true);document.removeEventListener('keydown',key,true);
 window.removeEventListener('plmr-readonly',readOnlyChanged);window.removeEventListener('pagehide',close);window.removeEventListener('plmr-view-2d',close);
 if(controlState){E.controls.enabled=controlState.enabled;E.controls.enableDamping=controlState.damping;}
 mesh=null;owner=null;choice=null;originalPosition=null;E.canvas.focus({preventScroll:true});
}
function readOnlyChanged(event){if(event.detail?.readOnly)close();}
function key(event){if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();close();}else if(event.target.closest('#rrPostShiftDialog'))event.stopPropagation();}
function pick(event){const rect=E.canvas.getBoundingClientRect();mouse.set((event.clientX-rect.left)/rect.width*2-1,1-(event.clientY-rect.top)/rect.height*2);E.camera.updateMatrixWorld();E.scene.updateMatrixWorld(true);ray.setFromCamera(mouse,E.camera);return ray.intersectObjects(arrows?.children||[],true).find(hit=>hit.object.userData.postDirection)?.object.userData.postDirection;}
function pointer(event){if(!panel)return;event.preventDefault();event.stopImmediatePropagation();if(event.type==='pointerup'){const id=pick(event);if(id)select(id);}}
function collect(selected){
 const inverse=owner.group.matrixWorld.clone().invert();objects=[];
 E.scene.traverse(object=>{
  if(!object.isMesh||!object.visible||object.userData.isZone||object.userData.isRoofZone)return;
  const data=object.userData,kind=data.isSketchWallFace?'wall':data.rrMemberAxis===1&&data.rrMemberId?'post':data.freedomStructuralKind==='gutter'||data.freedomStructuralKind==='beam'?'gutter':null;
  if(!kind||!object.geometry)return;
  object.geometry.computeBoundingBox();const box=object.geometry.boundingBox,matrix=object.matrixWorld.clone().premultiply(inverse),bounds=new T.Box3();
  for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z])bounds.expandByPoint(new T.Vector3(x,y,z).applyMatrix4(matrix));
  const polygon=[[box.min.x,box.min.z],[box.max.x,box.min.z],[box.max.x,box.max.z],[box.min.x,box.max.z]].map(([x,z])=>{const p=new T.Vector3(x,box.min.y,z).applyMatrix4(matrix);return{x:p.x,z:p.z};});
  objects.push({key:object.uuid,kind,polygon,label:data.name||(kind==='wall'?'Duvar / Parapet':'Oluk'),min:{x:bounds.min.x,z:bounds.min.z,y:bounds.min.y},max:{x:bounds.max.x,z:bounds.max.z,y:bounds.max.y},support:kind==='wall'&&bounds.max.y<=selected.min.y+.5});
 });
 const boundary=new T.Box3();
 for(const item of sharedOwners())for(const module of item.spec.freedomLayout?.modules||[]){
  const transform=item.group.matrixWorld.clone().premultiply(inverse);
  for(const x of [module.outerMinX,module.outerMaxX])for(const z of [module.rearOuterZ,module.frontOuterZ])boundary.expandByPoint(new T.Vector3(x,0,z).applyMatrix4(transform));
 }
 if(!boundary.isEmpty())objects.push({key:'boundary:'+owner.id,kind:'boundary',label:'Boşluk sınırı',min:{x:boundary.min.x,z:boundary.min.z},max:{x:boundary.max.x,z:boundary.max.z}});
}
function addButton(label,fn){const button=document.createElement('button');button.type='button';button.textContent=label;button.onclick=fn;button.style.cssText='padding:7px 11px;border:1px solid #cbd5e1;border-radius:6px;background:#edf2f6;color:#294052;font:600 12px Segoe UI,Arial;cursor:pointer';return button;}
function open(selectedOwner,selectedMesh){
 close();if(window.parent.PLMRFinalReadOnly?.())return;owner=selectedOwner;mesh=selectedMesh;E.scene.updateMatrixWorld(true);owner.group.updateWorldMatrix(true,true);
 mesh.geometry.computeBoundingBox();const inverse=owner.group.matrixWorld.clone().invert(),bounds=new T.Box3(),box=mesh.geometry.boundingBox,matrix=mesh.matrixWorld.clone().premultiply(inverse);
 for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z])bounds.expandByPoint(new T.Vector3(x,y,z).applyMatrix4(matrix));
 base={key:mesh.uuid,x:(bounds.min.x+bounds.max.x)/2,z:(bounds.min.z+bounds.max.z)/2,section:{x:bounds.max.x-bounds.min.x,z:bounds.max.z-bounds.min.z}};draft={...base};originalPosition=mesh.position.clone();distance=0;choice=null;unit=window.PLMRUnits.positionUnits.find(key=>window.PLMRUnits.mmPerUnit[key]===E.inputScale())||'mm';collect(bounds);
 directions=contacts().filter(reference=>reference.gap>.5).map(reference=>{const id=reference.axis+(reference.sign>0?'+':'-');return{...reference,id,...palette[id]};});
 controlState={enabled:E.controls.enabled,damping:E.controls.enableDamping};E.controls.enabled=false;E.controls.enableDamping=false;
 E.scene.traverse(object=>{if(!(object.isMesh||object.isLine)||!object.material||object.type==='GridHelper'||object.parent?.type==='GridHelper')return;const original=object.material,clones=(Array.isArray(original)?original:[original]).map(material=>{const next=material.clone();next.transparent=true;next.opacity=object===mesh?1:Math.min(material.opacity,.10);next.depthWrite=object===mesh;if(object===mesh&&next.emissive){next.emissive.setHex(0xff8c00);next.emissiveIntensity=.65;}return next;});materials.set(object,original);object.material=Array.isArray(original)?clones:clones[0];});
 panel=document.createElement('section');panel.id='rrPostShiftDialog';panel.role='dialog';panel.setAttribute('aria-label','Dikmeyi kaydır · 3D');panel.style.cssText='position:fixed;left:14px;top:14px;z-index:185;width:min(340px,calc(100vw - 28px));box-sizing:border-box;padding:14px;background:#fff;color:#334155;border:1px solid #cbd5e1;border-radius:9px;box-shadow:0 12px 32px #0f172a30;font:12px Segoe UI,Arial';
 panel.innerHTML='<strong>DİKMEYİ KAYDIR · 3D</strong><p>3D oktan yatay yönü seçin. Dikey Z kotu sabittir.</p><div id="rrPostShiftDirections" style="display:flex;gap:6px;flex-wrap:wrap"></div><label style="display:grid;gap:6px;margin-top:14px">Kaydırma mesafesi<input id="rrPostShiftDistance" aria-label="Kaydırma mesafesi" type="number" min="0" step="any" disabled style="height:32px;padding:0 8px;border:1px solid #cbd5e1;border-radius:6px"></label><select id="rrPostShiftUnit" aria-label="Kaydırma birimi" style="margin-top:8px;height:30px"><option value="mm">mm</option><option value="inch">in</option><option value="ft">ft</option></select><p id="rrPostShiftLimit"></p><p id="rrPostShiftError" role="alert" style="color:#b91c1c"></p><footer style="display:flex;gap:8px;justify-content:flex-end"></footer>';
 for(const reference of directions){const button=addButton(reference.label,()=>select(reference.id));button.dataset.postDirection=reference.id;button.style.setProperty('border','3px solid '+reference.color,'important');button.style.setProperty('color',reference.color,'important');button.style.setProperty('background','#fff','important');button.setAttribute('aria-pressed','false');panel.querySelector('#rrPostShiftDirections').append(button);}
 const cancel=addButton('İptal',close),apply=addButton('Tamam',()=>{if(!preview())return;const command={type:'post-shift',id:owner.id,memberId:mesh.userData.rrMemberId,x:draft.x,z:draft.z};close();E.post('scene-commit',{command});});cancel.id='rrPostShiftCancel';apply.id='rrPostShiftApply';apply.disabled=true;apply.style.background='#0284c7';apply.style.color='#fff';panel.querySelector('footer').append(cancel,apply);
 panel.querySelector('#rrPostShiftUnit').value=unit;panel.querySelector('#rrPostShiftUnit').onchange=event=>{unit=event.target.value;panel.querySelector('#rrPostShiftDistance').value=String(Number((distance/scale()).toFixed(6)));updateLimit();};
 panel.querySelector('#rrPostShiftDistance').oninput=()=>{distance=Number(panel.querySelector('#rrPostShiftDistance').value)*scale();preview();};
 document.body.append(panel);panel.querySelector('#rrPostShiftError').textContent=directions.length?'':'Bu dikme için uygun yatay kaydırma yönü bulunmuyor.';
 arrows=new T.Group();arrows.userData.presentationAnnotation=true;E.scene.add(arrows);const origin=owner.group.localToWorld(new T.Vector3(base.x,(bounds.min.y+bounds.max.y)/2,base.z));
 for(const reference of directions){
  const direction=new T.Vector3(reference.axis==='x'?reference.sign:0,0,reference.axis==='z'?reference.sign:0).transformDirection(owner.group.matrixWorld),length=Math.max(420,Math.min(900,reference.gap*.25));
  const arrow=new T.ArrowHelper(direction,origin,length,new T.Color(reference.color).getHex(),130,75);
  arrow.line.geometry=arrow.line.geometry.clone();arrow.cone.geometry=arrow.cone.geometry.clone();
  arrow.traverse(object=>{object.userData.postDirection=reference.id;if(object.material){object.material.depthTest=false;object.material.depthWrite=false;object.renderOrder=900;}});
  const label=directionLabel(reference.label,reference.color);label.position.copy(origin).addScaledVector(direction,length+100);label.position.y+=140;
  // Labels and arrows are independently ray-pickable in the actual 3D scene.
  label.userData.postDirection=reference.id;arrows.add(arrow,label);
 }
 E.canvas.addEventListener('pointerdown',pointer,true);E.canvas.addEventListener('pointerup',pointer,true);document.addEventListener('keydown',key,true);window.addEventListener('plmr-readonly',readOnlyChanged);window.addEventListener('pagehide',close);window.addEventListener('plmr-view-2d',close);cancel.focus({preventScroll:true});
}
function updateLimit(){panel.querySelector('#rrPostShiftLimit').textContent=choice?'En fazla '+Number((choice.gap/scale()).toFixed(3))+' '+unit:'';}
function select(id){choice=directions.find(reference=>reference.id===id);distance=0;draft={...base};mesh.position.copy(originalPosition);for(const button of panel.querySelectorAll('[data-post-direction]')){const item=directions.find(reference=>reference.id===button.dataset.postDirection),active=button.dataset.postDirection===id;button.style.setProperty('background',active?item.color:'#fff','important');button.style.setProperty('color',active?'#fff':item.color,'important');button.setAttribute('aria-pressed',String(active));}const input=panel.querySelector('#rrPostShiftDistance');input.disabled=false;input.value='0';updateLimit();preview();input.focus();input.select();}
function preview(){
 const error=panel.querySelector('#rrPostShiftError'),apply=panel.querySelector('#rrPostShiftApply');apply.disabled=true;
 if(!choice)return false;if(window.parent.PLMRFinalReadOnly?.()){error.textContent='Çizim kilitli. Önce çizim kilidini kaldırın.';return false;}
 try{
  if(!Number.isFinite(distance)||distance<=0||distance>choice.gap)throw Error('Kaydırma mesafesi sıfırdan büyük ve izin verilen açıklık içinde olmalı.');
  const next=C.moveToGap(base,choice,choice.gap-distance);
  if(C.collision(next,objects.filter(object=>!object.support&&object.kind!=='boundary')))throw Error('Dikme bir profil veya duvarla çakışıyor.');
  const from=owner.group.localToWorld(new T.Vector3()),to=owner.group.localToWorld(new T.Vector3(next.x-base.x,0,next.z-base.z));
  const delta=mesh.parent.worldToLocal(to).sub(mesh.parent.worldToLocal(from));mesh.position.copy(originalPosition).add(delta);draft=next;error.textContent='';apply.disabled=false;return true;
 }catch(reason){mesh.position.copy(originalPosition);draft={...base};error.textContent=reason.message;return false;}
}
return {open,close,active:()=>Boolean(panel),inspect:()=>({unit,base,draft,directions,selectedDirection:choice?.id||null,contacts:base?contacts():[],fadedObjects:materials.size,arrows:arrows?arrows.children.filter(arrow=>arrow.cone&&arrow.line).map(arrow=>{arrow.cone.geometry.computeBoundingBox();const p=arrow.cone.localToWorld(arrow.cone.geometry.boundingBox.getCenter(new T.Vector3())).project(E.camera),rect=E.canvas.getBoundingClientRect();return{id:arrow.cone.userData.postDirection,x:(p.x+1)*rect.width/2,y:(1-p.y)*rect.height/2}}):[]})};
};
