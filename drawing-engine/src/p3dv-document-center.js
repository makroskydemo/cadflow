(function () {
  'use strict';

  // Presentation only: existing language preference; no engineering or quotation state.
  const DOCUMENT_EN = Object.freeze({
    "Hücre metni tek PDF sayfasına sığmıyor. Metni kısaltın veya satırlara bölün.": "Cell text cannot fit on one PDF page. Shorten it or split it into rows.",
    "Tablo yapıştırmak için filtreyi temizleyin.": "Clear the filter before pasting a table.",
    "Belge Çalışma Alanı": "Document Workspace",
    "Değişiklikler yalnız bu belgeye uygulanır; çizim ve kesim optimizasyonu değişmez.": "Changes apply only to this document; the drawing and cut optimization stay unchanged.",
    "Tablolar": "Tables",
    "Ara / Filtrele": "Search / Filter",
    "Sütun": "Column",
    "Satır ekle": "Add row",
    "Geri al": "Undo",
    "Yinele": "Redo",
    "Tabloyu sıfırla": "Reset table",
    "Tabloyu kopyala": "Copy table",
    "CSV indir": "Download CSV",
    "Önceki": "Previous",
    "Sonraki": "Next",
    "Belge notları": "Document notes",
    "Taslağı indir": "Download draft",
    "Taslak dosyası aç": "Open draft file",
    "Taslak dosyası bu cihazdan indirilir; buluta kaydedilmez.": "The draft downloads as a file; it is not saved to the cloud.",
    "Projeden yeniden oluştur": "Regenerate from project",
    "Geçerli bir sayı girin.": "Enter a valid number.",
    "Sayı izin verilen aralıkta değil.": "The number is outside the allowed range.",
    "Metin değeri geçersiz.": "Invalid text value.",
    "Hücre en fazla 240 karakter olabilir.": "A cell can contain up to 240 characters.",
    "Bir tabloda en fazla 500 satır olabilir.": "A table can contain up to 500 rows.",
    "Yapıştırılacak alan tablo sınırlarını aşıyor.": "The pasted range exceeds the table limits.",
    "Yapıştırılan tablo biçimi geçersiz.": "Invalid pasted table format.",
    "Taslak kaynağı geçersiz.": "Invalid draft source.",
    "Taslak bu proje ve belge seçimiyle eşleşmiyor.": "This draft does not match the current project and document selection.",
    "Proje değişti. Belgeyi projeden yeniden oluşturun.": "The project changed. Regenerate the document from the project.",
    "Oturum değişti. Belge alanını yeniden açın.": "The session changed. Reopen the document workspace.",
    "Taslak dosyası en fazla 5 MB olabilir.": "A draft file can be up to 5 MB.",
    "Taslak dosyası geçersiz.": "Invalid draft file.",
    "Taslak sütunları geçersiz.": "Invalid draft columns.",
    "Belge notu en fazla 2000 karakter olabilir.": "Document notes can contain up to 2000 characters.",
    "Belge doğrulaması için güvenli HTTPS bağlantısı gerekir.": "A secure HTTPS connection is required for document validation.",
    "İşlem tamamlanamadı.": "The operation could not be completed.",
    "Önce işaretli hücreyi düzeltin.": "Correct the highlighted cell first.",
    "Belge değişikliği uygulandı.": "Document change applied.",
    "Bu seçimde düzenlenebilir tablo yok.": "There are no editable tables in this selection.",
    "satır": "rows",
    "Toplam adet": "Total quantity",
    "Toplam boy (mm)": "Total length (mm)",
    "Tüm sütunlar": "All columns",
    "Artan sırala": "Sort ascending",
    "Azalan sırala": "Sort descending",
    "Sütun genişliği": "Column width",
    "Satır işlemleri": "Row actions",
    "Satırı çoğalt": "Duplicate row",
    "Yukarı taşı": "Move up",
    "Aşağı taşı": "Move down",
    "Satırı sil": "Delete row",
    "Satır bulunamadı.": "No rows found.",
    "Kaydedilmemiş belge değişiklikleri kapatılsın mı?": "Close with unsaved document changes?",
    "Bu tablo üretilen ilk verilere dönsün mü?": "Reset this table to the originally generated data?",
    "Taslak dosyası indirildi.": "Draft file downloaded.",
    "Tablo kopyalandı.": "Table copied.",
    "Belge değişiklikleri yeni proje verileriyle değiştirilsin mi?": "Replace document changes with the latest project data?",
    "Belge projeden yeniden oluşturuldu.": "Document regenerated from project.",
    "Tablo yapıştırıldı.": "Table pasted.",
    "Mevcut belge taslak dosyasıyla değiştirilsin mi?": "Replace the current document with the draft file?",
    "Taslak dosyası açıldı.": "Draft file opened.",
    "Birim Fiyat": "Unit price",
    "Birim Ağırlık": "Unit weight",
    "Boy (mm)": "Length (mm)",
    "Kesim Boyu (mm)": "Cut length (mm)",
    "Stok Boyu (mm)": "Stock length (mm)",
    "Tahmini Kalan (mm)": "Estimated remainder (mm)",
    "Tabloları İncele": "Review tables",
    "Tablolar Hazırlanıyor": "Preparing tables",
    "Belge düzenlemeleri": "Document edits",
    "Belge seçimi değişti. Alanı yeniden açın.": "Document availability changed. Reopen the workspace.",

    "Fiyat Teklifi": "Quotation",
    "Üretim Formu": "Production Form",
    "Ürün Listesi": "Product List",
    "Kesim Listesi": "Cut List",
    "Aksesuar Listesi": "Accessory List",
    "Kesim Optimizasyonu": "Cut Optimization",
    "Stok Profilleri": "Stock Profiles",
    "P3DV Ürünü": "P3DV Product",
    "Parlak": "Glossy",
    "Texture": "Texture",
    "Mat": "Matte",
    "Default teknik renk": "Default technical color",
    "Default": "Default",
    "Ön sıra": "Front row",
    "Arka sıra": "Rear row",
    "Motor": "Motor",
    "Kumanda": "Remote",
    "Parapet H": "Parapet Height",
    "Cam Kaydı": "Glass Track",
    "Kumaş": "Fabric",
    "Kumaş Profilleri": "Fabric Profiles",
    "Üçgen Doğrama": "Triangular Frame",
    "Su Çıkışı": "Water Outlet",
    "Su Çıkışı Konumu": "Water Outlet Position",
    "Ek Bilgiler": "Additional Information",
    "Dikme / taşıyıcı": "Post / support",
    "Rolling Roof Ön / Arka Oluk Profili": "Rolling Roof Front / Rear Gutter Profile",
    "Rolling Roof Yan Kayıt Profili": "Rolling Roof Side Beam Profile",
    "Rolling Roof Lamel Profili": "Rolling Roof Lamella Profile",
    "Rolling Roof Dikme Profili": "Rolling Roof Post Profile",
    "Rolling Roof LED Profili": "Rolling Roof LED Profile",
    "LED opsiyonu": "LED option",
    "Eco-Bioclimatic Ön Kayıt / Oluk": "Eco-Bioclimatic Front Beam / Gutter",
    "Eco-Bioclimatic Arka Kayıt": "Eco-Bioclimatic Rear Beam",
    "Eco-Bioclimatic Yan Kayıt / Oluk": "Eco-Bioclimatic Side Beam / Gutter",
    "Eco-Bioclimatic Lamel Profili": "Eco-Bioclimatic Lamella Profile",
    "Eco-Bioclimatic Dikme Profili": "Eco-Bioclimatic Post Profile",
    "Bioclimatic Birleşik Ön / Arka Kayıt + Oluk": "Bioclimatic Combined Front / Rear Beam + Gutter",
    "Bioclimatic Birleşik Sol / Sağ Kayıt + Oluk": "Bioclimatic Combined Left / Right Beam + Gutter",
    "Bioclimatic Lamel Profili": "Bioclimatic Lamella Profile",
    "Bioclimatic Dikme Profili": "Bioclimatic Post Profile",
    "Pergola Arka Mekanizma Profili": "Pergola Rear Mechanism Profile",
    "Pergola Ön Kafa Profili": "Pergola Front Head Profile",
    "Pergola Ray Profili": "Pergola Rail Profile",
    "Pergola Kumaş Taşıyıcı Profili": "Pergola Fabric Support Profile",
    "Pergola Dikme Profili": "Pergola Post Profile",
    "Pergola LED Profili": "Pergola LED Profile",
    "Paslanmaz bağlantı vidası": "Stainless Steel Fastener",
    "Taşıyıcı ve çerçeve bağlantıları": "Support and frame connections",
    "Köşe / birleşim bağlantı plakası": "Corner / Joint Connection Plate",
    "Demo montaj seti": "Demo assembly kit",
    "EPDM fitil / conta": "EPDM Seal / Gasket",
    "Panel ve profil sızdırmazlığı": "Panel and profile sealing",
    "Seçili motor opsiyonu": "Selected motor option",
    "Seçili kumanda opsiyonu": "Selected remote option",
    "Rolling Roof oluk kapağı": "Rolling Roof Gutter Cap",
    "Ön/arka oluk kapakları": "Front / rear gutter caps",
    "Lamel burç seti": "Lamella Bushing Set",
    "Panel hareket seti": "Panel motion kit",
    "Drenaj çıkış adaptörü": "Drain Outlet Adapter",
    "Su tahliyesi": "Water drainage",
    "Eco-Bioclimatic hareket kolu seti": "Eco-Bioclimatic Motion Arm Set",
    "Lamel hareketi": "Lamella motion",
    "Oluk drenaj parçası": "Gutter Drain Part",
    "Bioclimatic birleşik profil köşe kapağı": "Bioclimatic Combined Profile Corner Cap",
    "Birleşik kayıt + oluk uçları": "Combined beam + gutter ends",
    "Bioclimatic drenaj adaptörü": "Bioclimatic Drain Adapter",
    "Dört cephe drenajı": "Four-sided drainage",
    "Pergola ray arabası": "Pergola Rail Carriage",
    "Ray mekanizması": "Rail mechanism",
    "Kumaş bağlantı seti": "Fabric Connection Set",
    "Kumaş taşıyıcı bağlantıları": "Fabric support connections",
    "Fi70 drenaj bağlantısı": "Fi70 Drain Connection",
    "Yan Ürün": "Attached Product",
    "Demo Müşteri": "Demo Customer",
    "P3DV Satış Demosu": "P3DV Sales Demo",
    "P3DV Kullanıcısı": "P3DV User",
    "P3DV · DOCUMENT CENTER": "P3DV · DOCUMENT CENTER",
    "PLMR · P3DV Demo Dokümanı · Üretim doğruluğu prototip seviyesindedir.": "PLMR · P3DV Demo Document · Production accuracy is at prototype level.",
    "Bu proje için listelenecek veri bulunamadı.": "No data available for this project.",
    "Satış Teklifi · Demo": "Sales Quotation · Demo",
    "Satış Teklifi · devam": "Sales Quotation · continued",
    "Profil Adı": "Profile Name",
    "Profil Kodu": "Profile Code",
    "Profil Kesit": "Profile Section",
    "Profil": "Profile",
    "Boy": "Length",
    "Adet": "Qty",
    "Yüzey / RAL": "Finish / RAL",
    "Toplam Kg": "Total kg",
    "Kontrol": "Check",
    "Sipariş ve Üretim · Demo": "Order and Production · Demo",
    "Ürün": "Product",
    "Ölçü": "Dimensions",
    "Renk": "Color",
    "Proje Ürünleri · Ana Sistem + Yan Ürünler": "Project Products · Main System + Attached Products",
    "Kesim Boyu": "Cut Length",
    "Açı": "Angle",
    "Açıklama": "Description",
    "Dinamik Demo Kesim Verisi": "Dynamic Demo Cut Data",
    "Ürüne Bağlı Demo Aksesuarlar": "Product-Specific Demo Accessories",
    "Aksesuar": "Accessory",
    "Kod": "Code",
    "Birim": "Unit",
    "Stok Boyu": "Stock Length",
    "Kullanılacak Adet": "Required Qty",
    "Tahmini Kalan": "Estimated Remainder",
    "Stoktan Kullanılacak Profiller": "Required Stock Profiles",
    "Stok Yerleşimi · devam": "Stock Layout · continued",
    "Görsel Stok Yerleşimi · Demo": "Visual Stock Layout · Demo",
    "Perspektif": "Perspective",
    "Ön Görünüş": "Front View",
    "Yan Görünüş": "Side View",
    "Üst Görünüş": "Top View",
    "3D Görselleştirme": "3D Visualization",
    "Perspektif + Ön": "Perspective + Front",
    "Yan + Üst": "Side + Top",
    "2D Teknik Görünüş": "2D Technical View",
    "PLMR Web DXF / 2D": "PLMR Technical Drawing",
    "Canonical Technical 2D": "Technical Drawing",
    "MÜŞTERİ": "CUSTOMER",
    "P3DV Çözüm Merkezi": "P3DV Solution Center",
    "Teklif ve proje dokümantasyonu": "Quotation and project documentation",
    "Müşteri": "Customer",
    "Müşteri logosu eklenmedi": "No customer logo added",
    "Demo Fiyat": "Demo Price",
    "SATICI / FİRMA": "SELLER / COMPANY",
    "Teklif No": "Quotation No.",
    "Teklif Tarihi": "Quotation Date",
    "Ana Sistem": "Main System",
    "Sistem Rengi": "System Color",
    "Standart sistem · Ek opsiyon seçilmedi": "Standard system · No additional options selected",
    "SEÇİLEN OPSİYONLAR": "SELECTED OPTIONS",
    "Teklif kalemleri devam ediyor.": "Quotation items continued.",
    "Teklif Kalemleri": "Quotation Items",
    "Teklif Notu": "Quotation Note",
    "Ana sistem ve projeye eklenen yan ürünler birlikte gösterilir. Fiyatlar P3DV satış demosu için ölçü ve ürün tipine bağlı dinamik prototip değerlerdir; üretim / sipariş fiyatı değildir.": "The main system and attached products are shown together. Prices are dynamic prototype estimates for the P3DV sales demo, based on dimensions and product type; they are not production or order prices.",
    "DEMO FİYAT ÖZETİ": "DEMO PRICE SUMMARY",
    "Ara toplam": "Subtotal",
    "KDV (Demo %20)": "VAT (Demo 20%)",
    "GENEL TOPLAM": "GRAND TOTAL",
    "Teklif kalemleri sonraki sayfada devam eder.": "Quotation items continue on the next page.",
    "Proje / Müşteri": "Project / Customer",
    "Sipariş No": "Order No.",
    "Tarih": "Date",
    "Genişlik": "Width",
    "Açılım": "Projection",
    "Yükseklik": "Height",
    "Panel Rengi": "Panel Color",
    "Kullanıcı": "User",
    "Optimizasyon için kesim parçası bulunamadı.": "No cut pieces available for optimization.",
    "FIRE": "WASTE",
    "PLMR Pergola Web DXF motorundan canlı üretilen 2D görünüş": "Live 2D technical view of the Pergola project",
    "Canonical Technical 2D capture oluşturulamadı.": "The technical 2D view could not be captured.",
    "ÖN GÖRÜNÜŞ": "FRONT VIEW",
    "YAN GÖRÜNÜŞ": "SIDE VIEW",
    "ÜST GÖRÜNÜŞ": "TOP VIEW",
    "Teknik Not": "Technical Note",
    "Bu sayfa P3DV kanonik ölçülerinden üretilen demo teknik görünüşüdür. Ölçü ve modül bölünmeleri proje girdileri değiştiğinde güncellenir; CAD/imalat paftası doğruluğu bu prototip kapsamının dışındadır.": "This demo technical view uses the project dimensions. Dimensions and module divisions update with project inputs. CAD and manufacturing drawing accuracy is outside the scope of this prototype.",
    "3D görüntü alınamadı": "The 3D view could not be captured",
    "Technical 2D PDF model units 1:1 mm değil.": "The technical 2D model must use millimeters at 1:1 scale.",
    "Technical 2D PDF drawing entity seti boş.": "The technical 2D drawing is empty.",
    "DXF model: 1:1 mm": "DXF model: 1:1 mm",
    "Doküman veri köprüsü hazır değil.": "Document data is not ready.",
    "Önce geçerli bir proje/çizim oluşturun.": "Create a valid project or drawing first.",
    "Bu ürün için aktif en az bir doküman seçin.": "Select at least one available document for this product.",
    "P3DV PDF motoru yüklenemedi.": "The PDF renderer could not be loaded.",
    "TECHNICAL2D_VECTOR_PDF_UNAVAILABLE: Canlı Technical 2D shared vector PDF kaynağı oluşturulamadı.": "TECHNICAL2D_VECTOR_PDF_UNAVAILABLE: The technical 2D vector drawing is unavailable.",
    "Doküman seçin": "Select documents",
    "Dokümanları Seç": "Select Documents",
    "Tek PDF · çoklu bölüm": "One PDF · multiple sections",
    "Kapat": "Close",
    "Hepsi": "All",
    "PDF Hazırlanıyor": "Preparing PDF",
    "PDF Oluşturuldu": "PDF Created",
    "PDF Oluştur": "Create PDF",
    "PDF oluşturulamadı.": "The PDF could not be created.",
    "PDF zaten hazırlanıyor.": "A PDF is already being prepared.",
    "adet": "pcs",
    "set": "set",
    "Sayfa {page} / {total}": "Page {page} / {total}",
    "{count} doküman seçildi": "{count} documents selected",
    "{title} · devam": "{title} · continued",
    "Modül {number}": "Module {number}",
    "Poz {number}": "Position {number}",
    "Ort. fire {value}": "Avg. waste {value}",
    "{product} · Sistem {number}": "{product} · System {number}",
    "{code} · Stok {stock} · Çubuk {index}": "{code} · Stock {stock} · Bar {index}",
    "Verim %{efficiency} · Fire {waste}": "Efficiency {efficiency}% · Waste {waste}",
    "{count} parça · kullanılan {used} · kalan {remaining}": "{count} pieces · used {used} · remaining {remaining}",
    "Görsel örnek sınırı: {count} ek stok çubuğu özet tabloda hesaba dahil edilmiştir.": "Preview limit: {count} additional stock bars are included in the summary.",
    "Bu sayfadaki yaklaşık profil ağırlığı: {weight}": "Approximate profile weight on this page: {weight}",
    "tum-dokumanlar": "all-documents",
    "{count}-dokuman": "{count}-documents",
    "{product} · Teknik 2D görünüş": "{product} · Technical 2D view",
    "Ortak görünüş ölçeği: {scale} px/mm · DXF model: 1:1 mm": "Shared view scale: {scale} px/mm · DXF model: 1:1 mm",
    "Vektör teknik çizim · {count} çizim öğesi": "Vector technical drawing · {count} drawing entities"
});
  const DOCUMENT_TR = Object.freeze({
    "P3DV · DOCUMENT CENTER": "P3DV · DOKÜMAN MERKEZİ",
    "PLMR Web DXF / 2D": "PLMR Teknik Çizim",
    "Canonical Technical 2D": "Teknik Çizim",
    "Default teknik renk": "Varsayılan teknik renk",
    "Default": "Varsayılan",
    "Texture": "Dokulu",
    "FIRE": "FİRE"
});
  let documentLanguage = null;
  let generationActive = false;
  let languageObserver = null;
  let buttonStatus = 'Tabloları İncele';

  function activeLanguage() { if(window.PLMRI18n?.getLanguage)return window.PLMRI18n.getLanguage().toLowerCase();
    try {
      if (window.parent && window.parent !== window) {
        const host = window.parent.document.documentElement.lang;
        if (/^(tr|en)(-|$)/i.test(host)) return host.toLowerCase().startsWith('en') ? 'en' : 'tr';
      }
    } catch (_) { /* Cross-origin standalone embedding uses the local preference. */ }
    try {
      const saved = window.localStorage && window.localStorage.getItem('pulumur_lang');
      if (saved === 'en' || saved === 'tr') return saved;
    } catch (_) { /* Storage can be disabled. */ }
    return typeof document !== 'undefined' && document.documentElement && /^en(?:-|$)/i.test(document.documentElement.lang || '') ? 'en' : 'tr';
  }

  function t(key, values, language = documentLanguage || activeLanguage()) {
    if(!['tr','en'].includes(language)){const raw=DOCUMENT_TR[key]||key;return String(window.PLMRI18n?.t(raw,language.toUpperCase())||raw).replace(/\{([a-z]+)\}/g,(match,name)=>values&&Object.prototype.hasOwnProperty.call(values,name)?String(values[name]):match);} const catalog = language === 'en' ? DOCUMENT_EN : DOCUMENT_TR;
    const template = Object.prototype.hasOwnProperty.call(catalog, key) ? catalog[key] : key;
    return String(template).replace(/\{([a-z]+)\}/g, (match, name) => values && Object.prototype.hasOwnProperty.call(values, name) ? String(values[name]) : match);
  }

  function ui(key, values) { return t(key, values, activeLanguage()); }

  // Only generated row fields use this formatter. User names, option values,
  // IDs, profile codes and free-form annotations are never catalog inputs.
  function generatedText(value) {
    const text = String(value == null ? '' : value);
    let match = text.match(/^(Modül|Poz) (\d+)(?: · (.*))?$/);
    if (match) return t(match[1] === 'Modül' ? 'Modül {number}' : 'Poz {number}', { number: match[2] }) + (match[3] ? ' · ' + t(match[3]) : '');
    match = text.match(/^(.*) · Sistem (\d+)$/);
    if (match) return t('{product} · Sistem {number}', { product: match[1], number: match[2] });
    match = text.match(/^Ort\. fire (.*)$/);
    if (match) return t('Ort. fire {value}', { value: match[1] });
    match = text.match(/^(.*) · (Parlak|Texture|Mat)$/);
    if (match) return match[1] + ' · ' + t(match[2]);
    return t(text);
  }

  function tableValue(row, column, value) {
    if (row.documentUserFields && row.documentUserFields.includes(column.value)) return value;
    if (column.value === 'name') {
      if (row.kind === 'attached') return value;
      if (row.code === 'AKS-MTR-01') return t('Motor') + String(value).slice('Motor'.length);
      if (row.code === 'AKS-KMD-01') return t('Kumanda') + String(value).slice('Kumanda'.length);
      return generatedText(value);
    }
    return ['profile', 'note', 'surface', 'unit', 'color'].includes(column.value) ? generatedText(value) : value;
  }

  const DOCUMENTS = Object.freeze([
    { id: 'quote', label: 'Fiyat Teklifi' },
    { id: 'production', label: 'Üretim Formu' },
    { id: 'product-list', label: 'Ürün Listesi' },
    { id: '3d', label: '3D' },
    { id: '2d', label: '2D' },
    { id: 'cut-list', label: 'Kesim Listesi' },
    { id: 'accessories', label: 'Aksesuar Listesi' },
    { id: 'optimization', label: 'Kesim Optimizasyonu' },
    { id: 'stock', label: 'Stok Profilleri' }
  ]);

  const PRODUCT_LABELS = Object.freeze({
    'b-cube': 'PLMR | Bioclimatic',
    'bio-rise': 'Eco-Bioclimatic (Tilt)',
    'b-cube-galaxy': 'Bioclimatic (Tilt)',
    'pergo-rise': 'Pergola'
  });

  const PAGE = Object.freeze({ width: 1120, height: 1584, margin: 64, header: 164, footer: 70 });
  const FONT = 'Inter, Segoe UI, Arial, sans-serif';
  const COLORS = Object.freeze({
    ink: '#0f172a', text: '#334155', muted: '#64748b', faint: '#94a3b8', line: '#dbe3ef',
    soft: '#f8fafc', softBlue: '#eff6ff', blue: '#1d4ed8', blue2: '#2563eb', navy: '#112442',
    green: '#047857', amber: '#b45309', white: '#ffffff', dark: '#020617'
  });
  const BRAND_LOGO_URL = './assets/branding/makrosky-quotation.png';

  let panel = null;
  let brandLogoPromise = null;
  let anchorButton = null;
  let busy = false;

  const numberFormats = Object.fromEntries(['tr', 'en'].map((language) => {
    const locale = language === 'en' ? 'en-GB' : 'tr-TR';
    return [language, {
      integer: new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }),
      decimal: new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
      currency: new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
    }];
  }));
  // Only the captured export language affects formatting. Read-only data callers
  // retain the original TR representation and all numeric calculation values.
  const nf0 = { format: (value) => numberFormats[documentLanguage || 'tr'].integer.format(value) };
  const nf1 = { format: (value) => numberFormats[documentLanguage || 'tr'].decimal.format(value) };
  const money = { format: (value) => numberFormats[documentLanguage || 'tr'].currency.format(value) };

  function bridge() {
    return window.__P3DV_DOCUMENT_BRIDGE__ || null;
  }

  function safeNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function round5(value) {
    return Math.max(1, Math.round(safeNumber(value) / 5) * 5);
  }

  function mm(value) {
    return `${nf0.format(Math.round(safeNumber(value)))} mm`;
  }

  function kg(value) {
    return `${nf1.format(safeNumber(value))} kg`;
  }

  function productLabel(group) {
    return window.PulumurProductPresentation ? window.PulumurProductPresentation.name(group) : PRODUCT_LABELS[group] || String(group || 'P3DV Ürünü');
  }

  function finishText(value) {
    const text = String(value || '').toUpperCase();
    if (text === 'GLOSSY' || text === 'GLOSS') return 'Parlak';
    if (text === 'TEXTURE') return 'Texture';
    if (text === 'MATTE') return 'Mat';
    return value || '-';
  }

  function colorText(color, mode) {
    if (mode !== 'ral') return 'Default teknik renk';
    if (!color) return '-';
    return `${color.code || '-'} · ${finishText(color.finish)}`;
  }

  function compactColorText(color, mode) {
    if (mode !== 'ral') return 'Default';
    if (!color) return '-';
    return String(color.code || '-');
  }

  function size2d(width, height) {
    return `${nf0.format(Math.round(safeNumber(width)))} × ${nf0.format(Math.round(safeNumber(height)))} mm`;
  }

  function size3d(width, depth, height) {
    return `${nf0.format(Math.round(safeNumber(width)))} × ${nf0.format(Math.round(safeNumber(depth)))} × ${nf0.format(Math.round(safeNumber(height)))} mm`;
  }

  function todayText() {
    return new Intl.DateTimeFormat(documentLanguage === 'en' ? 'en-GB' : 'tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date());
  }

  function projectNumber(model) {
    const date = new Date();
    const stamp = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    const group = ({ 'b-cube': 'FR', 'bio-rise': 'BR', 'b-cube-galaxy': 'GX', 'pergo-rise': 'PR' })[model.productGroup] || 'PD';
    const seed = Math.abs(Math.round(safeNumber(model.width) + safeNumber(model.depth) * 3 + safeNumber(model.height) * 7 + safeNumber(model.systemCount) * 97)) % 10000;
    return `P3DV-${group}-${stamp}-${String(seed).padStart(4, '0')}`;
  }

  function activeLayout(model) {
    if (model.productGroup === 'b-cube') return model.freedomLayout;
    if (model.productGroup === 'bio-rise') return model.bioRiseLayout;
    if (model.productGroup === 'b-cube-galaxy') return model.galaxyLayout;
    return null;
  }

  function moduleData(model) {
    if (model.productGroup === 'pergo-rise') {
      const derived = model.pergoRiseProject && model.pergoRiseProject.derived;
      const systems = derived && Array.isArray(derived.systems) ? derived.systems : [];
      if (systems.length) {
        return systems.map((system, index) => ({
          index,
          id: system.id || `PR-${index + 1}`,
          row: 'Ön sıra',
          width: safeNumber(system.width, model.width),
          depth: safeNumber(system.opening, model.depth),
          height: safeNumber(system.rearHeight, model.height),
          frontHeight: safeNumber(system.frontHeight, model.height),
          panelCount: 1,
          railCount: Math.max(1, Math.round(safeNumber(system.railCount, 2))),
          panelLength: safeNumber(system.width, model.width)
        }));
      }
    }
    const layout = activeLayout(model);
    if (layout && Array.isArray(layout.modules) && layout.modules.length) {
      return layout.modules.map((item, index) => ({
        index,
        id: item.id || `M-${index + 1}`,
        row: item.rowIndex === 1 || item.rowLabel === 'rear-row' ? 'Arka sıra' : 'Ön sıra',
        width: safeNumber(item.referenceWidth || item.outerWidth || item.clearWidth, model.width),
        depth: safeNumber(item.depth, model.depth),
        height: safeNumber(model.height),
        panelCount: Math.max(1, Math.round(safeNumber(item.panelCount, (model.modulePanelCounts || [])[index] || model.panelCount || model.lamellaCount))),
        panelLength: safeNumber(item.panelLength || item.clearWidth, model.width),
        gutterWidth: safeNumber(item.gutterWidth || item.clearWidth, model.width),
        railWidth: safeNumber(item.railWidth || item.clearWidth, model.width),
        frontBeamLength: safeNumber(item.frontBeamLength || item.frontClearWidth || item.clearWidth, model.width),
        rearBeamLength: safeNumber(item.rearBeamLength || item.rearClearWidth || item.clearWidth, model.width),
        leftSideBeamLength: safeNumber(item.leftSideBeamLength || item.frameClearDepth || item.depth, model.depth),
        rightSideBeamLength: safeNumber(item.rightSideBeamLength || item.frameClearDepth || item.depth, model.depth)
      }));
    }
    const widths = Array.isArray(model.moduleWidths) && model.moduleWidths.length ? model.moduleWidths : [model.width];
    const depths = Array.isArray(model.moduleDepths) && model.moduleDepths.length ? model.moduleDepths : widths.map(() => model.depth);
    const panels = Array.isArray(model.modulePanelCounts) && model.modulePanelCounts.length ? model.modulePanelCounts : widths.map(() => model.panelCount || model.lamellaCount || 1);
    return widths.map((width, index) => ({
      index, id: `M-${index + 1}`, row: 'Ön sıra', width: safeNumber(width), depth: safeNumber(depths[index], model.depth), height: safeNumber(model.height),
      panelCount: Math.max(1, Math.round(safeNumber(panels[index], 1))), panelLength: Math.max(80, safeNumber(width) - 185),
      gutterWidth: Math.max(200, safeNumber(width) - 4), railWidth: Math.max(80, safeNumber(width) - 8),
      frontBeamLength: safeNumber(width), rearBeamLength: safeNumber(width), leftSideBeamLength: safeNumber(depths[index], model.depth), rightSideBeamLength: safeNumber(depths[index], model.depth)
    }));
  }

  function selectedOptions(model) {
    const options = model.options || {};
    const rows = [];
    Object.entries(options).forEach(([key, value]) => {
      if (value == null || value === '' || value === '-' || value === 'Yok' || value === 'HAYIR' || value === 'NO' || value === false) return;
      const labelMap = {
        motor: 'Motor', remote: 'Kumanda', led: 'LED', dimmer: 'Dimmer', parapet: 'Parapet', parapetHeight: 'Parapet H', glassTrack: 'Cam Kaydı',
        fabric: 'Kumaş', fabricProfiles: 'Kumaş Profilleri', triangleJoinery: 'Üçgen Doğrama', waterStandard: 'Su Çıkışı', waterOutletPlacement: 'Su Çıkışı Konumu', extras: 'Ek Bilgiler'
      };
      rows.push({ label: labelMap[key] || key, value: String(value) });
    });
    if (model.productGroup !== 'pergo-rise' && model.pdfRequest && Array.isArray(model.pdfRequest.sections)) {
      model.pdfRequest.sections.forEach((section) => {
        (section.rows || []).forEach((field) => {
          if (!field || field.value == null) return;
          const value = Array.isArray(field.value) ? field.value.join(', ') : String(field.value);
          if (!value || value === '-' || /^no$/i.test(value) || /^none$/i.test(value)) return;
          if (!rows.some((item) => item.label === field.label && item.value === value)) rows.push({ label: field.label, value });
        });
      });
    }
    return rows.slice(0, 12);
  }

  function postPieces(model, modules, add, cfg) {
    const layout = activeLayout(model);
    if (layout && Array.isArray(layout.posts) && layout.posts.length) {
      const grouped = new Map();
      layout.posts.forEach((post) => {
        if(post.height===0)return;const length = round5(post.height ?? model.height);
        grouped.set(length, (grouped.get(length) || 0) + 1);
      });
      grouped.forEach((qty, length) => add(cfg.name, cfg.code, length, qty, cfg.gram, cfg.section, cfg.stock || 6000, 'Dikme / taşıyıcı'));
      return;
    }
    const pergoCounts = model.pergoRiseProject && model.pergoRiseProject.derived && model.pergoRiseProject.derived.counts || {};
    const qty = model.productGroup === 'pergo-rise' ? Math.max(2, safeNumber(pergoCounts.posts, modules.length * 2)) : Math.max(4, modules.length * 2 + 2);
    add(cfg.name, cfg.code, round5(model.height), qty, cfg.gram, cfg.section, cfg.stock || 6000, 'Dikme / taşıyıcı');
  }

  function profilePieces(model, modules) {
    const pieces = [];
    const add = (profile, code, length, qty, gram, section, stock, note) => {
      const safeQty = Math.max(0, Math.round(safeNumber(qty)));
      const safeLength = Math.max(1, round5(length));
      if (!safeQty || !safeLength) return;
      const displayProfile = window.PulumurProductPresentation ? window.PulumurProductPresentation.text(profile) : profile;
      pieces.push({ profile: displayProfile, code, length: safeLength, qty: safeQty, gram: safeNumber(gram), section, stock: safeNumber(stock, 6000), note: note || '' });
    };

    if (model.productGroup === 'b-cube') {
      (model.sceneEditor?.mainDeleted?[]:modules).forEach(m=>{
        const C=window.PLMRBioclimaticRoof,cfg=C.config(model,m.index),module={...m,moduleIndex:m.index,gutterWidth:m.gutterWidth,centerX:0,centerZ:0},oriented=C.orientModule(module,cfg.rotation),r=C.layout(oriented,cfg.id,cfg.open?1:0),a=r.aperture,physical=C.aperture(module),support=C.supportSpec(oriented,cfg.id,C.panelSweepRadius(r.panelDepth||0),model.height);
        add('Bioclimatic Ön / Arka Oluk · 170×260×8 mm','BIO-OL-170260-T8',m.gutterWidth,2,0,'gutter',7000,`Modül ${m.index+1} · 45° köşe`);
        add('Bioclimatic Yan Oluk · 170×260×8 mm','BIO-OL-170260-T8',m.depth,2,0,'gutter',7000,`Modül ${m.index+1} · 45° köşe`);
        if(r.product.kind==='glass'){
          add('Cervin Cam · '+Math.round(r.glass.paneDepth)+' mm açılım','BIO-GLASS',r.glass.paneWidth,r.glass.columns*r.glass.rows,0,'glass',7000,`Modül ${m.index+1} · en fazla 750×2000 mm`);
          add('Cam Grid · 40 mm','BIO-GL-GRID',a.depth,r.glass.columns-1,0,'glass-grid',7000,'Oluk alt kotuna kadar');
          add('Cam Grid · 40 mm','BIO-GL-GRID',a.width,r.glass.rows-1,0,'glass-grid',7000,'Oluk alt kotuna kadar');
        }else if(r.product.kind==='sandwich')add('Jura Sandwich · '+Math.round(a.depth)+' mm açılım','BIO-SANDWICH',a.width,1,0,'sandwich',7000,`Modül ${m.index+1} · yekpare`);
        else if(r.product.kind==='fabric'){
          add('Antero Kumaş Taşıyıcı','BIO-FAB-BAR',a.width,r.count,0,'fabric-bar',7000,`Modül ${m.index+1}`);
          add('Antero PVC Kumaş · '+Math.round(a.depth)+' mm açılım','BIO-PVC',a.width,1,0,'fabric',7000,`Modül ${m.index+1}`);
        }else add(r.product.name+' Lamel','BIO-LM-216',a.width,r.count,2.15,'panel',7000,`Modül ${m.index+1} · ${r.product.motion}`);
        if(r.product.motion!=='Fixed')add('Çatı Yan Rayı','BIO-RAIL',a.depth,2,0,'rail',7000,`Modül ${m.index+1}`);
        if(support.count)add(r.product.kind==='fabric'?'PVC Üst Tavan Desteği':'Alüminyum Alt Tavan Desteği','BIO-ROOF-SUPPORT',a.depth,support.count,0,'roof-support',7000,'Oluk sınırları içinde · 5 mm hareket boşluğu');
        add('İç Çerçeve LED · Z','BIO-LED-Z',physical.depth,2,0,'led',7000,`Modül ${m.index+1}`);
        add('İç Çerçeve LED · X','BIO-LED-X',physical.width,2,0,'led',7000,`Modül ${m.index+1}`);
      });
      if(!model.sceneEditor?.mainDeleted)postPieces(model,modules,add,{name:'Bioclimatic Dikme · 170×170',code:'BIO-DK-170170',gram:0,section:'post',stock:6000});
    } else if (model.productGroup === 'bio-rise') {
      modules.forEach((m) => {
        add('Eco-Bioclimatic Ön Kayıt / Oluk', 'BR-ON-218', m.frontBeamLength || m.width, 1, 4.55, 'gutter', 7000, `Modül ${m.index + 1}`);
        add('Eco-Bioclimatic Arka Kayıt', 'BR-AR-218', m.rearBeamLength || m.width, 1, 3.95, 'beam', 7000, `Modül ${m.index + 1}`);
        add('Eco-Bioclimatic Yan Kayıt / Oluk', 'BR-YN-218', m.leftSideBeamLength || m.depth, 2, 3.70, 'gutter-side', 7000, `Modül ${m.index + 1}`);
        add('Eco-Bioclimatic Lamel Profili', 'BR-LM-200', m.panelLength, m.panelCount, 1.95, 'panel', 7000, `Modül ${m.index + 1}`);
      });
      postPieces(model, modules, add, { name: 'Eco-Bioclimatic Dikme Profili', code: 'BR-DK-150100', gram: 4.20, section: 'post', stock: 6000 });
    } else if (model.productGroup === 'b-cube-galaxy') {
      modules.forEach((m) => {
        add('Galaxy Birleşik Ön / Arka Kayıt + Oluk', 'GX-KO-140225', m.frontBeamLength || m.width, 1, 5.90, 'galaxy-front', 7000, `Modül ${m.index + 1} · Ön`);
        add('Galaxy Birleşik Ön / Arka Kayıt + Oluk', 'GX-KO-140225', m.rearBeamLength || m.width, 1, 5.90, 'galaxy-front', 7000, `Modül ${m.index + 1} · Arka`);
        add('Galaxy Birleşik Sol / Sağ Kayıt + Oluk', 'GX-KO-180225', m.leftSideBeamLength || m.depth, 1, 6.35, 'galaxy-side', 7000, `Modül ${m.index + 1} · Sol`);
        add('Galaxy Birleşik Sol / Sağ Kayıt + Oluk', 'GX-KO-180225', m.rightSideBeamLength || m.depth, 1, 6.35, 'galaxy-side', 7000, `Modül ${m.index + 1} · Sağ`);
        add('Galaxy Lamel Profili', 'GX-LM-200', m.panelLength, m.panelCount, 2.05, 'panel', 7000, `Modül ${m.index + 1}`);
      });
      postPieces(model, modules, add, { name: 'Galaxy Dikme Profili', code: 'GX-DK-180140', gram: 5.10, section: 'post', stock: 6000 });
    } else {
      const input = model.pergoRiseProject && model.pergoRiseProject.input || {};
      modules.forEach((m) => {
        add('Pergola Arka Mekanizma Profili', 'PR-ARK-01', m.width, 1, 4.10, 'beam', 7000, `Poz ${m.index + 1}`);
        add('Pergola Ön Kafa Profili', 'PR-ONK-01', m.width, 1, 3.65, 'gutter', 7000, `Poz ${m.index + 1}`);
        add('Pergola Ray Profili', 'PR-RAY-01', m.depth, m.railCount || 2, 2.75, 'rail', 7000, `Poz ${m.index + 1}`);
        add('Pergola Kumaş Taşıyıcı Profili', 'PR-KMS-01', Math.max(500, m.width - 120), 2, 1.15, 'panel', 7000, `Poz ${m.index + 1}`);
      });
      postPieces(model, modules, add, { name: 'Pergola Dikme Profili', code: 'PR-DK-100100', gram: 3.35, section: 'post', stock: 6000 });
      if (String(input.led || '').toUpperCase() !== '-' && String(input.led || '').toUpperCase() !== 'NO') add('Pergola LED Profili', 'PR-LED-01', modules[0] ? modules[0].width : model.width, modules.length, 0.38, 'led', 6000, 'LED opsiyonu');
    }
    for(const copy of model.sceneEditor?.roofCopies||[])pieces.push(...profilePieces(copy.spec,moduleData(copy.spec)).map(p=>({...p,note:copy.id+' · '+p.note})));return pieces;
  }

  function aggregateCuts(pieces) {
    const map = new Map();
    pieces.forEach((piece) => {
      const key = `${piece.code}|${piece.length}|${piece.note}`;
      const row = map.get(key) || { ...piece, qty: 0 };
      row.qty += piece.qty;
      map.set(key, row);
    });
    return Array.from(map.values()).sort((a, b) => a.code.localeCompare(b.code) || b.length - a.length);
  }

  function productionRows(cuts, surface) {
    return cuts.map((cut) => ({
      ...cut,
      surface,
      totalKg: cut.length / 1000 * cut.gram * cut.qty
    }));
  }

  function accessoryRows(model, modules, counts) {
    const rows = [];
    const add = (name, code, qty, unit, note) => {
      if (qty > 0) rows.push({ name, code, qty: Math.round(qty), unit, note });
    };
    const moduleCount = modules.length;
    const panelCount = counts.panelCount;
    const postCount = counts.postCount;
    const motor = String(model.options && model.options.motor || '').trim();
    const remote = String(model.options && model.options.remote || '').trim();
    add('Paslanmaz bağlantı vidası', 'AKS-VDA-A2', postCount * 8 + moduleCount * 12, 'adet', 'Taşıyıcı ve çerçeve bağlantıları');
    add('Köşe / birleşim bağlantı plakası', 'AKS-PLK-01', moduleCount * 4 + Math.max(0, moduleCount - 1) * 2, 'adet', 'Demo montaj seti');
    add('EPDM fitil / conta', 'AKS-EPDM', Math.max(1, panelCount * 2), 'm', 'Panel ve profil sızdırmazlığı');
    if (motor && !/^(yok|-|no)$/i.test(motor)) add(`Motor · ${motor}`, 'AKS-MTR-01', moduleCount, 'adet', 'Seçili motor opsiyonu');
    if (remote && !/^(yok|-|no)$/i.test(remote)) add(`Kumanda · ${remote}`, 'AKS-KMD-01', Math.max(1, Math.ceil(moduleCount / 2)), 'adet', 'Seçili kumanda opsiyonu');
    if (model.productGroup === 'b-cube') {
      add('Rolling Roof oluk kapağı', 'BCF-AKS-KPK', moduleCount * 4, 'adet', 'Ön/arka oluk kapakları');
      add('Lamel burç seti', 'BCF-AKS-BRC', panelCount * 2, 'set', 'Panel hareket seti');
      add('Drenaj çıkış adaptörü', 'BCF-AKS-DRN', moduleCount * 2, 'adet', 'Su tahliyesi');
    } else if (model.productGroup === 'bio-rise') {
      add('Eco-Bioclimatic hareket kolu seti', 'BR-AKS-HRK', moduleCount * 2, 'set', 'Lamel hareketi');
      add('Oluk drenaj parçası', 'BR-AKS-DRN', moduleCount * 2, 'adet', 'Su tahliyesi');
    } else if (model.productGroup === 'b-cube-galaxy') {
      add('Bioclimatic birleşik profil köşe kapağı', 'GX-AKS-KPK', moduleCount * 4, 'adet', 'Birleşik kayıt + oluk uçları');
      add('Bioclimatic drenaj adaptörü', 'GX-AKS-DRN', moduleCount * 4, 'adet', 'Dört cephe drenajı');
    } else {
      const railCount = modules.reduce((s, m) => s + (m.railCount || 0), 0);
      add('Pergola ray arabası', 'PR-AKS-RAY', railCount * 2, 'adet', 'Ray mekanizması');
      add('Kumaş bağlantı seti', 'PR-AKS-KMS', moduleCount * 2, 'set', 'Kumaş taşıyıcı bağlantıları');
      add('Fi70 drenaj bağlantısı', 'PR-AKS-F70', moduleCount * 2, 'adet', 'Su tahliyesi');
    }
    return rows;
  }

  function chooseStockLength(pieceLength, preferred) {
    const candidates = [safeNumber(preferred, 6000), 6000, 7000, 7500, 8000, 12000, 14000].filter((v, i, arr) => v >= pieceLength && arr.indexOf(v) === i).sort((a, b) => a - b);
    if (candidates.length) return candidates[0];
    return Math.ceil(pieceLength / 1000) * 1000;
  }

  function optimizeCuts(cuts) {
    const profiles = new Map();
    cuts.forEach((cut) => {
      const bucket = profiles.get(cut.code) || { code: cut.code, profile: cut.profile, preferred: cut.stock, pieces: [] };
      for (let i = 0; i < cut.qty; i += 1) bucket.pieces.push(cut.length);
      profiles.set(cut.code, bucket);
    });
    const result = [];
    profiles.forEach((group) => {
      const bars = [];
      group.pieces.sort((a, b) => b - a).forEach((length) => {
        let target = bars.find((bar) => bar.remaining >= length);
        if (!target) {
          const stock = chooseStockLength(length, group.preferred);
          target = { stock, remaining: stock, segments: [] };
          bars.push(target);
        }
        target.segments.push(length);
        target.remaining -= length;
      });
      bars.forEach((bar, index) => {
        const used = bar.stock - bar.remaining;
        result.push({
          code: group.code, profile: group.profile, index: index + 1, stock: bar.stock, segments: bar.segments.slice(), used, fire: bar.remaining,
          efficiency: bar.stock ? used / bar.stock * 100 : 0
        });
      });
    });
    return result;
  }

  function stockRows(optimization) {
    const map = new Map();
    optimization.forEach((bar) => {
      const key = `${bar.code}|${bar.stock}`;
      const row = map.get(key) || { profile: bar.profile, code: bar.code, stock: bar.stock, qty: 0, remaining: 0, used: 0 };
      row.qty += 1;
      row.remaining += bar.fire;
      row.used += bar.used;
      map.set(key, row);
    });
    return Array.from(map.values()).map((row) => ({ ...row, note: `Ort. fire ${mm(row.remaining / Math.max(1, row.qty))}` }));
  }

  function countsFor(model, modules) {
    const layout = activeLayout(model);
    const pergoCounts = model.pergoRiseProject && model.pergoRiseProject.derived && model.pergoRiseProject.derived.counts || {};
    return {
      modules: modules.length,
      panelCount: modules.reduce((sum, item) => sum + Math.max(1, safeNumber(item.panelCount, 1)), 0),
      postCount: model.productGroup === 'pergo-rise' ? Math.max(0, safeNumber(pergoCounts.posts, modules.length * 2)) : (layout && Array.isArray(layout.posts) ? layout.posts.length : Math.max(4, modules.length * 2 + 2)),
      railCount: model.productGroup === 'pergo-rise' ? modules.reduce((sum, item) => sum + safeNumber(item.railCount, 0), 0) : modules.length * 2
    };
  }

  function normalizeReportProducts(reportProducts, model) {
    const fallbackColor = compactColorText(model.systemColor, model.colorMode);
    return (Array.isArray(reportProducts) ? reportProducts : []).map((item, index) => ({
      id: String(item && item.id || `report-product-${index + 1}`),
      type: String(item && item.type || ''),
      name: String(item && item.name || 'Yan Ürün'),
      width: Math.max(1, Math.round(safeNumber(item && item.width))),
      height: Math.max(1, Math.round(safeNumber(item && item.height))),
      quantity: Math.max(1, Math.round(safeNumber(item && item.quantity, 1))),
      facade: String(item && item.facade || ''),
      color: compactColorText(item && item.color || model.systemColor, item && item.colorMode || model.colorMode) || fallbackColor
    })).filter((item) => item.width > 0 && item.height > 0);
  }

  function quoteDisplayOptions(options) {
    const hiddenLabels = new Set([
      'panelcolorindependent', 'panel fill', 'panelfill', 'width', 'projection', 'height (top of the gutter)',
      'system quantity', 'system color', 'panel color', 'product', 'product group', 'finish'
    ]);
    return (Array.isArray(options) ? options : []).filter((item) => {
      const label = String(item && item.label || '').trim().toLowerCase();
      const value = String(item && item.value || '').trim();
      if (!value || value === '-' || value === '—' || /^yok$/i.test(value) || /^no$/i.test(value) || /^hayır$/i.test(value)) return false;
      return label && !hiddenLabels.has(label);
    });
  }

  function quoteData(model, modules, options, reportProducts) {
    const area = modules.reduce((sum, item) => sum + safeNumber(item.width) * safeNumber(item.depth) / 1000000, 0);
    const rates = { 'b-cube': 520, 'bio-rise': 490, 'b-cube-galaxy': 565, 'pergo-rise': 395 };
    const baseRate = rates[model.productGroup] || 450;
    const optionFactor = 1 + Math.min(0.22, quoteDisplayOptions(options).length * 0.018);
    const mainSubtotal = Math.max(1250, area * baseRate * optionFactor + modules.length * 220);
    const productRates = {
      guillotine: 315, guillotine_glass: 315, sliding: 235, sliding_glass: 235, zip: 145, zip_screen: 145, zipper: 145,
      folding: 285, fixed: 165, door: 355
    };
    const productBase = { guillotine: 180, guillotine_glass: 180, sliding: 120, sliding_glass: 120, zip: 90, zip_screen: 90, zipper: 90, folding: 160, fixed: 80, door: 220 };
    const attachedItems = reportProducts.map((item) => {
      const key = String(item.type || '').toLowerCase();
      const productArea = item.width * item.height / 1000000;
      const rate = productRates[key] || 210;
      const demoPrice = Math.max(160, productArea * rate + (productBase[key] || 100));
      return { kind: 'attached', name: item.name, size: size2d(item.width, item.height), color: item.color, qty: item.quantity, price: demoPrice, source: item };
    });
    const mainItem = {
      kind: 'system', name: productLabel(model.productGroup), size: size3d(model.width, model.depth, model.height),
      color: compactColorText(model.systemColor, model.colorMode), qty: Math.max(1, modules.length), price: mainSubtotal
    };
    const items = [mainItem, ...attachedItems];
    const subtotal = mainSubtotal + attachedItems.reduce((sum, item) => sum + item.price * Math.max(1, item.qty), 0);
    const vat = subtotal * 0.20;
    return { area, baseRate, mainSubtotal, subtotal, vat, total: subtotal + vat, unitPrice: mainSubtotal / Math.max(1, modules.length), items };
  }

  function buildDocumentData(model, reportProducts) {
    const modules = moduleData(model);
    const counts = countsFor(model, modules);
    const options = selectedOptions(model);
    const attachedProducts = normalizeReportProducts(reportProducts, model);
    const pieces = profilePieces(model, modules);
    const cuts = aggregateCuts(pieces);
    const surface = colorText(model.systemColor, model.colorMode);
    const production = productionRows(cuts, surface);
    const accessories = accessoryRows(model, modules, counts);
    const optimization = optimizeCuts(cuts);
    const stock = stockRows(optimization);
    const quote = quoteData(model, modules, options, attachedProducts);
    const productRows = (model.sceneEditor?.mainDeleted?[]:modules).map((module, index) => ({
      kind: 'system', name: `${productLabel(model.productGroup)} · Sistem ${index + 1}`,
      size: size3d(module.width, module.depth, module.height), color: compactColorText(model.systemColor, model.colorMode), qty: 1
    })).concat(attachedProducts.map((item) => ({ kind: 'attached', name: item.name, size: size2d(item.width, item.height), color: item.color, qty: item.quantity })));
    for(const copy of model.sceneEditor?.roofCopies||[])for(const m of moduleData(copy.spec))productRows.push({kind:'system',name:productLabel(copy.spec.productGroup)+' · '+copy.id+' · Sistem '+(m.index+1),size:size3d(m.width,m.depth,m.height),color:compactColorText(copy.spec.systemColor,copy.spec.colorMode),qty:1});
    return {
      model, modules, counts, options, attachedProducts, productRows, pieces, cuts, production, accessories, optimization, stock, quote,
      product: productLabel(model.productGroup),
      systemColor: colorText(model.systemColor, model.colorMode),
      panelColor: colorText(model.panelColor, model.colorMode),
      compactSystemColor: compactColorText(model.systemColor, model.colorMode),
      date: todayText(), projectNo: projectNumber(model), customer: 'Demo Müşteri', projectName: 'P3DV Satış Demosu', salesperson: 'P3DV Kullanıcısı'
    };
  }

  function font(ctx, weight, size) {
    ctx.font = `${weight} ${size}px ${FONT}`;
  }

  function roundedRect(ctx, x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  }

  function fillRound(ctx, x, y, w, h, r, color) {
    roundedRect(ctx, x, y, w, h, r);
    ctx.fillStyle = color;
    ctx.fill();
  }

  function strokeRound(ctx, x, y, w, h, r, color, width = 1) {
    roundedRect(ctx, x, y, w, h, r);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
  }

  function ellipsizeText(ctx, text, maxWidth) {
    const raw = String(text == null ? '' : text);
    if (ctx.measureText(raw).width <= maxWidth) return raw;
    let out = raw;
    while (out.length > 1 && ctx.measureText(`${out}…`).width > maxWidth) out = out.slice(0, -1);
    return out ? `${out}…` : '';
  }

  function wrapLines(ctx, text, maxWidth, maxLines = 3) {
    const words = String(text == null ? '' : text).split(/\s+/).filter(Boolean);
    if (!words.length) return [''];
    const lines = [];
    let line = '';
    let truncated = false;
    for (let index = 0; index < words.length; index += 1) {
      const word = words[index];
      const next = line ? `${line} ${word}` : word;
      if (ctx.measureText(next).width > maxWidth) {
        if (line) {
          if (lines.length >= maxLines - 1) { truncated = true; break; }
          lines.push(ellipsizeText(ctx, line, maxWidth));
          line = ctx.measureText(word).width > maxWidth ? ellipsizeText(ctx, word, maxWidth) : word;
        } else {
          line = ellipsizeText(ctx, word, maxWidth);
        }
      } else {
        line = next;
      }
      if (index === words.length - 1 && line) lines.push(ellipsizeText(ctx, line, maxWidth));
    }
    if (!lines.length && line) lines.push(ellipsizeText(ctx, line, maxWidth));
    if (truncated && lines.length) lines[lines.length - 1] = ellipsizeText(ctx, `${lines[lines.length - 1]}…`, maxWidth);
    return lines.slice(0, maxLines);
  }

  function drawTextBlock(ctx, text, x, y, width, lineHeight, maxLines, color, weight, size) {
    font(ctx, weight || 500, size || 22);
    ctx.fillStyle = color || COLORS.text;
    const lines = wrapLines(ctx, text, width, maxLines || 2);
    lines.forEach((line, index) => ctx.fillText(line, x, y + index * lineHeight));
    return lines.length * lineHeight;
  }

  function createCanvas() {
    const canvas = document.createElement('canvas');
    canvas.width = PAGE.width;
    canvas.height = PAGE.height;
    return canvas;
  }

  function drawBrandLogo(ctx, image, x, y, maxW, maxH) {
    if (!image || !image.width || !image.height) {
      font(ctx, 850, 25); ctx.fillStyle = COLORS.navy; ctx.fillText('PLMR', x, y + 24);
      return { width: 82, height: 28 };
    }
    const scale = Math.min(maxW / image.width, maxH / image.height);
    const w = image.width * scale; const h = image.height * scale;
    ctx.drawImage(image, x, y, w, h);
    return { width: w, height: h };
  }

  function basePage(ctx, data, title, kicker, pageNo, totalPages, brandLogo) {
    ctx.fillStyle = COLORS.white;
    ctx.fillRect(0, 0, PAGE.width, PAGE.height);
    ctx.fillStyle = COLORS.navy;
    ctx.fillRect(0, 0, PAGE.width, 18);

    drawBrandLogo(ctx, brandLogo, PAGE.margin, 43, 150, 34);
    font(ctx, 650, 11);
    ctx.fillStyle = COLORS.blue2;
    ctx.fillText(t('P3DV · DOCUMENT CENTER'), PAGE.margin, 101);

    font(ctx, 800, 34);
    ctx.fillStyle = COLORS.ink;
    ctx.fillText(ellipsizeText(ctx, title, 500), PAGE.margin, 137);
    if (kicker) {
      font(ctx, 500, 15);
      ctx.fillStyle = COLORS.muted;
      ctx.textAlign = 'right';
      ctx.fillText(ellipsizeText(ctx, kicker, 390), PAGE.width - PAGE.margin, 137);
      ctx.textAlign = 'left';
    }

    font(ctx, 700, 14);
    ctx.fillStyle = COLORS.ink;
    ctx.textAlign = 'right';
    ctx.fillText(ellipsizeText(ctx, data.product, 330), PAGE.width - PAGE.margin, 65);
    font(ctx, 500, 12);
    ctx.fillStyle = COLORS.muted;
    ctx.fillText(data.projectNo, PAGE.width - PAGE.margin, 89);
    ctx.fillText(data.date, PAGE.width - PAGE.margin, 110);
    ctx.textAlign = 'left';

    ctx.strokeStyle = COLORS.line;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PAGE.margin, PAGE.header - 12);
    ctx.lineTo(PAGE.width - PAGE.margin, PAGE.header - 12);
    ctx.stroke();

    const footerY = PAGE.height - PAGE.footer + 12;
    ctx.beginPath();
    ctx.moveTo(PAGE.margin, footerY - 28);
    ctx.lineTo(PAGE.width - PAGE.margin, footerY - 28);
    ctx.stroke();
    font(ctx, 500, 12);
    ctx.fillStyle = COLORS.muted;
    ctx.fillText(t('PLMR · P3DV Demo Dokümanı · Üretim doğruluğu prototip seviyesindedir.'), PAGE.margin, footerY);
    ctx.textAlign = 'right';
    ctx.fillText(t('Sayfa {page} / {total}', { page: pageNo, total: totalPages }), PAGE.width - PAGE.margin, footerY);
    ctx.textAlign = 'left';
    return { x: PAGE.margin, y: PAGE.header + 8, w: PAGE.width - PAGE.margin * 2, h: PAGE.height - PAGE.header - PAGE.footer - 28 };
  }

  function infoCard(ctx, x, y, w, label, value, accent) {
    fillRound(ctx, x, y, w, 82, 10, COLORS.soft);
    strokeRound(ctx, x, y, w, 82, 10, COLORS.line);
    font(ctx, 600, 12); ctx.fillStyle = COLORS.muted; ctx.fillText(label.toUpperCase(), x + 16, y + 25);
    font(ctx, 750, 20); ctx.fillStyle = accent || COLORS.ink; drawTextBlock(ctx, value, x + 16, y + 55, w - 32, 22, 1, accent || COLORS.ink, 750, 20);
  }

  function drawProfileIcon(ctx, kind, x, y, w, h) {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = COLORS.navy;
    ctx.fillStyle = '#eef2f7';
    ctx.lineWidth = 3;
    if (kind === 'galaxy-front' || kind === 'galaxy-side') {
      const pts = kind === 'galaxy-side'
        ? [[45,225],[0,225],[0,0],[180,0],[180,100],[160,100],[160,70],[45,70]]
        : [[45,225],[0,225],[0,0],[140,0],[140,100],[120,100],[120,70],[45,70]];
      const maxX = kind === 'galaxy-side' ? 180 : 140;
      const scale = Math.min((w - 14) / maxX, (h - 14) / 225);
      const ox = (w - maxX * scale) / 2;
      const oy = (h - 225 * scale) / 2;
      ctx.beginPath();
      pts.forEach((p, i) => {
        const px = ox + p[0] * scale;
        const py = oy + (225 - p[1]) * scale;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      });
      ctx.closePath(); ctx.fill(); ctx.stroke();
    } else if (kind === 'post') {
      ctx.fillRect(w * .28, h * .14, w * .44, h * .72); ctx.strokeRect(w * .28, h * .14, w * .44, h * .72);
      ctx.strokeRect(w * .37, h * .23, w * .26, h * .54);
    } else if (kind === 'panel') {
      ctx.beginPath(); ctx.moveTo(w*.1,h*.62); ctx.lineTo(w*.85,h*.62); ctx.lineTo(w*.92,h*.45); ctx.lineTo(w*.22,h*.45); ctx.closePath(); ctx.fill(); ctx.stroke();
    } else if (kind === 'rail') {
      ctx.strokeRect(w*.18,h*.2,w*.64,h*.6); ctx.beginPath(); ctx.moveTo(w*.35,h*.2);ctx.lineTo(w*.35,h*.8);ctx.moveTo(w*.65,h*.2);ctx.lineTo(w*.65,h*.8);ctx.stroke();
    } else if (kind === 'gutter' || kind === 'gutter-side') {
      ctx.beginPath(); ctx.moveTo(w*.18,h*.2);ctx.lineTo(w*.18,h*.78);ctx.lineTo(w*.82,h*.78);ctx.lineTo(w*.82,h*.55);ctx.lineTo(w*.38,h*.55);ctx.lineTo(w*.38,h*.2);ctx.closePath();ctx.fill();ctx.stroke();
    } else if (kind === 'led') {
      ctx.strokeRect(w*.2,h*.3,w*.6,h*.4); ctx.beginPath(); ctx.arc(w*.5,h*.5,Math.min(w,h)*.1,0,Math.PI*2); ctx.stroke();
    } else {
      ctx.strokeRect(w*.16,h*.28,w*.68,h*.44); ctx.beginPath();ctx.moveTo(w*.34,h*.28);ctx.lineTo(w*.34,h*.72);ctx.moveTo(w*.66,h*.28);ctx.lineTo(w*.66,h*.72);ctx.stroke();
    }
    ctx.restore();
  }

  function tablePageDescriptor(title, kicker, columns, rows, options = {}) {
    return { title, kicker, type: 'table', columns, rows, ...options };
  }

  function documentLines(ctx, value, width) {
    const lines = [];
    for (const paragraph of String(value == null ? '' : value).replace(/\r\n?/g, '\n').split('\n')) {
      let line = '';
      for (const char of paragraph) {
        if (line && ctx.measureText(line + char).width > width) {
          const at = line.lastIndexOf(' ');
          if (at > 0) { lines.push(line.slice(0, at + 1)); line = line.slice(at + 1); }
          else { lines.push(line); line = ''; }
          if (line && ctx.measureText(line + char).width > width) { lines.push(line); line = ''; }
        }
        line += char;
      }
      lines.push(line);
    }
    return lines;
  }

  function measuredTableHeight(ctx, row, columns, base) {
    const total = columns.reduce((sum, col) => sum + col.width, 0);
    let lines = 1;
    columns.forEach(col => {
      if (col.icon) return;
      font(ctx, col.bold ? 700 : 500, col.size || 12);
      const value = typeof col.value === 'function' ? col.value(row) : row[col.value];
      lines = Math.max(lines, documentLines(ctx, tableValue(row, col, value), (PAGE.width - PAGE.margin * 2) * col.width / total - 16).length);
    });
    return Math.max(base, 48 + (lines - 1) * 17);
  }

  function partitionRows(rows, heights, budget) {
    const parts = []; let part = { rows: [], rowHeights: [] }, used = 0;
    rows.forEach((row, i) => {
      if (heights[i] > budget) throw new Error('DOCUMENT_ROW_TOO_TALL');
      if (part.rows.length && used + heights[i] > budget) { parts.push(part); part = { rows: [], rowHeights: [] }; used = 0; }
      part.rows.push(row); part.rowHeights.push(heights[i]); used += heights[i];
    });
    if (part.rows.length) parts.push(part);
    return parts;
  }

  function splitTableDescriptors(title, kicker, columns, rows, options = {}) {
    if (rows.some(row => row.documentRow)) {
      const ctx = document.createElement('canvas').getContext('2d');
      const heights = rows.map(row => measuredTableHeight(ctx, row, columns, options.rowHeight || 72));
      // Native page body, table heading, optional production header and footer space.
      const budget = PAGE.height - PAGE.header - PAGE.footer - 28 - 58 - (options.productionHeader ? 187 + 50 : 24);
      return partitionRows(rows, heights, budget).map((part, index) => tablePageDescriptor(title, index ? t('{title} · devam', { title: kicker }) : kicker, columns, part.rows, { ...options, rowHeights: part.rowHeights }));
    }
    const perPage = options.rowsPerPage || 14;
    if (!rows.length) return [tablePageDescriptor(title, kicker, columns, [{ empty: true }], options)];
    const pages = [];
    for (let i = 0; i < rows.length; i += perPage) {
      pages.push(tablePageDescriptor(title, pages.length ? t('{title} · devam', { title: kicker }) : kicker, columns, rows.slice(i, i + perPage), options));
    }
    return pages;
  }

  function drawTable(ctx, box, descriptor) {
    const columns = descriptor.columns;
    const rows = descriptor.rows;
    const headerH = 58;

    const totalWeight = columns.reduce((s, c) => s + c.width, 0);
    const colWidths = columns.map((c) => box.w * c.width / totalWeight);
    fillRound(ctx, box.x, box.y, box.w, headerH, 9, COLORS.navy);
    let x = box.x;
    columns.forEach((col, idx) => {
      font(ctx, 700, 12); ctx.fillStyle = COLORS.white;
      const lines = wrapLines(ctx, col.label, colWidths[idx] - 16, 2);
      lines.forEach((line, li) => ctx.fillText(line, x + 8, box.y + 24 + li * 16));
      x += colWidths[idx];
    });
    let y = box.y + headerH;
    rows.forEach((row, rowIndex) => {
      const rowH = descriptor.rowHeights ? descriptor.rowHeights[rowIndex] : (descriptor.rowHeight || 72);
      ctx.fillStyle = rowIndex % 2 ? COLORS.soft : COLORS.white;
      ctx.fillRect(box.x, y, box.w, rowH);
      ctx.strokeStyle = COLORS.line; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(box.x, y + rowH); ctx.lineTo(box.x + box.w, y + rowH); ctx.stroke();
      let cellX = box.x;
      columns.forEach((col, colIndex) => {
        const value = row.empty ? (colIndex === 0 ? t('Bu proje için listelenecek veri bulunamadı.') : '') : (typeof col.value === 'function' ? col.value(row) : row[col.value]);
        if (col.icon && !row.empty) {
          drawProfileIcon(ctx, row.section, cellX + 8, y + 10, colWidths[colIndex] - 16, rowH - 20);
        } else {
          font(ctx, col.bold ? 700 : 500, col.size || 12);
          ctx.fillStyle = col.color || COLORS.text;
          const rendered = value == null ? '-' : String(tableValue(row, col, value));
          const lines = descriptor.rowHeights ? documentLines(ctx, rendered, colWidths[colIndex] - 16) : wrapLines(ctx, rendered, colWidths[colIndex] - 16, col.maxLines || 2);
          lines.forEach((line, li) => ctx.fillText(line, cellX + 8, y + 28 + li * 17));
        }
        if (colIndex < columns.length - 1) {
          ctx.strokeStyle = '#edf1f6'; ctx.beginPath(); ctx.moveTo(cellX + colWidths[colIndex], y + 8); ctx.lineTo(cellX + colWidths[colIndex], y + rowH - 8); ctx.stroke();
        }
        cellX += colWidths[colIndex];
      });
      y += rowH;
    });
  }

  function quoteDescriptors(data) {
    const rows = data.quote && Array.isArray(data.quote.items) ? data.quote.items : [];
    if (rows.some(row => row.documentRow)) {
      const ctx = document.createElement('canvas').getContext('2d');
      const widths = [.30, .27, .17, .08, .18];
      const heights = rows.map(row => {
        let lines = 1;
        quoteRowValues(row).forEach((value, index) => {
          font(ctx, index === 0 || index === 4 ? 700 : 550, index === 4 ? 11 : 12);
          lines = Math.max(lines, documentLines(ctx, value, (PAGE.width - PAGE.margin * 2) * widths[index] - 14).length);
        });
        return Math.max(61, 46 + (lines - 1) * 17);
      });
      const parts = partitionRows(rows, heights, 580);
      return parts.map((part, i) => ({title:t('Fiyat Teklifi'), kicker:t(i ? 'Satış Teklifi · devam' : 'Satış Teklifi · Demo'), type:'quote', ...part, isFirst:i === 0, isLast:i === parts.length - 1}));
    }
    const perPage = 8;
    if (!rows.length) return [{ title: t('Fiyat Teklifi'), kicker: t('Satış Teklifi · Demo'), type: 'quote', rows: [], isFirst: true, isLast: true }];
    const pages = [];
    for (let i = 0; i < rows.length; i += perPage) {
      pages.push({
        title: t('Fiyat Teklifi'),
        kicker: i ? t('Satış Teklifi · devam') : t('Satış Teklifi · Demo'),
        type: 'quote',
        rows: rows.slice(i, i + perPage),
        isFirst: i === 0,
        isLast: i + perPage >= rows.length
      });
    }
    return pages;
  }

  function productionDescriptors(data) {
    const productionRows = data.production.map((row, index) => ({ ...row, index: index + 1 }));
    const cols = [
      { label: '#', width: .05, value: 'index' },
      { label: t('Profil Adı'), width: .21, value: 'profile', bold: true },
      { label: t('Profil Kodu'), width: .11, value: 'code' },
      { label: t('Profil Kesit'), width: .13, icon: true },
      { label: t('Boy'), width: .09, value: (r) => mm(r.length) },
      { label: t('Adet'), width: .06, value: 'qty' },
      { label: t('Yüzey / RAL'), width: .13, value: 'surface' },
      { label: 'g/m', width: .07, value: (r) => nf1.format(r.gram) },
      { label: t('Toplam Kg'), width: .08, value: (r) => nf1.format(r.totalKg) },
      { label: t('Kontrol'), width: .07, value: () => '□  □  □' }
    ];
    return splitTableDescriptors(t('Üretim Formu'), t('Sipariş ve Üretim · Demo'), cols, productionRows, { rowsPerPage: 10, rowHeight: 92, productionHeader: true });
  }

  function productListDescriptors(data) {
    const cols = [
      { label: t('Ürün'), width: .47, value: 'name', bold: true, maxLines: 2 },
      { label: t('Ölçü'), width: .27, value: 'size', maxLines: 2 },
      { label: t('Renk'), width: .18, value: 'color', maxLines: 1 },
      { label: t('Adet'), width: .08, value: 'qty', maxLines: 1 }
    ];
    return splitTableDescriptors(t('Ürün Listesi'), t('Proje Ürünleri · Ana Sistem + Yan Ürünler'), cols, data.productRows, { rowsPerPage: 17, rowHeight: 64 });
  }

  function cutListDescriptors(data) {
    const rows = data.cuts.map((cut, index) => ({ ...cut, index: index + 1, angle: cut.angle ?? (cut.section === 'panel' ? '90°' : '90° / demo') }));
    const cols = [
      { label: '#', width: .06, value: 'index' },
      { label: t('Profil'), width: .27, value: 'profile', bold: true },
      { label: t('Profil Kodu'), width: .15, value: 'code' },
      { label: t('Kesim Boyu'), width: .14, value: (r) => mm(r.length) },
      { label: t('Adet'), width: .09, value: 'qty' },
      { label: t('Açı'), width: .12, value: 'angle' },
      { label: t('Açıklama'), width: .17, value: 'note' }
    ];
    return splitTableDescriptors(t('Kesim Listesi'), t('Dinamik Demo Kesim Verisi'), cols, rows, { rowsPerPage: 15, rowHeight: 70 });
  }

  function accessoryDescriptors(data) {
    const rows = data.accessories.map((row, index) => ({ ...row, index: index + 1 }));
    const cols = [
      { label: '#', width: .06, value: 'index' },
      { label: t('Aksesuar'), width: .30, value: 'name', bold: true },
      { label: t('Kod'), width: .18, value: 'code' },
      { label: t('Adet'), width: .10, value: 'qty' },
      { label: t('Birim'), width: .12, value: 'unit' },
      { label: t('Açıklama'), width: .24, value: 'note' }
    ];
    return splitTableDescriptors(t('Aksesuar Listesi'), t('Ürüne Bağlı Demo Aksesuarlar'), cols, rows, { rowsPerPage: 16, rowHeight: 70 });
  }

  function stockDescriptors(data) {
    const rows = data.stock.map((row, index) => ({ ...row, index: index + 1 }));
    const cols = [
      { label: '#', width: .06, value: 'index' },
      { label: t('Profil'), width: .27, value: 'profile', bold: true },
      { label: t('Profil Kodu'), width: .15, value: 'code' },
      { label: t('Stok Boyu'), width: .13, value: (r) => mm(r.stock) },
      { label: t('Kullanılacak Adet'), width: .13, value: 'qty' },
      { label: t('Tahmini Kalan'), width: .14, value: (r) => mm(r.remaining) },
      { label: t('Açıklama'), width: .12, value: 'note' }
    ];
    return splitTableDescriptors(t('Stoktan Kullanılacak Profiller'), t('Stok Profilleri'), cols, rows, { rowsPerPage: 15, rowHeight: 72 });
  }

  function optimizationDescriptors(data) {
    const bars = data.optimization;
    const maxVisualBars = 24;
    const visible = bars.slice(0, maxVisualBars);
    const descriptors = [];
    for (let i = 0; i < visible.length; i += 7) {
      descriptors.push({
        title: t('Kesim Optimizasyonu'),
        kicker: i ? t('Stok Yerleşimi · devam') : t('Görsel Stok Yerleşimi · Demo'),
        type: 'optimization',
        rows: visible.slice(i, i + 7), totalBars: bars.length, hiddenBars: Math.max(0, bars.length - maxVisualBars)
      });
    }
    return descriptors.length ? descriptors : [{ title: t('Kesim Optimizasyonu'), kicker: t('Görsel Stok Yerleşimi · Demo'), type: 'optimization', rows: [], totalBars: 0, hiddenBars: 0 }];
  }

  function viewDescriptors(data, views) {
    const byPreset = new Map((views || []).map((v) => [v.preset, v]));
    const ordered = [
      { preset: 'perspective', label: t('Perspektif') }, { preset: 'front', label: t('Ön Görünüş') },
      { preset: 'side', label: t('Yan Görünüş') }, { preset: 'top', label: t('Üst Görünüş') }
    ].map((item) => ({ ...item, view: byPreset.get(item.preset) }));
    return [
      { title: t('3D Görselleştirme'), kicker: t('Perspektif + Ön'), type: '3d', views: ordered.slice(0, 2) },
      { title: t('3D Görselleştirme'), kicker: t('Yan + Üst'), type: '3d', views: ordered.slice(2, 4) }
    ];
  }

  function twoDDescriptors(data, view2d) {
    return [{ title: t('2D Teknik Görünüş'), kicker: data.model.productGroup === 'pergo-rise' ? t('PLMR Web DXF / 2D') : t('Canonical Technical 2D'), type: '2d', data, view: view2d || null }];
  }

  function buildDescriptors(selection, data, views, view2d) {
    const descriptors = [];
    DOCUMENTS.forEach((doc) => {
      if (!selection.has(doc.id)) return;
      if (doc.id === 'quote') descriptors.push(...quoteDescriptors(data));
      if (doc.id === 'production') descriptors.push(...productionDescriptors(data));
      if (doc.id === 'product-list') descriptors.push(...productListDescriptors(data));
      if (doc.id === '3d') descriptors.push(...viewDescriptors(data, views));
      if (doc.id === '2d') descriptors.push(...twoDDescriptors(data, view2d));
      if (doc.id === 'cut-list') descriptors.push(...cutListDescriptors(data));
      if (doc.id === 'accessories') descriptors.push(...accessoryDescriptors(data));
      if (doc.id === 'optimization') descriptors.push(...optimizationDescriptors(data));
      if (doc.id === 'stock') descriptors.push(...stockDescriptors(data));
    });
    if (data.documentNotes) {
      const rows = [];
      // Bounded blocks allow native pagination even for a 2,000-character note.
      let block = '', breaks = 0;
      for (const char of data.documentNotes) {
        block += char; if (char === '\n') breaks++;
        if (block.length >= 200 || breaks >= 30) { rows.push({note:block,documentRow:true,documentUserFields:['note']}); block = ''; breaks = 0; }
      }
      if (block) rows.push({note:block,documentRow:true,documentUserFields:['note']});
      descriptors.push(...splitTableDescriptors(t('Belge notları'), t('Belge düzenlemeleri'), [{label:t('Belge notları'),width:1,value:'note'}], rows, {rowHeight:50}));
    }
    return descriptors;
  }

  function drawCustomerPlaceholder(ctx, x, y, w, h) {
    fillRound(ctx, x, y, w, h, 8, COLORS.white);
    strokeRound(ctx, x, y, w, h, 8, '#d7e0eb');
    font(ctx, 800, 12); ctx.fillStyle = COLORS.faint; ctx.textAlign = 'center';
    ctx.fillText(t('MÜŞTERİ'), x + w / 2, y + h / 2 + 4);
    ctx.textAlign = 'left';
  }

  function drawQuotePartyCard(ctx, x, y, w, label, name, side, brandLogo) {
    const h = 112;
    fillRound(ctx, x, y, w, h, 12, side === 'seller' ? COLORS.softBlue : COLORS.soft);
    strokeRound(ctx, x, y, w, h, 12, side === 'seller' ? '#c7dafd' : COLORS.line);
    font(ctx, 700, 11); ctx.fillStyle = COLORS.muted; ctx.fillText(label, x + 18, y + 24);
    if (side === 'seller') {
      drawBrandLogo(ctx, brandLogo, x + 18, y + 38, 126, 27);
      font(ctx, 650, 12); ctx.fillStyle = COLORS.text;
      ctx.fillText(ellipsizeText(ctx, name || t('P3DV Çözüm Merkezi'), w - 180), x + 164, y + 60);
      font(ctx, 500, 11); ctx.fillStyle = COLORS.muted;
      ctx.fillText(t('Teklif ve proje dokümantasyonu'), x + 18, y + 91);
    } else {
      drawCustomerPlaceholder(ctx, x + 18, y + 38, 92, 48);
      font(ctx, 750, 15); ctx.fillStyle = COLORS.ink;
      ctx.fillText(ellipsizeText(ctx, name || t('Müşteri'), w - 142), x + 126, y + 61);
      font(ctx, 500, 11); ctx.fillStyle = COLORS.muted;
      ctx.fillText(t('Müşteri logosu eklenmedi'), x + 126, y + 83);
    }
    return h;
  }

  function quoteRowValues(row) {
    const amount = row.documentLineTotal == null ? (row.kind === 'system' ? safeNumber(row.price) : safeNumber(row.price) * Math.max(1, safeNumber(row.qty, 1))) : row.documentLineTotal;
    return [tableValue(row, {value:'name'}, row.name) || '-', row.size || '-', tableValue(row, {value:'color'}, row.color) || '-', String(row.qty || 1), row.documentRow ? new Intl.NumberFormat(documentLanguage === 'en' ? 'en-GB' : 'tr-TR', {style:'currency', currency:'EUR', minimumFractionDigits:2, maximumFractionDigits:2}).format(amount) : money.format(amount)];
  }

  function drawQuoteLineTable(ctx, x, y, w, rows, rowHeights) {
    const columns = [
      { label: t('Ürün'), width: .30 },
      { label: t('Ölçü'), width: .27 },
      { label: t('Renk'), width: .17 },
      { label: t('Adet'), width: .08 },
      { label: t('Demo Fiyat'), width: .18 }
    ];
    const totalWeight = columns.reduce((sum, col) => sum + col.width, 0);
    const widths = columns.map((col) => w * col.width / totalWeight);
    const headerH = 46;
    fillRound(ctx, x, y, w, headerH, 8, COLORS.navy);
    let cx = x;
    columns.forEach((column, index) => {
      font(ctx, 700, 11); ctx.fillStyle = COLORS.white;
      ctx.fillText(ellipsizeText(ctx, column.label, widths[index] - 14), cx + 7, y + 28);
      cx += widths[index];
    });
    let yy = y + headerH;
    (rows || []).forEach((row, rowIndex) => {
      const rowH = rowHeights ? rowHeights[rowIndex] : 61;
      ctx.fillStyle = rowIndex % 2 ? COLORS.soft : COLORS.white;
      ctx.fillRect(x, yy, w, rowH);
      ctx.strokeStyle = COLORS.line; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, yy + rowH); ctx.lineTo(x + w, yy + rowH); ctx.stroke();
      const values = quoteRowValues(row);
      let cellX = x;
      values.forEach((value, index) => {
        font(ctx, index === 0 || index === 4 ? 700 : 550, index === 4 ? 11 : 12);
        ctx.fillStyle = index === 4 ? COLORS.navy : COLORS.text;
        if (rowHeights) {
          const lines = documentLines(ctx, value, widths[index] - 14);
          ctx.textAlign = index >= 3 ? 'right' : 'left';
          lines.forEach((line, li) => ctx.fillText(line, index >= 3 ? cellX + widths[index] - 7 : cellX + 7, yy + 26 + li * 17));
          ctx.textAlign = 'left';
        } else if (index === 3 || index === 4) {
          ctx.textAlign = 'right';
          ctx.fillText(ellipsizeText(ctx, value, widths[index] - 14), cellX + widths[index] - 7, yy + 36);
          ctx.textAlign = 'left';
        } else {
          const lines = wrapLines(ctx, value, widths[index] - 14, index === 0 ? 2 : 1);
          lines.forEach((line, lineIndex) => ctx.fillText(line, cellX + 7, yy + 26 + lineIndex * 17));
        }
        if (index < values.length - 1) {
          ctx.strokeStyle = '#edf1f6';
          ctx.beginPath(); ctx.moveTo(cellX + widths[index], yy + 7); ctx.lineTo(cellX + widths[index], yy + rowH - 7); ctx.stroke();
        }
        cellX += widths[index];
      });
      yy += rowH;
    });
    return headerH + (rowHeights ? rowHeights.reduce((sum, h) => sum + h, 0) : (rows || []).length * 61);
  }

  function drawQuote(ctx, box, data, descriptor, brandLogo) {
    let y = box.y;
    if (descriptor.isFirst) {
      const gap = 18;
      const partyW = (box.w - gap) / 2;
      drawQuotePartyCard(ctx, box.x, y, partyW, t('SATICI / FİRMA'), t('P3DV Çözüm Merkezi'), 'seller', brandLogo);
      drawQuotePartyCard(ctx, box.x + partyW + gap, y, partyW, t('MÜŞTERİ'), t(data.customer), 'customer', brandLogo);
      y += 130;

      const meta = [
        [t('Teklif No'), data.projectNo], [t('Teklif Tarihi'), data.date],
        [t('Ana Sistem'), data.product], [t('Sistem Rengi'), generatedText(data.compactSystemColor)]
      ];
      const metaGap = 12;
      const metaW = (box.w - metaGap * 3) / 4;
      meta.forEach((item, index) => {
        fillRound(ctx, box.x + index * (metaW + metaGap), y, metaW, 66, 9, COLORS.soft);
        font(ctx, 600, 10); ctx.fillStyle = COLORS.muted;
        ctx.fillText(ellipsizeText(ctx, item[0].toUpperCase(), metaW - 20), box.x + index * (metaW + metaGap) + 10, y + 21);
        font(ctx, 750, 13); ctx.fillStyle = COLORS.ink;
        ctx.fillText(ellipsizeText(ctx, String(item[1]), metaW - 20), box.x + index * (metaW + metaGap) + 10, y + 45);
      });
      y += 84;

      const visibleOptions = quoteDisplayOptions(data.options).slice(0, 8);
      const optionText = visibleOptions.length
        ? visibleOptions.map((item) => `${t(item.label)}: ${item.value}`).join('  ·  ')
        : t('Standart sistem · Ek opsiyon seçilmedi');
      font(ctx, 700, 12); ctx.fillStyle = COLORS.muted; ctx.fillText(t('SEÇİLEN OPSİYONLAR'), box.x, y + 14);
      font(ctx, 550, 12); ctx.fillStyle = COLORS.text;
      const optionLines = wrapLines(ctx, optionText, box.w, 2);
      optionLines.forEach((line, index) => ctx.fillText(line, box.x, y + 38 + index * 17));
      y += 76;
    } else {
      fillRound(ctx, box.x, y, box.w, 66, 10, COLORS.softBlue);
      font(ctx, 750, 14); ctx.fillStyle = COLORS.navy;
      ctx.fillText(`${data.projectNo} · ${t(data.customer)}`, box.x + 18, y + 27);
      font(ctx, 500, 12); ctx.fillStyle = COLORS.muted;
      ctx.fillText(t('Teklif kalemleri devam ediyor.'), box.x + 18, y + 49);
      y += 86;
    }

    font(ctx, 800, 19); ctx.fillStyle = COLORS.ink; ctx.fillText(t('Teklif Kalemleri'), box.x, y + 18);
    y += 34;
    const used = drawQuoteLineTable(ctx, box.x, y, box.w, descriptor.rows || [], descriptor.rowHeights);
    y += used + 24;

    if (descriptor.isLast) {
      const summaryH = 208;
      const leftW = box.w * .45;
      const rightX = box.x + leftW + 18;
      const rightW = box.w - leftW - 18;
      fillRound(ctx, box.x, y, leftW, summaryH, 12, COLORS.soft);
      strokeRound(ctx, box.x, y, leftW, summaryH, 12, COLORS.line);
      font(ctx, 800, 16); ctx.fillStyle = COLORS.ink; ctx.fillText(t('Teklif Notu'), box.x + 20, y + 34);
      drawTextBlock(ctx, t('Ana sistem ve projeye eklenen yan ürünler birlikte gösterilir. Fiyatlar P3DV satış demosu için ölçü ve ürün tipine bağlı dinamik prototip değerlerdir; üretim / sipariş fiyatı değildir.'), box.x + 20, y + 66, leftW - 40, 22, 6, COLORS.text, 500, 13);

      fillRound(ctx, rightX, y, rightW, summaryH, 12, COLORS.navy);
      font(ctx, 700, 12); ctx.fillStyle = '#cbd5e1'; ctx.fillText(t('DEMO FİYAT ÖZETİ'), rightX + 22, y + 32);
      const quoteMoney = data.quote.items.some(row => row.documentRow) ? new Intl.NumberFormat(documentLanguage === 'en' ? 'en-GB' : 'tr-TR', {style:'currency',currency:'EUR',minimumFractionDigits:2,maximumFractionDigits:2}) : money;
      const totals = [
        [t('Ara toplam'), quoteMoney.format(data.quote.subtotal)],
        [t('KDV (Demo %20)'), quoteMoney.format(data.quote.vat)],
        [t('GENEL TOPLAM'), quoteMoney.format(data.quote.total)]
      ];
      totals.forEach((line, index) => {
        const yy = y + 76 + index * 50;
        font(ctx, index === 2 ? 800 : 600, index === 2 ? 17 : 13);
        ctx.fillStyle = index === 2 ? COLORS.white : '#dbeafe';
        ctx.fillText(line[0], rightX + 22, yy);
        ctx.textAlign = 'right';
        ctx.fillText(line[1], rightX + rightW - 22, yy);
        ctx.textAlign = 'left';
      });
    } else {
      fillRound(ctx, box.x, y, box.w, 54, 9, COLORS.softBlue);
      font(ctx, 650, 12); ctx.fillStyle = COLORS.navy;
      ctx.fillText(t('Teklif kalemleri sonraki sayfada devam eder.'), box.x + 18, y + 33);
    }
  }

  function drawProductionHeader(ctx, box, data) {
    const h = 165;
    fillRound(ctx, box.x, box.y, box.w, h, 12, COLORS.softBlue);
    const items = [
      [t('Proje / Müşteri'), `${t(data.projectName)} · ${t(data.customer)}`], [t('Ürün'), data.product], [t('Sipariş No'), data.projectNo], [t('Tarih'), data.date],
      [t('Genişlik'), mm(data.model.width)], [t('Açılım'), mm(data.model.depth)], [t('Yükseklik'), mm(data.model.height)], [t('Sistem Rengi'), generatedText(data.systemColor)],
      [t('Panel Rengi'), generatedText(data.panelColor)], [t('Kullanıcı'), t(data.salesperson)]
    ];
    const colW = box.w / 2;
    items.forEach((item, index) => {
      const col = index % 2; const row = Math.floor(index / 2);
      const x = box.x + col * colW + 18; const y = box.y + 28 + row * 27;
      font(ctx, 600, 11); ctx.fillStyle = COLORS.muted; ctx.fillText(`${item[0]}:`, x, y);
      font(ctx, 700, 12); ctx.fillStyle = COLORS.ink; ctx.fillText(String(item[1]).slice(0, 55), x + 112, y);
    });
    return h + 22;
  }

  function drawOptimization(ctx, box, descriptor) {
    const rows = descriptor.rows || [];
    if (!rows.length) {
      font(ctx, 600, 18); ctx.fillStyle = COLORS.muted; ctx.fillText(t('Optimizasyon için kesim parçası bulunamadı.'), box.x, box.y + 40); return;
    }
    let y = box.y;
    rows.forEach((bar) => {
      fillRound(ctx, box.x, y, box.w, 137, 12, COLORS.soft);
      strokeRound(ctx, box.x, y, box.w, 137, 12, COLORS.line);
      font(ctx, 750, 15); ctx.fillStyle = COLORS.ink; ctx.fillText(t('{code} · Stok {stock} · Çubuk {index}', { code: bar.code, stock: mm(bar.stock), index: bar.index }), box.x + 18, y + 28);
      ctx.textAlign = 'right'; font(ctx, 700, 14); ctx.fillStyle = bar.efficiency >= 85 ? COLORS.green : COLORS.amber; ctx.fillText(t('Verim %{efficiency} · Fire {waste}', { efficiency: nf1.format(bar.efficiency), waste: mm(bar.fire) }), box.x + box.w - 18, y + 28); ctx.textAlign = 'left';
      const barX = box.x + 18, barY = y + 55, barW = box.w - 36, barH = 48;
      fillRound(ctx, barX, barY, barW, barH, 6, '#e2e8f0');
      let cursor = barX;
      const usedSegments = bar.segments;
      usedSegments.forEach((segment, index) => {
        const width = barW * segment / bar.stock;
        ctx.fillStyle = index % 2 ? '#60a5fa' : '#2563eb';
        ctx.fillRect(cursor, barY, width, barH);
        if (width > 48) {
          ctx.save(); ctx.beginPath(); ctx.rect(cursor, barY, width, barH); ctx.clip();
          font(ctx, 700, 11); ctx.fillStyle = COLORS.white; ctx.fillText(nf0.format(segment), cursor + 6, barY + 30); ctx.restore();
        }
        cursor += width;
      });
      const fireW = barW * bar.fire / bar.stock;
      if (fireW > 0) {
        ctx.fillStyle = '#cbd5e1'; ctx.fillRect(barX + barW - fireW, barY, fireW, barH);
        if (fireW > 45) { font(ctx, 700, 10); ctx.fillStyle = COLORS.text; ctx.fillText(t('FIRE'), barX + barW - fireW + 5, barY + 30); }
      }
      font(ctx, 500, 12); ctx.fillStyle = COLORS.muted; ctx.fillText(t('{count} parça · kullanılan {used} · kalan {remaining}', { count: usedSegments.length, used: mm(bar.used), remaining: mm(bar.fire) }), box.x + 18, y + 126);
      y += 154;
    });
    if (descriptor.hiddenBars > 0 && y < box.y + box.h - 50) {
      font(ctx, 600, 13); ctx.fillStyle = COLORS.muted; ctx.fillText(t('Görsel örnek sınırı: {count} ek stok çubuğu özet tabloda hesaba dahil edilmiştir.', { count: descriptor.hiddenBars }), box.x, y + 10);
    }
  }

  function drawDimensionLine(ctx, x1, y1, x2, y2, label, vertical) {
    ctx.strokeStyle = COLORS.blue2; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    const tick = 8;
    ctx.beginPath();
    if (vertical) { ctx.moveTo(x1 - tick, y1); ctx.lineTo(x1 + tick, y1); ctx.moveTo(x2 - tick, y2); ctx.lineTo(x2 + tick, y2); }
    else { ctx.moveTo(x1, y1 - tick); ctx.lineTo(x1, y1 + tick); ctx.moveTo(x2, y2 - tick); ctx.lineTo(x2, y2 + tick); }
    ctx.stroke();
    font(ctx, 700, 12); ctx.fillStyle = COLORS.blue;
    if (vertical) { ctx.save(); ctx.translate(x1 - 14, (y1 + y2) / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = 'center'; ctx.fillText(label, 0, 0); ctx.restore(); }
    else { ctx.textAlign = 'center'; ctx.fillText(label, (x1 + x2) / 2, y1 - 12); ctx.textAlign = 'left'; }
  }

  function drawTechnicalView(ctx, x, y, w, h, title, widthValue, heightValue, partitions) {
    fillRound(ctx, x, y, w, h, 12, COLORS.soft);
    strokeRound(ctx, x, y, w, h, 12, COLORS.line);
    font(ctx, 800, 16); ctx.fillStyle = COLORS.ink; ctx.fillText(title, x + 20, y + 30);
    const pad = 68;
    const dw = w - pad * 2, dh = h - pad * 2 - 20;
    const ratio = Math.min(dw / Math.max(1, widthValue), dh / Math.max(1, heightValue));
    const rw = widthValue * ratio, rh = heightValue * ratio;
    const rx = x + (w - rw) / 2, ry = y + 60 + (dh - rh) / 2;
    ctx.strokeStyle = COLORS.navy; ctx.lineWidth = 4; ctx.strokeRect(rx, ry, rw, rh);
    if (Array.isArray(partitions) && partitions.length > 1) {
      let acc = 0;
      partitions.slice(0, -1).forEach((part) => { acc += part; const px = rx + rw * acc / partitions.reduce((s, v) => s + v, 0); ctx.strokeStyle = COLORS.faint; ctx.lineWidth = 2; ctx.beginPath();ctx.moveTo(px, ry);ctx.lineTo(px, ry + rh);ctx.stroke(); });
    }
    drawDimensionLine(ctx, rx, ry + rh + 30, rx + rw, ry + rh + 30, mm(widthValue), false);
    drawDimensionLine(ctx, rx - 34, ry, rx - 34, ry + rh, mm(heightValue), true);
  }

  async function draw2d(ctx, box, data, descriptor) {
    if (descriptor && descriptor.view && descriptor.view.dataUrl) {
      fillRound(ctx, box.x, box.y, box.w, box.h - 20, 14, COLORS.soft);
      strokeRound(ctx, box.x, box.y, box.w, box.h - 20, 14, COLORS.line);
      const img = await loadImage(descriptor.view.dataUrl);
      if (img) {
        const imageBox = { x: box.x + 22, y: box.y + 22, w: box.w - 44, h: box.h - 64 };
        const scale = Math.min(imageBox.w / Math.max(1, img.width), imageBox.h / Math.max(1, img.height));
        const dw = img.width * scale, dh = img.height * scale;
        ctx.drawImage(img, imageBox.x + (imageBox.w - dw) / 2, imageBox.y + (imageBox.h - dh) / 2, dw, dh);
        font(ctx, 600, 12); ctx.fillStyle = COLORS.muted;
        ctx.fillText(descriptor.view.source === 'canonical-technical2d' ? t('{product} · Teknik 2D görünüş', { product: data.product }) : t('PLMR Pergola Web DXF motorundan canlı üretilen 2D görünüş'), box.x + 22, box.y + box.h - 22);
        return;
      }
    }
    if (['b-cube','b-cube-galaxy','bio-rise'].includes(String(data.model.productGroup || ''))) throw new Error(t('Canonical Technical 2D capture oluşturulamadı.'));
    const widths = data.modules.map((m) => m.width);
    const topH = 430;
    drawTechnicalView(ctx, box.x, box.y, box.w, topH, t('ÖN GÖRÜNÜŞ'), safeNumber(data.model.width), safeNumber(data.model.height), widths);
    const gap = 22;
    drawTechnicalView(ctx, box.x, box.y + topH + gap, (box.w - gap) / 2, 420, t('YAN GÖRÜNÜŞ'), safeNumber(data.model.depth), safeNumber(data.model.height), null);
    drawTechnicalView(ctx, box.x + (box.w + gap) / 2, box.y + topH + gap, (box.w - gap) / 2, 420, t('ÜST GÖRÜNÜŞ'), safeNumber(data.model.width), safeNumber(data.model.depth), widths);
    const y = box.y + topH + gap + 455;
    fillRound(ctx, box.x, y, box.w, 160, 10, COLORS.softBlue);
    font(ctx, 800, 16); ctx.fillStyle = COLORS.navy; ctx.fillText(t('Teknik Not'), box.x + 20, y + 34);
    drawTextBlock(ctx, t('Bu sayfa P3DV kanonik ölçülerinden üretilen demo teknik görünüşüdür. Ölçü ve modül bölünmeleri proje girdileri değiştiğinde güncellenir; CAD/imalat paftası doğruluğu bu prototip kapsamının dışındadır.'), box.x + 20, y + 68, box.w - 40, 24, 4, COLORS.text, 500, 14);
  }

  function loadImage(dataUrl) {
    return new Promise((resolve) => {
      if (!dataUrl) return resolve(null);
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => resolve(null);
      image.src = dataUrl;
    });
  }

  function getBrandLogo() {
    if (!brandLogoPromise) brandLogoPromise = loadImage(BRAND_LOGO_URL);
    return brandLogoPromise;
  }

  async function draw3d(ctx, box, descriptor) {
    let y = box.y;
    for (const item of descriptor.views) {
      fillRound(ctx, box.x, y, box.w, 520, 14, COLORS.soft);
      strokeRound(ctx, box.x, y, box.w, 520, 14, COLORS.line);
      font(ctx, 800, 18); ctx.fillStyle = COLORS.ink; ctx.fillText(item.label, box.x + 20, y + 34);
      const img = await loadImage(item.view && item.view.dataUrl);
      const imageBox = { x: box.x + 20, y: y + 54, w: box.w - 40, h: 438 };
      if (img) {
        const scale = Math.min(imageBox.w / img.width, imageBox.h / img.height);
        const dw = img.width * scale, dh = img.height * scale;
        ctx.drawImage(img, imageBox.x + (imageBox.w - dw) / 2, imageBox.y + (imageBox.h - dh) / 2, dw, dh);
      } else {
        font(ctx, 600, 16); ctx.fillStyle = COLORS.muted; ctx.fillText(t('3D görüntü alınamadı'), imageBox.x + 20, imageBox.y + 50);
      }
      y += 548;
    }
  }

  async function renderDescriptor(descriptor, data, pageNo, totalPages) {
    const canvas = createCanvas();
    const ctx = canvas.getContext('2d');
    const brandLogo = await getBrandLogo();
    const box = basePage(ctx, data, descriptor.title, descriptor.kicker, pageNo, totalPages, brandLogo);
    if (descriptor.type === 'quote') drawQuote(ctx, box, data, descriptor, brandLogo);
    else if (descriptor.type === 'optimization') drawOptimization(ctx, box, descriptor);
    else if (descriptor.type === '2d') await draw2d(ctx, box, data, descriptor);
    else if (descriptor.type === '3d') await draw3d(ctx, box, descriptor);
    else if (descriptor.type === 'table') {
      let tableBox = { ...box };
      if (descriptor.productionHeader) {
        const used = drawProductionHeader(ctx, box, data);
        tableBox = { x: box.x, y: box.y + used, w: box.w, h: box.h - used };
      }
      drawTable(ctx, tableBox, descriptor);
      if (descriptor.productionHeader) {
        const total = descriptor.rows.reduce((sum, row) => sum + safeNumber(row.totalKg), 0);
        font(ctx, 700, 13); ctx.fillStyle = COLORS.muted; ctx.textAlign = 'right';
        ctx.fillText(t('Bu sayfadaki yaklaşık profil ağırlığı: {weight}', { weight: kg(total) }), box.x + box.w, Math.min(PAGE.height - PAGE.footer - 28, tableBox.y + 58 + (descriptor.rowHeights ? descriptor.rowHeights.reduce((sum, h) => sum + h, 0) : descriptor.rows.length * (descriptor.rowHeight || 72)) + 30));
        ctx.textAlign = 'left';
      }
    }
    return canvas;
  }

  function pdfFileName(data, selection) {
    const slug = data.product.toLowerCase().replace(/[^a-z0-9ğüşöçıİĞÜŞÖÇ]+/gi, '-').replace(/^-|-$/g, '');
    const suffix = selection.size === DOCUMENTS.length ? t('tum-dokumanlar') : selection.size === 1 ? Array.from(selection)[0] : t('{count}-dokuman', { count: selection.size });
    return `PLMR.V35-${slug}-${data.model.width}x${data.model.depth}-${suffix}.pdf`;
  }


  function vector2DSource(descriptor) {
    const view = descriptor && descriptor.type === '2d' && descriptor.view;
    if (!view || !view.vectorTechnical2D || !view.drawing) return null;
    return view;
  }

  function drawVector2DPage(pdf, descriptor, data, pageIndex, pageTotal) {
    const view = vector2DSource(descriptor);
    const engine = window.PulumurVectorPdfEngine;
    if (!view || !engine || typeof engine.flattenDrawing !== 'function' || typeof engine.drawDrawing !== 'function') return false;
    const drawing = view.drawing;
    if (String(view.modelUnits || drawing.units || '') !== 'mm' || Number(view.modelScale == null ? drawing.modelScale : view.modelScale) !== 1) throw new Error(t('Technical 2D PDF model units 1:1 mm değil.'));
    const flat = engine.flattenDrawing(drawing);
    const bounds = flat && flat.bounds || drawing.bounds;
    if (!bounds || !Array.isArray(flat.entities) || !flat.entities.length) throw new Error(t('Technical 2D PDF drawing entity seti boş.'));
    const pageW = 210, pageH = 297;
    const margin = 12, top = 28, bottom = 20;
    const boxW = pageW - margin * 2, boxH = pageH - top - bottom;
    const width = Math.max(1, Number(bounds.width || (bounds.maxX - bounds.minX)) || 1);
    const height = Math.max(1, Number(bounds.height || (bounds.maxY - bounds.minY)) || 1);
    const scale = Math.min(boxW / width, boxH / height);
    const usedW = width * scale, usedH = height * scale;
    const left = margin + (boxW - usedW) / 2;
    const topY = top + (boxH - usedH) / 2;
    const transform = { scale, x: left - Number(bounds.minX || 0) * scale, y: topY + Number(bounds.maxY || 0) * scale };

    pdf.setFillColor(255,255,255); pdf.rect(0,0,pageW,pageH,'F');
    // Keep the existing PLMR document identity as vector text; only the Technical2D geometry changed from raster to shared vector drawing.
    pdf.setTextColor(23,37,84); pdf.setFont('helvetica','bold'); pdf.setFontSize(8.5); pdf.text('PLMR', margin, 7.5);
    pdf.setFontSize(12); pdf.text(t('2D Teknik Görünüş'), margin, 13);
    pdf.setFont('helvetica','normal'); pdf.setFontSize(7.5); pdf.setTextColor(75,85,99);
    pdf.text(t('{product} · Teknik 2D görünüş', { product: data.product }), margin, 18);
    const technicalScale = Number(view.technicalScale);
    const sourceLabel = Number.isFinite(technicalScale) && technicalScale > 0 ? t('Ortak görünüş ölçeği: {scale} px/mm · DXF model: 1:1 mm', { scale: technicalScale.toFixed(6) }) : t('DXF model: 1:1 mm');
    pdf.text(sourceLabel, margin, 22);
    pdf.text(t('Sayfa {page} / {total}', { page: pageIndex + 1, total: pageTotal }), pageW - margin, 8, { align:'right' });
    pdf.setDrawColor(180,186,196); pdf.setLineWidth(0.18); pdf.rect(margin, top - 2, boxW, boxH + 4);
    engine.drawDrawing(pdf, drawing, transform, { flat, fontName: 'helvetica' });
    pdf.setFont('helvetica','normal'); pdf.setFontSize(7); pdf.setTextColor(100,110,125);
    pdf.text(t('Vektör teknik çizim · {count} çizim öğesi', { count: flat.entities.length }), margin, pageH - 8);
    pdf.__plmrLastVectorTechnical2D = { source: view.source || '', schema: drawing.schema || '', entityCount: flat.entities.length, modelUnits: 'mm', modelScale: 1, technicalScale: Number.isFinite(technicalScale) ? technicalScale : null, pageScale: scale };
    return true;
  }


  function documentAvailability() {
    const api = bridge();
    const raw = api && typeof api.documentCapabilities === 'function' ? api.documentCapabilities() : null;
    const availability = {};
    DOCUMENTS.forEach((doc) => { availability[doc.id] = raw && Object.prototype.hasOwnProperty.call(raw, doc.id) ? Boolean(raw[doc.id]) : true; });
    return availability;
  }

  function sanitizeSelection(selection) {
    const availability = documentAvailability();
    return new Set(Array.from(selection || []).filter((id) => DOCUMENTS.some((doc) => doc.id === id) && availability[id] !== false));
  }

  function documentOwner() {
    try {
      const access = (window.parent && window.parent !== window ? window.parent : window).PulumurAccessContext;
      const context = access && typeof access.getContext === 'function' ? access.getContext() : null;
      return {userId:String(context && context.userId || ''), organizationId:String(context && context.organizationId || ''), epoch:access && typeof access.getSessionEpoch === 'function' ? access.getSessionEpoch() : null};
    } catch (_) { return {userId:'',organizationId:'',epoch:null}; }
  }

  function workspaceSource() {
    const api = bridge();
    if (!api || typeof api.readModel !== 'function' || typeof api.isReady !== 'function' || !api.isReady()) throw new Error('SOURCE_CHANGED');
    const owner = documentOwner();
    return JSON.parse(JSON.stringify({model:api.readModel(), reportProducts:typeof api.readReportProducts === 'function' ? api.readReportProducts() : [], authScope:{userId:owner.userId,organizationId:owner.organizationId}}));
  }

  async function prepareWorkspace(selection) {
    const Core = window.PulumurDocumentWorkspace;
    if (!Core) throw new Error('DOCUMENT_WORKSPACE_UNAVAILABLE');
    const owner = documentOwner(), ownerKey = Core.stable(owner);
    const selected = Array.from(sanitizeSelection(selection));
    if (!selected.length) throw new Error(ui('Bu ürün için aktif en az bir doküman seçin.'));
    const source = workspaceSource(), sourceKey = await Core.fingerprint(source);
    const data = buildDocumentData(source.model, source.reportProducts);
    const workspace = new Core.Workspace(data, selected, sourceKey);
    const ownerValid = () => Core.stable(documentOwner()) === ownerKey;
    async function validate() {
      if (!ownerValid()) throw new Error('SESSION_CHANGED');
      if (Core.stable(Array.from(sanitizeSelection(selected))) !== Core.stable(selected)) throw new Error('SELECTION_CHANGED');
      const current = workspaceSource();
      if (await Core.fingerprint(current) !== sourceKey || Core.stable(workspaceSource()) !== Core.stable(current)) throw new Error('SOURCE_CHANGED');
      if (!ownerValid()) throw new Error('SESSION_CHANGED');
    }
    await validate();
    return {
      workspace, translate:ui, language:activeLanguage, ownerValid,
      displayCell(id, row, key) {
        const index = workspace.original.sheets[id].findIndex(item => item.id === row.sourceId);
        const sourceRows = id === 'quote' ? data.quote.items : data[{production:'production','product-list':'productRows','cut-list':'cuts',accessories:'accessories',stock:'stock'}[id]];
        return tableValue({...sourceRows[index], ...row.values, documentUserFields:row.userFields}, {value:key}, row.values[key]);
      },
      async exportPDF(current) {
        if (current !== workspace) throw new Error('SOURCE_MISMATCH');
        // Snapshot before the first await so edits cannot race PDF generation.
        const reviewed = current.applyTo(data);
        return generate(new Set(selected), {data:reviewed,validate});
      },
      regenerate:() => prepareWorkspace(new Set(selected))
    };
  }

  async function generate(selection, review) {
    if (generationActive) throw new Error(ui('PDF zaten hazırlanıyor.'));
    generationActive = true;
    documentLanguage = activeLanguage();
    try { return await generateDocument(selection, review); }
    finally { documentLanguage = null; generationActive = false; }
  }

  async function generateDocument(selection, review) {
    if (review) await review.validate();
    const api = bridge();
    if (!api || typeof api.readModel !== 'function') throw new Error(t('Doküman veri köprüsü hazır değil.'));
    const safeSelection = sanitizeSelection(selection);
    const model = api.readModel();
    if (typeof api.isReady === 'function' && !api.isReady()) throw new Error(t('Önce geçerli bir proje/çizim oluşturun.'));
    const reportProducts = typeof api.readReportProducts === 'function' ? api.readReportProducts() : [];
    const data = review ? review.data : buildDocumentData(model, reportProducts);
    let views = [];
    let view2d = null;
    if (safeSelection.has('3d')) views = typeof api.captureViews === 'function' ? await Promise.resolve(api.captureViews()) : [];
    if (safeSelection.has('2d')) view2d = typeof api.capture2DView === 'function' ? await Promise.resolve(api.capture2DView()) : null;
    const descriptors = buildDescriptors(safeSelection, data, views, view2d);
    if (!descriptors.length) throw new Error(t('Bu ürün için aktif en az bir doküman seçin.'));
    const Pdf = window.jspdf && window.jspdf.jsPDF;
    if (!Pdf) throw new Error(t('P3DV PDF motoru yüklenemedi.'));
    const pdf = new Pdf({ orientation: 'p', unit: 'mm', format: 'a4' });
    for (let i = 0; i < descriptors.length; i += 1) {
      if (i > 0) pdf.addPage();
      const descriptor = descriptors[i];
      const vector2D = descriptor.type === '2d' ? drawVector2DPage(pdf, descriptor, data, i, descriptors.length) : false;
      if (descriptor.type === '2d' && descriptor.view && ['canonical-technical2d','pergola-canonical-drawing'].includes(String(descriptor.view.source || '')) && !vector2D) {
        throw new Error(t('TECHNICAL2D_VECTOR_PDF_UNAVAILABLE: Canlı Technical 2D shared vector PDF kaynağı oluşturulamadı.'));
      }
      if (!vector2D) {
        const canvas = await renderDescriptor(descriptor, data, i + 1, descriptors.length);
        pdf.addImage(canvas.toDataURL('image/jpeg', 0.91), 'JPEG', 0, 0, 210, 297);
      }
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }
    if (review) await review.validate();
    pdf.save(pdfFileName(data, safeSelection));
    return { pages: descriptors.length, data, selection: Array.from(safeSelection) };
  }

  function updatePanelState() {
    if (!panel) return;
    refreshPanelLanguage();
    const availability = documentAvailability();
    const boxes = Array.from(panel.querySelectorAll('input[data-doc-id]'));
    boxes.forEach((box) => {
      const enabled = availability[box.dataset.docId] !== false;
      box.disabled = !enabled;
      if (!enabled) box.checked = false;
      const option = box.closest('.p3dv-document-option');
      if (option) option.classList.toggle('is-unavailable', !enabled);
    });
    const enabledBoxes = boxes.filter((box) => !box.disabled);
    const selected = enabledBoxes.filter((box) => box.checked);
    const all = panel.querySelector('#p3dvDocumentAll');
    const button = panel.querySelector('#p3dvDocumentCreate');
    if (all) {
      all.checked = enabledBoxes.length > 0 && selected.length === enabledBoxes.length;
      all.indeterminate = selected.length > 0 && selected.length < enabledBoxes.length;
    }
    if (button) button.disabled = busy || selected.length === 0;
    const count = panel.querySelector('#p3dvDocumentSelectedCount');
    if (count) count.textContent = selected.length ? ui('{count} doküman seçildi', { count: selected.length }) : ui('Doküman seçin');
  }

  function selectionFromPanel() {
    return new Set(Array.from(panel.querySelectorAll('input[data-doc-id]:checked:not(:disabled)')).map((box) => box.dataset.docId));
  }

  function close() {
    if (!panel || busy) return;
    panel.hidden = true;
    if (anchorButton) anchorButton.setAttribute('aria-expanded', 'false');
  }

  function position() {
    if (!panel || !anchorButton || panel.hidden) return;
    const rect = anchorButton.getBoundingClientRect();
    const width = Math.min(438, window.innerWidth - 24);
    panel.style.width = `${width}px`;
    const left = clamp(rect.right - width, 12, Math.max(12, window.innerWidth - width - 12));
    const maxTop = Math.max(12, window.innerHeight - panel.offsetHeight - 12);
    const preferredTop = rect.bottom + 10;
    panel.style.left = `${left}px`;
    panel.style.top = `${Math.min(preferredTop, maxTop)}px`;
  }

  function refreshPanelLanguage() {
    if (!panel) return;
    panel.setAttribute('aria-label', ui('Dokümanları Seç'));
    panel.setAttribute('lang', activeLanguage());
    panel.querySelectorAll('[data-doc-copy]').forEach((node) => { node.textContent = ui(node.dataset.docCopy); });
    const closeButton = panel.querySelector('.p3dv-document-close');
    if (closeButton) closeButton.setAttribute('aria-label', ui('Kapat'));
    const label = panel.querySelector('.p3dv-document-create-label');
    if (label) label.textContent = ui(buttonStatus);
  }

  function observeLanguage() {
    const refresh = () => { updatePanelState(); position(); };
    window.addEventListener('storage', (event) => { if (event.key === 'pulumur_lang' || event.key === null) refresh(); });
    if (typeof MutationObserver === 'function') {
      languageObserver = new MutationObserver(refresh);
      languageObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
      try {
        if (window.parent && window.parent !== window) languageObserver.observe(window.parent.document.documentElement, { attributes: true, attributeFilter: ['lang'] });
      } catch (_) { /* Cross-origin hosts cannot share their DOM. */ }
      window.addEventListener('pagehide', () => { languageObserver.disconnect(); });
      window.addEventListener('pageshow', (event) => {
        if (!event.persisted) return;
        languageObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
        try { if (window.parent && window.parent !== window) languageObserver.observe(window.parent.document.documentElement, { attributes: true, attributeFilter: ['lang'] }); } catch (_) {}
        refresh();
      });
    }
  }

  function ensurePanel() {
    if (panel) return panel;
    panel = document.createElement('div');
    panel.className = 'p3dv-document-center';
    panel.id = 'p3dvDocumentCenter';
    panel.hidden = true;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', ui('Dokümanları Seç'));
    panel.innerHTML = `
      <div class="p3dv-document-center-head">
        <div><strong data-doc-copy="Dokümanları Seç"></strong><span data-doc-copy="Tek PDF · çoklu bölüm"></span></div>
        <button type="button" class="p3dv-document-close" aria-label="${ui('Kapat')}">×</button>
      </div>
      <div class="p3dv-document-grid">
        ${DOCUMENTS.map((doc) => `<label class="p3dv-document-option"><input type="checkbox" data-doc-id="${doc.id}"><span class="p3dv-document-check"></span><b data-doc-copy="${doc.label}"></b></label>`).join('')}
        <label class="p3dv-document-option p3dv-document-all"><input type="checkbox" id="p3dvDocumentAll"><span class="p3dv-document-check"></span><b data-doc-copy="Hepsi"></b></label>
      </div>
      <div class="p3dv-document-center-foot">
        <span id="p3dvDocumentSelectedCount"></span>
        <button type="button" id="p3dvDocumentCreate" disabled><span class="p3dv-document-create-label"></span><span class="p3dv-document-spinner" aria-hidden="true"></span></button>
      </div>`;
    document.body.appendChild(panel);
    refreshPanelLanguage();
    observeLanguage();
    panel.querySelector('.p3dv-document-close').addEventListener('click', close);
    panel.querySelectorAll('input[data-doc-id]').forEach((box) => box.addEventListener('change', updatePanelState));
    panel.querySelector('#p3dvDocumentAll').addEventListener('change', (event) => {
      panel.querySelectorAll('input[data-doc-id]:not(:disabled)').forEach((box) => { box.checked = event.target.checked; });
      updatePanelState();
    });
    panel.querySelector('#p3dvDocumentCreate').addEventListener('click', async () => {
      if (busy) return;
      const selection = selectionFromPanel();
      if (!selection.size) return;
      busy = true;
      const createButton = panel.querySelector('#p3dvDocumentCreate');
      const label = panel.querySelector('.p3dv-document-create-label');
      panel.classList.add('is-busy');
      createButton.disabled = true;
      buttonStatus = 'Tablolar Hazırlanıyor'; label.textContent = ui(buttonStatus);
      try {
        const session = await prepareWorkspace(selection);
        if (!window.P3DVDocumentWorkspaceUI) throw new Error('DOCUMENT_WORKSPACE_UNAVAILABLE');
        window.P3DVDocumentWorkspaceUI.open(session);
        panel.hidden = true;
        if (anchorButton) anchorButton.setAttribute('aria-expanded', 'false');
      } catch (error) {
        console.error('P3DV document workspace error', error);
        window.alert(error && error.message ? error.message : ui('İşlem tamamlanamadı.'));
      } finally {
        buttonStatus = 'Tabloları İncele';
        busy = false;
        panel.classList.remove('is-busy');
        updatePanelState();
      }
    });
    window.addEventListener('resize', position);
    window.addEventListener('scroll', position, true);
    document.addEventListener('pointerdown', (event) => {
      if (!panel || panel.hidden || busy) return;
      if (panel.contains(event.target) || (anchorButton && anchorButton.contains(event.target))) return;
      close();
    });
    return panel;
  }

  function open(button) {
    const api = bridge();
    if (!api || typeof api.isReady !== 'function' || !api.isReady()) {
      window.alert(ui('Önce geçerli bir proje/çizim oluşturun.'));
      return;
    }
    anchorButton = button || document.getElementById('toolbarPdfBtn');
    const target = ensurePanel();
    if (!target.hidden) { close(); return; }
    target.hidden = false;
    if (anchorButton) anchorButton.setAttribute('aria-expanded', 'true');
    updatePanelState();
    requestAnimationFrame(position);
  }

  window.P3DVDocumentCenter = Object.freeze({
    open,
    close,
    generateFromSelection: async (ids) => generate(new Set((ids || []).filter((id) => DOCUMENTS.some((doc) => doc.id === id)))),
    prepareWorkspaceForSelection: (ids) => prepareWorkspace(new Set(ids || [])),
    documentIds: DOCUMENTS.map((item) => item.id),
    availabilityForTest: () => ({ ...documentAvailability() }),
    refreshAvailability: () => updatePanelState(),
    buildDataForTest: (model, reportProducts) => buildDocumentData(
      model,
      Array.isArray(reportProducts) ? reportProducts : (bridge() && typeof bridge().readReportProducts === 'function' ? bridge().readReportProducts() : [])
    )
  });
})();
