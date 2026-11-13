(function (root) {
  'use strict';

  const PT_PER_MM = 72 / 25.4;
  const ACI_HEX = {
    1: '#ff0000', 2: '#ffff00', 3: '#00ff00', 4: '#00ffff', 5: '#0000ff', 6: '#ff00ff',
    7: '#000000', 8: '#808080', 9: '#c0c0c0', 10: '#ff0000', 42: '#ffbf00', 130: '#00bf00', 167: '#293189', 256: null
  };

  const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const ascii = value => new TextEncoder().encode(String(value));
  const concatBytes = chunks => {
    const length = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const result = new Uint8Array(length);
    let offset = 0;
    chunks.forEach(chunk => { result.set(chunk, offset); offset += chunk.length; });
    return result;
  };

  function base64Bytes(value) {
    const source = String(value || '');
    if (typeof Buffer !== 'undefined') return new Uint8Array(Buffer.from(source, 'base64'));
    const binary = root.atob(source);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    return bytes;
  }

  function readU16(bytes, offset) { return ((bytes[offset] << 8) | bytes[offset + 1]) >>> 0; }
  function readS16(bytes, offset) { const value = readU16(bytes, offset); return value & 0x8000 ? value - 0x10000 : value; }
  function readU32(bytes, offset) { return (((bytes[offset] << 24) >>> 0) + (bytes[offset + 1] << 16) + (bytes[offset + 2] << 8) + bytes[offset + 3]) >>> 0; }
  function tagAt(bytes, offset) { return String.fromCharCode(bytes[offset], bytes[offset + 1], bytes[offset + 2], bytes[offset + 3]); }

  let parsedFont = null;
  function parseFont() {
    if (parsedFont) return parsedFont;
    const payload = root.PulumurPdfFontData;
    if (!payload || !payload.base64) throw new Error('PLMR PDF font verisi yüklenmedi.');
    const bytes = base64Bytes(payload.base64);
    const tables = {};
    const tableCount = readU16(bytes, 4);
    for (let index = 0; index < tableCount; index += 1) {
      const offset = 12 + index * 16;
      tables[tagAt(bytes, offset)] = { offset: readU32(bytes, offset + 8), length: readU32(bytes, offset + 12) };
    }
    const required = ['head', 'hhea', 'maxp', 'hmtx', 'cmap'];
    required.forEach(tag => { if (!tables[tag]) throw new Error(`PDF font tablosu eksik: ${tag}`); });
    const head = tables.head.offset;
    const hhea = tables.hhea.offset;
    const maxp = tables.maxp.offset;
    const hmtx = tables.hmtx.offset;
    const unitsPerEm = readU16(bytes, head + 18) || 1000;
    const numGlyphs = readU16(bytes, maxp + 4);
    const numberOfHMetrics = readU16(bytes, hhea + 34);
    const advances = new Array(numGlyphs);
    let lastAdvance = unitsPerEm;
    for (let glyph = 0; glyph < numGlyphs; glyph += 1) {
      if (glyph < numberOfHMetrics) lastAdvance = readU16(bytes, hmtx + glyph * 4);
      advances[glyph] = lastAdvance;
    }

    const cmapOffset = tables.cmap.offset;
    const cmapCount = readU16(bytes, cmapOffset + 2);
    const candidates = [];
    for (let index = 0; index < cmapCount; index += 1) {
      const record = cmapOffset + 4 + index * 8;
      const platform = readU16(bytes, record);
      const encoding = readU16(bytes, record + 2);
      const offset = cmapOffset + readU32(bytes, record + 4);
      const format = readU16(bytes, offset);
      let rank = 0;
      if (format === 12 && platform === 3 && encoding === 10) rank = 100;
      else if (format === 12 && platform === 0) rank = 90;
      else if (format === 4 && platform === 3) rank = 80;
      else if (format === 4 && platform === 0) rank = 70;
      if (rank) candidates.push({ rank, format, offset });
    }
    candidates.sort((a, b) => b.rank - a.rank);
    if (!candidates.length) throw new Error('PDF font cmap tablosu desteklenmiyor.');
    const cmap = candidates[0];

    let mapCodePoint;
    if (cmap.format === 12) {
      const groupCount = readU32(bytes, cmap.offset + 12);
      const groups = new Array(groupCount);
      for (let index = 0; index < groupCount; index += 1) {
        const offset = cmap.offset + 16 + index * 12;
        groups[index] = [readU32(bytes, offset), readU32(bytes, offset + 4), readU32(bytes, offset + 8)];
      }
      mapCodePoint = codePoint => {
        let low = 0, high = groups.length - 1;
        while (low <= high) {
          const middle = (low + high) >> 1;
          const group = groups[middle];
          if (codePoint < group[0]) high = middle - 1;
          else if (codePoint > group[1]) low = middle + 1;
          else return group[2] + codePoint - group[0];
        }
        return 0;
      };
    } else {
      const segCount = readU16(bytes, cmap.offset + 6) / 2;
      const endCodeOffset = cmap.offset + 14;
      const startCodeOffset = endCodeOffset + segCount * 2 + 2;
      const deltaOffset = startCodeOffset + segCount * 2;
      const rangeOffsetBase = deltaOffset + segCount * 2;
      mapCodePoint = codePoint => {
        if (codePoint > 0xffff) return 0;
        for (let index = 0; index < segCount; index += 1) {
          const end = readU16(bytes, endCodeOffset + index * 2);
          if (codePoint > end) continue;
          const start = readU16(bytes, startCodeOffset + index * 2);
          if (codePoint < start) return 0;
          const delta = readS16(bytes, deltaOffset + index * 2);
          const rangeOffsetPosition = rangeOffsetBase + index * 2;
          const rangeOffset = readU16(bytes, rangeOffsetPosition);
          if (!rangeOffset) return (codePoint + delta) & 0xffff;
          const address = rangeOffsetPosition + rangeOffset + (codePoint - start) * 2;
          if (address + 1 >= bytes.length) return 0;
          const glyph = readU16(bytes, address);
          return glyph ? (glyph + delta) & 0xffff : 0;
        }
        return 0;
      };
    }

    parsedFont = {
      bytes, unitsPerEm, advances, mapCodePoint,
      bbox: [readS16(bytes, head + 36), readS16(bytes, head + 38), readS16(bytes, head + 40), readS16(bytes, head + 42)],
      ascent: readS16(bytes, hhea + 4), descent: readS16(bytes, hhea + 6)
    };
    return parsedFont;
  }

  function resolvePageSize(format, orientation) {
    const named = { a4: [210, 297], a3: [297, 420], a2: [420, 594], a1: [594, 841], a0: [841, 1189] };
    let size = Array.isArray(format) ? [finite(format[0], 210), finite(format[1], 297)] : (named[String(format || 'a4').toLowerCase()] || named.a4).slice();
    const landscape = String(orientation || '').toLowerCase().startsWith('l');
    if (landscape && size[0] < size[1]) size = [size[1], size[0]];
    if (!landscape && String(orientation || '').toLowerCase().startsWith('p') && size[0] > size[1]) size = [size[1], size[0]];
    return size;
  }

  class NativePdfDocument {
    constructor(options) {
      const config = options || {};
      const size = resolvePageSize(config.format, config.orientation);
      this.pages = [{ width: size[0], height: size[1], operations: [] }];
      this.pageIndex = 0;
      this.state = { drawColor: [0, 0, 0], textColor: [0, 0, 0], fillColor: [255, 255, 255], lineWidth: 0.18, dash: [], fontSize: 10, fontName: 'PLMRNoto' };
      this.__plmrNativePdf = true;
      this.__plmrFontName = 'PLMRNoto';
      this.internal = { pageSize: { getWidth: () => this.currentPage().width, getHeight: () => this.currentPage().height } };
    }
    currentPage() { return this.pages[this.pageIndex]; }
    snapshot(extra) { return { ...this.state, ...(extra || {}) }; }
    record(type, data) { this.currentPage().operations.push({ type, ...this.snapshot(data) }); return this; }
    addPage(format, orientation) { const size = resolvePageSize(format || 'a4', orientation || 'portrait'); this.pages.push({ width: size[0], height: size[1], operations: [] }); this.pageIndex = this.pages.length - 1; return this; }
    setDrawColor(r, g, b) { this.state.drawColor = [clamp(finite(r), 0, 255), clamp(finite(g), 0, 255), clamp(finite(b), 0, 255)]; return this; }
    setTextColor(r, g, b) { this.state.textColor = [clamp(finite(r), 0, 255), clamp(finite(g), 0, 255), clamp(finite(b), 0, 255)]; return this; }
    setFillColor(r, g, b) { this.state.fillColor = [clamp(finite(r), 0, 255), clamp(finite(g), 0, 255), clamp(finite(b), 0, 255)]; return this; }
    setLineWidth(value) { this.state.lineWidth = Math.max(0.01, finite(value, 0.18)); return this; }
    setLineDashPattern(values) { this.state.dash = Array.isArray(values) ? values.map(value => Math.max(0, finite(value))).filter(value => value > 0) : []; return this; }
    setFont(name) { this.state.fontName = String(name || 'PLMRNoto'); return this; }
    setFontSize(value) { this.state.fontSize = Math.max(1, finite(value, 10)); return this; }
    line(x1, y1, x2, y2) { return this.record('line', { x1: finite(x1), y1: finite(y1), x2: finite(x2), y2: finite(y2) }); }
    circle(x, y, radius, style) { return this.record('circle', { x: finite(x), y: finite(y), radius: Math.abs(finite(radius)), style: style || 'S' }); }
    rect(x, y, width, height, style) { return this.record('rect', { x: finite(x), y: finite(y), width: finite(width), height: finite(height), style: style || 'S' }); }
    text(value, x, y, options) { return this.record('text', { value: String(value == null ? '' : value), x: finite(x), y: finite(y), options: options || {} }); }
    output(kind) {
      const bytes = buildPdfBytes(this.pages);
      if (kind === 'arraybuffer') return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
      if (kind === 'blob') return new Blob([bytes], { type: 'application/pdf' });
      if (kind === 'uint8array') return bytes;
      let binary = '';
      const chunk = 0x8000;
      for (let offset = 0; offset < bytes.length; offset += chunk) binary += String.fromCharCode(...bytes.subarray(offset, offset + chunk));
      return binary;
    }
  }

  function pdfNumber(value) { return Number(finite(value).toFixed(4)).toString(); }
  function rgbCommand(color, stroke) { return `${color.map(value => pdfNumber(value / 255)).join(' ')} ${stroke ? 'RG' : 'rg'}\n`; }
  function utf16Hex(codePoint) {
    if (codePoint <= 0xffff) return codePoint.toString(16).padStart(4, '0').toUpperCase();
    const adjusted = codePoint - 0x10000;
    const high = 0xd800 + (adjusted >> 10);
    const low = 0xdc00 + (adjusted & 0x3ff);
    return high.toString(16).padStart(4, '0').toUpperCase() + low.toString(16).padStart(4, '0').toUpperCase();
  }

  function glyphRun(text, font, used) {
    let hex = '';
    let width = 0;
    for (const character of String(text || '')) {
      const codePoint = character.codePointAt(0);
      let glyph = font.mapCodePoint(codePoint);
      if (!glyph) glyph = font.mapCodePoint(63) || 0;
      glyph &= 0xffff;
      hex += glyph.toString(16).padStart(4, '0').toUpperCase();
      width += font.advances[glyph] || font.unitsPerEm * 0.6;
      if (!used.has(glyph)) used.set(glyph, codePoint);
    }
    return { hex, width };
  }

  function textCommand(operation, pageHeightPt, font, used) {
    const fontSizePt = finite(operation.fontSize, 10);
    const run = glyphRun(operation.value, font, used);
    const approximateWidthPt = run.width / font.unitsPerEm * fontSizePt;
    let x = finite(operation.x) * PT_PER_MM;
    let y = pageHeightPt - finite(operation.y) * PT_PER_MM;
    const options = operation.options || {};
    if (options.align === 'center') x -= approximateWidthPt / 2;
    else if (options.align === 'right') x -= approximateWidthPt;
    if (options.baseline === 'middle') y -= fontSizePt * 0.34;
    const angle = -finite(options.angle, 0) * Math.PI / 180;
    const cos = Math.cos(angle), sin = Math.sin(angle);
    return `${rgbCommand(operation.textColor, false)}BT\n/F1 ${pdfNumber(fontSizePt)} Tf\n${pdfNumber(cos)} ${pdfNumber(sin)} ${pdfNumber(-sin)} ${pdfNumber(cos)} ${pdfNumber(x)} ${pdfNumber(y)} Tm\n<${run.hex}> Tj\nET\n`;
  }

  function pageContent(page, font, used) {
    const pageHeightPt = page.height * PT_PER_MM;
    let content = '1 J 1 j\n';
    page.operations.forEach(operation => {
      const draw = rgbCommand(operation.drawColor, true);
      const fill = rgbCommand(operation.fillColor, false);
      const width = `${pdfNumber(operation.lineWidth * PT_PER_MM)} w\n`;
      const dash = operation.dash && operation.dash.length ? `[${operation.dash.map(value => pdfNumber(value * PT_PER_MM)).join(' ')}] 0 d\n` : '[] 0 d\n';
      const px = value => finite(value) * PT_PER_MM;
      const py = value => pageHeightPt - finite(value) * PT_PER_MM;
      if (operation.type === 'line') {
        content += draw + width + dash + `${pdfNumber(px(operation.x1))} ${pdfNumber(py(operation.y1))} m ${pdfNumber(px(operation.x2))} ${pdfNumber(py(operation.y2))} l S\n`;
      } else if (operation.type === 'rect') {
        const x = px(operation.x), y = pageHeightPt - px(operation.y + operation.height), w = px(operation.width), h = px(operation.height);
        content += (operation.style === 'F' ? fill : draw + width + dash) + `${pdfNumber(x)} ${pdfNumber(y)} ${pdfNumber(w)} ${pdfNumber(h)} re ${operation.style === 'F' ? 'f' : 'S'}\n`;
      } else if (operation.type === 'circle') {
        const x = px(operation.x), y = py(operation.y), r = px(operation.radius), k = r * 0.5522847498;
        content += draw + width + dash + `${pdfNumber(x + r)} ${pdfNumber(y)} m ${pdfNumber(x + r)} ${pdfNumber(y + k)} ${pdfNumber(x + k)} ${pdfNumber(y + r)} ${pdfNumber(x)} ${pdfNumber(y + r)} c ${pdfNumber(x - k)} ${pdfNumber(y + r)} ${pdfNumber(x - r)} ${pdfNumber(y + k)} ${pdfNumber(x - r)} ${pdfNumber(y)} c ${pdfNumber(x - r)} ${pdfNumber(y - k)} ${pdfNumber(x - k)} ${pdfNumber(y - r)} ${pdfNumber(x)} ${pdfNumber(y - r)} c ${pdfNumber(x + k)} ${pdfNumber(y - r)} ${pdfNumber(x + r)} ${pdfNumber(y - k)} ${pdfNumber(x + r)} ${pdfNumber(y)} c S\n`;
      } else if (operation.type === 'text' && operation.value) {
        content += textCommand(operation, pageHeightPt, font, used);
      }
    });
    return ascii(content);
  }

  function buildToUnicode(used) {
    const entries = [...used.entries()].sort((a, b) => a[0] - b[0]);
    let body = '/CIDInit /ProcSet findresource begin\n12 dict begin\nbegincmap\n/CIDSystemInfo << /Registry (Adobe) /Ordering (UCS) /Supplement 0 >> def\n/CMapName /PLMRNoto-UCS def\n/CMapType 2 def\n1 begincodespacerange\n<0000> <FFFF>\nendcodespacerange\n';
    for (let index = 0; index < entries.length; index += 100) {
      const chunk = entries.slice(index, index + 100);
      body += `${chunk.length} beginbfchar\n`;
      chunk.forEach(([glyph, codePoint]) => { body += `<${glyph.toString(16).padStart(4, '0').toUpperCase()}> <${utf16Hex(codePoint)}>\n`; });
      body += 'endbfchar\n';
    }
    body += 'endcmap\nCMapName currentdict /CMap defineresource pop\nend\nend\n';
    return ascii(body);
  }

  function buildPdfBytes(pages) {
    const font = parseFont();
    const used = new Map();
    const contents = pages.map(page => pageContent(page, font, used));
    if (!used.size) used.set(font.mapCodePoint(32) || 3, 32);

    const objects = [null];
    const reserve = () => { objects.push(null); return objects.length - 1; };
    const set = (id, chunks) => { objects[id] = Array.isArray(chunks) ? chunks : [ascii(chunks)]; };
    const add = chunks => { const id = reserve(); set(id, chunks); return id; };
    const streamObject = (data, extra) => add([ascii(`<< /Length ${data.length}${extra ? ` ${extra}` : ''} >>\nstream\n`), data, ascii('\nendstream')]);

    const catalogId = reserve();
    const pagesId = reserve();
    const fontFileId = streamObject(font.bytes, `/Length1 ${font.bytes.length}`);
    const descriptorId = add(`<< /Type /FontDescriptor /FontName /PLMRNoto /Flags 32 /FontBBox [${font.bbox.join(' ')}] /ItalicAngle 0 /Ascent ${font.ascent} /Descent ${font.descent} /CapHeight ${font.ascent} /StemV 80 /FontFile2 ${fontFileId} 0 R >>`);
    const widths = [...used.keys()].sort((a, b) => a - b).map(glyph => `${glyph} [${Math.max(1, Math.round((font.advances[glyph] || font.unitsPerEm * 0.6) * 1000 / font.unitsPerEm))}]`).join(' ');
    const cidFontId = add(`<< /Type /Font /Subtype /CIDFontType2 /BaseFont /PLMRNoto /CIDSystemInfo << /Registry (Adobe) /Ordering (Identity) /Supplement 0 >> /FontDescriptor ${descriptorId} 0 R /DW 600 /W [${widths}] /CIDToGIDMap /Identity >>`);
    const toUnicodeId = streamObject(buildToUnicode(used));
    const fontId = add(`<< /Type /Font /Subtype /Type0 /BaseFont /PLMRNoto /Encoding /Identity-H /DescendantFonts [${cidFontId} 0 R] /ToUnicode ${toUnicodeId} 0 R >>`);

    const pageIds = [];
    pages.forEach((page, index) => {
      const contentId = streamObject(contents[index]);
      const pageId = add(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${pdfNumber(page.width * PT_PER_MM)} ${pdfNumber(page.height * PT_PER_MM)}] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentId} 0 R >>`);
      pageIds.push(pageId);
    });
    set(pagesId, `<< /Type /Pages /Count ${pageIds.length} /Kids [${pageIds.map(id => `${id} 0 R`).join(' ')}] >>`);
    set(catalogId, `<< /Type /Catalog /Pages ${pagesId} 0 R >>`);

    const header = ascii('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
    const chunks = [header];
    const offsets = [0];
    let offset = header.length;
    for (let id = 1; id < objects.length; id += 1) {
      offsets[id] = offset;
      const objectBytes = concatBytes([ascii(`${id} 0 obj\n`), ...objects[id], ascii('\nendobj\n')]);
      chunks.push(objectBytes);
      offset += objectBytes.length;
    }
    const xrefOffset = offset;
    let xref = `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
    for (let id = 1; id < objects.length; id += 1) xref += `${String(offsets[id]).padStart(10, '0')} 00000 n \n`;
    xref += `trailer\n<< /Size ${objects.length} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
    chunks.push(ascii(xref));
    return concatBytes(chunks);
  }

  function hexToRgb(hex) {
    const clean = String(hex || '#000000').replace('#', '').trim();
    if (!/^[0-9a-f]{6}$/i.test(clean)) return [0, 0, 0];
    const value = Number.parseInt(clean, 16);
    return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
  }

  function aciColorToHex(color, fallback) {
    if (root.PulumurGeometry && typeof root.PulumurGeometry.aciColorToHex === 'function') return root.PulumurGeometry.aciColorToHex(color, fallback || '#000000');
    const number = Number(color);
    if (!Number.isFinite(number) || number === 0 || number === 256) return fallback || '#000000';
    return ACI_HEX[number] || fallback || '#000000';
  }

  function entityColor(entity, layerStyle) {
    const style = (layerStyle && layerStyle[entity.layer]) || (layerStyle && layerStyle.OUTLINE) || { stroke: '#000000', width: 1 };
    if (entity && typeof entity.hexColor === 'string' && /^#?[0-9a-f]{6}$/i.test(entity.hexColor)) return entity.hexColor.startsWith('#') ? entity.hexColor : `#${entity.hexColor}`;
    return aciColorToHex(entity && entity.color, style.stroke || '#000000');
  }

  function applyEntityStyle(pdf, entity, layerStyle, scale) {
    const style = (layerStyle && layerStyle[entity.layer]) || (layerStyle && layerStyle.OUTLINE) || { stroke: '#000000', width: 1 };
    const [r, g, b] = hexToRgb(entityColor(entity, layerStyle));
    pdf.setDrawColor(r, g, b);
    pdf.setTextColor(r, g, b);
    pdf.setLineWidth(Math.max(0.04, Math.min(0.30, (finite(style.width, 1)) * Math.max(0.0001, scale) * 0.85)));
    if (typeof pdf.setLineDashPattern === 'function') {
      const pattern = entity.linetype==='PLMR_DASHED' ? '35 20' : style.dash;
      const dash = pattern ? String(pattern).split(/\s+/).map(Number).filter(Number.isFinite).map(value => Math.max(0.12, value * scale)) : [];
      pdf.setLineDashPattern(dash, 0);
    }
  }

  function drawEntity(pdf, entity, transform, fontName, layerStyle) {
    if (!entity || entity.previewOnly || entity.type === 'interaction') return;
    const scale = finite(transform && transform.scale, 1);
    const mx = value => finite(transform && transform.x) + finite(value) * scale;
    const my = value => finite(transform && transform.y) - finite(value) * scale;
    applyEntityStyle(pdf, entity, layerStyle || {}, scale);
    if (entity.type === 'line') {
      if (finite(entity.x1) !== finite(entity.x2) || finite(entity.y1) !== finite(entity.y2)) pdf.line(mx(entity.x1), my(entity.y1), mx(entity.x2), my(entity.y2));
    } else if (entity.type === 'polyline') {
      const points = Array.isArray(entity.points) ? entity.points : [];
      const drawSegment = (first, second) => {
        if (!Array.isArray(first) || !Array.isArray(second)) return;
        if (finite(first[0]) === finite(second[0]) && finite(first[1]) === finite(second[1])) return;
        pdf.line(mx(first[0]), my(first[1]), mx(second[0]), my(second[1]));
      };
      for (let index = 0; index < points.length - 1; index += 1) drawSegment(points[index], points[index + 1]);
      if (entity.closed && points.length > 2) drawSegment(points[points.length - 1], points[0]);
    } else if (entity.type === 'arc') {
      const start=finite(entity.startAngle)*Math.PI/180,sweep=(((finite(entity.endAngle)-finite(entity.startAngle))%360+360)%360||360)*Math.PI/180,r=Math.abs(finite(entity.radius)),length=r*sweep;
      const span=(from,to)=>{const n=Math.max(1,Math.ceil((to-from)/Math.max(r,1)*180/Math.PI/3));let previous=null;for(let i=0;i<=n;i++){const a=start+(from+(to-from)*i/n)/Math.max(r,1),p=[mx(entity.x+r*Math.cos(a)),my(entity.y+r*Math.sin(a))];if(previous)pdf.line(...previous,...p);previous=p;}};
      if(entity.linetype==='PLMR_DASHED'){pdf.setLineDashPattern?.([],0);for(let d=0;d<length;d+=55)span(d,Math.min(length,d+35));}else span(0,length);
    } else if (entity.type === 'circle') pdf.circle(mx(entity.x), my(entity.y), Math.abs(finite(entity.r) * scale), 'S');
    else if ((entity.type === 'text' || entity.type === 'mtext') && entity.value) {
      // Native V07 movement marks are drawn as vectors: the host's embedded
      // text font has no arrow glyphs and would otherwise emit question marks.
      if (/^[←→↺↻]$/.test(entity.value)) {
        const h=finite(entity.height,30),x=finite(entity.x),y=finite(entity.y),angle=finite(entity.rotation)*Math.PI/180;
        const point=(u,v)=>[mx(x+u*Math.cos(angle)-v*Math.sin(angle)),my(y+u*Math.sin(angle)+v*Math.cos(angle))],line=(a,b)=>pdf.line(...point(...a),...point(...b));
        const head=(p,dx,dy)=>{line(p,[p[0]-dx*h*.23-dy*h*.16,p[1]-dy*h*.23+dx*h*.16]);line(p,[p[0]-dx*h*.23+dy*h*.16,p[1]-dy*h*.23-dx*h*.16]);};
        if(entity.value==='←'||entity.value==='→'){const d=entity.value==='←'?-1:1;line([-h*.45,0],[h*.45,0]);head([d*h*.45,0],d,0);}
        else {const sign=entity.value==='↺'?1:-1,r=h*.42,start=-Math.PI*.3,sweep=Math.PI*1.65;let prev=null,end;
          for(let i=0;i<=40;i++){const t=start+sweep*i/40,p=[sign*r*Math.cos(t),r*Math.sin(t)];if(prev)line(prev,p);prev=p;end=t;}head(prev,-sign*Math.sin(end),Math.cos(end));}
        return;
      }
      const sizeMm = Math.max(0.75, finite(entity.height, 30) * scale);
      pdf.setFont(fontName || pdf.__plmrFontName || 'PLMRNoto', 'normal');
      pdf.setFontSize(sizeMm * 72 / 25.4);
      const displayValue = root.PulumurProductPresentation ? root.PulumurProductPresentation.entityText(entity) : String(entity.value);
      const lines = entity.type === 'mtext' ? displayValue.split('\\P') : [displayValue];
      const align = entity.align === 'center' ? 'center' : (entity.align === 'right' ? 'right' : 'left');
      lines.forEach((line, index) => pdf.text(line, mx(entity.x), my(entity.y) + index * sizeMm * 1.15, { align, baseline: 'middle', angle: -finite(entity.rotation) }));
    }
  }

  function flattenDrawing(drawing) {
    if (root.PulumurGeometry && typeof root.PulumurGeometry.flattenDrawingForExport === 'function') return root.PulumurGeometry.flattenDrawingForExport(drawing);
    return { entities: drawing.entities || [], bounds: drawing.bounds || { minX: 0, minY: 0, maxX: 1, maxY: 1, width: 1, height: 1 }, layerStyle: drawing.layerStyle || {} };
  }

  function drawDrawing(pdf, drawing, transform, options) {
    const flat = options && options.flat ? options.flat : flattenDrawing(drawing);
    const fontName = options && options.fontName;
    const layerStyle = flat.layerStyle || drawing.layerStyle || {};
    (flat.entities || []).forEach(entity => drawEntity(pdf, entity, transform, fontName, layerStyle));
    if (typeof pdf.setLineDashPattern === 'function') pdf.setLineDashPattern([], 0);
    return flat;
  }

  function drawFitPage(pdf, drawing, page, margin, options) {
    const flat = flattenDrawing(drawing);
    const bounds = flat.bounds;
    const usableWidth = Math.max(1, page.width - margin * 2);
    const usableHeight = Math.max(1, page.height - margin * 2);
    const width = Math.max(1, finite(bounds.width, bounds.maxX - bounds.minX));
    const height = Math.max(1, finite(bounds.height, bounds.maxY - bounds.minY));
    const scale = Math.min(usableWidth / width, usableHeight / height);
    const transform = {
      scale,
      x: (page.width - width * scale) / 2 - bounds.minX * scale,
      y: (page.height + height * scale) / 2 + bounds.minY * scale
    };
    if (typeof pdf.setFillColor === 'function') pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, page.width, page.height, 'F');
    drawDrawing(pdf, drawing, transform, { ...(options || {}), flat });
    return { flat, transform };
  }

  function ensureJsPdf() {
    return Promise.resolve(root.jspdf && root.jspdf.jsPDF ? root.jspdf.jsPDF : NativePdfDocument);
  }

  const api = { NativePdfDocument, ensureJsPdf, drawEntity, drawDrawing, drawFitPage, flattenDrawing, entityColor, aciColorToHex, hexToRgb, buildPdfBytes };
  root.PulumurVectorPdfEngine = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
