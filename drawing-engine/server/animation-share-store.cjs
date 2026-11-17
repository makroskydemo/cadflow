/* Local development adapter. Only canonical presentation JSON is persisted, with expiry. */
const fs=require('fs/promises'),path=require('path'),os=require('os'),crypto=require('crypto'),C=require('../src/v22-animation-core'),P=require('../src/v15-core');
const MAX=C.MAX_BYTES,TTL=30*24*60*60;
function createStore(directory=path.join(os.tmpdir(),'plmr-animation-shares-v22')){
 const ready=fs.mkdir(directory,{recursive:true});
 const file=id=>{if(!/^[a-f0-9]{32}$/.test(id))throw Error('Sunum bağlantısı geçersiz.');return path.join(directory,id+'.json');};
 async function put(raw){await ready;const presentation=C.validate(raw,P),id=crypto.randomBytes(16).toString('hex'),expiresAt=new Date(Date.now()+TTL*1000).toISOString();await fs.writeFile(file(id),JSON.stringify({presentation,expiresAt}),{flag:'wx',mode:0o600});return{id,expiresAt};}
 async function get(id){await ready;let data;try{data=JSON.parse(await fs.readFile(file(id),'utf8'));}catch(e){if(e.code==='ENOENT')return null;throw e;}if(Date.parse(data.expiresAt)<=Date.now()){await fs.unlink(file(id)).catch(()=>{});return null;}return {presentation:C.validate(data.presentation,P),expiresAt:data.expiresAt};}
 async function sweep(){await ready;for(const name of await fs.readdir(directory)){if(!/^[a-f0-9]{32}\.json$/.test(name))continue;await get(name.slice(0,-5)).catch(()=>{});}}
 return {put,get,sweep};
}
function handler(store){
 const send=(res,status,data)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'});res.end(JSON.stringify(data));};
 return async(req,res)=>{
  const pathname=new URL(req.url,'http://localhost').pathname;if(!pathname.startsWith('/api/animation-shares'))return false;
  try{
   if(req.method==='POST'&&pathname==='/api/animation-shares'){
    const expected='http://'+req.headers.host;if(req.headers.origin!==expected)return send(res,403,{error:'Paylaşım isteğinin kaynağı doğrulanamadı.'}),true;
    if(!String(req.headers['content-type']||'').startsWith('application/json'))return send(res,415,{error:'Geçerli sunum verisi bekleniyor.'}),true;
    let bytes=0,parts=[];for await(const chunk of req){bytes+=chunk.length;if(bytes>MAX){send(res,413,{error:'Sunum verisi en fazla 2 MB olabilir.'});return true;}parts.push(chunk);}
    const result=await store.put(JSON.parse(Buffer.concat(parts).toString('utf8')));send(res,201,result);
   }else if(req.method==='GET'&&/^\/api\/animation-shares\/[a-f0-9]{32}$/.test(pathname)){
    const data=await store.get(pathname.split('/').at(-1));send(res,data?200:404,data||{error:'Sunum bulunamadı veya süresi doldu.'});
   }else send(res,404,{error:'Sunum bulunamadı.'});
  }catch(e){send(res,400,{error:e instanceof SyntaxError?'Sunum verisi okunamadı.':e.message});}
  return true;
 };
}
module.exports={createStore,handler,TTL};
