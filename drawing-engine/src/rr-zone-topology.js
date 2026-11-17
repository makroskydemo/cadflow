/* Facade openings follow physical posts, independently of roof module selection. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.PLMRZoneTopology=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const EPS=.1;
function reflow(bases,layout,edits){
 const posts=layout&&(layout.originalPosts||layout.posts)||[];
 if(!posts.length||!posts.some(p=>edits?.['post:'+p.id]?.deleted))return bases;
 const groups=new Map(),out=[],seen=new Map();
 for(const f of bases){const normal=f.axis==='x'?f.cz:f.cx,row=String(f.id).match(/ROW_\d+/)?.[0]||'',key=[f.facadeId||String(f.id).split('|')[0],f.axis,Math.round(normal*100),row].join(':');if(!groups.has(key))groups.set(key,[]);groups.get(key).push(f);}
 for(const [groupKey,run] of groups){
  const axis=run[0].axis,nAxis=axis==='x'?'z':'x',normal=run[0][axis==='x'?'cz':'cx'],coordinate=f=>Number(f[axis==='x'?'cx':'cz']);
  const modules=(layout.modules||[]).filter(m=>run.some(f=>f.moduleIndex===m.moduleIndex));
  const min=axis==='x'&&modules.length?Math.min(...modules.map(m=>m.outerMinX)):Math.min(...run.map(f=>coordinate(f)-f.width/2-(Number(f.startBoundaryWidth)||0))),max=axis==='x'&&modules.length?Math.max(...modules.map(m=>m.outerMaxX)):Math.max(...run.map(f=>coordinate(f)+f.width/2+(Number(f.endBoundaryWidth)||0)));
  const line=posts.filter(p=>Math.abs(p[nAxis]-normal)<=Number(p.section[nAxis])/2+EPS&&p[axis]>=min-EPS&&p[axis]<=max+EPS).sort((a,b)=>a[axis]-b[axis]);
  const live=line.filter(p=>!edits?.['post:'+p.id]?.deleted);
  const globalMin=Math.min(...run.map(f=>coordinate(f)-f.width/2)),globalMax=Math.max(...run.map(f=>coordinate(f)+f.width/2)),globalWidth=globalMax-globalMin;
  for(const f of run){
   const start=coordinate(f)-f.width/2,end=coordinate(f)+f.width/2;
   const oldLeft=line.find(p=>Math.abs(p[axis]+p.section[axis]/2-start)<EPS),oldRight=line.find(p=>Math.abs(p[axis]-p.section[axis]/2-end)<EPS);
   const leftDeleted=oldLeft&&edits?.['post:'+oldLeft.id]?.deleted,rightDeleted=oldRight&&edits?.['post:'+oldRight.id]?.deleted;
   const left=leftDeleted?[...live].reverse().find(p=>p[axis]<start-EPS):oldLeft,right=rightDeleted?live.find(p=>p[axis]>end+EPS):oldRight;
   const a=leftDeleted?(left?left[axis]+left.section[axis]/2:min):start,b=rightDeleted?(right?right[axis]-right.section[axis]/2:max):end;
   if(b-a<80)continue;
   const unique=groupKey+':'+a.toFixed(3)+':'+b.toFixed(3);
   if(seen.has(unique)){const item=seen.get(unique);item.mergedModuleIndices=[...new Set([...(item.mergedModuleIndices||[item.moduleIndex]),f.moduleIndex])];continue;}
   const changed=Math.abs(a-start)>EPS||Math.abs(b-end)>EPS;
   const item=changed?{...f,id:(f.facadeId||String(f.id).split('|')[0])+'|'+(String(f.id).match(/ROW_\d+/)?.[0]||'ROW_1')+'|OPEN_'+(left?.id||'EDGE_START')+'_'+(right?.id||'EDGE_END'),label:(f.facadeId==='front'?'Arka Cephe':f.facadeId==='back'?'Ön Cephe':f.label)+' · Açıklık',width:b-a,[axis==='x'?'cx':'cz']:(a+b)/2,startBoundaryId:left?.id||'START',endBoundaryId:right?.id||'END',startBoundaryWidth:left?left.section[axis]:0,endBoundaryWidth:right?right.section[axis]:0,globalBaseWidth:globalWidth,globalStartRatio:(a-globalMin)/globalWidth,globalEndRatio:(b-globalMin)/globalWidth}:f;
   seen.set(unique,item);out.push(item);
  }
 }
 return out;
}
return Object.freeze({reflow});
});
