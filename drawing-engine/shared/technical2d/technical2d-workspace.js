(function (root) {
  'use strict';

  const RELEASE = 'PLMR V.34';
  const SHEET = Object.freeze({ width: 1600, height: 1150 });
  // The sheet furniture follows the native Pergo Rise/Pergola preview. Only
  // these five product-specific view boxes change between Technical2D adapters.
  const VIEW_BOXES = Object.freeze({
    rear: Object.freeze({ x: 760, y: 32, width: 805, height: 175 }),
    top: Object.freeze({ x: 760, y: 222, width: 805, height: 305 }),
    left: Object.freeze({ x: 35, y: 565, width: 455, height: 390 }),
    front: Object.freeze({ x: 520, y: 565, width: 560, height: 390 }),
    right: Object.freeze({ x: 1110, y: 565, width: 455, height: 390 })
  });
  const ROLE_CLASS = Object.freeze({
    'module-outline': 't2d-module-outline',
    'panel-zone': 't2d-panel-zone',
    'panel-line': 't2d-panel-line',
    'post': 't2d-post',
    'combined-profile': 't2d-combined-profile',
    'frame-profile': 't2d-frame-profile',
    'gutter-profile': 't2d-gutter-profile',
    'roof-panel': 't2d-roof-panel',
    'panel-package': 't2d-panel-package',
    'alignment-guide': 't2d-alignment-guide',
    'divider-profile': 't2d-divider-profile',
    'module-boundary': 't2d-module-boundary',
    'elevation-envelope': 't2d-elevation-envelope',
    'module-label': 't2d-module-label',
    'zone-area': 't2d-zone-area',
    'product-primary': 't2d-product-primary',
    'product-zip': 't2d-product-zip',
    'product-label': 't2d-product-label',
    'product-frame': 't2d-product-frame',
    'product-panel': 't2d-product-panel',
    'product-glass': 't2d-product-glass',
    'product-threshold': 't2d-product-threshold',
    'product-symbol': 't2d-product-symbol',
    'product-state-label': 't2d-product-state-label',
    'product-detail-label': 't2d-product-detail-label',
    'product-motor-box': 't2d-product-motor-box',
    'product-motor-label': 't2d-product-motor-label',
    'product-zip-box': 't2d-product-zip-box',
    'product-zip-guide': 't2d-product-zip-guide',
    'product-zip-fabric': 't2d-product-zip-fabric',
    'product-bottom-bar': 't2d-product-bottom-bar',
    'product-fixed-glass': 't2d-product-fixed-glass',
    'product-mullion': 't2d-product-mullion',
    'product-fixed-diagonal': 't2d-product-fixed-diagonal',
    'product-door-leaf': 't2d-product-door-leaf',
    'product-door-swing': 't2d-product-door-swing',
    'product-door-symbol': 't2d-product-door-symbol',
    'product-handle': 't2d-product-handle',
    'product-folded-panel': 't2d-product-folded-panel',
    'product-fold-symbol': 't2d-product-fold-symbol'
  });

  const $ = id => document.getElementById(id);
  let initialized = false;
  let lastProjection = null;
  let zoom = 1;
  let active = false;
  let resizeFrame = 0;
  let interactionSequence = 0;
  const interactionMap = new Map();
  let interactionUiReady = false;
  let activeInteractionMeta = null;

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function finite(value, fallback) { const n = Number(value); return Number.isFinite(n) ? n : fallback; }
  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  function format(value) { const n = Number(value); return Number.isFinite(n) ? Math.round(n).toLocaleString('tr-TR') : '-'; }
  function viewById(projection, id) { return projection && Array.isArray(projection.views) ? projection.views.find(view => view.id === id) : null; }
  function classForRole(role) { return ROLE_CLASS[role] || 't2d-default'; }
  function sharedPreview() { return $('preview'); }
  function sharedStage() { const preview = sharedPreview(); return preview && preview.querySelector('.preview-stage'); }
  function activeStage() { return active ? sharedStage() : $('technical2DStage'); }
  function setSharedPreviewMetadata(stage, projection) {
    const preview = sharedPreview();
    if (!preview || !stage) return;
    preview.dataset.previewProduct = projection && projection.productId || '';
    preview.dataset.previewMode = 'technical2d';
    stage.dataset.schema = projection && projection.schema || '';
    stage.dataset.productGroup = projection && projection.productGroup || '';
    stage.dataset.moduleCount = String(projection && projection.summary && projection.summary.moduleCount || 0);
    stage.dataset.rowCount = String(projection && projection.summary && projection.summary.rowCount || 0);
    stage.dataset.postCount = String(projection && projection.summary && projection.summary.postCount || 0);
    stage.dataset.panelCount = String(projection && projection.summary && projection.summary.panelCount || 0);
    stage.dataset.profileCount = String(projection && projection.summary && projection.summary.profileCount || 0);
    stage.dataset.inputWidth = String(projection && projection.summary && projection.summary.input && projection.summary.input.width || '');
    stage.dataset.inputDepth = String(projection && projection.summary && projection.summary.input && projection.summary.input.depth || '');
  }


  function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function interactionKey(meta) {
    if (!meta || meta.interactive !== true) return '';
    const key = `i${++interactionSequence}`;
    interactionMap.set(key, clone(meta));
    return key;
  }
  function interactionAttrs(meta) {
    if(meta?.kind==='zone'&&root.PLMRZones?.generated&&!root.PLMRZones.generated(meta.sceneObjectId||meta.zone?.owner||'roof-main'))return '';
    if(['zone','roof-zone'].includes(meta?.kind)&&root.PLMRZones){const z=meta.kind==='roof-zone'?{id:'roof:'+meta.moduleIndex,group:'roof'}:meta.zone;if(!root.PLMRZones.visible()||!root.PLMRV11Zones.allowed(root.PLMRZones.filters(),z,meta.sceneObjectId||z?.owner))return '';}

    const key = interactionKey(meta);
    if (!key) return '';
    const kind = esc(meta && meta.kind || '');
    const zoneId = esc(meta && meta.zoneId || '');
    const profileId = esc(meta && meta.profileId || '');
    return ` data-interaction-key="${key}" data-interaction-kind="${kind}" data-zone-id="${zoneId}" data-profile-id="${profileId}" tabindex="0" role="button"`;
  }
  function commandApi() {
    const hostApi = root.PulumurUnifiedWorkspace;
    if (hostApi && typeof hostApi.executeTechnical2DCommand === 'function') return hostApi;
    const localBridge = root.__P3DV_HOST_BRIDGE__;
    if (localBridge && typeof localBridge.executeTechnical2DCommand === 'function') {
      return { executeTechnical2DCommand: (command) => localBridge.executeTechnical2DCommand(command || {}) };
    }
    return null;
  }
  function hideContextMenu() {
    const menu = $('technical2DContextMenu');
    if (menu) { menu.hidden = true; menu.innerHTML = ''; }
  }
  function showError(message) {
    const text = String(message && message.message || message || 'İşlem tamamlanamadı.');
    setStatus(text, 'error');
    try { window.alert(text); } catch (_) {}
  }
  async function executeCommand(type, payload) {
    const api = commandApi();
    if (!api) throw new Error('TECHNICAL2D_COMMAND_BRIDGE_UNAVAILABLE');
    const result = await Promise.resolve(api.executeTechnical2DCommand({ type, payload: clone(payload || {}) }));
    if (!result || result.ok === false) throw new Error(result && result.error || 'TECHNICAL2D_COMMAND_FAILED');
    return result;
  }
  function modalNode() { return $('technical2DEditDialog'); }
  function openEditor(kind, meta) {
    const dialog = modalNode();
    if (!dialog) return;
    activeInteractionMeta = clone(meta || {});
    const title = $('technical2DEditTitle');
    const fields = $('technical2DEditFields');
    const error = $('technical2DEditError');
    if (error) error.textContent = '';
    if (!fields) return;
    fields.innerHTML = '';
    if (kind === 'dimension') {
      if (title) title.textContent = 'Ölçüyü Düzenle';
      const zone = activeInteractionMeta.zone || {};
      fields.innerHTML = `<label><span>Net genişlik (mm)</span><input name="width" type="number" min="250" step="1" value="${Math.round(finite(zone.width, 0))}" required></label><label><span>Net yükseklik (mm)</span><input name="height" type="number" min="250" step="1" value="${Math.round(finite(zone.height, 0))}" required></label><input type="hidden" name="kind" value="dimension">`;
    } else if (kind === 'profile-add') {
      if (title) title.textContent = 'Farklı Profil Ekle';
      fields.innerHTML = `<label><span>Profil eni (mm)</span><input name="width" type="number" step="any" value="100" required></label><label><span>Profil derinliği (mm)</span><input name="depth" type="number" step="any" value="100" required></label><input type="hidden" name="kind" value="profile-add">`;
    } else if (kind === 'profile-edit') {
      if (title) title.textContent = 'Profili Düzenle';
      const profile = activeInteractionMeta.profile || {};
      fields.innerHTML = `<label><span>Profil eni (mm)</span><input name="width" type="number" step="any" value="${finite(profile.width,100)}" required></label><label><span>Profil derinliği (mm)</span><input name="depth" type="number" step="any" value="${finite(profile.depth,100)}" required></label><input type="hidden" name="kind" value="profile-edit">`;
    } else if (kind === 'product') {
      const placement = activeInteractionMeta.placement || {};
      if (!activeInteractionMeta.slot || !placement.type) throw new Error('TECHNICAL2D_PRODUCT_ADD_REQUIRES_3D_CANONICAL_INPUT');
      if (title) title.textContent = 'Ürünü Düzenle';
      const type = String(placement.type || 'sliding');
      const labels = { sliding:'Sürme', guillotine:'Giyotin', zip:'Zip Perde', door:'Kapı', fixed:'Sabit Doğrama', folding:'Akordiyon Cam',balcony:'Katlanır Cam' };
      const panels = Math.max(1, Math.round(finite(placement.panels || placement.panelCount, 3)));
      const panelEditable = ['sliding','guillotine','folding','balcony'].includes(type);
      fields.innerHTML = `<label><span>Ürün</span><input value="${esc(labels[type] || type)}" disabled></label>${panelEditable?`<label><span>Panel sayısı</span><input name="panels" type="number" min="2" max="16" step="1" value="${panels}"></label>`:`<div class="technical2d-readonly-note">Bu ürünün fiziksel parametreleri 3D canonical ürün formundan düzenlenir.</div>`}<input type="hidden" name="type" value="${esc(type)}"><input type="hidden" name="kind" value="product">`;
    }
    if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open','');
    const input = fields.querySelector('input,select'); if (input) input.focus();
  }
  async function handleEditorSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const kind = String(data.get('kind') || '');
    const meta = clone(activeInteractionMeta || {});
    const error = $('technical2DEditError');
    try {
      let result;
      if (kind === 'dimension') result = await executeCommand('zone-dimension', { zoneId: meta.zoneId, width: Number(data.get('width')), height: Number(data.get('height')) });
      else if (kind === 'profile-add') result = await executeCommand('profile-add', { zoneId: meta.zoneId, mode: 'custom', orientation: 'vertical', width: Number(data.get('width')), depth: Number(data.get('depth')) });
      else if (kind === 'profile-edit') result = await executeCommand('profile-update', { facadeId: meta.facadeId, profileId: meta.profileId, width: Number(data.get('width')), depth: Number(data.get('depth')) });
      else if (kind === 'product') {
        if (!meta.slot) throw new Error('Yeni ürün ekleme için tam 3D canonical ürün girdisi gerekir.');
        result = await executeCommand('product-update', { zoneId: meta.zoneId, slot: meta.slot, type: String(data.get('type') || meta.placement && meta.placement.type || ''), panels: Number(data.get('panels')) || Number(meta.placement && meta.placement.panels) || 1 });
      }
      else throw new Error('TECHNICAL2D_EDITOR_KIND_INVALID');
      const dialog = modalNode(); if (dialog && typeof dialog.close === 'function') dialog.close(); else if (dialog) dialog.removeAttribute('open');
      activeInteractionMeta = null;
      return result;
    } catch (err) { if (error) error.textContent = String(err && err.message || err); else showError(err); }
  }
  function menuButton(action, label, danger) { return `<button type="button" data-t2d-action="${action}" class="${danger?'is-danger':''}">${esc(label)}</button>`; }
  function showContextMenu(event, meta) {
    const menu = $('technical2DContextMenu'); if (!menu) return;
    activeInteractionMeta = clone(meta || {});
    const kind = String(meta && meta.kind || '');
    if(['zone','roof-zone'].includes(kind)&&root.PLMRZones?.visible()===false)return;
    if(['zone','zone-width','zone-height'].includes(kind)&&root.PLMRV11Commands){hideContextMenu();root.PLMRV11Commands.openZone({...meta.zone,owner:meta.sceneObjectId||meta.zone.owner||'roof-main'});return;}
    if(kind==='roof-zone'){hideContextMenu();if(window.PLMROpenBioclimaticRoofChooser)window.PLMROpenBioclimaticRoofChooser(meta);return;}
    const items = [];
    if (kind === 'zone' || kind === 'zone-width' || kind === 'zone-height') {
      items.push(menuButton('dimension-edit','Ölçüyü Düzenle'));
      items.push(menuButton('profile-add-same','Aynı Profilden Ekle'));
      items.push(menuButton('profile-add-custom','Farklı Profil Ekle'));
      items.push(menuButton('horizontal-profile-add','Yatay Profil Ekle (100 × 100)'));
    } else if (kind === 'profile') {
      items.push(menuButton('profile-edit','Profil Düzenle'));
      items.push(menuButton('profile-delete','Profil Sil',true));
    } else if (kind === 'product') {
      items.push(menuButton('product-edit','Ürün Düzenle'));
      items.push(menuButton('product-delete','Ürün Sil',true));
    }
    if (!items.length) return;
    menu.innerHTML = items.join('');
    menu.hidden = false;
    const x = Math.min(window.innerWidth - 210, Math.max(8, event.clientX + 4));
    const y = Math.min(window.innerHeight - 210, Math.max(8, event.clientY + 4));
    menu.style.left = `${x}px`; menu.style.top = `${y}px`;
  }
  async function handleMenuClick(event) {
    const button = event.target && event.target.closest('[data-t2d-action]'); if (!button) return;
    const action = button.dataset.t2dAction; const meta = clone(activeInteractionMeta || {}); hideContextMenu();
    try {
      if (action === 'dimension-edit') openEditor('dimension', meta);
      else if (action === 'profile-add-custom') openEditor('profile-add', meta);
      else if (action === 'profile-add-same') await executeCommand('profile-add', { zoneId: meta.zoneId, mode: 'same', orientation: 'vertical' });
      else if (action === 'horizontal-profile-add') await executeCommand('profile-add', { zoneId: meta.zoneId, mode: 'custom', orientation: 'horizontal', width: 100, depth: 100 });
      else if (action === 'profile-edit') openEditor('profile-edit', meta);
      else if (action === 'profile-delete') { if (window.confirm('Profil ve bu profile bağlı alt alanlardaki ürünler silinsin mi?')) await executeCommand('profile-delete', { facadeId: meta.facadeId, profileId: meta.profileId }); }
      else if (action === 'product-add') openEditor('product', meta);
      else if (action === 'product-edit') openEditor('product', meta);
      else if (action === 'product-delete') { if (window.confirm('Seçili ürün silinsin mi?')) await executeCommand('product-delete', { zoneId: meta.zoneId, slot: meta.slot }); }
    } catch (err) { showError(err); }
  }
  function handleStageClick(event) {
    const target = event.target && event.target.closest('[data-interaction-key]');
    if (!target) { hideContextMenu(); return; }
    const meta = interactionMap.get(target.dataset.interactionKey); if (!meta) return;
    event.preventDefault(); event.stopPropagation(); showContextMenu(event, meta);
  }
  function handleStageKeydown(event) {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const target = event.target && event.target.closest('[data-interaction-key]'); if (!target) return;
    const meta = interactionMap.get(target.dataset.interactionKey); if (!meta) return;
    event.preventDefault(); showContextMenu({ clientX: window.innerWidth/2, clientY: window.innerHeight/2 }, meta);
  }
  function createInteractionUi() {
    if (interactionUiReady) return;
    interactionUiReady = true;
    const menu = document.createElement('div'); menu.id = 'technical2DContextMenu'; menu.className = 'technical2d-context-menu'; menu.hidden = true; document.body.appendChild(menu);
    const dialog = document.createElement('dialog'); dialog.id = 'technical2DEditDialog'; dialog.className = 'modal technical2d-edit-dialog';
    dialog.innerHTML = `<form method="dialog" id="technical2DEditForm" class="modal-card"><div class="modal-head"><h2 id="technical2DEditTitle">Technical 2D</h2><button type="button" id="technical2DEditClose" class="icon-btn" aria-label="Kapat">×</button></div><div id="technical2DEditFields" class="technical2d-edit-fields"></div><div id="technical2DEditError" class="technical2d-edit-error"></div><div class="modal-actions"><button type="button" id="technical2DEditCancel" class="soft-btn">İptal</button><button type="submit" class="primary-btn">Uygula</button></div></form>`;
    document.body.appendChild(dialog);
    menu.addEventListener('click', handleMenuClick);
    const form = $('technical2DEditForm'); if (form) form.addEventListener('submit', handleEditorSubmit);
    const close = () => { if (dialog.open && typeof dialog.close === 'function') dialog.close(); else dialog.removeAttribute('open'); activeInteractionMeta = null; };
    const closeBtn = $('technical2DEditClose'); if (closeBtn) closeBtn.addEventListener('click', close);
    const cancelBtn = $('technical2DEditCancel'); if (cancelBtn) cancelBtn.addEventListener('click', close);
  }

  function expandedBounds(view) {
    const source = view && view.bounds || {};
    let minX = finite(source.minX, 0), maxX = finite(source.maxX, 1), minY = finite(source.minY, 0), maxY = finite(source.maxY, 1);
    (view && Array.isArray(view.entities) ? view.entities : []).forEach(item => {
      if (!item) return;
      if (item.type === 'rect') {
        minX = Math.min(minX, finite(item.x, minX)); maxX = Math.max(maxX, finite(item.x, maxX) + Math.max(0, finite(item.width, 0)));
        minY = Math.min(minY, finite(item.y, minY)); maxY = Math.max(maxY, finite(item.y, maxY) + Math.max(0, finite(item.height, 0)));
      } else if (item.type === 'line') {
        minX = Math.min(minX, finite(item.x1, minX), finite(item.x2, minX)); maxX = Math.max(maxX, finite(item.x1, maxX), finite(item.x2, maxX));
        minY = Math.min(minY, finite(item.y1, minY), finite(item.y2, minY)); maxY = Math.max(maxY, finite(item.y1, maxY), finite(item.y2, maxY));
      } else if (item.type === 'text') {
        minX = Math.min(minX, finite(item.x, minX)); maxX = Math.max(maxX, finite(item.x, maxX));
        minY = Math.min(minY, finite(item.y, minY)); maxY = Math.max(maxY, finite(item.y, maxY));
      } else if (item.type === 'dimension') {
        if (item.axis === 'x') { minX = Math.min(minX, finite(item.start, minX), finite(item.end, minX)); maxX = Math.max(maxX, finite(item.start, maxX), finite(item.end, maxX)); minY = Math.min(minY, finite(item.offset, minY)); maxY = Math.max(maxY, finite(item.offset, maxY)); }
        else { minY = Math.min(minY, finite(item.start, minY), finite(item.end, minY)); maxY = Math.max(maxY, finite(item.start, maxY), finite(item.end, maxY)); minX = Math.min(minX, finite(item.offset, minX)); maxX = Math.max(maxX, finite(item.offset, maxX)); }
      }
    });
    const width = Math.max(1, maxX - minX), height = Math.max(1, maxY - minY);
    const padX = Math.max(60, width * 0.04), padY = Math.max(60, height * 0.06);
    return { minX: minX - padX, maxX: maxX + padX, minY: minY - padY, maxY: maxY + padY };
  }

  function viewFitScale(view, box) {
    const bounds = expandedBounds(view);
    const inner = { width: box.width - 34, height: box.height - 45 };
    const worldW = Math.max(1, bounds.maxX - bounds.minX), worldH = Math.max(1, bounds.maxY - bounds.minY);
    return Math.min(inner.width / worldW, inner.height / worldH);
  }

  function commonProjectionScale(projection) {
    const scales = Object.entries(VIEW_BOXES).map(([id, box]) => {
      const view = viewById(projection, id); return view ? viewFitScale(view, box) : Infinity;
    }).filter(Number.isFinite);
    return scales.length ? Math.max(0.0001, Math.min(...scales)) : null;
  }

  function projectionScaleAudit(projection) {
    const detailDoc=projection.productDetails,detailSvg=detailDoc?root.PLMRV24Details2D.svg(detailDoc):'',extraHeight=detailDoc?Math.max(420,Math.min(900,1540*detailDoc.bounds.height/detailDoc.bounds.width)):0;
    const commonScale = commonProjectionScale(projection);
    const views = {};
    Object.entries(VIEW_BOXES).forEach(([id, box]) => {
      const view = viewById(projection, id);
      if (!view) return;
      const fitScale = viewFitScale(view, box);
      views[id] = { fitScale, appliedScale: commonScale == null ? fitScale : Math.min(fitScale, commonScale) };
    });
    return { commonScale, views };
  }

  function mapper(view, box, forcedScale) {
    const bounds = expandedBounds(view);
    const inner = { x: box.x + 17, y: box.y + 32, width: box.width - 34, height: box.height - 45 };
    const worldW = Math.max(1, bounds.maxX - bounds.minX), worldH = Math.max(1, bounds.maxY - bounds.minY);
    const scale = Number.isFinite(Number(forcedScale)) ? Math.min(viewFitScale(view, box), Number(forcedScale)) : viewFitScale(view, box);
    const usedW = worldW * scale, usedH = worldH * scale;
    const x0 = inner.x + (inner.width - usedW) / 2;
    const y0 = inner.y + (inner.height - usedH) / 2;
    return {
      x: value => x0 + (finite(value, bounds.minX) - bounds.minX) * scale,
      y: value => y0 + usedH - (finite(value, bounds.minY) - bounds.minY) * scale,
      length: value => Math.max(0, finite(value, 0) * scale),
      scale,
      bounds
    };
  }

  function renderDimension(item, map, view) {
    if(item.axis==='aligned'){
      const a={x:map.x(item.p1.x),y:map.y(item.p1.y)},b={x:map.x(item.p2.x),y:map.y(item.p2.y)},d={x:map.x(item.dimLine.x),y:map.y(item.dimLine.y)},dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy),nx=-dy/len,ny=dx/len,offset=(d.x-a.x)*nx+(d.y-a.y)*ny,p={x:a.x+nx*offset,y:a.y+ny*offset},q={x:b.x+nx*offset,y:b.y+ny*offset};
      return `<g class="t2d-dimension"><line x1="${a.x}" y1="${a.y}" x2="${p.x}" y2="${p.y}"/><line x1="${b.x}" y1="${b.y}" x2="${q.x}" y2="${q.y}"/><line x1="${p.x}" y1="${p.y}" x2="${q.x}" y2="${q.y}"/><text x="${d.x+nx*8}" y="${d.y+ny*8}" text-anchor="middle">${esc(item.text)}</text></g>`;
    }
    const tick = 6;
    if (item.axis === 'x') {
      const x1 = map.x(item.start), x2 = map.x(item.end), y = map.y(item.offset);
      const world = view.bounds || {};
      const anchorValue = finite(item.offset, 0) < finite(world.minY, 0) ? finite(world.minY, 0) : finite(world.maxY, 0);
      const anchorY = map.y(anchorValue);
      const attrs = interactionAttrs(item.meta); const hit = false ? `<line class="t2d-dimension-hit" x1="${x1}" y1="${y}" x2="${x2}" y2="${y}"/>` : '';
      return `<g class="t2d-dimension">${hit}<line x1="${x1}" y1="${anchorY}" x2="${x1}" y2="${y}"/><line x1="${x2}" y1="${anchorY}" x2="${x2}" y2="${y}"/><line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}"/><line x1="${x1}" y1="${y-tick}" x2="${x1}" y2="${y+tick}"/><line x1="${x2}" y1="${y-tick}" x2="${x2}" y2="${y+tick}"/><text class="${attrs?'t2d-interactive':''}"${attrs} x="${(x1+x2)/2}" y="${y-7}" text-anchor="middle">${esc(item.text)}</text></g>`;
    }
    const y1 = map.y(item.start), y2 = map.y(item.end), x = map.x(item.offset);
    const world = view.bounds || {};
    const anchorValue = finite(item.offset, 0) < finite(world.minX, 0) ? finite(world.minX, 0) : finite(world.maxX, 0);
    const anchorX = map.x(anchorValue);
    const attrs = interactionAttrs(item.meta); const hit = false ? `<line class="t2d-dimension-hit" x1="${x}" y1="${y1}" x2="${x}" y2="${y2}"/>` : '';
    return `<g class="t2d-dimension">${hit}<line x1="${anchorX}" y1="${y1}" x2="${x}" y2="${y1}"/><line x1="${anchorX}" y1="${y2}" x2="${x}" y2="${y2}"/><line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}"/><line x1="${x-tick}" y1="${y1}" x2="${x+tick}" y2="${y1}"/><line x1="${x-tick}" y1="${y2}" x2="${x+tick}" y2="${y2}"/><text class="${attrs?'t2d-interactive':''}"${attrs} x="${x+10}" y="${(y1+y2)/2}" transform="rotate(-90 ${x+10} ${(y1+y2)/2})" text-anchor="middle">${esc(item.text)}</text></g>`;
  }

  function renderView(view, box, commonScale) {
    if (!view) return '';
    const map = mapper(view, box, commonScale);
    const parts = [`<g class="t2d-view" data-view-id="${esc(view.id)}"><rect class="t2d-view-frame" x="${box.x}" y="${box.y}" width="${box.width}" height="${box.height}" rx="5"/><text class="t2d-view-title" x="${box.x+12}" y="${box.y+20}">${esc(view.title)}</text>`];
    (Array.isArray(view.entities) ? view.entities : []).forEach(item => {
      if (!item) return;
      const intermediate=['zone-width','zone-height'].includes(item.meta?.kind);if(root.PLMRV11Commands&&(item.type==='dimension'||/^(overall-|module-width|total-|zone-width)/.test(item.meta?.kind||''))){const d=root.PLMRV11Commands.dimensions(),total=/^total-/.test(item.meta?.kind||'');if((intermediate?(d.main!==false||d.intermediate!==false):d.main)===false||!intermediate&&(total?d.total:d.positions)===false)return;}
      if(item.meta?.kind==='zone'&&root.PLMRZones?.generated&&!root.PLMRZones.generated(item.meta.sceneObjectId||item.meta.zone.owner||'roof-main'))return;
      if(item.meta?.kind==='zone'&&root.PLMRZones&&(!root.PLMRZones.visible()||!root.PLMRV11Zones.allowed(root.PLMRZones.filters(),item.meta.zone,item.meta.sceneObjectId||item.meta.zone.owner)))return;
      const cls = classForRole(item.role);
      const palette=root.PulumurTechnical2DExport?.styleFor(item),colorAttrs=palette?` style="stroke:${palette.stroke};${item.type==='rect'?'fill:'+palette.stroke+';fill-opacity:.10;':''}"`:'';
      if (item.type === 'rect') {
        const x = map.x(item.x), y = map.y(finite(item.y, 0) + finite(item.height, 0));
        const w = Math.max(.4,map.length(item.width)), h = Math.max(.4,map.length(item.height)); const roofZone=item.meta?.kind==='roof-zone',attrs = roofZone?'':interactionAttrs(item.meta);
        parts.push(`<rect class="${cls}${attrs?' t2d-interactive':''}" x="${x}" y="${y}" width="${w}" height="${h}"${colorAttrs} data-role="${esc(item.role)}"${attrs}/>`);
        if(roofZone&&item.role==='panel-zone'){const hitAttrs=interactionAttrs(item.meta);parts.push(`<rect class="t2d-interactive" x="${x}" y="${y}" width="${w}" height="${h}" fill="transparent" stroke="none" data-role="panel-zone"${hitAttrs}/>`);}
        if (attrs && item.role === 'divider-profile') { const pad = Math.max(5, (14 - Math.min(w,h))/2); parts.push(`<rect class="t2d-profile-hit" x="${x-pad}" y="${y-pad}" width="${w+pad*2}" height="${h+pad*2}"${attrs}/>`); }
      } else if (item.type === 'line') {
        if(item.meta?.roofPolygon){const attrs=interactionAttrs(item.meta),points=item.meta.roofPolygon.map(p=>map.x(p[0])+','+map.y(p[1])).join(' ');parts.push(`<polygon class="t2d-interactive" points="${points}" fill="transparent" stroke="none" data-role="panel-zone"${attrs}/>`);}
        parts.push(`<line class="${cls}" x1="${map.x(item.x1)}" y1="${map.y(item.y1)}" x2="${map.x(item.x2)}" y2="${map.y(item.y2)}"${colorAttrs} data-role="${esc(item.role)}"/>`);
      } else if (item.type === 'text') {
        parts.push(`<text class="${cls}" x="${map.x(item.x)}" y="${map.y(item.y)}" text-anchor="middle" dominant-baseline="middle">${esc(item.text)}</text>`);
      } else if (item.type === 'dimension') parts.push(renderDimension(item, map, view));
    });
    parts.push('</g>');
    return parts.join('');
  }

  function tableCell(x, y, width, height, label, value, options) {
    const opts = options || {};
    const split = Math.min(width * .46, Math.max(68, width * .34));
    return `<g class="t2d-table-cell"><rect x="${x}" y="${y}" width="${width}" height="${height}"/><line x1="${x+split}" y1="${y}" x2="${x+split}" y2="${y+height}"/><text class="t2d-table-label" x="${x+7}" y="${y+height/2+4}">${esc(label)}</text><text class="t2d-table-value${opts.small?' is-small':''}" x="${x+split+7}" y="${y+height/2+4}">${esc(value)}</text></g>`;
  }

  function renderUpperTable(projection) {
    const model = projection && projection.modelState || {};
    const color = value => value && typeof value === 'object' ? [value.code || '-', value.finish || ''].filter(Boolean).join(' · ') : String(value || '-');
    const rows = [
      ['STRUCTURE COLOR', color(model.systemColor)],
      ['FABRIC', color(model.panelColor)],
      ['FABRIC PROFILES COLOR', color(model.systemColor)],
      ['MOTOR', model.motor || '-'],
      ['REMOTE', model.remote || '-'],
      ['LED', model.led || '-'],
      ['DIMMER', model.dimmer || '-'],
      ['EXTRAS', model.extras || '-']
    ];
    const x = 35, y = 35, w = 650, rowH = 31;
    const labelW = 270;
    const out = [`<g class="t2d-upper-table pergo-rise-table-layout"><rect class="t2d-table-outer" x="${x}" y="${y}" width="${w}" height="${rowH*rows.length}"/>`];
    rows.forEach((row,index) => {
      const yy = y + index * rowH;
      if (index) out.push(`<line x1="${x}" y1="${yy}" x2="${x+w}" y2="${yy}"/>`);
      out.push(`<line x1="${x+labelW}" y1="${yy}" x2="${x+labelW}" y2="${yy+rowH}"/>`);
      out.push(`<text class="t2d-table-label" x="${x+8}" y="${yy+20}">${esc(row[0])}</text>`);
      out.push(`<text class="t2d-table-value is-small" x="${x+labelW+8}" y="${yy+20}">${esc(row[1])}</text>`);
    });
    out.push('</g>');
    return out.join('');
  }

  function renderTitleBlock(projection) {
    const p = projection.projectInfo || {};
    const x = 35, y = 1000, w = 1530, h = 118, rowH = h / 2;
    // Same six-column title-block proportions used by native Pergola.
    const ratios = [13,40,10,19,7,11], total = ratios.reduce((a,b)=>a+b,0);
    const cols = ratios.map(v => w * v / total);
    const xs=[x]; cols.forEach(v=>xs.push(xs[xs.length-1]+v));
    const cellText=(x0,y0,width,label,value)=>`<g class="t2d-title-cell"><rect x="${x0}" y="${y0}" width="${width}" height="${rowH}"/><text class="t2d-table-label" x="${x0+7}" y="${y0+18}">${esc(label)}</text>${value===undefined?'':`<text class="t2d-table-value is-small" x="${x0+7}" y="${y0+39}">${esc(value||'-')}</text>`}</g>`;
    return [
      `<g class="t2d-title-block pergo-rise-title-layout">`,
      cellText(xs[0],y,cols[0],'CUSTOMER'), cellText(xs[1],y,cols[1],'',p.customer||'-'),
      cellText(xs[2],y,cols[2],'VERSION'), cellText(xs[3],y,cols[3],'',p.revision||'-'),
      cellText(xs[4],y,cols[4],'DATE'), cellText(xs[5],y,cols[5],'',p.date||'-'),
      cellText(xs[0],y+rowH,cols[0],'PROJECT'), cellText(xs[1],y+rowH,cols[1],'',p.project||'-'),
      cellText(xs[2],y+rowH,cols[2],'DRAWN BY'), cellText(xs[3],y+rowH,cols[3],'',p.drawnBy||'-'),
      `<rect x="${xs[4]}" y="${y+rowH}" width="${cols[4]+cols[5]}" height="${rowH}"/>`,
      `</g>`
    ].join('');
  }

  function renderSvg(projection) {
    const portableStyle = `<style>
      .t2d-sheet-bg{fill:#fff;stroke:#26363e;stroke-width:1.4}.t2d-view-frame{fill:#fff;stroke:#9baab2;stroke-width:1}.t2d-view-title{fill:#183d46;font-size:16px;font-weight:800}.t2d-module-outline,.t2d-panel-zone,.t2d-panel-line,.t2d-post,.t2d-combined-profile,.t2d-frame-profile,.t2d-gutter-profile,.t2d-roof-panel,.t2d-panel-package,.t2d-alignment-guide,.t2d-divider-profile,.t2d-module-boundary,.t2d-elevation-envelope{stroke:#24363e;stroke-width:1.4;vector-effect:non-scaling-stroke}.t2d-elevation-envelope,.t2d-module-outline{fill:none;stroke-width:1.7}.t2d-combined-profile{fill:#e9a459;fill-opacity:.35;stroke:#b46622}.t2d-frame-profile{fill:#d7e3f7;fill-opacity:.42;stroke:#345fa7}.t2d-gutter-profile{fill:#f6c48a;fill-opacity:.42;stroke:#b46622}.t2d-roof-panel{fill:none;stroke:#5d8e4a;stroke-width:1.05}.t2d-led{fill:none;stroke:#d59c28;stroke-width:1.8;vector-effect:non-scaling-stroke}.t2d-panel-package{fill:none;stroke:#b45309;stroke-width:1.25}.t2d-alignment-guide{fill:none;stroke:#7c8790;stroke-width:.7;stroke-dasharray:8 5}.t2d-post{fill:#e7d8ef;fill-opacity:.72;stroke:#8e48a1}.t2d-panel-zone{fill:#dcebd7;fill-opacity:.5;stroke:#669056}.t2d-panel-line{fill:none;stroke:#6f8a68;stroke-width:.8}.t2d-module-boundary{fill:none;stroke:#5d76a0;stroke-width:.9;stroke-dasharray:5 3}.t2d-divider-profile{fill:#d7e3f7;fill-opacity:.72;stroke:#345fa7;stroke-width:1.4}.t2d-module-label{fill:#53656c;stroke:none;font-size:12px;font-weight:800}.t2d-dimension line{fill:none;stroke:#ff0000;stroke-width:.85;vector-effect:non-scaling-stroke}.t2d-dimension text[data-interaction-kind="zone-width"],.t2d-dimension text[data-interaction-kind="zone-height"]{font-size:7.15px;cursor:pointer;fill:#f59e0b}.t2d-dimension text{fill:#111111;font-size:11px;font-weight:700}.t2d-table-outer,.t2d-table-cell rect,.t2d-table-cell line,.t2d-brand-box,.t2d-upper-table rect,.t2d-upper-table line,.t2d-title-block rect,.t2d-title-block line{fill:#fff;stroke:#4b5c64;stroke-width:.8;vector-effect:non-scaling-stroke}.t2d-table-label{fill:#66767e;font-size:9px;font-weight:700}.t2d-table-value{fill:#1e353e;font-size:11px;font-weight:800}.t2d-table-value.is-small{font-size:9.5px}.t2d-brand{fill:#0d5d5f;font-size:31px;font-weight:950;letter-spacing:4px}.t2d-brand-sub{fill:#314e58;font-size:10px;font-weight:900;letter-spacing:1.1px}.t2d-brand-version{fill:#6a7980;font-size:7.8px;font-weight:700}.t2d-readonly-stamp{fill:#76878e;font-size:9px;font-weight:800;letter-spacing:.8px}.t2d-zone-area{fill:#38bdf8;fill-opacity:.012;stroke:#6d8995;stroke-width:.55;stroke-dasharray:3 3;pointer-events:none}.t2d-zone-area.t2d-interactive{pointer-events:all;cursor:pointer}.t2d-product-primary{fill:#dbeafe;fill-opacity:.34;stroke:#2563eb;stroke-width:1.2}.t2d-product-zip{fill:#bfdbfe;fill-opacity:.16;stroke:#0284c7;stroke-width:1.1;stroke-dasharray:5 3}.t2d-product-label{fill:#17406d;stroke:none;font-size:11px;font-weight:900}.t2d-product-frame,.t2d-product-panel,.t2d-product-threshold,.t2d-product-motor-box,.t2d-product-zip-box,.t2d-product-zip-guide,.t2d-product-bottom-bar,.t2d-product-mullion,.t2d-product-door-leaf,.t2d-product-handle,.t2d-product-folded-panel{fill:#eef4f7;stroke:#334155;stroke-width:1.15;vector-effect:non-scaling-stroke;pointer-events:none}.t2d-product-panel,.t2d-product-door-leaf{fill:#f8fafc}.t2d-product-glass,.t2d-product-fixed-glass{fill:#dbeafe;fill-opacity:.48;stroke:#5b8db8;stroke-width:.9;vector-effect:non-scaling-stroke;pointer-events:none}.t2d-product-zip-fabric{fill:#d1d5db;fill-opacity:.72;stroke:#64748b;stroke-width:.8;stroke-dasharray:3 2;vector-effect:non-scaling-stroke;pointer-events:none}.t2d-product-symbol,.t2d-product-fixed-diagonal,.t2d-product-door-swing{stroke:#f97316;stroke-width:1.35;vector-effect:non-scaling-stroke;pointer-events:none}.t2d-product-detail-label,.t2d-product-state-label,.t2d-product-motor-label,.t2d-product-door-symbol,.t2d-product-fold-symbol{fill:#1e3a5f;stroke:none;font-size:9px;font-weight:850;pointer-events:none}.t2d-product-state-label{fill:#b45309}.t2d-product-motor-label{fill:#991b1b}.t2d-product-door-symbol,.t2d-product-fold-symbol{fill:#f97316;font-size:15px}.t2d-product-primary,.t2d-product-zip{fill-opacity:.015;stroke-opacity:.42}.t2d-profile-hit{fill:transparent;stroke:transparent}.t2d-dimension-hit{stroke:transparent!important;stroke-width:18!important}.t2d-title-block text,.t2d-upper-table text{paint-order:stroke;stroke:none}
    </style>`;
    const detailDoc=projection.productDetails,detailSvg=detailDoc?root.PLMRV24Details2D.svg(detailDoc):'',extraHeight=detailDoc?Math.max(420,Math.min(900,1540*detailDoc.bounds.height/detailDoc.bounds.width)):0;
    const commonScale = commonProjectionScale(projection);
    return `<svg class="technical2d-sheet pergo-rise-sheet-layout" data-common-scale="${commonScale || ''}" viewBox="0 0 ${SHEET.width} ${SHEET.height+extraHeight}" width="${SHEET.width}" height="${SHEET.height+extraHeight}" role="img" aria-label="${esc((projection && projection.productLabel) || (projection && projection.productId) || 'Technical')} teknik 2D paftası">${portableStyle}<rect class="t2d-sheet-bg" x="18" y="18" width="1564" height="1115"/>${renderUpperTable(projection)}${renderView(viewById(projection,'rear'),VIEW_BOXES.rear,commonScale)}${renderView(viewById(projection,'top'),VIEW_BOXES.top,commonScale)}${renderView(viewById(projection,'left'),VIEW_BOXES.left,commonScale)}${renderView(viewById(projection,'front'),VIEW_BOXES.front,commonScale)}${renderView(viewById(projection,'right'),VIEW_BOXES.right,commonScale)}${renderTitleBlock(projection)}${detailDoc?`<svg x="30" y="${SHEET.height}" width="1540" height="${extraHeight}" viewBox="0 0 ${detailDoc.bounds.width} ${detailDoc.bounds.height}" aria-label="Cephe ürün detayları">${detailSvg.replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'')}</svg>`:''}</svg>`;
  }

  function applyZoom(next, keepCenter) {
    if (active) {
      const shell = root.PulumurPreviewShell;
      if (shell && typeof shell.setZoom === 'function') return shell.setZoom(next, keepCenter);
      return;
    }
    const viewport = $('technical2DViewport');
    const stage = $('technical2DStage');
    if (!viewport || !stage) return;
    const old = zoom;
    zoom = clamp(Number(next) || 1, .25, 3.5);
    const centerX = viewport.scrollLeft + viewport.clientWidth / 2;
    const centerY = viewport.scrollTop + viewport.clientHeight / 2;
    stage.style.width = `${SHEET.width * zoom}px`;
    stage.style.height = `${SHEET.height * zoom}px`;
    const svg = stage.querySelector('svg');
    if (svg) { svg.style.transform = `scale(${zoom})`; svg.style.transformOrigin = '0 0'; }
    if (keepCenter && old > 0) {
      viewport.scrollLeft = Math.max(0, centerX * zoom / old - viewport.clientWidth / 2);
      viewport.scrollTop = Math.max(0, centerY * zoom / old - viewport.clientHeight / 2);
    }
    const node = $('technical2DZoomValue'); if (node) node.textContent = `${Math.round(zoom*100)}%`;
  }

  function fit() {
    if (active) {
      const shell = root.PulumurPreviewShell;
      if (shell && typeof shell.fit === 'function') return shell.fit();
      return;
    }
    const viewport = $('technical2DViewport');
    if (!viewport || !viewport.clientWidth || !viewport.clientHeight) return;
    const scale = Math.min((viewport.clientWidth - 26) / SHEET.width, (viewport.clientHeight - 26) / SHEET.height);
    applyZoom(clamp(scale, .25, 2), false);
    viewport.scrollLeft = Math.max(0, (SHEET.width * zoom - viewport.clientWidth) / 2);
    viewport.scrollTop = Math.max(0, (SHEET.height * zoom - viewport.clientHeight) / 2);
  }

  function setStatus(text, state) {
    const node = $('technical2DStatus');
    if (node) { node.textContent = String(text || ''); node.dataset.state = state || 'ready'; }
    if (active) {
      const shared = $('statusText');
      if (shared) { shared.textContent = String(text || ''); shared.dataset.technical2DState = state || 'ready'; }
    }
  }

  function renderProjection(projection, options) {
    lastProjection = projection || null;
    const preview = sharedPreview();
    const legacyStage = $('technical2DStage');
    if (!projection || projection.valid !== true) {
      const errors = projection && projection.errors || [];
      if (active && preview) {
        preview.innerHTML = `<div class="preview-stage"><div class="technical2d-empty"><strong>Technical 2D hazırlanıyor.</strong><span>${esc(errors.join(' · ') || 'Canonical product state bekleniyor.')}</span></div></div>`;
        setStatus('Canonical product state bekleniyor', 'waiting');
      } else if (legacyStage) {
        legacyStage.innerHTML = `<div class="technical2d-empty"><strong>Technical 2D oluşturulamadı.</strong><span>${esc(errors.join(' · ') || 'Canonical product state bekleniyor.')}</span></div>`;
        setStatus('Projection bekleniyor', 'waiting');
      }
      return false;
    }
    interactionMap.clear(); interactionSequence = 0;
    const svg = renderSvg(projection);
    if (active && preview) {
      preview.innerHTML = `<div class="preview-stage">${svg}</div>`;
      const stage = sharedStage();
      setSharedPreviewMetadata(stage, projection);
      if (stage) { stage.addEventListener('click', handleStageClick, true); stage.addEventListener('keydown', handleStageKeydown, true); }
    } else if (legacyStage) {
      legacyStage.innerHTML = svg;
      setSharedPreviewMetadata(legacyStage, projection);
    } else return false;
    setStatus(`Canonical P3DV · ${projection.summary.moduleCount} modül · ${projection.summary.rowCount} sıra · ${projection.summary.postCount} dikme`, 'ready');
    if (!options || options.fit !== false) requestAnimationFrame(fit);
    return true;
  }

  function adapterForSnapshot(snapshot) {
    const source = snapshot && snapshot.snapshot ? snapshot.snapshot : snapshot;
    const group = String(source && source.modelState && source.modelState.productGroup || '');
    if (group === 'b-cube') return root.PulumurFreedom2DAdapter || null;
    if (group === 'b-cube-galaxy') return root.PulumurGalaxy2DAdapter || null;
    if (group === 'bio-rise') return root.PulumurBioRise2DAdapter || null;
    return null;
  }

  function project(snapshot, context) {
    const adapter = adapterForSnapshot(snapshot);
    if (!adapter || typeof adapter.build !== 'function') throw new Error('P3DV_TECHNICAL2D_ADAPTER_UNAVAILABLE');
    const projection = adapter.build(snapshot, context || {});
    renderProjection(projection, context || {});
    return projection;
  }

  function setActive(value) {
    const next = Boolean(value);
    if (active === next) return;
    active = next;
    const workspace = $('technical2DWorkspace');
    if (workspace) workspace.hidden = true;
    const preview = sharedPreview();
    if (preview && !active) {
      delete preview.dataset.previewProduct;
      delete preview.dataset.previewMode;
    }
    if (active && lastProjection) renderProjection(lastProjection, { fit: true });
  }

  function handleWheel(event) {
    if (!active || !event.ctrlKey) return;
    event.preventDefault();
    applyZoom(zoom * (event.deltaY < 0 ? 1.12 : .89), true);
  }
  function onResize() {
    if (!active) return;
    if (resizeFrame) cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => { resizeFrame = 0; fit(); });
  }
  function zoomIn() { applyZoom(zoom * 1.15, true); }
  function zoomOut() { applyZoom(zoom / 1.15, true); }
  function bindStage(stage) {
    if (!stage || stage.dataset.technical2dInteractionBound === '1') return false;
    stage.dataset.technical2dInteractionBound = '1';
    stage.addEventListener('click', handleStageClick, true);
    stage.addEventListener('keydown', handleStageKeydown, true);
    return true;
  }
  function init() {
    if (initialized) return;
    initialized = true;
    createInteractionUi();
    const viewport = $('technical2DViewport');
    if (viewport) viewport.addEventListener('wheel', handleWheel, { passive: false });
    const stage = $('technical2DStage'); if (stage) { stage.addEventListener('click', handleStageClick); stage.addEventListener('keydown', handleStageKeydown); }
    const fitBtn = $('technical2DFitBtn'); if (fitBtn) fitBtn.addEventListener('click', fit);
    const inBtn = $('technical2DZoomInBtn'); if (inBtn) inBtn.addEventListener('click', zoomIn);
    const outBtn = $('technical2DZoomOutBtn'); if (outBtn) outBtn.addEventListener('click', zoomOut);
    window.addEventListener('resize', onResize);
  }
  function destroy() {
    if (!initialized) return;
    const viewport = $('technical2DViewport');
    if (viewport) viewport.removeEventListener('wheel', handleWheel);
    const stage = $('technical2DStage'); if (stage) { stage.removeEventListener('click', handleStageClick); stage.removeEventListener('keydown', handleStageKeydown); }
    hideContextMenu();
    const fitBtn = $('technical2DFitBtn'); if (fitBtn) fitBtn.removeEventListener('click', fit);
    const inBtn = $('technical2DZoomInBtn'); if (inBtn) inBtn.removeEventListener('click', zoomIn);
    const outBtn = $('technical2DZoomOutBtn'); if (outBtn) outBtn.removeEventListener('click', zoomOut);
    window.removeEventListener('resize', onResize);
    if (resizeFrame) cancelAnimationFrame(resizeFrame);
    resizeFrame = 0; initialized = false; active = false;
  }

  const api = Object.freeze({
    RELEASE,
    SHEET,
    init,
    destroy,
    project,
    renderProjection,
    toSvg: (projection) => { interactionMap.clear(); interactionSequence = 0; return renderSvg(projection); },
    commonProjectionScale,
    projectionScaleAudit,
    bindStage,
    setActive,
    fit,
    getLastProjection: () => lastProjection,
    getDiagnostics: () => Object.freeze({ active, zoom, interactionCount: interactionMap.size, valid: Boolean(lastProjection && lastProjection.valid), schema: lastProjection && lastProjection.schema || '', summary: lastProjection && lastProjection.summary ? JSON.parse(JSON.stringify(lastProjection.summary)) : null })
  });
  root.PulumurTechnical2DWorkspace = api;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true }); else init();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
