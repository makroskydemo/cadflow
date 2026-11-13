/* V16 math and presentation helpers; physical state stays in app.js modelState. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.PLMRV16Core=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const MOTION_MS=5200;
function footprint(o){const p=o.pose||{},w=Number(o.spec.width)/2,d=Number(o.spec.depth)/2,a=(Number(p.angle)||0)*Math.PI/180,c=Math.cos(a),s=Math.sin(a);return [-1,1].flatMap(x=>[-1,1].map(z=>({x:(p.x||0)+c*x*w-s*z*d,z:(p.z||0)+s*x*w+c*z*d})));}
function bounds(owners){const ps=owners.flatMap(footprint);return ps.length?{minX:Math.min(...ps.map(p=>p.x)),maxX:Math.max(...ps.map(p=>p.x)),minZ:Math.min(...ps.map(p=>p.z)),maxZ:Math.max(...ps.map(p=>p.z))}:null;}
function freePose(owners,spec,preferred={},points=[]){const b=bounds(owners),a=(Number(preferred.angle)||0)*Math.PI/180,halfX=(Math.abs(Math.cos(a))*spec.width+Math.abs(Math.sin(a))*spec.depth)/2,maxX=Math.max(b?.maxX??0,...points.map(p=>p.x));return{x:maxX+halfX+500,y:Number(preferred.y)||0,z:Number(preferred.z)||0,angle:Number(preferred.angle)||0};}
function overlaps(a,b){const A=footprint(a),B=footprint(b);for(const p of [A,B]){for(const pair of [[0,1],[0,2]]){const v={x:p[pair[1]].x-p[pair[0]].x,z:p[pair[1]].z-p[pair[0]].z},axis={x:-v.z,z:v.x},aa=A.map(q=>q.x*axis.x+q.z*axis.z),bb=B.map(q=>q.x*axis.x+q.z*axis.z);if(Math.max(...aa)<=Math.min(...bb)+.1||Math.max(...bb)<=Math.min(...aa)+.1)return false;}}return true;}
/* Contact groups reuse the placement footprint test; tolerance is 0.5 mm per edge. */
function connectedComponents(owners){
 const expanded=o=>({...o,spec:{...o.spec,width:Number(o.spec.width)+1,depth:Number(o.spec.depth)+1}});
 const vertical=o=>{const bottom=(Number(o.pose?.y)||0)+(Number(o.spec.sceneEditor?.groundY)||0);return [bottom,bottom+Number(o.spec.height)];};
 const result=[],remaining=new Set(owners);
 for(const seed of owners){if(!remaining.delete(seed))continue;const group=[seed];for(let i=0;i<group.length;i++)for(const other of [...remaining]){const a=vertical(group[i]),b=vertical(other);if(Math.min(a[1],b[1])-Math.max(a[0],b[0])>.5&&overlaps(expanded(group[i]),expanded(other))){remaining.delete(other);group.push(other);}}result.push({owners:group.map(o=>o.id).sort(),bounds:bounds(group)});}
 return result;
}
function references(zone,spec,owner,owners){const positions=[];const add=(id,index)=>{const s=id===owner?spec:owners.find(o=>o.id===id)?.spec;if(s)positions.push(s.sceneEditor?.bioCodes?.[index]||((Number(s.pozNo)||1)+'.'+((Number(index)||0)+1)));};if((zone.connection||zone.group==='internal')&&zone.boundaryOwners){zone.boundaryOwners.forEach((id,i)=>(zone.boundaryModuleGroups?.[i]||[zone.boundaryModuleIndices?.[i]||0]).forEach(index=>add(id,index)));}else for(const i of zone.mergedModuleIndices||[zone.moduleIndex||0])add(owner,i);if(!positions.length)add(owner,zone.moduleIndex||0);return [...new Set(positions)].sort((a,b)=>{const A=a.split('.').map(Number),B=b.split('.').map(Number);return a.startsWith('BIO-')?a.localeCompare(b,undefined,{numeric:true}):A[0]-B[0]||A[1]-B[1];});}
function assignZone(zone,spec,owner,owners){const registry=spec.zoneRegistry||(spec.zoneRegistry={});let r=registry[zone.id];if(!r){const max=Math.max(0,...Object.values(registry).map(r=>Number(r.number)||Number(String(r.name||'').match(/^Z(\d+)/)?.[1])||0));const n=Math.max(max+1,Number(spec.nextZoneNumber)||1);r=registry[zone.id]={uid:owner+'-zone-'+String(n).padStart(6,'0'),number:n};spec.nextZoneNumber=n+1;}if(!r.number){r.number=Number(String(r.name||'').match(/^Z(\d+)/)?.[1])||Math.max(1,...Object.values(registry).map(q=>(Number(q.number)||0)+1));spec.nextZoneNumber=Math.max(Number(spec.nextZoneNumber)||1,r.number+1);}const refs=references(zone,spec,owner,owners);r.code=(refs[0]?.startsWith('BIO-')?'':'Poz ')+refs.join('*')+' - '+r.number;const other=owners.flatMap(o=>Object.entries(o.spec.zoneRegistry||{}).filter(([id])=>o.id!==owner||id!==zone.id).map(([,q])=>q));if(other.some(q=>q.code===r.code)){r.number=Math.max(Number(spec.nextZoneNumber)||1,...other.map(q=>(Number(q.number)||0)+1));spec.nextZoneNumber=r.number+1;r.code=(refs[0]?.startsWith('BIO-')?'':'Poz ')+refs.join('*')+' - '+r.number;}r.name=r.code;r.positionRefs=refs;return {...zone,owner,structuralId:zone.id,zoneUid:r.uid,zoneName:r.code,label:r.code,positionRefs:refs};}
const columns={
 frame:['POZ','ÖLÇÜ / ADET','SİSTEM','RENK / YÜZEY','MOTOR / OPSİYON','İŞLEM'],
 roof:['POZ / ZONE','ÖLÇÜ / ADET','TAVAN','HAREKET','RENK / YÜZEY','İŞLEM'],
 sliding:['POZ / ZONE','ÖLÇÜ / ADET','SİSTEM','CAM','AÇILIM','RENK / YÜZEY','AÇIKLAMA / SIRA','İŞLEM'],
 guillotine:['POZ / ZONE','ÖLÇÜ / ADET','SİSTEM','CAM','PANEL','RENK / YÜZEY','BAKIŞ / MOTOR','AÇIKLAMA / SIRA','İŞLEM'],
 folding:['POZ / ZONE','ÖLÇÜ / ADET','SİSTEM','CAM','KANAT / AÇILIM','RENK / YÜZEY','AÇIKLAMA / SIRA','İŞLEM'],
 balcony:['POZ / ZONE','ÖLÇÜ / ADET','SİSTEM','CAM','KANAT / AÇILIM','RENK / YÜZEY','AÇIKLAMA / SIRA','İŞLEM'],
 fixed:['POZ / ZONE','ÖLÇÜ / ADET','BÖLÜMLER','CAM','RENK / YÜZEY','İŞLEM'],
 door:['POZ / ZONE','ÖLÇÜ / ADET','KAPI','CAM','AÇILIM','RENK / YÜZEY','İŞLEM'],
 zip:['POZ / ZONE','ÖLÇÜ / ADET','SİSTEM','KUMAŞ','YERLEŞİM / MOTOR','RENK / YÜZEY','İŞLEM'],
 wall:['ALAN','ÖLÇÜ / ADET','TİP','İŞLEM']
};
return Object.freeze({MOTION_MS,footprint,bounds,freePose,overlaps,connectedComponents,references,assignZone,columns});
});
