// ==========================================
// ウォーターフォール図（\waterfall 滝グラフ / 増減要因分析）パーサー ＆ SVG描画エンジン
// ==========================================

function parseWaterfall(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;
  let text = rawText.trim();

  // 1. \waterfall{...} のアンラップ
  const wrapperMatch = text.match(/^\\waterfall\{([\s\S]*)\}$/i);
  if (wrapperMatch) {
    text = wrapperMatch[1].trim();
  }

  let title = '';
  let unit = '';
  let style = 'standard'; // 'standard' | 'block'
  let theme = 'default'; // 'default' | 'classic' | 'orange-red'
  let valPos = 'auto'; // 'auto' | 'inside' | 'outside'
  let negativeFormat = 'minus'; // 'minus' | 'paren'
  const rawBars = [];

  // 2. LaTeX pgfplots 構文の検出 (\begin{axis}[ybar stacked] 等)
  if (text.includes('\\begin{axis}') || text.includes('ybar stacked') || text.includes('symbolic x coords')) {
    const titleMatch = text.match(/title\s*=\s*\{?([^,}\]]+)\}?/i);
    if (titleMatch) title = titleMatch[1].trim();

    const coordsMatch = text.match(/symbolic x coords\s*=\s*\{([^}]+)\}/i);
    const labels = coordsMatch ? coordsMatch[1].split(',').map((s) => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean) : [];

    const addplotRegex = /\\addplot(?:\[([^\]]*)\])?\s*coordinates\s*\{([^}]+)\}/gi;
    let apMatch;
    const itemMap = {};
    while ((apMatch = addplotRegex.exec(text)) !== null) {
      const opts = apMatch[1] || '';
      const coordStr = apMatch[2];
      let pType = 'total';
      if (/green|emerald|inc|plus/i.test(opts)) pType = 'increase';
      else if (/red|rose|dec|minus/i.test(opts)) pType = 'decrease';
      else if (/blue|cyan|total/i.test(opts)) pType = 'total';

      const pairRegex = /\(([^,]+),\s*(-?\d+(?:\.\d+)?)\)/g;
      let pr;
      while ((pr = pairRegex.exec(coordStr)) !== null) {
        const lbl = pr[1].trim();
        const v = parseFloat(pr[2]);
        itemMap[lbl] = { val: v, type: pType };
      }
    }

    if (labels.length > 0) {
      labels.forEach((lbl, idx) => {
        const info = itemMap[lbl] || { val: 0, type: (idx === 0 || idx === labels.length - 1) ? 'total' : 'increase' };
        rawBars.push({ label: lbl, valStr: String(info.val), typeOpt: info.type });
      });
    } else {
      Object.keys(itemMap).forEach((lbl) => {
        const info = itemMap[lbl];
        rawBars.push({ label: lbl, valStr: String(info.val), typeOpt: info.type });
      });
    }
  } else if (text.includes('\\draw') && text.includes('rectangle')) {
    // 3. LaTeX TikZ ネイティブ矩形構文 (\draw[...] (x,y) rectangle (x,y) node[...] {...})
    const drawRegex = /\\draw(?:\[([^\]]*)\])?\s*\(([^)]+)\)\s*rectangle\s*\(([^)]+)\)(?:\s*node[^{]*\{([^}]+)\})?/gi;
    let dMatch;
    while ((dMatch = drawRegex.exec(text)) !== null) {
      const opts = dMatch[1] || '';
      const p1 = dMatch[2].split(',').map((v) => parseFloat(v.trim()));
      const p2 = dMatch[3].split(',').map((v) => parseFloat(v.trim()));
      const rawNodeText = (dMatch[4] || '').trim();

      const y1 = p1[1] || 0;
      const y2 = p2[1] || 0;
      const diff = y2 - y1;

      let pType = 'total';
      if (/green|inc|plus/i.test(opts)) pType = 'increase';
      else if (/red|dec|minus/i.test(opts)) pType = 'decrease';

      let labelText = rawNodeText;
      let valStr = String(Math.abs(diff));
      if (rawNodeText.includes(' ')) {
        const parts = rawNodeText.split(' ');
        labelText = parts[0];
        valStr = parts.slice(1).join(' ').replace(/[+]/g, '');
      }

      rawBars.push({ label: labelText || `要因 ${rawBars.length + 1}`, valStr, typeOpt: pType });
    }
  } else {
    // 4. 標準 \waterfall 簡易構文
    const lines = text.split(/[\n;]+/).map((l) => l.trim()).filter(Boolean);

    lines.forEach((line) => {
      // title: タイトル名
      const titleMatch = line.match(/^title:\s*(.+)$/i);
      if (titleMatch) {
        title = titleMatch[1].trim().replace(/^["']|["']$/g, '');
        return;
      }

      // unit: 単位
      const unitMatch = line.match(/^unit:\s*(.+)$/i);
      if (unitMatch) {
        unit = unitMatch[1].trim().replace(/^["']|["']$/g, '');
        return;
      }

      // style / layout: block | compact | standard
      const styleMatch = line.match(/^(?:style|layout):\s*(.+)$/i);
      if (styleMatch) {
        const s = styleMatch[1].trim().toLowerCase();
        if (/block|compact|bridge|密着/i.test(s)) {
          style = 'block';
          theme = 'classic';
          negativeFormat = 'paren';
          valPos = 'inside';
        } else {
          style = 'standard';
        }
        return;
      }

      // theme: classic | orange-red | default
      const themeMatch = line.match(/^theme:\s*(.+)$/i);
      if (themeMatch) {
        theme = themeMatch[1].trim().toLowerCase();
        return;
      }

      // bar: ラベル (値) [type] または step: ラベル (値) [type]
      const barMatch = line.match(/^(?:bar|step|item):\s*(.+?)(?:\s*\(([^)]+)\))?(?:\s*\[([^\]]+)\])?$/i);
      if (barMatch) {
        const label = barMatch[1].trim().replace(/^["']|["']$/g, '');
        const rawValStr = barMatch[2] ? barMatch[2].trim() : null;
        const typeOpt = barMatch[3] ? barMatch[3].trim().toLowerCase() : '';

        rawBars.push({ label, valStr: rawValStr, typeOpt });
      }
    });
  }

  if (rawBars.length < 2) return null;

  // 累積値・バー種別の計算
  let runningTotal = 0;
  const bars = [];

  rawBars.forEach((item, index) => {
    let type = 'total';
    let val = 0;
    let startYVal = 0;
    let endYVal = 0;

    const isFirst = index === 0;
    const isLast = index === rawBars.length - 1;

    if (item.typeOpt.includes('total') || (isLast && item.valStr === null)) {
      type = 'total';
      if (item.valStr !== null) {
        val = parseFloat(item.valStr);
        runningTotal = val;
      } else {
        val = runningTotal;
      }
      startYVal = 0;
      endYVal = runningTotal;
    } else {
      val = item.valStr !== null ? parseFloat(item.valStr) : 0;
      if (item.typeOpt.includes('inc') || (!item.typeOpt.includes('dec') && val > 0)) {
        type = 'increase';
      } else if (item.typeOpt.includes('dec') || val < 0) {
        type = 'decrease';
        if (val > 0) val = -val;
      } else {
        type = isFirst ? 'total' : 'increase';
      }

      if (type === 'total') {
        startYVal = 0;
        endYVal = val;
        runningTotal = val;
      } else {
        startYVal = runningTotal;
        runningTotal += val;
        endYVal = runningTotal;
      }
    }

    bars.push({
      label: item.label,
      value: val,
      type,
      start: startYVal,
      end: endYVal
    });
  });

  return { title, unit, bars, style, theme, valPos, negativeFormat };
}

function drawWaterfallSvg(code, container, labelText) {
  container.innerHTML = '';
  const data = parseWaterfall(code);
  if (!data) {
    const err = document.createElement('div');
    err.className = 'chem-render-error';
    err.textContent = 'ウォーターフォール図の構文エラー: 2つ以上のステップバーが必要です。';
    container.appendChild(err);
    return;
  }

  const { title, unit, bars, style, theme, valPos, negativeFormat } = data;
  const N = bars.length;
  const isBlock = style === 'block';

  const width = Math.max(N * 88 + 140, 760);
  const height = title ? 420 : 380;
  const marginTop = title ? 75 : 55;
  const marginBottom = 65;
  const marginLeft = 65;
  const marginRight = 35;

  const plotW = width - marginLeft - marginRight;
  const plotH = height - marginTop - marginBottom;

  // 最大・最小値の計算
  let minVal = 0;
  let maxVal = 0;
  bars.forEach((b) => {
    minVal = Math.min(minVal, b.start, b.end);
    maxVal = Math.max(maxVal, b.start, b.end);
  });

  const range = maxVal - minVal || 1;
  const marginY = range * (isBlock ? 0.12 : 0.15);
  const yDomainMin = Math.floor((minVal - (minVal < 0 ? marginY : 0)) / 10) * 10;
  const yDomainMax = Math.ceil((maxVal + marginY) / 10) * 10;
  const yDomainRange = yDomainMax - yDomainMin || 1;

  const getY = (val) => marginTop + plotH - ((val - yDomainMin) / yDomainRange) * plotH;

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
    tEl.setAttribute('y', 25);
    tEl.setAttribute('text-anchor', 'middle');
    tEl.setAttribute('font-size', '16.5');
    tEl.setAttribute('font-weight', '700');
    tEl.setAttribute('fill', '#1e293b');
    tEl.setAttribute('font-family', 'sans-serif');
    tEl.textContent = title + (unit ? `（単位: ${unit}）` : '');
    svg.appendChild(tEl);
  }

  // Y軸グリッド線 & 目盛り
  const gridG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const gridCount = 5;
  for (let i = 0; i <= gridCount; i++) {
    const gVal = yDomainMin + (yDomainRange / gridCount) * i;
    const gy = getY(gVal);

    const gLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    gLine.setAttribute('x1', marginLeft);
    gLine.setAttribute('y1', gy);
    gLine.setAttribute('x2', width - marginRight);
    gLine.setAttribute('y2', gy);
    gLine.setAttribute('stroke', gVal === 0 ? '#64748b' : '#f1f5f9');
    gLine.setAttribute('stroke-width', gVal === 0 ? '1.5' : '1');
    gridG.appendChild(gLine);

    const gTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    gTxt.setAttribute('x', marginLeft - 8);
    gTxt.setAttribute('y', gy + 4);
    gTxt.setAttribute('text-anchor', 'end');
    gTxt.setAttribute('font-size', '11');
    gTxt.setAttribute('font-weight', '600');
    gTxt.setAttribute('fill', '#64748b');
    gTxt.setAttribute('font-family', 'sans-serif');
    gTxt.textContent = Number.isInteger(gVal) ? String(gVal) : gVal.toFixed(1);
    gridG.appendChild(gTxt);
  }
  svg.appendChild(gridG);

  // ブロック外枠罫線 (画像3スタイル)
  if (isBlock) {
    const frameRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    frameRect.setAttribute('x', marginLeft);
    frameRect.setAttribute('y', marginTop);
    frameRect.setAttribute('width', plotW);
    frameRect.setAttribute('height', plotH);
    frameRect.setAttribute('fill', 'none');
    frameRect.setAttribute('stroke', '#cbd5e1');
    frameRect.setAttribute('stroke-width', '1');
    svg.appendChild(frameRect);
  }

  // バー寸法
  const stepW = plotW / N;
  const barW = isBlock ? stepW : Math.min(stepW * 0.65, 52);

  const barG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const connectorG = document.createElementNS('http://www.w3.org/2000/svg', 'g');

  // カラーパレット決定
  const isClassicTheme = isBlock || theme === 'classic' || theme === 'orange-red';
  const colors = isClassicTheme
    ? {
        increase: { fill: '#ea580c', stroke: '#c2410c' }, // オレンジ
        decrease: { fill: '#991b1b', stroke: '#7f1d1d' }, // 濃赤 / ワインレッド
        total: { fill: '#1e3a5f', stroke: '#152b47' }     // 濃紺
      }
    : {
        increase: { fill: '#10b981', stroke: '#059669' }, // グリーン
        decrease: { fill: '#f43f5e', stroke: '#e11d48' }, // ピンク / ローズ
        total: { fill: '#0284c7', stroke: '#0369a1' }     // ブルー
      };

  bars.forEach((b, i) => {
    const bx = isBlock ? (marginLeft + i * stepW) : (marginLeft + i * stepW + (stepW - barW) / 2);

    const yTopVal = Math.max(b.start, b.end);
    const yBtmVal = Math.min(b.start, b.end);
    const by = getY(yTopVal);
    const bh = Math.max(getY(yBtmVal) - by, 2);

    const pal = colors[b.type] || colors.total;

    // バー本体
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', bx);
    rect.setAttribute('y', by);
    rect.setAttribute('width', barW);
    rect.setAttribute('height', bh);
    rect.setAttribute('rx', isBlock ? '0' : '3');
    rect.setAttribute('fill', pal.fill);
    rect.setAttribute('stroke', isBlock ? '#ffffff' : pal.stroke);
    rect.setAttribute('stroke-width', isBlock ? '1' : '1.5');
    barG.appendChild(rect);

    // 数値ラベル
    const valTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    valTxt.setAttribute('x', bx + barW / 2);
    valTxt.setAttribute('text-anchor', 'middle');
    valTxt.setAttribute('font-family', 'sans-serif');

    let dispVal = '';
    if (b.type === 'total') {
      dispVal = String(b.end);
    } else if (b.type === 'decrease') {
      dispVal = (negativeFormat === 'paren' || isBlock) ? `(${Math.abs(b.value)})` : `-${Math.abs(b.value)}`;
    } else {
      dispVal = isBlock ? String(b.value) : `+${b.value}`;
    }

    if (valPos === 'inside' || (isBlock && bh >= 24)) {
      // バー内中央白文字（画像3）
      valTxt.setAttribute('y', by + bh / 2 + 6);
      valTxt.setAttribute('font-size', '16');
      valTxt.setAttribute('font-weight', '700');
      valTxt.setAttribute('fill', '#ffffff');
    } else {
      // バー外配置
      valTxt.setAttribute('y', b.type === 'decrease' ? by + bh + 14 : by - 6);
      valTxt.setAttribute('font-size', '12.5');
      valTxt.setAttribute('font-weight', '700');
      valTxt.setAttribute('fill', pal.stroke);
    }
    valTxt.textContent = dispVal;
    barG.appendChild(valTxt);

    // X軸ラベル
    const labelTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    labelTxt.setAttribute('x', bx + barW / 2);
    labelTxt.setAttribute('y', height - marginBottom + 20);
    labelTxt.setAttribute('text-anchor', 'middle');
    labelTxt.setAttribute('font-size', '13');
    labelTxt.setAttribute('font-weight', '600');
    labelTxt.setAttribute('fill', '#334155');
    labelTxt.setAttribute('font-family', 'sans-serif');

    if (b.label.length > 7 && !isBlock) {
      const p1 = b.label.slice(0, Math.ceil(b.label.length / 2));
      const p2 = b.label.slice(Math.ceil(b.label.length / 2));
      const t1 = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
      t1.setAttribute('x', bx + barW / 2);
      t1.setAttribute('dy', '0');
      t1.textContent = p1;
      const t2 = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
      t2.setAttribute('x', bx + barW / 2);
      t2.setAttribute('dy', '15');
      t2.textContent = p2;
      labelTxt.appendChild(t1);
      labelTxt.appendChild(t2);
    } else {
      labelTxt.textContent = b.label;
    }
    barG.appendChild(labelTxt);

    // 次のバーへの水平コネクタ点線（非ブロック時のみ）
    if (!isBlock && i < N - 1) {
      const nextBx = marginLeft + (i + 1) * stepW + (stepW - barW) / 2;
      const connY = getY(b.end);

      const connLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      connLine.setAttribute('x1', bx + barW);
      connLine.setAttribute('y1', connY);
      connLine.setAttribute('x2', nextBx);
      connLine.setAttribute('y2', connY);
      connLine.setAttribute('stroke', '#94a3b8');
      connLine.setAttribute('stroke-dasharray', '3 3');
      connLine.setAttribute('stroke-width', '1.2');
      connectorG.appendChild(connLine);
    }
  });

  svg.appendChild(connectorG);
  svg.appendChild(barG);

  // 凡例（上部）
  const legG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const legItems = isClassicTheme
    ? [
        { label: '増加', color: colors.increase.fill, w: 75 },
        { label: '減少', color: colors.decrease.fill, w: 75 },
        { label: '合計', color: colors.total.fill, w: 75 }
      ]
    : [
        { label: '合計・起点/終点', color: colors.total.fill, w: 125 },
        { label: '増加要因', color: colors.increase.fill, w: 85 },
        { label: '減少要因', color: colors.decrease.fill, w: 85 }
      ];

  const totalLegW = legItems.reduce((acc, it) => acc + it.w, 0);
  let curLegX = Math.max((width - totalLegW) / 2, marginLeft);
  const legY = title ? 48 : 24;

  legItems.forEach((item) => {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', curLegX);
    rect.setAttribute('y', legY - 9);
    rect.setAttribute('width', '13');
    rect.setAttribute('height', '13');
    rect.setAttribute('rx', '2');
    rect.setAttribute('fill', item.color);
    legG.appendChild(rect);

    const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    txt.setAttribute('x', curLegX + 18);
    txt.setAttribute('y', legY + 2);
    txt.setAttribute('font-size', '12');
    txt.setAttribute('font-weight', '700');
    txt.setAttribute('fill', '#475569');
    txt.setAttribute('font-family', 'sans-serif');
    txt.textContent = item.label;
    legG.appendChild(txt);

    curLegX += item.w;
  });
  svg.appendChild(legG);

  container.appendChild(svg);

  if (labelText) {
    const lbl = document.createElement('div');
    lbl.className = 'chem-structure-label';
    lbl.textContent = labelText;
    container.appendChild(lbl);
  }
}
