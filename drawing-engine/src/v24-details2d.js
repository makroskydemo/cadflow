/* Detached fabrication views. Every cell is derived from the approved product document. */
(function (root) {
  'use strict';

  const clone = value => JSON.parse(JSON.stringify(value));
  function translate(item, dx, dy) {
    const e = clone(item);
    for (const k of ['x', 'x1', 'x2', 'dxfCellX']) if (Number.isFinite(e[k])) e[k] += dx;
    for (const k of ['y', 'y1', 'y2', 'dxfCellY']) if (Number.isFinite(e[k])) e[k] += dy;
    if (e.points) e.points = e.points.map(p => [p[0] + dx, p[1] + dy]);
    for (const k of ['p1', 'p2', 'dimLine', 'text']) if (e[k] && typeof e[k] === 'object') e[k] = {
      ...e[k],
      x: e[k].x + dx,
      y: e[k].y + dy
    };
    for (const k of ['textBounds', 'fitBounds', 'markBounds']) if (e[k]) {
      e[k].minX += dx;
      e[k].maxX += dx;
      e[k].minY += dy;
      e[k].maxY += dy;
    }
    if (e.graphics) e.graphics = e.graphics.map(g => translate(g, dx, dy));
    return e;
  }
  function reflow(document, maxWidth = 24000) {
    if (!document?.cells?.length) return document;
    const rows = [];
    let row = {
      cells: [],
      width: 0,
      height: 0
    };
    const gap = 650;
    for (const cell of document.cells) {
      const width = cell.bounds.maxX - cell.bounds.minX,
        height = cell.bounds.maxY - cell.bounds.minY;
      if (row.cells.length && row.width + gap + width > maxWidth) {
        rows.push(row);
        row = {
          cells: [],
          width: 0,
          height: 0
        };
      }
      row.cells.push({
        cell,
        x: row.width + (row.cells.length ? gap : 0)
      });
      row.width += width + (row.cells.length > 1 ? gap : 0);
      row.height = Math.max(row.height, height);
    }
    if (row.cells.length) rows.push(row);
    const height = rows.reduce((n, r) => n + r.height, 0) + Math.max(0, rows.length - 1) * gap,
      entities = [],
      positions = [];
    let y = height;
    for (const row of rows) {
      for (const {
        cell,
        x
      } of row.cells) {
        const dx = x - cell.bounds.minX,
          dy = y - cell.bounds.maxY;
        entities.push(...cell.entities.map(e => translate(e, dx, dy)));
        const b = {
          minX: x,
          maxX: x + cell.bounds.maxX - cell.bounds.minX,
          minY: cell.bounds.minY + dy,
          maxY: cell.bounds.maxY + dy
        };
        positions.push({
          id: cell.id,
          positionNo: cell.code,
          width: cell.width,
          height: cell.height,
          quantity: cell.quantity,
          view: 'DIŞ BAKIŞ',
          cellBounds: b,
          productBounds: b,
          origin: {
            x: dx,
            y: dy
          },
          sourceMeta: cell.sourceMeta
        });
      }
      y -= row.height + gap;
    }
    const width = Math.max(...rows.map(r => r.width)),
      bounds = {
        minX: 0,
        minY: 0,
        maxX: width,
        maxY: height,
        width,
        height
      };
    return {
      ...document,
      entities,
      positions,
      bounds,
      previewBounds: bounds,
      columns: Math.max(...rows.map(r => r.cells.length))
    };
  }
  function build(model, contract) {
    const N = root.PLMRV24Native,
      D = root.PLMRV24Libraries.PLMRV53Document,
      units = model.sceneEditor?.dimensionUnits || {
        mm: true
      },
      cells = [],
      styles = {};
    let textContext;
    const textWidth=value=>{
      if(!textContext){textContext=root.document.createElement('canvas').getContext('2d');textContext.font='800 106px Arial';}
      return textContext.measureText(value).width;
    };
    const owners = [...(model.sceneEditor?.mainDeleted ? [] : [{
      id: 'roof-main',
      spec: model
    }]), ...(model.sceneEditor?.roofCopies || [])];
    for (const owner of owners) {
      const zones = contract?.owners?.find(o => o.id === owner.id)?.zones || owner.spec.sceneEditor?.facadeGraph?.flatMap(f => f.zones || []) || (contract?.zones || []).filter(z => (z.owner || 'roof-main') === owner.id);
      for (const [slot, store] of [['primary', owner.spec.placements], ['zip', owner.spec.zipPlacements]]) for (const [zoneId, original] of Object.entries(store || {})) {
        const zone = zones.find(z => z.id === zoneId);
        if (!zone) continue;
        // Presentation-only outside view. The saved product options and handedness are untouched.
        const placement = N.outsidePlacement(original);
        let document, q, entities, bounds, productCenter;
        if (N.native(placement)) {
          document = N.drawing(zone, placement, units, {
            detailDimensions: true
          });
          q = N.resolve(zone, placement);
          const position = document.positions[0];
          entities = document.entities.filter(e => e.positionId === position.id);
          productCenter=position.origin.x+q.width/2;
          bounds = {
            ...position.cellBounds
          };
        } else if (['sliding', 'guillotine'].includes(placement.type)) {
          q = {
            width: zone.width - 5,
            height: zone.height - 5
          };
          const native = root.PLMRV53FacadeAdapter.drawing2D(placement.type, {
            ...placement, id:owner.id+':'+zoneId, ...q, view:'OUTSIDE'
          }, {detailDimensions:true,dimensionUnits:units});
          entities = native.entities;
          productCenter=q.width/2;
          bounds = {
            minX: -350,
            maxX: q.width + 350,
            minY: -350,
            maxY: q.height + 350
          };
        } else continue;
        const code = original.positionCode,
          id = owner.id + ':' + slot + ':' + zoneId,
          sourceMeta = {
            owner: owner.id,
            zoneId,
            slot,
            productType: placement.type,
            view: 'OUTSIDE'
          };
        entities = entities.map(e => ({
          ...clone(e),
          layer: e.type === 'dimension' ? root.PulumurTechnical2DExport.DIM_LAYERS[units.mm && units.inch ? 'dual' : units.inch ? 'inch' : 'mm'] : code,
          positionId: id,
          positionNo: code,
          sourceMeta
        }));
        // Keep narrow/dual-unit leaf dimensions readable without changing their measured anchors.
        const placed = [];
        for (const e of entities.filter(e => e.type === 'dimension' && Math.abs(e.p1.y - e.p2.y) < .01 && e.dimLine.y < e.p1.y).sort((a, b) => b.dimLine.y - a.dimLine.y)) {
          const value = String(e.previewText || ''),
            width = Math.max(value.length * 76, textWidth(value) + 100),
            center = (e.p1.x + e.p2.x) / 2,
            interval = [center - width / 2, center + width / 2];
          let y = e.dimLine.y;
          while (placed.some(p => Math.abs(p.y - y) < 180 && Math.min(p.interval[1], interval[1]) - Math.max(p.interval[0], interval[0]) > 0)) y -= 220;
          if (y !== e.dimLine.y) Object.assign(e, D.makeDimension('x', e.p1, e.p2, {
            x: e.dimLine.x,
            y
          }, Math.abs(e.p2.x - e.p1.x), e.previewText, e.dimensionId));
          placed.push({
            y,
            interval
          });
          bounds.minY = Math.min(bounds.minY, y - 130);
        }
        for (const e of entities.filter(e=>e.type==='dimension')) {
          e.layer = root.PulumurTechnical2DExport.DIM_LAYERS[units.mm && units.inch ? 'dual' : units.inch ? 'inch' : 'mm'];
          for (const g of e.graphics || []) g.layer=e.layer;
        }
        const heading = code,
          headingH = root.PulumurTechnical2DExport.INFO_HEIGHT,
          headingY = bounds.maxY + 100;
        entities.push({
          ...D.text(productCenter, headingY, heading, 'Bilgilendirme Yazıları', headingH),
          align: 'center',
          positionId: id,
          positionNo: code,
          sourceMeta:{...sourceMeta,kind:'facade-heading'}
        });
        bounds.maxY = headingY + headingH;
        cells.push({
          id,
          code,
          width: q.width,
          height: q.height,
          quantity: q.quantity || 1,
          bounds,
          entities,
          sourceMeta
        });
        styles['Bilgilendirme Yazıları'] = {aci:30,stroke:'#ff8c00',width:.25};
        styles[code] = {
          aci: 5,
          stroke: '#2563eb',
          width: .3
        };
        for (const e of entities) if (e.type === 'dimension') styles[e.layer] = {
          aci: 1,
          stroke: '#dc2626',
          width: .25
        };
      }
    }
    if (!cells.length) return null;
    cells.sort((a, b) => a.code.localeCompare(b.code, undefined, {
      numeric: true
    }));
    return reflow({
      schema: 'plmr-v5-product-details',
      cells,
      layerStyle: styles,
      layers: Object.keys(styles),
      metadata: {
        dimensionUnits: units
      },
      blocks: {}
    }, 24000);
  }
  root.PLMRV24Details2D = Object.freeze({
    build,
    reflow,
    translate,
    svg: doc => doc ? root.PLMRV24Libraries.createPLMRReference2DPreview().toSvg(doc, {
      showDimensions: true
    }) : ''
  });
})(window);
