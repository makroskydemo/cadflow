/* V53-style product selection and reversible target isolation. Canonical writes belong to the host. */
window.PLMRV11Interactions=function(E){
'use strict';const T=THREE,canvas=E.renderer.domElement,ray=new T.Raycaster(),mouse=new T.Vector2(),selected=new Map(),selectedZones=new Map(),materials=new Map();let signature='',disposed=false;
function owner(mesh){for(const o of E.roofs())for(let p=mesh;p;p=p.parent)if(p===o.group)return o.id;return null;}
function visible(mesh){for(let p=mesh;p;p=p.parent)if(!p.visible)return false;return true;}
function spec(id){return E.spec(id)||{};}
function descriptor(mesh){const id=owner(mesh),d=mesh.userData||{};if(d.isSketchWallFace)return {kind:'wall',owner:'environment',wallId:d.wallId,cellId:d.cellId,key:'wall:'+d.wallId+':'+d.cellId};if(!id)return null;if(d.isZone)return {kind:'zone',owner:id,key:'zone:'+id+':'+d.zone.id,zone:{...d.zone,owner:id}};
 if(d.zoneId&&d.isProduct){const s=spec(id),zip=String(d.productKey||d.panelKey||'').startsWith('zip:')||String(d.name||'').includes('Zip'),slot=zip?'zip':'primary';if(!(zip?s.zipPlacements:s.placements)?.[d.zoneId])return null;const z=E.zones().find(z=>z.userData.zone.id===d.zoneId&&owner(z)===id)?.userData.zone;return {kind:'facade',owner:id,zoneId:d.zoneId,slot,key:'facade:'+id+':'+slot+':'+d.zoneId,productKey:zip?'zip:'+d.zoneId:d.zoneId,zone:z?{...z,owner:id}:null};}
 for(let p=mesh;p;p=p.parent)if(p.userData?.isRoofProduct){const index=p.userData.moduleIndex,idProduct=window.PLMRBioclimaticRoof.config(spec(id),index).id;return {kind:idProduct==='none'?'roof-zone':'roof',owner:id,moduleIndex:index,productId:idProduct,key:'roof:'+id+':'+index};}
 if(d.rrMemberId)return {kind:'member',owner:id,memberId:d.rrMemberId,key:'member:'+id+':'+d.rrMemberId,profile:d.profile};
 return {kind:'system',owner:id,key:'system:'+id};
}
function selectable(d,mode){if(!d)return false;if(mode&&['zone','roof','roof-zone'].includes(d.kind)&&E.zoneExplicitlyHidden?.(d.owner,d.kind==='zone'?d.zone.id:'roof:'+d.moduleIndex))return false;if(!mode)return ['facade','roof','system','wall','member'].includes(d.kind);if(mode==='multi-profile-delete')return d.kind==='member';if(mode==='multi-delete')return d.kind==='facade'||d.kind==='roof';if(mode==='multi-product')return ['zone','roof','roof-zone'].includes(d.kind);if(mode==='multi-profile-add')return d.kind==='zone'&&!spec(d.owner).placements?.[d.zone.id]&&!spec(d.owner).zipPlacements?.[d.zone.id]&&d.zone.width>0&&d.zone.height>0;return false;}
function meshes(){const out=[];E.scene.traverse(m=>{if(m.isMesh&&visible(m)&&(!m.userData.isRoofZone||['multi-product','multi-delete'].includes(E.bulk()))&&!m.userData.isDimension)out.push(m);});return out;}
function targets(mode){const out=new Map();for(const m of meshes()){if(!m.userData.isSketchWallFace&&!E.roofs().some(o=>{for(let p=m;p;p=p.parent)if(p===o.group)return true;return false;}))continue;const d=descriptor(m);if(selectable(d,mode)&&(mode||d.kind!=='member'))out.set(d.key,d);}return [...out.values()];}
function restore(){for(const [m,s]of materials){const copy=m.material;m.material=s;(Array.isArray(copy)?copy:[copy]).forEach(x=>x.dispose());}materials.clear();}
function emit(append=false){E.post('v11-product-selection',{items:[...selected.values()],append});}
function emitZones(){E.post('v42-zone-selection',{zones:[...selectedZones.values()]});}
function clearZones(){if(!selectedZones.size)return;selectedZones.clear();for(const m of E.zones())if(m.userData.v42Selected){m.userData.v42Selected=false;E.zoneHighlight(m);}emitZones();}
function clear(notify=true){selected.clear();clearZones();signature='';restore();E.clearTransient();if(notify){emit();E.post('v11-clear-zone');}refresh();}
function decorate(mesh,mode,d){const picked=mode?E.keys().has(d?.key):selected.has(d?.key)||(d?.kind==='member'&&selected.has('system:'+d.owner));const eligible=selectable(d,mode);if(!mode&&!picked)return;if(mesh.userData.isZone)return;
 const original=mesh.material;if(!original)return;const copies=(Array.isArray(original)?original:[original]).map(m=>{const c=m.clone();if(mode&&!eligible){c.transparent=true;c.opacity=Math.min(m.opacity,.16);c.depthWrite=false;}else if(picked){if(c.emissive){c.emissive.setHex(0x153e4c);c.emissiveIntensity=1;}else c.color?.setHex(0x16a34a);}else if(mode&&eligible&&c.emissive){c.emissive.setHex(0x0c4a6e);c.emissiveIntensity=.4;}return c;});materials.set(mesh,original);mesh.material=Array.isArray(original)?copies:copies[0];
}
function refresh(){const mode=E.bulk();if(!mode&&!selected.size&&!materials.size){signature='';return;}const rs=E.roofs(),stamp=mode+'|'+E.tool()+'|'+rs.map(o=>o.group.uuid+':'+o.group.children[0]?.uuid+':'+o.group.children.at(-1)?.uuid).join(',')+'|'+E.scene.children.filter(g=>g.userData.rrWallGroup).flatMap(g=>g.children.map(r=>r.uuid)).join(',')+'|'+[...E.keys()].join(',')+'|'+[...selected.keys()].join(',');if(stamp===signature)return;signature=stamp;restore();if(E.tool()!=='select')return;
 for(const key of selected.keys()){const d=selected.get(key);if(d.kind!=='wall'&&!rs.some(o=>o.id===d.owner))selected.delete(key);}
 const objects=[];E.scene.traverse(m=>{if((m.isMesh||m.isLine||m.isSprite)&&visible(m)&&m.material&&m.type!=='GridHelper'&&m.parent?.type!=='GridHelper'&&!m.userData.isRoofZone&&!m.userData.isDimension)objects.push(m);});for(const m of objects){let d=descriptor(m);if(!m.isMesh&&m.parent?.isMesh)d=descriptor(m.parent);if(m.userData.isZone){if(mode){const eligible=selectable(d,mode);m.visible=eligible;m.userData.toolboxEligible=eligible;m.userData.toolboxSelected=E.keys().has(d.key);m.material.color.setHex(m.userData.toolboxSelected?0x16a34a:0x38bdf8);m.material.opacity=m.userData.toolboxSelected?.30:.13;}continue;}decorate(m,mode,d);}
}
function physical(m){for(let p=m;p;p=p.parent){const d=p.userData||{};if(d.annotation||d.presentationAnnotation||d.positionLabel||d.flatTextLabel||d.movementIndicator||d.presentationDecoration||d.v24Highlight)return false;}return true;}
function cast(e,physicalOnly=false){const r=canvas.getBoundingClientRect();mouse.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);E.scene.updateMatrixWorld(true);E.camera.updateMatrixWorld(true);ray.setFromCamera(mouse,E.camera);const targets=meshes();return ray.intersectObjects(physicalOnly?targets.filter(physical):targets,false);}
function up(e,physicalOnly=false){if(e.button!==0||E.tool()!=='select')return false;const mode=E.bulk(),hits=cast(e,physicalOnly);let chosen=null;
 if(!mode&&(e.ctrlKey||e.metaKey)){
   const hit=hits.find(h=>h.object.userData.isZone),surface=hits.find(h=>!h.object.userData.isZone);
   const d=hit&&descriptor(hit.object);
   if(d&&(!surface||hit.distance<=surface.distance+.5)&&E.zoneAllowed(d.zone,d.owner)){
     if(selected.size){selected.clear();signature='';restore();emit();}
     E.post('v11-clear-zone');
     if(selectedZones.has(d.key))selectedZones.delete(d.key);else selectedZones.set(d.key,{owner:d.owner,id:d.zone.id});
     hit.object.userData.v42Selected=selectedZones.has(d.key);E.zoneHighlight(hit.object);
     emitZones();return true;
   }
 }
 if(!mode)clearZones();
 // A real post remains editable even when a transparent opening picker touches its face.
 // Let the existing structural editor handle the first physical member hit.
 if(!mode&&!e.ctrlKey&&!e.metaKey){const hit=hits.find(hit=>!hit.object.userData.isZone&&!hit.object.userData.isRoofZone&&physical(hit.object));if(hit&&descriptor(hit.object)?.kind==='member')return false;}

 // Real product geometry has priority over the transparent opening picker.
 const nearestZone=hits.find(h=>h.object.userData.isZone&&visible(h.object));for(const h of hits){const m=h.object,d=descriptor(m);if(!mode&&nearestZone&&h.distance>nearestZone.distance+.5&&!(m.userData.v24Native&&d?.kind==='facade'&&d.zoneId===nearestZone.object.userData.zone.id&&d.owner===owner(nearestZone.object)))break;if(m.userData.isSketchWallFace){if(!mode&&(e.ctrlKey||e.metaKey)){chosen=d;break;}if(!mode&&!chosen)return false;continue;}if(!d)continue;if(d.kind==='zone')continue;if(mode){if(selectable(d,mode)){chosen=d;break;}}else if(d.kind==='facade'||d.kind==='roof'){chosen=d;break;}else if(d.kind==='member'){if(e.ctrlKey||e.metaKey){chosen=d;break;}if(!hits.some(h=>h.object.userData.isZone&&h.distance<hits[0].distance+.1))return false;break;}else if(d.kind==='system'&&E.roofs().some(o=>o.id===d.owner)){chosen=d;break;}}
 if(!chosen&&physicalOnly)return false;
 if(!chosen){const h=hits.find(h=>h.object.userData.isZone&&visible(h.object));if(h){const d=descriptor(h.object);if(mode){if(selectable(d,mode))chosen=d;}else if(E.zoneAllowed(d.zone,d.owner)){clear(false);emit();E.post('select-zone',{zone:d.zone});return true;}}}
 if(mode){if(chosen)E.post('toggle-toolbox-selection',{item:chosen});return true;}
 if(chosen){E.clearTransient();E.post('v11-clear-zone');if(!e.ctrlKey&&!e.metaKey)selected.clear();if(selected.has(chosen.key))selected.delete(chosen.key);else selected.set(chosen.key,chosen);signature='';refresh();emit(Boolean(e.ctrlKey||e.metaKey));return true;}
 clear();return false;
}
function key(e){if(E.tool()!=='select'||/INPUT|TEXTAREA|SELECT/.test(e.target?.tagName))return false;if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='a'){e.preventDefault();if(E.bulk())E.post('v11-set-bulk-items',{items:targets(E.bulk())});else{selected.clear();for(const d of targets(null))selected.set(d.key,d);E.clearTransient();E.post('v11-clear-zone');signature='';refresh();emit();}return true;}
 if(e.key==='Escape'){if(E.bulk())E.post('cancel-toolbox-selection');clear();return true;}if((e.key==='Delete'||e.key==='Backspace')&&selected.size){e.preventDefault();E.post('v11-delete-selection',{items:[...selected.values()]});return true;}return false;}
function inspect(){return {items:[...selected.values()],bulk:E.bulk(),ghostCount:materials.size,ghostedOpaque:[...materials].filter(([m,original])=>!Array.isArray(original)&&original.opacity===1&&m.material.opacity<=.16).length,targets:targets(E.bulk()).map(d=>{const matches=meshes().filter(m=>descriptor(m)?.key===d.key),m=matches.find(m=>m.userData.isTogglePanel&&(m.userData.kind==='glass'||m.userData.kind==='fabric'||/Glass|Kumaş/.test(m.userData.name)))||matches.find(m=>m.userData.isTogglePanel)||matches[0];if(!m)return d;const b=new T.Box3().setFromObject(m),p=b.getCenter(new T.Vector3()).project(E.camera),r=canvas.getBoundingClientRect();return {...d,screen:{x:(p.x+1)*r.width/2,y:(1-p.y)*r.height/2}};})};}
function tick(){if(disposed)return;refresh();requestAnimationFrame(tick);}requestAnimationFrame(tick);window.addEventListener('pagehide',()=>{disposed=true;restore();});return {trace:e=>({raw:cast(e).slice(0,12).map(h=>({name:h.object.userData.name||h.object.name,distance:h.distance,d:descriptor(h.object),meta:h.object.userData})),physical:cast(e,true).slice(0,12).map(h=>({name:h.object.userData.name||h.object.name,distance:h.distance,d:descriptor(h.object)}))}),up,key,refresh,clear,clearZones,clearFromHost:()=>{clear(false);emit();},inspect};
};
