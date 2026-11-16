(function (root) {
  'use strict';
  const createAdapter = root.PulumurCreateProductAdapter;
  if (!createAdapter) throw new Error('Product adapter factory yüklenmedi.');

  const adapter = createAdapter({
    id: 'GUILLOTINE',
    label: 'Giyotin',
    aliases: ['guillotine_glass', 'Giyotin Cam', 'GUILLOTINE_GLASS'],
    schemaVersion: 1,
    defaultWidth: 3000,
    defaultHeight: 2400,
    defaults: { id: 'GUILLOTINE-001', pozNo: 'G01', series: 'A SERIES', type: 'STANDARD', mechanism: 'CHAIN', glassThickness: '8 MM', glassColor: 'TRANSPARENT', customGlassColor: '', panelCount: '1+1', motorDirection: 'RIGHT', view: 'OUTSIDE VIEW', motorType: 'SOMFY RTS', remoteControl: '1 CHANNEL', remoteQuantity: 1, bottomPanelMode: 'VASISTAS', bottomPanelState: 'OPEN', bottomPanelHinge: 'BOTTOM', displayState: 'OPEN', collectionState: 'NORMAL' },
    blockBuilder: 'buildGuillotineBlockDefinition',
    normalizePlacement(project) {
      return root.PulumurGeometry.normalizeGuillotinePlacement(project, 0);
    },
    validate(project) {
      const errors = [];
      if (Number(project.width) < 151) errors.push('Giyotin genişliği en az 151 mm olmalı.');
      if (Number(project.height) < 251) errors.push('Giyotin yüksekliği en az 251 mm olmalı.');
      return errors;
    }
  });

  root.PulumurGuillotineAdapter = adapter;
})(typeof window !== 'undefined' ? window : globalThis);
