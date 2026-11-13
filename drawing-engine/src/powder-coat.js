/* Shared profile coating for all 3D products. */
(function(root){
  'use strict';
  const THREE=root.THREE;
  let grain;
  const woodMaps=new Map();
  const catalog=new Map((root.P3DV_RAL_CATALOG?.all||[]).map(entry=>[entry.code,entry]));
  function woodMap(code){
    if(woodMaps.has(code))return woodMaps.get(code);
    const raw=root.PLMRWoodTextureData?.[code];
    if(!raw)return null;
    const bytes=atob(raw.data);
    const canvas=document.createElement('canvas');
    canvas.width=raw.width;
    canvas.height=raw.height;
    const context=canvas.getContext('2d');
    const image=context.createImageData(raw.width,raw.height);
    for(let i=0,j=0;i<bytes.length;i+=3,j+=4){
      image.data[j]=bytes.charCodeAt(i);
      image.data[j+1]=bytes.charCodeAt(i+1);
      image.data[j+2]=bytes.charCodeAt(i+2);
      image.data[j+3]=255;
    }
    context.putImageData(image,0,0);
    const map=new THREE.CanvasTexture(canvas);
    map.wrapS=map.wrapT=THREE.MirroredRepeatWrapping;
    map.encoding=THREE.sRGBEncoding;
    map.anisotropy=4;
    map.userData={p3dvShared:true,p3dvWoodTransfer:true,p3dvWoodEmbedded:true,p3dvWoodCode:code};
    woodMaps.set(code,map);
    return map;
  }
  // One physical mapping for every coated profile. Shared unit boxes pass their
  // mesh scale; extruded/native profiles already use millimetres. Never mutate a
  // shared unit-box UV with one particular product's dimensions.
  function profileUV(geometry, scale = [1, 1, 1]) {
    const {position, normal, uv} = geometry.attributes;
    if (!position || !normal || !uv) return;
    geometry.computeBoundingBox();
    const {min, max} = geometry.boundingBox;
    const axes = ['x', 'y', 'z'], access = ['getX', 'getY', 'getZ'];
    const lengths = axes.map((axis, i) => (max[axis] - min[axis]) * scale[i]);
    // Precompute each face projection once instead of allocating/sorting per vertex.
    const projections = axes.map((_, flat) =>
      [0, 1, 2].filter(axis => axis !== flat).sort((a, b) => lengths[a] - lengths[b]));
    for (let i = 0; i < position.count; i++) {
      const nx = Math.abs(normal.getX(i)), ny = Math.abs(normal.getY(i)), nz = Math.abs(normal.getZ(i));
      const flat = nx >= ny && nx >= nz ? 0 : ny >= nz ? 1 : 2;
      const [u, v] = projections[flat]; // Source grain runs horizontally (texture U).
      uv.setXY(i,
        (position[access[v]](i) - min[axes[v]]) * scale[v] / 1800,
        (position[access[u]](i) - min[axes[u]]) * scale[u] / Math.max(lengths[u], 1));
    }
    uv.needsUpdate = true;
  }
  const finishes={
    GLOSS:{roughness:.22,metalness:.025,clearcoat:.62,clearcoatRoughness:.18},
    MATTE:{roughness:.64,metalness:.015,clearcoat:.07,clearcoatRoughness:.6},
    TEXTURE:{roughness:.78,metalness:.01,clearcoat:0,clearcoatRoughness:1}
  };
  function texture(){
    if(grain)return grain;
    const size=64,data=new Uint8Array(size*size*4);
    let seed=73461;
    for(let i=0;i<data.length;i+=4){
      seed=(Math.imul(seed,1664525)+1013904223)>>>0;
      const value=98+(seed>>>25&63);
      data.set([value,value,value,255],i);
    }
    grain=new THREE.DataTexture(data,size,size,THREE.RGBAFormat);
    grain.wrapS=grain.wrapT=THREE.RepeatWrapping;
    grain.repeat.set(7,7);
    grain.magFilter=THREE.LinearFilter;
    grain.minFilter=THREE.LinearMipmapLinearFilter;
    grain.generateMipmaps=true;
    grain.userData={...grain.userData,p3dvShared:true};
    grain.needsUpdate=true;
    return grain;
  }
  function create(color,finish,options={}){
    const {colorCode,...materialOptions}=options;
    const code=String(colorCode||'').trim().toUpperCase();
    const entry=catalog.get(code);
    color=entry?.hex||color;
    const map=entry?.kind==='wood-transfer'?woodMap(code):null;
    const key=['GLOSS','PARLAK'].includes(finish)?'GLOSS':finish==='TEXTURE'?'TEXTURE':'MATTE';
    const settings={...finishes[key],...materialOptions};
    if(!map&&key==='TEXTURE')Object.assign(settings,{bumpMap:texture(),bumpScale:.09});
    if(map)Object.assign(settings,{map,roughness:.54,metalness:0,clearcoat:.12,clearcoatRoughness:.55});
    const material=new THREE.MeshPhysicalMaterial({color:map?0xffffff:color,...settings});
    material.userData.woodTransfer=Boolean(map);
    if(map)material.userData.woodCode=code;
    material.userData.plmrPaintColor=new THREE.Color(color).getHex();
    material.color.convertSRGBToLinear();
    // The composite viewer uses the legacy linear output; isolated viewers use sRGB.
    material.onBeforeCompile=(shader,renderer)=>{
      if(renderer.outputEncoding===THREE.LinearEncoding){
        shader.fragmentShader=shader.fragmentShader.replace(
          '#include <encodings_fragment>','gl_FragColor = LinearTosRGB(gl_FragColor);'
        );
      }
    };
    material.customProgramCacheKey=()=> 'PLMR_POWDER_COAT_V24';
    return material;
  }
  root.PLMRPowderCoat=Object.freeze({create,profileUV});
})(window);
