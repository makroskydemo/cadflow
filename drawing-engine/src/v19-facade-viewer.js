/* Canonical V53 face-text primitives, copied unchanged from Giyotin.
   Labels are physical upper-profile meshes, shared by every facade family. */
window.PLMRV19Facade=(function(){const T=THREE;
  function makeTextTexture(text,width,height,options){
    if(typeof document==='undefined')return null;
    const canvas=document.createElement('canvas');
    const scale=2;
    canvas.width=Math.max(64,Math.round(width*scale));
    canvas.height=Math.max(32,Math.round(height*scale));
    const ctx=canvas.getContext('2d');
    if(!ctx)return null;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle=options.background||'rgba(15,23,42,0.88)';
    const radius=12*scale;
    const w=canvas.width,h=canvas.height;
    ctx.beginPath();
    ctx.moveTo(radius,0);ctx.lineTo(w-radius,0);ctx.quadraticCurveTo(w,0,w,radius);ctx.lineTo(w,h-radius);ctx.quadraticCurveTo(w,h,w-radius,h);ctx.lineTo(radius,h);ctx.quadraticCurveTo(0,h,0,h-radius);ctx.lineTo(0,radius);ctx.quadraticCurveTo(0,0,radius,0);ctx.closePath();ctx.fill();
    ctx.strokeStyle=options.border||'rgba(248,250,252,0.94)';
    ctx.lineWidth=2*scale;ctx.stroke();
    ctx.fillStyle=options.color||'#f8fafc';
    ctx.font=`700 ${Math.round((options.fontSize||30)*scale)}px Segoe UI, Arial, sans-serif`;
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(String(text||''),canvas.width/2,canvas.height/2+1*scale);
    const texture=new THREE.CanvasTexture(canvas);texture.needsUpdate=true;texture.minFilter=THREE.LinearFilter;texture.magFilter=THREE.LinearFilter;texture.generateMipmaps=false;return texture;
  }
  function faceLabelSpec(text,kind){
    const k=String(kind||'generic');
    if(k==='view')return{width:541,height:130,fontSize:49};
    if(k==='motor')return{width:354,height:112,fontSize:46};
    if(k==='position'){const chars=Math.max(6,String(text||'').length);return{width:Math.max(468,Math.min(988,(110+chars*38)*1.3)),height:125,fontSize:52};}
    if(k==='dimension-width'||k==='dimension-height'){
      const chars=Math.max(7,String(text||'').length);
      return{width:Math.max(868,Math.min(2100,(150+chars*68)*1.4)),height:266,fontSize:143};
    }
    return{width:354,height:112,fontSize:46};
  }
  function createFaceTextMaterial(text,width,height,kind){
    const spec=faceLabelSpec(text,kind),isDimension=String(kind||'').indexOf('dimension-')===0,texture=makeTextTexture(text,width,height,isDimension?{fontSize:spec.fontSize,color:'#ef4444',border:'rgba(239,68,68,0.98)',background:'rgba(15,23,42,0.90)'}:{fontSize:spec.fontSize});
    if(texture)return new THREE.MeshBasicMaterial({map:texture,transparent:true,alphaTest:0.02,depthTest:true,depthWrite:false,side:THREE.FrontSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
    return new THREE.MeshBasicMaterial({color:0x0f172a,transparent:true,opacity:0.88,side:THREE.FrontSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
  }
  function addFaceTextLabel(group,text,u,y,v,kind,face,meta){
    const spec=faceLabelSpec(text,kind),width=spec.width,height=spec.height;
    const planeGeo=new THREE.PlaneGeometry(width,height);
    const wrapper=new THREE.Group();
    const baseRotation=String(face||'outer').toLowerCase()==='inner'?Math.PI:0;
    wrapper.position.set(u,y,v);
    wrapper.renderOrder=24;
    wrapper.userData={name:`Face Label ${text}`,flatTextLabel:{text:String(text),kind:String(kind||'generic'),face:String(face||'outer').toLowerCase()},...meta};
    const front=new THREE.Mesh(planeGeo,createFaceTextMaterial(text,width,height,kind));
    front.rotation.y=baseRotation;
    front.renderOrder=24;
    const back=new THREE.Mesh(planeGeo,createFaceTextMaterial(text,width,height,kind));
    back.rotation.y=baseRotation+Math.PI;
    back.renderOrder=24;
    wrapper.add(front);wrapper.add(back);
    group.add(wrapper);return wrapper;
  }

function boxIn(m,parent){m.updateWorldMatrix(true,false);m.geometry.computeBoundingBox();return m.geometry.boundingBox.clone().applyMatrix4(parent.matrixWorld.clone().invert().multiply(m.matrixWorld));}
function upperBoxes(parent,objects,zone){parent.updateWorldMatrix(true,true);const meshes=[];for(const o of objects)o.traverse(m=>{if(m.isMesh&&m.userData.isProduct&&!m.userData.movementIndicator&&!Number.isInteger(m.userData.panelIndex)&&!m.userData.isTogglePanel&& !/glass|arrow|fabric|kumaş/i.test(m.userData.name||''))meshes.push(m);});const names=['Guillotine Motor Box','Zip Top Box','Zip Fallback Top Box','Sliding Top Frame','Folding Top Frame','Door Outer Top Frame','Fixed Outer Top Frame','Frame Top'];for(const name of names){const found=meshes.filter(m=>String(m.userData.name||'').startsWith(name));if(found.length)return found.map(m=>boxIn(m,parent));}return [];}
function addLabels(parent,objects,zone,p,slot,visibility){if(!p.positionCode||!objects.length)return;const boxes=upperBoxes(parent,objects,zone),top=new T.Box3();boxes.forEach(b=>top.union(b));if(top.isEmpty())return;const axis=zone.axis==='x'?'x':'z',normal=axis==='x'?'z':'x',center=top.getCenter(new T.Vector3()),spec=faceLabelSpec(p.positionCode,'position'),scale=Math.min(1,(top.max.y-top.min.y)*.84/spec.height,(top.max[axis]-top.min[axis])*.32/spec.width),margin=Math.min((top.max[axis]-top.min[axis])*.28,spec.width*scale/2+70),owner=parent.userData.facadeOwner||'roof-main';let u=top.min[axis]+margin;if(p.type==='zip'||p.type==='guillotine'){let motor;for(const o of objects)o.traverse(m=>{if(/Zip Motor Label|Face Label MOTOR/.test(m.userData.name||''))motor=parent.worldToLocal(m.getWorldPosition(new T.Vector3()))[axis];});if(motor!==undefined&&motor<center[axis])u=top.max[axis]-margin;}for(const face of ['outer','inner']){const outward=face==='outer'?-zone.inward:zone.inward,v=(outward>0?top.max[normal]:top.min[normal])+outward,wrapper=addFaceTextLabel(parent,p.positionCode,0,0,0,'position',face,{positionLabel:true,positionCode:p.positionCode,owner,zoneId:zone.id,slot,v19UpperProfile:true});wrapper.position.set(axis==='x'?u:v,center.y,axis==='x'?v:u);wrapper.rotation.y=axis==='x'?(outward>0?0:Math.PI):(outward>0?Math.PI/2:-Math.PI/2);if(face==='inner')wrapper.rotation.y+=Math.PI;wrapper.scale.setScalar(scale);wrapper.visible=visibility.information!==false&&visibility.infoIds?.[p.positionCode]!==false;for(const m of wrapper.children)m.userData={positionLabel:true,positionCode:p.positionCode,owner,zoneId:zone.id,slot};objects.push(wrapper);}return top;}
function visible(o){for(let n=o;n;n=n.parent)if(!n.visible)return false;return true;}
function labels(scene){const out=[];scene.traverse(m=>{if(m.isMesh&&m.userData.positionLabel)out.push(m);});return out;}
function hit(ray,scene){const ms=labels(scene).filter(visible),h=ray.intersectObjects(ms,false)[0];if(!h)return null;const solids=[];scene.traverse(m=>{if(m.isMesh&&!m.userData.positionLabel&&visible(m)&&m.material&&!Array.isArray(m.material)&&m.material.opacity>=.9&&!m.userData.isZone&&!m.userData.isRoofZone)solids.push(m);});const front=ray.intersectObjects(solids,false)[0];return !front||front.distance>=h.distance-.05?h.object.userData:null;}
function visibility(scene,d){scene.traverse(m=>{if(m.userData.v19UpperProfile)m.visible=d.information!==false&&d.infoIds?.[m.userData.positionCode]!==false;});}
function inspect(scene,camera,width,height){const out=[];scene.updateMatrixWorld(true);scene.traverse(m=>{if(!m.userData.v19UpperProfile)return;const b=new T.Box3().setFromObject(m),center=m.getWorldPosition(new T.Vector3()),p=center.clone().project(camera);out.push({...m.userData,worldCenter:center.toArray(),min:b.min.toArray(),max:b.max.toArray(),visible:visible(m),screen:{x:(p.x+1)*width/2,y:(1-p.y)*height/2},scale:m.scale.x});});return out;}
return Object.freeze({upperBoxes,addLabels,hit,visibility,inspect});})();
