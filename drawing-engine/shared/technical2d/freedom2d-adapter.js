(function (root) {
  'use strict';

  const SCHEMA = 'plmr-freedom-technical2d-projection-v14.23';
  const PRODUCT_ID = 'P3DV_ROLLING_ROOF';
  const PRODUCT_GROUP = 'b-cube';
  // Rolling Roof / Freedom product-specific visible sections.  Geometry still
  // comes from the canonical P3DVFreedomMultiPosition engine below; these
  // values are only used by the 2D projection for section footprints.
  const PROFILE = Object.freeze({
    post: Object.freeze({ x: 170, z: 170 }),
    beam: Object.freeze({ vertical: 260, thickness: 170 }),
    frontRearFootprint: 100,
    sideFootprint: 100,
    gutterWidth: 0,
    gutterClearance: 0
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
    const measured=new Set();contractZones(contract, side).forEach(zone => {
      const axis = zone.axis === 'z' ? 'z' : 'x';
      const center = axis === 'x' ? num(zone.cx, 0) : num(zone.cz, 0);
      const x = center - Math.max(1, num(zone.width, 0)) / 2;
      const y = num(zone.bottomY, -height / 2) + height / 2;
      const w = Math.max(1, num(zone.width, 0));
      const h = Math.max(1, num(zone.height, 0));
      const zoneMeta = { kind: 'zone', zoneId: zone.id, facadeId: zone.facadeId, zone: clone(zone), interactive: true };
      entities.push(rect(x, y, w, h, 'zone-area', zoneMeta));
      const measure=zone.postMeasure||{id:zone.id,cx:zone.cx,cz:zone.cz,width:w,bottomY:zone.bottomY};if((!root.PLMRV12Core||zone.postBounded)&&!measured.has(measure.id)){measured.add(measure.id);const start=measure[axis==='x'?'cx':'cz']-measure.width/2;entities.push(dim('x',start,start+measure.width,measure.bottomY+height/2-Math.max(80,h*.035),`${Math.round(measure.width)}`,{kind:'zone-width',zoneId:zone.id,facadeId:zone.facadeId,zone:clone(zone),interactive:true}));}

      entities.push(dim('y',y,y+h,x-90,String(Math.round(h)),{kind:'zone-height',zoneId:zone.id,facadeId:zone.facadeId,zone:clone(zone),interactive:true}));
      const primary=contract?.placements?.[zone.id],zip=contract?.zipPlacements?.[zone.id],codes=[primary?.positionCode,zip?.positionCode].filter(Boolean);
      if(codes.length)entities.push(label(x+w/2,y+h/2,codes.join(' / '),'product-label',{kind:'product-code',productType:primary?.type||'zip',positionCode:codes[0],zoneId:zone.id,slot:primary?'primary':'zip'}));

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
    const engine = root.P3DVFreedomMultiPosition;
    if (!engine || typeof engine.build !== 'function') throw new Error('FREEDOM_CANONICAL_MULTI_POSITION_ENGINE_MISSING');
    const postSections = Array.isArray(model.postSections) && model.postSections.length >= 4
      ? model.postSections.map(section => ({ x: num(section && section.x, PROFILE.post.x), z: num(section && section.z, PROFILE.post.z) }))
      : Array.from({ length: 4 }, () => ({ ...PROFILE.post }));
    const result=engine.build({
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
      beamSection: model.beamSection || { ...PROFILE.beam }
    });
    return result;
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
      const width = (num(profile.width, 100) > 0 ? num(profile.width, 100) : 100);const edit=model.sceneEditor&&model.sceneEditor.members&&model.sceneEditor.members['profile:'+facadeId+':'+profile.id];if(edit?.deleted||edit?.sharedWith)return;const length=edit?.length;
      if(profile.scope){const axis=profile.scope.axis,point=root.PLMRV20Profiles?root.PLMRV20Profiles.position(profile,edit||{}):{x:profile.originX,z:profile.originZ,y:profile.originY},u=axis==='x'?point.x:point.z,y=(Number.isFinite(point.y)?point.y:(profile.scope.bottom+profile.scope.top)/2)+model.height/2,meta={kind:'profile',facadeId,profileId:profile.id,orientation:profile.orientation,profile:clone({...profile,facadeId}),interactive:true};if(profile.orientation==='horizontal'){const w=length||profile.span;entities.push(rect(u-w/2,y-width/2,w,width,'divider-profile',meta));}else{const h=length||profile.scope.top-profile.scope.bottom;entities.push(rect(u-width/2,profile.scope.top+model.height/2-h,width,h,'divider-profile',meta));}return;}
      if (profile.orientation === 'horizontal') {
        const ratio = clamp(num(profile.positionYRatio, 0.5), 0.01, 0.99);
        const y = ratio * clearHeight - width / 2;
        const scopeStart = clamp(num(profile.scopeStartRatio, 0), 0, 1);
        const scopeEnd = clamp(num(profile.scopeEndRatio, 1), 0, 1);
        entities.push(rect(horizontalMin + (scopeStart+scopeEnd)*span/2 - (length||Math.max(1,(scopeEnd-scopeStart)*span))/2, y, length||Math.max(1, (scopeEnd - scopeStart) * span), width, 'divider-profile', { kind: 'profile', facadeId, profileId: profile.id, orientation: 'horizontal', profile: clone({ ...profile, facadeId }), interactive: true }));
      } else {
        const ratio = clamp(num(profile.positionRatio, 0.5), 0.0001, 0.9999);
        const moved=facadeId==='left'||facadeId==='right'?edit?.positionZ:edit?.positionX;const x = (Number.isFinite(moved)?moved:horizontalMin + ratio * span)+(Number((facadeId==='left'||facadeId==='right')?edit?.sharedZ:edit?.sharedX)||0)-width / 2;
        entities.push(rect(x, length?clearHeight-length:0, width, length||clearHeight, 'divider-profile', { kind: 'profile', facadeId, profileId: profile.id, orientation: 'vertical', profile: clone({ ...profile, facadeId }), interactive: true }));
      }
    });
  }

  function freedomPanelProjection(module, model) {
    const C=root.PLMRBioclimaticRoof,cfg=C.config(model,module.moduleIndex),oriented=C.orientModule(module,cfg.rotation),lay=C.layout(oriented,cfg.id,cfg.open?1:0),a=lay.aperture;
    return {...lay,rotation:cfg.rotation,physical:C.aperture(module),oriented,zSign:a.sign,centerZ:a.centerZ,centerX:a.centerX,panelCount:lay.count,panelLength:a.width,opened:cfg.open,edges:lay.centers.map((z,i)=>({panelIndex:i,z}))};
  }

  function roofPoint(p,x,z){if(!p.rotation)return [x,z];const t=p.rotation*Math.PI/180,c=Math.cos(t),s=Math.sin(t);return [p.physical.centerX+c*x+s*z,p.physical.centerZ-s*x+c*z];}
  function roofTopEntity(p,e){if(!p.rotation)return e;if(e.type==='line'){const a=roofPoint(p,e.x1,e.y1),b=roofPoint(p,e.x2,e.y2);return {...e,x1:a[0],y1:a[1],x2:b[0],y2:b[1]};}if(e.type==='rect'){const pts=[[e.x,e.y],[e.x+e.width,e.y],[e.x,e.y+e.height],[e.x+e.width,e.y+e.height]].map(q=>roofPoint(p,...q)),xs=pts.map(q=>q[0]),ys=pts.map(q=>q[1]);return {...e,x:Math.min(...xs),y:Math.min(...ys),width:Math.max(...xs)-Math.min(...xs),height:Math.max(...ys)-Math.min(...ys)};}return e;}
  function roofSupport(p,height){return root.PLMRBioclimaticRoof.supportSpec(p.oriented,p.product.id,root.PLMRBioclimaticRoof.panelSweepRadius(p.panelDepth),height);}
  function addFreedomTopStructure(entities, model, layout) {
    const beamThickness = Math.max(20, num(model.beamSection && model.beamSection.thickness, PROFILE.beam.thickness));
    (Array.isArray(layout.beams) ? layout.beams : []).forEach(beam => {
      if (beam.kind === 'width') {
        const inward = Number.isFinite(Number(beam.inwardSign)) ? Number(beam.inwardSign) : (beam.row === 'rear' ? 1 : -1);
        const z = num(beam.z, 0) + inward * beamThickness / 2;
        entities.push(rect(num(beam.x, 0) - num(beam.length, 0) / 2, z - beamThickness / 2, num(beam.length, 0), beamThickness, 'frame-profile', { productKind: 'rolling-roof', beamId: beam.id, beamKind: 'width', moduleIndex: beam.moduleIndex, row: beam.row }));
      } else {
        entities.push(rect(num(beam.x, 0) - beamThickness / 2, num(beam.z, 0) - num(beam.length, 0) / 2, beamThickness, num(beam.length, 0), 'frame-profile', { productKind: 'rolling-roof', beamId: beam.id, beamKind: 'depth', lineIndex: beam.lineIndex }));
      }
    });
    (Array.isArray(layout.modules) ? layout.modules : []).forEach(module => {
      const zSign = num(module.rearToFrontSign, 1) < 0 ? -1 : 1;
      const centerZ = num(module.centerZ, 0), centerT = zSign * centerZ;
      const gutterDepth = Math.max(200, num(module.depth, 0)), half = gutterDepth / 2;
      const gutterCross = 170;
      const rearEdge = zSign * (centerT - half), frontEdge = zSign * (centerT + half);
      const gutterLength = Math.max(1, num(module.gutterWidth, num(module.clearWidth, 1)));
      const centerX = num(module.centerX, 0);
      const rearY = zSign > 0 ? rearEdge : rearEdge - gutterCross;
      const frontY = zSign > 0 ? frontEdge - gutterCross : frontEdge;
      entities.push(rect(centerX - gutterLength / 2, rearY, gutterLength, gutterCross, 'gutter-profile', { productKind: 'rolling-roof', moduleIndex: module.moduleIndex, gutterSide: 'rear' }));
      entities.push(rect(centerX - gutterLength / 2, frontY, gutterLength, gutterCross, 'gutter-profile', { productKind: 'rolling-roof', moduleIndex: module.moduleIndex, gutterSide: 'front' }));
      entities.push(rect(num(module.outerMinX, centerX - gutterLength / 2), centerZ - gutterDepth / 2, gutterCross, gutterDepth, 'gutter-profile', { productKind: 'rolling-roof', moduleIndex: module.moduleIndex, gutterSide: 'left' }));
      entities.push(rect(num(module.outerMaxX, centerX + gutterLength / 2) - gutterCross, centerZ - gutterDepth / 2, gutterCross, gutterDepth, 'gutter-profile', { productKind: 'rolling-roof', moduleIndex: module.moduleIndex, gutterSide: 'right' }));
    });
  }

  function addCanonicalMeasurements(entities,model,contract,side){
    const core=root.PLMRRollingRoofSceneCore;
    for(const m of contract?.measurements||[]){const roof=m.group==='Tavan';if(roof!==(side==='top'))continue;if(!roof)continue;
      const z=(contract.zones||[]).find(z=>m.id.includes(z.id));if(!roof&&(!z||z.facadeId!==SIDE_TO_FACADE[side]))continue;
      // Existing clickable net-width dimensions remain the editing route; the shared 3D definitions supply detail heights, panes and roof spacing.
      if(!roof&&m.id.includes('zone:')&&m.id.endsWith(':width'))continue;
      let a,b;if(roof){a={x:m.a[0],y:m.a[2]};b={x:m.b[0],y:m.b[2]};}
      else{const f=core?.zoneFrame(z),axis=z.axis==='x'?0:2,origin=(z.axis==='x'?z.cx:z.cz)-z.width/2,u=p=>f?p.reduce((sum,v,i)=>sum+(v-f.origin[i])*f.u[i],0)+origin:p[axis];a={x:u(m.a),y:m.a[1]+model.height/2};b={x:u(m.b),y:m.b[1]+model.height/2};}
      const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy);if(len<.001)continue;const nx=-dy/len,ny=dx/len,offset=roof?160:70;
      entities.push({type:'dimension',axis:'aligned',p1:a,p2:b,dimLine:{x:(a.x+b.x)/2+nx*offset,y:(a.y+b.y)/2+ny*offset},measurement:m.value,text:Math.round(m.value)+' mm',role:'dimension',meta:{kind:'canonical-measurement',measurementId:m.id,title:m.title,moduleIndex:m.moduleIndex,sceneObjectId:m.owner,zoneId:z?.id,interactive:false}});
    }
  }

  function addFacadePlan(entities,model,contract,envelope){
    const C=root.PLMRRollingRoofSceneCore;
    for(const [facadeId,profiles]of Object.entries(model.facadeProfiles||{}))for(const p of profiles){const edit=model.sceneEditor?.members?.['profile:'+facadeId+':'+p.id]||{};if(edit.deleted||edit.sharedWith||p.orientation==='horizontal')continue;const axis=p.scope?.axis||(['left','right'].includes(facadeId)?'z':'x'),point=root.PLMRV20Profiles&&p.scope?root.PLMRV20Profiles.position(p,edit):{x:Number.isFinite(edit.positionX)?edit.positionX:p.originX,z:Number.isFinite(edit.positionZ)?edit.positionZ:p.originZ};
      let u=axis==='x'?point.x:point.z,n=axis==='x'?point.z:point.x;
      if(!Number.isFinite(u))u=(axis==='x'?envelope.minX:envelope.minZ)+(p.positionRatio||.5)*(axis==='x'?envelope.maxX-envelope.minX:envelope.maxZ-envelope.minZ);
      if(!Number.isFinite(n))n=facadeId==='front'?envelope.minZ+p.depth/2:facadeId==='back'?envelope.maxZ-p.depth/2:facadeId==='left'?envelope.minX+p.depth/2:envelope.maxX-p.depth/2;
      const span=p.orientation==='horizontal'?(edit.length||p.span||((p.scopeEndRatio??1)-(p.scopeStartRatio??0))*(axis==='x'?envelope.maxX-envelope.minX:envelope.maxZ-envelope.minZ)):p.width;
      entities.push(rect(axis==='x'?u-span/2:n-p.depth/2,axis==='x'?n-p.depth/2:u-span/2,axis==='x'?span:p.depth,axis==='x'?p.depth:span,'divider-profile',{kind:'profile',profileId:p.id,facadeId,orientation:p.orientation,profile:clone(p),interactive:false}));
    }
    for(const z of contract?.zones||[])for(const [slot,store]of [['primary',contract.placements],['zip',contract.zipPlacements]]){const p=store?.[z.id];if(!p||!C)continue;const f=C.zoneFrame(z),a=f.origin,b=a.map((v,i)=>v+f.u[i]*z.width),meta={kind:'product',productType:p.type,slot,zoneId:z.id,positionCode:p.positionCode,zone:clone(z),placement:clone(p)};entities.push(line(a[0],a[2],b[0],b[2],'product-plan',meta));entities.push(label((a[0]+b[0])/2,(a[2]+b[2])/2,p.positionCode||productLabel(p.type),'product-detail-label',{...meta,kind:'product-code'}));}
  }

  function buildTopView(model, layout, envelope, contract) {
    const entities = [];
    const modules = Array.isArray(layout.modules) ? layout.modules : [];
    modules.forEach((module, index) => {
      const minZ = Math.min(num(module.rearOuterZ, 0), num(module.frontOuterZ, 0));
      const maxZ = Math.max(num(module.rearOuterZ, 0), num(module.frontOuterZ, 0));
      const outerMinX = num(module.outerMinX, num(module.clearMinX, 0) - PROFILE.sideFootprint);
      const outerMaxX = num(module.outerMaxX, num(module.clearMaxX, 0) + PROFILE.sideFootprint);
      entities.push(rect(outerMinX, minZ, outerMaxX - outerMinX, maxZ - minZ, 'module-outline', { moduleIndex: index, rowIndex: module.rowIndex }));
    });
    addFreedomTopStructure(entities, model, layout);
    modules.forEach((module, index) => {
      const p=freedomPanelProjection(module,model),a=p.aperture,meta={moduleIndex:index,rowIndex:module.rowIndex,roofProduct:p.product.id,positionCode:model.sceneEditor?.bioCodes?.[index],kind:'roof-zone',interactive:true};
      entities.push(roofTopEntity(p,rect(a.minX,a.minZ,a.width,a.depth,'panel-zone',meta)));
      if(p.glass){for(let i=1;i<p.glass.columns;i++)entities.push(roofTopEntity(p,rect(a.minX+i*p.glass.paneWidth-20,a.minZ,40,a.depth,'divider-profile',meta)));for(let i=1;i<p.glass.rows;i++)entities.push(roofTopEntity(p,rect(a.minX,a.minZ+i*p.glass.paneDepth-20,a.width,40,'divider-profile',meta)));}
      else if(!['sandwich','empty'].includes(p.product.kind))p.edges.forEach(e=>entities.push(roofTopEntity(p,line(a.minX,e.z,a.maxX,e.z,p.retract?'panel-package':'roof-panel',{...meta,panelIndex:e.panelIndex}))));
      const support=roofSupport(p,model.height);for(const x of support.xs)entities.push(roofTopEntity(p,rect(x-20,a.minZ,40,a.depth,'divider-profile',{...meta,kind:'roof-support',interactive:false})));
      const led=!/^(NO|HAYIR|YOK|NONE|-|)$/i.test(String(model.led||'NO'));
      if(led)for(const x of [p.physical.minX-8,p.physical.maxX+8])entities.push(line(x,p.physical.minZ,x,p.physical.maxZ,'led',meta));
      if(led)for(const z of [p.physical.minZ-8,p.physical.maxZ+8])entities.push(line(p.physical.minX,z,p.physical.maxX,z,'led',meta));
      entities.push(label(p.physical.centerX,p.physical.centerZ,`${model.sceneEditor?.bioCodes?.[index]||('M'+(index+1))} · ${p.product.name}`,'module-label',meta));
    });
    (Array.isArray(layout.posts) ? layout.posts : []).forEach(post => {
      const section = postSection(model, post);
      entities.push(rect(num(post.x, 0) - section.x / 2, num(post.z, 0) - section.z / 2, section.x, section.z, 'post', { postId: post.id, shared: Boolean(post.sharedBoundary || post.sharedAcrossRows) }));
    });
    addFacadePlan(entities,model,contract,envelope);
    addCanonicalMeasurements(entities,model,contract,'top');
    const width = envelope.maxX - envelope.minX;
    const depth = envelope.maxZ - envelope.minZ;
    const alignmentSide = model.multiAlignment === 'rear' ? envelope.minZ : envelope.maxZ;
    entities.push(line(envelope.minX, alignmentSide, envelope.maxX, alignmentSide, 'alignment-guide', { alignment: model.multiAlignment === 'rear' ? 'rear' : 'front', rowAlignment: model.rowAlignment || 'left', panelCollection: model.panelCollection || 'center' }));
    entities.push(dim('x', envelope.minX, envelope.maxX, envelope.minZ - Math.max(260, depth * 0.08), `${Math.round(width)} mm`, { kind: 'overall-width' }));
    entities.push(dim('y', envelope.minZ, envelope.maxZ, envelope.maxX + Math.max(260, width * 0.06), `${Math.round(depth)} mm`, { kind: 'overall-depth' }));
    modules.forEach((module, index) => {
      const a = num(module.outerMinX, NaN), b = num(module.outerMaxX, NaN);
      if (Number.isFinite(a) && Number.isFinite(b)) entities.push(dim('x', a, b, envelope.maxZ + 170 + (index % 2) * 90, `${Math.round(b - a)}`, { kind: 'module-width', moduleIndex: index }));
    });
    return { id: 'top', title: 'Üst Görünüş', axis: 'xz', bounds: { minX: envelope.minX, maxX: envelope.maxX, minY: envelope.minZ, maxY: envelope.maxZ }, entities };
  }

  function elevationPosts(layout, model, side, envelope) {
    const posts = Array.isArray(layout.posts) ? layout.posts : [];
    const tolerance = side === 'rear' || side === 'front' ? PROFILE.frontRearFootprint + 40 : PROFILE.sideFootprint + 40;
    if (side === 'rear') return posts.filter(post => Math.abs(num(post.z, 0) - envelope.minZ) <= tolerance);
    if (side === 'front') return posts.filter(post => Math.abs(num(post.z, 0) - envelope.maxZ) <= tolerance);
    if (side === 'left') return posts.filter(post => Math.abs(num(post.x, 0) - envelope.minX) <= tolerance);
    return posts.filter(post => Math.abs(num(post.x, 0) - envelope.maxX) <= tolerance);
  }

  function freedomVisibleModules(layout, side, envelope) {
    const modules = Array.isArray(layout.modules) ? layout.modules : [];
    if (side === 'left') return modules.filter(module => Math.abs(num(module.outerMinX, 0) - envelope.minX) < 1);
    if (side === 'right') return modules.filter(module => Math.abs(num(module.outerMaxX, 0) - envelope.maxX) < 1);
    return modules;
  }

  function addFreedomElevationStructure(entities, model, layout, envelope, side, clearHeight, beamHeight) {
    for(const module of freedomVisibleModules(layout,side,envelope)){const alongX=side==='rear'||side==='front',start=alongX?module.outerMinX:Math.min(module.rearOuterZ,module.frontOuterZ),end=alongX?module.outerMaxX:Math.max(module.rearOuterZ,module.frontOuterZ);entities.push(rect(start,clearHeight,end-start,260,'gutter-profile',{productKind:'rolling-roof',moduleIndex:module.moduleIndex,side}));}
  }

  function addFreedomElevationPanels(entities,model,layout,envelope,side,clearHeight){
    const y=Number(model.height)-75,alongX=side==='rear'||side==='front',axis=alongX?0:1;
    freedomVisibleModules(layout,side,envelope).forEach(module=>{const p=freedomPanelProjection(module,model),a=p.aperture,meta={moduleIndex:module.moduleIndex,roofProduct:p.product.id,side};
      const project=(x,z)=>roofPoint(p,x,z)[axis],segment=(x0,z0,y0,x1,z1,y1,role='roof-panel')=>entities.push(line(project(x0,z0),y0,project(x1,z1),y1,role,meta));
      if(['glass','sandwich'].includes(p.product.kind)){const lo=alongX?p.physical.minX:p.physical.minZ,hi=alongX?p.physical.maxX:p.physical.maxZ;entities.push(rect(lo,y-20,hi-lo,40,'roof-panel',meta));}
      else for(const e of p.edges){const r=p.rotations[e.panelIndex],half=p.panelDepth/2,dz=Math.cos(r)*half,dy=-Math.sin(r)*half;segment(a.minX,e.z-dz,y-dy,a.maxX,e.z+dz,y+dy,p.retract?'panel-package':'roof-panel');}
      if(p.glass){for(let i=1;i<p.glass.columns;i++){const x=a.minX+i*p.glass.paneWidth;segment(x,a.minZ,clearHeight,x,a.maxZ,clearHeight,'divider-profile');const at=project(x,a.centerZ);if(Math.abs(project(x,a.maxZ)-project(x,a.minZ))<.1)entities.push(rect(at-20,clearHeight,40,y+5-clearHeight,'divider-profile',meta));}for(let i=1;i<p.glass.rows;i++){const z=a.minZ+i*p.glass.paneDepth,at=project(a.centerX,z);if(Math.abs(project(a.maxX,z)-project(a.minX,z))<.1)entities.push(rect(at-20,clearHeight,40,y+5-clearHeight,'divider-profile',meta));}}
      const support=roofSupport(p,model.height);for(const x of support.xs){const lo=project(x,a.minZ),hi=project(x,a.maxZ),start=Math.min(lo,hi),width=Math.max(40,Math.abs(hi-lo));entities.push(rect(width===40?start-20:start,support.bottom+model.height/2,width,support.height,'divider-profile',{...meta,kind:'roof-support',interactive:false}));}
    });
  }

  function buildElevation(model, layout, envelope, side, contract) {
    const horizontalAxis = side === 'rear' || side === 'front' ? 'x' : 'z';
    const horizontalMin = horizontalAxis === 'x' ? envelope.minX : envelope.minZ;
    const horizontalMax = horizontalAxis === 'x' ? envelope.maxX : envelope.maxZ;
    const height = Math.max(1, num(model.height, num(layout.height, 0)));
    const beamHeight = 260;
    const clearHeight = Math.max(0, height - beamHeight);
    const entities = [];
    entities.push(rect(horizontalMin, 0, horizontalMax - horizontalMin, height, 'elevation-envelope', { side }));
    addFreedomElevationStructure(entities, model, layout, envelope, side, clearHeight, beamHeight);
    addFreedomElevationPanels(entities, model, layout, envelope, side, clearHeight);
    if (clearHeight > 0) elevationPosts(layout, model, side, envelope).forEach(post => {
      const section = postSection(model, post);
      const center = horizontalAxis === 'x' ? num(post.x, 0) : num(post.z, 0);
      const postWidth = horizontalAxis === 'x' ? section.x : section.z;
      const postHeight = Math.max(1, num(post.height, height));
      entities.push(rect(center - postWidth / 2, num(post.bottom,0), postWidth, postHeight, 'post', { postId: post.id, shared: Boolean(post.sharedBoundary || post.sharedAcrossRows) }));
    });
    const modules = Array.isArray(layout.modules) ? layout.modules : [];
    if (horizontalAxis === 'x') {
      const boundaries = Array.from(new Set(modules.flatMap(module => [num(module.outerMinX, NaN), num(module.outerMaxX, NaN)]).filter(Number.isFinite).map(v => Math.round(v * 1000) / 1000))).sort((a, b) => a - b);
      boundaries.forEach(value => entities.push(line(value, 0, value, clearHeight, 'module-boundary', { side }))); 
    } else {
      const boundaries = Array.from(new Set(modules.flatMap(module => [num(module.rearOuterZ, NaN), num(module.frontOuterZ, NaN)]).filter(Number.isFinite).map(v => Math.round(v * 1000) / 1000))).sort((a, b) => a - b);
      boundaries.forEach(value => entities.push(line(value, 0, value, clearHeight, 'module-boundary', { side }))); 
    }
    const facadeId = side === 'rear' ? 'front' : (side === 'front' ? 'back' : side);
    addFacadeProfiles(entities, model, facadeId, horizontalMin, horizontalMax, clearHeight);
    addInteractionZones(entities, model, contract, side);
    addCanonicalMeasurements(entities,model,contract,side);
    entities.push(dim('x', horizontalMin, horizontalMax, -Math.max(180, height * 0.06), `${Math.round(horizontalMax - horizontalMin)} mm`, { kind: 'overall-horizontal', side }));
    entities.push(dim('y', 0, height, horizontalMax + Math.max(180, (horizontalMax - horizontalMin) * 0.04), `${Math.round(height)} mm`, { kind: 'overall-height', side }));
    const title = side === 'rear' ? 'Arka Cephe' : (side === 'front' ? 'Ön Görünüş' : (side === 'left' ? 'Sol Görünüş' : 'Sağ Görünüş'));
    return { id: side, title, axis: `${horizontalAxis}y`, bounds: { minX: horizontalMin, maxX: horizontalMax, minY: 0, maxY: height }, entities };
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

  // One ephemeral projection per owner per export/render; the snapshot remains the sole physical state.
  function localOwnerProjection(copy,model,context){
    const cache=context.ownerProjections||(context.ownerProjections=new Map());if(cache.has(copy.id))return cache.get(copy.id);
    const spec={...clone(copy.spec),panelCount:copy.spec.lamellaCount,sketchWalls:[],parapetWalls:model.sketchWalls||[],parapetOwner:copy.id,sceneEditor:{...clone(copy.spec.sceneEditor||{}),roofCopies:[],roofPose:{},mainDeleted:false,dimensionUnits:clone(model.sceneEditor?.dimensionUnits||{mm:true,inch:false})}};
    const projection=build({schema:'p3dv-host-snapshot-v1',modelState:spec},{projectInfo:context.projectInfo,ownerId:copy.id,contract:context.contract,localOwner:true});cache.set(copy.id,projection);return projection;
  }

  // Canonical placement plan, plus product-local fabrication elevations.
  function addSketchProjection(view, model, context) {
    const core=root.PLMRRollingRoofSketchCore,C=root.PLMRRollingRoofSceneCore;if(!core)return view;
    const items=[],state=model.sceneEditor||{},pose=C?C.pose(state.roofPose):{x:0,y:0,z:0,angle:0},g=num(state.groundY,-num(model.height,0)/2);
    const local=p=>{if(view.id==='top')return [p[0],p[2]];const q=C?C.vector([p[0]-pose.x,p[1]-g-pose.y,p[2]-pose.z],-pose.angle):[p[0],p[1]+num(model.height,0)/2,p[2]];return [view.id==='left'||view.id==='right'?q[2]:q[0],q[1]];};
    const hull=ps=>{const q=ps.sort((a,b)=>a[0]-b[0]||a[1]-b[1]).filter((p,i,a)=>!i||Math.hypot(p[0]-a[i-1][0],p[1]-a[i-1][1])>.001),cross=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]),lo=[],hi=[];for(const p of q){while(lo.length>1&&cross(lo.at(-2),lo.at(-1),p)<=0)lo.pop();lo.push(p);}for(const p of q.slice().reverse()){while(hi.length>1&&cross(hi.at(-2),hi.at(-1),p)<=0)hi.pop();hi.push(p);}return lo.slice(0,-1).concat(hi.slice(0,-1));};
    for(const w of model.sketchWalls||[])for(const cell of core.cells(w)){const ps=[];for(const x of [cell.min[0],cell.max[0]])for(const y of [cell.min[1],cell.max[1]])for(const z of [cell.min[2],cell.max[2]]){const p=C?C.wallPoint(w,[x,y,z]):[x,y,z];ps.push(local(p));}const hs=hull(ps),meta={kind:'sketch-wall',wallId:w.id,cellId:cell.id,depth:cell.depth};for(let i=0;i<hs.length;i++){const a=hs[i],b=hs[(i+1)%hs.length];items.push(line(...a,...b,'frame-profile',meta));}}
    let entities=state.mainDeleted?[]:view.entities;
    if(C&&view.id==='top'){
      const transform=(es,p,id,localBounds)=>{const convert=(x,z)=>{const q=C.point([x,0,z],p,model.height,g);return [q[0],q[2]];},out=[];for(const e of es){const meta={...(e.meta||{}),sceneObjectId:id};if(e.type==='rect'){const ps=[[e.x,e.y],[e.x+e.width,e.y],[e.x+e.width,e.y+e.height],[e.x,e.y+e.height]].map(p=>convert(...p));for(let i=0;i<4;i++)out.push(line(...ps[i],...ps[(i+1)%4],e.role,e.meta?.kind==='roof-zone'?{...meta,interactive:i===0,roofPolygon:i===0?ps:undefined}:meta));}else if(e.type==='line')out.push(line(...convert(e.x1,e.y1),...convert(e.x2,e.y2),e.role,meta));else if(e.type==='text')out.push(label(...convert(e.x,e.y),e.text,e.role,meta));else if(e.type==='dimension'){if(e.axis==='aligned'){const pt=q=>{const t=convert(q.x,q.y);return{x:t[0],y:t[1]};};out.push({...e,p1:pt(e.p1),p2:pt(e.p2),dimLine:pt(e.dimLine),meta});continue;}const bounds=localBounds||view.bounds,anchor=e.axis==='x'?(e.offset<bounds.minY?bounds.minY:bounds.maxY):(e.offset<bounds.minX?bounds.minX:bounds.maxX),a=e.axis==='x'?convert(e.start,anchor):convert(anchor,e.start),b=e.axis==='x'?convert(e.end,anchor):convert(anchor,e.end),d=e.axis==='x'?convert((e.start+e.end)/2,e.offset):convert(e.offset,(e.start+e.end)/2);out.push({type:'dimension',axis:'aligned',p1:{x:a[0],y:a[1]},p2:{x:b[0],y:b[1]},dimLine:{x:d[0],y:d[1]},measurement:Math.abs(e.end-e.start),text:e.text,role:'dimension',meta});}}return out;};
      // Leave the zero-pose native top view untouched to preserve its editable zones/dimensions.
      entities=pose.x||pose.z||pose.angle?transform(entities,pose,'roof-main',view.bounds):entities.slice();
      for(const copy of state.roofCopies||[]){const projection=localOwnerProjection(copy,model,context);const top=projection.valid&&projection.views.find(v=>v.id==='top');if(top)entities.push(...transform(top.entities,C.pose(copy.pose),copy.id,top.bounds));}
      const owners=[...(state.mainDeleted?[]:[{pose,spec:model}]),...(state.roofCopies||[])],points=owners.flatMap(o=>[-1,1].flatMap(x=>[-1,1].map(z=>{const q=C.point([x*o.spec.width/2,0,z*o.spec.depth/2],C.pose(o.pose),o.spec.height,g);return [q[0],q[2]];})));if(points.length&&!context.localOwner&&((state.roofCopies||[]).length||pose.x||pose.z||pose.angle||state.mainDeleted)){const x0=Math.min(...points.map(p=>p[0])),x1=Math.max(...points.map(p=>p[0])),z0=Math.min(...points.map(p=>p[1])),z1=Math.max(...points.map(p=>p[1]));items.push(dim('x',x0,x1,z1+600,Math.round(x1-x0)+' mm',{kind:'total-width'}),dim('y',z0,z1,x1+600,Math.round(z1-z0)+' mm',{kind:'total-depth'}));}
      for(const t of state.templates||[]){const ps=C.footprint(t,g);for(let i=0;i<4;i++){const a=ps[i],b=ps[(i+1)%4];items.push(line(a[0],a[2],b[0],b[2],'alignment-guide',{sceneObjectId:t.id}));}items.push(label(ps[0][0],ps[0][2],t.angle+'°','module-label',{sceneObjectId:t.id}));}
    }
    if(C&&view.id!=='top'&&(state.roofCopies||[]).length){
      let cursor=state.mainDeleted?view.bounds.minX:view.bounds.maxX+800;
      for(const copy of state.roofCopies||[]){
        const projection=localOwnerProjection(copy,model,context);
        const localView=projection.valid&&projection.views.find(v=>v.id===view.id);if(!localView)continue;
        const dx=cursor-localView.bounds.minX,meta={kind:'owner-label',sceneObjectId:copy.id};
        for(const e of localView.entities){const q={...clone(e),meta:{...(e.meta||{}),sceneObjectId:copy.id}};if(q.type==='rect'||q.type==='text')q.x+=dx;else if(q.type==='line'){q.x1+=dx;q.x2+=dx;}else if(q.type==='dimension'){if(q.referenceBounds){q.referenceBounds.minX+=dx;q.referenceBounds.maxX+=dx;}if(q.axis==='aligned'){for(const key of ['p1','p2','dimLine'])q[key].x+=dx;}else if(q.axis==='x'){q.start+=dx;q.end+=dx;}else q.offset+=dx;}entities.push(q);}
        entities.push(label(cursor+(localView.bounds.maxX-localView.bounds.minX)/2,localView.bounds.maxY+240,'POZ '+(copy.spec.pozNo||copy.id)+' · '+copy.pose.angle+'° · Yerel eksenler','module-label',meta));
        cursor+=localView.bounds.maxX-localView.bounds.minX+800;
      }
      if(!state.mainDeleted)entities.push(label((view.bounds.minX+view.bounds.maxX)/2,view.bounds.maxY+240,'POZ '+(model.pozNo||1)+' · Yerel eksenler','module-label',{kind:'owner-label',sceneObjectId:'roof-main'}));
    }
    entities=[...entities,...items];const bounds={...view.bounds};for(const e of entities){const points=e.type==='line'?[[e.x1,e.y1],[e.x2,e.y2]]:e.type==='rect'?[[e.x,e.y],[e.x+e.width,e.y+e.height]]:e.type==='text'?[[e.x,e.y]]:[];for(const p of points){bounds.minX=Math.min(bounds.minX,p[0]);bounds.maxX=Math.max(bounds.maxX,p[0]);bounds.minY=Math.min(bounds.minY,p[1]);bounds.maxY=Math.max(bounds.maxY,p[1]);}}
    const changed=state.roofCopies&&state.roofCopies.length||pose.x||pose.z||pose.angle||state.templates&&state.templates.length;
    return {...view,title:view.id==='top'&&changed?'Yerleşim · Üst Görünüş':view.id!=='top'&&(pose.angle||pose.x||pose.y||pose.z)?view.title+' · Ürün yerel eksenleri':view.title,bounds,entities};
  }

  function presentDimensions(view,model){const units=model.sceneEditor&&model.sceneEditor.dimensionUnits;if(!units)return view;const text=value=>{if(root.PLMRUnits)return root.PLMRUnits.formatMeasurement(value,units,false);const out=[];if(units.mm)out.push(Math.round(value)+' mm');if(units.inch)out.push((value/25.4).toFixed(2)+'"');return out.join(' - ');};return {...view,entities:view.entities.filter(e=>!(!units.mm&&!units.inch&&(e.type==='dimension'||['overall-width','overall-depth','overall-height','module-width','zone-width','zone-height','total-width','total-depth'].includes(e.meta&&e.meta.kind)))).map(e=>{if(e.type==='dimension')return {...e,text:text(e.axis==='aligned'?e.measurement:Math.abs(e.end-e.start))};if(e.type==='text'&&e.meta&&['overall-width','overall-depth','overall-height','module-width','zone-width','zone-height','total-width','total-depth'].includes(e.meta.kind)){const value=parseFloat(e.text);if(Number.isFinite(value))return {...e,text:text(value)};}return e;})};}
  function filterPositionDimensions(view,visibility){const d=visibility||{};return {...view,entities:view.entities.filter(e=>{const m=e.meta||{},kind=m.kind||'';if(e.type==='text'&&(kind==='product-code'||e.role==='module-label'&&m.roofProduct))return d.information!==false&&d.infoIds?.[m.positionCode]!==false;if(m.measurementId&&d.hiddenIds?.[m.measurementId])return false;const owner=m.sceneObjectId||'roof-main',p=d.byPosition?.[owner+':'+(m.moduleIndex||0)]||{};let key;if(kind==='canonical-measurement')return d.intermediate!==false&&p.visible!==false&&p.intermediate!==false;if(kind==='zone-width'||kind==='zone-height')return (d.main!==false||d.intermediate!==false)&&p.visible!==false;if(kind.startsWith('total-'))return d.main!==false&&d.total!==false;if(kind==='overall-width'||kind==='module-width')key='width';else if(kind==='overall-depth')key='depth';else if(kind==='overall-height')key='height';else if(kind==='overall-horizontal')key=['left','right'].includes(m.side)?'depth':'width';else if(kind.startsWith('zone-')||e.role==='product-dimension')key='intermediate';else if(e.type==='dimension')key='intermediate';else return true;return p.visible!==false&&p[key]!==false&&(key==='intermediate'?d.intermediate!==false:d.main!==false&&d.positions!==false);})};}
  function build(snapshot, context) {
    const ctx = context && (context.projectInfo || context.contract || context.localOwner) ? {...context,ownerProjections:new Map()} : { projectInfo: context || {}, contract: null };
    const projectInfo = ctx.projectInfo || {};
    const contract = ctx.contract?.owners?.find(o=>o.id===(ctx.ownerId||'roof-main')) || ctx.contract || null;
    const source = snapshot && snapshot.snapshot ? snapshot.snapshot : snapshot;
    ctx.dimensionVisibility=source?.dimensionVisibility;
    if (!source || source.schema !== 'p3dv-host-snapshot-v1' || !source.modelState) throw new Error('FREEDOM_TECHNICAL2D_SNAPSHOT_INVALID');
    const model = clone(source.modelState);
    if (model.productGroup !== PRODUCT_GROUP) throw new Error('FREEDOM_TECHNICAL2D_PRODUCT_MISMATCH');
    const layout = clone(buildLayout(model));
    if (!layout || !layout.valid) {
      const errors = layout && Array.isArray(layout.errors) ? layout.errors.slice() : ['FREEDOM_LAYOUT_INVALID'];
      return Object.freeze({ schema: SCHEMA, productId: PRODUCT_ID, productGroup: PRODUCT_GROUP, valid: false, errors, sourceSchema: source.schema, modelState: model });
    }
    const envelope = envelopeOf(layout, model);
    const edits=model.sceneEditor&&model.sceneEditor.members||{};
    if(root.PLMRV12Core){root.PLMRV12Core.applyPosts(layout,edits);layout.posts=layout.posts.map(p=>({...p,x:p.x+(Number(edits['post:'+p.id]?.sharedX)||0),z:p.z+(Number(edits['post:'+p.id]?.sharedZ)||0)}));}
    layout.posts=(layout.posts||[]).filter(p=>!edits['post:'+p.id]?.deleted&&!edits['post:'+p.id]?.sharedWith).map(p=>({...p,...root.PLMRRollingRoofParapetCore.postSpan(p,model,model.parapetWalls||model.sketchWalls||[],model.parapetOwner||'roof-main',edits['post:'+p.id]||{})}));
    layout.beams=(layout.beams||[]).filter(b=>!edits['beam:'+b.id]?.deleted).map(b=>{const length=edits['beam:'+b.id]?.length;if(!length)return b;return {...b,length,...(b.kind==='width'?{}:{startZ:num(b.z,0)-length/2,endZ:num(b.z,0)+length/2})};});
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
      buildTopView(model, layout, envelope, contract),
      buildElevation(model, layout, envelope, 'left', contract),
      buildElevation(model, layout, envelope, 'front', contract),
      buildElevation(model, layout, envelope, 'right', contract)
    ].map(view=>({...view,entities:view.entities.map(e=>({...e,...(e.type==='dimension'&&e.axis!=='aligned'?{referenceBounds:{...view.bounds}}:{}),meta:{...(e.meta||{}),sceneObjectId:ctx.ownerId||'roof-main'}}))})).map(view=>filterPositionDimensions(presentDimensions((()=>{const next=addSketchProjection(view,model,ctx);return ctx.localOwner?{...next,entities:next.entities.map(e=>({...e,meta:{...(e.meta||{}),sceneObjectId:ctx.ownerId}}))}:next;})(),model),source.dimensionVisibility)).map(view=>ctx.localOwner?view:root.PLMROrthographicAxes.project(view)));
    return Object.freeze({
      schema: SCHEMA,
      productId: PRODUCT_ID,
      productGroup: PRODUCT_GROUP,
      productLabel: 'PLMR Bioclimatic',
      coverage:{owners:[...(model.sceneEditor?.mainDeleted?[]:['roof-main']),...(model.sceneEditor?.roofCopies||[]).map(o=>o.id)],walls:(model.sketchWalls||[]).map(w=>w.id),projection:'WORLD_PLACEMENT_PLAN_AND_PER_OWNER_LOCAL_FABRICATION_ELEVATIONS'},
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
      productDetails:ctx.localOwner?null:root.PLMRV24Details2D?.build(model,ctx.contract||contract)||null,
      sheetContract:clone(ctx.contract),dimensionVisibility:clone(source.dimensionVisibility||{}),
      views
    });
  }

  const api = Object.freeze({ SCHEMA, PRODUCT_ID, PRODUCT_GROUP, PROFILE, build });
  root.PulumurFreedom2DAdapter = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
