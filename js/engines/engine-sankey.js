// ==========================================
// サンキーダイアグラム構文パーサー & SVG描画エンジン
// 対応タイプ:
// 1. standard (標準多段ネットワーク / Alluvial多層マッピング)
// 2. energy   (熱・エネルギー損失 / 物理工学・矢印型)
// 3. breakout (ビジネス向けパーセンテージ / L字直角分岐)
// 4. funnel   (コストフロー / ファネル収束＆再分岐)
// ==========================================

function parseSankeyDiagram(text) {
  if (!text || typeof text !== 'string') return null;
  let cleanText = text.trim();
  const wrapperMatch = cleanText.match(/^\\(?:sankey)\{([\s\S]*)\}$/i);
  if (wrapperMatch) {
    cleanText = wrapperMatch[1];
  }
  const tikzMatch = cleanText.match(/\\begin\{tikzpicture\}([\s\S]*?)\\end\{tikzpicture\}/i);
  if (tikzMatch) {
    cleanText = tikzMatch[1];
  }

  const lines = cleanText
    .split(/[\n;]+/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('//') && !l.startsWith('#') && !l.startsWith('%'));
  const links = [];
  const nodeNamesSet = new Set();
  const nodeMeta = {};
  let title = null;
  let subtitle = null;
  let note = null;
  let diagramType = 'standard';
  let stageHeaders = [];
  const dedicatedItems = [];

  const extractBracketProps = (bracketStr) => {
    if (!bracketStr) return { value: null, percent: null, color: null, side: null, role: null };
    const parts = bracketStr.split(',').map((p) => p.trim()).filter(Boolean);
    let value = null;
    let percent = null;
    let color = null;
    let side = null;
    let role = null;

    parts.forEach((p) => {
      if (/^-?[\d,]+(?:\.\d+)?%$/.test(p)) {
        percent = p;
      } else if (/^-?[\d,]+(?:\.\d+)?$/.test(p)) {
        value = parseFloat(p.replace(/,/g, ''));
      } else if (/^(above|below|left|right)$/i.test(p)) {
        side = p.toLowerCase();
      } else if (/^(up|right|loss|input|output|recovery|recycle|activity|expense|product)$/i.test(p)) {
        role = p.toLowerCase();
      } else if (/^#[0-9a-fA-F]{3,8}$/.test(p) || /^[a-zA-Z]+$/.test(p)) {
        color = p;
      }
    });
    return { value, percent, color, side, role };
  };

  lines.forEach((line) => {
    // 1. タイプ指定
    const mType = line.match(/^(?:type|layout|style)\s*:\s*["']?([a-z_-]+)["']?$/i);
    if (mType) {
      diagramType = mType[1].toLowerCase().replace(/_/g, '-');
      return;
    }

    // 2. ステージ列ヘッダー: stages: 列1, 列2, 列3... / headers: ...
    const mStages = line.match(/^(?:stages|headers)\s*:\s*(.+)$/i);
    if (mStages) {
      stageHeaders = mStages[1].split(',').map((s) => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
      return;
    }

    // 3. タイトル・メタデータ行
    const mTitle = line.match(/^title\s*:\s*["']?([^;"'\n]+)["']?$/i);
    if (mTitle) {
      title = mTitle[1].trim();
      return;
    }
    const mSub = line.match(/^subtitle\s*:\s*["']?([^;"'\n]+)["']?$/i);
    if (mSub) {
      subtitle = mSub[1].trim();
      return;
    }
    const mNote = line.match(/^note\s*:\s*["']?([^;"'\n]+)["']?$/i);
    if (mNote) {
      note = mNote[1].trim();
      return;
    }

    // 4. 専用キーワード行 (energy, breakout, funnel 向け)
    const mDedicated = line.match(/^(input|loss|output|recovery|recycle|root|up|right|activity|in|out)\s*:\s*(.+)$/i);
    if (mDedicated) {
      const role = mDedicated[1].toLowerCase();
      const content = mDedicated[2].trim();
      const parts = content.split(',').map((p) => p.trim());
      const name = parts[0].replace(/^["']|["']$/g, '');
      const val = parts[1] ? parseFloat(parts[1].replace(/,/g, '')) : 10;
      let pct = parts[2] ? parts[2].replace(/^["'\[]|["'\]]$/g, '') : null;
      let col = parts[3] ? parts[3].replace(/^["']|["']$/g, '') : null;

      // 引数の順番が [10%, #color] の場合の補正
      if (pct && (pct.startsWith('#') || /^[a-z]+$/i.test(pct))) {
        col = pct;
        pct = null;
      }

      dedicatedItems.push({
        role,
        name,
        value: isNaN(val) ? 10 : val,
        percent: pct || `${val}%`,
        color: col
      });
      return;
    }

    // 5. ノード明示指定行: node: 資産 [100%, #1e293b, above];
    const mNode = line.match(/^node\s*:\s*([^\[]+)(?:\[(.*?)\])?$/i);
    if (mNode) {
      const name = mNode[1].replace(/^["']|["']$/g, '').trim();
      if (name) {
        nodeNamesSet.add(name);
        const props = extractBracketProps(mNode[2]);
        nodeMeta[name] = Object.assign(nodeMeta[name] || {}, props);
      }
      return;
    }

    // 6. リンク行: src [props] -> tgt [props] または src -> tgt [props]
    if (line.includes('->')) {
      const arrowIdx = line.indexOf('->');
      let leftPart = line.substring(0, arrowIdx).trim();
      let rightPart = line.substring(arrowIdx + 2).trim();

      let srcProps = { value: null, percent: null, color: null, side: null, role: null };
      const mLeftBracket = leftPart.match(/\[(.*?)\]$/);
      if (mLeftBracket) {
        srcProps = extractBracketProps(mLeftBracket[1]);
        leftPart = leftPart.substring(0, mLeftBracket.index).trim();
      }

      let tgtProps = { value: null, percent: null, color: null, side: null, role: null };
      const mRightBracket = rightPart.match(/\[(.*?)\]$/);
      if (mRightBracket) {
        tgtProps = extractBracketProps(mRightBracket[1]);
        rightPart = rightPart.substring(0, mRightBracket.index).trim();
      }

      let trailingColor = null;
      const colorMatch = rightPart.match(/\s+(#[a-fA-F0-9]{3,8})$/);
      if (colorMatch) {
        trailingColor = colorMatch[1];
        rightPart = rightPart.replace(/\s+#[a-fA-F0-9]{3,8}$/, '').trim();
      }

      const src = leftPart.replace(/^["']|["']$/g, '').trim();
      const tgt = rightPart.replace(/^["']|["']$/g, '').trim();

      const val = tgtProps.value !== null ? tgtProps.value : (srcProps.value !== null ? srcProps.value : 10);
      const linkColor = tgtProps.color || srcProps.color || trailingColor || null;
      const linkPercent = tgtProps.percent || srcProps.percent || null;

      if (src && tgt) {
        links.push({
          source: src,
          target: tgt,
          value: val,
          color: linkColor,
          percent: linkPercent,
          role: tgtProps.role || srcProps.role || null
        });
        nodeNamesSet.add(src);
        nodeNamesSet.add(tgt);

        if (!nodeMeta[src]) nodeMeta[src] = {};
        if (srcProps.percent) nodeMeta[src].percent = srcProps.percent;
        if (srcProps.color) nodeMeta[src].color = srcProps.color;
        if (srcProps.side) nodeMeta[src].side = srcProps.side;

        if (!nodeMeta[tgt]) nodeMeta[tgt] = {};
        if (tgtProps.percent) nodeMeta[tgt].percent = tgtProps.percent;
        if (tgtProps.color) nodeMeta[tgt].color = tgtProps.color;
        if (tgtProps.side) nodeMeta[tgt].side = tgtProps.side;
      }
    }
  });

  return {
    title,
    subtitle,
    note,
    type: diagramType,
    stageHeaders,
    dedicatedItems,
    links,
    nodes: Array.from(nodeNamesSet),
    nodeMeta
  };
}

// ==========================================
// 1. エネルギー・損失分岐レンダラー (type: energy)
// ==========================================
function drawEnergySankeySvg(data, container, labelText) {
  const { title, subtitle, note, links, dedicatedItems } = data;

  // データ抽出
  let inputItem = dedicatedItems.find((d) => d.role === 'input') || { name: '投入熱量エネルギー', value: 100, percent: '100%', color: '#f97316' };
  let lossItems = dedicatedItems.filter((d) => d.role === 'loss');
  let outputItem = dedicatedItems.find((d) => d.role === 'output');

  if (dedicatedItems.length === 0 && links.length > 0) {
    inputItem = { name: links[0].source, value: 100, percent: '100%', color: '#f97316' };
    links.forEach((l) => {
      if (/排熱|排気|放射|冷却|損失|ロス|friction|exhaust|cool|radiation/i.test(l.target)) {
        lossItems.push({ name: l.target, value: l.value, percent: l.percent || `${l.value}%`, color: l.color || '#ef4444' });
      } else if (!outputItem) {
        outputItem = { name: l.target, value: l.value, percent: l.percent || `${l.value}%`, color: l.color || '#0284c7' };
      }
    });
  }

  if (lossItems.length === 0) {
    lossItems = [
      { name: '冷却水排熱損失', value: 30, percent: '30%', color: '#ef4444' },
      { name: '排気ガス熱損失', value: 24, percent: '24%', color: '#dc2626' },
      { name: 'エンジン放射熱', value: 5, percent: '5%', color: '#b91c1c' }
    ];
  }
  if (!outputItem) {
    outputItem = { name: '有効駆動出力 (Wheels)', value: 41, percent: '41%', color: '#0284c7' };
  }

  // 流量項目の抽出・マッピング
  const radItem = lossItems.find((l) => /rad|放射/i.test(l.name)) || { name: 'Radiation', value: 5, percent: '5%', color: '#b91c1c' };
  const coolItem = lossItems.find((l) => /cool|冷却/i.test(l.name)) || { name: 'Cooling System', value: 30, percent: '30%', color: '#ef4444' };
  const exhItem = lossItems.find((l) => /exh|排気|排熱/i.test(l.name)) || { name: 'Exhaust', value: 24, percent: '24%', color: '#dc2626' };
  const recoveryItem = dedicatedItems.find((d) => d.role === 'recovery' || d.role === 'recycle') || { name: 'Heat 2 Power in action', value: 11, percent: '11%' };

  const width = 880;
  const height = 470;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.style.maxWidth = `${width}px`;
  svg.style.display = 'block';
  svg.style.margin = '0 auto';

  // 背景
  const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  bg.setAttribute('width', width);
  bg.setAttribute('height', height);
  bg.setAttribute('fill', '#ffffff');
  bg.setAttribute('rx', '8');
  svg.appendChild(bg);

  // タイトル
  if (title) {
    const tEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    tEl.setAttribute('x', width / 2);
    tEl.setAttribute('y', 34);
    tEl.setAttribute('text-anchor', 'middle');
    tEl.setAttribute('font-size', '17');
    tEl.setAttribute('font-weight', '700');
    tEl.setAttribute('fill', '#1e293b');
    tEl.setAttribute('font-family', 'sans-serif');
    tEl.textContent = title;
    svg.appendChild(tEl);
  }

  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  // 左端ブロックのグラデーション
  const grad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
  grad.setAttribute('id', 'energy-input-grad');
  grad.setAttribute('x1', '0%');
  grad.setAttribute('y1', '0%');
  grad.setAttribute('x2', '100%');
  grad.setAttribute('y2', '0%');
  grad.innerHTML = '<stop offset="0%" stop-color="#ffedd5"/><stop offset="50%" stop-color="#fdba74"/><stop offset="100%" stop-color="#f97316"/>';
  defs.appendChild(grad);

  // 廃熱回収グラデーション（赤から水色・青へ変化）
  const heatGrad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
  heatGrad.setAttribute('id', 'heat2power-grad');
  heatGrad.setAttribute('x1', '0%');
  heatGrad.setAttribute('y1', '100%');
  heatGrad.setAttribute('x2', '55%');
  heatGrad.setAttribute('y2', '0%');
  heatGrad.innerHTML = '<stop offset="0%" stop-color="#dc2626"/><stop offset="40%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#0284c7"/>';
  defs.appendChild(heatGrad);

  // 引き出し矢印用マーカー
  const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
  marker.setAttribute('id', 'heat-arrow');
  marker.setAttribute('viewBox', '0 0 10 10');
  marker.setAttribute('refX', '7');
  marker.setAttribute('refY', '5');
  marker.setAttribute('markerWidth', '6');
  marker.setAttribute('markerHeight', '6');
  marker.setAttribute('orient', 'auto-start-reverse');
  marker.innerHTML = '<path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#64748b"/>';
  defs.appendChild(marker);
  svg.appendChild(defs);

  // レイアウト座標（全体の高さ totalH を 100% として厳密にパーセント比例配分: 1% = 2.0px）
  const startX = 35;
  const startY = 75;
  const totalH = 200; // 100% = 200px
  const unitH = totalH / 100; // 1% あたり 2.0px
  const branchX = 220;

  // 各層の厚み（％比例計算）
  const hWheels = 30 * unitH;   // 30% = 60px (Wheels 始点)
  const hRad = 5 * unitH;       // 5%  = 10px (Radiation)
  const hCool = 30 * unitH;      // 30% = 60px (Cooling System)
  const hExhInit = 35 * unitH;  // 35% = 70px (Exhaust 始点)
  const hExhTip = 24 * unitH;   // 24% = 48px (Exhaust 先端)
  const hRec = 11 * unitH;      // 11% = 22px (Heat 2 Power 回収)
  const hWheelsEnd = 41 * unitH; // 41% = 82px (Wheels 合流後先端: 30% + 11% = 41%)

  // 境界 Y 座標（75 -> 135 -> 145 -> 205 -> 275: 隙間ゼロ）
  const yWheelsTop = startY;                  // 75
  const yRadTop = yWheelsTop + hWheels;       // 135
  const yCoolTop = yRadTop + hRad;            // 145
  const yExhTop = yCoolTop + hCool;           // 205

  // アンチエイリアス白スジを完全に防ぐオーバーラップ太さ (+1px)
  const wRad = hRad + 1;
  const wCool = hCool + 1;
  const wExhInit = hExhInit + 1;

  // 1. 投入幹（左側ブロック: 100% = 200px、底面 Y = 275）
  const inPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  inPath.setAttribute('d', `M ${startX} ${startY} L ${branchX + 1} ${startY} L ${branchX + 1} ${startY + totalH} L ${startX} ${startY + totalH} Z`);
  inPath.setAttribute('fill', 'url(#energy-input-grad)');
  svg.appendChild(inPath);

  // 投入ラベル（複数行）
  const inTextG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  inTextG.innerHTML = `
    <text x="${startX + 20}" y="${startY + 65}" font-size="15" font-weight="700" fill="#431407" font-family="sans-serif">${inputItem.name}</text>
    <text x="${startX + 20}" y="${startY + 90}" font-size="13" font-weight="600" fill="#7c2d12" font-family="sans-serif">content</text>
    <text x="${startX + 20}" y="${startY + 135}" font-size="26" font-weight="800" fill="#9a3412" font-family="sans-serif">[${inputItem.percent}]</text>
  `;
  svg.appendChild(inTextG);

  // 矢印ヘッドを帯の進行方向（接線ベクトル）に厳密一致させて生成する関数
  const createOrientedArrowHead = (baseX, baseY, dx, dy, strokeW, headWExtra = 16, headLen = 24, color = '#dc2626') => {
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len;
    const uy = dy / len;
    const nx = -uy;
    const ny = ux;

    const headW = strokeW + headWExtra;
    const tipX = baseX + ux * headLen;
    const tipY = baseY + uy * headLen;

    const leftWingX = baseX + nx * (headW / 2);
    const leftWingY = baseY + ny * (headW / 2);
    const rightWingX = baseX - nx * (headW / 2);
    const rightWingY = baseY - ny * (headW / 2);

    const leftBaseX = baseX + nx * (strokeW / 2);
    const leftBaseY = baseY + ny * (strokeW / 2);
    const rightBaseX = baseX - nx * (strokeW / 2);
    const rightBaseY = baseY - ny * (strokeW / 2);

    const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    poly.setAttribute('points', `
      ${leftWingX},${leftWingY}
      ${tipX},${tipY}
      ${rightWingX},${rightWingY}
      ${rightBaseX},${rightBaseY}
      ${leftBaseX},${leftBaseY}
    `);
    poly.setAttribute('fill', color);
    return { poly, tipX, tipY, ux, uy };
  };

  // 2. 層1: 放射熱（Radiation: 5% = 10px）- 奥のレイヤー、Wheels直下を水平直進してからカーブ
  const radYCenter = yRadTop + hRad / 2; // 140 (135〜145の真ん中)
  const radLeadX = branchX + 230;        // 長く水平直進
  const radBaseX = branchX + 390;
  const radBaseY = 225;
  const radDx = 1.3;
  const radDy = 1.0;

  const radPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  radPath.setAttribute('d', `
    M ${branchX} ${radYCenter}
    L ${radLeadX} ${radYCenter}
    C ${radLeadX + 80} ${radYCenter}, ${radBaseX - 30} ${radBaseY - 30}, ${radBaseX} ${radBaseY}
  `);
  radPath.setAttribute('fill', 'none');
  radPath.setAttribute('stroke', radItem.color || '#b91c1c');
  radPath.setAttribute('stroke-width', wRad);
  radPath.setAttribute('stroke-linecap', 'butt');
  svg.appendChild(radPath);

  // Radiation 矢印ヘッド
  const radArrow = createOrientedArrowHead(radBaseX, radBaseY, radDx, radDy, hRad, 12, 18, radItem.color || '#b91c1c');
  svg.appendChild(radArrow.poly);

  // Radiation ラベル
  const radLbl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  radLbl.setAttribute('x', radArrow.tipX + 14);
  radLbl.setAttribute('y', radArrow.tipY + 4);
  radLbl.setAttribute('font-size', '13');
  radLbl.setAttribute('font-weight', '700');
  radLbl.setAttribute('fill', '#1e293b');
  radLbl.setAttribute('font-family', 'sans-serif');
  radLbl.innerHTML = `Radiation: <tspan font-weight="800" fill="${radItem.color || '#b91c1c'}">5%</tspan>`;
  svg.appendChild(radLbl);

  // 35% 区間（Y: 205 〜 275）を上側 11% (回収) と下側 24% (排気) に最初から分割
  const yRecCenter = yExhTop + hRec / 2;             // 216 (205〜227 の中心)
  const yExh24Center = yExhTop + hRec + hExhTip / 2; // 251 (227〜275 の中心)
  const wRec = hRec + 1;                             // 23px
  const wExh24 = hExhTip + 1;                        // 49px

  // 3. 層3: 排気（Exhaust: 24% = 48px）- 始点から等幅のまま滑らかに右下先端へ
  const exhLeadX = branchX + 60;
  const exhBaseX = branchX + 215;
  const exhBaseY = 375;
  const exhDx = 1.0;
  const exhDy = 1.4;

  const exhMainPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  exhMainPath.setAttribute('d', `
    M ${branchX} ${yExh24Center}
    L ${exhLeadX} ${yExh24Center}
    C ${exhLeadX + 45} ${yExh24Center}, ${exhBaseX - 30} ${exhBaseY - 45}, ${exhBaseX} ${exhBaseY}
  `);
  exhMainPath.setAttribute('fill', 'none');
  exhMainPath.setAttribute('stroke', exhItem.color || '#dc2626');
  exhMainPath.setAttribute('stroke-width', wExh24);
  exhMainPath.setAttribute('stroke-linecap', 'butt');
  svg.appendChild(exhMainPath);

  // Exhaust 先端矢印ヘッド
  const exhArrow = createOrientedArrowHead(exhBaseX, exhBaseY, exhDx, exhDy, hExhTip, 16, 26, exhItem.color || '#dc2626');
  svg.appendChild(exhArrow.poly);

  // Exhaust 35% ラベル（始点直後の 11% と 24% の合算中央に配置）
  const exh35Txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  exh35Txt.setAttribute('x', branchX + 65);
  exh35Txt.setAttribute('y', 247);
  exh35Txt.setAttribute('font-size', '15');
  exh35Txt.setAttribute('font-weight', '800');
  exh35Txt.setAttribute('fill', '#ffffff');
  exh35Txt.setAttribute('font-family', 'sans-serif');
  exh35Txt.textContent = '35%';
  svg.appendChild(exh35Txt);

  // Exhaust: 24% ラベル
  const exhLbl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  exhLbl.setAttribute('x', exhArrow.tipX);
  exhLbl.setAttribute('y', exhArrow.tipY + 22);
  exhLbl.setAttribute('text-anchor', 'middle');
  exhLbl.setAttribute('font-size', '13');
  exhLbl.setAttribute('font-weight', '700');
  exhLbl.setAttribute('fill', '#1e293b');
  exhLbl.setAttribute('font-family', 'sans-serif');
  exhLbl.innerHTML = `Exhaust: <tspan font-weight="800" fill="${exhItem.color || '#dc2626'}">24%</tspan>`;
  svg.appendChild(exhLbl);

  // 4. 層2: 冷却水（Cooling System: 30% = 60px）- 手前を長く水平直進してからカーブ
  const coolYCenter = yCoolTop + hCool / 2; // 175 (145〜205の真ん中)
  const coolLeadX = branchX + 130;          // 水平直進区間
  const coolBaseX = branchX + 320;
  const coolBaseY = 330;
  const coolDx = 1.1;
  const coolDy = 1.3;

  const coolPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  coolPath.setAttribute('d', `
    M ${branchX} ${coolYCenter}
    L ${coolLeadX} ${coolYCenter}
    C ${coolLeadX + 60} ${coolYCenter}, ${coolBaseX - 35} ${coolBaseY - 45}, ${coolBaseX} ${coolBaseY}
  `);
  coolPath.setAttribute('fill', 'none');
  coolPath.setAttribute('stroke', coolItem.color || '#ef4444');
  coolPath.setAttribute('stroke-width', wCool);
  coolPath.setAttribute('stroke-linecap', 'butt');
  svg.appendChild(coolPath);

  // Cooling System 先端矢印ヘッド
  const coolArrow = createOrientedArrowHead(coolBaseX, coolBaseY, coolDx, coolDy, hCool, 16, 26, coolItem.color || '#ef4444');
  svg.appendChild(coolArrow.poly);

  // Cooling 30% ラベル
  const cool30Txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  cool30Txt.setAttribute('x', branchX + 115);
  cool30Txt.setAttribute('y', coolYCenter + 6);
  cool30Txt.setAttribute('font-size', '15');
  cool30Txt.setAttribute('font-weight', '800');
  cool30Txt.setAttribute('fill', '#ffffff');
  cool30Txt.setAttribute('font-family', 'sans-serif');
  cool30Txt.textContent = '30%';
  svg.appendChild(cool30Txt);

  // Cooling System ラベル
  const coolLbl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  coolLbl.setAttribute('x', coolArrow.tipX + 18);
  coolLbl.setAttribute('y', coolArrow.tipY + 4);
  coolLbl.setAttribute('font-size', '13');
  coolLbl.setAttribute('font-weight', '700');
  coolLbl.setAttribute('fill', '#1e293b');
  coolLbl.setAttribute('font-family', 'sans-serif');
  coolLbl.textContent = 'Cooling System';
  svg.appendChild(coolLbl);

  // 5. 廃熱回収リボン（Heat 2 Power: 11% = 22px、始点から密着並進し、UターンしてCoolingを跨いでWheelsへ合流）
  const mergeX = branchX + 280;
  const mergeY = yWheelsTop + hWheels; // 135 (Wheels底面)

  const recPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  recPath.setAttribute('d', `
    M ${branchX} ${yRecCenter}
    L ${branchX + 50} ${yRecCenter}
    C ${branchX + 85} ${yRecCenter}, ${branchX + 95} 250, ${branchX + 120} 250
    C ${branchX + 155} 250, ${mergeX - 45} ${mergeY + 15}, ${mergeX} ${mergeY}
  `);
  recPath.setAttribute('fill', 'none');
  recPath.setAttribute('stroke', 'url(#heat2power-grad)');
  recPath.setAttribute('stroke-width', wRec);
  recPath.setAttribute('stroke-linecap', 'round');
  svg.appendChild(recPath);

  // 6. 層0: 主流（Wheels: 始点 30% = 60px -> 回収合流後 41% = 82px の主軸矢印）
  const arrowX = 660;
  const tipX = 720;

  const arrowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  arrowPath.setAttribute('d', `
    M ${branchX} ${yWheelsTop}
    L ${arrowX} ${yWheelsTop}
    L ${arrowX} ${yWheelsTop - 14}
    L ${tipX} ${yWheelsTop + hWheelsEnd / 2}
    L ${arrowX} ${yWheelsTop + hWheelsEnd + 14}
    L ${arrowX} ${yWheelsTop + hWheelsEnd}
    L ${mergeX} ${yWheelsTop + hWheelsEnd}
    C ${mergeX - 20} ${yWheelsTop + hWheelsEnd}, ${mergeX - 40} ${yWheelsTop + hWheels}, ${mergeX - 60} ${yWheelsTop + hWheels}
    L ${branchX} ${yWheelsTop + hWheels}
    Z
  `);
  arrowPath.setAttribute('fill', outputItem.color || '#0284c7');
  svg.appendChild(arrowPath);

  // Wheels 内ラベル（30% と 41%）
  const outTxtG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  outTxtG.innerHTML = `
    <text x="${branchX + 130}" y="${yWheelsTop + hWheels / 2 + 7}" font-size="16" font-weight="800" fill="#ffffff" font-family="sans-serif">30%</text>
    <text x="${branchX + 340}" y="${yWheelsTop + hWheelsEnd / 2 + 7}" font-size="20" font-weight="800" fill="#ffffff" font-family="sans-serif">41%</text>
    <text x="${tipX + 18}" y="${yWheelsTop + hWheelsEnd / 2 - 2}" font-size="15" font-weight="800" fill="#0369a1" font-family="sans-serif">Wheels</text>
    <text x="${tipX + 18}" y="${yWheelsTop + hWheelsEnd / 2 + 18}" font-size="12" font-weight="700" fill="#475569" font-family="sans-serif">有効駆動軸出力</text>
  `;
  // Heat 2 Power 引き出し矢印・ラベル
  const ptrBaseX = branchX + 145;
  const ptrBaseY = 225;
  const ptrLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  ptrLine.setAttribute('d', `M ${ptrBaseX} ${ptrBaseY} L ${ptrBaseX + 22} ${ptrBaseY - 20}`);
  ptrLine.setAttribute('stroke', '#64748b');
  ptrLine.setAttribute('stroke-width', '1.5');
  ptrLine.setAttribute('marker-end', 'url(#heat-arrow)');

  const ptrTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  ptrTxt.setAttribute('x', ptrBaseX + 26);
  ptrTxt.setAttribute('y', ptrBaseY - 22);
  ptrTxt.setAttribute('font-size', '12');
  ptrTxt.setAttribute('font-weight', '700');
  ptrTxt.setAttribute('fill', '#0369a1');
  ptrTxt.setAttribute('font-family', 'sans-serif');
  ptrTxt.textContent = `${recoveryItem.name} [${recoveryItem.percent}]`;

  svg.appendChild(outTxtG);
  svg.appendChild(ptrLine);
  svg.appendChild(ptrTxt);

  container.innerHTML = '';
  container.appendChild(svg);
  if (labelText) {
    const lbl = document.createElement('div');
    lbl.className = 'chem-structure-label';
    lbl.textContent = labelText;
    container.appendChild(lbl);
  }
}

// ==========================================
// 2. ビジネス向けL字分岐レンダラー (type: breakout)
// ==========================================
function drawBreakoutSankeySvg(data, container, labelText) {
  const { title, dedicatedItems } = data;

  const rootItem = dedicatedItems.find((d) => d.role === 'root') || {
    name: '全社売上高 (100%)',
    value: 100,
    desc: '売上高・構成比のブレイクアウト分析'
  };

  const upItems = dedicatedItems.filter((d) => d.role === 'up');
  const rightItems = dedicatedItems.filter((d) => d.role === 'right');

  const defaultUp = [
    { name: '新規事業 A', percent: '6%', color: '#dc2626' },
    { name: '新規事業 B', percent: '7%', color: '#ea580c' },
    { name: 'R&D投資枠', percent: '8%', color: '#f59e0b' }
  ];
  const defaultRight = [
    { name: '国内リテール事業', percent: '10%', color: '#0284c7' },
    { name: '法人エンタープライズ', percent: '13%', color: '#64748b' },
    { name: '海外クラウド主力', percent: '49%', color: '#10b981' }
  ];

  const finalUp = upItems.length > 0 ? upItems : defaultUp;
  const finalRight = rightItems.length > 0 ? rightItems : defaultRight;

  const parsePct = (item) => {
    if (item.percent) {
      const m = item.percent.match(/([\d.]+)/);
      if (m) return parseFloat(m[1]);
    }
    if (typeof item.value === 'number') return item.value;
    return 10;
  };

  const width = 720;
  const height = 450;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.style.maxWidth = `${width}px`;
  svg.style.display = 'block';
  svg.style.margin = '0 auto';

  // 背景
  const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  bg.setAttribute('width', width);
  bg.setAttribute('height', height);
  bg.setAttribute('fill', '#f8fafc');
  bg.setAttribute('rx', '8');
  svg.appendChild(bg);

  // タイトル
  if (title) {
    const tEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    tEl.setAttribute('x', width / 2);
    tEl.setAttribute('y', 28);
    tEl.setAttribute('text-anchor', 'middle');
    tEl.setAttribute('font-size', '16');
    tEl.setAttribute('font-weight', '700');
    tEl.setAttribute('fill', '#1e293b');
    tEl.setAttribute('font-family', 'sans-serif');
    tEl.textContent = title;
    svg.appendChild(tEl);
  }

  // 起点ボックス (左下)
  const rootW = 230;
  const rootH = 190;
  const rootX = 25;
  const rootY = 220;

  // 全パーセント集計とスケール按分（大元ブロックの高さと完全に一致させる）
  const allItems = [...finalUp, ...finalRight];
  const totalPct = allItems.reduce((sum, item) => sum + parsePct(item), 0) || 100;
  const scale = rootH / totalPct;

  let currentY = rootY;
  const upLayouts = [];
  finalUp.forEach((item) => {
    const thick = Math.max(8, parsePct(item) * scale);
    upLayouts.push({ item, y: currentY, thick });
    currentY += thick;
  });

  const rightLayouts = [];
  finalRight.forEach((item, j) => {
    const isLast = (j === finalRight.length - 1);
    const thick = isLast ? Math.max(8, (rootY + rootH) - currentY) : Math.max(8, parsePct(item) * scale);
    rightLayouts.push({ item, y: currentY, thick });
    currentY += thick;
  });

  // 起点ボックス描画
  const rootBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rootBg.setAttribute('x', rootX);
  rootBg.setAttribute('y', rootY);
  rootBg.setAttribute('width', rootW);
  rootBg.setAttribute('height', rootH);
  rootBg.setAttribute('fill', '#334155');
  rootBg.setAttribute('rx', '6');
  svg.appendChild(rootBg);

  const rootTxtG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  rootTxtG.innerHTML = `
    <text x="${rootX + 16}" y="${rootY + 45}" font-size="16.5" font-weight="800" fill="#ffffff" font-family="sans-serif">${rootItem.name}</text>
    <text x="${rootX + 16}" y="${rootY + 80}" font-size="11.5" fill="#cbd5e1" font-family="sans-serif">売上高・構成比のブレイクアウト分析</text>
    <text x="${rootX + 16}" y="${rootY + 102}" font-size="11.5" fill="#cbd5e1" font-family="sans-serif">成長ドライバーと主力基盤の分岐推移</text>
  `;
  svg.appendChild(rootTxtG);

  // 1. 上向きL字矢印群（短縮・文字重なり防止・三角トンガリ）
  const tipLenUp = 10;
  upLayouts.forEach((layout, i) => {
    const { item, y, thick } = layout;
    const turnX = rootX + rootW + 50 + i * 68;
    // 先端Y座標（短く設定し、階段状に段差をつけて文字重なりを完全防止）
    const arrowTopY = 100 - i * 16;
    const rightStartX = rootX + rootW;
    const rCorner = 20 + i * 8;

    const upPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    upPath.setAttribute('d', `
      M ${rightStartX} ${y.toFixed(1)}
      L ${(turnX - rCorner).toFixed(1)} ${y.toFixed(1)}
      Q ${turnX.toFixed(1)} ${y.toFixed(1)}, ${turnX.toFixed(1)} ${(y - rCorner).toFixed(1)}
      L ${turnX.toFixed(1)} ${(arrowTopY + tipLenUp).toFixed(1)}
      L ${(turnX + thick / 2).toFixed(1)} ${arrowTopY.toFixed(1)}
      L ${(turnX + thick).toFixed(1)} ${(arrowTopY + tipLenUp).toFixed(1)}
      L ${(turnX + thick).toFixed(1)} ${(y + thick - rCorner).toFixed(1)}
      Q ${(turnX + thick).toFixed(1)} ${(y + thick).toFixed(1)}, ${(turnX - rCorner).toFixed(1)} ${(y + thick).toFixed(1)}
      L ${rightStartX} ${(y + thick).toFixed(1)}
      Z
    `);
    upPath.setAttribute('fill', item.color);
    svg.appendChild(upPath);

    // 上部テキスト（矢印先端の上、重なり防止）
    const centerX = turnX + thick / 2;
    const pctStr = item.percent || (parsePct(item) + '%');

    const upTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    upTxt.setAttribute('x', centerX.toFixed(1));
    upTxt.setAttribute('y', (arrowTopY - 6).toFixed(1));
    upTxt.setAttribute('text-anchor', 'middle');
    upTxt.setAttribute('font-size', '11.5');
    upTxt.setAttribute('font-weight', '700');
    upTxt.setAttribute('fill', item.color);
    upTxt.setAttribute('font-family', 'sans-serif');
    upTxt.textContent = `${item.name} ${pctStr}`;
    svg.appendChild(upTxt);
  });

  // 2. 水平右向き矢印群（隙間なし密着・フラットな三角トンガリ）
  const rightStartX = rootX + rootW;
  const rightEndX = width - 45;
  const tipLenRight = 16;

  rightLayouts.forEach((layout) => {
    const { item, y, thick } = layout;

    const rPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    rPath.setAttribute('d', `
      M ${rightStartX} ${y.toFixed(1)}
      L ${rightEndX} ${y.toFixed(1)}
      L ${(rightEndX + tipLenRight).toFixed(1)} ${(y + thick / 2).toFixed(1)}
      L ${rightEndX} ${(y + thick).toFixed(1)}
      L ${rightStartX} ${(y + thick).toFixed(1)}
      Z
    `);
    rPath.setAttribute('fill', item.color);
    svg.appendChild(rPath);

    // 帯内ラベル
    const pctStr = item.percent || (parsePct(item) + '%');
    const fsName = Math.min(13, Math.max(10, thick * 0.35 + 3));
    const fsPct = Math.min(16, Math.max(11, thick * 0.4 + 4));

    const rTxtG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    rTxtG.innerHTML = `
      <text x="${rightStartX + 16}" y="${(y + thick / 2 + fsName * 0.35).toFixed(1)}" font-size="${fsName.toFixed(1)}" font-weight="700" fill="#ffffff" font-family="sans-serif">${item.name}</text>
      <text x="${rightEndX - 10}" y="${(y + thick / 2 + fsPct * 0.38).toFixed(1)}" font-size="${fsPct.toFixed(1)}" font-weight="800" fill="#ffffff" text-anchor="end" font-family="sans-serif">${pctStr}</text>
    `;
    svg.appendChild(rTxtG);
  });

  container.innerHTML = '';
  container.appendChild(svg);
  if (labelText) {
    const lbl = document.createElement('div');
    lbl.className = 'chem-structure-label';
    lbl.textContent = labelText;
    container.appendChild(lbl);
  }
}

// ==========================================
// 3. ファネル収束＆再分岐レンダラー (type: funnel)
// ==========================================
function drawFunnelSankeySvg(data, container, labelText) {
  const { title, dedicatedItems } = data;

  const inItems = dedicatedItems.filter((d) => d.role === 'in' || d.role === 'expense');
  const actItem = dedicatedItems.find((d) => d.role === 'activity') || { name: '製品製造・組立活動 (Activity)', value: 35 };
  const outItems = dedicatedItems.filter((d) => d.role === 'out' || d.role === 'product');

  const defaultIn = [
    { name: '材料費 (Cost 1)', value: 10, color: '#0284c7' },
    { name: '直接労務費 (Cost 2)', value: 7.5, color: '#eab308' },
    { name: '設備減価償却 (Cost 3)', value: 5, color: '#f97316' },
    { name: '外注加工費 (Cost 4)', value: 4.5, color: '#10b981' },
    { name: '研究開発配賦 (Cost 5)', value: 8, color: '#06b6d4' }
  ];
  const defaultOut = [
    { name: '主力製品 A (Product 1)', value: 20, color: '#0f766e' },
    { name: '量産製品 B (Product 2)', value: 15, color: '#334155' }
  ];

  const finalIn = inItems.length > 0 ? inItems : defaultIn;
  const finalOut = outItems.length > 0 ? outItems : defaultOut;

  const width = 760;
  const height = 400;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.style.maxWidth = `${width}px`;
  svg.style.display = 'block';
  svg.style.margin = '0 auto';

  // 背景
  const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  bg.setAttribute('width', width);
  bg.setAttribute('height', height);
  bg.setAttribute('fill', '#ffffff');
  bg.setAttribute('rx', '8');
  svg.appendChild(bg);

  // タイトル
  if (title) {
    const tEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    tEl.setAttribute('x', width / 2);
    tEl.setAttribute('y', 28);
    tEl.setAttribute('text-anchor', 'middle');
    tEl.setAttribute('font-size', '16');
    tEl.setAttribute('font-weight', '700');
    tEl.setAttribute('fill', '#1e293b');
    tEl.setAttribute('font-family', 'sans-serif');
    tEl.textContent = title;
    svg.appendChild(tEl);
  }

  // カラム境界＆ヘッダー
  const col1X = 220;
  const col2X = 440;

  const hG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  hG.innerHTML = `
    <line x1="${col1X}" y1="50" x2="${col1X}" y2="350" stroke="#f1f5f9" stroke-width="1.5" />
    <line x1="${col2X}" y1="50" x2="${col2X}" y2="350" stroke="#f1f5f9" stroke-width="1.5" />
    <text x="110" y="375" text-anchor="middle" font-size="12" font-weight="700" fill="#64748b" font-family="sans-serif">EXPENSE (原価要素)</text>
    <text x="330" y="375" text-anchor="middle" font-size="12" font-weight="700" fill="#64748b" font-family="sans-serif">ACTIVITY (活動集約)</text>
    <text x="560" y="375" text-anchor="middle" font-size="12" font-weight="700" fill="#64748b" font-family="sans-serif">PRODUCT (製品配賦)</text>
  `;
  svg.appendChild(hG);

  // 1. 左側入力バー群と中央への収束ベジェ
  const inStartY = 75;
  const inSpacing = 36;
  const centerH = 110;
  const centerY = 145;

  finalIn.forEach((item, i) => {
    const y = inStartY + i * inSpacing;
    const barH = 10;
    const endThick = centerH / finalIn.length;
    const destY = centerY + i * endThick;

    // 左バー
    const lineP = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    lineP.setAttribute('d', `
      M 30 ${y}
      L 140 ${y}
      C 180 ${y}, 210 ${destY}, 280 ${destY}
      L 280 ${destY + endThick}
      C 210 ${destY + endThick}, 180 ${y + barH}, 140 ${y + barH}
      L 30 ${y + barH}
      Z
    `);
    lineP.setAttribute('fill', item.color);
    lineP.setAttribute('opacity', '0.9');
    svg.appendChild(lineP);

    // テキスト
    const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    t.setAttribute('x', 30);
    t.setAttribute('y', y - 4);
    t.setAttribute('font-size', '11');
    t.setAttribute('font-weight', '600');
    t.setAttribute('fill', '#334155');
    t.setAttribute('font-family', 'sans-serif');
    t.textContent = `${item.name}: ${item.value}`;
    svg.appendChild(t);
  });

  // 2. 中央活動ブロック
  const actBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  actBg.setAttribute('x', 280);
  actBg.setAttribute('y', centerY);
  actBg.setAttribute('width', 100);
  actBg.setAttribute('height', centerH);
  actBg.setAttribute('fill', '#334155');
  actBg.setAttribute('rx', '4');
  svg.appendChild(actBg);

  const actTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  actTxt.setAttribute('x', 330);
  actTxt.setAttribute('y', centerY + centerH / 2 + 5);
  actTxt.setAttribute('text-anchor', 'middle');
  actTxt.setAttribute('font-size', '13');
  actTxt.setAttribute('font-weight', '700');
  actTxt.setAttribute('fill', '#ffffff');
  actTxt.setAttribute('font-family', 'sans-serif');
  actTxt.textContent = '35.0';
  svg.appendChild(actTxt);

  // 3. 右側製品への再分岐矢印
  finalOut.forEach((out, j) => {
    const outStartY = centerY + j * (centerH / 2);
    const outEndThick = centerH / 2;
    const destY = centerY + (j === 0 ? -30 : 60);
    const arrowX = 640;

    const outPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    outPath.setAttribute('d', `
      M 380 ${outStartY}
      C 440 ${outStartY}, 470 ${destY}, 520 ${destY}
      L ${arrowX} ${destY}
      L ${arrowX} ${destY - 10}
      L ${arrowX + 28} ${destY + outEndThick / 2}
      L ${arrowX} ${destY + outEndThick + 10}
      L ${arrowX} ${destY + outEndThick}
      L 520 ${destY + outEndThick}
      C 470 ${destY + outEndThick}, 440 ${outStartY + outEndThick}, 380 ${outStartY + outEndThick}
      Z
    `);
    outPath.setAttribute('fill', out.color);
    svg.appendChild(outPath);

    // テキスト
    const oTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    oTxt.setAttribute('x', arrowX + 36);
    oTxt.setAttribute('y', destY + outEndThick / 2 + 5);
    oTxt.setAttribute('font-size', '12');
    oTxt.setAttribute('font-weight', '700');
    oTxt.setAttribute('fill', out.color);
    oTxt.setAttribute('font-family', 'sans-serif');
    oTxt.textContent = `${out.name} (${out.value})`;
    svg.appendChild(oTxt);
  });

  container.innerHTML = '';
  container.appendChild(svg);
  if (labelText) {
    const lbl = document.createElement('div');
    lbl.className = 'chem-structure-label';
    lbl.textContent = labelText;
    container.appendChild(lbl);
  }
}

function getApproxSankeyTextWidth(str) {
  if (!str) return 0;
  let w = 0;
  for (let i = 0; i < str.length; i++) {
    w += str.charCodeAt(i) > 255 ? 12 : 7.2;
  }
  return w;
}

function formatSankeyNodeLabel(n, nodeDisplayValue, nodeMeta) {
  const meta = nodeMeta[n] || {};
  const val = nodeDisplayValue[n];
  const formattedVal = typeof val === 'number' ? val.toLocaleString() : String(val || '');
  const percentStr = meta.percent || '';

  // ノード名にすでに金額・数値表記（例: (1,200億円)、（25億円）等）が含まれている場合は二重付加を抑制
  const alreadyHasValue = /[（\(][\d,▲\-\+]+.*?[）\)]/.test(n);
  const valStr = (!alreadyHasValue && formattedVal) ? `(${formattedVal})` : '';
  const pctStr = percentStr ? `[${percentStr}]` : '';

  return [n, valStr, pctStr].filter(Boolean).join(' ');
}

// ==========================================
// 4. 標準多段ネットワーク＆Alluvialレンダラー (type: standard)
// ==========================================
function drawStandardSankeySvg(data, container, labelText) {
  const { title, subtitle, note, stageHeaders, links, nodes, nodeMeta } = data;

  if (links.length === 0 || nodes.length === 0) {
    container.innerHTML = '<span style="color:#ef4444; font-size:12px;">サンキー図の構文を解析できませんでした（例: \\sankey{ 投入熱量 [100] -> 有効仕事 [40]; 投入熱量 -> 排熱 [60]; }）</span>';
    return;
  }

  // 1. 各ノードの流入・流出集計
  const inSum = {};
  const outSum = {};
  const inRawSum = {};
  const outRawSum = {};
  nodes.forEach((n) => {
    inSum[n] = 0;
    outSum[n] = 0;
    inRawSum[n] = 0;
    outRawSum[n] = 0;
  });

  links.forEach((l) => {
    const absVal = Math.max(0.1, Math.abs(l.value));
    outSum[l.source] = (outSum[l.source] || 0) + absVal;
    inSum[l.target] = (inSum[l.target] || 0) + absVal;
    outRawSum[l.source] = (outRawSum[l.source] || 0) + l.value;
    inRawSum[l.target] = (inRawSum[l.target] || 0) + l.value;
  });

  const nodeFlowValue = {};
  const nodeDisplayValue = {};

  nodes.forEach((n) => {
    nodeFlowValue[n] = Math.max(inSum[n], outSum[n]);
    if (nodeFlowValue[n] <= 0) nodeFlowValue[n] = 1;

    if (nodeMeta[n] && nodeMeta[n].value !== null && nodeMeta[n].value !== undefined) {
      nodeDisplayValue[n] = nodeMeta[n].value;
    } else if (inSum[n] > 0 && outSum[n] === 0) {
      nodeDisplayValue[n] = inRawSum[n];
    } else if (outSum[n] > 0 && inSum[n] === 0) {
      nodeDisplayValue[n] = outRawSum[n];
    } else {
      nodeDisplayValue[n] = Math.abs(outRawSum[n]) >= Math.abs(inRawSum[n]) ? outRawSum[n] : inRawSum[n];
    }
  });

  // 2. ステージ（深さ）計算
  const stages = {};
  nodes.forEach((n) => {
    if (inSum[n] === 0) stages[n] = 0;
  });
  if (Object.keys(stages).length === 0) {
    stages[links[0].source] = 0;
  }

  for (let iter = 0; iter < nodes.length; iter++) {
    let changed = false;
    links.forEach((l) => {
      const srcStage = stages[l.source] !== undefined ? stages[l.source] : 0;
      const expectedTgtStage = srcStage + 1;
      if (stages[l.target] === undefined || stages[l.target] < expectedTgtStage) {
        stages[l.target] = expectedTgtStage;
        changed = true;
      }
    });
    if (!changed) break;
  }

  nodes.forEach((n) => {
    if (stages[n] === undefined) stages[n] = 0;
  });

  const maxStage = Math.max(1, ...Object.values(stages));
  const stageGroups = [];
  for (let s = 0; s <= maxStage; s++) {
    stageGroups[s] = [];
  }
  nodes.forEach((n) => {
    stageGroups[stages[n]].push(n);
  });

  // 3. カラーパレットとノード色決定
  const defaultPalette = [
    '#0284c7', '#0d9488', '#10b981', '#f59e0b', '#ef4444',
    '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6', '#f97316',
    '#3b82f6', '#84cc16'
  ];
  const nodeColors = {};
  nodes.forEach((n, idx) => {
    if (nodeMeta[n] && nodeMeta[n].color) {
      nodeColors[n] = nodeMeta[n].color;
    } else if (/負債|借入|債務|損失|ロス|排熱|マイナス|その他株主資本/i.test(n)) {
      nodeColors[n] = '#ef4444';
    } else if (/利益|剰余金|純利益|資産|有効|仕事|発電|回収/i.test(n)) {
      nodeColors[n] = /資産/i.test(n) ? '#1e293b' : '#10b981';
    } else {
      nodeColors[n] = defaultPalette[idx % defaultPalette.length];
    }
  });

  // 4. SVG レイアウト寸法計算（左右端のテキスト文字幅に応じた動的余白）
  let maxLeftTextW = 0;
  (stageGroups[0] || []).forEach((n) => {
    const lbl = formatSankeyNodeLabel(n, nodeDisplayValue, nodeMeta);
    const w = getApproxSankeyTextWidth(lbl);
    if (w > maxLeftTextW) maxLeftTextW = w;
  });
  const padXLeft = Math.max(140, Math.ceil(maxLeftTextW) + 24);

  let maxRightTextW = 0;
  (stageGroups[maxStage] || []).forEach((n) => {
    const lbl = formatSankeyNodeLabel(n, nodeDisplayValue, nodeMeta);
    const w = getApproxSankeyTextWidth(lbl);
    if (w > maxRightTextW) maxRightTextW = w;
  });
  const padXRight = Math.max(140, Math.ceil(maxRightTextW) + 24);

  const hasHeader = Boolean(title || subtitle);
  const padTop = hasHeader ? (stageHeaders.length > 0 ? 88 : 64) : (stageHeaders.length > 0 ? 60 : 36);
  const padBottom = note ? 36 : 28;
  const stageWidth = Math.max(180, Math.min(240, 960 / Math.max(maxStage, 1)));
  const svgWidth = Math.max(860, maxStage * stageWidth + padXLeft + padXRight);

  const nodeWidth = 14;
  const nodeGap = 20;

  let maxStageFlowSum = 0;
  stageGroups.forEach((group) => {
    const sum = group.reduce((acc, n) => acc + nodeFlowValue[n], 0);
    if (sum > maxStageFlowSum) maxStageFlowSum = sum;
  });
  if (maxStageFlowSum <= 0) maxStageFlowSum = 100;

  const maxNodesInStage = Math.max(...stageGroups.map((g) => g.length), 1);
  const baseUsableHeight = 280;
  const svgHeight = Math.max(340, baseUsableHeight + (maxNodesInStage - 1) * nodeGap + padTop + padBottom);
  const usableH = svgHeight - padTop - padBottom;
  const flowScale = Math.max(0.005, (usableH - (maxNodesInStage - 1) * nodeGap) / maxStageFlowSum);

  const nodeGeom = {};
  stageGroups.forEach((group, s) => {
    const groupTotalH = group.reduce((acc, n) => acc + Math.max(8, nodeFlowValue[n] * flowScale), 0) + (group.length - 1) * nodeGap;
    let currY = padTop + Math.max(0, (usableH - groupTotalH) / 2);
    const currX = padXLeft + (s / maxStage) * (svgWidth - padXLeft - padXRight - nodeWidth);

    group.forEach((n) => {
      const nh = Math.max(8, nodeFlowValue[n] * flowScale);
      nodeGeom[n] = {
        x: currX,
        y: currY,
        w: nodeWidth,
        h: nh,
        stage: s
      };
      currY += nh + nodeGap;
    });
  });

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.style.maxWidth = `${svgWidth}px`;
  svg.style.display = 'block';
  svg.style.margin = '0 auto';

  // 背景
  const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  bg.setAttribute('width', svgWidth);
  bg.setAttribute('height', svgHeight);
  bg.setAttribute('fill', '#ffffff');
  bg.setAttribute('rx', '8');
  svg.appendChild(bg);

  // タイトル
  if (title) {
    const titleEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    titleEl.setAttribute('x', (svgWidth / 2).toFixed(1));
    titleEl.setAttribute('y', '26');
    titleEl.setAttribute('text-anchor', 'middle');
    titleEl.setAttribute('font-size', '15');
    titleEl.setAttribute('font-weight', '700');
    titleEl.setAttribute('fill', '#1e293b');
    titleEl.setAttribute('font-family', 'sans-serif');
    titleEl.textContent = title;
    svg.appendChild(titleEl);
  }

  // ステージ列ヘッダー（Alluvial型ピル見出し）
  if (stageHeaders.length > 0) {
    const stageHeaderG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    stageHeaders.forEach((hdr, sIdx) => {
      if (sIdx <= maxStage) {
        const xCenter = padXLeft + (sIdx / maxStage) * (svgWidth - padXLeft - padXRight - nodeWidth) + nodeWidth / 2;
        const pillW = Math.max(hdr.length * 11 + 24, 75);
        const pillH = 22;
        const pillY = padTop - 34;

        const pill = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        pill.setAttribute('x', xCenter - pillW / 2);
        pill.setAttribute('y', pillY);
        pill.setAttribute('width', pillW);
        pill.setAttribute('height', pillH);
        pill.setAttribute('rx', '11');
        pill.setAttribute('fill', '#f1f5f9');
        pill.setAttribute('stroke', '#cbd5e1');
        pill.setAttribute('stroke-width', '1');
        stageHeaderG.appendChild(pill);

        const hTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        hTxt.setAttribute('x', xCenter);
        hTxt.setAttribute('y', pillY + 15);
        hTxt.setAttribute('text-anchor', 'middle');
        hTxt.setAttribute('font-size', '11');
        hTxt.setAttribute('font-weight', '700');
        hTxt.setAttribute('fill', '#475569');
        hTxt.setAttribute('font-family', 'sans-serif');
        hTxt.textContent = hdr;
        stageHeaderG.appendChild(hTxt);
      }
    });
    svg.appendChild(stageHeaderG);
  }

  // リンク（ベジェ曲線帯）描画
  const linksG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const srcYOffsets = {};
  const tgtYOffsets = {};
  nodes.forEach((n) => {
    srcYOffsets[n] = 0;
    tgtYOffsets[n] = 0;
  });

  links.forEach((l) => {
    const sGeom = nodeGeom[l.source];
    const tGeom = nodeGeom[l.target];
    if (!sGeom || !tGeom) return;

    const absVal = Math.max(0.1, Math.abs(l.value));
    const linkH = Math.max(2, absVal * flowScale);

    const sy0 = sGeom.y + srcYOffsets[l.source];
    const sy1 = sy0 + linkH;
    srcYOffsets[l.source] += linkH;

    const ty0 = tGeom.y + tgtYOffsets[l.target];
    const ty1 = ty0 + linkH;
    tgtYOffsets[l.target] += linkH;

    const sx = sGeom.x + sGeom.w;
    const tx = tGeom.x;
    const dx = tx - sx;
    const c1x = sx + dx * 0.5;
    const c2x = sx + dx * 0.5;

    const pathData = `M ${sx} ${sy0} C ${c1x} ${sy0}, ${c2x} ${ty0}, ${tx} ${ty0} L ${tx} ${ty1} C ${c2x} ${ty1}, ${c1x} ${sy1}, ${sx} ${sy1} Z`;

    const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pathEl.setAttribute('d', pathData);
    pathEl.setAttribute('fill', l.color || nodeColors[l.source]);
    pathEl.setAttribute('fill-opacity', '0.45');
    pathEl.setAttribute('stroke', l.color || nodeColors[l.source]);
    pathEl.setAttribute('stroke-opacity', '0.6');
    pathEl.setAttribute('stroke-width', '0.8');

    const titleEl = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    titleEl.textContent = `${l.source} → ${l.target}: ${l.value.toLocaleString()}${l.percent ? ` (${l.percent})` : ''}`;
    pathEl.appendChild(titleEl);

    linksG.appendChild(pathEl);
  });
  svg.appendChild(linksG);

  // ノード（縦バー＆テキスト）描画
  const nodesG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  nodes.forEach((n) => {
    const geom = nodeGeom[n];
    if (!geom) return;

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', geom.x);
    rect.setAttribute('y', geom.y);
    rect.setAttribute('width', geom.w);
    rect.setAttribute('height', geom.h);
    rect.setAttribute('fill', nodeColors[n]);
    rect.setAttribute('rx', '2');
    nodesG.appendChild(rect);

    // テキスト
    const meta = nodeMeta[n] || {};
    const side = meta.side || (geom.stage === 0 ? 'left' : geom.stage === maxStage ? 'right' : 'right');
    const val = nodeDisplayValue[n];
    const formattedVal = typeof val === 'number' ? val.toLocaleString() : String(val || '');
    const percentStr = meta.percent || '';

    const textG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const labelX = side === 'left' ? geom.x - 8 : geom.x + geom.w + 8;
    const anchor = side === 'left' ? 'end' : 'start';

    const labelTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    labelTxt.setAttribute('x', labelX);
    labelTxt.setAttribute('y', geom.y + geom.h / 2 + 4);
    labelTxt.setAttribute('text-anchor', anchor);
    labelTxt.setAttribute('font-size', '12');
    labelTxt.setAttribute('font-weight', '700');
    labelTxt.setAttribute('fill', '#1e293b');
    labelTxt.setAttribute('font-family', 'sans-serif');
    labelTxt.textContent = formatSankeyNodeLabel(n, nodeDisplayValue, nodeMeta);
    textG.appendChild(labelTxt);

    nodesG.appendChild(textG);
  });
  svg.appendChild(nodesG);

  container.innerHTML = '';
  container.appendChild(svg);
  if (labelText) {
    const lbl = document.createElement('div');
    lbl.className = 'chem-structure-label';
    lbl.textContent = labelText;
    container.appendChild(lbl);
  }
}

// メイン描画エントリーポイント
function drawSankeySvg(sankeyText, container, labelText) {
  const data = parseSankeyDiagram(sankeyText);
  if (!data) return;

  switch (data.type) {
    case 'energy':
      drawEnergySankeySvg(data, container, labelText);
      break;
    case 'breakout':
      drawBreakoutSankeySvg(data, container, labelText);
      break;
    case 'funnel':
    case 'costflow':
      drawFunnelSankeySvg(data, container, labelText);
      break;
    default:
      drawStandardSankeySvg(data, container, labelText);
      break;
  }
}
