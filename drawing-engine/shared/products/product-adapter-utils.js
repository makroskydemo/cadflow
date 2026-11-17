(function (root) {
  'use strict';

  const PROJECT_FORMAT = 'PLMR_PRODUCT_PROJECT';

  function clone(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  function finite(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function normalizeBounds(bounds) {
    const source = bounds || {};
    const minX = finite(source.minX, 0);
    const minY = finite(source.minY, 0);
    const maxX = finite(source.maxX, minX);
    const maxY = finite(source.maxY, minY);
    return { minX: Math.min(minX, maxX), minY: Math.min(minY, maxY), maxX: Math.max(minX, maxX), maxY: Math.max(minY, maxY) };
  }

  function containsBounds(outer, inner, tolerance) {
    const host = normalizeBounds(outer);
    const child = normalizeBounds(inner);
    const eps = Math.max(0, finite(tolerance, 0.01));
    return child.minX >= host.minX - eps && child.minY >= host.minY - eps && child.maxX <= host.maxX + eps && child.maxY <= host.maxY + eps;
  }

  function drawingScope(productType, context) {
    const source = context || {};
    const instanceId = String(source.instanceId || `${productType}-001`);
    const placementId = String(source.placementId || instanceId);
    const drawingScopeValue = String(source.drawingScope || (source.hostProduct ? 'PLACEMENT' : 'STANDALONE')).toUpperCase();
    return {
      productType,
      instanceId,
      placementId,
      hostProduct: source.hostProduct || null,
      viewId: String(source.viewId || source.view || 'FRONT').toUpperCase(),
      layerNamespace: String(source.layerNamespace || `${source.hostProduct ? 'PR_' : ''}${productType}_${instanceId}`).replace(/[^A-Za-z0-9_\-]+/g, '_'),
      entityNamespace: String(source.entityNamespace || `${productType}:${instanceId}:${placementId}`),
      drawingScope: drawingScopeValue
    };
  }

  function annotateEntities(entities, scope) {
    return (entities || []).map((entity, index) => ({
      ...clone(entity),
      ownerInstance: scope.instanceId,
      placementId: scope.placementId,
      productType: scope.productType,
      drawingScope: scope.drawingScope,
      entityId: entity.entityId || `${scope.entityNamespace}:${index + 1}`
    }));
  }

  function attachSceneGraph(drawing, context) {
    return root.PulumurSceneGraph && typeof root.PulumurSceneGraph.attachDrawing === 'function' ? root.PulumurSceneGraph.attachDrawing(drawing, context || drawing.productScope || {}) : drawing;
  }

  function standaloneDrawing(block, productType, context) {
    if (!block || !Array.isArray(block.entities)) throw new Error(`${productType} geometri çekirdeği blok üretmedi.`);
    const scope = drawingScope(productType, context);
    const bounds = normalizeBounds(block.bounds);
    return attachSceneGraph({
      entities: annotateEntities(block.entities, scope),
      blocks: {},
      bounds,
      productScope: scope,
      layerStyle: (root.PulumurGeometry && root.PulumurGeometry.LAYER_STYLE) || {}
    }, scope);
  }

  function validateProjectBase(project, productType) {
    const errors = [];
    if (!project || typeof project !== 'object') errors.push('Proje verisi bulunamadı.');
    const width = finite(project && project.width, NaN);
    const height = finite(project && project.height, NaN);
    if (!Number.isFinite(width) || width <= 0) errors.push('Genişlik sıfırdan büyük olmalı.');
    if (!Number.isFinite(height) || height <= 0) errors.push('Yükseklik sıfırdan büyük olmalı.');
    if (project && project.productType && String(project.productType).toUpperCase() !== productType) errors.push(`Ürün türü ${productType} olmalı.`);
    return { valid: errors.length === 0, errors };
  }

  function serializeProject(project, productType, schemaVersion) {
    return JSON.stringify({
      format: PROJECT_FORMAT,
      schemaVersion,
      productType,
      savedAt: new Date().toISOString(),
      project: clone(project)
    }, null, 2);
  }

  function deserializeProject(text, adapter) {
    const payload = typeof text === 'string' ? JSON.parse(text) : clone(text);
    if (!payload || payload.format !== PROJECT_FORMAT) throw new Error('Geçersiz bağımsız PLMR ürün dosyası.');
    const resolved = root.PulumurProductRegistry && root.PulumurProductRegistry.resolveId(payload.productType);
    if (resolved !== adapter.id) throw new Error(`Dosya ${adapter.label} ürünüyle uyumlu değil.`);
    return adapter.migrateProject(payload.project || {}, payload.schemaVersion || 1);
  }

  function renderPreview(drawing, options) {
    if (!root.PulumurGeometry || typeof root.PulumurGeometry.renderSvg !== 'function') throw new Error('SVG geometri motoru yüklenmedi.');
    return root.PulumurGeometry.renderSvg(drawing, options || {});
  }

  function exportDxf(drawing) {
    if (!root.PulumurModernDXF || typeof root.PulumurModernDXF.toDxf !== 'function') throw new Error('DXF motoru yüklenmedi.');
    return root.PulumurModernDXF.toDxf(drawing);
  }

  async function exportPdf(drawing, metadata) {
    if (!root.jspdf || !root.jspdf.jsPDF) throw new Error('PDF motoru yüklenmedi.');
    const flattened = root.PulumurGeometry.flattenDrawingForExport(drawing);
    const bounds = normalizeBounds(flattened.bounds);
    const doc = new root.jspdf.jsPDF({ orientation: bounds.maxX - bounds.minX >= bounds.maxY - bounds.minY ? 'landscape' : 'portrait', unit: 'mm', format: 'a4' });
    const fontName = root.PulumurExportService && typeof root.PulumurExportService.ensurePdfFont === 'function'
      ? await root.PulumurExportService.ensurePdfFont(doc, '../../assets/NotoSans-Regular.ttf')
      : 'helvetica';
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 12;
    const title = String((metadata && metadata.title) || 'PLMR Ürün Çizimi');
    doc.setFont(fontName, 'normal');
    doc.setFontSize(12);
    doc.text(title, margin, 9);
    const width = Math.max(1, bounds.maxX - bounds.minX);
    const height = Math.max(1, bounds.maxY - bounds.minY);
    const scale = Math.min((pageW - margin * 2) / width, (pageH - margin * 2 - 8) / height);
    const tx = margin - bounds.minX * scale;
    const ty = pageH - margin + bounds.minY * scale;
    doc.setLineWidth(0.18);
    (flattened.entities || []).forEach(entity => {
      if (entity.type === 'line') doc.line(tx + entity.x1 * scale, ty - entity.y1 * scale, tx + entity.x2 * scale, ty - entity.y2 * scale);
      if (entity.type === 'polyline' && Array.isArray(entity.points) && entity.points.length > 1) {
        for (let index = 1; index < entity.points.length; index += 1) {
          const first = entity.points[index - 1];
          const second = entity.points[index];
          doc.line(tx + first[0] * scale, ty - first[1] * scale, tx + second[0] * scale, ty - second[1] * scale);
        }
        if (entity.closed) {
          const first = entity.points[0];
          const last = entity.points[entity.points.length - 1];
          doc.line(tx + last[0] * scale, ty - last[1] * scale, tx + first[0] * scale, ty - first[1] * scale);
        }
      }
      if (entity.type === 'circle') doc.circle(tx + entity.x * scale, ty - entity.y * scale, Math.abs(entity.r * scale));
      if ((entity.type === 'text' || entity.type === 'mtext') && entity.value) {
        doc.setFontSize(Math.max(5, Math.min(10, finite(entity.height, 20) * scale * 0.35)));
        doc.text(String(entity.value), tx + finite(entity.x, 0) * scale, ty - finite(entity.y, 0) * scale);
      }
    });
    return doc.output('arraybuffer');
  }

  const api = { clone, finite, normalizeBounds, containsBounds, drawingScope, annotateEntities, attachSceneGraph, standaloneDrawing, validateProjectBase, serializeProject, deserializeProject, renderPreview, exportDxf, exportPdf, PROJECT_FORMAT };
  root.PulumurProductAdapterUtils = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
