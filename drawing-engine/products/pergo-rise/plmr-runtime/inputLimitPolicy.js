(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.PulumurInputLimitPolicy = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const DEFAULT_POST_WIDTH_MM = 100;

  function integer(value, fallback) {
    const parsed = Math.round(Number(value));
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function maxDigits(value, fallback) {
    return Math.max(1, integer(value, fallback || 1));
  }

  function filterTokenInput(value, options) {
    const opts = options || {};
    const digitLimit = maxDigits(opts.maxDigits, 1);
    const allowNo = opts.allowNo === true;
    const allowColon = opts.allowColon === true;
    const source = String(value == null ? '' : value).toLocaleUpperCase('tr-TR');
    let output = '';
    let tokenDigits = 0;
    for (const char of source) {
      if (/[0-9]/.test(char)) {
        if (tokenDigits < digitLimit) {
          output += char;
          tokenDigits += 1;
        }
        continue;
      }
      if (char === ';' || (allowColon && char === ':')) {
        output += char;
        tokenDigits = 0;
        continue;
      }
      if (allowNo && (char === 'N' || char === 'O')) output += char;
    }
    return output;
  }

  function numericTokenStrings(value) {
    return String(value == null ? '' : value)
      .toLocaleUpperCase('tr-TR')
      .split(/[;:]/)
      .map(token => token.trim())
      .filter(token => token && token !== 'NO')
      .map(token => token.replace(/[^0-9]/g, ''))
      .filter(Boolean);
  }

  function firstDigitViolation(value, limit) {
    const cap = maxDigits(limit, 1);
    const tokens = numericTokenStrings(value);
    const index = tokens.findIndex(token => token.length > cap);
    return index < 0 ? null : { index, token: tokens[index], digits: tokens[index].length, limit: cap };
  }

  function maxPostsForWidth(totalWidth, minimumClearSpacing, postWidth) {
    const width = Math.max(0, Number(totalWidth) || 0);
    const clear = Math.max(0, Number(minimumClearSpacing) || 0);
    const profile = Math.max(1, Number(postWidth) || DEFAULT_POST_WIDTH_MM);
    if (width < profile) return 0;
    return Math.max(1, Math.floor((width + clear) / (profile + clear)));
  }

  function clearSpacingForPosts(totalWidth, postCount, postWidth) {
    const width = Math.max(0, Number(totalWidth) || 0);
    const count = Math.max(0, Math.round(Number(postCount) || 0));
    const profile = Math.max(1, Number(postWidth) || DEFAULT_POST_WIDTH_MM);
    if (count <= 1) return Infinity;
    return (width - count * profile) / (count - 1);
  }

  return Object.freeze({
    DEFAULT_POST_WIDTH_MM,
    filterTokenInput,
    numericTokenStrings,
    firstDigitViolation,
    maxPostsForWidth,
    clearSpacingForPosts
  });
});
