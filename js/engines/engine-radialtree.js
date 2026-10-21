// ==========================================
// 放射状ツリー図（同心円状ラディアルツリー図）パーサー & SVG描画エンジン
// ==========================================

function getRadialTextWidth(str) {
  if (!str) return 0;
  let w = 0;
  for (let i = 0; i < str.length; i++) {
    w += str.charCodeAt(i) > 255 ? 14 : 8;
  }
  return w;
}

function escapeRadialHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// 放射状ツリーのカラーパレット（セグメント用自動割り当て）
const RADIAL_PALETTES = [
  { stroke: '#0284c7', bg: '#f0f9ff', tagBg: '#e0f2fe', tagText: '#0369a1', line: '#38bdf8' }, // 水色・通信
  { stroke: '#e11d48', bg: '#fff1f2', tagBg: '#ffe4e6', tagText: '#be123c', line: '#fb7185' }, // 赤・ドコモ系
  { stroke: '#2563eb', bg: '#eff6ff', tagBg: '#dbeafe', tagText: '#1d4ed8', line: '#60a5fa' }, // 青・データ系
  { stroke: '#059669', bg: '#ecfdf5', tagBg: '#d1fae5', tagText: '#047857', line: '#34d399' }, // 緑・都市開発系
  { stroke: '#d97706', bg: '#fffbeb', tagBg: '#fef3c7', tagText: '#b45309', line: '#fbbf24' }, // 橙・エネルギー系
  { stroke: '#7c3aed', bg: '#f5f3ff', tagBg: '#ede9fe', tagText: '#6d28d9', line: '#a78bfa' }, // 紫
  { stroke: '#0891b2', bg: '#ecfeff', tagBg: '#cffafe', tagText: '#0e7490', line: '#22d3ee' }, // シアン
  { stroke: '#4f46e5', bg: '#eef2ff', tagBg: '#e0e7ff', tagText: '#4338ca', line: '#818cf8' }, // インディゴ
];

/**
 * \radialtree{ ... } 構文のパース
 */
function parseRadialTree(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;
  let text = rawText.trim();

  // \radialtree{...} または \radial{...} のラッパーを解除
  const wrapperMatch = text.match(/^\\(?:radialtree|radial)\{([\s\S]*)\}$/i);
  if (wrapperMatch) {
    text = wrapperMatch[1].trim();
  }

  let title = '';
  let specifiedCenter = null;
  const nodeDefs = new Map(); // name -> { label, tag, color, note }
  const rawEdges = []; // { from, to, ratio, tag, color }

  // 行ごとにパース（セミコロンまたは改行区切り）
  const lines = text.split(/[\n;]+/).map((l) => l.trim()).filter(Boolean);

  lines.forEach((line) => {
    // タイトル行: title: "..."
    const titleMatch = line.match(/^title\s*:\s*["']?([^"']+)["']?$/i);
    if (titleMatch) {
      title = titleMatch[1].trim();
      return;
    }

    // センター指定行: center: "..." [tag, color]
    const centerMatch = line.match(/^center\s*:\s*["']?([^"'\(\[\{]+?)["']?(?:\s*\[(.*?)\])?$/i);
    if (centerMatch) {
      specifiedCenter = centerMatch[1].trim();
      if (centerMatch[2]) {
        const parts = centerMatch[2].split(',').map((p) => p.trim());
        const tag = parts[0] || '';
        const color = parts[1] || '';
        nodeDefs.set(specifiedCenter, { name: specifiedCenter, tag, color });
      }
      return;
    }

    // ノード個別定義: node "名前" [tag, color]
    const nodeMatch = line.match(/^node\s+["']?([^"'\(\[\{]+?)["']?(?:\s*\[(.*?)\])?$/i);
    if (nodeMatch) {
      const name = nodeMatch[1].trim();
      let tag = '';
      let color = '';
      if (nodeMatch[2]) {
        const parts = nodeMatch[2].split(',').map((p) => p.trim());
        tag = parts[0] || '';
        color = parts[1] || '';
      }
      nodeDefs.set(name, { name, tag, color });
      return;
    }

    // エッジ関係式: "親" -> "子" [比率, 区分, 色]
    const edgeMatch = line.match(/^["']?([^"'\->]+?)["']?\s*->\s*["']?([^"'\[]+?)["']?(?:\s*\[(.*?)\])?$/);
    if (edgeMatch) {
      const from = edgeMatch[1].trim();
      const to = edgeMatch[2].trim();
      let ratio = '';
      let tag = '';
      let color = '';
      if (edgeMatch[3]) {
        const parts = edgeMatch[3].split(',').map((p) => p.trim());
        ratio = parts[0] || '';
        tag = parts[1] || '';
        color = parts[2] || '';
      }
      rawEdges.push({ from, to, ratio, tag, color });
    }
  });

  if (rawEdges.length === 0 && !specifiedCenter) {
    return null;
  }

  // 全ノードの抽出
  const nodeMap = new Map(); // id -> nodeObj
  function getOrCreateNode(name) {
    if (!nodeMap.has(name)) {
      const def = nodeDefs.get(name) || {};
      nodeMap.set(name, {
        id: name,
        name: name,
        tag: def.tag || '',
        color: def.color || '',
        parents: [],
        children: [],
        depth: 0,
        weight: 1,
        angleStart: 0,
        angleEnd: 0,
        angle: 0,
        r: 0,
        x: 0,
        y: 0,
        palette: null,
      });
    }
    return nodeMap.get(name);
  }

  rawEdges.forEach((e) => {
    const p = getOrCreateNode(e.from);
    const c = getOrCreateNode(e.to);
    p.children.push({ node: c, edge: e });
    c.parents.push({ node: p, edge: e });
  });

  // 中心（ルート）の特定
  let centerNode = null;
  if (specifiedCenter && nodeMap.has(specifiedCenter)) {
    centerNode = nodeMap.get(specifiedCenter);
  } else {
    // 親を持たないノードを中心とする
    for (const n of nodeMap.values()) {
      if (n.parents.length === 0) {
        centerNode = n;
        break;
      }
    }
    if (!centerNode && nodeMap.size > 0) {
      centerNode = nodeMap.values().next().value;
    }
  }

  if (!centerNode) return null;

  // BFSで各ノードのDepth（深度）を決定
  const queue = [{ node: centerNode, depth: 0 }];
  const visited = new Set([centerNode.id]);
  centerNode.depth = 0;

  while (queue.length > 0) {
    const cur = queue.shift();
    cur.node.depth = cur.depth;

    cur.node.children.forEach((childItem) => {
      const ch = childItem.node;
      if (!visited.has(ch.id)) {
        visited.add(ch.id);
        queue.push({ node: ch, depth: cur.depth + 1 });
      }
    });
  }

  // 最大深度の取得
  let maxDepth = 0;
  nodeMap.forEach((n) => {
    if (n.depth > maxDepth) maxDepth = n.depth;
  });

  // サブツリーの重み（葉ノード数に応じた角度占有幅）を再帰計算
  function calcWeight(node) {
    // 自分より深い子供のみを対象
    const validChildren = node.children.filter((ch) => ch.node.depth === node.depth + 1);
    if (validChildren.length === 0) {
      node.weight = 1;
      return 1;
    }
    let sum = 0;
    validChildren.forEach((ch) => {
      sum += calcWeight(ch.node);
    });
    node.weight = Math.max(sum, 1);
    return node.weight;
  }
  calcWeight(centerNode);

  // パレットの割り当て（Depth 1 のブランチごとに固有カラー）
  const depth1Children = centerNode.children.filter((ch) => ch.node.depth === 1);
  depth1Children.forEach((ch, idx) => {
    const pal = RADIAL_PALETTES[idx % RADIAL_PALETTES.length];
    function assignPalette(node) {
      node.palette = pal;
      node.children.forEach((c) => {
        if (c.node.depth === node.depth + 1) {
          assignPalette(c.node);
        }
      });
    }
    assignPalette(ch.node);
  });

  // 半径 R の設定
  // Depth 0: 0
  // Depth 1: 245px
  // Depth 2: 490px
  // Depth 3: 700px
  const baseRStep = maxDepth <= 1 ? 260 : (maxDepth === 2 ? 245 : 210);
  nodeMap.forEach((n) => {
    n.r = n.depth * baseRStep;
  });

  // 角度（セクター）の割り当て
  // 上部（-90度 = -PI/2）から時計回りに配分
  const startAngleOffset = -Math.PI / 2;
  centerNode.angleStart = startAngleOffset;
  centerNode.angleEnd = startAngleOffset + 2 * Math.PI;
  centerNode.angle = 0;

  function layoutAngles(node, aStart, aEnd) {
    const validChildren = node.children.filter((ch) => ch.node.depth === node.depth + 1);
    if (validChildren.length === 0) return;

    const totalWeight = node.weight;
    let currentAngle = aStart;
    const span = aEnd - aStart;

    validChildren.forEach((ch) => {
      const childWeight = ch.node.weight;
      const childSpan = span * (childWeight / totalWeight);
      const chStart = currentAngle;
      const chEnd = currentAngle + childSpan;
      ch.node.angleStart = chStart;
      ch.node.angleEnd = chEnd;
      ch.node.angle = (chStart + chEnd) / 2;

      layoutAngles(ch.node, chStart, chEnd);
      currentAngle += childSpan;
    });
  }

  layoutAngles(centerNode, startAngleOffset, startAngleOffset + 2 * Math.PI);

  // 全体キャンバス寸法（半径 + カード幅マージン）
  const outerR = maxDepth * baseRStep;
  const padding = 150;
  const totalW = Math.max(Math.round((outerR + padding) * 2), 760);
  const totalH = Math.max(Math.round((outerR + padding) * 2) + 60, 820); // タイトル分の高さ追加
  const cx = totalW / 2;
  const cy = (totalH + 40) / 2; // タイトルの下側にセンタリング

  // 極座標から直交座標 (x, y) へ変換
  nodeMap.forEach((n) => {
    if (n.depth === 0) {
      n.x = cx;
      n.y = cy;
    } else {
      n.x = cx + n.r * Math.cos(n.angle);
      n.y = cy + n.r * Math.sin(n.angle);
    }
  });

  return {
    title,
    centerNode,
    nodes: Array.from(nodeMap.values()),
    edges: rawEdges,
    totalW,
    totalH,
    cx,
    cy,
    maxDepth,
    baseRStep,
  };
}

/**
 * 放射状ツリー図のSVG描画
 */
function drawRadialTreeSvg(code, container, labelText) {
  container.innerHTML = '';
  const parsed = parseRadialTree(code);
  if (!parsed) {
    const err = document.createElement('div');
    err.className = 'chem-render-error';
    err.textContent = '放射状ツリー図の構文エラー: ノードや関係性（例: "日本電信電話" -> "NTTドコモ" [100%, 総合ICT];）が必要です。';
    container.appendChild(err);
    return;
  }

  const { title, centerNode, nodes, edges, totalW, totalH, cx, cy, maxDepth, baseRStep } = parsed;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${totalW} ${totalH}`);
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.setAttribute('class', 'radialtree-svg');
  svg.style.maxWidth = `${totalW}px`;
  svg.style.margin = '0 auto';
  svg.style.display = 'block';
  svg.style.background = '#ffffff';
  svg.style.borderRadius = '12px';
  svg.style.overflow = 'hidden';

  // 定義部（グラデーション・ドロップシャドウ）
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  defs.innerHTML = `
    <filter id="rt-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#0f172a" flood-opacity="0.08" />
    </filter>
    <filter id="rt-shadow-center" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="5" stdDeviation="6" flood-color="#002b49" flood-opacity="0.22" />
    </filter>
    <linearGradient id="rt-center-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#005bac" />
      <stop offset="100%" stop-color="#002d5a" />
    </linearGradient>
  `;
  svg.appendChild(defs);

  // タイトル描画
  if (title) {
    const titleG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const titleText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    titleText.setAttribute('x', totalW / 2);
    titleText.setAttribute('y', '38');
    titleText.setAttribute('text-anchor', 'middle');
    titleText.setAttribute('font-size', '19');
    titleText.setAttribute('font-weight', '800');
    titleText.setAttribute('fill', '#0f172a');
    titleText.setAttribute('font-family', 'system-ui, -apple-system, sans-serif');
    titleText.textContent = title;
    titleG.appendChild(titleText);

    // タイトル下サブガイド線
    const titleLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    titleLine.setAttribute('x1', totalW / 2 - 140);
    titleLine.setAttribute('y1', '50');
    titleLine.setAttribute('x2', totalW / 2 + 140);
    titleLine.setAttribute('y2', '50');
    titleLine.setAttribute('stroke', '#e2e8f0');
    titleLine.setAttribute('stroke-width', '2');
    titleLine.setAttribute('stroke-linecap', 'round');
    titleG.appendChild(titleLine);

    svg.appendChild(titleG);
  }

  // 背景の同心円ガイド線
  const guideG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  guideG.setAttribute('class', 'radial-guides');
  for (let d = 1; d <= maxDepth; d++) {
    const r = d * baseRStep;
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', cx);
    circle.setAttribute('cy', cy);
    circle.setAttribute('r', r);
    circle.setAttribute('fill', 'none');
    circle.setAttribute('stroke', '#e2e8f0');
    circle.setAttribute('stroke-width', '1.5');
    circle.setAttribute('stroke-dasharray', '5 5');
    guideG.appendChild(circle);
  }

  // 階層の凡例（右上余白に配置し、ノードカードとの重複を根絶）
  const legendG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  legendG.setAttribute('class', 'radial-legend');
  const legW = 210;
  const legH = 28 + maxDepth * 22;
  const legX = totalW - legW - 24;
  const legY = 24;

  const legBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  legBg.setAttribute('x', legX);
  legBg.setAttribute('y', legY);
  legBg.setAttribute('width', legW);
  legBg.setAttribute('height', legH);
  legBg.setAttribute('rx', '8');
  legBg.setAttribute('fill', '#f8fafc');
  legBg.setAttribute('stroke', '#e2e8f0');
  legBg.setAttribute('stroke-width', '1');
  legendG.appendChild(legBg);

  const legTitle = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  legTitle.setAttribute('x', legX + 12);
  legTitle.setAttribute('y', legY + 18);
  legTitle.setAttribute('font-size', '11');
  legTitle.setAttribute('font-weight', '700');
  legTitle.setAttribute('fill', '#475569');
  legTitle.setAttribute('font-family', 'sans-serif');
  legTitle.textContent = '【同心円ガイド】';
  legendG.appendChild(legTitle);

  for (let d = 1; d <= maxDepth; d++) {
    const rowY = legY + 20 + d * 21;
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('cx', legX + 20);
    dot.setAttribute('cy', rowY - 3.5);
    dot.setAttribute('r', '4');
    dot.setAttribute('fill', '#94a3b8');
    legendG.appendChild(dot);

    const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    txt.setAttribute('x', legX + 30);
    txt.setAttribute('y', rowY);
    txt.setAttribute('font-size', '10.5');
    txt.setAttribute('font-weight', '600');
    txt.setAttribute('fill', '#64748b');
    txt.setAttribute('font-family', 'sans-serif');
    txt.textContent = d === 1 ? '第1層: 主要事業会社' : (d === 2 ? '第2層: 傘下グループ会社' : `第${d}層`);
    legendG.appendChild(txt);
  }
  guideG.appendChild(legendG);
  svg.appendChild(guideG);

  // コネクタ線（放射ベジエ曲線）描画
  const edgeG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  edgeG.setAttribute('class', 'radial-edges');

  // 比率バッジグループ（コネクタの上に載せる）
  const badgeG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  badgeG.setAttribute('class', 'radial-badges');

  nodes.forEach((node) => {
    // 親からこのノードへのエッジ
    node.parents.forEach((pItem) => {
      const pNode = pItem.node;
      const edge = pItem.edge;

      let lineColor = node.palette ? node.palette.line : '#94a3b8';
      if (edge.color) lineColor = edge.color;

      // ベジエ曲線の制御点（同心円状のカーブを描く）
      const midR = (pNode.r + node.r) / 2;
      let pathD = '';

      if (pNode.depth === 0) {
        // 中心からの放射直線・緩やかなカーブ
        const cpX = cx + (node.r * 0.45) * Math.cos(node.angle);
        const cpY = cy + (node.r * 0.45) * Math.sin(node.angle);
        pathD = `M ${cx} ${cy} Q ${cpX} ${cpY} ${node.x} ${node.y}`;
      } else {
        // 同心円状の滑らかな3次ベジエ曲線
        const cp1X = cx + midR * Math.cos(pNode.angle);
        const cp1Y = cy + midR * Math.sin(pNode.angle);
        const cp2X = cx + midR * Math.cos(node.angle);
        const cp2Y = cy + midR * Math.sin(node.angle);
        pathD = `M ${pNode.x} ${pNode.y} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${node.x} ${node.y}`;
      }

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', pathD);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', lineColor);
      path.setAttribute('stroke-width', pNode.depth === 0 ? '2.5' : '1.8');
      path.setAttribute('stroke-linecap', 'round');
      edgeG.appendChild(path);

      // 出資比率バッジ
      if (edge.ratio) {
        const badgeR = (pNode.r + node.r) * 0.52;
        const badgeAngle = pNode.depth === 0 ? node.angle : (pNode.angle * 0.35 + node.angle * 0.65);
        const bx = cx + badgeR * Math.cos(badgeAngle);
        const by = cy + badgeR * Math.sin(badgeAngle);

        const rText = edge.ratio;
        const bw = Math.max(getRadialTextWidth(rText) + 16, 44);
        const bh = 21;

        const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bgRect.setAttribute('x', bx - bw / 2);
        bgRect.setAttribute('y', by - bh / 2);
        bgRect.setAttribute('width', bw);
        bgRect.setAttribute('height', bh);
        bgRect.setAttribute('rx', '10.5');
        bgRect.setAttribute('fill', '#ffffff');
        bgRect.setAttribute('stroke', lineColor);
        bgRect.setAttribute('stroke-width', '1.3');
        badgeG.appendChild(bgRect);

        const bTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        bTxt.setAttribute('x', bx);
        bTxt.setAttribute('y', by + 4.5);
        bTxt.setAttribute('text-anchor', 'middle');
        bTxt.setAttribute('font-size', '11');
        bTxt.setAttribute('font-weight', '700');
        bTxt.setAttribute('fill', '#0f172a');
        bTxt.setAttribute('font-family', 'sans-serif');
        bTxt.textContent = rText;
        badgeG.appendChild(bTxt);
      }
    });
  });

  svg.appendChild(edgeG);
  svg.appendChild(badgeG);

  // ノードカード描画グループ
  const nodeG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  nodeG.setAttribute('class', 'radial-nodes');

  nodes.forEach((node) => {
    const isCenter = node.depth === 0;
    const isDepth1 = node.depth === 1;

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', `radial-node-item depth-${node.depth}`);
    g.style.cursor = 'pointer';

    if (isCenter) {
      // 中心ノード（丸角大ピル型カード）
      const nw = Math.max(getRadialTextWidth(node.name) + 48, 200);
      const nh = node.tag ? 70 : 56;
      const nx = node.x - nw / 2;
      const ny = node.y - nh / 2;

      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', nx);
      rect.setAttribute('y', ny);
      rect.setAttribute('width', nw);
      rect.setAttribute('height', nh);
      rect.setAttribute('rx', '35');
      rect.setAttribute('fill', 'url(#rt-center-grad)');
      rect.setAttribute('filter', 'url(#rt-shadow-center)');
      rect.setAttribute('stroke', '#38bdf8');
      rect.setAttribute('stroke-width', '2.5');
      g.appendChild(rect);

      // 中心ノード名
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', node.x);
      text.setAttribute('y', node.tag ? node.y - 4 : node.y + 6);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('font-size', '18');
      text.setAttribute('font-weight', '800');
      text.setAttribute('fill', '#ffffff');
      text.setAttribute('font-family', 'system-ui, -apple-system, sans-serif');
      text.textContent = node.name;
      g.appendChild(text);

      // 中心ノードのタグ
      if (node.tag) {
        const tagText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        tagText.setAttribute('x', node.x);
        tagText.setAttribute('y', node.y + 19);
        tagText.setAttribute('text-anchor', 'middle');
        tagText.setAttribute('font-size', '11.5');
        tagText.setAttribute('font-weight', '600');
        tagText.setAttribute('fill', '#bae6fd');
        tagText.setAttribute('font-family', 'sans-serif');
        tagText.textContent = node.tag;
        g.appendChild(tagText);
      }
    } else {
      // 周辺ノード（Depth 1 または Depth 2+）
      const pal = node.palette || RADIAL_PALETTES[0];
      const nw = isDepth1 ? Math.max(getRadialTextWidth(node.name) + 28, 155) : Math.max(getRadialTextWidth(node.name) + 22, 132);
      const nh = node.tag ? (isDepth1 ? 58 : 48) : (isDepth1 ? 46 : 38);
      const nx = node.x - nw / 2;
      const ny = node.y - nh / 2;

      // カード外枠
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', nx);
      rect.setAttribute('y', ny);
      rect.setAttribute('width', nw);
      rect.setAttribute('height', nh);
      rect.setAttribute('rx', isDepth1 ? '11' : '8');
      rect.setAttribute('fill', isDepth1 ? '#ffffff' : pal.bg);
      rect.setAttribute('stroke', isDepth1 ? pal.stroke : pal.stroke);
      rect.setAttribute('stroke-width', isDepth1 ? '2' : '1.3');
      rect.setAttribute('filter', 'url(#rt-shadow)');
      g.appendChild(rect);

      // Depth 1の左端アクセントストライプ
      if (isDepth1) {
        const accent = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        accent.setAttribute('d', `M ${nx + 10} ${ny} L ${nx + 5} ${ny} A 5 5 0 0 0 ${nx} ${ny + 5} L ${nx} ${ny + nh - 5} A 5 5 0 0 0 ${nx + 5} ${ny + nh} L ${nx + 10} ${ny + nh} Z`);
        accent.setAttribute('fill', pal.stroke);
        g.appendChild(accent);
      }

      // ノード名テキスト
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', node.x + (isDepth1 ? 2 : 0));
      text.setAttribute('y', node.tag ? (isDepth1 ? node.y - 3 : node.y - 2) : node.y + 5);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('font-size', isDepth1 ? '15' : '13');
      text.setAttribute('font-weight', isDepth1 ? '800' : '700');
      text.setAttribute('fill', '#0f172a');
      text.setAttribute('font-family', 'system-ui, -apple-system, sans-serif');
      text.textContent = node.name;
      g.appendChild(text);

      // タグバッジ
      if (node.tag) {
        const tagW = Math.min(getRadialTextWidth(node.tag) + 14, nw - 16);
        const tagH = isDepth1 ? 17 : 16;
        const tagX = node.x - tagW / 2 + (isDepth1 ? 2 : 0);
        const tagY = isDepth1 ? node.y + 10 : node.y + 8;

        const tagRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        tagRect.setAttribute('x', tagX);
        tagRect.setAttribute('y', tagY);
        tagRect.setAttribute('width', tagW);
        tagRect.setAttribute('height', tagH);
        tagRect.setAttribute('rx', '4');
        tagRect.setAttribute('fill', pal.tagBg);
        g.appendChild(tagRect);

        const tagText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        tagText.setAttribute('x', tagX + tagW / 2);
        tagText.setAttribute('y', tagY + (isDepth1 ? 12.5 : 11.5));
        tagText.setAttribute('text-anchor', 'middle');
        tagText.setAttribute('font-size', isDepth1 ? '10.5' : '9.5');
        tagText.setAttribute('font-weight', '700');
        tagText.setAttribute('fill', pal.tagText);
        tagText.setAttribute('font-family', 'sans-serif');
        tagText.textContent = node.tag;
        g.appendChild(tagText);
      }
    }

    // ツールチップ
    const tip = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    const tipLines = [node.name];
    if (node.tag) tipLines.push(`[${node.tag}]`);
    if (node.parents.length > 0) {
      const pRatios = node.parents.map((p) => `${p.node.name}より ${p.edge.ratio || '出資'}`).join(', ');
      tipLines.push(`親会社: ${pRatios}`);
    }
    tip.textContent = tipLines.join('\n');
    g.appendChild(tip);

    nodeG.appendChild(g);
  });

  svg.appendChild(nodeG);
  container.appendChild(svg);

  if (labelText) {
    const lbl = document.createElement('div');
    lbl.className = 'chem-structure-label';
    lbl.textContent = labelText;
    container.appendChild(lbl);
  }
}
