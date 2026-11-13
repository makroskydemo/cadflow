/* Presentation-only projection, shared by browser, local store and Worker.
   Unknown fields are never copied; legacy business metadata is discarded. */
(function (root, factory) { const api = factory(); if (typeof module === 'object' && module.exports)
    module.exports = api; root.PLMRShareContract = api; })(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';
    const TYPES = ['guillotine', 'sliding', 'door', 'fixed', 'zip', 'folding', 'balcony'];
    const own = (v, k) => Object.prototype.hasOwnProperty.call(v || {}, k);
    function object(v) { if (!v || typeof v !== 'object' || Array.isArray(v))
        throw Error('Sunum nesnesi geçersiz.'); return v; }
    function primitive(v) { if (v === null || typeof v === 'boolean' || typeof v === 'string' && v.length <= 10000 || typeof v === 'number' && Number.isFinite(v))
        return v; throw Error('Sunum alanı geçersiz.'); }
    function fields(raw, keys) { const out = {}; object(raw); for (const k of keys.split(' '))
        if (own(raw, k))
            out[k] = primitive(raw[k]); return out; }
    function vector(v) { if (!Array.isArray(v) || v.length > 1000)
        throw Error('Sunum dizisi geçersiz.'); return v.map(primitive); }
    function map(raw, fn) { object(raw); const out = {}; for (const [key, value] of Object.entries(raw)) {
        if (['__proto__', 'constructor', 'prototype'].includes(key))
            throw Error('Sunum anahtarı geçersiz.');
        out[key] = fn(value);
    } return out; }
    function optional(out, raw, key, fn) { if (own(raw, key) && raw[key] != null)
        out[key] = fn(raw[key]); }
    function pose(v) { return fields(v, 'x y z angle'); }
    function color(v) { return fields(v, 'hex code kind finish texture image schematic'); }
    // These are physical/render properties, never unrestricted working objects.
    const PHYSICAL_KEYS = new Set('positionRatio positionYRatio scopeStartRatio scopeEndRatio originX originY originZ positionX positionY positionZ span surface zoneId facadeId profileSourceId beamBottomY startBoundaryId endBoundaryId globalBaseWidth globalStartRatio globalEndRatio postBounded boundaryKinds physicalBoundaryKeys boundaryOwners boundaryModuleIndices group connection physicalKey ownerIds frameAngle frameCenter center x1 x2 y1 y2 z1 z2 scope minN maxN nmin nmax normalAxis added profileId memberId source baseX baseZ moduleIndices axisIndex extents delta positions step lineAxes moduleWidths moduleDepths modulePanelCounts id uid type version schemaVersion width depth height x y z w h u v axis sign at uAxis vAxis u0 u1 v0 v1 cellId row lineIndex sourceIndex moduleIndex sharedBoundary outerLine top bottom length value angle rotation elevation thickness defaultDepth nextSolid templateId templateRole orientation inward defaultInward outerFaceV bottomY topY cx cz owner ownerId start end offset deleted sharedWith sharedX sharedZ commonGroup min max a b section pose origin frame t normal startX startZ endX endZ left right front back rear vertical horizontal thickness depthOffset gap count index fixed postId startPostId endPostId wallId supportWallId startBoundary endBoundary startBoundaryWidth endBoundaryWidth leftBoundaryWidth rightBoundaryWidth custom widthMode heightMode colorMode colorCode color finish parapet minX maxX minY maxY minZ maxZ boundary ownerType side moduleId startMemberId endMemberId isPost isBeam isGutter isWall isRoofZone isConnectionZone isInternalZone plane solids segments zone hiddenRoles verticalCuts horizontalCuts'.split(' '));
    function physical(v, depth = 0) { if (depth > 24)
        throw Error('Sunum geometrisi çok derin.'); if (v === null || typeof v !== 'object')
        return primitive(v); if (Array.isArray(v))
        return v.map(x => physical(x, depth + 1)); const out = {}; for (const [key, value] of Object.entries(v))
        if (PHYSICAL_KEYS.has(key))
            out[key] = physical(value, depth + 1); return out; }
    function numericMap(v) { return map(v, x => { if (typeof x !== 'number' && typeof x !== 'boolean')
        throw Error('Sunum hareketi geçersiz.'); return primitive(x); }); }
    function partition(value) { if (!value)
        return ''; const raw = JSON.parse(value); if (raw.version !== 1)
        throw Error('Bölme düzeni desteklenmiyor.'); function node(n, depth = 0) { if (n === null)
        return null; if (depth > 16 || !['H', 'V'].includes(n?.axis) || !Number.isFinite(n.ratio) || n.ratio <= 0 || n.ratio >= 1)
        throw Error('Bölme düzeni geçersiz.'); return { axis: n.axis, ratio: n.ratio, a: node(n.a, depth + 1), b: node(n.b, depth + 1) }; } return JSON.stringify({ version: 1, regions: map(raw.regions, n => node(n)) }); }
    const OPTION_KEYS = 'systemType mechanism glassType glassThickness glassThicknessOther glassColor glassColorOther panelLayout fixedPanelHeightMode fixedPanelHeightCustom systemColor surface defaultView defaultMotorDirection motor remote remoteQuantity series type customGlassThickness customGlassColor slidingView openingType openingDirection panelCountMode panelCount doorType hingeDirection activeLeaf doorOpenDirection handleType movingLeafWidth movingLeafHeight verticalDivisions horizontalDivisions horizontalHeightMode horizontalHeights placementLocation motorDirection cableDirection fabricColor motorType remoteSelections openingMode subtype panels foldingView foldingOpenDirection fabric side opening view motorSide panelType fixedHeight fixedPanelHeight colorCode collectionState bottomPanelState swingDirection';
    function options(raw = {}) { const out = fields(raw, OPTION_KEYS.split(' ').filter(k => k !== 'systemColor').join(' ')); if (own(raw, 'systemColor'))
        out.systemColor = raw.systemColor && typeof raw.systemColor === 'object' ? color(raw.systemColor) : primitive(raw.systemColor); if (own(raw, 'divisionLayout'))
        out.divisionLayout = partition(raw.divisionLayout); optional(out, raw, 'variableSelections', v => numericMap(v)); return out; }
    function layout(raw = {}) { const out = fields(raw, 'columns previewMode openState showDimensions'); optional(out, raw, 'dimensionUnits', v => fields(v, 'mm inch ft')); optional(out, raw, 'positionOrder', vector); return out; }
    function workspace(raw) { const out = fields(raw, 'schema version productId applicationVersion inputUnit'); out.projectInfo = {}; out.settings = options(raw.settings); if (!Array.isArray(raw.positions) || raw.positions.length > 200)
        throw Error('Sunum poz listesi geçersiz.'); out.positions = raw.positions.map(p => ({ ...fields(p, 'id positionNo width height quantity inputUnit open progress view motorDirection'), description: '', overrides: options(p.overrides) })); out.drawingLayout = layout(raw.drawingLayout); return out; }
    function placement(raw) { if (!TYPES.includes(raw.type))
        throw Error('Sunum ürün türü desteklenmiyor.'); const out = { ...options(raw), ...fields(raw, 'type v07 productWidth productHeight positionCode fitRevision quantity id colorSource bioProfileColor autoFrontOnly') }; optional(out, raw, 'options', options); return out; }
    function editor(raw = {}, depth) {
        const out = fields(raw, 'groundY mainDeleted facadeZonesGenerated initialRoofOpen zoneGraphVersion');
        optional(out, raw, 'roofPose', pose);
        optional(out, raw, 'dimensionUnits', v => fields(v, 'mm inch ft'));
        optional(out, raw, 'sharedProductLayout', layout);
        optional(out, raw, 'members', v => map(v, physical));
        optional(out, raw, 'zoneRotations', numericMap);
        optional(out, raw, 'roofProducts', v => map(v, x => fields(x, 'id rotation open initialOpen revision')));
        optional(out, raw, 'bioCodes', v => map(v, primitive));
        optional(out, raw, 'templates', v => v.map(x => physical(x)));
        optional(out, raw, 'presentation', v => fields(v, 'environment floor'));
        if (raw.nativeWorkspaces) {
            out.nativeWorkspaces = {};
            for (const [type, w] of Object.entries(raw.nativeWorkspaces)) {
                if (!TYPES.includes(type))
                    throw Error('Sunum ürün türü desteklenmiyor.');
                out.nativeWorkspaces[type] = workspace(w);
            }
        }
        if (raw.roofCopies) {
            if (!Array.isArray(raw.roofCopies) || raw.roofCopies.length > 1000 || depth > 2)
                throw Error('Sunum çatı listesi geçersiz.');
            out.roofCopies = raw.roofCopies.map(c => ({ id: primitive(c.id), pose: pose(c.pose || {}), spec: model(c.spec, depth + 1) }));
        }
        return out;
    }
    function model(raw, depth = 0) {
        object(raw);
        const out = fields(raw, 'productGroup width depth height panelCount lamellaCount productsOpen panelMasterOpen colorMode systemCount multiAlignment rowAlignment panelCollection panelColorIndependent panelFill motor remote led dimmer parapet parapetHeight waterStandard pozNo nextZoneNumber nextSketchWallNumber');
        for (const key of ['moduleWidths', 'moduleDepths', 'modulePanelCounts', 'orientations'])
            optional(out, raw, key, vector);
        for (const key of ['postSections', 'beamSection', 'facadeProfiles', 'zoneDividers', 'sketchWalls', 'multiRows', 'initialDimensions'])
            optional(out, raw, key, v => ['facadeProfiles', 'zoneDividers'].includes(key) ? map(v, physical) : physical(v));
        for (const key of ['systemColor', 'panelColor'])
            optional(out, raw, key, color);
        optional(out, raw, 'inputDrafts', v => fields(v, 'width depth height'));
        optional(out, raw, 'glassPreferences', v => fields(v, 'color customColor thickness'));
        for (const key of ['placements', 'zipPlacements'])
            optional(out, raw, key, v => map(v, placement));
        for (const key of ['productOpenStates', 'panelStates'])
            optional(out, raw, key, numericMap);
        optional(out, raw, 'systemSelection', v => ({ ...fields(v, 'id locked'), applied: numericMap(v.applied || {}) }));
        optional(out, raw, 'zoneRegistry', v => map(v, z => ({ ...fields(z, 'uid number code'), ...(z.positionRefs ? { positionRefs: vector(z.positionRefs) } : {}) })));
        optional(out, raw, 'codeRegistry', v => ({ next: numericMap(v.next), items: map(v.items, x => fields(x, 'code owner prefix active')) }));
        out.sceneEditor = editor(raw.sceneEditor, depth);
        out.extras = '';
        out.selectedZoneId = null;
        return out;
    }
    function snapshot(raw) { object(raw); if (raw.schema !== 'p3dv-host-snapshot-v1')
        throw Error('Sunum proje türü desteklenmiyor.'); return { schema: raw.schema, productInputSchema: typeof raw.productInputSchema === 'string' ? raw.productInputSchema : 'p3dv-product-input-v1', p3dvVersion: typeof raw.p3dvVersion === 'string' ? raw.p3dvVersion : '3.86', modelState: model(raw.modelState), v24ActiveProduct: TYPES.includes(raw.v24ActiveProduct) ? raw.v24ActiveProduct : 'rolling-roof', operationJournal: [], zonesVisible: false, dimensionVisibility: { main: false, intermediate: false, total: false, positions: false, information: false }, viewerCameraState: null }; }
    return Object.freeze({ snapshot });
});
