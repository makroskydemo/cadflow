"use strict";
var PLMRProjectLayout = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // engines/projectLayout.ts
  var projectLayout_exports = {};
  __export(projectLayout_exports, {
    PROJECT_ZOOM_POLICIES: () => PROJECT_ZOOM_POLICIES,
    layoutProjectCells: () => layoutProjectCells,
    layoutProjectGroups: () => layoutProjectGroups,
    positionKey: () => positionKey,
    projectPositions: () => projectPositions,
    reconcileProjectOrder: () => reconcileProjectOrder
  });
  var positionKey = (product, id) => `${product}:${id}`;
  function projectPositions(workspaces, order = []) {
    const entries = Object.entries(workspaces).flatMap(([product, ws]) => (ws.positions || []).filter((p) => !p.hidden).map((position) => ({ key: positionKey(product, position.id), product, position })));
    const rank = new Map(order.map((key, index) => [key, index]));
    return entries.sort((a, b) => {
      const ar = rank.get(a.key), br = rank.get(b.key);
      if (ar !== void 0 || br !== void 0) return (ar ?? Infinity) - (br ?? Infinity);
      return String(a.position.positionNo).localeCompare(String(b.position.positionNo), "tr", { numeric: true });
    });
  }
  function reconcileProjectOrder(workspaces, order = []) {
    const entries = projectPositions(workspaces, order), byKey = new Map(entries.map((e) => [e.key, e])), seen = /* @__PURE__ */ new Set();
    const result = order.filter((key) => byKey.has(key) && !seen.has(key) && Boolean(seen.add(key)));
    for (const [product, ws] of Object.entries(workspaces)) {
      const local = ws.positions.map((p) => positionKey(product, p.id)).filter((key) => seen.has(key));
      let cursor = 0;
      for (let i = 0; i < result.length; i++) if (byKey.get(result[i])?.product === product) result[i] = local[cursor++];
    }
    result.push(...entries.filter((e) => !seen.has(e.key)).map((e) => e.key));
    return result;
  }
  function layoutProjectCells(cells, requestedColumns, gapX = 520, gapY = 460) {
    const columns = Math.max(1, Math.min(10, cells.length || 1, Math.trunc(requestedColumns) || 2)), widths = [], heights = [];
    cells.forEach((cell, i) => {
      widths[i % columns] = Math.max(widths[i % columns] || 0, cell.width);
      heights[Math.floor(i / columns)] = Math.max(heights[Math.floor(i / columns)] || 0, cell.height);
    });
    const starts = (sizes, gap) => sizes.map((_, i) => sizes.slice(0, i).reduce((sum, n) => sum + n + gap, 0));
    const xs = starts(widths, gapX), ys = starts(heights, gapY);
    return {
      columns,
      width: widths.reduce((a, b) => a + b, 0) + Math.max(0, widths.length - 1) * gapX,
      height: heights.reduce((a, b) => a + b, 0) + Math.max(0, heights.length - 1) * gapY,
      cells: cells.map((cell, i) => ({ ...cell, row: Math.floor(i / columns), column: i % columns, x: xs[i % columns], top: ys[Math.floor(i / columns)] }))
    };
  }
  function layoutProjectGroups(root, workspaces, layout) {
    const ordered = projectPositions(workspaces, layout.positionOrder), groups = /* @__PURE__ */ new Map();
    root.position.set(0, 0, 0);
    for (const group of root.children) {
      group.position.set(0, 0, 0);
      for (const position of group.children) groups.set(positionKey(group.userData.product, position.userData.positionId), position);
    }
    const available = ordered.filter((e) => groups.has(e.key));
    const grid = layoutProjectCells(available.map((e) => ({ key: e.key, width: Number(e.position.width) + 440, height: Number(e.position.height) + 500 })), layout.columns, 260, 260);
    for (const cell of grid.cells) {
      const node = groups.get(cell.key), entry = available.find((e) => e.key === cell.key);
      node.position.set(cell.x - grid.width / 2 + 220 + Number(entry.position.width) / 2, grid.height / 2 - cell.top - 250 - Number(entry.position.height), 0);
      node.userData.projectLayout = { key: cell.key, row: cell.row, column: cell.column };
    }
    root.userData.projectOrder = grid.cells.map((c) => c.key);
    root.userData.projectLayout = grid;
    root.updateMatrixWorld(true);
    return root;
  }
  var PROJECT_ZOOM_POLICIES = {
    Giyotin: { positionPadding: 220, closestPositionScale: 1, maxZoom: 40 },
    "S\xFCrme": { positionPadding: 220, closestPositionScale: 1, maxZoom: 40 },
    default: { positionPadding: 260, closestPositionScale: 1, maxZoom: 40 }
  };
  return __toCommonJS(projectLayout_exports);
})();
