/* Physical aligned openings + shared zone visibility. No geometry/state ownership here. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.PLMRV11Zones=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';const EPS=.5;
function vector(p,angle){const a=angle*Math.PI/180,c=Math.cos(a),s=Math.sin(a);return [c*p[0]-s*p[2],p[1],s*p[0]+c*p[2]];}
function toLocal(p,pose,height,ground){return vector([p[0]-(pose.x||0),p[1]-(pose.y||0)-ground-height/2,p[2]-(pose.z||0)],-(pose.angle||0));}
function group(zone){if(zone.connection||zone.group==='connections')return zone.axis==='x'?(zone.cz>=0?'front':'back'):(zone.cx>=0?'right':'left');return zone.group||zone.filterGroup||(zone.isRoofZone?'roof':zone.facadeId||String(zone.id).split('|')[0]);}
function key(zone,owner){return (owner||zone.owner||'roof-main')+'|'+zone.id;}
function allowed(state,zone,owner){const s=state||{},k=key(zone,owner);return Object.hasOwn(s.ids||{},k)?Boolean(s.ids[k]):s.groups?.[group(zone)]!==false;}
function defaults(){return {groups:{back:true,right:true,left:true,front:true,roof:true,internal:true,connections:true},ids:{}};}
function enrich(bases,layout,edits,context={}){
 if(!layout?.posts?.length)return bases;
 const out=bases.map(b=>({...b,group:b.group||(/Arka Cephe/.test(b.label)?'back':/Ön Cephe/.test(b.label)?'front':b.facadeId||String(b.id).split('|')[0])})),posts=(layout.originalPosts||layout.posts).filter(p=>!edits?.['post:'+p.id]?.deleted),H=Number(context.height)||3000,pose=context.pose||{},ground=Number(context.groundY)||0;
 const stablePosts=posts.map(p=>({...p,x:p.baseX??p.x,z:p.baseZ??p.z}));
 const base=(axis,n,a,b,id,label,g,left,right,bottom=-H/2,top=H/2-260)=>({id,facadeId:id,profileSourceId:id,label,group:g,axis,cx:axis==='x'?(a+b)/2:n,cz:axis==='x'?n:(a+b)/2,width:b-a,height:top-bottom,bottomY:bottom,topY:top,beamBottomY:top,inward:1,outerFaceV:-85,startBoundaryId:left.id,endBoundaryId:right.id,startBoundaryWidth:left.width||0,endBoundaryWidth:right.width||0,globalBaseWidth:b-a,globalStartRatio:0,globalEndRatio:1,moduleIndex:left.moduleIndex||0,boundaryOwners:[left.owner||context.owner||'roof-main',right.owner||context.owner||'roof-main'],boundaryModuleIndices:[left.moduleIndex||0,right.moduleIndex||0],boundaryModuleGroups:[left.moduleIndices||[left.moduleIndex||0],right.moduleIndices||[right.moduleIndex||0]]});
 function covered(axis,n,a,b){return out.some(f=>f.axis===axis&&Math.abs(f[axis==='x'?'cz':'cx']-n)<EPS&&a>=f[axis==='x'?'cx':'cz']-f.width/2-EPS&&b<=f[axis==='x'?'cx':'cz']+f.width/2+EPS);}
 for(const axis of ['x','z']){
  const normal=axis==='x'?'z':'x',lines=new Map();for(const p of stablePosts){const n=Math.round(p[normal]*100)/100;if(!lines.has(n))lines.set(n,[]);lines.get(n).push(p);}
  for(const [n,line]of lines){line.sort((a,b)=>a[axis]-b[axis]);for(let i=1;i<line.length;i++){
   const left=line[i-1],right=line[i],a=left[axis]+left.section[axis]/2,b=right[axis]-right.section[axis]/2;if(b-a<80||covered(axis,n,a,b))continue;
   // Interior physical planes only; do not invent an exterior row across unequal depths.
   const min=Math.min(...stablePosts.map(p=>p[normal])),max=Math.max(...stablePosts.map(p=>p[normal]));if(n<=min+EPS||n>=max-EPS)continue;
   const id='internal_'+axis+'_'+left.id+'_'+right.id;out.push({...base(axis,n,a,b,id,'İç Bölme · '+(out.filter(f=>f.group==='internal').length+1),'internal',{...left,width:left.section[axis]},{...right,width:right.section[axis]}),postBounded:true});
  }}
 }
 // Neighbour systems and wall faces are evaluated in the main assembly's coordinates.
 const foreign=[];
 for(const copy of context.copies||[]){const l=copy.spec?.freedomLayout;if(!l?.posts)continue;const cp=copy.pose||{},ch=Number(copy.spec.height)||H;
  const relativeAngle=((cp.angle||0)-(pose.angle||0))%90;if(Math.abs(relativeAngle)>EPS)continue;
  for(const p of l.originalPosts||l.posts){if(copy.spec.sceneEditor?.members?.['post:'+p.id]?.deleted)continue;
   const q=vector([p.x,p.bottom||0,p.z],cp.angle||0),local=toLocal([q[0]+(cp.x||0),q[1]+(cp.y||0)+ground,q[2]+(cp.z||0)],pose,H,ground),swap=Math.abs(((cp.angle||0)-(pose.angle||0))%180)>EPS;
   foreign.push({...p,id:copy.id+'_'+p.id,owner:copy.id,x:local[0],z:local[2],bottom:local[1],top:local[1]+(p.height||ch-260),section:swap?{x:p.section.z,z:p.section.x}:p.section});
  }
 }
 const walls=[];
 for(const w of context.walls||[]){if(!w.frame||w.parapetOwner)continue;const f=w.frame,u=vector(f.u,-(pose.angle||0)),t=vector(f.t,-(pose.angle||0));if(Math.max(Math.abs(u[0]),Math.abs(u[2]))<.999||Math.max(Math.abs(t[0]),Math.abs(t[2]))<.999)continue;
  for(const s of w.solids||[]){const points=[];for(const x of [s.min[0],s.max[0]])for(const y of [s.min[1],s.max[1]])for(const z of [s.min[2],s.max[2]]){const p=f.origin.map((v,i)=>v+f.u[i]*x+f.v[i]*y+f.t[i]*z);points.push(toLocal(p,pose,H,ground));}
   walls.push({id:'wall_'+w.id+'_'+s.id,min:points[0].map((_,i)=>Math.min(...points.map(p=>p[i]))),max:points[0].map((_,i)=>Math.max(...points.map(p=>p[i])))});
  }
 }
 const seen=new Set();
 for(const axis of ['x','z']){const normal=axis==='x'?'z':'x',ai=axis==='x'?0:2,ni=axis==='x'?2:0;
  const all=[...posts.map(p=>({...p,owner:context.owner||'roof-main',bottom:-H/2,top:H/2-260})),...foreign];
  for(const p of all){
   const contacts=[];
   for(const q of all)if(q.owner!==p.owner&&Math.abs(q[normal]-p[normal])<EPS)contacts.push({id:q.id,min:q[axis]-q.section[axis]/2,max:q[axis]+q.section[axis]/2,width:q.section[axis],bottom:q.bottom,top:q.top,owner:q.owner,moduleIndex:q.moduleIndex,moduleIndices:q.moduleIndices});
   for(const w of walls)if(p[normal]>=w.min[ni]-EPS&&p[normal]<=w.max[ni]+EPS)contacts.push({id:w.id,min:w.min[ai],max:w.max[ai],width:0,bottom:w.min[1],top:w.max[1]});
   for(const copy of context.copies||[]){if(p.owner===copy.id)continue;const cp=copy.pose||{};if(Math.abs(((cp.angle||0)-(pose.angle||0))%90)>EPS)continue;const points=[];for(const x of [-copy.spec.width/2,copy.spec.width/2])for(const z of [-copy.spec.depth/2,copy.spec.depth/2]){const q=vector([x,0,z],cp.angle||0);points.push(toLocal([q[0]+(cp.x||0),ground+(cp.y||0),q[2]+(cp.z||0)],pose,H,ground));}const lo=Math.min(...points.map(q=>q[ni])),hi=Math.max(...points.map(q=>q[ni]));if(p[normal]>=lo-EPS&&p[normal]<=hi+EPS)contacts.push({id:'system_'+copy.id,min:Math.min(...points.map(q=>q[ai])),max:Math.max(...points.map(q=>q[ai])),bottom:points[0][1],top:points[0][1]+copy.spec.height-260,width:0,owner:copy.id});}
   for(const q of contacts){const left=q.max<p[axis]?q:{id:p.id,min:p[axis]-p.section[axis]/2,max:p[axis]+p.section[axis]/2,width:p.section[axis],owner:p.owner,moduleIndex:p.moduleIndex,moduleIndices:p.moduleIndices},right=left===q?{id:p.id,min:p[axis]-p.section[axis]/2,max:p[axis]+p.section[axis]/2,width:p.section[axis],owner:p.owner,moduleIndex:p.moduleIndex,moduleIndices:p.moduleIndices}:q,a=left.max,b=right.min,n=p[normal];
    if(b-a<80||b-a>20000||covered(axis,n,a,b))continue;
    if(all.some(other=>other!==p&&Math.abs(other[normal]-n)<EPS&&other[axis]>a+EPS&&other[axis]<b-EPS))continue;
    if(walls.some(w=>n>=w.min[ni]-EPS&&n<=w.max[ni]+EPS&&w.min[ai]<b-EPS&&w.max[ai]>a+EPS))continue;
    const bottom=Math.max(p.bottom,q.bottom),top=Math.min(p.top,q.top);if(top-bottom<250)continue;
    const stamp=[axis,n.toFixed(2),a.toFixed(2),b.toFixed(2)].join(':');if(seen.has(stamp))continue;seen.add(stamp);
    const id='connection_'+axis+'_'+left.id+'_'+right.id,outBase=base(axis,n,a,b,id,'Bağlantı Alanı · '+(seen.size),'connections',left,right,bottom,top);outBase.connection=true;out.push(outBase);
   }
  }
 }
 const core=globalThis.PLMRV12Core;return core?out.map(f=>f.group==='internal'?core.adaptBases([f],layout)[0]:f):out;
}
return Object.freeze({enrich,group,key,allowed,defaults});
});
