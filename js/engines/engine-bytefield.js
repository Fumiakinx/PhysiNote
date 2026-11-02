// ==========================================
// パケットヘッダ・メモリレイアウト図 (bytefield) エンジン
// LaTeX bytefield (\begin{bytefield}) & 独自構文 (\packet, \bytefield)
// ==========================================

/**
 * テキスト自動折り返しヘルパー
 */
function wrapBytefieldText(str, maxChars = 16) {
  if (!str) return [];
  if (str.includes('\\n') || str.includes('\n')) {
    return str.split(/\\n|\n/).map(s => s.trim()).filter(Boolean);
  }
  const lines = [];
  let cur = '';
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    cur += ch;
    const len = cur.replace(/[^\x00-\xff]/g, 'aa').length;
    if (len >= maxChars * 2 && i < str.length - 1) {
      lines.push(cur.trim());
      cur = '';
    }
  }
  if (cur.trim()) lines.push(cur.trim());
  return lines;
}

/**
 * bytefield 構文パーサー
 * @param {string} rawText
 * @returns {object|null}
 */
function parseBytefield(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;

  const defaultFieldColors = [
    { bg: '#eff6ff', border: '#3b82f6', text: '#1e40af' }, // Blue
    { bg: '#ecfdf5', border: '#10b981', text: '#065f46' }, // Emerald
    { bg: '#fffbeb', border: '#f59e0b', text: '#92400e' }, // Amber
    { bg: '#f5f3ff', border: '#8b5cf6', text: '#5b21b6' }, // Purple
    { bg: '#ecfeff', border: '#06b6d4', text: '#155e75' }, // Cyan
    { bg: '#fdf2f8', border: '#ec4899', text: '#9d174d' }, // Pink
    { bg: '#fef2f2', border: '#ef4444', text: '#991b1b' }, // Red
    { bg: '#f8fafc', border: '#64748b', text: '#334155' }  // Slate
  ];

  let title = '';
  const titleM = rawText.match(/(?:%|#|\/\/)\s*title\s*:\s*(.+)$/im);
  if (titleM) {
    title = titleM[1].trim().replace(/;$/, '').replace(/^["']|["']$/g, '');
  }

  let bitsPerRow = 32;
  const headerMarkers = [];
  const rawFields = []; // { width, label, color, isWord }

  // 1. LaTeX bytefield 構文判定
  if (/\\begin\{bytefield\}/i.test(rawText)) {
    // \begin{bytefield}[...]{32}
    const envMatch = rawText.match(/\\begin\{bytefield\}(?:\[([^\]]*)\])?\s*\{(\d+)\}([\s\S]*?)\\end\{bytefield\}/i);
    if (!envMatch) return null;

    bitsPerRow = parseInt(envMatch[2], 10) || 32;
    const body = envMatch[3];

    // \bitheader{0-31} または \bitheader{0, 4, 8, ...}
    const headerMatch = body.match(/\\bitheader(?:\[[^\]]*\])?\s*\{([^}]+)\}/i);
    if (headerMatch) {
      const hStr = headerMatch[1].trim();
      if (hStr.includes('-')) {
        const parts = hStr.split('-').map(s => parseInt(s.trim(), 10));
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          for (let b = parts[0]; b <= parts[1]; b++) {
            if (b === 0 || b === parts[1] || b % 4 === 0 || b % 8 === 0) headerMarkers.push(b);
          }
        }
      } else {
        hStr.split(',').forEach(p => {
          const v = parseInt(p.trim(), 10);
          if (!isNaN(v)) headerMarkers.push(v);
        });
      }
    }

    // 各ボックスの抽出 (\bitbox{width}{label}, \wordbox{lines}{label})
    const boxRegex = /\\(bitbox|wordbox)(?:\[([^\]]*)\])?\s*\{(\d+)\}\s*\{([^}]*)\}/gi;
    let bM;
    let colIdx = 0;
    while ((bM = boxRegex.exec(body)) !== null) {
      const kind = bM[1].toLowerCase();
      const num = parseInt(bM[3], 10) || 1;
      let label = bM[4].trim().replace(/\\\\/g, ' / ');

      let customColor = null;
      const colMatch = label.match(/\[(#?[a-zA-Z0-9]+)\]$/);
      if (colMatch) {
        const cTag = colMatch[1];
        label = label.replace(/\[#?[a-zA-Z0-9]+\]$/, '').trim();
        if (/^#[0-9a-fA-F]{3,8}$/.test(cTag)) {
          customColor = { bg: cTag + '18', border: cTag, text: cTag };
        }
      }

      if (kind === 'bitbox') {
        rawFields.push({
          width: num,
          label,
          color: customColor || defaultFieldColors[colIdx % defaultFieldColors.length],
          isWord: false
        });
        colIdx++;
      } else {
        // wordbox は 1行丸ごとの複数行
        for (let w = 0; w < num; w++) {
          rawFields.push({
            width: bitsPerRow,
            label: w === 0 ? label : '',
            color: customColor || defaultFieldColors[colIdx % defaultFieldColors.length],
            isWord: true
          });
        }
        colIdx++;
      }
    }
  } else {
    // 2. 独自構文判定 (\packet{...}, \bytefield{...})
    let content = rawText.trim();
    const cmdMatch = content.match(/^\\(?:packet|bytefield|memorymap)\s*\{([\s\S]*)\}\s*$/i);
    if (cmdMatch) content = cmdMatch[1];

    const lines = content.split('\n');
    let colIdx = 0;

    lines.forEach(rawLine => {
      let line = rawLine.trim();
      if (!line || line.startsWith('//') || line.startsWith('#') || line.startsWith('%')) return;

      // title: ...
      const tM = line.match(/^title\s*:\s*(.+)$/i);
      if (tM) {
        title = tM[1].trim().replace(/;$/, '').replace(/^["']|["']$/g, '');
        return;
      }

      // bits: 32; または width: 16;
      const bM = line.match(/^(?:bits|width|size)\s*:\s*(\d+)/i);
      if (bM) {
        bitsPerRow = parseInt(bM[1], 10) || 32;
        return;
      }

      // [16] 送信元ポート番号 [#38bdf8]; のようなフィールド指定
      const fieldRegex = /\[(\d+)\]\s*([^;]+)(?:;|$)/g;
      let fM;
      while ((fM = fieldRegex.exec(line)) !== null) {
        const w = parseInt(fM[1], 10) || 1;
        let label = fM[2].trim();

        let customColor = null;
        const colMatch = label.match(/\[(#?[a-zA-Z0-9]+)\]$/);
        if (colMatch) {
          const cTag = colMatch[1];
          label = label.replace(/\[#?[a-zA-Z0-9]+\]$/, '').trim();
          if (/^#[0-9a-fA-F]{3,8}$/.test(cTag)) {
            customColor = { bg: cTag + '18', border: cTag, text: cTag };
          }
        }

        label = label.replace(/^["']|["']$/g, '').trim();

        rawFields.push({
          width: w,
          label,
          color: customColor || defaultFieldColors[colIdx % defaultFieldColors.length],
          isWord: w >= bitsPerRow
        });
        colIdx++;
      }
    });
  }

  if (rawFields.length === 0) return null;

  // デフォルトのヘッダ目盛りがなければ生成
  if (headerMarkers.length === 0) {
    if (bitsPerRow === 32) {
      headerMarkers.push(0, 4, 8, 16, 24, 31);
    } else if (bitsPerRow === 16) {
      headerMarkers.push(0, 4, 8, 12, 15);
    } else if (bitsPerRow === 8) {
      headerMarkers.push(0, 2, 4, 6, 7);
    } else {
      headerMarkers.push(0, Math.floor(bitsPerRow / 2), bitsPerRow - 1);
    }
  }

  // 行（Row）へのパッキング
  const rows = [];
  let currentRow = [];
  let currentBits = 0;

  rawFields.forEach(f => {
    let remaining = f.width;
    while (remaining > 0) {
      const spaceInRow = bitsPerRow - currentBits;
      const alloc = Math.min(remaining, spaceInRow);

      currentRow.push({
        width: alloc,
        totalWidth: f.width,
        label: remaining === f.width ? f.label : `(cont.)`,
        color: f.color,
        isWord: f.isWord
      });

      currentBits += alloc;
      remaining -= alloc;

      if (currentBits >= bitsPerRow) {
        rows.push(currentRow);
        currentRow = [];
        currentBits = 0;
      }
    }
  });

  if (currentRow.length > 0) {
    rows.push(currentRow);
  }

  return {
    title: title || 'パケットヘッダ / ビットフィールド仕様図',
    bitsPerRow,
    headerMarkers: Array.from(new Set(headerMarkers)).sort((a, b) => a - b),
    rows
  };
}

/**
 * bytefield SVG 描画エンジン
 * @param {string} text - 入力ソースコード
 * @param {HTMLElement} container - 描画先DOM要素
 * @param {string|null} labelText - キャプション
 */
function drawBytefieldSvg(text, container, labelText) {
  if (!container) return;
  container.innerHTML = '';

  const data = parseBytefield(text);
  if (!data || data.rows.length === 0) {
    container.innerHTML = '<div style="color: #ef4444; padding: 12px; font-size: 13px;">bytefield 構文を認識できませんでした。</div>';
    return;
  }

  const svgNS = 'http://www.w3.org/2000/svg';
  const { title, bitsPerRow, headerMarkers, rows } = data;

  const totalW = 740;
  const marginX = 40;
  const gridW = totalW - marginX * 2;
  const bitW = gridW / bitsPerRow;

  const headerH = 26;
  const rowH = 46;
  const rowGap = 5;

  const titleH = title ? 48 : 20;
  const gridStartY = titleH + headerH;
  const totalH = gridStartY + rows.length * (rowH + rowGap) + 30;

  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${totalW} ${totalH}`);
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.setAttribute('style', 'max-width: 100%; height: auto; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif; display: block; margin: 0 auto; background: #ffffff; border-radius: 8px;');

  // 定義 (ドロップシャドウ)
  const defs = document.createElementNS(svgNS, 'defs');
  defs.innerHTML = `
    <filter id="bytefield-shadow" x="-10%" y="-15%" width="120%" height="135%">
      <feDropShadow dx="0" dy="1.5" stdDeviation="2" flood-color="#0f172a" flood-opacity="0.06" />
    </filter>
  `;
  svg.appendChild(defs);

  // タイトル描画
  if (title) {
    const titleText = document.createElementNS(svgNS, 'text');
    titleText.setAttribute('x', totalW / 2);
    titleText.setAttribute('y', '32');
    titleText.setAttribute('text-anchor', 'middle');
    titleText.setAttribute('font-size', '16');
    titleText.setAttribute('font-weight', '700');
    titleText.setAttribute('fill', '#0f172a');
    titleText.textContent = title;
    svg.appendChild(titleText);
  }

  // ビット目盛りヘッダ描画
  const headerG = document.createElementNS(svgNS, 'g');
  const hY = titleH + 16;

  // 目盛り基底ライン
  const hLine = document.createElementNS(svgNS, 'line');
  hLine.setAttribute('x1', marginX);
  hLine.setAttribute('y1', hY + 6);
  hLine.setAttribute('x2', marginX + gridW);
  hLine.setAttribute('y2', hY + 6);
  hLine.setAttribute('stroke', '#94a3b8');
  hLine.setAttribute('stroke-width', '1.5');
  headerG.appendChild(hLine);

  headerMarkers.forEach(m => {
    if (m < 0 || m >= bitsPerRow) return;
    const mx = marginX + m * bitW + bitW / 2;

    const tick = document.createElementNS(svgNS, 'line');
    tick.setAttribute('x1', mx.toFixed(1));
    tick.setAttribute('y1', hY + 2);
    tick.setAttribute('x2', mx.toFixed(1));
    tick.setAttribute('y2', hY + 7);
    tick.setAttribute('stroke', '#64748b');
    tick.setAttribute('stroke-width', '1.5');
    headerG.appendChild(tick);

    const txt = document.createElementNS(svgNS, 'text');
    txt.setAttribute('x', mx.toFixed(1));
    txt.setAttribute('y', hY - 1);
    txt.setAttribute('text-anchor', 'middle');
    txt.setAttribute('font-size', '10.5');
    txt.setAttribute('font-weight', '700');
    txt.setAttribute('fill', '#475569');
    txt.textContent = String(m);
    headerG.appendChild(txt);
  });
  svg.appendChild(headerG);

  // データ行描画
  const rowsG = document.createElementNS(svgNS, 'g');

  rows.forEach((row, rIdx) => {
    const curY = gridStartY + rIdx * (rowH + rowGap);
    let curX = marginX;

    row.forEach(field => {
      const fw = field.width * bitW;
      const g = document.createElementNS(svgNS, 'g');
      g.setAttribute('transform', `translate(${curX.toFixed(1)}, ${curY.toFixed(1)})`);

      // フィールド矩形
      const rect = document.createElementNS(svgNS, 'rect');
      rect.setAttribute('width', (fw - 2).toFixed(1));
      rect.setAttribute('height', rowH);
      rect.setAttribute('rx', '4');
      rect.setAttribute('fill', field.color.bg || '#f8fafc');
      rect.setAttribute('stroke', field.color.border || '#cbd5e1');
      rect.setAttribute('stroke-width', '1.8');
      rect.setAttribute('filter', 'url(#bytefield-shadow)');
      g.appendChild(rect);

      // ビット幅バッジ（小さく右上に表示）
      if (fw >= 32) {
        const badgeText = document.createElementNS(svgNS, 'text');
        badgeText.setAttribute('x', (fw - 7).toFixed(1));
        badgeText.setAttribute('y', '12');
        badgeText.setAttribute('text-anchor', 'end');
        badgeText.setAttribute('font-size', '9');
        badgeText.setAttribute('font-weight', '600');
        badgeText.setAttribute('fill', field.color.border || '#64748b');
        badgeText.setAttribute('opacity', '0.85');
        badgeText.textContent = `${field.totalWidth || field.width}b`;
        g.appendChild(badgeText);
      }

      // ラベルテキスト描画
      const lines = wrapBytefieldText(field.label, Math.max(Math.floor(fw / 11), 3));
      const textStartY = rowH / 2 - (lines.length - 1) * 7 + 4.5;

      lines.forEach((tl, lIdx) => {
        const tEl = document.createElementNS(svgNS, 'text');
        tEl.setAttribute('x', ((fw - 2) / 2).toFixed(1));
        tEl.setAttribute('y', (textStartY + lIdx * 14).toFixed(1));
        tEl.setAttribute('text-anchor', 'middle');
        tEl.setAttribute('font-size', fw < 50 ? '11' : '12.5');
        tEl.setAttribute('font-weight', '700');
        tEl.setAttribute('fill', field.color.text || '#0f172a');
        tEl.textContent = tl;
        g.appendChild(tEl);
      });

      // ツールチップ
      const tip = document.createElementNS(svgNS, 'title');
      tip.textContent = `${field.label} (${field.totalWidth || field.width} bits)`;
      g.appendChild(tip);

      rowsG.appendChild(g);
      curX += fw;
    });
  });

  svg.appendChild(rowsG);
  container.appendChild(svg);
  appendDiagramLabel(container, labelText);
}

