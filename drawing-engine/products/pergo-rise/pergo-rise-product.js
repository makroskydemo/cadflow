(function (root) {
  'use strict';

  const PRODUCT_ID = 'pergo-rise-3d-v1';
  const PROJECT_SCHEMA = 'p3dv-parametric-product-v1';
  const ASSEMBLY_SCHEMA = 'p3dv-static-assembly-v1';

  const DEFAULT_RAW = Object.freeze(root.P3DVPergoRiseInput
    ? root.P3DVPergoRiseInput.clone(root.P3DVPergoRiseInput.DEFAULT_INPUT)
    : {
        product: 'Pergo Rise', moduleName: 'Module 1', engine: 'Web DXF',
        customer: '', project: '', version: '01', drawnBy: 'AYETULLAH KILINC', date: '',
        systemCount: '', width: '', opening: '', rearHeight: '', frontHeight: '', rayCount: '', postCount: '',
        parapet: 'HAYIR', parapetHeight: '-', glassTrack: 'HAYIR', glassRayBoundaryMode: 'DARALT', sideTrack: 'HAYIR',
        structureColor: '-', fabric: '-', fabricProfiles: '-', motor: '-', remote: '-', led: '-', dimmer: '-', extras: '-',
        triangleJoinery: 'HAYIR', waterStandard: 'EVET', waterOutletPlacement: 'BOTH',
        __rearSupport: { type: 'wall' },
        __backWallState: { left: { enabled: true, xOffset: 0, depth: 600, height: 0 }, right: { enabled: true, xOffset: 0, depth: 600, height: 0 }, middle: {} },
        __backWallSegments: { side: {} },
        __backWallGridState: { side: {} },
        __topBackWallSegments: {},
        __topBackWallGridState: {},
        __gutterEditState: { minusXDelta: 0, plusXDelta: 0, groups: {} },
    __editingState: { schema: 'p3dv-pergo-rise-editing-v3', revision: 0, selectedTargetId: null, lastChangedPaths: [], areaProfileOrigins: {}, history: [] }
      });

  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function asText(value, fallback) {
    const text = String(value === undefined || value === null ? '' : value).trim();
    return text || String(fallback === undefined ? '' : fallback);
  }
  function stableStringify(value) {
    if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
    if (value && typeof value === 'object') {
      return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
    }
    return JSON.stringify(value);
  }
  function hashString(text) {
    let hash = 2166136261;
    for (let i = 0; i < text.length; i += 1) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return `fnv1a-${(hash >>> 0).toString(16).padStart(8, '0')}`;
  }

  function normalizeRaw(raw, options) {
    if (root.P3DVPergoRiseInput && typeof root.P3DVPergoRiseInput.recalculate === 'function') {
      return root.P3DVPergoRiseInput.recalculate(raw, options && options.ownership).input;
    }
    const source = { ...clone(DEFAULT_RAW), ...(raw || {}) };
    source.systemCount = asText(source.systemCount, '');
    source.width = asText(source.width, '');
    source.opening = asText(source.opening, '');
    source.rearHeight = asText(source.rearHeight, '');
    source.frontHeight = asText(source.frontHeight, '');
    source.rayCount = String(source.rayCount || '').trim();
    source.postCount = String(source.postCount || '').trim();
    source.__rearSupport = source.__rearSupport && typeof source.__rearSupport === 'object'
      ? clone(source.__rearSupport) : { type: 'wall' };
    source.__backWallState = source.__backWallState && typeof source.__backWallState === 'object'
      ? clone(source.__backWallState) : clone(DEFAULT_RAW.__backWallState || {});
    source.__backWallSegments = source.__backWallSegments && typeof source.__backWallSegments === 'object'
      ? clone(source.__backWallSegments) : { side: {} };
    source.__backWallGridState = source.__backWallGridState && typeof source.__backWallGridState === 'object'
      ? clone(source.__backWallGridState) : { side: {} };
    source.__topBackWallSegments = source.__topBackWallSegments && typeof source.__topBackWallSegments === 'object'
      ? clone(source.__topBackWallSegments) : {};
    source.__topBackWallGridState = source.__topBackWallGridState && typeof source.__topBackWallGridState === 'object'
      ? clone(source.__topBackWallGridState) : {};
    source.__gutterEditState = source.__gutterEditState && typeof source.__gutterEditState === 'object'
      ? clone(source.__gutterEditState) : { minusXDelta: 0, plusXDelta: 0, groups: {} };
    source.__editingState = root.P3DVPergoRiseEditing ? root.P3DVPergoRiseEditing.normalizeState(source.__editingState)
      : (source.__editingState && typeof source.__editingState === 'object' ? clone(source.__editingState) : clone(DEFAULT_RAW.__editingState || {}));
    return source;
  }

  function createDraft(raw, options) {
    if (root.P3DVPergoRiseInput && typeof root.P3DVPergoRiseInput.createDraft === 'function') {
      return root.P3DVPergoRiseInput.createDraft(raw, options || {});
    }
    const input = normalizeRaw(raw, options);
    return { schema: 'p3dv-pergo-rise-input-v1', productId: PRODUCT_ID, input, ownership: { rayCount: false, postCount: false }, calculated: {}, missing: [], valid: false, errors: [] };
  }

  function create(raw, options) {
    if (!root.PulumurGeometry || typeof root.PulumurGeometry.normalizeInput !== 'function') {
      throw new Error('PLMR Pergola geometry runtime is not loaded.');
    }
    const input = normalizeRaw(raw, options);
    const normalized = root.PulumurGeometry.normalizeInput(input);
    const project = {
      schema: PROJECT_SCHEMA,
      productId: PRODUCT_ID,
      staticState: 'STATIC_OPEN_REAR_STACKED',
      source: {
        projectModel: 'PLMR Pergo Rise Project Model',
        rules: 'PLMR.V.13.92(1)/peri01Geometry.js',
        multiPositionRules: 'PLMR.V.13.92(1)/core/multiPositionRules.js'
      },
      input,
      ownership: root.P3DVPergoRiseInput && typeof root.P3DVPergoRiseInput.normalizeOwnership === 'function'
        ? root.P3DVPergoRiseInput.normalizeOwnership(options && options.ownership) : { rayCount: !!(options && options.ownership && options.ownership.rayCount), postCount: !!(options && options.ownership && options.ownership.postCount) },
      normalized,
      editing: root.P3DVPergoRiseEditing ? root.P3DVPergoRiseEditing.buildCanonical(input, normalized, []) : null
    };
    project.hash = hashString(stableStringify({ input, normalized: {
      systems: normalized.systems,
      positions: normalized.positions,
      postCenterXs: normalized.postCenterXs,
      frontPostWidths: normalized.frontPostWidths,
      frontPostProfiles: normalized.frontPostProfiles,
      frontPostExtensions: normalized.frontPostExtensions,
      manualPostPlacementMode: normalized.manualPostPlacementMode,
      customFrontPostCenters: normalized.customFrontPostCenters,
      parapetSegments: normalized.parapetSegments,
      independentPergoRiseGroups: normalized.independentPergoRiseGroups,
      rearSupport: normalized.rearSupport,
      backWallState: normalized.backWallState,
      backWallSegments: normalized.backWallSegments,
      backWallGridState: normalized.backWallGridState,
      topBackWallSegments: normalized.topBackWallSegments,
      topBackWallGridState: normalized.topBackWallGridState,
      gutterEditState: normalized.gutterEditState,
      editingState: input.__editingState
    } }));
    return project;
  }

  function serialize(project) {
    if (!project || project.schema !== PROJECT_SCHEMA || project.productId !== PRODUCT_ID) {
      throw new Error('Pergola proje şeması geçersiz.');
    }
    return JSON.stringify({
      schema: PROJECT_SCHEMA,
      productId: PRODUCT_ID,
      staticState: project.staticState || 'STATIC_OPEN_REAR_STACKED',
      source: clone(project.source || {}),
      input: clone(project.input || {}),
      ownership: clone(project.ownership || { rayCount: false, postCount: false }),
      hash: String(project.hash || '')
    });
  }

  function load(serialized) {
    const saved = typeof serialized === 'string' ? JSON.parse(serialized) : clone(serialized || {});
    if (saved.schema !== PROJECT_SCHEMA || saved.productId !== PRODUCT_ID || !saved.input) {
      throw new Error('Kaydedilmiş Pergola projesi uyumlu değil.');
    }
    const project = create(saved.input, { ownership: saved.ownership || { rayCount: false, postCount: false } });
    const savedHash = String(saved.hash || '');
    return {
      project,
      savedHash,
      currentHash: project.hash,
      stale: Boolean(savedHash && savedHash !== project.hash)
    };
  }

  root.P3DVPergoRiseProduct = Object.freeze({
    PRODUCT_ID,
    PROJECT_SCHEMA,
    ASSEMBLY_SCHEMA,
    DEFAULT_RAW,
    create,
    createDraft,
    serialize,
    load,
    normalizeRaw,
    stableStringify,
    hashString
  });
  if (typeof module !== 'undefined') module.exports = root.P3DVPergoRiseProduct;
})(typeof window !== 'undefined' ? window : globalThis);
