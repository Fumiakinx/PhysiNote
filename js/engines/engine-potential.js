// ==========================================
// ポテンシャルエネルギー曲線 (Potential Energy Curve) パーサー & SVG描画エンジン
// 対応タイプ:
// 1. morse (モースポテンシャル / 分子結合・振動準位)
// 2. lennard_jones / lj (レナード-ジョーンズ 12-6 ポテンシャル)
// 3. harmonic (調和振動子ポテンシャル / 放物線井戸)
// 4. reaction / profile (化学反応座標プロファイル / 原系・TS・生成系)
// 5. double_well (二重井戸ポテンシャル / アンモニア反転・トンネル効果)
// 6. square_well (有限・無限井戸型ポテンシャル)
// ==========================================

function parsePotentialDiagram(text) {
  if (!text || typeof text !== 'string') return null;

  const lines = text
    .split(/[\n;]+/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('//') && !l.startsWith('#'));

  let title = '';
  let curveType = 'morse'; // morse | lennard_jones | harmonic | reaction | double_well | square_well
  let xAxisLabel = '核間距離 r';
  let yAxisLabel = 'ポテンシャルエネルギー V(r)';
  let xUnit = 'Å';
  let yUnit = 'eV';
  let showAxes = true;
  let showGrid = true;
  let curveColor = '#38bdf8';

  // パラメータ
  let De = 4.5; // 井戸の深さ (eV)
  let re = 1.2; // 平衡核間距離 (Å)
  let a_param = 1.8; // モースパラメータ
  let k_param = 8.0; // バネ定数
  let V0 = 0.0; // 基準エネルギー

  const levels = []; // 束縛準位 / 振動準位: { label, energy, color, style }
  const barriers = []; // 障壁 / 活性化エネルギー / ギャップ: { label, fromE, toE, x, color }
  const annotations = []; // 注釈 / ピーク点: { label, x, y, color }
  const reactionStages = []; // 反応座標ステージ: [ { name: "原系", energy: 0, x: 1 }, ... ]

  const extractBracketProps = (bracketStr) => {
    if (!bracketStr) return {};
    const res = {};
    const parts = bracketStr.split(',').map((p) => p.trim()).filter(Boolean);
    parts.forEach((p) => {
      const kv = p.match(/^([a-zA-Z_-]+)\s*[:=]\s*(.+)$/);
      if (kv) {
        const k = kv[1].toLowerCase();
        let v = kv[2].trim().replace(/^["']|["']$/g, '');
        if (['energy', 'e', 'val', 'from', 'to', 'x', 'y', 'de', 're', 'a', 'k'].includes(k)) {
          res[k] = parseFloat(v) || 0;
        } else {
          res[k] = v;
        }
      } else if (/^-?\d+(?:\.\d+)?$/.test(p)) {
        if (res.energy === undefined) res.energy = parseFloat(p);
        else if (res.to === undefined) res.to = parseFloat(p);
      } else if (/^#[0-9a-fA-F]{3,8}$/.test(p) || /^[a-zA-Z]+$/.test(p)) {
        if (/^(solid|dashed|dotted)$/i.test(p)) res.style = p.toLowerCase();
        else res.color = p;
      }
    });
    return res;
  };

  lines.forEach((line) => {
    // 1. タイプ指定
    const mType = line.match(/^(?:type|model|potential)\s*:\s*["']?([a-zA-Z_-]+)["']?$/i);
    if (mType) {
      curveType = mType[1].toLowerCase().replace(/[-]/g, '_');
      return;
    }

    // 2. タイトル
    const mTitle = line.match(/^title\s*:\s*["']?([^"']+)["']?$/i);
    if (mTitle) {
      title = mTitle[1].trim();
      return;
    }

    // 3. 軸ラベル & 単位
    const mXAxis = line.match(/^(?:xaxis|x_axis|xlabel)\s*:\s*["']?([^"']+)["']?$/i);
    if (mXAxis) {
      xAxisLabel = mXAxis[1].trim();
      return;
    }

    const mYAxis = line.match(/^(?:yaxis|y_axis|ylabel)\s*:\s*["']?([^"']+)["']?$/i);
    if (mYAxis) {
      yAxisLabel = mYAxis[1].trim();
      return;
    }

    const mXUnit = line.match(/^xunit\s*:\s*["']?([^"']+)["']?$/i);
    if (mXUnit) {
      xUnit = mXUnit[1].trim();
      return;
    }

    const mYUnit = line.match(/^(?:yunit|unit)\s*:\s*["']?([^"']+)["']?$/i);
    if (mYUnit) {
      yUnit = mYUnit[1].trim();
      return;
    }

    // 4. パラメータ指定 (De, re, a, k, color)
    const mDe = line.match(/^(?:de|depth|dissociation)\s*:\s*([-\d\.]+)/i);
    if (mDe) {
      De = parseFloat(mDe[1]);
      return;
    }

    const mRe = line.match(/^(?:re|r0|req|x0)\s*:\s*([-\d\.]+)/i);
    if (mRe) {
      re = parseFloat(mRe[1]);
      return;
    }

    const mParamA = line.match(/^(?:a|alpha)\s*:\s*([-\d\.]+)/i);
    if (mParamA) {
      a_param = parseFloat(mParamA[1]);
      return;
    }

    const mParamK = line.match(/^k\s*:\s*([-\d\.]+)/i);
    if (mParamK) {
      k_param = parseFloat(mParamK[1]);
      return;
    }

    const mColor = line.match(/^(?:color|curve_color)\s*:\s*["']?(#[0-9a-fA-F]{3,8}|[a-zA-Z]+)["']?$/i);
    if (mColor) {
      curveColor = mColor[1];
      return;
    }

    // 5. 束縛準位 / 振動準位: level: "名前" [energy, color, style]
    const mLvl = line.match(/^(?:level|v)\s*:\s*(?:"([^"]+)"|([^\s\[]+))\s*(?:\[([^\]]*)\])?$/i);
    if (mLvl) {
      const label = mLvl[1] || mLvl[2];
      const props = extractBracketProps(mLvl[3] || '');
      levels.push({
        label,
        energy: props.energy !== undefined ? props.energy : 0,
        color: props.color || '#38bdf8',
        style: props.style || 'solid'
      });
      return;
    }

    // 6. 障壁・ギャップ・活性化エネルギー: barrier: "ラベル" [from, to, x, color] または well: "..."
    const mBar = line.match(/^(?:barrier|gap|well|depth)\s*:\s*(?:"([^"]+)"|([^\s\[]+))\s*(?:\[([^\]]*)\])?$/i);
    if (mBar) {
      const label = mBar[1] || mBar[2];
      const props = extractBracketProps(mBar[3] || '');
      barriers.push({
        label,
        fromE: props.from !== undefined ? props.from : (props.energy !== undefined ? props.energy : -De),
        toE: props.to !== undefined ? props.to : 0,
        x: props.x,
        color: props.color || '#f59e0b'
      });
      return;
    }

    // 7. 反応座標ステージ (reaction用): stage: "原系" [energy: 0, x: 1]
    const mStage = line.match(/^stage\s*:\s*(?:"([^"]+)"|([^\s\[]+))\s*(?:\[([^\]]*)\])?$/i);
    if (mStage) {
      const name = mStage[1] || mStage[2];
      const props = extractBracketProps(mStage[3] || '');
      reactionStages.push({
        name,
        energy: props.energy !== undefined ? props.energy : 0,
        x: props.x,
        color: props.color
      });
      return;
    }

    // 8. 注釈点 (Annotation): note: "ラベル" [x, y, color]
    const mNote = line.match(/^(?:note|point)\s*:\s*(?:"([^"]+)"|([^\s\[]+))\s*(?:\[([^\]]*)\])?$/i);
    if (mNote) {
      const label = mNote[1] || mNote[2];
      const props = extractBracketProps(mNote[3] || '');
      annotations.push({
        label,
        x: props.x !== undefined ? props.x : re,
        y: props.y !== undefined ? props.y : -De,
        color: props.color || '#e2e8f0'
      });
      return;
    }
  });

  return {
    title,
    curveType,
    xAxisLabel,
    yAxisLabel,
    xUnit,
    yUnit,
    showAxes,
    showGrid,
    curveColor,
    De,
    re,
    a_param,
    k_param,
    V0,
    levels,
    barriers,
    annotations,
    reactionStages
  };
}

/**
 * ポテンシャル曲線 SVG 描画関数
 */
function drawPotentialDiagramSvg(rawText, container, labelText) {
  if (!container) return;
  container.innerHTML = '';

  let codeText = rawText.trim();
  const wrapperMatch = codeText.match(/^\\(?:potential|potentialcurve|potentialwell)\{([\s\S]*)\}$/i);
  if (wrapperMatch) {
    codeText = wrapperMatch[1];
  }

  const parsed = parsePotentialDiagram(codeText);
  if (!parsed) return;

  const {
    title,
    curveType,
    xAxisLabel,
    yAxisLabel,
    xUnit,
    yUnit,
    showAxes,
    showGrid,
    curveColor,
    De,
    re,
    a_param,
    k_param,
    levels,
    barriers,
    annotations,
    reactionStages
  } = parsed;

  const totalW = 860;
  const totalH = 500;
  const padTop = title ? 70 : 45;
  const padBottom = 65;
  const padLeft = 90;
  const padRight = 60;

  const plotW = totalW - padLeft - padRight;
  const plotH = totalH - padTop - padBottom;

  // 1. 関数定義およびプロット範囲の決定
  let xMin = 0.5;
  let xMax = 4.5;
  let yMin = -De * 1.25;
  let yMax = De * 0.45;

  let func = null;

  if (curveType === 'morse') {
    // モースポテンシャル: V(r) = De * (1 - exp(-a*(r - re)))^2 - De
    xMin = Math.max(0.2, re - 0.7);
    xMax = re + 3.2;
    yMin = -De * 1.15;
    yMax = De * 0.35;
    func = (r) => {
      const term = 1 - Math.exp(-a_param * (r - re));
      return De * term * term - De;
    };
  } else if (curveType === 'lennard_jones' || curveType === 'lj') {
    // レナード-ジョーンズ 12-6: V(r) = De * ((re/r)^12 - 2*(re/r)^6)
    xMin = re * 0.82;
    xMax = re * 2.8;
    yMin = -De * 1.15;
    yMax = De * 0.45;
    func = (r) => {
      const ratio = re / r;
      const r6 = Math.pow(ratio, 6);
      return De * (r6 * r6 - 2 * r6);
    };
  } else if (curveType === 'harmonic') {
    // 調和振動子: V(x) = 0.5 * k * (x - re)^2 - De
    xMin = re - 2.0;
    xMax = re + 2.0;
    yMin = -De * 1.1;
    yMax = De * 0.6;
    func = (x) => 0.5 * k_param * Math.pow(x - re, 2) - De;
  } else if (curveType === 'double_well') {
    // 二重井戸: V(x) = a * (x^2 - d^2)^2 - De
    xMin = -2.5;
    xMax = 2.5;
    yMin = -De * 1.15;
    yMax = De * 0.5;
    const barrierH = De * 0.5;
    func = (x) => {
      // 井戸中心 ±1.2
      const x2 = x * x;
      return barrierH * Math.pow(x2 - 1.44, 2) / 2.07 - De;
    };
  } else if (curveType === 'square_well') {
    // 有限井戸
    xMin = -2.5;
    xMax = 2.5;
    yMin = -De * 1.15;
    yMax = De * 0.4;
    func = (x) => (Math.abs(x) < 1.2 ? -De : 0.0);
  } else if (curveType === 'reaction' || curveType === 'profile') {
    // 化学反応プロファイル
    xMin = 0.5;
    xMax = 5.5;
    yMin = -De * 1.1;
    yMax = De * 0.8;
  }

  // 束縛準位が指定されている場合、Yレンジを考慮
  levels.forEach((lvl) => {
    if (lvl.energy < yMin) yMin = lvl.energy * 1.1;
    if (lvl.energy > yMax) yMax = lvl.energy * 1.2;
  });

  const xRange = xMax - xMin;
  const yRange = yMax - yMin;

  const xToSvg = (x) => padLeft + ((x - xMin) / xRange) * plotW;
  const yToSvg = (y) => padTop + (1 - (y - yMin) / yRange) * plotH;

  // 2. SVG 生成
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.setAttribute('viewBox', `0 0 ${totalW} ${totalH}`);
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.setAttribute('class', 'potential-svg');
  svg.style.maxWidth = `${totalW}px`;
  svg.style.margin = '0 auto';
  svg.style.display = 'block';
  svg.style.background = '#0f172a';
  svg.style.borderRadius = '12px';
  svg.style.overflow = 'hidden';

  // フィルター・マーカー
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  defs.innerHTML = `
    <marker id="pot-arrow" viewBox="0 0 10 10" refX="5" refY="2" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 2 9 L 5 2 L 8 9 Z" fill="#94a3b8" />
    </marker>
    <marker id="pot-dim-arrow-up" viewBox="0 0 10 10" refX="5" refY="2" markerWidth="5" markerHeight="5" orient="auto">
      <path d="M 1 9 L 5 1 L 9 9 Z" fill="#f59e0b" />
    </marker>
    <marker id="pot-dim-arrow-down" viewBox="0 0 10 10" refX="5" refY="8" markerWidth="5" markerHeight="5" orient="auto">
      <path d="M 1 1 L 5 9 L 9 1 Z" fill="#f59e0b" />
    </marker>
    <filter id="pot-glow" x="-20%" y="-40%" width="140%" height="180%">
      <feGaussianBlur stdDeviation="3.5" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  `;
  svg.appendChild(defs);

  // 3. タイトル
  if (title) {
    const tTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    tTxt.setAttribute('x', totalW / 2);
    tTxt.setAttribute('y', 36);
    tTxt.setAttribute('text-anchor', 'middle');
    tTxt.setAttribute('font-size', '17');
    tTxt.setAttribute('font-weight', '700');
    tTxt.setAttribute('fill', '#f1f5f9');
    tTxt.setAttribute('font-family', 'system-ui, -apple-system, sans-serif');
    tTxt.textContent = title;
    svg.appendChild(tTxt);
  }

  // 4. グリッド線 & V=0 基準破線
  if (showGrid) {
    const gridG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    // V = 0 の基準水平線 (解離限界)
    const yZero = yToSvg(0);
    if (yZero >= padTop && yZero <= padTop + plotH) {
      const zeroLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      zeroLine.setAttribute('x1', padLeft);
      zeroLine.setAttribute('y1', yZero);
      zeroLine.setAttribute('x2', padLeft + plotW);
      zeroLine.setAttribute('y2', yZero);
      zeroLine.setAttribute('stroke', '#475569');
      zeroLine.setAttribute('stroke-width', '1.2');
      zeroLine.setAttribute('stroke-dasharray', '4,4');
      gridG.appendChild(zeroLine);

      const zeroTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      zeroTxt.setAttribute('x', padLeft + plotW - 10);
      zeroTxt.setAttribute('y', yZero - 6);
      zeroTxt.setAttribute('text-anchor', 'end');
      zeroTxt.setAttribute('font-size', '11.5');
      zeroTxt.setAttribute('fill', '#94a3b8');
      zeroTxt.setAttribute('font-family', 'system-ui, -apple-system, sans-serif');
      zeroTxt.textContent = 'V = 0 (解離限界)';
      gridG.appendChild(zeroTxt);
    }
    svg.appendChild(gridG);
  }

  // 5. 軸の描画
  if (showAxes) {
    const axesG = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    // Y軸 (Energy)
    const yAxisLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    yAxisLine.setAttribute('x1', padLeft);
    yAxisLine.setAttribute('y1', padTop + plotH + 10);
    yAxisLine.setAttribute('x2', padLeft);
    yAxisLine.setAttribute('y2', padTop - 12);
    yAxisLine.setAttribute('stroke', '#94a3b8');
    yAxisLine.setAttribute('stroke-width', '1.8');
    yAxisLine.setAttribute('marker-end', 'url(#pot-arrow)');
    axesG.appendChild(yAxisLine);

    const yLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    yLabel.setAttribute('x', padLeft - 12);
    yLabel.setAttribute('y', padTop - 18);
    yLabel.setAttribute('text-anchor', 'end');
    yLabel.setAttribute('font-size', '13.5');
    yLabel.setAttribute('font-weight', '700');
    yLabel.setAttribute('fill', '#f1f5f9');
    yLabel.setAttribute('font-family', 'system-ui, -apple-system, sans-serif');
    yLabel.textContent = `${yAxisLabel} [${yUnit}]`;
    axesG.appendChild(yLabel);

    // X軸 (Distance / Reaction Coordinate)
    const xAxisLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    xAxisLine.setAttribute('x1', padLeft - 10);
    xAxisLine.setAttribute('y1', padTop + plotH);
    xAxisLine.setAttribute('x2', padLeft + plotW + 18);
    xAxisLine.setAttribute('y2', padTop + plotH);
    xAxisLine.setAttribute('stroke', '#94a3b8');
    xAxisLine.setAttribute('stroke-width', '1.8');
    xAxisLine.setAttribute('marker-end', 'url(#pot-arrow)');
    axesG.appendChild(xAxisLine);

    const xLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    xLabel.setAttribute('x', padLeft + plotW + 10);
    xLabel.setAttribute('y', padTop + plotH + 28);
    xLabel.setAttribute('text-anchor', 'end');
    xLabel.setAttribute('font-size', '13.5');
    xLabel.setAttribute('font-weight', '700');
    xLabel.setAttribute('fill', '#f1f5f9');
    xLabel.setAttribute('font-family', 'system-ui, -apple-system, sans-serif');
    xLabel.textContent = `${xAxisLabel} [${xUnit}]`;
    axesG.appendChild(xLabel);

    svg.appendChild(axesG);
  }

  // 6. ポテンシャル曲線の計算と描画
  const curveG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  curveG.setAttribute('class', 'pot-curve-group');

  if (curveType === 'reaction' || curveType === 'profile') {
    // 化学反応プロファイル（原系 -> 遷移状態 TS -> 中間体 -> 生成系）
    const defaultStages = reactionStages.length > 0 ? reactionStages : [
      { name: '原系 (Reactants)', energy: 0.0, x: 1.2 },
      { name: '遷移状態 (TS)', energy: 2.8, x: 3.0 },
      { name: '生成系 (Products)', energy: -1.5, x: 4.8 }
    ];

    // スムーズなベジェスプラインパス
    let pathD = '';
    defaultStages.forEach((st, idx) => {
      const sx = xToSvg(st.x);
      const sy = yToSvg(st.energy);

      if (idx === 0) {
        pathD += `M ${sx - 35} ${sy} L ${sx + 35} ${sy}`;
      } else {
        const prev = defaultStages[idx - 1];
        const px = xToSvg(prev.x) + 35;
        const py = yToSvg(prev.energy);
        const midX = (px + sx - 35) / 2;
        pathD += ` C ${midX} ${py}, ${midX} ${sy}, ${sx - 35} ${sy} L ${sx + 35} ${sy}`;
      }

      // ステージ名ラベル & エネルギー
      const sTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      sTxt.setAttribute('x', sx);
      sTxt.setAttribute('y', sy - 14);
      sTxt.setAttribute('text-anchor', 'middle');
      sTxt.setAttribute('font-size', '12.5');
      sTxt.setAttribute('font-weight', '700');
      sTxt.setAttribute('fill', st.color || '#38bdf8');
      sTxt.setAttribute('font-family', 'system-ui, -apple-system, sans-serif');
      sTxt.textContent = `${st.name} (${st.energy > 0 ? '+' : ''}${st.energy} ${yUnit})`;
      curveG.appendChild(sTxt);
    });

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathD);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', curveColor);
    path.setAttribute('stroke-width', '3');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('filter', 'url(#pot-glow)');
    curveG.appendChild(path);
  } else if (func) {
    // 連続関数プロット
    const points = [];
    const steps = 300;
    const dx = xRange / steps;

    for (let i = 0; i <= steps; i++) {
      const x = xMin + i * dx;
      const y = func(x);
      if (y >= yMin - yRange * 0.1 && y <= yMax + yRange * 0.1) {
        points.push({ x: xToSvg(x), y: yToSvg(y) });
      }
    }

    if (points.length > 1) {
      let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
      for (let i = 1; i < points.length; i++) {
        d += ` L ${points[i].x.toFixed(1)} ${points[i].y.toFixed(1)}`;
      }

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', curveColor);
      path.setAttribute('stroke-width', '3');
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('filter', 'url(#pot-glow)');
      curveG.appendChild(path);
    }

    // 平衡位置 re の垂線破線
    if (re >= xMin && re <= xMax && (curveType === 'morse' || curveType === 'lennard_jones' || curveType === 'harmonic')) {
      const reX = xToSvg(re);
      const reY = yToSvg(-De);
      const reLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      reLine.setAttribute('x1', reX);
      reLine.setAttribute('y1', reY);
      reLine.setAttribute('x2', reX);
      reLine.setAttribute('y2', padTop + plotH);
      reLine.setAttribute('stroke', '#64748b');
      reLine.setAttribute('stroke-width', '1.2');
      reLine.setAttribute('stroke-dasharray', '3,3');
      curveG.appendChild(reLine);

      const reTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      reTxt.setAttribute('x', reX);
      reTxt.setAttribute('y', padTop + plotH + 18);
      reTxt.setAttribute('text-anchor', 'middle');
      reTxt.setAttribute('font-size', '11.5');
      reTxt.setAttribute('fill', '#94a3b8');
      reTxt.setAttribute('font-family', 'system-ui, -apple-system, sans-serif');
      reTxt.textContent = `r_e = ${re} ${xUnit}`;
      curveG.appendChild(reTxt);
    }
  }

  svg.appendChild(curveG);

  // 7. 束縛準位 / 振動準位 (Levels) の描画（井戸の内側でクリッピング）
  if (levels.length > 0) {
    const levelsG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    levelsG.setAttribute('class', 'pot-levels-group');

    levels.forEach((lvl) => {
      const sy = yToSvg(lvl.energy);
      let leftX = padLeft + 60;
      let rightX = padLeft + plotW - 60;

      // 関数交点（転回点）の数値探索
      if (func) {
        const samples = 200;
        const dx = xRange / samples;
        let turningPoints = [];
        for (let i = 0; i < samples; i++) {
          const x1 = xMin + i * dx;
          const x2 = x1 + dx;
          const y1 = func(x1);
          const y2 = func(x2);
          if ((y1 - lvl.energy) * (y2 - lvl.energy) <= 0) {
            // 線形補間
            const t = (lvl.energy - y1) / (y2 - y1);
            turningPoints.push(x1 + t * dx);
          }
        }
        if (turningPoints.length >= 2) {
          leftX = xToSvg(turningPoints[0]);
          rightX = xToSvg(turningPoints[turningPoints.length - 1]);
        }
      }

      // 準位水平線
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', leftX);
      line.setAttribute('y1', sy);
      line.setAttribute('x2', rightX);
      line.setAttribute('y2', sy);
      line.setAttribute('stroke', lvl.color);
      line.setAttribute('stroke-width', '2');
      if (lvl.style === 'dashed') line.setAttribute('stroke-dasharray', '6,4');
      levelsG.appendChild(line);

      // 準位ラベル
      const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      txt.setAttribute('x', rightX + 8);
      txt.setAttribute('y', sy + 4);
      txt.setAttribute('text-anchor', 'start');
      txt.setAttribute('font-size', '12');
      txt.setAttribute('font-weight', '600');
      txt.setAttribute('fill', lvl.color);
      txt.setAttribute('font-family', 'system-ui, -apple-system, sans-serif');
      txt.textContent = `${lvl.label} (${lvl.energy} ${yUnit})`;
      levelsG.appendChild(txt);
    });

    svg.appendChild(levelsG);
  }

  // 8. 障壁 / 活性化エネルギー / 結合深さ寸法線 (Barriers)
  if (barriers.length > 0) {
    const barG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    barG.setAttribute('class', 'pot-barriers-group');

    barriers.forEach((b, idx) => {
      const yFrom = yToSvg(b.fromE);
      const yTo = yToSvg(b.toE);
      const bx = b.x !== undefined ? xToSvg(b.x) : padLeft + 70 + idx * 80;

      // 縦寸法線
      const dimLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      dimLine.setAttribute('x1', bx);
      dimLine.setAttribute('y1', yFrom);
      dimLine.setAttribute('x2', bx);
      dimLine.setAttribute('y2', yTo);
      dimLine.setAttribute('stroke', b.color);
      dimLine.setAttribute('stroke-width', '1.6');
      dimLine.setAttribute('marker-start', 'url(#pot-dim-arrow-down)');
      dimLine.setAttribute('marker-end', 'url(#pot-dim-arrow-up)');
      barG.appendChild(dimLine);

      // 上下ガイドヒゲ
      const topT = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      topT.setAttribute('x1', bx - 6);
      topT.setAttribute('y1', yTo);
      topT.setAttribute('x2', bx + 6);
      topT.setAttribute('y2', yTo);
      topT.setAttribute('stroke', b.color);
      topT.setAttribute('stroke-width', '1.2');
      barG.appendChild(topT);

      const botT = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      botT.setAttribute('x1', bx - 6);
      botT.setAttribute('y1', yFrom);
      botT.setAttribute('x2', bx + 6);
      botT.setAttribute('y2', yFrom);
      botT.setAttribute('stroke', b.color);
      botT.setAttribute('stroke-width', '1.2');
      barG.appendChild(botT);

      // 寸法ラベル
      const diff = Math.abs(b.toE - b.fromE).toFixed(2);
      const bTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      bTxt.setAttribute('x', bx + 8);
      bTxt.setAttribute('y', (yFrom + yTo) / 2 + 4.5);
      bTxt.setAttribute('text-anchor', 'start');
      bTxt.setAttribute('font-size', '11.5');
      bTxt.setAttribute('font-weight', '700');
      bTxt.setAttribute('fill', b.color);
      bTxt.setAttribute('font-family', 'system-ui, -apple-system, sans-serif');
      bTxt.textContent = `${b.label} (${diff} ${yUnit})`;
      barG.appendChild(bTxt);
    });

    svg.appendChild(barG);
  }

  // 9. 注釈 (Annotations)
  if (annotations.length > 0) {
    const annG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    annotations.forEach((ann) => {
      const ax = xToSvg(ann.x);
      const ay = yToSvg(ann.y);

      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('cx', ax);
      dot.setAttribute('cy', ay);
      dot.setAttribute('r', '4');
      dot.setAttribute('fill', ann.color);
      annG.appendChild(dot);

      const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      txt.setAttribute('x', ax + 8);
      txt.setAttribute('y', ay - 8);
      txt.setAttribute('font-size', '11.5');
      txt.setAttribute('font-weight', '600');
      txt.setAttribute('fill', ann.color);
      txt.setAttribute('font-family', 'system-ui, -apple-system, sans-serif');
      txt.textContent = ann.label;
      annG.appendChild(txt);
    });
    svg.appendChild(annG);
  }

  container.appendChild(svg);

  if (labelText) {
    const lbl = document.createElement('div');
    lbl.className = 'chem-structure-label';
    lbl.textContent = labelText;
    container.appendChild(lbl);
  }
}
