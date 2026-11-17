(function(root){
  'use strict';
  // The model uses Y up and +Z toward the front. From above, front is
  // below the plan. Opposing exterior views have opposite screen-right axes.
  const axes=Object.freeze({
    top:{x:1,y:-1},front:{x:1,y:1},rear:{x:-1,y:1},
    left:{x:1,y:1},right:{x:-1,y:1}
  });
  function project(view){
    const axis=axes[view.id];
    if(!axis||(axis.x===1&&axis.y===1))return view;
    const {x,y}=axis;
    const point=p=>({...p,x:x*p.x,y:y*p.y});
    const bounds=b=>({
      ...b,minX:x*(x===1?b.minX:b.maxX),maxX:x*(x===1?b.maxX:b.minX),
      minY:y*(y===1?b.minY:b.maxY),maxY:y*(y===1?b.maxY:b.minY)
    });
    const entities=view.entities.map(e=>{
      if(e.type==='rect')return {...e,x:x*(x===1?e.x:e.x+e.width),y:y*(y===1?e.y:e.y+e.height)};
      if(e.type==='text')return {...e,x:x*e.x,y:y*e.y};
      if(e.type==='line')return {...e,x1:x*e.x1,y1:y*e.y1,x2:x*e.x2,y2:y*e.y2};
      if(e.type!=='dimension')return e;
      if(e.axis==='aligned')return {...e,p1:point(e.p1),p2:point(e.p2),dimLine:point(e.dimLine)};
      const sign=e.axis==='x'?x:y;
      return {...e,start:sign*(sign===1?e.start:e.end),end:sign*(sign===1?e.end:e.start),
        offset:e.offset*(e.axis==='x'?y:x),
        ...(e.referenceBounds?{referenceBounds:bounds(e.referenceBounds)}:{})};
    });
    return {...view,bounds:bounds(view.bounds),entities};
  }
  const exteriorRight=normal=>[normal[1],-normal[0]];
  const api=Object.freeze({project,exteriorRight});
  root.PLMROrthographicAxes=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
