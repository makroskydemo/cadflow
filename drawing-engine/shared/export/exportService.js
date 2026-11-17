(function (root) {
  'use strict';

  function prepareDrawing(drawing, options) {
    if (!drawing) throw new Error('Export için çizim bulunamadı.');
    if (root.PulumurDrawingEntityValidator) return root.PulumurDrawingEntityValidator.assertValidDrawing(drawing, options).drawing;
    return drawing;
  }

  function normalizeView(view) {
    if (!view || !view.bounds) throw new Error('PDF görünüş bounds bilgisi eksik.');
    const bounds = view.bounds;
    const values = [bounds.minX, bounds.minY, bounds.maxX, bounds.maxY].map(Number);
    if (!values.every(Number.isFinite)) throw new Error(`PDF görünüş bounds geçersiz: ${view.viewId || 'VIEW'}`);
    return { ...view, bounds: { minX: Math.min(values[0], values[2]), minY: Math.min(values[1], values[3]), maxX: Math.max(values[0], values[2]), maxY: Math.max(values[1], values[3]) } };
  }

  function overlaps(first, second, spacing) {
    const gap = Math.max(0, Number(spacing) || 0);
    return !(first.maxX + gap <= second.minX || second.maxX + gap <= first.minX || first.maxY + gap <= second.minY || second.maxY + gap <= first.minY);
  }

  function validatePdfLayout(views, options) {
    const config = { minimumSpacing: 0, pageBounds: null, ...(options || {}) };
    const normalized = (views || []).map(normalizeView);
    const errors = [];
    for (let firstIndex = 0; firstIndex < normalized.length; firstIndex += 1) {
      const first = normalized[firstIndex];
      if (config.pageBounds && root.PulumurProductAdapterUtils && !root.PulumurProductAdapterUtils.containsBounds(config.pageBounds, first.bounds, 0.01)) errors.push(`${first.viewId || firstIndex} sayfa sınırını aşıyor.`);
      for (let secondIndex = firstIndex + 1; secondIndex < normalized.length; secondIndex += 1) {
        if (overlaps(first.bounds, normalized[secondIndex].bounds, config.minimumSpacing)) errors.push(`${first.viewId || firstIndex} ile ${normalized[secondIndex].viewId || secondIndex} görünüşleri çakışıyor.`);
      }
    }
    return { valid: errors.length === 0, errors, views: normalized };
  }

  function assertPdfLayout(views, options) {
    const result = validatePdfLayout(views, options);
    if (!result.valid) throw new Error(`PDF yerleşim doğrulaması başarısız: ${result.errors.join(' ')}`);
    return result;
  }

  async function ensurePdfFont(pdf, fontUrl) {
    if (!pdf || typeof pdf.addFileToVFS !== 'function' || typeof pdf.addFont !== 'function') return 'helvetica';
    if (pdf.__plmrFontName) return pdf.__plmrFontName;
    const response = await fetch(fontUrl || 'assets/NotoSans-Regular.ttf');
    if (!response.ok) throw new Error('PDF Türkçe fontu yüklenemedi.');
    const bytes = new Uint8Array(await response.arrayBuffer());
    let binary = '';
    const chunkSize = 0x8000;
    for (let offset = 0; offset < bytes.length; offset += chunkSize) binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
    pdf.addFileToVFS('NotoSans-Regular.ttf', btoa(binary));
    pdf.addFont('NotoSans-Regular.ttf', 'PLMRNoto', 'normal');
    pdf.__plmrFontName = 'PLMRNoto';
    pdf.setFont('PLMRNoto', 'normal');
    return pdf.__plmrFontName;
  }

  const api = { prepareDrawing, validatePdfLayout, assertPdfLayout, overlaps, ensurePdfFont };
  root.PulumurExportService = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
