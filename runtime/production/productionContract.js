(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.PulumurGuillotineProductionContractV1 = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const CONTRACT_ID = 'makrosky-guillotine-1plus2-insulated-standard-v1';
  const PRODUCT_TYPE = 'GUILLOTINE';
  const VALUE_STATUS = Object.freeze({
    NORMAL: 'NORMAL',
    ZERO_RESULT: 'ZERO_RESULT',
    MANUAL_OVERRIDE: 'MANUAL_OVERRIDE',
    MANUAL_REQUIRED: 'MANUAL_REQUIRED'
  });
  const SUITABILITY_STATUS = Object.freeze({
    SUITABLE: 'SUITABLE',
    NOT_SUITABLE: 'NOT_SUITABLE',
    UNKNOWN: 'UNKNOWN'
  });
  const SCOPE = Object.freeze({
    productType: PRODUCT_TYPE,
    panelLayout: '1+2',
    glassThickness: 'INSULATED GLASS',
    systemType: 'STANDARD'
  });

  const EXCEL_REFERENCE = Object.freeze({
    sourceWorkbook: 'Ergbey Giyotin Tablolar.xlsx',
    sourceWorkbookSha256: '3d102bd53d9802a45a16d0b6736ab1736ed0b7385271d41ff7aec689c4ab5e0b',
    sourceSheets: ['Poz 1 Üretim Formu', 'Poz 2 Üretim Formu', 'Poz 3 Üretim Formu', 'Poz 4 Üretim Formu'],
    corrections: Object.freeze({
      H21: Object.freeze({ sourceFormula: '=J10-155', effectiveFormula: '=H20', reason: 'User-approved source correction' }),
      I19: Object.freeze({ sourceSharedFormula: '=$H$5*2', effectiveFormula: '=$H$5*2' }),
      I20: Object.freeze({ sourceSharedFormula: '=$H$5*2', effectiveFormula: '=$H$5*2' }),
      I21: Object.freeze({ sourceSharedFormula: '=$H$5*2', effectiveFormula: '=$H$5*2' }),
      I22: Object.freeze({ sourceSharedFormula: '=$H$5*2', effectiveFormula: '=$H$5*2' }),
      I23: Object.freeze({ sourceSharedFormula: '=$H$5*2', effectiveFormula: '=$H$5*2' })
    })
  });

  const PROFILE_REFERENCE_RULES = Object.freeze([
    { ruleId: 'P12-1212', materialCode: '1212', sourceRow: 12, lengthFormula: '=D5-5', quantityFormula: '=$H$5' },
    { ruleId: 'P13-1211', materialCode: '1211', sourceRow: 13, lengthFormula: '=D5-7', quantityFormula: '=$H$5' },
    { ruleId: 'P14-1208', materialCode: '1208', sourceRow: 14, lengthFormula: '=D5-198', quantityFormula: '=$H$5' },
    { ruleId: 'P15-1207', materialCode: '1207', sourceRow: 15, lengthFormula: '=D5-193', quantityFormula: '=$H$5' },
    { ruleId: 'P16-1206', materialCode: '1206', sourceRow: 16, lengthFormula: '=D5-193', quantityFormula: '=$H$5*4' },
    { ruleId: 'P17-1209', materialCode: '1209', sourceRow: 17, lengthFormula: '=ROUNDDOWN((F5-349)/3,0.1)', quantityFormula: '=$H$5*6' },
    { ruleId: 'P18-1213', materialCode: '1213', sourceRow: 18, lengthFormula: '=F5-159', quantityFormula: '=$H$5*2' },
    { ruleId: 'P19-1214-A', materialCode: '1214', sourceRow: 19, lengthFormula: '=F5-159', quantityFormula: '=$H$5*2' },
    { ruleId: 'P20-1214-B', materialCode: '1214', sourceRow: 20, lengthFormula: '=H19+3.5', quantityFormula: '=$H$5*2' },
    { ruleId: 'P21-1215', materialCode: '1215', sourceRow: 21, lengthFormula: '=H20', quantityFormula: '=$H$5*2', correctedFrom: '=J10-155' },
    { ruleId: 'P22-1216-A', materialCode: '1216', sourceRow: 22, lengthFormula: '=H18-H17-95', quantityFormula: '=$H$5*2' },
    { ruleId: 'P23-1216-B', materialCode: '1216', sourceRow: 23, lengthFormula: '=H17+54', quantityFormula: '=$H$5*2' },
    { ruleId: 'P24-1204', materialCode: '1204', sourceRow: 24, lengthFormula: '=H16', quantityFormula: '=$H$5' },
    { ruleId: 'P25-1203', materialCode: '1203', sourceRow: 25, lengthFormula: '=D5-32', quantityFormula: '=$H$5' },
    { ruleId: 'P26-AKS0001', materialCode: 'AKS0001', sourceRow: 26, lengthFormula: '=D5-85', quantityFormula: '=$H$5' }
  ]);

  const ACCESSORY_REFERENCE_RULES = Object.freeze([
    { ruleId: 'A29-AKS0002', materialCode: 'AKS0002', sourceRow: 29, unitFormula: '=VLOOKUP(A29,MaterialMaster,7,0)', quantityFormula: '=$H$5' },
    { ruleId: 'A30-AKS0003', materialCode: 'AKS0003', sourceRow: 30, unitFormula: '=VLOOKUP(A30,MaterialMaster,7,0)', quantityFormula: '=ROUNDUP((5*((H17+40)/1000))*H5,0)' },
    { ruleId: 'A31-AKS0004', materialCode: 'AKS0004', sourceRow: 31, unitFormula: '=VLOOKUP(A31,MaterialMaster,7,0)', quantityFormula: '=ROUNDUP((H12*2*I12)/1000,0)' },
    { ruleId: 'A32-AKS0005', materialCode: 'AKS0005', sourceRow: 32, unitFormula: '=VLOOKUP(A32,MaterialMaster,7,0)', quantityFormula: '=IF(H5=0,0,ROUNDUP(((H21*4)+(H20*2)+(H16*3)*H5)/1000,0))' },
    { ruleId: 'A33-AKS0006', materialCode: 'AKS0006', sourceRow: 33, unitFormula: '=VLOOKUP(A33,MaterialMaster,7,0)', quantityFormula: '=$H$5' },
    { ruleId: 'A34-AKS0007', materialCode: 'AKS0007', sourceRow: 34, unitFormula: '=VLOOKUP(A34,MaterialMaster,7,0)', quantityFormula: '=REMOTE_QUANTITY_FROM_PROJECT', verification: 'SOURCE_SHEETS_INCONSISTENT_POZ4_I34_EQ_I5' },
    { ruleId: 'A35-SM0001', materialCode: 'SM0001', sourceRow: 35, unitFormula: '=VLOOKUP(A35,MaterialMaster,7,0)', quantityFormula: '=$H$5' },
    { ruleId: 'A36-CAM0001', materialCode: 'CAM0001', sourceRow: 36, unitFormula: '=VLOOKUP(A36,MaterialMaster,7,0)', quantityFormula: '=ROUNDUP((H16+40)*(H17+40)*3*H5/1000000,2)' }
  ]);

  function clone(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  function isBlank(value) {
    return value === null || value === undefined || value === '';
  }

  function equalValue(a, b) {
    if (typeof a === 'number' || typeof b === 'number') return Number(a) === Number(b);
    return String(a) === String(b);
  }

  function resolveProductionValue(calculatedValue, manualValue, options) {
    const opts = options || {};
    const manualRequired = Boolean(opts.manualRequired);
    const hasManual = !isBlank(manualValue);
    const hasCalculated = !isBlank(calculatedValue);

    if (manualRequired && !hasManual) {
      return { calculatedValue: hasCalculated ? calculatedValue : null, manualValue: null, effectiveValue: null, status: VALUE_STATUS.MANUAL_REQUIRED };
    }
    if (hasManual) {
      const changed = !hasCalculated || !equalValue(calculatedValue, manualValue);
      return {
        calculatedValue: hasCalculated ? calculatedValue : null,
        manualValue,
        effectiveValue: manualValue,
        status: changed && hasCalculated ? VALUE_STATUS.MANUAL_OVERRIDE : VALUE_STATUS.NORMAL
      };
    }
    if (hasCalculated && Number(calculatedValue) === 0) {
      return { calculatedValue, manualValue: null, effectiveValue: calculatedValue, status: VALUE_STATUS.ZERO_RESULT };
    }
    return { calculatedValue: hasCalculated ? calculatedValue : null, manualValue: null, effectiveValue: hasCalculated ? calculatedValue : null, status: VALUE_STATUS.NORMAL };
  }

  function normalizeColor(value) {
    const text = String(value || '').trim();
    const match = text.match(/^(.*?)(?:\s+(PARLAK|MAT|TEXTURE))$/i);
    return {
      raw: text,
      ral: match ? match[1].trim() : text,
      surface: match ? match[2].toUpperCase() : ''
    };
  }

  function isSupportedPosition(position, resolvedOptions) {
    if (!position || String(position.productType || '').toUpperCase() !== PRODUCT_TYPE) return false;
    const options = resolvedOptions || position.options || {};
    return String(options.panelCount || '').toUpperCase() === SCOPE.panelLayout &&
      String(options.glassThickness || '').toUpperCase() === SCOPE.glassThickness &&
      String(options.type || '').toUpperCase() === SCOPE.systemType;
  }

  function projectToProductionSource(project, model) {
    const source = project || {};
    const positions = (source.positions || []).filter(item => !item.hidden).slice().sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0)).map(item => {
      const resolved = model && typeof model.resolveOptions === 'function' ? model.resolveOptions(source, item) : clone(item.options || {});
      const color = normalizeColor(resolved.color || (source.commonSettings && source.commonSettings.color) || '');
      return {
        positionId: item.id,
        positionNo: item.positionNo,
        productType: item.productType,
        width: Number(item.width),
        height: Number(item.height),
        quantity: Number(item.quantity),
        description: String(item.description || ''),
        panelLayout: resolved.panelCount || '',
        glassThickness: resolved.glassThickness || '',
        glassColor: resolved.glassColor || '',
        systemType: resolved.type || '',
        mechanism: resolved.mechanism || '',
        view: resolved.view || '',
        motorDirection: resolved.motorDirection || '',
        motorType: resolved.motorType || '',
        remoteControl: resolved.remoteControl || '',
        remoteQuantity: Number(resolved.remoteQuantity) || 0,
        systemColor: color.ral,
        surface: color.surface,
        supportedByContract: isSupportedPosition(item, resolved)
      };
    });
    return {
      contractId: CONTRACT_ID,
      sourceProjectId: source.projectInfo && source.projectInfo.projectCode || '',
      sourceRevision: source.projectInfo && source.projectInfo.revision || '',
      projectInfo: clone(source.projectInfo || {}),
      positions,
      suitability: { status: SUITABILITY_STATUS.UNKNOWN, reasons: [] }
    };
  }

  function createProductionStateLink(input) {
    const source = input || {};
    return {
      contractId: CONTRACT_ID,
      sourceProjectId: source.sourceProjectId || '',
      sourceRevision: source.sourceRevision || '',
      sourceHash: source.sourceHash || '',
      overrides: clone(source.overrides || {}),
      package: clone(source.package || null)
    };
  }

  return Object.freeze({
    CONTRACT_ID,
    PRODUCT_TYPE,
    SCOPE,
    VALUE_STATUS,
    SUITABILITY_STATUS,
    EXCEL_REFERENCE,
    PROFILE_REFERENCE_RULES,
    ACCESSORY_REFERENCE_RULES,
    resolveProductionValue,
    normalizeColor,
    isSupportedPosition,
    projectToProductionSource,
    createProductionStateLink
  });
});
