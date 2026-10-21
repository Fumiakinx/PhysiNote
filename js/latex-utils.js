// ==========================================
// LaTeX / xcolor 構文解析 共通ユーティリティ
// ==========================================

/**
 * LaTeX xcolor 記法を CSS カラー文字列に変換する
 * 対応形式:
 * - [HTML]{HEX} / [html]{HEX}
 * - [gray]{0.x}
 * - [rgb]{r, g, b} (各値 0.0〜1.0)
 * - {colorName!percent} / colorName!percent (例: blue!20)
 * - {colorName} / colorName (例: lightgray, red)
 *
 * @param {string} rawSpec
 * @returns {string|null} CSSカラー文字列 (HEX または rgb())
 */
function parseLatexColor(rawSpec) {
  if (!rawSpec) return null;
  const trimmed = rawSpec.trim();

  // 1. [HTML]{HEX} または [html]{HEX}
  const htmlMatch = trimmed.match(/^\[html\]\{([0-9a-fA-F]{6})\}/i);
  if (htmlMatch) return `#${htmlMatch[1]}`;

  // 2. [gray]{0.x}
  const grayMatch = trimmed.match(/^\[gray\]\{([0-9.]+)\}/i);
  if (grayMatch) {
    const val = Math.round(parseFloat(grayMatch[1]) * 255);
    return `rgb(${val}, ${val}, ${val})`;
  }

  // 3. [rgb]{r, g, b}
  const rgbMatch = trimmed.match(/^\[rgb\]\{([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)\}/i);
  if (rgbMatch) {
    const r = Math.round(parseFloat(rgbMatch[1]) * 255);
    const g = Math.round(parseFloat(rgbMatch[2]) * 255);
    const b = Math.round(parseFloat(rgbMatch[3]) * 255);
    return `rgb(${r}, ${g}, ${b})`;
  }

  // 4. {name!percent} または単純名
  const nameMatch = trimmed.match(/^\{?([a-zA-Z]+)(?:!(\d+))?\}?$/);
  if (nameMatch) {
    const name = nameMatch[1].toLowerCase();
    const percent = nameMatch[2] ? parseInt(nameMatch[2], 10) / 100 : 1.0;
    const colorMap = {
      black: [0, 0, 0],
      white: [255, 255, 255],
      red: [239, 68, 68],
      green: [34, 197, 94],
      blue: [59, 130, 246],
      yellow: [234, 179, 8],
      cyan: [6, 182, 212],
      magenta: [217, 70, 239],
      gray: [156, 163, 175],
      lightgray: [229, 231, 235],
      darkgray: [75, 85, 99],
      orange: [249, 115, 22],
      purple: [168, 85, 247],
      pink: [244, 114, 182],
      brown: [161, 98, 7],
      teal: [20, 184, 166],
      violet: [139, 92, 246],
      olive: [132, 204, 22],
      navy: [30, 58, 138]
    };

    if (colorMap[name]) {
      const [r, g, b] = colorMap[name];
      if (percent < 1.0) {
        // xcolor仕様: 白背景との線形補間
        const mr = Math.round(r * percent + 255 * (1 - percent));
        const mg = Math.round(g * percent + 255 * (1 - percent));
        const mb = Math.round(b * percent + 255 * (1 - percent));
        return `rgb(${mr}, ${mg}, ${mb})`;
      }
      return `rgb(${r}, ${g}, ${b})`;
    }
  }

  // 5. その他の形式 (直接の #HEX や rgb)
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

/**
 * 文字列中の波括弧 {...} のネスト（深さ）を解析し、最も外側の波括弧の中身とインデックスを抽出する
 *
 * @param {string} text 対象文字列
 * @param {number} [startSearchIdx=0] 探索開始インデックス
 * @returns {{ content: string, startIdx: number, endIdx: number }|null}
 */
function extractBalancedBraces(text, startSearchIdx = 0) {
  if (!text) return null;
  const startBraceIdx = text.indexOf('{', startSearchIdx);
  if (startBraceIdx === -1) return null;

  let depth = 0;
  for (let i = startBraceIdx; i < text.length; i++) {
    const ch = text[i];
    if (ch === '{') {
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0) {
        return {
          content: text.substring(startBraceIdx + 1, i),
          startIdx: startBraceIdx,
          endIdx: i
        };
      }
    }
  }
  return null;
}

/**
 * 波括弧 {...} の深さが0の場所でのみ指定区切り文字で文字列を分割する
 *
 * @param {string} text 対象文字列
 * @param {string} delimiter 区切り文字または文字列 ('&' や '\\\\')
 * @returns {string[]}
 */
function splitByBalancedChar(text, delimiter) {
  if (!text) return [];
  const result = [];
  const delimLen = delimiter.length;
  let current = '';
  let depth = 0;
  let i = 0;

  while (i < text.length) {
    const ch = text[i];
    if (ch === '{') {
      depth++;
      current += ch;
      i++;
    } else if (ch === '}') {
      if (depth > 0) depth--;
      current += ch;
      i++;
    } else if (depth === 0 && text.substr(i, delimLen) === delimiter) {
      result.push(current);
      current = '';
      i += delimLen;
    } else {
      current += ch;
      i++;
    }
  }

  if (current.length > 0 || result.length > 0) {
    result.push(current);
  }
  return result;
}

/**
 * 波括弧バランスを考慮した LaTeX 表の行分割 (\\\\ を深さ0でのみ分割)
 *
 * @param {string} bodyText
 * @returns {string[]}
 */
function splitLatexRows(bodyText) {
  return splitByBalancedChar(bodyText, '\\\\');
}

/**
 * 波括弧バランスを考慮した LaTeX 表のセル分割 (& を深さ0でのみ分割)
 *
 * @param {string} rowText
 * @returns {string[]}
 */
function splitLatexCells(rowText) {
  return splitByBalancedChar(rowText, '&').map((c) => c.trim());
}
