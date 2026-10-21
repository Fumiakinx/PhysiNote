// ==========================================
// レーダーチャート（\radar ＆ tkz-kiviat 互換）パーサー ＆ SVG描画エンジン
// ==========================================

function parseRadar(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;
  let text = rawText.trim();

  // 1. \radar{...} のアンラップ
  const radarWrapperMatch = text.match(/^\\radar\{([\s\S]*)\}$/i);
  if (radarWrapperMatch) {
    text = radarWrapperMatch[1].trim();
  }

  let title = '';
  let axes = [];
  let seriesList = [];
  let maxVal = null;
  let gridCount = 5;
  let shape = 'polygon'; // 'polygon' | 'circle'
  let unit = '';
  let legendPos = 'bottom'; // 'bottom' | 'top-right' | 'top-left' | 'right' | 'none'

  // 2. tkz-kiviat 構文の検出 (\tkzKiviatDiagram & \tkzKiviatLine)
  if (text.includes('\\tkzKiviatDiagram') || text.includes('\\tkzKiviatLine')) {
    const diagMatch = text.match(/\\tkzKiviatDiagram(?:\[([^\]]*)\])?\{([^}]+)\}/i);
    if (diagMatch) {
      axes = diagMatch[2].split(',').map((s) => s.trim()).filter(Boolean);
      const diagOpts = diagMatch[1] || '';
      const radMatch = diagOpts.match(/radial\s*=\s*(\d+)/i);
      if (radMatch) gridCount = parseInt(radMatch[1], 10);
    }

    const gradMatch = text.match(/\\tkzKiviatGrad(?:\[([^\]]*)\])?/i);
    if (gradMatch) {
      const gradOpts = gradMatch[1] || '';
      const unityMatch = gradOpts.match(/unity\s*=\s*(\d+(?:\.\d+)?)/i);
      if (unityMatch) {
        const unity = parseFloat(unityMatch[1]);
        if (unity > 0) maxVal = unity * gridCount;
      }
      const unitMatch = gradOpts.match(/unit\s*=\s*([^,\]]+)/i);
      if (unitMatch) unit = unitMatch[1].trim();
    }

    const lineRegex = /\\tkzKiviatLine(?:\[([^\]]*)\])?\s*\(([^)]+)\)/gi;
    let lineMatch;
    let seriesIdx = 0;
    while ((lineMatch = lineRegex.exec(text)) !== null) {
      const opts = lineMatch[1] || '';
      const rawVals = lineMatch[2].split(',').map((v) => parseFloat(v.trim())).filter((v) => !isNaN(v));

      let name = `系列 ${seriesIdx + 1}`;
      const nameMatch = opts.match(/(?:label|name|title)\s*=\s*([^,\]]+)/i);
      if (nameMatch) name = nameMatch[1].trim().replace(/^["']|["']$/g, '');

      let color = 'primary';
      const colMatch = opts.match(/(?:color|cls)\s*=\s*([a-zA-Z0-9_#-]+)/i);
      if (colMatch) color = colMatch[1].trim();
      else if (seriesIdx === 1) color = 'accent';
      else if (seriesIdx === 2) color = 'success';
      else if (seriesIdx === 3) color = 'purple';

      const nofill = /nofill|fill\s*=\s*none|stroke-only/i.test(opts);

      seriesList.push({ name, values: rawVals, color, nofill });
      seriesIdx++;
    }
  } else {
    // 3. \radar{ ... } 簡易構文のパース
    const lines = text.split(/[\n;]+/).map((l) => l.trim()).filter(Boolean);

    lines.forEach((line) => {
      // title: タイトル名
      const titleMatch = line.match(/^title:\s*(.+)$/i);
      if (titleMatch) {
        title = titleMatch[1].trim().replace(/^["']|["']$/g, '');
        return;
      }

      // max: 最大値
      const maxMatch = line.match(/^max:\s*(\d+(?:\.\d+)?)$/i);
      if (maxMatch) {
        maxVal = parseFloat(maxMatch[1]);
        return;
      }

      // grid: グリッド分割数 または circle
      const gridMatch = line.match(/^grid:\s*(.+)$/i);
      if (gridMatch) {
        const gVal = gridMatch[1].trim();
        if (/circle|round|円/i.test(gVal)) {
          shape = 'circle';
        } else if (/^\d+$/.test(gVal)) {
          gridCount = parseInt(gVal, 10);
        }
        return;
      }

      // shape: circle / polygon
      const shapeMatch = line.match(/^(?:shape|grid-style|grid-shape):\s*(.+)$/i);
      if (shapeMatch) {
        if (/circle|round|円/i.test(shapeMatch[1])) shape = 'circle';
        else shape = 'polygon';
        return;
      }

      // unit: %
      const unitMatch = line.match(/^unit:\s*(.+)$/i);
      if (unitMatch) {
        unit = unitMatch[1].trim().replace(/^["']|["']$/g, '');
        return;
      }

      // legend: top-right / top-left / right / bottom / none
      const legMatch = line.match(/^(?:legend|legend-pos|legend-style):\s*(.+)$/i);
      if (legMatch) {
        const lVal = legMatch[1].trim().toLowerCase();
        if (/top-right|右上|box/i.test(lVal)) legendPos = 'top-right';
        else if (/top-left|左上|check/i.test(lVal)) legendPos = 'top-left';
        else if (/right|右/i.test(lVal)) legendPos = 'right';
        else if (/none|off|非表示/i.test(lVal)) legendPos = 'none';
        else legendPos = 'bottom';
        return;
      }

      // axis: 軸1, 軸2, 軸3...
      const axisMatch = line.match(/^(?:axis|axes):\s*(.+)$/i);
      if (axisMatch) {
        axes = axisMatch[1].split(',').map((s) => s.trim()).filter(Boolean);
        return;
      }

      // series: 系列名 (値1, 値2...) [options]
      const seriesMatch = line.match(/^series:\s*(.+?)\s*\(([^)]+)\)(?:\s*\[([^\]]+)\])?$/i);
      if (seriesMatch) {
        const name = seriesMatch[1].trim().replace(/^["']|["']$/g, '');
        const rawVals = seriesMatch[2].split(',').map((v) => parseFloat(v.trim())).filter((v) => !isNaN(v));
        const optStr = (seriesMatch[3] || '').trim();

        const nofill = /nofill|fill\s*:\s*none|stroke-only/i.test(optStr);
        let color = 'primary';
        const colMatch = optStr.match(/([#a-zA-Z0-9_-]+)/);
        if (colMatch && !/nofill/i.test(colMatch[1])) {
          color = colMatch[1];
        }
        seriesList.push({ name, values: rawVals, color, nofill });
      }
    });
  }

  if (axes.length < 3 || seriesList.length === 0) {
    return null;
  }

  // 自動最大値の計算
  if (!maxVal || maxVal <= 0) {
    let highest = 0;
    seriesList.forEach((s) => {
      s.values.forEach((v) => {
        if (v > highest) highest = v;
      });
    });
    if (highest <= 5) maxVal = 5;
    else if (highest <= 10) maxVal = 10;
    else if (highest <= 50) maxVal = 50;
    else if (highest <= 100) maxVal = 100;
    else maxVal = Math.ceil(highest / 10) * 10;
  }

  return {
    title,
    axes,
    seriesList,
    maxVal,
    gridCount: Math.max(gridCount, 2),
    shape,
    unit,
    legendPos
  };
}

function getRadarPalette(colorKey, nofill = false) {
  const map = {
    primary: { fill: 'rgba(2, 132, 199, 0.22)', stroke: '#0284c7', point: '#0369a1' },
    blue: { fill: 'rgba(37, 99, 235, 0.22)', stroke: '#2563eb', point: '#1d4ed8' },
    accent: { fill: 'rgba(234, 88, 12, 0.22)', stroke: '#ea580c', point: '#c2410c' },
    orange: { fill: 'rgba(249, 115, 22, 0.22)', stroke: '#f97316', point: '#ea580c' },
    success: { fill: 'rgba(22, 163, 74, 0.22)', stroke: '#16a34a', point: '#15803d' },
    green: { fill: 'rgba(34, 197, 94, 0.22)', stroke: '#22c55e', point: '#16a34a' },
    purple: { fill: 'rgba(147, 51, 234, 0.22)', stroke: '#9333ea', point: '#7e22ce' },
    danger: { fill: 'rgba(225, 29, 72, 0.22)', stroke: '#e11d48', point: '#be123c' },
    red: { fill: 'rgba(239, 68, 68, 0.22)', stroke: '#ef4444', point: '#dc2626' },
    coral: { fill: 'rgba(248, 113, 113, 0.28)', stroke: '#e05656', point: '#cc4444' },
    warning: { fill: 'rgba(217, 119, 6, 0.22)', stroke: '#d97706', point: '#b45309' },
    yellow: { fill: 'rgba(234, 179, 8, 0.25)', stroke: '#eab308', point: '#ca8a04' },
    cyan: { fill: 'rgba(6, 182, 212, 0.22)', stroke: '#06b6d4', point: '#0891b2' },
    sky: { fill: 'rgba(14, 165, 233, 0.25)', stroke: '#0ea5e9', point: '#0284c7' },
    muted: { fill: 'rgba(100, 116, 139, 0.22)', stroke: '#64748b', point: '#475569' }
  };

  let res;
  const k = (colorKey || '').toLowerCase();
  if (map[k]) {
    res = { ...map[k] };
  } else if (/^#[0-9a-f]{3,8}$/i.test(colorKey)) {
    res = { fill: colorKey + '33', stroke: colorKey, point: colorKey };
  } else {
    res = { ...map.primary };
  }

  if (nofill) {
    res.fill = 'none';
  }
  return res;
}

function drawRadarSvg(code, container, labelText) {
  container.innerHTML = '';
  const data = parseRadar(code);
  if (!data) {
    const err = document.createElement('div');
    err.className = 'chem-render-error';
    err.textContent = 'レーダーチャートの構文エラー: 3つ以上の軸と1つ以上の系列が必要です。';
    container.appendChild(err);
    return;
  }

  const { title, axes, seriesList, maxVal, gridCount, shape, unit, legendPos } = data;
  const N = axes.length;

  const width = 760;
  const height = title ? 500 : 470;
  const cx = legendPos === 'right' ? (width / 2 - 35) : (width / 2);
  const cy = title ? (legendPos === 'bottom' ? 245 : 260) : 230;
  const R = 145;

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
    tEl.setAttribute('x', legendPos === 'top-left' ? 45 : cx);
    tEl.setAttribute('y', 32);
    tEl.setAttribute('text-anchor', legendPos === 'top-left' ? 'start' : 'middle');
    tEl.setAttribute('font-size', '17');
    tEl.setAttribute('font-weight', '700');
    tEl.setAttribute('fill', '#0f172a');
    tEl.setAttribute('font-family', 'sans-serif');
    tEl.textContent = title;
    svg.appendChild(tEl);
  }

  const angleStep = (2 * Math.PI) / N;
  const getPoint = (val, idx) => {
    const r = (Math.max(val, 0) / maxVal) * R;
    const a = -Math.PI / 2 + idx * angleStep;
    return {
      x: cx + r * Math.cos(a),
      y: cy + r * Math.sin(a)
    };
  };

  // 1. グリッド描画（同心円または多角形）
  const gridGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  for (let g = 1; g <= gridCount; g++) {
    const levelVal = (maxVal / gridCount) * g;
    const r = (R / gridCount) * g;

    if (shape === 'circle') {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', cx);
      circle.setAttribute('cy', cy);
      circle.setAttribute('r', r);
      circle.setAttribute('fill', g % 2 === 0 ? '#f8fafc' : '#ffffff');
      circle.setAttribute('stroke', '#cbd5e1');
      circle.setAttribute('stroke-width', g === gridCount ? '1.5' : '1');
      gridGroup.appendChild(circle);
    } else {
      const pts = [];
      for (let i = 0; i < N; i++) {
        const p = getPoint(levelVal, i);
        pts.push(`${p.x.toFixed(1)},${p.y.toFixed(1)}`);
      }
      const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      poly.setAttribute('points', pts.join(' '));
      poly.setAttribute('fill', g % 2 === 0 ? '#f8fafc' : '#ffffff');
      poly.setAttribute('stroke', '#cbd5e1');
      poly.setAttribute('stroke-width', g === gridCount ? '1.5' : '1');
      gridGroup.appendChild(poly);
    }

    // 目盛りラベル（最上軸上）
    const topPt = getPoint(levelVal, 0);
    const tickTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    tickTxt.setAttribute('x', topPt.x + 5);
    tickTxt.setAttribute('y', topPt.y + 3);
    tickTxt.setAttribute('font-size', '10.5');
    tickTxt.setAttribute('font-weight', '600');
    tickTxt.setAttribute('fill', '#94a3b8');
    tickTxt.setAttribute('font-family', 'sans-serif');
    const valStr = Number.isInteger(levelVal) ? String(levelVal) : levelVal.toFixed(1);
    tickTxt.textContent = (g === gridCount && unit) ? `${valStr} (${unit})` : valStr;
    gridGroup.appendChild(tickTxt);
  }

  // ゼロ点表示 (0)
  const zeroTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  zeroTxt.setAttribute('x', cx + 4);
  zeroTxt.setAttribute('y', cy + 4);
  zeroTxt.setAttribute('font-size', '10.5');
  zeroTxt.setAttribute('font-weight', '600');
  zeroTxt.setAttribute('fill', '#94a3b8');
  zeroTxt.setAttribute('font-family', 'sans-serif');
  zeroTxt.textContent = '0';
  gridGroup.appendChild(zeroTxt);

  svg.appendChild(gridGroup);

  // 2. 放射軸線 & 軸ラベル
  const axisGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  axes.forEach((axisName, i) => {
    const outPt = getPoint(maxVal, i);

    // 軸線
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', cx);
    line.setAttribute('y1', cy);
    line.setAttribute('x2', outPt.x);
    line.setAttribute('y2', outPt.y);
    line.setAttribute('stroke', '#cbd5e1');
    line.setAttribute('stroke-width', '1');
    axisGroup.appendChild(line);

    // 軸ラベル
    const a = -Math.PI / 2 + i * angleStep;
    const labelDist = R + 22;
    const lx = cx + labelDist * Math.cos(a);
    const ly = cy + labelDist * Math.sin(a);

    let textAnchor = 'middle';
    if (Math.cos(a) > 0.25) textAnchor = 'start';
    else if (Math.cos(a) < -0.25) textAnchor = 'end';

    const lbl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    lbl.setAttribute('x', lx);
    lbl.setAttribute('y', ly + 4);
    lbl.setAttribute('text-anchor', textAnchor);
    lbl.setAttribute('font-size', '13');
    lbl.setAttribute('font-weight', '700');
    lbl.setAttribute('fill', '#334155');
    lbl.setAttribute('font-family', 'sans-serif');
    lbl.textContent = axisName;
    axisGroup.appendChild(lbl);
  });
  svg.appendChild(axisGroup);

  // 3. データ系列ポリゴン & ポイント
  const seriesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  seriesList.forEach((s) => {
    const pal = getRadarPalette(s.color, s.nofill);
    const pts = [];
    const ptObjects = [];

    axes.forEach((_, i) => {
      const val = s.values[i] !== undefined ? s.values[i] : 0;
      const pt = getPoint(val, i);
      pts.push(`${pt.x.toFixed(1)},${pt.y.toFixed(1)}`);
      ptObjects.push(pt);
    });

    // ポリゴン面
    const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    poly.setAttribute('points', pts.join(' '));
    poly.setAttribute('fill', pal.fill);
    poly.setAttribute('stroke', pal.stroke);
    poly.setAttribute('stroke-width', s.nofill ? '3' : '2.5');
    poly.setAttribute('stroke-linejoin', 'round');
    seriesGroup.appendChild(poly);

    // 各点マーカー
    if (!s.nofill) {
      ptObjects.forEach((pt) => {
        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dot.setAttribute('cx', pt.x);
        dot.setAttribute('cy', pt.y);
        dot.setAttribute('r', '3.5');
        dot.setAttribute('fill', pal.point);
        dot.setAttribute('stroke', '#ffffff');
        dot.setAttribute('stroke-width', '1.5');
        seriesGroup.appendChild(dot);
      });
    }
  });
  svg.appendChild(seriesGroup);

  // 4. 凡例の描画
  if (seriesList.length > 0 && legendPos !== 'none') {
    const legendGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    legendGroup.setAttribute('font-family', 'sans-serif');

    if (legendPos === 'top-right') {
      // 右上枠付きボックス凡例（画像3形式）
      const itemH = 26;
      const boxW = 150;
      const boxH = seriesList.length * itemH + 10;
      const boxX = width - boxW - 35;
      const boxY = 28;

      const frame = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      frame.setAttribute('x', boxX);
      frame.setAttribute('y', boxY);
      frame.setAttribute('width', boxW);
      frame.setAttribute('height', boxH);
      frame.setAttribute('fill', '#ffffff');
      frame.setAttribute('stroke', '#334155');
      frame.setAttribute('stroke-width', '1.2');
      legendGroup.appendChild(frame);

      seriesList.forEach((s, idx) => {
        const pal = getRadarPalette(s.color, s.nofill);
        const iy = boxY + 8 + idx * itemH;

        // カラーブロック
        const block = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        block.setAttribute('x', boxX + 8);
        block.setAttribute('y', iy);
        block.setAttribute('width', '36');
        block.setAttribute('height', '18');
        block.setAttribute('fill', pal.fill === 'none' ? pal.stroke : pal.fill);
        block.setAttribute('stroke', pal.stroke);
        block.setAttribute('stroke-width', '1.5');
        legendGroup.appendChild(block);

        // ラベル
        const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        txt.setAttribute('x', boxX + 50);
        txt.setAttribute('y', iy + 14);
        txt.setAttribute('font-size', '13');
        txt.setAttribute('font-weight', '700');
        txt.setAttribute('fill', '#1e293b');
        txt.textContent = s.name;
        legendGroup.appendChild(txt);
      });
    } else if (legendPos === 'top-left') {
      // 左上チェックボックス風凡例（画像4形式）
      const startX = 45;
      const startY = title ? 62 : 35;
      let curX = startX;

      seriesList.forEach((s) => {
        const pal = getRadarPalette(s.color, s.nofill);

        // 外枠四角
        const chkBox = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        chkBox.setAttribute('x', curX);
        chkBox.setAttribute('y', startY - 11);
        chkBox.setAttribute('width', '15');
        chkBox.setAttribute('height', '15');
        chkBox.setAttribute('rx', '2');
        chkBox.setAttribute('fill', '#ffffff');
        chkBox.setAttribute('stroke', '#64748b');
        chkBox.setAttribute('stroke-width', '1.2');
        legendGroup.appendChild(chkBox);

        // カラー四角
        const colBox = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        colBox.setAttribute('x', curX + 22);
        colBox.setAttribute('y', startY - 12);
        colBox.setAttribute('width', '17');
        colBox.setAttribute('height', '17');
        colBox.setAttribute('rx', '2');
        colBox.setAttribute('fill', pal.fill === 'none' ? pal.stroke : pal.fill);
        colBox.setAttribute('stroke', pal.stroke);
        colBox.setAttribute('stroke-width', '1.8');
        legendGroup.appendChild(colBox);

        // ラベル
        const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        txt.setAttribute('x', curX + 46);
        txt.setAttribute('y', startY + 1);
        txt.setAttribute('font-size', '13');
        txt.setAttribute('font-weight', '700');
        txt.setAttribute('fill', '#1e293b');
        txt.textContent = s.name;
        legendGroup.appendChild(txt);

        curX += s.name.length * 13 + 68;
      });
    } else if (legendPos === 'right') {
      // 右側ライン型凡例（画像5形式）
      const rx = width - 130;
      const startY = cy - ((seriesList.length - 1) * 32) / 2;

      seriesList.forEach((s, idx) => {
        const pal = getRadarPalette(s.color, s.nofill);
        const ly = startY + idx * 32;

        // ライン
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', rx);
        line.setAttribute('y1', ly);
        line.setAttribute('x2', rx + 28);
        line.setAttribute('y2', ly);
        line.setAttribute('stroke', pal.stroke);
        line.setAttribute('stroke-width', '3.5');
        legendGroup.appendChild(line);

        // ラベル
        const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        txt.setAttribute('x', rx + 36);
        txt.setAttribute('y', ly + 5);
        txt.setAttribute('font-size', '14.5');
        txt.setAttribute('font-weight', '700');
        txt.setAttribute('fill', '#0f172a');
        txt.textContent = s.name;
        legendGroup.appendChild(txt);
      });
    } else {
      // 下部標準横並び凡例（従来形式）
      const legY = height - 20;
      const totalLegWidth = seriesList.reduce((acc, s) => acc + (s.name.length * 12 + 40), 0);
      let curX = cx - totalLegWidth / 2;

      seriesList.forEach((s) => {
        const pal = getRadarPalette(s.color, s.nofill);

        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', curX);
        rect.setAttribute('y', legY - 10);
        rect.setAttribute('width', '14');
        rect.setAttribute('height', '14');
        rect.setAttribute('rx', '3');
        rect.setAttribute('fill', pal.stroke);
        legendGroup.appendChild(rect);

        const lTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        lTxt.setAttribute('x', curX + 18);
        lTxt.setAttribute('y', legY + 2);
        lTxt.setAttribute('font-size', '12.5');
        lTxt.setAttribute('font-weight', '600');
        lTxt.setAttribute('fill', '#475569');
        lTxt.textContent = s.name;
        legendGroup.appendChild(lTxt);

        curX += s.name.length * 12 + 40;
      });
    }

    svg.appendChild(legendGroup);
  }

  container.appendChild(svg);

  if (labelText) {
    const lbl = document.createElement('div');
    lbl.className = 'chem-structure-label';
    lbl.textContent = labelText;
    container.appendChild(lbl);
  }
}
