(function (root) {
  'use strict';
  const createAdapter = root.PulumurCreateProductAdapter;
  if (!createAdapter) throw new Error('Product adapter factory yüklenmedi.');

  const adapter = createAdapter({
    id: 'ZIP_SCREEN',
    label: 'Zip Perde',
    aliases: ['zip_screen', 'Zip Perde', 'ZIPPER'],
    schemaVersion: 1,
    defaultWidth: 3000,
    defaultHeight: 2400,
    defaults: { id: 'ZIP-SCREEN-001', pozNo: 'Z01', series: 'G SERIES', type: '100X100 BOX', mountingLocation: 'BETWEEN POSTS', fabricColor: '7635-52101', customFabricColor: '', cableExitDirection: 'REAR', motorDirection: 'RIGHT', sizeMode: 'AUTO', panelCount: 1, collectionState: 'NORMAL' },
    blockBuilder: 'buildZipScreenBlockDefinition',
    normalizePlacement(project) {
      return root.PulumurGeometry.normalizeZipScreenPlacement(project, 0);
    },
    validate(project) {
      const errors = [];
      if (Number(project.width) < 120) errors.push('Zip Perde genişliği en az 120 mm olmalı.');
      if (Number(project.height) < 180) errors.push('Zip Perde yüksekliği en az 180 mm olmalı.');
      return errors;
    }
  });

  root.PulumurZipScreenAdapter = adapter;
})(typeof window !== 'undefined' ? window : globalThis);
