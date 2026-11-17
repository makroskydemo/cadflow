(function (root) {
  'use strict';

  const CONTRACT_SCHEMA = 'plmr-product-runtime-contract-v2';
  const products = new Map();
  const aliases = new Map();
  const REQUIRED_METHODS = [
    'createDefaultProject',
    'validateProject',
    'migrateProject',
    'buildStandaloneGeometry',
    'buildPlacementGeometry',
    'renderPreview',
    'serializeProject',
    'deserializeProject',
    'exportDxf',
    'exportPdf'
  ];
  const DEFAULT_CAPABILITIES = Object.freeze({
    standaloneDrawing: false,
    isolatedApp: false,
    placementInsidePergoRise: false,
    svg: false,
    dxf: false,
    pdf: false,
    plmr: false,
    cloud: false
  });

  function canonicalId(value) {
    return String(value || '').trim().toUpperCase().replace(/[^A-Z0-9ÇĞİÖŞÜ]+/g, '_').replace(/^_+|_+$/g, '');
  }

  function normalizeNavigation(value) {
    const source = value || {};
    return Object.freeze({
      route: source.route ? String(source.route) : '',
      queryParameter: source.queryParameter ? String(source.queryParameter) : '',
      moduleName: String(source.moduleName || 'Module 1'),
      engineName: String(source.engineName || 'Web DXF'),
      opensDedicatedPage: Boolean(source.opensDedicatedPage)
    });
  }

  function normalizeManifest(adapter, id) {
    const aliasesValue = Array.from(new Set([id, ...(adapter.aliases || [])].map(String)));
    const projectSchemas = Array.from(new Set((adapter.projectSchemas || []).map(String).filter(Boolean)));
    const capabilities = Object.freeze({ ...DEFAULT_CAPABILITIES, ...(adapter.capabilities || {}) });
    return Object.freeze({
      schema: CONTRACT_SCHEMA,
      contractVersion: 2,
      id,
      label: String(adapter.label),
      executionMode: String(adapter.executionMode || (capabilities.isolatedApp ? 'ISOLATED_APP' : 'IN_PROCESS_ADAPTER')).toUpperCase(),
      schemaVersion: Math.max(1, Number(adapter.schemaVersion) || 1),
      aliases: Object.freeze(aliasesValue),
      legacyProductTypes: Object.freeze(Array.from(new Set((adapter.legacyProductTypes || adapter.aliases || []).map(String)))),
      projectSchemas: Object.freeze(projectSchemas),
      capabilities,
      navigation: normalizeNavigation(adapter.navigation)
    });
  }

  function assertAdapter(adapter) {
    if (!adapter || typeof adapter !== 'object') throw new TypeError('Product adapter nesnesi gerekli.');
    const id = canonicalId(adapter.id);
    if (!id) throw new Error('Product adapter id gerekli.');
    if (!adapter.label) throw new Error(`${id} için label gerekli.`);
    REQUIRED_METHODS.forEach(method => {
      if (typeof adapter[method] !== 'function') throw new Error(`${id} adapter ${method} fonksiyonunu sağlamalı.`);
    });
    return id;
  }

  function registerProduct(adapter) {
    const id = assertAdapter(adapter);
    if (products.has(id)) throw new Error(`Product adapter zaten kayıtlı: ${id}`);
    const manifest = normalizeManifest(adapter, id);
    const frozen = Object.freeze({
      ...adapter,
      id,
      schemaVersion: manifest.schemaVersion,
      capabilities: manifest.capabilities,
      manifest
    });
    manifest.aliases.forEach(alias => {
      const key = canonicalId(alias);
      const owner = aliases.get(key);
      if (owner && owner !== id) throw new Error(`PRODUCT_ALIAS_CONFLICT:${key}:${owner}:${id}`);
    });
    products.set(id, frozen);
    manifest.aliases.forEach(alias => aliases.set(canonicalId(alias), id));
    return frozen;
  }

  function resolveId(value) {
    const key = canonicalId(value);
    return aliases.get(key) || key;
  }

  function migrateProductType(value, fallback) {
    const key = canonicalId(value);
    const fallbackId = resolveId(fallback || '');
    const fallbackAdapter = fallbackId ? products.get(fallbackId) : null;
    // Legacy project labels are contextual migration hints, not global routing aliases.
    // This is important for historical names such as "B-Cube Freedom": in the
    // current shell that label routes to Rolling Roof, while an explicitly opened
    // bcube-freedom-project-v1 must still migrate inside the legacy standalone app.
    if (fallbackAdapter && fallbackAdapter.manifest && fallbackAdapter.manifest.legacyProductTypes.some(item => canonicalId(item) === key)) return fallbackAdapter.id;
    const resolved = resolveId(value);
    if (products.has(resolved)) return resolved;
    if (fallbackAdapter) return fallbackAdapter.id;
    return resolved;
  }

  function getProduct(value) {
    return products.get(resolveId(value)) || null;
  }

  function requireProduct(value) {
    const adapter = getProduct(value);
    if (!adapter) throw new Error(`Kayıtlı olmayan ürün: ${value}`);
    return adapter;
  }

  function getManifest(value) {
    const adapter = getProduct(value);
    return adapter ? adapter.manifest : null;
  }

  function listProducts(options) {
    const source = options || {};
    return Array.from(products.values()).filter(adapter => {
      if (source.capability && adapter.capabilities[source.capability] !== true) return false;
      if (source.executionMode && adapter.manifest.executionMode !== String(source.executionMode).toUpperCase()) return false;
      return true;
    });
  }

  function listManifests(options) {
    return listProducts(options).map(adapter => adapter.manifest);
  }

  function supports(value, capability) {
    const adapter = getProduct(value);
    return !!(adapter && adapter.capabilities && adapter.capabilities[capability] === true);
  }

  function resolveNavigation(value) {
    const adapter = requireProduct(value);
    const nav = adapter.manifest.navigation;
    let href = nav.route;
    if (href && nav.queryParameter) {
      const separator = href.includes('?') ? '&' : '?';
      href += `${separator}${encodeURIComponent(nav.queryParameter)}=${encodeURIComponent(adapter.id)}`;
    }
    return Object.freeze({ ...nav, productId: adapter.id, label: adapter.label, href });
  }

  function migrateProjectEnvelope(payload, fallbackProduct) {
    const source = payload && typeof payload === 'object' ? payload : {};
    const candidate = source.productType || source.product_type || source.product || source.type || fallbackProduct;
    const productType = migrateProductType(candidate, fallbackProduct);
    const adapter = requireProduct(productType);
    return Object.freeze({ productType, adapter, project: adapter.migrateProject(source.project || source) });
  }

  const api = Object.freeze({
    CONTRACT_SCHEMA,
    REQUIRED_METHODS,
    DEFAULT_CAPABILITIES,
    registerProduct,
    getProduct,
    requireProduct,
    getManifest,
    listProducts,
    listManifests,
    supports,
    resolveId,
    canonicalId,
    migrateProductType,
    resolveNavigation,
    migrateProjectEnvelope
  });
  root.PulumurProductRegistry = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
