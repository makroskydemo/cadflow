(function (root) {
  'use strict';
  const encoder = new TextEncoder();
  const XML_HEADER = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
  const NS = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';
  const REL_NS = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));
  const colName = index => { let name = ''; let n = index; while (n > 0) { n -= 1; name = String.fromCharCode(65 + (n % 26)) + name; n = Math.floor(n / 26); } return name; };
  const cellRef = (row, col) => `${colName(col)}${row}`;

  function cell(value, row, col, style) {
    const ref = cellRef(row, col);
    const s = style == null ? '' : ` s="${style}"`;
    if (value == null || value === '') return `<c r="${ref}"${s} t="inlineStr"><is><t></t></is></c>`;
    if (typeof value === 'number' && Number.isFinite(value)) return `<c r="${ref}"${s}><v>${value}</v></c>`;
    if (typeof value === 'boolean') return `<c r="${ref}"${s} t="b"><v>${value ? 1 : 0}</v></c>`;
    return `<c r="${ref}"${s} t="inlineStr"><is><t xml:space="preserve">${esc(value)}</t></is></c>`;
  }

  function rowsXml(rows) {
    return rows.map((row, rIndex) => {
      const rowNo = rIndex + 1;
      const height = row.height ? ` ht="${row.height}" customHeight="1"` : '';
      const cells = (row.values || []).map((value, cIndex) => cell(value, rowNo, cIndex + 1, Array.isArray(row.styles) ? row.styles[cIndex] : row.style)).join('');
      return `<row r="${rowNo}"${height}>${cells}</row>`;
    }).join('');
  }

  function sheetXml(def) {
    const cols = (def.columns || []).map((width, index) => `<col min="${index + 1}" max="${index + 1}" width="${width}" customWidth="1"/>`).join('');
    const maxCols = Math.max(1, ...(def.rows || []).map(row => (row.values || []).length));
    const maxRows = Math.max(1, (def.rows || []).length);
    const merges = (def.merges || []).length ? `<mergeCells count="${def.merges.length}">${def.merges.map(ref => `<mergeCell ref="${ref}"/>`).join('')}</mergeCells>` : '';
    const filter = def.autoFilter ? `<autoFilter ref="${def.autoFilter}"/>` : '';
    const freeze = def.freeze ? `<sheetViews><sheetView workbookViewId="0"><pane ySplit="${def.freeze}" topLeftCell="A${def.freeze + 1}" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>` : '<sheetViews><sheetView workbookViewId="0"/></sheetViews>';
    const orientation = def.orientation || 'landscape';
    return `${XML_HEADER}<worksheet xmlns="${NS}" xmlns:r="${REL_NS}"><dimension ref="A1:${colName(maxCols)}${maxRows}"/>${freeze}<sheetFormatPr defaultRowHeight="18"/><cols>${cols}</cols><sheetData>${rowsXml(def.rows || [])}</sheetData>${filter}${merges}<printOptions horizontalCentered="0" verticalCentered="0"/><pageMargins left="0.3" right="0.3" top="0.4" bottom="0.4" header="0.2" footer="0.2"/><pageSetup paperSize="9" orientation="${orientation}" fitToWidth="1" fitToHeight="0"/></worksheet>`;
  }

  function titleRows(title, subtitle, columnCount) {
    return [
      { values: [title], styles: [1], height: 30 },
      { values: [subtitle], styles: [2], height: 22 },
      { values: new Array(columnCount).fill(''), height: 8 }
    ];
  }
  function headerRow(values) { return { values, styles: values.map(() => 3), height: 24 }; }
  function dataRow(values, numericCols) { const nums = new Set(numericCols || []); return { values, styles: values.map((_, index) => nums.has(index) ? 5 : 4) }; }

  function sheetDefinitions(pkg, profile) {
    const info = pkg.projectInfo || {};
    const opt = pkg.options || {};
    const optimization = pkg.optimizationResult || {};
    const grouped = root.PulumurAlbertGenauSlidingRules ? root.PulumurAlbertGenauSlidingRules.groupCutItems(pkg.cutItems) : pkg.cutItems;
    const generatedDate = new Date(pkg.createdAt || Date.now()).toLocaleString('tr-TR');
    const summary = {
      cutQty: (pkg.cutItems || []).reduce((sum, row) => sum + Number(row.quantity || 0), 0),
      glassQty: (pkg.glassItems || []).reduce((sum, row) => sum + Number(row.quantity || 0), 0),
      positionQty: (pkg.positions || []).reduce((sum, row) => sum + Number(row.quantity || 0), 0)
    };

    const defs = [];
    defs.push({
      name: 'ÖZET', columns: [24, 34, 18, 18, 18, 22], merges: ['A1:F1', 'A2:F2', 'A4:C4', 'D4:F4', 'A11:F11', 'A12:F12'], orientation: 'portrait',
      rows: [
        ...titleRows('ALBERT GENAU · SLIDEMASTER 10', 'PLMR Sürme Üretim Pilotu · Makrosuz Sipariş Workbook', 6),
        { values: ['PAKET DURUMU', '', '', pkg.status, '', ''], styles: [3, 3, 3, pkg.status === 'READY_TO_ORDER' ? 7 : 8, 8, 8], height: 26 },
        { values: ['Proje', `${info.projectCode || ''} · ${info.projectName || ''}`, '', 'Müşteri', info.customerName || '', ''], styles: [3, 4, 4, 3, 4, 4] },
        { values: ['Sistem', profile.system, '', 'Pilot', profile.id, ''], styles: [3, 4, 4, 3, 4, 4] },
        { values: ['RAL', opt.ralCode || '', '', 'Yüzey', opt.surface || '', ''], styles: [3, 4, 4, 3, 4, 4] },
        { values: ['Poz adedi', summary.positionQty, 'Kesim adedi', summary.cutQty, 'Cam adedi', summary.glassQty], styles: [3, 5, 3, 5, 3, 5] },
        { values: ['Kullanılan stok çubuğu', optimization.stockBarsUsed || 0, 'Toplam fire (mm)', optimization.wasteTotal || 0, 'Kullanılabilir artık (mm)', optimization.reusableOffcutTotal || 0], styles: [3, 5, 3, 5, 3, 5] },
        { values: ['Atanamayan kesim', optimization.unassignedCount || 0, 'Kesim koruma kontrolü', optimization.conservationValid ? 'DOĞRULANDI' : 'HATA', 'Oluşturma', generatedDate], styles: [3, 5, 3, optimization.conservationValid ? 7 : 8, 3, 4] },
        { values: ['Pilot notları'], styles: [3], height: 22 },
        { values: ['Ekstra ray yalnız bilgi amaçlıdır; hesaplamaya dahil edilmez. Sineklik ve aksesuar BOM pilot kapsamı dışındadır. Stok eksikleri satın alma ihtiyacı olarak gösterilir ve READY_TO_ORDER durumunu engellemez.'], styles: [6], height: 52 }
      ]
    });

    defs.push({
      name: 'PROJE BİLGİLERİ', columns: [25, 46, 25, 46], merges: ['A1:D1', 'A2:D2'], orientation: 'portrait',
      rows: [
        ...titleRows('PROJE BİLGİLERİ', 'PLMR kanonik Standalone Sürme Project Model kaynağı', 4),
        headerRow(['Alan', 'Değer', 'Alan', 'Değer']),
        dataRow(['Müşteri', info.customerName || '', 'Proje adı', info.projectName || '']),
        dataRow(['Proje kodu', info.projectCode || '', 'Revizyon', info.revision || '']),
        dataRow(['Çizen', info.designer || '', 'Tarih', info.date || '']),
        dataRow(['Sistem', profile.system, 'Açılım', 'SIDE OPENING']),
        dataRow(['Cam', '10 MM TEMPERLİ', 'RAL', opt.ralCode || '']),
        dataRow(['Yüzey', opt.surface || '', 'Yatay ayar profili', opt.horizontalAdjustmentProfile ? 'EVET' : 'HAYIR']),
        dataRow(['Ekstra ray (bilgi)', Number(opt.extraRailCount) || 0, 'Sineklik', 'PASİF'], [1]),
        dataRow(['Kaynak hash', pkg.generatedFromHash || '', 'Üretim kural sürümü', profile.ruleCatalogVersion])
      ]
    });

    const cutRows = titleRows('KESİM LİSTESİ', 'Detaylı poz bazlı üretim kesimleri', 12);
    cutRows.push(headerRow(['Poz', 'Profil Kodu', 'Profil Açıklaması', 'Kesim Boyu (mm)', 'Adet', 'Sol Açı', 'Sağ Açı', 'RAL', 'Yüzey', 'Birim', 'Kural', 'Not']));
    (pkg.cutItems || []).forEach(row => cutRows.push(dataRow([row.positionNo, row.profileCode, row.profileName, row.cutLength, row.quantity, row.angleLeft, row.angleRight, row.color, row.surface, row.unit, row.sourceRule, row.notes], [3, 4, 5, 6])));
    defs.push({ name: 'KESİM LİSTESİ', columns: [14, 16, 34, 18, 10, 11, 11, 15, 13, 10, 28, 34], merges: ['A1:L1', 'A2:L2'], rows: cutRows, freeze: 4, autoFilter: `A4:L${cutRows.length}` });

    const groupedRows = titleRows('GRUPLANMIŞ KESİM', 'Aynı profil, ölçü, RAL ve yüzey birleştirilmiştir', 10);
    groupedRows.push(headerRow(['Pozlar', 'Profil Kodu', 'Profil Açıklaması', 'Kesim Boyu (mm)', 'Toplam Adet', 'Sol Açı', 'Sağ Açı', 'RAL', 'Yüzey', 'Kural']));
    (grouped || []).forEach(row => groupedRows.push(dataRow([row.positionNo, row.profileCode, row.profileName, row.cutLength, row.quantity, row.angleLeft, row.angleRight, row.color, row.surface, row.sourceRule], [3, 4, 5, 6])));
    defs.push({ name: 'GRUPLANMIŞ KESİM', columns: [23, 16, 34, 18, 13, 11, 11, 15, 13, 28], merges: ['A1:J1', 'A2:J2'], rows: groupedRows, freeze: 4, autoFilter: `A4:J${groupedRows.length}` });

    const glassRows = titleRows('CAM SİPARİŞ FORMU', 'SLIDEMASTER 10 · SIDE OPENING · 10 mm temperli cam', 14);
    glassRows.push(headerRow(['Poz', 'Cam Kodu', 'Cam Tipi', 'Kalınlık', 'Cam Rengi', 'Genişlik (mm)', 'Yükseklik (mm)', 'Adet', 'Temper', 'Lamine', 'Isıcam', 'Low-E', 'Kural', 'Açıklama']));
    (pkg.glassItems || []).forEach(row => glassRows.push(dataRow([row.positionNo, row.glassCode, row.glassType, row.thickness, row.color, row.width, row.height, row.quantity, row.processing.temper ? 'EVET' : 'HAYIR', row.processing.laminated ? 'EVET' : 'HAYIR', row.processing.insulated ? 'EVET' : 'HAYIR', row.processing.lowE ? 'EVET' : 'HAYIR', row.sourceRule, row.notes], [3, 5, 6, 7])));
    defs.push({ name: 'CAM SİPARİŞ FORMU', columns: [14, 22, 16, 12, 16, 17, 17, 10, 11, 11, 11, 11, 24, 34], merges: ['A1:N1', 'A2:N2'], rows: glassRows, freeze: 4, autoFilter: `A4:N${glassRows.length}` });

    const accessoryRows = titleRows('AKSESUAR LİSTESİ', 'Pilot kapsam kararı', 5);
    accessoryRows.push(headerRow(['Durum', 'Kod', 'Aksesuar', 'Adet', 'Açıklama']));
    accessoryRows.push({ values: ['KAPSAM DIŞI', '', '', 0, profile.exclusions.accessories], styles: [8, 4, 4, 5, 6], height: 42 });
    defs.push({ name: 'AKSESUAR LİSTESİ', columns: [18, 18, 30, 12, 72], merges: ['A1:E1', 'A2:E2'], rows: accessoryRows, orientation: 'portrait' });

    const stockRows = titleRows('PİLOT STOK', 'Her profil için 6000 ve 7000 mm · varsayılan 80 adet', 13);
    stockRows.push(headerRow(['Stok Kodu', 'Profil Kodu', 'Profil Adı', 'Stok Boyu', 'Mevcut', 'Rezerve', 'Testere Payı', 'Baş Temizleme', 'Son Temizleme', 'Min. Artık', 'RAL', 'Yüzey', 'Not']));
    (pkg.stockItems || []).forEach(row => stockRows.push(dataRow([row.stockCode, row.profileCode, row.profileName, row.stockLength, row.availableQuantity, row.reservedQuantity, row.kerf, row.startTrim, row.endTrim, row.minimumReusableOffcut, row.color, row.surface, row.notes], [3, 4, 5, 6, 7, 8, 9])));
    defs.push({ name: 'PİLOT STOK', columns: [20, 16, 34, 15, 12, 12, 15, 16, 16, 14, 15, 13, 34], merges: ['A1:M1', 'A2:M2'], rows: stockRows, freeze: 4, autoFilter: `A4:M${stockRows.length}` });

    const optRows = titleRows('KESİM OPTİMİZASYONU', `${optimization.algorithm || ''} · testere payı her kesim için`, 13);
    optRows.push(headerRow(['Çubuk', 'Stok Kodu', 'Profil', 'Stok Boyu', 'Kesim Sırası', 'Pozlar', 'Kesim Toplamı', 'Bıçak Payı', 'Baş/Son Payı', 'Kalan', 'Fire', 'Kullanılabilir Artık', 'RAL / Yüzey']));
    (optimization.bars || []).forEach(bar => optRows.push(dataRow([
      bar.barNo, bar.stockCode, `${bar.profileCode} · ${bar.profileName}`, bar.stockLength,
      bar.cuts.map(cut => cut.cutLength).join(' + '), bar.cuts.map(cut => cut.positionNo).join(', '), bar.cutLengthTotal, bar.kerfTotal,
      bar.startTrim + bar.endTrim, bar.remaining, bar.waste, bar.reusableOffcut, `${bar.color} / ${bar.surface}`
    ], [0, 3, 6, 7, 8, 9, 10, 11])));
    defs.push({ name: 'KESİM OPTİMİZASYONU', columns: [10, 20, 40, 14, 40, 24, 17, 15, 17, 14, 14, 20, 22], merges: ['A1:M1', 'A2:M2'], rows: optRows, freeze: 4, autoFilter: `A4:M${optRows.length}` });

    const buyRows = titleRows('SATIN ALMA İHTİYACI', 'Stok yetersizliği READY_TO_ORDER durumunu engellemez', 8);
    buyRows.push(headerRow(['Durum', 'Profil Kodu', 'Profil', 'Poz', 'Kesim Boyu', 'Eksik Adet', 'RAL / Yüzey', 'Açıklama']));
    const unassigned = optimization.unassignedCuts || [];
    if (!unassigned.length) buyRows.push({ values: ['STOK YETERLİ', '', '', '', '', 0, '', 'Atanamayan kesim bulunmuyor.'], styles: [7, 4, 4, 4, 5, 5, 4, 4] });
    else unassigned.forEach(cut => buyRows.push(dataRow(['SATIN ALMA', cut.profileCode, cut.profileName, cut.positionNo, cut.cutLength, 1, `${cut.color} / ${cut.surface}`, cut.reason], [4, 5])));
    defs.push({ name: 'SATIN ALMA İHTİYACI', columns: [18, 16, 34, 14, 16, 14, 22, 38], merges: ['A1:H1', 'A2:H2'], rows: buyRows, freeze: 4, autoFilter: `A4:H${buyRows.length}` });

    return defs;
  }

  function stylesXml() {
    return `${XML_HEADER}<styleSheet xmlns="${NS}"><fonts count="4"><font><sz val="10"/><name val="Aptos"/></font><font><b/><sz val="18"/><color rgb="FFFFFFFF"/><name val="Aptos Display"/></font><font><b/><sz val="11"/><color rgb="FF31495B"/><name val="Aptos"/></font><font><b/><sz val="10"/><color rgb="FFFFFFFF"/><name val="Aptos"/></font></fonts><fills count="7"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF102A43"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFE8F1F5"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFDAA520"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFE8F5EC"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFFFF1D6"/></patternFill></fill></fills><borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border><border><left style="thin"><color rgb="FFD5DEE5"/></left><right style="thin"><color rgb="FFD5DEE5"/></right><top style="thin"><color rgb="FFD5DEE5"/></top><bottom style="thin"><color rgb="FFD5DEE5"/></bottom><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="9"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="center"/></xf><xf numFmtId="0" fontId="2" fillId="3" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="center"/></xf><xf numFmtId="0" fontId="3" fillId="2" borderId="1" xfId="0" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf><xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf><xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyAlignment="1"><alignment horizontal="right" vertical="center"/><protection locked="1"/></xf><xf numFmtId="0" fontId="0" fillId="3" borderId="1" xfId="0" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf><xf numFmtId="0" fontId="2" fillId="5" borderId="1" xfId="0" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf><xf numFmtId="0" fontId="2" fillId="6" borderId="1" xfId="0" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`;
  }

  let crcTable;
  function makeCrcTable() {
    const table = new Uint32Array(256);
    for (let n = 0; n < 256; n += 1) { let c = n; for (let k = 0; k < 8; k += 1) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1); table[n] = c >>> 0; }
    return table;
  }
  function crc32(bytes) {
    if (!crcTable) crcTable = makeCrcTable();
    let crc = 0xffffffff;
    for (let i = 0; i < bytes.length; i += 1) crc = crcTable[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
  }
  function u16(value) { return Uint8Array.from([value & 255, (value >>> 8) & 255]); }
  function u32(value) { return Uint8Array.from([value & 255, (value >>> 8) & 255, (value >>> 16) & 255, (value >>> 24) & 255]); }
  function concat(parts) { const length = parts.reduce((sum, part) => sum + part.length, 0); const output = new Uint8Array(length); let offset = 0; parts.forEach(part => { output.set(part, offset); offset += part.length; }); return output; }
  function dosTime(date) { return ((date.getHours() & 31) << 11) | ((date.getMinutes() & 63) << 5) | ((date.getSeconds() / 2) & 31); }
  function dosDate(date) { return (((date.getFullYear() - 1980) & 127) << 9) | (((date.getMonth() + 1) & 15) << 5) | (date.getDate() & 31); }
  function zip(files) {
    const now = new Date(); const localParts = []; const centralParts = []; let offset = 0;
    Object.entries(files).forEach(([name, content]) => {
      const nameBytes = encoder.encode(name); const data = content instanceof Uint8Array ? content : encoder.encode(content); const crc = crc32(data);
      const local = concat([u32(0x04034b50), u16(20), u16(0x0800), u16(0), u16(dosTime(now)), u16(dosDate(now)), u32(crc), u32(data.length), u32(data.length), u16(nameBytes.length), u16(0), nameBytes, data]);
      localParts.push(local);
      const central = concat([u32(0x02014b50), u16(20), u16(20), u16(0x0800), u16(0), u16(dosTime(now)), u16(dosDate(now)), u32(crc), u32(data.length), u32(data.length), u16(nameBytes.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(offset), nameBytes]);
      centralParts.push(central); offset += local.length;
    });
    const central = concat(centralParts); const count = centralParts.length;
    const end = concat([u32(0x06054b50), u16(0), u16(0), u16(count), u16(count), u32(central.length), u32(offset), u16(0)]);
    return concat([...localParts, central, end]);
  }

  function createWorkbook(pkg, profile) {
    if (!pkg || pkg.schema !== 'plmr-production-package-v1') throw new Error('PRODUCTION_PACKAGE_REQUIRED');
    const sheets = sheetDefinitions(pkg, profile);
    const contentTypes = [`${XML_HEADER}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>`, ...sheets.map((_, index) => `<Override PartName="/xl/worksheets/sheet${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`), '</Types>'].join('');
    const workbookSheets = sheets.map((sheet, index) => `<sheet name="${esc(sheet.name)}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`).join('');
    const definedNames = sheets.map((sheet, index) => `<definedName name="_xlnm.Print_Area" localSheetId="${index}">'${sheet.name.replace(/'/g, "''")}'!$A$1:$${colName(Math.max(...sheet.rows.map(row => row.values.length)))}$${sheet.rows.length}</definedName>`).join('');
    const workbook = `${XML_HEADER}<workbook xmlns="${NS}" xmlns:r="${REL_NS}"><bookViews><workbookView xWindow="0" yWindow="0" windowWidth="24000" windowHeight="15000"/></bookViews><sheets>${workbookSheets}</sheets><definedNames>${definedNames}</definedNames><calcPr calcId="191029" fullCalcOnLoad="1"/></workbook>`;
    const rels = `${XML_HEADER}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets.map((_, index) => `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${index + 1}.xml"/>`).join('')}<Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`;
    const rootRels = `${XML_HEADER}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`;
    const files = { '[Content_Types].xml': contentTypes, '_rels/.rels': rootRels, 'xl/workbook.xml': workbook, 'xl/_rels/workbook.xml.rels': rels, 'xl/styles.xml': stylesXml() };
    sheets.forEach((sheet, index) => { files[`xl/worksheets/sheet${index + 1}.xml`] = sheetXml(sheet); });
    return zip(files);
  }

  root.PulumurProductionXlsxWriter = { createWorkbook, sheetDefinitions, zip };
  if (typeof module !== 'undefined') module.exports = root.PulumurProductionXlsxWriter;
})(typeof window !== 'undefined' ? window : globalThis);
