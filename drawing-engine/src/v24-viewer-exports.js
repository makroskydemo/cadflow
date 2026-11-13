/* Read-only exports and runtime motion seeking. Never writes the canonical project. */
(function(root){'use strict';root.PLMRV24ViewerExports=function(E){const T=root.THREE,L=root.PLMRV24Libraries;
function cameraState(){return {position:E.camera.position.toArray(),target:E.controls.target.toArray(),up:E.camera.up.toArray(),fov:E.camera.fov};}
function shot(view=cameraState(),width=3840,height=2160){const r=E.renderer,size=r.getSize(new T.Vector2()),ratio=r.getPixelRatio(),background=E.scene.background,cam=new T.PerspectiveCamera(view.fov,width/height,E.camera.near,E.camera.far);cam.position.fromArray(view.position);cam.up.fromArray(view.up);cam.lookAt(new T.Vector3().fromArray(view.target));try{if(!E.scene.background)E.scene.background=E.scene.userData.plmrDefaultBackground||new T.Color('#eaf1f6');r.setPixelRatio(1);r.setSize(width,height,false);E.annotations?.(cam);r.render(E.scene,cam);return r.domElement.toDataURL('image/jpeg',.985);}finally{E.scene.background=background;r.setPixelRatio(ratio);r.setSize(size.x,size.y,false);E.annotations?.(E.camera);r.render(E.scene,E.camera);}}
function exportOwner(mesh, roofs){
  const info=mesh.userData;
  let roof=null,position=null;
  for(let node=mesh;node;node=node.parent){
    const data=node.userData;
    if(!node.visible||node.isSprite||node.type==='GridHelper'||data.presentationDecoration||
       data.rrEnvironment||data.isZone||data.isZonePicker||data.isRoofZone||data.zone||
       data.dimension||data.isDimension||data.dimensionLabel||data.annotation||
       data.presentationAnnotation||data.positionLabel||data.flatTextLabel||
       data.movementIndicator||data.v24Highlight||data.layoutSpacer)return null;
    position ||= data.plmrDaeGroup;
    roof ||= roofs.get(node);
  }
  const materials=Array.isArray(mesh.material)?mesh.material:[mesh.material];
  if(materials.every(m=>!m||m.visible===false||m.opacity===0||m.isShadowMaterial))return null;
  if(info.isSketchWallFace)return {
    key:'wall:'+info.wallId,name:(info.isParapet?'Parapet':'Duvar')+' '+info.wallId
  };
  if(position)return {key:(roof?.id||'standalone')+':'+position.key,name:position.name};
  if(info.isProduct&&!roof&&info.positionNo)return {key:'product:'+info.positionNo,name:info.positionNo};
  if(!roof)return null;
  const module=Number.isInteger(info.moduleIndex)?info.moduleIndex:null;
  const count=Number(roof.spec?.systemCount)||1;
  const suffix=module===null?(count>1?' · Ortak taşıyıcılar':''):' · Modül '+(module+1);
  const label=roof.spec?.productGroup==='bio-rise'?'Bio Rise':roof.spec?.productGroup==='b-cube-galaxy'?'B-Cube Galaxy':'Bioclimatic';
  const number=String(roof.spec?.pozNo||1).replace(/^P/i,'').padStart(2,'0');
  return {key:roof.id+':roof:'+(module??(count>1?'shared':0)),name:label+' P'+number+suffix};
}
function dae(){
  E.scene.updateMatrixWorld(true);
  const exported=new T.Group();
  const roofs=new Map((E.roots?.()||[]).map(roof=>[roof.group,roof]));
  E.scene.traverse(mesh=>{
    if(!mesh.isMesh||!mesh.geometry)return;
    const owner=exportOwner(mesh,roofs);
    if(!owner)return;
    let lift=0;
    for(let node=mesh;node;node=node.parent)if(node.userData.presentationLift)lift+=node.position.y;
    function append(matrix){
      const part=new T.Mesh(mesh.geometry,mesh.material);
      part.name=mesh.name||mesh.userData.name||'Parça';
      part.matrix.copy(matrix);
      part.matrix.elements[13]-=lift;
      part.matrixAutoUpdate=false;
      part.userData={...mesh.userData,isProduct:true,daeGroupKey:owner.key,daeGroupName:owner.name};
      exported.add(part);
    }
    if(mesh.isInstancedMesh){
      const local=new T.Matrix4();
      for(let i=0;i<mesh.count;i++){
        mesh.getMatrixAt(i,local);
        append(new T.Matrix4().multiplyMatrices(mesh.matrixWorld,local));
      }
    }else append(mesh.matrixWorld);
  });
  return L.PLMRNativeDae.exportItems([{sceneRoot:exported}]);
}
function seek(items,t){for(const item of items){const r=E.facadeMotions?.get((item.owner||'roof-main')+'|'+item.productKey);if(!r||r.type==='fixed')continue;r.preview=null;r.v24Paused=true;r.progress=Math.max(0,Math.min(1,t));for(const f of r.bindings)f((r.ease||((x)=>x))(r.progress));}}
function target(items,open){for(const item of items){const r=E.facadeMotions?.get((item.owner||'roof-main')+'|'+item.productKey);if(!r||r.type==='fixed')continue;r.preview=null;r.v24Paused=false;r.target=open?1:0;}}
function progress(items){const item=items[0],r=item&&E.facadeMotions?.get((item.owner||'roof-main')+'|'+item.productKey);return r&&r.type!=='fixed'?r.progress:null;}
function maxCaptureSize(){const gl=E.renderer.getContext();return gl.getParameter(gl.MAX_RENDERBUFFER_SIZE);}
return Object.freeze({cameraState,shot,maxCaptureSize,dae,seek,target,progress});};})(window);
