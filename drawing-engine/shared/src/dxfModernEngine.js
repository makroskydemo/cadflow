(function (root) {
  'use strict';

  const TEMPLATE = root.PulumurModernDxfTemplate || (typeof require !== 'undefined' ? require('./modernDxfTemplate.js') : '');
  const MODEL_SPACE_RECORD = '17';
  const LAYER_TABLE_HANDLE = '1';
  const BLOCK_RECORD_TABLE_HANDLE = '9';
  const PLOT_STYLE_HANDLE = '13';
  const MATERIAL_HANDLE = '21';

  function pair(code, value) { return `${code}\n${value}`; }
  function append(out, arr) { for (const item of arr) out.push(item); return out; }
  function fixed(value, decimals = 6) {
    const n = Number(value);
    if (!Number.isFinite(n)) return '0';
    return Number(n.toFixed(Math.max(0, decimals))).toString();
  }
  function fixedScale(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return '1';
    return Number(n.toFixed(8)).toString();
  }
  function cleanSingleLine(value) {
    return String(value ?? '')
      .replace(/\r\n/g, ' ')
      .replace(/[\r\n\t]+/g, ' ')
      .replace(/[\u0000-\u001F\u007F]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
  function cleanMText(value) {
    return String(value ?? '')
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
      .replace(/\n/g, '\\P');
  }
  function sanitizeTableName(value, fallback, allowAnonymous = false) {
    const raw = String(value ?? '').trim();
    if (allowAnonymous && /^\*D\d+$/i.test(raw)) return raw.toUpperCase();
    const safe = raw
      .replace(/[<>/\\":;?*|=,]/g, '_')
      .replace(/[\u0000-\u001F\u007F]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    return (safe || fallback).slice(0, 255);
  }
  function modernLayerName(value) { return sanitizeTableName(value, 'LAYER_0', false); }
  function modernBlockName(value) { return sanitizeTableName(value, 'BLOCK', true); }
  function nameHash(value) {
    let hash = 2166136261;
    const text = String(value || '');
    for (let i = 0; i < text.length; i += 1) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619) >>> 0;
    }
    return hash.toString(36).toUpperCase();
  }
  function createUniqueNameMap(values, sanitizer) {
    const result = new Map();
    const used = new Map();
    for (const original of values) {
      if (result.has(original)) continue;
      let name = sanitizer(original);
      const key = name.toLocaleUpperCase('tr-TR');
      if (used.has(key) && used.get(key) !== original) {
        const suffix = `_${nameHash(original).slice(-7)}`;
        name = `${name.slice(0, Math.max(1, 255 - suffix.length))}${suffix}`;
      }
      used.set(name.toLocaleUpperCase('tr-TR'), original);
      result.set(original, name);
    }
    return result;
  }
  function hexToTrueColor(value) {
    const match = /^#?([0-9a-f]{6})$/i.exec(String(value || '').trim());
    return match ? parseInt(match[1], 16) : null;
  }
  function rgbToTrueColor(value) {
    if (value !== undefined && value !== null && value !== '' && Number.isFinite(Number(value))) return Number(value);
    if (Array.isArray(value) && value.length >= 3) {
      return ((Number(value[0]) & 255) << 16) | ((Number(value[1]) & 255) << 8) | (Number(value[2]) & 255);
    }
    if (value && typeof value === 'object') {
      const r = Number(value.r ?? value.red);
      const g = Number(value.g ?? value.green);
      const b = Number(value.b ?? value.blue);
      if ([r, g, b].every(Number.isFinite)) return ((r & 255) << 16) | ((g & 255) << 8) | (b & 255);
    }
    return null;
  }
  function aciColor(value, fallback = 7) {
    const n = Number(value);
    return Number.isFinite(n) && n >= 1 && n <= 255 ? Math.round(n) : fallback;
  }
  function entityColorPairs(entity) {
    const trueColor = rgbToTrueColor(entity && (entity.trueColor ?? entity.rgb ?? entity.hexColor));
    if (Number.isFinite(trueColor)) return [pair(420, trueColor)];
    if (entity && Number.isFinite(Number(entity.color))) {
      const color = Number(entity.color);
      if (color === 0) return [pair(62, 0)]; // BYBLOCK
      if (color === 256) return [pair(62, 256)]; // BYLAYER
      return [pair(62, aciColor(color))];
    }
    return [];
  }
  function getLayerStyle(drawing, originalName) {
    return (drawing && drawing.layerStyle && drawing.layerStyle[originalName]) || {};
  }
  function layerAci(drawing, originalName) {
    const style = getLayerStyle(drawing, originalName);
    if (Number.isFinite(Number(style.aci))) return aciColor(style.aci);
    if (/ölç|dim/i.test(originalName)) return 42;
    return 7;
  }
  function layerTrueColor(drawing, originalName) {
    const style = getLayerStyle(drawing, originalName);
    return hexToTrueColor(style.stroke);
  }

  function handleAllocator(start = 0x1000) {
    let current = start;
    return () => (current++).toString(16).toUpperCase();
  }

  function dimensionLayer(entity) {
    const type = String((entity && entity.edit && entity.edit.dimensionType) || (entity && entity.dimensionFilterType) || 'main').toLowerCase();
    return type === 'detail' ? 'Ölçüler - Detay' : 'Ölçüler - Ana';
  }
  function hatchFromLegacyInsert(entity) {
    if (!entity || entity.type !== 'insert' || entity.previewOnly) return null;
    const name = String(entity.name || '');
    const isWall = name === 'PULUMUR WALL BRICK SAFE HATCH';
    const isFabric = name === 'PULUMUR TRAPEZ SAFE HATCH';
    if (!isWall && !isFabric) return null;
    const sx = Number(entity.scaleX || 1);
    const sy = Number(entity.scaleY || 1);
    const x1 = Number(entity.x || 0);
    const y1 = Number(entity.y || 0);
    // V8.4.5: Ayna INSERT'in referans noktası sağ kenara dönüşür.
    // mirrorX dikkate alınmazsa tarama sağ duvarın +X yönüne tam duvar kalınlığı kadar taşar.
    const rawX2 = x1 + (entity.mirrorX ? -1 : 1) * 1000 * sx;
    const rawY2 = y1 + 1000 * sy;
    const minX = Math.min(x1, rawX2);
    const maxX = Math.max(x1, rawX2);
    const minY = Math.min(y1, rawY2);
    const maxY = Math.max(y1, rawY2);
    return {
      type: 'hatch',
      layer: entity.layer || (isWall ? 'HATCH_WALL' : 'HATCH_FABRIC'),
      color: entity.color,
      trueColor: entity.trueColor,
      points: [[minX, minY], [maxX, minY], [maxX, maxY], [minX, maxY]],
      patternKind: isWall ? 'brick' : 'fabric'
    };
  }
  function prepareDrawing(drawing) {
    const next = { ...(drawing || {}) };
    next.layers = [...(drawing.layers || [])];
    next.entities = (drawing.entities || []).map(entity => {
      if (!entity) return entity;
      const modernHatch = hatchFromLegacyInsert(entity);
      if (modernHatch) return modernHatch;
      if (entity.type === 'dimension') {
        const layer = next.metadata?.dxfProfile === 'V53_R2018' ? (entity.layer || 'OLCULENDIRME_MM') : dimensionLayer(entity);
        return { ...entity, dimensionId: entity.dimensionId, hiddenDimension: entity.hiddenDimension === true, layer, graphics: (entity.graphics || []).map(ge => ({ ...ge, layer })) };
      }
      if ((entity.type === 'text' || entity.type === 'mtext') && entity.dimensionFilterType) {
        return { ...entity, layer: dimensionLayer(entity) };
      }
      return { ...entity };
    });
    return next;
  }
  function getBlocks(drawing) {
    if (drawing && drawing.blocks) return drawing.blocks;
    if (root.PulumurFilteredBlocks && root.PulumurFilteredBlocks.blocks) return root.PulumurFilteredBlocks.blocks;
    return {};
  }
  function isHeavyDisabledBlockName(name) {
    return ['Duvar Tarama Block', 'Trapez Tarama', 'RISING LOGO'].includes(String(name || ''));
  }
  function mirrorBlockEntityX(entity) {
    if (entity.type === 'line') return { ...entity, x1: -Number(entity.x1 || 0), x2: -Number(entity.x2 || 0) };
    if (entity.type === 'polyline') return { ...entity, points: (entity.points || []).map(p => [-Number(p[0] || 0), Number(p[1] || 0)]).reverse() };
    if (entity.type === 'circle') return { ...entity, x: -Number(entity.x || 0) };
    if (entity.type === 'hatch') return { ...entity, points: (entity.points || []).map(p => [-Number(p[0] || 0), Number(p[1] || 0)]).reverse() };
    if (entity.type === 'text' || entity.type === 'mtext') return { ...entity, x: -Number(entity.x || 0) };
    return { ...entity };
  }
  function mirroredBlockFrom(src) {
    return { ...src, entities: (src.entities || []).map(mirrorBlockEntityX) };
  }
  function collectUsedBlocks(drawing, sourceBlocks) {
    const used = new Map();
    for (const e of drawing.entities || []) {
      if (e.type !== 'insert' || e.previewOnly || e.dxfSkip || !sourceBlocks[e.name] || isHeavyDisabledBlockName(e.name)) continue;
      if (e.mirrorX) used.set(`${e.name}__MIRROR`, mirroredBlockFrom(sourceBlocks[e.name]));
      else used.set(e.name, sourceBlocks[e.name]);
    }
    let index = 1;
    for (const e of drawing.entities || []) {
      if (e.type !== 'dimension' || e.previewOnly || e.dxfSkip || e.hiddenDimension) continue;
      const name = e.blockName || `*D${index++}`;
      e.blockName = name;
      used.set(name, { dxfName: name, entities: e.graphics || [], anonymousDimension: true });
    }
    return used;
  }
  function collectLayerNames(drawing, blocks) {
    const names = new Set(['0', 'Defpoints']);
    if(drawing.metadata?.dxfProfile==='V53_R2018'){
      for(const layer of ['OLCULENDIRME_MM','OLCULENDIRME_INCH','OLCULENDIRME_MM_INCH'])names.add(layer);
    }
    function include(entity) {
      if (!entity || entity.previewOnly || entity.dxfSkip || entity.hiddenDimension || entity.type === 'interaction') return;
      if (entity.layer) names.add(entity.layer);
    }
    for (const entity of drawing.entities || []) include(entity);
    for (const block of blocks.values()) {
      for (const entity of block.entities || []) include(entity);
    }
    return [...names];
  }

  // Reuse the approved provider's display formatter and physical dimension anchors.
  // Export unit layers from the same physical measurement anchors.
  function dimensionModes(drawing) {
    if (drawing.metadata?.dxfProfile !== 'V53_R2018') return drawing;
    const provider = root.PLMRV24Libraries?.PLMRV53Document || root.PLMRGiyotin2DDocument || root.PLMRV53Document ||
      (typeof require === 'function' ? require('../../src/v53/giyotin-2d-document.js') : null);
    const selected = 'mm';
    const modes = [
      {id: 'mm', units: {mm: true, inch: false}, layer: 'OLCULENDIRME_MM', style: 'PLMR_DIM_MM'},
      {id: 'inch', units: {mm: false, inch: true}, layer: 'OLCULENDIRME_INCH', style: 'PLMR_DIM_INCH'},
      {id: 'ft', units: {mm: false, ft: true}, layer: 'OLCULENDIRME_FT', style: 'PLMR_DIM_FT'},
      {id: 'dual', units: {mm: true, inch: true}, layer: 'OLCULENDIRME_MM_INCH', style: 'PLMR_DIM_MM_INCH'}
    ];
    const entities = [];
    for (const original of drawing.entities || []) {
      if (original.type !== 'dimension' || original.previewOnly || original.dxfSkip || original.hiddenDimension) {
        entities.push(original);
        continue;
      }
      if (!provider?.formatDimension) throw Error('Onaylı ölçü gösterim sağlayıcısı yüklenmedi.');
      const value = Math.hypot(original.p2.x - original.p1.x, original.p2.y - original.p1.y);
      for (const mode of modes) {
        const label = provider.formatDimension(value, mode.units);
        const labelGraphic=(original.graphics||[]).find(g=>g.type==='text'||g.type==='mtext');
        // The alternate label sits one line away when several layers are visible.
        const dl=original.dimLine;
        let shift={x:0,y:0};
        if(mode.id==='ft'&&dl&&labelGraphic&&value){
          const nx=-(original.p2.y-original.p1.y)/value,ny=(original.p2.x-original.p1.x)/value;
          const side=(labelGraphic.x-dl.x)*nx+(labelGraphic.y-dl.y)*ny<0?-1:1;
          shift={x:nx*side*145,y:ny*side*145};
        }
        const dimension = {
          ...original, layer: mode.layer, dimStyle: mode.style, previewText: label, textOverride: '<>',
          ...(mode.id==='ft'&&labelGraphic?{manualText:true,text:{x:labelGraphic.x+shift.x,y:labelGraphic.y+shift.y}}:{}),
          dimensionId: (original.dimensionId || 'dimension') + ':' + mode.id,
          graphics: (original.graphics || []).map(graphic => ({
            ...graphic, layer: mode.layer,
            ...(['text', 'mtext'].includes(graphic.type) ? {value: label,x:graphic.x+shift.x,y:graphic.y+shift.y} : {})
          }))
        };
        delete dimension.blockName;
        entities.push(dimension);
      }
    }
    return {
      ...drawing, entities,
      metadata: {...drawing.metadata, dimStyle: modes.find(mode => mode.id === selected).style},
      hiddenLayers: {
        ...drawing.hiddenLayers,
        ...Object.fromEntries(modes.map(mode => [mode.layer, mode.id !== selected]))
      }
    };
  }

  function addFeetDimStyle(dxf,nextHandle){
    const lines=dxf.split('\n');
    let start=-1,count=-1,end=-1;
    let inch;
    for(let i=0;i<lines.length-1;i+=2){
      const code=Number(lines[i]),value=lines[i+1];
      if(code===0&&value==='TABLE'&&lines[i+3]==='DIMSTYLE')start=i;
      if(start<0)continue;
      if(code===70&&count<0)count=i+1;
      if(code===0&&value==='DIMSTYLE'){
        let stop=i+2;
        while(stop<lines.length-1&&Number(lines[stop])!==0)stop+=2;
        const record=lines.slice(i,stop);
        if(record.some((item,j)=>j%2===1&&item==='PLMR_DIM_INCH'&&Number(record[j-1])===2))inch=record;
      }
      if(code===0&&value==='ENDTAB'){end=i;break;}
    }
    if(!inch||count<0||end<0)throw Error('DXF inch dimension style missing.');
    const units=root.PLMRUnits||(typeof require==='function'?require('../measurement-units.js'):null);
    const replacements={2:'PLMR_DIM_FT',105:nextHandle(),144:String(1/units.mmPerUnit.ft),3:'<> ft'};
    for(let i=0;i<inch.length-1;i+=2){
      const code=Number(inch[i]);
      if(Object.hasOwn(replacements,code))inch[i+1]=replacements[code];
    }
    lines[count]=String(Number(lines[count])+1);
    lines.splice(end,0,...inch);
    return lines.join('\n');
  }

  function emptyBounds() {
    return { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
  }
  function includePoint(bounds, x, y) {
    const px = Number(x), py = Number(y);
    if (!Number.isFinite(px) || !Number.isFinite(py)) return;
    bounds.minX = Math.min(bounds.minX, px);
    bounds.minY = Math.min(bounds.minY, py);
    bounds.maxX = Math.max(bounds.maxX, px);
    bounds.maxY = Math.max(bounds.maxY, py);
  }
  function mergeBounds(target, source) {
    if (!source || !Number.isFinite(source.minX)) return target;
    includePoint(target, source.minX, source.minY);
    includePoint(target, source.maxX, source.maxY);
    return target;
  }
  function localInsertPoint(px, py, insert) {
    const sx = Math.abs(Number(insert.scaleX) || 1);
    const sy = Number(insert.scaleY) || 1;
    const lx = insert.mirrorX ? -Number(px || 0) : Number(px || 0);
    const ly = Number(py || 0);
    const angle = (Number(insert.rotation) || 0) * Math.PI / 180;
    const xx = lx * sx, yy = ly * sy;
    return {
      x: Number(insert.x || 0) + xx * Math.cos(angle) - yy * Math.sin(angle),
      y: Number(insert.y || 0) + xx * Math.sin(angle) + yy * Math.cos(angle)
    };
  }
  function entityModelBounds(entity, blocks, depth = 0) {
    const b = emptyBounds();
    if (!entity || depth > 8) return b;
    if (entity.type === 'line') {
      includePoint(b, entity.x1, entity.y1);
      includePoint(b, entity.x2, entity.y2);
    } else if (entity.type === 'polyline' || entity.type === 'hatch') {
      for (const p of entity.points || []) includePoint(b, p[0], p[1]);
    } else if (entity.type === 'circle' || entity.type === 'arc') {
      const x = Number(entity.x) || 0, y = Number(entity.y) || 0, r = Math.abs(Number(entity.radius??entity.r) || 0);
      includePoint(b, x - r, y - r);
      includePoint(b, x + r, y + r);
    } else if (entity.type === 'text' || entity.type === 'mtext') {
      const x = Number(entity.x) || 0, y = Number(entity.y) || 0;
      const h = Math.max(1, Math.abs(Number(entity.height) || 80));
      const w = entity.type === 'mtext' && Number(entity.width) > 0
        ? Number(entity.width)
        : Math.max(h, cleanSingleLine(entity.value).length * h * 0.65);
      const left = x - (entity.align === 'center' ? w / 2 : (entity.align === 'right' ? w : 0));
      const right = x + (entity.align === 'center' ? w / 2 : (entity.align === 'right' ? 0 : w));
      includePoint(b, left, y - h);
      includePoint(b, right, y + h);
    } else if (entity.type === 'dimension') {
      for (const ge of entity.graphics || []) mergeBounds(b, entityModelBounds(ge, blocks, depth + 1));
      if (!Number.isFinite(b.minX)) {
        if (entity.p1) includePoint(b, entity.p1.x, entity.p1.y);
        if (entity.p2) includePoint(b, entity.p2.x, entity.p2.y);
        if (entity.dimLine) includePoint(b, entity.dimLine.x, entity.dimLine.y);
      }
    } else if (entity.type === 'insert') {
      const block = blocks && blocks[entity.name];
      if (block) {
        const bb = emptyBounds();
        for (const be of block.entities || []) mergeBounds(bb, entityModelBounds(be, blocks, depth + 1));
        if (Number.isFinite(bb.minX)) {
          const corners = [[bb.minX, bb.minY], [bb.maxX, bb.minY], [bb.maxX, bb.maxY], [bb.minX, bb.maxY]];
          for (const corner of corners) {
            const pt = localInsertPoint(corner[0], corner[1], entity);
            includePoint(b, pt.x, pt.y);
          }
        }
      }
      if (!Number.isFinite(b.minX)) includePoint(b, entity.x, entity.y);
    }
    return b;
  }
  function drawingExtents(drawing, sourceBlocks) {
    const b = emptyBounds();
    for (const entity of drawing.entities || []) mergeBounds(b, entityModelBounds(entity, sourceBlocks));
    if (!Number.isFinite(b.minX)) return { minX: -500, minY: -500, maxX: 500, maxY: 500 };
    const width = Math.max(1, b.maxX - b.minX);
    const height = Math.max(1, b.maxY - b.minY);
    const pad = Math.max(250, Math.max(width, height) * 0.035);
    return { minX: b.minX - pad, minY: b.minY - pad, maxX: b.maxX + pad, maxY: b.maxY + pad };
  }
  function applySavedZoomExtents(dxf, extents) {
    const width = Math.max(1, extents.maxX - extents.minX);
    const height = Math.max(1, extents.maxY - extents.minY);
    const centerX = (extents.minX + extents.maxX) / 2;
    const centerY = (extents.minY + extents.maxY) / 2;
    const viewportAspect = 1.34;
    const viewHeight = Math.max(height, width / viewportAspect) * 1.04;
    let out = dxf;
    out = out.replace(/(\$EXTMIN\n\s*10\n)[^\n]+(\n\s*20\n)[^\n]+(\n\s*30\n)[^\n]+/, `$1${fixed(extents.minX)}$2${fixed(extents.minY)}$3${fixed(0)}`);
    out = out.replace(/(\$EXTMAX\n\s*10\n)[^\n]+(\n\s*20\n)[^\n]+(\n\s*30\n)[^\n]+/, `$1${fixed(extents.maxX)}$2${fixed(extents.maxY)}$3${fixed(0)}`);
    out = out.replace(/(AcDbViewportTableRecord[\s\S]*?\n\s*12\n)[^\n]+(\n\s*22\n)[^\n]+([\s\S]*?\n\s*40\n)[^\n]+(\n\s*41\n)[^\n]+/, `$1${fixed(centerX)}$2${fixed(centerY)}$3${fixed(viewHeight)}$4${fixed(viewportAspect)}`);
    out = out.replace(/(AcDbLayout\n\s*1\nModel[\s\S]*?\n\s*14\n)[^\n]+(\n\s*24\n)[^\n]+(\n\s*34\n)[^\n]+(\n\s*15\n)[^\n]+(\n\s*25\n)[^\n]+(\n\s*35\n)[^\n]+/, `$1${fixed(extents.minX)}$2${fixed(extents.minY)}$3${fixed(0)}$4${fixed(extents.maxX)}$5${fixed(extents.maxY)}$6${fixed(0)}`);
    return out;
  }

  function commonEntityPrefix(type, handle, owner, layerName, entity) {
    return [pair(0, type), pair(5, handle), pair(330, owner), pair(100, 'AcDbEntity'), pair(8, layerName), ...entityColorPairs(entity)];
  }
  function lineEntity(e, ctx) {
    if(ctx.polylines) return polyEntity({...e,points:[[e.x1,e.y1],[e.x2,e.y2]],closed:false},ctx);
    return [...commonEntityPrefix('LINE', ctx.nextHandle(), ctx.owner, ctx.layerName(e.layer), e), pair(100, 'AcDbLine'), pair(10, fixed(e.x1)), pair(20, fixed(e.y1)), pair(30, 0), pair(11, fixed(e.x2)), pair(21, fixed(e.y2)), pair(31, 0)];
  }
  function arcEntity(e,ctx){return [...commonEntityPrefix('ARC',ctx.nextHandle(),ctx.owner,ctx.layerName(e.layer),e),pair(6,e.linetype||'Continuous'),pair(100,'AcDbCircle'),pair(10,fixed(e.x)),pair(20,fixed(e.y)),pair(30,0),pair(40,fixed(e.radius)),pair(100,'AcDbArc'),pair(50,fixed(e.startAngle)),pair(51,fixed(e.endAngle))];}
  function circleEntity(e, ctx) {
    return [...commonEntityPrefix('CIRCLE', ctx.nextHandle(), ctx.owner, ctx.layerName(e.layer), e), pair(100, 'AcDbCircle'), pair(10, fixed(e.x)), pair(20, fixed(e.y)), pair(30, 0), pair(40, fixed(e.r))];
  }
  function polyEntity(e, ctx) {
    const points = e.points || [];
    const out = [...commonEntityPrefix('LWPOLYLINE', ctx.nextHandle(), ctx.owner, ctx.layerName(e.layer), e), pair(100, 'AcDbPolyline'), pair(90, points.length), pair(70, e.closed ? 1 : 0)];
    for (const p of points) out.push(pair(10, fixed(p[0])), pair(20, fixed(p[1])));
    return out;
  }
  function textAsMText(e) {
    if (e.dxfCellText !== undefined) {
      return {
        ...e,
        type: 'mtext',
        x: Number(e.dxfCellX),
        y: Number(e.dxfCellY),
        value: String(e.dxfCellText),
        width: Math.max(1, Number(e.dxfCellWidth) || Number(e.width) || 1000),
        attachment: Number(e.dxfAttachment) || 4,
        lineSpacing: Number(e.dxfLineSpacing) || 1.0,
        __convertedFromText: true
      };
    }
    const raw = String(e.value || '');
    const lines = raw.replace(/\\P/g, '\n').split(/\r?\n/);
    const longest = lines.reduce((value, line) => Math.max(value, line.length), 1);
    const height = Math.max(1, Number(e.height) || 80);
    const width = Math.max(height * 1.2, Number(e.width) || longest * height * 0.9 + height);
    const attachment = e.align === 'center' ? 5 : (e.align === 'right' ? 6 : 4);
    return { ...e, type: 'mtext', width, attachment, lineSpacing: e.lineSpacing || 1.0, __convertedFromText: true };
  }

  function mtextPayload(value) {
    // V53 chunking; Unicode code points preserve surrogate pairs at chunk boundaries.
    const chars=Array.from(value),out=[];while(chars.length>240)out.push(pair(3,chars.splice(0,240).join('')));out.push(pair(1,chars.join('')));return out;
  }
  function mtextEntity(e, ctx) {
    const attachment = Number(e.attachment) || (e.align === 'center' ? 5 : (e.align === 'right' ? 3 : 1));
    const out = [...commonEntityPrefix('MTEXT', ctx.nextHandle(), ctx.owner, ctx.layerName(e.layer), e), pair(100, 'AcDbMText'), pair(10, fixed(e.x)), pair(20, fixed(e.y)), pair(30, 0), pair(40, fixed(e.height || 80)), pair(41, fixed(Math.max(1, Number(e.width) || 1000))), pair(71, attachment), pair(72, 1), ...mtextPayload(cleanMText(root.PulumurProductPresentation ? root.PulumurProductPresentation.entityText(e) : e.value)), pair(7, ctx.textStyle || 'Standard'), pair(44, fixed(e.lineSpacing || 1.15))];
    if (Number(e.rotation)) out.push(pair(50, fixed(e.rotation)));
    return out;
  }
  function hatchPattern(e) {
    if (e.patternKind === 'brick') {
      const scale = Math.max(0.01, Number(e.patternScale) || 30);
      return {
        name: 'BRICK', type: 1, angle: 0, scale,
        lines: [
          { angle: 0, baseX: 0, baseY: 0, offsetX: 0, offsetY: 6.35 * scale, dashes: [] },
          { angle: 90, baseX: 0, baseY: 0, offsetX: -12.7 * scale, offsetY: 0, dashes: [6.35 * scale, -6.35 * scale] },
          { angle: 90, baseX: 6.35 * scale, baseY: 0, offsetX: -12.7 * scale, offsetY: 0, dashes: [-6.35 * scale, 6.35 * scale] }
        ]
      };
    }
    if (e.patternKind === 'fabric') {
      return {
        name: 'PULUMUR_FABRIC', type: 0, angle: 0, scale: 1,
        lines: [
          { angle: 90, baseX: 0, baseY: 0, offsetX: 150, offsetY: 0, dashes: [] },
          { angle: 90, baseX: 42, baseY: 0, offsetX: 150, offsetY: 0, dashes: [] }
        ]
      };
    }
    if (e.patternKind === 'screen') {
      return {
        name: 'PULUMUR_SCREEN', type: 0, angle: 0, scale: 1,
        lines: [
          { angle: 0, baseX: 0, baseY: 0, offsetX: 0, offsetY: 55, dashes: [14, -41] },
          { angle: 90, baseX: 0, baseY: 0, offsetX: 55, offsetY: 0, dashes: [14, -41] }
        ]
      };
    }
    return {
      name: 'ANSI31', type: 1, angle: Number(e.patternAngle) || 0, scale: Math.max(0.01, Number(e.patternScale) || 25),
      lines: [{ angle: 45, baseX: 0, baseY: 0, offsetX: -3.175, offsetY: 3.175, dashes: [] }]
    };
  }
  function hatchEntity(e, ctx) {
    const points = Array.isArray(e.points) ? e.points.filter(p => Array.isArray(p) && p.length >= 2) : [];
    if (points.length < 3) return [];
    const pattern = hatchPattern(e);
    const out = [
      ...commonEntityPrefix('HATCH', ctx.nextHandle(), ctx.owner, ctx.layerName(e.layer), e),
      pair(100, 'AcDbHatch'),
      pair(10, 0), pair(20, 0), pair(30, 0),
      pair(210, 0), pair(220, 0), pair(230, 1),
      pair(2, pattern.name), pair(70, 0), pair(71, 0),
      pair(91, 1), pair(92, 3), pair(72, 0), pair(73, 1), pair(93, points.length)
    ];
    for (const p of points) out.push(pair(10, fixed(p[0])), pair(20, fixed(p[1])));
    out.push(pair(97, 0), pair(75, 1), pair(76, pattern.type), pair(52, fixed(pattern.angle)), pair(41, fixed(pattern.scale)), pair(77, 0), pair(78, pattern.lines.length));
    for (const ln of pattern.lines) {
      out.push(pair(53, fixed(ln.angle)), pair(43, fixed(ln.baseX)), pair(44, fixed(ln.baseY)), pair(45, fixed(ln.offsetX)), pair(46, fixed(ln.offsetY)), pair(79, (ln.dashes || []).length));
      for (const dash of ln.dashes || []) out.push(pair(49, fixed(dash)));
    }
    out.push(pair(98, 0));
    return out;
  }
  function insertEntity(e, ctx, blockKey) {
    const out = [...commonEntityPrefix('INSERT', ctx.nextHandle(), ctx.owner, ctx.layerName(e.layer), e), pair(100, 'AcDbBlockReference'), pair(2, ctx.blockName(blockKey)), pair(10, fixed(e.x)), pair(20, fixed(e.y)), pair(30, 0), pair(41, fixedScale(Math.abs(e.scaleX || 1))), pair(42, fixedScale(e.scaleY || 1)), pair(43, 1)];
    if (Number(e.rotation)) out.push(pair(50, fixed(e.rotation)));
    return out;
  }
  function dimensionEntity(e, ctx) {
    const p1 = e.p1 || { x: 0, y: 0 };
    const p2 = e.p2 || { x: 0, y: 0 };
    const dl = e.dimLine || { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
    const tx = e.text || dl;
    const angle = Math.atan2(Number(p2.y) - Number(p1.y), Number(p2.x) - Number(p1.x)) * 180 / Math.PI;
    return [
      ...commonEntityPrefix('DIMENSION', ctx.nextHandle(), ctx.owner, ctx.layerName(e.layer), e),
      pair(100, 'AcDbDimension'), pair(280, 0), pair(2, ctx.blockName(e.blockName || '*D0')), pair(3, e.dimStyle || ctx.dimStyle || 'MESUT-MM'),
      pair(10, fixed(dl.x)), pair(20, fixed(dl.y)), pair(30, 0),
      pair(11, fixed(tx.x)), pair(21, fixed(tx.y)), pair(31, 0),
      pair(70, (e.aligned?33:32)+(e.manualText?128:0)), pair(71, 5), pair(1, e.textOverride == null ? '<>' : String(e.textOverride)),
      pair(100, 'AcDbAlignedDimension'),
      pair(13, fixed(p1.x)), pair(23, fixed(p1.y)), pair(33, 0),
      pair(14, fixed(p2.x)), pair(24, fixed(p2.y)), pair(34, 0), pair(50, fixed(angle)),
      ...(e.aligned?[]:[pair(100, 'AcDbRotatedDimension')])
    ];
  }
  function entityOut(e, ctx, sourceBlocks) {
    if (!e || e.dxfSkip) return [];
    if (e.type === 'line') return lineEntity(e, ctx);
    if (e.type === 'polyline') return polyEntity(e, ctx);
    if (e.type === 'circle') return circleEntity(e, ctx);
    if(e.type==='arc')return arcEntity(e,ctx);
    if (e.type === 'text') return mtextEntity(textAsMText(e), ctx);
    if (e.type === 'mtext') return mtextEntity(e, ctx);
    if (e.type === 'hatch') return hatchEntity(e, ctx);
    if (e.type === 'dimension') return dimensionEntity(e, ctx);
    if (e.type === 'insert') {
      if (isHeavyDisabledBlockName(e.name)) return [];
      if (!sourceBlocks[e.name]) return [];
      return insertEntity(e, ctx, e.mirrorX ? `${e.name}__MIRROR` : e.name);
    }
    return [];
  }

  function layerRecords(drawing, layerOriginals, layerMap, hiddenLayers, nextHandle) {
    const out = [];
    for (const original of layerOriginals) {
      if (original === '0' || original === 'Defpoints') continue;
      const name = layerMap.get(original);
      const aci = layerAci(drawing, original);
      const isHidden = !!(hiddenLayers && hiddenLayers[original]);
      out.push(pair(0, 'LAYER'), pair(5, nextHandle()), pair(330, LAYER_TABLE_HANDLE), pair(100, 'AcDbSymbolTableRecord'), pair(100, 'AcDbLayerTableRecord'), pair(2, name), pair(70, 0), pair(62, isHidden ? -aci : aci));
      const trueColor = layerTrueColor(drawing, original);
      if (Number.isFinite(trueColor)) out.push(pair(420, trueColor));
      out.push(pair(6, 'Continuous'), pair(370, -3), pair(390, PLOT_STYLE_HANDLE), pair(347, MATERIAL_HANDLE));
    }
    return out.join('\n');
  }
  function blockRecord(blockInfo) {
    return [pair(0, 'BLOCK_RECORD'), pair(5, blockInfo.recordHandle), pair(330, BLOCK_RECORD_TABLE_HANDLE), pair(100, 'AcDbSymbolTableRecord'), pair(100, 'AcDbBlockTableRecord'), pair(2, blockInfo.name), pair(340, 0), pair(70, 0), pair(280, 1), pair(281, 0)].join('\n');
  }
  function blockSection(blockInfo, ctx, sourceBlocks) {
    const anonymous = /^\*D\d+$/i.test(blockInfo.name) || blockInfo.block.anonymousDimension;
    const out = [pair(0, 'BLOCK'), pair(5, blockInfo.beginHandle), pair(330, blockInfo.recordHandle), pair(100, 'AcDbEntity'), pair(8, '0'), pair(100, 'AcDbBlockBegin'), pair(2, blockInfo.name), pair(70, anonymous ? 1 : 0), pair(10, 0), pair(20, 0), pair(30, 0), pair(3, blockInfo.name), pair(1, '')];
    const blockCtx = { ...ctx, owner: blockInfo.recordHandle };
    for (const e of blockInfo.block.entities || []) append(out, entityOut(e, blockCtx, sourceBlocks));
    out.push(pair(0, 'ENDBLK'), pair(5, blockInfo.endHandle), pair(330, blockInfo.recordHandle), pair(100, 'AcDbEntity'), pair(8, '0'), pair(100, 'AcDbBlockEnd'));
    return out.join('\n');
  }

  function replaceTemplateLine(template, token, value) {
    const content = String(value || '');
    if (content) return template.replace(token, content);
    // DXF is a strict code/value stream. Leaving an empty placeholder line
    // creates a blank group-code line and shifts every following pair.
    // AutoCAD then reports the failure at the next structural marker such as
    // ENDTAB/ENDSEC (observed as "Error in BLOCK_RECORD Table").
    return template.replace(`${token}\n`, '');
  }

  function toDxf(drawing) {
    if (!TEMPLATE) throw new Error('Modern DXF template could not be loaded.');
    if (root.PulumurDrawingEntityValidator) drawing = root.PulumurDrawingEntityValidator.assertValidDrawing(drawing || {}).drawing;
    drawing = dimensionModes(prepareDrawing(drawing || {}));
    const organized=drawing.metadata?.dxfProfile==='V53_R2018';
    const sourceBlocks = getBlocks(drawing);
    const usedBlocks = collectUsedBlocks(drawing, sourceBlocks);
    const layerOriginals = collectLayerNames(drawing, usedBlocks);
    const layerMap = createUniqueNameMap(layerOriginals, modernLayerName);
    const blockKeys = Array.from(usedBlocks.keys());
    const blockMap = createUniqueNameMap(blockKeys.map(key => {
      if (/^\*D\d+$/i.test(key)) return key;
      return key;
    }), modernBlockName);
    const nextHandle = handleAllocator();
    const blockInfos = blockKeys.map(key => ({
      key,
      name: blockMap.get(key),
      block: usedBlocks.get(key),
      recordHandle: nextHandle(),
      beginHandle: nextHandle(),
      endHandle: nextHandle()
    }));
    const blockInfoMap = new Map(blockInfos.map(info => [info.key, info]));
    const ctx = {
      nextHandle, polylines:organized, textStyle:organized?'PLMR_ARIAL':'Standard', dimStyle:organized?(drawing.metadata?.dimStyle||'PLMR_DIM_MM'):'MESUT-MM',
      owner: MODEL_SPACE_RECORD,
      layerName: original => layerMap.get(original || '0') || modernLayerName(original || '0'),
      blockName: key => (blockInfoMap.get(key) && blockInfoMap.get(key).name) || modernBlockName(key)
    };
    const hiddenLayers = drawing.hiddenLayers || drawing.dxfHiddenLayers || {};
    const customLayerRecords = layerRecords(drawing, layerOriginals, layerMap, hiddenLayers, nextHandle);
    const customBlockRecords = blockInfos.map(blockRecord).join('\n');
    const customBlocks = blockInfos.map(info => blockSection(info, ctx, sourceBlocks)).join('\n');
    const entityLines = [];
    for (const e of drawing.entities || []) { if (!e || e.previewOnly || e.hiddenDimension || e.type === 'interaction') continue; append(entityLines, entityOut(e, ctx, sourceBlocks)); }
    const extents = drawingExtents(drawing, sourceBlocks);
    let modern = (organized ? (root.PLMRR2018DxfTemplate || (typeof require!=='undefined' ? require('./r2018DxfTemplate.js') : '')) : TEMPLATE)
      .replace('__LAYER_COUNT__', String(2 + layerOriginals.filter(n => n !== '0' && n !== 'Defpoints').length))
      .replace('__BLOCK_RECORD_COUNT__', String(2 + blockInfos.length))
    modern = replaceTemplateLine(modern, '__CUSTOM_LAYER_RECORDS__', customLayerRecords);
    modern = replaceTemplateLine(modern, '__CUSTOM_BLOCK_RECORDS__', customBlockRecords);
    modern = replaceTemplateLine(modern, '__CUSTOM_BLOCKS__', customBlocks);
    modern = replaceTemplateLine(modern, '__ENTITIES__', entityLines.join('\n'));
    if((drawing.entities||[]).some(e=>e.type==='arc'&&e.linetype==='PLMR_DASHED')){
      const lines=modern.split('\n');let start=-1,end=-1,owner='',count=-1;
      for(let i=0;i<lines.length-3;i+=2)if(Number(lines[i])===0&&lines[i+1]==='TABLE'&&Number(lines[i+2])===2&&lines[i+3]==='LTYPE'){start=i;break;}
      if(start<0)throw Error('DXF LTYPE table missing.');
      for(let i=start+4;i<lines.length-1;i+=2){const c=Number(lines[i]);if(c===5&&!owner)owner=lines[i+1];if(c===70&&count<0)count=i+1;if(c===0&&lines[i+1]==='ENDTAB'){end=i;break;}}
      if(end<0||count<0||!owner)throw Error('DXF LTYPE table invalid.');
      lines[count]=String(Number(lines[count])+1);const record=[pair(0,'LTYPE'),pair(5,nextHandle()),pair(330,owner),pair(100,'AcDbSymbolTableRecord'),pair(100,'AcDbLinetypeTableRecord'),pair(2,'PLMR_DASHED'),pair(70,0),pair(3,'Door swing dashed'),pair(72,65),pair(73,2),pair(40,55),pair(49,35),pair(74,0),pair(49,-20),pair(74,0)].join('\n').split('\n');lines.splice(end,0,...record);modern=lines.join('\n');
    }
    if(organized)modern=addFeetDimStyle(modern,nextHandle);
    modern=modern.replace(/(\$HANDSEED\n\s*5\n)[^\n]+/,(_,head)=>head+nextHandle());
    if(organized){
      modern=modern.replace(/(\$DIMSTYLE\n\s*2\n)[^\n]+/,(_,head)=>head+ctx.dimStyle);
      modern=modern.replace(/(\$CLAYER\n\s*8\n)[^\n]+/,(_,head)=>head+(layerOriginals.includes('OLCULENDIRME_MM')?ctx.dimStyle.replace('PLMR_DIM_','OLCULENDIRME_'):'0'));
      const profile={PLMR_DIM_MM:{lfac:1,alt:0,dec:0,post:'<> mm'},PLMR_DIM_INCH:{lfac:1/25.4,alt:0,dec:2,post:'<> \"'},PLMR_DIM_MM_INCH:{lfac:1,alt:1,dec:0,post:'<> mm -'}}[ctx.dimStyle];
      for(const [key,code,value] of [['TEXTSTYLE',7,'PLMR_ARIAL'],['DIMTXSTY',7,'PLMR_ARIAL'],['INSUNITS',70,4],['MEASUREMENT',70,1],['DIMLFAC',40,profile.lfac],['DIMALT',70,profile.alt],['DIMALTF',40,1/25.4],['DIMDEC',70,profile.dec],['DIMALTD',70,2],['DIMPOST',1,profile.post],['DIMAPOST',1,profile.alt?'\"':''],['DIMCLRT',70,0],['DIMCLRD',70,256],['DIMCLRE',70,256]]){
        const re=new RegExp('(\\$'+key+'\\n\\s*'+code+'\\n)[^\\n]*');modern=modern.replace(re,(_,head)=>head+value);
      }
      // Edit complete DXF records rather than matching numeric values as group codes.
      const lines=modern.split('\n');let inDimStyle=false;
      for(let i=0;i<lines.length-1;i+=2){const code=Number(lines[i]);if(code===0)inDimStyle=lines[i+1]==='DIMSTYLE';if(inDimStyle&&[176,177,178].includes(code))lines[i+1]=code===178?'0':'256';}
      modern=lines.join('\n');
    }
    const result=applySavedZoomExtents(modern, extents).replace(/\n/g, '\r\n');
    if(organized&&root.PLMRDxfIntegrity)root.PLMRDxfIntegrity.assertValid(result);
    return result;
  }

  function safeFileName(value) {
    return cleanSingleLine(value)
      .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
      .replace(/ü/g, 'u').replace(/Ü/g, 'U')
      .replace(/ş/g, 's').replace(/Ş/g, 'S')
      .replace(/ı/g, 'i').replace(/İ/g, 'I')
      .replace(/ö/g, 'o').replace(/Ö/g, 'O')
      .replace(/ç/g, 'c').replace(/Ç/g, 'C')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'pergo-rise';
  }

  const api = { toDxf, safeFileName, modernLayerName, modernBlockName, version: 'AC1027-V850-ZOOM-EXTENTS-MESUTMM-HATCH-EMPTY-SLOT-SAFE' };
  root.PulumurModernDXF = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
