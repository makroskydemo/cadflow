(function (root, factory) {
  const api = factory(
    root && root.PulumurGuillotineProductionContractV1,
    typeof module === 'object' && module.exports ? require('./productionContract.js') : null
  );
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.PulumurGuillotineProductionEngineV1 = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (browserContract, nodeContract) {
  'use strict';

  const contract = browserContract || nodeContract;
  if (!contract) throw new Error('GUILLOTINE_PRODUCTION_CONTRACT_REQUIRED');

  const ENGINE_ID = 'plmr-guillotine-1plus2-insulated-standard-engine-v1';
  const OUTPUT_SCHEMA = 'plmr-guillotine-production-result-v1';
  const UNKNOWN_RULE_REASON = Object.freeze({
    code: 'SUITABILITY_RULES_NOT_DEFINED',
    message: 'Teknik üretilebilirlik kuralları henüz tanımlanmadı.'
  });

  const clone = value => value == null ? value : JSON.parse(JSON.stringify(value));
  const text = value => value == null ? '' : String(value).trim();
  const finite = (value, code) => {
    const n = Number(value);
    if (!Number.isFinite(n)) throw new Error(code || 'PRODUCTION_NUMBER_INVALID');
    return n;
  };
  const roundUp = (value, digits) => {
    const n = finite(value);
    const d = Math.max(0, Math.trunc(Number(digits) || 0));
    const f = 10 ** d;
    return Math.ceil((n * f) - Number.EPSILON) / f;
  };
  // Workbook formula is ROUNDDOWN(value, 0.1). The workbook cached outputs
  // confirm integer truncation for the verified sample positions.
  const workbookRoundDown = value => Math.trunc(finite(value));

  const RULES = Object.freeze([
    { ruleId:'P12-1212', kind:'PROFILE', materialCode:'1212', sourceRow:12, lengthFormula:'=D5-5', quantityFormula:'=$H$5', sourcePositions:['D5','H5'], length:c=>c.width-5, quantity:c=>c.quantity },
    { ruleId:'P13-1211', kind:'PROFILE', materialCode:'1211', sourceRow:13, lengthFormula:'=D5-7', quantityFormula:'=$H$5', sourcePositions:['D5','H5'], length:c=>c.width-7, quantity:c=>c.quantity },
    { ruleId:'P14-1208', kind:'PROFILE', materialCode:'1208', sourceRow:14, lengthFormula:'=D5-198', quantityFormula:'=$H$5', sourcePositions:['D5','H5'], length:c=>c.width-198, quantity:c=>c.quantity },
    { ruleId:'P15-1207', kind:'PROFILE', materialCode:'1207', sourceRow:15, lengthFormula:'=D5-193', quantityFormula:'=$H$5', sourcePositions:['D5','H5'], length:c=>c.width-193, quantity:c=>c.quantity },
    { ruleId:'P16-1206', kind:'PROFILE', materialCode:'1206', sourceRow:16, lengthFormula:'=D5-193', quantityFormula:'=$H$5*4', sourcePositions:['D5','H5'], length:c=>c.width-193, quantity:c=>c.quantity*4 },
    { ruleId:'P17-1209', kind:'PROFILE', materialCode:'1209', sourceRow:17, lengthFormula:'=ROUNDDOWN((F5-349)/3,0.1)', quantityFormula:'=$H$5*6', sourcePositions:['F5','H5'], length:c=>workbookRoundDown((c.height-349)/3), quantity:c=>c.quantity*6 },
    { ruleId:'P18-1213', kind:'PROFILE', materialCode:'1213', sourceRow:18, lengthFormula:'=F5-159', quantityFormula:'=$H$5*2', sourcePositions:['F5','H5'], length:c=>c.height-159, quantity:c=>c.quantity*2 },
    { ruleId:'P19-1214-A', kind:'PROFILE', materialCode:'1214', sourceRow:19, lengthFormula:'=F5-159', quantityFormula:'=$H$5*2', sourcePositions:['F5','H5'], length:c=>c.height-159, quantity:c=>c.quantity*2 },
    { ruleId:'P20-1214-B', kind:'PROFILE', materialCode:'1214', sourceRow:20, lengthFormula:'=H19+3.5', quantityFormula:'=$H$5*2', sourcePositions:['H19','H5'], length:c=>c.H19+3.5, quantity:c=>c.quantity*2 },
    { ruleId:'P21-1215', kind:'PROFILE', materialCode:'1215', sourceRow:21, lengthFormula:'=H20', quantityFormula:'=$H$5*2', sourcePositions:['H20','H5'], correctedFrom:'=J10-155', length:c=>c.H20, quantity:c=>c.quantity*2 },
    { ruleId:'P22-1216-A', kind:'PROFILE', materialCode:'1216', sourceRow:22, lengthFormula:'=H18-H17-95', quantityFormula:'=$H$5*2', sourcePositions:['H18','H17','H5'], length:c=>c.H18-c.H17-95, quantity:c=>c.quantity*2 },
    { ruleId:'P23-1216-B', kind:'PROFILE', materialCode:'1216', sourceRow:23, lengthFormula:'=H17+54', quantityFormula:'=$H$5*2', sourcePositions:['H17','H5'], length:c=>c.H17+54, quantity:c=>c.quantity*2 },
    { ruleId:'P24-1204', kind:'PROFILE', materialCode:'1204', sourceRow:24, lengthFormula:'=H16', quantityFormula:'=$H$5', sourcePositions:['H16','H5'], length:c=>c.H16, quantity:c=>c.quantity },
    { ruleId:'P25-1203', kind:'PROFILE', materialCode:'1203', sourceRow:25, lengthFormula:'=D5-32', quantityFormula:'=$H$5', sourcePositions:['D5','H5'], length:c=>c.width-32, quantity:c=>c.quantity },
    { ruleId:'P26-AKS0001', kind:'PROFILE', materialCode:'AKS0001', sourceRow:26, lengthFormula:'=D5-85', quantityFormula:'=$H$5', sourcePositions:['D5','H5'], length:c=>c.width-85, quantity:c=>c.quantity },
    { ruleId:'A29-AKS0002', kind:'ACCESSORY', materialCode:'AKS0002', sourceRow:29, quantityFormula:'=$H$5', sourcePositions:['H5'], quantity:c=>c.quantity },
    { ruleId:'A30-AKS0003', kind:'ACCESSORY', materialCode:'AKS0003', sourceRow:30, quantityFormula:'=ROUNDUP((5*((H17+40)/1000))*H5,0)', sourcePositions:['H17','H5'], quantity:c=>roundUp((5*((c.H17+40)/1000))*c.quantity,0) },
    { ruleId:'A31-AKS0004', kind:'ACCESSORY', materialCode:'AKS0004', sourceRow:31, quantityFormula:'=ROUNDUP((H12*2*I12)/1000,0)', sourcePositions:['H12','I12'], quantity:c=>roundUp((c.H12*2*c.I12)/1000,0) },
    { ruleId:'A32-AKS0005', kind:'ACCESSORY', materialCode:'AKS0005', sourceRow:32, quantityFormula:'=IF(H5=0,0,ROUNDUP(((H21*4)+(H20*2)+(H16*3)*H5)/1000,0))', sourcePositions:['H21','H20','H16','H5'], notes:'Uses corrected H21 = H20.', quantity:c=>c.quantity===0?0:roundUp(((c.H21*4)+(c.H20*2)+(c.H16*3)*c.quantity)/1000,0) },
    { ruleId:'A33-AKS0006', kind:'ACCESSORY', materialCode:'AKS0006', sourceRow:33, quantityFormula:'=$H$5', sourcePositions:['H5'], quantity:c=>c.quantity },
    { ruleId:'A34-AKS0007', kind:'ACCESSORY', materialCode:'AKS0007', sourceRow:34, quantityFormula:'=REMOTE_QUANTITY_FROM_PROJECT', sourcePositions:['remoteQuantity'], notes:'Workbook note says remote quantity is entered from project input and, with multiple positions, appears only on the first position.', manualQuantityRequired:(c,p)=>Boolean(text(p && p.remoteControl)) && c.isFirstSupportedPosition && c.remoteQuantity<=0, quantity:c=>c.isFirstSupportedPosition?c.remoteQuantity:0 },
    { ruleId:'A35-SM0001', kind:'ACCESSORY', materialCode:'SM0001', sourceRow:35, quantityFormula:'=$H$5', sourcePositions:['H5'], quantity:c=>c.quantity },
    { ruleId:'A36-CAM0001', kind:'GLASS', materialCode:'CAM0001', sourceRow:36, quantityFormula:'=ROUNDUP((H16+40)*(H17+40)*3*H5/1000000,2)', sourcePositions:['H16','H17','H5'], quantity:c=>roundUp((c.H16+40)*(c.H17+40)*3*c.quantity/1000000,2), detail:c=>`${c.H16+40} mm x ${c.H17+40} mm x ${3*c.quantity} Adet` }
  ]);

  function materialIndex(materials) {
    const map = new Map();
    (Array.isArray(materials) ? materials : []).filter(item => item && item.active !== false).forEach(item => {
      const code = text(item.code).toUpperCase();
      if (code && !map.has(code)) map.set(code, item);
    });
    return map;
  }

  function validateContext(position) {
    const errors = [];
    if (!position || !text(position.positionId)) errors.push('POSITION_ID_REQUIRED');
    if (!position || !text(position.positionNo)) errors.push('POSITION_NO_REQUIRED');
    const width = Number(position && position.width);
    const height = Number(position && position.height);
    const quantity = Number(position && position.quantity);
    if (!(width > 0 && Number.isFinite(width))) errors.push('WIDTH_INVALID');
    if (!(height > 0 && Number.isFinite(height))) errors.push('HEIGHT_INVALID');
    if (!(quantity > 0 && Number.isInteger(quantity))) errors.push('QUANTITY_INVALID');
    return errors;
  }

  function resolveOverride(overrides, positionId, ruleId) {
    const byPosition = overrides && overrides[positionId];
    const byRule = byPosition && byPosition[ruleId];
    return byRule && typeof byRule === 'object' ? byRule : {};
  }

  function combineStatus(...inputs) {
    const values = inputs.filter(Boolean);
    if (values.some(v => v.status === contract.VALUE_STATUS.MANUAL_REQUIRED)) return contract.VALUE_STATUS.MANUAL_REQUIRED;
    if (values.some(v => v.status === contract.VALUE_STATUS.MANUAL_OVERRIDE)) return contract.VALUE_STATUS.MANUAL_OVERRIDE;
    if (values.some(v => v.status === contract.VALUE_STATUS.ZERO_RESULT)) return contract.VALUE_STATUS.ZERO_RESULT;
    return contract.VALUE_STATUS.NORMAL;
  }

  function calculationCells(position, isFirstSupportedPosition) {
    const width = finite(position.width, 'WIDTH_INVALID');
    const height = finite(position.height, 'HEIGHT_INVALID');
    const quantity = finite(position.quantity, 'QUANTITY_INVALID');
    const H12 = width - 5;
    const H16 = width - 193;
    const H17 = workbookRoundDown((height - 349) / 3);
    const H18 = height - 159;
    const H19 = height - 159;
    const H20 = H19 + 3.5;
    const H21 = H20; // User-approved correction. Never use workbook J10-155.
    return {
      width, height, quantity,
      remoteQuantity: Math.max(0, Math.trunc(Number(position.remoteQuantity) || 0)),
      isFirstSupportedPosition: Boolean(isFirstSupportedPosition),
      H12, I12: quantity, H16, H17, H18, H19, H20, H21
    };
  }

  function calculateRule(rule, ctx, material, override, position) {
    if (!material) throw new Error(`MATERIAL_NOT_FOUND:${rule.materialCode}`);
    const calcLength = typeof rule.length === 'function' ? rule.length(ctx) : null;
    const calcQuantity = typeof rule.quantity === 'function' ? rule.quantity(ctx) : null;
    const lengthRequired = typeof rule.manualLengthRequired === 'function' ? Boolean(rule.manualLengthRequired(ctx, position)) : Boolean(rule.manualLengthRequired);
    const quantityRequired = typeof rule.manualQuantityRequired === 'function' ? Boolean(rule.manualQuantityRequired(ctx, position)) : Boolean(rule.manualQuantityRequired);
    const lengthValue = calcLength === null ? null : contract.resolveProductionValue(calcLength, override.length, { manualRequired: lengthRequired });
    const quantityValue = contract.resolveProductionValue(calcQuantity, override.quantity, { manualRequired: quantityRequired });
    const baseDescription = text(material.descriptionTr || material.descriptionEn || material.code);
    const ralValue = contract.resolveProductionValue(position.systemColor || '', override.ral, {});
    const surfaceValue = contract.resolveProductionValue(position.surface || '', override.surface, {});
    const descriptionValue = contract.resolveProductionValue(baseDescription, override.description, {});
    const status = combineStatus(lengthValue, quantityValue, ralValue, surfaceValue, descriptionValue);
    const validation = [];
    if (lengthValue && Number(lengthValue.effectiveValue) < 0) validation.push({ code:'NEGATIVE_LENGTH', message:`${rule.ruleId} hesaplanan boy negatiftir.` });
    if (Number(quantityValue.effectiveValue) < 0) validation.push({ code:'NEGATIVE_QUANTITY', message:`${rule.ruleId} hesaplanan miktar negatiftir.` });
    const line = {
      ruleId: rule.ruleId,
      kind: rule.kind,
      sourceRow: rule.sourceRow,
      sourcePositions: clone(rule.sourcePositions || []),
      formula: { length: rule.lengthFormula || null, quantity: rule.quantityFormula || null },
      notes: rule.notes || null,
      positionIds: [position.positionId],
      positionNo: position.positionNo,
      materialId: material.materialId || null,
      materialCode: text(material.code).toUpperCase(),
      profileName: baseDescription,
      description: descriptionValue.effectiveValue,
      calculatedDescription: descriptionValue.calculatedValue,
      manualDescription: descriptionValue.manualValue,
      effectiveDescription: descriptionValue.effectiveValue,
      unit: material.unit || null,
      calculatedLength: lengthValue ? lengthValue.calculatedValue : null,
      manualLength: lengthValue ? lengthValue.manualValue : null,
      effectiveLength: lengthValue ? lengthValue.effectiveValue : null,
      calculatedQuantity: quantityValue.calculatedValue,
      manualQuantity: quantityValue.manualValue,
      effectiveQuantity: quantityValue.effectiveValue,
      ral: ralValue.effectiveValue,
      calculatedRal: ralValue.calculatedValue,
      manualRal: ralValue.manualValue,
      effectiveRal: ralValue.effectiveValue,
      surface: surfaceValue.effectiveValue,
      calculatedSurface: surfaceValue.calculatedValue,
      manualSurface: surfaceValue.manualValue,
      effectiveSurface: surfaceValue.effectiveValue,
      status,
      fieldStatus: {
        length: lengthValue ? lengthValue.status : null,
        quantity: quantityValue.status,
        ral: ralValue.status,
        surface: surfaceValue.status,
        description: descriptionValue.status
      },
      validation,
      detail: typeof rule.detail === 'function' ? rule.detail(ctx) : null
    };
    return line;
  }

  function calculatePosition(position, materials, overrides, options) {
    if (!position || !position.supportedByContract) {
      const error = new Error(`RECIPE_NOT_SUPPORTED:${position && position.positionNo || 'UNKNOWN'}`);
      error.code = 'RECIPE_NOT_SUPPORTED';
      throw error;
    }
    const inputErrors = validateContext(position);
    if (inputErrors.length) {
      const error = new Error(`PRODUCTION_INPUT_INVALID:${inputErrors.join(',')}`);
      error.code = 'PRODUCTION_INPUT_INVALID';
      error.details = inputErrors;
      throw error;
    }
    const index = materialIndex(materials);
    const ctx = calculationCells(position, options && options.isFirstSupportedPosition);
    const lines = RULES.map(rule => calculateRule(rule, ctx, index.get(rule.materialCode), resolveOverride(overrides, position.positionId, rule.ruleId), position));
    const validation = lines.flatMap(line => line.validation.map(item => ({ ...item, ruleId: line.ruleId, materialCode: line.materialCode })));
    return {
      positionId: position.positionId,
      positionNo: position.positionNo,
      source: clone(position),
      suitability: { status: contract.SUITABILITY_STATUS.UNKNOWN, reasons: [clone(UNKNOWN_RULE_REASON)] },
      calculatedCells: { H12:ctx.H12, H16:ctx.H16, H17:ctx.H17, H18:ctx.H18, H19:ctx.H19, H20:ctx.H20, H21:ctx.H21 },
      lines,
      cutItems: lines.filter(line => line.kind === 'PROFILE'),
      accessoryItems: lines.filter(line => line.kind === 'ACCESSORY'),
      glassItems: lines.filter(line => line.kind === 'GLASS'),
      validation
    };
  }

  function aggregateLines(lines) {
    const map = new Map();
    for (const line of Array.isArray(lines) ? lines : []) {
      const key = [line.kind,line.ruleId,line.materialCode,line.effectiveLength == null ? '' : line.effectiveLength,line.ral,line.surface,line.status,line.description].join('|');
      if (!map.has(key)) map.set(key, clone(line));
      else {
        const row = map.get(key);
        row.positionIds = Array.from(new Set(row.positionIds.concat(line.positionIds)));
        row.effectiveQuantity = Number(row.effectiveQuantity || 0) + Number(line.effectiveQuantity || 0);
        row.calculatedQuantity = Number(row.calculatedQuantity || 0) + Number(line.calculatedQuantity || 0);
        if (row.manualQuantity != null || line.manualQuantity != null) row.manualQuantity = Number(row.manualQuantity || 0) + Number(line.manualQuantity || 0);
      }
    }
    return Array.from(map.values());
  }

  function generatePackage(input) {
    const source = input && input.source;
    const materials = input && input.materials;
    const overrides = input && input.overrides || {};
    if (!source || source.contractId !== contract.CONTRACT_ID) throw new Error('PRODUCTION_SOURCE_CONTRACT_INVALID');
    const positions = Array.isArray(source.positions) ? source.positions : [];
    const supported = positions.filter(position => position.supportedByContract);
    const unsupported = positions.filter(position => !position.supportedByContract).map(position => ({
      positionId: position.positionId,
      positionNo: position.positionNo,
      code: 'RECIPE_NOT_SUPPORTED',
      message: 'V45.3 yalnız Giyotin + 1+2 + Isıcam + Standart reçetesini hesaplar.'
    }));
    const firstId = supported.length ? supported[0].positionId : null;
    const calculatedPositions = supported.map(position => calculatePosition(position, materials, overrides, { isFirstSupportedPosition: position.positionId === firstId }));
    const allLines = calculatedPositions.flatMap(item => item.lines);
    const validationWarnings = calculatedPositions.flatMap(item => item.validation.map(v => ({ ...v, positionId:item.positionId, positionNo:item.positionNo })));
    return {
      schema: OUTPUT_SCHEMA,
      engineId: ENGINE_ID,
      contractId: contract.CONTRACT_ID,
      productType: contract.PRODUCT_TYPE,
      scope: clone(contract.SCOPE),
      sourceProjectId: source.sourceProjectId || '',
      sourceRevision: source.sourceRevision || '',
      projectInfo: clone(source.projectInfo || {}),
      suitability: { status: contract.SUITABILITY_STATUS.UNKNOWN, reasons: [clone(UNKNOWN_RULE_REASON)] },
      positions: calculatedPositions,
      cutItems: allLines.filter(line => line.kind === 'PROFILE'),
      accessoryItems: allLines.filter(line => line.kind === 'ACCESSORY'),
      glassItems: allLines.filter(line => line.kind === 'GLASS'),
      allLines,
      summaryCutItems: aggregateLines(allLines.filter(line => line.kind === 'PROFILE')),
      validation: { errors: unsupported, warnings: validationWarnings },
      overrides: clone(overrides)
    };
  }

  function generateFromProject(project, projectModel, materials, overrides) {
    const source = contract.projectToProductionSource(project, projectModel);
    return generatePackage({ source, materials, overrides });
  }

  return Object.freeze({
    ENGINE_ID,
    OUTPUT_SCHEMA,
    RULES,
    UNKNOWN_RULE_REASON,
    roundUp,
    workbookRoundDown,
    materialIndex,
    calculationCells,
    calculatePosition,
    aggregateLines,
    generatePackage,
    generateFromProject
  });
});
