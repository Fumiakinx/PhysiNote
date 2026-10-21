// ==========================================
// 2軸マップ・マトリクス図（ポジショニングマップ / ヒートマップ / マトリクス表）パーサー & レンダラー
// ==========================================

// --- カンマ区切り・クォート対応トークン分割ヘルパー ---
function parseCsvOrTokens(str) {
  const result = [];
  let cur = '';
  let inQuote = false;
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === '"' || ch === "'") {
      inQuote = !inQuote;
    } else if (ch === ',' && !inQuote) {
      result.push(cur.trim().replace(/^["']|["']$/g, ''));
      cur = '';
    } else {
      cur += ch;
    }
  }
  if (cur.trim()) {
    result.push(cur.trim().replace(/^["']|["']$/g, ''));
  }
  return result;
}

// --- TikZ (\begin{tikzpicture}) パーサー ---
function parseTikzMatrix(text) {
  let title = 'LaTeX TikZ 4象限ポジショニングマップ';
  let axisX = { label: '実用性', left: '嗜好性', right: '実用性' };
  let axisY = { label: '評価', bottom: '低評価', top: '高評価' };
  const quadrants = { tr: '', tl: '', br: '', bl: '' };
  const items = [];

  // タイトルコメント % title: ...
  const tMatch = text.match(/%\s*title\s*:\s*(.+)$/m);
  if (tMatch) title = tMatch[1].trim();

  // 軸ラベルの抽出
  const xRight = text.match(/--\s*\([^)]+\)\s*node\[right\]\s*\{([^}]+)\}/i);
  if (xRight) axisX.right = xRight[1].trim();

  const xLeft = text.match(/\\node\[left\]\s*at\s*\([^)]+\)\s*\{([^}]+)\}/i);
  if (xLeft) axisX.left = xLeft[1].trim();

  const yTop = text.match(/--\s*\([^)]+\)\s*node\[above\]\s*\{([^}]+)\}/i);
  if (yTop) axisY.top = yTop[1].trim();

  const yBottom = text.match(/\\node\[below\]\s*at\s*\([^)]+\)\s*\{([^}]+)\}/i);
  if (yBottom) axisY.bottom = yBottom[1].trim();

  // ノードの抽出: circleを含むノードのみをプロットアイテムとして抽出（軸ラベルの除外）
  const nodeRegex = /\\node\s*\[([^\]]*circle[^\]]*)\]\s*at\s*\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)\s*\{([^}]+)\}/gi;
  let nm;
  while ((nm = nodeRegex.exec(text)) !== null) {
    const styleStr = nm[1];
    const rawX = parseFloat(nm[2]);
    const rawY = parseFloat(nm[3]);
    const name = nm[4].trim();

    const x = Math.max(-1, Math.min(1, rawX / 3.0));
    const y = Math.max(-1, Math.min(1, rawY / 3.0));

    let styleTag = 'bubble';
    if (/red/i.test(styleStr)) styleTag += ', #e05656, r: 34';
    else if (/blue/i.test(styleStr)) styleTag += ', #408ec2, r: 30';
    else if (/green/i.test(styleStr)) styleTag += ', #8cb852, r: 25';
    else if (/orange|yellow/i.test(styleStr)) styleTag += ', #f3ba4b, r: 23';
    else styleTag += ', #408ec2, r: 28';

    items.push({ name, x, y, styleTag });
  }

  return { title, axisX, axisY, quadrants, items, isTikz: true, type: 'bubble' };
}

// --- メインパーサー ---
function parseMatrixMap(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;
  let text = rawText.trim();

  // \matrixmap{...} または \matrix{...} ラッパーのアンラップ
  const wrapperMatch = text.match(/^\\(?:matrixmap|positioning|matrix)\{([\s\S]*)\}$/i);
  if (wrapperMatch) {
    text = wrapperMatch[1].trim();
  }

  // 1. LaTeX TikZ 構文の判定
  if (/\\begin\{tikzpicture\}/i.test(text)) {
    return parseTikzMatrix(text);
  }

  // 2. マトリクス表構文 (type: schedule または header: / row:)
  const isScheduleSyntax = /type\s*:\s*(schedule|matrix-table|table)/i.test(text) || (/header\s*:/i.test(text) && /row\s*:/i.test(text));
  if (isScheduleSyntax) {
    const lines = text.split(/[\r\n;]+/).map((l) => l.trim()).filter(Boolean);
    let header = [];
    const rows = [];
    lines.forEach((l) => {
      const hMatch = l.match(/^header\s*:\s*(.+)$/i);
      if (hMatch) {
        header = parseCsvOrTokens(hMatch[1]);
        return;
      }
      const rMatch = l.match(/^row\s*:\s*(.+)$/i);
      if (rMatch) {
        rows.push(parseCsvOrTokens(rMatch[1]));
        return;
      }
    });
    return { type: 'schedule', header, rows };
  }

  // 3. Markdown 表（| ... |）の判定
  const isTableLike = text.includes('|') && text.split('\n').filter((l) => l.includes('|')).length >= 2;
  if (isTableLike) {
    return { type: 'schedule', rawText: text };
  }

  // 4. 通常の 2軸マップ / ヒートマップ構文解析
  const lines = text.split(/[\n;]+/).map((l) => l.trim()).filter(Boolean);

  let title = '';
  let type = 'standard'; // 'standard' | 'bubble' | 'heatmap'
  let axisX = { label: 'X軸', left: '', right: '', desc: '', ticks: [] };
  let axisY = { label: 'Y軸', bottom: '', top: '', desc: '', ticks: [] };
  const quadrants = { tr: '', tl: '', br: '', bl: '' };
  const items = [];

  lines.forEach((line) => {
    const typeMatch = line.match(/^type\s*:\s*([a-zA-Z0-9_-]+)/i);
    if (typeMatch) {
      type = typeMatch[1].toLowerCase();
      return;
    }

    const titleMatch = line.match(/^title\s*:\s*(.+)$/i);
    if (titleMatch) {
      title = titleMatch[1].trim().replace(/^["']|["']$/g, '');
      return;
    }

    const descXMatch = line.match(/^desc-x\s*:\s*(.+)$/i);
    if (descXMatch) {
      axisX.desc = descXMatch[1].trim().replace(/^["']|["']$/g, '');
      return;
    }

    const descYMatch = line.match(/^desc-y\s*:\s*(.+)$/i);
    if (descYMatch) {
      axisY.desc = descYMatch[1].trim().replace(/^["']|["']$/g, '');
      return;
    }

    const xMatch = line.match(/^axis-x\s*:\s*(.+)$/i);
    if (xMatch) {
      let val = xMatch[1].trim();
      const descMatch = val.match(/\[(?:desc\s*:\s*)?([^\]]+)\]/i);
      if (descMatch) {
        axisX.desc = descMatch[1].trim().replace(/^["']|["']$/g, '');
        val = val.replace(/\[(?:desc\s*:\s*)?[^\]]+\]/i, '').trim();
      }

      const parenMatch = val.match(/^([^()]+)\s*(?:\(([^()]+)\))?/);
      if (parenMatch) {
        axisX.label = parenMatch[1].trim();
        const inner = (parenMatch[2] || '').trim();
        if (inner.includes('->')) {
          const parts = inner.split('->').map((p) => p.trim());
          axisX.left = parts[0] || '';
          axisX.right = parts[1] || '';
        } else if (inner.includes(',')) {
          axisX.ticks = inner.split(',').map((t) => t.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
        } else if (inner) {
          axisX.desc = axisX.desc || inner;
        }
      } else {
        axisX.label = val;
      }
      return;
    }

    const yMatch = line.match(/^axis-y\s*:\s*(.+)$/i);
    if (yMatch) {
      let val = yMatch[1].trim();
      const descMatch = val.match(/\[(?:desc\s*:\s*)?([^\]]+)\]/i);
      if (descMatch) {
        axisY.desc = descMatch[1].trim().replace(/^["']|["']$/g, '');
        val = val.replace(/\[(?:desc\s*:\s*)?[^\]]+\]/i, '').trim();
      }

      const parenMatch = val.match(/^([^()]+)\s*(?:\(([^()]+)\))?/);
      if (parenMatch) {
        axisY.label = parenMatch[1].trim();
        const inner = (parenMatch[2] || '').trim();
        if (inner.includes('->')) {
          const parts = inner.split('->').map((p) => p.trim());
          axisY.bottom = parts[0] || '';
          axisY.top = parts[1] || '';
        } else if (inner.includes(',')) {
          axisY.ticks = inner.split(',').map((t) => t.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
        } else if (inner) {
          axisY.desc = axisY.desc || inner;
        }
      } else {
        axisY.label = val;
      }
      return;
    }

    const quadMatch = line.match(/^quadrant\s*:\s*(.+)$/i);
    if (quadMatch) {
      const val = quadMatch[1];
      const qTokens = val.split(',').map((t) => t.trim());
      qTokens.forEach((tok) => {
        const m = tok.match(/\[([^\]]+)\]\s*(.+)/);
        if (m) {
          const pos = m[1].toLowerCase();
          const name = m[2].trim().replace(/^["']|["']$/g, '');
          if (/右上|tr|top-right|1|第一/i.test(pos)) quadrants.tr = name;
          else if (/左上|tl|top-left|2|第二/i.test(pos)) quadrants.tl = name;
          else if (/左下|bl|bottom-left|3|第三/i.test(pos)) quadrants.bl = name;
          else if (/右下|br|bottom-right|4|第四/i.test(pos)) quadrants.br = name;
        }
      });
      return;
    }

    const itemLine = line.replace(/^(?:item|card)\s*:\s*/i, '');
    const coordMatch = itemLine.match(/^([^()\[\]]+)\s*\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)(?:\s*\[(.*)\])?/);
    if (coordMatch) {
      const name = coordMatch[1].trim().replace(/^["']|["']$/g, '');
      const x = parseFloat(coordMatch[2]);
      const y = parseFloat(coordMatch[3]);
      const styleTag = (coordMatch[4] || '').trim();
      items.push({ name, x, y, styleTag });
    }
  });

  return { title, type, axisX, axisY, quadrants, items };
}

// --- メイン描画ディスパッチャー ---
function drawMatrixMapSvg(mapText, container, labelText) {
  container.innerHTML = '';
  const data = parseMatrixMap(mapText);
  if (!data) {
    container.innerHTML = '<span style="color:#ef4444; font-size:12px;">2軸マップの構文を解析できませんでした</span>';
    return;
  }

  if (data.type === 'schedule') {
    drawMatrixTableHtml(data, container, labelText);
  } else if (data.type === 'heatmap') {
    drawHeatmapMatrixSvg(data, container, labelText);
  } else {
    drawStandardMatrixSvg(data, container, labelText);
  }
}

// ==========================================
// 1. 標準 & バブル型 4象限ポジショニングマップ描画
// ==========================================
function drawStandardMatrixSvg(data, container, labelText) {
  const estimateMatrixTextWidth = (str, fontSize = 12) => {
    if (!str) return 0;
    let units = 0;
    for (let i = 0; i < str.length; i++) {
      units += str.charCodeAt(i) > 0x7f ? 1.05 : 0.58;
    }
    return units * fontSize;
  };

  const isBubbleType = data.type === 'bubble';
  const leftLabelW = estimateMatrixTextWidth(data.axisX.left, 12);
  const plotLeft = Math.max(86, Math.ceil(leftLabelW + 36));
  const plotW = 460;
  const plotRight = plotLeft + plotW;

  const rightLabelW = Math.max(
    estimateMatrixTextWidth(data.axisX.label, 13),
    data.axisX.right ? estimateMatrixTextWidth(data.axisX.right, 12) : 0
  );
  const svgW = Math.max(740, Math.ceil(plotRight + 28 + rightLabelW + 32));
  const svgH = 440;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${svgW} ${svgH}`);
  svg.setAttribute('width', `${svgW}`);
  svg.setAttribute('height', `${svgH}`);
  svg.style.maxWidth = '100%';
  svg.style.height = 'auto';

  // 矢印マーカー定義
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const addArrowMarker = (id, color, orient) => {
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', id);
    marker.setAttribute('viewBox', '0 0 10 10');
    marker.setAttribute('refX', '7');
    marker.setAttribute('refY', '5');
    marker.setAttribute('markerWidth', '6.5');
    marker.setAttribute('markerHeight', '6.5');
    marker.setAttribute('orient', orient);
    const arrPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    arrPath.setAttribute('d', 'M 0 1.5 L 8 5 L 0 8.5 z');
    arrPath.setAttribute('fill', color);
    marker.appendChild(arrPath);
    defs.appendChild(marker);
  };
  addArrowMarker('matrix-arrow-fwd', '#334155', 'auto');
  addArrowMarker('matrix-arrow-rev', '#334155', 'auto-start-reverse');
  svg.appendChild(defs);

  // プロット幾何領域
  const plotTop = 70;
  const plotBottom = 370;
  const originX = (plotLeft + plotRight) / 2;
  const originY = (plotTop + plotBottom) / 2;
  const halfW = (plotRight - plotLeft) / 2;
  const halfH = (plotBottom - plotTop) / 2;

  // 象限背景四角形（非バブル時）
  if (!isBubbleType) {
    const quadConfigs = [
      { x: originX, y: plotTop, w: halfW, h: halfH, fill: '#ecfdf5', label: data.quadrants.tr, tx: plotRight - 10, ty: plotTop + 16, anchor: 'end' },
      { x: plotLeft, y: plotTop, w: halfW, h: halfH, fill: '#f0f9ff', label: data.quadrants.tl, tx: plotLeft + 10, ty: plotTop + 16, anchor: 'start' },
      { x: plotLeft, y: originY, w: halfW, h: halfH, fill: '#f8fafc', label: data.quadrants.bl, tx: plotLeft + 10, ty: plotBottom - 10, anchor: 'start' },
      { x: originX, y: originY, w: halfW, h: halfH, fill: '#fffbeb', label: data.quadrants.br, tx: plotRight - 10, ty: plotBottom - 10, anchor: 'end' }
    ];

    const quadG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    quadConfigs.forEach((q) => {
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', q.x);
      rect.setAttribute('y', q.y);
      rect.setAttribute('width', q.w);
      rect.setAttribute('height', q.h);
      rect.setAttribute('fill', q.fill);
      rect.setAttribute('stroke', '#e2e8f0');
      rect.setAttribute('stroke-width', '1');
      quadG.appendChild(rect);

      if (q.label) {
        const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        txt.setAttribute('x', q.tx);
        txt.setAttribute('y', q.ty);
        txt.setAttribute('text-anchor', q.anchor);
        txt.setAttribute('font-size', '11.5');
        txt.setAttribute('font-weight', '700');
        txt.setAttribute('fill', '#94a3b8');
        txt.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
        txt.textContent = q.label;
        quadG.appendChild(txt);
      }
    });
    svg.appendChild(quadG);
  }

  // 十字軸（両端矢印）
  const axisG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  xAxis.setAttribute('x1', plotLeft - 16);
  xAxis.setAttribute('y1', originY);
  xAxis.setAttribute('x2', plotRight + 16);
  xAxis.setAttribute('y2', originY);
  xAxis.setAttribute('stroke', '#334155');
  xAxis.setAttribute('stroke-width', '2.5');
  xAxis.setAttribute('marker-start', 'url(#matrix-arrow-rev)');
  xAxis.setAttribute('marker-end', 'url(#matrix-arrow-fwd)');
  axisG.appendChild(xAxis);

  const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  yAxis.setAttribute('x1', originX);
  yAxis.setAttribute('y1', plotBottom + 16);
  yAxis.setAttribute('x2', originX);
  yAxis.setAttribute('y2', plotTop - 16);
  yAxis.setAttribute('stroke', '#334155');
  yAxis.setAttribute('stroke-width', '2.5');
  yAxis.setAttribute('marker-start', 'url(#matrix-arrow-rev)');
  yAxis.setAttribute('marker-end', 'url(#matrix-arrow-fwd)');
  axisG.appendChild(yAxis);
  svg.appendChild(axisG);

  // 軸ラベル
  const labelG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  labelG.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');

  if (data.title) {
    const tEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    tEl.setAttribute('x', originX);
    tEl.setAttribute('y', 26);
    tEl.setAttribute('text-anchor', 'middle');
    tEl.setAttribute('font-size', '15.5');
    tEl.setAttribute('font-weight', '700');
    tEl.setAttribute('fill', '#0f172a');
    tEl.textContent = data.title;
    labelG.appendChild(tEl);
  }

  if (data.axisX.left) {
    const xl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    xl.setAttribute('x', plotLeft - 26);
    xl.setAttribute('y', originY + 5);
    xl.setAttribute('text-anchor', 'end');
    xl.setAttribute('font-size', '13.5');
    xl.setAttribute('font-weight', '700');
    xl.setAttribute('fill', '#1e293b');
    xl.textContent = data.axisX.left;
    labelG.appendChild(xl);
  }
  if (data.axisX.right || data.axisX.label) {
    const xr = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    xr.setAttribute('x', plotRight + 26);
    xr.setAttribute('y', originY + 5);
    xr.setAttribute('text-anchor', 'start');
    xr.setAttribute('font-size', '13.5');
    xr.setAttribute('font-weight', '700');
    xr.setAttribute('fill', '#1e293b');
    xr.textContent = data.axisX.right || data.axisX.label;
    labelG.appendChild(xr);
  }

  if (data.axisY.top || data.axisY.label) {
    const yt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    yt.setAttribute('x', originX);
    yt.setAttribute('y', plotTop - 25);
    yt.setAttribute('text-anchor', 'middle');
    yt.setAttribute('font-size', '13.5');
    yt.setAttribute('font-weight', '700');
    yt.setAttribute('fill', '#1e293b');
    yt.textContent = data.axisY.top || data.axisY.label;
    labelG.appendChild(yt);
  }
  if (data.axisY.bottom) {
    const yb = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    yb.setAttribute('x', originX);
    yb.setAttribute('y', plotBottom + 36);
    yb.setAttribute('text-anchor', 'middle');
    yb.setAttribute('font-size', '13.5');
    yb.setAttribute('font-weight', '700');
    yb.setAttribute('fill', '#1e293b');
    yb.textContent = data.axisY.bottom;
    labelG.appendChild(yb);
  }
  svg.appendChild(labelG);

  // プロットアイテム
  const plotG = document.createElementNS('http://www.w3.org/2000/svg', 'g');

  data.items.forEach((item) => {
    const cx = originX + Math.max(-1.0, Math.min(1.0, item.x)) * halfW;
    const cy = originY - Math.max(-1.0, Math.min(1.0, item.y)) * halfH;

    const isBubble = isBubbleType || /bubble/i.test(item.styleTag);

    let color = '#408ec2';
    const hexMatch = item.styleTag.match(/#[0-9a-fA-F]{3,8}/);
    if (hexMatch) {
      color = hexMatch[0];
    } else if (/red|danger|a社/i.test(item.styleTag + item.name)) {
      color = '#e05656';
    } else if (/green|success|b社/i.test(item.styleTag + item.name)) {
      color = '#8cb852';
    } else if (/yellow|orange|c社|warning/i.test(item.styleTag + item.name)) {
      color = '#f3ba4b';
    } else if (/blue|accent|自社|primary/i.test(item.styleTag + item.name)) {
      color = '#408ec2';
    }

    if (isBubble) {
      let r = 26;
      const rMatch = item.styleTag.match(/(?:r|size)\s*:\s*(\d+)/i);
      if (rMatch) {
        r = parseInt(rMatch[1], 10);
      } else if (/large|big|40/i.test(item.styleTag)) {
        r = 34;
      } else if (/small|24/i.test(item.styleTag)) {
        r = 23;
      }

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', cx);
      circle.setAttribute('cy', cy);
      circle.setAttribute('r', r);
      circle.setAttribute('fill', color);
      circle.setAttribute('opacity', '0.92');
      circle.setAttribute('stroke', '#ffffff');
      circle.setAttribute('stroke-width', '2.5');
      plotG.appendChild(circle);

      const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      txt.setAttribute('x', cx);
      txt.setAttribute('y', cy);
      txt.setAttribute('text-anchor', 'middle');
      txt.setAttribute('dominant-baseline', 'central');
      txt.setAttribute('fill', '#ffffff');
      txt.setAttribute('font-size', r >= 32 ? '13.5' : r >= 26 ? '12.5' : '11');
      txt.setAttribute('font-weight', '700');
      txt.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
      txt.textContent = item.name;
      plotG.appendChild(txt);
    } else {
      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('cx', cx);
      dot.setAttribute('cy', cy);
      dot.setAttribute('r', '6');
      dot.setAttribute('fill', color);
      dot.setAttribute('stroke', '#ffffff');
      dot.setAttribute('stroke-width', '2');
      plotG.appendChild(dot);

      const tw = item.name.length * 12 + 16;
      const th = 22;
      const lx = cx + 8;
      const ly = cy - 11;

      const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bg.setAttribute('x', lx);
      bg.setAttribute('y', ly);
      bg.setAttribute('width', tw);
      bg.setAttribute('height', th);
      bg.setAttribute('rx', '4');
      bg.setAttribute('fill', '#ffffff');
      bg.setAttribute('stroke', '#cbd5e1');
      bg.setAttribute('stroke-width', '1');
      plotG.appendChild(bg);

      const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      txt.setAttribute('x', lx + tw / 2);
      txt.setAttribute('y', ly + 15);
      txt.setAttribute('text-anchor', 'middle');
      txt.setAttribute('font-size', '12');
      txt.setAttribute('font-weight', '600');
      txt.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
      txt.textContent = item.name;
      plotG.appendChild(txt);
    }
  });

  svg.appendChild(plotG);
  container.appendChild(svg);

  if (labelText) {
    const lbl = document.createElement('div');
    lbl.className = 'chem-structure-label';
    lbl.textContent = labelText;
    container.appendChild(lbl);
  }
}

// ==========================================
// 2. 5×5 リスクヒートマップマトリクス描画 (画像4)
// ==========================================
function drawHeatmapMatrixSvg(data, container, labelText) {
  const svgW = 780;
  const svgH = 460;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${svgW} ${svgH}`);
  svg.setAttribute('width', `${svgW}`);
  svg.setAttribute('height', `${svgH}`);
  svg.style.maxWidth = '100%';
  svg.style.height = 'auto';

  const gridLeft = 95;
  const gridTop = data.title ? 42 : 24;
  const gridW = 520;
  const gridH = 340;
  const colW = gridW / 5;
  const rowH = gridH / 5;

  if (data.title) {
    const titleTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    titleTxt.setAttribute('x', gridLeft + gridW / 2);
    titleTxt.setAttribute('y', 24);
    titleTxt.setAttribute('text-anchor', 'middle');
    titleTxt.setAttribute('font-size', '15');
    titleTxt.setAttribute('font-weight', '700');
    titleTxt.setAttribute('fill', '#0f172a');
    titleTxt.textContent = data.title;
    svg.appendChild(titleTxt);
  }

  const cellColors = [
    ['#1a1f2c', '#2c3e55', '#49739c', '#72a0c7', '#a9c7e6'],
    ['#314d79', '#4d7bb0', '#73a5dc', '#a3c7ef', '#d2e3f5'],
    ['#4979b5', '#74a7e3', '#b3d1f7', '#f8a5a5', '#fca5a5'],
    ['#7bafe8', '#fca5a5', '#fef08a', '#fca5a5', '#f87171'],
    ['#bbf2fc', '#fca5a5', '#f87171', '#ef4444', '#b91c1c']
  ];

  // 縦軸（発生確率）ラベルと軸名
  const defaultYLabels = ['稀', '低', '中', '高', '極高'];
  const yLabels = (data.axisY && data.axisY.ticks && data.axisY.ticks.length === 5)
    ? data.axisY.ticks
    : defaultYLabels;
  const yAxisTitle = (data.axisY && data.axisY.label && data.axisY.label !== 'Y軸')
    ? data.axisY.label
    : '発生確率';
  const yAxisDesc = (data.axisY && data.axisY.desc) || '';

  // 横軸（影響度）ラベルと軸名
  const defaultXLabels = ['極小', '軽微', '中等度', '重大', '致命的'];
  const xLabels = (data.axisX && data.axisX.ticks && data.axisX.ticks.length === 5)
    ? data.axisX.ticks
    : defaultXLabels;
  const xAxisTitle = (data.axisX && data.axisX.label && data.axisX.label !== 'X軸')
    ? data.axisX.label
    : '影響度';
  const xAxisDesc = (data.axisX && data.axisX.desc) || '';

  const gridG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      const rx = gridLeft + c * colW;
      const ry = gridTop + (4 - r) * rowH;
      const fill = cellColors[r][c];

      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', rx);
      rect.setAttribute('y', ry);
      rect.setAttribute('width', colW);
      rect.setAttribute('height', rowH);
      rect.setAttribute('fill', fill);
      rect.setAttribute('stroke', '#ffffff');
      rect.setAttribute('stroke-width', '0.5');
      gridG.appendChild(rect);
    }
  }
  svg.appendChild(gridG);

  const labelG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  labelG.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Hiragino Kaku Gothic ProN", sans-serif');
  labelG.setAttribute('fill', '#334155');

  // 縦軸各行の目盛りラベル
  for (let r = 0; r < 5; r++) {
    const ly = gridTop + (4 - r) * rowH + rowH / 2;
    const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    txt.setAttribute('x', gridLeft - 10);
    txt.setAttribute('y', ly + 4);
    txt.setAttribute('text-anchor', 'end');
    txt.setAttribute('font-size', '12');
    txt.setAttribute('font-weight', '600');
    txt.setAttribute('fill', '#334155');
    txt.textContent = yLabels[r];
    labelG.appendChild(txt);
  }

  // 縦軸タイトル & 説明文（左端に配置）
  const yCenter = gridTop + gridH / 2;
  const yTitleG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  yTitleG.setAttribute('transform', `translate(26, ${yCenter}) rotate(-90)`);

  const yTitleTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  yTitleTxt.setAttribute('x', 0);
  yTitleTxt.setAttribute('y', 0);
  yTitleTxt.setAttribute('text-anchor', 'middle');
  yTitleTxt.setAttribute('font-size', '13');
  yTitleTxt.setAttribute('font-weight', '700');
  yTitleTxt.setAttribute('fill', '#0f172a');
  yTitleTxt.textContent = yAxisTitle;
  yTitleG.appendChild(yTitleTxt);

  if (yAxisDesc) {
    const yDescTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    yDescTxt.setAttribute('x', 0);
    yDescTxt.setAttribute('y', 16);
    yDescTxt.setAttribute('text-anchor', 'middle');
    yDescTxt.setAttribute('font-size', '10');
    yDescTxt.setAttribute('fill', '#64748b');
    yDescTxt.textContent = `（${yAxisDesc}）`;
    yTitleG.appendChild(yDescTxt);
  }
  labelG.appendChild(yTitleG);

  // 横軸各列の目盛りラベル
  for (let c = 0; c < 5; c++) {
    const lx = gridLeft + c * colW + colW / 2;
    const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    txt.setAttribute('x', lx);
    txt.setAttribute('y', gridTop + gridH + 22);
    txt.setAttribute('text-anchor', 'middle');
    txt.setAttribute('font-size', '12');
    txt.setAttribute('font-weight', '600');
    txt.setAttribute('fill', '#334155');
    txt.textContent = xLabels[c];
    labelG.appendChild(txt);
  }

  // 横軸タイトル & 説明文（右端外側に配置）
  const xTitleG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const xTitleTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  xTitleTxt.setAttribute('x', gridLeft + gridW + 16);
  xTitleTxt.setAttribute('y', gridTop + gridH + 18);
  xTitleTxt.setAttribute('font-size', '13');
  xTitleTxt.setAttribute('font-weight', '700');
  xTitleTxt.setAttribute('fill', '#0f172a');
  xTitleTxt.textContent = xAxisTitle;
  xTitleG.appendChild(xTitleTxt);

  if (xAxisDesc) {
    const xDescTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    xDescTxt.setAttribute('x', gridLeft + gridW + 16);
    xDescTxt.setAttribute('y', gridTop + gridH + 34);
    xDescTxt.setAttribute('font-size', '10');
    xDescTxt.setAttribute('fill', '#64748b');
    xDescTxt.textContent = `（${xAxisDesc}）`;
    xTitleG.appendChild(xDescTxt);
  }
  labelG.appendChild(xTitleG);
  svg.appendChild(labelG);

  const cardsG = document.createElementNS('http://www.w3.org/2000/svg', 'g');

  data.items.forEach((item) => {
    let cx = item.x >= 0 && item.x <= 4 ? gridLeft + item.x * colW + colW * 0.2 : gridLeft + ((item.x + 1) / 2) * gridW;
    let cy = item.y >= 0 && item.y <= 4 ? gridTop + (4 - item.y) * rowH + rowH * 0.2 : gridTop + (1 - (item.y + 1) / 2) * gridH;

    const isPink = /pink|red|coral/i.test(item.styleTag);
    const cardFill = isPink ? '#f87171' : '#fef08a';
    const cardBorder = isPink ? '#ef4444' : '#eab308';
    const lineStroke = isPink ? 'rgba(255,255,255,0.7)' : '#ca8a04';

    const cardW = 72;
    const cardH = 42;

    const cardRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    cardRect.setAttribute('x', cx);
    cardRect.setAttribute('y', cy);
    cardRect.setAttribute('width', cardW);
    cardRect.setAttribute('height', cardH);
    cardRect.setAttribute('rx', '3');
    cardRect.setAttribute('fill', cardFill);
    cardRect.setAttribute('stroke', cardBorder);
    cardRect.setAttribute('stroke-width', '1');
    cardRect.setAttribute('opacity', '0.95');
    cardsG.appendChild(cardRect);

    [-6, 2, 10].forEach((offset) => {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', cx + 12);
      line.setAttribute('y1', cy + cardH / 2 + offset);
      line.setAttribute('x2', cx + cardW - 12);
      line.setAttribute('y2', cy + cardH / 2 + offset);
      line.setAttribute('stroke', lineStroke);
      line.setAttribute('stroke-width', '2.5');
      line.setAttribute('stroke-linecap', 'round');
      cardsG.appendChild(line);
    });

    const userMatch = item.styleTag.match(/user\s*:\s*([^,\]]+)/i);
    const userName = userMatch ? userMatch[1].trim() : (item.name.length <= 6 ? item.name : '');
    if (userName) {
      const tagW = Math.max(userName.length * 7.5 + 14, 40);
      const tagH = 18;
      const tagX = cx - 10;
      const tagY = cy - 14;

      let tagBg = '#0f172a';
      if (/idris|cyan|blue/i.test(userName + item.styleTag)) tagBg = '#06b6d4';
      else if (/lizzie|pink/i.test(userName + item.styleTag)) tagBg = '#f472b6';
      else if (/rosa|purple/i.test(userName + item.styleTag)) tagBg = '#1e1b4b';

      const tagRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      tagRect.setAttribute('x', tagX);
      tagRect.setAttribute('y', tagY);
      tagRect.setAttribute('width', tagW);
      tagRect.setAttribute('height', tagH);
      tagRect.setAttribute('rx', '9');
      tagRect.setAttribute('fill', tagBg);
      cardsG.appendChild(tagRect);

      const tagTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      tagTxt.setAttribute('x', tagX + tagW / 2);
      tagTxt.setAttribute('y', tagY + 12.5);
      tagTxt.setAttribute('text-anchor', 'middle');
      tagTxt.setAttribute('fill', '#ffffff');
      tagTxt.setAttribute('font-size', '10.5');
      tagTxt.setAttribute('font-weight', '700');
      tagTxt.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
      tagTxt.textContent = userName;
      cardsG.appendChild(tagTxt);
    }
  });

  svg.appendChild(cardsG);
  container.appendChild(svg);

  if (labelText) {
    const lbl = document.createElement('div');
    lbl.className = 'chem-structure-label';
    lbl.textContent = labelText;
    container.appendChild(lbl);
  }
}

// ==========================================
// 3. 出欠・日程調整マトリクス表描画 (画像3 / 最も左の縦列に着色)
// ==========================================
function drawMatrixTableHtml(dataOrText, container, labelText) {
  container.innerHTML = '';

  let headerCells = [];
  let dataRows = [];

  if (dataOrText && dataOrText.header && dataOrText.rows) {
    headerCells = dataOrText.header;
    dataRows = dataOrText.rows;
  } else {
    const rawText = typeof dataOrText === 'string' ? dataOrText : (dataOrText.rawText || '');
    const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.includes('|'));
    if (lines.length >= 2) {
      const splitRow = (l) => {
        let s = l;
        if (s.startsWith('|')) s = s.substring(1);
        if (s.endsWith('|')) s = s.substring(0, s.length - 1);
        return s.split('|').map((c) => c.trim());
      };
      headerCells = splitRow(lines[0]);
      const startIdx = /^\|?(\s*:?-+:?\s*\|?)+$/.test(lines[1]) ? 2 : 1;
      for (let i = startIdx; i < lines.length; i++) {
        dataRows.push(splitRow(lines[i]));
      }
    }
  }

  if (headerCells.length === 0 || dataRows.length === 0) {
    container.innerHTML = '<span style="color:#ef4444; font-size:12px;">表の構文を解析できませんでした</span>';
    return;
  }

  let highlightColIdx = -1;
  headerCells.forEach((h, idx) => {
    if (/highlight|6月3日/i.test(h)) {
      highlightColIdx = idx;
    }
  });

  const wrapper = document.createElement('div');
  wrapper.style.display = 'flex';
  wrapper.style.justifyContent = 'center';
  wrapper.style.alignItems = 'center';
  wrapper.style.width = '100%';
  wrapper.style.boxSizing = 'border-box';

  const table = document.createElement('table');
  table.className = 'matrix-schedule-table';
  table.style.borderCollapse = 'collapse';
  table.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Hiragino Kaku Gothic ProN", sans-serif';
  table.style.border = '1px solid #cbd5e1';
  table.style.borderRadius = '5px';
  table.style.overflow = 'hidden';

  // THEAD
  const thead = document.createElement('thead');
  const trHead = document.createElement('tr');
  headerCells.forEach((cellText, idx) => {
    const th = document.createElement('th');
    const isHighlight = idx === highlightColIdx;
    const isFirstCol = idx === 0;
    const cleanText = cellText.replace(/\[highlight\]/i, '').trim();

    th.textContent = cleanText;
    th.style.padding = '8px 10px';
    th.style.border = '1px solid #cbd5e1';
    th.style.textAlign = 'center';
    th.style.fontSize = '14px';
    th.style.fontWeight = '700';

    if (isHighlight) {
      th.style.background = '#3d8b80'; // 確定候補日（ティールグリーン）
      th.style.color = '#ffffff';
    } else if (isFirstCol) {
      th.style.background = '#ececec'; // 最左列ヘッダー（薄グレー）
      th.style.color = '#0f172a';
    } else {
      th.style.background = '#f1f5f9';
      th.style.color = '#0f172a';
    }
    trHead.appendChild(th);
  });
  thead.appendChild(trHead);
  table.appendChild(thead);

  // TBODY
  const tbody = document.createElement('tbody');
  dataRows.forEach((row) => {
    const tr = document.createElement('tr');
    row.forEach((cellText, idx) => {
      const td = document.createElement('td');
      const isHighlight = idx === highlightColIdx;
      const isFirstCol = idx === 0;

      td.textContent = cellText;
      td.style.padding = '8px 10px';
      td.style.border = '1px solid #cbd5e1';
      td.style.textAlign = isFirstCol ? 'left' : 'center';

      if (isFirstCol) {
        // 最も左の縦列に着色（薄グレー #ececec）
        td.style.fontWeight = '700';
        td.style.fontSize = '14px';
        td.style.color = '#0f172a';
        td.style.background = '#ececec';
        td.style.paddingLeft = '14px';
        td.style.paddingRight = '14px';
      } else {
        td.style.fontSize = '18px';
        td.style.color = '#334155';
        td.style.background = isHighlight ? '#e6f3f0' : '#ffffff';
      }
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  wrapper.appendChild(table);
  container.appendChild(wrapper);

  if (labelText) {
    const lbl = document.createElement('div');
    lbl.className = 'chem-structure-label';
    lbl.textContent = labelText;
    container.appendChild(lbl);
  }
}
