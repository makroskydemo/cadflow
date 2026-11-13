(function (root) {
  'use strict';

  function createProductAdapter(spec) {
    const registry = root.PulumurProductRegistry;
    const utils = root.PulumurProductAdapterUtils;
    if (!registry || !utils) throw new Error('Product registry altyapısı yüklenmedi.');

    const productType = registry.canonicalId(spec.id);
    const schemaVersion = Math.max(1, Number(spec.schemaVersion) || 1);

    function createDefaultProject(overrides) {
      return {
        productType,
        schemaVersion,
        projectName: `${spec.label} Çizimi`,
        width: spec.defaultWidth,
        height: spec.defaultHeight,
        ...utils.clone(spec.defaults || {}),
        ...utils.clone(overrides || {})
      };
    }

    function migrateProject(project) {
      const source = utils.clone(project || {});
      const alias = registry.resolveId(source.productType || productType);
      if (alias !== productType) throw new Error(`${spec.label} projesi bekleniyordu.`);
      return createDefaultProject({ ...source, productType, schemaVersion });
    }

    function validateProject(project) {
      const result = utils.validateProjectBase(project, productType);
      if (typeof spec.validate === 'function') {
        const productErrors = spec.validate(project) || [];
        result.errors.push(...productErrors);
        result.valid = result.errors.length === 0;
      }
      return result;
    }

    function normalizedPlacement(project) {
      const migrated = migrateProject(project);
      return typeof spec.normalizePlacement === 'function' ? spec.normalizePlacement(migrated) : migrated;
    }

    function buildCore(project) {
      const validation = validateProject(project);
      if (!validation.valid) throw new Error(validation.errors.join(' '));
      const geometry = root.PulumurGeometry;
      const builder = typeof spec.buildBlock === 'function' ? spec.buildBlock : (geometry && geometry[spec.blockBuilder]);
      if (typeof builder !== 'function') throw new Error(`${spec.label} geometri çekirdeği yüklenmedi: ${spec.blockBuilder || 'custom'}`);
      return builder(normalizedPlacement(project), { geometry, root });
    }

    function buildStandaloneGeometry(context) {
      const source = context || {};
      return utils.standaloneDrawing(buildCore(source.project || source.productConfig || source), productType, {
        ...source,
        drawingScope: 'STANDALONE',
        instanceId: source.instanceId || `${productType}-001`,
        placementId: source.placementId || `${productType}-STANDALONE`
      });
    }

    function buildPlacementGeometry(context) {
      const source = context || {};
      const drawing = utils.standaloneDrawing(buildCore(source.productConfig || source.project || source), productType, {
        ...source,
        drawingScope: 'PLACEMENT',
        hostProduct: source.hostProduct || 'PERGO_RISE'
      });
      if (source.openingBounds && !utils.containsBounds(source.openingBounds, drawing.bounds, 0.01)) {
        throw new Error(`${spec.label} dış sınırı seçilen yerleşim alanını aşıyor.`);
      }
      return drawing;
    }

    const adapter = {
      id: productType,
      label: spec.label,
      accessProductId: spec.accessProductId || undefined,
      aliases: spec.aliases || [],
      schemaVersion,
      executionMode: spec.executionMode || 'IN_PROCESS_ADAPTER',
      navigation: spec.navigation || { route: 'products/standalone/index.html', queryParameter: 'product', moduleName: 'Standalone', engineName: 'Web DXF', opensDedicatedPage: true },
      projectSchemas: spec.projectSchemas || ['PLMR_PRODUCT_PROJECT', 'plmr-standalone-products-v2'],
      legacyProductTypes: spec.legacyProductTypes || spec.aliases || [],
      capabilities: {
        standaloneDrawing: true,
        placementInsidePergoRise: true,
        svg: true,
        dxf: true,
        pdf: true,
        plmr: true,
        cloud: true,
        ...(spec.capabilities || {})
      },
      createDefaultProject,
      validateProject,
      migrateProject,
      buildStandaloneGeometry,
      buildPlacementGeometry,
      renderPreview: (drawing, options) => utils.renderPreview(drawing, options),
      serializeProject: project => utils.serializeProject(migrateProject(project), productType, schemaVersion),
      deserializeProject: text => utils.deserializeProject(text, adapter),
      exportDxf: drawing => utils.exportDxf(drawing),
      exportPdf: (drawing, metadata) => utils.exportPdf(drawing, { title: `${spec.label} Üretim Çizimi`, ...(metadata || {}) })
    };

    return registry.registerProduct(adapter);
  }

  root.PulumurCreateProductAdapter = createProductAdapter;
  if (typeof module !== 'undefined') module.exports = createProductAdapter;
})(typeof window !== 'undefined' ? window : globalThis);
