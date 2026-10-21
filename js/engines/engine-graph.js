// ==========================================
// 有向グラフ / ネットワークグラフ (Directed Graph / 最短経路) エンジン
// ==========================================

/**
 * グラフ構文のパーサー
 * @param {string} rawText
 * @returns {object}
 */
function parseGraph(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;

  let content = rawText.trim();
  const cmdMatch = content.match(/^\\(?:graph|digraph|network)\s*\{([\s\S]*)\}\s*$/i);
  if (cmdMatch) {
    content = cmdMatch[1];
  }

  const lines = content.split(/;|\n/).map(l => l.trim()).filter(Boolean);

  let title = '';
  let subtitle = '';
  let type = 'directed'; // 'directed' または 'undirected'
  const nodesMap = new Map(); // id -> { id, label, x, y, isStart, isGoal, isHighlight, cost, color, fill }
  const edges = []; // [{ from, to, label, directed, isHighlight, bend, dashed, color }]
  const pathHighlightPairs = new Set(); // "from->to"

  lines.forEach(line => {
    // 1. コメント行スキップ
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

    // 4. グラフ種別 (type: directed / undirected)
    const typeMatch = line.match(/^type\s*:\s*(directed|undirected)/i);
    if (typeMatch) {
      type = typeMatch[1].toLowerCase();
      return;
    }

    // 5. パス一括ハイライト (path: S -> B -> D -> G または highlight_path: ...)
    const pathMatch = line.match(/^(?:path|highlight_path)\s*:\s*(.+)$/i);
    if (pathMatch) {
      const parts = pathMatch[1].split(/\s*(?:->|--)\s*/).map(s => s.trim().replace(/^["']|["']$/g, ''));
      for (let i = 0; i < parts.length - 1; i++) {
        const u = parts[i];
        const v = parts[i + 1];
        pathHighlightPairs.add(`${u}->${v}`);
        pathHighlightPairs.add(`${v}->${u}`); // 無向の場合も考慮
        if (nodesMap.has(u)) nodesMap.get(u).isHighlight = true;
        if (nodesMap.has(v)) nodesMap.get(v).isHighlight = true;
      }
      return;
    }

    // 6. エッジ定義 (A -> B : 5 [highlight] または A -- B : 7)
    const edgeMatch = line.match(/^(?:edge\s+)?([a-zA-Z0-9_\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]+)\s*(->|--)\s*([a-zA-Z0-9_\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]+)(?:\s*:\s*([^\[]+))?(?:\s*\[(.*)\])?$/i);
    if (edgeMatch) {
      const from = edgeMatch[1].trim();
      const op = edgeMatch[2].trim();
      const to = edgeMatch[3].trim();
      let label = (edgeMatch[4] || '').trim().replace(/^["']|["']$/g, '');
      const optStr = (edgeMatch[5] || '').toLowerCase();

      const isDirected = (op === '->') || (type === 'directed' && op !== '--');
      let isHighlight = optStr.includes('highlight') || optStr.includes('path') || optStr.includes('primary');
      const dashed = optStr.includes('dashed') || optStr.includes('dotted');

      // bend オプションの抽出
      let bend = 0;
      const bendMatch = optStr.match(/bend\s*(?::\s*([-\d.]+)|(left|right))/);
      if (bendMatch) {
        if (bendMatch[1]) bend = parseFloat(bendMatch[1]);
        else if (bendMatch[2] === 'left') bend = -25;
        else if (bendMatch[2] === 'right') bend = 25;
      }

      // 重み・コストが [cost: 5] などの属性に書かれている場合
      const costAttrMatch = optStr.match(/cost\s*:\s*([^\],;]+)/);
      if (costAttrMatch && !label) {
        label = costAttrMatch[1].trim();
      }

      edges.push({
        from,
        to,
        label,
        directed: isDirected,
        isHighlight,
        bend,
        dashed
      });

      // 未登録ノードを仮作成
      if (!nodesMap.has(from)) {
        nodesMap.set(from, { id: from, label: from, x: null, y: null, isStart: false, isGoal: false, isHighlight: false, cost: null });
      }
      if (!nodesMap.has(to)) {
        nodesMap.set(to, { id: to, label: to, x: null, y: null, isStart: false, isGoal: false, isHighlight: false, cost: null });
      }
      return;
    }

    // 7. ノード定義 (node A (100, 200) "Label" [start, cost: 0] または A (100, 200) [cost: 5])
    const nodeMatch = line.match(/^(?:node\s+)?([a-zA-Z0-9_\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]+)(?:\s*\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\))?(?:\s*["']([^"']+)["'])?(?:\s*\[(.*)\])?$/i);
    if (nodeMatch) {
      const id = nodeMatch[1].trim();
      const x = nodeMatch[2] !== undefined ? parseFloat(nodeMatch[2]) : null;
      const y = nodeMatch[3] !== undefined ? parseFloat(nodeMatch[3]) : null;
      const label = nodeMatch[4] ? nodeMatch[4].trim() : id;
      const optStr = (nodeMatch[5] || '').toLowerCase();

      const isStart = optStr.includes('start') || optStr.includes('init') || optStr.includes('source');
      const isGoal = optStr.includes('goal') || optStr.includes('end') || optStr.includes('target');
      const isHighlight = optStr.includes('highlight') || optStr.includes('active');

      let cost = null;
      const costM = optStr.match(/cost\s*:\s*([^\],;]+)/);
      if (costM) {
        cost = costM[1].trim();
      }

      const existing = nodesMap.get(id) || {};
      nodesMap.set(id, {
        id,
        label: label || existing.label || id,
        x: x !== null ? x : existing.x ?? null,
        y: y !== null ? y : existing.y ?? null,
        isStart: isStart || existing.isStart || false,
        isGoal: isGoal || existing.isGoal || false,
        isHighlight: isHighlight || existing.isHighlight || false,
        cost: cost !== null ? cost : (existing.cost ?? null)
      });
      return;
    }
  });

  // パス指定からエッジ・ノードのハイライトを同期
  edges.forEach(e => {
    if (pathHighlightPairs.has(`${e.from}->${e.to}`) || pathHighlightPairs.has(`${e.to}->${e.from}`)) {
      e.isHighlight = true;
      if (nodesMap.has(e.from)) nodesMap.get(e.from).isHighlight = true;
      if (nodesMap.has(e.to)) nodesMap.get(e.to).isHighlight = true;
    }
  });

  return {
    title,
    subtitle,
    type,
    nodes: Array.from(nodesMap.values()),
    edges
  };
}

/**
 * 有向グラフ / ネットワークグラフのSVG描画
 * @param {string} text
 * @param {HTMLElement} container
 * @param {string} [labelText]
 */
function drawGraphSvg(text, container, labelText) {
  if (!container) return;
  container.innerHTML = '';

  const parsed = parseGraph(text);
  if (!parsed || parsed.nodes.length === 0) {
    container.innerHTML = '<div style="color:#ef4444; font-size:13px; padding:12px;">有向グラフの構文を解析できませんでした。<br>例: <code>\\graph{ S -> A : 4; S -> B : 2; A -> G : 3; B -> G : 5; }</code></div>';
    return;
  }

  const { title, subtitle, nodes, edges } = parsed;

  // 1. ノード座標の自動補正（未指定ノードの円形配置またはグリッド配置）
  const unpositionedNodes = nodes.filter(n => n.x === null || n.y === null);
  const positionedNodes = nodes.filter(n => n.x !== null && n.y !== null);

  const defaultCenterX = 300;
  const defaultCenterY = title ? 250 : 220;
  const radius = Math.max(120, Math.min(180, nodes.length * 28));

  if (positionedNodes.length === 0) {
    // 全て未指定の場合は綺麗な円形（環状）に配置
    const total = nodes.length;
    nodes.forEach((n, idx) => {
      const angle = (idx / total) * 2 * Math.PI - Math.PI / 2;
      n.x = Math.round(defaultCenterX + radius * Math.cos(angle));
      n.y = Math.round(defaultCenterY + radius * Math.sin(angle));
    });
  } else if (unpositionedNodes.length > 0) {
    // 一部未指定の場合は余白に配置
    let startX = 80;
    let startY = title ? 100 : 70;
    unpositionedNodes.forEach((n, idx) => {
      n.x = startX + (idx % 4) * 120;
      n.y = startY + Math.floor(idx / 4) * 90;
    });
  }

  // バウンディングボックスの計算
  const nodeRadius = 22;
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

  nodes.forEach(n => {
    minX = Math.min(minX, n.x);
    maxX = Math.max(maxX, n.x);
    minY = Math.min(minY, n.y);
    maxY = Math.max(maxY, n.y);
  });

  const padX = 70;
  const padTop = title ? (subtitle ? 125 : 105) : 55;
  const padBottom = 50;

  const naturalW = (maxX - minX) + padX * 2;
  const targetMinW = 760;
  let viewBoxMinX = minX - padX;
  let width = naturalW;
  if (naturalW < targetMinW) {
    const extra = (targetMinW - naturalW) / 2;
    viewBoxMinX -= extra;
    width = targetMinW;
  }
  const viewBoxMinY = minY - padTop;
  const height = Math.max(340, (maxY - viewBoxMinY) + padBottom);

  const nodeMap = new Map();
  nodes.forEach(n => nodeMap.set(n.id, n));

  // 双方向エッジ (A -> B と B -> A) の検知とベンド自動付与
  const edgePairCount = new Map();
  edges.forEach(e => {
    const key = [e.from, e.to].sort().join('--');
    edgePairCount.set(key, (edgePairCount.get(key) || 0) + 1);
  });

  edges.forEach(e => {
    const key = [e.from, e.to].sort().join('--');
    if (edgePairCount.get(key) > 1 && e.bend === 0) {
      // 双方向の場合はそれぞれ少しカーブさせて重なりを回避
      e.bend = (e.from < e.to) ? 22 : -22;
    }
  });

  // SVGの生成
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', `${viewBoxMinX} ${viewBoxMinY} ${width} ${height}`);
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.style.maxWidth = `${width}px`;
  svg.style.display = 'block';
  svg.style.margin = '0 auto';
  svg.setAttribute('class', 'graph-svg');

  // マーカー・フィルタの定義
  const defs = document.createElementNS(svgNS, 'defs');
  defs.innerHTML = `
    <!-- 通常矢印マーカー -->
    <marker id="graph-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#64748b" />
    </marker>
    <!-- ハイライト矢印マーカー -->
    <marker id="graph-arrow-highlight" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#6366f1" />
    </marker>

    <!-- ノード用ドロップシャドウ -->
    <filter id="graph-node-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#0f172a" flood-opacity="0.08" />
    </filter>
  `;
  svg.appendChild(defs);

  // タイトル & サブタイトルの描画
  if (title) {
    const titleEl = document.createElementNS(svgNS, 'text');
    titleEl.setAttribute('x', (viewBoxMinX + width / 2).toString());
    titleEl.setAttribute('y', (viewBoxMinY + 30).toString());
    titleEl.setAttribute('text-anchor', 'middle');
    titleEl.setAttribute('font-family', "'Outfit', 'Inter', 'Noto Sans JP', sans-serif");
    titleEl.setAttribute('font-size', '16.5');
    titleEl.setAttribute('font-weight', '700');
    titleEl.setAttribute('fill', '#0f172a');
    titleEl.textContent = title;
    svg.appendChild(titleEl);

    if (subtitle) {
      const subEl = document.createElementNS(svgNS, 'text');
      subEl.setAttribute('x', (viewBoxMinX + width / 2).toString());
      subEl.setAttribute('y', (viewBoxMinY + 48).toString());
      subEl.setAttribute('text-anchor', 'middle');
      subEl.setAttribute('font-family', "'Outfit', 'Inter', 'Noto Sans JP', sans-serif");
      subEl.setAttribute('font-size', '11.5');
      subEl.setAttribute('font-weight', '400');
      subEl.setAttribute('fill', '#64748b');
      subEl.textContent = subtitle;
      svg.appendChild(subEl);
    }
  }

  // エッジ描画グループ
  const edgeGroup = document.createElementNS(svgNS, 'g');
  edgeGroup.setAttribute('class', 'graph-edges');
  svg.appendChild(edgeGroup);

  const edgeLabelGroup = document.createElementNS(svgNS, 'g');
  edgeLabelGroup.setAttribute('class', 'graph-edge-labels');
  svg.appendChild(edgeLabelGroup);

  // ノード描画グループ
  const nodeGroup = document.createElementNS(svgNS, 'g');
  nodeGroup.setAttribute('class', 'graph-nodes');
  svg.appendChild(nodeGroup);

  // エッジ描画ループ
  edges.forEach(e => {
    const src = nodeMap.get(e.from);
    const tgt = nodeMap.get(e.to);
    if (!src || !tgt) return;

    const dx = tgt.x - src.x;
    const dy = tgt.y - src.y;
    const dist = Math.hypot(dx, dy);
    if (dist === 0) return;

    // 単位法線ベクトル
    const ux = dx / dist;
    const uy = dy / dist;
    const nx = -uy;
    const ny = ux;

    // ノード境界オフセット
    const startOffset = nodeRadius;
    const endOffset = e.directed ? (nodeRadius + 4) : nodeRadius;

    let pathD = '';
    let labelX = (src.x + tgt.x) / 2;
    let labelY = (src.y + tgt.y) / 2;

    if (Math.abs(e.bend) > 0.1) {
      // ベジェ曲線
      const ctrlX = (src.x + tgt.x) / 2 + nx * e.bend;
      const ctrlY = (src.y + tgt.y) / 2 + ny * e.bend;

      const x1 = src.x + (ctrlX - src.x) * (startOffset / Math.hypot(ctrlX - src.x, ctrlY - src.y));
      const y1 = src.y + (ctrlY - src.y) * (startOffset / Math.hypot(ctrlX - src.x, ctrlY - src.y));
      const x2 = tgt.x - (tgt.x - ctrlX) * (endOffset / Math.hypot(tgt.x - ctrlX, tgt.y - ctrlY));
      const y2 = tgt.y - (tgt.y - ctrlY) * (endOffset / Math.hypot(tgt.x - ctrlX, tgt.y - ctrlY));

      pathD = `M ${x1} ${y1} Q ${ctrlX} ${ctrlY} ${x2} ${y2}`;
      // ラベル位置（Q曲線の頂点 t=0.5）
      labelX = 0.25 * x1 + 0.5 * ctrlX + 0.25 * x2;
      labelY = 0.25 * y1 + 0.5 * ctrlY + 0.25 * y2;
    } else {
      // 直線
      const x1 = src.x + ux * startOffset;
      const y1 = src.y + uy * startOffset;
      const x2 = tgt.x - ux * endOffset;
      const y2 = tgt.y - uy * endOffset;

      pathD = `M ${x1} ${y1} L ${x2} ${y2}`;
    }

    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('d', pathD);
    path.setAttribute('fill', 'none');

    if (e.isHighlight) {
      path.setAttribute('stroke', '#6366f1');
      path.setAttribute('stroke-width', '2.8');
      path.setAttribute('stroke-linecap', 'round');
      if (e.directed) path.setAttribute('marker-end', 'url(#graph-arrow-highlight)');
    } else {
      path.setAttribute('stroke', '#94a3b8');
      path.setAttribute('stroke-width', '1.6');
      if (e.dashed) path.setAttribute('stroke-dasharray', '4 3');
      if (e.directed) path.setAttribute('marker-end', 'url(#graph-arrow)');
    }
    edgeGroup.appendChild(path);

    // エッジラベル（重み/コスト数値）
    if (e.label) {
      const g = document.createElementNS(svgNS, 'g');

      const tw = Math.max(e.label.length * 7.5 + 10, 20);
      const th = 17;

      const bg = document.createElementNS(svgNS, 'rect');
      bg.setAttribute('x', (labelX - tw / 2).toString());
      bg.setAttribute('y', (labelY - th / 2).toString());
      bg.setAttribute('width', tw.toString());
      bg.setAttribute('height', th.toString());
      bg.setAttribute('rx', '4');
      bg.setAttribute('ry', '4');
      bg.setAttribute('fill', '#ffffff');
      bg.setAttribute('stroke', e.isHighlight ? '#c7d2fe' : '#e2e8f0');
      bg.setAttribute('stroke-width', '1');
      g.appendChild(bg);

      const txt = document.createElementNS(svgNS, 'text');
      txt.setAttribute('x', labelX.toString());
      txt.setAttribute('y', (labelY + 3.8).toString());
      txt.setAttribute('text-anchor', 'middle');
      txt.setAttribute('font-family', "'Outfit', 'Inter', monospace");
      txt.setAttribute('font-size', '11.5');
      txt.setAttribute('font-weight', '600');
      txt.setAttribute('fill', e.isHighlight ? '#4338ca' : '#475569');
      txt.textContent = e.label;
      g.appendChild(txt);

      edgeLabelGroup.appendChild(g);
    }
  });

  // ノード描画ループ
  nodes.forEach(n => {
    const g = document.createElementNS(svgNS, 'g');
    g.setAttribute('class', `graph-node node-${n.id}`);

    // ノード円
    const circle = document.createElementNS(svgNS, 'circle');
    circle.setAttribute('cx', n.x.toString());
    circle.setAttribute('cy', n.y.toString());
    circle.setAttribute('r', nodeRadius.toString());
    circle.setAttribute('filter', 'url(#graph-node-shadow)');

    let fillColor = '#ffffff';
    let strokeColor = '#64748b';
    let textColor = '#0f172a';
    let strokeWidth = '1.8';

    if (n.isStart) {
      fillColor = '#ecfdf5';
      strokeColor = '#10b981';
      textColor = '#065f46';
      strokeWidth = '2.4';
    } else if (n.isGoal) {
      fillColor = '#fff1f2';
      strokeColor = '#f43f5e';
      textColor = '#9f1239';
      strokeWidth = '2.4';
    } else if (n.isHighlight) {
      fillColor = '#e0e7ff';
      strokeColor = '#6366f1';
      textColor = '#3730a3';
      strokeWidth = '2.5';
    }

    circle.setAttribute('fill', fillColor);
    circle.setAttribute('stroke', strokeColor);
    circle.setAttribute('stroke-width', strokeWidth);
    g.appendChild(circle);

    // ゴールノードの二重円スタイル
    if (n.isGoal) {
      const innerCircle = document.createElementNS(svgNS, 'circle');
      innerCircle.setAttribute('cx', n.x.toString());
      innerCircle.setAttribute('cy', n.y.toString());
      innerCircle.setAttribute('r', (nodeRadius - 3.5).toString());
      innerCircle.setAttribute('fill', 'none');
      innerCircle.setAttribute('stroke', strokeColor);
      innerCircle.setAttribute('stroke-width', '1.2');
      g.appendChild(innerCircle);
    }

    // ノード名テキスト
    const textEl = document.createElementNS(svgNS, 'text');
    textEl.setAttribute('x', n.x.toString());
    textEl.setAttribute('y', (n.y + 4.5).toString());
    textEl.setAttribute('text-anchor', 'middle');
    textEl.setAttribute('font-family', "'Outfit', 'Inter', 'Noto Sans JP', sans-serif");
    textEl.setAttribute('font-size', n.label.length > 3 ? '11.5' : '13');
    textEl.setAttribute('font-weight', '700');
    textEl.setAttribute('fill', textColor);
    textEl.textContent = n.label;
    g.appendChild(textEl);

    // コストバッジ（ノード上部: [cost: X]）
    if (n.cost !== null && n.cost !== undefined) {
      const costBadge = document.createElementNS(svgNS, 'g');
      const badgeY = n.y - nodeRadius - 10;
      const costStr = `cost: ${n.cost}`;
      const bw = Math.max(costStr.length * 6.5 + 10, 44);
      const bh = 16;

      const bRect = document.createElementNS(svgNS, 'rect');
      bRect.setAttribute('x', (n.x - bw / 2).toString());
      bRect.setAttribute('y', (badgeY - bh / 2).toString());
      bRect.setAttribute('width', bw.toString());
      bRect.setAttribute('height', bh.toString());
      bRect.setAttribute('rx', '4');
      bRect.setAttribute('ry', '4');
      bRect.setAttribute('fill', n.isHighlight ? '#e0e7ff' : '#f1f5f9');
      bRect.setAttribute('stroke', n.isHighlight ? '#818cf8' : '#cbd5e1');
      bRect.setAttribute('stroke-width', '1');
      costBadge.appendChild(bRect);

      const bTxt = document.createElementNS(svgNS, 'text');
      bTxt.setAttribute('x', n.x.toString());
      bTxt.setAttribute('y', (badgeY + 3.5).toString());
      bTxt.setAttribute('text-anchor', 'middle');
      bTxt.setAttribute('font-family', "'Outfit', 'Inter', monospace");
      bTxt.setAttribute('font-size', '10.5');
      bTxt.setAttribute('font-weight', '600');
      bTxt.setAttribute('fill', n.isHighlight ? '#3730a3' : '#475569');
      bTxt.textContent = costStr;
      costBadge.appendChild(bTxt);

      g.appendChild(costBadge);
    }

    nodeGroup.appendChild(g);
  });

  // コンテナへの配置
  const wrapper = document.createElement('div');
  wrapper.className = 'graph-container';
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
function drawGraph(text, container, labelText) {
  drawGraphSvg(text, container, labelText);
}
