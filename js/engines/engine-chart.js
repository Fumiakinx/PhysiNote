// ==========================================
// グラフ・チャート (Bar, Line, Pie, Donut, Combo) パーサー & SVG描画エンジン
// 独自構文 (\chart, \barchart, \linechart, \piechart) & LaTeX系構文 (pgfplots, tikz \pie)
// ==========================================

function parseChartText(text) {
  if (!text || typeof text !== 'string') return null;

  // 1. LaTeX pgf-pie 構文 (\pie{...} または \begin{tikzpicture} ... \pie ...)
  const pieMatch = text.match(/\\pie(?:\[([^\]]*)\])?\s*\{([^}]+)\}/i);
  if (pieMatch) {
    const optStr = pieMatch[1] || '';
    const dataStr = pieMatch[2] || '';
    const isDonut = optStr.includes('donut') || optStr.includes('hole');
    const items = [];
    dataStr.split(',').forEach((part) => {
      const p = part.trim();
      if (!p) return;
      const slashIdx = p.indexOf('/');
      if (slashIdx !== -1) {
        const val = parseFloat(p.slice(0, slashIdx).trim()) || 0;
        const name = p.slice(slashIdx + 1).trim();
        items.push({ name, value: val });
      }
    });

    return {
      type: isDonut ? 'donut' : 'pie',
      title: '円グラフ (LaTeX pgf-pie)',
      theme: 'light',
      unit: '%',
      categories: [],
      series: [],
      data: items,
      stacked: false,
      horizontal: false
    };
  }

  // 2. LaTeX pgfplots 構文 (\begin{axis} ... \addplot ...)
  if (text.includes('\\begin{axis}') || (text.includes('\\begin{tikzpicture}') && text.includes('\\addplot'))) {
    return parsePgfplotsChart(text);
  }

  // 3. 独自構文 (\chart{...}, \barchart{...}, \linechart{...}, \piechart{...}, \donutchart{...})
  let defaultType = 'bar';
  const macroMatch = text.match(/\\(chart|barchart|linechart|piechart|donutchart|areachart)\s*\{([\s\S]*)\}/i);
  let content = text;
  if (macroMatch) {
    const macroName = macroMatch[1].toLowerCase();
    content = macroMatch[2];
    if (macroName === 'barchart') defaultType = 'bar';
    else if (macroName === 'linechart') defaultType = 'line';
    else if (macroName === 'piechart') defaultType = 'pie';
    else if (macroName === 'donutchart') defaultType = 'donut';
    else if (macroName === 'areachart') defaultType = 'area';
  }

  const lines = content
    .split(/[\n;]+/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('//') && !l.startsWith('#') && !l.startsWith('%'));

  let type = defaultType;
  let title = '';
  let theme = 'light'; // デフォルトはクリーンで見やすい白背景
  let unit = '';
  let xLabel = '';
  let yLabel = '';
  let y2Label = '';
  let stacked = false;
  let horizontal = false;
  let categories = [];
  const series = []; // { name, data: [], color, type: 'bar'|'line'|'area' }
  const dataItems = []; // 円・ドーナツ用 { name, value, color }

  for (const line of lines) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) {
      const lower = line.toLowerCase();
      if (/^(bar|horizontal-bar|stacked-bar|line|area|pie|donut|combo|pareto)$/.test(lower)) {
        type = lower;
      }
      continue;
    }

    const key = line.slice(0, colonIdx).trim().toLowerCase();
    const val = line.slice(colonIdx + 1).trim();

    if (key === 'type' || key === 'chart' || key === 'kind') {
      type = val.toLowerCase().replace(/^["']|["']$/g, '');
    } else if (key === 'title') {
      title = val.replace(/^["']|["']$/g, '');
    } else if (key === 'theme') {
      theme = val.toLowerCase().replace(/^["']|["']$/g, '');
    } else if (key === 'unit') {
      unit = val.replace(/^["']|["']$/g, '');
    } else if (key === 'xlabel' || key === 'x_axis') {
      xLabel = val.replace(/^["']|["']$/g, '');
    } else if (key === 'ylabel' || key === 'y_axis') {
      yLabel = val.replace(/^["']|["']$/g, '');
    } else if (key === 'y2label' || key === 'y2_axis') {
      y2Label = val.replace(/^["']|["']$/g, '');
    } else if (key === 'stacked') {
      stacked = val.toLowerCase() !== 'false' && val !== '0';
    } else if (key === 'horizontal') {
      horizontal = val.toLowerCase() !== 'false' && val !== '0';
    } else if (key === 'x' || key === 'categories' || key === 'labels') {
      categories = splitCsvParts(val).map((s) => s.replace(/^["']|["']$/g, ''));
    } else if (key === 'series' || key === 'line' || key === 'bar' || key === 'area') {
      const parts = splitCsvParts(val);
      if (parts.length >= 2) {
        let name = parts[0].replace(/^["']|["']$/g, '');
        let color = '';
        let sType = key === 'line' ? 'line' : (key === 'bar' ? 'bar' : (key === 'area' ? 'area' : 'auto'));
        const vals = [];

        for (let i = 1; i < parts.length; i++) {
          let p = parts[i].trim();
          const typeMatch = p.match(/\[type=([a-zA-Z]+)\]/i);
          if (typeMatch) {
            sType = typeMatch[1].toLowerCase();
            p = p.replace(typeMatch[0], '').trim();
          }
          if (!p) continue;
          if (p.startsWith('#') || p.startsWith('rgb')) {
            color = p;
          } else if (p.toLowerCase().startsWith('type=')) {
            sType = p.slice(5).trim().toLowerCase();
          } else {
            const num = parseFloat(p);
            if (!isNaN(num)) vals.push(num);
          }
        }
        series.push({ name, data: vals, color, type: sType });
      }
    } else if (key === 'data' || key === 'item' || key === 'slice') {
      const parts = splitCsvParts(val);
      if (parts.length >= 2) {
        const name = parts[0].replace(/^["']|["']$/g, '');
        const num = parseFloat(parts[1]) || 0;
        const color = parts[2] ? parts[2].trim() : '';
        dataItems.push({ name, value: num, color });
      }
    }
  }

  // type の正規化
  if (type === 'stacked-bar' || type === 'stacked') {
    type = 'bar';
    stacked = true;
  } else if (type === 'horizontal-bar' || type === 'hbar') {
    type = 'bar';
    horizontal = true;
  }

  return {
    type,
    title,
    theme,
    unit,
    xLabel,
    yLabel,
    y2Label,
    stacked,
    horizontal,
    categories,
    series,
    data: dataItems
  };
}

// ==========================================
// LaTeX pgfplots パーサー (高度機能拡充版)
// 対応機能:
// 1. coordinates { (x,y) ... }, table { x y ... }, 数式 {f(x)} (domainサンプリング)
// 2. \legend{系列1, 系列2} & \addlegendentry{名称}
// 3. parseLatexColor による配色オプション (color=, fill=, 色名!比率)
// 4. 積み上げ棒 (ybar stacked / xbar stacked) の検出
// ==========================================
function parsePgfplotsChart(text) {
  let title = 'LaTeX pgfplots グラフ';
  const isStacked = /stacked/i.test(text);
  const isHorizontal = /xbar/i.test(text);
  const isBar = /ybar|xbar/i.test(text);
  let xLabel = '';
  let yLabel = '';
  let categories = [];
  const series = [];

  // タイトル抽出
  const titleMatch = text.match(/title\s*=\s*\{([^}]+)\}/i);
  if (titleMatch) title = titleMatch[1].trim();

  // 軸ラベル抽出
  const xlabelMatch = text.match(/xlabel\s*=\s*\{([^}]+)\}/i);
  if (xlabelMatch) xLabel = xlabelMatch[1].trim();

  const ylabelMatch = text.match(/ylabel\s*=\s*\{([^}]+)\}/i);
  if (ylabelMatch) yLabel = ylabelMatch[1].trim();

  // カテゴリ軸 (symbolic x coords / xticklabels)
  const coordsMatch = text.match(/(?:symbolic\s*x\s*coords|xticklabels)\s*=\s*\{([^}]+)\}/i);
  if (coordsMatch) {
    categories = coordsMatch[1].split(',').map((s) => s.trim().replace(/^["']|["']$/g, ''));
  }

  // グローバル凡例 (\legend{A, B, C})
  const legendMatch = text.match(/\\legend\s*\{([^}]+)\}/i);
  const globalLegends = legendMatch ? legendMatch[1].split(',').map((s) => s.trim()) : [];

  // 色抽出ヘルパー (parseLatexColor 連携)
  const extractColor = (optStr) => {
    if (!optStr || typeof parseLatexColor !== 'function') return '';
    const colMatch = optStr.match(/(?:color|fill|draw)\s*=\s*([^,\]]+)/i);
    if (colMatch) {
      const parsed = parseLatexColor(colMatch[1]);
      if (parsed) return parsed;
    }
    const tokens = optStr.split(',').map((t) => t.trim());
    for (const tok of tokens) {
      const parsed = parseLatexColor(tok);
      if (parsed) return parsed;
    }
    return '';
  };

  // 各 \addplot コマンドの検出と分割
  const addplotIndices = [];
  const apKeywordRegex = /\\addplot\+?/gi;
  let m;
  while ((m = apKeywordRegex.exec(text)) !== null) {
    addplotIndices.push(m.index);
  }

  addplotIndices.forEach((startIdx, i) => {
    const nextIdx = i + 1 < addplotIndices.length ? addplotIndices[i + 1] : text.length;
    const block = text.substring(startIdx, nextIdx);

    // オプション [...] の抽出
    const optMatch = block.match(/^\\addplot\+?(?:\s*\[([^\]]*)\])?/i);
    const optStr = optMatch && optMatch[1] ? optMatch[1].trim() : '';
    const color = extractColor(optStr);

    // 系列名: 個別 \addlegendentry または グローバル \legend
    let seriesName = '';
    const entryMatch = block.match(/\\addlegendentry(?:\[[^\]]*\])?\s*\{([^}]+)\}/i);
    if (entryMatch) {
      seriesName = entryMatch[1].trim();
    } else if (globalLegends[i]) {
      seriesName = globalLegends[i];
    } else {
      seriesName = `系列 ${i + 1}`;
    }

    const localPoints = [];

    // パターン 1: coordinates { (x, y) ... }
    const coordKeywordIdx = block.indexOf('coordinates');
    if (coordKeywordIdx !== -1) {
      const braceRes = typeof extractBalancedBraces === 'function'
        ? extractBalancedBraces(block, coordKeywordIdx)
        : null;
      const rawCoords = braceRes ? braceRes.content : (block.match(/coordinates\s*\{([^}]+)\}/i)?.[1] || '');
      const pairRegex = /\(([^,]+),\s*([^)]+)\)/g;
      let p;
      while ((p = pairRegex.exec(rawCoords)) !== null) {
        localPoints.push({ x: p[1].trim(), y: parseFloat(p[2].trim()) || 0 });
      }
    }
    // パターン 2: table { ... }
    else if (block.includes('table')) {
      const tableKeywordIdx = block.indexOf('table');
      const braceRes = typeof extractBalancedBraces === 'function'
        ? extractBalancedBraces(block, tableKeywordIdx)
        : null;
      if (braceRes) {
        const lines = braceRes.content.split(/[\r\n]+/).map((l) => l.trim()).filter((l) => l && !l.startsWith('#') && !l.startsWith('%'));
        for (const line of lines) {
          const parts = line.split(/\s+/).filter(Boolean);
          if (parts.length >= 2) {
            const numY = parseFloat(parts[1]);
            if (!isNaN(numY)) {
              localPoints.push({ x: parts[0], y: numY });
            }
          }
        }
      }
    }
    // パターン 3: 数式プロット { f(x) } (domain サンプリング)
    else {
      const braceRes = typeof extractBalancedBraces === 'function'
        ? extractBalancedBraces(block)
        : null;
      if (braceRes && braceRes.content.trim()) {
        const expr = braceRes.content.trim();
        let domainMin = 0;
        let domainMax = 10;
        const domMatch = optStr.match(/domain\s*=\s*(-?[0-9.]+)\s*:\s*(-?[0-9.]+)/i);
        if (domMatch) {
          domainMin = parseFloat(domMatch[1]);
          domainMax = parseFloat(domMatch[2]);
        }
        const samples = 15;
        const step = (domainMax - domainMin) / (samples - 1);
        for (let s = 0; s < samples; s++) {
          const xVal = domainMin + s * step;
          let yVal = 0;
          try {
            const jsExpr = expr
              .replace(/\^/g, '**')
              .replace(/\\(?:sin|cos|tan|exp|sqrt|abs)/g, (fn) => `Math.${fn.slice(1)}`)
              .replace(/\b(?:sin|cos|tan|exp|sqrt|abs)\b/g, (fn) => `Math.${fn}`)
              .replace(/\bpi\b/gi, 'Math.PI')
              .replace(/(\d)([a-zA-Z(])/g, '$1 * $2')
              .replace(/([a-zA-Z)])(\d)/g, '$1 * $2');
            const evalFn = new Function('x', `return ${jsExpr};`);
            const res = evalFn(xVal);
            yVal = isNaN(res) || !isFinite(res) ? 0 : Math.round(res * 100) / 100;
          } catch {
            yVal = 0;
          }
          localPoints.push({ x: String(Math.round(xVal * 10) / 10), y: yVal });
        }
      }
    }

    if (localPoints.length > 0) {
      if (categories.length === 0) {
        categories = localPoints.map((p) => p.x);
      }
      series.push({
        name: seriesName,
        data: localPoints.map((p) => p.y),
        color,
        type: isBar ? 'bar' : 'line'
      });
    }
  });

  return {
    type: isBar ? 'bar' : 'line',
    title,
    theme: 'light',
    unit: '',
    xLabel,
    yLabel,
    y2Label: '',
    stacked: isStacked,
    horizontal: isHorizontal,
    categories,
    series,
    data: []
  };
}

function splitCsvParts(str) {
  const parts = [];
  let cur = '';
  let inQuote = false;
  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    if (c === '"' || c === "'") {
      inQuote = !inQuote;
      cur += c;
    } else if (c === ',' && !inQuote) {
      parts.push(cur.trim());
      cur = '';
    } else {
      cur += c;
    }
  }
  if (cur.trim()) parts.push(cur.trim());
  return parts;
}

// ==========================================
// SVG レンダリングエンジン
// ==========================================
function drawChartSvg(text, container, label) {
  if (!container) return;
  container.innerHTML = '';

  try {
    const parsed = parseChartText(text);
    if (!parsed) {
      container.innerHTML = '<div style="color:#ef4444;padding:12px;font-size:12px;">グラフ構文エラー</div>';
      return;
    }

    const isDark = parsed.theme === 'dark';
    const colors = {
      bg: isDark ? '#080c16' : '#ffffff',
      cardBg: isDark ? '#0f172a' : '#f8fafc',
      cardBorder: isDark ? '#1e293b' : '#e2e8f0',
      textMain: isDark ? '#f8fafc' : '#0f172a',
      textMuted: isDark ? '#94a3b8' : '#64748b',
      grid: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
      axis: isDark ? '#334155' : '#94a3b8',
      palette: isDark
        ? ['#38bdf8', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316', '#e11d48', '#6366f1']
        : ['#0284c7', '#059669', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#65a30d', '#ea580c', '#c026d3', '#4f46e5']
    };

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    const viewBoxWidth = 840;
    let viewBoxHeight = 520;

    // 定義 (defs): グラデーション・シャドウ
    const defs = document.createElementNS(svgNS, 'defs');
    defs.innerHTML = `
      <filter id="chart-shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="${isDark ? '0.5' : '0.1'}" />
      </filter>
    `;
    svg.appendChild(defs);

    // 背景
    const bgRect = document.createElementNS(svgNS, 'rect');
    bgRect.setAttribute('width', '100%');
    bgRect.setAttribute('height', '100%');
    bgRect.setAttribute('fill', colors.bg);
    svg.appendChild(bgRect);

    // ヘッダー情報（タイトル・単位）
    const headerG = document.createElementNS(svgNS, 'g');
    const titleText = parsed.title || getDefaultChartTitle(parsed.type);
    const unitText = parsed.unit ? `(単位: ${parsed.unit})` : '';

    headerG.innerHTML = `
      <text x="28" y="38" font-size="20" font-weight="bold" fill="${colors.textMain}" font-family="system-ui, -apple-system, sans-serif">
        ${titleText}
      </text>
      <text x="${viewBoxWidth - 28}" y="38" text-anchor="end" font-size="12" fill="${colors.textMuted}" font-family="system-ui, sans-serif">
        ${unitText}
      </text>
      <rect x="28" y="48" width="80" height="3" rx="1.5" fill="#0284c7" />
    `;
    svg.appendChild(headerG);

    // コンテンツ描画グループ
    const contentG = document.createElementNS(svgNS, 'g');
    contentG.setAttribute('transform', 'translate(0, 60)');
    svg.appendChild(contentG);

    let summaryData = null;

    if (parsed.type === 'pie' || parsed.type === 'donut') {
      summaryData = renderPieOrDonutChart(contentG, parsed, colors, svgNS);
    } else if (parsed.horizontal) {
      summaryData = renderHorizontalBarChart(contentG, parsed, colors, svgNS);
    } else {
      // 縦棒・折れ線・複合・エリア・積み上げ
      summaryData = renderCartesianChart(contentG, parsed, colors, svgNS);
    }

    // 下部サマリーカード
    if (summaryData && summaryData.line1) {
      const summaryG = document.createElementNS(svgNS, 'g');
      const sumY = viewBoxHeight - 78;
      summaryG.setAttribute('transform', `translate(28, ${sumY})`);
      summaryG.innerHTML = `
        <rect x="0" y="0" width="${viewBoxWidth - 56}" height="64" rx="8" fill="${colors.cardBg}" stroke="${colors.cardBorder}" stroke-width="1.5" />
        <g transform="translate(16, 18)">
          <circle cx="6" cy="6" r="4" fill="#0284c7" />
          <text x="18" y="10" font-size="13" font-weight="bold" fill="${colors.textMain}" font-family="system-ui, sans-serif">
            データ集計サマリー
          </text>
          <text x="18" y="30" font-size="12" fill="${colors.textMuted}" font-family="system-ui, sans-serif">
            ${summaryData.line1}
          </text>
        </g>
      `;
      svg.appendChild(summaryG);
    }

    svg.setAttribute('viewBox', `0 0 ${viewBoxWidth} ${viewBoxHeight}`);
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.style.maxWidth = `${viewBoxWidth}px`;
    svg.style.display = 'block';
    svg.style.margin = '0 auto';

    container.appendChild(svg);
  } catch (err) {
    console.error('drawChartSvg error:', err);
    container.innerHTML = `<div style="color:#ef4444;padding:12px;font-size:11px;">描画エラー: ${err.message || err}</div>`;
  }
}

function getDefaultChartTitle(type) {
  switch (type) {
    case 'bar':
      return '棒グラフ (Bar Chart)';
    case 'line':
      return '折れ線グラフ (Line Chart)';
    case 'pie':
      return '円グラフ (Pie Chart)';
    case 'donut':
      return 'ドーナツグラフ (Donut Chart)';
    case 'area':
      return 'エリアチャート (Area Chart)';
    case 'combo':
    case 'pareto':
      return '複合チャート / パレート図 (Combo Chart)';
    default:
      return '統計チャート (Chart)';
  }
}

// ==========================================
// 1. 直交座標チャート (縦棒, 折れ線, エリア, 複合, 積み上げ)
// ==========================================
function renderCartesianChart(g, parsed, colors, svgNS) {
  const plotX = 80;
  const plotY = 30;
  const plotW = 710;
  const plotH = 280;

  // データ系列の正規化
  let series = parsed.series || [];
  let categories = parsed.categories || [];

  if (series.length === 0 && parsed.data && parsed.data.length > 0) {
    categories = parsed.data.map((d) => d.name);
    series = [
      {
        name: '値',
        data: parsed.data.map((d) => d.value),
        color: parsed.data[0].color || colors.palette[0],
        type: parsed.type === 'line' || parsed.type === 'area' ? parsed.type : 'bar'
      }
    ];
  } else if (series.length === 0) {
    categories = ['Q1', 'Q2', 'Q3', 'Q4'];
    series = [
      { name: '系列A', data: [120, 150, 180, 210], color: colors.palette[0], type: 'bar' }
    ];
  }

  const maxLen = Math.max(...series.map((s) => (s.data ? s.data.length : 0)), categories.length, 1);
  while (categories.length < maxLen) {
    categories.push(`項目 ${categories.length + 1}`);
  }

  // Y軸最大値・最小値の計算
  let yMin = 0;
  let yMax = 0;

  if (parsed.stacked) {
    for (let i = 0; i < maxLen; i++) {
      let sum = 0;
      series.forEach((s) => {
        sum += (s.data && s.data[i] !== undefined) ? s.data[i] : 0;
      });
      if (sum > yMax) yMax = sum;
    }
  } else {
    series.forEach((s) => {
      if (s.data) {
        s.data.forEach((v) => {
          if (v > yMax) yMax = v;
          if (v < yMin) yMin = v;
        });
      }
    });
  }

  if (yMax === 0 && yMin === 0) yMax = 100;
  const nice = calculateNiceScale(yMin, yMax, 5);
  const yTicks = nice.ticks;
  const scaleMax = nice.max;
  const scaleMin = nice.min;
  const range = scaleMax - scaleMin || 1;

  // グリッド線とY軸目盛
  const gridG = document.createElementNS(svgNS, 'g');
  yTicks.forEach((tickVal) => {
    const ratio = (tickVal - scaleMin) / range;
    const y = plotY + plotH - ratio * plotH;

    const line = document.createElementNS(svgNS, 'line');
    line.setAttribute('x1', plotX);
    line.setAttribute('y1', y.toFixed(1));
    line.setAttribute('x2', plotX + plotW);
    line.setAttribute('y2', y.toFixed(1));
    line.setAttribute('stroke', colors.grid);
    line.setAttribute('stroke-width', '1');
    gridG.appendChild(line);

    const txt = document.createElementNS(svgNS, 'text');
    txt.setAttribute('x', (plotX - 12).toFixed(1));
    txt.setAttribute('y', (y + 4).toFixed(1));
    txt.setAttribute('text-anchor', 'end');
    txt.setAttribute('font-size', '11');
    txt.setAttribute('fill', colors.textMuted);
    txt.setAttribute('font-family', 'system-ui, sans-serif');
    txt.textContent = tickVal.toLocaleString();
    gridG.appendChild(txt);
  });
  g.appendChild(gridG);

  // 軸線 (X軸, Y軸)
  const axisG = document.createElementNS(svgNS, 'g');
  const xAxisY = plotY + plotH - ((Math.max(0, scaleMin) - scaleMin) / range) * plotH;
  const xAxis = document.createElementNS(svgNS, 'line');
  xAxis.setAttribute('x1', plotX);
  xAxis.setAttribute('y1', xAxisY.toFixed(1));
  xAxis.setAttribute('x2', plotX + plotW);
  xAxis.setAttribute('y2', xAxisY.toFixed(1));
  xAxis.setAttribute('stroke', colors.axis);
  xAxis.setAttribute('stroke-width', '1.5');
  axisG.appendChild(xAxis);
  g.appendChild(axisG);

  // X軸カテゴリの描画
  const nCats = Math.max(categories.length, 1);
  const catStep = plotW / nCats;
  const xCatG = document.createElementNS(svgNS, 'g');

  categories.forEach((cat, idx) => {
    const cx = plotX + idx * catStep + catStep / 2;
    const txt = document.createElementNS(svgNS, 'text');
    txt.setAttribute('x', cx.toFixed(1));
    txt.setAttribute('y', (plotY + plotH + 22).toFixed(1));
    txt.setAttribute('text-anchor', 'middle');
    txt.setAttribute('font-size', '12');
    txt.setAttribute('font-weight', '500');
    txt.setAttribute('fill', colors.textMain);
    txt.setAttribute('font-family', 'system-ui, sans-serif');
    txt.textContent = cat;
    xCatG.appendChild(txt);
  });
  g.appendChild(xCatG);

  // グラフ本体
  const dataG = document.createElementNS(svgNS, 'g');
  dataG.setAttribute('filter', 'url(#chart-shadow)');

  const barSeries = series.filter(
    (s) => s.type === 'bar' || (s.type === 'auto' && parsed.type !== 'line' && parsed.type !== 'area')
  );
  const lineSeries = series.filter(
    (s) => s.type === 'line' || s.type === 'area' || (s.type === 'auto' && (parsed.type === 'line' || parsed.type === 'area'))
  );

  // 棒グラフ
  if (barSeries.length > 0) {
    if (parsed.stacked) {
      const barW = Math.min(60, catStep * 0.65);
      for (let cIdx = 0; cIdx < nCats; cIdx++) {
        const cx = plotX + cIdx * catStep + catStep / 2;
        let curBaseVal = 0;

        barSeries.forEach((s, sIdx) => {
          const val = (s.data && s.data[cIdx] !== undefined) ? s.data[cIdx] : 0;
          if (val <= 0) return;
          const y1 = plotY + plotH - ((curBaseVal + val - scaleMin) / range) * plotH;
          const y2 = plotY + plotH - ((curBaseVal - scaleMin) / range) * plotH;
          const barH = Math.max(2, y2 - y1);
          const color = s.color || colors.palette[sIdx % colors.palette.length];

          const rect = document.createElementNS(svgNS, 'rect');
          rect.setAttribute('x', (cx - barW / 2).toFixed(1));
          rect.setAttribute('y', y1.toFixed(1));
          rect.setAttribute('width', barW.toFixed(1));
          rect.setAttribute('height', barH.toFixed(1));
          rect.setAttribute('rx', sIdx === barSeries.length - 1 ? '4' : '0');
          rect.setAttribute('fill', color);
          dataG.appendChild(rect);

          if (barH > 18) {
            const valTxt = document.createElementNS(svgNS, 'text');
            valTxt.setAttribute('x', cx.toFixed(1));
            valTxt.setAttribute('y', (y1 + barH / 2 + 4).toFixed(1));
            valTxt.setAttribute('text-anchor', 'middle');
            valTxt.setAttribute('font-size', '10.5');
            valTxt.setAttribute('font-weight', 'bold');
            valTxt.setAttribute('fill', '#ffffff');
            valTxt.textContent = val.toLocaleString();
            dataG.appendChild(valTxt);
          }

          curBaseVal += val;
        });
      }
    } else {
      const nBars = barSeries.length;
      const groupW = Math.min(catStep * 0.75, 120);
      const barW = groupW / nBars;

      for (let cIdx = 0; cIdx < nCats; cIdx++) {
        const groupLeft = plotX + cIdx * catStep + (catStep - groupW) / 2;

        barSeries.forEach((s, sIdx) => {
          const val = (s.data && s.data[cIdx] !== undefined) ? s.data[cIdx] : 0;
          const ratio = (val - scaleMin) / range;
          const y = plotY + plotH - ratio * plotH;
          const barH = Math.max(2, xAxisY - y);
          const bx = groupLeft + sIdx * barW;
          const color = s.color || colors.palette[sIdx % colors.palette.length];

          const rect = document.createElementNS(svgNS, 'rect');
          rect.setAttribute('x', (bx + 2).toFixed(1));
          rect.setAttribute('y', y.toFixed(1));
          rect.setAttribute('width', Math.max(2, barW - 4).toFixed(1));
          rect.setAttribute('height', barH.toFixed(1));
          rect.setAttribute('rx', '4');
          rect.setAttribute('fill', color);
          dataG.appendChild(rect);

          const valTxt = document.createElementNS(svgNS, 'text');
          valTxt.setAttribute('x', (bx + barW / 2).toFixed(1));
          valTxt.setAttribute('y', (y - 6).toFixed(1));
          valTxt.setAttribute('text-anchor', 'middle');
          valTxt.setAttribute('font-size', '10.5');
          valTxt.setAttribute('font-weight', 'bold');
          valTxt.setAttribute('fill', colors.textMain);
          valTxt.textContent = val.toLocaleString();
          dataG.appendChild(valTxt);
        });
      }
    }
  }

  // 折れ線 / エリア
  if (lineSeries.length > 0) {
    lineSeries.forEach((s, sIdx) => {
      const color = s.color || colors.palette[(barSeries.length + sIdx) % colors.palette.length];
      const pts = [];

      for (let cIdx = 0; cIdx < nCats; cIdx++) {
        const val = (s.data && s.data[cIdx] !== undefined) ? s.data[cIdx] : 0;
        const cx = plotX + cIdx * catStep + catStep / 2;
        const cy = plotY + plotH - ((val - scaleMin) / range) * plotH;
        pts.push({ x: cx, y: cy, val });
      }

      if (pts.length === 0) return;

      // エリア塗りつぶし
      if (s.type === 'area' || parsed.type === 'area') {
        const areaPath = document.createElementNS(svgNS, 'path');
        let d = `M ${pts[0].x.toFixed(1)} ${xAxisY.toFixed(1)} L ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
        for (let i = 1; i < pts.length; i++) {
          d += ` L ${pts[i].x.toFixed(1)} ${pts[i].y.toFixed(1)}`;
        }
        d += ` L ${pts[pts.length - 1].x.toFixed(1)} ${xAxisY.toFixed(1)} Z`;
        areaPath.setAttribute('d', d);
        areaPath.setAttribute('fill', color);
        areaPath.setAttribute('fill-opacity', '0.2');
        dataG.appendChild(areaPath);
      }

      // 折れ線
      const linePath = document.createElementNS(svgNS, 'path');
      let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
      for (let i = 1; i < pts.length; i++) {
        d += ` L ${pts[i].x.toFixed(1)} ${pts[i].y.toFixed(1)}`;
      }
      linePath.setAttribute('d', d);
      linePath.setAttribute('fill', 'none');
      linePath.setAttribute('stroke', color);
      linePath.setAttribute('stroke-width', '3');
      linePath.setAttribute('stroke-linejoin', 'round');
      linePath.setAttribute('stroke-linecap', 'round');
      dataG.appendChild(linePath);

      // マーカーとラベル
      pts.forEach((pt) => {
        const dot = document.createElementNS(svgNS, 'circle');
        dot.setAttribute('cx', pt.x.toFixed(1));
        dot.setAttribute('cy', pt.y.toFixed(1));
        dot.setAttribute('r', '5');
        dot.setAttribute('fill', color);
        dot.setAttribute('stroke', '#ffffff');
        dot.setAttribute('stroke-width', '2');
        dataG.appendChild(dot);

        const vTxt = document.createElementNS(svgNS, 'text');
        vTxt.setAttribute('x', pt.x.toFixed(1));
        vTxt.setAttribute('y', (pt.y - 10).toFixed(1));
        vTxt.setAttribute('text-anchor', 'middle');
        vTxt.setAttribute('font-size', '11');
        vTxt.setAttribute('font-weight', 'bold');
        vTxt.setAttribute('fill', color);
        vTxt.textContent = pt.val.toLocaleString();
        dataG.appendChild(vTxt);
      });
    });
  }

  g.appendChild(dataG);

  // 凡例
  renderLegend(g, series, colors, plotX, plotY - 14, plotW, svgNS);

  let totalSum = 0;
  let count = 0;
  series.forEach((s) => {
    if (s.data) {
      s.data.forEach((v) => {
        totalSum += v;
        count++;
      });
    }
  });
  const avg = count > 0 ? (totalSum / count).toFixed(1) : 0;

  return {
    line1: `• 合計値: ${totalSum.toLocaleString()} ${parsed.unit} ｜ 平均値: ${avg} ${parsed.unit} ｜ 系列数: ${series.length} ｜ データ点数: ${count} 項目`
  };
}

// ==========================================
// 2. 横棒グラフ (Horizontal Bar Chart)
// ==========================================
function renderHorizontalBarChart(g, parsed, colors, svgNS) {
  const plotX = 140;
  const plotY = 30;
  const plotW = 650;
  const plotH = 280;

  let categories = parsed.categories || [];
  let dataVals = [];

  if (parsed.data && parsed.data.length > 0) {
    categories = parsed.data.map((d) => d.name);
    dataVals = parsed.data.map((d) => d.value);
  } else if (parsed.series && parsed.series.length > 0) {
    dataVals = parsed.series[0].data || [];
  }

  const n = Math.max(categories.length, 1);
  const maxVal = Math.max(...dataVals, 10);
  const nice = calculateNiceScale(0, maxVal, 5);
  const rowStep = plotH / n;
  const barH = Math.min(32, rowStep * 0.65);

  const hG = document.createElementNS(svgNS, 'g');

  // グリッド線
  nice.ticks.forEach((t) => {
    const x = plotX + (t / nice.max) * plotW;
    const line = document.createElementNS(svgNS, 'line');
    line.setAttribute('x1', x.toFixed(1));
    line.setAttribute('y1', plotY.toFixed(1));
    line.setAttribute('x2', x.toFixed(1));
    line.setAttribute('y2', (plotY + plotH).toFixed(1));
    line.setAttribute('stroke', colors.grid);
    line.setAttribute('stroke-width', '1');
    hG.appendChild(line);

    const txt = document.createElementNS(svgNS, 'text');
    txt.setAttribute('x', x.toFixed(1));
    txt.setAttribute('y', (plotY + plotH + 18).toFixed(1));
    txt.setAttribute('text-anchor', 'middle');
    txt.setAttribute('font-size', '11');
    txt.setAttribute('fill', colors.textMuted);
    txt.textContent = t.toLocaleString();
    hG.appendChild(txt);
  });

  // 横棒
  categories.forEach((cat, idx) => {
    const val = dataVals[idx] || 0;
    const cy = plotY + idx * rowStep + rowStep / 2;
    const barW = Math.max(4, (val / nice.max) * plotW);
    const color = colors.palette[idx % colors.palette.length];

    const catTxt = document.createElementNS(svgNS, 'text');
    catTxt.setAttribute('x', (plotX - 12).toFixed(1));
    catTxt.setAttribute('y', (cy + 5).toFixed(1));
    catTxt.setAttribute('text-anchor', 'end');
    catTxt.setAttribute('font-size', '12');
    catTxt.setAttribute('font-weight', '500');
    catTxt.setAttribute('fill', colors.textMain);
    catTxt.textContent = cat;
    hG.appendChild(catTxt);

    const rect = document.createElementNS(svgNS, 'rect');
    rect.setAttribute('x', plotX.toFixed(1));
    rect.setAttribute('y', (cy - barH / 2).toFixed(1));
    rect.setAttribute('width', barW.toFixed(1));
    rect.setAttribute('height', barH.toFixed(1));
    rect.setAttribute('rx', '4');
    rect.setAttribute('fill', color);
    rect.setAttribute('filter', 'url(#chart-shadow)');
    hG.appendChild(rect);

    const valTxt = document.createElementNS(svgNS, 'text');
    valTxt.setAttribute('x', (plotX + barW + 10).toFixed(1));
    valTxt.setAttribute('y', (cy + 5).toFixed(1));
    valTxt.setAttribute('font-size', '12');
    valTxt.setAttribute('font-weight', 'bold');
    valTxt.setAttribute('fill', colors.textMain);
    valTxt.textContent = val.toLocaleString();
    hG.appendChild(valTxt);
  });

  g.appendChild(hG);

  const sum = dataVals.reduce((a, b) => a + b, 0);
  return {
    line1: `• 合計値: ${sum.toLocaleString()} ${parsed.unit} ｜ 最大値: ${Math.max(...dataVals, 0).toLocaleString()} ${parsed.unit} ｜ カテゴリ数: ${n} 項目`
  };
}

// ==========================================
// 3. 円グラフ / ドーナツグラフ (Pie / Donut)
// ==========================================
function renderPieOrDonutChart(g, parsed, colors, svgNS) {
  let items = parsed.data || [];
  if (items.length === 0 && parsed.series && parsed.series.length > 0 && parsed.categories && parsed.categories.length > 0) {
    items = parsed.categories.map((c, i) => ({
      name: c,
      value: parsed.series[0].data[i] || 0,
      color: ''
    }));
  }

  if (items.length === 0) {
    items = [
      { name: 'シェアA', value: 45, color: colors.palette[0] },
      { name: 'シェアB', value: 30, color: colors.palette[1] },
      { name: 'シェアC', value: 15, color: colors.palette[2] },
      { name: 'その他', value: 10, color: colors.palette[3] }
    ];
  }

  const total = items.reduce((acc, it) => acc + (it.value || 0), 0) || 1;
  const isDonut = parsed.type === 'donut';

  const cx = 320;
  const cy = 175;
  const r = 130;
  const innerR = isDonut ? 70 : 0;

  const pieG = document.createElementNS(svgNS, 'g');
  pieG.setAttribute('filter', 'url(#chart-shadow)');

  let currentAngle = -Math.PI / 2;

  items.forEach((item, idx) => {
    const val = Math.max(0, item.value || 0);
    const sliceAngle = (val / total) * (Math.PI * 2);
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    currentAngle = endAngle;

    const color = item.color || colors.palette[idx % colors.palette.length];

    if (sliceAngle <= 0.0001) return;

    // 単一要素（100%）の場合は円を描画
    if (sliceAngle >= Math.PI * 1.999) {
      if (innerR > 0) {
        const ring = document.createElementNS(svgNS, 'path');
        ring.setAttribute('d', `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx} ${cy + r} A ${r} ${r} 0 1 1 ${cx} ${cy - r} M ${cx} ${cy - innerR} A ${innerR} ${innerR} 0 1 0 ${cx} ${cy + innerR} A ${innerR} ${innerR} 0 1 0 ${cx} ${cy - innerR} Z`);
        ring.setAttribute('fill', color);
        pieG.appendChild(ring);
      } else {
        const circle = document.createElementNS(svgNS, 'circle');
        circle.setAttribute('cx', cx);
        circle.setAttribute('cy', cy);
        circle.setAttribute('r', r);
        circle.setAttribute('fill', color);
        pieG.appendChild(circle);
      }
      return;
    }

    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);

    const largeArc = sliceAngle > Math.PI ? 1 : 0;

    let pathData = '';
    if (innerR > 0) {
      const ix1 = cx + innerR * Math.cos(startAngle);
      const iy1 = cy + innerR * Math.sin(startAngle);
      const ix2 = cx + innerR * Math.cos(endAngle);
      const iy2 = cy + innerR * Math.sin(endAngle);
      pathData = `M ${ix1.toFixed(2)} ${iy1.toFixed(2)} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} L ${ix2.toFixed(2)} ${iy2.toFixed(2)} A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix1.toFixed(2)} ${iy1.toFixed(2)} Z`;
    } else {
      pathData = `M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
    }

    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('d', pathData);
    path.setAttribute('fill', color);
    path.setAttribute('stroke', '#ffffff');
    path.setAttribute('stroke-width', '2');
    pieG.appendChild(path);

    // 扇形内パーセントラベル
    const pct = ((val / total) * 100).toFixed(1);
    if (parseFloat(pct) >= 5) {
      const midAngle = (startAngle + endAngle) / 2;
      const textR = innerR > 0 ? (innerR + r) / 2 : r * 0.65;
      const tx = cx + textR * Math.cos(midAngle);
      const ty = cy + textR * Math.sin(midAngle);

      const pTxt = document.createElementNS(svgNS, 'text');
      pTxt.setAttribute('x', tx.toFixed(1));
      pTxt.setAttribute('y', (ty + 4).toFixed(1));
      pTxt.setAttribute('text-anchor', 'middle');
      pTxt.setAttribute('font-size', '11.5');
      pTxt.setAttribute('font-weight', 'bold');
      pTxt.setAttribute('fill', '#ffffff');
      pTxt.textContent = `${pct}%`;
      pieG.appendChild(pTxt);
    }
  });

  g.appendChild(pieG);

  // ドーナツ中央テキスト
  if (isDonut) {
    const centerG = document.createElementNS(svgNS, 'g');
    centerG.innerHTML = `
      <text x="${cx}" y="${cy - 6}" text-anchor="middle" font-size="12" fill="${colors.textMuted}">合計</text>
      <text x="${cx}" y="${cy + 18}" text-anchor="middle" font-size="18" font-weight="bold" fill="${colors.textMain}">${total.toLocaleString()}</text>
    `;
    g.appendChild(centerG);
  }

  // 右側凡例リスト
  const legendG = document.createElementNS(svgNS, 'g');
  const legX = 520;
  const legY = 60;
  const itemH = 34;

  items.forEach((item, idx) => {
    const y = legY + idx * itemH;
    const color = item.color || colors.palette[idx % colors.palette.length];
    const val = item.value || 0;
    const pct = ((val / total) * 100).toFixed(1);

    const row = document.createElementNS(svgNS, 'g');
    row.innerHTML = `
      <rect x="${legX}" y="${y}" width="16" height="16" rx="4" fill="${color}" />
      <text x="${legX + 26}" y="${y + 13}" font-size="13" font-weight="500" fill="${colors.textMain}">${item.name}</text>
      <text x="${legX + 240}" y="${y + 13}" text-anchor="end" font-size="13" font-weight="bold" fill="${color}">${val.toLocaleString()} (${pct}%)</text>
    `;
    legendG.appendChild(row);
  });
  g.appendChild(legendG);

  return {
    line1: `• 合計値: ${total.toLocaleString()} ${parsed.unit} ｜ スライス構成数: ${items.length} 区分 ｜ 最大構成比: ${items[0]?.name || ''}`
  };
}

// 凡例ヘルパー
function renderLegend(g, series, colors, x, y, w, svgNS) {
  if (!series || series.length <= 1) return;
  const legG = document.createElementNS(svgNS, 'g');
  let curX = x;

  series.forEach((s, idx) => {
    const color = s.color || colors.palette[idx % colors.palette.length];
    const itemG = document.createElementNS(svgNS, 'g');
    itemG.innerHTML = `
      <rect x="${curX.toFixed(1)}" y="${y.toFixed(1)}" width="14" height="14" rx="3" fill="${color}" />
      <text x="${(curX + 20).toFixed(1)}" y="${(y + 11).toFixed(1)}" font-size="12" font-weight="500" fill="${colors.textMain}">${s.name}</text>
    `;
    legG.appendChild(itemG);
    curX += (s.name ? s.name.length : 2) * 13 + 40;
  });

  g.appendChild(legG);
}

// 目盛 Nice Scale 計算
function calculateNiceScale(min, max, maxTicks = 5) {
  const range = max - min || 1;
  const roughStep = range / maxTicks;
  const mag = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const magFrac = roughStep / mag;

  let niceStep = mag;
  if (magFrac < 1.5) niceStep = 1 * mag;
  else if (magFrac < 3) niceStep = 2 * mag;
  else if (magFrac < 7) niceStep = 5 * mag;
  else niceStep = 10 * mag;

  const niceMin = Math.floor(min / niceStep) * niceStep;
  const niceMax = Math.ceil(max / niceStep) * niceStep;

  const ticks = [];
  for (let v = niceMin; v <= niceMax + niceStep * 0.5; v += niceStep) {
    ticks.push(v);
  }

  return { min: niceMin, max: niceMax, step: niceStep, ticks };
}
