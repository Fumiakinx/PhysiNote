// ==========================================
// フローチャート構文パーサー & SVG描画エンジン
// ==========================================
function parseFlowchart(flowText) {
  const lines = flowText.split(/[\n;]+/).map((l) => l.trim()).filter(Boolean);
  const nodesMap = new Map();
  const edges = [];

  lines.forEach((line) => {
    // 1. コネクタ（接続）行: A -> B
    if (line.includes('->')) {
      const arrowIdx = line.indexOf('->');
      const from = line.substring(0, arrowIdx).trim();
      let rest = line.substring(arrowIdx + 2).trim();

      let opts = '';
      const optMatch = rest.match(/\[(.*)\]$/);
      if (optMatch) {
        opts = optMatch[1].toLowerCase();
        rest = rest.substring(0, optMatch.index).trim();
      }

      let label = '';
      const colonIdx = rest.indexOf(':');
      let to = rest;
      if (colonIdx !== -1) {
        to = rest.substring(0, colonIdx).trim();
        label = rest.substring(colonIdx + 1).trim().replace(/^["']|["']$/g, '');
      }

      if (from && to) {
        edges.push({ from, to, label, opts });

        if (!nodesMap.has(from)) {
          nodesMap.set(from, { id: from, text: from, x: null, y: null, type: 'proc' });
        }
        if (!nodesMap.has(to)) {
          nodesMap.set(to, { id: to, text: to, x: null, y: null, type: 'proc' });
        }
      }
    } else {
      // 2. ノード定義行
      let cleaned = line;
      let nodeType = 'proc';

      // タイプ [start / cond / io / proc / end / sub] の抽出（配列添字 arr[mid] などの巻き込みを防止）
      const typeMatch = cleaned.match(/\[(start|begin|terminal|end|finish|stop|cond|branch|decision|if|diamond|io|input|output|data|parallelogram|sub|subroutine|prep|proc)\]/i);
      if (typeMatch) {
        const t = typeMatch[1].toLowerCase();
        if (/start|begin|terminal/i.test(t)) nodeType = 'start';
        else if (/end|finish|stop/i.test(t)) nodeType = 'end';
        else if (/cond|branch|decision|if|diamond/i.test(t)) nodeType = 'cond';
        else if (/io|input|output|data|parallelogram/i.test(t)) nodeType = 'io';
        else if (/sub|subroutine|prep/i.test(t)) nodeType = 'sub';
        else nodeType = 'proc';
        cleaned = cleaned.replace(typeMatch[0], '').trim();
      }

      // 座標 (x, y) の抽出
      let posX = null;
      let posY = null;
      const coordMatch = cleaned.match(/\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)/);
      if (coordMatch) {
        posX = parseFloat(coordMatch[1]);
        posY = parseFloat(coordMatch[2]);
        cleaned = cleaned.replace(coordMatch[0], '').trim();
      }

      // プレフィックス (node: や state:) の除去
      cleaned = cleaned.replace(/^(?:node|state|box|step):\s*/i, '').trim();

      // ID と 表示ラベルの分離: 例 ID: "ラベル" または ID
      let id = cleaned;
      let label = cleaned;
      const colonIdx = cleaned.indexOf(':');
      if (colonIdx !== -1) {
        id = cleaned.substring(0, colonIdx).trim();
        label = cleaned.substring(colonIdx + 1).trim();
      }
      label = label.replace(/^["']|["']$/g, '');

      if (id) {
        const existing = nodesMap.get(id) || {};
        nodesMap.set(id, {
          id,
          text: label || existing.text || id,
          x: posX !== null ? posX : (existing.x ?? null),
          y: posY !== null ? posY : (existing.y ?? null),
          type: nodeType !== 'proc' ? nodeType : (existing.type || 'proc')
        });
      }
    }
  });

  const nodes = Array.from(nodesMap.values());

  // 自動レイアウト（座標未指定ノードがある場合）
  let needsLayout = nodes.some((n) => n.x === null || n.y === null);
  if (needsLayout) {
    const inDegrees = new Map();
    const childrenMap = new Map();
    nodes.forEach((n) => {
      inDegrees.set(n.id, 0);
      childrenMap.set(n.id, []);
    });

    edges.forEach((e) => {
      if (inDegrees.has(e.to)) {
        inDegrees.set(e.to, inDegrees.get(e.to) + 1);
      }
      if (childrenMap.has(e.from)) {
        childrenMap.get(e.from).push(e.to);
      }
    });

    const levels = new Map();
    const queue = [];
    nodes.forEach((n) => {
      if (inDegrees.get(n.id) === 0 || n.type === 'start') {
        levels.set(n.id, 0);
        queue.push(n.id);
      }
    });

    if (queue.length === 0 && nodes.length > 0) {
      levels.set(nodes[0].id, 0);
      queue.push(nodes[0].id);
    }

    const visited = new Set();
    while (queue.length > 0) {
      const curr = queue.shift();
      visited.add(curr);
      const currLevel = levels.get(curr) || 0;
      const children = childrenMap.get(curr) || [];
      children.forEach((chId) => {
        const chLevel = levels.get(chId);
        if (chLevel === undefined || chLevel <= currLevel) {
          levels.set(chId, currLevel + 1);
        }
        if (!visited.has(chId) && !queue.includes(chId)) {
          queue.push(chId);
        }
      });
    }

    let maxAssignedLevel = 0;
    levels.forEach((l) => { if (l > maxAssignedLevel) maxAssignedLevel = l; });
    nodes.forEach((n) => {
      if (!levels.has(n.id)) {
        maxAssignedLevel++;
        levels.set(n.id, maxAssignedLevel);
      }
    });

    const levelGroups = new Map();
    nodes.forEach((n) => {
      const l = levels.get(n.id);
      if (!levelGroups.has(l)) levelGroups.set(l, []);
      levelGroups.get(l).push(n);
    });

    levelGroups.forEach((groupNodes, lvl) => {
      const count = groupNodes.length;
      groupNodes.forEach((n, idx) => {
        if (n.x === null) {
          n.x = Math.round((idx - (count - 1) / 2) * 190);
        }
        if (n.y === null) {
          n.y = lvl * 95;
        }
      });
    });
  }

  return { nodes, edges };
}

// 全角（日本語等）と半角を判別して実効表示幅を推定するヘルパー
function estimateFlowchartTextWidth(str, fontSize = 12) {
  if (!str) return 0;
  let units = 0;
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code > 0x7f) {
      units += 1.05; // 全角文字（漢字・ひらがな・カタカナなど）
    } else {
      units += 0.58; // 半角英数記号
    }
  }
  return units * fontSize;
}

function drawFlowchartSvg(flowText, container, labelText) {
  container.innerHTML = '';
  const { nodes, edges } = parseFlowchart(flowText);

  if (nodes.length === 0) {
    container.innerHTML = '<span style="color:#ef4444; font-size:12px;">フローチャートの構文を解析できませんでした（例: \\flowchart{ 開始 [start]; 処理 [proc]; 開始 -> 処理; }）</span>';
    return;
  }

  const nodeLookup = new Map();
  nodes.forEach((n) => {
    let w, h;
    const rawStr = n.text || n.id;
    const textLines = rawStr.split(/\\n|\n/);
    n.textLines = textLines;
    const maxLineWidth = Math.max(...textLines.map((l) => estimateFlowchartTextWidth(l, 12)));
    const extraH = (textLines.length - 1) * 18;

    if (n.type === 'start' || n.type === 'end') {
      w = Math.max(130, maxLineWidth + 56);
      h = 44 + extraH;
    } else if (n.type === 'cond') {
      w = Math.max(150, maxLineWidth + 84);
      h = 58 + extraH * 1.3;
    } else if (n.type === 'io') {
      w = Math.max(135, maxLineWidth + 56);
      h = 44 + extraH;
    } else if (n.type === 'sub') {
      w = Math.max(140, maxLineWidth + 56);
      h = 44 + extraH;
    } else {
      w = Math.max(130, maxLineWidth + 44);
      h = 46 + extraH;
    }
    n.w = w;
    n.h = h;
    nodeLookup.set(n.id, n);
  });

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.style.overflow = 'visible';

  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
  marker.setAttribute('id', 'flowchart-arrow');
  marker.setAttribute('viewBox', '0 0 10 10');
  marker.setAttribute('refX', '7');
  marker.setAttribute('refY', '5');
  marker.setAttribute('markerWidth', '6');
  marker.setAttribute('markerHeight', '6');
  marker.setAttribute('orient', 'auto-start-reverse');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M 0 1.5 L 8 5 L 0 8.5 z');
  path.setAttribute('fill', '#475569');
  marker.appendChild(path);
  defs.appendChild(marker);
  svg.appendChild(defs);

  const pts = [];

  const edgesG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  edgesG.setAttribute('class', 'flowchart-edges');

  // 全ノードの左右境界を算出（外側配線の完全衝突回避用）
  let allMinX = Infinity;
  let allMaxX = -Infinity;
  nodes.forEach((n) => {
    const leftEdge = n.x - n.w / 2;
    const rightEdge = n.x + n.w / 2;
    if (leftEdge < allMinX) allMinX = leftEdge;
    if (rightEdge > allMaxX) allMaxX = rightEdge;
  });

  let leftLaneIdx = 0;
  let rightLaneIdx = 0;

  edges.forEach((e) => {
    const s1 = nodeLookup.get(e.from);
    const s2 = nodeLookup.get(e.to);
    if (!s1 || !s2) return;

    let pathD = '';
    let labelPos = null;

    const dx = s2.x - s1.x;
    const dy = s2.y - s1.y;

    // 1. 水平（真横直接接続: dyの差が小さく、dxが一定以上）
    if (Math.abs(dy) < 25 && Math.abs(dx) > 30) {
      if (dx > 0) {
        // 右へ
        const startX = s1.x + s1.w / 2;
        const startY = s1.y;
        const endX = s2.x - s2.w / 2;
        const endY = s2.y;
        pathD = `M ${startX} ${startY} L ${endX} ${endY}`;
        labelPos = { x: (startX + endX) / 2, y: startY - 14 };
      } else {
        // 左へ
        const startX = s1.x - s1.w / 2;
        const startY = s1.y;
        const endX = s2.x + s2.w / 2;
        const endY = s2.y;
        pathD = `M ${startX} ${startY} L ${endX} ${endY}`;
        labelPos = { x: (startX + endX) / 2, y: startY - 14 };
      }
    }
    // 2. 真下（垂直直接接続: dxが小さく、dyが正）
    else if (dy > 20 && Math.abs(dx) < 35) {
      const startX = s1.x;
      const startY = s1.y + s1.h / 2;
      const endX = s2.x;
      const endY = s2.y - s2.h / 2;
      pathD = `M ${startX} ${startY} L ${endX} ${endY}`;
      labelPos = { x: startX + 18, y: (startY + endY) / 2 };
    }
    // 3. 下降（dy > 20）
    else if (dy > 20) {
      // 3-a. 条件分岐 (cond) からの下降
      if (s1.type === 'cond') {
        const isRight = dx >= 0;
        const startX = isRight ? (s1.x + s1.w / 2) : (s1.x - s1.w / 2);
        const startY = s1.y;
        const endX = s2.x;
        const endY = s2.y - s2.h / 2;
        pathD = `M ${startX} ${startY} H ${endX} V ${endY}`;
        labelPos = { x: (startX + endX) / 2, y: startY - 14 };
      }
      // 3-b. 外側ノードから中央の最下部ノード（終了など）へ向かう線（中央ノード群の貫通防止）
      else if (Math.abs(s1.x) > 40 && Math.abs(s2.x) < 40 && s2.type === 'end') {
        const isLeft = s1.x < 0;
        const outerX = isLeft
          ? allMinX - 30 - (leftLaneIdx++) * 24
          : allMaxX + 30 + (rightLaneIdx++) * 24;
        const startX = isLeft ? (s1.x - s1.w / 2) : (s1.x + s1.w / 2);
        const startY = s1.y;
        const endX = isLeft ? (s2.x - s2.w / 2) : (s2.x + s2.w / 2);
        const endY = s2.y;
        pathD = `M ${startX} ${startY} H ${outerX} V ${endY} H ${endX}`;
        labelPos = { x: isLeft ? outerX - 16 : outerX + 16, y: (startY + endY) / 2 };
        pts.push({ x: isLeft ? outerX - 25 : outerX + 25, y: startY });
        pts.push({ x: outerX, y: endY });
      }
      // 3-c. 通常のクランク状下降
      else {
        const startX = s1.x;
        const startY = s1.y + s1.h / 2;
        const midY = (startY + (s2.y - s2.h / 2)) / 2;
        const endX = s2.x;
        const endY = s2.y - s2.h / 2;
        pathD = `M ${startX} ${startY} V ${midY} H ${endX} V ${endY}`;
        labelPos = { x: (startX + endX) / 2, y: midY - 14 };
      }
    }
    // 4. 上昇ループ戻り線（dy <= -20 または dy <= 20 の戻り）
    else {
      const isRight = s1.x >= 0;
      if (isRight) {
        // 右外側を迂回して戻る
        const outerX = allMaxX + 30 + (rightLaneIdx++) * 24;
        const startX = s1.x + s1.w / 2;
        const startY = s1.y;
        const endX = s2.x + s2.w / 2;
        const endY = s2.y;
        pathD = `M ${startX} ${startY} H ${outerX} V ${endY} H ${endX}`;
        labelPos = { x: outerX + 16, y: (startY + endY) / 2 };
        pts.push({ x: outerX + 25, y: startY });
        pts.push({ x: outerX, y: endY });
      } else {
        // 左外側を迂回して戻る
        const outerX = allMinX - 30 - (leftLaneIdx++) * 24;
        const startX = s1.x - s1.w / 2;
        const startY = s1.y;
        const endX = s2.x - s2.w / 2;
        const endY = s2.y;
        pathD = `M ${startX} ${startY} H ${outerX} V ${endY} H ${endX}`;
        labelPos = { x: outerX - 16, y: (startY + endY) / 2 };
        pts.push({ x: outerX - 25, y: startY });
        pts.push({ x: outerX, y: endY });
      }
    }

    const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pathEl.setAttribute('d', pathD);
    pathEl.setAttribute('fill', 'none');
    pathEl.setAttribute('stroke', '#475569');
    pathEl.setAttribute('stroke-width', '2');
    pathEl.setAttribute('marker-end', 'url(#flowchart-arrow)');
    edgesG.appendChild(pathEl);

    if (e.label && labelPos) {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      const tw = Math.max(estimateFlowchartTextWidth(e.label, 11) + 18, 36);
      const th = 22;
      const rx = labelPos.x - tw / 2;
      const ry = labelPos.y - th / 2;

      const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bg.setAttribute('x', rx);
      bg.setAttribute('y', ry);
      bg.setAttribute('width', tw);
      bg.setAttribute('height', th);
      bg.setAttribute('rx', '4');
      bg.setAttribute('ry', '4');
      bg.setAttribute('fill', '#ffffff');
      bg.setAttribute('stroke', '#cbd5e1');
      bg.setAttribute('stroke-width', '1');
      g.appendChild(bg);

      const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      txt.setAttribute('x', labelPos.x);
      txt.setAttribute('y', labelPos.y + 4);
      txt.setAttribute('text-anchor', 'middle');
      txt.setAttribute('font-size', '11.5');
      txt.setAttribute('font-weight', '700');
      txt.setAttribute('font-family', 'ui-monospace, monospace');
      txt.setAttribute('fill', '#0284c7');
      txt.textContent = e.label;
      g.appendChild(txt);

      edgesG.appendChild(g);
      pts.push({ x: rx, y: ry });
      pts.push({ x: rx + tw, y: ry + th });
    }
  });

  svg.appendChild(edgesG);

  const nodesG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  nodesG.setAttribute('class', 'flowchart-nodes');

  nodes.forEach((n) => {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const x0 = n.x - n.w / 2;
    const y0 = n.y - n.h / 2;

    pts.push({ x: x0, y: y0 });
    pts.push({ x: x0 + n.w, y: y0 + n.h });

    let shapeEl;
    let fill = '#eff6ff';
    let stroke = '#3b82f6';
    let textColor = '#1e40af';

    if (n.type === 'start' || n.type === 'end') {
      fill = '#ecfdf5';
      stroke = '#10b981';
      textColor = '#065f46';
      shapeEl = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      shapeEl.setAttribute('x', x0);
      shapeEl.setAttribute('y', y0);
      shapeEl.setAttribute('width', n.w);
      shapeEl.setAttribute('height', n.h);
      shapeEl.setAttribute('rx', n.h / 2);
      shapeEl.setAttribute('ry', n.h / 2);
    } else if (n.type === 'cond') {
      fill = '#fffbeb';
      stroke = '#f59e0b';
      textColor = '#92400e';
      shapeEl = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      const topP = `${n.x},${y0}`;
      const rightP = `${n.x + n.w / 2},${n.y}`;
      const bottomP = `${n.x},${y0 + n.h}`;
      const leftP = `${n.x - n.w / 2},${n.y}`;
      shapeEl.setAttribute('points', `${topP} ${rightP} ${bottomP} ${leftP}`);
    } else if (n.type === 'io') {
      fill = '#f5f3ff';
      stroke = '#8b5cf6';
      textColor = '#5b21b6';
      shapeEl = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      const skew = 14;
      const p1 = `${x0 + skew},${y0}`;
      const p2 = `${x0 + n.w},${y0}`;
      const p3 = `${x0 + n.w - skew},${y0 + n.h}`;
      const p4 = `${x0},${y0 + n.h}`;
      shapeEl.setAttribute('points', `${p1} ${p2} ${p3} ${p4}`);
    } else if (n.type === 'sub') {
      fill = '#f0fdfa';
      stroke = '#14b8a6';
      textColor = '#115e59';
      shapeEl = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      shapeEl.setAttribute('x', x0);
      shapeEl.setAttribute('y', y0);
      shapeEl.setAttribute('width', n.w);
      shapeEl.setAttribute('height', n.h);
      shapeEl.setAttribute('rx', '4');
      shapeEl.setAttribute('ry', '4');
    } else {
      shapeEl = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      shapeEl.setAttribute('x', x0);
      shapeEl.setAttribute('y', y0);
      shapeEl.setAttribute('width', n.w);
      shapeEl.setAttribute('height', n.h);
      shapeEl.setAttribute('rx', '5');
      shapeEl.setAttribute('ry', '5');
    }

    shapeEl.setAttribute('fill', fill);
    shapeEl.setAttribute('stroke', stroke);
    shapeEl.setAttribute('stroke-width', '2');
    g.appendChild(shapeEl);

    if (n.type === 'sub') {
      const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line1.setAttribute('x1', x0 + 10);
      line1.setAttribute('y1', y0);
      line1.setAttribute('x2', x0 + 10);
      line1.setAttribute('y2', y0 + n.h);
      line1.setAttribute('stroke', stroke);
      line1.setAttribute('stroke-width', '1.5');
      g.appendChild(line1);

      const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line2.setAttribute('x1', x0 + n.w - 10);
      line2.setAttribute('y1', y0);
      line2.setAttribute('x2', x0 + n.w - 10);
      line2.setAttribute('y2', y0 + n.h);
      line2.setAttribute('stroke', stroke);
      line2.setAttribute('stroke-width', '1.5');
      g.appendChild(line2);
    }

    const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textEl.setAttribute('x', n.x);
    textEl.setAttribute('text-anchor', 'middle');
    textEl.setAttribute('font-size', '12.5');
    textEl.setAttribute('font-weight', '600');
    textEl.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
    textEl.setAttribute('fill', textColor);

    const tLines = n.textLines || [n.text || n.id];
    if (tLines.length === 1) {
      textEl.setAttribute('y', n.y + 4.5);
      textEl.textContent = tLines[0];
    } else {
      const lineH = 16;
      const startY = n.y - ((tLines.length - 1) * lineH) / 2 + 4.5;
      textEl.setAttribute('y', startY.toFixed(1));
      tLines.forEach((lineText, idx) => {
        const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
        tspan.setAttribute('x', n.x);
        if (idx > 0) {
          tspan.setAttribute('dy', lineH);
        }
        tspan.textContent = lineText;
        textEl.appendChild(tspan);
      });
    }
    g.appendChild(textEl);

    nodesG.appendChild(g);
  });

  svg.appendChild(nodesG);

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  pts.forEach((p) => {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  });

  const padX = 24;
  const padY = 16;
  const vbX = minX - padX;
  const vbY = minY - padY;
  const naturalW = Math.max(120, maxX - minX + padX * 2);
  const vbH = Math.max(60, maxY - minY + padY * 2);

  // 統一仕様: 極端に狭い図でも文字が巨大化しないよう最小幅 680px を中央揃えで確保
  const targetMinW = 680;
  let finalVbX = vbX;
  let finalVbW = naturalW;
  if (naturalW < targetMinW) {
    const extra = (targetMinW - naturalW) / 2;
    finalVbX = vbX - extra;
    finalVbW = targetMinW;
  }

  svg.setAttribute('viewBox', `${finalVbX.toFixed(1)} ${vbY.toFixed(1)} ${finalVbW.toFixed(1)} ${vbH.toFixed(1)}`);
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.style.maxWidth = `${finalVbW.toFixed(1)}px`;
  svg.style.margin = '0 auto';
  svg.style.display = 'block';

  container.innerHTML = '';
  container.appendChild(svg);

  if (labelText) {
    const lbl = document.createElement('div');
    lbl.className = 'chem-structure-label';
    lbl.textContent = labelText;
    container.appendChild(lbl);
  }
}
