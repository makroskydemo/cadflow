(function (root) {
  'use strict';

  function finite(value) { return Number.isFinite(Number(value)); }
  function round(value) { return Math.round(Number(value) * 1000000) / 1000000; }
  function pointKey(point) { return `${round(point[0])},${round(point[1])}`; }

  function entityKey(entity) {
    const base = [entity.type, entity.layer || '', entity.color == null ? '' : entity.color, entity.ownerInstance || ''];
    if (entity.type === 'line') base.push(round(entity.x1), round(entity.y1), round(entity.x2), round(entity.y2));
    else if (entity.type === 'polyline') base.push((entity.points || []).map(pointKey).join(';'), !!entity.closed);
    else if(entity.type==='arc')base.push(round(entity.x),round(entity.y),round(entity.radius),round(entity.startAngle),round(entity.endAngle),entity.linetype||'');
    else if (entity.type === 'circle') base.push(round(entity.x), round(entity.y), round(entity.r));
    else if (entity.type === 'insert') base.push(entity.name || '', round(entity.x), round(entity.y), round(entity.rotation || 0), round(entity.scaleX || 1), round(entity.scaleY || 1));
    else if (entity.type === 'text' || entity.type === 'mtext') base.push(round(entity.x), round(entity.y), String(entity.value || ''), round(entity.height || 0), round(entity.rotation || 0));
    else return null;
    return JSON.stringify(base);
  }

  function validateEntity(entity, index, drawing) {
    const errors = [];
    const prefix = `Entity ${index + 1}`;
    if (!entity || typeof entity !== 'object') return [`${prefix}: geçersiz entity.`];
    if (!entity.type) errors.push(`${prefix}: type eksik.`);
    if (entity.type === 'line') {
      if (![entity.x1, entity.y1, entity.x2, entity.y2].every(finite)) errors.push(`${prefix}: geçersiz line koordinatı.`);
      else if (Number(entity.x1) === Number(entity.x2) && Number(entity.y1) === Number(entity.y2)) errors.push(`${prefix}: sıfır uzunluklu line.`);
    }
    if (entity.type === 'polyline') {
      if (!Array.isArray(entity.points) || entity.points.length < 2) errors.push(`${prefix}: polyline en az iki nokta içermeli.`);
      else if (!entity.points.every(point => Array.isArray(point) && point.length >= 2 && point.slice(0, 2).every(finite))) errors.push(`${prefix}: geçersiz polyline koordinatı.`);
      else if (entity.closed && entity.points.length < 3) errors.push(`${prefix}: kapalı polyline en az üç nokta içermeli.`);
    }
    if(entity.type==='arc'&&(![entity.x,entity.y,entity.radius,entity.startAngle,entity.endAngle].every(finite)||Number(entity.radius)<=0))errors.push(`${prefix}: geçersiz arc.`);
    if (entity.type === 'circle' && (![entity.x, entity.y, entity.r].every(finite) || Number(entity.r) <= 0)) errors.push(`${prefix}: geçersiz circle.`);
    if (entity.type === 'insert') {
      if (![entity.x, entity.y].every(finite)) errors.push(`${prefix}: geçersiz insert koordinatı.`);
      if (!entity.name || !(drawing.blocks && drawing.blocks[entity.name])) errors.push(`${prefix}: block referansı bulunamadı: ${entity.name || '(boş)'}.`);
    }
    return errors;
  }

  function normalizeDrawingEntities(drawing, options) {
    const source = drawing || {};
    const config = { removeDuplicates: true, rejectInvalid: true, ...(options || {}) };
    const entities = [];
    const errors = [];
    const warnings = [];
    const seen = new Set();
    (source.entities || []).forEach((entity, index) => {
      if (!entity || entity.previewOnly || entity.hiddenDimension || entity.type === 'interaction' || entity.active === false || entity.visible === false) return;
      const entityErrors = validateEntity(entity, index, source);
      if (entityErrors.length) {
        errors.push(...entityErrors);
        if (config.rejectInvalid) return;
      }
      const key = entity.ownerInstance ? entityKey(entity) : null;
      if (config.removeDuplicates && key && seen.has(key)) {
        warnings.push(`Duplicate entity kaldırıldı: ${entity.entityId || index + 1}`);
        return;
      }
      if (key) seen.add(key);
      entities.push(entity);
    });
    return { drawing: { ...source, entities }, errors, warnings, valid: errors.length === 0 };
  }

  function assertValidDrawing(drawing, options) {
    const result = normalizeDrawingEntities(drawing, options);
    if (!result.valid) throw new Error(`Çizim doğrulaması başarısız: ${result.errors.join(' ')}`);
    return result;
  }

  const api = { entityKey, validateEntity, normalizeDrawingEntities, assertValidDrawing };
  root.PulumurDrawingEntityValidator = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
