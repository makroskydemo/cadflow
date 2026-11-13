(function (root) {
  'use strict';


  // V3.81: Pergo Rise production rendering is intentionally lightweight.
  // PLMR remains the single source for dimensions/placement; Three.js only
  // renders the outer envelopes required to communicate those sections.
  const LIGHTWEIGHT_PROFILE_LIBRARY = Object.freeze({
    'pillar-profile': { kind: 'linear', sectionA: 100, sectionB: 100, source: 'PLMR.K.postSize / post_100x100' },
    'gutter-profile': { kind: 'gutter', sectionA: 135, sectionB: 145, source: 'PLMR.K.frontGutterH / PLMR.K.topGutterH' },
    'rail-profile': { kind: 'linear', sectionA: 80, sectionB: 131, source: 'PLMR.K.rayW / PLMR.K.sideRayH' },
    // The following two transverse members keep only their verified outer
    // envelope. Internal channels/radii from the historical GLB are omitted.
    'rear-profile': { kind: 'linear', sectionA: 55, sectionB: 83, source: 'PLMR transverse profile outer envelope' },
    'fabric-profile': { kind: 'linear', sectionA: 59, sectionB: 48, source: 'PLMR fabric/register outer envelope' },
    'roof-register-profile': { kind: 'roof-register', sectionA: 59, sectionB: 30, source: 'PLMR.K.catiProfilH + register outer height' },
    'rail-rear-mechanism-accessory': { kind: 'linear', sectionA: 95, sectionB: 90, source: 'PLMR rear mechanism preview envelope' },
    'rail-front-head-accessory': { kind: 'linear', sectionA: 100, sectionB: 90, source: 'PLMR rail head preview envelope' },
    'post-upper-connection-accessory': { kind: 'upper-accessory', widthX: 135, heightY: 85, depthZ: 95, source: 'PLMR post/gutter connection preview envelope' },
    'foot-accessory': { kind: 'lower-accessory', widthX: 125, heightY: 70, depthZ: 120, source: 'PLMR post lower connection preview envelope' }
  });

  const unitBoxByThree = typeof WeakMap === 'function' ? new WeakMap() : null;
  function lightweightUnitBox(THREE) {
    if (unitBoxByThree && unitBoxByThree.has(THREE)) return unitBoxByThree.get(THREE);
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    if (geometry.computeBoundingBox) geometry.computeBoundingBox();
    geometry.userData = { ...(geometry.userData || {}), p3dvShared: true, p3dvLightweightOuterEnvelope: true };
    if (unitBoxByThree) unitBoxByThree.set(THREE, geometry);
    return geometry;
  }

  function createLightweightLibrary(options) {
    const THREE = options && options.THREE || root.THREE;
    if (!THREE) throw new Error('THREE is required for the lightweight Pergo Rise library.');
    const mapping = Object.entries(LIGHTWEIGHT_PROFILE_LIBRARY).map(([key, descriptor]) => ({
      key, status: 'PLMR_OUTER_ENVELOPE', sourceNode: '', confidence: 'PLMR_2D', role: descriptor.source, sourceSizeMm: []
    }));
    return {
      templates: LIGHTWEIGHT_PROFILE_LIBRARY,
      mapping,
      unitsToMm: 1,
      source: 'plmr-lightweight-outer-envelopes',
      schema: 'p3dv-pergo-rise-lightweight-v1',
      lightweight: true
    };
  }

  function materialFor(component, materials) {
    if (component.kind === 'fabric-stack') return materials.fabric;
    if (component.kind === 'trapez-sheet') return materials.fabric;
    if (component.kind === 'rear-wall' || component.kind === 'parapet') return materials.wall;
    if (component.kind === 'fabric-profile') return materials.fabricProfile || materials.system;
    if (component.kind === 'roof-register-profile') return materials.system;
    if (component.kind === 'glass-track' || component.kind === 'triangle-joinery') return materials.glass || materials.system;
    if (component.kind === 'water-outlet') return materials.water || materials.system;
    return materials.system;
  }

  function makeLightweightLinear(library, component, materials, THREE) {
    if (!component.start || !component.end) return null;
    const descriptor = library && library.templates && library.templates[component.template] || LIGHTWEIGHT_PROFILE_LIBRARY[component.template] || null;
    if (!descriptor) return null;
    const start = new THREE.Vector3().fromArray(component.start);
    const end = new THREE.Vector3().fromArray(component.end);
    const direction = end.clone().sub(start);
    const length = direction.length();
    if (!(length > 0.001)) return null;
    let sectionA = Math.max(1, Number(descriptor.sectionA) || 40);
    let sectionB = Math.max(1, Number(descriptor.sectionB) || 40);
    if (component.kind === 'gutter' && component.profileSection) {
      sectionA = Math.max(1, Number(component.profileSection.heightY) || sectionA);
      sectionB = Math.max(1, Number(component.profileSection.depthZ) || sectionB);
    }
    if (component.kind === 'roof-register-profile') {
      sectionB = Math.max(1, Number(component.profilePlanVisibleDepth) || sectionB);
    }
    const mesh = new THREE.Mesh(lightweightUnitBox(THREE), materialFor(component, materials));
    mesh.scale.set(sectionA, length, sectionB);
    mesh.position.copy(start).add(end).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
    mesh.name = component.id;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = {
      ...(mesh.userData || {}), p3dvPergoRiseComponent: true, componentId: component.id, componentKind: component.kind,
      templateKey: component.template, sourceRuleIds: component.sourceRuleIds || [], productionGeometry: component.productionGeometry !== false,
      p3dvLightweightOuterEnvelope: true, profileSectionMm: [sectionA, sectionB], profileSource: descriptor.source || 'PLMR 2D'
    };
    return mesh;
  }

  function makeLightweightAccessory(library, component, materials, THREE) {
    const descriptor = library && library.templates && library.templates[component.template] || LIGHTWEIGHT_PROFILE_LIBRARY[component.template] || null;
    if (!descriptor) return null;
    const anchor = Array.isArray(component.anchorPosition) ? component.anchorPosition : component.position;
    if (!anchor) return null;
    const widthX = Math.max(1, Number(descriptor.widthX) || 100);
    const heightY = Math.max(1, Number(descriptor.heightY) || 70);
    const depthZ = Math.max(1, Number(descriptor.depthZ) || 100);
    const mesh = new THREE.Mesh(lightweightUnitBox(THREE), materialFor(component, materials));
    const x = Number(anchor[0]) || 0;
    const y = Number(anchor[1]) || 0;
    const z = Number(anchor[2]) || 0;
    const lower = descriptor.kind === 'lower-accessory';
    mesh.scale.set(widthX, heightY, depthZ);
    mesh.position.set(x, lower ? y + heightY / 2 : y - heightY / 2, z - depthZ / 2);
    mesh.name = component.id;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = {
      p3dvPergoRiseComponent: true, componentId: component.id, componentKind: component.kind, templateKey: component.template,
      sourceRuleIds: component.sourceRuleIds || [], productionGeometry: component.productionGeometry !== false,
      p3dvLightweightOuterEnvelope: true, profileSectionMm: [widthX, heightY, depthZ], profileSource: descriptor.source || 'PLMR 2D'
    };
    return mesh;
  }

  function makeCustomPost(component, materials, THREE) {
    if (!component.start || !component.end) return null;
    const start = new THREE.Vector3().fromArray(component.start);
    const end = new THREE.Vector3().fromArray(component.end);
    const height = Math.max(1, Math.abs(end.y - start.y));
    const width = Math.max(1, Number(component.profileWidthX) || 100);
    const depth = Math.max(1, Number(component.profileDepthZ) || 100);
    const thickness = Math.max(0, Math.min(Number(component.profileWallThickness) || 0, Math.min(width, depth) / 2 - 0.1));
    const group = new THREE.Group();
    group.name = component.id;
    const material = materialFor(component, materials);
    const addBox = (w, h, d, x, y, z) => {
      if (!(w > 0.001 && h > 0.001 && d > 0.001)) return;
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
      mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true; group.add(mesh);
    };
    const cx = (start.x + end.x) / 2, cy = (start.y + end.y) / 2, cz = (start.z + end.z) / 2;
    if (!(thickness > 0.001)) addBox(width, height, depth, cx, cy, cz);
    else {
      addBox(thickness, height, depth, cx - width / 2 + thickness / 2, cy, cz);
      addBox(thickness, height, depth, cx + width / 2 - thickness / 2, cy, cz);
      addBox(Math.max(0, width - 2 * thickness), height, thickness, cx, cy, cz - depth / 2 + thickness / 2);
      addBox(Math.max(0, width - 2 * thickness), height, thickness, cx, cy, cz + depth / 2 - thickness / 2);
    }
    group.userData = {
      p3dvPergoRiseComponent: true, componentId: component.id, componentKind: component.kind,
      templateKey: component.template, sourceRuleIds: component.sourceRuleIds || [],
      canonicalHollowPost: true, productionGeometry: true
    };
    return group;
  }

  function makeProfileTube(component, materials, THREE) {
    if (!component.start || !component.end) return null;
    const start = new THREE.Vector3().fromArray(component.start);
    const end = new THREE.Vector3().fromArray(component.end);
    const direction = end.clone().sub(start);
    const length = direction.length();
    if (!(length > 0.001)) return null;
    const width = Math.max(1, Number(component.profileEn || component.profileWidth) || 41.7);
    const depth = Math.max(1, Number(component.profileBoy || component.profileDepth) || 41.7);
    const thickness = Math.max(0, Math.min(Number(component.profileThickness) || 0, Math.min(width, depth) / 2 - 0.1));
    const group = new THREE.Group();
    group.name = component.id;
    const material = materialFor(component, materials);
    const addMember = (w, d, x, z) => {
      if (!(w > 0.001 && d > 0.001)) return;
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, length, d), material);
      mesh.position.set(x, 0, z); mesh.castShadow = true; mesh.receiveShadow = true; group.add(mesh);
    };
    if (!(thickness > 0.001)) addMember(width, depth, 0, 0);
    else {
      addMember(thickness, depth, -width / 2 + thickness / 2, 0);
      addMember(thickness, depth, width / 2 - thickness / 2, 0);
      addMember(Math.max(0, width - 2 * thickness), thickness, 0, -depth / 2 + thickness / 2);
      addMember(Math.max(0, width - 2 * thickness), thickness, 0, depth / 2 - thickness / 2);
    }
    group.position.copy(start).add(end).multiplyScalar(0.5);
    group.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
    group.userData = {
      p3dvPergoRiseComponent: true, componentId: component.id, componentKind: component.kind,
      templateKey: component.template, sourceRuleIds: component.sourceRuleIds || [],
      canonicalProfileTube: true, productionGeometry: true
    };
    return group;
  }

  function makeWaterOutlet(component, materials, THREE) {
    if (!component.start || !component.end) return null;
    const start = new THREE.Vector3().fromArray(component.start);
    const end = new THREE.Vector3().fromArray(component.end);
    const direction = end.clone().sub(start);
    const length = direction.length();
    if (!(length > 0.001)) return null;
    const diameter = Math.max(1, Number(component.profileWidth || component.profileEn) || 70);
    const geometry = new THREE.CylinderGeometry(diameter / 2, diameter / 2, length, 16, 1, false);
    const mesh = new THREE.Mesh(geometry, materialFor(component, materials));
    mesh.position.copy(start).add(end).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
    mesh.name = component.id; mesh.castShadow = true; mesh.receiveShadow = true;
    mesh.userData = {
      p3dvPergoRiseComponent: true, componentId: component.id, componentKind: component.kind,
      templateKey: component.template, sourceRuleIds: component.sourceRuleIds || [],
      canonicalWaterOutletPipe: true, productionGeometry: true
    };
    return mesh;
  }

  function makeTrapezSheet(component, materials, THREE) {
    const corners = Array.isArray(component.corners) ? component.corners : [];
    if (corners.length !== 4) return null;
    const positions = new Float32Array(corners.flatMap(point => [Number(point[0]) || 0, Number(point[1]) || 0, Number(point[2]) || 0]));
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setIndex([0, 1, 2, 0, 2, 3]);
    geometry.computeVertexNormals();
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    geometry.userData = {
      ...(geometry.userData || {}),
      p3dvTrapezSheetSurface: true,
      zeroThickness: true,
      sourceRuleIds: component.sourceRuleIds || []
    };
    const mesh = new THREE.Mesh(geometry, materialFor(component, materials));
    mesh.name = component.id;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = {
      p3dvPergoRiseComponent: true,
      componentId: component.id,
      componentKind: component.kind,
      templateKey: component.template,
      sourceRuleIds: component.sourceRuleIds || [],
      canonicalTrapezSheetSurface: true,
      productionGeometry: true,
      zeroThickness: true
    };
    return mesh;
  }

  function makeWall(component, materials, THREE) {
    const points = Array.isArray(component.polygonXZ) ? component.polygonXZ : [];
    if (points.length < 3) return null;
    const shape = new THREE.Shape();
    points.forEach((point, index) => {
      const x = Number(point[0]) || 0;
      const z = Number(point[1]) || 0;
      if (index === 0) shape.moveTo(x, -z); else shape.lineTo(x, -z);
    });
    shape.closePath();
    const height = Math.max(1, Number(component.topY) - Number(component.bottomY));
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: height, bevelEnabled: false, curveSegments: 1, steps: 1 });
    geometry.rotateX(-Math.PI / 2);
    geometry.translate(0, Number(component.bottomY) || 0, 0);
    geometry.computeVertexNormals();
    const mesh = new THREE.Mesh(geometry, materialFor(component, materials));
    mesh.name = component.id;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = {
      p3dvPergoRiseComponent: true,
      componentId: component.id,
      componentKind: component.kind,
      templateKey: component.template,
      sourceRuleIds: component.sourceRuleIds || [],
      canonicalWallSolid: true,
      productionGeometry: true
    };
    return mesh;
  }


  function makeAreaPicker(target, THREE) {
    const b=target&&target.bounds||{};
    const minX=Number(b.minX)||0,maxX=Number(b.maxX)||0,minY=Number(b.minY)||0,maxY=Number(b.maxY)||0,minZ=Number(b.minZ)||0,maxZ=Number(b.maxZ)||0;
    const sx=Math.max(4,Math.abs(maxX-minX)||8), sy=Math.max(4,Math.abs(maxY-minY)||8), sz=Math.max(4,Math.abs(maxZ-minZ)||8);
    const geometry=new THREE.BoxGeometry(sx,sy,sz);
    const material=new THREE.MeshBasicMaterial({color:0x38bdf8,transparent:true,opacity:0.035,depthWrite:false,side:THREE.DoubleSide});
    const mesh=new THREE.Mesh(geometry,material);
    mesh.position.set((minX+maxX)/2,(minY+maxY)/2,(minZ+maxZ)/2);
    mesh.name=target.label||target.id;
    mesh.userData={p3dvPergoRiseSelectable:true,editingTarget:target,contextOperations:target.operations||[],p3dvPergoRiseArea:true};
    return mesh;
  }

  function makeAreaProduct(component, materials, THREE) {
    const side=component.face==='left'||component.face==='right';
    const width=Math.max(1,Number(component.width)||1),height=Math.max(1,Number(component.height)||1),depth=Math.max(10,Number(component.depth)||50);
    const position=component.position||[0,0,0],baseY=(Number(position[1])||0)-height/2,baseW=(side?(Number(position[2])||0):(Number(position[0])||0))-width/2;
    const material=(materials.system&&materials.system.clone)?materials.system.clone():new THREE.MeshStandardMaterial({color:0x64748b});
    const group=new THREE.Group(); group.name=String(component.id||'area-product');
    const meta=component.productGeometry||{};
    const box=(w0,w1,y0,y1,d=depth,offset=0)=>{
      const a=Math.max(0,Math.min(width,Number(w0)||0)),b=Math.max(a+0.1,Math.min(width,Number(w1)||0));
      const lo=Math.max(0,Math.min(height,Number(y0)||0)),hi=Math.max(lo+0.1,Math.min(height,Number(y1)||0));
      const mesh=side
        ? new THREE.Mesh(new THREE.BoxGeometry(d,hi-lo,b-a),material)
        : new THREE.Mesh(new THREE.BoxGeometry(b-a,hi-lo,d),material);
      if(side)mesh.position.set((Number(position[0])||0)+offset,baseY+(lo+hi)/2,baseW+(a+b)/2);
      else mesh.position.set(baseW+(a+b)/2,baseY+(lo+hi)/2,(Number(position[2])||0)+offset);
      group.add(mesh);
    };
    if(meta.kind==='sliding'){
      const frame=Math.min(50,width/2,height/2),mullion=Math.min(50,Math.max(1,width-2*frame));
      box(0,width,0,frame);box(0,width,height-frame,height);box(0,frame,frame,height-frame);box(width-frame,width,frame,height-frame);
      const panels=Math.max(2,Math.round(Number(meta.panelCount)||2)),innerW=Math.max(1,width-2*frame),clearW=Math.max(1,(innerW-(panels-1)*mullion)/panels);
      let cursor=frame+clearW;for(let i=0;i<panels-1;i+=1){box(cursor,cursor+mullion,frame,height-frame);cursor+=mullion+clearW;}
    }else if(meta.kind==='guillotine'){
      const sideFrame=Math.min(Number(meta.sideFrame)||50,width/2),bottom=Math.min(Number(meta.bottomFrame)||50,height/2),top=Math.min(Number(meta.topFrame)||150,Math.max(1,height-bottom)),separator=Math.min(Number(meta.separatorSize)||50,Math.max(1,height-bottom-top));
      box(0,width,0,bottom);box(0,width,height-top,height);box(0,sideFrame,bottom,height-top);box(width-sideFrame,width,bottom,height-top);
      const panels=Math.max(2,Math.round(Number(meta.panelCount)||2)),innerH=Math.max(1,height-bottom-top),clearH=Math.max(1,(innerH-(panels-1)*separator)/panels);
      let cursor=bottom+clearH;for(let i=0;i<panels-1;i+=1){box(sideFrame,width-sideFrame,cursor,cursor+separator);cursor+=separator+clearH;}
    }else if(meta.kind==='zip-screen'){
      const boxH=Math.min(Number(meta.boxHeight)||100,Math.max(1,height-1)),guide=Math.min(Number(meta.guideWidth)||35,width/2),bottom=Math.min(Number(meta.bottomBarHeight)||40,Math.max(1,height-boxH)),fabricTop=Math.max(bottom+0.1,height-boxH);
      box(0,width,height-boxH,height);box(0,guide,0,fabricTop);box(width-guide,width,0,fabricTop);box(guide,width-guide,0,bottom);
      if(width-2*guide>0.2&&fabricTop-bottom>0.2)box(guide,width-guide,bottom,fabricTop,Math.max(1,Number(meta.fabricDepth)||8));
    }else box(0,width,0,height);
    group.userData={p3dvPergoRiseComponent:true,componentId:component.id,componentKind:component.kind,productionGeometry:true,productPrimitiveCount:group.children.length};
    return group;
  }

  function applyEditingMetadata(object, component) {
    if (!object || !component) return object;
    const editing = component.editing || (root.P3DVPergoRiseEditing && root.P3DVPergoRiseEditing.targetForComponent(component));
    if (!editing) return object;
    object.userData = { ...(object.userData || {}), p3dvPergoRiseSelectable: true, editingTarget: editing, contextOperations: editing.operations || [] };
    object.traverse && object.traverse(child => {
      child.userData = { ...(child.userData || {}), p3dvPergoRiseSelectable: true, editingTarget: editing, contextOperations: editing.operations || [] };
    });
    return object;
  }

  function buildAssembly(library, derived, options) {
    const THREE = options && options.THREE || root.THREE;
    if (!THREE || !library || !derived) throw new Error('Pergo Rise library and derived assembly are required.');
    const materials = options && options.materials || {};
    const group = new THREE.Group();
    group.name = 'Pergo Rise Parametric Static Assembly';
    group.userData = {
      p3dvPergoRiseAssembly: true,
      schema: derived.schema,
      productId: derived.productId,
      projectHash: derived.projectHash,
      staticState: derived.staticState,
      counts: derived.counts,
      editing: derived.editing || null
    };
    const built = [];
    const missing = [];
    (derived.components || []).forEach(component => {
      if (component && component.renderVisible === false) return;
      let object = null;
      if (component.kind === 'rear-wall' || component.kind === 'parapet') object = makeWall(component, materials, THREE);
      else if (component.kind === 'trapez-sheet') object = makeTrapezSheet(component, materials, THREE);
      else if ((component.kind === 'post' || component.kind === 'side-support-post') && component.template === 'canonical-hollow-post') object = makeCustomPost(component, materials, THREE);
      else if (component.kind === 'glass-track' || component.kind === 'triangle-joinery') object = makeProfileTube(component, materials, THREE);
      else if (component.kind === 'water-outlet') object = makeWaterOutlet(component, materials, THREE);
      else if (component.kind === 'fabric-stack') {
        // Visual-only historical GLB fabric stack is intentionally omitted in the lightweight renderer.
        return;
      }
      else if (component.kind === 'area-product') object = makeAreaProduct(component, materials, THREE);
      else if (component.start && component.end) object = makeLightweightLinear(library, component, materials, THREE);
      else object = makeLightweightAccessory(library, component, materials, THREE);
      if (object) {
        applyEditingMetadata(object, component);
        group.add(object);
        built.push(component.id);
      } else {
        missing.push({ id: component.id, kind: component.kind, template: component.template });
      }
    });
    const selectableAreaScopes = Array.isArray(options && options.selectableAreaScopes)
      ? new Set(options.selectableAreaScopes.map(value=>String(value||'').toLowerCase())) : null;
    const selectableAreaActionTypes = Array.isArray(options && options.selectableAreaActionTypes)
      ? new Set(options.selectableAreaActionTypes.map(value=>String(value||'').toLowerCase())) : null;
    const areaTargets=(derived.editing && Array.isArray(derived.editing.targets) ? derived.editing.targets : [])
      .filter(target=>target.targetType==='area')
      .filter(target=>!selectableAreaScopes||selectableAreaScopes.has(String(target.zoneInfo&&target.zoneInfo.scope||target.face||'').toLowerCase()))
      .filter(target=>!selectableAreaActionTypes||selectableAreaActionTypes.has(String(target.plmrDimension&&target.plmrDimension.actionType||'').toLowerCase()));
    areaTargets.forEach(target=>group.add(makeAreaPicker(target,THREE)));
    group.userData.buildReport = {
      builtCount: built.length,
      missing,
      mapping: library.mapping,
      selectableAreaScopes: selectableAreaScopes ? Array.from(selectableAreaScopes) : ['all'],
      selectableAreaActionTypes: selectableAreaActionTypes ? Array.from(selectableAreaActionTypes) : ['all'],
      selectableAreaCount: areaTargets.length
    };
    return group;
  }

  root.P3DVPergoRiseViewer = Object.freeze({ LIGHTWEIGHT_PROFILE_LIBRARY, createLightweightLibrary, buildAssembly });
})(typeof window !== 'undefined' ? window : globalThis);
