/* One document renderer, with a viewport whose zoom limit follows the smallest drawing feature. */
(function (root) {
  'use strict';

  const esc = value => String(value).replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[c]);
  function svg(renderer, doc, options = {}) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = renderer.toSvg(root.PLMRDrawingText.document(doc), options);
    const node = wrapper.querySelector('svg');
    if (!node) return '';
    const ns = 'http://www.w3.org/2000/svg',
      style = document.createElementNS(ns, 'style');
    style.textContent = 'svg .g2d-position-hit,svg .g2d-position-hit:hover,svg .g2d-position-hit.is-selected{fill:transparent!important;stroke:none!important;stroke-dasharray:none!important}' + Object.entries(doc.layerStyle || {}).map(([name, style]) => {
      const cls = '.g2d-layer-' + name.replace(/[^a-z0-9]+/gi, '-').toLowerCase(),
        color = style.stroke || {
          1: '#dc2626',
          3: '#35a821',
          5: '#2563eb',
          6: '#e000df',
          8: '#929292',
          30: '#ff8c00'
        }[style.aci] || '#111';
      return 'svg ' + cls + '{stroke:' + color + '!important}svg text' + cls + '{fill:' + color + '!important;stroke:none!important}';
    }).join('');
    node.append(style);
    const defs = document.createElementNS(ns, 'defs');
    defs.innerHTML = '<pattern id="plmr-wall-brick" patternUnits="userSpaceOnUse" width="200" height="100"><rect width="200" height="100" fill="#f5f5f4"/><path d="M0 0H200M0 50H200M0 100H200M0 0V50M100 50V100M200 0V50" fill="none" stroke="#9ca3af" stroke-width="2"/></pattern>';
    node.prepend(defs);
    const hatches=(doc.entities||[]).filter(e=>e.type==='hatch');
    [...node.querySelectorAll('polygon[stroke="none"]')].forEach((polygon,index)=>{if(hatches[index]?.patternKind==='brick')polygon.setAttribute('fill','url(#plmr-wall-brick)');});
    const block = doc.blocks?.['PLMR - LOGO'];
    if (block) for (const insert of node.querySelectorAll('[data-block="PLMR - LOGO"]')) [...insert.children].forEach((path, i) => {
      const e = block.entities[i];
      if (e) {
        const color = e.stroke || (e.trueColor != null ? '#' + e.trueColor.toString(16).padStart(6, '0') : null);
        if (color) path.style.setProperty('stroke', color, 'important');
      }
    });
    return node.outerHTML;
  }
  function create(renderer) {
    let container = null,
      doc = null,
      options = {},
      view = null,
      selected = [],
      drag = null;
    const full = () => ({
      x: doc.bounds.minX || 0,
      y: 0,
      width: doc.bounds.width,
      height: doc.bounds.height
    });
    const element = () => container?.querySelector('svg');
    const sync = () => {
      const node = element();
      if (node && view) node.setAttribute('viewBox', [view.x, view.y, view.width, view.height].join(' '));
    };
    const point = (x, y) => {
      const node = element(),
        p = node.createSVGPoint();
      p.x = x;
      p.y = y;
      return p.matrixTransform(node.getScreenCTM().inverse());
    };
    function fit(bounds) {
      if (!doc) return;
      if (!bounds) view = full();else {
        const pad = 120,
          width = bounds.maxX - bounds.minX + pad * 2,
          height = bounds.maxY - bounds.minY + pad * 2;
        view = {
          x: bounds.minX - pad,
          y: doc.bounds.height - bounds.maxY - pad,
          width,
          height
        };
      }
      sync();
    }
    function zoom(factor, x, y) {
      if (!doc || !view) return;
      const node = element(),
        box = node.getBoundingClientRect(),
        p = point(x ?? box.x + box.width / 2, y ?? box.y + box.height / 2),
        base = full();
      // Allow a small facade detail, not the whole assembly's cell, to fill the screen.
      const minWidth = Math.max(40, Math.min(...(doc.sheetTargets || doc.positions || []).map(t => {
          const b = t.bounds || t.productBounds || t.cellBounds;
          return b ? b.maxX - b.minX : base.width;
        }), base.width) / 12),
        scale = Math.max(minWidth / view.width, Math.min(base.width * 2 / view.width, Number(factor) || 1));
      view = {
        x: p.x + (view.x - p.x) * scale,
        y: p.y + (view.y - p.y) * scale,
        width: view.width * scale,
        height: view.height * scale
      };
      sync();
    }
    function highlight() {
      for (const hit of container?.querySelectorAll('[data-position-id]') || []) hit.classList.toggle('is-selected', selected.includes(hit.dataset.positionId));
    }
    function bind(target) {
      container = target;
      container.addEventListener('wheel', e => {
        if (!doc) return;
        e.preventDefault();
        zoom(Math.exp(Math.max(-1, Math.min(1, e.deltaY * .0015))), e.clientX, e.clientY);
      }, {
        passive: false
      });
      container.addEventListener('pointerdown', e => {
        if (e.button !== 0 && e.button !== 1) return;
        const p = point(e.clientX, e.clientY);
        drag = {
          id: e.pointerId,
          start: p,
          x: e.clientX,
          y: e.clientY,
          view: {
            ...view
          },
          hit: e.target.closest('[data-position-id]')?.dataset.positionId,
          moved: false
        };
        container.setPointerCapture(e.pointerId);
      });
      container.addEventListener('pointermove', e => {
        if (!drag || e.pointerId !== drag.id) return;
        const p = point(e.clientX, e.clientY),
          dx = e.clientX - drag.x,
          dy = e.clientY - drag.y;
        if (Math.hypot(dx, dy) > 4) drag.moved = true;
        if (!drag.moved) return;
        view = {
          ...view,
          x: view.x + drag.start.x - p.x,
          y: view.y + drag.start.y - p.y
        };
        sync();
      });
      container.addEventListener('pointerup', e => {
        if (!drag || e.pointerId !== drag.id) return;
        const d = drag;
        drag = null;
        if (container.hasPointerCapture(e.pointerId)) container.releasePointerCapture(e.pointerId);
        if (!d.moved && e.button === 0) {
          if (d.hit) options.onSelect?.(d.hit, e);else options.onClearSelection?.();
        }
      });
      const cancel = () => {
        drag = null;
      };
      container.addEventListener('pointercancel', cancel);
      root.addEventListener('blur', cancel);
      container.addEventListener('dblclick', e => {
        e.preventDefault();
        const p = point(e.clientX, e.clientY),
          y = doc.bounds.height - p.y,
          targets = (doc.sheetTargets || []).filter(t => p.x >= t.bounds.minX && p.x <= t.bounds.maxX && y >= t.bounds.minY && y <= t.bounds.maxY).sort((a, b) => (a.bounds.maxX - a.bounds.minX) * (a.bounds.maxY - a.bounds.minY) - (b.bounds.maxX - b.bounds.minX) * (b.bounds.maxY - b.bounds.minY));
        fit(targets[0]?.bounds);
      });
    }
    function render(target, d, next = {}) {
      if (!container) bind(target);
      if (target !== container) throw Error('2D viewport sahibi değiştirilemez.');
      doc = d;
      options = next;
      selected = next.selectedIds || selected;
      view = view || full();
      container.innerHTML = svg(renderer, doc, {
        showDimensions: next.showDimensions,
        viewBox: view
      });
      const node = element(),
        ns = 'http://www.w3.org/2000/svg';
      for (const position of doc.positions || []) {
        const b = position.productBounds || position.cellBounds;
        if (!b) continue;
        const hit = document.createElementNS(ns, 'rect');
        hit.setAttribute('class', 'g2d-position-hit');
        hit.dataset.positionId = position.id;
        hit.dataset.positionNo = position.positionNo;
        for (const [k, v] of Object.entries({
          x: b.minX,
          y: doc.bounds.height - b.maxY,
          width: b.maxX - b.minX,
          height: b.maxY - b.minY
        })) hit.setAttribute(k, String(v));
        node.append(hit);
      }
      highlight();
      sync();
    }
    return Object.freeze({
      render,
      fit,
      zoom,
      restore: box => {
        if (!box || ![box.x,box.y,box.width,box.height].every(Number.isFinite) || box.width<=0 || box.height<=0) return;
        view={...box};
        sync();
      },
      setSelectedIds: ids => {
        selected = ids;
        highlight();
      },
      inspect: () => ({
        viewBox: view && {
          ...view
        },
        targetCount: doc?.sheetTargets?.length || 0
      }),
      svg: doc => svg(renderer, doc, {
        showDimensions: options.showDimensions
      })
    });
  }
  root.PLMRV5SheetViewport = Object.freeze({
    create,
    svg
  });
})(window);
