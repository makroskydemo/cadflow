(function (root, factory) {
  const api = factory(root && root.P3DVBioRiseMultiPosition);
  if (typeof module === 'object' && module.exports) {
    let shared = null;
    try { shared = require('../bio-rise/bio-rise-multi-position.js'); } catch (_) {}
    module.exports = factory(shared);
  } else if (root) root.P3DVGalaxyMultiPosition = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (sharedApi) {
  'use strict';

  const SCHEMA_VERSION = 'p3dv-bcube-galaxy-multi-position-v1';
  const PRODUCT_ID = 'b-cube-galaxy';
  const DEFAULT_POST = Object.freeze({ x: 180, z: 140 });
  const DEFAULT_BEAM = Object.freeze({ vertical: 225, thickness: 40 });
  const DEFAULT_SIDE_FRAME_WIDTH = 80;
  const DEFAULT_GUTTER_WIDTH = 98;
  const DEFAULT_GUTTER_CLEARANCE = 2;
  const MAX_SYSTEM_COUNT = sharedApi && sharedApi.MAX_SYSTEM_COUNT || 20;

  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function renameIds(value) {
    if (Array.isArray(value)) return value.map(renameIds);
    if (!value || typeof value !== 'object') return typeof value === 'string' ? value.replace(/bio-rise/g, 'galaxy') : value;
    const result = {};
    Object.keys(value).forEach((key) => { result[key] = renameIds(value[key]); });
    return result;
  }

  function build(input) {
    if (!sharedApi || typeof sharedApi.build !== 'function') {
      return { schemaVersion: SCHEMA_VERSION, productId: PRODUCT_ID, valid: false, errors: ['BIO_RISE_SHARED_ENGINE_MISSING'], modules: [], posts: [], beams: [] };
    }
    const source = input && typeof input === 'object' ? input : {};
    const postSections = Array.isArray(source.postSections) && source.postSections.length >= 4
      ? source.postSections
      : Array.from({ length: 4 }, () => ({ ...DEFAULT_POST }));
    const layout = sharedApi.build({
      ...source,
      postSections,
      interiorPostSection: source.interiorPostSection || DEFAULT_POST,
      beamSection: source.beamSection || DEFAULT_BEAM,
      beamVertical: source.beamVertical == null ? DEFAULT_BEAM.vertical : source.beamVertical,
      sideFrameWidth: source.sideFrameWidth == null ? DEFAULT_SIDE_FRAME_WIDTH : source.sideFrameWidth,
      sideGutterWidth: source.sideGutterWidth == null ? DEFAULT_GUTTER_WIDTH : source.sideGutterWidth,
      gutterClearance: source.gutterClearance == null ? DEFAULT_GUTTER_CLEARANCE : source.gutterClearance
    });
    const independent = renameIds(clone(layout));
    independent.schemaVersion = SCHEMA_VERSION;
    independent.productId = PRODUCT_ID;
    independent.modules = (independent.modules || []).map((module) => {
      const item = { ...module };
      item.leftGutterOuterX = item.outerMinX + DEFAULT_SIDE_FRAME_WIDTH + DEFAULT_GUTTER_CLEARANCE;
      item.leftGutterInnerX = item.leftGutterOuterX + DEFAULT_GUTTER_WIDTH;
      item.rightGutterOuterX = item.outerMaxX - DEFAULT_SIDE_FRAME_WIDTH - DEFAULT_GUTTER_CLEARANCE;
      item.rightGutterInnerX = item.rightGutterOuterX - DEFAULT_GUTTER_WIDTH;
      item.panelMinX = item.leftGutterInnerX;
      item.panelMaxX = item.rightGutterInnerX;
      item.panelCenterX = (item.panelMinX + item.panelMaxX) / 2;
      item.panelLength = Math.max(80, item.panelMaxX - item.panelMinX);
      const zSign = Number(item.rearToFrontSign) < 0 ? -1 : 1;
      const rearToFront = (value) => zSign * Number(value);
      const frontT = rearToFront(item.frontOuterZ);
      const rearT = rearToFront(item.rearOuterZ);
      item.rearGutterOuterT = rearT + DEFAULT_BEAM.thickness + DEFAULT_GUTTER_CLEARANCE;
      item.rearGutterInnerT = item.rearGutterOuterT + DEFAULT_GUTTER_WIDTH;
      item.frontGutterOuterT = frontT - DEFAULT_BEAM.thickness - DEFAULT_GUTTER_CLEARANCE;
      item.frontGutterInnerT = item.frontGutterOuterT - DEFAULT_GUTTER_WIDTH;
      item.rearGutterOuterZ = zSign * item.rearGutterOuterT;
      item.rearGutterInnerZ = zSign * item.rearGutterInnerT;
      item.frontGutterOuterZ = zSign * item.frontGutterOuterT;
      item.frontGutterInnerZ = zSign * item.frontGutterInnerT;
      return item;
    });
    independent.profileSpec = {
      post: { ...DEFAULT_POST },
      record: { vertical: DEFAULT_BEAM.vertical, thickness: DEFAULT_BEAM.thickness },
      sideFrameWidth: DEFAULT_SIDE_FRAME_WIDTH,
      gutterWidth: DEFAULT_GUTTER_WIDTH,
      gutterClearance: DEFAULT_GUTTER_CLEARANCE,
      frontVisibleTotal: DEFAULT_SIDE_FRAME_WIDTH + DEFAULT_GUTTER_CLEARANCE + DEFAULT_GUTTER_WIDTH,
      sideVisibleTotal: DEFAULT_BEAM.thickness + DEFAULT_GUTTER_CLEARANCE + DEFAULT_GUTTER_WIDTH
    };
    return independent;
  }

  return Object.freeze({
    SCHEMA_VERSION, PRODUCT_ID, DEFAULT_POST, DEFAULT_BEAM, DEFAULT_SIDE_FRAME_WIDTH,
    DEFAULT_GUTTER_WIDTH, DEFAULT_GUTTER_CLEARANCE, MAX_SYSTEM_COUNT, build
  });
});
