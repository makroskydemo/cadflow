(function (root) {
  'use strict';

  const LAYER_STYLE = {
    // Preview/PDF renkleri DXF ACI renkleriyle eşleştirildi.
    OUTLINE: { stroke: '#000000', width: 1.2, aci: 7 },
    PROFILE: { stroke: '#ff0000', width: 1.25, aci: 1 },
    FABRIC: { stroke: '#ffbf00', width: 0.9, dash: '14 10', aci: 42 },
    RAY: { stroke: '#0000ff', width: 1.15, aci: 5 },
    'Ray - Yan Görünüş': { stroke: '#0000ff', width: 1.15, aci: 5 },
    'Ray - Üst Görünüş': { stroke: '#0000ff', width: 1.15, aci: 5 },
    'Ray - Ön Görünüş': { stroke: '#0000ff', width: 1.15, aci: 5 },
    POST: { stroke: '#ff00ff', width: 1.15, aci: 6 },
    'Dikme - Yan Görünüş': { stroke: '#ff00ff', width: 1.15, aci: 6 },
    WALL: { stroke: '#808080', width: 0.65, dash: '18 12', aci: 8 },
    'Duvar - Yan Görünüş': { stroke: '#808080', width: 0.65, dash: '18 12', aci: 8 },
    'Blok - Yan Görünüş': { stroke: '#808080', width: 0.75, dash: '10 8', aci: 8 },
    TOPWALL: { stroke: '#808080', width: 0.65, dash: '18 12', aci: 8 },
    HATCH_WALL: { stroke: '#808080', width: 0.45, aci: 8 },
    HATCH_FABRIC: { stroke: '#ffbf00', width: 0.45, aci: 42 },
    GLASS: { stroke: '#ff00ff', width: 1.05, aci: 6 },
    TRIANGLE: { stroke: '#00bf00', width: 1.05, aci: 130 },
    WATER: { stroke: '#0000ff', width: 1.05, aci: 5 },
    DIM: { stroke: '#ffbf00', width: 0.75, aci: 42 },
    TEXT: { stroke: '#000000', width: 0.6, aci: 7 },
    TABLE: { stroke: '#000000', width: 0.7, aci: 7 },
    TITLE: { stroke: '#000000', width: 0.7, aci: 7 },
    BLOCKREF: { stroke: '#808080', width: 0.75, dash: '10 8', aci: 8 },

    // V8.2.66: Akıllı ölçü/zone ve görünüş bazlı DXF layer altyapısı
    'Dikme - Üst Görünüş': { stroke: '#ff00ff', width: 1.15, aci: 6 },
    'Dikme - Ön Görünüş': { stroke: '#ff00ff', width: 1.15, aci: 6 },
    'Oluk - Yan Görünüş': { stroke: '#000000', width: 1.2, aci: 7 },
    'Oluk - Üst Görünüş': { stroke: '#000000', width: 1.2, aci: 7 },
    'Oluk - Ön Görünüş': { stroke: '#000000', width: 1.2, aci: 7 },
    'Duvar - Üst Görünüş': { stroke: '#808080', width: 0.65, dash: '18 12', aci: 8 },
    'Ölçüler - Yan Görünüş': { stroke: '#ffbf00', width: 0.75, aci: 42 },
    'Ölçüler - Üst Görünüş': { stroke: '#ffbf00', width: 0.75, aci: 42 },
    'Ölçüler - Ön Görünüş': { stroke: '#ffbf00', width: 0.75, aci: 42 },
    'Ölçüler - Sağ Görünüş': { stroke: '#ffbf00', width: 0.75, aci: 42 },
    'Ölçüler - Ana': { stroke: '#ffbf00', width: 0.75, aci: 42 },
    'Ölçüler - Detay': { stroke: '#ffbf00', width: 0.75, aci: 42 },
    'Bloklar - Sabit': { stroke: '#808080', width: 0.75, dash: '10 8', aci: 8 },
    'Bloklar - Ray Uçları': { stroke: '#808080', width: 0.75, dash: '10 8', aci: 8 },
    'Ürün Yerleşimi - Sürme': { stroke: '#00a0c8', width: 1.05, aci: 4 },
    'Ürün Yerleşimi - Zipper': { stroke: '#00bf00', width: 1.05, aci: 130 },
    'Ürün Yerleşimi - Giyotin': { stroke: '#293189', width: 1.05, aci: 167 },
    'Profil - Yan Kayıt - Yan Görünüş': { stroke: '#d35400', width: 1.05, aci: 30 },
    'Profil - Yan Kayıt - Üst Görünüş': { stroke: '#d35400', width: 1.05, aci: 30 },
    'Profil - Yan Kayıt - Ön Görünüş': { stroke: '#d35400', width: 1.05, aci: 30 },
    'Zone - Önizleme Kontrol': { stroke: '#b00000', width: 0.65, dash: '8 8', aci: 1 }
  };
  // PERI01 LISP'ten web tabanına taşınan ana sabitler.
  const K = {
    showDimensions: true,
    systemStartX: 300,
    gutterX: 250,
    sideBaseX: -1450,
    rayW: 80,
    postSize: 100,
    defaultSystemGap: 13,
    noGapExtra: 0,
    nominalDeduct: 0,
    mechanismRayInset: 6,
    glassMechanismOffsetEachSide: 60,
    glassOffsetEachSide: 66,
    topWallInset: 0,
    topWallH: 800,
    topGutterH: 145,
    topGutterInnerH: 35.5,
    topGutterLipH: 12.7,
    frontGutterH: 135,
    topRayEndExtra: 3,
    rayLengthFrontDeduct: 212,
    frontViewExtraDrop: 500,
    onRayHCorrection: 133,
    onPostTopDrop: 3,
    onPostHeightCorrection: 49,
    altBlockCorrection: 46,
    sideWallDepth: 600,
    sideRayStartOffsetX: 250,
    sideRayStartOffsetY: 12,
    sideRayH: 131,
    sideInnerRayOffsetY: 64.7,
    sideInnerRayH: 10,
    sideArkaMekOffsetX: 71.6416842,
    sideArkaMekOffsetY: -128.50988141,
    slopeOpeningCorrection: 71.1,
    slopeHeightCorrection: 278,
    rayLenHeightCorrection: 265,
    catiProfilY: -400,
    catiProfilH: 30,
    catiProfilRayRatioBase: 490,
    catiProfilRayRatioMove: 47,
    catiProfilExtraOffset: 120,
    pergoTextMaxH: 220,
    pergoTextMinH: 60,
    pergoTextRatio: 8.5,
    pergoTextOffset: 250,
    sideViewGapY: 800
  };

  // V8.2.66: Ölçü -> Zone -> Profil / Ürün -> Görünüşler arası ilişki -> DXF layer altyapısı.
  const DIMENSION_ACTIONS = {
    main_resize: { canResize: true, canAddSameProfile: false, canAddDifferentProfile: false, canPlaceProduct: false, canRemoveElement: false },
    gap_between_posts: { canResize: true, canAddSameProfile: true, canAddDifferentProfile: true, canPlaceProduct: true, canRemoveElement: false },
    wall_to_post_gap: { canResize: false, canAddSameProfile: true, canAddDifferentProfile: true, canPlaceProduct: true, canRemoveElement: false },
    side_support_gap: { canResize: true, canAddSameProfile: true, canAddDifferentProfile: true, canPlaceProduct: true, canRemoveElement: false },
    parapet_width_resize: { canResize: true, canAddSameProfile: false, canAddDifferentProfile: false, canPlaceProduct: false, canRemoveElement: false },
    system_width: { canResize: true, canAddSameProfile: false, canAddDifferentProfile: false, canPlaceProduct: true, canRemoveElement: false },
    fixed_block_size: { canResize: false, canAddSameProfile: false, canAddDifferentProfile: false, canPlaceProduct: false, canRemoveElement: false, passiveReason: 'Bu blok sabit parçadır. Ölçüsü değiştirilemez.' },
    info_only: { canResize: false, canAddSameProfile: false, canAddDifferentProfile: false, canPlaceProduct: false, canRemoveElement: false, passiveReason: 'Bu ölçü şu an sadece bilgi amaçlıdır.' }
  };

  const DIMENSION_EDIT_RULES = {
    side_opening: { editable: true, actionType: 'main_resize', dimensionType: 'main' },
    side_rear_height: { editable: true, actionType: 'main_resize', dimensionType: 'height' },
    side_front_height: { editable: true, actionType: 'main_resize', dimensionType: 'height' },
    top_opening: { editable: true, actionType: 'main_resize', dimensionType: 'main' },
    top_total_width: { editable: true, actionType: 'system_width', dimensionType: 'main' },
    top_system_width: { editable: true, actionType: 'system_width', dimensionType: 'main' },
    front_total_width: { editable: true, actionType: 'system_width', dimensionType: 'main' },
    front_front_height: { editable: true, actionType: 'main_resize', dimensionType: 'height' },
    front_post_gap: { editable: true, actionType: 'gap_between_posts', dimensionType: 'detail' },
    side_wall_to_post_gap: { editable: true, actionType: 'wall_to_post_gap', dimensionType: 'detail' },
    side_support_gap: { editable: true, actionType: 'side_support_gap', dimensionType: 'detail' },
    parapet_width: { editable: true, actionType: 'parapet_width_resize', dimensionType: 'detail' },
    parapet_height_info: { editable: false, actionType: 'info_only', dimensionType: 'info', passiveReason: 'Parapet ölçüsü bu aşamada form alanından yönetilir.' },
    fixed_block_size: { editable: false, actionType: 'fixed_block_size', dimensionType: 'info', passiveReason: 'Bu blok sabit parçadır. Ölçüsü değiştirilemez. Sistem ölçüsü değiştiğinde konumu otomatik güncellenir.' },
    triangle_info: { editable: false, actionType: 'info_only', dimensionType: 'info' },
    info_only: { editable: false, actionType: 'info_only', dimensionType: 'info' }
  };

  const PROFILE_LIBRARY = {
    side_register_100: { id: 'side_register_100', name: 'Yan Kayıt Profili 100', sectionA: 100, sectionB: 100, category: 'side_register', material: 'aluminum', viewRepresentation: { side: { visibleWidth: 100 }, top: { visibleWidth: 100 }, front: { visibleWidth: 100 }, right: { visibleWidth: 100 } } },
    side_register_40x130: { id: 'side_register_40x130', name: 'Yan Kayıt Profili 40x130', sectionA: 40, sectionB: 130, category: 'side_register', material: 'aluminum', viewRepresentation: { side: { visibleWidth: 40, visibleDepth: null }, top: { visibleWidth: 130, visibleDepth: 40 }, front: { visibleWidth: 40, visibleDepth: null }, right: { visibleWidth: 40, visibleDepth: 130 } } },
    post_100x100: { id: 'post_100x100', name: 'Dikme Profili 100x100', sectionA: 100, sectionB: 100, category: 'post', material: 'aluminum', viewRepresentation: { side: { visibleWidth: 100 }, top: { visibleWidth: 100 }, front: { visibleWidth: 100 }, right: { visibleWidth: 100 } } }
  };

  const PRODUCT_LIBRARY = {
    sliding_glass: { id: 'sliding_glass', name: 'Sürme Cam', layer: 'Ürün Yerleşimi - Sürme' },
    guillotine_glass: { id: 'guillotine_glass', name: 'Giyotin Cam', layer: 'Ürün Yerleşimi - Giyotin' },
    zipper: { id: 'zipper', name: 'Zipper Perde', layer: 'Ürün Yerleşimi - Zipper' },
    zip_screen: { id: 'zip_screen', name: 'Zip Perde', layer: 'Ürün Yerleşimi - Zipper' },
    fixed_glass: { id: 'fixed_glass', name: 'Sabit Cam', layer: 'GLASS' },
    door: { id: 'door', name: 'Kapı', layer: 'GLASS' },
    empty: { id: 'empty', name: 'Boş Alan', layer: 'Zone - Önizleme Kontrol' }
  };

  function dimSlug(value) {
    return String(value || '').toLowerCase().replace(/[ğ]/g, 'g').replace(/[ü]/g, 'u').replace(/[ş]/g, 's').replace(/[ı]/g, 'i').replace(/[ö]/g, 'o').replace(/[ç]/g, 'c').replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'dim';
  }

  function enrichDimensionEdit(edit, measured) {
    const src = edit || {};
    const ruleKey = src.ruleKey || src.dimId || `${src.view || 'dim'}_${src.field || 'value'}`;
    const rule = DIMENSION_EDIT_RULES[ruleKey] || {};
    const action = DIMENSION_ACTIONS[rule.actionType || src.actionType || 'main_resize'] || DIMENSION_ACTIONS.main_resize;
    const dimId = src.dimId || `${dimSlug(src.view || 'view')}_${dimSlug(src.label || src.field || 'value')}_${src.index || 0}`;
    const editable = src.editable !== undefined ? !!src.editable : (rule.editable !== undefined ? !!rule.editable : !!action.canResize);
    return {
      ...src,
      dimId,
      ruleKey,
      editable,
      actionType: rule.actionType || src.actionType || 'main_resize',
      dimensionType: src.dimensionType || rule.dimensionType || 'main',
      passiveReason: src.passiveReason || rule.passiveReason || action.passiveReason || null,
      measuredValue: Math.round(Math.abs(Number(measured) || 0)),
      canResize: src.canResize !== undefined ? !!src.canResize : !!action.canResize,
      canAddSameProfile: src.canAddSameProfile !== undefined ? !!src.canAddSameProfile : !!action.canAddSameProfile,
      canAddDifferentProfile: src.canAddDifferentProfile !== undefined ? !!src.canAddDifferentProfile : !!action.canAddDifferentProfile,
      canPlaceProduct: src.canPlaceProduct !== undefined ? !!src.canPlaceProduct : !!action.canPlaceProduct,
      canRemoveElement: src.canRemoveElement !== undefined ? !!src.canRemoveElement : !!action.canRemoveElement
    };
  }

  const BUILD_LABEL = 'WEB DXF V10.4 - PROJECTMODEL, TOPOLOGY RECONCILE AND SAFE EXPORT - 14.07.2026';
  function bridge() { return root.PulumurExcelBridge || null; }
  function multiRules() {
    if (root.PulumurMultiPositionRules) return root.PulumurMultiPositionRules;
    if (typeof module !== 'undefined' && module.exports && typeof require === 'function') {
      try { return require('./core/multiPositionRules.js'); } catch (_) {}
    }
    return null;
  }
  function normalizedGlassRayBoundaryMode(value) {
    const rules = multiRules();
    return rules ? rules.boundaryMode(value) : (String(value || '').trim().toLocaleUpperCase('tr-TR') === 'DEGISTIRME' ? 'DEGISTIRME' : 'DARALT');
  }

  function runtimeLimits() {
    const api = root && root.PulumurLimits;
    return api && typeof api.get === 'function' ? api.get() : {
      maxSystems: 30, maxRaysPerSystem: 4, maxFrontPosts: 150,
      maxSideSupportsPerView: 8, maxProducts: 200,
      maxSegmentsPerView: 50
    };
  }

  function safeExtrema(values, mode, fallback = 0) {
    let found = false;
    let result = fallback;
    for (const raw of values || []) {
      const value = Number(raw);
      if (!Number.isFinite(value)) continue;
      if (!found) { result = value; found = true; }
      else if (mode === 'min' ? value < result : value > result) result = value;
    }
    return found ? result : fallback;
  }

  function assertGeometryLimits(d) {
    const limits = runtimeLimits();
    if (d.systemCount > limits.maxSystems || d.positionCount > limits.maxSystems) throw new Error(`Poz/sistem sınırı aşıldı (${Math.max(d.systemCount, d.positionCount)}/${limits.maxSystems}).`);
    if ((d.systems || []).some(system => Number(system.rayCount) > limits.maxRaysPerSystem)) throw new Error(`Poz başına ray sınırı ${limits.maxRaysPerSystem}.`);
    if (d.postCount > limits.maxFrontPosts) throw new Error(`Ön dikme sınırı ${limits.maxFrontPosts}.`);
    if (Object.values(d.sidePosts || {}).some(items => Array.isArray(items) && items.length > limits.maxSideSupportsPerView)) throw new Error(`Görünüş başına destek dikmesi sınırı ${limits.maxSideSupportsPerView}.`);
    const productCount = (d.slidingPlacements || []).length + (d.sideSlidingPlacements || []).length + (d.guillotinePlacements || []).length + (d.sideGuillotinePlacements || []).length + (d.zipScreenPlacements || []).length + (d.sideZipScreenPlacements || []).length;
    if (productCount > limits.maxProducts) throw new Error(`Toplam ürün sınırı ${limits.maxProducts}.`);
    const segmentLists = [];
    if (d.parapetSegmentsRaw && Array.isArray(d.parapetSegmentsRaw.front)) segmentLists.push(d.parapetSegmentsRaw.front);
    if (d.parapetSegmentsRaw && d.parapetSegmentsRaw.side) Object.values(d.parapetSegmentsRaw.side).forEach(list => segmentLists.push(list));
    if (d.topBackWallSegmentsRaw) Object.values(d.topBackWallSegmentsRaw).forEach(list => segmentLists.push(list));
    if (d.topBackWallGridStateRaw) Object.values(d.topBackWallGridStateRaw).forEach(grid => segmentLists.push(grid && grid.cells));
    if (d.backWallSegmentsRaw && d.backWallSegmentsRaw.side) Object.values(d.backWallSegmentsRaw.side).forEach(list => segmentLists.push(list));
    if (d.backWallGridStateRaw && d.backWallGridStateRaw.side) Object.values(d.backWallGridStateRaw.side).forEach(grid => segmentLists.push(grid && grid.cells));
    if (segmentLists.some(list => Array.isArray(list) && list.length > limits.maxSegmentsPerView)) throw new Error(`Görünüş başına duvar/parapet parça sınırı ${limits.maxSegmentsPerView}.`);
  }

  const SAMPLE_INPUT = {
    product: 'Pergo Rise',
    moduleName: 'Module 1',
    engine: 'Web DXF',
    customer: 'DENEME',
    project: 'DENEME',
    version: '01',
    drawnBy: 'AYETULLAH KILINC',
    date: new Date().toISOString().slice(0, 10),
    systemCount: 1,
    width: '4000',
    opening: '4500',
    rearHeight: '3200',
    frontHeight: 2600,
    rayCount: '',
    postCount: '',
    parapet: 'HAYIR',
    parapetHeight: 0,
    glassTrack: 'HAYIR',
    sideTrack: 'HAYIR',
    structureColor: 'RAL 7016 TEXT.',
    fabric: 'C 1602 - M (8116-1622)',
    fabricProfiles: 'RAL 1013',
    motor: 'RISING MOTOR',
    remote: 'RISING 6 CHANNELS',
    led: 'YES',
    dimmer: 'NO',
    extras: 'THE MOTOR IS ON RIGHT',
    triangleJoinery: 'HAYIR',
    waterStandard: 'EVET',
    waterOutletPlacement: 'BOTH'
  };

  function splitSemi(value) {
    return String(value ?? '').split(';').map(s => s.trim()).filter(s => s.length > 0);
  }
  function firstSemi(value) { return splitSemi(value)[0] ?? ''; }
  function numFromToken(value, fallback = 0) {
    const n = Number(String(value ?? '').trim().replace(',', '.'));
    return Number.isFinite(n) ? n : fallback;
  }
  function realList(value, fallback) {
    const parts = splitSemi(value);
    if (!parts.length) return [fallback];
    return parts.filter(p => !isNoToken(p)).map(p => numFromToken(p, fallback));
  }
  function intList(value, fallback) {
    return realList(value, fallback).map(v => Math.max(1, Math.round(v || fallback)));
  }
  function numberValue(value, fallback) { return numFromToken(firstSemi(value), fallback); }
  function intValue(value, fallback) { return Math.max(0, Math.round(numberValue(value, fallback))); }
  function textValue(value, fallback = '-') { const out = String(value ?? '').trim(); return out.length ? out : fallback; }

  const EXTRAS_MAX_LINES = 5;
  const EXTRAS_MAX_CHARS = 82;

  function normalizeExtrasText(value, options = {}) {
    const preserveTrailingSpace = options.preserveTrailingSpace === true;
    const source = String(value ?? '')
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\t/g, ' ')
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
    const output = [];

    source.split('\n').some(manualLine => {
      let remaining = manualLine;
      if (remaining.length === 0) {
        output.push('');
        return output.length >= EXTRAS_MAX_LINES;
      }
      while (remaining.length > EXTRAS_MAX_CHARS && output.length < EXTRAS_MAX_LINES) {
        const spaceIndex = remaining.lastIndexOf(' ', EXTRAS_MAX_CHARS);
        const splitAt = spaceIndex > 0 ? spaceIndex : EXTRAS_MAX_CHARS;
        output.push(remaining.slice(0, splitAt).replace(/[ ]+$/g, ''));
        remaining = remaining.slice(splitAt);
        if (spaceIndex > 0) remaining = remaining.replace(/^[ ]+/g, '');
      }
      if (output.length < EXTRAS_MAX_LINES) output.push(remaining.slice(0, EXTRAS_MAX_CHARS));
      return output.length >= EXTRAS_MAX_LINES;
    });

    let result = output.slice(0, EXTRAS_MAX_LINES).join('\n');
    if (!preserveTrailingSpace) result = result.replace(/[ ]+\n/g, '\n').replace(/[ ]+$/g, '');
    return result;
  }

  function yes(value) { return String(value ?? '').trim().toLocaleUpperCase('tr-TR') === 'EVET'; }
  function isNoToken(value) { return String(value ?? '').trim().toLocaleUpperCase('tr-TR') === 'NO'; }
  function nthOrLast(list, idx) { if (!list || !list.length) return undefined; return idx < list.length ? list[idx] : list[list.length - 1]; }
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function formatMm(value) { return `${Math.round(value)} mm`; }
  function formatDeg(value) { return `${Number(value).toFixed(2)}°`; }
  function normDeg(value) { return ((value % 360) + 360) % 360; }

  function parapetAngleDegrees(start, end, startHeight, endHeight) {
    const width = Number(end) - Number(start);
    if (!Number.isFinite(width) || Math.abs(width) < 1e-9) return 0;
    return Math.atan2(Number(endHeight) - Number(startHeight), width) * 180 / Math.PI;
  }

  function parapetAngleDirection(parapetView, sideViewKey) {
    return String(parapetView || '').toLowerCase() === 'side' && String(sideViewKey || '').toLowerCase() === 'right' ? -1 : 1;
  }

  function parapetDisplayAngleDegrees(modelAngle, parapetView, sideViewKey) {
    const value = Number(modelAngle);
    return Number.isFinite(value) ? value * parapetAngleDirection(parapetView, sideViewKey) : value;
  }

  function parapetModelAngleDegrees(displayAngle, parapetView, sideViewKey) {
    const value = Number(displayAngle);
    return Number.isFinite(value) ? value * parapetAngleDirection(parapetView, sideViewKey) : value;
  }

  function resolveParapetEndHeight(start, end, startHeight, endHeight, angleText, source = 'heights') {
    const direct = Number(endHeight);
    if (source !== 'angle') return direct;
    const angle = Number(String(angleText == null ? '' : angleText).replace(',', '.'));
    const width = Number(end) - Number(start);
    const fixedHeight = Number(startHeight);
    if (![angle, width, fixedHeight].every(Number.isFinite)) return direct;
    return fixedHeight + Math.tan(angle * Math.PI / 180) * width;
  }

  function alignParapetNeighborEndpoints(list, index, start, end) {
    if (!Array.isArray(list)) return list;
    const before = index > 0 ? list[index - 1] : null;
    const after = index < list.length - 1 ? list[index + 1] : null;
    // Ortak topology sınırı yalnız X koordinatıdır. Komşu parçaların yükseklik
    // uçları bağımsız kalır; aynı X noktasında farklı kotlar bilinçli olarak
    // düşey bir parapet kademesi oluşturabilir.
    if (before) before.end = start;
    if (after) after.start = end;
    return list;
  }

  function sanitizeSignedDecimalInput(value) {
    const source = String(value == null ? '' : value).replace(/[\u2212\u2013\u2014]/g, '-');
    const sign = source.includes('-') ? '-' : (source.includes('+') ? '+' : '');
    let separatorSeen = false;
    let body = '';
    for (const char of source.replace(/[+-]/g, '')) {
      if (/[0-9]/.test(char)) body += char;
      else if ((char === ',' || char === '.') && !separatorSeen) {
        body += char;
        separatorSeen = true;
      }
    }
    return sign + body;
  }

  function trapezSheetExtensions(defaultBounds, currentBounds) {
    const base = defaultBounds && typeof defaultBounds === 'object' ? defaultBounds : {};
    const current = currentBounds && typeof currentBounds === 'object' ? currentBounds : base;
    const number = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
    const minX = number(base.minX), maxX = number(base.maxX), minY = number(base.minY), maxY = number(base.maxY);
    return {
      minusX: minX - number(current.minX, minX),
      plusX: number(current.maxX, maxX) - maxX,
      minusY: minY - number(current.minY, minY),
      plusY: number(current.maxY, maxY) - maxY
    };
  }

  function trapezSheetBoundsFromExtensions(defaultBounds, extensions) {
    const base = defaultBounds && typeof defaultBounds === 'object' ? defaultBounds : {};
    const delta = extensions && typeof extensions === 'object' ? extensions : {};
    const number = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
    const minX = number(base.minX), maxX = number(base.maxX), minY = number(base.minY), maxY = number(base.maxY);
    return {
      minX: minX - number(delta.minusX),
      maxX: maxX + number(delta.plusX),
      minY: minY - number(delta.minusY),
      maxY: maxY + number(delta.plusY)
    };
  }


  function trapezSheetEditorAxisState(defaultMin, defaultMax, currentMin, currentMax, minPlacement = 'left', maxPlacement = 'right') {
    const number = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
    const baseMin = number(defaultMin), baseMax = number(defaultMax);
    const min = number(currentMin, baseMin), max = number(currentMax, baseMax);
    const minDelta = baseMin - min;
    const maxDelta = max - baseMax;
    const epsilon = 0.001;
    const clean = value => Math.abs(value) <= epsilon ? 0 : value;
    const lower = clean(minDelta), upper = clean(maxDelta);
    const whole = value => Number.isInteger(Math.abs(value));
    if (lower === 0 && upper === 0) return { placement: 'equal', operation: 'extend', value: '', custom: false };
    if (lower !== 0 && upper !== 0 && Math.sign(lower) === Math.sign(upper) && Math.abs(Math.abs(lower) - Math.abs(upper)) <= epsilon && whole(lower)) {
      return { placement: 'equal', operation: lower > 0 ? 'extend' : 'shorten', value: String(Math.abs(lower)), custom: false };
    }
    if (lower !== 0 && upper === 0 && whole(lower)) return { placement: minPlacement, operation: lower > 0 ? 'extend' : 'shorten', value: String(Math.abs(lower)), custom: false };
    if (lower === 0 && upper !== 0 && whole(upper)) return { placement: maxPlacement, operation: upper > 0 ? 'extend' : 'shorten', value: String(Math.abs(upper)), custom: false };
    return { placement: 'equal', operation: 'extend', value: '', custom: true };
  }

  function trapezSheetEditorState(defaultBounds, currentBounds) {
    const base = defaultBounds && typeof defaultBounds === 'object' ? defaultBounds : {};
    const current = currentBounds && typeof currentBounds === 'object' ? currentBounds : base;
    return {
      width: trapezSheetEditorAxisState(base.minX, base.maxX, current.minX, current.maxX, 'left', 'right'),
      length: trapezSheetEditorAxisState(base.minY, base.maxY, current.minY, current.maxY, 'down', 'up')
    };
  }

  function trapezSheetBoundsFromEditor(defaultBounds, currentBounds, settings) {
    const base = defaultBounds && typeof defaultBounds === 'object' ? defaultBounds : {};
    const current = currentBounds && typeof currentBounds === 'object' ? currentBounds : base;
    const source = settings && typeof settings === 'object' ? settings : {};
    const number = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
    const applyAxis = (baseMin, baseMax, currentMin, currentMax, axis, minPlacement = 'left', maxPlacement = 'right') => {
      const valueText = axis && axis.value != null ? String(axis.value).trim() : '';
      if (valueText === '') return { min: number(currentMin, number(baseMin)), max: number(currentMax, number(baseMax)) };
      const value = Number(valueText);
      if (!Number.isInteger(value) || value <= 0) return { min: NaN, max: NaN };
      const rawPlacement = String(axis && axis.placement || '');
      const legacyMinAlias = minPlacement === 'down' && rawPlacement === 'left';
      const legacyMaxAlias = maxPlacement === 'up' && rawPlacement === 'right';
      const placement = rawPlacement === 'equal'
        ? 'equal'
        : (rawPlacement === minPlacement || legacyMinAlias)
          ? minPlacement
          : (rawPlacement === maxPlacement || legacyMaxAlias)
            ? maxPlacement
            : 'equal';
      const operation = String(axis && axis.operation || '') === 'shorten' ? 'shorten' : 'extend';
      const direction = operation === 'shorten' ? -1 : 1;
      let min = number(baseMin), max = number(baseMax);
      if (placement === 'equal' || placement === minPlacement) min -= direction * value;
      if (placement === 'equal' || placement === maxPlacement) max += direction * value;
      return { min, max };
    };
    const width = applyAxis(base.minX, base.maxX, current.minX, current.maxX, source.width, 'left', 'right');
    const length = applyAxis(base.minY, base.maxY, current.minY, current.maxY, source.length, 'down', 'up');
    return { minX: width.min, maxX: width.max, minY: length.min, maxY: length.max };
  }

  function noGapModeActive(raw) {
    const parts = splitSemi(raw);
    const clean = parts.filter(p => !isNoToken(p));
    return parts.length > 0 && isNoToken(parts[parts.length - 1]) && clean.length >= 3 && clean.length % 2 === 1;
  }
  function noGapWidths(raw) {
    const clean = splitSemi(raw).filter(p => !isNoToken(p));
    return clean.filter((_, i) => i % 2 === 0).map(p => numFromToken(p, 0));
  }
  function noGapGaps(raw) {
    const clean = splitSemi(raw).filter(p => !isNoToken(p));
    return clean.filter((_, i) => i % 2 === 1).map(p => numFromToken(p, 0));
  }

  function rayLenFor(opening, rearH, frontH) {
    return Math.max(1, Math.floor(Math.sqrt(Math.pow(rearH - frontH - K.rayLenHeightCorrection, 2) + Math.pow(opening, 2)) - 220));
  }
  function sideAngleRadFor(opening, rearH, frontH) {
    const denom = opening - K.slopeOpeningCorrection;
    return -Math.atan((rearH - frontH - K.slopeHeightCorrection) / (Math.abs(denom) < 1e-9 ? 1 : denom));
  }

  function buildSystems(d, raw) {
    const rules = multiRules();
    const formSource = raw && raw.formRaw ? raw.formRaw : raw || {};
    const limits = runtimeLimits();
    const rawSystemCount = Object.prototype.hasOwnProperty.call(formSource, 'systemCount') ? formSource.systemCount : raw.systemCount;
    const countResult = rules ? rules.systemCount(rawSystemCount, limits.maxSystems) : null;
    if (rules && (!countResult || !countResult.ok)) throw new Error(`Sistem adedi geçersiz: ${(countResult && countResult.code) || 'SYSTEM_COUNT_REQUIRED'}`);
    const sysCount = countResult && countResult.ok ? countResult.count : Math.max(1, Math.round(Number(rawSystemCount) || 1));
    if (sysCount > limits.maxSystems) throw new Error(`Poz/sistem sınırı aşıldı (${sysCount}/${limits.maxSystems}).`);

    const boundaryMode = normalizedGlassRayBoundaryMode(formSource.glassRayBoundaryMode || raw.glassRayBoundaryMode);
    const leftGlassTrackEnabled = sideFeatureEnabled(d, 'glassTrack', '0', 0);
    const rightGlassTrackEnabled = sideFeatureEnabled(d, 'glassTrack', 'right', Math.max(0, sysCount - 1));
    const exteriorSideCounts = Array.from({ length: sysCount }, (_, index) => boundaryMode === 'DARALT'
      ? ((index === 0 && leftGlassTrackEnabled ? 1 : 0) + (index === sysCount - 1 && rightGlassTrackEnabled ? 1 : 0))
      : 0);
    const widthResult = rules ? rules.resolveWidthLayout(formSource.width, sysCount, {
      boundaryMode,
      exteriorSideCounts,
      standardGap: K.defaultSystemGap,
      minNoGap: K.defaultSystemGap,
      glassMechanismDeductEachSide: K.glassMechanismOffsetEachSide,
      rayInsetTotal: K.mechanismRayInset * 2
    }) : null;
    if (rules && (!widthResult || !widthResult.ok)) throw new Error(`Çoklu poz genişlik kuralı geçersiz: ${(widthResult && widthResult.code) || 'WIDTH_INVALID'}`);
    const nominalWidths = widthResult && widthResult.ok ? widthResult.nominalWidths.slice() : realList(formSource.width, SAMPLE_INPUT.width).slice(0, sysCount);
    const mechanismWidths = widthResult && widthResult.ok && Array.isArray(widthResult.mechanismWidths)
      ? widthResult.mechanismWidths.slice()
      : nominalWidths.slice();
    const physicalGaps = widthResult && widthResult.ok ? widthResult.gaps.slice() : Array.from({ length: Math.max(0, sysCount - 1) }, () => K.defaultSystemGap);
    const noMode = !!(widthResult && widthResult.mode === 'no');

    const rayResult = rules ? rules.parsePositionValues(raw.rayCountText || raw.rayCount, sysCount, { allowSingle: true, minimum: 1, maximum: limits.maxRaysPerSystem }) : null;
    let rayList = rayResult && rayResult.ok ? rules.expand(rayResult.values, sysCount, 1) : intList(raw.rayCount, SAMPLE_INPUT.rayCount);
    if (rayList.length === 1 && sysCount > 1) rayList = Array.from({ length: sysCount }, () => rayList[0]);
    if (rayList.length !== sysCount) throw new Error('Ray sayısı değer adedi sistem adediyle uyuşmuyor.');
    if (rayList.some(value => value > limits.maxRaysPerSystem)) throw new Error(`Poz başına ray sınırı ${limits.maxRaysPerSystem}.`);

    const systems = [];
    let x = K.systemStartX;
    let totalWidth = 0;
    for (let index = 0; index < sysCount; index += 1) {
      const nominalWidth = Math.max(92, Math.round(Number(nominalWidths[index]) || 0));
      const canonicalMechanismWidth = Math.max(92, Math.round(Number(mechanismWidths[index]) || 0));
      const gapAfter = index < sysCount - 1 ? Math.max(K.defaultSystemGap, Math.round(Number(physicalGaps[index]) || K.defaultSystemGap)) : 0;
      const mechanismDeductLeft = boundaryMode === 'DARALT' && index === 0 && leftGlassTrackEnabled ? K.glassMechanismOffsetEachSide : 0;
      const mechanismDeductRight = boundaryMode === 'DARALT' && index === sysCount - 1 && rightGlassTrackEnabled ? K.glassMechanismOffsetEachSide : 0;
      const startX = x;
      const endX = startX + nominalWidth;
      const mechanismStartX = startX + mechanismDeductLeft;
      const mechanismEndX = mechanismStartX + canonicalMechanismWidth;
      if (Math.abs((endX - mechanismDeductRight) - mechanismEndX) > 0.001) throw new Error('Arka mekanizma ve dış sistem sınırı genişlikleri birbiriyle uyuşmuyor.');
      const rayAreaStartX = mechanismStartX + K.mechanismRayInset;
      const rayAreaEndX = mechanismEndX - K.mechanismRayInset;
      const rayAreaW = rayAreaEndX - rayAreaStartX;
      const rayCount = Math.max(1, Math.round(Number(rayList[index]) || 1));
      const minimumMechanismWidth = rules && typeof rules.minimumMechanismWidthForRayCount === 'function'
        ? rules.minimumMechanismWidthForRayCount(rayCount, K.rayW, K.mechanismRayInset * 2)
        : Math.max(92, rayCount * K.rayW + K.mechanismRayInset * 2);
      if (canonicalMechanismWidth < minimumMechanismWidth) {
        throw new Error(`${rayCount} ray için arka mekanizma dıştan dışa genişliği en az ${minimumMechanismWidth} mm olmalıdır.`);
      }
      const pitch = rayCount > 1 ? (rayAreaW - K.rayW) / (rayCount - 1) : 0;
      const system = {
        index,
        startX, endX, outerStartX: startX, outerEndX: endX,
        nominalStartX: startX, nominalEndX: endX,
        nominalWidth, outerWidth: nominalWidth,
        systemStartX: mechanismStartX, systemEndX: mechanismEndX,
        width: canonicalMechanismWidth, systemWidth: canonicalMechanismWidth,
        gapAfter, rayCount, rays: [],
        mechanismStartX, mechanismEndX, mechanismWidth: canonicalMechanismWidth,
        mechanismDeductLeft, mechanismDeductRight,
        rayAreaStartX, rayAreaEndX, raySystemW: rayAreaW, rayPitch: pitch,
        minimumMechanismWidth, boundaryMode
      };
      for (let rayIndex = 0; rayIndex < rayCount; rayIndex += 1) system.rays.push(rayAreaStartX + rayIndex * pitch);
      const custom = d.customRayPositions && d.customRayPositions[String(index)];
      if (Array.isArray(custom) && custom.length === rayCount && custom.every(Number.isFinite)) {
        const sorted = custom.map(Number);
        sorted[0] = rayAreaStartX;
        sorted[sorted.length - 1] = rayAreaEndX - K.rayW;
        if (sorted.every((value, i) => i === 0 || value >= sorted[i - 1] + K.rayW - 0.001)) system.rays = sorted;
      }
      systems.push(system);
      x = endX + gapAfter;
      totalWidth += nominalWidth + gapAfter;
    }
    if (systems.length) totalWidth -= systems[systems.length - 1].gapAfter;
    return {
      systems, systemCount: sysCount, noGapMode: noMode,
      explicitWidth: !!(widthResult && widthResult.mode !== 'total' && widthResult.mode !== 'single'),
      explicitRay: !!(rayResult && rayResult.values && rayResult.values.length > 1),
      totalNet: totalWidth, totalNominal: totalWidth, widthMode: widthResult && widthResult.mode,
      physicalGaps, boundaryMode
    };
  }

  function normalizeSlidingPlacement(item, index = 0) {
    const raw = item || {};
    const gapIndex = Math.max(0, Math.round(Number(raw.gapIndex) || 0));
    const width = Math.max(1, Number(raw.width) || 1);
    const height = Math.max(1, Number(raw.height) || 1);
    let panelCount = Math.max(2, Math.round(Number(raw.panelCount) || 2));
    const series = String(raw.series || 'A SERIES').trim().toUpperCase() === 'K SERIES' ? 'K SERIES' : 'A SERIES';
    const type = String(raw.type || 'WITH THRESHOLD').trim().toUpperCase() === 'WITHOUT THRESHOLD' ? 'WITHOUT THRESHOLD' : 'WITH THRESHOLD';
    const openingType = String(raw.openingType || 'SIDE OPENING').trim().toUpperCase() === 'CENTER OPENING' ? 'CENTER OPENING' : 'SIDE OPENING';
    if (openingType === 'CENTER OPENING') {
      panelCount = Math.max(4, panelCount);
      if (panelCount % 2 !== 0) panelCount += 1;
    }
    const openingDirection = openingType === 'CENTER OPENING'
      ? (String(raw.openingDirection || 'OUTSIDE').trim().toUpperCase() === 'INSIDE' ? 'INSIDE' : 'OUTSIDE')
      : (String(raw.openingDirection || 'RIGHT').trim().toUpperCase() === 'LEFT' ? 'LEFT' : 'RIGHT');
    const pozNo = String(raw.pozNo || `S${String(index + 1).padStart(2, '0')}`).trim().toUpperCase();
    return {
      id: String(raw.id || `sliding_${pozNo}_${gapIndex}`),
      gapIndex,
      series,
      type,
      slidingView: String(raw.slidingView || 'OUTSIDE VIEW').trim().toUpperCase() === 'INSIDE VIEW' ? 'INSIDE VIEW' : 'OUTSIDE VIEW',
      openingType,
      openingDirection,
      glassThickness: String(raw.glassThickness || '10 MM').trim().toUpperCase(),
      glassColor: String(raw.glassColor || 'TRANSPARENT').trim().toUpperCase(),
      customGlassColor: String(raw.customGlassColor || '').trim(),
      width,
      height,
      panelCount,
      panelCountMode: String(raw.panelCountMode || (raw.panelCount === undefined ? 'AUTO' : 'MANUAL')).trim().toUpperCase() === 'MANUAL' ? 'MANUAL' : 'AUTO',
      collectionState: String(raw.collectionState || 'NORMAL').trim().toUpperCase() === 'COLLECTED' ? 'COLLECTED' : 'NORMAL',
      quantity: Math.max(1, Math.round(Number(raw.quantity) || 1)),
      pozNo,
      leftPostStandard: raw.leftPostStandard !== false
    };
  }


  function normalizeGuillotinePlacement(item, index = 0) {
    const raw = item || {};
    const gapIndex = Math.max(0, Math.round(Number(raw.gapIndex) || 0));
    const series = String(raw.series || 'A SERIES').trim().toUpperCase() === 'K SERIES' ? 'K SERIES' : 'A SERIES';
    let type = String(raw.type || 'CLEANABLE').trim().toUpperCase();
    if (!['STANDARD', 'CLEANABLE', 'UPWARD COLLECTING', 'DOWNWARD COLLECTING'].includes(type)) type = 'STANDARD';
    if (series === 'K SERIES' && ['UPWARD COLLECTING', 'DOWNWARD COLLECTING'].includes(type)) type = 'CLEANABLE';
    let mechanism = String(raw.mechanism || 'CHAIN').trim().toUpperCase();
    if (!['CHAIN', 'BELT'].includes(mechanism)) mechanism = 'CHAIN';
    if (series === 'K SERIES') mechanism = 'BELT';
    let glassThickness = String(raw.glassThickness || '8 MM').trim().toUpperCase();
    if (!['8 MM', 'INSULATED GLASS'].includes(glassThickness)) glassThickness = '8 MM';
    if (series === 'K SERIES') glassThickness = 'INSULATED GLASS';
    const rawPanelCount = String(raw.panelCount || '1+1').trim();
    const panelCount = ['1+1', '1+2', '1+3'].includes(rawPanelCount) ? rawPanelCount : '1+1';
    const pozNo = String(raw.pozNo || `G${String(index + 1).padStart(2, '0')}`).trim().toUpperCase();
    const cleanable = type === 'CLEANABLE';
    return {
      id: String(raw.id || `guillotine_${pozNo}_${gapIndex}`),
      gapIndex, series, type, mechanism, glassThickness,
      glassColor: String(raw.glassColor || 'TRANSPARENT').trim().toUpperCase(),
      customGlassColor: String(raw.customGlassColor || '').trim(),
      panelCount,
      motorDirection: String(raw.motorDirection || 'RIGHT').trim().toUpperCase() === 'LEFT' ? 'LEFT' : 'RIGHT',
      view: String(raw.view || 'RIGHT').trim().toUpperCase() || 'RIGHT',
      motorType: String(raw.motorType || 'SOMFY RTS').trim().toUpperCase(),
      remoteControl: String(raw.remoteControl || '1 CHANNEL').trim().toUpperCase(),
      remoteQuantity: Math.max(0, Math.trunc(Number(raw.remoteQuantity) || 0)),
      displayState: String(raw.displayState || 'OPEN').trim().toUpperCase() === 'CLOSED' ? 'CLOSED' : 'OPEN',
      bottomPanelMode: cleanable ? 'VASISTAS' : 'FIXED',
      bottomPanelState: cleanable && String(raw.bottomPanelState || 'OPEN').trim().toUpperCase() !== 'CLOSED' ? 'OPEN' : 'CLOSED',
      bottomPanelHinge: 'BOTTOM',
      collectionState: !cleanable && String(raw.collectionState || 'NORMAL').trim().toUpperCase() === 'COLLECTED' ? 'COLLECTED' : 'NORMAL',
      width: Math.max(1, Number(raw.width) || 1),
      height: Math.max(1, Number(raw.height) || 1),
      quantity: 1,
      pozNo,
      leftPostStandard: raw.leftPostStandard !== false
    };
  }

  function normalizeZipScreenPlacement(item, index = 0) {
    const raw = item || {};
    const gapIndex = Math.max(0, Math.round(Number(raw.gapIndex) || 0));
    const series = String(raw.series || 'G SERIES').trim().toUpperCase() === 'P SERIES' ? 'P SERIES' : 'G SERIES';
    const allowed = series === 'P SERIES' ? ['115X115 BOX', '130X130 BOX'] : ['100X100 BOX', '110X110 BOX', 'HERCULE'];
    let type = String(raw.type || allowed[0]).trim().toUpperCase().replace(/\s+/g, ' ');
    if (!allowed.includes(type)) type = allowed[0];
    const pozNo = String(raw.pozNo || `Z${String(index + 1).padStart(2, '0')}`).trim().toUpperCase();
    return {
      id: String(raw.id || `zip_${pozNo}_${gapIndex}`),
      gapIndex,
      series,
      type,
      mountingLocation: String(raw.mountingLocation || 'BETWEEN POSTS').trim().toUpperCase() === 'OUTSIDE POSTS' ? 'OUTSIDE POSTS' : 'BETWEEN POSTS',
      fabricColor: String(raw.fabricColor || 'SOLTIS').trim().toUpperCase(),
      customFabricColor: String(raw.customFabricColor || '').trim(),
      cableExitDirection: ['TOP', 'SIDE'].includes(String(raw.cableExitDirection || '').trim().toUpperCase()) ? String(raw.cableExitDirection).trim().toUpperCase() : 'REAR',
      motorDirection: String(raw.motorDirection || 'RIGHT').trim().toUpperCase() === 'LEFT' ? 'LEFT' : 'RIGHT',
      width: Math.max(1, Number(raw.width) || 1),
      height: Math.max(1, Number(raw.height) || 1),
      sizeMode: String(raw.sizeMode || 'AUTO').trim().toUpperCase() === 'MANUAL' ? 'MANUAL' : 'AUTO',
      panelCount: 1,
      collectionState: String(raw.collectionState || 'NORMAL').trim().toUpperCase() === 'COLLECTED' ? 'COLLECTED' : 'NORMAL',
      quantity: 1,
      pozNo
    };
  }

  function normalizeSideViewKey(rawKey, sideIndex = 0) {
    const key = String(rawKey == null ? '' : rawKey).trim().toLowerCase();
    if (key === 'right') return 'right';
    if (/^middle[_:-]?\d+$/.test(key)) {
      const n = Number(key.replace(/\D+/g, ''));
      return String(Math.max(1, Number.isFinite(n) ? n : Number(sideIndex) || 0));
    }
    const n = Number(key === '' ? sideIndex : key);
    return String(Math.max(0, Number.isFinite(n) ? Math.round(n) : Number(sideIndex) || 0));
  }

  function normalizeSideSlidingPlacement(item, index = 0) {
    const raw = item || {};
    const base = normalizeSlidingPlacement(raw, index);
    const legacyZone = String(raw.sideZone || 'wall_support');
    const sideGapIndex = Math.max(0, Math.round(Number(raw.sideGapIndex ?? (legacyZone === 'support_post' ? 1 : 0)) || 0));
    const sideIndex = Math.max(0, Math.round(Number(raw.sideIndex) || 0));
    const sideViewKey = normalizeSideViewKey(raw.sideViewKey || (raw.placementView === 'side-right' ? 'right' : ''), sideIndex);
    return { ...base, placementView: sideViewKey === 'right' ? 'side-right' : 'side-left', sideIndex, sideViewKey, sideGapIndex, sideZone: `gap_${sideGapIndex}` };
  }

  function normalizeSideGuillotinePlacement(item, index = 0) {
    const raw = item || {};
    const base = normalizeGuillotinePlacement(raw, index);
    const legacyZone = String(raw.sideZone || 'wall_support');
    const sideGapIndex = Math.max(0, Math.round(Number(raw.sideGapIndex ?? (legacyZone === 'support_post' ? 1 : 0)) || 0));
    const sideIndex = Math.max(0, Math.round(Number(raw.sideIndex) || 0));
    const sideViewKey = normalizeSideViewKey(raw.sideViewKey || (raw.placementView === 'side-right' ? 'right' : ''), sideIndex);
    return { ...base, placementView: sideViewKey === 'right' ? 'side-right' : 'side-left', sideIndex, sideViewKey, sideGapIndex, sideZone: `gap_${sideGapIndex}` };
  }

  function normalizeSideZipScreenPlacement(item, index = 0) {
    const raw = item || {};
    const base = normalizeZipScreenPlacement(raw, index);
    const legacyZone = String(raw.sideZone || 'wall_support');
    const sideGapIndex = Math.max(0, Math.round(Number(raw.sideGapIndex ?? (legacyZone === 'support_post' ? 1 : 0)) || 0));
    const sideIndex = Math.max(0, Math.round(Number(raw.sideIndex) || 0));
    const sideViewKey = normalizeSideViewKey(raw.sideViewKey || (raw.placementView === 'side-right' ? 'right' : ''), sideIndex);
    return { ...base, placementView: sideViewKey === 'right' ? 'side-right' : 'side-left', sideIndex, sideViewKey, sideGapIndex, sideZone: `gap_${sideGapIndex}` };
  }

  function normalizeSideFeatureState(raw, d) {
    const source = raw && typeof raw === 'object' ? raw : {};
    const defaultGlass = yes(d.glassTrack);
    const defaultTriangle = yes(d.triangleJoinery);
    const bool = (value, fallback) => value === undefined || value === null ? !!fallback : !!value;
    const normalizeMiddle = value => {
      const out = {};
      if (value && typeof value === 'object') Object.entries(value).forEach(([key, enabled]) => { out[normalizeSideViewKey(key, Number(key) || 0)] = !!enabled; });
      return out;
    };
    return {
      glassTrack: {
        left: bool(source.glassTrack && source.glassTrack.left, defaultGlass),
        right: bool(source.glassTrack && source.glassTrack.right, defaultGlass),
        middle: normalizeMiddle(source.glassTrack && source.glassTrack.middle)
      },
      triangle: {
        left: bool(source.triangle && source.triangle.left, defaultTriangle),
        right: bool(source.triangle && source.triangle.right, defaultTriangle),
        middle: normalizeMiddle(source.triangle && source.triangle.middle)
      },
      middleEnabled: normalizeMiddle(source.middleEnabled)
    };
  }

  function normalizeGlassTrackLengthOffsets(raw) {
    const source = raw && typeof raw === 'object' ? raw : {};
    const normalizeNumber = value => Number.isFinite(Number(value)) ? Number(value) : 0;
    const middle = {};
    if (source.middle && typeof source.middle === 'object') Object.entries(source.middle).forEach(([key, value]) => { middle[normalizeSideViewKey(key, Number(key) || 0)] = normalizeNumber(value); });
    return { left: normalizeNumber(source.left), right: normalizeNumber(source.right), middle };
  }


  function normalizeSideScopedNumbers(raw, fallback = null, minValue = null) {
    const source = raw && typeof raw === 'object' ? raw : {};
    const norm = value => {
      if (value === undefined || value === null || String(value).trim() === '') return fallback;
      const n = Number(value);
      if (!Number.isFinite(n)) return fallback;
      return minValue == null ? n : Math.max(minValue, n);
    };
    const middle = {};
    if (source.middle && typeof source.middle === 'object') {
      Object.entries(source.middle).forEach(([key, value]) => {
        middle[normalizeSideViewKey(key, Number(key) || 0)] = norm(value);
      });
    }
    return { left: norm(source.left), right: norm(source.right), middle };
  }

  function normalizeTriangleDivisionState(raw) {
    return normalizeSideScopedNumbers(raw, null, 1);
  }

  function normalizeBackWallState(raw) {
    const source = raw && typeof raw === 'object' ? raw : {};
    const normalizeWall = value => {
      const wall = value && typeof value === 'object' ? value : {};
      const finite = (v, fallback) => Number.isFinite(Number(v)) ? Number(v) : fallback;
      return {
        enabled: wall.enabled !== false,
        xOffset: finite(wall.xOffset, 0),
        depth: Math.max(1, finite(wall.depth, K.sideWallDepth)),
        height: Math.max(0, finite(wall.height, 0))
      };
    };
    const middle = {};
    if (source.middle && typeof source.middle === 'object') {
      Object.entries(source.middle).forEach(([key, value]) => {
        middle[normalizeSideViewKey(key, Number(key) || 0)] = normalizeWall(value);
      });
    }
    return { left: normalizeWall(source.left), right: normalizeWall(source.right), middle };
  }

  function normalizeBackWallSegmentsState(rawState, d) {
    const raw = rawState && typeof rawState === 'object' ? rawState : {};
    const sourceMap = raw.side && typeof raw.side === 'object' ? raw.side : {};
    const side = {};
    Object.entries(sourceMap).forEach(([rawKey, items]) => {
      const key = normalizeSideViewKey(rawKey, Number(rawKey) || 0);
      const cleaned = Array.isArray(items) ? items.map((item, index) => ({
        id: String(item && item.id || `back_wall_${key}_${index + 1}`),
        start: Math.max(0, Number(item && item.start) || 0),
        end: Math.max(0, Number(item && item.end) || 0),
        height: Math.max(0, Number(item && item.height) || 0)
      })).filter(item => item.end > item.start).sort((a, b) => a.start - b.start) : [];
      if (cleaned.length) side[key] = cleaned;
    });
    return { side };
  }


  function backWallGridCellsAreValid(cells, bounds) {
    if (!Array.isArray(cells) || !cells.length) return false;
    const epsilon = 1e-7;
    const ids = new Set();
    for (const cell of cells) {
      if (!cell || ids.has(cell.id)) return false;
      ids.add(cell.id);
      if (!(cell.maxX > cell.minX && cell.maxY > cell.minY)) return false;
      if (cell.minX < bounds.minX - epsilon || cell.maxX > bounds.maxX + epsilon || cell.minY < bounds.minY - epsilon || cell.maxY > bounds.maxY + epsilon) return false;
    }
    const enabledCells = cells.filter(cell => cell.enabled !== false);
    for (let left = 0; left < enabledCells.length; left += 1) {
      for (let right = left + 1; right < enabledCells.length; right += 1) {
        const overlapX = Math.min(enabledCells[left].maxX, enabledCells[right].maxX) - Math.max(enabledCells[left].minX, enabledCells[right].minX);
        const overlapY = Math.min(enabledCells[left].maxY, enabledCells[right].maxY) - Math.max(enabledCells[left].minY, enabledCells[right].minY);
        if (overlapX > epsilon && overlapY > epsilon) return false;
      }
    }
    return true;
  }

  function normalizeBackWallGridState(rawState) {
    const raw = rawState && typeof rawState === 'object' ? rawState : {};
    const sourceMap = raw.side && typeof raw.side === 'object' ? raw.side : {};
    const side = {};
    Object.entries(sourceMap).forEach(([rawKey, value]) => {
      const key = normalizeSideViewKey(rawKey, Number(rawKey) || 0);
      const item = value && typeof value === 'object' ? value : {};
      const bounds = item.bounds && typeof item.bounds === 'object' ? item.bounds : {};
      const minX = Number(bounds.minX), maxX = Number(bounds.maxX), minY = Number(bounds.minY), maxY = Number(bounds.maxY);
      if (![minX, maxX, minY, maxY].every(Number.isFinite) || !(maxX > minX && maxY > minY)) return;
      const rawCells = Array.isArray(item.cells) ? item.cells : [];
      const cells = rawCells.map((cell, index) => {
        const c = cell && typeof cell === 'object' ? cell : {};
        const x1 = Number(c.minX), x2 = Number(c.maxX), y1 = Number(c.minY), y2 = Number(c.maxY);
        if (![x1, x2, y1, y2].every(Number.isFinite) || !(x2 > x1 && y2 > y1)) return null;
        return { id: String(c.id || `back_wall_cell_${key}_${index + 1}`), ...(c.enabled === false ? { enabled: false } : {}), minX: x1, maxX: x2, minY: y1, maxY: y2 };
      }).filter(Boolean);
      const gridBounds = { minX, maxX, minY, maxY };
      if (cells.length === rawCells.length && backWallGridCellsAreValid(cells, gridBounds)) {
        const xs = new Set(cells.flatMap(cell => [cell.minX, cell.maxX]).map(value => Number(value).toFixed(6)));
        const ys = new Set(cells.flatMap(cell => [cell.minY, cell.maxY]).map(value => Number(value).toFixed(6)));
        side[key] = {
          version: 1, autoHeight: item.autoHeight === true,
          columns: Math.max(1, Math.floor(Number(item.columns) || Math.max(1, xs.size - 1))),
          rows: Math.max(1, Math.floor(Number(item.rows) || Math.max(1, ys.size - 1))),
          bounds: gridBounds, cells
        };
      }
    });
    return { side };
  }

  function explicitBackWallGridFor(d, key) {
    const normalized = normalizeSideViewKey(key, 0);
    const grid = d && d.backWallGridState && d.backWallGridState.side ? d.backWallGridState.side[normalized] : null;
    return grid && Array.isArray(grid.cells) && grid.cells.length ? grid : null;
  }

  function backWallCellsFor(d, key, rearHeight) {
    const grid = explicitBackWallGridFor(d, key);
    if (grid) {
      const normalized = normalizeSideViewKey(key, 0);
      const rawWall = sideScopedValue(d && d.backWallState, normalized, null) || {};
      const storedSegments = explicitBackWallSegmentsFor(d, normalized);
      const bounds = grid.bounds || {};
      const legacyAutomaticPlaceholder = !(Number(rawWall.height) > 0)
        && !storedSegments
        && Number(bounds.minY) === 0
        && Number(bounds.maxY) <= 1.000001;
      if (grid.autoHeight === true || legacyAutomaticPlaceholder) {
        const resolvedMaxY = Math.max(1, Number(rearHeight) || sideBackWallSettings(d, normalized, rearHeight).height);
        const oldMaxY = Number(bounds.maxY) || 1;
        return {
          ...grid,
          autoHeight: true,
          bounds: { ...bounds, minY: 0, maxY: resolvedMaxY },
          cells: grid.cells.map(cell => ({
            ...cell,
            minY: Number(cell.minY) <= 0.000001 ? 0 : Number(cell.minY) / oldMaxY * resolvedMaxY,
            maxY: Number(cell.maxY) >= oldMaxY - 0.000001 ? resolvedMaxY : Number(cell.maxY) / oldMaxY * resolvedMaxY
          }))
        };
      }
      return grid;
    }
    const segments = backWallSegmentsFor(d, key, rearHeight);
    const maxX = segments.reduce((value, item) => Math.max(value, Number(item.end) || 0), 1);
    const maxY = segments.reduce((value, item) => Math.max(value, Number(item.height) || 0), Math.max(1, Number(rearHeight) || 1));
    return {
      version: 1,
      columns: Math.max(1, segments.length), rows: 1,
      bounds: { minX: 0, maxX, minY: 0, maxY },
      cells: segments.map((item, index) => ({ id: String(item.id || `back_wall_cell_${index + 1}`), minX: Number(item.start) || 0, maxX: Number(item.end) || 0, minY: 0, maxY: Number(item.height) || maxY }))
    };
  }

  function explicitBackWallSegmentsFor(d, key) {
    const normalized = normalizeSideViewKey(key, 0);
    const list = d && d.backWallSegments && d.backWallSegments.side ? d.backWallSegments.side[normalized] : null;
    return Array.isArray(list) && list.length ? list : null;
  }

  function sideScopedValue(state, key, fallback = null) {
    const normalized = normalizeSideViewKey(key, 0);
    if (!state) return fallback;
    if (normalized === 'right') return state.right == null ? fallback : state.right;
    if (normalized === '0') return state.left == null ? fallback : state.left;
    return state.middle && state.middle[normalized] != null ? state.middle[normalized] : fallback;
  }

  function triangleDivisionCount(d, key, opening) {
    const explicit = Number(sideScopedValue(d && d.triangleDivisionState, key, NaN));
    if (Number.isFinite(explicit) && explicit >= 1) return Math.max(1, Math.round(explicit));
    const AB = Math.max(1, Number(opening) - 150);
    return Math.max(1, triangleDogramaAraDikmeSay(AB) + 1);
  }

  function sideBackWallSettings(d, key, rearHeight) {
    const raw = sideScopedValue(d && d.backWallState, key, null) || {};
    const explicitSegments = explicitBackWallSegmentsFor(d, key);
    const segmentDepth = explicitSegments ? safeExtrema(explicitSegments.map(item => Math.max(0, Number(item.end) || 0)), 'max', 0) : 0;
    return {
      enabled: raw.enabled !== false,
      xOffset: Number.isFinite(Number(raw.xOffset)) ? Number(raw.xOffset) : 0,
      depth: Math.max(1, Number(raw.depth) || K.sideWallDepth, segmentDepth),
      height: Math.max(1, Number(raw.height) || Number(rearHeight) || 1)
    };
  }

  function backWallSegmentsFor(d, key, rearHeight) {
    const explicit = explicitBackWallSegmentsFor(d, key);
    if (explicit) return explicit;
    const wall = sideBackWallSettings(d, key, rearHeight);
    return [{ id: `back_wall_${normalizeSideViewKey(key, 0)}_1`, start: 0, end: wall.depth, height: wall.height }];
  }

  function sideBackWallAnchorX(d, p, key) {
    const base = K.systemStartX - (1750 + Number(p && p.opening || 0));
    return base + sideBackWallSettings(d, key, p && p.rearHeight).xOffset;
  }

  function sideBackWallFaceX(d, p, key) {
    const grid = explicitBackWallGridFor(d, key);
    const localPositiveXEdge = grid && grid.bounds ? Number(grid.bounds.minX) || 0 : 0;
    return sideBackWallAnchorX(d, p, key) - localPositiveXEdge;
  }

  function glassTrackLocalVerticalBand(d) {
    const profile = d && d.glassTrackProfile ? d.glassTrackProfile : normalizeGlassTrackProfile();
    // Arka duvar hücrelerinin Y değerleri duvar tabanına göre lokaldir.
    // Mevcut yan görünüş sabitleri sadeleştiğinde cam kaydı üst kotu
    // frontHeight - 3, alt kotu ise profil yüksekliği kadar aşağıdadır.
    const maxY = Math.max(0, Number(d && d.frontHeight) - 3);
    const minY = maxY - Math.max(1, Number(profile.en) || 100);
    return { minY, maxY };
  }

  function sideBackWallContactFaceX(d, p, key) {
    const normalized = normalizeSideViewKey(key, p && p.index);
    const wall = sideBackWallSettings(d, normalized, p && p.rearHeight);
    if (wall.enabled === false) return null;
    const grid = backWallCellsFor(d, normalized, p && p.rearHeight);
    const band = glassTrackLocalVerticalBand(d);
    const epsilon = 0.001;
    const candidates = (grid && Array.isArray(grid.cells) ? grid.cells : []).filter(cell => {
      if (!cell || cell.enabled === false) return false;
      const minY = Number(cell.minY), maxY = Number(cell.maxY);
      if (![minY, maxY].every(Number.isFinite) || !(maxY > minY)) return false;
      return Math.min(maxY, band.maxY) - Math.max(minY, band.minY) > epsilon;
    });
    if (!candidates.length) return null;
    const localPositiveXEdge = candidates.reduce((value, cell) => Math.min(value, Number(cell.minX)), Infinity);
    if (!Number.isFinite(localPositiveXEdge)) return null;
    return sideBackWallAnchorX(d, p, normalized) - localPositiveXEdge;
  }

  function sideViewKeyForPosition(p) {
    return normalizeSideViewKey(p && p.sideViewKey != null ? p.sideViewKey : (p && p.index), p && p.index);
  }

  function sideViewScopeForKey(key) {
    const normalized = normalizeSideViewKey(key, 0);
    if (normalized === 'right') return 'right';
    if (normalized === '0') return 'left';
    return `middle_${normalized}`;
  }

  function sideFeatureEnabled(d, feature, key, positionIndex = 0) {
    const state = d && d.sideFeatureState && d.sideFeatureState[feature];
    const normalized = normalizeSideViewKey(key, positionIndex);
    if (state) {
      if (normalized === 'right') return !!state.right;
      if (normalized === '0') return !!state.left;
      return !!(state.middle && state.middle[normalized]);
    }
    if (feature === 'glassTrack') {
      const differentOpening = d.openingList && d.openingList.length > 1;
      return yes(d.glassTrack) && (!differentOpening || positionIndex === 0 || positionIndex === d.sidePositionCount - 1);
    }
    if (feature === 'triangle') {
      const differentOpening = d.openingList && d.openingList.length > 1;
      return yes(d.triangleJoinery) && (!differentOpening || positionIndex === 0 || positionIndex === d.sidePositionCount - 1);
    }
    return false;
  }

  function sideViewEnabled(d, key, positionIndex = 0) {
    const normalized = normalizeSideViewKey(key, positionIndex);
    if (normalized === 'left' || normalized === 'right' || normalized === '0') return true;
    return !!(d && d.sideFeatureState && d.sideFeatureState.middleEnabled && d.sideFeatureState.middleEnabled[normalized]);
  }

  function sideTrackLengthOffset(d, key) {
    const normalized = normalizeSideViewKey(key, 0);
    const state = d && d.glassTrackLengthOffsets;
    if (!state) return 0;
    if (normalized === 'right') return Number(state.right) || 0;
    if (normalized === '0') return Number(state.left) || 0;
    return Number(state.middle && state.middle[normalized]) || 0;
  }

  function topGlassTrackFrontRefY(d) {
    const firstOpening = nthOrLast(d && d.openingList, 0) || (d && d.opening) || 0;
    return -Number(firstOpening) + 100;
  }

  function sideSupportGeometryFor(d, p) {
    const sideViewKey = sideViewKeyForPosition(p);
    const trackVisible = sideFeatureEnabled(d, 'glassTrack', sideViewKey, p.index);
    const camW = Math.max(1, Number(p.opening) - 100 + sideTrackLengthOffset(d, sideViewKey));
    if (!trackVisible) return { exists: false, index: p.index, sideViewKey };
    const scope = sideViewScopeForKey(sideViewKey);
    const wallContactX = sideBackWallContactFaceX(d, p, sideViewKey);
    // Görünür temas yüzü yoksa mevcut çizimi ve manuel ofsetleri kararlı tutmak
    // için legacy grid sınırı yalnız yerleşim fallback'i olarak kullanılır.
    // Duvara Oturt işlemi wallContactX yokken güvenli biçimde durur.
    const wallX = Number.isFinite(wallContactX) ? wallContactX : sideBackWallFaceX(d, p, sideViewKey);
    const frontPostRearFace = K.sideBaseX - K.postSize;
    const defaultCenterX = (wallX + frontPostRearFace) / 2;
    const explicitMap = d.sidePosts && typeof d.sidePosts === 'object' ? d.sidePosts : {};
    const hasExplicit = Object.prototype.hasOwnProperty.call(explicitMap, sideViewKey);
    let rawPosts = hasExplicit && Array.isArray(explicitMap[sideViewKey]) ? explicitMap[sideViewKey] : null;
    const autoSupportSuppressed = !!(d.sideAutoSupportSuppressed && d.sideAutoSupportSuppressed[sideViewKey] === true);
    // 5000 mm üzerindeki cam kaydı açıklığında destek ilk kez otomatik gelir.
    // Eski/boş state otomatik davranışı korur; yalnız açık kullanıcı silme intent'i
    // bu yan görünüş için otomatik desteğin yeniden oluşmasını bastırır.
    if (camW > 5000 && !autoSupportSuppressed && (!rawPosts || rawPosts.length === 0)) {
      rawPosts = [{
        id: `auto_side_${sideViewKey}_0`,
        centerX: Number(d.sideSupportCenters && d.sideSupportCenters[sideViewKey]) || defaultCenterX,
        profile: supportProfileFor(d, scope)
      }];
    } else if (!rawPosts) rawPosts = [];
    const posts = rawPosts.map((raw, i) => {
      const profile = normalizeGlassTrackProfile(raw && raw.profile ? raw.profile : supportProfileFor(d, scope));
      const extension = Number(raw && raw.extension);
      return { id: String((raw && raw.id) || `side_${sideViewKey}_${i}`), centerX: Number(raw && raw.centerX), profile, extension: Number.isFinite(extension) ? extension : 0 };
    }).filter(post => Number.isFinite(post.centerX)).sort((a, b) => a.centerX - b.centerX);
    let cursor = wallX;
    const normalizedPosts = [];
    posts.forEach((post, i) => {
      const width = Math.max(1, Number(post.profile.en) || 100);
      const minCenter = cursor + width / 2;
      const remaining = posts.slice(i + 1).reduce((sum, next) => sum + Math.max(1, Number(next.profile.en) || 100), 0);
      const maxCenter = frontPostRearFace - remaining - width / 2;
      const centerX = clamp(post.centerX, minCenter, Math.max(minCenter, maxCenter));
      const left = centerX - width / 2;
      const right = centerX + width / 2;
      // Üst görünüş kesiti yan görünüşteki gerçek dikme merkezinden 1:1 taşınır.
      // Kullanıcı kuralı: yan görünüşte +X hareket, üst görünüşte aynı miktarda
      // -Y harekettir. Cam kaydının duvar tarafındaki ucu sabit referanstır.
      // Bu nedenle ölçek/oran kullanılmaz; arka duvardan olan gerçek mesafe
      // doğrudan üst görünüşte cam kaydı boyunca ters yönde uygulanır.
      const distanceFromWall = centerX - wallX;
      const trackFrontY = topGlassTrackFrontRefY(d);
      const trackLength = Math.max(1, camW);
      const trackWallEndY = trackFrontY + trackLength;
      const topCenterY = trackWallEndY - distanceFromWall;
      normalizedPosts.push({ ...post, width, centerX, left, right, topCenterY, distanceFromWall });
      cursor = right;
    });
    const gaps = [];
    let leftBoundary = wallX;
    normalizedPosts.forEach((post, i) => {
      gaps.push({ index: i, left: leftBoundary, right: post.left, width: Math.max(0, post.left - leftBoundary), rightPostId: post.id });
      leftBoundary = post.right;
    });
    gaps.push({ index: normalizedPosts.length, left: leftBoundary, right: frontPostRearFace, width: Math.max(0, frontPostRearFace - leftBoundary), leftPostId: normalizedPosts.length ? normalizedPosts[normalizedPosts.length - 1].id : '' });
    const rectStartY = -(p.opening + (p.rearHeight - d.frontHeight) + K.frontViewExtraDrop) + (Number(d.sideGlobalShiftY) || 0);
    const localFrontParapet = sideParapetHeightAt(d, p.index, K.sideBaseX - K.postSize / 2, wallX, sideViewKey);
    const dikH = Math.max(1, d.frontHeight - K.onPostHeightCorrection - localFrontParapet);
    const yanPostUstY = rectStartY - K.onPostTopDrop;
    const yanAltY = yanPostUstY - dikH;
    const duvarY = yanAltY - K.altBlockCorrection - localFrontParapet;
    const profile = d.glassTrackProfile || normalizeGlassTrackProfile();
    const camBottomY = rectStartY - 3 - profile.en;
    return {
      exists: true, index: p.index, sideViewKey, scope, posts: normalizedPosts, gaps, wallX,
      wallContactX: Number.isFinite(wallContactX) ? wallContactX : null,
      hasWallContact: Number.isFinite(wallContactX),
      frontPostRearFace, defaultCenterX,
      productClearHeight: Math.max(1, camBottomY - duvarY),
      wallToSupportGap: gaps[0] ? gaps[0].width : 0,
      supportToPostGap: gaps[gaps.length - 1] ? gaps[gaps.length - 1].width : 0,
      left: normalizedPosts[0] ? normalizedPosts[0].left : null,
      right: normalizedPosts.length ? normalizedPosts[normalizedPosts.length - 1].right : null,
      centerX: normalizedPosts[0] ? normalizedPosts[0].centerX : null,
      supportWidth: normalizedPosts[0] ? normalizedPosts[0].width : 0,
      topCenterY: normalizedPosts[0] ? normalizedPosts[0].topCenterY : null
    };
  }

  function normalizeInput(raw) {
    const d = { ...SAMPLE_INPUT, ...(raw || {}) };

    // PERI01 Excel akışı:
    // Ana sayfadaki değerler önce gizli Sayfa1'e dönüştürülür, LISP da çizimi Sayfa1 üzerinden yapar.
    // WebDXF artık bu detayı aynen izler.
    d.formRaw = { ...d };
    const rules = multiRules();
    const br = bridge();
    let independentTopology = null;
    if (rules) {
      const limits = runtimeLimits();
      const independent = typeof rules.parseIndependentPergoRiseInput === 'function'
        ? rules.parseIndependentPergoRiseInput(d.formRaw, { standardGap: K.defaultSystemGap, minNoGap: K.defaultSystemGap, maxRaysPerSystem: limits.maxRaysPerSystem })
        : { ok: true, independent: false };
      if (independent && independent.independent) {
        if (!independent.ok) throw new Error(`Bağımsız PergoRise kuralı geçersiz: ${independent.code}`);
        if (independent.totalPositionCount > limits.maxSystems) throw new Error(`Poz/sistem sınırı aşıldı (${independent.totalPositionCount}/${limits.maxSystems}).`);
        independentTopology = independent;
        const originalFormRaw = { ...d.formRaw };
        const auto = br && typeof br.autoRayPostCount === 'function'
          ? br.autoRayPostCount(String(independent.totalPositionCount), originalFormRaw.width, originalFormRaw.frontHeight, originalFormRaw.glassTrack, originalFormRaw.glassRayBoundaryMode, originalFormRaw.__sideFeatureState)
          : null;
        const rayText = String(originalFormRaw.rayCount || '').trim()
          ? independent.rayCountText
          : (auto && Array.isArray(auto.rayList) ? auto.rayList.join(';') : '');
        let postCountText = '';
        if (String(originalFormRaw.postCount || '').trim()) {
          postCountText = String(independent.groups.reduce((total, group, groupIndex) => {
            const values = independent.postCount.groups[groupIndex].values || [];
            if (!values.length) return total;
            const expressionTokens = String(independent.postCount.groups[groupIndex].expression || '').split(';').map(item => item.trim()).filter(Boolean);
            const groupTotal = expressionTokens.length <= 1 ? Number(values[0] || 0) : Math.max(0, values.reduce((sum, value) => sum + Number(value || 0), 0) - Math.max(0, group.positionCount - 1));
            return total + groupTotal;
          }, 0));
        } else if (auto && Number.isFinite(Number(auto.postCount))) postCountText = String(auto.postCount);
        d.formRawOriginal = originalFormRaw;
        d.formRaw = {
          ...originalFormRaw,
          systemCount: String(independent.totalPositionCount),
          width: independent.legacyWidthText,
          opening: independent.openingText,
          rearHeight: independent.rearHeightText,
          frontHeight: independent.frontHeightText,
          rayCount: rayText,
          postCount: postCountText
        };
        // Node/CLI testleri Excel bridge olmadan da aynı normalize yolunu kullanır.
        // Bağımsız grup modu, eski bridge'in ':' ayırıcısını mekanizma boşluğu sanmasına izin vermez.
        Object.assign(d, {
          systemCount: d.formRaw.systemCount, width: d.formRaw.width, opening: d.formRaw.opening,
          rearHeight: d.formRaw.rearHeight, frontHeight: d.formRaw.frontHeight,
          rayCount: d.formRaw.rayCount, postCount: d.formRaw.postCount
        });
        d.independentPergoRiseTopology = independent;
      } else {
        const countResult = rules.systemCount(d.formRaw.systemCount, limits.maxSystems);
        if (!countResult.ok) throw new Error(`Sistem adedi geçersiz: ${countResult.code}`);
        const count = countResult.count;
        const widthResult = rules.parseWidth(d.formRaw.width, count, { standardGap: K.defaultSystemGap, minNoGap: K.defaultSystemGap });
        if (!widthResult.ok) throw new Error(`Çoklu poz genişlik kuralı geçersiz: ${widthResult.code}`);
        const positionChecks = [
          ['Açılım', rules.parsePositionValues(d.formRaw.opening, count, { allowSingle: true, minimum: 1 })],
          ['Arka yükseklik', rules.parsePositionValues(d.formRaw.rearHeight, count, { allowSingle: true, minimum: 1 })],
          ['Ön yükseklik', rules.parsePositionValues(d.formRaw.frontHeight, count, { firstOnly: true, minimum: 1 })],
          ['Ray sayısı', rules.parsePositionValues(d.formRaw.rayCount, count, { allowBlank: true, allowSingle: true, minimum: 1, maximum: limits.maxRaysPerSystem })]
        ];
        const invalid = positionChecks.find(([, result]) => !result.ok);
        if (invalid) throw new Error(`${invalid[0]} çoklu poz kuralı geçersiz: ${invalid[1].code}`);
      }
    }
    d.sayfa1 = br ? br.buildSayfa1Data(d.formRaw || d) : null;
    if (d.sayfa1) {
      d.width = independentTopology ? d.formRaw.width : d.sayfa1.B1_width;
      d.opening = independentTopology ? d.formRaw.opening : d.sayfa1.B2_opening;
      d.rearHeight = independentTopology ? d.formRaw.rearHeight : d.sayfa1.B3_rearHeight;
      d.frontHeight = independentTopology ? d.formRaw.frontHeight : d.sayfa1.B4_frontHeight;
      d.rayCount = independentTopology ? d.formRaw.rayCount : d.sayfa1.B7_rayCount;
      d.postCount = independentTopology ? d.formRaw.postCount : d.sayfa1.B8_postCount;
      d.parapet = d.sayfa1.B5_parapet;
      d.parapetHeight = d.sayfa1.B6_parapetHeight;
      d.glassTrack = d.sayfa1.B9_glassTrack;
      d.glassRayBoundaryMode = d.sayfa1.B9c_glassRayBoundaryMode || d.formRaw.glassRayBoundaryMode || 'DARALT';
      d.sideTrack = d.sayfa1.B9b_sideTrack || d.formRaw.sideTrack || 'HAYIR';
      d.waterStandard = d.sayfa1.B10_waterStandard;
      d.structureColor = d.sayfa1.B12_structureColor;
      d.fabric = d.sayfa1.B13_fabric;
      d.fabricProfiles = d.sayfa1.B14_fabricProfiles;
      d.motor = d.sayfa1.B15_motor;
      d.remote = d.sayfa1.B16_remote;
      d.led = d.sayfa1.B17_led;
      d.dimmer = d.sayfa1.B18_dimmer;
      d.extras = d.sayfa1.B19_extras;
      d.customer = d.sayfa1.B21_customer;
      d.project = d.sayfa1.B22_project;
      d.version = d.sayfa1.B23_version;
      d.drawnBy = d.sayfa1.B24_drawnBy;
      d.date = d.sayfa1.B25_date;
      d.systemCount = independentTopology ? d.formRaw.systemCount : d.sayfa1.B27_systemCount;
      d.triangleJoinery = d.sayfa1.B29_triangleJoinery;
    }

    d.systemCount = Math.max(1, intValue(d.systemCount, 1));
    d.openingList = realList(d.opening, SAMPLE_INPUT.opening).map(v => Math.max(500, v));
    d.rearHeightList = realList(d.rearHeight, SAMPLE_INPUT.rearHeight).map(v => Math.max(500, v));
    d.frontHeightList = realList(d.frontHeight, SAMPLE_INPUT.frontHeight).map(v => Math.max(0, v));
    d.opening = d.openingList[0];
    d.rearHeight = d.rearHeightList[0];
    d.frontHeight = Math.max(0, nthOrLast(d.frontHeightList, 0) || numberValue(d.frontHeight, SAMPLE_INPUT.frontHeight));
    // Ray sayısı noktalı virgüllü olabilir (örn. 3;2;4).
    // Burada ilk değere indirgemiyoruz; buildSystems tüm listeyi okuyacak.
    d.rayCountText = String(d.rayCount ?? '').trim();
    d.postCount = Math.max(0, intValue(d.postCount, SAMPLE_INPUT.postCount));
    if (d.postCount > runtimeLimits().maxFrontPosts) throw new Error(`Ön dikme sınırı ${runtimeLimits().maxFrontPosts}.`);
    d.manualPostPlacementMode = String((raw && raw.__manualPostPlacementMode) || 'standard').trim().toLowerCase() === 'equal' ? 'equal' : 'standard';
    d.parapetHeight = yes(d.parapet) ? Math.max(0, numberValue(d.parapetHeight, 0)) : 0;
    d.customer = textValue(d.customer, '-');
    d.project = textValue(d.project, '-');
    d.version = textValue(d.version, '01');
    d.drawnBy = textValue(d.drawnBy, 'AYETULLAH KILINC');
    d.date = textValue(d.date, SAMPLE_INPUT.date);
    d.structureColor = textValue(d.structureColor);
    d.fabric = textValue(d.fabric);
    d.fabricProfiles = textValue(d.fabricProfiles);
    d.motor = textValue(d.motor);
    d.remote = textValue(d.remote);
    d.led = textValue(d.led);
    d.dimmer = textValue(d.dimmer);
    d.extras = textValue(normalizeExtrasText(d.extras));
    d.sideTrack = textValue(d.sideTrack, 'HAYIR');
    { const placement = String((raw && raw.waterOutletPlacement) || d.waterOutletPlacement || 'BOTH').trim().toUpperCase(); d.waterOutletPlacement = ['FRONT','SIDES','BOTH'].includes(placement) ? placement : 'BOTH'; }
    d.glassTrackProfile = normalizeGlassTrackProfile(raw && raw.__glassTrackProfile);
    d.glassTrackSupportProfiles = {
      left: normalizeGlassTrackProfile(raw && raw.__glassTrackSupportProfiles && raw.__glassTrackSupportProfiles.left ? raw.__glassTrackSupportProfiles.left : d.glassTrackProfile),
      right: normalizeGlassTrackProfile(raw && raw.__glassTrackSupportProfiles && raw.__glassTrackSupportProfiles.right ? raw.__glassTrackSupportProfiles.right : d.glassTrackProfile)
    };
    d.sideFeatureState = normalizeSideFeatureState(raw && raw.__sideFeatureState, d);
    d.glassRayBoundaryMode = normalizedGlassRayBoundaryMode(d.glassRayBoundaryMode || (raw && raw.glassRayBoundaryMode));
    d.glassTrackLengthOffsets = normalizeGlassTrackLengthOffsets(raw && raw.__glassTrackLengthOffsets);
    d.triangleDivisionState = normalizeTriangleDivisionState(raw && raw.__triangleDivisionState);
    d.backWallState = normalizeBackWallState(raw && raw.__backWallState);
    d.backWallSegmentsRaw = raw && raw.__backWallSegments && typeof raw.__backWallSegments === 'object' ? raw.__backWallSegments : null;
    d.backWallGridStateRaw = raw && raw.__backWallGridState && typeof raw.__backWallGridState === 'object' ? raw.__backWallGridState : null;
    d.trapezSheetBounds = raw && raw.__trapezSheetBounds && typeof raw.__trapezSheetBounds === 'object' ? raw.__trapezSheetBounds : {};
    d.hiddenDimensionIds = normalizedHiddenDimensionIds(raw && raw.__hiddenDimensionIds);
    d.frontPostProfiles = Array.isArray(raw && raw.__frontPostProfiles)
      ? raw.__frontPostProfiles.map(item => item ? normalizeGlassTrackProfile(item) : null)
      : [];
    { const source = raw && raw.__horizontalFacadeProfiles && typeof raw.__horizontalFacadeProfiles === 'object' ? raw.__horizontalFacadeProfiles : {};
      const normalizeHorizontal = (list) => (Array.isArray(list) ? list : []).map((item, index) => ({
        id: String(item && item.id || `hpf_legacy_${index + 1}`), orientation: 'horizontal', zoneId: String(item && item.zoneId || ''),
        view: String(item && item.view || 'front'), sideViewKey: String(item && item.sideViewKey || ''), sideIndex: Math.max(0, Number(item && item.sideIndex || 0) || 0), sideGapIndex: Math.max(0, Number(item && item.sideGapIndex || 0) || 0),
        positionYRatio: clamp(Number(item && item.positionYRatio) || .5, .01, .99), width: clamp(Math.round(Number(item && item.width) || 100), 40, 300), depth: clamp(Math.round(Number(item && item.depth) || 100), 30, 300), label: String(item && item.label || 'Yatay Profil')
      }));
      d.horizontalFacadeProfiles = { front: normalizeHorizontal(source.front), side: Object.fromEntries(Object.entries(source.side && typeof source.side === 'object' ? source.side : {}).map(([key,list]) => [String(key), normalizeHorizontal(list)])) };
    }
    d.sidePosts = raw && raw.__sidePosts && typeof raw.__sidePosts === 'object'
      ? Object.fromEntries(Object.entries(raw.__sidePosts).map(([key, items]) => [String(key), Array.isArray(items) ? items.map((item, i) => {
          const extension = Number(item && item.extension);
          return { id: String((item && item.id) || `side_${key}_${i}`), centerX: Number(item && item.centerX), profile: normalizeGlassTrackProfile(item && item.profile), extension: Number.isFinite(extension) ? extension : 0 };
        }).filter(item => Number.isFinite(item.centerX)) : []]))
      : {};
    d.sideAutoSupportSuppressed = raw && raw.__sideAutoSupportSuppressed && typeof raw.__sideAutoSupportSuppressed === 'object'
      ? Object.fromEntries(Object.entries(raw.__sideAutoSupportSuppressed).filter(([, value]) => value === true).map(([key]) => [String(key), true]))
      : {};
    d.customRayPositions = raw && raw.__customRayPositions && typeof raw.__customRayPositions === 'object' ? raw.__customRayPositions : null;
    d.frontPostExtensions = Array.isArray(raw && raw.__frontPostExtensions) ? raw.__frontPostExtensions.map(value => Math.max(0, Number(value) || 0)) : [];
    d.parapetSegmentsRaw = raw && raw.__parapetSegments && typeof raw.__parapetSegments === 'object' ? raw.__parapetSegments : null;
    d.topBackWallSegmentsRaw = raw && raw.__topBackWallSegments && typeof raw.__topBackWallSegments === 'object' ? raw.__topBackWallSegments : null;
    d.topBackWallGridStateRaw = raw && raw.__topBackWallGridState && typeof raw.__topBackWallGridState === 'object' ? raw.__topBackWallGridState : null;
    d.rearSupport = normalizeRearSupport(raw && raw.__rearSupport);
    d.gutterEditState = normalizeGutterEditState(raw && raw.__gutterEditState);
    d.waterOutletPipeState = normalizeWaterOutletPipeState(raw && raw.__waterOutletPipeState);
    d.upperTableTransform = normalizeUpperTableTransform(raw && raw.__upperTableTransform);
    d.customFrontPostCenters = Array.isArray(raw && raw.__frontPostCenters)
      ? raw.__frontPostCenters.map(Number).filter(Number.isFinite)
      : null;
    d.sideSupportCenters = raw && raw.__sideSupportCenters && typeof raw.__sideSupportCenters === 'object'
      ? Object.fromEntries(Object.entries(raw.__sideSupportCenters).map(([key, value]) => [String(key), Number(value)]).filter(([, value]) => Number.isFinite(value)))
      : {};
    d.slidingPlacements = Array.isArray(raw && raw.__slidingPlacements)
      ? raw.__slidingPlacements.map((item, index) => normalizeSlidingPlacement(item, index)).filter(Boolean)
      : [];
    d.sideSlidingPlacements = Array.isArray(raw && raw.__sideSlidingPlacements)
      ? raw.__sideSlidingPlacements.map((item, index) => normalizeSideSlidingPlacement(item, index)).filter(Boolean)
      : [];
    d.guillotinePlacements = Array.isArray(raw && raw.__guillotinePlacements)
      ? raw.__guillotinePlacements.map((item, index) => normalizeGuillotinePlacement(item, index)).filter(Boolean)
      : [];
    d.sideGuillotinePlacements = Array.isArray(raw && raw.__sideGuillotinePlacements)
      ? raw.__sideGuillotinePlacements.map((item, index) => normalizeSideGuillotinePlacement(item, index)).filter(Boolean)
      : [];
    d.zipScreenPlacements = Array.isArray(raw && raw.__zipScreenPlacements)
      ? raw.__zipScreenPlacements.map((item, index) => normalizeZipScreenPlacement(item, index)).filter(Boolean)
      : [];
    d.sideZipScreenPlacements = Array.isArray(raw && raw.__sideZipScreenPlacements)
      ? raw.__sideZipScreenPlacements.map((item, index) => normalizeSideZipScreenPlacement(item, index)).filter(Boolean)
      : [];

    const sys = buildSystems(d, d);
    d.systems = sys.systems;
    d.systemCount = sys.systemCount;
    d.noGapMode = sys.noGapMode;
    d.independentMode = !!independentTopology;
    d.independentSideViewVisibility = raw && raw.__independentSideViewVisibility && typeof raw.__independentSideViewVisibility === 'object'
      ? JSON.parse(JSON.stringify(raw.__independentSideViewVisibility)) : {};
    d.independentPergoRiseGroups = [];
    if (independentTopology) {
      let systemCursor = 0;
      independentTopology.groups.forEach((sourceGroup, groupIndex) => {
        const groupSystems = d.systems.slice(systemCursor, systemCursor + sourceGroup.positionCount);
        const firstSystem = groupSystems[0] || null;
        const lastSystem = groupSystems[groupSystems.length - 1] || firstSystem;
        const group = {
          id: sourceGroup.groupId, groupId: sourceGroup.groupId, groupIndex,
          positionStartIndex: systemCursor, positionEndIndex: systemCursor + sourceGroup.positionCount - 1,
          positionCount: sourceGroup.positionCount,
          gapAfterGroup: sourceGroup.gapAfterGroup,
          yAlignmentMode: sourceGroup.yAlignmentMode,
          alignTopViewStartYToFirstPosition: sourceGroup.alignTopViewStartYToFirstPosition === true,
          outerStartX: firstSystem ? Number(firstSystem.outerStartX) : K.systemStartX,
          outerEndX: lastSystem ? Number(lastSystem.outerEndX) : K.systemStartX,
          systems: groupSystems
        };
        groupSystems.forEach((system, localIndex) => {
          system.independentGroupId = sourceGroup.groupId;
          system.independentGroupIndex = groupIndex;
          system.groupPositionIndex = localIndex;
          system.positionId = sourceGroup.positions[localIndex] ? sourceGroup.positions[localIndex].positionId : `${sourceGroup.groupId}-P${String(localIndex + 1).padStart(2, '0')}`;
          system.isGroupStart = localIndex === 0;
          system.isGroupEnd = localIndex === groupSystems.length - 1;
          system.gapAfterGroup = system.isGroupEnd ? sourceGroup.gapAfterGroup : null;
        });
        d.independentPergoRiseGroups.push(group);
        systemCursor += sourceGroup.positionCount;
      });
      d.independentPergoRiseGroups.forEach((group, groupIndex) => {
        const autoPostCount = independentGroupAutomaticPostCenters(d, group).length;
        const configured = independentTopology.groups[groupIndex] && independentTopology.groups[groupIndex].postCountValues || [];
        const expression = independentTopology.postCount && independentTopology.postCount.groups[groupIndex]
          ? String(independentTopology.postCount.groups[groupIndex].expression || '').trim() : '';
        const tokenCount = expression ? expression.split(';').map(item => item.trim()).filter(Boolean).length : 0;
        group.postCount = configured.length
          ? Math.max(0, Math.round(tokenCount <= 1 ? Number(configured[0]) : configured.reduce((sum, value) => sum + Number(value || 0), 0) - Math.max(0, group.positionCount - 1)))
          : autoPostCount;
      });
      d.postCount = d.independentPergoRiseGroups.reduce((sum, group) => sum + group.postCount, 0);
    }
    d.explicitWidth = sys.explicitWidth;
    d.explicitRay = sys.explicitRay;
    d.totalRayCount = d.systems.reduce((a, sys) => a + (Number(sys.rayCount) || 0), 0);
    d.rayCount = d.systems.length === 1 ? (d.systems[0].rayCount || 0) : d.totalRayCount;
    d.width = sys.totalNet;
    d.nominalWidth = sys.totalNominal;
    d.systemStartX = K.systemStartX;
    d.systemEndX = K.systemStartX + d.width;
    d.rayAreaStartX = d.systems[0].rayAreaStartX;
    d.rayAreaEndX = d.systems[d.systems.length - 1].rayAreaEndX;
    d.raySystemW = Math.max(K.rayW, d.rayAreaEndX - d.rayAreaStartX);

    d.positionCount = Math.max(d.systemCount, d.openingList.length, d.rearHeightList.length);
    d.sidePositionCount = Math.max(1, d.openingList.length);
    d.positions = [];
    for (let i = 0; i < d.positionCount; i += 1) {
      const opening = nthOrLast(d.openingList, i) || d.opening;
      const rearHeight = nthOrLast(d.rearHeightList, i) || d.rearHeight;
      const widthSystem = d.systems[i] || d.systems[d.systems.length - 1] || null;
      const frontHeight = nthOrLast(d.frontHeightList, i);
      d.positions.push({
        id: widthSystem && widthSystem.positionId ? widthSystem.positionId : `position_${i + 1}`,
        positionId: widthSystem && widthSystem.positionId ? widthSystem.positionId : `position_${i + 1}`,
        index: i,
        independentGroupId: widthSystem && widthSystem.independentGroupId ? widthSystem.independentGroupId : 'IPR-01',
        independentGroupIndex: widthSystem && Number.isFinite(Number(widthSystem.independentGroupIndex)) ? Number(widthSystem.independentGroupIndex) : 0,
        groupPositionIndex: widthSystem && Number.isFinite(Number(widthSystem.groupPositionIndex)) ? Number(widthSystem.groupPositionIndex) : i,
        width: widthSystem ? Number(widthSystem.mechanismWidth) : 0,
        systemWidth: widthSystem ? Number(widthSystem.mechanismWidth) : 0,
        outerWidth: widthSystem ? Number(widthSystem.nominalWidth) : 0,
        opening, rearHeight, frontHeight,
        yAlignmentMode: independentTopology && independentTopology.groups[widthSystem && widthSystem.independentGroupIndex || 0]
          ? independentTopology.groups[widthSystem.independentGroupIndex].yAlignmentMode : 'FRONT_GUTTER_ALIGNED',
        rayLength: rayLenFor(opening, rearHeight, frontHeight),
        angleRad: sideAngleRadFor(opening, rearHeight, frontHeight)
      });
    }
    d.parapetSegments = normalizeParapetSegmentsState(d.parapetSegmentsRaw, d);
    d.backWallSegments = normalizeBackWallSegmentsState(d.backWallSegmentsRaw, d);
    d.backWallGridState = normalizeBackWallGridState(d.backWallGridStateRaw);
    d.frontPostExtensions = Array.from({ length: d.postCount }, (_, i) => Math.max(0, Number(d.frontPostExtensions[i]) || 0));
    d.maxOpening = safeExtrema(d.positions.map(p => p.opening), 'max', d.opening);
    d.topBackWallSegments = normalizeTopBackWallSegmentsState(d.topBackWallSegmentsRaw, d);
    d.topBackWallGridState = normalizeTopBackWallGridState(d.topBackWallGridStateRaw, d);
    d.lastOpening = d.positions[d.positions.length - 1].opening;
    d.maxRearHeight = safeExtrema(d.positions.map(p => p.rearHeight), 'max', d.rearHeight);
    // Çoklu ve farklı açılımlı sistemlerde üst görünüşün en alt kotu, en büyük açılıma göre oluşur.
    // Ön görünüş bu yüzden maxOpening referansına göre aşağı alınır. Aynı global kayma,
    // yan görünüş grubuna da uygulanır ki ön/yan görünüşler aynı yatay referans sisteminde kalsın.
    d.frontRayTopRefY = -d.maxOpening - K.frontViewExtraDrop;
    d.commonFrontRectStartY = d.frontRayTopRefY - d.maxRearHeight + d.frontHeight;
    // V13.32: ':' bağımsız grup yerleşiminde yatay sıra referansı ilk SOL yan görünüş
    // arka duvarının -Y ucudur. Ön görünüş ve son SAĞ yan görünüş bu aynı kotu kullanır.
    const firstPosition = d.positions && d.positions[0] ? d.positions[0] : null;
    const firstFrontHeight = firstPosition && Number.isFinite(Number(firstPosition.frontHeight)) ? Number(firstPosition.frontHeight) : d.frontHeight;
    d.independentLeftRearWallMinusY = d.commonFrontRectStartY - firstFrontHeight;
    d.independentFrontRectStartY = d.independentLeftRearWallMinusY + d.frontHeight;
    const firstRawRectStartY = -(d.opening + (d.rearHeight - firstFrontHeight) + K.frontViewExtraDrop);
    const firstRawRearWallMinusY = firstRawRectStartY - firstFrontHeight;
    d.sideGlobalShiftY = d.independentMode
      ? d.independentLeftRearWallMinusY - firstRawRearWallMinusY
      : d.commonFrontRectStartY - (-(d.opening + (d.rearHeight - d.frontHeight) + K.frontViewExtraDrop));
    d.rectStartY = d.independentMode ? d.independentFrontRectStartY : d.commonFrontRectStartY;
    d.solX = K.gutterX + K.postSize;
    d.sagX = K.gutterX + d.width;
    d.posY = -d.opening;
    d.rayWidth = K.rayW;
    d.postSize = K.postSize;
    d.angleRad = sideAngleRadFor(d.opening, d.rearHeight, d.frontHeight);
    d.angle = Math.abs(d.angleRad) * 180 / Math.PI;
    d.rayLength = rayLenFor(d.opening, d.rearHeight, d.frontHeight);
    d.uzunluk = d.opening - K.rayLengthFrontDeduct;
    d.postCenterXs = postCenterXs(d);
    if (d.independentMode) {
      let postCursor = 0;
      (d.independentPergoRiseGroups || []).forEach(group => {
        group.positions = d.positions.slice(group.positionStartIndex, group.positionEndIndex + 1);
        const count = Math.max(0, Number(group.postCount) || 0);
        group.postCenterXs = d.postCenterXs.slice(postCursor, postCursor + count);
        postCursor += count;
      });
    }
    d.frontPostProfiles = Array.from({ length: d.postCenterXs.length }, (_, i) => d.frontPostProfiles[i] || null);
    d.frontPostWidths = d.postCenterXs.map((_, i) => frontPostWidthAt(d, i));
    assertGeometryLimits(d);
    d.sideSupportGeometry = {};
    d.positions.slice(0, d.sidePositionCount).forEach(p => {
      const key = String(p.index);
      const geom = sideSupportGeometryFor(d, { ...p, sideViewKey: key });
      if (geom.exists) d.sideSupportGeometry[key] = geom;
    });
    d.rightSideSupportGeometry = null;
    const rightPositionIndex = Math.max(0, d.sidePositionCount - 1);
    if (d.positions[rightPositionIndex]) {
      const rightGeom = sideSupportGeometryFor(d, { ...d.positions[rightPositionIndex], index: rightPositionIndex, sideViewKey: 'right' });
      if (rightGeom.exists) d.rightSideSupportGeometry = rightGeom;
    }
    // v8.9.27: Ürün ölçüleri, detay formunda kullanıcının kaydettiği gerçek değerlerdir.
    // Ön/yan aralık, parapet veya dikme geometrisi değiştiğinde ürün ölçüleri otomatik
    // olarak yeniden zorlanmaz. Otomatik başlangıç değeri ürün ekleme ekranında hesaplanır;
    // sonrasında kullanıcı manuel değer girebilir. Yeniden otomatik sığdırma yalnız
    // “Ürünü Alana Uydur” komutuyla yapılır.
    d.slidingPlacements = (d.slidingPlacements || [])
      .filter(item => item.gapIndex < d.postCenterXs.length - 1)
      .map(item => {
        const width = Math.max(1, Number(item.width) || 1);
        let panelCount = Math.max(2, Math.round(Number(item.panelCount) || 2));
        if (String(item.panelCountMode || 'AUTO').toUpperCase() !== 'MANUAL') {
          panelCount = Math.max(2, Math.ceil(width / 1200));
          if (item.openingType === 'CENTER OPENING') {
            panelCount = Math.max(4, panelCount);
            if (panelCount % 2 !== 0) panelCount += 1;
          }
        }
        return { ...item, width, height: Math.max(1, Number(item.height) || 1), panelCount };
      });
    d.guillotinePlacements = (d.guillotinePlacements || [])
      .filter(item => item.gapIndex < d.postCenterXs.length - 1)
      .map(item => ({ ...item, width: Math.max(1, Number(item.width) || 1), height: Math.max(1, Number(item.height) || 1) }));
    d.zipScreenPlacements = (d.zipScreenPlacements || [])
      .filter(item => item.gapIndex < d.postCenterXs.length - 1)
      .map(item => ({ ...item, width: Math.max(1, Number(item.width) || 1), height: Math.max(1, Number(item.height) || 1), panelCount: 1 }));
    const normalizeSidePlacementGeometry = item => {
      const key = normalizeSideViewKey(item && item.sideViewKey, Number(item && item.sideIndex) || 0);
      const geom = key === 'right' ? d.rightSideSupportGeometry : d.sideSupportGeometry[key];
      if (!geom || !geom.exists) return null;
      const gapIndex = Math.max(0, Number(item.sideGapIndex) || 0);
      const gap = Array.isArray(geom.gaps) ? geom.gaps[gapIndex] : null;
      if (!gap || !(Number(gap.width) > 0)) return null;
      return { ...item, width: Math.max(1, Number(item.width) || 1), height: Math.max(1, Number(item.height) || 1) };
    };
    d.sideSlidingPlacements = (d.sideSlidingPlacements || []).map(normalizeSidePlacementGeometry).filter(Boolean).map(item => {
      let panelCount = Math.max(2, Math.round(Number(item.panelCount) || 2));
      if (String(item.panelCountMode || 'AUTO').toUpperCase() !== 'MANUAL') {
        panelCount = Math.max(2, Math.ceil(item.width / 1200));
        if (item.openingType === 'CENTER OPENING') { panelCount = Math.max(4, panelCount); if (panelCount % 2 !== 0) panelCount += 1; }
      }
      return { ...item, panelCount };
    });
    d.sideGuillotinePlacements = (d.sideGuillotinePlacements || []).map(normalizeSidePlacementGeometry).filter(Boolean);
    d.sideZipScreenPlacements = (d.sideZipScreenPlacements || []).map(normalizeSidePlacementGeometry).filter(Boolean).map(item => ({ ...item, panelCount: 1 }));
    return d;
  }

  function makeEntitySink() {
    const entities = [];
    function push(e) { entities.push(e); return e; }
    return {
      entities,
      line(x1, y1, x2, y2, layer = 'OUTLINE') { return push({ type: 'line', x1, y1, x2, y2, layer }); },
      rect(x, y, w, h, layer = 'OUTLINE') {
        const x2 = x + w, y2 = y + h;
        return push({ type: 'polyline', points: [[x, y], [x2, y], [x2, y2], [x, y2]], closed: true, layer });
      },
      poly(points, closed = false, layer = 'OUTLINE') { return push({ type: 'polyline', points, closed, layer }); },
      text(x, y, value, height = 90, layer = 'TEXT', align = 'left', rotation = 0) { return push({ type: 'text', x, y, value: String(value ?? ''), height, layer, align, rotation }); },
      mtext(x, y, value, height = 90, width = 1000, layer = 'TEXT', align = 'left', rotation = 0, lineSpacing = 1.15) { return push({ type: 'mtext', x, y, value: String(value ?? ''), height, width, layer, align, rotation, lineSpacing }); },
      dimension(data) { return push({ type: 'dimension', layer: 'DIM', style: 'MESUT-MM', ...(data || {}) }); },
      insert(name, x, y, options = {}) { return push({ type: 'insert', name: String(name ?? ''), x, y, layer: options.layer || 'BLOCKREF', rotation: options.rotation || 0, scaleX: options.scaleX || 1, scaleY: options.scaleY || 1, previewW: options.previewW || 120, previewH: options.previewH || 80, noMirror: options.noMirror === true }); }
    };
  }

  function dimMeasuredText(value) {
    const n = Number(value);
    return Number.isFinite(n) ? String(Math.round(Math.abs(n))) : '<>';
  }

  function dimArrowPoly(x, y, angle, size = 100, layer = 'DIM') {
    const ux = Math.cos(angle), uy = Math.sin(angle);
    const nx = -uy, ny = ux;
    const tailX = x + ux * size;
    const tailY = y + uy * size;
    const hw = size * 0.34;
    return { type: 'polyline', layer, closed: true, points: [[x, y], [tailX + nx * hw, tailY + ny * hw], [tailX - nx * hw, tailY - ny * hw]], color: 42 };
  }

  function dimGraphicsAligned(x1, y1, x2, y2, q1x, q1y, q2x, q2y, textX, textY, textValue, textRot = 0, options = {}) {
    const layer = options.layer || 'DIM';
    const dx = q2x - q1x, dy = q2y - q1y;
    const ang = Math.atan2(dy, dx);
    const scale = Number(options.scale || 1) > 0 ? Number(options.scale || 1) : 1;
    const textH = 180 * scale;
    const arrowSize = 100 * scale;
    const lineColor = Number.isFinite(Number(options.color)) ? Number(options.color) : 42;
    const textColor = Number.isFinite(Number(options.textColor)) ? Number(options.textColor) : 1;
    const a1 = dimArrowPoly(q1x, q1y, ang, arrowSize, layer);
    const a2 = dimArrowPoly(q2x, q2y, ang + Math.PI, arrowSize, layer);
    a1.color = lineColor;
    a2.color = lineColor;
    return [
      { type: 'line', layer, x1, y1, x2: q1x, y2: q1y, color: lineColor },
      { type: 'line', layer, x1: x2, y1: y2, x2: q2x, y2: q2y, color: lineColor },
      { type: 'line', layer, x1: q1x, y1: q1y, x2: q2x, y2: q2y, color: lineColor },
      a1,
      a2,
      { type: 'text', layer: options.textLayer || layer, x: textX, y: textY, value: textValue, height: textH, align: 'center', rotation: textRot, color: textColor }
    ];
  }

  function normalizedHiddenDimensionIds(raw) {
    if (!Array.isArray(raw)) return [];
    return Array.from(new Set(raw.map(value => String(value || '').trim()).filter(Boolean)));
  }

  function dimensionStableBase(entity) {
    if (entity && entity.edit && entity.edit.dimId) return String(entity.edit.dimId);
    const round = value => Math.round((Number(value) || 0) * 10) / 10;
    const p1 = entity && entity.p1 || {};
    const p2 = entity && entity.p2 || {};
    const line = entity && entity.dimLine || {};
    return [
      'dimension', dimSlug(entity && entity.layer || 'DIM'), dimSlug(entity && entity.dimensionAxis || 'aligned'),
      Number.isInteger(Number(entity && entity.positionIndex)) ? Number(entity.positionIndex) : 'x',
      round(p1.x), round(p1.y), round(p2.x), round(p2.y), round(line.x), round(line.y), round(entity && entity.measuredValue)
    ].join('_');
  }

  function applyDimensionVisibilityState(entities, d) {
    const hidden = new Set(normalizedHiddenDimensionIds(d && d.hiddenDimensionIds));
    const occurrence = new Map();
    (entities || []).forEach(entity => {
      if (!entity || entity.type !== 'dimension') return;
      const base = dimensionStableBase(entity);
      const count = occurrence.get(base) || 0;
      occurrence.set(base, count + 1);
      const id = entity.edit && entity.edit.dimId ? String(entity.edit.dimId) : `${base}_${count + 1}`;
      Object.defineProperty(entity, 'dimensionId', { value: id, writable: true, configurable: true, enumerable: false });
      Object.defineProperty(entity, 'hiddenDimension', { value: hidden.has(id), writable: true, configurable: true, enumerable: false });
    });
  }

  function addDimAlignedEntity(g, x1, y1, x2, y2, q1x, q1y, q2x, q2y, textX, textY, measured, rotationDeg = 0, options = {}) {
    if (K.showDimensions === false) return;
    const hasMeasuredTextOverride = options.measuredTextOverride !== undefined && options.measuredTextOverride !== null;
    const textValue = hasMeasuredTextOverride ? String(options.measuredTextOverride) : dimMeasuredText(measured);
    const ent = {
      dimKind: 'aligned',
      p1: { x: x1, y: y1 },
      p2: { x: x2, y: y2 },
      dimLine: { x: (q1x + q2x) / 2, y: (q1y + q2y) / 2 },
      text: { x: textX, y: textY },
      textOverride: hasMeasuredTextOverride ? textValue : '<>',
      measuredValue: Math.abs(Number(measured) || 0),
      dimensionAxis: String(options.dimensionAxis || 'aligned'),
      graphics: dimGraphicsAligned(x1, y1, x2, y2, q1x, q1y, q2x, q2y, textX, textY, textValue, rotationDeg, options)
    };
    if (options && options.edit) ent.edit = enrichDimensionEdit(options.edit, measured);
    if (ent.edit && ent.edit.dimId) Object.defineProperty(ent, 'dimensionId', { value: String(ent.edit.dimId), writable: true, configurable: true, enumerable: false });
    if (options && options.dimensionFilterType) ent.dimensionFilterType = String(options.dimensionFilterType);
    if (options && Number.isInteger(Number(options.positionIndex))) ent.positionIndex = Number(options.positionIndex);
    if (options && options.layer) ent.layer = options.layer;
    if (options && Number.isFinite(Number(options.entityColor))) ent.color = Number(options.entityColor);
    return g.dimension(ent);
  }

  function addDimH(g, x1, x2, yRef, yDim, label, options = {}) {
    const measured = Math.abs(x2 - x1);
    const scale = Number(options.scale || 1) > 0 ? Number(options.scale || 1) : 1;
    const textX = (x1 + x2) / 2;
    const textY = yDim + 140 * scale;
    return addDimAlignedEntity(g, x1, yRef, x2, yRef, x1, yDim, x2, yDim, textX, textY, measured, 0, { ...options, dimensionAxis: 'horizontal' });
  }

  function addDimV(g, y1, y2, xRef, xDim, label, options = {}) {
    const measured = Math.abs(y2 - y1);
    const scale = Number(options.scale || 1) > 0 ? Number(options.scale || 1) : 1;
    const textX = xDim - 150 * scale;
    const textY = (y1 + y2) / 2;
    return addDimAlignedEntity(g, xRef, y1, xRef, y2, xDim, y1, xDim, y2, textX, textY, measured, 90, { ...options, dimensionAxis: 'vertical' });
  }

  function addDimAligned(g, x1, y1, x2, y2, xLoc, yLoc, label, options = {}) {
    if (K.showDimensions === false) return;
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.max(1, Math.sqrt(dx * dx + dy * dy));
    const ux = dx / len, uy = dy / len;
    const nx = -uy, ny = ux;
    const off = ((xLoc - x1) * nx + (yLoc - y1) * ny);
    const q1x = x1 + nx * off, q1y = y1 + ny * off;
    const q2x = x2 + nx * off, q2y = y2 + ny * off;
    const textX = (q1x + q2x) / 2 + nx * 120;
    const textY = (q1y + q2y) / 2 + ny * 120;
    return addDimAlignedEntity(g, x1, y1, x2, y2, q1x, q1y, q2x, q2y, textX, textY, len, Math.atan2(dy, dx) * 180 / Math.PI, { ...options, dimensionAxis: 'aligned' });
  }
  function rotatePoint(px, py, bx, by, ang) { const dx = px - bx, dy = py - by, ca = Math.cos(ang), sa = Math.sin(ang); return [bx + dx * ca - dy * sa, by + dx * sa + dy * ca]; }
  function getBlocks() { return (root.PulumurFilteredBlocks && root.PulumurFilteredBlocks.blocks) ? root.PulumurFilteredBlocks.blocks : {}; }
  function transformLocalPoint(px, py, ins) {
    const sx = Math.abs(Number(ins.scaleX) || 1), sy = Number(ins.scaleY) || 1;
    const lx = ins.mirrorX ? -px : px;
    const a = (Number(ins.rotation) || 0) * Math.PI / 180;
    const x = lx * sx, y = py * sy, ca = Math.cos(a), sa = Math.sin(a);
    return [ins.x + x * ca - y * sa, ins.y + x * sa + y * ca];
  }
  function transformBlockBounds(block, ins) {
    const b = block.bounds || { minX: -50, minY: -50, maxX: 50, maxY: 50 };
    const corners = [[b.minX, b.minY], [b.maxX, b.minY], [b.maxX, b.maxY], [b.minX, b.maxY]];
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const corner of corners) {
      const point = transformLocalPoint(corner[0], corner[1], ins);
      if (point[0] < minX) minX = point[0];
      if (point[0] > maxX) maxX = point[0];
      if (point[1] < minY) minY = point[1];
      if (point[1] > maxY) maxY = point[1];
    }
    return [minX, minY, maxX, maxY];
  }

  function mirrorEntityX(e, midX) {
    const mx = x => 2 * midX - x;
    const readableRot = rot => {
      const r = normDeg(Number(rot) || 0);
      return (r > 90 && r < 270) ? normDeg(r + 180) : r;
    };
    if (e.type === 'line') return { ...e, x1: mx(e.x1), x2: mx(e.x2) };
    if (e.type === 'polyline') return { ...e, points: (e.points || []).map(p => [mx(p[0]), p[1]]) };
    if (e.type === 'hatch') return { ...e, points: (e.points || []).map(p => [mx(p[0]), p[1]]).reverse() };
    if (e.type === 'circle') return { ...e, x: mx(e.x) };
    if (e.type === 'text') {
      const mirroredRot = normDeg(180 - (Number(e.rotation) || 0));
      const nextRot = e.keepReadableOnMirror ? readableRot(mirroredRot) : mirroredRot;
      let nextAlign = e.align;
      if (e.flipAlignOnMirror) {
        if (nextAlign === 'left') nextAlign = 'right';
        else if (nextAlign === 'right') nextAlign = 'left';
      }
      return { ...e, x: mx(e.x), rotation: nextRot, align: nextAlign };
    }
    if (e.type === 'dimension') {
      const mapPt = p => p ? ({ x: mx(p.x), y: p.y }) : p;
      const mirrorDimGraphic = ge => {
        if (ge && ge.type === 'text') {
          // Ayna yan görünüşte ölçü bloğu yansırken yazı okunur kalsın.
          // Geometri X yönünde aynalanır; ölçü yazısının dönüşü ters çevrilmez.
          return { ...ge, x: mx(ge.x), rotation: readableRot(ge.rotation) };
        }
        return mirrorEntityX(ge, midX);
      };
      return {
        ...e,
        p1: mapPt(e.p1),
        p2: mapPt(e.p2),
        dimLine: mapPt(e.dimLine),
        text: mapPt(e.text),
        graphics: (e.graphics || []).map(mirrorDimGraphic)
      };
    }
    if (e.type === 'insert') return { ...e, x: mx(e.x), rotation: normDeg(-(Number(e.rotation) || 0)), scaleX: Math.abs(Number(e.scaleX) || 1), mirrorX: !e.mirrorX };
    if (e.type === 'interaction') {
      const x1 = Number(e.x) || 0;
      const x2 = x1 + (Number(e.w) || 0);
      const nx1 = mx(Math.max(x1, x2));
      const nx2 = mx(Math.min(x1, x2));
      return { ...e, x: Math.min(nx1, nx2), w: Math.abs(nx2 - nx1) };
    }
    return { ...e };
  }

  function appendMirroredEntitiesX(g, made, midX) {
    (made || []).forEach(e => {
      if (e && e.noMirror) return;
      const mirrored = mirrorEntityX(e, midX);
      g.entities.push(mirrored);
    });
  }


  function appendLastPositionPresentationCopy(g, made) {
    // Sağ ana görünüş ekranda geometrik olarak aynalanarak çizilir. Son pozun sol
    // sunumu bunun karşı aynası olduğundan yerel kaynak geometri tekrar
    // aynalanmaz; doğrudan kopyalanır. Ürün semantiği drawOneSideView içinde
    // INSIDE/OUTSIDE ve sağ/sol motor dönüşümüyle hazırlanır.
    (made || []).forEach(entity => {
      if (!entity || entity.noMirror) return;
      if (entity.type === 'interaction') {
        if (['sideViewSelector', 'waterPipeEditor'].includes(String(entity.kind || ''))) g.entities.push({ ...entity, data: entity.data ? { ...entity.data } : entity.data });
        return;
      }
      if (entity.type === 'dimension') {
        const dimId = String(entity.edit && entity.edit.dimId || '');
        if (!/^side_(?:opening|rear_height|front_height)_right_pos_/i.test(dimId)) return;
        const passive = {
          ...(entity.edit || {}),
          editable: false,
          canResize: false,
          canAddSameProfile: false,
          canAddDifferentProfile: false,
          canPlaceProduct: false,
          canRemoveElement: false,
          passiveReason: 'Son poz sol yan görünüşü, sağ yan görünüşün sunum amaçlı ayna kopyasıdır.'
        };
        g.entities.push({ ...entity, edit: passive });
        return;
      }
      g.entities.push({ ...entity });
    });
  }
  function mirrorNewEntitiesX(g, startIndex, midX) {
    appendMirroredEntitiesX(g, g.entities.slice(startIndex), midX);
  }
  function entityMinY(e) {
    const b = entityBounds(e);
    return b ? b[1] : 0;
  }

  function entityIsPostLike(e) {
    if (!e) return false;
    if (e.layer === 'POST') return true;
    const n = String(e.name || '').toLocaleUpperCase('tr-TR');
    return n.includes('DIKME');
  }

  function rangeMinYForPostLike(g, startIndex, endIndex) {
    // PERI01 hizalama kuralı: ayna yan görünüşün kotu dikme gövdesinin -Y uç noktasına göre alınır.
    // Alt bağlantı bloklarının base point / bbox farkı yaklaşık 46 mm yanıltma yapıyordu;
    // bu yüzden önce sadece gerçek POST layer gövdeleri dikkate alınır.
    const postVals = [];
    for (let i = startIndex; i < endIndex; i += 1) {
      if (g.entities[i] && g.entities[i].layer === 'POST') postVals.push(entityMinY(g.entities[i]));
    }
    if (postVals.length) return safeExtrema(postVals, 'min', 0);
    const vals = [];
    for (let i = startIndex; i < endIndex; i += 1) {
      if (entityIsPostLike(g.entities[i])) vals.push(entityMinY(g.entities[i]));
    }
    if (!vals.length) {
      for (let i = startIndex; i < endIndex; i += 1) vals.push(entityMinY(g.entities[i]));
    }
    return vals.length ? safeExtrema(vals, 'min', 0) : 0;
  }
  function moveEntityX(e, dx) {
    if (e.type === 'line') { e.x1 += dx; e.x2 += dx; }
    else if (e.type === 'polyline' || e.type === 'hatch') { e.points = (e.points || []).map(p => [p[0] + dx, p[1]]); }
    else if (e.type === 'circle') { e.x += dx; }
    else if (e.type === 'text' || e.type === 'mtext') { e.x += dx; }
    else if (e.type === 'dimension') {
      if (e.p1) e.p1.x += dx;
      if (e.p2) e.p2.x += dx;
      if (e.dimLine) e.dimLine.x += dx;
      if (e.text) e.text.x += dx;
      (e.graphics || []).forEach(ge => moveEntityX(ge, dx));
    }
    else if (e.type === 'insert') { e.x += dx; }
    else if (e.type === 'interaction') {
      e.x += dx;
      if (e.data) {
        ['boundMinX','boundMaxX','defaultBoundMinX','defaultBoundMaxX','tableMinX','tableMaxX'].forEach(key => {
          if (Number.isFinite(Number(e.data[key]))) e.data[key] = Number(e.data[key]) + dx;
        });
      }
    }
  }
  function moveEntityRangeX(g, startIndex, endIndex, dx) {
    for (let i = startIndex; i < endIndex; i += 1) moveEntityX(g.entities[i], dx);
  }

  function moveEntityY(e, dy) {
    if (e.type === 'line') { e.y1 += dy; e.y2 += dy; }
    else if (e.type === 'polyline' || e.type === 'hatch') { e.points = (e.points || []).map(p => [p[0], p[1] + dy]); }
    else if (e.type === 'circle') { e.y += dy; }
    else if (e.type === 'text' || e.type === 'mtext') { e.y += dy; }
    else if (e.type === 'dimension') {
      if (e.p1) e.p1.y += dy;
      if (e.p2) e.p2.y += dy;
      if (e.dimLine) e.dimLine.y += dy;
      if (e.text) e.text.y += dy;
      (e.graphics || []).forEach(ge => moveEntityY(ge, dy));
    }
    else if (e.type === 'insert') { e.y += dy; }
    else if (e.type === 'interaction') { e.y += dy; if (e.data) { ['boundMinY','boundMaxY','defaultBoundMinY','defaultBoundMaxY','tableMinY','tableMaxY'].forEach(key => { if (Number.isFinite(Number(e.data[key]))) e.data[key] = Number(e.data[key]) + dy; }); } }
  }
  function moveEntityRangeY(g, startIndex, endIndex, dy) {
    for (let i = startIndex; i < endIndex; i += 1) moveEntityY(g.entities[i], dy);
  }
  function frontViewMinY(d) {
    // Segmentli parapet ve manuel -Y dikme uzatmalarıyla gerçek en alt ön dikme kotu.
    const xs = Array.isArray(d.postCenterXs) ? d.postCenterXs : postCenterXs(d);
    if (!xs.length) return d.commonFrontRectStartY - d.frontHeight + K.onPostHeightCorrection - K.onPostTopDrop + d.parapetHeight;
    return safeExtrema(xs.map((x, index) => {
      const profile = frontPostProfileAt(d, index);
      const parapetTop = d.commonFrontRectStartY - d.frontHeight + frontParapetHeightAt(d, x);
      const extension = frontPostExtensionAt(d, index);
      return profile.custom ? parapetTop - extension : parapetTop + K.altBlockCorrection - extension;
    }));
  }


  function sideMirrorNeeded(d, p) {
    const rightIndex = Math.max(0, d.sidePositionCount - 1);
    return p.index === rightIndex && (sideFeatureEnabled(d, 'glassTrack', 'right', rightIndex) || sideFeatureEnabled(d, 'triangle', 'right', rightIndex) || yes(d.sideTrack) || d.openingList.length > 1);
  }
  function rotatedRect(g, x, y, w, h, bx, by, ang, layer) { const pts = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]].map(p => rotatePoint(p[0], p[1], bx, by, ang)); g.poly(pts, true, layer); return pts; }
  function blockRef(g, name, x, y, w, h, layer = 'BLOCKREF', rotation = 0, scaleX = 1, scaleY = 1) { return g.insert(name, x, y, { layer, rotation, scaleX, scaleY, previewW: w, previewH: h }); }

  function normalizeGlassTrackProfile(src) {
    const raw = src || {};
    let mode = String(raw.mode || raw.id || 'standard').trim().toLowerCase();
    let en = Number(raw.en ?? raw.side ?? raw.width ?? 100);
    let boy = Number(raw.boy ?? raw.top ?? raw.depth ?? 100);
    let et = Number(raw.et ?? raw.thickness ?? 2);
    if (mode === '40x130' || mode === '40x130x2' || mode === 'side_register_40x130') { en = 40; boy = 130; et = 2; mode = '40x130x2'; }
    else if (mode !== 'other') { en = 100; boy = 100; et = 2; mode = 'standard'; }
    en = Math.max(5, Number.isFinite(en) ? en : 100);
    boy = Math.max(5, Number.isFinite(boy) ? boy : 100);
    et = Math.max(0, Number.isFinite(et) ? et : 2);
    const maxEt = Math.max(0, Math.min(en, boy) / 2 - 0.1);
    et = Math.min(et, maxEt);
    return { mode, en, boy, et };
  }


  function normalizeParapetSegmentList(rawList, length, fallbackHeight, prefix, allowOverflow = false) {
    const maxLength = Math.max(0, Number(length) || 0);
    const baseHeight = Math.max(0, Number(fallbackHeight) || 0);
    const input = Array.isArray(rawList) ? rawList : [];
    const clean = input.map((raw, index) => {
      const rawStart = Number(raw && raw.start);
      const rawEnd = Number(raw && raw.end);
      const start = allowOverflow ? (Number.isFinite(rawStart) ? rawStart : 0) : clamp(rawStart || 0, 0, maxLength);
      const end = allowOverflow ? (Number.isFinite(rawEnd) ? rawEnd : maxLength) : clamp(rawEnd, 0, maxLength);
      const legacyHeight = Math.max(0, Number(raw && raw.height));
      const startHeightRaw = Number(raw && raw.startHeight);
      const endHeightRaw = Number(raw && raw.endHeight);
      const height = Number.isFinite(legacyHeight) ? legacyHeight : baseHeight;
      const startHeight = Math.max(0, Number.isFinite(startHeightRaw) ? startHeightRaw : height);
      const endHeight = Math.max(0, Number.isFinite(endHeightRaw) ? endHeightRaw : height);
      return {
        id: String((raw && raw.id) || `${prefix}_${index + 1}`),
        start: Math.min(start, Number.isFinite(end) ? end : maxLength),
        end: Math.max(start, Number.isFinite(end) ? end : maxLength),
        height: Math.max(startHeight, endHeight),
        startHeight,
        endHeight
      };
    }).filter(item => item.end - item.start > 0.001).sort((a, b) => a.start - b.start || a.end - b.end);
    if (!clean.length && maxLength > 0 && baseHeight > 0) return [{ id: `${prefix}_1`, start: 0, end: maxLength, height: baseHeight, startHeight: baseHeight, endHeight: baseHeight }];
    return clean;
  }

  function normalizeParapetSegmentsState(rawState, d) {
    if (!yes(d.parapet) || !(d.parapetHeight > 0)) return { front: [], side: {} };
    const raw = rawState && typeof rawState === 'object' ? rawState : {};
    let front = normalizeParapetSegmentList(raw.front, d.width, d.parapetHeight, 'front_parapet', true);
    if (d.independentMode) {
      const source = front.length ? front : [];
      const clipped = [];
      (d.systems || []).forEach(system => {
        const localStart = Number(system.outerStartX) - K.systemStartX;
        const localEnd = Number(system.outerEndX) - K.systemStartX;
        source.forEach((segment, segmentIndex) => {
          const start = Math.max(localStart, Number(segment.start));
          const end = Math.min(localEnd, Number(segment.end));
          if (!(end > start + 0.001)) return;
          const width = Math.max(0.001, Number(segment.end) - Number(segment.start));
          const ratioStart = (start - Number(segment.start)) / width;
          const ratioEnd = (end - Number(segment.start)) / width;
          const startHeight = Number(segment.startHeight) + (Number(segment.endHeight) - Number(segment.startHeight)) * ratioStart;
          const endHeight = Number(segment.startHeight) + (Number(segment.endHeight) - Number(segment.startHeight)) * ratioEnd;
          clipped.push({ ...segment, id: `${segment.id}_pos_${Number(system.index) + 1}_${segmentIndex + 1}`, start, end,
            height: Math.max(startHeight, endHeight), startHeight, endHeight, independentGroupId: system.independentGroupId || '', positionId: system.positionId || '' });
        });
      });
      front = clipped;
    }
    const side = {};
    d.positions.slice(0, d.sidePositionCount).forEach(p => {
      const source = raw.side && (raw.side[String(p.index)] || raw.side[p.index]);
      side[String(p.index)] = normalizeParapetSegmentList(source, p.opening, d.parapetHeight, `side_${p.index}_parapet`);
    });
    // Sağ yan görünüş artık son pozun aynası olmakla birlikte bağımsız düzenleme
    // verisi taşır. Eski projelerde ayrı sağ veri yoksa son poz parapeti başlangıç
    // şablonu olarak kullanılır; ilk düzenlemeden sonra "right" anahtarında saklanır.
    const rightIndex = Math.max(0, d.sidePositionCount - 1);
    const rightPosition = d.positions[rightIndex] || d.positions[0];
    if (rightPosition) {
      const explicitRight = raw.side && raw.side.right;
      const fallbackRight = raw.side && (raw.side[String(rightIndex)] || raw.side[rightIndex]);
      side.right = normalizeParapetSegmentList(explicitRight || fallbackRight, rightPosition.opening, d.parapetHeight, 'side_right_parapet');
    }
    return { front, side };
  }

  const REAR_STEEL_POST_PRESETS = Object.freeze({
    '100x100x3': { width: 100, depth: 100, thickness: 3 },
    '100x150x3': { width: 100, depth: 150, thickness: 3 },
    '120x120x3': { width: 120, depth: 120, thickness: 3 },
    '150x150x3': { width: 150, depth: 150, thickness: 3 }
  });
  const REAR_STEEL_BEAM_PRESETS = Object.freeze({
    '100x100x3': { planDepth: 100, elevationHeight: 100, thickness: 3 },
    '100x100x5': { planDepth: 100, elevationHeight: 100, thickness: 5 },
    '100x150x3': { planDepth: 100, elevationHeight: 150, thickness: 3 },
    '100x150x5': { planDepth: 100, elevationHeight: 150, thickness: 5 },
    '100x200x3': { planDepth: 100, elevationHeight: 200, thickness: 3 },
    '100x200x5': { planDepth: 100, elevationHeight: 200, thickness: 5 }
  });

  function rearSteelProfileLabel(first, second, thickness) {
    const clean = value => String(Number(Number(value).toFixed(3)));
    return `${clean(first)}x${clean(second)}x${clean(thickness)} mm`;
  }

  function normalizeRearSupport(raw) {
    const source = raw && typeof raw === 'object' ? raw : {};
    const postRaw = source.postProfile && typeof source.postProfile === 'object' ? source.postProfile : {};
    const requestedPostKey = String(postRaw.key || '').trim();
    const presetPost = REAR_STEEL_POST_PRESETS[requestedPostKey];
    const customPost = postRaw.source === 'custom' || requestedPostKey === 'custom' || (!presetPost && (postRaw.width !== undefined || postRaw.depth !== undefined || postRaw.thickness !== undefined));
    const postBase = customPost ? postRaw : (presetPost || REAR_STEEL_POST_PRESETS['100x100x3']);
    const postWidth = Math.max(1, Number(postBase.width) || 100);
    const postDepth = Math.max(1, Number(postBase.depth) || 100);
    const postThickness = Math.min(postWidth, postDepth, Math.max(0.1, Number(postBase.thickness) || 3));
    const postKey = customPost ? null : (presetPost ? requestedPostKey : '100x100x3');
    const beamRaw = source.beamProfile && typeof source.beamProfile === 'object' ? source.beamProfile : {};
    const requestedBeamKey = String(beamRaw.key || '').trim();
    const beamPreset = REAR_STEEL_BEAM_PRESETS[requestedBeamKey] || REAR_STEEL_BEAM_PRESETS['100x100x3'];
    const planDepth = Math.max(1, Number(beamRaw.planDepth ?? beamRaw.width) || beamPreset.planDepth);
    const elevationHeight = Math.max(1, Number(beamRaw.elevationHeight ?? beamRaw.height) || beamPreset.elevationHeight);
    const beamThickness = Math.min(planDepth, elevationHeight, Math.max(0.1, Number(beamRaw.thickness) || beamPreset.thickness));
    const beamKey = REAR_STEEL_BEAM_PRESETS[requestedBeamKey] ? requestedBeamKey : '100x100x3';
    return {
      type: String(source.type || '').trim().toLowerCase() === 'steel' ? 'steel' : 'wall',
      postProfile: { source: customPost ? 'custom' : 'preset', key: postKey, width: postWidth, depth: postDepth, thickness: postThickness, label: rearSteelProfileLabel(postWidth, postDepth, postThickness) },
      beamProfile: { source: 'preset', key: beamKey, width: planDepth, height: elevationHeight, planDepth, elevationHeight, thickness: beamThickness, label: rearSteelProfileLabel(planDepth, elevationHeight, beamThickness) }
    };
  }

  function normalizeGutterEditState(rawState) {
    const raw = rawState && typeof rawState === 'object' ? rawState : {};
    const minusXDelta = Number(raw.minusXDelta);
    const plusXDelta = Number(raw.plusXDelta);
    const groups = raw.groups && typeof raw.groups === 'object'
      ? Object.fromEntries(Object.entries(raw.groups).map(([key, value]) => {
          const source = value && typeof value === 'object' ? value : {};
          const minus = Number(source.minusXDelta), plus = Number(source.plusXDelta);
          return [String(key), { minusXDelta: Number.isFinite(minus) ? minus : 0, plusXDelta: Number.isFinite(plus) ? plus : 0 }];
        })) : {};
    return {
      minusXDelta: Number.isFinite(minusXDelta) ? minusXDelta : 0,
      plusXDelta: Number.isFinite(plusXDelta) ? plusXDelta : 0,
      groups
    };
  }

  function normalizeWaterOutletPipeState(rawState) {
    const raw = rawState && typeof rawState === 'object' ? rawState : {};
    const diameter = Math.max(1, Number(raw.diameter) || 70);
    const length = Math.max(1, Number(raw.length) || 300);
    const offsets = raw.offsets && typeof raw.offsets === 'object'
      ? Object.fromEntries(Object.entries(raw.offsets).map(([key, value]) => [String(key), Number(value)]).filter(([, value]) => Number.isFinite(value))) : {};
    const deleted = raw.deleted && typeof raw.deleted === 'object'
      ? Object.fromEntries(Object.entries(raw.deleted).filter(([, value]) => value === true).map(([key]) => [String(key), true])) : {};
    return { diameter, length, offsets, deleted };
  }

  function normalizeUpperTableTransform(rawState) {
    const raw = rawState && typeof rawState === 'object' ? rawState : {};
    const x = Number(raw.x), y = Number(raw.y), scaleX = Number(raw.scaleX), scaleY = Number(raw.scaleY);
    return {
      x: Number.isFinite(x) ? x : 0,
      y: Number.isFinite(y) ? y : 0,
      scaleX: Number.isFinite(scaleX) ? clamp(scaleX, 0.35, 4) : 1,
      scaleY: Number.isFinite(scaleY) ? clamp(scaleY, 0.35, 4) : 1
    };
  }

  function normalizeTopBackWallGridState(rawState, d) {
    const raw = rawState && typeof rawState === 'object' ? rawState : {};
    const out = {};
    (d.systems || []).forEach(sys => {
      const key = String(sys.index);
      const startX = Number.isFinite(Number(sys.outerStartX)) ? Number(sys.outerStartX) : Number(sys.startX);
      const endX = Number.isFinite(Number(sys.outerEndX)) ? Number(sys.outerEndX) : Number(sys.endX);
      const width = Math.max(1, endX - startX);
      const depth = Math.max(1, topWallHAt(d, sys.index));
      const source = raw[key] && typeof raw[key] === 'object' ? raw[key] : {};
      let cells = Array.isArray(source.cells) ? source.cells : [];
      if (!cells.length) {
        const legacy = d.topBackWallSegments && Array.isArray(d.topBackWallSegments[key]) ? d.topBackWallSegments[key] : [];
        cells = legacy.map((seg, index) => ({
          id: String(seg.id || `top_wall_${key}_${index}`), enabled: true,
          minX: Number(seg.start) || 0, maxX: Number(seg.end) || width,
          startNearDepth: 0, endNearDepth: 0,
          startFarDepth: Math.max(0, Number.isFinite(Number(seg.startHeight)) ? Number(seg.startHeight) : Number(seg.height) || depth),
          endFarDepth: Math.max(0, Number.isFinite(Number(seg.endHeight)) ? Number(seg.endHeight) : Number(seg.height) || depth)
        }));
      }
      out[key] = { cells: cells.map((cell, index) => ({
        id: String(cell.id || `top_wall_${key}_${index}`), enabled: cell.enabled !== false,
        minX: Number.isFinite(Number(cell.minX)) ? Number(cell.minX) : 0,
        maxX: Number.isFinite(Number(cell.maxX)) ? Number(cell.maxX) : width,
        startNearDepth: Math.max(0, Number(cell.startNearDepth) || 0),
        endNearDepth: Math.max(0, Number(cell.endNearDepth) || 0),
        startFarDepth: Math.max(0, Number.isFinite(Number(cell.startFarDepth)) ? Number(cell.startFarDepth) : depth),
        endFarDepth: Math.max(0, Number.isFinite(Number(cell.endFarDepth)) ? Number(cell.endFarDepth) : depth)
      })).filter(cell => cell.maxX - cell.minX > 0.001) };
    });
    return out;
  }

  function gutterBounds(d, group) {
    const hasGroup = !!(d && d.independentMode && group);
    const defaultStart = hasGroup ? Number(group.outerStartX) - 50 : K.gutterX;
    const defaultEnd = hasGroup ? Number(group.outerEndX) + 50 : K.gutterX + Math.max(1, Number(d && d.width) || 0) + 100;
    const allState = normalizeGutterEditState(d && d.gutterEditState);
    const state = hasGroup
      ? (allState.groups[String(group.groupId)] || (Number(group.groupIndex) === 0 ? { minusXDelta: allState.minusXDelta, plusXDelta: allState.plusXDelta } : { minusXDelta: 0, plusXDelta: 0 }))
      : allState;
    let start = defaultStart - state.minusXDelta;
    let end = defaultEnd + state.plusXDelta;
    if (!Number.isFinite(start)) start = defaultStart;
    if (!Number.isFinite(end)) end = defaultEnd;
    if (end - start < 100) end = start + 100;
    return { start, end, width: end - start, defaultStart, defaultEnd, minusXDelta: defaultStart - start, plusXDelta: end - defaultEnd, groupId: hasGroup ? group.groupId : '' };
  }

  function normalizeTopBackWallSegmentsState(rawState, d) {
    const raw = rawState && typeof rawState === 'object' ? rawState : {};
    const out = {};
    (d.systems || []).forEach(sys => {
      const startX = Number.isFinite(Number(sys.outerStartX)) ? Number(sys.outerStartX) : Number(sys.startX);
      const endX = Number.isFinite(Number(sys.outerEndX)) ? Number(sys.outerEndX) : Number(sys.endX);
      const width = Math.max(1, endX - startX);
      const depth = Math.max(1, topWallHAt(d, sys.index));
      out[String(sys.index)] = normalizeParapetSegmentList(raw[String(sys.index)] || raw[sys.index], width, depth, `top_back_wall_${sys.index}`);
    });
    return out;
  }

  function segmentHeightAt(segments, coordinate, fallback = 0) {
    const list = Array.isArray(segments) ? segments : [];
    const x = Number(coordinate) || 0;
    const hit = list.find((item, index) => x >= Number(item.start) - 0.001 && (x < Number(item.end) - 0.001 || index === list.length - 1 && x <= Number(item.end) + 0.001));
    if (!hit) return Math.max(0, Number(fallback) || 0);
    const start = Number(hit.start) || 0;
    const end = Number(hit.end) || start;
    const h0 = Math.max(0, Number.isFinite(Number(hit.startHeight)) ? Number(hit.startHeight) : Number(hit.height) || 0);
    const h1 = Math.max(0, Number.isFinite(Number(hit.endHeight)) ? Number(hit.endHeight) : Number(hit.height) || 0);
    const ratio = end - start > 0.001 ? clamp((x - start) / (end - start), 0, 1) : 0;
    return h0 + (h1 - h0) * ratio;
  }

  function parapetSegmentVerticalDimX(segmentStartX, segmentWidth) {
    // v8.9.25: Parapet ve oluk-parapet düşey ölçüleri global bir kolonda
    // toplanmaz. Her segment, kendi X alanının yaklaşık ilk üçte birlik
    // bölümünde ortak bir zincir ölçü hattı taşır.
    const start = Number(segmentStartX) || 0;
    const width = Math.max(1, Number(segmentWidth) || 1);
    const safeInset = Math.min(Math.max(55, width * 0.08), Math.max(55, width / 2));
    const preferred = width * 0.36;
    const local = width > safeInset * 2
      ? clamp(preferred, safeInset, width - safeInset)
      : width / 2;
    return start + local;
  }

  function parapetDimensionStations(segments) {
    const stations = [];
    (Array.isArray(segments) ? segments : []).forEach((segment, segmentIndex) => {
      const start = Number(segment && segment.start);
      const end = Number(segment && segment.end);
      if (![start, end].every(Number.isFinite) || !(end > start + 0.001)) return;
      const fallbackHeight = Math.max(0, Number(segment && segment.height) || 0);
      const startHeight = Math.max(0, Number.isFinite(Number(segment && segment.startHeight)) ? Number(segment.startHeight) : fallbackHeight);
      const endHeight = Math.max(0, Number.isFinite(Number(segment && segment.endHeight)) ? Number(segment.endHeight) : fallbackHeight);
      const width = end - start;
      const inset = Math.min(Math.max(55, width * 0.08), width / 2);
      const sloped = Math.abs(startHeight - endHeight) > 0.001;
      const candidates = sloped
        ? [
            { coordinate: start, dimensionCoordinate: start + inset, height: startHeight, kind: 'start' },
            { coordinate: end, dimensionCoordinate: end - inset, height: endHeight, kind: 'end' }
          ]
        : [{ coordinate: start + width / 2, dimensionCoordinate: parapetSegmentVerticalDimX(start, width), height: startHeight, kind: 'center' }];
      candidates.forEach(candidate => {
        const sameCoordinate = stations.filter(item => Math.abs(item.coordinate - candidate.coordinate) <= 0.001);
        const sameHeight = sameCoordinate.find(item => Math.abs(item.height - candidate.height) <= 0.001);
        if (sameHeight) {
          sameHeight.shared = true;
          return;
        }
        if (sameCoordinate.length) sameCoordinate.forEach(item => { item.discontinuous = true; });
        stations.push({ ...candidate, segment, segmentIndex, shared: false, discontinuous: sameCoordinate.length > 0 });
      });
    });
    return stations.sort((a, b) => a.coordinate - b.coordinate || a.dimensionCoordinate - b.dimensionCoordinate || a.height - b.height);
  }

  function frontPositionIndexAtX(d, absoluteX) {
    const systems = d && Array.isArray(d.systems) ? d.systems : [];
    const x = Number(absoluteX) || 0;
    const hit = systems.find(sys => x >= Number(sys.startX) - 0.001 && x <= Number(sys.endX) + 0.001);
    return hit ? Number(hit.index) || 0 : 0;
  }

  function frontHeightAtX(d, absoluteX) {
    const index = frontPositionIndexAtX(d, absoluteX);
    const position = d && Array.isArray(d.positions) ? d.positions[index] : null;
    return d && d.independentMode && position && Number.isFinite(Number(position.frontHeight)) ? Number(position.frontHeight) : Number(d && d.frontHeight) || 0;
  }

  function frontParapetHeightAt(d, absoluteX) {
    return segmentHeightAt(d && d.parapetSegments ? d.parapetSegments.front : [], (Number(absoluteX) || 0) - K.systemStartX, d && d.parapetHeight);
  }

  function sideParapetHeightAt(d, sideIndex, absoluteX, wallX, sideViewKey = null) {
    const key = normalizeSideViewKey(sideViewKey, Number(sideIndex) || 0);
    const list = d && d.parapetSegments && d.parapetSegments.side ? d.parapetSegments.side[key] : [];
    return segmentHeightAt(list, (Number(absoluteX) || 0) - Number(wallX || 0), d && d.parapetHeight);
  }

  function frontPostExtensionAt(d, index) {
    const value = d && Array.isArray(d.frontPostExtensions) ? Number(d.frontPostExtensions[index]) : 0;
    return Math.max(0, Number.isFinite(value) ? value : 0);
  }

  function drawHollowRect(g, x, y, w, h, layer, et = 0) {
    g.rect(x, y, w, h, layer);
    const t = Math.max(0, Number(et) || 0);
    const left = Math.min(x, x + w), right = Math.max(x, x + w);
    const bottom = Math.min(y, y + h), top = Math.max(y, y + h);
    const iw = right - left - 2 * t;
    const ih = top - bottom - 2 * t;
    if (iw > 0.5 && ih > 0.5) g.rect(left + t, top - t, iw, -ih, layer);
  }

  function rearSteelEntityMetadata(kind, view, profile, extra = {}) {
    return {
      semantic: kind, view, rearSupportType: 'steel', profileType: kind === 'rearSteelPost' ? 'post' : 'beam',
      profileSource: profile.source, profileKey: profile.key, profileLabel: profile.label,
      profileWidth: Number(profile.width ?? profile.planDepth), profileDepth: Number(profile.depth ?? profile.planDepth),
      profileHeight: Number(profile.height ?? profile.elevationHeight), profileThickness: Number(profile.thickness),
      color: 1, previewPointerEvents: 'none', ...(extra || {})
    };
  }

  function drawRearSteelHollowRect(g, x, y, w, h, kind, view, profile, extra = {}) {
    const meta = rearSteelEntityMetadata(kind, view, profile, extra);
    const outer = g.rect(x, y, w, h, 'PROFILE');
    Object.assign(outer, meta, { profileBoundary: 'outer' });
    const t = Math.max(0, Number(profile.thickness) || 0);
    const left = Math.min(x, x + w), right = Math.max(x, x + w), bottom = Math.min(y, y + h), top = Math.max(y, y + h);
    const iw = right - left - 2 * t, ih = top - bottom - 2 * t;
    if (iw > 0.5 && ih > 0.5) {
      const inner = g.rect(left + t, top - t, iw, -ih, 'PROFILE');
      Object.assign(inner, meta, { profileBoundary: 'inner' });
    }
    return outer;
  }

  function rearSteelPostSystemIndex(d, centerX) {
    const systems = Array.isArray(d && d.systems) ? d.systems : [];
    const exact = systems.find(sys => centerX >= Number(sys.outerStartX ?? sys.startX) - 0.001 && centerX <= Number(sys.outerEndX ?? sys.endX) + 0.001);
    if (exact) return Number(exact.index) || 0;
    let best = systems[0] || null, distance = Infinity;
    systems.forEach(sys => {
      const start = Number(sys.outerStartX ?? sys.startX), end = Number(sys.outerEndX ?? sys.endX);
      const delta = centerX < start ? start - centerX : centerX > end ? centerX - end : 0;
      if (delta < distance) { distance = delta; best = sys; }
    });
    return best ? Number(best.index) || 0 : 0;
  }

  function drawTopRearSteelSupport(g, d) {
    if (!d.rearSupport || d.rearSupport.type !== 'steel' || !Array.isArray(d.systems) || !d.systems.length) return;
    const post = d.rearSupport.postProfile, beam = d.rearSupport.beamProfile;
    d.systems.forEach(sys => {
      const startX = Number.isFinite(Number(sys.outerStartX)) ? Number(sys.outerStartX) : Number(sys.startX);
      const endX = Number.isFinite(Number(sys.outerEndX)) ? Number(sys.outerEndX) : Number(sys.endX);
      const width = endX - startX;
      if (!(width > 0)) return;
      const wallMinusY = topBackWallMinYAt(d, sys.index);
      const beamPlusY = wallMinusY + beam.planDepth;
      drawRearSteelHollowRect(g, startX, beamPlusY, width, -beam.planDepth, 'rearSteelBeam', 'top', beam, { systemIndex: sys.index, sourceRearWallId: `top-wall-${sys.index}`, centerY: wallMinusY + beam.planDepth / 2, wallMinusY });
    });
    (Array.isArray(d.postCenterXs) ? d.postCenterXs : postCenterXs(d)).forEach((centerX, postIndex) => {
      const x = Number(centerX) - post.width / 2;
      const systemIndex = rearSteelPostSystemIndex(d, Number(centerX));
      const wallMinusY = topBackWallMinYAt(d, systemIndex);
      const postPlusY = wallMinusY + post.depth;
      drawRearSteelHollowRect(g, x, postPlusY, post.width, -post.depth, 'rearSteelPost', 'top', post, { postIndex, systemIndex, centerX: Number(centerX), centerY: wallMinusY + post.depth / 2, wallMinusY, railAligned: true, sourceRearWallId: `top-wall-${systemIndex}` });
    });
  }

  function drawSideRearSteelSupport(g, d, p, sideViewKey, duvarX, duvarY, rearTopY) {
    if (!d.rearSupport || d.rearSupport.type !== 'steel') return null;
    const post = d.rearSupport.postProfile, beam = d.rearSupport.beamProfile;
    const beamTopY = rearTopY, beamBottomY = beamTopY - beam.elevationHeight;
    const postTopY = beamBottomY, postBottomY = duvarY;
    if (postTopY > postBottomY) drawRearSteelHollowRect(g, duvarX, postTopY, -post.depth, postBottomY - postTopY, 'rearSteelPost', 'side', post, { sideIndex: p.index, sideViewKey, centerX: duvarX - post.depth / 2, sourceRearWallId: `side-wall-${sideViewKey}` });
    drawRearSteelHollowRect(g, duvarX, beamTopY, -beam.planDepth, -beam.elevationHeight, 'rearSteelBeam', 'side', beam, { sideIndex: p.index, sideViewKey, beamTopY, beamBottomY, sourceRearWallId: `side-wall-${sideViewKey}` });
    return { beamTopY, beamBottomY, postTopY, postBottomY, wallMaxLocalY: Math.max(0, beamBottomY - duvarY) };
  }

  function addGlassTrackInteraction(g, x, y, w, h, profile, part = 'track', scope = 'global', extra = {}) {
    g.entities.push({
      type: 'interaction',
      kind: 'glassTrackEditor',
      x, y, w, h,
      data: { part, scope, profileMode: profile.mode, en: profile.en, boy: profile.boy, et: profile.et, ...(extra || {}) }
    });
  }

  function supportProfileFor(d, scope = 'left') {
    if (d && d.glassTrackSupportProfiles) {
      if (d.glassTrackSupportProfiles[scope]) return d.glassTrackSupportProfiles[scope];
      if (String(scope || '').startsWith('middle_') && d.glassTrackSupportProfiles.left) return d.glassTrackSupportProfiles.left;
    }
    return d && d.glassTrackProfile ? d.glassTrackProfile : normalizeGlassTrackProfile();
  }

  function rayXs(d) { return d.systems.flatMap(s => s.rays); }
  function raySystemInfos(d) { return d.systems.map(s => ({ ...s })); }
  function rayIntervals(d) { const out = []; d.systems.forEach(sys => { for (let i = 0; i < sys.rays.length - 1; i += 1) { const x1 = sys.rays[i]; const x2 = sys.rays[i + 1]; out.push({ system: sys.index, x: x1 + K.rayW, len: x2 - (x1 + K.rayW) }); } }); return out; }

  function editableRaySpans(sys) {
    const rays = Array.isArray(sys && sys.rays) ? sys.rays.map(Number) : [];
    if (rays.length <= 2) return [];
    const centers = rays.map(x => x + K.rayW / 2);
    const spans = [];
    spans.push({ index: 0, mode: 'outer_to_center', x1: rays[0], x2: centers[1], label: 'DIŞTAN MERKEZE' });
    for (let i = 1; i < centers.length - 2; i += 1) {
      spans.push({ index: i, mode: 'center_to_center', x1: centers[i], x2: centers[i + 1], label: 'MERKEZDEN MERKEZE' });
    }
    spans.push({ index: rays.length - 2, mode: 'center_to_outer', x1: centers[centers.length - 2], x2: rays[rays.length - 1] + K.rayW, label: 'MERKEZDEN DIŞA' });
    return spans;
  }
  function systemRanges(d) {
    return d.systems.map(sys => {
      const x1 = Number.isFinite(Number(sys.mechanismStartX)) ? Number(sys.mechanismStartX) : sys.startX;
      const x2 = Number.isFinite(Number(sys.mechanismEndX)) ? Number(sys.mechanismEndX) : sys.endX;
      const outerX1 = Number.isFinite(Number(sys.outerStartX)) ? Number(sys.outerStartX) : Number(sys.startX);
      const outerX2 = Number.isFinite(Number(sys.outerEndX)) ? Number(sys.outerEndX) : Number(sys.endX);
      return {
        system: sys.index, x1, x2, mid: (x1 + x2) / 2,
        wallX1: outerX1, wallX2: outerX2,
        outerX1, outerX2,
        nominalX1: outerX1, nominalX2: outerX2
      };
    });
  }
  function systemGapRanges(d) {
    const out = [];
    for (let i = 0; i < d.systems.length - 1; i += 1) {
      const left = d.systems[i], right = d.systems[i + 1];
      const x1 = Number.isFinite(Number(left.mechanismEndX)) ? Number(left.mechanismEndX) : left.endX;
      const x2 = Number.isFinite(Number(right.mechanismStartX)) ? Number(right.mechanismStartX) : right.startX;
      out.push({ x1, x2, mid: (x1 + x2) / 2 });
    }
    return out;
  }
  function systemExteriorAllowanceRanges(d) {
    const systems = Array.isArray(d && d.systems) ? d.systems : [];
    if (!systems.length) return [];
    const out = [];
    const first = systems[0];
    const last = systems[systems.length - 1];
    if (Number(first.mechanismStartX) > Number(first.startX) + 0.001) {
      out.push({ side: 'left', x1: Number(first.startX), x2: Number(first.mechanismStartX), label: 'SOL CAM PAYI' });
    }
    if (Number(last.endX) > Number(last.mechanismEndX) + 0.001) {
      out.push({ side: 'right', x1: Number(last.mechanismEndX), x2: Number(last.endX), label: 'SAĞ CAM PAYI' });
    }
    return out;
  }
  function systemAxisSpans(d) {
    const systems = Array.isArray(d && d.systems) ? d.systems : [];
    if (systems.length <= 1) return [];
    const joints = [];
    for (let i = 0; i < systems.length - 1; i += 1) joints.push((Number(systems[i].endX) + Number(systems[i + 1].startX)) / 2);
    const points = [Number(systems[0].startX), ...joints, Number(systems[systems.length - 1].endX)];
    const rawLengths = points.slice(0, -1).map((value, index) => points[index + 1] - value);
    const displayValues = rawLengths.map(value => Math.floor(value + 1e-9));
    let remaining = Math.round(points[points.length - 1] - points[0]) - displayValues.reduce((sum, value) => sum + value, 0);
    const fractionOrder = rawLengths.map((value, index) => ({ index, fraction: value - Math.floor(value + 1e-9) }))
      .sort((a, b) => Math.abs(b.fraction - a.fraction) > 1e-9 ? b.fraction - a.fraction : a.index - b.index);
    for (let i = 0; i < fractionOrder.length && remaining > 0; i += 1, remaining -= 1) displayValues[fractionOrder[i].index] += 1;
    return points.slice(0, -1).map((x1, index) => ({
      x1,
      x2: points[index + 1],
      displayValue: displayValues[index],
      label: index === 0 ? 'DIŞTAN MERKEZE' : (index === points.length - 2 ? 'MERKEZDEN DIŞA' : 'MERKEZDEN MERKEZE')
    }));
  }


  function topSideTrackTotalRange(d) {
    // V8.2.32: Çoklu pozda yan/cam kayıt profili çiziliyorsa toplam üst ölçü,
    // ray arka mekanizma bloklarından değil yan kayıt profillerinin dış X uçlarından alınır.
    // Üst görünüşte bu profil drawTopGlassTrack içinde GLASS katmanında 100 mm genişliğinde çizilir.
    if (!yes(d.glassTrack)) return null;
    const x1 = d.solX - 50;       // Poz 1 sol yan kayıt profilinin -X dış ucu
    const x2 = d.sagX + 50;       // Son poz sağ yan kayıt profilinin +X dış ucu
    if (!Number.isFinite(x1) || !Number.isFinite(x2) || x2 <= x1) return null;
    return { x1, x2, mid: (x1 + x2) / 2 };
  }

  function dikmeAraAxes(d) {
    const out = [];
    if (d.systems.length <= 1) return out;
    d.systems.forEach((sys, s) => {
      sys.rays.forEach((x, r) => {
        if (s === 0 && r === 0) return;
        if (s === d.systems.length - 1 && r === sys.rays.length - 1) return;
        if (r === sys.rays.length - 1 && s < d.systems.length - 1) {
          const next = d.systems[s + 1];
          out.push(next && next.rays.length ? ((x + 80 + next.rays[0]) / 2) : (x + 92.5));
          return;
        }
        if (r === 0 && s > 0) return;
        out.push(x + 40);
      });
    });
    return out;
  }
  function axisPick(list, idx, total) { const n = list.length; if (n <= 0) return null; if (total <= 1) return list[Math.floor(n / 2)]; if (n === 1) return list[0]; let k = Math.floor(0.5 + idx * ((n - 1) / (total - 1))); return list[clamp(k, 0, n - 1)]; }
  function dikmeXEski(d, i) { if (i === 0) return d.solX; if (i === d.postCount - 1) return d.sagX; if (d.postCount === d.rayCount && d.rayCount > 1) return K.systemStartX + ((d.width - K.rayW) / (d.rayCount - 1)) * i + 40; return d.postCount > 1 ? d.solX + ((d.width - K.postSize) / (d.postCount - 1)) * i : K.systemStartX + d.width / 2; }
  function postAxisListsNear(a, b, tolerance = 0.01) {
    return Array.isArray(a) && Array.isArray(b) && a.length === b.length
      && a.every((value, index) => Number.isFinite(Number(value)) && Math.abs(Number(value) - Number(b[index])) <= tolerance);
  }
  function singleSystemAutomaticPostCentersForSides(d, leftEnabled, rightEnabled) {
    if (!d || d.systemCount !== 1 || d.manualPostPlacementMode !== 'standard') return null;
    if (d.postCount !== d.rayCount || d.postCount <= 2) return null;
    const system = Array.isArray(d.systems) ? d.systems[0] : null;
    if (!system) return null;
    const shrink = normalizedGlassRayBoundaryMode(d.glassRayBoundaryMode) === 'DARALT';
    const areaStartX = Number(system.startX) + K.mechanismRayInset + (shrink && leftEnabled ? K.glassMechanismOffsetEachSide : 0);
    const areaEndX = Number(system.endX) - K.mechanismRayInset - (shrink && rightEnabled ? K.glassMechanismOffsetEachSide : 0);
    if (![areaStartX, areaEndX].every(Number.isFinite)) return null;
    const areaW = Math.max(K.rayW, areaEndX - areaStartX);
    const pitch = d.rayCount > 1 ? (areaW - K.rayW) / (d.rayCount - 1) : 0;
    return Array.from({ length: d.postCount }, (_, index) => {
      if (index === 0) return d.solX;
      if (index === d.postCount - 1) return d.sagX;
      return areaStartX + index * pitch + K.rayW / 2;
    });
  }
  function isKnownSingleSystemAutomaticPostCenters(d, centers) {
    if (!d || d.systemCount !== 1 || d.manualPostPlacementMode !== 'standard') return false;
    if (d.postCount !== d.rayCount || d.postCount <= 2 || !Array.isArray(centers) || centers.length !== d.postCount) return false;
    const candidates = [
      Array.from({ length: d.postCount }, (_, index) => dikmeXEski(d, index)),
      singleSystemAutomaticPostCentersForSides(d, false, false),
      singleSystemAutomaticPostCentersForSides(d, true, false),
      singleSystemAutomaticPostCentersForSides(d, false, true),
      singleSystemAutomaticPostCentersForSides(d, true, true)
    ].filter(Boolean);
    return candidates.some(candidate => postAxisListsNear(centers, candidate));
  }
  function singleSystemStandardPostAxis(d, index) {
    // V12.12.8: Tek poz standart bölmede ara dikmeler, cam kaydının
    // sol/sağ 66 mm kararından sonra gerçekten çizilen ray merkezlerini izler.
    // İlk ve son dikmenin dış sistem kenarı sözleşmesi değişmez.
    if (!d || d.systemCount !== 1 || d.manualPostPlacementMode !== 'standard') return null;
    if (d.postCount !== d.rayCount || d.postCount <= 2) return null;
    if (index <= 0 || index >= d.postCount - 1) return null;
    const system = Array.isArray(d.systems) ? d.systems[0] : null;
    if (!system || !Array.isArray(system.rays) || system.rays.length !== d.postCount) return null;
    const rayLeftX = Number(system.rays[index]);
    return Number.isFinite(rayLeftX) ? rayLeftX + K.rayW / 2 : null;
  }
  function independentGroupAutomaticPostCenters(d, group) {
    const systems = group && Array.isArray(group.systems) ? group.systems : [];
    if (!systems.length) return [];
    const leftCenter = Number(systems[0].outerStartX) + K.postSize / 2;
    const rightCenter = Number(systems[systems.length - 1].outerEndX) - K.postSize / 2;
    if (systems.length === 1 && systems[0].rays.length <= 1) return [(leftCenter + rightCenter) / 2];
    const axes = [];
    systems.forEach((sys, localSystemIndex) => {
      (sys.rays || []).forEach((rayX, rayIndex) => {
        const isFirstRay = localSystemIndex === 0 && rayIndex === 0;
        const isLastRay = localSystemIndex === systems.length - 1 && rayIndex === (sys.rays || []).length - 1;
        if (isFirstRay || isLastRay) return;
        if (rayIndex === (sys.rays || []).length - 1 && localSystemIndex < systems.length - 1) {
          const next = systems[localSystemIndex + 1];
          axes.push(next && next.rays && next.rays.length ? ((Number(rayX) + K.rayW + Number(next.rays[0])) / 2) : (Number(rayX) + K.rayW / 2));
          return;
        }
        if (rayIndex === 0 && localSystemIndex > 0) return;
        axes.push(Number(rayX) + K.rayW / 2);
      });
    });
    return [leftCenter, ...axes, rightCenter];
  }

  function independentPostCenterXs(d) {
    const groups = Array.isArray(d && d.independentPergoRiseGroups) ? d.independentPergoRiseGroups : [];
    const automatic = groups.map(group => independentGroupAutomaticPostCenters(d, group));
    const totalExpected = groups.reduce((sum, group, index) => sum + Math.max(0, Number(group.postCount) || automatic[index].length), 0);
    if (Array.isArray(d.customFrontPostCenters) && d.customFrontPostCenters.length === totalExpected) {
      const custom = d.customFrontPostCenters.map(Number);
      const valid = custom.every(Number.isFinite) && custom.every((x, index) => index === 0 || x > custom[index - 1] + 1);
      if (valid) return custom;
    }
    const out = [];
    groups.forEach((group, groupIndex) => {
      const auto = automatic[groupIndex];
      const desired = Math.max(0, Math.round(Number(group.postCount) || auto.length));
      if (desired <= 0) return;
      if (desired === auto.length) { out.push(...auto); return; }
      const start = Number(group.outerStartX) + K.postSize / 2;
      const end = Number(group.outerEndX) - K.postSize / 2;
      if (desired === 1) { out.push((start + end) / 2); return; }
      for (let index = 0; index < desired; index += 1) out.push(start + (end - start) * index / (desired - 1));
    });
    return out;
  }

  function postCenterXs(d) {
    d.frontPostCentersAutoReconciled = false;
    if (d && d.independentMode) return independentPostCenterXs(d);
    if (d.postCount <= 0) return [];
    if (d.postCount === 1) return [K.systemStartX + d.width / 2];
    if (Array.isArray(d.customFrontPostCenters) && d.customFrontPostCenters.length === d.postCount) {
      const custom = d.customFrontPostCenters.map(Number);
      const valid = custom.every(Number.isFinite) && custom.every((x, i) => i === 0 || x > custom[i - 1] + K.postSize);
      if (valid) {
        if (custom.every((x, i) => i === 0 || x > custom[i - 1] + Math.max(1, (d.frontPostWidths && d.frontPostWidths[i - 1]) || K.postSize) / 2 + Math.max(1, (d.frontPostWidths && d.frontPostWidths[i]) || K.postSize) / 2)) {
          // V12.12.9: Önceki tek-poz standart ray düzenlerinden otomatik olarak
          // kaydedilmiş dikme aksları manuel kullanıcı tercihi sayılmaz. Sol/sağ
          // cam kaydı kararı değiştiğinde bu eski otomatik listeyi geçersiz kıl ve
          // ara dikmeleri güncel gerçek ray merkezlerinden yeniden üret.
          if (!isKnownSingleSystemAutomaticPostCenters(d, custom)) return custom;
          d.frontPostCentersAutoReconciled = true;
        }
      }
    }
    if (d.manualPostPlacementMode === 'equal') {
      return Array.from({ length: d.postCount }, (_, i) => d.solX + ((d.sagX - d.solX) / Math.max(1, d.postCount - 1)) * i);
    }
    const out = [];
    const ax = dikmeAraAxes(d);
    for (let i = 0; i < d.postCount; i += 1) {
      let x = singleSystemStandardPostAxis(d, i);
      if (d.systemCount > 1) {
        if (i === 0) x = d.solX;
        else if (i === d.postCount - 1) x = d.sagX;
        else if (d.postCount > 2) {
          const midCount = d.postCount - 2;
          if (ax.length > 0 && ax.length === midCount) x = ax[i - 1];
          else if (ax.length > 0 && !yes(d.glassTrack) && d.rayCount === d.postCount) x = axisPick(ax, i - 1, midCount);
          else x = d.solX + ((d.sagX - d.solX) / (d.postCount - 1)) * i;
        }
      }
      out.push(Number.isFinite(x) ? x : dikmeXEski(d, i));
    }
    return out;
  }


  function frontPostProfileAt(d, index) {
    const custom = d && Array.isArray(d.frontPostProfiles) ? d.frontPostProfiles[index] : null;
    return custom ? { ...normalizeGlassTrackProfile(custom), custom: true } : { mode: 'standard', en: K.postSize, boy: K.postSize, et: 2, custom: false };
  }

  function frontPostWidthAt(d, index) { return Math.max(1, Number(frontPostProfileAt(d, index).en) || K.postSize); }

  // V12.6: İlk ve son ön dikmelerin dış uçları kanonik sabit kenardır.
  // İlk dikme -X ucunu, son dikme +X ucunu korur; ara dikmeler aks merkezinde kalır.
  function frontPostBoundsAt(d, postXs, index) {
    const xs = Array.isArray(postXs) ? postXs : postCenterXs(d);
    const i = Math.max(0, Math.min(Math.max(0, xs.length - 1), Number(index) || 0));
    const axis = Number(xs[i]) || 0;
    const width = frontPostWidthAt(d, i);
    if (i === 0) return { left: axis - K.postSize / 2, right: axis - K.postSize / 2 + width, width, center: axis - K.postSize / 2 + width / 2 };
    if (i === xs.length - 1) return { left: axis + K.postSize / 2 - width, right: axis + K.postSize / 2, width, center: axis + K.postSize / 2 - width / 2 };
    return { left: axis - width / 2, right: axis + width / 2, width, center: axis };
  }

  function frontGapBounds(d, postXs, gapIndex) {
    const i = Math.max(0, Math.min(postXs.length - 2, Number(gapIndex) || 0));
    const left = frontPostBoundsAt(d, postXs, i).right;
    const right = frontPostBoundsAt(d, postXs, i + 1).left;
    return { left, right, width: Math.max(0, right - left) };
  }


  function horizontalProfilesForZone(d, view, sideViewKey, zoneId) {
    const state = d && d.horizontalFacadeProfiles || { front: [], side: {} };
    const list = String(view || '').toLowerCase() === 'front' ? state.front : (state.side && state.side[String(sideViewKey || '')]);
    return (Array.isArray(list) ? list : []).filter(profile => profile && profile.zoneId === zoneId).slice().sort((a,b)=>Number(a.positionYRatio)-Number(b.positionYRatio));
  }

  function drawHorizontalProfilesInZone(g, d, cfg) {
    const left = Number(cfg.left), right = Number(cfg.right), bottom = Number(cfg.bottom), top = Number(cfg.top);
    const clearHeight = Math.max(1, top - bottom), span = Math.max(1, right - left);
    const profiles = horizontalProfilesForZone(d, cfg.view, cfg.sideViewKey, cfg.zoneId);
    if (!profiles.length) return;
    let anchorTop = bottom;
    let anchorProfile = null;
    profiles.forEach((profile, index) => {
      const thickness = Math.max(40, Number(profile.width) || 100);
      const center = bottom + clamp(Number(profile.positionYRatio) || .5, .01, .99) * clearHeight;
      const lower = center - thickness / 2, upper = center + thickness / 2;
      const gap = Math.max(0, lower - anchorTop);
      if (gap > .5) addDimV(g, anchorTop, lower, right, right + 105 + index * 52, formatMm(gap), {
        scale: .66, layer: 'Ölçüler - Detay', dimensionFilterType: 'detail',
        edit: { dimId: `horizontal_profile_gap_${profile.id}_lower`, ruleKey: 'horizontal_profile_height', field: '__horizontal_profile__', index, label: 'Alt Sınır - Yatay Profil', view: cfg.view === 'front' ? 'Front' : (String(cfg.sideViewKey)==='right'?'Right':'Side'), relatedZoneId: cfg.zoneId, editable: true, canResize: true, actionType: 'horizontal_profile_y_resize', dimensionType: 'detail', horizontalProfileId: profile.id, horizontalAnchorProfileId: anchorProfile && anchorProfile.id || '', horizontalMoveFrom: 'lower', horizontalClearHeight: clearHeight, sideViewKey: cfg.sideViewKey || '', sideIndex: cfg.sideIndex || 0, sideGapIndex: cfg.sideGapIndex || 0 }
      });
      g.rect(left, upper, span, -thickness, 'POST');
      g.entities.push({ type:'interaction', kind:'horizontalProfileEditor', x:left, y:lower, w:span, h:thickness, data:{ horizontalProfileId: profile.id, zoneId: cfg.zoneId, profileView: cfg.view, sideViewKey: cfg.sideViewKey || '', sideIndex: cfg.sideIndex || 0, sideGapIndex: cfg.sideGapIndex || 0, en: profile.width, boy: profile.depth, clearHeight } });
      anchorTop = upper;
      anchorProfile = profile;
    });
    const last = profiles[profiles.length - 1];
    const topGap = Math.max(0, top - anchorTop);
    if (last && topGap > .5) addDimV(g, anchorTop, top, right, right + 105 + profiles.length * 52, formatMm(topGap), {
      scale: .66, layer: 'Ölçüler - Detay', dimensionFilterType: 'detail',
      edit: { dimId: `horizontal_profile_gap_${last.id}_upper`, ruleKey: 'horizontal_profile_height', field: '__horizontal_profile__', index: profiles.length - 1, label: 'Yatay Profil - Üst Sınır', view: cfg.view === 'front' ? 'Front' : (String(cfg.sideViewKey)==='right'?'Right':'Side'), relatedZoneId: cfg.zoneId, editable: true, canResize: true, actionType: 'horizontal_profile_y_resize', dimensionType: 'detail', horizontalProfileId: last.id, horizontalAnchorProfileId: '', horizontalMoveFrom: 'upper', horizontalClearHeight: clearHeight, sideViewKey: cfg.sideViewKey || '', sideIndex: cfg.sideIndex || 0, sideGapIndex: cfg.sideGapIndex || 0 }
    });
  }

  function customHatchBlocks() {
    // V8.4.5: Bu bloklar geometri yer tutucusudur; önizleme/PDF sabit model-uzayı desenini doğrudan üretir, Modern DXF motoru gerçek HATCH'e dönüştürür.
    const brick = [];
    const brickCourse = 190.5;
    const brickWidth = 381;
    for (let y = brickCourse; y < 1000; y += brickCourse) {
      brick.push({ type: 'line', layer: 'HATCH_WALL', color: 8, x1: 0, y1: y, x2: 1000, y2: y });
    }
    for (let row = 0; row <= Math.ceil(1000 / brickCourse); row += 1) {
      const y1 = row * brickCourse;
      const y2 = Math.min(1000, y1 + brickCourse);
      const rowOffset = row % 2 === 0 ? 0 : brickWidth / 2;
      for (let x = rowOffset; x <= 1000; x += brickWidth) {
        if (x > 0 && x < 1000) brick.push({ type: 'line', layer: 'HATCH_WALL', color: 8, x1: x, y1, x2: x, y2 });
      }
    }

    const trapez = [];
    for (let x = 0; x < 1000; x += 150) {
      trapez.push({ type: 'line', layer: 'HATCH_FABRIC', color: 42, x1: x, y1: 0, x2: x, y2: 1000 });
      if (x + 42 < 1000) trapez.push({ type: 'line', layer: 'HATCH_FABRIC', color: 42, x1: x + 42, y1: 0, x2: x + 42, y2: 1000 });
    }

    return {
      'PULUMUR WALL BRICK SAFE HATCH': { dxfName: 'PULUMUR_WALL_BRICK_HATCH', bounds: { minX: 0, minY: 0, maxX: 1000, maxY: 1000 }, entities: brick },
      'PULUMUR TRAPEZ SAFE HATCH': { dxfName: 'PULUMUR_TRAPEZ_SAFE_HATCH', bounds: { minX: 0, minY: 0, maxX: 1000, maxY: 1000 }, entities: trapez }
    };
  }

  function safeHatchBlock(g, name, x, y, w, h, layer) {
    const ww = Number(w) || 0;
    const hh = Number(h) || 0;
    if (Math.abs(ww) < 50 || Math.abs(hh) < 50) return;
    // Çizim modelinde tarama alanı hafif bir INSERT taşıyıcısıyla tutulur.
    // Modern DXF motoru bunu gerçek HATCH'e, önizleme/PDF motoru ise aynı ölçekli kesilmiş çizgi desenine dönüştürür.
    // X referansı normalize edilerek aynalı sağ görünüşte taramanın duvar dışına taşması engellenir.
    const insX = ww >= 0 ? x : x + ww;
    const scaleX = Math.abs(ww) / 1000;
    const scaleY = hh / 1000;
    return g.insert(name, insX, y, { layer, rotation: 0, scaleX, scaleY, previewW: Math.abs(ww), previewH: Math.abs(hh) });
  }

  function topWallYAt(d, idx) {
    const position = d && Array.isArray(d.positions) ? d.positions[idx] : null;
    if (d && d.independentMode && position && position.yAlignmentMode === 'REAR_START_ALIGNED') return 0;
    return -(d.openingList[0] - (nthOrLast(d.openingList, idx) || d.opening));
  }
  function topGutterYForPosition(d, idx) {
    const opening = nthOrLast(d.openingList, idx) || d.opening;
    return topWallYAt(d, idx) - opening;
  }
  function topWallHAt(d, idx) { return K.topWallH + (d.maxOpening - (nthOrLast(d.openingList, idx) || d.opening)); }
  function topBackWallMaxYAt(d, idx) {
    // V13.32: Duvarın +Y görsel ucu, açılım hizalama kararını ezmez.
    // FRONT_GUTTER_ALIGNED modunda formül zaten +Y uçlarını eşitler.
    // REAR_START_ALIGNED (;NO) modunda ise -Y başlangıç 0'da kalır ve +Y uçları açılıma göre ayrışır.
    return topWallYAt(d, idx) + topWallHAt(d, idx);
  }
  function topBackWallMinYAt(d, idx) { return topBackWallMaxYAt(d, idx) - topWallHAt(d, idx); }
  function topCatiProfilYAt(d, idx) { return topWallYAt(d, idx) - 400; }
  function onRayTopYForPosition(d, idx) { const rear = nthOrLast(d.rearHeightList, idx) || d.rearHeight; return d.frontRayTopRefY - (d.maxRearHeight - rear); }
  function frontRectStartYForPosition(d, idx) {
    const position = d && Array.isArray(d.positions) ? d.positions[idx] : null;
    const rear = position && Number.isFinite(Number(position.rearHeight)) ? Number(position.rearHeight) : (nthOrLast(d.rearHeightList, idx) || d.rearHeight);
    const front = position && Number.isFinite(Number(position.frontHeight)) ? Number(position.frontHeight) : (nthOrLast(d.frontHeightList, idx) || d.frontHeight);
    if (d && d.independentMode && Number.isFinite(Number(d.independentLeftRearWallMinusY))) return Number(d.independentLeftRearWallMinusY) + front;
    return onRayTopYForPosition(d, idx) - rear + front;
  }

  function fitTopWallDepthPair(startDepth, endDepth, maxDepth) {
    const maxD = Math.max(1, Number(maxDepth) || 1);
    let a = Math.max(0, Number(startDepth) || 0), b = Math.max(0, Number(endDepth) || 0);
    const delta = b - a;
    if (Math.abs(delta) >= maxD) return delta >= 0 ? [0, maxD] : [maxD, 0];
    if (a > maxD || b > maxD) { const shift = Math.max(a, b) - maxD; a -= shift; b -= shift; }
    if (a < 0 || b < 0) { const shift = -Math.min(a, b); a += shift; b += shift; }
    return [clamp(a, 0, maxD), clamp(b, 0, maxD)];
  }

  function drawTopWall(g, d) {
    d.systems.forEach(sys => {
      const defaultDepth = topWallHAt(d, sys.index);
      const fixedMaxY = topBackWallMaxYAt(d, sys.index);
      const defaultMinY = fixedMaxY - defaultDepth;
      const wx = Number.isFinite(Number(sys.outerStartX)) ? Number(sys.outerStartX) : Number(sys.startX);
      const wallEndX = Number.isFinite(Number(sys.outerEndX)) ? Number(sys.outerEndX) : Number(sys.endX);
      const ww = Math.max(1, wallEndX - wx);
      const grid = d.topBackWallGridState && d.topBackWallGridState[String(sys.index)];
      const cells = grid && Array.isArray(grid.cells) ? grid.cells : [];
      cells.forEach((cell, cellIndex) => {
        if (cell.enabled === false) return;
        const start = Number(cell.minX), end = Number(cell.maxX);
        if (!Number.isFinite(start) || !Number.isFinite(end) || end - start <= 0.001) return;
        let [nearA, nearB] = fitTopWallDepthPair(cell.startNearDepth, cell.endNearDepth, defaultDepth);
        let [farA, farB] = fitTopWallDepthPair(cell.startFarDepth, cell.endFarDepth, defaultDepth);
        nearA = Math.min(nearA, farA); nearB = Math.min(nearB, farB);
        const x1 = wx + start, x2 = wx + end;
        const points = [[x1, fixedMaxY - nearA], [x2, fixedMaxY - nearB], [x2, fixedMaxY - farB], [x1, fixedMaxY - farA]];
        g.poly(points, true, 'TOPWALL');
        g.entities.push({ type: 'hatch', layer: 'HATCH_WALL', points, patternKind: 'brick' });
        const ys = points.map(p => p[1]);
        const minY = Math.min(...ys), maxY = Math.max(...ys);
        g.entities.push({ type: 'interaction', kind: 'topBackWallEditor', x: x1, y: minY, w: x2 - x1, h: Math.max(1, maxY - minY), data: {
          systemIndex: sys.index, wallCellId: cell.id, wallCellIndex: cellIndex, wallCellCount: cells.length, wallCellEnabled: true,
          cellMinX: start, cellMaxX: end, startNearDepth: nearA, endNearDepth: nearB, startFarDepth: farA, endFarDepth: farB,
          wallDepth: defaultDepth, boundMinX: x1, boundMaxX: x2, boundMinY: minY, boundMaxY: maxY,
          defaultBoundMinX: wx, defaultBoundMaxX: wallEndX, defaultBoundMinY: defaultMinY, defaultBoundMaxY: fixedMaxY
        }});
        // V13.22 geriye dönük test/metadata köprüsü. Önizlemede çizilmez; yeni etkileşim topBackWallEditor'dır.
        g.entities.push({ type: 'interaction', previewOnly: true, kind: 'parapetEditor', x: x1, y: minY, w: x2-x1, h: Math.max(1,maxY-minY), data: {
          parapetView:'top-back-wall', systemIndex:sys.index, parapetSegmentId:cell.id, parapetSegmentIndex:cellIndex,
          segmentStart:start, segmentEnd:end, segmentHeight:Math.max(farA,farB), segmentStartHeight:farA, segmentEndHeight:farB,
          boundMinX:x1,boundMaxX:x2,boundMinY:minY,boundMaxY:maxY,defaultBoundMinX:wx,defaultBoundMaxX:wallEndX,defaultBoundMinY:defaultMinY,defaultBoundMaxY:fixedMaxY
        }});
      });
    });
    drawTopRearSteelSupport(g, d);
  }

  function drawTopRays(g, d) {
    d.systems.forEach(sys => {
      const p = d.positions[sys.index] || d.positions[0];
      const rayEndY = topGutterYForPosition(d, sys.index) - K.topRayEndExtra;
      const rayStartY = rayEndY + (p.opening - K.rayLengthFrontDeduct);
      sys.rays.forEach(x => {
        g.rect(x, rayStartY, K.rayW, -(p.opening - K.rayLengthFrontDeduct), 'Ray - Üst Görünüş');
        g.rect(x + 33.5, rayStartY, 13, -(p.opening - K.rayLengthFrontDeduct), 'Ray - Üst Görünüş');
        blockRef(g, 'PergoRise Ray Arka Mekanizma Üst Görünüş', x + 40, rayStartY, 95, 72);
        blockRef(g, 'PergoRise Ray Kafası Üst Görünüş', x + 40, rayEndY, 100, 80);
      });
    });
  }

  function waterOutletRailAxes(systems) {
    const out = [];
    const seen = new Set();
    (Array.isArray(systems) ? systems : []).forEach(sys => {
      (Array.isArray(sys && sys.rays) ? sys.rays : []).forEach((rayX, rayIndex) => {
        const axisX = Number(rayX) + K.rayW / 2;
        if (!Number.isFinite(axisX)) return;
        const key = String(Number(axisX.toFixed(6)));
        if (seen.has(key)) return;
        seen.add(key);
        out.push({ system: sys, systemIndex: Number(sys.index) || 0, rayIndex, axisX });
      });
    });
    return out;
  }

  function drawTopWaterOutletPipes(g, d, bounds, gutterY, systems, groupId) {
    if (yes(d.waterStandard)) return;
    const state = normalizeWaterOutletPipeState(d.waterOutletPipeState);
    const pipeW = state.diameter, pipeL = state.length;
    const placement = String(d.waterOutletPlacement || 'BOTH').toUpperCase();
    const prefix = groupId ? `${groupId}_` : '';
    const drawPipe = (id, x, y, w, h, orientation, extraData = {}) => {
      if (state.deleted[id] === true) return;
      const offset = Number(state.offsets[id]) || 0;
      x += offset;
      g.rect(x, y, w, h, 'WATER');
      const minX = Math.min(x, x + w), maxX = Math.max(x, x + w), minY = Math.min(y, y + h), maxY = Math.max(y, y + h);
      const cleanMm = value => String(Number(Number(value).toFixed(3)));
      const label = `Ø${cleanMm(pipeW)} Pipe ${cleanMm(pipeL)} mm`;
      g.text((minX + maxX) / 2, minY - 55, label, 60, 'WATER', 'center', 0);
      g.entities.push({ type: 'interaction', kind: 'waterPipeEditor', x: minX, y: minY, w: maxX - minX, h: maxY - minY, data: {
        waterPipeId: id, waterPipeOrientation: orientation, waterPipeDiameter: pipeW, waterPipeLength: pipeL, waterPipeXOffset: offset,
        independentGroupId: groupId || '', boundMinX: minX, boundMaxX: maxX, boundMinY: minY, boundMaxY: maxY,
        ...extraData
      }});
    };
    const scopedSystems = Array.isArray(systems) && systems.length ? systems : (d.systems || []);
    if (placement === 'SIDES' || placement === 'BOTH') {
      const firstSystem = scopedSystems[0], lastSystem = scopedSystems[scopedSystems.length - 1];
      const leftY = firstSystem ? topGutterYForPosition(d, firstSystem.index) : gutterY;
      const rightY = lastSystem ? topGutterYForPosition(d, lastSystem.index) : gutterY;
      drawPipe(`${prefix}side_left`, bounds.start - pipeL, leftY + K.topGutterH / 2 - pipeW / 2, pipeL, pipeW, 'side', { waterPipeSide: 'left' });
      drawPipe(`${prefix}side_right`, bounds.end, rightY + K.topGutterH / 2 - pipeW / 2, pipeL, pipeW, 'side', { waterPipeSide: 'right' });
    }
    if (placement === 'FRONT' || placement === 'BOTH') {
      waterOutletRailAxes(scopedSystems).forEach(item => {
        const id = `${prefix}front_${item.systemIndex}_${item.rayIndex}`;
        const localGutterY = topGutterYForPosition(d, item.systemIndex);
        drawPipe(id, item.axisX - pipeW / 2, localGutterY, pipeW, -pipeL, 'front', {
          waterPipeRailAxisX: item.axisX,
          waterPipeSystemIndex: item.systemIndex,
          waterPipeRayIndex: item.rayIndex
        });
      });
    }
  }

  function drawTopGutterProfile(g, d, bounds, y, group, interactionBounds) {
    g.rect(bounds.start, y, bounds.width, K.topGutterH, 'PROFILE');
    g.rect(bounds.start, y, bounds.width, K.topGutterInnerH, 'PROFILE');
    g.rect(bounds.start, y + K.topGutterH, bounds.width, -K.topGutterLipH, 'PROFILE');
    if (interactionBounds !== false) g.entities.push({ type: 'interaction', kind: 'gutterEditor', x: bounds.start, y, w: bounds.width, h: K.topGutterH, data: {
      ...(group ? { independentGroupId: group.groupId, independentGroupIndex: group.groupIndex } : {}),
      gutterMinusXDelta: bounds.minusXDelta, gutterPlusXDelta: bounds.plusXDelta,
      boundMinX: bounds.start, boundMaxX: bounds.end, boundMinY: y, boundMaxY: y + K.topGutterH,
      defaultBoundMinX: bounds.defaultStart, defaultBoundMaxX: bounds.defaultEnd, defaultBoundMinY: y, defaultBoundMaxY: y + K.topGutterH
    }});
  }

  function drawTopGutter(g, d) {
    if (!d.independentMode) {
      const y = -d.opening;
      const b = gutterBounds(d);
      drawTopGutterProfile(g, d, b, y, null, true);
      drawTopWaterOutletPipes(g, d, b, y);
      return;
    }
    (d.independentPergoRiseGroups || []).forEach(group => {
      const b = gutterBounds(d, group);
      const systems = group.systems || [];
      const yValues = systems.map(sys => topGutterYForPosition(d, sys.index));
      const sameY = yValues.every(value => Math.abs(value - yValues[0]) < 0.001);
      if (sameY) drawTopGutterProfile(g, d, b, yValues[0], group, true);
      else {
        systems.forEach((sys, localIndex) => {
          const start = localIndex === 0 ? b.start : Number(sys.outerStartX) - 6.5;
          const end = localIndex === systems.length - 1 ? b.end : Number(sys.outerEndX) + 6.5;
          const segmentBounds = { ...b, start, end, width: end - start };
          drawTopGutterProfile(g, d, segmentBounds, yValues[localIndex], group, localIndex === 0);
        });
      }
      drawTopWaterOutletPipes(g, d, b, yValues[0], systems, group.groupId);
    });
  }

  function drawTopPosts(g, d) {
    postCenterXs(d).forEach((x, i) => {
      const profile = frontPostProfileAt(d, i);
      const positionIndex = d.independentMode ? frontPositionIndexAtX(d, x) : 0;
      const y = d.independentMode ? topGutterYForPosition(d, positionIndex) : d.posY;
      if (!profile.custom) {
        blockRef(g, 'PergoRise Dikme Üst Görünüş', x, y, 100, 100, 'POST');
        blockRef(g, 'PergoRise Dikme Oluk Bağlantı Üst Görünüş', x, y, 135, 95);
      } else drawHollowRect(g, x - profile.en / 2, y + profile.boy, profile.en, -profile.boy, 'POST', profile.et);
    });
  }

  function drawTopGlassTrack(g, d) {
    const profile = d.glassTrackProfile || normalizeGlassTrackProfile();
    const topW = profile.boy;
    const firstA = nthOrLast(d.openingList, 0) || d.opening;
    const lastIdx = Math.max(0, d.sidePositionCount - 1);
    const lastA = nthOrLast(d.openingList, lastIdx) || firstA;
    const baseY = topGlassTrackFrontRefY(d);
    const items = [];
    if (sideFeatureEnabled(d, 'glassTrack', '0', 0)) items.push({ baseX: d.solX - 50, camL: Math.max(1, firstA - 100 + sideTrackLengthOffset(d, '0')), by: baseY, sideViewKey: '0', geom: d.sideSupportGeometry && d.sideSupportGeometry['0'] });
    if (sideFeatureEnabled(d, 'glassTrack', 'right', lastIdx)) items.push({ baseX: d.sagX + 50 - topW, camL: Math.max(1, lastA - 100 + sideTrackLengthOffset(d, 'right')), by: baseY, sideViewKey: 'right', geom: d.rightSideSupportGeometry });
    for (let i = 1; i < lastIdx; i += 1) {
      const key = String(i);
      if (!sideFeatureEnabled(d, 'glassTrack', key, i)) continue;
      const sys = d.systems[Math.min(i, d.systems.length - 1)] || d.systems[0];
      const a = nthOrLast(d.openingList, i) || d.opening;
      items.push({ baseX: (sys ? sys.startX : d.solX) - topW / 2, camL: Math.max(1, a - 100 + sideTrackLengthOffset(d, key)), by: baseY, sideViewKey: key, geom: d.sideSupportGeometry && d.sideSupportGeometry[key] });
    }
    items.forEach(({ baseX, camL, by, sideViewKey, geom }) => {
      g.rect(baseX, by, topW, camL, 'GLASS');
      const posts = geom && Array.isArray(geom.posts) ? geom.posts : [];
      posts.forEach(post => {
        const supportScope = sideViewKey === 'right' ? 'right' : (sideViewKey === '0' ? 'left' : `middle_${sideViewKey}`);
        const sp = post.profile || supportProfileFor(d, supportScope);
        const supTopW = sp.boy;
        const supSideH = sp.en;
        const sx = sideViewKey === 'right' ? (baseX + topW - supTopW) : baseX;
        const sy = Number(post.topCenterY) - supSideH / 2;
        drawHollowRect(g, sx, sy, supTopW, supSideH, 'GLASS', sp.et);
      });
    });
  }

  function drawTopRoofProfiles(g, d) {
    rayIntervals(d).forEach(interval => {
      if (interval.len <= 1) return;
      const p = d.positions[interval.system] || d.positions[0];
      const sys = d.systems[interval.system] || d.systems[0];
      const y = topCatiProfilYAt(d, interval.system);
      const shift = (p.rayLength / K.catiProfilRayRatioBase) * K.catiProfilRayRatioMove + K.catiProfilExtraOffset;
      const defaultBounds = sys ? defaultTopTrapezBounds(d, sys) : null;
      const currentBounds = sys ? topTrapezBoundsForSystem(d, sys) : defaultBounds;
      const fixedProfile = g.rect(interval.x, y, interval.len, K.catiProfilH, 'FABRIC');
      fixedProfile.roofProfileRole = 'fixed';
      fixedProfile.systemIndex = interval.system;
      // Trapez sacın -Y sınırı bu çatı kayıt profiliyle aynı koordinattır.
      // Delta türetmek yerine doğrudan güncel minY değerini kullanmak; SVG, PDF ve
      // DXF ortak modelinde profil ile sac sınırının ayrışmasını engeller.
      const alignedMinusY = currentBounds && Number.isFinite(Number(currentBounds.minY))
        ? Number(currentBounds.minY)
        : y - shift;
      const movingProfile = g.rect(interval.x, alignedMinusY, interval.len, K.catiProfilH, 'FABRIC');
      movingProfile.roofProfileRole = 'trapezMinusY';
      movingProfile.systemIndex = interval.system;
    });
  }

  function defaultTopTrapezBounds(d, sys) {
    const p = d.positions[sys.index] || d.positions[0];
    const firstRayX = sys.rays && sys.rays.length ? sys.rays[0] : sys.rayAreaStartX;
    const lastRayX = sys.rays && sys.rays.length ? sys.rays[sys.rays.length - 1] : sys.rayAreaEndX;
    const rayEndY = topGutterYForPosition(d, sys.index) - K.topRayEndExtra;
    const rayStartY = rayEndY + (p.opening - K.rayLengthFrontDeduct);
    const roofY = topCatiProfilYAt(d, sys.index);
    const shift = (p.rayLength / K.catiProfilRayRatioBase) * K.catiProfilRayRatioMove + K.catiProfilExtraOffset;
    const rearMechanism = getBlocks()['PergoRise Ray Arka Mekanizma Üst Görünüş'] || {
      bounds: { minX: -46, minY: -131, maxX: 46, maxY: 215 }
    };
    const firstBounds = transformBlockBounds(rearMechanism, { x: firstRayX + 40, y: rayStartY, scaleX: 1, scaleY: 1, rotation: 0 });
    const lastBounds = transformBlockBounds(rearMechanism, { x: lastRayX + 40, y: rayStartY, scaleX: 1, scaleY: 1, rotation: 0 });
    return { minX:firstBounds[0], maxX:lastBounds[2], minY:roofY - shift, maxY:Math.max(firstBounds[3], lastBounds[3]) };
  }
  function topTrapezBoundsForSystem(d, sys) {
    const base=defaultTopTrapezBounds(d,sys), raw=d.trapezSheetBounds && d.trapezSheetBounds[String(sys.index)];
    if(!raw||typeof raw!=='object') return base;
    const out={minX:Number(raw.minX),maxX:Number(raw.maxX),minY:Number(raw.minY),maxY:Number(raw.maxY)};
    return Object.values(out).every(Number.isFinite)&&out.maxX-out.minX>=50&&out.maxY-out.minY>=50?out:base;
  }
  function drawTopTrapezSafeHatch(g, d) {
    d.systems.forEach(sys => {
      const defaults=defaultTopTrapezBounds(d,sys), b=topTrapezBoundsForSystem(d,sys); const w=b.maxX-b.minX, h=b.maxY-b.minY;
      const boundary=g.rect(b.minX,b.minY,w,h,'HATCH_FABRIC');
      g.entities.push({type:'hatch',layer:'HATCH_FABRIC',points:[[b.minX,b.minY],[b.maxX,b.minY],[b.maxX,b.maxY],[b.minX,b.maxY]],patternKind:'fabric'});
      const preview=safeHatchBlock(g, 'PULUMUR TRAPEZ SAFE HATCH', b.minX, b.minY, w, h, 'HATCH_FABRIC');
      if(preview) preview.previewOnly=true;
      g.entities.push({type:'interaction',kind:'trapezSheetEditor',x:b.minX,y:b.minY,w,h,data:{
        systemIndex:sys.index,
        boundMinX:b.minX,boundMaxX:b.maxX,boundMinY:b.minY,boundMaxY:b.maxY,
        defaultBoundMinX:defaults.minX,defaultBoundMaxX:defaults.maxX,defaultBoundMinY:defaults.minY,defaultBoundMaxY:defaults.maxY
      }});
    });
  }

  function drawTopTrapez(g, d) {
    d.systems.forEach(sys => {
      const p = d.positions[sys.index] || d.positions[0];
      const profilKaydirY = ((p.rayLength / K.catiProfilRayRatioBase) * K.catiProfilRayRatioMove + K.catiProfilExtraOffset) + 400;
      const trapX = sys.rayAreaStartX;
      const trapW = sys.rayAreaEndX - sys.rayAreaStartX;
      const trapY = topWallYAt(d, sys.index);
      if (trapW > 1) blockRef(g, 'Trapez Tarama', trapX, trapY, trapW, profilKaydirY, 'BLOCKREF', 0, trapW / 100, profilKaydirY / 100);
    });
  }

  function pergoRiseTextFitForSystem(d, sys, label) {
    // PERI01 kuralı: PERGO RISE yazısı, her pozda ilk ve son ray arasında kalır.
    // İlk rayın iç kenarından +400, son rayın iç kenarından -400 boşluk bırakılır.
    const rays = sys && sys.rays ? sys.rays : [];
    let leftLimit = sys ? sys.startX + 400 : K.systemStartX + 400;
    let rightLimit = sys ? sys.endX - 400 : K.systemStartX + d.width - 400;
    if (rays.length >= 2) {
      leftLimit = rays[0] + K.rayW + 400;
      rightLimit = rays[rays.length - 1] - 400;
    } else if (rays.length === 1) {
      leftLimit = (sys ? sys.startX : rays[0]) + 400;
      rightLimit = (sys ? sys.endX : rays[0] + K.rayW) - 400;
    }
    if (rightLimit <= leftLimit) {
      leftLimit = sys ? sys.startX + 80 : K.systemStartX;
      rightLimit = sys ? sys.endX - 80 : K.systemStartX + d.width;
    }
    const available = Math.max(1, rightLimit - leftLimit);
    // R12 TEXT çıktısında çoklu poz yazısı tek satır görünür; hesabı da o satıra göre yapıyoruz.
    const textLen = Math.max(1, String(label || '').replace(/\s+/g, ' ').trim().length);
    const height = clamp(available / (textLen * 0.68), 32, K.pergoTextMaxH);
    return { x: (leftLimit + rightLimit) / 2, h: height };
  }

  function drawTopPergoText(g, d) {
    d.systems.forEach((sys, i) => {
      const position = d.positions[i] || d.positions[0];
      const textY = d.independentMode
        ? topWallYAt(d, i) - (Number(position && position.opening) || d.opening) / 2
        : -d.opening / 2;
      const label = d.independentMode
        ? `${sys.independentGroupId || 'IPR-01'} · POZ ${Number(sys.groupPositionIndex || 0) + 1}`
        : (d.systemCount > 1 ? `PERGO RISE POZ ${i + 1}` : 'PERGO RISE');
      const fit = pergoRiseTextFitForSystem(d, sys, label);
      const ent = g.text(fit.x, textY, label, fit.h, 'TITLE', 'center');
      ent.presentationRole = 'product-name';
      ent.color = 3; // PERI01 pergoPozYaz: (col "3")
    });
  }

  function drawTopView(g, d) {
    drawTopWall(g, d);
    drawTopRays(g, d);
    drawTopGutter(g, d);
    drawTopPosts(g, d);
    drawTopGlassTrack(g, d);
    drawTopRoofProfiles(g, d);
    drawTopTrapezSafeHatch(g, d);
    /* drawTopTrapez disabled for no-polyline-simplify lightweight DXF */
    drawTopPergoText(g, d);

    // V8.4.5: Üst görünüşte açılım ölçüsü gösterilmez.
    // Açılım ölçüsü yan görünüşte poz bazlı olarak korunur.

    // Ray ölçüleri tek ve çoklu sistemlerde aynı kuralla üretilir.
    const gutterInnerY = -d.opening + K.topGutterH;
    const topWidthDimY = gutterInnerY + 500;
    const rayDimY = topWidthDimY + 660; // v8.9.20: bütün pozlarda Poz 3 referansındaki sabit ölçü hattı
    d.systems.forEach((sys, s) => {
      editableRaySpans(sys).forEach(span => {
        addDimH(g, span.x1, span.x2, gutterInnerY, rayDimY, formatMm(span.x2 - span.x1), {
          layer: 'Ölçüler - Detay',
          edit: {
            dimId: `top_ray_spacing_${s}_${span.index}`,
            ruleKey: 'top_ray_gap',
            field: '__ray_interval__',
            index: s,
            raySystemIndex: s,
            rayIntervalIndex: span.index,
            raySpanMode: span.mode,
            label: `Poz ${s + 1} ${span.label}`,
            view: 'Top',
            relatedZoneId: `top_ray_spacing_zone_${s}_${span.index}`,
            editable: true,
            canResize: true,
            actionType: 'ray_interval_resize',
            dimensionType: 'detail'
          }
        });
      });
    });

    const ranges = systemRanges(d);
    const exteriorAllowances = systemExteriorAllowanceRanges(d);
    const hasExteriorAllowance = exteriorAllowances.length > 0;

    if (d.systemCount === 1 && !hasExteriorAllowance) {
      const onlyRange = ranges[0];
      addDimH(g, onlyRange.x1, onlyRange.x2, 0, 800, `GENİŞLİK ${formatMm(onlyRange.x2 - onlyRange.x1)}`, {
        layer: 'Ölçüler - Üst Görünüş',
        edit: {
          dimId: 'top_system_1_width', ruleKey: 'top_system_width', field: 'width', index: 0,
          label: 'Sistem / Arka Mekanizma Genişliği', view: 'Top', relatedZoneId: 'top_system_1_zone'
        }
      });
      return;
    }

    // Kanonik sistem genişliği arka mekanizma dıştan dışa ölçüsüdür.
    // Üst görünüş duvarı ise tekli ve çoklu pozlarda dış zarf payını kullanır. DARALT modundaki
    // dış cam payları sistem genişliğine karıştırılmadan ayrı bilgi ölçüleri olarak gösterilir.
    ranges.forEach(r => addDimH(g, r.x1, r.x2, gutterInnerY, topWidthDimY, `SİSTEM ${r.system + 1} ${formatMm(r.x2 - r.x1)}`, {
      layer: 'Ölçüler - Üst Görünüş',
      edit: {
        dimId: `top_system_${r.system + 1}_width`, ruleKey: 'top_system_width', field: 'width', index: r.system,
        label: `Sistem ${r.system + 1} / Arka Mekanizma Genişliği`, view: 'Top', relatedZoneId: `top_system_${r.system + 1}_zone`
      }
    }));
    systemGapRanges(d).forEach((gap, gi) => addDimH(g, gap.x1, gap.x2, gutterInnerY, topWidthDimY, `${formatMm(gap.x2 - gap.x1)}`, {
      layer: 'Ölçüler - Üst Görünüş',
      edit: {
        dimId: `top_system_gap_${gi + 1}`, ruleKey: 'info_only', field: '__info__', index: gi,
        label: 'Fiziksel Arka Mekanizma Ara Boşluğu', view: 'Top', relatedZoneId: `top_system_gap_zone_${gi + 1}`, editable: false
      }
    }));
    exteriorAllowances.forEach((allowance, index) => addDimH(g, allowance.x1, allowance.x2, gutterInnerY, topWidthDimY + 180, `${formatMm(allowance.x2 - allowance.x1)}`, {
      layer: 'Ölçüler - Detay',
      edit: {
        dimId: `top_exterior_glass_allowance_${allowance.side}`, ruleKey: 'info_only', field: '__info__', index,
        label: allowance.label, view: 'Top', relatedZoneId: `top_exterior_glass_allowance_zone_${allowance.side}`, editable: false, dimensionType: 'detail'
      }
    }));

    if (d.systemCount > 1) {
      const systemAxisDimY = topWidthDimY + 330;
      systemAxisSpans(d).forEach((span, index) => addDimH(g, span.x1, span.x2, gutterInnerY, systemAxisDimY, `${span.label} ${formatMm(span.displayValue)}`, {
        layer: 'Ölçüler - Detay',
        edit: {
          dimId: `top_system_axis_${index + 1}`, ruleKey: 'info_only', field: '__info__', index,
          label: span.label, view: 'Top', relatedZoneId: `top_system_axis_zone_${index + 1}`, editable: false, dimensionType: 'detail'
        },
        measuredTextOverride: span.displayValue
      }));
    }

    // Toplam genişlik, dış cam payları dahil kullanıcının verdiği gerçek dıştan dışa sınırdır.
    // Sistem ölçüleri arka mekanizma dışlarından; duvar çizimi dış zarf poz payından alınır.
    const firstSystem = d.systems[0];
    const lastSystem = d.systems[d.systems.length - 1];
    if (firstSystem && lastSystem) {
      const totalMeasureX1 = Number(firstSystem.startX);
      const totalMeasureX2 = Number(lastSystem.endX);
      const wallTopMaxY = safeExtrema(d.systems.map(sys => Math.max(topWallYAt(d, sys.index), topWallYAt(d, sys.index) + topWallHAt(d, sys.index))), 'max', 0);
      const totalDimY = wallTopMaxY + 50;
      addDimH(g, totalMeasureX1, totalMeasureX2, wallTopMaxY, totalDimY, `TOPLAM GENİŞLİK ${formatMm(totalMeasureX2 - totalMeasureX1)}`, {
        layer: 'Ölçüler - Üst Görünüş',
        edit: {
          dimId: 'top_total_measure_width', ruleKey: d.systemCount === 1 ? 'top_total_width' : 'info_only', field: d.systemCount === 1 ? 'width' : '__info__', index: 0, editable: d.systemCount === 1, canResize: d.systemCount === 1,
          label: 'Cam Payları Dahil Toplam Genişlik', view: 'Top', relatedZoneId: 'top_total_width_zone'
        }
      });
    }
  }

  function slidingBlockName(placement) {
    const poz = String((placement && placement.pozNo) || 'S01').toUpperCase().replace(/[^A-Z0-9_-]+/g, '_');
    return `SLIDING_POZ_${poz}`;
  }

  // V8.4.3: Sliding iç bilgi tablosu kodda korunur fakat varsayılan olarak çizilmez.
  // İleride başka bir yerleşim modunda placement.showInternalTable=true ile yeniden kullanılabilir.
  const SLIDING_INTERNAL_TABLE_ENABLED = false;

  function slidingTextHeight(value, cellW, baseH, minH = 12) {
    const text = String(value || '');
    const len = Math.max(1, text.length);
    const maxByWidth = Math.floor(Math.max(1, cellW - 18) / (len * 0.60));
    return Math.max(minH, Math.min(baseH, maxByWidth));
  }

  function slidingArrowEntity(panel, direction, y, color = 4) {
    const inset = 30;
    const x1 = panel.x1 + inset;
    const x2 = panel.x2 - inset;
    const height = 400;
    const headLen = height / 2;
    const halfHead = height / 2.4;
    const points = direction === 'RIGHT'
      ? [[x1, y], [x2, y], [x2 - headLen, y + halfHead], [x2, y], [x2 - headLen, y - halfHead]]
      : [[x2, y], [x1, y], [x1 + headLen, y + halfHead], [x1, y], [x1 + headLen, y - halfHead]];
    return { type: 'polyline', layer: 'Ürün Yerleşimi - Sürme', color, closed: false, points };
  }

  function chooseSlidingTablePanel(panels, occupied) {
    const defaultIndex = Math.min(1, Math.max(0, panels.length - 1));
    if (!occupied.has(defaultIndex)) return { index: defaultIndex, greyArrowPanel: null };
    const empty = panels.map((_, i) => i).filter(i => !occupied.has(i));
    if (empty.length) {
      empty.sort((a, b) => Math.abs(a - defaultIndex) - Math.abs(b - defaultIndex) || a - b);
      return { index: empty[0], greyArrowPanel: null };
    }
    return { index: defaultIndex, greyArrowPanel: defaultIndex };
  }

  function addSlidingTableEntities(entities, panel, placement) {
    const layer = 'Ürün Yerleşimi - Sürme';
    const color = 4;
    const x = panel.x1 + 30;
    const y = panel.y1 + 30;
    const w = Math.max(50, panel.x2 - panel.x1 - 60);
    const h = Math.max(100, panel.y2 - panel.y1 - 60);
    const rows = [
      [`SLIDING POZ ${placement.pozNo}`, ''],
      ['POZ NO', placement.pozNo],
      ['SERIES', placement.series],
      ['TYPE', placement.type],
      ['OPENING TYPE', placement.openingType],
      ['GLASS THICKNESS', placement.glassThickness],
      ['GLASS COLOR', placement.glassColor],
      ['QUANTITY', String(placement.quantity)],
      ['SIZE', `${Math.round(placement.width)} X ${Math.round(placement.height)} MM`],
      ['PANEL COUNT', String(placement.panelCount)]
    ];
    const rowH = h / rows.length;
    const topY = y + h;
    const splitX = x + w * 0.50;
    const leftW = splitX - x;
    const rightW = x + w - splitX;
    entities.push({ type: 'polyline', layer, color, closed: true, points: [[x, y], [x + w, y], [x + w, topY], [x, topY]] });
    entities.push({ type: 'line', layer, color, x1: splitX, y1: y, x2: splitX, y2: topY - rowH });
    for (let i = 1; i < rows.length; i += 1) {
      const yy = topY - i * rowH;
      entities.push({ type: 'line', layer, color, x1: x, y1: yy, x2: x + w, y2: yy });
    }
    rows.forEach((row, i) => {
      const cy = topY - i * rowH - rowH / 2;
      if (i === 0) {
        const th = slidingTextHeight(row[0], w, Math.min(28, rowH * 0.55), 12);
        entities.push({ type: 'text', layer, color, x: x + w / 2, y: cy, value: row[0], height: th, width: Math.max(1, w - 16), align: 'center', rotation: 0 });
      } else {
        const leftH = slidingTextHeight(row[0], leftW, Math.min(24, rowH * 0.48), 10);
        const rightH = slidingTextHeight(row[1], rightW, Math.min(24, rowH * 0.48), 10);
        entities.push({ type: 'text', layer, color, x: x + 8, y: cy, value: row[0], height: leftH, width: Math.max(1, leftW - 16), align: 'left', rotation: 0 });
        entities.push({ type: 'text', layer, color, x: x + w - 8, y: cy, value: row[1], height: rightH, width: Math.max(1, rightW - 16), align: 'right', rotation: 0 });
      }
    });
  }

  function buildSlidingBlockDefinition(placement) {
    const layer = 'Ürün Yerleşimi - Sürme';
    const color = 4;
    const width = Math.max(1, Number(placement.width) || 1);
    const height = Math.max(1, Number(placement.height) || 1);
    const frameFace = 50;
    const thresholdH = String(placement.type || 'WITH THRESHOLD').toUpperCase() === 'WITH THRESHOLD' ? 42 : 15;
    const innerX = frameFace;
    const innerY = frameFace + thresholdH;
    const innerW = Math.max(1, width - frameFace * 2);
    const innerH = Math.max(1, height - frameFace * 2 - thresholdH);
    const panelCount = Math.max(2, Math.round(Number(placement.panelCount) || 2));
    const openingType = String(placement.openingType || 'SIDE OPENING').toUpperCase() === 'CENTER OPENING' ? 'CENTER OPENING' : 'SIDE OPENING';
    const selectedDirection = openingType === 'CENTER OPENING'
      ? (String(placement.openingDirection || 'OUTSIDE').toUpperCase() === 'INSIDE' ? 'INSIDE' : 'OUTSIDE')
      : (String(placement.openingDirection || 'RIGHT').toUpperCase() === 'LEFT' ? 'LEFT' : 'RIGHT');
    const slidingView = String(placement.slidingView || 'OUTSIDE VIEW').toUpperCase() === 'INSIDE VIEW' ? 'INSIDE VIEW' : 'OUTSIDE VIEW';
    const direction = openingType === 'SIDE OPENING' && slidingView === 'INSIDE VIEW'
      ? (selectedDirection === 'LEFT' ? 'RIGHT' : 'LEFT')
      : selectedDirection;
    const collected = String(placement.collectionState || 'NORMAL').toUpperCase() === 'COLLECTED';
    const entities = [
      { type: 'polyline', layer, color, closed: true, points: [[0, 0], [width, 0], [width, height], [0, height]] },
      { type: 'polyline', layer, color, closed: true, points: [[frameFace, frameFace], [width - frameFace, frameFace], [width - frameFace, height - frameFace], [frameFace, height - frameFace]] },
      { type: 'polyline', layer: 'PROFILE', color: 1, closed: true, semanticRole: 'product-threshold', points: [[innerX, frameFace], [innerX + innerW, frameFace], [innerX + innerW, frameFace + thresholdH], [innerX, frameFace + thresholdH]] }
    ];
    const panels = [];
    if (collected) {
      const panelW = Math.max(80, Math.min(innerW, (innerW + 50 * (panelCount - 1)) / panelCount));
      const reveal = panelCount > 1 ? Math.min(30, Math.max(12, (innerW - panelW) / (panelCount - 1))) : 0;
      if (openingType === 'CENTER OPENING') {
        const half = panelCount / 2;
        for (let i = 0; i < half; i += 1) panels.push({ x1: innerX + i * reveal, x2: innerX + i * reveal + panelW, y1: innerY, y2: innerY + innerH });
        for (let i = 0; i < half; i += 1) panels.push({ x1: innerX + innerW - panelW - (half - 1 - i) * reveal, x2: innerX + innerW - (half - 1 - i) * reveal, y1: innerY, y2: innerY + innerH });
      } else {
        const stackLeft = direction === 'LEFT';
        for (let i = 0; i < panelCount; i += 1) {
          const x1 = stackLeft ? innerX + i * reveal : innerX + innerW - panelW - (panelCount - 1 - i) * reveal;
          panels.push({ x1, x2: x1 + panelW, y1: innerY, y2: innerY + innerH });
        }
      }
      panels.forEach(panel => entities.push({ type: 'polyline', layer, color, closed: true, semanticRole: 'product-panel', points: [[panel.x1,panel.y1],[panel.x2,panel.y1],[panel.x2,panel.y2],[panel.x1,panel.y2]] }));
      entities.push({ type: 'text', layer, x: width / 2, y: height / 2, height: Math.max(22, Math.min(54, height * .035)), value: 'TOPLANMIŞ', align: 'center', rotation: 0, semanticRole: 'product-state-label' });
    } else {
      const mullionW = 50;
      const clearW = Math.max(1, (innerW - (panelCount - 1) * mullionW) / panelCount);
      let cursor = innerX;
      for (let i = 0; i < panelCount; i += 1) {
        const x1 = cursor;
        const x2 = x1 + clearW;
        panels.push({ x1, x2, y1: innerY, y2: innerY + innerH });
        cursor = x2;
        if (i < panelCount - 1) {
          entities.push({ type: 'polyline', layer, color, closed: true, semanticRole: 'product-mullion', points: [[cursor, innerY], [cursor + mullionW, innerY], [cursor + mullionW, innerY + innerH], [cursor, innerY + innerH]] });
          cursor += mullionW;
        }
      }
      const arrowY = innerY + innerH / 2;
      if (openingType === 'CENTER OPENING') {
        const leftIndex = Math.max(0, panelCount / 2 - 1);
        const rightIndex = Math.min(panelCount - 1, panelCount / 2);
        entities.push(slidingArrowEntity(panels[leftIndex], 'LEFT', arrowY, 4));
        entities.push(slidingArrowEntity(panels[rightIndex], 'RIGHT', arrowY, 4));
      } else if (direction === 'LEFT') {
        entities.push(slidingArrowEntity(panels[0], 'LEFT', arrowY, 4));
        entities.push(slidingArrowEntity(panels[panelCount - 1], 'RIGHT', arrowY, 8));
      } else {
        entities.push(slidingArrowEntity(panels[panelCount - 1], 'RIGHT', arrowY, 4));
        entities.push(slidingArrowEntity(panels[0], 'LEFT', arrowY, 8));
      }
      const occupied = new Set();
      if (openingType === 'CENTER OPENING') { occupied.add(panelCount / 2 - 1); occupied.add(panelCount / 2); }
      else { occupied.add(0); occupied.add(panelCount - 1); }
      const showInternalTable = placement.showInternalTable === true || SLIDING_INTERNAL_TABLE_ENABLED;
      const tableChoice = showInternalTable ? chooseSlidingTablePanel(panels, occupied) : null;
      if (showInternalTable && tableChoice) addSlidingTableEntities(entities, panels[tableChoice.index], placement);
    }
    const glassLabel = String(placement.glassColor || 'TRANSPARENT').toUpperCase() === 'OTHER' && String(placement.customGlassColor || '').trim()
      ? String(placement.customGlassColor).trim()
      : String(placement.glassColor || 'TRANSPARENT').toUpperCase();
    const detail = `${placement.series || 'A SERIES'} · ${placement.glassThickness || '10 MM'} · ${glassLabel} · ${slidingView} · ${selectedDirection}`;
    entities.push({ type: 'text', layer, x: width / 2, y: Math.max(18, frameFace * .45), height: Math.max(16, Math.min(32, width / 90)), value: detail, align: 'center', rotation: 0, semanticRole: 'product-detail-label' });
    return { dxfName: slidingBlockName(placement), entities, bounds: { minX: 0, minY: 0, maxX: width, maxY: height } };
  }

  function slidingBlocksFor(d) {
    const blocks = {};
    [...(d.slidingPlacements || []), ...(d.sideSlidingPlacements || [])].forEach(placement => {
      const name = slidingBlockName(placement);
      blocks[name] = buildSlidingBlockDefinition(placement);
    });
    return blocks;
  }

  function drawSlidingPlacements(g, d, postXs, rectStartY, onDikmeH) {
    if (!Array.isArray(d.slidingPlacements) || !d.slidingPlacements.length || postXs.length < 2) return;
    const postBottomY = rectStartY - K.onPostTopDrop - onDikmeH;
    d.slidingPlacements.forEach(placement => {
      const gapIndex = Math.max(0, Math.min(postXs.length - 2, Number(placement.gapIndex) || 0));
      const leftCenter = postXs[gapIndex];
      const rightCenter = postXs[gapIndex + 1];
      const bounds = frontGapBounds(d, postXs, gapIndex);
      const clearGap = Math.max(1, bounds.width);
      const width = Math.max(1, Number(placement.width) || clearGap - 5);
      const parapetH = frontParapetHeightAt(d, (bounds.left + bounds.right) / 2);
      const height = Math.max(1, Number(placement.height) || (d.frontHeight - parapetH - 5));
      const baseX = bounds.left;
      const baseY = rectStartY - d.frontHeight + parapetH - K.onPostTopDrop;
      const name = slidingBlockName(placement);
      g.insert(name, baseX, baseY, { layer: 'Ürün Yerleşimi - Sürme', previewW: width, previewH: height });
      g.entities.push({ type: 'interaction', kind: 'productEditor', x: baseX, y: baseY, w: width, h: height, data: { placementId: placement.id, productType: 'sliding_glass', placementView: 'front', gapIndex, pozNo: placement.pozNo } });
      const dimScale = 0.32;
      addDimH(g, baseX, baseX + width, baseY, baseY + 90, String(Math.round(width)), {
        layer: 'Ölçüler - Detay',
        scale: dimScale,
        color: 1,
        textColor: 1,
        entityColor: 1,
        dimensionFilterType: 'detail'
      });
      addDimV(g, baseY, baseY + height, baseX + width, baseX + width - 85, String(Math.round(height)), {
        layer: 'Ölçüler - Detay',
        scale: dimScale,
        color: 1,
        textColor: 1,
        entityColor: 1,
        dimensionFilterType: 'detail'
      });
    });
  }


  function mirroredGuillotinePlacement(placement) {
    const source = placement || {};
    return {
      ...source,
      renderVariant: 'MIRROR',
      motorDirection: String(source.motorDirection || 'RIGHT').toUpperCase() === 'LEFT' ? 'RIGHT' : 'LEFT',
      view: String(source.view || 'INSIDE VIEW').toUpperCase() === 'OUTSIDE VIEW' ? 'INSIDE VIEW' : 'OUTSIDE VIEW'
    };
  }

  function rightMasterGuillotinePlacement(placement) {
    const source = placement || {};
    // Sağ görünüş, yerel yan görünüş geometrisinin X aynası olarak ekrana gelir.
    // Motorun kullanıcı formunda seçilen tarafta görünmesi için kaynak blokta
    // yalnız motor konumu ters hazırlanır. INSIDE/OUTSIDE metni sağ ana görünüşte
    // kullanıcının seçtiği değer olarak kalır.
    return {
      ...source,
      renderVariant: 'RIGHT_MASTER',
      motorDirection: String(source.motorDirection || 'RIGHT').toUpperCase() === 'LEFT' ? 'RIGHT' : 'LEFT'
    };
  }

  function guillotineBlockName(placement) {
    const poz = String((placement && placement.pozNo) || 'G01').toUpperCase().replace(/[^A-Z0-9_-]+/g, '_');
    const variantKey = String(placement && placement.renderVariant || '').toUpperCase();
    const variant = variantKey === 'MIRROR' ? '_MIRROR' : (variantKey === 'RIGHT_MASTER' ? '_RIGHT_MASTER' : '');
    return `GUILLOTINE_POZ_${poz}${variant}`;
  }

  function guillotineArrowEntity(panel, direction, x) {
    const y1 = panel.y1 + 30;
    const y2 = panel.y2 - 30;
    const headWidth = Math.min(400, Math.max(120, (panel.x2 - panel.x1) * 0.35));
    const halfW = headWidth / 2;
    const headH = Math.min(Math.abs(y2 - y1) * 0.22, 170);
    const points = direction === 'UP'
      ? [[x, y1], [x, y2], [x - halfW, y2 - headH], [x, y2], [x + halfW, y2 - headH]]
      : [[x, y2], [x, y1], [x - halfW, y1 + headH], [x, y1], [x + halfW, y1 + headH]];
    return { type: 'polyline', layer: 'Ürün Yerleşimi - Giyotin', closed: false, points };
  }

  function guillotineMotorTextHeight(width, viewText) {
    let h = Math.min(62, Math.max(24, width / 58));
    const motorW = () => 5 * h * 0.58;
    const viewW = () => Math.max(1, String(viewText || '').length) * h * 0.58;
    while (h > 18 && width / 2 - viewW() / 2 - motorW() < 100) h -= 1;
    return h;
  }

  function buildGuillotineBlockDefinition(placement) {
    const layer = 'Ürün Yerleşimi - Giyotin';
    const width = Math.max(151, Number(placement.width) || 151);
    const height = Math.max(251, Number(placement.height) || 251);
    const innerX = 50;
    const innerY = 50;
    const innerW = Math.max(1, width - 100);
    const innerH = Math.max(1, height - 200);
    const panelMatch = String(placement.panelCount || '1+1').match(/^1\+(\d+)$/);
    const panelTotal = Math.max(2, 1 + Number(panelMatch && panelMatch[1] || 1));
    const separatorH = 50;
    const clearPanelH = Math.max(1, (innerH - (panelTotal - 1) * separatorH) / panelTotal);
    const type = String(placement.type || 'CLEANABLE').toUpperCase();
    const collected = String(placement.collectionState || 'NORMAL').toUpperCase() === 'COLLECTED' && ['UPWARD COLLECTING','DOWNWARD COLLECTING'].includes(type);
    const entities = [
      { type: 'polyline', layer, closed: true, points: [[0, 0], [width, 0], [width, height], [0, height]] },
      { type: 'polyline', layer, closed: true, points: [[innerX, innerY], [innerX + innerW, innerY], [innerX + innerW, innerY + innerH], [innerX, innerY + innerH]] }
    ];
    const panels = [];
    if (collected) {
      const reveal = Math.max(22, Math.min(48, clearPanelH * .18));
      for (let i = 0; i < panelTotal; i += 1) {
        const y1 = type === 'UPWARD COLLECTING'
          ? innerY + innerH - clearPanelH - i * reveal
          : innerY + i * reveal;
        const panel = { x1: innerX, x2: innerX + innerW, y1, y2: y1 + clearPanelH };
        panels.push(panel);
        entities.push({ type:'polyline', layer, closed:true, semanticRole:'product-panel', points:[[panel.x1,panel.y1],[panel.x2,panel.y1],[panel.x2,panel.y2],[panel.x1,panel.y2]] });
      }
      entities.push({ type:'text', layer, x:width/2, y:innerY+innerH/2, height:Math.max(22,Math.min(54,height*.035)), value:'TOPLANMIŞ', align:'center', rotation:0, semanticRole:'product-state-label' });
    } else {
      let cursorY = innerY;
      for (let i = 0; i < panelTotal; i += 1) {
        const y1 = cursorY;
        const y2 = y1 + clearPanelH;
        panels.push({ x1: innerX, x2: innerX + innerW, y1, y2 });
        cursorY = y2;
        if (i < panelTotal - 1) {
          entities.push({ type: 'polyline', layer, closed: true, semanticRole:'product-mullion', points: [[innerX, cursorY], [innerX + innerW, cursorY], [innerX + innerW, cursorY + separatorH], [innerX, cursorY + separatorH]] });
          cursorY += separatorH;
        }
      }
    }
    if (type === 'UPWARD COLLECTING') {
      panels.slice(0, -1).forEach(panel => entities.push(guillotineArrowEntity(panel, 'UP', innerX + innerW / 2)));
    } else if (type === 'DOWNWARD COLLECTING') {
      panels.slice(1).forEach(panel => entities.push(guillotineArrowEntity(panel, 'DOWN', innerX + innerW / 2)));
    } else {
      panels.slice(1).forEach(panel => entities.push(guillotineArrowEntity(panel, 'DOWN', innerX + innerW / 2)));
      const vasistasOpen = String(placement.bottomPanelMode || 'VASISTAS').toUpperCase() === 'VASISTAS'
        && String(placement.bottomPanelState || 'OPEN').toUpperCase() === 'OPEN'
        && String(placement.bottomPanelHinge || 'BOTTOM').toUpperCase() === 'BOTTOM';
      if (vasistasOpen && panels[0]) {
        const bottom = panels[0];
        const topY = bottom.y2 - 10;
        const mid = [innerX + innerW / 2, bottom.y1 + Math.max(12, Math.min(80, clearPanelH * .12))];
        entities.push({ type: 'polyline', layer, closed: false, semanticRole:'product-symbol', points: [[innerX + 10, topY], mid, [innerX + innerW - 10, topY]] });
        entities.push({ type:'text', layer, x:innerX+Math.min(innerW*.18,180), y:bottom.y1+Math.min(clearPanelH*.22,90), height:Math.max(16,Math.min(30,width/100)), value:'VASİSTAS', align:'center', rotation:0, semanticRole:'product-state-label' });
      }
    }
    const rawViewText = String(placement.view || 'RIGHT').toUpperCase();
    const viewText = rawViewText === 'RIGHT' ? 'SAĞ' : rawViewText === 'LEFT' ? 'SOL' : rawViewText;
    const textH = guillotineMotorTextHeight(width, viewText);
    const bandY = height - 75;
    const motorRight = String(placement.motorDirection || 'RIGHT').toUpperCase() !== 'LEFT';
    const textMargin = Math.max(120, Math.min(width / 3, width * 0.12));
    entities.push({ type: 'text', layer, x: motorRight ? width - textMargin : textMargin, y: bandY, height: textH, value: 'MOTOR', align: motorRight ? 'right' : 'left', rotation: 0, semanticRole:'product-motor-label' });
    entities.push({ type: 'text', layer, x: width / 2, y: bandY, height: textH, value: viewText, align: 'center', rotation: 0, semanticRole:'product-detail-label' });
    const glassLabel = String(placement.glassColor || 'TRANSPARENT').toUpperCase() === 'OTHER' && String(placement.customGlassColor || '').trim()
      ? String(placement.customGlassColor).trim()
      : String(placement.glassColor || 'TRANSPARENT').toUpperCase();
    entities.push({ type:'text', layer, x:width/2, y:Math.max(18,innerY*.45), height:Math.max(15,Math.min(28,width/105)), value:`${placement.series || 'A SERIES'} · ${placement.mechanism || 'CHAIN'} · ${placement.glassThickness || '8 MM'} · ${glassLabel}`, align:'center', rotation:0, semanticRole:'product-detail-label' });
    return { dxfName: guillotineBlockName(placement), entities, bounds: { minX: 0, minY: 0, maxX: width, maxY: height } };
  }

  function guillotineBlocksFor(d) {
    const blocks = {};
    [...(d.guillotinePlacements || []), ...(d.sideGuillotinePlacements || [])].forEach(placement => {
      const name = guillotineBlockName(placement);
      blocks[name] = buildGuillotineBlockDefinition(placement);
      const sideKey = normalizeSideViewKey(placement && placement.sideViewKey, Number(placement && placement.sideIndex) || 0);
      if (sideKey === 'right') {
        const mirrored = mirroredGuillotinePlacement(placement);
        const rightMaster = rightMasterGuillotinePlacement(placement);
        blocks[guillotineBlockName(mirrored)] = buildGuillotineBlockDefinition(mirrored);
        blocks[guillotineBlockName(rightMaster)] = buildGuillotineBlockDefinition(rightMaster);
      }
    });
    return blocks;
  }

  function drawGuillotinePlacements(g, d, postXs, rectStartY, onDikmeH) {
    if (!Array.isArray(d.guillotinePlacements) || !d.guillotinePlacements.length || postXs.length < 2) return;
    const postBottomY = rectStartY - K.onPostTopDrop - onDikmeH;
    d.guillotinePlacements.forEach(placement => {
      const gapIndex = Math.max(0, Math.min(postXs.length - 2, Number(placement.gapIndex) || 0));
      const leftCenter = postXs[gapIndex];
      const rightCenter = postXs[gapIndex + 1];
      const bounds = frontGapBounds(d, postXs, gapIndex);
      const clearGap = Math.max(1, bounds.width);
      const width = Math.max(1, Number(placement.width) || clearGap - 5);
      const parapetH = frontParapetHeightAt(d, (bounds.left + bounds.right) / 2);
      const height = Math.max(1, Number(placement.height) || (d.frontHeight - parapetH - 5));
      const baseX = bounds.left;
      const baseY = rectStartY - d.frontHeight + parapetH - K.onPostTopDrop;
      const name = guillotineBlockName(placement);
      g.insert(name, baseX, baseY, { layer: 'Ürün Yerleşimi - Giyotin', previewW: width, previewH: height });
      g.entities.push({ type: 'interaction', kind: 'productEditor', x: baseX, y: baseY, w: width, h: height, data: { placementId: placement.id, productType: 'guillotine_glass', placementView: 'front', gapIndex, pozNo: placement.pozNo } });
      const dimScale = 0.32;
      addDimH(g, baseX, baseX + width, baseY, baseY + 90, String(Math.round(width)), {
        layer: 'Ölçüler - Detay', scale: dimScale, color: 1, textColor: 1, entityColor: 1, dimensionFilterType: 'detail'
      });
      addDimV(g, baseY, baseY + height, baseX + width, baseX + width - 85, String(Math.round(height)), {
        layer: 'Ölçüler - Detay', scale: dimScale, color: 1, textColor: 1, entityColor: 1, dimensionFilterType: 'detail'
      });
    });
  }


  function zipScreenBoxHeight(type) {
    const key = String(type || '').toUpperCase();
    if (key.includes('130')) return 130;
    if (key.includes('115')) return 115;
    if (key.includes('110')) return 110;
    if (key === 'HERCULE') return 130;
    return 100;
  }

  function zipScreenBlockName(placement) {
    const poz = String((placement && placement.pozNo) || 'Z01').toUpperCase().replace(/[^A-Z0-9_-]+/g, '_');
    const variant = String(placement && placement.renderVariant || '').toUpperCase() === 'MIRROR' ? '_MIRROR' : '';
    return `ZIP_SCREEN_POZ_${poz}${variant}`;
  }

  function mirroredZipScreenPlacement(placement) {
    const source = placement || {};
    return {
      ...source,
      renderVariant: 'MIRROR',
      motorDirection: String(source.motorDirection || 'RIGHT').toUpperCase() === 'LEFT' ? 'RIGHT' : 'LEFT'
    };
  }

  function buildZipScreenBlockDefinition(placement) {
    const layer = 'Ürün Yerleşimi - Zipper';
    const width = Math.max(120, Number(placement.width) || 120);
    const height = Math.max(180, Number(placement.height) || 180);
    const boxH = Math.min(height - 55, zipScreenBoxHeight(placement.type));
    const guideW = Math.max(20, Math.min(42, width * 0.035));
    const bottomBarH = Math.max(32, Math.min(55, height * 0.035));
    const collected = String(placement.collectionState || 'NORMAL').toUpperCase() === 'COLLECTED';
    const fullFabricHeight = Math.max(1, height - boxH - bottomBarH);
    const visibleFabricHeight = collected ? Math.max(26, Math.min(fullFabricHeight, fullFabricHeight * .18)) : fullFabricHeight;
    const fabricBottom = Math.max(bottomBarH, height - boxH - visibleFabricHeight);
    const fabricTop = Math.max(fabricBottom + 1, height - boxH);
    const fabricLeft = guideW;
    const fabricRight = Math.max(fabricLeft + 1, width - guideW);
    const bottomBarY = collected ? Math.max(0, fabricBottom - bottomBarH) : 0;
    const entities = [
      { type: 'polyline', layer, closed: true, points: [[0, 0], [width, 0], [width, height], [0, height]] },
      { type: 'polyline', layer, closed: true, semanticRole:'product-zip-box', points: [[0, height - boxH], [width, height - boxH], [width, height], [0, height]] },
      { type: 'polyline', layer, closed: true, semanticRole:'product-zip-guide', points: [[0, 0], [guideW, 0], [guideW, height - boxH], [0, height - boxH]] },
      { type: 'polyline', layer, closed: true, semanticRole:'product-zip-guide', points: [[width - guideW, 0], [width, 0], [width, height - boxH], [width - guideW, height - boxH]] },
      { type: 'polyline', layer, closed: true, semanticRole:'product-bottom-bar', points: [[guideW, bottomBarY], [width - guideW, bottomBarY], [width - guideW, bottomBarY + bottomBarH], [guideW, bottomBarY + bottomBarH]] },
      { type: 'hatch', layer: 'HATCH_FABRIC', color: 42, semanticRole:'product-zip-fabric', fabricColor:String(placement.fabricColor||''), customFabricColor:String(placement.customFabricColor||''), points: [[fabricLeft, fabricBottom], [fabricRight, fabricBottom], [fabricRight, fabricTop], [fabricLeft, fabricTop]], patternKind: 'screen' }
    ];
    const motorRight = String(placement.motorDirection || 'RIGHT').toUpperCase() !== 'LEFT';
    const textH = Math.max(18, Math.min(42, boxH * 0.28));
    entities.push({ type: 'text', layer, x: motorRight ? width - 22 : 22, y: height - boxH / 2, height: textH, value: 'MOTOR', align: motorRight ? 'right' : 'left', rotation: 0, semanticRole:'product-motor-label' });
    const cableText = String(placement.cableExitDirection || 'REAR').toUpperCase();
    entities.push({ type: 'text', layer, x: width / 2, y: height - boxH / 2, height: Math.max(14, textH * 0.72), value: cableText, align: 'center', rotation: 0, semanticRole:'product-detail-label' });
    const fabricText = String(placement.fabricColor || '').toUpperCase() === 'OTHER' && String(placement.customFabricColor || '').trim() ? String(placement.customFabricColor).trim() : String(placement.fabricColor || '-');
    entities.push({ type:'text', layer, x:width/2, y:Math.max(18,Math.min(height-boxH-18,38)), height:Math.max(14,Math.min(28,width/110)), value:`${placement.series || 'G SERIES'} · ${placement.type || '100X100 BOX'} · ${placement.mountingLocation || 'BETWEEN POSTS'} · ${fabricText}`, align:'center', rotation:0, semanticRole:'product-detail-label' });
    if (collected) entities.push({ type:'text', layer, x:width/2, y:Math.max(40,fabricBottom-visibleFabricHeight*.25), height:Math.max(18,Math.min(38,height*.03)), value:'TOPLANMIŞ', align:'center', rotation:0, semanticRole:'product-state-label' });
    return { dxfName: zipScreenBlockName(placement), entities, bounds: { minX: 0, minY: 0, maxX: width, maxY: height } };
  }

  function zipScreenBlocksFor(d) {
    const blocks = {};
    [...(d.zipScreenPlacements || []), ...(d.sideZipScreenPlacements || [])].forEach(placement => {
      blocks[zipScreenBlockName(placement)] = buildZipScreenBlockDefinition(placement);
      const mirrored = mirroredZipScreenPlacement(placement);
      blocks[zipScreenBlockName(mirrored)] = buildZipScreenBlockDefinition(mirrored);
    });
    return blocks;
  }

  function frontZipScreenMetrics(d, postXs, placement, rectStartY) {
    const gapIndex = Math.max(0, Math.min(postXs.length - 2, Number(placement.gapIndex) || 0));
    const gap = frontGapBounds(d, postXs, gapIndex);
    const outside = String(placement.mountingLocation || 'BETWEEN POSTS').toUpperCase() === 'OUTSIDE POSTS';
    const leftPost = frontPostBoundsAt(d, postXs, gapIndex);
    const rightPost = frontPostBoundsAt(d, postXs, gapIndex + 1);
    const parapetH = frontParapetHeightAt(d, (gap.left + gap.right) / 2);
    const autoWidth = outside ? Math.max(1, rightPost.right - leftPost.left - 5) : Math.max(1, gap.width - 3);
    const baseX = outside ? leftPost.left + 2.5 : gap.left + 1.5;
    const baseY = rectStartY - d.frontHeight + parapetH - K.onPostTopDrop + (outside ? 0 : 1.5);
    const clearHeight = Math.max(1, d.frontHeight - parapetH);
    const autoHeight = outside ? Math.max(1, clearHeight + zipScreenBoxHeight(placement.type)) : Math.max(1, clearHeight - 3);
    return {
      gapIndex,
      baseX,
      baseY,
      width: Math.max(1, Number(placement.width) || autoWidth),
      height: Math.max(1, Number(placement.height) || autoHeight),
      autoWidth,
      autoHeight
    };
  }

  function drawZipScreenPlacements(g, d, postXs, rectStartY) {
    if (!Array.isArray(d.zipScreenPlacements) || !d.zipScreenPlacements.length || postXs.length < 2) return;
    d.zipScreenPlacements.forEach(placement => {
      const metrics = frontZipScreenMetrics(d, postXs, placement, rectStartY);
      const { baseX, baseY, width, height, gapIndex } = metrics;
      g.insert(zipScreenBlockName(placement), baseX, baseY, { layer: 'Ürün Yerleşimi - Zipper', previewW: width, previewH: height });
      g.entities.push({ type: 'interaction', kind: 'productEditor', x: baseX, y: baseY, w: width, h: height, data: { placementId: placement.id, productType: 'zip_screen', placementView: 'front', gapIndex, pozNo: placement.pozNo } });
      addDimH(g, baseX, baseX + width, baseY, baseY + 90, String(Math.round(width)), { layer: 'Ölçüler - Detay', scale: 0.32, color: 1, textColor: 1, entityColor: 1, dimensionFilterType: 'detail' });
      addDimV(g, baseY, baseY + height, baseX + width, baseX + width - 85, String(Math.round(height)), { layer: 'Ölçüler - Detay', scale: 0.32, color: 1, textColor: 1, entityColor: 1, dimensionFilterType: 'detail' });
    });
  }

  function drawFrontView(g, d) {
    const postXs = Array.isArray(d.postCenterXs) ? d.postCenterXs : postCenterXs(d);
    const rectStartY = d.independentMode && Number.isFinite(Number(d.independentFrontRectStartY)) ? Number(d.independentFrontRectStartY) : d.commonFrontRectStartY;
    const frontBaseY = rectStartY - d.frontHeight;
    if (d.independentMode) {
      (d.independentPergoRiseGroups || []).forEach(group => {
        const frontGutterBounds = gutterBounds(d, group);
        const systems = group.systems || [];
        const yValues = systems.map(sys => frontRectStartYForPosition(d, sys.index));
        const sameY = yValues.every(value => Math.abs(value - yValues[0]) < 0.001);
        const addFrontGutter = (bounds, y, system, localIndex) => {
          const ent = g.rect(bounds.start, y, bounds.width, K.frontGutterH, 'PROFILE');
          ent.independentGroupId = group.groupId;
          ent.positionIndex = system ? Number(system.index) : Number(group.positionStartIndex || 0);
          ent.positionId = system && system.positionId ? system.positionId : '';
          ent.profileRole = 'front-gutter';
          ent.frontDatumY = y;
          ent.frontGutterSegmentIndex = localIndex;
        };
        if (!systems.length || sameY) addFrontGutter(frontGutterBounds, yValues[0] ?? rectStartY, systems[0] || null, 0);
        else systems.forEach((sys, localIndex) => {
          const start = localIndex === 0 ? frontGutterBounds.start : Number(sys.outerStartX) - 6.5;
          const end = localIndex === systems.length - 1 ? frontGutterBounds.end : Number(sys.outerEndX) + 6.5;
          addFrontGutter({ ...frontGutterBounds, start, end, width: end - start }, yValues[localIndex], sys, localIndex);
        });
      });
    } else {
      const frontGutterBounds = gutterBounds(d);
      g.rect(frontGutterBounds.start, rectStartY, frontGutterBounds.width, K.frontGutterH, 'PROFILE');
    }

    const frontSegments = yes(d.parapet) && d.parapetSegments && Array.isArray(d.parapetSegments.front)
      ? d.parapetSegments.front : [];
    frontSegments.forEach((segment, segmentIndex) => {
      const x = K.systemStartX + Number(segment.start || 0);
      const width = Math.max(0, Number(segment.end || 0) - Number(segment.start || 0));
      const startHeight = Math.max(0, Number.isFinite(Number(segment.startHeight)) ? Number(segment.startHeight) : Number(segment.height) || 0);
      const endHeight = Math.max(0, Number.isFinite(Number(segment.endHeight)) ? Number(segment.endHeight) : Number(segment.height) || 0);
      const height = Math.max(startHeight, endHeight);
      if (!(width > 0 && height > 0)) return;
      const segmentStartIndex = d.independentMode ? frontPositionIndexAtX(d, x) : 0;
      const segmentEndIndex = d.independentMode ? frontPositionIndexAtX(d, x + width) : 0;
      const segmentStartTopY = d.independentMode ? frontRectStartYForPosition(d, segmentStartIndex) : rectStartY;
      const segmentEndTopY = d.independentMode ? frontRectStartYForPosition(d, segmentEndIndex) : rectStartY;
      const segmentFrontBaseY = d.independentMode ? segmentStartTopY - frontHeightAtX(d, x) : frontBaseY;
      const segmentEndFrontBaseY = d.independentMode ? segmentEndTopY - frontHeightAtX(d, x + width) : frontBaseY;
      const points = [[x, segmentFrontBaseY], [x + width, segmentEndFrontBaseY], [x + width, segmentEndFrontBaseY + endHeight], [x, segmentFrontBaseY + startHeight]];
      g.poly(points, true, 'WALL');
      if (Math.abs(startHeight - endHeight) < 0.001) safeHatchBlock(g, 'PULUMUR WALL BRICK SAFE HATCH', x, segmentFrontBaseY + height, width, -height, 'HATCH_WALL');
      else g.entities.push({ type: 'hatch', layer: 'HATCH_WALL', points, patternKind: 'brick' });
      g.entities.push({ type: 'interaction', kind: 'parapetEditor', x, y: segmentFrontBaseY, w: width, h: height, data: {
        parapetView: 'front', parapetSegmentId: segment.id, parapetSegmentIndex: segmentIndex,
        segmentStart: segment.start, segmentEnd: segment.end, segmentHeight: height, segmentStartHeight: startHeight, segmentEndHeight: endHeight
      }});
      addDimH(g, x, x + width, segmentFrontBaseY, frontBaseY + 50, formatMm(width), {
        scale: 0.58,
        layer: 'Ölçüler - Ön Görünüş',
        edit: {
          dimId: `front_parapet_width_${segment.id}`,
          ruleKey: 'parapet_width',
          field: '__parapet_width__',
          index: segmentIndex,
          label: `Parapet ${segmentIndex + 1} Genişlik`,
          view: 'Front',
          relatedZoneId: `front_parapet_zone_${segment.id}`,
          parapetView: 'front', parapetSegmentId: segment.id, parapetSegmentIndex: segmentIndex,
          segmentStart: segment.start, segmentEnd: segment.end, sideIndex: 0,
          editable: true, canResize: true, actionType: 'parapet_width_resize', dimensionType: 'detail'
        }
      });
    });

    d.systems.forEach(sys => {
      const p = d.positions[sys.index] || d.positions[0];
      const rayTopY = onRayTopYForPosition(d, sys.index);
      const positionFrontHeight = d.independentMode ? Number(p.frontHeight) : d.frontHeight;
      const rayH = Math.max(1, p.rearHeight - positionFrontHeight - K.onRayHCorrection);
      const onRayY = rayTopY - rayH;
      sys.rays.forEach(x => {
        g.rect(x, rayTopY, K.rayW, -rayH, 'Ray - Ön Görünüş');
        blockRef(g, 'PergoRise Ray Kafası Ön Görünüş', x + 40, onRayY, 110, 70);
      });
    });

    postXs.forEach((x, idx) => {
      const postProfile = frontPostProfileAt(d, idx);
      const postBounds = frontPostBoundsAt(d, postXs, idx);
      const renderX = postBounds.center;
      const parapetH = frontParapetHeightAt(d, x);
      const extension = frontPostExtensionAt(d, idx);
      const positionIndex = d.independentMode ? frontPositionIndexAtX(d, x) : 0;
      const postTopY = d.independentMode ? frontRectStartYForPosition(d, positionIndex) : rectStartY;
      const postFrontBaseY = postTopY - frontHeightAtX(d, x);
      const parapetTopY = postFrontBaseY + parapetH;
      let hitBottomY;
      if (!postProfile.custom) {
        blockRef(g, 'PergoRise Dikme Oluk Bağlantı Karşı Görünüş', renderX, postTopY, 135, 85);
        const normalBodyBottom = parapetTopY + K.altBlockCorrection;
        const bodyTop = postTopY - K.onPostTopDrop;
        const bodyBottom = normalBodyBottom - extension;
        g.rect(postBounds.left, bodyTop, postBounds.width, -(bodyTop - bodyBottom), 'POST');
        blockRef(g, 'PergoRise Dikme Alt Bağlantı Karşı Görünüş', renderX, parapetTopY + K.altBlockCorrection - extension, 125, 70);
        hitBottomY = bodyBottom - 24;
      } else {
        const bodyBottom = parapetTopY - extension;
        drawHollowRect(g, postBounds.left, postTopY, postBounds.width, -(postTopY - bodyBottom), 'POST', postProfile.et);
        hitBottomY = bodyBottom - 24;
      }
      const hitTopY = postTopY + 24;
      const hitW = Math.max(124, postProfile.en + 24);
      g.entities.push({ type: 'interaction', kind: 'postEditor', x: renderX - hitW / 2, y: hitBottomY, w: hitW, h: hitTopY - hitBottomY, data: {
        postIndex: idx, postCount: d.postCount, totalRayCount: d.totalRayCount, postX: renderX,
        placementMode: d.manualPostPlacementMode || 'standard', profileMode: postProfile.mode,
        en: postProfile.en, boy: postProfile.boy, et: postProfile.et, postExtension: extension
      }});
    });

    drawSlidingPlacements(g, d, postXs, rectStartY, Math.max(1, d.frontHeight - K.onPostHeightCorrection - d.parapetHeight));
    drawGuillotinePlacements(g, d, postXs, rectStartY, Math.max(1, d.frontHeight - K.onPostHeightCorrection - d.parapetHeight));
    drawZipScreenPlacements(g, d, postXs, rectStartY);
    addDimH(g, K.systemStartX, K.systemStartX + d.nominalWidth, frontBaseY - 80, frontBaseY - 350, `GENİŞLİK ${formatMm(d.nominalWidth)}`, { layer: 'Ölçüler - Ön Görünüş', edit: { dimId: 'front_total_width', ruleKey: 'info_only', field: '__info__', index: 0, editable: false, canResize: false, passiveReason: 'front-total-information-only', label: 'Ön Genişlik', view: 'Front', relatedZoneId: 'front_total_width_zone' } });

    if (!frontSegments.length) {
      if (d.independentMode) (d.systems || []).forEach((system, index) => {
        const position = d.positions[index] || d.positions[0];
        const positionTopY = frontRectStartYForPosition(d, index);
        const baseY = positionTopY - Number(position.frontHeight || d.frontHeight);
        const dimX = Number(system.outerStartX) - 160 - (Number(system.groupPositionIndex || 0) * 45);
        addDimV(g, positionTopY, baseY, Number(system.outerStartX), dimX, `ÖN ${formatMm(position.frontHeight)}`, { layer: 'Ölçüler - Ön Görünüş', positionIndex: index,
          edit: { dimId: `front_height_pos_${index + 1}`, ruleKey: 'front_front_height', field: 'frontHeight', index, label: 'Ön H', view: 'Front', relatedZoneId: `front_height_zone_${index + 1}` } });
      });
      else addDimV(g, rectStartY, frontBaseY, K.systemStartX - 100, K.systemStartX - 360, `ÖN ${formatMm(d.frontHeight)}`, { layer: 'Ölçüler - Ön Görünüş', edit: { dimId: 'front_height', ruleKey: 'front_front_height', field: 'frontHeight', index: 0, label: 'Ön H', view: 'Front', relatedZoneId: 'front_height_zone' } });
    } else {
      // Düz parçalarda önceki merkez zinciri korunur. Eğimli parçalarda ise
      // gerçek başlangıç/bitiş kotları ölçülür; ortak PP sınırı tek istasyon
      // olduğundan komşu parçaların kesişim ölçüsü üst üste binmez.
      parapetDimensionStations(frontSegments).forEach(station => {
        const segment = station.segment;
        const segmentIndex = station.segmentIndex;
        const height = Math.max(0, Number(station.height) || 0);
        const refX = K.systemStartX + station.coordinate;
        const stationPositionIndex = d.independentMode ? frontPositionIndexAtX(d, refX) : 0;
        const stationTopDatumY = d.independentMode ? frontRectStartYForPosition(d, stationPositionIndex) : rectStartY;
        const stationBaseY = stationTopDatumY - frontHeightAtX(d, refX);
        const topY = stationBaseY + height;
        const dimX = K.systemStartX + station.dimensionCoordinate;
        const positionIndex = frontPositionIndexAtX(d, refX);
        const stationSuffix = station.kind === 'center' ? '' : `_${station.kind}`;
        if (height > 0.001) addDimV(g, stationBaseY, topY, refX, dimX, formatMm(height), {
          scale: 0.72,
          layer: 'Ölçüler - Ön Görünüş',
          positionIndex,
          edit: {
            dimId: `front_parapet_height_${segment.id}${stationSuffix}`,
            ruleKey: 'parapet_height_info', field: '__parapet__', index: segmentIndex,
            label: 'Parapet H', view: 'Front', relatedZoneId: `front_parapet_zone_${segment.id}`,
            parapetView: 'front', parapetSegmentId: segment.id, parapetSegmentIndex: segmentIndex,
            editable: false, dimensionType: 'detail'
          }
        });
        if (rectStartY - topY > 0.001) addDimV(g, topY, rectStartY, refX, dimX, formatMm(rectStartY - topY), {
          scale: 0.72,
          layer: 'Ölçüler - Ön Görünüş',
          positionIndex,
          edit: {
            dimId: `front_post_height_${segment.id}${stationSuffix}`,
            ruleKey: 'info_only', field: '__info__', index: segmentIndex,
            label: 'Oluk - Parapet Arası', view: 'Front', relatedZoneId: `front_post_height_zone_${segment.id}`,
            parapetView: 'front', parapetSegmentId: segment.id, parapetSegmentIndex: segmentIndex,
            editable: false, dimensionType: 'detail',
            passiveReason: 'Oluk altı ile ilgili parapet parçasının üst kotu arasındaki bilgi ölçüsüdür.'
          }
        });
      });
    }

    if (postXs.length > 1) {
      const drawGapList = (centers, offsetIndex = 0) => {
        for (let local = 0; local < centers.length - 1; local += 1) {
          const left = centers[local], right = centers[local + 1];
          const globalIndex = offsetIndex + local;
          const gb = { left: left + frontPostProfileAt(d, globalIndex).en / 2, right: right - frontPostProfileAt(d, globalIndex + 1).en / 2 };
          gb.width = Math.max(0, gb.right - gb.left);
          const midY = rectStartY - Math.max(1, frontHeightAtX(d, (left + right) / 2) - d.parapetHeight) / 2;
          addDimH(g, gb.left, gb.right, midY, midY, formatMm(gb.width), { layer: 'Ölçüler - Ön Görünüş', edit: { dimId: `front_post_gap_${globalIndex + 1}`, ruleKey: 'front_post_gap', field: '__zone__', index: globalIndex, label: `Dikme ${globalIndex + 1} - Dikme ${globalIndex + 2} Arası`, view: 'Front', relatedZoneId: `front_gap_post_${globalIndex + 1}_post_${globalIndex + 2}` } });
          { const zoneId = `front_gap_post_${globalIndex + 1}_post_${globalIndex + 2}`;
            const midX = (gb.left + gb.right) / 2;
            const parapetH = frontParapetHeightAt(d, midX);
            const clearTop = rectStartY - K.onPostTopDrop;
            const clearBottom = rectStartY - frontHeightAtX(d, midX) + parapetH - K.onPostTopDrop;
            drawHorizontalProfilesInZone(g, d, { view:'front', zoneId, left:gb.left, right:gb.right, bottom:clearBottom, top:clearTop, sideIndex:0, sideGapIndex:globalIndex });
          }
        }
      };
      if (d.independentMode) {
        let offset = 0;
        (d.independentPergoRiseGroups || []).forEach(group => { const centers = group.postCenterXs || []; drawGapList(centers, offset); offset += centers.length; });
      } else drawGapList(postXs, 0);
    }
  }

  function triangleDogramaTopY(baseX, baseY, AD, slope, topOff, x) {
    return baseY + AD - slope * (x - baseX) - topOff;
  }

  function triangleDogramaAraDikmeSay(AB) {
    // Kullanıcı kuralı: üçgen doğramada her 2500 mm tamamlandıktan sonra
    // bir ek ara dikme oluşur. Eşik değerinin kendisi önceki aralıkta kalır.
    return Math.max(0, Math.floor((AB - 0.000001) / 2500));
  }

  function triangleDogramaKapaliCiz(g, pA, pB, pC, pD, layer = 'TRIANGLE') {
    const ent = g.poly([pA, pB, pC, pD], true, layer);
    // V8.4.3: Önizleme ve DXF aynı üçgen doğrama rengini kullanır.
    ent.color = 130;
    ent.trueColor = 0x00BF00;
    return ent;
  }

  function triangleDogramaUrunCiz(g, baseX, baseY, AB, BC, AD, slope, off = 41.7, memberW = 41.7, divisionCount = null) {
    const topOff = off * Math.sqrt(1 + slope * slope);
    const pA = [baseX, baseY];
    const pB = [baseX + AB, baseY];
    const pC = [baseX + AB, baseY + BC];
    const pD = [baseX, baseY + AD];
    triangleDogramaKapaliCiz(g, pA, pB, pC, pD);

    if (AB > 2.5 * off) {
      const inA = [baseX + off, baseY + off];
      const inB = [baseX + AB - off, baseY + off];
      const inC = [baseX + AB - off, triangleDogramaTopY(baseX, baseY, AD, slope, topOff, baseX + AB - off)];
      const inD = [baseX + off, triangleDogramaTopY(baseX, baseY, AD, slope, topOff, baseX + off)];
      triangleDogramaKapaliCiz(g, inA, inB, inC, inD);

      const innerW = AB - 2 * off;
      const explicitDivisions = Number(divisionCount);
      const n = Number.isFinite(explicitDivisions)
        ? Math.max(0, Math.round(explicitDivisions) - 1)
        : triangleDogramaAraDikmeSay(AB);
      if (n > 0) {
        let clear = (innerW - n * memberW) / (n + 1);
        if (clear < 1) clear = 1;
        for (let k = 1; k <= n; k += 1) {
          const xL = baseX + off + clear * k + memberW * (k - 1);
          const xR = xL + memberW;
          const yBot = baseY + off;
          const yTopL = triangleDogramaTopY(baseX, baseY, AD, slope, topOff, xL);
          const yTopR = triangleDogramaTopY(baseX, baseY, AD, slope, topOff, xR);
          triangleDogramaKapaliCiz(g, [xL, yBot], [xR, yBot], [xR, yTopR], [xL, yTopL]);
        }
      }
    }
  }

  function triangleDogramaDisOlcuCiz(g, baseX, baseY, AB, BC, AD) {
    const dimOff = 300;
    addDimH(g, baseX, baseX + AB, baseY, baseY - dimOff, formatMm(AB), { layer: 'Ölçüler - Yan Görünüş', edit: { dimId: 'triangle_ab_info', ruleKey: 'triangle_info', field: '__info__', index: 0, label: 'Üçgen AB', view: 'Side', editable: false } });
    addDimV(g, baseY, baseY + BC, baseX + AB, baseX + AB + dimOff, formatMm(BC), { layer: 'Ölçüler - Yan Görünüş', edit: { dimId: 'triangle_bc_info', ruleKey: 'triangle_info', field: '__info__', index: 0, label: 'Üçgen BC', view: 'Side', editable: false } });
    addDimV(g, baseY, baseY + AD, baseX, baseX - dimOff, formatMm(AD), { layer: 'Ölçüler - Yan Görünüş', edit: { dimId: 'triangle_ad_info', ruleKey: 'triangle_info', field: '__info__', index: 0, label: 'Üçgen AD', view: 'Side', editable: false } });
    addDimAligned(g, baseX, baseY + AD, baseX + AB, baseY + BC, baseX + AB / 2, baseY + AD + dimOff, formatMm(Math.sqrt(AB * AB + Math.pow(AD - BC, 2))), { layer: 'Ölçüler - Yan Görünüş', edit: { dimId: 'triangle_slope_info', ruleKey: 'triangle_info', field: '__info__', index: 0, label: 'Üçgen Eğim', view: 'Side', editable: false } });
  }

  function sideZoneBounds(geom, placement) {
    if (!geom || !geom.exists || !Array.isArray(geom.gaps)) return null;
    const legacy = placement && placement.sideZone === 'support_post' ? 1 : 0;
    const idx = Math.max(0, Number(placement && placement.sideGapIndex) || legacy);
    const gap = geom.gaps[idx];
    return gap ? { left: gap.left, right: gap.right, index: idx } : null;
  }

  function markNoMirror(entity) { if (entity) entity.noMirror = true; return entity; }

  function sideGlassTrackBottomY(d, sideTopY, sideViewKey = '0', positionIndex = 0) {
    if (!sideFeatureEnabled(d, 'glassTrack', sideViewKey, positionIndex)) return Number(sideTopY || 0);
    const profile = d && d.glassTrackProfile ? d.glassTrackProfile : normalizeGlassTrackProfile();
    // v8.9.28: Cam kaydı aktifken yan görünüş net üst sınırı, profilin
    // -Y dış kenarıdır. Profil En değeri değiştiğinde bu kot ve ona bağlı
    // bütün bilgi ölçüleri doğrudan yeniden hesaplanır.
    return Number(sideTopY || 0) - 3 - Math.max(5, Number(profile.en) || 100);
  }

  function sideProductPlacementMetrics(d, p, geom, zone, baseY, placement) {
    const midX = (Number(zone.left) + Number(zone.right)) / 2;
    const sideViewKey = sideViewKeyForPosition(p);
    const parapetH = sideParapetHeightAt(d, p.index, midX, Number(geom.wallX) || 0, sideViewKey);
    const localBaseY = baseY + parapetH;
    // v8.9.28: Yan ürünün otomatik yerleşim zarfı, yerel parapet üst kotu ile
    // cam kayıt profilinin -Y dış kenarı arasındadır. Böylece yan kayıt profilinin
    // En değeri değiştiğinde otomatik ürün yüksekliği de aynı referansa uyar.
    const clearTopY = sideGlassTrackBottomY(d, Number(baseY || 0) + Number(d.frontHeight || 0), sideViewKey, p.index);
    const rawAvailableHeight = Math.max(1, clearTopY - localBaseY);
    const rawClearWidth = Math.max(1, Number(zone.right) - Number(zone.left));
    const availableWidth = Math.max(1, rawClearWidth - 5);
    const availableHeight = Math.max(1, rawAvailableHeight - 5);
    return {
      // v8.9.29: Kayıtlı manuel ürün ölçüsü çizimde aynen korunur. Ölçüsü olmayan
      // eski kayıtlar ve otomatik yerleşim ise her iki yönde 5 mm montaj payı kullanır.
      width: Math.max(1, Number(placement.width) || availableWidth),
      height: Math.max(1, Number(placement.height) || availableHeight),
      baseY: localBaseY,
      clearTopY,
      availableWidth,
      availableHeight
    };
  }

  function sidePlacementMatchesView(item, p) {
    const key = sideViewKeyForPosition(p);
    return normalizeSideViewKey(item && item.sideViewKey, Number(item && item.sideIndex) || 0) === key;
  }

  function drawSideSlidingPlacements(g, d, p, geom, baseY) {
    if (!geom || !geom.exists) return;
    const sideViewKey = sideViewKeyForPosition(p);
    (d.sideSlidingPlacements || []).filter(item => sidePlacementMatchesView(item, p)).forEach(placement => {
      const zone = sideZoneBounds(geom, placement);
      if (!zone) return;
      const metrics = sideProductPlacementMetrics(d, p, geom, zone, baseY, placement);
      const { width, height } = metrics;
      const localBaseY = metrics.baseY;
      g.insert(slidingBlockName(placement), zone.left, localBaseY, { layer: 'Ürün Yerleşimi - Sürme', previewW: width, previewH: height });
      g.entities.push({ type: 'interaction', kind: 'productEditor', x: zone.left, y: localBaseY, w: width, h: height, data: { placementId: placement.id, productType: 'sliding_glass', placementView: sideViewKey === 'right' ? 'side-right' : 'side-left', sideIndex: p.index, sideViewKey, sideGapIndex: Number(placement.sideGapIndex) || 0, sideZone: placement.sideZone || `gap_${Number(placement.sideGapIndex) || 0}`, pozNo: placement.pozNo } });
      addDimH(g, zone.left, zone.left + width, localBaseY, localBaseY + 90, String(Math.round(width)), { layer: 'Ölçüler - Detay', scale: 0.32, color: 1, textColor: 1, entityColor: 1, dimensionFilterType: 'detail', positionIndex: p.index });
      addDimV(g, localBaseY, localBaseY + height, zone.left + width, zone.left + width - 85, String(Math.round(height)), { layer: 'Ölçüler - Detay', scale: 0.32, color: 1, textColor: 1, entityColor: 1, dimensionFilterType: 'detail', positionIndex: p.index });
    });
  }

  function drawSideGuillotinePlacements(g, d, p, geom, baseY) {
    if (!geom || !geom.exists) return;
    const sideViewKey = sideViewKeyForPosition(p);
    (d.sideGuillotinePlacements || []).filter(item => sidePlacementMatchesView(item, p)).forEach(placement => {
      const zone = sideZoneBounds(geom, placement);
      if (!zone) return;
      const metrics = sideProductPlacementMetrics(d, p, geom, zone, baseY, placement);
      const { width, height } = metrics;
      const localBaseY = metrics.baseY;
      const renderPlacement = p && p.semanticMirror
        ? mirroredGuillotinePlacement(placement)
        : (p && p.rightMasterDisplay ? rightMasterGuillotinePlacement(placement) : placement);
      g.insert(guillotineBlockName(renderPlacement), zone.left, localBaseY, { layer: 'Ürün Yerleşimi - Giyotin', previewW: width, previewH: height });
      g.entities.push({ type: 'interaction', kind: 'productEditor', x: zone.left, y: localBaseY, w: width, h: height, data: { placementId: placement.id, productType: 'guillotine_glass', placementView: sideViewKey === 'right' ? 'side-right' : 'side-left', sideIndex: p.index, sideViewKey, sideGapIndex: Number(placement.sideGapIndex) || 0, sideZone: placement.sideZone || `gap_${Number(placement.sideGapIndex) || 0}`, pozNo: placement.pozNo } });
      addDimH(g, zone.left, zone.left + width, localBaseY, localBaseY + 90, String(Math.round(width)), { layer: 'Ölçüler - Detay', scale: 0.32, color: 1, textColor: 1, entityColor: 1, dimensionFilterType: 'detail', positionIndex: p.index });
      addDimV(g, localBaseY, localBaseY + height, zone.left + width, zone.left + width - 85, String(Math.round(height)), { layer: 'Ölçüler - Detay', scale: 0.32, color: 1, textColor: 1, entityColor: 1, dimensionFilterType: 'detail', positionIndex: p.index });
    });
  }


  function sideZipScreenMetrics(d, p, geom, zone, baseY, placement) {
    const basic = sideProductPlacementMetrics(d, p, geom, zone, baseY, placement);
    const outside = String(placement.mountingLocation || 'BETWEEN POSTS').toUpperCase() === 'OUTSIDE POSTS';
    const rawWidth = Math.max(1, Number(zone.right) - Number(zone.left));
    const rawHeight = Math.max(1, Number(basic.availableHeight) + 5);
    const gap = Array.isArray(geom.gaps) ? geom.gaps[Number(zone.index) || 0] : null;
    const postWidth = id => {
      const post = Array.isArray(geom.posts) ? geom.posts.find(item => String(item.id || '') === String(id || '')) : null;
      return post ? Math.max(1, Number(post.width || (post.profile && post.profile.en)) || 100) : 0;
    };
    const leftAdd = outside && gap && gap.leftPostId ? postWidth(gap.leftPostId) : 0;
    const rightAdd = outside && gap && gap.rightPostId ? postWidth(gap.rightPostId) : (outside && Math.abs(Number(zone.right) - Number(geom.frontPostRearFace)) < 0.01 ? K.postSize : 0);
    const autoWidth = outside ? Math.max(1, rawWidth + leftAdd + rightAdd - 5) : Math.max(1, rawWidth - 3);
    const autoHeight = outside ? Math.max(1, rawHeight + zipScreenBoxHeight(placement.type)) : Math.max(1, rawHeight - 3);
    return {
      baseX: outside ? Number(zone.left) - leftAdd + 2.5 : Number(zone.left) + 1.5,
      baseY: Number(basic.baseY) + (outside ? 0 : 1.5),
      width: Math.max(1, Number(placement.width) || autoWidth),
      height: Math.max(1, Number(placement.height) || autoHeight),
      autoWidth,
      autoHeight
    };
  }

  function drawSideZipScreenPlacements(g, d, p, geom, baseY) {
    if (!geom || !geom.exists) return;
    const sideViewKey = sideViewKeyForPosition(p);
    (d.sideZipScreenPlacements || []).filter(item => sidePlacementMatchesView(item, p)).forEach(placement => {
      const zone = sideZoneBounds(geom, placement);
      if (!zone) return;
      const metrics = sideZipScreenMetrics(d, p, geom, zone, baseY, placement);
      const renderPlacement = p && p.semanticMirror ? mirroredZipScreenPlacement(placement) : placement;
      g.insert(zipScreenBlockName(renderPlacement), metrics.baseX, metrics.baseY, { layer: 'Ürün Yerleşimi - Zipper', previewW: metrics.width, previewH: metrics.height });
      g.entities.push({ type: 'interaction', kind: 'productEditor', x: metrics.baseX, y: metrics.baseY, w: metrics.width, h: metrics.height, data: { placementId: placement.id, productType: 'zip_screen', placementView: sideViewKey === 'right' ? 'side-right' : 'side-left', sideIndex: p.index, sideViewKey, sideGapIndex: Number(placement.sideGapIndex) || 0, sideZone: placement.sideZone || `gap_${Number(placement.sideGapIndex) || 0}`, pozNo: placement.pozNo } });
      addDimH(g, metrics.baseX, metrics.baseX + metrics.width, metrics.baseY, metrics.baseY + 90, String(Math.round(metrics.width)), { layer: 'Ölçüler - Detay', scale: 0.32, color: 1, textColor: 1, entityColor: 1, dimensionFilterType: 'detail', positionIndex: p.index });
      addDimV(g, metrics.baseY, metrics.baseY + metrics.height, metrics.baseX + metrics.width, metrics.baseX + metrics.width - 85, String(Math.round(metrics.height)), { layer: 'Ölçüler - Detay', scale: 0.32, color: 1, textColor: 1, entityColor: 1, dimensionFilterType: 'detail', positionIndex: p.index });
    });
  }

  function drawSideWaterOutletPipe(g, d, p, sideViewKey, yanX, yanUstY) {
    if (yes(d.waterStandard)) return;
    const placement = String(d.waterOutletPlacement || 'BOTH').toUpperCase();
    // YAN modu üst görünüşte oluğun sol/sağ uçlarını gösterir; bu borular yan görünüş düzleminde görünmez.
    if (placement === 'SIDES') return;
    const state = normalizeWaterOutletPipeState(d.waterOutletPipeState);
    const pipeW = state.diameter;
    const pipeL = state.length;
    const groupId = String((p && p.independentGroupId) || 'IPR-01');
    const positionId = String((p && p.positionId) || `position_${Number(p && p.index || 0) + 1}`);
    const side = String((p && p.independentSide) || (sideViewKey === 'right' ? 'right' : 'left'));
    const id = `${groupId}_${positionId}_${side}_side_view`;
    if (state.deleted[id] === true) return;
    const offset = Number(state.offsets[id]) || 0;
    const basX = yanX - 35.5 + offset;
    const basY = yanUstY + 13.9;
    g.rect(basX, basY, pipeL, pipeW, 'WATER');
    const cleanMm = value => String(Number(Number(value).toFixed(3)));
    const pipeText = g.text(basX + pipeL + 10, basY + pipeW / 2, `Ø${cleanMm(pipeW)} Pipe ${cleanMm(pipeL)} mm`, 60, 'WATER', 'left');
    if (pipeText) {
      pipeText.keepReadableOnMirror = true;
      pipeText.flipAlignOnMirror = true;
    }
    g.entities.push({ type: 'interaction', kind: 'waterPipeEditor', x: basX, y: basY, w: pipeL, h: pipeW, data: {
      waterPipeId: id, waterPipeOrientation: 'side-view', waterPipeDiameter: pipeW, waterPipeLength: pipeL, waterPipeXOffset: offset,
      independentGroupId: groupId, groupId, positionId,
      viewId: `${positionId}:${side.toUpperCase()}_SIDE`, viewType: 'SIDE', side,
      boundMinX: basX, boundMaxX: basX + pipeL, boundMinY: basY, boundMaxY: basY + pipeW
    }});
  }

  function drawOneSideView(g, d, p, stackShiftY) {
    const viewEntityStart = g.entities.length;
    const globalSideShiftY = Number(d.sideGlobalShiftY) || 0;
    const positionFrontHeight = d.independentMode && Number.isFinite(Number(p.frontHeight)) ? Number(p.frontHeight) : d.frontHeight;
    const rectStartY = -(p.opening + (p.rearHeight - positionFrontHeight) + K.frontViewExtraDrop) + globalSideShiftY + stackShiftY;
    const yanPostUstY = rectStartY - K.onPostTopDrop;
    const yanUstY = rectStartY;
    const yanX = K.sideBaseX;
    const sideViewKey = sideViewKeyForPosition(p);
    const wallSettings = sideBackWallSettings(d, sideViewKey, p.rearHeight);
    const duvarX = sideBackWallAnchorX(d, p, sideViewKey);
    const duvarY = rectStartY - positionFrontHeight;
    const isMiddlePosition = p.index > 0 && p.index < d.sidePositionCount - 1;
    const middleEnabled = !isMiddlePosition || sideViewEnabled(d, sideViewKey, p.index);
    const postXs = Array.isArray(d.postCenterXs) ? d.postCenterXs : postCenterXs(d);
    const physicalStartX = d.systems && d.systems[p.index] ? Number(d.systems[p.index].startX) : Number(postXs[0]);
    const frontPostIndex = sideViewKey === 'right'
      ? Math.max(0, postXs.length - 1)
      : postXs.reduce((best, x, index) => Math.abs(Number(x) - physicalStartX) < Math.abs(Number(postXs[best]) - physicalStartX) ? index : best, 0);
    const sideFrontProfile = frontPostProfileAt(d, frontPostIndex);
    const sideFrontWidth = Math.max(1, Number(sideFrontProfile.boy) || K.postSize);
    const sideFrontExtension = frontPostExtensionAt(d, frontPostIndex);
    // Sol kaynak görünüşte +X uç sabittir; sağ görünüş bu geometrinin semantik aynasıdır
    // ve aynalama sonrasında -X uç sabit kalır.
    const sideFrontLeftX = yanX - sideFrontWidth;
    const sideFrontCenterX = yanX - sideFrontWidth / 2;
    const sideFrontParapetH = sideParapetHeightAt(d, p.index, sideFrontCenterX, duvarX, sideViewKey);
    const yanAltY = duvarY + sideFrontParapetH + K.altBlockCorrection - sideFrontExtension;
    const dikH = Math.max(1, yanPostUstY - yanAltY);
    const bagX = duvarX;
    const bagY = duvarY + p.rearHeight;
    const arkaMekX = bagX + K.sideArkaMekOffsetX;
    const arkaMekY = bagY + K.sideArkaMekOffsetY;
    const startRayX = bagX + K.sideRayStartOffsetX;
    const startRayY = bagY - K.sideRayStartOffsetY;
    const rayLen = p.rayLength;
    const aci = p.angleRad;
    let sideSupports = [];
    let camBottomY = null;
    const sideSupportGeometry = sideViewKey === 'right' ? d.rightSideSupportGeometry : (d.sideSupportGeometry && d.sideSupportGeometry[sideViewKey]);
    if (d.postCount > 0) {
      if (sideFrontProfile.custom) {
        drawHollowRect(g, sideFrontLeftX, yanPostUstY, sideFrontWidth, -dikH, 'Dikme - Yan Görünüş', sideFrontProfile.et);
      } else {
        g.rect(sideFrontLeftX, yanPostUstY, sideFrontWidth, -dikH, 'Dikme - Yan Görünüş');
        blockRef(g, 'PergoRise Dikme Oluk Bağlantı Yan Görünüş', yanX, yanPostUstY, 130, 80, 'Blok - Yan Görünüş', 270);
        blockRef(g, 'PergoRise Dikme Alt Bağlantı Yan Görünüş', sideFrontCenterX, yanAltY, 120, 70, 'Blok - Yan Görünüş');
      }
      g.entities.push({ type: 'interaction', kind: 'frontPostProfileEditor', x: sideFrontLeftX, y: yanAltY, w: sideFrontWidth, h: Math.max(1, yanPostUstY - yanAltY), data: { postIndex: frontPostIndex, sideIndex: p.index, sideViewKey, profileMode: sideFrontProfile.mode, en: sideFrontProfile.en, boy: sideFrontProfile.boy, et: sideFrontProfile.et, postExtension: sideFrontExtension } });
    }
    blockRef(g, 'PergoRise Oluk Yan Görünüş Birleştirilmiş', yanX, yanUstY, 220, 135, 'Blok - Yan Görünüş');
    if (isMiddlePosition) {
      // Ara poz düzenleme anahtarı her zaman görünür. Buton, arka duvarın +Y
      // tarafına ve gerçek duvar kalınlığı kadar genişliğe yerleştirilir.
      // Interaction elemanı preview-only olduğundan DXF/PDF çıktısına girmez.
      const buttonW = Math.max(260, wallSettings.depth);
      const buttonH = 190;
      const buttonX = duvarX - wallSettings.depth;
      const buttonY = bagY + 80;
      g.entities.push({ type: 'interaction', kind: 'sideViewEnable', x: buttonX, y: buttonY, w: buttonW, h: buttonH, data: { sideIndex: p.index, sideViewKey, sideEnabled: middleEnabled } });
    }
    if (sideFeatureEnabled(d, 'glassTrack', sideViewKey, p.index)) {
      const profile = d.glassTrackProfile || normalizeGlassTrackProfile();
      const sideH = profile.en;
      const supportScope = sideViewScopeForKey(sideViewKey);
      const supportProfile = supportProfileFor(d, supportScope);
      const supportSideH = supportProfile.en;
      const camBaseX = yanX - 100, camBaseY = yanUstY - 3, camW = Math.max(1, p.opening - 100 + sideTrackLengthOffset(d, sideViewKey));
      camBottomY = camBaseY - sideH;
      // V8.2.79: Yan görünüş cam kaydı profilinde iç ofset çizilmez.
      // Profilin +Y üst referansı sabit, -Y alt ucu seçilen En değerine göre çalışır.
      g.rect(camBaseX, camBaseY, -camW, -sideH, 'GLASS');
      addGlassTrackInteraction(g, camBaseX - camW, camBaseY - sideH, camW, sideH, profile, 'track', sideViewKey, { sideIndex: p.index, sideViewKey, trackLengthOffset: sideTrackLengthOffset(d, sideViewKey) });
      const supportPosts = sideSupportGeometry && Array.isArray(sideSupportGeometry.posts) ? sideSupportGeometry.posts : [];
      supportPosts.forEach((supportPost, supportIndex) => {
        const supportProfile = supportPost.profile || supportProfileFor(d, supportScope);
        const supportSideH = supportProfile.en;
        const destekX = supportPost.left;
        const destekY = camBaseY - sideH;
        // v8.9.26: Destek dikmesinin +Y üst ucu cam kaydında sabit kalır.
        // Alt uç varsayılan olarak dikme merkezinin bulunduğu yerel parapet parçasına oturur.
        // Pozitif manuel ofset -Y yönüne uzatır; negatif ofset alttan kısaltır.
        const localParapetH = yes(d.parapet) ? sideParapetHeightAt(d, p.index, supportPost.centerX, duvarX, sideViewKey) : 0;
        const automaticBottomY = duvarY + localParapetH;
        const requestedExtension = Number.isFinite(Number(supportPost.extension)) ? Number(supportPost.extension) : 0;
        const requestedBottomY = automaticBottomY - requestedExtension;
        const destekBottomY = Math.min(destekY - 1, requestedBottomY);
        const destekH = Math.max(1, destekY - destekBottomY);
        g.rect(destekX, destekY, supportSideH, -destekH, 'GLASS');
        addGlassTrackInteraction(g, destekX, destekBottomY, supportSideH, destekH, supportProfile, 'support', supportScope, { sidePostId: supportPost.id, sideIndex: p.index, sideViewKey, supportIndex, postExtension: requestedExtension });
        sideSupports.push({ ...supportPost, left: destekX, right: destekX + supportSideH, topY: destekY, bottomY: destekBottomY, automaticBottomY, localParapetH });
      });
    }
    const sideSegments = yes(d.parapet) && d.parapetSegments && d.parapetSegments.side
      ? (d.parapetSegments.side[sideViewKey] || []) : [];
    sideSegments.forEach((segment, segmentIndex) => {
      const x = duvarX + Number(segment.start || 0);
      const width = Math.max(0, Number(segment.end || 0) - Number(segment.start || 0));
      const startHeight = Math.max(0, Number.isFinite(Number(segment.startHeight)) ? Number(segment.startHeight) : Number(segment.height) || 0);
      const endHeight = Math.max(0, Number.isFinite(Number(segment.endHeight)) ? Number(segment.endHeight) : Number(segment.height) || 0);
      const height = Math.max(startHeight, endHeight);
      if (!(width > 0 && height > 0)) return;
      const points = [[x, duvarY], [x + width, duvarY], [x + width, duvarY + endHeight], [x, duvarY + startHeight]];
      g.poly(points, true, 'Duvar - Yan Görünüş');
      if (Math.abs(startHeight - endHeight) < 0.001) safeHatchBlock(g, 'PULUMUR WALL BRICK SAFE HATCH', x, duvarY + height, width, -height, 'HATCH_WALL');
      else g.entities.push({ type: 'hatch', layer: 'HATCH_WALL', points, patternKind: 'brick' });
      const interaction = { type: 'interaction', kind: 'parapetEditor', x, y: duvarY, w: width, h: height, data: {
        parapetView: 'side', sideIndex: p.index, sideViewKey, parapetSegmentId: segment.id, parapetSegmentIndex: segmentIndex,
        segmentStart: segment.start, segmentEnd: segment.end, segmentHeight: height, segmentStartHeight: startHeight, segmentEndHeight: endHeight
      }};
      g.entities.push(interaction);
      const sideParapetWidthDim = addDimH(g, x, x + width, duvarY, duvarY + 50, formatMm(width), {
        scale: 0.52,
        layer: 'Ölçüler - Yan Görünüş',
        edit: {
          dimId: `side_parapet_width_${p.index}_${segment.id}`,
          ruleKey: 'parapet_width',
          field: '__parapet_width__', index: segmentIndex,
          label: `Parapet ${segmentIndex + 1} Genişlik`,
          view: sideViewKey === 'right' ? 'Right' : 'Side',
          relatedZoneId: `side_parapet_zone_${sideViewKey}_${p.index}_${segment.id}`,
          parapetView: 'side', sideIndex: p.index, sideViewKey, parapetSegmentId: segment.id, parapetSegmentIndex: segmentIndex,
          segmentStart: segment.start, segmentEnd: segment.end,
          editable: true, canResize: true,
          actionType: 'parapet_width_resize', dimensionType: 'detail',
          passiveReason: ''
        }
      });
      void sideParapetWidthDim;
    });
    const wallGrid = backWallCellsFor(d, sideViewKey, p.rearHeight);
    const steelSideGeometry = d.rearSupport && d.rearSupport.type === 'steel'
      ? { wallMaxLocalY: Math.max(0, p.rearHeight - d.rearSupport.beamProfile.elevationHeight) }
      : null;
    const pushWallInteraction = (cell, wallCellIndex) => {
      if (wallSettings.enabled === false || cell.enabled === false) return;
      const minX = Number(cell.minX) || 0;
      const maxX = Number(cell.maxX) || 0;
      const minY = Number(cell.minY) || 0;
      const requestedMaxY = Number(cell.maxY) || 0;
      const maxY = steelSideGeometry ? Math.min(requestedMaxY, steelSideGeometry.wallMaxLocalY) : requestedMaxY;
      const wallW = maxX - minX;
      const wallH = maxY - minY;
      if (!(wallW > 0 && wallH > 0)) return;
      const wallRightX = duvarX - minX;
      const wallLeftX = duvarX - maxX;
      const wallBottomY = duvarY + minY;
      g.rect(wallRightX, wallBottomY, -wallW, wallH, 'Duvar - Yan Görünüş');
      safeHatchBlock(g, 'PULUMUR WALL BRICK SAFE HATCH', wallRightX, wallBottomY, -wallW, wallH, 'HATCH_WALL');
      g.entities.push({ type: 'interaction', kind: 'backWallEditor', x: wallLeftX, y: wallBottomY, w: wallW, h: wallH, data: {
        sideIndex: p.index, sideViewKey, wallEnabled: true, wallCellEnabled: true, wallXOffset: wallSettings.xOffset, wallDepth: wallSettings.depth, wallHeight: wallSettings.height,
        wallCellId: cell.id, wallCellIndex, wallCellCount: wallGrid.cells.length, cellMinX: minX, cellMaxX: maxX, cellMinY: minY, cellMaxY: maxY,
        wallMinX: wallGrid.bounds.minX, wallMaxX: wallGrid.bounds.maxX, wallMinY: wallGrid.bounds.minY, wallMaxY: wallGrid.bounds.maxY
      } });
    };
    if (wallSettings.enabled !== false) wallGrid.cells.forEach((cell, wallCellIndex) => pushWallInteraction(cell, wallCellIndex));
    drawSideRearSteelSupport(g, d, p, sideViewKey, duvarX, duvarY, bagY);
    blockRef(g, 'PergoRise Ray Duvar Bağlantı Set', bagX, bagY, 120, 95, 'Blok - Yan Görünüş'); blockRef(g, 'PergoRise Ray Arka Mekanizma Yan Görünüş', arkaMekX, arkaMekY, 135, 90, 'Blok - Yan Görünüş', normDeg(aci * 180 / Math.PI));
    if (p && p.positionId && p.independentSide) {
      const selectorSize = 220;
      const groupId = String(p.independentGroupId || 'IPR-01');
      const side = String(p.independentSide);
      const selectorCenterX = (Number(bagX) + Number(arkaMekX)) / 2;
      const selectorCenterY = (Number(bagY) + Number(arkaMekY)) / 2;
      g.entities.push({
        type: 'interaction', kind: 'sideViewSelector', layoutNeutral: true,
        x: selectorCenterX - selectorSize / 2,
        y: selectorCenterY - selectorSize / 2,
        w: selectorSize, h: selectorSize,
        data: {
          independentGroupId: groupId, groupId,
          positionId: p.positionId, positionIndex: p.index,
          viewId: `${p.positionId}:${side.toUpperCase()}_SIDE`,
          viewType: 'SIDE', side,
          actionType: 'SELECT_FULL_SIDE_VIEW', exportable: false
        }
      });
    }
    rotatedRect(g, startRayX, startRayY, rayLen, -K.sideRayH, arkaMekX, arkaMekY, aci, 'Ray - Yan Görünüş'); rotatedRect(g, startRayX, startRayY - K.sideInnerRayOffsetY, rayLen, -K.sideInnerRayH, arkaMekX, arkaMekY, aci, 'Ray - Yan Görünüş');
    const kafa = rotatePoint(startRayX + rayLen, startRayY, arkaMekX, arkaMekY, aci); const rotDeg = normDeg(aci * 180 / Math.PI); blockRef(g, 'PergoRise Ray Kafası Yan Görünüş', kafa[0], kafa[1], 130, 90, 'Blok - Yan Görünüş', rotDeg);
    // V8.2.1: Yan görünüşte çatı kayıt profili ve ray çekici araba setleri çizilmez.
    if (K.showDimensions !== false) {
      const anglePt = rotatePoint(startRayX + rayLen / 2, startRayY, arkaMekX, arkaMekY, aci);
      const angleText = g.text(anglePt[0], anglePt[1] + 140, `${formatDeg(Math.abs(aci) * 180 / Math.PI)}  POZ ${p.index + 1}`, 170, 'TEXT', 'center');
      angleText.keepReadableOnMirror = true;
      angleText.dimensionFilterType = 'main';
    }
    drawSideWaterOutletPipe(g, d, p, sideViewKey, yanX, yanUstY);
    p._triangleRange = null;
    if (sideFeatureEnabled(d, 'triangle', sideViewKey, p.index)) {
      const triStart = g.entities.length;
      const denom = Math.abs(p.opening - K.slopeOpeningCorrection) < 1e-9 ? 1 : (p.opening - K.slopeOpeningCorrection);
      const slope = Math.abs((p.rearHeight - positionFrontHeight - K.slopeHeightCorrection) / denom);
      const AB = Math.max(1, p.opening - 150);
      const BC = 165 + 150 * slope;
      const AD = BC + AB * slope;
      const off = 41.7;
      const memberW = 41.7;
      const aX = duvarX;
      const aY = yanUstY - 3;
      const copyX = duvarX;
      const copyY = bagY + 600;
      // PERI01: asil ürün yan kayıt/duvar referansından başlar; ikinci kopya duvardan +Y 600'e alınır.
      const divisions = triangleDivisionCount(d, sideViewKey, p.opening);
      triangleDogramaUrunCiz(g, aX, aY, AB, BC, AD, slope, off, memberW, divisions);
      if (!p.semanticMirror) {
        triangleDogramaUrunCiz(g, copyX, copyY, AB, BC, AD, slope, off, memberW, divisions);
        triangleDogramaDisOlcuCiz(g, copyX, copyY, AB, BC, AD);
      }
      g.entities.push({ type: 'interaction', kind: 'triangleEditor', x: aX, y: aY, w: AB, h: AD, data: { sideIndex: p.index, sideViewKey, triangleDivisionCount: divisions } });
      if (!p.semanticMirror) g.entities.push({ type: 'interaction', kind: 'triangleEditor', x: copyX, y: copyY, w: AB, h: AD, data: { sideIndex: p.index, sideViewKey, triangleDivisionCount: divisions } });
      p._triangleRange = { start: triStart, end: g.entities.length };
    }
    if (sideSupportGeometry && sideSupportGeometry.exists && camBottomY != null) {
      drawSideSlidingPlacements(g, d, p, sideSupportGeometry, duvarY);
      drawSideGuillotinePlacements(g, d, p, sideSupportGeometry, duvarY);
      drawSideZipScreenPlacements(g, d, p, sideSupportGeometry, duvarY);
    }
    const postMidY = yanAltY + dikH / 2;
    const frontPostRearFace = yanX - K.postSize;
    if (sideSupportGeometry && sideSupportGeometry.exists && Array.isArray(sideSupportGeometry.gaps)) {
      const leftEditable = sideViewEnabled(d, sideViewKey, p.index);
      sideSupportGeometry.gaps.forEach((gap, gapIndex) => {
        if (gap.width <= 0.5) return;
        const hasPosts = Array.isArray(sideSupportGeometry.posts) && sideSupportGeometry.posts.length > 0;
        let label = 'Duvar - Dikme Arası';
        if (hasPosts) {
          if (gapIndex === 0) label = 'Duvar - Destek Arası';
          else if (gapIndex === sideSupportGeometry.gaps.length - 1) label = 'Destek - Dikme Arası';
          else label = `Destek ${gapIndex} - Destek ${gapIndex + 1} Arası`;
        }
        addDimH(g, gap.left, gap.right, postMidY, postMidY, formatMm(gap.width), {
          scale: 0.72,
          layer: 'Ölçüler - Yan Görünüş',
          edit: {
            dimId: `side_gap_${sideViewKey}_${p.index}_${gapIndex}`,
            ruleKey: leftEditable ? (hasPosts ? 'side_support_gap' : 'side_wall_to_post_gap') : 'info_only',
            field: '__zone__', index: p.index, sideViewKey, sideGapIndex: gapIndex,
            label, view: sideViewKey === 'right' ? 'Right' : 'Side', relatedZoneId: `side_gap_zone_${sideViewKey}_${p.index}_${gapIndex}`,
            dimensionType: 'detail', editable: leftEditable,
            canResize: leftEditable && hasPosts,
            canAddSameProfile: leftEditable,
            canAddDifferentProfile: leftEditable,
            canPlaceProduct: leftEditable,
            passiveReason: leftEditable ? '' : 'Bu yan görünüş düzenleme için etkinleştirilmedi.'
          }
        });
        if (leftEditable) {
          const zoneId = `side_gap_zone_${sideViewKey}_${p.index}_${gapIndex}`;
          drawHorizontalProfilesInZone(g, d, { view:'side', sideViewKey, sideIndex:p.index, sideGapIndex:gapIndex, zoneId, left:gap.left, right:gap.right, bottom:duvarY, top:duvarY + Math.max(1, Number(sideSupportGeometry.productClearHeight) || 1) });
        }
      });
    }
    if (sideFeatureEnabled(d, 'glassTrack', sideViewKey, p.index)) {
      const profile = d.glassTrackProfile || normalizeGlassTrackProfile();
      camBottomY = camBottomY == null ? (yanUstY - 3 - profile.en) : camBottomY;
      // V8.2.74: Cam kaydı alt kot ölçüsü, yan görünüş dikmesinden duvara doğru 600 mm içeride gösterilir.
      // V8.2.77: Alt kot, seçilen profilin yan görünüş yüksekliğine göre otomatik değişir.
      const camTrackDimRefX = yanX;
      const camTrackDimLineX = yanX - 600;
      if (camBottomY - duvarY > 150) addDimV(g, duvarY, camBottomY, camTrackDimRefX, camTrackDimLineX, formatMm(camBottomY - duvarY), { scale: 0.72, layer: 'Ölçüler - Yan Görünüş', edit: { dimId: `side_glass_track_to_wall_${sideViewKey}_${p.index}`, ruleKey: 'info_only', field: '__info__', index: p.index, label: 'Cam Kaydı - Alt Kot', view: sideViewKey === 'right' ? 'Right' : 'Side', sideIndex: p.index, sideViewKey, relatedZoneId: `side_glass_track_zone_${sideViewKey}_${p.index}`, editable: false, dimensionType: 'detail', passiveReason: 'Cam kaydı ile duvar alt kotu arasındaki bilgi ölçüsüdür.' } });
    }
    if (sideSegments.length) {
      const intermediatePosition = d.sidePositionCount >= 3 && p.index > 0 && p.index < d.sidePositionCount - 1;
      // Parapet zincirinin üst referansı tüm yan görünüşlerde oluk altıdır.
      // Cam kaydı alt kotu ayrıca kendi bilgi ölçüsünde gösterildiği için burada
      // profil kalınlığı düşülmez.
      const clearTopY = yanUstY;
      parapetDimensionStations(sideSegments).forEach(station => {
        const segment = station.segment;
        const segmentIndex = station.segmentIndex;
        const height = Math.max(0, Number(station.height) || 0);
        const refXAtStation = duvarX + station.coordinate;
        const topY = duvarY + height;
        // Üç veya daha çok pozda, tek parçalı ara poz parapetinin zincir ölçüsü
        // ön dikmenin hemen solunda gösterilir. Çok parçalı parapetlerde segment
        // bazlı lokal dağılım korunur.
        const useFrontLocalPlacement = intermediatePosition && sideSegments.length === 1;
        const refX = useFrontLocalPlacement && station.kind === 'center' ? yanX - K.postSize / 2 : refXAtStation;
        const dimX = useFrontLocalPlacement && station.kind === 'center' ? yanX - K.postSize - 220 : duvarX + station.dimensionCoordinate;
        const stationSuffix = station.kind === 'center' ? '' : `_${station.kind}`;
        if (height > 0.001) addDimV(g, duvarY, topY, refX, dimX, formatMm(height), {
          scale: 0.66, layer: 'Ölçüler - Yan Görünüş', dimensionFilterType: 'detail', positionIndex: p.index,
          edit: {
            dimId: `side_parapet_height_${sideViewKey}_${p.index}_${segment.id}${stationSuffix}`,
            ruleKey: 'parapet_height_info', field: '__parapet__', index: segmentIndex,
            label: 'Parapet H', view: sideViewKey === 'right' ? 'Right' : 'Side',
            relatedZoneId: `side_parapet_zone_${sideViewKey}_${p.index}_${segment.id}`,
            parapetView: 'side', sideIndex: p.index, sideViewKey, parapetSegmentId: segment.id, parapetSegmentIndex: segmentIndex,
            editable: false, dimensionType: 'detail'
          }
        });
        if (clearTopY - topY > 0.5) addDimV(g, topY, clearTopY, refX, dimX, formatMm(clearTopY - topY), {
          scale: 0.66, layer: 'Ölçüler - Yan Görünüş', dimensionFilterType: 'detail', positionIndex: p.index,
          edit: {
            dimId: `side_gutter_to_parapet_${sideViewKey}_${p.index}_${segment.id}${stationSuffix}`,
            ruleKey: 'info_only', field: '__info__', index: segmentIndex,
            label: 'Oluk - Parapet Arası', view: sideViewKey === 'right' ? 'Right' : 'Side',
            relatedZoneId: `side_parapet_zone_${sideViewKey}_${p.index}_${segment.id}`,
            parapetView: 'side', sideIndex: p.index, sideViewKey, parapetSegmentId: segment.id, parapetSegmentIndex: segmentIndex,
            editable: false, dimensionType: 'detail',
            passiveReason: 'Oluk altı ile ilgili yan parapet parçasının üst kotu arasındaki bilgi ölçüsüdür.'
          }
        });
      });
    }
    addDimH(g, duvarX, yanX, duvarY, duvarY - 150, `AÇILIM ${formatMm(p.opening)}`, { layer: 'Ölçüler - Yan Görünüş', edit: { dimId: `side_opening_${sideViewKey}_pos_${p.index + 1}`, ruleKey: 'side_opening', field: 'opening', index: p.index, sideIndex: p.index, sideViewKey, label: 'Açılım', view: sideViewKey === 'right' ? 'Right' : 'Side', relatedZoneId: `side_opening_zone_${sideViewKey}_${p.index + 1}` } });
    addDimV(g, duvarY, duvarY + p.rearHeight, duvarX - K.sideWallDepth - 80, duvarX - K.sideWallDepth - 360, `ARKA ${formatMm(p.rearHeight)}`, { layer: 'Ölçüler - Yan Görünüş', edit: { dimId: `side_rear_height_${sideViewKey}_pos_${p.index + 1}`, ruleKey: 'side_rear_height', field: 'rearHeight', index: p.index, sideIndex: p.index, sideViewKey, label: 'Arka H', view: sideViewKey === 'right' ? 'Right' : 'Side', relatedZoneId: `side_rear_height_zone_${sideViewKey}_${p.index + 1}` } });
    // PERI01: yan görünüş ön yükseklik ölçüsü, parapet aktifken de toplam ön kotu verir.
    // Referans alt kotu duvar/parapet alt kotu, üst kotu oluk altı referansıdır.
    addDimV(g, duvarY, duvarY + positionFrontHeight, yanX, yanX + 350, `ÖN ${formatMm(positionFrontHeight)}`, { layer: 'Ölçüler - Yan Görünüş', edit: { dimId: `side_front_height_${sideViewKey}_pos_${p.index + 1}`, ruleKey: 'side_front_height', field: 'frontHeight', index: d.independentMode ? p.index : 0, sideIndex: p.index, sideViewKey, label: 'Ön H', view: sideViewKey === 'right' ? 'Right' : 'Side', relatedZoneId: `side_front_height_zone_${sideViewKey}_${p.index + 1}` } });

    // v8.9.32: Ara poz kırmızı durumdayken görünüş çizimde kalır fakat düzenlenemez.
    // Yalnız kalıcı Yan Görünüşü Düzenle anahtarı etkileşimli tutulur; diğer
    // interaction elemanları kaldırılır ve ölçüler bilgi amaçlı hale getirilir.
    if (isMiddlePosition && !middleEnabled) {
      const passiveReason = 'Bu ara poz yan görünüşü düzenleme için etkinleştirilmedi.';
      const passiveEntities = g.entities.slice(viewEntityStart).flatMap(entity => {
        if (!entity) return [];
        if (entity.type === 'interaction') {
          return ['sideViewEnable', 'sideViewSelector'].includes(entity.kind) ? [entity] : [];
        }
        if (entity.type === 'dimension' && entity.edit) {
          return [{
            ...entity,
            edit: {
              ...entity.edit,
              ruleKey: 'info_only',
              editable: false,
              canResize: false,
              canAddSameProfile: false,
              canAddDifferentProfile: false,
              canPlaceProduct: false,
              canRemoveElement: false,
              passiveReason
            }
          }];
        }
        return [entity];
      });
      g.entities.splice(viewEntityStart, g.entities.length - viewEntityStart);
      passiveEntities.forEach(entity => g.entities.push(entity));
    }
  }

  function triangleFrameAllowance(d, idx) {
    if (!yes(d.triangleJoinery)) return 0;
    const differentOpening = d.openingList.length > 1;
    if (differentOpening && idx !== 0 && idx !== d.sidePositionCount - 1) return 0;
    const p = d.positions[idx] || d.positions[0];
    if (!p) return 0;
    const denom = Math.abs(p.opening - K.slopeOpeningCorrection) < 1e-9 ? 1 : (p.opening - K.slopeOpeningCorrection);
    const slope = Math.abs((p.rearHeight - d.frontHeight - K.slopeHeightCorrection) / denom);
    const AB = Math.max(1, p.opening - 150);
    const BC = 165 + 150 * slope;
    const AD = BC + AB * slope;
    return 600 + AD + 300;
  }

  function sideViewTopLimitY(d) {
    // PERI01 kuralı: sol yan görünüşün +Y yönündeki en uç noktası ile üst tablo arasında
    // her zaman boşluk kalmalı. Üçgen doğrama varsa en üst referans üçgenin ölçü çizgisi,
    // yoksa arka duvarın +Y yönündeki en uç noktasıdır.
    let best = null;
    let shiftY = 0;
    const globalSideShiftY = Number(d.sideGlobalShiftY) || 0;
    for (let i = 0; i < d.sidePositionCount; i += 1) {
      const p = d.positions[i] || d.positions[0];
      const wallTopY = -p.opening - K.frontViewExtraDrop + globalSideShiftY + shiftY;
      let topY = wallTopY;
      const triangleVisible = yes(d.triangleJoinery) && (!d.farkliAcilim || i === 0);
      if (triangleVisible) {
        const denom = Math.abs(p.opening - K.slopeOpeningCorrection) < 1e-9 ? 1 : (p.opening - K.slopeOpeningCorrection);
        const slope = Math.abs((p.rearHeight - d.frontHeight - K.slopeHeightCorrection) / denom);
        const AB = Math.max(1, p.opening - 150);
        const BC = 165 + 150 * slope;
        const AD = BC + AB * slope;
        const triangleTopY = wallTopY + 600 + AD + 300; // ürün + üst ölçü payı
        topY = Math.max(topY, triangleTopY);
      }
      best = best == null ? topY : Math.max(best, topY);
      shiftY -= (p.opening + K.sideViewGapY);
    }
    return best == null ? null : best + 300; // tablo ile çizim arasında güvenli boşluk
  }

  function triangleTableLimitY(d) {
    if (!yes(d.triangleJoinery)) return null;
    const idxs = [];
    for (let i = 0; i < d.sidePositionCount; i += 1) if (!d.farkliAcilim || i === 0) idxs.push(i);
    if (!idxs.length) return null;
    let best = null;
    let shiftY = 0;
    const globalSideShiftY = Number(d.sideGlobalShiftY) || 0;
    for (let i = 0; i < d.sidePositionCount; i += 1) {
      const p = d.positions[i] || d.positions[0];
      if (idxs.includes(i)) {
        const rectStartY = -(p.opening + K.frontViewExtraDrop) - p.rearHeight + d.frontHeight + globalSideShiftY + shiftY;
        const bagY = rectStartY - 3;
        const baseY = bagY + 600;
        const denom = Math.abs(p.opening - K.slopeOpeningCorrection) < 1e-9 ? 1 : (p.opening - K.slopeOpeningCorrection);
        const slope = Math.abs((p.rearHeight - d.frontHeight - K.slopeHeightCorrection) / denom);
        const AB = Math.max(1, p.opening - 150);
        const BC = 165 + 150 * slope;
        const AD = BC + AB * slope;
        const topY = baseY + AD + 300; // triangle üst çapraz ölçü payı dahil yaklaşık limit
        best = best == null ? topY : Math.max(best, topY);
      }
      shiftY -= (p.opening + K.sideViewGapY);
    }
    return best == null ? null : best + 200;
  }

  function independentSideViewVisible(d, position, side) {
    const visibility = d && d.independentSideViewVisibility && typeof d.independentSideViewVisibility === 'object'
      ? d.independentSideViewVisibility : {};
    const group = visibility[position && position.independentGroupId] || {};
    const item = group[position && position.positionId] || {};
    return item[side === 'right' ? 'rightSideVisible' : 'leftSideVisible'] !== false;
  }

  function independentSideViewTitle(g, d, p, side, rangeStart) {
    const b = rangeBounds(g.entities, rangeStart, g.entities.length);
    if (!b) return;
    const label = `${p.independentGroupId} — POZ ${Number(p.groupPositionIndex || 0) + 1} — ${side === 'right' ? 'SAĞ' : 'SOL'} YAN GÖRÜNÜŞ`;
    const title = g.text((b.minX + b.maxX) / 2, b.maxY + 230, label, 105, 'TEXT', 'center');
    if (title) {
      title.independentGroupId = p.independentGroupId;
      title.positionId = p.positionId;
      title.viewId = `${p.positionId}:${side.toUpperCase()}_SIDE`;
      title.viewType = 'SIDE';
      title.side = side;
    }
  }

  function annotateIndependentSideViewEntities(entities, start, end, p, side) {
    for (let i = start; i < end; i += 1) {
      const entity = entities[i];
      if (!entity) continue;
      entity.independentGroupId = p.independentGroupId;
      entity.positionId = p.positionId;
      entity.viewId = `${p.positionId}:${side.toUpperCase()}_SIDE`;
      entity.viewType = 'SIDE';
      entity.side = side;
      if (entity.data && typeof entity.data === 'object') {
        entity.data.independentGroupId = p.independentGroupId;
        entity.data.groupId = p.independentGroupId;
        entity.data.positionId = p.positionId;
        entity.data.viewId = `${p.positionId}:${side.toUpperCase()}_SIDE`;
        entity.data.viewType = 'SIDE';
        entity.data.side = side;
      }
      if (entity.edit && typeof entity.edit === 'object') {
        entity.edit.independentGroupId = p.independentGroupId;
        entity.edit.positionId = p.positionId;
        entity.edit.viewId = `${p.positionId}:${side.toUpperCase()}_SIDE`;
        entity.edit.side = side;
      }
    }
  }

  function appendSideViewEnvelope(g, start, contentEnd, p, side, positionIndex) {
    const viewBounds = rangeCollisionBounds(g.entities, start, contentEnd);
    if (!viewBounds) return null;
    const groupId = String((p && p.independentGroupId) || 'IPR-01');
    const positionId = String((p && p.positionId) || `position_${Number(positionIndex || 0) + 1}`);
    const viewId = `${positionId}:${String(side).toUpperCase()}_SIDE`;
    g.entities.push({ type: 'interaction', kind: 'sideViewEnvelope', layoutNeutral: true,
      x: viewBounds.minX - 35, y: viewBounds.minY - 35,
      w: viewBounds.maxX - viewBounds.minX + 70, h: viewBounds.maxY - viewBounds.minY + 70,
      data: { independentGroupId: groupId, groupId,
        positionId, positionIndex: Number(positionIndex) || 0,
        viewId, viewType: 'SIDE', side,
        actionType: 'HIGHLIGHT_FULL_SIDE_VIEW', exportable: false } });
    return viewBounds;
  }

  function drawIndependentSideViews(g, d) {
    d.leftSideRanges = [];
    d.sideViewRanges = [];
    d.independentSideViewRanges = [];
    let shiftY = 0;
    let firstRectStartY = null;
    let firstRearWallMinusY = null;
    const globalSideShiftY = Number(d.sideGlobalShiftY) || 0;
    const count = Math.max(1, Number(d.sidePositionCount) || 1);

    // ':' bağımsız grup modu, çalışan ';' çoklu-poz sunum düzenini referans alır:
    // ilk ve ara pozların SOL görünüşleri solda alt alta; son pozun SAĞ görünüşü
    // sağda ve ilk sol görünüşle aynı oluk kotunda gösterilir. Ara/ilk pozlar için
    // ikinci bir sağ görünüş üretilmez; böylece çizim sayfası gereksiz yere dağılmaz.
    const leftLastIndex = Math.max(0, count - 2);
    for (let i = 0; i <= leftLastIndex; i += 1) {
      const sourcePosition = d.positions[i] || d.positions[0];
      if (!sourcePosition) continue;
      const base = {
        ...sourcePosition,
        index: i,
        sideViewKey: String(i),
        independentGroupId: sourcePosition.independentGroupId || 'IPR-01',
        positionId: sourcePosition.positionId || sourcePosition.id || `position_${i + 1}`,
        independentSide: 'left'
      };
      const positionFrontHeight = Number.isFinite(Number(base.frontHeight)) ? Number(base.frontHeight) : d.frontHeight;
      const thisRectStartY = -(base.opening + (base.rearHeight - positionFrontHeight) + K.frontViewExtraDrop) + globalSideShiftY + shiftY;
      if (firstRectStartY == null) firstRectStartY = thisRectStartY;
      if (firstRearWallMinusY == null) firstRearWallMinusY = thisRectStartY - positionFrontHeight;
      if (independentSideViewVisible(d, base, 'left')) {
        const start = g.entities.length;
        drawOneSideView(g, d, base, shiftY);
        const beforeTitleEnd = g.entities.length;
        annotateIndependentSideViewEntities(g.entities, start, beforeTitleEnd, base, 'left');
        independentSideViewTitle(g, d, base, 'left', start);
        const contentEnd = g.entities.length;
        appendSideViewEnvelope(g, start, contentEnd, base, 'left', i);
        const end = g.entities.length;
        annotateIndependentSideViewEntities(g.entities, beforeTitleEnd, end, base, 'left');
        const range = { start, end, index: i, groupId: base.independentGroupId, positionId: base.positionId, side: 'left', viewId: `${base.positionId}:LEFT_SIDE` };
        d.leftSideRanges.push(range);
        d.sideViewRanges.push(range);
        d.independentSideViewRanges.push(range);
      }
      shiftY -= (base.opening + K.sideViewGapY);
    }

    const rightIndex = Math.max(0, count - 1);
    const rightSource = d.positions[rightIndex] || d.positions[0];
    if (rightSource) {
      const rightBase = {
        ...rightSource,
        index: rightIndex,
        sideViewKey: 'right',
        independentGroupId: rightSource.independentGroupId || 'IPR-01',
        positionId: rightSource.positionId || rightSource.id || `position_${rightIndex + 1}`,
        independentSide: 'right',
        rightMasterDisplay: true
      };
      if (independentSideViewVisible(d, rightBase, 'right')) {
        const positionFrontHeight = Number.isFinite(Number(rightBase.frontHeight)) ? Number(rightBase.frontHeight) : d.frontHeight;
        const rightBaseRectStartY = -(rightBase.opening + (rightBase.rearHeight - positionFrontHeight) + K.frontViewExtraDrop) + globalSideShiftY;
        const rightBaseRearWallMinusY = rightBaseRectStartY - positionFrontHeight;
        const rightShiftY = firstRearWallMinusY == null ? 0 : firstRearWallMinusY - rightBaseRearWallMinusY;
        const mirrorSink = makeEntitySink();
        drawOneSideView(mirrorSink, d, rightBase, rightShiftY);
        const midX = K.systemStartX + d.width / 2;
        const start = g.entities.length;
        appendMirroredEntitiesX(g, mirrorSink.entities, midX);
        const beforeTitleEnd = g.entities.length;
        annotateIndependentSideViewEntities(g.entities, start, beforeTitleEnd, rightBase, 'right');
        independentSideViewTitle(g, d, rightBase, 'right', start);
        const contentEnd = g.entities.length;
        appendSideViewEnvelope(g, start, contentEnd, rightBase, 'right', rightIndex);
        const end = g.entities.length;
        annotateIndependentSideViewEntities(g.entities, beforeTitleEnd, end, rightBase, 'right');
        const range = { start, end, index: rightIndex, groupId: rightBase.independentGroupId, positionId: rightBase.positionId, side: 'right', viewId: `${rightBase.positionId}:RIGHT_SIDE` };
        d.sideViewRanges.push(range);
        d.independentSideViewRanges.push(range);
      }
    }
  }

  function drawSideView(g, d) {
    d.farkliAcilim = d.openingList.length > 1;
    if (d.independentMode) { drawIndependentSideViews(g, d); return; }
    d.leftSideRanges = [];
    d.sideViewRanges = [];
    let shiftY = 0;
    let firstRectStartY = null;
    const globalSideShiftY = Number(d.sideGlobalShiftY) || 0;
    for (let i = 0; i < d.sidePositionCount; i += 1) {
      const sourcePosition = d.positions[i] || d.positions[0];
      if (!sourcePosition) continue;
      const base = {
        ...sourcePosition,
        index: i,
        sideViewKey: String(i),
        independentGroupId: sourcePosition.independentGroupId || 'IPR-01',
        positionId: sourcePosition.positionId || sourcePosition.id || `position_${i + 1}`,
        independentSide: 'left'
      };
      const visible = independentSideViewVisible(d, base, 'left');
      if (!visible) continue;
      const thisRectStartY = -(base.opening + (base.rearHeight - d.frontHeight) + K.frontViewExtraDrop) + globalSideShiftY + shiftY;
      if (firstRectStartY == null) firstRectStartY = thisRectStartY;
      const start = g.entities.length;
      const isLastPresentationMirror = d.sidePositionCount > 1 && i === d.sidePositionCount - 1;
      if (isLastPresentationMirror) {
        // Çoklu pozlarda son pozun sol yığındaki sunumu, sağ görünüş geometrisinin
        // ayna kopyasıdır; seçim kimliği yine bu görünür sol yan görünüşe aittir.
        const sourceSink = makeEntitySink();
        const sourceP = { ...base, sideViewKey: 'right', semanticMirror: true, independentSide: 'left' };
        drawOneSideView(sourceSink, d, sourceP, shiftY);
        appendLastPositionPresentationCopy(g, sourceSink.entities);
      } else {
        drawOneSideView(g, d, base, shiftY);
      }
      const contentEnd = g.entities.length;
      appendSideViewEnvelope(g, start, contentEnd, base, 'left', i);
      const end = g.entities.length;
      const range = { start, end, index: i, groupId: base.independentGroupId, positionId: base.positionId, side: 'left', viewId: `${base.positionId}:LEFT_SIDE` };
      d.leftSideRanges.push(range);
      d.sideViewRanges.push(range);
      shiftY -= (base.opening + K.sideViewGapY);
    }

    const rightIndex = Math.max(0, d.sidePositionCount - 1);
    const rightSource = d.positions[rightIndex] || d.positions[0];
    if (rightSource) {
      const rightBase = {
        ...rightSource,
        index: rightIndex,
        sideViewKey: 'right',
        independentGroupId: rightSource.independentGroupId || 'IPR-01',
        positionId: rightSource.positionId || rightSource.id || `position_${rightIndex + 1}`,
        independentSide: 'right',
        rightMasterDisplay: true
      };
      if (sideMirrorNeeded(d, rightBase) && independentSideViewVisible(d, rightBase, 'right')) {
        const midX = K.systemStartX + d.width / 2;
        const mirrorSink = makeEntitySink();
        const rightBaseRectStartY = -(rightBase.opening + (rightBase.rearHeight - d.frontHeight) + K.frontViewExtraDrop) + globalSideShiftY;
        const rightShiftY = firstRectStartY == null ? 0 : firstRectStartY - rightBaseRectStartY;
        const sourceStart = mirrorSink.entities.length;
        drawOneSideView(mirrorSink, d, rightBase, rightShiftY);
        const start = g.entities.length;
        appendMirroredEntitiesX(g, mirrorSink.entities.slice(sourceStart), midX);
        const contentEnd = g.entities.length;
        appendSideViewEnvelope(g, start, contentEnd, rightBase, 'right', rightIndex);
        const end = g.entities.length;
        d.sideViewRanges.push({ start, end, index: rightIndex, groupId: rightBase.independentGroupId, positionId: rightBase.positionId, side: 'right', viewId: `${rightBase.positionId}:RIGHT_SIDE` });
      }
    }
  }

  function computeFrame(d) {
    const x = -(d.maxOpening + 2900);
    const y = 800 + (d.maxOpening - d.opening) + 450;
    let w = d.systemCount > 1 ? d.width + d.lastOpening + 3500 : d.width + d.maxOpening + 3800;
    const needsMirror = (d.openingList.length > 1) || sideFeatureEnabled(d, 'glassTrack', 'right', Math.max(0, d.sidePositionCount - 1)) || sideFeatureEnabled(d, 'triangle', 'right', Math.max(0, d.sidePositionCount - 1)) || yes(d.sideTrack);
    if (needsMirror) w = Math.max(w, d.width + 2 * d.maxOpening + 5200);
    const triExtra = yes(d.triangleJoinery) ? Math.max(0, triangleFrameAllowance(d, d.sidePositionCount - 1)) : 0;
    const sideRowCount = d.independentMode ? Math.max(1, d.sidePositionCount - 1) : Math.max(1, d.sidePositionCount);
    const h = Math.max(5000, d.maxOpening + d.maxRearHeight + 2750 + triExtra + (sideRowCount - 1) * (d.maxOpening + K.sideViewGapY));
    return { x, y, w, h, bottomY: y - h };
  }

  function ensureFrame(d) {
    if (!d.frame) d.frame = computeFrame(d);
    return d.frame;
  }

  function entityBoundsArray(e) {
    if (!e) return [0, 0, 0, 0];
    if (e.type === 'line') return [Math.min(e.x1, e.x2), Math.min(e.y1, e.y2), Math.max(e.x1, e.x2), Math.max(e.y1, e.y2)];
    if (e.type === 'text' || e.type === 'mtext') return [e.x, e.y - e.height, e.x + Math.max(1, String(e.value || '').length) * e.height * 0.65, e.y + e.height];
    if (e.type === 'polyline' || e.type === 'hatch') { const points = e.points || []; return [safeExtrema(points.map(p => p[0]), 'min', 0), safeExtrema(points.map(p => p[1]), 'min', 0), safeExtrema(points.map(p => p[0]), 'max', 0), safeExtrema(points.map(p => p[1]), 'max', 0)]; }
    if (e.type === 'circle') return [e.x - e.r, e.y - e.r, e.x + e.r, e.y + e.r];
    if (e.type === 'insert') {
      const block = getBlocks()[e.name];
      if (block) return transformBlockBounds(block, e);
      const w = Math.abs(e.previewW || 120), h = Math.abs(e.previewH || 80);
      return [e.x - w / 2, e.y - h / 2, e.x + w / 2, e.y + h / 2];
    }
    if (e.type === 'dimension') {
      const gs = (e.graphics || []).map(entityBoundsArray);
      if (gs.length) return [safeExtrema(gs.map(b => b[0]), 'min', 0), safeExtrema(gs.map(b => b[1]), 'min', 0), safeExtrema(gs.map(b => b[2]), 'max', 0), safeExtrema(gs.map(b => b[3]), 'max', 0)];
    }
    if (e.type === 'interaction') return [Math.min(e.x, e.x + e.w), Math.min(e.y, e.y + e.h), Math.max(e.x, e.x + e.w), Math.max(e.y, e.y + e.h)];
    return [0, 0, 0, 0];
  }

  function rangeBounds(entities, start, end) {
    if (!Array.isArray(entities) || start == null || end == null || end <= start) return null;
    let out = null;
    for (let i = start; i < end; i += 1) {
      const b = entityBoundsArray(entities[i]);
      if (!out) out = { minX: b[0], minY: b[1], maxX: b[2], maxY: b[3] };
      else {
        out.minX = Math.min(out.minX, b[0]);
        out.minY = Math.min(out.minY, b[1]);
        out.maxX = Math.max(out.maxX, b[2]);
        out.maxY = Math.max(out.maxY, b[3]);
      }
    }
    return out;
  }

  function collisionEntityBoundsArray(entity) {
    if (!entity) return null;
    if (entity.type === 'text' || entity.type === 'mtext') {
      const height = Math.max(1, Number(entity.height) || 1);
      const width = entity.type === 'mtext' && Number(entity.width) > 0
        ? Number(entity.width)
        : Math.max(1, String(entity.value || '').length) * height * 0.65;
      const align = String(entity.align || 'left').toLowerCase();
      const minX = align === 'center' ? Number(entity.x) - width / 2 : (align === 'right' ? Number(entity.x) - width : Number(entity.x));
      const maxX = align === 'center' ? Number(entity.x) + width / 2 : (align === 'right' ? Number(entity.x) : Number(entity.x) + width);
      return [minX, Number(entity.y) - height, maxX, Number(entity.y) + height];
    }
    if (entity.type === 'dimension') {
      const bounds = (entity.graphics || []).map(collisionEntityBoundsArray).filter(Boolean);
      if (!bounds.length) return null;
      return [safeExtrema(bounds.map(item => item[0]), 'min', 0), safeExtrema(bounds.map(item => item[1]), 'min', 0), safeExtrema(bounds.map(item => item[2]), 'max', 0), safeExtrema(bounds.map(item => item[3]), 'max', 0)];
    }
    return entityBoundsArray(entity);
  }

  function rangeCollisionBounds(entities, start, end) {
    if (!Array.isArray(entities) || start == null || end == null || end <= start) return null;
    let out = null;
    for (let i = start; i < end; i += 1) {
      const entity = entities[i];
      if (!entity || entity.type === 'interaction' || entity.previewOnly === true) continue;
      const b = collisionEntityBoundsArray(entity);
      if (!b || b.some(value => !Number.isFinite(Number(value)))) continue;
      if (!out) out = { minX: b[0], minY: b[1], maxX: b[2], maxY: b[3] };
      else {
        out.minX = Math.min(out.minX, b[0]);
        out.minY = Math.min(out.minY, b[1]);
        out.maxX = Math.max(out.maxX, b[2]);
        out.maxY = Math.max(out.maxY, b[3]);
      }
    }
    return out;
  }

  function rangeLayoutBounds(entities, start, end) {
    if (!Array.isArray(entities) || start == null || end == null || end <= start) return null;
    let out = null;
    for (let i = start; i < end; i += 1) {
      const entity = entities[i];
      if (!entity || entity.layoutNeutral === true) continue;
      const b = entityBoundsArray(entity);
      if (!b || b.some(value => !Number.isFinite(Number(value)))) continue;
      if (!out) out = { minX: b[0], minY: b[1], maxX: b[2], maxY: b[3] };
      else {
        out.minX = Math.min(out.minX, b[0]);
        out.minY = Math.min(out.minY, b[1]);
        out.maxX = Math.max(out.maxX, b[2]);
        out.maxY = Math.max(out.maxY, b[3]);
      }
    }
    return out;
  }

  function leftSideViewMinY(d, entities) {
    const ranges = Array.isArray(d.leftSideRanges) ? d.leftSideRanges : [];
    let minY = null;
    ranges.forEach(r => {
      const b = rangeLayoutBounds(entities, r.start, r.end);
      if (b) minY = minY == null ? b.minY : Math.min(minY, b.minY);
    });
    return minY;
  }

  function adjustFrameToContent(d, entities) {
    // PERI01 mantığı: dış çerçeve çizimi çevrelemeli; görünüşler tablo dışına taşmamalı.
    // V8.2.17: Üçgen doğrama varken çerçevenin alt sınırı, alt tablonun üstü ile
    // sol yan görünüşün (ölçüler dahil) en alt noktası arasında tam 800 mm boşluk
    // bırakacak şekilde ayarlanır.
    const f = ensureFrame(d);
    const viewEnts = (entities || []).filter(e => e && e.layoutNeutral !== true && !['TABLE', 'TITLE'].includes(e.layer));
    if (!viewEnts.length) return f;
    const b = bounds(viewEnts);
    const padX = 450;
    const padTop = 650;
    const padBottom = 450;
    const minX = Math.min(f.x, b.minX - padX);
    const maxX = Math.max(f.x + f.w, b.maxX + padX);
    const topY = Math.max(f.y, b.maxY + padTop);
    let bottomY = Math.min(f.bottomY, b.minY - padBottom);
    if (yes(d.triangleJoinery)) {
      const sideMinY = leftSideViewMinY(d, entities);
      if (Number.isFinite(sideMinY)) bottomY = sideMinY - 800;
    }
    d.frame = { x: minX, y: topY, w: maxX - minX, h: topY - bottomY, bottomY };
    return d.frame;
  }

  function pergoTextH(d) {
    const ranges = systemRanges(d);
    const minInner = safeExtrema(ranges.map(r => Math.max(1, r.x2 - r.x1 - 2 * K.pergoTextOffset)), 'min', 1);
    return clamp(minInner / K.pergoTextRatio, K.pergoTextMinH, K.pergoTextMaxH);
  }

  function repeatCharCountText(s) {
    return String(s ?? '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  }

  function wrapTextForWidth(value, width, h, pad, factor = 0.95) {
    const usable = Math.max(h, width - 2 * pad);
    const maxChars = Math.max(1, Math.floor(usable / (h * factor)));
    const raw = repeatCharCountText(value).split('\n');
    const out = [];
    raw.forEach(line => {
      const words = String(line).trim().split(/\s+/).filter(Boolean);
      if (!words.length) { out.push(''); return; }
      let cur = '';
      words.forEach(w => {
        if (!cur) cur = w;
        else if ((cur + ' ' + w).length <= maxChars) cur += ' ' + w;
        else { out.push(cur); cur = w; }
      });
      if (cur) out.push(cur);
    });
    return out.length ? out : [''];
  }

  function textMaxLineLen(value) {
    return repeatCharCountText(value).split('\n').reduce((out, line) => Math.max(out, line.length), 1);
  }

  function fitCellText(value, w, rowH, baseH, padX, options = {}) {
    const mode = options.mode || 'upper';
    const widthFactor = options.widthFactor || 0.72; // Arial yaklaşık karakter genişliği
    const raw = repeatCharCountText(value).replace(/\n/g, '\n').trim() || '-';
    const usable = Math.max(1, Number(w || 0) - 2 * Number(padX || 0));
    const usableH = Math.max(1, Number(rowH || 0) - 2 * Math.max(6, Number(padX || 0) * 0.35));
    const base = Number(baseH) || 60;
    const minH = Math.max(16, base * 0.34);

    function wrapAtHeight(hh) {
      if (mode === 'bottom') return [raw.replace(/\s+/g, ' ')];
      return wrapTextForWidth(raw, usable + 2 * padX, hh, padX, widthFactor).filter(Boolean);
    }

    let hh = base;
    let lines = wrapAtHeight(hh);
    for (let step = 0; step < 40; step += 1) {
      const maxLine = lines.reduce((out, line) => Math.max(out, String(line).length), 1);
      const byWidth = usable / (maxLine * widthFactor);
      const byHeight = usableH / Math.max(1, lines.length * 1.22);
      const next = clamp(Math.min(base, byWidth, byHeight), minH, base);
      if (Math.abs(next - hh) < 0.05) { hh = next; break; }
      hh = next;
      lines = wrapAtHeight(hh);
    }
    if (mode === 'bottom') lines = [raw.replace(/\s+/g, ' ')];
    return { h: hh, lines };
  }

  function drawCellLines(g, x, yTop, w, rowH, h, padX, value, layer = 'TEXT', mode = 'upper') {
    const fit = fitCellText(value, w, rowH, h, padX, { mode });
    const lineStep = fit.h * 1.18;
    const textBlockH = fit.h + Math.max(0, fit.lines.length - 1) * lineStep;
    const centerY = yTop - rowH / 2;
    // SVG/PDF için mevcut optik baseline yerleşimi korunur.
    const firstBaseline = centerY + textBlockH / 2 - fit.h * 0.72;
    const textX = x + padX;
    const mtextCellWidth = Math.max(1, w - 2 * padX);
    const dxfCellText = fit.lines.join('\n');
    const mapX = typeof g.mapX === 'function' ? g.mapX : value => value;
    const mapY = typeof g.mapY === 'function' ? g.mapY : value => value;
    const mapWidth = typeof g.mapWidth === 'function' ? g.mapWidth : value => value;
    fit.lines.forEach((line, i) => {
      const ent = g.text(textX, firstBaseline - i * lineStep, line, fit.h, layer, 'left');
      if (g.upperTableEntity) Object.defineProperty(ent, 'upperTableEntity', { value: true, enumerable: false, configurable: true });
      ent.width = mapWidth(mtextCellWidth);
      ent.cellWidth = mapWidth(mtextCellWidth);
      if (i === 0) {
        // DXF'te hücre başına tek MTEXT: sol hizalı ve düşey orta bağlantılı.
        // Üst tablo affine dönüşümü MTEXT yerleşim metadata'sına da uygulanır.
        ent.dxfCellText = dxfCellText;
        ent.dxfCellX = mapX(textX);
        ent.dxfCellY = mapY(centerY);
        ent.dxfCellWidth = mapWidth(mtextCellWidth);
        ent.dxfAttachment = 4;
        ent.dxfLineSpacing = 1.0;
      } else {
        ent.dxfSkip = true;
      }
    });
  }

  function upperTableStyle(d) {
    // PERI01 mantığına yakın tablo: yazı boyu PERGO RISE yazısıyla aynı oranda büyümez.
    // Aksi halde büyük sistemlerde tablo yazıları hücre dışına taşar. Tablo solda sabit bir
    // teknik bilgi bloğu gibi davranır; hücre içindeki metinler sığmazsa kırılır/küçülür.
    const h = clamp(pergoTextH(d) * 0.34, 42, 78);
    return {
      rowH: Math.max(150, h * 2.25),
      col1: 1460,
      col2: 2140,
      txtX: Math.max(35, h * 0.55),
      txtY: Math.max(28, h * 0.45),
      txtH: h
    };
  }

  function bottomTableStyle(d, frame) {
    // V8.2.13: Alt tablo yazı boyu, üst tablonun ölçeklenmiş yazı boyuyla aynıdır.
    // Hücre yükseklikleri ise bu yazı boyu sabit kalacak şekilde içerik satır sayısına göre büyür/küçülür.
    const upper = upperTableScaledStyle(d);
    const h = upper.txtH;
    // V8.2.16: Kullanıcı tanımlı alt tablo kolon oranı.
    const base = [13, 40, 10, 19, 7, 11];
    const sum = base.reduce((a,b)=>a+b,0);
    const cols = base.map(v => frame.w * (v / sum));
    return {
      rowH: Math.max(165, h * 2.15),
      cols,
      txtX: upper.txtX,
      txtY: upper.txtY,
      txtH: h
    };
  }

  function fitTextHSingleLine(value, w, h, pad) {
    const usable = Math.max(1, w - 2 * pad);
    const n = textMaxLineLen(value);
    const fitH = usable / (n * 0.95);
    const minH = h * 0.35;
    return Math.max(minH, Math.min(h, fitH));
  }

  function upperTableScaledStyle(d) {
    const frame = ensureFrame(d);
    const base = upperTableStyle(d);
    const tableX = frame.x + 50;
    const topViewLeftX = Math.min(K.gutterX, d.systemStartX, d.rayAreaStartX || d.systemStartX);
    const tableRightLimitX = topViewLeftX - 500;
    const baseTableW = base.col1 + base.col2;
    const availableW = Math.max(baseTableW, tableRightLimitX - tableX);
    const tableScale = clamp(availableW / baseTableW, 0.72, 3.25);
    return {
      ...base,
      tableScale,
      col1: base.col1 * tableScale,
      col2: base.col2 * tableScale,
      rowH: base.rowH * tableScale,
      txtX: base.txtX * tableScale,
      txtY: base.txtY * tableScale,
      txtH: base.txtH * tableScale
    };
  }

  function requiredWrappedCellHeight(value, w, st) {
    const lines = wrapTextForWidth(value, w, st.txtH, st.txtX, 0.72).filter(Boolean);
    const lineCount = Math.max(1, lines.length);
    return Math.max(st.rowH, 2 * st.txtY + st.txtH + Math.max(0, lineCount - 1) * st.txtH * 1.18);
  }

  function upperTableValueWrapInfo(raw) {
    const d = raw && raw.positions ? raw : normalizeInput(raw || SAMPLE_INPUT);
    const base = upperTableStyle(d);
    const scaled = upperTableScaledStyle(d);
    // Form tarafında sanal değer sütunu 2130 kabul edilir. DXF tarafında tablo
    // büyüse/küçülse bile yazı ve sütun aynı oranda ölçeklendiği için karakter
    // kırılımı baz ölçüden hesaplanır.
    const virtualMaxW = 2130;
    const usable = Math.max(base.txtH, virtualMaxW - 2 * base.txtX);
    const maxChars = Math.max(1, Math.floor(usable / (base.txtH * 0.72)));
    return {
      maxChars,
      virtualMaxW,
      col2: scaled.col2,
      baseCol2: base.col2,
      txtH: scaled.txtH,
      baseTxtH: base.txtH,
      txtX: scaled.txtX,
      baseTxtX: base.txtX,
      tableScale: scaled.tableScale
    };
  }

  function wrapTextForUpperInput(value, raw) {
    const info = upperTableValueWrapInfo(raw);
    const rawText = String(value ?? '').replace(/\r\n/g, ' ').replace(/\r/g, ' ').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
    if (!rawText) return '';
    const out = [];
    rawText.split(' ').filter(Boolean).forEach(word => {
      const last = out[out.length - 1] || '';
      if (!last) out.push(word);
      else if ((last + ' ' + word).length <= info.maxChars) out[out.length - 1] = last + ' ' + word;
      else out.push(word);
    });
    return out.join('\n');
  }

  function affineSink(base, anchorX, anchorY, transform) {
    const tx = x => anchorX + (Number(x) - anchorX) * transform.scaleX + transform.x;
    const ty = y => anchorY + (Number(y) - anchorY) * transform.scaleY + transform.y;
    const identity = transform.x === 0 && transform.y === 0 && transform.scaleX === 1 && transform.scaleY === 1;
    return {
      entities: base.entities,
      upperTableEntity: true,
      mapX: identity ? value => Number(value) : tx,
      mapY: identity ? value => Number(value) : ty,
      mapWidth(value){ return identity ? Number(value) || 0 : (Number(value)||0) * transform.scaleX; },
      mapHeight(value){ return identity ? Number(value) || 0 : (Number(value)||0) * transform.scaleY; },
      line(x1,y1,x2,y2,layer){ return base.line(tx(x1),ty(y1),tx(x2),ty(y2),layer); },
      rect(x,y,w,h,layer){ return base.rect(tx(x),ty(y),(Number(w)||0)*transform.scaleX,(Number(h)||0)*transform.scaleY,layer); },
      poly(points,closed,layer){ return base.poly((points||[]).map(p=>[tx(p[0]),ty(p[1])]),closed,layer); },
      text(x,y,value,height,layer,align,rotation){ return base.text(tx(x),ty(y),value,(Number(height)||0)*Math.min(transform.scaleX,transform.scaleY),layer,align,rotation); },
      mtext(x,y,value,height,width,layer,align,rotation,lineSpacing){ return base.mtext(tx(x),ty(y),value,(Number(height)||0)*Math.min(transform.scaleX,transform.scaleY),(Number(width)||0)*transform.scaleX,layer,align,rotation,lineSpacing); },
      dimension(data){ return base.dimension(data); }, insert(name,x,y,options){ return base.insert(name,tx(x),ty(y),{...options,scaleX:(options.scaleX||1)*transform.scaleX,scaleY:(options.scaleY||1)*transform.scaleY}); }
    };
  }

  function drawUpperOptionsTable(g, d) {
    const frame = ensureFrame(d);
    const st = upperTableStyle(d);
    let tableX = frame.x + 50;
    let tableY = frame.y - 50;
    const transform = normalizeUpperTableTransform(d.upperTableTransform);
    const tg = affineSink(g, tableX, tableY, transform);

    const scaledSt = upperTableScaledStyle(d);
    let col1 = scaledSt.col1;
    let col2 = scaledSt.col2;

    const rows = [
      ['STRUCTURE COLOR', d.structureColor],
      ['FABRIC', d.fabric],
      ['FABRIC PROFILES COLOR', d.fabricProfiles],
      ['MOTOR', d.motor],
      ['REMOTE', d.remote],
      ['LED', d.led],
      ['DIMMER', d.dimmer],
      ['EXTRAS', d.extras]
    ];

    let rowHeights = rows.map(row => {
      const labLines = wrapTextForWidth(row[0], col1, scaledSt.txtH, scaledSt.txtX);
      const valLines = wrapTextForWidth(row[1], col2, scaledSt.txtH, scaledSt.txtX);
      const lineCount = Math.max(labLines.length, valLines.length);
      const need = 2 * scaledSt.txtY + (lineCount - 1) * scaledSt.txtH * 1.25 + scaledSt.txtH;
      return Math.max(scaledSt.rowH, need);
    });
    let tableH = rowHeights.reduce((a, b) => a + b, 0);
    const triLimitY = triangleTableLimitY(d);
    const sideLimitY = sideViewTopLimitY(d);
    const limitCandidates = [triLimitY, sideLimitY].filter(v => v !== null && Number.isFinite(v));
    const tableLimitY = limitCandidates.length ? safeExtrema(limitCandidates, 'max', 0) : null;
    if (tableLimitY !== null) {
      const allowedH = tableY - tableLimitY;
      if (allowedH > scaledSt.txtH && tableH > allowedH) {
        // PERI01 tablo sıkıştırma mantığı: tablo, sol yan görünüşün üst sınırına yaklaşırsa
        // satır yükseklikleri küçültülür. 0.22 altına inmiyoruz; okunurluk çok bozulursa
        // çerçeve büyütme sonraki revizyonda yapılır.
        const k = Math.max(0.55, allowedH / tableH);
        rowHeights = rowHeights.map(h => h * k);
        tableH = rowHeights.reduce((a, b) => a + b, 0);
      }
    }
    const tableW = col1 + col2;

    tg.rect(tableX, tableY, tableW, -tableH, 'TABLE');
    tg.line(tableX + col1, tableY, tableX + col1, tableY - tableH, 'TABLE');
    let y = tableY;
    for (let i = 0; i < rowHeights.length - 1; i += 1) {
      y -= rowHeights[i];
      tg.line(tableX, y, tableX + tableW, y, 'TABLE');
    }
    y = tableY;
    rows.forEach((row, i) => {
      drawCellLines(tg, tableX, y, col1, rowHeights[i], scaledSt.txtH, scaledSt.txtX, row[0]);
      drawCellLines(tg, tableX + col1, y, col2, rowHeights[i], scaledSt.txtH, scaledSt.txtX, row[1]);
      y -= rowHeights[i];
    });
    const minX = tableX + transform.x;
    const maxY = tableY + transform.y;
    const maxX = minX + tableW * transform.scaleX;
    const minY = maxY - tableH * transform.scaleY;
    d.upperTableBounds = { minX, minY, maxX, maxY };
    g.entities.push({ type: 'interaction', kind: 'upperTableEditor', x: minX, y: minY, w: maxX-minX, h: maxY-minY, data: {
      tableX: transform.x, tableY: transform.y, tableScaleX: transform.scaleX, tableScaleY: transform.scaleY,
      tableMinX:minX, tableMinY:minY, tableMaxX:maxX, tableMaxY:maxY
    }});
  }

  function drawBottomTitleTable(g, d) {
    const frame = ensureFrame(d);
    const st = bottomTableStyle(d, frame);
    const x = frame.x;
    const y = frame.bottomY;
    const [c1, c2, c3, c4, c5, c6] = st.cols;
    const ax1 = x + c1, ax2 = ax1 + c2, ax3 = ax2 + c3, ax4 = ax3 + c4, ax5 = ax4 + c5;
    const row1Cells = [
      ['CUSTOMER', c1], [d.customer, c2], ['VERSION', c3], [d.version, c4], ['DATE', c5], [d.date, c6]
    ];
    const row2Cells = [
      ['PROJECT', c1], [d.project, c2], ['DRAWN BY', c3], [d.drawnBy, c4]
    ];
    const cellH = (val, w) => requiredWrappedCellHeight(val, w, st);
    const row1H = row1Cells.reduce((out, cell) => Math.max(out, cellH(cell[0], cell[1])), st.rowH);
    const row2H = row2Cells.reduce((out, cell) => Math.max(out, cellH(cell[0], cell[1])), st.rowH);
    const totalH = row1H + row2H;

    g.rect(x, y, frame.w, -totalH, 'TITLE');
    [ax1, ax2, ax3, ax4, ax5].forEach(ax => g.line(ax, y, ax, y - totalH, 'TITLE'));
    g.line(x, y - row1H, x + frame.w, y - row1H, 'TITLE');

    const drawSingle = (x0, yTop, w, hRow, value) => {
      drawCellLines(g, x0, yTop, w, hRow, st.txtH, st.txtX, value, 'TEXT', 'upper');
    };
    drawSingle(x, y, c1, row1H, 'CUSTOMER');
    drawSingle(ax1, y, c2, row1H, d.customer);
    drawSingle(ax2, y, c3, row1H, 'VERSION');
    drawSingle(ax3, y, c4, row1H, d.version);
    drawSingle(ax4, y, c5, row1H, 'DATE');
    drawSingle(ax5, y, c6, row1H, d.date);

    const y2 = y - row1H;
    drawSingle(x, y2, c1, row2H, 'PROJECT');
    drawSingle(ax1, y2, c2, row2H, d.project);
    drawSingle(ax2, y2, c3, row2H, 'DRAWN BY');
    drawSingle(ax3, y2, c4, row2H, d.drawnBy);
  }

  function drawFrame(g, d) {
    const f = ensureFrame(d);
    g.rect(f.x, f.y, f.w, -f.h, 'OUTLINE');
  }

  function buildSmartMetadata(entities, d) {
    const dimensions = [];
    const zones = {};
    (entities || []).forEach(e => {
      if (!e || e.type !== 'dimension' || e.hiddenDimension || !e.edit) return;
      const edit = e.edit;
      dimensions.push({ ...edit });
      const zoneId = edit.relatedZoneId || edit.zoneId;
      if (zoneId && !zones[zoneId]) {
        zones[zoneId] = {
          id: zoneId,
          view: edit.view || '',
          dimensionId: edit.dimId,
          distance: Number(edit.measuredValue || e.measuredValue || 0),
          editable: edit.editable !== false,
          canAddProfile: !!(edit.canAddSameProfile || edit.canAddDifferentProfile),
          canPlaceProduct: !!edit.canPlaceProduct,
          allowedProfiles: edit.canAddSameProfile ? ['same_post', 'custom_profile'] : (edit.canAddDifferentProfile ? ['custom_profile'] : []),
          allowedProducts: edit.canPlaceProduct ? ['sliding_glass', 'guillotine_glass'] : [],
          placedProduct: null
        };
      }
    });
    return {
      dimensions,
      zones: Object.values(zones),
      profileInstances: [
        { id: 'side_register_reference', profileTypeId: 'side_register_100', relatedViews: ['side', 'top', 'front'], orientation: { side: 'A_visible', top: 'B_visible', front: 'A_visible' } }
      ]
    };
  }

  function applyByBlockPresentation(entities) {
    (entities || []).forEach(e => {
      if (!e) return;
      if (e.type === 'text' || e.type === 'mtext') {
        // Normal yazılar ve açı yazısı BYBLOCK. Ölçü entity grafiklerine dokunulmaz.
        e.color = 0;
        delete e.trueColor;
        delete e.rgb;
        delete e.hexColor;
        return;
      }
      if ((e.type === 'line' || e.type === 'polyline' || e.type === 'circle') && ['OUTLINE', 'TABLE', 'TITLE'].includes(e.layer)) {
        e.color = 0;
        delete e.trueColor;
        delete e.rgb;
        delete e.hexColor;
      }
    });
    return entities;
  }

  function byBlockBlockLibrary(blocks) {
    const out = {};
    Object.entries(blocks || {}).forEach(([name, block]) => {
      out[name] = {
        ...block,
        entities: (block.entities || []).map(e => {
          const next = { ...e };
          if (next.type === 'text' || next.type === 'mtext') {
            next.color = 0;
            delete next.trueColor;
            delete next.rgb;
            delete next.hexColor;
          }
          return next;
        })
      };
    });
    return out;
  }

  function shiftFrontAndSideGroupAwayFromTop(g, d, topRange, groupRange) {
    const topB = rangeLayoutBounds(g.entities, topRange.start, topRange.end);
    const groupB = rangeLayoutBounds(g.entities, groupRange.start, groupRange.end);
    if (!topB || !groupB) return 0;
    const requiredGap = 800;
    const currentGap = topB.minY - groupB.maxY;
    if (currentGap >= requiredGap) return 0;
    const dy = currentGap - requiredGap;
    moveEntityRangeY(g, groupRange.start, groupRange.end, dy);
    d.dynamicViewShiftY = dy;
    d.commonFrontRectStartY += dy;
    d.rectStartY += dy;
    d.sideGlobalShiftY += dy;
    if (Number.isFinite(Number(d.independentLeftRearWallMinusY))) d.independentLeftRearWallMinusY += dy;
    if (Number.isFinite(Number(d.independentFrontRectStartY))) d.independentFrontRectStartY += dy;
    return dy;
  }

  function expandFrameForUpperTable(d) {
    const b = d.upperTableBounds;
    if (!b) return ensureFrame(d);
    const f = ensureFrame(d), pad = 150;
    const minX = Math.min(f.x, b.minX-pad), maxX=Math.max(f.x+f.w,b.maxX+pad);
    const topY=Math.max(f.y,b.maxY+pad), bottomY=Math.min(f.bottomY,b.minY-pad);
    d.frame={x:minX,y:topY,w:maxX-minX,h:topY-bottomY,bottomY};
    return d.frame;
  }

  function alignIndependentFrontAndSideViewsX(g, d, frontRange) {
    if (!(d && d.independentMode)) return;
    const ranges = Array.isArray(d.independentSideViewRanges) ? d.independentSideViewRanges : [];
    const leftRanges = ranges.filter(range => range.side === 'left').sort((a, b) => Number(a.index) - Number(b.index));
    const rightRanges = ranges.filter(range => range.side === 'right').sort((a, b) => Number(b.index) - Number(a.index));
    const frontBounds = rangeCollisionBounds(g.entities, frontRange.start, frontRange.end);
    if (!frontBounds) return;
    const gapX = 700;

    // Ön görünüş kanonik X koordinatında kalır. Sol yan görünüş sütunu gerçek
    // duvar/dikme/oluk zarfıyla ön görünüşün soluna; son sağ görünüş de aynı
    // gerçek zarf hesabıyla ön görünüşün sağına alınır.
    if (leftRanges.length) {
      const reference = rangeCollisionBounds(g.entities, leftRanges[0].start, leftRanges[0].end);
      if (reference) {
        const dx = frontBounds.minX - gapX - reference.maxX;
        leftRanges.forEach(range => moveEntityRangeX(g, range.start, range.end, dx));
        d.independentLeftSideShiftX = dx;
      }
    }
    if (rightRanges.length) {
      const reference = rangeCollisionBounds(g.entities, rightRanges[0].start, rightRanges[0].end);
      if (reference) {
        const dx = frontBounds.maxX + gapX - reference.minX;
        rightRanges.forEach(range => moveEntityRangeX(g, range.start, range.end, dx));
        d.independentRightSideShiftX = dx;
      }
    }
  }

  function independentGroupForEntity(d, entity) {
    const direct = entity && (entity.independentGroupId || (entity.data && (entity.data.independentGroupId || entity.data.groupId)) || (entity.edit && entity.edit.independentGroupId));
    if (direct) return (d.independentPergoRiseGroups || []).find(group => String(group.groupId) === String(direct)) || null;
    const b = entityBoundsArray(entity);
    const centerX = (b[0] + b[2]) / 2;
    return (d.independentPergoRiseGroups || []).find(group => centerX >= Number(group.outerStartX) - 100 && centerX <= Number(group.outerEndX) + 100) || null;
  }

  function independentPositionForEntity(group, entity) {
    if (!group) return null;
    const direct = entity && (entity.positionId || (entity.data && entity.data.positionId) || (entity.edit && entity.edit.positionId));
    if (direct) return (group.positions || []).find(position => String(position.positionId || position.id) === String(direct)) || null;
    const b = entityBoundsArray(entity);
    const centerX = (b[0] + b[2]) / 2;
    return (group.systems || []).map((system, localIndex) => ({ system, position: group.positions[localIndex] }))
      .find(item => centerX >= Number(item.system.outerStartX) - 100 && centerX <= Number(item.system.outerEndX) + 100)?.position || null;
  }

  function annotateIndependentEntityRange(d, entities, start, end, viewType) {
    if (!d.independentMode) return;
    for (let i = start; i < end; i += 1) {
      const entity = entities[i];
      if (!entity) continue;
      const group = independentGroupForEntity(d, entity);
      const position = independentPositionForEntity(group, entity);
      const groupId = group ? group.groupId : (entity.independentGroupId || 'GLOBAL');
      const positionId = position ? (position.positionId || position.id) : (entity.positionId || 'ALL');
      entity.independentGroupId = entity.independentGroupId || groupId;
      entity.positionId = entity.positionId || positionId;
      entity.viewType = entity.viewType || viewType;
      entity.entityId = entity.entityId || `${groupId}:${positionId}:${entity.viewType}:${entity.type}:${String(i - start + 1).padStart(5, '0')}`;
      if (entity.type === 'interaction') {
        entity.exportable = false;
        entity.data = { ...(entity.data || {}), independentGroupId: entity.data && entity.data.independentGroupId || groupId,
          groupId: entity.data && entity.data.groupId || groupId, positionId: entity.data && entity.data.positionId || positionId,
          viewType: entity.data && entity.data.viewType || entity.viewType, exportable: false };
        if (['postEditor', 'frontPostProfileEditor'].includes(entity.kind) && Number.isFinite(Number(entity.data.postIndex))) {
          entity.data.physicalProfileId = `profile:frontPost:${Number(entity.data.postIndex)}`;
        }
      }
    }
  }

  function buildDrawing(raw) {
    const d = normalizeInput(raw);
    const g = makeEntitySink();
    ensureFrame(d);
    const topStart = g.entities.length;
    drawTopView(g, d);
    const topEnd = g.entities.length;
    const groupStart = g.entities.length;
    const frontStart = g.entities.length;
    drawFrontView(g, d);
    const frontEnd = g.entities.length;
    const sideStart = g.entities.length;
    drawSideView(g, d);
    const sideEnd = g.entities.length;
    const groupEnd = g.entities.length;
    alignIndependentFrontAndSideViewsX(g, d, { start: frontStart, end: frontEnd });
    annotateIndependentEntityRange(d, g.entities, topStart, topEnd, 'TOP');
    annotateIndependentEntityRange(d, g.entities, frontStart, frontEnd, 'FRONT');
    annotateIndependentEntityRange(d, g.entities, sideStart, sideEnd, 'SIDE');
    shiftFrontAndSideGroupAwayFromTop(g, d, { start: topStart, end: topEnd }, { start: groupStart, end: groupEnd });
    const viewEnvelopeBounds = {
      top: rangeCollisionBounds(g.entities, topStart, topEnd),
      front: rangeCollisionBounds(g.entities, frontStart, frontEnd)
    };
    const sideRanges = d.independentMode ? (d.independentSideViewRanges || []) : (d.sideViewRanges || d.leftSideRanges || []);
    sideRanges.forEach((range, index) => {
      const bound = rangeCollisionBounds(g.entities, range.start, range.end);
      if (bound) viewEnvelopeBounds[`side_${String(range.viewId || index)}`] = bound;
    });
    d.viewEnvelopeBounds = viewEnvelopeBounds;
    adjustFrameToContent(d, g.entities);
    drawUpperOptionsTable(g, d);
    expandFrameForUpperTable(d);
    drawFrame(g, d);
    const bottomTableStart = g.entities.length;
    drawBottomTitleTable(g, d);
    const bottomTableEnd = g.entities.length;
    d.viewEnvelopeBounds.bottomTable = rangeCollisionBounds(g.entities, bottomTableStart, bottomTableEnd);
    applyDimensionVisibilityState(g.entities, d);
    applyByBlockPresentation(g.entities);
    const smart = buildSmartMetadata(g.entities, d);
    const blocks = byBlockBlockLibrary({ ...getBlocks(), ...customHatchBlocks(), ...slidingBlocksFor(d), ...guillotineBlocksFor(d), ...zipScreenBlocksFor(d) });
    return { input: d, entities: g.entities, layers: Object.keys(LAYER_STYLE), layerStyle: LAYER_STYLE, blocks, smartDimensions: smart.dimensions, zones: smart.zones, profileInstances: smart.profileInstances, dimensionEditRules: DIMENSION_EDIT_RULES, dimensionActions: DIMENSION_ACTIONS, profileLibrary: PROFILE_LIBRARY, productLibrary: PRODUCT_LIBRARY };
  }

  function entityBounds(e, blockLib) {
    const blocks = blockLib || getBlocks();
    if (e.type === 'line') return [Math.min(e.x1, e.x2), Math.min(e.y1, e.y2), Math.max(e.x1, e.x2), Math.max(e.y1, e.y2)];
    if (e.type === 'text') return [e.x, e.y, e.x + String(e.value || '').length * e.height * 0.55, e.y + e.height];
    if (e.type === 'mtext') {
      const lines = String(e.value || '').split('\\P');
      const width = Number(e.width || 0);
      const height = (Number(e.height) || 0) * Math.max(1, lines.length) * 1.2;
      return [e.x, e.y - height, e.x + width, e.y];
    }
    if (e.type === 'polyline' || e.type === 'hatch') { const points = e.points || []; return [safeExtrema(points.map(p => p[0]), 'min', 0), safeExtrema(points.map(p => p[1]), 'min', 0), safeExtrema(points.map(p => p[0]), 'max', 0), safeExtrema(points.map(p => p[1]), 'max', 0)]; }
    if (e.type === 'circle') return [e.x - e.r, e.y - e.r, e.x + e.r, e.y + e.r];
    if (e.type === 'insert') { const block = blocks[e.name]; if (block) return transformBlockBounds(block, e); const w = Math.abs(e.previewW || 120), h = Math.abs(e.previewH || 80); return [e.x - w / 2, e.y - h / 2, e.x + w / 2, e.y + h / 2]; }
    if (e.type === 'dimension') { const gs = (e.graphics || []).map(ge => entityBounds(ge, blocks)); if (gs.length) return [safeExtrema(gs.map(b => b[0]), 'min', 0), safeExtrema(gs.map(b => b[1]), 'min', 0), safeExtrema(gs.map(b => b[2]), 'max', 0), safeExtrema(gs.map(b => b[3]), 'max', 0)]; }
    return [0, 0, 0, 0];
  }
  function bounds(entities, blockLib) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const entity of entities || []) {
      const b = entityBounds(entity, blockLib);
      if (b[0] < minX) minX = b[0];
      if (b[1] < minY) minY = b[1];
      if (b[2] > maxX) maxX = b[2];
      if (b[3] > maxY) maxY = b[3];
    }
    if (!Number.isFinite(minX)) minX = minY = maxX = maxY = 0;
    return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
  }
  function escXml(s) { return String(s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch])); }

  const ACI_HEX = {
    1: '#ff0000',
    2: '#ffff00',
    3: '#00ff00',
    4: '#00ffff',
    5: '#0000ff',
    6: '#ff00ff',
    7: '#000000',
    8: '#808080',
    9: '#c0c0c0',
    10: '#ff0000',
    42: '#ffbf00',
    130: '#00bf00',
    167: '#293189',
    256: null
  };

  function aciColorToHex(color, fallback = '#000000') {
    const n = Number(color);
    if (!Number.isFinite(n) || n === 256 || n === 0) return fallback;
    return ACI_HEX[n] || fallback;
  }

  function entityTrueColorHex(e) {
    if (!e) return null;
    if (typeof e.hexColor === 'string' && /^#?[0-9a-f]{6}$/i.test(e.hexColor)) return e.hexColor.startsWith('#') ? e.hexColor : `#${e.hexColor}`;
    const tc = Number(e.trueColor);
    if (Number.isFinite(tc) && tc >= 0) return `#${(tc & 0xFFFFFF).toString(16).padStart(6, '0')}`;
    if (Array.isArray(e.rgb) && e.rgb.length >= 3) return `#${e.rgb.slice(0,3).map(v => Math.max(0, Math.min(255, Number(v)||0)).toString(16).padStart(2,'0')).join('')}`;
    return null;
  }

  function entityStroke(e, st) {
    const trueHex = entityTrueColorHex(e);
    if (trueHex) return trueHex;
    return aciColorToHex(e && e.color, (st && st.stroke) || '#000000');
  }

  function previewStrokeWidth(value, minimum = 0.55) {
    return Math.max(minimum, (Number(value) || 1) * 0.85);
  }

  function svgPointString(points, isClosed, sx, sy) {
    const pts = Array.isArray(points) ? points.slice() : [];
    if (isClosed && pts.length > 2) {
      const first = pts[0];
      const last = pts[pts.length - 1];
      if (!last || first[0] !== last[0] || first[1] !== last[1]) pts.push(first);
    }
    return pts.map(p => `${sx(p[0])},${sy(p[1])}`).join(' ');
  }

  function previewMTextLines(e) {
    const explicit = String(e.value || '').split('\\P');
    const width = Math.max(1, Number(e.width) || 1000);
    const height = Math.max(1, Number(e.height) || 80);
    const maxChars = Math.max(1, Math.floor(width / (height * 0.62)));
    const result = [];
    explicit.forEach(part => {
      const words = String(part).split(/\s+/).filter(Boolean);
      if (!words.length) { result.push(''); return; }
      let line = '';
      words.forEach(word => {
        const candidate = line ? `${line} ${word}` : word;
        if (candidate.length <= maxChars || !line) line = candidate;
        else { result.push(line); line = word; }
      });
      result.push(line);
    });
    return result.length ? result : [''];
  }


  // V8.4.5: Önizleme/PDF taramaları DXF HATCH ile aynı model-uzayı ölçeğinde üretilir.
  // Önceki 1000x1000 blok yaklaşımı bölgeye non-uniform ölçeklendiği için tuğla ve kumaş
  // desenleri sınır dikdörtgeninin en/boy oranına göre esniyor, DXF ile uyuşmuyordu.
  function legacyHatchInfo(entity) {
    if (!entity || entity.type !== 'insert') return null;
    const name = String(entity.name || '');
    const isWall = name === 'PULUMUR WALL BRICK SAFE HATCH';
    const isFabric = name === 'PULUMUR TRAPEZ SAFE HATCH';
    if (!isWall && !isFabric) return null;
    const sxv = Math.abs(Number(entity.scaleX) || 1);
    const syv = Number(entity.scaleY) || 1;
    const x1 = Number(entity.x) || 0;
    const y1 = Number(entity.y) || 0;
    const x2 = x1 + (entity.mirrorX ? -1 : 1) * 1000 * sxv;
    const y2 = y1 + 1000 * syv;
    return {
      kind: isWall ? 'brick' : 'fabric',
      minX: Math.min(x1, x2), maxX: Math.max(x1, x2),
      minY: Math.min(y1, y2), maxY: Math.max(y1, y2)
    };
  }

  function hatchSegmentsForRect(info) {
    if (!info) return [];
    const minX = Number(info.minX) || 0;
    const maxX = Number(info.maxX) || 0;
    const minY = Number(info.minY) || 0;
    const maxY = Number(info.maxY) || 0;
    if (!(maxX > minX) || !(maxY > minY)) return [];
    const segments = [];
    const eps = 1e-7;
    if (info.kind === 'fabric') {
      const repeat = 150;
      const pairOffset = 42;
      const startN = Math.floor((minX - pairOffset) / repeat) - 1;
      const endN = Math.ceil(maxX / repeat) + 1;
      for (let n = startN; n <= endN; n += 1) {
        const xa = n * repeat;
        const xb = xa + pairOffset;
        if (xa >= minX - eps && xa <= maxX + eps) segments.push({ x1: xa, y1: minY, x2: xa, y2: maxY });
        if (xb >= minX - eps && xb <= maxX + eps) segments.push({ x1: xb, y1: minY, x2: xb, y2: maxY });
      }
      return segments;
    }
    if (info.kind === 'screen') {
      const spacing = 55;
      const mark = 7;
      for (let x = Math.ceil(minX / spacing) * spacing; x <= maxX + eps; x += spacing) {
        for (let y = Math.ceil(minY / spacing) * spacing; y <= maxY + eps; y += spacing) {
          segments.push({ x1: Math.max(minX, x - mark), y1: y, x2: Math.min(maxX, x + mark), y2: y });
          segments.push({ x1: x, y1: Math.max(minY, y - mark), x2: x, y2: Math.min(maxY, y + mark) });
        }
      }
      return segments;
    }

    const course = 190.5;
    const brickWidth = 381;
    const firstCourse = Math.ceil((minY - eps) / course);
    const lastCourse = Math.floor((maxY + eps) / course);
    for (let n = firstCourse; n <= lastCourse; n += 1) {
      const y = n * course;
      if (y > minY + eps && y < maxY - eps) segments.push({ x1: minX, y1: y, x2: maxX, y2: y });
    }
    const firstRow = Math.floor(minY / course);
    const lastRow = Math.ceil(maxY / course) - 1;
    for (let row = firstRow; row <= lastRow; row += 1) {
      const y1 = Math.max(minY, row * course);
      const y2 = Math.min(maxY, (row + 1) * course);
      if (!(y2 > y1 + eps)) continue;
      const parity = ((row % 2) + 2) % 2;
      const offset = parity ? course : 0;
      let x = Math.ceil((minX - offset - eps) / brickWidth) * brickWidth + offset;
      for (; x <= maxX + eps; x += brickWidth) {
        if (x > minX + eps && x < maxX - eps) segments.push({ x1: x, y1, x2: x, y2 });
      }
    }
    return segments;
  }

  function polygonScanlineIntervals(points, axis, value) {
    const clean = (Array.isArray(points) ? points : []).map(point => [Number(point && point[0]), Number(point && point[1])]).filter(point => point.every(Number.isFinite));
    if (clean.length < 3 || !Number.isFinite(Number(value))) return [];
    const intersections = [];
    for (let index = 0; index < clean.length; index += 1) {
      const first = clean[index], second = clean[(index + 1) % clean.length];
      const a = axis === 'x' ? first[0] : first[1];
      const b = axis === 'x' ? second[0] : second[1];
      if (!((a <= value && value < b) || (b <= value && value < a))) continue;
      const ratio = (value - a) / (b - a);
      intersections.push(axis === 'x'
        ? first[1] + (second[1] - first[1]) * ratio
        : first[0] + (second[0] - first[0]) * ratio);
    }
    intersections.sort((left, right) => left - right);
    const unique = intersections.filter((entry, index) => index === 0 || Math.abs(entry - intersections[index - 1]) > 1e-7);
    const intervals = [];
    for (let index = 0; index + 1 < unique.length; index += 2) if (unique[index + 1] - unique[index] > 1e-7) intervals.push([unique[index], unique[index + 1]]);
    return intervals;
  }

  function hatchSegmentsForPolygon(entity) {
    const points = (Array.isArray(entity && entity.points) ? entity.points : []).map(point => [Number(point && point[0]), Number(point && point[1])]).filter(point => point.every(Number.isFinite));
    if (points.length < 3) return [];
    const minX = safeExtrema(points.map(point => point[0]), 'min', 0), maxX = safeExtrema(points.map(point => point[0]), 'max', 0);
    const minY = safeExtrema(points.map(point => point[1]), 'min', 0), maxY = safeExtrema(points.map(point => point[1]), 'max', 0);
    const epsilon = 1e-7, segments = [];
    if (entity.patternKind === 'fabric') {
      const repeat = 150, offsets = [0, 42];
      offsets.forEach(offset => {
        let x = Math.ceil((minX - offset + epsilon) / repeat) * repeat + offset;
        for (; x < maxX - epsilon; x += repeat) polygonScanlineIntervals(points, 'x', x).forEach(interval => segments.push({ x1: x, y1: interval[0], x2: x, y2: interval[1] }));
      });
      return segments;
    }
    if (entity.patternKind === 'screen') {
      const spacing = 55, mark = 7;
      let x = Math.ceil((minX + epsilon) / spacing) * spacing;
      for (; x < maxX - epsilon; x += spacing) {
        polygonScanlineIntervals(points, 'x', x).forEach(interval => {
          let y = Math.ceil((interval[0] + epsilon) / spacing) * spacing;
          for (; y < interval[1] - epsilon; y += spacing) {
            segments.push({ x1: Math.max(minX, x - mark), y1: y, x2: Math.min(maxX, x + mark), y2: y });
            segments.push({ x1: x, y1: Math.max(interval[0], y - mark), x2: x, y2: Math.min(interval[1], y + mark) });
          }
        });
      }
      return segments;
    }
    if (entity.patternKind !== 'brick') return segments;
    const scale = Math.max(0.01, Number(entity.patternScale) || 30);
    const course = 6.35 * scale, brickWidth = 12.7 * scale;
    let y = Math.ceil((minY + epsilon) / course) * course;
    for (; y < maxY - epsilon; y += course) polygonScanlineIntervals(points, 'y', y).forEach(interval => segments.push({ x1: interval[0], y1: y, x2: interval[1], y2: y }));
    const firstRow = Math.floor(minY / course), lastRow = Math.ceil(maxY / course) - 1;
    for (let row = firstRow; row <= lastRow; row += 1) {
      const rowMinY = Math.max(minY, row * course), rowMaxY = Math.min(maxY, (row + 1) * course);
      const parity = ((row % 2) + 2) % 2, offset = parity ? course : 0;
      let x = Math.ceil((minX - offset + epsilon) / brickWidth) * brickWidth + offset;
      for (; x < maxX - epsilon; x += brickWidth) {
        polygonScanlineIntervals(points, 'x', x).forEach(interval => {
          const y1 = Math.max(rowMinY, interval[0]), y2 = Math.min(rowMaxY, interval[1]);
          if (y2 - y1 > epsilon) segments.push({ x1: x, y1, x2: x, y2 });
        });
      }
    }
    return segments;
  }

  function renderSvg(drawing) {
    const ents = (drawing.entities || []).filter(entity => !(entity && entity.hiddenDimension));
    const blockLib = drawing.blocks || { ...getBlocks(), ...customHatchBlocks() };
    const b = bounds(ents, blockLib);
    const pad = 450;
    const minX = b.minX - pad;
    const maxY = b.maxY + pad;
    const viewW = b.width + pad * 2;
    const viewH = b.height + pad * 2;
    const sx = x => x - minX;
    const sy = y => maxY - y;
    const parts = [];
    let hatchSeq = 0;
    const inferDimensionPositionIndex = (entity, edit) => {
      if (Number.isInteger(Number(entity.positionIndex))) return Number(entity.positionIndex);
      if (edit && Number.isInteger(Number(edit.raySystemIndex))) return Number(edit.raySystemIndex);
      const id = String(edit && edit.dimId || '');
      let match = /(?:^|_)pos_(\d+)(?:_|$)/i.exec(id);
      if (match) return Math.max(0, Number(match[1]) - 1);
      match = /^top_system_(\d+)_/i.exec(id);
      if (match) return Math.max(0, Number(match[1]) - 1);
      match = /^top_ray_interval_(\d+)_/i.exec(id);
      if (match) return Math.max(0, Number(match[1]));
      const view = String(edit && edit.view || '').toLowerCase();
      if ((view === 'side' || view === 'right') && edit && Number.isInteger(Number(edit.index))) return Math.max(0, Number(edit.index));
      const systems = drawing && drawing.input && Array.isArray(drawing.input.systems) ? drawing.input.systems : [];
      if (systems.length) {
        const eb = entityBounds(entity, blockLib);
        const cx = (Number(eb[0]) + Number(eb[2])) / 2;
        const found = systems.find(sys => cx >= Number(sys.startX) - 1 && cx <= Number(sys.endX) + 1);
        if (found && Number.isInteger(Number(found.index))) return Number(found.index);
      }
      return -1;
    };
    const dimensionHitMarkup = (entity, cssClass, titleText) => {
      const mainLine = Array.isArray(entity.graphics) ? entity.graphics.find((item, index) => index >= 2 && item && item.type === 'line') : null;
      const textGraphic = Array.isArray(entity.graphics) ? entity.graphics.find(item => item && item.type === 'text') : null;
      const safeTitle = escXml(titleText || 'Ölçü');
      const out = [];
      if (textGraphic) {
        const h = Math.max(28, Number(textGraphic.height) || 90);
        const width = Math.max(h * 1.4, String(textGraphic.value || '').length * h * 0.62);
        const tx = sx(Number(textGraphic.x) || 0) - width / 2;
        const ty = sy(Number(textGraphic.y) || 0) - h * 0.85;
        out.push(`<rect class="${cssClass} dimension-text-hit" x="${tx}" y="${ty}" width="${width}" height="${h * 1.35}" rx="${Math.max(6, h * 0.12)}" fill="transparent" stroke="none" pointer-events="all"><title>${safeTitle}</title></rect>`);
      }
      if (mainLine) {
        out.push(`<line class="${cssClass} dimension-line-hit" x1="${sx(mainLine.x1)}" y1="${sy(mainLine.y1)}" x2="${sx(mainLine.x2)}" y2="${sy(mainLine.y2)}" stroke="transparent" stroke-width="44" stroke-linecap="round" fill="none" pointer-events="stroke"><title>${safeTitle}</title></line>`);
      }
      return out.join('');
    };
    parts.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewW} ${viewH}" preserveAspectRatio="xMidYMid meet" data-model-min-x="${escXml(minX)}" data-model-max-y="${escXml(maxY)}" data-model-padding="${pad}">`);
    parts.push('<rect x="0" y="0" width="100%" height="100%" fill="white"/>');
    for (const [entityIndex, e] of ents.entries()) {
      if (e && e.previewOnly) continue;
      const st = drawing.layerStyle[e.layer] || drawing.layerStyle.OUTLINE;
      const stroke = entityStroke(e, st);
      const sw = previewStrokeWidth(st.width);
      const dash = st.dash ? ` stroke-dasharray="${st.dash}"` : '';
      if (e.type === 'hatch') {
        const hatchSw = e.patternKind === 'brick' ? 0.52 : 0.58;
        const hatchLines = hatchSegmentsForPolygon(e).map(seg => `<line x1="${sx(seg.x1)}" y1="${sy(seg.y1)}" x2="${sx(seg.x2)}" y2="${sy(seg.y2)}" vector-effect="non-scaling-stroke"/>`).join('');
        parts.push(`<g stroke="${stroke}" stroke-width="${hatchSw}" fill="none">${hatchLines}</g>`);
        continue;
      }
      const hatchInfo = legacyHatchInfo(e);
      if (hatchInfo) {
        const clipId = `pulumur-hatch-${hatchSeq++}`;
        const rx = sx(hatchInfo.minX);
        const ry = sy(hatchInfo.maxY);
        const rw = Math.max(0, hatchInfo.maxX - hatchInfo.minX);
        const rh = Math.max(0, hatchInfo.maxY - hatchInfo.minY);
        const hatchSw = hatchInfo.kind === 'brick' ? 0.52 : 0.58;
        parts.push(`<defs><clipPath id="${clipId}"><rect x="${rx}" y="${ry}" width="${rw}" height="${rh}"/></clipPath></defs>`);
        const hatchLines = hatchSegmentsForRect(hatchInfo).map(seg => `<line x1="${sx(seg.x1)}" y1="${sy(seg.y1)}" x2="${sx(seg.x2)}" y2="${sy(seg.y2)}" vector-effect="non-scaling-stroke"/>`).join('');
        parts.push(`<g clip-path="url(#${clipId})" stroke="${stroke}" stroke-width="${hatchSw}" fill="none">${hatchLines}</g>`);
        continue;
      }
      const pointerEvents = e.previewPointerEvents === 'none' ? ' pointer-events="none"' : '';
      if (e.type === 'line') parts.push(`<line${e.layer === 'TABLE' ? ' class="preview-upper-table-entity"' : ''} x1="${sx(e.x1)}" y1="${sy(e.y1)}" x2="${sx(e.x2)}" y2="${sy(e.y2)}" stroke="${stroke}" stroke-width="${sw}"${dash}${pointerEvents} fill="none"/>`);
      else if (e.type === 'polyline') {
        const points = svgPointString(e.points, e.closed, sx, sy);
        parts.push(`<polyline${e.layer === 'TABLE' ? ' class="preview-upper-table-entity"' : ''} points="${points}" stroke="${stroke}" stroke-width="${sw}"${dash}${pointerEvents} fill="none"/>`);
      } else if (e.type === 'text') {
        const anchor = e.align === 'center' ? 'middle' : (e.align === 'right' ? 'end' : 'start');
        const rot = e.rotation ? ` transform="rotate(${-e.rotation} ${sx(e.x)} ${sy(e.y)})"` : '';
        const dimType = e.dimensionFilterType ? String(e.dimensionFilterType) : '';
        const cls = `${dimType ? 'dxf-text preview-dimension-plain' : 'dxf-text'}${(e.layer === 'TABLE' || e.upperTableEntity) ? ' preview-upper-table-entity' : ''}`;
        const dimAttr = dimType ? ` data-dimension-type="${escXml(dimType)}"` : '';
        parts.push(`<text class="${cls}"${dimAttr} x="${sx(e.x)}" y="${sy(e.y)}" font-size="${e.height}" text-anchor="${anchor}" fill="${stroke}"${rot}>${escXml(e.value)}</text>`);
      } else if (e.type === 'mtext') {
        const lines = previewMTextLines(e);
        const anchor = e.align === 'center' ? 'middle' : (e.align === 'right' ? 'end' : 'start');
        const rot = e.rotation ? ` transform="rotate(${-e.rotation} ${sx(e.x)} ${sy(e.y)})"` : '';
        const tspans = lines.map((ln, ii) => `<tspan x="${sx(e.x)}" dy="${ii===0?0:e.height*(e.lineSpacing||1.15)}">${escXml(ln)}</tspan>`).join('');
        parts.push(`<text class="dxf-text${(e.layer === 'TABLE' || e.upperTableEntity) ? ' preview-upper-table-entity' : ''}" x="${sx(e.x)}" y="${sy(e.y)}" font-size="${e.height}" text-anchor="${anchor}" fill="${stroke}"${rot}>${tspans}</text>`);
      } else if (e.type === 'circle') parts.push(`<circle cx="${sx(e.x)}" cy="${sy(e.y)}" r="${Math.abs(e.r)}" stroke="${stroke}" stroke-width="${sw}"${dash}${pointerEvents} fill="none"/>`);
      else if (e.type === 'interaction') {
        const data = e.data || {};
        const attrPairs = [
          ['class', 'preview-interaction-hit'],
          ['data-interaction-type', e.kind || ''],
          ['data-post-index', data.postIndex ?? ''],
          ['data-post-x', data.postX ?? ''],
          ['data-current-post-count', data.postCount ?? ''],
          ['data-total-ray-count', data.totalRayCount ?? ''],
          ['data-placement-mode', data.placementMode || 'standard'],
          ['data-profile-mode', data.profileMode || ''],
          ['data-profile-part', data.part || ''],
          ['data-profile-scope', data.scope || ''],
          ['data-en', data.en ?? ''],
          ['data-boy', data.boy ?? ''],
          ['data-et', data.et ?? ''],
          ['data-side-post-id', data.sidePostId || ''],
          ['data-side-index', data.sideIndex ?? ''],
          ['data-side-view-key', data.sideViewKey || ''],
          ['data-placement-id', data.placementId || ''],
          ['data-product-type', data.productType || ''],
          ['data-placement-view', data.placementView || ''],
          ['data-gap-index', data.gapIndex ?? ''],
          ['data-side-gap-index', data.sideGapIndex ?? ''],
          ['data-horizontal-profile-id', data.horizontalProfileId || ''],
          ['data-zone-id', data.zoneId || ''],
          ['data-profile-view', data.profileView || ''],
          ['data-horizontal-clear-height', data.clearHeight ?? ''],
          ['data-side-zone', data.sideZone || ''],
          ['data-poz-no', data.pozNo || ''],
          ['data-post-extension', data.postExtension ?? ''],
          ['data-track-length-offset', data.trackLengthOffset ?? ''],
          ['data-parapet-view', data.parapetView || ''],
          ['data-parapet-segment-id', data.parapetSegmentId || ''],
          ['data-parapet-segment-index', data.parapetSegmentIndex ?? ''],
          ['data-segment-start', data.segmentStart ?? ''],
          ['data-segment-end', data.segmentEnd ?? ''],
          ['data-segment-height', data.segmentHeight ?? ''],
          ['data-segment-start-height', data.segmentStartHeight ?? ''],
          ['data-segment-end-height', data.segmentEndHeight ?? ''],
          ['data-gutter-minus-x-delta', data.gutterMinusXDelta ?? ''],
          ['data-gutter-plus-x-delta', data.gutterPlusXDelta ?? ''],
          ['data-water-pipe-id', data.waterPipeId || ''], ['data-water-pipe-orientation', data.waterPipeOrientation || ''],
          ['data-water-pipe-diameter', data.waterPipeDiameter ?? ''], ['data-water-pipe-length', data.waterPipeLength ?? ''], ['data-water-pipe-x-offset', data.waterPipeXOffset ?? ''],
          ['data-water-pipe-rail-axis-x', data.waterPipeRailAxisX ?? ''], ['data-water-pipe-system-index', data.waterPipeSystemIndex ?? ''], ['data-water-pipe-ray-index', data.waterPipeRayIndex ?? ''], ['data-water-pipe-side', data.waterPipeSide || ''],
          ['data-table-x', data.tableX ?? ''], ['data-table-y', data.tableY ?? ''], ['data-table-scale-x', data.tableScaleX ?? ''], ['data-table-scale-y', data.tableScaleY ?? ''],
          ['data-table-min-x', data.tableMinX ?? ''], ['data-table-min-y', data.tableMinY ?? ''], ['data-table-max-x', data.tableMaxX ?? ''], ['data-table-max-y', data.tableMaxY ?? ''],
          ['data-side-enabled', data.sideEnabled ? 'true' : 'false'],
          ['data-triangle-division-count', data.triangleDivisionCount ?? ''],
          ['data-wall-x-offset', data.wallXOffset ?? ''],
          ['data-wall-enabled', data.wallEnabled === false ? 'false' : 'true'],
          ['data-wall-cell-enabled', data.wallCellEnabled === false ? 'false' : 'true'],
          ['data-wall-cell-count', data.wallCellCount ?? ''],
          ['data-wall-depth', data.wallDepth ?? ''],
          ['data-wall-height', data.wallHeight ?? ''],
          ['data-wall-segment-id', data.wallSegmentId || ''],
          ['data-wall-segment-index', data.wallSegmentIndex ?? ''],
          ['data-wall-cell-id', data.wallCellId || ''],
          ['data-wall-cell-index', data.wallCellIndex ?? ''],
          ['data-cell-min-x', data.cellMinX ?? ''], ['data-cell-max-x', data.cellMaxX ?? ''],
          ['data-cell-min-y', data.cellMinY ?? ''], ['data-cell-max-y', data.cellMaxY ?? ''],
          ['data-start-near-depth', data.startNearDepth ?? ''], ['data-end-near-depth', data.endNearDepth ?? ''],
          ['data-start-far-depth', data.startFarDepth ?? ''], ['data-end-far-depth', data.endFarDepth ?? ''],
          ['data-wall-min-x', data.wallMinX ?? ''], ['data-wall-max-x', data.wallMaxX ?? ''],
          ['data-wall-min-y', data.wallMinY ?? ''], ['data-wall-max-y', data.wallMaxY ?? ''],
          ['data-system-index', data.systemIndex ?? ''], ['data-bound-min-x', data.boundMinX ?? ''], ['data-bound-max-x', data.boundMaxX ?? ''], ['data-bound-min-y', data.boundMinY ?? ''], ['data-bound-max-y', data.boundMaxY ?? ''],
          ['data-default-bound-min-x', data.defaultBoundMinX ?? ''], ['data-default-bound-max-x', data.defaultBoundMaxX ?? ''],
          ['data-default-bound-min-y', data.defaultBoundMinY ?? ''], ['data-default-bound-max-y', data.defaultBoundMaxY ?? '']
        ];
        const independentGroupId = data.independentGroupId || data.groupId || '';
        if (independentGroupId) {
          attrPairs.push(['data-independent-group-id', independentGroupId], ['data-group-id', data.groupId || independentGroupId]);
        }
        if (data.positionId) attrPairs.push(['data-position-id', data.positionId]);
        if (data.viewId) attrPairs.push(['data-view-id', data.viewId]);
        if (data.viewType) attrPairs.push(['data-view-type', data.viewType]);
        if (data.side) attrPairs.push(['data-side', data.side]);
        if (data.actionType) attrPairs.push(['data-side-action-type', data.actionType]);
        const attrs = attrPairs.map(([k,v]) => `${k}="${escXml(v)}"`).join(' ');
        // Etiket de aynı etkileşime aittir. Veri özniteliklerini kapsayıcı gruba
        // da koymak, özellikle DUVAR ve TS etiketine doğrudan tıklamayı çalıştırır.
        const groupAttrs = attrPairs.filter(([key]) => key !== 'class').map(([k,v]) => `${k}="${escXml(v)}"`).join(' ');
        const rx = sx(e.x), ry = sy(e.y + e.h), rw = Math.abs(e.w), rh = Math.abs(e.h);
        const isGlass = (e.kind || '') === 'glassTrackEditor';
        const isProduct = (e.kind || '') === 'productEditor';
        const isParapet = (e.kind || '') === 'parapetEditor';
        const isGutter = (e.kind || '') === 'gutterEditor';
        const isWaterPipe = (e.kind || '') === 'waterPipeEditor';
        const isUpperTable = (e.kind || '') === 'upperTableEditor';
        const isTopBackWall = (e.kind || '') === 'topBackWallEditor';
        const isSideEnable = (e.kind || '') === 'sideViewEnable';
        const isSideSelector = (e.kind || '') === 'sideViewSelector';
        const isSideEnvelope = (e.kind || '') === 'sideViewEnvelope';
        const isTriangle = (e.kind || '') === 'triangleEditor';
        const isBackWall = (e.kind || '') === 'backWallEditor';
        const isTrapezSheet = (e.kind || '') === 'trapezSheetEditor';
        const isSupport = isGlass && (data.part || '') === 'support';
        const postTag = Number.isFinite(Number(data.postIndex)) ? `D${Number(data.postIndex) + 1}` : 'D';
        const parapetTag = `${(data.parapetView || '').toLowerCase() === 'side' ? 'YP' : ((data.parapetView || '').toLowerCase() === 'top-back-wall' ? 'ÜD' : 'PP')}${Number(data.parapetSegmentIndex || 0) + 1}`;
        const supportSuffix = (data.sideViewKey || data.scope || '').toLowerCase() === 'right' ? 'R' : ((data.sideViewKey || '') === '0' ? 'L' : `P${Number(data.sideIndex || 0) + 1}`);
        const backWallTag = Number(data.wallCellCount || 1) > 1 ? `DP${Number(data.wallCellIndex || 0) + 1}` : 'DUVAR';
        let tag = postTag;
        if (isWaterPipe) tag = 'Fİ70';
        else if (isUpperTable) tag = 'ÜST TABLO';
        else if (isTopBackWall) tag = Number(data.wallCellCount || 1) > 1 ? `ÜD${Number(data.wallCellIndex || 0) + 1}` : 'ÜST DUVAR';
        else if (isGutter) tag = 'OLUK';
        else if (isTrapezSheet) tag = `TS${Number(data.systemIndex || 0) + 1}`;
        else if (isSideEnable) tag = 'YÖN GÖRÜNÜŞ DÜZENLE';
        else if (isSideSelector) tag = data.side === 'right' ? 'SAĞ YAN' : 'SOL YAN';
        else if (isTriangle) tag = 'ÜÇGEN';
        else if (isBackWall) tag = backWallTag;
        else if (isProduct) tag = String(data.pozNo || 'ÜRÜN');
        else if (isParapet) tag = parapetTag;
        else if (isGlass) tag = isSupport ? `SD-${supportSuffix}` : 'CK';

        let groupClass = 'preview-post-zone';
        if (isWaterPipe) groupClass = 'preview-water-pipe-zone';
        else if (isUpperTable) groupClass = 'preview-upper-table-zone';
        else if (isTopBackWall) groupClass = 'preview-wall-zone';
        else if (isGutter) groupClass = 'preview-gutter-zone';
        else if (isTrapezSheet) groupClass = 'preview-trapez-sheet-zone';
        else if (isSideEnable) groupClass = 'preview-side-enable-zone';
        else if (isSideSelector) groupClass = 'preview-side-view-selector-zone';
        else if (isTriangle) groupClass = 'preview-triangle-zone';
        else if (isBackWall) groupClass = 'preview-wall-zone';
        else if (isProduct) groupClass = 'preview-product-zone';
        else if (isParapet) groupClass = 'preview-parapet-zone';
        else if (isGlass) groupClass = 'preview-glass-zone';

        const backWallTitle = Number(data.wallCellCount || 1) > 1 ? `Arka duvar parçasını düzenle ${Number(data.wallCellIndex || 0) + 1}` : 'Arka duvarı düzenle';
        let titleText = `Dikme düzenle ${postTag}`;
        if (isWaterPipe) titleText = 'Fi70 Pipe düzenle';
        else if (isUpperTable) titleText = 'Üst tabloyu taşı / ölçekle';
        else if (isTopBackWall) titleText = 'Üst görünüş arka duvar parçasını düzenle';
        else if (isGutter) titleText = 'Üst görünüş oluğunu düzenle';
        else if (isTrapezSheet) titleText = 'Trapez sac alanını düzenle';
        else if (isSideEnable) titleText = 'Ara poz yan görünüşünü aç / kapat';
        else if (isSideSelector) titleText = 'Yan görünüşün tamamını seç';
        else if (isTriangle) titleText = 'Üçgen doğramayı düzenle';
        else if (isBackWall) titleText = backWallTitle;
        else if (isProduct) titleText = `Mevcut ürünü düzenle ${tag}`;
        else if (isParapet) titleText = `${(data.parapetView || '').toLowerCase() === 'top-back-wall' ? 'Üst görünüş arka duvar' : 'Parapet'} parçasını düzenle ${parapetTag}`;
        else if (isGlass) titleText = isSupport ? `Destek dikmesi profili düzenle (${supportSuffix})` : 'Cam kaydı profili düzenle';

        let tagColor = '#1a73e8';
        if (isWaterPipe) tagColor = '#0369a1';
        else if (isUpperTable) tagColor = '#7c3aed';
        else if (isTopBackWall) tagColor = '#92400e';
        else if (isGutter) tagColor = '#0f766e';
        else if (isTrapezSheet) tagColor = '#d97706';
        else if (isSideEnable) tagColor = data.sideEnabled ? '#15803d' : '#b91c1c';
        else if (isSideSelector) tagColor = '#7c3aed';
        else if (isTriangle) tagColor = '#15803d';
        else if (isBackWall) tagColor = '#6b4f2a';
        else if (isProduct) tagColor = '#7b1fa2';
        else if (isParapet) tagColor = '#c62828';
        else if (isGlass) tagColor = '#0b8043';
        if (isSideEnvelope) {
          parts.push(`<rect class="preview-side-view-envelope" ${groupAttrs} x="${rx}" y="${ry}" width="${rw}" height="${rh}" fill="none" stroke="transparent" stroke-width="3" stroke-dasharray="18 10" pointer-events="none" rx="10" ry="10"/>`);
        } else if (isSideEnable) {
          const fill = data.sideEnabled ? '#22c55e' : '#ef4444';
          const strokeColor = data.sideEnabled ? '#166534' : '#991b1b';
          const textColor = '#ffffff';
          // Model-uzayında buton 600 mm civarında olduğu için ekran üzerinde
          // okunabilir metin yüksekliği 50–72 birim aralığında tutulur.
          const fontSize = Math.max(41, Math.min(71, Math.min(rw / 7.6, rh / 2.45) - 1));
          const lineGap = Math.max(43, fontSize * 0.92);
          const centerX = rx + rw / 2;
          const centerY = ry + rh / 2;
          parts.push(`<g class="${groupClass}" ${groupAttrs}><rect ${attrs} x="${rx}" y="${ry}" width="${rw}" height="${rh}" fill="${fill}" stroke="${strokeColor}" stroke-width="3" pointer-events="all" rx="12" ry="12"><title>${escXml(titleText)}</title></rect><text x="${centerX}" text-anchor="middle" dominant-baseline="middle" font-size="${fontSize}" font-weight="900" fill="${textColor}" pointer-events="none"><tspan x="${centerX}" y="${centerY - lineGap / 2}">YÖN GÖRÜNÜŞ</tspan><tspan x="${centerX}" y="${centerY + lineGap / 2}">DÜZENLE</tspan></text></g>`);
        } else {
          parts.push(`<g class="${groupClass}" ${groupAttrs}><rect ${attrs} x="${rx}" y="${ry}" width="${rw}" height="${rh}" fill="transparent" stroke="transparent" stroke-width="1.2" stroke-dasharray="6 4" pointer-events="all" rx="6" ry="6"><title>${escXml(titleText)}</title></rect><text x="${rx + rw / 2}" y="${Math.max(14, ry - 6)}" text-anchor="middle" font-size="12" font-weight="700" fill="${tagColor}">${escXml(tag)}</text></g>`);
        }
      }
      else if (e.type === 'dimension') {
        const edit = e.edit || null;
        const filterType = String(e.dimensionFilterType || (edit && edit.dimensionType) || 'main').toLowerCase();
        const plainGroup = !edit;
        const previewDimKey = String(e.dimensionId || (edit && edit.dimId) || `preview_dimension_${entityIndex}`);
        const dimensionAxis = String(e.dimensionAxis || 'aligned');
        if (edit) {
          const attrs = [
            ['class', 'editable-dimension'],
            ['data-preview-dim-key', previewDimKey],
            ['data-dimension-axis', dimensionAxis],
            ['data-position-index', inferDimensionPositionIndex(e, edit)],
            ['data-dim-id', e.dimensionId || edit.dimId || ''],
            ['data-edit-field', edit.field || ''],
            ['data-edit-index', edit.index ?? 0],
            ['data-edit-label', edit.label || ''],
            ['data-edit-value', edit.measuredValue ?? e.measuredValue ?? ''],
            ['data-view', edit.view || ''],
            ['data-zone-id', edit.relatedZoneId || edit.zoneId || ''],
            ['data-editable', edit.editable === false ? 'false' : 'true'],
            ['data-dimension-type', edit.dimensionType || 'main'],
            ['data-action-type', edit.actionType || 'main_resize'],
            ['data-can-resize', edit.canResize ? 'true' : 'false'],
            ['data-can-add-same-profile', edit.canAddSameProfile ? 'true' : 'false'],
            ['data-can-add-different-profile', edit.canAddDifferentProfile ? 'true' : 'false'],
            ['data-can-place-product', edit.canPlaceProduct ? 'true' : 'false'],
            ['data-can-remove-element', edit.canRemoveElement ? 'true' : 'false'],
            ['data-passive-reason', edit.passiveReason || ''],
            ['data-profile-instance-id', edit.profileInstanceId || ''],
            ['data-side-gap-index', edit.sideGapIndex ?? 0],
            ['data-horizontal-profile-id', edit.horizontalProfileId || ''],
            ['data-horizontal-anchor-profile-id', edit.horizontalAnchorProfileId || ''],
            ['data-horizontal-move-from', edit.horizontalMoveFrom || ''],
            ['data-horizontal-clear-height', edit.horizontalClearHeight ?? ''],
            ['data-side-post-id', edit.sidePostId || ''],
            ['data-ray-system-index', edit.raySystemIndex ?? ''],
            ['data-ray-interval-index', edit.rayIntervalIndex ?? ''],
            ['data-ray-span-mode', edit.raySpanMode || ''],
            ['data-parapet-view', edit.parapetView || ''],
            ['data-parapet-segment-id', edit.parapetSegmentId || ''],
            ['data-parapet-segment-index', edit.parapetSegmentIndex ?? ''],
            ['data-segment-start', edit.segmentStart ?? ''],
            ['data-segment-end', edit.segmentEnd ?? ''],
            ['data-side-index', edit.sideIndex ?? ''],
            ['data-side-view-key', edit.sideViewKey || ''],
            ['data-layer', e.layer || 'DIM']
          ].map(([k,v]) => `${k}="${escXml(v)}"`).join(' ');
          parts.push(`<g ${attrs}>`);
        } else if (plainGroup) {
          parts.push(`<g class="preview-dimension-plain" data-preview-dim-key="${escXml(previewDimKey)}" data-dim-id="${escXml(e.dimensionId || previewDimKey)}" data-edit-label="Ölçü" data-edit-value="${escXml(Math.round(Number(e.measuredValue) || 0))}" data-editable="false" data-layer="${escXml(e.layer || 'DIM')}" data-dimension-axis="${escXml(dimensionAxis)}" data-dimension-type="${escXml(filterType)}" data-position-index="${inferDimensionPositionIndex(e, null)}">`);
        }
        (e.graphics || []).forEach(ge => {
          const gst = drawing.layerStyle[ge.layer] || drawing.layerStyle.DIM;
          const gstroke = entityStroke(ge, gst);
          const gsw = previewStrokeWidth(gst.width || sw, 0.24);
          if (ge.type === 'line') parts.push(`<line x1="${sx(ge.x1)}" y1="${sy(ge.y1)}" x2="${sx(ge.x2)}" y2="${sy(ge.y2)}" stroke="${gstroke}" stroke-width="${gsw}" fill="none"/>`);
          else if (ge.type === 'polyline') {
            const points = svgPointString(ge.points, ge.closed, sx, sy);
            parts.push(`<polyline${e.layer === 'TABLE' ? ' class="preview-upper-table-entity"' : ''} points="${points}" stroke="${gstroke}" stroke-width="${gsw}" fill="none"/>`);
          } else if (ge.type === 'text') {
            const anchor = ge.align === 'center' ? 'middle' : (ge.align === 'right' ? 'end' : 'start');
            const rot = ge.rotation ? ` transform="rotate(${-ge.rotation} ${sx(ge.x)} ${sy(ge.y)})"` : '';
            parts.push(`<text class="dxf-text" x="${sx(ge.x)}" y="${sy(ge.y)}" font-size="${ge.height}" text-anchor="${anchor}" fill="${gstroke}"${rot}>${escXml(ge.value)}</text>`);
          }
        });
        if (edit) {
          const titleText = edit.editable === false ? (edit.passiveReason || 'Bilgi amaçlı ölçü') : ((edit.label || 'Ölçü') + ' değiştir');
          parts.push(`${dimensionHitMarkup(e, 'editable-dimension-hit', titleText)}</g>`);
        } else if (plainGroup) {
          parts.push(`${dimensionHitMarkup(e, 'preview-dimension-drag-hit', 'Ölçüyü seç veya sürükle')}</g>`);
        }
      } else if (e.type === 'insert') {
        const block = blockLib[e.name];
        if (block) {
          const group = [];
          (block.entities || []).forEach(be => {
            const insertStyle = drawing.layerStyle[e.layer] || drawing.layerStyle.BLOCKREF;
            const ownStyle = drawing.layerStyle[be.layer] || insertStyle;
            const byBlock = Number(be.color) === 0;
            const bst = byBlock ? insertStyle : ownStyle;
            const inheritedStroke = entityStroke(e, insertStyle);
            const bstroke = byBlock ? inheritedStroke : entityStroke(be, ownStyle);
            const bsw = previewStrokeWidth(bst.width || 2, 0.24);
            if (be.type === 'line') {
              const p1 = transformLocalPoint(be.x1, be.y1, e), p2 = transformLocalPoint(be.x2, be.y2, e);
              group.push(`<line x1="${sx(p1[0])}" y1="${sy(p1[1])}" x2="${sx(p2[0])}" y2="${sy(p2[1])}" stroke="${bstroke}" stroke-width="${bsw}" fill="none"/>`);
            } else if (be.type === 'polyline') {
              const points = svgPointString((be.points || []).map(p => transformLocalPoint(p[0], p[1], e)), be.closed, sx, sy);
              group.push(`<polyline points="${points}" stroke="${bstroke}" stroke-width="${bsw}" fill="none"/>`);
            } else if (be.type === 'circle') {
              const p = transformLocalPoint(be.x, be.y, e);
              const rr = Math.abs(be.r * ((Number(e.scaleX || 1) + Number(e.scaleY || 1)) / 2));
              group.push(`<circle cx="${sx(p[0])}" cy="${sy(p[1])}" r="${rr}" stroke="${bstroke}" stroke-width="${bsw}" fill="none"/>`);
            } else if (be.type === 'hatch') {
              const transformedHatch = {
                ...be,
                points: (be.points || []).map(point => transformLocalPoint(point[0], point[1], e))
              };
              const hatchSw = be.patternKind === 'brick' ? 0.52 : 0.58;
              hatchSegmentsForPolygon(transformedHatch).forEach(segment => {
                group.push(`<line x1="${sx(segment.x1)}" y1="${sy(segment.y1)}" x2="${sx(segment.x2)}" y2="${sy(segment.y2)}" stroke="${bstroke}" stroke-width="${hatchSw}" vector-effect="non-scaling-stroke" fill="none"/>`);
              });
            } else if (be.type === 'text' || be.type === 'mtext') {
              const p = transformLocalPoint(be.x || 0, be.y || 0, e);
              const anchor = be.align === 'center' ? 'middle' : (be.align === 'right' ? 'end' : 'start');
              const rotDeg = Number(be.rotation || 0) + Number(e.rotation || 0);
              const rot = rotDeg ? ` transform="rotate(${-rotDeg} ${sx(p[0])} ${sy(p[1])})"` : '';
              const scaleAvg = ((Math.abs(Number(e.scaleX || 1)) + Math.abs(Number(e.scaleY || 1))) / 2);
              const h = Math.abs((Number(be.height) || 24) * scaleAvg);
              const lines = be.type === 'mtext' ? previewMTextLines(be) : [String(be.value || '')];
              const tspans = lines.map((ln, ii) => `<tspan x="${sx(p[0])}" dy="${ii===0?0:h*(be.lineSpacing||1.15)}">${escXml(ln)}</tspan>`).join('');
              group.push(`<text class="dxf-text" x="${sx(p[0])}" y="${sy(p[1])}" font-size="${h}" text-anchor="${anchor}" fill="${bstroke}"${rot}>${tspans}</text>`);
            }
          });
          parts.push(`<g data-block="${escXml(e.name)}">${group.join('')}</g>`);
        } else {
          const w = Math.abs(e.previewW || 120), h = Math.abs(e.previewH || 80), cx = sx(e.x), cy = sy(e.y);
          const rot = e.rotation ? ` transform="rotate(${-e.rotation} ${cx} ${cy})"` : '';
          parts.push(`<g${rot}><rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" stroke="${stroke}" stroke-width="${sw}"${dash} fill="none"/></g>`);
        }
      }
    }
    parts.push('</svg>');
    return parts.join('\n');
  }


  function flattenDrawingForExport(drawing) {
    const blockLib = drawing.blocks || { ...getBlocks(), ...customHatchBlocks() };
    const out = [];
    const push = e => out.push(e);
    const expand = (e, inheritedLayer) => {
      if (!e || e.previewOnly || e.hiddenDimension || e.type === 'interaction') return;
      const layer = e.layer || inheritedLayer || 'OUTLINE';
      if (e.type === 'dimension') {
        (e.graphics || []).forEach(ge => expand(ge, layer));
        return;
      }
      if (e.type === 'hatch') {
        hatchSegmentsForPolygon(e).forEach(seg => push({ type: 'line', layer, color: e.color, x1: seg.x1, y1: seg.y1, x2: seg.x2, y2: seg.y2 }));
        return;
      }
      if (e.type === 'insert') {
        const hatchInfo = legacyHatchInfo(e);
        if (hatchInfo) {
          hatchSegmentsForRect(hatchInfo).forEach(seg => push({ type: 'line', layer, color: e.color, x1: seg.x1, y1: seg.y1, x2: seg.x2, y2: seg.y2 }));
          return;
        }
        const block = blockLib[e.name];
        if (!block) {
          const w = Math.abs(e.previewW || 120), h = Math.abs(e.previewH || 80);
          push({ type: 'polyline', layer, closed: true, points: [[e.x - w / 2, e.y - h / 2], [e.x + w / 2, e.y - h / 2], [e.x + w / 2, e.y + h / 2], [e.x - w / 2, e.y + h / 2]] });
          return;
        }
        (block.entities || []).forEach(be => {
          const beLayer = layer || be.layer || 'BLOCKREF';
          if (be.type === 'line') {
            const p1 = transformLocalPoint(be.x1, be.y1, e), p2 = transformLocalPoint(be.x2, be.y2, e);
            push({ type: 'line', layer: beLayer, color: be.color, x1: p1[0], y1: p1[1], x2: p2[0], y2: p2[1] });
          } else if (be.type === 'polyline') {
            const pts = (be.points || []).map(p => transformLocalPoint(p[0], p[1], e));
            push({ type: 'polyline', layer: beLayer, color: be.color, closed: !!be.closed, points: pts });
          } else if (be.type === 'circle') {
            const p = transformLocalPoint(be.x, be.y, e);
            const rr = Math.abs(be.r * ((Number(e.scaleX || 1) + Number(e.scaleY || 1)) / 2));
            push({ type: 'circle', layer: beLayer, color: be.color, x: p[0], y: p[1], r: rr });
          } else if (be.type === 'hatch' && be.patternKind === 'screen') {
            const transformedHatch = {
              ...be,
              points: (be.points || []).map(point => transformLocalPoint(point[0], point[1], e))
            };
            hatchSegmentsForPolygon(transformedHatch).forEach(segment => push({
              type: 'line', layer: be.layer || beLayer, color: be.color,
              x1: segment.x1, y1: segment.y1, x2: segment.x2, y2: segment.y2
            }));
          } else if (be.type === 'text' || be.type === 'mtext') {
            const p = transformLocalPoint(be.x || 0, be.y || 0, e);
            push({ ...be, layer: beLayer, color: be.color, x: p[0], y: p[1], height: Math.abs((Number(be.height) || 100) * ((Number(e.scaleX || 1) + Math.abs(Number(e.scaleY || 1))) / 2)), rotation: (Number(be.rotation || 0) + Number(e.rotation || 0)) });
          }
        });
        return;
      }
      if (e.type === 'line') push({ type: 'line', layer, color: e.color, x1: e.x1, y1: e.y1, x2: e.x2, y2: e.y2 });
      else if (e.type === 'polyline') push({ type: 'polyline', layer, color: e.color, closed: !!e.closed, points: (e.points || []).map(p => [p[0], p[1]]) });
      else if (e.type === 'circle') push({ type: 'circle', layer, color: e.color, x: e.x, y: e.y, r: e.r });
      else if (e.type === 'text' || e.type === 'mtext') push({ ...e, layer });
    };
    (drawing.entities || []).forEach(e => expand(e));
    return { entities: out, bounds: bounds(out), layerStyle: drawing.layerStyle || LAYER_STYLE };
  }

  const api = { SAMPLE_INPUT, LAYER_STYLE, K, BUILD_LABEL, DIMENSION_EDIT_RULES, DIMENSION_ACTIONS, PROFILE_LIBRARY, PRODUCT_LIBRARY, normalizeInput, normalizeSlidingPlacement, normalizeGuillotinePlacement, normalizeZipScreenPlacement, buildSlidingBlockDefinition, buildGuillotineBlockDefinition, buildZipScreenBlockDefinition, normalizeRearSupport, buildDrawing, renderSvg, flattenDrawingForExport, bounds, formatMm, formatDeg, parapetAngleDegrees, parapetDisplayAngleDegrees, parapetModelAngleDegrees, resolveParapetEndHeight, alignParapetNeighborEndpoints, parapetDimensionStations, sanitizeSignedDecimalInput, trapezSheetExtensions, trapezSheetBoundsFromExtensions, trapezSheetEditorAxisState, trapezSheetEditorState, trapezSheetBoundsFromEditor, rayLenFor, sideAngleRadFor, getBlocks, upperTableValueWrapInfo, wrapTextForUpperInput, normalizeExtrasText, EXTRAS_MAX_LINES, EXTRAS_MAX_CHARS, aciColorToHex };
  root.PulumurGeometry = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
