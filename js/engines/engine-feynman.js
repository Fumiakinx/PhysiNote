// ==========================================
// ファインマン・ダイアグラム構文パーサー & SVG描画エンジン
// ==========================================
function parseFeynmanDiagram(feynmanText) {
  const lines = feynmanText.split(/[\n;]+/).map((l) => l.trim()).filter(Boolean);
  const elements = [];

  lines.forEach((line) => {
    const match = line.match(/^([a-zA-Z0-9_-]+)\s*:\s*\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)\s*to\s*\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)(?:\s*(?:["']([^"']*)["']|([^\s;\[]+)))?(?:\s*\[(.*)\])?/i);
    if (match) {
      const type = match[1].toLowerCase().trim();
      const x1 = parseFloat(match[2]);
      const y1 = parseFloat(match[3]);
      const x2 = parseFloat(match[4]);
      const y2 = parseFloat(match[5]);
      let label = (match[6] || match[7] || '').trim();
      const opts = (match[8] || '').toLowerCase();

      elements.push({ type, x1, y1, x2, y2, label, opts });
    }
  });

  return elements;
}

function formatFeynmanLabel(raw) {
  if (!raw) return '';
  let str = raw.replace(/[¥￥]/g, '\\');

  // 1. 複合修飾（\bar など）を最優先で処理
  str = str
    .replace(/\\bar\{?\\nu\}?/g, 'ν̄')
    .replace(/\\bar\{?nu\}?/g, 'ν̄')
    .replace(/\\bar\{?([a-zA-Z])\}?/g, '$1̄');

  // 2. 単独ギリシャ文字・素粒子記号
  str = str
    .replace(/\\gamma/g, 'γ')
    .replace(/\\mu/g, 'μ')
    .replace(/\\nu/g, 'ν')
    .replace(/\\tau/g, 'τ')
    .replace(/\\alpha/g, 'α')
    .replace(/\\beta/g, 'β')
    .replace(/\\pi/g, 'π');

  // 3. 上付き文字（電荷・符号など）
  str = str
    .replace(/\^\{?([+-])\}?/g, (m, sign) => (sign === '+' ? '⁺' : '⁻'))
    .replace(/\^([+-])/g, (m, sign) => (sign === '+' ? '⁺' : '⁻'))
    .replace(/\^\{?0\}?/g, '⁰')
    .replace(/\^0/g, '⁰');

  // 4. 下付き文字（フレーバー・世代など）
  const subMap = {
    '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
    '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
    'e': 'ₑ', 'μ': 'ᵤ', 'mu': 'ᵤ', 'τ': 'ᵧ', 'tau': 'ᵧ'
  };
  str = str.replace(/_\{?([0-9a-zA-Zμ]+)\}?/g, (m, sub) => {
    return subMap[sub] || sub;
  });

  return str;
}

function drawFeynmanSvg(feynmanText, container, labelText) {
  container.innerHTML = '';
  const elements = parseFeynmanDiagram(feynmanText);
  if (!elements || elements.length === 0) {
    container.innerHTML = '<span style="color:#ef4444; font-size:12px;">ファインマン図の構文を解析できませんでした（例: \\feynman{ fermion: (0,30) to (50,0) "e^-"; photon: (50,0) to (120,0) "\\gamma"; }）</span>';
    return;
  }

  const strokeColor = '#1e293b';
  const strokeWidth = 2;
  const pts = [];

  elements.forEach((el) => {
    pts.push({ x: el.x1, y: el.y1 });
    pts.push({ x: el.x2, y: el.y2 });
  });

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.style.overflow = 'visible';

  function renderArrowHead(tipX, tipY, angleRad, color) {
    const len = 8.5;
    const width = 4.8;
    const x1 = tipX - len * Math.cos(angleRad) + width * Math.sin(angleRad);
    const y1 = tipY - len * Math.sin(angleRad) - width * Math.cos(angleRad);
    const x2 = tipX - len * Math.cos(angleRad) - width * Math.sin(angleRad);
    const y2 = tipY - len * Math.sin(angleRad) + width * Math.cos(angleRad);

    const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    poly.setAttribute('points', `${tipX.toFixed(1)},${tipY.toFixed(1)} ${x1.toFixed(1)},${y1.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`);
    poly.setAttribute('fill', color);
    svg.appendChild(poly);
  }

  // 1. すべての粒子線を描画（背景レイヤー）
  elements.forEach((el) => {
    const dx = el.x2 - el.x1;
    const dy = el.y2 - el.y1;
    const len = Math.hypot(dx, dy);
    if (len === 0) return;

    const ux = dx / len;
    const uy = dy / len;
    const nx = -uy;
    const ny = ux;

    const midX = (el.x1 + el.x2) / 2;
    const midY = (el.y1 + el.y2) / 2;
    const angleRad = Math.atan2(dy, dx);

    const normType = el.type.toLowerCase();

    if (normType === 'photon' || normType === 'wavy' || normType === 'boson') {
      const numWaves = Math.max(2, Math.round(len / 12));
      const halfW = len / (numWaves * 2);
      const amp = 4.2;

      let d = `M ${el.x1.toFixed(1)},${el.y1.toFixed(1)} `;
      for (let i = 0; i < numWaves * 2; i++) {
        const sign = i % 2 === 0 ? 1 : -1;
        const segStartX = el.x1 + (i * halfW) * ux;
        const segStartY = el.y1 + (i * halfW) * uy;
        const segEndX = el.x1 + ((i + 1) * halfW) * ux;
        const segEndY = el.y1 + ((i + 1) * halfW) * uy;

        const c1x = segStartX + (halfW * 0.36) * ux + sign * amp * nx;
        const c1y = segStartY + (halfW * 0.36) * uy + sign * amp * ny;
        const c2x = segEndX - (halfW * 0.36) * ux + sign * amp * nx;
        const c2y = segEndY - (halfW * 0.36) * uy + sign * amp * ny;

        d += `C ${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${segEndX.toFixed(1)},${segEndY.toFixed(1)} `;
        pts.push({ x: c1x, y: c1y });
      }

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d.trim());
      path.setAttribute('stroke', strokeColor);
      path.setAttribute('stroke-width', strokeWidth);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke-linecap', 'round');
      svg.appendChild(path);
    } else if (normType === 'gluon' || normType === 'curly') {
      const numLoops = Math.max(3, Math.round(len / 14));
      const step = len / numLoops;
      const loopR = 4.5;

      let d = `M ${el.x1.toFixed(1)},${el.y1.toFixed(1)} `;
      for (let i = 0; i < numLoops; i++) {
        const segStartX = el.x1 + i * step * ux;
        const segStartY = el.y1 + i * step * uy;
        const segEndX = el.x1 + (i + 1) * step * ux;
        const segEndY = el.y1 + (i + 1) * step * uy;

        const c1x = segStartX + step * 0.5 * ux + loopR * 1.5 * nx;
        const c1y = segStartY + step * 0.5 * uy + loopR * 1.5 * ny;
        const c2x = segEndX - step * 0.1 * ux + loopR * 1.5 * nx;
        const c2y = segEndY - step * 0.1 * uy + loopR * 1.5 * ny;

        d += `C ${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${segEndX.toFixed(1)},${segEndY.toFixed(1)} `;
        pts.push({ x: c1x, y: c1y });
      }

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d.trim());
      path.setAttribute('stroke', strokeColor);
      path.setAttribute('stroke-width', strokeWidth);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke-linecap', 'round');
      svg.appendChild(path);
    } else if (normType === 'scalar' || normType === 'higgs') {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', el.x1.toFixed(1));
      line.setAttribute('y1', el.y1.toFixed(1));
      line.setAttribute('x2', el.x2.toFixed(1));
      line.setAttribute('y2', el.y2.toFixed(1));
      line.setAttribute('stroke', strokeColor);
      line.setAttribute('stroke-width', strokeWidth);
      line.setAttribute('stroke-dasharray', '5,4');
      svg.appendChild(line);
    } else {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', el.x1.toFixed(1));
      line.setAttribute('y1', el.y1.toFixed(1));
      line.setAttribute('x2', el.x2.toFixed(1));
      line.setAttribute('y2', el.y2.toFixed(1));
      line.setAttribute('stroke', strokeColor);
      line.setAttribute('stroke-width', strokeWidth);
      svg.appendChild(line);

      const isAnti = normType === 'antifermion' || normType === 'positron' || normType.startsWith('anti');
      if (normType !== 'line') {
        const arrAngle = isAnti ? angleRad + Math.PI : angleRad;
        renderArrowHead(midX, midY, arrAngle, strokeColor);
      }
    }
  });

  // 2. 頂点（Vertex: 線の接合点）を描画
  const pointCounts = new Map();
  elements.forEach((el) => {
    const k1 = `${Math.round(el.x1)},${Math.round(el.y1)}`;
    const k2 = `${Math.round(el.x2)},${Math.round(el.y2)}`;
    pointCounts.set(k1, (pointCounts.get(k1) || 0) + 1);
    pointCounts.set(k2, (pointCounts.get(k2) || 0) + 1);
  });

  pointCounts.forEach((count, key) => {
    if (count >= 2) {
      const [vx, vy] = key.split(',').map(Number);
      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('cx', vx);
      dot.setAttribute('cy', vy);
      dot.setAttribute('r', 3);
      dot.setAttribute('fill', strokeColor);
      svg.appendChild(dot);
    }
  });

  // 3. すべてのラベル（座布団＋文字）を最前面レイヤーに描画
  elements.forEach((el) => {
    if (!el.label) return;

    const dx = el.x2 - el.x1;
    const dy = el.y2 - el.y1;
    const len = Math.hypot(dx, dy);
    if (len === 0) return;

    const ux = dx / len;
    const uy = dy / len;
    let nx = -uy;
    let ny = ux;

    // flip / below / right オプションで法線の向きを反対側に反転
    if (el.opts && (el.opts.includes('flip') || el.opts.includes('below') || el.opts.includes('right') || el.opts.includes('rev'))) {
      nx = -nx;
      ny = -ny;
    }

    const midX = (el.x1 + el.x2) / 2;
    const midY = (el.y1 + el.y2) / 2;

    const formatted = formatFeynmanLabel(el.label);
    const labelDist = 16;
    const lx = midX + nx * labelDist;
    const ly = midY + ny * labelDist;

    const tw = Math.max(formatted.length * 8.5 + 8, 18);
    const th = 17;
    const rx = lx - tw / 2;
    const ry = ly - th / 2;

    pts.push({ x: rx, y: ry });
    pts.push({ x: rx + tw, y: ry + th });

    const labelG = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bg.setAttribute('x', rx.toFixed(1));
    bg.setAttribute('y', ry.toFixed(1));
    bg.setAttribute('width', tw.toFixed(1));
    bg.setAttribute('height', th.toFixed(1));
    bg.setAttribute('rx', 4);
    bg.setAttribute('ry', 4);
    bg.setAttribute('fill', '#ffffff');
    bg.setAttribute('opacity', '0.94');
    bg.setAttribute('class', 'feynman-label-mask');
    labelG.appendChild(bg);

    const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    txt.setAttribute('x', lx.toFixed(1));
    txt.setAttribute('y', (ly + 4.5).toFixed(1));
    txt.setAttribute('text-anchor', 'middle');
    txt.setAttribute('font-size', '13');
    txt.setAttribute('font-weight', '700');
    txt.setAttribute('font-family', 'ui-monospace, SFMono-Regular, Menlo, monospace');
    txt.setAttribute('fill', '#9d174d');
    txt.setAttribute('class', 'feynman-label-text');
    txt.textContent = formatted;
    labelG.appendChild(txt);

    svg.appendChild(labelG);
  });

  const minX = Math.min(...pts.map((p) => p.x));
  const maxX = Math.max(...pts.map((p) => p.x));
  const minY = Math.min(...pts.map((p) => p.y));
  const maxY = Math.max(...pts.map((p) => p.y));

  const pad = 20;
  let w = maxX - minX;
  let h = maxY - minY;
  if (w < 80) w = 80;
  if (h < 60) h = 60;

  const vbX = minX - pad;
  const vbY = minY - pad;
  const vbW = w + pad * 2;
  const vbH = h + pad * 2;

  // 統一仕様: 極端に狭い図でも文字が巨大化しないよう最小幅 680px を中央揃えで確保
  const naturalW = vbW;
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

  container.appendChild(svg);

  if (labelText) {
    const lbl = document.createElement('div');
    lbl.className = 'chem-structure-label';
    lbl.textContent = labelText;
    container.appendChild(lbl);
  }
}
