// ==========================================
// 電子回路図（CircuiTikZ風）構文パーサー & SVG描画エンジン
// ==========================================
function parseCircuiTikz(text) {
  // \circuit{...} の中身、または \begin{circuitikz}/\begin{tikzpicture} の中身・直接の \draw コマンドを抽出
  let clean = text
    .replace(/\\circuit\{([\s\S]*)\}/g, '$1')
    .replace(/\\begin\{(?:tikzpicture|circuitikz)\}(?:\[[^\]]*\])?/gi, '')
    .replace(/\\end\{(?:tikzpicture|circuitikz)\}/gi, '');
  const commands = clean.split(';').map((c) => c.trim()).filter((c) => c.length > 0);
  const elements = [];
  const loops = [];

  for (const cmd of commands) {
    if (!cmd.startsWith('\\draw')) continue;
    const rest = cmd.slice(5).trim();

    // 1. ループ電流ノードの検出: \draw (x, y) node[loop=...] または node[loop] {...}
    const loopNodeMatch = rest.match(/^\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)\s*node\s*\[([^\]]*)\](?:\s*\{([^}]*)\})?/i);
    if (loopNodeMatch) {
      const lx = parseFloat(loopNodeMatch[1]);
      const ly = parseFloat(loopNodeMatch[2]);
      const opts = loopNodeMatch[3].trim();
      const body = (loopNodeMatch[4] || '').trim();

      if (/loop|mesh/i.test(opts)) {
        let label = '';
        const eqMatch = opts.match(/(?:loop|mesh)\s*=\s*(.+)/i);
        if (eqMatch) {
          label = eqMatch[1].trim();
        } else if (body) {
          label = body;
        }
        label = label
          .replace(/\$/g, '')
          .replace(/\\text\{([^}]*)\}/g, '$1')
          .replace(/_\{([^}]+)\}/g, '_$1');

        const dir = /ccw|counter/i.test(opts) ? 'ccw' : 'cw';
        loops.push({ x: lx, y: ly, label, dir });
        continue;
      }
    }

    // 2. 通常の線分および素子
    const startMatch = rest.match(/^\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)/);
    if (!startMatch) continue;

    let curX = parseFloat(startMatch[1]);
    let curY = parseFloat(startMatch[2]);
    let remain = rest.slice(startMatch[0].length).trim();

    while (remain.length > 0) {
      let isWire = false;
      let toTypeStr = '';
      let nextX = 0;
      let nextY = 0;
      let consumedLen = 0;

      if (remain.startsWith('--')) {
        isWire = true;
        const afterWire = remain.slice(2).trim();
        const coordMatch = afterWire.match(/^\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)/);
        if (!coordMatch) break;
        nextX = parseFloat(coordMatch[1]);
        nextY = parseFloat(coordMatch[2]);
        consumedLen = 2 + (remain.length - 2 - afterWire.length) + coordMatch[0].length;
      } else if (remain.match(/^to\s*\[/)) {
        const startBracketIdx = remain.indexOf('[');
        let depth = 0;
        let endBracketIdx = -1;
        for (let i = startBracketIdx; i < remain.length; i++) {
          if (remain[i] === '[') depth++;
          else if (remain[i] === ']') {
            depth--;
            if (depth === 0) {
              endBracketIdx = i;
              break;
            }
          }
        }
        if (endBracketIdx === -1) break;
        toTypeStr = remain.slice(startBracketIdx + 1, endBracketIdx);
        const afterTo = remain.slice(endBracketIdx + 1).trim();
        const coordMatch = afterTo.match(/^\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)/);
        if (!coordMatch) break;
        nextX = parseFloat(coordMatch[1]);
        nextY = parseFloat(coordMatch[2]);
        consumedLen = (endBracketIdx + 1) + (remain.length - (endBracketIdx + 1) - afterTo.length) + coordMatch[0].length;
      } else {
        break;
      }

      let type = 'wire';
      let label = '';
      let xshift = 0;
      let yshift = 0;
      let side = null;

      if (!isWire) {
        let mainPart = toTypeStr;

        const mX = mainPart.match(/(?:^|,)\s*xshift\s*=\s*(-?\d+(?:\.\d+)?)/i);
        if (mX) {
          xshift = parseFloat(mX[1]);
          mainPart = mainPart.replace(mX[0], '');
        }

        const mY = mainPart.match(/(?:^|,)\s*yshift\s*=\s*(-?\d+(?:\.\d+)?)/i);
        if (mY) {
          yshift = parseFloat(mY[1]);
          mainPart = mainPart.replace(mY[0], '');
        }

        const mSide = mainPart.match(/(?:^|,)\s*(left|right|above|below)\b/i);
        if (mSide) {
          side = mSide[1].toLowerCase();
          mainPart = mainPart.replace(mSide[0], '');
        }
        mainPart = mainPart.replace(/^,\s*|,\s*$/g, '').trim();

        const eqIdx = mainPart.indexOf('=');
        if (eqIdx !== -1) {
          type = mainPart.slice(0, eqIdx).trim();
          let rawLabel = mainPart.slice(eqIdx + 1).trim();
          rawLabel = rawLabel
            .replace(/\$/g, '')
            .replace(/\\text\{([^}]*)\}/g, '$1')
            .replace(/\\Omega/g, 'Ω')
            .replace(/\\mu/g, 'μ')
            .replace(/_\{([^}]+)\}/g, '_$1');
          label = rawLabel;
        } else {
          type = mainPart.trim();
        }
      }

      elements.push({
        x1: curX,
        y1: curY,
        x2: nextX,
        y2: nextY,
        type: type,
        label: label,
        xshift: xshift,
        yshift: yshift,
        side: side
      });

      curX = nextX;
      curY = nextY;
      remain = remain.slice(consumedLen).trim();
    }
  }

  return { elements, loops };
}

function drawCircuitSvg(circuitText, container, labelText) {
  container.innerHTML = '';
  const parsed = parseCircuiTikz(circuitText);
  const elements = parsed ? parsed.elements : [];
  const loops = parsed ? parsed.loops : [];

  if ((!elements || elements.length === 0) && (!loops || loops.length === 0)) {
    container.innerHTML = '<span style="color:#ef4444; font-size:12px;">回路構文を解析できませんでした</span>';
    return;
  }

  // 座標変換：LaTeXのy軸（上が正）をSVGのy軸（下が正）に反転（scale: 1単位 = 75px）
  const scale = 75;
  const pts = [];

  // まず回路素子の基本端点を登録
  elements.forEach((el) => {
    pts.push({ x: el.x1 * scale, y: -el.y1 * scale });
    pts.push({ x: el.x2 * scale, y: -el.y2 * scale });
  });

  // ループ電流のバウンディングボックスも登録
  loops.forEach((lp) => {
    const cx = lp.x * scale;
    const cy = -lp.y * scale;
    pts.push({ x: cx - 35, y: cy - 35 });
    pts.push({ x: cx + 35, y: cy + 35 });
  });

  // 回路の重心を暫定計算（法線ベクトルの外向き判定用）
  const initMinX = Math.min(...pts.map((p) => p.x));
  const initMaxX = Math.max(...pts.map((p) => p.x));
  const initMinY = Math.min(...pts.map((p) => p.y));
  const initMaxY = Math.max(...pts.map((p) => p.y));
  const centerX = (initMinX + initMaxX) / 2;
  const centerY = (initMinY + initMaxY) / 2;

  // ラベル位置を事前計算し、pts にバウンディングボックスを追加（viewBox見切れ防止）
  const labelLayouts = [];
  elements.forEach((el) => {
    if (!el.label) {
      labelLayouts.push(null);
      return;
    }

    const p1 = { x: el.x1 * scale, y: -el.y1 * scale };
    const p2 = { x: el.x2 * scale, y: -el.y2 * scale };
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len = Math.hypot(dx, dy);
    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;
    const normDx = len > 0 ? dx / len : 0;
    const normDy = len > 0 ? dy / len : 0;
    const normType = el.type.toLowerCase();

    let nx = -normDy;
    let ny = normDx;
    const toOutX = midX - centerX;
    const toOutY = midY - centerY;

    if (el.side === 'left') {
      nx = -1;
      ny = 0;
    } else if (el.side === 'right') {
      nx = 1;
      ny = 0;
    } else if (el.side === 'above') {
      nx = 0;
      ny = -1;
    } else if (el.side === 'below') {
      nx = 0;
      ny = 1;
    } else if (nx * toOutX + ny * toOutY < 0) {
      nx = -nx;
      ny = -ny;
    } else if (nx * toOutX + ny * toOutY === 0) {
      if (Math.abs(normDx) >= Math.abs(normDy)) {
        if (ny > 0) { nx = -nx; ny = -ny; }
      } else {
        if (nx > 0) { nx = -nx; ny = -ny; }
      }
    }

    let offsetDist = 20;
    if (normType === 'sv' || normType === 'ac' || normType === 'battery' || normType === 'v') {
      offsetDist = 24;
    } else if (normType === 'c' || normType === 'capacitor') {
      offsetDist = 20;
    }

    let autoYShift = 0;
    // 垂直素子の場合（中点からの水平分岐線との重なりを回避するため上方に自動シフト）
    if (Math.abs(normDx) < Math.abs(normDy)) {
      autoYShift = -14;
    }
    const manualXShift = el.xshift ? el.xshift : 0;
    const manualYShift = el.yshift ? -el.yshift : 0;

    const lx = midX + nx * offsetDist + manualXShift;
    const ly = midY + ny * offsetDist + autoYShift + manualYShift;

    let textAnchor = 'middle';
    let dominantBaseline = 'central';
    if (Math.abs(nx) > Math.abs(ny)) {
      if (nx < 0) textAnchor = 'end';
      else textAnchor = 'start';
    } else {
      textAnchor = 'middle';
      if (ny < 0) dominantBaseline = 'auto';
      else dominantBaseline = 'hanging';
    }

    const lines = el.label.split(/\\n|\n/);
    const maxLineLen = Math.max(...lines.map((l) => l.length));
    const textW = Math.max(maxLineLen * 8.5 + 8, 22);
    const textH = lines.length > 1 ? lines.length * 15 + 4 : 18;

    let rx = lx - textW / 2;
    if (textAnchor === 'start') rx = lx - 2;
    else if (textAnchor === 'end') rx = lx - textW + 2;

    let ry = ly - textH / 2;
    if (dominantBaseline === 'auto') ry = ly - textH + 3;
    else if (dominantBaseline === 'hanging') ry = ly - 3;

    // バウンディングボックスを pts に登録（viewBox に反映）
    pts.push({ x: rx, y: ry });
    pts.push({ x: rx + textW, y: ry + textH });

    labelLayouts.push({ lx, ly, rx, ry, textW, textH, textAnchor, dominantBaseline, label: el.label });
  });

  // 全要素（素子＋端点＋ラベル）を含む真のバウンディングボックス
  let minX = Math.min(...pts.map((p) => p.x));
  let maxX = Math.max(...pts.map((p) => p.x));
  let minY = Math.min(...pts.map((p) => p.y));
  let maxY = Math.max(...pts.map((p) => p.y));

  const padX = 28;
  const padY = 24;
  let width = maxX - minX;
  let height = maxY - minY;
  if (width < 60) width = 60;
  if (height < 40) height = 40;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const vbX = Math.round(minX - padX);
  const vbY = Math.round(minY - padY);
  const vbW = Math.round(width + padX * 2);
  const vbH = Math.round(height + padY * 2);
  svg.setAttribute('viewBox', `${vbX} ${vbY} ${vbW} ${vbH}`);
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.style.maxWidth = `${Math.min(Math.max(vbW * 1.15, 360), 760)}px`;
  svg.style.display = 'block';
  svg.style.margin = '0 auto';
  svg.style.overflow = 'visible';

  const strokeColor = '#1e293b';
  const strokeWidth = 2.2;

  elements.forEach((el) => {
    const p1 = { x: el.x1 * scale, y: -el.y1 * scale };
    const p2 = { x: el.x2 * scale, y: -el.y2 * scale };

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len = Math.hypot(dx, dy);
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const compLen = 44;
    const halfComp = compLen / 2;
    const normType = el.type.toLowerCase();

    if (normType === 'wire' || normType === '--' || len <= compLen) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', p1.x);
      line.setAttribute('y1', p1.y);
      line.setAttribute('x2', p2.x);
      line.setAttribute('y2', p2.y);
      line.setAttribute('stroke', strokeColor);
      line.setAttribute('stroke-width', strokeWidth);
      line.setAttribute('stroke-linecap', 'round');
      g.appendChild(line);
    } else {
      const inX = midX - (halfComp * dx) / len;
      const inY = midY - (halfComp * dy) / len;
      const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line1.setAttribute('x1', p1.x);
      line1.setAttribute('y1', p1.y);
      line1.setAttribute('x2', inX);
      line1.setAttribute('y2', inY);
      line1.setAttribute('stroke', strokeColor);
      line1.setAttribute('stroke-width', strokeWidth);
      line1.setAttribute('stroke-linecap', 'round');
      g.appendChild(line1);

      const outX = midX + (halfComp * dx) / len;
      const outY = midY + (halfComp * dy) / len;
      const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line2.setAttribute('x1', outX);
      line2.setAttribute('y1', outY);
      line2.setAttribute('x2', p2.x);
      line2.setAttribute('y2', p2.y);
      line2.setAttribute('stroke', strokeColor);
      line2.setAttribute('stroke-width', strokeWidth);
      line2.setAttribute('stroke-linecap', 'round');
      g.appendChild(line2);

      const compG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      compG.setAttribute('transform', `translate(${midX}, ${midY}) rotate(${angle})`);

      if (normType === 'r' || normType === 'resistor') {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M -22,0 L -15,-8.5 L -7.5,8.5 L 0,-8.5 L 7.5,8.5 L 15,-8.5 L 22,0');
        path.setAttribute('stroke', strokeColor);
        path.setAttribute('stroke-width', strokeWidth);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke-linejoin', 'round');
        compG.appendChild(path);
      } else if (normType === 'c' || normType === 'capacitor') {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M -22,0 L -5,0 M -5,-15 L -5,15 M 5,-15 L 5,15 M 5,0 L 22,0');
        path.setAttribute('stroke', strokeColor);
        path.setAttribute('stroke-width', strokeWidth);
        path.setAttribute('fill', 'none');
        compG.appendChild(path);
      } else if (normType === 'l' || normType === 'inductor') {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M -22,0 C -22,-11 -11,-11 -11,0 C -11,-11 0,-11 0,0 C 0,-11 11,-11 11,0 C 11,-11 22,-11 22,0');
        path.setAttribute('stroke', strokeColor);
        path.setAttribute('stroke-width', strokeWidth);
        path.setAttribute('fill', 'none');
        compG.appendChild(path);
      } else if (normType === 'battery' || normType === 'v') {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M -22,0 L -5,0 M -5,-16 L -5,16 M 5,-9 L 5,9 M 5,0 L 22,0');
        path.setAttribute('stroke', strokeColor);
        path.setAttribute('stroke-width', strokeWidth);
        path.setAttribute('fill', 'none');
        compG.appendChild(path);
      } else if (normType === 'sv' || normType === 'ac' || normType === 'sinusoidal') {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', 0);
        circle.setAttribute('cy', 0);
        circle.setAttribute('r', 15);
        circle.setAttribute('stroke', strokeColor);
        circle.setAttribute('stroke-width', strokeWidth);
        circle.setAttribute('fill', '#ffffff');
        compG.appendChild(circle);

        const wave = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        wave.setAttribute('d', 'M -8.5,0 Q -4.25,-8.5 0,0 Q 4.25,8.5 8.5,0');
        wave.setAttribute('stroke', strokeColor);
        wave.setAttribute('stroke-width', strokeWidth);
        wave.setAttribute('fill', 'none');
        compG.appendChild(wave);

        const wIn = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        wIn.setAttribute('x1', -22);
        wIn.setAttribute('y1', 0);
        wIn.setAttribute('x2', -15);
        wIn.setAttribute('y2', 0);
        wIn.setAttribute('stroke', strokeColor);
        wIn.setAttribute('stroke-width', strokeWidth);
        compG.appendChild(wIn);

        const wOut = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        wOut.setAttribute('x1', 15);
        wOut.setAttribute('y1', 0);
        wOut.setAttribute('x2', 22);
        wOut.setAttribute('y2', 0);
        wOut.setAttribute('stroke', strokeColor);
        wOut.setAttribute('stroke-width', strokeWidth);
        compG.appendChild(wOut);
      } else if (normType === 'd' || normType === 'diode') {
        const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        poly.setAttribute('points', '-8,-12 10,0 -8,12');
        poly.setAttribute('fill', strokeColor);
        compG.appendChild(poly);

        const bar = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        bar.setAttribute('x1', 10);
        bar.setAttribute('y1', -12);
        bar.setAttribute('x2', 10);
        bar.setAttribute('y2', 12);
        bar.setAttribute('stroke', strokeColor);
        bar.setAttribute('stroke-width', strokeWidth);
        compG.appendChild(bar);

        const w1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        w1.setAttribute('x1', -22);
        w1.setAttribute('y1', 0);
        w1.setAttribute('x2', -8);
        w1.setAttribute('y2', 0);
        w1.setAttribute('stroke', strokeColor);
        w1.setAttribute('stroke-width', strokeWidth);
        compG.appendChild(w1);

        const w2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        w2.setAttribute('x1', 10);
        w2.setAttribute('y1', 0);
        w2.setAttribute('x2', 22);
        w2.setAttribute('y2', 0);
        w2.setAttribute('stroke', strokeColor);
        w2.setAttribute('stroke-width', strokeWidth);
        compG.appendChild(w2);
      } else if (normType === 'switch' || normType === 'sw' || normType === 'spst') {
        // スイッチ（開閉器：端子2つ、斜めレバー、投入矢印）
        const t1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        t1.setAttribute('cx', -12);
        t1.setAttribute('cy', 0);
        t1.setAttribute('r', 3.2);
        t1.setAttribute('stroke', strokeColor);
        t1.setAttribute('stroke-width', strokeWidth);
        t1.setAttribute('fill', '#ffffff');
        compG.appendChild(t1);

        const t2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        t2.setAttribute('cx', 12);
        t2.setAttribute('cy', 0);
        t2.setAttribute('r', 3.2);
        t2.setAttribute('stroke', strokeColor);
        t2.setAttribute('stroke-width', strokeWidth);
        t2.setAttribute('fill', '#ffffff');
        compG.appendChild(t2);

        const w1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        w1.setAttribute('x1', -22);
        w1.setAttribute('y1', 0);
        w1.setAttribute('x2', -15);
        w1.setAttribute('y2', 0);
        w1.setAttribute('stroke', strokeColor);
        w1.setAttribute('stroke-width', strokeWidth);
        compG.appendChild(w1);

        const w2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        w2.setAttribute('x1', 15);
        w2.setAttribute('y1', 0);
        w2.setAttribute('x2', 22);
        w2.setAttribute('y2', 0);
        w2.setAttribute('stroke', strokeColor);
        w2.setAttribute('stroke-width', strokeWidth);
        compG.appendChild(w2);

        const leverAngle = (-35 * Math.PI) / 180;
        const lx = -12 + 24 * Math.cos(leverAngle);
        const ly = 24 * Math.sin(leverAngle);
        const lever = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        lever.setAttribute('x1', -12);
        lever.setAttribute('y1', 0);
        lever.setAttribute('x2', lx.toFixed(1));
        lever.setAttribute('y2', ly.toFixed(1));
        lever.setAttribute('stroke', strokeColor);
        lever.setAttribute('stroke-width', strokeWidth);
        lever.setAttribute('stroke-linecap', 'round');
        compG.appendChild(lever);

        const arc = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        arc.setAttribute('d', 'M -3.0,-15.5 A 18 18 0 0 1 3.8,-9.0');
        arc.setAttribute('stroke', strokeColor);
        arc.setAttribute('stroke-width', 1.4);
        arc.setAttribute('fill', 'none');
        compG.appendChild(arc);

        const arrHead = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        arrHead.setAttribute('points', '5.5,-5.5 1.5,-8.0 6.0,-9.8');
        arrHead.setAttribute('fill', strokeColor);
        compG.appendChild(arrHead);
      } else if (normType === 'gnd' || normType === 'ground') {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M -18,0 L 0,0 M 0,-12 L 0,12 M 4,-8 L 4,8 M 8,-4 L 8,4');
        path.setAttribute('stroke', strokeColor);
        path.setAttribute('stroke-width', strokeWidth);
        path.setAttribute('fill', 'none');
        compG.appendChild(path);
      } else {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', -14);
        rect.setAttribute('y', -8);
        rect.setAttribute('width', 28);
        rect.setAttribute('height', 16);
        rect.setAttribute('stroke', strokeColor);
        rect.setAttribute('stroke-width', strokeWidth);
        rect.setAttribute('fill', '#ffffff');
        compG.appendChild(rect);
      }

      g.appendChild(compG);
    }

    const dot1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot1.setAttribute('cx', p1.x);
    dot1.setAttribute('cy', p1.y);
    dot1.setAttribute('r', 2.5);
    dot1.setAttribute('fill', strokeColor);
    g.appendChild(dot1);

    const dot2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot2.setAttribute('cx', p2.x);
    dot2.setAttribute('cy', p2.y);
    dot2.setAttribute('r', 2.5);
    dot2.setAttribute('fill', strokeColor);
    g.appendChild(dot2);

    svg.appendChild(g);
  });

  // ラベルレイヤー（素子・配線の上に白座布団＋文字を描画）
  elements.forEach((el, idx) => {
    const layout = labelLayouts[idx];
    if (!layout) return;

    const labelG = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    // 1. 白座布団（背景マスク）
    const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bgRect.setAttribute('x', layout.rx);
    bgRect.setAttribute('y', layout.ry);
    bgRect.setAttribute('width', layout.textW);
    bgRect.setAttribute('height', layout.textH);
    bgRect.setAttribute('fill', '#ffffff');
    bgRect.setAttribute('rx', 4);
    bgRect.setAttribute('ry', 4);
    bgRect.setAttribute('opacity', '0.92');
    bgRect.setAttribute('class', 'circuit-label-mask');
    labelG.appendChild(bgRect);

    // 2. ラベルテキスト（改行 \n 対応）
    const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textEl.setAttribute('class', 'circuit-label-text');
    textEl.setAttribute('x', layout.lx);
    textEl.setAttribute('text-anchor', layout.textAnchor);
    textEl.setAttribute('font-size', '14.5');
    textEl.setAttribute('font-weight', '700');
    textEl.setAttribute('fill', '#d97706');
    textEl.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');

    const lines = layout.label.split(/\\n|\n/);
    if (lines.length > 1) {
      const lineH = 17;
      const startY = layout.ly - ((lines.length - 1) * lineH) / 2 + 3;
      lines.forEach((line, lIdx) => {
        const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
        tspan.setAttribute('x', layout.lx);
        tspan.setAttribute('y', (startY + lIdx * lineH).toFixed(1));
        tspan.textContent = line.trim();
        textEl.appendChild(tspan);
      });
    } else {
      textEl.setAttribute('y', layout.ly);
      textEl.setAttribute('dominant-baseline', layout.dominantBaseline);
      textEl.textContent = layout.label;
    }
    labelG.appendChild(textEl);

    svg.appendChild(labelG);
  });

  // メッシュ電流（ループ電流）の描画
  loops.forEach((lp) => {
    const cx = lp.x * scale;
    const cy = -lp.y * scale;
    const R = 27;

    const loopG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    loopG.setAttribute('class', 'circuit-mesh-loop');

    const isCcw = lp.dir === 'ccw';
    const startAng = isCcw ? 0.52 : 2.35;
    const endAng = isCcw ? 2.35 : 0.52;

    const sx = cx + R * Math.cos(startAng);
    const sy = cy + R * Math.sin(startAng);
    const ex = cx + R * Math.cos(endAng);
    const ey = cy + R * Math.sin(endAng);

    const arcPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const sweepFlag = isCcw ? 0 : 1;
    arcPath.setAttribute('d', `M ${sx.toFixed(1)} ${sy.toFixed(1)} A ${R} ${R} 0 1 ${sweepFlag} ${ex.toFixed(1)} ${ey.toFixed(1)}`);
    arcPath.setAttribute('stroke', strokeColor);
    arcPath.setAttribute('stroke-width', 2);
    arcPath.setAttribute('fill', 'none');
    arcPath.setAttribute('stroke-linecap', 'round');
    loopG.appendChild(arcPath);

    const tanAng = isCcw ? endAng - Math.PI / 2 : endAng + Math.PI / 2;
    const aLen = 8;
    const aWid = 4.5;
    const tipX = ex;
    const tipY = ey;
    const p1x = tipX - aLen * Math.cos(tanAng) + aWid * Math.sin(tanAng);
    const p1y = tipY - aLen * Math.sin(tanAng) - aWid * Math.cos(tanAng);
    const p2x = tipX - aLen * Math.cos(tanAng) - aWid * Math.sin(tanAng);
    const p2y = tipY - aLen * Math.sin(tanAng) + aWid * Math.cos(tanAng);

    const arrowHead = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    arrowHead.setAttribute('points', `${tipX.toFixed(1)},${tipY.toFixed(1)} ${p1x.toFixed(1)},${p1y.toFixed(1)} ${p2x.toFixed(1)},${p2y.toFixed(1)}`);
    arrowHead.setAttribute('fill', strokeColor);
    loopG.appendChild(arrowHead);

    const loopTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    loopTxt.setAttribute('x', cx);
    loopTxt.setAttribute('y', cy + 5);
    loopTxt.setAttribute('text-anchor', 'middle');
    loopTxt.setAttribute('font-size', '15');
    loopTxt.setAttribute('font-weight', '700');
    loopTxt.setAttribute('font-style', 'italic');
    loopTxt.setAttribute('font-family', 'Georgia, "Times New Roman", serif');
    loopTxt.setAttribute('fill', strokeColor);

    if (lp.label.includes('_')) {
      const parts = lp.label.split('_');
      loopTxt.textContent = parts[0];
      const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
      tspan.setAttribute('font-size', '11');
      tspan.setAttribute('dy', '3');
      tspan.textContent = parts[1];
      loopTxt.appendChild(tspan);
    } else {
      loopTxt.textContent = lp.label || 'I';
    }
    loopG.appendChild(loopTxt);

    svg.appendChild(loopG);
  });

  container.appendChild(svg);

  if (labelText) {
    const lbl = document.createElement('div');
    lbl.className = 'chem-structure-label';
    lbl.textContent = labelText;
    container.appendChild(lbl);
  }
}
