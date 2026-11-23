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
 * 全角=2、半角(ASCII・半角カナ)=1として文字列の表示単位長を返す
 * @param {string} str
 * @returns {number}
 */
function getTextDisplayUnits(str) {
  if (!str) return 0;
  const s = String(str);
  let units = 0;
  for (let i = 0; i < s.length; i++) {
    const code = s.charCodeAt(i);
    units += (code <= 0x00FF || (code >= 0xFF61 && code <= 0xFF9F)) ? 1 : 2;
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

/**
 * 指定したURLまたはDataURLのファイルをブラウザからダウンロードさせる
 * @param {string} href
 * @param {string} fileName
 */
function triggerFileDownload(href, fileName) {
  const link = document.createElement('a');
  link.href = href;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * 財務サンキー（B/S・P/L）のブラケット属性 [...] を解析する共通パーサー
 * @param {string} bracketStr
 * @param {Object} [options] - { supportHighlight }
 * @returns {Object}
 */
function parseSankeyBracketProps(bracketStr, options = {}) {
  const supportHighlight = Boolean(options.supportHighlight);
  const empty = supportHighlight
    ? { value: null, percent: null, color: null, side: null, highlight: false }
    : { value: null, percent: null, color: null, side: null };
  if (!bracketStr) return empty;

  const parts = bracketStr.split(',').map((p) => p.trim()).filter(Boolean);
  let value = null;
  let percent = null;
  let color = null;
  let side = null;
  let highlight = false;

  parts.forEach((p) => {
    if (supportHighlight && /^(highlight|強調)$/i.test(p)) {
      highlight = true;
    } else if (/^-?[\d,]+(?:\.\d+)?%$/.test(p)) {
      percent = p;
    } else if (/^-?[\d,]+(?:\.\d+)?$/.test(p)) {
      value = parseFloat(p.replace(/,/g, ''));
    } else if (/^(above|below|left|right)$/i.test(p)) {
      side = p.toLowerCase();
    } else if (/^#[0-9a-fA-F]{3,8}$/.test(p) || /^[a-zA-Z]+$/.test(p)) {
      color = p;
    }
  });

  if (supportHighlight) {
    if (highlight && !color) color = '#ef4444';
    return { value, percent, color, side, highlight };
  }
  return { value, percent, color, side };
}

/**
 * 財務サンキー（B/S・P/L）のメタ情報行（company / code / period / unit / consolidated / title / subtitle / note）を解析する
 * @param {string} line
 * @param {Object} meta
 * @returns {boolean} 一致して格納した場合 true
 */
function parseFinancialMetaLine(line, meta) {
  const textFields = [
    ['company', /^(?:company|企業名)\s*:\s*(?:"([^"\n]+)"|'([^'\n]+)'|([^;"'\n]+))/i],
    ['code', /^(?:code|証券番号|証券コード)\s*:\s*(?:"([^"\n]+)"|'([^'\n]+)'|([^;"'\n]+))/i],
    ['period', /^(?:period|決算期)\s*:\s*(?:"([^"\n]+)"|'([^'\n]+)'|([^;"'\n]+))/i],
    ['unit', /^(?:unit|単位)\s*:\s*(?:"([^"\n]+)"|'([^'\n]+)'|([^;"'\n]+))/i],
    ['title', /^title\s*:\s*(?:"([^"\n]+)"|'([^'\n]+)'|([^;"'\n]+))/i],
    ['subtitle', /^subtitle\s*:\s*(?:"([^"\n]+)"|'([^'\n]+)'|([^;"'\n]+))/i],
    ['note', /^note\s*:\s*(?:"([^"\n]+)"|'([^'\n]+)'|([^;"'\n]+))/i]
  ];
  for (const [key, regex] of textFields) {
    const m = line.match(regex);
    if (m) {
      meta[key] = (m[1] || m[2] || m[3] || '').trim();
      return true;
    }
  }
  const mCons = line.match(/^(?:consolidated|連結)\s*:\s*(true|false|1|0|有|無|単体)?/i);
  if (mCons) {
    const val = (mCons[1] || '').toLowerCase();
    meta.consolidated = !(val === 'false' || val === '0' || val === '無' || val === '単体');
    return true;
  }
  return false;
}

/**
 * ノード側面に集まる複数エッジの接続ポートYオフセットを進入高さ順に分散割り当てする
 * @param {Array<{ key: any, approachY: number, priority?: number }>} items
 * @param {number} hostCenter - 接続対象ノードの中心Y座標
 * @param {Object} [options] - { mode: 'in'|'out', levelTol }
 * @returns {Map<any, number>} key -> Yオフセット(px)
 */
function assignNodeSidePortOffsets(items, hostCenter, options = {}) {
  const offsets = new Map();
  if (!Array.isArray(items) || items.length <= 1) return offsets;

  const mode = options.mode || 'in';
  const levelTol = options.levelTol ?? 4;
  const sorted = [...items].sort((a, b) =>
    (a.approachY - b.approachY) || ((a.priority ?? 0) - (b.priority ?? 0))
  );

  if (mode === 'out') {
    const sameItems = sorted.filter((it) => Math.abs(it.approachY - hostCenter) <= levelTol);
    if (sorted.length === 2 && sameItems.length === 1) {
      const sameItem = sameItems[0];
      const otherItem = sorted.find((it) => it !== sameItem);
      offsets.set(sameItem.key, 0);
      offsets.set(otherItem.key, otherItem.approachY < hostCenter ? -16 : 16);
      return offsets;
    }
    const span = Math.min(36, (sorted.length - 1) * 20);
    sorted.forEach((it, pos) => {
      offsets.set(it.key, -span / 2 + (pos * span) / (sorted.length - 1));
    });
    return offsets;
  }

  const uppers = sorted.filter((it) => it.approachY < hostCenter - levelTol);
  const sames = sorted.filter((it) => Math.abs(it.approachY - hostCenter) <= levelTol);
  const lowers = sorted.filter((it) => it.approachY > hostCenter + levelTol);

  if (sames.length === 2 && uppers.length > 0 && lowers.length === 0) {
    const uStep = uppers.length > 1 ? 18 / (uppers.length - 1) : 0;
    uppers.forEach((it, i) => offsets.set(it.key, -38 + i * uStep));
    sames.forEach((it, i) => offsets.set(it.key, i === 0 ? 6 : 46));
  } else if (sames.length === 1 && uppers.length >= 1 && lowers.length === 0) {
    const uStep = uppers.length > 1 ? 18 / (uppers.length - 1) : 0;
    uppers.forEach((it, i) => offsets.set(it.key, -36 + i * uStep));
    offsets.set(sames[0].key, 0);
  } else if (sames.length === 1 && lowers.length >= 1 && uppers.length === 0) {
    offsets.set(sames[0].key, 0);
    const lStep = lowers.length > 1 ? 18 / (lowers.length - 1) : 0;
    lowers.forEach((it, i) => offsets.set(it.key, 18 + i * lStep));
  } else if (sames.length === 1 && uppers.length > 0 && lowers.length > 0 && uppers.length !== lowers.length) {
    const uStep = uppers.length > 1 ? 20 / (uppers.length - 1) : 0;
    uppers.forEach((it, i) => offsets.set(it.key, -38 + i * uStep));
    offsets.set(sames[0].key, 0);
    const lStep = lowers.length > 1 ? 20 / (lowers.length - 1) : 0;
    lowers.forEach((it, i) => offsets.set(it.key, 18 + i * lStep));
  } else {
    const span = Math.min(64, (sorted.length - 1) * 26);
    sorted.forEach((it, pos) => {
      offsets.set(it.key, -span / 2 + (pos * span) / (sorted.length - 1));
    });
  }
  return offsets;
}

/**
 * 同一列間ギャップを通る複数エッジの垂直幹レーン順を交差最小化のため整列する
 * @param {Array<number>} edgeIndices
 * @param {(edgeIdx: number) => { sy: number, ty: number }} getYs
 */
function sortOrthogonalGapLaneIndices(edgeIndices, getYs) {
  if (!Array.isArray(edgeIndices) || edgeIndices.length <= 1) return edgeIndices;
  return edgeIndices.sort((aIdx, bIdx) => {
    const pa = getYs(aIdx);
    const pb = getYs(bIdx);
    const dyA = pa.ty - pa.sy;
    const dyB = pb.ty - pb.sy;
    if (dyA * dyB > 0) {
      // 同一始点（またはほぼ同高さ）の同方向分岐は、より遠い終点へ伸びる線を手前（先順位）へ配置して交差を防止
      if (Math.abs(pa.sy - pb.sy) < 4) {
        return dyA < 0 ? (pa.ty - pb.ty) : (pb.ty - pa.ty);
      }
      return dyA < 0 ? (pb.sy - pa.sy) : (pa.sy - pb.sy);
    }
    if (Math.abs(pa.sy - pb.sy) < 4) {
      return dyA - dyB;
    }
    return pa.sy - pb.sy;
  });
}

/**
 * 2点間の直交クランク／迂回パスとラベル基準座標を生成する
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @param {Object} [options] - { orientation: 'H'|'V', midX, midY, bypassY, lane1X, lane2X, tol }
 * @returns {{ d: string, anchorX: number, anchorY: number }}
 */
function buildOrthogonalEdgePath(x1, y1, x2, y2, options = {}) {
  const tol = options.tol ?? 2;
  if (options.bypassY != null && options.lane1X != null && options.lane2X != null) {
    const isRev = x2 < x1;
    const lx = isRev ? x2 : x1;
    const rx = isRev ? x1 : x2;
    const sy = isRev ? y2 : y1;
    const ey = isRev ? y1 : y2;
    const by = options.bypassY;
    const l1 = options.lane1X;
    const l2 = options.lane2X;
    return {
      d: `M ${lx} ${sy} L ${l1} ${sy} L ${l1} ${by} L ${l2} ${by} L ${l2} ${ey} L ${rx} ${ey}`,
      anchorX: Math.round((l1 + l2) / 2),
      anchorY: by
    };
  }

  if (options.orientation === 'V') {
    const midY = options.midY ?? ((y1 + y2) / 2);
    const isStraight = Math.abs(x1 - x2) < tol;
    return {
      d: isStraight ? `M ${x1} ${y1} L ${x2} ${y2}` : `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`,
      anchorX: (x1 + x2) / 2,
      anchorY: midY
    };
  }

  const midX = options.midX ?? Math.round((x1 + x2) / 2);
  const isStraight = Math.abs(y1 - y2) < tol;
  return {
    d: isStraight ? `M ${x1} ${y1} L ${x2} ${y2}` : `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`,
    anchorX: isStraight ? Math.round((x1 + x2) / 2) : midX,
    anchorY: isStraight ? y1 : (y1 + y2) / 2
  };
}

/**
 * 線上の意味ラベルピル（白背景角丸枠＋複数行テキスト＋2D重なり回避）をSVG描画する
 * @param {SVGElement} parent
 * @param {number} x - 基準X座標（既定は中心、alignX='left'時は左端）
 * @param {number} y - 基準Y座標（既定は中心、alignY='bottom'時は下端）
 * @param {string|string[]} linesOrText
 * @param {Object} [options]
 * @returns {{ group: SVGGElement, box: { x: number, y: number, w: number, h: number }, centerX: number, centerY: number, lines: string[] }|null}
 */
function drawSvgEdgeBadge(parent, x, y, linesOrText, options = {}) {
  const fontSize = options.fontSize ?? 10;
  const lineHeight = options.lineHeight ?? 13;
  const isBold = Boolean(options.isBold);

  let lines;
  if (Array.isArray(linesOrText)) {
    lines = linesOrText.map((s) => String(s || '').trim()).filter(Boolean);
  } else {
    const raw = String(linesOrText || '').trim();
    if (!raw) return null;
    if (options.wrapWidth) {
      lines = wrapSvgTextLines(raw, options.wrapWidth, fontSize, {
        isBold,
        safety: options.wrapSafety ?? 1.05
      });
    } else {
      lines = raw.split(/\\n|[¥￥]n|\n/).map((s) => s.trim()).filter(Boolean);
    }
  }
  if (!lines || lines.length === 0) return null;

  const maxLineW = Math.max(...lines.map((ln) => estimateSvgTextWidth(ln, fontSize, isBold)));
  const isMulti = lines.length > 1;
  const padX = isMulti ? (options.multiPadX ?? options.padX ?? 16) : (options.padX ?? 16);
  const w = Math.max(options.minWidth ?? 40, Math.ceil(maxLineW + padX));
  const h = isMulti ? (lines.length * lineHeight + (options.multiPadY ?? 8)) : (options.singleHeight ?? 19);

  let cx = options.alignX === 'left' ? (x + w / 2) : x;
  if (Array.isArray(options.fitRangeX) && options.fitRangeX.length > 0) {
    const ranges = Array.isArray(options.fitRangeX[0]) ? options.fitRangeX : [options.fitRangeX];
    for (const [minBound, maxBound] of ranges) {
      if (maxBound - minBound >= w) {
        cx = Math.max(minBound + w / 2, Math.min(maxBound - w / 2, cx));
        break;
      }
    }
  }
  let cy = options.alignY === 'bottom' ? (y - h / 2) : (options.alignY === 'top' ? (y + h / 2) : y);

  const placedBoxes = Array.isArray(options.placedBoxes) ? options.placedBoxes : null;
  if (placedBoxes) {
    const avoidPad = options.avoidPad ?? 4;
    const step = options.avoidStep ?? 16;
    const maxStep = options.avoidMax ?? 96;
    const overlaps = (a, b) => !(a.x + a.w + avoidPad <= b.x || b.x + b.w + avoidPad <= a.x || a.y + a.h + avoidPad <= b.y || b.y + b.h + avoidPad <= a.y);
    const makeBox = (candY) => ({ x: cx - w / 2, y: candY - h / 2, w, h });
    if (placedBoxes.some((pb) => overlaps(pb, makeBox(cy)))) {
      for (let d = step; d <= maxStep; d += step) {
        if (!placedBoxes.some((pb) => overlaps(pb, makeBox(cy - d)))) {
          cy -= d;
          break;
        }
        if (!placedBoxes.some((pb) => overlaps(pb, makeBox(cy + d)))) {
          cy += d;
          break;
        }
      }
    }
  }

  const box = { x: cx - w / 2, y: cy - h / 2, w, h };
  if (placedBoxes) placedBoxes.push(box);

  const g = createSvgElement('g');
  const rect = createSvgElement('rect', {
    x: box.x.toFixed(1),
    y: box.y.toFixed(1),
    width: w.toFixed(1),
    height: h.toFixed(1),
    rx: isMulti ? (options.rxMulti ?? 6) : (options.rx ?? 9.5),
    fill: options.bgFill ?? '#ffffff',
    stroke: options.stroke ?? '#cbd5e1',
    'stroke-width': options.strokeWidth ?? '1.2'
  });
  if (options.bgOpacity != null) rect.setAttribute('fill-opacity', String(options.bgOpacity));
  if (options.ry != null) rect.setAttribute('ry', String(options.ry));
  g.appendChild(rect);

  const textDy = options.textDy ?? 3.8;
  const startY = cy - ((lines.length - 1) * lineHeight) / 2 + textDy;
  lines.forEach((ln, idx) => {
    const fs = idx === 0 ? fontSize : (options.subFontSize ?? fontSize);
    const fw = idx === 0 ? (options.fontWeight ?? '600') : (options.subFontWeight ?? options.fontWeight ?? '600');
    const col = idx === 0 ? (options.fill ?? '#475569') : (options.subFill ?? options.fill ?? '#475569');
    const tEl = createSvgElement('text', {
      x: cx.toFixed(1),
      y: (startY + idx * lineHeight).toFixed(1),
      'text-anchor': 'middle',
      'font-size': fs,
      'font-weight': fw,
      fill: col,
      'font-family': options.fontFamily || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    });
    tEl.textContent = ln;
    g.appendChild(tEl);
  });

  if (parent) parent.appendChild(g);
  return { group: g, box, centerX: cx, centerY: cy, lines };
}

/**
 * 左右2分割ヘッダー（B/S・P/L等）の重なり回避レイアウトを算出する
 * @param {number} svgWidth
 * @param {Object} options - { leftText, rightText, rightSubText, padX, minGap, leftSize, rightSize, rightSubSize, rightBaseY, rightSubBaseY }
 * @returns {Object} レイアウト情報（headerBottom含む）
 */
function layoutDualSideSvgHeader(svgWidth, options = {}) {
  const padX = options.padX ?? 24;
  const availW = Math.max(200, svgWidth - padX * 2);
  const minGap = options.minGap ?? 24;
  const leftSize = options.leftSize ?? 17;
  const rightSize = options.rightSize ?? 14;
  const rightSubSize = options.rightSubSize ?? 11;

  const leftText = String(options.leftText || '').trim();
  const rightText = String(options.rightText || '').trim();
  const rightSubText = String(options.rightSubText || '').trim();

  const estLeftW = leftText ? estimateSvgTextWidth(leftText, leftSize, true) * 1.04 : 0;
  const estRightMainW = rightText ? estimateSvgTextWidth(rightText, rightSize, true) * 1.04 : 0;
  const estRightSubW = rightSubText ? estimateSvgTextWidth(rightSubText, rightSubSize, false) * 1.04 : 0;
  const estRightW = Math.max(estRightMainW, estRightSubW);

  if (!leftText || !rightText || (estLeftW + estRightW + minGap <= availW)) {
    const leftY = 38;
    const rightY = options.rightBaseY ?? 32;
    const rightSubY = options.rightSubBaseY ?? 48;
    const headerBottom = rightSubText ? Math.max(leftY + 12, rightSubY + 10) : Math.max(leftY + 12, rightY + 10);
    return {
      padX,
      svgWidth,
      leftLines: leftText ? [leftText] : [],
      leftFontSize: leftSize,
      leftY,
      leftLineGap: Math.round(leftSize * 1.3),
      rightLines: rightText ? [rightText] : [],
      rightFontSize: rightSize,
      rightY,
      rightLineGap: Math.round(rightSize * 1.3),
      rightSubText,
      rightSubSize,
      rightSubY,
      headerBottom
    };
  }

  // 横並びで衝突する場合は上下段へ分離し、必要なら全幅に合わせて自動縮小・2行折り返し
  const leftLayout = layoutSvgTitleLines(leftText, availW, leftSize, 13.5);
  const leftY = 32;
  const leftLineGap = Math.round(leftLayout.fontSize * 1.3);
  const leftLastY = leftY + (leftLayout.lines.length - 1) * leftLineGap;

  const rightLayout = layoutSvgTitleLines(rightText, availW, rightSize, 11.5);
  const rightY = leftLastY + 24;
  const rightLineGap = Math.round(rightLayout.fontSize * 1.3);
  const rightLastY = rightY + (rightLayout.lines.length - 1) * rightLineGap;
  const rightSubY = rightLastY + 17;
  const headerBottom = (rightSubText ? rightSubY : rightLastY) + 12;

  return {
    padX,
    svgWidth,
    leftLines: leftLayout.lines,
    leftFontSize: leftLayout.fontSize,
    leftY,
    leftLineGap,
    rightLines: rightLayout.lines,
    rightFontSize: rightLayout.fontSize,
    rightY,
    rightLineGap,
    rightSubText,
    rightSubSize,
    rightSubY,
    headerBottom
  };
}

/**
 * 算出済みの左右分割ヘッダーをSVG要素へ描画する
 * @param {SVGElement} parent
 * @param {Object} layout - layoutDualSideSvgHeaderの戻り値
 * @param {Object} [options] - { className, leftWeight, rightWeight, leftFill, rightFill, rightSubFill }
 * @returns {SVGGElement}
 */
function renderDualSideSvgHeader(parent, layout, options = {}) {
  const g = createSvgElement('g', options.className ? { class: options.className } : {});
  const rightX = (layout.svgWidth - layout.padX).toFixed(1);

  (layout.leftLines || []).forEach((ln, idx) => {
    const tEl = createSvgElement('text', {
      x: String(layout.padX),
      y: String(layout.leftY + idx * layout.leftLineGap),
      'font-size': String(layout.leftFontSize),
      'font-weight': options.leftWeight || '800',
      fill: options.leftFill || '#0f172a'
    });
    tEl.textContent = ln;
    g.appendChild(tEl);
  });

  (layout.rightLines || []).forEach((ln, idx) => {
    const sEl = createSvgElement('text', {
      x: rightX,
      y: String(layout.rightY + idx * layout.rightLineGap),
      'text-anchor': 'end',
      'font-size': String(layout.rightFontSize),
      'font-weight': options.rightWeight || '700',
      fill: options.rightFill || '#334155'
    });
    sEl.textContent = ln;
    g.appendChild(sEl);
  });

  if (layout.rightSubText) {
    const subEl = createSvgElement('text', {
      x: rightX,
      y: String(layout.rightSubY),
      'text-anchor': 'end',
      'font-size': String(layout.rightSubSize),
      'font-weight': '600',
      fill: options.rightSubFill || '#94a3b8'
    });
    subEl.textContent = layout.rightSubText;
    g.appendChild(subEl);
  }

  if (parent) parent.appendChild(g);
  return g;
}

