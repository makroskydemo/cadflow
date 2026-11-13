(function (root) {
  'use strict';

  const SCHEMA = 'p3dv-pergo-rise-input-v1';
  const LIMITS = Object.freeze({
    maxSystems: 30,
    maxWidthDigits: 5,
    maxOpeningDigits: 5,
    maxHeightDigits: 4,
    maxRayCountDigits: 1,
    maxPostCountDigits: 2
  });

  const DEFAULT_INPUT = Object.freeze({
    product: 'Pergo Rise', moduleName: 'Module 1', engine: 'Web DXF',
    customer: '', project: '', version: '01', drawnBy: 'AYETULLAH KILINC', date: '',
    systemCount: '', width: '', opening: '', rearHeight: '', frontHeight: '', rayCount: '', postCount: '',
    parapet: 'HAYIR', parapetHeight: '-', glassTrack: 'HAYIR', glassRayBoundaryMode: 'DARALT', sideTrack: 'HAYIR',
    structureColor: '-', fabric: '-', fabricProfiles: '-', motor: '-', remote: '-', led: '-', dimmer: '-', extras: '-',
    triangleJoinery: 'HAYIR', waterStandard: 'EVET', waterOutletPlacement: 'BOTH',
    __manualPostPlacementMode: 'standard',
    __glassTrackProfile: null,
    __glassTrackSupportProfiles: {},
    __sideFeatureState: {},
    __glassTrackLengthOffsets: {},
    __triangleDivisionState: {},
    __rearSupport: { type: 'wall' },
    __backWallState: { left: { enabled: true, xOffset: 0, depth: 600, height: 0 }, right: { enabled: true, xOffset: 0, depth: 600, height: 0 }, middle: {} },
    __backWallSegments: { side: {} },
    __backWallGridState: { side: {} },
    __trapezSheetBounds: {},
    __hiddenDimensionIds: [],
    __frontPostProfiles: [],
    __sidePosts: {},
    __sideAutoSupportSuppressed: {},
    __customRayPositions: {},
    __frontPostExtensions: [],
    __parapetSegments: { front: [], side: {} },
    __topBackWallSegments: {},
    __topBackWallGridState: {},
    __gutterEditState: { minusXDelta: 0, plusXDelta: 0, groups: {} },
    __waterOutletPipeState: { diameter: 70, length: 300, offsets: {}, deleted: {} },
    __upperTableTransform: {},
    __frontPostCenters: null,
    __sideSupportCenters: {},
    __slidingPlacements: [],
    __sideSlidingPlacements: [],
    __guillotinePlacements: [],
    __sideGuillotinePlacements: [],
    __zipScreenPlacements: [],
    __sideZipScreenPlacements: [],
    __independentSideViewVisibility: {},
    __editingState: { schema: 'p3dv-pergo-rise-editing-v3', revision: 0, selectedTargetId: null, lastChangedPaths: [], history: [] }
  });

  const FABRIC_OPTIONS = Object.freeze([
    '-',
    'C 1602 - 3D (8118-1622)',
    'C 3017 - 3D',
    'C 3105 - 3D',
    'C 6001 - 3D',
    'C 7019 - 3D (8118-7024)',
    'C 7075 - 3D (8118-7340)',
    'C 7995 - 3D (8118-7999)',
    'C 9012 - 3D (8118-9002)',
    'C 1602 - M (8116-1622)',
    'C 1638 - M',
    'C 7009 - M',
    'C 9012 - M (8116-9002)',
    'C 1602 - K (8290-1622)',
    'C 9012 - D (8290-9002)'
  ]);

  const MOTOR_OPTIONS = Object.freeze(['-', 'RISING MOTOR', 'SOMFY RTS', 'SOMFY IO']);
  const REMOTE_OPTIONS_BY_MOTOR = Object.freeze({
    'RISING MOTOR': Object.freeze(['-', 'RISING 6 CHANNELS']),
    'SOMFY RTS': Object.freeze(['-', 'SITUO 2 RTS', 'SITUO 5 RTS', 'TELIS 16 RTS']),
    'SOMFY IO': Object.freeze(['-', 'SITUO 2 IO', 'SITUO 5 IO']),
    '-': Object.freeze(['-']),
    '': Object.freeze(['-'])
  });

  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function trUpper(value) {
    return String(value == null ? '' : value)
      .trim()
      .replace(/ı/g, 'i').replace(/İ/g, 'I')
      .replace(/ş/g, 's').replace(/Ş/g, 'S')
      .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
      .replace(/ü/g, 'u').replace(/Ü/g, 'U')
      .replace(/ö/g, 'o').replace(/Ö/g, 'O')
      .replace(/ç/g, 'c').replace(/Ç/g, 'C')
      .toUpperCase();
  }
  function normalizeYesNo(value, fallback) {
    const key = trUpper(value);
    if (['EVET', 'YES', 'E', 'Y'].includes(key)) return 'EVET';
    if (['HAYIR', 'NO', 'H', 'N'].includes(key)) return 'HAYIR';
    return fallback || 'HAYIR';
  }
  function normalizeProjectText(value, multiline) {
    let text = String(value == null ? '' : value)
      .replace(/\r\n/g, '\n').replace(/\r/g, '\n')
      .replace(/[çÇ]/g, 'C').replace(/[ğĞ]/g, 'G')
      .replace(/[ıİi]/g, 'I').replace(/[öÖ]/g, 'O')
      .replace(/[şŞ]/g, 'S').replace(/[üÜ]/g, 'U')
      .replace(/[–—−]/g, '-').replace(/[“”]/g, '"').replace(/[‘’]/g, "'")
      .replace(/\u00a0/g, ' ');
    if (typeof text.normalize === 'function') text = text.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
    text = text.toUpperCase().replace(/[^\x09\x0A\x20-\x7E]/g, '');
    if (multiline) return text.replace(/\t/g, ' ').split('\n').slice(0, 5).map(line => line.slice(0, 82)).join('\n');
    return text.replace(/\n/g, ' ').replace(/[\t ]+/g, ' ').replace(/^ +| +$/g, '');
  }
  function filterToken(value, maxDigits, allowNo, allowColon) {
    const policy = root.PulumurInputLimitPolicy;
    if (policy && typeof policy.filterTokenInput === 'function') {
      return policy.filterTokenInput(value, { maxDigits, allowNo: !!allowNo, allowColon: !!allowColon });
    }
    return String(value == null ? '' : value).toLocaleUpperCase('tr-TR').replace(/[^0-9;:NO]/g, '');
  }
  function sanitizeField(field, value) {
    if (field === 'systemCount') return String(value == null ? '' : value).replace(/[^0-9]/g, '').slice(0, 2);
    if (field === 'width') return filterToken(value, LIMITS.maxWidthDigits, true, true);
    if (field === 'opening') return filterToken(value, LIMITS.maxOpeningDigits, true, true);
    if (field === 'rearHeight' || field === 'frontHeight') return filterToken(value, LIMITS.maxHeightDigits, false, true);
    if (field === 'rayCount') return filterToken(value, LIMITS.maxRayCountDigits, false, true);
    if (field === 'postCount') return filterToken(value, LIMITS.maxPostCountDigits, false, true);
    if (field === 'parapetHeight') return String(value == null ? '' : value).replace(/[^0-9]/g, '').slice(0, 5) || '-';
    if (['parapet', 'glassTrack', 'triangleJoinery'].includes(field)) return normalizeYesNo(value, 'HAYIR');
    if (field === 'waterStandard') return normalizeYesNo(value, 'EVET');
    if (field === 'glassRayBoundaryMode') return trUpper(value) === 'DEGISTIRME' ? 'DEGISTIRME' : 'DARALT';
    if (field === 'waterOutletPlacement') return ['FRONT', 'SIDES', 'BOTH'].includes(trUpper(value)) ? trUpper(value) : 'BOTH';
    if (field === 'extras') return normalizeProjectText(value, true) || '-';
    if (['structureColor', 'fabric', 'fabricProfiles', 'motor', 'remote', 'led', 'dimmer'].includes(field)) return normalizeProjectText(value, false) || '-';
    return value;
  }
  function migrateLegacyProfile(profile) {
    if (!profile || typeof profile !== 'object' || Array.isArray(profile)) return profile;
    const next = clone(profile);
    if (String(next.mode || '').trim().toLowerCase() === 'custom') next.mode = 'other';
    return next;
  }
  function migrateLegacyProfiles(source) {
    if (Array.isArray(source.__frontPostProfiles)) source.__frontPostProfiles = source.__frontPostProfiles.map(migrateLegacyProfile);
    if (source.__glassTrackProfile && typeof source.__glassTrackProfile === 'object') source.__glassTrackProfile = migrateLegacyProfile(source.__glassTrackProfile);
    if (source.__sidePosts && typeof source.__sidePosts === 'object') {
      Object.keys(source.__sidePosts).forEach(key => {
        if (!Array.isArray(source.__sidePosts[key])) return;
        source.__sidePosts[key] = source.__sidePosts[key].map(item => {
          const next = item && typeof item === 'object' ? clone(item) : item;
          if (next && next.profile) next.profile = migrateLegacyProfile(next.profile);
          return next;
        });
      });
    }
    return source;
  }
  function normalizeRaw(raw) {
    const supplied = raw && typeof raw === 'object' ? clone(raw) : {};
    const source = { ...clone(DEFAULT_INPUT), ...supplied };
    Object.keys(DEFAULT_INPUT).forEach(field => {
      if (field.startsWith('__')) return;
      source[field] = sanitizeField(field, source[field]);
    });
    // PLMR keeps editor state in hidden raw fields. Preserve every supplied hidden field,
    // clone it defensively and only apply a default when the field is absent or malformed.
    Object.keys(DEFAULT_INPUT).filter(field => field.startsWith('__')).forEach(field => {
      const fallback = clone(DEFAULT_INPUT[field]);
      const value = source[field];
      if (Array.isArray(fallback)) source[field] = Array.isArray(value) ? clone(value) : fallback;
      else if (fallback && typeof fallback === 'object') source[field] = value && typeof value === 'object' && !Array.isArray(value) ? clone(value) : fallback;
      else source[field] = value == null ? fallback : value;
    });
    source.__rearSupport = source.__rearSupport && typeof source.__rearSupport === 'object' ? clone(source.__rearSupport) : { type: 'wall' };
    source.__backWallState = source.__backWallState && typeof source.__backWallState === 'object' ? clone(source.__backWallState) : clone(DEFAULT_INPUT.__backWallState);
    source.__backWallSegments = source.__backWallSegments && typeof source.__backWallSegments === 'object' ? clone(source.__backWallSegments) : { side: {} };
    source.__backWallGridState = source.__backWallGridState && typeof source.__backWallGridState === 'object' ? clone(source.__backWallGridState) : { side: {} };
    source.__topBackWallSegments = source.__topBackWallSegments && typeof source.__topBackWallSegments === 'object' ? clone(source.__topBackWallSegments) : {};
    source.__topBackWallGridState = source.__topBackWallGridState && typeof source.__topBackWallGridState === 'object' ? clone(source.__topBackWallGridState) : {};
    source.__gutterEditState = source.__gutterEditState && typeof source.__gutterEditState === 'object' ? clone(source.__gutterEditState) : { minusXDelta: 0, plusXDelta: 0, groups: {} };
    source.__waterOutletPipeState = source.__waterOutletPipeState && typeof source.__waterOutletPipeState === 'object' ? clone(source.__waterOutletPipeState) : clone(DEFAULT_INPUT.__waterOutletPipeState);
    migrateLegacyProfiles(source);
    if (root.P3DVPergoRiseEditing && typeof root.P3DVPergoRiseEditing.normalizeState === 'function') source.__editingState = root.P3DVPergoRiseEditing.normalizeState(source.__editingState);
    return source;
  }
  function normalizeOwnership(value) {
    return {
      rayCount: !!(value && value.rayCount),
      postCount: !!(value && value.postCount)
    };
  }
  function remoteOptions(motor) {
    return REMOTE_OPTIONS_BY_MOTOR[trUpper(motor)] || REMOTE_OPTIONS_BY_MOTOR['-'];
  }
  function recalculate(raw, ownershipValue) {
    const input = normalizeRaw(raw);
    const ownership = normalizeOwnership(ownershipValue);
    const bridge = root.PulumurExcelBridge;
    const rules = root.PulumurMultiPositionRules;
    if (!bridge || typeof bridge.autoRayPostCount !== 'function') throw new Error('PLMR Pergola hesap motoru yüklenmedi.');
    const auto = bridge.autoRayPostCount(
      input.systemCount,
      input.width,
      input.frontHeight,
      input.glassTrack,
      input.glassRayBoundaryMode,
      input.__sideFeatureState
    );
    if (rules && typeof rules.parseIndependentWidthGroups === 'function') {
      const independent = rules.parseIndependentWidthGroups(input.width, {
        standardGap: bridge.SAYFA1_DEFAULTS.standardPhysicalSystemGap,
        minNoGap: bridge.SAYFA1_DEFAULTS.minimumNoPhysicalGap
      });
      if (independent && independent.ok && independent.independent) input.systemCount = String(independent.totalPositionCount);
    }
    if (!ownership.rayCount) input.rayCount = auto.rayText || '';
    const postValue = bridge.postCountFromRayText(input.rayCount, input.systemCount, input.width, input.frontHeight);
    if (!ownership.postCount) input.postCount = postValue === null || postValue === undefined ? '' : String(postValue);
    const allowedRemote = remoteOptions(input.motor);
    if (!allowedRemote.includes(input.remote)) input.remote = allowedRemote[0] || '-';
    return { input, ownership, auto, remoteOptions: allowedRemote.slice() };
  }
  function missingRequired(input) {
    return ['systemCount', 'width', 'opening', 'rearHeight', 'frontHeight'].filter(field => !String(input && input[field] || '').trim());
  }
  function createDraft(raw, options) {
    const calculated = recalculate(raw, options && options.ownership);
    const draft = {
      schema: SCHEMA,
      productId: 'pergo-rise-3d-v1',
      source: {
        projectModel: 'PLMR Pergo Rise Project Model',
        dataEntry: 'PLMR.V.13.92(1)/app.js',
        calculator: 'PLMR.V.13.92(1)/peri01ExcelBridge.js',
        geometryRules: 'PLMR.V.13.92(1)/peri01Geometry.js'
      },
      input: calculated.input,
      ownership: calculated.ownership,
      calculated: {
        rayText: calculated.input.rayCount,
        postText: calculated.input.postCount,
        autoRayText: calculated.auto.rayText || '',
        autoPostCount: calculated.auto.postCount,
        rayList: Array.isArray(calculated.auto.rayList) ? calculated.auto.rayList.slice() : [],
        postList: Array.isArray(calculated.auto.postList) ? calculated.auto.postList.slice() : [],
        positionCount: Number(calculated.auto.positionCount || 0),
        widthMode: calculated.auto.widthMode || '',
        nominalWidths: Array.isArray(calculated.auto.nominalWidths) ? calculated.auto.nominalWidths.slice() : [],
        mechanismWidths: Array.isArray(calculated.auto.mechanismWidths) ? calculated.auto.mechanismWidths.slice() : [],
        rayProfileWidths: Array.isArray(calculated.auto.rayProfileWidths) ? calculated.auto.rayProfileWidths.slice() : [],
        physicalGaps: Array.isArray(calculated.auto.physicalGaps) ? calculated.auto.physicalGaps.slice() : []
      },
      missing: missingRequired(calculated.input),
      valid: false,
      errors: []
    };
    if (!draft.missing.length && root.PulumurGeometry && typeof root.PulumurGeometry.normalizeInput === 'function') {
      try {
        draft.normalized = root.PulumurGeometry.normalizeInput(calculated.input);
        draft.valid = true;
      } catch (error) {
        draft.errors.push(error && error.message ? error.message : String(error));
      }
    }
    return draft;
  }
  function calculateSystem(values) {
    if (!root.PulumurExcelBridge || typeof root.PulumurExcelBridge.calculateSystem !== 'function') throw new Error('Pülümür Hesaplayıcı yüklenmedi.');
    return root.PulumurExcelBridge.calculateSystem(values || {});
  }

  root.P3DVPergoRiseInput = Object.freeze({
    SCHEMA,
    LIMITS,
    DEFAULT_INPUT,
    FABRIC_OPTIONS,
    MOTOR_OPTIONS,
    REMOTE_OPTIONS_BY_MOTOR,
    clone,
    trUpper,
    normalizeYesNo,
    normalizeProjectText,
    sanitizeField,
    normalizeRaw,
    normalizeOwnership,
    remoteOptions,
    recalculate,
    createDraft,
    calculateSystem
  });
  if (typeof module !== 'undefined') module.exports = root.P3DVPergoRiseInput;
})(typeof window !== 'undefined' ? window : globalThis);
