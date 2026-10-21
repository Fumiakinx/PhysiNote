// ==========================================
// SWOT分析マトリクス (2×2 戦略マップ) エンジン
// ==========================================

/**
 * SWOT構文のパーサー
 * @param {string} rawText
 * @returns {object}
 */
function parseSwot(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;

  let content = rawText.trim();
  const cmdMatch = content.match(/^\\(?:swot|swotmatrix)\s*\{([\s\S]*)\}\s*$/i);
  if (cmdMatch) {
    content = cmdMatch[1];
  }

  const lines = content.split('\n');

  let title = '';
  let subtitle = '';
  let type = 'card'; // 'card' (デフォルト・箇条書きカード) | 'tile' (2x2密着カラーブロック)

  const quadrants = {
    s: { key: 's', label: '強み (Strengths)', sub: '内部要因 / プラス', items: [] },
    w: { key: 'w', label: '弱み (Weaknesses)', sub: '内部要因 / マイナス', items: [] },
    o: { key: 'o', label: '機会 (Opportunities)', sub: '外部要因 / プラス', items: [] },
    t: { key: 't', label: '脅威 (Threats)', sub: '外部要因 / マイナス', items: [] }
  };

  let currentQuad = null;

  function parseItemString(str) {
    let text = str.trim();
    if (!text) return null;

    // 行末カンマやセミコロンの除去
    text = text.replace(/[,;]+$/, '').trim();

    let isHighlight = false;
    const hlMatch = text.match(/\[(.*?)\]/);
    if (hlMatch) {
      const tag = hlMatch[1].toLowerCase();
      if (tag.includes('highlight') || tag.includes('important') || tag.includes('key') || tag.includes('root')) {
        isHighlight = true;
      }
      text = text.replace(/\[(.*?)\]/, '').trim();
    }

    text = text.replace(/^["']|["']$/g, '').trim();
    if (!text) return null;

    return { text, isHighlight };
  }

  lines.forEach(rawLine => {
    let line = rawLine.trim();
    if (!line || line.startsWith('//') || line.startsWith('#')) return;

    // タイプ指定 (type: tile / type: block / type: card)
    const typeM = line.match(/^type\s*:\s*(.+)$/i);
    if (typeM) {
      const t = typeM[1].trim().toLowerCase().replace(/^["']|["']$/g, '').replace(/;$/, '');
      if (/^(tile|matrix|block|classic|quadrant)$/i.test(t)) {
        type = 'tile';
      } else {
        type = 'card';
      }
      currentQuad = null;
      return;
    }

    // タイトル
    const titleM = line.match(/^title\s*:\s*(.+)$/i);
    if (titleM) {
      title = titleM[1].trim().replace(/;$/, '').trim().replace(/^["']|["']$/g, '');
      currentQuad = null;
      return;
    }

    // サブタイトル
    const subM = line.match(/^subtitle\s*:\s*(.+)$/i);
    if (subM) {
      subtitle = subM[1].trim().replace(/;$/, '').trim().replace(/^["']|["']$/g, '');
      currentQuad = null;
      return;
    }

    // 象限ヘッダー判定
    // strengths: / s: / "強み":
    const headerM = line.match(/^(?:category\s+)?["']?(strengths?|weaknesses?|opportunities?|threats?|[swot]|強み|弱み|機会|脅威)["']?\s*:\s*(.*)$/i);
    if (headerM) {
      const tag = headerM[1].toLowerCase();
      if (tag === 's' || tag.startsWith('strength') || tag === '強み') currentQuad = 's';
      else if (tag === 'w' || tag.startsWith('weakness') || tag === '弱み') currentQuad = 'w';
      else if (tag === 'o' || tag.startsWith('opportunit') || tag === '機会') currentQuad = 'o';
      else if (tag === 't' || tag.startsWith('threat') || tag === '脅威') currentQuad = 't';

      const rest = headerM[2].trim();
      if (rest) {
        // 同一行にアイテムが並んでいる場合（カンマ区切り等）
        const tokens = rest.split(/,\s*(?=(?:[^"]*"[^"]*")*[^"]*$)/);
        tokens.forEach(tk => {
          const item = parseItemString(tk);
          if (item && currentQuad) quadrants[currentQuad].items.push(item);
        });
      }
      return;
    }

    // 現在の象限にアイテムを追加（リスト形式: - "テキスト" や "テキスト", など）
    if (currentQuad) {
      let cleanLine = line.replace(/^[-*•]\s*/, '').trim();
      const tokens = cleanLine.split(/,\s*(?=(?:[^"]*"[^"]*")*[^"]*$)/);
      tokens.forEach(tk => {
        const item = parseItemString(tk);
        if (item) quadrants[currentQuad].items.push(item);
      });
    }
  });

  return {
    title,
    subtitle,
    type,
    quadrants
  };
}

/**
 * テキストを指定幅（半角換算文字数）で折り返すヘルパー
 * @param {string} text
 * @param {number} maxCharUnits
 * @returns {string[]}
 */
function wrapSwotText(text, maxCharUnits = 36) {
  if (!text) return [];
  const lines = [];
  let curLine = '';
  let curUnits = 0;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const unit = ch.charCodeAt(0) > 255 ? 2 : 1;
    if (curUnits + unit > maxCharUnits && curLine.length > 0) {
      lines.push(curLine);
      curLine = ch;
      curUnits = unit;
    } else {
      curLine += ch;
      curUnits += unit;
    }
  }
  if (curLine) lines.push(curLine);
  return lines;
}

/**
 * SWOT分析マトリクスのSVG描画
 * @param {string} text
 * @param {HTMLElement} container
 * @param {string} [labelText]
 */
function drawSwotSvg(text, container, labelText) {
  if (!container) return;
  container.innerHTML = '';

  const parsed = parseSwot(text);
  if (!parsed) {
    container.innerHTML = '<div style="color:#ef4444; font-size:13px; padding:12px;">SWOTマトリクスの構文を解析できませんでした。<br>例: <code>\\swot{ title: "戦略SWOT"; S: "高い技術力"; W: "知名度不足"; O: "市場拡大"; T: "競合参入"; }</code></div>';
    return;
  }

  const { title, subtitle, type, quadrants } = parsed;

  if (type === 'tile') {
    drawSwotTileSvg(parsed, container);
    return;
  }

  // 各カードのデザイン仕様
  const quadConfig = {
    s: {
      letter: 'S',
      title: '強み (Strengths)',
      sub: '内部環境 / プラス要因',
      mainColor: '#059669',
      bgColor: '#ffffff',
      headerBg: '#ecfdf5',
      borderColor: '#a7f3d0',
      badgeBg: '#10b981',
      hlBg: '#d1fae5',
      hlText: '#065f46',
      bulletColor: '#10b981'
    },
    w: {
      letter: 'W',
      title: '弱み (Weaknesses)',
      sub: '内部環境 / マイナス要因',
      mainColor: '#e11d48',
      bgColor: '#ffffff',
      headerBg: '#fff1f2',
      borderColor: '#fecdd3',
      badgeBg: '#f43f5e',
      hlBg: '#ffe4e6',
      hlText: '#9f1239',
      bulletColor: '#f43f5e'
    },
    o: {
      letter: 'O',
      title: '機会 (Opportunities)',
      sub: '外部環境 / プラス要因',
      mainColor: '#2563eb',
      bgColor: '#ffffff',
      headerBg: '#eff6ff',
      borderColor: '#bfdbfe',
      badgeBg: '#3b82f6',
      hlBg: '#dbeafe',
      hlText: '#1e40af',
      bulletColor: '#3b82f6'
    },
    t: {
      letter: 'T',
      title: '脅威 (Threats)',
      sub: '外部環境 / マイナス要因',
      mainColor: '#d97706',
      bgColor: '#ffffff',
      headerBg: '#fffbeb',
      borderColor: '#fde68a',
      badgeBg: '#f59e0b',
      hlBg: '#fef3c7',
      hlText: '#92400e',
      bulletColor: '#f59e0b'
    }
  };

  // 各カードの高さ計算
  const cardW = 340;
  const headerH = 50;
  const itemLineH = 19;
  const itemPadY = 12;

  function calcCardContentHeight(items) {
    if (!items || items.length === 0) return 60;
    let totalH = 16;
    items.forEach(it => {
      const lines = wrapSwotText(it.text, 36);
      const padV = it.isHighlight ? 7 : 4;
      const h = Math.max((lines.length - 1) * itemLineH + 14 + padV * 2, 28);
      totalH += h + itemPadY;
    });
    return totalH;
  }

  const topRowH = Math.max(
    calcCardContentHeight(quadrants.s.items),
    calcCardContentHeight(quadrants.w.items),
    140
  ) + headerH;

  const btmRowH = Math.max(
    calcCardContentHeight(quadrants.o.items),
    calcCardContentHeight(quadrants.t.items),
    140
  ) + headerH;

  // レイアウト寸法
  const axisLabelW = 44; // 左側「内部環境」「外部環境」ヘッダー幅
  const axisHeaderH = 34; // 上部「プラス要因」「マイナス要因」ヘッダー高さ
  const cardGap = 16;

  const originX = 36 + axisLabelW + 12;
  const originY = (title ? (subtitle ? 92 : 72) : 40) + axisHeaderH + 10;

  const totalW = originX + cardW * 2 + cardGap + 36;
  const totalH = originY + topRowH + cardGap + btmRowH + 36;

  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${totalW} ${totalH}`);
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.style.maxWidth = `${totalW}px`;
  svg.style.display = 'block';
  svg.style.margin = '0 auto';
  svg.setAttribute('class', 'swot-svg');

  // defs
  const defs = document.createElementNS(svgNS, 'defs');
  defs.innerHTML = `
    <filter id="swot-card-shadow" x="-5%" y="-5%" width="110%" height="115%">
      <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#0f172a" flood-opacity="0.06" />
    </filter>
  `;
  svg.appendChild(defs);

  // タイトル
  if (title) {
    const titleEl = document.createElementNS(svgNS, 'text');
    titleEl.setAttribute('x', (totalW / 2).toString());
    titleEl.setAttribute('y', '36');
    titleEl.setAttribute('text-anchor', 'middle');
    titleEl.setAttribute('font-family', "'Outfit', 'Inter', 'Noto Sans JP', sans-serif");
    titleEl.setAttribute('font-size', '19');
    titleEl.setAttribute('font-weight', '700');
    titleEl.setAttribute('fill', '#0f172a');
    titleEl.textContent = title;
    svg.appendChild(titleEl);

    if (subtitle) {
      const subEl = document.createElementNS(svgNS, 'text');
      subEl.setAttribute('x', (totalW / 2).toString());
      subEl.setAttribute('y', '58');
      subEl.setAttribute('text-anchor', 'middle');
      subEl.setAttribute('font-family', "'Outfit', 'Inter', 'Noto Sans JP', sans-serif");
      subEl.setAttribute('font-size', '13');
      subEl.setAttribute('font-weight', '400');
      subEl.setAttribute('fill', '#64748b');
      subEl.textContent = subtitle;
      svg.appendChild(subEl);
    }
  }

  // 1. 上部 横軸ヘッダー（プラス要因・マイナス要因）
  const colLeftX = originX;
  const colRightX = originX + cardW + cardGap;
  const axisTopY = originY - axisHeaderH - 8;

  function renderTopHeader(x, text, color, subText) {
    const g = document.createElementNS(svgNS, 'g');
    const bg = document.createElementNS(svgNS, 'rect');
    bg.setAttribute('x', x.toString());
    bg.setAttribute('y', axisTopY.toString());
    bg.setAttribute('width', cardW.toString());
    bg.setAttribute('height', axisHeaderH.toString());
    bg.setAttribute('rx', '6');
    bg.setAttribute('ry', '6');
    bg.setAttribute('fill', '#f8fafc');
    bg.setAttribute('stroke', '#e2e8f0');
    bg.setAttribute('stroke-width', '1');
    g.appendChild(bg);

    const txt = document.createElementNS(svgNS, 'text');
    txt.setAttribute('x', (x + cardW / 2).toString());
    txt.setAttribute('y', (axisTopY + 21).toString());
    txt.setAttribute('text-anchor', 'middle');
    txt.setAttribute('font-family', "'Outfit', 'Inter', 'Noto Sans JP', sans-serif");
    txt.setAttribute('font-size', '13');
    txt.setAttribute('font-weight', '700');
    txt.setAttribute('fill', color);
    txt.textContent = text;
    g.appendChild(txt);

    svg.appendChild(g);
  }

  renderTopHeader(colLeftX, 'プラス要因 (Positive / 支援・強み)', '#059669');
  renderTopHeader(colRightX, 'マイナス要因 (Negative / 課題・リスク)', '#e11d48');

  // 2. 左側 縦軸ヘッダー（内部環境・外部環境）
  const rowTopY = originY;
  const rowBtmY = originY + topRowH + cardGap;
  const axisLeftX = originX - axisLabelW - 10;

  function renderLeftHeader(y, height, text, subText, color) {
    const g = document.createElementNS(svgNS, 'g');
    const bg = document.createElementNS(svgNS, 'rect');
    bg.setAttribute('x', axisLeftX.toString());
    bg.setAttribute('y', y.toString());
    bg.setAttribute('width', axisLabelW.toString());
    bg.setAttribute('height', height.toString());
    bg.setAttribute('rx', '6');
    bg.setAttribute('ry', '6');
    bg.setAttribute('fill', '#f8fafc');
    bg.setAttribute('stroke', '#e2e8f0');
    bg.setAttribute('stroke-width', '1');
    g.appendChild(bg);

    const txt = document.createElementNS(svgNS, 'text');
    txt.setAttribute('x', (axisLeftX + axisLabelW / 2).toString());
    txt.setAttribute('y', (y + height / 2).toString());
    txt.setAttribute('text-anchor', 'middle');
    txt.setAttribute('font-family', "'Outfit', 'Inter', 'Noto Sans JP', sans-serif");
    txt.setAttribute('font-size', '13');
    txt.setAttribute('font-weight', '700');
    txt.setAttribute('fill', color);
    txt.setAttribute('transform', `rotate(-90 ${axisLeftX + axisLabelW / 2} ${y + height / 2})`);
    txt.textContent = text;
    g.appendChild(txt);

    svg.appendChild(g);
  }

  renderLeftHeader(rowTopY, topRowH, '内部環境 (Internal)', '組織・資源', '#334155');
  renderLeftHeader(rowBtmY, btmRowH, '外部環境 (External)', '市場・競合', '#334155');

  // 3. 4象限カードの描画関数
  function renderCard(quadKey, x, y, width, height) {
    const conf = quadConfig[quadKey];
    const data = quadrants[quadKey];

    const cardG = document.createElementNS(svgNS, 'g');
    cardG.setAttribute('class', `swot-card swot-card-${quadKey}`);

    // 外枠カード背景
    const cardRect = document.createElementNS(svgNS, 'rect');
    cardRect.setAttribute('x', x.toString());
    cardRect.setAttribute('y', y.toString());
    cardRect.setAttribute('width', width.toString());
    cardRect.setAttribute('height', height.toString());
    cardRect.setAttribute('rx', '10');
    cardRect.setAttribute('ry', '10');
    cardRect.setAttribute('fill', conf.bgColor);
    cardRect.setAttribute('stroke', conf.borderColor);
    cardRect.setAttribute('stroke-width', '1.6');
    cardRect.setAttribute('filter', 'url(#swot-card-shadow)');
    cardG.appendChild(cardRect);

    // ヘッダー背景（上部帯）
    const headerRect = document.createElementNS(svgNS, 'path');
    const r = 10;
    const pathD = `
      M ${x + r} ${y}
      L ${x + width - r} ${y}
      A ${r} ${r} 0 0 1 ${x + width} ${y + r}
      L ${x + width} ${y + headerH}
      L ${x} ${y + headerH}
      L ${x} ${y + r}
      A ${r} ${r} 0 0 1 ${x + r} ${y}
      Z
    `;
    headerRect.setAttribute('d', pathD);
    headerRect.setAttribute('fill', conf.headerBg);
    cardG.appendChild(headerRect);

    // ヘッダー境界線
    const headerBorder = document.createElementNS(svgNS, 'line');
    headerBorder.setAttribute('x1', x.toString());
    headerBorder.setAttribute('y1', (y + headerH).toString());
    headerBorder.setAttribute('x2', (x + width).toString());
    headerBorder.setAttribute('y2', (y + headerH).toString());
    headerBorder.setAttribute('stroke', conf.borderColor);
    headerBorder.setAttribute('stroke-width', '1');
    cardG.appendChild(headerBorder);

    // アルファベットバッジ（丸）
    const badgeR = 14;
    const badgeX = x + 24;
    const badgeY = y + headerH / 2;

    const badgeCirc = document.createElementNS(svgNS, 'circle');
    badgeCirc.setAttribute('cx', badgeX.toString());
    badgeCirc.setAttribute('cy', badgeY.toString());
    badgeCirc.setAttribute('r', badgeR.toString());
    badgeCirc.setAttribute('fill', conf.badgeBg);
    cardG.appendChild(badgeCirc);

    const badgeTxt = document.createElementNS(svgNS, 'text');
    badgeTxt.setAttribute('x', badgeX.toString());
    badgeTxt.setAttribute('y', (badgeY + 4.5).toString());
    badgeTxt.setAttribute('text-anchor', 'middle');
    badgeTxt.setAttribute('font-family', "'Outfit', 'Inter', sans-serif");
    badgeTxt.setAttribute('font-size', '14');
    badgeTxt.setAttribute('font-weight', '800');
    badgeTxt.setAttribute('fill', '#ffffff');
    badgeTxt.textContent = conf.letter;
    cardG.appendChild(badgeTxt);

    // カードタイトル
    const cardTitle = document.createElementNS(svgNS, 'text');
    cardTitle.setAttribute('x', (badgeX + badgeR + 10).toString());
    cardTitle.setAttribute('y', (y + headerH / 2 + 5).toString());
    cardTitle.setAttribute('font-family', "'Outfit', 'Inter', 'Noto Sans JP', sans-serif");
    cardTitle.setAttribute('font-size', '14');
    cardTitle.setAttribute('font-weight', '700');
    cardTitle.setAttribute('fill', conf.mainColor);
    cardTitle.textContent = conf.title;
    cardG.appendChild(cardTitle);

    // アイテム描画
    let curItemY = y + headerH + 16;
    const items = data.items || [];

    if (items.length === 0) {
      const emptyTxt = document.createElementNS(svgNS, 'text');
      emptyTxt.setAttribute('x', (x + width / 2).toString());
      emptyTxt.setAttribute('y', (curItemY + 24).toString());
      emptyTxt.setAttribute('text-anchor', 'middle');
      emptyTxt.setAttribute('font-family', "'Outfit', 'Inter', 'Noto Sans JP', sans-serif");
      emptyTxt.setAttribute('font-size', '12.5');
      emptyTxt.setAttribute('fill', '#94a3b8');
      emptyTxt.textContent = '（項目なし）';
      cardG.appendChild(emptyTxt);
    } else {
      items.forEach(it => {
        const lines = wrapSwotText(it.text, 36);
        const padV = it.isHighlight ? 7 : 4;
        const boxH = Math.max((lines.length - 1) * itemLineH + 14 + padV * 2, 28);
        const boxY = curItemY;
        const boxCenterY = boxY + boxH / 2;

        if (it.isHighlight) {
          // 強調バッジボックス
          const hlBox = document.createElementNS(svgNS, 'rect');
          hlBox.setAttribute('x', (x + 14).toString());
          hlBox.setAttribute('y', boxY.toString());
          hlBox.setAttribute('width', (width - 28).toString());
          hlBox.setAttribute('height', boxH.toString());
          hlBox.setAttribute('rx', '6');
          hlBox.setAttribute('ry', '6');
          hlBox.setAttribute('fill', conf.hlBg);
          hlBox.setAttribute('stroke', conf.borderColor);
          hlBox.setAttribute('stroke-width', '1');
          cardG.appendChild(hlBox);
        }

        // 第1行のベースラインとブレット垂直位置（ボックス上下中央に正確にセンタリング）
        const firstLineY = boxCenterY + 4.5 - ((lines.length - 1) * itemLineH) / 2;
        const bulletY = firstLineY - 4.5;

        // アイテムブレット（丸点）
        const bulletCirc = document.createElementNS(svgNS, 'circle');
        bulletCirc.setAttribute('cx', (x + 25).toString());
        bulletCirc.setAttribute('cy', bulletY.toFixed(1));
        bulletCirc.setAttribute('r', it.isHighlight ? '3.5' : '3');
        bulletCirc.setAttribute('fill', it.isHighlight ? conf.mainColor : conf.bulletColor);
        cardG.appendChild(bulletCirc);

        // テキスト複数行（左揃え）
        lines.forEach((ln, lIdx) => {
          const txtEl = document.createElementNS(svgNS, 'text');
          txtEl.setAttribute('x', (x + 36).toString());
          txtEl.setAttribute('y', (firstLineY + lIdx * itemLineH).toFixed(1));
          txtEl.setAttribute('font-family', "'Outfit', 'Inter', 'Noto Sans JP', sans-serif");
          txtEl.setAttribute('font-size', '12.5');
          txtEl.setAttribute('font-weight', it.isHighlight ? '700' : '500');
          txtEl.setAttribute('fill', it.isHighlight ? conf.hlText : '#1e293b');
          txtEl.textContent = ln;
          cardG.appendChild(txtEl);
        });

        curItemY += boxH + itemPadY;
      });
    }

    svg.appendChild(cardG);
  }

  // 4象限カードを配置
  renderCard('s', colLeftX, rowTopY, cardW, topRowH);
  renderCard('w', colRightX, rowTopY, cardW, topRowH);
  renderCard('o', colLeftX, rowBtmY, cardW, btmRowH);
  renderCard('t', colRightX, rowBtmY, cardW, btmRowH);

  // コンテナへの配置
  const wrapper = document.createElement('div');
  wrapper.className = 'swot-container';
  wrapper.style.display = 'flex';
  wrapper.style.justifyContent = 'center';
  wrapper.style.alignItems = 'center';
  wrapper.style.width = '100%';
  wrapper.style.overflowX = 'auto';
  wrapper.style.padding = '12px 0';
  wrapper.appendChild(svg);

  container.appendChild(wrapper);
}

/**
 * 形式2: 2×2 タイルブロック形式のSVG描画（密着ブロック・ウォーターマークS/W/O/T）
 * @param {object} parsed
 * @param {HTMLElement} container
 */
function drawSwotTileSvg(parsed, container) {
  const { title, subtitle, quadrants } = parsed;

  const displayTitle = title || 'SWOT ANALYSIS';
  const hasSubtitle = Boolean(subtitle);

  // 寸法仕様
  const rowHeaderW = 68; // 左行ヘッダー幅
  const colHeaderH = 56; // 上列ヘッダー高さ
  const colW = 340;      // 象限ブロック幅
  const totalW = rowHeaderW + colW * 2 + 48; // 両端余白24px

  // アイテム高さ計算
  const itemLineH = 18;
  const itemPadY = 8;
  function calcItemsH(items) {
    if (!items || items.length === 0) return 0;
    let h = 48; // 見出し下マージン
    items.forEach(it => {
      const lines = wrapSwotText(it.text, 34);
      const boxH = Math.max((lines.length - 1) * itemLineH + 20, 30);
      h += boxH + itemPadY;
    });
    return h + 12;
  }

  const sH = calcItemsH(quadrants.s.items);
  const wH = calcItemsH(quadrants.w.items);
  const oH = calcItemsH(quadrants.o.items);
  const tH = calcItemsH(quadrants.t.items);

  const minBlockH = (sH > 0 || wH > 0 || oH > 0 || tH > 0) ? 220 : 200;
  const topBlockH = Math.max(minBlockH, sH, wH);
  const btmBlockH = Math.max(minBlockH, oH, tH);

  const topPad = hasSubtitle ? 84 : 64;
  const totalH = topPad + colHeaderH + topBlockH + btmBlockH + 32;

  const gridX = 24 + rowHeaderW;
  const gridY = topPad + colHeaderH;

  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${totalW} ${totalH}`);
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.style.maxWidth = `${totalW}px`;
  svg.style.display = 'block';
  svg.style.margin = '0 auto';
  svg.setAttribute('class', 'swot-svg swot-tile-svg');

  // 背景ドロップシャドウ
  const defs = document.createElementNS(svgNS, 'defs');
  defs.innerHTML = `
    <filter id="swot-tile-shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#0f172a" flood-opacity="0.08" />
    </filter>
  `;
  svg.appendChild(defs);

  // 大タイトル
  const titleEl = document.createElementNS(svgNS, 'text');
  titleEl.setAttribute('x', (totalW / 2).toString());
  titleEl.setAttribute('y', hasSubtitle ? '34' : '40');
  titleEl.setAttribute('text-anchor', 'middle');
  titleEl.setAttribute('font-family', "'Outfit', 'Inter', 'Noto Sans JP', sans-serif");
  titleEl.setAttribute('font-size', '28');
  titleEl.setAttribute('font-weight', '900');
  titleEl.setAttribute('letter-spacing', '2px');
  titleEl.setAttribute('fill', '#0f172a');
  titleEl.textContent = displayTitle;
  svg.appendChild(titleEl);

  if (hasSubtitle) {
    const subEl = document.createElementNS(svgNS, 'text');
    subEl.setAttribute('x', (totalW / 2).toString());
    subEl.setAttribute('y', '58');
    subEl.setAttribute('text-anchor', 'middle');
    subEl.setAttribute('font-family', "'Outfit', 'Inter', 'Noto Sans JP', sans-serif");
    subEl.setAttribute('font-size', '13');
    subEl.setAttribute('font-weight', '500');
    subEl.setAttribute('fill', '#64748b');
    subEl.textContent = subtitle;
    svg.appendChild(subEl);
  }

  // 全体フレーム（影付き枠）
  const frameRect = document.createElementNS(svgNS, 'rect');
  frameRect.setAttribute('x', (24).toString());
  frameRect.setAttribute('y', topPad.toString());
  frameRect.setAttribute('width', (rowHeaderW + colW * 2).toString());
  frameRect.setAttribute('height', (colHeaderH + topBlockH + btmBlockH).toString());
  frameRect.setAttribute('fill', '#ffffff');
  frameRect.setAttribute('filter', 'url(#swot-tile-shadow)');
  svg.appendChild(frameRect);

  // 上列ヘッダー（左: Helpful / 右: Harmful）
  // 1. Helpful
  const hHelp = document.createElementNS(svgNS, 'rect');
  hHelp.setAttribute('x', gridX.toString());
  hHelp.setAttribute('y', topPad.toString());
  hHelp.setAttribute('width', colW.toString());
  hHelp.setAttribute('height', colHeaderH.toString());
  hHelp.setAttribute('fill', '#c8e6c9');
  svg.appendChild(hHelp);

  const tHelpMain = document.createElementNS(svgNS, 'text');
  tHelpMain.setAttribute('x', (gridX + colW / 2).toString());
  tHelpMain.setAttribute('y', (topPad + 24).toString());
  tHelpMain.setAttribute('text-anchor', 'middle');
  tHelpMain.setAttribute('font-family', "'Outfit', 'Inter', 'Noto Sans JP', sans-serif");
  tHelpMain.setAttribute('font-size', '16');
  tHelpMain.setAttribute('font-weight', '700');
  tHelpMain.setAttribute('fill', '#1f2937');
  tHelpMain.textContent = 'Helpful';
  svg.appendChild(tHelpMain);

  const tHelpSub = document.createElementNS(svgNS, 'text');
  tHelpSub.setAttribute('x', (gridX + colW / 2).toString());
  tHelpSub.setAttribute('y', (topPad + 43).toString());
  tHelpSub.setAttribute('text-anchor', 'middle');
  tHelpSub.setAttribute('font-family', "'Outfit', 'Inter', 'Noto Sans JP', sans-serif");
  tHelpSub.setAttribute('font-size', '11.5');
  tHelpSub.setAttribute('font-weight', '500');
  tHelpSub.setAttribute('fill', '#374151');
  tHelpSub.textContent = 'to achieving the objective';
  svg.appendChild(tHelpSub);

  // 2. Harmful
  const hHarm = document.createElementNS(svgNS, 'rect');
  hHarm.setAttribute('x', (gridX + colW).toString());
  hHarm.setAttribute('y', topPad.toString());
  hHarm.setAttribute('width', colW.toString());
  hHarm.setAttribute('height', colHeaderH.toString());
  hHarm.setAttribute('fill', '#ffcdd2');
  svg.appendChild(hHarm);

  const tHarmMain = document.createElementNS(svgNS, 'text');
  tHarmMain.setAttribute('x', (gridX + colW * 1.5).toString());
  tHarmMain.setAttribute('y', (topPad + 24).toString());
  tHarmMain.setAttribute('text-anchor', 'middle');
  tHarmMain.setAttribute('font-family', "'Outfit', 'Inter', 'Noto Sans JP', sans-serif");
  tHarmMain.setAttribute('font-size', '16');
  tHarmMain.setAttribute('font-weight', '700');
  tHarmMain.setAttribute('fill', '#1f2937');
  tHarmMain.textContent = 'Harmful';
  svg.appendChild(tHarmMain);

  const tHarmSub = document.createElementNS(svgNS, 'text');
  tHarmSub.setAttribute('x', (gridX + colW * 1.5).toString());
  tHarmSub.setAttribute('y', (topPad + 43).toString());
  tHarmSub.setAttribute('text-anchor', 'middle');
  tHarmSub.setAttribute('font-family', "'Outfit', 'Inter', 'Noto Sans JP', sans-serif");
  tHarmSub.setAttribute('font-size', '11.5');
  tHarmSub.setAttribute('font-weight', '500');
  tHarmSub.setAttribute('fill', '#374151');
  tHarmSub.textContent = 'to achieving the objective';
  svg.appendChild(tHarmSub);

  // 左側行ヘッダー（上: Internal origin / 下: External origin）
  // 1. Internal origin
  const hInt = document.createElementNS(svgNS, 'rect');
  hInt.setAttribute('x', '24');
  hInt.setAttribute('y', gridY.toString());
  hInt.setAttribute('width', rowHeaderW.toString());
  hInt.setAttribute('height', topBlockH.toString());
  hInt.setAttribute('fill', '#fff9c4');
  svg.appendChild(hInt);

  const gInt = document.createElementNS(svgNS, 'g');
  gInt.setAttribute('transform', `translate(${24 + rowHeaderW / 2}, ${gridY + topBlockH / 2}) rotate(-90)`);
  const tIntMain = document.createElementNS(svgNS, 'text');
  tIntMain.setAttribute('x', '0');
  tIntMain.setAttribute('y', '-5');
  tIntMain.setAttribute('text-anchor', 'middle');
  tIntMain.setAttribute('font-family', "'Outfit', 'Inter', 'Noto Sans JP', sans-serif");
  tIntMain.setAttribute('font-size', '15');
  tIntMain.setAttribute('font-weight', '700');
  tIntMain.setAttribute('fill', '#1f2937');
  tIntMain.textContent = 'Internal origin';
  gInt.appendChild(tIntMain);

  const tIntSub = document.createElementNS(svgNS, 'text');
  tIntSub.setAttribute('x', '0');
  tIntSub.setAttribute('y', '13');
  tIntSub.setAttribute('text-anchor', 'middle');
  tIntSub.setAttribute('font-family', "'Outfit', 'Inter', 'Noto Sans JP', sans-serif");
  tIntSub.setAttribute('font-size', '11');
  tIntSub.setAttribute('font-weight', '500');
  tIntSub.setAttribute('fill', '#374151');
  tIntSub.textContent = '(attributes of the organization)';
  gInt.appendChild(tIntSub);
  svg.appendChild(gInt);

  // 2. External origin
  const hExt = document.createElementNS(svgNS, 'rect');
  hExt.setAttribute('x', '24');
  hExt.setAttribute('y', (gridY + topBlockH).toString());
  hExt.setAttribute('width', rowHeaderW.toString());
  hExt.setAttribute('height', btmBlockH.toString());
  hExt.setAttribute('fill', '#bbdefb');
  svg.appendChild(hExt);

  const gExt = document.createElementNS(svgNS, 'g');
  gExt.setAttribute('transform', `translate(${24 + rowHeaderW / 2}, ${gridY + topBlockH + btmBlockH / 2}) rotate(-90)`);
  const tExtMain = document.createElementNS(svgNS, 'text');
  tExtMain.setAttribute('x', '0');
  tExtMain.setAttribute('y', '-5');
  tExtMain.setAttribute('text-anchor', 'middle');
  tExtMain.setAttribute('font-family', "'Outfit', 'Inter', 'Noto Sans JP', sans-serif");
  tExtMain.setAttribute('font-size', '15');
  tExtMain.setAttribute('font-weight', '700');
  tExtMain.setAttribute('fill', '#1f2937');
  tExtMain.textContent = 'External origin';
  gExt.appendChild(tExtMain);

  const tExtSub = document.createElementNS(svgNS, 'text');
  tExtSub.setAttribute('x', '0');
  tExtSub.setAttribute('y', '13');
  tExtSub.setAttribute('text-anchor', 'middle');
  tExtSub.setAttribute('font-family', "'Outfit', 'Inter', 'Noto Sans JP', sans-serif");
  tExtSub.setAttribute('font-size', '11');
  tExtSub.setAttribute('font-weight', '500');
  tExtSub.setAttribute('fill', '#374151');
  tExtSub.textContent = '(attributes of the environment)';
  gExt.appendChild(tExtSub);
  svg.appendChild(gExt);

  // 4象限ブロック定義
  const tileQuadConfigs = {
    s: {
      letter: 'S',
      title: 'Strengths',
      bgColor: '#dced85',
      bulletColor: '#4d7c0f',
      x: gridX,
      y: gridY,
      w: colW,
      h: topBlockH,
      items: quadrants.s.items
    },
    w: {
      letter: 'W',
      title: 'Weaknesses',
      bgColor: '#ffcc80',
      bulletColor: '#c2410c',
      x: gridX + colW,
      y: gridY,
      w: colW,
      h: topBlockH,
      items: quadrants.w.items
    },
    o: {
      letter: 'O',
      title: 'Opportunities',
      bgColor: '#a5d6a7',
      bulletColor: '#15803d',
      x: gridX,
      y: gridY + topBlockH,
      w: colW,
      h: btmBlockH,
      items: quadrants.o.items
    },
    t: {
      letter: 'T',
      title: 'Threats',
      bgColor: '#ce93d8',
      bulletColor: '#7e22ce',
      x: gridX + colW,
      y: gridY + topBlockH,
      w: colW,
      h: btmBlockH,
      items: quadrants.t.items
    }
  };

  // 4象限ブロックの描画
  Object.keys(tileQuadConfigs).forEach(key => {
    const q = tileQuadConfigs[key];
    const group = document.createElementNS(svgNS, 'g');

    // 背景ブロック
    const bg = document.createElementNS(svgNS, 'rect');
    bg.setAttribute('x', q.x.toString());
    bg.setAttribute('y', q.y.toString());
    bg.setAttribute('width', q.w.toString());
    bg.setAttribute('height', q.h.toString());
    bg.setAttribute('fill', q.bgColor);
    group.appendChild(bg);

    // 半透明白ウォーターマーク (S, W, O, T)
    const wm = document.createElementNS(svgNS, 'text');
    wm.setAttribute('x', (q.x + q.w / 2).toString());
    wm.setAttribute('y', (q.y + q.h / 2 + 65).toString());
    wm.setAttribute('text-anchor', 'middle');
    wm.setAttribute('font-family', "'Outfit', 'Inter', sans-serif");
    wm.setAttribute('font-size', '200');
    wm.setAttribute('font-weight', '900');
    wm.setAttribute('fill', 'rgba(255, 255, 255, 0.45)');
    wm.style.userSelect = 'none';
    wm.textContent = q.letter;
    group.appendChild(wm);

    const hasItems = q.items && q.items.length > 0;

    // 前面見出し (Strengths / Weaknesses / Opportunities / Threats)
    const titleY = hasItems ? (q.y + 34) : (q.y + q.h / 2 + 8);
    const titleSize = hasItems ? '20' : '23';

    const tEl = document.createElementNS(svgNS, 'text');
    tEl.setAttribute('x', (q.x + q.w / 2).toString());
    tEl.setAttribute('y', titleY.toString());
    tEl.setAttribute('text-anchor', 'middle');
    tEl.setAttribute('font-family', "'Outfit', 'Inter', 'Noto Sans JP', sans-serif");
    tEl.setAttribute('font-size', titleSize);
    tEl.setAttribute('font-weight', '700');
    tEl.setAttribute('fill', '#111827');
    tEl.textContent = q.title;
    group.appendChild(tEl);

    // アイテムリスト描画
    if (hasItems) {
      let curItemY = q.y + 50;
      q.items.forEach(it => {
        const lines = wrapSwotText(it.text, 34);
        const boxH = Math.max((lines.length - 1) * itemLineH + 20, 30);
        const boxY = curItemY;
        const boxCenterY = boxY + boxH / 2;

        // 半透明白カード
        const cardBox = document.createElementNS(svgNS, 'rect');
        cardBox.setAttribute('x', (q.x + 14).toString());
        cardBox.setAttribute('y', boxY.toString());
        cardBox.setAttribute('width', (q.w - 28).toString());
        cardBox.setAttribute('height', boxH.toString());
        cardBox.setAttribute('rx', '6');
        cardBox.setAttribute('ry', '6');
        cardBox.setAttribute('fill', it.isHighlight ? 'rgba(255, 255, 255, 0.94)' : 'rgba(255, 255, 255, 0.76)');
        if (it.isHighlight) {
          cardBox.setAttribute('stroke', '#0f172a');
          cardBox.setAttribute('stroke-width', '1.2');
        } else {
          cardBox.setAttribute('stroke', 'rgba(255, 255, 255, 0.9)');
          cardBox.setAttribute('stroke-width', '0.8');
        }
        group.appendChild(cardBox);

        // 丸点ブレット
        const firstLineY = boxCenterY + 4.5 - ((lines.length - 1) * itemLineH) / 2;
        const bulletCirc = document.createElementNS(svgNS, 'circle');
        bulletCirc.setAttribute('cx', (q.x + 27).toString());
        bulletCirc.setAttribute('cy', (firstLineY - 4.5).toFixed(1));
        bulletCirc.setAttribute('r', it.isHighlight ? '3.5' : '3');
        bulletCirc.setAttribute('fill', it.isHighlight ? '#0f172a' : q.bulletColor);
        group.appendChild(bulletCirc);

        // テキスト
        lines.forEach((ln, lIdx) => {
          const txtEl = document.createElementNS(svgNS, 'text');
          txtEl.setAttribute('x', (q.x + 38).toString());
          txtEl.setAttribute('y', (firstLineY + lIdx * itemLineH).toFixed(1));
          txtEl.setAttribute('font-family', "'Outfit', 'Inter', 'Noto Sans JP', sans-serif");
          txtEl.setAttribute('font-size', '12.5');
          txtEl.setAttribute('font-weight', it.isHighlight ? '700' : '500');
          txtEl.setAttribute('fill', '#0f172a');
          txtEl.textContent = ln;
          group.appendChild(txtEl);
        });

        curItemY += boxH + itemPadY;
      });
    }

    svg.appendChild(group);
  });

  // コンテナへの配置
  const wrapper = document.createElement('div');
  wrapper.className = 'swot-container swot-tile-container';
  wrapper.style.display = 'flex';
  wrapper.style.justifyContent = 'center';
  wrapper.style.alignItems = 'center';
  wrapper.style.width = '100%';
  wrapper.style.overflowX = 'auto';
  wrapper.style.padding = '12px 0';
  wrapper.appendChild(svg);

  container.appendChild(wrapper);
}

// エイリアス関数
function drawSwot(text, container, labelText) {
  drawSwotSvg(text, container, labelText);
}
