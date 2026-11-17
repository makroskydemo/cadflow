"use strict";
var PLMRProjectDate = (() => {
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

  // utils/projectDate.ts
  var projectDate_exports = {};
  __export(projectDate_exports, {
    displayProjectDate: () => displayProjectDate,
    projectDate: () => projectDate
  });
  function projectDate(value) {
    if (value instanceof Date) return Number.isFinite(value.getTime()) ? value : null;
    const raw = String(value || "").trim();
    if (!raw) return null;
    const legacy = raw.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2,4})(?:[, ]+(\d{1,2}):(\d{2})(?::\d{2})?)?$/);
    if (legacy) {
      const [, d, m, y, h = "0", min = "0"] = legacy;
      const year = Number(y) < 100 ? 2e3 + Number(y) : Number(y);
      const date2 = new Date(year, Number(m) - 1, Number(d), Number(h), Number(min));
      return date2.getFullYear() === year && date2.getMonth() === Number(m) - 1 && date2.getDate() === Number(d) && Number(h) < 24 && Number(min) < 60 ? date2 : null;
    }
    if (!/^\d{4}-\d{2}-\d{2}(?:T|$)/.test(raw)) return null;
    const date = new Date(raw);
    return Number.isFinite(date.getTime()) ? date : null;
  }
  function displayProjectDate(value, locale = "tr-TR", includeTime = true) {
    const date = projectDate(value);
    if (!date) return String(value || "\u2014");
    return new Intl.DateTimeFormat(locale, { day: "2-digit", month: "2-digit", year: "numeric", ...includeTime ? { hour: "2-digit", minute: "2-digit" } : {} }).format(date).replace(", ", " ");
  }
  return __toCommonJS(projectDate_exports);
})();
