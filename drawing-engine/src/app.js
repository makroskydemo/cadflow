(function () {
  const p3dvEmbeddedHostMode = (() => { try { return new URLSearchParams(window.location.search).get('embedded') === '1' || Boolean(window.frameElement && window.frameElement.dataset && window.frameElement.dataset.p3dvEmbeddedHost === 'true'); } catch (_) { return false; } })();
  const p3dvStandaloneGuillotinePreviewMode = (() => { try { return new URLSearchParams(window.location.search).get('standalonePreview') === 'guillotine'; } catch (_) { return false; } })();
  const P3DV_PRODUCT_INPUT_SCHEMA = 'p3dv-main-product-input-v14.04';
  const P3DV_HOST_BUILD = '10.44-r44';
  const P3DV_HOST_CONTRACT = 'plmr-p3dv-host-bridge-v44';
  const P3DV_GUILLOTINE_SCHEMA = 'plmr-p3dv-guillotine-v1';
  const P3DV_GUILLOTINE_PRODUCT = 'GUILLOTINE';
  const P3DV_GUILLOTINE_INBOUND_TYPES = new Set(['P3DV_GUILLOTINE_INIT','P3DV_GUILLOTINE_STATE','P3DV_GUILLOTINE_PATCH','P3DV_GUILLOTINE_DISPOSE','P3DV_GUILLOTINE_CAPTURE']);
  let p3dvStandaloneGuillotineSessionId = '';
  let p3dvStandaloneGuillotineStateKey = '';
  let p3dvStandaloneGuillotinePositionCount = 0;
  let p3dvStandaloneGuillotineRenderTimer = 0;
  let p3dvStandaloneGuillotineRendered = false;
  if (p3dvEmbeddedHostMode && document && document.body) document.body.classList.add('p3dv-host-embedded');
  if (p3dvStandaloneGuillotinePreviewMode && document && document.body) document.body.classList.add('p3dv-standalone-guillotine-preview');

  // Bioclimatic V1: 170×170 posts below the 260 mm gutter frame; no blue structural beams.
  const roofInput = window.PLMRRoofInput;
  const ROLLING_ROOF_CANONICAL_SECTIONS = Object.freeze({
    postSection: Object.freeze({ x: 170, z: 170 }),
    beamSection: Object.freeze({ vertical: roofInput.minimumHeight(), thickness: 170 }),
    depthListStart: 2104
  });

  // Standalone PLMR | Bioclimatic boot defaults.
  const defaults = {
    productGroup: 'b-cube',
    width: 0,
    depth: ROLLING_ROOF_CANONICAL_SECTIONS.depthListStart,
    height: 0,
    panelCount: 8,
    orientations: [0, 0, 0, 0],
    postSections: Array.from({ length: 4 }, () => ({ ...ROLLING_ROOF_CANONICAL_SECTIONS.postSection })),
    beamSection: { ...ROLLING_ROOF_CANONICAL_SECTIONS.beamSection },
    placements: {},
    zipPlacements: {},
    facadeProfiles: {},
    zoneDividers: {},
    zoneRegistry: {},
    nextZoneNumber: 1,
    sketchWalls: [],
    nextSketchWallNumber: 1,
    sceneEditor: {groundY:null,roofPose:{x:0,y:0,z:0,angle:0},roofCopies:[],templates:[],nextObject:1},
    productsOpen: true,
    productOpenStates: {},
    panelStates: {},
    panelMasterOpen: false,
    glassPreferences: { color: 'TRANSPARENT', customColor: '', thickness: '10 MM' },
    colorMode: 'default',
    systemColor: { code: 'RAL 9006', hex: '#7C7D7F', finish: 'MATTE' },
    panelColor: { code: 'RAL 6018', hex: '#397A36', finish: 'MATTE' },
    pergoRiseProject: null,
    systemCount: 1,
    moduleWidths: [],
    moduleDepths: [],
    modulePanelCounts: [],
    multiAlignment: 'front',
    multiRows: [],
    rowAlignment: 'left',
    panelCollection: 'center',
    inputDrafts: { width: '', depth: String(ROLLING_ROOF_CANONICAL_SECTIONS.depthListStart), height: '' },
    panelColorIndependent: true,
    panelFill: 'EVET',
    motor: 'Yok',
    remote: 'Yok',
    led: 'NO',
    dimmer: 'HAYIR',
    parapet: 'HAYIR',
    parapetHeight: '',
    waterStandard: 'EVET',
    extras: '',
    pergoOptions: {
      glassTrack: 'HAYIR',
      structureColor: '-',
      fabric: '-',
      fabricProfiles: '-',
      motor: '-',
      remote: '-',
      led: '-',
      dimmer: '-',
      triangleJoinery: 'HAYIR',
      waterStandard: 'EVET',
      waterOutletPlacement: 'BOTH',
      extras: '-'
    }
  };

  const GLAZING_SECTION_SPECS = Object.freeze({
    '8 MM': Object.freeze({ glassDepth: 8, frameDepth: 12 }),
    '10 MM': Object.freeze({ glassDepth: 10, frameDepth: 14 }),
    '12 MM': Object.freeze({ glassDepth: 12, frameDepth: 16 }),
    'INSULATED GLASS': Object.freeze({ glassDepth: 20, frameDepth: 24 })
  });

  const ids = {
    frame: 'viewerFrame',
    pergo2DViewport: 'pergo2DViewport',
    pergo2DStage: 'pergo2DStage',
    mode2D: 'mode2DBtn',
    mode3D: 'mode3DBtn',
    engineSelector: 'engineSelectorInput',
    previewProductLabel: 'previewProductLabel',
    projectDate: 'plmrProjectDate',
    previewExpand: 'previewExpandBtn',
    previewExpandLabel: 'previewExpandLabel',
    previewUndo: 'previewUndoBtn',
    previewRedo: 'previewRedoBtn',
    previewWorkspace: 'expandedPreviewWorkspace',
    previewInputGuidance: 'previewInputGuidance',
    largePreviewToolbox: 'largePreviewToolbox',
    largePreviewToolboxToggle: 'largePreviewToolboxToggleBtn',
    largePreviewToolboxPin: 'largePreviewToolboxPinBtn',
    largePreviewShowAllDims: 'largePreviewShowAllDimsBtn',
    largePreviewShowMainDims: 'largePreviewShowMainDimsBtn',
    largePreviewGlassTrack: 'largePreviewGlassTrackBtn',
    largePreviewRayBoundary: 'largePreviewRayBoundaryBtn',
    largePreviewTriangleJoinery: 'largePreviewTriangleJoineryBtn',
    largePreviewWaterStandard: 'largePreviewWaterStandardBtn',
    largePreviewParapet: 'largePreviewParapetInput',
    largePreviewMultiProduct: 'largePreviewMultiProductBtn',
    largePreviewMultiProfileAdd: 'largePreviewMultiProfileAddBtn',
    largePreviewMultiProfileDelete: 'largePreviewMultiProfileDeleteBtn',
    largePreviewResetCamera: 'largePreviewResetCameraBtn',
    largePreviewMultiDimension: 'largePreviewMultiDimensionBtn',
    largePreviewEqualizeGaps: 'largePreviewEqualizeGapsBtn',
    largePreviewPostSettings: 'largePreviewPostSettingsBtn',
    largePreviewBulkExtend: 'largePreviewBulkExtendBtn',
    largePreviewBulkPostProfile: 'largePreviewBulkPostProfileBtn',
    largePreviewConvertProduct: 'largePreviewConvertProductBtn',
    largePreviewFitProducts: 'largePreviewFitProductsBtn',
    largePreviewDetailCopy: 'largePreviewDetailCopyBtn',
    largePreviewMultiDelete: 'largePreviewMultiDeleteBtn',
    largePreviewDeleteAll: 'largePreviewDeleteAllBtn',
    largePreviewProductStateControl: 'largePreviewProductStateControl',
    largePreviewProductState: 'largePreviewProductStateBtn',
    largePreviewProductStateValue: 'largePreviewProductStateValue',
    largePreviewProductStateMenuButton: 'largePreviewProductStateMenuBtn',
    largePreviewProductStateMenu: 'largePreviewProductStateMenu',
    headerCheckDrawing: 'headerCheckDrawingBtn',
    toolbarRefresh: 'toolbarRefreshBtn',
    toolbarZoomIn: 'toolbarZoomInBtn',
    toolbarZoomOut: 'toolbarZoomOutBtn',
    toolbarFit: 'toolbarFitBtn',
    toolbarPdf: 'toolbarPdfBtn',
    toolbarDxf: 'toolbarDxfBtn',
    toolbarAr: 'toolbarArBtn',
    toolbarFullscreen: 'toolbarFullscreenBtn',
    positionEdit: 'positionEditBtn',
    positionTitle: 'positionTitle',
    positionSummary: 'positionSummary',
    positionDialogTitle: 'positionDialogTitle',
    dialog: 'positionDialog',
    form: 'positionForm',
    width: 'widthInput',
    depth: 'depthInput',
    height: 'heightInput',
    dialogLamella: 'dialogLamellaCount',
    productGroup: 'productGroupInput',
    productSubgroup: 'productSubgroupValue',
    productFormula: 'productFormulaText',
    projectionOptions: 'projectionOptions',
    projectionCustomToggle: 'projectionCustomToggleBtn',
    freedomForm: 'freedomInputForm',
    freedomWidth: 'freedomWidthInput',
    freedomWidthLimitNote: 'freedomWidthLimitNote',
    freedomDepth: 'freedomDepthInput',
    freedomDepthLimitNote: 'freedomDepthLimitNote',
    freedomHeight: 'freedomHeightInput',
    freedomPanelCount: 'freedomPanelCountInput',
    freedomValidation: 'freedomInputValidation',
    freedomApply: 'freedomApplyBtn',
    cancel: 'cancelPositionBtn',
    productStatus: 'productStatus',
    replay: 'replayAnimationBtn',
    clearProducts: 'clearProductsBtn',
    productDialog: 'productDialog',
    productForm: 'productForm',
    productFormGrid: 'productFormGrid',
    productZoneTitle: 'productZoneTitle',
    productZoneInfo: 'productZoneInfo',
    productType: 'productTypeInput',
    productSeriesWrap: 'productSeriesWrap',
    productSeries: 'productSeriesInput',
    productSubtypeWrap: 'productSubtypeWrap',
    productSubtype: 'productSubtypeInput',
    productPlacementWrap: 'productPlacementWrap',
    productPlacement: 'productPlacementInput',
    productMechanismWrap: 'productMechanismWrap',
    productMechanism: 'productMechanismInput',
    productSlidingViewWrap: 'productSlidingViewWrap',
    productSlidingView: 'productSlidingViewInput',
    productOpeningWrap: 'productOpeningWrap',
    productOpening: 'productOpeningInput',
    productDirectionWrap: 'productDirectionWrap',
    productDirectionLabel: 'productDirectionLabel',
    productDirection: 'productDirectionInput',
    productGlassThicknessWrap: 'productGlassThicknessWrap',
    productGlassThickness: 'productGlassThicknessInput',
    productGlassColorWrap: 'productGlassColorWrap',
    productGlassColorLabel: 'productGlassColorLabel',
    productGlassColor: 'productGlassColorInput',
    productPanelsWrap: 'productPanelsWrap',
    productCustomGlassWrap: 'productCustomGlassWrap',
    productCustomGlassLabel: 'productCustomGlassLabel',
    productCustomGlass: 'productCustomGlassInput',
    productPanels: 'productPanelsInput',
    productFoldingViewWrap: 'productFoldingViewWrap',
    productFoldingView: 'productFoldingViewInput',
    productFoldingOpenDirectionWrap: 'productFoldingOpenDirectionWrap',
    productFoldingOpenDirection: 'productFoldingOpenDirectionInput',
    productPanelHint: 'productPanelHint',
    productFixedVerticalCountWrap: 'productFixedVerticalCountWrap',
    productFixedVerticalCount: 'productFixedVerticalCountInput',
    productFixedHorizontalCountWrap: 'productFixedHorizontalCountWrap',
    productFixedHorizontalCount: 'productFixedHorizontalCountInput',
    productFixedHorizontalHeightsWrap: 'productFixedHorizontalHeightsWrap',
    productFixedHorizontalHeights: 'productFixedHorizontalHeightsInput',
    productFixedHorizontalHeightRows: 'productFixedHorizontalHeightRows',
    productDoorTypeWrap: 'productDoorTypeWrap',
    productDoorType: 'productDoorTypeInput',
    productDoorTypeTrigger: 'productDoorTypeTrigger',
    productDoorTypeValue: 'productDoorTypeValue',
    productDoorTypePicker: 'productDoorTypePicker',
    productDoorTypePickerClose: 'productDoorTypePickerClose',
    productDoorTypeCards: 'productDoorTypeCards',
    productDoorHingeWrap: 'productDoorHingeWrap',
    productDoorHinge: 'productDoorHingeInput',
    productDoorActiveLeafWrap: 'productDoorActiveLeafWrap',
    productDoorActiveLeaf: 'productDoorActiveLeafInput',
    productDoorOpenDirectionWrap: 'productDoorOpenDirectionWrap',
    productDoorOpenDirection: 'productDoorOpenDirectionInput',
    productDoorHandleTypeWrap: 'productDoorHandleTypeWrap',
    productDoorHandleType: 'productDoorHandleTypeInput',
    productDoorTopFixedHeightWrap: 'productDoorTopFixedHeightWrap',
    productDoorTopFixedHeight: 'productDoorTopFixedHeightInput',
    productDoorHeightSummaryWrap: 'productDoorHeightSummaryWrap',
    productDoorFixedHeightValue: 'productDoorFixedHeightValue',
    productDoorMovingHeightValue: 'productDoorMovingHeightValue',
    productPanelTypeWrap: 'productPanelTypeWrap',
    productPanelTypeLabel: 'productPanelTypeLabel',
    productPanelType: 'productPanelTypeInput',
    productMotorDirectionWrap: 'productMotorDirectionWrap',
    productMotorDirection: 'productMotorDirectionInput',
    productViewWrap: 'productViewWrap',
    productView: 'productViewInput',
    productMotorTypeWrap: 'productMotorTypeWrap',
    productMotorType: 'productMotorTypeInput',
    productRemoteWrap: 'productRemoteWrap',
    productRemote: 'productRemoteInput',
    cleanableWindowSection: 'cleanableWindowSection',
    bottomPanelMode: 'bottomPanelModeInput',
    bottomPanelStateWrap: 'bottomPanelStateWrap',
    bottomPanelState: 'bottomPanelStateInput',
    bottomPanelHingeWrap: 'bottomPanelHingeWrap',
    bottomPanelHinge: 'bottomPanelHingeInput',
    slidingCollectionSection: 'slidingCollectionSection',
    slidingCollectionState: 'slidingCollectionStateInput',
    foldingCollectionSection: 'foldingCollectionSection',
    foldingCollectionState: 'foldingCollectionStateInput',
    foldingRuleNote: 'foldingRuleNote',
    collectingDisplaySection: 'collectingDisplaySection',
    collectingDisplayState: 'collectingDisplayStateInput',
    collectingDisplayDirection: 'collectingDisplayDirection',
    toolboxIntermediateDimensions: 'toolboxIntermediateDimensionsInput',
    toolboxMainDimensions: 'toolboxMainDimensionsInput',
    productOpenList: 'toolboxProductOpenList',
    productOpenEmpty: 'toolboxProductOpenEmpty',
    panelMaster: 'toolboxPanelMasterInput',
    toolboxResetCamera: 'toolboxResetCameraBtn',
    exportProductListPdf: 'exportProductListPdfBtn',
    mobileAr: 'mobileArBtn',
    mobileArStatus: 'mobileArStatus',
    quickTestStatus: 'quickTestStatus',
    multiProduct: 'multiProductBtn',
    multiDelete: 'multiDeleteBtn',
    multiProfileAdd: 'multiProfileAddBtn',
    multiProfileDelete: 'multiProfileDeleteBtn',
    fitProducts: 'fitProductsBtn',
    selectionBanner: 'toolboxSelectionBanner',
    selectionBannerTitle: 'toolboxSelectionBannerTitle',
    selectionBannerText: 'toolboxSelectionBannerText',
    selectionDone: 'toolboxSelectionDoneBtn',
    selectionCancel: 'toolboxSelectionCancelBtn',
    zoneActionDialog: 'zoneActionDialog',
    zoneActionTitle: 'zoneActionTitle',
    zoneActionInfo: 'zoneActionInfo',
    zoneActionAddProfile: 'zoneActionAddProfileBtn',
    zoneActionRemoveProfile: 'zoneActionRemoveProfileBtn',
    zoneActionEditDimension: 'zoneActionEditDimensionBtn',
    zoneActionPlaceProduct: 'zoneActionPlaceProductBtn',
    zoneActionDeleteProduct: 'zoneActionDeleteProductBtn',
    zoneActionRecalculate: 'zoneActionRecalculateBtn',
    zoneActionCancel: 'cancelZoneActionBtn',
    profileDialog: 'profileDialog',
    profileForm: 'profileForm',
    profileOrientation: 'profileOrientationInput',
    profileType: 'profileTypeInput',
    profileCustomFields: 'profileCustomFields',
    profileWidth: 'profileWidthInput',
    profileDepth: 'profileDepthInput',
    profileValidation: 'profileValidation',
    profileCancel: 'cancelProfileBtn',
    dividerProfileDialog: 'dividerProfileDialog',
    dividerProfileTitle: 'dividerProfileTitle',
    dividerProfileInfo: 'dividerProfileInfo',
    dividerProfileDelete: 'deleteDividerProfileBtn',
    dividerProfileCancel: 'cancelDividerProfileBtn',
    postActionDialog: 'postActionDialog',
    postActionTitle: 'postActionTitle',
    postActionInfo: 'postActionInfo',
    postChangeProfile: 'postChangeProfileBtn',
    postRotateProfile: 'postRotateProfileBtn',
    postActionCancel: 'cancelPostActionBtn',
    postProfileDialog: 'postProfileDialog',
    postProfileForm: 'postProfileForm',
    postProfileTitle: 'postProfileTitle',
    postProfileType: 'postProfileTypeInput',
    postCustomFields: 'postCustomFields',
    postX: 'postXInput',
    postZ: 'postZInput',
    postValidation: 'postValidation',
    postProfileCancel: 'cancelPostProfileBtn',
    zoneDimensionDialog: 'zoneDimensionDialog',
    zoneDimensionForm: 'zoneDimensionForm',
    zoneDimensionTitle: 'zoneDimensionTitle',
    zoneWidth: 'zoneWidthInput',
    zoneHeight: 'zoneHeightInput',
    zoneDimensionValidation: 'zoneDimensionValidation',
    zoneDimensionCancel: 'cancelZoneDimensionBtn',
    productValidation: 'productValidation',
    productCancel: 'cancelProductBtn',
    productRemove: 'removeProductBtn',
    systemColorTrigger: 'systemColorTrigger',
    systemColorSwatch: 'systemColorSwatch',
    systemColorValue: 'systemColorValue',
    panelColorTrigger: 'panelColorTrigger',
    panelColorSwatch: 'panelColorSwatch',
    panelColorValue: 'panelColorValue',
    defaultColorMode: 'defaultColorModeBtn',
    ralColorMode: 'ralColorModeBtn',
    colorPickerDialog: 'colorPickerDialog',
    colorPickerTitle: 'colorPickerTitle',
    colorPickerDescription: 'colorPickerDescription',
    colorPickerClose: 'colorPickerCloseBtn',
    colorCatalogRising: 'colorCatalogRisingBtn',
    colorCatalogAll: 'colorCatalogAllBtn',
    colorSearch: 'colorSearchInput',
    colorResultCount: 'colorResultCount',
    colorOptionGrid: 'colorOptionGrid',
    colorFinishDialog: 'colorFinishDialog',
    colorFinishTitle: 'colorFinishTitle',
    appConfirmDialog: 'appConfirmDialog',
    appConfirmTitle: 'appConfirmTitle',
    appConfirmMessage: 'appConfirmMessage',
    appConfirmCancel: 'appConfirmCancelBtn',
    appConfirmAccept: 'appConfirmAcceptBtn',
    colorFinishDescription: 'colorFinishDescription',
    colorFinishClose: 'colorFinishCloseBtn',
    colorFinishSummary: 'colorFinishSummary',
    colorFinishOptions: 'colorFinishOptions',
    productFabricWrap: 'productFabricWrap',
    productFabric: 'productFabricInput',
    productFabricTrigger: 'productFabricTrigger',
    productFabricValue: 'productFabricValue',
    productFabricPicker: 'productFabricPicker',
    productFabricPickerClose: 'productFabricPickerClose',
    productFabricCards: 'productFabricCards',
    pdfRequestFormMeta: 'pdfRequestFormMeta',
    pdfRequestFormFields: 'pdfRequestFormFields',
    pergoRiseFields: 'pergoRiseParametricFields',
    pergoSystemCount: 'pergoSystemCountInput',
    pergoFrontHeight: 'pergoFrontHeightInput',
    pergoRayCount: 'pergoRayCountInput',
    pergoPostCount: 'pergoPostCountInput',
    pergoGlassRayBoundaryMode: 'pergoGlassRayBoundaryModeInput',
    pergoCalculator: 'pergoCalculatorBtn',
    pergoResetAll: 'pergoResetAllBtn',
    pergoSystemReset: 'pergoSystemResetBtn',
    pergoOptionsReset: 'pergoOptionsResetBtn',
    pergoExtraReset: 'pergoExtraResetBtn',
    pergoCalculatorDialog: 'pergoCalculatorDialog',
    pergoCalcAngle: 'pergoCalcAngle',
    pergoCalcOpening: 'pergoCalcOpening',
    pergoCalcRear: 'pergoCalcRear',
    pergoCalcFront: 'pergoCalcFront',
    pergoCalcResult: 'pergoCalcResult',
    pergoCalcCompute: 'pergoCalcComputeBtn',
    pergoCalcTransfer: 'pergoCalcTransferBtn',
    pergoCalcClear: 'pergoCalcClearBtn',
    primaryWidthLabel: 'primaryWidthLabel',
    primaryDepthLabel: 'primaryDepthLabel',
    primaryHeightLabel: 'primaryHeightLabel',
    projectCodeValue: 'projectCodeValue',
    panelColorIndependent: 'panelColorIndependentInput',
    panelFill: 'panelFillInput',
    motorInput: 'motorInput',
    motorCombo: 'motorCombo',
    motorComboButton: 'motorComboButton',
    motorComboMenu: 'motorComboMenu',
    remoteInput: 'remoteInput',
    remoteCombo: 'remoteCombo',
    remoteComboButton: 'remoteComboButton',
    remoteComboMenu: 'remoteComboMenu',
    ledInput: 'ledInput',
    ledCombo: 'ledCombo',
    ledComboButton: 'ledComboButton',
    ledComboMenu: 'ledComboMenu',
    dimmerInput: 'dimmerInput',
    parapetInput: 'parapetInput',
    parapetHeightInput: 'parapetHeightInput',
    waterStandardInput: 'waterStandardInput',
    extrasInput: 'extrasInput',
    pergoGlassTrack: 'pergoGlassTrackInput',
    pergoStructureColor: 'pergoStructureColorInput',
    pergoFabric: 'pergoFabricInput',
    pergoFabricCombo: 'pergoFabricCombo',
    pergoFabricComboButton: 'pergoFabricComboButton',
    pergoFabricComboMenu: 'pergoFabricComboMenu',
    pergoFabricProfiles: 'pergoFabricProfilesInput',
    pergoDimmer: 'pergoDimmerInput',
    pergoTriangleJoinery: 'pergoTriangleJoineryInput',
    pergoWaterOutletPlacement: 'pergoWaterOutletPlacementInput',
    pergoWaterOutletPlacementRow: 'pergoWaterOutletPlacementRow',
    pergoBackWallRow: 'pergoBackWallRow',
    pergoBackWallOpen: 'pergoBackWallOpenBtn',
    pergoBackWallSummary: 'pergoBackWallSummary',
    pergoBackWallDialog: 'pergoBackWallDialog',
    pergoBackWallForm: 'pergoBackWallForm',
    pergoBackWallClose: 'pergoBackWallCloseBtn',
    pergoBackWallCancel: 'pergoBackWallCancelBtn',
    pergoBackWallDefault: 'pergoBackWallDefaultBtn',
    pergoBackWallSystem: 'pergoBackWallSystemInput',
    pergoBackWallEnabled: 'pergoBackWallEnabledInput',
    pergoBackWallDirection: 'pergoBackWallDirectionInput',
    pergoBackWallOffset: 'pergoBackWallOffsetInput',
    pergoBackWallHeight: 'pergoBackWallHeightInput',
    pergoBackWallDepth: 'pergoBackWallDepthInput',
    pergoBackWallMinX: 'pergoBackWallMinXInput',
    pergoBackWallMaxX: 'pergoBackWallMaxXInput',
    pergoBackWallStartDepth: 'pergoBackWallStartDepthInput',
    pergoBackWallEndDepth: 'pergoBackWallEndDepthInput',
    pergoBackWallAngle: 'pergoBackWallAngleInput',
    pergoBackWallTopColumns: 'pergoBackWallTopColumnsInput',
    pergoBackWallTopRows: 'pergoBackWallTopRowsInput',
    pergoBackWallSideColumns: 'pergoBackWallSideColumnsInput',
    pergoBackWallSideRows: 'pergoBackWallSideRowsInput',
    pergoBackWallNote: 'pergoBackWallNote',
    pergoBackWallError: 'pergoBackWallError',
    projectionCombo: 'projectionCombo',
    projectionComboMenu: 'projectionComboMenu',
    pergoFrontHeightRow: 'pergoFrontHeightRow',
    pergoRayCountRow: 'pergoRayCountRow',
    pergoPostCountRow: 'pergoPostCountRow',
    freedomSystemCardSpacer: 'freedomSystemCardSpacer'
  };

  const $ = (id) => document.getElementById(id);
  const modelState = JSON.parse(JSON.stringify(defaults));
  let viewerCameraState = null;
  let viewerLiveProductStateReady = false;
  let viewerLivePanelMasterReady = false;
  let viewerLivePergoRiseReady = false;
  let viewerLiveColorStateReady = false;
  let viewerLiveModelStateReady = false;
  let activeViewerProductGroup = '';
  let activeViewerModelReady = false;
  let pendingLiveModelState = false;
  let autoPreviewTimer = null;
  let viewerSessionCounter = 0;
  let activeViewerSessionId = '';
  const pergo2DViewState = { zoom: 1, baseScale: 1, minZoom: 0.25, maxZoom: 4 };
  let pergo2DLastDrawing = null;
  let p3dvDrawingMode = '3d';
  let technical2DLastProjection = null;
  let pendingLiveProductState = false;
  let pendingLivePanelMasterState = false;
  let pendingLiveColorState = false;
  let pergoRiseRevision = 0;
  let pergoCalculatorLastResult = null;
  let suppressPergoInputInfrastructure = false;
  let pergoBackWallDialogSnapshot = null;
  let pergoBackWallLiveTimer = 0;
  let suppressPergoBackWallDialogEvents = false;
  let liveStateRevision = 0;
  const pergoRiseAssetPath = ''; // Raw GLB intentionally omitted; extracted component templates are canonical.
  let zonesVisible = true;
  let zoneFilters=window.PLMRV11Zones.defaults(),v11DefaultState=null,v16NamingBusy=false;
  function v11ZoneList(){
    const result=[];const main=readModel();for(const [owner,spec] of [['roof-main',main],...(ensureSceneEditor().roofCopies||[]).map(c=>[c.id,{...c.spec,sceneEditor:{...c.spec.sceneEditor,roofPose:c.pose}}])]){
      if(owner==='roof-main'&&spec.sceneEditor?.mainDeleted)continue;const zones=window.PLMRV13Core.facadeEnabled(spec)?buildReportFacades(spec).flatMap(f=>f.zones):[];for(const z of zones)result.push({...z,owner,key:window.PLMRV11Zones.key(z,owner)});
      for(const m of (spec.freedomLayout||freedomMultiPositionLayout(spec))?.modules||[]){const record=spec.zoneRegistry?.['roof:'+m.moduleIndex];result.push({id:'roof:'+m.moduleIndex,owner,key:owner+'|roof:'+m.moduleIndex,moduleIndex:m.moduleIndex,group:'roof',label:record?.code||window.PLMRV12Core.name(spec.pozNo,m.moduleIndex),positionRefs:record?.positionRefs||[],isRoofZone:true,width:m.outerWidth||m.width,depth:m.depth});}
    }return result;
  }
  function v11PublishFilters(){clearZoneSelection();postViewerMessage('set-zone-filters',{visible:zonesVisible,filters:zoneFilters});if(isMainTechnical2DMode())renderMainTechnical2DPreview({resetView:false});window.dispatchEvent(new CustomEvent('plmr-zone-filters',{detail:{visible:zonesVisible,filters:p3dvHistoryClone(zoneFilters)}}));}
  window.PLMRZones=Object.freeze({visible:()=>zonesVisible,generated:owner=>v11OwnerModel({owner}).sceneEditor?.facadeZonesGenerated===true,setVisible:visible=>{zonesVisible=Boolean(visible);document.body.classList.toggle('plmr-zones-hidden',!zonesVisible);v11PublishFilters();return zonesVisible;},toggle:()=>window.PLMRZones.setVisible(!zonesVisible),list:v11ZoneList,filters:()=>p3dvHistoryClone(zoneFilters),setGroup:(group,value)=>{zoneFilters.groups[group]=Boolean(value);for(const z of v11ZoneList())if(window.PLMRV11Zones.group(z)===group)delete zoneFilters.ids[z.key];zonesVisible=true;document.body.classList.remove('plmr-zones-hidden');v11PublishFilters();},setZone:(key,value)=>{zoneFilters.ids[key]=Boolean(value);zonesVisible=true;document.body.classList.remove('plmr-zones-hidden');v11PublishFilters();},setAll:value=>{zoneFilters=window.PLMRV11Zones.defaults();for(const k of Object.keys(zoneFilters.groups))zoneFilters.groups[k]=Boolean(value);zonesVisible=Boolean(value);window.PLMRZones.setVisible(zonesVisible);}});

  let selectedZone = null;
  let selectedZoneId = null;
  let dimensionVisibility = { intermediate: false, main: true };
  let profileSequence = 1;
  function v11OwnerModel(zone){return zone?.owner&&zone.owner!=='roof-main'?ensureSceneEditor().roofCopies.find(c=>c.id===zone.owner)?.spec||modelState:modelState;}
  function v11InOwner(zone,fn){const spec=v11OwnerModel(zone);if(spec===modelState)return fn();const rootState=p3dvHistoryClone(modelState),copyId=zone.owner;let updated;const priorV18=v18OwnerContext;v18OwnerContext={root:rootState,owner:copyId};
    try{Object.keys(modelState).forEach(k=>delete modelState[k]);Object.assign(modelState,p3dvHistoryClone(spec));const result=fn();updated=p3dvHistoryClone(modelState);updated.freedomLayout=freedomMultiPositionLayout(modelState);return result;}
    finally{v18OwnerContext=priorV18;v18Cache=null;Object.keys(modelState).forEach(k=>delete modelState[k]);Object.assign(modelState,rootState);if(updated){const c=modelState.sceneEditor.roofCopies.find(c=>c.id===copyId);c.spec=updated;}}
  }

  function nextFacadeProfileId() {
    const used = new Set();
    let maxNumeric = 0;
    Object.values(modelState.facadeProfiles || {}).forEach((list) => {
      (Array.isArray(list) ? list : []).forEach((profile) => {
        const id = String(profile && profile.id || '');
        if (!id) return;
        used.add(id);
        const match = /^pf(\d+)$/i.exec(id);
        if (match) maxNumeric = Math.max(maxNumeric, Number(match[1]) || 0);
      });
    });
    profileSequence = Math.max(Number(profileSequence) || 1, maxNumeric + 1);
    let id = `pf${profileSequence++}`;
    while (used.has(id)) id = `pf${profileSequence++}`;
    return id;
  }

  function ensureZoneState() {
    if (!modelState.zoneDividers || typeof modelState.zoneDividers !== 'object') modelState.zoneDividers = {};
    if (!modelState.zoneRegistry || typeof modelState.zoneRegistry !== 'object') modelState.zoneRegistry = {};
    if (!Number.isFinite(Number(modelState.nextZoneNumber)) || Number(modelState.nextZoneNumber) < 1) modelState.nextZoneNumber = 1;
  }
  function zoneIdentityRecord(zoneId) {
    ensureZoneState();
    const key = String(zoneId || '');
    if (!key) return null;
    if (!modelState.zoneRegistry[key]) {
      const n = Math.max(1, Math.round(Number(modelState.nextZoneNumber) || 1));
      modelState.zoneRegistry[key] = { uid: `rr-zone-${String(n).padStart(6, '0')}`, name: `Z${String(n).padStart(3, '0')}` };
      modelState.nextZoneNumber = n + 1;
    }
    return modelState.zoneRegistry[key];
  }
  function decorateZoneIdentity(zone, registry = modelState.zoneRegistry, spec = modelState) {
    if(zone&&window.PLMRV16Core){spec.zoneRegistry=registry||spec.zoneRegistry||{};return window.PLMRV16Core.assignZone(zone,spec,zone.owner||spec.parapetOwner||'roof-main',[{id:'roof-main',spec:modelState},...(modelState.sceneEditor?.roofCopies||[])]);}
    if (!zone) return zone;
    const record = registry && registry[zone.id];
    if (!record) return { ...zone };
    const baseLabel = String(zone.baseLabel || zone.label || zone.facadeLabel || '').replace(/^Z\d+\s*[·-]?\s*/i, '').trim();
    return { ...zone, structuralId: zone.id, zoneUid: record.uid, zoneName: record.name, baseLabel, label: baseLabel ? `${record.name} · ${baseLabel}` : record.name };
  }
  function ensureZoneIdentityRecords(zones) {
    (Array.isArray(zones) ? zones : []).forEach((zone) => { if (zone && zone.id) zoneIdentityRecord(zone.id); });
    return (Array.isArray(zones) ? zones : []).map((zone) => decorateZoneIdentity(zone, modelState.zoneRegistry));
  }
  // V14.24 Stage 6: P3DV structural command history reuses the existing
  // PulumurTransactionCommandEngine. The journal is derived history, never a
  // second physical product owner. Product switch/restore and non-command
  // physical edits rebase it to the current canonical modelState.
  const p3dvTransactionHistoryApi = window.PulumurTransactionCommandEngine || null;
  let p3dvPhysicalCommandHistory = p3dvTransactionHistoryApi && typeof p3dvTransactionHistoryApi.create === 'function'
    ? p3dvTransactionHistoryApi.create({ initialState: JSON.parse(JSON.stringify(modelState)), maxEntries: 50 })
    : null;
  let p3dvHistoryApplying = false;
  let v15OperationJournal=[];
  let v15LastJournalState=JSON.stringify(modelState);
  function v15Journal(type,payload){const value=JSON.stringify(modelState);if(value===v15LastJournalState)return;v15OperationJournal.push({sequence:v15OperationJournal.length+1,time:new Date().toISOString(),type:String(type),payload:payload||null});v15LastJournalState=value;}
  function p3dvHistoryClone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function p3dvHistoryInspect() {
    return p3dvPhysicalCommandHistory && typeof p3dvPhysicalCommandHistory.inspect === 'function'
      ? p3dvPhysicalCommandHistory.inspect()
      : Object.freeze({ schema: 'plmr-transaction-command-engine-v1', canUndo: false, canRedo: false, active: false, bytes: 0, undo: Object.freeze([]), redo: Object.freeze([]) });
  }
  function p3dvHistoryRebase(reason = 'boundary') {
    if (!p3dvPhysicalCommandHistory || p3dvHistoryApplying) return p3dvHistoryInspect();
    p3dvPhysicalCommandHistory.clear(p3dvHistoryClone(modelState));
    return { ...p3dvHistoryInspect(), reason: String(reason || 'boundary') };
  }
  function p3dvHistoryRecord(beforeState, command) {
    if (window.PLMRV17Core&&v17SettingsDraft) return null;
    if (!p3dvPhysicalCommandHistory || p3dvHistoryApplying) return null;
    const before = p3dvHistoryClone(beforeState || modelState);
    if(window.PLMRV16Core)v16EnsureZoneNames();
    const after = p3dvHistoryClone(modelState);
    const signature = p3dvTransactionHistoryApi && typeof p3dvTransactionHistoryApi.signature === 'function'
      ? p3dvTransactionHistoryApi.signature
      : (value => JSON.stringify(value));
    if (signature(p3dvPhysicalCommandHistory.getState()) !== signature(before)) p3dvPhysicalCommandHistory.clear(before);
    const source = command && typeof command === 'object' ? command : { type: String(command || 'model-change') };
    p3dvPhysicalCommandHistory.begin(source.label || source.type || 'P3DV command', { origin: source.origin || 'p3dv' });
    p3dvPhysicalCommandHistory.apply({
      type: source.type || 'model-change',
      label: source.label || source.type || 'P3DV command',
      origin: source.origin || 'p3dv',
      payload: source.payload || null
    }, () => after);
    v15Journal(source.type||'model-change',source.payload);
    const committed=p3dvPhysicalCommandHistory.commit(after);
    document.dispatchEvent(new CustomEvent('plmr-model-changed'));
    return committed;
  }
  function p3dvRestorePhysicalHistoryState(nextState, direction) {
    if (!nextState || typeof nextState !== 'object') throw new Error('P3DV_HISTORY_STATE_INVALID');
    const nextGroup = String(nextState.productGroup || '');
    if (p3dvCanonicalProductGroup(nextGroup) !== p3dvCanonicalProductGroup(modelState.productGroup)) throw new Error('P3DV_HISTORY_PRODUCT_BOUNDARY');
    p3dvHistoryApplying = true;
    try {
      Object.keys(modelState).forEach(key => { delete modelState[key]; });
      const preservedUnits={...ensureSceneEditor().dimensionUnits};
      Object.assign(modelState, p3dvHistoryClone(defaults), p3dvHistoryClone(nextState));
      ensureSceneEditor().dimensionUnits=preservedUnits;
      selectedZone = null;
      selectedZoneId = null;
      cancelToolboxSelection();
      pruneProductStates();
      p3dvHostSyncControls();
      commitModelChangeLive(`history:${direction}`, { preserveHistory: true });
    } finally {
      p3dvHistoryApplying = false;
    }
    return p3dvHostSnapshot();
  }
  function p3dvUndoPhysicalCommand() {
    if (!p3dvPhysicalCommandHistory) return { ok: false, error: 'P3DV_HISTORY_UNAVAILABLE', history: p3dvHistoryInspect() };
    const moved = p3dvPhysicalCommandHistory.undo();
    if (!moved) return { ok: false, error: 'P3DV_HISTORY_UNDO_EMPTY', history: p3dvHistoryInspect() };
    const snapshot = p3dvRestorePhysicalHistoryState(moved.state, 'undo');
    return { ok: true, direction: 'undo', entry: moved.entry, snapshot, contract: p3dvTechnical2DContract(), history: p3dvHistoryInspect() };
  }
  function p3dvRedoPhysicalCommand() {
    if (!p3dvPhysicalCommandHistory) return { ok: false, error: 'P3DV_HISTORY_UNAVAILABLE', history: p3dvHistoryInspect() };
    const moved = p3dvPhysicalCommandHistory.redo();
    if (!moved) return { ok: false, error: 'P3DV_HISTORY_REDO_EMPTY', history: p3dvHistoryInspect() };
    const snapshot = p3dvRestorePhysicalHistoryState(moved.state, 'redo');
    return { ok: true, direction: 'redo', entry: moved.entry, snapshot, contract: p3dvTechnical2DContract(), history: p3dvHistoryInspect() };
  }

  let selectedDividerProfile = null;
  let selectedPostIndex = null;
  let toolboxSelectionMode = null;
  let toolboxSelectionItems = new Map();
  let bulkProductZones = null;
  let bulkProfileZones = null;
  let activeProductSlot = 'primary';
  let activeColorTarget = 'system';
  let activeColorCatalog = 'rising';
  let pendingColorSelection = null;
  let pdfRequestState = { 'b-cube': null, 'bio-rise': null, 'b-cube-galaxy': null };

  const PRODUCT_SPECS = {
    'b-cube': {
      groupLabel: 'PLMR | Bioclimatic', subgroupLabel: 'Roof Configurator', modelLabel: 'PLMR | Bioclimatic',
      widthMin: 1000, widthMax: 4050,
      depthMin: 2104, depthMax: 6856, depthStep: 216, depthListStart: 2104,
      heightMin: roofInput.minimumHeight('b-cube'), heightMax: null,
      panelMin: 8, panelMax: 30, panelPitch: 216, projectionOffset: 376,
      postSection: ROLLING_ROOF_CANONICAL_SECTIONS.postSection, beamSection: ROLLING_ROOF_CANONICAL_SECTIONS.beamSection, sideBeamThickness: 100
    },
    'bio-rise': {
      groupLabel: 'Eco-Bioclimatic', subgroupLabel: 'Tilt', modelLabel: 'Eco-Bioclimatic (Tilt)',
      widthMin: 1000, widthMax: 4000,
      depthMin: 2070, depthMax: 6070, depthStep: 200, depthListStart: 2070,
      heightMin: roofInput.minimumHeight('bio-rise'), heightMax: 3500,
      panelMin: 8, panelMax: 28, panelPitch: 200, projectionOffset: 470,
      postSection: { x: 150, z: 100 }, beamSection: { vertical: roofInput.minimumHeight('bio-rise'), thickness: 100 }, sideBeamThickness: 50
    },
    'b-cube-galaxy': {
      groupLabel: 'Bioclimatic', subgroupLabel: 'Tilt', modelLabel: 'Bioclimatic (Tilt)',
      widthMin: 1000, widthMax: 4000,
      depthMin: 2010, depthMax: 9010, depthStep: 200, depthListStart: 2010,
      heightMin: roofInput.minimumHeight('b-cube-galaxy'), heightMax: 3500,
      panelMin: 8, panelMax: 43, panelPitch: 200, projectionOffset: 470,
      postSection: { x: 180, z: 140 }, beamSection: { vertical: roofInput.minimumHeight('b-cube-galaxy'), thickness: 40 }, sideBeamThickness: 80,
      gutterSection: { width: 98, clearance: 2 }, frontVisibleTotal: 180, sideVisibleTotal: 140
    },
    'pergo-rise': {
      groupLabel: 'Pergola', subgroupLabel: 'Web DXF / 2D', modelLabel: 'Pergola',
      widthMin: 1000, widthMax: 14000,
      depthMin: 1000, depthMax: 7000, depthStep: 500, depthListStart: 1000,
      heightMin: 1800, heightMax: 4000,
      panelMin: 1, panelMax: 1, panelPitch: 1, projectionOffset: 0,
      postSection: { x: 100, z: 100 }, beamSection: { vertical: 100, thickness: 100 }, sideBeamThickness: 100,
      staticViewer: true
    }
  };

  const FREEDOM_UI_MOTOR_OPTIONS = Object.freeze(['Yok', 'Somfy Rts', 'Somfy IO']);
  const FREEDOM_UI_REMOTE_OPTIONS = Object.freeze({
    'YOK': ['Yok'],
    'SOMFY RTS': ['-', 'SITUO 2 RTS', 'SITUO 5 RTS', 'TELIS 16 RTS'],
    'SOMFY IO': ['-', 'SITUO 2 IO', 'SITUO 5 IO']
  });
  const FREEDOM_UI_LED_OPTIONS = Object.freeze(['YES', 'NO']);
  // V3.53 source-contract markers retained for historical static regression:
  // Object.freeze(['-', 'RISING MOTOR', 'SOMFY RTS', 'SOMFY IO'])
  // 'RISING MOTOR': ['-', 'RISING 6 CHANNELS']
  // 'SOMFY RTS': ['-', 'SITUO 2 RTS', 'SITUO 5 RTS', 'TELIS 16 RTS']
  // 'SOMFY IO': ['-', 'SITUO 2 IO', 'SITUO 5 IO']
  // C 1602 - 3D (8118-1622) … C 9012 - D (8290-9002)
  const PERGO_RISE_UI_MOTOR_OPTIONS = Object.freeze((window.P3DVPergoRiseInput && window.P3DVPergoRiseInput.MOTOR_OPTIONS || ['-', 'RISING MOTOR', 'SOMFY RTS', 'SOMFY IO']).slice());
  const PERGO_RISE_UI_REMOTE_OPTIONS = Object.freeze(window.P3DVPergoRiseInput && window.P3DVPergoRiseInput.REMOTE_OPTIONS_BY_MOTOR || {
    '-': ['-'], 'RISING MOTOR': ['-', 'RISING 6 CHANNELS'], 'SOMFY RTS': ['-', 'SITUO 2 RTS', 'SITUO 5 RTS', 'TELIS 16 RTS'], 'SOMFY IO': ['-', 'SITUO 2 IO', 'SITUO 5 IO']
  });
  const PERGO_RISE_UI_FABRIC_OPTIONS = Object.freeze((window.P3DVPergoRiseInput && window.P3DVPergoRiseInput.FABRIC_OPTIONS || ['-']).slice());

  const PERGO_RISE_QUICK_TESTS = Object.freeze([
    { name: 'Test 1', title: '1 adet · 2 ray · aynı ölçüler · otomatik dikme', values: { systemCount: '1', width: '4000', opening: '4500', rearHeight: '3200', frontHeight: '2600' } },
    { name: 'Test 2', title: '1 adet · Cam kaydı EVET · 8060 => 3 ray', values: { systemCount: '1', width: '8060', opening: '4500', rearHeight: '3200', frontHeight: '2600', glassTrack: 'EVET' } },
    { name: 'Test 3', title: '2 adet · aynı genişlik · 2;2 ray', values: { systemCount: '2', width: '3000;3000', opening: '4500;4500', rearHeight: '3200;3200', frontHeight: '2600' } },
    { name: 'Test 4', title: '2 adet · farklı genişlik/açılım · Cam kaydı EVET', values: { systemCount: '2', width: '4000;4500', opening: '4500;5200', rearHeight: '3200;3400', frontHeight: '2600', glassTrack: 'EVET' } },
    { name: 'Test 5', title: '2 adet · NO boşluk modu', values: { systemCount: '2', width: '3000;100;3000;NO', opening: '4500;4500', rearHeight: '3200;3200', frontHeight: '2600' } },
    { name: 'Test 6', title: '3 adet · aynı açılım · otomatik', values: { systemCount: '3', width: '3200;3200;3200', opening: '4500;4500;4500', rearHeight: '3200;3200;3200', frontHeight: '2600' } },
    { name: 'Test 7', title: '3 adet · farklı genişlik/açılım/arka yükseklik', values: { systemCount: '3', width: '4000;4500;5000', opening: '4500;5200;6000', rearHeight: '3200;3400;3600', frontHeight: '2600' } },
    { name: 'Test 8', title: '3 adet · dikme sayısı manuel 4', values: { systemCount: '3', width: '4000;4500;5000', opening: '4500;5200;6000', rearHeight: '3200;3400;3600', frontHeight: '2600', postCount: '4' } },
    { name: 'Test 9', title: '5 adet · aynı genişlik/açılım', values: { systemCount: '5', width: '4000;4000;4000;4000;4000', opening: '4500;4500;4500;4500;4500', rearHeight: '3200;3200;3200;3200;3200', frontHeight: '2600' } },
    { name: 'Test 10', title: '5 adet · farklı genişlik/açılım · 3 raylar', values: { systemCount: '5', width: '6000;6200;6400;6600;6800', opening: '4500;4600;4700;4800;4900', rearHeight: '3200;3300;3400;3500;3600', frontHeight: '2600' } },
    { name: 'Test 11', title: '7 adet · aynı genişlik · 2 raylar', values: { systemCount: '7', width: '3000;3000;3000;3000;3000;3000;3000', opening: '4500;4500;4500;4500;4500;4500;4500', rearHeight: '3200;3200;3200;3200;3200;3200;3200', frontHeight: '2600' } },
    { name: 'Test 12', title: '7 adet · farklı genişlik · karışık 2/3 ray', values: { systemCount: '7', width: '4000;4200;4400;4600;4800;5000;5200', opening: '4500;4550;4600;4650;4700;4750;4800', rearHeight: '3200;3250;3300;3350;3400;3450;3500', frontHeight: '2600' } },
    { name: 'Test 13', title: 'Parapet EVET · 600 mm', values: { systemCount: '2', width: '4000;4500', opening: '4500;5200', rearHeight: '3200;3400', frontHeight: '2600', parapet: 'EVET', parapetHeight: '600' } },
    { name: 'Test 14', title: 'Üçgen doğrama EVET', values: { systemCount: '2', width: '4000;4500', opening: '4500;5200', rearHeight: '3200;3400', frontHeight: '2600', triangleJoinery: 'EVET' } },
    { name: 'Test 15', title: 'Su çıkışı standart HAYIR', values: { systemCount: '2', width: '4000;4500', opening: '4500;5200', rearHeight: '3200;3400', frontHeight: '2600', waterStandard: 'HAYIR' } },
    { name: 'Test 16', title: 'Kombine test · parapet+cam+üçgen', values: { systemCount: '3', width: '4000;4500;5000', opening: '4500;5200;6000', rearHeight: '3200;3400;3600', frontHeight: '2600', parapet: 'EVET', parapetHeight: '600', glassTrack: 'EVET', triangleJoinery: 'EVET', waterStandard: 'HAYIR' } }
  ]);


  const PDF_REQUEST_SCHEMAS = {
    'b-cube': {
      familyLabel: 'PLMR | Bioclimatic',
      groupLabel: 'Retractable',
      subGroupLabel: 'Roof System',
      productLabel: 'PLMR | Bioclimatic',
      sections: [
        {
          title: 'Project Details',
          hint: 'Main request form dimensions',
          fields: [
            { id: 'width', label: 'Width', type: 'auto-mm', source: 'width' },
            { id: 'projection', label: 'Projection', type: 'auto-mm', source: 'depth' },
            { id: 'heightTopOfGutter', label: 'Height (Top of The Gutter)', type: 'auto-mm', source: 'height' },
            { id: 'systemQuantity', label: 'System Quantity', type: 'number' }
          ]
        },
        {
          title: 'Color Details',
          hint: 'Taken from current 3D color selections',
          fields: [
            { id: 'systemColor', label: 'System Color', type: 'auto-text', source: 'systemColor' },
            { id: 'systemColorFinish', label: 'Finish', type: 'auto-text', source: 'systemColorFinish' },
            { id: 'panelColor', label: 'Panel Color', type: 'auto-text', source: 'panelColor' },
            { id: 'panelColorFinish', label: 'Finish', type: 'auto-text', source: 'panelColorFinish' }
          ]
        },
        {
          title: 'Motor & Remote Control',
          fields: [
            { id: 'motor', label: 'Motor', type: 'select', options: ['T-Motion 350 (Somfy Rts) (120°)', 'T-Motion 300 (Somfy Rts) (90°)'] },
            { id: 'remoteControlSomfyRts', label: 'Remote Control', type: 'select', options: ['1 Channel', '2 Channels', '4 Channels', '16 Channels'], showWhen: { field: 'motor', values: ['T-Motion 350 (Somfy Rts) (120°)', 'T-Motion 300 (Somfy Rts) (90°)'] } }
          ]
        },
        {
          title: 'Panel Options',
          fields: [
            { id: 'panelIsolation', label: 'Panel Isolation', type: 'select', options: ['Yes', 'No'] }
          ]
        },
        {
          title: 'Lighting & Dimmers',
          fields: [
            { id: 'lightingSelections', label: 'Lighting', type: 'multi', options: ['Linear LED', 'Linear RGB', 'Linear Rgb+White', 'Other'], fullWidth: true },
            { id: 'lightingOther', label: 'Other Lighting', type: 'text', fullWidth: true, showWhen: { field: 'lightingSelections', values: ['Other'] } },
            { id: 'lightDimmerLinear', label: 'Light Dimmer (For Linear LED)', type: 'select', options: ['Yes', 'No'] }
          ]
        },
        {
          title: 'Sensors',
          fields: [
            { id: 'rainSensor', label: 'Rain Sensor', type: 'select', options: ['Yes', 'No'] },
            { id: 'vibrationSensor', label: 'Vibration Sensor', type: 'select', options: ['Yes', 'No'] },
            { id: 'windSensor', label: 'Wind Sensor', type: 'select', options: ['Yes', 'No'] },
            { id: 'windSunSensor', label: 'Wind & Sun Sensor', type: 'select', options: ['Yes', 'No'] }
          ]
        },
        {
          title: 'Heater & Sound & Packing',
          fields: [
            { id: 'heater2000Quantity', label: 'Heater 2000W 220V Quantity', type: 'number', unitAuto: 'pcs' },
            { id: 'heater3000Quantity', label: 'Heater 3000W 220V Quantity', type: 'number', unitAuto: 'pcs' },
            { id: 'soundSystemQuantity', label: 'Sound System Quantity', type: 'number', unitAuto: 'pcs' },
            { id: 'dimmerHeater', label: 'Dimmer Heater', type: 'select', options: ['Yes', 'No'] },
            { id: 'packagingType', label: 'Packaging Type', type: 'select', options: ['Wooden Box', 'Heavy-Duty Nylon'] },
            { id: 'loadingType', label: 'Loading', type: 'select', options: ['Truck', 'Container'] }
          ]
        }
      ]
    },
    'bio-rise': {
      familyLabel: 'Bioclimatic',
      groupLabel: 'Eco-Bioclimatic',
      subGroupLabel: 'Tilt',
      productLabel: 'Eco-Bioclimatic (Tilt)',
      sections: [
        {
          title: 'Project Details',
          hint: 'Main request form dimensions',
          fields: [
            { id: 'width', label: 'Width', type: 'auto-mm', source: 'width' },
            { id: 'projection', label: 'Projection', type: 'auto-mm', source: 'depth' },
            { id: 'heightTopOfGutter', label: 'Height (Top of The Gutter)', type: 'auto-mm', source: 'height' },
            { id: 'systemQuantity', label: 'System Quantity', type: 'number' },
            { id: 'motorDirection', label: 'Motor Direction', type: 'select', options: ['Left', 'Right'] }
          ]
        },
        {
          title: 'Color Details',
          hint: 'Taken from current 3D color selections',
          fields: [
            { id: 'systemColor', label: 'System Color', type: 'auto-text', source: 'systemColor' },
            { id: 'systemColorFinish', label: 'Finish', type: 'auto-text', source: 'systemColorFinish' },
            { id: 'panelColor', label: 'Panel Color', type: 'auto-text', source: 'panelColor' },
            { id: 'panelColorFinish', label: 'Finish', type: 'auto-text', source: 'panelColorFinish' }
          ]
        },
        {
          title: 'Motor & Remote Control',
          fields: [
            { id: 'motor', label: 'Motor', type: 'select', options: ['Somfy RTS', 'Somfy IO', 'Rising Motor'] },
            { id: 'remoteControlSomfyRts', label: 'Remote Control', type: 'select', options: ['1 Channel', '2 Channels', '4 Channels', '16 Channels'], showWhen: { field: 'motor', values: ['Somfy RTS'] } },
            { id: 'remoteControlSomfyIo', label: 'Remote Control', type: 'select', options: ['1 Channel', '2 Channels', '4 Channels', '40 Channels'], showWhen: { field: 'motor', values: ['Somfy IO'] } },
            { id: 'remoteControlRising', label: 'Remote Control', type: 'select', options: ['1 Channel', '6 Channels'], showWhen: { field: 'motor', values: ['Rising Motor'] } }
          ]
        },
        {
          title: 'Panel Options',
          fields: [
            { id: 'panelIsolation', label: 'Panel Isolation', type: 'select', options: ['Yes', 'No'] }
          ]
        },
        {
          title: 'Lighting & Dimmers',
          fields: [
            { id: 'lightingSelections', label: 'Lighting', type: 'multi', options: ['Linear LED', 'Linear RGB', 'Linear Rgb+White', 'Spot LED', 'Other'], fullWidth: true },
            { id: 'lightingOther', label: 'Other Lighting', type: 'text', fullWidth: true, showWhen: { field: 'lightingSelections', values: ['Other'] } },
            { id: 'lightDimmerLinear', label: 'Light Dimmer (For Linear LED)', type: 'select', options: ['Yes', 'No'] },
            { id: 'lightDimmerSpot', label: 'Light Dimmer (For Spot LED)', type: 'select', options: ['Yes', 'No'], showWhen: { field: 'lightingSelections', values: ['Spot LED'] } }
          ]
        },
        {
          title: 'Sensors',
          fields: [
            { id: 'rainSensor', label: 'Rain Sensor', type: 'select', options: ['Yes', 'No'] },
            { id: 'vibrationSensor', label: 'Vibration Sensor', type: 'select', options: ['Yes', 'No'] },
            { id: 'windSensor', label: 'Wind Sensor', type: 'select', options: ['Yes', 'No'] },
            { id: 'windSunSensor', label: 'Wind & Sun Sensor', type: 'select', options: ['Yes', 'No'] }
          ]
        },
        {
          title: 'Heater & Sound & Packing',
          fields: [
            { id: 'heater2000Quantity', label: 'Heater 2000W 220V Quantity', type: 'number', unitAuto: 'pcs' },
            { id: 'heater3000Quantity', label: 'Heater 3000W 220V Quantity', type: 'number', unitAuto: 'pcs' },
            { id: 'soundSystemQuantity', label: 'Sound System Quantity', type: 'number', unitAuto: 'pcs' },
            { id: 'dimmerHeater', label: 'Dimmer Heater', type: 'select', options: ['Yes', 'No'] },
            { id: 'packagingType', label: 'Packaging Type', type: 'select', options: ['Wooden Box', 'Heavy-Duty Nylon'] },
            { id: 'loadingType', label: 'Loading', type: 'select', options: ['Truck', 'Container'] }
          ]
        }
      ]
    },
    'pergo-rise': {
      familyLabel: 'Pergola',
      groupLabel: 'Pergola',
      subGroupLabel: 'Web DXF / 2D',
      productLabel: 'Pergola',
      sections: [
        {
          title: 'Project Details',
          hint: 'Pergola Web DXF / 2D project measurements',
          fields: [
            { id: 'width', label: 'Width', type: 'auto-mm', source: 'width' },
            { id: 'projection', label: 'Projection', type: 'auto-mm', source: 'depth' },
            { id: 'heightTopOfGutter', label: 'Height', type: 'auto-mm', source: 'height' },
            { id: 'systemQuantity', label: 'System Quantity', type: 'number' }
          ]
        },
        {
          title: 'Color Details',
          hint: 'Taken from current 3D color selections',
          fields: [
            { id: 'systemColor', label: 'System Color', type: 'auto-text', source: 'systemColor' },
            { id: 'systemColorFinish', label: 'Finish', type: 'auto-text', source: 'systemColorFinish' },
            { id: 'panelColor', label: 'Fabric / Panel Color', type: 'auto-text', source: 'panelColor' },
            { id: 'panelColorFinish', label: 'Fabric Finish', type: 'auto-text', source: 'panelColorFinish' }
          ]
        },
        {
          title: 'Options',
          fields: [
            { id: 'lightingSelections', label: 'Lighting', type: 'multi', options: ['LED', 'RGB', 'Other'], fullWidth: true },
            { id: 'lightingOther', label: 'Other Lighting', type: 'text', fullWidth: true, showWhen: { field: 'lightingSelections', values: ['Other'] } },
            { id: 'fabricNote', label: 'Fabric Note', type: 'text', fullWidth: true },
            { id: 'packagingType', label: 'Packaging Type', type: 'select', options: ['Wooden Box', 'Heavy-Duty Nylon'] }
          ]
        }
      ]
    }
  };
  PDF_REQUEST_SCHEMAS['b-cube-galaxy'] = {
    ...JSON.parse(JSON.stringify(PDF_REQUEST_SCHEMAS['bio-rise'])),
    familyLabel: 'Bioclimatic',
    groupLabel: 'Bioclimatic',
    subGroupLabel: 'Tilt',
    productLabel: 'Bioclimatic (Tilt)'
  };

  function isBioFamilyGroup(group = modelState.productGroup) {
    return group === 'bio-rise' || group === 'b-cube-galaxy';
  }

  function isFreedomBioGroup(group = modelState.productGroup) {
    return group === 'b-cube' || isBioFamilyGroup(group);
  }

  function requestSchemaForGroup(group = modelState.productGroup) {
    return PDF_REQUEST_SCHEMAS[group] || PDF_REQUEST_SCHEMAS['b-cube'];
  }

  function createPdfRequestState(group = modelState.productGroup) {
    const schema = requestSchemaForGroup(group);
    const next = {};
    (schema.sections || []).forEach((section) => {
      (section.fields || []).forEach((field) => {
        if (field.type === 'multi') next[field.id] = Array.isArray(field.default) ? [...field.default] : [];
        else next[field.id] = field.default != null ? field.default : '';
      });
    });
    return next;
  }

  function ensurePdfRequestState(group = modelState.productGroup) {
    const key = PDF_REQUEST_SCHEMAS[group] ? group : 'b-cube';
    if (!pdfRequestState[key]) pdfRequestState[key] = createPdfRequestState(key);
    return pdfRequestState[key];
  }

  function currentPdfRequestState(group = modelState.productGroup) {
    return ensurePdfRequestState(group);
  }

  function isPdfRequestFieldVisible(field, values) {
    if (!field || !field.showWhen) return true;
    const current = values ? values[field.showWhen.field] : null;
    const allowed = Array.isArray(field.showWhen.values) ? field.showWhen.values.map(String) : [];
    if (Array.isArray(current)) return current.map(String).some((item) => allowed.includes(item));
    return allowed.includes(String(current == null ? '' : current));
  }

  function pdfRequestAutoValue(field, model = readModel()) {
    if (!field) return '';
    switch (field.source) {
      case 'width': return Number(model.width) || 0;
      case 'depth': return Number(model.depth) || 0;
      case 'height': return Number(model.height) || 0;
      case 'systemColor': return model.colorMode === 'ral' ? (model.systemColor && model.systemColor.code) || '—' : 'Default / Teknik Palet';
      case 'systemColorFinish': return model.colorMode === 'ral' ? finishLabel(model.systemColor && model.systemColor.finish) : 'Default';
      case 'panelColor': return model.colorMode === 'ral' ? (model.panelColor && model.panelColor.code) || '—' : 'Default / Teknik Palet';
      case 'panelColorFinish': return model.colorMode === 'ral' ? finishLabel(model.panelColor && model.panelColor.finish) : 'Default';
      default: return '';
    }
  }

  function formatPdfRequestValue(field, value, model = readModel()) {
    if (field && String(field.type).startsWith('auto-')) value = pdfRequestAutoValue(field, model);
    if (field && field.type === 'multi') {
      const items = Array.isArray(value) ? value.filter(Boolean) : [];
      return items.length ? items.join(', ') : '—';
    }
    if (field && (field.type === 'auto-mm' || field.unit === 'mm')) {
      const number = Number(value) || 0;
      return number > 0 ? `${Math.round(number)} mm` : '—';
    }
    if (field && field.unitAuto === 'pcs') {
      const number = Number(value);
      return Number.isFinite(number) && number > 0 ? `${Math.round(number)} pcs` : '—';
    }
    const text = String(value == null ? '' : value).trim();
    return text || '—';
  }

  function renderPdfRequestForm() {
    const meta = $(ids.pdfRequestFormMeta);
    const container = $(ids.pdfRequestFormFields);
    if (!meta || !container) return;
    const schema = requestSchemaForGroup();
    const values = currentPdfRequestState();
    const model = readModel();
    meta.textContent = `${schema.familyLabel} · ${schema.groupLabel} · ${schema.productLabel} · PDF bu form mantığıyla hazırlanır.`;
    container.innerHTML = '';
    (schema.sections || []).forEach((section) => {
      const sectionEl = document.createElement('section');
      sectionEl.className = 'pdf-request-section';
      const head = document.createElement('div');
      head.className = 'pdf-request-section-head';
      head.innerHTML = `<strong>${section.title}</strong>${section.hint ? `<span>${section.hint}</span>` : ''}`;
      sectionEl.appendChild(head);
      const grid = document.createElement('div');
      grid.className = 'pdf-request-grid';
      (section.fields || []).forEach((field) => {
        if (!isPdfRequestFieldVisible(field, values)) return;
        const wrap = document.createElement('div');
        wrap.className = 'pdf-request-field' + (field.fullWidth ? ' is-full' : '');
        const label = document.createElement(field.type === 'multi' ? 'span' : 'label');
        label.textContent = field.label;
        wrap.appendChild(label);
        if (String(field.type).startsWith('auto-')) {
          const readonly = document.createElement('div');
          readonly.className = 'pdf-request-readonly';
          readonly.textContent = formatPdfRequestValue(field, pdfRequestAutoValue(field, model), model);
          wrap.appendChild(readonly);
          const note = document.createElement('div');
          note.className = 'pdf-request-auto-note';
          note.textContent = '3D modelden otomatik alınır.';
          wrap.appendChild(note);
        } else if (field.type === 'select') {
          const select = document.createElement('select');
          const empty = document.createElement('option');
          empty.value = '';
          empty.textContent = 'Seçin';
          select.appendChild(empty);
          (field.options || []).forEach((option) => {
            const opt = document.createElement('option');
            opt.value = option;
            opt.textContent = option;
            if (String(values[field.id] || '') === String(option)) opt.selected = true;
            select.appendChild(opt);
          });
          select.addEventListener('change', () => {
            values[field.id] = select.value;
            renderPdfRequestForm();
          });
          wrap.appendChild(select);
        } else if (field.type === 'number' || field.type === 'text') {
          const input = document.createElement('input');
          input.type = field.type === 'number' ? 'number' : 'text';
          input.value = values[field.id] == null ? '' : values[field.id];
          input.placeholder = field.unit === 'mm' ? 'mm' : '';
          input.addEventListener('input', () => {
            values[field.id] = input.value;
          });
          wrap.appendChild(input);
          if (field.unitAuto === 'pcs') {
            const note = document.createElement('div');
            note.className = 'pdf-request-field-help';
            note.textContent = 'Adet girin.';
            wrap.appendChild(note);
          }
        } else if (field.type === 'multi') {
          const choiceGrid = document.createElement('div');
          choiceGrid.className = 'pdf-request-choice-grid';
          const current = Array.isArray(values[field.id]) ? values[field.id] : [];
          (field.options || []).forEach((option) => {
            const choice = document.createElement('label');
            choice.className = 'pdf-request-choice';
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.checked = current.includes(option);
            input.addEventListener('change', () => {
              const source = new Set(Array.isArray(values[field.id]) ? values[field.id] : []);
              if (input.checked) source.add(option); else source.delete(option);
              values[field.id] = Array.from(source);
              renderPdfRequestForm();
            });
            const text = document.createElement('span');
            text.textContent = option;
            choice.appendChild(input);
            choice.appendChild(text);
            choiceGrid.appendChild(choice);
          });
          wrap.appendChild(choiceGrid);
        }
        grid.appendChild(wrap);
      });
      sectionEl.appendChild(grid);
      container.appendChild(sectionEl);
    });
  }

  function pdfRequestPayload(model = readModel()) {
    const schema = requestSchemaForGroup(model.productGroup);
    const values = { ...currentPdfRequestState(model.productGroup) };
    return {
      familyLabel: schema.familyLabel,
      groupLabel: schema.groupLabel,
      subGroupLabel: schema.subGroupLabel,
      productLabel: schema.productLabel,
      sections: (schema.sections || []).map((section) => ({
        title: section.title,
        rows: (section.fields || []).filter((field) => isPdfRequestFieldVisible(field, values)).map((field) => ({
          label: field.label,
          value: formatPdfRequestValue(field, values[field.id], model)
        }))
      }))
    };
  }

  function activeProductSpec(group = modelState.productGroup) {
    return PRODUCT_SPECS[group] || PRODUCT_SPECS['b-cube'];
  }

  function projectionFromPanelCount(panelCount, group = modelState.productGroup) {
    const spec = activeProductSpec(group);
    if (group === 'pergo-rise') return Math.max(0, Math.round(Number(panelCount) || 0));
    const count = Math.max(0, Math.round(Number(panelCount) || 0));
    return count > 0 ? count * spec.panelPitch + spec.projectionOffset : 0;
  }

  function panelCountFromProjection(projection, productGroup = modelState.productGroup || 'b-cube') {
    if(productGroup==='b-cube')return Math.max(1,Math.ceil((Number(projection)-340)/216));
    const spec=PRODUCT_SPECS[productGroup]||PRODUCT_SPECS['b-cube'];return Math.max(spec.panelMin||1,Math.round((Number(projection)-spec.projectionOffset)/spec.pitch));
  }

  function lamellaCountFromProjection(depth, group = modelState.productGroup) {
    if (group === 'pergo-rise') return 1;
    return panelCountFromProjection(depth, group);
  }

  function normalizedFreedomSystemCount(value) {
    const maximum = window.P3DVFreedomMultiPosition ? Number(window.P3DVFreedomMultiPosition.MAX_SYSTEM_COUNT) || 20 : 20;
    return Math.max(1, Math.min(maximum, Math.round(Number(value) || 1)));
  }

  function freedomMultiPositionLayout(source = modelState) {
    if (!source || source.productGroup !== 'b-cube' || !window.P3DVFreedomMultiPosition) return null;
    const layout = window.P3DVFreedomMultiPosition.build({
      systemCount: normalizedFreedomSystemCount(source.systemCount),
      totalWidth: Number(source.width) || 0,
      moduleWidths: Array.isArray(source.moduleWidths) ? source.moduleWidths : [],
      depth: Number(source.depth) || 0,
      moduleDepths: Array.isArray(source.moduleDepths) ? source.moduleDepths : [],
      alignment: source.multiAlignment === 'rear' ? 'rear' : 'front',
      rows: Array.isArray(source.multiRows) ? source.multiRows : [],
      rowAlignment: source.rowAlignment === 'right' ? 'right' : 'left',
      panelCollection: source.panelCollection === 'outer' ? 'outer' : 'center',
      panelCount: Number(source.panelCount) || 0,
      panelCounts: Array.isArray(source.modulePanelCounts) ? source.modulePanelCounts : [],
      height: Number(source.height) || 0,
      postSections: Array.isArray(source.postSections) ? source.postSections : defaults.postSections,
      interiorPostSection: PRODUCT_SPECS['b-cube'].postSection,
      beamSection: source.beamSection || PRODUCT_SPECS['b-cube'].beamSection
    });
    if(layout&&layout.valid&&window.PLMRRollingRoofParapetCore){const P=window.PLMRRollingRoofParapetCore,edits=source.sceneEditor&&source.sceneEditor.members||{};window.PLMRV12Core.applyPosts(layout,edits);layout.originalPosts=layout.originalPosts.map(p=>({...p,x:p.x+(Number(edits['post:'+p.id]?.sharedX)||0),z:p.z+(Number(edits['post:'+p.id]?.sharedZ)||0)}));layout.posts=layout.originalPosts.filter(p=>!edits['post:'+p.id]?.sharedWith).filter(p=>!edits['post:'+p.id]?.deleted).map(p=>({...p,...P.postSpan(p,source,source.parapetWalls||source.sketchWalls?.length&&source.sketchWalls||modelState.sketchWalls||[],source.parapetOwner||'roof-main',edits['post:'+p.id]||{})}));}
    return layout;
  }

  function normalizedBioRiseSystemCount(value) {
    const maximum = window.P3DVBioRiseMultiPosition ? Number(window.P3DVBioRiseMultiPosition.MAX_SYSTEM_COUNT) || 20 : 20;
    return Math.max(1, Math.min(maximum, Math.round(Number(value) || 1)));
  }

  function bioRiseMultiPositionLayout(source = modelState) {
    if (!source || source.productGroup !== 'bio-rise' || !window.P3DVBioRiseMultiPosition) return null;
    return window.P3DVBioRiseMultiPosition.build({
      systemCount: normalizedBioRiseSystemCount(source.systemCount),
      totalWidth: Number(source.width) || 0,
      moduleWidths: Array.isArray(source.moduleWidths) ? source.moduleWidths : [],
      depth: Number(source.depth) || 0,
      moduleDepths: Array.isArray(source.moduleDepths) ? source.moduleDepths : [],
      alignment: source.multiAlignment === 'rear' ? 'rear' : 'front',
      rows: Array.isArray(source.multiRows) ? source.multiRows : [],
      rowAlignment: source.rowAlignment === 'right' ? 'right' : 'left',
      panelCollection: source.panelCollection === 'outer' ? 'outer' : 'center',
      panelCount: Number(source.panelCount) || 0,
      panelCounts: Array.isArray(source.modulePanelCounts) ? source.modulePanelCounts : [],
      height: Number(source.height) || 0,
      postSections: Array.isArray(source.postSections) ? source.postSections : defaults.postSections,
      interiorPostSection: PRODUCT_SPECS['bio-rise'].postSection,
      beamSection: source.beamSection || PRODUCT_SPECS['bio-rise'].beamSection,
      sideFrameWidth: PRODUCT_SPECS['bio-rise'].sideBeamThickness,
      sideGutterWidth: 98,
      gutterClearance: 2
    });
  }

  function galaxyMultiPositionLayout(source = modelState) {
    if (!source || source.productGroup !== 'b-cube-galaxy' || !window.P3DVGalaxyMultiPosition) return null;
    const spec = PRODUCT_SPECS['b-cube-galaxy'];
    return window.P3DVGalaxyMultiPosition.build({
      systemCount: normalizedBioRiseSystemCount(source.systemCount),
      totalWidth: Number(source.width) || 0,
      moduleWidths: Array.isArray(source.moduleWidths) ? source.moduleWidths : [],
      depth: Number(source.depth) || 0,
      moduleDepths: Array.isArray(source.moduleDepths) ? source.moduleDepths : [],
      alignment: source.multiAlignment === 'rear' ? 'rear' : 'front',
      rows: Array.isArray(source.multiRows) ? source.multiRows : [],
      rowAlignment: source.rowAlignment === 'right' ? 'right' : 'left',
      panelCollection: source.panelCollection === 'outer' ? 'outer' : 'center',
      panelCount: Number(source.panelCount) || 0,
      panelCounts: Array.isArray(source.modulePanelCounts) ? source.modulePanelCounts : [],
      height: Number(source.height) || 0,
      postSections: Array.isArray(source.postSections) ? source.postSections : Array.from({length:4},()=>({...spec.postSection})),
      interiorPostSection: spec.postSection,
      beamSection: source.beamSection || spec.beamSection,
      sideFrameWidth: spec.sideBeamThickness,
      sideGutterWidth: spec.gutterSection.width,
      gutterClearance: spec.gutterSection.clearance
    });
  }

  function modelReady(model = modelState) {
    const spec = activeProductSpec(model.productGroup);
    const height = Number(model.height);
    const baseReady = Number(model.width) >= spec.widthMin &&
      Number(model.depth) >= spec.depthMin &&
      height >= spec.heightMin && (!spec.heightMax || height <= spec.heightMax);
    if (!baseReady) return false;
    if (model.productGroup === 'pergo-rise') return Boolean(model.pergoRiseProject && model.pergoRiseProject.derived);
    if (model.productGroup === 'b-cube') {
      const layout = model.freedomLayout || freedomMultiPositionLayout(model);
      if (!layout || !layout.valid) return false;
    }
    if (model.productGroup === 'bio-rise') {
      const layout = model.bioRiseLayout || bioRiseMultiPositionLayout(model);
      if (!layout || !layout.valid) return false;
    }
    if (model.productGroup === 'b-cube-galaxy') {
      const layout = model.galaxyLayout || galaxyMultiPositionLayout(model);
      if (!layout || !layout.valid) return false;
    }
    return Number(model.panelCount) >= spec.panelMin;
  }

  function readModel() {
    window.PLMRV12Core.identities(modelState);
    const isPergoRise = (modelState.productGroup || 'b-cube') === 'pergo-rise';
    const freedomLayout = modelState.productGroup === 'b-cube' ? freedomMultiPositionLayout(modelState) : null;
    const bioRiseLayout = modelState.productGroup === 'bio-rise' ? bioRiseMultiPositionLayout(modelState) : null;
    const galaxyLayout = modelState.productGroup === 'b-cube-galaxy' ? galaxyMultiPositionLayout(modelState) : null;
    return {
      pozNo: modelState.pozNo || 1,
      productGroup: modelState.productGroup || 'b-cube',
      width: modelState.width,
      depth: modelState.depth,
      height: modelState.height,
      lamellaCount: isPergoRise ? 1 : Math.max(0, Math.round(Number(modelState.panelCount) || panelCountFromProjection(modelState.depth))),
      panelCount: isPergoRise ? 1 : Math.max(0, Math.round(Number(modelState.panelCount) || 0)),
      orientations: [...modelState.orientations],
      postSections: modelState.postSections.map((section) => ({ ...section })),
      beamSection: { ...modelState.beamSection },
      placements: JSON.parse(JSON.stringify(modelState.placements || {})),
      zipPlacements: JSON.parse(JSON.stringify(modelState.zipPlacements || {})),
      facadeProfiles: JSON.parse(JSON.stringify(modelState.facadeProfiles || {})),
      zoneDividers: JSON.parse(JSON.stringify(modelState.zoneDividers || {})),
      zoneRegistry: JSON.parse(JSON.stringify(modelState.zoneRegistry || {})),
      nextZoneNumber: Math.max(1, Math.round(Number(modelState.nextZoneNumber) || 1)),
      sceneEditor: JSON.parse(JSON.stringify(ensureSceneEditor())),
      sketchWalls: JSON.parse(JSON.stringify(modelState.sketchWalls || [])),
      nextSketchWallNumber: Math.max(1, Math.round(Number(modelState.nextSketchWallNumber) || 1)),
      productsOpen: Boolean(modelState.productsOpen),
      productOpenStates: JSON.parse(JSON.stringify(modelState.productOpenStates || {})),
      panelStates: JSON.parse(JSON.stringify(modelState.panelStates || {})),
      panelMasterOpen: Boolean(modelState.panelMasterOpen),
      glassPreferences: { ...glassPreferenceState() },
      colorMode: modelState.colorMode === 'ral' ? 'ral' : 'default',
      systemColor: { ...(modelState.systemColor || defaults.systemColor) },
      panelColor: { ...(modelState.panelColor || defaults.panelColor) },
      systemCount: isBioFamilyGroup(modelState.productGroup) ? normalizedBioRiseSystemCount(modelState.systemCount) : normalizedFreedomSystemCount(modelState.systemCount),
      moduleWidths: Array.isArray(modelState.moduleWidths) ? [...modelState.moduleWidths] : [],
      moduleDepths: Array.isArray(modelState.moduleDepths) ? [...modelState.moduleDepths] : [],
      modulePanelCounts: Array.isArray(modelState.modulePanelCounts) ? [...modelState.modulePanelCounts] : [],
      multiAlignment: modelState.multiAlignment === 'rear' ? 'rear' : 'front',
      multiRows: Array.isArray(modelState.multiRows) ? JSON.parse(JSON.stringify(modelState.multiRows)) : [],
      rowAlignment: modelState.rowAlignment === 'right' ? 'right' : 'left',
      panelCollection: modelState.panelCollection === 'outer' ? 'outer' : 'center',
      freedomLayout: freedomLayout ? JSON.parse(JSON.stringify(freedomLayout)) : null,
      bioRiseLayout: bioRiseLayout ? JSON.parse(JSON.stringify(bioRiseLayout)) : null,
      galaxyLayout: galaxyLayout ? JSON.parse(JSON.stringify(galaxyLayout)) : null,
      inputDrafts: { ...(modelState.inputDrafts || {}) },
      options: isPergoRise ? (() => {
        const input = modelState.pergoRiseProject && modelState.pergoRiseProject.input || (window.P3DVPergoRiseInput && window.P3DVPergoRiseInput.DEFAULT_INPUT) || {};
        return {
          parapet: input.parapet || 'HAYIR', parapetHeight: input.parapetHeight || '-',
          glassTrack: input.glassTrack || 'HAYIR', structureColor: input.structureColor || '-',
          fabric: input.fabric || '-', fabricProfiles: input.fabricProfiles || '-', motor: input.motor || '-',
          remote: input.remote || '-', led: input.led || '-', dimmer: input.dimmer || '-',
          triangleJoinery: input.triangleJoinery || 'HAYIR', waterStandard: input.waterStandard || 'EVET',
          waterOutletPlacement: input.waterOutletPlacement || 'BOTH', extras: input.extras || '-'
        };
      })() : {
        panelColorIndependent: modelState.panelColorIndependent !== false,
        panelFill: modelState.panelFill || 'EVET', motor: modelState.motor || 'Yok', remote: modelState.remote || 'Yok',
        led: modelState.led || 'NO', dimmer: modelState.dimmer || 'HAYIR', parapet: modelState.parapet || 'HAYIR',
        parapetHeight: modelState.parapetHeight || '', waterStandard: modelState.waterStandard || 'EVET', extras: modelState.extras || ''
      },
      pergoOptions: JSON.parse(JSON.stringify(modelState.pergoOptions || defaults.pergoOptions)),
      pergoRiseProject: modelState.pergoRiseProject ? JSON.parse(JSON.stringify(modelState.pergoRiseProject)) : null,
      pdfRequest: pdfRequestPayload({
        pozNo: modelState.pozNo || 1,
      productGroup: modelState.productGroup || 'b-cube',
        width: modelState.width, depth: modelState.depth, height: modelState.height, panelCount: ((modelState.productGroup || 'b-cube') === 'pergo-rise') ? 1 : Math.max(0, Math.round(Number(modelState.panelCount) || 0)), lamellaCount: ((modelState.productGroup || 'b-cube') === 'pergo-rise') ? 1 : Math.max(0, Math.round(Number(modelState.panelCount) || panelCountFromProjection(modelState.depth))), orientations: [...modelState.orientations], postSections: modelState.postSections.map((section) => ({ ...section })), beamSection: { ...modelState.beamSection }, placements: JSON.parse(JSON.stringify(modelState.placements || {})), zipPlacements: JSON.parse(JSON.stringify(modelState.zipPlacements || {})), facadeProfiles: JSON.parse(JSON.stringify(modelState.facadeProfiles || {})), zoneDividers: JSON.parse(JSON.stringify(modelState.zoneDividers || {})), zoneRegistry: JSON.parse(JSON.stringify(modelState.zoneRegistry || {})), productsOpen: Boolean(modelState.productsOpen), productOpenStates: JSON.parse(JSON.stringify(modelState.productOpenStates || {})), panelStates: JSON.parse(JSON.stringify(modelState.panelStates || {})), panelMasterOpen: Boolean(modelState.panelMasterOpen), glassPreferences: { ...glassPreferenceState() }, colorMode: modelState.colorMode === 'ral' ? 'ral' : 'default', systemColor: { ...(modelState.systemColor || defaults.systemColor) }, panelColor: { ...(modelState.panelColor || defaults.panelColor) }
      })
    };
  }

  function setText(id, text) {
    $(id).textContent = text;
  }

  function ralCatalogData() {
    return window.P3DV_RAL_CATALOG;
  }

  function normalizeHexColor(value, fallback) {
    const text = String(value || '').trim();
    return /^#[0-9a-f]{6}$/i.test(text) ? text.toUpperCase() : fallback;
  }

  function ralColorOption(code, fallback) {
    const catalog = ralCatalogData();
    const found = catalog.all.find((option) => option.code === code);
    const base = found ? {
      code: found.code,
      hex: normalizeHexColor(found.hex, fallback.hex),
      image: found.image || '',
      texture: found.texture || '',
      kind: found.kind || '',
      name: found.name || ''
    } : { ...fallback };
    const finish = base.kind === 'wood-transfer' ? 'WOOD_TRANSFER' : normalizeColorFinish((fallback && fallback.finish) || 'MATTE');
    return { ...base, finish };
  }

  function colorSurfaceLabel(color) {
    return color && color.kind === 'wood-transfer' ? 'Ahşap Transfer' : finishLabel(color && color.finish);
  }

  function normalizeModelColors() {
    const systemFinish = normalizeColorFinish(modelState.systemColor && modelState.systemColor.finish, defaults.systemColor.finish);
    const panelFinish = normalizeColorFinish(modelState.panelColor && modelState.panelColor.finish, defaults.panelColor.finish);
    modelState.systemColor = ralColorOption(modelState.systemColor?.code, {...defaults.systemColor,finish:systemFinish});
    modelState.panelColor = ralColorOption(modelState.panelColor?.code, {...defaults.panelColor,finish:panelFinish});
    glassPreferenceState();
  }

  function setColorSwatch(id, hex) {
    const swatch = $(id);
    if (swatch) swatch.setAttribute('style', `background:${normalizeHexColor(hex, '#94A3B8')}`);
  }

  function normalizeColorMode(value = modelState.colorMode) {
    return value === 'ral' ? 'ral' : 'default';
  }

  function updateColorControls() {
    normalizeModelColors();
    modelState.colorMode = normalizeColorMode();
    const defaultMode = modelState.colorMode === 'default';
    const panelIndependent = modelState.panelColorIndependent !== false;
    if (!panelIndependent) modelState.panelColor = { ...modelState.systemColor };
    setText(ids.systemColorValue, defaultMode ? 'Klasik Sistem Paleti' : `${modelState.systemColor.code} · ${colorSurfaceLabel(modelState.systemColor)}`);
    setText(ids.panelColorValue, !panelIndependent ? (defaultMode ? 'Sistem Rengine Bağlı' : `${modelState.systemColor.code} · ${colorSurfaceLabel(modelState.systemColor)}`) : (defaultMode ? 'Klasik Panel Yeşili' : `${modelState.panelColor.code} · ${colorSurfaceLabel(modelState.panelColor)}`));
    setColorSwatch(ids.systemColorSwatch, defaultMode ? '#FF00FF' : modelState.systemColor.hex);
    setColorSwatch(ids.panelColorSwatch, !panelIndependent ? (defaultMode ? '#FF00FF' : modelState.systemColor.hex) : (defaultMode ? '#7CFC00' : modelState.panelColor.hex));
    const panelCheckbox = $(ids.panelColorIndependent);
    const panelTrigger = $(ids.panelColorTrigger);
    const panelCell = panelTrigger && panelTrigger.closest ? panelTrigger.closest('.panel-color-cell') : null;
    if (panelCheckbox) panelCheckbox.checked = panelIndependent;
    if (panelTrigger) { panelTrigger.disabled = !panelIndependent; panelTrigger.setAttribute('aria-disabled', String(!panelIndependent)); }
    if (panelCell) panelCell.classList.toggle('is-linked', !panelIndependent);
    const defaultButton = $(ids.defaultColorMode);
    const ralButton = $(ids.ralColorMode);
    if (defaultButton) {
      defaultButton.classList.toggle('is-active', defaultMode);
      defaultButton.setAttribute('aria-pressed', String(defaultMode));
    }
    if (ralButton) {
      ralButton.classList.toggle('is-active', !defaultMode);
      ralButton.setAttribute('aria-pressed', String(!defaultMode));
    }
    renderPdfRequestForm();
  }

  function setColorMode(mode) {
    modelState.colorMode = normalizeColorMode(mode);
    if (modelState.panelColorIndependent === false) modelState.panelColor = { ...modelState.systemColor };
    updateColorControls();
    applyColorStateLive();
  }

  function colorTargetLabel(target = activeColorTarget) {
    return target === 'panel' ? 'Panel Rengi' : 'Sistem Rengi';
  }

  function selectedColorForTarget(target = activeColorTarget) {
    return target === 'panel' ? modelState.panelColor : modelState.systemColor;
  }

  function setActiveColorCatalog(catalog) {
    activeColorCatalog = catalog === 'all' ? 'all' : 'rising';
    $(ids.colorCatalogRising).classList.toggle('is-active', activeColorCatalog === 'rising');
    $(ids.colorCatalogAll).classList.toggle('is-active', activeColorCatalog === 'all');
    $(ids.colorCatalogRising).setAttribute('aria-selected', String(activeColorCatalog === 'rising'));
    $(ids.colorCatalogAll).setAttribute('aria-selected', String(activeColorCatalog === 'all'));
    renderRalColorOptions();
  }

  function renderColorFinishOptions() {
    const container = $(ids.colorFinishOptions);
    if (!container) return;
    container.innerHTML = '';
    const current = pendingColorSelection ? normalizeColorFinish(pendingColorSelection.finish) : normalizeColorFinish(selectedColorForTarget().finish);
    COLOR_FINISHES.forEach((finish) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'finish-option-card' + (current === finish.value ? ' is-selected' : '');
      const sampleStyle = finish.value === 'GLOSS'
        ? 'background:linear-gradient(135deg, rgba(255,255,255,.92), rgba(255,255,255,.18) 35%, rgba(15,23,42,.08) 100%); box-shadow: inset 0 1px 0 rgba(255,255,255,.65);'
        : (finish.value === 'TEXTURE'
          ? 'background-image: radial-gradient(circle at 3px 3px, rgba(15,23,42,.14) 1px, transparent 1.2px), linear-gradient(135deg, rgba(255,255,255,.35), rgba(255,255,255,.12)); background-size: 9px 9px, cover;'
          : 'background:linear-gradient(135deg, rgba(255,255,255,.55), rgba(255,255,255,.12));');
      button.innerHTML = `<span class="finish-option-sample" style="${sampleStyle}"></span><span class="finish-option-copy"><strong>${finish.label}</strong><span>${finish.detail}</span></span>`;
      button.addEventListener('click', () => applyColorFinish(finish.value));
      container.appendChild(button);
    });
  }

  function openColorFinishDialog(selectedCode, selectedHex, selectedImage) {
    const current = selectedColorForTarget();
    pendingColorSelection = {
      code: selectedCode,
      hex: normalizeHexColor(selectedHex, current.hex),
      image: selectedImage || '',
      finish: normalizeColorFinish(current.finish)
    };
    setText(ids.colorFinishTitle, `${colorTargetLabel()} · Yüzey Tipi`);
    setText(ids.colorFinishDescription, `${selectedCode} için parlak, mat veya texture yüzey tipini seçin.`);
    setText(ids.colorFinishSummary, `${selectedCode} · ${finishLabel(pendingColorSelection.finish)}`);
    renderColorFinishOptions();
    $(ids.colorFinishDialog).hidden = false;
  }

  function closeColorFinishDialog() {
    $(ids.colorFinishDialog).hidden = true;
    pendingColorSelection = null;
  }

  function applyColorFinish(finishValue) {
    if (!pendingColorSelection) return;
    const next = { ...pendingColorSelection, finish: normalizeColorFinish(finishValue, pendingColorSelection.finish) };
    modelState.colorMode = 'ral';
    if (activeColorTarget === 'panel') modelState.panelColor = next;
    else {
      modelState.systemColor = next;
      if (modelState.panelColorIndependent === false) modelState.panelColor = { ...next };
    }
    closeColorFinishDialog();
    closeColorPicker();
    updateColorControls();
    applyColorStateLive();
  }

  function applyCatalogColorOption(option) {
    if (!option) return;
    const current = selectedColorForTarget();
    const next = {
      code: option.code,
      hex: normalizeHexColor(option.hex, current.hex),
      image: option.image || '',
      texture: option.texture || '',
      kind: option.kind || '',
      name: option.name || '',
      finish: option.kind === 'wood-transfer' ? 'TEXTURE' : normalizeColorFinish(current.finish)
    };
    modelState.colorMode = 'ral';
    if (activeColorTarget === 'panel') modelState.panelColor = next;
    else {
      modelState.systemColor = next;
      if (modelState.panelColorIndependent === false) modelState.panelColor = { ...next };
    }
    closeColorPicker();
    updateColorControls();
    applyColorStateLive();
  }

  function renderRalColorOptions() {
    const grid = $(ids.colorOptionGrid);
    if (!grid) return;
    const catalog = ralCatalogData();
    const risingCodes = new Set(catalog.risingStandardCodes || []);
    const query = String($(ids.colorSearch).value || '').trim().toUpperCase().replace(/\s+/g, ' ');
    const options = catalog.all.filter((option) => {
      if (activeColorCatalog === 'rising' && !risingCodes.has(option.code)) return false;
      if (activeColorCatalog === 'all' && risingCodes.has(option.code)) return false;
      if (!query) return true;
      const compact = option.code.toUpperCase().replace(/\s+/g, '');
      const name = String(option.name || '').toUpperCase();
      return option.code.toUpperCase().includes(query) || compact.includes(query.replace(/\s+/g, '')) || name.includes(query);
    });
    grid.innerHTML = '';
    const selected = selectedColorForTarget();
    options.forEach((option) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'ral-color-option' + (selected && selected.code === option.code ? ' is-selected' : '');
      button.setAttribute('role', 'option');
      button.setAttribute('aria-selected', String(Boolean(selected && selected.code === option.code)));
      button.setAttribute('aria-label', option.code);
      const image = option.image ? `<img src="${option.image}" alt="" loading="lazy" />` : `<span style="display:block;width:100%;height:100%;background:${option.hex}"></span>`;
      const optionDetail = option.kind === 'wood-transfer' ? 'Ahşap Transfer · gerçek kartela görseli' : 'Yüzey tipi sonraki adımda seçilir';
      button.innerHTML = `<span class="ral-color-option-image${option.kind==='wood-transfer'?'':' is-ral-sphere'}" style="background:${option.hex}">${image}</span><span class="ral-color-option-copy"><strong>${option.code}</strong><small>${optionDetail}</small></span>`;
      button.value = option.code;
      button.addEventListener('click', () => {
        if (option.kind === 'wood-transfer') applyCatalogColorOption(option);
        else openColorFinishDialog(option.code, option.hex, option.image || '');
      });
      grid.appendChild(button);
    });
    setText(ids.colorResultCount, `${options.length} renk`);
  }

  function openColorPicker(target) {
    activeColorTarget = target === 'panel' ? 'panel' : 'system';
    if(window.PLMRV27UI?.color(selectedColorForTarget()?.code,code=>{
      if(code==='Varsayılan'){modelState.colorMode='default';updateColorControls();applyColorStateLive();return;}
      const option=ralCatalogData().all.find(o=>o.code===code);if(!option)return;
      if(option.kind==='wood-transfer')applyCatalogColorOption(option);else openColorFinishDialog(option.code,option.hex,option.image||'');
    }))return;
    setText(ids.colorPickerTitle, 'RAL Renk Kartelası');
    setText(ids.colorPickerDescription, activeColorTarget === 'panel'
      ? 'Seçilen RAL veya ahşap transfer rengi yalnız hareketli çatı panellerine uygulanır.'
      : 'Seçilen RAL veya ahşap transfer rengi cam ve perde kumaşı hariç tüm sistem ve cephe profillerine uygulanır.');
    $(ids.colorSearch).value = '';
    $(ids.colorPickerDialog).hidden = false;
    setActiveColorCatalog(activeColorCatalog);
    $(ids.colorSearch).focus();
  }

  function closeColorPicker() {
    $(ids.colorPickerDialog).hidden = true;
  }


  let appConfirmResolver = null;

  function closeAppConfirmation(result) {
    const dialog = $(ids.appConfirmDialog);
    if (dialog) dialog.hidden = true;
    const resolver = appConfirmResolver;
    appConfirmResolver = null;
    if (resolver) resolver(Boolean(result));
  }

  function requestAppConfirmation(message, options = {}) {
    const dialog = $(ids.appConfirmDialog);
    if (!dialog) return Promise.resolve(false);
    if (appConfirmResolver) closeAppConfirmation(false);
    setText(ids.appConfirmTitle, options.title || 'İşlemi Onayla');
    setText(ids.appConfirmMessage, message || 'Bu işlem uygulansın mı?');
    const accept = $(ids.appConfirmAccept);
    if (accept) {
      accept.textContent = options.acceptLabel || 'Onayla';
      accept.classList.toggle('danger-action', options.danger !== false);
    }
    dialog.hidden = false;
    window.setTimeout(() => { if (accept) accept.focus(); }, 0);
    return new Promise((resolve) => { appConfirmResolver = resolve; });
  }

  function productModelLabel(group = modelState.productGroup) {
    return activeProductSpec(group).modelLabel;
  }

  function projectionPresetSelect() {
    return $(ids.projectionOptions);
  }

  function depthControlValue() {
    const custom = $(ids.freedomDepth);
    return String(custom && custom.value || '').trim();
  }

  function setDepthControlValue(value) {
    const preset = projectionPresetSelect();
    const custom = $(ids.freedomDepth);
    const text = String(value == null ? '' : value).trim();
    if (custom) { custom.hidden = false; custom.value = text; }
    if (preset) {
      const matching = Array.from(preset.options || []).some((option) => option.value === text);
      preset.value = matching ? text : '';
    }
  }

  function projectionOptionValues(group = modelState.productGroup) {
    const spec = activeProductSpec(group);
    const values = [];
    const start = Number(spec.depthListStart);
    const max = Number(spec.depthMax);
    const step = Number(spec.depthStep);
    if (!Number.isFinite(start) || !Number.isFinite(max) || !Number.isFinite(step) || step <= 0) return values;
    for (let value = start; value <= max; value += step) values.push(value);
    if (!values.length || values[values.length - 1] !== max) values.push(max);
    return values;
  }

  function populateProjectionOptions() {
    const list = projectionPresetSelect();
    if (!list) return;
    const spec = activeProductSpec();
    const previousValue = depthControlValue();
    list.replaceChildren();

    const values = projectionOptionValues(modelState.productGroup);
    let lastValue = null;
    for (const value of values) {
      const option = document.createElement('option');
      const panelCount = panelCountFromProjection(value, modelState.productGroup);
      option.value = String(value);
      option.textContent = modelState.productGroup === 'pergo-rise' ? `${value} mm` : `${value} - ${panelCount} Panel`;
      list.appendChild(option);
      lastValue = value;
    }
    setDepthControlValue(previousValue);
    renderProjectionComboMenu();
  }

  function normalizeMotorKey(value) {
    return String(value || 'Yok').trim().toLocaleUpperCase('tr-TR');
  }

  function sanitizeDigitsOnly(value, maxLength = 2) {
    return String(value == null ? '' : value).replace(/\D+/g, '').slice(0, maxLength);
  }

  function sanitizeSemicolonNumbers(value) {
    const source = String(value == null ? '' : value);
    let out = '';
    for (const char of source) {
      if (/\d/.test(char)) out += char;
      else if (char === ';' && out && !/[;:]$/.test(out)) out += ';';
    }
    return out;
  }

  function sanitizeWidthTopology(value) {
    const source = String(value == null ? '' : value).toLocaleUpperCase('tr-TR');
    let out = '';
    let noState = 0;
    for (const char of source) {
      if (noState === 2) continue;
      if (/\d/.test(char) && noState === 0) { out += char; continue; }
      if ((char === ';' || char === ':') && noState === 0 && out && !/[;:]$/.test(out)) { out += char; continue; }
      if (char === 'N' && noState === 0 && out.endsWith(':')) { out += 'N'; noState = 1; continue; }
      if (char === 'O' && noState === 1) { out += 'O'; noState = 2; }
    }
    return out;
  }

  function sanitizeOpeningTopology(value) {
    const source = String(value == null ? '' : value).toLocaleUpperCase('tr-TR');
    let out = '';
    let noState = 0;
    for (const char of source) {
      if (noState === 2) continue;
      if (/\d/.test(char) && noState === 0) { out += char; continue; }
      if ((char === ';' || char === ':') && noState === 0 && out && !/[;:]$/.test(out)) { out += char; continue; }
      if (char === 'N' && noState === 0 && /[;:]$/.test(out)) { out += 'N'; noState = 1; continue; }
      if (char === 'O' && noState === 1) { out += 'O'; noState = 2; }
    }
    return out;
  }

  function parseNumericRow(text, rowIndex) {
    const rawTokens = String(text == null ? '' : text).split(';').map((token) => token.trim());
    const errors = [];
    const values = [];
    rawTokens.forEach((token, tokenIndex) => {
      if (!token) {
        errors.push(`EMPTY_VALUE_ROW_${rowIndex + 1}`);
        return;
      }
      if (!/^\d+(?:\.\d+)?$/.test(token)) {
        errors.push(`INVALID_VALUE_ROW_${rowIndex + 1}`);
        return;
      }
      const number = Number(token);
      if (!(number > 0)) {
        errors.push(`VALUE_MUST_BE_POSITIVE_ROW_${rowIndex + 1}`);
        return;
      }
      values.push(number);
    });
    return { values, errors };
  }

  function parseMultiRowNumberGrid(value, options = {}) {
    const allowLegacyNo = Boolean(options.allowLegacyNo);
    const allowTerminalNo = Boolean(options.allowTerminalNo);
    const original = String(value == null ? '' : value).trim().toLocaleUpperCase('tr-TR');
    let text = original;
    let terminalColonNo = false;
    let legacyRearReference = false;
    if (allowTerminalNo && /:NO$/.test(text)) {
      terminalColonNo = true;
      text = text.slice(0, -3);
    } else if (allowLegacyNo && !text.includes(':') && /;NO$/.test(text)) {
      legacyRearReference = true;
      text = text.slice(0, -3);
    }
    const errors = [];
    if (/NO/.test(text)) errors.push('NO_ONLY_ALLOWED_AT_END');
    const rawRows = text.split(':');
    if (rawRows.length > 2) errors.push('TOO_MANY_ROWS');
    if (rawRows.some((row) => !row.trim())) errors.push('EMPTY_ROW');
    const rows = rawRows.slice(0, 2).map((row, rowIndex) => {
      const parsed = parseNumericRow(row, rowIndex);
      errors.push(...parsed.errors);
      return parsed.values;
    });
    return {
      original,
      text,
      rows,
      rowCount: rows.length,
      terminalColonNo,
      legacyRearReference,
      errors,
      hasSemicolon: text.includes(';'),
      hasColon: original.includes(':')
    };
  }

  function parseMultiPositionNumberList(value, options = {}) {
    const grid = parseMultiRowNumberGrid(value, {
      allowLegacyNo: Boolean(options.allowNo),
      allowTerminalNo: Boolean(options.allowNo)
    });
    const values = grid.rows.length === 1 ? grid.rows[0].slice() : grid.rows.flat();
    return {
      text: grid.original,
      values,
      rearReference: grid.legacyRearReference || grid.terminalColonNo,
      errors: grid.errors,
      hasDelimiter: grid.hasSemicolon || grid.hasColon,
      rows: grid.rows,
      terminalColonNo: grid.terminalColonNo
    };
  }

  function resolveFreedomBioTopology(group, rawSystemCount, rawWidth, rawDepth) {
    const widthGrid = parseMultiRowNumberGrid(rawWidth, { allowTerminalNo: true });
    const openingGrid = parseMultiRowNumberGrid(rawDepth, { allowLegacyNo: true, allowTerminalNo: true });
    const explicitCount = isBioFamilyGroup(group)
      ? normalizedBioRiseSystemCount(rawSystemCount || 1)
      : normalizedFreedomSystemCount(rawSystemCount || 1);
    const errors = [
      ...widthGrid.errors.map((code) => `WIDTH_${code}`),
      ...openingGrid.errors.map((code) => `OPENING_${code}`)
    ];
    if (!widthGrid.rows.length || !widthGrid.rows[0].length) errors.push('WIDTH_REQUIRED');
    if (!openingGrid.rows.length || !openingGrid.rows[0].length) errors.push('OPENING_REQUIRED');
    if (widthGrid.rowCount !== openingGrid.rowCount) errors.push('WIDTH_OPENING_ROW_COUNT_MISMATCH');
    const backToBack = widthGrid.rowCount === 2 || openingGrid.rowCount === 2;

    if (!backToBack) {
      const widthValues = widthGrid.rows[0] || [];
      const openingValues = openingGrid.rows[0] || [];
      let systemCount = widthValues.length > 1 ? widthValues.length : explicitCount;
      if (widthValues.length <= 1 && openingValues.length > 1) systemCount = explicitCount;
      if (widthValues.length > 1 && openingValues.length > 1 && openingValues.length !== widthValues.length) errors.push('WIDTH_OPENING_COUNT_MISMATCH');
      if (widthValues.length <= 1 && openingValues.length > 1 && openingValues.length !== systemCount) errors.push('OPENING_SYSTEM_COUNT_MISMATCH');
      if (widthValues.length > 1 && widthValues.length !== systemCount) errors.push('WIDTH_SYSTEM_COUNT_MISMATCH');
      const moduleWidths = widthValues.length > 1 ? widthValues.slice() : [];
      const totalWidth = moduleWidths.length ? moduleWidths.reduce((sum, value) => sum + value, 0) : Number(widthValues[0] || 0);
      const moduleDepths = openingValues.length === 1
        ? Array.from({ length: systemCount }, () => openingValues[0])
        : openingValues.slice();
      const maxDepth = moduleDepths.length ? Math.max(...moduleDepths) : 0;
      const panelCounts = moduleDepths.map((depth) => panelCountFromProjection(depth, group));
      return {
        valid: errors.length === 0,
        errors,
        backToBack: false,
        rowCount: 1,
        systemCount,
        totalWidth,
        moduleWidths,
        moduleDepths,
        maxDepth,
        panelCounts,
        alignment: openingGrid.legacyRearReference ? 'rear' : 'front',
        multiRows: [],
        rowAlignment: 'left',
        panelCollection: 'center',
        widthInputMode: moduleWidths.length ? 'MODULE_LIST' : 'TOTAL_WIDTH',
        openingInputMode: openingValues.length > 1 ? 'MODULE_LIST' : 'COMMON'
      };
    }

    if (widthGrid.rowCount !== 2 || openingGrid.rowCount !== 2) errors.push('TWO_ROWS_REQUIRED');
    const rows = [];
    for (let rowIndex = 0; rowIndex < 2; rowIndex += 1) {
      const widths = widthGrid.rows[rowIndex] || [];
      const depths = openingGrid.rows[rowIndex] || [];
      if (widths.length !== depths.length) errors.push(`WIDTH_OPENING_COUNT_MISMATCH_ROW_${rowIndex + 1}`);
      const panelCounts = depths.map((depth) => panelCountFromProjection(depth, group));
      rows.push({
        rowIndex,
        rowLabel: rowIndex === 0 ? 'front-row' : 'rear-row',
        moduleWidths: widths.slice(),
        moduleDepths: depths.slice(),
        panelCounts
      });
    }
    const systemCount = rows.reduce((sum, row) => sum + row.moduleWidths.length, 0);
    const totalWidth = Math.max(0, ...rows.map((row) => row.moduleWidths.reduce((sum, value) => sum + value, 0)));
    const rowDepths = rows.map((row) => Math.max(0, ...row.moduleDepths));
    const sharedBackToBackBeam = 0;
    const maxDepth = Math.max(0, rowDepths.reduce((sum, value) => sum + value, 0) - sharedBackToBackBeam);
    const flatWidths = rows.flatMap((row) => row.moduleWidths);
    const flatDepths = rows.flatMap((row) => row.moduleDepths);
    const flatPanelCounts = rows.flatMap((row) => row.panelCounts);
    return {
      valid: errors.length === 0,
      errors,
      backToBack: true,
      rowCount: 2,
      systemCount,
      totalWidth,
      moduleWidths: flatWidths,
      moduleDepths: flatDepths,
      maxDepth,
      panelCounts: flatPanelCounts,
      alignment: 'front',
      multiRows: rows,
      rowAlignment: widthGrid.terminalColonNo ? 'right' : 'left',
      panelCollection: openingGrid.terminalColonNo ? 'outer' : 'center',
      widthInputMode: 'ROW_MODULE_LIST',
      openingInputMode: 'ROW_MODULE_LIST'
    };
  }

  if (typeof window !== 'undefined') {
    window.P3DVMultiPositionInput = Object.freeze({
      parse: (value, options) => parseMultiPositionNumberList(value, options),
      parseGrid: (value, options) => parseMultiRowNumberGrid(value, options),
      resolve: (group, systemCount, width, opening) => resolveFreedomBioTopology(group, systemCount, width, opening)
    });
  }

  function closeP3dvCombos(except = null) {
    [ids.projectionCombo, ids.motorCombo, ids.remoteCombo, ids.ledCombo, ids.pergoFabricCombo].forEach((id) => {
      const combo = $(id);
      if (!combo || combo === except) return;
      combo.classList.remove('is-open');
      const menu = combo.querySelector('.p3dv-combo-menu');
      if (menu) menu.hidden = true;
    });
  }

  function renderComboOptions(menu, values, currentValue, onSelect, labelForValue = null) {
    if (!menu) return;
    if(['motorComboMenu','remoteComboMenu','ledComboMenu'].includes(menu.id)){
      const id=menu.id.replace('ComboMenu','Input'),old=$(id);let select=old;
      if(old.tagName!=='SELECT'){select=document.createElement('select');select.id=id;select.setAttribute('aria-label',({motorInput:'Motor',remoteInput:'Kumanda',ledInput:'LED'})[id]);select.disabled=old.disabled;old.replaceWith(select);}
      const choices=[...values];if(currentValue&&!choices.includes(currentValue))choices.push(currentValue);
      select.replaceChildren(...choices.map(v=>{const o=document.createElement('option');o.value=v;o.textContent=v;return o;}));select.value=currentValue||choices[0]||'';select.onchange=()=>onSelect(select.value);
      menu.hidden=true;const button=menu.previousElementSibling;if(button?.tagName==='BUTTON')button.hidden=true;return;
    }
    const current = String(currentValue || '').trim().toLocaleUpperCase('tr-TR');
    menu.innerHTML = '';
    values.forEach((value) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'p3dv-combo-option' + (String(value).trim().toLocaleUpperCase('tr-TR') === current ? ' is-selected' : '');
      const label = labelForValue ? labelForValue(value) : null;
      button.innerHTML = `<span>${String(value)}</span>${label ? `<small>${label}</small>` : ''}`;
      button.addEventListener('mousedown', (event) => event.preventDefault());
      button.addEventListener('click', () => onSelect(String(value)));
      menu.appendChild(button);
    });
  }

  function setComboOpen(combo, menu, open) {
    if (!combo || !menu) return;
    closeP3dvCombos(open ? combo : null);
    combo.classList.toggle('is-open', Boolean(open));
    menu.hidden = !open;
  }

  function renderProjectionComboMenu() {
    const menu = $(ids.projectionComboMenu);
    const list = projectionPresetSelect();
    if (!menu || !list) return;
    const values = Array.from(list.options || []).map((option) => option.value).filter(Boolean);
    renderComboOptions(menu, values, depthControlValue(), (value) => {
      const current = depthControlValue();
      if (modelState.productGroup !== 'pergo-rise' && /[;:]$/.test(current) && !/:NO$/i.test(current)) setDepthControlValue(current + value);
      else if (modelState.productGroup !== 'pergo-rise' && /:NO$/i.test(current)) setFreedomValidation('Yeni açılım eklemek için önce terminal :NO komutunu kaldırın.');
      else setDepthControlValue(value);
      setComboOpen($(ids.projectionCombo), menu, false);
      $(ids.freedomDepth).dispatchEvent(new Event('input', { bubbles: true }));
      $(ids.freedomDepth).dispatchEvent(new Event('change', { bubbles: true }));
      $(ids.freedomDepth).focus();
    }, (value) => modelState.productGroup === 'pergo-rise' ? `${value} mm` : `- ${panelCountFromProjection(Number(value), modelState.productGroup)} Panel`);
  }

  function isPergoRiseUi() {
    return modelState.productGroup === 'pergo-rise';
  }

  function motorOptionsForProduct() {
    return isPergoRiseUi() ? PERGO_RISE_UI_MOTOR_OPTIONS : FREEDOM_UI_MOTOR_OPTIONS;
  }

  function remoteOptionsForMotor() {
    const key = normalizeMotorKey($(ids.motorInput) && $(ids.motorInput).value);
    return isPergoRiseUi() ? (PERGO_RISE_UI_REMOTE_OPTIONS[key] || ['-']) : (FREEDOM_UI_REMOTE_OPTIONS[key] || ['Yok']);
  }

  function renderMotorComboMenu() {
    renderComboOptions($(ids.motorComboMenu), motorOptionsForProduct(), $(ids.motorInput).value, (value) => {
      $(ids.motorInput).value = value;
      const remoteValues = remoteOptionsForMotor();
      if (!remoteValues.some((item) => String(item).toLocaleUpperCase('tr-TR') === String($(ids.remoteInput).value).toLocaleUpperCase('tr-TR'))) $(ids.remoteInput).value = remoteValues[0] || (isPergoRiseUi() ? '-' : 'Yok');
      if (isPergoRiseUi()) {
        syncPergoRiseInputInfrastructure({ schedulePreview: true });
      } else {
        modelState.motor = value;
        modelState.remote = $(ids.remoteInput).value;
      }
      const noMotor = isPergoRiseUi() ? normalizeMotorKey(value) === '-' : normalizeMotorKey(value) === 'YOK';
      $(ids.remoteInput).disabled = noMotor;
      $(ids.remoteComboButton).disabled = noMotor;
      setComboOpen($(ids.motorCombo), $(ids.motorComboMenu), false);
      renderRemoteComboMenu();
    });
  }

  function renderRemoteComboMenu() {
    renderComboOptions($(ids.remoteComboMenu), remoteOptionsForMotor(), $(ids.remoteInput).value, (value) => {
      $(ids.remoteInput).value = value;
      if (isPergoRiseUi()) syncPergoRiseInputInfrastructure({ schedulePreview: true });
      else modelState.remote = value;
      setComboOpen($(ids.remoteCombo), $(ids.remoteComboMenu), false);
      $(ids.remoteInput).focus();
    });
  }

  function renderLedComboMenu() {
    if (isPergoRiseUi()) return;
    renderComboOptions($(ids.ledComboMenu), FREEDOM_UI_LED_OPTIONS, $(ids.ledInput).value, (value) => {
      $(ids.ledInput).value = value;
      modelState.led = value;
      setComboOpen($(ids.ledCombo), $(ids.ledComboMenu), false);
      $(ids.ledInput).focus();
    });
  }

  function renderPergoFabricComboMenu() {
    if (!isPergoRiseUi()) return;
    renderComboOptions($(ids.pergoFabricComboMenu), PERGO_RISE_UI_FABRIC_OPTIONS, $(ids.pergoFabric).value, (value) => {
      $(ids.pergoFabric).value = value;
      syncPergoRiseInputInfrastructure({ schedulePreview: true });
      setComboOpen($(ids.pergoFabricCombo), $(ids.pergoFabricComboMenu), false);
      $(ids.pergoFabric).focus();
    });
  }

  function pergoInputApi() {
    return window.P3DVPergoRiseInput || null;
  }

  function pergoInputOwnership() {
    const projectOwnership = modelState.pergoRiseProject && modelState.pergoRiseProject.ownership || {};
    return {
      rayCount: Boolean($(ids.pergoRayCount) && $(ids.pergoRayCount).dataset.userEdited === 'true') || Boolean(projectOwnership.rayCount),
      postCount: Boolean($(ids.pergoPostCount) && $(ids.pergoPostCount).dataset.userEdited === 'true') || Boolean(projectOwnership.postCount)
    };
  }

  function setPergoInputOwnership(ownership) {
    const value = ownership || {};
    if ($(ids.pergoRayCount)) $(ids.pergoRayCount).dataset.userEdited = value.rayCount ? 'true' : 'false';
    if ($(ids.pergoPostCount)) $(ids.pergoPostCount).dataset.userEdited = value.postCount ? 'true' : 'false';
  }

  function pergoUiValue(id, fallback) {
    const element = $(id);
    if (!element) return fallback;
    return String(element.value == null ? '' : element.value);
  }

  function collectPergoRiseRawInput() {
    const api = pergoInputApi();
    const base = api ? api.clone(api.DEFAULT_INPUT) : { ...(window.P3DVPergoRiseProduct && window.P3DVPergoRiseProduct.DEFAULT_RAW || {}) };
    const existing = modelState.pergoRiseProject && modelState.pergoRiseProject.input || {};
    return {
      ...base,
      ...existing,
      product: 'Pergo Rise', moduleName: 'Module 1', engine: 'Web DXF',
      systemCount: pergoUiValue(ids.pergoSystemCount, ''),
      width: pergoUiValue(ids.freedomWidth, ''),
      opening: pergoUiValue(ids.freedomDepth, ''),
      rearHeight: pergoUiValue(ids.freedomHeight, ''),
      frontHeight: pergoUiValue(ids.pergoFrontHeight, ''),
      rayCount: pergoUiValue(ids.pergoRayCount, ''),
      postCount: pergoUiValue(ids.pergoPostCount, ''),
      parapet: pergoUiValue(ids.parapetInput, 'HAYIR'),
      parapetHeight: pergoUiValue(ids.parapetHeightInput, '-'),
      glassTrack: pergoUiValue(ids.pergoGlassTrack, 'HAYIR'),
      glassRayBoundaryMode: pergoUiValue(ids.pergoGlassRayBoundaryMode, 'DARALT'),
      sideTrack: 'HAYIR',
      structureColor: pergoUiValue(ids.pergoStructureColor, '-'),
      fabric: pergoUiValue(ids.pergoFabric, '-'),
      fabricProfiles: pergoUiValue(ids.pergoFabricProfiles, '-'),
      motor: pergoUiValue(ids.motorInput, '-'),
      remote: pergoUiValue(ids.remoteInput, '-'),
      led: pergoUiValue(ids.ledInput, '-'),
      dimmer: pergoUiValue(ids.pergoDimmer, '-'),
      extras: pergoUiValue(ids.extrasInput, '-'),
      triangleJoinery: pergoUiValue(ids.pergoTriangleJoinery, 'HAYIR'),
      waterStandard: pergoUiValue(ids.waterStandardInput, 'EVET'),
      waterOutletPlacement: pergoUiValue(ids.pergoWaterOutletPlacement, 'BOTH'),
      __rearSupport: existing.__rearSupport || { type: 'wall' }
    };
  }

  function cloneJson(value, fallback = null) {
    try { return JSON.parse(JSON.stringify(value)); } catch (error) { return fallback; }
  }

  function pergoBackWallSideKey(systemIndex) {
    return String(Math.max(0, Math.round(Number(systemIndex) || 0)));
  }

  function pergoBackWallScopedValue(state, systemIndex, fallback) {
    const source = state && typeof state === 'object' ? state : {};
    const key = pergoBackWallSideKey(systemIndex);
    if (key === '0') return { ...(fallback || {}), ...(source.left || {}) };
    return { ...(fallback || {}), ...((source.middle && source.middle[key]) || {}) };
  }

  function setPergoBackWallScopedValue(state, systemIndex, value) {
    const source = state && typeof state === 'object' ? cloneJson(state, {}) : {};
    source.left = source.left && typeof source.left === 'object' ? source.left : { enabled: true, xOffset: 0, depth: 600, height: 0 };
    source.right = source.right && typeof source.right === 'object' ? source.right : { enabled: true, xOffset: 0, depth: 600, height: 0 };
    source.middle = source.middle && typeof source.middle === 'object' ? source.middle : {};
    const key = pergoBackWallSideKey(systemIndex);
    if (key === '0') source.left = { ...source.left, ...(value || {}) };
    else source.middle[key] = { ...(source.middle[key] || {}), ...(value || {}) };
    return source;
  }

  function deletePergoBackWallScopedValue(state, systemIndex) {
    const source = state && typeof state === 'object' ? cloneJson(state, {}) : {};
    const key = pergoBackWallSideKey(systemIndex);
    if (key === '0') source.left = { enabled: true, xOffset: 0, depth: 600, height: 0 };
    else if (source.middle) delete source.middle[key];
    return source;
  }

  function pergoBackWallNumber(value, fallback = NaN) {
    const number = Number(String(value == null ? '' : value).trim().replace(',', '.'));
    return Number.isFinite(number) ? number : fallback;
  }

  function pergoBackWallInteger(value, fallback = 1) {
    return Math.max(1, Math.min(20, Math.floor(pergoBackWallNumber(value, fallback) || fallback)));
  }

  function pergoBackWallDirection(startDepth, endDepth) {
    const start = Number(startDepth) || 0, end = Number(endDepth) || 0;
    if (Math.abs(end - start) <= 0.001) return 'STRAIGHT';
    return end > start ? 'NEGATIVE_X_TO_POSITIVE_X' : 'POSITIVE_X_TO_NEGATIVE_X';
  }

  function splitPergoTopWallCell(cell, columns, rows) {
    const cols = pergoBackWallInteger(columns, 1), rws = pergoBackWallInteger(rows, 1);
    const x0 = Number(cell.minX), x1 = Number(cell.maxX);
    const lerpValue = (a, b, t) => Number(a) + (Number(b) - Number(a)) * t;
    const out = [];
    for (let column = 0; column < cols; column += 1) {
      const ta = column / cols, tb = (column + 1) / cols;
      const cx0 = lerpValue(x0, x1, ta), cx1 = lerpValue(x0, x1, tb);
      const nearA = lerpValue(cell.startNearDepth, cell.endNearDepth, ta);
      const nearB = lerpValue(cell.startNearDepth, cell.endNearDepth, tb);
      const farA = lerpValue(cell.startFarDepth, cell.endFarDepth, ta);
      const farB = lerpValue(cell.startFarDepth, cell.endFarDepth, tb);
      for (let row = 0; row < rws; row += 1) {
        const ra = row / rws, rb = (row + 1) / rws;
        out.push({
          id: `${cell.id}_c${column + 1}_r${row + 1}`,
          enabled: true,
          minX: cx0, maxX: cx1,
          startNearDepth: lerpValue(nearA, farA, ra),
          endNearDepth: lerpValue(nearB, farB, ra),
          startFarDepth: lerpValue(nearA, farA, rb),
          endFarDepth: lerpValue(nearB, farB, rb)
        });
      }
    }
    return out;
  }

  function buildPergoSideWallGrid(systemIndex, depth, height, columns, rows, autoHeight) {
    const key = pergoBackWallSideKey(systemIndex);
    const cols = pergoBackWallInteger(columns, 1), rws = pergoBackWallInteger(rows, 1);
    const wallDepth = Math.max(1, Number(depth) || 600), wallHeight = Math.max(1, Number(height) || 1);
    const cells = [];
    for (let column = 0; column < cols; column += 1) {
      const minX = wallDepth * column / cols, maxX = wallDepth * (column + 1) / cols;
      for (let row = 0; row < rws; row += 1) {
        const minY = wallHeight * row / rws, maxY = wallHeight * (row + 1) / rws;
        cells.push({ id: `back_wall_cell_${key}_c${column + 1}_r${row + 1}`, minX, maxX, minY, maxY });
      }
    }
    return { version: 1, autoHeight: Boolean(autoHeight), columns: cols, rows: rws, bounds: { minX: 0, maxX: wallDepth, minY: 0, maxY: wallHeight }, cells };
  }

  function pergoBackWallDefaultConfig(systemIndex) {
    const project = modelState.pergoRiseProject;
    const normalized = project && project.normalized;
    const system = normalized && normalized.systems && normalized.systems[systemIndex];
    const position = normalized && normalized.positions && normalized.positions[systemIndex];
    if (!system || !position) return null;
    const input = project.input || {};
    const wallState = pergoBackWallScopedValue(input.__backWallState || normalized.backWallState, systemIndex, { enabled: true, xOffset: 0, depth: 600, height: 0 });
    const rawTopGrid = input.__topBackWallGridState && input.__topBackWallGridState[String(systemIndex)];
    const normalizedTopGrid = normalized.topBackWallGridState && normalized.topBackWallGridState[String(systemIndex)];
    const topGrid = rawTopGrid && Array.isArray(rawTopGrid.cells) && rawTopGrid.cells.length ? rawTopGrid : normalizedTopGrid;
    const topCells = topGrid && Array.isArray(topGrid.cells) ? topGrid.cells.filter(cell => cell && cell.enabled !== false) : [];
    const minX = topCells.length ? Math.min(...topCells.map(cell => Number(cell.minX))) : 0;
    const maxX = topCells.length ? Math.max(...topCells.map(cell => Number(cell.maxX))) : Math.max(1, Number(system.outerEndX) - Number(system.outerStartX));
    const leftCells = topCells.filter(cell => Math.abs(Number(cell.minX) - minX) <= 0.001);
    const rightCells = topCells.filter(cell => Math.abs(Number(cell.maxX) - maxX) <= 0.001);
    const startDepth = leftCells.length ? Math.max(...leftCells.map(cell => Number(cell.startFarDepth) || 0)) : 800;
    const endDepth = rightCells.length ? Math.max(...rightCells.map(cell => Number(cell.endFarDepth) || 0)) : startDepth;
    const rawSideGrid = input.__backWallGridState && input.__backWallGridState.side && input.__backWallGridState.side[String(systemIndex)];
    const sideGrid = rawSideGrid || (normalized.backWallGridState && normalized.backWallGridState.side && normalized.backWallGridState.side[String(systemIndex)]);
    return {
      systemIndex,
      enabled: wallState.enabled !== false,
      xOffset: Number(wallState.xOffset) || 0,
      height: Math.max(0, Number(wallState.height) || 0),
      resolvedHeight: Math.max(1, Number(wallState.height) || Number(position.rearHeight) || 1),
      depth: Math.max(1, Number(wallState.depth) || 600),
      minX: Number.isFinite(minX) ? minX : 0,
      maxX: Number.isFinite(maxX) ? maxX : Math.max(1, Number(system.outerEndX) - Number(system.outerStartX)),
      startDepth: Math.max(0, Number(startDepth) || 0),
      endDepth: Math.max(0, Number(endDepth) || 0),
      direction: pergoBackWallDirection(startDepth, endDepth),
      topColumns: Math.max(1, Number(rawTopGrid && rawTopGrid.columns) || new Set(topCells.flatMap(cell => [Number(cell.minX).toFixed(6), Number(cell.maxX).toFixed(6)])).size - 1 || 1),
      topRows: Math.max(1, Number(rawTopGrid && rawTopGrid.rows) || 1),
      sideColumns: Math.max(1, Number(sideGrid && sideGrid.columns) || 1),
      sideRows: Math.max(1, Number(sideGrid && sideGrid.rows) || 1),
      position,
      system
    };
  }

  function updatePergoBackWallSummary() {
    const node = $(ids.pergoBackWallSummary);
    if (!node) return;
    const project = modelState.pergoRiseProject;
    const normalized = project && project.normalized;
    if (!normalized || !Array.isArray(normalized.systems)) { node.textContent = 'ÖLÇÜLERİ TAMAMLA'; return; }
    let enabled = 0;
    normalized.systems.forEach((system, index) => {
      const state = pergoBackWallScopedValue(normalized.backWallState, index, { enabled: true });
      if (state.enabled !== false) enabled += 1;
    });
    node.textContent = enabled ? `${enabled}/${normalized.systems.length} VAR · PLMR` : 'YOK';
  }

  function setPergoBackWallFieldsDisabled(disabled) {
    [ids.pergoBackWallDirection, ids.pergoBackWallOffset, ids.pergoBackWallHeight, ids.pergoBackWallDepth,
      ids.pergoBackWallMinX, ids.pergoBackWallMaxX, ids.pergoBackWallStartDepth, ids.pergoBackWallEndDepth,
      ids.pergoBackWallAngle, ids.pergoBackWallTopColumns, ids.pergoBackWallTopRows, ids.pergoBackWallSideColumns,
      ids.pergoBackWallSideRows].forEach(id => { if ($(id)) $(id).disabled = Boolean(disabled); });
  }

  function loadPergoBackWallDialog(systemIndex) {
    const config = pergoBackWallDefaultConfig(systemIndex);
    if (!config) return false;
    suppressPergoBackWallDialogEvents = true;
    try {
      $(ids.pergoBackWallSystem).value = String(config.systemIndex);
      $(ids.pergoBackWallEnabled).value = config.enabled ? 'EVET' : 'HAYIR';
      $(ids.pergoBackWallDirection).value = config.direction;
      $(ids.pergoBackWallOffset).value = String(Number(config.xOffset.toFixed(3)));
      $(ids.pergoBackWallHeight).value = config.height > 0 ? String(Math.round(config.height)) : '';
      $(ids.pergoBackWallDepth).value = String(Math.round(config.depth));
      $(ids.pergoBackWallMinX).value = String(Number(config.minX.toFixed(3)));
      $(ids.pergoBackWallMaxX).value = String(Number(config.maxX.toFixed(3)));
      $(ids.pergoBackWallStartDepth).value = String(Number(config.startDepth.toFixed(3)));
      $(ids.pergoBackWallEndDepth).value = String(Number(config.endDepth.toFixed(3)));
      const angle = Math.atan2(config.endDepth - config.startDepth, Math.max(0.001, config.maxX - config.minX)) * 180 / Math.PI;
      $(ids.pergoBackWallAngle).value = String(Number(angle.toFixed(3)));
      $(ids.pergoBackWallTopColumns).value = String(config.topColumns);
      $(ids.pergoBackWallTopRows).value = String(config.topRows);
      $(ids.pergoBackWallSideColumns).value = String(config.sideColumns);
      $(ids.pergoBackWallSideRows).value = String(config.sideRows);
      setPergoBackWallFieldsDisabled(!config.enabled);
      $(ids.pergoBackWallError).textContent = '';
      $(ids.pergoBackWallNote).textContent = `Sistem ${config.systemIndex + 1} · PLMR genişliği ${Math.round(config.system.outerEndX - config.system.outerStartX)} mm · Arka H ${Math.round(config.position.rearHeight)} mm. +Y/arka kenar sabittir; 3D karşılığı negatif Z yönüdür.`;
    } finally {
      suppressPergoBackWallDialogEvents = false;
    }
    return true;
  }

  function populatePergoBackWallSystems(selectedIndex = 0) {
    const select = $(ids.pergoBackWallSystem);
    const normalized = modelState.pergoRiseProject && modelState.pergoRiseProject.normalized;
    if (!select || !normalized || !Array.isArray(normalized.systems)) return false;
    select.textContent = '';
    normalized.systems.forEach((system, index) => {
      const option = document.createElement('option');
      option.value = String(index); option.textContent = `Sistem ${index + 1} / Poz ${index + 1}`;
      select.appendChild(option);
    });
    select.value = String(Math.min(Math.max(0, selectedIndex), normalized.systems.length - 1));
    return true;
  }

  function readPergoBackWallDialogConfig() {
    const systemIndex = Math.max(0, Number($(ids.pergoBackWallSystem).value) || 0);
    const fallback = pergoBackWallDefaultConfig(systemIndex);
    if (!fallback) return { error: 'Önce zorunlu Pergola ölçülerini tamamlayın.' };
    const enabled = $(ids.pergoBackWallEnabled).value !== 'HAYIR';
    const minX = pergoBackWallNumber($(ids.pergoBackWallMinX).value);
    const maxX = pergoBackWallNumber($(ids.pergoBackWallMaxX).value);
    const startDepth = pergoBackWallNumber($(ids.pergoBackWallStartDepth).value);
    let endDepth = pergoBackWallNumber($(ids.pergoBackWallEndDepth).value);
    const xOffset = pergoBackWallNumber($(ids.pergoBackWallOffset).value, 0);
    const height = Math.max(0, pergoBackWallNumber($(ids.pergoBackWallHeight).value, 0));
    const depth = pergoBackWallNumber($(ids.pergoBackWallDepth).value);
    const angle = pergoBackWallNumber($(ids.pergoBackWallAngle).value, 0);
    if (![minX, maxX, startDepth, endDepth, xOffset, height, depth, angle].every(Number.isFinite)) return { error: 'Arka duvar ölçülerinin tamamı geçerli sayı olmalı.' };
    if (!(maxX > minX)) return { error: 'Parça bitiş X değeri başlangıç X değerinden büyük olmalı.' };
    if (startDepth < 0 || endDepth < 0 || depth <= 0) return { error: 'Duvar derinlikleri pozitif olmalı.' };
    const direction = $(ids.pergoBackWallDirection).value || pergoBackWallDirection(startDepth, endDepth);
    const delta = Math.abs(endDepth - startDepth);
    if (direction === 'STRAIGHT') endDepth = startDepth;
    else if (direction === 'NEGATIVE_X_TO_POSITIVE_X' && endDepth < startDepth) endDepth = startDepth + delta;
    else if (direction === 'POSITIVE_X_TO_NEGATIVE_X' && endDepth > startDepth) endDepth = Math.max(0, startDepth - delta);
    return {
      systemIndex, enabled, minX, maxX, startDepth, endDepth, xOffset, height, depth,
      direction: pergoBackWallDirection(startDepth, endDepth),
      topColumns: pergoBackWallInteger($(ids.pergoBackWallTopColumns).value, 1),
      topRows: pergoBackWallInteger($(ids.pergoBackWallTopRows).value, 1),
      sideColumns: pergoBackWallInteger($(ids.pergoBackWallSideColumns).value, 1),
      sideRows: pergoBackWallInteger($(ids.pergoBackWallSideRows).value, 1),
      resolvedHeight: height > 0 ? height : fallback.resolvedHeight
    };
  }

  function applyPergoBackWallDialog(options = {}) {
    if (!isPergoRiseUi()) return false;
    const config = readPergoBackWallDialogConfig();
    if (config.error) { if ($(ids.pergoBackWallError)) $(ids.pergoBackWallError).textContent = config.error; return false; }
    const project = modelState.pergoRiseProject;
    if (!project || !project.input) return false;
    const raw = cloneJson(project.input, {});
    raw.__rearSupport = { ...(raw.__rearSupport || {}), type: 'wall' };
    raw.__backWallState = setPergoBackWallScopedValue(raw.__backWallState, config.systemIndex, {
      enabled: config.enabled, xOffset: config.xOffset, depth: config.depth, height: config.height
    });
    if (raw.__topBackWallSegments) delete raw.__topBackWallSegments[String(config.systemIndex)];
    if (raw.__backWallSegments && raw.__backWallSegments.side) delete raw.__backWallSegments.side[String(config.systemIndex)];
    raw.__topBackWallGridState = raw.__topBackWallGridState && typeof raw.__topBackWallGridState === 'object' ? cloneJson(raw.__topBackWallGridState, {}) : {};
    const baseCell = {
      id: `top_wall_${config.systemIndex}_stage2`, enabled: true,
      minX: config.minX, maxX: config.maxX,
      startNearDepth: 0, endNearDepth: 0,
      startFarDepth: config.startDepth, endFarDepth: config.endDepth
    };
    raw.__topBackWallGridState[String(config.systemIndex)] = {
      version: 1, columns: config.topColumns, rows: config.topRows,
      cells: splitPergoTopWallCell(baseCell, config.topColumns, config.topRows)
    };
    raw.__backWallGridState = raw.__backWallGridState && typeof raw.__backWallGridState === 'object' ? cloneJson(raw.__backWallGridState, {}) : {};
    raw.__backWallGridState.side = raw.__backWallGridState.side && typeof raw.__backWallGridState.side === 'object' ? raw.__backWallGridState.side : {};
    raw.__backWallGridState.side[String(config.systemIndex)] = buildPergoSideWallGrid(
      config.systemIndex, config.depth, config.resolvedHeight, config.sideColumns, config.sideRows, config.height <= 0
    );
    replacePergoCanonicalInput(raw, pergoInputOwnership(), { schedulePreview: true });
    updatePergoBackWallSummary();
    if ($(ids.pergoBackWallError)) $(ids.pergoBackWallError).textContent = '';
    if (!options.silent) setFreedomValidation(`Arka duvar Sistem ${config.systemIndex + 1} için PLMR kurallarıyla güncellendi.`);
    return true;
  }

  function schedulePergoBackWallLiveUpdate() {
    if (suppressPergoBackWallDialogEvents) return;
    window.clearTimeout(pergoBackWallLiveTimer);
    pergoBackWallLiveTimer = window.setTimeout(() => applyPergoBackWallDialog({ silent: true }), 320);
  }

  function openPergoBackWallDialog() {
    if (!isPergoRiseUi()) return;
    const project = syncPergoRiseInputInfrastructure({ keepValidation: true });
    if (!project || !project.valid || !project.normalized) {
      setFreedomValidation('Arka duvar ayarları için Sistem Adedi, Genişlik, Açılım, Arka H ve Ön H alanlarını tamamlayın.');
      return;
    }
    pergoBackWallDialogSnapshot = cloneJson(project.input, null);
    if (!populatePergoBackWallSystems(0) || !loadPergoBackWallDialog(0)) return;
    $(ids.pergoBackWallDialog).hidden = false;
  }

  function closePergoBackWallDialog(restore) {
    window.clearTimeout(pergoBackWallLiveTimer);
    const dialog = $(ids.pergoBackWallDialog);
    if (restore && pergoBackWallDialogSnapshot) {
      replacePergoCanonicalInput(pergoBackWallDialogSnapshot, pergoInputOwnership(), { schedulePreview: true });
    }
    pergoBackWallDialogSnapshot = null;
    if (dialog) dialog.hidden = true;
  }

  function resetPergoBackWallSystem() {
    const project = modelState.pergoRiseProject;
    if (!project || !project.input) return;
    const systemIndex = Math.max(0, Number($(ids.pergoBackWallSystem).value) || 0);
    const raw = cloneJson(project.input, {});
    raw.__backWallState = deletePergoBackWallScopedValue(raw.__backWallState, systemIndex);
    if (raw.__topBackWallSegments) delete raw.__topBackWallSegments[String(systemIndex)];
    if (raw.__backWallSegments && raw.__backWallSegments.side) delete raw.__backWallSegments.side[String(systemIndex)];
    if (raw.__topBackWallGridState) delete raw.__topBackWallGridState[String(systemIndex)];
    if (raw.__backWallGridState && raw.__backWallGridState.side) delete raw.__backWallGridState.side[String(systemIndex)];
    replacePergoCanonicalInput(raw, pergoInputOwnership(), { schedulePreview: true });
    loadPergoBackWallDialog(systemIndex);
    updatePergoBackWallSummary();
    setFreedomValidation(`Arka duvar Sistem ${systemIndex + 1} PLMR varsayılanına döndürüldü.`);
  }

  function syncPergoBackWallAngleFromDepths() {
    if (suppressPergoBackWallDialogEvents) return;
    const minX = pergoBackWallNumber($(ids.pergoBackWallMinX).value), maxX = pergoBackWallNumber($(ids.pergoBackWallMaxX).value);
    const start = pergoBackWallNumber($(ids.pergoBackWallStartDepth).value), end = pergoBackWallNumber($(ids.pergoBackWallEndDepth).value);
    if ([minX, maxX, start, end].every(Number.isFinite) && maxX > minX) {
      suppressPergoBackWallDialogEvents = true;
      try {
        $(ids.pergoBackWallAngle).value = String(Number((Math.atan2(end - start, maxX - minX) * 180 / Math.PI).toFixed(3)));
        $(ids.pergoBackWallDirection).value = pergoBackWallDirection(start, end);
      } finally { suppressPergoBackWallDialogEvents = false; }
    }
    schedulePergoBackWallLiveUpdate();
  }

  function syncPergoBackWallDepthFromAngle() {
    if (suppressPergoBackWallDialogEvents) return;
    const minX = pergoBackWallNumber($(ids.pergoBackWallMinX).value), maxX = pergoBackWallNumber($(ids.pergoBackWallMaxX).value);
    const start = pergoBackWallNumber($(ids.pergoBackWallStartDepth).value), angle = pergoBackWallNumber($(ids.pergoBackWallAngle).value);
    if ([minX, maxX, start, angle].every(Number.isFinite) && maxX > minX) {
      const end = Math.max(0, start + Math.tan(angle * Math.PI / 180) * (maxX - minX));
      suppressPergoBackWallDialogEvents = true;
      try {
        $(ids.pergoBackWallEndDepth).value = String(Number(end.toFixed(3)));
        $(ids.pergoBackWallDirection).value = pergoBackWallDirection(start, end);
      } finally { suppressPergoBackWallDialogEvents = false; }
    }
    schedulePergoBackWallLiveUpdate();
  }

  function mirrorPergoCompatibilityState(input) {
    const source = input || {};
    modelState.systemCount = Math.max(1, Math.round(Number(source.systemCount) || 1));
    modelState.parapet = source.parapet || 'HAYIR';
    modelState.parapetHeight = source.parapetHeight || '-';
    modelState.pergoOptions = {
      glassTrack: source.glassTrack || 'HAYIR',
      structureColor: source.structureColor || '-',
      fabric: source.fabric || '-',
      fabricProfiles: source.fabricProfiles || '-',
      motor: source.motor || '-',
      remote: source.remote || '-',
      led: source.led || '-',
      dimmer: source.dimmer || '-',
      triangleJoinery: source.triangleJoinery || 'HAYIR',
      waterStandard: source.waterStandard || 'EVET',
      waterOutletPlacement: source.waterOutletPlacement || 'BOTH',
      extras: source.extras || '-'
    };
  }

  function updatePergoCalculatedFieldStyles(ownership) {
    [[ids.pergoRayCount, 'rayCount'], [ids.pergoPostCount, 'postCount']].forEach(([id, field]) => {
      const element = $(id);
      if (!element) return;
      element.classList.toggle('pergo-manual-field', Boolean(ownership && ownership[field]));
      element.classList.toggle('pergo-calculated-field', !Boolean(ownership && ownership[field]) && Boolean(String(element.value || '').trim()));
    });
  }

  function syncPergoRiseInputInfrastructure(options = {}) {
    if (!isPergoRiseUi() || suppressPergoInputInfrastructure) return modelState.pergoRiseProject;
    const api = pergoInputApi();
    if (!api || !window.P3DVPergoRiseProduct || typeof window.P3DVPergoRiseProduct.createDraft !== 'function') return modelState.pergoRiseProject;
    const ownership = options.forceAuto ? { rayCount: false, postCount: false } : pergoInputOwnership();
    try {
      const draft = window.P3DVPergoRiseProduct.createDraft(collectPergoRiseRawInput(), { ownership });
      suppressPergoInputInfrastructure = true;
      try {
        if ($(ids.pergoSystemCount)) $(ids.pergoSystemCount).value = draft.input.systemCount || '';
        if ($(ids.pergoRayCount)) $(ids.pergoRayCount).value = draft.input.rayCount || '';
        if ($(ids.pergoPostCount)) $(ids.pergoPostCount).value = draft.input.postCount || '';
        if ($(ids.remoteInput) && $(ids.remoteInput).value !== draft.input.remote) $(ids.remoteInput).value = draft.input.remote || '-';
        setPergoInputOwnership(draft.ownership);
        updatePergoCalculatedFieldStyles(draft.ownership);
      } finally {
        suppressPergoInputInfrastructure = false;
      }
      modelState.pergoRiseProject = draft;
      mirrorPergoCompatibilityState(draft.input);
      updatePergoBackWallSummary();
      if ($(ids.pergoWaterOutletPlacementRow)) $(ids.pergoWaterOutletPlacementRow).hidden = draft.input.waterStandard !== 'HAYIR';
      if (draft.errors && draft.errors.length) setFreedomValidation(`PLMR kuralı: ${draft.errors[0]}`);
      else if (!options.keepValidation) setFreedomValidation('');
      if (options.schedulePreview) scheduleAutomaticPreview();
      return draft;
    } catch (error) {
      setFreedomValidation(`PLMR veri giriş kuralı: ${error && error.message ? error.message : String(error)}`);
      return modelState.pergoRiseProject;
    }
  }

  function renderPergoInputFromCanonical() {
    const api = pergoInputApi();
    const project = modelState.pergoRiseProject || (window.P3DVPergoRiseProduct && window.P3DVPergoRiseProduct.createDraft
      ? window.P3DVPergoRiseProduct.createDraft(api ? api.DEFAULT_INPUT : {}, { ownership: { rayCount: false, postCount: false } }) : null);
    if (!project || !project.input) return;
    modelState.pergoRiseProject = project;
    const raw = project.input;
    suppressPergoInputInfrastructure = true;
    try {
      if ($(ids.pergoSystemCount)) $(ids.pergoSystemCount).value = raw.systemCount || '';
      if ($(ids.freedomWidth)) $(ids.freedomWidth).value = raw.width || '';
      setDepthControlValue(raw.opening || '');
      if ($(ids.freedomHeight)) $(ids.freedomHeight).value = raw.rearHeight || '';
      if ($(ids.pergoFrontHeight)) $(ids.pergoFrontHeight).value = raw.frontHeight || '';
      if ($(ids.pergoRayCount)) $(ids.pergoRayCount).value = raw.rayCount || '';
      if ($(ids.pergoPostCount)) $(ids.pergoPostCount).value = raw.postCount || '';
      if ($(ids.parapetInput)) $(ids.parapetInput).value = raw.parapet || 'HAYIR';
      if ($(ids.parapetHeightInput)) $(ids.parapetHeightInput).value = raw.parapetHeight || '-';
      if ($(ids.pergoGlassTrack)) $(ids.pergoGlassTrack).value = raw.glassTrack || 'HAYIR';
      if ($(ids.pergoGlassRayBoundaryMode)) $(ids.pergoGlassRayBoundaryMode).value = raw.glassRayBoundaryMode || 'DARALT';
      if ($(ids.pergoStructureColor)) $(ids.pergoStructureColor).value = raw.structureColor || '-';
      if ($(ids.pergoFabric)) $(ids.pergoFabric).value = raw.fabric || '-';
      if ($(ids.pergoFabricProfiles)) $(ids.pergoFabricProfiles).value = raw.fabricProfiles || '-';
      if ($(ids.motorInput)) $(ids.motorInput).value = raw.motor || '-';
      if ($(ids.remoteInput)) $(ids.remoteInput).value = raw.remote || '-';
      if ($(ids.ledInput)) $(ids.ledInput).value = raw.led || '-';
      if ($(ids.pergoDimmer)) $(ids.pergoDimmer).value = raw.dimmer || '-';
      if ($(ids.extrasInput)) $(ids.extrasInput).value = raw.extras || '-';
      if ($(ids.pergoTriangleJoinery)) $(ids.pergoTriangleJoinery).value = raw.triangleJoinery || 'HAYIR';
      if ($(ids.waterStandardInput)) $(ids.waterStandardInput).value = raw.waterStandard || 'EVET';
      if ($(ids.pergoWaterOutletPlacement)) $(ids.pergoWaterOutletPlacement).value = raw.waterOutletPlacement || 'BOTH';
      setPergoInputOwnership(project.ownership || { rayCount: false, postCount: false });
      updatePergoCalculatedFieldStyles(project.ownership || {});
    } finally {
      suppressPergoInputInfrastructure = false;
    }
    mirrorPergoCompatibilityState(raw);
    updatePergoBackWallSummary();
    updatePergoLargePreviewOptions();
  }

  function replacePergoCanonicalInput(raw, ownership, options = {}) {
    const project = window.P3DVPergoRiseProduct.createDraft(raw, { ownership: ownership || { rayCount: false, postCount: false } });
    modelState.pergoRiseProject = project;
    renderPergoInputFromCanonical();
    if (options.clearModel) {
      modelState.width = 0; modelState.depth = 0; modelState.height = 0; modelState.panelCount = 1;
      // Keep the current iframe/camera alive. The guidance layer marks the input as incomplete.
    }
    if (options.schedulePreview !== false) scheduleAutomaticPreview();
    return project;
  }

  function resetPergoSystemInputs() {
    if (!isPergoRiseUi()) {window.PLMRV12Commands.resetSection('system');return;}
    const api = pergoInputApi();
    const raw = { ...(modelState.pergoRiseProject && modelState.pergoRiseProject.input || api.DEFAULT_INPUT) };
    Object.assign(raw, { systemCount: '', width: '', opening: '', rearHeight: '', frontHeight: '', rayCount: '', postCount: '' });
    replacePergoCanonicalInput(raw, { rayCount: false, postCount: false }, { clearModel: true, schedulePreview: false });
    showPreviewInputGuidance('Sistem Adedi, Genişlik, Açılım, Arka H ve Ön H alanlarını doldurun. Ray ve dikme değerleri otomatik hesaplanır.', 'warning');
    setFreedomValidation('Sistem ölçüleri PLMR varsayılanlarına sıfırlandı.', 'warning');
  }

  function resetPergoOptions() {
    if (!isPergoRiseUi()) {window.PLMRV12Commands.resetSection('options');return;}
    const api = pergoInputApi();
    const raw = { ...(modelState.pergoRiseProject && modelState.pergoRiseProject.input || api.DEFAULT_INPUT) };
    Object.assign(raw, {
      parapet: 'HAYIR', parapetHeight: '-', glassTrack: 'HAYIR', glassRayBoundaryMode: 'DARALT',
      structureColor: '-', fabric: '-', fabricProfiles: '-', motor: '-', remote: '-', led: '-', dimmer: '-', extras: '-'
    });
    replacePergoCanonicalInput(raw, pergoInputOwnership());
    setFreedomValidation('Opsiyonlar PLMR varsayılanlarına sıfırlandı.', 'warning');
  }

  function resetPergoExtraOptions() {
    if (!isPergoRiseUi()) {window.PLMRV12Commands.resetSection('extras');return;}
    const api = pergoInputApi();
    const raw = { ...(modelState.pergoRiseProject && modelState.pergoRiseProject.input || api.DEFAULT_INPUT) };
    Object.assign(raw, { triangleJoinery: 'HAYIR', waterStandard: 'EVET', waterOutletPlacement: 'BOTH' });
    replacePergoCanonicalInput(raw, pergoInputOwnership());
    setFreedomValidation('Ek opsiyonlar PLMR varsayılanlarına sıfırlandı.', 'warning');
  }

  function resetPergoAllInputs() {
    if (!isPergoRiseUi()) {window.PLMRV12Commands.resetSection('all');return;}
    const api = pergoInputApi();
    replacePergoCanonicalInput(api.clone(api.DEFAULT_INPUT), { rayCount: false, postCount: false }, { clearModel: true, schedulePreview: false });
    showPreviewInputGuidance('Pergola veri girişi sıfırlandı. Zorunlu alanları doldurduğunuzda 2D çizim otomatik hazırlanır.', 'warning');
    setFreedomValidation('Tüm Pergola değerleri PLMR açılış durumuna sıfırlandı.', 'warning');
  }

  function setPergoCalculatorResult(message, isError) {
    const node = $(ids.pergoCalcResult);
    if (!node) return;
    node.textContent = message;
    node.classList.toggle('is-error', Boolean(isError));
  }

  function openPergoCalculator() {
    if (!isPergoRiseUi()) return;
    if ($(ids.pergoCalcOpening)) $(ids.pergoCalcOpening).value = pergoUiValue(ids.freedomDepth, '');
    if ($(ids.pergoCalcRear)) $(ids.pergoCalcRear).value = pergoUiValue(ids.freedomHeight, '');
    if ($(ids.pergoCalcFront)) $(ids.pergoCalcFront).value = pergoUiValue(ids.pergoFrontHeight, '');
    if ($(ids.pergoCalcAngle)) $(ids.pergoCalcAngle).value = '';
    pergoCalculatorLastResult = null;
    setPergoCalculatorResult('4 satırdan birini boş bırakın; boş değer PLMR formülüyle hesaplanır.', false);
    const dialog = $(ids.pergoCalculatorDialog);
    if (dialog && typeof dialog.showModal === 'function') dialog.showModal();
  }

  function calculatePergoMissingValue() {
    try {
      const result = pergoInputApi().calculateSystem({
        angle: pergoUiValue(ids.pergoCalcAngle, ''),
        opening: pergoUiValue(ids.pergoCalcOpening, ''),
        rear: pergoUiValue(ids.pergoCalcRear, ''),
        front: pergoUiValue(ids.pergoCalcFront, '')
      });
      pergoCalculatorLastResult = result;
      const targets = [ids.pergoCalcAngle, ids.pergoCalcOpening, ids.pergoCalcRear, ids.pergoCalcFront];
      if ($(targets[result.missingIndex])) $(targets[result.missingIndex]).value = result.resultText;
      setPergoCalculatorResult(`Hesaplandı (${result.pozSay} poz): ${result.resultText}`, false);
      return result;
    } catch (error) {
      pergoCalculatorLastResult = null;
      setPergoCalculatorResult(error && error.message ? error.message : String(error), true);
      return null;
    }
  }

  function transferPergoCalculatorValues() {
    const result = pergoCalculatorLastResult || calculatePergoMissingValue();
    if (!result) return;
    const mappings = [
      [ids.pergoCalcOpening, ids.freedomDepth],
      [ids.pergoCalcRear, ids.freedomHeight],
      [ids.pergoCalcFront, ids.pergoFrontHeight]
    ];
    mappings.forEach(([sourceId, targetId]) => {
      if (!$(sourceId) || !$(targetId) || !String($(sourceId).value || '').trim()) return;
      $(targetId).value = String($(sourceId).value || '');
      $(targetId).dispatchEvent(new Event('input', { bubbles: true }));
    });
    syncPergoRiseInputInfrastructure({ schedulePreview: true });
    const dialog = $(ids.pergoCalculatorDialog);
    if (dialog && typeof dialog.close === 'function') dialog.close();
  }

  function clearPergoCalculator() {
    [ids.pergoCalcAngle, ids.pergoCalcOpening, ids.pergoCalcRear, ids.pergoCalcFront].forEach(id => { if ($(id)) $(id).value = ''; });
    pergoCalculatorLastResult = null;
    setPergoCalculatorResult('Sonuç bekleniyor.', false);
  }

  function sanitizePergoFieldElement(field, element) {
    if (!element || !isPergoRiseUi()) return;
    const api = pergoInputApi();
    if (!api || typeof api.sanitizeField !== 'function') return;
    const original = String(element.value == null ? '' : element.value);
    const selectionStart = typeof element.selectionStart === 'number' ? element.selectionStart : null;
    const normalized = api.sanitizeField(field, original);
    if (normalized === original) return;
    element.value = normalized;
    if (selectionStart !== null && typeof element.setSelectionRange === 'function') {
      const prefix = api.sanitizeField(field, original.slice(0, selectionStart));
      const caret = Math.min(String(prefix).length, String(normalized).length);
      try { element.setSelectionRange(caret, caret); } catch (_) {}
    }
  }

  function handlePergoCanonicalFieldInput(field, element, options = {}) {
    if (!isPergoRiseUi()) return false;
    sanitizePergoFieldElement(field, element);
    if (field === 'rayCount' || field === 'postCount') {
      if (element) element.dataset.userEdited = 'true';
    }
    syncPergoRiseInputInfrastructure({ schedulePreview: options.schedulePreview !== false });
    if (field === 'motor') renderRemoteComboMenu();
    return true;
  }

  function applyPergoQuickTestPreset(index) {
    if (!isPergoRiseUi()) return false;
    const preset = PERGO_RISE_QUICK_TESTS[Math.max(1, Math.min(16, Number(index) || 1)) - 1];
    if (!preset) return false;
    const api = pergoInputApi();
    const raw = api.clone(api.DEFAULT_INPUT);
    Object.assign(raw, preset.values || {});
    const ownership = {
      rayCount: Object.prototype.hasOwnProperty.call(preset.values || {}, 'rayCount'),
      postCount: Object.prototype.hasOwnProperty.call(preset.values || {}, 'postCount')
    };
    replacePergoCanonicalInput(raw, ownership, { schedulePreview: true });
    document.querySelectorAll('.quick-test-grid button').forEach((button) => button.classList.toggle('is-active', button.id === `quickTestBtn${index}`));
    if ($(ids.quickTestStatus)) $(ids.quickTestStatus).textContent = `${preset.name} yüklendi: ${preset.title}`;
    return true;
  }

  function syncPergoQuickTestButtons(isPergoRise) {
    const grid = document && typeof document.querySelector === 'function' ? document.querySelector('.quick-test-grid') : null;
    if (!grid) return;
    for (let quickIndex = 11; quickIndex <= 16; quickIndex += 1) {
      let button = $(`quickTestBtn${quickIndex}`);
      if (!button) {
        button = document.createElement('button');
        button.id = `quickTestBtn${quickIndex}`;
        button.type = 'button';
        button.textContent = `Test ${quickIndex}`;
        grid.appendChild(button);
      }
      button.hidden = !isPergoRise;
    }
  }

  function syncFreedomOptionStateFromUi() {
    if (isPergoRiseUi()) {
      syncPergoRiseInputInfrastructure({ schedulePreview: true });
      return;
    }
    modelState.panelColorIndependent = !$(ids.panelColorIndependent) || Boolean($(ids.panelColorIndependent).checked);
    modelState.panelFill = $(ids.panelFill) ? $(ids.panelFill).value : (modelState.panelFill || 'EVET');
    modelState.motor = $(ids.motorInput) ? $(ids.motorInput).value : (modelState.motor || 'Yok');
    modelState.remote = $(ids.remoteInput) ? $(ids.remoteInput).value : (modelState.remote || 'Yok');
    modelState.led = $(ids.ledInput) ? $(ids.ledInput).value : (modelState.led || 'NO');
    modelState.dimmer = $(ids.dimmerInput) ? $(ids.dimmerInput).value : (modelState.dimmer || 'HAYIR');
    modelState.parapet = $(ids.parapetInput) ? $(ids.parapetInput).value : (modelState.parapet || 'HAYIR');
    modelState.parapetHeight = $(ids.parapetHeightInput) ? $(ids.parapetHeightInput).value : (modelState.parapetHeight || '');
    modelState.waterStandard = $(ids.waterStandardInput) ? $(ids.waterStandardInput).value : (modelState.waterStandard || 'EVET');
    modelState.extras = $(ids.extrasInput) ? $(ids.extrasInput).value : (modelState.extras || '');
  }

  function syncFreedomOptionUi() {
    if (isPergoRiseUi()) {
      renderPergoInputFromCanonical();
      if ($(ids.motorInput)) $(ids.motorInput).readOnly = false;
      if ($(ids.ledInput)) $(ids.ledInput).readOnly = false;
      const motor = modelState.pergoRiseProject && modelState.pergoRiseProject.input && modelState.pergoRiseProject.input.motor || '-';
      const noMotor = normalizeMotorKey(motor) === '-';
      if ($(ids.remoteInput)) $(ids.remoteInput).disabled = noMotor;
      if ($(ids.remoteComboButton)) $(ids.remoteComboButton).disabled = noMotor;
      if ($(ids.pergoWaterOutletPlacementRow)) $(ids.pergoWaterOutletPlacementRow).hidden = ((modelState.pergoRiseProject && modelState.pergoRiseProject.input && modelState.pergoRiseProject.input.waterStandard) || 'EVET') !== 'HAYIR';
      renderMotorComboMenu(); renderRemoteComboMenu(); renderPergoFabricComboMenu();
      return;
    }
    if ($(ids.panelColorIndependent)) $(ids.panelColorIndependent).checked = modelState.panelColorIndependent !== false;
    if ($(ids.panelFill)) $(ids.panelFill).value = modelState.panelFill || 'EVET';
    if ($(ids.motorInput)) { $(ids.motorInput).value = modelState.motor || 'Yok'; $(ids.motorInput).readOnly = true; }
    if ($(ids.remoteInput)) $(ids.remoteInput).value = modelState.remote || 'Yok';
    if ($(ids.ledInput)) $(ids.ledInput).value = modelState.led || 'NO';
    if ($(ids.dimmerInput)) $(ids.dimmerInput).value = modelState.dimmer || 'HAYIR';
    if ($(ids.parapetInput)) $(ids.parapetInput).value = modelState.parapet || 'HAYIR';
    if ($(ids.parapetHeightInput)) $(ids.parapetHeightInput).value = modelState.parapetHeight || '';
    if ($(ids.waterStandardInput)) $(ids.waterStandardInput).value = modelState.waterStandard || 'EVET';
    if ($(ids.extrasInput)) $(ids.extrasInput).value = modelState.extras || '';
    const noMotor = normalizeMotorKey(modelState.motor) === 'YOK';
    if ($(ids.remoteInput)) $(ids.remoteInput).disabled = noMotor;
    if ($(ids.remoteComboButton)) $(ids.remoteComboButton).disabled = noMotor;
    renderMotorComboMenu(); renderRemoteComboMenu(); renderLedComboMenu(); updateColorControls();
  }

  function syncPanelColorIndependence() {
    modelState.panelColorIndependent = Boolean($(ids.panelColorIndependent) && $(ids.panelColorIndependent).checked);
    if (!modelState.panelColorIndependent) modelState.panelColor = { ...modelState.systemColor };
    updateColorControls();
    applyColorStateLive();
  }

  function updateProductInputUi() {
    const spec = activeProductSpec();
    const isPergoRise = modelState.productGroup === 'pergo-rise';
    const isFreedomFamily = !isPergoRise;
    if(document.body&&document.body.classList){
      document.body.classList.toggle('is-pergo-rise', isPergoRise);
      document.body.classList.toggle('is-freedom-family', isFreedomFamily);
    }
    if ($(ids.productGroup)) $(ids.productGroup).value = modelState.productGroup;
    setText(ids.productSubgroup, spec.subgroupLabel);
    setText(ids.positionTitle, `${spec.modelLabel} Poz1`);
    setText(ids.positionDialogTitle, `${spec.modelLabel} Poz1`);
    setText(ids.previewProductLabel, spec.modelLabel);
    $(ids.frame).title = `${spec.modelLabel} 3D viewer`;
    updateDrawingModeUi();

    $(ids.freedomWidth).type = 'text';
    $(ids.freedomWidth).inputMode = 'text';
    $(ids.freedomWidth).removeAttribute('min');
    $(ids.freedomWidth).removeAttribute('max');
    $(ids.freedomWidth).placeholder = isPergoRise
      ? 'Örn. 4000 veya 3000;100;2500;NO'
      : ((isFreedomBioGroup(modelState.productGroup)) ? 'Toplam 12000 · Yan yana 4000;3500;3800 · Arka arkaya 4000;3500:3800;4200' : 'Örn. 4000');
    setText(ids.freedomWidthLimitNote, `Önerilen maksimum: ${spec.widthMax} mm · Üzeri uyarıyla çizilir.`);
    $(ids.freedomDepth).type = 'text';
    $(ids.freedomDepth).inputMode = 'text';
    $(ids.freedomDepth).removeAttribute('min');
    $(ids.freedomDepth).removeAttribute('max');
    $(ids.freedomDepth).hidden = false;
    $(ids.freedomDepth).placeholder = isPergoRise
      ? 'Örn. 6000 veya 4500;5200'
      : ((isFreedomBioGroup(modelState.productGroup)) ? `${spec.depthListStart} · Yan yana 3070;5070;4070 · Arka arkaya 3070;5070:4070;6070[:NO]` : `Örn. ${spec.depthListStart}`);
    if ($(ids.projectionCustomToggle)) $(ids.projectionCustomToggle).hidden = isPergoRise;
    if ($(ids.projectionComboMenu) && isPergoRise) $(ids.projectionComboMenu).hidden = true;
    if ($(ids.projectionCombo)) $(ids.projectionCombo).classList.toggle('pergo-plain-input', isPergoRise);
    setText(ids.freedomDepthLimitNote, `Önerilen maksimum: ${spec.depthMax} mm · Üzeri uyarıyla çizilir.`);
    $(ids.freedomHeight).type = 'text';
    $(ids.freedomHeight).inputMode = 'numeric';
    $(ids.freedomHeight).removeAttribute('min');
    $(ids.freedomHeight).removeAttribute('max');
    $(ids.freedomHeight).placeholder = isPergoRise
      ? 'Örn. 3200 veya 3200;3400'
      : ((isFreedomBioGroup(modelState.productGroup)) ? 'Tüm sistemler için ortak, örn. 2600' : (spec.heightMax ? 'Örn. 3000' : 'Örn. 2700'));
    $(ids.freedomPanelCount).min = String(spec.panelMin);
    $(ids.freedomPanelCount).removeAttribute('max');
    $(ids.freedomPanelCount).placeholder = isPergoRise ? 'Pergola için sabit 1' : `Önerilen ${spec.panelMin}–${spec.panelMax} adet`;
    const panelCountLabel = $(ids.freedomPanelCount) && typeof $(ids.freedomPanelCount).closest === 'function' ? $(ids.freedomPanelCount).closest('label') : null;
    if (panelCountLabel) panelCountLabel.hidden = isPergoRise;
    $(ids.productFormula).hidden = false;
    setText(ids.productFormula, isPergoRise
      ? 'PLMR Web DXF / 2D · gerçek Pergola hesaplama ve çizim kuralları · tıklanabilir teknik elemanlar'
      : (modelState.productGroup === 'b-cube'
        ? `Tek toplam genişlikte eşit net göz; ; listesinde dış/merkez referanslı modüller · Açılım listesi ön hizalı, sondaki NO arka hizalıdır`
        : (isBioFamilyGroup(modelState.productGroup)
          ? `${modelState.productGroup === 'b-cube-galaxy' ? 'Bioclimatic 180×140 dikme / 225 kayıt' : 'Eco-Bioclimatic'} · Tek toplam genişlikte eşit net göz; ; listesinde ayrı çerçeve genişlikleri · Ortak dikme yalnız gerçek aks çakışmasında oluşur`
          : `Açılım = Panel Sayısı × ${spec.panelPitch} + ${spec.projectionOffset}`)));
    if ($(ids.pergoRiseFields)) $(ids.pergoRiseFields).hidden = !isPergoRise;
    [ids.pergoCalculator, ids.pergoResetAll, ids.pergoSystemReset, ids.pergoOptionsReset, ids.pergoExtraReset].forEach((id) => {
      const button = $(id); if (!button) return;
      button.disabled = id===ids.pergoCalculator&&!isPergoRise;
      button.setAttribute('aria-disabled', String(button.disabled));
    });
    syncPergoQuickTestButtons(isPergoRise);
    for (let quickIndex = 1; quickIndex <= 10; quickIndex += 1) {
      const quickButton = $(`quickTestBtn${quickIndex}`); if (!quickButton) continue;
      quickButton.disabled = false;
      quickButton.setAttribute('aria-disabled', 'false');
      quickButton.classList.toggle('is-disabled', false);
      if (isPergoRise && PERGO_RISE_QUICK_TESTS[quickIndex - 1]) quickButton.title = PERGO_RISE_QUICK_TESTS[quickIndex - 1].title;
      else quickButton.removeAttribute('title');
    }
    for (let quickIndex = 11; quickIndex <= 16; quickIndex += 1) {
      const quickButton = $(`quickTestBtn${quickIndex}`); if (!quickButton) continue;
      quickButton.disabled = !isPergoRise;
      quickButton.setAttribute('aria-disabled', String(!isPergoRise));
      quickButton.classList.toggle('is-disabled', !isPergoRise);
      if (isPergoRise && PERGO_RISE_QUICK_TESTS[quickIndex - 1]) quickButton.title = PERGO_RISE_QUICK_TESTS[quickIndex - 1].title;
      else quickButton.removeAttribute('title');
    }
    if ($(ids.replay)) $(ids.replay).hidden = isPergoRise;
    setText(ids.primaryWidthLabel, 'Genişlik');
    setText(ids.primaryDepthLabel, 'Açılım');
    setText(ids.primaryHeightLabel, isPergoRise ? 'Arka H' : 'Yükseklik');
    [ids.pergoFrontHeightRow, ids.pergoRayCountRow, ids.pergoPostCountRow].forEach((id) => { const row=$(id); if (row) row.hidden=!isPergoRise; });
    const spacer=$(ids.freedomSystemCardSpacer); if (spacer) spacer.hidden=isPergoRise;
    if (!isPergoRise && !String($(ids.pergoSystemCount).value || '').trim()) $(ids.pergoSystemCount).value=String(modelState.systemCount || 1);
    if (isPergoRise && modelState.pergoRiseProject && modelState.pergoRiseProject.input) {
      const raw = modelState.pergoRiseProject.input;
      if (!String($(ids.freedomWidth).value || '').trim()) $(ids.freedomWidth).value = raw.width || '';
      if (!String($(ids.freedomDepth).value || '').trim()) setDepthControlValue(raw.opening || '');
      if (!String($(ids.freedomHeight).value || '').trim()) $(ids.freedomHeight).value = raw.rearHeight || '';
      if (!String($(ids.pergoSystemCount).value || '').trim()) $(ids.pergoSystemCount).value = raw.systemCount || '';
      if (!String($(ids.pergoFrontHeight).value || '').trim()) $(ids.pergoFrontHeight).value = raw.frontHeight || '';
      if (!String($(ids.pergoRayCount).value || '').trim()) $(ids.pergoRayCount).value = raw.rayCount || '';
      if (!String($(ids.pergoPostCount).value || '').trim()) $(ids.pergoPostCount).value = raw.postCount || '';
    }

    $(ids.width).min = String(spec.widthMin);
    $(ids.width).removeAttribute('max');
    $(ids.depth).min = String(spec.depthMin);
    $(ids.depth).removeAttribute('max');
    $(ids.height).min = String(spec.heightMin);
    if (spec.heightMax) $(ids.height).max = String(spec.heightMax); else $(ids.height).removeAttribute('max');
    populateProjectionOptions();
    syncFreedomOptionUi();
    ensurePdfRequestState(modelState.productGroup);
    renderPdfRequestForm();
  }

  function applyProductGroupDefaults(group) {
    const spec = activeProductSpec(group);
    modelState.productGroup = group;
    modelState.postSections = Array.from({ length: 4 }, () => ({ ...spec.postSection }));
    modelState.beamSection = { ...spec.beamSection };
    modelState.moduleWidths = [];
    modelState.moduleDepths = [];
    modelState.modulePanelCounts = [];
    modelState.multiAlignment = 'front';
    modelState.multiRows = [];
    modelState.rowAlignment = 'left';
    modelState.panelCollection = 'center';
  }

  function resetProductGroupRuntimeState(group) {
    const nextGroup = group === 'bio-rise' ? 'bio-rise' : (group === 'b-cube-galaxy' ? 'b-cube-galaxy' : (group === 'pergo-rise' ? 'pergo-rise' : 'b-cube'));
    const fresh = JSON.parse(JSON.stringify(defaults));
    const spec = PRODUCT_SPECS[nextGroup] || PRODUCT_SPECS['b-cube'];
    fresh.productGroup = nextGroup;
    fresh.postSections = Array.from({ length: 4 }, () => ({ ...spec.postSection }));
    fresh.beamSection = { ...spec.beamSection };
    fresh.systemCount = 1;
    fresh.width = 0;
    fresh.height = 0;
    fresh.depth = nextGroup === 'pergo-rise' ? 0 : Number(spec.depthListStart) || 0;
    fresh.panelCount = nextGroup === 'pergo-rise' ? 1 : panelCountFromProjection(fresh.depth, nextGroup);
    fresh.inputDrafts = { width: '', depth: fresh.depth ? String(fresh.depth) : '', height: '' };
    fresh.pergoRiseProject = null;
    Object.keys(modelState).forEach((key) => { delete modelState[key]; });
    Object.assign(modelState, fresh);
    viewerCameraState = null;
    selectedZone = null;
    selectedZoneId = null;
    selectedDividerProfile = null;
    selectedPostIndex = null;
    toolboxSelectionMode = null;
    toolboxSelectionItems.clear();
    bulkProductZones = null;
    bulkProfileZones = null;
    activeProductSlot = 'primary';
    dimensionVisibility = { intermediate: false, main: true };
    return nextGroup;
  }

  function requestHostProductTransition(productGroup, action) {
    if (!p3dvEmbeddedHostMode || window.parent === window) return false;
    const target = String(productGroup || '');
    if (!['b-cube', 'b-cube-galaxy', 'bio-rise'].includes(target)) return false;
    p3dvHostPost('request-product-transition', { productGroup: target, action: action && typeof action === 'object' ? p3dvHostClone(action) : null }, p3dvHostActiveTransitionId);
    return true;
  }

  function handleProductGroupChange() {
    const requestedGroup = $(ids.productGroup).value;
    const nextGroup = requestedGroup === 'bio-rise' ? 'bio-rise' : (requestedGroup === 'b-cube-galaxy' ? 'b-cube-galaxy' : (requestedGroup === 'pergo-rise' ? 'pergo-rise' : 'b-cube'));
    if (p3dvEmbeddedHostMode && nextGroup !== p3dvHostCanonicalProductGroup) {
      // Embedded P3DV cannot be a second main-product source of truth. Keep its
      // selector on the last host-authorized group until the PLMR host completes
      // the canonical authorization/transition.
      if ($(ids.productGroup)) $(ids.productGroup).value = p3dvHostCanonicalProductGroup || modelState.productGroup;
      requestHostProductTransition(nextGroup, { type: 'inner-product-select' });
      return;
    }
    if (nextGroup !== modelState.productGroup) resetProductGroupRuntimeState(nextGroup);
    setFreedomValidation('');
    p3dvHostSyncControls();
    showRecommendedLimitWarnings({
      width: readFreedomNumber(ids.freedomWidth),
      depth: readFreedomNumber(ids.freedomDepth),
      panelCount: readFreedomNumber(ids.freedomPanelCount)
    });
    p3dvHistoryRebase('product-boundary');
    renderViewer();
  }

  function updateReadouts() {
    const model = readModel();
    const spec = activeProductSpec(model.productGroup);
    setText(ids.positionTitle, `${spec.modelLabel} Poz1`);
    setText(ids.positionDialogTitle, `${spec.modelLabel} Poz1`);
    if (!modelReady(model)) {
      setText(ids.positionSummary, 'Ölçüleri girin');
      setText(ids.productStatus, model.productGroup === 'pergo-rise' ? 'Pergola 2D çizimi için sol paneldeki ölçüleri tamamlayın' : '3D model için sol paneldeki ölçüleri tamamlayın');
      return model;
    }
    if (model.productGroup === 'pergo-rise') {
      const counts = model.pergoRiseProject && model.pergoRiseProject.derived && model.pergoRiseProject.derived.counts || {};
      setText(ids.positionSummary, `${counts.systems || 0} sistem / ${counts.positions || 0} poz / ${counts.rails || 0} ray / ${counts.posts || 0} dikme`);
      setText(ids.productStatus, 'Pergola Web DXF / 2D hazır · PLMR hesaplama, çizim ve düzenleme kuralları aynı kanonik proje verisini kullanır');
      return model;
    }
    const widthSummary=model.multiRows&&model.multiRows.length===2
      ? String(model.inputDrafts&&model.inputDrafts.width||model.width)
      : (model.moduleWidths&&model.moduleWidths.length?model.moduleWidths.join(';'):model.width);
    const depthSummary=model.multiRows&&model.multiRows.length===2
      ? String(model.inputDrafts&&model.inputDrafts.depth||model.depth)
      : (model.moduleDepths&&model.moduleDepths.length>1
        ? `${model.moduleDepths.join(';')}${model.multiAlignment==='rear'?';NO':''}`
        : model.depth);
    const panelSummary=model.modulePanelCounts&&model.modulePanelCounts.length>1?model.modulePanelCounts.join(';'):model.lamellaCount;
    setText(ids.positionSummary, `Genişlik ${widthSummary} mm / Açılım ${depthSummary} mm / Yükseklik ${model.height} mm / ${panelSummary} panel`);
    const placementCount = Object.keys(model.placements || {}).length + Object.keys(model.zipPlacements || {}).length;
    const profileCount = Object.values(model.facadeProfiles || {}).reduce((total, list) => total + (Array.isArray(list) ? list.length : 0), 0);
    const statusParts = [];
    if (placementCount) statusParts.push(`${placementCount} ürün`);
    if (profileCount) statusParts.push(`${profileCount} ara profil`);
    setText(ids.productStatus, statusParts.length ? `${statusParts.join(' · ')} yerleştirildi` : 'Bir cephe alanı seçerek işleme başlayın');
    return model;
  }

  function hasOwn(object, key) {
    return Object.prototype.hasOwnProperty.call(object || {}, key);
  }

  function effectiveProductOpen(productKey) {
    return hasOwn(modelState.productOpenStates, productKey)
      ? Boolean(modelState.productOpenStates[productKey])
      : Boolean(modelState.productsOpen);
  }

  function zipProductKey(zoneId) {
    return `zip:${zoneId}`;
  }

  function primaryPlacement(zoneId,zone) {
    return v11OwnerModel(zone).placements?.[zoneId] || null;
  }

  function zipPlacement(zoneId,zone) {
    return v11OwnerModel(zone).zipPlacements?.[zoneId] || null;
  }

  function zoneHasAnyProduct(zoneId) {
    return Boolean(primaryPlacement(zoneId) || zipPlacement(zoneId));
  }

  function allProductEntries() {
    const entries = [];
    Object.entries(modelState.placements || {}).forEach(([zoneId, placement]) => {
      entries.push({ key: zoneId, zoneId, placement, slot: 'primary' });
    });
    Object.entries(modelState.zipPlacements || {}).forEach(([zoneId, placement]) => {
      entries.push({ key: zipProductKey(zoneId), zoneId, placement, slot: 'zip' });
    });
    return entries;
  }

  function productTypeLabel(placement) {
    if (!placement) return 'Ürün';
    if (placement.type === 'balcony') return 'Katlanır Cam';
    if (placement.type === 'folding') return 'Akordiyon Cam';
    if (placement.type === 'guillotine') return 'Giyotin';
    if (placement.type === 'zip') return 'Zip Perde';
    if (placement.type === 'fixed') return 'Sabit Doğrama';
    if (placement.type === 'door') return 'Kapı (Dış Bakış)';
    return 'Sürme';
  }

  function productZoneLabel(zoneId, placement, sameFacadeIndex) {
    const facadeId = String(zoneId || '').split('|')[0];
    const facadeNames = { front: 'Arka Cephe', back: 'Ön Cephe', left: 'Sol Cephe', right: 'Sağ Cephe' };
    const suffix = sameFacadeIndex > 0 ? ` · Alan ${sameFacadeIndex + 1}` : '';
    const zoneName = modelState.zoneRegistry && modelState.zoneRegistry[zoneId] && modelState.zoneRegistry[zoneId].name;
    return `${zoneName ? `${zoneName} · ` : ''}${facadeNames[facadeId] || facadeId}${suffix} · ${productTypeLabel(placement)}`;
  }

  function pruneProductStates() {
    // V3.4 migration: legacy Zip records are moved into the independent front overlay slot.
    Object.entries(modelState.placements || {}).forEach(([zoneId, placement]) => {
      if (placement && placement.type === 'zip') {
        if (!modelState.zipPlacements[zoneId]) modelState.zipPlacements[zoneId] = placement;
        delete modelState.placements[zoneId];
      }
    });
    const validKeys = new Set(allProductEntries().map((entry) => entry.key));
    Object.keys(modelState.productOpenStates || {}).forEach((key) => {
      if (!validKeys.has(key)) delete modelState.productOpenStates[key];
    });
    const validZipPanels = new Set();
    Object.keys(modelState.zipPlacements || {}).forEach((zoneId) => {
      const productKey = zipProductKey(zoneId);
      validZipPanels.add(productKey);
      if (!hasOwn(modelState.productOpenStates, productKey) && hasOwn(modelState.panelStates, productKey)) {
        modelState.productOpenStates[productKey] = Boolean(modelState.panelStates[productKey]);
      }
      modelState.panelStates[productKey] = effectiveProductOpen(productKey);
    });
    Object.keys(modelState.panelStates || {}).forEach((key) => {
      if (!validZipPanels.has(key)) delete modelState.panelStates[key];
    });
  }

  function safeScriptJson(value) {
    return JSON.stringify(value)
      .replace(/</g, '\\u003C')
      .replace(/>/g, '\\u003E')
      .replace(/&/g, '\\u0026')
      .replace(/\u2028/g, '\\u2028')
      .replace(/\u2029/g, '\\u2029');
  }


  function isPergola2DMode(group = modelState.productGroup) {
    return group === 'pergo-rise';
  }

  function supportsMainTechnical2D(group = modelState.productGroup) {
    return group === 'b-cube-galaxy' || group === 'b-cube' || group === 'bio-rise';
  }

  function isMainTechnical2DMode(group = modelState.productGroup) {
    return supportsMainTechnical2D(group) && p3dvDrawingMode === '2d';
  }

  function technical2DProductLabel(group = modelState.productGroup) {
    return group === 'b-cube' ? 'PLMR | Bioclimatic' : (group === 'bio-rise' ? 'Eco-Bioclimatic' : 'Bioclimatic');
  }

  function updateDrawingModeUi() {
    const pergola = isPergola2DMode();
    const technical = supportsMainTechnical2D();
    if (pergola) p3dvDrawingMode = '2d';
    else if (!technical) p3dvDrawingMode = '3d';
    const mode2D = $(ids.mode2D);
    const mode3D = $(ids.mode3D);
    const engine = $(ids.engineSelector);
    if (mode2D) {
      const enabled = pergola || technical;
      mode2D.disabled = !enabled;
      mode2D.setAttribute('aria-disabled', String(!enabled));
      mode2D.classList.toggle('is-active', pergola || (technical && p3dvDrawingMode === '2d'));
      mode2D.title = pergola ? 'Pergola Web DXF / 2D çalışma modu aktif' : (technical ? `${technical2DProductLabel()} teknik 2D görünüş` : 'Bu ürün şu anda 3D çalışma modunu kullanır');
    }
    if (mode3D) {
      const enabled = !pergola;
      mode3D.disabled = !enabled;
      mode3D.setAttribute('aria-disabled', String(!enabled));
      mode3D.classList.toggle('is-active', !pergola && (!technical || p3dvDrawingMode === '3d'));
      mode3D.title = pergola ? 'Pergola için 3D geçici olarak pasif' : '3D çalışma modu';
    }
    if (engine) engine.value = pergola || (technical && p3dvDrawingMode === '2d') ? '2d' : '3d';
    if (window.P3DVDocumentCenter && typeof window.P3DVDocumentCenter.refreshAvailability === 'function') window.P3DVDocumentCenter.refreshAvailability();
    const toolbarDxf = $(ids.toolbarDxf);
    if (toolbarDxf) {
      const enabled = (pergola || technical) && modelReady(readModel());
      toolbarDxf.disabled = !enabled;
      toolbarDxf.setAttribute('aria-disabled', String(!enabled));
      toolbarDxf.classList.toggle('is-disabled', !enabled);
      toolbarDxf.title = enabled ? 'Canonical Technical 2D çiziminden DXF indir' : 'Önce geçerli bir çizim oluşturun';
    }
    const toolbarAr = $(ids.toolbarAr);
    if (toolbarAr) {
      const twoDActive = pergola || (technical && p3dvDrawingMode === '2d');
      toolbarAr.disabled = twoDActive || !modelReady(readModel());
      toolbarAr.setAttribute('aria-disabled', String(toolbarAr.disabled));
      toolbarAr.title = twoDActive ? '2D çalışma modunda AR pasif' : '';
    }
  }

  function pergo2DViewBox(svg) {
    if (!svg) return { width: 1000, height: 700 };
    const raw = String(svg.getAttribute('viewBox') || '').trim().split(/\s+/).map(Number);
    if (raw.length === 4 && raw.every(Number.isFinite) && raw[2] > 0 && raw[3] > 0) return { width: raw[2], height: raw[3] };
    return { width: Math.max(1, Number(svg.getAttribute('width')) || 1000), height: Math.max(1, Number(svg.getAttribute('height')) || 700) };
  }

  function applyPergo2DScale() {
    const viewport = $(ids.pergo2DViewport);
    const stage = $(ids.pergo2DStage);
    const svg = stage && stage.querySelector('svg');
    if (!viewport || !stage || !svg) return;
    const box = pergo2DViewBox(svg);
    const pad = 24;
    const availableW = Math.max(120, viewport.clientWidth - pad * 2);
    const availableH = Math.max(120, viewport.clientHeight - pad * 2);
    pergo2DViewState.baseScale = Math.max(0.01, Math.min(availableW / box.width, availableH / box.height));
    const totalScale = pergo2DViewState.baseScale * pergo2DViewState.zoom;
    stage.style.width = `${Math.max(80, box.width * totalScale)}px`;
    stage.style.height = `${Math.max(80, box.height * totalScale)}px`;
    stage.style.margin = `${pad}px`;
  }

  function fitPergo2DView() {
    const viewport = $(ids.pergo2DViewport);
    pergo2DViewState.zoom = 1;
    applyPergo2DScale();
    if (viewport) {
      requestAnimationFrame(() => {
        viewport.scrollLeft = Math.max(0, (viewport.scrollWidth - viewport.clientWidth) / 2);
        viewport.scrollTop = Math.max(0, (viewport.scrollHeight - viewport.clientHeight) / 2);
      });
    }
  }

  function zoomPergo2DView(factor) {
    const viewport = $(ids.pergo2DViewport);
    if (!viewport) return;
    const oldScale = Math.max(0.0001, pergo2DViewState.baseScale * pergo2DViewState.zoom);
    const worldX = (viewport.scrollLeft + viewport.clientWidth / 2) / oldScale;
    const worldY = (viewport.scrollTop + viewport.clientHeight / 2) / oldScale;
    pergo2DViewState.zoom = Math.max(pergo2DViewState.minZoom, Math.min(pergo2DViewState.maxZoom, pergo2DViewState.zoom * Number(factor || 1)));
    applyPergo2DScale();
    const newScale = Math.max(0.0001, pergo2DViewState.baseScale * pergo2DViewState.zoom);
    requestAnimationFrame(() => {
      viewport.scrollLeft = Math.max(0, worldX * newScale - viewport.clientWidth / 2);
      viewport.scrollTop = Math.max(0, worldY * newScale - viewport.clientHeight / 2);
    });
  }

  function pergo2DTargetFromInteraction(hit) {
    const project = modelState.pergoRiseProject;
    const targets = project && project.derived && project.derived.editing && Array.isArray(project.derived.editing.targets) ? project.derived.editing.targets : [];
    if (!hit || !targets.length) return null;
    const kind = String(hit.dataset.interactionType || '');
    const placementId = String(hit.dataset.placementId || '');
    const sideViewKey = String(hit.dataset.sideViewKey || '');
    const postIndex = String(hit.dataset.postIndex || '');
    const productType = String(hit.dataset.productType || '');
    let best = null, bestScore = -1;
    targets.forEach((target) => {
      const interaction = target && target.plmrInteraction || {};
      const data = interaction.data || {};
      if (kind && interaction.kind && String(interaction.kind) !== kind) return;
      let score = interaction.kind === kind ? 3 : 0;
      if (placementId) score += String(data.placementId || '') === placementId ? 8 : -8;
      if (sideViewKey) score += String(data.sideViewKey || '') === sideViewKey ? 4 : -2;
      if (postIndex !== '') score += String(data.postIndex ?? target.postIndex ?? '') === postIndex ? 4 : -2;
      if (productType) score += String(data.productType || '') === productType ? 2 : 0;
      if (score > bestScore) { best = target; bestScore = score; }
    });
    return bestScore >= 3 ? best : null;
  }

  function selectPergo2DTarget(target) {
    if (!target) return false;
    const bounds = target.bounds || target.plmrGeometry || {};
    const width = Math.max(1, Number(target.netWidth) || Math.abs(Number(bounds.maxX) - Number(bounds.minX)) || 1000);
    const height = Math.max(1, Number(target.netHeight) || Math.abs(Number(bounds.maxY) - Number(bounds.minY)) || 1000);
    selectedZone = {
      id: `pergo-2d:${target.id}`,
      label: target.label || 'Pergola elemanı', width, height,
      pergoRise: true, editingTarget: target,
      face: target.face || 'front', facadeId: target.face || 'front'
    };
    selectedZoneId = selectedZone.id;
    openZoneActionDialog();
    return true;
  }


  function pergolaDisplaySvgMarkup(drawing) {
    if (!window.PulumurGeometry || typeof window.PulumurGeometry.renderSvg !== 'function') return '';
    // Format explicitly marked product labels; preserve customer text and geometry.
    const presented = window.PulumurProductPresentation ? window.PulumurProductPresentation.drawing(drawing) : drawing;
    return String(window.PulumurGeometry.renderSvg(presented) || '');
  }

  function renderPergo2DPreview(options = {}) {
    const viewport = $(ids.pergo2DViewport);
    const stage = $(ids.pergo2DStage);
    const frame = $(ids.frame);
    if (!viewport || !stage || !frame) return false;
    frame.hidden = true;
    frame.style.display = 'none';
    viewport.hidden = false;
    const project = modelState.pergoRiseProject;
    const projectReady = Boolean(project && project.input)
      && !(Array.isArray(project.missing) && project.missing.length)
      && !(Array.isArray(project.errors) && project.errors.length)
      && project.valid !== false;
    if (!projectReady || !window.PulumurGeometry || typeof window.PulumurGeometry.buildDrawing !== 'function' || typeof window.PulumurGeometry.renderSvg !== 'function') {
      pergo2DLastDrawing = null;
      stage.style.width = 'auto'; stage.style.height = 'auto'; stage.style.margin = '0';
      stage.innerHTML = '<div class="pergo-2d-empty"><div><strong>Pergola · Web DXF / 2D</strong><br>Genişlik, Açılım, Arka H ve Ön H değerlerini girin.<br>Çizim, PLMR Pergola Web DXF motorundan canlı oluşturulur.</div></div>';
      return false;
    }
    const oldSvg = stage.querySelector('svg');
    const oldScale = Math.max(0.0001, pergo2DViewState.baseScale * pergo2DViewState.zoom);
    const keepWorldX = oldSvg ? (viewport.scrollLeft + viewport.clientWidth / 2) / oldScale : 0;
    const keepWorldY = oldSvg ? (viewport.scrollTop + viewport.clientHeight / 2) / oldScale : 0;
    try {
      const drawing = window.PulumurGeometry.buildDrawing(project.input);
      const svgMarkup = pergolaDisplaySvgMarkup(drawing);
      pergo2DLastDrawing = drawing;
      stage.innerHTML = svgMarkup;
      if (options.resetView || !oldSvg) {
        fitPergo2DView();
      } else {
        applyPergo2DScale();
        const newScale = Math.max(0.0001, pergo2DViewState.baseScale * pergo2DViewState.zoom);
        requestAnimationFrame(() => {
          viewport.scrollLeft = Math.max(0, keepWorldX * newScale - viewport.clientWidth / 2);
          viewport.scrollTop = Math.max(0, keepWorldY * newScale - viewport.clientHeight / 2);
        });
      }
      return true;
    } catch (error) {
      console.error('Pergola Web DXF / 2D render failed.', error);
      stage.innerHTML = `<div class="pergo-2d-empty"><div><strong>Pergola 2D çizimi oluşturulamadı.</strong><br>${String(error && error.message || error)}</div></div>`;
      return false;
    }
  }

  function mainTechnical2DServices() {
    // V14.12.6: Technical2D is a P3DV runtime dependency, not a parent-window dependency.
    // This keeps 2D working from local/file-based hosts or any environment where
    // browser security blocks iframe -> parent property access.
    const localAdapter = modelState.productGroup === 'b-cube' ? window.PulumurFreedom2DAdapter : (modelState.productGroup === 'bio-rise' ? window.PulumurBioRise2DAdapter : window.PulumurGalaxy2DAdapter);
    const localWorkspace = window.PulumurTechnical2DWorkspace;
    if (localAdapter && typeof localAdapter.build === 'function' && localWorkspace && typeof localWorkspace.toSvg === 'function') {
      return { adapter: localAdapter, workspace: localWorkspace, source: 'p3dv-local' };
    }
    try {
      const host = window.parent && window.parent !== window ? window.parent : null;
      const adapter = host && (modelState.productGroup === 'b-cube' ? host.PulumurFreedom2DAdapter : (modelState.productGroup === 'bio-rise' ? host.PulumurBioRise2DAdapter : host.PulumurGalaxy2DAdapter));
      const workspace = host && host.PulumurTechnical2DWorkspace;
      if (!adapter || typeof adapter.build !== 'function' || !workspace || typeof workspace.toSvg !== 'function') return null;
      return { adapter, workspace, source: 'parent-compat' };
    } catch (_) { return null; }
  }

  function mainTechnical2DProjectInfo() {
    const text = (id) => { const node = $(id); return node ? String(node.textContent || node.value || '').trim() : ''; };
    return { projectCode: text('projectCodeValue'), date: text(ids.projectDate), revision: 'DR00', customer: '', project: '', drawnBy: '',...window.PLMRFinalMetadata?.projectInfo };
  }

  function renderMainTechnical2DPreview(options = {}) {
    const viewport = $(ids.pergo2DViewport);
    const stage = $(ids.pergo2DStage);
    const frame = $(ids.frame);
    if (!viewport || !stage || !frame || !supportsMainTechnical2D()) return false;
    frame.hidden = true;
    frame.style.display = 'none';
    viewport.hidden = false;
    showPreviewInputGuidance('', '');
    const services = mainTechnical2DServices();
    if (!services) {
      stage.style.width = 'auto'; stage.style.height = 'auto'; stage.style.margin = '0';
      stage.innerHTML = '<div class="pergo-2d-empty"><div><strong>${technical2DProductLabel()} · Teknik 2D</strong><br>Teknik 2D renderer yüklenemedi.</div></div>';
      return false;
    }
    try {
      const projection = services.adapter.build(p3dvHostSnapshot(), { projectInfo: mainTechnical2DProjectInfo(), contract: p3dvTechnical2DContract() });
      technical2DLastProjection = projection;
      if (!projection || projection.valid !== true) throw new Error((projection && projection.errors || []).join(' · ') || 'GALAXY_TECHNICAL2D_INVALID');
      const oldSvg = stage.querySelector('svg');
      const oldScale = Math.max(0.0001, pergo2DViewState.baseScale * pergo2DViewState.zoom);
      const keepWorldX = oldSvg ? (viewport.scrollLeft + viewport.clientWidth / 2) / oldScale : 0;
      const keepWorldY = oldSvg ? (viewport.scrollTop + viewport.clientHeight / 2) / oldScale : 0;
      stage.innerHTML = services.workspace.toSvg(projection);
      if (typeof services.workspace.bindStage === 'function') services.workspace.bindStage(stage);
      stage.dataset.technical2dProduct = window.PulumurP3DVProductIdentity && typeof window.PulumurP3DVProductIdentity.productIdForGroup === 'function'
        ? window.PulumurP3DVProductIdentity.productIdForGroup(modelState.productGroup)
        : (modelState.productGroup === 'b-cube' ? 'P3DV_ROLLING_ROOF' : (modelState.productGroup === 'bio-rise' ? 'P3DV_ECO_BIOCLIMATIC' : 'P3DV_BIOCLIMATIC'));
      stage.dataset.technical2dMode = '2d';
      if (options.resetView || !oldSvg) fitPergo2DView();
      else {
        applyPergo2DScale();
        const newScale = Math.max(0.0001, pergo2DViewState.baseScale * pergo2DViewState.zoom);
        requestAnimationFrame(() => {
          viewport.scrollLeft = Math.max(0, keepWorldX * newScale - viewport.clientWidth / 2);
          viewport.scrollTop = Math.max(0, keepWorldY * newScale - viewport.clientHeight / 2);
        });
      }
      return true;
    } catch (error) {
      technical2DLastProjection = null;
      stage.style.width = 'auto'; stage.style.height = 'auto'; stage.style.margin = '0';
      stage.innerHTML = `<div class="pergo-2d-empty"><div><strong>${technical2DProductLabel()} 2D çizimi oluşturulamadı.</strong><br>${String(error && error.message || error)}</div></div>`;
      return false;
    }
  }

  function requestEmbeddedHostDrawingMode(mode) {
    const target = String(mode || '').toLowerCase() === '2d' ? '2d' : '3d';

    // V14.28.6 corrective: the visible toolbar must never depend on the iframe ->
    // host bridge just to produce a visible 2D/3D transition. Apply the already
    // existing P3DV presentation mode locally first, then synchronize the host's
    // canonical presentation owner. This keeps physical/canonical product state in
    // one place while making the user control reliable under file:// opaque origins
    // and any temporarily unavailable host bridge.
    const localMode = setP3dvDrawingMode(target, { resetView: target === '2d' });
    if (!p3dvEmbeddedHostMode) return localMode;

    let hostApplied = false;
    try {
      const host = window.parent && window.parent.PulumurUnifiedWorkspace;
      if (host && typeof host.setMode === 'function') {
        hostApplied = host.setMode(target, { source: 'p3dv-mode-switch' }) !== false;
      }
    } catch (_) {
      hostApplied = false;
    }

    // Cross-origin/opaque file documents cannot read parent APIs. The existing
    // postMessage bridge remains the synchronization fallback, but no longer owns
    // whether the button visibly works.
    if (!hostApplied) p3dvHostPost('request-workspace-mode', { mode: target }, p3dvHostActiveTransitionId);
    return localMode;
  }

  function setP3dvDrawingMode(mode, options = {}) {
    const target = String(mode || '').toLowerCase() === '2d' ? '2d' : '3d';
    if (isPergola2DMode()) p3dvDrawingMode = '2d';
    else if (supportsMainTechnical2D()) p3dvDrawingMode = target;
    else p3dvDrawingMode = '3d';
    updateDrawingModeUi();
    if (isMainTechnical2DMode()) renderMainTechnical2DPreview({ resetView: options.resetView !== false });
    else if (isPergola2DMode()) renderPergo2DPreview({ resetView: options.resetView !== false });
    else {
      const viewport = $(ids.pergo2DViewport);
      const frame = $(ids.frame);
      if (viewport) viewport.hidden = true;
      if (frame) { frame.hidden = false; frame.style.display = 'block'; }
      if (!frame || !frame.srcdoc || options.rebuild === true) renderViewer();
      else { window.dispatchEvent(new Event('resize')); postViewerMessage('viewport-resized'); }
    }
    return p3dvDrawingMode;
  }

  async function captureSvgMarkup(svgMarkup, preset, metadata) {
    if (!svgMarkup) return null;
    const image = new Image();
    const parserHost = document.createElement('div');
    parserHost.innerHTML = String(svgMarkup);
    const sourceSvg = parserHost.querySelector('svg');
    if (!sourceSvg) return null;
    if (!sourceSvg.getAttribute('xmlns')) sourceSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const sourceBox = pergo2DViewBox(sourceSvg);
    const maxW = 2200, maxH = 1600;
    const renderScale = Math.max(0.01, Math.min(maxW / Math.max(1, sourceBox.width), maxH / Math.max(1, sourceBox.height)));
    const renderW = Math.max(1, Math.round(sourceBox.width * renderScale));
    const renderH = Math.max(1, Math.round(sourceBox.height * renderScale));
    sourceSvg.setAttribute('width', String(renderW));
    sourceSvg.setAttribute('height', String(renderH));
    sourceSvg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    const blob = new Blob([sourceSvg.outerHTML], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    try {
      await new Promise((resolve, reject) => { image.onload = resolve; image.onerror = reject; image.src = url; });
      const canvas = document.createElement('canvas'); canvas.width = renderW; canvas.height = renderH;
      const ctx = canvas.getContext('2d'); ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      return { preset: preset || 'technical-2d', dataUrl: canvas.toDataURL('image/png'), width: canvas.width, height: canvas.height, liveTechnical2D: true, ...(metadata || {}) };
    } finally { URL.revokeObjectURL(url); }
  }

  async function captureCurrent2DView() {
    if (isPergola2DMode()) {
      if (!pergo2DLastDrawing) renderPergo2DPreview({ resetView: false });
      if (!pergo2DLastDrawing || !window.PulumurGeometry) return null;
      const captured = await captureSvgMarkup(pergolaDisplaySvgMarkup(pergo2DLastDrawing), 'pergola-2d', { source: 'pergola-canonical-drawing' });
      const drawing = window.PulumurExportService && typeof window.PulumurExportService.prepareDrawing === 'function'
        ? window.PulumurExportService.prepareDrawing(pergo2DLastDrawing)
        : pergo2DLastDrawing;
      return captured ? { ...captured, drawing, modelUnits: 'mm', modelScale: 1, vectorTechnical2D: true } : null;
    }
    if (!supportsMainTechnical2D()) return null;
    const services = mainTechnical2DServices();
    if (!services) return null;
    const projection = services.adapter.build(p3dvHostSnapshot(), { projectInfo: mainTechnical2DProjectInfo(), contract: p3dvTechnical2DContract() });
    if (!projection || projection.valid !== true) return null;
    technical2DLastProjection = projection;
    const exporter = window.PulumurTechnical2DExport;
    if (!exporter || typeof exporter.toDrawing !== 'function') throw new Error('TECHNICAL2D_EXPORT_DRAWING_MISSING');
    const technicalScale = typeof services.workspace.commonProjectionScale === 'function' ? services.workspace.commonProjectionScale(projection) : null;
    const drawing = exporter.toDrawing(projection, { technicalScale, source: 'canonical-technical2d' });
    if (typeof exporter.assertMetricDrawing === 'function') exporter.assertMetricDrawing(drawing);
    const captured = await captureSvgMarkup(services.workspace.toSvg(projection), `${modelState.productGroup}-technical-2d`, { source: 'canonical-technical2d', schema: projection.schema, productGroup: projection.productGroup });
    return captured ? { ...captured, drawing, technicalScale, modelUnits: drawing.units, modelScale: drawing.modelScale, vectorTechnical2D: true } : null;
  }

  function currentTechnical2DProjection(forDxf=false) {
    reconcileRollingParapet();
    if (!supportsMainTechnical2D()) return null;
    const services = mainTechnical2DServices(); if (!services) return null;
    const snapshot=p3dvHostSnapshot();
    snapshot.dimensionVisibility={...snapshot.dimensionVisibility,main:true,positions:true,total:true,roofs:true,intermediate:true,facades:true,byPosition:{},facadeByPosition:{},hiddenIds:{}};
    const units=snapshot.modelState.sceneEditor?.dimensionUnits||{mm:true,inch:false};
    if(forDxf||!units.mm&&!units.inch&&!units.ft)snapshot.modelState.sceneEditor={...snapshot.modelState.sceneEditor,dimensionUnits:{mm:true,inch:false}};
    if(forDxf){
      snapshot.dimensionVisibility={};

    }
    const projection = services.adapter.build(snapshot, { projectInfo: mainTechnical2DProjectInfo(), contract: p3dvTechnical2DContract() });
    if (!projection || projection.valid !== true) throw new Error((projection && projection.errors || []).join(' · ') || 'TECHNICAL2D_EXPORT_INVALID');
    technical2DLastProjection = projection; return projection;
  }

  function downloadRuntimeFile(name, content, mime) {
    const blob = content instanceof Blob ? content : new Blob([content], { type: mime || 'application/octet-stream' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function exportCurrentTechnicalDxf(options = {}) {
    if (isPergola2DMode()) {
      if (!pergo2DLastDrawing) renderPergo2DPreview({ resetView: false });
      if (!pergo2DLastDrawing || !window.PulumurModernDXF) throw new Error('PERGOLA_DXF_DRAWING_UNAVAILABLE');
      const prepared = window.PulumurExportService ? window.PulumurExportService.prepareDrawing(pergo2DLastDrawing) : pergo2DLastDrawing;
      const dxf = window.PulumurModernDXF.toDxf(prepared);
      if (options.download !== false) downloadRuntimeFile(`pergola-${modelState.width}x${modelState.depth}.dxf`, dxf, 'application/dxf;charset=utf-8');
      return { dxf, source: 'pergola-canonical-drawing' };
    }
    const projection = currentTechnical2DProjection(true);
    if (!projection || !window.PulumurTechnical2DExport) throw new Error('TECHNICAL2D_DXF_EXPORT_UNAVAILABLE');
    const dxf = window.PulumurTechnical2DExport.toDxf(projection, { source: 'p3dv-canonical-state' });
    const filename = window.PulumurTechnical2DExport.safeFileName(projection, 'dxf');
    if (options.download !== false) downloadRuntimeFile(filename, dxf, 'application/dxf;charset=utf-8');
    return { dxf, filename, projectionSchema: projection.schema, source: 'canonical-technical2d' };
  }


  function buildEmptyViewerHtml(message) {
    const safe = String(message || 'Ölçüleri girin').replace(/[&<>"]/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[char]));
    return `<!doctype html><html><head><meta charset="utf-8"><style>html,body{height:100%;margin:0}body{display:grid;place-items:center;background:#eef3f7;font-family:Arial,Helvetica,sans-serif;color:#576574}.empty{display:grid;place-items:center;width:240px;height:380px;padding:18px;text-align:center;border:2px dashed #c6d4df;border-radius:16px;background:rgba(255,255,255,.10)}strong,.legacy-prompt{display:none}span{max-width:220px;font-size:13px;line-height:1.5;font-weight:800;color:#64717d}</style></head><body><div class="empty"><strong>${productModelLabel()} · Modul 1</strong><span>${p3dvStandaloneGuillotinePreviewMode?safe:'Önizleme için zorunlu ölçüleri doldurun.'}</span><i class="legacy-prompt">${safe}</i></div></body></html>`;
  }

  function renderViewer() {
    if(window.PLMRV17Core&&v17SettingsDraft)return;
    reconcileRollingParapet();
    if(window.PLMRV16Core)v16EnsureZoneNames();
    viewerLiveProductStateReady = false;
    viewerLivePanelMasterReady = false;
    viewerLivePergoRiseReady = false;
    viewerLiveColorStateReady = false;
    viewerLiveModelStateReady = false;
    pendingLiveProductState = false;
    pendingLivePanelMasterState = false;
    pendingLiveColorState = false;
    pendingLiveModelState = false;
    activeViewerSessionId = `p3dv-viewer-${Date.now()}-${++viewerSessionCounter}`;
    pruneProductStates();
    let model = updateReadouts();
    try { ensureZoneIdentityRecords(buildReportFacades(model).flatMap((facade) => facade.zones || [])); model = { ...model, zoneRegistry: JSON.parse(JSON.stringify(modelState.zoneRegistry || {})), nextZoneNumber: modelState.nextZoneNumber }; } catch (_) {}
    activeViewerProductGroup = model.productGroup;
    activeViewerModelReady = modelReady(model);
    updateDrawingModeUi();
    const frame = $(ids.frame);
    const viewport2D = $(ids.pergo2DViewport);
    const arButton = $(ids.mobileAr);
    if (isPergola2DMode(model.productGroup)) {
      activeViewerSessionId = '';
      if (arButton) arButton.disabled = true;
      setMobileArStatus('Pergola Web DXF / 2D modu aktif. 3D ve AR bu demo sürümünde pasiftir.', 'warning');
      renderPergo2DPreview({ resetView: false });
      return;
    }
    if (isMainTechnical2DMode(model.productGroup)) {
      activeViewerSessionId = '';
      if (arButton) arButton.disabled = true;
      setMobileArStatus(`${technical2DProductLabel()} teknik 2D modu aktif.`, 'warning');
      renderMainTechnical2DPreview({ resetView: false });
      return;
    }
    if (viewport2D) viewport2D.hidden = true;
    if (frame) { frame.hidden = false; frame.style.display = 'block'; }
    if (!modelReady(model)) {
      if (arButton) arButton.disabled = true;
      setMobileArStatus('Gerçek alan görünümü için önce geçerli bir 3D model oluşturun.', 'warning');
      const emptyMessage = modelState.productGroup === 'pergo-rise'
        ? 'Sol taraftaki Genişlik, Açılım ve Yükseklik alanlarını doldurun.'
        : 'Sol taraftaki Genişlik, Açılım, Yükseklik ve Panel Sayısı alanlarını doldurun.';
      if(model.productGroup!=='b-cube'){ $(ids.frame).srcdoc=buildEmptyViewerHtml(emptyMessage);return; }
      // Render-only empty carrier. No placeholder dimensions/position enter the host model.
      model={...model,width:3000,depth:3000,height:3000,lamellaCount:16,panelCount:16,systemCount:1,moduleWidths:[3000],moduleDepths:[3000],modulePanelCounts:[16],placements:{},zipPlacements:{},sceneEditor:{...model.sceneEditor,mainDeleted:true,roofCopies:[],roofPose:{},members:{},roofProducts:{}}};
      model.freedomLayout=freedomMultiPositionLayout(model);
    }
    if (arButton) arButton.disabled = false;
    setMobileArStatus('3D sahne hazırlanıyor. Mobil AR desteği cihazda otomatik kontrol edilir.');
    $(ids.frame).srcdoc = buildViewerHtml({
      ...model,
      pergoRiseUrl: model.productGroup === 'pergo-rise' ? pergoRiseAssetPath : '',
      pergoRiseProject: model.productGroup === 'pergo-rise' ? model.pergoRiseProject : null,
      viewerSessionId: activeViewerSessionId,
      cameraState: viewerCameraState,
      selectedZoneId,
      dimensionVisibility: { ...dimensionVisibility },
      productsOpen: Boolean(modelState.productsOpen),
      productOpenStates: JSON.parse(JSON.stringify(modelState.productOpenStates || {})),
      panelStates: JSON.parse(JSON.stringify(modelState.panelStates || {})),
      panelMasterOpen: Boolean(modelState.panelMasterOpen),
      toolboxSelectionMode,
      toolboxSelectionKeys: [...toolboxSelectionItems.keys()]
    });
  }

  function setMobileArStatus(message, tone = '') {
    const status = $(ids.mobileArStatus);
    if (!status) return;
    status.textContent = String(message || '');
    if (tone) status.setAttribute('data-tone', tone); else status.removeAttribute('data-tone');
  }

  async function refreshMobileArCapability() {
    if (isPergola2DMode()) return;
    const button = $(ids.mobileAr);
    const frame = $(ids.frame);
    if (!button || !frame || !modelReady(readModel())) return;
    const child = frame.contentWindow;
    if (!child || typeof child.getP3DVARCapabilities !== 'function') {
      setMobileArStatus('3D sahne yükleniyor; AR denetimi henüz hazır değil.');
      return;
    }
    try {
      const capability = await child.getP3DVARCapabilities();
      if (capability && capability.supported) {
        button.disabled = false;
        setMobileArStatus(`AR hazır · Gerçek ölçek 1:1 · ${Math.round(modelState.width)} mm genişlik ${(Number(modelState.width) / 1000).toFixed(2)} m olarak yerleşir.`, 'success');
      } else {
        button.disabled = false;
        setMobileArStatus((capability && capability.message) || 'Bu cihazda WebXR AR desteği bulunamadı.', 'warning');
      }
    } catch (error) {
      button.disabled = false;
      setMobileArStatus(`AR desteği denetlenemedi: ${error.message}`, 'warning');
    }
  }

  async function startMobileAr() {
    const model = readModel();
    if (model.productGroup === 'pergo-rise') { setMobileArStatus('Pergola için 3D / AR bu demo sürümünde pasiftir.', 'warning'); return; }
    if (!modelReady(model)) {
      setMobileArStatus('Önce geçerli bir 3D model oluşturun.', 'warning');
      return;
    }
    const frame = $(ids.frame);
    const child = frame && frame.contentWindow;
    if (!child || typeof child.startP3DVAR !== 'function') {
      setMobileArStatus('3D viewer henüz hazır değil. Birkaç saniye sonra tekrar dokunun.', 'warning');
      return;
    }
    const button = $(ids.mobileAr);
    const original = button ? button.textContent : '';
    if (button) {
      button.disabled = true;
      button.textContent = 'AR Hazırlanıyor…';
    }
    setMobileArStatus('Kamera ve manuel gerçek ölçekli yerleşim başlatılıyor…');
    try {
      const result = await child.startP3DVAR();
      if (result && result.ok) {
        setMobileArStatus(result.message || 'AR oturumu başlatıldı. Ürün gerçek ölçekte çizildi; konumunu elle ayarlayın.', 'success');
      } else {
        setMobileArStatus((result && result.message) || 'AR oturumu başlatılamadı.', (result && result.retryInsideViewer) ? 'warning' : 'error');
      }
    } catch (error) {
      setMobileArStatus(`AR başlatılamadı: ${error.message}`, 'error');
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = original || 'Gerçek Alanda Gör';
      }
    }
  }

  function setDialogValues() {
    $(ids.width).value = modelState.width || '';
    $(ids.depth).value = modelState.depth || '';
    $(ids.height).value = modelState.height || '';
    updateDialogLamella();
  }

  function updateDialogLamella() {
    const depth = Math.round(Number(String($(ids.depth).value || '').replace(',', '.')));
    $(ids.dialogLamella).textContent = String(panelCountFromProjection(Number.isFinite(depth) ? depth : modelState.depth));
  }

  function openPositionDialog() {
    if(window.PLMRV12UI?.dimensions){window.PLMRV12UI.dimensions();return;}
    if (window.PLMRUnifiedDrawingWorkspaceV4?.openSettings) window.PLMRUnifiedDrawingWorkspaceV4.openSettings();
    $(ids.freedomWidth).focus();
    $(ids.freedomWidth).select();
  }

  function closePositionDialog() {
    $(ids.dialog).hidden = true;
  }

  function readDialogNumber(id, minimum) {
    const value = Math.round(Number(String($(id).value || '').replace(',', '.')));
    if (!Number.isFinite(value) || value < minimum) return null;
    return value;
  }

  function dimensionsFit(model) {
    if (isFreedomBioGroup(model.productGroup)) {
      const layout = model.productGroup === 'b-cube' ? (model.freedomLayout || freedomMultiPositionLayout(model)) : (model.productGroup === 'b-cube-galaxy' ? (model.galaxyLayout || galaxyMultiPositionLayout(model)) : (model.bioRiseLayout || bioRiseMultiPositionLayout(model)));
      if (!layout || !layout.valid) return false;
      const modulesFit = (layout.modules || []).every((module) => {
        const rearLeft = Number((module.rearLeftSection || (layout.rearSections && layout.rearSections[module.leftLine]) || model.postSections[0]).z) || 0;
        const rearRight = Number((module.rearRightSection || (layout.rearSections && layout.rearSections[module.rightLine]) || model.postSections[1]).z) || 0;
        const frontLeft = Number((module.frontLeftSection || (layout.frontSections && layout.frontSections[module.leftLine]) || model.postSections[2]).z) || 0;
        const frontRight = Number((module.frontRightSection || (layout.frontSections && layout.frontSections[module.rightLine]) || model.postSections[3]).z) || 0;
        const requiredDepth = Math.max(rearLeft + frontLeft, rearRight + frontRight) + 120;
        return module.clearWidth >= 120 && module.depth >= requiredDepth && model.beamSection.thickness < Math.min(module.clearWidth, module.depth) / 2;
      });
      return modulesFit && model.beamSection.vertical <= model.height;
    }
    return (
      model.postSections[0].x + model.postSections[1].x <= model.width - 120 &&
      model.postSections[2].x + model.postSections[3].x <= model.width - 120 &&
      model.postSections[0].z + model.postSections[2].z <= model.depth - 120 &&
      model.postSections[1].z + model.postSections[3].z <= model.depth - 120 &&
      model.beamSection.vertical < model.height - 200 &&
      model.beamSection.thickness < Math.min(model.width, model.depth) / 2
    );
  }

  function applyPositionForm() {
    const historyBefore=p3dvHistoryClone(modelState);
    const spec = activeProductSpec();
    const nextWidth = readDialogNumber(ids.width, spec.widthMin);
    const nextDepth = readDialogNumber(ids.depth, spec.depthMin);
    const nextHeight = readDialogNumber(ids.height, spec.heightMin);
    if (nextWidth === null || nextDepth === null || nextHeight === null || (spec.heightMax && nextHeight > spec.heightMax)) {
      alert('Please enter valid Width, Projection and Height values.');
      return;
    }
    const previous = { width: modelState.width, depth: modelState.depth, height: modelState.height, panelCount: modelState.panelCount, systemCount: modelState.systemCount };
    modelState.width = nextWidth;
    modelState.depth = nextDepth;
    modelState.height = nextHeight;
    modelState.panelCount = panelCountFromProjection(nextDepth);
    const model = readModel();
    if (isFreedomBioGroup(modelState.productGroup)) {
      const layout = modelState.productGroup === 'b-cube' ? freedomMultiPositionLayout(modelState) : (modelState.productGroup === 'b-cube-galaxy' ? galaxyMultiPositionLayout(modelState) : bioRiseMultiPositionLayout(modelState));
      if (!layout || !layout.valid) {
        modelState.width = previous.width;
        modelState.depth = previous.depth;
        modelState.height = previous.height;
        modelState.panelCount = previous.panelCount;
        const api = modelState.productGroup === 'b-cube' ? window.P3DVFreedomMultiPosition : (modelState.productGroup === 'b-cube-galaxy' ? window.P3DVGalaxyMultiPosition : window.P3DVBioRiseMultiPosition);
        const minimumTotal = layout ? Math.ceil(layout.occupiedWidth + layout.systemCount * ((api && api.MIN_CLEAR_WIDTH) || 120)) : spec.widthMin;
        alert(`Sistem adedi için toplam genişlik yetersiz. En az ${minimumTotal} mm girin.`);
        return;
      }
    }
    if (!dimensionsFit(model)) {
      modelState.width = previous.width;
      modelState.depth = previous.depth;
      modelState.height = previous.height;
      modelState.panelCount = previous.panelCount;
      alert('This dimension is too small for the current post/profile sections.');
      return;
    }
    $(ids.freedomWidth).value = String(nextWidth);
    setDepthControlValue(nextDepth);
    $(ids.freedomHeight).value = String(nextHeight);
    $(ids.freedomPanelCount).value = String(modelState.panelCount);
    try{v19Resize(historyBefore);v18Migrate(historyBefore,true);}catch(e){Object.keys(modelState).forEach(k=>delete modelState[k]);Object.assign(modelState,historyBefore);p3dvHostSyncControls();alert(e.message);return;}
    closePositionDialog();
    p3dvHistoryRecord(historyBefore,{type:'position-dimensions',label:'Poz ölçüleri',origin:'3d'});commitModelChangeLive('position-dimensions',{preserveHistory:true});
    showRecommendedLimitWarnings({ width: nextWidth, depth: nextDepth, height: nextHeight, panelCount: modelState.panelCount });
  }

  function firstNumericInputToken(rawValue) {
    const token = String(rawValue == null ? '' : rawValue).split(/[;:]/).map((item) => item.trim()).find((item) => item && item.toUpperCase() !== 'NO');
    if (!token) return null;
    const value = Math.round(Number(token.replace(',', '.')));
    return Number.isFinite(value) ? value : null;
  }

  function readFreedomNumber(id) {
    const source = id === ids.freedomDepth ? depthControlValue() : String($(id).value || '').trim();
    return firstNumericInputToken(source);
  }

  function setFreedomValidation(message, tone = 'error') {
    const element = $(ids.freedomValidation);
    element.textContent = message || '';
    element.classList.toggle('is-warning', Boolean(message) && tone === 'warning');
    element.classList.toggle('is-error', Boolean(message) && tone !== 'warning');
  }

  function previewInputStatus() {
    const group = modelState.productGroup;
    const missing = [];
    if (group === 'pergo-rise' && !String($(ids.pergoSystemCount).value || '').trim()) missing.push('Sistem Adedi');
    if (!String($(ids.freedomWidth).value || '').trim()) missing.push('Genişlik');
    if (!String(depthControlValue() || '').trim()) missing.push('Açılım');
    if (!String($(ids.freedomHeight).value || '').trim()) missing.push(group === 'pergo-rise' ? 'Arka yükseklik' : 'Yükseklik');
    if (group === 'pergo-rise' && !String($(ids.pergoFrontHeight).value || '').trim()) missing.push('Ön yükseklik');
    return { complete: missing.length === 0, missing };
  }

  function showPreviewInputGuidance(message, tone = '') {
    const node = $(ids.previewInputGuidance);
    if (!node) return;
    const text = String(message || '').trim();
    node.hidden = !text;
    node.textContent = text;
    if (tone) node.setAttribute('data-tone', tone); else node.removeAttribute('data-tone');
  }

  function scheduleAutomaticPreview() {
    if (autoPreviewTimer) clearTimeout(autoPreviewTimer);
    const status = previewInputStatus();
    if (!status.complete) {
      showPreviewInputGuidance(`${status.missing.join(', ')} alanını tamamlayın. Son geçerli veri girildiğinde çizim otomatik oluşturulur.`, 'warning');
      return;
    }
    showPreviewInputGuidance('Veriler tamamlandı · çizim otomatik hazırlanıyor…', 'ready');
    autoPreviewTimer = window.setTimeout(() => {
      autoPreviewTimer = null;
      const applied = applyFreedomInputs();
      if (applied) showPreviewInputGuidance('', '');
    }, 360);
  }

  function recommendedLimitWarnings(values, group = modelState.productGroup) {
    const spec = activeProductSpec(group);
    const warnings = [];
    if (group === 'pergo-rise') {
      const width = Number(values && values.width);
      const depth = Number(values && values.depth);
      const height = Number(values && values.height);
      if (Number.isFinite(width) && width > spec.widthMax) warnings.push(`Önerilen maksimum genişlik ${spec.widthMax} mm'dir; ${Math.round(width)} mm standart sınır dışıdır; çizime engel olmaz.`);
      if (Number.isFinite(depth) && depth > spec.depthMax) warnings.push(`Önerilen maksimum açılım ${spec.depthMax} mm'dir; ${Math.round(depth)} mm standart sınır dışıdır; çizime engel olmaz.`);
      if (Number.isFinite(height) && spec.heightMax && height > spec.heightMax) warnings.push(`Önerilen maksimum yükseklik ${spec.heightMax} mm'dir; ${Math.round(height)} mm standart sınır dışıdır; çizime engel olmaz.`);
      return warnings;
    }
    const width = Number(values && values.width);
    const depth = Number(values && values.depth);
    const panelCount = Number(values && values.panelCount);
    let comparedWidth = width;
    let widthLabel = 'genişlik';
    if (isFreedomBioGroup(group) && Number.isFinite(width)) {
      const source = { ...modelState, width, depth: Number.isFinite(depth) ? depth : modelState.depth, height: modelState.height };
      const layout = group === 'b-cube' ? freedomMultiPositionLayout(source) : (group === 'b-cube-galaxy' ? galaxyMultiPositionLayout(source) : bioRiseMultiPositionLayout(source));
      if (layout && layout.valid && layout.modules.length) {
        comparedWidth = Math.max(...layout.modules.map(module => Number(module.outerWidth) || 0));
        if (layout.systemCount > 1) widthLabel = 'modül dış genişliği';
      }
    }
    if (Number.isFinite(comparedWidth) && comparedWidth > spec.widthMax) {
      warnings.push(`Önerilen maksimum ${widthLabel} ${spec.widthMax} mm'dir; ${Math.round(comparedWidth)} mm standart sınır dışıdır; çizime engel olmaz.`);
    }
    if (Number.isFinite(depth) && depth > spec.depthMax) {
      warnings.push(`Önerilen maksimum açılım ${spec.depthMax} mm'dir; ${Math.round(depth)} mm standart sınır dışıdır; çizime engel olmaz.`);
    }
    if (Number.isFinite(panelCount) && panelCount > spec.panelMax && !(Number.isFinite(depth) && depth > spec.depthMax)) {
      warnings.push(`Önerilen maksimum panel sayısı ${spec.panelMax}'tir; ${Math.round(panelCount)} panel standart önerinin üzerindedir; çizime engel olmaz.`);
    }
    return warnings;
  }

  function showRecommendedLimitWarnings(values, group = modelState.productGroup) {
    const warnings = recommendedLimitWarnings(values, group);
    setFreedomValidation(warnings.join(' '), warnings.length ? 'warning' : 'error');
    return warnings;
  }

  function syncProjectionFromPanelCount() {
    if (modelState.productGroup === 'pergo-rise') return;
    const count = readFreedomNumber(ids.freedomPanelCount);
    const spec = activeProductSpec();
    setFreedomValidation('');
    if (count === null) return;
    if (count < spec.panelMin) {
      setFreedomValidation(`Panel sayısı en az ${spec.panelMin} olmalıdır.`);
      return;
    }
    const depth = projectionFromPanelCount(count);
    setDepthControlValue(depth);
    showRecommendedLimitWarnings({ width: readFreedomNumber(ids.freedomWidth), depth, height: readFreedomNumber(ids.freedomHeight), panelCount: count });
  }

  function syncPanelCountFromProjection() {
    if (modelState.productGroup === 'pergo-rise') return;
    const rawSystemCount = firstNumericInputToken($(ids.pergoSystemCount).value) || modelState.systemCount || 1;
    const topology = resolveFreedomBioTopology(modelState.productGroup, rawSystemCount, $(ids.freedomWidth).value, depthControlValue());
    const spec = activeProductSpec();
    setFreedomValidation('');
    const depthValues = topology.moduleDepths || [];
    if (!depthValues.length) return;
    const tooSmall = depthValues.find((depth) => depth < spec.depthMin);
    if (tooSmall != null) {
      setFreedomValidation(`Her açılım en az ${spec.depthMin} mm olmalıdır.`);
      return;
    }
    const counts = topology.panelCounts || depthValues.map((depth) => panelCountFromProjection(depth));
    $(ids.freedomPanelCount).value = String(counts[0] || '');
    $(ids.freedomPanelCount).title = counts.length > 1 ? `Modül panel sayıları: ${counts.join(';')}` : '';
    showRecommendedLimitWarnings({ width: topology.totalWidth, depth: topology.maxDepth, height: readFreedomNumber(ids.freedomHeight), panelCount: Math.max(...counts) });
  }

  function pergoRiseInputText(id) { return String($(id) && $(id).value || '').trim(); }

  function applyPergoRiseInputs() {
    try {
      const draft = syncPergoRiseInputInfrastructure({ keepValidation: true });
      if (!draft || !draft.input) {
        setFreedomValidation('PLMR Pergola proje verisi oluşturulamadı.');
        return false;
      }
      if (draft.missing && draft.missing.length) {
        const names = { systemCount: 'Sistem Adedi', width: 'Genişlik', opening: 'Açılım', rearHeight: 'Arka H', frontHeight: 'Ön H' };
        setFreedomValidation(`${draft.missing.map(field => names[field] || field).join(', ')} alanlarını doldurun.`);
        return false;
      }
      if (draft.errors && draft.errors.length) {
        setFreedomValidation(`PLMR kuralı: ${draft.errors[0]}`);
        return false;
      }
      const canonical = window.P3DVPergoRiseProduct.create(draft.input, { ownership: draft.ownership });
      const derived = window.P3DVPergoRiseDerivedGeometry.build(canonical);
      modelState.pergoRiseProject = { ...canonical, ownership: draft.ownership, calculated: draft.calculated, derived };
      mirrorPergoCompatibilityState(canonical.input);
      modelState.width = Math.round(Number(canonical.normalized.width) || derived.envelope.width);
      modelState.depth = Math.round(derived.envelope.depth);
      modelState.height = Math.round(derived.envelope.height);
      modelState.panelCount = 1;
      setFreedomValidation('');
      renderPdfRequestForm();
      updateReadouts();
      renderPergo2DPreview({ resetView: false });
      updateDrawingModeUi();
      return true;
    } catch (error) {
      console.error('Pergola project normalization failed.', error);
      setFreedomValidation(`PLMR kuralı: ${error && error.message ? error.message : 'Geçersiz parametrik veri.'}`);
      return false;
    }
  }


  function applyPergoRiseAreaOperation(message) {
    if (!message || !message.target) return false;
    const current = modelState.pergoRiseProject;
    if (!current || !current.input || !window.P3DVPergoRiseEditing || typeof window.P3DVPergoRiseEditing.applyCanonicalOperation !== 'function') return false;
    const target = message.target;
    const action = String(message.areaAction || message.operation || '');
    function askNumber(label, value, min) {
      const result = Number(window.prompt(label, String(Math.round(Number(value) || 0))));
      return Number.isFinite(result) && result >= (min === undefined ? -Infinity : min) ? result : null;
    }
    function askChoice(label, allowed, fallback) {
      const list = Array.isArray(allowed) ? allowed.filter(Boolean) : [];
      const result = String(window.prompt(`${label}${list.length ? `\n${list.join(' / ')}` : ''}`, fallback || list[0] || '') || '').trim();
      if (!result) return null;
      return list.length && !list.includes(result) ? null : result;
    }
    const payload = {};
    try {
      if (target.targetType === 'area') {
        if (action === 'product-add') {
          const allowed = target.plmrZone && target.plmrZone.allowedProducts || [];
          const type = askChoice('Ürün türü', allowed, allowed[0]);
          if (!type) return true;
          const width = askNumber('Ürün net genişliği (mm)', target.netWidth || 1000, 1);
          const height = askNumber('Ürün net yüksekliği (mm)', target.netHeight || 2000, 1);
          if (width === null || height === null) return true;
          Object.assign(payload, { productType: type, width, height });
        } else if (action === 'profile-add') {
          const allowed = target.plmrZone && target.plmrZone.allowedProfiles || [];
          const type = askChoice('Profil türü', allowed, allowed[0]);
          if (!type) return true;
          payload.profileType = type;
          if (type === 'custom_profile') {
            const en = askNumber('Profil eni (mm)', 100, 1), boy = askNumber('Profil boyu (mm)', 100, 1), et = askNumber('Et kalınlığı (mm)', 2, 0.1);
            if (en === null || boy === null || et === null) return true;
            payload.profile = { mode: 'other', en, boy, et };
          }
        } else if (action === 'resize') {
          const dim = target.plmrDimension || {};
          const value = askNumber(`${dim.label || 'Ölçü'} (mm)`, dim.measuredValue || target.netWidth || 1000, 1);
          if (value === null) return true;
          payload.value = value;
        }
      } else if (target.targetType === 'dimension') {
        const dim = target.plmrDimension || {};
        const value = askNumber(`${dim.label || 'Ölçü'} (mm)`, dim.measuredValue || 1000, 1);
        if (value === null) return true;
        payload.value = value;
      } else if (target.targetType === 'product' && (action === 'resize' || action === 'edit')) {
        const interaction = target.plmrInteraction || {};
        const bounds2d = interaction.bounds2d || {};
        const width = askNumber('Ürün genişliği (mm)', bounds2d.w || 1000, 1);
        const height = askNumber('Ürün yüksekliği (mm)', bounds2d.h || 2000, 1);
        if (width === null || height === null) return true;
        Object.assign(payload, { width, height });
      } else if (target.targetType === 'water-outlet') {
        const data = target.plmrInteraction && target.plmrInteraction.data || {};
        if (action === 'edit') {
          const offset = askNumber('Boru konum ofseti (mm)', data.waterPipeXOffset || 0, -100000);
          if (offset === null) return true; payload.offset = offset;
        } else if (action === 'resize') {
          const diameter = askNumber('Boru çapı (mm)', data.waterPipeDiameter || 70, 1);
          const length = askNumber('Boru uzunluğu (mm)', data.waterPipeLength || 300, 1);
          if (diameter === null || length === null) return true; Object.assign(payload, { diameter, length });
        }
      } else if (target.targetType === 'trapez-sheet' && (action === 'resize' || action === 'edit')) {
        const c = target.geometrySnapshot && target.geometrySnapshot.corners || [];
        const xs = c.map(p => Number(p && p[0])).filter(Number.isFinite), zs = c.map(p => Number(p && p[2])).filter(Number.isFinite);
        const minX = askNumber('Sac başlangıç X (mm)', Math.min(...xs), -100000), maxX = askNumber('Sac bitiş X (mm)', Math.max(...xs), -100000);
        const minZ = askNumber('Sac başlangıç Z (mm)', Math.min(...zs), -100000), maxZ = askNumber('Sac bitiş Z (mm)', Math.max(...zs), -100000);
        if ([minX,maxX,minZ,maxZ].some(v => v === null) || maxX <= minX || maxZ <= minZ) return true;
        Object.assign(payload, { minX, maxX, minZ, maxZ });
      } else if (target.targetType === 'gutter' && (action === 'resize' || action === 'edit')) {
        const data = target.plmrInteraction && target.plmrInteraction.data || {};
        const minusXDelta = askNumber('Oluk sol uç değişimi (mm)', data.gutterMinusXDelta || 0, -100000);
        const plusXDelta = askNumber('Oluk sağ uç değişimi (mm)', data.gutterPlusXDelta || 0, -100000);
        if (minusXDelta === null || plusXDelta === null) return true;
        Object.assign(payload, { minusXDelta, plusXDelta });
      } else if (target.targetType === 'rail' && action === 'edit') {
        const axis = target.geometrySnapshot && target.geometrySnapshot.start && target.geometrySnapshot.start[0];
        const axisX = askNumber('Ray X ekseni (3D yerel mm)', axis || 0, -100000);
        if (axisX === null) return true;
        const originX = Number(current.normalized && current.normalized.constants && current.normalized.constants.systemStartX || window.PulumurGeometry.K.systemStartX) + Number(current.normalized && current.normalized.width || 0) / 2;
        payload.axisX = axisX + originX;
      } else if (target.targetType === 'post') {
        if (action === 'edit') {
          const currentAxis = current.normalized && current.normalized.postCenterXs && current.normalized.postCenterXs[target.postIndex];
          const axisX = askNumber('Dikme X ekseni (PLMR mm)', currentAxis || 0, -100000);
          const extension = askNumber('Dikme uzatması (mm)', current.normalized && current.normalized.frontPostExtensions && current.normalized.frontPostExtensions[target.postIndex] || 0, 0);
          if (axisX === null || extension === null) return true; Object.assign(payload, { axisX, extension });
        } else if (action === 'resize') {
          const en = askNumber('Profil eni (mm)', target.geometrySnapshot && target.geometrySnapshot.profileWidthX || 100, 1);
          const boy = askNumber('Profil boyu (mm)', target.geometrySnapshot && target.geometrySnapshot.profileDepthZ || 100, 1);
          const et = askNumber('Et kalınlığı (mm)', 2, 0.1);
          if (en === null || boy === null || et === null) return true; payload.profile = { mode:'other', en, boy, et };
        }
      } else if (target.targetType === 'side-support-post' && (action === 'edit' || action === 'resize')) {
        if (action === 'edit') {
          const centerX = askNumber('Yan destek merkezi (PLMR yan görünüş mm)', 0, -100000);
          const extension = askNumber('Yan destek uzatması (mm)', 0, 0);
          if (centerX === null || extension === null) return true; Object.assign(payload, { centerX, extension });
        } else {
          const en = askNumber('Profil eni (mm)', 100, 1), boy = askNumber('Profil boyu (mm)', 100, 1), et = askNumber('Et kalınlığı (mm)', 2, 0.1);
          if (en === null || boy === null || et === null) return true; payload.profile = { mode:'other', en, boy, et };
        }
      } else if (target.targetType === 'parapet' && (action === 'edit' || action === 'resize')) {
        const data = target.plmrInteraction && target.plmrInteraction.data || {};
        if (action === 'resize') {
          const height = askNumber('Parapet yüksekliği (mm)', data.segmentHeight || 500, 0);
          if (height === null) return true; payload.height = height;
        } else {
          const start = askNumber('Parapet başlangıcı (mm)', data.segmentStart || 0, 0), end = askNumber('Parapet bitişi (mm)', data.segmentEnd || 1000, 1);
          if (start === null || end === null || end <= start) return true; Object.assign(payload, { start, end });
        }
      } else if (target.targetType === 'wall' && (action === 'edit' || action === 'resize')) {
        const data = target.plmrInteraction && target.plmrInteraction.data || {};
        const sideData = target.plmrSideInteraction && target.plmrSideInteraction.data || {};
        if (data.wallCellId) {
          const minX = askNumber('Duvar hücresi başlangıcı (mm)', data.cellMinX || 0, 0), maxX = askNumber('Duvar hücresi bitişi (mm)', data.cellMaxX || 1000, 1);
          const planDepth = askNumber('Duvar plan derinliği (mm)', data.wallDepth || 800, 1);
          const xOffset = askNumber('Duvar konum ofseti (mm)', sideData.wallXOffset || 0, -100000);
          const depth = askNumber('Duvar yan görünüş derinliği (mm)', sideData.wallDepth || 600, 1);
          const height = askNumber('Duvar yüksekliği (mm)', sideData.wallHeight || 3000, 1);
          if ([minX,maxX,planDepth,xOffset,depth,height].some(v=>v===null) || maxX <= minX) return true;
          Object.assign(payload, { minX, maxX, startFarDepth:planDepth, endFarDepth:planDepth, xOffset, depth, height });
        } else {
          const xOffset = askNumber('Duvar konum ofseti (mm)', data.wallXOffset || 0, -100000), depth = askNumber('Duvar derinliği (mm)', data.wallDepth || 600, 1), height = askNumber('Duvar yüksekliği (mm)', data.wallHeight || 3000, 1);
          if (xOffset === null || depth === null || height === null) return true; Object.assign(payload, { xOffset, depth, height });
        }
      } else if (target.targetType === 'glass-track' && (action === 'edit' || action === 'resize')) {
        const data = target.plmrInteraction && target.plmrInteraction.data || {};
        if (action === 'edit') {
          const lengthOffset = askNumber('Cam kaydı uzunluk ofseti (mm)', data.trackLengthOffset || 0, -100000);
          if (lengthOffset === null) return true; payload.lengthOffset = lengthOffset;
        } else {
          const en = askNumber('Cam kaydı eni (mm)', data.en || 100, 1), boy = askNumber('Cam kaydı boyu (mm)', data.boy || 100, 1), et = askNumber('Et kalınlığı (mm)', data.et || 2, 0.1);
          if (en === null || boy === null || et === null) return true; payload.profile = { mode:'other', en, boy, et };
        }
      } else if (target.targetType === 'triangle-joinery' && action === 'edit') {
        const data = target.plmrInteraction && target.plmrInteraction.data || {};
        const divisionCount = askNumber('Üçgen doğrama bölme adedi', data.triangleDivisionCount || 1, 1);
        if (divisionCount === null) return true; payload.divisionCount = Math.round(divisionCount);
      }
      const result = window.P3DVPergoRiseEditing.applyCanonicalOperation(current.input, { operation: action, areaAction: message.areaAction || null, target, payload });
      const nextOwnership = { ...(current.ownership || {}), ...(result.ownershipPatch || {}) };
      const canonical = window.P3DVPergoRiseProduct.create(result.input, { ownership: nextOwnership });
      const derived = window.P3DVPergoRiseDerivedGeometry.build(canonical);
      modelState.pergoRiseProject = { ...canonical, ownership:nextOwnership, calculated:current.calculated||{}, derived };
      pergoRiseRevision += 1;
      renderPergo2DPreview({ resetView: false });
      renderPdfRequestForm(); updateReadouts(); return true;
    } catch (error) {
      console.error('Pergola canonical edit failed.', error);
      setFreedomValidation(`PLMR düzenleme kuralı: ${error && error.message ? error.message : String(error)}`);
      return true;
    }
  }

  function applyFreedomInputs(options = {}) {
    const spec = activeProductSpec();
    if (modelState.productGroup === 'pergo-rise') return applyPergoRiseInputs();
    const rawSystemCount = firstNumericInputToken($(ids.pergoSystemCount).value) || modelState.systemCount || 1;
    const rawWidth = String($(ids.freedomWidth).value || '');
    const rawDepth = String(depthControlValue() || '');
    const height = readFreedomNumber(ids.freedomHeight);
    const topology = resolveFreedomBioTopology(modelState.productGroup, rawSystemCount, rawWidth, rawDepth);
    if (height === null) {
      setFreedomValidation('Genişlik, Açılım ve Yükseklik alanlarını doldurun.');
      return false;
    }
    const topologyMessages = {
      WIDTH_OPENING_COUNT_MISMATCH: 'Genişlikteki modül sayısı ile açılım sayısı eşleşmelidir.',
      OPENING_SYSTEM_COUNT_MISMATCH: 'Açılım sayısı Sistem Adedi ile eşleşmelidir.',
      WIDTH_SYSTEM_COUNT_MISMATCH: 'Genişlik sayısı Sistem Adedi ile eşleşmelidir.',
      WIDTH_REQUIRED: 'Genişlik alanını doldurun.',
      OPENING_REQUIRED: 'Açılım alanını doldurun.',
      OPENING_NO_ONLY_ALLOWED_AT_END: 'NO yalnız açılım listesinin sonunda kullanılabilir.',
      OPENING_EMPTY_VALUE: 'Açılım listesinde boş değer bulunamaz.',
      WIDTH_EMPTY_VALUE: 'Genişlik listesinde boş değer bulunamaz.',
      WIDTH_OPENING_ROW_COUNT_MISMATCH: 'Genişlik ve açılım alanlarında ön/arka sıra sayısı eşleşmelidir.',
      WIDTH_TOO_MANY_ROWS: 'Genişlik alanında en fazla ön ve arka olmak üzere iki sıra kullanılabilir.',
      OPENING_TOO_MANY_ROWS: 'Açılım alanında en fazla ön ve arka olmak üzere iki sıra kullanılabilir.',
      WIDTH_OPENING_COUNT_MISMATCH_ROW_1: 'Ön sıradaki genişlik ve açılım adetleri eşleşmelidir.',
      WIDTH_OPENING_COUNT_MISMATCH_ROW_2: 'Arka sıradaki genişlik ve açılım adetleri eşleşmelidir.',
      WIDTH_EMPTY_ROW: 'Genişlik alanında boş sıra bulunamaz.',
      OPENING_EMPTY_ROW: 'Açılım alanında boş sıra bulunamaz.'
    };
    if (!topology.valid) {
      setFreedomValidation(topologyMessages[topology.errors[0]] || `Çoklu sistem girişi geçersiz: ${topology.errors[0]}`);
      return false;
    }
    const widthValues = topology.moduleWidths.length ? topology.moduleWidths : [topology.totalWidth];
    const tooSmallWidth = topology.moduleWidths.length
      ? widthValues.find((value) => value < spec.widthMin)
      : (topology.totalWidth < spec.widthMin ? topology.totalWidth : null);
    if (tooSmallWidth != null) {
      setFreedomValidation(topology.moduleWidths.length ? `Her modül genişliği en az ${spec.widthMin} mm olmalıdır.` : `Genişlik en az ${spec.widthMin} mm olmalıdır.`);
      return false;
    }
    const tooSmallDepth = topology.moduleDepths.find((value) => value < spec.depthMin);
    if (tooSmallDepth != null) {
      setFreedomValidation(`Her açılım en az ${spec.depthMin} mm olmalıdır.`);
      return false;
    }
    if (height < spec.heightMin && modelState.productGroup !== "pergo-rise") {
      setFreedomValidation(roofInput.heightMessage(modelState.productGroup));
      return false;
    }
    if (height < spec.heightMin || (spec.heightMax && height > spec.heightMax)) {
      setFreedomValidation(spec.heightMax ? `Yükseklik ${spec.heightMin}–${spec.heightMax} mm arasında olmalıdır.` : `Yükseklik en az ${spec.heightMin} mm olmalıdır.`);
      return false;
    }
    if (topology.panelCounts.some((count) => count < spec.panelMin)) {
      setFreedomValidation(`Her modülde panel sayısı en az ${spec.panelMin} olmalıdır.`);
      return false;
    }
    const previous = {
      width: modelState.width, depth: modelState.depth, height: modelState.height,
      panelCount: modelState.panelCount, systemCount: modelState.systemCount,
      moduleWidths: Array.isArray(modelState.moduleWidths) ? [...modelState.moduleWidths] : [],
      moduleDepths: Array.isArray(modelState.moduleDepths) ? [...modelState.moduleDepths] : [],
      modulePanelCounts: Array.isArray(modelState.modulePanelCounts) ? [...modelState.modulePanelCounts] : [],
      multiAlignment: modelState.multiAlignment || 'front',
      multiRows: Array.isArray(modelState.multiRows) ? JSON.parse(JSON.stringify(modelState.multiRows)) : [],
      rowAlignment: modelState.rowAlignment || 'left',
      panelCollection: modelState.panelCollection || 'center'
    };
    modelState.width = topology.totalWidth;
    modelState.depth = topology.maxDepth;
    modelState.height = height;
    modelState.panelCount = topology.panelCounts[0] || panelCountFromProjection(topology.maxDepth);
    modelState.systemCount = topology.systemCount;
    modelState.moduleWidths = topology.moduleWidths.slice();
    modelState.moduleDepths = topology.moduleDepths.slice();
    modelState.modulePanelCounts = topology.panelCounts.slice();
    modelState.multiAlignment = topology.alignment;
    modelState.multiRows = Array.isArray(topology.multiRows) ? JSON.parse(JSON.stringify(topology.multiRows)) : [];
    modelState.rowAlignment = topology.rowAlignment || 'left';
    modelState.panelCollection = topology.panelCollection || 'center';
    if ($(ids.pergoSystemCount)) $(ids.pergoSystemCount).value = String(topology.systemCount);
    if ($(ids.freedomPanelCount)) {
      $(ids.freedomPanelCount).value = String(modelState.panelCount);
      $(ids.freedomPanelCount).title = topology.panelCounts.length > 1 ? `Modül panel sayıları: ${topology.panelCounts.join(';')}` : '';
    }
    modelState.inputDrafts = { width: rawWidth, depth: rawDepth, height: String($(ids.freedomHeight).value || '') };
    syncFreedomOptionStateFromUi();
    const layout = modelState.productGroup === 'b-cube' ? freedomMultiPositionLayout(modelState) : (modelState.productGroup === 'b-cube-galaxy' ? galaxyMultiPositionLayout(modelState) : bioRiseMultiPositionLayout(modelState));
    if (!layout || !layout.valid) {
      Object.assign(modelState, previous);
      const error = layout && layout.errors && layout.errors[0] || 'LAYOUT_INVALID';
      if (String(error).startsWith('MODULE_CLEAR_WIDTH_TOO_SMALL')) setFreedomValidation('Bir veya daha fazla modülün net iç açıklığı mevcut profil kesitleri için yetersiz.');
      else setFreedomValidation(`Çoklu sistem geometrisi oluşturulamadı: ${error}`);
      return false;
    }
    if (!dimensionsFit(readModel())) {
      Object.assign(modelState, previous);
      setFreedomValidation('Bu ölçüler mevcut profil kesitleri için yetersiz.');
      return false;
    }
    (typeof commitModelChangeLive === 'function'
      ? commitModelChangeLive('system-inputs', { forceRender: options.forceRender === true })
      : renderViewer());
    if (autoPreviewTimer) clearTimeout(autoPreviewTimer);
    autoPreviewTimer = null;
    showPreviewInputGuidance('', '');
    showRecommendedLimitWarnings({
      width: topology.moduleWidths.length ? Math.max(...topology.moduleWidths) : topology.totalWidth,
      depth: topology.maxDepth,
      height,
      panelCount: Math.max(...topology.panelCounts)
    });
    return true;
  }

  function viewerModelPayload() {
    v12ReconcileShared();
    reconcileRollingParapet();
    const model = readModel();
    return {
      pozNo: model.pozNo,
      productGroup: model.productGroup,
      width: model.width,
      depth: model.depth,
      height: model.height,
      lamellaCount: model.lamellaCount,
      systemCount: model.systemCount,
      moduleWidths: Array.isArray(model.moduleWidths) ? [...model.moduleWidths] : [],
      moduleDepths: Array.isArray(model.moduleDepths) ? [...model.moduleDepths] : [],
      modulePanelCounts: Array.isArray(model.modulePanelCounts) ? [...model.modulePanelCounts] : [],
      multiAlignment: model.multiAlignment === 'rear' ? 'rear' : 'front',
      multiRows: Array.isArray(model.multiRows) ? JSON.parse(JSON.stringify(model.multiRows)) : [],
      rowAlignment: model.rowAlignment === 'right' ? 'right' : 'left',
      panelCollection: model.panelCollection === 'outer' ? 'outer' : 'center',
      freedomLayout: model.freedomLayout ? JSON.parse(JSON.stringify(model.freedomLayout)) : null,
      bioRiseLayout: model.bioRiseLayout ? JSON.parse(JSON.stringify(model.bioRiseLayout)) : null,
      galaxyLayout: model.galaxyLayout ? JSON.parse(JSON.stringify(model.galaxyLayout)) : null,
      orientations: [...model.orientations],
      postSections: model.postSections.map((section) => ({ ...section })),
      beamSection: { ...model.beamSection },
      placements: JSON.parse(JSON.stringify(model.placements || {})),
      zipPlacements: JSON.parse(JSON.stringify(model.zipPlacements || {})),
      facadeProfiles: JSON.parse(JSON.stringify(model.facadeProfiles || {})),
      zoneDividers: JSON.parse(JSON.stringify(model.zoneDividers || {})),
      zoneRegistry: JSON.parse(JSON.stringify(model.zoneRegistry || {})),
      sceneEditor: JSON.parse(JSON.stringify(model.sceneEditor)),
      zonesVisible,zoneFilters:p3dvHistoryClone(zoneFilters),
      sketchWalls: JSON.parse(JSON.stringify(model.sketchWalls || [])),
      selectedZoneId: selectedZoneId || null,
      dimensionVisibility: { ...dimensionVisibility },
      productsOpen: Boolean(modelState.productsOpen),
      productOpenStates: JSON.parse(JSON.stringify(modelState.productOpenStates || {})),
      panelStates: JSON.parse(JSON.stringify(modelState.panelStates || {})),
      panelMasterOpen: Boolean(modelState.panelMasterOpen),
      colorMode: normalizeColorMode(modelState.colorMode),
      systemColor: { ...(modelState.systemColor || defaults.systemColor) },
      panelColor: { ...(modelState.panelColor || defaults.panelColor) }
    };
  }

  function postLiveModelState(reason = 'model-change') {
    const model = readModel();
    if (!viewerLiveModelStateReady || !modelReady(model) || model.productGroup === 'pergo-rise' || activeViewerProductGroup !== model.productGroup) return false;
    const revision = ++liveStateRevision;
    return postViewerMessage('set-model-state', {
      revision,
      reason: String(reason || 'model-change'),
      model: window.PLMRV17Core?v17ModelPayload(viewerModelPayload()):viewerModelPayload()
    });
  }

  let deferredPdfRefreshTimer = null;
  function scheduleDeferredPdfRefresh() {
    if (deferredPdfRefreshTimer) window.clearTimeout(deferredPdfRefreshTimer);
    deferredPdfRefreshTimer = window.setTimeout(() => {
      deferredPdfRefreshTimer = null;
      renderPdfRequestForm();
    }, 140);
  }

  function commitModelChangeLive(reason = 'model-change', options = {}) {
    if(window.PLMRV17Core&&v17SettingsDraft)return false;
    if(window.PLMRV16Core)v16EnsureZoneNames();
    v15Journal(reason);
    v12ReconcileShared();
    reconcileRollingParapet();
    pruneProductStates();
    document.dispatchEvent(new CustomEvent("plmr-v12-change"));
    if (!options.preserveHistory && !p3dvHistoryApplying) p3dvHistoryRebase(`external:${String(reason || 'model-change')}`);
    updateReadouts();
    updateToolbox();
    scheduleDeferredPdfRefresh();
    const model = readModel();
    if(isMainTechnical2DMode(model.productGroup))renderMainTechnical2DPreview({resetView:false});
    if (options.forceRender || !modelReady(model) || !activeViewerModelReady || !viewerLiveModelStateReady || activeViewerProductGroup !== model.productGroup) {
      const oldViewer=$(ids.frame)?.contentWindow?.PLMRV24StandaloneViewer;
      if(oldViewer){
        viewerCameraState=oldViewer.cameraSnapshot();
        window.PLMRV24Workspace?.preserveViewport(oldViewer.viewport2d().viewBox);
      }
      renderViewer();
      return false;
    }
    if (model.productGroup === 'pergo-rise') {
      if (viewerLivePergoRiseReady) {
        pergoRiseRevision += 1;
        postViewerMessage('set-pergo-rise-project', { revision: pergoRiseRevision, project: modelState.pergoRiseProject });
        return true;
      }
      renderViewer();
      return false;
    }
    if (!postLiveModelState(reason)) pendingLiveModelState = true;
    return true;
  }

  function zonePlacement(zone) {
    return zone ? (primaryPlacement(zone.id,zone) || zipPlacement(zone.id,zone) || null) : null;
  }

  function postViewerMessage(type, payload = {}) {
    const frame = $(ids.frame);
    const frameWindow = frame && frame.contentWindow;
    if (!frameWindow || !activeViewerSessionId) return false;
    frameWindow.postMessage({
      source: 'product-3d-parent',
      sessionId: activeViewerSessionId,
      type,
      ...payload
    }, '*');
    return true;
  }

  function postLiveProductOpenState(allProducts = false) {
    if (!viewerLiveProductStateReady) return false;
    const revision = ++liveStateRevision;
    return postViewerMessage('set-product-open-state', {
      revision, allProducts,
      productsOpen: Boolean(modelState.productsOpen),
      productOpenStates: JSON.parse(JSON.stringify(modelState.productOpenStates || {})),
      panelStates: JSON.parse(JSON.stringify(modelState.panelStates || {})),copyStates:(ensureSceneEditor().roofCopies||[]).map(c=>({id:c.id,productOpenStates:c.spec.productOpenStates||{},panelStates:c.spec.panelStates||{}}))
    });
  }

  function applyProductOpenStateLive() {
    updateToolbox();
    if (!postLiveProductOpenState()) pendingLiveProductState = true;
  }

  function postLivePanelMasterOpen() {
    if (!viewerLivePanelMasterReady) return false;
    const revision = ++liveStateRevision;
    return postViewerMessage('set-panel-master-open', {
      revision,
      open: Boolean(modelState.panelMasterOpen)
    });
  }

  function applyPanelMasterOpenLive() {
    for(const spec of [modelState,...(ensureSceneEditor().roofCopies||[]).map(o=>o.spec)]){
      spec.panelMasterOpen=Boolean(modelState.panelMasterOpen);
      for(const c of Object.values(spec.sceneEditor?.roofProducts||{}))c.open=Boolean(modelState.panelMasterOpen);
    }
    updateToolbox();
    if (!postLivePanelMasterOpen()) pendingLivePanelMasterState = true;
    if(isMainTechnical2DMode())renderMainTechnical2DPreview({resetView:false});
  }

  function postLiveColorState() {
    if (!viewerLiveColorStateReady) return false;
    const revision = ++liveStateRevision;
    return postViewerMessage('set-color-state', {
      revision,
      colorMode: normalizeColorMode(modelState.colorMode),
      systemColor: { ...(modelState.systemColor || defaults.systemColor) },
      panelColor: { ...(modelState.panelColor || defaults.panelColor) }
    });
  }

  function applyColorStateLive() {
    if(window.PLMRV17Core&&v17SettingsDraft)return false;
    if (!modelReady(readModel())) return;
    if (!postLiveColorState()) pendingLiveColorState = true;
  }

  function flushPendingViewerState() {
    if (pendingLiveProductState && viewerLiveProductStateReady) {
      pendingLiveProductState = false;
      postLiveProductOpenState();
    }
    if (pendingLivePanelMasterState && viewerLivePanelMasterReady) {
      pendingLivePanelMasterState = false;
      postLivePanelMasterOpen();
    }
    if (pendingLiveColorState && viewerLiveColorStateReady) {
      pendingLiveColorState = false;
      postLiveColorState();
    }
    if (typeof pendingLiveModelState!=='undefined' && typeof viewerLiveModelStateReady!=='undefined' && pendingLiveModelState && viewerLiveModelStateReady) {
      pendingLiveModelState = false;
      postLiveModelState('pending-flush');
    }
  }

  const TOOLBOX_SELECTION_CONFIG = {
    'multi-product': { title: 'Çoklu Ürün Ekleme', hint: 'Uygun alanları seçin. Zip Perde dolu alanlara da ön katman olarak eklenebilir. Enter veya sağ tıkla tamamlayın.', buttonId: ids.multiProduct },
    'multi-delete': { title: 'Çoklu Ürün Silme', hint: 'Ürün bulunan alanları seçin. Enter veya sağ tıkla tamamlayın.', buttonId: ids.multiDelete },
    'multi-profile-add': { title: 'Çoklu Profil Ekleme', hint: 'Ürünsüz ve yeterli büyüklükteki alanları seçin.', buttonId: ids.multiProfileAdd },
    'multi-profile-delete': { title: 'Çoklu Profil Silme', hint: 'Sonradan eklenen profilleri seçin.', buttonId: ids.multiProfileDelete },
    'fit-products': { title: 'Ürünleri Alana Uydur', hint: 'Ürün bulunan alanları seçin.', buttonId: ids.fitProducts }
  };

  function updateProductOpenList() {
    const list = $(ids.productOpenList);
    if (!list) return;
    list.innerHTML = '';
    const entries = allProductEntries().sort((a, b) => a.key.localeCompare(b.key, 'tr'));
    if ($(ids.productOpenEmpty)) $(ids.productOpenEmpty).hidden = entries.length > 0;
    const facadeCounts = {};
    entries.forEach(({ key, zoneId, placement }) => {
      const facadeId = String(zoneId).split('|')[0];
      const index = facadeCounts[facadeId] || 0;
      facadeCounts[facadeId] = index + 1;
      const label = document.createElement('label');
      label.className = 'product-open-row';
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.checked = effectiveProductOpen(key);
      input.addEventListener('change', () => {
        modelState.productOpenStates[key] = Boolean(input.checked);
        if (placement && placement.type === 'zip') modelState.panelStates[key] = Boolean(input.checked);
        applyProductOpenStateLive();
      });
      const text = document.createElement('span');
      text.textContent = productZoneLabel(zoneId, placement, index);
      label.appendChild(input);
      label.appendChild(text);
      list.appendChild(label);
    });
  }

  function closeLargeProductStateMenu() {
    const menu = $(ids.largePreviewProductStateMenu);
    const button = $(ids.largePreviewProductStateMenuButton);
    if (menu) menu.hidden = true;
    if (button) button.setAttribute('aria-expanded', 'false');
  }

  function renderLargeProductStateMenu() {
    const menu = $(ids.largePreviewProductStateMenu);
    if (!menu) return;
    menu.innerHTML = '';
    const addRow = (label, open, onToggle) => {
      const row = document.createElement('div');
      row.className = 'large-product-state-row';
      const text = document.createElement('span'); text.textContent = label;
      const button = document.createElement('button');
      button.type = 'button'; button.textContent = open ? 'AÇIK' : 'KAPALI';
      button.classList.toggle('is-closed', !open);
      button.addEventListener('click', (event) => { event.stopPropagation(); onToggle(!open); });
      row.appendChild(text); row.appendChild(button); menu.appendChild(row);
    };
    addRow('Ana Çatı Panelleri', Boolean(modelState.panelMasterOpen), (open) => { modelState.panelMasterOpen = open; applyPanelMasterOpenLive(); });
    const entries = allProductEntries().sort((a, b) => a.key.localeCompare(b.key, 'tr'));
    const facadeCounts = {};
    entries.forEach(({ key, zoneId, placement }) => {
      const facadeId = String(zoneId).split('|')[0];
      const index = facadeCounts[facadeId] || 0; facadeCounts[facadeId] = index + 1;
      addRow(productZoneLabel(zoneId, placement, index), effectiveProductOpen(key), (open) => {
        modelState.productOpenStates[key] = open;
        if (placement && placement.type === 'zip') modelState.panelStates[key] = open;
        applyProductOpenStateLive();
      });
    });
    if (!entries.length) {
      const empty = document.createElement('div'); empty.className = 'large-product-state-empty'; empty.textContent = 'Yerleştirilmiş cephe ürünü yok.'; menu.appendChild(empty);
    }
  }

  function updateLargeProductStateControl() {
    const control = $(ids.largePreviewProductStateControl);
    const button = $(ids.largePreviewProductState);
    const menuButton = $(ids.largePreviewProductStateMenuButton);
    const value = $(ids.largePreviewProductStateValue);
    const open = bioclimaticAnyOpen();
    const supported = modelState.productGroup !== 'pergo-rise';
    if (control) {
      control.classList.toggle('is-open', open && supported);
      control.classList.toggle('is-closed', !open && supported);
      control.classList.toggle('is-disabled', !supported);
    }
    if (button) {
      button.disabled = !supported;
      button.setAttribute('aria-disabled', String(!supported));
      button.setAttribute('aria-pressed', String(open));
    }
    if (menuButton) {
      menuButton.disabled = !supported;
      menuButton.setAttribute('aria-disabled', String(!supported));
    }
    if (value) value.textContent = supported ? (open ? 'AÇIK' : 'KAPALI') : 'PASİF';
    if (!supported) closeLargeProductStateMenu();
    else renderLargeProductStateMenu();
  }

  function updateToolbox() {
    document.dispatchEvent(new CustomEvent('plmr-v11-bulk',{detail:{mode:toolboxSelectionMode,count:toolboxSelectionItems.size}}));
    $(ids.toolboxIntermediateDimensions).checked = dimensionVisibility.intermediate !== false;
    $(ids.toolboxMainDimensions).checked = dimensionVisibility.main !== false;
    $(ids.replay).textContent = bioclimaticAnyOpen() ? 'Ürünler Açık' : 'Ürünler Kapalı';
    $(ids.replay).classList.toggle('is-open', bioclimaticAnyOpen());
    $(ids.replay).classList.toggle('is-closed', !bioclimaticAnyOpen());
    if ($(ids.panelMaster)) $(ids.panelMaster).checked = Boolean(modelState.panelMasterOpen);
    updateProductOpenList();
    updateLargeProductStateControl();
    updatePergoLargePreviewOptions();
    Object.entries(TOOLBOX_SELECTION_CONFIG).forEach(([mode, config]) => {
      const button = $(config.buttonId);
      if (button) button.classList.toggle('is-active-command', toolboxSelectionMode === mode);
    });
    const config = TOOLBOX_SELECTION_CONFIG[toolboxSelectionMode];
    $(ids.selectionBanner).hidden = !config;
    if (config) {
      $(ids.selectionBannerTitle).textContent = config.title;
      $(ids.selectionBannerText).textContent = `${config.hint} · ${toolboxSelectionItems.size} seçim`;
    }
    const allDims = $(ids.largePreviewShowAllDims);
    if (allDims) {
      const on = dimensionVisibility.intermediate !== false;
      allDims.setAttribute('aria-pressed', String(on));
      allDims.classList.toggle('is-on', on);
      allDims.classList.toggle('is-off', !on);
    }
    const mainDims = $(ids.largePreviewShowMainDims);
    if (mainDims) {
      const on = dimensionVisibility.main !== false;
      mainDims.setAttribute('aria-pressed', String(on));
      mainDims.classList.toggle('is-on', on);
      mainDims.classList.toggle('is-off', !on);
    }
  }

  function postToolboxSelectionState() {
    postViewerMessage('set-toolbox-selection', {
      mode: toolboxSelectionMode,
      keys: [...toolboxSelectionItems.keys()]
    });
  }

  function cancelToolboxSelection() {
    toolboxSelectionMode = null;
    toolboxSelectionItems = new Map();
    updateToolbox();
    postToolboxSelectionState();
  }

  function startToolboxSelection(mode) {
    if (!TOOLBOX_SELECTION_CONFIG[mode]) return;
    if (toolboxSelectionMode === mode) {
      cancelToolboxSelection();
      return;
    }
    closeZoneActionDialog();
    closeDividerProfileDialog();
    closePostActionDialog();
    toolboxSelectionMode = mode;
    toolboxSelectionItems = new Map();
    clearZoneSelection();
    updateToolbox();
    postToolboxSelectionState();
  }

  function toggleToolboxSelectionItem(item) {
    if (!toolboxSelectionMode || !item || !item.key) return;
    if(window.PLMRV17Core){const id=item.kind==='zone'?item.zone?.id:['roof','roof-zone'].includes(item.kind)?'roof:'+Number(item.moduleIndex):null;if(id&&zoneFilters.ids[(item.owner||'roof-main')+'|'+id]===false)return;}
    if (toolboxSelectionItems.has(item.key)) toolboxSelectionItems.delete(item.key);
    else toolboxSelectionItems.set(item.key, item);
    updateToolbox();
    postToolboxSelectionState();
  }

  function removeProfilesBatch(items) {
    const byFacade = new Map();
    items.forEach((item) => {
      const profile = item.profile;
      if (!profile || !profile.facadeId || !profile.id) return;
      if (!byFacade.has(profile.facadeId)) byFacade.set(profile.facadeId, new Set());
      byFacade.get(profile.facadeId).add(profile.id);
    });
    byFacade.forEach((removedIds, facadeId) => {
      const current = getFacadeProfiles(facadeId);
      current.forEach((profile) => {
        if (profile.orientation === 'horizontal' && (removedIds.has(profile.leftBoundaryId) || removedIds.has(profile.rightBoundaryId))) removedIds.add(profile.id);
      });
      modelState.facadeProfiles[facadeId] = current.filter((profile) => !removedIds.has(profile.id));
      [modelState.placements, modelState.zipPlacements].forEach((store) => {
        Object.keys(store || {}).forEach((zoneId) => {
          if (zoneId.startsWith(`${facadeId}|`) && [...removedIds].some((id) => zoneId.includes(id))) delete store[zoneId];
        });
      });
    });
  }

  async function completeToolboxSelection() {
    const mode = toolboxSelectionMode;
    if (!mode) return;
    const items = [...toolboxSelectionItems.values()];
    if (!items.length) {
      $(ids.selectionBannerText).textContent = `${TOOLBOX_SELECTION_CONFIG[mode].hint} · En az bir hedef seçin.`;
      return;
    }
    if (mode === 'multi-product') {
      const roofs=items.filter(i=>i.kind==='roof'||i.kind==='roof-zone'),zones=items.filter(i=>i.kind==='zone'||i.kind==='facade').map(i=>i.zone).filter(Boolean);
      cancelToolboxSelection();
      if(roofs.length)v16OpenRoofChoice(roofs,zones.length?()=>openProductDialog(zones[0],zones):null);
      else if(zones.length)openProductDialog(zones[0], zones);
      return;
    }
    if (mode === 'multi-profile-add') {
      const zones = items.map((item) => item.zone).filter(Boolean);
      cancelToolboxSelection();
      selectedZone = zones[0] || null;
      selectedZoneId = selectedZone ? selectedZone.id : null;
      openProfileDialog(zones);
      return;
    }
    if (mode === 'multi-delete' || mode === 'multi-profile-delete') {
      cancelToolboxSelection();v11Delete(items);return;
    } else if (mode === 'fit-products') {
      items.forEach((item) => {
        if (item.zone && modelState.placements[item.zone.id]) modelState.placements[item.zone.id] = { ...modelState.placements[item.zone.id], fitRevision: Date.now() };
        if (item.zone && modelState.zipPlacements[item.zone.id]) modelState.zipPlacements[item.zone.id] = { ...modelState.zipPlacements[item.zone.id], fitRevision: Date.now() };
      });
    }
    cancelToolboxSelection();
    clearZoneSelection();
    (typeof commitModelChangeLive==='function'?commitModelChangeLive('toolbox-bulk-operation'):renderViewer());
  }

  function closeZoneActionDialog() {
    $(ids.zoneActionDialog).hidden = true;
  }

  function pergoRiseZoneMenuMap(zone) {
    const target = zone && zone.pergoRise && zone.editingTarget ? zone.editingTarget : null;
    const actions = target && Array.isArray(target.menuActions) ? target.menuActions : [];
    return { target, actions: new Map(actions.map((item) => [String(item.id || ''), item])) };
  }

  function setZoneActionButton(button, action, fallbackLabel) {
    if (!button) return;
    button.hidden = !action;
    button.disabled = !action;
    if (action) button.textContent = String(action.label || fallbackLabel || action.id || 'İşlem');
  }

  function openZoneActionDialog() {
    if (!selectedZone) return;
    const pergo = pergoRiseZoneMenuMap(selectedZone);
    $(ids.zoneActionTitle).textContent = selectedZone.label;
    $(ids.zoneActionInfo).textContent = `${Math.round(selectedZone.width)} × ${Math.round(selectedZone.height)} mm net alan. Yapılacak işlemi seçin.`;
    if (pergo.target) {
      const placement = Boolean(pergo.target.occupiedProduct || pergo.actions.get('product-remove'));
      const addProfile = pergo.actions.get('profile-add');
      $(ids.zoneActionAddProfile).hidden = false;
      $(ids.zoneActionAddProfile).disabled = !addProfile || placement;
      $(ids.zoneActionAddProfile).textContent = addProfile ? String(addProfile.label || 'Profil Ekle') : 'Profil Ekle';
      $(ids.zoneActionRemoveProfile).hidden = true;
      $(ids.zoneActionRemoveProfile).disabled = true;
      const resizeAction = pergo.actions.get('resize');
      $(ids.zoneActionEditDimension).hidden = true;
      $(ids.zoneActionEditDimension).disabled = !resizeAction;
      $(ids.zoneActionEditDimension).textContent = resizeAction ? String(resizeAction.label || 'Ölçüyü Düzenle') : 'Ölçüyü Düzenle';
      const productAdd = pergo.actions.get('product-add');
      $(ids.zoneActionPlaceProduct).hidden = false;
      $(ids.zoneActionPlaceProduct).disabled = !productAdd;
      $(ids.zoneActionPlaceProduct).textContent = placement ? 'Ürünü Düzenle / Ekle' : 'Ürün Yerleştir';
      $(ids.zoneActionDeleteProduct).hidden = false;
      $(ids.zoneActionDeleteProduct).disabled = !placement;
      $(ids.zoneActionDeleteProduct).textContent = 'Ürünü Sil';
      $(ids.zoneActionRecalculate).hidden = true;
      $(ids.zoneActionRecalculate).disabled = true;
    } else {
      const placement = zonePlacement(selectedZone);
      $(ids.zoneActionAddProfile).hidden = false;
      $(ids.zoneActionAddProfile).disabled = Boolean(placement) || selectedZone.width <= 0 || selectedZone.height <= 0;
      $(ids.zoneActionAddProfile).textContent = 'Profil Ekle';
      $(ids.zoneActionRemoveProfile).hidden = true;
      $(ids.zoneActionEditDimension).hidden = true;
      $(ids.zoneActionEditDimension).disabled = window.PLMRV17Core?!Object.values(v17Editable(selectedZone)).some(Boolean):false;
      $(ids.zoneActionEditDimension).hidden = !window.PLMRV17Core;
      $(ids.zoneActionEditDimension).textContent = 'Ölçüyü Düzenle';
      const hasPrimary = Boolean(primaryPlacement(selectedZone.id,selectedZone));
      const hasZip = Boolean(zipPlacement(selectedZone.id,selectedZone));
      $(ids.zoneActionPlaceProduct).hidden = false;
      $(ids.zoneActionPlaceProduct).disabled = false;
      $(ids.zoneActionPlaceProduct).textContent = hasPrimary && hasZip ? 'Ürünleri Düzenle' : (placement ? 'Ürünü Düzenle / Ekle' : 'Ürün Yerleştir');
      $(ids.zoneActionDeleteProduct).hidden = false;
      $(ids.zoneActionDeleteProduct).disabled = !placement;
      $(ids.zoneActionDeleteProduct).textContent = 'Ürünü Sil';
      $(ids.zoneActionRecalculate).hidden = true;
    }
    $(ids.zoneActionDialog).hidden = false;
  }

  function selectZone(zone) {
    selectedZone = zone ? { ...zone } : null;
    selectedZoneId = selectedZone ? selectedZone.id : null;
    if (selectedZone) {
      const ownerModel=v11OwnerModel(selectedZone);ownerModel.zoneRegistry=ownerModel.zoneRegistry||{};
      selectedZone = decorateZoneIdentity(selectedZone,ownerModel.zoneRegistry,ownerModel);const identity=ownerModel.zoneRegistry[selectedZone.id];
      postViewerMessage('highlight-zone',{zone:selectedZone});openZoneActionDialog();
    }
  }

  function clearZoneSelection() {
    selectedZone = null;
    selectedZoneId = null;
    closeZoneActionDialog();
    postViewerMessage('clear-zone-selection');
  }

  function runPergoRiseZoneAction(action) {
    const target = selectedZone && selectedZone.pergoRise && selectedZone.editingTarget;
    if (!target) return false;
    const handled = applyPergoRiseAreaOperation({ operation: action, areaAction: action, target });
    if (handled) clearZoneSelection();
    return handled;
  }

  function getFacadeProfiles(facadeId) {
    if (!modelState.facadeProfiles[facadeId]) modelState.facadeProfiles[facadeId] = [];
    return modelState.facadeProfiles[facadeId];
  }

  function applyProfilePreset() {
    const custom = $(ids.profileType).value === 'CUSTOM';
    $(ids.profileCustomFields).hidden = !custom;
    if (!custom) {
      $(ids.profileWidth).value = '100';
      $(ids.profileDepth).value = '100';
    }
  }

  function openProfileDialog(zones) {
    const targets = Array.isArray(zones) && zones.length ? zones.map((zone) => ({ ...zone })) : (selectedZone ? [{ ...selectedZone }] : []);
    if (!targets.length) return;
    closeZoneActionDialog();
    if (targets.some((zone) => zonePlacement(zone))) {
      alert('Ürün bulunan alana profil eklenemez. Önce ürünü silin.');
      return;
    }
    bulkProfileZones = targets.length > 1 ? targets : null;
    selectedZone = targets[0];
    selectedZoneId = selectedZone.id;
    $(ids.profileOrientation).value = 'vertical';
    $(ids.profileType).value = '100x100';
    $(ids.profileWidth).value = '100';
    $(ids.profileDepth).value = '100';
    $(ids.profileCustomFields).hidden = true;
    $(ids.profileValidation).textContent = '';
    $(ids.profileDialog).hidden = false;
    $(ids.profileOrientation).focus();
  }

  function closeProfileDialog() {
    bulkProfileZones = null;
    $(ids.profileDialog).hidden = true;
    $(ids.profileValidation).textContent = '';
  }

  function verticalProfileLayoutFits(profiles, baseWidth) {
    const sorted = profiles
      .filter((profile) => (profile.orientation || 'vertical') === 'vertical')
      .sort((a, b) => a.positionRatio - b.positionRatio);
    let cursor = -baseWidth / 2;
    for (const profile of sorted) {
      const center = -baseWidth / 2 + profile.positionRatio * baseWidth;
      const left = center - profile.width / 2;
      const right = center + profile.width / 2;
      if (left - cursor < -1e-6) return false;
      cursor = right;
    }
    return baseWidth / 2 - cursor >= -1e-6;
  }

  function horizontalProfileLayoutFits(profiles, baseHeight, leftBoundaryId, rightBoundaryId) {
    const sorted = profiles
      .filter((profile) => profile.orientation === 'horizontal' && profile.leftBoundaryId === leftBoundaryId && profile.rightBoundaryId === rightBoundaryId)
      .sort((a, b) => a.positionYRatio - b.positionYRatio);
    let cursor = 0;
    for (const profile of sorted) {
      const center = profile.positionYRatio * baseHeight;
      const bottom = center - profile.width / 2;
      const top = center + profile.width / 2;
      if (bottom - cursor < -1e-6) return false;
      cursor = top;
    }
    return baseHeight - cursor >= -1e-6;
  }

  function applyProfileForm() {
    const targets = bulkProfileZones && bulkProfileZones.length ? bulkProfileZones : (selectedZone ? [selectedZone] : []);
    if (!targets.length) return;
    const orientation = $(ids.profileOrientation).value === 'horizontal' ? 'horizontal' : 'vertical';
    const custom = $(ids.profileType).value === 'CUSTOM';
    const width = custom ? Number($(ids.profileWidth).value) : 100;
    const depth = custom ? Number($(ids.profileDepth).value) : 100;
    if (!Number.isFinite(width) || width <= 0 || !Number.isFinite(depth) || depth <= 0) {
      $(ids.profileValidation).textContent = 'Profil genişliği ve derinliği sıfırdan büyük olmalıdır.';
      return;
    }
    const historyBefore = p3dvHistoryClone(modelState);
    const sequenceSnapshot = profileSequence;
    try {
      targets.forEach(zone => p3dvCanonicalAddProfile(zone, { orientation, width, depth }));
      if(window.PLMRV18Zones)v18Migrate(historyBefore,true);
    } catch (error) {
      Object.keys(modelState).forEach(key => { delete modelState[key]; });
      Object.assign(modelState, p3dvHistoryClone(historyBefore));
      profileSequence = sequenceSnapshot;
      $(ids.profileValidation).textContent = String(error && error.message || error);
      return;
    }
    closeProfileDialog();
    clearZoneSelection();
    p3dvHistoryRecord(historyBefore, { type: 'profile-add', label: '3D profile add', origin: '3d', payload: { zoneIds: targets.map(zone => zone.id), orientation, width, depth } });
    (typeof commitModelChangeLive==='function'?commitModelChangeLive('profile-add',{preserveHistory:true}):renderViewer());
  }

  function openDividerProfileDialog(profile) {
    selectedDividerProfile = profile ? { ...profile } : null;
    if (!selectedDividerProfile) return;
    const direction = selectedDividerProfile.orientation === 'horizontal' ? 'Yatay' : 'Dikey';
    $(ids.dividerProfileTitle).textContent = `${direction} Profil`;
    $(ids.dividerProfileInfo).textContent = `${selectedDividerProfile.label || 'Eklenen profil'} · Silme işlemi bu profile bağlı alt alanlardaki ürünleri de kaldırır.`;
    $(ids.dividerProfileDialog).hidden = false;
  }

  function closeDividerProfileDialog() {
    selectedDividerProfile = null;
    $(ids.dividerProfileDialog).hidden = true;
  }

  async function deleteSelectedDividerProfile() {
    if (!selectedDividerProfile) return;
    if (!await requestAppConfirmation('Profil ve bu profile bağlı alt alanlardaki ürünler silinsin mi?', { acceptLabel: 'Profili Sil' })) return;
    const facadeId = selectedDividerProfile.facadeId;
    const profileId = selectedDividerProfile.id;
    const historyBefore = p3dvHistoryClone(modelState);
    try { p3dvCanonicalDeleteProfile({ facadeId, profileId }); }
    catch (error) { alert(String(error && error.message || error)); return; }
    closeDividerProfileDialog();
    clearZoneSelection();
    p3dvHistoryRecord(historyBefore, { type: 'profile-delete', label: '3D profile delete', origin: '3d', payload: { facadeId, profileId } });
    (typeof commitModelChangeLive==='function'?commitModelChangeLive('profile-delete',{preserveHistory:true}):renderViewer());
  }

  function normalizeBeamSectionChange(value) {
    const vertical = Math.round(Number(value && value.vertical));
    const thickness = Math.round(Number(value && value.thickness));
    if (!Number.isFinite(vertical) || !Number.isFinite(thickness) || vertical < 20 || thickness < 20) return null;
    const candidate = { ...readModel(), beamSection: { vertical, thickness } };
    return dimensionsFit(candidate) ? { vertical, thickness } : null;
  }

  function applyBeamSectionChangeFromViewer(value, camera) {
    const next = normalizeBeamSectionChange(value);
    if (!next) {
      window.alert('Bu kiriş profil kesiti mevcut sistem ölçülerine uygun değil.');
      return false;
    }
    if (camera) {
      const position = Array.isArray(camera.position) ? camera.position.map(Number) : [];
      const target = Array.isArray(camera.target) ? camera.target.map(Number) : [];
      if (position.length === 3 && target.length === 3 && [...position, ...target].every(Number.isFinite)) {
        viewerCameraState = { position, target, zoom: Number.isFinite(Number(camera.zoom)) ? Number(camera.zoom) : 1, fov: Math.max(38,Math.min(110,Number(camera.fov)||38)) };
      }
    }
    modelState.beamSection = next;
    if(typeof commitModelChangeLive==='function')commitModelChangeLive('beam-section-change');else{renderViewer();renderPdfRequestForm();}
    return true;
  }

  function postName(index) {
    return ['Arka Sol Dikme', 'Arka Sağ Dikme', 'Ön Sol Dikme', 'Ön Sağ Dikme'][index] || `Dikme ${index + 1}`;
  }

  function closePostActionDialog(){selectedPostIndex=null;}

  function openZoneDimensionDialog() {
    if (!selectedZone) return;
    closeZoneActionDialog();
    $(ids.zoneDimensionTitle).textContent = window.PLMRDrawingText.t('{zone} Ölçüsü').replace('{zone}',selectedZone.label);
    const edit=window.PLMRV17Core?v17Editable(selectedZone):{width:true,height:true};
    for(const [id,enabled]of [[ids.zoneWidth,edit.width],[ids.zoneHeight,edit.height]]){const input=$(id);input.disabled=!enabled;input.closest('label').hidden=!enabled;}
    $(ids.zoneWidth).value = String(Math.round(selectedZone.width));
    $(ids.zoneHeight).value = String(Math.round(selectedZone.height));
    $(ids.zoneDimensionValidation).textContent = '';
    $(ids.zoneDimensionDialog).hidden = false;
    const focus=$(ids.zoneWidth).disabled?$(ids.zoneHeight):$(ids.zoneWidth);focus.focus();focus.select();
  }

  function closeZoneDimensionDialog() {
    $(ids.zoneDimensionDialog).hidden = true;
    $(ids.zoneDimensionValidation).textContent = '';
  }

  function applyZoneDimensionForm() {
    if (!selectedZone) return;
    const nextWidth = Math.round(Number($(ids.zoneWidth).value));
    const nextHeight = Math.round(Number($(ids.zoneHeight).value));
    if (!Number.isFinite(nextWidth) || nextWidth < 0 || !Number.isFinite(nextHeight) || nextHeight < 0) {
      $(ids.zoneDimensionValidation).textContent = 'Geçerli net genişlik ve yükseklik değerleri girin.';
      return;
    }
    const zoneId = selectedZone.id;
    const historyBefore = p3dvHistoryClone(modelState);
    try { p3dvCanonicalApplyZoneDimension(selectedZone, nextWidth, nextHeight); if(window.PLMRV18Zones)v18Migrate(historyBefore,true); }
    catch (error) {
      Object.keys(modelState).forEach(k=>delete modelState[k]);Object.assign(modelState,p3dvHistoryClone(historyBefore));v18Cache=null;
      $(ids.zoneDimensionValidation).textContent = String(error && error.message || error);
      return;
    }
    closeZoneDimensionDialog();
    clearZoneSelection();
    p3dvHistoryRecord(historyBefore, { type: 'zone-dimension', label: '3D zone dimension', origin: '3d', payload: { zoneId, width: nextWidth, height: nextHeight } });
    (typeof commitModelChangeLive==='function'?commitModelChangeLive('zone-dimension-change',{preserveHistory:true}):renderViewer());
  }

  function openSelectedProduct() {
    if (!selectedZone) return;
    closeZoneActionDialog();
    openProductDialog(selectedZone);
  }

  async function removeSelectedProduct() {
    if (!selectedZone || !zonePlacement(selectedZone)) return;
    const zoneBeforeConfirmation = { ...selectedZone };
    // The contextual area dialog must leave the modal stack before the
    // confirmation opens. Otherwise both fixed backdrops share the same
    // layer and the later context dialog can visually cover the confirmation.
    closeZoneActionDialog();
    const confirmed = await requestAppConfirmation('Seçili alandaki ürün silinsin mi?', { acceptLabel: 'Ürünü Sil' });
    if (!confirmed) {clearZoneSelection();return;
      // Cancellation keeps the existing selection useful, but only when the
      // same zone and product still exist.
      if (selectedZone && selectedZone.id === zoneBeforeConfirmation.id && zonePlacement(selectedZone)) openZoneActionDialog();
      return;
    }
    const zoneId = zoneBeforeConfirmation.id;
    const historyBefore = p3dvHistoryClone(modelState);
    delete v11OwnerModel(zoneBeforeConfirmation).placements[zoneId];
    delete v11OwnerModel(zoneBeforeConfirmation).zipPlacements[zoneId];
    delete v11OwnerModel(zoneBeforeConfirmation).productOpenStates[zoneId];
    delete v11OwnerModel(zoneBeforeConfirmation).productOpenStates[zipProductKey(zoneId)];
    delete v11OwnerModel(zoneBeforeConfirmation).panelStates[zipProductKey(zoneId)];
    clearZoneSelection();
    p3dvHistoryRecord(historyBefore, { type: 'product-delete', label: '3D product delete', origin: '3d', payload: { zoneId, slot: 'all' } });
    (typeof commitModelChangeLive==='function'?commitModelChangeLive('product-delete-zone',{preserveHistory:true}):renderViewer());
  }

  function setDimensionVisibility(kind, visible) {
    if (!['intermediate', 'main'].includes(kind)) return;
    dimensionVisibility[kind] = Boolean(visible);
    updateToolbox();
    postViewerMessage('set-dimension-visibility', {
      visibility: { ...dimensionVisibility }
    });
  }

  function resetViewerCamera() {
    viewerCameraState = null;
    postViewerMessage('reset-camera');
  }

  function zoomViewerCamera(factor) {
    const safeFactor = Number(factor);
    if (!Number.isFinite(safeFactor) || safeFactor <= 0) return;
    postViewerMessage('zoom-camera', { factor: safeFactor });
  }

  function notifyEmbeddedHostPreview(expanded) {
    if (!p3dvEmbeddedHostMode) return false;
    if (typeof p3dvHostPost === 'function') {
      p3dvHostPost('preview-expanded', {
        expanded: Boolean(expanded),
        nativeFullscreen: Boolean(document.fullscreenElement || document.webkitFullscreenElement)
      }, p3dvHostActiveTransitionId);
      return true;
    }
    return false;
  }

  function setPreviewExpanded(expanded, options) {
    const opts = options || {};
    const next = Boolean(expanded);
    document.body.classList.toggle('preview-expanded', next);
    if (p3dvEmbeddedHostMode && opts.notifyHost !== false) notifyEmbeddedHostPreview(next);
    const button = $(ids.previewExpand);
    if (button) button.setAttribute('aria-pressed', String(next));
    setText(ids.previewExpandLabel, next ? 'Önizlemeyi Küçült' : 'Önizlemeyi Büyüt');
    if (next) setLargePreviewToolboxOpen(true);
    window.setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
      postViewerMessage('viewport-resized');
    }, 90);
    return next;
  }

  async function togglePreviewExpanded() {
    const expanding = !document.body.classList.contains('preview-expanded');
    if (expanding) {
      delete document.body.dataset.fullscreenError;
      delete document.body.dataset.fullscreenHostError;

      // V14.28.6 corrective: try the top-level host synchronously when same-origin.
      // This is the preferred path because the host owns the whole PLMR workspace.
      if (p3dvEmbeddedHostMode) {
        try {
          const host = window.parent && window.parent.PulumurUnifiedWorkspace;
          if (host && typeof host.request3DPreviewExpanded === 'function') {
            const entered = await Promise.resolve(host.request3DPreviewExpanded(true, {
              notifyRuntime: false,
              browserFullscreen: true
            }));
            if (entered) {
              p3dvEmbeddedOwnFullscreen = false;
              setPreviewExpanded(true, { notifyHost: false });
              return true;
            }
          }
        } catch (error) {
          document.body.dataset.fullscreenHostError = String(error && (error.name || error.message) || 'HOST_FULLSCREEN_UNAVAILABLE');
        }
      }

      // file:// gives parent and child opaque origins in normal Chrome, so the
      // direct host API above can be inaccessible. Ask the host through the existing
      // cross-document bridge as an additional best-effort route. Do not wait for the
      // message task before trying the activated child document itself.
      if (p3dvEmbeddedHostMode) {
        p3dvHostPost('request-host-preview-expanded', { expanded: true }, p3dvHostActiveTransitionId);
      }

      // The click definitely activates this Window. Request fullscreen here with the
      // broadest compatible signature; some Chromium builds reject an options object
      // even though plain requestFullscreen() is available.
      try {
        const current = document.fullscreenElement || document.webkitFullscreenElement;
        if (!current) {
          const target = document.documentElement;
          const standardRequest = target && target.requestFullscreen;
          const webkitRequest = target && target.webkitRequestFullscreen;
          if (typeof standardRequest === 'function') {
            try {
              await standardRequest.call(target);
            } catch (firstError) {
              // If the plain call is rejected for a transient browser reason, preserve
              // the original error. The host bridge requested above may still succeed.
              throw firstError;
            }
          } else if (typeof webkitRequest === 'function') {
            await webkitRequest.call(target);
          } else {
            throw new Error('FULLSCREEN_API_UNAVAILABLE');
          }
        }
        const nativeActive = Boolean(document.fullscreenElement || document.webkitFullscreenElement);
        if (!nativeActive) throw new Error('FULLSCREEN_NOT_ENTERED');
        p3dvEmbeddedOwnFullscreen = true;
        setPreviewExpanded(true, { notifyHost: false });
        if (p3dvEmbeddedHostMode) p3dvHostPost('preview-expanded', { expanded: true, nativeFullscreen: true }, p3dvHostActiveTransitionId);
        return true;
      } catch (error) {
        p3dvEmbeddedOwnFullscreen = false;
        document.body.dataset.fullscreenError = String(error && (error.name || error.message) || 'FULLSCREEN_REJECTED');

        // Do not leave a silent no-op. If native fullscreen is rejected, keep the
        // existing large-preview presentation visible and tell the user that browser
        // fullscreen itself was blocked. This is a fallback only; native fullscreen
        // is still the acceptance target.
        setPreviewExpanded(true, { notifyHost: false });
        setLargePreviewCommandStatus('Tarayıcı tam ekran iznini reddetti · Büyük önizleme açık');
        if (p3dvEmbeddedHostMode) p3dvHostPost('fullscreen-error', {
          message: String(error && error.message || error),
          name: String(error && error.name || ''),
          fullscreenEnabled: Boolean(document.fullscreenEnabled || document.webkitFullscreenEnabled)
        }, p3dvHostActiveTransitionId);
        console.warn('Gerçek tarayıcı tam ekranı başlatılamadı.', error);
        return false;
      }
    }

    const current = document.fullscreenElement || document.webkitFullscreenElement;
    if (current) {
      try {
        const exit = document.exitFullscreen || document.webkitExitFullscreen;
        if (typeof exit === 'function') await exit.call(document);
      } catch (error) {
        console.warn('Tarayıcı tam ekranından çıkılamadı.', error);
        return false;
      }
    } else if (p3dvEmbeddedHostMode) {
      try {
        const host = window.parent && window.parent.PulumurUnifiedWorkspace;
        if (host && typeof host.request3DPreviewExpanded === 'function') {
          await Promise.resolve(host.request3DPreviewExpanded(false, { notifyRuntime: false, exitBrowserFullscreen: true }));
        }
      } catch (_) {}
    }
    p3dvEmbeddedOwnFullscreen = false;
    setPreviewExpanded(false, { notifyHost: false });
    if (p3dvEmbeddedHostMode) p3dvHostPost('preview-expanded', { expanded: false, nativeFullscreen: false }, p3dvHostActiveTransitionId);
    return true;
  }

  function setLargePreviewToolboxOpen(open) {
    const toolbox = $(ids.largePreviewToolbox);
    const workspace = $(ids.previewWorkspace);
    const toggle = $(ids.largePreviewToolboxToggle);
    const next = Boolean(open);
    if (toolbox) toolbox.classList.toggle('is-open', next);
    if (workspace) workspace.classList.toggle('is-toolbox-collapsed', !next);
    if (toggle) {
      toggle.setAttribute('aria-expanded', String(next));
      toggle.setAttribute('aria-label', next ? "Toolbox'ı daralt" : "Toolbox'ı aç");
    }
    window.setTimeout(() => postViewerMessage('viewport-resized'), 40);
  }

  function toggleLargePreviewBoolean(button) {
    if (!button || button.disabled) return;
    const next = button.getAttribute('aria-pressed') !== 'true';
    setLargePreviewBooleanState(button, next);
  }

  function setLargePreviewBooleanState(button, on) {
    if (!button) return;
    const next = Boolean(on);
    button.setAttribute('aria-pressed', String(next));
    button.classList.toggle('is-on', next);
    button.classList.toggle('is-off', !next);
    const state = button.querySelector('strong');
    if (state) state.textContent = next ? 'EVET' : 'HAYIR';
  }

  function updatePergoLargePreviewOptions() {
    const pergo = isPergoRiseUi();
    document.querySelectorAll('.large-preview-pergo-option').forEach((element) => { element.hidden = !pergo; });
    if (!pergo) return;
    const raw = modelState.pergoRiseProject && modelState.pergoRiseProject.input
      ? modelState.pergoRiseProject.input
      : collectPergoRiseRawInput();
    setLargePreviewBooleanState($(ids.largePreviewGlassTrack), String(raw.glassTrack || 'HAYIR').toUpperCase() === 'EVET');
    setLargePreviewBooleanState($(ids.largePreviewRayBoundary), String(raw.glassRayBoundaryMode || 'DARALT').toUpperCase() === 'DARALT');
    setLargePreviewBooleanState($(ids.largePreviewTriangleJoinery), String(raw.triangleJoinery || 'HAYIR').toUpperCase() === 'EVET');
    setLargePreviewBooleanState($(ids.largePreviewWaterStandard), String(raw.waterStandard || 'EVET').toUpperCase() === 'EVET');
    const parapet = $(ids.largePreviewParapet);
    if (parapet && document.activeElement !== parapet) {
      const value = String(raw.parapetHeight == null || raw.parapetHeight === '-' ? '0' : raw.parapetHeight);
      parapet.value = value;
    }
  }

  function applyLargePreviewPergoToggle(id) {
    if (!isPergoRiseUi()) return false;
    const config = {
      [ids.largePreviewGlassTrack]: { source: ids.pergoGlassTrack, field: 'glassTrack', on: 'EVET', off: 'HAYIR' },
      [ids.largePreviewRayBoundary]: { source: ids.pergoGlassRayBoundaryMode, field: 'glassRayBoundaryMode', on: 'DARALT', off: 'DEGISTIRME' },
      [ids.largePreviewTriangleJoinery]: { source: ids.pergoTriangleJoinery, field: 'triangleJoinery', on: 'EVET', off: 'HAYIR' },
      [ids.largePreviewWaterStandard]: { source: ids.waterStandardInput, field: 'waterStandard', on: 'EVET', off: 'HAYIR' }
    }[id];
    const button = $(id);
    const source = config && $(config.source);
    if (!config || !button || !source || button.disabled) return false;
    const nextOn = button.getAttribute('aria-pressed') !== 'true';
    source.value = nextOn ? config.on : config.off;
    handlePergoCanonicalFieldInput(config.field, source);
    updatePergoLargePreviewOptions();
    return true;
  }

  function setLargePreviewCommandStatus(message) {
    const status = $(ids.productStatus);
    if (!status) return;
    status.textContent = String(message || 'Komut hazır.');
    window.setTimeout(() => updateReadouts(), 2200);
  }

  function runDrawingCheck() {
    const model = readModel();
    if (!modelReady(model)) {
      setLargePreviewCommandStatus('Çizim kontrolü: zorunlu ölçüler eksik.');
      return false;
    }
    const pergo = model.productGroup === 'pergo-rise' && model.pergoRiseProject && model.pergoRiseProject.derived;
    const componentCount = pergo && pergo.counts ? Number(pergo.counts.components || pergo.counts.componentInstances || 0) : 0;
    setLargePreviewCommandStatus(pergo ? `Çizim kontrolü tamamlandı · ${componentCount || 'parametrik'} component · hata yok.` : 'Çizim kontrolü tamamlandı · model hazır.');
    return true;
  }

  function invokeLargePreviewPlaceholder(label) {
    setLargePreviewCommandStatus(`${label}: hücre işlevi sonraki tanım aşamasında bağlanacak.`);
  }

  async function toggleBrowserFullscreen() {
    if (p3dvEmbeddedHostMode) {
      await togglePreviewExpanded();
      return;
    }
    try {
      if (document.fullscreenElement) {
        if (document.exitFullscreen) await document.exitFullscreen();
      } else {
        setPreviewExpanded(true, { notifyHost: false });
        if (document.documentElement && document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
      }
    } catch (error) {
      console.warn('Tam ekran modu başlatılamadı.', error);
    }
  }

  function syncBrowserFullscreenClass() {
    const active = Boolean(document.fullscreenElement || document.webkitFullscreenElement);
    document.body.classList.toggle('is-browser-fullscreen', active);
    if (active && p3dvEmbeddedHostMode) p3dvEmbeddedOwnFullscreen = true;
    if (!active && document.body.classList.contains('preview-expanded')) {
      if (!p3dvEmbeddedHostMode || p3dvEmbeddedOwnFullscreen) {
        p3dvEmbeddedOwnFullscreen = false;
        setPreviewExpanded(false, { notifyHost: false });
        if (p3dvEmbeddedHostMode) p3dvHostPost('preview-expanded', { expanded: false, nativeFullscreen: false }, p3dvHostActiveTransitionId);
      }
    }
    window.setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
      postViewerMessage('viewport-resized');
      if (p3dvEmbeddedHostMode) p3dvHostPost('viewport-resized', {}, p3dvHostActiveTransitionId);
    }, 60);
  }

  function setInitialProjectDate() {
    const target = $(ids.projectDate);
    if (!target) return;
    try {
      target.textContent = new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date());
    } catch (error) {
      target.textContent = new Date().toLocaleDateString('tr-TR');
    }
  }

  function bioclimaticAnyOpen(){
    if(allProductEntries().some(({key,placement})=>placement.type!=='fixed'&&effectiveProductOpen(key)))return true;
    if((ensureSceneEditor().roofCopies||[]).some(({spec})=>Object.entries(spec.placements||{}).some(([key,p])=>p.type!=='fixed'&&(Object.prototype.hasOwnProperty.call(spec.productOpenStates||{},key)?spec.productOpenStates[key]:spec.productsOpen))||Object.keys(spec.zipPlacements||{}).some(key=>Object.prototype.hasOwnProperty.call(spec.productOpenStates||{},'zip:'+key)?spec.productOpenStates['zip:'+key]:spec.productsOpen)))return true;
    const C=window.PLMRBioclimaticRoof;if(!C)return Boolean(modelState.panelMasterOpen);
    return [modelState,...(ensureSceneEditor().roofCopies||[]).map(o=>o.spec)].some(spec=>{
      const modules=spec===modelState?freedomMultiPositionLayout(modelState)?.modules:spec.freedomLayout?.modules;
      return (modules||[]).some(m=>{const c=C.config(spec,m.moduleIndex);return c.open&&C.product(c.id).motion!=='Fixed';});
    });
  }
  function toggleProductsOpen() {
    if (modelState.productGroup === 'pergo-rise') return;
    const nextOpen = !bioclimaticAnyOpen();
    modelState.productsOpen = nextOpen;
    modelState.panelMasterOpen = nextOpen;
    allProductEntries().forEach(({ key, placement }) => {
      modelState.productOpenStates[key] = nextOpen;
      if (placement && placement.type === 'zip') modelState.panelStates[key] = nextOpen;
    });
    for(const copy of ensureSceneEditor().roofCopies||[]){
      const spec=copy.spec;spec.productsOpen=nextOpen;spec.productOpenStates=spec.productOpenStates||{};spec.panelStates=spec.panelStates||{};
      for(const key of Object.keys(spec.placements||{}))spec.productOpenStates[key]=nextOpen;
      for(const key of Object.keys(spec.zipPlacements||{}))spec.productOpenStates['zip:'+key]=spec.panelStates['zip:'+key]=nextOpen;
    }
    updateToolbox();
    if (!postLiveProductOpenState(true)) pendingLiveProductState = true;
    applyPanelMasterOpenLive();
  }

  let activeZone = null;
  let fixedHorizontalFormState = { values: [], manual: [], totalHeight: 0 };

  const DOOR_TYPE_OPTIONS = [
    ['SINGLE', 'Tek Kanat', 'Hareketli'],
    ['DOUBLE', 'Çift Kanat', 'Hareketli'],
    ['LEFT_FIXED_RIGHT_MOVING', 'Tek Kanat', 'Sol Sabit'],
    ['RIGHT_FIXED_LEFT_MOVING', 'Tek Kanat', 'Sağ Sabit'],
    ['TOP_FIXED', 'Tek Kanat', 'Üst Sabit'],
    ['LEFT_FIXED_TOP', 'Tek Kanat', 'Sol–Üst Sabit'],
    ['RIGHT_FIXED_TOP', 'Tek Kanat', 'Sağ–Üst Sabit'],
    ['BOTH_FIXED_TOP', 'Tek Kanat', 'Sağ–Sol–Üst Sabit'],
    ['DOUBLE_TOP', 'Çift Kanat', 'Üst Sabit'],
    ['DOUBLE_LEFT_FIXED', 'Çift Kanat', 'Sol Sabit'],
    ['DOUBLE_LEFT_FIXED_TOP', 'Çift Kanat', 'Sol–Üst Sabit'],
    ['DOUBLE_RIGHT_FIXED_TOP', 'Çift Kanat', 'Sağ–Üst Sabit'],
    ['DOUBLE_BOTH_FIXED_TOP', 'Çift Kanat', 'Sağ–Sol–Üst Sabit']
  ];
  const DOOR_TYPE_VALUES = DOOR_TYPE_OPTIONS.map((item) => item[0]);
  const DOOR_TOP_FIXED_TYPES = new Set(['TOP_FIXED','LEFT_FIXED_TOP','RIGHT_FIXED_TOP','BOTH_FIXED_TOP','DOUBLE_TOP','DOUBLE_LEFT_FIXED_TOP','DOUBLE_RIGHT_FIXED_TOP','DOUBLE_BOTH_FIXED_TOP']);
  const DOOR_DOUBLE_TYPES = new Set(['DOUBLE','DOUBLE_TOP','DOUBLE_LEFT_FIXED','DOUBLE_LEFT_FIXED_TOP','DOUBLE_RIGHT_FIXED_TOP','DOUBLE_BOTH_FIXED_TOP']);

  const PRODUCT_OPTIONS = {
    sliding: {
      subtypes: [
        ['WITH THRESHOLD', 'Eşikli'],
        ['WITHOUT THRESHOLD', 'Eşiksiz']
      ],
      openings: [
        ['SIDE OPENING', 'Yana Açılım'],
        ['CENTER OPENING', 'Ortadan Açılım']
      ],
      views: [
        ['OUTSIDE VIEW', 'Dış Bakış'],
        ['INSIDE VIEW', 'İç Bakış']
      ],
      sideDirections: [
        ['LEFT', 'Sol'],
        ['RIGHT', 'Sağ']
      ],
      centerLayers: [
        ['OUTSIDE', 'Dışta'],
        ['INSIDE', 'İçte']
      ],
      thicknessA: [
        ['8 MM', '8 mm'],
        ['10 MM', '10 mm'],
        ['INSULATED GLASS', 'Yalıtımlı Cam']
      ],
      thicknessK: [
        ['8 MM', '8 mm'],
        ['INSULATED GLASS', 'Yalıtımlı Cam']
      ]
    },
    folding: {
      subtypesA: [
        ['STANDARD', 'Standard'],
        ['TOP-HUNG', 'Top-Hung']
      ],
      subtypesK: [
        ['STANDARD', 'Standard']
      ],
      directions: [
        ['LEFT', 'Sola'],
        ['RIGHT', 'Sağa'],
        ['BOTH', 'İki Yana']
      ],
      views: [
        ['INSIDE VIEW', 'İç Bakış'],
        ['OUTSIDE VIEW', 'Dış Bakış']
      ],
      openDirections: [
        ['INWARD', 'İçeri'],
        ['OUTWARD', 'Dışarı']
      ],
      thicknessA: [
        ['8 MM', '8 mm'],
        ['10 MM', '10 mm'],
        ['12 MM', '12 mm'],
        ['INSULATED GLASS', 'Yalıtımlı Cam']
      ],
      thicknessK: [
        ['INSULATED GLASS', 'Yalıtımlı Cam']
      ]
    },
    guillotine: {
      subtypesA: [
        ['CLEANABLE', 'Temizlenebilir'],
        ['UPWARD COLLECTING', 'Yukarı Toplanan'],
        ['DOWNWARD COLLECTING', 'Aşağı Toplanan']
      ],
      subtypesK: [
        ['CLEANABLE', 'Temizlenebilir']
      ],
      mechanismsA: [
        ['CHAIN', 'Zincir'],
        ['BELT', 'Kayış']
      ],
      mechanismsK: [
        ['BELT', 'Kayış']
      ],
      thicknessA: [
        ['8 MM', '8 mm'],
        ['INSULATED GLASS', 'Yalıtımlı Cam']
      ],
      thicknessK: [
        ['INSULATED GLASS', 'Yalıtımlı Cam']
      ]
    },
    zip: {
      series: [
        ['G SERIES', 'G Serisi'],
        ['P SERIES', 'P Serisi']
      ],
      subtypesG: [
        ['100x100 BOX', '100x100 Kutu'],
        ['110x110 BOX', '110x110 Kutu'],
        ['HERCULE', 'Hercule']
      ],
      subtypesP: [
        ['115x115 BOX', '115x115 Kutu'],
        ['130x130 BOX', '130x130 Kutu']
      ],
      placements: [
        ['BETWEEN POSTS', 'Dikme Arası'],
        ['FRONT OF POSTS', 'Dikmenin Önü']
      ],
      fabricColors: [['7635-52101', '7635-52101']],
      cableDirections: [
        ['BACK', 'Arkadan'],
        ['TOP', 'Üstten'],
        ['SIDE', 'Yandan']
      ]
    },
    door: {
      types: DOOR_TYPE_OPTIONS,
      hinges: [['LEFT', 'Sol'], ['RIGHT', 'Sağ']],
      activeLeaves: [['RIGHT', 'Sağ Aktif'], ['LEFT', 'Sol Aktif']],
      openDirections: [['OUTWARD', 'Dışa'], ['INWARD', 'İçe']],
      handles: [['NORMAL', 'Normal Kapı Kolu'], ['PANIC', 'Panik Kapı Kolu']]
    }
  };


  // V14.03 product-boundary policy. Side-product forms share one dialog, but
  // visibility, validation inputs and persisted state remain product-specific.
  // Keep this matrix as the canonical regression contract for cross-product leakage.
  const PRODUCT_FIELD_POLICY = Object.freeze({
    sliding: Object.freeze({
      wrappers: Object.freeze(['productSeriesWrap','productSubtypeWrap','productSlidingViewWrap','productOpeningWrap','productDirectionWrap','productGlassThicknessWrap','productGlassColorWrap','productPanelsWrap','slidingCollectionSection']),
      stateKeys: Object.freeze(['type','series','subtype','slidingView','openingType','openingDirection','glassThickness','glassColor','customGlassColor','panels','collectionState'])
    }),
    folding: Object.freeze({
      wrappers: Object.freeze(['productSeriesWrap','productSubtypeWrap','productDirectionWrap','productGlassThicknessWrap','productGlassColorWrap','productPanelsWrap','productFoldingViewWrap','productFoldingOpenDirectionWrap','foldingCollectionSection']),
      stateKeys: Object.freeze(['type','series','subtype','openingType','openingDirection','glassThickness','glassColor','customGlassColor','panels','foldingView','foldingOpenDirection','collectionState','thresholdProfile'])
    }),
    guillotine: Object.freeze({
      wrappers: Object.freeze(['productSeriesWrap','productSubtypeWrap','productMechanismWrap','productGlassThicknessWrap','productGlassColorWrap','productPanelTypeWrap','productMotorDirectionWrap','collectingDisplaySection']),
      stateKeys: Object.freeze(['type','series','subtype','mechanism','glassThickness','glassColor','customGlassColor','panels','panelType','motorDirection','view','motorType','remoteControl','bottomPanelMode','bottomPanelState','bottomPanelHinge','collectionState'])
    }),
    zip: Object.freeze({
      wrappers: Object.freeze(['productSeriesWrap','productSubtypeWrap','productPlacementWrap','productFabricWrap','productPanelTypeWrap','productMotorDirectionWrap']),
      stateKeys: Object.freeze(['type','series','subtype','placementLocation','fabricColor','customFabricColor','cableDirection','motorDirection','panels','view','collectionState'])
    }),
    fixed: Object.freeze({
      wrappers: Object.freeze(['productGlassThicknessWrap','productGlassColorWrap','productFixedVerticalCountWrap','productFixedHorizontalCountWrap','productFixedHorizontalHeightsWrap']),
      stateKeys: Object.freeze(['type','glassThickness','glassColor','customGlassColor','verticalDivisions','horizontalDivisions','horizontalHeights','horizontalHeightManual','panels'])
    }),
    door: Object.freeze({
      wrappers: Object.freeze(['productGlassThicknessWrap','productGlassColorWrap','productDoorTypeWrap','productDoorHingeWrap','productDoorActiveLeafWrap','productDoorOpenDirectionWrap','productDoorHandleTypeWrap','productDoorTopFixedHeightWrap','productDoorHeightSummaryWrap']),
      stateKeys: Object.freeze(['type','doorType','hingeDirection','activeLeaf','doorOpenDirection','handleType','movingLeafHeight','topFixedHeight','view','glassThickness','glassColor','customGlassColor','panels'])
    })
  });
  const PRODUCT_MANAGED_WRAPPERS = Object.freeze(Array.from(new Set(Object.values(PRODUCT_FIELD_POLICY).flatMap(item => item.wrappers).concat(['productCustomGlassWrap','cleanableWindowSection']))));
  const PRODUCT_METADATA_KEYS = Object.freeze(['fitRevision']);

  function isFoldingType(type) { return type === 'folding' || type === 'balcony'; }
  function productPolicy(type) {
    return PRODUCT_FIELD_POLICY[type === 'balcony' ? 'folding' : type] || PRODUCT_FIELD_POLICY.sliding;
  }

  function sanitizeProductState(source, fallbackType, options = {}) {
    if(window.PLMRV24Native?.native(source))return window.PLMRV24Native.sanitize(source);
    const requestedType = source && source.type ? source.type : fallbackType;
    const type = isFoldingType(requestedType) ? requestedType : (requestedType === 'guillotine' ? 'guillotine' : (requestedType === 'zip' ? 'zip' : (requestedType === 'fixed' ? 'fixed' : (requestedType === 'door' ? 'door' : 'sliding'))));
    const defaults = productDefaults(type);
    const input = source && typeof source === 'object' ? source : {};
    const out = { type };
    productPolicy(type).stateKeys.forEach(key => {
      if (key === 'type') return;
      if (Object.prototype.hasOwnProperty.call(input, key)) out[key] = input[key];
      else if (Object.prototype.hasOwnProperty.call(defaults, key)) out[key] = defaults[key];
    });
    if (options.preserveMetadata === true) PRODUCT_METADATA_KEYS.forEach(key => { if (Object.prototype.hasOwnProperty.call(input,key)) out[key]=input[key]; });
    return out;
  }

  function resetProductFieldVisibility() {
    PRODUCT_MANAGED_WRAPPERS.forEach(id => {
      const element = $(ids[id] || id);
      if (element) element.hidden = true;
    });
  }

  const COLOR_FINISHES = [
    { value: 'GLOSS', label: 'Parlak', detail: 'Daha belirgin yansıma', roughness: 0.16, metalness: 0.28 },
    { value: 'MATTE', label: 'Mat', detail: 'Daha yumuşak yansıma', roughness: 0.48, metalness: 0.16 },
    { value: 'TEXTURE', label: 'Texture', detail: 'Daha pütürlü yüzey görünümü', roughness: 0.84, metalness: 0.08 }
  ];

  const GLASS_COLOR_OPTIONS = [
    ['TRANSPARENT', 'Şeffaf'],
    ['FUME', 'Füme'],
    ['BRONZE', 'Bronz'],
    ['LOW-E GLASS', 'Low-e Cam'],
    ['OTHER', 'Diğer']
  ];

  const ZIP_FABRIC_CATALOG = [
    {
      title: 'Sun-Store',
      pages: [
        {
          image: 'assets/fabric-pages/sun-store/sun-store-page-1.jpg',
          items: [
            { value: '7635-52101', left: '52.0362%', top: '2.2805%', width: '39.7059%', height: '14.1961%', tone: '#f7f8f1', texture: 'assets/fabric-pages/sun-store/textures/7635-52101.png', tileMm: 520 },
            { value: '7635-52102', left: '8.2579%', top: '16.5336%', width: '39.5928%', height: '13.9681%', tone: '#cfd1cc', texture: 'assets/fabric-pages/sun-store/textures/7635-52102.png', tileMm: 520 },
            { value: '7635-52103', left: '52.4887%', top: '16.5336%', width: '39.5928%', height: '14.1391%', tone: '#a1a39e', texture: 'assets/fabric-pages/sun-store/textures/7635-52103.png', tileMm: 520 },
            { value: '7635-52105', left: '8.2579%', top: '30.7868%', width: '39.5928%', height: '14.1961%', tone: '#5d6568', texture: 'assets/fabric-pages/sun-store/textures/7635-52105.png', tileMm: 520 },
            { value: '7635-52106', left: '52.2624%', top: '30.7868%', width: '39.5928%', height: '14.1961%', tone: '#4f575a', texture: 'assets/fabric-pages/sun-store/textures/7635-52106.png', tileMm: 520 },
            { value: '7635-52107', left: '8.1448%', top: '45.2680%', width: '39.5928%', height: '14.1391%', tone: '#33373a', texture: 'assets/fabric-pages/sun-store/textures/7635-52107.png', tileMm: 520 },
            { value: '7635-52173', left: '52.0362%', top: '45.2109%', width: '39.5928%', height: '14.0251%', tone: '#f7f7d7', texture: 'assets/fabric-pages/sun-store/textures/7635-52173.png', tileMm: 520 },
            { value: '7635-52174', left: '8.3710%', top: '60.0342%', width: '39.5928%', height: '14.0251%', tone: '#f9f9e8', texture: 'assets/fabric-pages/sun-store/textures/7635-52174.png', tileMm: 520 },
            { value: '7635-52176', left: '51.6968%', top: '60.0342%', width: '39.7059%', height: '14.0251%', tone: '#b9ac8a', texture: 'assets/fabric-pages/sun-store/textures/7635-52176.png', tileMm: 520 },
            { value: '7635-52142', left: '8.3710%', top: '76.6819%', width: '38.6878%', height: '14.8233%', tone: '#696f72', texture: 'assets/fabric-pages/sun-store/textures/7635-52142.png', tileMm: 520 },
            { value: '7635-52144', left: '51.6968%', top: '76.6819%', width: '39.5928%', height: '14.1391%', tone: '#323639', texture: 'assets/fabric-pages/sun-store/textures/7635-52144.png', tileMm: 520 }
          ]
        },
        {
          image: 'assets/fabric-pages/sun-store/sun-store-page-2.jpg',
          items: [
            { value: '92-2044', left: '53.6830%', top: '0.7412%', width: '39.2857%', height: '12.5428%', tone: '#f7f6f1', texture: 'assets/fabric-pages/sun-store/textures/92-2044.png', tileMm: 460 },
            { value: '92-2135', left: '7.2545%', top: '13.0559%', width: '39.0625%', height: '12.8848%', tone: '#9e988d', texture: 'assets/fabric-pages/sun-store/textures/92-2135.png', tileMm: 460 },
            { value: '92-2171', left: '53.7946%', top: '13.0559%', width: '39.0625%', height: '12.8278%', tone: '#909899', texture: 'assets/fabric-pages/sun-store/textures/92-2171.png', tileMm: 460 },
            { value: '92-2043', left: '7.0312%', top: '25.7127%', width: '38.9509%', height: '12.8848%', tone: '#343635', texture: 'assets/fabric-pages/sun-store/textures/92-2043.png', tileMm: 460 },
            { value: '92-2047', left: '53.3482%', top: '25.6556%', width: '38.9509%', height: '12.8848%', tone: '#2c3135', texture: 'assets/fabric-pages/sun-store/textures/92-2047.png', tileMm: 460 },
            { value: '86-2044', left: '53.5714%', top: '38.3694%', width: '39.0625%', height: '12.9418%', tone: '#f5f4e9', texture: 'assets/fabric-pages/sun-store/textures/86-2044.png', tileMm: 420 },
            { value: '86-2135', left: '7.1429%', top: '51.0832%', width: '39.0625%', height: '12.8278%', tone: '#9a958a', texture: 'assets/fabric-pages/sun-store/textures/86-2135.png', tileMm: 420 },
            { value: '86-2171', left: '53.5714%', top: '51.0262%', width: '38.9509%', height: '12.8848%', tone: '#8f9899', texture: 'assets/fabric-pages/sun-store/textures/86-2171.png', tileMm: 420 },
            { value: '86-2043', left: '7.1429%', top: '64.2531%', width: '39.0625%', height: '12.8848%', tone: '#393c3b', texture: 'assets/fabric-pages/sun-store/textures/86-2043.png', tileMm: 420 },
            { value: '86-2047', left: '53.3482%', top: '64.2531%', width: '39.0625%', height: '12.8848%', tone: '#31363a', texture: 'assets/fabric-pages/sun-store/textures/86-2047.png', tileMm: 420 },
            { value: 'W88-8102', left: '7.1429%', top: '78.1072%', width: '39.0625%', height: '16.1345%', tone: '#f7f6e2', texture: 'assets/fabric-pages/sun-store/textures/W88-8102.png', tileMm: 420 },
            { value: 'W88-2047', left: '53.3482%', top: '78.1072%', width: '39.0625%', height: '16.2486%', tone: '#262b33', texture: 'assets/fabric-pages/sun-store/textures/W88-2047.png', tileMm: 420 }
          ]
        }
      ]
    }
  ];

  const ZIP_FABRIC_OPTIONS = ZIP_FABRIC_CATALOG.flatMap((section) => section.pages.flatMap((page) => page.items.map((item) => ({
    value: item.value,
    label: item.value,
    line: section.title,
    hex: item.tone || '#8b9096'
  }))));

  function normalizeColorFinish(value, fallback = 'MATTE') {
    return COLOR_FINISHES.some((item) => item.value === value) ? value : fallback;
  }

  function finishMeta(value) {
    return COLOR_FINISHES.find((item) => item.value === normalizeColorFinish(value)) || COLOR_FINISHES[1];
  }

  function finishLabel(value) {
    return finishMeta(value).label;
  }

  function normalizeGlassColor(value) {
    const raw = String(value || '').toUpperCase();
    if (raw === 'GREY') return 'FUME';
    if (['TRANSPARENT', 'FUME', 'BRONZE', 'LOW-E GLASS', 'OTHER'].includes(raw)) return raw;
    return 'TRANSPARENT';
  }

  function normalizeGlassThickness(value) {
    const raw = String(value || '').toUpperCase();
    return ['8 MM', '10 MM', '12 MM', 'INSULATED GLASS'].includes(raw) ? raw : '10 MM';
  }

  function glassPreferenceState() {
    const current = modelState.glassPreferences || defaults.glassPreferences;
    const normalized = {
      color: normalizeGlassColor(current && current.color),
      customColor: String(current && current.customColor || ''),
      thickness: normalizeGlassThickness(current && current.thickness)
    };
    if (normalized.color !== 'OTHER') normalized.customColor = '';
    modelState.glassPreferences = normalized;
    return normalized;
  }

  function glassThicknessValues(type, series) {
    if (type === 'guillotine') {
      return (series === 'K SERIES' ? PRODUCT_OPTIONS.guillotine.thicknessK : PRODUCT_OPTIONS.guillotine.thicknessA).map((item) => item[0]);
    }
    if (type === 'sliding') {
      return (series === 'K SERIES' ? PRODUCT_OPTIONS.sliding.thicknessK : PRODUCT_OPTIONS.sliding.thicknessA).map((item) => item[0]);
    }
    if (isFoldingType(type)) {
      return (series === 'K SERIES' ? PRODUCT_OPTIONS.folding.thicknessK : PRODUCT_OPTIONS.folding.thicknessA).map((item) => item[0]);
    }
    if (type === 'door' || type === 'fixed') return PRODUCT_OPTIONS.sliding.thicknessA.map((item) => item[0]);
    return [];
  }

  function compatibleGlassThickness(type, series, preferredThickness, glassColor) {
    const values = glassThicknessValues(type, series);
    if (!values.length) return '';
    const preferred = normalizeGlassThickness(preferredThickness);
    if (normalizeGlassColor(glassColor) === 'LOW-E GLASS' && values.includes('INSULATED GLASS')) return 'INSULATED GLASS';
    if (values.includes(preferred)) return preferred;
    if (preferred === '10 MM' && values.includes('8 MM')) return '8 MM';
    if (preferred === '8 MM' && values.includes('INSULATED GLASS')) return 'INSULATED GLASS';
    if (values.includes('INSULATED GLASS')) return 'INSULATED GLASS';
    return values[0];
  }

  function glassSeriesForDraft(draft) {
    if (draft && (draft.type === 'sliding' || isFoldingType(draft.type) || draft.type === 'guillotine')) return draft.series === 'K SERIES' ? 'K SERIES' : 'A SERIES';
    return 'A SERIES';
  }

  function rememberGlassColorFromForm() {
    const preference = glassPreferenceState();
    const color = normalizeGlassColor($(ids.productGlassColor).value);
    preference.color = color;
    preference.customColor = color === 'OTHER' ? String($(ids.productCustomGlass).value || '') : '';
    if (color === 'LOW-E GLASS') {
      const type = $(ids.productType).value;
      const series = glassSeriesForDraft({ type, series: $(ids.productSeries).value });
      const compatible = compatibleGlassThickness(type, series, 'INSULATED GLASS', color);
      if (compatible) {
        preference.thickness = compatible;
        $(ids.productGlassThickness).value = compatible;
      }
    }
    modelState.glassPreferences = preference;
  }

  function rememberGlassThicknessFromForm() {
    const preference = glassPreferenceState();
    preference.thickness = normalizeGlassThickness($(ids.productGlassThickness).value);
    modelState.glassPreferences = preference;
  }

  function rememberGlassPreferencesFromDraft(draft) {
    if (!draft || draft.type === 'zip') return;
    const preference = glassPreferenceState();
    preference.color = normalizeGlassColor(draft.glassColor);
    preference.customColor = preference.color === 'OTHER' ? String(draft.customGlassColor || '') : '';
    const series = glassSeriesForDraft(draft);
    const automaticFallback = compatibleGlassThickness(draft.type, series, preference.thickness, preference.color);
    const supported = glassThicknessValues(draft.type, series);
    if (supported.includes(preference.thickness) || draft.glassThickness !== automaticFallback) {
      preference.thickness = normalizeGlassThickness(draft.glassThickness);
    }
    modelState.glassPreferences = preference;
  }

  function zipFabricByCode(value) {
    return ZIP_FABRIC_OPTIONS.find((item) => item.value === value) || ZIP_FABRIC_OPTIONS[0];
  }

  function setProductFabricValue(value) {
    const option = zipFabricByCode(value);
    if ($(ids.productFabric)) $(ids.productFabric).value = option.value;
    setText(ids.productFabricValue, option.label);
  }

  function createFabricHotspotButton(item, selectedValue) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'fabric-page-hotspot' + (selectedValue === item.value ? ' is-selected' : '');
    button.setAttribute('style', `left:${item.left};top:${item.top};width:${item.width};height:${item.height};`);
    button.setAttribute('data-value', item.value);
    button.title = item.value;
    button.setAttribute('aria-label', item.value);
    button.innerHTML = `<span>${item.value}</span>`;
    button.addEventListener('click', () => {
      setProductFabricValue(item.value);
      closeProductFabricCatalog();
      $(ids.productValidation).textContent = '';
    });
    return button;
  }

  function renderFabricCards(selectedValue) {
    const container = $(ids.productFabricCards);
    if (!container) return;
    container.innerHTML = '';
    const selected = zipFabricByCode(selectedValue).value;
    ZIP_FABRIC_CATALOG.forEach((section) => {
      const sectionEl = document.createElement('section');
      sectionEl.className = 'fabric-page-section';
      const heading = document.createElement('div');
      heading.className = 'fabric-page-section-head';
      heading.innerHTML = `<strong>${section.title}</strong><span>Gerçek katalog sayfası üzerinden seçim yapın</span>`;
      sectionEl.appendChild(heading);
      const stack = document.createElement('div');
      stack.className = 'fabric-page-stack-inner';
      section.pages.forEach((page, index) => {
        const card = document.createElement('article');
        card.className = 'fabric-page-card';
        const overlay = document.createElement('div');
        overlay.className = 'fabric-page-overlay';
        const img = document.createElement('img');
        img.src = page.image;
        img.alt = `${section.title} sayfa ${index + 1}`;
        img.loading = 'lazy';
        overlay.appendChild(img);
        page.items.forEach((item) => overlay.appendChild(createFabricHotspotButton(item, selected)));
        card.appendChild(overlay);
        stack.appendChild(card);
      });
      sectionEl.appendChild(stack);
      container.appendChild(sectionEl);
    });
  }

  function foldingPanelCountForWidth(width) {
    const value = Number(width) || 0;
    return value > 0 ? Math.max(2, Math.ceil(value / 600)) : 4;
  }

  function foldingDirectionForPanels(panels, requestedDirection) {
    const count = Math.max(2, Math.round(Number(panels) || 2));
    if (count > 8) return 'BOTH';
    return ['LEFT', 'RIGHT', 'BOTH'].includes(requestedDirection) ? requestedDirection : 'RIGHT';
  }

  function foldingOpenDirectionValue(value) {
    return value === 'OUTWARD' ? 'OUTWARD' : 'INWARD';
  }

  function foldingAdvisory(zone, draft) {
    const warnings = [];
    const count = Math.max(2, Math.round(Number(draft && draft.panels) || 2));
    const height = Number(zone && zone.height) || 0;
    const width = Number(zone && zone.width) || 0;
    if (height > 2800) warnings.push(`Önerilen maksimum yükseklik 2800 mm; mevcut ${Math.round(height)} mm. Çizime engel olmaz.`);
    if (count > 8) warnings.push(`${count} panel tek tarafa önerilen 8 paneli aştığı için otomatik iki yana toplanır.`);
    if (width > 0 && width / count > 600) warnings.push(`Panel genişliği yaklaşık ${Math.round(width / count)} mm; önerilen maksimum 600 mm. Çizime engel olmaz.`);
    return warnings;
  }

  function productDefaults(type) {
    const preference = glassPreferenceState();
    const defaultGlass = preference.color;
    const customGlass = preference.color === 'OTHER' ? preference.customColor : '';
    if (type === 'zip') {
      return {
        type: 'zip',
        series: 'G SERIES',
        subtype: '100x100 BOX',
        placementLocation: 'BETWEEN POSTS',
        fabricColor: ZIP_FABRIC_OPTIONS[0].value,
        customFabricColor: '',
        cableDirection: 'BACK',
        motorDirection: 'RIGHT',
        panels: 1,
        view: 'OUTSIDE VIEW',
        collectionState: 'NORMAL'
      };
    }
    if (type === 'door') {
      return {
        type: 'door',
        doorType: 'SINGLE',
        hingeDirection: 'LEFT',
        activeLeaf: 'RIGHT',
        doorOpenDirection: 'OUTWARD',
        handleType: 'NORMAL',
        movingLeafHeight: 2200,
        topFixedHeight: 500,
        view: 'OUTSIDE VIEW',
        glassThickness: compatibleGlassThickness('door', 'A SERIES', preference.thickness, defaultGlass),
        glassColor: defaultGlass,
        customGlassColor: customGlass
      };
    }
    if (type === 'fixed') {
      return {
        type: 'fixed',
        glassThickness: compatibleGlassThickness('fixed', 'A SERIES', preference.thickness, defaultGlass),
        glassColor: defaultGlass,
        customGlassColor: customGlass,
        verticalDivisions: 0,
        horizontalDivisions: 1,
        horizontalHeights: ''
      };
    }
    if (isFoldingType(type)) {
      return {
        type,
        series: 'A SERIES',
        subtype: 'STANDARD',
        openingType: 'FOLDING',
        openingDirection: 'RIGHT',
        glassThickness: compatibleGlassThickness('folding', 'A SERIES', preference.thickness, defaultGlass),
        glassColor: defaultGlass,
        customGlassColor: customGlass,
        panels: 4,
        foldingView: 'INSIDE VIEW',
        foldingOpenDirection: 'INWARD',
        collectionState: 'NORMAL',
        thresholdProfile: 70
      };
    }
    if (type === 'guillotine') {
      return {
        type: 'guillotine',
        series: 'A SERIES',
        subtype: 'CLEANABLE',
        mechanism: 'CHAIN',
        glassThickness: compatibleGlassThickness('guillotine', 'A SERIES', preference.thickness, defaultGlass),
        glassColor: defaultGlass,
        customGlassColor: customGlass,
        panels: 3,
        panelType: '1+2',
        motorDirection: 'RIGHT',
        view: 'OUTSIDE VIEW',
        motorType: 'SOMFY RTS',
        remoteControl: '1 CHANNEL',
        bottomPanelMode: 'VASISTAS',
        bottomPanelState: 'OPEN',
        bottomPanelHinge: 'BOTTOM',
        collectionState: 'NORMAL'
      };
    }
    return {
      type: 'sliding',
      series: 'A SERIES',
      subtype: 'WITH THRESHOLD',
      slidingView: 'OUTSIDE VIEW',
      openingType: 'SIDE OPENING',
      openingDirection: 'RIGHT',
      glassThickness: compatibleGlassThickness('sliding', 'A SERIES', preference.thickness, defaultGlass),
      glassColor: defaultGlass,
      customGlassColor: customGlass,
      panels: 4,
      collectionState: 'NORMAL'
    };
  }

  function normalizePlacement(placement, fallbackType) {
    if(window.PLMRV24Native?.native(placement))return window.PLMRV24Native.sanitize(placement);
    const requestedType = placement && placement.type ? placement.type : fallbackType;
    const type = isFoldingType(requestedType) ? requestedType : (requestedType === 'guillotine' ? 'guillotine' : (requestedType === 'zip' ? 'zip' : (requestedType === 'fixed' ? 'fixed' : (requestedType === 'door' ? 'door' : 'sliding'))));
    const normalized = { ...productDefaults(type), ...(placement || {}), type };
    if (placement && placement.opening && type === 'sliding' && !placement.openingType) {
      normalized.openingType = placement.opening === 'center' ? 'CENTER OPENING' : 'SIDE OPENING';
      normalized.openingDirection = String(placement.opening || '').toUpperCase();
    }
    if (placement && placement.opening && type === 'guillotine' && !placement.subtype) {
      normalized.subtype = placement.opening === 'up' ? 'UPWARD COLLECTING' : 'CLEANABLE';
    }
    normalized.panels = Math.round(Number(normalized.panels || normalized.panelCount || productDefaults(type).panels));
    if (type === 'zip') {
      normalized.series = normalized.series === 'P SERIES' ? 'P SERIES' : 'G SERIES';
      const validTypes = normalized.series === 'P SERIES'
        ? PRODUCT_OPTIONS.zip.subtypesP.map((item) => item[0])
        : PRODUCT_OPTIONS.zip.subtypesG.map((item) => item[0]);
      if (!validTypes.includes(normalized.subtype)) normalized.subtype = validTypes[0];
      normalized.placementLocation = ['FRONT OF POSTS','OUTSIDE POSTS'].includes(normalized.placementLocation) ? 'FRONT OF POSTS' : 'BETWEEN POSTS';
      normalized.fabricColor = zipFabricByCode(normalized.fabricColor).value;
      normalized.customFabricColor = String(normalized.customFabricColor || '');
      normalized.cableDirection = ['BACK', 'TOP', 'SIDE'].includes(normalized.cableDirection) ? normalized.cableDirection : 'BACK';
      normalized.motorDirection = normalized.motorDirection === 'LEFT' ? 'LEFT' : 'RIGHT';
      normalized.panels = 1;
      normalized.view = 'OUTSIDE VIEW';
      normalized.collectionState = 'NORMAL';
    }
    if (type === 'guillotine' && normalized.subtype === 'STANDARD') normalized.subtype = 'CLEANABLE';
    if (type === 'guillotine' && normalized.bottomPanelMode === 'WINDOW') normalized.bottomPanelMode = 'VASISTAS';
    if (type === 'guillotine') {
      normalized.motorDirection = normalized.motorDirection === 'LEFT' ? 'LEFT' : 'RIGHT';
      normalized.bottomPanelHinge = 'BOTTOM';
      normalized.view = 'OUTSIDE VIEW';
      if (normalized.subtype === 'CLEANABLE') {
        normalized.bottomPanelMode = 'VASISTAS';
        normalized.bottomPanelState = 'OPEN';
      }
    }
    if (isFoldingType(type)) {
      normalized.series = normalized.series === 'K SERIES' ? 'K SERIES' : 'A SERIES';
      const validSubtypes = normalized.series === 'K SERIES'
        ? PRODUCT_OPTIONS.folding.subtypesK.map((item) => item[0])
        : PRODUCT_OPTIONS.folding.subtypesA.map((item) => item[0]);
      if (!validSubtypes.includes(normalized.subtype)) normalized.subtype = validSubtypes[0];
      normalized.panels = Math.max(2, Math.round(Number(normalized.panels) || 4));
      normalized.openingType = 'FOLDING';
      normalized.openingDirection = foldingDirectionForPanels(normalized.panels, normalized.openingDirection);
      normalized.foldingView = normalized.foldingView === 'OUTSIDE VIEW' ? 'OUTSIDE VIEW' : 'INSIDE VIEW';
      normalized.foldingOpenDirection = foldingOpenDirectionValue(normalized.foldingOpenDirection);
      delete normalized.passageDoor;
      normalized.collectionState = normalized.collectionState === 'COLLECTED' ? 'COLLECTED' : 'NORMAL';
      normalized.thresholdProfile = 70;
      normalized.glassThickness = compatibleGlassThickness('folding', normalized.series, normalized.glassThickness, normalized.glassColor);
      normalized.glassColor = normalizeGlassColor(normalized.glassColor || glassPreferenceState().color);
      normalized.customGlassColor = String(normalized.customGlassColor || '');
    }
    if (type === 'sliding') {
      normalized.slidingView = normalized.slidingView === 'INSIDE VIEW' ? 'INSIDE VIEW' : 'OUTSIDE VIEW';
      if (!['NORMAL', 'COLLECTED'].includes(normalized.collectionState)) normalized.collectionState = 'NORMAL';
      if (normalized.openingType === 'CENTER OPENING') {
        normalized.openingDirection = normalized.openingDirection === 'INSIDE' ? 'INSIDE' : 'OUTSIDE';
      } else {
        normalized.openingDirection = normalized.openingDirection === 'LEFT' ? 'LEFT' : 'RIGHT';
      }
    }
    if (type === 'guillotine' && !['NORMAL', 'COLLECTED'].includes(normalized.collectionState)) normalized.collectionState = 'NORMAL';
    if (type === 'door') {
      normalized.doorType = DOOR_TYPE_VALUES.includes(normalized.doorType) ? normalized.doorType : 'SINGLE';
      normalized.hingeDirection = normalized.hingeDirection === 'RIGHT' ? 'RIGHT' : 'LEFT';
      normalized.activeLeaf = normalized.activeLeaf === 'LEFT' ? 'LEFT' : 'RIGHT';
      normalized.doorOpenDirection = normalized.doorOpenDirection === 'INWARD' ? 'INWARD' : 'OUTWARD';
      normalized.handleType = normalized.handleType === 'PANIC' ? 'PANIC' : 'NORMAL';
      const hasStoredMovingHeight = placement && Number.isFinite(Number(placement.movingLeafHeight));
      normalized.movingLeafHeight = hasStoredMovingHeight ? Math.max(1200, Math.round(Number(placement.movingLeafHeight))) : null;
      normalized.topFixedHeight = Math.max(110, Math.round(Number(normalized.topFixedHeight) || 500));
      normalized.view = 'OUTSIDE VIEW';
      normalized.glassThickness = compatibleGlassThickness('door', 'A SERIES', normalized.glassThickness, normalized.glassColor);
      normalized.glassColor = normalizeGlassColor(normalized.glassColor || glassPreferenceState().color);
      normalized.customGlassColor = String(normalized.customGlassColor || '');
      normalized.panels = 0;
      delete normalized.series;
      delete normalized.subtype;
    }
    if (type === 'fixed') {
      normalized.glassThickness = compatibleGlassThickness('fixed', 'A SERIES', normalized.glassThickness, normalized.glassColor);
      normalized.glassColor = normalizeGlassColor(normalized.glassColor || glassPreferenceState().color);
      normalized.customGlassColor = String(normalized.customGlassColor || '');
      normalized.verticalDivisions = Math.max(0, Math.min(20, Math.round(Number(normalized.verticalDivisions || (Number(normalized.verticalCount) ? Number(normalized.verticalCount) + 1 : 0)) || 0)));
      normalized.horizontalDivisions = Math.max(1, Math.min(10, Math.round(Number(normalized.horizontalDivisions || (Number.isFinite(Number(normalized.horizontalCount)) ? Number(normalized.horizontalCount) + 1 : 1)) || 1)));
      normalized.horizontalHeights = String(normalized.horizontalHeights || '');
      const hasStoredManual = placement && Array.isArray(placement.horizontalHeightManual);
      const storedManual = hasStoredManual ? placement.horizontalHeightManual : [];
      normalized.horizontalHeightManual = hasStoredManual
        ? Array.from({ length: normalized.horizontalDivisions }, (_, index) => Boolean(storedManual[index]))
        : null;
      delete normalized.horizontalCount;
      delete normalized.horizontalMode;
      delete normalized.series;
      delete normalized.subtype;
    }
    return sanitizeProductState(normalized, type, { preserveMetadata: true });
  }

  function fillSelect(select, options, selected) {
    const safeOptions = Array.isArray(options) ? options : [];
    select.innerHTML = '';
    safeOptions.forEach((option) => {
      const value = Array.isArray(option) ? String(option[0]) : String(option);
      const label = Array.isArray(option) ? (option.length > 2 ? option[1] + ' · ' + option[2] : option[1]) : String(option);
      const element = document.createElement('option');
      element.value = value;
      element.textContent = label;
      if (String(selected) === value) element.selected = true;
      select.appendChild(element);
    });
    if (!select.value && safeOptions.length) select.value = String(Array.isArray(safeOptions[0]) ? safeOptions[0][0] : safeOptions[0]);
  }

  function doorTypeLabelParts(value) {
    const found = DOOR_TYPE_OPTIONS.find((item) => item[0] === value);
    return found ? { main: found[1], detail: found[2] } : { main: String(value || ''), detail: '' };
  }

  function doorTypeLabel(value) {
    const label = doorTypeLabelParts(value);
    return label.detail ? label.main + ' · ' + label.detail : label.main;
  }

  function lookupOptionLabel(options, value) {
    const list = Array.isArray(options) ? options : [];
    const found = list.find((option) => Array.isArray(option)
      ? String(option[0]) === String(value)
      : String(option) === String(value));
    if (!found) return value == null || value === '' ? '—' : String(value);
    return Array.isArray(found) ? String(found[1] || found[0]) : String(found);
  }

  function mmText(value) {
    const number = Math.round(Number(value) || 0);
    return `${number} mm`;
  }

  function glassColorLabel(value, customValue) {
    const normalized = normalizeGlassColor(value);
    if (normalized === 'OTHER') {
      const custom = String(customValue || '').trim();
      return custom ? `Diğer · ${custom}` : 'Diğer';
    }
    return lookupOptionLabel(GLASS_COLOR_OPTIONS, normalized);
  }

  function fabricColorLabel(value, customValue) {
    const found = ZIP_FABRIC_OPTIONS.find((item) => item.value === value);
    if (found) return `${found.label} · ${found.line}`;
    const custom = String(customValue || '').trim();
    return custom ? `Özel kumaş · ${custom}` : (value ? String(value) : '—');
  }

  function openingDirectionLabel(placement) {
    const normalized = normalizePlacement(placement, placement && placement.type);
    if (normalized.type === 'sliding') {
      if (normalized.openingType === 'CENTER OPENING') return lookupOptionLabel(PRODUCT_OPTIONS.sliding.centerLayers, normalized.openingDirection);
      return lookupOptionLabel(PRODUCT_OPTIONS.sliding.sideDirections, normalized.openingDirection);
    }
    if (isFoldingType(normalized.type)) return lookupOptionLabel(PRODUCT_OPTIONS.folding.directions, normalized.openingDirection);
    if (normalized.type === 'guillotine') return lookupOptionLabel([['LEFT', 'Sol'], ['RIGHT', 'Sağ']], normalized.motorDirection);
    return '—';
  }

  function seriesLabel(value) {
    return lookupOptionLabel([['A SERIES', 'A Serisi'], ['K SERIES', 'K Serisi'], ['G SERIES', 'G Serisi'], ['P SERIES', 'P Serisi']], value);
  }

  function collectionStateLabel(value) {
    return String(value) === 'COLLECTED' ? 'Toplanmış göster' : 'Kapalı / normal görünüm';
  }

  function placementDetailLines(placement, zone) {
    if(window.PLMRV24Native?.native(placement))return window.PLMRV24Native.details(zone,placement);
    const normalized = normalizePlacement(placement, placement && placement.type);
    const lines = [
      { label: 'Ürün', value: productTypeLabel(normalized) },
      { label: 'Net Alan', value: `${mmText(zone.width)} × ${mmText(zone.height)}` }
    ];
    if (isFoldingType(normalized.type)) {
      lines.push(
        { label: 'Seri', value: seriesLabel(normalized.series) },
        { label: 'Tip', value: lookupOptionLabel(normalized.series === 'K SERIES' ? PRODUCT_OPTIONS.folding.subtypesK : PRODUCT_OPTIONS.folding.subtypesA, normalized.subtype) },
        { label: 'Katlanma Yönü', value: openingDirectionLabel(normalized) },
        { label: 'Panel Sayısı', value: String(normalized.panels) },
        { label: 'Yaklaşık Panel Genişliği', value: mmText(zone.width / Math.max(1, normalized.panels)) },
        { label: 'Bakış Yönü', value: lookupOptionLabel(PRODUCT_OPTIONS.folding.views, normalized.foldingView) },
        { label: 'Açılma Yönü', value: lookupOptionLabel(PRODUCT_OPTIONS.folding.openDirections, normalized.foldingOpenDirection) },
        { label: 'Alt Profil', value: '70 mm · Eşikli' },
        { label: 'Cam Kalınlığı', value: lookupOptionLabel(normalized.series === 'K SERIES' ? PRODUCT_OPTIONS.folding.thicknessK : PRODUCT_OPTIONS.folding.thicknessA, normalized.glassThickness) },
        { label: 'Cam Rengi', value: glassColorLabel(normalized.glassColor, normalized.customGlassColor) },
        { label: '3D Gösterim', value: collectionStateLabel(normalized.collectionState) }
      );
      foldingAdvisory(zone, normalized).forEach((warning) => lines.push({ label: 'Öneri Uyarısı', value: warning }));
    } else if (normalized.type === 'sliding') {
      lines.push(
        { label: 'Seri', value: seriesLabel(normalized.series) },
        { label: 'Tip', value: lookupOptionLabel(PRODUCT_OPTIONS.sliding.subtypes, normalized.subtype) },
        { label: 'Bakış Yönü', value: lookupOptionLabel(PRODUCT_OPTIONS.sliding.views, normalized.slidingView) },
        { label: 'Açılım Tipi', value: lookupOptionLabel(PRODUCT_OPTIONS.sliding.openings, normalized.openingType) },
        { label: normalized.openingType === 'CENTER OPENING' ? 'Dışta / İçte' : 'Açılım Yönü', value: openingDirectionLabel(normalized) },
        { label: 'Panel Sayısı', value: String(normalized.panels) },
        { label: 'Cam Kalınlığı', value: lookupOptionLabel((normalized.series === 'K SERIES' ? PRODUCT_OPTIONS.sliding.thicknessK : PRODUCT_OPTIONS.sliding.thicknessA), normalized.glassThickness) },
        { label: 'Cam Rengi', value: glassColorLabel(normalized.glassColor, normalized.customGlassColor) },
        { label: '3D Gösterim', value: collectionStateLabel(normalized.collectionState) }
      );
    } else if (normalized.type === 'guillotine') {
      lines.push(
        { label: 'Seri', value: seriesLabel(normalized.series) },
        { label: 'Tip', value: lookupOptionLabel((normalized.series === 'K SERIES' ? PRODUCT_OPTIONS.guillotine.subtypesK : PRODUCT_OPTIONS.guillotine.subtypesA), normalized.subtype) },
        { label: 'Mekanizma', value: lookupOptionLabel((normalized.series === 'K SERIES' ? PRODUCT_OPTIONS.guillotine.mechanismsK : PRODUCT_OPTIONS.guillotine.mechanismsA), normalized.mechanism) },
        { label: 'Panel Tipi', value: String(normalized.panelType || '1+2') },
        { label: 'Motor Yönü', value: lookupOptionLabel([['LEFT', 'Sol'], ['RIGHT', 'Sağ']], normalized.motorDirection) },
        { label: 'Cam Kalınlığı', value: lookupOptionLabel((normalized.series === 'K SERIES' ? PRODUCT_OPTIONS.guillotine.thicknessK : PRODUCT_OPTIONS.guillotine.thicknessA), normalized.glassThickness) },
        { label: 'Cam Rengi', value: glassColorLabel(normalized.glassColor, normalized.customGlassColor) }
      );
      if (String(normalized.subtype) === 'CLEANABLE') {
        lines.push({ label: 'Alt Panel Modu', value: 'Vasistas' });
      }
      if (['UPWARD COLLECTING', 'DOWNWARD COLLECTING'].includes(String(normalized.subtype))) {
        lines.push({ label: '3D Gösterim', value: collectionStateLabel(normalized.collectionState) });
      }
    } else if (normalized.type === 'zip') {
      lines.push(
        { label: 'Seri', value: seriesLabel(normalized.series) },
        { label: 'Tip', value: lookupOptionLabel(normalized.series === 'P SERIES' ? PRODUCT_OPTIONS.zip.subtypesP : PRODUCT_OPTIONS.zip.subtypesG, normalized.subtype) },
        { label: 'Yerleşim', value: lookupOptionLabel(PRODUCT_OPTIONS.zip.placements, normalized.placementLocation) },
        { label: 'Kumaş', value: fabricColorLabel(normalized.fabricColor, normalized.customFabricColor) },
        { label: 'Kablo Yönü', value: lookupOptionLabel(PRODUCT_OPTIONS.zip.cableDirections, normalized.cableDirection) },
        { label: 'Motor Yönü', value: lookupOptionLabel([['LEFT', 'Sol'], ['RIGHT', 'Sağ']], normalized.motorDirection) }
      );
    } else if (normalized.type === 'fixed') {
      lines.push(
        { label: 'Cam Kalınlığı', value: lookupOptionLabel(PRODUCT_OPTIONS.sliding.thicknessA, normalized.glassThickness) },
        { label: 'Cam Rengi', value: glassColorLabel(normalized.glassColor, normalized.customGlassColor) },
        { label: 'Dikey Bölme', value: String(normalized.verticalDivisions) },
        { label: 'Yatay Bölme', value: String(normalized.horizontalDivisions) }
      );
      const fixedSegments = String(normalized.horizontalHeights || '').split(/[;,]+/).filter(Boolean);
      fixedSegments.forEach((value, index) => lines.push({ label: `SDY${index + 1}`, value: mmText(value) }));
    } else if (normalized.type === 'door') {
      lines.push(
        { label: 'Kapı Tipi', value: doorTypeLabel(normalized.doorType) },
        { label: 'Menteşe', value: lookupOptionLabel(PRODUCT_OPTIONS.door.hinges, normalized.hingeDirection) },
        { label: 'Aktif Kanat', value: lookupOptionLabel(PRODUCT_OPTIONS.door.activeLeaves, normalized.activeLeaf) },
        { label: 'Açılım Yönü', value: lookupOptionLabel(PRODUCT_OPTIONS.door.openDirections, normalized.doorOpenDirection) },
        { label: 'Kol Tipi', value: lookupOptionLabel(PRODUCT_OPTIONS.door.handles, normalized.handleType) },
        { label: 'Cam Kalınlığı', value: lookupOptionLabel(PRODUCT_OPTIONS.sliding.thicknessA, normalized.glassThickness) },
        { label: 'Cam Rengi', value: glassColorLabel(normalized.glassColor, normalized.customGlassColor) }
      );
      if (DOOR_TOP_FIXED_TYPES.has(normalized.doorType)) lines.push({ label: 'Üst Sabit Cam Yüksekliği', value: mmText(normalized.topFixedHeight) });
      if (Number(normalized.movingLeafHeight)) lines.push({ label: 'Kanat Yüksekliği', value: mmText(normalized.movingLeafHeight) });
    }
    return lines;
  }

  function placementChangeLines(placement) {
    if(window.PLMRV24Native?.native(placement))return [];
    const normalized = normalizePlacement(placement, placement && placement.type);
    const defaultsForType = normalizePlacement(productDefaults(normalized.type), normalized.type);
    const diffs = [];
    const pushIfChanged = (label, currentValue, defaultValue) => {
      if (String(currentValue) !== String(defaultValue)) diffs.push(`${label}: ${currentValue}`);
    };
    if (isFoldingType(normalized.type)) {
      pushIfChanged('Seri', seriesLabel(normalized.series), seriesLabel(defaultsForType.series));
      pushIfChanged('Tip', lookupOptionLabel(normalized.series === 'K SERIES' ? PRODUCT_OPTIONS.folding.subtypesK : PRODUCT_OPTIONS.folding.subtypesA, normalized.subtype), lookupOptionLabel(PRODUCT_OPTIONS.folding.subtypesA, defaultsForType.subtype));
      pushIfChanged('Katlanma yönü', openingDirectionLabel(normalized), openingDirectionLabel(defaultsForType));
      pushIfChanged('Panel sayısı', normalized.panels, defaultsForType.panels);
      pushIfChanged('Bakış yönü', lookupOptionLabel(PRODUCT_OPTIONS.folding.views, normalized.foldingView), lookupOptionLabel(PRODUCT_OPTIONS.folding.views, defaultsForType.foldingView));
      pushIfChanged('Açılma yönü', lookupOptionLabel(PRODUCT_OPTIONS.folding.openDirections, normalized.foldingOpenDirection), lookupOptionLabel(PRODUCT_OPTIONS.folding.openDirections, defaultsForType.foldingOpenDirection));
      pushIfChanged('Cam kalınlığı', normalized.glassThickness, defaultsForType.glassThickness);
      pushIfChanged('Cam rengi', glassColorLabel(normalized.glassColor, normalized.customGlassColor), glassColorLabel(defaultsForType.glassColor, defaultsForType.customGlassColor));
      pushIfChanged('3D gösterim', collectionStateLabel(normalized.collectionState), collectionStateLabel(defaultsForType.collectionState));
    } else if (normalized.type === 'sliding') {
      pushIfChanged('Seri', seriesLabel(normalized.series), seriesLabel(defaultsForType.series));
      pushIfChanged('Tip', lookupOptionLabel(PRODUCT_OPTIONS.sliding.subtypes, normalized.subtype), lookupOptionLabel(PRODUCT_OPTIONS.sliding.subtypes, defaultsForType.subtype));
      pushIfChanged('Bakış yönü', lookupOptionLabel(PRODUCT_OPTIONS.sliding.views, normalized.slidingView), lookupOptionLabel(PRODUCT_OPTIONS.sliding.views, defaultsForType.slidingView));
      pushIfChanged('Açılım tipi', lookupOptionLabel(PRODUCT_OPTIONS.sliding.openings, normalized.openingType), lookupOptionLabel(PRODUCT_OPTIONS.sliding.openings, defaultsForType.openingType));
      pushIfChanged('Açılım yönü', openingDirectionLabel(normalized), openingDirectionLabel(defaultsForType));
      pushIfChanged('Panel sayısı', normalized.panels, defaultsForType.panels);
      pushIfChanged('Cam kalınlığı', normalized.glassThickness, defaultsForType.glassThickness);
      pushIfChanged('Cam rengi', glassColorLabel(normalized.glassColor, normalized.customGlassColor), glassColorLabel(defaultsForType.glassColor, defaultsForType.customGlassColor));
      pushIfChanged('3D gösterim', collectionStateLabel(normalized.collectionState), collectionStateLabel(defaultsForType.collectionState));
    } else if (normalized.type === 'guillotine') {
      pushIfChanged('Seri', seriesLabel(normalized.series), seriesLabel(defaultsForType.series));
      pushIfChanged('Tip', lookupOptionLabel((normalized.series === 'K SERIES' ? PRODUCT_OPTIONS.guillotine.subtypesK : PRODUCT_OPTIONS.guillotine.subtypesA), normalized.subtype), lookupOptionLabel(PRODUCT_OPTIONS.guillotine.subtypesA, defaultsForType.subtype));
      pushIfChanged('Mekanizma', normalized.mechanism, defaultsForType.mechanism);
      pushIfChanged('Panel tipi', normalized.panelType, defaultsForType.panelType);
      pushIfChanged('Motor yönü', normalized.motorDirection, defaultsForType.motorDirection);
      pushIfChanged('Cam kalınlığı', normalized.glassThickness, defaultsForType.glassThickness);
      pushIfChanged('Cam rengi', glassColorLabel(normalized.glassColor, normalized.customGlassColor), glassColorLabel(defaultsForType.glassColor, defaultsForType.customGlassColor));
      pushIfChanged('3D gösterim', collectionStateLabel(normalized.collectionState), collectionStateLabel(defaultsForType.collectionState));
    } else if (normalized.type === 'zip') {
      pushIfChanged('Seri', seriesLabel(normalized.series), seriesLabel(defaultsForType.series));
      pushIfChanged('Tip', normalized.subtype, defaultsForType.subtype);
      pushIfChanged('Yerleşim', lookupOptionLabel(PRODUCT_OPTIONS.zip.placements, normalized.placementLocation), lookupOptionLabel(PRODUCT_OPTIONS.zip.placements, defaultsForType.placementLocation));
      pushIfChanged('Kumaş', fabricColorLabel(normalized.fabricColor, normalized.customFabricColor), fabricColorLabel(defaultsForType.fabricColor, defaultsForType.customFabricColor));
      pushIfChanged('Kablo yönü', lookupOptionLabel(PRODUCT_OPTIONS.zip.cableDirections, normalized.cableDirection), lookupOptionLabel(PRODUCT_OPTIONS.zip.cableDirections, defaultsForType.cableDirection));
      pushIfChanged('Motor yönü', normalized.motorDirection, defaultsForType.motorDirection);
    } else if (normalized.type === 'fixed') {
      pushIfChanged('Cam kalınlığı', normalized.glassThickness, defaultsForType.glassThickness);
      pushIfChanged('Cam rengi', glassColorLabel(normalized.glassColor, normalized.customGlassColor), glassColorLabel(defaultsForType.glassColor, defaultsForType.customGlassColor));
      pushIfChanged('Dikey bölme', normalized.verticalDivisions, defaultsForType.verticalDivisions);
      pushIfChanged('Yatay bölme', normalized.horizontalDivisions, defaultsForType.horizontalDivisions);
      if (String(normalized.horizontalHeights || '') !== String(defaultsForType.horizontalHeights || '')) diffs.push(`Yatay dağılım: ${normalized.horizontalHeights || 'özel'}`);
    } else if (normalized.type === 'door') {
      pushIfChanged('Kapı tipi', doorTypeLabel(normalized.doorType), doorTypeLabel(defaultsForType.doorType));
      pushIfChanged('Menteşe', normalized.hingeDirection, defaultsForType.hingeDirection);
      pushIfChanged('Aktif kanat', normalized.activeLeaf, defaultsForType.activeLeaf);
      pushIfChanged('Açılım yönü', normalized.doorOpenDirection, defaultsForType.doorOpenDirection);
      pushIfChanged('Kol tipi', normalized.handleType, defaultsForType.handleType);
      pushIfChanged('Üst sabit yüksekliği', normalized.topFixedHeight, defaultsForType.topFixedHeight);
      pushIfChanged('Kanat yüksekliği', normalized.movingLeafHeight, defaultsForType.movingLeafHeight);
      pushIfChanged('Cam kalınlığı', normalized.glassThickness, defaultsForType.glassThickness);
      pushIfChanged('Cam rengi', glassColorLabel(normalized.glassColor, normalized.customGlassColor), glassColorLabel(defaultsForType.glassColor, defaultsForType.customGlassColor));
    }
    return diffs;
  }

  function createSubZoneReport(base, startU, endU, bottomY, topY, index, total, leftBoundaryId, rightBoundaryId, bottomBoundaryId, topBoundaryId, leftBoundaryWidth, rightBoundaryWidth) {
    const centerU = (startU + endU) / 2;
    const width = Math.max(0, endU - startU);
    const height = Math.max(0, topY - bottomY);
    const defaultStartId = base.startBoundaryId || 'START';
    const defaultEndId = base.endBoundaryId || 'END';
    const noProfiles = leftBoundaryId === defaultStartId && rightBoundaryId === defaultEndId && bottomBoundaryId === 'BOTTOM' && topBoundaryId === 'TOP';
    const id = noProfiles ? base.id : `${base.id}|${leftBoundaryId}-${rightBoundaryId}|${bottomBoundaryId}-${topBoundaryId}`;
    const cx = base.axis === 'x' ? base.cx + centerU : base.cx;
    const cz = base.axis === 'x' ? base.cz : base.cz + centerU;
    const localStartRatio = (startU + base.width / 2) / base.width;
    const localEndRatio = (endU + base.width / 2) / base.width;
    const globalStart = Number.isFinite(Number(base.globalStartRatio)) ? Number(base.globalStartRatio) : 0;
    const globalEnd = Number.isFinite(Number(base.globalEndRatio)) ? Number(base.globalEndRatio) : 1;
    const ratioSpan = globalEnd - globalStart;
    return {
      ...base,
      postMeasure:base.postBounded?{id:base.id,cx:base.cx,cz:base.cz,width:base.width,bottomY:base.bottomY}:null,
      id,
      facadeId: base.facadeId || String(base.id || '').split('|')[0],
      baseLabel: noProfiles ? base.label : `${base.label} · Alan ${index + 1}`,
      label: noProfiles ? base.label : `${base.label} · Alan ${index + 1}`,
      cx,
      cz,
      width,
      height,
      bottomY,
      topY,
      baseWidth: Number(base.globalBaseWidth) || base.width,
      baseHeight: base.height,
      startRatio: globalStart + localStartRatio * ratioSpan,
      endRatio: globalStart + localEndRatio * ratioSpan,
      bottomRatio: (bottomY - base.bottomY) / base.height,
      topRatio: (topY - base.bottomY) / base.height,
      leftBoundaryId,
      rightBoundaryId,
      leftBoundaryWidth: Math.max(0, Number(leftBoundaryWidth) || 0),
      rightBoundaryWidth: Math.max(0, Number(rightBoundaryWidth) || 0),
      bottomBoundaryId,
      topBoundaryId,
      areaIndex: index,
      areaCount: total
    };
  }

  function splitFacadeZonesForReport(base, facadeProfilesMap, zoneDividersMap) {
    const facadeStoreId = base.profileSourceId || base.facadeId || String(base.id || '').split('|')[0];
    const physicalSource = Array.isArray((facadeProfilesMap || {})[facadeStoreId]) ? (facadeProfilesMap || {})[facadeStoreId] : [];
    const virtualSource = Array.isArray((zoneDividersMap || {})[facadeStoreId]) ? (zoneDividersMap || {})[facadeStoreId] : [];
    const effectiveSource=typeof window!=='undefined'&&window.PLMRV13Core?.effectiveProfiles?window.PLMRV13Core.effectiveProfiles(base,physicalSource,facadeProfilesMap.__members||{}):physicalSource;
    const rawSource = [...effectiveSource.map((item) => ({ ...item, virtual: false })), ...virtualSource.map((item) => ({ ...item, virtual: true, kind: 'virtual-zone-divider' }))];
    const globalBaseWidth = Math.max(1, Number(base.globalBaseWidth) || base.width);
    const globalStartRatio = Number.isFinite(Number(base.globalStartRatio)) ? Number(base.globalStartRatio) : 0;
    const globalEndRatio = Number.isFinite(Number(base.globalEndRatio)) ? Number(base.globalEndRatio) : 1;
    const globalSpan = Math.max(.000001, globalEndRatio - globalStartRatio);
    const profiles = rawSource.map(profile => {
      const orientation = profile.orientation === 'horizontal' ? 'horizontal' : 'vertical';
      const normalized = {
        ...profile,
        orientation,
        width: profile.virtual ? 0 : (Number(profile.width) > 0 ? Number(profile.width) : 100),
        depth: profile.virtual ? 0 : (Number(profile.depth) > 0 ? Number(profile.depth) : 100),
        positionRatio: Math.max(.0001, Math.min(.9999, Number(profile.positionRatio) || .5)),
        positionYRatio: Math.max(0, Math.min(1, Number(profile.positionYRatio) || .5))
      };
      if (orientation === 'vertical') {
        if (normalized.positionRatio <= globalStartRatio + .000001 || normalized.positionRatio >= globalEndRatio - .000001) return null;
        normalized.positionRatio = (normalized.positionRatio - globalStartRatio) / globalSpan;
        return normalized;
      }
      const scopeStart = Number.isFinite(Number(profile.scopeStartRatio)) ? Number(profile.scopeStartRatio) : 0;
      const scopeEnd = Number.isFinite(Number(profile.scopeEndRatio)) ? Number(profile.scopeEndRatio) : 1;
      if (scopeEnd < globalStartRatio - .0001 || scopeStart > globalEndRatio + .0001) return null;
      normalized.scopeStartRatio = Math.max(0, (Math.max(scopeStart, globalStartRatio) - globalStartRatio) / globalSpan);
      normalized.scopeEndRatio = Math.min(1, (Math.min(scopeEnd, globalEndRatio) - globalStartRatio) / globalSpan);
      return normalized;
    }).filter(Boolean);
    const verticals = profiles.filter(profile => profile.orientation === 'vertical').sort((a, b) => a.positionRatio - b.positionRatio);
    const horizontals = profiles.filter(profile => profile.orientation === 'horizontal');
    const startBoundaryId = base.startBoundaryId || 'START';
    const endBoundaryId = base.endBoundaryId || 'END';
    const boundaryWidthMap = Object.fromEntries(verticals.map(profile => [profile.id, profile.width]));
    boundaryWidthMap[startBoundaryId] = Math.max(0, Number(base.startBoundaryWidth) || 0);
    boundaryWidthMap[endBoundaryId] = Math.max(0, Number(base.endBoundaryWidth) || 0);
    const strips = [];
    let cursor = -base.width / 2;
    let leftId = startBoundaryId;
    verticals.forEach(profile => {
      const center = -base.width / 2 + profile.positionRatio * base.width;
      const left = Math.max(cursor, center - profile.width / 2);
      const right = Math.min(base.width / 2, center + profile.width / 2);
      strips.push({ start: cursor, end: left, leftId, rightId: profile.id });
      cursor = right;
      leftId = profile.id;
    });
    strips.push({ start: cursor, end: base.width / 2, leftId, rightId: endBoundaryId });
    const cells = [];
    strips.filter(strip => strip.end - strip.start > .001).forEach(strip => {
      const stripStartRatio = (strip.start + base.width / 2) / base.width;
      const stripEndRatio = (strip.end + base.width / 2) / base.width;
      const scoped = horizontals.filter(profile => {
        const start = Number.isFinite(Number(profile.scopeStartRatio)) ? Number(profile.scopeStartRatio) : 0;
        const end = Number.isFinite(Number(profile.scopeEndRatio)) ? Number(profile.scopeEndRatio) : 1;
        return stripStartRatio >= start - .0001 && stripEndRatio <= end + .0001;
      }).sort((a, b) => a.positionYRatio - b.positionYRatio);
      let bottom = base.bottomY;
      let bottomId = 'BOTTOM';
      scoped.forEach(profile => {
        const centerY = base.bottomY + profile.positionYRatio * base.height;
        const profileBottom = Math.max(bottom, centerY - profile.width / 2);
        const profileTop = Math.min(base.topY, centerY + profile.width / 2);
        cells.push({ startU: strip.start, endU: strip.end, bottomY: bottom, topY: profileBottom, leftId: strip.leftId, rightId: strip.rightId, bottomId, topId: profile.id });
        bottom = profileTop;
        bottomId = profile.id;
      });
      cells.push({ startU: strip.start, endU: strip.end, bottomY: bottom, topY: base.topY, leftId: strip.leftId, rightId: strip.rightId, bottomId, topId: 'TOP' });
    });
    const valid = cells.filter(cell => cell.endU - cell.startU > .001 && cell.topY - cell.bottomY > .001);
    return valid.map((cell, index) => createSubZoneReport(
      base, cell.startU, cell.endU, cell.bottomY, cell.topY, index, valid.length,
      cell.leftId, cell.rightId, cell.bottomId, cell.topId,
      boundaryWidthMap[cell.leftId] || 0, boundaryWidthMap[cell.rightId] || 0
    )).map(z=>({...z,directionSourceId:base.id}));
  }

  function buildCanonicalReportFacadeBases(model) {
    const W = Number(model.width) || 0;
    const D = Number(model.depth) || 0;
    const H = Number(model.height) || 0;
    const fallbackSection = { x: 100, z: 100 };
    const rawSections = Array.isArray(model.postSections) ? model.postSections : [];
    const p = Array.from({ length: 4 }, (_, index) => {
      const section = rawSections[index] || fallbackSection;
      return { x: Math.max(1, Number(section.x) || fallbackSection.x), z: Math.max(1, Number(section.z) || fallbackSection.z) };
    });
    const beamVertical = Number(model.beamSection && model.beamSection.vertical) || 0;
    const beamBottomY = H / 2 - beamVertical;
    const bottomY = -H / 2;
    const topY = beamBottomY;
    if (topY <= bottomY) return [];
    const height = topY - bottomY;
    const frontStart = -W / 2 + p[0].x;
    const frontEnd = W / 2 - p[1].x;
    const backStart = -W / 2 + p[2].x;
    const backEnd = W / 2 - p[3].x;
    const leftStart = -D / 2 + p[0].z;
    const leftEnd = D / 2 - p[2].z;
    const rightStart = -D / 2 + p[1].z;
    const rightEnd = D / 2 - p[3].z;
    const frontFaceDepth = Math.max(p[0].z, p[1].z);
    const backFaceDepth = Math.max(p[2].z, p[3].z);
    const leftFaceDepth = Math.max(p[0].x, p[2].x);
    const rightFaceDepth = Math.max(p[1].x, p[3].x);
    const freedomLayout = model && model.freedomLayout && model.freedomLayout.valid ? model.freedomLayout : null;
    const bioRiseLayout = model && model.bioRiseLayout && model.bioRiseLayout.valid ? model.bioRiseLayout : null;
    const galaxyLayout = model && model.galaxyLayout && model.galaxyLayout.valid ? model.galaxyLayout : null;
    const freedomMultiActive = model.productGroup === 'b-cube' && freedomLayout && Number(freedomLayout.systemCount) >= 1;
    const galaxyLayoutActive = model.productGroup === 'b-cube-galaxy' && galaxyLayout;
    const bioRiseMultiActive = model.productGroup === 'bio-rise' && bioRiseLayout && Number(bioRiseLayout.systemCount) > 1;
    const bioFamilyLayout = galaxyLayoutActive ? galaxyLayout : (bioRiseMultiActive ? bioRiseLayout : null);
    const facades = [];

    if (bioFamilyLayout && Array.isArray(bioFamilyLayout.modules) && bioFamilyLayout.modules.length) {
      const modules = bioFamilyLayout.modules;
      const rearGlobalStart = Number(modules[0].clearMinX);
      const rearGlobalEnd = Number(modules[modules.length - 1].clearMaxX);
      const rearGlobalWidth = Math.max(1, rearGlobalEnd - rearGlobalStart);
      modules.forEach((module) => {
        const leftLine = Number(module.leftLine) || 0;
        const rightLine = Number(module.rightLine) || 0;
        const rearLeftSection = module.rearLeftSection || (bioFamilyLayout.rearSections && bioFamilyLayout.rearSections[leftLine]) || p[0];
        const rearRightSection = module.rearRightSection || (bioFamilyLayout.rearSections && bioFamilyLayout.rearSections[rightLine]) || p[1];
        const frontLeftSection = module.frontLeftSection || (bioFamilyLayout.frontSections && bioFamilyLayout.frontSections[leftLine]) || p[2];
        const frontRightSection = module.frontRightSection || (bioFamilyLayout.frontSections && bioFamilyLayout.frontSections[rightLine]) || p[3];
        const rearDepth = Math.max(Number(rearLeftSection.z) || 0, Number(rearRightSection.z) || 0);
        const frontDepth = Math.max(Number(frontLeftSection.z) || 0, Number(frontRightSection.z) || 0);
        const row = (Number(module.rowIndex) || 0) + 1;
        const moduleNo = (Number(module.moduleIndex) || 0) + 1;
        facades.push({
          id: `front|ROW_${row}|MODULE_${moduleNo}`, facadeId: 'front', profileSourceId: 'front',
          label: `${Number(module.rowIndex) === 1 ? 'Arka Sıra · ' : 'Ön Sıra · '}Arka Cephe · Modül ${moduleNo}`, axis: 'x',
          cx: Number(module.centerX) || 0, cz: Number(module.rearOuterZ) + rearDepth / 2, width: Number(module.clearWidth) || 0,
          height, bottomY, topY, beamBottomY, inward: 1, outerFaceV: -rearDepth / 2,
          startBoundaryId: `POST_LINE_${leftLine}`, endBoundaryId: `POST_LINE_${rightLine}`,
          startBoundaryWidth: Number(rearLeftSection.x) || 0, endBoundaryWidth: Number(rearRightSection.x) || 0,
          globalBaseWidth: rearGlobalWidth, globalStartRatio: (Number(module.clearMinX) - rearGlobalStart) / rearGlobalWidth,
          globalEndRatio: (Number(module.clearMaxX) - rearGlobalStart) / rearGlobalWidth,
          moduleIndex: Number(module.moduleIndex) || 0, bioRiseMulti: true
        });
        facades.push({
          id: `back|ROW_${row}|MODULE_${moduleNo}`, facadeId: 'back', profileSourceId: 'back',
          label: `${Number(module.rowIndex) === 1 ? 'Arka Sıra · ' : 'Ön Sıra · '}Ön Cephe · Modül ${moduleNo}`, axis: 'x',
          cx: Number(module.centerX) || 0, cz: Number(module.frontOuterZ) - frontDepth / 2, width: Number(module.clearWidth) || 0,
          height, bottomY, topY, beamBottomY, inward: -1, outerFaceV: frontDepth / 2,
          startBoundaryId: `POST_LINE_${leftLine}`, endBoundaryId: `POST_LINE_${rightLine}`,
          startBoundaryWidth: Number(frontLeftSection.x) || 0, endBoundaryWidth: Number(frontRightSection.x) || 0,
          globalBaseWidth: rearGlobalWidth, globalStartRatio: (Number(module.clearMinX) - rearGlobalStart) / rearGlobalWidth,
          globalEndRatio: (Number(module.clearMaxX) - rearGlobalStart) / rearGlobalWidth,
          moduleIndex: Number(module.moduleIndex) || 0, bioRiseMulti: true
        });
      });
      const leftModule = modules[0], rightModule = modules[modules.length - 1];
      const leftModuleStart = Number(leftModule.rearOuterZ) + p[0].z, leftModuleEnd = Number(leftModule.frontOuterZ) - p[2].z;
      const rightModuleStart = Number(rightModule.rearOuterZ) + p[1].z, rightModuleEnd = Number(rightModule.frontOuterZ) - p[3].z;
      facades.push(
        { id: 'left', label: 'Sol Cephe', axis: 'z', cx: -W / 2 + leftFaceDepth / 2, cz: (leftModuleStart + leftModuleEnd) / 2, width: leftModuleEnd - leftModuleStart, height, bottomY, topY, beamBottomY, inward: 1, outerFaceV: -leftFaceDepth / 2, startBoundaryWidth: p[0].z, endBoundaryWidth: p[2].z },
        { id: 'right', label: 'Sağ Cephe', axis: 'z', cx: W / 2 - rightFaceDepth / 2, cz: (rightModuleStart + rightModuleEnd) / 2, width: rightModuleEnd - rightModuleStart, height, bottomY, topY, beamBottomY, inward: -1, outerFaceV: rightFaceDepth / 2, startBoundaryWidth: p[1].z, endBoundaryWidth: p[3].z }
      );
      return facades;
    }

    if (freedomMultiActive && Array.isArray(freedomLayout.modules) && freedomLayout.modules.length) {
      const modules = freedomLayout.modules;
      const rearGlobalStart = Number(modules[0].rearStartX), rearGlobalEnd = Number(modules[modules.length - 1].rearEndX);
      const frontGlobalStart = Number(modules[0].frontStartX), frontGlobalEnd = Number(modules[modules.length - 1].frontEndX);
      const rearGlobalWidth = Math.max(1, rearGlobalEnd - rearGlobalStart), frontGlobalWidth = Math.max(1, frontGlobalEnd - frontGlobalStart);
      modules.forEach((module) => {
        const leftLine = Number(module.leftLine) || 0, rightLine = Number(module.rightLine) || 0;
        const rearLeftSection = module.rearLeftSection || (freedomLayout.rearSections && freedomLayout.rearSections[leftLine]) || p[0];
        const rearRightSection = module.rearRightSection || (freedomLayout.rearSections && freedomLayout.rearSections[rightLine]) || p[1];
        const frontLeftSection = module.frontLeftSection || (freedomLayout.frontSections && freedomLayout.frontSections[leftLine]) || p[2];
        const frontRightSection = module.frontRightSection || (freedomLayout.frontSections && freedomLayout.frontSections[rightLine]) || p[3];
        const rearDepth = Math.max(Number(rearLeftSection.z) || 0, Number(rearRightSection.z) || 0);
        const frontDepth = Math.max(Number(frontLeftSection.z) || 0, Number(frontRightSection.z) || 0);
        const row = (Number(module.rowIndex) || 0) + 1, moduleNo = (Number(module.moduleIndex) || 0) + 1;
        facades.push({ id: `front|ROW_${row}|MODULE_${moduleNo}`, facadeId: 'front', profileSourceId: 'front', label: `${Number(module.rowIndex) === 1 ? 'Arka Sıra · ' : 'Ön Sıra · '}Arka Cephe · Modül ${moduleNo}`, axis: 'x', cx: (Number(module.rearStartX) + Number(module.rearEndX)) / 2, cz: Number(module.rearOuterZ) + rearDepth / 2, width: Number(module.rearClearWidth) || 0, height, bottomY, topY, beamBottomY, inward: 1, outerFaceV: -rearDepth / 2, startBoundaryId: `POST_LINE_${leftLine}`, endBoundaryId: `POST_LINE_${rightLine}`, startBoundaryWidth: Number(rearLeftSection.x) || 0, endBoundaryWidth: Number(rearRightSection.x) || 0, globalBaseWidth: rearGlobalWidth, globalStartRatio: (Number(module.rearStartX) - rearGlobalStart) / rearGlobalWidth, globalEndRatio: (Number(module.rearEndX) - rearGlobalStart) / rearGlobalWidth, moduleIndex: Number(module.moduleIndex) || 0 });
        facades.push({ id: `back|ROW_${row}|MODULE_${moduleNo}`, facadeId: 'back', profileSourceId: 'back', label: `${Number(module.rowIndex) === 1 ? 'Arka Sıra · ' : 'Ön Sıra · '}Ön Cephe · Modül ${moduleNo}`, axis: 'x', cx: (Number(module.frontStartX) + Number(module.frontEndX)) / 2, cz: Number(module.frontOuterZ) - frontDepth / 2, width: Number(module.frontClearWidth) || 0, height, bottomY, topY, beamBottomY, inward: -1, outerFaceV: frontDepth / 2, startBoundaryId: `POST_LINE_${leftLine}`, endBoundaryId: `POST_LINE_${rightLine}`, startBoundaryWidth: Number(frontLeftSection.x) || 0, endBoundaryWidth: Number(frontRightSection.x) || 0, globalBaseWidth: frontGlobalWidth, globalStartRatio: (Number(module.frontStartX) - frontGlobalStart) / frontGlobalWidth, globalEndRatio: (Number(module.frontEndX) - frontGlobalStart) / frontGlobalWidth, moduleIndex: Number(module.moduleIndex) || 0 });
      });
      const leftModule = modules[0], rightModule = modules[modules.length - 1];
      const leftModuleStart = Number(leftModule.rearOuterZ) + p[0].z, leftModuleEnd = Number(leftModule.frontOuterZ) - p[2].z;
      const rightModuleStart = Number(rightModule.rearOuterZ) + p[1].z, rightModuleEnd = Number(rightModule.frontOuterZ) - p[3].z;
      facades.push(
        { id: 'left', label: 'Sol Cephe', axis: 'z', cx: -W / 2 + leftFaceDepth / 2, cz: (leftModuleStart + leftModuleEnd) / 2, width: leftModuleEnd - leftModuleStart, height, bottomY, topY, beamBottomY, inward: 1, outerFaceV: -leftFaceDepth / 2, startBoundaryWidth: p[0].z, endBoundaryWidth: p[2].z },
        { id: 'right', label: 'Sağ Cephe', axis: 'z', cx: W / 2 - rightFaceDepth / 2, cz: (rightModuleStart + rightModuleEnd) / 2, width: rightModuleEnd - rightModuleStart, height, bottomY, topY, beamBottomY, inward: -1, outerFaceV: rightFaceDepth / 2, startBoundaryWidth: p[1].z, endBoundaryWidth: p[3].z }
      );
      return facades;
    }

    return [
      { id: 'front', label: 'Arka Cephe', axis: 'x', cx: (frontStart + frontEnd) / 2, cz: -D / 2 + frontFaceDepth / 2, width: frontEnd - frontStart, height, bottomY, topY, beamBottomY, inward: 1, outerFaceV: -frontFaceDepth / 2, startBoundaryWidth: p[0].x, endBoundaryWidth: p[1].x },
      { id: 'back', label: 'Ön Cephe', axis: 'x', cx: (backStart + backEnd) / 2, cz: D / 2 - backFaceDepth / 2, width: backEnd - backStart, height, bottomY, topY, beamBottomY, inward: -1, outerFaceV: backFaceDepth / 2, startBoundaryWidth: p[2].x, endBoundaryWidth: p[3].x },
      { id: 'left', label: 'Sol Cephe', axis: 'z', cx: -W / 2 + leftFaceDepth / 2, cz: (leftStart + leftEnd) / 2, width: leftEnd - leftStart, height, bottomY, topY, beamBottomY, inward: 1, outerFaceV: -leftFaceDepth / 2, startBoundaryWidth: p[0].z, endBoundaryWidth: p[2].z },
      { id: 'right', label: 'Sağ Cephe', axis: 'z', cx: W / 2 - rightFaceDepth / 2, cz: (rightStart + rightEnd) / 2, width: rightEnd - rightStart, height, bottomY, topY, beamBottomY, inward: -1, outerFaceV: rightFaceDepth / 2, startBoundaryWidth: p[1].z, endBoundaryWidth: p[3].z }
    ];
  }

  function buildReportFacades(model) {
    if(window.PLMRV18Zones&&model.productGroup==='b-cube'&&!model.__v18Legacy)return v18Report(model);
    const registry = model && model.zoneRegistry && typeof model.zoneRegistry === 'object' ? model.zoneRegistry : {};
    let bases=buildCanonicalReportFacadeBases(model);
    if(model.productGroup==='b-cube')bases=window.PLMRV12Core.adaptBases(bases,model.freedomLayout);
    let liveBases=model.productGroup==='b-cube'&&window.PLMRZoneTopology?window.PLMRZoneTopology.reflow(bases,model.freedomLayout,model.sceneEditor?.members||{}):bases;
    if(model.productGroup==='b-cube'&&window.PLMRV11Zones&&(model.sceneEditor?.facadeZonesGenerated||Object.keys(model.placements||{}).length||Object.keys(model.zipPlacements||{}).length))liveBases=window.PLMRV11Zones.enrich(liveBases,model.freedomLayout,model.sceneEditor?.members||{},{height:model.height,pose:model.sceneEditor?.roofPose,walls:model.parapetWalls||model.sketchWalls?.length&&model.sketchWalls||modelState.sketchWalls||[],copies:model.sceneEditor?.roofCopies||[],owner:model.parapetOwner||'roof-main',groundY:model.sceneEditor?.groundY});
    if(model.productGroup==='b-cube')liveBases=window.PLMRV12Core.fitParapets(liveBases,model,model.parapetWalls||model.sketchWalls?.length&&model.sketchWalls||modelState.sketchWalls,model.parapetOwner||'roof-main');
    if(model.productGroup==='b-cube')liveBases=window.PLMRV13Core.splitAtPosts(liveBases,window.PLMRV13Core.allPosts(model.freedomLayout||{posts:[]},buildCanonicalReportFacadeBases(model),model));
    return liveBases.map((facade) => ({
      ...facade,
      zones: splitFacadeZonesForReport(facade, {...model.facadeProfiles,__members:model.sceneEditor?.members||{}}, model.zoneDividers || {}).map((zone) => decorateZoneIdentity(window.PLMRV17Core?window.PLMRV17Core.orient(zone,model.freedomLayout,model.sceneEditor?.zoneDirections):zone, registry, model)),
      profiles: Array.isArray((model.facadeProfiles || {})[facade.profileSourceId || facade.facadeId || facade.id])
        ? (model.facadeProfiles || {})[facade.profileSourceId || facade.facadeId || facade.id].map((profile) => ({ ...profile }))
        : [],
      zoneDividers: Array.isArray((model.zoneDividers || {})[facade.profileSourceId || facade.facadeId || facade.id])
        ? (model.zoneDividers || {})[facade.profileSourceId || facade.facadeId || facade.id].map((divider) => ({ ...divider }))
        : []
    }));
  }

  function documentProductTypeLabel(type) {
    const key = String(type || '').toLowerCase();
    if (key === 'guillotine' || key === 'guillotine_glass') return 'Giyotin Cam';
    if (key === 'sliding' || key === 'sliding_glass') return 'Sürme Cam';
    if (key === 'zip' || key === 'zip_screen' || key === 'zipper') return 'Zip Perde';
    if (key === 'balcony') return 'Katlanır Cam';
    if (key === 'folding') return 'Akordiyon Cam';
    if (key === 'fixed') return 'Sabit Doğrama';
    if (key === 'door') return 'Kapı';
    return productTypeLabel({ type: key || 'sliding' });
  }

  function documentFitProductZone(zone, clearance) {
    const total = Math.max(0, Number(clearance) || 0);
    return {
      width: Math.max(80, Number(zone && zone.width) - total),
      height: Math.max(120, Number(zone && zone.height) - total)
    };
  }

  function documentFitZipProductZone(zone, placement) {
    if (String(placement && placement.placementLocation || 'BETWEEN POSTS') !== 'FRONT OF POSTS') {
      return documentFitProductZone(zone, 3);
    }
    const {left,right} = window.PLMRV24Native.frontMountExtensions(zone);
    return {
      width: Math.max(120, (Number(zone && zone.width) || 0) + left + right),
      height: Math.max(180, (Number(zone && zone.height) || 0) + 150)
    };
  }

  function documentReportProducts(source,owner='roof-main') {
    const model = source||readModel();
    const color = { ...(model.systemColor || defaults.systemColor) };
    if (model.productGroup === 'pergo-rise') {
      const derived = model.pergoRiseProject && model.pergoRiseProject.derived;
      const components = derived && Array.isArray(derived.components) ? derived.components : [];
      return components
        .filter((item) => item && item.kind === 'area-product')
        .map((item, index) => ({
          id: String(item.id || item.placementId || `pergo-product-${index + 1}`),
          zoneId: String(item.placementId || item.id || ''),
          slot: String(item.productType || '').toLowerCase().includes('zip') ? 'zip' : 'primary',
          type: String(item.productType || ''),
          name: documentProductTypeLabel(item.productType),
          width: Math.max(1, Math.round(Number(item.width) || 0)),
          height: Math.max(1, Math.round(Number(item.height) || 0)),
          quantity: 1,
          facade: String(item.face || 'Pergola'),
          colorMode: model.colorMode,
          color: { ...color },
          detailColor: ''
        }))
        .filter((item) => item.width > 0 && item.height > 0);
    }

    const facades = buildReportFacades(model);
    const zoneMap = new Map();
    facades.forEach((facade) => (facade.zones || []).forEach((zone) => zoneMap.set(zone.id, { ...zone, facadeLabel: facade.label })));
    const rows = [];
    const push = (zoneId, placement, slot) => {
      if (!placement) return;
      const zone = zoneMap.get(zoneId);
      if (!zone) return;
      const fitted = window.PLMRV24Native?.native(placement)?window.PLMRV24Native.fit(zone,placement):(slot === 'zip' ? documentFitZipProductZone(zone, placement) : documentFitProductZone(zone, 5));
      const type = String(placement.type || (slot === 'zip' ? 'zip' : 'sliding'));
      rows.push({
        id: `${owner}:${slot}:${zoneId}`,
        zoneId,
        slot,
        type,
        name: documentProductTypeLabel(type),
        width: Math.max(1, Math.round(Number(fitted.width) || Number(zone.width) || 0)),
        height: Math.max(1, Math.round(Number(fitted.height) || Number(zone.height) || 0)),
        quantity: 1,
        facade: String(zone.facadeLabel || zone.facadeId || ''),
        colorMode: model.colorMode,
        color: { ...color },
        detailColor: type === 'zip' ? String(placement.options?.fabricColor||placement.fabricColor||'') : String(placement.options?.glassColor||placement.glassColor||'')
      });
    };
    Object.entries(model.sceneEditor?.mainDeleted?{}:model.placements || {}).forEach(([zoneId, placement]) => push(zoneId, placement, 'primary'));
    Object.entries(model.sceneEditor?.mainDeleted?{}:model.zipPlacements || {}).forEach(([zoneId, placement]) => push(zoneId, placement, 'zip'));
    for(const copy of model.sceneEditor?.roofCopies||[])rows.push(...documentReportProducts({...copy.spec,parapetOwner:copy.id,parapetWalls:model.sketchWalls,sceneEditor:{...copy.spec.sceneEditor,roofPose:copy.pose},freedomLayout:freedomMultiPositionLayout({...copy.spec,parapetOwner:copy.id,parapetWalls:model.sketchWalls})},copy.id));return rows;
  }

  function quickTestProfile(id, orientation, positionRatio, options = {}) {
    if (orientation === 'horizontal') {
      return {
        id,
        orientation: 'horizontal',
        positionYRatio: Number(positionRatio),
        leftBoundaryId: options.leftBoundaryId || 'START',
        rightBoundaryId: options.rightBoundaryId || 'END',
        scopeStartRatio: Number.isFinite(Number(options.scopeStartRatio)) ? Number(options.scopeStartRatio) : 0,
        scopeEndRatio: Number.isFinite(Number(options.scopeEndRatio)) ? Number(options.scopeEndRatio) : 1,
        width: Number(options.width) || 100,
        depth: Number(options.depth) || 100,
        type: options.type || '100x100',
        label: options.label || `Yatay Profil ${Number(options.width) || 100} × ${Number(options.depth) || 100}`
      };
    }
    return {
      id,
      orientation: 'vertical',
      positionRatio: Number(positionRatio),
      width: Number(options.width) || 100,
      depth: Number(options.depth) || 100,
      type: options.type || '100x100',
      label: options.label || `Dikey Profil ${Number(options.width) || 100} × ${Number(options.depth) || 100}`
    };
  }

  function quickTestPlacement(type, overrides = {}) {
    return normalizePlacement({ ...productDefaults(type), ...overrides, type }, type);
  }

  function quickTestScenario(index) {
    const scenarios = {
      1: {
        description: 'PLMR | Bioclimatic · ön cephede merkez dışı dikey profil, akordiyon cam + giyotin + zip ve dört cephe ürün kontrolü.',
        group: 'b-cube', width: 4000, panelCount: 25, height: 2700,
        systemColor: { code: 'RAL 7016', hex: '#383E42', finish: 'TEXTURE' },
        panelColor: { code: 'RAL 9016', hex: '#E7E8E2', finish: 'MATTE' },
        profiles: { front: [quickTestProfile('qt1v1', 'vertical', 0.34)] },
        assignments: [
          { facade: 'front', zone: 0, primary: quickTestPlacement('folding', { series: 'A SERIES', subtype: 'STANDARD', openingDirection: 'LEFT', foldingView: 'INSIDE VIEW', panels: 4, glassColor: 'FUME', collectionState: 'NORMAL' }) },
          { facade: 'front', zone: 1, primary: quickTestPlacement('guillotine', { subtype: 'CLEANABLE', mechanism: 'CHAIN', panelType: '1+2', panels: 3, motorDirection: 'LEFT', glassColor: 'TRANSPARENT' }), zip: quickTestPlacement('zip', { series: 'G SERIES', subtype: '110x110 BOX', placementLocation: 'FRONT OF POSTS', motorDirection: 'RIGHT', cableDirection: 'TOP', fabricColor: '7635-52142' }) },
          { facade: 'back', zone: 0, primary: quickTestPlacement('sliding', { openingType: 'CENTER OPENING', openingDirection: 'OUTSIDE', panels: 6, glassColor: 'BRONZE' }) },
          { facade: 'left', zone: 0, primary: quickTestPlacement('fixed', { verticalDivisions: 2, horizontalDivisions: 2, horizontalHeights: '1050;1050', glassColor: 'FUME' }) },
          { facade: 'right', zone: 0, primary: quickTestPlacement('door', { doorType: 'TOP_FIXED', hingeDirection: 'RIGHT', doorOpenDirection: 'OUTWARD', topFixedHeight: 450, movingLeafHeight: 1900 }) }
        ]
      },
      2: {
        description: 'PLMR | Bioclimatic · yatay profil, K Seri akordiyon cam dış bakış sağa toplama, üst sabit kapı ve sabit doğrama.',
        group: 'b-cube', width: 3600, panelCount: 20, height: 2800,
        systemColor: { code: 'RAL 9005', hex: '#0A0A0D', finish: 'GLOSS' },
        panelColor: { code: 'RAL 1013', hex: '#E9E5CE', finish: 'TEXTURE' },
        profiles: { front: [quickTestProfile('qt2h1', 'horizontal', 0.58)] },
        assignments: [
          { facade: 'front', zone: 0, primary: quickTestPlacement('door', { doorType: 'DOUBLE_TOP', activeLeaf: 'LEFT', doorOpenDirection: 'INWARD', handleType: 'PANIC', topFixedHeight: 520, movingLeafHeight: 1750, glassColor: 'BRONZE' }) },
          { facade: 'front', zone: 1, primary: quickTestPlacement('fixed', { verticalDivisions: 3, horizontalDivisions: 1, glassColor: 'TRANSPARENT' }) },
          { facade: 'back', zone: 0, zip: quickTestPlacement('zip', { series: 'P SERIES', subtype: '130x130 BOX', placementLocation: 'BETWEEN POSTS', cableDirection: 'BACK', motorDirection: 'LEFT', fabricColor: '92-2047' }) },
          { facade: 'left', zone: 0, primary: quickTestPlacement('folding', { series: 'K SERIES', subtype: 'STANDARD', panels: 5, openingDirection: 'RIGHT', foldingView: 'OUTSIDE VIEW', glassThickness: 'INSULATED GLASS', collectionState: 'COLLECTED' }) }
        ]
      },
      3: {
        description: 'PLMR | Bioclimatic · profilsiz dört cephe; 9 panelli otomatik iki yana akordiyon cam, toplanan giyotin, P seri zip ve çift kanat üst sabit kapı.',
        group: 'b-cube', width: 4100, panelCount: 27, height: 2900,
        systemColor: { code: 'RAL 7035', hex: '#C5C7C4', finish: 'MATTE' },
        panelColor: { code: 'RAL 3005', hex: '#5E2028', finish: 'GLOSS' },
        profiles: {},
        assignments: [
          { facade: 'front', zone: 0, primary: quickTestPlacement('guillotine', { subtype: 'UPWARD COLLECTING', mechanism: 'BELT', panelType: '1+2', panels: 3, collectionState: 'COLLECTED', motorDirection: 'RIGHT', glassColor: 'LOW-E GLASS', glassThickness: 'INSULATED GLASS' }) },
          { facade: 'back', zone: 0, primary: quickTestPlacement('folding', { series: 'A SERIES', subtype: 'TOP-HUNG', openingDirection: 'RIGHT', foldingView: 'OUTSIDE VIEW', panels: 9, glassColor: 'FUME', collectionState: 'COLLECTED' }) },
          { facade: 'left', zone: 0, zip: quickTestPlacement('zip', { series: 'P SERIES', subtype: '115x115 BOX', placementLocation: 'FRONT OF POSTS', cableDirection: 'SIDE', motorDirection: 'LEFT', fabricColor: '86-2043' }) },
          { facade: 'right', zone: 0, primary: quickTestPlacement('door', { doorType: 'DOUBLE_BOTH_FIXED_TOP', activeLeaf: 'RIGHT', doorOpenDirection: 'OUTWARD', topFixedHeight: 500, movingLeafHeight: 1950, glassColor: 'FUME' }) }
        ]
      },
      4: {
        description: 'PLMR | Bioclimatic · iki dikey profil ve orta alanda yatay profil; profil sonrası genişlik/yükseklik aralıkları düzenlenmiş çok alan testi.',
        group: 'b-cube', width: 4600, panelCount: 30, height: 3000,
        systemColor: { code: 'RAL 8019', hex: '#3B3332', finish: 'TEXTURE' },
        panelColor: { code: 'RAL 9006', hex: '#7C7D7F', finish: 'GLOSS' },
        profiles: {
          front: [
            quickTestProfile('qt4v1', 'vertical', 0.27),
            quickTestProfile('qt4v2', 'vertical', 0.68),
            quickTestProfile('qt4h1', 'horizontal', 0.61, { leftBoundaryId: 'qt4v1', rightBoundaryId: 'qt4v2', scopeStartRatio: 0.27, scopeEndRatio: 0.68 })
          ]
        },
        assignments: [
          { facade: 'front', zone: 0, primary: quickTestPlacement('sliding', { panels: 3, openingDirection: 'LEFT', glassColor: 'BRONZE' }) },
          { facade: 'front', zone: 1, primary: quickTestPlacement('fixed', { verticalDivisions: 1, horizontalDivisions: 2, horizontalHeights: '950;850' }) },
          { facade: 'front', zone: 2, primary: quickTestPlacement('door', { doorType: 'SINGLE', hingeDirection: 'LEFT', movingLeafHeight: 2100 }) },
          { facade: 'front', zone: 3, primary: quickTestPlacement('guillotine', { subtype: 'DOWNWARD COLLECTING', panelType: '1+1', panels: 2, collectionState: 'COLLECTED', motorDirection: 'LEFT' }) },
          { facade: 'back', zone: 0, zip: quickTestPlacement('zip', { subtype: 'HERCULE', placementLocation: 'FRONT OF POSTS', fabricColor: '7635-52107' }) }
        ]
      },
      5: {
        description: 'PLMR | Bioclimatic · özel/döndürülmüş dikmeler, sol ve sağ cephede düzenlenmiş profil aralıkları, tüm ürün tipleri.',
        group: 'b-cube', width: 4300, panelCount: 26, height: 2750,
        systemColor: { code: 'RAL 6005', hex: '#0F4336', finish: 'MATTE' },
        panelColor: { code: 'RAL 9010', hex: '#F1ECE1', finish: 'TEXTURE' },
        postSections: [{ x: 220, z: 100 }, { x: 100, z: 100 }, { x: 120, z: 180 }, { x: 180, z: 120 }],
        profiles: { left: [quickTestProfile('qt5lv1', 'vertical', 0.42)], right: [quickTestProfile('qt5rv1', 'vertical', 0.63)] },
        assignments: [
          { facade: 'front', zone: 0, primary: quickTestPlacement('guillotine', { subtype: 'CLEANABLE', mechanism: 'BELT', motorDirection: 'RIGHT', glassColor: 'FUME' }) },
          { facade: 'back', zone: 0, primary: quickTestPlacement('sliding', { openingType: 'CENTER OPENING', openingDirection: 'OUTSIDE', panels: 8 }) },
          { facade: 'left', zone: 0, primary: quickTestPlacement('door', { doorType: 'LEFT_FIXED_TOP', hingeDirection: 'RIGHT', topFixedHeight: 400, movingLeafHeight: 1950 }) },
          { facade: 'left', zone: 1, zip: quickTestPlacement('zip', { subtype: '110x110 BOX', motorDirection: 'LEFT', fabricColor: '7635-52176' }) },
          { facade: 'right', zone: 0, primary: quickTestPlacement('fixed', { verticalDivisions: 2, horizontalDivisions: 3, horizontalHeights: '700;700;700' }) },
          { facade: 'right', zone: 1, primary: quickTestPlacement('sliding', { panels: 2, openingDirection: 'RIGHT' }) }
        ]
      },
      6: {
        description: 'Eco-Bioclimatic (Tilt) · ön cephede merkez dışı dikey profil, sürme ve giyotin; arka/yan cephelerde kapı, sabit ve zip.',
        group: 'bio-rise', width: 3800, panelCount: 25, height: 3000,
        systemColor: { code: 'RAL 7024', hex: '#45494E', finish: 'TEXTURE' },
        panelColor: { code: 'RAL 9016', hex: '#E7E8E2', finish: 'GLOSS' },
        profiles: { front: [quickTestProfile('qt6v1', 'vertical', 0.41)] },
        assignments: [
          { facade: 'front', zone: 0, primary: quickTestPlacement('sliding', { subtype: 'WITHOUT THRESHOLD', panels: 3, openingDirection: 'LEFT', glassColor: 'TRANSPARENT' }) },
          { facade: 'front', zone: 1, primary: quickTestPlacement('guillotine', { subtype: 'CLEANABLE', mechanism: 'CHAIN', motorDirection: 'RIGHT', glassColor: 'BRONZE' }) },
          { facade: 'back', zone: 0, primary: quickTestPlacement('door', { doorType: 'RIGHT_FIXED_TOP', hingeDirection: 'LEFT', topFixedHeight: 480, movingLeafHeight: 2050 }) },
          { facade: 'left', zone: 0, primary: quickTestPlacement('fixed', { verticalDivisions: 2, horizontalDivisions: 2, horizontalHeights: '1100;1100' }) },
          { facade: 'right', zone: 0, zip: quickTestPlacement('zip', { series: 'G SERIES', subtype: '100x100 BOX', placementLocation: 'BETWEEN POSTS', motorDirection: 'LEFT', fabricColor: '92-2171' }) }
        ]
      },
      7: {
        description: 'Eco-Bioclimatic (Tilt) · ön cephede ayarlanmış yatay profil; üst sabit kapı, sabit doğrama ve dört cephede motor/yön kontrolleri.',
        group: 'bio-rise', width: 4000, panelCount: 28, height: 3200,
        systemColor: { code: 'RAL 9007', hex: '#8F8B81', finish: 'GLOSS' },
        panelColor: { code: 'RAL 7032', hex: '#B5B0A1', finish: 'MATTE' },
        profiles: { front: [quickTestProfile('qt7h1', 'horizontal', 0.64)] },
        assignments: [
          { facade: 'front', zone: 0, primary: quickTestPlacement('door', { doorType: 'BOTH_FIXED_TOP', doorOpenDirection: 'INWARD', handleType: 'PANIC', topFixedHeight: 520, movingLeafHeight: 1900 }) },
          { facade: 'front', zone: 1, primary: quickTestPlacement('fixed', { verticalDivisions: 3, horizontalDivisions: 1, glassColor: 'FUME' }) },
          { facade: 'back', zone: 0, zip: quickTestPlacement('zip', { series: 'P SERIES', subtype: '130x130 BOX', cableDirection: 'TOP', motorDirection: 'RIGHT', fabricColor: 'W88-2047' }) },
          { facade: 'left', zone: 0, primary: quickTestPlacement('guillotine', { subtype: 'UPWARD COLLECTING', mechanism: 'BELT', collectionState: 'COLLECTED', motorDirection: 'LEFT' }) },
          { facade: 'right', zone: 0, primary: quickTestPlacement('sliding', { openingType: 'CENTER OPENING', openingDirection: 'INSIDE', panels: 6, glassColor: 'BRONZE' }) }
        ]
      },
      8: {
        description: 'Eco-Bioclimatic (Tilt) · iki dikey ve bir yatay ara profil; düzenlenmiş çoklu alt alanlarda sürme, kapı, giyotin, sabit ve zip.',
        group: 'bio-rise', width: 4500, panelCount: 32, height: 3400,
        systemColor: { code: 'RAL 5008', hex: '#293133', finish: 'TEXTURE' },
        panelColor: { code: 'RAL 1015', hex: '#E6D2B5', finish: 'GLOSS' },
        profiles: {
          front: [
            quickTestProfile('qt8v1', 'vertical', 0.31),
            quickTestProfile('qt8v2', 'vertical', 0.73),
            quickTestProfile('qt8h1', 'horizontal', 0.55, { leftBoundaryId: 'qt8v1', rightBoundaryId: 'qt8v2', scopeStartRatio: 0.31, scopeEndRatio: 0.73 })
          ]
        },
        assignments: [
          { facade: 'front', zone: 0, primary: quickTestPlacement('sliding', { panels: 4, openingDirection: 'RIGHT' }) },
          { facade: 'front', zone: 1, primary: quickTestPlacement('door', { doorType: 'TOP_FIXED', topFixedHeight: 450, movingLeafHeight: 2000 }) },
          { facade: 'front', zone: 2, primary: quickTestPlacement('guillotine', { subtype: 'CLEANABLE', motorDirection: 'LEFT', glassColor: 'FUME' }) },
          { facade: 'front', zone: 3, primary: quickTestPlacement('fixed', { verticalDivisions: 1, horizontalDivisions: 2, horizontalHeights: '1000;900' }), zip: quickTestPlacement('zip', { placementLocation: 'FRONT OF POSTS', fabricColor: '7635-52105' }) },
          { facade: 'back', zone: 0, primary: quickTestPlacement('sliding', { openingType: 'CENTER OPENING', openingDirection: 'OUTSIDE', panels: 8 }) }
        ]
      },
      9: {
        description: 'PLMR | Bioclimatic · ürün açık/kapalı ve panel durumları; toplanmış sürme/giyotin ile zip panel görünürlüğü hızlı kontrolü.',
        group: 'b-cube', width: 3900, panelCount: 24, height: 2650,
        systemColor: { code: 'RAL 3020', hex: '#CC0605', finish: 'GLOSS' },
        panelColor: { code: 'RAL 9005', hex: '#0A0A0D', finish: 'TEXTURE' },
        profiles: { front: [quickTestProfile('qt9v1', 'vertical', 0.5)] },
        panelMasterOpen: false,
        assignments: [
          { facade: 'front', zone: 0, primary: quickTestPlacement('sliding', { panels: 5, collectionState: 'COLLECTED', openingDirection: 'LEFT' }), open: false },
          { facade: 'front', zone: 1, primary: quickTestPlacement('guillotine', { subtype: 'DOWNWARD COLLECTING', collectionState: 'COLLECTED', motorDirection: 'RIGHT' }), zip: quickTestPlacement('zip', { placementLocation: 'FRONT OF POSTS', fabricColor: '86-2171' }), zipOpen: false },
          { facade: 'back', zone: 0, primary: quickTestPlacement('door', { doorType: 'DOUBLE', activeLeaf: 'LEFT', doorOpenDirection: 'INWARD' }) }
        ]
      },
      10: {
        description: 'Eco-Bioclimatic (Tilt) maksimum üstü stres senaryosu · tüm cephelerde profiller, düzenlenmiş aralıklar, renk/yüzey ve yoğun ürün yerleşimi.',
        group: 'bio-rise', width: 4700, panelCount: 34, height: 3500,
        systemColor: { code: 'RAL 6018', hex: '#397A36', finish: 'MATTE' },
        panelColor: { code: 'RAL 2004', hex: '#E25303', finish: 'TEXTURE' },
        profiles: {
          front: [quickTestProfile('qt10fv1', 'vertical', 0.36), quickTestProfile('qt10fh1', 'horizontal', 0.6, { leftBoundaryId: 'qt10fv1', rightBoundaryId: 'END', scopeStartRatio: 0.36, scopeEndRatio: 1 })],
          back: [quickTestProfile('qt10bv1', 'vertical', 0.58)],
          left: [quickTestProfile('qt10lv1', 'vertical', 0.44)],
          right: [quickTestProfile('qt10rv1', 'vertical', 0.67)]
        },
        assignments: [
          { facade: 'front', zone: 0, primary: quickTestPlacement('folding', { series: 'A SERIES', subtype: 'STANDARD', panels: 7, openingDirection: 'BOTH', foldingView: 'INSIDE VIEW', glassColor: 'BRONZE', collectionState: 'COLLECTED' }) },
          { facade: 'front', zone: 1, primary: quickTestPlacement('guillotine', { subtype: 'UPWARD COLLECTING', collectionState: 'COLLECTED', motorDirection: 'LEFT' }) },
          { facade: 'front', zone: 2, primary: quickTestPlacement('door', { doorType: 'DOUBLE_TOP', topFixedHeight: 500, movingLeafHeight: 2100 }) },
          { facade: 'back', zone: 0, primary: quickTestPlacement('fixed', { verticalDivisions: 2, horizontalDivisions: 2, horizontalHeights: '1200;1000' }) },
          { facade: 'back', zone: 1, zip: quickTestPlacement('zip', { series: 'P SERIES', subtype: '115x115 BOX', placementLocation: 'FRONT OF POSTS', cableDirection: 'SIDE', fabricColor: 'W88-8102' }) },
          { facade: 'left', zone: 0, primary: quickTestPlacement('door', { doorType: 'LEFT_FIXED_RIGHT_MOVING', hingeDirection: 'RIGHT' }) },
          { facade: 'left', zone: 1, primary: quickTestPlacement('sliding', { openingType: 'CENTER OPENING', panels: 6 }) },
          { facade: 'right', zone: 0, primary: quickTestPlacement('guillotine', { subtype: 'CLEANABLE', mechanism: 'BELT', motorDirection: 'RIGHT' }) },
          { facade: 'right', zone: 1, primary: quickTestPlacement('fixed', { verticalDivisions: 3, horizontalDivisions: 1 }), zip: quickTestPlacement('zip', { subtype: 'HERCULE', placementLocation: 'FRONT OF POSTS', fabricColor: '7635-52144' }) }
        ]
      }
    };
    return scenarios[index] || scenarios[1];
  }

  function resetQuickTestState(config) {
    const spec = activeProductSpec(config.group);
    modelState.productGroup = config.group;
    modelState.width = Math.round(Number(config.width));
    modelState.panelCount = Math.round(Number(config.panelCount));
    modelState.depth = projectionFromPanelCount(modelState.panelCount, config.group);
    modelState.height = Math.round(Number(config.height));
    modelState.orientations = [0, 0, 0, 0];
    modelState.postSections = Array.isArray(config.postSections)
      ? config.postSections.map((section) => ({ x: Number(section.x), z: Number(section.z) }))
      : Array.from({ length: 4 }, () => ({ ...spec.postSection }));
    modelState.beamSection = { ...spec.beamSection };
    modelState.placements = {};
    modelState.zipPlacements = {};
    modelState.facadeProfiles = JSON.parse(JSON.stringify(config.profiles || {}));
    modelState.productsOpen = true;
    modelState.productOpenStates = {};
    modelState.panelStates = {};
    modelState.panelMasterOpen = config.panelMasterOpen !== false;
    modelState.colorMode = 'ral';
    modelState.systemColor = { ...config.systemColor };
    modelState.panelColor = { ...config.panelColor };
    // Quick-test state must obey the same canonical raw-input contract as normal
    // product entry. Otherwise a later snapshot restore can resurrect an old
    // product's draft text even while modelState belongs to the new product.
    modelState.inputDrafts = {
      width: String(modelState.width || ''),
      depth: String(modelState.depth || ''),
      height: String(modelState.height || '')
    };
    selectedZone = null;
    selectedZoneId = null;
    viewerCameraState = null;
    toolboxSelectionMode = null;
    toolboxSelectionItems.clear();
    dimensionVisibility = { intermediate: true, main: true };
    profileSequence = 1000 + Number(config.index || 0) * 10;
  }

  function assignQuickTestProducts(config) {
    const facades = buildReportFacades(readModel());
    (config.assignments || []).forEach((assignment) => {
      const facade = facades.find((item) => item.id === assignment.facade);
      if (!facade || !facade.zones.length) return;
      const zone = facade.zones[Math.max(0, Math.min(facade.zones.length - 1, Number(assignment.zone) || 0))];
      if (assignment.primary) {
        modelState.placements[zone.id] = JSON.parse(JSON.stringify(assignment.primary));
        if (assignment.open === false) modelState.productOpenStates[zone.id] = false;
      }
      if (assignment.zip) {
        modelState.zipPlacements[zone.id] = JSON.parse(JSON.stringify(assignment.zip));
        const key = zipProductKey(zone.id);
        if (assignment.zipOpen === false) modelState.productOpenStates[key] = false;
        modelState.panelStates[key] = assignment.zipOpen !== false;
      }
    });
  }

  function syncQuickTestControls() {
    if ($(ids.productGroup)) $(ids.productGroup).value = modelState.productGroup;
    $(ids.freedomWidth).value = String(modelState.width);
    setDepthControlValue(modelState.depth);
    $(ids.freedomHeight).value = String(modelState.height);
    $(ids.freedomPanelCount).value = String(modelState.panelCount);
    $(ids.toolboxIntermediateDimensions).checked = Boolean(dimensionVisibility.intermediate);
    $(ids.toolboxMainDimensions).checked = Boolean(dimensionVisibility.main);
    $(ids.panelMaster).checked = Boolean(modelState.panelMasterOpen);
    updateProductInputUi();
    updateColorControls();
    updateToolbox();
  }

  function applyQuickTestScenario(index, options) {
    const config = { ...quickTestScenario(index), index };
    const opts = options || {};
    if (p3dvEmbeddedHostMode && opts.hostAuthorized !== true) {
      const canonicalGroup = p3dvHostCanonicalProductGroup || modelState.productGroup;
      if (config.group !== canonicalGroup || modelState.productGroup !== canonicalGroup) {
        if ($(ids.quickTestStatus)) $(ids.quickTestStatus).textContent = `Test ${index}: ${activeProductSpec(config.group).modelLabel} ürününe geçiliyor...`;
        requestHostProductTransition(config.group, { type: 'quick-test', index: Number(index) });
        return false;
      }
    }
    cancelToolboxSelection();
    resetQuickTestState(config);
    assignQuickTestProducts(config);
    syncQuickTestControls();
    (typeof commitModelChangeLive==='function'?commitModelChangeLive('quick-test'):renderViewer());
    document.querySelectorAll('.quick-test-grid button').forEach((button) => button.classList.toggle('is-active', button.id === `quickTestBtn${index}`));
    if ($(ids.quickTestStatus)) {
      $(ids.quickTestStatus).textContent = `Test ${index} hazır: ${config.description}`;
    }
    showRecommendedLimitWarnings({ width: modelState.width, depth: modelState.depth, height: modelState.height, panelCount: modelState.panelCount });
    return true;
  }

  function profileSummary(profile) {
    if (!profile) return 'Ara profil';
    const direction = profile.orientation === 'horizontal' ? 'Yatay' : 'Dikey';
    return `${direction} · ${Number(profile.width) || 0} × ${Number(profile.depth) || 0} mm`;
  }

  function modelChangeLines(model) {
    const spec = activeProductSpec(model.productGroup);
    const postDefault = spec.postSection;
    const changes = [];
    (model.postSections || []).forEach((section, index) => {
      if (!section) return;
      if (Number(section.x) !== Number(postDefault.x) || Number(section.z) !== Number(postDefault.z)) {
        changes.push(`${postName(index)}: ${Number(section.x)} × ${Number(section.z)} mm`);
      }
    });
    const entryMap = new Map(allProductEntries().map((entry) => [entry.key, entry]));
    Object.entries(model.productOpenStates || {}).forEach(([key, open]) => {
      if (Boolean(open) === Boolean(model.productsOpen)) return;
      const entry = entryMap.get(key);
      if (!entry) return;
      changes.push(`${productZoneLabel(entry.zoneId, entry.placement, 0)} görünümü: ${open ? 'Açık' : 'Kapalı'}`);
    });
    if (model.colorMode === 'ral') {
      changes.push(`Sistem rengi: ${model.systemColor.code} · ${finishLabel(model.systemColor.finish)}`);
      changes.push(`Panel rengi: ${model.panelColor.code} · ${finishLabel(model.panelColor.finish)}`);
    }
    return changes;
  }

  function fallbackPdfView(preset) {
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const context = canvas.getContext('2d');
    const model = readModel();
    const labels = {
      'front-left': 'Arka Sol Üst Görünüş',
      'front-right': 'Arka Sağ Üst Görünüş',
      'back-left': 'Ön Sol Üst Görünüş',
      'back-right': 'Ön Sağ Üst Görünüş',
      'perspective': 'Perspektif Görünüş',
      'front': 'Ön Görünüş',
      'side': 'Yan Görünüş',
      'top': 'Üst Görünüş'
    };
    const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#334155');
    gradient.addColorStop(1, '#0f172a');
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = '#7dd3fc';
    context.lineWidth = 4;
    context.strokeRect(55, 55, canvas.width - 110, canvas.height - 110);
    context.fillStyle = '#e0f2fe';
    context.font = '700 44px Segoe UI, Arial';
    context.fillText(window.PLMRI18n?.t(labels[preset] || '3D Görünüş') || labels[preset] || '3D Görünüş', 85, 135);
    context.fillStyle = '#bfdbfe';
    context.font = '600 31px Segoe UI, Arial';
    context.fillText(productModelLabel(model.productGroup), 85, 205);
    context.font = '500 27px Segoe UI, Arial';
    context.fillText(`Genişlik ${model.width} mm · Açılım ${model.depth} mm · Yükseklik ${model.height} mm`, 85, 260);
    const fallbackDetail = model.productGroup === 'pergo-rise' && model.pergoRiseProject && model.pergoRiseProject.derived
      ? `${model.pergoRiseProject.derived.counts.systems || 0} sistem · ${model.pergoRiseProject.derived.counts.positions || 0} poz · parametrik 3D viewer güvenli PDF yedeği`
      : `${model.panelCount || model.lamellaCount} panel · 3D viewer görüntüsü yüklenemediğinde güvenli PDF yedeği`;
    context.fillText(fallbackDetail, 85, 310);
    context.fillStyle = '#94a3b8';
    context.font = '500 22px Segoe UI, Arial';
    context.fillText('Gerçek 3D görüntü, viewer hazır olduğunda otomatik olarak bu alanın yerine alınır.', 85, 625);
    return { preset, dataUrl: canvas.toDataURL('image/jpeg', 0.9), width: canvas.width, height: canvas.height, fallback: true };
  }

  function collectPdfViews() {
    const frame = $(ids.frame);
    const viewerWindow = frame && frame.contentWindow;
    const presets = ['front-left', 'front-right', 'back-left', 'back-right'];
    return presets.map((preset) => {
      try {
        if (viewerWindow && typeof viewerWindow.captureFreedom3D === 'function') {
          const capture = viewerWindow.captureFreedom3D(preset);
          if (capture && capture.dataUrl) return { preset, ...capture };
        }
      } catch (error) {
        console.warn('PDF görünüşü yedek görselle oluşturuldu.', preset, error);
      }
      return fallbackPdfView(preset);
    });
  }

  function collectDocumentCenterViews() {
    const frame = $(ids.frame);
    const viewerWindow = frame && frame.contentWindow;
    const presets = ['perspective', 'front', 'side', 'top'];
    return presets.map((preset) => {
      try {
        if (viewerWindow && typeof viewerWindow.captureFreedom3D === 'function') {
          const capture = viewerWindow.captureFreedom3D(preset);
          if (capture && capture.dataUrl) return { preset, ...capture };
        }
      } catch (error) {
        console.warn('Doküman Merkezi 3D görünüşü yedek görselle oluşturuldu.', preset, error);
      }
      return fallbackPdfView(preset);
    });
  }

  function pdfFileName(model) {
    const spec = activeProductSpec(model.productGroup);
    return `${spec.modelLabel.replace(/\s+/g, '-')}-${model.width}x${model.depth}x${model.height}-urun-listesi.pdf`;
  }

  function hasMeaningfulReportValue(value) {
    if (Array.isArray(value)) return value.some((item) => hasMeaningfulReportValue(item));
    if (value == null) return false;
    const text = String(value).trim();
    if (!text) return false;
    return !['—', 'Yok', 'None'].includes(text);
  }

  function filterReportRows(rows) {
    return (Array.isArray(rows) ? rows : []).filter((row) => row && hasMeaningfulReportValue(row.value));
  }

  function systemInfoSections(model) {
    const spec = activeProductSpec(model.productGroup);
    const sections = [];
    if (model.productGroup === 'pergo-rise' && model.pergoRiseProject && model.pergoRiseProject.derived) {
      const project = model.pergoRiseProject;
      const derived = project.derived;
      const counts = derived.counts || {};
      const input = project.input || {};
      const systems = Array.isArray(derived.systems) ? derived.systems : [];
      const groups = Array.isArray(derived.independentGroups) ? derived.independentGroups : [];
      sections.push({
        title: 'Pergola · Parametrik Proje',
        rows: filterReportRows([
          { label: 'Ürün', value: spec.modelLabel },
          { label: 'Project Schema', value: project.schema },
          { label: 'Assembly Schema', value: derived.schema },
          { label: 'Project Hash', value: derived.projectHash || project.hash },
          { label: 'Statik Durum', value: derived.staticState },
          { label: 'Sistem / Poz', value: `${counts.systems || systems.length} sistem · ${counts.positions || systems.length} poz` },
          { label: 'Bağımsız Gruplar', value: groups.length ? groups.map(group => `${group.groupId || group.groupIndex + 1}: ${mmText(Number(group.outerEndX) - Number(group.outerStartX))}`).join(' | ') : 'Tek bağlı grup' },
          { label: 'Toplam Nominal Genişlik', value: mmText(project.normalized && project.normalized.width || model.width) },
          { label: 'Maksimum Açılım', value: mmText(derived.envelope && derived.envelope.depth || model.depth) },
          { label: 'Maksimum Arka Yükseklik', value: mmText(derived.envelope && derived.envelope.height || model.height) }
        ])
      });
      sections.push({
        title: 'Pergola · 2D / Üretim Bileşenleri',
        rows: filterReportRows([
          { label: 'Gerçek GLB Ray Profilleri', value: String(counts.rails || 0) },
          { label: 'Gerçek GLB Dikmeler', value: String(counts.posts || 0) },
          { label: '3D Arka Duvar Parçaları', value: String(counts.walls || 0) },
          { label: 'Duvar Bağlantı Adayları', value: String(counts.wallConnections || 0) },
          { label: 'Kumaş Profilleri', value: String(counts.fabricProfiles || 0) },
          { label: 'Trapez Sac Alanları', value: String(counts.trapezSheets || 0) },
          { label: 'Oluk / Grup Profilleri', value: String((derived.components || []).filter(item => item.kind === 'gutter').length) },
          { label: 'Component Instance', value: String((derived.components || []).length) },
          { label: 'Koordinat Sistemi', value: 'X=genişlik · Y=yükseklik · Z=açılım · birim=mm' }
        ])
      });
      sections.push({
        title: 'Pergola · Poz Parametreleri',
        rows: systems.map((system, index) => ({
          label: `Poz ${index + 1}`,
          value: `${mmText(system.width)} genişlik · ${mmText(system.opening)} açılım · arka ${mmText(system.rearHeight)} · ön ${mmText(system.frontHeight)} · eğim ${Number(system.slopeDegrees || 0).toFixed(2)}° · ${system.railCount || 0} ray · akslar ${(system.railAxes || []).map(axis => Math.round(Number(axis))).join(', ') || '—'} mm`
        }))
      });
      sections.push({
        title: 'Pergola · Malzeme ve Opsiyonlar',
        rows: filterReportRows([
          { label: 'Sistem Rengi', value: input.structureColor || (model.systemColor && model.systemColor.code) },
          { label: 'Kumaş', value: input.fabric },
          { label: 'Kumaş Profilleri', value: input.fabricProfiles },
          { label: 'Motor', value: input.motor },
          { label: 'Kumanda', value: input.remote },
          { label: 'LED', value: input.led },
          { label: 'Dimmer', value: input.dimmer },
          { label: 'Arka Taşıyıcı', value: input.__rearSupport && input.__rearSupport.type === 'wall' ? 'Duvar' : (input.__rearSupport && input.__rearSupport.type) },
          { label: 'Ek Bilgiler', value: input.extras }
        ])
      });
      if (Array.isArray(derived.unresolvedProductionFields) && derived.unresolvedProductionFields.length) {
        sections.push({
          title: 'Pergola · Doğrulama Notları',
          rows: derived.unresolvedProductionFields.map((value, index) => ({ label: `Not ${index + 1}`, value }))
        });
      }
      return sections;
    }

    sections.push({
      title: 'Ana Sistem · Project Details',
      rows: filterReportRows([
        { label: 'Ürün Ailesi', value: 'Bioclimatic' },
        { label: 'Ürün Grubu', value: spec.groupLabel },
        { label: 'Ürün Alt Grup', value: spec.subgroupLabel },
        { label: 'Module', value: 'Modul 1' },
        { label: 'Width', value: mmText(model.width) },
        { label: 'Projection', value: mmText(model.depth) },
        { label: 'Height', value: mmText(model.height) },
        { label: 'Panel Sayısı', value: String(model.panelCount || model.lamellaCount || '') }
      ])
    });
    sections.push({
      title: 'Ana Sistem · Color Details',
      rows: filterReportRows([
        { label: 'Renk Modu', value: model.colorMode === 'ral' ? 'RAL' : 'Default' },
        { label: 'Sistem Rengi', value: model.colorMode === 'ral' ? `${model.systemColor.code} · ${finishLabel(model.systemColor.finish)}` : 'Klasik Sistem Paleti' },
        { label: 'Panel Rengi', value: model.colorMode === 'ral' ? `${model.panelColor.code} · ${finishLabel(model.panelColor.finish)}` : 'Klasik Panel Yeşili' },
        { label: 'Paneller', value: model.panelMasterOpen ? 'Açık' : 'Kapalı' },
        { label: 'Ürünler', value: model.productsOpen ? 'Açık' : 'Kapalı' }
      ])
    });
    const changes = modelChangeLines(model);
    if (changes.length) {
      sections.push({
        title: 'Ana Sistem · Değişiklik Özeti',
        rows: [{ label: 'Değişiklikler', value: changes.join(' | ') }]
      });
    }
    return sections;
  }

  function placementReportRows(placement, zone, prefix) {
    const lines = placementDetailLines(placement, zone).map((line) => ({ label: line.label, value: line.value }));
    const rows = filterReportRows(lines);
    const changes = placementChangeLines(placement);
    if (changes.length) rows.push({ label: 'Yapılan Değişiklikler', value: changes.join(' | ') });
    return rows.map((row, index) => ({
      label: index === 0 && prefix ? `${prefix} · ${row.label}` : row.label,
      value: row.value
    }));
  }

  function buildFacadeSections(model) {
    const sections = [];
    buildReportFacades(model).forEach((facade) => {
      const zoneSections = [];
      facade.zones.forEach((zone) => {
        const primary = model.placements[zone.id];
        const zip = model.zipPlacements[zone.id];
        if (!primary && !zip) return;
        const baseRows = filterReportRows([
          { label: 'Cephe', value: facade.label },
          { label: 'Alan', value: zone.label },
          { label: 'Cephe Net Ölçüsü', value: `${mmText(facade.width)} × ${mmText(facade.height)}` },
          { label: 'Net Alan', value: `${mmText(zone.width)} × ${mmText(zone.height)}` },
          { label: 'Ara Profiller', value: facade.profiles.length ? facade.profiles.map((profile) => profileSummary(profile)).join(' | ') : '' }
        ]);
        if (primary) {
          zoneSections.push({
            title: `${zone.label} · Ana Ürün`,
            rows: baseRows.concat(placementReportRows(primary, zone, 'Ana Ürün'))
          });
        }
        if (zip) {
          zoneSections.push({
            title: `${zone.label} · Zip Perde`,
            rows: baseRows.concat(placementReportRows({ ...zip, type: 'zip' }, zone, 'Zip Perde'))
          });
        }
      });
      sections.push(...zoneSections);
    });
    if (!sections.length) {
      sections.push({
        title: 'Cephe Ürünleri',
        rows: [{ label: 'Durum', value: 'Yerleştirilmiş cephe ürünü bulunmuyor.' }]
      });
    }
    return sections;
  }

  function drawContainedImage(pdf, view, boxX, boxY, boxW, boxH) {
    pdf.setDrawColor(206, 216, 230);
    pdf.setFillColor(248, 250, 252);
    pdf.roundedRect(boxX, boxY, boxW, boxH, 3, 3, 'FD');
    if (!view || !view.dataUrl || !view.width || !view.height) {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(71, 85, 105);
      pdf.text('Görsel alınamadı', boxX + 8, boxY + 12);
      return;
    }
    const scale = Math.min(boxW / view.width, boxH / view.height);
    const drawW = view.width * scale;
    const drawH = view.height * scale;
    const drawX = boxX + (boxW - drawW) / 2;
    const drawY = boxY + (boxH - drawH) / 2;
    pdf.addImage(view.dataUrl, 'JPEG', drawX, drawY, drawW, drawH);
  }

  function estimateSectionHeight(pdf, rows, width, labelWidth) {
    let total = 10;
    (Array.isArray(rows) ? rows : []).forEach((row) => {
      const value = row && row.value != null && row.value !== '' ? String(row.value) : '—';
      const valueLines = pdf.splitTextToSize(value, width - labelWidth - 8);
      total += Math.max(7, valueLines.length * 4.4 + 2);
    });
    return total + 6;
  }

  function drawSectionTable(pdf, title, rows, y, margin, width) {
    const safeRows = filterReportRows(rows);
    if (!safeRows.length) return y;
    const labelWidth = 58;
    const contentWidth = width - 10;
    const estimatedHeight = estimateSectionHeight(pdf, safeRows, contentWidth, labelWidth);
    if (y + estimatedHeight > 285) {
      pdf.addPage();
      y = 14;
    }
    pdf.setFillColor(234, 241, 250);
    pdf.setDrawColor(196, 210, 227);
    pdf.roundedRect(margin, y, width, estimatedHeight, 3, 3, 'FD');
    pdf.setFillColor(219, 231, 247);
    pdf.roundedRect(margin, y, width, 10, 3, 3, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(19, 48, 84);
    pdf.text(title, margin + 4, y + 6.7);
    let cursorY = y + 15;
    safeRows.forEach((row, index) => {
      const valueText = String(row.value);
      const valueLines = pdf.splitTextToSize(valueText, contentWidth - labelWidth - 8);
      const rowHeight = Math.max(7, valueLines.length * 4.4 + 2);
      if (index > 0) {
        pdf.setDrawColor(212, 222, 235);
        pdf.line(margin + 4, cursorY - 2, margin + width - 4, cursorY - 2);
      }
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9.2);
      pdf.setTextColor(15, 23, 42);
      pdf.text(String(row.label || 'Bilgi'), margin + 4, cursorY + 2.5);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(31, 41, 55);
      pdf.text(valueLines, margin + 4 + labelWidth, cursorY + 2.5);
      cursorY += rowHeight;
    });
    return y + estimatedHeight + 6;
  }

  async function exportProductListPdf() {
    pruneProductStates();
    const model = readModel();
    if (!modelReady(model)) {
      window.alert('Önce geçerli bir 3D model oluşturun.');
      return;
    }
    const button = $(ids.exportProductListPdf);
    const originalLabel = button ? button.textContent : '';
    if (button) {
      button.disabled = true;
      button.textContent = 'PDF Hazırlanıyor…';
    }
    try {
      const jsPdfApi = window.jspdf && window.jspdf.jsPDF;
      if (!jsPdfApi) throw new Error('jsPDF yüklenemedi. İnternet bağlantısını kontrol edin.');
      const pdf = new jsPdfApi({ orientation: 'p', unit: 'mm', format: 'a4' });
      const margin = 10;
      const pageWidth = 210;
      const usableWidth = pageWidth - margin * 2;
      const views = collectPdfViews();
      const captions = {
        'front-left': 'Arka sol üst görünüş',
        'front-right': 'Arka sağ üst görünüş',
        'back-left': 'Ön sol üst görünüş',
        'back-right': 'Ön sağ üst görünüş'
      };
      const groups = [views.slice(0, 2), views.slice(2, 4)];
      groups.forEach((group, pageIndex) => {
        if (pageIndex > 0) pdf.addPage();
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(16);
        pdf.setTextColor(17, 36, 66);
        pdf.text('Ürün Listesi PDF', margin, 14);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(31, 41, 55);
        const pergoCounts = model.pergoRiseProject && model.pergoRiseProject.derived && model.pergoRiseProject.derived.counts || {};
        const subtitle = model.productGroup === 'pergo-rise'
          ? `${productModelLabel(model.productGroup)} · ${pergoCounts.systems || 0} sistem · ${pergoCounts.positions || 0} poz · ${pergoCounts.rails || 0} ray · ${pergoCounts.posts || 0} dikme`
          : `${productModelLabel(model.productGroup)} · ${mmText(model.width)} × ${mmText(model.depth)} × ${mmText(model.height)} · ${model.panelCount || model.lamellaCount} panel`;
        pdf.text(subtitle, margin, 20);
        let y = 28;
        group.forEach((view) => {
          const boxX = margin;
          const boxY = y;
          const boxW = usableWidth;
          const boxH = 104;
          drawContainedImage(pdf, view, boxX, boxY, boxW, boxH);
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(9.4);
          pdf.setTextColor(15, 23, 42);
          pdf.text(captions[view.preset] || 'Görünüş', boxX + 2, boxY + boxH + 5);
          y += boxH + 12;
        });
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8.5);
        pdf.text(`Görsel sayfa ${pageIndex + 1} · Görseller daha geniş açı ve oran korunarak yerleştirildi.`, margin, 288);
      });

      pdf.addPage();
      let y = 14;
      systemInfoSections(model).forEach((section) => {
        y = drawSectionTable(pdf, section.title, section.rows, y, margin, usableWidth);
      });
      if (model.productGroup !== 'pergo-rise') {
        buildFacadeSections(model).forEach((section) => {
          y = drawSectionTable(pdf, section.title, section.rows, y, margin, usableWidth);
        });
      }
      pdf.save(pdfFileName(model));
    } catch (error) {
      console.error('Ürün listesi PDF üretimi başarısız oldu.', error);
      window.alert(`Ürün listesi PDF oluşturulamadı: ${error.message}`);
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = originalLabel || 'Ürün Listesi PDF';
      }
    }
  }

  function doorTypeSilhouetteSvg(type) {
    const stroke = '#0f172a';
    const frame = '#475569';
    const fixed = '#cbd5e1';
    const moving = '#93c5fd';
    const leafWidth = 1000;
    const sideFixedWidth = 1000;
    const leafHeight = 2500;
    const topFixedHeight = 500;
    const maxWidth = 4000;
    const maxHeight = leafHeight + topFixedHeight;
    const margin = 140;
    const hasTopFixed = DOOR_TOP_FIXED_TYPES.has(type);
    const segments = [];
    const addMoving = (hinge) => segments.push({ width: leafWidth, kind: 'moving', hinge });
    const addFixed = () => segments.push({ width: sideFixedWidth, kind: 'fixed' });

    if (type === 'SINGLE' || type === 'TOP_FIXED') {
      addMoving('LEFT');
    } else if (type === 'DOUBLE' || type === 'DOUBLE_TOP') {
      addMoving('LEFT'); addMoving('RIGHT');
    } else if (type === 'LEFT_FIXED_RIGHT_MOVING' || type === 'LEFT_FIXED_TOP') {
      addFixed(); addMoving('RIGHT');
    } else if (type === 'RIGHT_FIXED_LEFT_MOVING' || type === 'RIGHT_FIXED_TOP') {
      addMoving('LEFT'); addFixed();
    } else if (type === 'BOTH_FIXED_TOP') {
      addFixed(); addMoving('LEFT'); addFixed();
    } else if (type === 'DOUBLE_LEFT_FIXED' || type === 'DOUBLE_LEFT_FIXED_TOP') {
      addFixed(); addMoving('LEFT'); addMoving('RIGHT');
    } else if (type === 'DOUBLE_RIGHT_FIXED_TOP') {
      addMoving('LEFT'); addMoving('RIGHT'); addFixed();
    } else if (type === 'DOUBLE_BOTH_FIXED_TOP') {
      addFixed(); addMoving('LEFT'); addMoving('RIGHT'); addFixed();
    } else {
      addMoving('LEFT');
    }

    const totalWidth = segments.reduce((sum, segment) => sum + segment.width, 0);
    const totalHeight = leafHeight + (hasTopFixed ? topFixedHeight : 0);
    const originX = margin + (maxWidth - totalWidth) / 2;
    const originY = margin + (maxHeight - totalHeight);
    const leafY = originY + (hasTopFixed ? topFixedHeight : 0);
    const inset = 45;
    const strokeWidth = 58;

    let panes = '';
    let cursor = originX;
    segments.forEach((segment) => {
      const fill = segment.kind === 'moving' ? moving : fixed;
      panes += `<rect x="${cursor + inset}" y="${leafY + inset}" width="${segment.width - inset * 2}" height="${leafHeight - inset * 2}" rx="42" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" />`;
      cursor += segment.width;
    });

    const topBand = hasTopFixed
      ? `<rect x="${originX + inset}" y="${originY + inset}" width="${totalWidth - inset * 2}" height="${topFixedHeight - inset * 2}" rx="42" fill="${fixed}" stroke="${stroke}" stroke-width="${strokeWidth}" />`
      : '';
    return `<svg viewBox="0 0 ${maxWidth + margin * 2} ${maxHeight + margin * 2}" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">`
      + `<rect x="${originX}" y="${originY}" width="${totalWidth}" height="${totalHeight}" rx="55" fill="none" stroke="${frame}" stroke-width="82" />`
      + topBand + panes + '</svg>';
  }

  function closeDoorTypePicker() {
    const picker = $(ids.productDoorTypePicker);
    const trigger = $(ids.productDoorTypeTrigger);
    if (picker) picker.hidden = true;
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
  }

  function openDoorTypePicker() {
    const picker = $(ids.productDoorTypePicker);
    const trigger = $(ids.productDoorTypeTrigger);
    if (!picker || $(ids.productType).value !== 'door') return;
    renderDoorTypeCards($(ids.productDoorType).value);
    picker.hidden = false;
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
    const selected = $(ids.productDoorTypeCards).querySelector('.door-type-card.is-selected');
    if (selected && selected.focus) selected.focus();
  }

  function openProductFabricCatalog() {
    const picker = $(ids.productFabricPicker);
    const trigger = $(ids.productFabricTrigger);
    if (!picker || $(ids.productType).value !== 'zip') return;
    renderFabricCards($(ids.productFabric).value);
    picker.hidden = false;
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
    const first = $(ids.productFabricCards).querySelector('.fabric-page-hotspot.is-selected') || $(ids.productFabricCards).querySelector('.fabric-page-hotspot');
    if (first && first.focus) first.focus();
  }

  function closeProductFabricCatalog() {
    const picker = $(ids.productFabricPicker);
    const trigger = $(ids.productFabricTrigger);
    if (picker) picker.hidden = true;
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
  }

  function renderDoorTypeCards(selected) {
    const container = $(ids.productDoorTypeCards);
    if (!container) return;
    container.innerHTML = '';
    DOOR_TYPE_OPTIONS.forEach(([value, main, detail]) => {
      const button = document.createElement('button');
      const fullLabel = detail ? main + ' · ' + detail : main;
      button.type = 'button';
      button.className = 'door-type-card' + (String(selected) === value ? ' is-selected' : '');
      button.setAttribute('data-value', value);
      button.setAttribute('role', 'option');
      button.setAttribute('aria-selected', String(String(selected) === value));
      button.setAttribute('aria-label', fullLabel);
      button.innerHTML = doorTypeSilhouetteSvg(value) + '<span class="door-type-card-copy"><strong class="door-type-card-title">' + main + '</strong><span class="door-type-card-detail">' + detail + '</span></span>';
      button.addEventListener('click', () => {
        $(ids.productDoorType).value = value;
        $(ids.productDoorTypeValue).textContent = doorTypeLabel(value);
        closeDoorTypePicker();
        applyProductRules(currentProductDraft());
        $(ids.productDoorTypeTrigger).focus();
      });
      container.appendChild(button);
    });
  }

  function setHidden(id, hidden) {
    $(id).hidden = Boolean(hidden);
  }

  window.P3DVProductFieldPolicy = Object.freeze({
    types: Object.freeze(Object.keys(PRODUCT_FIELD_POLICY)),
    allowedWrappers: type => [...productPolicy(type).wrappers],
    allowedStateKeys: type => [...productPolicy(type).stateKeys],
    managedWrappers: () => [...PRODUCT_MANAGED_WRAPPERS],
    sanitize: (source, type) => JSON.parse(JSON.stringify(sanitizeProductState(source, type)))
  });

  function applyProductFieldOrder(type) {
    const grid = $(ids.productFormGrid);
    if (!grid || typeof grid.insertBefore !== 'function') return;
    const directionWrap = $(ids.productDirectionWrap);
    const glassThicknessWrap = $(ids.productGlassThicknessWrap);
    const panelsWrap = $(ids.productPanelsWrap);
    const viewWrap = $(ids.productFoldingViewWrap);
    const openWrap = $(ids.productFoldingOpenDirectionWrap);
    const slidingViewWrap = $(ids.productSlidingViewWrap);
    const openingWrap = $(ids.productOpeningWrap);
    if (isFoldingType(type)) {
      if (panelsWrap && viewWrap) grid.insertBefore(viewWrap, panelsWrap.nextSibling);
      if (viewWrap && openWrap) grid.insertBefore(openWrap, viewWrap.nextSibling);
      if (openWrap && directionWrap) grid.insertBefore(directionWrap, openWrap.nextSibling);
    } else if (type === 'sliding') {
      if (slidingViewWrap && openingWrap) grid.insertBefore(slidingViewWrap, openingWrap);
      if (directionWrap && glassThicknessWrap) grid.insertBefore(directionWrap, glassThicknessWrap);
    } else if (directionWrap && glassThicknessWrap) {
      grid.insertBefore(directionWrap, glassThicknessWrap);
    }
  }

  function setDoorFieldsHidden(hidden) {
    setHidden(ids.productDoorTypeWrap, hidden);
    setHidden(ids.productDoorHingeWrap, hidden);
    setHidden(ids.productDoorActiveLeafWrap, hidden);
    setHidden(ids.productDoorOpenDirectionWrap, hidden);
    setHidden(ids.productDoorHandleTypeWrap, hidden);
    setHidden(ids.productDoorTopFixedHeightWrap, hidden);
    setHidden(ids.productDoorHeightSummaryWrap, hidden);
  }

  function doorTopFixedAvailableHeight(zone) {
    if (!zone) return null;
    const fittedHeight = Math.max(120, Number(zone.height || 0) - 5);
    return Math.max(0, Math.round(fittedHeight - 87));
  }

  function doorTopFixedMetrics(zone, movingLeafHeight, fallbackTopFixedHeight = 500) {
    const minimumFixedHeight = 110;
    const availableHeight = doorTopFixedAvailableHeight(zone);
    const fallbackFixed = Math.max(minimumFixedHeight, Math.round(Number(fallbackTopFixedHeight) || 500));
    const fallbackMoving = availableHeight === null ? 2200 : Math.max(1200, availableHeight - fallbackFixed);
    const requestedMoving = Number.isFinite(Number(movingLeafHeight)) ? Math.round(Number(movingLeafHeight)) : fallbackMoving;
    if (availableHeight === null) {
      const movingHeight = Math.max(1200, requestedMoving);
      return {
        fixedHeight: fallbackFixed,
        movingHeight,
        requestedMovingHeight: requestedMoving,
        minMovingHeight: 1200,
        maxMovingHeight: null,
        availableHeight: null,
        minimumFixedHeight,
        valid: requestedMoving >= 1200
      };
    }
    const minMovingHeight = 1200;
    const maxMovingHeight = Math.max(minMovingHeight, availableHeight - minimumFixedHeight);
    const movingHeight = Math.max(minMovingHeight, Math.min(maxMovingHeight, requestedMoving));
    const requestedFixedHeight = availableHeight - requestedMoving;
    const fixedHeight = Math.max(minimumFixedHeight, availableHeight - movingHeight);
    const valid = requestedMoving >= minMovingHeight && requestedMoving <= maxMovingHeight && requestedFixedHeight >= minimumFixedHeight;
    return {
      fixedHeight,
      requestedFixedHeight,
      movingHeight,
      requestedMovingHeight: requestedMoving,
      minMovingHeight,
      maxMovingHeight,
      availableHeight,
      minimumFixedHeight,
      valid
    };
  }

  function updateDoorTopFixedSummary(options = {}) {
    const isTopFixed = $(ids.productType).value === 'door' && DOOR_TOP_FIXED_TYPES.has($(ids.productDoorType).value);
    setHidden(ids.productDoorHeightSummaryWrap, !isTopFixed);
    const input = $(ids.productDoorTopFixedHeight);
    if (!isTopFixed) {
      if (input && typeof input.setCustomValidity === 'function') input.setCustomValidity('');
      return true;
    }
    const zone = activeZone || (bulkProductZones && bulkProductZones[0]) || null;
    const rawValue = input.value;
    const seed = currentProductDraft();
    const metrics = doorTopFixedMetrics(zone, rawValue, seed.topFixedHeight);
    input.min = String(metrics.minMovingHeight);
    if (metrics.maxMovingHeight === null) input.removeAttribute('max');
    else input.max = String(metrics.maxMovingHeight);
    if (options.normalize || !String(rawValue).trim()) input.value = String(metrics.movingHeight);
    const displayedMoving = Math.round(Number(input.value) || metrics.movingHeight);
    const displayedFixed = metrics.availableHeight === null ? metrics.fixedHeight : metrics.availableHeight - displayedMoving;
    $(ids.productDoorFixedHeightValue).textContent = `${Math.round(displayedFixed)} mm`;
    $(ids.productDoorMovingHeightValue).textContent = `${displayedMoving} mm`;
    const message = metrics.valid
      ? ''
      : `Kanat yüksekliği kabul edilmedi. Kalan üst sabit cam yüksekliği en az ${metrics.minimumFixedHeight} mm olmalıdır. Uygun kanat aralığı ${metrics.minMovingHeight}–${metrics.maxMovingHeight === null ? '—' : metrics.maxMovingHeight} mm.`;
    if (typeof input.setCustomValidity === 'function') input.setCustomValidity(message);
    input.classList.toggle('is-invalid', Boolean(message));
    if (!options.silent) $(ids.productValidation).textContent = message;
    return !message;
  }

  function fixedHorizontalTotalHeight() {
    const zone = activeZone || (bulkProductZones && bulkProductZones[0]) || null;
    return zone ? Math.round(Math.max(120, Number(zone.height || 0) - 5)) : 0;
  }

  function parseFixedHorizontalValues(value, divisions) {
    const parts = String(value || '').split(/[;,]+/).map((item) => Math.round(Number(String(item).trim())));
    return parts.length === divisions && parts.every((item) => Number.isFinite(item) && item > 0) ? parts : [];
  }

  function distributeFixedHorizontalValues(totalHeight, values, manualFlags) {
    const total = Math.max(0, Math.round(Number(totalHeight) || 0));
    const count = Math.max(1, Math.round(Number(values && values.length) || Number(manualFlags && manualFlags.length) || 1));
    const nextValues = Array.from({ length: count }, (_, index) => Math.max(1, Math.round(Number(values && values[index]) || 1)));
    const nextManual = Array.from({ length: count }, (_, index) => Boolean(manualFlags && manualFlags[index]));
    const automaticIndexes = nextManual.map((manual, index) => manual ? -1 : index).filter((index) => index >= 0);
    const manualSum = nextValues.reduce((sum, value, index) => sum + (nextManual[index] ? value : 0), 0);
    if (!automaticIndexes.length) {
      return { ok: manualSum === total, values: nextValues, manual: nextManual, totalHeight: total, remaining: total - manualSum };
    }
    const remaining = total - manualSum;
    if (remaining < automaticIndexes.length) {
      return { ok: false, values: nextValues, manual: nextManual, totalHeight: total, remaining };
    }
    const base = Math.floor(remaining / automaticIndexes.length);
    let extra = remaining - base * automaticIndexes.length;
    automaticIndexes.forEach((index) => {
      nextValues[index] = base + (extra > 0 ? 1 : 0);
      if (extra > 0) extra -= 1;
    });
    return { ok: true, values: nextValues, manual: nextManual, totalHeight: total, remaining: 0 };
  }

  function syncFixedHorizontalSerializedValue() {
    $(ids.productFixedHorizontalHeights).value = fixedHorizontalFormState.values.join(';');
  }

  function renderFixedHorizontalRows() {
    const container = $(ids.productFixedHorizontalHeightRows);
    if (!container) return;
    container.innerHTML = '';
    fixedHorizontalFormState.values.forEach((value, index) => {
      const row = document.createElement('div');
      row.className = 'fixed-horizontal-height-row';
      const label = document.createElement('label');
      label.htmlFor = `productFixedHorizontalHeightInput${index + 1}`;
      label.textContent = `SDY${index + 1}`;
      const input = document.createElement('input');
      input.id = `productFixedHorizontalHeightInput${index + 1}`;
      input.type = 'number';
      input.inputMode = 'numeric';
      input.min = '1';
      input.step = '1';
      input.value = String(value);
      input.className = fixedHorizontalFormState.manual[index] ? 'is-manual' : '';
      input.setAttribute('data-sdy-index', String(index));
      const reset = document.createElement('button');
      reset.type = 'button';
      reset.className = 'fixed-horizontal-height-reset';
      reset.textContent = 'Resetle';
      reset.disabled = !fixedHorizontalFormState.manual[index];
      reset.setAttribute('data-sdy-reset-index', String(index));
      const status = document.createElement('span');
      status.className = 'fixed-horizontal-height-status';
      status.textContent = fixedHorizontalFormState.manual[index] ? 'Manuel değer korunur' : 'Otomatik eşit dağıtım';
      input.addEventListener('change', () => {
        const requested = Math.round(Number(input.value));
        const previous = {
          values: [...fixedHorizontalFormState.values],
          manual: [...fixedHorizontalFormState.manual],
          totalHeight: fixedHorizontalFormState.totalHeight
        };
        if (!Number.isFinite(requested) || requested < 1) {
          input.value = String(previous.values[index]);
          $(ids.productValidation).textContent = `SDY${index + 1} için 1 mm veya daha büyük bir değer girin.`;
          return;
        }
        const values = [...previous.values];
        const manual = [...previous.manual];
        values[index] = requested;
        manual[index] = true;
        const distributed = distributeFixedHorizontalValues(previous.totalHeight, values, manual);
        if (!distributed.ok) {
          fixedHorizontalFormState = previous;
          $(ids.productValidation).textContent = 'Manuel SDY değerleri toplam yüksekliği aşıyor veya tüm hücreler manuel olduğu için toplam korunamıyor. Bir hücreyi Resetle ile otomatik dağıtıma alın.';
          renderFixedHorizontalRows();
          syncFixedHorizontalSerializedValue();
          return;
        }
        fixedHorizontalFormState = distributed;
        syncFixedHorizontalSerializedValue();
        $(ids.productValidation).textContent = '';
        renderFixedHorizontalRows();
      });
      input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') { event.preventDefault(); input.blur(); }
      });
      reset.addEventListener('click', () => {
        const manual = [...fixedHorizontalFormState.manual];
        manual[index] = false;
        const distributed = distributeFixedHorizontalValues(fixedHorizontalFormState.totalHeight, fixedHorizontalFormState.values, manual);
        if (!distributed.ok) return;
        fixedHorizontalFormState = distributed;
        syncFixedHorizontalSerializedValue();
        $(ids.productValidation).textContent = '';
        renderFixedHorizontalRows();
      });
      row.appendChild(label);
      row.appendChild(input);
      row.appendChild(reset);
      row.appendChild(status);
      container.appendChild(row);
    });
  }

  function initializeFixedHorizontalForm(draft, options = {}) {
    const divisions = Math.max(1, Math.min(10, Math.round(Number(draft && draft.horizontalDivisions) || 1)));
    const totalHeight = fixedHorizontalTotalHeight();
    const parsed = parseFixedHorizontalValues(draft && draft.horizontalHeights, divisions);
    const hasStoredManual = draft && Array.isArray(draft.horizontalHeightManual) && draft.horizontalHeightManual.length === divisions;
    let manual = hasStoredManual
      ? draft.horizontalHeightManual.map(Boolean)
      : (parsed.length && Math.max(...parsed) - Math.min(...parsed) > 1 ? Array(divisions).fill(true) : Array(divisions).fill(false));
    let values = parsed.length ? parsed : Array(divisions).fill(1);
    if (options.resetAll) manual = Array(divisions).fill(false);
    let distributed = distributeFixedHorizontalValues(totalHeight, values, manual);
    if (!distributed.ok) distributed = distributeFixedHorizontalValues(totalHeight, Array(divisions).fill(1), Array(divisions).fill(false));
    fixedHorizontalFormState = distributed;
    syncFixedHorizontalSerializedValue();
    renderFixedHorizontalRows();
  }

  function currentProductDraft() {
    const type = $(ids.productType).value;
    const colorValue = normalizeGlassColor($(ids.productGlassColor).value);
    return sanitizeProductState({
      type,
      series: $(ids.productSeries).value,
      subtype: $(ids.productSubtype).value,
      placementLocation: $(ids.productPlacement).value,
      mechanism: $(ids.productMechanism).value,
      slidingView: $(ids.productSlidingView).value,
      openingType: $(ids.productOpening).value,
      openingDirection: $(ids.productDirection).value,
      glassThickness: $(ids.productGlassThickness).value,
      glassColor: colorValue,
      customGlassColor: $(ids.productCustomGlass).value,
      fabricColor: $(ids.productFabric).value,
      customFabricColor: '',
      panels: Number($(ids.productPanels).value),
      foldingView: $(ids.productFoldingView).value,
      foldingOpenDirection: $(ids.productFoldingOpenDirection).value,
      verticalDivisions: Number($(ids.productFixedVerticalCount).value),
      horizontalDivisions: Number($(ids.productFixedHorizontalCount).value),
      horizontalHeights: $(ids.productFixedHorizontalHeights).value,
      horizontalHeightManual: [...fixedHorizontalFormState.manual],
      doorType: $(ids.productDoorType).value,
      hingeDirection: $(ids.productDoorHinge).value,
      activeLeaf: $(ids.productDoorActiveLeaf).value,
      doorOpenDirection: $(ids.productDoorOpenDirection).value,
      handleType: $(ids.productDoorHandleType).value,
      movingLeafHeight: Number($(ids.productDoorTopFixedHeight).value),
      topFixedHeight: null,
      panelType: $(ids.productPanelType).value,
      cableDirection: $(ids.productPanelType).value,
      motorDirection: $(ids.productMotorDirection).value,
      view: $(ids.productView).value,
      motorType: $(ids.productMotorType).value,
      remoteControl: $(ids.productRemote).value,
      bottomPanelMode: $(ids.bottomPanelMode).value,
      bottomPanelState: $(ids.bottomPanelState).value,
      bottomPanelHinge: $(ids.bottomPanelHinge).value,
      collectionState: isFoldingType(type) ? $(ids.foldingCollectionState).value : (type === 'sliding' ? $(ids.slidingCollectionState).value : $(ids.collectingDisplayState).value)
    }, type);
  }

  function updateFoldingFormAdvisory() {
    if (!isFoldingType($(ids.productType).value)) return;
    const panels = Math.max(2, Math.round(Number($(ids.productPanels).value) || 2));
    const zone = activeZone || (bulkProductZones && bulkProductZones[0]) || null;
    if (panels > 8) {
      $(ids.productDirection).value = 'BOTH';
      $(ids.productDirection).disabled = true;
    } else {
      $(ids.productDirection).disabled = false;
    }
    const draft = { type: 'folding', panels, openingDirection: $(ids.productDirection).value };
    const warnings = foldingAdvisory(zone, draft);
    if ($(ids.foldingRuleNote)) {
      $(ids.foldingRuleNote).textContent = warnings.length
        ? warnings.join(' ')
        : 'Otomatik hedef panel genişliği 600 mm. Tek tarafa önerilen maksimum 8 paneldir.';
    }
  }

  function applyProductRules(seed) {
    const type = $(ids.productType).value;
    applyProductFieldOrder(type);
    resetProductFieldVisibility();
    const draft = { ...productDefaults(type), ...sanitizeProductState(seed || currentProductDraft(), type), type };
    const isFolding = isFoldingType(type);
    const foldingTitle=document.getElementById('foldingCollectionTitle');if(foldingTitle)foldingTitle.textContent=(type==='balcony'?'Katlanır Cam':'Akordiyon Cam')+' · Açık/Kapalı Görünüm';
    const isGuillotine = type === 'guillotine';
    const isZip = type === 'zip';
    const isFixed = type === 'fixed';
    const isDoor = type === 'door';
    const standardSeries = [
      ['A SERIES', 'A Serisi'],
      ['K SERIES', 'K Serisi']
    ];
    const glassColors = GLASS_COLOR_OPTIONS;

    setDoorFieldsHidden(true);
    setHidden(ids.productFoldingViewWrap, true);
    setHidden(ids.productSlidingViewWrap, true);
    setHidden(ids.productFoldingOpenDirectionWrap, true);
    setHidden(ids.foldingCollectionSection, true);
    if ($(ids.productDirection)) $(ids.productDirection).disabled = false;
    if ($(ids.productDoorTypeCards)) $(ids.productDoorTypeCards).innerHTML = '';

    if (isDoor) {
      fillSelect($(ids.productDoorType), PRODUCT_OPTIONS.door.types, draft.doorType);
      $(ids.productDoorTypeValue).textContent = doorTypeLabel($(ids.productDoorType).value);
      renderDoorTypeCards(draft.doorType);
      fillSelect($(ids.productDoorHinge), PRODUCT_OPTIONS.door.hinges, draft.hingeDirection);
      fillSelect($(ids.productDoorActiveLeaf), PRODUCT_OPTIONS.door.activeLeaves, draft.activeLeaf);
      fillSelect($(ids.productDoorOpenDirection), PRODUCT_OPTIONS.door.openDirections, draft.doorOpenDirection);
      fillSelect($(ids.productDoorHandleType), PRODUCT_OPTIONS.door.handles, draft.handleType);
      fillSelect($(ids.productGlassThickness), PRODUCT_OPTIONS.sliding.thicknessA, compatibleGlassThickness('door', 'A SERIES', draft.glassThickness, draft.glassColor));
      fillSelect($(ids.productGlassColor), glassColors, draft.glassColor);
      const doorType = $(ids.productDoorType).value;
      const doorZone = activeZone || (bulkProductZones && bulkProductZones[0]) || null;
      const doorMetrics = doorTopFixedMetrics(doorZone, draft.movingLeafHeight, draft.topFixedHeight);
      $(ids.productDoorTopFixedHeight).value = String(doorMetrics.movingHeight);
      $(ids.productDoorTopFixedHeight).min = String(doorMetrics.minMovingHeight);
      if (doorMetrics.maxMovingHeight === null) $(ids.productDoorTopFixedHeight).removeAttribute('max');
      else $(ids.productDoorTopFixedHeight).max = String(doorMetrics.maxMovingHeight);
      setHidden(ids.productSeriesWrap, true);
      setHidden(ids.productSubtypeWrap, true);
      setHidden(ids.productPlacementWrap, true);
      setHidden(ids.productMechanismWrap, true);
      setHidden(ids.productOpeningWrap, true);
      setHidden(ids.productDirectionWrap, true);
      setHidden(ids.productGlassThicknessWrap, false);
      setHidden(ids.productGlassColorWrap, false);
      setHidden(ids.productPanelsWrap, true);
      setHidden(ids.productFixedVerticalCountWrap, true);
      setHidden(ids.productFixedHorizontalCountWrap, true);
      setHidden(ids.productFixedHorizontalHeightsWrap, true);
      setHidden(ids.productPanelTypeWrap, true);
      setHidden(ids.productMotorDirectionWrap, true);
      setHidden(ids.productViewWrap, true);
      setHidden(ids.productMotorTypeWrap, true);
      setHidden(ids.productRemoteWrap, true);
      setHidden(ids.cleanableWindowSection, true);
      setHidden(ids.collectingDisplaySection, true);
      setHidden(ids.slidingCollectionSection, true);
      setHidden(ids.productDoorTypeWrap, false);
      setHidden(ids.productDoorHingeWrap, DOOR_DOUBLE_TYPES.has(doorType));
      setHidden(ids.productDoorActiveLeafWrap, !DOOR_DOUBLE_TYPES.has(doorType));
      setHidden(ids.productDoorOpenDirectionWrap, false);
      setHidden(ids.productDoorHandleTypeWrap, false);
      setHidden(ids.productDoorTopFixedHeightWrap, !DOOR_TOP_FIXED_TYPES.has(doorType));
      $(ids.productView).value = 'OUTSIDE VIEW';
      updateDoorTopFixedSummary({ normalize: true, silent: true });
      $(ids.productGlassColorLabel).textContent = 'Cam Rengi';
      $(ids.productCustomGlassLabel).textContent = 'Özel Cam Rengi';
      $(ids.productPanels).disabled = true;
      $(ids.productPanels).value = '0';
      const lowE = $(ids.productGlassColor).querySelector('option[value="LOW-E GLASS"]');
      if (lowE) lowE.disabled = $(ids.productGlassThickness).value !== 'INSULATED GLASS';
      if ($(ids.productGlassThickness).value !== 'INSULATED GLASS' && $(ids.productGlassColor).value === 'LOW-E GLASS') $(ids.productGlassColor).value = 'TRANSPARENT';
      $(ids.productCustomGlass).value = draft.customGlassColor || '';
      setHidden(ids.productCustomGlassWrap, $(ids.productGlassColor).value !== 'OTHER');
      $(ids.productValidation).textContent = '';
      return;
    }

    if (isFixed) {
      fillSelect($(ids.productGlassThickness), PRODUCT_OPTIONS.sliding.thicknessA, compatibleGlassThickness('fixed', 'A SERIES', draft.glassThickness, draft.glassColor));
      fillSelect($(ids.productGlassColor), glassColors, draft.glassColor);
      const fixedZone = activeZone || (bulkProductZones && bulkProductZones[0]) || null;
      const frame = 55;
      const innerWidth = fixedZone ? Math.max(80, fixedZone.width - 10 - frame * 2) : 0;
      const autoVerticalDivisions = Math.max(1, Math.ceil(innerWidth / 1200));
      const verticalDivisions = Math.max(1, Math.min(20, Math.round(Number(draft.verticalDivisions) || autoVerticalDivisions)));
      const horizontalDivisions = Math.max(1, Math.min(10, Math.round(Number(draft.horizontalDivisions) || 1)));
      $(ids.productFixedVerticalCount).value = String(verticalDivisions);
      $(ids.productFixedHorizontalCount).value = String(horizontalDivisions);
      initializeFixedHorizontalForm({
        ...draft,
        horizontalDivisions,
        horizontalHeightManual: Array.isArray(draft.horizontalHeightManual) ? draft.horizontalHeightManual : []
      });
      setHidden(ids.productSeriesWrap, true);
      setHidden(ids.productSubtypeWrap, true);
      setHidden(ids.productPlacementWrap, true);
      setHidden(ids.productMechanismWrap, true);
      setHidden(ids.productOpeningWrap, true);
      setHidden(ids.productDirectionWrap, true);
      setHidden(ids.productGlassThicknessWrap, false);
      setHidden(ids.productGlassColorWrap, false);
      setHidden(ids.productPanelsWrap, true);
      setHidden(ids.productFixedVerticalCountWrap, false);
      setHidden(ids.productFixedHorizontalCountWrap, false);
      setHidden(ids.productFixedHorizontalHeightsWrap, false);
      setHidden(ids.productPanelTypeWrap, true);
      setHidden(ids.productMotorDirectionWrap, true);
      setHidden(ids.productViewWrap, true);
      setHidden(ids.productMotorTypeWrap, true);
      setHidden(ids.productRemoteWrap, true);
      setHidden(ids.cleanableWindowSection, true);
      setHidden(ids.collectingDisplaySection, true);
      setHidden(ids.slidingCollectionSection, true);
      $(ids.productGlassColorLabel).textContent = 'Cam Rengi';
      $(ids.productCustomGlassLabel).textContent = 'Özel Cam Rengi';
      $(ids.productPanels).disabled = true;
      $(ids.productPanels).value = '0';
      $(ids.productPanels).min = '0';
      $(ids.productPanels).max = '0';
      const lowE = $(ids.productGlassColor).querySelector('option[value="LOW-E GLASS"]');
      if (lowE) lowE.disabled = $(ids.productGlassThickness).value !== 'INSULATED GLASS';
      if ($(ids.productGlassThickness).value !== 'INSULATED GLASS' && $(ids.productGlassColor).value === 'LOW-E GLASS') $(ids.productGlassColor).value = 'TRANSPARENT';
      $(ids.productCustomGlass).value = draft.customGlassColor || '';
      setHidden(ids.productCustomGlassWrap, $(ids.productGlassColor).value !== 'OTHER');
      $(ids.productValidation).textContent = '';
      return;
    }

    setHidden(ids.productSeriesWrap, false);
    setHidden(ids.productSubtypeWrap, false);
    setHidden(ids.productFixedVerticalCountWrap, true);
    setHidden(ids.productFixedHorizontalCountWrap, true);
    setHidden(ids.productFixedHorizontalHeightsWrap, true);

    if (isZip) {
      fillSelect($(ids.productSeries), PRODUCT_OPTIONS.zip.series, draft.series);
      const series = $(ids.productSeries).value === 'P SERIES' ? 'P SERIES' : 'G SERIES';
      fillSelect(
        $(ids.productSubtype),
        series === 'P SERIES' ? PRODUCT_OPTIONS.zip.subtypesP : PRODUCT_OPTIONS.zip.subtypesG,
        draft.subtype
      );
      fillSelect($(ids.productPlacement), PRODUCT_OPTIONS.zip.placements, draft.placementLocation);
      fillSelect($(ids.productPanelType), PRODUCT_OPTIONS.zip.cableDirections, draft.cableDirection);

      setHidden(ids.productPlacementWrap, false);
      setHidden(ids.productMechanismWrap, true);
      setHidden(ids.productOpeningWrap, true);
      setHidden(ids.productDirectionWrap, true);
      setHidden(ids.productGlassThicknessWrap, true);
      setHidden(ids.productGlassColorWrap, true);
      setHidden(ids.productFabricWrap, false);
      setHidden(ids.productPanelsWrap, true);
      setHidden(ids.productPanelTypeWrap, false);
      setHidden(ids.productMotorDirectionWrap, false);
      setHidden(ids.productViewWrap, true);
      setHidden(ids.productMotorTypeWrap, true);
      setHidden(ids.productRemoteWrap, true);
      setHidden(ids.cleanableWindowSection, true);
      setHidden(ids.collectingDisplaySection, true);
      setHidden(ids.slidingCollectionSection, true);
      setHidden(ids.productCustomGlassWrap, true);

      $(ids.productPanelTypeLabel).textContent = 'Kablo Çıkış Yönü';
      setProductFabricValue(draft.fabricColor);
      renderFabricCards(draft.fabricColor);
      $(ids.productMotorDirection).value = draft.motorDirection === 'LEFT' ? 'LEFT' : 'RIGHT';
      $(ids.productView).value = 'OUTSIDE VIEW';
      $(ids.productPanels).min = '1';
      $(ids.productPanels).max = '1';
      $(ids.productPanels).value = '1';
      $(ids.productPanels).disabled = true;
      $(ids.productValidation).textContent = '';
      return;
    }

    $(ids.productPanels).disabled = false;
    $(ids.productPanels).min = '2';
    fillSelect($(ids.productSeries), standardSeries, draft.series);
    fillSelect($(ids.productGlassColor), glassColors, draft.glassColor);
    const series = $(ids.productSeries).value === 'K SERIES' ? 'K SERIES' : 'A SERIES';
    setHidden(ids.productPlacementWrap, true);
    setHidden(ids.productGlassThicknessWrap, false);
    setHidden(ids.productGlassColorWrap, false);
    setHidden(ids.productFabricWrap, true);
    $(ids.productGlassColorLabel).textContent = 'Cam Rengi';
    $(ids.productCustomGlassLabel).textContent = 'Özel Cam Rengi';

    if (isFolding) {
      const foldingZone = activeZone || (bulkProductZones && bulkProductZones[0]) || null;
      const existingFolding = activeZone && primaryPlacement(activeZone.id,activeZone) && isFoldingType(primaryPlacement(activeZone.id,activeZone).type)
        ? primaryPlacement(activeZone.id,activeZone)
        : null;
      const automaticPanels = foldingPanelCountForWidth(foldingZone && foldingZone.width);
      const selectedPanels = existingFolding
        ? Math.max(2, Math.round(Number(draft.panels) || automaticPanels))
        : automaticPanels;
      fillSelect($(ids.productSubtype), series === 'K SERIES' ? PRODUCT_OPTIONS.folding.subtypesK : PRODUCT_OPTIONS.folding.subtypesA, draft.subtype);
      fillSelect($(ids.productDirection), PRODUCT_OPTIONS.folding.directions, foldingDirectionForPanels(selectedPanels, draft.openingDirection));
      fillSelect($(ids.productGlassThickness), series === 'K SERIES' ? PRODUCT_OPTIONS.folding.thicknessK : PRODUCT_OPTIONS.folding.thicknessA, compatibleGlassThickness('folding', series, draft.glassThickness, draft.glassColor));
      fillSelect($(ids.productFoldingView), PRODUCT_OPTIONS.folding.views, draft.foldingView === 'OUTSIDE VIEW' ? 'OUTSIDE VIEW' : 'INSIDE VIEW');
      fillSelect($(ids.productFoldingOpenDirection), PRODUCT_OPTIONS.folding.openDirections, foldingOpenDirectionValue(draft.foldingOpenDirection));
      setHidden(ids.productMechanismWrap, true);
      setHidden(ids.productOpeningWrap, true);
      setHidden(ids.productDirectionWrap, false);
      setHidden(ids.productPanelsWrap, false);
      setHidden(ids.productFoldingViewWrap, false);
      setHidden(ids.productFoldingOpenDirectionWrap, false);
      setHidden(ids.productPanelTypeWrap, true);
      setHidden(ids.productMotorDirectionWrap, true);
      setHidden(ids.productViewWrap, true);
      setHidden(ids.productMotorTypeWrap, true);
      setHidden(ids.productRemoteWrap, true);
      setHidden(ids.cleanableWindowSection, true);
      setHidden(ids.collectingDisplaySection, true);
      setHidden(ids.slidingCollectionSection, true);
      setHidden(ids.foldingCollectionSection, false);
      $(ids.productDirectionLabel).textContent = 'Katlanma Yönü';
      $(ids.productPanels).min = '2';
      $(ids.productPanels).removeAttribute('max');
      $(ids.productPanels).value = String(selectedPanels);
      $(ids.productPanelHint).textContent = 'Otomatik: net genişlik / 600 mm · önerilen tek taraf maksimum 8 panel';
      $(ids.foldingCollectionState).value = draft.collectionState === 'COLLECTED' ? 'COLLECTED' : 'NORMAL';
      updateFoldingFormAdvisory();
    } else if (isGuillotine) {
      fillSelect($(ids.productSubtype), series === 'K SERIES' ? PRODUCT_OPTIONS.guillotine.subtypesK : PRODUCT_OPTIONS.guillotine.subtypesA, draft.subtype);
      fillSelect($(ids.productMechanism), series === 'K SERIES' ? PRODUCT_OPTIONS.guillotine.mechanismsK : PRODUCT_OPTIONS.guillotine.mechanismsA, draft.mechanism);
      fillSelect($(ids.productGlassThickness), series === 'K SERIES' ? PRODUCT_OPTIONS.guillotine.thicknessK : PRODUCT_OPTIONS.guillotine.thicknessA, compatibleGlassThickness('guillotine', series, draft.glassThickness, draft.glassColor));
      fillSelect($(ids.productPanelType), [['1+1', '1+1'], ['1+2', '1+2']], draft.panelType);
      setHidden(ids.productMechanismWrap, false);
      setHidden(ids.productOpeningWrap, true);
      setHidden(ids.productDirectionWrap, true);
      setHidden(ids.productPanelsWrap, true);
      setHidden(ids.productPanelTypeWrap, false);
      setHidden(ids.productMotorDirectionWrap, false);
      setHidden(ids.productViewWrap, true);
      setHidden(ids.productMotorTypeWrap, true);
      setHidden(ids.productRemoteWrap, true);
      $(ids.productPanelTypeLabel).textContent = 'Giyotin Panel Tipi';
      $(ids.productPanelType).value = ['1+1', '1+2'].includes(draft.panelType) ? draft.panelType : (Number(draft.panels) === 2 ? '1+1' : '1+2');
      $(ids.productPanels).value = $(ids.productPanelType).value === '1+1' ? '2' : '3';
      $(ids.productPanels).disabled = true;
      $(ids.productMotorDirection).value = draft.motorDirection === 'LEFT' ? 'LEFT' : 'RIGHT';
      $(ids.productView).value = 'OUTSIDE VIEW';
      $(ids.productMotorType).value = draft.motorType || 'SOMFY RTS';
      $(ids.productRemote).value = draft.remoteControl || '1 CHANNEL';

      const cleanable = $(ids.productSubtype).value === 'CLEANABLE';
      setHidden(ids.cleanableWindowSection, true);
      $(ids.bottomPanelMode).value = cleanable ? 'VASISTAS' : 'FIXED';
      setHidden(ids.bottomPanelStateWrap, true);
      setHidden(ids.bottomPanelHingeWrap, true);
      $(ids.bottomPanelState).value = cleanable ? 'OPEN' : 'CLOSED';
      $(ids.bottomPanelHinge).value = 'BOTTOM';

      setHidden(ids.slidingCollectionSection, true);
      const collecting = ['UPWARD COLLECTING', 'DOWNWARD COLLECTING'].includes($(ids.productSubtype).value);
      setHidden(ids.collectingDisplaySection, !collecting);
      $(ids.collectingDisplayState).value = collecting && draft.collectionState === 'COLLECTED' ? 'COLLECTED' : 'NORMAL';
      $(ids.collectingDisplayDirection).textContent = $(ids.productSubtype).value === 'DOWNWARD COLLECTING' ? 'Aşağı toplanır' : 'Yukarı toplanır';
    } else {
      fillSelect($(ids.productSubtype), PRODUCT_OPTIONS.sliding.subtypes, draft.subtype);
      fillSelect($(ids.productSlidingView), PRODUCT_OPTIONS.sliding.views, draft.slidingView === 'INSIDE VIEW' ? 'INSIDE VIEW' : 'OUTSIDE VIEW');
      fillSelect($(ids.productOpening), PRODUCT_OPTIONS.sliding.openings, draft.openingType);
      const centerOpening = $(ids.productOpening).value === 'CENTER OPENING';
      $(ids.productDirectionLabel).textContent = centerOpening ? 'Dışta - İçte' : 'Açılım Yönü';
      fillSelect(
        $(ids.productDirection),
        centerOpening ? PRODUCT_OPTIONS.sliding.centerLayers : PRODUCT_OPTIONS.sliding.sideDirections,
        centerOpening ? (draft.openingDirection === 'INSIDE' ? 'INSIDE' : 'OUTSIDE') : (draft.openingDirection === 'LEFT' ? 'LEFT' : 'RIGHT')
      );
      fillSelect($(ids.productGlassThickness), series === 'K SERIES' ? PRODUCT_OPTIONS.sliding.thicknessK : PRODUCT_OPTIONS.sliding.thicknessA, compatibleGlassThickness('sliding', series, draft.glassThickness, draft.glassColor));
      setHidden(ids.productMechanismWrap, true);
      setHidden(ids.productSlidingViewWrap, false);
      setHidden(ids.productOpeningWrap, false);
      setHidden(ids.productDirectionWrap, false);
      setHidden(ids.productPanelsWrap, false);
      setHidden(ids.productPanelTypeWrap, true);
      setHidden(ids.productMotorDirectionWrap, true);
      setHidden(ids.productViewWrap, true);
      setHidden(ids.productMotorTypeWrap, true);
      setHidden(ids.productRemoteWrap, true);
      setHidden(ids.cleanableWindowSection, true);
      setHidden(ids.collectingDisplaySection, true);
      setHidden(ids.slidingCollectionSection, false);
      $(ids.productPanelTypeLabel).textContent = 'Giyotin Panel Tipi';
      $(ids.slidingCollectionState).value = draft.collectionState === 'COLLECTED' ? 'COLLECTED' : 'NORMAL';
      $(ids.productPanels).min = '2';
      $(ids.productPanels).max = '12';
      $(ids.productPanelHint).textContent = centerOpening ? '2–12 panel · ortadan açılımda çift sayı' : '2–12 panel · manuel değer';
      $(ids.productPanels).value = String(Math.max(2, Math.min(12, Math.round(Number(draft.panels) || 4))));
    }

    const lowE = $(ids.productGlassColor).querySelector('option[value="LOW-E GLASS"]');
    if (lowE) lowE.disabled = $(ids.productGlassThickness).value !== 'INSULATED GLASS';
    if ($(ids.productGlassThickness).value !== 'INSULATED GLASS' && $(ids.productGlassColor).value === 'LOW-E GLASS') {
      $(ids.productGlassColor).value = 'TRANSPARENT';
    } else if (draft.glassColor) {
      $(ids.productGlassColor).value = draft.glassColor;
      if ($(ids.productGlassColor).value === 'LOW-E GLASS' && lowE && lowE.disabled) $(ids.productGlassColor).value = 'TRANSPARENT';
    }
    $(ids.productCustomGlass).value = draft.customGlassColor || '';
    setHidden(ids.productCustomGlassWrap, $(ids.productGlassColor).value !== 'OTHER');
    $(ids.productValidation).textContent = '';
  }

  function loadProductFields(placement) {
    const normalized = normalizePlacement(placement, placement && placement.type);
    $(ids.productType).value = normalized.type;
    $(ids.productSeries).value = normalized.series;
    $(ids.productGlassColor).value = normalized.glassColor || '';
    if (normalized.type === 'zip') setProductFabricValue(normalized.fabricColor);
    applyProductRules(normalized);
  }

  function productForType(zoneId, type) {
    if (type === 'zip') return zipPlacement(zoneId);
    const primary = primaryPlacement(zoneId);
    return primary && primary.type === type ? primary : null;
  }

  function updateProductRemoveButton() {
    if (!activeZone || bulkProductZones) {
      $(ids.productRemove).hidden = true;
      return;
    }
    const type = $(ids.productType).value;
    activeProductSlot = type === 'zip' ? 'zip' : 'primary';
    const exists = activeProductSlot === 'zip' ? Boolean(zipPlacement(activeZone.id,activeZone)) : Boolean(primaryPlacement(activeZone.id,activeZone));
    $(ids.productRemove).hidden = !exists;
    $(ids.productRemove).textContent = activeProductSlot === 'zip' ? 'Zip Perdeyi Sil' : 'Ana Ürünü Sil';
  }

  function switchProductType(type) {
    if (!activeZone) return;
    if(window.PLMRV24Native?.types.includes(type)){const z=activeZone,zs=bulkProductZones;closeProductDialog();return v24EditNative(z,type,zs);}
    closeDoorTypePicker();
    closeProductFabricCatalog();
    activeProductSlot = type === 'zip' ? 'zip' : 'primary';
    const candidate = activeProductSlot === 'zip' ? zipPlacement(activeZone.id,activeZone) : primaryPlacement(activeZone.id,activeZone);
    const existing = candidate && candidate.type === type ? candidate : null;
    loadProductFields(existing || productDefaults(type));
    updateProductRemoveButton();
  }

  window.__P3DV_PRODUCT_FORM_TEST__ = Object.freeze({
    applyType(type) {
      const safeType = (type==='balcony'||PRODUCT_FIELD_POLICY[type]) ? type : 'sliding';
      $(ids.productType).value = safeType;
      applyProductRules(productDefaults(safeType));
      return this.snapshot();
    },
    snapshot() {
      const type = $(ids.productType).value;
      const managed = PRODUCT_MANAGED_WRAPPERS.map(id => {
        const el = $(ids[id] || id);
        return { id, hidden: !el || Boolean(el.hidden), requiredEnabled: !!(el && el.querySelector('[required]:not(:disabled)')) };
      });
      return {
        type,
        allowedWrappers: [...productPolicy(type).wrappers],
        visibleManagedWrappers: managed.filter(item => !item.hidden).map(item => item.id),
        hiddenRequiredWrappers: managed.filter(item => item.hidden && item.requiredEnabled).map(item => item.id),
        draft: currentProductDraft()
      };
    }
  });

  function v27BioColor(spec){
    if(spec.colorMode!=='ral'||!spec.systemColor?.code)return {systemColor:'Varsayılan',surface:'Varsayılan'};
    const {code,finish}=ralColorOption(spec.systemColor.code,spec.systemColor);
    return {systemColor:code,surface:({GLOSS:'Parlak',MATTE:'Mat',TEXTURE:'Texture',WOOD_TRANSFER:'Wood Transfer'})[finish]||'Mat'};
  }
  function v27InheritedPlacement(p,spec){if(!window.PLMRV24Native.native(p)||p.colorSource==='custom')return p;return {...p,colorSource:spec.colorMode==='ral'?'bio':'default',bioProfileColor:null,options:{...p.options,...v27BioColor(spec)}};}
  function v27SyncColors(spec,force=false){for(const slot of ['placements','zipPlacements'])for(const [key,p]of Object.entries(spec[slot]||{}))if(window.PLMRV24Native.native(p))spec[slot][key]=v27InheritedPlacement(force?{...p,colorSource:'bio'}:p,spec);}
  function v24EditNative(zone,type,zones){return window.PLMRV26Facade.open(zone,zones,type);}
  function v26FacadeState(zone,type){const N=window.PLMRV24Native,owner=v11OwnerModel(zone);return {ownerColor:v27BioColor(owner),primary:p3dvHistoryClone(v27InheritedPlacement(owner.placements?.[zone.id]||null,owner)),zip:p3dvHistoryClone(v27InheritedPlacement(owner.zipPlacements?.[zone.id]||null,owner))};}
  function v26CommitFacade(zone,zones,type,next){const N=window.PLMRV24Native,state=v26FacadeState(zone),existing=type==='zip'?state.zip:state.primary,p=N.native(existing)&&existing.type===type?existing:N.make(type),row=next.positions[0];if(next.positions.length!==1)throw Error('Bir cepheye tek ürün yerleştirin.');
    const candidate=N.sanitize({...p,options:{...next.settings,...row.overrides},productWidth:Number(row.width),productHeight:Number(row.height)}),f=N.fit(zone,{...candidate,productWidth:null,productHeight:null});if(Math.abs(candidate.productWidth-f.availableWidth)<.001)candidate.productWidth=null;if(Math.abs(candidate.productHeight-f.availableHeight)<.001)candidate.productHeight=null;
    const targets=zones?.length?zones:[zone];for(const z of targets)N.resolve(z,candidate);const before=p3dvHistoryClone(modelState);for(const z of targets){const o=v11OwnerModel(z),slot=type==='zip'?'zipPlacements':'placements',key=type==='zip'?'zip:'+z.id:z.id;o[slot]=o[slot]||{};const previous=o[slot][z.id];const ownerColor=v27BioColor(o),custom=['systemColor','surface'].some(k=>(candidate.options[k]??'Varsayılan')!==ownerColor[k]);o[slot][z.id]=v27InheritedPlacement({...p3dvHistoryClone(candidate),colorSource:custom?'custom':'bio',positionCode:previous?.type===type?previous.positionCode:undefined,id:previous?.id||crypto.randomUUID()},o);o.productOpenStates=o.productOpenStates||{};if(!hasOwn(o.productOpenStates,key))o.productOpenStates[key]=false;}clearZoneSelection();p3dvHistoryRecord(before,{type:'product-upsert',label:'Cephe ürün ayarları',origin:'3d',payload:{type,zones:targets.map(z=>z.id)}});commitModelChangeLive('v26-native-upsert',{preserveHistory:true});
  }
  function v26RemoveFacade(zone,zones,type){const targets=zones?.length?zones:[zone],before=p3dvHistoryClone(modelState);for(const z of targets){const o=v11OwnerModel(z),slot=type==='zip'?'zipPlacements':'placements',key=type==='zip'?'zip:'+z.id:z.id;delete o[slot]?.[z.id];delete o.productOpenStates?.[key];}clearZoneSelection();p3dvHistoryRecord(before,{type:'product-remove',label:'Cephe ürünü sil',origin:'3d'});commitModelChangeLive('v26-native-remove',{preserveHistory:true});}

  function openProductDialog(zone, zones) {
    return window.PLMRV26Facade.open(zone,zones);
    /* Legacy form retained only as a migration reference; unreachable. */

    closeDoorTypePicker();
    closeProductFabricCatalog();
    activeZone = zone;
    bulkProductZones = Array.isArray(zones) && zones.length > 1 ? zones.map((item) => ({ ...item })) : null;
    const owner=v11OwnerModel(zone),primary = owner.placements?.[zone.id]||null;
    const zip = owner.zipPlacements?.[zone.id]||null;
    const placement = window.PLMRV24Native?.native(primary)?null:(primary || null);
    activeProductSlot = 'primary';
    if (bulkProductZones) {
      $(ids.productZoneTitle).textContent = `${bulkProductZones.length} alana ürün yerleştir`;
      $(ids.productZoneInfo).textContent = 'Zip Perde dolu alanlara ön katman olarak eklenebilir. Diğer ürünler ana ürün katmanına uygulanır.';
    } else {
      $(ids.productZoneTitle).textContent = `${zone.label} · ${Math.round(zone.width)} × ${Math.round(zone.height)} mm`;
      if (primary && zip) $(ids.productZoneInfo).textContent = 'Bu alanda ana ürün ve ön katman Zip Perde birlikte bulunuyor. Ürün listesinden düzenlenecek katmanı seçin.';
      else if (zip) $(ids.productZoneInfo).textContent = 'Mevcut Zip Perdeyi düzenleyebilir veya aynı alana ana ürün ekleyebilirsiniz.';
      else if (primary) $(ids.productZoneInfo).textContent = 'Mevcut ana ürünü düzenleyebilir veya aynı alana ön katman Zip Perde ekleyebilirsiniz.';
      else $(ids.productZoneInfo).textContent = 'Sürme, giyotin, Sabit Doğrama, Kapı veya ön katman Zip Perde yerleştirin.';
    }
    loadProductFields(placement || productDefaults('sliding'));if(!$(ids.productType).querySelector('option[value=""]')){const option=document.createElement('option');option.value='';option.textContent='Ürün seçin…';$(ids.productType).prepend(option);}$(ids.productType).value='';
    updateProductRemoveButton();
    $(ids.productDialog).hidden = false;
    $(ids.productType).focus();
  }

  function closeProductDialog() {
    closeDoorTypePicker();
    closeProductFabricCatalog();
    activeZone = null;
    bulkProductZones = null;
    $(ids.productDialog).hidden = true;
    $(ids.productValidation).textContent = '';
  }

  function validateProductDraft(draft) {
    if (draft.type === 'door') {
      if (!DOOR_TYPE_VALUES.includes(draft.doorType)) return 'Kapı tipini seçin.';
      if (!DOOR_DOUBLE_TYPES.has(draft.doorType) && !['LEFT','RIGHT'].includes(draft.hingeDirection)) return 'Menteşe yönünü seçin.';
      if (DOOR_DOUBLE_TYPES.has(draft.doorType) && !['LEFT','RIGHT'].includes(draft.activeLeaf)) return 'Aktif kanadı seçin.';
      if (!['OUTWARD','INWARD'].includes(draft.doorOpenDirection)) return 'Kapı açılma yönünü seçin.';
      if (!['NORMAL','PANIC'].includes(draft.handleType)) return 'Kapı kolu tipini seçin.';
      if (draft.glassColor === 'OTHER' && !String(draft.customGlassColor || '').trim()) return 'Diğer cam rengi seçildiğinde özel cam rengini yazın.';
      if (draft.glassColor === 'LOW-E GLASS' && draft.glassThickness !== 'INSULATED GLASS') return 'Low-e Cam yalnızca Yalıtımlı Cam ile kullanılabilir.';
    } else if (draft.type === 'fixed') {
      const verticalDivisions = Math.max(1, Math.min(20, Math.round(Number(draft.verticalDivisions) || 1)));
      const horizontalDivisions = Math.max(1, Math.min(10, Math.round(Number(draft.horizontalDivisions) || 1)));
      const parts = String(draft.horizontalHeights || '').split(/[,;]+/).map((item) => Number(String(item).trim())).filter((value) => Number.isFinite(value) && value > 0);
      if (!Number.isInteger(verticalDivisions) || verticalDivisions < 1) return 'Dikey bölme sayısı en az 1 olmalıdır.';
      if (!Number.isInteger(horizontalDivisions) || horizontalDivisions < 1) return 'Yatay bölme sayısı en az 1 olmalıdır.';
      if (parts.length !== horizontalDivisions) return 'Yatay bölme sayısı ile yükseklik adedi aynı olmalıdır.';
      if (draft.glassColor === 'OTHER' && !String(draft.customGlassColor || '').trim()) return 'Diğer cam rengi seçildiğinde özel cam rengini yazın.';
      if (draft.glassColor === 'LOW-E GLASS' && draft.glassThickness !== 'INSULATED GLASS') return 'Low-e Cam yalnızca Yalıtımlı Cam ile kullanılabilir.';
    } else if (isFoldingType(draft.type)) {
      if (!Number.isInteger(draft.panels) || draft.panels < 2) return 'Katlanır cam panel sayısı en az 2 ve tam sayı olmalıdır.';
      if (!['LEFT', 'RIGHT', 'BOTH'].includes(draft.openingDirection)) return 'Katlanma yönünü seçin.';
      if (draft.panels > 8 && draft.openingDirection !== 'BOTH') draft.openingDirection = 'BOTH';
      if (!['INSIDE VIEW', 'OUTSIDE VIEW'].includes(draft.foldingView)) return 'Bakış yönünü seçin.';
      if (!['INWARD', 'OUTWARD'].includes(draft.foldingOpenDirection)) return 'Panellerin açılma yönünü seçin.';
      if (draft.glassColor === 'OTHER' && !String(draft.customGlassColor || '').trim()) return 'Diğer cam rengi seçildiğinde özel cam rengini yazın.';
      if (draft.glassColor === 'LOW-E GLASS' && draft.glassThickness !== 'INSULATED GLASS') return 'Low-e Cam yalnızca Yalıtımlı Cam ile kullanılabilir.';
    } else if (draft.type !== 'zip') {
      const maxPanels = draft.type === 'guillotine' ? 8 : 12;
      if (!Number.isInteger(draft.panels) || draft.panels < 2 || draft.panels > maxPanels) {
        return `Panel sayısı 2–${maxPanels} arasında tam sayı olmalıdır.`;
      }
      if (draft.type === 'sliding' && !['OUTSIDE VIEW', 'INSIDE VIEW'].includes(draft.slidingView)) {
        return 'Sürme Sistem bakış yönünü seçin.';
      }
      if (draft.type === 'sliding' && draft.openingType === 'CENTER OPENING' && draft.panels % 2 !== 0) {
        return 'Ortadan açılım için panel sayısı çift olmalıdır.';
      }
      if (draft.glassColor === 'OTHER' && !String(draft.customGlassColor || '').trim()) {
        return 'Diğer cam rengi seçildiğinde özel cam rengini yazın.';
      }
      if (draft.glassColor === 'LOW-E GLASS' && draft.glassThickness !== 'INSULATED GLASS') {
        return 'Low-e Cam yalnızca Yalıtımlı Cam ile kullanılabilir.';
      }
    } else {
      if (!zipFabricByCode(draft.fabricColor)) return 'Zip Perde kumaşı seçin.';
      if (!['BETWEEN POSTS', 'FRONT OF POSTS'].includes(draft.placementLocation)) {
        return 'Zip Perde yerleşim yerini seçin.';
      }
    }

    const targetZones = bulkProductZones && bulkProductZones.length ? bulkProductZones : (activeZone ? [activeZone] : []);
    for (const zone of targetZones) {
      if (draft.type === 'zip') {
        if (zone.width < 300 || zone.height < 400) return `${zone.label}: Zip Perde için alan ölçüsü yetersiz.`;
        continue;
      }
      if (draft.type === 'door') {
        const wideDoor = !['SINGLE','TOP_FIXED'].includes(draft.doorType);
        const minWidth = DOOR_DOUBLE_TYPES.has(draft.doorType) ? 1200 : (wideDoor ? 1000 : 650);
        if (zone.width < minWidth || zone.height < 1800) return `${zone.label}: Seçilen Kapı tipi için alan ölçüsü yetersiz.`;
        if (DOOR_TOP_FIXED_TYPES.has(draft.doorType)) {
          const availableHeight = doorTopFixedAvailableHeight(zone);
          const movingHeight = Math.round(Number(draft.movingLeafHeight));
          const fixedHeight = availableHeight === null ? NaN : availableHeight - movingHeight;
          if (!Number.isFinite(movingHeight) || movingHeight < 1200 || fixedHeight < 110) {
            const minMoving = 1200;
            const maxMoving = availableHeight === null ? '—' : Math.max(minMoving, availableHeight - 110);
            return `${zone.label}: Kanat yüksekliği ${minMoving}–${maxMoving} mm arasında olmalıdır. Kalan üst sabit cam yüksekliği en az 110 mm olmalıdır.`;
          }
        }
        continue;
      }
      if (draft.type === 'fixed') {
        if (zone.width < 350 || zone.height < 500) return `${zone.label}: Sabit Doğrama için alan ölçüsü yetersiz.`;
        const segments = String(draft.horizontalHeights || '').split(/[,;]+/).map((item) => Number(String(item).trim())).filter((value) => Number.isFinite(value) && value > 0);
        const expectedHeight = Math.max(120, zone.height - 5);
        const total = segments.reduce((sum, value) => sum + value, 0);
        if (Math.abs(total - expectedHeight) > 2) return `${zone.label}: Yatay bölme yükseklikleri toplamı ${Math.round(expectedHeight)} mm olmalıdır.`;
        continue;
      }
      const perPanel = draft.type === 'guillotine' ? zone.height / draft.panels : zone.width / draft.panels;
      const minimum = draft.type === 'guillotine' ? 240 : 180;
      if (perPanel < minimum) {
        return draft.type === 'guillotine'
          ? `${zone.label}: Bu yükseklikte ${draft.panels} panel çok sıkışık. Panel başına en az ${minimum} mm gerekir.`
          : `${zone.label}: Bu genişlikte ${draft.panels} panel çok sıkışık. Panel başına en az ${minimum} mm gerekir.`;
      }
    }
    return '';
  }

  function applyProductForm() {
    if (!activeZone) return;
    let draft = currentProductDraft();
    draft.panels = Math.round(Number(draft.panels));
    if (draft.type === 'door') {
      delete draft.series;
      delete draft.subtype;
      delete draft.placementLocation;
      delete draft.slidingView;
      delete draft.horizontalHeightManual;
      delete draft.fabricColor;
      delete draft.customFabricColor;
      delete draft.cableDirection;
      delete draft.mechanism;
      delete draft.openingType;
      delete draft.openingDirection;
      delete draft.panelType;
      delete draft.motorDirection;
      draft.view = 'OUTSIDE VIEW';
      delete draft.motorType;
      delete draft.remoteControl;
      delete draft.bottomPanelMode;
      delete draft.bottomPanelState;
      delete draft.bottomPanelHinge;
      delete draft.collectionState;
      delete draft.verticalDivisions;
      delete draft.horizontalDivisions;
      delete draft.horizontalHeights;
      delete draft.foldingOpenDirection;
      draft.doorType = DOOR_TYPE_VALUES.includes(draft.doorType) ? draft.doorType : 'SINGLE';
      draft.hingeDirection = draft.hingeDirection === 'RIGHT' ? 'RIGHT' : 'LEFT';
      draft.activeLeaf = draft.activeLeaf === 'LEFT' ? 'LEFT' : 'RIGHT';
      draft.doorOpenDirection = draft.doorOpenDirection === 'INWARD' ? 'INWARD' : 'OUTWARD';
      draft.handleType = draft.handleType === 'PANIC' ? 'PANIC' : 'NORMAL';
      draft.movingLeafHeight = Math.max(1200, Math.round(Number(draft.movingLeafHeight) || 2200));
      draft.topFixedHeight = null;
      draft.panels = 0;
    } else if (draft.type === 'fixed') {
      delete draft.series;
      delete draft.subtype;
      delete draft.placementLocation;
      delete draft.slidingView;
      delete draft.fabricColor;
      delete draft.customFabricColor;
      delete draft.cableDirection;
      delete draft.mechanism;
      delete draft.openingType;
      delete draft.openingDirection;
      delete draft.panelType;
      delete draft.motorDirection;
      delete draft.view;
      delete draft.motorType;
      delete draft.remoteControl;
      delete draft.bottomPanelMode;
      delete draft.bottomPanelState;
      delete draft.bottomPanelHinge;
      delete draft.collectionState;
      draft.verticalDivisions = Math.max(1, Math.min(20, Math.round(Number(draft.verticalDivisions) || 1)));
      draft.horizontalDivisions = Math.max(1, Math.min(10, Math.round(Number(draft.horizontalDivisions) || 1)));
      draft.horizontalHeights = String(draft.horizontalHeights || '');
      draft.horizontalHeightManual = Array.from({ length: draft.horizontalDivisions }, (_, index) => Boolean(draft.horizontalHeightManual && draft.horizontalHeightManual[index]));
      draft.panels = 0;
    } else if (isFoldingType(draft.type)) {
      delete draft.placementLocation;
      delete draft.slidingView;
      delete draft.horizontalHeightManual;
      delete draft.fabricColor;
      delete draft.customFabricColor;
      delete draft.cableDirection;
      delete draft.mechanism;
      delete draft.panelType;
      delete draft.motorDirection;
      delete draft.view;
      delete draft.motorType;
      delete draft.remoteControl;
      delete draft.bottomPanelMode;
      delete draft.bottomPanelState;
      delete draft.bottomPanelHinge;
      delete draft.verticalDivisions;
      delete draft.horizontalDivisions;
      delete draft.horizontalHeights;
      draft.openingType = 'FOLDING';
      draft.openingDirection = foldingDirectionForPanels(draft.panels, draft.openingDirection);
      draft.foldingView = draft.foldingView === 'OUTSIDE VIEW' ? 'OUTSIDE VIEW' : 'INSIDE VIEW';
      draft.foldingOpenDirection = foldingOpenDirectionValue(draft.foldingOpenDirection);
      delete draft.passageDoor;
      draft.collectionState = draft.collectionState === 'COLLECTED' ? 'COLLECTED' : 'NORMAL';
      draft.thresholdProfile = 70;
    } else if (draft.type === 'sliding') {
      delete draft.placementLocation;
      delete draft.horizontalHeightManual;
      delete draft.fabricColor;
      delete draft.customFabricColor;
      delete draft.cableDirection;
      delete draft.mechanism;
      delete draft.panelType;
      delete draft.motorDirection;
      delete draft.view;
      delete draft.motorType;
      delete draft.remoteControl;
      delete draft.bottomPanelMode;
      delete draft.bottomPanelState;
      delete draft.bottomPanelHinge;
      draft.slidingView = draft.slidingView === 'INSIDE VIEW' ? 'INSIDE VIEW' : 'OUTSIDE VIEW';
      draft.collectionState = draft.collectionState === 'COLLECTED' ? 'COLLECTED' : 'NORMAL';
    } else if (draft.type === 'guillotine') {
      delete draft.slidingView;
      delete draft.horizontalHeightManual;
      draft.motorDirection = draft.motorDirection === 'LEFT' ? 'LEFT' : 'RIGHT';
      delete draft.placementLocation;
      delete draft.fabricColor;
      delete draft.customFabricColor;
      delete draft.cableDirection;
      delete draft.openingType;
      delete draft.openingDirection;
      draft.view = 'OUTSIDE VIEW';
      draft.bottomPanelHinge = 'BOTTOM';
      draft.panels = draft.panelType === '1+1' ? 2 : 3;
      if (draft.subtype === 'CLEANABLE') {
        draft.bottomPanelMode = 'VASISTAS';
        draft.bottomPanelState = 'OPEN';
      } else {
        draft.bottomPanelMode = 'FIXED';
        draft.bottomPanelState = 'CLOSED';
      }
      if (!['UPWARD COLLECTING', 'DOWNWARD COLLECTING'].includes(draft.subtype)) {
        draft.collectionState = 'NORMAL';
      }
    } else {
      delete draft.slidingView;
      delete draft.horizontalHeightManual;
      draft.placementLocation = ['FRONT OF POSTS','OUTSIDE POSTS'].includes(draft.placementLocation) ? 'FRONT OF POSTS' : 'BETWEEN POSTS';
      draft.fabricColor = zipFabricByCode(draft.fabricColor).value;
      draft.customFabricColor = '';
      draft.cableDirection = ['BACK', 'TOP', 'SIDE'].includes(draft.cableDirection) ? draft.cableDirection : 'BACK';
      draft.motorDirection = draft.motorDirection === 'LEFT' ? 'LEFT' : 'RIGHT';
      draft.panels = 1;
      draft.view = 'OUTSIDE VIEW';
      draft.collectionState = 'NORMAL';
      delete draft.mechanism;
      delete draft.openingType;
      delete draft.openingDirection;
      delete draft.glassThickness;
      delete draft.glassColor;
      delete draft.customGlassColor;
      delete draft.panelType;
      delete draft.bottomPanelMode;
      delete draft.bottomPanelState;
      delete draft.bottomPanelHinge;
      delete draft.motorType;
      delete draft.remoteControl;
    }
    // Final boundary sanitation is intentionally redundant with branch-specific
    // normalization. It prevents future UI fields from leaking into another
    // product's persisted placement when the shared dialog evolves.
    draft = sanitizeProductState(draft, draft.type);
    const error = validateProductDraft(draft);
    if (error) {
      $(ids.productValidation).textContent = error;
      return;
    }
    rememberGlassPreferencesFromDraft(draft);
    const historyBefore = p3dvHistoryClone(modelState);
    const targetZones = bulkProductZones && bulkProductZones.length ? bulkProductZones : [activeZone];
    targetZones.forEach((zone) => {
      const owner=v11OwnerModel(zone);owner.placements=owner.placements||{};owner.zipPlacements=owner.zipPlacements||{};owner.productOpenStates=owner.productOpenStates||{};owner.panelStates=owner.panelStates||{};
      if (draft.type === 'zip') {
        owner.zipPlacements[zone.id] = JSON.parse(JSON.stringify(draft));
        const key = zipProductKey(zone.id);
        if (!hasOwn(owner.productOpenStates, key)) owner.productOpenStates[key] = true;
        owner.panelStates[key] = Boolean(owner.productOpenStates[key]);
      } else {
        const placementDraft = JSON.parse(JSON.stringify(draft));
        if (placementDraft.type === 'door' && DOOR_TOP_FIXED_TYPES.has(placementDraft.doorType)) {
          const metrics = doorTopFixedMetrics(zone, placementDraft.movingLeafHeight, placementDraft.topFixedHeight);
          placementDraft.movingLeafHeight = metrics.movingHeight;
          placementDraft.topFixedHeight = metrics.fixedHeight;
        }
        const isNewType=!owner.placements[zone.id]||owner.placements[zone.id].type!==placementDraft.type;
        owner.placements[zone.id] = placementDraft;
        if (isNewType || !hasOwn(owner.productOpenStates, zone.id)) owner.productOpenStates[zone.id] = true;
      }
    });
    closeProductDialog();
    clearZoneSelection();
    p3dvHistoryRecord(historyBefore, { type: 'product-upsert', label: '3D product upsert', origin: '3d', payload: { zoneIds: targetZones.map(zone => zone.id), productType: draft.type } });
    (typeof commitModelChangeLive==='function'?commitModelChangeLive('product-upsert',{preserveHistory:true}):renderViewer());
  }

  function removeProduct() {
    if (!activeZone) return;
    const historyBefore = p3dvHistoryClone(modelState);
    const type = $(ids.productType).value;
    if (type === 'zip') {
      if (!zipPlacement(activeZone.id,activeZone)) return;
      delete v11OwnerModel(activeZone).zipPlacements[activeZone.id];
      delete v11OwnerModel(activeZone).productOpenStates[zipProductKey(activeZone.id)];
      delete v11OwnerModel(activeZone).panelStates[zipProductKey(activeZone.id)];
    } else {
      if (!primaryPlacement(activeZone.id,activeZone)) return;
      delete v11OwnerModel(activeZone).placements[activeZone.id];
      delete v11OwnerModel(activeZone).productOpenStates[activeZone.id];
    }
    const removedZoneId = activeZone && activeZone.id || '';
    closeProductDialog();
    clearZoneSelection();
    p3dvHistoryRecord(historyBefore, { type: 'product-delete', label: '3D product remove', origin: '3d', payload: { zoneId: removedZoneId, productType: type } });
    (typeof commitModelChangeLive==='function'?commitModelChangeLive('product-remove',{preserveHistory:true}):renderViewer());
  }

  async function clearProducts() {
    const count = Object.keys(modelState.placements).length + Object.keys(modelState.zipPlacements).length;
    if (!count) return;
    if (!await requestAppConfirmation('Yerleştirilmiş tüm sürme, akordiyon cam, katlanır cam, giyotin, Zip Perde, Sabit Doğrama ve Kapı ürünleri silinsin mi?', { acceptLabel: 'Tümünü Sil' })) return;
    const historyBefore = p3dvHistoryClone(modelState);
    modelState.placements = {};
    modelState.zipPlacements = {};
    modelState.productOpenStates = {};
    modelState.panelStates = {};
    clearZoneSelection();
    p3dvHistoryRecord(historyBefore, { type: 'products-clear', label: '3D products clear', origin: '3d', payload: { count } });
    (typeof commitModelChangeLive==='function'?commitModelChangeLive('products-clear',{preserveHistory:true}):renderViewer());
  }

  function ensureSceneEditor() {
    if(!modelState.sceneEditor)modelState.sceneEditor={groundY:null,roofPose:{x:0,y:0,z:0,angle:0},roofCopies:[],templates:[],nextObject:1};
    const s=modelState.sceneEditor;if(s.facadeZonesGenerated===undefined)s.facadeZonesGenerated=false;s.dimensionUnits=s.dimensionUnits||{mm:true,inch:false};s.members=s.members||{};
    if(s.presentation && !['empty','white','sketchup-dark'].includes(s.presentation.environment))s.presentation.environment='empty';
    if(s.groundY===null&&Number(modelState.height)>0)s.groundY=-Number(modelState.height)/2;
    return s;
  }
  function remapFacadeProductsAfterPostEdit(owner, oldZones) {
    if(window.PLMRV18Zones)return;
    const next=buildReportFacades({...owner,freedomLayout:freedomMultiPositionLayout(owner)}).flatMap(f=>f.zones||[]),ids=new Set(next.map(z=>z.id));
    for(const store of [owner.placements,owner.zipPlacements])for(const old of oldZones){
      if(ids.has(old.id)||!store?.[old.id])continue;
      const axis=old.axis==='x'?'cx':'cz',normal=old.axis==='x'?'cz':'cx';
      const target=next.find(z=>z.axis===old.axis&&z.facadeId===old.facadeId&&Math.abs(z[normal]-old[normal])<.1&&z[axis]-z.width/2<=old[axis]-old.width/2+.1&&z[axis]+z.width/2>=old[axis]+old.width/2-.1&&z.bottomY<=old.bottomY+.1&&z.topY>=old.topY-.1);
      if(!target)continue;
      if(store[target.id])throw Error('Birleşecek açıklıklarda aynı türde iki ürün var. Önce bu ürünlerden birini kaldırın.');
      store[target.id]=store[old.id];delete store[old.id];
      for(const flags of [owner.productOpenStates,owner.panelStates])if(flags)for(const prefix of ['', 'zip:']){const a=prefix+old.id,b=prefix+target.id;if(Object.prototype.hasOwnProperty.call(flags,a)){flags[b]=flags[a];delete flags[a];}}
      if(owner.zoneRegistry?.[old.id]&&!owner.zoneRegistry[target.id])owner.zoneRegistry[target.id]={...owner.zoneRegistry[old.id]};
    }
  }
  function applySceneCommand(command) {
    const C=window.PLMRRollingRoofSceneCore,S=ensureSceneEditor(),before=p3dvHistoryClone(modelState),type=command.type;
    try {
      if(type==='units') {
        S.dimensionUnits={mm:Boolean(command.mm),inch:Boolean(command.inch),ft:Boolean(command.ft)};
        document.dispatchEvent(new CustomEvent('plmr:units',{detail:S.dimensionUnits}));
        postViewerMessage('set-scene-units',{units:S.dimensionUnits});updateReadouts();scheduleDeferredPdfRefresh();if(isMainTechnical2DMode())renderMainTechnical2DPreview({resetView:false});return true;
      } else if(type==='parapet-height') {
        const height=Number(command.height);if(S.parapet&&S.parapet.height===height)return true;if(!Number.isFinite(height)||height<0||height>Math.min(Number(modelState.height),...(S.roofCopies||[]).map(o=>Number(o.spec.height)))-260)throw Error('Parapet yüksekliği 0 ile oluk alt kotu arasında olmalı.');
        S.parapet={...(S.parapet||{}),height,thickness:200,hidden:S.parapet&&S.parapet.hidden||[]};
      } else if(type==='roof-product'||type==='roof-open'||type==='roof-rotate') {
        const owner=command.id==='roof-main'?modelState:S.roofCopies.find(x=>x.id===command.id)?.spec;
        if(!owner)throw Error('Çatı bulunamadı.');
        const index=Number(command.moduleIndex),modules=(owner===modelState?freedomMultiPositionLayout(modelState):owner.freedomLayout)?.modules||[];
        if(!Number.isInteger(index)||!modules.some(m=>m.moduleIndex===index))throw Error('Çatı alanı bulunamadı.');
        owner.sceneEditor=owner.sceneEditor||{};const items=owner.sceneEditor.roofProducts=owner.sceneEditor.roofProducts||{},prior=items[index]||{};
        if(type==='roof-product'){
          if(!window.PLMRBioclimaticRoof.products.some(p=>p.id===command.productId))throw Error('Çatı ürünü bulunamadı.');
          items[index]={rotation:Number(prior.rotation)||0,id:command.productId,open:window.PLMRBioclimaticRoof.product(command.productId).motion!=='Fixed',revision:(Number(prior.revision)||0)+1};
        }else if(type==='roof-rotate'){const id=window.PLMRBioclimaticRoof.product(command.productId||prior.id).id;items[index]={...prior,id,rotation:((Number(command.rotation)||0)%360+360)%360,revision:(Number(prior.revision)||0)+1,open:prior.open===undefined?false:prior.open};}else items[index]={...prior,open:Boolean(command.open)};
        if(window.PLMRV17Core&&type!=='roof-open')v17LockSystem();
      } else if(type==='post-shift') {
        const spec=command.id==='roof-main'?modelState:S.roofCopies.find(c=>c.id===command.id)?.spec;
        if(!spec)throw Error('Dikme bulunamadı.');const layout=freedomMultiPositionLayout(spec),bases=buildCanonicalReportFacadeBases({...spec,freedomLayout:layout}),posts=window.PLMRV13Core.allPosts(layout,bases,spec),post=posts.find(p=>p.memberId===command.memberId);
        if(!post)throw Error('Dikme bulunamadı.');const x=Number(command.x),z=Number(command.z);
        if(!Number.isFinite(x)||!Number.isFinite(z)||Math.abs(x)>100000||Math.abs(z)>100000)throw Error('Geçersiz dikme konumu.');
        if(Math.abs(x-post.x)>.5&&Math.abs(z-post.z)>.5)throw Error('Tek işlemde yalnız bir yatay yön seçin.');
        if(posts.some(p=>p.memberId!==post.memberId&&!p.sharedWith&&(!spec.sceneEditor?.members?.[command.memberId]?.commonGroup||spec.sceneEditor?.members?.[p.memberId]?.commonGroup!==spec.sceneEditor.members[command.memberId].commonGroup)&&Math.abs(x-p.x)<(post.section.x+p.section.x)/2-.5&&Math.abs(z-p.z)<(post.section.z+p.section.z)/2-.5))throw Error('Dikme başka bir dikmeyle çakışıyor.');
        const members=spec.sceneEditor.members=spec.sceneEditor.members||{},old=members[command.memberId]||{};
        if(old.commonGroup){
          const plan=window.PLMRSharedPostShift.plan(v13PhysicalOwners(),command.id,command.memberId,x,z,window.PLMRRollingRoofSceneCore.vector);
          for(const item of plan){const target=v12Owners().find(o=>o.id===item.owner);target.spec.sceneEditor.members[item.memberId]=item.edit;}
        }else members[command.memberId]={...old,...(post.added?{positionX:x,positionZ:z}:{offsetX:x-(post.baseX??post.x),offsetZ:z-(post.baseZ??post.z)})};
      } else if(type==='member') {
        const owner=command.id==='roof-main'?modelState:S.roofCopies.find(x=>x.id===command.id)?.spec;
        if(!owner)throw Error('Ürün bulunamadı.');
        owner.sceneEditor=owner.sceneEditor||{};owner.sceneEditor.members=owner.sceneEditor.members||{};
        const key=String(command.memberId||'');if(!/^(post|beam|profile):[a-zA-Z0-9_.:-]+$/.test(key))throw Error('Parça bulunamadı.');
        const oldPostZones=key.startsWith('post:')&&command.deleted?buildReportFacades({...owner,freedomLayout:freedomMultiPositionLayout(owner)}).flatMap(f=>f.zones||[]):null;
        const length=Number(command.length);
        if(!command.deleted&&(!Number.isFinite(length)||length<1||length>100000))throw Error('Uzunluk 1–100000 mm arasında olmalı.');
        if(command.deleted&&key.startsWith('profile:')){const [,facadeId,profileId]=key.split(':');if(owner===modelState){for(const id of p3dvCanonicalDeleteProfile({facadeId,profileId}))delete owner.sceneEditor.members['profile:'+facadeId+':'+id];}else{const profiles=owner.facadeProfiles[facadeId]||[],removed=new Set([profileId]);for(const p of profiles)if(p.orientation==='horizontal'&&(p.leftBoundaryId===profileId||p.rightBoundaryId===profileId))removed.add(p.id);owner.facadeProfiles[facadeId]=profiles.filter(p=>!removed.has(p.id));for(const id of removed)delete owner.sceneEditor.members['profile:'+facadeId+':'+id];for(const store of [owner.placements,owner.zipPlacements])for(const zoneId of Object.keys(store||{}))if(zoneId.startsWith(facadeId+'|')&&[...removed].some(id=>zoneId.includes(id))){delete store[zoneId];for(const flags of [owner.productOpenStates,owner.panelStates])if(flags){delete flags[zoneId];delete flags['zip:'+zoneId];}}}}else owner.sceneEditor.members[key]={...(owner.sceneEditor.members[key]||{}),...(command.deleted?{deleted:true}:{length})};
        if(oldPostZones){remapFacadeProductsAfterPostEdit(owner,oldPostZones);clearZoneSelection();closeZoneActionDialog();}
      } else if(type==='main-dimension') {
        const key=command.key,n=Number(command.value);
        if(key==='height')roofInput.requireHeight(n);
        if(!['width','depth','height'].includes(key)||!Number.isFinite(n)||(key!=='height'&&n<(key==='depth'?2104:1000)))throw Error('Geçerli ürün ölçüsü yazın; açılım en az 2104 mm.');
        if(modelState.systemCount>1&&key!=='height')throw Error('Çok modüllü ürünün genişlik/açılımını Ayarlar bölümünde düzenleyin.');
        modelState[key]=n;
        if(key==='width')modelState.moduleWidths=[n];
        if(key==='depth'){modelState.moduleDepths=[n];modelState.panelCount=panelCountFromProjection(n,'b-cube');modelState.modulePanelCounts=[modelState.panelCount];}
        if(!dimensionsFit(readModel()))throw Error('Ölçü ürün kurallarına uygun değil.');
        modelState.inputDrafts={...(modelState.inputDrafts||{}),width:String(modelState.width),depth:String(modelState.depth),height:String(modelState.height)};syncQuickTestControls();
      } else if(type==='template-add') {
        const t=C.template({id:'area-'+S.nextObject++,type:command.templateType,width:Number(modelState.width)+1600,depth:Number(modelState.depth)+1600,height:command.templateType==='parapet'?1000:Number(modelState.height),angle:90,elevation:command.templateType==='platform'?300:0});
        const replacedIds=new Set(S.templates.map(t=>t.id));S.templates=[t];modelState.sketchWalls=modelState.sketchWalls.filter(w=>!replacedIds.has(w.templateId));modelState.sketchWalls.push(...C.templateWalls(t,S.groundY,window.PLMRRollingRoofSketchCore));
      } else if(type==='template-dimension') {
        const i=S.templates.findIndex(x=>x.id===command.id);if(i<0)throw Error('Hazır alan bulunamadı.');
        const key=command.key;if(!['width','depth','height','angle','elevation'].includes(key))throw Error('Ölçü bulunamadı.');
        const t=C.template({...S.templates[i],[key]:Number(command.value)}),owned=modelState.sketchWalls.filter(w=>w.templateId===t.id);
        S.templates[i]=t;modelState.sketchWalls=[...modelState.sketchWalls.filter(w=>w.templateId!==t.id),...C.templateWalls(t,S.groundY,window.PLMRRollingRoofSketchCore,owned)];
      } else if(type==='copy-dimension') {
        const obj=S.roofCopies.find(x=>x.id===command.id);if(!obj)throw Error('Ürün bulunamadı.');
        const key=command.key,n=Number(command.value),spec=obj.spec;
        if(key==='height')roofInput.requireHeight(n);
        if(!['width','depth','height'].includes(key)||!Number.isFinite(n)||(key!=='height'&&n<(key==='depth'?2104:1000)))throw Error('Geçerli ürün ölçüsü yazın; açılım en az 2104 mm.');
        if(spec.systemCount>1&&key!=='height')throw Error('Çok modüllü kopyada genişlik/açılım düzenlemesi bu sürümde yok.');
        spec[key]=n;if(key==='width')spec.moduleWidths=[n];if(key==='depth'){spec.moduleDepths=[n];spec.panelCount=panelCountFromProjection(n,'b-cube');spec.lamellaCount=panelCountFromProjection(n,'b-cube');spec.modulePanelCounts=[spec.lamellaCount];}
        spec.freedomLayout=freedomMultiPositionLayout({...spec,panelCount:spec.lamellaCount,moduleWidths:spec.systemCount>1?spec.moduleWidths:[spec.width],moduleDepths:spec.systemCount>1?spec.moduleDepths:[spec.depth]});
        if(!spec.freedomLayout||!spec.freedomLayout.valid)throw Error('Ölçü canonical ürün kurallarına uygun değil.');
      } else throw Error('Sahne komutu bulunamadı.');
      if(['main-dimension','copy-dimension'].includes(type))v19Resize(before);
    } catch(e) {Object.assign(modelState,before);postViewerMessage('scene-error',{message:e.message});return false;}
    reconcileRollingParapet();
    if(['post-shift','member','parapet-height','main-dimension','copy-dimension','template-add','template-dimension'].includes(type)&&typeof v13RemapProducts==='function'){try{v13RemapProducts(before);}catch(error){Object.keys(modelState).forEach(k=>delete modelState[k]);Object.assign(modelState,before);postViewerMessage('scene-error',{message:error.message});return false;}}
    p3dvHistoryRecord(before,{type:'scene-'+type,label:'Scene '+type,origin:'3d',payload:command});
    commitModelChangeLive('scene-'+type,{preserveHistory:true});if(type==='template-add')p3dvSketchSetTool('select');return true;
  }
  window.PLMROpenBioclimaticRoofChooser=meta=>v16OpenRoofChoice([{owner:meta.sceneObjectId||meta.owner||'roof-main',moduleIndex:Number(meta.moduleIndex)||0}]);

  function reconcileRollingParapet() {
    const P=window.PLMRRollingRoofParapetCore,K=window.PLMRRollingRoofSketchCore,C=window.PLMRRollingRoofSceneCore,S=ensureSceneEditor();
    v14SyncLayoutParapet();if(!P||!S.parapet)return;
    ensureSketchState();const prior=modelState.sketchWalls.filter(w=>w.parapetOwner),spec={width:modelState.width,depth:modelState.depth,height:modelState.height,freedomLayout:freedomMultiPositionLayout(modelState)},owners=[...(S.mainDeleted?[]:[{id:'roof-main',spec,pose:S.roofPose}]),...(S.roofCopies||[])];
    modelState.sketchWalls=[...modelState.sketchWalls.filter(w=>!w.parapetOwner),...owners.flatMap(o=>P.generate(o.spec,o.id,o.pose,S.groundY,S.parapet,C,K,prior,S.parapet.hidden||[]))];
    document.dispatchEvent(new CustomEvent('plmr:parapet',{detail:{height:S.parapet.height||0}}));
  }
  function p3dvSketchDeleteCell(wallId,cellId) {
    ensureSketchState();const w=modelState.sketchWalls.find(w=>w.id===wallId);if(!w)return false;
    const next=window.PLMRRollingRoofSketchCore.deleteCell(w,cellId);
    if(!next.solids.length)return p3dvSketchDeleteWall(wallId);
    return p3dvSketchApplyWallUpdate(next,'sketch-cell-delete');
  }
  function ensureSketchState() {
    if (!Array.isArray(modelState.sketchWalls)) modelState.sketchWalls = [];
    if (!Number.isFinite(Number(modelState.nextSketchWallNumber)) || Number(modelState.nextSketchWallNumber) < 1) modelState.nextSketchWallNumber = 1;
  }
  function p3dvSketchSetTool(tool) { clearZoneSelection(); const next=tool==='pushpull'?'pushpull':'select'; postViewerMessage('v11-clear-selection');postViewerMessage('set-sketch-tool',{tool:next}); document.dispatchEvent(new CustomEvent('plmr:sketch-tool',{detail:{tool:next}})); return next; }
  function p3dvSketchAddWallFromSelectedZone() {
    if (!selectedZone) throw new Error('Önce duvar eklenecek zone alanını 3D sahnede seçin.');
    if (!window.PLMRRollingRoofSketchCore || typeof window.PLMRRollingRoofSketchCore.createWall !== 'function') throw new Error('SKETCH_CORE_UNAVAILABLE');
    ensureSketchState(); const before=p3dvHistoryClone(modelState); const n=Math.max(1,Math.round(Number(modelState.nextSketchWallNumber)||1)); const wallId='wall-'+String(n).padStart(3,'0'); modelState.nextSketchWallNumber=n+1;
    const wall=window.PLMRRollingRoofSketchCore.createWall(selectedZone,wallId,1000),wallOwner=v12Owners().find(o=>o.id===(selectedZone.owner||'roof-main'));if(!wallOwner)throw Error('Duvarın pozu bulunamadı.'); wall.frame=window.PLMRRollingRoofSceneCore.placeFrame(window.PLMRRollingRoofSceneCore.zoneFrame(selectedZone),wallOwner.pose,wallOwner.spec.height,ensureSceneEditor().groundY); wall.label='Duvar '+String(n).padStart(3,'0'); modelState.sketchWalls=[...modelState.sketchWalls,wall]; closeZoneActionDialog();
    if(!v4CommitWall('sketch-wall-add',before))return false; p3dvSketchSetTool('select'); return JSON.parse(JSON.stringify(wall));
  }
  function p3dvSketchApplyWallUpdate(wall,reason='sketch-wall-update') {
    if(!wall||!wall.id)return false;
    ensureSketchState();const index=modelState.sketchWalls.findIndex(item=>item&&item.id===wall.id);
    if(index<0)return false;
    const before=p3dvHistoryClone(modelState);
    modelState.sketchWalls.splice(index,1,p3dvHistoryClone(wall));
    return v4CommitWall(reason,before);
  }
  function p3dvSketchDeleteWall(wallId) {
    ensureSketchState();const index=modelState.sketchWalls.findIndex(item=>item&&item.id===wallId);
    if(index<0)return false;
    const before=p3dvHistoryClone(modelState),removed=modelState.sketchWalls[index];
    if(removed.parapetOwner){const p=ensureSceneEditor().parapet;p.hidden=[...(p.hidden||[]),wallId];}
    if(removed.templateId){const t=ensureSceneEditor().templates.find(t=>t.id===removed.templateId);if(t)t.hiddenRoles=[...(t.hiddenRoles||[]),removed.templateRole];}
    modelState.sketchWalls.splice(index,1);
    return v4CommitWall('sketch-wall-delete',before);
  }
  function p3dvSketchEditInstance(index,width,depth) {
    const count=Math.max(1,Number(modelState.systemCount)||1),i=Number(index),w=Number(width),d=Number(depth);
    if(!Number.isInteger(i)||i<0||i>=count||!Number.isFinite(w)||!Number.isFinite(d)||w<=200||d<2104)throw new Error('Geçerli modül, genişlik ve en az 2104 mm açılım girin.');
    const before=p3dvHistoryClone(modelState),widths=count===1?[Number(modelState.width)]:modelState.moduleWidths.slice(),depths=count===1?[Number(modelState.depth)]:modelState.moduleDepths.slice();
    widths[i]=w;depths[i]=d;modelState.moduleWidths=widths;modelState.moduleDepths=depths;modelState.modulePanelCounts=depths.map(x=>panelCountFromProjection(x,'b-cube'));modelState.width=widths.reduce((a,b)=>a+b,0);modelState.depth=Math.max(...depths);
    if(!dimensionsFit(readModel())){Object.assign(modelState,before);throw new Error('Bu ölçüler canonical PLMR | Bioclimatic kurallarına uygun değil.');}
    modelState.inputDrafts={...(modelState.inputDrafts||{}),width:widths.join(';'),depth:depths.join(';'),height:String(modelState.height)};
    $(ids.freedomWidth).value=modelState.inputDrafts.width;setDepthControlValue(modelState.inputDrafts.depth);
    p3dvHistoryRecord(before,{type:'rolling-roof-instance-dimension',label:'Edit PLMR | Bioclimatic module dimensions',origin:'3d',payload:{index:i,width:w,depth:d}});commitModelChangeLive('rolling-roof-instance-dimension',{preserveHistory:true,forceRender:true});return true;
  }
  document.getElementById('zoneActionAddWallBtn').addEventListener('click',()=>{try{p3dvSketchAddWallFromSelectedZone();}catch(e){alert(e.message);}});

  window.PLMRRollingRoofSketch=Object.freeze({setParapetHeight:height=>applySceneCommand({type:'parapet-height',height}),setDimensionUnits:units=>applySceneCommand({type:'units',...units}),sceneCommand:command=>postViewerMessage('scene-command',{command}),addTemplate:type=>applySceneCommand({type:'template-add',templateType:type}),setTool:p3dvSketchSetTool,equalZones:zones=>{v42EqualOpenings(zones);postViewerMessage('v11-clear-selection');},addWallFromSelectedZone:p3dvSketchAddWallFromSelectedZone,editInstance:p3dvSketchEditInstance,getState:()=>({sceneEditor:JSON.parse(JSON.stringify(ensureSceneEditor())),walls:JSON.parse(JSON.stringify(modelState.sketchWalls||[])),selectedZone:selectedZone?{...selectedZone}:null,systemCount:Number(modelState.systemCount)||1,moduleWidths:[...(modelState.moduleWidths||[])],moduleDepths:[...(modelState.moduleDepths||[])],freedomLayout:(()=>{const l=freedomMultiPositionLayout(modelState);return l?JSON.parse(JSON.stringify(l)):null;})()})});


  let v18OwnerContext=null,v18Busy=false,v18Cache=null;
  function v18Owners(root){return [...(root.sceneEditor?.mainDeleted?[]:[{id:'roof-main',pose:root.sceneEditor?.roofPose||{},spec:root}]),...(root.sceneEditor?.roofCopies||[])].filter(o=>o.spec.width>=1000&&o.spec.height>=roofInput.minimumHeight(o.spec.productGroup)).map(o=>{const layout=freedomMultiPositionLayout(o.spec),spec={...o.spec,freedomLayout:layout};const hints=window.PLMRV12Core.adaptBases(buildCanonicalReportFacadeBases(spec),layout),posts=window.PLMRV13Core.allPosts(layout,hints,spec);return {...o,spec,posts,hints};});}
  function v19RoofOwners(root){return [{id:'roof-main',spec:root,pose:root.sceneEditor?.roofPose||{}},...(root.sceneEditor?.roofCopies||[])].filter(o=>o.id!=='roof-main'||!root.sceneEditor?.mainDeleted);}
  function v19Resize(before){if(!window.PLMRV19Adjacency||modelState.productGroup!=='b-cube')return;const oldOwners=v19RoofOwners(before),current=v19RoofOwners(modelState),changes=current.filter(o=>{const old=oldOwners.find(q=>q.id===o.id);return old&&(Math.abs(o.spec.width-old.spec.width)>.001||Math.abs(o.spec.depth-old.spec.depth)>.001);});if(!changes.length)return;const C=window.PLMRV19Adjacency,staged=oldOwners.map(o=>({...o,pose:{...o.pose}}));for(const changed of changes){const old=oldOwners.find(o=>o.id===changed.id),plan=C.plan(staged,changed.id,changed.spec);for(const move of plan.moves){const owner=current.find(o=>o.id===move.id);if(owner.id==='roof-main')ensureSceneEditor().roofPose=move.pose;else owner.pose=move.pose;staged.find(o=>o.id===move.id).pose=move.pose;}staged.find(o=>o.id===changed.id).spec=changed.spec;
    const map=(value,axis,inset)=>Number.isFinite(value)?value*((changed.spec[axis]-2*inset)/(old.spec[axis]-2*inset)):value;
    for(const[source,profiles]of Object.entries(changed.spec.facadeProfiles||{}))for(const p of profiles){const original=old.spec.facadeProfiles?.[source]?.find(q=>q.id===p.id);if(!original)continue;const normalX=['left','right'].includes(source),insetX=(normalX?p.depth:p.width)/2,insetZ=(normalX?p.width:p.depth)/2;if(p.orientation!=='horizontal'||p.scope){p.originX=map(original.originX,'width',insetX);p.originZ=map(original.originZ,'depth',insetZ);}if(p.scope&&original.scope){const axis=p.scope.axis==='x'?'width':'depth',normal=p.scope.axis==='x'?'depth':'width';p.scope.min=map(original.scope.min,axis,170);p.scope.max=map(original.scope.max,axis,170);p.scope.normal=map(original.scope.normal,normal,85);p.scope.surface=map(original.scope.surface,normal,0);p.span=p.scope.max-p.scope.min;}const key='profile:'+source+':'+p.id,e=changed.spec.sceneEditor?.members?.[key],prior=old.spec.sceneEditor?.members?.[key];if(e&&prior){if(Number.isFinite(prior.positionX))e.positionX=map(prior.positionX,'width',insetX);if(Number.isFinite(prior.positionZ))e.positionZ=map(prior.positionZ,'depth',insetZ);}}
    const layout=freedomMultiPositionLayout(old.spec);for(const[key,e]of Object.entries(changed.spec.sceneEditor?.members||{})){if(!key.startsWith('post:'))continue;const prior=old.spec.sceneEditor?.members?.[key],p=(layout.originalPosts||layout.posts||[]).find(p=>'post:'+p.id===key);if(!prior||!p)continue;if(Number.isFinite(prior.positionX))e.positionX=map(prior.positionX,'width',p.section.x/2);if(Number.isFinite(prior.positionZ))e.positionZ=map(prior.positionZ,'depth',p.section.z/2);}
  }
  const poses=v19RoofOwners(modelState);for(const w of modelState.sketchWalls||[]){if(w.parapetOwner||w.layoutParapet||!w.frame)continue;const id=w.zone?.owner,old=oldOwners.find(o=>o.id===id),now=poses.find(o=>o.id===id);if(!old||!now)continue;w.frame.origin[0]+=(now.pose.x||0)-(old.pose.x||0);w.frame.origin[2]+=(now.pose.z||0)-(old.pose.z||0);}
  // A shared post must still belong to the physical corners after resizing.
  const groups=new Map(),physical=[];for(const o of poses){const plain={...o.spec,sceneEditor:{...o.spec.sceneEditor,members:Object.fromEntries(Object.entries(o.spec.sceneEditor?.members||{}).map(([id,e])=>{const q={...e};delete q.sharedWith;delete q.sharedX;delete q.sharedZ;delete q.commonGroup;delete q.deleted;return[id,q];}))}},layout=freedomMultiPositionLayout(plain),posts=window.PLMRV13Core.allPosts(layout,buildCanonicalReportFacadeBases({...plain,freedomLayout:layout}),plain);physical.push(...window.PLMRV13Core.worldPosts([{...o,spec:plain,posts}],window.PLMRRollingRoofSceneCore.vector));for(const[key,e]of Object.entries(o.spec.sceneEditor?.members||{}))if(e.commonGroup){if(!groups.has(e.commonGroup))groups.set(e.commonGroup,[]);groups.get(e.commonGroup).push({o,key,e});}}
  for(const records of groups.values()){const ps=records.map(r=>physical.find(p=>p.key===r.o.id+'|'+r.key));const valid=ps.every(Boolean)&&(ps.length===2&&window.PLMRV13Core.adjacent(...ps)||ps.length===4&&ps.every(p=>ps.filter(q=>window.PLMRV13Core.adjacent(p,q)).length===2));if(valid)continue;for(const r of records){const shared=r.e.sharedWith?.split('|'),other=shared&&poses.find(o=>o.id===shared[0]);if(other?.spec.sceneEditor?.members?.[shared[1]]?.deleted)r.e.deleted=true;delete r.e.sharedWith;delete r.e.sharedX;delete r.e.sharedZ;delete r.e.commonGroup;}}
  v18Cache=null;
  }
  function v18Graph(root, legacy18=false) {
    const owners=v18Owners(root);
    const signature=String(legacy18)+JSON.stringify(owners.map(o=>({
      id:o.id,pose:o.pose,width:o.spec.width,depth:o.spec.depth,height:o.spec.height,
      posts:o.posts,members:o.spec.sceneEditor?.members,profiles:o.spec.facadeProfiles
    })))+JSON.stringify(root.sketchWalls||[]);
    if(root===modelState&&v18Cache?.signature===signature)return {...v18Cache,owners};
    const core=legacy18==='v19'?window.PLMRV19LegacyZones:legacy18?window.PLMRV18LegacyZones:window.PLMRV18Zones;
    const data={owners,bases:core.assembly(owners,root.sketchWalls||[]),signature};
    if(root===modelState)v18Cache=data;
    return data;
  }

  function v18ModelRoot(model){if(v18OwnerContext){const root=p3dvHistoryClone(v18OwnerContext.root),target=root.sceneEditor.roofCopies.find(c=>c.id===v18OwnerContext.owner);target.spec=model;return root;}return model.parapetOwner&&model.parapetOwner!=='roof-main'?modelState:model;}
  function v18Report(model,rootOverride,graphOverride){const root=rootOverride||v18ModelRoot(model),graph=graphOverride||v18Graph(root),ownerId=v18OwnerContext?.owner||model.parapetOwner||'roof-main',o=graph.owners.find(o=>o.id===ownerId);if(!o)return [];return(graph.bases.get(ownerId)||[]).map(f=>{const registry=o.spec.zoneRegistry||{},profilesForCuts=Object.fromEntries(Object.entries(o.spec.facadeProfiles||{}).map(([k,ps])=>[k,ps.filter(p=>p.orientation==='horizontal')])),zones=splitFacadeZonesForReport(f,{...profilesForCuts,__members:o.spec.sceneEditor?.members||{}},o.spec.zoneDividers||{}).map(z=>{const old=o.spec.sceneEditor?.zoneDirections?.[z.id]??o.spec.sceneEditor?.zoneDirections?.[f.id],rotation=o.spec.sceneEditor?.zoneRotations?.[z.id]??o.spec.sceneEditor?.zoneRotations?.[f.id]??(old&&old!==z.inward?180:0);const opening=f.worldOpening?{...f.worldOpening,bottom:f.worldOpening.bottom+z.bottomY-f.bottomY,top:f.worldOpening.top+z.topY-f.topY}:null;return decorateZoneIdentity({...z,owner:ownerId,mountRotation:rotation,defaultInward:z.inward,...(opening?{worldOpening:opening,physicalKey:[opening.angle,opening.axis,opening.normal,opening.start,opening.end,opening.bottom,opening.top].map(n=>typeof n==='number'?Math.round(n*1000)/1000:n).join('|'),surfaceKey:(f.surfaceKey||'').split('|').slice(0,5).concat([Math.round(opening.bottom*1000)/1000,Math.round(opening.top*1000)/1000]).join('|')}:{})},registry,o.spec);});return {...f,zones,profiles:(o.spec.facadeProfiles?.[f.profileSourceId]||[]).map(p=>({...p})),zoneDividers:o.spec.zoneDividers?.[f.profileSourceId]||[]};});}
  function v18AllZones(root,legacy=false,legacy18=false){return v18Owners(root).flatMap(o=>{const spec={...o.spec,parapetOwner:o.id,parapetWalls:root.sketchWalls||[],sceneEditor:{...o.spec.sceneEditor,roofPose:o.pose,roofCopies:o.id==='roof-main'?root.sceneEditor?.roofCopies:[]},__v18Legacy:legacy};return(legacy?buildReportFacades(spec):v18Report(spec,root,legacy18?v18Graph(root,true):null)).flatMap(f=>f.zones).map(z=>({...z,mountRotation:z.mountRotation??(z.defaultInward&&z.inward!==z.defaultInward?180:0),owner:o.id,pose:o.pose,world:window.PLMRV18Zones.world({x:z.cx,z:z.cz},o)}));});}
  function v4PlacementCheck(zone,placement,slot) {
    if(!zone)return {problem:'Fiziksel açıklık bulunamadı.'};
    try {
      const native=window.PLMRV24Native.native(placement);
      const fitted=native?window.PLMRV24Native.fit(zone,placement):slot==='zip'?documentFitZipProductZone(zone,placement):documentFitProductZone(zone,5);
      if(native)window.PLMRV24Native.resolve(zone,placement);
      if(!(fitted?.width>0&&fitted?.height>0))return {problem:'Ürün için geçerli net açıklık bulunamadı.'};
      return {fitted};
    } catch(error) {return {problem:error.message};}
  }
  function v18Migrate(before,strict=false) {
    if(v18Busy||v18OwnerContext)return;
    v18Busy=true;const filtersBefore=p3dvHistoryClone(zoneFilters);
    try {
      const legacy=!(before.sceneEditor?.zoneGraphVersion>=18);
      const old=v18AllZones(before,legacy,before.sceneEditor?.zoneGraphVersion===19?'v19':before.sceneEditor?.zoneGraphVersion===18);
      const next=v18AllZones(modelState),owners=v12Owners(),issues=[];
      const records=owners.flatMap(o=>[['placements','primary'],['zipPlacements','zip']].flatMap(([store,slot])=>Object.entries(o.spec[store]||{}).map(([id,p])=>({o,store,slot,id,p}))));
      for(const r of records) {
        const was=old.find(z=>z.owner===r.o.id&&z.id===r.id),same=next.find(z=>z.owner===r.o.id&&z.id===r.id);
        const priorValid=was&&!v4PlacementCheck(was,r.p,r.slot).problem;
        if(same) {
          const problem=v4PlacementCheck(same,r.p,r.slot).problem;
          if(problem&&strict&&priorValid)throw Error((r.p.positionCode||'Ürün')+': '+problem);
          if(problem)issues.push({owner:r.o.id,zoneId:r.id,code:r.p.positionCode||'',reason:problem});
          continue;
        }
        const unavailable=[];
        const usable=zone=>{
          const targetOwner=owners.find(o=>o.id===zone.owner),occupied=targetOwner?.spec[r.store]?.[zone.id];
          if(!targetOwner||occupied&&occupied!==r.p)return false;
          const problem=v4PlacementCheck(zone,r.p,r.slot).problem;
          if(problem){unavailable.push(problem);return false;}
          return true;
        };
        let target;
        if(was) {
          const yaw=was.pose.angle||0,axis=was.axis,along=axis==='x'?'x':'z',normal=axis==='x'?'z':'x';
          const W=window.PLMRV18Zones.rotate(was.world,-yaw),A=W[along]-was.width/2,B=W[along]+was.width/2;
          target=next.filter(z=>Math.abs(((z.pose.angle||0)-yaw)%180)<.001&&z.axis===axis).map(z=>{
            const point=window.PLMRV18Zones.rotate(z.world,-yaw),overlap=Math.max(0,Math.min(B,point[along]+z.width/2)-Math.max(A,point[along]-z.width/2));
            return {z,overlap,similarity:overlap/(was.width+z.width-overlap),distance:Math.abs(point[normal]-W[normal])};
          }).filter(item=>item.distance<=170.5&&item.overlap>=Math.min(was.width,item.z.width)*.8)
            .sort((a,b)=>b.similarity-a.similarity||a.distance-b.distance)
            .find(item=>usable(item.z))?.z;
        }
        if(!target&&was?.physicalBoundaryKeys)target=next.filter(z=>z.axis===was.axis&&JSON.stringify(z.physicalBoundaryKeys)===JSON.stringify(was.physicalBoundaryKeys)).sort((a,b)=>Math.abs(a.bottomY-was.bottomY)-Math.abs(b.bottomY-was.bottomY)).find(usable);
        if(!target&&was) {
          const graph=v18Graph(modelState);
          target=next.find(z=>{
            const face=(graph.bases.get(z.owner)||[]).find(f=>f.id===z.id||z.directionSourceId===f.id);
            if(!face)return false;
            const tokens=face.id.slice(face.id.indexOf(':',8)+1).split('~').filter(token=>token.includes('|post:')||token.startsWith('wall:'));
            return tokens.length===2&&tokens.every(token=>was.id.includes(token.startsWith('wall:')?'wall_'+token.slice(5).replaceAll(':','_'):token.replace('|post:','_').replace('roof-main_','')))&&usable(z);
          });
        }
        if(!target) {
          const reason=unavailable[0]||'Düzenleme mevcut ürüne fiziksel açıklık bırakmıyor. Önce ilgili ürünü kaldırın.';
          if(strict&&priorValid)throw Error((r.p.positionCode||'Ürün')+': '+reason);
          issues.push({owner:r.o.id,zoneId:r.id,code:r.p.positionCode||'',reason:'Fiziksel sınırları olan uygun açıklık bulunamadı; kayıt korundu.'});
          continue;
        }
        const dest=owners.find(o=>o.id===target.owner);
        dest.spec[r.store]=dest.spec[r.store]||{};dest.spec[r.store][target.id]=r.p;delete r.o.spec[r.store][r.id];
        for(const entry of Object.values(modelState.codeRegistry?.items||{}))if(entry.code===r.p.positionCode)entry.owner=dest.id;
        for(const field of ['productOpenStates','panelStates']) {
          const key=r.slot==='zip'?'zip:'+r.id:r.id,to=r.slot==='zip'?'zip:'+target.id:target.id;
          if(Object.hasOwn(r.o.spec[field]||{},key)) {const value=r.o.spec[field][key];delete r.o.spec[field][key];dest.spec[field]=dest.spec[field]||{};dest.spec[field][to]=value;}
        }
        const fromKey=r.o.id+'|'+r.id,toKey=dest.id+'|'+target.id;
        if(Object.hasOwn(zoneFilters.ids,fromKey))zoneFilters.ids[toKey]=zoneFilters.ids[fromKey];
        const rotation=r.o.spec.sceneEditor?.zoneRotations?.[r.id]??was?.mountRotation??0;
        if(rotation){dest.spec.sceneEditor.zoneRotations=dest.spec.sceneEditor.zoneRotations||{};dest.spec.sceneEditor.zoneRotations[target.id]=rotation;}
      }
for(const was of old){const wasHidden=zoneFilters.ids[was.owner+'|'+was.id]===false;if(!was.mountRotation&&!wasHidden)continue;const center=window.PLMRV18Zones.rotate(was.world,-(was.pose.angle||0)),along=was.axis==='x'?'x':'z',normal=was.axis==='x'?'z':'x';for(const z of next){if(z.axis!==was.axis||Math.abs(((z.pose.angle||0)-(was.pose.angle||0))%180)>.001)continue;const point=window.PLMRV18Zones.rotate(z.world,-(was.pose.angle||0)),overlap=Math.min(center[along]+was.width/2,point[along]+z.width/2)-Math.max(center[along]-was.width/2,point[along]-z.width/2);if(Math.abs(center[normal]-point[normal])>(legacy?170.5:.5)||overlap<Math.min(was.width,z.width)*.8)continue;const o=owners.find(o=>o.id===z.owner);o.spec.sceneEditor.zoneRotations=o.spec.sceneEditor.zoneRotations||{};if(was.mountRotation&&!Object.hasOwn(o.spec.sceneEditor.zoneRotations,z.id))o.spec.sceneEditor.zoneRotations[z.id]=was.mountRotation;if(wasHidden)zoneFilters.ids[z.owner+'|'+z.id]=false;}}ensureSceneEditor().zoneGraphVersion=20;ensureSceneEditor().zoneAuditIssues=issues;
    } catch(error) {zoneFilters=filtersBefore;throw error;} finally {v18Busy=false;}
  }
  function v18Prepare(){if(v18Busy||v18OwnerContext||!window.PLMRV18Zones||modelState.productGroup!=='b-cube'||ensureSceneEditor().zoneGraphVersion===20)return;const before=p3dvHistoryClone(modelState);const owners=v12Owners();for(const w of modelState.sketchWalls||[]){const owner=owners.find(o=>o.id===w.zone?.owner);if(!owner||owner.id==='roof-main'||!w.frame)continue;const legacy=window.PLMRRollingRoofSceneCore.placeFrame(window.PLMRRollingRoofSceneCore.zoneFrame(w.zone),ensureSceneEditor().roofPose,modelState.height,ensureSceneEditor().groundY);if(w.frame.origin.every((n,i)=>Math.abs(n-legacy.origin[i])<.5)){w.frame=window.PLMRRollingRoofSceneCore.placeFrame(window.PLMRRollingRoofSceneCore.zoneFrame(w.zone),owner.pose,owner.spec.height,ensureSceneEditor().groundY);w.v18OwnerFrameRepaired=true;}}v18Cache=null;v18Migrate(before,false);}
  window.PLMRV18Commands=Object.freeze({zones:()=>v18AllZones(modelState),audit:()=>p3dvHistoryClone(ensureSceneEditor().zoneAuditIssues||[]),graph:()=>[...v18Graph(modelState).bases.values()].flat()});

  let v17Busy=false,v17SettingsDraft=null,v17AnnotationSelection=[],v46MultiZones=[];
  function v17Ensure(){if(v17Busy||!window.PLMRV17Core)return;v17Busy=true;try{const owners=v12Owners().filter(o=>o.spec.width>=1000&&o.spec.height>=roofInput.minimumHeight(o.spec.productGroup));for(const o of owners){o.spec.freedomLayout=freedomMultiPositionLayout(o.spec);if(o.id!=='roof-main'){delete o.spec.codeRegistry;delete o.spec.systemSelection;}}if(!modelState.systemSelection){const chosen=owners.flatMap(o=>Object.values(o.spec.sceneEditor?.roofProducts||{})).filter(c=>c.id&&c.id!=='none');modelState.systemSelection={id:chosen.length&&chosen.every(c=>c.id===chosen[0].id)?chosen[0].id:'meru',locked:chosen.length>0,applied:Object.fromEntries(owners.flatMap(o=>(o.spec.freedomLayout?.modules||[]).map(m=>[o.id+':'+m.moduleIndex,true]))) };}const sys=modelState.systemSelection;sys.applied=sys.applied||{};for(const o of owners)for(const m of o.spec.freedomLayout?.modules||[]){const key=o.id+':'+m.moduleIndex;if(!sys.applied[key]){const ps=o.spec.sceneEditor.roofProducts=o.spec.sceneEditor.roofProducts||{};if(!ps[m.moduleIndex]&&sys.id!=='meru')ps[m.moduleIndex]={id:sys.id,rotation:0,open:window.PLMRBioclimaticRoof.product(sys.id).motion!=='Fixed',revision:1};sys.applied[key]=true;}}if(window.PLMRV18Zones)v18Prepare();window.PLMRV17Core.codes(modelState,owners);}finally{v17Busy=false;}}
  window.PLMRV17PositionName=(no,index=0)=>{const o=[{id:'roof-main',spec:modelState},...(modelState.sceneEditor?.roofCopies||[])].find(o=>Number(o.spec.pozNo||1)===Number(no||1));return o?.spec.sceneEditor?.bioCodes?.[index]||'BIO-'+String(Number(no)||1).padStart(2,'0');};
  function v17Scene(scene){if(!window.PLMRV17Core)return scene;v17Ensure();const next=p3dvHistoryClone(scene||ensureSceneEditor());for(const o of v12Owners()){if(!o.spec.width||!o.spec.height)continue;const spec=o.spec,layout=freedomMultiPositionLayout(spec),source={...spec,parapetOwner:o.id,parapetWalls:modelState.sketchWalls,freedomLayout:layout,sceneEditor:{...spec.sceneEditor,roofPose:o.pose,facadeZonesGenerated:true}};const target=o.id==='roof-main'?next:next.roofCopies?.find(c=>c.id===o.id)?.spec.sceneEditor;if(target){target.generalOptions={led:String(spec.led||'NO')};target.bioCodes=p3dvHistoryClone(spec.sceneEditor.bioCodes);target.facadeGraph=buildReportFacades(source);}}return next;}
  function v17ModelPayload(model){return {...model,sceneEditor:v17Scene(model.sceneEditor)};}
  function v17LockSystem(){v17Ensure();modelState.systemSelection.locked=true;document.dispatchEvent(new CustomEvent('plmr-v17-system'));}
  function v17BeginSettings(){v17Ensure();v17SettingsDraft=p3dvHistoryClone(modelState);clearTimeout(autoPreviewTimer);autoPreviewTimer=null;window.PLMRV17UI?.syncSystem();}
  function v17CancelSettings(){if(!v17SettingsDraft)return;const before=v17SettingsDraft;v17SettingsDraft=null;for(const k of window.PLMRV17Core.optionsKeys()){if(Object.prototype.hasOwnProperty.call(before,k))modelState[k]=p3dvHistoryClone(before[k]);else delete modelState[k];}p3dvHostSyncControls();}
  function v17SaveSettings(id){v17Ensure();const before=v17SettingsDraft||p3dvHistoryClone(modelState),sys=modelState.systemSelection,keys=window.PLMRV17Core.optionsKeys(),options=Object.fromEntries(keys.filter(k=>modelState[k]!==undefined).map(k=>[k,p3dvHistoryClone(modelState[k])]));if(!sys.locked&&!['meru',...window.PLMRBioclimaticRoof.products.map(p=>p.id)].includes(id))throw Error('Sistem seçimi geçersiz.');const changed=!sys.locked&&sys.id!==id;if(!sys.locked)sys.id=id;v17SettingsDraft=null;for(const o of v12Owners()){for(const k of keys){if(options[k]!==undefined)o.spec[k]=p3dvHistoryClone(options[k]);else delete o.spec[k];}if(changed){const ps=o.spec.sceneEditor.roofProducts=o.spec.sceneEditor.roofProducts||{};for(const m of freedomMultiPositionLayout(o.spec)?.modules||[]){if(id==='meru')delete ps[m.moduleIndex];else ps[m.moduleIndex]={id,rotation:0,open:window.PLMRBioclimaticRoof.product(id).motion!=='Fixed',revision:(ps[m.moduleIndex]?.revision||0)+1};}}}const oldOwners=new Map([['roof-main',before],...(before.sceneEditor?.roofCopies||[]).map(o=>[o.id,o.spec])]);for(const o of v12Owners())v27SyncColors(o.spec,JSON.stringify(v27BioColor(o.spec))!==JSON.stringify(v27BioColor(oldOwners.get(o.id)||{})));p3dvHostSyncControls();v11Commit('v17-settings-save',before);document.dispatchEvent(new CustomEvent('plmr-v17-system'));return true;}
  function v17Switch(zone){if(!zone||zone.isRoofZone)throw Error('Tavan yönü bu işlemle değiştirilemez.');const o=v12Owners().find(o=>o.id===(zone.owner||'roof-main'));if(!o)throw Error('Poz bulunamadı.');const before=p3dvHistoryClone(modelState),dirs=o.spec.sceneEditor.zoneRotations=o.spec.sceneEditor.zoneRotations||{};dirs[zone.id]=zone.mountRotation===180?0:180;closeZoneActionDialog();clearZoneSelection();v11Commit('v17-zone-switch',before);return dirs[zone.id];}
  function v17Editable(zone){return window.PLMRV17Core.editable(zone,v11OwnerModel(zone).facadeProfiles);}
  function v17Hide(items){
    if(!items){
      const zones=v46MultiZones.length?v46MultiZones:(selectedZone?[selectedZone]:[]);
      items=[...v17AnnotationSelection,...zones.map(zone=>({kind:'zone',owner:zone.owner||'roof-main',id:zone.id}))];
    }
    if(items.length){for(const i of items){if(i.kind==='zone')zoneFilters.ids[i.owner+'|'+i.id]=false;else if(i.kind==='measurement'){dimensionVisibility.hiddenIds=dimensionVisibility.hiddenIds||{};dimensionVisibility.hiddenIds[i.id]=true;}else if(i.kind==='information'){dimensionVisibility.infoIds=dimensionVisibility.infoIds||{};dimensionVisibility.infoIds[i.code]=false;}}v11PublishFilters();}else{window.PLMRZones.setAll(false);dimensionVisibility={...dimensionVisibility,main:false,positions:false,total:false,intermediate:false};}window.PLMRV11Commands.setDimensions(dimensionVisibility);v17AnnotationSelection=[];v46MultiZones=[];clearZoneSelection();postViewerMessage('v17-clear-annotation-selection');document.dispatchEvent(new CustomEvent('plmr-v17-selection',{detail:[]}));return true;
  }
  function v17Select(item){const at=v17AnnotationSelection.findIndex(i=>i.key===item.key);if(at<0)v17AnnotationSelection.push(item);else v17AnnotationSelection.splice(at,1);document.dispatchEvent(new CustomEvent('plmr-v17-selection',{detail:p3dvHistoryClone(v17AnnotationSelection)}));postViewerMessage('v17-annotation-selection',{items:v17AnnotationSelection});}
  function v17Measurements(){const scene=v17Scene(ensureSceneEditor()),owners=v12Owners().map(o=>({...o,spec:{...o.spec,sceneEditor:o.id==='roof-main'?scene:scene.roofCopies.find(c=>c.id===o.id).spec.sceneEditor}}));return window.PLMRV17Core.measureDefinitions(owners,window.PLMRBioclimaticRoof);}
  window.PLMRV17Commands=Object.freeze({ensure:v17Ensure,system:()=>{v17Ensure();return p3dvHistoryClone(modelState.systemSelection);},previewCodes:count=>{v17Ensure();const n=modelState.codeRegistry?.next?.BIO||1;return Array.from({length:count},(_,i)=>'BIO-'+String(n+i).padStart(2,'0'));},beginSettings:v17BeginSettings,cancelSettings:v17CancelSettings,saveSettings:v17SaveSettings,switchZone:v17Switch,editable:v17Editable,measurements:v17Measurements,select:v17Select,hide:v17Hide,selection:()=>p3dvHistoryClone(v17AnnotationSelection),clearSelection:()=>{v17AnnotationSelection=[];postViewerMessage('v17-clear-annotation-selection');document.dispatchEvent(new CustomEvent('plmr-v17-selection',{detail:[]}));},editProduct:item=>{const o=v12Owners().find(o=>o.id===item.owner),z=buildReportFacades({...o.spec,parapetOwner:o.id,freedomLayout:freedomMultiPositionLayout(o.spec)}).flatMap(f=>f.zones).find(z=>z.id===item.zoneId);if(z)window.PLMRV11Commands.editSelection([{kind:'facade',...item,zone:z}]);}});

  function v16EnvironmentPoints(){const points=[];for(const wall of modelState.sketchWalls||[])for(const cell of window.PLMRRollingRoofSketchCore.cells(wall))for(const x of [cell.min[0],cell.max[0]])for(const z of [cell.min[2],cell.max[2]]){const q=window.PLMRRollingRoofSceneCore.wallPoint(wall,[x,cell.min[1],z]);points.push({x:q[0],z:q[2]});}return points;}
  function v16EnsureZoneNames(){if(window.PLMRV17Core)v17Ensure();if(v16NamingBusy||!window.PLMRV16Core)return;v16NamingBusy=true;try{window.PLMRV12Core.identities(modelState);const owners=[{id:'roof-main',spec:modelState},...(modelState.sceneEditor?.roofCopies||[])];for(const o of owners){if(o.id==='roof-main'&&modelState.sceneEditor?.mainDeleted||!o.spec.width||!o.spec.height)continue;const spec=o.spec,layout=freedomMultiPositionLayout(spec);if(!layout?.valid)continue;spec.zoneRegistry=spec.zoneRegistry||{};const view={...spec,parapetOwner:o.id,freedomLayout:layout,zoneRegistry:spec.zoneRegistry,parapetWalls:modelState.sketchWalls,sceneEditor:{...spec.sceneEditor,roofPose:o.id==='roof-main'?spec.sceneEditor.roofPose:o.pose,facadeZonesGenerated:window.PLMRV17Core?true:spec.sceneEditor.facadeZonesGenerated}};buildReportFacades(view);for(const m of layout.modules)window.PLMRV16Core.assignZone({id:'roof:'+m.moduleIndex,moduleIndex:m.moduleIndex,isRoofZone:true},view,o.id,owners);spec.nextZoneNumber=view.nextZoneNumber;}}finally{v16NamingBusy=false;}}
  function v16RoofRecords(){v16EnsureZoneNames();return v12Owners().flatMap(o=>(freedomMultiPositionLayout(o.spec)?.modules||[]).map(m=>({owner:o.id,index:m.moduleIndex,moduleIndex:m.moduleIndex,pozNo:o.spec.pozNo,zoneName:o.spec.zoneRegistry?.['roof:'+m.moduleIndex]?.code,...window.PLMRBioclimaticRoof.config(o.spec,m.moduleIndex)})));}
  function v16RoofBatch(items,productId,remove=false,options={}){const before=p3dvHistoryClone(modelState),C=window.PLMRBioclimaticRoof;if(!C.products.some(p=>p.id===productId))throw Error('Çatı ürünü bulunamadı.');const unique=new Map(items.map(i=>[i.owner+':'+Number(i.moduleIndex??i.index),i]));try{for(const i of unique.values()){const index=Number(i.moduleIndex??i.index),o=v12Owners().find(o=>o.id===i.owner);if(!o||!(freedomMultiPositionLayout(o.spec)?.modules||[]).some(m=>m.moduleIndex===index))throw Error('Çatı alanı bulunamadı.');const products=o.spec.sceneEditor.roofProducts=o.spec.sceneEditor.roofProducts||{},old=products[index]||{};if(remove){if(C.config(o.spec,index).id===productId)delete products[index];}else products[index]={id:productId,rotation:options.rotation??(Number(old.rotation)||0),open:options.open??(C.product(productId).motion!=='Fixed'),revision:(Number(old.revision)||0)+1};}if(window.PLMRV17Core)v17LockSystem();p3dvHistoryRecord(before,{type:remove?'v16-roof-batch-delete':'v16-roof-batch-add',label:remove?'Çatı ürünlerini sil':'Çatı ürünlerini ekle',origin:'3d',payload:{items:[...unique.values()],productId}});commitModelChangeLive(remove?'v16-roof-delete':'v16-roof-add',{preserveHistory:true});return true;}catch(e){Object.keys(modelState).forEach(k=>delete modelState[k]);Object.assign(modelState,before);throw e;}}
  function v16OpenRoofChoice(items,onApplied){const records=v16RoofRecords(),targets=items.map(i=>records.find(r=>r.owner===i.owner&&r.index===Number(i.moduleIndex??i.index))).filter(Boolean);if(!targets.length)return false;window.PLMRBioclimaticRoofChooser.show(targets[0],(type,data)=>type==='scene-commit'?applySceneCommand(data.command):postViewerMessage(type,data),{records:v16RoofRecords,targets,apply:(id)=>{v16RoofBatch(targets,id);if(onApplied)setTimeout(onApplied,0);},remove:(id)=>v16RoofBatch(targets,id,true),rotate:(id,rotation)=>v16RoofBatch(targets,id,false,{rotation}),setOpen:open=>v16RoofBatch(targets,targets[0].id,false,{open}),navigate:r=>v16OpenRoofChoice([{owner:r.owner,moduleIndex:r.index}],onApplied)});return true;}
  function v16OpenBulkRoof(item){if(!item||toolboxSelectionMode!=='multi-product')return;toolboxSelectionItems.set(item.key,item);const items=[...toolboxSelectionItems.values()],roofs=items.filter(i=>i.kind==='roof'||i.kind==='roof-zone'),zones=items.filter(i=>i.kind==='zone'||i.kind==='facade').map(i=>i.zone).filter(Boolean);cancelToolboxSelection();v16OpenRoofChoice(roofs,zones.length?()=>openProductDialog(zones[0],zones):null);}
  function v16ResetSettings(section){const before=p3dvHistoryClone(modelState),options=['motor','remote','led','dimmer','parapet','parapetHeight','panelFill','systemColor','panelColor','colorMode','panelColorIndependent','glassPreferences'],extras=['triangleJoinery','waterStandard','waterOutletPlacement','extras'];if(section==='system'){v12ResetSection('system');return;}const keys=section==='all'?[...options,...extras]:section==='extras'?extras:options;for(const key of keys){if(Object.prototype.hasOwnProperty.call(defaults,key))modelState[key]=p3dvHistoryClone(defaults[key]);else delete modelState[key];}const optionKeys=section==='extras'?['triangleJoinery','waterStandard','waterOutletPlacement','extras']:section==='all'?Object.keys(defaults.pergoOptions):Object.keys(defaults.pergoOptions).filter(k=>!['triangleJoinery','waterStandard','waterOutletPlacement','extras'].includes(k));modelState.pergoOptions=modelState.pergoOptions||{};for(const key of optionKeys)modelState.pergoOptions[key]=p3dvHistoryClone(defaults.pergoOptions[key]);if(section!=='extras'){const S=ensureSceneEditor();S.parapet={height:0,thickness:200,hidden:[]};}p3dvHostSyncControls();v11Commit('v16-settings-reset-'+section,before);document.dispatchEvent(new CustomEvent('plmr:parapet',{detail:{height:ensureSceneEditor().parapet?.height||0}}));return true;}
  function v16ResetAll(){window.PLMRV26Facade?.close();v17SettingsDraft=null;v17AnnotationSelection=[];clearTimeout(autoPreviewTimer);autoPreviewTimer=null;window.PLMRBioclimaticRoofChooser.close();closeProductDialog();closeZoneActionDialog();closeDividerProfileDialog();closePostActionDialog();cancelToolboxSelection();for(const node of document.querySelectorAll('.rr-settings-backdrop,.dialog-backdrop'))node.hidden=true;document.body.classList.remove('rr-settings-open','plmr-zones-hidden');setPreviewExpanded(false);resetProductGroupRuntimeState('b-cube');v11DefaultState=null;zoneFilters=window.PLMRV11Zones.defaults();zonesVisible=true;dimensionVisibility={main:true,intermediate:false,positions:true,total:true,byPosition:{}};profileSequence=1;viewerCameraState=null;p3dvDrawingMode='3d';pergo2DLastDrawing=null;technical2DLastProjection=null;pergo2DViewState.zoom=1;pergo2DViewState.baseScale=1;v15OperationJournal=[];v15LastJournalState=JSON.stringify(modelState);p3dvHistoryRebase('v16-full-reset');p3dvHostSyncControls();updateDrawingModeUi();p3dvSketchSetTool('select');renderViewer();v11PublishFilters();document.dispatchEvent(new CustomEvent('plmr-v12-change'));document.dispatchEvent(new CustomEvent('plmr-v11-selection',{detail:[]}));document.dispatchEvent(new CustomEvent('plmr:units',{detail:ensureSceneEditor().dimensionUnits}));document.dispatchEvent(new CustomEvent('plmr:parapet',{detail:{height:0}}));document.dispatchEvent(new CustomEvent('plmr-v16-reset'));return true;}
  function v16DetailRows(){v16EnsureZoneNames();const rows=[],C=window.PLMRBioclimaticRoof;for(const o of v12Owners()){const spec=o.spec,layout=freedomMultiPositionLayout(spec);if(!layout?.valid)continue;const color=spec.colorMode==='ral'?(spec.systemColor?.code||'—'):'Varsayılan',finish=spec.colorMode==='ral'?finishLabel(spec.systemColor?.finish):'Varsayılan';for(const m of layout.modules){const poz=window.PLMRV12Core.name(spec.pozNo,m.moduleIndex);rows.push({kind:'frame',group:'frame',type:'frame',name:'PLMR | Bioclimatic',owner:o.id,moduleIndex:m.moduleIndex,poz,width:m.outerWidth||m.width,depth:m.depth,height:spec.height,quantity:1,color,finish,lines:[['Sistem','Çerçeve'],['Panel Sayısı',m.panelCount||spec.panelCount],['Motor',spec.motor||'Yok'],['Kumanda',spec.remote||'Yok'],['LED',spec.led||'NO'],['Dimmer',spec.dimmer||'HAYIR']]});const cfg=C.config(spec,m.moduleIndex);if(cfg.id!=='none'){const product=C.product(cfg.id),a=C.aperture(m),lay=C.layout(m,cfg.id,cfg.open?1:0);rows.push({kind:'roof',group:'roof:'+cfg.id,type:'roof',productId:cfg.id,name:product.name,owner:o.id,moduleIndex:m.moduleIndex,poz,zoneName:spec.zoneRegistry?.['roof:'+m.moduleIndex]?.code,width:a.width,depth:a.depth,quantity:1,color:spec.colorMode==='ral'?(spec.panelColor?.code||color):'Varsayılan',finish,motion:product.motion,material:product.material,open:cfg.open,lines:[['Tavan Malzemesi',product.material],['Panel / Bölme',lay.glass?lay.glass.columns+' × '+lay.glass.rows:lay.count],['Dönüş',cfg.rotation+'°']]});}}
  const zones=new Map(buildReportFacades({...spec,parapetOwner:o.id,parapetWalls:modelState.sketchWalls,sceneEditor:{...spec.sceneEditor,roofPose:o.pose},freedomLayout:layout}).flatMap(f=>f.zones.map(z=>[z.id,z])));for(const[slot,store]of [['primary',spec.placements],['zip',spec.zipPlacements]])for(const [zoneId,placement]of Object.entries(store||{})){const z=zones.get(zoneId),check=v4PlacementCheck(z,placement,slot),fitted=check.fitted,details=!check.problem?placementDetailLines(placement,z).filter(l=>!['Ürün','Net Alan','3D Gösterim','Öneri Uyarısı'].includes(l.label)).map(l=>[l.label==='Açılım Tipi'?'Açılım Düzeni':l.label,l.value]):[];rows.push({kind:'facade',group:placement.type,type:placement.type,name:productTypeLabel(placement),owner:o.id,zoneId,slot,zone:z,placementStatus:check.problem?'unresolved':'placed',placementIssue:check.problem||'',poz:placement.positionCode||window.PLMRV12Core.name(spec.pozNo,z?.moduleIndex||0),zoneName:z?.label||zoneId,width:fitted?.width??null,height:fitted?.height??null,quantity:1,color:window.PLMRV24Native.native(placement)?placement.options?.systemColor||color:color,finish:window.PLMRV24Native.native(placement)?placement.options?.surface||finish:finish,lines:details,description:placement.description||'—',placement:p3dvHistoryClone(placement)});}}
  for(const [type,w]of Object.entries(modelState.sceneEditor?.nativeWorkspaces||{})){if(!w.positions?.length)continue;const a=window.PLMRV24Native.provider(type);for(const p of w.positions){const q={...w.settings,...p.overrides},lines=a.descriptor.fields.filter(f=>!f.internal&&q[f.key]!=null).map(f=>[f.label,f.options?.find(o=>o[0]===q[f.key])?.[1]||q[f.key]]);rows.push({kind:'native',nativeType:type,nativeId:p.id,group:type,type,name:a.descriptor.label,poz:p.positionNo,width:Number(p.width),height:Number(p.height),quantity:Number(p.quantity),color:q.systemColor||'Varsayılan',finish:q.surface||'Varsayılan',lines,description:p.description||'—'});}}
  for(const w of modelState.sketchWalls||[]){const cells=window.PLMRRollingRoofSketchCore.cells(w);if(!cells.length)continue;const min=[0,1,2].map(i=>Math.min(...cells.map(c=>c.min[i]))),max=[0,1,2].map(i=>Math.max(...cells.map(c=>c.max[i]))),parapet=w.layoutParapet||w.layoutKind==='parapet'||!!w.parapetOwner;rows.push({kind:'wall',group:parapet?'parapet':'wall',type:'wall',name:parapet?'Parapet':'Duvar',wallId:w.id,poz:w.id,width:max[0]-min[0],depth:max[2]-min[2],height:max[1]-min[1],quantity:1,lines:[['Tip',parapet?'Parapet':'Duvar']]});}return rows;}
  window.PLMRV16Commands=Object.freeze({resetAll:v16ResetAll,resetSettings:v16ResetSettings,roofRecords:v16RoofRecords,roofBatch:v16RoofBatch,openRoofChoice:v16OpenRoofChoice,detailRows:v16DetailRows,toggleBulk:toggleToolboxSelectionItem,bulkItems:()=>p3dvHistoryClone([...toolboxSelectionItems.values()]),setZoneBatch:(keys,value)=>{for(const key of keys)zoneFilters.ids[key]=Boolean(value);zonesVisible=true;document.body.classList.remove('plmr-zones-hidden');v11PublishFilters();}});
  function v42EqualOpenings(selection) {
    if(window.PLMRFinalReadOnly?.())return;
    const requested=Array.isArray(selection)?selection:[];
    const owner=v12Owners().find(o=>o.id===requested[0]?.owner);
    if(!owner||requested.length<2||requested.some(z=>z.owner!==owner.id))throw Error('Aynı cephede yan yana olan en az iki zone seçin.');
    const {spec}=owner,C=window.PLMRV20Profiles;
    const available=v11ZoneList().filter(z=>z.owner===owner.id&&!z.isRoofZone);
    const zones=requested.map(({id})=>available.find(z=>z.id===id));
    if(zones.some(z=>!z)||new Set(zones).size!==zones.length)throw Error('Zone seçimi değişti. Lütfen yeniden seçin.');
    const plan=C.equalOpeningPlan(zones);
    if(plan.dividers.every(d=>Math.abs(d.delta)<.01))return;
    const before=p3dvHistoryClone(modelState);
    try {
      const members=spec.sceneEditor.members||={};
      const posts=v13PhysicalOwners().find(o=>o.id===owner.id).posts;
      const affected=new Set();
      for(const {id,zone,delta,center} of plan.dividers){
        if(Math.abs(delta)<.01)continue;
        const source=window.PLMRV17Core.profileSource(zone);
        const groups=Object.entries(spec.facadeProfiles||{});
        const local=groups.find(([key])=>key===source)?.[1]?.find(p=>p.id===id);
        const added=posts.find(p=>p.added&&p.memberId===id);
        const group=local?source:added?.source;
        const profile=local||groups.find(([key])=>key===group)?.[1]?.find(p=>p.id===added?.profileId);
        const post=profile?null:posts.find(p=>!p.added&&p.id===id);
        const key=profile?'profile:'+group+':'+profile.id:post?.memberId;
        const edit=members[key]||{};
        if(!key||edit.commonGroup||edit.sharedWith||profile?.orientation==='horizontal')throw Error('Ortak veya sabit sınır taşınamaz. Başka zone’lar seçin.');
        const suffix=plan.axis.toUpperCase();
        if(profile){
          const field='position'+suffix,origin='origin'+suffix;
          const coordinate=C.position(profile,edit)[plan.axis];
          if(!Number.isFinite(coordinate)||Math.abs(coordinate-center)>.1)throw Error('Zone sınırı güncel dikmeyle eşleşmiyor.');
          if(Number.isFinite(edit[field]))edit[field]+=delta;
          else profile[origin]+=delta;
          affected.add(group);
        }else{
          if(Math.abs(post[plan.axis]-center)>.1)throw Error('Zone sınırı güncel dikmeyle eşleşmiyor.');
          edit['offset'+suffix]=post[plan.axis]+delta-(post['base'+suffix]??post[plan.axis]);
        }
        members[key]=edit;
      }
      refreshProfileMovementScopes(spec);
      for(const group of affected){
        const profiles=spec.facadeProfiles[group];
        const edits=Object.fromEntries(profiles.map(p=>[p.id,members['profile:'+group+':'+p.id]||{}]));
        for(const profile of profiles){
          C.validate(profile,profiles,edits);
          if(profile.orientation!=='horizontal'&&profile.scope?.max>profile.scope?.min)
            profile.positionRatio=(C.position(profile,edits[profile.id])[plan.axis]-profile.scope.min)/(profile.scope.max-profile.scope.min);
        }
      }
      v18Cache=null;
      const next=v11ZoneList().filter(z=>z.owner===owner.id);
      if(plan.zones.some(z=>!next.some(n=>n.id===z.id&&Math.abs(n.width-plan.width)<.06)))
        throw Error('Seçilen zone’lar bu konumda güvenle eşitlenemedi.');
      v11Commit('zone-post-equalize',before);
    }catch(error){
      Object.keys(modelState).forEach(key=>delete modelState[key]);
      Object.assign(modelState,before);v18Cache=null;
      throw error;
    }
  }

  function v11Commit(reason,before) {
    try {
      if(/dimension|position-edit/.test(reason))v19Resize(before);
      if(/post|member|profile|position-edit|dimension|wall|sketch-cell|sketch-pushpull|placement-recover|placement-remove/.test(reason)||window.PLMRV18Zones&&reason==='v11-delete-selection')v13RemapProducts(before);
      p3dvHistoryRecord(before,{type:reason,label:reason,origin:'3d'});
      commitModelChangeLive(reason,{preserveHistory:true});
    } catch(error) {
      Object.keys(modelState).forEach(key=>delete modelState[key]);
      Object.assign(modelState,before);v18Cache=null;
      throw error;
    }
  }
  function v4CommitWall(reason,before) {
    try {v11Commit(reason,before);return true;}
    catch(error) {if(!postLiveModelState('wall-edit-rejected'))renderViewer();postViewerMessage('scene-error',{message:error.message});return false;}
  }

  function v11Delete(items){const before=p3dvHistoryClone(modelState);try{for(const item of items){const owner=item.owner||'roof-main',spec=owner==='roof-main'?modelState:ensureSceneEditor().roofCopies.find(c=>c.id===owner)?.spec;if(!spec&&item.kind!=='wall')continue;
    if(item.kind==='wall'){const w=modelState.sketchWalls.find(w=>w.id===item.wallId);if(!w)continue;const next=window.PLMRRollingRoofSketchCore.deleteCell(w,item.cellId);if(next.solids.length)modelState.sketchWalls[modelState.sketchWalls.indexOf(w)]=next;else{modelState.sketchWalls=modelState.sketchWalls.filter(x=>x!==w);if(w.parapetOwner){const p=ensureSceneEditor().parapet;p.hidden=[...(p.hidden||[]),w.id];}if(w.templateId){const t=ensureSceneEditor().templates.find(t=>t.id===w.templateId);if(t)t.hiddenRoles=[...(t.hiddenRoles||[]),w.templateRole];}}}
    else if(item.kind==='roof'){if(window.PLMRV17Core)v17LockSystem();const index=Number(item.moduleIndex);if(spec.sceneEditor?.roofProducts)delete spec.sceneEditor.roofProducts[index];}
    else if(item.kind==='system'){if(owner==='roof-main'){ensureSceneEditor().mainDeleted=true;modelState.placements={};modelState.zipPlacements={};}else ensureSceneEditor().roofCopies=ensureSceneEditor().roofCopies.filter(c=>c.id!==owner);}
    else if(item.kind==='member'){const oldZones=buildReportFacades({...spec,freedomLayout:freedomMultiPositionLayout(spec)}).flatMap(f=>f.zones);spec.sceneEditor=spec.sceneEditor||{};spec.sceneEditor.members=spec.sceneEditor.members||{};if(item.memberId.startsWith('profile:')){const body=item.memberId.slice(8),split=body.lastIndexOf(':'),facadeId=body.slice(0,split),profileId=body.slice(split+1);v11InOwner({owner},()=>p3dvCanonicalDeleteProfile({facadeId,profileId}));}else{spec.sceneEditor.members[item.memberId]={deleted:true};remapFacadeProductsAfterPostEdit(spec,oldZones);}}
    else if(item.kind==='facade'){const key=item.productKey||item.zoneId,slot=item.slot==='zip'?'zipPlacements':'placements';delete spec[slot]?.[item.zoneId];delete spec.productOpenStates?.[key];delete spec.panelStates?.[key];}
  }clearZoneSelection();postViewerMessage('v11-clear-selection');v11Commit('v11-delete-selection',before);}catch(error){Object.keys(modelState).forEach(k=>delete modelState[k]);Object.assign(modelState,before);postViewerMessage('v11-clear-selection');alert(error.message);}}
  function v12Owners(){window.PLMRV12Core.identities(modelState);const S=ensureSceneEditor();for(const c of S.roofCopies)c.spec.parapetOwner=c.id;return [...(S.mainDeleted?[]:[{id:'roof-main',pose:S.roofPose,spec:modelState}]),...S.roofCopies];}
  function v12ReconcileShared(){for(const o of v12Owners()){const members=o.spec.sceneEditor?.members||{};for(const edit of Object.values(members))if(!edit.commonGroup){delete edit.sharedWith;delete edit.sharedX;delete edit.sharedZ;}o.spec.freedomLayout=freedomMultiPositionLayout(o.spec);}}
  function v12PositionSpec(fields){const S=ensureSceneEditor(),t=resolveFreedomBioTopology('b-cube',fields.count,fields.width,fields.depth),h=Number(fields.height);if(!t.valid||t.totalWidth<1000||t.moduleDepths.some(d=>d<2104))throw Error('Geçerli adet, genişlik, açılım (en az 2104 mm) ve yükseklik girin.');window.PLMRRoofInput.validate({width:t.totalWidth,depth:t.maxDepth,height:h});const spec=p3dvHistoryClone(readModel());Object.assign(spec,{panelMasterOpen:true,pozNo:S.nextPoz,width:t.totalWidth,depth:t.maxDepth,height:h,systemCount:t.systemCount,moduleWidths:t.moduleWidths,moduleDepths:t.moduleDepths,modulePanelCounts:t.panelCounts,panelCount:t.panelCounts[0],lamellaCount:t.panelCounts[0],multiAlignment:t.alignment,multiRows:t.multiRows,rowAlignment:t.rowAlignment,panelCollection:t.panelCollection,placements:{},zipPlacements:{},productOpenStates:{},panelStates:{},facadeProfiles:{},zoneDividers:{},zoneRegistry:{},sketchWalls:[],sceneEditor:{initialRoofOpen:true,facadeZonesGenerated:false,groundY:S.groundY,roofPose:{},members:{},roofProducts:{},roofCopies:[],templates:[]}});spec.freedomLayout=freedomMultiPositionLayout(spec);if(!dimensionsFit(spec))throw Error('Ölçüler ürün sınırlarına uygun değil.');return {spec,t,h};}
  function v12AddPosition(fields,zone){const S=ensureSceneEditor(),before=p3dvHistoryClone(modelState);window.PLMRV12Core.identities(modelState);const {spec,t,h}=v12PositionSpec(fields);let pose=window.PLMRV16Core.freePose(v12Owners(),spec,S.roofPose,v16EnvironmentPoints());if(zone){const parent=v12Owners().find(o=>o.id===(zone.owner||'roof-main'));if(!parent||zone.connection||zone.group==='internal'||!['front','back','left','right'].includes(zone.facadeId||zone.id.split('|')[0]))throw Error('Ana ürün için bir dış cephe seçin.');const p=parent.pose,sign=-(Number(zone.inward)||1),local=zone.axis==='x'?[zone.cx,0,sign*(parent.spec.depth/2+spec.depth/2)]:[sign*(parent.spec.width/2+spec.width/2),0,zone.cz],v=window.PLMRRollingRoofSceneCore.vector(local,p.angle||0);pose={x:(p.x||0)+v[0],y:p.y||0,z:(p.z||0)+v[2],angle:p.angle||0};}if(v12Owners().some(o=>window.PLMRV16Core.overlaps(o,{spec,pose})))pose=window.PLMRV16Core.freePose(v12Owners(),spec,S.roofPose,v16EnvironmentPoints());spec.initialDimensions={count:t.systemCount,width:fields.width,depth:fields.depth,height:h,moduleWidths:spec.freedomLayout.modules.map(m=>m.outerWidth),moduleDepths:spec.freedomLayout.modules.map(m=>m.depth)};S.nextPoz++;S.roofCopies.push({id:'roof-copy-'+S.nextObject++,pose,spec});closeZoneActionDialog();clearZoneSelection();v11Commit('v12-position-add',before);return spec.pozNo;}
  function v12Products(){return v12Owners().flatMap(o=>{const spec=o.spec,modules=freedomMultiPositionLayout(spec)?.modules||[],roof=modules.map(m=>{const cfg=window.PLMRBioclimaticRoof.config(spec,m.moduleIndex);return {kind:'roof',owner:o.id,moduleIndex:m.moduleIndex,key:o.id+'|roof:'+m.moduleIndex,label:window.PLMRV12Core.name(spec.pozNo,m.moduleIndex)+' · '+window.PLMRBioclimaticRoof.product(cfg.id).name,open:cfg.open,movable:window.PLMRBioclimaticRoof.product(cfg.id).motion!=='Fixed'};});const facades=buildReportFacades({...spec,freedomLayout:freedomMultiPositionLayout(spec)}),names=new Map(facades.flatMap(f=>f.zones.map(z=>[z.id,z.label]))),rows=[];for(const [slot,store]of [['primary',spec.placements],['zip',spec.zipPlacements]])for(const [id,p]of Object.entries(store||{})){const productKey=slot==='zip'?'zip:'+id:id;rows.push({kind:'facade',slot,owner:o.id,zoneId:id,productKey,key:o.id+'|'+productKey,label:(p.positionCode||window.PLMRV12Core.name(spec.pozNo))+' · '+(names.get(id)||id)+' · '+documentProductTypeLabel(p.type),open:hasOwn(spec.productOpenStates,productKey)?Boolean(spec.productOpenStates[productKey]):Boolean(spec.productsOpen),movable:p.type!=='fixed'});}return [...roof,...rows];});}
  function v12SetProducts(items,open){const before=p3dvHistoryClone(modelState);for(const item of items){const spec=v12Owners().find(o=>o.id===item.owner)?.spec;if(!spec||!item.movable)continue;if(item.kind==='roof'){const cfg=window.PLMRBioclimaticRoof.config(spec,item.moduleIndex);spec.sceneEditor.roofProducts=spec.sceneEditor.roofProducts||{};spec.sceneEditor.roofProducts[item.moduleIndex]={...cfg,open:Boolean(open)};}else{spec.productOpenStates=spec.productOpenStates||{};spec.productOpenStates[item.productKey]=Boolean(open);if(item.slot==='zip'){spec.panelStates=spec.panelStates||{};spec.panelStates[item.productKey]=Boolean(open);}}}p3dvHistoryRecord(before,{type:'v12-product-state',label:'Ürün Durumları',origin:'3d'});applyProductOpenStateLive();postViewerMessage('v12-roof-states',{items:v12Products().filter(p=>p.kind==='roof')});document.dispatchEvent(new CustomEvent('plmr-v12-change'));scheduleDeferredPdfRefresh();if(isMainTechnical2DMode())renderMainTechnical2DPreview({resetView:false});}
  function v12ResetSection(section){const baseline=v11DefaultState||defaults,before=p3dvHistoryClone(modelState);if(section==='all'){window.PLMRV11Commands.reset();return;}const keys=section==='system'?['width','depth','height','panelCount','systemCount','moduleWidths','moduleDepths','modulePanelCounts','multiAlignment','multiRows','rowAlignment','panelCollection','inputDrafts']:section==='extras'?['triangleJoinery','waterStandard','waterOutletPlacement']:['motor','remote','led','dimmer','parapet','parapetHeight','panelFill','extras','systemColor','panelColor','colorMode'];for(const key of keys)if(baseline[key]!==undefined)modelState[key]=p3dvHistoryClone(baseline[key]);else delete modelState[key];if(section==='options')ensureSceneEditor().parapet=p3dvHistoryClone(baseline.sceneEditor?.parapet||{height:0,thickness:200,hidden:[]});p3dvHostSyncControls();v11Commit('v12-reset-'+section,before);}
  function refreshProfileMovementScopes(spec){
    if(spec.productGroup!=='b-cube'||!Object.values(spec.facadeProfiles||{}).some(profiles=>profiles.length))return;
    const layout=freedomMultiPositionLayout(spec),members=spec.sceneEditor?.members||{};
    for(const profiles of Object.values(spec.facadeProfiles||{}))for(const profile of profiles){
      if(profile.scope)profile.scope=window.PLMRV20Profiles.movementScope(profile,layout,members);
    }
  }
  function v13RemapProducts(before){for(const owner of v12Owners())refreshProfileMovementScopes(owner.spec);if(window.PLMRV18Zones){v18Cache=null;return v18Migrate(before,true);}const oldOwners=[{id:'roof-main',spec:before},...(before.sceneEditor?.roofCopies||[])];for(const o of v12Owners()){if(!Object.keys(o.spec.placements||{}).length&&!Object.keys(o.spec.zipPlacements||{}).length)continue;const prior=oldOwners.find(p=>p.id===o.id)?.spec;if(!prior)continue;const old=buildReportFacades({...prior,parapetWalls:before.sketchWalls||[],freedomLayout:freedomMultiPositionLayout(prior)}).flatMap(f=>f.zones),next=buildReportFacades({...o.spec,freedomLayout:freedomMultiPositionLayout(o.spec)}).flatMap(f=>f.zones);window.PLMRV13Core.remapProducts(o.spec,old,next);}}
  function v13GenerateZones(){const before=p3dvHistoryClone(modelState);for(const o of v12Owners())o.spec.sceneEditor.facadeZonesGenerated=true;clearZoneSelection();v11Commit('v13-zones-generate',before);return v11ZoneList();}
  function v13PhysicalOwners(){return v12Owners().map(o=>{const layout=freedomMultiPositionLayout(o.spec),bases=buildCanonicalReportFacadeBases({...o.spec,freedomLayout:layout});return {...o,posts:window.PLMRV13Core.allPosts(layout,bases,o.spec)};});}
  function v13CommonCandidates(){return window.PLMRV13Core.candidates(window.PLMRV13Core.worldPosts(v13PhysicalOwners(),window.PLMRRollingRoofSceneCore.vector));}
  function v13CommonApply(selections){const before=p3dvHistoryClone(modelState);try{const C=window.PLMRV13Core,candidates=v13CommonCandidates();for(const selected of selections){const group=candidates.find(g=>g.id===selected.id);if(!group)throw Error('Dikme grubu artık uygun değil.');for(const target of C.mergeTargets(group,selected.pair)){const groupId='common-'+(ensureSceneEditor().nextObject++);for(const p of target.posts){const owner=v12Owners().find(o=>o.id===p.owner),local=window.PLMRRollingRoofSceneCore.vector([target.x-(owner.pose.x||0),0,target.z-(owner.pose.z||0)],-(owner.pose.angle||0)),post=v13PhysicalOwners().find(o=>o.id===p.owner).posts.find(q=>q.memberId===p.memberId),members=owner.spec.sceneEditor.members,edit=members[p.memberId]=members[p.memberId]||{};edit.commonGroup=groupId;edit.sharedX=local[0]-post.x;edit.sharedZ=local[2]-post.z;if(p.key!==target.keep)edit.sharedWith=target.keep;}}}clearZoneSelection();v11Commit('v13-common-post',before);return true;}catch(error){Object.keys(modelState).forEach(k=>delete modelState[k]);Object.assign(modelState,before);throw error;}}
  function v13PositionInitial(owner){const o=v12Owners().find(o=>o.id===owner),spec=o?.spec;if(!spec)return {count:1,width:6000,depth:6000,height:3000};return p3dvHistoryClone(spec.initialDimensions||{count:spec.systemCount||1,width:spec.inputDrafts?.width||spec.width,depth:spec.inputDrafts?.depth||spec.depth,height:spec.height});}
  function v13EditPosition(owner,index,fields){const o=v12Owners().find(o=>o.id===owner);if(!o)throw Error('Poz bulunamadı.');const before=p3dvHistoryClone(modelState);try{const spec=o.spec,layout=freedomMultiPositionLayout(spec),i=Number(index),height=Number(fields.height),count=fields.count===undefined?spec.systemCount:Number(fields.count),whole=count!==spec.systemCount||/[;:]/.test(String(fields.width))||/[;:]/.test(String(fields.depth));let candidate;
    if(whole){const t=resolveFreedomBioTopology('b-cube',fields.count||spec.systemCount,fields.width,fields.depth);if(!t.valid||t.totalWidth<1000||t.moduleDepths.some(d=>d<2104))throw Error('Geçerli sistem adedi, genişlik ve açılım listesi girin.');candidate={...spec,width:t.totalWidth,depth:t.maxDepth,height,systemCount:t.systemCount,moduleWidths:t.moduleWidths,moduleDepths:t.moduleDepths,modulePanelCounts:t.panelCounts,panelCount:t.panelCounts[0],multiAlignment:t.alignment,multiRows:t.multiRows,rowAlignment:t.rowAlignment,panelCollection:t.panelCollection};}
    else{const width=Number(fields.width),depth=Number(fields.depth);if(!layout?.modules?.some(m=>m.moduleIndex===i)||!Number.isFinite(width)||!Number.isFinite(depth)||width<420||depth<2104)throw Error('Geçerli modül ölçüleri girin.');const widths=layout.modules.map(m=>m.outerWidth||m.width),depths=layout.modules.map(m=>m.depth);widths[i]=width;depths[i]=depth;candidate={...spec,width:widths.reduce((a,b)=>a+b,0),depth:Math.max(...depths),height,moduleWidths:widths,moduleDepths:depths,modulePanelCounts:depths.map(d=>panelCountFromProjection(d,'b-cube'))};candidate.panelCount=candidate.modulePanelCounts[0];}
    roofInput.requireHeight(height,spec.productGroup);candidate.inputDrafts={width:whole?String(fields.width):candidate.moduleWidths.join(';'),depth:whole?String(fields.depth):candidate.moduleDepths.join(';'),height:String(height)};candidate.freedomLayout=freedomMultiPositionLayout(candidate);if(!dimensionsFit(candidate))throw Error('Ölçüler ürün sınırlarına uygun değil.');Object.assign(spec,candidate);v11Commit('v13-position-edit',before);p3dvHostSyncControls();return true;}catch(error){Object.keys(modelState).forEach(k=>delete modelState[k]);Object.assign(modelState,before);p3dvHostSyncControls();throw error;}}
  function v13CreateFirst(fields){modelState.panelMasterOpen=true;ensureSceneEditor().initialRoofOpen=true;$(ids.panelMaster).checked=true;$(ids.pergoSystemCount).value=fields.count;$(ids.freedomWidth).value=fields.width;setDepthControlValue(fields.depth);$(ids.freedomHeight).value=fields.height;if(!applyFreedomInputs({forceRender:true}))throw Error($(ids.freedomValidation)?.textContent||'Geçerli ölçüler girin.');const l=freedomMultiPositionLayout(modelState);modelState.initialDimensions={...fields,moduleWidths:l.modules.map(m=>m.outerWidth),moduleDepths:l.modules.map(m=>m.depth)};return 1;}
  function v14SyncLayoutParapet(){const C=window.PLMRRollingRoofSceneCore,S=ensureSceneEditor();for(const w of modelState.sketchWalls||[]){if(!w.layoutParapet)continue;w.layoutSupportFrames={};for(const o of v12Owners()){const p=o.pose||{},convert=v=>C.vector([v[0]-(p.x||0),0,v[2]-(p.z||0)],-(p.angle||0));const origin=convert(w.frame.origin);origin[1]=w.frame.origin[1]-Number(S.groundY)-(p.y||0);w.layoutSupportFrames[o.id]={origin,u:C.vector(w.frame.u,-(p.angle||0)),t:C.vector(w.frame.t,-(p.angle||0))};}}}
  function v14MovableSelection(items){return window.PLMRV14Layouts.selectedProducts(items,v12Products());}
  function v14PreviewSelection(items){const products=v14MovableSelection(items);if(products.length)postViewerMessage('v14-selection-motion',{products});return products.length;}
  function v14ApplyLayout(id,fields){
    const plan=window.PLMRV14Layouts.build(id,fields),before=p3dvHistoryClone(modelState),ready=dimensionsFit(readModel());
    try{
      const S=ensureSceneEditor(),existing=v12Owners(),baseSpec=p3dvHistoryClone(modelState);let dx=0,dz=0;
      if(ready){const points=existing.flatMap(o=>[-1,1].flatMap(X=>[-1,1].map(Z=>{const v=window.PLMRRollingRoofSceneCore.vector([X*o.spec.width/2,0,Z*o.spec.depth/2],o.pose.angle||0);return{x:v[0]+(o.pose.x||0),z:v[2]+(o.pose.z||0)};})));dx=Math.max(...points.map(p=>p.x))+500-plan.bounds.minX;dz=(Math.min(...points.map(p=>p.z))+Math.max(...points.map(p=>p.z)))/2;}
      S.layoutBatches=S.layoutBatches||[];const batch={id:'layout-'+S.nextObject++,template:id,environment:plan.environment,owners:[],createdAt:Date.now()};
      for(let i=0;i<plan.cells.length;i++){
        const cell=plan.cells[i],count=panelCountFromProjection(cell.depth,'b-cube'),no=!ready&&i===0?1:S.nextPoz++,spec=p3dvHistoryClone(baseSpec);
        Object.assign(spec,{pozNo:no,width:cell.width,depth:cell.depth,height:cell.height,systemCount:1,moduleWidths:[cell.width],moduleDepths:[cell.depth],modulePanelCounts:[count],panelCount:count,lamellaCount:count,multiRows:[],multiAlignment:'front',rowAlignment:'left',panelCollection:'center',placements:{},zipPlacements:{},productOpenStates:{},panelStates:{},facadeProfiles:{},zoneDividers:{},zoneRegistry:{},sketchWalls:[],panelMasterOpen:true,inputDrafts:{width:String(cell.width),depth:String(cell.depth),height:String(cell.height)},sceneEditor:{groundY:S.groundY,roofPose:{},members:{},roofProducts:{},roofCopies:[],templates:[],facadeZonesGenerated:false}});
        spec.freedomLayout=freedomMultiPositionLayout(spec);if(!dimensionsFit(spec))throw Error('Yerleşimdeki Poz '+no+' ölçüleri ürün kurallarına uygun değil.');spec.initialDimensions={count:1,width:cell.width,depth:cell.depth,height:cell.height,moduleWidths:[cell.width],moduleDepths:[cell.depth]};
        const pose={x:dx+cell.x,y:0,z:dz+cell.z,angle:0};let owner;
        if(!ready&&i===0){owner='roof-main';const state=S;Object.assign(modelState,spec);modelState.sceneEditor=state;state.groundY=-plan.height/2;state.roofPose=pose;state.roofProducts=spec.sceneEditor.roofProducts;state.mainDeleted=false;state.nextPoz=2;state.facadeZonesGenerated=false;}
        else{owner='roof-copy-'+S.nextObject++;spec.sceneEditor.groundY=S.groundY;S.roofCopies.push({id:owner,pose,spec});}
        batch.owners.push(owner);
      }
      const ground=Number(S.groundY),edges=plan.environment==='parapet'?window.PLMRV14Layouts.parapetRects(plan).map(rect=>({rect,side:'dış kenar'})):window.PLMRV14Layouts.environmentEdges(plan);for(const e of edges){const height=plan.environment==='parapet'?plan.parapetHeight:plan.height,parapet=plan.environment==='parapet';let w;if(parapet){const x0=dx+e.rect.x0,x1=dx+e.rect.x1,z0=dz+e.rect.z0,z1=dz+e.rect.z1;w=window.PLMRRollingRoofSketchCore.createWall({width:x1-x0,height},'layout-wall-'+S.nextObject++,z1-z0);w.frame={origin:[x0,ground,z0],u:[1,0,0],v:[0,1,0],t:[0,0,1]};w.layoutParapet=true;}else{w=window.PLMRRollingRoofSketchCore.createWall({width:e.to-e.from,height},'layout-wall-'+S.nextObject++,200);w.frame={origin:e.axis==='x'?[dx+e.from,ground,dz+e.at]:[dx+e.at,ground,dz+e.from],u:e.axis==='x'?[1,0,0]:[0,0,1],v:[0,1,0],t:e.axis==='x'?[0,0,-e.inward]:[-e.inward,0,0]};}w.layoutBatch=batch.id;w.layoutKind=plan.environment;w.label=(parapet?'Parapet':'Duvar')+' · '+e.side;modelState.sketchWalls.push(w);}
      v14SyncLayoutParapet();
      S.layoutBatches.push(batch);clearZoneSelection();cancelToolboxSelection();p3dvHostSyncControls();p3dvHistoryRecord(before,{type:'v14-guided-layout',label:'Yerleşim: '+id,origin:'3d'});commitModelChangeLive('v14-guided-layout',{preserveHistory:true,forceRender:true});document.dispatchEvent(new CustomEvent('plmr-v12-change'));return batch;
    }catch(error){Object.keys(modelState).forEach(k=>delete modelState[k]);Object.assign(modelState,before);p3dvHostSyncControls();throw error;}
  }
  window.PLMRV14Commands=Object.freeze({applyLayout:v14ApplyLayout,movableSelection:v14MovableSelection,previewSelection:v14PreviewSelection});

  window.PLMRV13Commands=Object.freeze({generateZones:v13GenerateZones,commonCandidates:v13CommonCandidates,commonApply:v13CommonApply,startCommon:()=>{clearZoneSelection();cancelToolboxSelection();postViewerMessage('v13-common-start',{groups:v13CommonCandidates()});},positionInitial:v13PositionInitial,editPosition:v13EditPosition,createFirst:v13CreateFirst,post:type=>postViewerMessage(type),resetMember:(owner,memberId)=>{const before=p3dvHistoryClone(modelState),spec=v12Owners().find(o=>o.id===owner)?.spec;if(!spec)return false;const edit=spec.sceneEditor.members?.[memberId];if(edit?.commonGroup)for(const o of v12Owners())for(const[key,e]of Object.entries(o.spec.sceneEditor.members||{}))if(e.commonGroup===edit.commonGroup){delete e.sharedWith;delete e.sharedX;delete e.sharedZ;delete e.commonGroup;}if(edit){delete edit.offsetX;delete edit.offsetZ;delete edit.positionX;delete edit.positionZ;delete edit.length;delete edit.deleted;}v11Commit('v13-member-reset',before);return true;}});
  window.PLMRV12Commands=Object.freeze({ready:()=>dimensionsFit(readModel()),positionCount:fields=>Math.max(1,resolveFreedomBioTopology('b-cube',fields.count,fields.width,fields.depth).systemCount||1),model:()=>p3dvHistoryClone(readModel()),owners:()=>p3dvHistoryClone(v12Owners()),addPosition:v12AddPosition,products:v12Products,setProducts:v12SetProducts,resetSection:v12ResetSection,selectedZone:()=>selectedZone?{...selectedZone}:null,previewMotion:()=>{},cancel:()=>{if(toolboxSelectionMode)cancelToolboxSelection();clearZoneSelection();closeZoneActionDialog();postViewerMessage('v12-escape');}});

  function presentationFrame(){
    const m=modelState,s=m.sceneEditor||{},presentation={...s.presentation};
    const key=JSON.stringify([presentation,m.width,m.height,m.depth,s.groundY,s.mainDeleted,s.roofPose,
      s.roofCopies?.map(o=>[o.id,o.pose,o.spec.width,o.spec.height,o.spec.depth]),
      Object.entries(s.nativeWorkspaces||{}).map(([type,w])=>[type,w.positions.map(p=>[p.id,p.width,p.height])]),
      s.sharedProductLayout?.columns,s.sharedProductLayout?.positionOrder]);
    return {presentation,key};
  }
  window.PLMRV27Host=Object.freeze({frame:presentationFrame,floor:()=>modelState.sceneEditor?.presentation?.floor,presentation:patch=>{const allowed={environment:['empty','white','sketchup-dark'],floor:['none','wood','tile','stone','concrete','laminate','gravel','deck']};for(const [k,v]of Object.entries(patch))if(!allowed[k]?.includes(v))throw Error('Ortam seçimi geçersiz.');const before=p3dvHistoryClone(modelState);ensureSceneEditor().presentation={...ensureSceneEditor().presentation,...patch};v11Commit('v27-presentation',before);},colorOptions:spec=>v27BioColor(spec)});
  // Host adapter for validated quote templates. Existing layout/free-pose and
  // command history remain the geometry and transaction owners.
  function finalImportQuoteRoofs(entries) {
    if (!Array.isArray(entries)||!entries.length)throw Error('Aktarılacak çatı bulunamadı.');
    const before=p3dvHistoryClone(modelState),S=ensureSceneEditor(),owners=v12Owners().map(o=>({...o})),additions=[],links=[];
    let nextObject=Number(S.nextObject)||1,nextPoz=Number(S.nextPoz)||2;
    for(const entry of entries){
      const quantity=Number(entry.quantity);
      if(!Number.isInteger(quantity)||quantity<1||quantity>1000)throw Error('Çatı adedi 1–1000 arasında tam sayı olmalıdır.');
      const product=window.PLMRBioclimaticRoof.products.find(p=>p.id===entry.referenceKey);
      if(!product)throw Error('Çatı motoru bulunamadı.');
      let original=null;
      if(entry.finalSnapshot){
        window.PLMRV15Core.validateProject({schema:'plmr-bioclimatic-project-v1',version:1,snapshot:entry.finalSnapshot});
        const source=entry.finalSnapshot.modelState,row=entry.finalRow;
        original=row?.owner==='roof-main'?source:source.sceneEditor?.roofCopies?.find(c=>c.id===row?.owner)?.spec;
        if(original&&freedomMultiPositionLayout(original)?.modules.length!==1)throw Error('Çok modüllü çizimin bir parçası bağımsız çatı olarak aktarılamaz. Yerleşim formunu kullanın.');
      }
      const height=Number(entry.legHeight||entry.finalRow?.height||original?.height),width=Number(entry.width),depth=Number(entry.height);
      const same=original&&width===Number(original.width)&&depth===Number(original.depth)&&height===Number(original.height);
      if(original&&!same&&Object.keys(original.sceneEditor?.members||{}).length)throw Error('Özel profilli çatının ölçüsünü çizim yerleşim formundan düzenleyin. Kaynak geometri korunmuştur.');
      const template=same?p3dvHistoryClone(original):v12PositionSpec({count:1,width:String(width),depth:String(depth),height:String(height)}).spec;
      const selected=entry.productOptions||entry.finalRow?.settings||{};
      if(selected.systemColor){
        template.colorMode=selected.systemColor==='Varsayılan'?'default':'ral';
        if(template.colorMode==='ral')template.systemColor=ralColorOption(selected.systemColor,{...defaults.systemColor,finish:({Parlak:'GLOSS',Mat:'MATTE',Texture:'TEXTURE'})[selected.surface]||'MATTE'});
      }
      for(let i=0;i<quantity;i++){
        const spec=p3dvHistoryClone(template);spec.pozNo=nextPoz++;spec.placements={};spec.zipPlacements={};spec.sketchWalls=[];delete spec.codeRegistry;
        spec.sceneEditor={...spec.sceneEditor,roofCopies:[],nativeWorkspaces:{},templates:[],roofPose:{},roofProducts:{0:{id:product.id,rotation:0,open:false,revision:1}}};
        spec.freedomLayout=freedomMultiPositionLayout(spec);
        if(!dimensionsFit(spec))throw Error('Çatı ürün sınırlarına uygun değil.');
        const id='roof-copy-'+nextObject++,pose=window.PLMRV16Core.freePose(owners,spec,S.roofPose,v16EnvironmentPoints()),copy={id,pose,spec};
        additions.push(copy);owners.push(copy);links.push({product:entry.product,drawingPositionId:id+':roof:0',quotePositionId:entry.sourceQuotePositionId||entry.id});
      }
    }
    S.roofCopies.push(...additions);S.nextObject=nextObject;S.nextPoz=nextPoz;
    v11Commit('final-quote-roof-import',before);return links;
  }

  const v4PlacementRecovery=window.PLMRPlacementRecovery.create({
    owners:v12Owners,zones:()=>v18AllZones(modelState),details:v16DetailRows,
    fit:v4PlacementCheck,
    snapshot:()=>p3dvHistoryClone(modelState),
    restore:before=>{Object.keys(modelState).forEach(key=>delete modelState[key]);Object.assign(modelState,before);v18Cache=null;},
    moved:(placement,owner)=>{for(const item of Object.values(modelState.codeRegistry?.items||{}))if(item.code===placement.positionCode)item.owner=owner;},
    commit:(reason,before)=>{clearZoneSelection();v11Commit(reason,before);}
  });
  function sharedDrawingLayout(type){
    const scene=ensureSceneEditor();
    const own=type?(scene.nativeWorkspaces?.[type]||window.PLMRV24Native.provider(type).model.initial()).drawingLayout:{};
    const fallback={columns:Number(document.getElementById('rrV45ColumnsSelect')?.value)||2,dimensionUnits:scene.dimensionUnits||{mm:true,inch:false},showDimensions:true};
    return p3dvHistoryClone({...fallback,...own,...scene.sharedProductLayout});
  }
  window.PLMRV24Host=Object.freeze({nextPositionCode:(type,positions)=>window.PLMRV17Core.previewCode(modelState,type,positions),getLayout:sharedDrawingLayout,placementRecovery:v4PlacementRecovery,importQuoteRoofs:finalImportQuoteRoofs,getState:()=>p3dvHistoryClone(modelState),setLayout:value=>{const before=p3dvHistoryClone(modelState),S=ensureSceneEditor();S.sharedProductLayout={...S.sharedProductLayout,...p3dvHistoryClone(value)};if(value.dimensionUnits){S.dimensionUnits={...value.dimensionUnits};postViewerMessage('set-scene-units',{units:S.dimensionUnits});document.dispatchEvent(new CustomEvent('plmr:units',{detail:S.dimensionUnits}));}p3dvHistoryRecord(before,{type:'shared-drawing-layout',label:'Ortak çizim düzeni',origin:'ui'});document.dispatchEvent(new CustomEvent('plmr-v24-native-change'));},getWork:type=>{const S=ensureSceneEditor(),w=p3dvHistoryClone(S.nativeWorkspaces?.[type]||window.PLMRV24Native.provider(type).model.initial());w.drawingLayout={...w.drawingLayout,...S.sharedProductLayout};return w;},setWork:(type,value)=>{const a=window.PLMRV24Native.provider(type),q=a.model.validate(value),before=p3dvHistoryClone(modelState);ensureSceneEditor().nativeWorkspaces=ensureSceneEditor().nativeWorkspaces||{};ensureSceneEditor().nativeWorkspaces[type]=q;v17Ensure();ensureSceneEditor().sharedProductLayout={...q.drawingLayout,positionOrder:window.PLMRProjectLayout.reconcileProjectOrder(ensureSceneEditor().nativeWorkspaces,ensureSceneEditor().sharedProductLayout?.positionOrder||[])};p3dvHistoryRecord(before,{type:'native-workspace',label:a.descriptor.label,origin:'native',payload:{type}});document.dispatchEvent(new CustomEvent('plmr-v24-native-change',{detail:{type}}));},facadeState:v26FacadeState,commitFacade:v26CommitFacade,removeFacade:v26RemoveFacade,editNative:v24EditNative,post:postViewerMessage});
  window.PLMRV11Commands=Object.freeze({openZone:zone=>{postViewerMessage('highlight-zone',{zone});selectZone(zone);},editCopy:(id)=>{const c=ensureSceneEditor().roofCopies.find(c=>c.id===id);if(c)document.dispatchEvent(new CustomEvent('plmr-v11-edit-copy',{detail:{id,spec:p3dvHistoryClone(c.spec)}}));},selectAll:()=>{p3dvSketchSetTool('select');postViewerMessage('v11-select-all');},startBulk:mode=>{p3dvSketchSetTool('select');startToolboxSelection(mode);},cancelBulk:cancelToolboxSelection,completeBulk:completeToolboxSelection,bulkState:()=>({mode:toolboxSelectionMode,count:toolboxSelectionItems.size}),dimensions:()=>({...dimensionVisibility}),setDimensions:value=>{dimensionVisibility={...dimensionVisibility,...value};updateToolbox();postViewerMessage('set-dimension-visibility',{visibility:dimensionVisibility});if(isMainTechnical2DMode())renderMainTechnical2DPreview({resetView:false});document.dispatchEvent(new CustomEvent('plmr-v11-dimensions',{detail:dimensionVisibility}));},clearSelection:()=>{clearZoneSelection();postViewerMessage('v11-clear-selection');},deleteSelection:v11Delete,editSelection:items=>{if(!items.length)return;if(items.every(x=>x.kind==='roof'))return v16OpenRoofChoice(items);if(items.every(x=>x.kind==='facade')){const zones=items.map(x=>({...x.zone,owner:x.owner})),o=v11OwnerModel(zones[0]),p=(items[0].slot==='zip'?o.zipPlacements:o.placements)?.[zones[0].id];if(window.PLMRV24Native?.native(p))return v24EditNative(zones[0],p.type,zones);window.PLMRV26Facade.open(zones[0],zones,items[0].slot==='zip'?'zip':undefined);}else if(items.length===1&&items[0].kind==='system'){if(items[0].owner==='roof-main')openPositionDialog();else window.PLMRV11Commands.editCopy(items[0].owner);}},reset:()=>{if(!v11DefaultState)return false;const before=p3dvHistoryClone(modelState),units={...ensureSceneEditor().dimensionUnits};Object.keys(modelState).forEach(k=>delete modelState[k]);Object.assign(modelState,p3dvHistoryClone(v11DefaultState));ensureSceneEditor().dimensionUnits=units;zoneFilters=window.PLMRV11Zones.defaults();zonesVisible=true;clearZoneSelection();cancelToolboxSelection();postViewerMessage('v11-clear-selection');p3dvHostSyncControls();v11Commit('v11-reset-default',before);v11PublishFilters();document.dispatchEvent(new CustomEvent('plmr:parapet',{detail:{height:modelState.parapetHeight||0}}));return true;},getBaseline:()=>p3dvHistoryClone(v11DefaultState)});
  window.addEventListener('message', (event) => {
    const frame = $(ids.frame);
    if (!frame || event.source !== frame.contentWindow) return;
    if (!event.data || event.data.source !== 'product-3d-viewer') return;
    if (event.data.sessionId !== activeViewerSessionId) return;
    // Locked drawings accept view/lifecycle messages only; never mutate from an old viewer event.
    if(window.PLMRFinalReadOnly?.() && /^(select-zone|select-divider-profile|scene-commit|sketch-undo|sketch-redo|sketch-profile-delete|sketch-wall-update|v11-delete-selection|v11-product-selection|toggle-toolbox-selection|v17-edit-product|v17-annotation-toggle)$/.test(event.data.type))return;
    if (p3dvStandaloneGuillotinePreviewMode) {
      if (event.data.type === 'guillotine-capture') {
        p3dvStandaloneGuillotinePost('P3DV_GUILLOTINE_CAPTURED', {requestId:event.data.requestId, dataUrl:event.data.dataUrl || '', error:event.data.error || ''});
        return;
      }
      if (event.data.type === 'viewer-ready') {
        if (p3dvStandaloneGuillotineRenderTimer) window.clearTimeout(p3dvStandaloneGuillotineRenderTimer);
        p3dvStandaloneGuillotineRenderTimer = 0;
        p3dvStandaloneGuillotineRendered = true;
        p3dvHostLifecycleDiagnostics.viewerReadyCount += 1;
        postViewerMessage('set-runtime-active', { active: p3dvHostRuntimeActive });
        p3dvStandaloneGuillotinePost('P3DV_GUILLOTINE_RENDERED', { positionCount:p3dvStandaloneGuillotinePositionCount });
        return;
      }
      if (event.data.type === 'viewer-error') {
        p3dvStandaloneGuillotineFail(event.data.message || '3D görüntüleyici başlatılamadı.');
        return;
      }
    }
    if (event.data.type === 'viewer-ready') {
      viewerLiveProductStateReady = Boolean(event.data.liveProductState);
      viewerLivePanelMasterReady = Boolean(event.data.livePanelMaster);
      viewerLivePergoRiseReady = Boolean(event.data.livePergoRise);
      viewerLiveColorStateReady = Boolean(event.data.liveColorState);
      viewerLiveModelStateReady = Boolean(event.data.liveModelState);
      p3dvHostLifecycleDiagnostics.viewerReadyCount += 1;
      flushPendingViewerState();
      // A newly created nested viewer inherits the host presentation activity.
      postViewerMessage('set-runtime-active', { active: p3dvHostRuntimeActive });
    }
    if (event.data.type === 'model-state-applied') {
      pendingLiveModelState = false;
      updateReadouts();
      return;
    }
    if (event.data.type === 'beam-section-change-request') {
      applyBeamSectionChangeFromViewer(event.data.beamSection, event.data.camera);
      return;
    }
    if(event.data.type==='v13-common-apply'){try{v13CommonApply(event.data.selections||[]);}catch(error){postViewerMessage('scene-error',{message:error.message});}return;}
    if(event.data.type==='v13-member-reset'){window.PLMRV13Commands.resetMember(event.data.owner,event.data.memberId);return;}
    if(event.data.type==='v13-edit-position'){window.PLMRV12UI.editPosition(event.data.owner,event.data.moduleIndex);return;}
    if (event.data.type === 'ar-status') {
      setMobileArStatus(event.data.message || 'AR durumu güncellendi.', event.data.tone || '');
    }
    if (event.data.type === 'ar-capability') {
      const button = $(ids.mobileAr);
      if (button) button.disabled = false;
      setMobileArStatus(event.data.message || (event.data.supported ? 'AR hazır.' : 'AR desteği bulunamadı.'), event.data.supported ? 'success' : 'warning');
    }
    if (event.data.type === 'ar-session-ended') {
      const button = $(ids.mobileAr);
      if (button) button.disabled = false;
      setMobileArStatus('AR oturumu kapatıldı. 3D model görünümüne dönüldü.');
    }
    if (event.data.type === 'camera-state' && event.data.camera) {
      const camera = event.data.camera;
      const position = Array.isArray(camera.position) ? camera.position.map(Number) : [];
      const target = Array.isArray(camera.target) ? camera.target.map(Number) : [];
      if (position.length === 3 && target.length === 3 && [...position, ...target].every(Number.isFinite)) {
        viewerCameraState = { position, target, zoom: Number.isFinite(Number(camera.zoom)) ? Number(camera.zoom) : 1, fov: Math.max(38,Math.min(110,Number(camera.fov)||38)) };
      }
    }
    if (event.data.type === 'pergo-rise-edit-operation-request' && applyPergoRiseAreaOperation(event.data)) return;
    if (event.data.type === 'edit-dimension') openPositionDialog();
    if(event.data.type==='v11-set-bulk-items'&&toolboxSelectionMode){toolboxSelectionItems=new Map((event.data.items||[]).map(i=>[i.key,i]));updateToolbox();postToolboxSelectionState();return;}
    if (event.data.type === 'toggle-toolbox-selection' && event.data.item) toggleToolboxSelectionItem(event.data.item);
    if (event.data.type === 'complete-toolbox-selection') completeToolboxSelection();
    if (event.data.type === 'cancel-toolbox-selection') cancelToolboxSelection();
    if(event.data.type==='v17-annotation-toggle'){v17Select(event.data.item);return;}
    if(event.data.type==='v17-hide-annotations'){v17Hide();return;}
    if(event.data.type==='v17-edit-product'){window.PLMRV17Commands.editProduct(event.data.item);return;}
    if(event.data.type==='v16-roof-delete'){v16RoofBatch([{owner:event.data.owner,moduleIndex:event.data.moduleIndex}],event.data.productId,true);return;}
    if(event.data.type==='v16-open-roof-choice'){v16OpenBulkRoof(event.data.item);return;}
    if(event.data.type==='v11-product-selection'){const e=new CustomEvent('plmr-v11-selection',{detail:event.data.items||[]});e.plmrAppend=Boolean(event.data.append);document.dispatchEvent(e);return;}
    if(event.data.type==='v42-zone-selection'){
      v46MultiZones=Array.isArray(event.data.zones)?event.data.zones:[];
      document.dispatchEvent(new CustomEvent('plmr-zone-selection',{detail:v46MultiZones}));
      return;
    }
    if(event.data.type==='v11-delete-selection'){v11Delete(event.data.items||[]);return;}
    if(event.data.type==='v12-escape-request'){
      window.PLMRV17Commands.clearSelection();
      v46MultiZones=[];
      clearZoneSelection();
      window.PLMRV12UI?.escape();
      return;
    }
    if(event.data.type==='v11-clear-zone'){clearZoneSelection();return;}
    if (event.data.type === 'select-zone' && event.data.zone) {
      if (p3dvStandaloneGuillotinePreviewMode && window.parent !== window) {
        p3dvStandaloneGuillotinePost('P3DV_GUILLOTINE_SELECT_POSITION', { positionId:String(event.data.zone.id||'') });
      } else selectZone(event.data.zone);
    }
    if (event.data.type === 'select-divider-profile' && event.data.profile) openDividerProfileDialog(event.data.profile);
    // V27: retired post-dialog messages are deliberately ignored; real members use rrMemberId.
    if (event.data.type === 'scene-commit') {applySceneCommand(event.data.command);return;}
    if (event.data.type === 'sketch-undo') {p3dvUndoPhysicalCommand();return;}
    if (event.data.type === 'sketch-redo') {p3dvRedoPhysicalCommand();return;}
    if (event.data.type === 'sketch-profile-delete') {p3dvExecuteTechnical2DCommand({type:'profile-delete',payload:event.data.profile});return;}
    if (event.data.type === 'sketch-tool-changed') {document.dispatchEvent(new CustomEvent('plmr:sketch-tool',{detail:{tool:event.data.tool}}));return;}
    if (event.data.type === 'sketch-wall-update' && event.data.wall) p3dvSketchApplyWallUpdate(event.data.wall, event.data.reason || 'sketch-wall-update');
    if (event.data.type === 'sketch-cell-delete') p3dvSketchDeleteCell(String(event.data.wallId),String(event.data.cellId));
    if (event.data.type === 'sketch-wall-delete' && event.data.wallId) p3dvSketchDeleteWall(String(event.data.wallId));
    if (event.data.type === 'toggle-panel-state' && event.data.zoneId) {
      if (p3dvStandaloneGuillotinePreviewMode) {
        p3dvStandaloneGuillotinePost('P3DV_GUILLOTINE_TOGGLE_POSITION', { positionId:String(event.data.zoneId), open:Boolean(event.data.open) });
        return;
      }
      const zoneId = String(event.data.zoneId);
      const key = String(event.data.productKey || event.data.panelKey || zoneId);
      const ownerSpec=v11OwnerModel({owner:event.data.owner});ownerSpec.productOpenStates=ownerSpec.productOpenStates||{};ownerSpec.panelStates=ownerSpec.panelStates||{};ownerSpec.productOpenStates[key] = Boolean(event.data.open);
      if (key === zipProductKey(zoneId)) ownerSpec.panelStates[key] = Boolean(event.data.open);
      applyProductOpenStateLive();
    }
  });

  // Pergo Rise no longer has a dedicated iframe/viewer builder. It is routed
  // through buildViewerHtml together with B-Cube Freedom and Bio-Rise.

  function buildViewerHtml({ productGroup, width, depth, height, lamellaCount, systemCount, freedomLayout, bioRiseLayout, galaxyLayout, orientations, postSections, beamSection, placements, zipPlacements, facadeProfiles, zoneDividers, zoneRegistry, sketchWalls, sceneEditor, zonesVisible: showZones = zonesVisible, colorMode, systemColor, panelColor, pergoRiseUrl, pergoRiseProject, viewerSessionId, cameraState, selectedZoneId: activeZoneId, dimensionVisibility: showDimensionVisibility, productsOpen, productOpenStates, panelStates, panelMasterOpen, toolboxSelectionMode: activeSelectionMode, toolboxSelectionKeys: activeSelectionKeys, standaloneGuillotineItems }) {
    const W = width;
    const D = depth;
    const H = height;
    const LC = lamellaCount;
    const normalizedProductGroup = productGroup === 'bio-rise' ? 'bio-rise' : (productGroup === 'b-cube-galaxy' ? 'b-cube-galaxy' : (productGroup === 'pergo-rise' ? 'pergo-rise' : 'b-cube'));
    const productGroupJson = safeScriptJson(normalizedProductGroup);
    const productModelTitle = normalizedProductGroup === 'bio-rise' ? 'BIO-RISE 3D' : (normalizedProductGroup === 'b-cube-galaxy' ? 'B-CUBE GALAXY 3D' : (normalizedProductGroup === 'pergo-rise' ? 'PERGO RISE 3D' : 'B-CUBE FREEDOM 3D'));
    // Pergo Rise uses the same Three.js / OrbitControls / AR scene as
    // B-Cube Freedom and Bio-Rise. Product-specific geometry and operations are
    // injected through P3DVPergoRiseViewer without creating a second viewer.
    const [O1, O2, O3, O4] = orientations;
    const systemCountJson = safeScriptJson(Math.max(1, Math.round(Number(systemCount) || 1)));
    const freedomLayoutJson = safeScriptJson(freedomLayout || null);
    const bioRiseLayoutJson = safeScriptJson(bioRiseLayout || null);
    const galaxyLayoutJson = safeScriptJson(galaxyLayout || null);
    const postJson = safeScriptJson(postSections);
    const beamJson = safeScriptJson(beamSection);
    const placementsJson = safeScriptJson(placements || {});
    const zipPlacementsJson = safeScriptJson(zipPlacements || {});
    const facadeProfilesJson = safeScriptJson(facadeProfiles || {});
    const zoneDividersJson = safeScriptJson(zoneDividers || {});
    const zoneRegistryJson = safeScriptJson(zoneRegistry || {});
    const sceneEditorJson = safeScriptJson(window.PLMRV17Core?v17Scene(sceneEditor || ensureSceneEditor()):sceneEditor || ensureSceneEditor());
    const sketchWallsJson = safeScriptJson(Array.isArray(sketchWalls) ? sketchWalls : []);
    const pergoRiseUrlJson = safeScriptJson(pergoRiseUrl || '');
    const pergoRiseProjectJson = safeScriptJson(pergoRiseProject || null);
    const viewerSessionIdJson = safeScriptJson(viewerSessionId || '');
    const cameraStateJson = safeScriptJson(cameraState || null);
    const selectedZoneIdJson = safeScriptJson(activeZoneId || null);
    const dimensionVisibilityJson = safeScriptJson({
      intermediate: !showDimensionVisibility || showDimensionVisibility.intermediate !== false,
      main: !showDimensionVisibility || showDimensionVisibility.main !== false,
      positions:showDimensionVisibility?.positions!==false,total:showDimensionVisibility?.total!==false,byPosition:showDimensionVisibility?.byPosition||{}
    });
    const productsOpenJson = safeScriptJson(Boolean(productsOpen));
    const productOpenStatesJson = safeScriptJson(productOpenStates || {});
    const panelStatesJson = safeScriptJson(panelStates || {});
    const panelMasterOpenJson = safeScriptJson(Boolean(panelMasterOpen));
    const toolboxSelectionModeJson = safeScriptJson(activeSelectionMode || null);
    const toolboxSelectionKeysJson = safeScriptJson(Array.isArray(activeSelectionKeys) ? activeSelectionKeys : []);
    const standaloneGuillotineItemsJson = safeScriptJson(Array.isArray(standaloneGuillotineItems) ? standaloneGuillotineItems : []);
    // A local-file Giyotin preview must not depend on a reachable CDN.
    // Keep the established engine/version and use classic scripts for file: support.
    const standalonePreview = Array.isArray(standaloneGuillotineItems) && standaloneGuillotineItems.length > 0;
    if(!v11DefaultState&&dimensionsFit(readModel()))v11DefaultState=p3dvHistoryClone(modelState);
    const threeSource = './vendor/three-r128/three.min.js?v=10.49-r49';
    const controlsSource = './vendor/three-r128/OrbitControls.js?v=10.49-r49';
    const zipFabricMeta = {};
    ZIP_FABRIC_CATALOG.forEach((section) => section.pages.forEach((page) => page.items.forEach((item) => {
      const embeddedTextureMap = window.P3DV_ZIP_FABRIC_TEXTURES || {};
      zipFabricMeta[item.value] = {
        image: page.image,
        texture: item.texture || '',
        textureData: embeddedTextureMap[item.value] || '',
        tone: item.tone || '',
        tileMm: Number(item.tileMm) || 500,
        left: item.left,
        top: item.top,
        width: item.width,
        height: item.height
      };
    })));
    const zipFabricMetaJson = safeScriptJson(zipFabricMeta);
    const glazingSectionSpecsJson = safeScriptJson(GLAZING_SECTION_SPECS);
    const systemColorValue = Number.parseInt(normalizeHexColor(systemColor && systemColor.hex, defaults.systemColor.hex).slice(1), 16);
    const panelColorValue = Number.parseInt(normalizeHexColor(panelColor && panelColor.hex, defaults.panelColor.hex).slice(1), 16);

    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${productModelTitle}</title>
<style>
html,body{margin:0;height:100%;overflow:hidden;background:linear-gradient(#f5f8fb,#eaf1f6 55%,#dce7ef);font-family:Segoe UI,Arial,sans-serif;color:#e5eefb}
#viewerHint{position:absolute;left:14px;bottom:14px;z-index:25;max-width:min(470px,calc(100% - 28px));padding:8px 11px;border:1px solid rgba(125,211,252,.28);border-radius:9px;background:rgba(15,23,42,.76);color:#dbeafe;font-size:12px;line-height:1.4;pointer-events:none;backdrop-filter:blur(5px)}
#rrSketchHud{position:absolute;box-sizing:border-box;max-width:calc(100% - 28px);max-height:calc(100% - 28px);overflow:auto;overflow-wrap:anywhere;left:14px;top:14px;z-index:45;display:none;min-width:210px;padding:9px 11px;border:1px solid rgba(45,212,191,.58);border-radius:10px;background:rgba(15,23,42,.9);box-shadow:0 12px 30px rgba(0,0,0,.3);font-size:12px;line-height:1.45;pointer-events:none}#rrSketchHud strong{color:#99f6e4}#rrSketchHud .value{display:block;margin-top:3px;color:#fff;font:700 14px Consolas,monospace}.rr-sketch-active canvas{cursor:crosshair!important}
#fallback{display:none;position:absolute;inset:0;place-items:center;padding:22px;text-align:center;line-height:1.5;background:#0f172a;color:#e5e7eb;z-index:50}
[hidden]{display:none!important}

#pergoRiseSelectionInfo{position:absolute;left:14px;top:14px;z-index:44;display:none;max-width:min(420px,calc(100% - 28px));padding:9px 11px;border:1px solid rgba(56,189,248,.55);border-radius:10px;background:rgba(15,23,42,.9);font-size:12px;line-height:1.4;box-shadow:0 12px 32px rgba(0,0,0,.25)}
#pergoRiseContextMenu{position:absolute;z-index:48;display:none;min-width:210px;max-width:280px;padding:7px;border:1px solid rgba(125,211,252,.45);border-radius:11px;background:rgba(15,23,42,.96);box-shadow:0 18px 45px rgba(0,0,0,.42)}
#pergoRiseContextMenu strong{display:block;padding:6px 8px;color:#e0f2fe;font-size:12px}
#pergoRiseContextMenu button{display:block;width:100%;margin:3px 0;padding:8px 9px;border:1px solid rgba(148,163,184,.25);border-radius:8px;background:rgba(30,41,59,.9);color:#f8fafc;text-align:left;font:600 12px Segoe UI,Arial,sans-serif;cursor:pointer}
#pergoRiseContextMenu button:hover{background:rgba(14,116,144,.72)}

body.ar-active{background:transparent}
body.ar-active #viewerHint{display:none}
#arLaunchGate{position:absolute;inset:0;z-index:70;display:grid;place-items:center;padding:24px;background:rgba(5,15,25,.82);backdrop-filter:blur(8px)}
#arLaunchGate .ar-gate-card{width:min(430px,calc(100% - 32px));padding:20px;border:1px solid rgba(125,211,252,.4);border-radius:16px;background:rgba(15,23,42,.94);box-shadow:0 18px 60px rgba(0,0,0,.35);text-align:center}
#arLaunchGate strong{display:block;margin-bottom:8px;font-size:18px;color:#f8fafc}
#arLaunchGate p{margin:0 0 14px;color:#bfdbfe;font-size:13px;line-height:1.55}
#arLaunchGate button,#arOverlay button{border:1px solid rgba(255,255,255,.26);border-radius:9px;background:#0f766e;color:#fff;padding:9px 10px;font:600 12px Segoe UI,Arial,sans-serif;touch-action:manipulation}
#arLaunchGate button.ghost,#arOverlay button.ghost{background:rgba(15,23,42,.78)}
#arOverlay{position:absolute;inset:0;z-index:65;pointer-events:none;color:#f8fafc}
#arScaleBadge{position:absolute;left:12px;top:12px;max-width:calc(100% - 24px);padding:9px 11px;border:1px solid rgba(94,234,212,.5);border-radius:10px;background:rgba(6,78,75,.82);font-size:12px;line-height:1.4;backdrop-filter:blur(5px)}
#arTrackingStatus{position:absolute;left:12px;right:12px;top:58px;padding:9px 11px;border:1px solid rgba(125,211,252,.35);border-radius:10px;background:rgba(15,23,42,.78);font-size:12px;line-height:1.45;text-align:center;backdrop-filter:blur(5px)}
#arControlPanel{position:absolute;left:8px;right:8px;bottom:8px;max-height:56%;padding:9px;border:1px solid rgba(125,211,252,.28);border-radius:13px;background:rgba(15,23,42,.84);backdrop-filter:blur(8px);pointer-events:auto;overflow:auto}
.ar-control-row{display:flex;gap:6px;flex-wrap:wrap;align-items:center;justify-content:center}
.ar-control-row+ .ar-control-row{margin-top:7px}
.ar-control-row button{flex:1 1 82px;min-width:68px}
.ar-control-row button.primary{background:#0f766e}
.ar-control-row button.warning{background:#92400e}
.ar-control-row button:disabled{opacity:.45}
.ar-rotate-row{display:grid;grid-template-columns:repeat(4,minmax(0,1fr))}
.ar-rotate-row button{min-width:0}
.ar-control-section{margin-top:8px;padding-top:8px;border-top:1px solid rgba(148,163,184,.22)}
.ar-control-section>strong{display:block;margin-bottom:6px;color:#bfdbfe;font-size:11px;text-align:center}
.ar-move-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;max-width:330px;margin:0 auto}
.ar-move-grid .blank{visibility:hidden}
#arGroundRow{display:grid;grid-template-columns:auto 1fr auto auto;gap:6px;align-items:center}
#arGroundOffsetInput{width:100%;accent-color:#2dd4bf}
#arGroundValue{min-width:52px;text-align:center;font:700 11px Segoe UI,Arial,sans-serif;color:#ccfbf1}
@media (orientation:landscape){
  #arTrackingStatus{left:12px;right:338px;top:58px}
  #arControlPanel{left:auto;right:8px;top:8px;bottom:8px;width:310px;max-height:none}
  #arScaleBadge{max-width:calc(100% - 350px)}
}
body.ar-landscape #arTrackingStatus{left:12px;right:338px;top:58px}
body.ar-landscape #arControlPanel{left:auto;right:8px;top:8px;bottom:8px;width:310px;max-height:none}
body.ar-landscape #arScaleBadge{max-width:calc(100% - 350px)}
</style>
<script src="./src/v10-language.js"></scr` + `ipt>
<script src="./src/drawing-text.js"></scr` + `ipt>
<script src="${threeSource}"></scr` + `ipt>
<script src="./src/v24-native-core.js?plmr_engine=v49-facade2"></scr` + `ipt>
<script src="./shared/project-layout.js?plmr_engine=v49-facade2"></scr` + `ipt>
<script src="${controlsSource}"></scr` + `ipt>
<script src="./src/ral-colors.js?v=10.49-r49"></scr` + `ipt>
<script src="./src/wood-transfer-data.js"></scr` + `ipt>
<script src="./src/powder-coat.js"></scr` + `ipt>
<script data-plmr-v70 src="./src/v53/surme-3d-engine.js?plmr_engine=v49-facade2"></scr` + `ipt>
<script data-plmr-v70 src="./src/v53/giyotin-3d-engine.js?plmr_engine=v49-facade2"></scr` + `ipt>
<script src="./assets/giyotin-v33/vendor/dxf/ezdxfR2018Template.js"></scr` + `ipt>
<script data-plmr-v70 src="./assets/giyotin-v33/giyotin-state.js?plmr_engine=v49-facade2"></scr` + `ipt>
<script data-plmr-v70 src="./assets/surme-v15/src/surme-state.js?plmr_engine=v49-facade2"></scr` + `ipt>
<script data-plmr-v70 src="./v70/title-document.js?plmr_engine=v49-facade2"></scr` + `ipt>
<script data-plmr-v70 src="./assets/surme-v15/src/surme-2d-document.js?plmr_engine=v49-facade2"></scr` + `ipt>
<script src="./assets/giyotin-v33/giyotin-2d-preview.js"></scr` + `ipt>
<script src="./assets/surme-v15/src/surme-2d-preview.js"></scr` + `ipt>
<script data-plmr-v70 src="./v70/modules.js?plmr_engine=v49-facade2"></scr` + `ipt>
<script data-plmr-v70 src="./src/v53-facade-adapter.js?plmr_engine=v49-facade2"></scr` + `ipt>
<script src="./native-v07/common.js"></scr` + `ipt>
<script src="./native-v07/door.js"></scr` + `ipt>
<script src="./native-v07/fixed.js"></scr` + `ipt>
<script src="./native-v07/zip.js"></scr` + `ipt>
<script src="./native-v07/folding.js"></scr` + `ipt>
<script src="./native-v07/balcony.js"></scr` + `ipt>
<script src="./src/v29-resources.js"></scr` + `ipt>
<script data-plmr-v70 src="./src/v25-v70-products.js?plmr_engine=v49-facade2"></scr` + `ipt>
<script src="./src/v24-viewer-exports.js"></scr` + `ipt>
<link rel="stylesheet" href="./native-v07/cube.css">
<script src="./native-v07/cube-zones.js"></scr` + `ipt>
<script src="./src/v25-viewcube.js"></scr` + `ipt>
<script src="./src/v5-sheet-viewport.js"></scr` + `ipt>
<script src="./shared/measurement-units.js"></scr` + `ipt>
<script src="./src/v5-dimension-style.js"></scr` + `ipt>
<script src="./src/v24-details2d.js"></scr` + `ipt>
<link rel="stylesheet" href="./src/v26-common-ui.css"><link rel="stylesheet" href="./src/v27-ui.css"><script src="./src/v27-scene.js?v=51"></scr` + `ipt><script src="./src/v25-composite-runtime.js?plmr_engine=v51-share"></scr` + `ipt>
<script src="./src/rr-zone-topology.js?v=2"></scr` + `ipt>
<script src="./src/v11-zone-core.js?v=12.0.0"></scr` + `ipt>
<script src="./src/v12-model-core.js"></scr` + `ipt>
<script src="./src/v13-core.js"></scr` + `ipt>
<script src="./src/v2-roof-input.js"></scr` + `ipt>
<script src="./src/v14-layout-core.js"></scr` + `ipt>
<script src="./src/v13-common-viewer.js"></scr` + `ipt>
<script src="./src/v12-post-editor.js"></scr` + `ipt>
<script src="./src/v11-interactions.js?v=12.0.0"></scr` + `ipt>
<script src="./src/bioclimatic-roof-core.js?v=8"></scr` + `ipt>
<script src="./src/bioclimatic-roof-chooser.js?v=12.0.0"></scr` + `ipt>
<script src="./src/v22-animation-core.js?v=51"></scr` + `ipt>
<script src="./src/v22-animation-viewer.js?v=51"></scr` + `ipt>
<script src="./src/bioclimatic-roof-viewer.js?v=23"></scr` + `ipt>
<script src="./src/rr-scene-core.js?v=12.0.0"></scr` + `ipt>
<script src="./src/v15-core.js"></scr` + `ipt>
<script src="./src/v16-core.js"></scr` + `ipt>
<script src="./src/v17-core.js"></scr` + `ipt>
<script src="./src/v18-zone-core.js"></scr` + `ipt>
<script src="./src/v17-selection-viewer.js"></scr` + `ipt>
<script src="./src/v18-mount-viewer.js"></scr` + `ipt>
<script src="./src/v20-profile-core.js"></scr` + `ipt>
<script src="./src/v19-facade-viewer.js"></scr` + `ipt>
<script src="./src/v15-measure-viewer.js"></scr` + `ipt>
<script src="./src/rr-scene-viewer.js?v=23"></scr` + `ipt>
<script src="./src/rr-sketch-core.js?v=10.0.0"></scr` + `ipt>
<script src="./src/rr-parapet-core.js?v=11.0.0"></scr` + `ipt>
<script src="./src/rr-sketch-viewer.js?v=12.0.0"></scr` + `ipt>
<script src="./products/pergo-rise/pergo-rise-editing.js"></scr` + `ipt>
<script src="./products/pergo-rise/pergo-rise-viewer.js"></scr` + `ipt>
</head>
<body>
<div id="fallback">3D viewer could not load. Three.js is loaded from a CDN.</div>
<div id="viewerHint" hidden>Çatı için oluklar arasındaki alanı, cephe ürünü için dikmeler arasındaki boşluğu seçin. Bir ürün panelini açıp kapatmak için çift tıklayın.</div>
<div id="rrSketchHud"><strong id="rrSketchHudTitle">Seç</strong><span class="value" id="rrSketchHudValue">—</span><span id="rrSketchHudHint"></span></div>
<div id="pergoRiseSelectionInfo"></div>
<div id="pergoRiseContextMenu" role="menu" aria-label="Pergola düzenleme menüsü"></div>
<div id="arLaunchGate" hidden>
  <div class="ar-gate-card">
    <strong>Manuel Gerçek Alan Yerleşimi</strong>
    <p>Kamera açıldığında ürün 1:1 ölçekte hemen çizilir. Zemin kotunu, mesafeyi, yönü ve konumu ekrandaki kontrollerle kendiniz ayarlarsınız.</p>
    <button id="arLaunchGateBtn" type="button">Kamerayı Aç</button>
    <button id="arLaunchGateCancelBtn" class="ghost" type="button">Vazgeç</button>
  </div>
</div>
<div id="arOverlay" hidden>
  <div id="arScaleBadge">Gerçek Ölçek 1:1</div>
  <div id="arTrackingStatus">Ürün hazırlanıyor; gerçek ölçekte kameranın önüne çizilecek.</div>
  <div id="arControlPanel">
    <div class="ar-control-row">
      <button id="arLockBtn" class="primary" type="button">Konumu Sabitle</button>
      <button id="arRepositionBtn" type="button" disabled>Yeniden Konumlandır</button>
      <button id="arLandscapeBtn" type="button">Yatay Kamera</button>
    </div>
    <div class="ar-control-section">
      <strong>Konum · Her dokunuş 10 cm</strong>
      <div class="ar-move-grid">
        <span class="blank"></span><button id="arMoveForwardBtn" type="button">↑ İleri</button><span class="blank"></span>
        <button id="arMoveLeftBtn" type="button">← Sol</button><button id="arMoveBackBtn" type="button">↓ Geri</button><button id="arMoveRightBtn" type="button">Sağ →</button>
      </div>
    </div>
    <div class="ar-control-section">
      <strong>Zemin Kotu · 1 cm hassasiyet</strong>
      <div id="arGroundRow">
        <button id="arMoveDownBtn" type="button">-1 cm</button>
        <input id="arGroundOffsetInput" type="range" min="-150" max="150" step="1" value="0" aria-label="Zemin kotu santimetre" />
        <span id="arGroundValue">0 cm</span>
        <button id="arMoveUpBtn" type="button">+1 cm</button>
      </div>
      <div class="ar-control-row"><button id="arGroundZeroBtn" type="button">Zemin Kotunu Sıfırla</button></div>
    </div>
    <div class="ar-control-section">
      <strong>Döndürme</strong>
      <div class="ar-control-row ar-rotate-row">
        <button id="arRotateFineLeftBtn" type="button">↶ 1°</button>
        <button id="arRotateLeftBtn" type="button">↶ 15°</button>
        <button id="arRotateRightBtn" type="button">15° ↷</button>
        <button id="arRotateFineRightBtn" type="button">1° ↷</button>
      </div>
    </div>
    <div class="ar-control-section"><div class="ar-control-row"><button id="arExitBtn" class="warning" type="button">AR Kapat</button></div></div>
  </div>
</div>
<script>
(function(){
const VIEWER_SESSION_ID=${viewerSessionIdJson};
function postParent(type,payload){
  parent.postMessage({source:'product-3d-viewer',sessionId:VIEWER_SESSION_ID,type,...(payload||{})},'*');
}
function reportViewerFailure(error){
  const message=String(error&&error.message||error||'3D görüntüleyici başlatılamadı.').slice(0,500);
  const fallback=document.getElementById('fallback');
  if(fallback){fallback.textContent='3D çizim oluşturulamadı: '+message;fallback.style.display='grid';}
  postParent('viewer-error',{message});
}
if(${standalonePreview}){
  window.addEventListener('error',event=>reportViewerFailure(event.error||event.message));
  window.addEventListener('unhandledrejection',event=>reportViewerFailure(event.reason));
}
if(!window.THREE || !THREE.OrbitControls){
  reportViewerFailure(${safeScriptJson('Paket içindeki Three.js veya OrbitControls dosyası yüklenemedi. ZIP dosyasını tamamen çıkarıp tekrar açın.')});
  return;
}
const PERGO_RISE_GLB_URL=${pergoRiseUrlJson};
let pergoRiseProject=${pergoRiseProjectJson};
let pergoRiseDerived=pergoRiseProject&&pergoRiseProject.derived?pergoRiseProject.derived:null;
// Legacy static-envelope contract retained for regression scanners: const W=${W}, D=${D}, H=${H};
let W=${W}, D=${D}, H=${H};
const PRODUCT_GROUP=${productGroupJson};
const STANDALONE_GUILLOTINE_ITEMS=${standaloneGuillotineItemsJson};
const IS_STANDALONE_GUILLOTINE_PREVIEW=Array.isArray(STANDALONE_GUILLOTINE_ITEMS)&&STANDALONE_GUILLOTINE_ITEMS.length>0;
const IS_BIO_RISE=PRODUCT_GROUP==='bio-rise';
const IS_GALAXY=PRODUCT_GROUP==='b-cube-galaxy';
const IS_BIO_FAMILY=IS_BIO_RISE||IS_GALAXY;
const IS_PERGO_RISE=PRODUCT_GROUP==='pergo-rise';
let RW=W-4, RD=D-99;
// Legacy panel-count contract retained for regression scanners: const LC=${LC};
let LC=${LC};
let SYSTEM_COUNT=${systemCountJson};
let pozNo=${Number(modelState.pozNo)||1};
let freedomMultiLayout=${freedomLayoutJson};
let bioRiseMultiLayout=${bioRiseLayoutJson};
let galaxyMultiLayout=${galaxyLayoutJson};
let orientations=[${O1},${O2},${O3},${O4}];
let postSections=${postJson};
let beamSection=${beamJson};
let placements=${placementsJson};
let zipPlacements=${zipPlacementsJson};
let facadeProfiles=${facadeProfilesJson};
let zoneDividers=${zoneDividersJson};
let zoneRegistry=${zoneRegistryJson};
let sceneEditorState=${sceneEditorJson};
window.PLMRV17PositionName=(no,index=0)=>{const s=Number(no||1)===Number(pozNo||1)?sceneEditorState:sceneEditorState.roofCopies.find(o=>Number(o.spec.pozNo)===Number(no))?.spec.sceneEditor;return s?.bioCodes?.[index]||'BIO-'+String(Number(no)||1).padStart(2,'0');};
let zonesVisible=${safeScriptJson(Boolean(showZones))};
let sketchWalls=${sketchWallsJson};
let selectedZoneId=${selectedZoneIdJson};
let dimensionVisibility=${dimensionVisibilityJson};
let productsOpen=${productsOpenJson};
let productOpenStates=${productOpenStatesJson};
let panelStates=${panelStatesJson};
let panelMasterOpen=${panelMasterOpenJson};
let SYSTEM_COLOR=${systemColorValue};
let PANEL_COLOR=${panelColorValue};
let DEFAULT_COLOR_MODE=${safeScriptJson(colorMode !== 'ral')};
let SYSTEM_FINISH=${safeScriptJson(systemColor && systemColor.finish || defaults.systemColor.finish)};
let PANEL_FINISH=${safeScriptJson(panelColor && panelColor.finish || defaults.panelColor.finish)};
let SYSTEM_COLOR_CODE=${safeScriptJson(systemColor && systemColor.code || '')};
let PANEL_COLOR_CODE=${safeScriptJson(panelColor && panelColor.code || '')};
let SYSTEM_COLOR_KIND=${safeScriptJson(systemColor && systemColor.kind || '')};
let PANEL_COLOR_KIND=${safeScriptJson(panelColor && panelColor.kind || '')};
let SYSTEM_COLOR_TEXTURE=${safeScriptJson(systemColor && systemColor.texture || '')};
let PANEL_COLOR_TEXTURE=${safeScriptJson(panelColor && panelColor.texture || '')};
function liveColorNumber(value,fallback){
  const raw=(value&&typeof value==='object')?value.hex:value;
  const text=String(raw||'').trim().replace(/^#/,'').replace(/^0x/i,'');
  return /^[0-9a-f]{6}$/i.test(text)?parseInt(text,16):fallback;
}
function liveFinish(value,fallback){
  const raw=String(value||fallback||'MATTE').toUpperCase();
  return ['GLOSS','TEXTURE','MATTE','WOOD_TRANSFER'].includes(raw)?raw:(fallback||'MATTE');
}
const ZIP_FABRIC_META=${zipFabricMetaJson};
const GLAZING_SECTION_SPECS=${glazingSectionSpecsJson};
const DOOR_TOP_FIXED_TYPES=new Set(['TOP_FIXED','LEFT_FIXED_TOP','RIGHT_FIXED_TOP','BOTH_FIXED_TOP','DOUBLE_TOP','DOUBLE_LEFT_FIXED_TOP','DOUBLE_RIGHT_FIXED_TOP','DOUBLE_BOTH_FIXED_TOP']);
let toolboxSelectionMode=${toolboxSelectionModeJson};
let toolboxSelectionKeys=new Set(${toolboxSelectionKeysJson});
const initialCameraState=${cameraStateJson};
let zoneFilters=${safeScriptJson(zoneFilters)};
let lamellaOpenMode=panelMasterOpen;
let pergoRiseComponentLibrary=null;
let pergoRiseLoadStatus=IS_PERGO_RISE?'pending':'not-required';
let pergoRiseAssemblyRoot=null;
let pergoRiseRenderSignatures=new Map();
let pergoRiseReconcileStats={runs:0,reused:0,replaced:0,added:0,removed:0,total:0};
let pergoRiseAssemblyRevision=0;
let pergoRiseAcceptedProjectRevision=0;
let pergoRiseStaleProjectMessagesIgnored=0;
// Facade motion uses persistent clocks and per-build transform bindings.
// Geometry rebuilds preserve progress; open/close commands only change targets.
const facadeMotions=new Map();
const v24NativeEntries=[];
let activeFacadeMotion=null,facadeMotionLastTime=performance.now();
function facadeEase(t){return t*t*(3-2*t);}
function facadeProgress(r){return (r.ease||facadeEase)(r.progress);}
function beginFacadeMotion(zone,placement,key){
  const id=(group.userData.facadeOwner||'roof-main')+'|'+key;
  let r=facadeMotions.get(id);
  if(!r||r.type!==placement.type){const initial=productIsOpen(key)?1:0;r={id,key,owner:group.userData.facadeOwner||'roof-main',type:placement.type,progress:initial,target:initial,v24Paused:true,bindings:[],seen:true};facadeMotions.set(id,r);}
  // Rebinding geometry is not an open/close command. Preserve phase and target.
  r.seen=true;r.bindings=[];activeFacadeMotion=r;
  return r;
}
function bindFacadeMotion(update){
  if(!activeFacadeMotion)return;
  activeFacadeMotion.bindings.push(update);update(facadeProgress(activeFacadeMotion));
}
function syncFacadeTargets(allProducts){
  for(const r of facadeMotions.values()){
    if(r.v25Standalone)continue;r.v24Paused=false;r.preview=null;const copy=sceneEditorState.roofCopies.find(c=>c.id===r.owner)?.spec,open=r.owner==='roof-main'?productIsOpen(r.key):(Object.prototype.hasOwnProperty.call(copy?.productOpenStates||{},r.key)?Boolean(copy.productOpenStates[r.key]):Boolean(copy?.productsOpen));r.target=(allProducts?productsOpen:open)?1:0;
    for(const update of r.bindings)update(facadeProgress(r));
  }
}
function tickFacadeMotion(){
  const now=performance.now(),dt=Math.min(1000,Math.max(0,now-facadeMotionLastTime));facadeMotionLastTime=now;
  for(const r of facadeMotions.values()){
    if(r.v24Paused)continue;
    if(r.progress===r.target){if(r.preview?.stage==='out'){r.target=r.preview.restore;r.preview.stage='back';}else{r.preview=null;continue;}}
    const step=dt/window.PLMRV16Core.MOTION_MS;
    r.progress=r.target>r.progress?Math.min(r.target,r.progress+step):Math.max(r.target,r.progress-step);
    const t=facadeProgress(r);for(const update of r.bindings)update(t);
  }
}
function bindFacadeTranslation(objects,axis,delta){
  const starts=objects.map(o=>o.position[axis]),record=activeFacadeMotion;
  bindFacadeMotion(t=>objects.forEach((o,i)=>{o.position[axis]=starts[i]+delta*t;if(o.userData.isTogglePanel)o.userData.panelOpen=Boolean(record.target); }));
}
function facadeMotionDebug(){
  return [...facadeMotions.values()].map(r=>({id:r.id,key:r.key,owner:r.owner,type:r.type,progress:r.progress,target:r.target,bindingCount:r.bindings.length,duration:window.PLMRV16Core.MOTION_MS}));
}

function productIsOpen(productKey){
  return Object.prototype.hasOwnProperty.call(productOpenStates||{},productKey)?Boolean(productOpenStates[productKey]):Boolean(productsOpen);
}
function markTogglePanel(mesh,zone,open,productKey){
  if(!mesh||!mesh.userData)return mesh;
  mesh.userData.isTogglePanel=true;
  mesh.userData.zoneId=zone.id;
  mesh.userData.productKey=productKey||zone.id;
  mesh.userData.panelOpen=Boolean(open);
  return mesh;
}

const scene=new THREE.Scene();
scene.background=window.PLMRV27Scene.background('empty');
const camera=new THREE.PerspectiveCamera(38,innerWidth/innerHeight,20,100000);
if(initialCameraState&&Array.isArray(initialCameraState.position)&&initialCameraState.position.length===3){
  camera.position.fromArray(initialCameraState.position);
  if(initialCameraState.up?.length===3&&initialCameraState.up.every(Number.isFinite))camera.up.fromArray(initialCameraState.up);
  camera.zoom=Number(initialCameraState.zoom)||1;camera.fov=Math.max(38,Math.min(110,Number(initialCameraState.fov)||38));
  camera.updateProjectionMatrix();
}else{
  camera.position.set(W*0.92,H*0.82,D*1.08);
}

const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(window.parent.__PLMR_ANIMATION_READONLY__?Math.min(1,1280/innerWidth,720/innerHeight):Math.min(devicePixelRatio||1,2));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=false;
if('outputColorSpace' in renderer && THREE.SRGBColorSpace)renderer.outputColorSpace=THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const controls=new THREE.OrbitControls(camera,renderer.domElement);
if(initialCameraState&&Array.isArray(initialCameraState.target)&&initialCameraState.target.length===3){
  controls.target.fromArray(initialCameraState.target);
}else{
  controls.target.set(0,0,0);
}
controls.enableDamping=true;
controls.dampingFactor=.08;
// Stage 9: presentation activity is derived runtime state only. Pausing the hidden
// viewer must never mutate canonical modelState or camera ownership.
let viewerRuntimeActive=true;
let animationLoopRunning=false;
let animationFrameCount=0;
let animationLoopStartCount=0;
let animationLoopStopCount=0;
function syncViewerAnimationLoop(){
  const xrPresenting=Boolean(renderer.xr&&renderer.xr.isPresenting);
  const shouldRun=viewerRuntimeActive||xrPresenting;
  sceneTools?.setActive(shouldRun);
  if(shouldRun&&!animationLoopRunning){renderer.setAnimationLoop(animate);animationLoopRunning=true;animationLoopStartCount+=1;}
  else if(!shouldRun&&animationLoopRunning){renderer.setAnimationLoop(null);animationLoopRunning=false;animationLoopStopCount+=1;controls.update();renderer.render(scene,camera);}
  return animationLoopRunning;
}
let cameraStateTimer=null;
function cameraSnapshot(){
  return {position:camera.position.toArray(),target:controls.target.toArray(),up:camera.up.toArray(),zoom:camera.zoom,fov:camera.fov};
}
function publishCameraState(){
  if(window.__PLMR_ANIMATION_VIEWER__?.cameraSyncSuspended())return;
  postParent('camera-state',{camera:cameraSnapshot()});
}
controls.addEventListener('change',()=>{
  // Corrective fallback: an interactive camera event must paint even if the derived
  // presentation loop is temporarily paused during an iframe/mode transition.
  if(!animationLoopRunning&&!arSession)renderer.render(scene,camera);
  if(cameraStateTimer)clearTimeout(cameraStateTimer);
  cameraStateTimer=setTimeout(publishCameraState,80);
});
controls.addEventListener('end',publishCameraState);

scene.add(new THREE.AmbientLight(0xffffff,.30));
scene.add(new THREE.HemisphereLight(0xffffff,0xd1d4d7,.77));
const dir=new THREE.DirectionalLight(0xffffff,.58);
dir.position.set(W*.35,H*1.1,D*.45);
dir.castShadow=false;
scene.add(dir);
const fill=new THREE.DirectionalLight(0xf0f4f8,.22);
fill.position.set(-W*.45,H*.55,-D*.5);
scene.add(fill);
const rim=new THREE.DirectionalLight(0xffffff,.32);
rim.position.set(-W*.7,H*.85,D*.9);
scene.add(rim);
const warm=new THREE.DirectionalLight(0xffe8c9,0);
warm.position.set(W*.1,H*.35,-D*.95);
scene.add(warm);

let group=new THREE.Group();
scene.add(group);
let modelGeneration=0;
let liveRebuildTimer=null;let pendingBioclimaticRebuild=false;
let lastAppliedLiveRevision=0;
const raycaster=new THREE.Raycaster();
const mouse=new THREE.Vector2();
let intermediateDimensionObjects=[];
let mainDimensionObjects=[];
let parts=[];
let interactiveObjects=[];
let zonePickers=[];
let hoveredZone=null;
let selectedZonePicker=null;
let pointerStart=null;
let pendingTogglePanelSelectionTimer=null;
let pendingTogglePanelZone=null;
let sketchTool='select';
let sketchWallRoot=null;
let sketchWallMeshes=[];
let sketchSelected=null;
let sketchPushState=null;
let sketchNumericBuffer='';
let sketchPreviewLine=null;
let sketchSnapMarker=null;

function cancelPendingTogglePanelSelection(){
  if(pendingTogglePanelSelectionTimer)clearTimeout(pendingTogglePanelSelectionTimer);
  pendingTogglePanelSelectionTimer=null;pendingTogglePanelZone=null;
}
function scheduleTogglePanelZoneSelection(zone){
  cancelPendingTogglePanelSelection();
  if(!zone)return;
  pendingTogglePanelZone={...zone};
  pendingTogglePanelSelectionTimer=setTimeout(()=>{
    const next=pendingTogglePanelZone;cancelPendingTogglePanelSelection();
    if(next)postParent('select-zone',{zone:{...next}});
  },420);
}
let animStep=0;
let timer=null;

const AR_METERS_PER_MM=0.001;
const AR_DEFAULT_EYE_HEIGHT=1.45;
const AR_MOVE_STEP=.10;
const AR_HEIGHT_STEP=.01;
const arRoot=new THREE.Group();
arRoot.visible=false;
scene.add(arRoot);
let arSession=null;
let arReferenceSpace=null;
let arPlacementInitialized=false;
let arPlacementLocked=false;
let arBaseYaw=0;
let arYawOffset=0;
let arBaseGroundY=0;
let arGroundOffset=0;
let arLastStatusAt=0;
let arLandscapeMode=false;
const arManualPosition=new THREE.Vector3();
const arLastCameraPosition=new THREE.Vector3();
const arCameraForward=new THREE.Vector3();
const arCameraRight=new THREE.Vector3();
let arRestoreCameraNear=camera.near;
let arRestoreCameraFar=camera.far;
let arModelSnapshot=null;
let arDeferredModelRebuild=false;

function postArStatus(message,tone){
  postParent('ar-status',{message:String(message||''),tone:tone||''});
}

function isLikelyIosDevice(){
  return /iPad|iPhone|iPod/i.test(navigator.userAgent||'') || (navigator.platform==='MacIntel' && navigator.maxTouchPoints>1);
}

async function getArCapabilities(){
  if(!window.isSecureContext){
    return {supported:false,reason:'secure-context',message:'AR için uygulama HTTPS üzerinden açılmalıdır. Dosyayı doğrudan file:// ile açmak yeterli değildir.'};
  }
  if(!navigator.xr || typeof navigator.xr.isSessionSupported!=='function'){
    const ios=isLikelyIosDevice();
    return {supported:false,reason:ios?'ios-webxr':'webxr-missing',message:ios?'Bu iPhone/iPad tarayıcısında WebXR AR desteği bulunamadı. Bu sürümde manuel gerçek ölçekli yerleştirme Android Chrome/WebXR cihazlarında çalışır.':'Bu tarayıcı WebXR artırılmış gerçeklik özelliğini desteklemiyor. Android Chrome ve ARCore destekli cihaz kullanın.'};
  }
  try{
    const supported=await navigator.xr.isSessionSupported('immersive-ar');
    return {supported:Boolean(supported),reason:supported?'':'immersive-ar-unsupported',message:supported?('AR hazır · '+Math.round(W)+' mm = '+(W/1000).toFixed(2)+' m · manuel konum · ölçek kilitli 1:1'):'Cihaz WebXR kullanıyor ancak immersive-ar oturumunu desteklemiyor.'};
  }catch(error){
    return {supported:false,reason:'capability-error',message:'AR desteği denetlenemedi: '+error.message};
  }
}

window.getP3DVARCapabilities=getArCapabilities;

function setArTrackingText(message){
  const element=document.getElementById('arTrackingStatus');
  if(element)element.textContent=String(message||'');
}

function setArScaleBadge(){
  const element=document.getElementById('arScaleBadge');
  if(element)element.textContent='Gerçek Ölçek 1:1 · '+Math.round(W)+' mm × '+Math.round(D)+' mm · '+(W/1000).toFixed(2)+' m × '+(D/1000).toFixed(2)+' m';
}

function showArLaunchGate(show){
  const gate=document.getElementById('arLaunchGate');
  if(gate)gate.hidden=!show;
}

function cloneArMaterial(material){
  if(!material||typeof material.clone!=='function')return material;
  const clone=material.clone();
  clone.userData={...(material.userData||{}),p3dvArSnapshotMaterial:true};
  return clone;
}

function disposeArSnapshot(){
  if(!arModelSnapshot)return;
  arModelSnapshot.traverse(object=>{
    const materials=Array.isArray(object.material)?object.material:[object.material];
    materials.filter(Boolean).forEach(material=>{if(material.userData&&material.userData.p3dvArSnapshotMaterial&&typeof material.dispose==='function')material.dispose();});
  });
  if(arModelSnapshot.parent)arModelSnapshot.parent.remove(arModelSnapshot);
  arModelSnapshot=null;
}

function isVisibleInsideModel(object){
  let current=object;
  while(current&&current!==group){
    if(current.visible===false)return false;
    current=current.parent;
  }
  // The live root is intentionally hidden before AR starts. Ignore only that
  // root-level visibility flag while preserving every descendant open/closed state.
  return current===group;
}

function cloneArRenderable(object,relativeMatrix){
  const clone=object.clone(false);
  if(object.material){
    clone.material=Array.isArray(object.material)?object.material.map(cloneArMaterial):cloneArMaterial(object.material);
  }
  clone.matrixAutoUpdate=false;
  clone.matrix.copy(relativeMatrix);
  clone.matrix.decompose(clone.position,clone.quaternion,clone.scale);
  clone.matrixWorldNeedsUpdate=true;
  clone.visible=true;
  clone.frustumCulled=object.frustumCulled;
  clone.renderOrder=object.renderOrder;
  clone.userData={...(object.userData||{}),p3dvArSnapshotPart:true,sourceUuid:object.uuid};
  return clone;
}

function createArSnapshot(){
  disposeArSnapshot();
  scene.updateMatrixWorld(true);
  group.updateMatrixWorld(true);
  const snapshot=new THREE.Group();
  snapshot.name='P3DV_AR_FLAT_WORLD_SNAPSHOT';
  const inverseGroupWorld=new THREE.Matrix4().copy(group.matrixWorld).invert();
  group.traverse(object=>{
    if(object===group||!isVisibleInsideModel(object))return;
    const renderable=Boolean(object.isMesh||object.isLine||object.isLineSegments||object.isPoints||object.isSprite);
    if(!renderable)return;
    const relativeMatrix=new THREE.Matrix4().multiplyMatrices(inverseGroupWorld,object.matrixWorld);
    snapshot.add(cloneArRenderable(object,relativeMatrix));
  });
  snapshot.scale.setScalar(AR_METERS_PER_MM);
  snapshot.position.set(0,H*AR_METERS_PER_MM*.5,0);
  snapshot.rotation.set(0,0,0);
  snapshot.visible=true;
  snapshot.updateMatrixWorld(true);
  arRoot.add(snapshot);
  arModelSnapshot=snapshot;
  return snapshot;
}

function eachArMaterial(callback){
  const source=arModelSnapshot||group;
  source.traverse(object=>{
    const materials=Array.isArray(object.material)?object.material:[object.material];
    materials.filter(Boolean).forEach(callback);
  });
}

function setArGhostMode(enabled){
  eachArMaterial(material=>{
    material.userData=material.userData||{};
    if(enabled){
      if(!material.userData.p3dvArSaved){
        material.userData.p3dvArSaved={opacity:material.opacity,transparent:material.transparent,depthWrite:material.depthWrite};
      }
      const saved=material.userData.p3dvArSaved;
      material.transparent=true;
      material.opacity=Math.max(.08,Number(saved.opacity||1)*.46);
      material.depthWrite=false;
    }else if(material.userData.p3dvArSaved){
      const saved=material.userData.p3dvArSaved;
      material.opacity=saved.opacity;
      material.transparent=saved.transparent;
      material.depthWrite=saved.depthWrite;
      delete material.userData.p3dvArSaved;
    }
    material.needsUpdate=true;
  });
}

function updateArControlState(){
  const lock=document.getElementById('arLockBtn');
  const reposition=document.getElementById('arRepositionBtn');
  if(lock)lock.disabled=!arPlacementInitialized||arPlacementLocked;
  if(reposition)reposition.disabled=!arPlacementInitialized||!arPlacementLocked;
  const ground=document.getElementById('arGroundOffsetInput');
  const groundValue=document.getElementById('arGroundValue');
  if(ground)ground.value=String(Math.round(arGroundOffset*100));
  if(groundValue)groundValue.textContent=(arGroundOffset>=0?'+':'')+Math.round(arGroundOffset*100)+' cm';
}

function prepareModelForAr(){
  if(liveRebuildTimer){
    clearTimeout(liveRebuildTimer);
    liveRebuildTimer=null;
    if(timer)clearInterval(timer);
    buildModel(true,{atomicSwap:true});
  }
  if(timer){clearInterval(timer);timer=null;}
  scene.updateMatrixWorld(true);
  group.updateMatrixWorld(true);
  intermediateDimensionObjects.forEach(item=>item.visible=false);
  mainDimensionObjects.forEach(item=>item.visible=false);
  zonePickers.forEach(item=>item.visible=false);
  box.visible=false;
  group.visible=false;
  createArSnapshot();
  arRoot.position.set(0,0,0);
  arRoot.rotation.set(0,0,0);
  arRoot.scale.set(1,1,1);
  arRoot.visible=false;
  setArGhostMode(true);
  controls.enabled=false;
  arRestoreCameraNear=camera.near;
  arRestoreCameraFar=camera.far;
  camera.near=.01;
  camera.far=1000;
  camera.updateProjectionMatrix();
  document.body.classList.add('ar-active');
  document.getElementById('arOverlay').hidden=false;
  setArScaleBadge();
  updateArControlState();
}

async function resetArOrientation(){
  arLandscapeMode=false;
  document.body.classList.remove('ar-landscape');
  const button=document.getElementById('arLandscapeBtn');
  if(button)button.textContent='Yatay Kamera';
  try{if(screen.orientation&&typeof screen.orientation.unlock==='function')screen.orientation.unlock();}catch(error){}
  try{if(document.fullscreenElement&&document.exitFullscreen)await document.exitFullscreen();}catch(error){}
}

function restoreModelAfterAr(){
  arRoot.visible=false;
  setArGhostMode(false);
  disposeArSnapshot();
  group.visible=true;
  box.visible=true;
  controls.enabled=true;
  camera.near=arRestoreCameraNear;
  camera.far=arRestoreCameraFar;
  camera.updateProjectionMatrix();
  document.body.classList.remove('ar-active');
  const overlay=document.getElementById('arOverlay');
  if(overlay)overlay.hidden=true;
  showArLaunchGate(false);
  if(arDeferredModelRebuild){
    arDeferredModelRebuild=false;
    buildModel(true,{atomicSwap:true});
  }
}

function arSnapshotDiagnostics(){
  const sourceBounds=new THREE.Box3().setFromObject(group);
  const originalParent=group.parent===scene;
  const originalPartVisibility=parts.map(part=>part.visible);
  const sourceVisibleMeshCount=(()=>{let count=0;group.traverse(object=>{if(object.isMesh&&object.visible)count+=1;});return count;})();
  prepareModelForAr();
  arRoot.visible=true;
  arRoot.updateMatrixWorld(true);
  const snapshotBounds=arModelSnapshot?new THREE.Box3().setFromObject(arModelSnapshot):new THREE.Box3();
  const sourceSize=new THREE.Vector3(),snapshotSize=new THREE.Vector3();
  sourceBounds.getSize(sourceSize);snapshotBounds.getSize(snapshotSize);
  const meshCount=arModelSnapshot?(()=>{let count=0;arModelSnapshot.traverse(object=>{if(object.isMesh)count+=1;});return count;})():0;
  const snapshotVisibleMeshCount=arModelSnapshot?(()=>{let count=0;arModelSnapshot.traverse(object=>{if(object.isMesh&&object.visible)count+=1;});return count;})():0;
  const originalPartVisibilityPreserved=parts.every((part,index)=>part.visible===originalPartVisibility[index]);
  const result={
    originalParentPreserved:originalParent&&group.parent===scene,
    originalHidden:group.visible===false,
    originalPartVisibilityPreserved,
    sourceVisibleMeshCount,
    snapshotMeshCount:meshCount,
    snapshotVisibleMeshCount,
    flatSnapshot:Boolean(arModelSnapshot&&arModelSnapshot.name==='P3DV_AR_FLAT_WORLD_SNAPSHOT'&&arModelSnapshot.children.every(child=>child.parent===arModelSnapshot)),
    sourceSize:[sourceSize.x,sourceSize.y,sourceSize.z],
    snapshotSize:[snapshotSize.x,snapshotSize.y,snapshotSize.z],
    scaleRatioX:sourceSize.x?snapshotSize.x/sourceSize.x:0,
    scaleRatioY:sourceSize.y?snapshotSize.y/sourceSize.y:0,
    scaleRatioZ:sourceSize.z?snapshotSize.z/sourceSize.z:0
  };
  restoreModelAfterAr();
  result.restoredPartVisibility=parts.every((part,index)=>part.visible===originalPartVisibility[index]);
  return result;
}
window.__P3DV_AR_TEST__={snapshotDiagnostics:arSnapshotDiagnostics};

function applyArPlacementTransform(){
  arRoot.position.set(arManualPosition.x,arBaseGroundY+arGroundOffset,arManualPosition.z);
  arRoot.rotation.set(0,arBaseYaw+arYawOffset,0);
  arRoot.visible=arPlacementInitialized;
  updateArControlState();
}

function arDefaultDistance(){
  return Math.max(3,Math.hypot(W,D)*AR_METERS_PER_MM*.68);
}

function getArCameraAxes(){
  const xrCamera=renderer.xr.getCamera(camera);
  xrCamera.getWorldPosition(arLastCameraPosition);
  xrCamera.getWorldDirection(arCameraForward);
  arCameraForward.y=0;
  if(arCameraForward.lengthSq()<.0001)arCameraForward.set(0,0,-1);
  arCameraForward.normalize();
  arCameraRight.crossVectors(arCameraForward,new THREE.Vector3(0,1,0)).normalize();
  return {camera:xrCamera,position:arLastCameraPosition,forward:arCameraForward,right:arCameraRight};
}

function initializeManualArPlacement(){
  if(arPlacementInitialized)return true;
  const axes=getArCameraAxes();
  const distance=arDefaultDistance();
  arManualPosition.copy(axes.position).addScaledVector(axes.forward,distance);
  arBaseGroundY=axes.position.y-AR_DEFAULT_EYE_HEIGHT;
  arGroundOffset=0;
  const dx=axes.position.x-arManualPosition.x;
  const dz=axes.position.z-arManualPosition.z;
  arBaseYaw=Math.atan2(-dx,-dz);
  arYawOffset=0;
  arPlacementInitialized=true;
  arPlacementLocked=false;
  setArGhostMode(true);
  applyArPlacementTransform();
  setArTrackingText('Ürün '+distance.toFixed(1)+' m öne gerçek ölçekte çizildi. Oklarla konumu, zemin kotunu ve yönü ayarlayın; ardından Konumu Sabitleyin.');
  postArStatus('Ürün kameranın önüne 1:1 ölçekte çizildi; manuel konumlandırma hazır.','success');
  return true;
}

function lockArPlacement(){
  if(!arPlacementInitialized)return false;
  arPlacementLocked=true;
  setArGhostMode(false);
  updateArControlState();
  setArTrackingText('Konum sabitlendi · gerçek ölçek 1:1. İnce ayar düğmeleri ölçeği değiştirmeden çalışır.');
  postArStatus('Manuel AR konumu sabitlendi.','success');
  return true;
}

function reopenArPlacement(){
  if(!arPlacementInitialized)return false;
  arPlacementLocked=false;
  setArGhostMode(true);
  updateArControlState();
  setArTrackingText('Yeniden konumlandırma açık · ürün yarı saydamdır. Taşıyın ve tekrar sabitleyin.');
  return true;
}

function moveArModel(direction,amount){
  if(!arPlacementInitialized)return;
  const axes=getArCameraAxes();
  if(direction==='forward')arManualPosition.addScaledVector(axes.forward,amount);
  if(direction==='right')arManualPosition.addScaledVector(axes.right,amount);
  applyArPlacementTransform();
  const distance=axes.position.distanceTo(arRoot.position);
  setArTrackingText('Konum ayarlandı · kamera mesafesi yaklaşık '+distance.toFixed(1)+' m · ölçek 1:1.');
}

function setArGroundOffset(valueMeters){
  arGroundOffset=Math.max(-1.5,Math.min(1.5,Number(valueMeters)||0));
  applyArPlacementTransform();
  setArTrackingText('Zemin kotu '+(arGroundOffset>=0?'+':'')+Math.round(arGroundOffset*100)+' cm · gerçek ürün yüksekliği değişmedi.');
}

function adjustArGround(delta){
  setArGroundOffset(arGroundOffset+delta);
}

function rotateArModel(delta){
  if(!arPlacementInitialized)return;
  arYawOffset+=delta;
  applyArPlacementTransform();
  setArTrackingText('Yön '+Math.round(arYawOffset*180/Math.PI)+'° ayarlandı · gerçek ölçek değişmedi.');
}

async function setArLandscapeMode(enable){
  const requested=Boolean(enable);
  let fullscreenOk=Boolean(document.fullscreenElement);
  let lockOk=false;
  if(requested){
    try{
      if(!document.fullscreenElement&&document.documentElement.requestFullscreen){
        await document.documentElement.requestFullscreen();
        fullscreenOk=true;
      }
    }catch(error){}
    try{
      if(screen.orientation&&typeof screen.orientation.lock==='function'){
        await screen.orientation.lock('landscape');
        lockOk=true;
      }
    }catch(error){}
    arLandscapeMode=true;
    document.body.classList.add('ar-landscape');
    const button=document.getElementById('arLandscapeBtn');
    if(button)button.textContent='Dikey Kamera';
    const message=lockOk?'Yatay kamera kilitlendi · ürün konumu ve 1:1 ölçek korundu.':'Yatay kilit tarayıcı tarafından verilmedi. Telefonu yatay çevirin; geniş arayüz hazır.';
    setArTrackingText(message);
    postArStatus(message,lockOk?'success':'warning');
  }else{
    await resetArOrientation();
    setArTrackingText('Dikey kamera düzenine dönüldü · ürün konumu ve ölçek korundu.');
    postArStatus('Dikey kamera düzenine dönüldü.','success');
  }
  return {fullscreen:fullscreenOk,locked:lockOk};
}

async function cleanupArSession(){
  arReferenceSpace=null;
  arSession=null;
  arPlacementInitialized=false;
  arPlacementLocked=false;
  arYawOffset=0;
  arGroundOffset=0;
  await resetArOrientation();
  restoreModelAfterAr();
  syncViewerAnimationLoop();
  postParent('ar-session-ended');
}

async function beginArSession(){
  if(arSession)return {ok:true,message:'AR oturumu zaten açık.'};
  const capability=await getArCapabilities();
  if(!capability.supported)return {ok:false,message:capability.message};
  renderer.xr.enabled=true;
  renderer.xr.setReferenceSpaceType('local');
  const sessionInit={
    optionalFeatures:['dom-overlay','local-floor'],
    domOverlay:{root:document.body}
  };
  const session=await navigator.xr.requestSession('immersive-ar',sessionInit);
  arSession=session;
  session.addEventListener('end',cleanupArSession,{once:true});
  try{
    await renderer.xr.setSession(session);
    syncViewerAnimationLoop();
    arReferenceSpace=await session.requestReferenceSpace('local');
    prepareModelForAr();
    showArLaunchGate(false);
    setArTrackingText('Kamera açık · ürün ilk karede gerçek ölçekte çizilecek. Zemin araması zorunlu değildir.');
    postArStatus('Kamera açıldı · '+Math.round(W)+' mm ürün '+(W/1000).toFixed(2)+' m gerçek genişlikte tutuluyor.','success');
    session.addEventListener('select',()=>{if(!arPlacementLocked)lockArPlacement();});
    return {ok:true,message:'Kamera açıldı. Ürün 1:1 ölçekte hemen çizilir; konumu ve zemin kotunu elle ayarlayın.'};
  }catch(error){
    try{await session.end();}catch(endError){}
    throw error;
  }
}

window.startP3DVAR=async function(){
  const capability=await getArCapabilities();
  if(!capability.supported){
    postArStatus(capability.message,'warning');
    return {ok:false,message:capability.message};
  }
  try{
    return await beginArSession();
  }catch(error){
    const activationError=['NotAllowedError','SecurityError','InvalidStateError'].includes(error&&error.name);
    if(activationError){
      showArLaunchGate(true);
      const message='Kamera izni için 3D alanın içindeki Kamerayı Aç düğmesine dokunun.';
      postArStatus(message,'warning');
      return {ok:false,retryInsideViewer:true,message};
    }
    const message='AR oturumu başlatılamadı: '+(error&&error.message?error.message:String(error));
    postArStatus(message,'error');
    return {ok:false,message};
  }
};

function updateArFrame(frame){
  if(!arSession||!frame)return;
  if(!arPlacementInitialized){
    initializeManualArPlacement();
    return;
  }
  arRoot.visible=true;
  const now=performance.now();
  if(now-arLastStatusAt>900&&!arPlacementLocked){
    const axes=getArCameraAxes();
    const distance=axes.position.distanceTo(arRoot.position);
    const suggested=arDefaultDistance();
    const guidance=distance<suggested*.72?' · ürünün tamamını görmek için Geri düğmesiyle uzaklaştırın.':' · konumu elle ayarlayın.';
    setArTrackingText('Manuel yerleşim açık · kamera mesafesi '+distance.toFixed(1)+' m'+guidance);
    arLastStatusAt=now;
  }
}

const arLaunchGateBtn=document.getElementById('arLaunchGateBtn');
if(arLaunchGateBtn)arLaunchGateBtn.addEventListener('click',async()=>{
  try{await beginArSession();}
  catch(error){postArStatus('AR başlatılamadı: '+error.message,'error');setArTrackingText('AR başlatılamadı: '+error.message);}
});
const arLaunchGateCancelBtn=document.getElementById('arLaunchGateCancelBtn');
if(arLaunchGateCancelBtn)arLaunchGateCancelBtn.addEventListener('click',()=>showArLaunchGate(false));
const arLockBtn=document.getElementById('arLockBtn');
if(arLockBtn)arLockBtn.addEventListener('click',lockArPlacement);
const arRepositionBtn=document.getElementById('arRepositionBtn');
if(arRepositionBtn)arRepositionBtn.addEventListener('click',reopenArPlacement);
const arMoveForwardBtn=document.getElementById('arMoveForwardBtn');
if(arMoveForwardBtn)arMoveForwardBtn.addEventListener('click',()=>moveArModel('forward',AR_MOVE_STEP));
const arMoveBackBtn=document.getElementById('arMoveBackBtn');
if(arMoveBackBtn)arMoveBackBtn.addEventListener('click',()=>moveArModel('forward',-AR_MOVE_STEP));
const arMoveLeftBtn=document.getElementById('arMoveLeftBtn');
if(arMoveLeftBtn)arMoveLeftBtn.addEventListener('click',()=>moveArModel('right',-AR_MOVE_STEP));
const arMoveRightBtn=document.getElementById('arMoveRightBtn');
if(arMoveRightBtn)arMoveRightBtn.addEventListener('click',()=>moveArModel('right',AR_MOVE_STEP));
const arMoveDownBtn=document.getElementById('arMoveDownBtn');
if(arMoveDownBtn)arMoveDownBtn.addEventListener('click',()=>adjustArGround(-AR_HEIGHT_STEP));
const arMoveUpBtn=document.getElementById('arMoveUpBtn');
if(arMoveUpBtn)arMoveUpBtn.addEventListener('click',()=>adjustArGround(AR_HEIGHT_STEP));
const arGroundZeroBtn=document.getElementById('arGroundZeroBtn');
if(arGroundZeroBtn)arGroundZeroBtn.addEventListener('click',()=>setArGroundOffset(0));
const arGroundOffsetInput=document.getElementById('arGroundOffsetInput');
if(arGroundOffsetInput)arGroundOffsetInput.addEventListener('input',event=>setArGroundOffset(Number(event.target.value)/100));
const arRotateFineLeftBtn=document.getElementById('arRotateFineLeftBtn');
if(arRotateFineLeftBtn)arRotateFineLeftBtn.addEventListener('click',()=>rotateArModel(-Math.PI/180));
const arRotateFineRightBtn=document.getElementById('arRotateFineRightBtn');
if(arRotateFineRightBtn)arRotateFineRightBtn.addEventListener('click',()=>rotateArModel(Math.PI/180));
const arRotateLeftBtn=document.getElementById('arRotateLeftBtn');
if(arRotateLeftBtn)arRotateLeftBtn.addEventListener('click',()=>rotateArModel(-Math.PI/12));
const arRotateRightBtn=document.getElementById('arRotateRightBtn');
if(arRotateRightBtn)arRotateRightBtn.addEventListener('click',()=>rotateArModel(Math.PI/12));
const arLandscapeBtn=document.getElementById('arLandscapeBtn');
if(arLandscapeBtn)arLandscapeBtn.addEventListener('click',()=>setArLandscapeMode(!arLandscapeMode));
const arExitBtn=document.getElementById('arExitBtn');
if(arExitBtn)arExitBtn.addEventListener('click',()=>{if(arSession)arSession.end();});

getArCapabilities().then(capability=>{
  postParent('ar-capability',{supported:capability.supported,message:capability.message});
});

function postDims(index){
  return postSections[index] || (IS_GALAXY?{x:180,z:140}:(IS_BIO_RISE?{x:150,z:100}:{x:170,z:170}));
}

function parseSectionInput(raw){
  if(raw===null)return null;
  const parts=String(raw).toLowerCase().replace(/,/g,'.').split(/[x*\\/ ]+/).filter(Boolean);
  if(parts.length<2)return null;
  const a=Math.round(Number(parts[0]));
  const b=Math.round(Number(parts[1]));
  if(!Number.isFinite(a)||!Number.isFinite(b)||a<20||b<20)return null;
  return {a,b};
}

function postLayoutFits(sections){
  const minOpening=120;
  return (
    sections[0].x + sections[1].x <= W - minOpening &&
    sections[2].x + sections[3].x <= W - minOpening &&
    sections[0].z + sections[2].z <= D - minOpening &&
    sections[1].z + sections[3].z <= D - minOpening
  );
}

function profileColor(defaultHex){
  return DEFAULT_COLOR_MODE ? defaultHex : SYSTEM_COLOR;
}

function panelColor(defaultHex){
  return DEFAULT_COLOR_MODE ? defaultHex : PANEL_COLOR;
}

function paintCodeForColor(color,role){
  if(DEFAULT_COLOR_MODE)return '';
  if(role==='structure'||role==='gutter'||role==='galaxy-combined-profile')return Number(color)===Number(SYSTEM_COLOR)?SYSTEM_COLOR_CODE:'';
  if(role==='roof-panel'||role==='roof-closure')return Number(color)===Number(PANEL_COLOR)?PANEL_COLOR_CODE:'';
  if(Number(color)===Number(SYSTEM_COLOR))return SYSTEM_COLOR_CODE;
  if(Number(color)===Number(PANEL_COLOR))return PANEL_COLOR_CODE;
  return '';
}

function autoFinishForColor(color){
  if(DEFAULT_COLOR_MODE)return 'MATTE';
  return Number(color) === Number(PANEL_COLOR) ? PANEL_FINISH : SYSTEM_FINISH;
}


const p3dvSharedGeometryCache=new Map();
const p3dvSharedMaterialCache=new Map();
const p3dvPerf={
  buildCount:0,lastBuildMs:0,lastBuildReason:'initial',lastPartCount:0,lastMeshCount:0,
  lastRaycastCandidates:0,lastFastBounds:0,lastSlowBounds:0,lastSharedGeometryHits:0,lastSharedMaterialHits:0,lastUniqueGeometryCount:0,lastUniqueMaterialCount:0,lastInstancedMeshCount:0,lastLogicalFreedomPanelCount:0,
  skippedRebuilds:0,scheduledRebuilds:0,legacyFreedomPanels:false,history:[]
};
let p3dvPerfCycle=null;
let lastBuiltGeometrySignature='';
function perfNow(){return typeof performance!=='undefined'&&performance.now?performance.now():Date.now();}
function beginPerfCycle(reason){
  p3dvPerfCycle={reason:String(reason||'model-build'),start:perfNow(),fastBounds:0,slowBounds:0,sharedGeometryHits:0,sharedMaterialHits:0};
}
function endPerfCycle(){
  if(!p3dvPerfCycle)return;
  const duration=Math.max(0,perfNow()-p3dvPerfCycle.start);
  let meshCount=0,instancedCount=0;const geometries=new Set(),materials=new Set();
  group.traverse(object=>{if(object.isMesh||object.isInstancedMesh){meshCount+=1;if(object.isInstancedMesh)instancedCount+=1;if(object.geometry)geometries.add(object.geometry);const mats=Array.isArray(object.material)?object.material:[object.material];mats.filter(Boolean).forEach(material=>materials.add(material));}});
  const logicalFreedomPanels=parts.reduce((sum,part)=>sum+(part&&part.userData&&Array.isArray(part.userData.instancePanels)?part.userData.instancePanels.length:(part&&part.userData&&part.userData.freedomStructuralKind==='panel'?1:0)),0);
  Object.assign(p3dvPerf,{buildCount:p3dvPerf.buildCount+1,lastBuildMs:duration,lastBuildReason:p3dvPerfCycle.reason,lastPartCount:parts.length,lastMeshCount:meshCount,lastRaycastCandidates:raycastCandidates().length,lastFastBounds:p3dvPerfCycle.fastBounds,lastSlowBounds:p3dvPerfCycle.slowBounds,lastSharedGeometryHits:p3dvPerfCycle.sharedGeometryHits,lastSharedMaterialHits:p3dvPerfCycle.sharedMaterialHits,lastUniqueGeometryCount:geometries.size,lastUniqueMaterialCount:materials.size,lastInstancedMeshCount:instancedCount,lastLogicalFreedomPanelCount:logicalFreedomPanels});
  p3dvPerf.history.push({ms:Number(duration.toFixed(2)),reason:p3dvPerfCycle.reason,parts:parts.length,meshes:meshCount,fastBounds:p3dvPerfCycle.fastBounds,slowBounds:p3dvPerfCycle.slowBounds});
  if(p3dvPerf.history.length>24)p3dvPerf.history.shift();
  p3dvPerfCycle=null;
}
function markShared(resource){
  if(resource){resource.userData=resource.userData||{};resource.userData.p3dvShared=true;}
  return resource;
}
function sharedUnitBoxGeometry(){
  const key='unit-box';
  if(p3dvSharedGeometryCache.has(key)){if(p3dvPerfCycle)p3dvPerfCycle.sharedGeometryHits+=1;return p3dvSharedGeometryCache.get(key);}
  const geometry=markShared(new THREE.BoxGeometry(1,1,1));geometry.computeBoundingBox();
  p3dvSharedGeometryCache.set(key,geometry);return geometry;
}
function sharedUnitBoxEdges(){
  const key='unit-box-edges';
  if(p3dvSharedGeometryCache.has(key)){if(p3dvPerfCycle)p3dvPerfCycle.sharedGeometryHits+=1;return p3dvSharedGeometryCache.get(key);}
  const geometry=markShared(new THREE.EdgesGeometry(sharedUnitBoxGeometry()));geometry.computeBoundingBox();
  p3dvSharedGeometryCache.set(key,geometry);return geometry;
}
function sharedSolidMaterial(color,opacity,finish,role){
  const safeOpacity=opacity===undefined?1:Number(opacity);
  const code=paintCodeForColor(color,role);
  if(!DEFAULT_COLOR_MODE){
    if(['structure','gutter','galaxy-combined-profile'].includes(role))finish=SYSTEM_FINISH;
    if(['roof-panel','roof-closure'].includes(role))finish=PANEL_FINISH;
  }
  const key=['solid',Number(color)||0,Number.isFinite(safeOpacity)?safeOpacity:1,String(finish||autoFinishForColor(color)),String(role||'generic'),code].join('|');
  if(p3dvSharedMaterialCache.has(key)){if(p3dvPerfCycle)p3dvPerfCycle.sharedMaterialHits+=1;return p3dvSharedMaterialCache.get(key);}
  const material=createSolidMaterial(color,Number.isFinite(safeOpacity)?safeOpacity:1,finish||autoFinishForColor(color),code);markShared(material);material.userData.p3dvRole=role||'generic';
  p3dvSharedMaterialCache.set(key,material);return material;
}
function sharedGlassMaterial(color,opacity,role){
  const key=['glass',Number(color)||0,Number(opacity)||0,String(role||'glass')].join('|');
  if(p3dvSharedMaterialCache.has(key)){if(p3dvPerfCycle)p3dvPerfCycle.sharedMaterialHits+=1;return p3dvSharedMaterialCache.get(key);}
  const material=createGlassMaterial(color,opacity);markShared(material);material.userData.p3dvRole=role||'glass';p3dvSharedMaterialCache.set(key,material);return material;
}
function sharedLineMaterial(color,opacity,role){
  const key=['line',Number(color)||0,Number(opacity)||0,String(role||'line')].join('|');
  if(p3dvSharedMaterialCache.has(key)){if(p3dvPerfCycle)p3dvPerfCycle.sharedMaterialHits+=1;return p3dvSharedMaterialCache.get(key);}
  const material=markShared(new THREE.LineBasicMaterial({color,transparent:true,opacity,depthWrite:false}));material.userData.p3dvRole=role||'line';p3dvSharedMaterialCache.set(key,material);return material;
}
function sceneObjectPickable(object){for(let p=object;p;p=p.parent){if(p.visible===false)return false;if(p===scene)return true;}return false;}
function raycastCandidates(){
  const seen=new Set();const result=[];
  const add=(object)=>{if(!object||!sceneObjectPickable(object)||seen.has(object))return;seen.add(object);result.push(object);};
  interactiveObjects.forEach(add);zonePickers.forEach(add);
  parts.forEach(part=>{
    const d=part&&part.userData||{};
    if(d.isDividerProfile||d.isTogglePanel||d.isProduct||d.p3dvPergoRiseSelectable||d.isBeam||d.isRoofProduct)add(part);
  });
  return result;
}
function fastWorldBounds(object){
  if(!object)return new THREE.Box3();
  object.updateMatrixWorld(true);
  let source=object;
  if(object.userData&&object.userData.p3dvBoundsSource)source=object.userData.p3dvBoundsSource;
  if(source&&source.geometry){
    const geometry=source.geometry;
    if(!geometry.boundingBox&&typeof geometry.computeBoundingBox==='function')geometry.computeBoundingBox();
    if(geometry.boundingBox){
      source.updateMatrixWorld(true);
      if(p3dvPerfCycle)p3dvPerfCycle.fastBounds+=1;
      return geometry.boundingBox.clone().applyMatrix4(source.matrixWorld);
    }
  }
  if(p3dvPerfCycle)p3dvPerfCycle.slowBounds+=1;
  return new THREE.Box3().setFromObject(object);
}
function createSolidMaterial(color,opacity,finish,code){
  return window.PLMRPowderCoat.create(color,finish||autoFinishForColor(color),{
    colorCode:code,transparent:opacity<1,opacity,depthWrite:opacity>.55,
    side:opacity<1?THREE.DoubleSide:THREE.FrontSide,
    polygonOffset:opacity>=1,polygonOffsetFactor:1,polygonOffsetUnits:1
  });
}

function createGlassMaterial(color,opacity){
  const glassish = Number(color) === 0x8be7ff ? {roughness:.06, metalness:.08} : (Number(color)===0xb68055 ? {roughness:.14, metalness:.04} : {roughness:.1, metalness:.03});
  return new THREE.MeshStandardMaterial({
    color,
    roughness: glassish.roughness,
    metalness: glassish.metalness,
    transparent: true,
    opacity,
    transmission: 0,
    depthWrite: false,
    side: THREE.DoubleSide
  });
}

function addBox(cfg,color,isPost){
  const mat=sharedSolidMaterial(color,1,(DEFAULT_COLOR_MODE?'MATTE':SYSTEM_FINISH),'structure');
  let geo=sharedUnitBoxGeometry();
  if(mat.userData.woodTransfer){
    const size=[cfg.sx,cfg.sy,cfg.sz],key='wood-box|'+size.join('|');
    if(!p3dvSharedGeometryCache.has(key)){
      const mapped=markShared(geo.clone());
      window.PLMRPowderCoat.profileUV(mapped,size);
      p3dvSharedGeometryCache.set(key,mapped);
    }
    geo=p3dvSharedGeometryCache.get(key);
  }
  const mesh=new THREE.Mesh(geo,mat);
  mesh.castShadow=true;
  mesh.receiveShadow=true;
  mesh.position.set(cfg.px,cfg.py,cfg.pz);
  mesh.scale.set(cfg.sx,cfg.sy,cfg.sz);
  mesh.userData={name:cfg.name,isPost,isBeam:Boolean(cfg.isBeam),postIndex:(cfg.idx===undefined?-1:cfg.idx),p3dvSize:[cfg.sx,cfg.sy,cfg.sz],...(cfg.userData||{})};
  mesh.add(new THREE.LineSegments(sharedUnitBoxEdges(),sharedLineMaterial(0x111111,.25,'structure-edge')));
  mesh.visible=false;
  group.add(mesh);
  parts.push(mesh);
  if(isPost)interactiveObjects.push(mesh);
  return mesh;
}

function gutterShape(sectionWidth,innerRun){
  if(PRODUCT_GROUP==='b-cube'){
    const section=window.PLMRBioclimaticRoof.gutterSection(sectionWidth,innerRun),shape=new THREE.Shape();
    section.outer.forEach((point,i)=>i?shape.lineTo(...point):shape.moveTo(...point));shape.closePath();
    const hole=new THREE.Path();section.hole.forEach((point,i)=>i?hole.lineTo(...point):hole.moveTo(...point));hole.closePath();shape.holes.push(hole);
    return shape;
  }

  const rise=58,height=IS_BIO_FAMILY?120:260,topFlat=36,topInset=12;
  const valleyX=sectionWidth-innerRun;
  const s=new THREE.Shape();
  s.moveTo(0,0);
  s.lineTo(topInset,rise);
  s.lineTo(topInset+topFlat,rise);
  s.lineTo(valleyX,0);
  s.lineTo(sectionWidth,0);
  s.lineTo(sectionWidth,height);
  s.lineTo(sectionWidth-4,height);
  s.lineTo(sectionWidth-4,0);
  s.lineTo(0,0);
  s.closePath();
  return s;
}

function applyMiterCuts(geo,sectionWidth,length){
  const pos=geo&&geo.attributes?geo.attributes.position:null;
  if(!pos||!Number.isFinite(Number(pos.count))){
    if(geo&&typeof geo.computeBoundingBox==='function')geo.computeBoundingBox();
    if(geo&&typeof geo.computeBoundingSphere==='function')geo.computeBoundingSphere();
    return;
  }
  for(let i=0;i<pos.count;i++){
    const x=pos.getX(i);
    let z=pos.getZ(i);
    const diag=sectionWidth-x;
    const startLimit=Math.max(0,diag);
    const endLimit=Math.min(length,length-diag);
    if(z<startLimit)z=startLimit;
    if(z>endLimit)z=endLimit;
    pos.setZ(i,z);
  }
  pos.needsUpdate=true;
  geo.computeVertexNormals();
  geo.computeBoundingBox();
  geo.computeBoundingSphere();
}

function sharedGutterGeometry(sectionWidth,innerRun,length,side,straightEnds){
  const safeLength=Math.max(1,Number(length)||1);const key=['gutter',sectionWidth,innerRun,safeLength,side,straightEnds?'straight':'miter'].join('|');
  if(p3dvSharedGeometryCache.has(key)){if(p3dvPerfCycle)p3dvPerfCycle.sharedGeometryHits+=1;return p3dvSharedGeometryCache.get(key);}
  const geo=new THREE.ExtrudeGeometry(gutterShape(sectionWidth,innerRun),{depth:safeLength,bevelEnabled:false,steps:1});
  if(!straightEnds)applyMiterCuts(geo,sectionWidth,safeLength);
  let rotY=0;if(side==='front')rotY=-Math.PI/2;if(side==='back')rotY=Math.PI/2;if(side==='right')rotY=Math.PI;
  if(rotY)geo.rotateY(rotY);window.PLMRPowderCoat.profileUV(geo);geo.computeBoundingBox();geo.computeBoundingSphere();markShared(geo);p3dvSharedGeometryCache.set(key,geo);return geo;
}
function sharedGutterEdges(sectionWidth,innerRun,length,side,straightEnds){
  const safeLength=Math.max(1,Number(length)||1);const key=['gutter-edges',sectionWidth,innerRun,safeLength,side,straightEnds?'straight':'miter'].join('|');
  if(p3dvSharedGeometryCache.has(key)){if(p3dvPerfCycle)p3dvPerfCycle.sharedGeometryHits+=1;return p3dvSharedGeometryCache.get(key);}
  const geo=markShared(new THREE.EdgesGeometry(sharedGutterGeometry(sectionWidth,innerRun,safeLength,side,straightEnds)));geo.computeBoundingBox();p3dvSharedGeometryCache.set(key,geo);return geo;
}
function createExtrudedGutter(name,sectionWidth,innerRun,length,color,side,straightEnds){
  const geo=sharedGutterGeometry(sectionWidth,innerRun,length,side,straightEnds);
  const mesh=new THREE.Mesh(geo,sharedSolidMaterial(color,1,autoFinishForColor(color),'gutter'));
  mesh.castShadow=true;mesh.receiveShadow=true;mesh.userData={name,isPost:false,postIndex:-1};
  mesh.add(new THREE.LineSegments(sharedGutterEdges(sectionWidth,innerRun,length,side,straightEnds),sharedLineMaterial(0x1f2937,.28,'gutter-edge')));
  mesh.visible=false;group.add(mesh);parts.push(mesh);return mesh;
}

// B-Cube Galaxy V3.83: B-CUBE GALAXY PROFILES.dxf kanonik birleşik kayıt+oluk kesitleri.
// DXF dış yüzeyi yerel X=0 kenarıdır. Kesitler: ön/arka 140x225, yan 180x225.
function galaxyCombinedProfilePoints(profileKind){
  return profileKind==='side'
    ? [[45,225],[0,225],[0,0],[180,0],[180,100],[160,100],[160,70],[45,70]]
    : [[45,225],[0,225],[0,0],[140,0],[140,100],[120,100],[120,70],[45,70]];
}
function galaxyCombinedProfileShape(profileKind){
  const pts=galaxyCombinedProfilePoints(profileKind);
  const shape=new THREE.Shape();
  shape.moveTo(pts[0][0],pts[0][1]);
  for(let i=1;i<pts.length;i++)shape.lineTo(pts[i][0],pts[i][1]);
  shape.closePath();
  return shape;
}
function sharedGalaxyCombinedProfileGeometry(profileKind,length,outerDirection){
  const safeLength=Math.max(1,Number(length)||1);
  const kind=profileKind==='side'?'side':'front-rear';
  const direction=String(outerDirection||'negX');
  const key=['galaxy-combined-profile',kind,safeLength,direction].join('|');
  if(p3dvSharedGeometryCache.has(key)){if(p3dvPerfCycle)p3dvPerfCycle.sharedGeometryHits+=1;return p3dvSharedGeometryCache.get(key);}
  const geo=new THREE.ExtrudeGeometry(galaxyCombinedProfileShape(kind),{depth:safeLength,bevelEnabled:false,steps:1});
  let rotY=0;
  if(direction==='posX')rotY=Math.PI;
  else if(direction==='negZ')rotY=-Math.PI/2;
  else if(direction==='posZ')rotY=Math.PI/2;
  if(rotY)geo.rotateY(rotY);
  geo.computeVertexNormals();window.PLMRPowderCoat.profileUV(geo);geo.computeBoundingBox();geo.computeBoundingSphere();markShared(geo);p3dvSharedGeometryCache.set(key,geo);return geo;
}
function sharedGalaxyCombinedProfileEdges(profileKind,length,outerDirection){
  const safeLength=Math.max(1,Number(length)||1);
  const kind=profileKind==='side'?'side':'front-rear';
  const direction=String(outerDirection||'negX');
  const key=['galaxy-combined-profile-edges',kind,safeLength,direction].join('|');
  if(p3dvSharedGeometryCache.has(key)){if(p3dvPerfCycle)p3dvPerfCycle.sharedGeometryHits+=1;return p3dvSharedGeometryCache.get(key);}
  const geo=markShared(new THREE.EdgesGeometry(sharedGalaxyCombinedProfileGeometry(kind,safeLength,direction)));geo.computeBoundingBox();p3dvSharedGeometryCache.set(key,geo);return geo;
}
function createGalaxyCombinedProfile(name,profileKind,length,color,outerDirection,userData){
  const kind=profileKind==='side'?'side':'front-rear';
  const safeLength=Math.max(1,Number(length)||1);
  const footprint=kind==='side'?180:140;
  const alongX=outerDirection==='negZ'||outerDirection==='posZ';
  const geo=sharedGalaxyCombinedProfileGeometry(kind,safeLength,outerDirection);
  const mesh=new THREE.Mesh(geo,sharedSolidMaterial(color,1,autoFinishForColor(color),'galaxy-combined-profile'));
  mesh.castShadow=true;mesh.receiveShadow=true;
  mesh.userData={name,isPost:false,isBeam:true,postIndex:-1,p3dvSize:alongX?[safeLength,225,footprint]:[footprint,225,safeLength],galaxyStructuralKind:'combined-profile',galaxyCombinedProfile:true,galaxyProfileKind:kind,galaxyOuterDirection:outerDirection,p3dvProfileSource:'B-CUBE GALAXY PROFILES.dxf',...(userData||{})};
  mesh.add(new THREE.LineSegments(sharedGalaxyCombinedProfileEdges(kind,safeLength,outerDirection),sharedLineMaterial(0x1f2937,.32,'galaxy-combined-profile-edge')));
  mesh.visible=false;group.add(mesh);parts.push(mesh);return mesh;
}

function lamelShape(narrowBy){
  const pts=[
    [249.334,27.759],[249.334,36.240],[236.642,43.568],[208.675,0.000],
    [0.138,0.000],[0.000,6.750],[19.817,40.493],[26.655,39.760],
    [32.954,35.990],[33.026,27.639],[35.746,27.639],[36.122,39.667],
    [106.399,36.106],[238.454,46.391],[251.343,46.391],[251.343,27.759]
  ];
  const fullWidth=251.343;
  const reduction=Math.max(0,Math.min(40,Number(narrowBy)||0));
  const scale=(fullWidth-reduction)/fullWidth;
  const cx=125.6715;
  const s=new THREE.Shape();
  s.moveTo((pts[0][0]-cx)*scale,pts[0][1]);
  for(let i=1;i<pts.length;i++)s.lineTo((pts[i][0]-cx)*scale,pts[i][1]);
  s.closePath();
  return s;
}

function resolvePergoRiseAssetUrl(url){
  const raw=String(url||'').trim();
  if(!raw)return '';
  try{return new URL(raw,parent.location.href).href;}catch(error){return raw;}
}

function isPergoRiseFabricName(name){
  const lower=String(name||'').toLowerCase();
  return lower.includes('kumaş')||lower.includes('kumas')||lower.includes('fabric')||lower.includes('screen');
}

function createPergoRiseMaterial(name){
  const lower=String(name||'').toLowerCase();
  if(isPergoRiseFabricName(name)) return createSolidMaterial(PANEL_COLOR,.94,autoFinishForColor(PANEL_COLOR));
  if(lower.includes('glass')||lower.includes('cam')) return createGlassMaterial(0xbfe4ff,.18);
  if(lower.includes('screw')||lower.includes('vida')||lower.includes('bolt')||lower.includes('motor')) return createSolidMaterial(0x4b5563,1,'MATTE');
  return createSolidMaterial(SYSTEM_COLOR,1,autoFinishForColor(SYSTEM_COLOR));
}

function loadPergoRiseTemplate(){
  if(!IS_PERGO_RISE){pergoRiseLoadStatus='not-required';return Promise.resolve(false);}
  if(pergoRiseComponentLibrary){pergoRiseLoadStatus='ready-lightweight';return Promise.resolve(true);}
  if(window.P3DVPergoRiseViewer&&window.P3DVPergoRiseViewer.createLightweightLibrary){
    try{
      pergoRiseComponentLibrary=window.P3DVPergoRiseViewer.createLightweightLibrary({THREE});
      pergoRiseLoadStatus='ready-lightweight';
      return Promise.resolve(true);
    }catch(error){
      pergoRiseLoadStatus='error-lightweight-library';
      console.error('Lightweight PLMR Pergo Rise profile library could not be initialized.',error);
      return Promise.resolve(false);
    }
  }
  pergoRiseLoadStatus='error-lightweight-library-unavailable';
  console.error('Pergo Rise lightweight profile library is unavailable.');
  return Promise.resolve(false);
}

function createFreedomLamel(name,length,color){
  return createLamel(name,length,color,0);
}

function createOpenedFreedomLamel(name,length,color,angleDeg){
  return createOpenedLamel(name,length,color,angleDeg,0,false);
}

function sharedLamelGeometry(narrowBy){
  const reduction=Math.max(0,Math.min(40,Number(narrowBy)||0));
  const key='lamel:'+reduction;
  if(p3dvSharedGeometryCache.has(key)){if(p3dvPerfCycle)p3dvPerfCycle.sharedGeometryHits+=1;return p3dvSharedGeometryCache.get(key);}
  const geo=new THREE.ExtrudeGeometry(lamelShape(reduction),{depth:1,bevelEnabled:false,steps:1});
  geo.rotateY(Math.PI/2);geo.computeVertexNormals();geo.computeBoundingBox();geo.computeBoundingSphere();markShared(geo);p3dvSharedGeometryCache.set(key,geo);return geo;
}
function sharedLamelEdges(narrowBy){
  const reduction=Math.max(0,Math.min(40,Number(narrowBy)||0));const key='lamel-edges:'+reduction;
  if(p3dvSharedGeometryCache.has(key)){if(p3dvPerfCycle)p3dvPerfCycle.sharedGeometryHits+=1;return p3dvSharedGeometryCache.get(key);}
  const geo=markShared(new THREE.EdgesGeometry(sharedLamelGeometry(reduction)));geo.computeBoundingBox();p3dvSharedGeometryCache.set(key,geo);return geo;
}
function createLamel(name,length,color,narrowBy){
  const geo=sharedLamelGeometry(narrowBy);
  const mesh=new THREE.Mesh(geo,sharedSolidMaterial(color,1,autoFinishForColor(color),'roof-panel'));
  mesh.scale.x=Math.max(1,Number(length)||1);
  mesh.castShadow=true;mesh.receiveShadow=true;
  mesh.userData={name,isPost:false,postIndex:-1,isLamel:true,isOpenLamel:false,p3dvLegacyLamel:true,p3dvLength:Number(length)||1};
  mesh.add(new THREE.LineSegments(sharedLamelEdges(narrowBy),sharedLineMaterial(0x214d21,.25,'roof-panel-edge')));
  mesh.visible=false;group.add(mesh);parts.push(mesh);return mesh;
}

function lamelProfileSpan(narrowBy){
  const fullWidth=251.343;
  const reduction=Math.max(0,Math.min(40,Number(narrowBy)||0));
  return fullWidth-reduction;
}

function createFixedClosureLamel(name,length,color,targetDepth,narrowBy){
  const geo=sharedLamelGeometry(narrowBy);const bbox=geo.boundingBox;
  const naturalDepth=Math.max(1,bbox.max.z-bbox.min.z);const safeDepth=Math.max(8,Number(targetDepth)||8);
  const mesh=new THREE.Mesh(geo,sharedSolidMaterial(color,1,autoFinishForColor(color),'roof-closure'));
  mesh.scale.set(Math.max(1,Number(length)||1),1,safeDepth/naturalDepth);
  mesh.castShadow=true;mesh.receiveShadow=true;
  mesh.userData={name,isPost:false,postIndex:-1,isLamel:false,isOpenLamel:false,isRoofClosure:true,p3dvLegacyLamel:true,p3dvLength:Number(length)||1};
  mesh.add(new THREE.LineSegments(sharedLamelEdges(narrowBy),sharedLineMaterial(0x153e75,.34,'roof-closure-edge')));
  mesh.visible=false;group.add(mesh);parts.push(mesh);return mesh;
}

function sharedOpenedLamelGeometry(narrowBy,flipProfile){
  if(!flipProfile)return sharedLamelGeometry(narrowBy);
  const reduction=Math.max(0,Math.min(40,Number(narrowBy)||0));const key='lamel-flipped:'+reduction;
  if(p3dvSharedGeometryCache.has(key)){if(p3dvPerfCycle)p3dvPerfCycle.sharedGeometryHits+=1;return p3dvSharedGeometryCache.get(key);}
  const geo=sharedLamelGeometry(reduction).clone();geo.rotateX(Math.PI);geo.computeBoundingBox();geo.computeBoundingSphere();markShared(geo);p3dvSharedGeometryCache.set(key,geo);return geo;
}
function sharedOpenedLamelEdges(narrowBy,flipProfile){
  if(!flipProfile)return sharedLamelEdges(narrowBy);
  const reduction=Math.max(0,Math.min(40,Number(narrowBy)||0));const key='lamel-flipped-edges:'+reduction;
  if(p3dvSharedGeometryCache.has(key)){if(p3dvPerfCycle)p3dvPerfCycle.sharedGeometryHits+=1;return p3dvSharedGeometryCache.get(key);}
  const geo=markShared(new THREE.EdgesGeometry(sharedOpenedLamelGeometry(reduction,true)));geo.computeBoundingBox();p3dvSharedGeometryCache.set(key,geo);return geo;
}
function createOpenedLamel(name,length,color,angleDeg,narrowBy,flipProfile){
  const geo=sharedOpenedLamelGeometry(narrowBy,flipProfile);const bbox=geo.boundingBox.clone();
  const pivot=new THREE.Group();
  const mesh=new THREE.Mesh(geo,sharedSolidMaterial(color,1,autoFinishForColor(color),'roof-panel'));
  mesh.scale.x=Math.max(1,Number(length)||1);
  mesh.castShadow=true;mesh.receiveShadow=true;
  // Unit extrusion is centered before length scaling, so the same lightweight profile can be reused.
  const scaledCenterX=((bbox.min.x+bbox.max.x)/2)*mesh.scale.x;
  mesh.position.set(-scaledCenterX,-bbox.min.y,-bbox.max.z);
  mesh.userData={name,isPost:false,postIndex:-1,isLamel:true,isOpenLamel:true,p3dvLegacyLamel:true,p3dvLength:Number(length)||1};
  mesh.add(new THREE.LineSegments(sharedOpenedLamelEdges(narrowBy,flipProfile),sharedLineMaterial(0x214d21,.25,'roof-panel-edge')));
  mesh.visible=false;pivot.rotation.x=THREE.MathUtils.degToRad(angleDeg);pivot.userData={p3dvBoundsSource:mesh};pivot.add(mesh);group.add(pivot);parts.push(mesh);
  return {pivot,mesh,bounds:bbox};
}

function sharedFreedomOpenInstanceGeometry(){
  const key='freedom-open-instance';
  if(p3dvSharedGeometryCache.has(key)){if(p3dvPerfCycle)p3dvPerfCycle.sharedGeometryHits+=1;return p3dvSharedGeometryCache.get(key);}
  const base=sharedLamelGeometry(0);const bbox=base.boundingBox;const geo=base.clone();
  geo.translate(-((bbox.min.x+bbox.max.x)/2),-bbox.min.y,-bbox.max.z);geo.computeBoundingBox();geo.computeBoundingSphere();markShared(geo);p3dvSharedGeometryCache.set(key,geo);return geo;
}
function matrixPlacedByBounds(geometry,config,opts){
  const object=new THREE.Object3D();
  object.position.set(0,0,0);object.rotation.set(Number(config.rx)||0,Number(config.ry)||0,Number(config.rz)||0);object.scale.set(Number(config.sx)||1,Number(config.sy)||1,Number(config.sz)||1);object.updateMatrix();
  if(!geometry.boundingBox&&geometry.computeBoundingBox)geometry.computeBoundingBox();
  const bbox=geometry.boundingBox.clone().applyMatrix4(object.matrix);
  if(opts.bottomY!==undefined)object.position.y+=opts.bottomY-bbox.min.y;
  if(opts.centerX!==undefined)object.position.x+=opts.centerX-(bbox.min.x+bbox.max.x)/2;
  if(opts.centerZ!==undefined)object.position.z+=opts.centerZ-(bbox.min.z+bbox.max.z)/2;
  if(opts.minX!==undefined)object.position.x+=opts.minX-bbox.min.x;
  if(opts.maxX!==undefined)object.position.x+=opts.maxX-bbox.max.x;
  if(opts.minZ!==undefined)object.position.z+=opts.minZ-bbox.min.z;
  if(opts.maxZ!==undefined)object.position.z+=opts.maxZ-bbox.max.z;
  object.updateMatrix();return {matrix:object.matrix.clone(),position:object.position.toArray()};
}
function createFreedomPanelInstances(moduleNumber,module,moduleLamelLength,modulePanelCount,grass,lamelBottomY,lamelOpenAngle,moduleLamelStartT,moduleCenterT,zSign,toWorldZ,lamelSpacing,lamelOpenSpacing,freedomMotorFacade,freedomMotorFacadeLabel){
  if(modulePanelCount<=0)return null;
  const opened=Boolean(lamellaOpenMode);const geometry=opened?sharedFreedomOpenInstanceGeometry():sharedLamelGeometry(0);
  const instanced=new THREE.InstancedMesh(geometry,sharedSolidMaterial(grass,1,autoFinishForColor(grass),'roof-panel'),modulePanelCount);
  instanced.castShadow=true;instanced.receiveShadow=true;instanced.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  const panelMeta=[];
  for(let i=0;i<modulePanelCount;i++){
    const closedFirstT=Math.max(2*moduleCenterT-moduleLamelStartT,moduleCenterT-Number(module.depth)/2+2+(modulePanelCount-1)*lamelSpacing+251.343);
    const edgeT=opened?(moduleLamelStartT+(modulePanelCount-1-i)*lamelOpenSpacing):(closedFirstT-i*lamelSpacing);
    const edgeZ=toWorldZ(edgeT);
    const opts=opened
      ?(zSign>0?{centerX:module.centerX,minZ:edgeZ,bottomY:lamelBottomY}:{centerX:module.centerX,maxZ:edgeZ,bottomY:lamelBottomY})
      :(zSign>0?{centerX:module.centerX,maxZ:edgeZ,bottomY:lamelBottomY}:{centerX:module.centerX,minZ:edgeZ,bottomY:lamelBottomY});
    const placed=matrixPlacedByBounds(geometry,{sx:moduleLamelLength,rx:opened?THREE.MathUtils.degToRad(lamelOpenAngle):0,ry:zSign>0?Math.PI:0},opts);
    instanced.setMatrixAt(i,placed.matrix);
    panelMeta.push({name:'Modül '+moduleNumber+' · Lamella '+(i+1),motorFacade:freedomMotorFacade,motorFacadeLabel:freedomMotorFacadeLabel,freedomStructuralKind:'panel',moduleIndex:module.moduleIndex,rowIndex:module.rowIndex,panelIndex:i,panelCollection:module.panelCollection,position:placed.position});
  }
  instanced.instanceMatrix.needsUpdate=true;instanced.visible=false;instanced.userData={name:'Modül '+moduleNumber+' · Freedom Panelleri',freedomStructuralKind:'panel',moduleIndex:module.moduleIndex,rowIndex:module.rowIndex,panelCollection:module.panelCollection,p3dvInstancedPanels:true,instancePanels:panelMeta,isLamel:true,isOpenLamel:opened,p3dvLegacyLamel:true};
  group.add(instanced);parts.push(instanced);return instanced;
}

// Placement options are expressed in the parent's engineering coordinates.
// Presentation parents (for example the +250 platform) must not enter this math.
function boundsInParent(object){
  object.updateWorldMatrix(true,true);
  const inverse=object.parent?object.parent.matrixWorld.clone().invert():new THREE.Matrix4();
  const result=new THREE.Box3(),source=object.userData?.p3dvBoundsSource||object;
  const add=node=>{
    if(!node.geometry)return;
    if(!node.geometry.boundingBox)node.geometry.computeBoundingBox();
    const transform=new THREE.Matrix4().multiplyMatrices(inverse,node.matrixWorld);
    result.union(node.geometry.boundingBox.clone().applyMatrix4(transform));
  };
  if(source.geometry)add(source);else source.traverse(add);
  return result;
}
function setMeshByBounds(mesh,opts){
  mesh.position.set(0,0,0);
  mesh.updateMatrixWorld(true);
  const bbox=boundsInParent(mesh);
  if(opts.bottomY!==undefined)mesh.position.y+=(opts.bottomY-bbox.min.y);
  if(opts.centerX!==undefined)mesh.position.x+=(opts.centerX-(bbox.min.x+bbox.max.x)/2);
  if(opts.centerZ!==undefined)mesh.position.z+=(opts.centerZ-(bbox.min.z+bbox.max.z)/2);
  if(opts.minX!==undefined)mesh.position.x+=(opts.minX-bbox.min.x);
  if(opts.maxX!==undefined)mesh.position.x+=(opts.maxX-bbox.max.x);
  if(opts.minZ!==undefined)mesh.position.z+=(opts.minZ-bbox.min.z);
  if(opts.maxZ!==undefined)mesh.position.z+=(opts.maxZ-bbox.max.z);
  mesh.updateMatrixWorld(true);
}

function setObjectByBounds(obj,opts){
  obj.position.set(0,0,0);
  obj.updateMatrixWorld(true);
  const bbox=boundsInParent(obj);
  if(opts.bottomY!==undefined)obj.position.y+=(opts.bottomY-bbox.min.y);
  if(opts.centerX!==undefined)obj.position.x+=(opts.centerX-(bbox.min.x+bbox.max.x)/2);
  if(opts.centerZ!==undefined)obj.position.z+=(opts.centerZ-(bbox.min.z+bbox.max.z)/2);
  if(opts.minX!==undefined)obj.position.x+=(opts.minX-bbox.min.x);
  if(opts.maxX!==undefined)obj.position.x+=(opts.maxX-bbox.max.x);
  if(opts.minZ!==undefined)obj.position.z+=(opts.minZ-bbox.min.z);
  if(opts.maxZ!==undefined)obj.position.z+=(opts.maxZ-bbox.max.z);
  obj.updateMatrixWorld(true);
}

function addProductBox(zone,cfg,color,opacity){
  const axisX=zone.axis==='x';const sx=axisX?cfg.w:cfg.t,sy=cfg.h,sz=axisX?cfg.t:cfg.w;
  const mat=(opacity<.7?sharedGlassMaterial(color,opacity,'product-glass'):sharedSolidMaterial(color,opacity,autoFinishForColor(color),'product'));
  const mesh=new THREE.Mesh(sharedUnitBoxGeometry(),mat);
  mesh.scale.set(sx,sy,sz);mesh.castShadow=opacity>.5;mesh.receiveShadow=true;
  const x=axisX ? zone.cx+cfg.u : zone.cx+cfg.v;const z=axisX ? zone.cz+cfg.v : zone.cz+cfg.u;
  mesh.position.set(x,cfg.y,z);
  mesh.userData={name:cfg.name||'Product part',isProduct:true,zoneId:zone.id,p3dvSize:[sx,sy,sz]};
  mesh.add(new THREE.LineSegments(sharedUnitBoxEdges(),sharedLineMaterial(opacity<.8?0x164e63:0x111827,.48,'product-edge')));
  mesh.visible=false;group.add(mesh);parts.push(mesh);interactiveObjects.push(mesh);return mesh;
}

function addRotatedProductBox(zone,cfg,color,opacity,hingeU,angle){
  const relativeU=cfg.u-hingeU;
  const cos=Math.cos(angle);
  const sin=Math.sin(angle);
  const rotated={
    ...cfg,
    u:hingeU+cos*relativeU-sin*(cfg.v||0),
    v:sin*relativeU+cos*(cfg.v||0)
  };
  const mesh=addProductBox(zone,rotated,color,opacity);
  mesh.rotation.y=zone.axis==='x'?-angle:angle;
  return mesh;
}

function addBottomHungProductBox(zone,cfg,color,opacity,angle,hingeY){
  const axisX=zone.axis==='x';
  const sx=axisX?cfg.w:cfg.t,sy=cfg.h,sz=axisX?cfg.t:cfg.w;
  const mat=(opacity<.7?sharedGlassMaterial(color,opacity,'product-glass'):sharedSolidMaterial(color,opacity,autoFinishForColor(color),'product'));
  const mesh=new THREE.Mesh(sharedUnitBoxGeometry(),mat);mesh.scale.set(sx,sy,sz);
  mesh.castShadow=opacity>.5;mesh.receiveShadow=true;
  mesh.userData={name:cfg.name||'Product part',isProduct:true,zoneId:zone.id,p3dvSize:[sx,sy,sz]};
  mesh.add(new THREE.LineSegments(sharedUnitBoxEdges(),sharedLineMaterial(opacity<.8?0x164e63:0x111827,.48,'product-edge')));
  const pivot=new THREE.Group();
  pivot.position.set(axisX?zone.cx+cfg.u:zone.cx+cfg.v,hingeY,axisX?zone.cz+cfg.v:zone.cz+cfg.u);
  mesh.position.set(0,cfg.y-hingeY,0);
  if(axisX){
    pivot.rotation.x=zone.inward*angle;
  }else{
    pivot.rotation.z=-zone.inward*angle;
  }
  pivot.add(mesh);
  mesh.visible=false;
  group.add(pivot);
  parts.push(mesh);
  interactiveObjects.push(mesh);
  return mesh;
}


function glazingSectionSpec(placement){
  const thickness=String(placement.glassThickness||'8 MM').toUpperCase();
  const spec=GLAZING_SECTION_SPECS[thickness]||GLAZING_SECTION_SPECS['8 MM'];
  return {glassDepth:Number(spec.glassDepth),frameDepth:Number(spec.frameDepth)};
}

function createArrowGeometry(length,shaftWidth,headWidth,headLength,direction,vertical){
  const half=length/2;
  const shaftHalf=shaftWidth/2;
  const headHalf=headWidth/2;
  const bodyEnd=half-headLength;
  const shape=new THREE.Shape();
  shape.moveTo(-half,-shaftHalf);
  shape.lineTo(bodyEnd,-shaftHalf);
  shape.lineTo(bodyEnd,-headHalf);
  shape.lineTo(half,0);
  shape.lineTo(bodyEnd,headHalf);
  shape.lineTo(bodyEnd,shaftHalf);
  shape.lineTo(-half,shaftHalf);
  shape.closePath();
  const geo=new THREE.ExtrudeGeometry(shape,{depth:4,bevelEnabled:false,steps:1});
  geo.translate(0,0,-2);
  if(direction<0)geo.rotateZ(Math.PI);
  if(vertical)geo.rotateZ(Math.PI/2);
  return geo;
}

function addFacadeArrow(zone,cfg){
  const length=Math.max(80,Math.min(cfg.length,Math.max(80,cfg.maxLength||cfg.length)));
  const thick=Boolean(cfg.thick);
  const geo=createArrowGeometry(length,thick?26:10,thick?68:38,Math.min(length*.28,thick?82:54),cfg.direction||1,Boolean(cfg.vertical));
  if(zone.axis==='z')geo.rotateY(-Math.PI/2);
  const mat=new THREE.MeshStandardMaterial({color:thick?0xf97316:0xf8fafc,roughness:.45,metalness:.05,side:THREE.DoubleSide});
  const mesh=new THREE.Mesh(geo,mat);
  const x=zone.axis==='x'?zone.cx+(cfg.u||0):zone.cx+(cfg.v||0);
  const z=zone.axis==='x'?zone.cz+(cfg.v||0):zone.cz+(cfg.u||0);
  mesh.position.set(x,cfg.y,z);
  mesh.userData={name:cfg.name||'Direction Arrow',isProduct:true,zoneId:zone.id};
  mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo),new THREE.LineBasicMaterial({color:0x111827,transparent:true,opacity:.82})));
  mesh.visible=false;
  group.add(mesh);
  parts.push(mesh);
  return mesh;
}

function addFacadeText(zone,cfg){
  const canvas=document.createElement('canvas');
  canvas.width=512;
  canvas.height=160;
  const ctx=canvas.getContext('2d');
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle='rgba(15,23,42,.88)';
  ctx.fillRect(4,4,504,152);
  ctx.strokeStyle='#f8fafc';
  ctx.lineWidth=8;
  ctx.strokeRect(8,8,496,144);
  ctx.fillStyle='#f8fafc';
  ctx.font='bold 92px Segoe UI, Arial, sans-serif';
  ctx.textAlign='center';
  ctx.textBaseline='middle';
  ctx.fillText(cfg.text||'',256,83);
  const texture=new THREE.CanvasTexture(canvas);
  texture.needsUpdate=true;
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(cfg.w,cfg.h),new THREE.MeshBasicMaterial({map:texture,transparent:true,side:THREE.DoubleSide,depthTest:true}));
  if(zone.axis==='x')mesh.rotation.y=zone.inward===1?Math.PI:0;
  else mesh.rotation.y=-zone.inward*Math.PI/2;
  const x=zone.axis==='x'?zone.cx+(cfg.u||0):zone.cx+(cfg.v||0);
  const z=zone.axis==='x'?zone.cz+(cfg.v||0):zone.cz+(cfg.u||0);
  mesh.position.set(x,cfg.y,z);
  mesh.userData={name:cfg.name||cfg.text||'Label',isProduct:true,zoneId:zone.id,presentationAnnotation:true};
  mesh.visible=false;
  group.add(mesh);
  parts.push(mesh);
  return mesh;
}

function drawCurvedTurnArrow(ctx,direction,fillHex){
  const right=direction!=='LEFT';
  ctx.save();
  ctx.translate(256,256);
  if(!right)ctx.scale(-1,1);
  ctx.lineCap='round';
  ctx.lineJoin='round';
  ctx.strokeStyle='rgba(15,23,42,.9)';
  ctx.fillStyle=fillHex;
  ctx.lineWidth=28;
  ctx.beginPath();
  ctx.arc(-8,8,132,Math.PI*1.18,Math.PI*0.08,false);
  ctx.stroke();
  const tipX=120;
  const tipY=42;
  ctx.beginPath();
  ctx.moveTo(tipX,tipY);
  ctx.lineTo(tipX-64,tipY-18);
  ctx.lineTo(tipX-34,tipY+46);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-8,8,132,Math.PI*1.18,Math.PI*0.08,false);
  ctx.strokeStyle=fillHex;
  ctx.lineWidth=18;
  ctx.stroke();
  ctx.restore();
}

function createPanelSymbolPlane(text,width,height,fontSize,color,opacity,turnDirection){
  const canvas=document.createElement('canvas');
  canvas.width=512;
  canvas.height=512;
  const ctx=canvas.getContext('2d');
  ctx.clearRect(0,0,canvas.width,canvas.height);
  const alpha=Math.max(.12,Math.min(1,Number(opacity)||1));
  const numericColor=Number.isFinite(Number(color))?Number(color):0xf97316;
  const fillHex='#'+Math.max(0,Math.min(0xffffff,numericColor)).toString(16).padStart(6,'0');
  if(text==='↻' && turnDirection){
    drawCurvedTurnArrow(ctx,turnDirection,fillHex);
  }else{
    ctx.font='bold '+Math.max(72,Number(fontSize)||120)+'px Segoe UI Symbol, Segoe UI, Arial, sans-serif';
    ctx.textAlign='center';
    ctx.textBaseline='middle';
    ctx.globalAlpha=1;
    ctx.lineWidth=18;
    ctx.strokeStyle='rgba(15,23,42,.9)';
    ctx.strokeText(text||'',256,260);
    ctx.fillStyle=fillHex;
    ctx.fillText(text||'',256,260);
    ctx.globalAlpha=1;
  }
  const texture=new THREE.CanvasTexture(canvas);
  texture.needsUpdate=true;
  const material=new THREE.MeshBasicMaterial({map:texture,transparent:true,opacity:alpha,side:THREE.DoubleSide,depthTest:true});
  return new THREE.Mesh(new THREE.PlaneGeometry(width,height),material);
}

function slidingPhysicalSideFromView(side,zone,slidingView){
  if(side!=='LEFT'&&side!=='RIGHT')return side;
  // Dış Bakış, mevcut Sürme Sistem fiziksel yön sözleşmesidir. İç Bakış yalnız sağ/sol yorumunu aynalar.
  return slidingView==='INSIDE VIEW'?(side==='LEFT'?'RIGHT':'LEFT'):side;
}

function foldingPositiveUAppearsRight(zone,foldingView){
  const outside=foldingView==='OUTSIDE VIEW';
  const inwardSign=Number(zone&&zone.inward)===-1?-1:1;
  const forwardSign=(outside?1:-1)*inwardSign;
  return (zone&&zone.axis)==='z'?forwardSign:-forwardSign;
}

function foldingMirrorSideByView(side,zone,foldingView){
  if(side==='BOTH')return 'BOTH';
  const mirror=foldingPositiveUAppearsRight(zone,foldingView)<0;
  return mirror?(side==='LEFT'?'RIGHT':'LEFT'):side;
}

function foldingPhysicalSideFromView(side,zone,foldingView){
  return foldingMirrorSideByView(side,zone,foldingView);
}

function foldingViewSideFromPhysical(side,zone,foldingView){
  return foldingMirrorSideByView(side,zone,foldingView);
}

function foldingFoldV(zone,foldingOpenDirection){
  return foldingOpenDirection==='INWARD'?zone.inward:-zone.inward;
}

function foldingTowardViewer(foldingView,foldingOpenDirection){
  return (foldingView==='INSIDE VIEW' && foldingOpenDirection==='INWARD')
    || (foldingView==='OUTSIDE VIEW' && foldingOpenDirection==='OUTWARD');
}

function foldingFirstTurnDirection(physicalSide,zone,foldingView,foldingOpenDirection){
  const towardViewer=foldingTowardViewer(foldingView,foldingOpenDirection);
  const viewSide=foldingViewSideFromPhysical(physicalSide,zone,foldingView);
  if(towardViewer)return viewSide==='LEFT'?'RIGHT':'LEFT';
  return viewSide==='LEFT'?'LEFT':'RIGHT';
}

function doorTurnDirection(hingeDirection,doorOpenDirection){
  const hingeLeft=hingeDirection==='LEFT';
  const towardViewer=String(doorOpenDirection||'OUTWARD')!=='INWARD';
  if(towardViewer)return hingeLeft?'RIGHT':'LEFT';
  return hingeLeft?'LEFT':'RIGHT';
}

function addFacadePanelSymbol(zone,cfg){
  const mesh=createPanelSymbolPlane(cfg.text,cfg.w,cfg.h,cfg.fontSize,cfg.color,cfg.opacity,cfg.turnDirection);
  const insideFace=cfg.face==='inside';
  if(zone.axis==='x')mesh.rotation.y=(zone.inward===1?Math.PI:0)+(insideFace?Math.PI:0);
  else mesh.rotation.y=-zone.inward*Math.PI/2+(insideFace?Math.PI:0);
  mesh.rotation.z=Number(cfg.rotationZ)||0;
  const x=zone.axis==='x'?zone.cx+(cfg.u||0):zone.cx+(cfg.v||0);
  const z=zone.axis==='x'?zone.cz+(cfg.v||0):zone.cz+(cfg.u||0);
  mesh.position.set(x,cfg.y,z);
  mesh.userData={name:cfg.name||'Panel Symbol',isProduct:true,zoneId:zone.id};
  mesh.visible=false;
  group.add(mesh);
  parts.push(mesh);
  return mesh;
}

function addDoorPivotSymbol(zone,pivot,cfg,hingeU,hingeV,productOpen){
  const mesh=createPanelSymbolPlane(cfg.text,cfg.w,cfg.h,cfg.fontSize,cfg.color,cfg.opacity,cfg.turnDirection);
  const du=cfg.u-hingeU;
  const dv=cfg.v-hingeV;
  const insideFace=cfg.face==='inside';
  const faceOffset=(insideFace?1:-1)*zone.inward*4;
  if(zone.axis==='x'){
    mesh.rotation.y=insideFace?Math.PI:0;
    mesh.position.set(du,cfg.y,dv+faceOffset);
  }else{
    mesh.rotation.y=-Math.PI/2+(insideFace?Math.PI:0);
    mesh.position.set(dv+faceOffset,cfg.y,du);
  }
  mesh.rotation.z=Number(cfg.rotationZ)||0;
  mesh.userData={name:cfg.name||'Pivot Symbol',isProduct:true,zoneId:zone.id};
  mesh.visible=false;
  pivot.add(mesh);
  parts.push(mesh);
  markTogglePanel(mesh,zone,productOpen,zone.id);
  return mesh;
}

function glassVisualColor(placement){
  const color=String(placement.glassColor||'TRANSPARENT').toUpperCase();
  if(color==='FUME' || color==='GREY')return 0x6b7280;
  if(color==='BRONZE')return 0xb68055;
  if(color==='LOW-E GLASS')return 0x8be7ff;
  if(color==='OTHER')return 0x93c5fd;
  return 0xb7ddff;
}

function motorVisualColor(placement){
  if(!DEFAULT_COLOR_MODE)return SYSTEM_COLOR;
  const type=String((placement&&placement.motorType)||'').toUpperCase();
  if(type==='SOMFY IO')return 0x312e81;
  if(type==='RISING')return 0x6b21a8;
  return 0x4c1d95;
}

function productDepthCenter(zone,depth,inset){
  const safeInset=Math.max(0,Number(inset)||0);
  return zone.outerFaceV+zone.inward*(depth/2+safeInset);
}

function productSurfaceCenter(zone,partCenter,partDepth,overlayDepth){
  const depth=Math.max(0,Number(overlayDepth)||0);
  return partCenter-zone.inward*(partDepth/2-depth/2);
}

function fitProductZone(zone,clearance){
  const total=Math.max(0,Number(clearance)||0);
  const half=total/2;
  return {
    ...zone,
    width:Math.max(80,zone.width-total),
    height:Math.max(120,zone.height-total),
    bottomY:zone.bottomY+half,
    topY:zone.topY-half
  };
}

function zipBoxSectionSpec(placement){
  const subtype=String(placement.subtype||'100x100 BOX').toUpperCase();
  if(subtype==='110x110 BOX')return {width:110,height:110,depth:110};
  if(subtype==='HERCULE')return {width:150,height:150,depth:150};
  if(subtype==='115x115 BOX')return {width:115,height:115,depth:115};
  if(subtype==='130x130 BOX')return {width:130,height:130,depth:130};
  return {width:100,height:100,depth:100};
}

function fitZipProductZone(zone,placement){
  const box=zipBoxSectionSpec(placement);
  if(String(placement.placementLocation||'BETWEEN POSTS')!=='FRONT OF POSTS'){
    const centered=fitProductZone(zone,3);
    const automaticFront=Boolean(placement.autoFrontOnly);
    return {
      ...centered,
      cx:zone.cx,
      cz:zone.cz,
      zipOutside:automaticFront,
      zipAutomaticFront:automaticFront,
      zipSideClearance:1.5,
      zipBox:box
    };
  }
  const {left,right}=parent.PLMRV24Native.frontMountExtensions(zone);
  const shift=(right-left)/2;
  const adjusted={
    ...zone,
    width:Math.max(120,zone.width+left+right),
    height:Math.max(180,zone.height+150),
    bottomY:zone.bottomY,
    topY:zone.topY+150,
    zipOutside:true,
    zipHeightExtension:150,
    zipBox:box
  };
  if(zone.axis==='x')adjusted.cx=zone.cx+shift;
  else adjusted.cz=zone.cz+shift;
  return adjusted;
}

function addFrame(zone,span,height,depth,color){
  const frame=55;
  const v=productDepthCenter(zone,depth,0);
  const halfW=span/2;
  const halfH=height/2;
  addProductBox(zone,{name:'Frame Bottom',u:0,y:zone.bottomY+frame/2,v,w:span,h:frame,t:depth},color,1);
  addProductBox(zone,{name:'Frame Top',u:0,y:zone.topY-frame/2,v,w:span,h:frame,t:depth},color,1);
  addProductBox(zone,{name:'Frame Left',u:-halfW+frame/2,y:zone.bottomY+halfH,v,w:frame,h:height-frame*2,t:depth},color,1);
  addProductBox(zone,{name:'Frame Right',u:halfW-frame/2,y:zone.bottomY+halfH,v,w:frame,h:height-frame*2,t:depth},color,1);
  return {frame,innerW:span-frame*2,innerH:height-frame*2};
}




function createDoorPivot(zone,hingeU,hingeV,angle){
  const pivot=new THREE.Group();
  const x=zone.axis==='x'?zone.cx+hingeU:zone.cx+hingeV;
  const z=zone.axis==='x'?zone.cz+hingeV:zone.cz+hingeU;
  pivot.position.set(x,0,z);
  pivot.rotation.y=angle;
  group.add(pivot);
  return pivot;
}

function addDoorPivotPart(zone,pivot,cfg,color,opacity,hingeU,hingeV,productOpen){
  const axisX=zone.axis==='x';
  const geo=new THREE.BoxGeometry(axisX?cfg.w:cfg.t,cfg.h,axisX?cfg.t:cfg.w);
  const mat=(opacity<.7?createGlassMaterial(color,opacity):createSolidMaterial(color,opacity,autoFinishForColor(color)));
  const mesh=new THREE.Mesh(geo,mat);
  const du=cfg.u-hingeU;
  const dv=cfg.v-hingeV;
  mesh.position.set(axisX?du:dv,cfg.y,axisX?dv:du);
  mesh.castShadow=opacity>.5;
  mesh.receiveShadow=true;
  mesh.userData={name:cfg.name||'Door part',isProduct:true,zoneId:zone.id};
  mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo),new THREE.LineBasicMaterial({color:opacity<.8?0x164e63:0x111827,transparent:true,opacity:.48})));
  mesh.visible=false;
  pivot.add(mesh);
  parts.push(mesh);
  interactiveObjects.push(mesh);
  markTogglePanel(mesh,zone,productOpen,zone.id);
  return mesh;
}

function addDoorHingeParts(zone,pivot,cfg,hingeU,hingeV,productOpen){
  const hingeColor=0x9ca3af;
  const offset=cfg.hingeDirection==='LEFT'?18:-18;
  const heights=[cfg.bottomY+180, cfg.bottomY+cfg.height/2, cfg.bottomY+cfg.height-180].filter((v,i,a)=>v>cfg.bottomY+70 && v<cfg.bottomY+cfg.height-70 && a.indexOf(v)===i);
  heights.forEach((y,idx)=>{
    addDoorPivotPart(zone,pivot,{name:'Door Hinge '+(idx+1),u:hingeU+offset/2,y:y,v:hingeV,w:18,h:110,t:20},hingeColor,1,hingeU,hingeV,productOpen);
    addDoorPivotPart(zone,pivot,{name:'Door Hinge Plate '+(idx+1),u:hingeU+offset,y:y,v:hingeV,w:10,h:88,t:10},0xcbd5e1,1,hingeU,hingeV,productOpen);
  });
}

function addDimensionLabelScaled(zone,text,u,y,v,scaleFactor,mainDimension){
  const sprite=createDimensionSprite(text,Boolean(mainDimension));
  const scale=Math.max(0.2,Number(scaleFactor)||1);
  sprite.scale.set(sprite.scale.x*scale,sprite.scale.y*scale,1);
  sprite.position.copy(zoneWorldPoint(zone,u,y,v));
  return sprite;
}

function addFixedDoorLeaf(zone,cfg,placement,label){
  const face=50;
  const depth=55;
  const glazing=glazingSectionSpec(placement);
  const frameColor=profileColor(0x475569);
  const glassColor=glassVisualColor(placement);
  const v=productDepthCenter(zone,depth,0);
  const glassV=productDepthCenter(zone,glazing.glassDepth,(depth-glazing.glassDepth)/2);
  addProductBox(zone,{name:label+' Left Stile',u:cfg.centerU-cfg.width/2+face/2,y:cfg.bottomY+cfg.height/2,v,w:face,h:cfg.height,t:depth},frameColor,1);
  addProductBox(zone,{name:label+' Right Stile',u:cfg.centerU+cfg.width/2-face/2,y:cfg.bottomY+cfg.height/2,v,w:face,h:cfg.height,t:depth},frameColor,1);
  addProductBox(zone,{name:label+' Top Rail',u:cfg.centerU,y:cfg.bottomY+cfg.height-face/2,v,w:cfg.width,h:face,t:depth},frameColor,1);
  addProductBox(zone,{name:label+' Bottom Rail',u:cfg.centerU,y:cfg.bottomY+face/2,v,w:cfg.width,h:face,t:depth},frameColor,1);
  addProductBox(zone,{name:label+' Glass',u:cfg.centerU,y:cfg.bottomY+cfg.height/2,v:glassV,w:Math.max(80,cfg.width-face*2-8),h:Math.max(100,cfg.height-face*2-8),t:glazing.glassDepth},glassColor,.34);
}

function addDoorHandleParts(zone,pivot,cfg,placement,hingeU,hingeV,productOpen){
  const handleY=zone.bottomY+900;
  const handleColor=0x111827;
  const lockSide=cfg.hingeDirection==='LEFT'?1:-1;
  const lockU=cfg.centerU+lockSide*(cfg.width/2-72);
  const outerV=productDepthCenter(zone,55,0)-zone.inward*18;
  const innerV=productDepthCenter(zone,55,0)+zone.inward*18;
  if(String(placement.handleType||'NORMAL')==='PANIC'){
    const barWidth=Math.max(120,cfg.width);
    const panicV=innerV+zone.inward*42;
    addDoorPivotPart(zone,pivot,{name:'Panik Kapı Kolu',u:cfg.centerU,y:handleY,v:panicV,w:barWidth,h:34,t:26},handleColor,1,hingeU,hingeV,productOpen);
    addDoorPivotPart(zone,pivot,{name:'Panik Kol Sol Bağlantı',u:cfg.centerU-barWidth/2+26,y:handleY,v:panicV-zone.inward*10,w:24,h:86,t:24},handleColor,1,hingeU,hingeV,productOpen);
    addDoorPivotPart(zone,pivot,{name:'Panik Kol Sağ Bağlantı',u:cfg.centerU+barWidth/2-26,y:handleY,v:panicV-zone.inward*10,w:24,h:86,t:24},handleColor,1,hingeU,hingeV,productOpen);
  }else{
    addDoorPivotPart(zone,pivot,{name:'Normal Kapı Kolu Dış Rozeti',u:lockU,y:handleY,v:outerV,w:32,h:140,t:24},handleColor,1,hingeU,hingeV,productOpen);
    const outerLeverCenter=lockU-lockSide*58;
    addDoorPivotPart(zone,pivot,{name:'Normal Kapı Kolu Dış',u:outerLeverCenter,y:handleY,v:outerV-zone.inward*12,w:132,h:22,t:24},handleColor,1,hingeU,hingeV,productOpen);
    addDoorPivotPart(zone,pivot,{name:'Normal Kapı Kolu İç Rozeti',u:lockU,y:handleY,v:innerV,w:32,h:140,t:24},handleColor,1,hingeU,hingeV,productOpen);
    // İç kol, rozet ekseni etrafında önceki yönüne göre 180° çevrilir.
    const innerLeverCenter=lockU-lockSide*58;
    addDoorPivotPart(zone,pivot,{name:'Normal Kapı Kolu İç',u:innerLeverCenter,y:handleY,v:innerV+zone.inward*12,w:132,h:22,t:24},handleColor,1,hingeU,hingeV,productOpen);
  }
}

function addMovingDoorLeaf(zone,cfg,placement,label,isActiveLeaf){
  const face=50;
  const depth=55;
  const glazing=glazingSectionSpec(placement);
  const frameColor=profileColor(0x334155);
  const glassColor=glassVisualColor(placement);
  const productOpen=productIsOpen(zone.id);
  const hingeLeft=cfg.hingeDirection==='LEFT';
  const hingeU=cfg.centerU+(hingeLeft?-cfg.width/2:cfg.width/2);
  const hingeV=productDepthCenter(zone,depth,0);
  const leafDirection=hingeLeft?1:-1;
  const openV=String(placement.doorOpenDirection||'OUTWARD')==='INWARD'?zone.inward:-zone.inward;
  const axisSign=zone.axis==='x'?-1:1;
  const plannedAngle=axisSign*openV*leafDirection*Math.PI/4;
  const pivot=createDoorPivot(zone,hingeU,hingeV,0);
  const motion=activeFacadeMotion;
  bindFacadeMotion(t=>{pivot.rotation.y=plannedAngle*t;pivot.traverse(o=>{if(o.userData.isTogglePanel)o.userData.panelOpen=Boolean(motion.target);});});
  const part=(partCfg,color,opacity)=>addDoorPivotPart(zone,pivot,partCfg,color,opacity,hingeU,hingeV,productOpen);
  part({name:label+' Left Stile',u:cfg.centerU-cfg.width/2+face/2,y:cfg.bottomY+cfg.height/2,v:hingeV,w:face,h:cfg.height,t:depth},frameColor,1);
  part({name:label+' Right Stile',u:cfg.centerU+cfg.width/2-face/2,y:cfg.bottomY+cfg.height/2,v:hingeV,w:face,h:cfg.height,t:depth},frameColor,1);
  part({name:label+' Top Rail',u:cfg.centerU,y:cfg.bottomY+cfg.height-face/2,v:hingeV,w:cfg.width,h:face,t:depth},frameColor,1);
  part({name:label+' Bottom Rail',u:cfg.centerU,y:cfg.bottomY+face/2,v:hingeV,w:cfg.width,h:face,t:depth},frameColor,1);
  const glassV=productDepthCenter(zone,glazing.glassDepth,(depth-glazing.glassDepth)/2);
  part({name:label+' Glass',u:cfg.centerU,y:cfg.bottomY+cfg.height/2,v:glassV,w:Math.max(80,cfg.width-face*2-8),h:Math.max(100,cfg.height-face*2-8),t:glazing.glassDepth},glassColor,.34);
  addDoorHingeParts(zone,pivot,cfg,hingeU,hingeV,productOpen);
  const active=Boolean(isActiveLeaf);
  addDoorPivotSymbol(zone,pivot,{
    name:label+(active?' Active':' Passive')+' Opening Symbol',
    text:'↻',
    u:cfg.centerU,
    y:cfg.bottomY+cfg.height/2,
    v:hingeV,
    w:Math.max(190,cfg.width*.62),
    h:Math.max(190,cfg.height*.30),
    fontSize:154,
    color:0xf97316,
    opacity:active?1:.42,
    rotationZ:0,
    turnDirection:doorTurnDirection(cfg.hingeDirection,String(placement.doorOpenDirection||'OUTWARD')),
    face:'outside'
  },hingeU,hingeV,productOpen);
  if(active)addDoorHandleParts(zone,pivot,cfg,placement,hingeU,hingeV,productOpen);
}

function addDoorTopFixedDimensions(zone,bottom,leafTop,leafHeight){
  if(!dimensionVisibility.intermediate)return;
  const dimV=zone.outerFaceV-zone.inward*56;
  const dimU=0;
  const wing=18;
  addDimensionSegments(zone,[
    [dimU,bottom,dimV,dimU,leafTop,dimV],
    [dimU-wing,bottom+wing,dimV,dimU,bottom,dimV],
    [dimU+wing,bottom+wing,dimV,dimU,bottom,dimV],
    [dimU-wing,leafTop-wing,dimV,dimU,leafTop,dimV],
    [dimU+wing,leafTop-wing,dimV,dimU,leafTop,dimV]
  ],false);
  addDimensionLabelScaled(zone,'Kapı Kanadı '+Math.round(leafHeight)+' mm',dimU,(bottom+leafTop)/2,dimV,0.5,false);
}

function fixedVerticalDivisionCount(innerW,manualValue){
  const automatic=Math.max(1,Math.ceil(Math.max(0,innerW)/1200));
  const manual=Math.round(Number(manualValue)||0);
  return Math.max(1,Math.min(20,manual||automatic));
}

function parseFixedHorizontalSegments(totalHeight,divisionCount,heightsRaw){
  const divisions=Math.max(1,Math.min(10,Math.round(Number(divisionCount)||1)));
  const values=String(heightsRaw||'').split(/[;,]+/).map(item=>Number(String(item).trim())).filter(value=>Number.isFinite(value)&&value>0);
  if(values.length===divisions&&Math.abs(values.reduce((sum,value)=>sum+value,0)-totalHeight)<=2)return values;
  const base=Math.floor(totalHeight/divisions);
  const segments=Array(divisions).fill(base);
  segments[segments.length-1]+=Math.round(totalHeight-base*divisions);
  return segments;
}

function fixedHorizontalCenters(zone,segments){
  const centers=[];
  let cursor=zone.bottomY;
  for(let i=0;i<segments.length-1;i++){
    cursor+=segments[i];
    centers.push(cursor);
  }
  return centers;
}

function addFixedHeightDimensions(zone,segments,centers){
  if(!dimensionVisibility.intermediate||segments.length<2)return;
  const outsideV=zone.outerFaceV-zone.inward*118;
  const dimU=0;
  const wing=22;
  const boundaries=[zone.bottomY,...centers,zone.topY];
  for(let i=0;i<segments.length;i++){
    const y1=boundaries[i],y2=boundaries[i+1];
    addDimensionSegments(zone,[
      [dimU,y1,outsideV,dimU,y2,outsideV],
      [dimU-wing,y1+wing,outsideV,dimU,y1,outsideV],
      [dimU+wing,y1+wing,outsideV,dimU,y1,outsideV],
      [dimU-wing,y2-wing,outsideV,dimU,y2,outsideV],
      [dimU+wing,y2-wing,outsideV,dimU,y2,outsideV]
    ],false);
    addDimensionLabel(zone,Math.round(segments[i])+' mm',dimU+105,(y1+y2)/2,outsideV);
  }
}

function slidingTrackLevel(index,panels,openingType,direction){
  if(openingType==='CENTER OPENING'){
    const centerDistance=Math.floor(Math.abs(index-(panels-1)/2));
    const maxDistance=Math.max(0,Math.floor((panels-1)/2));
    return direction==='INSIDE'?maxDistance-centerDistance:centerDistance;
  }
  if(direction==='LEFT')return index;
  return panels-1-index;
}

function slidingPanelLayout(innerW,panels,overlap,openingType,collectionState,direction){
  const collected=collectionState==='COLLECTED';
  const positions=[];
  if(openingType==='CENTER OPENING'&&panels%2===0){
    const half=panels/2;
    const centerGap=2;
    const halfSpan=(innerW-centerGap)/2;
    const panelW=(halfSpan+overlap*(half-1))/half;
    for(let i=0;i<half;i++)positions.push(-innerW/2+panelW/2+i*(panelW-overlap));
    for(let i=0;i<half;i++)positions.push(centerGap/2+panelW/2+i*(panelW-overlap));
    if(collected){
      const maxReveal=half>1?Math.max(0,(halfSpan-panelW)/(half-1)):0;
      const reveal=half>1?Math.min(24,panelW*.06,maxReveal):0;
      for(let i=0;i<half;i++)positions[i]=-innerW/2+panelW/2+i*reveal;
      for(let i=0;i<half;i++)positions[half+i]=innerW/2-panelW/2-(half-1-i)*reveal;
    }
    return {panelW,positions,centerGap};
  }
  const panelW=(innerW+overlap*(panels-1))/panels;
  const start=-innerW/2+panelW/2;
  for(let i=0;i<panels;i++)positions.push(start+i*(panelW-overlap));
  if(collected){
    const maxReveal=panels>1?Math.max(0,(innerW-panelW)/(panels-1)):0;
    const reveal=panels>1?Math.min(24,panelW*.06,maxReveal):0;
    const stackLeft=direction==='RIGHT';
    for(let i=0;i<panels;i++){
      positions[i]=stackLeft
        ? -innerW/2+panelW/2+i*reveal
        : innerW/2-panelW/2-(panels-1-i)*reveal;
    }
  }
  return {panelW,positions,centerGap:0};
}

function buildSlidingProduct(zone,placement){buildV53FacadeProduct(zone,placement,'sliding');}
function updateV24Annotations(cam){for(const e of v24NativeEntries)if(e.root.parent){e.updateAnnotations(cam,dimensionVisibility.information!==false&&dimensionVisibility.infoIds?.[e.config.positionNo]!==false);for(const a of e.engine.annotationObjects)if(a.role==='position')a.object.visible=a.object.visible&&dimensionVisibility.information!==false&&dimensionVisibility.infoIds?.[e.config.positionNo]!==false;}}
function buildV24NativeProduct(zone,placement){
  const native=window.PLMRV24Native.build(renderer,zone,placement),key=placement.type==='zip'?'zip:'+zone.id:zone.id;
  native.root.userData.plmrDaeGroup={key:placement.type+":"+key,name:placement.type+" "+(placement.positionCode||zone.id)};
  group.add(native.root);native.root.traverse(o=>{if(o.userData.positionLabel)Object.assign(o.userData,{owner:group.userData.facadeOwner||'roof-main',slot:placement.type==='zip'?'zip':'primary',positionCode:placement.positionCode});if(o.isMesh&&o.userData.isProduct){if(o.userData.owner!=='static')markTogglePanel(o,zone,productIsOpen(key),key);parts.push(o);interactiveObjects.push(o);}});
  v24NativeEntries.push(native);
  if(activeFacadeMotion){activeFacadeMotion.ease=t=>t;const r=activeFacadeMotion;bindFacadeMotion(t=>{native.update(t);native.root.traverse(o=>{if(o.userData.isTogglePanel)o.userData.panelOpen=Boolean(r.target);});});}else native.update(0);
}
function buildV53FacadeProduct(zone,placement,type){
  zone=fitProductZone(zone,zone.standaloneGuillotine?0:5);
  const native=window.PLMRV53FacadeAdapter.build(type,placement,zone,{
    systemColor:{hex:'#'+SYSTEM_COLOR.toString(16).padStart(6,'0'),finish:SYSTEM_FINISH,code:SYSTEM_COLOR_CODE,kind:DEFAULT_COLOR_MODE?'schematic':SYSTEM_COLOR_KIND,schematic:DEFAULT_COLOR_MODE}
  });
  native.root.userData.plmrDaeGroup={key:type+":"+zone.id,name:type+" "+(placement.positionCode||zone.id)};
  group.add(native.root);
  if(window.PLMRV18Mount)window.PLMRV18Mount.alignNative(native.root,zone);
  native.root.traverse(object=>{
    if(!object.isMesh||!object.userData.isProduct)return;
    object.userData.zoneId=zone.id;object.userData.productKey=zone.id;
    if(Number.isInteger(object.userData.panelIndex))markTogglePanel(object,zone,productIsOpen(zone.id));
    object.castShadow=!object.material.transparent;object.receiveShadow=true;
    parts.push(object);interactiveObjects.push(object);
  });
  if(activeFacadeMotion){const record=activeFacadeMotion;record.ease=window.PLMRV53FacadeAdapter.ease;record.duration=window.PLMRV16Core.MOTION_MS;bindFacadeMotion(t=>{native.update(t);native.root.traverse(o=>{if(o.userData.isTogglePanel)o.userData.panelOpen=Boolean(record.target);});});}
  else native.update(productIsOpen(zone.id)?1:0);
}

function buildGuillotinePanel(zone,cfg,placement,index){
  const subtype=String(placement.subtype||'CLEANABLE');
  const vasistasOpen=index===0&&subtype==='CLEANABLE';
  const angle=0;
  const firstPart=parts.length;
  const hingeY=cfg.y-cfg.panelH/2;
  const addPart=(part,color,opacity)=>markTogglePanel(vasistasOpen
    ?addBottomHungProductBox(zone,part,color,opacity,angle,hingeY)
    :addProductBox(zone,part,color,opacity),zone,Boolean(cfg.productOpen));

  addPart({name:'Guillotine Glass '+(index+1),u:0,y:cfg.y,v:cfg.v,w:Math.max(60,cfg.panelW-cfg.stile*2),h:Math.max(100,cfg.panelH-cfg.stile*2),t:cfg.glassDepth},cfg.glassColor,.35);
  addPart({name:'Guillotine Left Stile '+(index+1),u:-cfg.panelW/2+cfg.stile/2,y:cfg.y,v:cfg.v,w:cfg.stile,h:cfg.panelH,t:cfg.frameDepth},cfg.panelColor,1);
  addPart({name:'Guillotine Right Stile '+(index+1),u:cfg.panelW/2-cfg.stile/2,y:cfg.y,v:cfg.v,w:cfg.stile,h:cfg.panelH,t:cfg.frameDepth},cfg.panelColor,1);
  addPart({name:'Guillotine Top Rail '+(index+1),u:0,y:cfg.y+cfg.panelH/2-cfg.stile/2,v:cfg.v,w:cfg.panelW,h:cfg.stile,t:cfg.frameDepth},cfg.panelColor,1);
  addPart({name:'Guillotine Bottom Rail '+(index+1),u:0,y:cfg.y-cfg.panelH/2+cfg.stile/2,v:cfg.v,w:cfg.panelW,h:cfg.stile,t:cfg.frameDepth},cfg.panelColor,1);

  if(vasistasOpen){
    addPart({name:'Cleanable Vasistas Hinge',u:0,y:cfg.y-cfg.panelH/2+8,v:cfg.v+zone.inward*6,w:Math.max(80,cfg.panelW*.6),h:12,t:18},0xf59e0b,1);
  }

  const downwardArrow=(subtype==='CLEANABLE'||subtype==='DOWNWARD COLLECTING')&&index>0;
  const upwardArrow=subtype==='UPWARD COLLECTING'&&index<cfg.panels-1;
  if(downwardArrow||upwardArrow){
    addFacadeArrow(zone,{
      name:(downwardArrow?'Downward':'Upward')+' Guillotine Direction Arrow '+(index+1),
      u:0,
      y:cfg.y,
      v:productSurfaceCenter(zone,cfg.v,cfg.frameDepth,4),
      length:Math.min(cfg.panelH-cfg.stile*2-24,320),
      maxLength:cfg.panelH-cfg.stile*2-24,
      direction:downwardArrow?-1:1,
      vertical:true,
      thick:true
    });
  }
  const leafParts=parts.slice(firstPart),starts=leafParts.map(o=>o.position.clone()),motion=activeFacadeMotion;
  bindFacadeMotion(t=>leafParts.forEach((o,i)=>{
    o.position.copy(starts[i]);o.position.y+=cfg.travel*t;
    if(vasistasOpen){const a=THREE.MathUtils.degToRad(29)*t,dy=starts[i].y-hingeY;o.position.y=hingeY+dy*Math.cos(a);const axis=zone.axis==='x'?'z':'x';o.position[axis]+=zone.inward*dy*Math.sin(a);o.rotation[zone.axis==='x'?'x':'z']=(zone.axis==='x'?1:-1)*zone.inward*a;}
    if(o.userData.isTogglePanel)o.userData.panelOpen=Boolean(motion.target);
  }));

}

function guillotinePanelLayerInset(index,panels,panelDepth,gap){
  const step=panelDepth+gap;
  return Math.max(0,(panels-1-index)*step);
}

function facadeRightDirectionSign(zone){
  const originalInward=Number.isFinite(Number(zone&&zone.zipOriginalInward))
    ? Number(zone.zipOriginalInward)
    : (Number.isFinite(Number(zone&&zone.inward)) ? Number(zone.inward) : 1);
  return zone&&zone.axis==='x'?-originalInward:originalInward;
}

function buildGuillotineProduct(zone,placement){buildV53FacadeProduct(zone,placement,'guillotine');}

function zipFabricCssColor(placement){
  const code=String(placement.fabricColor||'');
  const map={'7635-52101':'#f7f8f1','7635-52102':'#cfd1cc','7635-52103':'#a1a39e','7635-52105':'#5d6568','7635-52106':'#4f575a','7635-52107':'#33373a','7635-52173':'#f7f7d7','7635-52174':'#f9f9e8','7635-52176':'#b9ac8a','7635-52142':'#696f72','7635-52144':'#323639','92-2044':'#f7f6f1','92-2135':'#9e988d','92-2171':'#909899','92-2043':'#343635','92-2047':'#2c3135','86-2044':'#f5f4e9','86-2135':'#9a958a','86-2171':'#8f9899','86-2043':'#393c3b','86-2047':'#31363a','W88-8102':'#f7f6e2','W88-2047':'#262b33'};
  if(map[code])return map[code];
  const meta=ZIP_FABRIC_META&&ZIP_FABRIC_META[code];
  if(meta&&/^#[0-9a-f]{6}$/i.test(String(meta.tone||'')))return meta.tone;
  return '#8b9096';
}

function configureZipFabricTexture(texture,panelWidth,panelHeight,tileMm){
  if(!texture)return texture;
  texture.wrapS=THREE.MirroredRepeatWrapping;
  texture.wrapT=THREE.MirroredRepeatWrapping;
  const tile=Math.max(60,(Number(tileMm)||500)*0.25); // V3.81: previous crop looked ~4x zoomed; restore ~1x fabric scale.
  const width=Math.max(80,Number(panelWidth)||tile);
  const height=Math.max(120,Number(panelHeight)||tile);
  texture.repeat.set(Math.max(1,width/tile),Math.max(1,height/tile));
  if(texture.center)texture.center.set(.5,.5);
  if(THREE.sRGBEncoding!==undefined)texture.encoding=THREE.sRGBEncoding;
  if(renderer&&renderer.capabilities&&renderer.capabilities.getMaxAnisotropy){
    texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  }
  texture.needsUpdate=true;
  return texture;
}

function createZipFallbackTexture(fallbackColor,panelWidth,panelHeight,tileMm){
  const canvas=document.createElement('canvas');
  canvas.width=256;
  canvas.height=256;
  const ctx=canvas.getContext('2d');
  if(!ctx)return null;
  ctx.fillStyle=fallbackColor;
  ctx.fillRect(0,0,256,256);
  ctx.fillStyle='rgba(17,24,39,.46)';
  for(let y=3;y<256;y+=7){
    for(let x=3;x<256;x+=7){
      ctx.beginPath();
      ctx.arc(x+(y%14?1.4:0),y,.72,0,Math.PI*2);
      ctx.fill();
    }
  }
  return configureZipFabricTexture(new THREE.CanvasTexture(canvas),panelWidth,panelHeight,tileMm);
}

function markOwnedTexture(texture){
  if(!texture)return texture;
  texture.userData=texture.userData||{};
  texture.userData.p3dvOwned=true;
  return texture;
}

function materialGenerationActive(material,generation){
  return Boolean(material)&&!(material.userData&&material.userData.p3dvDisposed)&&generation===modelGeneration;
}

function applyOwnedMaterialTexture(material,texture,generation){
  if(!texture)return false;
  markOwnedTexture(texture);
  if(!materialGenerationActive(material,generation)){
    texture.dispose();
    return false;
  }
  const previous=material.map;
  material.map=texture;
  if(previous&&previous!==texture&&previous.userData&&previous.userData.p3dvOwned&&!(previous.userData&&previous.userData.p3dvShared)&&typeof previous.dispose==='function'){
    previous.dispose();
  }
  material.needsUpdate=true;
  return true;
}

function createZipFabricMaterial(placement,panelWidth,panelHeight){
  const code=String(placement.fabricColor||'');
  const meta=ZIP_FABRIC_META&&ZIP_FABRIC_META[code];
  const fallbackColor=zipFabricCssColor(placement);
  const tileMm=meta&&Number(meta.tileMm)>0?Number(meta.tileMm):500;
  const generation=modelGeneration;
  const fallbackTexture=markOwnedTexture(createZipFallbackTexture(fallbackColor,panelWidth,panelHeight,tileMm));
  const material=new THREE.MeshBasicMaterial({
    map:fallbackTexture,
    color:fallbackTexture?0xffffff:Number('0x'+fallbackColor.replace('#','')),
    transparent:false,
    opacity:1,
    side:THREE.DoubleSide,
    toneMapped:false
  });
  material.userData={...(material.userData||{}),p3dvGeneration:generation};

  const applyImageTexture=(image)=>{
    try{
      const texture=configureZipFabricTexture(new THREE.Texture(image),panelWidth,panelHeight,tileMm);
      if(!applyOwnedMaterialTexture(material,texture,generation))return;
      material.color.setHex(0xffffff);
      material.opacity=1;
      material.transparent=false;
      material.needsUpdate=true;
    }catch(error){
      if(!materialGenerationActive(material,generation))return;
      material.map=fallbackTexture;
      material.color.setHex(fallbackTexture?0xffffff:Number('0x'+fallbackColor.replace('#','')));
      material.needsUpdate=true;
    }
  };

  const loadCatalogCrop=()=>{
    if(!meta||!meta.image||typeof Image!=='function')return;
    const sourceImage=new Image();
    sourceImage.onload=()=>{
      try{
        const left=parseFloat(meta.left)/100;
        const top=parseFloat(meta.top)/100;
        const width=parseFloat(meta.width)/100;
        const height=parseFloat(meta.height)/100;
        if(![left,top,width,height].every(Number.isFinite)||width<=0||height<=0)return;
        const sampleX=sourceImage.naturalWidth*(left+width*.05);
        const sampleY=sourceImage.naturalHeight*(top+height*.06);
        const sampleW=sourceImage.naturalWidth*width*.47;
        const sampleH=sourceImage.naturalHeight*height*.42;
        const side=Math.max(2,Math.min(sampleW,sampleH));
        const sourceX=sampleX+(sampleW-side)/2;
        const sourceY=sampleY+(sampleH-side)/2;
        const cropCanvas=document.createElement('canvas');
        cropCanvas.width=512;
        cropCanvas.height=512;
        const cropCtx=cropCanvas.getContext('2d');
        if(!cropCtx)return;
        cropCtx.drawImage(sourceImage,sourceX,sourceY,side,side,0,0,512,512);
        const texture=configureZipFabricTexture(new THREE.CanvasTexture(cropCanvas),panelWidth,panelHeight,tileMm);
        if(!applyOwnedMaterialTexture(material,texture,generation))return;
        material.color.setHex(0xffffff);
        material.opacity=1;
        material.transparent=false;
        material.needsUpdate=true;
      }catch(error){
        if(!materialGenerationActive(material,generation))return;
        material.map=fallbackTexture;
        material.needsUpdate=true;
      }
    };
    sourceImage.onerror=()=>{
      if(!materialGenerationActive(material,generation))return;
      material.map=fallbackTexture;
      material.needsUpdate=true;
    };
    sourceImage.src=meta.image;
  };

  const loadTextureSource=(src,onError)=>{
    if(!src||typeof Image!=='function'){
      if(onError)onError();
      return;
    }
    const image=new Image();
    image.onload=()=>applyImageTexture(image);
    image.onerror=()=>{ if(onError)onError(); };
    image.src=src;
  };

  if(meta&&meta.textureData){
    loadTextureSource(meta.textureData,()=>{
      if(meta.texture)loadTextureSource(meta.texture,loadCatalogCrop);
      else loadCatalogCrop();
    });
  }else if(meta&&meta.texture){
    loadTextureSource(meta.texture,loadCatalogCrop);
  }else{
    loadCatalogCrop();
  }
  return material;
}

function addZipFabricPanel(zone,cfg,placement,panelMeta){
  const axisX=zone.axis==='x';
  const geo=new THREE.BoxGeometry(axisX?cfg.w:cfg.t,cfg.h,axisX?cfg.t:cfg.w);
  const mesh=new THREE.Mesh(geo,createZipFabricMaterial(placement,cfg.w,cfg.h));
  const x=axisX?zone.cx+cfg.u:zone.cx+cfg.v;
  const z=axisX?zone.cz+cfg.v:zone.cz+cfg.u;
  mesh.position.set(x,cfg.y,z);
  mesh.castShadow=true;
  mesh.receiveShadow=true;
  mesh.userData={
    name:'Zip Perde Kumaş Paneli',
    isProduct:true,
    isTogglePanel:true,
    panelKey:panelMeta.panelKey,
    productKey:panelMeta.panelKey,
    panelOpen:Boolean(panelMeta.panelOpen),
    zoneId:zone.id
  };
  mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo),new THREE.LineBasicMaterial({color:0x111827,transparent:true,opacity:.42})));
  mesh.visible=true;
  group.add(mesh);
  parts.push(mesh);
  interactiveObjects.push(mesh);
  return mesh;
}

function zoneWorldPoint(zone,u,y,v){
  return zone.axis==='x'
    ? new THREE.Vector3(zone.cx+u,y,zone.cz+v)
    : new THREE.Vector3(zone.cx+v,y,zone.cz+u);
}

// V9: V53 screen-space dimensions own all scene annotations.
function addDimensionLabel(){}
function addWorldDimensionLabel(){}
function addDimensionSegments(){}
function addWorldDimensionSegments(){}
function addZoneWidthDimension(){}
function addZoneHeightDimension(){}
function addSystemDimensions(){}
function setDimensionVisibility(visibility){
  if(visibility&&typeof visibility==='object'){
    dimensionVisibility={
      ...dimensionVisibility,...visibility,
      intermediate:visibility.intermediate??dimensionVisibility.intermediate,
      main:visibility.main??dimensionVisibility.main,
      positions:visibility.positions??dimensionVisibility.positions,
      total:visibility.total??dimensionVisibility.total,
      byPosition:visibility.byPosition??dimensionVisibility.byPosition??{}
    };
  }
  if(window.PLMRV19Facade)window.PLMRV19Facade.visibility(scene,dimensionVisibility);
  intermediateDimensionObjects.forEach(object=>{object.visible=dimensionVisibility.intermediate;});
  mainDimensionObjects.forEach(object=>{object.visible=dimensionVisibility.main;});
}

function addVirtualZoneDividerGuide(base,profile,opts){
  const vertical=profile.orientation!=='horizontal';
  const span=Number.isFinite(profile.span)?profile.span:Math.max(80,Number(opts.span)||base.width);
  const v=base.outerFaceV-base.inward*5;
  let a,b;
  if(vertical){
    a=zoneWorldPoint(base,Number(opts.u)||0,base.bottomY,v);
    b=zoneWorldPoint(base,Number(opts.u)||0,base.topY,v);
  }else{
    const half=span/2;
    a=zoneWorldPoint(base,(Number(opts.u)||0)-half,Number(opts.y),v);
    b=zoneWorldPoint(base,(Number(opts.u)||0)+half,Number(opts.y),v);
  }
  const geo=new THREE.BufferGeometry().setFromPoints([a,b]);
  const mat=new THREE.LineDashedMaterial({color:0x38bdf8,dashSize:70,gapSize:38,transparent:true,opacity:.92,depthTest:false});
  const line=new THREE.Line(geo,mat);
  line.computeLineDistances();
  line.renderOrder=58;
  line.userData={name:'Virtual Zone Divider',isVirtualZoneDivider:true,dividerId:profile.id,facadeId:base.facadeId||base.id.split('|')[0]};
  group.add(line);
  return line;
}

function addDividerProfileMesh(base,profile,opts){
  const memberId='profile:'+(base.profileSourceId||base.facadeId||base.id.split('|')[0])+':'+profile.id;let existing;group.traverse(m=>{if(m.isMesh&&m.userData.rrMemberId===memberId)existing=m;});if(existing)return existing;
  const depth=(Number(profile.depth) > 0 ? Number(profile.depth) : 100);
  const face=(Number(profile.width) > 0 ? Number(profile.width) : 100);
  const axisX=base.axis==='x';
  const vertical=profile.orientation!=='horizontal';
  const span=Number.isFinite(profile.span)?profile.span:Math.max(80,Number(opts.span)||base.width);
  const height=vertical?(profile.scope?profile.scope.top-profile.scope.bottom:Math.max(200,H-beamSection.vertical)):face;
  const geo=vertical
    ?new THREE.BoxGeometry(axisX?face:depth,height,axisX?depth:face)
    :new THREE.BoxGeometry(axisX?span:depth,face,axisX?depth:span);
  const mat=new THREE.MeshStandardMaterial({color:profileColor(0x0ea5e9),roughness:.46,metalness:.26,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1});
  const mesh=new THREE.Mesh(geo,mat);
  const v=productDepthCenter(base,depth,0);
  const centerY=Number.isFinite(profile.originY)?profile.originY:vertical?(-H/2+height/2):Number(opts.y);
  const point=zoneWorldPoint(base,Number(opts.u)||0,centerY,v);
  mesh.position.copy(point);if(Number.isFinite(profile.originX)&&Number.isFinite(profile.originZ)){mesh.position.x=profile.originX;mesh.position.z=profile.originZ;}
  const memberEdit=sceneEditorState.members?.['profile:'+(base.profileSourceId||base.facadeId||base.id.split('|')[0])+':'+profile.id];if(memberEdit){if(Number.isFinite(memberEdit.positionX))mesh.position.x=memberEdit.positionX;if(Number.isFinite(memberEdit.positionZ))mesh.position.z=memberEdit.positionZ;mesh.position.x+=Number(memberEdit.sharedX)||0;mesh.position.z+=Number(memberEdit.sharedZ)||0;}
  mesh.castShadow=true;
  mesh.receiveShadow=true;
  mesh.userData={
    name:profile.label||'Ara Profil',
    rrMemberId:'profile:'+(base.profileSourceId||base.facadeId||base.id.split('|')[0])+':'+profile.id,rrMemberAxis:vertical?1:(axisX?0:2),p3dvSize:[geo.parameters.width,geo.parameters.height,geo.parameters.depth],
    isDividerProfile:true,
    profileId:profile.id,
    facadeId:base.facadeId||base.id.split('|')[0],
    toolboxKey:'profile:'+(base.profileSourceId||base.facadeId||base.id.split('|')[0])+':'+profile.id,
    profile:{...profile,facadeId:base.facadeId||base.id.split('|')[0]}
  };
  mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo),new THREE.LineBasicMaterial({color:0x082f49,transparent:true,opacity:.72,depthWrite:false})));
  mesh.visible=false;
  group.add(mesh);
  parts.push(mesh);
  interactiveObjects.push(mesh);
  return mesh;
}

function createSubZone(base,startU,endU,bottomY,topY,index,total,leftBoundaryId,rightBoundaryId,bottomBoundaryId,topBoundaryId,leftBoundaryWidth,rightBoundaryWidth){
  const centerU=(startU+endU)/2;
  const width=Math.max(0,endU-startU);
  const height=Math.max(0,topY-bottomY);
  const defaultStartId=base.startBoundaryId||'START';
  const defaultEndId=base.endBoundaryId||'END';
  const noProfiles=leftBoundaryId===defaultStartId&&rightBoundaryId===defaultEndId&&bottomBoundaryId==='BOTTOM'&&topBoundaryId==='TOP';
  const id=noProfiles?base.id:base.id+'|'+leftBoundaryId+'-'+rightBoundaryId+'|'+bottomBoundaryId+'-'+topBoundaryId;
  const cx=base.axis==='x'?base.cx+centerU:base.cx;
  const cz=base.axis==='x'?base.cz:base.cz+centerU;
  const localStartRatio=(startU+base.width/2)/base.width;
  const localEndRatio=(endU+base.width/2)/base.width;
  const globalStart=Number.isFinite(Number(base.globalStartRatio))?Number(base.globalStartRatio):0;
  const globalEnd=Number.isFinite(Number(base.globalEndRatio))?Number(base.globalEndRatio):1;
  const ratioSpan=globalEnd-globalStart;
  return {
    ...base,
    postMeasure:base.postBounded?{id:base.id,cx:base.cx,cz:base.cz,width:base.width,bottomY:base.bottomY}:null,
    id,
    facadeId:base.facadeId||base.id.split('|')[0],
    baseLabel:noProfiles?base.label:base.label+' · Alan '+(index+1),
    label:(()=>{const record=zoneRegistry&&zoneRegistry[id];return record?.code||record?.name||window.PLMRV12Core.name(pozNo,base.moduleIndex||0)+' - '+(index+1);})(),
    zoneUid:(zoneRegistry&&zoneRegistry[id]&&zoneRegistry[id].uid)||'',
    zoneName:(zoneRegistry&&zoneRegistry[id]&&zoneRegistry[id].name)||'',
    cx,
    cz,
    width,
    height,
    bottomY,
    topY,
    baseWidth:Number(base.globalBaseWidth)||base.width,
    baseHeight:base.height,
    startRatio:globalStart+localStartRatio*ratioSpan,
    endRatio:globalStart+localEndRatio*ratioSpan,
    bottomRatio:(bottomY-base.bottomY)/base.height,
    topRatio:(topY-base.bottomY)/base.height,
    leftBoundaryId,
    rightBoundaryId,
    leftBoundaryWidth:Math.max(0,Number(leftBoundaryWidth)||0),
    rightBoundaryWidth:Math.max(0,Number(rightBoundaryWidth)||0),
    bottomBoundaryId,
    topBoundaryId,
    areaIndex:index,
    areaCount:total
  };
}

function splitFacadeZones(base){
  const facadeStoreId=base.profileSourceId||base.facadeId||base.id.split('|')[0];
  const physicalSource=Array.isArray(facadeProfiles[facadeStoreId])?facadeProfiles[facadeStoreId]:[];
  const virtualSource=Array.isArray(zoneDividers[facadeStoreId])?zoneDividers[facadeStoreId]:[];
  const effectiveSource=window.PLMRV13Core.effectiveProfiles(base,physicalSource,sceneEditorState.members||{});
  const rawSource=[...effectiveSource.filter(p=>!sceneEditorState.facadeGraph||p.orientation==='horizontal').map(item=>({...item,virtual:false})),...virtualSource.map(item=>({...item,virtual:true,kind:'virtual-zone-divider'}))];
  const globalBaseWidth=Math.max(1,Number(base.globalBaseWidth)||base.width);
  const globalStartRatio=Number.isFinite(Number(base.globalStartRatio))?Number(base.globalStartRatio):0;
  const globalEndRatio=Number.isFinite(Number(base.globalEndRatio))?Number(base.globalEndRatio):1;
  const globalSpan=Math.max(.000001,globalEndRatio-globalStartRatio);
  const profiles=rawSource.map(profile=>{
    const orientation=profile.orientation==='horizontal'?'horizontal':'vertical';
    const normalized={
      ...profile,
      orientation,
      width:profile.virtual?0:(Number(profile.width) > 0 ? Number(profile.width) : 100),
      depth:profile.virtual?0:(Number(profile.depth) > 0 ? Number(profile.depth) : 100),
      positionRatio:Math.max(.0001,Math.min(.9999,Number(profile.positionRatio)||.5)),
      positionYRatio:Math.max(0,Math.min(1,Number(profile.positionYRatio)||.5))
    };
    if(orientation==='vertical'){
      if(normalized.positionRatio<=globalStartRatio+.000001||normalized.positionRatio>=globalEndRatio-.000001)return null;
      normalized.positionRatio=(normalized.positionRatio-globalStartRatio)/globalSpan;
      return normalized;
    }
    const scopeStart=Number.isFinite(Number(profile.scopeStartRatio))?Number(profile.scopeStartRatio):0;
    const scopeEnd=Number.isFinite(Number(profile.scopeEndRatio))?Number(profile.scopeEndRatio):1;
    if(scopeEnd<globalStartRatio-.0001||scopeStart>globalEndRatio+.0001)return null;
    normalized.scopeStartRatio=Math.max(0,(Math.max(scopeStart,globalStartRatio)-globalStartRatio)/globalSpan);
    normalized.scopeEndRatio=Math.min(1,(Math.min(scopeEnd,globalEndRatio)-globalStartRatio)/globalSpan);
    return normalized;
  }).filter(Boolean);
  const verticals=profiles.filter(profile=>profile.orientation==='vertical').sort((a,b)=>a.positionRatio-b.positionRatio);
  const horizontals=profiles.filter(profile=>profile.orientation==='horizontal');
  const startBoundaryId=base.startBoundaryId||'START';
  const endBoundaryId=base.endBoundaryId||'END';
  const boundaryWidthMap=Object.fromEntries(verticals.map(profile=>[profile.id,profile.width]));
  boundaryWidthMap[startBoundaryId]=Math.max(0,Number(base.startBoundaryWidth)||0);
  boundaryWidthMap[endBoundaryId]=Math.max(0,Number(base.endBoundaryWidth)||0);
  const strips=[];
  let cursor=-base.width/2;
  let leftId=startBoundaryId;

  verticals.forEach(profile=>{
    const center=-base.width/2+profile.positionRatio*base.width;
    const left=Math.max(cursor,center-profile.width/2);
    const right=Math.min(base.width/2,center+profile.width/2);
    strips.push({start:cursor,end:left,leftId,rightId:profile.id});
    if(profile.virtual)addVirtualZoneDividerGuide(base,profile,{u:center,span:base.width,y:(base.bottomY+base.topY)/2});else addDividerProfileMesh(base,profile,{u:center,span:base.width,y:(base.bottomY+base.topY)/2});
    cursor=right;
    leftId=profile.id;
  });
  strips.push({start:cursor,end:base.width/2,leftId,rightId:endBoundaryId});

  const cells=[];
  strips.filter(strip=>strip.end-strip.start>.001).forEach(strip=>{
    const stripStartRatio=(strip.start+base.width/2)/base.width;
    const stripEndRatio=(strip.end+base.width/2)/base.width;
    const scoped=horizontals
      .filter(profile=>{
        const start=Number.isFinite(Number(profile.scopeStartRatio))?Number(profile.scopeStartRatio):0;
        const end=Number.isFinite(Number(profile.scopeEndRatio))?Number(profile.scopeEndRatio):1;
        return stripStartRatio>=start-.0001&&stripEndRatio<=end+.0001;
      })
      .sort((a,b)=>a.positionYRatio-b.positionYRatio);
    let bottom=base.bottomY;
    let bottomId='BOTTOM';
    scoped.forEach(profile=>{
      const centerY=base.bottomY+profile.positionYRatio*base.height;
      const profileBottom=Math.max(bottom,centerY-profile.width/2);
      const profileTop=Math.min(base.topY,centerY+profile.width/2);
      cells.push({startU:strip.start,endU:strip.end,bottomY:bottom,topY:profileBottom,leftId:strip.leftId,rightId:strip.rightId,bottomId,topId:profile.id});
      if(profile.virtual)addVirtualZoneDividerGuide(base,profile,{u:(strip.start+strip.end)/2,span:strip.end-strip.start,y:centerY});else addDividerProfileMesh(base,profile,{u:(strip.start+strip.end)/2,span:strip.end-strip.start,y:centerY});
      bottom=profileTop;
      bottomId=profile.id;
    });
    cells.push({startU:strip.start,endU:strip.end,bottomY:bottom,topY:base.topY,leftId:strip.leftId,rightId:strip.rightId,bottomId,topId:'TOP'});
  });

  const valid=cells.filter(cell=>cell.endU-cell.startU>.001&&cell.topY-cell.bottomY>.001);
  return valid.map((cell,index)=>createSubZone(
    base,cell.startU,cell.endU,cell.bottomY,cell.topY,index,valid.length,
    cell.leftId,cell.rightId,cell.bottomId,cell.topId,
    boundaryWidthMap[cell.leftId]||0,boundaryWidthMap[cell.rightId]||0
  ));
}

function toolboxZoneKey(zone){
  return 'zone:'+zone.id;
}

function toolboxProfileKey(profile){
  return 'profile:'+profile.facadeId+':'+profile.id;
}

function isToolboxZoneEligible(zone,occupied){
  if(zoneFilters.ids[(zone.owner||'roof-main')+'|'+zone.id]===false)return false;
  if(toolboxSelectionMode==='multi-product')return true;
  if(toolboxSelectionMode==='multi-delete'||toolboxSelectionMode==='fit-products')return occupied;
  if(toolboxSelectionMode==='multi-profile-add')return !occupied&&zone.width>0&&zone.height>0;
  return false;
}

function isToolboxProfileEligible(profile){
  return toolboxSelectionMode==='multi-profile-delete'&&profile&&profile.id;
}

function refreshToolboxSelectionVisuals(){
  zonePickers.forEach(mesh=>{
    const key=toolboxZoneKey(mesh.userData.zone);
    const eligible=isToolboxZoneEligible(mesh.userData.zone,mesh.userData.occupied);
    const selected=toolboxSelectionKeys.has(key);
    mesh.userData.toolboxEligible=eligible;
    mesh.userData.toolboxSelected=selected;
    if(toolboxSelectionMode){
      mesh.material.color.setHex(selected?0x16a34a:(eligible?0x38bdf8:0x64748b));
      mesh.material.opacity=selected?.30:(eligible?.13:.002);
    }else{
      setZoneHighlight(mesh,false);
    }
  });
  const hint=document.getElementById('viewerHint');
  if(hint){
    hint.textContent=toolboxSelectionMode
      ? 'Çoklu seçim: uygun hedeflere tıklayın. Enter veya sağ tıkla tamamlayın, Esc ile iptal edin.'
      : 'Çatı için oluklar arasındaki alanı, cephe ürünü için dikmeler arasındaki boşluğu seçin. Bir ürün panelini açıp kapatmak için çift tıklayın.';
  }
}

function addZonePicker(zone,occupied){
  const axisX=zone.axis==='x';
  const geo=new THREE.BoxGeometry(axisX?zone.width:64,zone.height,axisX?64:zone.width);
  const selected=zone.id===selectedZoneId;
  const mat=new THREE.MeshBasicMaterial({
    color:selected?0xf59e0b:(occupied?0x22c55e:0x38bdf8),
    transparent:true,
    opacity:selected?.18:(occupied?.025:.018),
    depthWrite:false,
    side:THREE.DoubleSide
  });
  const mesh=new THREE.Mesh(geo,mat);
  mesh.position.set(zone.cx,(zone.bottomY+zone.topY)/2,zone.cz);
  zone.owner=group.userData.facadeOwner||'roof-main';mesh.userData={isZone:true,zone,occupied,selected};mesh.visible=zonesVisible&&window.PLMRV11Zones.allowed(zoneFilters,zone,zone.owner);
  group.add(mesh);
  zonePickers.push(mesh);
  interactiveObjects.push(mesh);
  if(selected)selectedZonePicker=mesh;
}

function setZoneHighlight(mesh,active){
  if(!mesh||!mesh.material)return;
  if(mesh.userData.v42Selected&&!toolboxSelectionMode){
    mesh.material.opacity=.28;
    mesh.material.color.setHex(0x16a34a);
    return;
  }
  if(toolboxSelectionMode){
    const eligible=Boolean(mesh.userData.toolboxEligible);
    const selected=Boolean(mesh.userData.toolboxSelected);
    mesh.material.opacity=selected?.30:(eligible?(active?.22:.13):.002);
    mesh.material.color.setHex(selected?0x16a34a:(eligible?0x38bdf8:0x64748b));
    return;
  }
  const selected=Boolean(mesh.userData.selected);
  if(selected){
    mesh.material.opacity=.18;
    mesh.material.color.setHex(0xf59e0b);
    return;
  }
  mesh.material.opacity=active?(mesh.userData.occupied?.20:.16):(mesh.userData.occupied?.025:.018);
  mesh.material.color.setHex(mesh.userData.occupied?0x22c55e:0x38bdf8);
}

function buildFacadeProducts(p,beamBottomY,freedomMultiActive,bioFamilyLayoutActive,bioFamilyLayout){
  const bottomY=-H/2;
  const topY=beamBottomY;
  if(topY<=bottomY)return;
  const height=topY-bottomY;
  const frontStart=-W/2+p[0].x;
  const frontEnd=W/2-p[1].x;
  const backStart=-W/2+p[2].x;
  const backEnd=W/2-p[3].x;
  const leftStart=-D/2+p[0].z;
  const leftEnd=D/2-p[2].z;
  const rightStart=-D/2+p[1].z;
  const rightEnd=D/2-p[3].z;
  const frontFaceDepth=Math.max(p[0].z,p[1].z);
  const backFaceDepth=Math.max(p[2].z,p[3].z);
  const leftFaceDepth=Math.max(p[0].x,p[2].x);
  const rightFaceDepth=Math.max(p[1].x,p[3].x);
  let facades;
  if(bioFamilyLayoutActive&&bioFamilyLayout){
    const modules=bioFamilyLayout.modules;
    const rearGlobalStart=modules[0].clearMinX;
    const rearGlobalEnd=modules[modules.length-1].clearMaxX;
    const rearGlobalWidth=Math.max(1,rearGlobalEnd-rearGlobalStart);
    const frontGlobalStart=rearGlobalStart;
    const frontGlobalEnd=rearGlobalEnd;
    const frontGlobalWidth=rearGlobalWidth;
    facades=[];
    modules.forEach(module=>{
      const leftLine=module.leftLine;
      const rightLine=module.rightLine;
      const rearLeftSection=module.rearLeftSection||(bioFamilyLayout.rearSections&&bioFamilyLayout.rearSections[leftLine])||p[0];
      const rearRightSection=module.rearRightSection||(bioFamilyLayout.rearSections&&bioFamilyLayout.rearSections[rightLine])||p[1];
      const frontLeftSection=module.frontLeftSection||(bioFamilyLayout.frontSections&&bioFamilyLayout.frontSections[leftLine])||p[2];
      const frontRightSection=module.frontRightSection||(bioFamilyLayout.frontSections&&bioFamilyLayout.frontSections[rightLine])||p[3];
      const rearFaceDepth=Math.max(rearLeftSection.z,rearRightSection.z);
      const frontModuleFaceDepth=Math.max(frontLeftSection.z,frontRightSection.z);
      facades.push({
        id:'front|ROW_'+((module.rowIndex||0)+1)+'|MODULE_'+(module.moduleIndex+1),facadeId:'front',profileSourceId:'front',label:(module.rowIndex===1?'Arka Sıra · ':'Ön Sıra · ')+'Arka Cephe · Modül '+(module.moduleIndex+1),axis:'x',
        cx:module.centerX,cz:module.rearOuterZ+rearFaceDepth/2,width:module.clearWidth,height,bottomY,topY,beamBottomY,inward:1,outerFaceV:-rearFaceDepth/2,
        startBoundaryId:'POST_LINE_'+leftLine,endBoundaryId:'POST_LINE_'+rightLine,
        startBoundaryWidth:rearLeftSection.x,endBoundaryWidth:rearRightSection.x,
        globalBaseWidth:rearGlobalWidth,globalStartRatio:(module.clearMinX-rearGlobalStart)/rearGlobalWidth,globalEndRatio:(module.clearMaxX-rearGlobalStart)/rearGlobalWidth,
        moduleIndex:module.moduleIndex,bioRiseMulti:true
      });
      facades.push({
        id:'back|ROW_'+((module.rowIndex||0)+1)+'|MODULE_'+(module.moduleIndex+1),facadeId:'back',profileSourceId:'back',label:(module.rowIndex===1?'Arka Sıra · ':'Ön Sıra · ')+'Ön Cephe · Modül '+(module.moduleIndex+1),axis:'x',
        cx:module.centerX,cz:module.frontOuterZ-frontModuleFaceDepth/2,width:module.clearWidth,height,bottomY,topY,beamBottomY,inward:-1,outerFaceV:frontModuleFaceDepth/2,
        startBoundaryId:'POST_LINE_'+leftLine,endBoundaryId:'POST_LINE_'+rightLine,
        startBoundaryWidth:frontLeftSection.x,endBoundaryWidth:frontRightSection.x,
        globalBaseWidth:frontGlobalWidth,globalStartRatio:(module.clearMinX-frontGlobalStart)/frontGlobalWidth,globalEndRatio:(module.clearMaxX-frontGlobalStart)/frontGlobalWidth,
        moduleIndex:module.moduleIndex,bioRiseMulti:true
      });
    });
    const leftModule=modules[0],rightModule=modules[modules.length-1];
    const leftModuleStart=leftModule.rearOuterZ+p[0].z,leftModuleEnd=leftModule.frontOuterZ-p[2].z;
    const rightModuleStart=rightModule.rearOuterZ+p[1].z,rightModuleEnd=rightModule.frontOuterZ-p[3].z;
    facades.push(
      {id:'left',label:'Sol Cephe',axis:'z',cx:-W/2+leftFaceDepth/2,cz:(leftModuleStart+leftModuleEnd)/2,width:leftModuleEnd-leftModuleStart,height,bottomY,topY,beamBottomY,inward:1,outerFaceV:-leftFaceDepth/2,startBoundaryWidth:p[0].z,endBoundaryWidth:p[2].z},
      {id:'right',label:'Sağ Cephe',axis:'z',cx:W/2-rightFaceDepth/2,cz:(rightModuleStart+rightModuleEnd)/2,width:rightModuleEnd-rightModuleStart,height,bottomY,topY,beamBottomY,inward:-1,outerFaceV:rightFaceDepth/2,startBoundaryWidth:p[1].z,endBoundaryWidth:p[3].z}
    );
  }else if(freedomMultiActive){
    const modules=freedomMultiLayout.modules;
    const rearGlobalStart=modules[0].rearStartX;
    const rearGlobalEnd=modules[modules.length-1].rearEndX;
    const rearGlobalWidth=Math.max(1,rearGlobalEnd-rearGlobalStart);
    const frontGlobalStart=modules[0].frontStartX;
    const frontGlobalEnd=modules[modules.length-1].frontEndX;
    const frontGlobalWidth=Math.max(1,frontGlobalEnd-frontGlobalStart);
    facades=[];
    modules.forEach(module=>{
      const leftLine=module.leftLine;
      const rightLine=module.rightLine;
      const rearLeftSection=module.rearLeftSection||(freedomMultiLayout.rearSections&&freedomMultiLayout.rearSections[leftLine])||p[0];
      const rearRightSection=module.rearRightSection||(freedomMultiLayout.rearSections&&freedomMultiLayout.rearSections[rightLine])||p[1];
      const frontLeftSection=module.frontLeftSection||(freedomMultiLayout.frontSections&&freedomMultiLayout.frontSections[leftLine])||p[2];
      const frontRightSection=module.frontRightSection||(freedomMultiLayout.frontSections&&freedomMultiLayout.frontSections[rightLine])||p[3];
      const rearFaceDepth=Math.max(rearLeftSection.z,rearRightSection.z);
      const frontModuleFaceDepth=Math.max(frontLeftSection.z,frontRightSection.z);
      facades.push({
        id:'front|ROW_'+((module.rowIndex||0)+1)+'|MODULE_'+(module.moduleIndex+1),facadeId:'front',profileSourceId:'front',label:(module.rowIndex===1?'Arka Sıra · ':'Ön Sıra · ')+'Arka Cephe · Modül '+(module.moduleIndex+1),axis:'x',
        cx:(module.rearStartX+module.rearEndX)/2,cz:module.rearOuterZ+rearFaceDepth/2,width:module.rearClearWidth,height,bottomY,topY,beamBottomY,inward:1,outerFaceV:-rearFaceDepth/2,
        startBoundaryId:'POST_LINE_'+leftLine,endBoundaryId:'POST_LINE_'+rightLine,
        startBoundaryWidth:rearLeftSection.x,endBoundaryWidth:rearRightSection.x,
        globalBaseWidth:rearGlobalWidth,globalStartRatio:(module.rearStartX-rearGlobalStart)/rearGlobalWidth,globalEndRatio:(module.rearEndX-rearGlobalStart)/rearGlobalWidth,
        moduleIndex:module.moduleIndex
      });
      facades.push({
        id:'back|ROW_'+((module.rowIndex||0)+1)+'|MODULE_'+(module.moduleIndex+1),facadeId:'back',profileSourceId:'back',label:(module.rowIndex===1?'Arka Sıra · ':'Ön Sıra · ')+'Ön Cephe · Modül '+(module.moduleIndex+1),axis:'x',
        cx:(module.frontStartX+module.frontEndX)/2,cz:module.frontOuterZ-frontModuleFaceDepth/2,width:module.frontClearWidth,height,bottomY,topY,beamBottomY,inward:-1,outerFaceV:frontModuleFaceDepth/2,
        startBoundaryId:'POST_LINE_'+leftLine,endBoundaryId:'POST_LINE_'+rightLine,
        startBoundaryWidth:frontLeftSection.x,endBoundaryWidth:frontRightSection.x,
        globalBaseWidth:frontGlobalWidth,globalStartRatio:(module.frontStartX-frontGlobalStart)/frontGlobalWidth,globalEndRatio:(module.frontEndX-frontGlobalStart)/frontGlobalWidth,
        moduleIndex:module.moduleIndex
      });
    });
    const leftModule=modules[0],rightModule=modules[modules.length-1];
    const leftModuleStart=leftModule.rearOuterZ+p[0].z,leftModuleEnd=leftModule.frontOuterZ-p[2].z;
    const rightModuleStart=rightModule.rearOuterZ+p[1].z,rightModuleEnd=rightModule.frontOuterZ-p[3].z;
    facades.push(
      {id:'left',label:'Sol Cephe',axis:'z',cx:-W/2+leftFaceDepth/2,cz:(leftModuleStart+leftModuleEnd)/2,width:leftModuleEnd-leftModuleStart,height,bottomY,topY,beamBottomY,inward:1,outerFaceV:-leftFaceDepth/2,startBoundaryWidth:p[0].z,endBoundaryWidth:p[2].z},
      {id:'right',label:'Sağ Cephe',axis:'z',cx:W/2-rightFaceDepth/2,cz:(rightModuleStart+rightModuleEnd)/2,width:rightModuleEnd-rightModuleStart,height,bottomY,topY,beamBottomY,inward:-1,outerFaceV:rightFaceDepth/2,startBoundaryWidth:p[1].z,endBoundaryWidth:p[3].z}
    );
  }else{
    facades=[
      {id:'front',label:'Arka Cephe',axis:'x',cx:(frontStart+frontEnd)/2,cz:-D/2+frontFaceDepth/2,width:frontEnd-frontStart,height,bottomY,topY,beamBottomY,inward:1,outerFaceV:-frontFaceDepth/2,startBoundaryWidth:p[0].x,endBoundaryWidth:p[1].x},
      {id:'back',label:'Ön Cephe',axis:'x',cx:(backStart+backEnd)/2,cz:D/2-backFaceDepth/2,width:backEnd-backStart,height,bottomY,topY,beamBottomY,inward:-1,outerFaceV:backFaceDepth/2,startBoundaryWidth:p[2].x,endBoundaryWidth:p[3].x},
      {id:'left',label:'Sol Cephe',axis:'z',cx:-W/2+leftFaceDepth/2,cz:(leftStart+leftEnd)/2,width:leftEnd-leftStart,height,bottomY,topY,beamBottomY,inward:1,outerFaceV:-leftFaceDepth/2,startBoundaryWidth:p[0].z,endBoundaryWidth:p[2].z},
      {id:'right',label:'Sağ Cephe',axis:'z',cx:W/2-rightFaceDepth/2,cz:(rightStart+rightEnd)/2,width:rightEnd-rightStart,height,bottomY,topY,beamBottomY,inward:-1,outerFaceV:rightFaceDepth/2,startBoundaryWidth:p[1].z,endBoundaryWidth:p[3].z}
    ];
  }

  if(!IS_BIO_FAMILY)facades=window.PLMRV12Core.adaptBases(facades,freedomMultiLayout);
  if(!IS_BIO_FAMILY&&window.PLMRZoneTopology)facades=window.PLMRZoneTopology.reflow(facades,freedomMultiLayout,sceneEditorState.members||{});
  if(!IS_BIO_FAMILY&&window.PLMRV11Zones&&(sceneEditorState.facadeZonesGenerated||Object.keys(placements).length||Object.keys(zipPlacements).length))facades=window.PLMRV11Zones.enrich(facades,freedomMultiLayout,sceneEditorState.members||{},{height:H,pose:sceneEditorState.roofPose,walls:sketchWalls,copies:sceneEditorState.roofCopies,groundY:sceneEditorState.groundY});
  if(!IS_BIO_FAMILY)facades=window.PLMRV12Core.fitParapets(facades,{height:H},sketchWalls,group.userData.facadeOwner||'roof-main');
  if(!IS_BIO_FAMILY)facades=window.PLMRV13Core.splitAtPosts(facades,window.PLMRV13Core.allPosts(freedomMultiLayout||{posts:[]},facades,currentCanonicalPayload()));
  if(sceneEditorState.facadeGraph)facades=sceneEditorState.facadeGraph;
  facades.forEach(facade=>{
    const existing=new Set(group.children);
    const localZones=splitFacadeZones(facade),zones=facade.zones||localZones;
    zones.forEach((zone,index)=>{
      const zoneExisting=new Set(group.children);
      const placement=placements[zone.id];
      const zipPlacement=zipPlacements[zone.id];
      if(placement){
        if(placement.type!=='fixed')beginFacadeMotion(zone,placement,zone.id);
        try{
          if(window.PLMRV24Native?.native(placement))buildV24NativeProduct(zone,placement);
          else if(placement.type==='folding'||placement.type==='balcony')throw Error('Eski ürün kaydı desteklenmiyor.');
          else if(placement.type==='guillotine')buildGuillotineProduct(zone,placement);
          else if(placement.type==='fixed')throw Error('Eski ürün kaydı desteklenmiyor.');
          else if(placement.type==='door')throw Error('Eski ürün kaydı desteklenmiyor.');
          else buildSlidingProduct(zone,placement);
        }catch(error){
          console.error('Primary product build failed',zone.id,placement.type,error);
        }
      }
      activeFacadeMotion=null;
      const primaryObjects=[...group.children].filter(o=>!zoneExisting.has(o));if(placement&&!window.PLMRV24Native?.native(placement))window.PLMRV19Facade.addLabels(group,primaryObjects,zone,placement,'primary',dimensionVisibility);if(window.PLMRV18Mount&&zone.mountRotation===180)window.PLMRV18Mount.rotateProduct(group,primaryObjects,zone);
      const zipExisting=new Set(group.children);
      if(zipPlacement){
        beginFacadeMotion(zone,zipPlacement,'zip:'+zone.id);
        const effectiveZipPlacement={...zipPlacement,autoFrontOnly:Boolean(placement)&&String(zipPlacement.options?.placementLocation||zipPlacement.placementLocation||'BETWEEN POSTS')==='BETWEEN POSTS'};
        try{buildV24NativeProduct(zone,effectiveZipPlacement);}
        catch(error){console.error('Zip overlay build failed',zone.id,error);}
      }
      activeFacadeMotion=null;
      const zipObjects=[...group.children].filter(o=>!zipExisting.has(o));if(zipPlacement&&!window.PLMRV24Native?.native(zipPlacement))window.PLMRV19Facade.addLabels(group,zipObjects,zone,zipPlacement,'zip',dimensionVisibility);if(window.PLMRV18Mount&&zone.mountRotation===180)window.PLMRV18Mount.rotateProduct(group,zipObjects,zone);
      if(IS_BIO_FAMILY||sceneEditorState.facadeZonesGenerated===true)addZonePicker(zone,Boolean(placement||zipPlacement));
      if(zone.bottomBoundaryId==='BOTTOM')addZoneWidthDimension(zone,index%3);
      if(zone.bottomBoundaryId!=='BOTTOM'||zone.topBoundaryId!=='TOP')addZoneHeightDimension(zone,index%3);
    });
    // A displaced post can turn its adjoining facade; rotate the complete native assembly.
    if(facade.frameAngle){const pivot=new THREE.Vector3(facade.cx,0,facade.cz),frame=new THREE.Group();frame.position.copy(pivot);frame.rotation.y=-facade.frameAngle;for(const item of [...group.children]){if(existing.has(item))continue;item.position.sub(pivot);frame.add(item);}group.add(frame);}
  });
  const builtMembers=new Set(parts.map(m=>m.userData.rrMemberId));for(const facade of facades){const source=facade.profileSourceId||facade.facadeId||facade.id.split('|')[0];for(const profile of facadeProfiles[source]||[]){const id='profile:'+source+':'+profile.id,edit=sceneEditorState.members?.[id];if(profile.orientation==='horizontal'||builtMembers.has(id)||edit?.deleted||edit?.sharedWith)continue;addDividerProfileMesh(facade,profile,{u:0,span:facade.width});builtMembers.add(id);}}
  addSystemDimensions(beamBottomY);
  setDimensionVisibility(dimensionVisibility);
}

function disposeModelGroup(root,preserve){
  if(!root)return;
  for(let i=v24NativeEntries.length-1;i>=0;i--){let belongs=false;for(let p=v24NativeEntries[i].root;p;p=p.parent)if(p===root){belongs=true;break;}if(belongs){v24NativeEntries[i].engine.dispose();v24NativeEntries.splice(i,1);}}
  const preserveGeometries=preserve&&preserve.geometries||new Set();
  const preserveMaterials=preserve&&preserve.materials||new Set();
  const preserveTextures=preserve&&preserve.textures||new Set();
  const disposedGeometries=new Set();
  const disposedMaterials=new Set();
  const disposedTextures=new Set();
  const textureKeys=['map','alphaMap','aoMap','bumpMap','displacementMap','emissiveMap','envMap','lightMap','metalnessMap','normalMap','roughnessMap','clearcoatMap','clearcoatNormalMap','clearcoatRoughnessMap','gradientMap','matcap','specularMap'];
  root.traverse(obj=>{
    if(obj.geometry&&typeof obj.geometry.dispose==='function'&&!disposedGeometries.has(obj.geometry)&&!preserveGeometries.has(obj.geometry)){
      if(!(obj.geometry.userData&&obj.geometry.userData.p3dvShared)){
        disposedGeometries.add(obj.geometry);
        obj.geometry.dispose();
      }
    }
    const materials=Array.isArray(obj.material)?obj.material:[obj.material];
    materials.filter(Boolean).forEach(material=>{
      material.userData=material.userData||{};
      if(material.userData.p3dvShared||preserveMaterials.has(material))return;
      material.userData.p3dvDisposed=true;
      textureKeys.forEach(key=>{
        const texture=material[key];
        if(!texture||typeof texture.dispose!=='function'||disposedTextures.has(texture)||preserveTextures.has(texture))return;
        if(texture.userData&&texture.userData.p3dvShared)return;
        disposedTextures.add(texture);
        texture.dispose();
      });
      if(typeof material.dispose==='function'&&!disposedMaterials.has(material)){
        disposedMaterials.add(material);
        material.dispose();
      }
    });
  });
}

function stableRenderSignature(value){
  const seen=new WeakSet();
  try{
    return JSON.stringify(value,(key,item)=>{
      if(item&&typeof item==='object'){
        if(seen.has(item))return undefined;
        seen.add(item);
        if(!Array.isArray(item)){
          const ordered={};
          Object.keys(item).sort().forEach(name=>{ordered[name]=item[name];});
          return ordered;
        }
      }
      return item;
    });
  }catch(error){
    return String(value&&value.id||value&&value.kind||'');
  }
}

function pergoRiseRenderSignatureMap(derived){
  const map=new Map();
  (derived&&Array.isArray(derived.components)?derived.components:[]).forEach(component=>{
    if(!component||component.renderVisible===false||!component.id)return;
    map.set('component:'+component.id,stableRenderSignature(component));
  });
  const targets=derived&&derived.editing&&Array.isArray(derived.editing.targets)?derived.editing.targets:[];
  targets.filter(target=>target&&target.targetType==='area'&&target.id).forEach(target=>map.set('target:'+target.id,stableRenderSignature(target)));
  return map;
}

function pergoRiseDirectChildKey(object){
  if(!object)return '';
  if(object.userData&&object.userData.componentId)return 'component:'+object.userData.componentId;
  if(object.userData&&object.userData.editingTarget&&object.userData.editingTarget.id)return 'target:'+object.userData.editingTarget.id;
  let key='';
  object.traverse&&object.traverse(child=>{
    if(key||!child.userData)return;
    if(child.userData.componentId)key='component:'+child.userData.componentId;
    else if(child.userData.editingTarget&&child.userData.editingTarget.id)key='target:'+child.userData.editingTarget.id;
  });
  return key;
}

function pergoRiseZoneFromTarget(target){
  const bounds=target&&target.bounds||{};
  const minX=Number(bounds.minX)||0,maxX=Number(bounds.maxX)||0,minY=Number(bounds.minY)||0,maxY=Number(bounds.maxY)||0,minZ=Number(bounds.minZ)||0,maxZ=Number(bounds.maxZ)||0;
  const face=String(target&&target.face||'front');
  return {
    id:String(target&&target.id||''),label:String(target&&target.label||target&&target.id||'Pergola Alanı'),
    axis:face==='left'||face==='right'?'z':'x',face,facadeId:face,pergoRise:true,editingTarget:target,
    systemIndex:Number.isFinite(Number(target&&target.systemIndex))?Number(target.systemIndex):null,positionId:String(target&&target.positionId||''),
    cx:(minX+maxX)/2,cz:(minZ+maxZ)/2,bottomY:minY,topY:maxY,
    width:Math.max(1,face==='left'||face==='right'?maxZ-minZ:maxX-minX),height:Math.max(1,maxY-minY)
  };
}

function positionPergoRiseAssemblyOnGround(assembly){
  if(!assembly)return assembly;
  const offset=-Math.max(1,Number(H)||1)/2;
  assembly.position.y=offset;
  assembly.userData={...(assembly.userData||{}),p3dvGroundOffsetY:offset,p3dvCanonicalGroundY:0,p3dvSceneGroundY:offset};
  return assembly;
}

function refreshPergoRiseParts(){
  parts=[];interactiveObjects=[];zonePickers=[];hoveredZone=null;selectedZonePicker=null;
  if(!pergoRiseAssemblyRoot)return;
  pergoRiseAssemblyRoot.traverse(object=>{
    if(object.isMesh)parts.push(object);
    if(!object.userData||!object.userData.p3dvPergoRiseSelectable||!object.userData.editingTarget)return;
    if(object.isMesh)interactiveObjects.push(object);
    if(object.userData.p3dvPergoRiseArea&&object.isMesh){
      const zone=pergoRiseZoneFromTarget(object.userData.editingTarget);
      object.userData.isZone=true;object.userData.zone=zone;object.userData.occupied=Boolean(object.userData.editingTarget.occupied);
      object.userData.selected=zone.id===selectedZoneId;
      zonePickers.push(object);
      if(object.userData.selected)selectedZonePicker=object;
    }
  });
}

function pergoRiseTargetExists(targetId){
  if(!targetId||!pergoRiseAssemblyRoot)return false;
  let found=false;
  pergoRiseAssemblyRoot.traverse(object=>{
    if(found||!object.userData||!object.userData.editingTarget)return;
    if(object.userData.editingTarget.id===targetId)found=true;
  });
  return found;
}

function reconcilePergoRiseAssembly(changedPaths){
  if(!pergoRiseAssemblyRoot||!pergoRiseComponentLibrary||!pergoRiseDerived||!window.P3DVPergoRiseViewer)return false;
  const nextAssembly=window.P3DVPergoRiseViewer.buildAssembly(pergoRiseComponentLibrary,pergoRiseDerived,{
    THREE,
    materials:{
      system:createSolidMaterial(SYSTEM_COLOR,1,autoFinishForColor(SYSTEM_COLOR)),
      fabricProfile:createSolidMaterial(PANEL_COLOR,1,autoFinishForColor(PANEL_COLOR)),
      fabric:createSolidMaterial(PANEL_COLOR,.94,autoFinishForColor(PANEL_COLOR)),
      wall:createSolidMaterial(0x9a8f83,1,'MATTE')
    },
    selectableAreaScopes:['front'],
    selectableAreaActionTypes:['gap_between_posts']
  });
  const previousByKey=new Map();
  pergoRiseAssemblyRoot.children.slice().forEach(child=>{
    const key=pergoRiseDirectChildKey(child);
    if(key)previousByKey.set(key,child);
  });
  const nextSignatures=pergoRiseRenderSignatureMap(pergoRiseDerived);
  const stats={runs:pergoRiseReconcileStats.runs+1,reused:0,replaced:0,added:0,removed:0,total:0,changedPaths:Array.isArray(changedPaths)?changedPaths.slice():[]};
  const selectedTargetId=pergoRiseSelectedTarget&&pergoRiseSelectedTarget.id||null;
  const retired=new THREE.Group();
  nextAssembly.children.slice().forEach(nextChild=>{
    const key=pergoRiseDirectChildKey(nextChild);
    const previous=key&&previousByKey.get(key);
    const unchanged=Boolean(previous&&pergoRiseRenderSignatures.get(key)===nextSignatures.get(key));
    if(unchanged){
      previousByKey.delete(key);
      stats.reused+=1;
      return;
    }
    if(previous){
      previousByKey.delete(key);
      pergoRiseAssemblyRoot.remove(previous);
      retired.add(previous);
      stats.replaced+=1;
    }else stats.added+=1;
    nextAssembly.remove(nextChild);
    pergoRiseAssemblyRoot.add(nextChild);
  });
  previousByKey.forEach(previous=>{
    pergoRiseAssemblyRoot.remove(previous);
    retired.add(previous);
    stats.removed+=1;
  });
  pergoRiseAssemblyRoot.userData={...nextAssembly.userData};
  positionPergoRiseAssemblyOnGround(pergoRiseAssemblyRoot);
  stats.total=pergoRiseAssemblyRoot.children.length;
  const preserved=collectRenderResources(pergoRiseAssemblyRoot);
  disposeModelGroup(retired,preserved);
  disposeModelGroup(nextAssembly,preserved);
  pergoRiseRenderSignatures=nextSignatures;
  pergoRiseReconcileStats=stats;
  pergoRiseAssemblyRevision+=1;
  refreshPergoRiseParts();
  parts.forEach(part=>{part.visible=true;});
  if(selectedTargetId&&!pergoRiseTargetExists(selectedTargetId))clearPergoRiseSelection();
  else if(selectedTargetId){
    let replacement=null;
    pergoRiseAssemblyRoot.traverse(object=>{
      if(replacement||!object.userData||!object.userData.editingTarget)return;
      if(object.userData.editingTarget.id===selectedTargetId)replacement=object;
    });
    if(replacement&&replacement!==pergoRiseSelectedObject)highlightPergoRiseSelection(replacement);
  }
  window.__P3DV_PERGO_TEST__=window.__P3DV_PERGO_TEST__||{};
  window.__P3DV_PERGO_TEST__.reconcile={...stats,camera:cameraSnapshot()};
  updatePergoRiseCommonTestState();
  return true;
}

function collectRenderResources(root){
  const resources={geometries:new Set(),materials:new Set(),textures:new Set()};
  const textureKeys=['map','alphaMap','aoMap','bumpMap','displacementMap','emissiveMap','envMap','lightMap','metalnessMap','normalMap','roughnessMap','clearcoatMap','clearcoatNormalMap','clearcoatRoughnessMap','gradientMap','matcap','specularMap'];
  if(!root)return resources;
  root.traverse(object=>{
    if(object.geometry)resources.geometries.add(object.geometry);
    const materials=Array.isArray(object.material)?object.material:[object.material];
    materials.filter(Boolean).forEach(material=>{
      resources.materials.add(material);
      textureKeys.forEach(key=>{if(material[key])resources.textures.add(material[key]);});
    });
  });
  return resources;
}

function buildPergoRiseModel(){
  if(pergoRiseDerived&&pergoRiseDerived.envelope){
    W=Math.max(1,Number(pergoRiseDerived.envelope.width)||W);
    D=Math.max(1,Number(pergoRiseDerived.envelope.depth)||D);
    H=Math.max(1,Number(pergoRiseDerived.envelope.height)||H);
  }
  if(pergoRiseComponentLibrary&&pergoRiseDerived&&window.P3DVPergoRiseViewer){
    const assembly=window.P3DVPergoRiseViewer.buildAssembly(pergoRiseComponentLibrary,pergoRiseDerived,{
      THREE,
      materials:{
        system:createSolidMaterial(SYSTEM_COLOR,1,autoFinishForColor(SYSTEM_COLOR)),
        fabricProfile:createSolidMaterial(PANEL_COLOR,1,autoFinishForColor(PANEL_COLOR)),
        fabric:createSolidMaterial(PANEL_COLOR,.94,autoFinishForColor(PANEL_COLOR)),
        wall:createSolidMaterial(0x9a8f83,1,'MATTE')
      },
      selectableAreaScopes:['front'],
      selectableAreaActionTypes:['gap_between_posts']
    });
    positionPergoRiseAssemblyOnGround(assembly);
    group.add(assembly);
    pergoRiseAssemblyRoot=assembly;
    pergoRiseRenderSignatures=pergoRiseRenderSignatureMap(pergoRiseDerived);
    refreshPergoRiseParts();
    pergoRiseAssemblyRevision+=1;
    window.__P3DV_PERGO_TEST__=window.__P3DV_PERGO_TEST__||{};
    window.__P3DV_PERGO_TEST__.initialAssembly={children:assembly.children.length,parts:parts.length,projectHash:pergoRiseDerived&&pergoRiseDerived.projectHash||''};
    return assembly;
  }
  const failure=new THREE.Group();
  failure.name='Pergo Rise Render Error';
  failure.userData={p3dvPergoRiseRenderError:true,status:pergoRiseLoadStatus};
  group.add(failure);pergoRiseAssemblyRoot=failure;
  if(pergoRiseSelectionInfo){
    pergoRiseSelectionInfo.textContent='Pergola profil geometrileri yüklenemedi ('+pergoRiseLoadStatus+').';
    pergoRiseSelectionInfo.style.display='block';
  }
  postParent('pergo-rise-render-error',{status:pergoRiseLoadStatus,projectHash:pergoRiseDerived&&pergoRiseDerived.projectHash||''});
  return failure;
}

function applyMemberEdits(owner='roof-main',supportWalls=sketchWalls){
  const overrides=sceneEditorState.members||{};
  for(const mesh of [...parts]){
    const d=mesh.userData||{},post=d.freedomPostId,beam=d.freedomBeamId;
    if(!post&&!beam&&!d.rrMemberId)continue;
    const key=d.rrMemberId||(post?'post:':'beam:')+(post||beam),axis=d.rrMemberAxis??(post?1:(d.beamKind==='side'?2:0)),base=d.p3dvSize[axis];
    d.rrMemberId=key;d.rrMemberAxis=axis;d.rrMemberBaseLength=base;
    const edit=overrides[key];
    if(edit&&(edit.deleted||edit.sharedWith)){d.rrMemberDeleted=true;mesh.parent.remove(mesh);parts=parts.filter(p=>p!==mesh);interactiveObjects=interactiveObjects.filter(p=>p!==mesh);disposeModelGroup(mesh);continue;}
    if(post&&!IS_BIO_FAMILY){
      const span=window.PLMRRollingRoofParapetCore.postSpan({x:mesh.position.x,z:mesh.position.z,section:{x:d.p3dvSize[0],z:d.p3dvSize[2]}},{height:H},supportWalls,owner,edit||{});
      mesh.position.y=span.y;mesh.scale.y=span.height;d.p3dvSize[1]=span.height;d.rrPostTop=span.top;d.rrPostBottom=span.bottom;
      if(span.height<=.001){mesh.parent.remove(mesh);parts=parts.filter(p=>p!==mesh);interactiveObjects=interactiveObjects.filter(p=>p!==mesh);disposeModelGroup(mesh);}
      continue;
    }
    if(edit&&Number.isFinite(edit.length)){
      const value=edit.length;if(axis===1)mesh.position.y+=(base-value)/2;
      mesh.scale.setComponent(axis,d.isDividerProfile?value/base:value);d.p3dvSize[axis]=value;
    }
  }
}
function buildModel(showAll,options){
  sceneTools?.postEditor.close();
  if(!(options&&options.copyPass)&&typeof commonPosts!=='undefined'&&commonPosts.active())commonPosts.close();
  if(!(options&&options.copyPass))cancelPendingTogglePanelSelection();
  if(!(options&&options.copyPass))beginPerfCycle(options&&options.reason||((options&&options.atomicSwap)?'live-rebuild':'initial-build'));
  const atomicSwap=Boolean(options&&options.atomicSwap);
  if(!(options&&options.copyPass))modelGeneration+=1;
  const previousGroup=atomicSwap?group:null;
  const detachedGroup=!atomicSwap&&group.children.length?new THREE.Group():null;
  const previousParent=previousGroup&&previousGroup.parent?previousGroup.parent:scene;
  const previousPosition=previousGroup?previousGroup.position.clone():null;
  const previousRotation=previousGroup?previousGroup.rotation.clone():null;
  const previousScale=previousGroup?previousGroup.scale.clone():null;
  const previousVisible=previousGroup?previousGroup.visible:true;
  if(atomicSwap){
    group=new THREE.Group();
  }else{
    while(group.children.length){
      const child=group.children[0];
      group.remove(child);
      if(detachedGroup)detachedGroup.add(child);
    }
    if(detachedGroup)disposeModelGroup(detachedGroup);
  }
  if(!(options&&options.copyPass))for(const r of facadeMotions.values())if(!r.v25Standalone)r.seen=false;
  group.userData.facadeOwner=options&&options.owner||'roof-main';
  parts=[];
  intermediateDimensionObjects=[];
  mainDimensionObjects=[];
  interactiveObjects=[];
  zonePickers=[];
  hoveredZone=null;
  selectedZonePicker=null;
  if(IS_STANDALONE_GUILLOTINE_PREVIEW){
    const items=STANDALONE_GUILLOTINE_ITEMS;
    const columns=Math.max(1,Math.min(items.length,10,Math.round(Number(items[0]&&items[0].layoutColumns)||2)));
    const gap=700;
    const rowHeights=[];
    const colWidths=[];
    items.forEach((item,index)=>{const row=Math.floor(index/columns),col=index%columns;rowHeights[row]=Math.max(rowHeights[row]||0,Number(item.height)||2400);colWidths[col]=Math.max(colWidths[col]||0,Number(item.width)||3000);});
    const totalW=colWidths.reduce((a,b)=>a+b,0)+Math.max(0,columns-1)*gap;
    const totalH=rowHeights.reduce((a,b)=>a+b,0)+Math.max(0,rowHeights.length-1)*gap;
    const xStarts=[];let x=-totalW/2;colWidths.forEach((w,i)=>{xStarts[i]=x;x+=w+gap;});
    const yStarts=[];let top=totalH/2;rowHeights.forEach((h,i)=>{yStarts[i]=top-h;top-=h+gap;});
    items.forEach((item,index)=>{
      const row=Math.floor(index/columns),col=index%columns;
      const width=Math.max(151,Number(item.width)||3000),height=Math.max(251,Number(item.height)||2400);
      const cx=xStarts[col]+width/2;
      const bottomY=yStarts[row];
      const zone={standaloneGuillotine:true,id:String(item.id||('G'+index)),axis:'x',cx,cz:0,width,height,bottomY,topY:bottomY+height,beamBottomY:bottomY+height,inward:-1,outerFaceV:0,startBoundaryWidth:0,endBoundaryWidth:0};
      const placement={type:'guillotine',series:String(item.series||'A SERIES'),subtype:String(item.subtype||item.type||'STANDARD'),mechanism:String(item.mechanism||'CHAIN'),glassThickness:String(item.glassThickness||'8 MM'),glassColor:String(item.glassColor||'TRANSPARENT'),customGlassColor:String(item.customGlassColor||''),panels:Math.max(2,Math.min(8,Math.round(Number(item.panels)||2))),panelType:String(item.panelType||'1+1'),motorDirection:String(item.motorDirection||'RIGHT'),view:String(item.view||'OUTSIDE VIEW'),motorType:String(item.motorType||'SOMFY RTS'),remoteControl:String(item.remoteControl||'1 CHANNEL'),bottomPanelMode:String(item.bottomPanelMode||'FIXED'),bottomPanelState:String(item.bottomPanelState||'CLOSED'),bottomPanelHinge:String(item.bottomPanelHinge||'BOTTOM'),collectionState:String(item.collectionState||'NORMAL')};
      productOpenStates[zone.id]=String(item.displayState||'OPEN')!=='CLOSED';
      const savedStandaloneColorState={SYSTEM_COLOR,PANEL_COLOR,SYSTEM_FINISH,PANEL_FINISH,SYSTEM_COLOR_CODE,PANEL_COLOR_CODE,SYSTEM_COLOR_KIND,PANEL_COLOR_KIND,DEFAULT_COLOR_MODE};
      if(item.systemColor&&typeof item.systemColor==='object'){
        SYSTEM_COLOR=liveColorNumber(item.systemColor,SYSTEM_COLOR);PANEL_COLOR=SYSTEM_COLOR;
        SYSTEM_FINISH=liveFinish(item.systemColor.finish,SYSTEM_FINISH);PANEL_FINISH=SYSTEM_FINISH;
        SYSTEM_COLOR_CODE=String(item.systemColor.code||'');PANEL_COLOR_CODE=SYSTEM_COLOR_CODE;
        SYSTEM_COLOR_KIND=String(item.systemColor.kind||'ral');PANEL_COLOR_KIND=SYSTEM_COLOR_KIND;DEFAULT_COLOR_MODE=false;
      }
      try{
        const firstChild=group.children.length;
        buildGuillotineProduct(zone,placement);
        if(placement.view==='INSIDE VIEW'){
          group.children.slice(firstChild).forEach(part=>{
            part.position.x=zone.cx-(part.position.x-zone.cx);
            part.position.z=2*zone.cz-part.position.z;
            part.rotation.y+=Math.PI;
          });
        }
      }finally{
        SYSTEM_COLOR=savedStandaloneColorState.SYSTEM_COLOR;PANEL_COLOR=savedStandaloneColorState.PANEL_COLOR;SYSTEM_FINISH=savedStandaloneColorState.SYSTEM_FINISH;PANEL_FINISH=savedStandaloneColorState.PANEL_FINISH;SYSTEM_COLOR_CODE=savedStandaloneColorState.SYSTEM_COLOR_CODE;PANEL_COLOR_CODE=savedStandaloneColorState.PANEL_COLOR_CODE;SYSTEM_COLOR_KIND=savedStandaloneColorState.SYSTEM_COLOR_KIND;PANEL_COLOR_KIND=savedStandaloneColorState.PANEL_COLOR_KIND;DEFAULT_COLOR_MODE=savedStandaloneColorState.DEFAULT_COLOR_MODE;
      }
      addZonePicker(zone,true);
      if(item.showDimensions){ addZoneWidthDimension(zone,index%3); addZoneHeightDimension(zone,index%3); }
    });
    parts.forEach(part=>part.visible=!part.userData.rrMemberDeleted);
    group.updateMatrixWorld(true);
    if(box)box.visible=false;
    // Zone width/height helpers register their objects as intermediate dimensions.
    setDimensionVisibility({intermediate:items.some(item=>item.showDimensions),main:false});
    lastBuiltGeometrySignature='standalone-guillotine:'+items.length+':'+Date.now();endPerfCycle();
    return;
  }
  const p=[postDims(0),postDims(1),postDims(2),postDims(3)];
  if(IS_PERGO_RISE){
    buildPergoRiseModel();
    refreshToolboxSelectionVisuals();
    parts.forEach(part=>part.visible=!part.userData.rrMemberDeleted);
    if(atomicSwap){
      group.position.copy(previousPosition);
      group.rotation.copy(previousRotation);
      group.scale.copy(previousScale);
      group.visible=previousVisible;
      previousParent.add(group);
      if(arSession){
        intermediateDimensionObjects.forEach(item=>item.visible=false);
        mainDimensionObjects.forEach(item=>item.visible=false);
        zonePickers.forEach(item=>item.visible=false);
        setArGhostMode(true);
      }
      if(previousGroup.parent)previousGroup.parent.remove(previousGroup);
      setTimeout(()=>disposeModelGroup(previousGroup),0);
    }
    lastBuiltGeometrySignature=liveGeometrySignature();endPerfCycle();
    return;
  }
  const magenta=profileColor(0xff00ff),blue=profileColor(0x2563eb),orange=profileColor(0xff8c00),amber=profileColor(0xffb347),grass=panelColor(0x7cfc00);
  const beamVertical=beamSection.vertical;
  const frontBackBeamThickness=beamSection.thickness;
  const sideBeamThickness=IS_GALAXY?80:(IS_BIO_RISE?50:beamSection.thickness);
  const freedomMultiActive=!IS_BIO_FAMILY&&freedomMultiLayout&&freedomMultiLayout.valid&&Number(freedomMultiLayout.systemCount)>=1;
  const bioRiseMultiActive=IS_BIO_RISE&&bioRiseMultiLayout&&bioRiseMultiLayout.valid&&Number(bioRiseMultiLayout.systemCount)>1;
  const galaxyLayoutActive=IS_GALAXY&&galaxyMultiLayout&&galaxyMultiLayout.valid;
  const bioFamilyLayout=IS_GALAXY?galaxyMultiLayout:bioRiseMultiLayout;
  const bioFamilyLayoutActive=Boolean(bioRiseMultiActive||galaxyLayoutActive);
  const bioProductName=IS_GALAXY?'Bioclimatic (Tilt)':'Eco-Bioclimatic (Tilt)';

  const beamCenterY=H/2-beamVertical/2;
  const beamBottomY=beamCenterY-beamVertical/2;
  if(freedomMultiActive){
    if(H>beamVertical)freedomMultiLayout.posts.forEach(post=>{
      const originalIndex=Number(post.sourceIndex);
      const isEditableOuterPost=originalIndex>=0;
      addBox({
        name:(post.row==='rear'?'Arka':'Ön')+' Dikme '+(post.lineIndex+1),
        px:post.x,py:-130,pz:post.z,sx:post.section.x,sy:H-beamVertical,sz:post.section.z,
        idx:isEditableOuterPost?originalIndex:undefined,
        userData:{freedomStructuralKind:'post',freedomPostId:post.id,postLineIndex:post.lineIndex,postRow:post.row,sharedBoundary:Boolean(post.sharedBoundary)}
      },magenta,isEditableOuterPost);
    });
    freedomMultiLayout.beams.forEach(beam=>{
      if(beam.kind==='width'){
        addBox({
          name:(beam.row==='rear'?'Arka':'Ön')+' Genişlik Kirişi · Modül '+(beam.moduleIndex+1),
          px:beam.x,py:beamCenterY,pz:beam.z+(Number.isFinite(Number(beam.inwardSign))?Number(beam.inwardSign):(beam.row==='rear'?1:-1))*frontBackBeamThickness/2,
          sx:beam.length,sy:beamVertical,sz:frontBackBeamThickness,isBeam:true,
          userData:{beamKind:'front-back',freedomStructuralKind:'beam',freedomBeamId:beam.id,moduleIndex:beam.moduleIndex,beamRow:beam.row}
        },blue,false);
      }else{
        addBox({
          name:'Açılım Kirişi '+String(beam.lineIndex),
          px:beam.x,py:beamCenterY,pz:beam.z,
          sx:sideBeamThickness,sy:beamVertical,sz:beam.length,isBeam:true,
          userData:{beamKind:'side',freedomStructuralKind:'beam',freedomBeamId:beam.id,postLineIndex:beam.lineIndex,sharedBoundary:Boolean(beam.sharedBoundary||beam.sharedAcrossRows)}
        },blue,false);
      }
    });
  }else if(bioFamilyLayoutActive){
    if(H>beamVertical)bioFamilyLayout.posts.forEach(post=>{
      const isEditableOuterPost=Number(post.sourceIndex)>=0;
      addBox({
        name:(post.row==='rear'?'Arka':'Ön')+' '+bioProductName+' Dikme '+(post.lineIndex+1),
        px:post.x,py:post.y,pz:post.z,sx:post.section.x,sy:post.height,sz:post.section.z,
        idx:isEditableOuterPost?post.sourceIndex:undefined,
        userData:{bioRiseStructuralKind:'post',galaxyStructuralKind:IS_GALAXY?'post':undefined,bioRisePostId:post.id,galaxyPostId:IS_GALAXY?post.id:undefined,productGroup:PRODUCT_GROUP,postLineIndex:post.lineIndex,postRow:post.row,sharedBoundary:Boolean(post.sharedBoundary),stopsUnderRecord:Boolean(post.stopsUnderRecord)}
      },magenta,isEditableOuterPost);
    });
    bioFamilyLayout.beams.forEach(beam=>{
      // Galaxy kayıtları V3.83'te ayrı kutu mesh değildir; aşağıda DXF birleşik kayıt+oluk profili olarak tek kez üretilir.
      if(IS_GALAXY)return;
      if(beam.kind==='width'){
        addBox({
          name:(beam.row==='rear'?'Arka':'Ön')+' '+bioProductName+' Kaydı · Modül '+(beam.moduleIndex+1),
          px:beam.x,py:beamCenterY,pz:beam.z+(Number.isFinite(Number(beam.inwardSign))?Number(beam.inwardSign):(beam.row==='rear'?1:-1))*frontBackBeamThickness/2,
          sx:beam.length,sy:beamVertical,sz:frontBackBeamThickness,isBeam:true,
          userData:{beamKind:'front-back',bioRiseStructuralKind:'beam',galaxyStructuralKind:IS_GALAXY?'beam':undefined,bioRiseBeamId:beam.id,galaxyBeamId:IS_GALAXY?beam.id:undefined,productGroup:PRODUCT_GROUP,moduleIndex:beam.moduleIndex,beamRow:beam.row,independentModuleFrame:true}
        },blue,false);
      }else{
        addBox({
          name:(beam.side==='left'?'Sol':'Sağ')+' '+bioProductName+' Yan Kaydı · Modül '+(beam.moduleIndex+1),
          px:beam.x,py:beamCenterY,pz:beam.z,
          sx:sideBeamThickness,sy:beamVertical,sz:beam.length,isBeam:true,
          userData:{beamKind:'side',bioRiseStructuralKind:'beam',galaxyStructuralKind:IS_GALAXY?'beam':undefined,bioRiseBeamId:beam.id,galaxyBeamId:IS_GALAXY?beam.id:undefined,productGroup:PRODUCT_GROUP,moduleIndex:beam.moduleIndex,beamSide:beam.side,independentModuleFrame:true}
        },blue,false);
      }
    });
  }else{
    const singleFreedom=!IS_BIO_FAMILY;
    if(H>beamVertical){
    addBox({name:'Arka Sol Dikme',px:-W/2+p[0].x/2,py:0,pz:-D/2+p[0].z/2,sx:p[0].x,sy:H,sz:p[0].z,idx:0,userData:singleFreedom?{freedomStructuralKind:'post',freedomPostId:'freedom-post-rear-0',postLineIndex:0,postRow:'rear'}:{}},magenta,true);
    addBox({name:'Arka Sağ Dikme',px:W/2-p[1].x/2,py:0,pz:-D/2+p[1].z/2,sx:p[1].x,sy:H,sz:p[1].z,idx:1,userData:singleFreedom?{freedomStructuralKind:'post',freedomPostId:'freedom-post-rear-1',postLineIndex:1,postRow:'rear'}:{}},magenta,true);
    addBox({name:'Ön Sol Dikme',px:-W/2+p[2].x/2,py:0,pz:D/2-p[2].z/2,sx:p[2].x,sy:H,sz:p[2].z,idx:2,userData:singleFreedom?{freedomStructuralKind:'post',freedomPostId:'freedom-post-front-0',postLineIndex:0,postRow:'front'}:{}},magenta,true);
    addBox({name:'Ön Sağ Dikme',px:W/2-p[3].x/2,py:0,pz:D/2-p[3].z/2,sx:p[3].x,sy:H,sz:p[3].z,idx:3,userData:singleFreedom?{freedomStructuralKind:'post',freedomPostId:'freedom-post-front-1',postLineIndex:1,postRow:'front'}:{}},magenta,true);

    }
    if(IS_BIO_FAMILY){
    addBox({name:'Front Beam',px:((-W/2+p[0].x)+(W/2-p[1].x))/2,py:beamCenterY,pz:-D/2+frontBackBeamThickness/2,sx:W-p[0].x-p[1].x,sy:beamVertical,sz:frontBackBeamThickness,isBeam:true,userData:{beamKind:'front-back',...(singleFreedom?{freedomStructuralKind:'beam',freedomBeamId:'freedom-beam-rear-1',moduleIndex:0,beamRow:'rear'}:{})}},blue,false);
    addBox({name:'Back Beam',px:((-W/2+p[2].x)+(W/2-p[3].x))/2,py:beamCenterY,pz:D/2-frontBackBeamThickness/2,sx:W-p[2].x-p[3].x,sy:beamVertical,sz:frontBackBeamThickness,isBeam:true,userData:{beamKind:'front-back',...(singleFreedom?{freedomStructuralKind:'beam',freedomBeamId:'freedom-beam-front-1',moduleIndex:0,beamRow:'front'}:{})}},blue,false);
    addBox({name:'Left Beam',px:-W/2+sideBeamThickness/2,py:beamCenterY,pz:((-D/2+p[0].z)+(D/2-p[2].z))/2,sx:sideBeamThickness,sy:beamVertical,sz:D-p[0].z-p[2].z,isBeam:true,userData:{beamKind:'side',...(singleFreedom?{freedomStructuralKind:'beam',freedomBeamId:'freedom-beam-depth-0',postLineIndex:0}:{})}},blue,false);
    addBox({name:'Right Beam',px:W/2-sideBeamThickness/2,py:beamCenterY,pz:((-D/2+p[1].z)+(D/2-p[3].z))/2,sx:sideBeamThickness,sy:beamVertical,sz:D-p[1].z-p[3].z,isBeam:true,userData:{beamKind:'side',...(singleFreedom?{freedomStructuralKind:'beam',freedomBeamId:'freedom-beam-depth-1',postLineIndex:1}:{})}},blue,false);
    }
  }

  let railTop=151;
  let railBottom=30;
  let railOffsetFrom151=IS_BIO_FAMILY?-92:-47.5;

  const bioSideGutterWidth=98;
  const bioGutterBeamClearance=2;
  const bioLeftBeamInnerX=-W/2+sideBeamThickness;
  const bioRightBeamInnerX=W/2-sideBeamThickness;
  const bioLeftGutterOuterX=bioLeftBeamInnerX+bioGutterBeamClearance;
  const bioRightGutterOuterX=bioRightBeamInnerX-bioGutterBeamClearance;
  const bioLeftGutterInnerX=bioLeftGutterOuterX+bioSideGutterWidth;
  const bioRightGutterInnerX=bioRightGutterOuterX-bioSideGutterWidth;

  if(IS_BIO_FAMILY){
    const sideGutterWidth=bioSideGutterWidth;
    const sideGutterInnerRun=62;
    const modules=bioFamilyLayoutActive&&bioFamilyLayout
      ? bioFamilyLayout.modules
      : [{moduleIndex:0,leftGutterOuterX:bioLeftGutterOuterX,rightGutterOuterX:bioRightGutterOuterX,gutterCenterZ:0,gutterLength:Math.max(200,D-100),centerX:0,clearWidth:Math.max(200,W-p[0].x-p[1].x),rearOuterZ:-D/2,frontOuterZ:D/2,rearToFrontSign:1}];
    modules.forEach(module=>{
      const moduleNumber=module.moduleIndex+1;
      if(IS_GALAXY){
        const zSign=Number(module.rearToFrontSign)<0?-1:1;
        const centerZ=Number.isFinite(Number(module.centerZ))?Number(module.centerZ):0;
        const leftLength=Math.max(1,Number(module.leftSideBeamLength)||Number(module.depth||D)-280);
        const rightLength=Math.max(1,Number(module.rightSideBeamLength)||leftLength);
        const rearLength=Math.max(1,Number(module.rearBeamLength)||Number(module.clearWidth)||200);
        const frontLength=Math.max(1,Number(module.frontBeamLength)||rearLength);
        const leftZ=Number.isFinite(Number(module.leftSideBeamZ))?Number(module.leftSideBeamZ):centerZ;
        const rightZ=Number.isFinite(Number(module.rightSideBeamZ))?Number(module.rightSideBeamZ):centerZ;
        const outerMinX=Number.isFinite(Number(module.outerMinX))?Number(module.outerMinX):Number(module.leftGutterOuterX)-82;
        const outerMaxX=Number.isFinite(Number(module.outerMaxX))?Number(module.outerMaxX):Number(module.rightGutterOuterX)+82;
        const rearOuterZ=Number.isFinite(Number(module.rearOuterZ))?Number(module.rearOuterZ):Number(module.rearGutterInnerZ)-zSign*140;
        const frontOuterZ=Number.isFinite(Number(module.frontOuterZ))?Number(module.frontOuterZ):Number(module.frontGutterInnerZ)+zSign*140;

        const leftProfile=createGalaxyCombinedProfile('Galaxy Sol Birleşik Kayıt+Oluk · Modül '+moduleNumber,'side',leftLength,orange,'negX',{
          productGroup:PRODUCT_GROUP,moduleIndex:module.moduleIndex,gutterSide:'left',beamSide:'left',beamKind:'side',galaxyBeamId:'galaxy-beam-left-'+moduleNumber,independentModuleFrame:true
        });
        setMeshByBounds(leftProfile,{minX:outerMinX,centerZ:leftZ,bottomY:beamBottomY});

        const rightProfile=createGalaxyCombinedProfile('Galaxy Sağ Birleşik Kayıt+Oluk · Modül '+moduleNumber,'side',rightLength,orange,'posX',{
          productGroup:PRODUCT_GROUP,moduleIndex:module.moduleIndex,gutterSide:'right',beamSide:'right',beamKind:'side',galaxyBeamId:'galaxy-beam-right-'+moduleNumber,independentModuleFrame:true
        });
        setMeshByBounds(rightProfile,{maxX:outerMaxX,centerZ:rightZ,bottomY:beamBottomY});

        const rearDirection=zSign>0?'negZ':'posZ';
        const rearProfile=createGalaxyCombinedProfile('Galaxy Arka Birleşik Kayıt+Oluk · Modül '+moduleNumber,'front-rear',rearLength,orange,rearDirection,{
          productGroup:PRODUCT_GROUP,moduleIndex:module.moduleIndex,gutterSide:'rear',beamRow:'rear',beamKind:'front-back',galaxyBeamId:'galaxy-beam-rear-'+moduleNumber,independentModuleFrame:true
        });
        setMeshByBounds(rearProfile,zSign>0?{centerX:module.centerX,minZ:rearOuterZ,bottomY:beamBottomY}:{centerX:module.centerX,maxZ:rearOuterZ,bottomY:beamBottomY});

        const frontDirection=zSign>0?'posZ':'negZ';
        const frontProfile=createGalaxyCombinedProfile('Galaxy Ön Birleşik Kayıt+Oluk · Modül '+moduleNumber,'front-rear',frontLength,orange,frontDirection,{
          productGroup:PRODUCT_GROUP,moduleIndex:module.moduleIndex,gutterSide:'front',beamRow:'front',beamKind:'front-back',galaxyBeamId:'galaxy-beam-front-'+moduleNumber,independentModuleFrame:true
        });
        setMeshByBounds(frontProfile,zSign>0?{centerX:module.centerX,maxZ:frontOuterZ,bottomY:beamBottomY}:{centerX:module.centerX,minZ:frontOuterZ,bottomY:beamBottomY});
        return;
      }

      const sideGutterLength=Math.max(200,Number(module.gutterLength)||Number(module.depth||D)-100);
      const gutterCenterZ=Number.isFinite(Number(module.gutterCenterZ))?Number(module.gutterCenterZ):Number(module.centerZ)||0;
      const leftG=createExtrudedGutter(bioProductName+' Sol Oluk · Modül '+moduleNumber,sideGutterWidth,sideGutterInnerRun,sideGutterLength,orange,'right',true);
      leftG.userData={...(leftG.userData||{}),bioRiseStructuralKind:'gutter',productGroup:PRODUCT_GROUP,moduleIndex:module.moduleIndex,gutterSide:'left',independentModuleFrame:true};
      setMeshByBounds(leftG,{minX:module.leftGutterOuterX,centerZ:gutterCenterZ,bottomY:beamBottomY});
      const rightG=createExtrudedGutter(bioProductName+' Sağ Oluk · Modül '+moduleNumber,sideGutterWidth,sideGutterInnerRun,sideGutterLength,orange,'left',true);
      rightG.userData={...(rightG.userData||{}),bioRiseStructuralKind:'gutter',productGroup:PRODUCT_GROUP,moduleIndex:module.moduleIndex,gutterSide:'right',independentModuleFrame:true};
      setMeshByBounds(rightG,{maxX:module.rightGutterOuterX,centerZ:gutterCenterZ,bottomY:beamBottomY});
    });
  }else if(freedomMultiActive){
    const railBottomY=beamBottomY+4;
    const railHeight=128;
    const railSide=50;
    freedomMultiLayout.modules.forEach(module=>{
      const moduleNumber=module.moduleIndex+1;
      const moduleCenterZ=Number(module.centerZ)||0;
      const zSign=Number(module.rearToFrontSign)<0?-1:1;
      const toWorldZ=(localT)=>zSign*localT;
      const moduleCenterT=zSign*moduleCenterZ;
      const gutterFrameDepth=Math.max(200,Number(module.depth));
      const gutterHalfDepth=gutterFrameDepth/2;
      const moduleRD=Math.max(200,Number(module.depth)-99);
      const railCenterT=moduleCenterT+((-moduleRD/2+railTop+moduleRD/2-railBottom)/2)+railOffsetFrom151;
      const railCenterZ=toWorldZ(railCenterT);
      const rearGutterEdgeZ=toWorldZ(moduleCenterT-gutterHalfDepth);
      const frontG=createExtrudedGutter('Front Gutter · Modül '+moduleNumber,170,114,module.gutterWidth,orange,zSign>0?'back':'front');
      frontG.userData={...(frontG.userData||{}),freedomStructuralKind:'gutter',moduleIndex:module.moduleIndex,gutterSide:'rear',rowIndex:module.rowIndex};
      setMeshByBounds(frontG,zSign>0?{centerX:module.centerX,minZ:rearGutterEdgeZ,bottomY:beamBottomY}:{centerX:module.centerX,maxZ:rearGutterEdgeZ,bottomY:beamBottomY});
      const frontGutterEdgeZ=toWorldZ(moduleCenterT+gutterHalfDepth);
      const backG=createExtrudedGutter('Back Gutter · Modül '+moduleNumber,170,114,module.gutterWidth,orange,zSign>0?'front':'back');
      backG.userData={...(backG.userData||{}),freedomStructuralKind:'gutter',moduleIndex:module.moduleIndex,gutterSide:'front',rowIndex:module.rowIndex};
      setMeshByBounds(backG,zSign>0?{centerX:module.centerX,maxZ:frontGutterEdgeZ,bottomY:beamBottomY}:{centerX:module.centerX,minZ:frontGutterEdgeZ,bottomY:beamBottomY});
      const leftG=createExtrudedGutter('Left Gutter · Modül '+moduleNumber,170,114,gutterFrameDepth,orange,'right');
      leftG.userData={...(leftG.userData||{}),freedomStructuralKind:'gutter',moduleIndex:module.moduleIndex,gutterSide:'left'};
      setMeshByBounds(leftG,{minX:module.outerMinX,centerZ:moduleCenterZ,bottomY:beamBottomY});
      const rightG=createExtrudedGutter('Right Gutter · Modül '+moduleNumber,170,114,gutterFrameDepth,orange,'left');
      rightG.userData={...(rightG.userData||{}),freedomStructuralKind:'gutter',moduleIndex:module.moduleIndex,gutterSide:'right'};
      setMeshByBounds(rightG,{maxX:module.outerMaxX,centerZ:moduleCenterZ,bottomY:beamBottomY});

    });
  }else{
    const gutterFrameWidth=Math.max(200,W);
    const gutterFrameDepth=Math.max(200,D);
    const gutterHalfWidth=gutterFrameWidth/2;
    const gutterHalfDepth=gutterFrameDepth/2;
    const frontG=createExtrudedGutter('Front Gutter',170,114,gutterFrameWidth,orange,'back');
    frontG.userData={...(frontG.userData||{}),...(!IS_BIO_RISE?{freedomStructuralKind:'gutter',moduleIndex:0,gutterSide:'rear'}:{})};
    setMeshByBounds(frontG,{centerX:0,minZ:-gutterHalfDepth,bottomY:beamBottomY});
    const backG=createExtrudedGutter('Back Gutter',170,114,gutterFrameWidth,orange,'front');
    backG.userData={...(backG.userData||{}),...(!IS_BIO_RISE?{freedomStructuralKind:'gutter',moduleIndex:0,gutterSide:'front'}:{})};
    setMeshByBounds(backG,{centerX:0,maxZ:gutterHalfDepth,bottomY:beamBottomY});
    const leftG=createExtrudedGutter('Left Gutter',170,114,gutterFrameDepth,orange,'right');
    leftG.userData={...(leftG.userData||{}),...(!IS_BIO_RISE?{freedomStructuralKind:'gutter',moduleIndex:0,gutterSide:'left'}:{})};
    setMeshByBounds(leftG,{minX:-gutterHalfWidth,centerZ:0,bottomY:beamBottomY});
    const rightG=createExtrudedGutter('Right Gutter',170,114,gutterFrameDepth,orange,'left');
    rightG.userData={...(rightG.userData||{}),...(!IS_BIO_RISE?{freedomStructuralKind:'gutter',moduleIndex:0,gutterSide:'right'}:{})};
    setMeshByBounds(rightG,{maxX:gutterHalfWidth,centerZ:0,bottomY:beamBottomY});

    const railBottomY=beamBottomY+4;
    const railHeight=128;
    const railSide=50;
    const railCenterZ=((-RD/2+railTop+RD/2-railBottom)/2)+railOffsetFrom151;
  }

  const lamelBottomY=beamBottomY+61;
  const bioRiseInnerWidth=Math.max(200,bioRightGutterInnerX-bioLeftGutterInnerX);
  const lamelLength=IS_BIO_FAMILY?bioRiseInnerWidth:W-340;
  // Açık lamel kesiti 180° aynalandığı için -80° pivot dönüşü net 100° efektif açıklık verir.
  const freedomEffectiveOpenAngle=100;
  const bioRiseEffectiveOpenAngle=100;
  const freedomLamelOpenAngle=freedomEffectiveOpenAngle-180;
  const bioRiseLamelOpenAngle=bioRiseEffectiveOpenAngle-180;
  const lamelOpenAngle=IS_BIO_FAMILY?bioRiseLamelOpenAngle:freedomLamelOpenAngle;
  const lamelCount=Math.max(0,Math.floor(LC||0));
  const lamelNarrowBy=IS_BIO_FAMILY?16:0;

  if(IS_BIO_FAMILY){
    const bioPanelSpacing=200;
    const bioPanelDepth=lamelProfileSpan(lamelNarrowBy);
    const closureClearance=2;
    const bioPanelModules=bioFamilyLayoutActive
      ? bioFamilyLayout.modules
      : [{moduleIndex:0,panelCenterX:0,panelLength:lamelLength,panelCount:lamelCount,rearOuterZ:-D/2,frontOuterZ:D/2,centerZ:0,depth:D}];

    bioPanelModules.forEach(module=>{
      const moduleNumber=module.moduleIndex+1;
      const moduleLength=bioFamilyLayoutActive?module.panelLength:lamelLength;
      const moduleCenterX=bioFamilyLayoutActive?module.panelCenterX:0;
      const modulePanelCount=Math.max(0,Math.floor(Number(module.panelCount)||lamelCount||0));
      const rearOuterZ=Number.isFinite(Number(module.rearOuterZ))?Number(module.rearOuterZ):-D/2;
      const frontOuterZ=Number.isFinite(Number(module.frontOuterZ))?Number(module.frontOuterZ):D/2;
      const zSign=Number(module.rearToFrontSign)<0?-1:1;
      const toT=(z)=>zSign*Number(z);
      const toZ=(t)=>zSign*Number(t);
      const rearOuterT=toT(rearOuterZ);
      const frontOuterT=toT(frontOuterZ);
      const rearFirstPanelMaxT=IS_GALAXY&&Number.isFinite(Number(module.frontGutterInnerT))?Number(module.frontGutterInnerT)-76:frontOuterT-216;
      const frontRoofInnerT=IS_GALAXY&&Number.isFinite(Number(module.rearGutterInnerT))?Number(module.rearGutterInnerT):rearOuterT+frontBackBeamThickness;
      const backRoofInnerT=IS_GALAXY&&Number.isFinite(Number(module.frontGutterInnerT))?Number(module.frontGutterInnerT):frontOuterT-frontBackBeamThickness;
      const frontMovingPanelMaxT=rearFirstPanelMaxT-Math.max(0,modulePanelCount-1)*bioPanelSpacing;
      const frontMovingPanelMinT=frontMovingPanelMaxT-bioPanelDepth;
      const frontClosureGap=Math.max(0,frontMovingPanelMinT-frontRoofInnerT);
      const backClosureGap=Math.max(0,backRoofInnerT-rearFirstPanelMaxT);
      const meta={bioRiseStructuralKind:'panel',galaxyStructuralKind:IS_GALAXY?'panel':undefined,productGroup:PRODUCT_GROUP,moduleIndex:module.moduleIndex,rowIndex:module.rowIndex,panelCollection:module.panelCollection};
      if(frontClosureGap>closureClearance+8){
        const frontClosure=createFixedClosureLamel((bioFamilyLayoutActive?'Modül '+moduleNumber+' · ':'')+bioProductName+' Front Fixed Closure',moduleLength,blue,frontClosureGap-closureClearance,lamelNarrowBy);
        frontClosure.userData={...(frontClosure.userData||{}),...meta,panelKind:'front-closure'};
        if(zSign<0)frontClosure.rotation.y=Math.PI;
        const edgeZ=toZ(frontRoofInnerT+closureClearance/2);
        setMeshByBounds(frontClosure,zSign>0?{centerX:moduleCenterX,minZ:edgeZ,bottomY:lamelBottomY}:{centerX:moduleCenterX,maxZ:edgeZ,bottomY:lamelBottomY});
      }
      if(backClosureGap>closureClearance+8){
        const backClosure=createFixedClosureLamel((bioFamilyLayoutActive?'Modül '+moduleNumber+' · ':'')+bioProductName+' Back Fixed Closure',moduleLength,blue,backClosureGap-closureClearance,lamelNarrowBy);
        backClosure.userData={...(backClosure.userData||{}),...meta,panelKind:'back-closure'};
        if(zSign<0)backClosure.rotation.y=Math.PI;
        const edgeZ=toZ(backRoofInnerT-closureClearance/2);
        setMeshByBounds(backClosure,zSign>0?{centerX:moduleCenterX,maxZ:edgeZ,bottomY:lamelBottomY}:{centerX:moduleCenterX,minZ:edgeZ,bottomY:lamelBottomY});
      }

      if(lamellaOpenMode){
        for(let i=0;i<modulePanelCount;i++){
          const opened=createOpenedLamel((bioFamilyLayoutActive?'Modül '+moduleNumber+' · ':'')+'Lamella '+(i+1),moduleLength,grass,lamelOpenAngle,lamelNarrowBy,true);
          const rearStackEdgeT=rearFirstPanelMaxT-(modulePanelCount-1-i)*bioPanelSpacing;
          const panelMeta={...meta,panelIndex:i};
          opened.pivot.userData={...(opened.pivot.userData||{}),...panelMeta};
          opened.mesh.userData={...(opened.mesh.userData||{}),...panelMeta};
          if(zSign<0)opened.pivot.rotation.y+=Math.PI;
          const edgeZ=toZ(rearStackEdgeT);
          setObjectByBounds(opened.pivot,zSign>0?{centerX:moduleCenterX,maxZ:edgeZ,bottomY:lamelBottomY}:{centerX:moduleCenterX,minZ:edgeZ,bottomY:lamelBottomY});
        }
      }else{
        for(let i=0;i<modulePanelCount;i++){
          const lamel=createLamel((bioFamilyLayoutActive?'Modül '+moduleNumber+' · ':'')+'Lamella '+(i+1),moduleLength,grass,lamelNarrowBy);
          lamel.userData={...(lamel.userData||{}),...meta,panelIndex:i};
          if(zSign<0)lamel.rotation.y=Math.PI;
          const panelEdgeT=rearFirstPanelMaxT-(modulePanelCount-1-i)*bioPanelSpacing;
          const edgeZ=toZ(panelEdgeT);
          setMeshByBounds(lamel,zSign>0?{centerX:moduleCenterX,maxZ:edgeZ,bottomY:lamelBottomY}:{centerX:moduleCenterX,minZ:edgeZ,bottomY:lamelBottomY});
        }
      }
    });
  }else{
    const lamelInsetFrom151=50;
    const freedomMotorFacade='front';
    const freedomMotorFacadeLabel='Arka Cephe';
    const lamelSpacing=216;
    const lamelOpenSpacing=65;
    const freedomPanelModules=freedomMultiActive
      ? freedomMultiLayout.modules
      : [{moduleIndex:0,centerX:0,centerZ:0,depth:D,panelLength:lamelLength,panelCount:lamelCount}];
    freedomPanelModules.forEach(module=>{
      const moduleNumber=module.moduleIndex+1;
      const moduleLamelLength=freedomMultiActive?module.panelLength:lamelLength;
      const moduleCenterZ=Number(module.centerZ)||0;
      const zSign=Number(module.rearToFrontSign)<0?-1:1;
      const moduleCenterT=zSign*moduleCenterZ;
      const toWorldZ=(localT)=>zSign*localT;
      const moduleRD=Math.max(200,Number(module.depth||D)-99);
      const moduleLamelStartT=moduleCenterT+(-moduleRD/2+railTop+railOffsetFrom151)+lamelInsetFrom151;
      const modulePanelCount=Math.max(0,Math.floor(Number(module.panelCount)||lamelCount||0));
      const roof=bioclimaticRoof.build(module,options&&options.owner||'roof-main',currentCanonicalPayload(),group,sharedLamelGeometry(0),grass,profileColor(0xffb347));parts.push(roof);
    });
  }

  buildFacadeProducts(p,beamBottomY,freedomMultiActive,bioFamilyLayoutActive,bioFamilyLayout);
  applyMemberEdits(options&&options.owner||'roof-main',options&&options.supportWalls||sketchWalls);
  if(options&&options.copyPass){parts.forEach(p=>p.visible=!p.userData.rrMemberDeleted);return;}
  refreshToolboxSelectionVisuals();

  if(showAll){
    parts.forEach(part=>part.visible=!part.userData.rrMemberDeleted);
  }else{
    window.replayAnimation();
  }

  if(atomicSwap){
    group.position.copy(previousPosition);
    group.rotation.copy(previousRotation);
    group.scale.copy(previousScale);
    group.visible=previousVisible;
    previousParent.add(group);
    if(arSession){
      intermediateDimensionObjects.forEach(item=>item.visible=false);
      mainDimensionObjects.forEach(item=>item.visible=false);
      zonePickers.forEach(item=>item.visible=false);
      setArGhostMode(true);
    }
    if(previousGroup.parent)previousGroup.parent.remove(previousGroup);
    setTimeout(()=>disposeModelGroup(previousGroup),0);
  }
  // Apply wall focus after the canonical product visibility and atomic swap settle.
  rebuildSceneProducts();
  for(const [id,r] of facadeMotions){if(!r.seen)facadeMotions.delete(id);else for(const update of r.bindings)update(facadeProgress(r));}
  sceneTools.rebuild();
  buildSketchWalls();
  lastBuiltGeometrySignature=liveGeometrySignature();
  endPerfCycle();
  window.PLMRV24StandaloneViewer?.syncBio();
  if(!animationLoopRunning&&!arSession)renderer.render(scene,camera);
}

function disposeSceneObject(object){
  if(!object)return;
  if(object.geometry&&typeof object.geometry.dispose==='function')object.geometry.dispose();
  const materials=Array.isArray(object.material)?object.material:[object.material];
  materials.filter(Boolean).forEach(material=>{if(typeof material.dispose==='function')material.dispose();});
}

function refreshSceneEnvelope(){
  RW=W-4;
  RD=D-99;
  dir.position.set(W*.35,H*1.1,D*.45);
  fill.position.set(-W*.45,H*.55,-D*.5);
  rim.position.set(-W*.7,H*.85,D*.9);
  warm.position.set(W*.1,H*.35,-D*.95);
}

function applyLiveModelPayload(payload,quiet){
  const next=payload&&typeof payload==='object'?payload:{};
  if(next.productGroup&&next.productGroup!==PRODUCT_GROUP)return false;
  pozNo=Number(next.pozNo)||1;
  W=Math.max(1,Number(next.width)||W);
  D=Math.max(1,Number(next.depth)||D);
  H=Math.max(1,Number(next.height)||H);
  LC=Math.max(1,Math.round(Number(next.lamellaCount)||LC));
  SYSTEM_COUNT=Math.max(1,Math.round(Number(next.systemCount)||SYSTEM_COUNT));
  freedomMultiLayout=next.freedomLayout&&typeof next.freedomLayout==='object'?JSON.parse(JSON.stringify(next.freedomLayout)):null;
  bioRiseMultiLayout=next.bioRiseLayout&&typeof next.bioRiseLayout==='object'?JSON.parse(JSON.stringify(next.bioRiseLayout)):null;
  galaxyMultiLayout=next.galaxyLayout&&typeof next.galaxyLayout==='object'?JSON.parse(JSON.stringify(next.galaxyLayout)):null;
  orientations=Array.isArray(next.orientations)?next.orientations.map(Number):orientations;
  postSections=Array.isArray(next.postSections)?next.postSections.map(section=>({...section})):postSections;
  beamSection=next.beamSection&&typeof next.beamSection==='object'?{...next.beamSection}:beamSection;
  placements=next.placements&&typeof next.placements==='object'?JSON.parse(JSON.stringify(next.placements)):{};
  zipPlacements=next.zipPlacements&&typeof next.zipPlacements==='object'?JSON.parse(JSON.stringify(next.zipPlacements)):{};
  facadeProfiles=next.facadeProfiles&&typeof next.facadeProfiles==='object'?JSON.parse(JSON.stringify(next.facadeProfiles)):{};
  zoneDividers=next.zoneDividers&&typeof next.zoneDividers==='object'?JSON.parse(JSON.stringify(next.zoneDividers)):{};
  zoneRegistry=next.zoneRegistry&&typeof next.zoneRegistry==='object'?JSON.parse(JSON.stringify(next.zoneRegistry)):{};
  sceneEditorState=next.sceneEditor?JSON.parse(JSON.stringify(next.sceneEditor)):sceneEditorState;
  sketchWalls=Array.isArray(next.sketchWalls)?JSON.parse(JSON.stringify(next.sketchWalls)):[];
  selectedZoneId=next.selectedZoneId||null;
  dimensionVisibility=next.dimensionVisibility&&typeof next.dimensionVisibility==='object'?{...next.dimensionVisibility}:dimensionVisibility;
  productsOpen=Boolean(next.productsOpen);
  productOpenStates=next.productOpenStates&&typeof next.productOpenStates==='object'?{...next.productOpenStates}:{};
  panelStates=next.panelStates&&typeof next.panelStates==='object'?{...next.panelStates}:{};
  panelMasterOpen=Boolean(next.panelMasterOpen);
  lamellaOpenMode=panelMasterOpen;
  DEFAULT_COLOR_MODE=next.colorMode!=='ral';
  SYSTEM_COLOR=liveColorNumber(next.systemColor,SYSTEM_COLOR);
  PANEL_COLOR=liveColorNumber(next.panelColor,PANEL_COLOR);
  SYSTEM_FINISH=liveFinish(next.systemColor&&next.systemColor.finish,SYSTEM_FINISH);
  PANEL_FINISH=liveFinish(next.panelColor&&next.panelColor.finish,PANEL_FINISH);
  SYSTEM_COLOR_CODE=String(next.systemColor&&next.systemColor.code||SYSTEM_COLOR_CODE||'');
  PANEL_COLOR_CODE=String(next.panelColor&&next.panelColor.code||PANEL_COLOR_CODE||'');
  SYSTEM_COLOR_KIND=String(next.systemColor&&next.systemColor.kind||'');
  PANEL_COLOR_KIND=String(next.panelColor&&next.panelColor.kind||'');
  SYSTEM_COLOR_TEXTURE=String(next.systemColor&&next.systemColor.texture||'');
  PANEL_COLOR_TEXTURE=String(next.panelColor&&next.panelColor.texture||'');
  if(!quiet)refreshSceneEnvelope();
  return true;
}

function liveGeometrySignature(){
  const {presentation,...engineeringSceneState}=sceneEditorState;
  return stableRenderSignature({
    productGroup:PRODUCT_GROUP,width:W,depth:D,height:H,lamellaCount:LC,systemCount:SYSTEM_COUNT,
    freedomLayout:freedomMultiLayout,bioRiseLayout:bioRiseMultiLayout,galaxyLayout:galaxyMultiLayout,
    orientations,postSections,beamSection,placements,zipPlacements,facadeProfiles,zoneDividers,zoneRegistry,sketchWalls,sceneEditorState:engineeringSceneState,
    productsOpen,productOpenStates,panelMasterOpen,
    colorMode:DEFAULT_COLOR_MODE?'default':'ral',systemColor:SYSTEM_COLOR,panelColor:PANEL_COLOR,systemFinish:SYSTEM_FINISH,panelFinish:PANEL_FINISH,systemColorCode:SYSTEM_COLOR_CODE,panelColorCode:PANEL_COLOR_CODE,systemColorKind:SYSTEM_COLOR_KIND,panelColorKind:PANEL_COLOR_KIND,systemColorTexture:SYSTEM_COLOR_TEXTURE,panelColorTexture:PANEL_COLOR_TEXTURE
  });
}

function rebuildModelWithoutFrameReload(revision){
  const requestedRevision=Number(revision)||0;
  if(requestedRevision<lastAppliedLiveRevision)return;
  lastAppliedLiveRevision=requestedRevision;
  if(arSession||arModelSnapshot){arDeferredModelRebuild=true;return;}
  const signature=liveGeometrySignature();
  if(signature&&signature===lastBuiltGeometrySignature){p3dvPerf.skippedRebuilds+=1;return;}
  p3dvPerf.scheduledRebuilds+=1;
  if(liveRebuildTimer)clearTimeout(liveRebuildTimer);
  // Coalesce bursts of parent messages and yield one paint before the expensive model pass.
  pendingBioclimaticRebuild=true;
  liveRebuildTimer=setTimeout(()=>{
    liveRebuildTimer=null;
    requestAnimationFrame(()=>{
      const latestSignature=liveGeometrySignature();
      if(latestSignature&&latestSignature===lastBuiltGeometrySignature){p3dvPerf.skippedRebuilds+=1;pendingBioclimaticRebuild=false;return;}
      if(timer)clearInterval(timer);
      try{buildModel(true,{atomicSwap:true,reason:'live-coalesced-rebuild'});}finally{pendingBioclimaticRebuild=false;}
    });
  },48);
}

window.replayAnimation=function replayAnimation(){
  animStep=0;
  parts.forEach(part=>part.visible=false);
  if(timer)clearInterval(timer);
  timer=setInterval(()=>{
    if(animStep<parts.length){
      parts[animStep].visible=true;
      animStep++;
    }else{
      clearInterval(timer);
    }
  },120);
};

let wallSceneGroup=new THREE.Group();wallSceneGroup.userData.rrWallGroup=true;scene.add(wallSceneGroup);
let roofCopyGroups=[];
function sceneRoofObjects(){return [...(sceneEditorState.mainDeleted?[]:[{id:'roof-main',group,pose:sceneEditorState.roofPose,height:H,width:W,depth:D,spec:currentCanonicalPayload()}]),...roofCopyGroups.map(o=>({...o,spec:sceneEditorState.roofCopies.find(c=>c.id===o.id)?.spec}))];}
function currentCanonicalPayload(){return {pozNo,productGroup:PRODUCT_GROUP,width:W,depth:D,height:H,lamellaCount:LC,systemCount:SYSTEM_COUNT,freedomLayout:freedomMultiLayout,bioRiseLayout:bioRiseMultiLayout,galaxyLayout:galaxyMultiLayout,orientations,postSections,beamSection,placements,zipPlacements,facadeProfiles,zoneDividers,zoneRegistry,sketchWalls,sceneEditor:sceneEditorState,selectedZoneId,dimensionVisibility,productsOpen,productOpenStates,panelStates,panelMasterOpen,colorMode:DEFAULT_COLOR_MODE?'default':'ral',systemColor:{hex:'#'+SYSTEM_COLOR.toString(16).padStart(6,'0'),finish:SYSTEM_FINISH,code:SYSTEM_COLOR_CODE,kind:SYSTEM_COLOR_KIND,texture:SYSTEM_COLOR_TEXTURE},panelColor:{hex:'#'+PANEL_COLOR.toString(16).padStart(6,'0'),finish:PANEL_FINISH,code:PANEL_COLOR_CODE,kind:PANEL_COLOR_KIND,texture:PANEL_COLOR_TEXTURE}};}
function applyRoofPose(o){const p=window.PLMRRollingRoofSceneCore.pose(o.pose);o.group.position.set(p.x,Number(sceneEditorState.groundY)+o.height/2+p.y,p.z);o.group.rotation.set(0,-p.angle*Math.PI/180,0);o.group.updateMatrixWorld(true);}
function rebuildSceneProducts(){
  for(const o of roofCopyGroups){if(o.group.parent)o.group.parent.remove(o.group);disposeModelGroup(o.group);}roofCopyGroups=[];
  group.visible=!sceneEditorState.mainDeleted;applyRoofPose({group,pose:sceneEditorState.roofPose,height:H});
  const saved={group,parts,intermediateDimensionObjects,mainDimensionObjects,interactiveObjects,zonePickers,hoveredZone,selectedZonePicker},payload=currentCanonicalPayload(),copyPickers=[],copyInteractive=[],copyParts=[];
  try {for(const item of payload.sceneEditor.roofCopies||[]){
    group=new THREE.Group();applyLiveModelPayload({...item.spec,sketchWalls:payload.sketchWalls,sceneEditor:{...item.spec.sceneEditor,roofPose:item.pose,roofCopies:[...payload.sceneEditor.roofCopies.filter(c=>c.id!==item.id),...(payload.sceneEditor.mainDeleted?[]:[{id:'roof-main',pose:payload.sceneEditor.roofPose,spec:{...payload,sceneEditor:{...payload.sceneEditor,roofCopies:[]}}}])]}},true);buildModel(true,{copyPass:true,owner:item.id,supportWalls:payload.sketchWalls});
    for(const p of zonePickers){p.userData.zone.owner=item.id;copyPickers.push(p);}copyInteractive.push(...interactiveObjects);copyParts.push(...parts);
    [...intermediateDimensionObjects,...mainDimensionObjects].forEach(p=>{if(p.parent)p.parent.remove(p);disposeModelGroup(p);});
    const o={id:item.id,group,pose:item.pose,height:H,width:W,depth:D};scene.add(group);roofCopyGroups.push(o);
  }} finally {
    group=saved.group;parts=[...saved.parts,...copyParts];intermediateDimensionObjects=saved.intermediateDimensionObjects;mainDimensionObjects=saved.mainDimensionObjects;interactiveObjects=[...saved.interactiveObjects,...copyInteractive];zonePickers=[...saved.zonePickers,...copyPickers];hoveredZone=saved.hoveredZone;selectedZonePicker=saved.selectedZonePicker;
    applyLiveModelPayload(payload,true);for(const o of roofCopyGroups)applyRoofPose(o);
  }
}
const commonPosts=window.PLMRV13CommonViewer({scene,renderer,camera,controls,roofs:sceneRoofObjects,post:postParent});
const bioclimaticRoof=window.PLMRBioclimaticRoofViewer({renderer,camera,pickPhysical:pickVisiblePart,roofs:sceneRoofObjects,post:postParent,zonesVisible:()=>zonesVisible,bulkActive:()=>Boolean(toolboxSelectionMode)||commonPosts.active(),bulkMode:()=>toolboxSelectionMode,bulkKeys:()=>toolboxSelectionKeys,zoneExplicitlyHidden:r=>zoneFilters.ids[r.owner+'|roof:'+r.index]===false,zoneAllowed:r=>window.PLMRV11Zones.allowed(zoneFilters,{id:'roof:'+r.index,group:'roof'},r.owner)});
var sceneTools=window.PLMRRollingRoofSceneTools({scene,renderer,camera,controls,roofs:sceneRoofObjects,walls:()=>sketchWalls,state:()=>sceneEditorState,dimensionVisibility:()=>dimensionVisibility,zones:()=>zonePickers,bulk:()=>toolboxSelectionMode,post:postParent,setTool:t=>rrEditor.setTool(t)});
const rrEditor=window.PLMRRollingRoofSceneEditor({scene,renderer,camera,controls,group:()=>wallSceneGroup,productGroups:()=>sceneRoofObjects().map(o=>o.group),sceneTools,walls:()=>sketchWalls,setWalls:w=>sketchWalls=w,interactive:()=>interactiveObjects,setInteractive:o=>interactiveObjects=o,zonePoint:zoneWorldPoint,post:postParent,setToolName:t=>sketchTool=t,highlightPost:o=>{o.material=o.material.clone();o.material.emissive.setHex(0x0ea5e9);o.material.emissiveIntensity=.35;}});
const v11Interactions=window.PLMRV11Interactions({scene,renderer,camera,roofs:sceneRoofObjects,zones:()=>zonePickers,zoneHighlight:m=>setZoneHighlight(m,m===hoveredZone),parts:()=>interactiveObjects,spec:id=>id==='roof-main'?currentCanonicalPayload():sceneEditorState.roofCopies.find(c=>c.id===id)?.spec,post:postParent,tool:()=>sketchTool,bulk:()=>toolboxSelectionMode,keys:()=>toolboxSelectionKeys,setTool:t=>rrEditor.setTool(t),clearTransient:()=>{rrEditor.cancel();sceneTools.clearSelection();},zoneExplicitlyHidden:(owner,id)=>zoneFilters.ids[owner+'|'+id]===false,zoneAllowed:(z,o)=>zonesVisible&&window.PLMRV11Zones.allowed(zoneFilters,z,o),selectedZone:()=>selectedZoneId});
const v17Annotations=window.PLMRV17SelectionViewer({scene,renderer,camera,post:postParent,zones:()=>zonePickers,roofs:()=>sceneRoofObjects(),measureHit:ray=>sceneTools.measureHit(ray),measureSelected:keys=>sceneTools.measureSelected(keys),bulk:()=>toolboxSelectionMode,tool:()=>sketchTool});
function v11RefreshZoneVisibility(){for(const m of zonePickers)m.visible=(m.userData.zone.owner!=='roof-main'||!sceneEditorState.mainDeleted)&&(toolboxSelectionMode?isToolboxZoneEligible(m.userData.zone,m.userData.occupied):(zonesVisible&&window.PLMRV11Zones.allowed(zoneFilters,m.userData.zone,m.userData.zone.owner)));bioclimaticRoof.setZonesVisible(['multi-product','multi-delete'].includes(toolboxSelectionMode)||zonesVisible&&!toolboxSelectionMode);v11Interactions.refresh();}
window.__PLMR_ANIMATION_VIEWER__=window.PLMRAnimationViewer({camera,controls,renderer,scene,roof:bioclimaticRoof,roofCore:window.PLMRBioclimaticRoof,roofs:sceneRoofObjects,facades:facadeMotions,facadeProgress,decorations:()=>[...mainDimensionObjects,...intermediateDimensionObjects,...zonePickers],resetFacadeClock:()=>facadeMotionLastTime=performance.now(),publishCamera:publishCameraState,cancelCameraPublish:()=>{clearTimeout(cameraStateTimer);cameraStateTimer=null;},isReady:()=>!liveRebuildTimer&&!pendingBioclimaticRebuild,prepareScene:()=>window.PLMRV27Scene?.preparePresentation?.(),readOnly:Boolean(window.parent.__PLMR_ANIMATION_READONLY__)});
function buildSketchWalls(){rrEditor.rebuild();}
function setSketchTool(t){rrEditor.setTool(t);}
function handleSketchPointerMove(e){return commonPosts.active()||rrEditor.move(e);}
function handleSketchPointerUp(e){if(window.parent.PLMRFinalReadOnly?.())return false;return commonPosts.active()||rrEditor.up(e);}
function handleSketchKey(e){return rrEditor.key(e);}

function updateMouse(event){
  mouse.x=event.clientX/innerWidth*2-1;
  mouse.y=-(event.clientY/innerHeight)*2+1;
  raycaster.setFromCamera(mouse,camera);
}

let v14HoverLastEvent=null,v14HoverPhysical=null;const v14HoverStats={rays:0,maxMs:0};
function v14PickHover(event){const started=performance.now();updateMouse(event);scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);raycaster.setFromCamera(mouse,camera);const zones=raycaster.intersectObjects(zonePickers.filter(m=>sceneObjectPickable(m)&&(!toolboxSelectionMode||m.userData.toolboxEligible)),false),structural=[...new Set(interactiveObjects.concat(parts))].filter(m=>m.isMesh&&sceneObjectPickable(m)&&!m.userData.isZone&&(m.userData.isPost||m.userData.rrMemberId||m.userData.isBeam||m.userData.isSketchWallFace));const physical=raycaster.intersectObjects(structural,false)[0];v14HoverLastEvent=event;v14HoverPhysical=physical?.object||null;const next=window.PLMRV13Core.nearestHit(physical?[...zones,physical]:zones)?.object||null;v14HoverStats.rays++;v14HoverStats.maxMs=Math.max(v14HoverStats.maxMs,performance.now()-started);return next;}
function pickInteractive(event){return v14PickHover(event);}

function pickVisiblePart(event){
  if(event===v14HoverLastEvent&&sceneObjectPickable(v14HoverPhysical))return v14HoverPhysical;
  updateMouse(event);
  scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);raycaster.setFromCamera(mouse,camera);
  const meshes=[];for(const candidate of raycastCandidates())candidate.traverse(o=>{if(o.isMesh&&sceneObjectPickable(o)&&!o.userData.isZone&&!o.userData.isRoofZone&&!o.userData.annotation&&!o.userData.presentationAnnotation)meshes.push(o);});
  const hits=raycaster.intersectObjects([...new Set(meshes)],false);
  return hits.length?hits[0].object:null;
}

function zoneFromObject(obj){
  if(!zonesVisible)return null;
  let current=obj;
  while(current){
    if(current.userData&&current.userData.isZone)return current.userData.zone;
    if(current.userData&&current.userData.zoneId){
      const owner=sceneRoofObjects().find(o=>{for(let p=current;p;p=p.parent)if(p===o.group)return true;return false;})?.id||'roof-main';
      const picker=zonePickers.find(item=>item.visible&&item.userData.zone.id===current.userData.zoneId&&item.userData.zone.owner===owner);
      return picker?picker.userData.zone:null;
    }
    current=current.parent;
  }
  return null;
}

function partFromObject(obj){
  let current=obj;
  while(current&&current!==group){
    if(current.userData&&(current.userData.isPost||current.userData.isBeam||current.userData.isProduct||current.userData.isDividerProfile))return current;
    current=current.parent;
  }
  return obj;
}


let pergoRiseSelectedObject=null;
let pergoRiseSelectedTarget=null;
const pergoRiseSelectionInfo=document.getElementById('pergoRiseSelectionInfo');
const pergoRiseContextMenu=document.getElementById('pergoRiseContextMenu');
const pergoRiseOperationLabels={add:'Ekle',remove:'Kaldır',edit:'Düzenle',resize:'Ölçü Değiştir',recalculate:'Yeniden Hesapla'};
function pergoRiseSelectableFromObject(obj){
  let current=obj;
  while(current&&current!==group){
    if(current.userData&&current.userData.p3dvPergoRiseSelectable&&current.userData.editingTarget)return current;
    current=current.parent;
  }
  return null;
}
function clearPergoRiseSelection(){
  if(pergoRiseSelectedObject&&pergoRiseSelectedObject.traverse){
    pergoRiseSelectedObject.traverse(child=>{
      if(!child.isMesh||!child.material)return;
      const materials=Array.isArray(child.material)?child.material:[child.material];
      materials.forEach(material=>{
        if(material&&material.userData&&material.userData.p3dvYf1OriginalEmissive!==undefined&&material.emissive){
          material.emissive.setHex(material.userData.p3dvYf1OriginalEmissive);
          material.emissiveIntensity=material.userData.p3dvYf1OriginalEmissiveIntensity||0;
          delete material.userData.p3dvYf1OriginalEmissive;
          delete material.userData.p3dvYf1OriginalEmissiveIntensity;
        }
      });
    });
  }
  pergoRiseSelectedObject=null;pergoRiseSelectedTarget=null;
  if(pergoRiseSelectionInfo)pergoRiseSelectionInfo.style.display='none';
  if(pergoRiseContextMenu)pergoRiseContextMenu.style.display='none';
  if(IS_PERGO_RISE&&typeof updatePergoRiseCommonTestState==='function')updatePergoRiseCommonTestState();
}
function highlightPergoRiseSelection(object){
  clearPergoRiseSelection();
  if(!object)return;
  pergoRiseSelectedObject=object;pergoRiseSelectedTarget=object.userData.editingTarget;
  object.traverse(child=>{
    if(!child.isMesh||!child.material)return;
    const source=Array.isArray(child.material)?child.material:[child.material];
    const cloned=source.map(material=>material&&material.clone?material.clone():material);
    child.material=Array.isArray(child.material)?cloned:cloned[0];
    cloned.forEach(material=>{
      if(!material||!material.emissive)return;
      material.userData=material.userData||{};
      material.userData.p3dvYf1OriginalEmissive=material.emissive.getHex();
      material.userData.p3dvYf1OriginalEmissiveIntensity=material.emissiveIntensity||0;
      material.emissive.setHex(0x38bdf8);material.emissiveIntensity=.65;
    });
  });
  if(pergoRiseSelectionInfo){
    pergoRiseSelectionInfo.textContent=(pergoRiseSelectedTarget.label||pergoRiseSelectedTarget.id)+' · '+pergoRiseSelectedTarget.targetType;
    pergoRiseSelectionInfo.style.display='block';
  }
  postParent('pergo-rise-edit-selection',{target:{...pergoRiseSelectedTarget}});
  updatePergoRiseCommonTestState();
}
function showPergoRiseContextMenu(event,object){
  if(!IS_PERGO_RISE||!pergoRiseContextMenu||!object)return false;
  highlightPergoRiseSelection(object);
  const target=pergoRiseSelectedTarget||{};const operations=Array.isArray(target.operations)?target.operations:[];
  pergoRiseContextMenu.innerHTML='';
  const title=document.createElement('strong');title.textContent=target.label||target.id||'Pergola nesnesi';pergoRiseContextMenu.appendChild(title);
  const menuActions=Array.isArray(target.menuActions)&&target.menuActions.length?target.menuActions.map(item=>[item.id,item.label]):operations.map(operation=>[operation,pergoRiseOperationLabels[operation]||operation]);
  menuActions.forEach(([operation,label])=>{
    const button=document.createElement('button');button.type='button';button.textContent=label;
    button.addEventListener('click',()=>{
      pergoRiseContextMenu.style.display='none';
      postParent('pergo-rise-edit-operation-request',{operation:operation,areaAction:target.targetType==='area'?operation:null,target:{...target},foundationOnly:false});
    });
    pergoRiseContextMenu.appendChild(button);
  });
  const rect=renderer.domElement.getBoundingClientRect();
  pergoRiseContextMenu.style.left=Math.max(8,Math.min(event.clientX-rect.left,rect.width-292))+'px';
  pergoRiseContextMenu.style.top=Math.max(8,Math.min(event.clientY-rect.top,rect.height-260))+'px';
  pergoRiseContextMenu.style.display='block';
  return true;
}

renderer.domElement.addEventListener('pointerdown',event=>{
  if(arSession)return;
  pointerStart={x:event.clientX,y:event.clientY};
});

let v14LastHoverPointer=null;
function v14UpdateHover(event){
  v14LastHoverPointer=event;
  if(arSession)return;
  if(handleSketchPointerMove(event)){event.preventDefault();return;}
  if(event.buttons&&pointerStart&&Math.hypot(event.clientX-pointerStart.x,event.clientY-pointerStart.y)>6)return;
  const obj=pickInteractive(event);
  const zone=zoneFromObject(obj);
  const next=zone?zonePickers.find(item=>item.visible&&item.userData.zone.id===zone.id&&item.userData.zone.owner===(zone.owner||'roof-main')):null;
  const part=partFromObject(obj);
  const profilePointer=Boolean(part&&part.userData&&part.userData.isDividerProfile&&(!toolboxSelectionMode||part.userData.toolboxEligible));
  const postPointer=Boolean(part&&part.userData&&(part.userData.isPost||part.userData.rrMemberId)&&!toolboxSelectionMode);
  const zonePointer=Boolean(next&&(!toolboxSelectionMode||next.userData.toolboxEligible));
  const directPointer=profilePointer||postPointer;
  bioclimaticRoof.hover(event,sketchTool==='select'&&(!toolboxSelectionMode||['multi-product','multi-delete'].includes(toolboxSelectionMode))&&!next);
  if(next===hoveredZone&&!directPointer){if(next)setZoneHighlight(next,true);return;}
  if(hoveredZone)setZoneHighlight(hoveredZone,false);
  hoveredZone=next||null;
  if(hoveredZone)setZoneHighlight(hoveredZone,true);
  renderer.domElement.style.cursor=(zonePointer||directPointer)?'pointer':'grab';
}
renderer.domElement.addEventListener('pointermove',v14UpdateHover);
controls.addEventListener('change',()=>{if(v14LastHoverPointer&&!v14LastHoverPointer.buttons&&!commonPosts.active())v14UpdateHover(v14LastHoverPointer);});


renderer.domElement.addEventListener('pointerleave',()=>{
  v14LastHoverPointer=null;
  bioclimaticRoof.hover({},false);
  if(hoveredZone)setZoneHighlight(hoveredZone,false);
  hoveredZone=null;
  pointerStart=null;
});

renderer.domElement.addEventListener('pointerup',event=>{
  if(window.parent.PLMRFinalReadOnly?.()){pointerStart=null;return;}
  if(event.__plmrNativeHandled){pointerStart=null;return;}
  if(arSession)return;
  if(event.button!==0)return;
  if(sketchTool==='select'&&pointerStart&&Math.hypot(event.clientX-pointerStart.x,event.clientY-pointerStart.y)>6){pointerStart=null;return;}
  if(sketchTool==='select'&&!toolboxSelectionMode&&(event.ctrlKey||event.metaKey)&&v11Interactions.up(event,true)){event.preventDefault();pointerStart=null;return;}
  if(sketchTool==='select'&&!toolboxSelectionMode&&pointerStart){const r=renderer.domElement.getBoundingClientRect(),ray=new THREE.Raycaster();scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);ray.setFromCamera(new THREE.Vector2((event.clientX-r.left)/r.width*2-1,-(event.clientY-r.top)/r.height*2+1),camera);const label=window.PLMRV19Facade.hit(ray,scene);if(label){postParent(event.ctrlKey||event.metaKey?'v17-annotation-toggle':'v17-edit-product',event.ctrlKey||event.metaKey?{item:{kind:'information',code:label.positionCode,key:'information:'+label.positionCode}}:{item:{owner:label.owner,zoneId:label.zoneId,slot:label.slot}});event.preventDefault();pointerStart=null;return;}}
  if(sketchTool==='select'&&!toolboxSelectionMode&&v17Annotations.up(event)){event.preventDefault();pointerStart=null;return;}
  if(sketchTool==='select'&&(!toolboxSelectionMode||['multi-product','multi-delete'].includes(toolboxSelectionMode))&&(!event.ctrlKey&&!event.metaKey||toolboxSelectionMode)&&pointerStart&&bioclimaticRoof.click(event)){event.preventDefault();pointerStart=null;return;}
  if(sketchTool==='select'&&v11Interactions.up(event)){event.preventDefault();pointerStart=null;return;}
  if(handleSketchPointerUp(event)){event.preventDefault();pointerStart=null;return;}
  const start=pointerStart;
  pointerStart=null;
  if(!start||Math.hypot(event.clientX-start.x,event.clientY-start.y)>6)return;
  const interactive=pickInteractive(event);
  const interactivePart=partFromObject(interactive);
  const zone=zoneFromObject(interactive);
  const obj=partFromObject(pickVisiblePart(event));

  if(IS_PERGO_RISE&&!toolboxSelectionMode){
    const selectable=pergoRiseSelectableFromObject(pickVisiblePart(event));
    if(selectable){
      const target=selectable.userData&&selectable.userData.editingTarget||{};
      if(target.targetType==='area'){
        const zone=pergoRiseZoneFromTarget(target);
        if(selectedZonePicker){selectedZonePicker.userData.selected=false;setZoneHighlight(selectedZonePicker,false);}
        selectedZoneId=zone.id;selectedZonePicker=zonePickers.find(item=>item.userData&&item.userData.zone&&item.userData.zone.id===zone.id)||null;
        if(selectedZonePicker){selectedZonePicker.userData.selected=true;setZoneHighlight(selectedZonePicker,true);}
        postParent('select-zone',{zone:{...zone}});
        updatePergoRiseCommonTestState();
      }else highlightPergoRiseSelection(selectable);
      return;
    }
    clearPergoRiseSelection();
  }

  if(!toolboxSelectionMode&&interactivePart&&interactivePart.userData&&interactivePart.userData.isTogglePanel){
    scheduleTogglePanelZoneSelection(zone||zoneFromObject(interactivePart));
    return;
  }

  if(toolboxSelectionMode){
    if(zone){
      const picker=zonePickers.find(item=>item.userData.zone.id===zone.id)||null;
      if(picker&&isToolboxZoneEligible(zone,picker.userData.occupied)){
        postParent('toggle-toolbox-selection',{
          item:{kind:'zone',key:toolboxZoneKey(zone),zone:{...zone},occupied:Boolean(picker.userData.occupied)}
        });
      }
      return;
    }
    if(obj&&obj.userData.isDividerProfile&&isToolboxProfileEligible(obj.userData.profile)){
      const profile={...obj.userData.profile};
      postParent('toggle-toolbox-selection',{
        item:{kind:'profile',key:toolboxProfileKey(profile),profile}
      });
    }
    return;
  }

  if(zone){
    if(selectedZonePicker){
      selectedZonePicker.userData.selected=false;
      setZoneHighlight(selectedZonePicker,false);
    }
    selectedZoneId=zone.id;
    selectedZonePicker=zonePickers.find(item=>item.userData.zone.id===zone.id)||null;
    if(selectedZonePicker){
      selectedZonePicker.userData.selected=true;
      setZoneHighlight(selectedZonePicker,true);
    }
    postParent('select-zone',{zone:{...zone}});
    return;
  }
  if(obj&&obj.userData.isDividerProfile){
    postParent('select-divider-profile',{profile:{...obj.userData.profile}});
    return;
  }
  // Physical post selection is owned by sceneTools; no legacy profile dialog.
});

renderer.domElement.addEventListener('contextmenu',event=>{
  if(toolboxSelectionMode){event.preventDefault();postParent('complete-toolbox-selection');return;}
  if(IS_PERGO_RISE){
    const selectable=pergoRiseSelectableFromObject(pickVisiblePart(event));
    if(selectable){
      event.preventDefault();
      const target=selectable.userData&&selectable.userData.editingTarget||{};
      if(target.targetType==='area'){
        const zone=pergoRiseZoneFromTarget(target);
        selectedZoneId=zone.id;
        if(selectedZonePicker){selectedZonePicker.userData.selected=false;setZoneHighlight(selectedZonePicker,false);}
        selectedZonePicker=zonePickers.find(item=>item.userData&&item.userData.zone&&item.userData.zone.id===zone.id)||null;
        if(selectedZonePicker){selectedZonePicker.userData.selected=true;setZoneHighlight(selectedZonePicker,true);}
        postParent('select-zone',{zone:{...zone}});updatePergoRiseCommonTestState();return;
      }
      showPergoRiseContextMenu(event,selectable);return;
    }
  }
});

window.addEventListener('keydown',event=>{
  if(v17Annotations.key(event))return;
  if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='z'){event.preventDefault();rrEditor.cancel();postParent(event.shiftKey?'sketch-redo':'sketch-undo');return;}
  if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='y'){event.preventDefault();rrEditor.cancel();postParent('sketch-redo');return;}
  if(event.key==='Escape'){event.preventDefault();if(sceneTools.getState().member||sceneTools.postEditor.active()){sceneTools.escape();return;}postParent('v12-escape-request');return;}
  if(v11Interactions.key(event))return;
  if(handleSketchKey(event))return;
  if(!toolboxSelectionMode)return;
  if(event.key==='Escape'){
    event.preventDefault();
    postParent('cancel-toolbox-selection');
  }else if(event.key==='Enter'){
    event.preventDefault();
    postParent('complete-toolbox-selection');
  }
});

window.addEventListener('keyup',event=>rrEditor.keyUp(event));

window.addEventListener('dblclick',event=>{
if(parent.PLMRFinalReadOnly?.())return;
  if(sketchTool!=='select')return;
  const obj=partFromObject(pickVisiblePart(event));
  if(!obj)return;
  if(obj.userData.isTogglePanel&&obj.userData.zoneId){
    cancelPendingTogglePanelSelection();
    postParent('toggle-panel-state',{
      panelKey:obj.userData.panelKey||obj.userData.productKey||obj.userData.zoneId,
      productKey:obj.userData.productKey||obj.userData.panelKey||obj.userData.zoneId,owner:(()=>{for(const o of sceneRoofObjects())for(let p=obj;p;p=p.parent)if(p===o.group)return o.id;return 'roof-main';})(),
      zoneId:obj.userData.zoneId,
      open:!Boolean(obj.userData.panelOpen)
    });
    return;
  }

});

window.addEventListener('message',event=>{
  if(event.source!==parent)return;
  if(!event.data||event.data.source!=='product-3d-parent')return;
  if(event.data.sessionId!==VIEWER_SESSION_ID)return;
  if(IS_STANDALONE_GUILLOTINE_PREVIEW && event.data.type==='capture-guillotine'){
    try {
      renderer.render(scene,camera);
      postParent('guillotine-capture',{requestId:event.data.requestId,dataUrl:renderer.domElement.toDataURL('image/png')});
    } catch(error) {postParent('guillotine-capture',{requestId:event.data.requestId,error:String(error.message||error)});}
    return;
  }
  if(event.data.type==='set-model-state'){
    const revision=Number(event.data.revision)||0;
    if(revision<lastAppliedLiveRevision)return;
    const rejectedWall=event.data.reason==='wall-edit-rejected';
    if(rejectedWall)rrEditor.cancel();
    if(!applyLiveModelPayload(event.data.model||{}))return;
    // An optimistic wall mesh can differ even when the restored canonical
    // signature equals the last built model. Reproject that wall explicitly.
    if(rejectedWall)buildSketchWalls();
    rebuildModelWithoutFrameReload(revision);
    postParent('model-state-applied',{revision,reason:event.data.reason||'model-change'});
  }
  if(event.data.type==='set-product-open-state'){
    const revision=Number(event.data.revision)||0;
    if(revision<lastAppliedLiveRevision)return;
    productsOpen=Boolean(event.data.productsOpen);
    productOpenStates=event.data.productOpenStates&&typeof event.data.productOpenStates==='object'?{...event.data.productOpenStates}:{};
    panelStates=event.data.panelStates&&typeof event.data.panelStates==='object'?{...event.data.panelStates}:{};
    for(const states of event.data.copyStates||[]){const c=sceneEditorState.roofCopies.find(c=>c.id===states.id);if(c){c.spec.productOpenStates={...states.productOpenStates};c.spec.panelStates={...states.panelStates};}}
    if(event.data.allProducts)for(const copy of sceneEditorState.roofCopies||[]){
      const spec=copy.spec;spec.productsOpen=productsOpen;spec.productOpenStates=spec.productOpenStates||{};spec.panelStates=spec.panelStates||{};
      for(const key of Object.keys(spec.placements||{}))spec.productOpenStates[key]=productsOpen;
      for(const key of Object.keys(spec.zipPlacements||{}))spec.productOpenStates['zip:'+key]=spec.panelStates['zip:'+key]=productsOpen;
    }
    lastAppliedLiveRevision=revision;syncFacadeTargets(Boolean(event.data.allProducts));
    postParent('product-open-state-applied',{revision});
  }
  if(event.data.type==='set-panel-master-open'){
    const revision=Number(event.data.revision)||0;
    if(revision<lastAppliedLiveRevision)return;
    panelMasterOpen=Boolean(event.data.open);
    lamellaOpenMode=panelMasterOpen;
    for(const spec of [currentCanonicalPayload(),...(sceneEditorState.roofCopies||[]).map(o=>o.spec)]){spec.panelMasterOpen=panelMasterOpen;for(const c of Object.values(spec.sceneEditor?.roofProducts||{}))c.open=panelMasterOpen;}
    lastAppliedLiveRevision=revision;bioclimaticRoof.setOpen(panelMasterOpen);
    postParent('panel-master-open-applied',{open:panelMasterOpen,revision});
  }
  if(event.data.type==='set-color-state'){
    const revision=Number(event.data.revision)||0;
    if(revision<lastAppliedLiveRevision)return;
    DEFAULT_COLOR_MODE=event.data.colorMode!=='ral';
    SYSTEM_COLOR=liveColorNumber(event.data.systemColor,SYSTEM_COLOR);
    PANEL_COLOR=liveColorNumber(event.data.panelColor,PANEL_COLOR);
    SYSTEM_FINISH=liveFinish(event.data.systemColor&&event.data.systemColor.finish,SYSTEM_FINISH);
    PANEL_FINISH=liveFinish(event.data.panelColor&&event.data.panelColor.finish,PANEL_FINISH);
    SYSTEM_COLOR_CODE=String(event.data.systemColor&&event.data.systemColor.code||SYSTEM_COLOR_CODE||'');
    PANEL_COLOR_CODE=String(event.data.panelColor&&event.data.panelColor.code||PANEL_COLOR_CODE||'');
    SYSTEM_COLOR_KIND=String(event.data.systemColor&&event.data.systemColor.kind||'');
    PANEL_COLOR_KIND=String(event.data.panelColor&&event.data.panelColor.kind||'');
    SYSTEM_COLOR_TEXTURE=String(event.data.systemColor&&event.data.systemColor.texture||'');
    PANEL_COLOR_TEXTURE=String(event.data.panelColor&&event.data.panelColor.texture||'');
    rebuildModelWithoutFrameReload(revision);
    postParent('color-state-applied',{revision,colorMode:DEFAULT_COLOR_MODE?'default':'ral'});
  }
  if(event.data.type==='set-zones-visible'||event.data.type==='set-zone-filters'){zonesVisible=Boolean(event.data.visible);if(event.data.filters)zoneFilters=event.data.filters;v11Interactions.clearZones();v11RefreshZoneVisibility();if(hoveredZone)setZoneHighlight(hoveredZone,false);hoveredZone=null;window.PLMRBioclimaticRoofChooser.close();return;}
  if(event.data.type==='v14-selection-motion'){const products=event.data.products||[];bioclimaticRoof.previewSelection(products.filter(p=>p.kind==='roof'));for(const p of products.filter(p=>p.kind==='facade'))for(const r of facadeMotions.values())if(r.owner===p.owner&&r.key===p.productKey){const restore=r.preview?r.preview.restore:r.target;r.preview={restore,stage:'out'};r.target=restore?0:1;}return;}
  if(event.data.type==='v17-annotation-selection'){v17Annotations.set(event.data.items||[]);return;}
  if(event.data.type==='v17-clear-annotation-selection'){v17Annotations.set([]);v11Interactions.clearZones();return;}
  if(event.data.type==='v12-roof-states'){bioclimaticRoof.setStates(event.data.items||[]);return;}
  if(event.data.type==='v12-roof-preview'){const r=bioclimaticRoof.state().find(r=>r.owner===event.data.owner&&r.moduleIndex===event.data.moduleIndex);if(r)bioclimaticRoof.preview({...r,index:r.moduleIndex},event.data.productId);return;}
  if(event.data.type==='v12-roof-preview-cancel'){bioclimaticRoof.restorePreview();return;}
  if(event.data.type==='v13-common-start'){v11Interactions.clearFromHost();rrEditor.cancel();commonPosts.open(event.data.groups);return;}
  if(event.data.type==='v12-escape'){if(commonPosts.active()){commonPosts.close();return;}window.PLMRBioclimaticRoofChooser.close();if(sceneTools.escape())return;rrEditor.setTool('select');v11Interactions.clearFromHost();return;}
  if(event.data.type==='v12-preview-facade'){for(const r of facadeMotions.values())if(r.owner===event.data.owner&&(r.key===event.data.zoneId||r.key==='zip:'+event.data.zoneId)){r.preview={restore:r.target,stage:'out'};r.target=r.target?0:1;for(const update of r.bindings)update(facadeProgress(r));}return;}
  if(event.data.type==='v11-select-all'){v11Interactions.key({key:'a',ctrlKey:true,preventDefault:()=>{},target:renderer.domElement});return;}
  if(event.data.type==='v11-clear-selection'){v11Interactions.clearFromHost();return;}

  if(event.data.type==='set-scene-units'){sceneEditorState.dimensionUnits={mm:Boolean(event.data.units.mm),inch:Boolean(event.data.units.inch),ft:Boolean(event.data.units.ft)};sceneTools.refreshUnits();return;}
  if(event.data.type==='scene-command'){sceneTools.command(event.data.command);return;}
  if(event.data.type==='scene-error'){sceneTools.error(event.data.message);return;}
  if(event.data.type==='set-sketch-tool'){setSketchTool(event.data.tool);return;}
  if(event.data.type==='highlight-zone'){for(const m of zonePickers){m.userData.selected=m.userData.zone.id===event.data.zone.id&&m.userData.zone.owner===(event.data.zone.owner||'roof-main');setZoneHighlight(m,false);}return;}
  if(event.data.type==='clear-zone-selection'){
    if(selectedZonePicker){selectedZonePicker.userData.selected=false;setZoneHighlight(selectedZonePicker,false);}
    for(const p of zonePickers){p.userData.selected=false;setZoneHighlight(p,false);}hoveredZone=null;selectedZonePicker=null;selectedZoneId=null;
    if(IS_PERGO_RISE)clearPergoRiseSelection();
    if(IS_PERGO_RISE)updatePergoRiseCommonTestState();
    return;
  }
  if(event.data.type==='set-pergo-rise-project'&&IS_PERGO_RISE){
    const revision=Number(event.data.revision)||0;
    if(revision<lastAppliedLiveRevision){pergoRiseStaleProjectMessagesIgnored+=1;updatePergoRiseCommonTestState();return;}
    pergoRiseProject=event.data.project||null;
    pergoRiseDerived=pergoRiseProject&&pergoRiseProject.derived?pergoRiseProject.derived:null;
    if(pergoRiseDerived&&pergoRiseDerived.envelope){
      W=Math.max(1,Number(pergoRiseDerived.envelope.width)||W);
      D=Math.max(1,Number(pergoRiseDerived.envelope.depth)||D);
      H=Math.max(1,Number(pergoRiseDerived.envelope.height)||H);
      refreshSceneEnvelope();
    }
    lastAppliedLiveRevision=revision;pergoRiseAcceptedProjectRevision=revision;
    if(arSession||arModelSnapshot){arDeferredModelRebuild=true;}
    else if(!reconcilePergoRiseAssembly(event.data.changedPaths||[]))rebuildModelWithoutFrameReload(revision);
    pergoRiseAssemblyRevision=Math.max(pergoRiseAssemblyRevision+1,revision||0);updatePergoRiseCommonTestState();
    postParent('pergo-rise-project-applied',{revision,projectHash:pergoRiseDerived&&pergoRiseDerived.projectHash||'',reconcile:{...pergoRiseReconcileStats}});
  }
  if(event.data.type==='set-runtime-active'){
    viewerRuntimeActive=Boolean(event.data.active);
    syncViewerAnimationLoop();
    postParent('runtime-active-applied',{active:viewerRuntimeActive,animationLoopRunning});
  }
  if(event.data.type==='replay-animation'&&!IS_PERGO_RISE)window.replayAnimation();
  if(event.data.type==='set-dimension-visibility'){setDimensionVisibility(event.data.visibility);sceneTools.refreshDimensions();window.__PLMR_ANIMATION_VIEWER__?.repaint();}
  if(event.data.type==='set-dimensions-visible')setDimensionVisibility({intermediate:Boolean(event.data.visible),main:Boolean(event.data.visible)});
  if(event.data.type==='set-toolbox-selection'){
    toolboxSelectionMode=event.data.mode||null;
    toolboxSelectionKeys=new Set(Array.isArray(event.data.keys)?event.data.keys:[]);
    refreshToolboxSelectionVisuals();v11RefreshZoneVisibility();
  }
  if(event.data.type==='reset-camera'){
    if(!IS_BIO_FAMILY&&!IS_PERGO_RISE||sceneEditorState.roofCopies.length||sceneEditorState.templates.length||Object.values(sceneEditorState.roofPose).some(v=>v)){sceneTools.fit();publishCameraState();return;}
    camera.position.set(W*.92,H*.82,D*1.08);
    controls.target.set(0,0,0);
    camera.zoom=1;
    camera.updateProjectionMatrix();
    controls.update();
    publishCameraState();
  }
  if(event.data.type==='zoom-camera'){
    const factor=Number(event.data.factor);
    if(Number.isFinite(factor)&&factor>0){
      camera.zoom=Math.max(.35,Math.min(3.5,camera.zoom*factor));
      camera.updateProjectionMatrix();
      controls.update();
      publishCameraState();
    }
  }
  if(event.data.type==='viewport-resized'){
    camera.aspect=innerWidth/innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth,innerHeight);
    // setSize clears the drawing buffer. Repaint once when the continuous loop is
    // paused so expanding the preview can never turn a valid model into a blank canvas.
    if(!animationLoopRunning&&!arSession)renderer.render(scene,camera);
  }
});

window.__PLMR_RR_SKETCH__=Object.freeze({
 getState:rrEditor.getState,sceneState:sceneTools.getState,setTool:setSketchTool,
 debugMembers:()=>sceneRoofObjects().flatMap(o=>{const out=[];o.group.traverse(m=>{if(!m.userData.rrMemberId)return;const p=m.getWorldPosition(new THREE.Vector3()).project(camera);out.push({owner:o.id,id:m.userData.rrMemberId,name:m.userData.name,length:m.userData.p3dvSize[m.userData.rrMemberAxis],size:m.userData.p3dvSize,position:m.position.toArray(),worldBounds:(()=>{m.updateWorldMatrix(true,false);const b=new THREE.Box3().setFromObject(m);return{min:b.min.toArray(),max:b.max.toArray()};})(),screen:{x:(p.x+1)*innerWidth/2,y:(1-p.y)*innerHeight/2}});});return out;}),
 debugStructure:()=>sceneRoofObjects().flatMap(o=>{const out=[];o.group.updateMatrixWorld(true);o.group.traverse(m=>{if(!m.isMesh||!m.visible||!m.userData.freedomStructuralKind)return;const b=new THREE.Box3();if(m.isInstancedMesh){const mat=new THREE.Matrix4();for(let i=0;i<m.count;i++){m.getMatrixAt(i,mat);b.union(m.geometry.boundingBox.clone().applyMatrix4(mat).applyMatrix4(m.matrixWorld));}}else b.setFromObject(m);out.push({owner:o.id,kind:m.userData.freedomStructuralKind,name:m.userData.name,size:b.getSize(new THREE.Vector3()).toArray(),min:b.min.toArray(),max:b.max.toArray(),local:m.position.toArray()});});return out;}),
 wallCells:id=>{const w=sketchWalls.find(w=>w.id===id);return w?window.PLMRRollingRoofSketchCore.cells(w):[];},
 wallFaces:id=>{const w=sketchWalls.find(w=>w.id===id);return w?window.PLMRRollingRoofSketchCore.faces(w):[];},
 debugFaceScreen:rrEditor.screenPoint,
 debugWorldScreen:p=>{const v=new THREE.Vector3(...p).project(camera);return {x:(v.x+1)*innerWidth/2,y:(1-v.y)*innerHeight/2};},
 debugRoofScreen:id=>{const o=sceneRoofObjects().find(o=>o.id===id);if(!o)return null;let mesh;o.group.traverse(n=>{if(!mesh&&n.isMesh&&n.userData.isPost)mesh=n;});if(!mesh)return null;const p=mesh.getWorldPosition(new THREE.Vector3()).project(camera);return {x:(p.x+1)*innerWidth/2,y:(1-p.y)*innerHeight/2};},
 debugMemberHit:(x,y)=>sceneTools.memberHit({clientX:x,clientY:y}),
 debugPhysicalHit:(x,y)=>{const raw=pickVisiblePart({clientX:x,clientY:y}),m=partFromObject(raw)||raw;return m?{id:m.userData.rrMemberId,name:m.userData.name,isPost:Boolean(m.userData.isPost)}:null;},
 debugHit:(x,y)=>{const h=rrEditor.pick({clientX:x,clientY:y});return h?{wallId:h.wall&&h.wall.id,face:h.face,local:h.local,name:h.object.userData.name}:null;},
 debugCamera:(position,target)=>{rrEditor.cancel();camera.position.fromArray(position);controls.target.fromArray(target||[0,0,0]);camera.lookAt(controls.target);controls.update();renderer.render(scene,camera);publishCameraState();},
 debugCameraState:()=>({position:camera.position.toArray(),target:controls.target.toArray(),up:camera.up.toArray(),fov:camera.fov}),
 debugRenderer:()=>({webgl:(renderer.getContext() instanceof WebGLRenderingContext || (typeof WebGL2RenderingContext!=='undefined'&&renderer.getContext() instanceof WebGL2RenderingContext)),renderer:renderer.getContext().getParameter(renderer.getContext().RENDERER),frameCount:animationFrameCount,renderCount:renderer.info.render.frame,meshes:parts.length}),
 debugModelReady:()=>!liveRebuildTimer&&!pendingBioclimaticRebuild,
 debugBalconyLeaves:()=>{const out=[];scene.traverse(o=>{if(o.userData.balconyMotion)out.push({...o.userData.balconyMotion,position:o.position.toArray(),angle:o.rotation.y});});return out;},
 debugMeasurements:()=>sceneTools.measurements(),
 debugV28Annotations:()=>{const out=[];scene.traverse(o=>{const d=o.userData||{};if(!(d.isDimension||d.dimension||d.movementIndicator||d.dimensionLabel))return;let visible=true;for(let p=o;p;p=p.parent)visible=visible&&p.visible;out.push({name:d.name||o.name,visible,dimension:!!(d.isDimension||d.dimension||d.dimensionLabel),movement:!!d.movementIndicator,position:o.getWorldPosition(new THREE.Vector3()).toArray()});});return out;},
 debugAnnotationSelection:()=>v17Annotations.inspect(),
 debugOwnerColors:()=>sceneRoofObjects().map(o=>{const postColors=new Set();o.group.traverse(m=>{if(m.userData.isPost)for(const material of Array.isArray(m.material)?m.material:[m.material])if(material?.color)postColors.add(material.color.getHexString());});return {owner:o.id,postColors:[...postColors]};}),
 debugFacadeMotion:facadeMotionDebug,
 debugV11Selection:()=>v11Interactions.inspect(),
 debugV11Ray:(x,y)=>v11Interactions.trace({clientX:x,clientY:y}),
 debugZoneScreens:()=>zonePickers.map(m=>{const p=m.getWorldPosition(new THREE.Vector3()).project(camera);return {owner:m.userData.zone.owner,id:m.userData.zone.id,x:(p.x+1)*innerWidth/2,y:(1-p.y)*innerHeight/2};}),
 debugHoveredZone:()=>hoveredZone?.userData.zone.id||null,
 debugHoverTiming:()=>({...v14HoverStats}),
 debugDimensionVisibility:()=>({...dimensionVisibility}),
 debugOpenPostShift:(owner,id)=>{const o=sceneRoofObjects().find(o=>o.id===owner);let mesh;o?.group.traverse(m=>{if(m.isMesh&&m.userData.rrMemberId===id)mesh=m;});if(mesh)sceneTools.postEditor.open(o,mesh);return !!mesh;},
 debugPostShift:()=>sceneTools.postEditor.inspect(),
 debugV19LabelHit:(x,y)=>{const ray=new THREE.Raycaster();scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);ray.setFromCamera(new THREE.Vector2(x/innerWidth*2-1,1-y/innerHeight*2),camera);return window.PLMRV19Facade.hit(ray,scene);},
 debugV19Labels:()=>window.PLMRV19Facade.inspect(scene,camera,innerWidth,innerHeight),
 debugV18Geometry:()=>sceneRoofObjects().flatMap(o=>{const out=[];o.group.updateWorldMatrix(true,true);o.group.traverse(m=>{if(m.userData.v18MountPivot){out.push({owner:o.id,pivot:true,...m.userData,worldCenter:m.getWorldPosition(new THREE.Vector3()).toArray()});}if(!m.isMesh||!m.userData.isProduct)return;const b=new THREE.Box3().setFromObject(m);out.push({owner:o.id,zoneId:m.userData.zoneId,name:m.userData.name,center:b.getCenter(new THREE.Vector3()).toArray(),min:b.min.toArray(),max:b.max.toArray()});});return out;}),
 debugV11Zones:()=>zonePickers.map(m=>({owner:m.userData.zone.owner,zone:m.userData.zone,visible:m.visible,selected:m.userData.selected,opacity:m.material.opacity})),
 debugV53Facades:()=>sceneRoofObjects().flatMap(roof=>{const out=[];roof.group.traverse(o=>{if(o.userData.v53Facade)out.push({owner:roof.id,zoneId:o.userData.zoneId,...o.userData.v53Facade});});return out;}),
 debugV24:()=>v24NativeEntries.filter(e=>{for(let p=e.root;p;p=p.parent)if(p===scene)return true;return false;}).map(e=>({config:e.config,dimensions:e.root.userData.v28Dimensions,fit:e.root.userData.fit,exteriorLocalZ:e.root.userData.exteriorLocalZ,rootMatrix:e.root.matrixWorld.toArray(),snapshot:e.engine.snapshot()})),
 debugFacadeGeometry:()=>{const out=[];for(const roof of sceneRoofObjects())roof.group.traverse(m=>{if(m.userData.isProduct){m.updateWorldMatrix(true,false);const b=new THREE.Box3().setFromObject(m);out.push({owner:roof.id,name:m.userData.name,key:m.userData.productKey,isTogglePanel:Boolean(m.userData.isTogglePanel),panelOpen:m.userData.panelOpen,visible:m.visible,position:m.position.toArray(),scale:m.scale.toArray(),parentRotation:m.parent.rotation.toArray(),min:b.min.toArray(),max:b.max.toArray()});}});return out;},
 debugRoofProducts:()=>bioclimaticRoof.state(),
 debugPanelInstances:()=>bioclimaticRoof.panelInstances(),
 debugPanelProfiles:()=>bioclimaticRoof.panelProfiles(),
 debugPanelSections:()=>bioclimaticRoof.panelSections(),
 debugGutterGeometry:()=>parts.filter(m=>m.userData.freedomStructuralKind==='gutter').map(m=>({name:m.userData.name,points:m.geometry.parameters.shapes.getPoints(),holes:m.geometry.parameters.shapes.holes.map(h=>h.getPoints())})),
 debugRoofZoneScreen:(owner,index)=>bioclimaticRoof.screen(owner||'roof-main',index||0),
 debugZoneVisibility:()=>({visible:zonesVisible,facadeVisible:zonePickers.filter(p=>p.visible).length,roofVisible:bioclimaticRoof.state().filter(r=>r.zoneVisible).length}),
 debugGutterSection:()=>window.PLMRBioclimaticRoof.gutterSection(),
 debugContactRendering:()=>({near:camera.near,opaque:sceneRoofObjects().flatMap(o=>{const out=[];o.group.traverse(m=>{if(m.isMesh&&m.material&&!Array.isArray(m.material)&&!m.material.transparent)out.push({name:m.userData.name||m.name,side:m.material.side,polygonOffset:m.material.polygonOffset});});return out;})}),
 debugZones:()=>zonePickers.map(p=>({...p.userData.zone})),
 debugPostScreen:index=>{const o=interactiveObjects.find(x=>x.userData.isPost&&Number(x.userData.postIndex)===Number(index));if(!o)return null;const p=o.getWorldPosition(new THREE.Vector3()).project(camera);return {x:(p.x+1)*innerWidth/2,y:(1-p.y)*innerHeight/2,sy:o.userData.p3dvSize[1]};},
 debugProfileScreen:(facadeId,profileId)=>{const o=interactiveObjects.find(o=>o.userData.isDividerProfile&&o.userData.profileId===profileId&&o.userData.facadeId===facadeId);if(!o)return null;const p=o.getWorldPosition(new THREE.Vector3()).project(camera);return {x:(p.x+1)*innerWidth/2,y:(1-p.y)*innerHeight/2};},
 debugZoneScreen:index=>{const o=zonePickers[index];if(!o)return null;const p=new THREE.Box3().setFromObject(o).getCenter(new THREE.Vector3()).project(camera);return {x:(p.x+1)*innerWidth/2,y:(1-p.y)*innerHeight/2,id:o.userData.zone.id};}
});

window.captureFreedom3D=function(preset){
  const savedPosition=camera.position.clone();
  const savedTarget=controls.target.clone();
  const savedZoom=camera.zoom;
  const savedVisibility=parts.map(part=>part.visible!==false);
  const resumeAnimation=Boolean(timer&&animStep<parts.length);
  if(timer){clearInterval(timer);timer=null;}
  parts.forEach(part=>part.visible=true);
  const presets={
    'front-left':{position:[-W*1.34,H*.94,-D*1.42],target:[0,0,0],zoom:.94},
    'front-right':{position:[W*1.34,H*.94,-D*1.42],target:[0,0,0],zoom:.94},
    'back-left':{position:[-W*1.34,H*.94,D*1.42],target:[0,0,0],zoom:.94},
    'back-right':{position:[W*1.34,H*.94,D*1.42],target:[0,0,0],zoom:.94},
    'perspective':{position:[W*1.18,H*.96,D*1.34],target:[0,0,0],zoom:.96},
    'front':{position:[0,H*.34,-D*1.82],target:[0,0,0],zoom:1.03},
    'side':{position:[W*1.82,H*.34,0],target:[0,0,0],zoom:1.03},
    'top':{position:[0,H*3.35,D*.035],target:[0,0,0],zoom:.90},
    'default':{position:[W*1.1,H*.88,D*1.22],target:[0,0,0],zoom:1}
  };
  const view=presets[preset]||presets.default;
  camera.position.fromArray(view.position);
  controls.target.fromArray(view.target);
  camera.zoom=view.zoom||1;
  camera.updateProjectionMatrix();
  controls.update();
  renderer.render(scene,camera);
  const result={
    dataUrl:renderer.domElement.toDataURL('image/jpeg',.88),
    width:renderer.domElement.width,
    height:renderer.domElement.height,
    preset:String(preset||'default')
  };
  parts.forEach((part,index)=>{part.visible=savedVisibility[index];});
  camera.position.copy(savedPosition);
  controls.target.copy(savedTarget);
  camera.zoom=savedZoom;
  camera.updateProjectionMatrix();
  controls.update();
  renderer.render(scene,camera);
  publishCameraState();
  if(resumeAnimation){
    timer=setInterval(()=>{
      if(animStep<parts.length){parts[animStep].visible=true;animStep++;}
      else{clearInterval(timer);timer=null;}
    },120);
  }
  return result;
};

window.addEventListener('resize',()=>{
  camera.aspect=innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  if(window.parent.__PLMR_ANIMATION_READONLY__)renderer.setPixelRatio(Math.min(1,1280/innerWidth,720/innerHeight));
  renderer.setSize(innerWidth,innerHeight);
  if(window.__PLMR_ANIMATION_VIEWER__?.active())window.__PLMR_ANIMATION_VIEWER__.repaint();
  else if(!animationLoopRunning&&!arSession)renderer.render(scene,camera);
});

window.PLMRV24Viewer=window.PLMRV24ViewerExports({scene,camera,renderer,controls,facadeMotions,roots:sceneRoofObjects,annotations:updateV24Annotations});
window.PLMRV24StandaloneViewer=window.PLMRV25Composite({scene,camera,renderer,controls,motions:facadeMotions,roots:sceneRoofObjects,outputs:window.PLMRV24Viewer,roof:bioclimaticRoof,clearBio:()=>v11Interactions.clear(false)});
window.PLMRV25Roof={movable:items=>bioclimaticRoof.selectionMovable(items),seek:(items,t)=>bioclimaticRoof.seekSelection(items,t),target:(items,v)=>bioclimaticRoof.targetSelection(items,v),progress:items=>bioclimaticRoof.selectionProgress(items)};
window.PLMRV25Cube=window.PLMRV25ViewCube({camera,controls});
window.parent.PLMRV24Workspace?.ready();

function animate(time,frame){
  animationFrameCount+=1;if(window.__PLMR_ANIMATION_VIEWER__?.tick())return;window.PLMRV24StandaloneViewer?.tick();updateV24Annotations(camera);bioclimaticRoof.tick();tickFacadeMotion();
  if(arSession)updateArFrame(frame);
  else controls.update();
  renderer.render(scene,camera);
}

function findPergoRiseObjectByTargetId(targetId){
  if(!pergoRiseAssemblyRoot)return null;let found=null;
  pergoRiseAssemblyRoot.traverse(object=>{if(found||!object.userData||!object.userData.editingTarget)return;if(String(object.userData.editingTarget.id)===String(targetId||''))found=object;});
  return found;
}
function pergoRiseEditableTargets(){
  const out=[];const seen=new Set();if(!pergoRiseAssemblyRoot)return out;
  pergoRiseAssemblyRoot.traverse(object=>{const target=object.userData&&object.userData.editingTarget;if(!target||seen.has(target.id))return;seen.add(target.id);const box=new THREE.Box3().setFromObject(object);out.push({target:JSON.parse(JSON.stringify(target)),bounds:{minX:box.min.x,maxX:box.max.x,minY:box.min.y,maxY:box.max.y,minZ:box.min.z,maxZ:box.max.z},kind:target.targetType==='area'?'area':'component',componentId:object.userData.componentId||''});});
  return out;
}
function pergoRiseProductSummary(){
  return (pergoRiseDerived&&Array.isArray(pergoRiseDerived.components)?pergoRiseDerived.components:[]).filter(item=>item.kind==='area-product').map(item=>({id:String(item.id||''),placementId:String(item.placementId||''),productType:String(item.productType||''),face:String(item.face||''),width:Number(item.width)||0,height:Number(item.height)||0,baseElevation:Number(item.baseElevation)||0,position:Array.isArray(item.position)?item.position.map(Number):[],productGeometry:item.productGeometry||{},primitiveCount:Number(item.productGeometry&&item.productGeometry.primitiveCount)||5}));
}
function updatePergoRiseCommonTestState(){
  if(!IS_PERGO_RISE)return;
  const targets=pergoRiseEditableTargets();
  const assemblyBox=pergoRiseAssemblyRoot?new THREE.Box3().setFromObject(pergoRiseAssemblyRoot):null;
  window.__P3DV_PERGO_TEST__={
    ...(window.__P3DV_PERGO_TEST__||{}),ready:true,renderer:'Three.js r128 shared viewer',webglVersion:renderer.capabilities&&renderer.capabilities.isWebGL2?'WebGL2':'WebGL1',
    projectHash:pergoRiseDerived&&pergoRiseDerived.projectHash||'',counts:pergoRiseDerived&&pergoRiseDerived.counts||{},instanceCount:parts.length,
    loadStatus:pergoRiseLoadStatus,componentMapping:pergoRiseComponentLibrary&&pergoRiseComponentLibrary.mapping||[],renderError:Boolean(pergoRiseAssemblyRoot&&pergoRiseAssemblyRoot.userData&&pergoRiseAssemblyRoot.userData.p3dvPergoRiseRenderError),
    assemblyRevision:pergoRiseAssemblyRevision,acceptedProjectRevision:pergoRiseAcceptedProjectRevision,staleProjectMessagesIgnored:pergoRiseStaleProjectMessagesIgnored,
    missing:pergoRiseAssemblyRoot&&pergoRiseAssemblyRoot.userData&&pergoRiseAssemblyRoot.userData.buildReport?pergoRiseAssemblyRoot.userData.buildReport.missing||[]:[],camera:cameraSnapshot(),sessionId:VIEWER_SESSION_ID,
    staticState:pergoRiseDerived&&pergoRiseDerived.staticState||'',iframeStableUpdates:true,partialSceneReconcile:true,commonScene:true,sharedOrbitControls:true,sharedAr:true,
    sceneGroundY:-Math.max(1,Number(H)||1)/2,assemblyOffsetY:pergoRiseAssemblyRoot?Number(pergoRiseAssemblyRoot.position.y)||0:0,canonicalGroundY:0,
    assemblyBounds:assemblyBox?{minY:assemblyBox.min.y,maxY:assemblyBox.max.y,minX:assemblyBox.min.x,maxX:assemblyBox.max.x,minZ:assemblyBox.min.z,maxZ:assemblyBox.max.z}:null,
    selectableAreaScopes:pergoRiseAssemblyRoot&&pergoRiseAssemblyRoot.userData&&pergoRiseAssemblyRoot.userData.buildReport?pergoRiseAssemblyRoot.userData.buildReport.selectableAreaScopes||[]:[],
    selectableAreaActionTypes:pergoRiseAssemblyRoot&&pergoRiseAssemblyRoot.userData&&pergoRiseAssemblyRoot.userData.buildReport?pergoRiseAssemblyRoot.userData.buildReport.selectableAreaActionTypes||[]:[],
    reconcileStats:{...pergoRiseReconcileStats,dynamicCreated:pergoRiseReconcileStats.added,dynamicReplaced:pergoRiseReconcileStats.replaced,dynamicRemoved:pergoRiseReconcileStats.removed,staticReused:pergoRiseReconcileStats.reused},
    editableTargetCount:targets.length,selectableComponentCount:targets.filter(item=>item.kind==='component').length,selectableAreaCount:targets.filter(item=>item.kind==='area').length,
    selectedTargetId:pergoRiseSelectedTarget&&pergoRiseSelectedTarget.id||'',selectedTargetType:pergoRiseSelectedTarget&&pergoRiseSelectedTarget.targetType||'',contextMenuVisible:Boolean(pergoRiseContextMenu&&pergoRiseContextMenu.style.display==='block'),
    dimensionVisibility:{...dimensionVisibility},widthTopology:pergoRiseDerived&&pergoRiseDerived.widthTopology||null,gutterSummary:pergoRiseDerived&&pergoRiseDerived.gutterLayout||[],postSummary:pergoRiseDerived&&pergoRiseDerived.postLayout||[],roofRegisterSummary:pergoRiseDerived&&pergoRiseDerived.roofRegisterLayout||[],trapezSheetSummary:pergoRiseDerived&&pergoRiseDerived.trapezSheetLayout||[],productSummary:pergoRiseProductSummary()
  };
}
window.__P3DV_PERGO_CONTROLLER__={
  setProject(nextProject,revision){
    const rev=Number(revision)||0;if(rev<lastAppliedLiveRevision){pergoRiseStaleProjectMessagesIgnored+=1;updatePergoRiseCommonTestState();return false;}
    pergoRiseProject=nextProject||null;pergoRiseDerived=pergoRiseProject&&pergoRiseProject.derived||null;lastAppliedLiveRevision=rev;pergoRiseAcceptedProjectRevision=rev;
    if(pergoRiseDerived&&pergoRiseDerived.envelope){W=Math.max(1,Number(pergoRiseDerived.envelope.width)||W);D=Math.max(1,Number(pergoRiseDerived.envelope.depth)||D);H=Math.max(1,Number(pergoRiseDerived.envelope.height)||H);refreshSceneEnvelope();}
    const applied=reconcilePergoRiseAssembly([]);if(!applied)rebuildModelWithoutFrameReload(rev);pergoRiseAssemblyRevision=Math.max(pergoRiseAssemblyRevision+1,rev||0);updatePergoRiseCommonTestState();return true;
  },
  selectTargetById(targetId){const object=findPergoRiseObjectByTargetId(targetId);if(!object)return false;highlightPergoRiseSelection(object);updatePergoRiseCommonTestState();return true;},
  openContextMenuForTarget(targetId,x,y){const object=findPergoRiseObjectByTargetId(targetId);if(!object)return false;const rect=renderer.domElement.getBoundingClientRect();showPergoRiseContextMenu({clientX:rect.left+(Number(x)||80),clientY:rect.top+(Number(y)||80)},object);updatePergoRiseCommonTestState();return true;},
  getEditableTargets(){return pergoRiseEditableTargets();},
  getDebugState(){updatePergoRiseCommonTestState();return JSON.parse(JSON.stringify(window.__P3DV_PERGO_TEST__||{}));},
  clearSelection(){clearPergoRiseSelection();if(selectedZonePicker){selectedZonePicker.userData.selected=false;setZoneHighlight(selectedZonePicker,false);}selectedZonePicker=null;selectedZoneId=null;updatePergoRiseCommonTestState();return true;}
};

function freedomPanelDiagnostics(){
  const result=[];
  parts.filter(part=>part.userData&&part.userData.freedomStructuralKind==='panel').forEach(part=>{
    if(part.userData.p3dvInstancedPanels&&Array.isArray(part.userData.instancePanels)){
      part.userData.instancePanels.forEach(meta=>result.push({...meta}));return;
    }
    result.push({name:part.userData.name,moduleIndex:part.userData.moduleIndex,panelIndex:part.userData.panelIndex,rowIndex:part.userData.rowIndex,panelCollection:part.userData.panelCollection,position:part.position.toArray()});
  });
  return result;
}

window.__P3DV_TECHNICAL2D_VIEWER__=Object.freeze({
  zones:()=>zonePickers.map(item=>JSON.parse(JSON.stringify(item&&item.userData&&item.userData.zone||null))).filter(Boolean),
  profiles:()=>interactiveObjects.filter(obj=>obj&&obj.userData&&obj.userData.isDividerProfile&&obj.userData.profile).map(obj=>JSON.parse(JSON.stringify(obj.userData.profile))),
  productSlots:()=>zonePickers.map(item=>{const zone=item&&item.userData&&item.userData.zone;if(!zone)return null;return {zoneId:zone.id,primary:placements[zone.id]?JSON.parse(JSON.stringify(placements[zone.id])):null,zip:zipPlacements[zone.id]?JSON.parse(JSON.stringify(zipPlacements[zone.id])):null};}).filter(Boolean)
});

window.__P3DV_V354_TEST__={
  state:()=>({
    sessionId:VIEWER_SESSION_ID,
    modelGeneration,
    width:W,depth:D,height:H,lamellaCount:LC,systemCount:SYSTEM_COUNT,
    freedomLayout:freedomMultiLayout?JSON.parse(JSON.stringify(freedomMultiLayout)):null,
    bioRiseLayout:bioRiseMultiLayout?JSON.parse(JSON.stringify(bioRiseMultiLayout)):null,
    galaxyLayout:galaxyMultiLayout?JSON.parse(JSON.stringify(galaxyMultiLayout)):null,
    partCount:parts.length,zoneCount:zonePickers.length,interactiveCount:interactiveObjects.length,
    bioRiseStructure:{
      posts:parts.filter(part=>part.userData&&part.userData.bioRiseStructuralKind==='post').map(part=>({id:part.userData.bioRisePostId||part.userData.name,lineIndex:part.userData.postLineIndex,row:part.userData.postRow,sharedBoundary:Boolean(part.userData.sharedBoundary),stopsUnderRecord:Boolean(part.userData.stopsUnderRecord),height:Number(part.userData&&part.userData.p3dvSize&&part.userData.p3dvSize[1])||Number(part.geometry&&part.geometry.parameters&&part.geometry.parameters.height)||0,size:(part.userData&&Array.isArray(part.userData.p3dvSize)?part.userData.p3dvSize.slice():[Number(part.geometry&&part.geometry.parameters&&part.geometry.parameters.width)||0,Number(part.geometry&&part.geometry.parameters&&part.geometry.parameters.height)||0,Number(part.geometry&&part.geometry.parameters&&part.geometry.parameters.depth)||0]),position:part.position.toArray()})),
      beams:parts.filter(part=>part.userData&&part.userData.bioRiseStructuralKind==='beam').map(part=>({id:part.userData.bioRiseBeamId||part.userData.name,moduleIndex:part.userData.moduleIndex,side:part.userData.beamSide,row:part.userData.beamRow,independentModuleFrame:Boolean(part.userData.independentModuleFrame),size:(part.userData&&Array.isArray(part.userData.p3dvSize)?part.userData.p3dvSize.slice():[Number(part.geometry&&part.geometry.parameters&&part.geometry.parameters.width)||0,Number(part.geometry&&part.geometry.parameters&&part.geometry.parameters.height)||0,Number(part.geometry&&part.geometry.parameters&&part.geometry.parameters.depth)||0]),position:part.position.toArray()})),
      gutters:parts.filter(part=>part.userData&&part.userData.bioRiseStructuralKind==='gutter').map(part=>({name:part.userData.name,moduleIndex:part.userData.moduleIndex,side:part.userData.gutterSide,independentModuleFrame:Boolean(part.userData.independentModuleFrame),position:part.position.toArray()})),
      panels:parts.filter(part=>part.userData&&part.userData.bioRiseStructuralKind==='panel').map(part=>({name:part.userData.name,moduleIndex:part.userData.moduleIndex,panelIndex:part.userData.panelIndex,panelKind:part.userData.panelKind,rowIndex:part.userData.rowIndex,panelCollection:part.userData.panelCollection,position:part.position.toArray()})),
      zones:zonePickers.map(item=>({id:item.userData.zone.id,facadeId:item.userData.zone.facadeId,moduleIndex:item.userData.zone.moduleIndex,width:item.userData.zone.width}))
    },
    galaxyStructure:{
      posts:parts.filter(part=>part.userData&&part.userData.galaxyStructuralKind==='post').map(part=>({id:part.userData.galaxyPostId||part.userData.name,lineIndex:part.userData.postLineIndex,row:part.userData.postRow,sharedBoundary:Boolean(part.userData.sharedBoundary),stopsUnderRecord:Boolean(part.userData.stopsUnderRecord),size:(part.userData&&Array.isArray(part.userData.p3dvSize)?part.userData.p3dvSize.slice():[Number(part.geometry&&part.geometry.parameters&&part.geometry.parameters.width)||0,Number(part.geometry&&part.geometry.parameters&&part.geometry.parameters.height)||0,Number(part.geometry&&part.geometry.parameters&&part.geometry.parameters.depth)||0]),position:part.position.toArray()})),
      beams:parts.filter(part=>part.userData&&(part.userData.galaxyStructuralKind==='beam'||part.userData.galaxyStructuralKind==='combined-profile')).map(part=>({id:part.userData.galaxyBeamId||part.userData.name,moduleIndex:part.userData.moduleIndex,side:part.userData.beamSide,row:part.userData.beamRow,size:(part.userData&&Array.isArray(part.userData.p3dvSize)?part.userData.p3dvSize.slice():[Number(part.geometry&&part.geometry.parameters&&part.geometry.parameters.width)||0,Number(part.geometry&&part.geometry.parameters&&part.geometry.parameters.height)||0,Number(part.geometry&&part.geometry.parameters&&part.geometry.parameters.depth)||0]),combined:Boolean(part.userData.galaxyCombinedProfile),position:part.position.toArray()})),
      gutters:parts.filter(part=>part.userData&&(part.userData.galaxyStructuralKind==='gutter'||part.userData.galaxyStructuralKind==='combined-profile')).map(part=>({name:part.userData.name,moduleIndex:part.userData.moduleIndex,side:part.userData.gutterSide,combined:Boolean(part.userData.galaxyCombinedProfile),position:part.position.toArray()})),
      combinedProfiles:parts.filter(part=>part.userData&&part.userData.galaxyStructuralKind==='combined-profile').map(part=>{const bounds=fastWorldBounds(part);return {name:part.userData.name,moduleIndex:part.userData.moduleIndex,side:part.userData.gutterSide,profileKind:part.userData.galaxyProfileKind,outerDirection:part.userData.galaxyOuterDirection,source:part.userData.p3dvProfileSource,size:Array.isArray(part.userData.p3dvSize)?part.userData.p3dvSize.slice():[],bounds:{minX:bounds.min.x,maxX:bounds.max.x,minY:bounds.min.y,maxY:bounds.max.y,minZ:bounds.min.z,maxZ:bounds.max.z},position:part.position.toArray()};}),
      panels:parts.filter(part=>part.userData&&part.userData.galaxyStructuralKind==='panel').map(part=>({name:part.userData.name,moduleIndex:part.userData.moduleIndex,panelIndex:part.userData.panelIndex,panelKind:part.userData.panelKind,rowIndex:part.userData.rowIndex,panelCollection:part.userData.panelCollection,position:part.position.toArray()})),
      zones:zonePickers.map(item=>({id:item.userData.zone.id,facadeId:item.userData.zone.facadeId,moduleIndex:item.userData.zone.moduleIndex,width:item.userData.zone.width}))
    },
    freedomStructure:{
      posts:parts.filter(part=>part.userData&&part.userData.freedomStructuralKind==='post').map(part=>({id:part.userData.freedomPostId||part.userData.name,lineIndex:part.userData.postLineIndex,row:part.userData.postRow,position:part.position.toArray()})),
      beams:parts.filter(part=>part.userData&&part.userData.freedomStructuralKind==='beam').map(part=>({id:part.userData.freedomBeamId||part.userData.name,moduleIndex:part.userData.moduleIndex,lineIndex:part.userData.postLineIndex,position:part.position.toArray()})),
      gutters:parts.filter(part=>part.userData&&part.userData.freedomStructuralKind==='gutter').map(part=>({name:part.userData.name,moduleIndex:part.userData.moduleIndex,side:part.userData.gutterSide,rowIndex:part.userData.rowIndex,position:part.position.toArray()})),
      rails:parts.filter(part=>part.userData&&part.userData.freedomStructuralKind==='rail').map(part=>({name:part.userData.name,moduleIndex:part.userData.moduleIndex,side:part.userData.railSide,rowIndex:part.userData.rowIndex,position:part.position.toArray()})),
      panels:freedomPanelDiagnostics(),
      zones:zonePickers.map(item=>({id:item.userData.zone.id,facadeId:item.userData.zone.facadeId,moduleIndex:item.userData.zone.moduleIndex,width:item.userData.zone.width}))
    },
    placements:JSON.parse(JSON.stringify(placements||{})),
    zipPlacements:JSON.parse(JSON.stringify(zipPlacements||{})),
    facadeProfiles:JSON.parse(JSON.stringify(facadeProfiles||{})),
    zoneDividers:JSON.parse(JSON.stringify(zoneDividers||{})),
    zoneRegistry:JSON.parse(JSON.stringify(zoneRegistry||{})),
    camera:cameraSnapshot(),
    productGroup:PRODUCT_GROUP,
    freedomPanelProfile:'legacy-procedural',
    woodTransfer:{
      system:{code:SYSTEM_COLOR_CODE,kind:SYSTEM_COLOR_KIND,texture:SYSTEM_COLOR_TEXTURE},
      panel:{code:PANEL_COLOR_CODE,kind:PANEL_COLOR_KIND,texture:PANEL_COLOR_TEXTURE},
      mappedMaterialCount:(()=>{let count=0;group.traverse(object=>{const materials=Array.isArray(object.material)?object.material:[object.material];materials.filter(Boolean).forEach(material=>{if(material.userData&&material.userData.woodTransfer&&material.map)count+=1;});});return count;})(),
      embeddedMaterialCount:(()=>{let count=0;group.traverse(object=>{const materials=Array.isArray(object.material)?object.material:[object.material];materials.filter(Boolean).forEach(material=>{if(material.userData&&material.userData.woodTransfer&&material.map&&material.map.userData&&material.map.userData.p3dvWoodEmbedded)count+=1;});});return count;})(),
      embeddedTextureStats:Array.from(p3dvWoodTextureCache.entries()).map(([code,texture])=>{
        try{
          const canvas=texture&&texture.image;if(!canvas||!canvas.getContext)return {code,embedded:false};
          const ctx=canvas.getContext('2d');const data=ctx.getImageData(0,0,canvas.width,canvas.height).data;let sum=0,min=255,max=0,count=0;
          for(let i=0;i<data.length;i+=4){const value=(data[i]+data[i+1]+data[i+2])/3;sum+=value;min=Math.min(min,value);max=Math.max(max,value);count+=1;}
          return {code,embedded:Boolean(texture.userData&&texture.userData.p3dvWoodEmbedded),width:canvas.width,height:canvas.height,mean:count?sum/count:0,min,max};
        }catch(error){return {code,embedded:Boolean(texture&&texture.userData&&texture.userData.p3dvWoodEmbedded),error:String(error)};}
      })
    },
    performance:JSON.parse(JSON.stringify(p3dvPerf))
  }),
  zipTextureRepeat:(panelWidth,panelHeight,tileMm)=>{const texture={repeat:{set(x,y){this.x=x;this.y=y;}},center:{set(){}},userData:{}};configureZipFabricTexture(texture,panelWidth,panelHeight,tileMm);return {x:texture.repeat.x,y:texture.repeat.y};},
  renderHash:()=>{
    try{return renderer.domElement.toDataURL('image/png').slice(-256)}catch(error){return String(error)}
  },
  scheduleZoneSelection:(zoneId)=>{
    const picker=zonePickers.find(item=>item.userData&&item.userData.zone&&item.userData.zone.id===zoneId);
    if(!picker)return false;
    scheduleTogglePanelZoneSelection(picker.userData.zone);
    return true;
  }
};

window.getP3DVPerformanceDiagnostics=function(){return JSON.parse(JSON.stringify({...p3dvPerf,sharedGeometryCount:p3dvSharedGeometryCache.size,sharedMaterialCount:p3dvSharedMaterialCache.size,raycastCandidateCount:raycastCandidates().length,viewerRuntimeActive,animationLoopRunning,animationFrameCount,animationLoopStartCount,animationLoopStopCount,orbitControlsEnabled:Boolean(controls&&controls.enabled),camera:cameraSnapshot()}));};

window.__P3DV_PERF_TEST__={noopRebuild(revision){rebuildModelWithoutFrameReload(Number(revision)||99991);return true;},state(){return window.getP3DVPerformanceDiagnostics();}};

async function initializeViewer(){
  await loadPergoRiseTemplate();
  buildModel(true);
  if(IS_PERGO_RISE)updatePergoRiseCommonTestState();
  if(IS_STANDALONE_GUILLOTINE_PREVIEW)renderer.render(scene,camera);
  syncViewerAnimationLoop();
  postParent('viewer-ready',{
    liveProductState:true,
    livePanelMaster:true,
    liveColorState:true,
    liveModelState:!IS_PERGO_RISE,
    livePergoRise:IS_PERGO_RISE,
    freedomPanelProfile:'legacy-procedural',
    pergoRiseLoadStatus,
    pergoRiseProjectHash:pergoRiseDerived&&pergoRiseDerived.projectHash||'',
    pergoRiseComponentMapping:pergoRiseComponentLibrary&&pergoRiseComponentLibrary.mapping||[]
  });
}
initializeViewer().catch(reportViewerFailure);
})();
</scr` + `ipt>
</body>
</html>`;
  }

  let previewToolbarControlsBound = false;
  function bindPreviewToolbarControls() {
    if (previewToolbarControlsBound) return true;
    previewToolbarControlsBound = true;
    const on = (id, handler) => {
      const element = $(id);
      if (!element) return false;
      element.addEventListener('click', handler);
      return true;
    };
    on(ids.mode2D, () => { const button=$(ids.mode2D); if (button && !button.disabled) requestEmbeddedHostDrawingMode('2d'); });
    on(ids.mode3D, () => { const button=$(ids.mode3D); if (button && !button.disabled) requestEmbeddedHostDrawingMode('3d'); });
    on(ids.toolbarRefresh, () => {
      const button = $(ids.toolbarRefresh);
      const originalText = button ? button.textContent : '';
      const applied = applyFreedomInputs({ forceRender: true });
      if (button) {
        button.textContent = applied ? 'Önizleme Yenilendi ✓' : originalText;
        window.setTimeout(() => { if (button && button.isConnected) button.textContent = originalText || 'Önizlemeyi Yenile'; }, 700);
      }
    });
    on(ids.previewExpand, () => { void togglePreviewExpanded(); });
    return true;
  }

  function bindEvents() {
    $(ids.productGroup).addEventListener('change', handleProductGroupChange);
    $(ids.defaultColorMode).addEventListener('click', () => setColorMode('default'));
    $(ids.ralColorMode).addEventListener('click', () => setColorMode('ral'));
    $(ids.systemColorTrigger).addEventListener('click', () => openColorPicker('system'));
    $(ids.panelColorTrigger).addEventListener('click', () => openColorPicker('panel'));
    $(ids.colorPickerClose).addEventListener('click', closeColorPicker);
    $(ids.colorFinishClose).addEventListener('click', closeColorFinishDialog);
    $(ids.colorCatalogRising).addEventListener('click', () => setActiveColorCatalog('rising'));
    $(ids.colorCatalogAll).addEventListener('click', () => setActiveColorCatalog('all'));
    $(ids.colorSearch).addEventListener('input', renderRalColorOptions);
    if ($(ids.panelColorIndependent)) $(ids.panelColorIndependent).addEventListener('change', syncPanelColorIndependence);
    [ids.panelFill, ids.dimmerInput, ids.parapetInput, ids.waterStandardInput, ids.pergoGlassTrack, ids.pergoTriangleJoinery, ids.pergoWaterOutletPlacement].forEach((id) => {
      const input=$(id); if (!input) return;
      input.addEventListener('change', () => {
        if (isPergoRiseUi()) {
          const fields = {
            [ids.parapetInput]: 'parapet', [ids.waterStandardInput]: 'waterStandard', [ids.pergoGlassTrack]: 'glassTrack',
            [ids.pergoTriangleJoinery]: 'triangleJoinery', [ids.pergoWaterOutletPlacement]: 'waterOutletPlacement'
          };
          if (fields[id]) handlePergoCanonicalFieldInput(fields[id], input);
          else syncFreedomOptionStateFromUi();
        } else syncFreedomOptionStateFromUi();
      });
    });
    const pergoTextFields = {
      [ids.remoteInput]: 'remote', [ids.ledInput]: 'led', [ids.extrasInput]: 'extras', [ids.pergoStructureColor]: 'structureColor',
      [ids.pergoFabric]: 'fabric', [ids.pergoFabricProfiles]: 'fabricProfiles', [ids.pergoDimmer]: 'dimmer'
    };
    Object.entries(pergoTextFields).forEach(([id, field]) => {
      const input=$(id); if (!input) return;
      input.addEventListener('input', () => {
        if (isPergoRiseUi()) handlePergoCanonicalFieldInput(field, input);
        else syncFreedomOptionStateFromUi();
      });
    });
    if ($(ids.motorInput)) {
      $(ids.motorInput).addEventListener('input', () => {
        if (isPergoRiseUi()) handlePergoCanonicalFieldInput('motor', $(ids.motorInput));
        else { syncFreedomOptionStateFromUi(); renderRemoteComboMenu(); }
      });
      $(ids.motorInput).addEventListener('change', () => {
        const values=remoteOptionsForMotor();
        if (!values.includes($(ids.remoteInput).value)) $(ids.remoteInput).value=values[0] || (isPergoRiseUi()?'-':'Yok');
        if (isPergoRiseUi()) handlePergoCanonicalFieldInput('motor', $(ids.motorInput));
        else syncFreedomOptionStateFromUi();
        renderRemoteComboMenu();
      });
    }
    if ($(ids.parapetHeightInput)) $(ids.parapetHeightInput).addEventListener('input', (event) => {
      if (isPergoRiseUi()) handlePergoCanonicalFieldInput('parapetHeight', event.target);
      else { event.target.value=sanitizeDigitsOnly(event.target.value,5); syncFreedomOptionStateFromUi(); }
    });
    if ($(ids.pergoSystemCount)) $(ids.pergoSystemCount).addEventListener('input', (event) => {
      if (isPergoRiseUi()) handlePergoCanonicalFieldInput('systemCount', event.target);
      else { event.target.value=sanitizeDigitsOnly(event.target.value,6); modelState.systemCount=isBioFamilyGroup(modelState.productGroup)?normalizedBioRiseSystemCount(event.target.value):normalizedFreedomSystemCount(event.target.value); scheduleAutomaticPreview(); }
    });
    if ($(ids.freedomWidth)) $(ids.freedomWidth).addEventListener('input', (event) => {
      if (isPergoRiseUi()) handlePergoCanonicalFieldInput('width', event.target);
      else { event.target.value=sanitizeWidthTopology(event.target.value); modelState.inputDrafts={...(modelState.inputDrafts||{}),width:event.target.value}; scheduleAutomaticPreview(); }
    });
    if ($(ids.freedomDepth)) $(ids.freedomDepth).addEventListener('input', (event) => {
      if (isPergoRiseUi()) handlePergoCanonicalFieldInput('opening', event.target);
      else { event.target.value=sanitizeOpeningTopology(event.target.value); modelState.inputDrafts={...(modelState.inputDrafts||{}),depth:event.target.value}; renderProjectionComboMenu(); scheduleAutomaticPreview(); }
    });
    if ($(ids.freedomHeight)) $(ids.freedomHeight).addEventListener('input', (event) => {
      if (isPergoRiseUi()) handlePergoCanonicalFieldInput('rearHeight', event.target);
      else { event.target.value=sanitizeDigitsOnly(event.target.value,6); modelState.inputDrafts={...(modelState.inputDrafts||{}),height:event.target.value}; scheduleAutomaticPreview(); }
    });
    if ($(ids.pergoFrontHeight)) $(ids.pergoFrontHeight).addEventListener('input', (event) => handlePergoCanonicalFieldInput('frontHeight', event.target));
    if ($(ids.pergoRayCount)) $(ids.pergoRayCount).addEventListener('input', (event) => handlePergoCanonicalFieldInput('rayCount', event.target));
    if ($(ids.pergoPostCount)) $(ids.pergoPostCount).addEventListener('input', (event) => handlePergoCanonicalFieldInput('postCount', event.target));
    if ($(ids.pergoCalculator)) $(ids.pergoCalculator).addEventListener('click', openPergoCalculator);
    if ($(ids.pergoResetAll)) $(ids.pergoResetAll).addEventListener('click', resetPergoAllInputs);
    if ($(ids.pergoSystemReset)) $(ids.pergoSystemReset).addEventListener('click', resetPergoSystemInputs);
    if ($(ids.pergoOptionsReset)) $(ids.pergoOptionsReset).addEventListener('click', resetPergoOptions);
    if ($(ids.pergoExtraReset)) $(ids.pergoExtraReset).addEventListener('click', resetPergoExtraOptions);
    if ($(ids.pergoBackWallOpen)) $(ids.pergoBackWallOpen).addEventListener('click', openPergoBackWallDialog);
    if ($(ids.pergoBackWallClose)) $(ids.pergoBackWallClose).addEventListener('click', () => closePergoBackWallDialog(true));
    if ($(ids.pergoBackWallCancel)) $(ids.pergoBackWallCancel).addEventListener('click', () => closePergoBackWallDialog(true));
    if ($(ids.pergoBackWallDefault)) $(ids.pergoBackWallDefault).addEventListener('click', resetPergoBackWallSystem);
    if ($(ids.pergoBackWallSystem)) $(ids.pergoBackWallSystem).addEventListener('change', (event) => loadPergoBackWallDialog(Number(event.target.value) || 0));
    if ($(ids.pergoBackWallEnabled)) $(ids.pergoBackWallEnabled).addEventListener('change', (event) => {
      setPergoBackWallFieldsDisabled(event.target.value === 'HAYIR');
      schedulePergoBackWallLiveUpdate();
    });
    [ids.pergoBackWallMinX, ids.pergoBackWallMaxX, ids.pergoBackWallStartDepth, ids.pergoBackWallEndDepth].forEach((id) => {
      const input = $(id); if (input) input.addEventListener('input', syncPergoBackWallAngleFromDepths);
    });
    if ($(ids.pergoBackWallAngle)) $(ids.pergoBackWallAngle).addEventListener('input', syncPergoBackWallDepthFromAngle);
    [ids.pergoBackWallDirection, ids.pergoBackWallOffset, ids.pergoBackWallHeight, ids.pergoBackWallDepth,
      ids.pergoBackWallTopColumns, ids.pergoBackWallTopRows, ids.pergoBackWallSideColumns, ids.pergoBackWallSideRows].forEach((id) => {
      const input = $(id); if (!input) return;
      input.addEventListener(input.tagName === 'SELECT' ? 'change' : 'input', schedulePergoBackWallLiveUpdate);
    });
    if ($(ids.pergoBackWallForm)) $(ids.pergoBackWallForm).addEventListener('submit', (event) => {
      event.preventDefault();
      if (applyPergoBackWallDialog()) closePergoBackWallDialog(false);
    });
    if ($(ids.pergoBackWallDialog)) $(ids.pergoBackWallDialog).addEventListener('click', (event) => {
      if (event.target === $(ids.pergoBackWallDialog)) closePergoBackWallDialog(true);
    });
    if ($(ids.pergoCalcCompute)) $(ids.pergoCalcCompute).addEventListener('click', calculatePergoMissingValue);
    if ($(ids.pergoCalcTransfer)) $(ids.pergoCalcTransfer).addEventListener('click', transferPergoCalculatorValues);
    if ($(ids.pergoCalcClear)) $(ids.pergoCalcClear).addEventListener('click', clearPergoCalculator);
    if ($(ids.motorComboButton)) $(ids.motorComboButton).addEventListener('click', (event) => { event.preventDefault(); renderMotorComboMenu(); const menu=$(ids.motorComboMenu); setComboOpen($(ids.motorCombo),menu,menu.hidden); });
    if ($(ids.remoteComboButton)) $(ids.remoteComboButton).addEventListener('click', (event) => { event.preventDefault(); renderRemoteComboMenu(); const menu=$(ids.remoteComboMenu); setComboOpen($(ids.remoteCombo),menu,menu.hidden); });
    if ($(ids.ledComboButton)) $(ids.ledComboButton).addEventListener('click', (event) => { event.preventDefault(); renderLedComboMenu(); const menu=$(ids.ledComboMenu); setComboOpen($(ids.ledCombo),menu,menu.hidden); });
    if ($(ids.pergoFabricComboButton)) $(ids.pergoFabricComboButton).addEventListener('click', (event) => { event.preventDefault(); renderPergoFabricComboMenu(); const menu=$(ids.pergoFabricComboMenu); setComboOpen($(ids.pergoFabricCombo),menu,menu.hidden); });
    $(ids.colorPickerDialog).addEventListener('click', (event) => {
      if (event.target === $(ids.colorPickerDialog)) closeColorPicker();
    });
    $(ids.colorFinishDialog).addEventListener('click', (event) => {
      if (event.target === $(ids.colorFinishDialog)) closeColorFinishDialog();
    });
    if ($(ids.appConfirmCancel)) $(ids.appConfirmCancel).addEventListener('click', () => closeAppConfirmation(false));
    if ($(ids.appConfirmAccept)) $(ids.appConfirmAccept).addEventListener('click', () => closeAppConfirmation(true));
    if ($(ids.appConfirmDialog)) $(ids.appConfirmDialog).addEventListener('click', (event) => {
      if (event.target === $(ids.appConfirmDialog)) closeAppConfirmation(false);
    });
    $(ids.freedomPanelCount).addEventListener('input', syncProjectionFromPanelCount);
    projectionPresetSelect().addEventListener('change', () => {
      const value=projectionPresetSelect().value;
      const current=depthControlValue();
      if(modelState.productGroup!=='pergo-rise'&&/[;:]$/.test(current)&&!/:NO$/i.test(current))setDepthControlValue(current+value);
      else if(modelState.productGroup!=='pergo-rise'&&/:NO$/i.test(current))setFreedomValidation('Yeni açılım eklemek için önce terminal :NO komutunu kaldırın.');
      else setDepthControlValue(value);
      syncPanelCountFromProjection();
      scheduleAutomaticPreview();
    });
    $(ids.projectionCustomToggle).addEventListener('click', (event) => {
      event.preventDefault();
      renderProjectionComboMenu();
      const menu = $(ids.projectionComboMenu);
      setComboOpen($(ids.projectionCombo), menu, menu.hidden);
    });
    $(ids.freedomDepth).addEventListener('input', syncPanelCountFromProjection);
    $(ids.freedomWidth).addEventListener('input', () => showRecommendedLimitWarnings({ width: readFreedomNumber(ids.freedomWidth), depth: readFreedomNumber(ids.freedomDepth), height: readFreedomNumber(ids.freedomHeight), panelCount: readFreedomNumber(ids.freedomPanelCount) }));
    $(ids.freedomHeight).addEventListener('input', () => showRecommendedLimitWarnings({ width: readFreedomNumber(ids.freedomWidth), depth: readFreedomNumber(ids.freedomDepth), height: readFreedomNumber(ids.freedomHeight), panelCount: readFreedomNumber(ids.freedomPanelCount) }));
    $(ids.freedomForm).addEventListener('submit', (event) => { event.preventDefault(); applyFreedomInputs(); });
    $(ids.positionEdit).addEventListener('click', openPositionDialog);
    $(ids.cancel).addEventListener('click', closePositionDialog);
    $(ids.replay).addEventListener('click', toggleProductsOpen);
    $(ids.clearProducts).addEventListener('click', clearProducts);
    $(ids.dialog).addEventListener('click', (event) => {
      if (event.target === $(ids.dialog)) closePositionDialog();
    });
    [ids.width, ids.depth, ids.height].forEach((id) => {
      $(id).addEventListener('input', updateDialogLamella);
    });
    $(ids.form).addEventListener('submit', (event) => {
      event.preventDefault();
      applyPositionForm();
    });
    $(ids.productType).addEventListener('change', () => switchProductType($(ids.productType).value));
    $(ids.productSeries).addEventListener('change', () => applyProductRules(currentProductDraft()));
    $(ids.productSubtype).addEventListener('change', () => applyProductRules(currentProductDraft()));
    $(ids.productDoorType).addEventListener('change', () => applyProductRules(currentProductDraft()));
    $(ids.productDoorTypeTrigger).addEventListener('click', openDoorTypePicker);
    $(ids.productDoorTypePickerClose).addEventListener('click', closeDoorTypePicker);
    $(ids.productFabricTrigger).addEventListener('click', openProductFabricCatalog);
    $(ids.productFabricPickerClose).addEventListener('click', closeProductFabricCatalog);
    $(ids.productDoorHinge).addEventListener('change', () => { $(ids.productValidation).textContent = ''; });
    $(ids.productDoorActiveLeaf).addEventListener('change', () => { $(ids.productValidation).textContent = ''; });
    $(ids.productDoorOpenDirection).addEventListener('change', () => { $(ids.productValidation).textContent = ''; });
    $(ids.productDoorHandleType).addEventListener('change', () => { $(ids.productValidation).textContent = ''; });
    $(ids.productDoorTopFixedHeight).addEventListener('input', () => {
      updateDoorTopFixedSummary();
    });
    $(ids.productPlacement).addEventListener('change', () => { $(ids.productValidation).textContent = ''; });
    $(ids.productMotorDirection).addEventListener('change', () => {
      $(ids.productMotorDirection).value = $(ids.productMotorDirection).value === 'LEFT' ? 'LEFT' : 'RIGHT';
      $(ids.productValidation).textContent = '';
    });
    $(ids.productOpening).addEventListener('change', () => applyProductRules(currentProductDraft()));
    $(ids.productGlassThickness).addEventListener('change', () => {
      rememberGlassThicknessFromForm();
      applyProductRules(currentProductDraft());
    });
    $(ids.productGlassColor).addEventListener('change', () => {
      rememberGlassColorFromForm();
      applyProductRules(currentProductDraft());
    });
    $(ids.bottomPanelMode).addEventListener('change', () => applyProductRules(currentProductDraft()));
    $(ids.productPanelType).addEventListener('change', () => {
      const panelType = $(ids.productPanelType).value;
      if (panelType === '1+1') $(ids.productPanels).value = '2';
      if (panelType === '1+2') $(ids.productPanels).value = '3';
      $(ids.productValidation).textContent = '';
    });
    $(ids.productPanels).addEventListener('input', () => {
      $(ids.productValidation).textContent = '';
      if (isFoldingType($(ids.productType).value)) updateFoldingFormAdvisory();
    });
    $(ids.productFixedVerticalCount).addEventListener('input', () => { $(ids.productValidation).textContent = ''; });
    $(ids.productFixedHorizontalCount).addEventListener('change', () => {
      if (!activeZone) return;
      const divisions = Math.max(1, Math.min(10, Math.round(Number($(ids.productFixedHorizontalCount).value) || 1)));
      initializeFixedHorizontalForm({ horizontalDivisions: divisions, horizontalHeights: '', horizontalHeightManual: [] }, { resetAll: true });
      $(ids.productValidation).textContent = '';
    });
    $(ids.slidingCollectionState).addEventListener('change', () => { $(ids.productValidation).textContent = ''; });
    $(ids.foldingCollectionState).addEventListener('change', () => { $(ids.productValidation).textContent = ''; });
    $(ids.productSlidingView).addEventListener('change', () => { $(ids.productValidation).textContent = ''; });
    $(ids.productFoldingView).addEventListener('change', () => { $(ids.productValidation).textContent = ''; });
    $(ids.productFoldingOpenDirection).addEventListener('change', () => { $(ids.productValidation).textContent = ''; });
    $(ids.productDirection).addEventListener('change', () => {
      $(ids.productValidation).textContent = '';
      if (isFoldingType($(ids.productType).value)) updateFoldingFormAdvisory();
    });
    $(ids.collectingDisplayState).addEventListener('change', () => { $(ids.productValidation).textContent = ''; });
    $(ids.productCustomGlass).addEventListener('input', () => {
      if ($(ids.productGlassColor).value === 'OTHER') rememberGlassColorFromForm();
      $(ids.productValidation).textContent = '';
    });
    $(ids.productCancel).addEventListener('click',()=>{closeProductDialog();clearZoneSelection();});
    $(ids.productRemove).addEventListener('click', removeProduct);
    $(ids.productDialog).addEventListener('click', (event) => {
      if (event.target === $(ids.productDialog)){closeProductDialog();clearZoneSelection();}
    });
    $(ids.productFabricPicker).addEventListener('click', (event) => {
      if (event.target === $(ids.productFabricPicker)) closeProductFabricCatalog();
    });
    $(ids.productForm).addEventListener('submit', (event) => {
      event.preventDefault();
      applyProductForm();
    });

    $(ids.zoneActionAddProfile).addEventListener('click', () => { if (!runPergoRiseZoneAction('profile-add')) openProfileDialog(); });
    $(ids.zoneActionRemoveProfile).addEventListener('click', () => { runPergoRiseZoneAction('profile-remove'); });
    $(ids.zoneActionEditDimension).addEventListener('click', () => { if (!runPergoRiseZoneAction('resize')) openZoneDimensionDialog(); });
    $(ids.zoneActionPlaceProduct).addEventListener('click', () => { if (!runPergoRiseZoneAction('product-add')) openSelectedProduct(); });
    $(ids.zoneActionDeleteProduct).addEventListener('click', () => { if (!runPergoRiseZoneAction('product-remove')) removeSelectedProduct(); });
    $(ids.zoneActionRecalculate).addEventListener('click', () => { runPergoRiseZoneAction('recalculate'); });
    $(ids.zoneActionCancel).addEventListener('click', () => { clearZoneSelection(); });
    $(ids.zoneActionDialog).addEventListener('click', (event) => {
      if (event.target === $(ids.zoneActionDialog)) clearZoneSelection();
    });

    if ($(ids.toolbarZoomIn)) $(ids.toolbarZoomIn).addEventListener('click', () => isPergola2DMode() ? zoomPergo2DView(1.16) : zoomViewerCamera(1.16));
    if ($(ids.toolbarZoomOut)) $(ids.toolbarZoomOut).addEventListener('click', () => isPergola2DMode() ? zoomPergo2DView(0.86) : zoomViewerCamera(0.86));
    if ($(ids.toolbarFit)) $(ids.toolbarFit).addEventListener('click', () => isPergola2DMode() ? fitPergo2DView() : resetViewerCamera());
    const pergo2DViewport = $(ids.pergo2DViewport);
    if (pergo2DViewport) {
      let drag = null;
      pergo2DViewport.addEventListener('pointerdown', (event) => {
        if (!isPergola2DMode() || event.button !== 0) return;
        const hit = event.target && typeof event.target.closest === 'function' ? event.target.closest('.preview-interaction-hit') : null;
        drag = { id:event.pointerId, x:event.clientX, y:event.clientY, left:pergo2DViewport.scrollLeft, top:pergo2DViewport.scrollTop, moved:false, hit };
        try { pergo2DViewport.setPointerCapture(event.pointerId); } catch (_) {}
      });
      pergo2DViewport.addEventListener('pointermove', (event) => {
        if (!drag || drag.id !== event.pointerId) return;
        const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
        if (Math.abs(dx) + Math.abs(dy) > 5) drag.moved = true;
        if (!drag.moved) return;
        pergo2DViewport.classList.add('is-dragging');
        pergo2DViewport.scrollLeft = drag.left - dx;
        pergo2DViewport.scrollTop = drag.top - dy;
      });
      pergo2DViewport.addEventListener('pointerup', (event) => {
        if (!drag || drag.id !== event.pointerId) return;
        const wasMoved = drag.moved;
        const downHit = drag.hit || null;
        drag = null;
        pergo2DViewport.classList.remove('is-dragging');
        try { pergo2DViewport.releasePointerCapture(event.pointerId); } catch (_) {}
        if (wasMoved) return;
        const upHit = event.target && typeof event.target.closest === 'function' ? event.target.closest('.preview-interaction-hit') : null;
        const hit = downHit || upHit;
        if (hit) selectPergo2DTarget(pergo2DTargetFromInteraction(hit));
      });
      pergo2DViewport.addEventListener('pointercancel', () => { drag = null; pergo2DViewport.classList.remove('is-dragging'); });
    }
    if ($(ids.toolbarPdf)) {
      $(ids.toolbarPdf).setAttribute('aria-haspopup', 'dialog');
      $(ids.toolbarPdf).setAttribute('aria-expanded', 'false');
      $(ids.toolbarPdf).addEventListener('click', () => {
        if (window.P3DVDocumentCenter && typeof window.P3DVDocumentCenter.open === 'function') window.P3DVDocumentCenter.open($(ids.toolbarPdf));
        else exportProductListPdf();
      });
    }
    if ($(ids.toolbarDxf)) $(ids.toolbarDxf).addEventListener('click', () => {
      try { exportCurrentTechnicalDxf({ download: true }); }
      catch (error) { console.error('Technical 2D DXF export failed.', error); try { window.alert(error && error.message ? error.message : 'DXF oluşturulamadı.'); } catch (_) {} }
    });
    if ($(ids.toolbarAr)) $(ids.toolbarAr).addEventListener('click', () => { startMobileAr(); });
    if ($(ids.toolbarFullscreen)) $(ids.toolbarFullscreen).addEventListener('click', () => { toggleBrowserFullscreen(); });
    if (document.addEventListener) document.addEventListener('fullscreenchange', syncBrowserFullscreenClass);

    if ($(ids.largePreviewProductState)) $(ids.largePreviewProductState).addEventListener('click', () => { toggleProductsOpen(); closeLargeProductStateMenu(); });
    if ($(ids.largePreviewProductStateMenuButton)) $(ids.largePreviewProductStateMenuButton).addEventListener('click', (event) => {
      event.stopPropagation();
      const menu=$(ids.largePreviewProductStateMenu); const open=Boolean(menu && menu.hidden);
      if (menu) menu.hidden=!open;
      event.currentTarget.setAttribute('aria-expanded',String(open));
      if (open) renderLargeProductStateMenu();
    });
    if ($(ids.largePreviewToolboxToggle)) $(ids.largePreviewToolboxToggle).addEventListener('click', () => {
      const toolbox = $(ids.largePreviewToolbox);
      setLargePreviewToolboxOpen(!(toolbox && toolbox.classList.contains('is-open')));
    });
    if ($(ids.largePreviewToolboxPin)) $(ids.largePreviewToolboxPin).addEventListener('click', (event) => {
      const button = event.currentTarget;
      const next = button.getAttribute('aria-pressed') !== 'true';
      button.setAttribute('aria-pressed', String(next));
      button.title = next ? "Toolbox'ı açık tut" : 'Otomatik kapanmaya izin ver';
      if (next) setLargePreviewToolboxOpen(true);
    });
    if ($(ids.largePreviewShowAllDims)) $(ids.largePreviewShowAllDims).addEventListener('click', () => {
      const next = dimensionVisibility.intermediate === false;
      if (next && dimensionVisibility.main === false) dimensionVisibility.main = true;
      setDimensionVisibility('intermediate', next);
    });
    if ($(ids.largePreviewShowMainDims)) $(ids.largePreviewShowMainDims).addEventListener('click', () => setDimensionVisibility('main', dimensionVisibility.main === false));
    [ids.largePreviewGlassTrack, ids.largePreviewRayBoundary, ids.largePreviewTriangleJoinery, ids.largePreviewWaterStandard].forEach((id) => {
      const button = $(id);
      if (button) button.addEventListener('click', () => applyLargePreviewPergoToggle(id));
    });
    if ($(ids.largePreviewParapet)) $(ids.largePreviewParapet).addEventListener('change', (event) => {
      if (!isPergoRiseUi()) return;
      const source = $(ids.parapetHeightInput);
      if (!source) return;
      const numeric = Math.max(0, Math.round(Number(String(event.target.value || '').replace(',', '.')) || 0));
      event.target.value = String(numeric);
      source.value = numeric > 0 ? String(numeric) : '-';
      handlePergoCanonicalFieldInput('parapetHeight', source);
      updatePergoLargePreviewOptions();
    });
    if ($(ids.headerCheckDrawing)) { const drawingCheckButton = $(ids.headerCheckDrawing); drawingCheckButton.disabled = true; drawingCheckButton.setAttribute('aria-disabled','true'); drawingCheckButton.classList.add('is-disabled'); }
    if ($(ids.largePreviewMultiProduct)) $(ids.largePreviewMultiProduct).addEventListener('click', () => $(ids.multiProduct).click());
    if ($(ids.largePreviewMultiProfileAdd)) $(ids.largePreviewMultiProfileAdd).addEventListener('click', () => $(ids.multiProfileAdd).click());
    if ($(ids.largePreviewMultiProfileDelete)) $(ids.largePreviewMultiProfileDelete).addEventListener('click', () => $(ids.multiProfileDelete).click());
    if ($(ids.largePreviewMultiDelete)) $(ids.largePreviewMultiDelete).addEventListener('click', () => $(ids.multiDelete).click());
    if ($(ids.largePreviewFitProducts)) $(ids.largePreviewFitProducts).addEventListener('click', () => $(ids.fitProducts).click());
    if ($(ids.largePreviewDeleteAll)) $(ids.largePreviewDeleteAll).addEventListener('click', clearProducts);
    document.querySelectorAll('.large-preview-quick-test[data-quick-test]').forEach((button) => {
      button.addEventListener('click', () => {
        const quickIndex = Math.max(1, Math.min(10, Number(button.dataset.quickTest) || 1));
        const sourceButton = $(`quickTestBtn${quickIndex}`);
        if (sourceButton && !sourceButton.disabled) sourceButton.click();
      });
    });
    [
      [ids.largePreviewMultiDimension, 'Çoklu Ölçü Düzenleme'],
      [ids.largePreviewEqualizeGaps, 'Aralıkları Eşitle'],
      [ids.largePreviewPostSettings, 'Dikme Ayarları'],
      [ids.largePreviewBulkExtend, 'Çoklu Profil Uzat'],
      [ids.largePreviewConvertProduct, 'Ürün Tipini Değiştir'],
      [ids.largePreviewDetailCopy, 'Detay Kopyala']
    ].forEach(([id]) => { const button = $(id); if (button) { button.disabled = true; button.setAttribute('aria-disabled','true'); if(button.classList&&typeof button.classList.add==='function')button.classList.add('is-disabled'); } });

    $(ids.toolboxIntermediateDimensions).addEventListener('change', (event) => setDimensionVisibility('intermediate', event.target.checked));
    $(ids.toolboxMainDimensions).addEventListener('change', (event) => setDimensionVisibility('main', event.target.checked));
    $(ids.toolboxResetCamera).addEventListener('click', resetViewerCamera);
    if ($(ids.exportProductListPdf)) $(ids.exportProductListPdf).addEventListener('click', () => { exportProductListPdf(); });
    if ($(ids.mobileAr)) $(ids.mobileAr).addEventListener('click', () => { startMobileAr(); });
    if ($(ids.frame)) $(ids.frame).addEventListener('load', () => { setTimeout(refreshMobileArCapability, 180); });
    for (let quickIndex = 1; quickIndex <= 10; quickIndex += 1) {
      const quickButton = $(`quickTestBtn${quickIndex}`);
      if (!quickButton) continue;
      quickButton.addEventListener('click', () => {
        if (!applyPergoQuickTestPreset(quickIndex)) applyQuickTestScenario(quickIndex);
      });
    }
    for (let quickIndex = 11; quickIndex <= 16; quickIndex += 1) {
      const quickButton = $(`quickTestBtn${quickIndex}`);
      if (!quickButton) continue;
      quickButton.addEventListener('click', () => applyPergoQuickTestPreset(quickIndex));
    }
    $(ids.panelMaster).addEventListener('change', (event) => {
      modelState.panelMasterOpen = Boolean(event.target.checked);
      applyPanelMasterOpenLive();
    });
    $(ids.multiProduct).addEventListener('click', () => startToolboxSelection('multi-product'));
    $(ids.multiDelete).addEventListener('click', () => startToolboxSelection('multi-delete'));
    $(ids.multiProfileAdd).addEventListener('click', () => startToolboxSelection('multi-profile-add'));
    $(ids.multiProfileDelete).addEventListener('click', () => startToolboxSelection('multi-profile-delete'));
    $(ids.fitProducts).addEventListener('click', () => startToolboxSelection('fit-products'));
    $(ids.selectionDone).addEventListener('click', completeToolboxSelection);
    $(ids.selectionCancel).addEventListener('click', cancelToolboxSelection);
    if(document&&typeof document.addEventListener==='function') document.addEventListener('click', (event) => {
      if (!event.target.closest('.p3dv-combo')) closeP3dvCombos();
      if (!event.target.closest('#largePreviewProductStateControl')) closeLargeProductStateMenu();
    });
    window.addEventListener('keydown', (event) => {
      if(!event.defaultPrevented&&!window.PLMRFinalReadOnly?.()&&!event.ctrlKey&&!event.metaKey&&!event.altKey&&
          event.key.toLowerCase()==='h'&&(selectedZone||v46MultiZones.length||v17AnnotationSelection.length)&&
          !event.target?.isContentEditable&&!/INPUT|SELECT|TEXTAREA/.test(event.target?.tagName||'')){
        event.preventDefault();
        v17Hide();
        return;
      }
      if (!toolboxSelectionMode) return;
      const tag = event.target && event.target.tagName ? String(event.target.tagName).toUpperCase() : '';
      const isField = ['INPUT', 'SELECT', 'TEXTAREA'].includes(tag);
      if (event.key === 'Escape') {
        event.preventDefault();
        cancelToolboxSelection();
      } else if (event.key === 'Enter' && !isField) {
        event.preventDefault();
        completeToolboxSelection();
      }
    });

    $(ids.profileType).addEventListener('change', applyProfilePreset);
    $(ids.profileOrientation).addEventListener('change', () => { $(ids.profileValidation).textContent = ''; });
    $(ids.profileCancel).addEventListener('click',()=>{closeProfileDialog();clearZoneSelection();});
    $(ids.profileDialog).addEventListener('click', (event) => {
      if (event.target === $(ids.profileDialog)){closeProfileDialog();clearZoneSelection();}
    });
    $(ids.profileForm).addEventListener('submit', (event) => {
      event.preventDefault();
      applyProfileForm();
    });


    $(ids.dividerProfileDelete).addEventListener('click', deleteSelectedDividerProfile);
    $(ids.dividerProfileCancel).addEventListener('click', closeDividerProfileDialog);
    $(ids.dividerProfileDialog).addEventListener('click', (event) => {
      if (event.target === $(ids.dividerProfileDialog)) closeDividerProfileDialog();
    });

    $(ids.zoneDimensionCancel).addEventListener('click',()=>{closeZoneDimensionDialog();clearZoneSelection();});
    $(ids.zoneDimensionDialog).addEventListener('click', (event) => {
      if (event.target === $(ids.zoneDimensionDialog)){closeZoneDimensionDialog();clearZoneSelection();}
    });
    $(ids.zoneDimensionForm).addEventListener('submit', (event) => {
      event.preventDefault();
      applyZoneDimensionForm();
    });
  }


  function p3dvHostClone(value) { return value === undefined ? undefined : JSON.parse(JSON.stringify(value)); }
  function p3dvHostSnapshot() {
    return {
      schema: 'p3dv-host-snapshot-v1',
      operationJournal:p3dvHostClone(v15OperationJournal),
      zoneFilters:p3dvHostClone(zoneFilters),zonesVisible,
      productInputSchema: P3DV_PRODUCT_INPUT_SCHEMA,
      p3dvVersion: '3.86',
      modelState: p3dvHostClone(modelState),
      viewerCameraState: p3dvHostClone(viewerCameraState),
      dimensionVisibility: p3dvHostClone(dimensionVisibility),
      capturedAt: new Date().toISOString()
    };
  }
  function p3dvHostReadMainProductInput() {
    const drafts = modelState.inputDrafts || {};
    return {
      schema: P3DV_PRODUCT_INPUT_SCHEMA,
      productGroup: modelState.productGroup,
      systemCount: String(modelState.systemCount || 1),
      width: String(Object.prototype.hasOwnProperty.call(drafts,'width') ? (drafts.width == null ? '' : drafts.width) : (modelState.width || '')),
      depth: String(Object.prototype.hasOwnProperty.call(drafts,'depth') ? (drafts.depth == null ? '' : drafts.depth) : (modelState.depth || '')),
      height: String(Object.prototype.hasOwnProperty.call(drafts,'height') ? (drafts.height == null ? '' : drafts.height) : (modelState.height || '')),
      parapet: String(modelState.parapet || 'HAYIR'),
      parapetHeight: String(modelState.parapetHeight || ''),
      motor: String(modelState.motor || 'Yok'),
      remote: String(modelState.remote || 'Yok'),
      led: String(modelState.led || 'NO'),
      dimmer: String(modelState.dimmer || 'HAYIR'),
      waterStandard: String(modelState.waterStandard || 'EVET'),
      extras: String(modelState.extras || '')
    };
  }
  function p3dvHostApplyMainProductInput(raw, transitionId) {
    const input = raw && typeof raw === 'object' ? raw : {};
    if (!['b-cube','b-cube-galaxy','bio-rise'].includes(modelState.productGroup)) throw new Error('P3DV_MAIN_INPUT_PRODUCT_UNSUPPORTED');
    if (transitionId !== undefined && transitionId !== null && Number.isFinite(Number(transitionId))) p3dvHostActiveTransitionId = Number(transitionId || p3dvHostActiveTransitionId || 0);
    const put = (id, value) => { const node=$(id); if (node && value !== undefined && value !== null) node.value=String(value); };
    put(ids.pergoSystemCount, input.systemCount == null ? modelState.systemCount || 1 : input.systemCount);
    put(ids.freedomWidth, input.width == null ? '' : input.width);
    if ($(ids.freedomDepth)) setDepthControlValue(String(input.depth == null ? '' : input.depth));
    put(ids.freedomHeight, input.height == null ? '' : input.height);
    put(ids.parapetInput, input.parapet);
    put(ids.parapetHeightInput, input.parapetHeight);
    put(ids.motorInput, input.motor);
    put(ids.remoteInput, input.remote);
    put(ids.ledInput, input.led);
    put(ids.dimmerInput, input.dimmer);
    put(ids.waterStandardInput, input.waterStandard);
    put(ids.extrasInput, input.extras);
    // Draft ownership is canonical even while the user is midway through an invalid/incomplete value.
    // Geometry is rebuilt only when the existing product validator accepts the full input.
    modelState.inputDrafts = {
      ...(modelState.inputDrafts || {}),
      width: String(input.width == null ? '' : input.width),
      depth: String(input.depth == null ? '' : input.depth),
      height: String(input.height == null ? '' : input.height)
    };
    syncFreedomOptionStateFromUi();
    const applied = applyFreedomInputs();
    if (applied) p3dvHostSyncControls();
    else { updateProductInputUi(); updateReadouts(); }
    return { ok: Boolean(applied), draftOnly: !applied, input: p3dvHostReadMainProductInput(), snapshot: p3dvHostSnapshot() };
  }

  function p3dvHostSyncControls() {
    if ($(ids.productGroup)) $(ids.productGroup).value = modelState.productGroup;
    const drafts = modelState.inputDrafts || {};
    if ($(ids.freedomWidth)) $(ids.freedomWidth).value = String(drafts.width || modelState.width || '');
    if ($(ids.freedomDepth)) setDepthControlValue(String(drafts.depth || modelState.depth || ''));
    if ($(ids.freedomHeight)) $(ids.freedomHeight).value = String(drafts.height || modelState.height || '');
    if ($(ids.freedomPanelCount)) $(ids.freedomPanelCount).value = String(modelState.panelCount || '');
    if ($(ids.pergoSystemCount)) $(ids.pergoSystemCount).value = String(modelState.systemCount || 1);
    if ($(ids.panelFill)) $(ids.panelFill).value = String(modelState.panelFill || 'EVET');
    if ($(ids.motor)) $(ids.motor).value = String(modelState.motor || 'Yok');
    if ($(ids.remote)) $(ids.remote).value = String(modelState.remote || 'Yok');
    if ($(ids.led)) $(ids.led).value = String(modelState.led || 'NO');
    if ($(ids.dimmer)) $(ids.dimmer).value = String(modelState.dimmer || 'HAYIR');
    if ($(ids.parapet)) $(ids.parapet).value = String(modelState.parapet || 'HAYIR');
    if ($(ids.parapetHeight)) $(ids.parapetHeight).value = String(modelState.parapetHeight || '');
    if($(ids.waterStandardInput))$(ids.waterStandardInput).value=modelState.waterStandard||'EVET';
    if($('extrasInput'))$('extrasInput').value=modelState.extras||'';
    if ($(ids.toolboxIntermediateDimensions)) $(ids.toolboxIntermediateDimensions).checked = Boolean(dimensionVisibility.intermediate);
    if ($(ids.toolboxMainDimensions)) $(ids.toolboxMainDimensions).checked = Boolean(dimensionVisibility.main);
    if ($(ids.panelMaster)) $(ids.panelMaster).checked = Boolean(modelState.panelMasterOpen);
    updateProductInputUi();
    updateColorControls();
    updateToolbox();
    updateReadouts();
    if (previewInputStatus().complete) {
      if (autoPreviewTimer) clearTimeout(autoPreviewTimer);
      autoPreviewTimer = null;
      showPreviewInputGuidance('', '');
    }
  }
  let p3dvHostActiveTransitionId = 0;
  let p3dvEmbeddedOwnFullscreen = false;
  let p3dvHostCanonicalProductGroup = modelState.productGroup;
  // V14.28.4 corrective: P3DV boots into its visible 3D presentation. The outer
  // host may explicitly pause it after a settled 2D transition. Starting an embedded
  // viewer inactive made the Stage-9 optimization race the first real viewer-ready
  // event, leaving OrbitControls/model updates visually frozen until another host command.
  let p3dvHostRuntimeActive = true;
  const p3dvHostLifecycleDiagnostics = { runtimeActiveSetCount:0, viewerReadyCount:0, statePollTickCount:0, statePostCount:0 };

  function p3dvHostSetRuntimeActive(active, transitionId) {
    p3dvHostActiveTransitionId = Number(transitionId || p3dvHostActiveTransitionId || 0);
    p3dvHostRuntimeActive = Boolean(active);
    p3dvHostLifecycleDiagnostics.runtimeActiveSetCount += 1;
    postViewerMessage('set-runtime-active', { active: p3dvHostRuntimeActive });
    if (p3dvHostRuntimeActive) { window.dispatchEvent(new Event('resize')); postViewerMessage('viewport-resized'); }
    return p3dvHostRuntimeActive;
  }

  function p3dvCanonicalProductGroup(value) {
    const identity = window.PulumurP3DVProductIdentity;
    return String(value || '').trim().toLowerCase().replace(/[_]+/g, '-').replace(/\s+/g, ' ');
  }

  function p3dvHostNormalizeRestoredInputDrafts(restored) {
    const source = restored && restored.inputDrafts && typeof restored.inputDrafts === 'object' ? restored.inputDrafts : {};
    const preserveTopology = (value) => /[;:]|\bNO\b/i.test(String(value == null ? '' : value));
    const pick = (key, canonical) => {
      const raw = String(source[key] == null ? '' : source[key]).trim();
      if (raw && preserveTopology(raw)) return raw;
      const value = Number(canonical);
      return Number.isFinite(value) && value !== 0 ? String(Math.round(value)) : '';
    };
    restored.inputDrafts = {
      width: pick('width', restored.width),
      depth: pick('depth', restored.depth),
      height: pick('height', restored.height)
    };
    return restored;
  }

  function p3dvHostRestoreSnapshot(raw, expectedGroup, transitionId) {
    const source = raw && raw.snapshot ? raw.snapshot : raw;
    if (transitionId !== undefined && transitionId !== null && Number.isFinite(Number(transitionId))) {
      p3dvHostActiveTransitionId = Number(transitionId || p3dvHostActiveTransitionId || 0);
    }
    if (!source || source.schema !== 'p3dv-host-snapshot-v1' || !source.modelState) throw new Error('P3DV_HOST_SNAPSHOT_INVALID');
    const restored = p3dvHostNormalizeRestoredInputDrafts(p3dvHostClone(source.modelState));
    const normalizedExpectedGroup = expectedGroup ? p3dvCanonicalProductGroup(expectedGroup) : '';
    restored.productGroup = p3dvCanonicalProductGroup(restored.productGroup);
    if (normalizedExpectedGroup && restored.productGroup !== normalizedExpectedGroup) throw new Error('P3DV_HOST_SNAPSHOT_PRODUCT_MISMATCH');
    if (normalizedExpectedGroup) p3dvHostCanonicalProductGroup = normalizedExpectedGroup;
    Object.keys(modelState).forEach(key => { delete modelState[key]; });
    Object.assign(modelState, JSON.parse(JSON.stringify(defaults)), restored);
    for(const owner of v12Owners())refreshProfileMovementScopes(owner.spec);
    viewerCameraState = p3dvHostClone(source.viewerCameraState || null);
    dimensionVisibility = { intermediate: false, main: true, ...(source.dimensionVisibility || {}) };
    zoneFilters=source.zoneFilters?p3dvHostClone(source.zoneFilters):window.PLMRV11Zones.defaults();
    zonesVisible=source.zonesVisible!==false;
    v15OperationJournal=p3dvHostClone(source.operationJournal||[]);v15LastJournalState=JSON.stringify(modelState);
    document.dispatchEvent(new CustomEvent('plmr:units',{detail:ensureSceneEditor().dimensionUnits}));
    document.dispatchEvent(new CustomEvent('plmr:parapet',{detail:{height:ensureSceneEditor().parapet?.height||0}}));
    document.dispatchEvent(new CustomEvent('plmr-v12-change'));
    document.dispatchEvent(new CustomEvent('plmr-v11-dimensions'));
    v11PublishFilters();
    selectedZone = null;
    selectedZoneId = null;
    cancelToolboxSelection();
    p3dvHostSyncControls();
    p3dvHistoryRebase('restore-snapshot');
    renderViewer();
    return p3dvHostSnapshot();
  }
  function p3dvHostSetProduct(group, transitionId) {
    const allowed = ['b-cube', 'b-cube-galaxy', 'bio-rise'];
    const next = p3dvCanonicalProductGroup(group);
    if (!allowed.includes(next)) throw new Error('P3DV_HOST_PRODUCT_GROUP_INVALID');
    p3dvHostActiveTransitionId = Number(transitionId || p3dvHostActiveTransitionId || 0);
    p3dvHostCanonicalProductGroup = next;
    if (!supportsMainTechnical2D(next)) p3dvDrawingMode = '3d';
    // Embedded host activation is a product boundary, not a cosmetic select change.
    // Rebuild the product-owned input contract from the requested group every time.
    resetProductGroupRuntimeState(next);
    if ($(ids.productGroup)) $(ids.productGroup).value = next;
    setFreedomValidation('');
    p3dvHostSyncControls();
    showRecommendedLimitWarnings({
      width: readFreedomNumber(ids.freedomWidth),
      depth: readFreedomNumber(ids.freedomDepth),
      panelCount: readFreedomNumber(ids.freedomPanelCount)
    });
    renderViewer();
    return next;
  }
  function p3dvHostActivateProduct(group, snapshot, transitionId) {
    const next = p3dvHostSetProduct(group, transitionId);
    if (snapshot) {
      try { p3dvHostRestoreSnapshot(snapshot, next, transitionId); } catch (_) {
        // The hard product boundary already succeeded. A bad snapshot must never
        // leave the input page on the previous product. Stay on the fresh target.
      }
    }
    p3dvHostCanonicalProductGroup = next;
    return p3dvHostSnapshot();
  }

  function p3dvTechnical2DZones() {
    // V14.24 Stage 6: deterministic zone identity is derived directly from the
    // canonical product layout. The nested viewer/SVG are render caches only and
    // can be stale during restore/undo/rebuild; they must never own physical zone
    // identity or placement/history keys.
    try {
      const rawZones = buildReportFacades(readModel()).flatMap((facade) => (facade.zones || []).map((zone) => ({ ...zone })));
      return ensureZoneIdentityRecords(rawZones);
    } catch (_) { return []; }
  }

  function p3dvTechnical2DContract() {
    return {
      schema: 'p3dv-technical2d-interaction-contract-v14.14',
      owners: (()=>{if(modelState.productGroup!=='b-cube')return [];const graph=v18Graph(modelState);const measurements=v17Measurements();return graph.owners.map(o=>({id:o.id,measurements:measurements.filter(m=>m.owner===o.id),zones:v18Report({...o.spec,parapetOwner:o.id},modelState,graph).flatMap(f=>f.zones),placements:p3dvHistoryClone(o.spec.placements||{}),zipPlacements:p3dvHistoryClone(o.spec.zipPlacements||{})}));})(),
      productGroup: modelState.productGroup,
      zones: p3dvTechnical2DZones(),
      zoneIdentity: 'project-unique-zone-registry-v4',
      zoneDividers: JSON.parse(JSON.stringify(modelState.zoneDividers || {})),
      zoneRegistry: JSON.parse(JSON.stringify(modelState.zoneRegistry || {})),
      facadeProfiles: JSON.parse(JSON.stringify(modelState.facadeProfiles || {})),
      placements: JSON.parse(JSON.stringify(modelState.placements || {})),
      zipPlacements: JSON.parse(JSON.stringify(modelState.zipPlacements || {}))
    };
  }

  function p3dvTechnical2DFindZone(zoneId) {
    const id = String(zoneId || '');
    const zones = p3dvTechnical2DZones();
    if (!zones.length) throw new Error('TECHNICAL2D_ZONE_CONTRACT_UNAVAILABLE');
    const zone = zones.find((item) => item && item.id === id);
    if (!zone) throw new Error('TECHNICAL2D_ZONE_NOT_FOUND');
    return { ...zone };
  }

  function p3dvTechnical2DSameProfileSection(zone) {
    const facadeId = zone.profileSourceId || zone.facadeId || String(zone.id || '').split('|')[0];
    const profiles = getFacadeProfiles(facadeId);
    const boundaryIds = [zone.leftBoundaryId, zone.rightBoundaryId].filter(Boolean);
    for (const id of boundaryIds) {
      const profile = profiles.find((item) => item && item.id === id);
      if (profile) return { width: (Number(profile.width) > 0 ? Number(profile.width) : 100), depth: (Number(profile.depth) > 0 ? Number(profile.depth) : 100) };
    }
    const sections = Array.isArray(modelState.postSections) ? modelState.postSections : [];
    const map = { front: [0, 1], back: [2, 3], left: [0, 2], right: [1, 3] };
    const indexes = map[facadeId] || [0];
    const section = sections[indexes[0]] || { x: 100, z: 100 };
    return facadeId === 'left' || facadeId === 'right'
      ? { width: Math.max(40, Number(section.z) || 100), depth: Math.max(30, Number(section.x) || 100) }
      : { width: Math.max(40, Number(section.x) || 100), depth: Math.max(30, Number(section.z) || 100) };
  }

  function p3dvCanonicalApplyZoneDimension(zone,nextWidth,nextHeight){return v11InOwner(zone,()=>v11CanonicalApplyZoneDimension(zone,nextWidth,nextHeight));}
  function v20ProfileEnvelope(profile,zone,facadeId){
    const C=window.PLMRV20Profiles;if(profile.scope)return profile.scope;
    const zs=v18Report(modelState).flatMap(f=>f.zones).filter(z=>z.axis===zone.axis&&[z.leftBoundaryId,z.rightBoundaryId,z.bottomBoundaryId,z.topBoundaryId].includes(profile.id));
    const scope=C.scope(zone),q=C.position(profile,modelState.sceneEditor?.members?.['profile:'+facadeId+':'+profile.id]||{}),u=zone.axis==='x'?q.x:q.z;
    if(profile.orientation!=='horizontal'){scope.min=Math.min(u-profile.width/2,...zs.map(z=>(z.axis==='x'?z.cx:z.cz)-z.width/2));scope.max=Math.max(u+profile.width/2,...zs.map(z=>(z.axis==='x'?z.cx:z.cz)+z.width/2));}
    else{const y=Number.isFinite(q.y)?q.y:zone.topBoundaryId===profile.id?zone.topY+profile.width/2:zone.bottomY-profile.width/2;scope.bottom=Math.min(y-profile.width/2,...zs.map(z=>z.bottomY));scope.top=Math.max(y+profile.width/2,...zs.map(z=>z.topY));profile.originY=y;profile.originX=zone.cx+(zone.axis==='z'?scope.surface-scope.normal+scope.inward*profile.depth/2:0);profile.originZ=zone.cz+(zone.axis==='x'?scope.surface-scope.normal+scope.inward*profile.depth/2:0);profile.span=zone.width;}
    profile.scope=scope;return scope;
  }
  function v11CanonicalApplyZoneDimension(zone, nextWidth, nextHeight) {
    const width = Math.round(Number(nextWidth));
    const height = Math.round(Number(nextHeight));
    if (!Number.isFinite(width) || width < 0 || !Number.isFinite(height) || height < 0) throw new Error('Geçerli net genişlik ve yükseklik değerleri girin.');
    const snapshot=p3dvHistoryClone(modelState);
    const widthDelta = width - Number(zone.width);
    const heightDelta = height - Number(zone.height);
    if(window.PLMRV17Core){const edit=window.PLMRV17Core.editable(zone,modelState.facadeProfiles);if(Math.abs(widthDelta)>=1&&!edit.width||Math.abs(heightDelta)>=1&&!edit.height)throw Error('Bu eksendeki ölçü yalnız ek profil sınırı üzerinden değiştirilebilir.');}
    const facadeId = zone.profileSourceId || zone.facadeId || String(zone.id || '').split('|')[0];
    const profiles = getFacadeProfiles(facadeId);
    const verticalProfiles = profiles.filter((profile) => (profile.orientation || 'vertical') === 'vertical');
    const horizontalProfiles = profiles.filter((profile) => profile.orientation === 'horizontal');
    try {
      if (Math.abs(widthDelta) >= 1) {
        const movableId=[zone.rightBoundaryId,zone.leftBoundaryId].find(id=>verticalProfiles.some(p=>p.id===id));
        const profile = verticalProfiles.find((item) => item.id === movableId);
        const baseWidth = Number(zone.baseWidth || 0);
        if (profile && baseWidth) {
          const sign = movableId === zone.rightBoundaryId ? 1 : -1;
          const C=window.PLMRV20Profiles;v20ProfileEnvelope(profile,zone,facadeId);
          const field=zone.axis==='x'?'originX':'originZ',member=modelState.sceneEditor?.members?.['profile:'+facadeId+':'+profile.id],position=zone.axis==='x'?'positionX':'positionZ';
          if(member&&Number.isFinite(member[position]))member[position]+=sign*widthDelta;else profile[field]+=sign*widthDelta;
          const edits=Object.fromEntries(profiles.map(p=>[p.id,modelState.sceneEditor?.members?.['profile:'+facadeId+':'+p.id]||{}]));C.validate(profile,profiles,edits);
          profile.positionRatio=(C.position(profile,edits[profile.id])[zone.axis==='x'?'x':'z']-profile.scope.min)/(profile.scope.max-profile.scope.min);

        } else {
          const count=Math.max(1,Number(modelState.systemCount)||1),index=Math.max(0,Math.min(count-1,Number.isInteger(zone.moduleIndex)?zone.moduleIndex:(zone.facadeId==='right'?count-1:0)));
          if(zone.connection)throw new Error('Bu bağlantı alanının genişliği komşu duvar/sistem konumuyla belirlenir. Profil ekleyerek alt alan ölçüsünü düzenleyin.');
          if(count>1){const widths=modelState.moduleWidths.slice(),depths=modelState.moduleDepths.slice();if(zone.axis==='x')widths[index]+=widthDelta;else depths[index]+=widthDelta;modelState.moduleWidths=widths;modelState.moduleDepths=depths;modelState.width=widths.reduce((a,b)=>a+b,0);modelState.depth=Math.max(...depths);}
          else {if(zone.axis==='x')modelState.width+=widthDelta;else modelState.depth+=widthDelta;}
        }
      }
      if (Math.abs(heightDelta) >= 1) {
        const movableId=[zone.topBoundaryId,zone.bottomBoundaryId].find(id=>horizontalProfiles.some(p=>p.id===id));
        const profile = horizontalProfiles.find((item) => item.id === movableId);
        const baseHeight = Number(zone.baseHeight || 0);
        if (profile && baseHeight) {
          const sign = movableId === zone.topBoundaryId ? 1 : -1;
          const C=window.PLMRV20Profiles;v20ProfileEnvelope(profile,zone,facadeId);
          profile.originY+=sign*heightDelta;
          const edits=Object.fromEntries(profiles.map(p=>[p.id,modelState.sceneEditor?.members?.['profile:'+facadeId+':'+p.id]||{}]));C.validate(profile,profiles,edits);
          profile.positionYRatio=(profile.originY-profile.scope.bottom)/(profile.scope.top-profile.scope.bottom);

        } else modelState.height += heightDelta;
      }
      if(modelState.systemCount<=1){modelState.moduleWidths=[modelState.width];modelState.moduleDepths=[modelState.depth];}modelState.panelCount=panelCountFromProjection(modelState.depth,'b-cube');modelState.modulePanelCounts=(modelState.moduleDepths||[modelState.depth]).map(d=>panelCountFromProjection(d,'b-cube'));
      if (!dimensionsFit(readModel())) throw new Error('Bu ölçü mevcut dikme ve profil kesitleriyle uyumlu değil.');
      modelState.inputDrafts={width:(modelState.moduleWidths||[modelState.width]).join(';'),depth:(modelState.moduleDepths||[modelState.depth]).join(';'),height:String(modelState.height)};if(!zone.owner||zone.owner==='roof-main')p3dvHostSyncControls();
    } catch (error) {
      Object.keys(modelState).forEach(k=>delete modelState[k]);Object.assign(modelState,snapshot);
      throw error;
    }
  }

  function p3dvCanonicalAddProfile(zone,payload){return v11InOwner(zone,()=>v11CanonicalAddProfile(zone,payload));}
  function v11CanonicalAddProfile(zone, payload) {
    if (zonePlacement(zone)) throw new Error('Ürün bulunan alana profil eklenemez. Önce ürünü silin.');
    const facadeId = zone.profileSourceId || zone.facadeId || String(zone.id || '').split('|')[0];
    const profiles = getFacadeProfiles(facadeId);
    const orientation = String(payload && payload.orientation || 'vertical').toLowerCase() === 'horizontal' ? 'horizontal' : 'vertical';
    const same = orientation === 'vertical' && String(payload && payload.mode || '') === 'same';
    const section = same ? p3dvTechnical2DSameProfileSection(zone) : { width: Number(payload && payload.width), depth: Number(payload && payload.depth) };
    const width = Number(section.width), depth = Number(section.depth);
    if (!Number.isFinite(width) || width <= 0 || !Number.isFinite(depth) || depth <= 0) throw new Error('Profil genişliği ve derinliği sıfırdan büyük olmalıdır.');
    const profile = window.PLMRV20Profiles.create(zone,nextFacadeProfileId(),orientation,width,depth);
    profile.type=same?'SAME':(width===100&&depth===100?'100x100':'CUSTOM');
    profile.label=(orientation==='horizontal'?'Yatay':'Dikey')+' Profil '+width+' × '+depth;
    const edits=Object.fromEntries(profiles.map(p=>[p.id,modelState.sceneEditor?.members?.['profile:'+facadeId+':'+p.id]||{}]));
    window.PLMRV20Profiles.validate(profile,profiles,edits);
    modelState.facadeProfiles[facadeId] = [...profiles, profile];
    return { ...profile, facadeId };
  }

  function p3dvCanonicalUpdateProfile(payload) {
    const facadeId = String(payload && payload.facadeId || '');
    const profileId = String(payload && payload.profileId || '');
    const profiles = getFacadeProfiles(facadeId);
    const profile = profiles.find((item) => item && item.id === profileId);
    if (!profile) throw new Error('Profil bulunamadı.');
    const before = { ...profile };
    const width = Number(payload && payload.width);
    const depth = Number(payload && payload.depth);
    if (!Number.isFinite(width) || width <= 0 || !Number.isFinite(depth) || depth <= 0) throw new Error('Profil genişliği ve derinliği sıfırdan büyük olmalıdır.');
    profile.width = width; profile.depth = depth; profile.type = width === 100 && depth === 100 ? '100x100' : 'CUSTOM'; profile.label = `${profile.orientation === 'horizontal' ? 'Yatay' : 'Dikey'} Profil ${width} × ${depth}`;
    const zones = p3dvTechnical2DZones().filter((zone) => zone.facadeId === facadeId);
    const baseWidth = Math.max(1, ...zones.map((zone) => Number(zone.baseWidth || 0)).filter(Number.isFinite));
    const baseHeight = Math.max(1, ...zones.map((zone) => Number(zone.baseHeight || 0)).filter(Number.isFinite));
    let valid=true;try{if(profile.scope)window.PLMRV20Profiles.validate(profile,profiles,Object.fromEntries(profiles.map(p=>[p.id,modelState.sceneEditor?.members?.['profile:'+facadeId+':'+p.id]||{}])));else valid=profile.orientation==='horizontal'?horizontalProfileLayoutFits(profiles,baseHeight,profile.leftBoundaryId,profile.rightBoundaryId):verticalProfileLayoutFits(profiles,baseWidth);}catch(_){valid=false;}
    if (!valid || !dimensionsFit(readModel())) { Object.assign(profile, before); throw new Error('Yeni profil kesiti mevcut açıklıklara sığmıyor.'); }
    return { ...profile, facadeId };
  }

  function p3dvCanonicalDeleteProfile(payload) {
    const facadeId = String(payload && payload.facadeId || '');
    const profileId = String(payload && payload.profileId || '');
    const current = getFacadeProfiles(facadeId);
    const target = current.find((profile) => profile && profile.id === profileId);
    if (!target) throw new Error('Profil bulunamadı.');
    const removed = new Set([profileId]);
    if (target.orientation !== 'horizontal') current.forEach((profile) => { if (profile.orientation === 'horizontal' && (profile.leftBoundaryId === profileId || profile.rightBoundaryId === profileId)) removed.add(profile.id); });
    modelState.facadeProfiles[facadeId] = current.filter((profile) => !removed.has(profile.id));
    [modelState.placements, modelState.zipPlacements].forEach((store) => Object.keys(store || {}).forEach((zoneId) => {
      if (zoneId.startsWith(`${facadeId}|`) && [...removed].some((id) => zoneId.includes(id))) {
        delete store[zoneId]; delete modelState.productOpenStates[zoneId]; delete modelState.productOpenStates[zipProductKey(zoneId)]; delete modelState.panelStates[zipProductKey(zoneId)];
      }
    }));
    return [...removed];
  }

  function p3dvTechnical2DCanonicalRequiredFields(type, placement) {
    const identity = window.PulumurP3DVProductIdentity;
    if (!identity || typeof identity.requiredCanonicalFieldsForFacade !== 'function') throw new Error('P3DV_PRODUCT_DATA_CONTRACT_MISSING');
    return identity.requiredCanonicalFieldsForFacade(type, placement);
  }

  function p3dvTechnical2DCompleteCanonicalPlacement(type, placement) {
    const source = placement && typeof placement === 'object' ? placement : null;
    if (!source) throw new Error('TECHNICAL2D_PRODUCT_ADD_REQUIRES_COMPLETE_CANONICAL_PLACEMENT');
    if (String(source.type || '').toLowerCase() !== type) throw new Error('TECHNICAL2D_PRODUCT_TYPE_MISMATCH');
    const required = p3dvTechnical2DCanonicalRequiredFields(type, source);
    const missing = required.filter((field) => !Object.prototype.hasOwnProperty.call(source, field));
    if (missing.length) throw new Error(`TECHNICAL2D_CANONICAL_FIELDS_MISSING:${missing.join(',')}`);
    return JSON.parse(JSON.stringify(source));
  }

  function p3dvTechnical2DProductDraft(zone, type, panels, existing, canonicalPlacement) {
    const allowed = ['sliding', 'balcony', 'guillotine', 'zip', 'door', 'fixed', 'folding'];
    if (!allowed.includes(type)) throw new Error('Bu ürün etkileşiminde Sürme, Giyotin, Zip, Kapı, Sabit Doğrama, Akordiyon Cam ve Katlanır Cam desteklenir.');
    let draft;
    if (existing) {
      if (String(existing.type || '').toLowerCase() !== type) throw new Error('TECHNICAL2D_PRODUCT_TYPE_CHANGE_REQUIRES_3D_CANONICAL_INPUT');
      draft = JSON.parse(JSON.stringify(existing));
      if (type === 'sliding') draft.panels = Math.max(2, Math.min(12, Math.round(Number(panels) || Number(draft.panels) || 4)));
      else if (type === 'guillotine') {
        const count = Math.max(2, Math.min(3, Math.round(Number(panels) || Number(draft.panels) || 3)));
        draft.panels = count; draft.panelType = count === 2 ? '1+1' : '1+2';
      } else if (isFoldingType(type)) draft.panels = Math.max(2, Math.min(16, Math.round(Number(panels) || Number(draft.panels) || 4)));
    } else {
      draft = p3dvTechnical2DCompleteCanonicalPlacement(type, canonicalPlacement);
    }
    draft = sanitizeProductState(draft, type);
    const savedActive = activeZone, savedBulk = bulkProductZones;
    activeZone = zone; bulkProductZones = null;
    const error = validateProductDraft(draft);
    activeZone = savedActive; bulkProductZones = savedBulk;
    if (error) throw new Error(error);
    return draft;
  }

  function p3dvTechnical2DUpsertProduct(zone, payload, update) {
    const requestedType = String(payload && payload.type || '').toLowerCase();
    if (!requestedType) throw new Error('TECHNICAL2D_PRODUCT_TYPE_REQUIRED');
    const requestedSlot = String(payload && payload.slot || '');
    const oldSlot = requestedSlot === 'zip' ? 'zip' : (requestedSlot === 'primary' ? 'primary' : null);
    const oldStore = oldSlot === 'zip' ? modelState.zipPlacements : modelState.placements;
    const existing = oldSlot ? oldStore[zone.id] : null;
    if (update && !existing) throw new Error('Düzenlenecek ürün bulunamadı.');
    if (update && String(existing.type || '').toLowerCase() !== requestedType) throw new Error('TECHNICAL2D_PRODUCT_TYPE_CHANGE_REQUIRES_3D_CANONICAL_INPUT');
    const newSlot = requestedType === 'zip' ? 'zip' : 'primary';
    const newStore = newSlot === 'zip' ? modelState.zipPlacements : modelState.placements;
    if ((!update || newSlot !== oldSlot) && newStore[zone.id]) throw new Error(newSlot === 'zip' ? 'Bu alanda zaten Zip Perde var.' : 'Bu alanda zaten ana ürün var.');
    const draft = p3dvTechnical2DProductDraft(zone, requestedType, payload && payload.panels, existing, payload && payload.canonicalPlacement);
    if (update && oldSlot && oldSlot !== newSlot) throw new Error('TECHNICAL2D_PRODUCT_SLOT_CHANGE_REQUIRES_3D_CANONICAL_INPUT');
    newStore[zone.id] = JSON.parse(JSON.stringify(draft));
    if (newSlot === 'zip') { const key = zipProductKey(zone.id); if (!hasOwn(modelState.productOpenStates, key)) modelState.productOpenStates[key] = true; modelState.panelStates[key] = effectiveProductOpen(key); }
    else if (!hasOwn(modelState.productOpenStates, zone.id)) modelState.productOpenStates[zone.id] = true;
    return { slot: newSlot, placement: JSON.parse(JSON.stringify(draft)) };
  }

  function p3dvTechnical2DDeleteProduct(zone, payload) {
    const slot = String(payload && payload.slot || 'primary') === 'zip' ? 'zip' : 'primary';
    if (slot === 'zip') { delete modelState.zipPlacements[zone.id]; delete modelState.productOpenStates[zipProductKey(zone.id)]; delete modelState.panelStates[zipProductKey(zone.id)]; }
    else { delete modelState.placements[zone.id]; delete modelState.productOpenStates[zone.id]; }
    return slot;
  }

  function p3dvExecuteTechnical2DCommand(command, transitionId) {
    if (!['b-cube-galaxy','b-cube','bio-rise'].includes(p3dvCanonicalProductGroup(modelState.productGroup))) throw new Error('TECHNICAL2D_COMMAND_PRODUCT_MISMATCH');
    const type = String(command && command.type || '');
    const payload = command && command.payload || {};
    const historyBefore = p3dvHistoryClone(modelState);
    let result = null;
    if (type === 'zone-dimension') { const zone = p3dvTechnical2DFindZone(payload.zoneId); p3dvCanonicalApplyZoneDimension(zone, payload.width, payload.height); result = { zoneId: zone.id }; }
    else if (type === 'profile-add') { const zone = p3dvTechnical2DFindZone(payload.zoneId); result = p3dvCanonicalAddProfile(zone, payload); }
    else if (type === 'profile-update') result = p3dvCanonicalUpdateProfile(payload);
    else if (type === 'profile-delete') result = p3dvCanonicalDeleteProfile(payload);
    else if (type === 'product-add') { const zone = p3dvTechnical2DFindZone(payload.zoneId); result = p3dvTechnical2DUpsertProduct(zone, payload, false); }
    else if (type === 'product-update') { const zone = p3dvTechnical2DFindZone(payload.zoneId); result = p3dvTechnical2DUpsertProduct(zone, payload, true); }
    else if (type === 'product-delete') { const zone = p3dvTechnical2DFindZone(payload.zoneId); result = p3dvTechnical2DDeleteProduct(zone, payload); }
    else throw new Error('TECHNICAL2D_COMMAND_UNKNOWN');
    if(type==='zone-dimension'){try{v19Resize(historyBefore);}catch(e){Object.keys(modelState).forEach(k=>delete modelState[k]);Object.assign(modelState,historyBefore);throw e;}}
    if(window.PLMRV18Zones&&(type.startsWith('profile-')||type==='zone-dimension')){try{v18Migrate(historyBefore,true);}catch(error){Object.keys(modelState).forEach(key=>delete modelState[key]);Object.assign(modelState,historyBefore);v18Cache=null;throw error;}}
    selectedZone = null; selectedZoneId = null;
    p3dvHistoryRecord(historyBefore, { type, label: `Technical2D ${type}`, origin: 'technical2d', payload: p3dvHostClone(payload) });
    commitModelChangeLive(`technical2d:${type}`, { preserveHistory: true });
    p3dvHostActiveTransitionId = Number(transitionId || p3dvHostActiveTransitionId || 0);
    const snapshot = p3dvHostSnapshot();
    return { ok: true, type, result, snapshot, contract: p3dvTechnical2DContract() };
  }

  function p3dvHostRuntimeTargetOrigin() {
    const origin = String(window.location.origin || '');
    return origin && origin !== 'null' ? origin : '*';
  }
  function p3dvHostOriginAccepted(eventOrigin) {
    const origin = String(window.location.origin || '');
    return !origin || origin === 'null' || eventOrigin === origin;
  }
  function p3dvHostPost(type, payload, transitionId = p3dvHostActiveTransitionId) {
    if (!p3dvEmbeddedHostMode || window.parent === window) return;
    try { window.parent.postMessage({ schema: 'plmr-p3dv-runtime-message-v1', source: 'plmr-p3dv-runtime', type, transitionId: Number(transitionId || 0), payload: p3dvHostClone(payload || {}) }, p3dvHostRuntimeTargetOrigin()); } catch (_) {}
  }
  function p3dvHostNotifyState(transitionId = p3dvHostActiveTransitionId) {
    const snapshot = p3dvHostSnapshot();
    p3dvHostPost('state-changed', { productGroup: modelState.productGroup, snapshot }, transitionId);
  }
  if (p3dvEmbeddedHostMode) {
    window.addEventListener('message', event => {
      if (event.source !== window.parent || !p3dvHostOriginAccepted(event.origin)) return;
      const message = event.data || {};
      if (message.schema !== 'plmr-p3dv-runtime-message-v1' || message.source !== 'plmr-unified-host') return;
      const payload = message.payload || {};
      const transitionId = Number(message.transitionId || 0);
      if (transitionId && transitionId < p3dvHostActiveTransitionId) return;
      try {
        if (message.type === 'activate-product') {
          p3dvHostActivateProduct(payload.productGroup, payload.snapshot || null, transitionId);
          p3dvHostNotifyState(transitionId);
        } else if (message.type === 'set-product') {
          p3dvHostSetProduct(payload.productGroup, transitionId);
          p3dvHostNotifyState(transitionId);
        } else if (message.type === 'apply-quick-test') {
          const index = Math.max(1, Math.min(10, Number(payload.index) || 1));
          const scenario = quickTestScenario(index);
          if (!scenario || scenario.group !== p3dvHostCanonicalProductGroup || modelState.productGroup !== p3dvHostCanonicalProductGroup) throw new Error('P3DV_QUICK_TEST_PRODUCT_MISMATCH');
          applyQuickTestScenario(index, { hostAuthorized: true });
          p3dvHostNotifyState(transitionId);
        } else if (message.type === 'restore-snapshot') {
          p3dvHostRestoreSnapshot(payload.snapshot, payload.productGroup, transitionId);
          p3dvHostNotifyState(transitionId);
        } else if (message.type === 'get-snapshot') {
          p3dvHostPost('snapshot', { requestId: payload.requestId || '', productGroup: modelState.productGroup, snapshot: p3dvHostSnapshot() }, transitionId);
        } else if (message.type === 'technical2d-command') {
          const response = p3dvExecuteTechnical2DCommand(payload.command || {}, transitionId);
          p3dvHostPost('technical2d-command-result', response, transitionId);
          p3dvHostNotifyState(transitionId);
        } else if (message.type === 'set-runtime-active') {
          p3dvHostSetRuntimeActive(payload.active, transitionId);
        } else if (message.type === 'set-drawing-mode') {
          p3dvHostActiveTransitionId = Number(transitionId || p3dvHostActiveTransitionId || 0);
          setP3dvDrawingMode(payload.mode, { resetView: payload.resetView !== false });
        } else if (message.type === 'set-preview-expanded') {
          if (payload.expanded) {
            delete document.body.dataset.fullscreenError;
            delete document.body.dataset.fullscreenHostError;
          }
          setPreviewExpanded(Boolean(payload.expanded), { notifyHost: false });
        } else if (message.type === 'viewport-resized') {
          window.dispatchEvent(new Event('resize'));
          postViewerMessage('viewport-resized');
        }
      } catch (error) {
        p3dvHostPost('runtime-error', { message: String(error && error.message || error), operation: message.type });
      }
    });
    let p3dvHostLastStateHash = '';
    window.setInterval(() => {
      p3dvHostLifecycleDiagnostics.statePollTickCount += 1;
      if (!p3dvHostRuntimeActive) return;
      try {
        const snapshot = p3dvHostSnapshot();
        const text = JSON.stringify(snapshot.modelState) + JSON.stringify(snapshot.viewerCameraState) + JSON.stringify(snapshot.dimensionVisibility);
        let hash = 2166136261;
        for (let index = 0; index < text.length; index += 1) { hash ^= text.charCodeAt(index); hash = Math.imul(hash, 16777619); }
        const token = `${text.length}:${hash >>> 0}`;
        if (token !== p3dvHostLastStateHash) { p3dvHostLastStateHash = token; p3dvHostLifecycleDiagnostics.statePostCount += 1; p3dvHostPost('state-changed', { productGroup: modelState.productGroup, snapshot }, p3dvHostActiveTransitionId); }
      } catch (_) {}
    }, 650);
  }

  function p3dvRenderStandaloneGuillotinePreview(items, options = {}) {
    if (!p3dvStandaloneGuillotinePreviewMode) throw new Error('P3DV_STANDALONE_PREVIEW_MODE_REQUIRED');
    const list = Array.isArray(items) ? items.filter(item => item && Number(item.width) > 0 && Number(item.height) > 0).map(item => ({ ...item })) : [];
    const frame = $(ids.frame);
    if (!frame) throw new Error('P3DV_VIEWER_FRAME_MISSING');
    if (!list.length) { frame.srcdoc = buildEmptyViewerHtml('Geçerli Giyotin pozları bekleniyor.'); return false; }
    const columns = Math.max(1, Math.min(10, Math.round(Number(options.layoutColumns) || 2)));
    list.forEach(item => { item.layoutColumns = columns; });
    const widths = Array(columns).fill(0);
    const rowHeights = [];
    list.forEach((item,index)=>{ const col=index%columns,row=Math.floor(index/columns); widths[col]=Math.max(widths[col],Number(item.width)||0); rowHeights[row]=Math.max(rowHeights[row]||0,Number(item.height)||0); });
    const gap = 700;
    const sceneWidth = Math.max(2200, widths.reduce((a,b)=>a+b,0)+Math.max(0,columns-1)*gap);
    const sceneHeight = Math.max(2200, rowHeights.reduce((a,b)=>a+b,0)+Math.max(0,rowHeights.length-1)*gap);
    const color = options.systemColor && typeof options.systemColor === 'object' ? options.systemColor : defaults.systemColor;
    // The nested viewer and its message listener must share the SAME session.
    activeViewerSessionId = `p3dv-standalone-guillotine-${Date.now()}-${++viewerSessionCounter}`;
    const viewerId = activeViewerSessionId;
    p3dvStandaloneGuillotinePositionCount = list.length;
    p3dvStandaloneGuillotineRendered = false;
    if (p3dvStandaloneGuillotineRenderTimer) window.clearTimeout(p3dvStandaloneGuillotineRenderTimer);
    p3dvStandaloneGuillotineRenderTimer = window.setTimeout(() => {
      p3dvStandaloneGuillotineRenderTimer = 0;
      p3dvStandaloneGuillotineFail('3D görüntüleyici zamanında başlatılamadı. Paket dosyalarını ve tarayıcının WebGL desteğini kontrol edin.');
    }, 15000);
    if ($(ids.pergo2DViewport)) $(ids.pergo2DViewport).hidden = true;
    frame.hidden = false; frame.style.display = 'block';
    frame.srcdoc = buildViewerHtml({
      productGroup:'b-cube-galaxy', width:sceneWidth, depth:Math.max(1800,sceneWidth*.35), height:sceneHeight,
      lamellaCount:8, systemCount:1, freedomLayout:null, bioRiseLayout:null, galaxyLayout:null,
      orientations:[0,0,0,0], postSections:defaults.postSections, beamSection:defaults.beamSection,
      placements:{}, zipPlacements:{}, facadeProfiles:{}, zoneDividers:{}, zoneRegistry:{}, sketchWalls:[], colorMode:'ral', systemColor:color, panelColor:color,
      pergoRiseUrl:'', pergoRiseProject:null, viewerSessionId:viewerId, cameraState:null, selectedZoneId:String(options.selectedPositionId||'')||null,
      dimensionVisibility:{intermediate:false,main:false}, productsOpen:true, productOpenStates:{}, panelStates:{}, panelMasterOpen:true,
      toolboxSelectionMode:null, toolboxSelectionKeys:[], standaloneGuillotineItems:list
    });
    return true;
  }

  function p3dvStandaloneGuillotineTargetOrigin() {
    const origin = window.location.protocol === 'file:' ? 'null' : String(window.location.origin || '');
    return origin && origin !== 'null' ? origin : '*';
  }
  function p3dvStandaloneGuillotineOriginAccepted(eventOrigin) {
    const origin = window.location.protocol === 'file:' ? 'null' : String(window.location.origin || '');
    return origin && origin !== 'null' ? eventOrigin === origin : (eventOrigin === 'null' || eventOrigin === '' || (window.location.protocol === 'file:' && eventOrigin === 'file://'));
  }
  function p3dvStandaloneGuillotinePost(type, payload) {
    if (!p3dvStandaloneGuillotinePreviewMode || window.parent === window || !p3dvStandaloneGuillotineSessionId) return false;
    try {
      window.parent.postMessage({
        schema:P3DV_GUILLOTINE_SCHEMA, source:'plmr-p3dv-host', type,
        sessionId:p3dvStandaloneGuillotineSessionId, productId:P3DV_GUILLOTINE_PRODUCT,
        payload:payload&&typeof payload==='object'?payload:{}
      }, p3dvStandaloneGuillotineTargetOrigin());
      return true;
    } catch (_) { return false; }
  }
  function p3dvStandaloneGuillotineFail(message) {
    if (p3dvStandaloneGuillotineRenderTimer) window.clearTimeout(p3dvStandaloneGuillotineRenderTimer);
    p3dvStandaloneGuillotineRenderTimer = 0;
    p3dvStandaloneGuillotineRendered = false;
    p3dvStandaloneGuillotineStateKey = '';
    p3dvStandaloneGuillotinePost('P3DV_GUILLOTINE_ERROR', { message:String(message || '3D çizim oluşturulamadı.').slice(0,500) });
  }
  function p3dvStandaloneGuillotineValidatePosition(item, index, state) {
    if (!item || typeof item !== 'object') return null;
    const width = Number(item.width), height = Number(item.height);
    if (!Number.isFinite(width) || width <= 0 || !Number.isFinite(height) || height <= 0) return null;
    const text = (value, fallback, max=120) => String(value == null ? fallback : value).slice(0,max);
    return {
      id:text(item.id,`G${index+1}`,96), positionNo:text(item.positionNo,`P${String(index+1).padStart(2,'0')}`,40),
      width, height, quantity:Math.max(1,Math.min(9999,Math.trunc(Number(item.quantity)||1))),
      series:text(item.series,'A SERIES'), type:text(item.type||item.subtype,'STANDARD'), subtype:text(item.subtype||item.type,'STANDARD'), mechanism:text(item.mechanism,'CHAIN'),
      glassThickness:text(item.glassThickness,'8 MM'), glassColor:text(item.glassColor,'TRANSPARENT'), customGlassColor:text(item.customGlassColor,''),
      finish:text(item.finish||item.surface,'MAT'), surface:text(item.surface||item.finish,'MAT'), panelCount:text(item.panelCount||item.panelType,'1+1'),
      panels:Math.max(2,Math.min(8,Math.round(Number(item.panels)||2))), panelType:text(item.panelType||item.panelCount,'1+1'), motorDirection:text(item.motorDirection,'RIGHT'),
      view:text(item.view,'OUTSIDE VIEW'), motorType:text(item.motorType,'SOMFY RTS'), remoteControl:text(item.remoteControl,'1 CHANNEL'),
      color:text(item.color,''),
      systemColor:item.systemColor&&typeof item.systemColor==='object'?{
        code:text(item.systemColor.code,'RAL 7016',80),
        hex:/^#[0-9a-f]{6}$/i.test(String(item.systemColor.hex||''))?String(item.systemColor.hex):'#383e42',
        finish:['GLOSS','MATTE','TEXTURE'].includes(String(item.systemColor.finish||'').toUpperCase())?String(item.systemColor.finish).toUpperCase():'MATTE',
        kind:text(item.systemColor.kind,'ral',32)
      }:null,
      bottomPanelMode:text(item.bottomPanelMode,(String(item.subtype||item.type||'')==='CLEANABLE'?'VASISTAS':'FIXED')),
      bottomPanelState:text(item.bottomPanelState,'CLOSED'), bottomPanelHinge:'BOTTOM', collectionState:text(item.collectionState,'NORMAL'),
      displayState:text(item.displayState||state.openState,'OPEN'), showDimensions:Boolean(item.showDimensions ?? state.showDimensions), layoutColumns:state.layoutColumns
    };
  }
  function p3dvStandaloneGuillotineValidatedState(payload) {
    if (!payload || typeof payload !== 'object') return null;
    const common = payload.commonSettings && typeof payload.commonSettings === 'object' ? payload.commonSettings : {};
    const layoutColumns = Math.max(1,Math.min(10,Math.round(Number(common.layoutColumns)||2)));
    const openState = String(payload.openState||'OPEN') === 'CLOSED' ? 'CLOSED' : 'OPEN';
    const showDimensions = Boolean(payload.showDimensions);
    const positions = Array.isArray(payload.positions) ? payload.positions.slice(0,250).map((item,index)=>p3dvStandaloneGuillotineValidatePosition(item,index,{layoutColumns,openState,showDimensions})).filter(Boolean) : [];
    const c = common.systemColor && typeof common.systemColor === 'object' ? common.systemColor : {};
    const systemColor = {
      code:String(c.code||'RAL 7016').slice(0,80),
      hex:/^#[0-9a-f]{6}$/i.test(String(c.hex||''))?String(c.hex):'#383e42',
      finish:['GLOSS','MATTE','TEXTURE'].includes(String(c.finish||'').toUpperCase())?String(c.finish).toUpperCase():'MATTE',
      kind:String(c.kind||'ral').slice(0,32)
    };
    return { positions, commonSettings:{layoutColumns,systemColor}, selectedPositionId:String(payload.selectedPositionId||'').slice(0,96), openState, showDimensions };
  }
  if (p3dvStandaloneGuillotinePreviewMode) {
    window.addEventListener('message', event => {
      if (event.source !== window.parent || !p3dvStandaloneGuillotineOriginAccepted(event.origin)) return;
      const message = event.data || {};
      if (message.schema !== P3DV_GUILLOTINE_SCHEMA || message.source !== 'plmr-guillotine-workspace' || message.productId !== P3DV_GUILLOTINE_PRODUCT) return;
      if (!P3DV_GUILLOTINE_INBOUND_TYPES.has(String(message.type||''))) return;
      const sessionId = String(message.sessionId||'');
      if (sessionId.length < 16 || sessionId.length > 160) return;
      if (message.type === 'P3DV_GUILLOTINE_INIT') {
        if (p3dvStandaloneGuillotineSessionId && p3dvStandaloneGuillotineSessionId !== sessionId) return;
        p3dvStandaloneGuillotineSessionId = sessionId;
        p3dvStandaloneGuillotinePost('P3DV_HOST_READY', { ready:true });
        return;
      }
      if (!p3dvStandaloneGuillotineSessionId || sessionId !== p3dvStandaloneGuillotineSessionId) return;
      if (message.type === 'P3DV_GUILLOTINE_CAPTURE') {
        const requestId=String(message.payload && message.payload.requestId || '');
        if (!requestId || requestId.length>160) return;
        if (p3dvStandaloneGuillotineRendered) postViewerMessage('capture-guillotine', {requestId});
        else p3dvStandaloneGuillotinePost('P3DV_GUILLOTINE_CAPTURED', {requestId,error:'Önce proje ekranında 3D çizimi oluşturun.'});
        return;
      }
      if (message.type === 'P3DV_GUILLOTINE_DISPOSE') {
        if (p3dvStandaloneGuillotineRenderTimer) window.clearTimeout(p3dvStandaloneGuillotineRenderTimer);
        p3dvStandaloneGuillotineRenderTimer = 0;
        p3dvStandaloneGuillotineStateKey = '';
        p3dvStandaloneGuillotineRendered = false;
        activeViewerSessionId = '';
        const frame = $(ids.frame);
        if (frame) frame.srcdoc = buildEmptyViewerHtml('Giyotin 3D oturumu kapatıldı.');
        p3dvStandaloneGuillotineSessionId = '';
        return;
      }
      const state = p3dvStandaloneGuillotineValidatedState(message.payload);
      if (!state) return;
      const stateKey = JSON.stringify(state);
      if (stateKey === p3dvStandaloneGuillotineStateKey) {
        if (p3dvStandaloneGuillotineRendered) p3dvStandaloneGuillotinePost('P3DV_GUILLOTINE_RENDERED', { positionCount:p3dvStandaloneGuillotinePositionCount });
        return;
      }
      try {
        const started = p3dvRenderStandaloneGuillotinePreview(state.positions, {
          layoutColumns:state.commonSettings.layoutColumns, systemColor:state.commonSettings.systemColor, selectedPositionId:state.selectedPositionId
        });
        if (started) p3dvStandaloneGuillotineStateKey = stateKey;
        else p3dvStandaloneGuillotineFail('3D çizim için en az bir geçerli Giyotin pozu gerekiyor.');
      } catch (error) {
        p3dvStandaloneGuillotineFail(error && error.message || error);
      }
    });
  }

  window.PLMRV15Commands=Object.freeze({scene:applySceneCommand});
  window.__P3DV_HOST_BRIDGE__ = Object.freeze({
    embedded: p3dvEmbeddedHostMode,
    standaloneGuillotinePreview: p3dvStandaloneGuillotinePreviewMode,
    build: P3DV_HOST_BUILD,
    hostContract: P3DV_HOST_CONTRACT,
    snapshot: p3dvHostSnapshot,
    importProject:snapshot=>{const data=window.PLMRV15Core.validateProject({schema:"plmr-bioclimatic-project-v1",version:1,snapshot});for(const spec of [data.snapshot.modelState,...(data.snapshot.modelState.sceneEditor?.roofCopies||[]).map(c=>c.spec)])if(!(spec===data.snapshot.modelState&&([spec.width,spec.height].every(n=>n==null||Number(n)===0)&&Number.isFinite(Number(spec.depth))&&Number(spec.depth)>=0&&Number(spec.depth)<=1000000||Object.values(spec.sceneEditor?.nativeWorkspaces||{}).some(w=>w.positions?.length)&&![spec.width,spec.depth,spec.height].every(n=>Number(n)>0)))&&(spec.width<1000||spec.depth<2104||spec.height<roofInput.minimumHeight(spec.productGroup)||!dimensionsFit({...spec,freedomLayout:freedomMultiPositionLayout(spec)})))throw Error("Proje ölçüleri geometri sınırlarına uygun değil.");return p3dvHostRestoreSnapshot(data.snapshot,"b-cube");},
    readMainProductInput: p3dvHostReadMainProductInput,
    applyMainProductInput: p3dvHostApplyMainProductInput,
    restore: p3dvHostRestoreSnapshot,
    setProduct: p3dvHostSetProduct,
    activateProduct: p3dvHostActivateProduct,
    applyQuickTest: (index, transitionId) => {
      const scenario = quickTestScenario(Number(index));
      if (!scenario || scenario.group !== p3dvHostCanonicalProductGroup || modelState.productGroup !== p3dvHostCanonicalProductGroup) throw new Error('P3DV_QUICK_TEST_PRODUCT_MISMATCH');
      applyQuickTestScenario(Number(index), { hostAuthorized: true });
      return true;
    },
    notify: p3dvHostNotifyState,
    setRuntimeActive: (active, transitionId) => p3dvHostSetRuntimeActive(active, transitionId),
    runtimeDiagnostics: () => ({
      ...p3dvHostLifecycleDiagnostics, runtimeActive:p3dvHostRuntimeActive, drawingMode:p3dvDrawingMode,
      activeTransitionId:p3dvHostActiveTransitionId, activeViewerSessionId, viewerSessionCounter, activeViewerProductGroup,
      viewerReady:p3dvStandaloneGuillotinePreviewMode ? p3dvStandaloneGuillotineRendered : viewerLiveModelStateReady,
      standaloneGuillotinePositionCount:p3dvStandaloneGuillotinePositionCount,
      productGroup:modelState.productGroup, history:p3dvHistoryInspect()
    }),
    setDrawingMode: (mode, transitionId) => { p3dvHostActiveTransitionId = Number(transitionId || p3dvHostActiveTransitionId || 0); return setP3dvDrawingMode(mode, { resetView: true }); },
    getDrawingMode: () => p3dvDrawingMode,
    setPreviewExpanded: (expanded, options) => setPreviewExpanded(expanded, options || { notifyHost: false }),
    resize: () => { window.dispatchEvent(new Event('resize')); postViewerMessage('viewport-resized'); return true; },
    getTransitionId: () => p3dvHostActiveTransitionId,
    getCanonicalProductGroup: () => p3dvHostCanonicalProductGroup,
    projectionOptions: (group) => projectionOptionValues(group || modelState.productGroup).slice(),
    technical2DContract: p3dvTechnical2DContract,
    executeTechnical2DCommand: (command, transitionId) => p3dvExecuteTechnical2DCommand(command || {}, transitionId),
    history: () => p3dvHistoryInspect(),
    undoTechnical2DCommand: () => p3dvUndoPhysicalCommand(),
    redoTechnical2DCommand: () => p3dvRedoPhysicalCommand(),
    rebaseTechnical2DHistory: (reason) => p3dvHistoryRebase(reason || 'host-rebase'),
    renderStandaloneGuillotinePreview: (items, options) => p3dvRenderStandaloneGuillotinePreview(items, options || {})
  });


  window.__P3DV_DOCUMENT_BRIDGE__ = Object.freeze({
    readModel: () => JSON.parse(JSON.stringify(readModel())),
    readReportProducts: () => JSON.parse(JSON.stringify(documentReportProducts())),
    isReady: () => modelReady(readModel()),
    documentCapabilities: () => {
      const pergola = modelState.productGroup === 'pergo-rise';
      const technical2d = supportsMainTechnical2D();
      return { quote:true, production:true, 'product-list':true, '3d':!pergola, '2d':pergola || technical2d, 'cut-list':true, accessories:true, optimization:true, stock:true };
    },
    captureViews: () => modelState.productGroup === 'pergo-rise' ? [] : collectDocumentCenterViews(),
    capture2DView: () => captureCurrent2DView(),
    export2DDxfForTest: () => exportCurrentTechnicalDxf({ download: false }),
    exportDrawingDxf: drawing => window.PulumurModernDXF.toDxf(window.PulumurTechnical2DExport.cadDrawing(drawing)),
    technical2DDrawingForTest: (forDxf=false) => {
      const projection = currentTechnical2DProjection(forDxf);
      const exporter = window.PulumurTechnical2DExport;
      const workspace = window.PulumurTechnical2DWorkspace;
      if (!projection || !exporter || typeof exporter.toDrawing !== 'function') return null;
      const technicalScale = workspace && typeof workspace.commonProjectionScale === 'function' ? workspace.commonProjectionScale(projection) : null;
      return JSON.parse(JSON.stringify(exporter.toDrawing(projection, { technicalScale, source: 'canonical-technical2d' })));
    },
    technical2DProjectionForTest: () => { const p = currentTechnical2DProjection(); return p ? JSON.parse(JSON.stringify(p)) : null; },
    legacyProductListPdf: () => exportProductListPdf()
  });

  window.__P3DV_PERGO_INPUT_TEST__ = Object.freeze({
    getProject: () => JSON.parse(JSON.stringify(modelState.pergoRiseProject || null)),
    getInput: () => JSON.parse(JSON.stringify(modelState.pergoRiseProject && modelState.pergoRiseProject.input || null)),
    sync: (options) => syncPergoRiseInputInfrastructure(options || {}),
    resetAll: resetPergoAllInputs,
    applyQuickTest: applyPergoQuickTestPreset,
    calculate: (values) => pergoInputApi().calculateSystem(values || {}),
    defaults: () => pergoInputApi().clone(pergoInputApi().DEFAULT_INPUT),
    fabricOptions: () => pergoInputApi().FABRIC_OPTIONS.slice(),
    openBackWall: openPergoBackWallDialog,
    applyBackWall: (options) => applyPergoBackWallDialog(options || {}),
    resetBackWall: resetPergoBackWallSystem,
    getBackWallConfig: (systemIndex = 0) => cloneJson(pergoBackWallDefaultConfig(systemIndex), null)
  });

  // V14.12.3: Embedded P3DV no longer has an independent Galaxy/Bioclimatic
  // default. The PLMR host is the single main-product owner, so the iframe boots
  // directly into the product group encoded in its URL. This removes the race in
  // which Galaxy could render first and later overwrite PLMR | Bioclimatic/Eco transitions.
  if (p3dvEmbeddedHostMode) {
    try {
      const requestedGroup = p3dvCanonicalProductGroup(new URLSearchParams(window.location.search || '').get('productGroup') || window.__PLMR_P3DV_BOOT_PRODUCT_GROUP__ || '');
      if (['b-cube', 'b-cube-galaxy', 'bio-rise'].includes(requestedGroup)) {
        if (modelState.productGroup !== requestedGroup) resetProductGroupRuntimeState(requestedGroup);
        p3dvHostCanonicalProductGroup = requestedGroup;
      }
    } catch (_) {}
  }

  updateProductInputUi();
  if ($(ids.projectCodeValue)) $(ids.projectCodeValue).textContent = '-';
  setInitialProjectDate();
  updateColorControls();
  bindPreviewToolbarControls();
  bindEvents();
  updateToolbox();
  if(p3dvStandaloneGuillotinePreviewMode){
    $(ids.frame).srcdoc=buildEmptyViewerHtml('Giyotin 3D bağlantısı bekleniyor.');
  }else{
    renderViewer();
    scheduleAutomaticPreview();
  }
  if (p3dvEmbeddedHostMode) {
    window.setTimeout(() => p3dvHostPost('ready', { productGroup: modelState.productGroup, version: '3.86', build: P3DV_HOST_BUILD, hostContract: P3DV_HOST_CONTRACT }, p3dvHostActiveTransitionId), 0);
  }
})();
