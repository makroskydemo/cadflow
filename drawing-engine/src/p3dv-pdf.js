(function () {
  'use strict';

  const MM_TO_PT = 72 / 25.4;

  function safeText(value) {
    return String(value == null ? '' : value)
      .replace(/\u00A0/g, ' ')
      .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
      .replace(/ü/g, 'u').replace(/Ü/g, 'U')
      .replace(/ş/g, 's').replace(/Ş/g, 'S')
      .replace(/ı/g, 'i').replace(/İ/g, 'I')
      .replace(/ö/g, 'o').replace(/Ö/g, 'O')
      .replace(/ç/g, 'c').replace(/Ç/g, 'C')
      .replace(/[’‘`]/g, "'")
      .replace(/[“”]/g, '"')
      .replace(/[–—−]/g, '-')
      .replace(/·/g, ' - ')
      .replace(/×/g, 'x')
      .replace(/≤/g, '<=')
      .replace(/≥/g, '>=')
      .replace(/±/g, '+/-')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\x20-\x7E°]/g, '?');
  }

  function escapePdfText(value) {
    let output = '';
    for (const char of safeText(value)) {
      if (char === '\\') output += '\\\\';
      else if (char === '(') output += '\\(';
      else if (char === ')') output += '\\)';
      else if (char === '°') output += '\\260';
      else output += char;
    }
    return output;
  }

  function base64ToBytes(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    return bytes;
  }

  function dataUriBytes(dataUri) {
    const source = String(dataUri || '');
    const comma = source.indexOf(',');
    return comma >= 0 ? base64ToBytes(source.slice(comma + 1)) : new Uint8Array();
  }

  function jpegDimensions(bytes) {
    if (!bytes || bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return { width: 1280, height: 720 };
    let offset = 2;
    while (offset + 9 < bytes.length) {
      if (bytes[offset] !== 0xff) {
        offset += 1;
        continue;
      }
      const marker = bytes[offset + 1];
      const length = (bytes[offset + 2] << 8) + bytes[offset + 3];
      if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
        return {
          height: (bytes[offset + 5] << 8) + bytes[offset + 6],
          width: (bytes[offset + 7] << 8) + bytes[offset + 8]
        };
      }
      if (!Number.isFinite(length) || length < 2) break;
      offset += 2 + length;
    }
    return { width: 1280, height: 720 };
  }

  function normalizeColor(args, fallback) {
    if (!args.length) return fallback.slice();
    if (args.length === 1) {
      const gray = Math.max(0, Math.min(255, Number(args[0]) || 0));
      return [gray, gray, gray];
    }
    return [0, 1, 2].map((index) => Math.max(0, Math.min(255, Number(args[index]) || 0)));
  }

  function colorCommand(color, stroke) {
    const values = color.map((item) => (item / 255).toFixed(4)).join(' ');
    return `${values} ${stroke ? 'RG' : 'rg'}`;
  }

  function wordWrap(text, maxChars) {
    const source = safeText(text).replace(/\r\n?/g, '\n');
    const lines = [];
    source.split('\n').forEach((paragraph) => {
      const words = paragraph.trim() ? paragraph.trim().split(/\s+/) : [''];
      let current = '';
      words.forEach((rawWord) => {
        let word = rawWord;
        while (word.length > maxChars) {
          if (current) {
            lines.push(current);
            current = '';
          }
          lines.push(word.slice(0, maxChars));
          word = word.slice(maxChars);
        }
        const candidate = `${current} ${word}`.trim();
        if (candidate.length > maxChars && current) {
          lines.push(current);
          current = word;
        } else {
          current = candidate;
        }
      });
      if (current || !paragraph.trim()) lines.push(current);
    });
    return lines.length ? lines : [''];
  }

  class P3DVPdf {
    constructor(options = {}) {
      this.pageWidth = 210;
      this.pageHeight = 297;
      this.pages = [];
      this.images = [];
      this.fontStyle = 'normal';
      this.fontSize = 12;
      this.textColor = [0, 0, 0];
      this.drawColor = [0, 0, 0];
      this.fillColor = [255, 255, 255];
      this.lineWidth = 0.18;
      this.lineDash = [];
      this.addPage(options.format, options.orientation);
    }

    addPage() {
      this.pages.push({ commands: [], imageNames: new Set() });
      this.currentPage = this.pages[this.pages.length - 1];
      return this;
    }

    setFont(_family, style) {
      this.fontStyle = String(style || '').toLowerCase() === 'bold' ? 'bold' : 'normal';
      return this;
    }

    setFontSize(size) {
      this.fontSize = Number(size) || 12;
      return this;
    }

    setTextColor(...args) {
      this.textColor = normalizeColor(args, this.textColor);
      return this;
    }

    setDrawColor(...args) {
      this.drawColor = normalizeColor(args, this.drawColor);
      return this;
    }

    setFillColor(...args) {
      this.fillColor = normalizeColor(args, this.fillColor);
      return this;
    }

    setLineWidth(value) {
      this.lineWidth = Math.max(0.01, Number(value) || 0.18);
      return this;
    }

    setLineDashPattern(values) {
      this.lineDash = Array.isArray(values) ? values.map(Number).filter((value) => Number.isFinite(value) && value > 0) : [];
      return this;
    }

    strokePrefix() {
      const width = `${(this.lineWidth * MM_TO_PT).toFixed(3)} w`;
      const dash = this.lineDash.length ? `[${this.lineDash.map((value) => (value * MM_TO_PT).toFixed(3)).join(' ')}] 0 d` : '[] 0 d';
      return `${colorCommand(this.drawColor, true)} ${width} ${dash}`;
    }

    splitTextToSize(text, maxWidthMm) {
      const maxWidthPt = Math.max(1, Number(maxWidthMm) || 1) * MM_TO_PT;
      const averageCharPt = Math.max(2.4, this.fontSize * 0.52);
      const maxChars = Math.max(4, Math.floor(maxWidthPt / averageCharPt));
      return wordWrap(text, maxChars);
    }

    text(value, x, y, options = {}) {
      const lines = Array.isArray(value) ? value : [value];
      const fontRef = this.fontStyle === 'bold' ? 'F2' : 'F1';
      const lineStepMm = (this.fontSize * 1.18) / MM_TO_PT;
      lines.forEach((line, index) => {
        const safe = safeText(line);
        const approximateWidthPt = safe.length * this.fontSize * 0.52;
        let xPt = (Number(x) || 0) * MM_TO_PT;
        let yPt = (this.pageHeight - ((Number(y) || 0) + index * lineStepMm)) * MM_TO_PT;
        if (options.align === 'center') xPt -= approximateWidthPt / 2;
        else if (options.align === 'right') xPt -= approximateWidthPt;
        if (options.baseline === 'middle') yPt -= this.fontSize * 0.34;
        const angle = -(Number(options.angle) || 0) * Math.PI / 180;
        const cos = Math.cos(angle); const sin = Math.sin(angle);
        this.currentPage.commands.push(
          `${colorCommand(this.textColor, false)} BT /${fontRef} ${this.fontSize.toFixed(2)} Tf ${cos.toFixed(6)} ${sin.toFixed(6)} ${(-sin).toFixed(6)} ${cos.toFixed(6)} ${xPt.toFixed(2)} ${yPt.toFixed(2)} Tm (${escapePdfText(safe)}) Tj ET`
        );
      });
      return this;
    }

    rect(x, y, width, height, style) {
      const xPt = (Number(x) || 0) * MM_TO_PT;
      const yPt = (this.pageHeight - (Number(y) || 0) - (Number(height) || 0)) * MM_TO_PT;
      const wPt = (Number(width) || 0) * MM_TO_PT;
      const hPt = (Number(height) || 0) * MM_TO_PT;
      const paint = style === 'F' ? 'f' : (style === 'FD' || style === 'DF' ? 'B' : 'S');
      this.currentPage.commands.push(`${this.strokePrefix()} ${colorCommand(this.fillColor, false)} ${xPt.toFixed(2)} ${yPt.toFixed(2)} ${wPt.toFixed(2)} ${hPt.toFixed(2)} re ${paint}`);
      return this;
    }

    roundedRect(x, y, width, height, _rx, _ry, style) {
      return this.rect(x, y, width, height, style);
    }

    line(x1, y1, x2, y2) {
      const startX = (Number(x1) || 0) * MM_TO_PT;
      const startY = (this.pageHeight - (Number(y1) || 0)) * MM_TO_PT;
      const endX = (Number(x2) || 0) * MM_TO_PT;
      const endY = (this.pageHeight - (Number(y2) || 0)) * MM_TO_PT;
      this.currentPage.commands.push(`${this.strokePrefix()} ${startX.toFixed(2)} ${startY.toFixed(2)} m ${endX.toFixed(2)} ${endY.toFixed(2)} l S`);
      return this;
    }

    circle(x, y, radius, style) {
      const cx = (Number(x) || 0) * MM_TO_PT;
      const cy = (this.pageHeight - (Number(y) || 0)) * MM_TO_PT;
      const r = Math.abs(Number(radius) || 0) * MM_TO_PT;
      const k = r * 0.5522847498;
      const path = `${(cx+r).toFixed(2)} ${cy.toFixed(2)} m ${(cx+r).toFixed(2)} ${(cy+k).toFixed(2)} ${(cx+k).toFixed(2)} ${(cy+r).toFixed(2)} ${cx.toFixed(2)} ${(cy+r).toFixed(2)} c ${(cx-k).toFixed(2)} ${(cy+r).toFixed(2)} ${(cx-r).toFixed(2)} ${(cy+k).toFixed(2)} ${(cx-r).toFixed(2)} ${cy.toFixed(2)} c ${(cx-r).toFixed(2)} ${(cy-k).toFixed(2)} ${(cx-k).toFixed(2)} ${(cy-r).toFixed(2)} ${cx.toFixed(2)} ${(cy-r).toFixed(2)} c ${(cx+k).toFixed(2)} ${(cy-r).toFixed(2)} ${(cx+r).toFixed(2)} ${(cy-k).toFixed(2)} ${(cx+r).toFixed(2)} ${cy.toFixed(2)} c`;
      this.currentPage.commands.push(`${this.strokePrefix()} ${path} ${style === 'F' ? 'f' : 'S'}`);
      return this;
    }

    addImage(dataUrl, _format, x, y, width, height) {
      const bytes = dataUriBytes(dataUrl);
      if (!bytes.length) return this;
      const dimensions = jpegDimensions(bytes);
      const name = `Im${this.images.length + 1}`;
      this.images.push({ name, bytes, width: dimensions.width, height: dimensions.height });
      this.currentPage.imageNames.add(name);
      const xPt = (Number(x) || 0) * MM_TO_PT;
      const yPt = (this.pageHeight - (Number(y) || 0) - (Number(height) || 0)) * MM_TO_PT;
      const wPt = (Number(width) || 0) * MM_TO_PT;
      const hPt = (Number(height) || 0) * MM_TO_PT;
      this.currentPage.commands.push(`q ${wPt.toFixed(2)} 0 0 ${hPt.toFixed(2)} ${xPt.toFixed(2)} ${yPt.toFixed(2)} cm /${name} Do Q`);
      return this;
    }

    buildBlob() {
      const encoder = new TextEncoder();
      const encode = (value) => encoder.encode(value);
      const objects = [];
      const imageObjectNumbers = new Map();

      objects.push([encode('<< /Type /Catalog /Pages 2 0 R >>')]);
      objects.push([]);
      objects.push([encode('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>')]);
      objects.push([encode('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>')]);

      this.images.forEach((image) => {
        const objectNumber = objects.length + 1;
        imageObjectNumbers.set(image.name, objectNumber);
        objects.push([
          encode(`<< /Type /XObject /Subtype /Image /Width ${image.width} /Height ${image.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.bytes.length} >>\nstream\n`),
          image.bytes,
          encode('\nendstream')
        ]);
      });

      const pageObjectNumbers = [];
      const contentObjectNumbers = [];
      const pageWidthPt = this.pageWidth * MM_TO_PT;
      const pageHeightPt = this.pageHeight * MM_TO_PT;

      this.pages.forEach((page) => {
        const pageObjectNumber = objects.length + 1;
        const contentObjectNumber = pageObjectNumber + 1;
        pageObjectNumbers.push(pageObjectNumber);
        contentObjectNumbers.push(contentObjectNumber);
        objects.push([]);
        const contentBytes = encode(page.commands.join('\n'));
        objects.push([encode(`<< /Length ${contentBytes.length} >>\nstream\n`), contentBytes, encode('\nendstream')]);
      });

      objects[1] = [encode(`<< /Type /Pages /Kids [${pageObjectNumbers.map((number) => `${number} 0 R`).join(' ')}] /Count ${pageObjectNumbers.length} >>`)];

      this.pages.forEach((page, index) => {
        const xObjects = Array.from(page.imageNames).map((name) => `/${name} ${imageObjectNumbers.get(name)} 0 R`).join(' ');
        const resources = `<< /Font << /F1 3 0 R /F2 4 0 R >>${xObjects ? ` /XObject << ${xObjects} >>` : ''} >>`;
        const objectIndex = pageObjectNumbers[index] - 1;
        objects[objectIndex] = [encode(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidthPt.toFixed(2)} ${pageHeightPt.toFixed(2)}] /Resources ${resources} /Contents ${contentObjectNumbers[index]} 0 R >>`)];
      });

      const chunks = [];
      const offsets = [0];
      let length = 0;
      const push = (chunk) => {
        chunks.push(chunk);
        length += chunk.length;
      };
      const pushText = (value) => push(encode(value));
      pushText('%PDF-1.4\n');
      objects.forEach((parts, index) => {
        offsets.push(length);
        pushText(`${index + 1} 0 obj\n`);
        parts.forEach(push);
        pushText('\nendobj\n');
      });
      const xrefOffset = length;
      pushText(`xref\n0 ${objects.length + 1}\n`);
      pushText('0000000000 65535 f \n');
      for (let index = 1; index <= objects.length; index += 1) {
        pushText(`${String(offsets[index]).padStart(10, '0')} 00000 n \n`);
      }
      pushText(`trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);
      return new Blob(chunks, { type: 'application/pdf' });
    }

    save(filename) {
      const blob = this.buildBlob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename || 'p3dv.pdf';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
      return this;
    }
  }

  window.jspdf = { jsPDF: P3DVPdf };
})();
