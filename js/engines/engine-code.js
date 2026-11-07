// ==========================================
// レトロPC / ソースコード表示エンジン (engine-code.js)
// PC-98 / DOS / アンバー / CRT風のコード枠SVGレンダラー
// ==========================================

/**
 * 全角・半角を考慮した表示桁数の計算
 * @param {string} str 
 * @returns {number}
 */
function getDisplayWidth(str) {
  let w = 0;
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    // 半角アスキーおよび半角カナ以外を全角(2幅)として扱う
    if ((code >= 0x0020 && code <= 0x007E) || (code >= 0xFF61 && code <= 0xFF9F)) {
      w += 1;
    } else {
      w += 2;
    }
  }
  return w;
}

/**
 * タブ文字 (\t) を指定タブ幅でスペースに展開
 * 全角文字の2桁幅も考慮して桁揃えを行う
 * @param {string} line 
 * @param {number} tabSize 
 * @returns {string}
 */
function expandTabsInLine(line, tabSize = 4) {
  let result = '';
  let col = 0;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '\t') {
      const numSpaces = tabSize - (col % tabSize);
      result += ' '.repeat(numSpaces);
      col += numSpaces;
    } else {
      result += ch;
      const code = line.charCodeAt(i);
      if ((code >= 0x0020 && code <= 0x007E) || (code >= 0xFF61 && code <= 0xFF9F)) {
        col += 1;
      } else {
        col += 2;
      }
    }
  }
  return result;
}

/**
 * コード構文のパース
 * @param {string} rawText 
 * @returns {object}
 */
function parseCodeSyntax(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;
  let text = rawText.trim();

  // \code{...} / \terminal{...} のアンラップ
  const match = text.match(/^\\(?:code|terminal|retrocode|sourcecode)\s*\{([\s\S]*)\}$/i);
  if (match) {
    text = match[1];
  }

  // 設定オプションの抽出
  let title = 'SOURCE CODE';
  let theme = 'pc98';
  let tabSize = 4;
  let showLineNumbers = false;
  let showScanlines = true;
  let fontMode = 'retro'; // 'retro' | 'modern'

  const lines = text.split(/\r?\n/);
  const codeLines = [];
  let readingConfig = true;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (readingConfig) {
      if (!trimmed) continue;

      const titleM = trimmed.match(/^(?:#|\/\/|\/\*|<!--|%)?\s*title\s*:\s*["']?([^"';\n]+)["']?\s*(?:;|\*\/|-->)?$/i);
      if (titleM) {
        title = titleM[1].trim();
        continue;
      }

      const themeM = trimmed.match(/^(?:#|\/\/|\/\*|<!--|%)?\s*theme\s*:\s*["']?([a-zA-Z0-9_-]+)["']?\s*(?:;|\*\/|-->)?$/i);
      if (themeM) {
        theme = themeM[1].trim().toLowerCase();
        continue;
      }

      const tabM = trimmed.match(/^(?:#|\/\/|\/\*|<!--|%)?\s*tab\s*:\s*(\d+)\s*(?:;|\*\/|-->)?$/i);
      if (tabM) {
        tabSize = parseInt(tabM[1], 10) || 4;
        continue;
      }

      const lineNumM = trimmed.match(/^(?:#|\/\/|\/\*|<!--|%)?\s*(?:line[-_]?numbers?|lines?)\s*:\s*(true|false)\s*(?:;|\*\/|-->)?$/i);
      if (lineNumM) {
        showLineNumbers = lineNumM[1].toLowerCase() === 'true';
        continue;
      }

      const scanM = trimmed.match(/^(?:#|\/\/|\/\*|<!--|%)?\s*scanlines?\s*:\s*(true|false)\s*(?:;|\*\/|-->)?$/i);
      if (scanM) {
        showScanlines = scanM[1].toLowerCase() === 'true';
        continue;
      }

      const cursorM = trimmed.match(/^(?:#|\/\/|\/\*|<!--|%)?\s*cursor\s*:\s*(true|false)\s*(?:;|\*\/|-->)?$/i);
      if (cursorM) {
        showCursor = cursorM[1].toLowerCase() === 'true';
        continue;
      }

      // 設定キーでなければコード開始
      readingConfig = false;
    }

    codeLines.push(rawLine);
  }

  // 前後の空行を除去（ただし途中の空行は残す）
  while (codeLines.length > 0 && codeLines[0].trim() === '') {
    codeLines.shift();
  }
  while (codeLines.length > 0 && codeLines[codeLines.length - 1].trim() === '') {
    codeLines.pop();
  }

  // タブ展開
  const expandedLines = codeLines.map((l) => expandTabsInLine(l, tabSize));

  return {
    title,
    theme,
    tabSize,
    showLineNumbers,
    showScanlines,
    showCursor: typeof showCursor !== 'undefined' ? showCursor : (theme === 'pc8001' || theme === 'apple2' || theme === 'apple'),
    fontMode,
    lines: expandedLines
  };
}

/**
 * テーマ定義
 */
const CODE_THEMES = {
  apple2: {
    bg: '#000000',
    border: '#052e16',
    headerBg: '#000000',
    headerBorder: '#000000',
    headerTitle: '#22e695',
    defaultText: '#22e695', // Apple II エメラルドグリーン
    comment: '#22e695',
    keyword: '#22e695',
    type: '#22e695',
    number: '#22e695',
    macro: '#22e695',
    string: '#22e695',
    lineNumber: '#065f46',
    lineDivider: '#064e3b',
    scanlineColor: 'rgba(34, 230, 149, 0.04)',
    badgeText: 'Apple II',
    isRawMonochrome: true, // 全文エメラルドグリーン
    noTitleBar: true,       // タイトルバーなし
    hasFKeys: false
  },
  apple: {
    bg: '#000000',
    border: '#052e16',
    headerBg: '#000000',
    headerBorder: '#000000',
    headerTitle: '#22e695',
    defaultText: '#22e695',
    comment: '#22e695',
    keyword: '#22e695',
    type: '#22e695',
    number: '#22e695',
    macro: '#22e695',
    string: '#22e695',
    lineNumber: '#065f46',
    lineDivider: '#064e3b',
    scanlineColor: 'rgba(34, 230, 149, 0.04)',
    badgeText: 'Apple II',
    isRawMonochrome: true,
    noTitleBar: true,
    hasFKeys: false
  },
  pc8001: {
    bg: '#000000',
    border: '#18181b',
    headerBg: '#000000',
    headerBorder: '#000000',
    headerTitle: '#ffffff',
    defaultText: '#ffffff',
    comment: '#ffffff',
    keyword: '#ffffff',
    type: '#ffffff',
    number: '#ffffff',
    macro: '#ffffff',
    string: '#ffffff',
    lineNumber: '#52525b',
    lineDivider: '#27272a',
    scanlineColor: 'rgba(255, 255, 255, 0.03)',
    badgeText: 'PC-8001',
    isRawMonochrome: true, // シンタックスハイライトせず純白で描画
    noTitleBar: true,       // タイトルバーヘッダーなし
    hasFKeys: true          // 最下段ファンクションキーバーあり
  },
  pc98: {
    bg: '#0c1017',
    border: '#1e293b',
    headerBg: '#131b26',
    headerBorder: '#1e293b',
    headerTitle: '#38bdf8',
    defaultText: '#e2e8f0',
    comment: '#4ade80',     // PC-98風 CRTグリーン
    keyword: '#38bdf8',     // シアン
    type: '#f43f5e',        // 赤・コーラル
    number: '#fef08a',      // 黄色
    macro: '#c084fc',       // パープル
    string: '#fb923c',      // オレンジ
    lineNumber: '#475569',
    lineDivider: '#1e293b',
    scanlineColor: 'rgba(56, 189, 248, 0.04)',
    badgeText: 'PC-98 / CRT',
    badgeBg: '#0369a1',
    badgeColor: '#e0f2fe'
  },
  dos: {
    bg: '#000000',
    border: '#334155',
    headerBg: '#0f172a',
    headerBorder: '#334155',
    headerTitle: '#cbd5e1',
    defaultText: '#f8fafc',
    comment: '#94a3b8',
    keyword: '#38bdf8',
    type: '#a78bfa',
    number: '#fbbf24',
    macro: '#67e8f9',
    string: '#f472b6',
    lineNumber: '#64748b',
    lineDivider: '#334155',
    scanlineColor: 'rgba(255, 255, 255, 0.03)',
    badgeText: 'MS-DOS',
    badgeBg: '#1e293b',
    badgeColor: '#94a3b8'
  },
  amber: {
    bg: '#0d0700',
    border: '#451a03',
    headerBg: '#1c0e02',
    headerBorder: '#451a03',
    headerTitle: '#f59e0b',
    defaultText: '#fbbf24',
    comment: '#d97706',
    keyword: '#fef08a',
    type: '#fde047',
    number: '#ffffff',
    macro: '#fb923c',
    string: '#fed7aa',
    lineNumber: '#92400e',
    lineDivider: '#451a03',
    scanlineColor: 'rgba(245, 158, 11, 0.05)',
    badgeText: 'AMBER CRT',
    badgeBg: '#78350f',
    badgeColor: '#fef3c7'
  },
  matrix: {
    bg: '#020803',
    border: '#064e3b',
    headerBg: '#03200b',
    headerBorder: '#064e3b',
    headerTitle: '#22c55e',
    defaultText: '#4ade80',
    comment: '#15803d',
    keyword: '#86efac',
    type: '#bbf7d0',
    number: '#ffffff',
    macro: '#6ee7b7',
    string: '#a7f3d0',
    lineNumber: '#166534',
    lineDivider: '#064e3b',
    scanlineColor: 'rgba(34, 197, 94, 0.06)',
    badgeText: 'TERMINAL',
    badgeBg: '#065f46',
    badgeColor: '#dcfce7'
  }
};

/**
 * 1行のコードをトークン化して SVG tspan 要素群に分解
 * @param {string} line 
 * @param {object} theme 
 * @returns {Array<{text: string, color: string}>}
 */
function tokenizeLine(line, theme) {
  if (!line) return [];

  const tokens = [];
  let remaining = line;

  // 1. コメント (// または /* ... */)
  const commentIdx = remaining.indexOf('//');
  let commentPart = '';
  if (commentIdx !== -1) {
    commentPart = remaining.substring(commentIdx);
    remaining = remaining.substring(0, commentIdx);
  }

  // C/C++ 言語用キーワード・型の正規表現
  const keywordRegex = /\b(struct|union|enum|typedef|const|static|extern|volatile|void|return|if|else|switch|case|default|break|continue|for|while|do|goto|sizeof)\b/;
  const typeRegex = /\b(INT|UINT|BYTE|WORD|DWORD|LONG|SHORT|BOOL|TRUE|FALSE|int|char|short|long|unsigned|signed|float|double|size_t)\b/;
  const macroRegex = /\b[A-Z_][A-Z0-9_]{1,}\b/;
  const numberRegex = /\b(?:0x[0-9a-fA-F]+|-?\d+)\b/;
  const stringRegex = /(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/;

  while (remaining.length > 0) {
    // 空白の連続
    const wsMatch = remaining.match(/^(\s+)/);
    if (wsMatch) {
      tokens.push({ text: wsMatch[1], color: theme.defaultText });
      remaining = remaining.substring(wsMatch[1].length);
      continue;
    }

    // 文字列リテラル
    const strMatch = remaining.match(stringRegex);
    if (strMatch && remaining.indexOf(strMatch[0]) === 0) {
      tokens.push({ text: strMatch[0], color: theme.string });
      remaining = remaining.substring(strMatch[0].length);
      continue;
    }

    // プリプロセッサディレクティブ
    if (remaining.startsWith('#')) {
      const ppMatch = remaining.match(/^#[a-zA-Z0-9_]+/);
      if (ppMatch) {
        tokens.push({ text: ppMatch[0], color: theme.macro });
        remaining = remaining.substring(ppMatch[0].length);
        continue;
      }
    }

    // 単語（識別子・キーワード・数値）
    const wordMatch = remaining.match(/^([a-zA-Z0-9_]+)/);
    if (wordMatch) {
      const word = wordMatch[1];
      let color = theme.defaultText;

      if (keywordRegex.test(word)) {
        color = theme.keyword;
      } else if (typeRegex.test(word)) {
        color = theme.type;
      } else if (numberRegex.test(word)) {
        color = theme.number;
      } else if (macroRegex.test(word)) {
        color = theme.macro;
      }

      tokens.push({ text: word, color });
      remaining = remaining.substring(word.length);
      continue;
    }

    // 負の数値 (例: -5, -3)
    const negNumMatch = remaining.match(/^(-\d+)/);
    if (negNumMatch) {
      tokens.push({ text: negNumMatch[1], color: theme.number });
      remaining = remaining.substring(negNumMatch[1].length);
      continue;
    }

    // 記号・区切り文字 (1文字ずつ)
    const ch = remaining[0];
    tokens.push({ text: ch, color: theme.defaultText });
    remaining = remaining.substring(1);
  }

  // コメント部分の追加
  if (commentPart) {
    tokens.push({ text: commentPart, color: theme.comment });
  }

  return tokens;
}

/**
 * レトロPC風コード枠 SVG 描画メイン関数
 * @param {string} text 
 * @param {HTMLElement} container 
 * @param {string} label 
 */
function drawCodeSvg(text, container, label) {
  container.innerHTML = '';
  const parsed = parseCodeSyntax(text);
  if (!parsed || parsed.lines.length === 0) {
    container.innerHTML = '<div style="color:#94a3b8;padding:20px;">コードが空です</div>';
    return;
  }

  const themeKey = parsed.theme in CODE_THEMES ? parsed.theme : 'pc98';
  const theme = CODE_THEMES[themeKey];

  // フォント設定・文字寸法
  const fontSize = 14;
  const lineHeight = 22;
  const charWidth = 8.5; // 半角1文字幅の概算

  // 最長表示行幅の計算
  let maxDisplayCols = 0;
  for (const line of parsed.lines) {
    const w = getDisplayWidth(line);
    if (w > maxDisplayCols) maxDisplayCols = w;
  }
  // 最低列数の確保
  if (maxDisplayCols < 48) maxDisplayCols = 48;

  // レイアウト寸法
  const isNoTitle = !!theme.noTitleBar;
  const isFKeys = !!theme.hasFKeys;
  const headerHeight = isNoTitle ? 0 : 38;
  const padLeft = isFKeys ? 32 : (isNoTitle ? 28 : 20);
  const padRight = isFKeys ? 32 : (isNoTitle ? 28 : 24);
  const padTop = isFKeys ? 32 : (isNoTitle ? 26 : 16);
  const padBottom = isFKeys ? 54 : (isNoTitle ? 26 : 18);

  // 行番号領域の計算
  let lineNumWidth = 0;
  if (parsed.showLineNumbers) {
    const numDigits = String(parsed.lines.length).length;
    lineNumWidth = Math.max(numDigits * charWidth + 16, 36);
  }

  const minWidth = isFKeys ? 640 : (isNoTitle ? 560 : 520);
  const minHeight = isFKeys ? 280 : (isNoTitle ? 200 : 120);
  const codeAreaWidth = maxDisplayCols * charWidth;
  const totalWidth = Math.max(Math.ceil(padLeft + lineNumWidth + codeAreaWidth + padRight), minWidth);
  const computedHeight = headerHeight + padTop + parsed.lines.length * lineHeight + padBottom;
  const totalHeight = Math.max(computedHeight, minHeight);

  // SVG要素の作成
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('xmlns', svgNS);
  svg.setAttribute('viewBox', `0 0 ${totalWidth} ${totalHeight}`);
  svg.setAttribute('width', `${totalWidth}`);
  svg.setAttribute('height', `${totalHeight}`);
  svg.style.display = 'block';
  svg.style.maxWidth = '100%';
  svg.style.height = 'auto';
  svg.style.borderRadius = '8px';
  svg.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.4), 0 0 1px rgba(255, 255, 255, 0.1)';

  // 定義 (defs): 走査線パターン
  const defs = document.createElementNS(svgNS, 'defs');
  if (parsed.showScanlines) {
    const pattern = document.createElementNS(svgNS, 'pattern');
    pattern.setAttribute('id', `code-scanlines-${Math.random().toString(36).substr(2, 6)}`);
    pattern.setAttribute('width', '100%');
    pattern.setAttribute('height', '4');
    pattern.setAttribute('patternUnits', 'userSpaceOnUse');

    const scanLine = document.createElementNS(svgNS, 'line');
    scanLine.setAttribute('x1', '0');
    scanLine.setAttribute('y1', '0');
    scanLine.setAttribute('x2', '100%');
    scanLine.setAttribute('y2', '0');
    scanLine.setAttribute('stroke', theme.scanlineColor);
    scanLine.setAttribute('stroke-width', '1.5');
    pattern.appendChild(scanLine);
    defs.appendChild(pattern);

    svg.setAttribute('data-pattern-id', pattern.getAttribute('id'));
  }
  svg.appendChild(defs);

  // 1. 全体背景（メインスクリーン）
  const bgRect = document.createElementNS(svgNS, 'rect');
  bgRect.setAttribute('x', '0');
  bgRect.setAttribute('y', '0');
  bgRect.setAttribute('width', `${totalWidth}`);
  bgRect.setAttribute('height', `${totalHeight}`);
  bgRect.setAttribute('rx', '8');
  bgRect.setAttribute('ry', '8');
  bgRect.setAttribute('fill', theme.bg);
  bgRect.setAttribute('stroke', theme.border);
  bgRect.setAttribute('stroke-width', '1.5');
  svg.appendChild(bgRect);

  // 2. タイトルバーヘッダー (noTitleBar の場合は非表示)
  if (!isNoTitle) {
    const headerRect = document.createElementNS(svgNS, 'path');
    headerRect.setAttribute('d', `M 0 8 Q 0 0 8 0 L ${totalWidth - 8} 0 Q ${totalWidth} 0 ${totalWidth} 8 L ${totalWidth} ${headerHeight} L 0 ${headerHeight} Z`);
    headerRect.setAttribute('fill', theme.headerBg);
    headerRect.setAttribute('stroke', theme.headerBorder);
    headerRect.setAttribute('stroke-width', '1');
    svg.appendChild(headerRect);

    // ヘッダー境界線
    const headerLine = document.createElementNS(svgNS, 'line');
    headerLine.setAttribute('x1', '0');
    headerLine.setAttribute('y1', `${headerHeight}`);
    headerLine.setAttribute('x2', `${totalWidth}`);
    headerLine.setAttribute('y2', `${headerHeight}`);
    headerLine.setAttribute('stroke', theme.headerBorder);
    headerLine.setAttribute('stroke-width', '1');
    svg.appendChild(headerLine);

    // レトロPC風ウィンドウコントロール [ ■ ] [ - ] [ × ]
    const dotsG = document.createElementNS(svgNS, 'g');
    dotsG.setAttribute('transform', 'translate(14, 13)');
    const dotColors = ['#ef4444', '#f59e0b', '#10b981'];
    dotColors.forEach((col, idx) => {
      const circle = document.createElementNS(svgNS, 'circle');
      circle.setAttribute('cx', `${idx * 16 + 6}`);
      circle.setAttribute('cy', '6');
      circle.setAttribute('r', '5');
      circle.setAttribute('fill', col);
      circle.setAttribute('opacity', '0.85');
      dotsG.appendChild(circle);
    });
    svg.appendChild(dotsG);

    // タイトルテキスト
    const titleText = document.createElementNS(svgNS, 'text');
    titleText.setAttribute('x', '72');
    titleText.setAttribute('y', '24');
    titleText.setAttribute('fill', theme.headerTitle);
    titleText.setAttribute('font-family', "'Consolas', 'Courier New', 'MS Gothic', monospace");
    titleText.setAttribute('font-size', '13');
    titleText.setAttribute('font-weight', '600');
    titleText.setAttribute('letter-spacing', '0.5');
    titleText.textContent = `■ ${parsed.title}`;
    svg.appendChild(titleText);

    // 右端のバッジ (PC-98 / CRT 等)
    const badgeG = document.createElementNS(svgNS, 'g');
    const badgeTextStr = theme.badgeText;
    const badgeWidth = badgeTextStr.length * 7.5 + 16;
    const badgeX = totalWidth - badgeWidth - 14;

    const badgeBg = document.createElementNS(svgNS, 'rect');
    badgeBg.setAttribute('x', `${badgeX}`);
    badgeBg.setAttribute('y', '9');
    badgeBg.setAttribute('width', `${badgeWidth}`);
    badgeBg.setAttribute('height', '20');
    badgeBg.setAttribute('rx', '4');
    badgeBg.setAttribute('fill', theme.badgeBg);
    badgeBg.setAttribute('opacity', '0.9');
    badgeG.appendChild(badgeBg);

    const badgeText = document.createElementNS(svgNS, 'text');
    badgeText.setAttribute('x', `${badgeX + badgeWidth / 2}`);
    badgeText.setAttribute('y', '23');
    badgeText.setAttribute('fill', theme.badgeColor);
    badgeText.setAttribute('font-family', "'Consolas', 'Courier New', monospace");
    badgeText.setAttribute('font-size', '10.5');
    badgeText.setAttribute('font-weight', 'bold');
    badgeText.setAttribute('text-anchor', 'middle');
    badgeText.textContent = badgeTextStr;
    badgeG.appendChild(badgeText);
    svg.appendChild(badgeG);
  }

  // 3. 行番号と垂直区切り線（有効時）
  const codeOriginX = padLeft + lineNumWidth;
  if (parsed.showLineNumbers) {
    const vLine = document.createElementNS(svgNS, 'line');
    vLine.setAttribute('x1', `${codeOriginX - 8}`);
    vLine.setAttribute('y1', `${headerHeight}`);
    vLine.setAttribute('x2', `${codeOriginX - 8}`);
    vLine.setAttribute('y2', `${totalHeight}`);
    vLine.setAttribute('stroke', theme.lineDivider);
    vLine.setAttribute('stroke-width', '1');
    vLine.setAttribute('stroke-dasharray', '2 2');
    svg.appendChild(vLine);
  }

  // 4. コードテキスト描画
  const textG = document.createElementNS(svgNS, 'g');
  textG.setAttribute('font-family', "'Consolas', 'Courier New', 'MS Gothic', 'Yu Gothic', monospace");
  textG.setAttribute('font-size', `${fontSize}`);
  textG.style.whiteSpace = 'pre';

  const startY = headerHeight + padTop + fontSize;

  parsed.lines.forEach((line, idx) => {
    const y = startY + idx * lineHeight;

    // 行番号
    if (parsed.showLineNumbers) {
      const lineNumText = document.createElementNS(svgNS, 'text');
      lineNumText.setAttribute('x', `${codeOriginX - 16}`);
      lineNumText.setAttribute('y', `${y}`);
      lineNumText.setAttribute('fill', theme.lineNumber);
      lineNumText.setAttribute('text-anchor', 'end');
      lineNumText.setAttribute('font-size', '12');
      lineNumText.textContent = String(idx + 1);
      textG.appendChild(lineNumText);
    }

    // コード行テキスト
    const lineText = document.createElementNS(svgNS, 'text');
    lineText.setAttribute('x', `${codeOriginX}`);
    lineText.setAttribute('y', `${y}`);
    lineText.setAttribute('xml:space', 'preserve');
    lineText.style.whiteSpace = 'pre';

    const tokens = theme.isRawMonochrome
      ? [{ text: line, color: theme.defaultText }]
      : tokenizeLine(line, theme);

    if (tokens.length === 0) {
      lineText.textContent = '\u00A0';
    } else {
      tokens.forEach((tok) => {
        const tspan = document.createElementNS(svgNS, 'tspan');
        tspan.setAttribute('fill', tok.color);
        tspan.setAttribute('xml:space', 'preserve');
        tspan.style.whiteSpace = 'pre';
        // 半角スペースの縮約・欠落を防止し字下げを確実に保持
        tspan.textContent = tok.text.replace(/ /g, '\u00A0');
        lineText.appendChild(tspan);
      });
    }

    textG.appendChild(lineText);
  });

  // カーソル描画 (showCursor が true の場合)
  if (parsed.showCursor && parsed.lines.length > 0) {
    const lastLineIdx = parsed.lines.length - 1;
    const lastLineText = parsed.lines[lastLineIdx];
    const lastLineWidth = getDisplayWidth(lastLineText) * charWidth;
    const cursorX = codeOriginX + lastLineWidth + 4;
    const cursorY = startY + lastLineIdx * lineHeight - fontSize + 3;

    const cursorRect = document.createElementNS(svgNS, 'rect');
    cursorRect.setAttribute('x', `${cursorX}`);
    cursorRect.setAttribute('y', `${cursorY}`);
    cursorRect.setAttribute('width', '9');
    cursorRect.setAttribute('height', `${fontSize + 2}`);
    cursorRect.setAttribute('fill', theme.defaultText);
    cursorRect.setAttribute('opacity', '0.9');
    textG.appendChild(cursorRect);
  }

  svg.appendChild(textG);

  // 5. ファンクションキー反転バー描画 (PC-8001モード等)
  if (isFKeys) {
    const fkeys = ['1:      ', 'auto    ', 'go to   ', 'list    ', 'run     '];
    const fkeyWidth = 84;
    const fkeyHeight = 20;
    const fkeyGap = 16;
    const totalFKeysWidth = fkeys.length * fkeyWidth + (fkeys.length - 1) * fkeyGap;
    const fkeyStartX = Math.max(padLeft, Math.round((totalWidth - totalFKeysWidth) / 2));
    const fkeyY = totalHeight - 32;

    const fkeysG = document.createElementNS(svgNS, 'g');
    fkeys.forEach((fText, fIdx) => {
      const kX = fkeyStartX + fIdx * (fkeyWidth + fkeyGap);

      const kRect = document.createElementNS(svgNS, 'rect');
      kRect.setAttribute('x', `${kX}`);
      kRect.setAttribute('y', `${fkeyY}`);
      kRect.setAttribute('width', `${fkeyWidth}`);
      kRect.setAttribute('height', `${fkeyHeight}`);
      kRect.setAttribute('fill', '#ffffff');
      fkeysG.appendChild(kRect);

      const kLabel = document.createElementNS(svgNS, 'text');
      kLabel.setAttribute('x', `${kX + fkeyWidth / 2}`);
      kLabel.setAttribute('y', `${fkeyY + 14}`);
      kLabel.setAttribute('fill', '#000000');
      kLabel.setAttribute('font-family', "'Consolas', 'MS Gothic', 'Courier New', monospace");
      kLabel.setAttribute('font-size', '12');
      kLabel.setAttribute('font-weight', 'bold');
      kLabel.setAttribute('text-anchor', 'middle');
      kLabel.textContent = fText.trim();
      fkeysG.appendChild(kLabel);
    });
    svg.appendChild(fkeysG);
  }

  // 6. 走査線（スキャンライン）オーバーレイ
  if (parsed.showScanlines && defs.firstChild) {
    const scanOverlay = document.createElementNS(svgNS, 'rect');
    scanOverlay.setAttribute('x', '0');
    scanOverlay.setAttribute('y', `${headerHeight}`);
    scanOverlay.setAttribute('width', `${totalWidth}`);
    scanOverlay.setAttribute('height', `${totalHeight - headerHeight}`);
    scanOverlay.setAttribute('fill', `url(#${defs.firstChild.getAttribute('id')})`);
    scanOverlay.setAttribute('pointer-events', 'none');
    svg.appendChild(scanOverlay);
  }

  container.appendChild(svg);
}

// グローバルスコープへ登録
window.drawCodeSvg = drawCodeSvg;
window.parseCodeSyntax = parseCodeSyntax;

