(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.PulumurProductPresentation = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  // Presentation only. Never use these labels as routing, save or entitlement IDs.
  const PRODUCTS = Object.freeze({
    PERGO_RISE: Object.freeze({ tr: 'Pergola', en: 'Pergola' }),
    P3DV_ROLLING_ROOF: Object.freeze({ tr: 'Rolling Roof', en: 'Rolling Roof' }),
    P3DV_BIOCLIMATIC: Object.freeze({ tr: 'Bioclimatic', en: 'Bioclimatic' }),
    P3DV_ECO_BIOCLIMATIC: Object.freeze({ tr: 'Eco-Bioclimatic', en: 'Eco-Bioclimatic' }),
    SLIDING: Object.freeze({ tr: 'Sürme', en: 'Sliding' }),
    GUILLOTINE: Object.freeze({ tr: 'Giyotin', en: 'Guillotine' }),
    ZIP_SCREEN: Object.freeze({ tr: 'Zip Perde', en: 'Zip Screen' }),
    DOOR: Object.freeze({ tr: 'Kapı', en: 'Door' }),
    FIXED_JOINERY: Object.freeze({ tr: 'Sabit Doğrama', en: 'Fixed Glazing' }),
    FOLDING_GLASS: Object.freeze({ tr: 'Akordiyon Cam', en: 'Accordion Glass' })
  });
  const ALIASES = Object.freeze({
    'pergo rise': 'PERGO_RISE', 'pergo-rise': 'PERGO_RISE', pergorise: 'PERGO_RISE', peri01: 'PERGO_RISE', pergola: 'PERGO_RISE',
    'b-cube': 'P3DV_ROLLING_ROOF', bcube_freedom: 'P3DV_ROLLING_ROOF', 'b-cube freedom': 'P3DV_ROLLING_ROOF', 'b cube freedom': 'P3DV_ROLLING_ROOF', freedom: 'P3DV_ROLLING_ROOF', 'rolling roof': 'P3DV_ROLLING_ROOF', 'rolling roof (retractable)': 'P3DV_ROLLING_ROOF',
    'b-cube-galaxy': 'P3DV_BIOCLIMATIC', 'b-cube galaxy': 'P3DV_BIOCLIMATIC', 'b cube galaxy': 'P3DV_BIOCLIMATIC', galaxy: 'P3DV_BIOCLIMATIC', bioclimatic: 'P3DV_BIOCLIMATIC', 'bioclimatic (tilt)': 'P3DV_BIOCLIMATIC',
    'bio-rise': 'P3DV_ECO_BIOCLIMATIC', 'bio rise': 'P3DV_ECO_BIOCLIMATIC', biorise: 'P3DV_ECO_BIOCLIMATIC', 'eco-bioclimatic': 'P3DV_ECO_BIOCLIMATIC', 'eco-bioclimatic (tilt)': 'P3DV_ECO_BIOCLIMATIC'
  });
  const LEGACY_NAMES = /(^|[^\p{L}\p{N}_])((?:b[ -]*cube[ -]+)?galaxy|(?:b[ -]*cube[ -]+)?freedom|pergo[ -]*rise|bio[ -]*rise)(?![\p{L}\p{N}_])/giu;

  function text(value) {
    return String(value == null ? '' : value).replace(LEGACY_NAMES, (_, prefix, label) => {
      const key = ALIASES[label.toLowerCase().replace(/ +/g, ' ')]
        || (/galaxy/i.test(label) ? 'P3DV_BIOCLIMATIC' : /freedom/i.test(label) ? 'P3DV_ROLLING_ROOF' : /^pergo/i.test(label) ? 'PERGO_RISE' : 'P3DV_ECO_BIOCLIMATIC');
      const display = PRODUCTS[key].en;
      return prefix + (label === label.toUpperCase() ? display.toUpperCase() : display);
    });
  }

  function name(value, language = 'tr') {
    const raw = String(value == null ? '' : value).trim();
    const key = Object.prototype.hasOwnProperty.call(PRODUCTS, raw.toUpperCase()) ? raw.toUpperCase()
      : Object.prototype.hasOwnProperty.call(ALIASES, raw.toLowerCase()) ? ALIASES[raw.toLowerCase()] : null;
    return key ? PRODUCTS[key][language === 'en' ? 'en' : 'tr'] : text(raw);
  }

  function moduleName(value, language = 'tr') {
    const raw = String(value == null ? '' : value);
    if (raw === 'Standalone') return language === 'en' ? 'Standalone Drawing' : 'Bağımsız Çizim';
    if (raw === 'Free') return language === 'en' ? 'Free Drawing' : 'Serbest Çizim';
    return language === 'en' ? raw : raw.replace(/^Module (\d+)$/, 'Modül $1');
  }

  function entityText(entity) {
    const value = String(entity && entity.value != null ? entity.value : '');
    // Customer/project names, notes and third-party annotations are verbatim.
    // Only a label explicitly owned by the product generator may be renamed.
    return entity && entity.presentationRole === 'product-name' ? text(value) : value;
  }

  function drawing(source) {
    // SVG presentation only. PDF/DXF format at the final text-writing boundary
    // so their text measurements, scale and extents keep the original contract.
    if (!source || typeof source !== 'object') return source;
    const presentEntity = entity => {
      if (!entity || !['text', 'mtext'].includes(entity.type) || entity.presentationRole !== 'product-name') return entity;
      const value = entityText(entity);
      if (value === entity.value) return entity;
      // Preserve non-enumerable interaction/table metadata as well as geometry.
      const descriptors = Object.getOwnPropertyDescriptors(entity);
      descriptors.value = { ...descriptors.value, value };
      if (typeof entity.dxfCellText === 'string') descriptors.dxfCellText = { ...descriptors.dxfCellText, value: text(entity.dxfCellText) };
      return Object.create(Object.getPrototypeOf(entity), descriptors);
    };
    const presentEntities = entities => Array.isArray(entities) ? entities.map(presentEntity) : entities;
    const blocks = source.blocks && Object.fromEntries(Object.entries(source.blocks).map(([id, block]) =>
      [id, block && typeof block === 'object' ? { ...block, entities: presentEntities(block.entities) } : block]));
    return { ...source, entities: presentEntities(source.entities), ...(blocks ? { blocks } : {}) };
  }

  return Object.freeze({ PRODUCTS, name, text, moduleName, entityText, drawing });
});
