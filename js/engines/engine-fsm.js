// ==========================================
// 状態遷移図（オートマトン）構文パーサー & SVG描画エンジン
// ==========================================
function parseFsmChart(fsmText) {
  const lines = fsmText.split(/[\n;]+/).map((l) => l.trim()).filter(Boolean);
  const statesMap = new Map();
  const transitions = [];

  lines.forEach((line) => {
    if (line.includes('->')) {
      const transMatch = line.match(/^(?:trans:?\s*)?([a-zA-Z0-9_\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]+)\s*->\s*([a-zA-Z0-9_\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]+)(?:\s*:\s*([^\[]+))?(?:\s*\[(.*)\])?$/i);
      if (transMatch) {
        const from = transMatch[1].trim();
        const to = transMatch[2].trim();
        let label = (transMatch[3] || '').trim().replace(/^["']|["']$/g, '');
        const opts = (transMatch[4] || '').toLowerCase();
        const bend = opts.includes('bend');
        transitions.push({ from, to, label, bend });

        if (!statesMap.has(from)) statesMap.set(from, { id: from, x: null, y: null, isStart: false, isAccept: false });
        if (!statesMap.has(to)) statesMap.set(to, { id: to, x: null, y: null, isStart: false, isAccept: false });
      }
    } else {
      const stateMatch = line.match(/^(?:state:?\s*)?([a-zA-Z0-9_\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]+)(?:\s*\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\))?(.*)$/i);
      if (stateMatch) {
        const id = stateMatch[1].trim();
        const x = stateMatch[2] !== undefined ? parseFloat(stateMatch[2]) : null;
        const y = stateMatch[3] !== undefined ? parseFloat(stateMatch[3]) : null;
        const flags = (stateMatch[4] || '').toLowerCase();
        const isStart = flags.includes('start') || flags.includes('init');
        const isAccept = flags.includes('accept') || flags.includes('final') || flags.includes('end');

        const existing = statesMap.get(id) || {};
        statesMap.set(id, {
          id,
          x: x !== null ? x : existing.x ?? null,
          y: y !== null ? y : existing.y ?? null,
          isStart: isStart || existing.isStart || false,
          isAccept: isAccept || existing.isAccept || false
        });
      }
    }
  });

  const states = Array.from(statesMap.values());
  let unpositionedIdx = 0;
  states.forEach((st) => {
    if (st.x === null || st.y === null) {
      st.x = unpositionedIdx * 130;
      st.y = 0;
      unpositionedIdx++;
    }
  });

  return { states, transitions };
}

function drawFsmSvg(fsmText, container, labelText) {
  container.innerHTML = '';
  const parsed = parseFsmChart(fsmText);
  const { states, transitions } = parsed;

  if (states.length === 0) {
    container.innerHTML = '<span style="color:#ef4444; font-size:12px;">状態遷移図の構文を解析できませんでした（例: \\fsm{ state: q0 start; state: q1 accept; q0 -> q1: 1; }）</span>';
    return;
  }

  const R = 23;
  const strokeColor = '#1e293b';
  const strokeWidth = 2;
  const stateLookup = new Map(states.map((s) => [s.id, s]));

  const edgePairCount = new Map();
  transitions.forEach((t) => {
    if (t.from !== t.to) {
      const key = [t.from, t.to].sort().join('___');
      edgePairCount.set(key, (edgePairCount.get(key) || 0) + 1);
    }
  });

  const pts = [];
  states.forEach((s) => {
    pts.push({ x: s.x - R - (s.isStart ? 36 : 0), y: s.y - R });
    pts.push({ x: s.x + R, y: s.y + R });
  });

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.style.overflow = 'visible';

  function renderArrowHead(tipX, tipY, angleRad, color) {
    const len = 8.5;
    const width = 5;
    const x1 = tipX - len * Math.cos(angleRad) + width * Math.sin(angleRad);
    const y1 = tipY - len * Math.sin(angleRad) - width * Math.cos(angleRad);
    const x2 = tipX - len * Math.cos(angleRad) - width * Math.sin(angleRad);
    const y2 = tipY - len * Math.sin(angleRad) + width * Math.cos(angleRad);

    const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    poly.setAttribute('points', `${tipX.toFixed(1)},${tipY.toFixed(1)} ${x1.toFixed(1)},${y1.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`);
    poly.setAttribute('fill', color);
    svg.appendChild(poly);
  }

  function renderLabel(cx, cy, text) {
    if (!text) return;
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    const tw = Math.max(text.length * 8 + 8, 16);
    const th = 16;
    const rx = cx - tw / 2;
    const ry = cy - th / 2;

    pts.push({ x: rx, y: ry });
    pts.push({ x: rx + tw, y: ry + th });

    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bg.setAttribute('x', rx);
    bg.setAttribute('y', ry);
    bg.setAttribute('width', tw);
    bg.setAttribute('height', th);
    bg.setAttribute('rx', 3);
    bg.setAttribute('ry', 3);
    bg.setAttribute('fill', '#ffffff');
    bg.setAttribute('opacity', '0.92');
    bg.setAttribute('class', 'fsm-label-mask');
    g.appendChild(bg);

    const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    txt.setAttribute('x', cx);
    txt.setAttribute('y', cy + 4);
    txt.setAttribute('text-anchor', 'middle');
    txt.setAttribute('font-size', '11.5');
    txt.setAttribute('font-weight', '600');
    txt.setAttribute('font-family', 'ui-monospace, monospace');
    txt.setAttribute('fill', '#4338ca');
    txt.setAttribute('class', 'fsm-label-text');
    txt.textContent = text;
    g.appendChild(txt);

    svg.appendChild(g);
  }

  transitions.forEach((t) => {
    const s1 = stateLookup.get(t.from);
    const s2 = stateLookup.get(t.to);
    if (!s1 || !s2) return;

    if (t.from === t.to) {
      const loopR = 26;
      const x0 = s1.x - 9;
      const y0 = s1.y - R;
      const x1 = s1.x + 9;
      const y1 = s1.y - R;

      const c1x = s1.x - loopR;
      const c1y = s1.y - R - 36;
      const c2x = s1.x + loopR;
      const c2y = s1.y - R - 36;

      pts.push({ x: c1x, y: c1y });
      pts.push({ x: c2x, y: c2y });

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', `M ${x0},${y0} C ${c1x},${c1y} ${c2x},${c2y} ${x1},${y1}`);
      path.setAttribute('stroke', strokeColor);
      path.setAttribute('stroke-width', strokeWidth);
      path.setAttribute('fill', 'none');
      svg.appendChild(path);

      renderArrowHead(x1, y1, Math.PI / 2 + 0.3, strokeColor);
      renderLabel(s1.x, s1.y - R - 30, t.label);
    } else {
      const dx = s2.x - s1.x;
      const dy = s2.y - s1.y;
      const dist = Math.hypot(dx, dy);
      if (dist === 0) return;

      const ux = dx / dist;
      const uy = dy / dist;
      const nx = -uy;
      const ny = ux;

      const key = [t.from, t.to].sort().join('___');
      const isBiDirectional = (edgePairCount.get(key) || 0) > 1;
      const shouldBend = t.bend || isBiDirectional;

      if (shouldBend) {
        // 距離に応じて十分な湾曲オフセットを確保（隣接間・中間ノード跨ぎともに重なりを完全防止）
        const bendOffset = Math.max(68, Math.round(dist * 0.48 + 16));
        const midX = (s1.x + s2.x) / 2 + nx * bendOffset;
        const midY = (s1.y + s2.y) / 2 + ny * bendOffset;

        pts.push({ x: midX, y: midY });

        const angleStart = Math.atan2(midY - s1.y, midX - s1.x);
        const pStartX = s1.x + R * Math.cos(angleStart);
        const pStartY = s1.y + R * Math.sin(angleStart);

        const angleEnd = Math.atan2(midY - s2.y, midX - s2.x);
        const pEndX = s2.x + R * Math.cos(angleEnd);
        const pEndY = s2.y + R * Math.sin(angleEnd);

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', `M ${pStartX.toFixed(1)},${pStartY.toFixed(1)} Q ${midX.toFixed(1)},${midY.toFixed(1)} ${pEndX.toFixed(1)},${pEndY.toFixed(1)}`);
        path.setAttribute('stroke', strokeColor);
        path.setAttribute('stroke-width', strokeWidth);
        path.setAttribute('fill', 'none');
        svg.appendChild(path);

        const arrowAngle = Math.atan2(pEndY - midY, pEndX - midX);
        renderArrowHead(pEndX, pEndY, arrowAngle, strokeColor);

        // ラベルを弧の外側にオフセットして線やノードとの重なりを防止
        const labelOffset = 15;
        const labelX = (pStartX + 2 * midX + pEndX) / 4 + nx * labelOffset;
        const labelY = (pStartY + 2 * midY + pEndY) / 4 + ny * labelOffset;
        pts.push({ x: labelX, y: labelY - 14 });
        pts.push({ x: labelX, y: labelY + 14 });
        renderLabel(labelX, labelY, t.label);
      } else {
        const pStartX = s1.x + ux * R;
        const pStartY = s1.y + uy * R;
        const pEndX = s2.x - ux * R;
        const pEndY = s2.y - uy * R;

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', pStartX.toFixed(1));
        line.setAttribute('y1', pStartY.toFixed(1));
        line.setAttribute('x2', pEndX.toFixed(1));
        line.setAttribute('y2', pEndY.toFixed(1));
        line.setAttribute('stroke', strokeColor);
        line.setAttribute('stroke-width', strokeWidth);
        svg.appendChild(line);

        const arrowAngle = Math.atan2(uy, ux);
        renderArrowHead(pEndX, pEndY, arrowAngle, strokeColor);

        const labelDist = 13;
        const labelX = (pStartX + pEndX) / 2 + nx * labelDist;
        const labelY = (pStartY + pEndY) / 2 + ny * labelDist;
        pts.push({ x: labelX, y: labelY - 12 });
        pts.push({ x: labelX, y: labelY + 12 });
        renderLabel(labelX, labelY, t.label);
      }
    }
  });

  states.forEach((st) => {
    const nodeG = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    if (st.isStart) {
      const arrLen = 28;
      const startX = st.x - R - arrLen;
      const endX = st.x - R;
      const startLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      startLine.setAttribute('x1', startX);
      startLine.setAttribute('y1', st.y);
      startLine.setAttribute('x2', endX);
      startLine.setAttribute('y2', st.y);
      startLine.setAttribute('stroke', strokeColor);
      startLine.setAttribute('stroke-width', strokeWidth);
      nodeG.appendChild(startLine);
      renderArrowHead(endX, st.y, 0, strokeColor);
    }

    const outerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    outerCircle.setAttribute('cx', st.x);
    outerCircle.setAttribute('cy', st.y);
    outerCircle.setAttribute('r', R);
    outerCircle.setAttribute('fill', '#ffffff');
    outerCircle.setAttribute('stroke', strokeColor);
    outerCircle.setAttribute('stroke-width', strokeWidth);
    nodeG.appendChild(outerCircle);

    if (st.isAccept) {
      const innerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      innerCircle.setAttribute('cx', st.x);
      innerCircle.setAttribute('cy', st.y);
      innerCircle.setAttribute('r', R - 4.5);
      innerCircle.setAttribute('fill', 'none');
      innerCircle.setAttribute('stroke', strokeColor);
      innerCircle.setAttribute('stroke-width', 1.8);
      nodeG.appendChild(innerCircle);
    }

    const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textEl.setAttribute('x', st.x);
    textEl.setAttribute('y', st.y + 4.5);
    textEl.setAttribute('text-anchor', 'middle');
    textEl.setAttribute('font-size', '13');
    textEl.setAttribute('font-weight', '700');
    textEl.setAttribute('font-family', 'ui-monospace, SFMono-Regular, Menlo, monospace');
    textEl.setAttribute('fill', strokeColor);
    textEl.textContent = st.id;
    nodeG.appendChild(textEl);

    svg.appendChild(nodeG);
  });

  const minX = Math.min(...pts.map((p) => p.x));
  const maxX = Math.max(...pts.map((p) => p.x));
  const minY = Math.min(...pts.map((p) => p.y));
  const maxY = Math.max(...pts.map((p) => p.y));

  const padX = 28;
  const padY = 20;
  let w = maxX - minX;
  let h = maxY - minY;
  if (w < 80) w = 80;
  if (h < 60) h = 60;

  const vbX = minX - padX;
  const vbY = minY - padY;
  const vbW = w + padX * 2;
  const vbH = h + padY * 2;

  svg.setAttribute('viewBox', `${vbX.toFixed(1)} ${vbY.toFixed(1)} ${vbW.toFixed(1)} ${vbH.toFixed(1)}`);
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.style.maxWidth = `${Math.min(Math.max(vbW * 1.25, 340), 720)}px`;
  svg.style.margin = '0 auto';
  svg.style.display = 'block';

  container.appendChild(svg);

  if (labelText) {
    const lbl = document.createElement('div');
    lbl.className = 'chem-structure-label';
    lbl.textContent = labelText;
    container.appendChild(lbl);
  }
}
