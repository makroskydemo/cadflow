(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.P3DVBioRiseMultiPosition = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const SCHEMA_VERSION = 'p3dv-bio-rise-multi-position-v3';
  const DEFAULT_POST = Object.freeze({ x: 150, z: 100 });
  const DEFAULT_SIDE_FRAME_WIDTH = 50;
  const DEFAULT_SIDE_GUTTER_WIDTH = 98;
  const DEFAULT_GUTTER_CLEARANCE = 2;
  const MIN_CLEAR_WIDTH = 120;
  const MAX_SYSTEM_COUNT = 20;
  const COORDINATE_TOLERANCE = 0.001;

  function finite(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function positive(value, fallback, minimum) {
    return Math.max(minimum == null ? 0.001 : minimum, finite(value, fallback));
  }

  function integer(value, fallback, minimum, maximum) {
    const rounded = Math.round(finite(value, fallback));
    return Math.max(minimum, Math.min(maximum, rounded));
  }

  function section(value, fallback) {
    const source = value && typeof value === 'object' ? value : {};
    return {
      x: positive(source.x, fallback.x, 20),
      z: positive(source.z, fallback.z, 20)
    };
  }

  function outerPostSections(raw) {
    const list = Array.isArray(raw) ? raw : [];
    return [0, 1, 2, 3].map((index) => section(list[index], DEFAULT_POST));
  }

  function positiveList(raw) {
    if (!Array.isArray(raw)) return [];
    return raw.map((value) => Number(value)).filter((value) => Number.isFinite(value) && value > 0);
  }

  function repeated(value, count) {
    return Array.from({ length: count }, () => value);
  }

  function roundedKey(value) {
    return String(Math.round(Number(value) / COORDINATE_TOLERANCE));
  }

  function buildSingleRow(input) {
    const source = input && typeof input === 'object' ? input : {};
    const requestedWidths = positiveList(source.moduleWidths);
    const requestedDepths = positiveList(source.moduleDepths);
    const inferredCount = requestedWidths.length > 1 ? requestedWidths.length : (requestedDepths.length > 1 ? requestedDepths.length : 0);
    const systemCount = integer(inferredCount || source.systemCount, 1, 1, MAX_SYSTEM_COUNT);
    const moduleWidthMode = requestedWidths.length === systemCount;
    const totalWidth = moduleWidthMode
      ? requestedWidths.reduce((sum, value) => sum + value, 0)
      : positive(source.totalWidth == null ? source.width : source.totalWidth, 0, 0.001);
    const fallbackDepth = positive(source.depth, requestedDepths[0] || 0, 0.001);
    const moduleDepths = requestedDepths.length === systemCount
      ? requestedDepths.slice()
      : repeated(fallbackDepth, systemCount);
    const depth = Math.max(...moduleDepths, fallbackDepth);
    const height = positive(source.height, 0, 0.001);
    const alignment = String(source.alignment || '').toLowerCase() === 'rear' ? 'rear' : 'front';
    const panelCounts = Array.isArray(source.panelCounts)
      ? Array.from({ length: systemCount }, (_, index) => Math.max(0, Math.round(finite(source.panelCounts[index], source.panelCounts[0] || 0))))
      : repeated(Math.max(0, Math.round(finite(source.panelCount, 0))), systemCount);
    const beamVertical = positive(source.beamVertical == null && source.beamSection ? source.beamSection.vertical : source.beamVertical, 218, 20);
    const sideFrameWidth = positive(source.sideFrameWidth, DEFAULT_SIDE_FRAME_WIDTH, 10);
    const sideGutterWidth = positive(source.sideGutterWidth, DEFAULT_SIDE_GUTTER_WIDTH, 10);
    const gutterClearance = Math.max(0, finite(source.gutterClearance, DEFAULT_GUTTER_CLEARANCE));
    const posts = outerPostSections(source.postSections);
    const interiorPost = section(source.interiorPostSection, DEFAULT_POST);
    const rearSections = [];
    const frontSections = [];
    const lineWidths = [];

    for (let lineIndex = 0; lineIndex <= systemCount; lineIndex += 1) {
      const rear = lineIndex === 0 ? posts[0] : (lineIndex === systemCount ? posts[1] : interiorPost);
      const front = lineIndex === 0 ? posts[2] : (lineIndex === systemCount ? posts[3] : interiorPost);
      rearSections.push({ ...rear });
      frontSections.push({ ...front });
      lineWidths.push(Math.max(rear.x, front.x));
    }

    const occupiedWidth = lineWidths.reduce((sum, value) => sum + value, 0);
    const errors = [];
    if (!(totalWidth > 0)) errors.push('TOTAL_WIDTH_REQUIRED');
    if (!(depth > 0)) errors.push('DEPTH_REQUIRED');
    if (!(height > beamVertical + 200)) errors.push('HEIGHT_TOO_SMALL');
    if (requestedWidths.length && requestedWidths.length !== systemCount) errors.push('MODULE_WIDTH_COUNT_MISMATCH');
    if (requestedDepths.length > 1 && requestedDepths.length !== systemCount) errors.push('MODULE_DEPTH_COUNT_MISMATCH');

    const lineAxes = [];
    const moduleBoundaries = [];
    let clearWidth = 0;
    if (!errors.length) {
      if (moduleWidthMode) {
        const leftOuter = -totalWidth / 2;
        moduleBoundaries.push(leftOuter);
        requestedWidths.forEach((value) => moduleBoundaries.push(moduleBoundaries[moduleBoundaries.length - 1] + value));
        lineAxes.push(leftOuter + lineWidths[0] / 2);
        for (let lineIndex = 1; lineIndex < systemCount; lineIndex += 1) lineAxes.push(moduleBoundaries[lineIndex]);
        lineAxes.push(totalWidth / 2 - lineWidths[systemCount] / 2);
      } else {
        const availableClearWidth = totalWidth - occupiedWidth;
        clearWidth = availableClearWidth / systemCount;
        if (!(clearWidth >= MIN_CLEAR_WIDTH)) errors.push('MODULE_CLEAR_WIDTH_TOO_SMALL');
        if (!errors.length) {
          lineAxes.push(-totalWidth / 2 + lineWidths[0] / 2);
          for (let lineIndex = 1; lineIndex <= systemCount; lineIndex += 1) {
            lineAxes.push(
              lineAxes[lineIndex - 1]
              + lineWidths[lineIndex - 1] / 2
              + clearWidth
              + lineWidths[lineIndex] / 2
            );
          }
          moduleBoundaries.push(-totalWidth / 2);
          for (let moduleIndex = 0; moduleIndex < systemCount; moduleIndex += 1) {
            moduleBoundaries.push(lineAxes[moduleIndex + 1] + lineWidths[moduleIndex + 1] / 2);
          }
        }
      }
    }

    const modules = [];
    if (!errors.length) {
      const frontReferenceZ = depth / 2;
      const rearReferenceZ = -depth / 2;
      for (let moduleIndex = 0; moduleIndex < systemCount; moduleIndex += 1) {
        const leftLine = moduleIndex;
        const rightLine = moduleIndex + 1;
        const moduleDepth = moduleDepths[moduleIndex];
        const rearOuterZ = alignment === 'rear' ? rearReferenceZ : frontReferenceZ - moduleDepth;
        const frontOuterZ = alignment === 'rear' ? rearReferenceZ + moduleDepth : frontReferenceZ;
        const leftLineWidth = lineWidths[leftLine];
        const rightLineWidth = lineWidths[rightLine];
        const clearMinX = lineAxes[leftLine] + leftLineWidth / 2;
        const clearMaxX = lineAxes[rightLine] - rightLineWidth / 2;
        const outerMinX = moduleWidthMode ? moduleBoundaries[moduleIndex] : lineAxes[leftLine] - leftLineWidth / 2;
        const outerMaxX = moduleWidthMode ? moduleBoundaries[moduleIndex + 1] : lineAxes[rightLine] + rightLineWidth / 2;
        const moduleClearWidth = clearMaxX - clearMinX;
        if (!(moduleClearWidth >= MIN_CLEAR_WIDTH)) errors.push(`MODULE_CLEAR_WIDTH_TOO_SMALL:${moduleIndex + 1}`);

        const leftBoundaryShared = leftLine > 0;
        const rightBoundaryShared = rightLine < systemCount;
        const leftSideBeamX = leftBoundaryShared
          ? lineAxes[leftLine] + sideFrameWidth / 2
          : outerMinX + sideFrameWidth / 2;
        const rightSideBeamX = rightBoundaryShared
          ? lineAxes[rightLine] - sideFrameWidth / 2
          : outerMaxX - sideFrameWidth / 2;
        const leftGutterOuterX = clearMinX + gutterClearance;
        const rightGutterOuterX = clearMaxX - gutterClearance;
        const leftGutterInnerX = leftGutterOuterX + sideGutterWidth;
        const rightGutterInnerX = rightGutterOuterX - sideGutterWidth;
        const panelMinX = leftGutterInnerX;
        const panelMaxX = rightGutterInnerX;
        const panelLength = Math.max(80, panelMaxX - panelMinX);
        const rearStartX = lineAxes[leftLine] + rearSections[leftLine].x / 2;
        const rearEndX = lineAxes[rightLine] - rearSections[rightLine].x / 2;
        const frontStartX = lineAxes[leftLine] + frontSections[leftLine].x / 2;
        const frontEndX = lineAxes[rightLine] - frontSections[rightLine].x / 2;
        const leftStartZ = rearOuterZ + rearSections[leftLine].z;
        const leftEndZ = frontOuterZ - frontSections[leftLine].z;
        const rightStartZ = rearOuterZ + rearSections[rightLine].z;
        const rightEndZ = frontOuterZ - frontSections[rightLine].z;

        modules.push({
          id: `bio-rise-module-${moduleIndex + 1}`,
          moduleIndex, leftLine, rightLine,
          centerX: (clearMinX + clearMaxX) / 2,
          referenceWidth: moduleWidthMode ? requestedWidths[moduleIndex] : outerMaxX - outerMinX,
          clearMinX, clearMaxX, clearWidth: moduleClearWidth,
          outerMinX, outerMaxX, outerWidth: outerMaxX - outerMinX,
          rearStartX, rearEndX, rearBeamLength: rearEndX - rearStartX,
          frontStartX, frontEndX, frontBeamLength: frontEndX - frontStartX,
          depth: moduleDepth, centerZ: (rearOuterZ + frontOuterZ) / 2, rearOuterZ, frontOuterZ,
          leftSideBeamX, rightSideBeamX,
          leftSideBeamZ: (leftStartZ + leftEndZ) / 2,
          leftSideBeamLength: leftEndZ - leftStartZ,
          rightSideBeamZ: (rightStartZ + rightEndZ) / 2,
          rightSideBeamLength: rightEndZ - rightStartZ,
          leftGutterOuterX, rightGutterOuterX, leftGutterInnerX, rightGutterInnerX,
          gutterCenterZ: (rearOuterZ + frontOuterZ) / 2,
          gutterLength: Math.max(200, moduleDepth - 100),
          panelMinX, panelMaxX, panelCenterX: (panelMinX + panelMaxX) / 2, panelLength,
          panelCount: panelCounts[moduleIndex]
        });
      }
    }

    const postItems = [];
    const postMap = new Map();
    function addPost(row, lineIndex, moduleIndex, z, sec) {
      const key = `${row}|${lineIndex}|${roundedKey(z)}`;
      const existing = postMap.get(key);
      if (existing) {
        if (!existing.moduleIndices.includes(moduleIndex)) existing.moduleIndices.push(moduleIndex);
        existing.sharedBoundary = existing.moduleIndices.length > 1;
        return existing;
      }
      const outerLine = lineIndex === 0 || lineIndex === systemCount;
      const sourceIndex = row === 'rear'
        ? (lineIndex === 0 ? 0 : (lineIndex === systemCount ? 1 : -1))
        : (lineIndex === 0 ? 2 : (lineIndex === systemCount ? 3 : -1));
      const shortPost = !outerLine;
      const postHeight = shortPost ? Math.max(1, height - beamVertical) : height;
      const item = {
        id: '', row, lineIndex, sourceIndex, moduleIndex,
        moduleIndices: [moduleIndex], sharedBoundary: false, outerLine,
        x: lineAxes[lineIndex], y: shortPost ? -beamVertical / 2 : 0, z,
        height: postHeight, section: { ...sec }, stopsUnderRecord: shortPost
      };
      postMap.set(key, item);
      postItems.push(item);
      return item;
    }

    if (!errors.length) {
      modules.forEach((module) => {
        addPost('rear', module.leftLine, module.moduleIndex, module.rearOuterZ + rearSections[module.leftLine].z / 2, rearSections[module.leftLine]);
        addPost('rear', module.rightLine, module.moduleIndex, module.rearOuterZ + rearSections[module.rightLine].z / 2, rearSections[module.rightLine]);
        addPost('front', module.leftLine, module.moduleIndex, module.frontOuterZ - frontSections[module.leftLine].z / 2, frontSections[module.leftLine]);
        addPost('front', module.rightLine, module.moduleIndex, module.frontOuterZ - frontSections[module.rightLine].z / 2, frontSections[module.rightLine]);
      });
      const lineRowCounts = new Map();
      postItems.forEach((post) => {
        const base = `${post.row}|${post.lineIndex}`;
        lineRowCounts.set(base, (lineRowCounts.get(base) || 0) + 1);
      });
      postItems.forEach((post) => {
        const base = `${post.row}|${post.lineIndex}`;
        post.id = lineRowCounts.get(base) === 1
          ? `bio-rise-post-${post.row}-${post.lineIndex}`
          : `bio-rise-post-${post.row}-${post.lineIndex}-m${post.moduleIndex + 1}`;
      });
    }

    const beamItems = [];
    if (!errors.length) {
      modules.forEach((module) => {
        beamItems.push({
          id: `bio-rise-beam-rear-${module.moduleIndex + 1}`, kind: 'width', row: 'rear', moduleIndex: module.moduleIndex,
          x: (module.rearStartX + module.rearEndX) / 2, z: module.rearOuterZ,
          length: module.rearEndX - module.rearStartX
        });
        beamItems.push({
          id: `bio-rise-beam-front-${module.moduleIndex + 1}`, kind: 'width', row: 'front', moduleIndex: module.moduleIndex,
          x: (module.frontStartX + module.frontEndX) / 2, z: module.frontOuterZ,
          length: module.frontEndX - module.frontStartX
        });
        beamItems.push({
          id: `bio-rise-beam-left-${module.moduleIndex + 1}`, kind: 'depth', side: 'left', moduleIndex: module.moduleIndex,
          x: module.leftSideBeamX, z: module.leftSideBeamZ, length: module.leftSideBeamLength
        });
        beamItems.push({
          id: `bio-rise-beam-right-${module.moduleIndex + 1}`, kind: 'depth', side: 'right', moduleIndex: module.moduleIndex,
          x: module.rightSideBeamX, z: module.rightSideBeamZ, length: module.rightSideBeamLength
        });
      });
    }

    const frontPosts = postItems.filter((post) => post.row === 'front');
    const rearPosts = postItems.filter((post) => post.row === 'rear');
    return {
      schemaVersion: SCHEMA_VERSION,
      valid: errors.length === 0,
      errors,
      systemCount, totalWidth, depth, height, beamVertical,
      alignment,
      moduleWidthMode: moduleWidthMode ? 'FRAME_WIDTH_LIST' : 'EQUAL_CLEAR_FROM_TOTAL',
      moduleWidths: moduleWidthMode ? requestedWidths.slice() : modules.map((module) => module.referenceWidth),
      moduleDepths: moduleDepths.slice(), panelCounts: panelCounts.slice(), moduleBoundaries,
      sideFrameWidth, sideGutterWidth, gutterClearance,
      postLineCount: systemCount + 1,
      expectedPostCount: postItems.length,
      expectedBeamCount: beamItems.length,
      occupiedWidth, clearWidth, lineWidths, lineAxes,
      rearSections, frontSections,
      frontPostAxes: frontPosts.map((post) => ({ x: post.x, z: post.z, lineIndex: post.lineIndex, shared: post.sharedBoundary })),
      rearPostAxes: rearPosts.map((post) => ({ x: post.x, z: post.z, lineIndex: post.lineIndex, shared: post.sharedBoundary })),
      sharedFrontPostCount: frontPosts.filter((post) => post.sharedBoundary).length,
      sharedRearPostCount: rearPosts.filter((post) => post.sharedBoundary).length,
      posts: postItems, beams: beamItems, modules
    };
  }


  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function transformNumber(value, offset, sign) {
    const number = Number(value);
    return Number.isFinite(number) ? sign * (number + offset) : value;
  }

  function transformRowLayout(layout, rowIndex, options) {
    const rowLabel = rowIndex === 0 ? 'front-row' : 'rear-row';
    const xOffset = Number(options.xOffset) || 0;
    const xCenterShift = Number(options.xCenterShift) || 0;
    const zOffset = Number(options.zOffset) || 0;
    const zSign = Number(options.zSign) < 0 ? -1 : 1;
    const moduleBase = Number(options.moduleBase) || 0;
    const tx = (value) => Number(value) + xOffset - xCenterShift;
    const tz = (value) => transformNumber(value, zOffset, zSign);
    const transformed = clone(layout);
    transformed.rowIndex = rowIndex;
    transformed.rowLabel = rowLabel;
    transformed.xOffset = xOffset - xCenterShift;
    transformed.zSign = zSign;
    transformed.referenceZ = 0;
    transformed.modules = layout.modules.map((module, localModuleIndex) => {
      const item = clone(module);
      item.id = `${rowLabel}-${module.id}`;
      item.rowIndex = rowIndex;
      item.rowLabel = rowLabel;
      item.localModuleIndex = localModuleIndex;
      item.moduleIndex = moduleBase + localModuleIndex;
      item.centerX = tx(module.centerX);
      ['clearMinX','clearMaxX','outerMinX','outerMaxX','rearStartX','rearEndX','frontStartX','frontEndX','panelMinX','panelMaxX','panelCenterX','leftSideBeamX','rightSideBeamX','leftGutterOuterX','rightGutterOuterX','leftGutterInnerX','rightGutterInnerX'].forEach((key) => {
        if (Number.isFinite(Number(module[key]))) item[key] = tx(module[key]);
      });
      ['centerZ','rearOuterZ','frontOuterZ','rearInnerZLeft','rearInnerZRight','frontInnerZLeft','frontInnerZRight','leftSideBeamZ','rightSideBeamZ','gutterCenterZ'].forEach((key) => {
        if (Number.isFinite(Number(module[key]))) item[key] = tz(module[key]);
      });
      item.rearToFrontSign = Math.sign(Number(item.frontOuterZ) - Number(item.rearOuterZ)) || 1;
      item.panelCollection = options.panelCollection;
      item.panelTarget = options.panelCollection === 'outer' ? 'outer-rear-facade' : 'shared-center';
      item.rearLeftSection = clone(layout.rearSections[module.leftLine]);
      item.rearRightSection = clone(layout.rearSections[module.rightLine]);
      item.frontLeftSection = clone(layout.frontSections[module.leftLine]);
      item.frontRightSection = clone(layout.frontSections[module.rightLine]);
      item.leftLineLocal = module.leftLine;
      item.rightLineLocal = module.rightLine;
      item.leftLine = `${rowIndex}:${module.leftLine}`;
      item.rightLine = `${rowIndex}:${module.rightLine}`;
      return item;
    });
    transformed.posts = layout.posts.map((post) => {
      const item = clone(post);
      item.id = `${rowLabel}-${post.id}`;
      item.rowIndex = rowIndex;
      item.rowLabel = rowLabel;
      item.localModuleIndex = post.moduleIndex;
      item.moduleIndex = moduleBase + Number(post.moduleIndex || 0);
      item.moduleIndices = (post.moduleIndices || [post.moduleIndex]).map((value) => moduleBase + Number(value || 0));
      item.lineIndexLocal = post.lineIndex;
      item.lineIndex = `${rowIndex}:${post.lineIndex}`;
      item.x = tx(post.x);
      item.z = tz(post.z);
      item.referenceBoundary = post.row === options.referenceFacade;
      item.boundaryAxisZ = item.referenceBoundary ? 0 : null;
      return item;
    });
    transformed.beams = layout.beams.map((beam) => {
      const item = clone(beam);
      item.id = `${rowLabel}-${beam.id}`;
      item.rowIndex = rowIndex;
      item.rowLabel = rowLabel;
      if (Number.isFinite(Number(beam.moduleIndex))) {
        item.localModuleIndex = beam.moduleIndex;
        item.moduleIndex = moduleBase + Number(beam.moduleIndex);
      }
      if (Array.isArray(beam.moduleIndices)) item.moduleIndices = beam.moduleIndices.map((value) => moduleBase + Number(value || 0));
      if (Number.isFinite(Number(beam.x))) item.x = tx(beam.x);
      if (Number.isFinite(Number(beam.z))) item.z = tz(beam.z);
      item.rearToFrontSign = zSign;
      if (item.kind === 'width') {
        item.inwardSign = item.row === 'rear' ? zSign : -zSign;
        item.referenceBoundary = item.row === options.referenceFacade;
        item.boundaryAxisZ = item.referenceBoundary ? 0 : null;
      }
      if (Number.isFinite(Number(beam.startZ))) item.startZ = tz(beam.startZ);
      if (Number.isFinite(Number(beam.endZ))) item.endZ = tz(beam.endZ);
      if (Number.isFinite(Number(item.startZ)) && Number.isFinite(Number(item.endZ))) {
        const start = Math.min(item.startZ, item.endZ);
        const end = Math.max(item.startZ, item.endZ);
        item.startZ = start;
        item.endZ = end;
        item.z = (start + end) / 2;
        item.length = end - start;
      }
      if (item.lineIndex != null) {
        item.lineIndexLocal = item.lineIndex;
        item.lineIndex = `${rowIndex}:${item.lineIndex}`;
      }
      return item;
    });
    transformed.minX = Math.min(...transformed.modules.map((module) => module.outerMinX));
    transformed.maxX = Math.max(...transformed.modules.map((module) => module.outerMaxX));
    transformed.minZ = Math.min(...transformed.modules.map((module) => Math.min(module.rearOuterZ, module.frontOuterZ)));
    transformed.maxZ = Math.max(...transformed.modules.map((module) => Math.max(module.rearOuterZ, module.frontOuterZ)));
    return transformed;
  }

  function dedupeCompositePosts(rows, height, beamVertical) {
    const result = [];
    const map = new Map();
    rows.forEach((row) => row.posts.forEach((post) => {
      const coordinateZ = post.referenceBoundary ? Number(post.boundaryAxisZ) || 0 : post.z;
      const key = `${roundedKey(post.x)}|${roundedKey(coordinateZ)}|${roundedKey(post.section.x)}|${roundedKey(post.section.z)}`;
      const existing = map.get(key);
      if (!existing) {
        const item = clone(post);
        if (post.referenceBoundary) { item.z = Number(post.boundaryAxisZ) || 0; item.centeredOnBoundary = true; }
        item.rowIndices = [row.rowIndex];
        item.sourceIds = [post.id];
        map.set(key, item);
        result.push(item);
        return;
      }
      if (!existing.rowIndices.includes(row.rowIndex)) existing.rowIndices.push(row.rowIndex);
      existing.sourceIds.push(post.id);
      existing.moduleIndices = Array.from(new Set([...(existing.moduleIndices || []), ...(post.moduleIndices || [])]));
      existing.sharedBoundary = true;
      existing.sharedAcrossRows = existing.rowIndices.length > 1;
      existing.sourceIndex = -1;
    }));
    result.forEach((post, index) => {
      post.id = `bio-rise-composite-post-${index + 1}`;
      if (post.sharedAcrossRows) {
        post.height = Math.max(1, height - beamVertical);
        post.y = -beamVertical / 2;
        post.stopsUnderRecord = true;
      }
    });
    return result;
  }

  function dedupeCompositeBeams(rows) {
    const result = [];
    const map = new Map();
    rows.forEach((row) => row.beams.forEach((beam) => {
      const kind = String(beam.kind || '');
      const key = kind === 'depth'
        ? `${kind}|${roundedKey(beam.x)}|${roundedKey(beam.startZ)}|${roundedKey(beam.endZ)}|${roundedKey(beam.length)}`
        : (beam.referenceBoundary
          ? `${kind}|REFERENCE|${roundedKey(beam.x)}|${roundedKey(beam.length)}`
          : `${kind}|${String(beam.row || beam.side || '')}|${roundedKey(beam.x)}|${roundedKey(beam.z)}|${roundedKey(beam.length)}`);
      const existing = map.get(key);
      if (!existing) {
        const item = clone(beam);
        if (beam.referenceBoundary) { item.z = Number(beam.boundaryAxisZ) || 0; item.centeredOnBoundary = true; item.inwardSign = 0; }
        item.rowIndices = [row.rowIndex];
        item.sourceIds = [beam.id];
        map.set(key, item);
        result.push(item);
        return;
      }
      if (!existing.rowIndices.includes(row.rowIndex)) existing.rowIndices.push(row.rowIndex);
      existing.sourceIds.push(beam.id);
      existing.sharedAcrossRows = existing.rowIndices.length > 1;
      existing.moduleIndices = Array.from(new Set([...(existing.moduleIndices || []), ...(beam.moduleIndices || []), ...(Number.isFinite(Number(beam.moduleIndex)) ? [beam.moduleIndex] : [])]));
    }));
    result.forEach((beam, index) => { beam.id = `bio-rise-composite-beam-${index + 1}`; });
    return result;
  }

  function buildBackToBack(input) {
    const source = input && typeof input === 'object' ? input : {};
    const rowInputs = Array.isArray(source.rows) ? source.rows : [];
    if (rowInputs.length !== 2) return buildSingleRow(source);
    const rowAlignment = String(source.rowAlignment || '').toLowerCase() === 'right' ? 'right' : 'left';
    const panelCollection = String(source.panelCollection || '').toLowerCase() === 'outer' ? 'outer' : 'center';
    const localAlignment = panelCollection === 'outer' ? 'front' : 'rear';
    const localRows = rowInputs.map((row, rowIndex) => {
      const widths = positiveList(row.moduleWidths);
      const depths = positiveList(row.moduleDepths);
      const panelCounts = Array.isArray(row.panelCounts) ? row.panelCounts.slice() : [];
      return buildSingleRow({
        ...source,
        rows: undefined,
        systemCount: widths.length || depths.length || 1,
        totalWidth: widths.reduce((sum, value) => sum + value, 0),
        moduleWidths: widths,
        depth: Math.max(...depths, 0),
        moduleDepths: depths,
        panelCounts,
        alignment: localAlignment
      });
    });
    const errors = [];
    localRows.forEach((row, index) => {
      if (!row.valid) row.errors.forEach((error) => errors.push(`ROW_${index + 1}:${error}`));
    });
    if (errors.length) {
      return {
        schemaVersion: SCHEMA_VERSION, valid: false, errors, rowCount: 2,
        systemCount: rowInputs.reduce((sum, row) => sum + positiveList(row.moduleWidths).length, 0),
        rows: []
      };
    }
    const rawXOffsets = localRows.map((row) => rowAlignment === 'right' ? -row.totalWidth / 2 : row.totalWidth / 2);
    const rawMinX = Math.min(...localRows.map((row, index) => -row.totalWidth / 2 + rawXOffsets[index]));
    const rawMaxX = Math.max(...localRows.map((row, index) => row.totalWidth / 2 + rawXOffsets[index]));
    const xCenterShift = (rawMinX + rawMaxX) / 2;
    let moduleBase = 0;
    const transformedRows = localRows.map((row, rowIndex) => {
      const referenceZ = localAlignment === 'rear' ? -row.depth / 2 : row.depth / 2;
      const zOffset = -referenceZ;
      const zSign = panelCollection === 'center'
        ? (rowIndex === 0 ? 1 : -1)
        : (rowIndex === 0 ? -1 : 1);
      const transformed = transformRowLayout(row, rowIndex, {
        xOffset: rawXOffsets[rowIndex], xCenterShift, zOffset, zSign, moduleBase, panelCollection, referenceFacade: localAlignment
      });
      moduleBase += row.systemCount;
      return transformed;
    });
    const modules = transformedRows.flatMap((row) => row.modules);
    const posts = dedupeCompositePosts(transformedRows, positive(source.height, 0, 0.001), positive(source.beamVertical == null && source.beamSection ? source.beamSection.vertical : source.beamVertical, 220, 20));
    const beams = dedupeCompositeBeams(transformedRows);
    const minX = Math.min(...modules.map((module) => module.outerMinX));
    const maxX = Math.max(...modules.map((module) => module.outerMaxX));
    const minZ = Math.min(...modules.map((module) => Math.min(module.rearOuterZ, module.frontOuterZ)));
    const maxZ = Math.max(...modules.map((module) => Math.max(module.rearOuterZ, module.frontOuterZ)));
    const totalWidth = maxX - minX;
    const depth = maxZ - minZ;
    const frontPosts = posts.filter((post) => post.row === 'front');
    const rearPosts = posts.filter((post) => post.row === 'rear');
    return {
      schemaVersion: SCHEMA_VERSION,
      valid: true,
      errors: [],
      backToBack: true,
      rowCount: 2,
      rowAlignment,
      panelCollection,
      systemCount: modules.length,
      totalWidth,
      depth,
      height: positive(source.height, 0, 0.001),
      beamVertical: positive(source.beamVertical == null && source.beamSection ? source.beamSection.vertical : source.beamVertical, 220, 20),
      moduleWidthMode: 'ROW_MODULE_LIST',
      moduleWidths: modules.map((module) => module.referenceWidth),
      moduleDepths: modules.map((module) => module.depth),
      panelCounts: modules.map((module) => module.panelCount),
      rows: transformedRows.map((row) => ({
        rowIndex: row.rowIndex, rowLabel: row.rowLabel, systemCount: row.systemCount,
        totalWidth: row.totalWidth, depth: row.depth, minX: row.minX, maxX: row.maxX, minZ: row.minZ, maxZ: row.maxZ,
        moduleIndices: row.modules.map((module) => module.moduleIndex)
      })),
      expectedPostCount: posts.length,
      expectedBeamCount: beams.length,
      sharedAcrossRowPostCount: posts.filter((post) => post.sharedAcrossRows).length,
      sharedAcrossRowBeamCount: beams.filter((beam) => beam.sharedAcrossRows).length,
      frontPostAxes: frontPosts.map((post) => ({ x: post.x, z: post.z, shared: post.sharedBoundary, sharedAcrossRows: Boolean(post.sharedAcrossRows) })),
      rearPostAxes: rearPosts.map((post) => ({ x: post.x, z: post.z, shared: post.sharedBoundary, sharedAcrossRows: Boolean(post.sharedAcrossRows) })),
      posts,
      beams,
      modules,
      envelope: { minX, maxX, minZ, maxZ, width: totalWidth, depth }
    };
  }

  function build(input) {
    const source = input && typeof input === 'object' ? input : {};
    return Array.isArray(source.rows) && source.rows.length === 2
      ? buildBackToBack(source)
      : buildSingleRow(source);
  }

  return Object.freeze({
    SCHEMA_VERSION, DEFAULT_POST, DEFAULT_SIDE_FRAME_WIDTH, DEFAULT_SIDE_GUTTER_WIDTH,
    DEFAULT_GUTTER_CLEARANCE, MIN_CLEAR_WIDTH, MAX_SYSTEM_COUNT, COORDINATE_TOLERANCE, buildSingleRow, build
  });
});
