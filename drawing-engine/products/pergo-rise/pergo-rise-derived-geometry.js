(function (root) {
  'use strict';

  const mm = value => Number.isFinite(Number(value)) ? Number(value) : 0;
  const clone = value => JSON.parse(JSON.stringify(value));

  function vector(x, y, z) { return [mm(x), mm(y), mm(z)]; }
  function component(id, kind, template, start, end, extra) {
    return {
      id, kind, template,
      start: start ? vector(start[0], start[1], start[2]) : null,
      end: end ? vector(end[0], end[1], end[2]) : null,
      sourceRuleIds: [],
      ...(extra || {})
    };
  }

  function groupForSystem(d, system) {
    if (!d.independentMode) return null;
    return (d.independentPergoRiseGroups || []).find(group =>
      Number(system.index) >= Number(group.positionStartIndex) && Number(system.index) <= Number(group.positionEndIndex)
    ) || null;
  }

  function normalizedGutterEditState(d) {
    const raw = d && d.gutterEditState && typeof d.gutterEditState === 'object' ? d.gutterEditState : {};
    const minus = Number(raw.minusXDelta), plus = Number(raw.plusXDelta);
    const groups = raw.groups && typeof raw.groups === 'object' ? raw.groups : {};
    return {
      minusXDelta: Number.isFinite(minus) ? minus : 0,
      plusXDelta: Number.isFinite(plus) ? plus : 0,
      groups
    };
  }

  // Stage 4 canonical copy of PLMR peri01Geometry.gutterBounds.
  function gutterBounds(d, group) {
    const K = d.constants;
    const hasGroup = Boolean(d && d.independentMode && group);
    const defaultStart = hasGroup ? mm(group.outerStartX) - 50 : mm(K.gutterX);
    const defaultEnd = hasGroup ? mm(group.outerEndX) + 50 : mm(K.gutterX) + Math.max(1, mm(d && d.width)) + 100;
    const allState = normalizedGutterEditState(d);
    const storedGroup = hasGroup && allState.groups[String(group.groupId)] && typeof allState.groups[String(group.groupId)] === 'object'
      ? allState.groups[String(group.groupId)] : null;
    const source = hasGroup
      ? (storedGroup || (Number(group.groupIndex) === 0 ? allState : { minusXDelta: 0, plusXDelta: 0 }))
      : allState;
    const minus = Number(source.minusXDelta), plus = Number(source.plusXDelta);
    let start = defaultStart - (Number.isFinite(minus) ? minus : 0);
    let end = defaultEnd + (Number.isFinite(plus) ? plus : 0);
    if (!Number.isFinite(start)) start = defaultStart;
    if (!Number.isFinite(end)) end = defaultEnd;
    if (end - start < 100) end = start + 100;
    return {
      start, end, width: end - start, defaultStart, defaultEnd,
      minusXDelta: defaultStart - start,
      plusXDelta: end - defaultEnd,
      groupId: hasGroup ? String(group.groupId || '') : ''
    };
  }

  // Canonical PLMR top-view datum. Plain ';' width/position layouts use
  // FRONT_GUTTER_ALIGNED: the front gutter plane is shared and shorter/longer
  // openings move the rear datum. Only an explicit independent ;NO group uses
  // REAR_START_ALIGNED, where all rear datums stay at zero.
  function positionPlanDatum(d, index) {
    const i = Math.max(0, Number(index) || 0);
    const position = d && Array.isArray(d.positions) ? (d.positions[i] || d.positions[0] || {}) : {};
    const opening = mm(position.opening);
    const firstOpening = mm(d && d.openingList && d.openingList[0]) || mm(d && d.opening);
    const rearPlanY = d && d.independentMode && position.yAlignmentMode === 'REAR_START_ALIGNED'
      ? 0 : -(firstOpening - opening);
    const frontPlanY = rearPlanY - opening;
    return {
      systemIndex: i,
      positionId: String(position.positionId || ''),
      yAlignmentMode: String(position.yAlignmentMode || 'FRONT_GUTTER_ALIGNED'),
      opening,
      rearPlanY,
      frontPlanY,
      rearDatumZ: -rearPlanY,
      frontDatumZ: -frontPlanY,
      bottomDatumY: mm(position.frontHeight)
    };
  }

  function gutterDatumForSystem(d, system) {
    const index = Number(system && system.index) || 0;
    const datum = positionPlanDatum(d, index);
    return {
      ...datum,
      positionId: datum.positionId || String(system && system.positionId || ''),
      planY: datum.frontPlanY,
      plmrFrontDatumZ: datum.frontDatumZ
    };
  }

  function gutterGroups(d) {
    if (!d.independentMode) return [{ groupId: '', groupIndex: 0, systems: d.systems || [], outerStartX: d.systems[0] && d.systems[0].outerStartX, outerEndX: d.systems.at(-1) && d.systems.at(-1).outerEndX }];
    return Array.isArray(d.independentPergoRiseGroups) ? d.independentPergoRiseGroups : [];
  }

  function gutterSegments(d) {
    const result = [];
    gutterGroups(d).forEach(group => {
      const systems = Array.isArray(group.systems) && group.systems.length ? group.systems : (d.systems || []);
      if (!systems.length) return;
      const bounds = gutterBounds(d, d.independentMode ? group : null);
      const datums = systems.map(system => ({ system, ...gutterDatumForSystem(d, system) }));
      const sameZ = datums.every(item => Math.abs(item.frontDatumZ - datums[0].frontDatumZ) < 0.001);
      const sameY = datums.every(item => Math.abs(item.bottomDatumY - datums[0].bottomDatumY) < 0.001);
      const samePlmrPlanY = datums.every(item => Math.abs(item.planY - datums[0].planY) < 0.001);
      const baseId = d.independentMode ? `gutter-${group.groupId}` : 'gutter-global';
      if (systems.length === 1 || (sameZ && sameY)) {
        result.push({
          id: baseId, groupId: d.independentMode ? String(group.groupId || '') : '', segmentIndex: 0,
          start: bounds.start, end: bounds.end, bounds, ...datums[0],
          systemIndices: systems.map(item => Number(item.index) || 0),
          positionIds: datums.map(item => item.positionId),
          sourceSegmentation: 'PLMR_CONTINUOUS_GUTTER'
        });
        return;
      }
      // PLMR splits a stepped independent gutter at internal system edges with
      // a 6.5 mm half-joint on both sides. The same joint rule is used in 3D
      // whenever per-position front datums differ, so the real profile remains
      // aligned to the Stage 3 posts instead of being stretched diagonally.
      datums.forEach((datum, localIndex) => {
        const system = datum.system;
        const start = localIndex === 0 ? bounds.start : mm(system.outerStartX) - 6.5;
        const end = localIndex === systems.length - 1 ? bounds.end : mm(system.outerEndX) + 6.5;
        result.push({
          id: `${baseId}-segment-${localIndex + 1}`,
          groupId: d.independentMode ? String(group.groupId || '') : '', segmentIndex: localIndex,
          start, end, bounds: { ...bounds, start, end, width: Math.max(100, end - start) }, ...datum,
          systemIndices: [Number(system.index) || 0], positionIds: [datum.positionId],
          sourceSegmentation: d.independentMode && !samePlmrPlanY
            ? 'PLMR_STEPPED_GUTTER_6_5_MM_JOINT'
            : 'P3DV_POSITION_DATUM_STEP_WITH_PLMR_6_5_MM_JOINT'
        });
      });
    });
    return result;
  }

  function positionAtX(d, x) {
    let best = d.systems[0];
    let distance = Infinity;
    d.systems.forEach(system => {
      const left = mm(system.outerStartX), right = mm(system.outerEndX);
      const current = x < left ? left - x : (x > right ? x - right : 0);
      if (current < distance) { best = system; distance = current; }
    });
    return d.positions[best ? best.index : 0] || d.positions[0];
  }


  function frontPositionIndexAtX(d, absoluteX) {
    const x = mm(absoluteX);
    const systems = d && Array.isArray(d.systems) ? d.systems : [];
    const hit = systems.find(system => x >= mm(system.startX) - 0.001 && x <= mm(system.endX) + 0.001);
    return hit ? mm(hit.index) : 0;
  }

  function frontHeightAtX(d, absoluteX) {
    const index = frontPositionIndexAtX(d, absoluteX);
    const position = d && Array.isArray(d.positions) ? d.positions[index] : null;
    return d && d.independentMode && position && Number.isFinite(Number(position.frontHeight))
      ? mm(position.frontHeight) : mm(d && d.frontHeight);
  }

  function segmentHeightAt(segments, coordinate, fallback) {
    const list = Array.isArray(segments) ? segments : [];
    const x = mm(coordinate);
    const hit = list.find((item, index) => x >= mm(item.start) - 0.001 && (
      x < mm(item.end) - 0.001 || (index === list.length - 1 && x <= mm(item.end) + 0.001)
    ));
    if (!hit) return Math.max(0, mm(fallback));
    const start = mm(hit.start), end = mm(hit.end);
    const h0 = Math.max(0, Number.isFinite(Number(hit.startHeight)) ? mm(hit.startHeight) : mm(hit.height));
    const h1 = Math.max(0, Number.isFinite(Number(hit.endHeight)) ? mm(hit.endHeight) : mm(hit.height));
    const ratio = end - start > 0.001 ? Math.max(0, Math.min(1, (x - start) / (end - start))) : 0;
    return h0 + (h1 - h0) * ratio;
  }

  function frontParapetHeightAt(d, absoluteX) {
    const segments = d && d.parapetSegments && Array.isArray(d.parapetSegments.front)
      ? d.parapetSegments.front : [];
    return segmentHeightAt(segments, mm(absoluteX) - mm(d && d.constants && d.constants.systemStartX), d && d.parapetHeight);
  }

  function frontPostExtensionAt(d, index) {
    const value = d && Array.isArray(d.frontPostExtensions) ? Number(d.frontPostExtensions[index]) : 0;
    return Math.max(0, Number.isFinite(value) ? value : 0);
  }

  function frontPostProfileAt(d, index) {
    const custom = d && Array.isArray(d.frontPostProfiles) ? d.frontPostProfiles[index] : null;
    if (!custom) return { mode: 'standard', en: 100, boy: 100, et: 2, custom: false };
    const en = Math.max(5, mm(custom.en) || 100);
    const boy = Math.max(5, mm(custom.boy) || 100);
    const maxEt = Math.max(0, Math.min(en, boy) / 2 - 0.1);
    return {
      mode: String(custom.mode || 'other'), en, boy,
      et: Math.min(maxEt, Math.max(0, mm(custom.et) || 0)),
      custom: true
    };
  }

  function frontPostBoundsAt(d, postXs, index) {
    const xs = Array.isArray(postXs) ? postXs : [];
    const i = Math.max(0, Math.min(Math.max(0, xs.length - 1), Number(index) || 0));
    const axis = mm(xs[i]);
    const profile = frontPostProfileAt(d, i);
    const width = profile.en;
    const fixedWidth = mm(d && d.constants && d.constants.postSize) || 100;
    if (i === 0) return { left: axis - fixedWidth / 2, right: axis - fixedWidth / 2 + width, width, center: axis - fixedWidth / 2 + width / 2 };
    if (i === xs.length - 1) return { left: axis + fixedWidth / 2 - width, right: axis + fixedWidth / 2, width, center: axis + fixedWidth / 2 - width / 2 };
    return { left: axis - width / 2, right: axis + width / 2, width, center: axis };
  }



  const RAY_GROUP_TEMPLATE_LENGTHS = Object.freeze({
    rearMechanism: 33.181114,
    frontHead: 33.182068
  });

  function rotateSidePoint(x, y, pivotX, pivotY, angle) {
    const c = Math.cos(mm(angle)), s = Math.sin(mm(angle));
    const dx = mm(x) - mm(pivotX), dy = mm(y) - mm(pivotY);
    return [mm(pivotX) + dx * c - dy * s, mm(pivotY) + dx * s + dy * c];
  }

  function normalizeDirection(start, end) {
    const dy = mm(end[1]) - mm(start[1]), dz = mm(end[2]) - mm(start[2]);
    const length = Math.max(1e-9, Math.hypot(dy, dz));
    return [0, dy / length, dz / length];
  }

  function pointAlong(point, direction, distance) {
    return [mm(point[0]) + mm(direction[0]) * mm(distance), mm(point[1]) + mm(direction[1]) * mm(distance), mm(point[2]) + mm(direction[2]) * mm(distance)];
  }

  // Stage 5 canonical copy of the PLMR side-view rail-group datum. The rail
  // profile is rotated about the rear-mechanism insertion point; the front
  // head is inserted at the transformed ray end. Top-view ray axes continue
  // to come directly from system.rays (left edge + K.rayW / 2).
  function rayGroupDatum(d, system, position, axisX) {
    const K = d.constants;
    const rearHeight = mm(position && position.rearHeight);
    const angle = mm(position && position.angleRad);
    const pivotZ = mm(K.sideArkaMekOffsetX);
    const pivotY = rearHeight + mm(K.sideArkaMekOffsetY);
    const rawStartZ = mm(K.sideRayStartOffsetX);
    const rawStartY = rearHeight - mm(K.sideRayStartOffsetY);
    const rayLength = Math.max(1, mm(position && position.rayLength));
    const rear2 = rotateSidePoint(rawStartZ, rawStartY, pivotZ, pivotY, angle);
    const front2 = rotateSidePoint(rawStartZ + rayLength, rawStartY, pivotZ, pivotY, angle);
    const planDatum = positionPlanDatum(d, system && system.index);
    const rear = vector(axisX, rear2[1], rear2[0] + planDatum.rearDatumZ);
    const front = vector(axisX, front2[1], front2[0] + planDatum.rearDatumZ);
    const direction = normalizeDirection(rear, front);
    const topWallY = planDatum.rearPlanY;
    const topRayEndY = planDatum.frontPlanY - mm(K.topRayEndExtra);
    const topRayStartY = topRayEndY + (mm(position && position.opening) - mm(K.rayLengthFrontDeduct));
    return {
      axisX: mm(axisX), rear, front, direction, rayLength,
      angleRad: angle,
      rearMechanismPivot: vector(axisX, pivotY, pivotZ + planDatum.rearDatumZ),
      rawRailStart: vector(axisX, rawStartY, rawStartZ + planDatum.rearDatumZ),
      planDatum: clone(planDatum),
      topView: {
        rayLeftX: mm(system && system.rays && system.rays[0]),
        startY: topRayStartY, endY: topRayEndY,
        planLength: Math.max(1, mm(position && position.opening) - mm(K.rayLengthFrontDeduct))
      }
    };
  }


  // Stage 6 canonical copy of the PLMR top-view roof-register rules. Roof
  // registers are transverse profiles between adjacent ray inner faces. They
  // are not ray profiles and are no longer emitted as fabric-profile items.
  function topWallPlanYAt(d, index) {
    const position = d && Array.isArray(d.positions) ? (d.positions[index] || d.positions[0]) : null;
    if (d && d.independentMode && position && position.yAlignmentMode === 'REAR_START_ALIGNED') return 0;
    const firstOpening = mm(d && d.openingList && d.openingList[0]) || mm(d && d.opening);
    return -(firstOpening - mm(position && position.opening));
  }

  function topGutterPlanYAt(d, index) {
    const position = d && Array.isArray(d.positions) ? (d.positions[index] || d.positions[0]) : null;
    return topWallPlanYAt(d, index) - mm(position && position.opening);
  }

  function roofRegisterIntervals(d, system) {
    const K = d.constants;
    const rays = Array.isArray(system && system.rays) ? system.rays : [];
    const out = [];
    for (let index = 0; index < rays.length - 1; index += 1) {
      const sourceStartX = mm(rays[index]) + mm(K.rayW);
      const sourceEndX = mm(rays[index + 1]);
      if (sourceEndX - sourceStartX <= 1) continue;
      out.push({
        intervalIndex: index,
        systemIndex: mm(system && system.index),
        sourceStartX,
        sourceEndX,
        clearSpan: sourceEndX - sourceStartX,
        leftRailIndex: index,
        rightRailIndex: index + 1
      });
    }
    return out;
  }

  function validTrapezBounds(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const out = { minX: Number(raw.minX), maxX: Number(raw.maxX), minY: Number(raw.minY), maxY: Number(raw.maxY) };
    if (!Object.values(out).every(Number.isFinite)) return null;
    if (out.maxX - out.minX < 50 || out.maxY - out.minY < 50) return null;
    return out;
  }

  function roofRegisterPlanState(d, system, position) {
    const K = d.constants;
    const systemIndex = mm(system && system.index);
    const fixedMinY = topWallPlanYAt(d, systemIndex) + mm(K.catiProfilY);
    const shift = (mm(position && position.rayLength) / mm(K.catiProfilRayRatioBase)) * mm(K.catiProfilRayRatioMove) + mm(K.catiProfilExtraOffset);
    const rayEndY = topGutterPlanYAt(d, systemIndex) - mm(K.topRayEndExtra);
    const rayStartY = rayEndY + (mm(position && position.opening) - mm(K.rayLengthFrontDeduct));
    const rays = Array.isArray(system && system.rays) ? system.rays : [];
    const firstRayX = rays.length ? mm(rays[0]) : mm(system && system.rayAreaStartX);
    const lastRayX = rays.length ? mm(rays[rays.length - 1]) : mm(system && system.rayAreaEndX);
    const defaultBounds = {
      minX: firstRayX + 40 - 46,
      maxX: lastRayX + 40 + 46,
      minY: fixedMinY - shift,
      maxY: rayStartY + 215
    };
    const stored = d && d.trapezSheetBounds && validTrapezBounds(d.trapezSheetBounds[String(systemIndex)]);
    const currentBounds = stored || defaultBounds;
    return {
      fixedMinY,
      movingMinY: mm(currentBounds.minY),
      shift,
      defaultBounds,
      currentBounds,
      edited: Boolean(stored)
    };
  }

  function railHeightAtZ(rail, z) {
    const start = rail && Array.isArray(rail.start) ? rail.start : [0, 0, 0];
    const end = rail && Array.isArray(rail.end) ? rail.end : start;
    const dz = mm(end[2]) - mm(start[2]);
    const t = Math.abs(dz) > 1e-9 ? (mm(z) - mm(start[2])) / dz : 0;
    return { y: mm(start[1]) + (mm(end[1]) - mm(start[1])) * t, t, withinRailSpan: t >= -1e-6 && t <= 1 + 1e-6 };
  }

  // Stage 7 uses the one closed trapezoidal-sheet boundary emitted by
  // PLMR drawTopTrapezSafeHatch for each system. The 2D source does not define
  // sheet thickness or corrugation amplitude, so P3DV deliberately renders a
  // zero-thickness, double-sided production boundary surface instead of
  // inventing a section. Its vertical support offset is the verified half
  // height of the Stage 6 Shape117 roof-register section (58.603551 / 2 mm).
  const TRAPEZ_SHEET_SUPPORT_TOP_OFFSET_Y = 29.3017755;

  function trapezPreviewPatternFractions() {
    const stations = [];
    for (let x = 0; x <= 1000; x += 100) {
      stations.push(x / 1000);
      if (x + 42 < 1000) stations.push((x + 42) / 1000);
    }
    return stations;
  }

  function trapezSheetDatum(d, system, position, railItems, roofRegisterLayout, localX) {
    if (!system || !position || !Array.isArray(railItems) || !railItems.length) return null;
    const state = roofRegisterPlanState(d, system, position);
    const bounds = validTrapezBounds(state.currentBounds);
    if (!bounds) return null;
    const minX = mm(bounds.minX), maxX = mm(bounds.maxX);
    const minY = mm(bounds.minY), maxY = mm(bounds.maxY);
    if (!(maxX - minX >= 50 && maxY - minY >= 50)) return null;

    const frontZ = -minY;
    const rearZ = -maxY;
    const datumRail = railItems[0];
    const frontRail = railHeightAtZ(datumRail, frontZ);
    const rearRail = railHeightAtZ(datumRail, rearZ);
    const frontSurfaceY = frontRail.y + TRAPEZ_SHEET_SUPPORT_TOP_OFFSET_Y;
    const rearSurfaceY = rearRail.y + TRAPEZ_SHEET_SUPPORT_TOP_OFFSET_Y;
    const systemRegisters = (roofRegisterLayout || []).filter(item => Number(item.systemIndex) === Number(system.index));
    const movingRegisters = systemRegisters.filter(item => item.role === 'trapezMinusY');
    const fixedRegisters = systemRegisters.filter(item => item.role === 'fixed');
    const sourceRailAxes = railItems.map(item => mm(item.sourceAxisX));
    const localRailAxes = railItems.map(item => mm(item.axisX));
    const supportIntervals = roofRegisterIntervals(d, system).map(interval => ({
      intervalIndex: interval.intervalIndex,
      sourceStartX: interval.sourceStartX,
      sourceEndX: interval.sourceEndX,
      startX: localX(interval.sourceStartX),
      endX: localX(interval.sourceEndX),
      clearSpan: interval.clearSpan,
      leftRailIndex: interval.leftRailIndex,
      rightRailIndex: interval.rightRailIndex
    }));
    const corners = [
      vector(localX(minX), rearSurfaceY, rearZ),
      vector(localX(maxX), rearSurfaceY, rearZ),
      vector(localX(maxX), frontSurfaceY, frontZ),
      vector(localX(minX), frontSurfaceY, frontZ)
    ];
    return {
      bounds: { minX, maxX, minY, maxY },
      defaultBounds: clone(state.defaultBounds),
      edited: Boolean(state.edited),
      width: maxX - minX,
      planLength: maxY - minY,
      frontZ,
      rearZ,
      frontSurfaceY,
      rearSurfaceY,
      surfaceSlopeRise: frontSurfaceY - rearSurfaceY,
      supportTopOffsetY: TRAPEZ_SHEET_SUPPORT_TOP_OFFSET_Y,
      datumRailId: datumRail.id,
      datumRailIndex: mm(datumRail.railIndex),
      connectedRailIds: railItems.map(item => item.id),
      sourceRailAxes,
      localRailAxes,
      supportIntervals,
      railBayCount: Math.max(0, railItems.length - 1),
      connectedRoofRegisterIds: systemRegisters.map(item => item.id),
      movingRoofRegisterIds: movingRegisters.map(item => item.id),
      fixedRoofRegisterIds: fixedRegisters.map(item => item.id),
      movingRegisterPlanMinYs: movingRegisters.map(item => mm(item.planMinY)),
      corners,
      previewPatternFractions: trapezPreviewPatternFractions(),
      frontRailProjection: frontRail,
      rearRailProjection: rearRail
    };
  }

  const POST_ASSEMBLY_OFFSETS = Object.freeze({
    upper: Object.freeze({ x: 0.000854, yFromProfileTop: 3.949757, zFromProfileCenter: -22.597697 }),
    lower: Object.freeze({ x: 0.001831, yFromProfileBottom: -34.250251, zFromProfileCenter: 8.049331 })
  });

  function rearWallCollisionSummary(components, postBounds) {
    const walls = components.filter(item => item.kind === 'rear-wall' && Array.isArray(item.polygonXZ));
    const collisions = walls.filter(wall => {
      const xs = wall.polygonXZ.map(point => mm(point && point[0]));
      const zs = wall.polygonXZ.map(point => mm(point && point[1]));
      const xOverlap = Math.max(Math.min(...xs), postBounds.minX) < Math.min(Math.max(...xs), postBounds.maxX) - 0.001;
      const zOverlap = Math.max(Math.min(...zs), postBounds.minZ) < Math.min(Math.max(...zs), postBounds.maxZ) - 0.001;
      const yOverlap = Math.max(mm(wall.bottomY), postBounds.minY) < Math.min(mm(wall.topY), postBounds.maxY) - 0.001;
      return xOverlap && zOverlap && yOverlap;
    });
    return { collision: collisions.length > 0, wallIds: collisions.map(item => item.id) };
  }

  function sideScopedWallState(d, systemIndex) {
    const state = d && d.backWallState && typeof d.backWallState === 'object' ? d.backWallState : {};
    const key = String(Math.max(0, Number(systemIndex) || 0));
    const fallback = { enabled: true, xOffset: 0, depth: 600, height: 0 };
    if (key === '0') return { ...fallback, ...(state.left || {}) };
    return { ...fallback, ...((state.middle && state.middle[key]) || {}) };
  }

  function sideElevationGrid(d, systemIndex, wallState, rearHeight) {
    const key = String(Math.max(0, Number(systemIndex) || 0));
    const explicit = d && d.backWallGridState && d.backWallGridState.side
      ? d.backWallGridState.side[key] : null;
    const wallDepth = Math.max(1, mm(wallState && wallState.depth) || 600);
    const wallHeight = Math.max(1, mm(wallState && wallState.height) || mm(rearHeight) || 1);
    if (explicit && Array.isArray(explicit.cells) && explicit.cells.length) {
      const bounds = explicit.bounds || {};
      const minDepth = Number.isFinite(Number(bounds.minX)) ? Number(bounds.minX) : 0;
      const maxDepth = Number.isFinite(Number(bounds.maxX)) && Number(bounds.maxX) > minDepth
        ? Number(bounds.maxX) : wallDepth;
      const minY = Number.isFinite(Number(bounds.minY)) ? Number(bounds.minY) : 0;
      const storedMaxY = Number.isFinite(Number(bounds.maxY)) && Number(bounds.maxY) > minY
        ? Number(bounds.maxY) : wallHeight;
      const automaticHeight = explicit.autoHeight === true || (
        !(mm(wallState && wallState.height) > 0) && minY === 0 && storedMaxY <= 1.000001
      );
      const scaleY = automaticHeight ? wallHeight / Math.max(1e-9, storedMaxY - minY) : 1;
      const mapY = value => automaticHeight
        ? (Number(value) <= minY + 0.000001 ? 0 : (Number(value) >= storedMaxY - 0.000001 ? wallHeight : (Number(value) - minY) * scaleY))
        : Number(value);
      return {
        depthMin: minDepth,
        depthMax: maxDepth,
        heightMin: automaticHeight ? 0 : minY,
        heightMax: automaticHeight ? wallHeight : storedMaxY,
        autoHeight: automaticHeight,
        cells: explicit.cells.map((cell, index) => ({
          id: String(cell.id || `back_wall_cell_${key}_${index + 1}`),
          enabled: cell.enabled !== false,
          minDepth: Number(cell.minX), maxDepth: Number(cell.maxX),
          minY: mapY(cell.minY), maxY: mapY(cell.maxY)
        })).filter(cell => [cell.minDepth, cell.maxDepth, cell.minY, cell.maxY].every(Number.isFinite) && cell.maxDepth > cell.minDepth && cell.maxY > cell.minY)
      };
    }
    const legacy = d && d.backWallSegments && d.backWallSegments.side && Array.isArray(d.backWallSegments.side[key])
      ? d.backWallSegments.side[key] : [];
    if (legacy.length) {
      const depthMax = Math.max(wallDepth, ...legacy.map(item => Math.max(0, Number(item && item.end) || 0)));
      const heightMax = Math.max(wallHeight, ...legacy.map(item => Math.max(0, Number(item && item.height) || 0)));
      return {
        depthMin: 0, depthMax, heightMin: 0, heightMax,
        cells: legacy.map((item, index) => ({
          id: String(item && item.id || `back_wall_cell_${key}_${index + 1}`), enabled: true,
          minDepth: Math.max(0, Number(item && item.start) || 0),
          maxDepth: Math.max(0, Number(item && item.end) || 0),
          minY: 0,
          maxY: Math.max(0, Number(item && item.height) || heightMax)
        })).filter(cell => cell.maxDepth > cell.minDepth && cell.maxY > cell.minY)
      };
    }
    return {
      depthMin: 0, depthMax: wallDepth, heightMin: 0, heightMax: wallHeight,
      cells: [{ id: `back_wall_cell_${key}_1`, enabled: true, minDepth: 0, maxDepth: wallDepth, minY: 0, maxY: wallHeight }]
    };
  }

  function lerp(a, b, t) { return mm(a) + (mm(b) - mm(a)) * Math.max(0, Math.min(1, mm(t))); }

  function fitTopWallDepthPair(startDepth, endDepth, maxDepth) {
    const maxD = Math.max(1, mm(maxDepth) || 1);
    let a = Math.max(0, mm(startDepth)), b = Math.max(0, mm(endDepth));
    const delta = b - a;
    if (Math.abs(delta) >= maxD) return delta >= 0 ? [0, maxD] : [maxD, 0];
    if (a > maxD || b > maxD) { const shift = Math.max(a, b) - maxD; a -= shift; b -= shift; }
    if (a < 0 || b < 0) { const shift = -Math.min(a, b); a += shift; b += shift; }
    return [Math.max(0, Math.min(maxD, a)), Math.max(0, Math.min(maxD, b))];
  }

  function buildRearWallComponents(d, system, position, localX, systemId) {
    if (!d || !system || !position || !d.rearSupport || d.rearSupport.type !== 'wall') return [];
    const state = sideScopedWallState(d, system.index);
    if (state.enabled === false) return [];
    const topGrid = d.topBackWallGridState && d.topBackWallGridState[String(system.index)];
    const topCells = topGrid && Array.isArray(topGrid.cells) ? topGrid.cells : [];
    if (!topCells.length) return [];
    const elevation = sideElevationGrid(d, system.index, state, position.rearHeight);
    const depthSpan = Math.max(1e-6, elevation.depthMax - elevation.depthMin);
    const wallHeight = Math.max(1, mm(state.height) || mm(position.rearHeight) || 1);
    const planDatum = positionPlanDatum(d, system.index);
    const zOffset = planDatum.rearDatumZ + mm(state.xOffset);
    const result = [];

    topCells.forEach((topCell, topIndex) => {
      if (!topCell || topCell.enabled === false) return;
      const minX = Number(topCell.minX), maxX = Number(topCell.maxX);
      const planDepth = Math.max(1, mm(d.constants && d.constants.topWallH) + (mm(d.maxOpening) - mm(position.opening)));
      let [nearA, nearB] = fitTopWallDepthPair(topCell.startNearDepth, topCell.endNearDepth, planDepth);
      let [farA, farB] = fitTopWallDepthPair(topCell.startFarDepth, topCell.endFarDepth, planDepth);
      nearA = Math.min(nearA, farA); nearB = Math.min(nearB, farB);
      if (![minX, maxX].every(Number.isFinite) || maxX - minX <= 0.001) return;

      elevation.cells.forEach((elevationCell, elevationIndex) => {
        if (!elevationCell || elevationCell.enabled === false) return;
        const t0 = (elevationCell.minDepth - elevation.depthMin) / depthSpan;
        const t1 = (elevationCell.maxDepth - elevation.depthMin) / depthSpan;
        const d0a = lerp(nearA, farA, t0), d0b = lerp(nearB, farB, t0);
        const d1a = lerp(nearA, farA, t1), d1b = lerp(nearB, farB, t1);
        const bottomY = Math.max(0, mm(elevationCell.minY));
        const topY = Math.min(wallHeight, Math.max(bottomY + 1, mm(elevationCell.maxY)));
        if (topY - bottomY <= 0.001) return;
        result.push({
          id: `${systemId}-rear-wall-${topIndex + 1}-${elevationIndex + 1}`,
          kind: 'rear-wall', template: 'canonical-wall-solid',
          polygonXZ: [
            [localX(mm(system.outerStartX) + minX), zOffset - d0a],
            [localX(mm(system.outerStartX) + maxX), zOffset - d0b],
            [localX(mm(system.outerStartX) + maxX), zOffset - d1b],
            [localX(mm(system.outerStartX) + minX), zOffset - d1a]
          ],
          bottomY, topY,
          systemIndex: system.index,
          positionId: position.positionId || '',
          materialRole: 'wall',
          productionGeometry: true,
          wallState: {
            enabled: true,
            xOffset: zOffset,
            configuredDepth: Math.max(1, mm(state.depth) || 600),
            configuredHeight: wallHeight,
            planCellId: String(topCell.id || `top_wall_${system.index}_${topIndex + 1}`),
            elevationCellId: elevationCell.id,
            direction: Math.abs(farA - farB) <= 0.001 ? 'STRAIGHT' : (farB > farA ? 'NEGATIVE_X_TO_POSITIVE_X' : 'POSITIVE_X_TO_NEGATIVE_X')
          },
          sourceRuleIds: [
            'PLMR.normalizeBackWallState',
            'PLMR.normalizeBackWallGridState',
            'PLMR.normalizeTopBackWallGridState',
            'PLMR.drawTopWall',
            'PLMR.backWallCellsFor',
            'PLMR.rearSupport.type=wall',
            'P3DV.Stage2.PLMR_XY_TO_3D_X_NEGATIVE_Z'
          ]
        });
      });
    });
    return result;
  }

  function isYes(value) {
    const text = String(value == null ? '' : value).trim().toUpperCase();
    return text === 'EVET' || text === 'YES' || text === 'TRUE' || text === '1';
  }

  function sideFeatureEnabled3d(d, feature, key, positionIndex) {
    const state = d && d.sideFeatureState && d.sideFeatureState[feature];
    const normalized = key === 'right' ? 'right' : (String(key) === '0' || key === 'left' ? '0' : String(key));
    if (state) {
      if (normalized === 'right') return !!state.right;
      if (normalized === '0') return !!state.left;
      return !!(state.middle && state.middle[normalized]);
    }
    const differentOpening = d && d.openingList && d.openingList.length > 1;
    const edge = !differentOpening || positionIndex === 0 || positionIndex === Math.max(0, Number(d.sidePositionCount) - 1);
    return feature === 'glassTrack' ? isYes(d && d.glassTrack) && edge : isYes(d && d.triangleJoinery) && edge;
  }

  function conditionalComponents(d, system, position, localX, systemId, railItems) {
    const out = [];
    const K = d.constants || {};
    const outerStart = localX(system.outerStartX), outerEnd = localX(system.outerEndX);
    const opening = mm(position.opening), rearH = mm(position.rearHeight), frontH = mm(position.frontHeight);
    const planDatum = positionPlanDatum(d, system.index);
    const index = Number(system.index) || 0;
    const sideKey = index === Math.max(0, Number(d.sidePositionCount) - 1) ? 'right' : (index === 0 ? '0' : String(index));

    if (isYes(d.parapet)) {
      const segments = d.parapetSegments && Array.isArray(d.parapetSegments.front) ? d.parapetSegments.front : [];
      const list = segments.length ? segments : [{ id: 'default', start: 0, end: mm(d.width), startHeight: mm(d.parapetHeight), endHeight: mm(d.parapetHeight) }];
      list.forEach((seg, segIndex) => {
        const absStart = mm(K.systemStartX) + mm(seg.start), absEnd = mm(K.systemStartX) + mm(seg.end);
        const clipStart = Math.max(mm(system.outerStartX), absStart), clipEnd = Math.min(mm(system.outerEndX), absEnd);
        if (clipEnd - clipStart <= 0.001) return;
        const denom = Math.max(0.001, absEnd - absStart);
        const t0 = (clipStart - absStart) / denom, t1 = (clipEnd - absStart) / denom;
        const h0 = mm(seg.startHeight != null ? seg.startHeight : seg.height), h1 = mm(seg.endHeight != null ? seg.endHeight : seg.height);
        const y0 = h0 + (h1 - h0) * t0, y1 = h0 + (h1 - h0) * t1;
        out.push({ id: `${systemId}-parapet-${seg.id || segIndex + 1}`, kind: 'parapet', template: 'canonical-wall-solid',
          polygonXZ: [[localX(mm(K.systemStartX) + clipStart), planDatum.frontDatumZ - 100], [localX(mm(K.systemStartX) + clipEnd), planDatum.frontDatumZ - 100], [localX(mm(K.systemStartX) + clipEnd), planDatum.frontDatumZ], [localX(mm(K.systemStartX) + clipStart), planDatum.frontDatumZ]],
          bottomY: 0, topY: Math.max(1, (y0 + y1) / 2), startHeight: y0, endHeight: y1, systemIndex: index, positionId: position.positionId || '',
          conditionalOption: 'parapet', productionGeometry: true, materialRole: 'wall', sourceRuleIds: ['PLMR.parapet','PLMR.parapetSegments','PLMR.frontParapetHeightAt'] });
      });
    }

    if (isYes(d.parapet) && (sideKey === '0' || sideKey === 'right')) {
      const sideMap = d.parapetSegments && d.parapetSegments.side || {};
      const sourceKey = sideKey === 'right' ? 'right' : String(index);
      const sideSegments = Array.isArray(sideMap[sourceKey]) ? sideMap[sourceKey] : (Array.isArray(sideMap[String(index)]) ? sideMap[String(index)] : []);
      const sideX = sideKey === 'right' ? outerEnd : outerStart;
      sideSegments.forEach((seg, segIndex) => {
        const z0 = planDatum.rearDatumZ + Math.max(0, Math.min(opening, mm(seg.start)));
        const z1 = planDatum.rearDatumZ + Math.max(0.001, Math.min(opening, mm(seg.end)));
        if (z1 - z0 <= 0.001) return;
        const h0 = mm(seg.startHeight != null ? seg.startHeight : seg.height);
        const h1 = mm(seg.endHeight != null ? seg.endHeight : seg.height);
        out.push({ id: `${systemId}-parapet-side-${sourceKey}-${seg.id || segIndex + 1}`, kind: 'parapet', template: 'canonical-wall-solid',
          polygonXZ: [[sideX - 50, z0], [sideX + 50, z0], [sideX + 50, z1], [sideX - 50, z1]],
          bottomY: 0, topY: Math.max(1, (h0 + h1) / 2), startHeight: h0, endHeight: h1,
          parapetView: 'side', sideViewKey: sourceKey, parapetSegmentId: seg.id || `side_${sourceKey}_${segIndex + 1}`,
          systemIndex: index, positionId: position.positionId || '', conditionalOption: 'parapet', productionGeometry: true,
          materialRole: 'wall', sourceRuleIds: ['PLMR.parapet','PLMR.parapetSegments.side','PLMR.sideParapetHeightAt'] });
      });
    }

    // Water outlet pipes are created once from PLMR waterPipeEditor interactions after
    // all systems/gutter groups are known. This prevents per-system duplicate pipes.

    if (sideFeatureEnabled3d(d, 'glassTrack', sideKey, index)) {
      const profile = d.glassTrackProfile || { en:100, boy:100, et:2 };
      const lengthOffset = d.glassTrackLengthOffsets ? (sideKey === 'right' ? mm(d.glassTrackLengthOffsets.right) : (sideKey === '0' ? mm(d.glassTrackLengthOffsets.left) : mm(d.glassTrackLengthOffsets.middle && d.glassTrackLengthOffsets.middle[sideKey]))) : 0;
      const sideX = sideKey === 'right' ? outerEnd : outerStart;
      const trackLength = Math.max(1, opening - 100 + lengthOffset);
      out.push(component(`${systemId}-glass-track-${sideKey}`, 'glass-track', 'canonical-glass-track-profile', [sideX, frontH - 3, planDatum.rearDatumZ + 50], [sideX, frontH - 3, planDatum.rearDatumZ + 50 + trackLength], { systemIndex:index, positionId:position.positionId||'', profileEn:mm(profile.en)||100, profileBoy:mm(profile.boy)||100, profileThickness:mm(profile.et)||2, conditionalOption:'glassTrack', sourceRuleIds:['PLMR.sideFeatureEnabled.glassTrack','PLMR.drawTopGlassTrack','PLMR.sideGlassTrackBottomY'] }));
    }

    if (sideFeatureEnabled3d(d, 'triangle', sideKey, index)) {
      const sideX = sideKey === 'right' ? outerEnd : outerStart;
      const rearTop = rearH, frontTop = frontH;
      const z0 = planDatum.rearDatumZ + 75, z1 = Math.max(z0 + 1, planDatum.frontDatumZ - 75);
      const points = [[sideX, frontTop, z1],[sideX,rearTop,z0],[sideX,frontTop+165,z0]];
      [[0,1],[1,2],[2,0]].forEach((pair, mi) => out.push(component(`${systemId}-triangle-joinery-${sideKey}-frame-${mi+1}`, 'triangle-joinery', 'canonical-triangle-profile', points[pair[0]], points[pair[1]], { systemIndex:index, positionId:position.positionId||'', sideViewKey:sideKey, profileEn:41.7, profileBoy:41.7, profileThickness:0, conditionalOption:'triangleJoinery', sourceRuleIds:['PLMR.triangleDogramaUrunCiz.frame','PLMR.sideFeatureEnabled.triangle'] })));
      const scoped = d.triangleDivisionState || {};
      const explicit = sideKey === 'right' ? Number(scoped.right) : (sideKey === '0' ? Number(scoped.left) : Number(scoped.middle && scoped.middle[sideKey]));
      const AB = Math.max(1, planDatum.frontDatumZ - planDatum.rearDatumZ - 150);
      const divisions = Number.isFinite(explicit) && explicit >= 1 ? Math.max(1, Math.round(explicit)) : Math.max(1, Math.floor((AB - 0.000001) / 2500) + 1);
      for (let di = 1; di < divisions; di += 1) {
        const ratio = di / divisions;
        const z = z0 + (z1 - z0) * ratio;
        const top = rearTop + (frontTop - rearTop) * ratio;
        out.push(component(`${systemId}-triangle-joinery-${sideKey}-divider-${di}`, 'triangle-joinery', 'canonical-triangle-profile', [sideX, frontTop, z], [sideX, top, z], { systemIndex:index, positionId:position.positionId||'', sideViewKey:sideKey, divisionIndex:di, divisionCount:divisions, profileEn:41.7, profileBoy:41.7, profileThickness:0, conditionalOption:'triangleJoinery', sourceRuleIds:['PLMR.triangleDogramaAraDikmeSay','PLMR.triangleDogramaUrunCiz.divider'] }));
      }
    }
    return out;
  }


  function plmrDrawing(input) {
    if (!root.PulumurGeometry || typeof root.PulumurGeometry.buildDrawing !== 'function') return null;
    try { return root.PulumurGeometry.buildDrawing(input || {}); } catch (_) { return null; }
  }

  function appendWaterOutletComponents(components, drawing, d, originX) {
    const seen = new Set();
    const interactions = drawing && Array.isArray(drawing.entities)
      ? drawing.entities.filter(e => e && e.type === 'interaction' && e.kind === 'waterPipeEditor') : [];
    interactions.forEach(entity => {
      const data = entity.data || {};
      const orientation = String(data.waterPipeOrientation || '');
      if (orientation === 'side-view') return; // same physical pipe, alternate 2D view
      const id = String(data.waterPipeId || '');
      if (!id || seen.has(id)) return;
      seen.add(id);
      const diameter = Math.max(1, mm(data.waterPipeDiameter) || 70);
      const minX = mm(data.boundMinX != null ? data.boundMinX : entity.x);
      const maxX = mm(data.boundMaxX != null ? data.boundMaxX : (mm(entity.x) + mm(entity.w)));
      const minY = mm(data.boundMinY != null ? data.boundMinY : entity.y);
      const maxY = mm(data.boundMaxY != null ? data.boundMaxY : (mm(entity.y) + mm(entity.h)));
      const systemIndex = Number.isFinite(Number(data.waterPipeSystemIndex)) ? Number(data.waterPipeSystemIndex)
        : (String(data.waterPipeSide || '') === 'right' ? Math.max(0, d.positions.length - 1) : 0);
      const position = d.positions[systemIndex] || d.positions[0] || {};
      const elevation = mm(position.frontHeight || d.frontHeight) + 65;
      let start, end;
      if (orientation === 'front') {
        const x = ((minX + maxX) / 2) - originX;
        start = [x, elevation, -maxY];
        end = [x, elevation, -minY];
      } else {
        const z = -((minY + maxY) / 2);
        start = [minX - originX, elevation, z];
        end = [maxX - originX, elevation, z];
      }
      components.push(component(`water-outlet-${id.replace(/[^A-Za-z0-9_-]+/g, '_')}`, 'water-outlet', 'canonical-water-outlet-pipe', start, end, {
        waterPipeId: id, waterPipeOrientation: orientation, systemIndex, positionId: position.positionId || '',
        independentGroupId: String(data.independentGroupId || ''), profileWidth: diameter, profileEn: diameter, profileBoy: diameter,
        conditionalOption: 'waterStandard', productionGeometry: true,
        sourceRuleIds: ['PLMR.buildDrawing.waterPipeEditor', 'PLMR.normalizeWaterOutletPipeState', 'PLMR.drawTopWaterOutletPipes']
      }));
    });
  }

  function clamp01(value) { return Math.max(0, Math.min(1, Number(value) || 0)); }

  function segmentHeightAt3d(segments, coordinate, fallback) {
    const list = Array.isArray(segments) ? segments : [];
    const x = mm(coordinate);
    const hit = list.find((item, index) => x >= mm(item && item.start) - 0.001 && (x < mm(item && item.end) - 0.001 || (index === list.length - 1 && x <= mm(item && item.end) + 0.001)));
    if (!hit) return Math.max(0, mm(fallback));
    const start = mm(hit.start), end = mm(hit.end);
    const h0 = Math.max(0, Number.isFinite(Number(hit.startHeight)) ? Number(hit.startHeight) : mm(hit.height));
    const h1 = Math.max(0, Number.isFinite(Number(hit.endHeight)) ? Number(hit.endHeight) : mm(hit.height));
    const ratio = end - start > 0.001 ? clamp01((x - start) / (end - start)) : 0;
    return h0 + (h1 - h0) * ratio;
  }

  function frontParapetHeight3d(d, absoluteX) {
    const K = d.constants || {};
    return segmentHeightAt3d(d.parapetSegments && d.parapetSegments.front, mm(absoluteX) - mm(K.systemStartX), d.parapetHeight);
  }

  function sideParapetHeight3d(d, systemIndex, absoluteX, wallX, sideViewKey) {
    const key = sideViewKey === 'right' ? 'right' : String(sideViewKey == null ? systemIndex : sideViewKey);
    const map = d.parapetSegments && d.parapetSegments.side || {};
    return segmentHeightAt3d(map[key], mm(absoluteX) - mm(wallX), d.parapetHeight);
  }

  function frontPostBounds3d(d, centers, index) {
    const K = d.constants || {};
    const i = Math.max(0, Math.min(Math.max(0, centers.length - 1), Number(index) || 0));
    const axis = mm(centers[i]);
    const widths = Array.isArray(d.frontPostWidths) ? d.frontPostWidths : [];
    const width = Math.max(1, mm(widths[i]) || mm(K.postSize) || 100);
    const standard = Math.max(1, mm(K.postSize) || 100);
    if (i === 0) return { left: axis - standard / 2, right: axis - standard / 2 + width, width };
    if (i === centers.length - 1) return { left: axis + standard / 2 - width, right: axis + standard / 2, width };
    return { left: axis - width / 2, right: axis + width / 2, width };
  }

  function productGeometryMetadata(placement, productType, width, height) {
    if (productType === 'sliding_glass') {
      const panelCount = Math.max(2, Math.round(mm(placement.panelCount) || 2));
      return { kind:'sliding', frameOffset:50, mullionSize:50, panelCount, openingType:String(placement.openingType || 'SIDE OPENING').toUpperCase() };
    }
    if (productType === 'guillotine_glass') {
      return { kind:'guillotine', sideFrame:50, bottomFrame:50, topFrame:150, separatorSize:50, panelCount:String(placement.panelCount || '1+1') === '1+2' ? 3 : 2, type:String(placement.type || 'STANDARD').toUpperCase(), motorDirection:String(placement.motorDirection || 'RIGHT').toUpperCase(), view:String(placement.view || 'INSIDE VIEW').toUpperCase() };
    }
    const type = String(placement.type || '100X100 BOX').toUpperCase();
    const boxHeight = Math.min(Math.max(1, height - 55), type.includes('130') || type === 'HERCULE' ? 130 : (type.includes('115') ? 115 : (type.includes('110') ? 110 : 100)));
    const guideWidth = Math.max(20, Math.min(42, width * 0.035));
    const bottomBarHeight = Math.max(32, Math.min(55, height * 0.035));
    return { kind:'zip-screen', boxHeight, guideWidth, bottomBarHeight, fabricDepth:8, type, motorDirection:String(placement.motorDirection || 'RIGHT').toUpperCase(), cableExitDirection:String(placement.cableExitDirection || 'REAR').toUpperCase(), mountingLocation:String(placement.mountingLocation || 'BETWEEN POSTS').toUpperCase() };
  }

  function commonProductFields(placement, productType, width, height) {
    return {
      placementId: placement.id,
      productType,
      productGeometry: productGeometryMetadata(placement, productType, width, height),
      series: String(placement.series || ''),
      productVariant: String(placement.type || ''),
      panelCount: placement.panelCount,
      openingType: placement.openingType,
      mountingLocation: placement.mountingLocation,
      motorDirection: placement.motorDirection,
      cableExitDirection: placement.cableExitDirection,
      width, height, depth: 50,
      productionGeometry: true
    };
  }

  function frontProductComponent(placement, productType, d, originX) {
    const centers = Array.isArray(d.postCenterXs) ? d.postCenterXs.map(Number) : [];
    const gapIndex = Math.max(0, Math.min(Number(placement.gapIndex) || 0, Math.max(0, centers.length - 2)));
    if (centers.length < 2) return null;
    const leftPost = frontPostBounds3d(d, centers, gapIndex);
    const rightPost = frontPostBounds3d(d, centers, gapIndex + 1);
    const gapLeft = leftPost.right, gapRight = rightPost.left;
    const centerAbs = (gapLeft + gapRight) / 2;
    const system = (d.systems || []).find(sys => centerAbs >= Number(sys.outerStartX) - 0.001 && centerAbs <= Number(sys.outerEndX) + 0.001) || d.systems[0];
    const position = d.positions[system ? system.index : 0] || d.positions[0] || {};
    const parapetH = frontParapetHeight3d(d, centerAbs);
    const isZip = productType === 'zip_screen';
    const outside = isZip && String(placement.mountingLocation || 'BETWEEN POSTS').toUpperCase() === 'OUTSIDE POSTS';
    const autoWidth = isZip ? (outside ? Math.max(1, rightPost.right - leftPost.left - 5) : Math.max(1, gapRight - gapLeft - 3)) : Math.max(1, gapRight - gapLeft - 5);
    const baseX = isZip ? (outside ? leftPost.left + 2.5 : gapLeft + 1.5) : gapLeft;
    const width = Math.max(1, mm(placement.width) || autoWidth);
    const clearHeight = Math.max(1, mm(position.frontHeight) - parapetH);
    const zipMetaHeight = productGeometryMetadata(placement, productType, width, Math.max(180, clearHeight)).boxHeight || 0;
    const autoHeight = isZip ? (outside ? Math.max(1, clearHeight + zipMetaHeight) : Math.max(1, clearHeight - 3)) : Math.max(1, clearHeight - 5);
    const height = Math.max(1, mm(placement.height) || autoHeight);
    const baseY = parapetH - mm(d.constants && d.constants.onPostTopDrop) + (isZip && !outside ? 1.5 : 0);
    return {
      id:`placed-product-${placement.id}`, kind:'area-product', template:'canonical-area-product',
      ...commonProductFields(placement, productType, width, height),
      position:vector(baseX + width / 2 - originX, baseY + height / 2, positionPlanDatum(d, system ? system.index : 0).frontDatumZ - 25),
      baseElevation:baseY, face:'front', gapIndex, systemIndex:system?system.index:0, positionId:position.positionId||'',
      sourceRuleIds:['PLMR.productEditor','PLMR.frontGapBounds','PLMR.frontParapetHeightAt','PLMR.frontZipScreenMetrics','PLMR normalized placement arrays']
    };
  }

  function sideProductComponent(placement, productType, d, originX) {
    const key = String(placement.sideViewKey || (placement.placementView === 'side-right' ? 'right' : '0'));
    const systemIndex = Math.max(0, Number(placement.sideIndex) || 0);
    const geom = key === 'right' ? d.rightSideSupportGeometry : d.sideSupportGeometry && d.sideSupportGeometry[key];
    const gapIndex = Math.max(0, Number(placement.sideGapIndex) || 0);
    const gap = geom && Array.isArray(geom.gaps) ? geom.gaps[gapIndex] : null;
    const system = d.systems[systemIndex] || d.systems[0];
    const position = d.positions[systemIndex] || d.positions[0] || {};
    if (!geom || !gap || !system) return null;
    const wallX = mm(geom.wallX);
    const zoneLeft = mm(gap.left), zoneRight = mm(gap.right);
    const midX = (zoneLeft + zoneRight) / 2;
    const parapetH = sideParapetHeight3d(d, systemIndex, midX, wallX, key);
    const isZip = productType === 'zip_screen';
    const outside = isZip && String(placement.mountingLocation || 'BETWEEN POSTS').toUpperCase() === 'OUTSIDE POSTS';
    const profile = d.glassTrackProfile || { en:100 };
    const glassEnabled = sideFeatureEnabled3d(d, 'glassTrack', key, systemIndex);
    const clearTop = mm(d.frontHeight) - (glassEnabled ? 3 + Math.max(5, mm(profile.en) || 100) : 0);
    const rawAvailableHeight = Math.max(1, clearTop - parapetH);
    const rawWidth = Math.max(1, zoneRight - zoneLeft);
    const postWidth = id => {
      const post = Array.isArray(geom.posts) ? geom.posts.find(item => String(item.id || '') === String(id || '')) : null;
      return post ? Math.max(1, mm(post.width || (post.profile && post.profile.en)) || 100) : 0;
    };
    const leftAdd = outside && gap.leftPostId ? postWidth(gap.leftPostId) : 0;
    const rightAdd = outside && gap.rightPostId ? postWidth(gap.rightPostId) : (outside && Math.abs(zoneRight - mm(geom.frontPostRearFace)) < 0.01 ? mm(d.constants && d.constants.postSize) || 100 : 0);
    const autoWidth = isZip ? (outside ? Math.max(1, rawWidth + leftAdd + rightAdd - 5) : Math.max(1, rawWidth - 3)) : Math.max(1, rawWidth - 5);
    const basePlan = isZip ? (outside ? zoneLeft - leftAdd + 2.5 : zoneLeft + 1.5) : zoneLeft;
    const width = Math.max(1, mm(placement.width) || autoWidth);
    const probeHeight = Math.max(180, rawAvailableHeight);
    const zipMetaHeight = productGeometryMetadata(placement, productType, width, probeHeight).boxHeight || 0;
    const autoHeight = isZip ? (outside ? Math.max(1, rawAvailableHeight + zipMetaHeight) : Math.max(1, rawAvailableHeight - 3)) : Math.max(1, rawAvailableHeight - 5);
    const height = Math.max(1, mm(placement.height) || autoHeight);
    const baseY = parapetH + (isZip && !outside ? 1.5 : 0);
    const sideX = key === 'right' ? Number(system.outerEndX)-originX : Number(system.outerStartX)-originX;
    return {
      id:`placed-product-${placement.id}`, kind:'area-product', template:'canonical-area-product',
      ...commonProductFields(placement, productType, width, height),
      position:vector(sideX, baseY + height / 2, positionPlanDatum(d, systemIndex).rearDatumZ + basePlan - wallX + width / 2),
      baseElevation:baseY, face:key==='right'?'right':'left', sideViewKey:key, sideGapIndex:gapIndex,
      systemIndex, positionId:position.positionId||'',
      sourceRuleIds:['PLMR.productEditor','PLMR.sideProductPlacementMetrics','PLMR.sideZipScreenMetrics','PLMR normalized side placement arrays']
    };
  }

  function appendPlacedProductComponents(components, d, originX) {
    [['slidingPlacements','sliding_glass'],['guillotinePlacements','guillotine_glass'],['zipScreenPlacements','zip_screen']].forEach(([field,type]) => {
      (Array.isArray(d[field]) ? d[field] : []).forEach(item => { const c=frontProductComponent(item,type,d,originX); if(c)components.push(c); });
    });
    [['sideSlidingPlacements','sliding_glass'],['sideGuillotinePlacements','guillotine_glass'],['sideZipScreenPlacements','zip_screen']].forEach(([field,type]) => {
      (Array.isArray(d[field]) ? d[field] : []).forEach(item => { const c=sideProductComponent(item,type,d,originX); if(c)components.push(c); });
    });
  }

  function appendSideSupportComponents(components, d, originX) {
    const entries = Object.entries(d.sideSupportGeometry || {});
    if (d.rightSideSupportGeometry) entries.push(['right', d.rightSideSupportGeometry]);
    const seen = new Set();
    entries.forEach(([key, geom]) => {
      if (!geom || !geom.exists) return;
      const systemIndex = Math.max(0, Number(geom.index) || 0);
      const system = d.systems[systemIndex] || d.systems[0];
      const position = d.positions[systemIndex] || d.positions[0] || {};
      if (!system) return;
      (geom.posts || []).forEach((post, postIndex) => {
        const id=String(post.id||`side_${key}_${postIndex}`); if(seen.has(id))return;seen.add(id);
        const profile=post.profile||{};
        const sideX=String(key)==='right'?Number(system.outerEndX)-originX:Number(system.outerStartX)-originX;
        const z=positionPlanDatum(d,systemIndex).rearDatumZ+Math.max(0,Number(post.distanceFromWall)||Number(post.centerX)-Number(geom.wallX));
        const top=Math.max(1,Number(position.frontHeight||d.frontHeight)-100+Number(post.extension||0));
        components.push(component(`side-support-post-${id}`,'side-support-post','canonical-hollow-post',[sideX,0,z],[sideX,top,z],{
          profileId:id,sideViewKey:String(key),sidePostIndex:postIndex,systemIndex,positionId:position.positionId||'',
          profileEn:Number(profile.en)||100,profileBoy:Number(profile.boy)||100,
          profileWidthX:Number(profile.en)||100,profileDepthZ:Number(profile.boy)||100,profileWallThickness:Number(profile.et)||2,
          productionGeometry:true,sourceRuleIds:['PLMR.sideSupportGeometry.posts','PLMR.__sidePosts','PLMR.glassTrackSupportProfiles']
        }));
      });
    });
  }

  function build(project) {
    if (!project || !project.normalized) throw new Error('Normalized PLMR Pergo Rise project is required.');
    const d = project.normalized;
    const K = { ...root.PulumurGeometry.K };
    d.constants = K;
    const originX = K.systemStartX + d.width / 2;
    const localX = value => mm(value) - originX;
    const components = [];
    const systems = [];
    const roofRegisterLayout = [];
    const trapezSheetLayout = [];

    d.systems.forEach(system => {
      const position = d.positions[system.index] || d.positions[0];
      const systemId = position.positionId || `position-${system.index + 1}`;
      const rearHeight = mm(position.rearHeight);
      const frontHeight = mm(position.frontHeight);
      const opening = mm(position.opening);
      const planDatum = positionPlanDatum(d, system.index);
      const outerStart = localX(system.outerStartX);
      const outerEnd = localX(system.outerEndX);
      const railItems = [];

      (system.rays || []).forEach((rayLeft, railIndex) => {
        const sourceAxisX = mm(rayLeft) + K.rayW / 2;
        const axisX = localX(sourceAxisX);
        const datum = rayGroupDatum(d, system, position, axisX);
        datum.topView.rayLeftX = mm(rayLeft);

        const item = component(
          `${systemId}-rail-${railIndex + 1}`,
          'rail', 'rail-profile',
          datum.rear, datum.front,
          {
            systemIndex: system.index,
            positionId: position.positionId || '',
            railIndex,
            axisX,
            sourceAxisX,
            componentRole: 'rail-profile',
            railGroupId: `${systemId}-ray-group-${railIndex + 1}`,
            nominalPlanLength: datum.topView.planLength,
            actualLength: datum.rayLength,
            angleRad: datum.angleRad,
            rearMechanismPivot: datum.rearMechanismPivot,
            topViewDatum: clone(datum.topView),
            productionGeometry: true,
            sourceRuleIds: [
              'PLMR.K.rayW', 'PLMR.rayLenFor', 'PLMR.sideAngleRadFor',
              'PLMR.K.sideRayStartOffsetX', 'PLMR.K.sideRayStartOffsetY',
              'PLMR.K.sideArkaMekOffsetX', 'PLMR.K.sideArkaMekOffsetY',
              'PLMR.drawTopRays', 'PLMR.drawOneSideView.rotatedRect'
            ]
          }
        );
        components.push(item);
        railItems.push(item);

        const rearMechanismStart = pointAlong(datum.rear, datum.direction, -RAY_GROUP_TEMPLATE_LENGTHS.rearMechanism);
        const rearMechanism = component(
          `${systemId}-rail-rear-mechanism-${railIndex + 1}`,
          'rail-rear-mechanism', 'rail-rear-mechanism-accessory',
          rearMechanismStart, datum.rear,
          {
            systemIndex: system.index,
            positionId: position.positionId || '',
            railIndex,
            axisX,
            sourceAxisX,
            componentRole: 'rear-mechanism',
            railGroupId: `${systemId}-ray-group-${railIndex + 1}`,
            insertionAnchor: clone(datum.rearMechanismPivot),
            alignmentAnchor: clone(datum.rear),
            nativeLength: RAY_GROUP_TEMPLATE_LENGTHS.rearMechanism,
            productionGeometry: true,
            sourceRuleIds: [
              'PLMR.PergoRise Ray Arka Mekanizma Üst Görünüş',
              'PLMR.PergoRise Ray Arka Mekanizma Yan Görünüş',
              'PLMR.drawTopRays.rayStartY', 'PLMR.drawOneSideView.arkaMekX',
              'GLB.Line036.SOURCE_MIN_ENDPOINT'
            ]
          }
        );
        components.push(rearMechanism);

        const frontHeadEnd = pointAlong(datum.front, datum.direction, RAY_GROUP_TEMPLATE_LENGTHS.frontHead);
        const frontHead = component(
          `${systemId}-rail-front-head-${railIndex + 1}`,
          'rail-front-head', 'rail-front-head-accessory',
          datum.front, frontHeadEnd,
          {
            systemIndex: system.index,
            positionId: position.positionId || '',
            railIndex,
            axisX,
            sourceAxisX,
            componentRole: 'front-head',
            railGroupId: `${systemId}-ray-group-${railIndex + 1}`,
            insertionAnchor: clone(datum.front),
            alignmentAnchor: clone(datum.front),
            nativeLength: RAY_GROUP_TEMPLATE_LENGTHS.frontHead,
            productionGeometry: true,
            sourceRuleIds: [
              'PLMR.PergoRise Ray Kafası Üst Görünüş',
              'PLMR.PergoRise Ray Kafası Yan Görünüş',
              'PLMR.drawTopRays.rayEndY', 'PLMR.drawOneSideView.kafa',
              'GLB.Line035.SOURCE_MAX_ENDPOINT'
            ]
          }
        );
        components.push(frontHead);

        // The old Shape005 candidate is retained only as non-rendered audit
        // metadata for historical project compatibility. Stage 5 replaces its
        // visible ray-end role with the verified Line036 rear mechanism.
        components.push({
          id: `${systemId}-wall-connection-${railIndex + 1}`,
          kind: 'wall-connection',
          template: 'wall-connection-accessory',
          position: clone(datum.rearMechanismPivot),
          alignVector: vector(0, datum.front[1] - datum.rear[1], datum.front[2] - datum.rear[2]),
          anchor: 'source-min',
          productionGeometry: false,
          reviewRequired: true,
          renderVisible: false,
          deprecatedByStage5: true,
          replacedByComponentId: rearMechanism.id,
          systemIndex: system.index,
          positionId: position.positionId || '',
          railIndex,
          sourceRuleIds: ['GLB.Shape005.CANDIDATE_RETIRED', 'P3DV.Stage5.REPLACED_BY_LINE036']
        });
      });

      const rearProfileY = rearHeight - K.sideRayStartOffsetY;
      components.push(component(`${systemId}-rear-profile`, 'rear-profile', 'rear-profile',
        [outerStart, rearProfileY, planDatum.rearDatumZ], [outerEnd, rearProfileY, planDatum.rearDatumZ], {
          systemIndex: system.index,
          sourceRuleIds: ['PLMR.systems.outerStartX', 'PLMR.systems.outerEndX', 'PLMR.rearHeight']
        }));

      const frontProfileY = frontHeight - K.frontGutterH / 2;
      components.push(component(`${systemId}-front-profile`, 'front-profile', 'fabric-profile',
        [outerStart, frontProfileY, planDatum.frontDatumZ - 18], [outerEnd, frontProfileY, planDatum.frontDatumZ - 18], {
          systemIndex: system.index,
          sourceRuleIds: ['PLMR.frontHeight', 'PLMR.K.frontGutterH']
        }));

      const roofPlanState = roofRegisterPlanState(d, system, position);
      roofRegisterIntervals(d, system).forEach(interval => {
        const leftRail = railItems[interval.leftRailIndex];
        const rightRail = railItems[interval.rightRailIndex];
        if (!leftRail || !rightRail) return;
        const registerGroupId = `${systemId}-roof-register-group-${interval.intervalIndex + 1}`;
        const addRegister = (role, planMinY, editedByTrapez) => {
          const planMaxY = mm(planMinY) + mm(K.catiProfilH);
          const planCenterY = (mm(planMinY) + planMaxY) / 2;
          const centerZ = -planCenterY;
          const leftHeight = railHeightAtZ(leftRail, centerZ);
          const rightHeight = railHeightAtZ(rightRail, centerZ);
          const centerY = (leftHeight.y + rightHeight.y) / 2;
          const id = `${systemId}-roof-register-${role}-${interval.intervalIndex + 1}`;
          const start = vector(localX(interval.sourceStartX), centerY, centerZ);
          const end = vector(localX(interval.sourceEndX), centerY, centerZ);
          const item = component(id, 'roof-register-profile', 'roof-register-profile', start, end, {
            systemIndex: system.index,
            positionId: position.positionId || '',
            intervalIndex: interval.intervalIndex,
            roofRegisterGroupId: registerGroupId,
            roofProfileRole: role,
            componentRole: 'roof-register-profile',
            sourceStartX: interval.sourceStartX,
            sourceEndX: interval.sourceEndX,
            clearSpan: interval.clearSpan,
            leftRailIndex: interval.leftRailIndex,
            rightRailIndex: interval.rightRailIndex,
            leftRailGroupId: leftRail.railGroupId,
            rightRailGroupId: rightRail.railGroupId,
            connectedRailIds: [leftRail.id, rightRail.id],
            planMinY: mm(planMinY),
            planMaxY,
            planCenterY,
            centerZ,
            centerY,
            profilePlanVisibleDepth: mm(K.catiProfilH),
            rayAlignment: {
              leftY: leftHeight.y,
              rightY: rightHeight.y,
              deltaY: Math.abs(leftHeight.y - rightHeight.y),
              leftWithinRailSpan: leftHeight.withinRailSpan,
              rightWithinRailSpan: rightHeight.withinRailSpan,
              leftT: leftHeight.t,
              rightT: rightHeight.t
            },
            trapezEdited: Boolean(editedByTrapez),
            trapezDefaultBounds: clone(roofPlanState.defaultBounds),
            trapezCurrentBounds: clone(roofPlanState.currentBounds),
            productionGeometry: true,
            sourceRuleIds: role === 'fixed'
              ? ['PLMR.rayIntervals', 'PLMR.topCatiProfilYAt', 'PLMR.drawTopRoofProfiles.fixed', 'PLMR.K.catiProfilH']
              : ['PLMR.rayIntervals', 'PLMR.topTrapezBoundsForSystem', 'PLMR.drawTopRoofProfiles.trapezMinusY', 'PLMR.K.catiProfilH']
          });
          components.push(item);
          roofRegisterLayout.push({
            id, componentId: id, roofRegisterGroupId: registerGroupId,
            systemIndex: system.index, positionId: position.positionId || '', intervalIndex: interval.intervalIndex,
            role, sourceStartX: interval.sourceStartX, sourceEndX: interval.sourceEndX,
            startX: start[0], endX: end[0], length: interval.clearSpan,
            planMinY: mm(planMinY), planMaxY, planCenterY, centerZ, centerY,
            leftRailIndex: interval.leftRailIndex, rightRailIndex: interval.rightRailIndex,
            leftRailGroupId: leftRail.railGroupId, rightRailGroupId: rightRail.railGroupId,
            connectedRailIds: [leftRail.id, rightRail.id],
            rayAlignment: clone(item.rayAlignment),
            trapezEdited: Boolean(editedByTrapez),
            trapezDefaultBounds: clone(roofPlanState.defaultBounds),
            trapezCurrentBounds: clone(roofPlanState.currentBounds)
          });
        };
        addRegister('fixed', roofPlanState.fixedMinY, false);
        addRegister('trapezMinusY', roofPlanState.movingMinY, roofPlanState.edited);
      });

      const trapezDatum = trapezSheetDatum(d, system, position, railItems, roofRegisterLayout, localX);
      if (trapezDatum) {
        const sheetId = `${systemId}-trapez-sheet`;
        const sheetComponent = {
          id: sheetId,
          kind: 'trapez-sheet',
          template: 'canonical-trapez-sheet-surface',
          componentRole: 'trapez-sheet',
          materialRole: 'panel',
          corners: clone(trapezDatum.corners),
          systemIndex: system.index,
          positionId: position.positionId || '',
          independentGroupId: position.independentGroupId || '',
          sourceBounds: clone(trapezDatum.bounds),
          defaultSourceBounds: clone(trapezDatum.defaultBounds),
          edited: trapezDatum.edited,
          width: trapezDatum.width,
          planLength: trapezDatum.planLength,
          frontZ: trapezDatum.frontZ,
          rearZ: trapezDatum.rearZ,
          frontSurfaceY: trapezDatum.frontSurfaceY,
          rearSurfaceY: trapezDatum.rearSurfaceY,
          surfaceSlopeRise: trapezDatum.surfaceSlopeRise,
          supportTopOffsetY: trapezDatum.supportTopOffsetY,
          datumRailId: trapezDatum.datumRailId,
          datumRailIndex: trapezDatum.datumRailIndex,
          connectedRailIds: clone(trapezDatum.connectedRailIds),
          sourceRailAxes: clone(trapezDatum.sourceRailAxes),
          localRailAxes: clone(trapezDatum.localRailAxes),
          railBayCount: trapezDatum.railBayCount,
          supportIntervals: clone(trapezDatum.supportIntervals),
          connectedRoofRegisterIds: clone(trapezDatum.connectedRoofRegisterIds),
          movingRoofRegisterIds: clone(trapezDatum.movingRoofRegisterIds),
          fixedRoofRegisterIds: clone(trapezDatum.fixedRoofRegisterIds),
          movingRegisterPlanMinYs: clone(trapezDatum.movingRegisterPlanMinYs),
          previewPatternFractions: clone(trapezDatum.previewPatternFractions),
          surfacePolicy: 'PLMR_CLOSED_BOUNDARY_ZERO_THICKNESS_DOUBLE_SIDED',
          thicknessMm: null,
          corrugationAmplitudeMm: null,
          productionGeometry: true,
          sourceRuleIds: [
            'PLMR.defaultTopTrapezBounds',
            'PLMR.topTrapezBoundsForSystem',
            'PLMR.drawTopTrapezSafeHatch',
            'PLMR.drawTopTrapez',
            'PLMR.__trapezSheetBounds',
            'PLMR.PULUMUR_TRAPEZ_SAFE_HATCH',
            'P3DV.Stage7.PLMR_XY_TO_3D_X_NEGATIVE_Z',
            'P3DV.Stage7.Shape117HalfHeightSupportDatum'
          ]
        };
        components.push(sheetComponent);
        trapezSheetLayout.push({
          id: sheetId,
          componentId: sheetId,
          systemIndex: system.index,
          positionId: position.positionId || '',
          independentGroupId: position.independentGroupId || '',
          sourceBounds: clone(trapezDatum.bounds),
          defaultSourceBounds: clone(trapezDatum.defaultBounds),
          edited: trapezDatum.edited,
          width: trapezDatum.width,
          planLength: trapezDatum.planLength,
          frontZ: trapezDatum.frontZ,
          rearZ: trapezDatum.rearZ,
          frontSurfaceY: trapezDatum.frontSurfaceY,
          rearSurfaceY: trapezDatum.rearSurfaceY,
          surfaceSlopeRise: trapezDatum.surfaceSlopeRise,
          supportTopOffsetY: trapezDatum.supportTopOffsetY,
          datumRailId: trapezDatum.datumRailId,
          datumRailIndex: trapezDatum.datumRailIndex,
          connectedRailIds: clone(trapezDatum.connectedRailIds),
          sourceRailAxes: clone(trapezDatum.sourceRailAxes),
          localRailAxes: clone(trapezDatum.localRailAxes),
          railBayCount: trapezDatum.railBayCount,
          supportIntervals: clone(trapezDatum.supportIntervals),
          connectedRoofRegisterIds: clone(trapezDatum.connectedRoofRegisterIds),
          movingRoofRegisterIds: clone(trapezDatum.movingRoofRegisterIds),
          fixedRoofRegisterIds: clone(trapezDatum.fixedRoofRegisterIds),
          movingRegisterPlanMinYs: clone(trapezDatum.movingRegisterPlanMinYs),
          corners: clone(trapezDatum.corners),
          previewPatternFractions: clone(trapezDatum.previewPatternFractions),
          surfacePolicy: sheetComponent.surfacePolicy
        });
      }

      const stackWidth = Math.max(1, mm(system.rayAreaEndX) - mm(system.rayAreaStartX));
      components.push({
        id: `${systemId}-fabric-stack`,
        kind: 'fabric-stack', template: 'fabric-stack',
        position: vector(localX((mm(system.rayAreaStartX) + mm(system.rayAreaEndX)) / 2), rearHeight - 250, planDatum.rearDatumZ + 520),
        width: stackWidth,
        rotation: vector(0, 0, 0),
        representation: 'STATIC_VISUAL_REPRESENTATION',
        productionGeometry: false,
        systemIndex: system.index,
        sourceRuleIds: ['P3DV.STATIC_OPEN_REAR_STACKED', 'PLMR.fabric', 'PLMR.fabricProfiles']
      });

      buildRearWallComponents(d, system, position, localX, systemId).forEach(item => components.push(item));
      conditionalComponents(d, system, position, localX, systemId, railItems).forEach(item => components.push(item));

      systems.push({
        index: system.index,
        positionId: position.positionId || systemId,
        independentGroupId: position.independentGroupId || '',
        outerStartX: outerStart,
        outerEndX: outerEnd,
        width: mm(position.width),
        opening,
        rearDatumZ: planDatum.rearDatumZ,
        frontDatumZ: planDatum.frontDatumZ,
        yAlignmentMode: planDatum.yAlignmentMode,
        rearHeight,
        frontHeight,
        slopeDegrees: Math.abs(mm(position.angleRad)) * 180 / Math.PI,
        railCount: railItems.length,
        railAxes: railItems.map(item => item.axisX),
        sourceRailAxes: railItems.map(item => item.sourceAxisX),
        rayGroupIds: railItems.map(item => item.railGroupId),
        roofRegisterCount: roofRegisterLayout.filter(item => Number(item.systemIndex) === Number(system.index)).length,
        roofRegisterIds: roofRegisterLayout.filter(item => Number(item.systemIndex) === Number(system.index)).map(item => item.id),
        trapezSheetCount: trapezSheetLayout.filter(item => Number(item.systemIndex) === Number(system.index)).length,
        trapezSheetIds: trapezSheetLayout.filter(item => Number(item.systemIndex) === Number(system.index)).map(item => item.id)
      });
    });

    const gutterLayout = gutterSegments(d).map(segment => {
      const profileHeightY = mm(K.frontGutterH);
      const profileDepthZ = mm(K.topGutterH);
      const centerY = segment.bottomDatumY + profileHeightY / 2;
      const centerZ = segment.frontDatumZ - profileDepthZ / 2;
      const gutterComponent = component(segment.id, 'gutter', 'gutter-profile',
        [localX(segment.start), centerY, centerZ], [localX(segment.end), centerY, centerZ], {
          independentGroupId: segment.groupId || '',
          segmentIndex: segment.segmentIndex,
          systemIndex: segment.systemIndex,
          systemIndices: segment.systemIndices.slice(),
          positionId: segment.positionId || '',
          positionIds: segment.positionIds.slice(),
          sourceStartX: segment.start,
          sourceEndX: segment.end,
          length: segment.end - segment.start,
          bottomDatumY: segment.bottomDatumY,
          topDatumY: segment.bottomDatumY + profileHeightY,
          frontDatumZ: segment.frontDatumZ,
          rearDatumZ: segment.frontDatumZ - profileDepthZ,
          planY: segment.planY,
          plmrFrontDatumZ: segment.plmrFrontDatumZ,
          coordinatePolicy: 'PLMR top-view datum: FRONT_GUTTER_ALIGNED or explicit REAR_START_ALIGNED.',
          profileSection: {
            heightY: profileHeightY,
            depthZ: profileDepthZ,
            innerDepthZ: mm(K.topGutterInnerH),
            lipDepthZ: mm(K.topGutterLipH)
          },
          defaultStartX: segment.bounds.defaultStart,
          defaultEndX: segment.bounds.defaultEnd,
          minusXDelta: segment.bounds.minusXDelta,
          plusXDelta: segment.bounds.plusXDelta,
          sourceSegmentation: segment.sourceSegmentation,
          productionGeometry: true,
          sourceRuleIds: [
            'PLMR.gutterBounds', 'PLMR.drawTopGutter', 'PLMR.drawFrontView.front-gutter',
            'PLMR.K.gutterX', 'PLMR.K.topGutterH', 'PLMR.K.frontGutterH',
            'GLB.PergoRise_Gutter', 'P3DV.Stage4.GUTTER_FRONT_FACE_AND_BOTTOM_DATUM'
          ]
        });
      components.push(gutterComponent);
      return {
        id: segment.id,
        componentId: segment.id,
        independentGroupId: segment.groupId || '',
        segmentIndex: segment.segmentIndex,
        systemIndex: segment.systemIndex,
        systemIndices: segment.systemIndices.slice(),
        positionId: segment.positionId || '',
        positionIds: segment.positionIds.slice(),
        sourceStartX: segment.start,
        sourceEndX: segment.end,
        startX: localX(segment.start),
        endX: localX(segment.end),
        length: segment.end - segment.start,
        bottomY: segment.bottomDatumY,
        topY: segment.bottomDatumY + profileHeightY,
        frontZ: segment.frontDatumZ,
        rearZ: segment.frontDatumZ - profileDepthZ,
        plmrPlanY: segment.planY,
        plmrFrontDatumZ: segment.plmrFrontDatumZ,
        centerY,
        centerZ,
        profileSection: clone(gutterComponent.profileSection),
        defaultStartX: segment.bounds.defaultStart,
        defaultEndX: segment.bounds.defaultEnd,
        minusXDelta: segment.bounds.minusXDelta,
        plusXDelta: segment.bounds.plusXDelta,
        sourceSegmentation: segment.sourceSegmentation,
        connectedPostIndices: [],
        rearWallCollision: { collision: false, wallIds: [] }
      };
    });

    const postLayout = [];
    const postXs = Array.isArray(d.postCenterXs) ? d.postCenterXs : [];
    postXs.forEach((axisValue, postIndex) => {
      const axis = mm(axisValue);
      const position = positionAtX(d, axis) || d.positions[0];
      const positionIndex = Number.isFinite(Number(position && position.index)) ? Number(position.index) : frontPositionIndexAtX(d, axis);
      const system = d.systems[positionIndex] || d.systems.find(item => axis >= mm(item.startX) - 0.001 && axis <= mm(item.endX) + 0.001) || d.systems[0];
      const opening = mm(position && position.opening);
      const frontHeight = frontHeightAtX(d, axis);
      const parapetHeight = frontParapetHeightAt(d, axis);
      const extension = frontPostExtensionAt(d, postIndex);
      const profile = frontPostProfileAt(d, postIndex);
      const bounds = frontPostBoundsAt(d, postXs, postIndex);
      const renderCenterX = localX(bounds.center);
      const canonicalAxisX = localX(axis);
      const planDatum = positionPlanDatum(d, positionIndex);
      const profileCenterZ = planDatum.frontDatumZ - profile.boy / 2;
      const profileTopY = profile.custom ? frontHeight : frontHeight - K.onPostTopDrop;
      const profileBottomY = profile.custom
        ? parapetHeight - extension
        : parapetHeight + K.altBlockCorrection - extension;
      const safeTopY = Math.max(profileBottomY + 1, profileTopY);
      const postComponent = component(`front-post-${postIndex + 1}`, 'post', profile.custom ? 'canonical-hollow-post' : 'pillar-profile',
        [renderCenterX, profileBottomY, profileCenterZ], [renderCenterX, safeTopY, profileCenterZ], {
          postIndex,
          systemIndex: system ? system.index : positionIndex,
          positionId: position && position.positionId || '',
          axisX: canonicalAxisX,
          sourceAxisX: axis,
          renderCenterX,
          profileMode: profile.mode,
          profileCustom: profile.custom,
          profileWidthX: profile.en,
          profileDepthZ: profile.boy,
          profileWallThickness: profile.et,
          frontHeight,
          parapetHeight,
          extension,
          bottomY: profileBottomY,
          topY: safeTopY,
          frontReferenceZ: planDatum.frontDatumZ,
          rearReferenceZ: planDatum.rearDatumZ,
          yAlignmentMode: planDatum.yAlignmentMode,
          productionGeometry: true,
          sourceRuleIds: [
            'PLMR.postCenterXs', 'PLMR.frontPostBoundsAt', 'PLMR.frontPostProfileAt',
            'PLMR.frontHeightAtX', 'PLMR.frontParapetHeightAt', 'PLMR.frontPostExtensionAt',
            profile.custom ? 'PLMR.drawHollowRect.POST' : 'PLMR.K.onPostTopDrop',
            profile.custom ? 'PLMR.CUSTOM_POST_NO_STANDARD_CONNECTIONS' : 'PLMR.K.altBlockCorrection'
          ]
        });
      const postBounds3D = {
        minX: renderCenterX - profile.en / 2, maxX: renderCenterX + profile.en / 2,
        minY: profileBottomY, maxY: safeTopY,
        minZ: planDatum.frontDatumZ - profile.boy, maxZ: planDatum.frontDatumZ
      };
      const wallCollision = rearWallCollisionSummary(components, postBounds3D);
      postComponent.rearWallClearance = {
        collision: wallCollision.collision,
        wallIds: wallCollision.wallIds,
        policy: 'Canonical post location is preserved; Stage 2 rear walls remain behind the front-post plane.'
      };
      components.push(postComponent);

      const layoutItem = {
        postIndex,
        systemIndex: postComponent.systemIndex,
        positionId: postComponent.positionId,
        axisX: canonicalAxisX,
        sourceAxisX: axis,
        renderCenterX,
        opening,
        rearDatumZ: planDatum.rearDatumZ,
        frontDatumZ: planDatum.frontDatumZ,
        yAlignmentMode: planDatum.yAlignmentMode,
        profile: clone(profile),
        profileBounds: clone(postBounds3D),
        profileBottomY,
        profileTopY: safeTopY,
        parapetHeight,
        extension,
        upperConnectionId: null,
        lowerConnectionId: null,
        rearWallCollision: wallCollision
      };

      if (!profile.custom) {
        const upperId = `front-post-upper-connection-${postIndex + 1}`;
        const upperPosition = vector(
          renderCenterX + POST_ASSEMBLY_OFFSETS.upper.x,
          safeTopY + POST_ASSEMBLY_OFFSETS.upper.yFromProfileTop,
          profileCenterZ + POST_ASSEMBLY_OFFSETS.upper.zFromProfileCenter
        );
        components.push({
          id: upperId,
          kind: 'post-upper-connection',
          template: 'post-upper-connection-accessory',
          position: upperPosition,
          anchorPosition: vector(renderCenterX, frontHeight, planDatum.frontDatumZ),
          rotation: vector(0, 0, 0),
          postIndex,
          systemIndex: postComponent.systemIndex,
          positionId: postComponent.positionId,
          productionGeometry: true,
          sourceRuleIds: ['PLMR.PergoRise Dikme Oluk Bağlantı', 'PLMR.postTopY', 'GLB.Object016', 'GLB.Shape001']
        });
        const lowerId = `front-post-lower-connection-${postIndex + 1}`;
        const lowerPosition = vector(
          renderCenterX + POST_ASSEMBLY_OFFSETS.lower.x,
          profileBottomY + POST_ASSEMBLY_OFFSETS.lower.yFromProfileBottom,
          profileCenterZ + POST_ASSEMBLY_OFFSETS.lower.zFromProfileCenter
        );
        components.push({
          id: lowerId,
          kind: 'post-lower-connection',
          template: 'foot-accessory',
          position: lowerPosition,
          anchorPosition: vector(renderCenterX, profileBottomY, planDatum.frontDatumZ),
          rotation: vector(0, 0, 0),
          postIndex,
          systemIndex: postComponent.systemIndex,
          positionId: postComponent.positionId,
          productionGeometry: true,
          sourceRuleIds: ['PLMR.PergoRise Dikme Alt Bağlantı', 'PLMR.K.altBlockCorrection', 'GLB.PergoRise_Foot']
        });
        layoutItem.upperConnectionId = upperId;
        layoutItem.lowerConnectionId = lowerId;
        layoutItem.upperConnectionPosition = upperPosition;
        layoutItem.lowerConnectionPosition = lowerPosition;
      }
      postLayout.push(layoutItem);
    });

    gutterLayout.forEach(gutter => {
      gutter.connectedPostIndices = postLayout.filter(post => {
        const sourceX = mm(post.sourceAxisX);
        const sameSystem = !gutter.systemIndices.length || gutter.systemIndices.includes(Number(post.systemIndex) || 0);
        const touchesX = sourceX >= gutter.sourceStartX - 0.001 && sourceX <= gutter.sourceEndX + 0.001;
        const touchesFront = Math.abs(mm(post.frontDatumZ) - gutter.frontZ) < 0.001;
        const touchesBottom = Math.abs(mm(post.profile && post.profile.custom ? post.profileTopY : post.profileTopY + K.onPostTopDrop) - gutter.bottomY) < 0.001;
        return sameSystem && touchesX && touchesFront && touchesBottom;
      }).map(post => post.postIndex);
      const bounds3D = { minX: gutter.startX, maxX: gutter.endX, minY: gutter.bottomY, maxY: gutter.topY, minZ: gutter.rearZ, maxZ: gutter.frontZ };
      const collision = rearWallCollisionSummary(components, bounds3D);
      gutter.rearWallCollision = collision;
      const componentItem = components.find(item => item.id === gutter.componentId);
      if (componentItem) {
        componentItem.connectedPostIndices = gutter.connectedPostIndices.slice();
        componentItem.rearWallClearance = {
          collision: collision.collision,
          wallIds: collision.wallIds,
          policy: 'PLMR gutter is retained on the canonical front-post plane; Stage 2 rear walls remain behind it.'
        };
      }
    });

    const rearWallZ = components.filter(item => item.kind === 'rear-wall' && Array.isArray(item.polygonXZ))
      .flatMap(item => item.polygonXZ.map(point => mm(point && point[1])));
    const gutterXs = gutterLayout.flatMap(item => [mm(item.startX), mm(item.endX)]);
    const gutterYs = gutterLayout.flatMap(item => [mm(item.bottomY), mm(item.topY)]);
    const gutterZs = gutterLayout.flatMap(item => [mm(item.rearZ), mm(item.frontZ)]);
    const roofXs = roofRegisterLayout.flatMap(item => [mm(item.startX), mm(item.endX)]);
    const roofYs = roofRegisterLayout.map(item => mm(item.centerY));
    const roofZs = roofRegisterLayout.map(item => mm(item.centerZ));
    const trapezXs = trapezSheetLayout.flatMap(item => (item.corners || []).map(point => mm(point && point[0])));
    const trapezYs = trapezSheetLayout.flatMap(item => (item.corners || []).map(point => mm(point && point[1])));
    const trapezZs = trapezSheetLayout.flatMap(item => (item.corners || []).map(point => mm(point && point[2])));
    const planDatums = d.positions.map((position, index) => positionPlanDatum(d, index));
    const minX = Math.min(-(mm(d.width) + 100) / 2, ...(gutterXs.length ? gutterXs : [0]), ...(roofXs.length ? roofXs : [0]), ...(trapezXs.length ? trapezXs : [0]));
    const maxX = Math.max((mm(d.width) + 100) / 2, ...(gutterXs.length ? gutterXs : [0]), ...(roofXs.length ? roofXs : [0]), ...(trapezXs.length ? trapezXs : [0]));
    const minZ = Math.min(...planDatums.map(item => item.rearDatumZ), 0, ...(rearWallZ.length ? rearWallZ : [0]), ...(gutterZs.length ? gutterZs : [0]), ...(roofZs.length ? roofZs : [0]), ...(trapezZs.length ? trapezZs : [0]));
    const maxZ = Math.max(...planDatums.map(item => item.frontDatumZ), 1, ...(rearWallZ.length ? rearWallZ : [0]), ...(gutterZs.length ? gutterZs : [0]), ...(roofZs.length ? roofZs : [0]), ...(trapezZs.length ? trapezZs : [0]));
    const height = Math.max(...d.positions.map(position => mm(position.rearHeight)), 1, ...(gutterYs.length ? gutterYs : [0]), ...(roofYs.length ? roofYs : [0]), ...(trapezYs.length ? trapezYs : [0]));
    const envelope = {
      width: Math.max(1, 2 * Math.max(Math.abs(minX), Math.abs(maxX))),
      depth: Math.max(1, maxZ - minZ),
      height,
      minX, maxX, totalWidth: Math.max(1, maxX - minX),
      minZ,
      maxZ,
      totalDepth: Math.max(1, maxZ - minZ)
    };

    const drawing = plmrDrawing(project.input || {});
    appendWaterOutletComponents(components, drawing, d, originX);
    appendSideSupportComponents(components, d, originX);
    appendPlacedProductComponents(components, d, originX);

    const editing = root.P3DVPergoRiseEditing
      ? root.P3DVPergoRiseEditing.buildCanonical(project.input || {}, d, components)
      : { schema: 'p3dv-pergo-rise-editing-v3', inventory: [], operations: ['add','remove','edit','resize','recalculate'], state: {}, targets: [] };

    const editingTargetMap = new Map((editing.targets || []).map(target => [target.id, target]));
    components.forEach(component => {
      const target = editingTargetMap.get(String(component.id));
      if (!target) return;
      component.editing = clone(target);
      component.selectable = true;
      component.contextOperations = clone(target.operations || []);
    });

    const widthSource = String(project.input && project.input.width || '').trim();
    const widthTokens = widthSource.split(';').map(item => item.trim()).filter(Boolean);
    const widthMode = d.independentMode ? 'independent'
      : (/;\s*NO\s*$/i.test(widthSource) ? 'no' : (widthTokens.length === 1 ? (d.systems.length > 1 ? 'total' : 'single') : 'list'));
    const widthTopology = {
      source: widthSource,
      mode: widthMode,
      systemCount: d.systems.length,
      standardPhysicalGap: mm(K.defaultSystemGap),
      totalWidth: mm(d.width),
      nominalTotal: mm(d.nominalWidth),
      sections: d.systems.map((system, index) => ({
        systemIndex: Number(system.index) || index,
        positionId: String(system.positionId || d.positions[index] && d.positions[index].positionId || ''),
        nominalWidth: mm(system.nominalWidth),
        mechanismWidth: mm(system.mechanismWidth),
        rayProfileWidth: mm(system.raySystemW),
        outerStartX: mm(system.outerStartX),
        outerEndX: mm(system.outerEndX),
        mechanismStartX: mm(system.mechanismStartX),
        mechanismEndX: mm(system.mechanismEndX),
        gapAfter: mm(system.gapAfter),
        rayCount: Number(system.rayCount) || 0,
        rearDatumZ: positionPlanDatum(d, index).rearDatumZ,
        frontDatumZ: positionPlanDatum(d, index).frontDatumZ,
        yAlignmentMode: positionPlanDatum(d, index).yAlignmentMode
      })),
      gutterEqualization: {
        policy: d.independentMode ? 'PLMR_INDEPENDENT_GROUP_DATUM' : 'PLMR_FRONT_GUTTER_ALIGNED',
        segmentCount: gutterLayout.length,
        segments: gutterLayout.map(item => ({ id: item.id, length: item.length, frontZ: item.frontZ, startX: item.sourceStartX, endX: item.sourceEndX, systemIndices: item.systemIndices.slice() }))
      }
    };

    return {
      schema: root.P3DVPergoRiseProduct ? root.P3DVPergoRiseProduct.ASSEMBLY_SCHEMA : 'p3dv-static-assembly-v1',
      productId: 'pergo-rise-3d-v1',
      staticState: 'STATIC_OPEN_REAR_STACKED',
      projectHash: project.hash,
      units: 'mm',
      coordinateSystem: { x: 'width', y: 'height', z: 'opening', rearReferencePolicy: 'PLMR positionPlanDatum', rearWallDirection: 'negative-z', plmrTopViewMap: 'x=>x, y=>-z' },
      envelope,
      origin: { sourceX: originX, local: [0, 0, 0] },
      systems,
      positions: clone(d.positions),
      independentGroups: clone(d.independentPergoRiseGroups || []),
      widthTopology,
      planDatums: clone(planDatums),
      editing,
      postLayout,
      gutterLayout,
      roofRegisterLayout,
      trapezSheetLayout,
      rayGroupLayout: components.filter(item => item.kind === 'rail').map(rail => ({
        railGroupId: rail.railGroupId,
        systemIndex: rail.systemIndex,
        positionId: rail.positionId,
        railIndex: rail.railIndex,
        axisX: rail.axisX,
        sourceAxisX: rail.sourceAxisX,
        railProfileId: rail.id,
        rearMechanismId: components.find(item => item.kind === 'rail-rear-mechanism' && item.railGroupId === rail.railGroupId)?.id || null,
        frontHeadId: components.find(item => item.kind === 'rail-front-head' && item.railGroupId === rail.railGroupId)?.id || null,
        rear: clone(rail.start),
        front: clone(rail.end),
        rearMechanismPivot: clone(rail.rearMechanismPivot),
        topViewDatum: clone(rail.topViewDatum),
        actualLength: rail.actualLength,
        nominalPlanLength: rail.nominalPlanLength,
        angleRad: rail.angleRad
      })),
      components,
      counts: {
        systems: d.systems.length,
        positions: d.positions.length,
        rails: components.filter(item => item.kind === 'rail').length,
        railRearMechanisms: components.filter(item => item.kind === 'rail-rear-mechanism').length,
        railFrontHeads: components.filter(item => item.kind === 'rail-front-head').length,
        posts: components.filter(item => item.kind === 'post').length,
        postUpperConnections: components.filter(item => item.kind === 'post-upper-connection').length,
        postLowerConnections: components.filter(item => item.kind === 'post-lower-connection').length,
        customPosts: components.filter(item => item.kind === 'post' && item.profileCustom).length,
        walls: components.filter(item => item.kind === 'rear-wall').length,
        wallConnections: components.filter(item => item.kind === 'wall-connection').length,
        gutters: components.filter(item => item.kind === 'gutter').length,
        roofRegisterProfiles: components.filter(item => item.kind === 'roof-register-profile').length,
        trapezSheets: components.filter(item => item.kind === 'trapez-sheet').length,
        fabricProfiles: components.filter(item => item.kind === 'fabric-profile').length,
        parapets: components.filter(item => item.kind === 'parapet').length,
        waterOutlets: components.filter(item => item.kind === 'water-outlet').length,
        glassTracks: components.filter(item => item.kind === 'glass-track').length,
        triangleJoineryMembers: components.filter(item => item.kind === 'triangle-joinery').length,
        placedProducts: components.filter(item => item.kind === 'area-product').length
      },
      source: clone(project.source),
      unresolvedProductionFields: [
        'Generic GLB Shape node roles are mapped by dimensional signature and documented confidence; no unknown cross-section dimension is invented.',
        'Static fabric stack is a visual representation and is excluded from production geometry.',
        'Shape005 remains as non-rendered audit metadata only. Stage 5 uses verified GLB endpoint nodes Line036 (rear mechanism) and Line035 (front head) as production ray-group accessories.',
        'Stage 6 roof-register profiles use the verified Shape117 linear section under a dedicated roof-register-profile role; PLMR top-view K.catiProfilH remains the 2D visible-depth datum.',
        'Stage 7 trapez sheet placement is the exact PLMR closed plan boundary. PLMR V13.92 does not define sheet thickness or corrugation amplitude, so no unknown section is invented; the 3D sheet is a double-sided zero-thickness production boundary surface.',
        'YF-3 through YF-10 edits mutate PLMR-owned canonical fields and stable target IDs; no generic post-generation mesh offset path is used, and only changed components are reconciled.',
        'PLMR V13.92 exposes one closed trapez-sheet boundary per system rather than physical corrugated module counts; each exposed boundary is independently editable without inventing sheet pitch or overlap rules.',
        'YF-2 conditional components are generated from PLMR canonical flags and side-scoped states. Their component IDs remain stable so the viewer can reconcile only changed instances.',
        'Placed sliding, guillotine and zip products use PLMR placement anchors, parapet/glass-track clearances and block-definition frame dimensions; product-internal arrows and text remain 2D annotations and are not converted to 3D solids.'
      ]
    };
  }

  root.P3DVPergoRiseDerivedGeometry = Object.freeze({ build });
  if (typeof module !== 'undefined') module.exports = root.P3DVPergoRiseDerivedGeometry;
})(typeof window !== 'undefined' ? window : globalThis);
