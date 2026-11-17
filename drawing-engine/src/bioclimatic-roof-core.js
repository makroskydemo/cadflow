/* Shared roof contract: dimensions in mm, renderer Y is vertical, Z is opening. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.PLMRBioclimaticRoof=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const products=Object.freeze([
 {id:'zagro',name:'Zagro Motion',motion:'Tilt & Retract',material:'Aluminum',kind:'double',angle:75},
 {id:'artos',name:'Artos Tilt',motion:'Tilt',material:'Aluminum',kind:'tilt',angle:90},
 {id:'suphan',name:'Suphan Glide',motion:'Retract',material:'Aluminum',kind:'retract',angle:75},
 {id:'antero',name:'Antero Pergola',motion:'Retract',material:'PVC Fabric',kind:'fabric',angle:0},
 {id:'teton',name:'Teton Eco Tilt',motion:'Tilt',material:'Aluminum',kind:'tilt',angle:90},
 {id:'cervin',name:'Cervin Fix',motion:'Fixed',material:'Glass',kind:'glass',angle:0},
 {id:'jura',name:'Jura Fix',motion:'Fixed',material:'Sandwich Panel',kind:'sandwich',angle:0}
].map(Object.freeze));
const clamp=n=>Math.max(0,Math.min(1,Number(n)||0)),ease=n=>{n=clamp(n);return n*n*(3-2*n);};
const empty=Object.freeze({id:'none',name:'Boş Çatı',motion:'Fixed',material:'None',kind:'empty',angle:0});
function product(id){if(id==='none')return empty;return products.find(p=>p.id===id)||products[0];}
function config(spec,index){const c=spec?.sceneEditor?.roofProducts?.[index]||{};return {initialOpen:Boolean(c.initialOpen||!c.id&&spec?.sceneEditor?.initialRoofOpen),id:c.id?product(c.id).id:'none',open:c.open===undefined?Boolean(spec.panelMasterOpen):Boolean(c.open),revision:Number(c.revision)||0,rotation:((Math.round(Number(c.rotation)||0)%360)+360)%360};}
function aperture(module){const x=Number(module.centerX)||0,z=Number(module.centerZ)||0,w=Number(module.gutterWidth||module.outerWidth||module.width),d=Number(module.depth);return {minX:x-w/2+170,maxX:x+w/2-170,minZ:z-d/2+170,maxZ:z+d/2-170,width:Math.max(1,w-340),depth:Math.max(1,d-340),centerX:x,centerZ:z,sign:Number(module.rearToFrontSign)<0?-1:1};}
function orientModule(module,rotation){const a=aperture(module),turn=((Math.round(Number(rotation)||0)%360)+360)%360;if(!turn)return module;const swap=turn%180!==0;return {...module,centerX:0,centerZ:0,gutterWidth:(swap?a.depth:a.width)+340,depth:(swap?a.width:a.depth)+340,rearToFrontSign:a.sign};}
function supportSpec(module,id,sweepRadius,height){const p=product(id),a=aperture(module),limit=p.material==='Aluminum'?4000:p.kind==='fabric'?5000:Infinity,n=Math.max(0,Math.ceil(Number(module.gutterWidth)/limit)-1),bottom=height/2-260,panelY=height/2-75;let top,y,h;
 if(p.kind==='fabric'){y=panelY+8;h=Math.min(35,height/2-y);top=y+h;}
 else {top=panelY-Math.max(0,Number(sweepRadius)||0)-5;h=Math.min(60,top-bottom);y=top-h;}
 return {count:n,xs:Array.from({length:n},(_,i)=>a.minX+a.width*(i+1)/(n+1)),bottom:y,top,height:Math.max(0,h),width:40,gap:5};}
function motion(id,progress){const p=product(id),t=clamp(progress);if(p.kind==='double')return {angle:p.angle*ease(t/.4),retract:ease((t-.4)/.6)};if(p.kind==='tilt')return {angle:p.angle*ease(t),retract:0};if(p.kind==='retract')return {angle:p.angle*ease(t),retract:ease(t)};if(p.kind==='fabric')return {angle:0,retract:ease(t)};return {angle:0,retract:0};}
function glassGrid(a){const columns=Math.max(1,Math.ceil(a.width/750)),rows=Math.max(1,Math.ceil(a.depth/2000));return {columns,rows,paneWidth:a.width/columns,paneDepth:a.depth/rows,profileWidth:40};}
// Panel index 0 is always the rear panel, also for mirrored/back-to-back modules.
function panelMotion(id,progress,index,count){
 const p=product(id),t=clamp(progress);
 if(p.kind!=='retract')return motion(id,t);
 // All lamels share the same stroke from the start. Rear links reach their
 // limit earlier; the front continues opening while the coupled train retracts.
 const fraction=count>1?clamp(index/(count-1)):1;
 const stroke=ease(t),local=clamp(stroke/(.25+.75*fraction));
 return {angle:p.angle*ease(local),retract:ease(local)};
}
// Same closed outline as the renderer's lamelShape (mm); packed clearance is
// measured between section surfaces, not between their bounding boxes.
const lamelProfile=Object.freeze([
 [249.334,27.759],[249.334,36.240],[236.642,43.568],[208.675,0.000],
 [0.138,0.000],[0.000,6.750],[19.817,40.493],[26.655,39.760],
 [32.954,35.990],[33.026,27.639],[35.746,27.639],[36.122,39.667],
 [106.399,36.106],[238.454,46.391],[251.343,46.391],[251.343,27.759]
].map(Object.freeze)),packedPitchCache=new Map();
function panelSweepRadius(depth){const xs=lamelProfile.map(p=>p[0]),ys=lamelProfile.map(p=>p[1]),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);return Math.max(...lamelProfile.map(([x,y])=>Math.hypot((x-(minX+maxX)/2)*depth/(maxX-minX),y-(minY+maxY)/2)));}
function pointSegmentDistance(p,a,b){const x=b[0]-a[0],y=b[1]-a[1],length=x*x+y*y,t=length?clamp(((p[0]-a[0])*x+(p[1]-a[1])*y)/length):0;return Math.hypot(p[0]-a[0]-t*x,p[1]-a[1]-t*y);}
function sectionDistance(a,b){
 const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);let distance=Infinity;
 for(let i=0;i<a.length;i++)for(let j=0;j<b.length;j++){
  const p=a[i],q=a[(i+1)%a.length],r=b[j],s=b[(j+1)%b.length];
  const overlap=Math.max(Math.min(p[0],q[0]),Math.min(r[0],s[0]))<=Math.min(Math.max(p[0],q[0]),Math.max(r[0],s[0]))&&Math.max(Math.min(p[1],q[1]),Math.min(r[1],s[1]))<=Math.min(Math.max(p[1],q[1]),Math.max(r[1],s[1]));
  if(overlap&&cross(p,q,r)*cross(p,q,s)<=0&&cross(r,s,p)*cross(r,s,q)<=0)return 0;
  distance=Math.min(distance,pointSegmentDistance(p,r,s),pointSegmentDistance(q,r,s),pointSegmentDistance(r,p,q),pointSegmentDistance(s,p,q));
 }
 return distance;
}
function packedPanelPitch(depth,angle=75,clearance=5){
 const key=depth+':'+angle+':'+clearance;if(packedPitchCache.has(key))return packedPitchCache.get(key);
 const rad=angle*Math.PI/180,c=Math.cos(rad),s=Math.sin(rad),outline=lamelProfile.map(([x,y])=>{x=(x-125.6715)*depth/251.343;y-=46.391/2;return [x*c-y*s,x*s+y*c];});
 let low=0,high=Math.max(...outline.map(p=>p[0]))-Math.min(...outline.map(p=>p[0]))+clearance;
 for(let i=0;i<44;i++){const mid=(low+high)/2;if(sectionDistance(outline,outline.map(([x,y])=>[x+mid,y]))<clearance)low=mid;else high=mid;}
 if(packedPitchCache.size>512)packedPitchCache.clear();packedPitchCache.set(key,high);return high;
}
function layout(module,id,progress){const a=aperture(module),p=product(id);if(p.kind==='empty')return {aperture:a,product:p,angle:0,retract:0,count:0,pitch:0,panelDepth:0,stack:0,centers:[],angles:[],rotations:[],retractions:[],scissor:[],glass:null};const m=motion(id,progress),count=p.kind==='fabric'?Math.max(4,Math.ceil(a.depth/600)+1):Math.max(1,Math.ceil(a.depth/216)),pitch=p.kind==='fabric'?a.depth/(count-1):a.depth/count,panelDepth=Math.max(1,pitch-2),rear=a.centerZ-a.sign*a.depth/2;
 // Zagro and Suphan finish with 5 mm between the actual tilted section surfaces.
 const stack=p.kind==='double'||p.kind==='retract'?packedPanelPitch(panelDepth,p.angle,5):p.kind==='fabric'?65:Math.max(65,panelDepth*Math.cos(p.angle*Math.PI/180)+46.391*Math.sin(p.angle*Math.PI/180)+2);
 const panels=Array.from({length:count},(_,i)=>panelMotion(id,progress,i,count));
 let centers=panels.map((pm,i)=>{const closed=p.kind==='fabric'?i*pitch:(i+.5)*pitch,packed=p.kind==='fabric'?i*stack:pitch/2+i*stack;return rear+a.sign*(closed+(packed-closed)*pm.retract);});
 const angles=panels.map(pm=>pm.angle),rotations=angles.map(angle=>-a.sign*angle*Math.PI/180);let retractions=panels.map(pm=>pm.retract),scissor=null;
 if(p.kind==='retract'){
  // Each closing link pulls the entire following train. Panels never jump to
  // independently interpolated packed centers; the gap created behind drives travel.
  const spans=angles.map(angle=>Math.min(panelDepth,panelDepth*Math.cos(angle*Math.PI/180)+46.391*Math.sin(angle*Math.PI/180)));
  const t=clamp(progress),compaction=ease(t)**2,expandedStack=Math.min(panelDepth,panelDepth*Math.cos(p.angle*Math.PI/180)+46.391*Math.sin(p.angle*Math.PI/180))+2;
  const gaps=spans.slice(1).map((span,i)=>(spans[i]+span)/2+2+(stack-expandedStack)*compaction),offsets=[pitch/2];
  gaps.forEach(gap=>offsets.push(offsets[offsets.length-1]+gap));
  centers=offsets.map(offset=>rear+a.sign*offset);
  retractions=offsets.map((offset,i)=>i?clamp(((i+.5)*pitch-offset)/(i*(pitch-stack))):clamp((panelDepth-spans[0])/(pitch-stack)));
  if(t===0){centers=centers.map((z,i)=>rear+a.sign*(i+.5)*pitch);retractions.fill(0);}
  if(t===1){centers=centers.map((z,i)=>rear+a.sign*(pitch/2+i*stack));retractions.fill(1);}
  scissor={spans,gaps,stroke:ease(t),compaction};
 }

 return {aperture:a,product:p,...m,angle:Math.max(...angles),retract:retractions.reduce((sum,n)=>sum+n,0)/count,count,pitch,panelDepth,stack,centers,angles,rotations,retractions,scissor,glass:p.kind==='glass'?glassGrid(a):null};}
// Retiming only: retain the complete approved Suphan configuration path.
// Rail travel and the fastest lamel's tilt both contribute to travelled distance,
// so neither the final packing segment nor a rotating panel can jump in speed.
const suphanTimingCache=new Map();
function suphanTiming(module){
 const depth=aperture(module).depth;if(suphanTimingCache.has(depth))return suphanTimingCache.get(depth);
 const normalized={centerX:0,centerZ:0,gutterWidth:4000,depth:depth+340,rearToFrontSign:1},steps=1000,arc=[0];let previous=layout(normalized,'suphan',0);
 for(let i=1;i<=steps;i++){
  const current=layout(normalized,'suphan',i/steps),rail=Math.abs(current.centers.at(-1)-previous.centers.at(-1)),tilt=1.2*current.panelDepth*Math.max(...current.angles.map((angle,j)=>angle-previous.angles[j]))*Math.PI/180;
  arc.push(arc[i-1]+Math.max(rail,tilt));previous=current;
 }
 const result={steps,arc,total:arc[steps]};if(suphanTimingCache.size>512)suphanTimingCache.clear();suphanTimingCache.set(depth,result);return result;
}
function animationDuration(id){return product(id).motion==='Fixed'?0:(globalThis.PLMRV16Core?.MOTION_MS||5200);}
function animationClock(module,id,progress){
 const u=clamp(progress);if(id!=='suphan'||u===0||u===1)return u;
 const {steps,arc,total}=suphanTiming(module),position=u*steps,i=Math.floor(position),distance=arc[i]+(arc[i+1]-arc[i])*(position-i),fraction=clamp(distance/total);
 return .5-Math.sin(Math.asin(1-2*fraction)/3);
}
function animationProgress(module,id,clock){
 const t=clamp(clock);if(id!=='suphan'||t===0||t===1)return t;
 const {steps,arc,total}=suphanTiming(module),distance=ease(t)*total;let low=0,high=steps;
 while(high-low>1){const mid=(low+high)>>1;if(arc[mid]<distance)low=mid;else high=mid;}
 return (low+(distance-arc[low])/(arc[high]-arc[low]))/steps;
}
// Outer bounds remain 170 x 260; every straight wall is offset inward by 8 mm.
function gutterSection(sectionWidth=170,innerRun=114){
 const t=8,rise=58,left=12,right=48,valley=sectionWidth-innerRun;
 const leftOffset=t*Math.hypot(1,left/rise),rightOffset=t*Math.hypot(1,(valley-right)/rise);
 return {thickness:t,width:sectionWidth,height:260,
  outer:[[0,0],[left,rise],[right,rise],[valley-(valley-right)*t/rise,t],[sectionWidth-t,t],[sectionWidth-t,260],[sectionWidth,260],[sectionWidth,0]],
  hole:[[left*t/rise+leftOffset,t],[left*(rise-t)/rise+leftOffset,rise-t],[valley-(valley-right)*(rise-t)/rise-rightOffset,rise-t],[valley-(valley-right)*t/rise-rightOffset,t]]};
}
return Object.freeze({products,product,config,aperture,orientModule,supportSpec,panelSweepRadius,motion,panelMotion,layout,glassGrid,lamelProfile,packedPanelPitch,animationDuration,animationClock,animationProgress,profileYaw:sign=>Number(sign)<0?0:Math.PI,gutterSection,ease,sections:Object.freeze({post:170,gutterWidth:170,gutterHeight:260,gutterThickness:8})});
});
