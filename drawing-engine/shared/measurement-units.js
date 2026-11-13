(function(root,factory){if(typeof module==="object"&&module.exports)factory(module);else{const mod={exports:{}};factory(mod);root.PLMRUnits=mod.exports;}})(typeof window!=="undefined"?window:globalThis,function(module){
"use strict";
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

// domain/positionUnits.ts
var positionUnits_exports = {};
__export(positionUnits_exports, {
  dimensionFromMm: () => dimensionFromMm,
  dimensionToMm: () => dimensionToMm,
  formatMeasurement: () => formatMeasurement,
  inputUnitFromDisplay: () => inputUnitFromDisplay,
  mmPerUnit: () => mmPerUnit,
  positionInputUnit: () => positionInputUnit,
  positionUnits: () => positionUnits,
  validPositionDimension: () => validPositionDimension
});
module.exports = __toCommonJS(positionUnits_exports);
var positionUnits = ["mm", "inch", "ft"];
var mmPerUnit = { mm: 1, inch: 25.4, ft: 304.8 };
var positionInputUnit = (unit, fallback = "mm") => unit === "in" ? "inch" : unit === "mm" || unit === "inch" || unit === "ft" ? unit : fallback === "inch" || fallback === "ft" ? fallback : "mm";
var inputUnitFromDisplay = (u) => u.mm ? "mm" : u.inch ? "inch" : u.ft ? "ft" : "mm";
function formatMeasurement(mm, units = { mm: true }, fallback = true) {
  const parts = positionUnits.flatMap((unit) => units[unit] ? [unit === "mm" ? Math.round(mm) + " mm" : (mm / mmPerUnit[unit]).toFixed(2) + (unit === "inch" ? '"' : " ft")] : []);
  return parts.join(" - ") || (fallback ? Math.round(mm) + " mm" : "");
}
var numeric = (text) => {
  const s = text.trim().replace(",", ".");
  return /^(?:\d+(?:\.\d*)?|\.\d+)$/.test(s) ? Number(s) : NaN;
};
function dimensionFromMm(mm, unit) {
  if (!mm.trim() || unit === "mm") return mm;
  const number = numeric(mm);
  return Number.isFinite(number) ? String(Number((number / mmPerUnit[unit]).toFixed(10))) : mm;
}
function dimensionToMm(text, unit) {
  if (!text.trim()) return "";
  const number = numeric(text);
  return Number.isFinite(number) ? String(Number((number * mmPerUnit[unit]).toFixed(6))) : text;
}
function validPositionDimension(text, max = 5e3) {
  const value = numeric(text);
  return Number.isFinite(value) && value > 0 && value <= max;
}

});
