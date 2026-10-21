// ==========================================
// ピラミッド図・階層図 パーサー & レンダラー
// ==========================================

// --- smartdiagram 階層構文パーサー ---
function parseSmartdiagramPyramid(text) {
  let title = 'LaTeX smartdiagram 階層ピラミッド';
  const layers = [];

  const tMatch = text.match(/%\s*title\s*:\s*(.+)$/m);
  if (tMatch) title = tMatch[1].trim();

  // \smartdiagram[...]{ 項目1/説明1, 項目2/説明2, ... }
  const bodyMatch = text.match(/\\smartdiagram\s*(?:\[[^\]]*\])?\s*\{([\s\S]*?)\}/i);
  if (bodyMatch) {
    const rawItems = bodyMatch[1].split(/[\r\n,]+/).map((s) => s.trim()).filter(Boolean);
    const colors = ['#f59e0b', '#ea580c', '#2563eb', '#0891b2', '#059669', '#6366f1'];
    rawItems.forEach((itemStr, i) => {
      const parts = itemStr.split('/').map((p) => p.trim());
      const name = parts[0] || '';
      const note = parts[1] || '';
      if (name) {
        layers.push({ name, note, styleTag: colors[i % colors.length] });
      }
    });
  }

  return { title, layers, type: 'standard' };
}

// --- メインパーサー ---
function parsePyramid(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;
  let text = rawText.trim();

  // \pyramid{...} または \hierarchy{...} のアンラップ
  const wrapperMatch = text.match(/^\\(?:pyramid|hierarchy)\{([\s\S]*)\}$/i);
  if (wrapperMatch) {
    text = wrapperMatch[1].trim();
  }

  // 1. LaTeX smartdiagram 構文の判定
  if (/\\smartdiagram/i.test(text)) {
    return parseSmartdiagramPyramid(text);
  }

  const lines = text.split(/[\n;]+/).map((l) => l.trim()).filter(Boolean);

  let title = '';
  let type = 'standard'; // 'standard' | 'wing' (画像2のブロックウィング型)
  const layers = [];

  lines.forEach((line) => {
    // タイプ指定 (type: wing / block)
    const typeMatch = line.match(/^type\s*:\s*([a-zA-Z0-9_-]+)/i);
    if (typeMatch) {
      type = typeMatch[1].toLowerCase();
      return;
    }

    // タイトル
    const titleMatch = line.match(/^title\s*:\s*(.+)$/i);
    if (titleMatch) {
      title = titleMatch[1].trim().replace(/^["']|["']$/g, '');
      return;
    }

    // 階層定義 (例: layer: "1級" [#2b63b8] (・プロ向け\n・内容の十分な理解・技能);)
    let rest = line.replace(/^(?:layer|level|step)\s*:\s*/i, '').trim();
    let styleTag = '';

    const tagMatch = rest.match(/\[([^\]]+)\]/);
    if (tagMatch) {
      styleTag = tagMatch[1].trim();
      rest = rest.replace(/\[([^\]]+)\]/, '').trim();
    }

    let note = '';
    const noteMatch = rest.match(/\(([^)]+)\)/);
    if (noteMatch) {
      note = noteMatch[1].trim().replace(/^["']|["']$/g, '');
      rest = rest.replace(/\(([^)]+)\)/, '').trim();
    }

    const name = rest.trim().replace(/^["']|["']$/g, '');
    if (name) {
      layers.push({ name, note, styleTag });
    }
  });

  return { title, type, layers };
}

// --- メイン描画ディスパッチャー ---
function drawPyramidSvg(pyramidText, container, labelText) {
  container.innerHTML = '';
  const data = parsePyramid(pyramidText);
  if (!data || data.layers.length === 0) {
    container.innerHTML = '<span style="color:#ef4444; font-size:12px;">ピラミッド図の構文を解析できませんでした</span>';
    return;
  }

  if (data.type === 'wing' || data.type === 'block' || data.type === 'split') {
    drawWingPyramidSvg(data, container, labelText);
  } else {
    drawStandardPyramidSvg(data, container, labelText);
  }
}

// ==========================================
// 1. ブロックウィング型ピラミッド描画 (画像2)
// ==========================================
function drawWingPyramidSvg(data, container, labelText) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const svgW = 740;
  const svgH = 430;
  svg.setAttribute('viewBox', `0 0 ${svgW} ${svgH}`);
  svg.setAttribute('width', `${svgW}`);
  svg.setAttribute('height', `${svgH}`);
  svg.style.maxWidth = '100%';
  svg.style.height = 'auto';

  // タイトル
  if (data.title) {
    const tEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    tEl.setAttribute('x', svgW / 2);
    tEl.setAttribute('y', 26);
    tEl.setAttribute('text-anchor', 'middle');
    tEl.setAttribute('font-size', '16');
    tEl.setAttribute('font-weight', '700');
    tEl.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
    tEl.setAttribute('fill', '#0f172a');
    tEl.textContent = data.title;
    svg.appendChild(tEl);
  }

  // 幾何パラメータ
  const N = data.layers.length;
  const pyrTopY = data.title ? 45 : 30;
  const pyrBottomY = 410;
  const totalH = pyrBottomY - pyrTopY;
  const pyrCenterX = 180;
  const baseW = 260; // ピラミッド底辺幅 (左右130ずつ: X=50〜310)
  const wingEndX = 680; // 右ブロック右端X

  // 青のグラデーションパレット（上ほど濃く、下ほど淡い）
  const blueShades = ['#2f6bbd', '#427ecc', '#6399dc', '#8bb6ea', '#b4d1f5'];

  const layersG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const wingsG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const textG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  textG.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Hiragino Kaku Gothic ProN", sans-serif');

  data.layers.forEach((layer, i) => {
    const t0 = i / N;
    const t1 = (i + 1) / N;

    const y0 = pyrTopY + t0 * totalH;
    const y1 = pyrTopY + t1 * totalH;
    const w0 = t0 * baseW;
    const w1 = t1 * baseW;

    const leftX0 = pyrCenterX - w0 / 2;
    const rightX0 = pyrCenterX + w0 / 2;
    const leftX1 = pyrCenterX - w1 / 2;
    const rightX1 = pyrCenterX + w1 / 2;

    // カラー判定
    let color = blueShades[i % blueShades.length];
    const hexMatch = layer.styleTag.match(/#[0-9a-fA-F]{3,8}/);
    if (hexMatch) {
      color = hexMatch[0];
    } else if (/gold|yellow/i.test(layer.styleTag)) color = '#f59e0b';
    else if (/red|accent/i.test(layer.styleTag)) color = '#e11d48';
    else if (/green/i.test(layer.styleTag)) color = '#059669';

    // 1. ピラミッド形状（頂点三角形 または 台形）
    const pyrPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    let pyrD = '';
    if (i === 0) {
      pyrD = `M ${pyrCenterX} ${y0.toFixed(1)} L ${rightX1.toFixed(1)} ${y1.toFixed(1)} L ${leftX1.toFixed(1)} ${y1.toFixed(1)} Z`;
    } else {
      pyrD = `M ${leftX0.toFixed(1)} ${y0.toFixed(1)} L ${rightX0.toFixed(1)} ${y0.toFixed(1)} L ${rightX1.toFixed(1)} ${y1.toFixed(1)} L ${leftX1.toFixed(1)} ${y1.toFixed(1)} Z`;
    }
    pyrPath.setAttribute('d', pyrD);
    pyrPath.setAttribute('fill', color);
    pyrPath.setAttribute('stroke', '#ffffff');
    pyrPath.setAttribute('stroke-width', '1.5');
    layersG.appendChild(pyrPath);

    // 2. 右側ブロック（ピラミッド右辺から水平に伸びる長方形ブロック）
    const wingPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    let wingD = '';
    if (i === 0) {
      wingD = `M ${pyrCenterX} ${y0.toFixed(1)} L ${wingEndX} ${y0.toFixed(1)} L ${wingEndX} ${y1.toFixed(1)} L ${rightX1.toFixed(1)} ${y1.toFixed(1)} Z`;
    } else {
      wingD = `M ${rightX0.toFixed(1)} ${y0.toFixed(1)} L ${wingEndX} ${y0.toFixed(1)} L ${wingEndX} ${y1.toFixed(1)} L ${rightX1.toFixed(1)} ${y1.toFixed(1)} Z`;
    }
    wingPath.setAttribute('d', wingD);
    wingPath.setAttribute('fill', '#e6eef8'); // 淡い水色背景
    wingPath.setAttribute('stroke', '#a6c4e8');
    wingPath.setAttribute('stroke-width', '1');
    wingsG.appendChild(wingPath);

    const midY = (y0 + y1) / 2;

    // 3. ピラミッド内ラベル（太字白文字「1級」「2級」など）
    const badgeText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    badgeText.setAttribute('x', pyrCenterX);
    badgeText.setAttribute('y', (midY + 7).toFixed(1));
    badgeText.setAttribute('text-anchor', 'middle');
    badgeText.setAttribute('fill', '#ffffff');
    badgeText.setAttribute('font-weight', '800');
    badgeText.setAttribute('font-size', N >= 5 ? '18' : '22');
    badgeText.textContent = layer.name;
    textG.appendChild(badgeText);

    // 4. 右側詳細テキスト（箇条書き）
    if (layer.note) {
      // 改行対応 (\n または bullet で分割)
      const noteLines = layer.note.split(/\\n|\n/).map((s) => s.trim()).filter(Boolean);
      const textStartX = Math.max(rightX1 + 25, 340);
      const totalLines = noteLines.length;
      const lineH = 20;
      const startTextY = midY - ((totalLines - 1) * lineH) / 2 + 5;

      noteLines.forEach((nLine, lineIdx) => {
        const lineEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        lineEl.setAttribute('x', textStartX);
        lineEl.setAttribute('y', (startTextY + lineIdx * lineH).toFixed(1));
        lineEl.setAttribute('fill', '#1e293b');
        lineEl.setAttribute('font-size', '14.5');
        lineEl.setAttribute('font-weight', '700');
        lineEl.textContent = nLine;
        textG.appendChild(lineEl);
      });
    }
  });

  svg.appendChild(wingsG);
  svg.appendChild(layersG);
  svg.appendChild(textG);
  container.appendChild(svg);

  if (labelText) {
    const lbl = document.createElement('div');
    lbl.className = 'chem-structure-label';
    lbl.textContent = labelText;
    container.appendChild(lbl);
  }
}

// ==========================================
// 2. 標準ピラミッド階層図描画 (引き出し線付き)
// ==========================================
function drawStandardPyramidSvg(data, container, labelText) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const svgW = 740;
  const svgH = 430;
  svg.setAttribute('viewBox', `0 0 ${svgW} ${svgH}`);
  svg.setAttribute('width', `${svgW}`);
  svg.setAttribute('height', `${svgH}`);
  svg.style.maxWidth = '100%';
  svg.style.height = 'auto';

  const pyrCenterX = 210;
  const topY = data.title ? 60 : 40;
  const bottomY = 405;
  const totalH = bottomY - topY;
  const baseW = 280;
  const N = data.layers.length;
  const layerH = totalH / N;
  const gap = N > 5 ? 2 : 3;

  const defaultColors = [
    '#f59e0b',
    '#ea580c',
    '#2563eb',
    '#0891b2',
    '#059669',
    '#6366f1',
    '#64748b'
  ];

  if (data.title) {
    const tEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    tEl.setAttribute('x', svgW / 2);
    tEl.setAttribute('y', 32);
    tEl.setAttribute('text-anchor', 'middle');
    tEl.setAttribute('font-size', '16');
    tEl.setAttribute('font-weight', '700');
    tEl.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
    tEl.setAttribute('fill', '#0f172a');
    tEl.textContent = data.title;
    svg.appendChild(tEl);
  }

  const layersG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const labelsG = document.createElementNS('http://www.w3.org/2000/svg', 'g');

  data.layers.forEach((layer, i) => {
    const t0 = i / N;
    const t1 = (i + 1) / N;

    const y0 = topY + t0 * totalH + (i > 0 ? gap / 2 : 0);
    const y1 = topY + t1 * totalH - (i < N - 1 ? gap / 2 : 0);
    const w0 = t0 * baseW;
    const w1 = t1 * baseW;

    let color = defaultColors[i % defaultColors.length];
    if (/gold|yellow/i.test(layer.styleTag)) color = '#f59e0b';
    else if (/accent|red|rose|danger/i.test(layer.styleTag)) color = '#e11d48';
    else if (/primary|blue/i.test(layer.styleTag)) color = '#2563eb';
    else if (/success|green|emerald/i.test(layer.styleTag)) color = '#059669';
    else if (/warning|orange/i.test(layer.styleTag)) color = '#ea580c';
    else if (/purple|violet/i.test(layer.styleTag)) color = '#8b5cf6';
    else if (/muted|gray|slate/i.test(layer.styleTag)) color = '#64748b';
    else if (/cyan|teal/i.test(layer.styleTag)) color = '#0891b2';

    const hexMatch = layer.styleTag.match(/#[0-9a-fA-F]{3,8}/);
    if (hexMatch) color = hexMatch[0];

    const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    let d = '';
    let rightEdgeX = 0;
    if (i === 0) {
      d = `M ${pyrCenterX} ${y0.toFixed(1)} L ${(pyrCenterX + w1 / 2).toFixed(1)} ${y1.toFixed(1)} L ${(pyrCenterX - w1 / 2).toFixed(1)} ${y1.toFixed(1)} Z`;
      rightEdgeX = pyrCenterX + w1 / 4;
    } else {
      d = `M ${(pyrCenterX - w0 / 2).toFixed(1)} ${y0.toFixed(1)} L ${(pyrCenterX + w0 / 2).toFixed(1)} ${y0.toFixed(1)} L ${(pyrCenterX + w1 / 2).toFixed(1)} ${y1.toFixed(1)} L ${(pyrCenterX - w1 / 2).toFixed(1)} ${y1.toFixed(1)} Z`;
      rightEdgeX = pyrCenterX + (w0 + w1) / 4;
    }
    pathEl.setAttribute('d', d);
    pathEl.setAttribute('fill', color);
    pathEl.setAttribute('stroke', '#ffffff');
    pathEl.setAttribute('stroke-width', '1.5');
    layersG.appendChild(pathEl);

    const midY = (y0 + y1) / 2;

    const badgeText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    badgeText.setAttribute('x', pyrCenterX);
    badgeText.setAttribute('y', (midY + 4.5).toFixed(1));
    badgeText.setAttribute('text-anchor', 'middle');
    badgeText.setAttribute('fill', '#ffffff');
    badgeText.setAttribute('font-weight', '800');
    badgeText.setAttribute('font-size', N > 5 ? '12' : '13');
    badgeText.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
    badgeText.textContent = (i + 1).toString();
    layersG.appendChild(badgeText);

    const lineX0 = rightEdgeX + 8;
    const lineX1 = 375;
    const textStartX = 390;

    const guideLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    guideLine.setAttribute('x1', lineX0.toFixed(1));
    guideLine.setAttribute('y1', midY.toFixed(1));
    guideLine.setAttribute('x2', lineX1.toFixed(1));
    guideLine.setAttribute('y2', midY.toFixed(1));
    guideLine.setAttribute('stroke', '#cbd5e1');
    guideLine.setAttribute('stroke-width', '1.2');
    guideLine.setAttribute('stroke-dasharray', '2 2');
    labelsG.appendChild(guideLine);

    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('cx', lineX0.toFixed(1));
    dot.setAttribute('cy', midY.toFixed(1));
    dot.setAttribute('r', '2.5');
    dot.setAttribute('fill', color);
    labelsG.appendChild(dot);

    const textG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    textG.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');

    const nameEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    nameEl.setAttribute('x', textStartX);
    nameEl.setAttribute('text-anchor', 'start');
    nameEl.setAttribute('font-weight', '700');
    nameEl.setAttribute('fill', '#0f172a');
    nameEl.setAttribute('font-size', N > 5 ? '12' : '13.5');

    if (layer.note && layerH >= 32) {
      nameEl.setAttribute('y', (midY - 3).toFixed(1));
      nameEl.textContent = layer.name;
      textG.appendChild(nameEl);

      const noteEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      noteEl.setAttribute('x', textStartX);
      noteEl.setAttribute('y', (midY + 13).toFixed(1));
      noteEl.setAttribute('text-anchor', 'start');
      noteEl.setAttribute('fill', '#64748b');
      noteEl.setAttribute('font-size', N > 5 ? '10.5' : '11.5');
      noteEl.setAttribute('font-weight', '500');
      noteEl.textContent = layer.note;
      textG.appendChild(noteEl);
    } else {
      nameEl.setAttribute('y', (midY + 4.5).toFixed(1));
      nameEl.textContent = layer.note ? `${layer.name} (${layer.note})` : layer.name;
      textG.appendChild(nameEl);
    }

    labelsG.appendChild(textG);
  });

  svg.appendChild(layersG);
  svg.appendChild(labelsG);
  container.appendChild(svg);

  if (labelText) {
    const lbl = document.createElement('div');
    lbl.className = 'chem-structure-label';
    lbl.textContent = labelText;
    container.appendChild(lbl);
  }
}
