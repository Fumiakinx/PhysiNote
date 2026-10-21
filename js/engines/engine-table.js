// ==========================================
// 表（テーブル：LaTeX tabular / Markdown / CSV / TSV）パーサー & レンダラー
// ==========================================
function parseAnyTable(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;
  let text = rawText.trim();

  // \table{...} ラッパーのアンラップ
  const tableWrapperMatch = text.match(/^\\table\{([\s\S]*)\}$/i);
  if (tableWrapperMatch) {
    text = tableWrapperMatch[1].trim();
  }

  // スタイル指定 (style: ... / theme: ...) の抽出 (CSV, Markdown, LaTeX等共通)
  let style = 'modern'; // 'modern' (標準グリッド・デフォルト) | 'academic' (学術上下線) | 'accent' (アクセント線) | 'dark' (濃灰全枠) | 'blue' (左列インデックス)
  const styleMatch = text.match(/(?:^|[\r\n])\s*(?:#|\/\/|\/\*|<!--|%|;)?\s*(?:style|theme)\s*:\s*["']?([a-zA-Z0-9_-]+)["']?\s*(?:\*\/|-->)?/i);
  if (styleMatch) {
    const s = styleMatch[1].toLowerCase();
    if (/^(modern|grid|clean|standard|default)$/i.test(s)) style = 'modern';
    else if (/^(accent|line|topline|orange)$/i.test(s)) style = 'accent';
    else if (/^(dark|charcoal|gray|black)$/i.test(s)) style = 'dark';
    else if (/^(blue|cyan|index|rowheader)$/i.test(s)) style = 'blue';
    else if (/^(academic|classic|booktabs)$/i.test(s)) style = 'academic';
    else if (/^(rose|pink)$/i.test(s)) style = 'rose';

    // スタイル指定行を除去
    text = text.replace(/(?:^|[\r\n])\s*(?:#|\/\/|\/\*|<!--|%|;)?\s*(?:style|theme)\s*:\s*["']?[a-zA-Z0-9_-]+["']?\s*(?:\*\/|-->)?/gi, '\n').trim();
  }

  // \label{...} の抽出
  let tableLabel = null;
  const labelMatch = text.match(/\\label\s*\{([^}]+)\}/i);
  if (labelMatch) {
    tableLabel = labelMatch[1].trim();
  }

  // タイトル指定 (title: ... / caption: ...) の抽出
  let title = '';
  const titleMatch = text.match(/(?:^|[\r\n])\s*(?:#|\/\/|\/\*|<!--|%|;)?\s*(?:title|caption)\s*:\s*["']?([^"'\r\n]+)["']?\s*(?:\*\/|-->)?/i);
  if (titleMatch) {
    title = titleMatch[1].trim();
    text = text.replace(/(?:^|[\r\n])\s*(?:#|\/\/|\/\*|<!--|%|;)?\s*(?:title|caption)\s*:\s*["']?[^"'\r\n]+["']?\s*(?:\*\/|-->)?/gi, '\n').trim();
  }

  // LaTeX \caption{...} の抽出（自動採番「表 1: ...」の付与）
  const latexCaptionMatch = text.match(/\\caption\s*\{((?:[^{}]|\{[^{}]*\})*)\}/i);
  if (latexCaptionMatch && !title) {
    const rawCaption = latexCaptionMatch[1].trim();
    if (/^(?:表\s*\d+|table\s*\d+)/i.test(rawCaption)) {
      title = rawCaption;
    } else {
      title = `表 1: ${rawCaption}`;
    }
  }

  // 1. LaTeX tabular / array 環境の検出と括弧ネスト対応
  let latexInfo = null;
  const beginRegex = /\\begin\{(tabular|array)\}/i;
  const beginMatch = text.match(beginRegex);
  if (beginMatch) {
    const beginIdx = beginMatch.index;
    let afterBeginIdx = beginIdx + beginMatch[0].length;

    // オプション [pos] のスキップ
    const afterBeginStr = text.substring(afterBeginIdx);
    const posMatch = afterBeginStr.match(/^\s*\[[^\]]*\]/);
    if (posMatch) {
      afterBeginIdx += posMatch[0].length;
    }

    // 波括弧バランスで colSpec を抽出 (共通ユーティリティ extractBalancedBraces 利用)
    let colSpec = '';
    let bodyStartIdx = afterBeginIdx;
    const braceRes = extractBalancedBraces(text, afterBeginIdx);
    if (braceRes) {
      colSpec = braceRes.content.trim();
      bodyStartIdx = braceRes.endIdx + 1;
    }

    const endRegex = /\\end\{(tabular|array)\}/i;
    const endMatch = text.substring(bodyStartIdx).match(endRegex);
    if (endMatch) {
      const body = text.substring(bodyStartIdx, bodyStartIdx + endMatch.index);
      const totalEndIdx = bodyStartIdx + endMatch.index + endMatch[0].length;
      latexInfo = { colSpec, body, beginIdx, totalEndIdx };
    }
  }

  // 前後の本文段落（解説文）の抽出
  let beforeText = '';
  let afterText = '';
  const outerTableMatch = text.match(/\\begin\{table\*?\}(?:\[[^\]]*\])?([\s\S]*?)\\end\{table\*?\}/i);
  if (outerTableMatch) {
    const tableIndex = outerTableMatch.index;
    const tableLength = outerTableMatch[0].length;
    beforeText = text.substring(0, tableIndex).trim();
    afterText = text.substring(tableIndex + tableLength).trim();
  } else if (latexInfo) {
    beforeText = text.substring(0, latexInfo.beginIdx).trim();
    afterText = text.substring(latexInfo.totalEndIdx).trim();
  }

  const cleanParagraph = (p) => {
    if (!p) return '';
    return p
      .replace(/\\begin\{(table\*?|center)\}(?:\[[^\]]*\])?/gi, '')
      .replace(/\\end\{(table\*?|center)\}/gi, '')
      .replace(/\\centering\b/gi, '')
      .replace(/\\caption\s*\{((?:[^{}]|\{[^{}]*\})*)\}/gi, '')
      .replace(/\\label\s*\{[^}]+\}/gi, '')
      .replace(/\\(?:renewcommand|def)\s*\{\\arraystretch\}\s*\{[^}]*\}/gi, '')
      .replace(/\\(?:renewcommand|def)\s*\\arraystretch\s*\{[^}]*\}/gi, '')
      .trim();
  };
  beforeText = cleanParagraph(beforeText);
  afterText = cleanParagraph(afterText);

  // \ref{...} の相互参照解決
  const resolveRef = (s) => {
    if (!s) return '';
    let res = s;
    if (tableLabel) {
      const labelEscaped = tableLabel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      res = res.replace(new RegExp(`表\\\\ref\\s*\\{${labelEscaped}\\}`, 'g'), '表 1');
      res = res.replace(new RegExp(`\\\\ref\\s*\\{${labelEscaped}\\}`, 'g'), '1');
    }
    res = res.replace(/表\\ref\s*\{[^}]+\}/g, '表 1');
    res = res.replace(/\\ref\s*\{[^}]+\}/g, '1');
    return res;
  };

  beforeText = resolveRef(beforeText);
  afterText = resolveRef(afterText);
  if (title) title = resolveRef(title);

  // \arraystretch の抽出
  let arrayStretch = 1.0;
  const stretchMatch = text.match(/\\(?:renewcommand\{\\arraystretch\}|def\\arraystretch)\s*\{([0-9.]+)\}/i);
  if (stretchMatch) {
    arrayStretch = parseFloat(stretchMatch[1]) || 1.0;
  }

  // センタリング (\centering, \begin{center}) の判定
  const isCentered = /\\centering\b|\\begin\{center\}/i.test(text);

  // 1. LaTeX tabular / array 環境の解析
  if (latexInfo) {
    let colSpec = latexInfo.colSpec;
    const body = latexInfo.body;

    // *{n}{spec} の展開
    while (/\*\{(\d+)\}\{([^{}]+)\}/.test(colSpec)) {
      colSpec = colSpec.replace(/\*\{(\d+)\}\{([^{}]+)\}/g, (_, count, inner) => inner.repeat(parseInt(count, 10)));
    }
    // @{...} の除去
    colSpec = colSpec.replace(/@\{[^{}]*\}/g, '');

    // colSpec の解析 (|l|c|r||r| または p{3cm}, m{2cm}, b{1in} などの縦罫線、アライメント、列幅)
    const aligns = [];
    const vBorders = [];
    const colWidths = [];
    const colVAligns = [];
    let specIdx = 0;
    let pendingV = 'none';

    while (specIdx < colSpec.length) {
      if (colSpec.substr(specIdx, 2) === '||') {
        pendingV = 'double';
        specIdx += 2;
      } else if (colSpec[specIdx] === '|') {
        if (pendingV !== 'double') pendingV = 'single';
        specIdx += 1;
      } else if (/[lcr]/i.test(colSpec[specIdx])) {
        vBorders.push(pendingV);
        pendingV = 'none';
        const ch = colSpec[specIdx].toLowerCase();
        if (ch === 'l') aligns.push('left');
        else if (ch === 'c') aligns.push('center');
        else if (ch === 'r') aligns.push('right');
        colWidths.push(null);
        colVAligns.push('middle');
        specIdx += 1;
      } else if (/[pmb]/i.test(colSpec[specIdx]) && colSpec[specIdx + 1] === '{') {
        const type = colSpec[specIdx].toLowerCase();
        const startBrace = specIdx + 1;
        const endBrace = colSpec.indexOf('}', startBrace);
        if (endBrace !== -1) {
          const rawW = colSpec.substring(startBrace + 1, endBrace).trim();
          vBorders.push(pendingV);
          pendingV = 'none';
          aligns.push('left');
          let parsedW = rawW;
          const twMatch = rawW.match(/([0-9.]+)\s*\\(?:text|line)width/);
          if (twMatch) {
            parsedW = `${Math.round(parseFloat(twMatch[1]) * 100)}%`;
          }
          colWidths.push(parsedW);
          if (type === 'p') colVAligns.push('top');
          else if (type === 'm') colVAligns.push('middle');
          else if (type === 'b') colVAligns.push('bottom');
          specIdx = endBrace + 1;
        } else {
          specIdx += 1;
        }
      } else {
        specIdx += 1;
      }
    }
    vBorders.push(pendingV);

    const numCols = aligns.length;
    const rawRows = splitLatexRows(body);
    const parsedRows = [];
    const rowBottomBorders = [];
    const rowBgColors = [];
    const rowExtraHeights = [];
    let topBorder = 'none';

    if (rawRows.length > 0) {
      const firstRowStr = rawRows[0];
      if (/\\toprule\b/.test(firstRowStr)) {
        topBorder = 'toprule';
      } else {
        const firstHlines = (firstRowStr.match(/\\hline\b/g) || []).length;
        if (firstHlines >= 2) topBorder = 'double';
        else if (firstHlines === 1) topBorder = 'single';
      }
    }

    for (let i = 0; i < rawRows.length; i++) {
      let raw = rawRows[i];

      // 行間拡張 \\[5pt] の抽出 (raw の先頭にある [5pt] 等)
      let extraHeight = null;
      const heightMatch = raw.match(/^\s*\[\s*([0-9a-zA-Z.]+)\s*\]/);
      if (heightMatch) {
        extraHeight = heightMatch[1];
        raw = raw.replace(/^\s*\[\s*[0-9a-zA-Z.]+\s*\]/, '');
      }

      // \rowcolor の抽出
      let rowBg = null;
      const rowColorMatch = raw.match(/\\rowcolor\s*(\[[^\]]*\])?\s*\{([^}]+)\}/i);
      if (rowColorMatch) {
        rowBg = parseLatexColor((rowColorMatch[1] || '') + '{' + rowColorMatch[2] + '}');
        raw = raw.replace(/\\rowcolor\s*(\[[^\]]*\])?\s*\{[^}]+\}/i, '');
      }

      const cleaned = raw
        .replace(/\\(hline|toprule|midrule|bottomrule)\b/g, '')
        .replace(/\\cline\s*\{\s*\d+\s*-\s*\d+\s*\}/g, '')
        .replace(/\\cmidrule(?:\([^\)]*\))?\s*\{\s*\d+\s*-\s*\d+\s*\}/g, '')
        .trim();

      const colBottoms = Array(numCols).fill('none');
      if (i + 1 < rawRows.length) {
        const nextRaw = rawRows[i + 1];

        if (/\\bottomrule\b/.test(nextRaw)) {
          colBottoms.fill('bottomrule');
        } else if (/\\midrule\b/.test(nextRaw)) {
          colBottoms.fill('midrule');
        } else {
          const hlines = (nextRaw.match(/\\hline\b/g) || []).length;
          if (hlines >= 2) {
            colBottoms.fill('double');
          } else if (hlines === 1) {
            colBottoms.fill('single');
          }
        }

        // \cline{from-to} の解析
        const clineRegex = /\\cline\s*\{\s*(\d+)\s*-\s*(\d+)\s*\}/g;
        let cMatch;
        while ((cMatch = clineRegex.exec(nextRaw)) !== null) {
          const from = parseInt(cMatch[1], 10) - 1;
          const to = parseInt(cMatch[2], 10) - 1;
          for (let c = from; c <= to && c < numCols; c++) {
            if (c >= 0) colBottoms[c] = 'single';
          }
        }

        // \cmidrule(lr){from-to} の解析
        const cmidRegex = /\\cmidrule(?:\([^\)]*\))?\s*\{\s*(\d+)\s*-\s*(\d+)\s*\}/g;
        let cmMatch;
        while ((cmMatch = cmidRegex.exec(nextRaw)) !== null) {
          const from = parseInt(cmMatch[1], 10) - 1;
          const to = parseInt(cmMatch[2], 10) - 1;
          for (let c = from; c <= to && c < numCols; c++) {
            if (c >= 0) colBottoms[c] = 'cmidrule';
          }
        }
      } else {
        if (/\\bottomrule\b/.test(raw)) {
          colBottoms.fill('bottomrule');
        }
      }

      if (!cleaned) continue;

      const cells = splitLatexCells(cleaned);
      if (cells.length > 0 && cells.some((c) => c.length > 0)) {
        parsedRows.push(cells);
        rowBottomBorders.push(colBottoms);
        rowBgColors.push(rowBg);
        rowExtraHeights.push(extraHeight);
      }
    }

    if (parsedRows.length > 0) {
      const headers = parsedRows[0];
      const rows = parsedRows.slice(1);
      return {
        headers,
        rows,
        aligns,
        vBorders,
        rowBottomBorders,
        rowBgColors,
        rowExtraHeights,
        colWidths,
        colVAligns,
        arrayStretch,
        topBorder,
        style,
        title,
        isLatex: true,
        isCentered,
        beforeText,
        afterText
      };
    }
  }

  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return null;

  // 2. Markdown 表の判定
  const isMdLike = lines.every((l) => l.includes('|'));
  if (isMdLike) {
    const splitMdRow = (line) => {
      let trimmed = line;
      if (trimmed.startsWith('|')) trimmed = trimmed.substring(1);
      if (trimmed.endsWith('|')) trimmed = trimmed.substring(0, trimmed.length - 1);
      return trimmed.split('|').map((c) => c.trim());
    };

    const firstRow = splitMdRow(lines[0]);
    if (firstRow.length >= 2) {
      let aligns = [];
      let rowsStartIndex = 1;

      if (lines.length >= 2 && /^\|?(\s*:?-+:?\s*\|?)+$/.test(lines[1])) {
        const sepCols = splitMdRow(lines[1]);
        aligns = sepCols.map((c) => {
          const l = c.startsWith(':');
          const r = c.endsWith(':');
          if (l && r) return 'center';
          if (r) return 'right';
          if (l) return 'left';
          return 'left';
        });
        rowsStartIndex = 2;
      }

      const headers = firstRow;
      const rows = [];
      for (let i = rowsStartIndex; i < lines.length; i++) {
        rows.push(splitMdRow(lines[i]));
      }
      return { headers, rows, aligns, style, title };
    }
  }

  // 3. CSV / TSV の判定
  const delimiter = lines[0].includes('\t') ? '\t' : (lines[0].includes(',') ? ',' : null);
  if (delimiter) {
    const parseCsvLine = (line, delim) => {
      const result = [];
      let current = '';
      let inQuote = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          inQuote = !inQuote;
        } else if (ch === delim && !inQuote) {
          result.push(current.trim().replace(/^["']|["']$/g, ''));
          current = '';
        } else {
          current += ch;
        }
      }
      result.push(current.trim().replace(/^["']|["']$/g, ''));
      return result;
    };

    const firstRow = parseCsvLine(lines[0], delimiter);
    if (firstRow.length >= 2) {
      const rows = [];
      let valid = true;
      for (let i = 1; i < lines.length; i++) {
        const row = parseCsvLine(lines[i], delimiter);
        if (row.length >= 2) {
          rows.push(row);
        } else {
          valid = false;
          break;
        }
      }
      if (valid && rows.length > 0) {
        return { headers: firstRow, rows, aligns: [], style, title };
      }
    }
  }

  return null;
}

function renderTableCellHtml(rawCellText) {
  if (!rawCellText) return '';
  let str = rawCellText.trim();

  // makecell / thead の展開
  str = str.replace(/\\makecell(?:\s*\[([lcr])\])?\s*\{((?:[^{}]|\{[^{}]*\})*)\}/gi, (_, al, c) => {
    const formatted = c.replace(/\\\\/g, '<br>').replace(/\r?\n/g, '<br>');
    const alignStyle = al ? ` style="text-align:${al === 'l' ? 'left' : al === 'r' ? 'right' : 'center'};"` : '';
    return `<div class="physi-makecell"${alignStyle}>${formatted}</div>`;
  });
  str = str.replace(/\\thead\s*\{((?:[^{}]|\{[^{}]*\})*)\}/gi, (_, c) => {
    const formatted = c.replace(/\\\\/g, '<br>').replace(/\r?\n/g, '<br>');
    return `<div class="physi-thead">${formatted}</div>`;
  });

  // 1. $式$ のインライン数式置換
  const mathRegex = /\$([^$]+)\$/g;
  if (mathRegex.test(str)) {
    str = str.replace(mathRegex, (_, expr) => {
      if (typeof katex !== 'undefined') {
        try {
          return katex.renderToString(expr.trim(), { throwOnError: false });
        } catch {
          return expr;
        }
      }
      return expr;
    });
  } else if (/^\\(text|frac|sqrt|vec|dot|theta|alpha|beta|omega|mu|sigma|lambda|Delta|nabla|partial|approx|pm|times|div)/i.test(str)) {
    if (typeof katex !== 'undefined') {
      try {
        str = katex.renderToString(str, { throwOnError: false });
      } catch {
        // fallback
      }
    }
  }

  // 2. KaTeX 未変換のテキストに対する HTML エスケープ
  if (!str.includes('<span class="katex">') && !str.includes('<div class="physi-')) {
    str = str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // 3. セル内および本文内改行
  str = str.replace(/\r?\n/g, '<br>').replace(/\\n/g, '<br>').replace(/&lt;br\s*\/?&gt;/gi, '<br>');

  return str;
}


function parseCellSpec(rawCellText) {
  if (!rawCellText) return { content: '', colspan: 1, rowspan: 1, align: null, leftBorder: 'none', rightBorder: 'none', bgColor: null, vAlign: null, isRowSpanPlaceholder: false };
  let trimmed = rawCellText.trim();
  let bgColor = null;

  // \cellcolor の抽出
  const cellColorMatch = trimmed.match(/\\cellcolor\s*(\[[^\]]*\])?\s*\{([^}]+)\}/i);
  if (cellColorMatch) {
    bgColor = parseLatexColor((cellColorMatch[1] || '') + '{' + cellColorMatch[2] + '}');
    trimmed = trimmed.replace(/\\cellcolor\s*(\[[^\]]*\])?\s*\{[^}]+\}/i, '').trim();
  }

  // \multicolumn の抽出
  let colspan = 1;
  let align = null;
  let leftBorder = 'none';
  let rightBorder = 'none';
  const mcMatch = trimmed.match(/^\\multicolumn\s*\{\s*(\d+)\s*\}\s*\{\s*([^}]*)\s*\}\s*\{([\s\S]*)\}$/i);
  if (mcMatch) {
    colspan = parseInt(mcMatch[1], 10) || 1;
    const spec = (mcMatch[2] || '').trim();
    trimmed = (mcMatch[3] || '').trim();
    if (spec.startsWith('||')) leftBorder = 'double';
    else if (spec.startsWith('|')) leftBorder = 'single';
    if (spec.endsWith('||')) rightBorder = 'double';
    else if (spec.endsWith('|')) rightBorder = 'single';
    if (/l/i.test(spec)) align = 'left';
    else if (/c/i.test(spec)) align = 'center';
    else if (/r/i.test(spec)) align = 'right';
  }

  // \multirow の抽出
  let rowspan = 1;
  let vAlign = null;
  const mrMatch = trimmed.match(/^\\multirow\s*\{\s*(\d+)\s*\}\s*\{([^}]*)\}\s*\{([\s\S]*)\}$/i);
  if (mrMatch) {
    rowspan = parseInt(mrMatch[1], 10) || 1;
    trimmed = (mrMatch[3] || '').trim();
    vAlign = 'middle';
  }

  const isRowSpanPlaceholder = /^\\rowspan(?:\s*|\{\d*\})?$/i.test(trimmed);

  return {
    content: trimmed,
    colspan,
    rowspan,
    isRowSpanPlaceholder,
    align,
    vAlign,
    leftBorder,
    rightBorder,
    bgColor
  };
}

function parseMulticolumnCell(rawCellText) {
  const spec = parseCellSpec(rawCellText);
  if (spec.colspan > 1 || spec.leftBorder !== 'none' || spec.rightBorder !== 'none' || spec.align) {
    return { cols: spec.colspan, align: spec.align, leftBorder: spec.leftBorder, rightBorder: spec.rightBorder, content: spec.content };
  }
  return null;
}

function renderTableElement(tableData, container, labelText) {
  container.innerHTML = '';
  if (!tableData || !tableData.headers || tableData.headers.length === 0) return;

  // 1. 前段解説文 (beforeText) の描画
  if (tableData.beforeText) {
    const beforeDiv = document.createElement('div');
    beforeDiv.className = 'physi-table-text-paragraph before-text';
    beforeDiv.innerHTML = renderTableCellHtml(tableData.beforeText);
    container.appendChild(beforeDiv);
  }

  const table = document.createElement('table');
  const tableStyle = tableData.style || 'academic';
  table.className = `physi-table table-style-${tableStyle}${tableData.isLatex ? ' table-latex-bordered' : ''}`;

  if (tableData.isCentered) {
    table.style.marginLeft = 'auto';
    table.style.marginRight = 'auto';
    container.style.alignItems = 'center';
  }

  if (tableData.title) {
    const caption = document.createElement('caption');
    caption.className = 'physi-table-caption';
    caption.innerHTML = renderTableCellHtml(tableData.title);
    table.appendChild(caption);
  }

  const arrayStretch = tableData.arrayStretch || 1.0;
  const basePaddingTop = 8 * arrayStretch;
  const basePaddingBottom = 8 * arrayStretch;

  const thead = document.createElement('thead');
  const headTr = document.createElement('tr');
  if (tableData.isLatex && tableData.topBorder && tableData.topBorder !== 'none') {
    headTr.classList.add(`border-t-${tableData.topBorder}`);
  }
  if (tableData.rowBgColors && tableData.rowBgColors[0]) {
    headTr.style.backgroundColor = tableData.rowBgColors[0];
  }

  let currentHeadColIdx = 0;
  tableData.headers.forEach((hText) => {
    const th = document.createElement('th');
    const spec = parseCellSpec(hText);
    const content = spec.content;
    const colspan = spec.colspan;

    th.innerHTML = renderTableCellHtml(content);
    if (colspan > 1) {
      th.setAttribute('colspan', colspan);
    }
    if (spec.bgColor) {
      th.style.backgroundColor = spec.bgColor;
    } else if (tableData.rowBgColors && tableData.rowBgColors[0]) {
      th.style.backgroundColor = tableData.rowBgColors[0];
    }

    const defaultAlign = (tableData.aligns && tableData.aligns[currentHeadColIdx]) || 'left';
    th.style.textAlign = spec.align || defaultAlign;

    if (tableData.colWidths && tableData.colWidths[currentHeadColIdx]) {
      th.style.width = tableData.colWidths[currentHeadColIdx];
    }
    if (tableData.colVAligns && tableData.colVAligns[currentHeadColIdx]) {
      th.style.verticalAlign = tableData.colVAligns[currentHeadColIdx];
    }
    th.style.paddingTop = `${basePaddingTop}px`;
    th.style.paddingBottom = `${basePaddingBottom}px`;

    if (currentHeadColIdx === 0) {
      th.classList.add('table-col-first');
    }

    if (tableData.isLatex) {
      if (tableData.vBorders) {
        let lBorder = (currentHeadColIdx === 0 && tableData.vBorders[0]) ? tableData.vBorders[0] : 'none';
        if (spec.leftBorder !== 'none') lBorder = spec.leftBorder;
        if (lBorder !== 'none') th.classList.add(`border-l-${lBorder}`);

        const rightEdgeIdx = currentHeadColIdx + colspan;
        let rBorder = (tableData.vBorders[rightEdgeIdx]) ? tableData.vBorders[rightEdgeIdx] : 'none';
        if (spec.rightBorder !== 'none') rBorder = spec.rightBorder;
        if (rBorder !== 'none') th.classList.add(`border-r-${rBorder}`);
      }
      if (tableData.rowBottomBorders && tableData.rowBottomBorders[0]) {
        const bList = tableData.rowBottomBorders[0];
        let b = 'none';
        if (Array.isArray(bList)) {
          for (let c = currentHeadColIdx; c < currentHeadColIdx + colspan && c < bList.length; c++) {
            if (bList[c] === 'double' || bList[c] === 'bottomrule') { b = bList[c]; break; }
            if (bList[c] === 'midrule' || bList[c] === 'single' || bList[c] === 'cmidrule') b = bList[c];
          }
        } else if (typeof bList === 'string') {
          b = bList;
        }
        if (b !== 'none') th.classList.add(`border-b-${b}`);
        else th.classList.add('border-b-none');
      }
    }

    headTr.appendChild(th);
    currentHeadColIdx += colspan;
  });
  thead.appendChild(headTr);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  const activeSpans = {}; // colIdx -> { remaining: number, td: HTMLTableCellElement, count: number }

  tableData.rows.forEach((row, rowIdx) => {
    const tr = document.createElement('tr');
    const actualRowIdx = rowIdx + 1;
    if (tableData.rowBgColors && tableData.rowBgColors[actualRowIdx]) {
      tr.style.backgroundColor = tableData.rowBgColors[actualRowIdx];
    }
    if (tableData.rowExtraHeights && tableData.rowExtraHeights[actualRowIdx]) {
      const extra = tableData.rowExtraHeights[actualRowIdx];
      tr.style.height = `calc(1em + ${extra})`;
    }

    let currentColIdx = 0;
    let cellIdx = 0;

    while (currentColIdx < (tableData.aligns ? tableData.aligns.length : row.length)) {
      // 縦結合の継続セル判定
      if (activeSpans[currentColIdx] && activeSpans[currentColIdx].remaining > 0) {
        activeSpans[currentColIdx].remaining -= 1;
        if (cellIdx < row.length) {
          const rawCell = (row[cellIdx] || '').trim();
          if (!rawCell || /^\\rowspan/i.test(rawCell)) {
            cellIdx += 1;
          }
        }
        currentColIdx += 1;
        continue;
      }

      if (cellIdx >= row.length) break;
      const cText = row[cellIdx];
      cellIdx += 1;

      const spec = parseCellSpec(cText);
      const colspan = spec.colspan;
      const rowspan = spec.rowspan;

      if (spec.isRowSpanPlaceholder && activeSpans[currentColIdx] && activeSpans[currentColIdx].td) {
        // 直前の有効なセルと縦結合
        activeSpans[currentColIdx].count = (activeSpans[currentColIdx].count || 1) + 1;
        const targetTd = activeSpans[currentColIdx].td;
        targetTd.setAttribute('rowspan', activeSpans[currentColIdx].count);
        targetTd.style.verticalAlign = 'middle';
        currentColIdx += 1;
      } else {
        const td = document.createElement('td');
        td.innerHTML = renderTableCellHtml(spec.content);

        if (colspan > 1) {
          td.setAttribute('colspan', colspan);
        }
        if (rowspan > 1) {
          td.setAttribute('rowspan', rowspan);
          td.style.verticalAlign = spec.vAlign || 'middle';
          activeSpans[currentColIdx] = { td, remaining: rowspan - 1, count: rowspan };
        } else {
          activeSpans[currentColIdx] = { td, remaining: 0, count: 1 };
        }

        if (spec.bgColor) {
          td.style.backgroundColor = spec.bgColor;
        } else if (tableData.rowBgColors && tableData.rowBgColors[actualRowIdx]) {
          td.style.backgroundColor = tableData.rowBgColors[actualRowIdx];
        }

        const defaultAlign = (tableData.aligns && tableData.aligns[currentColIdx]) || 'left';
        td.style.textAlign = spec.align || defaultAlign;

        if (tableData.colWidths && tableData.colWidths[currentColIdx]) {
          td.style.width = tableData.colWidths[currentColIdx];
        }
        if (spec.vAlign) {
          td.style.verticalAlign = spec.vAlign;
        } else if (tableData.colVAligns && tableData.colVAligns[currentColIdx]) {
          td.style.verticalAlign = tableData.colVAligns[currentColIdx];
        }

        td.style.paddingTop = `${basePaddingTop}px`;
        td.style.paddingBottom = `${basePaddingBottom}px`;

        if (currentColIdx === 0) {
          td.classList.add('table-col-first');
        }

        if (tableData.isLatex) {
          if (tableData.vBorders) {
            let lBorder = (currentColIdx === 0 && tableData.vBorders[0]) ? tableData.vBorders[0] : 'none';
            if (spec.leftBorder !== 'none') lBorder = spec.leftBorder;
            if (lBorder !== 'none') td.classList.add(`border-l-${lBorder}`);

            const rightEdgeIdx = currentColIdx + colspan;
            let rBorder = (tableData.vBorders[rightEdgeIdx]) ? tableData.vBorders[rightEdgeIdx] : 'none';
            if (spec.rightBorder !== 'none') rBorder = spec.rightBorder;
            if (rBorder !== 'none') td.classList.add(`border-r-${rBorder}`);
          }
          if (tableData.rowBottomBorders && tableData.rowBottomBorders[actualRowIdx]) {
            const bList = tableData.rowBottomBorders[actualRowIdx];
            let b = 'none';
            if (Array.isArray(bList)) {
              for (let c = currentColIdx; c < currentColIdx + colspan && c < bList.length; c++) {
                if (bList[c] === 'double' || bList[c] === 'bottomrule') { b = bList[c]; break; }
                if (bList[c] === 'midrule' || bList[c] === 'single' || bList[c] === 'cmidrule') b = bList[c];
              }
            } else if (typeof bList === 'string') {
              b = bList;
            }
            if (b !== 'none') td.classList.add(`border-b-${b}`);
            else td.classList.add('border-b-none');
          }
        }

        tr.appendChild(td);
        currentColIdx += colspan;
      }
    }
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  container.appendChild(table);

  // 2. 後段解説文 (afterText) の描画
  if (tableData.afterText) {
    const afterDiv = document.createElement('div');
    afterDiv.className = 'physi-table-text-paragraph after-text';
    afterDiv.innerHTML = renderTableCellHtml(tableData.afterText);
    container.appendChild(afterDiv);
  }

  if (labelText && !tableData.title) {
    const lbl = document.createElement('div');
    lbl.className = 'chem-structure-label';
    lbl.textContent = labelText;
    container.appendChild(lbl);
  }
}
