(function (root) {
  'use strict';

  const VERSION = 'PLMR V.34';
  const PRODUCT_IDS = Object.freeze({
    sliding: 'SLIDING',
    guillotine: 'GUILLOTINE',
    zip: 'ZIP_SCREEN',
    door: 'DOOR',
    fixed: 'FIXED_JOINERY',
    folding: 'FOLDING_GLASS', balcony:'FOLDING_GLASS'
  });

  const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const upper = value => String(value == null ? '' : value).trim().toUpperCase();

  function productOpenState(model, zoneId, slot) {
    const key = slot === 'zip' ? `zip:${zoneId}` : zoneId;
    const states = model && model.productOpenStates && typeof model.productOpenStates === 'object' ? model.productOpenStates : {};
    if (Object.prototype.hasOwnProperty.call(states, key)) return Boolean(states[key]);
    return Boolean(model && model.productsOpen);
  }

  function canonicalToNative(type, placement, zone, width, height, context) {
    const identity = root.PulumurP3DVProductIdentity;
    if (!identity || typeof identity.mapFacadeToNative2D !== 'function') throw new Error('P3DV_PRODUCT_DATA_CONTRACT_MISSING');
    const native=identity.mapFacadeToNative2D(type==='balcony'?'folding':type, placement, { zone, width, height, ...(context || {}) });return type==='balcony'?{...native,displayProductName:'KATLANIR CAM'}:native;
  }

  // Must stay numerically identical to P3DV fitProductZone()/fitZipProductZone().
  // This is a projection box, not a geometry engine and not authoritative state.
  function projectionBox(zone, placement, slot, x, y, width, height) {
    const w = Math.max(1, finite(width, finite(zone && zone.width, 1)));
    const h = Math.max(1, finite(height, finite(zone && zone.height, 1)));
    const baseX = finite(x, 0), baseY = finite(y, 0);
    if (slot !== 'zip') return { x: baseX + 2.5, y: baseY + 2.5, width: Math.max(1, w - 5), height: Math.max(1, h - 5) };
    const location = upper(placement && placement.placementLocation);
    if (location !== 'FRONT OF POSTS') return { x: baseX + 1.5, y: baseY + 1.5, width: Math.max(1, w - 3), height: Math.max(1, h - 3) };
    const left = Math.max(0, finite(zone && zone.leftBoundaryWidth, 0));
    const right = Math.max(0, finite(zone && zone.rightBoundaryWidth, 0));
    return { x: baseX - left, y: baseY, width: Math.max(1, w + left + right), height: Math.max(1, h + 150) };
  }

  function nativeDrawing(type, nativeProject) {
    if((type==='sliding'||type==='guillotine')&&root.PLMRV53FacadeAdapter) return root.PLMRV53FacadeAdapter.drawing2D(type,nativeProject);
    const registry = root.PulumurProductRegistry;
    const productId = PRODUCT_IDS[type];
    const adapter = registry && typeof registry.getProduct === 'function' ? registry.getProduct(productId) : null;
    if (!adapter || typeof adapter.buildPlacementGeometry !== 'function') throw new Error(`TECHNICAL2D_NATIVE_ADAPTER_MISSING:${productId}`);
    const project = { ...nativeProject, productType: productId };
    return adapter.buildPlacementGeometry({
      productConfig: project,
      hostProduct: 'P3DV',
      drawingScope: 'PLACEMENT',
      instanceId: String(project.id || `${productId}-T2D`),
      placementId: String(project.id || `${productId}-T2D`),
      viewId: 'FRONT'
    });
  }

  function isAxisRect(points) {
    if (!Array.isArray(points) || points.length !== 4) return false;
    const xs = [...new Set(points.map(p => finite(p && p[0], NaN)).filter(Number.isFinite))];
    const ys = [...new Set(points.map(p => finite(p && p[1], NaN)).filter(Number.isFinite))];
    return xs.length === 2 && ys.length === 2;
  }

  function roleFor(entity, type) {
    const layer = upper(entity && entity.layer);
    if (entity && entity.type === 'hatch') return type === 'zip' ? 'product-zip-fabric' : 'product-glass';
    if (layer.includes('CAM')) return type === 'fixed' ? 'product-fixed-glass' : 'product-glass';
    if (layer.includes('SEMBOL')) return 'product-symbol';
    if (layer.includes('BÖLÜCÜ') || layer.includes('BOLUCU') || layer.includes('PROFİL') || layer.includes('PROFIL')) return 'product-mullion';
    if (layer.includes('ÇERÇEVE') || layer.includes('CERCEVE')) return 'product-frame';
    if (type === 'zip') return 'product-zip-box';
    return 'product-panel';
  }

  function inside(value, min, max, tolerance = 0.01) { return value >= min - tolerance && value <= max + tolerance; }

  function convertEntity(out, source, type, x, y, width, height) {
    if (!source) return;
    const layer = upper(source.layer);
    if (layer.includes('ÖLÇÜ') || layer.includes('OLCU')) return;
    const role = String(source && source.semanticRole || '').trim() || roleFor(source, type);
    if (source.type === 'line') {
      const x1 = finite(source.x1), y1 = finite(source.y1), x2 = finite(source.x2), y2 = finite(source.y2);
      if (![x1,y1,x2,y2].every(Number.isFinite)) return;
      if (![x1,x2].some(v => inside(v,0,width)) || ![y1,y2].some(v => inside(v,0,height))) return;
      out.push({ type:'line', x1:x+x1, y1:y+y1, x2:x+x2, y2:y+y2, role, meta:null });
      return;
    }
    if (source.type === 'polyline' && Array.isArray(source.points)) {
      const pts = source.points.map(p => [finite(p && p[0], NaN), finite(p && p[1], NaN)]).filter(p => p.every(Number.isFinite));
      if (pts.length < 2) return;
      if (source.closed && isAxisRect(pts)) {
        const xs=pts.map(p=>p[0]), ys=pts.map(p=>p[1]); const minX=Math.min(...xs), maxX=Math.max(...xs), minY=Math.min(...ys), maxY=Math.max(...ys);
        if (maxX < 0 || minX > width || maxY < 0 || minY > height) return;
        out.push({ type:'rect', x:x+minX, y:y+minY, width:Math.max(1,maxX-minX), height:Math.max(1,maxY-minY), role, meta:null });
      } else {
        for (let i=1;i<pts.length;i+=1) out.push({ type:'line', x1:x+pts[i-1][0], y1:y+pts[i-1][1], x2:x+pts[i][0], y2:y+pts[i][1], role, meta:null });
        if (source.closed) out.push({ type:'line', x1:x+pts[pts.length-1][0], y1:y+pts[pts.length-1][1], x2:x+pts[0][0], y2:y+pts[0][1], role, meta:null });
      }
      return;
    }
    if (source.type === 'hatch' && Array.isArray(source.points)) {
      const pts=source.points.map(p=>[finite(p&&p[0],NaN),finite(p&&p[1],NaN)]).filter(p=>p.every(Number.isFinite));
      if (!pts.length) return; const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]); const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
      out.push({ type:'rect', x:x+minX, y:y+minY, width:Math.max(1,maxX-minX), height:Math.max(1,maxY-minY), role, meta:null });
      return;
    }
    if ((source.type === 'text' || source.type === 'mtext') && source.value) {
      const tx=finite(source.x,NaN),ty=finite(source.y,NaN); if(!Number.isFinite(tx)||!Number.isFinite(ty)||!inside(tx,0,width)||!inside(ty,0,height)) return;
      out.push({ type:'text', x:x+tx, y:y+ty, text:String(source.value), role: source.value === 'MOTOR' ? 'product-motor-label' : 'product-detail-label', meta:null });
    }
  }

  function renderInto(entities, model, zone, placement, slot, x, y, width, height) {
    if (!placement) return { engine:'none', count:0 };
    const type = String(placement.type || (slot === 'zip' ? 'zip' : 'sliding')).toLowerCase();
    const nativeProject = canonicalToNative(type, placement, zone, width, height, { productOpen: productOpenState(model, zone && zone.id, slot) });
    const drawing = nativeDrawing(type, nativeProject);
    const before = entities.length;
    (drawing && Array.isArray(drawing.entities) ? drawing.entities : []).forEach(item => convertEntity(entities, item, type, x, y, width, height));
    for(let i=before;i<entities.length;i++){const e=entities[i];e.meta={kind:'product-detail',zoneId:zone.id,productType:type,positionCode:placement.positionCode,slot,facadeId:zone.facadeId};if(Number(zone.mountRotation)===180){if(e.type==='rect')e.x=2*x+width-e.x-e.width;else if(e.type==='line'){e.x1=2*x+width-e.x1;e.x2=2*x+width-e.x2;}else if(e.type==='text')e.x=2*x+width-e.x;}}
    entities.push({type:'text',x:x+width/2,y:y+height+90,text:placement.positionCode||'',role:'product-detail-label',meta:{kind:'product-code',productType:type,positionCode:placement.positionCode,zoneId:zone.id,slot}});
    return { engine: PRODUCT_IDS[type], count: entities.length-before, nativeProject };
  }

  const api = Object.freeze({ VERSION, PRODUCT_IDS, productOpenState, projectionBox, canonicalToNative, nativeDrawing, renderInto });
  root.PulumurTechnical2DFacadeNativeReuse = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
