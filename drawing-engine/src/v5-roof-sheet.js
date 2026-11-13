/* A fabrication sheet built from canonical per-owner projections, never a second product model. */
(function (root) {
  'use strict';

  const clone = value => JSON.parse(JSON.stringify(value)),
    EPS = .5;
  const views = [{
    id: 'front',
    title: 'ÖN GÖRÜNÜŞ · DIŞ BAKIŞ',
    n: [0, 1]
  }, {
    id: 'rear',
    title: 'ARKA GÖRÜNÜŞ',
    n: [0, -1]
  }, {
    id: 'left',
    title: 'SOL GÖRÜNÜŞ · DIŞ BAKIŞ',
    n: [-1, 0]
  }, {
    id: 'right',
    title: 'SAĞ GÖRÜNÜŞ · DIŞ BAKIŞ',
    n: [1, 0]
  }].map(view=>({...view,u:root.PLMROrthographicAxes.exteriorRight(view.n)}));
  const dot = (p, a) => p[0] * a[0] + p[1] * a[1];
  function hull(points) {
    const ps = [...new Map(points.map(p => [p.map(n => n.toFixed(5)).join(','), p])).values()].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    if (ps.length < 3) return ps;
    const cross = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]),
      lower = [],
      upper = [];
    for (const p of ps) {
      while (lower.length > 1 && cross(lower.at(-2), lower.at(-1), p) <= 0) lower.pop();
      lower.push(p);
    }
    for (const p of ps.slice().reverse()) {
      while (upper.length > 1 && cross(upper.at(-2), upper.at(-1), p) <= 0) upper.pop();
      upper.push(p);
    }
    return lower.slice(0, -1).concat(upper.slice(0, -1));
  }
  function inside(p, polygon) {
    let yes = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const a = polygon[i],
        b = polygon[j];
      if (a[1] > p[1] !== b[1] > p[1] && p[0] < (b[0] - a[0]) * (p[1] - a[1]) / (b[1] - a[1]) + a[0]) yes = !yes;
    }
    return yes;
  }
  function outerEdges(polygons) {
    const edges = polygons.flatMap(ps => ps.map((a, i) => [a, ps[(i + 1) % ps.length]])),
      result = [],
      seen = new Set();
    for (const [a, b] of edges) {
      const dx = b[0] - a[0],
        dy = b[1] - a[1],
        length = Math.hypot(dx, dy);
      if (length < EPS) continue;
      const stops = [0, 1];
      for (const [c, d] of edges) {
        const ex = d[0] - c[0],
          ey = d[1] - c[1],
          det = dx * ey - dy * ex;
        if (Math.abs(det) > .0001) {
          const t = ((c[0] - a[0]) * ey - (c[1] - a[1]) * ex) / det,
            s = ((c[0] - a[0]) * dy - (c[1] - a[1]) * dx) / det;
          if (t > 0 && t < 1 && s >= 0 && s <= 1) stops.push(t);
        } else for (const p of [c, d]) if (Math.abs((p[0] - a[0]) * dy - (p[1] - a[1]) * dx) < EPS * length) {
          const t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (length * length);
          if (t > 0 && t < 1) stops.push(t);
        }
      }
      const sorted = [...new Set(stops.map(t => +t.toFixed(8)))].sort((a, b) => a - b);
      for (let i = 1; i < sorted.length; i++) {
        const t0 = sorted[i - 1],
          t1 = sorted[i];
        if ((t1 - t0) * length < EPS) continue;
        const p = [a[0] + dx * t0, a[1] + dy * t0],
          q = [a[0] + dx * t1, a[1] + dy * t1],
          mid = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2],
          normal = [dy / length, -dx / length],
          right = polygons.some(poly => inside([mid[0] + normal[0] * 2, mid[1] + normal[1] * 2], poly)),
          left = polygons.some(poly => inside([mid[0] - normal[0] * 2, mid[1] - normal[1] * 2], poly));
        if (right === left) continue;
        if (right) {
          normal[0] *= -1;
          normal[1] *= -1;
        }
        const key = [p, q].map(p => p.map(n => n.toFixed(2)).join(',')).sort().join('|');
        if (seen.has(key)) continue;
        seen.add(key);
        result.push({
          a: p,
          b: q,
          normal
        });
      }
    }
    // Continuous exterior sides receive one dimension, including stepped L-shaped plans.
    const groups = new Map();
    for (const edge of result) {
      const n = edge.normal,
        c = dot(edge.a, n),
        key = [...n, c].map(v => v.toFixed(4)).join('|'),
        group = groups.get(key) || {
          normal: n,
          c,
          intervals: []
        },
        tangent = [-n[1], n[0]];
      group.intervals.push([dot(edge.a, tangent), dot(edge.b, tangent)].sort((a, b) => a - b));
      groups.set(key, group);
    }
    const merged = [];
    for (const group of groups.values()) {
      const intervals = [];
      for (const span of group.intervals.sort((a, b) => a[0] - b[0])) {
        const last = intervals.at(-1);
        if (last && span[0] <= last[1] + EPS) last[1] = Math.max(last[1], span[1]);else intervals.push(span.slice());
      }
      const n = group.normal,
        tangent = [-n[1], n[0]],
        point = t => [tangent[0] * t + n[0] * group.c, tangent[1] * t + n[1] * group.c];
      for (const span of intervals) merged.push({
        a: point(span[0]),
        b: point(span[1]),
        normal: n
      });
    }
    return merged;
  }
  function build(projection, options = {}) {
    const E = root.PulumurTechnical2DExport,
      C = root.PLMRRollingRoofSceneCore,
      D = root.PLMRV24Libraries.PLMRV53Document,
      m = projection.modelState,
      ground = Number(m.sceneEditor?.groundY) || 0;
    const units = m.sceneEditor?.dimensionUnits || {
        mm: true
      },
      visibility = projection.dimensionVisibility || {},
      entities = [],
      styles = {},
      targets = [];
    const line = (a, b, layer, meta = {}) => ({
      type: 'polyline',
      layer,
      color: 256,
      points: [a, b],
      sourceMeta: meta
    });
    const poly = (points, layer, meta = {}) => ({
      type: 'polyline',
      layer,
      color: 256,
      closed: true,
      points,
      sourceMeta: meta
    });
    const text = (x, y, value, height = 150, meta = {}) => ({
      type: 'text',
      layer: 'Bilgilendirme Yazıları',
      color: 256,
      x,
      y,
      value,
      height,
      align: 'center',
      sourceMeta: meta
    });
    const style = (layer, kind) => {
      const s = E.PALETTE[kind] || E.PALETTE.frame;
      styles[layer] = {
        ...s
      };
    };
    const owners = [...(m.sceneEditor?.mainDeleted ? [] : [{
      id: 'roof-main',
      spec: m,
      pose: m.sceneEditor?.roofPose || {}
    }]), ...(m.sceneEditor?.roofCopies || [])].map(owner => {
      const spec = {
        ...clone(owner.spec),
        panelCount: owner.spec.lamellaCount,
        sketchWalls: [],
        parapetWalls: m.sketchWalls || [],
        parapetOwner: owner.id,
        sceneEditor: {
          ...clone(owner.spec.sceneEditor || {}),
          roofCopies: [],
          roofPose: {},
          mainDeleted: false,
          dimensionUnits: units
        }
      };
      const local = root.PulumurFreedom2DAdapter.build({
        schema: 'p3dv-host-snapshot-v1',
        modelState: spec,
        dimensionVisibility: visibility
      }, {
        ownerId: owner.id,
        localOwner: true,
        contract: projection.sheetContract
      });
      if (!local.valid) throw Error('Tavan görünüşü üretilemedi: ' + owner.id);
      return {
        ...owner,
        local,
        pose: C.pose(owner.pose),
        world: p => C.point(p, C.pose(owner.pose), owner.spec.height, ground)
      };
    });
    const footprints = owners.flatMap(o => (o.local.layout.modules || []).map(mod => [[mod.outerMinX, mod.rearOuterZ], [mod.outerMaxX, mod.rearOuterZ], [mod.outerMaxX, mod.frontOuterZ], [mod.outerMinX, mod.frontOuterZ]].map(p => {
      const w = o.world([p[0], 0, p[1]]);
      return [w[0], w[2]];
    })));
    const ownerById=new Map(owners.map(owner=>[owner.id,owner]));
    function layerFor(item) {
      const meta = item.meta || {},
        owner = ownerById.get(meta.sceneObjectId || 'roof-main');
      if (item.role === 'post') {
        const p = owner?.local.layout.posts.find(p => p.id === meta.postId),
          section = p?.section || owner?.spec.postSections?.[0] || {
            x: 170,
            z: 170
          };
        const layer = Math.round(section.x) + 'x' + Math.round(section.z) + ' Dikme';
        style(layer, 'vertical');
        return layer;
      }
      if (meta.profileId) {
        const profile=meta.profile||owner?.spec.facadeProfiles?.[meta.facadeId]?.find(p=>p.id===meta.profileId);
        const width=Number(profile?.width)||100,depth=Number(profile?.depth)||100;
        const layer='Ek Profil '+width+'x'+depth;
        styles[layer]=E.addedProfileStyle(width,depth);
        return layer;
      }
      if (meta.roofProduct) {
        const layer = root.PLMRBioclimaticRoof.product(meta.roofProduct).name + ' Çatı Panelleri';
        style(layer, 'panel');
        return layer;
      }
      const layer = E.roleLayer ? E.roleLayer(item) : item.role?.includes('gutter') ? 'Oluk Profilleri' : 'Kiriş Profilleri';
      style(layer, item.type === 'text' ? 'text' : item.role?.includes('gutter') ? 'gutter' : meta.orientation === 'horizontal' ? 'horizontal' : 'frame');
      return layer;
    }
    const visible = item => !['zone-area', 'alignment-guide', 'module-boundary', 'module-outline', 'elevation-envelope', 'product-plan', 'frame-profile', 'led'].includes(item.role) && !item.role?.startsWith('product-') && item.type !== 'dimension' && !(item.role === 'panel-zone');
    function convert(item, points) {
      const meta = {
          ...item.meta,
          ...(item.role==='post'?{kind:'post'}:{}),
          sourceRole:item.role,
          viewId: 'top'
        },
        layer = layerFor(item);
      if (item.type === 'text') return text(points[0][0], points[0][1], item.text, item.role === 'module-label' ? 145 : 120, meta);
      return item.type === 'rect' ? poly(points, layer, meta) : line(points[0], points[1], layer, meta);
    }
    // Preserve the approved local closed profiles before the world projection splits
    // rectangles into four independent lines. Only presentation is transformed here.
    const top = [], gutterBands = [];
    for (const owner of owners) {
      const source = owner.local.views.find(v => v.id === 'top');
      const worldPoint = p => { const w = owner.world([p[0], 0, p[1]]); return [w[0], w[2]]; };
      const gutters = source.entities.filter(e => e.role === 'gutter-profile' && e.type === 'rect');
      for (const module of owner.local.layout.modules || []) {
        const strips = gutters.filter(e => e.meta?.moduleIndex === module.moduleIndex);
        if (strips.length !== 4) throw Error('Oluk profil sınırları eksik: ' + owner.id);
        const x0 = Math.min(...strips.map(e => e.x)), x1 = Math.max(...strips.map(e => e.x + e.width));
        const y0 = Math.min(...strips.map(e => e.y)), y1 = Math.max(...strips.map(e => e.y + e.height));
        const bySide = Object.fromEntries(strips.map(e => [e.meta.gutterSide, e]));
        const ix0 = bySide.left.x + bySide.left.width, ix1 = bySide.right.x;
        const horizontal = [bySide.front, bySide.rear].sort((a,b) => a.y-b.y);
        const iy0 = horizontal[0].y + horizontal[0].height, iy1 = horizontal[1].y;
        const meta = {sceneObjectId: owner.id, moduleIndex: module.moduleIndex, viewId:'top', kind:'gutter-profile'};
        style('Oluk Profilleri', 'gutter');
        for (const [a,b,c,d] of [[x0,y0,x1,y1],[ix0,iy0,ix1,iy1]])
          top.push(poly([[a,b],[c,b],[c,d],[a,d]].map(worldPoint), 'Oluk Profilleri', meta));
        for (const strip of strips) gutterBands.push({points:[[strip.x,strip.y],[strip.x+strip.width,strip.y],[strip.x+strip.width,strip.y+strip.height],[strip.x,strip.y+strip.height]].map(worldPoint), owner:owner.id});
      }
      for (const item of source.entities) {
        if (!visible(item) || item.role === 'gutter-profile' || item.meta?.kind === 'sketch-wall') continue;
        if (item.type === 'text' && item.meta?.kind === 'product-code') continue;
        const points = item.type === 'rect' ? [[item.x,item.y],[item.x+item.width,item.y],[item.x+item.width,item.y+item.height],[item.x,item.y+item.height]] : item.type === 'line' ? [[item.x1,item.y1],[item.x2,item.y2]] : [[item.x,item.y]];
        top.push(convert({...item,meta:{...item.meta,sceneObjectId:owner.id}}, points.map(worldPoint)));
      }
    }
    for (const owner of owners) {
      const source=owner.local.views.find(v=>v.id==='top');
      const worldPoint=p=>{const w=owner.world([p[0],0,p[1]]);return [w[0],w[2]];};
      // Co-located products share one label; their separate detail/UUID records remain.
      const zoneLabels=new Map();
      for(const item of source.entities.filter(e=>e.meta?.kind==='product-code')){
        if(visibility.infoIds?.[item.meta.positionCode]===false)continue;
        const key=item.meta.zoneId,prior=zoneLabels.get(key);
        if(prior){prior.text+=' / '+item.text;prior.meta.positionCodes.push(item.meta.positionCode);}
        else zoneLabels.set(key,{...item,meta:{...item.meta,positionCodes:[item.meta.positionCode]}});
      }
      // A position code sits within its nearest gutter face, along that face's axis.
      for (const item of zoneLabels.values()) {
        if (visibility.information === false || visibility.infoIds?.[item.meta.positionCode] === false) continue;
        const anchor = worldPoint([item.x,item.y]);
        const zoneAxis = item.meta?.zone?.axis === 'z' ? [0,0,1] : [1,0,0];
        const along = C.vector(zoneAxis,owner.pose.angle);
        const candidates = gutterBands.map(b => {
          const ps=b.points, lengths=[Math.hypot(ps[1][0]-ps[0][0],ps[1][1]-ps[0][1]),Math.hypot(ps[2][0]-ps[1][0],ps[2][1]-ps[1][1])];
          const i=lengths[0]>=lengths[1]?0:1, a=ps[i], c=ps[(i+1)%4], length=lengths[i], thickness=lengths[1-i];
          const u=[(c[0]-a[0])/length,(c[1]-a[1])/length], center=ps.reduce((p,q)=>[p[0]+q[0]/4,p[1]+q[1]/4],[0,0]);
          const height=Math.min(100,thickness*.6,length/Math.max(1,String(item.text).length*.75));
          const margin=Math.min(length/2,String(item.text).length*height*.38+35);
          const t=Math.max(-length/2+margin,Math.min(length/2-margin,dot([anchor[0]-center[0],anchor[1]-center[1]],u)));
          const point=[center[0]+u[0]*t,center[1]+u[1]*t];
          return {point,height,u,distance:Math.hypot(anchor[0]-point[0],anchor[1]-point[1])};
        }).filter(c=>Math.abs(c.u[0]*along[0]+c.u[1]*along[2])>.999).sort((a,b)=>a.distance-b.distance);
        const best=candidates[0]; if (!best) continue;
        let rotation=Math.atan2(best.u[1],best.u[0])*180/Math.PI;
        if(rotation>90)rotation-=180; if(rotation<=-90)rotation+=180;
        top.push({...text(...best.point,item.text,best.height,{...item.meta,sceneObjectId:owner.id,viewId:'top',gutterLabel:true}),rotation});
      }
    }
    const wallPolys = [];
    for (const wall of m.sketchWalls || []) for (const solid of root.PLMRRollingRoofSketchCore.cells(wall)) {
      const vertices = [];
      for (const x of [solid.min[0], solid.max[0]]) for (const y of [solid.min[1], solid.max[1]]) for (const z of [solid.min[2], solid.max[2]]) vertices.push(C.wallPoint(wall, [x, y, z]));
      wallPolys.push({
        vertices,
        meta: {
          kind: 'sketch-wall',
          wallId: wall.id,
          cellId: solid.id
        }
      });
    }
    function addWalls(list, project, view) {
      for (const wall of wallPolys) {
        const points = hull(wall.vertices.map(project));
        if (points.length < 3) continue;
        if (view) {
          const u = points.reduce((n, p) => n + p[0], 0) / points.length,
            depth = Math.max(...wall.vertices.map(p => dot([p[0], p[2]], view.n)));
          if (roofDepth(u, view) - depth > 280) continue;
        }
        list.push({
          type: 'hatch',
          layer: 'Duvarlar',
          color: 256,
          points,
          patternKind: 'brick',
          patternScale: 8,
          sourceMeta: {...wall.meta,viewId:view?.id||'top'}
        }, poly(points, 'Duvarlar', {...wall.meta,viewId:view?.id||'top'}));
      }
      style('Duvarlar', 'wall');
    }
    addWalls(top, p => [p[0], p[2]]);
    function dimension(list, a, b, offset, meta) {
      const dx = b[0] - a[0],
        dy = b[1] - a[1],
        length = Math.hypot(dx, dy);
      if (length < 20 || !units.mm && !units.inch && !units.ft) return;
      const center = {
        x: (a[0] + b[0]) / 2 + offset[0],
        y: (a[1] + b[1]) / 2 + offset[1]
      };
      E.convertDimension(list, {
        axis: 'aligned',
        p1: {
          x: a[0],
          y: a[1]
        },
        p2: {
          x: b[0],
          y: b[1]
        },
        dimLine: center,
        text: D.formatDimension(length, units),
        meta
      }, {
        bounds: {}
      }, 0, 0, units);
    }
    if (visibility.main !== false) for (const edge of outerEdges(footprints)) dimension(top, edge.a, edge.b, edge.normal.map(n => n * 420), {
      kind: 'sheet-perimeter',
      viewId: 'top'
    });
    function orientPlan(entity) {
      const next=clone(entity);
      // World X is sheet X. Looking down flips world Z, unlike a bottom view.
      // This mirrors V31's plan about its sheet Y axis, without changing model coordinates.
      for(const key of ['y','y1','y2','dxfCellY'])if(Number.isFinite(next[key]))next[key]=-next[key];
      if(next.points)next.points=next.points.map(([x,y])=>[x,-y]);
      for(const key of ['p1','p2','dimLine','text'])if(next[key]&&typeof next[key]==='object')next[key]={...next[key],y:-next[key].y};
      if(Number.isFinite(next.rotation))next.rotation=-next.rotation;
      if(next.graphics)next.graphics=next.graphics.map(orientPlan);
      return next;
    }
    top.splice(0,top.length,...top.map(orientPlan));
    const cells = [{
      id: 'top',
      title: 'ÜST GÖRÜNÜŞ',
      entities: top
    }];
    function roofDepth(u, view) {
      const intersections = [];
      for (const polygon of footprints) for (let i = 0; i < polygon.length; i++) {
        const a = polygon[i],
          b = polygon[(i + 1) % polygon.length],
          x = dot(a, view.u),
          y = dot(b, view.u);
        if (Math.abs(y - x) < .001) {
          if (Math.abs(u - x) < EPS) intersections.push(dot(a, view.n), dot(b, view.n));
        } else if (u >= Math.min(x, y) - EPS && u <= Math.max(x, y) + EPS) {
          const t = (u - x) / (y - x);
          intersections.push(dot([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t], view.n));
        }
      }
      return intersections.length ? Math.max(...intersections) : -Infinity;
    }
    for (const view of views) {
      const items = [],
        postIntervals = [];
      const project = p => [dot([p[0], p[2]], view.u), p[1] - ground];
      for (const owner of owners) {
        const local = owner.local,
          env = local.envelope;
        for (const post of local.layout.posts) {
          const vertices = [];
          for (const x of [-1, 1]) for (const z of [-1, 1]) for (const y of [post.bottom, post.bottom + post.height]) vertices.push(owner.world([post.x + x * post.section.x / 2, y - owner.spec.height / 2, post.z + z * post.section.z / 2]));
          const points = hull(vertices.map(project)),
            meta = {
              kind: 'post',
              sceneObjectId: owner.id,
              postId: post.id,
              viewId: view.id
            },
            layer = Math.round(post.section.x) + 'x' + Math.round(post.section.z) + ' Dikme';
          style(layer, 'vertical');
          items.push(poly(points, layer, meta));
          const center = owner.world([post.x, 0, post.z]),
            u = dot([center[0], center[2]], view.u),
            depth = dot([center[0], center[2]], view.n);
          if (roofDepth(u, view) - depth < 280) postIntervals.push([Math.min(...points.map(p => p[0])), Math.max(...points.map(p => p[0]))]);
        }
        for (const side of [{
          id: 'front',
          normal: [0, 1],
          axis: 'x',
          at: env.maxZ
        }, {
          id: 'rear',
          normal: [0, -1],
          axis: 'x',
          at: env.minZ
        }, {
          id: 'left',
          normal: [-1, 0],
          axis: 'z',
          at: env.minX
        }, {
          id: 'right',
          normal: [1, 0],
          axis: 'z',
          at: env.maxX
        }]) {
          const normal = C.vector([side.normal[0], 0, side.normal[1]], owner.pose.angle);
          if (normal[0] * view.n[0] + normal[2] * view.n[1] < .0001) continue;
          for (const item of local.views.find(v => v.id === side.id).entities) {
            if (!visible(item) || item.meta?.roofProduct || item.role === 'post' || item.type === 'text' || item.meta?.kind === 'sketch-wall') continue;
            const pts = item.type === 'rect' ? [[item.x, item.y], [item.x + item.width, item.y], [item.x + item.width, item.y + item.height], [item.x, item.y + item.height]] : item.type === 'line' ? [[item.x1, item.y1], [item.x2, item.y2]] : [];
            if (!pts.length) continue;
            const points = pts.map(([u, y]) => project(owner.world(side.axis === 'x' ? [u, y - owner.spec.height / 2, side.at] : [side.at, y - owner.spec.height / 2, u]))),
              layer = layerFor({
                ...item,
                meta: {
                  ...item.meta,
                  sceneObjectId: owner.id
                }
              }),
              meta = {
                ...item.meta,
                sceneObjectId: owner.id,
                viewId: view.id
              };
            items.push(item.type === 'rect' ? poly(points, layer, meta) : line(points[0], points[1], layer, meta));
            if (item.meta?.orientation === 'vertical') postIntervals.push([Math.min(...points.map(p => p[0])), Math.max(...points.map(p => p[0]))]);
          }
        }
      }
      addWalls(items, project, view);
      const openingMeasures = [],
        openingKeys = new Set();
      for (const owner of owners) {
        const zones = projection.sheetContract?.owners?.find(o => o.id === owner.id)?.zones || [];
        const exposed = new Map();
        for (const z of zones) {
          const center = owner.world(root.PLMRV17Core.zonePoint(z, 0, z.bottomY)),
            u = dot([center[0], center[2]], view.u),
            depth = dot([center[0], center[2]], view.n);
          const normal = C.vector(z.axis === 'x' ? [0, 0, -z.inward] : [-z.inward, 0, 0], owner.pose.angle - (z.frameAngle || 0) * 180 / Math.PI);
          if (normal[0] * view.n[0] + normal[2] * view.n[1] < .0001 || roofDepth(u, view) - depth > 280) continue;
          const endpoints = [-z.width / 2, z.width / 2].flatMap(t => [z.bottomY, z.topY].map(y => project(owner.world(root.PLMRV17Core.zonePoint(z, t, y)))));
          const covered = wallPolys.some(wall => Math.max(...wall.vertices.map(p => dot([p[0], p[2]], view.n))) > depth + EPS && endpoints.every(p => inside(p, hull(wall.vertices.map(project)))));
          if (covered) continue;
          exposed.set(z.id, {
            z,
            u
          });
          const first = project(owner.world(root.PLMRV17Core.zonePoint(z, -z.width / 2, z.bottomY))),
            last = project(owner.world(root.PLMRV17Core.zonePoint(z, z.width / 2, z.bottomY))),
            top = project(owner.world(root.PLMRV17Core.zonePoint(z, 0, z.topY))),
            left = Math.min(first[0], last[0]),
            right = Math.max(first[0], last[0]),
            bottom = first[1];
          const key = [left, right, bottom, top[1]].map(v => v.toFixed(2)).join('|');
          if (!openingKeys.has(key) && right - left > 20 && top[1] - bottom > 20) {
            openingKeys.add(key);
            openingMeasures.push({
              left,
              right,
              bottom,
              top: top[1],
              owner: owner.id,
              zoneId: z.id
            });
          }
        }
        for (const zoneId of new Set([...Object.keys(owner.spec.placements||{}),...Object.keys(owner.spec.zipPlacements||{})])) {
          const item = exposed.get(zoneId);
          if (!item) continue;
          const {
            z,
            u
          } = item;
          const entries = [['primary',owner.spec.placements?.[zoneId]],['zip',owner.spec.zipPlacements?.[zoneId]]]
            .filter(([,p])=>p?.positionCode&&visibility.infoIds?.[p.positionCode]!==false);
          if (visibility.information !== false && entries.length) items.push(text(u, owner.pose.y + owner.spec.height / 2 + z.bottomY + z.height * .78, entries.map(([,p])=>p.positionCode).join(' / '), E.INFO_HEIGHT, {
            kind: 'product-code',
            positionCode: entries[0][1].positionCode,
            positionCodes: entries.map(([,p])=>p.positionCode),
            sceneObjectId: owner.id,
            zoneId,
            slot: entries[0][0],
            viewId: view.id
          }));
        }
      }
      if (visibility.main !== false || visibility.intermediate !== false) {
        if (openingMeasures.length) {
          for (const opening of openingMeasures) {
            const middle = (opening.bottom + opening.top) / 2;
            dimension(items, [opening.left, middle], [opening.right, middle], [0, 0], {
              kind: 'sheet-post-gap',
              viewId: view.id,
              owner: opening.owner,
              zoneId: opening.zoneId
            });
            dimension(items, [opening.left, opening.bottom], [opening.left, opening.top], [0, 0], {
              kind: 'sheet-opening-height',
              viewId: view.id,
              owner: opening.owner,
              zoneId: opening.zoneId
            });
          }
        } else if (!items.some(e => e.type === 'hatch')) {
          const sorted = postIntervals.sort((a, b) => a[0] - b[0]),
            merged = [];
          for (const p of sorted) {
            const last = merged.at(-1);
            if (last && p[0] <= last[1] + EPS) last[1] = Math.max(last[1], p[1]);else merged.push(p.slice());
          }
          for (let i = 1; i < merged.length; i++) dimension(items, [merged[i - 1][1], 0], [merged[i][0], 0], [0, -280], {
            kind: 'sheet-post-gap',
            viewId: view.id
          });
        }
      }
      if (visibility.main !== false) {
        const geometry = E.drawingBounds(items.filter(e => !['text', 'dimension'].includes(e.type))),
          bottom = Math.min(...owners.map(o => o.pose.y)),
          top = Math.max(...owners.map(o => o.pose.y + o.spec.height));
        dimension(items, [geometry.maxX, bottom], [geometry.maxX, top], [420, 0], {
          kind: 'sheet-overall-height',
          viewId: view.id
        });
      }
      cells.push({
        id: view.id,
        title: view.title,
        entities: items
      });
    }
    // Stable projection bands: front above plan; left/rear/right below it. Every band's true bounds include dimensions/text.
    for (const cell of cells) {
      const unique = new Map();
      for (const e of cell.entities) {
        const key = e.type === 'polyline' ? e.layer + '|' + e.points.map(p => p.map(n => n.toFixed(3)).join(',')).sort().join('|') : JSON.stringify(e);
        if (!unique.has(key)) unique.set(key, e);
      }
      cell.entities = [...unique.values()];
      cell.bounds = E.drawingBounds(cell.entities);
    }
    const map = new Map(cells.map(c => [c.id, c])), gap = 1000;
    const aligned = ['top','front','rear'].map(id => map.get(id));
    const alignedMin = Math.min(...aligned.map(c=>c.bounds.minX));
    const alignedMax = Math.max(...aligned.map(c=>c.bounds.maxX));
    const left = map.get('left'), right = map.get('right');
    const axisOffset = left.bounds.width + gap - alignedMin;
    const W = left.bounds.width + gap + alignedMax-alignedMin + gap + right.bounds.width;
    const lowerH = Math.max(left.bounds.height,map.get('front').bounds.height,right.bounds.height);
    function place(cell, dx, y) {
      const dy=y-cell.bounds.minY, x=cell.bounds.minX+dx;
      entities.push(...cell.entities.map(e => root.PLMRV24Details2D.translate(e,dx,dy)));
      entities.push(text(x+cell.bounds.width/2,y+cell.bounds.height+220,cell.title.split(' · ').map(label=>root.PLMRI18n?.t(label)||label).join(' · '),170,{kind:'view-title',viewId:cell.id}));
      targets.push({id:'roof-view:'+cell.id,kind:'roof-view',title:cell.title,
        axisOrigin:{x:dx,y:dy},bounds:{minX:x-100,minY:y-100,maxX:x+cell.bounds.width+100,maxY:y+cell.bounds.height+420}});
    }
    place(left,-left.bounds.minX,0);
    place(map.get('front'),axisOffset,0);
    place(right,axisOffset+alignedMax+gap-right.bounds.minX,0);
    const plan=map.get('top'), rear=map.get('rear'), planY=lowerH+gap;
    place(plan,axisOffset,planY);
    place(rear,axisOffset,planY+plan.bounds.height+gap);
    const details = root.PLMRV24Details2D.reflow(projection.productDetails, W);
    if (details) {
      const body = E.drawingBounds(entities),
        dy = body.minY - gap - details.bounds.maxY;
      entities.push(text(W / 2, body.minY - 450, [root.PLMRI18n?.t('Cephe Ürünleri')||'Cephe Ürünleri',root.PLMRI18n?.t('Dış Bakış')||'Dış Bakış'].join(' · '), 175, {
        kind: 'detail-heading'
      }));
      entities.push(...details.entities.map(e => root.PLMRV24Details2D.translate(e, 0, dy)));
      for (const p of details.positions) targets.push({
        id: p.id,
        kind: 'facade-detail',
        title: p.positionNo,
        bounds: {
          ...p.cellBounds,
          minY: p.cellBounds.minY + dy,
          maxY: p.cellBounds.maxY + dy
        }
      });
      Object.assign(styles, details.layerStyle);
    }
    for (const [k, v] of Object.entries(E.LAYERS)) if (!styles[v]) styles[v] = {
      ...E.PALETTE[k]
    };
    styles['Bilgilendirme Yazıları'] = {
      aci: 30,
      stroke: '#ff8c00',
      width: .25
    };
    for (const e of entities) if (!styles[e.layer]) styles[e.layer] = {
      ...E.PALETTE.dimension
    };
    const title = root.PLMRV53TitleBlock,
      info = projection.projectInfo,
      project = {
        projectInfo: {
          ...info,
          customerName: info.customerName || info.customer,
          projectName: info.projectName || info.project
        }
      },
      titleLayout = title.layout(project),
      body = E.drawingBounds(entities),
      H = Math.max(7320, body.height + 820, titleLayout.requiredInnerHeight + 120),
      sheetW = title.TITLE_WIDTH + 240 + body.width + 820,
      dx = title.TITLE_WIDTH + 650 - body.minX,
      dy = H - 410 - body.maxY,
      titleBlock = title.build(project, H, titleLayout);
    const drawingEntities = [poly([[60, 60], [sheetW - 60, 60], [sheetW - 60, H - 60], [60, H - 60]], 'Dış Çerçeve'), ...titleBlock.entities, ...entities.map(e => root.PLMRV24Details2D.translate(e, dx, dy))];
    const mode = units.mm && units.inch ? 'dual' : units.inch ? 'inch' : 'mm';
    const output = {
      schema: 'plmr-technical2d-export-drawing-v5',
      units: 'mm',
      modelScale: 1,
      entities: drawingEntities,
      layerStyle: styles,
      layers: Object.keys(styles),
      blocks: {
        'PLMR - LOGO': title.logo()
      },
      titleBlock,
      bounds: {
        minX: 0,
        minY: 0,
        maxX: sheetW,
        maxY: H,
        width: sheetW,
        height: H
      },
      sheetTargets: targets.map(t => ({
        ...t,
        ...(t.axisOrigin ? {axisOrigin:{x:t.axisOrigin.x+dx,y:t.axisOrigin.y+dy}} : {}),
        bounds: {
          minX: t.bounds.minX + dx,
          maxX: t.bounds.maxX + dx,
          minY: t.bounds.minY + dy,
          maxY: t.bounds.maxY + dy
        }
      })),
      metadata: {
        ...options,
        canonical: true,
        dxfProfile: 'V53_R2018',
        dimStyle: E.DIM_STYLES[mode],
        dimensionUnits: units,
        sheetViewCount: 5,
        projection: 'WORLD_ASSEMBLY_TOP_VIEW',
        planTransform:{x:1,z:-1},
        footprints
      }
    };
    root.PLMRCompanyDrawingLogo?.applyCompanyDrawingLogo(output, root.PLMRFinalMetadata?.projectInfo?.drawingLogo);
    return root.PLMRDrawingText.document(output);
  }
  function safeName(info = {}, extension = 'dxf', view = '') {
    const name = String(info.projectCode || 'Proje').replace(/[<>:"/\\|?*\u0000-\u001f]/g, ' ').replace(/\s+/g, ' ').trim().replace(/[. ]+$/, '') || 'Proje';
    const raw = info.revision ?? 'DR00',
      revision = typeof raw === 'number' ? 'DR' + String(raw).padStart(2, '0') : String(raw).replace(/[<>:"/\\|?*\u0000-\u001f]/g, '').trim() || 'DR00';
    return view ? name + '-' + revision + '-' + view + '.' + extension : name + ' - ' + revision + '.' + extension;
  }
  root.PLMRV5RoofSheet = Object.freeze({
    build,
    safeName,
    outerEdges
  });
})(window);
