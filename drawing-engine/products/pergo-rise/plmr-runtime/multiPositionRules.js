(function (global) {
  'use strict';

  const DEFAULT_MAX_SYSTEMS = 30;
  const STANDARD_PHYSICAL_GAP = 13;
  const NO_MODE_MIN_GAP = 13;
  const MIN_REAR_MECHANISM_WIDTH = 92;
  const DEFAULT_RAY_WIDTH = 80;
  const DEFAULT_RAY_INSET_TOTAL = 12;

  function text(value) { return value === undefined || value === null ? '' : String(value).trim(); }
  function upper(value) { return text(value).toLocaleUpperCase('tr-TR'); }
  function number(value) {
    const parsed = Number(text(value).replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : NaN;
  }
  function integerMm(value) {
    const parsed = number(value);
    return Number.isFinite(parsed) ? Math.round(parsed) : NaN;
  }
  function tokens(value) { return text(value).split(';').map(item => item.trim()).filter(Boolean); }
  function numericTokens(value) { return tokens(value).filter(item => upper(item) !== 'NO').map(integerMm); }

  function systemCount(raw, maxSystems = DEFAULT_MAX_SYSTEMS) {
    const source = text(raw);
    if (!source) return { ok: false, count: 0, code: 'SYSTEM_COUNT_REQUIRED' };
    const parsed = number(source);
    if (!Number.isFinite(parsed) || Math.round(parsed) !== parsed || parsed < 1) return { ok: false, count: 0, code: 'SYSTEM_COUNT_INVALID' };
    if (parsed > maxSystems) return { ok: false, count: parsed, code: 'SYSTEM_COUNT_LIMIT', limit: maxSystems };
    return { ok: true, count: parsed, code: '' };
  }

  function minimumMechanismWidthForRayCount(rayCount, rayWidth = DEFAULT_RAY_WIDTH, rayInsetTotal = DEFAULT_RAY_INSET_TOTAL) {
    const count = Math.max(1, Math.round(Number(rayCount) || 1));
    const width = Math.max(1, Math.round(Number(rayWidth) || DEFAULT_RAY_WIDTH));
    const inset = Math.max(0, Math.round(Number(rayInsetTotal) || DEFAULT_RAY_INSET_TOTAL));
    return Math.max(MIN_REAR_MECHANISM_WIDTH, count * width + inset);
  }

  function balancedIntegerSplit(total, count) {
    const safeCount = Math.max(1, Math.round(Number(count) || 1));
    const safeTotal = Math.round(Number(total) || 0);
    const base = Math.floor(safeTotal / safeCount);
    let remainder = safeTotal - base * safeCount;
    const out = Array.from({ length: safeCount }, () => base);
    const order = Array.from({ length: safeCount }, (_, index) => index).sort((a, b) => {
      const center = (safeCount - 1) / 2;
      const distance = Math.abs(a - center) - Math.abs(b - center);
      return Math.abs(distance) > 1e-9 ? distance : a - b;
    });
    for (let i = 0; i < order.length && remainder > 0; i += 1, remainder -= 1) out[order[i]] += 1;
    return out;
  }

  function parseWidth(raw, count, options) {
    const opts = options || {};
    const standardGap = Math.max(0, Math.round(Number(opts.standardGap) || STANDARD_PHYSICAL_GAP));
    const minNoGap = Math.max(0, Math.round(Number(opts.minNoGap) || NO_MODE_MIN_GAP));
    const source = text(raw);
    const rawTokens = tokens(source);
    if (!source || !rawTokens.length) return { ok: false, code: 'WIDTH_REQUIRED', mode: 'invalid', widths: [], gaps: [] };
    const noMode = upper(rawTokens[rawTokens.length - 1]) === 'NO';
    if (rawTokens.some((item, index) => upper(item) === 'NO' && index !== rawTokens.length - 1)) {
      return { ok: false, code: 'NO_TOKEN_POSITION', mode: 'invalid', widths: [], gaps: [] };
    }

    if (noMode) {
      const values = rawTokens.slice(0, -1).map(integerMm);
      if (values.some(value => !Number.isFinite(value))) return { ok: false, code: 'WIDTH_NUMERIC_REQUIRED', mode: 'no', widths: [], gaps: [] };
      if (values.length !== Math.max(1, 2 * count - 1)) return { ok: false, code: 'NO_TOKEN_COUNT_MISMATCH', mode: 'no', widths: [], gaps: [] };
      const widths = values.filter((_, index) => index % 2 === 0);
      const gaps = values.filter((_, index) => index % 2 === 1);
      if (widths.length !== count) return { ok: false, code: 'WIDTH_SYSTEM_COUNT_MISMATCH', mode: 'no', widths, gaps };
      if (widths.some(value => value <= 0)) return { ok: false, code: 'WIDTH_POSITIVE_REQUIRED', mode: 'no', widths, gaps };
      if (gaps.some(value => value < minNoGap)) return { ok: false, code: 'NO_GAP_MINIMUM', mode: 'no', widths, gaps, minimum: minNoGap };
      return { ok: true, code: '', mode: 'no', widths, gaps, total: widths.reduce((a, b) => a + b, 0) + gaps.reduce((a, b) => a + b, 0), source };
    }

    if (rawTokens.some(item => upper(item) === 'NO')) return { ok: false, code: 'NO_TOKEN_POSITION', mode: 'invalid', widths: [], gaps: [] };
    const values = rawTokens.map(integerMm);
    if (values.some(value => !Number.isFinite(value))) return { ok: false, code: 'WIDTH_NUMERIC_REQUIRED', mode: 'invalid', widths: [], gaps: [] };
    if (values.some(value => value <= 0)) return { ok: false, code: 'WIDTH_POSITIVE_REQUIRED', mode: 'invalid', widths: [], gaps: [] };

    if (values.length === 1 && count > 1) {
      const total = values[0];
      const gaps = Array.from({ length: count - 1 }, () => standardGap);
      const available = total - gaps.reduce((a, b) => a + b, 0);
      if (available < count * 80) return { ok: false, code: 'TOTAL_WIDTH_TOO_SMALL', mode: 'total', widths: [], gaps, total };
      const widths = balancedIntegerSplit(available, count);
      return { ok: true, code: '', mode: 'total', widths, gaps, total, source };
    }

    if (values.length !== count) return { ok: false, code: 'WIDTH_SYSTEM_COUNT_MISMATCH', mode: 'list', widths: values, gaps: [] };
    const gaps = Array.from({ length: Math.max(0, count - 1) }, () => standardGap);
    return { ok: true, code: '', mode: count === 1 ? 'single' : 'list', widths: values, gaps, total: values.reduce((a, b) => a + b, 0) + gaps.reduce((a, b) => a + b, 0), source };
  }

  function resolveWidthLayout(raw, count, options) {
    const opts = options || {};
    const parsed = parseWidth(raw, count, opts);
    if (!parsed.ok) return { ...parsed, nominalWidths: [], mechanismWidths: [], rayProfileWidths: [] };
    const mode = boundaryMode(opts.boundaryMode);
    const glassDeduct = Math.max(0, Math.round(Number(opts.glassMechanismDeductEachSide) || 60));
    const rayInsetTotal = Math.max(0, Math.round(Number(opts.rayInsetTotal) || 12));
    const exteriorSideCounts = Array.from({ length: count }, (_, index) => {
      const value = Array.isArray(opts.exteriorSideCounts) ? opts.exteriorSideCounts[index] : 0;
      return mode === 'DARALT' ? Math.max(0, Math.min(2, Math.round(Number(value) || 0))) : 0;
    });
    const mechanismDeductions = exteriorSideCounts.map(value => value * glassDeduct);
    let nominalWidths = parsed.widths.slice();
    let mechanismWidths;

    if (parsed.mode === 'total') {
      const totalGap = parsed.gaps.reduce((sum, value) => sum + value, 0);
      const totalDeduct = mechanismDeductions.reduce((sum, value) => sum + value, 0);
      const available = Math.round(Number(parsed.total) || 0) - totalGap - totalDeduct;
      if (available < count * MIN_REAR_MECHANISM_WIDTH) {
        return { ...parsed, ok: false, code: 'TOTAL_WIDTH_TOO_SMALL', nominalWidths: [], mechanismWidths: [], rayProfileWidths: [] };
      }
      mechanismWidths = balancedIntegerSplit(available, count);
      nominalWidths = mechanismWidths.map((value, index) => value + mechanismDeductions[index]);
    } else {
      mechanismWidths = nominalWidths.map((value, index) => value - mechanismDeductions[index]);
    }

    if (mechanismWidths.some(value => value < MIN_REAR_MECHANISM_WIDTH)) {
      return { ...parsed, ok: false, code: 'SYSTEM_WIDTH_TOO_SMALL', nominalWidths: [], mechanismWidths: [], rayProfileWidths: [] };
    }
    const rayProfileWidths = mechanismWidths.map(value => value - rayInsetTotal);
    return {
      ...parsed, ok: true, code: '', boundaryMode: mode,
      exteriorSideCounts, mechanismDeductions,
      nominalWidths, outerWidths: nominalWidths.slice(),
      systemWidths: mechanismWidths.slice(), mechanismWidths, rayProfileWidths
    };
  }

  function parsePositionValues(raw, count, options) {
    const opts = options || {};
    const allowBlank = opts.allowBlank === true;
    const allowSingle = opts.allowSingle !== false;
    const firstOnly = opts.firstOnly === true;
    const minimum = Number.isFinite(Number(opts.minimum)) ? Number(opts.minimum) : null;
    const maximum = Number.isFinite(Number(opts.maximum)) ? Number(opts.maximum) : null;
    const source = text(raw);
    if (!source) return allowBlank ? { ok: true, values: [], mode: 'blank', code: '' } : { ok: false, values: [], mode: 'blank', code: 'VALUE_REQUIRED' };
    const rawParts = tokens(source).filter(item => upper(item) !== 'NO');
    const values = rawParts.map(integerMm);
    if (values.some(value => !Number.isFinite(value))) return { ok: false, values, mode: 'invalid', code: 'VALUE_NUMERIC_REQUIRED' };
    if (firstOnly) {
      const value = values[0];
      if (minimum !== null && value < minimum) return { ok: false, values: [value], mode: 'first', code: 'VALUE_MINIMUM', minimum };
      if (maximum !== null && value > maximum) return { ok: false, values: [value], mode: 'first', code: 'VALUE_MAXIMUM', maximum };
      return { ok: true, values: [value], mode: 'first', code: '' };
    }
    if (!((allowSingle && values.length === 1) || values.length === count)) return { ok: false, values, mode: 'list', code: 'VALUE_SYSTEM_COUNT_MISMATCH' };
    if (minimum !== null && values.some(value => value < minimum)) return { ok: false, values, mode: 'list', code: 'VALUE_MINIMUM', minimum };
    if (maximum !== null && values.some(value => value > maximum)) return { ok: false, values, mode: 'list', code: 'VALUE_MAXIMUM', maximum };
    return { ok: true, values, mode: values.length === 1 ? 'single' : 'list', code: '' };
  }

  function expand(values, count, fallback) {
    const list = Array.isArray(values) ? values : [];
    if (!list.length) return Array.from({ length: count }, () => fallback);
    if (list.length === 1) return Array.from({ length: count }, () => list[0]);
    return Array.from({ length: count }, (_, index) => list[index]);
  }

  function colonTokens(value) {
    return text(value).split(':').map(item => item.trim());
  }

  function independentGroupId(index) { return `IPR-${String(index + 1).padStart(2, '0')}`; }
  function independentPositionId(groupIndex, positionIndex) { return `${independentGroupId(groupIndex)}-P${String(positionIndex + 1).padStart(2, '0')}`; }

  function widthGroupPositionCount(expression) {
    const raw = tokens(expression);
    if (!raw.length) return { ok: false, code: 'INDEPENDENT_WIDTH_GROUP_REQUIRED', count: 0 };
    const noIndexes = raw.map((item, index) => upper(item) === 'NO' ? index : -1).filter(index => index >= 0);
    if (noIndexes.some(index => index !== raw.length - 1)) return { ok: false, code: 'NO_TOKEN_POSITION', count: 0 };
    const noMode = noIndexes.length === 1;
    const numeric = noMode ? raw.slice(0, -1) : raw.slice();
    if (!numeric.length || numeric.some(item => !Number.isFinite(integerMm(item)))) return { ok: false, code: 'WIDTH_NUMERIC_REQUIRED', count: 0 };
    // Bağımsız grup modunda W;G;W biçimi ;NO yazılmadan da kanoniktir.
    // Çift sayıda token ise eski doğrudan genişlik listesi davranışı korunur.
    const alternating = numeric.length >= 3 && numeric.length % 2 === 1;
    if (noMode || alternating) return { ok: true, code: '', count: (numeric.length + 1) / 2, noMode, alternating: true };
    return { ok: true, code: '', count: numeric.length, noMode: false, alternating: false };
  }

  function parseIndependentWidthGroups(raw, options) {
    const source = text(raw);
    if (!source.includes(':')) return { ok: true, code: '', independent: false, groups: [], groupGaps: [], totalPositionCount: 0, source };
    const parts = colonTokens(source);
    if (parts.length < 3 || parts.length % 2 !== 1 || parts.some(part => !part)) {
      return { ok: false, code: 'INDEPENDENT_WIDTH_FORMAT', independent: true, groups: [], groupGaps: [], totalPositionCount: 0, source };
    }
    const groups = [];
    const groupGaps = [];
    let globalPositionIndex = 0;
    for (let partIndex = 0; partIndex < parts.length; partIndex += 1) {
      if (partIndex % 2 === 1) {
        const gap = integerMm(parts[partIndex]);
        if (!Number.isFinite(gap) || gap <= 0) return { ok: false, code: 'INDEPENDENT_GROUP_GAP_POSITIVE', independent: true, groupIndex: Math.floor(partIndex / 2), groups, groupGaps, totalPositionCount: globalPositionIndex, source };
        groupGaps.push(gap);
        continue;
      }
      const groupIndex = Math.floor(partIndex / 2);
      const countResult = widthGroupPositionCount(parts[partIndex]);
      if (!countResult.ok) return { ok: false, code: countResult.code, independent: true, groupIndex, groups, groupGaps, totalPositionCount: globalPositionIndex, source };
      let parsed;
      if (countResult.alternating && !countResult.noMode) {
        const values = tokens(parts[partIndex]).map(integerMm);
        const widths = values.filter((_, index) => index % 2 === 0);
        const gaps = values.filter((_, index) => index % 2 === 1);
        if (widths.some(value => !Number.isFinite(value) || value <= 0)) return { ok: false, code: 'WIDTH_POSITIVE_REQUIRED', independent: true, groupIndex, groups, groupGaps, totalPositionCount: globalPositionIndex, source };
        if (gaps.some(value => !Number.isFinite(value) || value <= 0)) return { ok: false, code: 'INDEPENDENT_INTERNAL_GAP_POSITIVE', independent: true, groupIndex, groups, groupGaps, totalPositionCount: globalPositionIndex, source };
        parsed = { ok: true, code: '', mode: 'independent-alternating', widths, gaps, total: widths.reduce((a,b)=>a+b,0)+gaps.reduce((a,b)=>a+b,0), source: parts[partIndex] };
      } else {
        parsed = parseWidth(parts[partIndex], countResult.count, options);
      }
      if (!parsed.ok) return { ...parsed, independent: true, groupIndex, groups, groupGaps, totalPositionCount: globalPositionIndex, source };
      const groupId = independentGroupId(groupIndex);
      const positions = parsed.widths.map((width, positionIndex) => ({
        id: independentPositionId(groupIndex, positionIndex),
        positionId: independentPositionId(groupIndex, positionIndex),
        groupId,
        groupIndex,
        positionIndex,
        globalPositionIndex: globalPositionIndex + positionIndex,
        width
      }));
      groups.push({
        id: groupId,
        groupId,
        groupIndex,
        expression: parts[partIndex],
        positionCount: countResult.count,
        positions,
        widths: parsed.widths.slice(),
        internalGaps: parsed.gaps.slice(),
        widthMode: parsed.mode,
        gapAfterGroup: null
      });
      globalPositionIndex += countResult.count;
    }
    groups.forEach((group, index) => { group.gapAfterGroup = index < groupGaps.length ? groupGaps[index] : null; });
    const legacyWidthTokens = [];
    groups.forEach((group, groupIndex) => {
      group.widths.forEach((width, positionIndex) => {
        legacyWidthTokens.push(width);
        if (positionIndex < group.internalGaps.length) legacyWidthTokens.push(group.internalGaps[positionIndex]);
      });
      if (groupIndex < groupGaps.length) legacyWidthTokens.push(groupGaps[groupIndex]);
    });
    return {
      ok: true,
      code: '',
      independent: true,
      groups,
      groupGaps,
      totalPositionCount: globalPositionIndex,
      source,
      legacyWidthText: `${legacyWidthTokens.join(';')};NO`
    };
  }

  function parseIndependentGroupExpression(expression, positionCount, options) {
    const opts = options || {};
    const allowBlank = opts.allowBlank === true;
    const allowNoSuffix = opts.allowNoSuffix === true;
    const source = text(expression);
    if (!source) return allowBlank ? { ok: true, code: '', values: [], mode: 'blank', alignToFirst: false, internalGaps: [] } : { ok: false, code: 'VALUE_REQUIRED', values: [], alignToFirst: false, internalGaps: [] };
    const rawParts = tokens(source);
    const noIndexes = rawParts.map((item, index) => upper(item) === 'NO' ? index : -1).filter(index => index >= 0);
    if (noIndexes.length && (!allowNoSuffix || noIndexes.length > 1 || noIndexes[0] !== rawParts.length - 1)) {
      return { ok: false, code: allowNoSuffix ? 'INDEPENDENT_NO_POSITION' : 'NO_NOT_ALLOWED', values: [], alignToFirst: false, internalGaps: [] };
    }
    const alignToFirst = noIndexes.length === 1;
    const numericParts = alignToFirst ? rawParts.slice(0, -1) : rawParts.slice();
    const values = numericParts.map(integerMm);
    if (!values.length || values.some(value => !Number.isFinite(value))) return { ok: false, code: 'VALUE_NUMERIC_REQUIRED', values, alignToFirst, internalGaps: [] };
    let positionValues;
    let internalGaps = [];
    if (values.length === 1) positionValues = Array.from({ length: positionCount }, () => values[0]);
    else if (values.length === positionCount) positionValues = values.slice();
    else if (values.length === Math.max(1, 2 * positionCount - 1)) {
      positionValues = values.filter((_, index) => index % 2 === 0);
      internalGaps = values.filter((_, index) => index % 2 === 1);
      if (internalGaps.some(value => value <= 0)) return { ok: false, code: 'INDEPENDENT_FIELD_GAP_POSITIVE', values: positionValues, alignToFirst, internalGaps };
    } else return { ok: false, code: 'INDEPENDENT_GROUP_VALUE_COUNT', values, alignToFirst, internalGaps, expectedCount: positionCount };
    const minimum = Number.isFinite(Number(opts.minimum)) ? Number(opts.minimum) : null;
    const maximum = Number.isFinite(Number(opts.maximum)) ? Number(opts.maximum) : null;
    if (minimum !== null && positionValues.some(value => value < minimum)) return { ok: false, code: 'VALUE_MINIMUM', values: positionValues, alignToFirst, internalGaps, minimum };
    if (maximum !== null && positionValues.some(value => value > maximum)) return { ok: false, code: 'VALUE_MAXIMUM', values: positionValues, alignToFirst, internalGaps, maximum };
    if (opts.integer === true && positionValues.some(value => Math.round(value) !== value)) return { ok: false, code: 'VALUE_INTEGER_REQUIRED', values: positionValues, alignToFirst, internalGaps };
    return { ok: true, code: '', values: positionValues, mode: values.length === 1 ? 'single' : (internalGaps.length ? 'alternating' : 'list'), alignToFirst, internalGaps };
  }

  function independentFieldExpressions(raw, widthTopology, options) {
    const opts = options || {};
    const source = text(raw);
    const groupCount = widthTopology.groups.length;
    const allowBlank = opts.allowBlank === true;
    const allowNoSuffix = opts.allowNoSuffix === true;
    if (!source) {
      return allowBlank
        ? { ok: true, code: '', expressions: Array.from({ length: groupCount }, () => ''), separatorGaps: [], mode: 'blank', globalAlignToFirst: false }
        : { ok: false, code: 'VALUE_REQUIRED', expressions: [], separatorGaps: [], globalAlignToFirst: false };
    }
    // V13.32: ':' yalnız genişlik alanında bağımsız grup topolojisini kurar.
    // Açılım/yükseklik/ray/dikme alanları tek global ';' listesiyle dağıtılır.
    if (source.includes(':')) {
      return { ok: false, code: 'INDEPENDENT_FIELD_COLON_NOT_ALLOWED', expressions: [], separatorGaps: [], globalAlignToFirst: false };
    }
    const rawParts = tokens(source);
    const noIndexes = rawParts.map((item, index) => upper(item) === 'NO' ? index : -1).filter(index => index >= 0);
    if (noIndexes.length && (!allowNoSuffix || noIndexes.length > 1 || noIndexes[0] !== rawParts.length - 1)) {
      return { ok: false, code: allowNoSuffix ? 'INDEPENDENT_NO_POSITION' : 'NO_NOT_ALLOWED', expressions: [], separatorGaps: [], globalAlignToFirst: false };
    }
    const globalAlignToFirst = noIndexes.length === 1;
    const numericParts = globalAlignToFirst ? rawParts.slice(0, -1) : rawParts.slice();
    if (!numericParts.length) return { ok: false, code: 'VALUE_REQUIRED', expressions: [], separatorGaps: [], globalAlignToFirst };
    if (numericParts.some(item => !Number.isFinite(integerMm(item)))) {
      return { ok: false, code: 'VALUE_NUMERIC_REQUIRED', expressions: [], separatorGaps: [], globalAlignToFirst };
    }
    const suffix = globalAlignToFirst ? ';NO' : '';
    if (numericParts.length === 1) {
      return {
        ok: true, code: '',
        expressions: Array.from({ length: groupCount }, () => `${numericParts[0]}${suffix}`),
        separatorGaps: [], mode: 'broadcast', globalAlignToFirst
      };
    }
    if (numericParts.length !== widthTopology.totalPositionCount) {
      return { ok: false, code: 'VALUE_SYSTEM_COUNT_MISMATCH', expressions: [], separatorGaps: [], expectedCount: widthTopology.totalPositionCount, globalAlignToFirst };
    }
    const expressions = [];
    let cursor = 0;
    widthTopology.groups.forEach(group => {
      expressions.push(`${numericParts.slice(cursor, cursor + group.positionCount).join(';')}${suffix}`);
      cursor += group.positionCount;
    });
    return { ok: true, code: '', expressions, separatorGaps: [], mode: 'flat-position-list', globalAlignToFirst };
  }

  function parseIndependentPositionField(raw, widthTopology, options) {
    const opts = options || {};
    const split = independentFieldExpressions(raw, widthTopology, opts);
    if (!split.ok) return { ...split, ok: false, groups: [], values: [] };
    const groups = [];
    const values = [];
    for (let groupIndex = 0; groupIndex < widthTopology.groups.length; groupIndex += 1) {
      const widthGroup = widthTopology.groups[groupIndex];
      const parsed = parseIndependentGroupExpression(split.expressions[groupIndex], widthGroup.positionCount, opts);
      if (!parsed.ok) return { ...parsed, ok: false, groupIndex, groups, values, field: opts.field || '' };
      const group = {
        groupId: widthGroup.groupId,
        groupIndex,
        values: parsed.values.slice(),
        internalGaps: parsed.internalGaps.slice(),
        alignToFirst: parsed.alignToFirst,
        expression: split.expressions[groupIndex]
      };
      groups.push(group);
      values.push(...parsed.values);
    }
    return { ok: true, code: '', groups, values, separatorGaps: split.separatorGaps, mode: split.mode };
  }

  function parseIndependentPergoRiseInput(raw, options) {
    const source = raw && typeof raw === 'object' ? raw : {};
    const width = parseIndependentWidthGroups(source.width, options);
    if (!width.ok || !width.independent) return width.independent ? { ...width, ok: false } : { ok: true, code: '', independent: false, width };
    const opening = parseIndependentPositionField(source.opening, width, { field: 'opening', allowNoSuffix: true, minimum: 1 });
    if (!opening.ok) return { ...opening, independent: true, width, field: 'opening' };
    const rearHeight = parseIndependentPositionField(source.rearHeight, width, { field: 'rearHeight', minimum: 1 });
    if (!rearHeight.ok) return { ...rearHeight, independent: true, width, field: 'rearHeight' };
    const frontHeight = parseIndependentPositionField(source.frontHeight, width, { field: 'frontHeight', minimum: 0 });
    if (!frontHeight.ok) return { ...frontHeight, independent: true, width, field: 'frontHeight' };
    const rayCount = parseIndependentPositionField(source.rayCount, width, { field: 'rayCount', allowBlank: true, integer: true, minimum: 1, maximum: options && options.maxRaysPerSystem });
    if (!rayCount.ok) return { ...rayCount, independent: true, width, field: 'rayCount' };
    const postCount = parseIndependentPositionField(source.postCount, width, { field: 'postCount', allowBlank: true, integer: true, minimum: 0 });
    if (!postCount.ok) return { ...postCount, independent: true, width, field: 'postCount' };
    const groups = width.groups.map((group, groupIndex) => ({
      ...group,
      openingValues: opening.groups[groupIndex].values.slice(),
      rearHeightValues: rearHeight.groups[groupIndex].values.slice(),
      frontHeightValues: frontHeight.groups[groupIndex].values.slice(),
      rayCountValues: rayCount.groups[groupIndex].values.slice(),
      postCountValues: postCount.groups[groupIndex].values.slice(),
      alignTopViewStartYToFirstPosition: opening.groups[groupIndex].alignToFirst,
      yAlignmentMode: opening.groups[groupIndex].alignToFirst ? 'REAR_START_ALIGNED' : 'FRONT_GUTTER_ALIGNED'
    }));
    return {
      ok: true,
      code: '',
      independent: true,
      width,
      opening,
      rearHeight,
      frontHeight,
      rayCount,
      postCount,
      groups,
      totalPositionCount: width.totalPositionCount,
      legacyWidthText: width.legacyWidthText,
      openingText: opening.values.join(';'),
      rearHeightText: rearHeight.values.join(';'),
      frontHeightText: frontHeight.values.join(';'),
      rayCountText: rayCount.values.length ? rayCount.values.join(';') : '',
      postCountText: postCount.values.length ? postCount.values.join(';') : ''
    };
  }

  function boundaryMode(value) { return upper(value) === 'DEGISTIRME' ? 'DEGISTIRME' : 'DARALT'; }

  const api = Object.freeze({
    DEFAULT_MAX_SYSTEMS, STANDARD_PHYSICAL_GAP, NO_MODE_MIN_GAP,
    MIN_REAR_MECHANISM_WIDTH, DEFAULT_RAY_WIDTH, DEFAULT_RAY_INSET_TOTAL,
    tokens, numericTokens, systemCount, minimumMechanismWidthForRayCount, balancedIntegerSplit, parseWidth, resolveWidthLayout, parsePositionValues, expand, boundaryMode,
    colonTokens, widthGroupPositionCount, parseIndependentWidthGroups, parseIndependentGroupExpression, independentFieldExpressions, parseIndependentPositionField, parseIndependentPergoRiseInput, independentGroupId, independentPositionId
  });
  global.PulumurMultiPositionRules = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
