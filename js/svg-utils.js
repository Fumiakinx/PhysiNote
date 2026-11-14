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

