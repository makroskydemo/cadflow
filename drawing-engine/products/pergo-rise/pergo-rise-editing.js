(function (root) {
  'use strict';

  const SCHEMA = 'p3dv-pergo-rise-editing-v3';
  const OPERATION_IDS = Object.freeze(['add', 'remove', 'edit', 'resize', 'recalculate']);
  const PRODUCT_FIELDS = Object.freeze({
    sliding_glass: { front: '__slidingPlacements', side: '__sideSlidingPlacements' },
    guillotine_glass: { front: '__guillotinePlacements', side: '__sideGuillotinePlacements' },
    zipper: { front: '__zipScreenPlacements', side: '__sideZipScreenPlacements' },
    zip_screen: { front: '__zipScreenPlacements', side: '__sideZipScreenPlacements' }
  });

  // This inventory is generated from the active PLMR V13.92 buildDrawing contract. 2D-only
  // interactions are retained explicitly instead of being silently treated as 3D geometry.
  const FUNCTION_INVENTORY = Object.freeze([
    { id:'parapet-toggle', label:'Parapet Evet/Hayır', source:['input.parapet','input.parapetHeight'], interactionKinds:['parapetEditor'], canonicalFields:['parapet','parapetHeight','__parapetSegments'], adaptation:'3d-geometry' },
    { id:'parapet-edit', label:'Parapet düzenleme', source:['normalized.parapetSegments','interaction.parapetEditor'], interactionKinds:['parapetEditor'], canonicalFields:['__parapetSegments'], adaptation:'3d-geometry' },
    { id:'top-back-wall-edit', label:'Üst görünüş arka duvar düzenleme', source:['interaction.topBackWallEditor'], interactionKinds:['topBackWallEditor'], canonicalFields:['__topBackWallGridState','__topBackWallSegments'], adaptation:'3d-geometry' },
    { id:'side-back-wall-edit', label:'Yan görünüş duvar düzenleme', source:['interaction.backWallEditor'], interactionKinds:['backWallEditor'], canonicalFields:['__backWallState','__backWallGridState','__backWallSegments'], adaptation:'3d-geometry' },
    { id:'gutter-edit', label:'Oluk düzenleme', source:['interaction.gutterEditor'], interactionKinds:['gutterEditor'], canonicalFields:['__gutterEditState'], adaptation:'3d-geometry' },
    { id:'water-outlet', label:'Su çıkışı ve boru düzenleme', source:['input.waterStandard','input.waterOutletPlacement','interaction.waterPipeEditor'], interactionKinds:['waterPipeEditor'], canonicalFields:['waterStandard','waterOutletPlacement','__waterOutletPipeState'], adaptation:'3d-geometry' },
    { id:'trapez-sheet', label:'Trapez sac sınırı düzenleme', source:['interaction.trapezSheetEditor','normalized.trapezSheetBounds'], interactionKinds:['trapezSheetEditor'], canonicalFields:['__trapezSheetBounds'], adaptation:'3d-geometry', limitation:'PLMR fiziksel levha adedi/hadvesi üretmiyor; sistem başına kapalı sınır üretir.' },
    { id:'front-post', label:'Ön dikme konumu/profili/uzatması', source:['interaction.postEditor','interaction.frontPostProfileEditor'], interactionKinds:['postEditor','frontPostProfileEditor'], canonicalFields:['postCount','__frontPostCenters','__frontPostProfiles','__frontPostExtensions'], adaptation:'3d-geometry' },
    { id:'side-support-post', label:'Yan destek profili ve konumu', source:['normalized.sideSupportGeometry','smartZones.side_gap_zone'], interactionKinds:['glassTrackEditor'], canonicalFields:['__sidePosts','__sideSupportCenters','__sideAutoSupportSuppressed','__glassTrackSupportProfiles'], adaptation:'3d-geometry' },
    { id:'glass-track', label:'Cam kaydı ekleme/çıkarma/düzenleme', source:['input.glassTrack','interaction.glassTrackEditor'], interactionKinds:['glassTrackEditor'], canonicalFields:['glassTrack','__sideFeatureState','__glassTrackProfile','__glassTrackSupportProfiles','__glassTrackLengthOffsets'], adaptation:'3d-geometry' },
    { id:'triangle-joinery', label:'Üçgen doğrama ve bölme adedi', source:['input.triangleJoinery','interaction.triangleEditor'], interactionKinds:['triangleEditor'], canonicalFields:['triangleJoinery','__sideFeatureState','__triangleDivisionState'], adaptation:'3d-geometry' },
    { id:'rail-boundary', label:'Ray sınırlarını daralt', source:['input.glassRayBoundaryMode','normalized.systems[].boundaryMode'], interactionKinds:[], canonicalFields:['glassRayBoundaryMode'], adaptation:'3d-geometry' },
    { id:'rail-axis', label:'Ray ekseni düzenleme', source:['normalized.systems[].rays'], interactionKinds:[], canonicalFields:['rayCount','__customRayPositions'], adaptation:'3d-geometry' },
    { id:'smart-zone', label:'Alan üzerinden ürün/profil işlemleri', source:['drawing.zones','drawing.smartDimensions'], interactionKinds:['productEditor'], canonicalFields:['__slidingPlacements','__sideSlidingPlacements','__guillotinePlacements','__sideGuillotinePlacements','__zipScreenPlacements','__sideZipScreenPlacements','__frontPostCenters','__sidePosts'], adaptation:'3d-geometry' },
    { id:'dimension-edit', label:'PLMR akıllı ölçü düzenleme', source:['drawing.smartDimensions','drawing.dimensionEditRules','drawing.dimensionActions'], interactionKinds:[], canonicalFields:['width','opening','rearHeight','frontHeight','__frontPostCenters','__sidePosts','__parapetSegments'], adaptation:'3d-geometry' },
    { id:'product-instance', label:'Yerleştirilmiş ürün düzenleme/kaldırma', source:['interaction.productEditor'], interactionKinds:['productEditor'], canonicalFields:['__slidingPlacements','__sideSlidingPlacements','__guillotinePlacements','__sideGuillotinePlacements','__zipScreenPlacements','__sideZipScreenPlacements'], adaptation:'3d-geometry' },
    { id:'side-view-selection', label:'Bağımsız yan görünüş seçimi/görünürlüğü', source:['interaction.sideViewSelector','interaction.sideViewEnable','interaction.sideViewEnvelope'], interactionKinds:['sideViewSelector','sideViewEnable','sideViewEnvelope'], canonicalFields:['__independentSideViewVisibility'], adaptation:'3d-metadata', note:'2D görünüş seçimi; 3D fiziksel geometri üretmez.' },
    { id:'upper-table', label:'Üst bilgi tablosu dönüşümü', source:['interaction.upperTableEditor'], interactionKinds:['upperTableEditor'], canonicalFields:['__upperTableTransform','customer','project','version','date','drawnBy'], adaptation:'2d-only', note:'DXF üst bilgi tablosudur; 3D sahnede fiziksel nesne değildir.' },
    { id:'dimension-visibility', label:'Ölçü gizleme/gösterme', source:['input.__hiddenDimensionIds'], interactionKinds:[], canonicalFields:['__hiddenDimensionIds'], adaptation:'3d-metadata', note:'3D ana/ara ölçü katmanı tarafından tüketilir.' }
  ]);

  const KIND_TO_TARGET = Object.freeze({
    'rear-wall':'wall', 'parapet':'parapet', 'water-outlet':'water-outlet', 'glass-track':'glass-track',
    'triangle-joinery':'triangle-joinery', 'post':'post', 'side-support-post':'side-support-post',
    'gutter':'gutter', 'rail':'rail', 'rail-rear-mechanism':'rail-part', 'rail-front-head':'rail-part',
    'wall-connection':'rail-part', 'roof-register-profile':'roof-register-profile', 'fabric-profile':'fabric-profile',
    'rear-profile':'structural-profile', 'front-profile':'structural-profile', 'post-upper-connection':'post-accessory',
    'post-lower-connection':'post-accessory', 'trapez-sheet':'trapez-sheet', 'fabric-stack':'fabric-stack',
    'placed-product':'product', 'area-product':'product'
  });

  function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function object(value) { return value && typeof value === 'object' && !Array.isArray(value) ? value : {}; }
  function array(value) { return Array.isArray(value) ? value : []; }
  function finite(value, fallback) { const n=Number(value); return Number.isFinite(n)?n:(fallback==null?0:fallback); }
  function canonicalProfile(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return value == null ? value : clone(value);
    const next=clone(value);
    if (String(next.mode||'').trim().toLowerCase()==='custom') next.mode='other';
    return next;
  }
  function normalizeState(raw) {
    const source=object(raw);
    return {
      schema:SCHEMA,
      revision:Math.max(0,Math.floor(finite(source.revision,0))),
      selectedTargetId:source.selectedTargetId?String(source.selectedTargetId):null,
      lastChangedPaths:array(source.lastChangedPaths).map(String).slice(-50),
      areaProfileOrigins:object(source.areaProfileOrigins),
      history:array(source.history).map(clone).slice(-200)
    };
  }
  function recordState(input, request, paths) {
    const state=normalizeState(input.__editingState);
    state.revision+=1;
    state.selectedTargetId=request&&request.target&&request.target.id?String(request.target.id):null;
    state.lastChangedPaths=Array.from(new Set(array(paths).map(String)));
    state.history.push({revision:state.revision,operation:String(request&&request.operation||request&&request.areaAction||''),targetId:state.selectedTargetId,changedPaths:state.lastChangedPaths.slice(),at:new Date().toISOString()});
    input.__editingState=state;
    return state;
  }
  function buildDrawing(input) {
    if (!root.PulumurGeometry || typeof root.PulumurGeometry.buildDrawing!=='function') return null;
    try { return root.PulumurGeometry.buildDrawing(input||{}); } catch (_) { return null; }
  }
  function interactionKey(entity,index) {
    const d=object(entity&&entity.data), kind=String(entity&&entity.kind||'interaction');
    return [kind,d.waterPipeId,d.parapetSegmentId,d.wallCellId,d.placementId,d.sideViewKey,d.systemIndex,d.postIndex,index].filter(v=>v!==undefined&&v!==null&&v!=='').join(':');
  }
  function interactionMap(drawing) {
    const map=new Map();
    array(drawing&&drawing.entities).filter(e=>e&&e.type==='interaction').forEach((e,i)=>{
      const item={kind:String(e.kind||''),data:clone(e.data||{}),bounds2d:{x:finite(e.x),y:finite(e.y),w:Math.max(0,finite(e.w)),h:Math.max(0,finite(e.h))},key:interactionKey(e,i)};
      if(!map.has(item.kind))map.set(item.kind,[]); map.get(item.kind).push(item);
    });
    return map;
  }
  function opsForKind(kind) {
    const map={
      wall:['remove','edit','resize','recalculate'], parapet:['edit','resize','recalculate'], gutter:['edit','resize','recalculate'],
      'water-outlet':['remove','edit','resize','recalculate'], 'glass-track':['edit','resize','recalculate'],
      'triangle-joinery':['edit','recalculate'], post:['remove','edit','resize','recalculate'],
      'side-support-post':['remove','edit','resize','recalculate'], rail:['edit','recalculate'],
      'trapez-sheet':['edit','resize','recalculate'], product:['remove','edit','resize','recalculate'],
      'roof-register-profile':['recalculate'], 'fabric-profile':['recalculate'], 'rail-part':['recalculate'],
      'structural-profile':['recalculate'], 'post-accessory':['recalculate'], 'fabric-stack':['recalculate']
    };
    return (map[kind]||['recalculate']).slice();
  }
  function nearest(items,predicate) { return array(items).find(predicate)||null; }
  function interactionForComponent(component, imap) {
    const kind=String(component&&component.kind||''), id=String(component&&component.id||'');
    if(kind==='trapez-sheet') return nearest(imap.get('trapezSheetEditor'),x=>Number(x.data.systemIndex)===Number(component.systemIndex));
    if(kind==='post') return nearest(imap.get('postEditor'),x=>Number(x.data.postIndex)===Number(component.postIndex));
    if(kind==='gutter') return nearest(imap.get('gutterEditor'),x=>!component.independentGroupId||String(x.data.independentGroupId||'')===String(component.independentGroupId||'')) || array(imap.get('gutterEditor'))[0]||null;
    if(kind==='water-outlet') {
      const candidates=array(imap.get('waterPipeEditor'));
      const physicalId=String(component.waterPipeId||'');
      const token=id.replace(/^.*water-outlet-/,'').replace(/-/g,'_');
      return candidates.find(x=>physicalId&&String(x.data.waterPipeId||'')===physicalId)||candidates.find(x=>String(x.data.waterPipeId||'').endsWith(token))||candidates.find(x=>Number(x.data.waterPipeSystemIndex)===Number(component.systemIndex)&&Number(x.data.waterPipeRayIndex)===Number(component.railIndex))||null;
    }
    if(kind==='glass-track') return nearest(imap.get('glassTrackEditor'),x=>id.endsWith('-'+String(x.data.sideViewKey||x.data.scope||'')));
    if(kind==='triangle-joinery') return nearest(imap.get('triangleEditor'),x=>id.includes('-'+String(x.data.sideViewKey||'')+'-'));
    if(kind==='parapet') return nearest(imap.get('parapetEditor'),x=>id.includes(String(x.data.parapetSegmentId||''))&&String(x.data.parapetView||'')!=='top-back-wall');
    if(kind==='area-product'||kind==='placed-product') return nearest(imap.get('productEditor'),x=>String(x.data.placementId||'')===String(component.placementId||''));
    if(kind==='rear-wall') return nearest(imap.get('topBackWallEditor'),x=>Number(x.data.systemIndex)===Number(component.systemIndex));
    return null;
  }
  function canonicalPathFor(component, interaction) {
    const kind=String(component&&component.kind||'');
    if(kind==='trapez-sheet')return `input.__trapezSheetBounds.${Number(component.systemIndex)||0}`;
    if(kind==='post')return `input.__frontPostCenters[${Number(component.postIndex)||0}]`;
    if(kind==='gutter')return 'input.__gutterEditState';
    if(kind==='water-outlet')return `input.__waterOutletPipeState.${interaction&&interaction.data&&interaction.data.waterPipeId||component.id}`;
    if(kind==='glass-track')return 'input.__glassTrackProfile + input.__glassTrackLengthOffsets';
    if(kind==='triangle-joinery')return 'input.__triangleDivisionState';
    if(kind==='parapet')return 'input.__parapetSegments';
    if(kind==='rear-wall')return 'input.__topBackWallGridState';
    if(kind==='rail')return `input.__customRayPositions.${Number(component.systemIndex)||0}`;
    return 'derived-from-PLMR-normalized-input';
  }
  function targetForComponent(component, imap) {
    if(!component||!component.id)return null;
    const targetType=KIND_TO_TARGET[component.kind]||'structural-profile';
    const interaction=interactionForComponent(component,imap);
    const sideInteraction=String(component.kind||'')==='rear-wall'
      ? nearest(imap.get('backWallEditor'),x=>Number(x.data.sideIndex)===Number(component.systemIndex) || (String(x.data.sideViewKey||'')==='right' && Number(component.systemIndex)===Number(component.systemCount)-1)) : null;
    return {
      id:String(component.id), targetType, componentKind:String(component.kind||''), label:String(component.label||component.id),
      systemIndex:Number.isFinite(Number(component.systemIndex))?Number(component.systemIndex):null,
      positionId:component.positionId||null, postIndex:Number.isFinite(Number(component.postIndex))?Number(component.postIndex):null,
      railIndex:Number.isFinite(Number(component.railIndex))?Number(component.railIndex):null, sideViewKey:component.sideViewKey||null, profileId:component.profileId||null, sidePostIndex:Number.isFinite(Number(component.sidePostIndex))?Number(component.sidePostIndex):null,
      operations:opsForKind(targetType), menuActions:targetType==='product'?[{id:'remove',label:'Ürün Kaldır'},{id:'resize',label:'Ölçüyü Düzenle'},{id:'recalculate',label:'Yeniden Hesapla'}]:null, selectable:true, canonicalPath:canonicalPathFor(component,interaction),
      plmrInteraction:interaction?clone(interaction):null, plmrSideInteraction:sideInteraction?clone(sideInteraction):null, sourceRuleIds:clone(component.sourceRuleIds||[]),
      geometrySnapshot:clone({start:component.start,end:component.end,position:component.position,corners:component.corners,polygonXZ:component.polygonXZ,bottomY:component.bottomY,topY:component.topY,profileWidthX:component.profileWidthX,profileDepthZ:component.profileDepthZ})
    };
  }
  function tokenAt(text,index) { const m=String(text==null?'':text).match(/NO|\d+(?:\.\d+)?/gi)||[]; return finite(m[index],finite(m[m.length-1],0)); }
  function replaceToken(text,index,value) {
    let seen=-1,done=false;
    const out=String(text==null?'':text).replace(/NO|\d+(?:\.\d+)?/gi,m=>{seen+=1;if(seen===index){done=true;return String(Math.round(Number(value)));}return m;});
    if(done)return out;
    const count=Math.max(0,index-seen); return out+(out?';':'')+Array(count).fill(String(Math.round(Number(value)))).join(';');
  }
  function zoneMeta(zone, dimensions) { return array(dimensions).find(d=>String(d.relatedZoneId||'')===String(zone.id||''))||null; }
  function zoneIndex(zone, dim) {
    const id=String(zone&&zone.id||''); let m;
    if((m=id.match(/^front_gap_post_(\d+)_post_/)))return {scope:'front',gapIndex:Math.max(0,Number(m[1])-1),positionIndex:Math.max(0,Number(m[1])-1)};
    if((m=id.match(/^top_system_(\d+)_zone$/)))return {scope:'top',gapIndex:Math.max(0,Number(m[1])-1),positionIndex:Math.max(0,Number(m[1])-1)};
    if((m=id.match(/^side_gap_zone_([^_]+)_(\d+)_(\d+)$/)))return {scope:'side',sideViewKey:m[1],sideIndex:Number(m[2]),gapIndex:Number(m[3]),positionIndex:Number(m[2])};
    return {scope:String(zone&&zone.view||'').toLowerCase()==='front'?'front':'dimension',gapIndex:Number(dim&&dim.index)||0,positionIndex:Number(dim&&dim.index)||0,sideViewKey:dim&&dim.sideViewKey,sideIndex:Number(dim&&dim.sideIndex)||0};
  }
  function zoneBounds(zone, dim, normalized) {
    const K=root.PulumurGeometry&&root.PulumurGeometry.K||{};
    const originX=finite(K.systemStartX)+finite(normalized&&normalized.width)/2;
    const info=zoneIndex(zone,dim), positions=array(normalized&&normalized.positions);
    if(info.scope==='top') {
      const systems=array(normalized&&normalized.systems), sys=systems[Math.max(0,Math.min(info.positionIndex,Math.max(0,systems.length-1)))]||systems[0]||{};
      const p=positions[Math.max(0,Math.min(info.positionIndex,Math.max(0,positions.length-1)))]||positions[0]||{};
      const left=finite(sys.mechanismStartX,finite(sys.outerStartX,finite(normalized&&normalized.systemStartX)));
      const right=finite(sys.mechanismEndX,finite(sys.outerEndX,finite(normalized&&normalized.systemEndX)));
      const y0=Math.min(finite(p.frontHeight,finite(normalized&&normalized.frontHeight)),finite(p.rearHeight,finite(normalized&&normalized.rearHeight)));
      const y1=Math.max(finite(p.frontHeight,finite(normalized&&normalized.frontHeight)),finite(p.rearHeight,finite(normalized&&normalized.rearHeight)));
      const opening=Math.max(1,finite(p.opening,finite(normalized&&normalized.maxOpening)));
      return {minX:left-originX,maxX:right-originX,minY:y0,maxY:y1,minZ:0,maxZ:opening,netWidth:Math.max(1,finite(zone.distance,right-left)),netHeight:opening,face:'top',plmrMinX:left,plmrMaxX:right};
    }
    if(info.scope==='front') {
      const centers=array(normalized&&normalized.postCenterXs), widths=array(normalized&&normalized.frontPostWidths);
      const i=Math.max(0,Math.min(info.gapIndex,Math.max(0,centers.length-2)));
      const left=finite(centers[i],finite(normalized&&normalized.systemStartX))+finite(widths[i],100)/2;
      const right=finite(centers[i+1],finite(normalized&&normalized.systemEndX))-finite(widths[i+1],100)/2;
      const center=(left+right)/2, systems=array(normalized&&normalized.systems);
      const system=systems.find(item=>center>=finite(item&&item.outerStartX)-0.001&&center<=finite(item&&item.outerEndX)+0.001)||systems[0]||{};
      const systemIndex=Math.max(0,Math.min(Number(system.index)||0,Math.max(0,positions.length-1)));
      const p=positions[systemIndex]||positions[0]||{};
      const first=positions[0]||{};
      const rearStartAligned=Boolean(normalized&&normalized.independentMode&&String(p.yAlignmentMode||'')==='REAR_START_ALIGNED');
      const z=rearStartAligned?finite(p.opening,finite(normalized&&normalized.maxOpening)):finite(first.opening,finite(normalized&&normalized.maxOpening));
      const h=Math.max(1,finite(p.frontHeight,finite(normalized&&normalized.frontHeight)));
      return {minX:left-originX,maxX:right-originX,minY:0,maxY:h,minZ:z,maxZ:z,netWidth:Math.max(1,finite(zone.distance,right-left)),netHeight:h,face:'front',plmrMinX:left,plmrMaxX:right,systemIndex,positionId:String(p.positionId||'')};
    }
    if(info.scope==='side') {
      const geom=String(info.sideViewKey)==='right'?normalized&&normalized.rightSideSupportGeometry:normalized&&normalized.sideSupportGeometry&&normalized.sideSupportGeometry[String(info.sideViewKey)];
      const gap=geom&&array(geom.gaps)[info.gapIndex]; const p=positions[info.sideIndex]||positions[0]||{};
      const sys=array(normalized&&normalized.systems)[info.sideIndex]||array(normalized&&normalized.systems)[0]||{};
      const x=String(info.sideViewKey)==='right'?finite(sys.outerEndX)-originX:finite(sys.outerStartX)-originX;
      const z0=Math.max(0,-finite(gap&&gap.right)), z1=Math.max(z0+1,-finite(gap&&gap.left));
      const h=Math.max(1,finite(geom&&geom.productClearHeight,finite(p.frontHeight)));
      return {minX:x,maxX:x,minY:0,maxY:h,minZ:z0,maxZ:z1,netWidth:Math.max(1,finite(zone.distance,finite(gap&&gap.width))),netHeight:h,face:String(info.sideViewKey)==='right'?'right':'left',plmrGap:clone(gap||{}),sideViewKey:info.sideViewKey,sideIndex:info.sideIndex,sideGapIndex:info.gapIndex};
    }
    const p=positions[Number(dim&&dim.index)||0]||positions[0]||{};
    return {minX:-50,maxX:50,minY:0,maxY:Math.max(1,finite(p.frontHeight,1000)),minZ:0,maxZ:Math.max(1,finite(p.opening,1000)),netWidth:Math.max(1,finite(zone&&zone.distance,1000)),netHeight:Math.max(1,finite(p.frontHeight,1000)),face:'metadata'};
  }
  function placementMatches(input, info, type) {
    const fields=PRODUCT_FIELDS[type]; if(!fields)return null;
    const field=info.scope==='side'?fields.side:fields.front;
    return array(input&&input[field]).find(p=>info.scope==='side'
      ? String(p.sideViewKey||'')===String(info.sideViewKey||'')&&Number(p.sideGapIndex||0)===Number(info.gapIndex||0)
      : Number(p.gapIndex||0)===Number(info.gapIndex||0))||null;
  }
  function placedForZone(input, zone, dim) {
    const info=zoneIndex(zone,dim);
    for(const type of Object.keys(PRODUCT_FIELDS)){const item=placementMatches(input,info,type);if(item)return {type,item};}
    return null;
  }
  function areaTargets(input, normalized, drawing) {
    const dimensions=array(drawing&&drawing.smartDimensions);
    return array(drawing&&drawing.zones).filter(z=>z&&(z.canPlaceProduct||z.canAddProfile||z.editable)).map(zone=>{
      const dim=zoneMeta(zone,dimensions), info=zoneIndex(zone,dim), b=zoneBounds(zone,dim,normalized), placed=placedForZone(input,zone,dim);
      const menu=[];
      if(zone.canPlaceProduct)menu.push({id:'product-add',label:'Ürün Ekle',allowedProducts:clone(zone.allowedProducts||[])});
      if(placed)menu.push({id:'product-remove',label:'Ürün Kaldır'});
      if(zone.canAddProfile)menu.push({id:'profile-add',label:'Profil Ekle',allowedProfiles:clone(zone.allowedProfiles||[])});
      if(zone.occupiedProfile)menu.push({id:'profile-remove',label:'Profil Kaldır'});
      if(dim&&dim.editable&&dim.canResize)menu.push({id:'resize',label:'Ölçüyü Düzenle'});
      menu.push({id:'recalculate',label:'Yeniden Hesapla'});
      const targetSystemIndex=Number.isFinite(Number(b.systemIndex))?Number(b.systemIndex):(Number.isFinite(Number(info.positionIndex))?Number(info.positionIndex):null);
      const targetPositionId=String(b.positionId||array(normalized&&normalized.positions)[targetSystemIndex]&&array(normalized.positions)[targetSystemIndex].positionId||'');
      return {id:`plmr-zone:${zone.id}`,plmrZoneId:String(zone.id),targetType:'area',componentKind:'smart-zone',label:String(dim&&dim.label||zone.id),view:zone.view||'',systemIndex:targetSystemIndex,positionId:targetPositionId,operations:menu.map(x=>x.id),menuActions:menu,selectable:true,canonicalPath:'PLMR.buildDrawing().zones + PLMR.buildDrawing().smartDimensions',plmrZone:clone(zone),plmrDimension:clone(dim),zoneInfo:{...clone(info),positionIndex:targetSystemIndex},bounds:{minX:b.minX,maxX:b.maxX,minY:b.minY,maxY:b.maxY,minZ:b.minZ,maxZ:b.maxZ},netWidth:b.netWidth,netHeight:b.netHeight,face:b.face,plmrGeometry:clone(b),occupiedProduct:!!placed,placedProduct:clone(placed)};
    });
  }
  function dimensionTargets(drawing) {
    return array(drawing&&drawing.smartDimensions).filter(d=>d&&d.editable).map(d=>({id:`plmr-dimension:${d.dimId}`,targetType:'dimension',componentKind:'smart-dimension',label:String(d.label||d.dimId),operations:d.canResize?['resize','recalculate']:['recalculate'],menuActions:d.canResize?[{id:'resize',label:'Ölçüyü Düzenle'},{id:'recalculate',label:'Yeniden Hesapla'}]:[{id:'recalculate',label:'Yeniden Hesapla'}],selectable:false,canonicalPath:`PLMR.smartDimensions.${d.dimId}`,plmrDimension:clone(d)}));
  }
  function productTargets(drawing) {
    return array(drawing&&drawing.entities).filter(e=>e&&e.type==='interaction'&&e.kind==='productEditor').map((e,i)=>({id:`plmr-product:${e.data&&e.data.placementId||i}`,targetType:'product',componentKind:'placed-product',label:`${e.data&&e.data.productType||'Ürün'} · ${e.data&&e.data.placementId||i}`,operations:['remove','edit','resize','recalculate'],menuActions:[{id:'remove',label:'Ürün Kaldır'},{id:'resize',label:'Ölçüyü Düzenle'},{id:'recalculate',label:'Yeniden Hesapla'}],selectable:true,canonicalPath:'input.__*Placements',plmrInteraction:{kind:'productEditor',data:clone(e.data||{}),bounds2d:{x:finite(e.x),y:finite(e.y),w:finite(e.w),h:finite(e.h)}}}));
  }
  function buildCanonical(input, normalized, components) {
    const drawing=buildDrawing(input)||{}; const imap=interactionMap(drawing); const state=normalizeState(input&&input.__editingState);
    const componentTargets=array(components).map(c=>targetForComponent(c,imap)).filter(Boolean);
    const componentPlacementIds=new Set(componentTargets.filter(t=>t.targetType==='product').map(t=>String(t.plmrInteraction&&t.plmrInteraction.data&&t.plmrInteraction.data.placementId||'')));
    const orphanProductTargets=productTargets(drawing).filter(t=>!componentPlacementIds.has(String(t.plmrInteraction&&t.plmrInteraction.data&&t.plmrInteraction.data.placementId||'')));
    const targets=componentTargets.concat(areaTargets(input||{},normalized||{},drawing),dimensionTargets(drawing),orphanProductTargets);
    const interactionKinds=Array.from(imap.keys()).sort();
    const covered=new Set(FUNCTION_INVENTORY.flatMap(x=>x.interactionKinds||[]));
    return {schema:SCHEMA,inventory:clone(FUNCTION_INVENTORY),operations:clone(OPERATION_IDS),state,targets,
      conditionalOptions:{parapet:String(input&&input.parapet||'HAYIR'),waterStandard:String(input&&input.waterStandard||'EVET'),waterOutletPlacement:String(input&&input.waterOutletPlacement||'BOTH'),glassTrack:String(input&&input.glassTrack||'HAYIR'),triangleJoinery:String(input&&input.triangleJoinery||'HAYIR'),glassRayBoundaryMode:String(input&&input.glassRayBoundaryMode||'DARALT')},
      plmrAudit:{zoneCount:array(drawing.zones).length,smartDimensionCount:array(drawing.smartDimensions).length,profileInstanceCount:array(drawing.profileInstances).length,interactionKinds,unmappedInteractionKinds:interactionKinds.filter(k=>!covered.has(k)),sourceRuntime:'PLMR V13.92 Web DXF peri01Geometry.js'},
      capabilities:{selection:true,highlight:true,contextMenu:true,canonicalMutation:true,partialSceneReconcile:true}};
  }
  function ensureArray(input,field){if(!Array.isArray(input[field]))input[field]=[];return input[field];}
  function sideSet(raw,key,value){const src=object(raw);if(String(key)==='right')src.right=value;else if(String(key)==='0')src.left=value;else{src.middle=object(src.middle);src.middle[String(key)]=value;}return src;}
  function productField(type,scope){const f=PRODUCT_FIELDS[type]||PRODUCT_FIELDS.sliding_glass;return scope==='side'?f.side:f.front;}
  function addProduct(input,target,payload,paths){
    const zone=target.plmrZone||{}, dim=target.plmrDimension||{}, info=target.zoneInfo||zoneIndex(zone,dim);
    const allowed=array(zone.allowedProducts); let type=String(payload.productType||allowed[0]||'sliding_glass'); if(!allowed.includes(type)&&allowed.length)type=allowed[0]; if(!PRODUCT_FIELDS[type])throw new Error('PLMR alanı bu ürün türünü desteklemiyor: '+type);
    const field=productField(type,info.scope); ensureArray(input,field);
    for(const t of Object.keys(PRODUCT_FIELDS)){const other=productField(t,info.scope);input[other]=array(input[other]).filter(p=>info.scope==='side'?!((String(p.sideViewKey||'')===String(info.sideViewKey||''))&&(Number(p.sideGapIndex||0)===Number(info.gapIndex||0))):Number(p.gapIndex||0)!==Number(info.gapIndex||0));paths.push(`input.${other}`);}
    const width=Math.max(1,finite(payload.width,target.netWidth)),height=Math.max(1,finite(payload.height,target.netHeight));
    const base={id:String(payload.id||`${type}_${info.scope}_${info.sideViewKey||''}_${info.gapIndex}_${Date.now()}`),gapIndex:Number(info.gapIndex)||0,width,height,pozNo:String(payload.pozNo||`${type==='guillotine_glass'?'G':'S'}${String(array(input[field]).length+1).padStart(2,'0')}`)};
    if(info.scope==='side')Object.assign(base,{placementView:String(info.sideViewKey)==='right'?'side-right':'side-left',sideViewKey:String(info.sideViewKey),sideIndex:Number(info.sideIndex)||0,sideGapIndex:Number(info.gapIndex)||0,sideZone:`gap_${Number(info.gapIndex)||0}`});
    if(type==='sliding_glass')Object.assign(base,{series:'A SERIES',type:'WITH THRESHOLD',openingType:'SIDE OPENING',glassThickness:'10 MM',glassColor:'TRANSPARENT',panelCount:Math.max(2,Math.round(width/1000)),panelCountMode:'AUTO',quantity:1,leftPostStandard:true});
    if(type==='guillotine_glass')Object.assign(base,{series:'A SERIES',type:'STANDARD',mechanism:'CHAIN',glassThickness:'8 MM',glassColor:'TRANSPARENT',panelCount:'1+1',motorDirection:'RIGHT',view:'INSIDE VIEW',motorType:'SOMFY RTS',remoteControl:'1 CHANNEL',quantity:1,leftPostStandard:true});
    ensureArray(input,field).push(base); paths.push(`input.${field}`);
  }
  function removeProduct(input,target,paths){
    const data=target.plmrInteraction&&target.plmrInteraction.data||target.placedProduct&&target.placedProduct.item||{}; const placementId=String(data.placementId||data.id||target.placedProduct&&target.placedProduct.item&&target.placedProduct.item.id||'');
    const info=target.zoneInfo||{};
    Object.values(PRODUCT_FIELDS).flatMap(x=>[x.front,x.side]).forEach(field=>{const before=array(input[field]);const after=before.filter(p=>placementId?String(p.id)!==placementId:(info.scope==='side'?!((String(p.sideViewKey||'')===String(info.sideViewKey||''))&&Number(p.sideGapIndex||0)===Number(info.gapIndex||0)):Number(p.gapIndex||0)!==Number(info.gapIndex||0)));if(after.length!==before.length){input[field]=after;paths.push(`input.${field}`);}});
  }
  function editProduct(input,target,payload,paths){
    const data=target.plmrInteraction&&target.plmrInteraction.data||{};
    const placementId=String(data.placementId||data.id||'');
    if(!placementId)throw new Error('PLMR ürün kimliği bulunamadı.');
    let found=false;
    Object.values(PRODUCT_FIELDS).flatMap(x=>[x.front,x.side]).forEach(field=>{
      const list=array(input[field]).slice();const ix=list.findIndex(item=>String(item&&item.id||'')===placementId);
      if(ix<0)return;
      const next={...list[ix]};
      if(Number.isFinite(Number(payload.width)))next.width=Math.max(1,Number(payload.width));
      if(Number.isFinite(Number(payload.height)))next.height=Math.max(1,Number(payload.height));
      const editable=['series','type','openingType','glassThickness','glassColor','panelCount','panelCountMode','motorDirection','view','motorType','remoteControl','mountingLocation','fabricColor','cableExitDirection','sizeMode'];
      editable.forEach(key=>{if(payload[key]!==undefined)next[key]=payload[key];});
      list[ix]=next;input[field]=list;paths.push(`input.${field}`);found=true;
    });
    if(!found)throw new Error('PLMR ürün yerleşimi bulunamadı: '+placementId);
  }
  function addProfile(input,target,payload,normalized,paths){
    const info=target.zoneInfo||{}, b=target.plmrGeometry||{};
    if(info.scope==='front'){
      const centers=array(normalized.postCenterXs).map(Number);const center=(finite(b.plmrMinX)+finite(b.plmrMaxX))/2;if(centers.some(x=>Math.abs(x-center)<0.01))return;
      const oldProfiles=array(normalized.frontPostProfiles).length?array(normalized.frontPostProfiles):array(input.__frontPostProfiles);
      const oldExtensions=array(normalized.frontPostExtensions).length?array(normalized.frontPostExtensions):array(input.__frontPostExtensions);
      const rows=centers.map((axis,index)=>({axis,profile:clone(oldProfiles[index]||null),extension:finite(oldExtensions[index],0)}));
      const nearestRow=rows.slice().sort((a,b)=>Math.abs(a.axis-center)-Math.abs(b.axis-center))[0];
      const insertedProfile=payload.profile?canonicalProfile(payload.profile):(String(payload.profileType||'')==='same_post'&&nearestRow?clone(nearestRow.profile):null);
      rows.push({axis:center,profile:insertedProfile,extension:Math.max(0,finite(payload.extension,0))});rows.sort((a,b)=>a.axis-b.axis);
      input.__frontPostCenters=rows.map(row=>row.axis);input.postCount=String(rows.length);input.__frontPostProfiles=rows.map(row=>row.profile);input.__frontPostExtensions=rows.map(row=>row.extension);
      paths.push('input.__frontPostCenters','input.postCount','input.__frontPostProfiles','input.__frontPostExtensions');
      const state=normalizeState(input.__editingState);state.areaProfileOrigins[String(target.plmrZoneId||target.id)]={scope:'front',centerX:center};input.__editingState=state;
    }else if(info.scope==='side'){
      const key=String(info.sideViewKey), gap=object(b.plmrGap), center=(finite(gap.left)+finite(gap.right))/2;input.__sidePosts=object(input.__sidePosts);const list=array(input.__sidePosts[key]).slice();
      const geom=key==='right'?normalized.rightSideSupportGeometry:normalized.sideSupportGeometry&&normalized.sideSupportGeometry[key];const sourcePost=array(geom&&geom.posts).slice().sort((a,b)=>Math.abs(finite(a.centerX)-center)-Math.abs(finite(b.centerX)-center))[0];
      const insertedProfile=payload.profile?canonicalProfile(payload.profile):(String(payload.profileType||'')==='same_post'&&sourcePost&&sourcePost.profile?clone(sourcePost.profile):{mode:'standard',en:100,boy:100,et:2});
      if(!list.some(p=>Math.abs(finite(p.centerX)-center)<0.01))list.push({id:`side_${key}_${Date.now()}`,centerX:center,profile:insertedProfile,extension:0});input.__sidePosts[key]=list;input.__sideAutoSupportSuppressed=object(input.__sideAutoSupportSuppressed);delete input.__sideAutoSupportSuppressed[key];paths.push(`input.__sidePosts.${key}`);
    }else throw new Error('PLMR alanı profil eklemeye izin vermiyor.');
  }
  function removeProfile(input,target,paths){
    if(target.targetType==='post'&&Number.isFinite(Number(target.postIndex))){const idx=Number(target.postIndex), centers=Array.isArray(input.__frontPostCenters)?input.__frontPostCenters.slice():null;if(centers&&centers.length>2){centers.splice(idx,1);input.__frontPostCenters=centers;input.postCount=String(centers.length);if(Array.isArray(input.__frontPostProfiles))input.__frontPostProfiles.splice(idx,1);if(Array.isArray(input.__frontPostExtensions))input.__frontPostExtensions.splice(idx,1);paths.push('input.__frontPostCenters','input.postCount','input.__frontPostProfiles','input.__frontPostExtensions');}return;}
    if(target.targetType==='side-support-post'){const data=target.plmrInteraction&&target.plmrInteraction.data||{};const key=String(data.sideViewKey||target.sideViewKey||'0');input.__sidePosts=object(input.__sidePosts);input.__sidePosts[key]=array(input.__sidePosts[key]).filter(p=>String(p.id)!==String(target.profileId||data.profileId||''));input.__sideAutoSupportSuppressed=object(input.__sideAutoSupportSuppressed);input.__sideAutoSupportSuppressed[key]=true;paths.push(`input.__sidePosts.${key}`,`input.__sideAutoSupportSuppressed.${key}`);}
  }
  function resizeWidthExpression(input,dim,next,normalized) {
    const rules=root.PulumurMultiPositionRules, bridge=root.PulumurExcelBridge;
    const count=Math.max(1,Math.round(finite(input.systemCount,array(normalized&&normalized.positions).length||1)));
    const index=Math.max(0,Number(dim&&dim.index)||0);
    const delta=next-finite(dim&&dim.measuredValue,next);
    const source=String(input.width==null?'':input.width);
    const standardGap=bridge&&bridge.SAYFA1_DEFAULTS?bridge.SAYFA1_DEFAULTS.standardPhysicalSystemGap:13;
    const minNoGap=bridge&&bridge.SAYFA1_DEFAULTS?bridge.SAYFA1_DEFAULTS.minimumNoPhysicalGap:13;
    if(rules&&typeof rules.parseIndependentWidthGroups==='function'){
      const topology=rules.parseIndependentWidthGroups(source,{standardGap,minNoGap});
      if(topology&&topology.ok&&topology.independent){
        const group=topology.groups.find(g=>array(g.positions).some(p=>Number(p.globalPositionIndex)===index));
        if(!group)throw new Error('PLMR bağımsız genişlik pozisyonu bulunamadı.');
        const local=array(group.positions).findIndex(p=>Number(p.globalPositionIndex)===index);
        const expressions=topology.groups.map(g=>{
          const widths=array(g.widths).map(Number),gaps=array(g.internalGaps).map(Number);
          if(g.groupId===group.groupId)widths[local]=Math.max(1,widths[local]+delta);
          if(g.widthMode==='total'&&widths.length>1)return String(Math.max(1,widths.reduce((a,b)=>a+b,0)+gaps.reduce((a,b)=>a+b,0)));
          const tokens=[];widths.forEach((w,i)=>{tokens.push(String(Math.round(w)));if(i<gaps.length)tokens.push(String(Math.round(gaps[i])));});
          if(g.widthMode==='no')tokens.push('NO');return tokens.join(';');
        });
        const out=[];expressions.forEach((expr,i)=>{out.push(expr);if(i<array(topology.groupGaps).length)out.push(String(Math.round(topology.groupGaps[i])));});
        return out.join(':');
      }
    }
    if(rules&&typeof rules.parseWidth==='function'){
      const parsed=rules.parseWidth(source,count,{standardGap,minNoGap});
      if(parsed&&parsed.ok){
        if(parsed.mode==='total')return String(Math.max(1,Math.round(finite(parsed.total)+delta)));
        const widths=array(parsed.widths).map(Number),gaps=array(parsed.gaps).map(Number);const i=Math.min(index,Math.max(0,widths.length-1));widths[i]=Math.max(1,widths[i]+delta);
        if(parsed.mode==='single')return String(Math.round(widths[0]));
        if(parsed.mode==='no'){const tokens=[];widths.forEach((w,j)=>{tokens.push(String(Math.round(w)));if(j<gaps.length)tokens.push(String(Math.round(gaps[j])));});tokens.push('NO');return tokens.join(';');}
        return widths.map(w=>String(Math.round(w))).join(';');
      }
    }
    return replaceToken(source,index,Math.max(1,tokenAt(source,index)+delta));
  }

  function resizeDimension(input,dim,value,normalized,paths){
    if(!dim||!dim.editable||!dim.canResize)throw new Error('Bu PLMR ölçüsü düzenlenebilir değil.');const next=Math.max(1,finite(value,dim.measuredValue));const index=Math.max(0,Number(dim.index)||0);
    if(['width','opening','rearHeight','frontHeight'].includes(dim.field)){
      if(dim.field==='width'&&(dim.ruleKey==='top_system_width'||dim.ruleKey==='front_total_width')) input.width=resizeWidthExpression(input,dim,next,normalized);
      else input[dim.field]=replaceToken(input[dim.field],index,next);
      paths.push(`input.${dim.field}`);return;
    }
    if(dim.ruleKey==='front_post_gap'){
      const centers=array(normalized.postCenterXs).map(Number),widths=array(normalized.frontPostWidths);const i=index;if(i+1<centers.length){centers[i+1]=centers[i]+finite(widths[i],100)/2+next+finite(widths[i+1],100)/2;for(let j=i+2;j<centers.length;j++)centers[j]=Math.max(centers[j],centers[j-1]+finite(widths[j-1],100)/2+1+finite(widths[j],100)/2);input.__frontPostCenters=centers;paths.push('input.__frontPostCenters');}return;
    }
    if(dim.ruleKey==='parapet_width'){
      const d=normalized.parapetSegments||{front:[],side:{}};const raw={front:clone(d.front||[]),side:clone(d.side||{})};let list=dim.parapetView==='front'?raw.front:array(raw.side[String(dim.sideViewKey==='right'?'right':dim.sideIndex)]);const ix=Math.max(0,Number(dim.parapetSegmentIndex)||0);if(list[ix])list[ix].end=finite(list[ix].start)+next;if(dim.parapetView!=='front')raw.side[String(dim.sideViewKey==='right'?'right':dim.sideIndex)]=list;input.__parapetSegments=raw;paths.push('input.__parapetSegments');return;
    }
    if(dim.ruleKey==='side_support_gap'){
      const key=String(dim.sideViewKey||'0'),geom=key==='right'?normalized.rightSideSupportGeometry:normalized.sideSupportGeometry&&normalized.sideSupportGeometry[key],posts=array(geom&&geom.posts);if(posts.length){input.__sidePosts=object(input.__sidePosts);const list=clone(posts);const ix=Math.min(index,list.length-1);list[ix].centerX=finite(geom.wallX)+next+finite(list[ix].width,100)/2;input.__sidePosts[key]=list.map(p=>({id:p.id,centerX:p.centerX,profile:p.profile,extension:p.extension||0}));paths.push(`input.__sidePosts.${key}`);}return;
    }
    throw new Error('PLMR ölçü kuralı için güvenli 3D mutasyon tanımlı değil: '+String(dim.ruleKey));
  }
  function applyComponentOperation(input,target,operation,payload,normalized,paths){
    const data=target.plmrInteraction&&target.plmrInteraction.data||{};
    if(target.targetType==='water-outlet'){
      const id=String(data.waterPipeId||'');input.__waterOutletPipeState={diameter:Math.max(1,finite(input.__waterOutletPipeState&&input.__waterOutletPipeState.diameter,70)),length:Math.max(1,finite(input.__waterOutletPipeState&&input.__waterOutletPipeState.length,300)),offsets:{...object(input.__waterOutletPipeState&&input.__waterOutletPipeState.offsets)},deleted:{...object(input.__waterOutletPipeState&&input.__waterOutletPipeState.deleted)}};
      if(operation==='remove')input.__waterOutletPipeState.deleted[id]=true;else{delete input.__waterOutletPipeState.deleted[id];if(Number.isFinite(Number(payload.offset)))input.__waterOutletPipeState.offsets[id]=Number(payload.offset);if(Number.isFinite(Number(payload.diameter)))input.__waterOutletPipeState.diameter=Math.max(1,Number(payload.diameter));if(Number.isFinite(Number(payload.length)))input.__waterOutletPipeState.length=Math.max(1,Number(payload.length));}paths.push('input.__waterOutletPipeState');return;
    }
    if(target.targetType==='trapez-sheet'){
      if(!['resize','edit','recalculate'].includes(operation))throw new Error('PLMR fiziksel sac ekleme/kaldırma kuralı sağlamıyor.');if(operation!=='recalculate'){const i=String(Number(target.systemIndex)||0),base=data||{};const origin=finite(root.PulumurGeometry&&root.PulumurGeometry.K&&root.PulumurGeometry.K.systemStartX)+finite(normalized.width)/2;const minX=Number.isFinite(Number(payload.plmrMinX))?Number(payload.plmrMinX):finite(payload.minX)+origin;const maxX=Number.isFinite(Number(payload.plmrMaxX))?Number(payload.plmrMaxX):finite(payload.maxX)+origin;const minY=Number.isFinite(Number(payload.plmrMinY))?Number(payload.plmrMinY):-finite(payload.maxZ);const maxY=Number.isFinite(Number(payload.plmrMaxY))?Number(payload.plmrMaxY):-finite(payload.minZ);if(!(maxX>minX&&maxY>minY))throw new Error('Geçersiz trapez sac sınırı.');input.__trapezSheetBounds=object(input.__trapezSheetBounds);input.__trapezSheetBounds[i]={minX,maxX,minY,maxY};paths.push(`input.__trapezSheetBounds.${i}`);}return;
    }
    if(target.targetType==='gutter'){
      input.__gutterEditState={...object(input.__gutterEditState),groups:{...object(input.__gutterEditState&&input.__gutterEditState.groups)}};const gid=String(data.independentGroupId||'');const edit={minusXDelta:Number.isFinite(Number(payload.minusXDelta))?Number(payload.minusXDelta):finite(data.gutterMinusXDelta),plusXDelta:Number.isFinite(Number(payload.plusXDelta))?Number(payload.plusXDelta):finite(data.gutterPlusXDelta)};if(gid)input.__gutterEditState.groups[gid]=edit;else Object.assign(input.__gutterEditState,edit);paths.push('input.__gutterEditState');return;
    }
    if(target.targetType==='rail'){
      const si=String(Number(target.systemIndex)||0),ri=Number(target.railIndex)||0,sys=array(normalized.systems)[Number(si)]||{};const rays=array(sys.rays).map(Number);if(Number.isFinite(Number(payload.axisX)))rays[ri]=Number(payload.axisX);input.__customRayPositions=object(input.__customRayPositions);input.__customRayPositions[si]=rays;paths.push(`input.__customRayPositions.${si}`);return;
    }
    if(target.targetType==='side-support-post'){
      const key=String(target.sideViewKey||'0');input.__sidePosts=object(input.__sidePosts);let list=array(input.__sidePosts[key]).slice();const ix=list.findIndex(p=>String(p.id)===String(target.profileId||''));
      if(operation==='remove'){if(ix>=0)list.splice(ix,1);input.__sideAutoSupportSuppressed=object(input.__sideAutoSupportSuppressed);input.__sideAutoSupportSuppressed[key]=true;paths.push(`input.__sideAutoSupportSuppressed.${key}`);}else if(ix>=0){if(Number.isFinite(Number(payload.centerX)))list[ix].centerX=Number(payload.centerX);if(Number.isFinite(Number(payload.extension)))list[ix].extension=Math.max(0,Number(payload.extension));if(payload.profile)list[ix].profile=canonicalProfile(payload.profile);}
      input.__sidePosts[key]=list;paths.push(`input.__sidePosts.${key}`);return;
    }
    if(target.targetType==='post'){
      if(operation==='remove'){removeProfile(input,target,paths);return;}const centers=array(normalized.postCenterXs).map(Number),i=Number(target.postIndex)||0;if(Number.isFinite(Number(payload.axisX)))centers[i]=Number(payload.axisX);input.__frontPostCenters=centers;if(payload.profile){input.__frontPostProfiles=array(input.__frontPostProfiles).slice();while(input.__frontPostProfiles.length<centers.length)input.__frontPostProfiles.push(null);input.__frontPostProfiles[i]=canonicalProfile(payload.profile);paths.push('input.__frontPostProfiles');}if(Number.isFinite(Number(payload.extension))){input.__frontPostExtensions=array(input.__frontPostExtensions).slice();while(input.__frontPostExtensions.length<centers.length)input.__frontPostExtensions.push(0);input.__frontPostExtensions[i]=Math.max(0,Number(payload.extension));paths.push('input.__frontPostExtensions');}paths.push('input.__frontPostCenters');return;
    }
    if(target.targetType==='parapet'){
      if(operation==='recalculate')return;const segId=String(data.parapetSegmentId||'');const raw={front:clone(normalized.parapetSegments&&normalized.parapetSegments.front||[]),side:clone(normalized.parapetSegments&&normalized.parapetSegments.side||{})};let list=data.parapetView==='front'?raw.front:array(raw.side[String(data.sideViewKey==='right'?'right':data.sideIndex)]);const ix=list.findIndex(s=>String(s.id)===segId);if(ix<0)throw new Error('PLMR parapet segmenti bulunamadı.');if(list[ix]){if(Number.isFinite(Number(payload.start)))list[ix].start=Number(payload.start);if(Number.isFinite(Number(payload.end)))list[ix].end=Number(payload.end);if(Number.isFinite(Number(payload.height)))list[ix].height=list[ix].startHeight=list[ix].endHeight=Math.max(0,Number(payload.height));if(Number.isFinite(Number(payload.startHeight)))list[ix].startHeight=Math.max(0,Number(payload.startHeight));if(Number.isFinite(Number(payload.endHeight)))list[ix].endHeight=Math.max(0,Number(payload.endHeight));}if(data.parapetView!=='front')raw.side[String(data.sideViewKey==='right'?'right':data.sideIndex)]=list;input.__parapetSegments=raw;paths.push('input.__parapetSegments');return;
    }
    if(target.targetType==='wall'){
      let changed=false;
      if(data.wallCellId){
        const si=String(Number(data.systemIndex)||0);input.__topBackWallGridState=object(input.__topBackWallGridState);const current=object(input.__topBackWallGridState[si]);
        const bounds={minX:0,maxX:finite(data.defaultBoundMaxX)-finite(data.defaultBoundMinX),minY:0,maxY:Math.max(1,finite(data.wallDepth,800))};
        let cells=array(current.cells).length?clone(current.cells):[{id:String(data.wallCellId),minX:finite(data.cellMinX),maxX:finite(data.cellMaxX),startNearDepth:finite(data.startNearDepth),endNearDepth:finite(data.endNearDepth),startFarDepth:finite(data.startFarDepth),endFarDepth:finite(data.endFarDepth)}];
        let ix=cells.findIndex(c=>String(c.id)===String(data.wallCellId));if(ix<0){cells.push({id:String(data.wallCellId),minX:finite(data.cellMinX),maxX:finite(data.cellMaxX),startNearDepth:finite(data.startNearDepth),endNearDepth:finite(data.endNearDepth),startFarDepth:finite(data.startFarDepth),endFarDepth:finite(data.endFarDepth)});ix=cells.length-1;}
        if(operation==='remove')cells[ix]={...cells[ix],enabled:false};else cells[ix]={...cells[ix],enabled:true,minX:Number.isFinite(Number(payload.minX))?Number(payload.minX):finite(cells[ix].minX),maxX:Number.isFinite(Number(payload.maxX))?Number(payload.maxX):finite(cells[ix].maxX),startNearDepth:Number.isFinite(Number(payload.startNearDepth))?Number(payload.startNearDepth):finite(data.startNearDepth),endNearDepth:Number.isFinite(Number(payload.endNearDepth))?Number(payload.endNearDepth):finite(data.endNearDepth),startFarDepth:Number.isFinite(Number(payload.startFarDepth))?Number(payload.startFarDepth):finite(data.startFarDepth),endFarDepth:Number.isFinite(Number(payload.endFarDepth))?Number(payload.endFarDepth):finite(data.endFarDepth)};
        input.__topBackWallGridState[si]={version:1,bounds,cells};paths.push(`input.__topBackWallGridState.${si}`);changed=true;
      }
      const sideData=target.plmrSideInteraction&&target.plmrSideInteraction.data||(!data.wallCellId?data:null);
      if(sideData){
        const key=String(sideData.sideViewKey||'0');input.__backWallState=object(input.__backWallState);let wall=key==='right'?object(input.__backWallState.right):key==='0'?object(input.__backWallState.left):object(object(input.__backWallState.middle)[key]);
        wall={...wall,enabled:operation==='remove'?false:true,xOffset:Number.isFinite(Number(payload.xOffset))?Number(payload.xOffset):finite(wall.xOffset,finite(sideData.wallXOffset)),depth:Number.isFinite(Number(payload.depth))?Math.max(1,Number(payload.depth)):Math.max(1,finite(wall.depth,finite(sideData.wallDepth,600))),height:Number.isFinite(Number(payload.height))?Math.max(0,Number(payload.height)):Math.max(0,finite(wall.height,finite(sideData.wallHeight)))};
        input.__backWallState=sideSet(input.__backWallState,key,wall);paths.push('input.__backWallState');changed=true;
      }
      if(!changed&&operation!=='recalculate')throw new Error('PLMR duvar etkileşim verisi bulunamadı.');return;
    }
    if(target.targetType==='glass-track'){
      const key=String(data.sideViewKey||data.scope||'0');if(Number.isFinite(Number(payload.lengthOffset))){input.__glassTrackLengthOffsets=sideSet(input.__glassTrackLengthOffsets,key,Number(payload.lengthOffset));paths.push('input.__glassTrackLengthOffsets');}if(payload.profile){input.__glassTrackProfile=canonicalProfile(payload.profile);paths.push('input.__glassTrackProfile');}return;
    }
    if(target.targetType==='triangle-joinery'){
      const key=String(data.sideViewKey||'0');if(Number.isFinite(Number(payload.divisionCount))){input.__triangleDivisionState=sideSet(input.__triangleDivisionState,key,Math.max(1,Math.round(Number(payload.divisionCount))));paths.push('input.__triangleDivisionState');}return;
    }
    if(target.targetType==='product'){if(operation==='remove')removeProduct(input,target,paths);else if(operation==='resize'||operation==='edit')editProduct(input,target,payload,paths);return;}
    if(operation!=='recalculate')throw new Error('Bu PLMR bileşeni için bağımsız düzenleme kuralı yoktur; bağlı ölçü üzerinden yeniden hesaplanır.');
  }
  function applyCanonicalOperation(rawInput, request) {
    const input=clone(rawInput||{}),target=object(request&&request.target),payload=object(request&&request.payload);let operation=String(request&&request.areaAction||request&&request.operation||'');const paths=[];
    if(!operation)throw new Error('PLMR düzenleme işlemi belirtilmedi.');
    if(Array.isArray(target.operations)&&target.operations.length&&!target.operations.includes(operation))throw new Error('Bu PLMR hedefinde işlem etkin değil: '+operation);
    const normalized=root.PulumurGeometry&&typeof root.PulumurGeometry.normalizeInput==='function'?root.PulumurGeometry.normalizeInput(input):{};
    if(target.targetType==='area'){
      if(operation==='product-add')addProduct(input,target,payload,paths);
      else if(operation==='product-remove')removeProduct(input,target,paths);
      else if(operation==='profile-add')addProfile(input,target,payload,normalized,paths);
      else if(operation==='profile-remove')removeProfile(input,target,paths);
      else if(operation==='resize')resizeDimension(input,target.plmrDimension,payload.value!=null?payload.value:payload.width,normalized,paths);
      else if(operation!=='recalculate')throw new Error('Geçersiz PLMR alan işlemi: '+operation);
    } else if(target.targetType==='dimension') resizeDimension(input,target.plmrDimension,payload.value,normalized,paths);
    else applyComponentOperation(input,target,operation,payload,normalized,paths);
    const state=recordState(input,request,paths);
    const ownershipPatch={};
    if(paths.some(path=>path==='input.postCount'||path.startsWith('input.__frontPost'))) ownershipPatch.postCount=true;
    if(paths.some(path=>path==='input.rayCount'||path.startsWith('input.__customRayPositions'))) ownershipPatch.rayCount=true;
    return {input,state,changedPaths:paths,ownershipPatch};
  }
  // Backwards-compatible state-only helper retained for old callers; it no longer drives geometry.
  function applyOperation(rawState,request){const state=normalizeState(rawState);state.revision+=1;state.selectedTargetId=request&&request.targetId?String(request.targetId):null;state.lastChangedPaths=[];state.history.push({revision:state.revision,operation:String(request&&request.operation||''),targetId:state.selectedTargetId,at:new Date().toISOString(),legacyStateOnly:true});return state;}

  root.P3DVPergoRiseEditing=Object.freeze({SCHEMA,OPERATION_IDS,FUNCTION_INVENTORY,PRODUCT_FIELDS,KIND_TO_TARGET,normalizeState,buildCanonical,targetForComponent,areaTargets,applyCanonicalOperation,applyOperation,replaceToken,tokenAt});
  if(typeof module!=='undefined')module.exports=root.P3DVPergoRiseEditing;
})(typeof window!=='undefined'?window:globalThis);
