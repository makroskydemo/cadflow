(function(root,factory){
  if(typeof module==='object'&&module.exports) module.exports=factory();
  else root.PLMRSurmePdfExporter=factory();
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  const A0_LANDSCAPE_PT=Object.freeze({width:1189/25.4*72,height:841/25.4*72});
  const enc=typeof TextEncoder!=='undefined'?new TextEncoder():null;
  function ascii(s){
    const str=String(s==null?'':s);
    if(enc)return enc.encode(str);
    if(typeof Buffer!=='undefined')return Uint8Array.from(Buffer.from(str,'binary'));
    const out=new Uint8Array(str.length);for(let i=0;i<str.length;i++)out[i]=str.charCodeAt(i)&255;return out;
  }
  function concat(parts){let n=0;for(const p of parts)n+=p.length;const out=new Uint8Array(n);let o=0;for(const p of parts){out.set(p,o);o+=p.length;}return out;}
  function dataUrlBytes(url){const m=String(url||'').match(/^data:([^;,]+)?(?:;[^,]*)?;base64,(.*)$/);if(!m)throw new Error('PDF_IMAGE_DATA_URL_INVALID');const b64=m[2];if(typeof atob==='function'){const raw=atob(b64),out=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)out[i]=raw.charCodeAt(i);return out;}if(typeof Buffer!=='undefined')return Uint8Array.from(Buffer.from(b64,'base64'));throw new Error('PDF_BASE64_DECODER_MISSING');}
  function num(v){return Number(Number(v).toFixed(4)).toString();}
  function imagePdfFromJpeg(jpegBytes,imageWidth,imageHeight,options){
    const bytes=jpegBytes instanceof Uint8Array?jpegBytes:Uint8Array.from(jpegBytes||[]),iw=Math.max(1,Math.trunc(Number(imageWidth)||1)),ih=Math.max(1,Math.trunc(Number(imageHeight)||1));
    if(bytes.length<32)throw new Error('PDF_JPEG_EMPTY');
    const opts=options||{},pw=Number(opts.pageWidth)||A0_LANDSCAPE_PT.width,ph=Number(opts.pageHeight)||A0_LANDSCAPE_PT.height,margin=Math.max(0,Number(opts.margin==null?18:opts.margin));
    const scale=Math.min((pw-2*margin)/iw,(ph-2*margin)/ih),dw=iw*scale,dh=ih*scale,x=(pw-dw)/2,y=(ph-dh)/2;
    const content=ascii(`q\n${num(dw)} 0 0 ${num(dh)} ${num(x)} ${num(y)} cm\n/Im0 Do\nQ\n`);
    const objects=[
      ascii('<< /Type /Catalog /Pages 2 0 R >>'),
      ascii('<< /Type /Pages /Kids [3 0 R] /Count 1 >>'),
      ascii(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${num(pw)} ${num(ph)}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`),
      concat([ascii(`<< /Type /XObject /Subtype /Image /Width ${iw} /Height ${ih} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${bytes.length} >>\nstream\n`),bytes,ascii('\nendstream')]),
      concat([ascii(`<< /Length ${content.length} >>\nstream\n`),content,ascii('endstream')])
    ];
    const header=concat([ascii('%PDF-1.4\n%'),new Uint8Array([0xe2,0xe3,0xcf,0xd3]),ascii('\n')]),parts=[header],offsets=[0];let offset=header.length;
    objects.forEach((body,i)=>{offsets.push(offset);const obj=concat([ascii(`${i+1} 0 obj\n`),body,ascii('\nendobj\n')]);parts.push(obj);offset+=obj.length;});
    const xrefOffset=offset;let xref=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`;for(let i=1;i<offsets.length;i++)xref+=`${String(offsets[i]).padStart(10,'0')} 00000 n \n`;xref+=`trailer\n<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;parts.push(ascii(xref));return concat(parts);
  }
  function imageFromBlob(blob){return new Promise((resolve,reject)=>{const url=URL.createObjectURL(blob),img=new Image();img.onload=()=>{URL.revokeObjectURL(url);resolve(img);};img.onerror=e=>{URL.revokeObjectURL(url);reject(new Error('PDF_SVG_IMAGE_LOAD_FAILED'));};img.src=url;});}
  function svgViewBox(svg){
    const raw=String(svg||''),m=raw.match(/viewBox\s*=\s*["']\s*([-+0-9.eE]+)[ ,]+([-+0-9.eE]+)[ ,]+([-+0-9.eE]+)[ ,]+([-+0-9.eE]+)\s*["']/i);
    if(!m)return null;
    const x=Number(m[1]),y=Number(m[2]),width=Number(m[3]),height=Number(m[4]);
    return Number.isFinite(width)&&Number.isFinite(height)&&width>0&&height>0?{x,y,width,height}:null;
  }
  function svgWithIntrinsicSize(svg,box){
    const raw=String(svg||'');if(!box)return raw;
    return raw.replace(/<svg\b/i,`<svg width="${box.width}" height="${box.height}"`);
  }
  async function svgToJpeg(svg,options){
    if(typeof document==='undefined'||typeof Image==='undefined')throw new Error('PDF_BROWSER_CANVAS_REQUIRED');
    const opts=options||{},width=Math.max(800,Math.trunc(Number(opts.width)||4960)),height=Math.max(600,Math.trunc(Number(opts.height)||3508)),quality=Math.max(.75,Math.min(1,Number(opts.quality)||.98));
    const box=svgViewBox(svg),source=svgWithIntrinsicSize(svg,box),blob=new Blob([source],{type:'image/svg+xml;charset=utf-8'}),img=await imageFromBlob(blob),canvas=document.createElement('canvas');
    canvas.width=width;canvas.height=height;
    const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)throw new Error('PDF_CANVAS_CONTEXT_MISSING');
    ctx.fillStyle='#fff';ctx.fillRect(0,0,width,height);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
    const sourceW=box?box.width:Math.max(1,img.naturalWidth||img.width||width),sourceH=box?box.height:Math.max(1,img.naturalHeight||img.height||height),scale=Math.min(width/sourceW,height/sourceH),drawW=sourceW*scale,drawH=sourceH*scale,dx=(width-drawW)/2,dy=(height-drawH)/2;
    ctx.drawImage(img,dx,dy,drawW,drawH);
    const dataUrl=canvas.toDataURL('image/jpeg',quality);
    return {bytes:dataUrlBytes(dataUrl),width,height,dataUrl,drawRect:{x:dx,y:dy,width:drawW,height:drawH},sourceSize:{width:sourceW,height:sourceH},uniformScale:scale};
  }
  function pdfFromJpegDataUrl(dataUrl,width,height,options){return imagePdfFromJpeg(dataUrlBytes(dataUrl),width,height,options);}
  return Object.freeze({A0_LANDSCAPE_PT,dataUrlBytes,imagePdfFromJpeg,pdfFromJpegDataUrl,svgToJpeg,version:'SURME-A0-PROPORTIONAL-PDF-V15-4K'});
});
