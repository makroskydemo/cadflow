(function (root) {
  'use strict';
  const createAdapter = root.PulumurCreateProductAdapter;
  if (!createAdapter) throw new Error('Product adapter factory yüklenmedi.');

  const adapter = createAdapter({
    id: 'SLIDING',
    label: 'Sürme',
    aliases: ['sliding_glass', 'Sürme Cam', 'SLIDING_GLASS'],
    schemaVersion: 1,
    defaultWidth: 3000,
    defaultHeight: 2400,
    defaults: { id: 'SLIDING-001', pozNo: 'S01', series: 'A SERIES', type: 'WITH THRESHOLD', slidingView: 'OUTSIDE VIEW', openingType: 'SIDE OPENING', openingDirection: 'RIGHT', glassThickness: '10 MM', glassColor: 'TRANSPARENT', customGlassColor: '', panelCountMode: 'AUTO', panelCount: 4, collectionState: 'NORMAL' },
    blockBuilder: 'buildSlidingBlockDefinition',
    normalizePlacement(project) {
      return root.PulumurGeometry.normalizeSlidingPlacement(project, 0);
    },
    validate(project) {
      const errors = [];
      if (Number(project.width) < 200) errors.push('Sürme genişliği en az 200 mm olmalı.');
      if (Number(project.height) < 200) errors.push('Sürme yüksekliği en az 200 mm olmalı.');
      return errors;
    }
  });

  root.PulumurSlidingAdapter = adapter;
})(typeof window !== 'undefined' ? window : globalThis);
