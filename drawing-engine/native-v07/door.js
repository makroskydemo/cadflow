(function(host){'use strict';const window=Object.assign(Object.create(host),host.PLMRV24Libraries),globalThis=window;
Object.defineProperty(window,'crypto',{value:host.crypto});
window.PLMR_INTEGRATION_CONTEXT={kind:'bioclimatic-facade'};
window.PLMR_PRODUCT={
  "name": "plmr_JustKapı_v07",
  "id": "PLMR_JUST_KAPI",
  "label": "Kapı",
  "type": "door",
  "minWidth": 650,
  "minHeight": 1800,
  "fields": [
    {
      "key": "doorType",
      "label": "Kapı tipi",
      "options": [
        [
          "SINGLE",
          "Tek Kanat"
        ],
        [
          "TOP_FIXED",
          "Üst Sabit"
        ],
        [
          "LEFT_FIXED_RIGHT_MOVING",
          "Sol Sabit / Sağ Hareketli"
        ],
        [
          "LEFT_FIXED_TOP",
          "Sol ve Üst Sabit"
        ],
        [
          "RIGHT_FIXED_LEFT_MOVING",
          "Sağ Sabit / Sol Hareketli"
        ],
        [
          "RIGHT_FIXED_TOP",
          "Sağ ve Üst Sabit"
        ],
        [
          "BOTH_FIXED",
          "İki Yan Sabit / Tek Kanat"
        ],
        [
          "BOTH_FIXED_TOP",
          "İki Yan ve Üst Sabit"
        ],
        [
          "DOUBLE",
          "Çift Kanat"
        ],
        [
          "DOUBLE_TOP",
          "Çift / Üst Sabit"
        ],
        [
          "DOUBLE_LEFT_FIXED",
          "Çift / Sol Sabit"
        ],
        [
          "DOUBLE_LEFT_FIXED_TOP",
          "Çift / Sol ve Üst Sabit"
        ],
        [
          "DOUBLE_RIGHT_FIXED",
          "Çift / Sağ Sabit"
        ],
        [
          "DOUBLE_RIGHT_FIXED_TOP",
          "Çift / Sağ ve Üst Sabit"
        ],
        [
          "DOUBLE_BOTH_FIXED",
          "Çift / İki Yan Sabit"
        ],
        [
          "DOUBLE_BOTH_FIXED_TOP",
          "Çift / İki Yan ve Üst Sabit"
        ]
      ]
    },
    {
      "key": "hingeDirection",
      "label": "Menteşe yönü",
      "options": [
        [
          "LEFT",
          "Sol"
        ],
        [
          "RIGHT",
          "Sağ"
        ]
      ]
    },
    {
      "key": "activeLeaf",
      "label": "Aktif kanat",
      "options": [
        [
          "LEFT",
          "Sol"
        ],
        [
          "RIGHT",
          "Sağ"
        ]
      ]
    },
    {
      "key": "doorOpenDirection",
      "label": "Açılma yönü",
      "options": [
        [
          "INWARD",
          "İçe"
        ],
        [
          "OUTWARD",
          "Dışa"
        ]
      ]
    },
    {
      "key": "handleType",
      "label": "Kol tipi",
      "options": [
        [
          "NORMAL",
          "Normal Kol"
        ],
        [
          "PANIC",
          "Panik Bar"
        ]
      ]
    },
    {
      "key": "movingLeafWidth",
      "label": "Kanat genişliği (mm)",
      "kind": "number",
      "min": 0,
      "max": 1000000,
      "integer": false
    },
    {
      "key": "movingLeafHeight",
      "label": "Kanat yüksekliği (mm)",
      "kind": "number",
      "min": 1200,
      "max": 1000000
    },
    {
      "key": "glassThickness",
      "label": "Cam kalınlığı",
      "options": [
        [
          "8 MM",
          "8 MM"
        ],
        [
          "10 MM",
          "10 MM"
        ],
        [
          "12 MM",
          "12 MM"
        ],
        [
          "INSULATED GLASS",
          "Yalıtımlı Cam"
        ]
      ]
    },
    {
      "key": "glassColor",
      "label": "Cam rengi",
      "options": [
        [
          "TRANSPARENT",
          "Şeffaf"
        ],
        [
          "GREY",
          "Füme"
        ],
        [
          "BRONZE",
          "Bronz"
        ],
        [
          "LOW-E GLASS",
          "Low-E"
        ]
      ]
    },
    {
      "key": "divisionLayout",
      "label": "Özel bölmeler",
      "kind": "text",
      "internal": true
    }
  ],
  "defaults": {
    "type": "door",
    "width": 4000,
    "height": 3000,
    "color": "#147a91",
    "colorMode": "default",
    "finish": "MATTE",
    "open": false,
    "progress": 0,
    "doorType": "DOUBLE_BOTH_FIXED_TOP",
    "hingeDirection": "LEFT",
    "activeLeaf": "LEFT",
    "doorOpenDirection": "OUTWARD",
    "handleType": "PANIC",
    "movingLeafHeight": 2400,
    "glassThickness": "8 MM",
    "glassColor": "TRANSPARENT",
    "defaultView": "OUTSIDE VIEW",
    "movingLeafWidth": 950,
    "divisionLayout": ""
  },
  "reference": {
    "file": "Kapı dxf.dxf",
    "sha256": "8bc4356ca05ceaee48a0a077317b446ff3b18ac9e44c2aad52c1f3d189195b35",
    "prefix": "DO",
    "width": 4000,
    "height": 3000,
    "origin": [
      6231.790595010476,
      1343.440489849971
    ],
    "layerColors": {
      "DO- Cam": 5,
      "DO - Cam Çıtası": 5,
      "DO - Orta Kayıt": 5,
      "DO - Kasa": 5,
      "DO - Kanat": 5,
      "DO - Bilgilendirme": 7,
      "0": 7,
      "DO - Panik Bar": 5
    },
    "infoLayer": "DO - Bilgilendirme",
    "labelHeight": 60,
    "sourceTexts": [
      {
        "text": "///",
        "insert": [
          6768.43351685699,
          2637.814668681249,
          0.0
        ],
        "height": 250.0
      },
      {
        "text": "DO-01 - 1 Adet",
        "insert": [
          7281.790595010476,
          3693.075584224698,
          0.0
        ],
        "height": 60.0
      },
      {
        "text": "///",
        "insert": [
          9768.433516856989,
          2637.814668681249,
          0.0
        ],
        "height": 250.0
      },
      {
        "text": "///",
        "insert": [
          6768.43351685699,
          4016.23264549027,
          0.0
        ],
        "height": 250.0
      },
      {
        "text": "///",
        "insert": [
          9768.433516856989,
          4016.23264549027,
          0.0
        ],
        "height": 250.0
      },
      {
        "text": "///",
        "insert": [
          7755.93351685699,
          4016.23264549027,
          0.0
        ],
        "height": 250.0
      },
      {
        "text": "///",
        "insert": [
          8780.933516856989,
          4016.23264549027,
          0.0
        ],
        "height": 250.0
      },
      {
        "text": "INSIDE",
        "insert": [
          7997.304677371307,
          795.3147908867913,
          0.0
        ],
        "height": 100.0
      },
      {
        "text": "OUTSIDE",
        "insert": [
          7978.908923104805,
          -4.685209113208657,
          0.0
        ],
        "height": 100.0
      }
    ],
    "planHardware": [
      [
        [
          959.39692641,
          90.4773577
        ],
        [
          40.353950817,
          90.751120375
        ],
        [
          40.353950549,
          70.75112072
        ],
        [
          959.396926142,
          70.477358045
        ]
      ],
      [
        [
          979.396926581,
          28.420201152
        ],
        [
          959.396925986,
          28.420201078
        ],
        [
          959.396926296,
          90.777357886
        ],
        [
          979.396925951,
          90.777357619
        ]
      ],
      [
        [
          40.353950817,
          90.751120375
        ],
        [
          19.715934265,
          90.751119971
        ],
        [
          19.715933908,
          28.420201513
        ],
        [
          40.353950802,
          28.420200977
        ]
      ]
    ]
  },
  "defaultProfileColor": "#147a91",
  "settingsLayout": {
    "left": [
      "handleType",
      "doorType",
      "glassThickness",
      "glassColor",
      "movingLeafWidth",
      "movingLeafHeight"
    ],
    "right": [
      "defaultView",
      "hingeDirection",
      "activeLeaf",
      "doorOpenDirection"
    ]
  }
};

/* DXF-derived polygon model. This is the sole physical geometry definition for 2D and 3D. */
(function(root){'use strict';
const rect=(x,y,w,h)=>[[x,y],[x+w,y],[x+w,y+h],[x,y+h]],area=pts=>Math.abs(pts.reduce((s,p,i)=>{const q=pts[(i+1)%pts.length];return s+p[0]*q[1]-q[0]*p[1];},0))/2;
const clone=x=>JSON.parse(JSON.stringify(x)),ease=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
function start(q,d){return {width:q.width,height:q.height,parts:[],annotations:[],plan:[],owners:{},layerColors:{...d.reference.layerColors},infoLayer:d.reference.infoLayer,reference:d.reference,view:q.foldingView||q.defaultView||'INSIDE VIEW',metrics:{}};}
function part(m,id,layer,outline,options={}){const p={id,layer,outline,holes:[],kind:'profile',depth:55,z:-55,owner:'static',front:true,...options};if(!p.outline.every(v=>v.every(Number.isFinite))||area(p.outline)<1e-5)throw Error('Geçersiz profil: '+id);const a=area(p.outline)-p.holes.reduce((s,h)=>s+area(h),0);if(!(a>0))throw Error('Profil boşluğu geçersiz: '+id);p.area=a;m.parts.push(p);return p;}
function box(m,id,layer,x,y,w,h,options={}){if(!(w>0&&h>0))throw Error('Profil açıklığı geçersiz: '+id);return part(m,id,layer,rect(x,y,w,h),options);}
function ring(m,id,layer,x,y,w,h,face,options={}){if(w<=2*face||h<=2*face)throw Error('Çerçeve açıklığı yetersiz: '+id);return part(m,id,layer,rect(x,y,w,h),{holes:[rect(x+face,y+face,w-2*face,h-2*face)],...options});}
function annotation(m,role,x,y,height,options={}){m.annotations.push({role,x,y,height,align:'center',owner:'static',...options});}
function line(layer,p1,p2,options={}){return {type:'line',layer,x1:p1[0],y1:p1[1],x2:p2[0],y2:p2[1],...options};}
function glazing(q){const depth=q.glassThickness==='INSULATED GLASS'?20:parseFloat(q.glassThickness)||8;return {depth,leafDepth:depth+4};}
function beadCell(m,id,prefix,x,y,w,h,q,options={}){const g=glazing(q);if(w<=70||h<=70)throw Error('Cam açıklığı çok küçük.');box(m,id+' cam',prefix+'- Cam',x+5,y+5,w-10,h-10,{kind:'glass',depth:g.depth,z:-(55+g.depth)/2,...options});const layer=prefix+' - Cam Çıtası';for(const [suffix,a,b,c,e]of [['sol',x,y+30,30,h-60],['sağ',x+w-30,y+30,30,h-60],['üst',x,y+h-30,w,30],['alt',x,y,w,30]]){box(m,id+' çıta '+suffix,layer,a,b,c,e,{depth:12,z:-12,face:'front',...options});box(m,id+' iç çıta '+suffix,layer,a,b,c,e,{depth:12,z:-55,face:'back',...options,front:false});}}

function fixedMarkForCell(m,x,y,w,h){const bounds={minX:x+30,minY:y+30,maxX:x+w-30,maxY:y+h-30},margin=Math.min(24,Math.min(w-60,h-60)*.12),height=Math.min(250,(w-60-2*margin)/.84,(h-60-2*margin)/.9);annotation(m,'fixed-mark',x+w/2,y+h/2,height,{symbol:'fixed',fitBounds:bounds});}
function fixedMarkSegments(a){return [-1,0,1].map(i=>[[a.x+(i*.30-.12)*a.height,a.y-.45*a.height],[a.x+(i*.30+.12)*a.height,a.y+.45*a.height]]);}
function finish(m){for(const p of m.parts){if(!m.layerColors[p.layer])m.layerColors[p.layer]=p.kind==='glass'?5:7;}return m;}
root.PLMRReferenceGeometry={rect,area,clone,ease,start,part,box,ring,annotation,line,glazing,beadCell,fixedMarkForCell,fixedMarkSegments,finish};
})(typeof window!=='undefined'?window:globalThis);
(function(root){'use strict';const G=root.PLMRReferenceGeometry,clamp=x=>Math.max(0,Math.min(1,x));
G.pose=function(q,m,key,p){const a=m.owners[key];if(!a)return {x:0,z:0,angle:0,scaleY:1,y:0};p=clamp(p);if(a.kind==='fabric'){const s=Math.max(.000001,1-G.ease(p));return {x:0,z:0,y:a.top*(1-s),scaleY:s,angle:0,visible:p<1};}if(a.kind==='zip-bar')return {x:0,z:0,y:a.travel*G.ease(p),scaleY:1,angle:0};
if(a.kind==='door'){const t=G.ease(a.active?clamp(p*1.25):clamp((p-.2)/.8)),sign=a.hinge==='LEFT'?1:-1;return {x:a.anchor-m.width/2,z:a.z,y:0,scaleY:1,angle:sign*(a.openDirection==='INWARD'?1:-1)*a.maxAngle*t};}
const angle=a.sign*(a.openDirection==='INWARD'?1:-1)*Math.PI/2;if(a.kind==='sequential-fold'){const steps=Math.max(1,a.count*2-1),slide=a.stack===0?0:G.ease(p*steps-(2*a.stack-1)),turn=G.ease(p*steps-2*a.stack);return {x:a.anchor-m.width/2+a.sign*(a.stack*a.width*(1-slide)+a.stack*a.pitch*slide),z:a.z,y:0,scaleY:1,angle:angle*turn,slide,turn};}
const t=G.ease(p),projected=Math.cos(t*Math.PI/2),k=a.stack+(a.stack%2?1:0);return {x:a.anchor-m.width/2+a.sign*(k*a.width*projected+a.stack*a.pitch*(1-projected)),z:a.z,y:0,scaleY:1,angle:angle*a.parity*t};};
G.closedAnchor=function(a){if(a.kind==='accordion')return a.anchor+a.sign*(a.stack+(a.stack%2?1:0))*a.width;return a.closedAnchor??a.anchor??0;};
G.textWidth=function(text,height){if(typeof document!=='undefined'){const ctx=document.createElement('canvas').getContext('2d');ctx.font='700 64px Arial, Segoe UI, sans-serif';return (ctx.measureText(String(text)).width+16)*height/64;}return (String(text).length*.68+.25)*height;};const textWidth=G.textWidth;
G.annotationData=function(m,q){const pos=q.positionNo||'1',quantity=q.quantity||1,data=m.annotations.filter(a=>!(a.role==='view'&&q.type!=='door'&&Array.isArray(q.selectedOptions)&&!q.selectedOptions.includes(['balcony','folding'].includes(q.type)?'foldingView':'defaultView'))&&!(a.role==='motor'&&Array.isArray(q.selectedOptions)&&!q.selectedOptions.includes('motorDirection'))).map(a=>({...a,text:a.role==='position'?`${pos} - ${quantity} Adet`:a.role==='view'?(String(m.view).includes('INSIDE')?'İÇ BAKIŞ':'DIŞ BAKIŞ'):a.role==='motor'?'MOTOR':a.role==='fixed-mark'?'///':a.role==='movement'?(a.symbol==='turn'?(a.turn==='CCW'?'↺':'↻'):a.direction==='LEFT'?'←':'→'):a.text}));
// Reserve separate, product-local regions; keep source height when it fits.
for(const a of data.filter(a=>['position','view','motor'].includes(a.role))){let b=a.fitBounds;
 if(['door','fixed'].includes(q.type)){
  a.sourceHeight=a.height;
  // Keep V06's approved font/fit calculation; moving the anchor must not enlarge a label.
  if(a.role==='position'){const chars=String(a.text).length;let width,height=130,charFactor=1.05;
   if(q.type==='door'){const first=m.metrics.cells.find(c=>c.kind!=='F');width=first.w-160;}
   else{const mark=m.annotations.find(a=>a.role==='fixed-mark'),v=mark.fitBounds,top=mark.y+.45*mark.height,gap=v.maxY-top,pad=Math.min(12,gap*.2),maxY=v.maxY-pad,minY=Math.max(top+pad,maxY-150);width=v.maxX-v.minX;height=maxY-minY;if(width<120)charFactor=2.2;}
   a.height=Math.min(a.height,width/(chars*charFactor+.5),height/1.9);
  }
  a.y=m.height-a.height*.95;a.fitBounds={minX:0,maxX:m.width,minY:m.height-180,maxY:m.height};
  const width=textWidth(a.text,a.height);a.textBounds={minX:a.align==='left'?a.x:a.x-width/2,maxX:a.align==='left'?a.x+width:a.x+width/2,minY:a.y-a.height*.95,maxY:a.y+a.height*.95};
  if(q.type==='door'&&a.role==='position'){const view=data.find(t=>t.role==='view'),vw=textWidth('DIŞ BAKIŞ',view?.height||60);if(a.textBounds.maxX>m.width/2-vw/2-20){a.y=m.height-120;a.textBounds.minY=a.y-a.height*.95;a.textBounds.maxY=a.y+a.height*.95;}}
  continue;
 }

 if(!b&&q.type==='zip'){const i=a.role==='view'?1:a.role==='motor'?(q.motorDirection==='LEFT'?0:2):(q.motorDirection==='LEFT'?2:0),gap=Math.min(20,m.width/60);b={minX:i*m.width/3+gap,maxX:(i+1)*m.width/3-gap,minY:m.height-m.metrics.boxHeight+6,maxY:m.height-6};}
 if(!b&&['balcony','folding'].includes(q.type))b={minX:a.role==='position'?20:m.width*.51,maxX:a.role==='position'?m.width*.47:m.width-20,minY:m.height-124,maxY:m.height-6};
 if(!b&&q.type==='fixed'){const cw=m.metrics.cellWidth;b=a.role==='position'?{minX:80,maxX:50+cw-30,minY:80,maxY:50+m.metrics.clearHeights[0]-30}:{minX:20,maxX:m.width-20,minY:m.height+55,maxY:m.height+165};}
 if(!b)b={minX:20,maxX:m.width-20,minY:Math.max(0,a.y-65),maxY:Math.min(m.height,a.y+65)};
 const chars=Math.max(String(a.text).length,a.role==='view'?9:0),width=b.maxX-b.minX,height=b.maxY-b.minY;
 a.sourceHeight=a.height;a.height=Math.min(a.height,width/(chars*1.05+.5),height/1.9);a.fitBounds=b;a.align='center';a.x=(b.minX+b.maxX)/2;a.y=(b.minY+b.maxY)/2;
 a.textBounds={minX:a.x-(chars*1.05+.5)*a.height/2,maxX:a.x+(chars*1.05+.5)*a.height/2,minY:a.y-a.height*.95,maxY:a.y+a.height*.95};
}
return data;};
})(typeof window!=='undefined'?window:globalThis);

/* V06: one split tree drives glass, beads, physical mullions and the editor. */
(function(root){'use strict';const G=root.PLMRReferenceGeometry,clone=G.clone;
function read(q){if(!q.divisionLayout)return {};let v;try{v=JSON.parse(q.divisionLayout);}catch{throw Error('Bölme düzeni okunamadı.');}if(!v||v.version!==1||!v.regions||Array.isArray(v.regions)||typeof v.regions!=='object')throw Error('Bölme düzeni geçersiz.');return v.regions;}
function layout(tree,bounds,path='',depth=0){if(depth>16)throw Error('En fazla 16 kayıt seviyesi kullanılabilir.');const b={...bounds,path,node:tree};if(tree===null)return {cells:[b],bars:[]};if(!tree||!['H','V'].includes(tree.axis)||!Number.isFinite(tree.ratio)||tree.ratio<=0||tree.ratio>=1||!('a'in tree)||!('b'in tree))throw Error('Orta kayıt tanımı geçersiz.');const v=tree.axis==='V',span=v?b.w:b.h,cut=(span-50)*tree.ratio;if(cut<=70||span-50-cut<=70)throw Error('Her cam açıklığı 70 mm’den büyük olmalı.');const first={x:b.x,y:b.y,w:v?cut:b.w,h:v?b.h:cut},second={x:b.x+(v?cut+50:0),y:b.y+(v?0:cut+50),w:v?span-50-cut:b.w,h:v?b.h:span-50-cut},bar={...b,axis:tree.axis,x:b.x+(v?cut:0),y:b.y+(v?0:cut),w:v?50:b.w,h:v?b.h:50,parentBounds:bounds};const a=layout(tree.a,first,path+'a',depth+1),c=layout(tree.b,second,path+'b',depth+1);return {cells:[...a.cells,...c.cells],bars:[bar,...a.bars,...c.bars]};}
function grid(width,heights,cols){function columns(n,w){if(n===1)return null;const net=(width-(cols-1)*50)/cols;return {axis:'V',ratio:net/(w-50),a:null,b:columns(n-1,w-net-50)};}function rows(hs,h){if(hs.length===1)return columns(cols,width);return {axis:'H',ratio:hs[0]/(h-50),a:columns(cols,width),b:rows(hs.slice(1),h-hs[0]-50)};}return rows(heights,heights.reduce((a,b)=>a+b,0)+(heights.length-1)*50);}
function cell(m,id,prefix,x,y,w,h,q,options={},fixed=false,initial=null){const regions=read(q),key=q.type==='door'?q.doorType+':'+id:id,tree=Object.hasOwn(regions,key)?regions[key]:initial,result=layout(tree,{x,y,w,h});m.editRegions??=[];m.editRegions.push({key,label:id,x,y,w,h,tree:clone(tree),fixed,owner:options.owner||'static'});for(const b of result.bars)G.box(m,id+' kayıt '+(b.path||'root'),prefix+' - Orta Kayıt',b.x,b.y,b.w,b.h,options);for(const [i,b]of result.cells.entries()){G.beadCell(m,id+(tree?' bölme '+(i+1):''),prefix,b.x,b.y,b.w,b.h,q,options);if(fixed)G.fixedMarkForCell(m,b.x,b.y,b.w,b.h);}return result;}
function replace(tree,path,value){if(!path)return clone(value);const out=clone(tree);let n=out;for(const k of path.slice(0,-1))n=n[k];n[path.at(-1)]=clone(value);return out;}
function merged(node){if(node.a===null)return clone(node.b);if(node.b===null)return clone(node.a);if(JSON.stringify(node.a)===JSON.stringify(node.b))return clone(node.a);throw Error('Bu kaydı silmeden önce ona bağlı farklı alt kayıtları silin.');}
function nodeAt(tree,path){let n=tree;for(const k of path)n=n[k];return n;}
function boundsAt(tree,bounds,path){const rows=layout(tree,bounds);const cell=rows.cells.find(c=>c.path===path);return cell||rows.bars.find(b=>b.path===path)?.parentBounds;}
function equalChain(nodes,axis,span){if(nodes.length===1)return clone(nodes[0]);const net=(span-50*(nodes.length-1))/nodes.length;if(net<=70)throw Error('Her cam açıklığı 70 mm’den büyük olmalı.');return {axis,ratio:net/(span-50),a:clone(nodes[0]),b:equalChain(nodes.slice(1),axis,span-net-50)};}
function addEqual(tree,bounds,path,axis){if(!['H','V'].includes(axis)||nodeAt(tree,path)!==null)throw Error('Cam bölmesi seçin.');let start=path;while(start&&nodeAt(tree,start.slice(0,-1))?.axis===axis)start=start.slice(0,-1);const original=nodeAt(tree,start),b=boundsAt(tree,bounds,start),nodes=[];function collect(n){if(n&&n.axis===axis){collect(n.a);collect(n.b);}else nodes.push(n);}collect(original);nodes.push(null);const next=replace(tree,start,equalChain(nodes,axis,axis==='V'?b.w:b.h));layout(next,bounds);return next;}
function resizeAnchor(tree,path,axis){for(let i=path.length-1;i>=0;i--){const p=path.slice(0,i),n=nodeAt(tree,p);if(n?.axis===axis)return{path:p,node:n,side:path[i]};}return null;}
function resizeCell(tree,bounds,path,axis,value){const rows=layout(tree,bounds),cell=rows.cells.find(c=>c.path===path),a=resizeAnchor(tree,path,axis);if(!cell||!a)throw Error('Bu toplam ölçü sabittir; önce ilgili yönde kayıt ekleyin.');if(!Number.isFinite(value)||value<=70)throw Error('Net cam açıklığı 70 mm’den büyük olmalı.');const b=boundsAt(tree,bounds,a.path),span=axis==='V'?b.w:b.h,current=axis==='V'?cell.w:cell.h,delta=value-current,cut=(span-50)*a.node.ratio+(a.side==='a'?delta:-delta),next=replace(tree,a.path,{...a.node,ratio:cut/(span-50)});layout(next,bounds);return next;}
root.PLMRPartitions={read,layout,grid,cell,replace,merged,nodeAt,boundsAt,addEqual,resizeCell,resizeAnchor};
})(typeof window!=='undefined'?window:globalThis);

/* DO model axes: outside elevation left->right is +X; inside is -Z. */
(function(root){'use strict';const G=root.PLMRReferenceGeometry;
const plans={BOTH_FIXED:['F','M','F'],DOUBLE_RIGHT_FIXED:['L','R','F'],DOUBLE_BOTH_FIXED:['F','L','R','F'],SINGLE:['M'],TOP_FIXED:['M'],DOUBLE:['L','R'],DOUBLE_TOP:['L','R'],LEFT_FIXED_RIGHT_MOVING:['F','M'],LEFT_FIXED_TOP:['F','M'],RIGHT_FIXED_LEFT_MOVING:['M','F'],RIGHT_FIXED_TOP:['M','F'],BOTH_FIXED_TOP:['F','M','F'],DOUBLE_LEFT_FIXED:['F','L','R'],DOUBLE_LEFT_FIXED_TOP:['F','L','R'],DOUBLE_RIGHT_FIXED_TOP:['L','R','F'],DOUBLE_BOTH_FIXED_TOP:['F','L','R','F']};
G.doorPlan=type=>plans[type]||plans.SINGLE;
G.doorWidths=function(q){const kinds=G.doorPlan(q.doorType),fixed=kinds.filter(k=>k==='F').length,moving=kinds.length-fixed,borders=kinds.slice(1).map((k,i)=>k==='F'||kinds[i]==='F'?50:0),available=q.width-100-borders.reduce((a,b)=>a+b,0),leaf=fixed?(q.movingLeafWidth||q.width/kinds.length):available/moving,side=fixed?(available-moving*leaf)/fixed:0;if(leaf<=170||fixed&&side<=70)throw Error('Kanat genişliği ve yan sabit açıklıkları toplam genişliğe sığmıyor.');return {kinds,borders,leaf,side,automatic:950,fixed,moving};};
G.build=function(q,d=root.PLMR_PRODUCT){const m=G.start(q,d),W=q.width,H=q.height,P='DO',spec=G.doorWidths(q),{kinds,borders}=spec,hasTop=q.doorType.includes('TOP'),leafH=hasTop?Math.min(q.movingLeafHeight,H-250):H-50,transomY=leafH,topY=leafH+50,topH=H-50-topY;m.view='OUTSIDE VIEW';if(leafH<1200||hasTop&&topH<100)throw Error('Kapı kanadı ve üst sabit yüksekliği uyumsuz.');const cells=[];let x=50;
G.box(m,'sol kasa',P+' - Kasa',0,0,50,H);G.box(m,'sağ kasa',P+' - Kasa',W-50,0,50,H);G.box(m,'üst kasa',P+' - Kasa',50,H-50,W-100,50);
for(let i=0;i<kinds.length;i++){const kind=kinds[i],w=kind==='F'?spec.side:spec.leaf,hinge=kind==='L'?'LEFT':kind==='R'?'RIGHT':q.hingeDirection,owner=kind==='F'?'static':'door-'+i,active=kind==='M'||(kind==='L'?q.activeLeaf==='LEFT':kind==='R'?q.activeLeaf==='RIGHT':false),cell={x,w,kind,hinge,owner,active};cells.push(cell);
 if(kind==='F'){G.box(m,'sabit alt kasa '+i,P+' - Kasa',x,0,w,50);root.PLMRPartitions.cell(m,'yan sabit '+i,P,x,50,w,leafH-50,q,{},true);}else{
  m.owners[owner]={kind:'door',hinge,anchor:hinge==='LEFT'?x:x+w,active,width:w,z:-27.5,openDirection:q.doorOpenDirection,maxAngle:Math.PI/4};G.ring(m,'kanat '+i,P+' - Kanat',x,0,w,leafH,50,{owner});root.PLMRPartitions.cell(m,'kanat '+i,P,x+50,50,w-100,leafH-100,q,{owner});
  const handleY=Math.min(922.5,leafH/2),lockX=hinge==='LEFT'?x+w-80:x+80,hingeX=hinge==='LEFT'?x+50:x+w-50;G.annotation(m,'swing-line',0,0,0,{owner,points:[[hingeX,leafH-50],[lockX,handleY],[hingeX,50]]});
  G.annotation(m,'movement',x+w/2,leafH*.45,Math.min(250,(w-160)*.6),{owner,symbol:'turn',turn:(hinge==='LEFT')===(q.doorOpenDirection==='INWARD')?'CCW':'CW',threeDOnly:true});
  for(const [j,hy]of [[0,50],[1,(leafH-130)/2],[2,leafH-180]])G.box(m,'menteşe '+i+'-'+j,P+' - Menteşe',hinge==='LEFT'?x:x+w-10,hy,10,130,{depth:20,z:-37.5,owner,kind:'hardware'});
  if(active){if(q.handleType==='PANIC'){const scale=w/1000,by=handleY-23.148993;for(const [key,xx,yy,ww,hh,depth,z]of [['sol bağlantı',13,handleY-87.757736,34.103579,175.515472,24,-73],['sağ bağlantı',962.896421,handleY-87.757736,34.103579,175.515472,24,-73],['bar',47.103579,by,915.792842,46.297986,26,-99]])G.box(m,'panik '+i+' '+key,P+' - Panik Bar',x+xx*scale,yy,ww*scale,hh,{owner,depth,z,kind:'hardware'});}else{const lock=hinge==='LEFT'?x+w-72:x+72;G.box(m,'normal kol rozet '+i,P+' - Kol',lock-16,handleY-70,32,140,{owner,depth:24,z:4,kind:'hardware'});G.box(m,'normal kol '+i,P+' - Kol',hinge==='LEFT'?lock-124:lock-8,handleY-11,132,22,{owner,depth:24,z:20,kind:'hardware'});G.box(m,'normal iç kol rozet '+i,P+' - Kol',lock-16,handleY-70,32,140,{owner,depth:24,z:-83,kind:'hardware',front:false});G.box(m,'normal iç kol '+i,P+' - Kol',hinge==='LEFT'?lock-124:lock-8,handleY-11,132,22,{owner,depth:24,z:-99,kind:'hardware',front:false});}}
 }
 x+=w;if(i<kinds.length-1){if(borders[i])G.box(m,'dikey kayıt '+i,P+' - Orta Kayıt',x,0,50,leafH);x+=borders[i];}
}
if(hasTop){G.box(m,'üst sabit yatay kayıt',P+' - Orta Kayıt',50,transomY,W-100,50);const cuts=[];for(let i=1;i<cells.length;i++){const a=cells[i-1],b=cells[i];cuts.push(a.kind==='F'||b.kind==='F'?[b.x-50,b.x]:[b.x-25,b.x+25]);}let tx=50;const regions=[];for(const [i,[l,r]]of cuts.entries()){regions.push([tx,l]);G.box(m,'üst sabit dikey kayıt '+i,P+' - Orta Kayıt',l,topY,r-l,topH);tx=r;}regions.push([tx,W-50]);regions.forEach(([l,r],i)=>{root.PLMRPartitions.cell(m,'üst sabit '+i,P,l,topY,r-l,topH,q,{},true);});}
G.annotation(m,'position',20,H-25,60,{align:'left'});G.annotation(m,'view',W/2,H-25,60);
// Plan Y increases towards the inside, matching physical -Z. Move the entire
// cut below the elevation dimension; derive its frame from all cut content.
const center=0,opening=q.doorOpenDirection==='INWARD'?1:-1;
for(const c of cells){if(c.kind==='F'){m.plan.push({type:'polyline',layer:P+' - Kasa',closed:true,points:G.rect(c.x-40,center-25,c.w+80,50),role:'plan-fixed'});}else{
 const angle=(c.active?20:15)*Math.PI/180,hingeLeft=c.hinge==='LEFT',sign=hingeLeft?1:-1,ax=c.x+(hingeLeft?0:c.w),length=c.w-20,ux=sign*Math.cos(angle),uy=opening*Math.sin(angle),px=-uy*25,py=ux*25,st=[ax+sign*10,center],end=[st[0]+ux*length,st[1]+uy*length];m.plan.push({type:'polyline',layer:P+' - Kanat',closed:true,points:[[st[0]-px,st[1]-py],[end[0]-px,end[1]-py],[end[0]+px,end[1]+py],[st[0]+px,st[1]+py]],role:'plan-leaf',activeLeaf:c.active,hinge:c.hinge});
 const closedAngle=hingeLeft?0:180,openAngle=closedAngle+(hingeLeft?1:-1)*opening*45,startAngle=Math.min(closedAngle,openAngle),endAngle=Math.max(closedAngle,openAngle),radius=length;const endpoints=[startAngle,endAngle].map(a=>[ax+radius*Math.cos(a*Math.PI/180),center+radius*Math.sin(a*Math.PI/180)]);m.plan.push({type:'arc',layer:m.infoLayer,x:ax,y:center,radius,startAngle,endAngle,linetype:'PLMR_DASHED',role:'plan-swing',points:endpoints});
 if(c.active&&q.handleType==='PANIC'){const ca=Math.cos(angle),sa=Math.sin(angle);for(const points of d.reference.planHardware||[]){const mapped=points.map(([u,v])=>[ax+sign*(u*c.w/1000*ca-opening*v*sa),center+opening*u*c.w/1000*sa+v*ca]);m.plan.push({type:'polyline',layer:P+' - Panik Bar',closed:true,points:mapped,role:'plan-hardware'});}}
 if(c.active&&spec.moving>1){const tx=(st[0]+end[0])/2,ty=(st[1]+end[1])/2-200,height=Math.min(50,c.w/24);m.plan.push({type:'text',layer:m.infoLayer,x:tx,y:ty,value:'ÖNCE BU KANAT AÇILIR',height,align:'center',role:'plan-active'});m.plan.push(G.line(m.infoLayer,[tx,ty+height*1.4],[(st[0]+end[0])/2,(st[1]+end[1])/2],{role:'plan-leader'}));}
}}
const points=m.plan.flatMap(e=>e.points||e.type==='line'&&[[e.x1,e.y1],[e.x2,e.y2]]||[[e.x-e.value.length*e.height*.5,e.y-e.height],[e.x+e.value.length*e.height*.5,e.y+e.height]]),xs=points.map(p=>p[0]),ys=points.map(p=>p[1]),sideH=Math.min(100,W/12),minX=Math.min(0,...xs)-80,maxX=Math.max(W,...xs)+80,rawTop=Math.max(...ys),rawBottom=Math.min(...ys),top=-(spec.fixed?700:480),bottom=top-(rawTop-rawBottom)-2*(sideH*1.6+60),shift=top-sideH*1.6-60-rawTop;
for(const e of m.plan){if(e.points)e.points=e.points.map(([x,y])=>[x,y+shift]);if(e.y!==undefined)e.y+=shift;if(e.y1!==undefined){e.y1+=shift;e.y2+=shift;}}
m.plan.unshift({type:'polyline',layer:m.infoLayer,closed:true,points:G.rect(minX,bottom,maxX-minX,top-bottom),role:'plan-frame'});
m.plan.push({type:'text',layer:m.infoLayer,x:W/2,y:top-sideH*.8-25,value:'INSIDE',height:sideH,align:'center',role:'plan-side'},{type:'text',layer:m.infoLayer,x:W/2,y:bottom+sideH*.8+25,value:'OUTSIDE',height:sideH,align:'center',role:'plan-side'});
m.metrics={cells,leafWidth:spec.leaf,automaticLeafWidth:spec.automatic,leafHeight:leafH,topFixed:hasTop,topClearHeight:hasTop?topH:0,frameFace:50,leafFace:50,beadFace:30,glassSetback:5,frameDepth:55,planBottom:bottom,planTop:top,planBounds:{minX,maxX,minY:bottom,maxY:top}};return G.finish(m);};
})(typeof window!=='undefined'?window:globalThis);

/* This product has no zip fabric dependencies. */

window.PLMRZipFabricMeta={};

/* V03 dimensions are outside-to-outside product dimensions from the reference DXF. */
(function(root){'use strict';const clone=x=>JSON.parse(JSON.stringify(x));
function validate(raw,d=root.PLMR_PRODUCT){if(!raw||typeof raw!=='object'||Array.isArray(raw))throw Error('Ürün verisi geçersiz.');const q={...clone(d.defaults),...clone(raw)};if(q.type!==d.type)throw Error('Bu dosya farklı ürüne ait.');for(const key of ['width','height'])if(typeof q[key]!=='number'||!Number.isFinite(q[key])||q[key]<(key==='width'?d.minWidth:d.minHeight)||q[key]>1000000)throw Error(key==='width'?'Genişlik geçersiz.':'Yükseklik geçersiz.');if(!/^#[0-9a-f]{6}$/i.test(q.color)||!['default','ral'].includes(q.colorMode)||!['MATTE','GLOSS','TEXTURE','WOOD_TRANSFER'].includes(q.finish))throw Error('Profil malzemesi geçersiz.');if(typeof q.open!=='boolean'||!Number.isFinite(q.progress)||q.progress<0||q.progress>1)throw Error('Hareket durumu geçersiz.');for(const f of d.fields){const v=q[f.key];if(f.options&&!f.options.some(o=>o[0]===v))throw Error(f.label+' geçersiz.');if(f.kind==='number'&&((!Number.isFinite(v)||(f.integer!==false&&!Number.isInteger(v)))||v<f.min||v>f.max))throw Error(f.label+' geçersiz.');if(f.kind==='text'&&typeof v!=='string')throw Error(f.label+' geçersiz.');}if(['balcony','folding'].includes(q.type)){if(q.panels>8)q.openingDirection='BOTH';if(q.series==='K SERIES'){q.subtype='STANDARD';q.glassThickness='INSULATED GLASS';}}q.defaultView='OUTSIDE VIEW';root.PLMRReferenceGeometry.build(q,d);return q;}
root.PLMRModel={clone,validate};
})(typeof window!=='undefined'?window:globalThis);

/* Giyotin V53 createArrowGeometry and material/edge specification; curve uses the same section. */
(function(root){'use strict';const THREE=root.THREE;
function createArrowGeometry(length,shaftWidth,headWidth,headLength,direction,vertical){
 const half=length/2,shaftHalf=shaftWidth/2,headHalf=headWidth/2,bodyEnd=half-headLength,shape=new THREE.Shape();
 shape.moveTo(-half,-shaftHalf);shape.lineTo(bodyEnd,-shaftHalf);shape.lineTo(bodyEnd,-headHalf);shape.lineTo(half,0);shape.lineTo(bodyEnd,headHalf);shape.lineTo(bodyEnd,shaftHalf);shape.lineTo(-half,shaftHalf);shape.closePath();
 const geo=new THREE.ExtrudeGeometry(shape,{depth:4,bevelEnabled:false,steps:1});geo.translate(0,0,-2);if(direction<0)geo.rotateZ(Math.PI);if(vertical)geo.rotateZ(Math.PI/2);return geo;
}
function styled(geometry){const mesh=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color:0xf97316,roughness:.42,metalness:.04,side:THREE.DoubleSide}));mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geometry),new THREE.LineBasicMaterial({color:0x111827,transparent:true,opacity:.86})));mesh.userData={movementIndicator:true,arrowStyle:'GIYOTIN_V53',section:{depth:4,shaftWidth:12,headWidth:40},annotation:true};return mesh;}
function create(a){if(a.symbol==='arrow')return styled(createArrowGeometry(a.height,12,40,Math.min(a.height*.27,52),a.direction==='LEFT'?-1:1,false));const h=a.height,R=h*.34,r=R-12,pts=[],sign=a.turn==='CCW'?1:-1;for(let i=0;i<=64;i++){const t=(-.25+i/64*1.62)*Math.PI;pts.push([sign*Math.cos(t)*R,Math.sin(t)*R]);}for(let i=64;i>=0;i--){const t=(-.25+i/64*1.62)*Math.PI;pts.push([sign*Math.cos(t)*r,Math.sin(t)*r]);}const group=new THREE.Group(),shape=new THREE.Shape(pts.map(p=>new THREE.Vector2(...p))),body=new THREE.ExtrudeGeometry(shape,{depth:4,bevelEnabled:false,steps:1});body.translate(0,0,-2);group.add(styled(body));const t=1.37*Math.PI,ex=sign*Math.cos(t)*(R-6),ey=Math.sin(t)*(R-6),tx=sign*-Math.sin(t),ty=Math.cos(t),head=new THREE.Shape();head.moveTo(ex+tx*24,ey+ty*24);head.lineTo(ex-tx*24-ty*20,ey-ty*24+tx*20);head.lineTo(ex-tx*24+ty*20,ey-ty*24-tx*20);head.closePath();const geo=new THREE.ExtrudeGeometry(head,{depth:4,bevelEnabled:false,steps:1});geo.translate(0,0,-2);group.add(styled(geo));group.userData={movementIndicator:true,arrowStyle:'GIYOTIN_V53',annotation:true};return group;}
root.PLMRDirectionArrows={create,createArrowGeometry};
})(window);

/* New DXF-height annotation renderer: crisp meshes/vectors, no V02 face-label geometry. */
(function(root){'use strict';
function canvasText(text,height,align,role){const THREE=root.THREE,font=64,canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');ctx.font=`700 ${font}px Arial, Segoe UI, sans-serif`;const lines=String(text).split('\n'),width=Math.max(...lines.map(x=>ctx.measureText(x).width),32),pad=role==='dimension'?14:8;canvas.width=Math.ceil(width+pad*2)*2;canvas.height=(font*1.45*lines.length+pad*2)*2;ctx.scale(2,2);ctx.font=`700 ${font}px Arial, Segoe UI, sans-serif`;ctx.textBaseline='middle';ctx.textAlign='left';
if(['position','view','motor','dimension'].includes(role)){ctx.fillStyle='rgba(15,23,42,.86)';ctx.beginPath();const w=canvas.width/2,h=canvas.height/2,r=7;ctx.moveTo(r,0);ctx.lineTo(w-r,0);ctx.quadraticCurveTo(w,0,w,r);ctx.lineTo(w,h-r);ctx.quadraticCurveTo(w,h,w-r,h);ctx.lineTo(r,h);ctx.quadraticCurveTo(0,h,0,h-r);ctx.lineTo(0,r);ctx.quadraticCurveTo(0,0,r,0);ctx.fill();ctx.strokeStyle=role==='dimension'?'#ef4444':'rgba(248,250,252,.8)';ctx.lineWidth=1;ctx.stroke();}ctx.fillStyle=role==='dimension'?'#ef4444':'#f8fafc';lines.forEach((s,i)=>ctx.fillText(s,pad,pad+font*.72+i*font*1.45));const texture=new THREE.CanvasTexture(canvas);texture.minFilter=THREE.LinearFilter;texture.magFilter=THREE.LinearFilter;texture.generateMipmaps=false;const scale=height/font,w=canvas.width/2*scale,h=canvas.height/2*scale,geometry=new THREE.PlaneGeometry(w,h);const material=new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,depthTest:false,toneMapped:false,side:THREE.FrontSide});const mesh=new THREE.Mesh(geometry,material);mesh.userData.textSize={height,width:w,plateHeight:h};mesh.userData.alignOffset=align==='left'?w/2:align==='right'?-w/2:0;return mesh;}
function vectorSymbol(a){const THREE=root.THREE,group=new THREE.Group(),color=0xf59e0b,mat=()=>new THREE.MeshBasicMaterial({color,toneMapped:false,depthTest:false,depthWrite:false,side:THREE.FrontSide});function polygon(pts){const s=new THREE.Shape();s.moveTo(...pts[0]);for(const p of pts.slice(1))s.lineTo(...p);s.closePath();group.add(new THREE.Mesh(new THREE.ShapeGeometry(s),mat()));}const h=a.height;
if(a.symbol==='fixed'){for(let i=-1;i<=1;i++){const x=i*h*.30;polygon([[x-h*.12,-h*.46],[x-h*.025,-h*.46],[x+h*.22,h*.46],[x+h*.125,h*.46]]);}}
else if(a.symbol==='arrow'){const sign=a.direction==='LEFT'?-1:1;polygon([[-.43,-.065],[.05,-.065],[.05,-.20],[.40,0],[.05,.20],[.05,.065],[-.43,.065]].map(([x,y])=>[x*h*sign,y*h]));}
else{const points=[],sign=a.turn==='CCW'?1:-1,R=h*.33,r=h*.22;for(let i=0;i<=48;i++){const t=(-.25+i/48*1.62)*Math.PI;points.push([sign*Math.cos(t)*R,Math.sin(t)*R]);}for(let i=48;i>=0;i--){const t=(-.25+i/48*1.62)*Math.PI;points.push([sign*Math.cos(t)*r,Math.sin(t)*r]);}polygon(points);const a0=1.37*Math.PI,ex=sign*Math.cos(a0)*h*.275,ey=Math.sin(a0)*h*.275,tx=sign*-Math.sin(a0),ty=Math.cos(a0);polygon([[ex+tx*h*.16,ey+ty*h*.16],[ex-tx*h*.1-ty*h*.14,ey-ty*h*.1+tx*h*.14],[ex-tx*h*.1+ty*h*.14,ey-ty*h*.1-tx*h*.14]]);}return group;}
function annotationPair(a,parent,meta,mirrored,zFront,zBack,insideFace='inner'){const THREE=root.THREE,out=[];for(const [face,z]of [['outer',zFront],['inner',zBack]]){let object;if(a.role==='movement')object=root.PLMRDirectionArrows.create(a);else if(a.role==='fixed-mark')object=vectorSymbol(a);else if(a.role==='swing-line'){const pts=[];for(let i=0;i<a.points.length-1;i++)pts.push(new THREE.Vector3(...a.points[i],0),new THREE.Vector3(...a.points[i+1],0));object=new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:0xf59e0b,toneMapped:false,depthTest:false,transparent:true,opacity:.9}));}else{let text=a.text;if(a.role==='view')text=face===insideFace?'İÇ BAKIŞ':'DIŞ BAKIŞ';object=canvasText(root.PLMRDrawingText?.t(text)||text,a.height,a.align,a.role);object.userData.displayText=root.PLMRDrawingText?.t(text)||text;
root.PLMRDrawingText?.bind(object,text,localized=>{
 const next=canvasText(localized,a.height,a.align,a.role),offset=next.userData.alignOffset-object.userData.alignOffset;
 object.geometry.dispose();object.material.map?.dispose();object.material.dispose();
 object.geometry=next.geometry;object.material=next.material;
 object.userData.textSize=next.userData.textSize;object.userData.alignOffset=next.userData.alignOffset;
 object.userData.displayText=localized;
 object.position.x+=offset*(a.role==='position'&&meta.productType==='door'&&face==='inner'?-1:1);
});}
const isLine=a.role==='swing-line';object.position.set(isLine?0:a.x,isLine?0:a.y,z);if(!isLine){object.rotation.y=face==='inner'?Math.PI:0;if(a.role==='movement')object.scale.x=face==='inner'?-1:1;else if(mirrored)object.scale.x=-1;const offset=object.userData.alignOffset||0;if(a.role==='position'&&meta.productType==='door')object.position.x=face==='outer'?a.x+offset:-a.x-offset;else object.position.x+=offset;}
object.userData={...object.userData,annotation:true,annotationRole:a.role,face,text:a.text,sourceHeight:a.height,...meta};object.renderOrder=70;parent.add(object);out.push(object);}return out;}
function dispose(group){group.traverse(o=>{o.geometry?.dispose();for(const m of [].concat(o.material||[])){m.map?.dispose();m.dispose?.();}});}
root.PLMRReferenceAnnotations={canvasText,annotationPair,dispose};
})(window);

/* Actual V53 Giyotin dimension label and line functions, unchanged. */
(function(root){'use strict';const THREE=root.THREE;
  function makeTextTexture(text,width,height,options){
    if(typeof document==='undefined')return null;
    const canvas=document.createElement('canvas');
    const scale=2;
    canvas.width=Math.max(64,Math.round(width*scale));
    canvas.height=Math.max(32,Math.round(height*scale));
    const ctx=canvas.getContext('2d');
    if(!ctx)return null;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle=options.background||'rgba(15,23,42,0.88)';
    const radius=12*scale;
    const w=canvas.width,h=canvas.height;
    ctx.beginPath();
    ctx.moveTo(radius,0);ctx.lineTo(w-radius,0);ctx.quadraticCurveTo(w,0,w,radius);ctx.lineTo(w,h-radius);ctx.quadraticCurveTo(w,h,w-radius,h);ctx.lineTo(radius,h);ctx.quadraticCurveTo(0,h,0,h-radius);ctx.lineTo(0,radius);ctx.quadraticCurveTo(0,0,radius,0);ctx.closePath();ctx.fill();
    ctx.strokeStyle=options.border||'rgba(248,250,252,0.94)';
    ctx.lineWidth=2*scale;ctx.stroke();
    ctx.fillStyle=options.color||'#f8fafc';
    ctx.font=`700 ${Math.round((options.fontSize||30)*scale)}px Segoe UI, Arial, sans-serif`;
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(String(text||''),canvas.width/2,canvas.height/2+1*scale);
    const texture=new THREE.CanvasTexture(canvas);texture.needsUpdate=true;texture.minFilter=THREE.LinearFilter;texture.magFilter=THREE.LinearFilter;texture.generateMipmaps=false;return texture;
  }
  function faceLabelSpec(text,kind){
    const k=String(kind||'generic');
    if(k==='view')return{width:541,height:130,fontSize:49};
    if(k==='motor')return{width:354,height:112,fontSize:46};
    if(k==='position'){const chars=Math.max(6,String(text||'').length);return{width:Math.max(468,Math.min(988,(110+chars*38)*1.3)),height:125,fontSize:52};}
    if(k==='dimension-width'||k==='dimension-height'){
      const chars=Math.max(7,String(text||'').length);
      return{width:Math.max(420,Math.min(1100,(110+chars*38))),height:95,fontSize:48};
    }
    return{width:354,height:112,fontSize:46};
  }
  function createFaceTextMaterial(text,width,height,kind){
    const spec=faceLabelSpec(text,kind),isDimension=String(kind||'').indexOf('dimension-')===0,texture=makeTextTexture(text,width,height,isDimension?{fontSize:spec.fontSize,color:'#0f766e',border:'rgba(15,118,110,0.98)',background:'rgba(248,250,252,0.96)'}:{fontSize:spec.fontSize});
    if(texture)return new THREE.MeshBasicMaterial({map:texture,transparent:true,alphaTest:0.02,depthTest:true,depthWrite:false,side:THREE.FrontSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
    return new THREE.MeshBasicMaterial({color:0x0f172a,transparent:true,opacity:0.88,side:THREE.FrontSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
  }
  function addFaceTextLabel(group,text,u,y,v,kind,face,meta){
    const spec=faceLabelSpec(text,kind),width=spec.width,height=spec.height;
    const planeGeo=new THREE.PlaneGeometry(width,height);
    const wrapper=new THREE.Group();
    const baseRotation=String(face||'outer').toLowerCase()==='inner'?Math.PI:0;
    wrapper.position.set(u,y,v);
    wrapper.renderOrder=24;
    wrapper.userData={name:`Face Label ${text}`,flatTextLabel:{text:String(text),kind:String(kind||'generic'),face:String(face||'outer').toLowerCase()},...meta};
    const front=new THREE.Mesh(planeGeo,createFaceTextMaterial(text,width,height,kind));
    front.rotation.y=baseRotation;
    front.renderOrder=24;
    const back=new THREE.Mesh(planeGeo,createFaceTextMaterial(text,width,height,kind));
    back.rotation.y=baseRotation+Math.PI;
    back.renderOrder=24;
    wrapper.add(front);wrapper.add(back);
    group.add(wrapper);return wrapper;
  }
  function addScreenLabel(group,text,u,y,v,kind,meta){
    const anchor=new THREE.Object3D();anchor.position.set(u,y,v);anchor.userData={name:`Label ${text}`,screenLabel:{text:String(text),kind:String(kind||'generic')},...meta};group.add(anchor);return anchor;
  }
  function addDimensionLine(group,points,meta){
    const mat=new THREE.LineBasicMaterial({color:0x0f766e,transparent:true,opacity:.98,depthTest:false});
    const geo=new THREE.BufferGeometry().setFromPoints(points.map(p=>new THREE.Vector3(p[0],p[1],p[2]))),line=new THREE.LineSegments(geo,mat);
    line.renderOrder=50;line.userData={name:'Dimension Line',dimension:true,...(meta||{})};group.add(line);return line;
  }
  function formatDimensionValue(mm,units){
    if(root.PLMRUnits)return root.PLMRUnits.formatMeasurement(Number(mm),units,false);
    const u=units||{mm:true,inch:false},parts=[];
    if(u.mm!==false)parts.push(`${Math.round(Number(mm))} mm`);
    if(u.inch)parts.push(`${(Number(mm)/25.4).toFixed(2)}"`);
    return parts.join(' - ');
  }
  function addDimensionArrow(group,x,y,z,dx,dy,meta){
    const len=48,wing=24,mag=Math.max(1,Math.hypot(dx,dy)),ux=dx/mag,uy=dy/mag,px=-uy,py=ux;
    return addDimensionLine(group,[[x,y,z],[x+ux*len+px*wing,y+uy*len+py*wing,z],[x,y,z],[x+ux*len-px*wing,y+uy*len-py*wing,z]],meta);
  }
  function addDimensions(group,W,H,meta,units){
    const z=48,half=W/2,below=-220,left=-half-220,ext=28;
    addDimensionLine(group,[[-half,0,z],[-half,below-ext,z],[half,0,z],[half,below-ext,z],[-half,below,z],[half,below,z]],meta);
    addDimensionArrow(group,-half,below,z,1,0,meta);addDimensionArrow(group,half,below,z,-1,0,meta);
    addDimensionLine(group,[[-half,0,z],[left-ext,0,z],[-half,H,z],[left-ext,H,z],[left,0,z],[left,H,z]],meta);
    addDimensionArrow(group,left,0,z,0,1,meta);addDimensionArrow(group,left,H,z,0,-1,meta);
    const widthLabel=addFaceTextLabel(group,formatDimensionValue(W,units),0,below,z+2,'dimension-width','outer',meta);
    const heightLabel=addFaceTextLabel(group,formatDimensionValue(H,units),left,H/2,z+2,'dimension-height','outer',meta);
    heightLabel.rotation.z=Math.PI/2;
  }


function build(W,H,units){const group=new THREE.Group();addDimensions(group,W,H,{},units);group.userData={annotation:true,dimensionStandard:'PLMR_V2_FACADE_OUTER'};group.updateCamera=()=>{};return group;}
root.PLMRDimension3D={build};
})(window);

/* New polygon/extrusion renderer. No V02 box-profile builders or closed/folded duplicate meshes. */
(function(root){'use strict';const THREE=root.THREE,G=root.PLMRReferenceGeometry,A=root.PLMRReferenceAnnotations;
function create(renderer,initial){const group=new THREE.Group(),body=new THREE.Group();group.add(body);const owners=new Map(),interactiveObjects=[],annotationObjects=[],meshes=[],materials=new Set(),textures=new Set();let config,definition,progress=0,target=0,last=performance.now(),disposed=false;
function material(p){let m;if(p.kind==='glass'){const color=({GREY:0x6b7280,BRONZE:0xb68055,'LOW-E GLASS':0x8be7ff})[config.glassColor]||0xb7ddff;m=new THREE.MeshStandardMaterial({color,transparent:true,opacity:.34,depthWrite:false,roughness:.1,metalness:.03,side:THREE.DoubleSide});}
else if(p.kind==='fabric'){const meta=root.PLMRZipFabricMeta?.[config.fabricColor],cream=config.fabricColor===root.PLMR_PRODUCT.defaults.fabricColor,data=root.P3DV_ZIP_FABRIC_TEXTURES?.[config.fabricColor],catalogTileMm=meta?.tileMm||520,tileMm=catalogTileMm/10,color=cream?0xf2ead6:data?0xffffff:meta?.tone||0xf2ead6;m=new THREE.MeshStandardMaterial({color,roughness:.94,metalness:0,side:THREE.DoubleSide});const anisotropy=Math.min(8,renderer?.capabilities?.getMaxAnisotropy?.()||4);
if(data){const t=new THREE.TextureLoader().load(data,tex=>{if(disposed){tex.dispose();return;}tex.wrapS=tex.wrapT=THREE.MirroredRepeatWrapping;tex.repeat.set(definition.metrics.fabricWidth/tileMm,definition.metrics.fabricHeight*G.pose(config,definition,'fabric',progress).scaleY/tileMm);tex.encoding=THREE.sRGBEncoding;tex.anisotropy=anisotropy;tex.needsUpdate=true;});textures.add(t);m.map=t;}
const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const ctx=canvas.getContext('2d'),pixels=ctx.createImageData(256,256);for(let y=0;y<256;y++)for(let x=0;x<256;x++){const u=(x+.5)%16/16,v=(y+.5)%16/16,warp=Math.sin(Math.PI*u)**2,weft=Math.sin(Math.PI*v)**2,over=(Math.floor(x/16)+Math.floor(y/16))%2,relief=over?Math.max(warp*.8,weft):Math.max(weft*.8,warp),noise=((x*13+y*29)%17-8)*.6,value=Math.round(92+110*relief+noise);pixels.data.set([value,value,value,255],(y*256+x)*4);}ctx.putImageData(pixels,0,0);const weave=new THREE.CanvasTexture(canvas);weave.wrapS=weave.wrapT=THREE.RepeatWrapping;weave.repeat.set(definition.metrics.fabricWidth/32,definition.metrics.fabricHeight/32);weave.anisotropy=anisotropy;weave.needsUpdate=true;textures.add(weave);m.bumpMap=weave;m.bumpScale=.32;m.roughnessMap=weave;m.userData.fabric={code:config.fabricColor,catalogTexture:meta?.texture,catalogTileMm,tileMm,visualScale:.1,sourcePhoto:Boolean(data),weaveTileMm:32,bumpScale:.32,anisotropy};}
else{
 const color=p.color||(p.kind==='hardware'?0x334155:config.color);
 const finish=p.kind==='hardware'?'MATTE':config.finish;
 const coat=root.PLMRPowderCoat;
 m=coat?coat.create(color,finish,{colorCode:p.kind==='hardware'||p.color?undefined:config.colorCode}):new THREE.MeshPhysicalMaterial({color,roughness:finish==='GLOSS'?.08:finish==='TEXTURE'?.88:.62,metalness:finish==='GLOSS'?.2:.08,clearcoat:finish==='GLOSS'?1:.08,side:THREE.FrontSide});
 if(!coat)m.color.convertSRGBToLinear();

}
if(p.kind==='fabric')m.color.convertSRGBToLinear();
m.userData.sourceColor=p.kind==='profile'?config.color:null;materials.add(m);return m;}
function shapeGeometry(p,ox,oz){const shape=new THREE.Shape();p.outline.forEach(([x,y],i)=>i?shape.lineTo(x-definition.width/2-ox,y):shape.moveTo(x-definition.width/2-ox,y));shape.closePath();for(const hole of p.holes){const path=new THREE.Path();hole.forEach(([x,y],i)=>i?path.lineTo(x-definition.width/2-ox,y):path.moveTo(x-definition.width/2-ox,y));path.closePath();shape.holes.push(path);}const geo=new THREE.ExtrudeGeometry(shape,{depth:p.depth,bevelEnabled:false,steps:1,curveSegments:1});geo.translate(0,0,p.z-oz);if(p.kind==='fabric'){const xs=p.outline.map(v=>v[0]),ys=p.outline.map(v=>v[1]),minX=Math.min(...xs)-definition.width/2-ox,minY=Math.min(...ys),w=Math.max(...xs)-Math.min(...xs),h=Math.max(...ys)-minY,pos=geo.attributes.position,uv=geo.attributes.uv;for(let i=0;i<pos.count;i++)uv.setXY(i,(pos.getX(i)-minX)/w,(pos.getY(i)-minY)/h);uv.needsUpdate=true;}geo.computeVertexNormals();return geo;}
function clear(){group.traverse(o=>{o.geometry?.dispose();});for(const m of materials)m.dispose();for(const t of textures)t.dispose();materials.clear();textures.clear();A.dispose(body);body.clear();owners.clear();meshes.length=0;interactiveObjects.length=0;annotationObjects.length=0;}
function build(raw){clear();disposed=false;config=JSON.parse(JSON.stringify(raw));definition=G.build(config);const mirrored=config.type!=='door';body.scale.x=mirrored?-1:1;body.position.z=config.type==='zip'&&config.placementLocation==='FRONT OF POSTS'?definition.metrics.boxDepth+30:0;
const staticOwner=new THREE.Group();body.add(staticOwner);owners.set('static',staticOwner);
for(const [key,a]of Object.entries(definition.owners)){const node=new THREE.Group();node.name=key;node.userData={ownerId:key,motionKind:a.kind};body.add(node);owners.set(key,node);}
for(const p of definition.parts){const own=definition.owners[p.owner],ox=own&&['door','accordion','sequential-fold'].includes(own.kind)?G.closedAnchor(own)-definition.width/2:0,oz=own?.z||0,parent=owners.get(p.owner),mesh=new THREE.Mesh(shapeGeometry(p,ox,oz),material(p));if(mesh.material.userData.woodTransfer)root.PLMRPowderCoat.profileUV(mesh.geometry);mesh.name=p.id;mesh.userData={name:p.id,isProduct:true,partId:p.id,layer:p.layer,kind:p.kind,owner:p.owner,positionNo:config.positionNo||'1',positionId:config.id||'',depth:p.depth,sourceArea:p.area,sourceOutline:p.outline,sourceHoles:p.holes,face:p.face||null,modelVersion:7};const edge=new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry),new THREE.LineBasicMaterial({color:p.kind==='glass'?0x155e75:0x233f49,transparent:true,opacity:p.kind==='fabric'?.16:.4}));mesh.add(edge);materials.add(edge.material);parent.add(mesh);meshes.push(mesh);interactiveObjects.push(mesh);}
for(const a of G.annotationData(definition,config)){if(a.twoDOnly||['door','fixed'].includes(config.type)&&['fixed-mark','swing-line'].includes(a.role))continue;const own=definition.owners[a.owner],ox=own&&['door','accordion','sequential-fold'].includes(own.kind)?G.closedAnchor(own)-definition.width/2:0,oz=own?.z||0,parts=definition.parts.filter(p=>p.owner===a.owner),front=parts.length?Math.max(...parts.map(p=>p.z+p.depth)):0,back=parts.length?Math.min(...parts.map(p=>p.z)):-55,b={...a,x:a.x-definition.width/2-ox,points:a.points?.map(([x,y])=>[x-definition.width/2-ox,y])};for(const o of A.annotationPair(b,owners.get(a.owner),{positionId:config.id||'',positionNo:config.positionNo||'1',productType:config.type},mirrored,front-oz+3,back-oz-3,config.type==='zip'?'outer':'inner'))annotationObjects.push({object:o,owner:a.owner,face:o.userData.face,role:a.role,text:o.userData.text,height:a.height,fitBounds:a.fitBounds,textBounds:a.textBounds});}
progress=config.progress||0;target=config.open?1:0;last=performance.now();seek(progress);return group;}
function seek(value){progress=Math.max(0,Math.min(1,value));for(const [key,node]of owners){const pose=G.pose(config,definition,key,progress);node.position.set(pose.x,pose.y||0,pose.z);node.rotation.y=pose.angle;node.scale.y=pose.scaleY;node.visible=pose.visible!==false;node.userData.pose=pose;}for(const mesh of meshes.filter(o=>o.userData.kind==='fabric')){const mat=mesh.material,scale=G.pose(config,definition,'fabric',progress).scaleY;if(mat.map)mat.map.repeat.y=definition.metrics.fabricHeight*scale/(mat.userData.fabric?.tileMm||520);if(mat.bumpMap)mat.bumpMap.repeat.y=definition.metrics.fabricHeight*scale/32;}group.updateMatrixWorld(true);}
function tick(){const now=performance.now(),delta=Math.max(0,Math.min(1000,now-last));last=now;if(progress!==target)seek(target>progress?Math.min(target,progress+delta/3000):Math.max(target,progress-delta/3000));}
function setTarget(open){target=open?1:0;last=performance.now();config.open=Boolean(open);}
function updateAnnotations(camera){group.updateMatrixWorld(true);for(const a of annotationObjects){const parent=owners.get(a.owner),normal=new THREE.Vector3(0,0,a.face==='inner'?-1:1).applyMatrix3(new THREE.Matrix3().getNormalMatrix(parent.matrixWorld)).normalize(),position=a.object.getWorldPosition(new THREE.Vector3()),dir=camera.position.clone().sub(position);a.object.visible=parent.visible&&normal.dot(dir)>0;}}
function snapshot(){group.updateMatrixWorld(true);const rows=meshes.map(o=>{const b=new THREE.Box3().setFromObject(o),center=b.getCenter(new THREE.Vector3());let parent=o,visible=true;while(parent){visible=visible&&parent.visible;parent=parent.parent;}return {name:o.name,id:o.userData.partId,layer:o.userData.layer,kind:o.userData.kind,face:o.userData.face,owner:o.userData.owner,depth:o.userData.depth,area:o.userData.sourceArea,outline:o.userData.sourceOutline,holes:o.userData.sourceHoles,visible,position:center.toArray(),rotation:new THREE.Euler().setFromQuaternion(o.getWorldQuaternion(new THREE.Quaternion())).toArray().slice(0,3),min:b.min.toArray(),max:b.max.toArray(),size:b.getSize(new THREE.Vector3()).toArray(),color:(()=>{const c=o.material.color.clone().convertLinearToSRGB();return [c.r,c.g,c.b].map(v=>Math.round(v*255).toString(16).padStart(2,'0')).join('');})(),fabric:o.material.userData.fabric?{...o.material.userData.fabric,photoLoaded:!!o.material.map?.image,photoRepeat:o.material.map?.repeat.toArray(),weaveRepeat:o.material.bumpMap?.repeat.toArray(),uvRange:(()=>{const a=o.geometry.attributes.uv.array;return [Math.min(...a),Math.max(...a)];})()}:null,toggle:o.userData.owner!=='static',motion:definition.owners[o.userData.owner]||null};});return {meshes:rows,motion:[{progress,target,bindingCount:owners.size-1}],bounds:new THREE.Box3().setFromObject(group),metrics:definition.metrics,partCount:definition.parts.length,annotations:annotationObjects.map(a=>({kind:a.role,text:a.object.userData.displayText||a.text,height:a.height,arrowStyle:a.object.userData.arrowStyle||null,fitBounds:a.fitBounds,textBounds:a.textBounds,plateSize:a.object.userData.textSize||null,face:a.face,visible:a.object.visible,position:a.object.getWorldPosition(new THREE.Vector3()).toArray()}))};}
function segments(){const lines=[];for(const p of definition.parts.filter(p=>p.front))for(const contour of [p.outline,...p.holes])for(let i=0;i<contour.length;i++){const a=contour[i],b=contour[(i+1)%contour.length];lines.push([...a,...b]);}return lines;}
function dispose(){disposed=true;clear();group.clear();}
build(initial);return {group,build,tick,seek,target:setTarget,motion:()=>({progress,target}),snapshot,segments,dispose,updateAnnotations,interactiveObjects,get definition(){return definition;},get annotationObjects(){return annotationObjects;}};}
root.PLMRReferenceEngine={create};
})(window);

/* Standalone product adapter: V53 settings + positions + drawingLayout contract. */
(function(root){'use strict';
const clone=x=>JSON.parse(JSON.stringify(x));
function create(d){
 const base=root.PLMRModel,colors=root.PLMRColor,ral=root.PLMRRal.RAL_COLOR_CATALOG;
 const optionKeys=[...d.fields.map(f=>f.key),'systemColor','surface','defaultView'];
 const requiredKey=d.type==='door'?'doorType':['balcony','folding'].includes(d.type)?'openingMode':null;
 function common(){const q=Object.fromEntries(optionKeys.map(k=>[k,null]));for(const f of d.fields.filter(f=>f.internal))q[f.key]=d.defaults[f.key];if(d.type==='door')q.defaultView='OUTSIDE VIEW';return q;}
 function effective(values){const q={...d.defaults,systemColor:'Varsayılan',surface:'Varsayılan'};for(const k of optionKeys)if(values[k]!==null&&values[k]!==undefined)q[k]=values[k];if(d.type==='door')q.defaultView='OUTSIDE VIEW';return q;}
 function missing(w,p){const c={...w.settings,...p.overrides},a=[];if(!(Number(p.width)>0))a.push('Genişlik');if(!(Number(p.height)>0))a.push('Yükseklik');if(requiredKey&&!c[requiredKey])a.push(d.type==='door'?'Kapı tipi':'Açılım tipi');return a;}
 function checkOptions(values){const c=effective(values);for(const f of d.fields){const v=c[f.key];if(f.options&&!f.options.some(o=>o[0]===v))throw Error(f.label+' geçersiz.');if(f.kind==='number'&&(!Number.isFinite(v)||(f.integer!==false&&!Number.isInteger(v))||v<f.min||v>f.max))throw Error(f.label+' geçersiz.');if(f.kind==='text'&&typeof v!=='string')throw Error(f.label+' geçersiz.');}if(!['OUTSIDE VIEW','INSIDE VIEW'].includes(c.defaultView))throw Error('Bakış geçersiz.');if(!colors.isDefaultMaterialValue(c.systemColor)&&!ral.some(x=>x.code===c.systemColor))throw Error('Sistem rengi kartelada bulunamadı.');if(!colors.canonicalSurface(c.systemColor,c.surface))throw Error('Yüzey seçimi zorunludur.');return c;}
 const id=()=>root.crypto?.randomUUID?.()||'p-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
 function position(no=d.reference.prefix+'-01',c=common()){return {id:id(),positionNo:String(no),width:null,height:null,quantity:1,description:'',inputUnit:'mm',overrides:{},open:false,progress:0};}
 function initial(){return {schema:'plmr-standalone-workspace-v3',version:3,productId:d.id,applicationVersion:'0.7.0',projectInfo:{projectCode:'',projectName:'',customerName:'',country:'',revision:'R01',date:new Date().toLocaleDateString('tr-TR',{timeZone:'Europe/Istanbul'}),customerRepresentative:'',designer:'',description:''},settings:common(),positions:[],drawingLayout:{columns:1,previewMode:'3D',openState:'CLOSED',showDimensions:true,dimensionUnits:{mm:true,inch:false}},inputUnit:'mm'};}
 function resolve(w,p){const absent=missing(w,p);if(absent.length)throw Error(p.positionNo+': '+absent.join(', ')+' zorunludur.');const supplied={...w.settings,...p.overrides},c=checkOptions(supplied),isDefault=colors.isDefaultMaterialValue(c.systemColor),entry=ral.find(r=>r.code===c.systemColor);if(!isDefault&&!entry)throw Error('Sistem rengi kartelada bulunamadı.');const surface=colors.canonicalSurface(c.systemColor,c.surface);if(!surface)throw Error('Yüzey seçimi zorunludur.');const q={...d.defaults,...c,type:d.type,width:p.width,height:p.height,open:p.open,progress:p.progress,color:isDefault?d.defaults.color:entry.hex,colorMode:isDefault?'default':'ral',finish:surface==='Wood Transfer'?'WOOD_TRANSFER':surface==='Parlak'?'GLOSS':surface==='Texture'?'TEXTURE':'MATTE',colorCode:c.systemColor,colorKind:entry?.kind||'',colorTexture:entry?.image||''};if(d.type==='zip'){const allowed=c.series==='P SERIES'?['115x115 BOX','130x130 BOX']:['100x100 BOX','110x110 BOX','HERCULE'];if(!allowed.includes(q.subtype))q.subtype=allowed[0];}q.selectedOptions=optionKeys.filter(k=>supplied[k]!==null&&supplied[k]!==undefined);if(d.type==='door')q.selectedOptions.push('defaultView');if(['balcony','folding'].includes(d.type)){if(c.openingMode==='CENTER')q.openingDirection='BOTH';else{if(q.panels>8)throw Error('8 üzeri panel için merkezden açılım seçin.');if(q.openingDirection==='BOTH')q.openingDirection='LEFT';}}return base.validate(q,d);}
 function validate(raw,allowIncomplete=false){const w=clone(raw);if(w.settings)w.settings=Object.fromEntries(optionKeys.map(k=>[k,Object.prototype.hasOwnProperty.call(w.settings,k)?w.settings[k]:common()[k]]));if(w.settings)w.settings.defaultView='OUTSIDE VIEW';for(const p of w.positions||[])if(p.overrides&&'defaultView' in p.overrides)delete p.overrides.defaultView;if(w.schema!=='plmr-standalone-workspace-v3'||w.version!==3||w.productId!==d.id)throw Error('Bu proje bu ürün için oluşturulmamış.');if(!w.settings||!Array.isArray(w.positions)||w.positions.length>200)throw Error('Poz listesi geçersiz.');if(!w.projectInfo||typeof w.projectInfo!=='object')throw Error('Proje bilgileri geçersiz.');for(const [k,v]of Object.entries(w.projectInfo))if(typeof v!=='string'||v.length>5000)throw Error('Proje bilgisi geçersiz: '+k);if(!['mm','inch','ft'].includes(w.inputUnit))throw Error('Giriş birimi geçersiz.');const l=w.drawingLayout;if(!l||!Number.isInteger(l.columns)||l.columns<1||l.columns>10||!['2D','3D'].includes(l.previewMode)||!l.dimensionUnits||(!l.dimensionUnits.mm&&!l.dimensionUnits.inch&&!l.dimensionUnits.ft))throw Error('Çizim ayarları geçersiz.');if(l.cameraBookmarks!==undefined){if(!Array.isArray(l.cameraBookmarks)||l.cameraBookmarks.length>5)throw Error('3D görünüş listesi geçersiz.');for(const v of l.cameraBookmarks){for(const k of ['position','target','up'])if(!Array.isArray(v[k])||v[k].length!==3||!v[k].every(Number.isFinite))throw Error('Kamera görünüşü geçersiz.');if(!Number.isFinite(v.fov)||v.fov<1||v.fov>179)throw Error('Kamera açısı geçersiz.');}}checkOptions(w.settings);const ids=new Set(),nos=new Set();for(const p of w.positions){if(typeof p.id!=='string'||!p.id||ids.has(p.id))throw Error('Poz kimliği geçersiz veya tekrarlı.');ids.add(p.id);if(typeof p.positionNo!=='string'||!p.positionNo.trim()||p.positionNo.length>40)throw Error('Poz numarası geçersiz.');const no=p.positionNo.trim().toLocaleUpperCase('tr-TR');if(nos.has(no))throw Error('Poz numarası tekrarlı: '+p.positionNo);nos.add(no);if(!Number.isInteger(p.quantity)||p.quantity<1||p.quantity>999999)throw Error('Adet geçersiz.');if(p.inputUnit!==undefined&&!['mm','inch','ft'].includes(p.inputUnit))throw Error('Poz birimi geçersiz.');if(typeof p.description!=='string'||p.description.length>5000||!p.overrides||typeof p.overrides!=='object'||Array.isArray(p.overrides))throw Error('Poz verisi geçersiz.');for(const k of Object.keys(p.overrides))if(!optionKeys.includes(k))throw Error('Bilinmeyen poz ayarı: '+k);checkOptions({...w.settings,...p.overrides});if(!allowIncomplete||!missing(w,p).length)resolve(w,p);}w.applicationVersion='0.7.0';return w;}
 function nextNo(w){let n=1;const used=new Set(w.positions.map(p=>p.positionNo.trim().toLocaleUpperCase('tr-TR'))),name=n=>d.reference.prefix+'-'+String(n).padStart(2,'0');while(used.has(name(n))||used.has(String(n)))n++;return name(n);}
 function copy(w,ids,allowIncomplete=false){const out=clone(w);for(const p of w.positions.filter(p=>ids.includes(p.id))){const q=clone(p);q.id=id();q.positionNo=nextNo(out);out.positions.push(q);}return validate(out,allowIncomplete);}
 function overrides(w,p,value){const o={};for(const k of optionKeys)if(value[k]!==w.settings[k])o[k]=value[k];return o;}
 function migrate(old){const q=base.validate(old.state,d),w=initial();w.settings=effective({});w.applicationVersion='legacy';w.positions=[position()];for(const k of d.fields.map(f=>f.key))if(q[k]!==undefined)w.settings[k]=q[k];w.settings.defaultView=q.foldingView||q.defaultView||'INSIDE VIEW';if(q.colorMode==='ral'){const r=ral.find(r=>r.hex.toLowerCase()===q.color.toLowerCase());if(!r)throw Error('V1 özel rengi V53 kartelasıyla eşleştirilemedi. V1 dosyası korunmuştur.');w.settings.systemColor=r.code;w.settings.surface=colors.canonicalSurface(r.code,q.finish==='GLOSS'?'Parlak':q.finish==='TEXTURE'?'Texture':'Mat');}Object.assign(w.positions[0],{width:q.width,height:q.height,open:q.open,progress:q.progress});return validate(legacy(w));}
 function migrateV2(raw){const w=clone(raw);w.schema='plmr-standalone-workspace-v3';w.version=3;w.applicationVersion='0.6.0';w.settings={...common(),...w.settings};if(d.type==='fixed'){for(const target of [w.settings,...w.positions.map(p=>p.overrides)]){if(target.horizontalHeights){const a=String(target.horizontalHeights).split(/[;,]+/).map(Number);target.horizontalHeightMode='MANUAL';const H=w.positions[0]?.height||d.defaults.height,rows=Number(target.horizontalDivisions||w.settings.horizontalDivisions||1),available=H-5-100-(rows-1)*50,sum=a.reduce((s,v)=>s+v,0);target.horizontalHeights=a.map(v=>v*available/sum).join(',');}}}for(const p of w.positions){p.width-=d.type==='zip'?3:5;p.height-=d.type==='zip'?3:5;}return validate(legacy(w));}
 function legacy(raw){const w=clone(raw);if(w.applicationVersion==='0.7.0')return w;w.settings={...effective({}),...w.settings};if(d.type==='door'&&raw.settings?.movingLeafWidth===undefined)w.settings.movingLeafWidth=0;if(d.type==='fixed'){for(const p of w.positions||[]){const c={...w.settings,...p.overrides};if(c.verticalDivisions===0)p.overrides.verticalDivisions=Math.max(1,Math.ceil((p.width-100)/1200));}if(raw.settings?.horizontalHeightMode===undefined)w.settings.horizontalHeightMode='REFERENCE';}if(requiredKey==='openingMode'){w.settings.openingMode=w.settings.openingDirection==='BOTH'||w.settings.panels>8?'CENTER':'EDGE';for(const p of w.positions||[]){const c={...w.settings,...p.overrides};if('openingDirection' in p.overrides||'panels' in p.overrides)p.overrides.openingMode=c.openingDirection==='BOTH'||c.panels>8?'CENTER':'EDGE';}}return w;}
 function decode(text){if(typeof text!=='string'||text.length>8000000)throw Error('Proje dosyası geçersiz veya çok büyük.');let q;try{q=JSON.parse(text.replace(/^\uFEFF/,''));}catch(e){throw Error('Proje dosyası okunamadı.');}if(q.schema==='plmr-standalone-workspace-v2'&&q.version===2&&q.productId===d.id)return migrateV2(q);if(q.schema==='plmr-standalone-facade-v1'&&q.version===1&&q.productId===d.id)return migrate(q);return validate(legacy(q));}
 return {initial,common,position,resolve,validate,nextNo,copy,overrides,decode,encode:w=>JSON.stringify(validate(w),null,2),clone,optionKeys,effective,missing,requiredKey,validateDraft:w=>validate(w,true)};
}
root.PLMRWorkspaceModel={create};
})(typeof window!=='undefined'?window:globalThis);

/* 2D is built directly from the same contour model used by the extrusion renderer. */
(function(root){'use strict';const N=root.PLMRV53Document,G=root.PLMRReferenceGeometry;
function build(w,entries,d){const prepared=entries.map(e=>{const m=e.engine.definition,anns=G.annotationData(m,e.state),minY=Math.min(0,...m.plan.flatMap(a=>a.points?a.points.map(p=>p[1]):[a.y||0])),maxY=Math.max(m.height,...anns.map(a=>a.y+a.height));return {...e,m,anns,minY,maxY};});const grid=root.PLMRLayout.layoutProjectCells(prepared.map(e=>({key:e.position.id,width:Math.max(e.m.width,e.m.metrics.planBounds?.maxX||0)-Math.min(0,e.m.metrics.planBounds?.minX||0)+650,height:e.maxY-e.minY+700})),w.drawingLayout.columns);
const project={projectInfo:w.projectInfo,commonSettings:{...w.settings,generalDescription:w.projectInfo.description,color:{code:w.settings.systemColor,finish:w.settings.surface}},positions:w.positions},layout=N.titleBlockLayout(project),H=Math.max(7320,grid.height+820,layout.requiredInnerHeight+120),W=Math.max(8000,3160+420+grid.width+700),title=N.buildTitleBlock(project,H,layout),entities=[N.rect(60,60,W-120,H-120,N.LAYERS.outer),...title.entities],positions=[],layerStyle={};for(const l of N.LAYER_LIST)layerStyle[l]={aci:7};layerStyle[N.LAYERS.dimension]={aci:1};
for(let i=0;i<prepared.length;i++){const e=prepared[i],m=e.m,p=e.position,cell=grid.cells[i],x=3930+cell.x,y=H-410-cell.top-e.maxY,extra={positionId:p.id,positionNo:p.positionNo},firstEntity=entities.length;for(const [name,aci]of Object.entries(m.layerColors))layerStyle[name]={aci};for(const part of m.parts.filter(p=>p.front)){if(part.kind==='fabric')entities.push({type:'hatch',layer:part.layer,points:part.outline.map(([a,b])=>[a+x,b+y]),aci:31,trueColor:parseInt((root.PLMRZipFabricMeta?.[e.state.fabricColor]?.tone||'#f2ead6').slice(1),16),...extra});for(const points of [part.outline,...part.holes])entities.push({type:'polyline',layer:part.layer,closed:true,points:points.map(([a,b])=>[a+x,b+y]),role:part.kind,partId:part.id,...extra});}
for(const a of e.anns){if(a.threeDOnly)continue;if(a.role==='fixed-mark'){const b=a.fitBounds;for(const [p1,p2]of G.fixedMarkSegments(a))entities.push({...G.line(m.infoLayer,[p1[0]+x,p1[1]+y],[p2[0]+x,p2[1]+y]),role:'fixed-mark',markCenter:[a.x+x,a.y+y],markBounds:{minX:b.minX+x,minY:b.minY+y,maxX:b.maxX+x,maxY:b.maxY+y},...extra});}else if(a.role==='swing-line'){for(let j=0;j<a.points.length-1;j++)entities.push({...G.line(m.infoLayer,[a.points[j][0]+x,a.points[j][1]+y],[a.points[j+1][0]+x,a.points[j+1][1]+y]),role:'movement',...extra});}else entities.push(N.text(x+a.x,y+a.y,a.text||'',m.infoLayer,a.height,0,a.align,{role:a.role,textBounds:a.textBounds?{minX:a.textBounds.minX+x,maxX:a.textBounds.maxX+x,minY:a.textBounds.minY+y,maxY:a.textBounds.maxY+y}:undefined,fitBounds:a.fitBounds?{minX:a.fitBounds.minX+x,maxX:a.fitBounds.maxX+x,minY:a.fitBounds.minY+y,maxY:a.fitBounds.maxY+y}:undefined,...extra}));}
for(const a of m.plan){const item={...a,...extra};if(a.points)item.points=a.points.map(([a,b])=>[a+x,b+y]);if(a.x!==undefined)item.x=a.x+x;if(a.y!==undefined)item.y=a.y+y;if(a.x1!==undefined){item.x1=a.x1+x;item.x2=a.x2+x;item.y1=a.y1+y;item.y2=a.y2+y;}entities.push(item);}
const mirror=d.type!=='door'&&String(m.view).includes('INSIDE')===(d.type==='zip');if(mirror){const rx=value=>2*x+m.width-value;for(const item of entities.slice(firstEntity)){if(item.points)item.points=item.points.map(([a,b])=>[rx(a),b]);if(item.x!==undefined)item.x=rx(item.x);if(item.x1!==undefined){item.x1=rx(item.x1);item.x2=rx(item.x2);}if(item.align==='left')item.align='right';else if(item.align==='right')item.align='left';if(item.role==='movement'&&item.value)item.value=({'←':'→','→':'←','↺':'↻','↻':'↺'})[item.value]||item.value;for(const key of ['textBounds','fitBounds'])if(item[key]){const b=item[key];item[key]={...b,minX:rx(b.maxX),maxX:rx(b.minX)};}if(item.markCenter)item.markCenter=[rx(item.markCenter[0]),item.markCenter[1]];if(item.markBounds){const b=item.markBounds;item.markBounds={...b,minX:rx(b.maxX),maxX:rx(b.minX)};}}}
if(m.metrics.cells.some(c=>c.kind==='F'))for(const [j,c]of m.metrics.cells.filter(c=>c.kind!=='F').entries())entities.push({...N.makeDimension('x',{x:x+c.x,y},{x:x+c.x+c.w,y},{x:x+c.x+c.w/2,y:y-220},c.w,N.formatDimension(c.w,w.drawingLayout.dimensionUnits),p.id+'-LEAF-'+j),role:'leaf-width',...extra});
entities.push({...N.makeDimension('x',{x,y},{x:x+m.width,y},{x:x+m.width/2,y:y-(m.metrics.cells.some(c=>c.kind==='F')?440:220)},m.width,N.formatDimension(m.width,w.drawingLayout.dimensionUnits),p.id+'-W'),...extra},{...N.makeDimension('y',{x,y},{x,y:y+m.height},{x:x-220,y:y+m.height/2},m.height,N.formatDimension(m.height,w.drawingLayout.dimensionUnits),p.id+'-H'),...extra});positions.push({id:p.id,positionNo:p.positionNo,quantity:p.quantity,view:e.state.selectedOptions?.includes(['balcony','folding'].includes(d.type)?'foldingView':'defaultView')||d.type==='door'?m.view:null,selectedOptions:e.state.selectedOptions,options:Object.fromEntries((e.state.selectedOptions||[]).filter(k=>!d.fields.find(f=>f.key===k)?.internal).map(k=>[k,e.state[k]])),mirrored2D:mirror,width:m.width,height:m.height,origin:{x,y},row:cell.row,column:cell.column,productBounds:{minX:x,minY:y+e.minY,maxX:x+m.width,maxY:y+e.maxY},cellBounds:{minX:x-350,minY:y+e.minY-350,maxX:x+m.width+300,maxY:y+e.maxY+350}});}
const bounds={minX:0,minY:0,maxX:W,maxY:H,width:W,height:H},doc={schema:'plmr-dxf-reference-document-v3',units:'mm',modelScale:1,columns:grid.columns,layers:Object.keys(layerStyle),layerStyle,blocks:{'PLMR - LOGO':N.buildLogoBlock()},entities,bounds,previewBounds:bounds,outerFrame:{x:60,y:60,width:W-120,height:H-120},titleBlock:title,positions,metadata:{source:d.reference.file,sourceSha256:d.reference.sha256,geometryVersion:7,threeDDefaultView:'OUTSIDE VIEW',canonical:true,positionCount:positions.length,dimensionUnits:{...w.drawingLayout.dimensionUnits}}};if(positions.length)N.validateDocument(doc);return doc;}
root.PLMRReferenceDocument={build};
})(window);

/* V23 catalog pages/hotspots, using the V53 modal host and V04 reference geometry. */
(function(root){'use strict';
function enhance(input,key,{modal,esc,onChange,getOptions}){const isFabric=key==='fabricColor',isDoor=key==='doorType';if(!isFabric&&!isDoor)return ()=>{};input.hidden=true;const button=document.createElement('button');button.type='button';button.className='catalog-field';button.id=isFabric?'fabricPickerTrigger':'doorPickerTrigger';button.setAttribute('aria-haspopup','dialog');input.after(button);const reset=document.createElement('button');reset.type='button';reset.className='btn-secondary';reset.textContent='-';reset.setAttribute('aria-label',isFabric?'Kumaş seçimini kaldır':'Kapı tipi seçimini kaldır');reset.onclick=()=>{input.value='';onChange();render();};button.after(reset);
function render(){const text=input.options[input.selectedIndex]?.text||input.value;if(!input.value){button.textContent='- · '+(isFabric?'Katalogdan seç':'Tipleri gör');button.setAttribute('aria-label',isFabric?'Kumaş kataloğu: -':'Kapı tipleri: -');return;}if(isFabric){const item=root.PLMRZipFabricMeta[input.value];button.innerHTML='<span class="catalog-swatch" style="background:'+item.tone+';background-image:url('+item.texture+')"></span><span>'+esc(text)+'</span><small>Katalogdan seç</small>';}else button.innerHTML='<span class="door-mini">'+doorSvg(input.value,getOptions())+'</span><span>'+esc(text)+'</span><small>Tipleri gör</small>';button.setAttribute('aria-label',(isFabric?'Kumaş kataloğu: ':'Kapı tipleri: ')+text);}
function choose(value,close){input.value=value;onChange();render();close();}
button.onclick=()=>{if(isFabric)modal('Zip Perde Kumaş Kataloğu','KUMAŞ',(body,close)=>{const note=document.createElement('p');note.className='catalog-intro';note.textContent='Sun-Store katalog sayfasındaki kumaşa tıklayın.';body.append(note);for(const section of PLMRFabricCatalog){const heading=document.createElement('h3');heading.textContent=section.title;body.append(heading);const stack=document.createElement('div');stack.className='fabric-page-stack-inner';for(const [index,page]of section.pages.entries()){const article=document.createElement('article');article.className='fabric-page-card';const overlay=document.createElement('div');overlay.className='fabric-page-overlay';const img=document.createElement('img');img.src=page.image;img.alt=section.title+' sayfa '+(index+1);overlay.append(img);for(const item of page.items){const hotspot=document.createElement('button');hotspot.type='button';hotspot.className='fabric-page-hotspot'+(input.value===item.value?' is-selected':'');hotspot.setAttribute('style',`left:${item.left};top:${item.top};width:${item.width};height:${item.height};`);hotspot.dataset.value=item.value;hotspot.title=item.value;hotspot.setAttribute('aria-label',item.value);hotspot.setAttribute('aria-pressed',String(input.value===item.value));hotspot.innerHTML='<span>'+esc(item.value)+'</span>';hotspot.onclick=()=>choose(item.value,close);overlay.append(hotspot);}article.append(overlay);stack.append(article);}body.append(stack);}},null,{width:1060});
else modal('Kapı Tipleri','KAPI',(body,close)=>{const grid=document.createElement('div');grid.className='door-type-grid';grid.setAttribute('aria-label','Kapı tipi seçenekleri');for(const [value,label]of root.PLMR_PRODUCT.fields.find(f=>f.key==='doorType').options){const card=document.createElement('button');card.type='button';card.className='door-type-card'+(input.value===value?' is-selected':'');card.dataset.value=value;card.setAttribute('aria-label',label);card.setAttribute('aria-pressed',String(input.value===value));card.innerHTML=doorSvg(value,getOptions())+'<strong>'+esc(label)+'</strong>';card.onclick=()=>choose(value,close);grid.append(card);}body.append(grid);},null,{width:1060});};render();return render;}
function doorSvg(type,options){const G=root.PLMRReferenceGeometry,d=root.PLMR_PRODUCT,q={...d.defaults,...options,doorType:type,width:1000*G.doorPlan(type).length,height:3000,movingLeafHeight:2400,movingLeafWidth:0},m=G.build(q,d),transform='translate(0,3000) scale(1,-1)';let svg='<svg data-nominal-width="'+q.width+'" data-leaf-height="2400" viewBox="-100 -100 '+(q.width+200)+' 3200" aria-hidden="true" focusable="false"><g transform="'+transform+'">';for(const p of m.parts.filter(p=>p.front)){const contour=pts=>pts.map(([x,y],i)=>(i?'L':'M')+x+','+y).join(' ')+'Z';svg+='<path d="'+[p.outline,...p.holes].map(contour).join(' ')+'" fill="'+(p.kind==='glass'?(p.owner==='static'?'#f2f7f9':'#d8edf5'):p.kind==='hardware'?'#475569':'#badce3')+'" fill-rule="evenodd" stroke="#16768b" stroke-width=".65" vector-effect="non-scaling-stroke"/>';}
for(const a of m.annotations){if(a.role==='swing-line')svg+='<polyline points="'+a.points.map(p=>p.join(',')).join(' ')+'" fill="none" stroke="#16768b" stroke-width=".75" vector-effect="non-scaling-stroke"/>';if(a.role==='fixed-mark')for(const [p1,p2]of G.fixedMarkSegments(a))svg+='<line x1="'+p1[0]+'" y1="'+p1[1]+'" x2="'+p2[0]+'" y2="'+p2[1]+'" stroke="#7298a3" stroke-width=".7" vector-effect="non-scaling-stroke"/>';}return svg+'</g></svg>';}
root.PLMRSettingsCatalogs={enhance,doorSvg};
})(window);

(function(root){'use strict';
function open(config,services,onSave){const {modal,esc}=services,P=root.PLMRPartitions,G=root.PLMRReferenceGeometry;let q=G.clone(config),model=G.build(q),regions=P.read(q),selection=null,svg,tools,note,error;
const encode=()=>JSON.stringify({version:1,regions});
function current(){q.divisionLayout=encode();return G.build(q);}
function mutate(fn){const old=G.clone(regions);try{fn();model=current();selection=null;error.textContent='';render();}catch(e){regions=old;error.textContent=e.message;}}
const mm=v=>Number(v.toFixed(2)).toLocaleString('tr-TR',{maximumFractionDigits:2});
function draw(){const W=model.width,H=model.height,margin=60;svg.setAttribute('viewBox',[-margin,-margin,W+margin*2,H+margin*2].join(' '));let out=`<rect x="0" y="0" width="${W}" height="${H}" fill="#d5dde3"/>`;
for(const region of model.editRegions){const result=P.layout(region.tree,region);for(const c of result.cells){const on=selection?.key===region.key&&selection.path===c.path&&selection.kind==='cell',top=H-c.y-c.h;out+=`<rect data-region="${esc(region.key)}" data-path="${c.path}" data-kind="cell" x="${c.x}" y="${top}" width="${c.w}" height="${c.h}" fill="${on?'#c6e1ed':'#eef6f8'}" stroke="#8fa3af" stroke-width="2"/>`;
const fs=Math.max(38,Math.min(95,c.w*.3,c.h*.3)),ox=Math.min(c.w*.2,90),oy=Math.min(c.h*.16,100),dims=[{axis:'V',x1:c.x+10,y1:top+oy,x2:c.x+c.w-10,y2:top+oy,x:c.x+c.w/2,y:top+oy-fs*.35,value:c.w,rotate:''},{axis:'H',x1:c.x+c.w-ox,y1:top+10,x2:c.x+c.w-ox,y2:top+c.h-10,x:c.x+c.w-ox-fs*.35,y:top+c.h/2,value:c.h,rotate:`rotate(-90 ${c.x+c.w-ox-fs*.35} ${top+c.h/2})`}];
for(const d of dims){const editable=!!P.resizeAnchor(region.tree,c.path,d.axis),color=editable?'#9f5c5c':'#78909b';out+=`<g class="partition-dimension" data-dim="${d.axis}" data-region="${esc(region.key)}" data-path="${c.path}" data-editable="${editable}" style="cursor:${editable?'pointer':'default'}"><line x1="${d.x1}" y1="${d.y1}" x2="${d.x2}" y2="${d.y2}" stroke="${color}" stroke-width="2"/><circle cx="${d.x1}" cy="${d.y1}" r="4" fill="${color}"/><circle cx="${d.x2}" cy="${d.y2}" r="4" fill="${color}"/><text transform="${d.rotate}" x="${d.x}" y="${d.y}" text-anchor="middle" fill="${color}" font-size="${fs}" font-family="Segoe UI,Arial">${mm(d.value)}</text><title>${editable?'Ölçüyü düzenle':'Sabit toplam ölçü'}</title></g>`;}}
for(const b of result.bars){const on=selection?.key===region.key&&selection.path===b.path&&selection.kind==='bar';out+=`<rect data-region="${esc(region.key)}" data-path="${b.path}" data-kind="bar" x="${b.x}" y="${H-b.y-b.h}" width="${b.w}" height="${b.h}" fill="${on?'#a2c7d7':'#78909b'}" stroke="#526c78" stroke-width="2"/>`;}}
svg.innerHTML=out;for(const e of svg.querySelectorAll('[data-kind]'))e.onclick=()=>{selection={key:e.dataset.region,path:e.dataset.path,kind:e.dataset.kind};render();};for(const e of svg.querySelectorAll('[data-dim]'))e.onclick=event=>{event.stopPropagation();if(e.dataset.editable!=='true')return;selection={key:e.dataset.region,path:e.dataset.path,kind:'dimension',axis:e.dataset.dim};render();tools.querySelector('input')?.focus();tools.querySelector('input')?.select();};}
function render(){draw();tools.innerHTML='';if(!selection){note.textContent='Cam bölmesini seçip yatay/dikey kayıt ekleyin. Aynı yöndeki kayıtlar ilk açıklıkta eşit dağılır. Ölçüler mm’dir. Kırmızı net açıklık ölçüsüne tıklayarak düzenleyebilirsiniz.';return;}const r=model.editRegions.find(r=>r.key===selection.key),list=P.layout(r.tree,r),item=(selection.kind==='bar'?list.bars:list.cells).find(v=>v.path===selection.path);note.textContent=r.label+' · '+(selection.kind==='cell'?'Seçili bölme':selection.kind==='dimension'?'Net cam açıklığı':'Seçili orta kayıt');
if(selection.kind==='dimension'){const label=document.createElement('label');label.textContent=(selection.axis==='V'?'Yatay':'Dikey')+' net açıklık (mm)';const input=document.createElement('input');input.type='number';input.id='partitionDimensionValue';input.min=70;input.step='any';input.value=Number((selection.axis==='V'?item.w:item.h).toFixed(3));input.setAttribute('aria-label','Net açıklık (mm)');label.append(input);tools.append(label);const apply=document.createElement('button');apply.id='partitionDimensionApply';apply.className='btn-blue';apply.textContent='Ölçüyü Uygula';const commit=()=>mutate(()=>{if(!input.value.trim())throw Error('Net açıklık girin.');regions[r.key]=P.resizeCell(r.tree,r,selection.path,selection.axis,Number(input.value));});apply.onclick=commit;input.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();commit();}};tools.append(apply);return;}
const label=document.createElement('label');label.textContent=selection.kind==='cell'?'Yeni kayıt yönü':'Kayıt konumu';const axis=document.createElement('select');axis.id='partitionAxis';for(const[v,t]of [['H','Yatay'],['V','Dikey']])axis.add(new Option(t,v));if(selection.kind==='bar'){axis.value=item.axis;axis.disabled=true;}label.append(axis);tools.append(label);
let position;if(selection.kind==='bar'){position=document.createElement('input');position.id='partitionPosition';position.type='number';position.step='any';position.value=Number(((axis.value==='V'?item.x-item.parentBounds.x:item.y-item.parentBounds.y)+25).toFixed(3));position.setAttribute('aria-label','Kayıt merkezi (mm)');const help=document.createElement('label');help.textContent='Kayıt merkezi (soldan/alttan, mm)';help.append(position);tools.append(help);}
const apply=document.createElement('button');apply.className='btn-blue';apply.id='partitionApply';apply.textContent=selection.kind==='cell'?'Kayıt Ekle':'Konumu Uygula';apply.onclick=()=>mutate(()=>{if(selection.kind==='cell'){regions[r.key]=P.addEqual(r.tree,r,selection.path,axis.value);return;}const span=axis.value==='V'?item.parentBounds.w:item.parentBounds.h,center=Number(position.value);if(!position.value||!Number.isFinite(center))throw Error('Kayıt konumu girin.');regions[r.key]=P.replace(r.tree,selection.path,{...G.clone(item.node),ratio:(center-25)/(span-50)});});tools.append(apply);
if(selection.kind==='bar'){const remove=document.createElement('button');remove.id='partitionRemove';remove.className='btn-secondary';remove.textContent='Kaydı Sil';remove.onclick=()=>mutate(()=>regions[r.key]=P.replace(r.tree,selection.path,P.merged(item.node)));tools.append(remove);}}
modal('Bölmeleri Özelleştir','2D BÖLME DÜZENİ',body=>{note=document.createElement('p');note.className='modal-note';body.append(note);svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.classList.add('partition-preview');svg.setAttribute('aria-label','Bölme düzenleme çizimi');body.append(svg);tools=document.createElement('div');tools.className='partition-tools';body.append(tools);error=document.createElement('p');error.className='modal-error';error.setAttribute('role','alert');body.append(error);const reset=document.createElement('button');reset.id='partitionReset';reset.className='btn-secondary';reset.textContent='Standart Bölmelere Dön';reset.onclick=()=>mutate(()=>regions={});body.append(reset);render();},()=>{current();onSave(encode());},{width:940});}
root.PLMRPartitionEditor={open};})(window);

const PLMRReferenceGeometry=window.PLMRReferenceGeometry;
const PLMRPartitionEditor=window.PLMRPartitionEditor;
const PLMRSettingsCatalogs=window.PLMRSettingsCatalogs;
const PLMRRemoteEditor=window.PLMRRemoteEditor;
const d=window.PLMR_PRODUCT,M=window.PLMRWorkspaceModel.create(d),C=window.PLMRColor,R=window.PLMRRal;
function nextPositionNo(value){return host.PLMRV24Host.nextPositionCode(d.type,Array.isArray(value)?value:value.positions);}
function createForms(initial,onCommit,options={}){let work=M.clone(initial),dialogStack=[],history=[],inlineUsed=false,inlineCommitted=false;const integrationOptions=options,mount=document.createElement('div');mount.className='v24-native-modals';(options.inlineTarget||document.fullscreenElement||document.body).append(mount);
const $=id=>mount.querySelector('#'+id),clone=M.clone,esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sync=()=>clone(work),fail=e=>{const x=mount.querySelector('.modal-overlay:last-child .modal-error');if(x)x.textContent=e.message||String(e);};
function commit(next){const q=M.validate(next);onCommit(q);work=q;}
function modal(title,eyebrow,build,onSave,options={}){const overlay=document.createElement('div');overlay.className='modal-overlay v24-native-modal';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-label',title);overlay.innerHTML='<div class="modal-card"'+(options.width?' style="width:'+options.width+'px"':'')+'><div class="modal-head"><div><div class="eyebrow-text">'+esc(eyebrow)+'</div><h2>'+esc(title)+'</h2></div><button class="close" aria-label="Kapat">×</button></div><div class="modal-body"></div><div class="modal-footer"><button class="cancel">Vazgeç</button>'+(onSave?'<button class="primary" data-primary-save="true">Kaydet</button>':'')+'</div></div>';
 const previous=document.activeElement;const close=()=>{if(overlay.classList.contains('v26-inline-settings')&&!inlineCommitted){integrationOptions.onCancel?.();return;}overlay.remove();dialogStack=dialogStack.filter(x=>x!==overlay);previous?.focus?.();};overlay.querySelector('.close').onclick=close;overlay.querySelector('.cancel').onclick=close;overlay.onmousedown=e=>{if(e.target===overlay)close();};const body=overlay.querySelector('.modal-body'),error=document.createElement('div');error.className='modal-error';error.setAttribute('role','alert');if(onSave)overlay.querySelector('.primary').onclick=()=>{try{onSave();if(overlay.classList.contains('v26-inline-settings'))inlineCommitted=true;close();}catch(e){error.textContent=e.message||String(e);}};if(integrationOptions.inlineTarget&&!inlineUsed){inlineUsed=true;overlay.classList.add('v26-inline-settings');}mount.append(overlay);dialogStack.push(overlay);build(body,close,overlay);body.append(error);const f=body.querySelector('input,select,button');f?.focus();return {overlay,body,close,error};}
function formRow(parent,label,value,options={}){const row=document.createElement('label');row.className='form-row';row.innerHTML='<span>'+esc(label)+'</span>';let input;if(options.options){input=document.createElement('select');for(const [v,t]of options.options)input.add(new Option(t,v));}else if(options.textarea)input=document.createElement('textarea');else{input=document.createElement('input');input.type=options.type||'text';if(input.type==='number'){input.step=options.step||'any';if(options.min!==undefined)input.min=options.min;if(options.max!==undefined)input.max=options.max;}}input.value=value;input.setAttribute('aria-label',label);if(options.id)input.id=options.id;if(options.placeholder)input.placeholder=options.placeholder;row.append(input);parent.append(row);return input;}
function colorFields(parent,draft,onChange){const row=document.createElement('div');row.className='form-row';row.innerHTML='<span>Sistem Rengi</span><button type="button" class="form-control" id="colorPicker"></button>';parent.append(row);const surfaceRow=document.createElement('div');surfaceRow.className='form-row';surfaceRow.innerHTML='<span>Yüzey</span>';parent.append(surfaceRow);const button=row.querySelector('button');
 function render(){const def=C.isDefaultMaterialValue(draft.systemColor),entry=R.RAL_COLOR_CATALOG.find(r=>r.code===draft.systemColor),wood=!def&&C.resolveColorFamily(draft.systemColor)==='WOOD_TRANSFER';button.innerHTML='<span class="swatch" style="background:'+(def?'#f8fafc':entry?.hex||'#fff')+';'+(def?'border:1px dashed #94a3b8':'')+'"></span>'+esc(draft.systemColor==null?'-':def?'Varsayılan':draft.systemColor)+' · Karteladan Seç';surfaceRow.querySelectorAll('select,.static-value').forEach(e=>e.remove());if(def||wood){const v=document.createElement('span');v.className='static-value';v.textContent=def?(draft.surface==null?'-':'Varsayılan'):'Wood Transfer';surfaceRow.append(v);}else{const select=document.createElement('select');select.id='surface';select.setAttribute('aria-label','Yüzey');select.add(new Option('Yüzey seçin',''));for(const s of ['Parlak','Mat','Texture'])select.add(new Option(s,s));select.value=draft.surface;select.onchange=()=>{draft.surface=select.value;onChange?.();};surfaceRow.append(select);}}
 button.onclick=()=>openRal(draft.systemColor,code=>{Object.assign(draft,C.isDefaultMaterialValue(code)?{systemColor:null,surface:null}:C.selectSystemColor(code));render();onChange?.();if(!C.isDefaultMaterialValue(code)&&C.resolveColorFamily(code)!=='WOOD_TRANSFER')modal('Yüzey Seçimi','RENK',(body,close)=>{body.innerHTML='<p style="font-size:12px">'+esc(code)+' için yüzey seçin.</p>';const bar=document.createElement('div');bar.style.cssText='display:flex;gap:10px';for(const s of ['Parlak','Mat','Texture']){const b=document.createElement('button');b.className='btn-blue';b.textContent=s;b.dataset.surface=s;b.onclick=()=>{draft.surface=s;render();onChange?.();close();};bar.append(b);}body.append(bar);},null,{width:650});});render();return render;}
function openRal(current,onSelect){if(host.PLMRV27UI?.color(current,onSelect))return;let group='standard',query='';modal('RAL Renk Kartelası','RENK',(body,close)=>{body.innerHTML='<div class="ral-search"><input class="form-control" placeholder="RAL / renk kodu ara" aria-label="RAL / renk kodu ara"><button class="btn-blue" id="standardColors">Standart renkler</button><button class="btn-secondary" id="otherColors">Diğer</button></div><div class="ral-count"></div><div class="ral-grid"></div>';
 const standard=new Set(R.RAL_STANDARD_CODES),search=body.querySelector('input');function render(){const base=R.RAL_COLOR_CATALOG.filter(r=>group==='standard'?standard.has(r.code):!standard.has(r.code)),q=query.trim().toLocaleLowerCase('tr-TR'),shown=base.filter(r=>!q||r.code.toLocaleLowerCase('tr-TR').includes(q)||r.name.toLocaleLowerCase('tr-TR').includes(q));body.querySelector('.ral-count').textContent=shown.length+' renk';const grid=body.querySelector('.ral-grid');grid.innerHTML='<button data-code="Varsayılan" class="'+(C.isDefaultMaterialValue(current)?'selected':'')+'"><span class="default-swatch">—</span><span><strong>Varsayılan</strong><small>Şematik teknik görünüm</small></span></button>'+shown.map(r=>'<button data-code="'+esc(r.code)+'" class="'+(current===r.code?'selected':'')+'"><img src="'+esc(r.image)+'" alt="'+esc(r.code)+'" style="background:'+r.hex+'"><span><strong>'+esc(r.code)+'</strong>'+(r.name?'<small>'+esc(r.name)+'</small>':'')+'</span></button>').join('');if(!shown.length)grid.insertAdjacentHTML('beforeend','<p class="modal-note">Aramanızla eşleşen renk bulunamadı.</p>');for(const b of grid.querySelectorAll('button'))b.onclick=()=>{close();onSelect(b.dataset.code);};body.querySelector('#standardColors').className=group==='standard'?'btn-blue':'btn-secondary';body.querySelector('#otherColors').className=group==='other'?'btn-blue':'btn-secondary';}search.oninput=()=>{query=search.value;render();};body.querySelector('#standardColors').onclick=()=>{group='standard';render();};body.querySelector('#otherColors').onclick=()=>{group='other';render();};render();},null);}
function openSettings(scope='common',id,context=null){
 const source=context?.workspace||work,p=source.positions.find(p=>p.id===id),draft=scope==='common'?clone(source.settings):{...source.settings,...p?.overrides};let inputs={},refreshColor,refreshers=[];
 function collect(){for(const [key,input]of Object.entries(inputs)){const f=d.fields.find(f=>f.key===key);draft[key]=input.value===''?null:f?.kind==='number'?Number(input.value):input.value;}}
 modal(scope==='common'?d.label+' Genel Ayarlarını Düzenle':p.positionNo+' Pozu Detay Ayarları',scope==='common'?'ÜRÜN':'POZ',(body)=>{
 const columns=document.createElement('div');columns.className='form-columns';const left=document.createElement('div'),right=document.createElement('div');left.className=right.className='form-table narrow';left.dataset.settingsColumn='system';right.dataset.settingsColumn='material';columns.append(left,right);body.append(columns);
 function field(key,parent){const f=d.fields.find(f=>f.key===key)||{key:'defaultView',label:'Bakış',options:[['OUTSIDE VIEW','Dış Bakış'],['INSIDE VIEW','İç Bakış']]},input=inputs[key]=formRow(parent,f.label,draft[key]??'',{options:f.options?[['','-'],...f.options]:undefined,type:f.kind==='number'?'number':'text',min:f.min,max:f.max,id:key,step:f.kind==='number'?1:undefined,placeholder:'-'});input.required=key===M.requiredKey;
 input.onchange=()=>{collect();if(['doorType','verticalDivisions','horizontalDivisions','horizontalHeightMode','horizontalHeights'].includes(key))draft.divisionLayout='';updateFieldDependencies();};
 if(key==='movingLeafWidth'){const auto=document.createElement('button');auto.type='button';auto.id='autoLeafWidth';auto.className='btn-secondary';auto.textContent='Otomatik';auto.onclick=()=>{input.value='';draft[key]=null;updateFieldDependencies();};input.parentElement.append(auto);}
 if(['doorType','fabricColor'].includes(key))refreshers.push(PLMRSettingsCatalogs.enhance(input,key,{modal,esc,onChange:()=>input.dispatchEvent(new Event('change')),getOptions:()=>M.effective(draft)}));}
 for(const key of d.settingsLayout.left)field(key,left);refreshColor=colorFields(right,draft);for(const key of d.settingsLayout.right)field(key,right);if(d.type==='zip')refreshers.push(PLMRRemoteEditor.render(right,draft));
 function updateFieldDependencies(){const c=M.effective(draft);
 if(['balcony','folding'].includes(d.type)){const k=c.series==='K SERIES';inputs.subtype.disabled=k;inputs.glassThickness.disabled=k;inputs.openingDirection.disabled=c.openingMode==='CENTER';for(const o of inputs.openingDirection.options)o.disabled=o.value==='BOTH'&&c.openingMode!=='CENTER';}
 if(d.type==='fixed')inputs.horizontalHeights.disabled=c.horizontalHeightMode!=='MANUAL';
 if(d.type==='zip'){inputs.placementLocation.disabled=window.PLMR_INTEGRATION_CONTEXT?.kind!=='bioclimatic-facade';inputs.placementLocation.title=inputs.placementLocation.disabled?'Bağımsız zip perdede montaj konumu uygulanmaz.':'';const allowed=c.series==='G SERIES'?['100x100 BOX','110x110 BOX','HERCULE']:['115x115 BOX','130x130 BOX'];for(const o of inputs.subtype.options)o.disabled=!!o.value&&!allowed.includes(o.value);if(draft.subtype&&!allowed.includes(draft.subtype)){draft.subtype=null;inputs.subtype.value='';}}
 if(d.type==='door'){inputs.defaultView.value=draft.defaultView='OUTSIDE VIEW';inputs.defaultView.disabled=true;const kinds=PLMRReferenceGeometry.doorPlan(c.doorType),double=c.doorType.startsWith('DOUBLE');inputs.movingLeafWidth.disabled=!kinds.includes('F');inputs.movingLeafHeight.disabled=!c.doorType.includes('TOP');inputs.activeLeaf.disabled=!double;inputs.hingeDirection.disabled=double;}
 refreshers.forEach(fn=>fn());}
 updateFieldDependencies();
 if(['door','fixed'].includes(d.type)){const customize=document.createElement('button');customize.type='button';customize.id='customizeDivisions';customize.className='btn-blue';customize.textContent='Bölmeleri Özelleştir';customize.style.marginTop='12px';customize.onclick=()=>{try{collect();const position=p||source.positions[0];if(!position)throw Error('Önce poz ölçülerini ve zorunlu seçimlerini girin.');const q=M.resolve({...source,settings:draft},{...position,overrides:{}});PLMRPartitionEditor.open(q,{modal,esc},value=>draft.divisionLayout=value);}catch(e){fail(e);}};body.append(customize);}
 if(scope==='position'){const b=document.createElement('button');b.className='btn-secondary';b.id='resetDefaults';b.textContent='Varsayılan Ayarlara Geri Dön';b.style.marginTop='12px';b.onclick=()=>{Object.assign(draft,clone(source.settings));for(const [key,input]of Object.entries(inputs))input.value=draft[key]??'';refreshColor();updateFieldDependencies();};body.append(b);}
 const note=document.createElement('p');note.className='modal-note';note.textContent='“-” seçilmeyen alanı gösterir; çizimde standart ayar uygulanır, seçilmemiş bilgi çıktıya yazılmaz. Zorunlu: genişlik, yükseklik'+(M.requiredKey==='doorType'?', kapı tipi':M.requiredKey?', açılım tipi':'')+'.';body.append(note);
 },()=>{collect();const c=M.effective(draft);if(!C.canonicalSurface(c.systemColor,c.surface))throw Error('Yüzey seçimi zorunludur.');const next=context?clone(source):sync();if(scope==='common')next.settings=draft;else next.positions.find(x=>x.id===p.id).overrides=M.overrides(next,p,draft);if(context){M.validateDraft(next);context.onSave(next.positions.find(x=>x.id===p.id).overrides);}else commit(next);},{width:920});
}
function openProject(){const draft=clone(work.projectInfo);let inputs={};modal('Proje Bilgilerini Düzenle','PROJE',(body)=>{const table=document.createElement('div');table.className='form-table';body.append(table);for(const [k,label]of [['projectCode','Proje Kodu'],['customerName','Müşteri'],['country','Ülke'],['projectName','Proje Adı'],['revision','Revizyon'],['date','Tarih'],['customerRepresentative','Müşteri Temsilcisi'],['designer','Projeyi Çizen'],['description','Proje Açıklaması']])inputs[k]=formRow(table,label,draft[k],{textarea:k==='description',id:k});},()=>{for(const [k,e]of Object.entries(inputs))draft[k]=e.value;const q=sync();q.projectInfo=draft;commit(q);});}
function openPositions(add=false,focusId=null){const draft=sync();let displayUnit=work.inputUnit,rows=[],wrap,bar;const viewKey=d.fields.some(f=>f.key==='foldingView')?'foldingView':'defaultView';if(add){const p=M.position(nextPositionNo(draft));p.inputUnit=displayUnit;draft.positions.push(p);focusId=p.id;}
const commonColumns=['positionNo','inputUnit','width','height','quantity','view'],extraColumns=d.type==='door'?['requiredChoice']:d.type==='zip'?['motor']:['balcony','folding'].includes(d.type)?['requiredChoice','panels','openingDirection']:[],columns=[...commonColumns,...extraColumns,'description','detail','copy','order','remove'];
// Column sizes and actions follow V53 PositionEditorTable; minimum widths stay fluid.
const widths={requiredChoice:'minmax(110px,1.2fr)',positionNo:'minmax(48px,.62fr)',inputUnit:'minmax(56px,.64fr)',width:'minmax(58px,.78fr)',height:'minmax(58px,.78fr)',quantity:'minmax(42px,.52fr)',view:'minmax(58px,.72fr)',motor:'minmax(66px,.82fr)',panels:'minmax(54px,.64fr)',openingDirection:'minmax(82px,1.10fr)',description:'minmax(82px,1.35fr)',detail:'58px',copy:'62px',order:'58px',remove:'45px'},headings={requiredChoice:d.type==='door'?'KAPI TİPİ *':'AÇILIM TİPİ *',positionNo:'POZ',inputUnit:'BİRİM',width:'GENİŞLİK *',height:'YÜKSEKLİK *',quantity:'ADET',view:'BAKIŞ',motor:'MOTOR YÖNÜ',panels:'PANEL SAYISI',openingDirection:'TOPLANMA YÖNÜ',description:'AÇIKLAMA',detail:'DETAY',copy:'KOPYALA',order:'SIRA',remove:'SİL'};
modal(add?'Poz Ekle':'Poz Ölçülerini Düzenle','POZ',(body)=>{bar=document.createElement('div');bar.className='editor-unit-bar';for(const unit of window.PLMRUnits.positionUnits){const b=document.createElement('button');b.className='btn-secondary';b.textContent=unit;b.dataset.inputUnit=unit;b.onclick=()=>{read();displayUnit=unit;draft.positions.forEach(p=>p.inputUnit=unit);render();};bar.append(b);}body.append(bar);wrap=document.createElement('div');wrap.className='position-editor-scroll v37-position-editor';body.append(wrap);const plus=document.createElement('button');plus.id='editorAdd';plus.className='plmr-add-position-button';plus.setAttribute('aria-label','Poz ekle');plus.textContent='+';plus.onclick=()=>{read();const p=M.position(nextPositionNo(draft));p.inputUnit=displayUnit;draft.positions.push(p);focusId=p.id;render();};body.append(plus);const hint=document.createElement('p');hint.className='modal-note';hint.textContent='Her satırın birimi ve ayarları bağımsızdır. Detay içindeki Kaydet liste taslağını günceller. Bu penceredeki Kaydet tüm değişiklikleri tek işlemde uygular.';body.append(hint);render();},()=>{read();draft.inputUnit=displayUnit;commit(draft);},{width:1480});
function patch(p,key,value){if(value===draft.settings[key])delete p.overrides[key];else p.overrides[key]=value;}
function read(){for(const r of rows){const u=r.unit.value,p=r.p;p.positionNo=r.no.value.trim();p.width=r.w.value===r.originalW?p.width:r.w.value===''?null:Number(window.PLMRUnits.dimensionToMm(r.w.value,u));p.height=r.h.value===r.originalH?p.height:r.h.value===''?null:Number(window.PLMRUnits.dimensionToMm(r.h.value,u));p.quantity=Number(r.qty.value);p.description=r.desc.value;p.inputUnit=u;patch(p,viewKey,r.view.value||null);if(r.requiredChoice)patch(p,M.requiredKey,r.requiredChoice.value||null);if(r.motor)patch(p,'motorDirection',r.motor.value||null);if(r.panels){patch(p,'panels',r.panels.value===''?null:Number(r.panels.value));patch(p,'openingDirection',r.direction.value||null);}}}
function render(){wrap.innerHTML='';rows=[];const table=document.createElement('div');table.setAttribute('role','table');table.setAttribute('aria-label','Poz düzenleme tablosu');table.style.setProperty('--position-editor-columns',columns.map(k=>widths[k]).join(' '));const head=document.createElement('div');head.className='position-editor-header';head.setAttribute('role','row');for(const key of columns){const h=document.createElement('div');h.setAttribute('role','columnheader');h.dataset.column=key;h.textContent=headings[key];head.append(h);}table.append(head);
 draft.positions.forEach((p,index)=>{const row=document.createElement('div');row.className='position-editor-row'+(p.id===focusId?' is-highlighted':'');row.setAttribute('role','row');row.dataset.id=p.id;const q={...draft.settings,...p.overrides},cells={};for(const key of columns){const cell=document.createElement('div');cell.className='editor-cell';cell.setAttribute('role','cell');cells[key]=cell;row.append(cell);}const input=(key,label,value,type='text')=>{const el=document.createElement('input');el.type=type;el.value=value??'';el.setAttribute('aria-label',label);if(type==='number')el.step='any';cells[key].append(el);return el;},select=(key,label,options,value)=>{const el=document.createElement('select');el.setAttribute('aria-label',label);for(const [v,t]of options)el.add(new Option(t,v));el.value=value??'';cells[key].append(el);return el;},unit=p.inputUnit||displayUnit,no=input('positionNo','Poz No',p.positionNo),us=select('inputUnit','Birim',window.PLMRUnits.positionUnits.map(u=>[u,u]),unit),w=input('width','Genişlik',p.width==null?'':window.PLMRUnits.dimensionFromMm(String(p.width),unit),'number'),h=input('height','Yükseklik',p.height==null?'':window.PLMRUnits.dimensionFromMm(String(p.height),unit),'number'),qty=input('quantity','Adet',p.quantity,'number'),view=select('view','Bakış',[['','-'],['INSIDE VIEW','İç'],['OUTSIDE VIEW','Dış']],q[viewKey]),desc=input('description','Açıklama',p.description),r={p,no,unit:us,w,h,qty,view,desc,originalW:w.value,originalH:h.value};w.required=h.required=true;if(M.requiredKey){const f=d.fields.find(f=>f.key===M.requiredKey);r.requiredChoice=select('requiredChoice',f.label,[['','-'],...f.options],q[M.requiredKey]);r.requiredChoice.required=true;}if(d.type==='door'){view.value='OUTSIDE VIEW';view.disabled=true;}qty.step='1';qty.min='1';rows.push(r);
 // Convert using the previously displayed unit before changing the row unit.
 us.onchange=()=>{const next=us.value;us.value=unit;read();p.inputUnit=next;render();};
 if(d.type==='zip')r.motor=select('motor','Motor yönü',[['','-'],['LEFT','Sol'],['RIGHT','Sağ']],q.motorDirection);
 if(extraColumns.includes('panels')){r.panels=input('panels','Panel sayısı',q.panels,'number');r.panels.min=2;r.panels.max=24;r.panels.step=1;r.direction=select('openingDirection','Toplanma yönü',[['','-'],['LEFT','Sola'],['RIGHT','Sağa'],['BOTH','İki yana']],q.openingDirection);const dependency=()=>{r.direction.disabled=r.requiredChoice.value==='CENTER';for(const o of r.direction.options)o.disabled=o.value==='BOTH'&&r.requiredChoice.value!=='CENTER';};r.requiredChoice.onchange=dependency;dependency();}
 const button=(key,text,fn,label)=>{const b=document.createElement('button');b.type='button';b.textContent=text;b.className=key==='remove'?'editor-danger':'editor-action';if(label)b.setAttribute('aria-label',label);b.onclick=()=>{try{fn();}catch(e){b.closest('.modal-overlay').querySelector('.modal-error').textContent=e.message;}};cells[key].append(b);return b;};
 button('detail','Detay',()=>{read();openSettings('position',p.id,{workspace:draft,onSave:overrides=>{p.overrides=overrides;render();}});});button('copy','Kopyala',()=>{read();const q=M.copy(draft,[p.id],true),copy=q.positions.at(-1);copy.positionNo=nextPositionNo(draft);draft.positions.splice(index+1,0,copy);focusId=copy.id;render();});for(const [text,delta]of [['↑',-1],['↓',1]]){const b=button('order',text,()=>{read();const i=draft.positions.findIndex(x=>x.id===p.id),[item]=draft.positions.splice(i,1);draft.positions.splice(i+delta,0,item);render();},p.positionNo+(delta<0?' yukarı':' aşağı'));b.disabled=index+delta<0||index+delta>=draft.positions.length;}button('remove','Sil',()=>{read();draft.positions=draft.positions.filter(x=>x.id!==p.id);render();});table.append(row);});wrap.append(table);for(const b of bar.children){const on=b.dataset.inputUnit===displayUnit;b.classList.toggle('is-on',on);b.setAttribute('aria-pressed',String(on));}}
}


let disposed=false;
function dispose(){
 if(disposed)return;
 disposed=true;
 document.removeEventListener('keydown',key,true);
 observer.disconnect();
 dialogStack=[];
 mount.remove();
}
function cleanup(){if(!mount.childElementCount)dispose();}
function key(e){if(!dialogStack.length)return;if((e.ctrlKey||e.metaKey)&&/^[zya]$/i.test(e.key))e.stopPropagation();if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();dialogStack.at(-1).querySelector('.close').click();}}
document.addEventListener('keydown',key,true);const observer=new MutationObserver(cleanup);observer.observe(mount,{childList:true});
return {positions:(add=false,id)=>{openPositions(add,id);if(options.single){const e=dialogStack.at(-1);e.querySelector('#editorAdd')?.remove();e.querySelectorAll('.position-editor-header>div,.position-editor-row>.editor-cell').forEach((c,i)=>{if(['copy','order','remove'].includes(c.dataset.column)||c.querySelector('.editor-danger')||c.querySelector('[aria-label$=" yukarı"]')||c.querySelector('button')?.textContent==='Kopyala')c.style.display='none';});e.querySelectorAll('input[aria-label="Adet"]').forEach(n=>{n.value=1;n.readOnly=true;});}},settings:(id)=>openSettings(id?'position':'common',id),getState:sync,setSize:(width,height)=>{if(work.positions[0])Object.assign(work.positions[0],{width,height});},submitInline:()=>mount.querySelector('.v26-inline-settings [data-primary-save]')?.click(),close:dispose};}
host.PLMRV24Products=host.PLMRV24Products||{};host.PLMRV24Products[d.type]={scope:window,descriptor:d,model:M,forms:createForms};
})(window);
