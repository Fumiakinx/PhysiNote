// ==========================================
// PhysiNote SVG 共通ユーティリティ (svg-utils.js)
// ==========================================

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * 統一されたSVGルート要素を生成する
 * @param {string} viewBox - 'minX minY width height'
 * @param {number|string} maxWidth - CSS maxWidth (例: 760 または '760px')
 * @param {Object} options - 追加設定 { className, overflow, display }
 * @returns {SVGSVGElement}
 */
function createSvgRoot(viewBox, maxWidth, options = {}) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  if (viewBox) svg.setAttribute('viewBox', viewBox);
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');

  if (maxWidth) {
    const mwStr = typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth;
    svg.style.maxWidth = mwStr;
  }
  svg.style.display = options.display || 'block';
  svg.style.margin = '0 auto';
  if (options.overflow) svg.style.overflow = options.overflow;
  if (options.className) svg.setAttribute('class', options.className);

  return svg;
}

/**
 * 統一されたダイアグラム下部ラベルをコンテナに追加する
 * @param {HTMLElement} container
 * @param {string} labelText
 */
function appendDiagramLabel(container, labelText) {
  if (!labelText || !container) return;
  const lbl = document.createElement('div');
  lbl.className = 'chem-structure-label';
  lbl.textContent = labelText;
  container.appendChild(lbl);
}

/**
 * SVG名前空間付きの子要素を生成し属性を設定する
 * @param {string} tag
 * @param {Object} attrs
 * @returns {SVGElement}
 */
function createSvgElement(tag, attrs = {}) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [key, val] of Object.entries(attrs)) {
    if (val !== undefined && val !== null) {
      el.setAttribute(key, String(val));
    }
  }
  return el;
}

/**
 * <defs> に矢印マーカーを追加する
 * @param {SVGDefsElement} defs
 * @param {string} id
 * @param {string} color
 * @param {Object} options - { refX, refY, width, height, orient, d }
 */
function createSvgArrowMarker(defs, id, color = '#64748b', options = {}) {
  const marker = createSvgElement('marker', {
    id: id,
    viewBox: '0 0 10 10',
    refX: options.refX ?? 7,
    refY: options.refY ?? 5,
    markerWidth: options.width ?? 6,
    markerHeight: options.height ?? 6,
    orient: options.orient || 'auto-start-reverse'
  });
  const path = createSvgElement('path', {
    d: options.d || 'M 0 1.5 L 9 5 L 0 8.5 z',
    fill: color
  });
  marker.appendChild(path);
  defs.appendChild(marker);
  return marker;
}

/**
 * 複数色・サイズ指定の矢印マーカーを <defs> に一括登録する
 * @param {SVGDefsElement} defs
 * @param {Array<{ id: string, color?: string, refX?: number, refY?: number, width?: number, height?: number, orient?: string, d?: string }>} specs
 */
function registerSvgArrowMarkers(defs, specs = []) {
  if (!defs || !Array.isArray(specs)) return;
  specs.forEach((s) => {
    createSvgArrowMarker(defs, s.id, s.color || '#64748b', s);
  });
}

/**
 * パス文字列または直線座標から統一スタイルのSVG接続線を描画し親要素へ追加する
 * @param {SVGElement} parent
 * @param {string|{ x1: number, y1: number, x2: number, y2: number }} geom
 * @param {Object} [options] - { stroke, strokeWidth, dasharray, linecap, linejoin, markerStart, markerEnd, fill }
 * @returns {SVGElement}
 */
function drawSvgConnector(parent, geom, options = {}) {
  const isLine = geom && typeof geom === 'object';
  const attrs = {
    fill: options.fill || 'none',
    stroke: options.stroke || '#64748b',
    'stroke-width': options.strokeWidth ?? '1.8',
    'stroke-linecap': options.linecap || 'round',
    'stroke-linejoin': options.linejoin || 'round'
  };
  if (isLine) {
    attrs.x1 = geom.x1;
    attrs.y1 = geom.y1;
    attrs.x2 = geom.x2;
    attrs.y2 = geom.y2;
  } else {
    attrs.d = geom;
  }
  if (options.dasharray) attrs['stroke-dasharray'] = options.dasharray;
  if (options.markerStart) attrs['marker-start'] = `url(#${options.markerStart})`;
  if (options.markerEnd) attrs['marker-end'] = `url(#${options.markerEnd})`;
  const el = createSvgElement(isLine ? 'line' : 'path', attrs);
  if (parent) parent.appendChild(el);
  return el;
}

/**
 * 文字列の概算描画幅(px)を算出する（英大文字・英小文字・全角対応）
 * @param {string} str
 * @param {number} [fontSize=12]
 * @param {boolean} [isBold=false]
 * @returns {number}
 */
function estimateSvgTextWidth(str, fontSize = 12, isBold = false) {
  if (!str) return 0;
  const s = String(str);
  const scale = fontSize / 12;
  const boldMul = isBold ? 1.06 : 1;
  let w = 0;
  for (let i = 0; i < s.length; i++) {
    const code = s.charCodeAt(i);
    if (code > 255) {
      w += 12;
    } else if (code >= 65 && code <= 90) {
      w += 8.2;
    } else {
      w += 6.5;
    }
  }
  return w * scale * boldMul;
}

/**
 * 全角=2、半角=1として文字列の表示単位長を返す
 * @param {string} str
 * @returns {number}
 */
function getTextDisplayUnits(str) {
  if (!str) return 0;
  const s = String(str);
  let units = 0;
  for (let i = 0; i < s.length; i++) {
    units += s.charCodeAt(i) > 255 ? 2 : 1;
  }
  return units;
}

/**
 * 日本語区切り・開き括弧・禁則処理を考慮してテキストを複数行に自動折り返しする
 * @param {string} text
 * @param {number} maxWidth
 * @param {number} [fontSize=12]
 * @param {Object} [options] - { isBold, safety, extraPrevChars, beforeKeywords, emptyLine, measure }
 * @returns {string[]}
 */
function wrapSvgTextLines(text, maxWidth, fontSize = 12, options = {}) {
  if (!text) return options.emptyLine ? [''] : [];
  const isBold = Boolean(options.isBold);
  const safety = options.safety || 1;
  const measure = typeof options.measure === 'function'
    ? options.measure
    : (s) => estimateSvgTextWidth(s, fontSize, isBold) * safety;
  const extraPrevChars = options.extraPrevChars || '';
  const beforeKeywords = Array.isArray(options.beforeKeywords) ? options.beforeKeywords : null;
  const out = [];

  String(text).replace(/\\n/g, '\n').split('\n').forEach((para) => {
    const t = para.trim();
    if (!t) return;
    if (measure(t) <= maxWidth) {
      out.push(t);
      return;
    }
    let rest = t;
    while (rest.length > 0) {
      if (measure(rest) <= maxWidth) {
        out.push(rest);
        break;
      }
      let fitLen = 1;
      for (let i = 1; i <= rest.length; i++) {
        if (measure(rest.slice(0, i)) > maxWidth) {
          fitLen = Math.max(1, i - 1);
          break;
        }
        fitLen = i;
      }
      let brk = -1;
      const minL = Math.max(2, Math.floor(fitLen * 0.4));
      for (let j = fitLen; j >= minL; j--) {
        const prev = rest[j - 1];
        const cur = rest[j] || '';
        if (
          prev === '/' || prev === '／' || prev === '、' || prev === '・' ||
          prev === ' ' || prev === '　' || prev === ')' || prev === '）' ||
          (extraPrevChars && extraPrevChars.includes(prev)) ||
          cur === '（' || cur === '(' || cur === '[' || cur === '【' || cur === '「'
        ) {
          brk = j;
          break;
        }
      }
      if (brk === -1 && beforeKeywords) {
        for (const kw of beforeKeywords) {
          const idx = rest.lastIndexOf(kw, fitLen);
          if (idx >= minL && idx <= fitLen) {
            brk = idx;
            break;
          }
        }
      }
      if (brk <= 0) {
        brk = fitLen;
        while (brk > minL && /^[）)\]】」」、。.,]/.test(rest[brk] || '')) {
          brk--;
        }
        if (rest.length - brk === 1 && brk > minL) {
          brk--;
        }
      }
      const chunk = rest.slice(0, brk).trimEnd();
      if (chunk) out.push(chunk);
      rest = rest.slice(brk).trimStart();
    }
  });

  if (out.length === 0 && options.emptyLine) return [''];
  return out;
}

/**
 * 長大タイトルを収容幅に合わせてフォント縮小・必要時2行折り返しする
 * @param {string} titleText
 * @param {number} maxWidth
 * @param {number} [defaultSize=16.5]
 * @param {number} [minSingleLineSize=13.0]
 * @returns {{ lines: string[], fontSize: number }}
 */
function layoutSvgTitleLines(titleText, maxWidth, defaultSize = 16.5, minSingleLineSize = 13.0) {
  const raw = String(titleText || '').trim();
  if (!raw) return { lines: [], fontSize: defaultSize };

  const estBold = (s, fs) => estimateSvgTextWidth(s, fs, true) * 1.03;
  const wDefault = estBold(raw, defaultSize);
  if (wDefault <= maxWidth) {
    return { lines: [raw], fontSize: defaultSize };
  }

  const scaled = defaultSize * (maxWidth / wDefault);
  if (scaled >= minSingleLineSize) {
    return { lines: [raw], fontSize: Math.floor(scaled * 10) / 10 };
  }

  let wrapFs = Math.max(minSingleLineSize, defaultSize - 1.5);
  const midIdx = Math.floor(raw.length / 2);
  let bestSplit = -1;
  let bestDist = Infinity;
  for (let i = 4; i < raw.length - 4; i++) {
    const ch = raw[i];
    const prev = raw[i - 1];
    if (ch === ' ' || ch === '　' || ch === '（' || ch === '(' || prev === '・' || prev === '/' || prev === '：') {
      const splitAt = (ch === ' ' || ch === '　') ? i + 1 : i;
      const d = Math.abs(splitAt - midIdx);
      if (d < bestDist) {
        bestDist = d;
        bestSplit = splitAt;
      }
    }
  }
  const splitPos = bestSplit > 0 ? bestSplit : midIdx;
  const lines = [raw.slice(0, splitPos).trim(), raw.slice(splitPos).trim()].filter(Boolean);
  const longestW = Math.max(...lines.map((ln) => estBold(ln, wrapFs)));
  if (longestW > maxWidth) {
    wrapFs = Math.max(11.0, Math.floor((wrapFs * (maxWidth / longestW)) * 10) / 10);
  }
  return { lines, fontSize: wrapFs };
}

/**
 * タイトル文字列を自動縮小・折り返ししてSVG要素へ描画する
 * @param {SVGElement} parent
 * @param {string} titleText
 * @param {number} maxWidth
 * @param {Object} [options] - { layout, x, y, singleY, multiY, lineGap, fontSize, minFontSize, fill, anchor, fontWeight, fontFamily }
 * @returns {{ lines: string[], fontSize: number }}
 */
function renderAutoFitSvgTitle(parent, titleText, maxWidth, options = {}) {
  const defaultSize = options.fontSize || 16.5;
  const minSize = options.minFontSize || 12.5;
  const layout = options.layout || layoutSvgTitleLines(titleText, maxWidth, defaultSize, minSize);
  if (!parent || !layout.lines || layout.lines.length === 0) return layout;

  const isMulti = layout.lines.length > 1;
  const baseY = isMulti ? (options.multiY ?? ((options.y ?? 30) - 8)) : (options.singleY ?? options.y ?? 30);
  const lineGap = options.lineGap || Math.round(layout.fontSize * 1.25);

  layout.lines.forEach((ln, idx) => {
    const tEl = createSvgElement('text', {
      x: options.x ?? 0,
      y: baseY + idx * lineGap,
      'text-anchor': options.anchor || 'middle',
      'font-size': layout.fontSize,
      'font-weight': options.fontWeight || '700',
      fill: options.fill || '#0f172a',
      'font-family': options.fontFamily || 'sans-serif'
    });
    tEl.textContent = ln;
    parent.appendChild(tEl);
  });
  return layout;
}

/**
 * 引用符（"..." / '...'）内のカンマを保持したままCSV分割する
 * @param {string} str
 * @param {boolean} [stripOuterQuotes=false]
 * @returns {string[]}
 */
function splitCsvRespectQuotes(str, stripOuterQuotes = false) {
  const res = [];
  let cur = '';
  let q = null;
  const s = String(str || '');
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (q) {
      cur += ch;
      if (ch === q && s[i - 1] !== '\\') q = null;
    } else if (ch === '"' || ch === "'") {
      q = ch;
      cur += ch;
    } else if (ch === ',') {
      res.push(cur.trim());
      cur = '';
    } else {
      cur += ch;
    }
  }
  if (cur.trim()) res.push(cur.trim());
  return stripOuterQuotes ? res.map((p) => p.replace(/^["']|["']$/g, '').trim()) : res;
}

