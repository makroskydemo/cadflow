/* Local user-test server. No production deployment, public bind or credential changes. */
const http=require('http'),fs=require('fs'),path=require('path');
const {createStore,handler}=require('./drawing-engine/server/animation-share-store.cjs');
const root=__dirname,store=createStore(process.env.CADFLOW_SHARE_DIR),shares=handler(store);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.ico':'image/x-icon','.webmanifest':'application/manifest+json','.mp4':'video/mp4','.webm':'video/webm'};
const server=http.createServer(async(req,res)=>{
 let url;try{url=new URL(req.url,'http://localhost')}catch{res.writeHead(400);return res.end('Invalid URL')}
 if(url.pathname.startsWith('/drawing-engine/api/animation-shares')){req.url=req.url.replace('/drawing-engine/api/animation-shares','/api/animation-shares');if(await shares(req,res))return}
 if(await shares(req,res))return;
 let name;try{name=decodeURIComponent(url.pathname)}catch{res.writeHead(400);return res.end('Invalid path')}
 if(name==='/')name='/index.html';
 if(name==='/plmr-public-config.json'){
  try{
   const {readPublicConfig}=await import('./scripts/public-config.mjs');
   const config=await readPublicConfig(root);
   res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});
   return res.end(JSON.stringify(config));
  }catch(error){res.writeHead(500);return res.end('Invalid CadFlow cloud configuration.')}
 }
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);return res.end('Method not allowed')}
 const parts=name.split('/').filter(Boolean);
 if(parts.some(p=>p.startsWith('.'))||parts.some(p=>['server','scripts','deployment'].includes(p))||name.includes('/native-v07/source/')||!(name==='/index.html'||name==='/manifest.webmanifest'||name==='/sw.js'||name==='/PLMR_CUSTOMER_SETUP_TEMPLATE.xlsx'||name.startsWith('/assets/')||name.startsWith('/drawing-engine/'))||/\.(cjs|mjs|sql|toml|md|txt)$/i.test(name)){res.writeHead(404);return res.end('Not found')}
 const file=path.resolve(root,'.'+name);
 if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403);return res.end('Forbidden')}
 fs.readFile(file,(error,data)=>{if(error){res.writeHead(404);return res.end('Not found')}res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.setHeader('Cache-Control','no-store');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Accept-Ranges','bytes');
  if(req.headers.range){
   const match=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
   let start=match?.[1]?Number(match[1]):0,end=match?.[2]?Number(match[2]):data.length-1;
   if(match&&!match[1]&&match[2]){start=Math.max(0,data.length-Number(match[2]));end=data.length-1}
   if(!match||(!match[1]&&!match[2])||start>end||start>=data.length){res.writeHead(416,{'Content-Range':'bytes */'+data.length});return res.end()}
   end=Math.min(end,data.length-1);res.statusCode=206;res.setHeader('Content-Range',`bytes ${start}-${end}/${data.length}`);res.setHeader('Content-Length',end-start+1);return res.end(req.method==='HEAD'?undefined:data.subarray(start,end+1));
  }
  res.setHeader('Content-Length',data.length);res.end(req.method==='HEAD'?undefined:data)})
});
server.listen(Number(process.env.CADFLOW_PORT)||42761,'127.0.0.1',()=>{
 const url='http://127.0.0.1:'+server.address().port+'/';console.log('MAKROSKY CadFlow: '+url);
 if(process.platform==='win32'&&process.env.PLMR_OPEN_BROWSER==='1')require('child_process').spawn('cmd',['/c','start','',url],{detached:true,stdio:'ignore'}).unref();
});
const cleanup=setInterval(()=>store.sweep().catch(e=>console.error('Share cleanup:',e.message)),60*60*1000);cleanup.unref();
