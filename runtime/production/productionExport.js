/* Shared V34 A4 form presentation; verified V49 calculations remain unchanged. */
(function (root) {
  'use strict';

  const STATUS = Object.freeze({ NORMAL:'NORMAL', ZERO_RESULT:'ZERO_RESULT', MANUAL_OVERRIDE:'MANUAL_OVERRIDE', MANUAL_REQUIRED:'MANUAL_REQUIRED' });
  const STATUS_COLORS = Object.freeze({ NORMAL:'#ffffff', ZERO_RESULT:'#f8c7c9', MANUAL_OVERRIDE:'#d9eaf7', MANUAL_REQUIRED:'#f9cb9c' });
  const SOURCE_ORANGE = '#f4b183';
  const STATUS_STYLE = Object.freeze({ NORMAL:3, ZERO_RESULT:5, MANUAL_OVERRIDE:6, MANUAL_REQUIRED:7 });
  const XML_HEADER = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
  const NS = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';
  const REL_NS = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
  const htmlEsc = value => String(value == null ? '' : value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safeSheet = value => String(value || 'POZ').replace(/[\\/*?:\[\]]/g,'-').slice(0,31) || 'POZ';
  const colName = index => { let name=''; let n=index; while(n>0){n-=1;name=String.fromCharCode(65+(n%26))+name;n=Math.floor(n/26);} return name; };
  const cellRef=(row,col)=>`${colName(col)}${row}`;
  const statusStyle = value => STATUS_STYLE[value] || STATUS_STYLE.NORMAL;
  const fieldStatus = (line, field) => line && line.fieldStatus && line.fieldStatus[field] || line && line.status || STATUS.NORMAL;
  const roundMm = value => value == null || value === '' ? '' : Math.round(Number(value));
  const fmtQty = value => value == null || value === '' ? '' : (Number.isFinite(Number(value)) ? new Intl.NumberFormat('tr-TR',{maximumFractionDigits:2}).format(Number(value)) : String(value));
  const formatDate = value => {
    const raw=String(value||'').trim(); if(!raw)return'';
    const m=raw.match(/^(\d{4})-(\d{2})-(\d{2})/); return m?`${m[3]}.${m[2]}.${m[1]}`:raw;
  };
  const lineNote = line => [line&&line.remoteLabel,line&&line.description].filter(Boolean).join(' · ');
  const rowBaseStatus = line => line && line.status===STATUS.ZERO_RESULT ? STATUS.ZERO_RESULT : STATUS.NORMAL;

  function materialIndex(materials) {
    const map = new Map();
    (Array.isArray(materials)?materials:[]).forEach(item => { if(item && item.code) map.set(String(item.code).toUpperCase(), item); });
    return map;
  }
  function imageDataFor(code){const all=root.PulumurGuillotineMaterialImageDataV1||{};return all[String(code||'').toUpperCase()]||'';}
  function imageSrc(material,prefix){return material&&material.image?`${prefix||''}${material.image}`:'';}
  function lineByRow(position){const map=new Map();(position&&position.lines||[]).forEach(line=>map.set(Number(line.sourceRow),line));return map;}

  function positionFormModel(pkg, position, materials) {
    const mat=materialIndex(materials), profiles=[], accessories=[];
    for(const original of position.lines||[]){
      const material=mat.get(String(original.materialCode).toUpperCase())||{};
      const line={...original,image:material.image||null,imageSha256:material.imageSha256||null};
      if(line.kind==='PROFILE')profiles.push(line);
      else if(line.kind==='GLASS')accessories.push({...line,isNoteOnly:true,materialCode:'',profileName:'',image:null,unit:'',effectiveQuantity:null,status:STATUS.NORMAL,fieldStatus:{}});
      else accessories.push(line);
    }
    return {profiles,accessories};
  }

  function sourceFormValues(pkg,position){
    const info=pkg.projectInfo||{}, source=position.source||{};
    return {
      poz:source.positionNo||position.positionNo||'', country:info.country||'', customer:info.customerName||'', project:info.projectName||info.projectCode||'', date:formatDate(info.date),
      packaging:info.packaging||'', color:`${source.systemColor||''} ${source.surface||''}`.trim(), width:roundMm(source.width), height:roundMm(source.height), quantity:source.quantity||'',
      glassType:source.glassThickness||'', glassColor:source.glassColor||'', view:source.view||'', motorDirection:source.motorDirection||'', motor:source.motorType||'',
      remote:String(source.remoteControl||'').split(' | ').join('\n'), remoteQuantity:source.remoteQuantity==null?'':source.remoteQuantity, description:source.description||''
    };
  }

  function xCell(value,row,col,style){
    const ref=cellRef(row,col), s=style==null?'':` s="${style}"`;
    if(value==null||value==='')return `<c r="${ref}"${s} t="inlineStr"><is><t></t></is></c>`;
    if(typeof value==='number'&&Number.isFinite(value))return `<c r="${ref}"${s}><v>${value}</v></c>`;
    return `<c r="${ref}"${s} t="inlineStr"><is><t xml:space="preserve">${esc(value)}</t></is></c>`;
  }
  function worksheetXml(def,hasDrawing){
    const cols=(def.columns||[]).map((w,i)=>`<col min="${i+1}" max="${i+1}" width="${w}" customWidth="1"/>`).join('');
    const rowXml=(def.rows||[]).map((row,ri)=>{
      const rn=ri+1,h=row.height?` ht="${row.height}" customHeight="1"`:'';
      const cells=(row.cells||[]).map((c,ci)=>xCell(c&&Object.prototype.hasOwnProperty.call(c,'v')?c.v:c,rn,ci+1,c&&c.s!=null?c.s:3)).join('');
      return `<row r="${rn}"${h}>${cells}</row>`;
    }).join('');
    const merges=(def.merges||[]).length?`<mergeCells count="${def.merges.length}">${def.merges.map(x=>`<mergeCell ref="${x}"/>`).join('')}</mergeCells>`:'';
    const filter=def.autoFilter?`<autoFilter ref="${def.autoFilter}"/>`:'';
    const freeze=def.freeze?`<sheetViews><sheetView workbookViewId="0"><pane ySplit="${def.freeze}" topLeftCell="A${def.freeze+1}" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>`:'<sheetViews><sheetView workbookViewId="0"/></sheetViews>';
    const maxCols=Math.max(1,...(def.rows||[]).map(r=>(r.cells||[]).length)),maxRows=Math.max(1,(def.rows||[]).length);
    return `${XML_HEADER}<worksheet xmlns="${NS}" xmlns:r="${REL_NS}"><dimension ref="A1:${colName(maxCols)}${maxRows}"/>${freeze}<sheetFormatPr defaultRowHeight="18"/><cols>${cols}</cols><sheetData>${rowXml}</sheetData>${filter}${merges}<printOptions horizontalCentered="1" verticalCentered="0"/><pageMargins left="0.15" right="0.15" top="0.2" bottom="0.2" header="0.1" footer="0.1"/><pageSetup paperSize="9" orientation="${def.orientation||'portrait'}" fitToWidth="1" fitToHeight="${def.fitToHeight==null?1:def.fitToHeight}"/>${hasDrawing?'<drawing r:id="rId1"/>':''}</worksheet>`;
  }
  const xc=(v,s=3)=>({v,s});
  const blankCells=(n,s=3)=>Array.from({length:n},()=>xc('',s));

  function positionSheet(pkg,position,materials){
    const m=positionFormModel(pkg,position,materials), v=sourceFormValues(pkg,position), rows=[],merges=[],images=[];
    rows.push({height:30,cells:[xc('GİYOTİN ÜRETİM FORMU (ISICAM 1+2)',1),...blankCells(8,1)]});merges.push('A1:I1');
    const headerInfo=(a,b,c,d,e)=>{rows.push({height:21,cells:[xc(a,2),xc(b,2),xc('',2),xc(c,2),xc('',2),xc(d,2),xc('',2),xc(e,2),xc('',2)]});const n=rows.length;merges.push(`B${n}:C${n}`,`D${n}:E${n}`,`F${n}:G${n}`,`H${n}:I${n}`);};
    const valueInfo=(a,b,c,d,e)=>{rows.push({height:30,cells:[xc(a,3),xc(b,3),xc('',3),xc(c,3),xc('',3),xc(d,3),xc('',3),xc(e,3),xc('',3)]});const n=rows.length;merges.push(`B${n}:C${n}`,`D${n}:E${n}`,`F${n}:G${n}`,`H${n}:I${n}`);};
    headerInfo('POZ NO','ÜLKE','MÜŞTERİ','PROJE','TARİH');valueInfo(v.poz,v.country,v.customer,v.project,v.date);
    headerInfo('PAKETLEME','SİSTEM RENGİ','GENİŞLİK','YÜKSEKLİK','ADET');valueInfo(v.packaging,v.color,v.width,v.height,v.quantity);
    headerInfo('CAM TÜRÜ','CAM RENGİ','BAKIŞ YÖNÜ','MOTOR YÖNÜ','MOTOR');valueInfo(v.glassType,v.glassColor,v.view,v.motorDirection,v.motor);
    rows.push({height:21,cells:[xc('KUMANDA',2),...blankCells(2,2),xc('KUMANDA ADET',2),xc('',2),xc('AÇIKLAMA',2),...blankCells(3,2)]});merges.push('A8:C8','D8:E8','F8:I8');
    rows.push({height:Math.max(30,String(v.remote).split('\n').length*12+6,Math.ceil(String(v.description).length/48)*12+6),cells:[xc(v.remote,3),...blankCells(2,3),xc(v.remoteQuantity,3),xc('',3),xc(v.description,3),...blankCells(3,3)]});merges.push('A9:C9','D9:E9','F9:I9');
    rows.push({height:24,cells:[xc('PROFİL KESİM LİSTESİ',8),...blankCells(8,8)]});merges.push('A10:I10');
    rows.push({height:22,cells:[xc('MALZEME KODU',9),xc('MALZEME İSİM',9),xc('',9),xc('RESİM',9),xc('NOT',9),xc('',9),xc('',9),xc('KESİM ÖLÇÜ',9),xc('ADET',9)]});merges.push('B11:C11','E11:G11');
    m.profiles.forEach(line=>{
      const base=rowBaseStatus(line),rn=rows.length+1,ls=fieldStatus(line,'length'),qs=fieldStatus(line,'quantity'),ds=fieldStatus(line,'description');
      rows.push({height:28,cells:[xc(line.materialCode,statusStyle(base)),xc(line.profileName,statusStyle(base)),xc('',statusStyle(base)),xc('',statusStyle(base)),xc(lineNote(line),statusStyle(ds===STATUS.MANUAL_OVERRIDE?ds:base)),xc('',statusStyle(base)),xc('',statusStyle(base)),xc(line.effectiveLength==null?'':roundMm(line.effectiveLength),statusStyle(ls)),xc(line.isNoteOnly?'':line.effectiveQuantity==null?'GİRİŞ GEREKLİ':Number(line.effectiveQuantity),statusStyle(qs))]});
      merges.push(`B${rn}:C${rn}`,`E${rn}:G${rn}`);if(imageDataFor(line.materialCode))images.push({code:line.materialCode,row:rn,col:4});
    });
    rows.push({height:24,cells:[xc('AKSESUAR LİSTESİ',8),...blankCells(8,8)]});merges.push(`A${rows.length}:I${rows.length}`);
    const ah=rows.length+1;rows.push({height:22,cells:[xc('MALZEME KODU',9),xc('MALZEME İSİM',9),xc('',9),xc('RESİM',9),xc('NOT',9),xc('',9),xc('',9),xc('BİRİM',9),xc('MİKTAR',9)]});merges.push(`B${ah}:C${ah}`,`E${ah}:G${ah}`);
    m.accessories.forEach(line=>{
      const base=rowBaseStatus(line),rn=rows.length+1,qs=fieldStatus(line,'quantity'),ds=fieldStatus(line,'description');
      rows.push({height:28,cells:[xc(line.materialCode,statusStyle(base)),xc(line.profileName,statusStyle(base)),xc('',statusStyle(base)),xc('',statusStyle(base)),xc(line.detail||lineNote(line),statusStyle(ds===STATUS.MANUAL_OVERRIDE?ds:base)),xc('',statusStyle(base)),xc('',statusStyle(base)),xc(line.unit||'',statusStyle(base)),xc(line.isNoteOnly?'':line.effectiveQuantity==null?'GİRİŞ GEREKLİ':Number(line.effectiveQuantity),statusStyle(qs))]});
      merges.push(`B${rn}:C${rn}`,`E${rn}:G${rn}`);if(imageDataFor(line.materialCode))images.push({code:line.materialCode,row:rn,col:4});
    });
    return {name:safeSheet(position.positionNo),columns:[15,15,15,15,15,15,15,15,15],rows,merges,images,orientation:'portrait',fitToHeight:1,printArea:`A1:I${rows.length}`};
  }

  function summarySheet(pkg){
    const rows=[{height:30,cells:[xc('GİYOTİN ÜRETİM PAKETİ',1),...blankCells(10,1)]},{height:22,cells:['Poz','Genişlik','Yükseklik','Panel','Adet','Bakış','Motor Yönü','Motor','Sistem Rengi','Üretime Uygunluk','Açıklama'].map(x=>xc(x,9))}];
    (pkg.sourcePositions||[]).forEach(src=>{const pos=(pkg.positions||[]).find(p=>p.positionId===src.positionId);const s=pos&&pos.suitability||{status:'UNKNOWN',reasons:[]};rows.push({cells:[xc(src.positionNo,3),xc(roundMm(src.width),4),xc(roundMm(src.height),4),xc(src.panelLayout||'',3),xc(Number(src.quantity)||0,4),xc(src.view||'',3),xc(src.motorDirection||'',3),xc(src.motorType||'',3),xc(`${src.systemColor||''} ${src.surface||''}`.trim(),3),xc(s.status,3),xc((s.reasons||[]).map(x=>x.message).join('; '),3)]});});
    return {name:'ÖZET',columns:[14,14,14,14,10,18,16,20,24,20,44],rows,merges:['A1:K1'],orientation:'landscape',fitToHeight:0,freeze:2,autoFilter:`A2:K${rows.length}`,printArea:`A1:K${rows.length}`};
  }
  function cutsSheet(pkg){
    const rows=[{height:30,cells:[xc('KESİM LİSTESİ',1),...blankCells(9,1)]},{height:22,cells:['Pozlar','Kod','Görsel','Profil','Boy (mm)','Toplam Adet','RAL','Yüzey','Açıklama','Durum'].map(x=>xc(x,9))}],images=[];
    (pkg.cutItems||[]).forEach(line=>{const base=rowBaseStatus(line),rn=rows.length+1;rows.push({height:28,cells:[xc(line.positionNo||'',statusStyle(base)),xc(line.materialCode||'',statusStyle(base)),xc('',statusStyle(base)),xc(line.profileName||'',statusStyle(base)),xc(line.effectiveLength==null?'':roundMm(line.effectiveLength),statusStyle(fieldStatus(line,'length'))),xc(line.isNoteOnly?'':line.effectiveQuantity==null?'GİRİŞ GEREKLİ':Number(line.effectiveQuantity),statusStyle(fieldStatus(line,'quantity'))),xc(line.ral||'',statusStyle(fieldStatus(line,'ral'))),xc(line.surface||'',statusStyle(fieldStatus(line,'surface'))),xc(lineNote(line),statusStyle(fieldStatus(line,'description'))),xc(line.status||'',statusStyle(base))]});if(imageDataFor(line.materialCode))images.push({code:line.materialCode,row:rn,col:3});});
    return {name:'KESİM LİSTESİ',columns:[14,15,12,34,16,15,18,16,42,20],rows,images,merges:['A1:J1'],orientation:'landscape',fitToHeight:0,freeze:2,autoFilter:`A2:J${rows.length}`,printArea:`A1:J${rows.length}`};
  }

  function stylesXml(){
    return `${XML_HEADER}<styleSheet xmlns="${NS}"><fonts count="4"><font><sz val="9"/><name val="Arial"/></font><font><b/><sz val="16"/><color rgb="FFFFFFFF"/><name val="Arial"/></font><font><b/><sz val="9"/><color rgb="FF000000"/><name val="Arial"/></font><font><b/><sz val="9"/><color rgb="FFFFFFFF"/><name val="Arial"/></font></fonts><fills count="10"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFF4B183"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFFFFFFF"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFFFFFFF"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFF8C7C9"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFD9EAF7"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFF9CB9C"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFF4B183"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFF4B183"/></patternFill></fill></fills><borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border><border><left style="thin"><color rgb="FF666666"/></left><right style="thin"><color rgb="FF666666"/></right><top style="thin"><color rgb="FF666666"/></top><bottom style="thin"><color rgb="FF666666"/></bottom><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="13"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf><xf numFmtId="0" fontId="3" fillId="2" borderId="1" xfId="0" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf><xf numFmtId="0" fontId="2" fillId="3" borderId="1" xfId="0" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf><xf numFmtId="0" fontId="2" fillId="3" borderId="1" xfId="0" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf><xf numFmtId="0" fontId="2" fillId="5" borderId="1" xfId="0" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf><xf numFmtId="0" fontId="2" fillId="6" borderId="1" xfId="0" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf><xf numFmtId="0" fontId="2" fillId="7" borderId="1" xfId="0" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf><xf numFmtId="0" fontId="3" fillId="8" borderId="1" xfId="0" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf><xf numFmtId="0" fontId="3" fillId="9" borderId="1" xfId="0" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf><xf numFmtId="0" fontId="0" fillId="3" borderId="1" xfId="0" applyAlignment="1"><alignment vertical="center"/></xf><xf numFmtId="0" fontId="2" fillId="3" borderId="1" xfId="0" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf><xf numFmtId="0" fontId="2" fillId="3" borderId="1" xfId="0" applyAlignment="1"><alignment horizontal="left" vertical="center" wrapText="1"/></xf></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`;
  }
  function dataUriBytes(uri){
    const raw=String(uri||'').split(',')[1]||''; if(!raw)return new Uint8Array(0);
    if(typeof atob==='function'){const bin=atob(raw),out=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)out[i]=bin.charCodeAt(i);return out;}
    if(typeof Buffer!=='undefined')return new Uint8Array(Buffer.from(raw,'base64'));
    return new Uint8Array(0);
  }
  function mediaName(code){return `material-${String(code||'item').replace(/[^A-Za-z0-9_-]/g,'_')}.png`;}
  function drawingXml(images){
    return `${XML_HEADER}<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="${REL_NS}">${images.map((img,i)=>{const col=Math.max(0,(img.col||1)-1),row=Math.max(0,(img.row||1)-1);return `<xdr:oneCellAnchor><xdr:from><xdr:col>${col}</xdr:col><xdr:colOff>80000</xdr:colOff><xdr:row>${row}</xdr:row><xdr:rowOff>50000</xdr:rowOff></xdr:from><xdr:ext cx="620000" cy="320000"/><xdr:pic><xdr:nvPicPr><xdr:cNvPr id="${i+1}" name="${esc(img.code)}"/><xdr:cNvPicPr/></xdr:nvPicPr><xdr:blipFill><a:blip r:embed="rId${i+1}"/><a:stretch><a:fillRect/></a:stretch></xdr:blipFill><xdr:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="620000" cy="320000"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:ln><a:noFill/></a:ln></xdr:spPr></xdr:pic><xdr:clientData/></xdr:oneCellAnchor>`;}).join('')}</xdr:wsDr>`;
  }
  function drawingRels(images){return `${XML_HEADER}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${images.map((img,i)=>`<Relationship Id="rId${i+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/${mediaName(img.code)}"/>`).join('')}</Relationships>`;}

  function createWorkbook(pkg,materials){
    if(!pkg||pkg.schema!=='plmr-guillotine-production-result-v1')throw new Error('GUILLOTINE_PRODUCTION_PACKAGE_REQUIRED');
    if(!root.PulumurProductionXlsxWriter||typeof root.PulumurProductionXlsxWriter.zip!=='function')throw new Error('XLSX_ZIP_WRITER_REQUIRED');
    const sheets=[summarySheet(pkg),cutsSheet(pkg),...(pkg.positions||[]).map(p=>positionSheet(pkg,p,materials))];
    const drawings=sheets.map((s,i)=>({sheetIndex:i+1,images:s.images||[]})).filter(x=>x.images.length);
    const contentTypes=[`${XML_HEADER}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>`,...sheets.map((_,i)=>`<Override PartName="/xl/worksheets/sheet${i+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`),...drawings.map((_,i)=>`<Override PartName="/xl/drawings/drawing${i+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/>`),'</Types>'].join('');
    const workbookSheets=sheets.map((s,i)=>`<sheet name="${esc(s.name)}" sheetId="${i+1}" r:id="rId${i+1}"/>`).join('');
    const names=sheets.map((s,i)=>{const area=s.printArea||'A1:A1';const [a,b]=area.split(':');return `<definedName name="_xlnm.Print_Area" localSheetId="${i}">'${s.name.replace(/'/g,"''")}'!$${a.replace(/(\D+)(\d+)/,'$1$$$2')}:$${b.replace(/(\D+)(\d+)/,'$1$$$2')}</definedName>`;}).join('');
    const workbook=`${XML_HEADER}<workbook xmlns="${NS}" xmlns:r="${REL_NS}"><bookViews><workbookView xWindow="0" yWindow="0" windowWidth="24000" windowHeight="15000"/></bookViews><sheets>${workbookSheets}</sheets><definedNames>${names}</definedNames><calcPr calcId="191029" fullCalcOnLoad="1"/></workbook>`;
    const rels=`${XML_HEADER}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets.map((_,i)=>`<Relationship Id="rId${i+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i+1}.xml"/>`).join('')}<Relationship Id="rId${sheets.length+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`;
    const rootRels=`${XML_HEADER}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`;
    const files={'[Content_Types].xml':contentTypes,'_rels/.rels':rootRels,'xl/workbook.xml':workbook,'xl/_rels/workbook.xml.rels':rels,'xl/styles.xml':stylesXml()};
    let drawingNo=0;const mediaDone=new Set();
    sheets.forEach((s,i)=>{
      const has=(s.images||[]).length>0;files[`xl/worksheets/sheet${i+1}.xml`]=worksheetXml(s,has);
      if(!has)return; drawingNo+=1;
      files[`xl/worksheets/_rels/sheet${i+1}.xml.rels`]=`${XML_HEADER}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing${drawingNo}.xml"/></Relationships>`;
      files[`xl/drawings/drawing${drawingNo}.xml`]=drawingXml(s.images);files[`xl/drawings/_rels/drawing${drawingNo}.xml.rels`]=drawingRels(s.images);
      s.images.forEach(img=>{const name=mediaName(img.code);if(mediaDone.has(name))return;const bytes=dataUriBytes(imageDataFor(img.code));if(bytes.length){files[`xl/media/${name}`]=bytes;mediaDone.add(name);}});
    });
    return root.PulumurProductionXlsxWriter.zip(files);
  }

  function textRuns(cell) {
    const range=cell.ownerDocument.createRange(),runs=[];
    for(const node of cell.childNodes){
      if(node.nodeType!==3)continue;
      let line;
      for(let i=0;i<node.length;i++){
        range.setStart(node,i);range.setEnd(node,i+1);
        const rect=range.getBoundingClientRect();
        if(!rect.width)continue;
        if(!line||Math.abs(line.y-rect.y)>.5){
          line={text:'',x:rect.x,y:rect.y,h:rect.height,right:rect.right};
          runs.push(line);
        }
        line.text+=node.data[i];line.right=rect.right;
      }
    }
    return runs;
  }
  const rgb=value=>value.match(/[\d.]+/g).map(Number);
  async function createPdf(pkg,materials,title){
    if(pkg?.schema!=='plmr-guillotine-production-result-v1')throw Error('GUILLOTINE_PRODUCTION_PACKAGE_REQUIRED');
    if(!pkg.positions?.length)throw Error('GUILLOTINE_PRODUCTION_POSITIONS_REQUIRED');
    const pdf=await root.PLMRPdf.create([210,297],{title});
    const frame=document.createElement('iframe');
    frame.style.cssText='position:fixed;left:-10000px;top:0;width:900px;height:1200px;border:0;visibility:hidden';
    const ready=new Promise(resolve=>{frame.onload=resolve});
    frame.srcdoc=buildPrintHtml(pkg,materials,{imagePrefix:'',title,baseHref:document.baseURI});
    document.body.append(frame);
    try{
      await ready;
      const view=frame.contentWindow,png=new Map();
      for(const [index,sheet] of [...frame.contentDocument.querySelectorAll('.production-a4-page')].entries()){
        if(index)pdf.addPage([210,297],'portrait');
        const origin=sheet.getBoundingClientRect(),scale=Math.min(210/origin.width,297/origin.height);
        const left=(210-origin.width*scale)/2,x=v=>left+(v-origin.x)*scale,y=v=>(v-origin.y)*scale;
        const cells=[...sheet.querySelectorAll('td,th')].map(cell=>({cell,r:cell.getBoundingClientRect(),style:view.getComputedStyle(cell)}));
        for(const {r,style} of cells){
          const color=rgb(style.backgroundColor);
          if(color[3]===0)continue;
          pdf.setFillColor(...color.slice(0,3));pdf.rect(x(r.x),y(r.y),r.width*scale,r.height*scale,'F');
        }
        pdf.setDrawColor(102);pdf.setLineWidth(.18);
        for(const {cell,r,style} of cells){
          pdf.rect(x(r.x),y(r.y),r.width*scale,r.height*scale,'S');
          pdf.setFont('PLMR',Number(style.fontWeight)>=600?'bold':'normal');
          pdf.setTextColor(...rgb(style.color).slice(0,3));
          const size=parseFloat(style.fontSize)*scale*72/25.4;
          for(const run of textRuns(cell)){
            pdf.setFontSize(size);
            pdf.setFontSize(size*Math.min(1,(run.right-run.x)*scale/pdf.getTextWidth(run.text)));
            pdf.text(run.text,x(run.x),y(run.y+run.h/2),{baseline:'middle'});
          }
          const img=cell.querySelector('img');
          if(!img?.naturalWidth)continue;
          if(!png.has(img.src)){
            const canvas=document.createElement('canvas');
            canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;
            canvas.getContext('2d').drawImage(img,0,0);
            png.set(img.src,canvas.toDataURL('image/png'));
          }
          const imageRect=img.getBoundingClientRect();
          pdf.addImage(png.get(img.src),'PNG',x(imageRect.x),y(imageRect.y),imageRect.width*scale,imageRect.height*scale);
        }
      }
      return new Blob([pdf.output('arraybuffer')],{type:'application/pdf'});
    }finally{frame.remove()}
  }

  function statusClass(status){return `production-cell-${String(status||STATUS.NORMAL).toLowerCase().replace(/_/g,'-')}`;}
  function statusCellClass(line,field){const s=field?fieldStatus(line,field):rowBaseStatus(line);return statusClass(s);}
  function sourceInfoRowsHtml(v){
    return `<table class="production-source-form production-source-info"><colgroup>${'<col/>'.repeat(9)}</colgroup><tbody>
      <tr class="source-title"><th colspan="9">GİYOTİN ÜRETİM FORMU (ISICAM 1+2)</th></tr>
      <tr class="source-header"><th>POZ NO</th><th colspan="2">ÜLKE</th><th colspan="2">MÜŞTERİ</th><th colspan="2">PROJE</th><th colspan="2">TARİH</th></tr>
      <tr class="source-value"><td>${htmlEsc(v.poz)}</td><td colspan="2">${htmlEsc(v.country)}</td><td colspan="2">${htmlEsc(v.customer)}</td><td colspan="2">${htmlEsc(v.project)}</td><td colspan="2">${htmlEsc(v.date)}</td></tr>
      <tr class="source-header"><th>PAKETLEME</th><th colspan="2">SİSTEM RENGİ</th><th colspan="2">GENİŞLİK</th><th colspan="2">YÜKSEKLİK</th><th colspan="2">ADET</th></tr>
      <tr class="source-value"><td>${htmlEsc(v.packaging)}</td><td colspan="2">${htmlEsc(v.color)}</td><td colspan="2">${htmlEsc(v.width)}</td><td colspan="2">${htmlEsc(v.height)}</td><td colspan="2">${htmlEsc(v.quantity)}</td></tr>
      <tr class="source-header"><th>CAM TÜRÜ</th><th colspan="2">CAM RENGİ</th><th colspan="2">BAKIŞ YÖNÜ</th><th colspan="2">MOTOR YÖNÜ</th><th colspan="2">MOTOR</th></tr>
      <tr class="source-value"><td>${htmlEsc(v.glassType)}</td><td colspan="2">${htmlEsc(v.glassColor)}</td><td colspan="2">${htmlEsc(v.view)}</td><td colspan="2">${htmlEsc(v.motorDirection)}</td><td colspan="2">${htmlEsc(v.motor)}</td></tr>
      <tr class="source-header"><th colspan="3">KUMANDA</th><th colspan="2">KUMANDA ADET</th><th colspan="4">AÇIKLAMA</th></tr>
      <tr class="source-value"><td colspan="3" style="white-space:pre-line">${htmlEsc(v.remote)}</td><td colspan="2">${htmlEsc(v.remoteQuantity)}</td><td colspan="4" class="source-note">${htmlEsc(v.description)}</td></tr>
    </tbody></table>`;
  }
  function positionPageHtml(pkg,position,materials,options){
    const m=positionFormModel(pkg,position,materials),v=sourceFormValues(pkg,position),opts=options||{},prefix=opts.imagePrefix==null?'../../':opts.imagePrefix,mat=materialIndex(materials);
    const profileRows=m.profiles.map(line=>{const material=mat.get(String(line.materialCode).toUpperCase())||{},img=imageSrc(material,prefix),base=statusCellClass(line);return `<tr><td class="${base}">${htmlEsc(line.materialCode)}</td><td colspan="2" class="${base}">${htmlEsc(line.profileName)}</td><td class="${base} source-image-cell">${img?`<img src="${htmlEsc(img)}" alt=""/>`:''}</td><td colspan="3" class="${statusCellClass(line,'description')}">${htmlEsc(lineNote(line))}</td><td class="${statusCellClass(line,'length')}">${line.effectiveLength==null?'':`${htmlEsc(roundMm(line.effectiveLength))} MM`}</td><td class="${statusCellClass(line,'quantity')}">${line.isNoteOnly?'':line.effectiveQuantity==null?'GİRİŞ GEREKLİ':htmlEsc(fmtQty(line.effectiveQuantity))}</td></tr>`;}).join('');
    const accessoryRows=m.accessories.map(line=>{const material=mat.get(String(line.materialCode).toUpperCase())||{},img=imageSrc(material,prefix),base=statusCellClass(line);return `<tr><td class="${base}">${htmlEsc(line.materialCode)}</td><td colspan="2" class="${base}">${htmlEsc(line.profileName)}</td><td class="${base} source-image-cell">${img?`<img src="${htmlEsc(img)}" alt=""/>`:''}</td><td colspan="3" class="${statusCellClass(line,'description')}">${htmlEsc(line.detail||lineNote(line))}</td><td class="${base}">${htmlEsc(line.unit||'')}</td><td class="${statusCellClass(line,'quantity')}">${line.isNoteOnly?'':line.effectiveQuantity==null?'GİRİŞ GEREKLİ':htmlEsc(fmtQty(line.effectiveQuantity))}</td></tr>`;}).join('');
    return `<article class="production-a4-page source-form-page" data-position-id="${htmlEsc(position.positionId)}">${sourceInfoRowsHtml(v)}<table class="production-source-form source-material-table"><colgroup>${'<col/>'.repeat(9)}</colgroup><tbody><tr class="source-section"><th colspan="9">PROFİL KESİM LİSTESİ</th></tr><tr class="source-header"><th>MALZEME KODU</th><th colspan="2">MALZEME İSİM</th><th>RESİM</th><th colspan="3">NOT</th><th>KESİM ÖLÇÜ</th><th>ADET</th></tr>${profileRows}<tr class="source-section"><th colspan="9">AKSESUAR LİSTESİ</th></tr><tr class="source-header"><th>MALZEME KODU</th><th colspan="2">MALZEME İSİM</th><th>RESİM</th><th colspan="3">NOT</th><th>BİRİM</th><th>MİKTAR</th></tr>${accessoryRows}</tbody></table></article>`;
  }
  function printCss(){return `@page{size:A4 portrait;margin:0}*{box-sizing:border-box}body{margin:0;background:#e8edf1;font-family:Arial,sans-serif;color:#000}.production-a4-page{width:210mm;min-height:297mm;margin:0 auto 8mm;padding:5mm;background:#fff;page-break-after:always}.production-a4-page:last-child{page-break-after:auto}.production-source-form{width:100%;border-collapse:collapse;table-layout:fixed}.production-source-form col{width:11.111%}.production-source-form th,.production-source-form td{border:.2mm solid #666;padding:.5mm 1mm;text-align:center;vertical-align:middle;font-size:6.8pt;font-weight:700;overflow:hidden}.source-title th{height:8mm;background:${SOURCE_ORANGE};color:#fff;font-size:13pt}.source-header th,.source-section th{background:${SOURCE_ORANGE};color:#fff;font-size:6.4pt}.production-source-info .source-header th{height:6mm}.production-source-info .source-value td{height:8mm}.source-note{text-align:left!important}.source-section th{height:7mm;font-size:9pt}.source-material-table .source-header th{height:6.5mm}.source-material-table td{height:7.4mm}.source-image-cell img{display:block;max-width:13mm;max-height:6mm;object-fit:contain;margin:auto}.production-cell-zero-result{background:${STATUS_COLORS.ZERO_RESULT}!important}.production-cell-manual-override{background:${STATUS_COLORS.MANUAL_OVERRIDE}!important}.production-cell-manual-required{background:${STATUS_COLORS.MANUAL_REQUIRED}!important}.production-cell-normal{background:#fff!important}.source-material-table tr{break-inside:avoid}@media print{body{background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}.production-a4-page{margin:0;box-shadow:none}}`;}
  function buildPrintHtml(pkg,materials,options){const opts=options||{},pages=(pkg.positions||[]).map(p=>positionPageHtml(pkg,p,materials,{imagePrefix:opts.imagePrefix==null?'../../':opts.imagePrefix})).join('');return `<!doctype html><html lang="tr"><head><meta charset="utf-8">${opts.baseHref?`<base href="${htmlEsc(opts.baseHref)}">`:''}<title>${htmlEsc(opts.title || "PLMR Giyotin Üretim Formu")}</title><style>${printCss()}</style></head><body>${pages}</body></html>`;}

  root.PulumurGuillotineProductionExportV1=Object.freeze({STATUS,STATUS_COLORS,SOURCE_ORANGE,statusClass,fieldStatus,roundMm,positionFormModel,positionPageHtml,printCss,buildPrintHtml,createWorkbook,createPdf});
  if(typeof module!=='undefined')module.exports=root.PulumurGuillotineProductionExportV1;
})(typeof window!=='undefined'?window:globalThis);
