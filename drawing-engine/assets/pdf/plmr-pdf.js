/* Shared PDF tools. Export dependencies load only on demand. */
(function(root){
  const base=new URL('.',document.currentScript.src);
  const paperSizes=Object.freeze({A0:[1189,841],A1:[841,594],A2:[594,420],A3:[420,297],A4:[297,210]});
  const scripts=new Map();
  function load(name){
    if(!scripts.has(name))scripts.set(name,new Promise((resolve,reject)=>{
      const script=document.createElement('script');
      script.src=new URL(name,base).href;
      script.onload=resolve;
      script.onerror=()=>{scripts.delete(name);script.remove();reject(Error('PDF bileşeni yüklenemedi.'))};
      document.head.append(script);
    }));
    return scripts.get(name);
  }
  const fontNames=['DejaVuSans','DejaVuSans-Bold'];
  const fonts=()=>Promise.all(fontNames.map(name=>load(name+'.js')));
  async function create(format,{vector=false,text=true,title}={}){
    await load('jspdf-4.2.1.min.js');
    if(vector)await load('svg2pdf-2.9.0.min.js');
    const orientation=format[0]>format[1]?'landscape':'portrait';
    const doc=new root.jspdf.jsPDF({unit:'mm',format,orientation,compress:true,putOnlyUsedFonts:true});
    if(title)doc.setProperties({title});
    if(text){
      await fonts();
      fontNames.forEach((name,i)=>{
        doc.addFileToVFS(name+'.ttf',root.PLMRPdfFonts[name]);
        doc.addFont(name+'.ttf','PLMR',i?'bold':'normal');
      });
      doc.setFont('PLMR');
    }
    return doc;
  }
  function formatOf(paper='A3'){
    if(!Object.hasOwn(paperSizes,paper))throw Error('PDF sayfa boyutu geçersiz.');
    return paperSizes[paper];
  }
  function fit(format,width,height){
    const scale=Math.min((format[0]-12)/width,(format[1]-12)/height);
    const w=width*scale,h=height*scale;
    return [(format[0]-w)/2,(format[1]-h)/2,w,h];
  }
  const bytes=doc=>new Uint8Array(doc.output('arraybuffer'));
  function svgPage(markup){
    const svg=new DOMParser().parseFromString(markup,'image/svg+xml').documentElement;
    if(svg.localName!=='svg')throw Error('PDF sayfası oluşturulamadı.');
    const box=svg.getAttribute('viewBox')?.trim().split(/[ ,]+/).map(Number);
    const width=box?.[2]||parseFloat(svg.getAttribute('width'));
    const height=box?.[3]||parseFloat(svg.getAttribute('height'));
    if(!(width>0&&height>0))throw Error('PDF sayfa ölçüsü geçersiz.');
    if(!box)svg.setAttribute('viewBox','0 0 '+width+' '+height);
    svg.removeAttribute('width');svg.removeAttribute('height');
    svg.querySelectorAll('text,tspan').forEach(node=>{node.setAttribute('font-family','PLMR');node.style.fontFamily='PLMR'});
    return {svg,width,height};
  }
  async function drawing(markup,paper){
    const format=formatOf(paper),doc=await create(format,{vector:true});
    const {svg,width,height}=svgPage(markup),[x,y,w,h]=fit(format,width,height);
    await doc.svg(svg,{x,y,width:w,height:h,loadExternalStyleSheets:false});
    return bytes(doc);
  }
  async function documents(pages){
    if(!pages.length)throw Error('PDF sayfası bulunamadı.');
    const formats=pages.map(p=>[p.width*25.4/72,p.height*25.4/72]);
    const doc=await create(formats[0],{vector:true});
    for(const [i,page] of pages.entries()){
      const format=formats[i];
      if(i)doc.addPage(format,format[0]>format[1]?'landscape':'portrait');
      const {svg}=svgPage(page.svg);
      await doc.svg(svg,{x:0,y:0,width:format[0],height:format[1],loadExternalStyleSheets:false});
    }
    return bytes(doc);
  }
  async function views(viewer,cameras,paper){
    const format=formatOf(paper),doc=await create(format,{text:false});
    const [,,w,h]=fit(format,16,9),target=w*300/25.4;
    const scale=Math.min(1,(viewer.maxCaptureSize?.()||8192)/target,Math.sqrt(28000000/(target*target*9/16)));
    const width=Math.floor(target*scale),height=Math.floor(target*scale*h/w);
    for(const [i,camera] of cameras.entries()){
      if(i)doc.addPage(format,'landscape');
      doc.addImage(viewer.shot(camera,width,height),'JPEG',...fit(format,width,height));
    }
    return bytes(doc);
  }
  async function image(dataUrl,width,height,paper){
    const format=formatOf(paper),doc=await create(format,{text:false});
    doc.addImage(dataUrl,...fit(format,width,height));
    return bytes(doc);
  }
  root.PLMRPdf=Object.freeze({create,drawing,views,image,documents,fonts});
})(window);
