(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.PLMRRollingRoofParapetCore=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clone=x=>JSON.parse(JSON.stringify(x)),round=n=>Math.round(n*1000)/1000;
// Merge the perimeter union into continuous straight blocks, absorbing corner cells.
// Try both strip directions; keep the partition with fewer independently editable pieces.
function blocks(layout,width,depth,thickness=200){
 const modules=layout&&layout.valid&&layout.modules.length?layout.modules:[{outerMinX:-width/2,outerMaxX:width/2,rearOuterZ:-depth/2,frontOuterZ:depth/2}];
 const strips=[];for(const m of modules){const x0=Math.min(m.outerMinX,m.outerMaxX),x1=Math.max(m.outerMinX,m.outerMaxX),z0=Math.min(m.rearOuterZ,m.frontOuterZ),z1=Math.max(m.rearOuterZ,m.frontOuterZ),t=Math.min(thickness,(x1-x0)/3,(z1-z0)/3);strips.push([x0,z0,x1,z0+t],[x0,z1-t,x1,z1],[x0,z0+t,x0+t,z1-t],[x1-t,z0+t,x1,z1-t]);}
 const unique=a=>[...new Set(a.map(round))].sort((a,b)=>a-b),xs=unique(strips.flatMap(r=>[r[0],r[2]])),zs=unique(strips.flatMap(r=>[r[1],r[3]]));
 const occupied=xs.slice(0,-1).map((v,i)=>zs.slice(0,-1).map((w,j)=>strips.some(r=>(xs[i]+xs[i+1])/2>r[0]&&(xs[i]+xs[i+1])/2<r[2]&&(zs[j]+zs[j+1])/2>r[1]&&(zs[j]+zs[j+1])/2<r[3])));
 function partition(vertical){const A=vertical?zs:xs,B=vertical?xs:zs,grid=A.slice(0,-1).map((_,i)=>B.slice(0,-1).map((_,j)=>vertical?occupied[j][i]:occupied[i][j])),runs=[],latest=new Map();
  for(let j=0;j<B.length-1;j++)for(let i=0;i<A.length-1;i++){if(!grid[i][j])continue;let end=i+1;while(end<A.length-1&&grid[end][j])end++;const key=i+':'+end,prior=latest.get(key);if(prior&&prior.rowEnd===j){prior.rowEnd=j+1;}else{const run={i,end,rowStart:j,rowEnd:j+1};runs.push(run);latest.set(key,run);}i=end-1;}
  return runs.map(r=>{const b=vertical?{x0:B[r.rowStart],z0:A[r.i],x1:B[r.rowEnd],z1:A[r.end]}:{x0:A[r.i],z0:B[r.rowStart],x1:A[r.end],z1:B[r.rowEnd]};b.key=[b.x0,b.z0,b.x1,b.z1].join('_');return b;});
 }

 const a=partition(false),b=partition(true);return (a.length<=b.length?a:b).sort((a,b)=>a.z0-b.z0||a.x0-b.x0);
}
// Local post footprint against the surviving cells of its own parapet blocks.
// The highest supporting cell determines the bottom. The gutter underside stays fixed.
function convexOverlap(a,b){for(const polygon of [a,b])for(let i=0;i<polygon.length;i++){const p=polygon[i],q=polygon[(i+1)%polygon.length],axis=[q[1]-p[1],p[0]-q[0]],project=poly=>poly.map(v=>v[0]*axis[0]+v[1]*axis[1]),A=project(a),B=project(b);if(Math.min(...A)>=Math.max(...B)-.001||Math.min(...B)>=Math.max(...A)-.001)return false;}return true;}
function postSpan(post,spec,walls=[],owner='roof-main',edit={}){
 const top=Math.max(0,Number(spec.height)-260),sec=post.section||{x:170,z:170};let support=0;
 for(const w of walls){const f=w.layoutSupportFrames?.[owner];if(w.layoutParapet&&f){const footprint=[[post.x-sec.x/2,post.z-sec.z/2],[post.x+sec.x/2,post.z-sec.z/2],[post.x+sec.x/2,post.z+sec.z/2],[post.x-sec.x/2,post.z+sec.z/2]];for(const cell of w.solids||[]){const polygon=[[cell.min[0],cell.min[2]],[cell.max[0],cell.min[2]],[cell.max[0],cell.max[2]],[cell.min[0],cell.max[2]]].map(([x,z])=>[f.origin[0]+f.u[0]*x+f.t[0]*z,f.origin[2]+f.u[2]*x+f.t[2]*z]);if(convexOverlap(footprint,polygon))support=Math.max(support,f.origin[1]+cell.max[1]);}continue;}if(w.parapetOwner!==owner||!w.parapetBase)continue;const b=w.parapetBase.origin;for(const s of w.solids||[]){if(b[0]+s.min[0]<post.x+sec.x/2-.001&&b[0]+s.max[0]>post.x-sec.x/2+.001&&b[2]+s.min[2]<post.z+sec.z/2-.001&&b[2]+s.max[2]>post.z-sec.z/2+.001)support=Math.max(support,s.max[1]);}}
 const bottom=Math.min(top,Math.max(support,Number.isFinite(edit.length)?top-edit.length:0));return {top,bottom,support,height:Math.max(0,top-bottom),y:-Number(spec.height)/2+(top+bottom)/2};
}
function generate(spec,owner,pose,ground,config,C,K,prior=[],hidden=[]){
 if(!(config.height>0))return [];
 return blocks(spec.freedomLayout,spec.width,spec.depth,config.thickness||200).flatMap((b,index)=>{const id='parapet-'+owner+'-'+b.key;if(hidden.includes(id))return [];const width=b.x1-b.x0,depth=b.z1-b.z0,base={origin:[b.x0,-spec.height/2,b.z0],u:[1,0,0],v:[0,1,0],t:[0,0,1]},old=prior.find(w=>w.id===id),w=old?K.normalizeWall(old):K.createWall({width,height:config.height},id,depth);
  // Preserve individual splits, deleted cells and push/pull edits unless the global height is explicitly reset.
  if(old&&Math.abs(w.zone.height-config.height)>.001){const k=config.height/w.zone.height;for(const s of w.solids){s.min[1]*=k;s.max[1]*=k;}for(const l of w.segments){for(const p of [l.a,l.b]){if(l.face.uAxis===1)p.u*=k;if(l.face.vAxis===1)p.v*=k;}if(l.face.axis===1)l.face.at*=k;if(l.face.uAxis===1){l.face.u0*=k;l.face.u1*=k;}if(l.face.vAxis===1){l.face.v0*=k;l.face.v1*=k;}}w.zone.height=config.height;}
  w.frame=C.placeFrame(base,pose,spec.height,ground);w.parapetOwner=owner;w.parapetKey=b.key;w.parapetBase=clone(base);w.label=(owner==='roof-main'?'Ana ürün':'Kopya '+owner.replace('roof-copy-',''))+' · Parapet '+(index+1);w.color=0xb8afa5;return [w];});
}
return Object.freeze({blocks,generate,postSpan});
});
