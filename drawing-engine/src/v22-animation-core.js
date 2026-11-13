/* Presentation descriptions contain canonical geometry and camera poses, never frames. */
(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./v29-share-contract'):root.PLMRShareContract);if(typeof module==='object'&&module.exports)module.exports=api;root.PLMRAnimationCore=api;})(typeof globalThis!=='undefined'?globalThis:this,function(shareContract){
'use strict';
const SCHEMA='plmr-animation-presentation-v1',VERSION=22,MAX_SCENES=5,MAX_BYTES=2*1024*1024;
const clone=x=>JSON.parse(JSON.stringify(x));
const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x);};
function camera(raw){
 if(!raw||!['position','target'].every(k=>Array.isArray(raw[k])&&raw[k].length===3&&raw[k].every(n=>typeof n==='number'&&Number.isFinite(n)&&Math.abs(n)<=1e7)))throw Error('Kamera açısı geçersiz.');
 const zoom=raw.zoom===undefined?1:raw.zoom;if(typeof zoom!=='number'||!Number.isFinite(zoom)||zoom<.01||zoom>100||Math.hypot(...raw.position.map((v,i)=>v-raw.target[i]))<1)throw Error('Kamera uzaklığı veya yakınlaşması geçersiz.');
 if(raw.aspect!==undefined&&(typeof raw.aspect!=='number'||!Number.isFinite(raw.aspect)||raw.aspect<.05||raw.aspect>20))throw Error('Kamera ekran oranı geçersiz.');
 if(raw.fov!==undefined&&(!Number.isFinite(raw.fov)||raw.fov<20||raw.fov>120))throw Error('Kamera görüş açısı geçersiz.');
 return {position:[...raw.position],target:[...raw.target],zoom,...(raw.fov!==undefined?{fov:raw.fov}:{}),...(raw.aspect!==undefined?{aspect:raw.aspect}:{})};
}
function scenes(raw){if(!Array.isArray(raw)||raw.length<1||raw.length>MAX_SCENES)throw Error('Bir ile beş arasında sahne seçin.');return raw.map((s,i)=>({name:String(s.name||'Sahne '+(i+1)).slice(0,60),camera:camera(s.camera)}));}
function snapshotForShare(raw){return shareContract.snapshot(raw);}
function create(snapshot,selected,title='3D Sistem Sunumu'){return {schema:SCHEMA,rendererVersion:VERSION,title:String(title||'3D Sistem Sunumu').slice(0,100),scenes:scenes(selected),snapshot:snapshotForShare(snapshot)};}
function validate(raw,projectCore){
 if(!raw||raw.schema!==SCHEMA||raw.rendererVersion!==VERSION)throw Error('Sunum sürümü desteklenmiyor.');
 if(new TextEncoder().encode(JSON.stringify(raw)).byteLength>MAX_BYTES)throw Error('Sunum verisi en fazla 2 MB olabilir.');
 projectCore.validateProject({schema:'plmr-bioclimatic-project-v1',version:1,snapshot:raw.snapshot});
 // Normalize on both endpoints: journal, notes and dimensions never leak into a shared presentation.
 return create(raw.snapshot,raw.scenes,raw.title);
}
function classifyFacade(items){
 const opening=p=>JSON.stringify([p.owner,p.zoneId]);
 const primary=new Set(items.filter(p=>p.type!=='zip').map(opening));
 return items.map(p=>({...p,group:p.type==='zip'&&primary.has(opening(p))?'canopy':'sides',movable:p.type!=='fixed'}));
}
function timeline(selected,inventory,duration=5200){
 const ss=scenes(selected),canopy=inventory.some(p=>p.movable&&p.group==='canopy'),sides=inventory.some(p=>p.movable&&p.group==='sides'),stages=[];let cursor=0;
 const push=(scene,phase,ms,from,to)=>{stages.push({scene,phase,start:cursor,end:cursor+ms,from,to});cursor+=ms;};
 for(let i=0;i<ss.length;i++){
  push(i,'closed',800,0,0);if(canopy)push(i,'canopy-open',duration,0,1);if(sides)push(i,'sides-open',duration,0,1);
  push(i,'open-hold',1200,1,1);if(sides)push(i,'sides-close',duration,1,0);if(canopy)push(i,'canopy-close',duration,1,0);push(i,'closed-hold',800,0,0);
  if(i<ss.length-1)push(i,'transition',3000,0,1);
 }
 return {scenes:ss,stages,duration:cursor,canopy,sides};
}
function sample(plan,ms){
 const time=Math.max(0,Math.min(plan.duration,Number(ms)||0)),s=plan.stages.find(s=>time<s.end)||plan.stages.at(-1),t=clamp((time-s.start)/(s.end-s.start));let canopy=0,sides=0;
 if(s.phase==='canopy-open')canopy=t;
 if(['sides-open','open-hold','sides-close'].includes(s.phase))canopy=plan.canopy?1:0;
 if(s.phase==='sides-open')sides=t;
 if(s.phase==='open-hold')sides=plan.sides?1:0;
 if(s.phase==='sides-close')sides=1-t;
 if(s.phase==='canopy-close')canopy=1-t;
 return {time,scene:s.scene,phase:s.phase,canopy,sides,camera:s.phase==='transition'?interpolateCamera(plan.scenes[s.scene].camera,plan.scenes[s.scene+1].camera,t):plan.scenes[s.scene].camera,finished:time>=plan.duration};
}
function interpolateCamera(a,b,t){
 t=ease(t);if(t===0)return camera(a);if(t===1)return camera(b);const lerp=(x,y)=>x+(y-x)*t,target=a.target.map((x,i)=>lerp(x,b.target[i])),spherical=c=>{const v=c.position.map((x,i)=>x-c.target[i]),r=Math.hypot(...v);return{r,theta:Math.atan2(v[0],v[2]),phi:Math.acos(Math.max(-1,Math.min(1,v[1]/r)))};},A=spherical(a),B=spherical(b);
 const delta=Math.atan2(Math.sin(B.theta-A.theta),Math.cos(B.theta-A.theta)),theta=A.theta+delta*t,phi=lerp(A.phi,B.phi),r=lerp(A.r,B.r);
 return {target,position:[target[0]+r*Math.sin(phi)*Math.sin(theta),target[1]+r*Math.cos(phi),target[2]+r*Math.sin(phi)*Math.cos(theta)],zoom:lerp(a.zoom,b.zoom),...((a.fov!==undefined||b.fov!==undefined)?{fov:lerp(a.fov||38,b.fov||38)}:{}),...(a.aspect&&b.aspect?{aspect:lerp(a.aspect,b.aspect)}:{})};
}
return Object.freeze({SCHEMA,VERSION,MAX_SCENES,MAX_BYTES,clone,ease,camera,scenes,create,validate,snapshotForShare,classifyFacade,timeline,sample,interpolateCamera});
});
