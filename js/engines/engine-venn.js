// ==========================================
// ベン図 (Venn Diagram) パーサー & レンダラーエンジン
// ==========================================

/**
 * ベン図構文のパーサー
 * @param {string} rawText
 * @returns {object}
 */
function parseVenn(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;

  let content = rawText.trim();
  const defaultColors = ['#3b82f6', '#f43f5e', '#10b981', '#f59e0b'];

  let title = '';
  let subtitle = '';

  // % title: / % subtitle: の抽出
  const commentTitleMatch = content.match(/%\s*title\s*:\s*(.+)$/m);
  if (commentTitleMatch) title = commentTitleMatch[1].trim();
  const commentSubMatch = content.match(/%\s*subtitle\s*:\s*(.+)$/m);
  if (commentSubMatch) subtitle = commentSubMatch[1].trim();

  // 1. LaTeX venndiagram パッケージ (\begin{venndiagram2sets} / \begin{venndiagram3sets}) の判定
  const vEnvMatch = content.match(/\\begin\{venndiagram(2|3)sets\}(?:\s*\[([\s\S]*?)\])?([\s\S]*?)\\end\{venndiagram\1sets\}/i);
  if (vEnvMatch) {
    const numSets = parseInt(vEnvMatch[1], 10);
    const optStr = vEnvMatch[2] || '';
    const bodyStr = vEnvMatch[3] || '';

    if (!title) {
      title = numSets === 2 ? '2集合の共通部分 (LaTeX venndiagram)' : '3集合の交差領域 (LaTeX venndiagram)';
    }

    const sets = [];
    const regions = {};
    const highlights = new Set();

    // 集合ラベルの取得 (labelA={...}, labelB={...}, labelC={...})
    for (let i = 0; i < numSets; i++) {
      const id = String.fromCharCode(65 + i);
      const reg = new RegExp(`label${id}\\s*=\\s*(?:\\{([^}]*)\\}|([^,\\]]+))`, 'i');
      const m = optStr.match(reg);
      const label = m ? (m[1] || m[2]).trim() : `集合 ${id}`;
      sets.push({ id, label, color: defaultColors[i % defaultColors.length] });
    }

    // 領域ラベルの取得 (labelOnlyA={...}, labelOnlyAB={...} など)
    const regionKeyMap = [
      { key: 'A', regex: /labelOnlyA\s*=\s*(?:\{([^}]*)\}|([^,\]]+))/i },
      { key: 'B', regex: /labelOnlyB\s*=\s*(?:\{([^}]*)\}|([^,\]]+))/i },
      { key: 'C', regex: /labelOnlyC\s*=\s*(?:\{([^}]*)\}|([^,\]]+))/i },
      { key: 'AB', regex: /(?:labelOnlyAB|labelAB|labelACapB)\s*=\s*(?:\{([^}]*)\}|([^,\]]+))/i },
      { key: 'AC', regex: /(?:labelOnlyAC|labelAC|labelACapC)\s*=\s*(?:\{([^}]*)\}|([^,\]]+))/i },
      { key: 'BC', regex: /(?:labelOnlyBC|labelBC|labelBCapC)\s*=\s*(?:\{([^}]*)\}|([^,\]]+))/i },
      { key: 'ABC', regex: /(?:labelOnlyABC|labelABC|labelACapBCapC)\s*=\s*(?:\{([^}]*)\}|([^,\]]+))/i }
    ];

    regionKeyMap.forEach(({ key, regex }) => {
      const rm = optStr.match(regex);
      if (rm) {
        regions[key] = { text: (rm[1] || rm[2]).trim(), highlight: false };
      }
    });

    // 本文内の塗りつぶし・ハイライトコマンドの抽出
    if (/\\fillACapBCapC|\\fillAll/i.test(bodyStr)) {
      highlights.add('ABC');
    }
    if (/\\fillACapB/i.test(bodyStr)) {
      highlights.add('AB');
      if (numSets === 3) highlights.add('ABC');
    }
    if (/\\fillACapC/i.test(bodyStr)) {
      highlights.add('AC');
      if (numSets === 3) highlights.add('ABC');
    }
    if (/\\fillBCapC/i.test(bodyStr)) {
      highlights.add('BC');
      if (numSets === 3) highlights.add('ABC');
    }
    if (/\\fillOnlyA/i.test(bodyStr)) highlights.add('A');
    if (/\\fillOnlyB/i.test(bodyStr)) highlights.add('B');
    if (/\\fillOnlyC/i.test(bodyStr)) highlights.add('C');
    if (/\\fillA\b/i.test(bodyStr)) {
      highlights.add('A');
      highlights.add('AB');
      if (numSets === 3) { highlights.add('AC'); highlights.add('ABC'); }
    }
    if (/\\fillB\b/i.test(bodyStr)) {
      highlights.add('B');
      highlights.add('AB');
      if (numSets === 3) { highlights.add('BC'); highlights.add('ABC'); }
    }

    highlights.forEach((hKey) => {
      if (!regions[hKey]) {
        regions[hKey] = { text: '', highlight: true };
      } else {
        regions[hKey].highlight = true;
      }
    });

    return { title, subtitle, sets, regions, highlights };
  }

  // 2. LaTeX TikZ ネイティブ環境 (\begin{tikzpicture} ... \end{tikzpicture}) の判定
  const tikzMatch = content.match(/\\begin\{tikzpicture\}([\s\S]*?)\\end\{tikzpicture\}/i);
  if (tikzMatch) {
    content = tikzMatch[1];
  } else {
    // 3. \venn{...} または \venndiagram{...}
    const cmdMatch = content.match(/^\\(?:venn|venndiagram)\s*\{([\s\S]*)\}\s*$/i);
    if (cmdMatch) {
      content = cmdMatch[1];
    }
  }

  const lines = content.split(/;|\n/).map(l => l.trim()).filter(Boolean);

  const sets = []; // [{ id, label, color }]
  const regions = {}; // key -> { text, highlight }
  const highlights = new Set();

  lines.forEach(line => {
    // 1. コメントスキップ
    if (line.startsWith('//') || line.startsWith('#')) return;

    // 2. タイトル
    const titleMatch = line.match(/^title\s*:\s*(.+)$/i);
    if (titleMatch) {
      title = titleMatch[1].trim().replace(/^["']|["']$/g, '');
      return;
    }

    // 3. サブタイトル
    const subMatch = line.match(/^subtitle\s*:\s*(.+)$/i);
    if (subMatch) {
      subtitle = subMatch[1].trim().replace(/^["']|["']$/g, '');
      return;
    }

    // 4. ハイライト一括指定 (highlight: AB, ABC または highlight: A ∩ B)
    const hlMatch = line.match(/^highlights?\s*:\s*(.+)$/i);
    if (hlMatch) {
      const parts = hlMatch[1].split(/[,;]+/).map(s => s.trim().toUpperCase().replace(/[^A-Z]/g, ''));
      parts.forEach(p => {
        if (p) highlights.add(p.split('').sort().join(''));
      });
      return;
    }

    // 5. 集合定義 (set A "名前" [color: #...]; または sets: ["A", "B", "C"])
    const setsListMatch = line.match(/^sets\s*:\s*(?:\[(.*?)\]|(.*))$/i);
    if (setsListMatch) {
      const listStr = (setsListMatch[1] || setsListMatch[2] || '').trim();
      const names = listStr
        .split(/,\s*(?=(?:[^"]*"[^"]*")*[^"]*$)/)
        .map(s => s.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean);
      names.forEach((name, idx) => {
        const id = String.fromCharCode(65 + idx); // A, B, C...
        sets.push({
          id,
          label: name,
          color: defaultColors[idx % defaultColors.length]
        });
      });
      return;
    }

    const setSingleMatch = line.match(/^set\s+([a-zA-Z0-9_]+)(?:\s*["']([^"']+)["'])?(?:\s*\[(.*)\])?$/i);
    if (setSingleMatch) {
      const id = setSingleMatch[1].trim().toUpperCase();
      const label = setSingleMatch[2] ? setSingleMatch[2].trim() : id;
      const optStr = (setSingleMatch[3] || '').toLowerCase();

      let color = defaultColors[sets.length % defaultColors.length];
      const colorM = optStr.match(/color\s*:\s*([#a-zA-Z0-9]+)/);
      if (colorM) color = colorM[1];

      sets.push({ id, label, color });
      return;
    }

    // 6. 領域テキスト定義 (A: "...", AB: "...", only A: "...", intersect A, B: "...")
    const regionMatch = line.match(/^(?:(?:only|intersect)\s+)?([a-zA-Z0-9_\s,&∩]+)\s*:\s*([^;\[]+)(?:\s*\[(.*)\])?$/i);
    if (regionMatch) {
      const rawKey = regionMatch[1].trim().toUpperCase().replace(/[^A-Z]/g, '');
      const key = rawKey.split('').sort().join(''); // 正規化（例: BA -> AB）
      const text = regionMatch[2].trim().replace(/^["']|["']$/g, '');
      const optStr = (regionMatch[3] || '').toLowerCase();

      const isHl = optStr.includes('highlight') || optStr.includes('active') || highlights.has(key);
      if (isHl) highlights.add(key);

      regions[key] = { text, highlight: isHl };
      return;
    }
  });

  // 集合が明示定義されていない場合、regionsのキーから自動補完 (A, B, C...)
  if (sets.length === 0) {
    const detectedLetters = new Set();
    Object.keys(regions).forEach(k => {
      k.split('').forEach(ch => detectedLetters.add(ch));
    });
    const sortedLetters = Array.from(detectedLetters).sort();
    if (sortedLetters.length >= 2) {
      sortedLetters.forEach((letter, idx) => {
        sets.push({
          id: letter,
          label: `集合 ${letter}`,
          color: defaultColors[idx % defaultColors.length]
        });
      });
    } else {
      // 最低限2つの集合 (A, B)
      sets.push({ id: 'A', label: '集合 A', color: defaultColors[0] });
      sets.push({ id: 'B', label: '集合 B', color: defaultColors[1] });
    }
  }

  return {
    title,
    subtitle,
    sets,
    regions,
    highlights
  };
}

/**
 * 文字列の表示幅（px）を推定するヘルパー
 * 全角（日本語等）は fontSize * 1.05、半角英数は fontSize * 0.62 として計算
 */
function estimateVennTextWidth(str, fontSize = 13.5, isBold = true) {
  if (!str) return 0;
  let w = 0;
  for (let i = 0; i < str.length; i++) {
    const isFullWidth = str.charCodeAt(i) > 255;
    if (isFullWidth) {
      w += fontSize * (isBold ? 1.05 : 1.0);
    } else {
      w += fontSize * (isBold ? 0.62 : 0.58);
    }
  }
  return w;
}

/**
 * ベン図のSVG描画
 * @param {string} text
 * @param {HTMLElement} container
 * @param {string} [labelText]
 */
function drawVennSvg(text, container, labelText) {
  if (!container) return;
  container.innerHTML = '';

  const parsed = parseVenn(text);
  if (!parsed || parsed.sets.length < 2) {
    container.innerHTML = '<div style="color:#ef4444; font-size:13px; padding:12px;">ベン図の構文を解析できませんでした。<br>例: <code>\\venn{ set A "A"; set B "B"; AB: "共通部分"; }</code></div>';
    return;
  }

  const { title, subtitle, sets, regions, highlights } = parsed;
  const numSets = sets.length;

  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');

  const width = 800;
  const height = title ? 540 : 490;
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.style.maxWidth = `${width}px`;
  svg.style.display = 'block';
  svg.style.margin = '0 auto';
  svg.setAttribute('class', 'venn-svg');

  const defs = document.createElementNS(svgNS, 'defs');
  defs.innerHTML = `
    <!-- 影フィルタ -->
    <filter id="venn-pill-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="1.5" stdDeviation="2.5" flood-color="#0f172a" flood-opacity="0.08" />
    </filter>
  `;
  svg.appendChild(defs);

  // タイトル & サブタイトルの描画
  if (title) {
    const titleEl = document.createElementNS(svgNS, 'text');
    titleEl.setAttribute('x', (width / 2).toString());
    titleEl.setAttribute('y', '32');
    titleEl.setAttribute('text-anchor', 'middle');
    titleEl.setAttribute('font-family', "'Outfit', 'Inter', 'Noto Sans JP', sans-serif");
    titleEl.setAttribute('font-size', '17');
    titleEl.setAttribute('font-weight', '700');
    titleEl.setAttribute('fill', '#0f172a');
    titleEl.textContent = title;
    svg.appendChild(titleEl);

    if (subtitle) {
      const subEl = document.createElementNS(svgNS, 'text');
      subEl.setAttribute('x', (width / 2).toString());
      subEl.setAttribute('y', '52');
      subEl.setAttribute('text-anchor', 'middle');
      subEl.setAttribute('font-family', "'Outfit', 'Inter', 'Noto Sans JP', sans-serif");
      subEl.setAttribute('font-size', '12.5');
      subEl.setAttribute('font-weight', '400');
      subEl.setAttribute('fill', '#64748b');
      subEl.textContent = subtitle;
      svg.appendChild(subEl);
    }
  }

  // 右側に引き出し線カードを収容するため、中心を少し左にオフセット
  const centerX = (numSets === 3) ? (width / 2 - 25) : (width / 2);
  const centerY = (title ? 70 : 35) + (height - (title ? 70 : 35)) / 2 - 10;

  // 幾何学定義と中心計算
  const circleRadius = (numSets === 2) ? 135 : 130;
  const shapes = []; // [{ id, type, cx, cy, r, rx, ry, rotate, color, label, labelX, labelY }]
  const regionCoords = {}; // key -> { x, y }

  if (numSets === 2) {
    // 2円ベン図
    const dist = 140;
    const cA = { id: sets[0].id, type: 'circle', cx: centerX - dist / 2, cy: centerY, r: circleRadius, color: sets[0].color, label: sets[0].label };
    const cB = { id: sets[1].id, type: 'circle', cx: centerX + dist / 2, cy: centerY, r: circleRadius, color: sets[1].color, label: sets[1].label };
    shapes.push(cA, cB);

    regionCoords[sets[0].id] = { x: cA.cx - 50, y: centerY };
    regionCoords[sets[1].id] = { x: cB.cx + 50, y: centerY };
    const intersectKey = [sets[0].id, sets[1].id].sort().join('');
    regionCoords[intersectKey] = { x: centerX, y: centerY };

    // ラベル位置
    cA.labelX = cA.cx - 45;
    cA.labelY = cA.cy - cA.r - 18;
    cB.labelX = cB.cx + 45;
    cB.labelY = cB.cy - cB.r - 18;

  } else if (numSets === 3) {
    // 3円ベン図（半径と中心間距離を広げて交差面積を拡大）
    const rDist = 74;
    const cA = { id: sets[0].id, type: 'circle', cx: centerX, cy: centerY - rDist, r: circleRadius, color: sets[0].color, label: sets[0].label };
    const cB = { id: sets[1].id, type: 'circle', cx: centerX - rDist * Math.cos(Math.PI / 6), cy: centerY + rDist * Math.sin(Math.PI / 6), r: circleRadius, color: sets[1].color, label: sets[1].label };
    const cC = { id: sets[2].id, type: 'circle', cx: centerX + rDist * Math.cos(Math.PI / 6), cy: centerY + rDist * Math.sin(Math.PI / 6), r: circleRadius, color: sets[2].color, label: sets[2].label };
    shapes.push(cA, cB, cC);

    const sA = sets[0].id, sB = sets[1].id, sC = sets[2].id;

    // 単独領域（外側へ程よくオフセット）
    regionCoords[sA] = { x: cA.cx, y: cA.cy - 52 };
    regionCoords[sB] = { x: cB.cx - 48, y: cB.cy + 35 };
    regionCoords[sC] = { x: cC.cx + 48, y: cC.cy + 35 };

    // 2者共通領域（中央から外側斜め方向へ十分に離して配置）
    const keyAB = [sA, sB].sort().join('');
    const keyAC = [sA, sC].sort().join('');
    const keyBC = [sB, sC].sort().join('');
    regionCoords[keyAB] = { x: centerX - 78, y: centerY - 32 };
    regionCoords[keyAC] = { x: centerX + 78, y: centerY - 32 };
    regionCoords[keyBC] = { x: centerX, y: centerY + 74 };

    // 3者共通領域（中央の交差点）
    const keyABC = [sA, sB, sC].sort().join('');
    regionCoords[keyABC] = { x: centerX, y: centerY + 8 };

    // ラベル位置
    cA.labelX = cA.cx;
    cA.labelY = cA.cy - cA.r - 18;
    cB.labelX = cB.cx - 70;
    cB.labelY = cB.cy + cB.r + 20;
    cC.labelX = cC.cx + 70;
    cC.labelY = cC.cy + cC.r + 20;

  } else {
    // 4集合ベン図（学術・ビジネス標準の対称4楕円モデル: 40度/-40度傾斜）
    const rx = 155;
    const ry = 92;
    const rot = 40;

    const sA = sets[0].id, sB = sets[1].id, sC = sets[2].id, sD = sets[3].id;
    const eA = { id: sA, type: 'ellipse', cx: centerX - 55, cy: centerY + 12, rx, ry, rotate: rot, color: sets[0].color, label: sets[0].label };
    const eB = { id: sB, type: 'ellipse', cx: centerX - 22, cy: centerY - 14, rx, ry, rotate: rot, color: sets[1].color, label: sets[1].label };
    const eC = { id: sC, type: 'ellipse', cx: centerX + 22, cy: centerY - 14, rx, ry, rotate: -rot, color: sets[2].color, label: sets[2].label };
    const eD = { id: sD, type: 'ellipse', cx: centerX + 55, cy: centerY + 12, rx, ry, rotate: -rot, color: sets[3].color, label: sets[3].label };
    shapes.push(eA, eB, eC, eD);

    // 単独領域（各楕円の外側）
    regionCoords[sA] = { x: centerX - 185, y: centerY + 55 };
    regionCoords[sB] = { x: centerX - 105, y: centerY - 110 };
    regionCoords[sC] = { x: centerX + 105, y: centerY - 110 };
    regionCoords[sD] = { x: centerX + 185, y: centerY + 55 };

    // 2者共通領域
    const keyAB = [sA, sB].sort().join('');
    const keyCD = [sC, sD].sort().join('');
    const keyBC = [sB, sC].sort().join('');
    const keyAD = [sA, sD].sort().join('');
    const keyAC = [sA, sC].sort().join('');
    const keyBD = [sB, sD].sort().join('');
    regionCoords[keyAB] = { x: centerX - 120, y: centerY - 25 };
    regionCoords[keyCD] = { x: centerX + 120, y: centerY - 25 };
    regionCoords[keyBC] = { x: centerX, y: centerY - 90 };
    regionCoords[keyAD] = { x: centerX, y: centerY + 105 };
    regionCoords[keyAC] = { x: centerX - 65, y: centerY + 60 };
    regionCoords[keyBD] = { x: centerX + 65, y: centerY + 60 };

    // 3者共通領域
    const keyABC = [sA, sB, sC].sort().join('');
    const keyBCD = [sB, sC, sD].sort().join('');
    const keyABD = [sA, sB, sD].sort().join('');
    const keyACD = [sA, sC, sD].sort().join('');
    regionCoords[keyABC] = { x: centerX - 45, y: centerY - 50 };
    regionCoords[keyBCD] = { x: centerX + 45, y: centerY - 50 };
    regionCoords[keyABD] = { x: centerX - 50, y: centerY + 25 };
    regionCoords[keyACD] = { x: centerX + 50, y: centerY + 25 };

    // 4者共通領域（中心）
    const keyABCD = [sA, sB, sC, sD].sort().join('');
    regionCoords[keyABCD] = { x: centerX, y: centerY - 10 };

    // ラベル位置
    eA.labelX = centerX - 200;
    eA.labelY = centerY + 95;
    eB.labelX = centerX - 110;
    eB.labelY = centerY - 145;
    eC.labelX = centerX + 110;
    eC.labelY = centerY - 145;
    eD.labelX = centerX + 200;
    eD.labelY = centerY + 95;
  }

  // シェイプ作成ヘルパー
  const createShapeElement = (c) => {
    let el;
    if (c.type === 'ellipse') {
      el = document.createElementNS(svgNS, 'ellipse');
      el.setAttribute('cx', c.cx.toString());
      el.setAttribute('cy', c.cy.toString());
      el.setAttribute('rx', c.rx.toString());
      el.setAttribute('ry', c.ry.toString());
      el.setAttribute('transform', `rotate(${c.rotate} ${c.cx} ${c.cy})`);
    } else {
      el = document.createElementNS(svgNS, 'circle');
      el.setAttribute('cx', c.cx.toString());
      el.setAttribute('cy', c.cy.toString());
      el.setAttribute('r', c.r.toString());
    }
    return el;
  };

  // クリップパスの定義（重なり領域ハイライト用）
  shapes.forEach(c => {
    const cp = document.createElementNS(svgNS, 'clipPath');
    cp.setAttribute('id', `venn-clip-${c.id}`);
    const clpEl = createShapeElement(c);
    cp.appendChild(clpEl);
    defs.appendChild(cp);
  });

  // レイヤーグループ
  const circleGroup = document.createElementNS(svgNS, 'g');
  circleGroup.setAttribute('class', 'venn-circles');
  svg.appendChild(circleGroup);

  const highlightGroup = document.createElementNS(svgNS, 'g');
  highlightGroup.setAttribute('class', 'venn-highlights');
  svg.appendChild(highlightGroup);

  const calloutLineGroup = document.createElementNS(svgNS, 'g');
  calloutLineGroup.setAttribute('class', 'venn-callout-lines');
  svg.appendChild(calloutLineGroup);

  const textGroup = document.createElementNS(svgNS, 'g');
  textGroup.setAttribute('class', 'venn-texts');
  svg.appendChild(textGroup);

  // 1. 各円・楕円のベース描画（美しいパステル半透明）
  shapes.forEach(c => {
    const shapeEl = createShapeElement(c);
    shapeEl.setAttribute('fill', c.color);
    shapeEl.setAttribute('fill-opacity', '0.22');
    shapeEl.setAttribute('stroke', c.color);
    shapeEl.setAttribute('stroke-width', '2');
    shapeEl.setAttribute('stroke-opacity', '0.85');
    circleGroup.appendChild(shapeEl);
  });

  // 2. ハイライト領域の描画
  highlights.forEach(hKey => {
    const matchedCoord = regionCoords[hKey];
    if (!matchedCoord) return;

    if (hKey.length === 2 && numSets >= 2) {
      const c1 = shapes.find(c => c.id === hKey[0]);
      const c2 = shapes.find(c => c.id === hKey[1]);
      if (c1 && c2) {
        const hl = createShapeElement(c2);
        hl.setAttribute('fill', '#f59e0b');
        hl.setAttribute('fill-opacity', '0.35');
        hl.setAttribute('clip-path', `url(#venn-clip-${c1.id})`);
        highlightGroup.appendChild(hl);
      }
    } else if (hKey.length === 3 && numSets >= 3) {
      const c1 = shapes.find(c => c.id === hKey[0]);
      const c2 = shapes.find(c => c.id === hKey[1]);
      const c3 = shapes.find(c => c.id === hKey[2]);
      if (c1 && c2 && c3) {
        const gHl = document.createElementNS(svgNS, 'g');
        gHl.setAttribute('clip-path', `url(#venn-clip-${c1.id})`);

        const hl = createShapeElement(c3);
        hl.setAttribute('fill', '#6366f1');
        hl.setAttribute('fill-opacity', '0.45');
        hl.setAttribute('clip-path', `url(#venn-clip-${c2.id})`);
        gHl.appendChild(hl);

        highlightGroup.appendChild(gHl);
      }
    } else if (hKey.length === 4 && numSets >= 4) {
      const c1 = shapes[0], c2 = shapes[1], c3 = shapes[2], c4 = shapes[3];
      const g1 = document.createElementNS(svgNS, 'g');
      g1.setAttribute('clip-path', `url(#venn-clip-${c1.id})`);
      const g2 = document.createElementNS(svgNS, 'g');
      g2.setAttribute('clip-path', `url(#venn-clip-${c2.id})`);

      const hl = createShapeElement(c4);
      hl.setAttribute('fill', '#8b5cf6');
      hl.setAttribute('fill-opacity', '0.45');
      hl.setAttribute('clip-path', `url(#venn-clip-${c3.id})`);
      g2.appendChild(hl);
      g1.appendChild(g2);

      highlightGroup.appendChild(g1);
    }
  });

  // 3. 集合ラベルバッジの描画（円の上部・側面に配置）
  shapes.forEach(c => {
    const g = document.createElementNS(svgNS, 'g');
    const labelStr = c.label;
    const textW = estimateVennTextWidth(labelStr, 13.5, true);
    const tw = Math.max(Math.ceil(textW + 26), 84);
    const th = 28;

    const bg = document.createElementNS(svgNS, 'rect');
    bg.setAttribute('x', (c.labelX - tw / 2).toString());
    bg.setAttribute('y', (c.labelY - th / 2).toString());
    bg.setAttribute('width', tw.toString());
    bg.setAttribute('height', th.toString());
    bg.setAttribute('rx', '7');
    bg.setAttribute('ry', '7');
    bg.setAttribute('fill', '#ffffff');
    bg.setAttribute('stroke', c.color);
    bg.setAttribute('stroke-width', '1.6');
    bg.setAttribute('filter', 'url(#venn-pill-shadow)');
    g.appendChild(bg);

    const txt = document.createElementNS(svgNS, 'text');
    txt.setAttribute('x', c.labelX.toString());
    txt.setAttribute('y', (c.labelY + 4.8).toString());
    txt.setAttribute('text-anchor', 'middle');
    txt.setAttribute('font-family', "'Outfit', 'Inter', 'Noto Sans JP', sans-serif");
    txt.setAttribute('font-size', '13.5');
    txt.setAttribute('font-weight', '700');
    txt.setAttribute('fill', '#0f172a');
    txt.textContent = labelStr;
    g.appendChild(txt);

    textGroup.appendChild(g);
  });

  // 4. 各領域のテキスト項目の描画（引き出し線対応）
  Object.keys(regions).forEach(key => {
    const region = regions[key];
    const coord = regionCoords[key];
    if (!coord || !region.text) return;

    // 3円ベン図の中央(ABC)および4楕円ベン図の中央(ABCD)は標準で引き出し線(Callout)にして外側へ配置
    const useCallout = (key.length === 3 && numSets === 3) || (key.length === 4 && numSets >= 4) || region.callout;

    if (useCallout) {
      // ─── 引き出し線（リーダー線）方式 ───
      const ptX = coord.x;
      const ptY = coord.y;

      // 始点ピンポイントドット
      const dot = document.createElementNS(svgNS, 'circle');
      dot.setAttribute('cx', ptX.toString());
      dot.setAttribute('cy', ptY.toString());
      dot.setAttribute('r', '4.5');
      dot.setAttribute('fill', '#4f46e5');
      dot.setAttribute('stroke', '#ffffff');
      dot.setAttribute('stroke-width', '2');
      calloutLineGroup.appendChild(dot);

      // 引き出し線の折れ曲がり座標
      const isFour = numSets >= 4;
      const bendX = isFour ? (ptX + 45) : (ptX + 26);
      const bendY = isFour ? (ptY - 80) : (ptY - 93);
      const endX = bendX + (isFour ? 105 : 115);
      const endY = bendY;

      const line = document.createElementNS(svgNS, 'path');
      line.setAttribute('d', `M ${ptX} ${ptY} L ${bendX} ${bendY} L ${endX} ${endY}`);
      line.setAttribute('fill', 'none');
      line.setAttribute('stroke', '#6366f1');
      line.setAttribute('stroke-width', '1.8');
      line.setAttribute('stroke-linecap', 'round');
      line.setAttribute('stroke-linejoin', 'round');
      calloutLineGroup.appendChild(line);

      // カード背景とテキスト
      const rawItems = region.text.split(/[,、\n]+/).map(s => s.trim()).filter(Boolean);
      const items = [];
      rawItems.forEach(it => {
        if (it.includes('/') || it.includes('／')) {
          const parts = it.split(/\s*[\/／]\s*/).filter(Boolean);
          parts.forEach((p, pIdx) => {
            items.push(pIdx === 0 ? p : `/ ${p}`);
          });
        } else {
          items.push(it);
        }
      });

      const maxItemW = Math.max(...items.map(it => estimateVennTextWidth(it, 12.5, true)));
      const cw = Math.max(Math.ceil(maxItemW + 26), 120);
      const ch = items.length > 1 ? (items.length * 17 + 14) : 30;

      const cardG = document.createElementNS(svgNS, 'g');
      const cardX = endX + 4;
      const cardY = endY;

      const cardBg = document.createElementNS(svgNS, 'rect');
      cardBg.setAttribute('x', cardX.toString());
      cardBg.setAttribute('y', (cardY - ch / 2).toString());
      cardBg.setAttribute('width', cw.toString());
      cardBg.setAttribute('height', ch.toString());
      cardBg.setAttribute('rx', '7');
      cardBg.setAttribute('ry', '7');
      cardBg.setAttribute('fill', '#f5f3ff');
      cardBg.setAttribute('stroke', '#818cf8');
      cardBg.setAttribute('stroke-width', '1.5');
      cardBg.setAttribute('filter', 'url(#venn-pill-shadow)');
      cardG.appendChild(cardBg);

      const textEl = document.createElementNS(svgNS, 'text');
      textEl.setAttribute('x', (cardX + cw / 2).toString());
      textEl.setAttribute('y', (cardY - (items.length - 1) * 8).toString());
      textEl.setAttribute('text-anchor', 'middle');
      textEl.setAttribute('font-family', "'Outfit', 'Inter', 'Noto Sans JP', sans-serif");
      textEl.setAttribute('font-size', '12.5');
      textEl.setAttribute('font-weight', '700');
      textEl.setAttribute('fill', '#3730a3');

      items.forEach((item, idx) => {
        const tspan = document.createElementNS(svgNS, 'tspan');
        tspan.setAttribute('x', (cardX + cw / 2).toString());
        tspan.setAttribute('dy', idx === 0 ? '4' : '16');
        tspan.textContent = item;
        textEl.appendChild(tspan);
      });

      cardG.appendChild(textEl);
      textGroup.appendChild(cardG);
      return;
    }

    // ─── 通常の領域内インライン描画 ───
    const rawItems = region.text.split(/[,、\n]+/).map(s => s.trim()).filter(Boolean);
    const items = [];
    rawItems.forEach(it => {
      // 2者交差でスラッシュがある場合は2行に分割して横幅を圧縮
      if (key.length === 2 && (it.includes('/') || it.includes('／'))) {
        const parts = it.split(/\s*[\/／]\s*/).filter(Boolean);
        parts.forEach((p, pIdx) => {
          items.push(pIdx === 0 ? p : `/ ${p}`);
        });
      } else {
        items.push(it);
      }
    });

    if (items.length === 0) return;

    const isTwoSetIntersect = (key.length === 2);
    const lineHeight = isTwoSetIntersect ? 15 : 17;
    const totalH = (items.length - 1) * lineHeight;
    const startY = coord.y - totalH / 2;

    const textEl = document.createElementNS(svgNS, 'text');
    textEl.setAttribute('x', coord.x.toString());
    textEl.setAttribute('y', startY.toString());
    textEl.setAttribute('text-anchor', 'middle');
    textEl.setAttribute('font-family', "'Outfit', 'Inter', 'Noto Sans JP', sans-serif");
    textEl.setAttribute('font-size', isTwoSetIntersect ? '11.5' : (region.highlight ? '13' : '12'));
    textEl.setAttribute('font-weight', region.highlight ? '700' : '600');
    textEl.setAttribute('fill', region.highlight ? '#1e1b4b' : '#1e293b');

    items.forEach((item, idx) => {
      const tspan = document.createElementNS(svgNS, 'tspan');
      tspan.setAttribute('x', coord.x.toString());
      tspan.setAttribute('dy', idx === 0 ? '0' : `${lineHeight}`);
      tspan.textContent = item;
      textEl.appendChild(tspan);
    });

    textGroup.appendChild(textEl);
  });

  // コンテナ配置
  const wrapper = document.createElement('div');
  wrapper.className = 'venn-container';
  wrapper.style.display = 'flex';
  wrapper.style.justifyContent = 'center';
  wrapper.style.alignItems = 'center';
  wrapper.style.width = '100%';
  wrapper.style.overflowX = 'auto';
  wrapper.style.padding = '8px 0';
  wrapper.appendChild(svg);

  container.appendChild(wrapper);
}

// エイリアス関数
function drawVenn(text, container, labelText) {
  drawVennSvg(text, container, labelText);
}

