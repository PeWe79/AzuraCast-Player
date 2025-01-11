/**
 * Vue custom filters
 */

export default {
  toCommas(num, decimals) {
    let o = { style: 'decimal', minimumFractionDigits: decimals, maximumFractionDigits: decimals };
    return new Intl.NumberFormat('en-US', o).format(num);
  },

  toText(str, def) {
    str = String(str || '').replace(/[^\w\`\'\-\,\.\!\?]+/g, ' ').replace(/\s\s+/g, ' ').trim();
    return str || String(def || '');
  },
}
