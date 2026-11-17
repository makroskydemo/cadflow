/* Physical profile placement and opening scope. All distances are millimetres. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.PLMRV20Profiles=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const EPS=1e-6;
function scope(z){const axis=z.axis,along=axis==='x'?z.cx:z.cz,normal=axis==='x'?z.cz:z.cx;return{axis,min:along-z.width/2,max:along+z.width/2,normal,surface:normal+(Number(z.outerFaceV)||0),inward:Number(z.defaultInward||z.inward)||1,bottom:z.bottomY,top:z.topY,zoneId:z.id};}
function create(z,id,orientation,width,depth){const s=scope(z),vertical=orientation!=='horizontal',space=vertical?z.width:z.height;if(width>space+EPS)throw Error('Profil kesiti seçilen açıklığa sığmıyor; net mesafe negatif olamaz.');const normal=s.surface+s.inward*depth/2,along=(s.min+s.max)/2;return{id,orientation:vertical?'vertical':'horizontal',width,depth,positionRatio:.5,positionYRatio:.5,originX:s.axis==='x'?along:normal,originZ:s.axis==='x'?normal:along,originY:(s.bottom+s.top)/2,span:s.max-s.min,scope:s,leftBoundaryId:z.leftBoundaryId||z.startBoundaryId||'START',rightBoundaryId:z.rightBoundaryId||z.endBoundaryId||'END',scopeStartRatio:0,scopeEndRatio:1};}
function position(p,edit={}){return{x:(Number.isFinite(edit.positionX)?edit.positionX:p.originX)+(Number(edit.sharedX)||0),z:(Number.isFinite(edit.positionZ)?edit.positionZ:p.originZ)+(Number(edit.sharedZ)||0),y:Number.isFinite(edit.positionY)?edit.positionY:p.originY};}
function box(p,edit={},fallback){const s=p.scope||fallback;if(!s)return null;const q=position(p,edit),a=s.axis,vertical=p.orientation!=='horizontal',u=a==='x'?q.x:q.z,n=a==='x'?q.z:q.x,y=Number.isFinite(q.y)?q.y:(s.bottom+s.top)/2,span=Number.isFinite(p.span)?p.span:s.max-s.min;return{a,min:vertical?u-p.width/2:u-span/2,max:vertical?u+p.width/2:u+span/2,nmin:n-p.depth/2,nmax:n+p.depth/2,bottom:vertical?s.bottom:y-p.width/2,top:vertical?s.top:y+p.width/2};}
// A saved opening is a movement constraint only while its physical supports exist.
// Deleting an end support exposes the connected gutter run up to its outer face.
function movementScope(profile,layout,members){
  const saved=profile.scope;
  if(!saved||profile.orientation==='horizontal'||!layout?.valid)return saved;
  const axis=saved.axis;
  const intervals=(layout.modules||[]).filter(module=>{
    const faces=axis==='x'?[module.rearOuterZ,module.frontOuterZ]:[module.outerMinX,module.outerMaxX];
    return faces.some(face=>Math.abs(face-saved.surface)<EPS);
  }).map(module=>axis==='x'?[module.outerMinX,module.outerMaxX]:[Math.min(module.rearOuterZ,module.frontOuterZ),Math.max(module.rearOuterZ,module.frontOuterZ)]).sort((a,b)=>a[0]-b[0]);
  const runs=[];
  for(const interval of intervals){
    const last=runs[runs.length-1];
    if(last&&interval[0]<=last[1]+EPS)last[1]=Math.max(last[1],interval[1]);
    else runs.push([...interval]);
  }
  const positionNow=position(profile),along=positionNow[axis];
  const run=runs.find(([min,max])=>along>=min-EPS&&along<=max+EPS);
  const scope={...saved};
  for(const [side,boundary]of [['min',profile.leftBoundaryId],['max',profile.rightBoundaryId]]){
    const post=(layout.originalPosts||layout.posts||[]).find(post=>post.id===boundary);
    if(!post)continue;
    const edit=members['post:'+post.id]||{};
    if(edit.deleted){if(run)scope[side]=run[side==='min'?0:1];}
    else scope[side]=post[axis]+(side==='min'?1:-1)*post.section[axis]/2;
  }
  return scope;
}
function validate(p,profiles,members={},fallback){const s=p.scope||fallback,b=box(p,members[p.id]||{},s);if(!s||!b)return;if(b.min<s.min-EPS||b.max>s.max+EPS||b.bottom<s.bottom-EPS||b.top>s.top+EPS)throw Error('İki profil arasındaki net mesafe 0 mm’den düşük olamaz.');for(const other of profiles){if(other.id===p.id)continue;const e=members[other.id]||{};if(e.deleted||e.sharedWith)continue;const o=box(other,e,other.scope||s);if(!o||o.a!==b.a)continue;if(Math.min(b.max,o.max)-Math.max(b.min,o.min)>EPS&&Math.min(b.nmax,o.nmax)-Math.max(b.nmin,o.nmin)>EPS&&Math.min(b.top,o.top)-Math.max(b.bottom,o.bottom)>EPS)throw Error('Profil mevcut bir profille çakışıyor; net mesafe negatif olamaz.');}}
function cut(base,p,edit={}){if(!p.scope)return p;const s=p.scope;if(base.axis!==s.axis||Math.abs(base[base.axis==='x'?'cz':'cx']+(Number(base.outerFaceV)||0)-s.surface)>.5)return null;const q=position(p,edit);if(Math.abs((base.axis==='x'?q.z:q.x)-s.inward*p.depth/2-s.surface)>.5)return null;const along=base.axis==='x'?q.x:q.z,lo=base[base.axis==='x'?'cx':'cz']-base.width/2,span=base.globalBaseWidth||base.width,start=base.globalStartRatio||0;if(p.orientation!=='horizontal')return{...p,positionRatio:start+(along-lo)/span};const y=Number.isFinite(q.y)?q.y:(s.bottom+s.top)/2;if(y-p.width/2<base.bottomY-EPS||y+p.width/2>base.topY+EPS)return null;return{...p,positionYRatio:(y-base.bottomY)/base.height,scopeStartRatio:start+(s.min-lo)/span,scopeEndRatio:start+(s.max-lo)/span};}
function equalOpeningPlan(zones){
  const invalid=()=>Error('Aynı cephede yan yana olan en az iki zone seçin.');
  if(zones.length<2)throw invalid();
  const first=zones[0],axis=first.axis,along=axis==='x'?'cx':'cz',normal=axis==='x'?'cz':'cx';
  const surface=z=>z[normal]+(Number(z.outerFaceV)||0),tolerance=.05;
  if(!['x','z'].includes(axis)||zones.some(z=>z.owner!==first.owner||z.axis!==axis||
    Math.abs(surface(z)-surface(first))>tolerance||Math.abs(z.topY-first.topY)>tolerance||
    Math.abs(z.bottomY-first.bottomY)>tolerance||!Number.isFinite(z[along])||!(z.width>0)))throw invalid();
  const ordered=zones.slice().sort((a,b)=>a[along]-b[along]);
  const dividers=[];
  for(let i=1;i<ordered.length;i++){
    const left=ordered[i-1],right=ordered[i],id=left.rightBoundaryId;
    const leftFace=left[along]+left.width/2,rightFace=right[along]-right.width/2;
    if(!id||id!==right.leftBoundaryId||rightFace-leftFace<=tolerance)throw invalid();
    dividers.push({id,zone:left,thickness:rightFace-leftFace,center:(leftFace+rightFace)/2});
  }
  const width=ordered.reduce((sum,z)=>sum+z.width,0)/ordered.length;
  let edge=ordered[0][along]-ordered[0].width/2;
  for(const divider of dividers){
    divider.delta=edge+width+divider.thickness/2-divider.center;
    edge+=width+divider.thickness;
  }
  return {axis,width,zones:ordered,dividers};
}
return Object.freeze({EPS,scope,create,position,box,movementScope,validate,cut,equalOpeningPlan});});
