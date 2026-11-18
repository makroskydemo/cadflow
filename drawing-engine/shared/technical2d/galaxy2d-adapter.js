(function (root) {
  'use strict';

  const SCHEMA = 'plmr-galaxy-technical2d-projection-v14.23';
  const PRODUCT_ID = 'P3DV_BIOCLIMATIC';
  const PRODUCT_GROUP = 'b-cube-galaxy';
  const PROFILE = Object.freeze({
    post: Object.freeze({ x: 180, z: 140 }),
    beam: Object.freeze({ vertical: 225, thickness: 40 }),
    frontRearFootprint: 140,
    sideFootprint: 180,
    gutterWidth: 98,
    gutterClearance: 2
  });

  function clone(value) { return value === undefined ? undefined : JSON.parse(JSON.stringify(value)); }
  function num(value, fallback) { const n = Number(value); return Number.isFinite(n) ? n : fallback; }
  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  function range(values, fallbackMin, fallbackMax) {
    const finite = (Array.isArray(values) ? values : []).map(Number).filter(Number.isFinite);
    if (!finite.length) return { min: fallbackMin, max: fallbackMax };
    return { min: Math.min(...finite), max: Math.max(...finite) };
  }
  function entity(type, props) { return Object.freeze({ type, ...props }); }
  function rect(x, y, width, height, role, meta) {
    return entity('rect', { x: num(x, 0), y: num(y, 0), width: Math.max(0, num(width, 0)), height: Math.max(0, num(height, 0)), role: role || 'outline', meta: meta || null });
  }
  function line(x1, y1, x2, y2, role, meta) {
    return entity('line', { x1: num(x1, 0), y1: num(y1, 0), x2: num(x2, 0), y2: num(y2, 0), role: role || 'outline', meta: meta || null });
  }
  function label(x, y, text, role, meta) {
    return entity('text', { x: num(x, 0), y: num(y, 0), text: String(text || ''), role: role || 'label', meta: meta || null });
  }
  function dim(axis, start, end, offset, text, meta) {
    return entity('dimension', { axis: axis === 'y' ? 'y' : 'x', start: num(start, 0), end: num(end, 0), offset: num(offset, 0), text: String(text || ''), role: 'dimension', meta: meta || null });
  }

  const SIDE_TO_FACADE = Object.freeze({ rear: 'front', front: 'back', left: 'left', right: 'right' });
  function productLabel(type) {
    const key = String(type || '').toLowerCase();
    return ({ sliding: 'Sürme', guillotine: 'Giyotin', zip: 'Zip', door: 'Kapı', fixed: 'Sabit Doğrama', folding: 'Akordiyon Cam', balcony:'Katlanır Cam' })[key] || String(type || 'Ürün');
  }
  function contractZones(contract, side) {
    const facadeId = SIDE_TO_FACADE[side] || side;
    return (contract && Array.isArray(contract.zones) ? contract.zones : [])
      .filter(zone => zone && zone.facadeId === facadeId)
      .map(zone => ({ ...zone }));
  }
  function productIsOpen(model, zoneId, slot) {
    const key = slot === 'zip' ? `zip:${zoneId}` : zoneId;
    const states = model && model.productOpenStates && typeof model.productOpenStates === 'object' ? model.productOpenStates : {};
    if (Object.prototype.hasOwnProperty.call(states, key)) return Boolean(states[key]);
    return Boolean(model && model.productsOpen);
  }

  function renderProductDetail(entities, model, zone, placement, slot, x, y, w, h) {
    if (!placement) return;
    const reuse = root.PulumurTechnical2DFacadeNativeReuse;
    if (!reuse || typeof reuse.renderInto !== 'function') throw new Error('TECHNICAL2D_NATIVE_FACADE_REUSE_MISSING');
    reuse.renderInto(entities, model, zone, placement, slot, x, y, w, h);
  }

  function addInteractionZones(entities, model, contract, side) {
    const height = Math.max(1, num(model.height, 0));
    contractZones(contract, side).forEach(zone => {
      const axis = zone.axis === 'z' ? 'z' : 'x';
      const center = axis === 'x' ? num(zone.cx, 0) : num(zone.cz, 0);
      const x = center - Math.max(1, num(zone.width, 0)) / 2;
      const y = num(zone.bottomY, -height / 2) + height / 2;
      const w = Math.max(1, num(zone.width, 0));
      const h = Math.max(1, num(zone.height, 0));
      const zoneMeta = { kind: 'zone', zoneId: zone.id, facadeId: zone.facadeId, zone: clone(zone), interactive: true };
      entities.push(rect(x, y, w, h, 'zone-area', zoneMeta));
      entities.push(dim('x', x, x + w, y - Math.max(80, h * 0.035), `${Math.round(w)}`, { kind: 'zone-width', zoneId: zone.id, facadeId: zone.facadeId, zone: clone(zone), interactive: true }));
      if (zone.bottomBoundaryId !== 'BOTTOM' || zone.topBoundaryId !== 'TOP') {
        entities.push(dim('y', y, y + h, x + w + Math.max(70, w * 0.018), `${Math.round(h)}`, { kind: 'zone-height', zoneId: zone.id, facadeId: zone.facadeId, zone: clone(zone), interactive: true }));
      }
      const primary = contract && contract.placements && contract.placements[zone.id];
      const zip = contract && contract.zipPlacements && contract.zipPlacements[zone.id];
      const reuse = root.PulumurTechnical2DFacadeNativeReuse;
      if (!reuse || typeof reuse.projectionBox !== 'function') throw new Error('TECHNICAL2D_FACADE_PROJECTION_BOX_MISSING');
      if (primary) {
        const box = reuse.projectionBox(zone, primary, 'primary', x, y, w, h);
        entities.push(rect(box.x, box.y, box.width, box.height, 'product-primary', { kind: 'product', slot: 'primary', zoneId: zone.id, facadeId: zone.facadeId, zone: clone(zone), placement: clone(primary), interactive: true }));
        renderProductDetail(entities, model, zone, primary, 'primary', box.x, box.y, box.width, box.height);
      }
      if (zip) {
        const box = reuse.projectionBox(zone, zip, 'zip', x, y, w, h);
        entities.push(rect(box.x, box.y, box.width, box.height, 'product-zip', { kind: 'product', slot: 'zip', zoneId: zone.id, facadeId: zone.facadeId, zone: clone(zone), placement: clone(zip), interactive: true }));
        renderProductDetail(entities, model, zone, zip, 'zip', box.x, box.y, box.width, box.height);
      }
    });
  }

  function postSection(model, post) {
    const section = post && post.section && typeof post.section === 'object' ? post.section : null;
    if (section) return { x: Math.max(20, num(section.x, PROFILE.post.x)), z: Math.max(20, num(section.z, PROFILE.post.z)) };
    const source = Array.isArray(model.postSections) ? model.postSections : [];
    const candidate = post && Number.isInteger(Number(post.sourceIndex)) && Number(post.sourceIndex) >= 0 ? source[Number(post.sourceIndex)] : null;
    return { x: Math.max(20, num(candidate && candidate.x, PROFILE.post.x)), z: Math.max(20, num(candidate && candidate.z, PROFILE.post.z)) };
  }

  function buildLayout(model) {
    const engine = root.P3DVGalaxyMultiPosition;
    if (!engine || typeof engine.build !== 'function') throw new Error('GALAXY_CANONICAL_MULTI_POSITION_ENGINE_MISSING');
    const postSections = Array.isArray(model.postSections) && model.postSections.length >= 4
      ? model.postSections.map(section => ({ x: num(section && section.x, PROFILE.post.x), z: num(section && section.z, PROFILE.post.z) }))
      : Array.from({ length: 4 }, () => ({ ...PROFILE.post }));
    return engine.build({
      systemCount: Math.max(1, Math.round(num(model.systemCount, 1))),
      totalWidth: num(model.width, 0),
      moduleWidths: Array.isArray(model.moduleWidths) ? model.moduleWidths.map(Number) : [],
      depth: num(model.depth, 0),
      moduleDepths: Array.isArray(model.moduleDepths) ? model.moduleDepths.map(Number) : [],
      alignment: model.multiAlignment === 'rear' ? 'rear' : 'front',
      rows: Array.isArray(model.multiRows) ? clone(model.multiRows) : [],
      rowAlignment: model.rowAlignment === 'right' ? 'right' : 'left',
      panelCollection: model.panelCollection === 'outer' ? 'outer' : 'center',
      panelCount: Math.max(0, Math.round(num(model.panelCount, 0))),
      panelCounts: Array.isArray(model.modulePanelCounts) ? model.modulePanelCounts.map(Number) : [],
      height: num(model.height, 0),
      postSections,
      interiorPostSection: { ...PROFILE.post },
      beamSection: model.beamSection || { ...PROFILE.beam },
      sideFrameWidth: 80,
      sideGutterWidth: PROFILE.gutterWidth,
      gutterClearance: PROFILE.gutterClearance
    });
  }

  function envelopeOf(layout, model) {
    if (layout && layout.envelope) {
      return {
        minX: num(layout.envelope.minX, -num(model.width, 0) / 2),
        maxX: num(layout.envelope.maxX, num(model.width, 0) / 2),
        minZ: num(layout.envelope.minZ, -num(model.depth, 0) / 2),
        maxZ: num(layout.envelope.maxZ, num(model.depth, 0) / 2)
      };
    }
    const modules = Array.isArray(layout && layout.modules) ? layout.modules : [];
    const xs = modules.flatMap(module => [num(module.outerMinX, NaN), num(module.outerMaxX, NaN)]).filter(Number.isFinite);
    const zs = modules.flatMap(module => [num(module.rearOuterZ, NaN), num(module.frontOuterZ, NaN)]).filter(Number.isFinite);
    const xr = range(xs, -num(model.width, 0) / 2, num(model.width, 0) / 2);
    const zr = range(zs, -num(model.depth, 0) / 2, num(model.depth, 0) / 2);
    return { minX: xr.min, maxX: xr.max, minZ: zr.min, maxZ: zr.max };
  }

  function profilesFor(model, facadeId) {
    const map = model.facadeProfiles && typeof model.facadeProfiles === 'object' ? model.facadeProfiles : {};
    return (Array.isArray(map[facadeId]) ? map[facadeId] : []).map(item => ({ ...item }));
  }

  function addFacadeProfiles(entities, model, facadeId, horizontalMin, horizontalMax, clearHeight) {
    const span = Math.max(1, horizontalMax - horizontalMin);
    profilesFor(model, facadeId).forEach(profile => {
      const width = (num(profile.width, 100) > 0 ? num(profile.width, 100) : 100);
      if (profile.orientation === 'horizontal') {
        const ratio = clamp(num(profile.positionYRatio, 0.5), 0.01, 0.99);
        const y = ratio * clearHeight - width / 2;
        const scopeStart = clamp(num(profile.scopeStartRatio, 0), 0, 1);
        const scopeEnd = clamp(num(profile.scopeEndRatio, 1), 0, 1);
        entities.push(rect(horizontalMin + scopeStart * span, y, Math.max(1, (scopeEnd - scopeStart) * span), width, 'divider-profile', { kind: 'profile', facadeId, profileId: profile.id, orientation: 'horizontal', profile: clone({ ...profile, facadeId }), interactive: true }));
      } else {
        const ratio = clamp(num(profile.positionRatio, 0.5), 0.0001, 0.9999);
        const x = horizontalMin + ratio * span - width / 2;
        entities.push(rect(x, 0, width, clearHeight, 'divider-profile', { kind: 'profile', facadeId, profileId: profile.id, orientation: 'vertical', profile: clone({ ...profile, facadeId }), interactive: true }));
      }
    });
  }

  function galaxyPanelProjection(module, model) {
    const zSign = num(module && module.rearToFrontSign, 1) < 0 ? -1 : 1;
    const rearOuterZ = num(module && module.rearOuterZ, 0), frontOuterZ = num(module && module.frontOuterZ, 0);
    const frontT = zSign * frontOuterZ;
    const panelCount = Math.max(0, Math.round(num(module && module.panelCount, 0)));
    const panelLength = Math.max(1, num(module && module.panelLength, num(module && module.clearWidth, 1)));
    const centerX = num(module && module.panelCenterX, num(module && module.centerX, 0));
    const firstMaxT = Number.isFinite(Number(module && module.frontGutterInnerT)) ? Number(module.frontGutterInnerT) - 76 : frontT - 216;
    const edges=[]; for(let i=0;i<panelCount;i+=1) edges.push({panelIndex:i,z:zSign*(firstMaxT-(panelCount-1-i)*200)});
    return {zSign,panelCount,panelLength,centerX,opened:Boolean(model&&model.panelMasterOpen),edges};
  }

  function addGalaxyTopCombinedProfiles(entities, layout) {
    (Array.isArray(layout.modules)?layout.modules:[]).forEach(module=>{
      const zSign=num(module.rearToFrontSign,1)<0?-1:1;
      const outerMinX=num(module.outerMinX,0),outerMaxX=num(module.outerMaxX,0);
      const rearOuter=num(module.rearOuterZ,0),frontOuter=num(module.frontOuterZ,0);
      const rearZ=zSign>0?rearOuter:rearOuter-140, frontZ=zSign>0?frontOuter-140:frontOuter;
      entities.push(rect(num(module.rearStartX,outerMinX),rearZ,Math.max(1,num(module.rearBeamLength,num(module.clearWidth,1))),140,'combined-profile',{productKind:'bioclimatic',moduleIndex:module.moduleIndex,profileKind:'front-rear',side:'rear'}));
      entities.push(rect(num(module.frontStartX,outerMinX),frontZ,Math.max(1,num(module.frontBeamLength,num(module.clearWidth,1))),140,'combined-profile',{productKind:'bioclimatic',moduleIndex:module.moduleIndex,profileKind:'front-rear',side:'front'}));
      entities.push(rect(outerMinX,num(module.leftSideBeamZ,num(module.centerZ,0))-num(module.leftSideBeamLength,num(module.depth,1))/2,180,Math.max(1,num(module.leftSideBeamLength,num(module.depth,1))),'combined-profile',{productKind:'bioclimatic',moduleIndex:module.moduleIndex,profileKind:'side',side:'left'}));
      entities.push(rect(outerMaxX-180,num(module.rightSideBeamZ,num(module.centerZ,0))-num(module.rightSideBeamLength,num(module.depth,1))/2,180,Math.max(1,num(module.rightSideBeamLength,num(module.depth,1))),'combined-profile',{productKind:'bioclimatic',moduleIndex:module.moduleIndex,profileKind:'side',side:'right'}));
    });
  }

  function buildTopView(model, layout, envelope) {
    const entities=[],modules=Array.isArray(layout.modules)?layout.modules:[];
    modules.forEach((module,index)=>{const minZ=Math.min(num(module.rearOuterZ,0),num(module.frontOuterZ,0)),maxZ=Math.max(num(module.rearOuterZ,0),num(module.frontOuterZ,0));const outerMinX=num(module.outerMinX,num(module.clearMinX,0)-PROFILE.sideFootprint),outerMaxX=num(module.outerMaxX,num(module.clearMaxX,0)+PROFILE.sideFootprint);entities.push(rect(outerMinX,minZ,outerMaxX-outerMinX,maxZ-minZ,'module-outline',{moduleIndex:index,rowIndex:module.rowIndex}));});
    addGalaxyTopCombinedProfiles(entities,layout);
    modules.forEach((module,index)=>{const panel=galaxyPanelProjection(module,model),x0=panel.centerX-panel.panelLength/2,x1=panel.centerX+panel.panelLength/2,zs=panel.edges.map(e=>e.z),z0=zs.length?Math.min(...zs):Math.min(num(module.rearOuterZ,0),num(module.frontOuterZ,0)),z1=zs.length?Math.max(...zs):Math.max(num(module.rearOuterZ,0),num(module.frontOuterZ,0));entities.push(rect(x0,z0,panel.panelLength,Math.max(1,z1-z0),'panel-zone',{moduleIndex:index,rowIndex:module.rowIndex,canonicalPanelProjection:true}));panel.edges.forEach(item=>entities.push(line(x0,item.z,x1,item.z,'roof-panel',{moduleIndex:index,rowIndex:module.rowIndex,panelIndex:item.panelIndex,tilted:panel.opened})));if(panel.opened)entities.push(label(panel.centerX,z0+Math.max(20,(z1-z0)*.08),'LAMELLER AÇIK','product-state-label',{moduleIndex:index,state:'TILT_OPEN'}));entities.push(label((num(module.outerMinX,x0)+num(module.outerMaxX,x1))/2,(num(module.rearOuterZ,z0)+num(module.frontOuterZ,z1))/2,`M${index+1}`,'module-label',{moduleIndex:index,rowIndex:module.rowIndex}));});
    (Array.isArray(layout.posts)?layout.posts:[]).forEach(post=>{const section=postSection(model,post);entities.push(rect(num(post.x,0)-section.x/2,num(post.z,0)-section.z/2,section.x,section.z,'post',{postId:post.id,shared:Boolean(post.sharedBoundary||post.sharedAcrossRows)}));});
    const width=envelope.maxX-envelope.minX,depth=envelope.maxZ-envelope.minZ,alignmentSide=model.multiAlignment==='rear'?envelope.minZ:envelope.maxZ;
    entities.push(line(envelope.minX,alignmentSide,envelope.maxX,alignmentSide,'alignment-guide',{alignment:model.multiAlignment==='rear'?'rear':'front',rowAlignment:model.rowAlignment||'left',panelCollection:model.panelCollection||'center'}));
    entities.push(dim('x',envelope.minX,envelope.maxX,envelope.minZ-Math.max(260,depth*.08),`${Math.round(width)} mm`,{kind:'overall-width'})); entities.push(dim('y',envelope.minZ,envelope.maxZ,envelope.maxX+Math.max(260,width*.06),`${Math.round(depth)} mm`,{kind:'overall-depth'}));
    modules.forEach((module,index)=>{const a=num(module.outerMinX,NaN),b=num(module.outerMaxX,NaN);if(Number.isFinite(a)&&Number.isFinite(b))entities.push(dim('x',a,b,envelope.maxZ+170+(index%2)*90,`${Math.round(b-a)}`,{kind:'module-width',moduleIndex:index}));});
    return {id:'top',title:'Üst Görünüş',axis:'xz',bounds:{minX:envelope.minX,maxX:envelope.maxX,minY:envelope.minZ,maxY:envelope.maxZ},entities};
  }

  function elevationPosts(layout, model, side, envelope) {
    const posts = Array.isArray(layout.posts) ? layout.posts : [];
    const tolerance = side === 'rear' || side === 'front' ? PROFILE.frontRearFootprint + 40 : PROFILE.sideFootprint + 40;
    if (side === 'rear') return posts.filter(post => Math.abs(num(post.z, 0) - envelope.minZ) <= tolerance);
    if (side === 'front') return posts.filter(post => Math.abs(num(post.z, 0) - envelope.maxZ) <= tolerance);
    if (side === 'left') return posts.filter(post => Math.abs(num(post.x, 0) - envelope.minX) <= tolerance);
    return posts.filter(post => Math.abs(num(post.x, 0) - envelope.maxX) <= tolerance);
  }

  function galaxyVisibleModules(layout,side,envelope){const modules=Array.isArray(layout.modules)?layout.modules:[];if(side==='left')return modules.filter(m=>Math.abs(num(m.outerMinX,0)-envelope.minX)<1);if(side==='right')return modules.filter(m=>Math.abs(num(m.outerMaxX,0)-envelope.maxX)<1);return modules;}
  function addGalaxyElevationStructure(entities,layout,envelope,side,clearHeight,beamHeight){const modules=galaxyVisibleModules(layout,side,envelope);if(side==='rear'||side==='front'){modules.forEach(module=>{const start=side==='rear'?num(module.rearStartX,num(module.outerMinX,0)):num(module.frontStartX,num(module.outerMinX,0));const length=side==='rear'?num(module.rearBeamLength,num(module.clearWidth,1)):num(module.frontBeamLength,num(module.clearWidth,1));entities.push(rect(start,clearHeight,Math.max(1,length),beamHeight,'combined-profile',{productKind:'bioclimatic',moduleIndex:module.moduleIndex,profileKind:'front-rear',side}));});}else{modules.forEach(module=>{const start=side==='left'?num(module.leftSideBeamZ,num(module.centerZ,0))-num(module.leftSideBeamLength,num(module.depth,1))/2:num(module.rightSideBeamZ,num(module.centerZ,0))-num(module.rightSideBeamLength,num(module.depth,1))/2;const length=side==='left'?num(module.leftSideBeamLength,num(module.depth,1)):num(module.rightSideBeamLength,num(module.depth,1));entities.push(rect(start,clearHeight,Math.max(1,length),beamHeight,'combined-profile',{productKind:'bioclimatic',moduleIndex:module.moduleIndex,profileKind:'side',side}));});}}
  function addGalaxyElevationPanels(entities,model,layout,envelope,side,clearHeight){const y=clearHeight+61,modules=galaxyVisibleModules(layout,side,envelope);if(side==='left'||side==='right')modules.forEach(module=>{const panel=galaxyPanelProjection(module,model);panel.edges.forEach(item=>{if(panel.opened)entities.push(line(item.z-8,y,item.z+22,y+105,'roof-panel',{moduleIndex:module.moduleIndex,panelIndex:item.panelIndex,side,tilted:true}));else entities.push(line(item.z-45,y,item.z+45,y,'roof-panel',{moduleIndex:module.moduleIndex,panelIndex:item.panelIndex,side,tilted:false}));});});else modules.forEach(module=>{const panel=galaxyPanelProjection(module,model);entities.push(line(panel.centerX-panel.panelLength/2,y,panel.centerX+panel.panelLength/2,y,'roof-panel',{moduleIndex:module.moduleIndex,side,edgeProjection:true,tilted:panel.opened}));});}

  function buildElevation(model, layout, envelope, side, contract) {
    const horizontalAxis=side==='rear'||side==='front'?'x':'z',horizontalMin=horizontalAxis==='x'?envelope.minX:envelope.minZ,horizontalMax=horizontalAxis==='x'?envelope.maxX:envelope.maxZ;
    const height=Math.max(1,num(model.height,num(layout.height,0))),beamHeight=Math.max(20,num(model.beamSection&&model.beamSection.vertical,PROFILE.beam.vertical)),clearHeight=Math.max(0,height-beamHeight),entities=[];
    entities.push(rect(horizontalMin,0,horizontalMax-horizontalMin,height,'elevation-envelope',{side})); addGalaxyElevationStructure(entities,layout,envelope,side,clearHeight,beamHeight); addGalaxyElevationPanels(entities,model,layout,envelope,side,clearHeight);
    if(clearHeight>0)elevationPosts(layout,model,side,envelope).forEach(post=>{const section=postSection(model,post),center=horizontalAxis==='x'?num(post.x,0):num(post.z,0),postWidth=horizontalAxis==='x'?section.x:section.z;entities.push(rect(center-postWidth/2,0,postWidth,Math.max(1,num(post.height,height)),'post',{postId:post.id,shared:Boolean(post.sharedBoundary||post.sharedAcrossRows)}));});
    const modules=Array.isArray(layout.modules)?layout.modules:[],boundaries=horizontalAxis==='x'?Array.from(new Set(modules.flatMap(m=>[num(m.outerMinX,NaN),num(m.outerMaxX,NaN)]).filter(Number.isFinite).map(v=>Math.round(v*1000)/1000))).sort((a,b)=>a-b):Array.from(new Set(modules.flatMap(m=>[num(m.rearOuterZ,NaN),num(m.frontOuterZ,NaN)]).filter(Number.isFinite).map(v=>Math.round(v*1000)/1000))).sort((a,b)=>a-b);boundaries.forEach(value=>entities.push(line(value,0,value,clearHeight,'module-boundary',{side})));
    const facadeId=side==='rear'?'front':(side==='front'?'back':side);addFacadeProfiles(entities,model,facadeId,horizontalMin,horizontalMax,clearHeight);addInteractionZones(entities,model,contract,side);
    entities.push(dim('x',horizontalMin,horizontalMax,-Math.max(180,height*.06),`${Math.round(horizontalMax-horizontalMin)} mm`,{kind:'overall-horizontal',side}));entities.push(dim('y',0,height,horizontalMax+Math.max(180,(horizontalMax-horizontalMin)*.04),`${Math.round(height)} mm`,{kind:'overall-height',side}));
    const title=side==='rear'?'Arka Cephe':(side==='front'?'Ön Görünüş':(side==='left'?'Sol Görünüş':'Sağ Görünüş'));return {id:side,title,axis:`${horizontalAxis}y`,bounds:{minX:horizontalMin,maxX:horizontalMax,minY:0,maxY:height},entities};
  }

  function inputContract(model) {
    const drafts = model.inputDrafts && typeof model.inputDrafts === 'object' ? model.inputDrafts : {};
    const width = String(drafts.width == null ? model.width || '' : drafts.width);
    const depth = String(drafts.depth == null ? model.depth || '' : drafts.depth);
    const height = String(drafts.height == null ? model.height || '' : drafts.height);
    let topology = 'TEK MODÜL';
    if (width.includes(':') || depth.includes(':')) topology = 'ÖN / ARKA SIRA (:)' + (/:NO$/i.test(width) || /:NO$/i.test(depth) ? ' · :NO' : '');
    else if (width.includes(';') || depth.includes(';')) topology = 'YAN YANA (;)';
    if (/;NO$/i.test(depth)) topology += ' · NO';
    return { width, depth, height, topology };
  }

  function build(snapshot, context) {
    const ctx = context && context.projectInfo ? context : { projectInfo: context || {}, contract: null };
    const projectInfo = ctx.projectInfo || {};
    const contract = ctx.contract || null;
    const source = snapshot && snapshot.snapshot ? snapshot.snapshot : snapshot;
    if (!source || source.schema !== 'p3dv-host-snapshot-v1' || !source.modelState) throw new Error('GALAXY_TECHNICAL2D_SNAPSHOT_INVALID');
    const model = clone(source.modelState);
    if (model.productGroup !== PRODUCT_GROUP) throw new Error('GALAXY_TECHNICAL2D_PRODUCT_MISMATCH');
    const layout = buildLayout(model);
    if (!layout || !layout.valid) {
      const errors = layout && Array.isArray(layout.errors) ? layout.errors.slice() : ['GALAXY_LAYOUT_INVALID'];
      return Object.freeze({ schema: SCHEMA, productId: PRODUCT_ID, productGroup: PRODUCT_GROUP, valid: false, errors, sourceSchema: source.schema, modelState: model });
    }
    const envelope = envelopeOf(layout, model);
    const input = inputContract(model);
    const profileCount = Object.values(model.facadeProfiles || {}).reduce((sum, list) => sum + (Array.isArray(list) ? list.length : 0), 0);
    const rows = Array.isArray(layout.rows) && layout.rows.length ? layout.rows.length : 1;
    const summary = Object.freeze({
      width: Math.round(envelope.maxX - envelope.minX),
      depth: Math.round(envelope.maxZ - envelope.minZ),
      height: Math.round(num(model.height, layout.height)),
      moduleCount: Array.isArray(layout.modules) ? layout.modules.length : Math.max(1, Math.round(num(model.systemCount, 1))),
      rowCount: rows,
      panelCount: (Array.isArray(layout.modules) ? layout.modules : []).reduce((sum, module) => sum + Math.max(0, Math.round(num(module.panelCount, 0))), 0),
      postCount: Array.isArray(layout.posts) ? layout.posts.length : 0,
      beamCount: Array.isArray(layout.beams) ? layout.beams.length : 0,
      profileCount,
      sharedPostCount: (Array.isArray(layout.posts) ? layout.posts : []).filter(post => post.sharedBoundary || post.sharedAcrossRows).length,
      rowAlignment: layout.rowAlignment || model.rowAlignment || 'left',
      panelCollection: layout.panelCollection || model.panelCollection || 'center',
      input
    });
    const views = Object.freeze([
      buildElevation(model, layout, envelope, 'rear', contract),
      buildTopView(model, layout, envelope),
      buildElevation(model, layout, envelope, 'left', contract),
      buildElevation(model, layout, envelope, 'front', contract),
      buildElevation(model, layout, envelope, 'right', contract)
    ].map(view=>root.PLMROrthographicAxes.project(view)));
    return Object.freeze({
      schema: SCHEMA,
      productId: PRODUCT_ID,
      productGroup: PRODUCT_GROUP,
      productLabel: 'Bioclimatic (Tilt)',
      valid: true,
      errors: Object.freeze([]),
      sourceSchema: source.schema,
      sourceProductInputSchema: source.productInputSchema || '',
      capturedAt: source.capturedAt || '',
      projectInfo: Object.freeze({ ...(projectInfo || {}) }),
      interactionContractSchema: contract && contract.schema || '',
      modelState: Object.freeze(model),
      layout: Object.freeze(clone(layout)),
      envelope: Object.freeze(envelope),
      summary,
      views
    });
  }

  const api = Object.freeze({ SCHEMA, PRODUCT_ID, PRODUCT_GROUP, PROFILE, build });
  root.PulumurGalaxy2DAdapter = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
