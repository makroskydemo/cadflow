(function(host){'use strict';const window=Object.assign(Object.create(host),host.PLMRV24Libraries),globalThis=window;
Object.defineProperty(window,'crypto',{value:host.crypto});
window.PLMR_INTEGRATION_CONTEXT={kind:'bioclimatic-facade'};
window.PLMR_PRODUCT={
  "name": "plmr_JustKatlanır_v07",
  "id": "PLMR_JUST_KATLANIR",
  "label": "Katlanır Cam",
  "type": "balcony",
  "minWidth": 360,
  "minHeight": 500,
  "fields": [
    {
      "key": "openingMode",
      "label": "Açılım tipi",
      "options": [
        [
          "EDGE",
          "Kenardan Açılım"
        ],
        [
          "CENTER",
          "Merkezden Açılım"
        ]
      ]
    },
    {
      "key": "series",
      "label": "Seri",
      "options": [
        [
          "A SERIES",
          "A Seri"
        ],
        [
          "K SERIES",
          "K Seri"
        ]
      ]
    },
    {
      "key": "subtype",
      "label": "Tip",
      "options": [
        [
          "STANDARD",
          "Standart"
        ],
        [
          "TOP-HUNG",
          "Üstten Askılı"
        ]
      ]
    },
    {
      "key": "panels",
      "label": "Panel sayısı",
      "kind": "number",
      "min": 2,
      "max": 24
    },
    {
      "key": "openingDirection",
      "label": "Toplanma yönü",
      "options": [
        [
          "LEFT",
          "Sola"
        ],
        [
          "RIGHT",
          "Sağa"
        ],
        [
          "BOTH",
          "İki Yana"
        ]
      ]
    },
    {
      "key": "foldingView",
      "label": "Bakış yönü",
      "options": [
        [
          "INSIDE VIEW",
          "İç Bakış"
        ],
        [
          "OUTSIDE VIEW",
          "Dış Bakış"
        ]
      ]
    },
    {
      "key": "foldingOpenDirection",
      "label": "Açılma yönü",
      "options": [
        [
          "INWARD",
          "İçeri"
        ],
        [
          "OUTWARD",
          "Dışarı"
        ]
      ]
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
    }
  ],
  "defaults": {
    "type": "balcony",
    "width": 3000,
    "height": 2575,
    "color": "#0d9488",
    "colorMode": "default",
    "finish": "MATTE",
    "open": false,
    "progress": 0,
    "series": "A SERIES",
    "subtype": "STANDARD",
    "panels": 5,
    "openingDirection": "LEFT",
    "foldingView": "INSIDE VIEW",
    "foldingOpenDirection": "INWARD",
    "glassThickness": "8 MM",
    "glassColor": "TRANSPARENT",
    "defaultView": "INSIDE VIEW",
    "openingMode": "EDGE"
  },
  "reference": {
    "file": "Folding Glass dxf.dxf",
    "sha256": "c921d896130107b1eb4d38997dfc11855a266f2302b433928b5a2ee869ef864a",
    "prefix": "FG",
    "width": 3000,
    "height": 2575,
    "origin": [
      3990.254843866757,
      2223.614609396801
    ],
    "layerColors": {
      "FG - Alt Profil": 5,
      "FG - Bilgilendirme": 7,
      "FG - Dikme": 5,
      "FG - Panel Çerçeve": 5,
      "FG - Cam": 5
    },
    "infoLayer": "FG - Bilgilendirme",
    "labelHeight": 82,
    "sourceTexts": [
      {
        "text": "FG01 - 1 Adet",
        "insert": [
          4125.029843866756,
          4734.614609396801,
          0.0
        ],
        "height": 82.0
      },
      {
        "text": "İÇ BAKIŞ",
        "insert": [
          5487.754843866756,
          4734.614609396801,
          0.0
        ],
        "height": 82.0
      },
      {
        "text": "←",
        "insert": [
          6692.398496112375,
          3464.416044258139,
          0.0
        ],
        "height": 250.0
      },
      {
        "text": "←",
        "insert": [
          6104.398496112375,
          3464.416044258139,
          0.0
        ],
        "height": 250.0
      },
      {
        "text": "←",
        "insert": [
          5516.398496112375,
          3464.416044258139,
          0.0
        ],
        "height": 250.0
      },
      {
        "text": "←",
        "insert": [
          4928.398496112375,
          3464.416044258139,
          0.0
        ],
        "height": 250.0
      },
      {
        "text": "↺",
        "insert": [
          4340.398496112375,
          3464.416044258139,
          0.0
        ],
        "height": 250.0
      }
    ]
  },
  "defaultProfileColor": "#0d9488",
  "settingsLayout": {
    "left": [
      "openingMode",
      "series",
      "subtype",
      "glassThickness",
      "glassColor",
      "panels"
    ],
    "right": [
      "foldingView",
      "openingDirection",
      "foldingOpenDirection"
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
  a.sourceHeight=a.height;a.fitBounds={minX:0,maxX:m.width,minY:m.height-180,maxY:m.height+40};
  const width=textWidth(a.text,a.height);a.textBounds={minX:a.align==='left'?a.x:a.x-width/2,maxX:a.align==='left'?a.x+width:a.x+width/2,minY:a.y-a.height*.95,maxY:a.y+a.height*.95};
  if(q.type==='door'&&a.role==='position'){const view=data.find(t=>t.role==='view'),vw=textWidth('DIŞ BAKIŞ',view?.height||60);if(a.textBounds.maxX>m.width/2-vw/2-20){a.y=m.height-120;a.textBounds.minY=a.y-a.height*.95;a.textBounds.maxY=a.y+a.height*.95;}}
  continue;
 }

 if(!b&&q.type==='zip'){const i=a.role==='view'?1:a.role==='motor'?(q.motorDirection==='LEFT'?0:2):(q.motorDirection==='LEFT'?2:0),gap=Math.min(20,m.width/60);b={minX:i*m.width/3+gap,maxX:(i+1)*m.width/3-gap,minY:m.height-m.metrics.boxHeight+6,maxY:m.height-6};}
 if(!b&&['balcony','folding'].includes(q.type))b={minX:a.role==='position'?30:m.width*.35,maxX:a.role==='position'?m.width*.30:m.width*.65,minY:m.height-124,maxY:m.height-6};
 if(!b&&q.type==='fixed'){const cw=m.metrics.cellWidth;b=a.role==='position'?{minX:80,maxX:50+cw-30,minY:80,maxY:50+m.metrics.clearHeights[0]-30}:{minX:20,maxX:m.width-20,minY:m.height+55,maxY:m.height+165};}
 if(!b)b={minX:20,maxX:m.width-20,minY:Math.max(0,a.y-65),maxY:Math.min(m.height,a.y+65)};
 const chars=Math.max(String(a.text).length,a.role==='view'?9:0),width=b.maxX-b.minX,height=b.maxY-b.minY;
 a.sourceHeight=a.height;a.height=Math.min(a.height,width/(chars*1.05+.5),height/1.9);a.fitBounds=b;a.align='center';a.x=(b.minX+b.maxX)/2;a.y=(b.minY+b.maxY)/2;
 if(['balcony','folding'].includes(q.type)&&a.role==='position'){a.align='left';a.x=b.minX;}
 a.textBounds={minX:a.align==='left'?a.x:a.x-(chars*1.05+.5)*a.height/2,maxX:a.align==='left'?a.x+(chars*1.05+.5)*a.height:a.x+(chars*1.05+.5)*a.height/2,minY:a.y-a.height*.95,maxY:a.y+a.height*.95};
}
return data;};
})(typeof window!=='undefined'?window:globalThis);

/* FG / AG reference: 30mm posts, 130mm head, 50mm sill, 30mm leaf ring. */
(function(root){'use strict';const G=root.PLMRReferenceGeometry;
G.build=function(q,d=root.PLMR_PRODUCT){const m=G.start(q,d),P=d.reference.prefix,W=q.width,H=q.height,N=q.panels,g=G.glazing(q),frameDepth=q.series==='K SERIES'?92:80,innerW=W-60,pw=innerW/N,ph=H-180;if(pw<=70||ph<=100)throw Error('Panel açıklığı profil kalınlıkları için yetersiz.');
G.box(m,'üst profil',P+' - Alt Profil',0,H-130,W,130,{depth:frameDepth,z:-frameDepth});G.box(m,'alt profil',P+' - Alt Profil',0,0,W,50,{depth:frameDepth,z:-frameDepth});G.box(m,'sol dikme',P+' - Dikme',0,50,30,ph,{depth:frameDepth,z:-frameDepth});G.box(m,'sağ dikme',P+' - Dikme',W-30,50,30,ph,{depth:frameDepth,z:-frameDepth});
// Preserve selected-view semantics (as in Sliding). With no view selected, use outside.
// The reference body mirrors X, so its local stack side is the inverse of physical outside.
const inside=Array.isArray(q.selectedOptions)&&q.selectedOptions.includes('foldingView')&&q.foldingView==='INSIDE VIEW';
let direction=N>8?'BOTH':inside?q.openingDirection:({LEFT:'RIGHT',RIGHT:'LEFT'})[q.openingDirection]||q.openingDirection,left=direction==='LEFT'?N:direction==='BOTH'?Math.floor(N/2):0,right=N-left;const pitch=g.leafDepth+33;
for(let i=0;i<N;i++){const owner='leaf-'+i,x=30+i*pw,y=50,side=i<left?'LEFT':'RIGHT',stack=side==='LEFT'?i:N-1-i,count=side==='LEFT'?left:right,anchor=side==='LEFT'?30:W-30,sign=side==='LEFT'?1:-1,parity=stack%2?-1:1;
 m.owners[owner]={kind:d.type==='balcony'?'sequential-fold':'accordion',index:i,stack,count,side,anchor,sign,parity,width:pw,pitch,z:-frameDepth/2,openDirection:q.foldingOpenDirection,closedAnchor:side==='LEFT'?x:x+pw};
 G.ring(m,'panel '+(i+1)+' çerçeve',P+' - Panel Çerçeve',x,y,pw,ph,30,{depth:g.leafDepth,z:-(frameDepth+g.leafDepth)/2,owner});G.box(m,'panel '+(i+1)+' cam',P+' - Cam',x+30,y+30,pw-60,ph-60,{kind:'glass',depth:g.depth,z:-(frameDepth+g.depth)/2,owner});
 G.annotation(m,'movement',x+pw/2+26.143652245619,y+ph/2-6.698565138662,250,{owner,symbol:d.type==='balcony'&&stack===0?'turn':'arrow',direction:side==='LEFT'?'LEFT':'RIGHT',turn:q.foldingOpenDirection==='INWARD'?'CCW':'CW'});
}
G.annotation(m,'position',134.775,H-64,82,{align:'left'});G.annotation(m,'view',W/2-2.5,H-64,82);
m.metrics={panelCount:N,panelWidth:pw,panelHeight:ph,frameDepth,leafDepth:g.leafDepth,postFace:30,topFace:130,bottomFace:50,ringFace:30};return G.finish(m);};
})(typeof window!=='undefined'?window:globalThis);

/* This product has no zip fabric dependencies. */

window.PLMRZipFabricMeta={};

/* V03 dimensions are outside-to-outside product dimensions from the reference DXF. */
(function(root){'use strict';const clone=x=>JSON.parse(JSON.stringify(x));
function validate(raw,d=root.PLMR_PRODUCT){if(!raw||typeof raw!=='object'||Array.isArray(raw))throw Error('Ürün verisi geçersiz.');const q={...clone(d.defaults),...clone(raw)};if(q.type!==d.type)throw Error('Bu dosya farklı ürüne ait.');for(const key of ['width','height'])if(typeof q[key]!=='number'||!Number.isFinite(q[key])||q[key]<(key==='width'?d.minWidth:d.minHeight)||q[key]>1000000)throw Error(key==='width'?'Genişlik geçersiz.':'Yükseklik geçersiz.');if(!/^#[0-9a-f]{6}$/i.test(q.color)||!['default','ral'].includes(q.colorMode)||!['MATTE','GLOSS','TEXTURE','WOOD_TRANSFER'].includes(q.finish))throw Error('Profil malzemesi geçersiz.');if(typeof q.open!=='boolean'||!Number.isFinite(q.progress)||q.progress<0||q.progress>1)throw Error('Hareket durumu geçersiz.');for(const f of d.fields){const v=q[f.key];if(f.options&&!f.options.some(o=>o[0]===v))throw Error(f.label+' geçersiz.');if(f.kind==='number'&&((!Number.isFinite(v)||(f.integer!==false&&!Number.isInteger(v)))||v<f.min||v>f.max))throw Error(f.label+' geçersiz.');if(f.kind==='text'&&typeof v!=='string')throw Error(f.label+' geçersiz.');}if(['balcony','folding'].includes(q.type)){if(q.panels>8)q.openingDirection='BOTH';if(q.series==='K SERIES'){q.subtype='STANDARD';q.glassThickness='INSULATED GLASS';}}root.PLMRReferenceGeometry.build(q,d);return q;}
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
const isLine=a.role==='swing-line';object.position.set(isLine?0:a.x,isLine?0:a.y,z);if(!isLine){object.rotation.y=face==='inner'?Math.PI:0;if(a.role==='movement')object.scale.x=face==='inner'?-1:1;else if(mirrored)object.scale.x=-1;const offset=object.userData.alignOffset||0;if(a.role==='position'&&['balcony','folding'].includes(meta.productType)){object.position.x=face==='outer'?Math.abs(a.x)-Math.abs(offset):-Math.abs(a.x)+Math.abs(offset);}else object.position.x+=offset;}
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
for(const a of G.annotationData(definition,config)){if(a.twoDOnly||['door','fixed'].includes(config.type)&&['fixed-mark','swing-line'].includes(a.role))continue;if(a.role==='position')a.x=definition.width-30;const own=definition.owners[a.owner],ox=own&&['door','accordion','sequential-fold'].includes(own.kind)?G.closedAnchor(own)-definition.width/2:0,oz=own?.z||0,parts=definition.parts.filter(p=>p.owner===a.owner),front=parts.length?Math.max(...parts.map(p=>p.z+p.depth)):0,back=parts.length?Math.min(...parts.map(p=>p.z)):-55,b={...a,x:a.x-definition.width/2-ox,points:a.points?.map(([x,y])=>[x-definition.width/2-ox,y])};for(const o of A.annotationPair(b,owners.get(a.owner),{positionId:config.id||'',positionNo:config.positionNo||'1',productType:config.type},mirrored,front-oz+3,back-oz-3,config.type==='zip'?'outer':'inner'))annotationObjects.push({object:o,owner:a.owner,face:o.userData.face,role:a.role,text:o.userData.text,height:a.height,fitBounds:a.fitBounds,textBounds:a.textBounds});}
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
 function validate(raw,allowIncomplete=false){const w=clone(raw);if(w.settings)w.settings=Object.fromEntries(optionKeys.map(k=>[k,Object.prototype.hasOwnProperty.call(w.settings,k)?w.settings[k]:common()[k]]));if(w.schema!=='plmr-standalone-workspace-v3'||w.version!==3||w.productId!==d.id)throw Error('Bu proje bu ürün için oluşturulmamış.');if(!w.settings||!Array.isArray(w.positions)||w.positions.length>200)throw Error('Poz listesi geçersiz.');if(!w.projectInfo||typeof w.projectInfo!=='object')throw Error('Proje bilgileri geçersiz.');for(const [k,v]of Object.entries(w.projectInfo))if(typeof v!=='string'||v.length>5000)throw Error('Proje bilgisi geçersiz: '+k);if(!['mm','inch','ft'].includes(w.inputUnit))throw Error('Giriş birimi geçersiz.');const l=w.drawingLayout;if(!l||!Number.isInteger(l.columns)||l.columns<1||l.columns>10||!['2D','3D'].includes(l.previewMode)||!l.dimensionUnits||(!l.dimensionUnits.mm&&!l.dimensionUnits.inch&&!l.dimensionUnits.ft))throw Error('Çizim ayarları geçersiz.');if(l.cameraBookmarks!==undefined){if(!Array.isArray(l.cameraBookmarks)||l.cameraBookmarks.length>5)throw Error('3D görünüş listesi geçersiz.');for(const v of l.cameraBookmarks){for(const k of ['position','target','up'])if(!Array.isArray(v[k])||v[k].length!==3||!v[k].every(Number.isFinite))throw Error('Kamera görünüşü geçersiz.');if(!Number.isFinite(v.fov)||v.fov<1||v.fov>179)throw Error('Kamera açısı geçersiz.');}}checkOptions(w.settings);const ids=new Set(),nos=new Set();for(const p of w.positions){if(typeof p.id!=='string'||!p.id||ids.has(p.id))throw Error('Poz kimliği geçersiz veya tekrarlı.');ids.add(p.id);if(typeof p.positionNo!=='string'||!p.positionNo.trim()||p.positionNo.length>40)throw Error('Poz numarası geçersiz.');const no=p.positionNo.trim().toLocaleUpperCase('tr-TR');if(nos.has(no))throw Error('Poz numarası tekrarlı: '+p.positionNo);nos.add(no);if(!Number.isInteger(p.quantity)||p.quantity<1||p.quantity>999999)throw Error('Adet geçersiz.');if(p.inputUnit!==undefined&&!['mm','inch','ft'].includes(p.inputUnit))throw Error('Poz birimi geçersiz.');if(typeof p.description!=='string'||p.description.length>5000||!p.overrides||typeof p.overrides!=='object'||Array.isArray(p.overrides))throw Error('Poz verisi geçersiz.');for(const k of Object.keys(p.overrides))if(!optionKeys.includes(k))throw Error('Bilinmeyen poz ayarı: '+k);checkOptions({...w.settings,...p.overrides});if(!allowIncomplete||!missing(w,p).length)resolve(w,p);}w.applicationVersion='0.7.0';return w;}
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
const mirror=d.type!=='door'&&String(m.view).includes('INSIDE')===(d.type==='zip');if(mirror){const rx=value=>2*x+m.width-value;for(const item of entities.slice(firstEntity)){if(item.points)item.points=item.points.map(([a,b])=>[rx(a),b]);if(item.x!==undefined)item.x=rx(item.x);if(item.x1!==undefined){item.x1=rx(item.x1);item.x2=rx(item.x2);}if(item.align==='left')item.align='right';else if(item.align==='right')item.align='left';if(item.role==='movement'&&item.value)item.value=({'←':'→','→':'←','↺':'↻','↻':'↺'})[item.value]||item.value;for(const key of ['textBounds','fitBounds'])if(item[key]){const b=item[key];item[key]={...b,minX:rx(b.maxX),maxX:rx(b.minX)};}if(item.role==='position'){const b=item.fitBounds;item.x=x+30;item.align='left';const width=item.textBounds.maxX-item.textBounds.minX;item.fitBounds={...b,minX:x+30,maxX:x+m.width*.30};item.textBounds={...item.textBounds,minX:item.x,maxX:item.x+width};}if(item.markCenter)item.markCenter=[rx(item.markCenter[0]),item.markCenter[1]];if(item.markBounds){const b=item.markBounds;item.markBounds={...b,minX:rx(b.maxX),maxX:rx(b.minX)};}}}
entities.push({...N.makeDimension('x',{x,y},{x:x+m.width,y},{x:x+m.width/2,y:y-220},m.width,N.formatDimension(m.width,w.drawingLayout.dimensionUnits),p.id+'-W'),...extra},{...N.makeDimension('y',{x,y},{x,y:y+m.height},{x:x-220,y:y+m.height/2},m.height,N.formatDimension(m.height,w.drawingLayout.dimensionUnits),p.id+'-H'),...extra});positions.push({id:p.id,positionNo:p.positionNo,quantity:p.quantity,view:e.state.selectedOptions?.includes(['balcony','folding'].includes(d.type)?'foldingView':'defaultView')||d.type==='door'?m.view:null,selectedOptions:e.state.selectedOptions,options:Object.fromEntries((e.state.selectedOptions||[]).filter(k=>!d.fields.find(f=>f.key===k)?.internal).map(k=>[k,e.state[k]])),mirrored2D:mirror,width:m.width,height:m.height,origin:{x,y},row:cell.row,column:cell.column,productBounds:{minX:x,minY:y+e.minY,maxX:x+m.width,maxY:y+e.maxY},cellBounds:{minX:x-350,minY:y+e.minY-350,maxX:x+m.width+300,maxY:y+e.maxY+350}});}
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
