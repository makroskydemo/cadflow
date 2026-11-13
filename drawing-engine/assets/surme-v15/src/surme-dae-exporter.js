(function(root,factory){
  if(typeof module==='object'&&module.exports) module.exports=factory(require('../vendor/three-r128/three.min.js'),require('./surme-3d-engine.js'));
  else root.PLMRSurmeDaeExporter=factory(root.THREE,root.PLMRSurme3DEngine);
})(typeof window!=='undefined'?window:globalThis,function(THREE,Engine){
  'use strict';
  if(!THREE||!Engine)throw new Error('DAE_EXPORTER_DEPENDENCY_MISSING');

  const IDENTITY_MATRIX='1 0 0 0 0 1 0 0 0 0 1 0 0 0 0 1';

  function xml(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));}
  function safeId(v,fallback){
    let s=String(v||fallback||'node').replace(/[^A-Za-z0-9_.-]+/g,'_');
    if(!/^[A-Za-z_]/.test(s))s='n_'+s;
    return s;
  }
  function asciiName(v){
    return String(v||'')
      .replace(/[Çç]/g,'C').replace(/[Ğğ]/g,'G').replace(/[İIıi]/g,'I')
      .replace(/[Öö]/g,'O').replace(/[Şş]/g,'S').replace(/[Üü]/g,'U')
      .replace(/[^A-Za-z0-9_.-]+/g,'_').replace(/_+/g,'_').replace(/^_|_$/g,'');
  }
  function colorOf(mesh){
    const m=Array.isArray(mesh.material)?mesh.material[0]:mesh.material;
    const c=m&&m.color?m.color:new THREE.Color(0x94a3b8);
    return [c.r,c.g,c.b,1];
  }
  function meshData(mesh,index){
    const geo=mesh.geometry;
    if(!geo||!geo.attributes||!geo.attributes.position)return null;
    mesh.updateMatrixWorld(true);
    const attr=geo.attributes.position,positions=[],v=new THREE.Vector3();
    for(let i=0;i<attr.count;i++){
      v.fromBufferAttribute(attr,i).applyMatrix4(mesh.matrixWorld);
      positions.push(
        Number(v.x.toFixed(6)),
        Number(v.y.toFixed(6)),
        Number(v.z.toFixed(6))
      );
    }
    let indices=[];
    if(geo.index)indices=Array.from(geo.index.array);
    else for(let i=0;i<attr.count;i++)indices.push(i);
    indices=indices.slice(0,Math.floor(indices.length/3)*3);
    if(!indices.length)return null;

    const positionNo=String(mesh.userData&&mesh.userData.positionNo||'P00');
    const meshName=String(mesh.userData&&mesh.userData.name||mesh.name||('Part '+String(index+1)));
    const panelIndex=Number.isInteger(mesh.userData&&mesh.userData.panelIndex)?Number(mesh.userData.panelIndex):null;
    const partName=partGroupName(positionNo,meshName,panelIndex,index);
    const id=safeId('geo_'+partName+'_'+String(index+1),'geo_'+String(index+1));
    return {
      id:id,
      definitionId:safeId('def_'+partName+'_'+String(index+1),'def_'+String(index+1)),
      nodeId:safeId('node_'+partName+'_'+String(index+1),'node_'+String(index+1)),
      name:partName,
      sourceName:meshName,
      positionNo:positionNo,
      panelIndex:panelIndex,
      effectId:id+'_fx',
      materialId:id+'_mat',
      positions:positions,
      indices:indices,
      color:colorOf(mesh)
    };
  }
  function panelPrefix(positionNo,panelIndex){
    return positionNo+'_Panel_'+String((panelIndex==null?0:panelIndex)+1).padStart(2,'0');
  }
  function partGroupName(positionNo,meshName,panelIndex,index){
    const n=String(meshName||'').toLowerCase();
    if(n.includes('left frame'))return positionNo+'_Sol_Kasa';
    if(n.includes('right frame'))return positionNo+'_Sag_Kasa';
    if(n.includes('top frame'))return positionNo+'_Ust_Kasa';
    if(n.includes('bottom frame'))return positionNo+'_Alt_Kasa';
    if(n.includes('threshold')||n.includes('flush bottom profile'))return positionNo+'_Alt_Ray';
    if(n.includes('mullion'))return positionNo+'_Bini_Profili_'+String((panelIndex==null?index:panelIndex)+1).padStart(2,'0');
    const pp=panelPrefix(positionNo,panelIndex);
    if(n.includes('glass'))return pp+'_Cam';
    if(n.includes('left stile'))return pp+'_Sol_Profil';
    if(n.includes('right stile'))return pp+'_Sag_Profil';
    if(n.includes('top rail'))return pp+'_Ust_Profil';
    if(n.includes('bottom rail'))return pp+'_Alt_Profil';
    return positionNo+'_Parca_'+String(index+1).padStart(2,'0')+'_'+asciiName(meshName||'Part');
  }
  function effectXml(m){
    return '<effect id="'+m.effectId+'"><profile_COMMON><technique sid="COMMON"><lambert><diffuse><color>'+m.color.join(' ')+'</color></diffuse></lambert></technique></profile_COMMON></effect>';
  }
  function materialXml(m){
    return '<material id="'+m.materialId+'" name="'+xml(m.name)+'"><instance_effect url="#'+m.effectId+'"/></material>';
  }
  function geometryXml(m){
    return '<geometry id="'+m.id+'" name="'+xml(m.name)+'"><mesh>'+
      '<source id="'+m.id+'_positions"><float_array id="'+m.id+'_positions_array" count="'+String(m.positions.length)+'">'+m.positions.join(' ')+'</float_array>'+
      '<technique_common><accessor source="#'+m.id+'_positions_array" count="'+String(Math.floor(m.positions.length/3))+'" stride="3"><param name="X" type="float"/><param name="Y" type="float"/><param name="Z" type="float"/></accessor></technique_common></source>'+
      '<vertices id="'+m.id+'_vertices"><input semantic="POSITION" source="#'+m.id+'_positions"/></vertices>'+
      '<triangles material="MAT" count="'+String(Math.floor(m.indices.length/3))+'"><input semantic="VERTEX" source="#'+m.id+'_vertices" offset="0"/><p>'+m.indices.join(' ')+'</p></triangles>'+
      '</mesh></geometry>';
  }
  function definitionNodeXml(m){
    return '<node id="'+m.definitionId+'" name="'+xml(m.name)+'" type="NODE">'+
      '<matrix sid="transform">'+IDENTITY_MATRIX+'</matrix>'+
      '<instance_geometry url="#'+m.id+'"><bind_material><technique_common><instance_material symbol="MAT" target="#'+m.materialId+'"/></technique_common></bind_material></instance_geometry>'+
      '</node>';
  }
  function partInstanceNodeXml(m){
    return '<node id="'+m.nodeId+'" name="'+xml(m.name)+'" type="NODE">'+
      '<matrix sid="transform">'+IDENTITY_MATRIX+'</matrix>'+
      '<instance_node url="#'+m.definitionId+'"/>'+
      '</node>';
  }
  function positionNodeXml(positionNo,parts,index){
    return '<node id="'+safeId('position_'+String(index+1)+'_'+positionNo)+'" name="'+xml(positionNo)+'" type="NODE">'+
      '<matrix sid="transform">'+IDENTITY_MATRIX+'</matrix>'+
      parts.map(partInstanceNodeXml).join('')+
      '</node>';
  }

  function exportItems(items,options){
    const list=(items||[]).map(x=>Object.assign({},x,{showDimensions:false}));
    const sceneRoot=Engine.buildMultiple(list,options||{});
    sceneRoot.updateMatrixWorld(true);

    const meshes=[];
    sceneRoot.traverse(o=>{
      if(!o.isMesh||!o.userData||!o.userData.isProduct)return;
      if(o.userData.movementIndicator)return;
      const d=meshData(o,meshes.length);
      if(d)meshes.push(d);
    });
    if(!meshes.length)throw new Error('DAE_EXPORT_NO_PRODUCT_MESH');

    const effects=meshes.map(effectXml).join('');
    const materials=meshes.map(materialXml).join('');
    const geometries=meshes.map(geometryXml).join('');
    const libraryNodes=meshes.map(definitionNodeXml).join('');

    const positions=new Map();
    for(const mesh of meshes){
      if(!positions.has(mesh.positionNo))positions.set(mesh.positionNo,[]);
      positions.get(mesh.positionNo).push(mesh);
    }
    const sceneNodes=[...positions.entries()].map(([positionNo,parts],idx)=>positionNodeXml(positionNo,parts,idx)).join('');

    const now=new Date().toISOString();
    return '<?xml version="1.0" encoding="utf-8"?>\n'+
      '<COLLADA xmlns="http://www.collada.org/2005/11/COLLADASchema" version="1.4.1">'+
      '<asset><contributor><authoring_tool>PLMR Sürme DAE Exporter V15</authoring_tool></contributor>'+
      '<created>'+now+'</created><modified>'+now+'</modified><unit name="millimeter" meter="0.001"/><up_axis>Z_UP</up_axis></asset>'+
      '<library_effects>'+effects+'</library_effects>'+
      '<library_materials>'+materials+'</library_materials>'+
      '<library_geometries>'+geometries+'</library_geometries>'+
      '<library_nodes>'+libraryNodes+'</library_nodes>'+
      '<library_visual_scenes><visual_scene id="Scene" name="Scene">'+sceneNodes+'</visual_scene></library_visual_scenes>'+
      '<scene><instance_visual_scene url="#Scene"/></scene>'+
      '</COLLADA>';
  }

  return Object.freeze({
    version:'PLMR-SURME-DAE-GROUPED-INSTANCE-NODES-V15',
    exportItems:exportItems
  });
});
