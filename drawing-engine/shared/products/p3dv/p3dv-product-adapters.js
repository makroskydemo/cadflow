(function (root) {
  'use strict';

  const registry = root.PulumurProductRegistry;
  if (!registry) throw new Error('PRODUCT_REGISTRY_UNAVAILABLE');
  const PROJECT_SCHEMA = 'plmr-embedded-p3dv-product-v1';

  function clone(value) {
    return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
  }

  function productAdapter(config) {
    const createDefaultProject = () => ({
      schema: PROJECT_SCHEMA,
      productType: config.id,
      p3dvProductGroup: config.p3dvProductGroup,
      workspaceMode: '3d'
    });
    const migrateProject = raw => ({ ...createDefaultProject(), ...(raw && typeof raw === 'object' ? clone(raw) : {}) });
    const runtimeOnly = operation => { const error = new Error(`P3DV_EMBEDDED_RUNTIME_REQUIRED:${operation}`); error.code = 'P3DV_EMBEDDED_RUNTIME_REQUIRED'; throw error; };
    return {
      id: config.id,
      label: config.label,
      aliases: config.aliases || [],
      legacyProductTypes: config.legacyProductTypes || [],
      schemaVersion: 1,
      projectSchemas: [PROJECT_SCHEMA],
      executionMode: 'EMBEDDED_P3DV',
      // PLMR V14.01 keeps the existing Supabase entitlement model intact. The
      // unified 3D products are authorized through the installed core product
      // entitlement; product-specific licensing can be split later without
      // changing the runtime IDs below.
      accessProductId: 'PERGO_RISE',
      p3dvProductGroup: config.p3dvProductGroup,
      capabilities: {
        standaloneDrawing: false,
        isolatedApp: false,
        placementInsidePergoRise: false,
        svg: false,
        dxf: false,
        pdf: true,
        plmr: true,
        cloud: true,
        embedded3d: true,
        threeD: true,
        technical2D: config.technical2D === true,
        twoD: config.technical2D === true,
        productSpecificToolbox: true
      },
      navigation: {
        route: 'modules/p3dv/index.html?embedded=1',
        moduleName: 'Module 1',
        engineName: 'Web 3D',
        opensDedicatedPage: false
      },
      createDefaultProject,
      validateProject(project) {
        const migrated = migrateProject(project);
        return Object.freeze({ ok: migrated.p3dvProductGroup === config.p3dvProductGroup, errors: Object.freeze(migrated.p3dvProductGroup === config.p3dvProductGroup ? [] : ['P3DV_PRODUCT_GROUP_MISMATCH']) });
      },
      migrateProject,
      buildStandaloneGeometry() { return runtimeOnly('buildStandaloneGeometry'); },
      buildPlacementGeometry() { return runtimeOnly('buildPlacementGeometry'); },
      renderPreview() { return runtimeOnly('renderPreview'); },
      serializeProject(project) { return JSON.stringify(migrateProject(project)); },
      deserializeProject(text) { return migrateProject(typeof text === 'string' ? JSON.parse(text) : text); },
      exportDxf() { return runtimeOnly('exportDxf'); },
      exportPdf() { return runtimeOnly('exportPdf'); }
    };
  }

  const CONFIGS = Object.freeze([
    Object.freeze({ id: 'P3DV_ROLLING_ROOF', label: 'PLMR | Bioclimatic', p3dvProductGroup: 'b-cube', technical2D: true, aliases: Object.freeze(['Rolling Roof (Retractable)', 'Rolling Roof', 'RollingRoof', 'Retractable', 'B-Cube Freedom', 'B Cube Freedom', 'Freedom', 'b-cube']) }),
    Object.freeze({ id: 'P3DV_BIOCLIMATIC', label: 'Bioclimatic (Tilt)', p3dvProductGroup: 'b-cube-galaxy', technical2D: true, aliases: Object.freeze(['Bioclimatic (Tilt)', 'Bioclimatic', 'Bio Climatic', 'B-Cube Galaxy', 'B Cube Galaxy', 'Galaxy', 'b-cube-galaxy']) }),
    Object.freeze({ id: 'P3DV_ECO_BIOCLIMATIC', label: 'Eco-Bioclimatic (Tilt)', p3dvProductGroup: 'bio-rise', technical2D: true, aliases: Object.freeze(['Eco-Bioclimatic (Tilt)', 'Eco-Bioclimatic', 'Eco Bioclimatic', 'EcoBioclimatic', 'EcoClimatic', 'Ecoclimatic', 'Eco Climatic', 'Bio-Rise', 'Bio Rise', 'bio-rise']) })
  ]);

  CONFIGS.forEach(config => {
    if (!registry.getProduct(config.id)) registry.registerProduct(productAdapter(config));
  });


  const DATA_FIELD_CLASS = Object.freeze({
    SHARED_2D_3D:'SHARED_2D_3D', THREE_D_REQUIRED:'3D_REQUIRED', TWO_D_DERIVED_FROM_3D:'2D_DERIVED_FROM_3D',
    THREE_D_RENDER_ONLY_DERIVED:'3D_RENDER_ONLY_DERIVED', LEGACY_2D_ONLY:'LEGACY_2D_ONLY', FUTURE_COMMON_INPUT:'FUTURE_COMMON_INPUT', OBSOLETE_DUPLICATE:'OBSOLETE / DUPLICATE'
  });
  const C=DATA_FIELD_CLASS;
  const f=(classification,source,target2D,note)=>Object.freeze({classification,source:source||'',target2D:target2D||'',note:note||''});
  const freeze=o=>{ if(!o||typeof o!=='object'||Object.isFrozen(o))return o; Object.keys(o).forEach(k=>freeze(o[k])); return Object.freeze(o); };
  const MAIN_SHARED=Object.freeze({
    productGroup:f(C.SHARED_2D_3D,'modelState.productGroup','Technical2D productGroup'), systemCount:f(C.SHARED_2D_3D,'modelState.systemCount','layout.systemCount'),
    width:f(C.SHARED_2D_3D,'modelState.width','layout.totalWidth'), depth:f(C.SHARED_2D_3D,'modelState.depth','layout.depth'), height:f(C.SHARED_2D_3D,'modelState.height','elevation height'),
    moduleWidths:f(C.SHARED_2D_3D,'modelState.moduleWidths','layout.moduleWidths'), moduleDepths:f(C.SHARED_2D_3D,'modelState.moduleDepths','layout.moduleDepths'), multiAlignment:f(C.SHARED_2D_3D,'modelState.multiAlignment','layout.alignment'), multiRows:f(C.SHARED_2D_3D,'modelState.multiRows','layout.rows'), rowAlignment:f(C.SHARED_2D_3D,'modelState.rowAlignment','layout.rowAlignment'),
    panelCollection:f(C.SHARED_2D_3D,'modelState.panelCollection','layout.panelCollection'), panelCount:f(C.SHARED_2D_3D,'modelState.panelCount','layout.panelCount'), modulePanelCounts:f(C.SHARED_2D_3D,'modelState.modulePanelCounts','layout.panelCounts'), postSections:f(C.SHARED_2D_3D,'modelState.postSections','2D post sections'), beamSection:f(C.SHARED_2D_3D,'modelState.beamSection','2D beam section'),
    facadeProfiles:f(C.SHARED_2D_3D,'modelState.facadeProfiles','Technical2D facade profiles'), placements:f(C.SHARED_2D_3D,'modelState.placements','Technical2D primary products'), zipPlacements:f(C.SHARED_2D_3D,'modelState.zipPlacements','Technical2D Zip products'), productOpenStates:f(C.SHARED_2D_3D,'modelState.productOpenStates','2D/3D product open state'),
    orientations:f(C.THREE_D_REQUIRED,'modelState.orientations',''), systemColor:f(C.THREE_D_REQUIRED,'modelState.systemColor',''), panelColor:f(C.THREE_D_REQUIRED,'modelState.panelColor',''), colorMode:f(C.THREE_D_REQUIRED,'modelState.colorMode',''),
    technicalZones:f(C.TWO_D_DERIVED_FROM_3D,'canonical posts + facadeProfiles','Technical2D zones'), dimensionsAndSymbols:f(C.TWO_D_DERIVED_FROM_3D,'canonical layout + zones','Technical2D dimensions/symbols'), meshOffsets:f(C.THREE_D_RENDER_ONLY_DERIVED,'canonical layout','','viewer-only'), viewerCameraState:f(C.THREE_D_RENDER_ONLY_DERIVED,'snapshot.viewerCameraState','','presentation-only'), inputDrafts:f(C.FUTURE_COMMON_INPUT,'modelState.inputDrafts','','non-physical UI draft; future common input language')
  });
  const FACADE_CONTRACTS={
    sliding:{owner:'modelState.placements[zoneId]',adapter:'SLIDING',required:['type','series','subtype','slidingView','openingType','openingDirection','glassThickness','glassColor','panels'],conditional:[['glassColor','OTHER','customGlassColor']],fields:{
      type:f(C.SHARED_2D_3D,'placement.type','ProductRegistry adapter discriminator'),width:f(C.TWO_D_DERIVED_FROM_3D,'zone.width','width'),height:f(C.TWO_D_DERIVED_FROM_3D,'zone.height','height'),series:f(C.SHARED_2D_3D,'placement.series','series'),subtype:f(C.SHARED_2D_3D,'placement.subtype','type'),slidingView:f(C.THREE_D_REQUIRED,'placement.slidingView','slidingView','preserved for native technical-view semantics'),openingType:f(C.SHARED_2D_3D,'placement.openingType','openingType'),openingDirection:f(C.SHARED_2D_3D,'placement.openingDirection','openingDirection','consumed by native sliding geometry'),glassThickness:f(C.SHARED_2D_3D,'placement.glassThickness','glassThickness'),glassColor:f(C.SHARED_2D_3D,'placement.glassColor','glassColor'),customGlassColor:f(C.SHARED_2D_3D,'placement.customGlassColor','customGlassColor','required when OTHER'),panels:f(C.SHARED_2D_3D,'placement.panels','panelCount'),collectionState:f(C.OBSOLETE_DUPLICATE,'placement.collectionState','collectionState','embedded display state is derived from modelState.productOpenStates; retained for standalone/input compatibility'),panelCountMode:f(C.LEGACY_2D_ONLY,'','MANUAL'),leftPostStandard:f(C.FUTURE_COMMON_INPUT,'','leftPostStandard') }},
    guillotine:{owner:'modelState.placements[zoneId]',adapter:'GUILLOTINE',required:['type','series','subtype','mechanism','glassThickness','glassColor','panels','panelType','motorDirection','view','motorType','remoteControl','bottomPanelMode','bottomPanelHinge'],conditional:[['glassColor','OTHER','customGlassColor']],fields:{
      type:f(C.SHARED_2D_3D,'placement.type','ProductRegistry adapter discriminator'),width:f(C.TWO_D_DERIVED_FROM_3D,'zone.width','width'),height:f(C.TWO_D_DERIVED_FROM_3D,'zone.height','height'),series:f(C.SHARED_2D_3D,'placement.series','series'),subtype:f(C.SHARED_2D_3D,'placement.subtype','type'),mechanism:f(C.SHARED_2D_3D,'placement.mechanism','mechanism'),glassThickness:f(C.SHARED_2D_3D,'placement.glassThickness','glassThickness'),glassColor:f(C.SHARED_2D_3D,'placement.glassColor','glassColor'),customGlassColor:f(C.SHARED_2D_3D,'placement.customGlassColor','customGlassColor','required when OTHER'),panels:f(C.SHARED_2D_3D,'placement.panels','panelCount'),panelType:f(C.SHARED_2D_3D,'placement.panelType','panelCount'),motorDirection:f(C.SHARED_2D_3D,'placement.motorDirection','motorDirection'),view:f(C.SHARED_2D_3D,'placement.view','view'),motorType:f(C.SHARED_2D_3D,'placement.motorType','motorType'),remoteControl:f(C.SHARED_2D_3D,'placement.remoteControl','remoteControl'),bottomPanelMode:f(C.SHARED_2D_3D,'placement.bottomPanelMode','bottomPanelMode','consumed by native guillotine geometry'),bottomPanelState:f(C.THREE_D_RENDER_ONLY_DERIVED,'modelState.productOpenStates[zoneId]','bottomPanelState','CLEANABLE display state derived from canonical open state'),bottomPanelHinge:f(C.SHARED_2D_3D,'placement.bottomPanelHinge','bottomPanelHinge','consumed by native guillotine geometry'),collectionState:f(C.OBSOLETE_DUPLICATE,'placement.collectionState','collectionState','collecting display state derived from modelState.productOpenStates; retained for standalone/input compatibility') }},
    zip:{owner:'modelState.zipPlacements[zoneId]',adapter:'ZIP_SCREEN',required:['type','series','subtype','placementLocation','fabricColor','cableDirection','motorDirection','panels','view'],conditional:[],fields:{
      type:f(C.SHARED_2D_3D,'placement.type','ProductRegistry adapter discriminator'),width:f(C.TWO_D_DERIVED_FROM_3D,'zone.width','width'),height:f(C.TWO_D_DERIVED_FROM_3D,'zone.height','height'),series:f(C.SHARED_2D_3D,'placement.series','series'),subtype:f(C.SHARED_2D_3D,'placement.subtype','type'),placementLocation:f(C.SHARED_2D_3D,'placement.placementLocation','mountingLocation','FRONT OF POSTS -> OUTSIDE POSTS'),fabricColor:f(C.SHARED_2D_3D,'placement.fabricColor','fabricColor'),customFabricColor:f(C.FUTURE_COMMON_INPUT,'placement.customFabricColor','customFabricColor','current UI keeps blank'),cableDirection:f(C.SHARED_2D_3D,'placement.cableDirection','cableExitDirection','BACK -> REAR'),motorDirection:f(C.SHARED_2D_3D,'placement.motorDirection','motorDirection'),panels:f(C.THREE_D_RENDER_ONLY_DERIVED,'placement.panels=1','panelCount=1'),view:f(C.THREE_D_RENDER_ONLY_DERIVED,'placement.view=OUTSIDE VIEW',''),collectionState:f(C.THREE_D_RENDER_ONLY_DERIVED,'modelState.productOpenStates[zip:zoneId]','collectionState','embedded display state derived from canonical Zip open state'),sizeMode:f(C.LEGACY_2D_ONLY,'','MANUAL') }},
    door:{owner:'modelState.placements[zoneId]',adapter:'DOOR',required:['type','doorType','hingeDirection','activeLeaf','doorOpenDirection','handleType','movingLeafHeight','topFixedHeight','view','glassThickness','glassColor'],conditional:[['glassColor','OTHER','customGlassColor']],fields:{
      type:f(C.SHARED_2D_3D,'placement.type','ProductRegistry adapter discriminator'),width:f(C.TWO_D_DERIVED_FROM_3D,'zone.width','width'),height:f(C.TWO_D_DERIVED_FROM_3D,'zone.height','height'),doorType:f(C.SHARED_2D_3D,'placement.doorType','doorType'),hingeDirection:f(C.SHARED_2D_3D,'placement.hingeDirection','hingeDirection'),activeLeaf:f(C.SHARED_2D_3D,'placement.activeLeaf','activeLeaf','consumed by existing door block for active handle leaf'),doorOpenDirection:f(C.SHARED_2D_3D,'placement.doorOpenDirection','doorOpenDirection'),handleType:f(C.SHARED_2D_3D,'placement.handleType','handleType'),movingLeafHeight:f(C.SHARED_2D_3D,'placement.movingLeafHeight','movingLeafHeight'),topFixedHeight:f(C.TWO_D_DERIVED_FROM_3D,'placement.topFixedHeight derived consistently from zone height + movingLeafHeight','topFixedHeight','not an independent physical owner'),view:f(C.THREE_D_RENDER_ONLY_DERIVED,'placement.view=OUTSIDE VIEW',''),glassThickness:f(C.SHARED_2D_3D,'placement.glassThickness','glassThickness'),glassColor:f(C.SHARED_2D_3D,'placement.glassColor','glassColor'),customGlassColor:f(C.SHARED_2D_3D,'placement.customGlassColor','customGlassColor','required when OTHER'),panels:f(C.OBSOLETE_DUPLICATE,'placement.panels=0','','generic residue') }},
    fixed:{owner:'modelState.placements[zoneId]',adapter:'FIXED_JOINERY',required:['type','glassThickness','glassColor','verticalDivisions','horizontalDivisions','horizontalHeights'],conditional:[['glassColor','OTHER','customGlassColor']],fields:{
      type:f(C.SHARED_2D_3D,'placement.type','ProductRegistry adapter discriminator'),width:f(C.TWO_D_DERIVED_FROM_3D,'zone.width','width'),height:f(C.TWO_D_DERIVED_FROM_3D,'zone.height','height'),glassThickness:f(C.SHARED_2D_3D,'placement.glassThickness','glassThickness'),glassColor:f(C.SHARED_2D_3D,'placement.glassColor','glassColor'),customGlassColor:f(C.SHARED_2D_3D,'placement.customGlassColor','customGlassColor','required when OTHER'),verticalDivisions:f(C.SHARED_2D_3D,'placement.verticalDivisions (cell count)','verticalDivisions (divider count)','target=max(0,source-1)'),horizontalDivisions:f(C.SHARED_2D_3D,'placement.horizontalDivisions','horizontalDivisions'),horizontalHeights:f(C.SHARED_2D_3D,'placement.horizontalHeights','horizontalHeights'),horizontalHeightManual:f(C.THREE_D_REQUIRED,'placement.horizontalHeightManual','','edit-intent metadata; not geometry authority'),panels:f(C.OBSOLETE_DUPLICATE,'placement.panels=0','','generic residue') }},
    folding:{owner:'modelState.placements[zoneId]',adapter:'FOLDING_GLASS',required:['type','series','subtype','openingType','openingDirection','glassThickness','glassColor','panels','foldingView','foldingOpenDirection','thresholdProfile'],conditional:[['glassColor','OTHER','customGlassColor']],fields:{
      type:f(C.SHARED_2D_3D,'placement.type','ProductRegistry adapter discriminator'),width:f(C.TWO_D_DERIVED_FROM_3D,'zone.width','width'),height:f(C.TWO_D_DERIVED_FROM_3D,'zone.height','height'),series:f(C.SHARED_2D_3D,'placement.series','series'),subtype:f(C.SHARED_2D_3D,'placement.subtype','subtype'),openingType:f(C.THREE_D_RENDER_ONLY_DERIVED,'placement.openingType=FOLDING','openingType=FOLDING'),openingDirection:f(C.SHARED_2D_3D,'placement.openingDirection','openingDirection'),glassThickness:f(C.SHARED_2D_3D,'placement.glassThickness','glassThickness'),glassColor:f(C.SHARED_2D_3D,'placement.glassColor','glassColor'),customGlassColor:f(C.SHARED_2D_3D,'placement.customGlassColor','customGlassColor','required when OTHER'),panels:f(C.SHARED_2D_3D,'placement.panels','panels'),foldingView:f(C.SHARED_2D_3D,'placement.foldingView','foldingView'),foldingOpenDirection:f(C.SHARED_2D_3D,'placement.foldingOpenDirection','foldingOpenDirection'),collectionState:f(C.OBSOLETE_DUPLICATE,'placement.collectionState','collectionState','embedded display state derived from modelState.productOpenStates; retained for standalone/input compatibility'),thresholdProfile:f(C.SHARED_2D_3D,'placement.thresholdProfile=70','thresholdProfile=70') }}
  };
  const PRODUCT_DATA_CONTRACTS=freeze({schema:'plmr-product-data-contract-v14.25',direction:'3D_CANONICAL_TO_2D_PROJECTION',fieldClasses:DATA_FIELD_CLASS,mainProducts:{
    P3DV_ROLLING_ROOF:{productGroup:'b-cube',owner:'P3DV modelState',renderer3D:'P3DVFreedomMultiPosition',renderer2D:'PulumurFreedom2DAdapter',fields:{...MAIN_SHARED}},
    P3DV_BIOCLIMATIC:{productGroup:'b-cube-galaxy',owner:'P3DV modelState',renderer3D:'P3DVGalaxyMultiPosition',renderer2D:'PulumurGalaxy2DAdapter',fields:{...MAIN_SHARED}},
    P3DV_ECO_BIOCLIMATIC:{productGroup:'bio-rise',owner:'P3DV modelState',renderer3D:'P3DVBioRiseMultiPosition',renderer2D:'PulumurBioRise2DAdapter',fields:{...MAIN_SHARED}},
    PERGO_RISE:{productGroup:'pergo-rise',owner:'P3DV modelState.pergoRiseProject.input for 3D; native ProjectModel remains legacy 2D owner',renderer3D:'P3DVPergoRiseProduct/P3DVPergoRiseViewer',renderer2D:'native PLMR Pergola Web-DXF',fields:{systemCount:f(C.SHARED_2D_3D,'pergoRiseProject.input.systemCount','native systemCount'),width:f(C.SHARED_2D_3D,'pergoRiseProject.input.width','native width'),opening:f(C.SHARED_2D_3D,'pergoRiseProject.input.opening','native opening'),rearHeight:f(C.SHARED_2D_3D,'pergoRiseProject.input.rearHeight','native rearHeight'),frontHeight:f(C.SHARED_2D_3D,'pergoRiseProject.input.frontHeight','native frontHeight'),rayCount:f(C.SHARED_2D_3D,'pergoRiseProject.input.rayCount','native rayCount'),postCount:f(C.SHARED_2D_3D,'pergoRiseProject.input.postCount','native postCount'),parapet:f(C.SHARED_2D_3D,'pergoRiseProject.input.parapet','native parapet'),parapetHeight:f(C.SHARED_2D_3D,'pergoRiseProject.input.parapetHeight','native parapetHeight'),glassTrack:f(C.SHARED_2D_3D,'pergoRiseProject.input.glassTrack','native glassTrack'),glassRayBoundaryMode:f(C.SHARED_2D_3D,'pergoRiseProject.input.glassRayBoundaryMode','native glassRayBoundaryMode'),sideTrack:f(C.SHARED_2D_3D,'pergoRiseProject.input.sideTrack','native sideTrack'),structureColor:f(C.SHARED_2D_3D,'pergoRiseProject.input.structureColor','native structureColor'),fabric:f(C.SHARED_2D_3D,'pergoRiseProject.input.fabric','native fabric'),fabricProfiles:f(C.SHARED_2D_3D,'pergoRiseProject.input.fabricProfiles','native fabricProfiles'),motor:f(C.SHARED_2D_3D,'pergoRiseProject.input.motor','native motor'),remote:f(C.SHARED_2D_3D,'pergoRiseProject.input.remote','native remote'),led:f(C.SHARED_2D_3D,'pergoRiseProject.input.led','native led'),dimmer:f(C.SHARED_2D_3D,'pergoRiseProject.input.dimmer','native dimmer'),extras:f(C.SHARED_2D_3D,'pergoRiseProject.input.extras','native extras'),triangleJoinery:f(C.SHARED_2D_3D,'pergoRiseProject.input.triangleJoinery','native triangleJoinery'),waterStandard:f(C.SHARED_2D_3D,'pergoRiseProject.input.waterStandard','native waterStandard'),waterOutletPlacement:f(C.SHARED_2D_3D,'pergoRiseProject.input.waterOutletPlacement','native waterOutletPlacement'),hiddenPhysicalEditing:f(C.SHARED_2D_3D,'pergoRiseProject.input.__*','native hidden editing fields'),normalizedGeometry:f(C.TWO_D_DERIVED_FROM_3D,'pergoRiseProject.normalized','native geometry projection'),viewerAssemblyTransforms:f(C.THREE_D_RENDER_ONLY_DERIVED,'pergoRise derived','','viewer-only'),projectModelMirror:f(C.LEGACY_2D_ONLY,'host ProjectModel','native PLMR engine','do not force reverse 2D→3D completeness'),unifiedInputLanguage:f(C.FUTURE_COMMON_INPUT,'','','post-V14.28 roadmap')}}
  },facadeProducts:FACADE_CONTRACTS});
  function facadeDataContract(type){return PRODUCT_DATA_CONTRACTS.facadeProducts[String(type||'').trim().toLowerCase()==='balcony'?'folding':String(type||'').trim().toLowerCase()]||null;}
  function requiredCanonicalFieldsForFacade(type,placement){const c=facadeDataContract(type);if(!c)return[];const fields=c.required.slice();(c.conditional||[]).forEach(([k,v,field])=>{if(String(placement&&placement[k]||'').toUpperCase()===String(v).toUpperCase())fields.push(field);});return Array.from(new Set(fields));}
  function mapFacadeToNative2D(type,placement,context){const key=String(type||'').trim().toLowerCase(),p=clone(placement||{}),ctx=context||{},n=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d,u=v=>String(v==null?'':v).trim().toUpperCase(),hasOpen=typeof ctx.productOpen==='boolean',displayCollection=hasOpen?(ctx.productOpen?'COLLECTED':'NORMAL'):u(p.collectionState||'NORMAL'),base={width:Math.max(1,n(ctx.width,n(ctx.zone&&ctx.zone.width,1))),height:Math.max(1,n(ctx.height,n(ctx.zone&&ctx.zone.height,1))),id:String(p.id||`${key}-${ctx.zone&&ctx.zone.id||'zone'}`),pozNo:String(p.pozNo||'').trim()||undefined};
    if(key==='sliding')return{...base,series:p.series,type:u(p.subtype||'WITH THRESHOLD'),slidingView:p.slidingView,openingType:p.openingType,openingDirection:p.openingDirection,glassThickness:p.glassThickness,glassColor:p.glassColor,customGlassColor:p.customGlassColor,panelCountMode:'MANUAL',panelCount:Math.max(2,Math.round(n(p.panels||p.panelCount,4))),collectionState:displayCollection};
    if(key==='guillotine'){const subtype=u(p.subtype||'CLEANABLE'),cleanable=subtype==='CLEANABLE';return{...base,series:p.series,type:subtype,mechanism:p.mechanism,glassThickness:p.glassThickness,glassColor:p.glassColor,customGlassColor:p.customGlassColor,panelCount:p.panelType||(Math.round(n(p.panels,3))<=2?'1+1':'1+2'),motorDirection:p.motorDirection,view:p.view,motorType:p.motorType,remoteControl:p.remoteControl,bottomPanelMode:p.bottomPanelMode,bottomPanelState:hasOpen&&cleanable?(ctx.productOpen?'OPEN':'CLOSED'):p.bottomPanelState,bottomPanelHinge:p.bottomPanelHinge,collectionState:cleanable?'NORMAL':displayCollection};}
    if(key==='zip')return{...base,series:p.series,type:u(p.subtype||'100X100 BOX'),mountingLocation:['FRONT OF POSTS','OUTSIDE POSTS'].includes(u(p.placementLocation))?'OUTSIDE POSTS':'BETWEEN POSTS',fabricColor:p.fabricColor,customFabricColor:p.customFabricColor,cableExitDirection:u(p.cableDirection)==='BACK'?'REAR':u(p.cableDirection||'REAR'),motorDirection:p.motorDirection,sizeMode:'MANUAL',panelCount:1,collectionState:displayCollection};
    if(key==='fixed')return{...base,...p,productType:'FIXED_JOINERY',type:'fixed',width:base.width,height:base.height,verticalDivisions:Math.max(0,Math.round(n(p.verticalDivisions,1))-1),horizontalDivisions:Math.max(1,Math.round(n(p.horizontalDivisions,1)))};
    if(key==='door')return{...base,...p,productType:'DOOR',type:'door',width:base.width,height:base.height}; if(key==='folding')return{...base,...p,productType:'FOLDING_GLASS',type:'folding',width:base.width,height:base.height,collectionState:displayCollection}; throw new Error(`P3DV_PRODUCT_DATA_CONTRACT_UNSUPPORTED:${key}`);
  }

  function normalizeGroupKey(value) {
    return String(value || '').trim().toLowerCase().replace(/[_]+/g, '-').replace(/\s+/g, ' ');
  }
  const groupAliases = new Map();
  const productToGroup = {};
  const groupToProduct = {};
  CONFIGS.forEach(config => {
    productToGroup[config.id] = config.p3dvProductGroup;
    groupToProduct[config.p3dvProductGroup] = config.id;
    [config.p3dvProductGroup, config.label, ...config.aliases].forEach(alias => {
      const raw = normalizeGroupKey(alias);
      groupAliases.set(raw, config.p3dvProductGroup);
      groupAliases.set(raw.replace(/-/g, ' '), config.p3dvProductGroup);
    });
  });
  function canonicalGroup(value) {
    const raw = normalizeGroupKey(value);
    return groupAliases.get(raw) || groupAliases.get(raw.replace(/-/g, ' ')) || raw;
  }
  function productIdForGroup(value) {
    return groupToProduct[canonicalGroup(value)] || '';
  }
  function groupForProduct(value) {
    const adapter = registry.getProduct(value);
    return adapter && productToGroup[adapter.id] || '';
  }
  function productId(value) {
    const adapter = registry.getProduct(value);
    return adapter && productToGroup[adapter.id] ? adapter.id : '';
  }
  root.PulumurP3DVProductIdentity = Object.freeze({
    DEFAULT_PRODUCT_ID: 'P3DV_BIOCLIMATIC',
    CONFIGS,
    PRODUCT_TO_GROUP: Object.freeze({ ...productToGroup }),
    GROUP_TO_PRODUCT: Object.freeze({ ...groupToProduct }),
    DATA_FIELD_CLASS,
    PRODUCT_DATA_CONTRACTS,
    facadeDataContract,
    requiredCanonicalFieldsForFacade,
    mapFacadeToNative2D,
    canonicalGroup,
    productIdForGroup,
    groupForProduct,
    productId
  });
  if (typeof module !== 'undefined' && module.exports) module.exports = root.PulumurP3DVProductIdentity;
})(typeof window !== 'undefined' ? window : globalThis);
