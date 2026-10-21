// ==========================================
// エネルギー準位図 & バンド図 (Energy Level Diagram / Band Diagram) パーサー & SVG描画エンジン
// ==========================================

function parseEnergyLevelDiagram(text) {
  if (!text || typeof text !== 'string') return null;

  const lines = text
    .split(/[\n;]+/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('//') && !l.startsWith('#'));

  let title = '';
  let unit = 'eV';
  let showAxis = true;
  let showGrid = true;
  let theme = 'dark'; // 'dark' | 'light'

  const levels = []; // { id, name, energy, color, style, x, width, labelPos }
  const bands = []; // { id, name, bottom, top, fill, stroke, opacity, x, width }
  const transitions = []; // { from, to, label, type, color, style, x, photon }
  const gaps = []; // { label, bottom, top, x, color }

  const levelMap = new Map();

  const extractBracketProps = (bracketStr) => {
    if (!bracketStr) return {};
    const res = {};
    const parts = bracketStr.split(',').map((p) => p.trim()).filter(Boolean);
    parts.forEach((p) => {
      const kv = p.match(/^([a-zA-Z_-]+)\s*[:=]\s*(.+)$/);
      if (kv) {
        const k = kv[1].toLowerCase();
        let v = kv[2].trim().replace(/^["']|["']$/g, '');
        if (['energy', 'e', 'val', 'bottom', 'top', 'x', 'width', 'w'].includes(k)) {
          res[k] = parseFloat(v) || 0;
        } else {
          res[k] = v;
        }
      } else if (/^-?\d+(?:\.\d+)?$/.test(p)) {
        if (res.energy === undefined && res.bottom === undefined) {
          res.energy = parseFloat(p);
        } else if (res.top === undefined && res.bottom !== undefined) {
          res.top = parseFloat(p);
        } else if (res.energy !== undefined && res.top === undefined) {
          res.bottom = res.energy;
          res.top = parseFloat(p);
          delete res.energy;
        }
      } else if (/^#[0-9a-fA-F]{3,8}$/.test(p) || /^(red|blue|green|purple|orange|yellow|cyan|white|gray)$/i.test(p)) {
        res.color = p;
      } else if (/^(solid|dashed|dotted)$/i.test(p)) {
        res.style = p.toLowerCase();
      } else if (/^(emission|absorption|relax|nonradiative|curl|wavy)$/i.test(p)) {
        res.type = p.toLowerCase();
      } else if (/^(left|right|center)$/i.test(p)) {
        res.labelPos = p.toLowerCase();
      }
    });
    return res;
  };

  lines.forEach((line) => {
    // 1. タイトル
    const mTitle = line.match(/^title\s*:\s*["']?([^"']+)["']?$/i);
    if (mTitle) {
      title = mTitle[1].trim();
      return;
    }

    // 2. 単位
    const mUnit = line.match(/^unit\s*:\s*["']?([^"']+)["']?$/i);
    if (mUnit) {
      unit = mUnit[1].trim();
      return;
    }

    // 3. 軸設定
    const mAxis = line.match(/^axis\s*:\s*(true|false)$/i);
    if (mAxis) {
      showAxis = mAxis[1].toLowerCase() === 'true';
      return;
    }

    // 4. グリッド設定
    const mGrid = line.match(/^(?:grid|show_grid)\s*:\s*(true|false)$/i);
    if (mGrid) {
      showGrid = mGrid[1].toLowerCase() === 'true';
      return;
    }

    // 5. テーマ
    const mTheme = line.match(/^theme\s*:\s*["']?(dark|light)["']?$/i);
    if (mTheme) {
      theme = mTheme[1].toLowerCase();
      return;
    }

    // 6. バンド (Band) 定義: band: "名前" [bottom, top, props]
    const mBand = line.match(/^band\s*:\s*(?:"([^"]+)"|([^\s\[]+))\s*(?:\[([^\]]*)\])?$/i);
    if (mBand) {
      const name = mBand[1] || mBand[2];
      const props = extractBracketProps(mBand[3] || '');
      const bObj = {
        id: name,
        name,
        bottom: props.bottom !== undefined ? props.bottom : (props.energy || 0),
        top: props.top !== undefined ? props.top : (props.bottom !== undefined ? props.bottom + 1 : 1),
        fill: props.color || props.fill || '#38bdf8',
        stroke: props.stroke || props.color || '#0284c7',
        opacity: props.opacity !== undefined ? parseFloat(props.opacity) : 0.35,
        x: props.x,
        width: props.width
      };
      bands.push(bObj);
      return;
    }

    // 7. ギャップ (Gap) 定義: gap: "名前" [bottom, top, props]
    const mGap = line.match(/^gap\s*:\s*(?:"([^"]+)"|([^\s\[]+))\s*(?:\[([^\]]*)\])?$/i);
    if (mGap) {
      const label = mGap[1] || mGap[2];
      const props = extractBracketProps(mGap[3] || '');
      gaps.push({
        label,
        bottom: props.bottom !== undefined ? props.bottom : (props.energy || 0),
        top: props.top !== undefined ? props.top : 1,
        x: props.x,
        color: props.color || '#f59e0b'
      });
      return;
    }

    // 8. 遷移 (Transition) 定義: from -> to: "ラベル" [props] または from ~> to
    const mTrans = line.match(/^([a-zA-Z0-9_\u3000-\u30fe\u4e00-\u9fa5\s\.\-]+)\s*(->|~>|-->)\s*([a-zA-Z0-9_\u3000-\u30fe\u4e00-\u9fa5\s\.\-]+)(?:\s*:\s*(?:"([^"]+)"|([^\[]+)))?(?:\s*\[([^\]]*)\])?$/);
    if (mTrans) {
      const from = mTrans[1].trim().replace(/^["']|["']$/g, '');
      const arrowOp = mTrans[2];
      const to = mTrans[3].trim().replace(/^["']|["']$/g, '');
      const label = (mTrans[4] || mTrans[5] || '').trim();
      const props = extractBracketProps(mTrans[6] || '');

      let tType = props.type;
      if (!tType) {
        if (arrowOp === '~>' || arrowOp === '-->') tType = 'relax';
      }

      transitions.push({
        from,
        to,
        label,
        type: tType, // emission | absorption | relax
        color: props.color,
        style: props.style || (arrowOp === '-->' ? 'dashed' : 'solid'),
        x: props.x,
        photon: props.photon
      });
      return;
    }

    // 9. 準位 (Level) 明示指定: level: id "ラベル" [props] または fermi: "..." [...]
    const mLevelEx = line.match(/^(level|fermi)\s*:\s*(?:([a-zA-Z0-9_]+)\s+)?(?:"([^"]+)"|([^\s\[]+))\s*(?:\[([^\]]*)\])?$/i);
    if (mLevelEx) {
      const isFermi = mLevelEx[1].toLowerCase() === 'fermi';
      const id = mLevelEx[2] || (mLevelEx[3] || mLevelEx[4]);
      const name = mLevelEx[3] || mLevelEx[4];
      const props = extractBracketProps(mLevelEx[5] || '');
      const lvl = {
        id,
        name,
        energy: props.energy !== undefined ? props.energy : 0,
        color: props.color || (isFermi ? '#10b981' : '#38bdf8'),
        style: props.style || (isFermi ? 'dashed' : 'solid'),
        x: props.x,
        width: props.width,
        labelPos: props.labelPos || 'right'
      };
      levels.push(lvl);
      levelMap.set(id, lvl);
      levelMap.set(name, lvl);
      return;
    }

    // 10. 簡易構文準位: id: "名前" [props] または "名前" [props]
    const mSimpleLvl = line.match(/^(?:([a-zA-Z0-9_]+)\s*:\s*)?(?:"([^"]+)"|([a-zA-Z0-9_\u3000-\u30fe\u4e00-\u9fa5\.\-]+))\s*\[([^\]]+)\]$/);
    if (mSimpleLvl) {
      const id = mSimpleLvl[1] || mSimpleLvl[2] || mSimpleLvl[3];
      const name = mSimpleLvl[2] || mSimpleLvl[3] || id;
      const props = extractBracketProps(mSimpleLvl[4]);
      if (props.energy !== undefined) {
        const lvl = {
          id,
          name,
          energy: props.energy,
          color: props.color || '#38bdf8',
          style: props.style || 'solid',
          x: props.x,
          width: props.width,
          labelPos: props.labelPos || 'right'
        };
        levels.push(lvl);
        levelMap.set(id, lvl);
        levelMap.set(name, lvl);
      }
    }
  });

  return {
    title,
    unit,
    showAxis,
    showGrid,
    theme,
    levels,
    bands,
    transitions,
    gaps,
    levelMap
  };
}

/**
 * エネルギー準位図 SVG 描画関数
 */
function drawEnergyLevelDiagramSvg(rawText, container, labelText) {
  if (!container) return;
  container.innerHTML = '';

  let codeText = rawText.trim();
  const wrapperMatch = codeText.match(/^\\(?:energylevel|energy|banddiagram)\{([\s\S]*)\}$/i);
  if (wrapperMatch) {
    codeText = wrapperMatch[1];
  }

  // 1. pn接合 (熱平衡) 判定
  if (/type\s*:\s*(?:pn_junction|pn(?!_bias))/i.test(codeText)) {
    renderPnJunctionSvg(codeText, container, labelText);
    return;
  }

  // 2. pn接合バイアス比較 (順バイアス vs 逆バイアス) 判定
  if (/type\s*:\s*(?:pn_bias_comparison|bias_comparison|pn_bias)/i.test(codeText)) {
    renderPnBiasComparisonSvg(codeText, container, labelText);
    return;
  }

  // 3. 状態密度 (DOS) 判定
  if (/type\s*:\s*(?:dos|density_of_states|状態密度)/i.test(codeText)) {
    renderDosDiagramSvg(codeText, container, labelText);
    return;
  }

  // 4. 電子殻から結晶バンド形成 & ボーア量子条件 判定
  if (/type\s*:\s*(?:band_formation|atom_to_band|shell_to_band|電子殻)/i.test(codeText)) {
    renderBandFormationSvg(codeText, container, labelText);
    return;
  }

  // 5. ボーア原子模型の光吸収・励起 判定
  if (/type\s*:\s*(?:bohr_excitation|bohr_atom|photo_excitation|ボーア|励起)/i.test(codeText)) {
    renderBohrExcitationSvg(codeText, container, labelText);
    return;
  }

  const parsed = parseEnergyLevelDiagram(codeText);
  if (!parsed || (parsed.levels.length === 0 && parsed.bands.length === 0)) {
    const err = document.createElement('div');
    err.className = 'chem-render-error';
    err.textContent = 'エネルギー準位図の構文エラー: 準位 n1: "基底状態" [-13.6] またはバンド band: "伝導帯" [1.1, 2.0] が必要です。';
    container.appendChild(err);
    return;
  }

  const { title, unit, showAxis, showGrid, theme, levels, bands, transitions, gaps, levelMap } = parsed;

  const isDark = theme === 'dark';
  const bgColor = isDark ? '#0f172a' : '#ffffff';
  const textColor = isDark ? '#f1f5f9' : '#1e293b';
  const subTextColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? '#334155' : '#e2e8f0';
  const axisColor = isDark ? '#cbd5e1' : '#475569';

  // 1. エネルギー範囲（最小値・最大値）の算出
  let allEnergies = [];
  levels.forEach((l) => allEnergies.push(l.energy));
  bands.forEach((b) => {
    allEnergies.push(b.bottom);
    allEnergies.push(b.top);
  });
  gaps.forEach((g) => {
    allEnergies.push(g.bottom);
    allEnergies.push(g.top);
  });

  if (allEnergies.length === 0) allEnergies = [0, 1];
  let minE = Math.min(...allEnergies);
  let maxE = Math.max(...allEnergies);

  if (minE === maxE) {
    minE -= 1;
    maxE += 1;
  }

  // 余白（マージン）を上下12%追加
  const range = maxE - minE;
  const padE = range * 0.12;
  const plotMinE = minE - padE;
  const plotMaxE = maxE + padE;
  const plotRangeE = plotMaxE - plotMinE;

  // 2. レイアウト寸法
  const totalW = 860;
  const totalH = 500;
  const padTop = title ? 70 : 45;
  const padBottom = 55;
  const padLeft = showAxis ? 130 : 60;
  const padRight = 80;

  const plotW = totalW - padLeft - padRight;
  const plotH = totalH - padTop - padBottom;

  // Y座標変換関数 (エネルギー大 -> Y小)
  const energyToY = (e) => {
    const ratio = (e - plotMinE) / plotRangeE;
    return padTop + plotH * (1 - ratio);
  };

  // 3. SVG 要素生成
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.setAttribute('viewBox', `0 0 ${totalW} ${totalH}`);
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.setAttribute('class', 'energylevel-svg');
  svg.style.maxWidth = `${totalW}px`;
  svg.style.margin = '0 auto';
  svg.style.display = 'block';
  svg.style.background = bgColor;
  svg.style.borderRadius = '12px';
  svg.style.overflow = 'hidden';

  // フィルター・マーカー定義
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  defs.innerHTML = `
    <!-- 矢頭マーカー: 下向き/上向き/汎用 -->
    <marker id="el-arrow-down" viewBox="0 0 10 10" refX="5" refY="8" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 1 1 L 5 9 L 9 1 Z" fill="context-stroke" />
    </marker>
    <marker id="el-arrow-up" viewBox="0 0 10 10" refX="5" refY="2" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 1 9 L 5 1 L 9 9 Z" fill="context-stroke" />
    </marker>
    <marker id="el-axis-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M 1 1 L 9 5 L 1 9 Z" fill="${axisColor}" />
    </marker>
    <marker id="el-gap-arrow-start" viewBox="0 0 10 10" refX="5" refY="2" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 1 9 L 5 1 L 9 9 Z" fill="#f59e0b" />
    </marker>
    <marker id="el-gap-arrow-end" viewBox="0 0 10 10" refX="5" refY="8" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 1 1 L 5 9 L 9 1 Z" fill="#f59e0b" />
    </marker>

    <!-- 発光グローフィルター -->
    <filter id="el-glow" x="-20%" y="-40%" width="140%" height="180%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <!-- バンド用グラデーションパターン -->
    <linearGradient id="el-band-grad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.5" />
      <stop offset="100%" stop-color="#0284c7" stop-opacity="0.15" />
    </linearGradient>
  `;
  svg.appendChild(defs);

  // 4. タイトル描画
  if (title) {
    const titleText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    titleText.setAttribute('x', totalW / 2);
    titleText.setAttribute('y', 36);
    titleText.setAttribute('text-anchor', 'middle');
    titleText.setAttribute('font-size', '17');
    titleText.setAttribute('font-weight', '700');
    titleText.setAttribute('fill', textColor);
    titleText.setAttribute('font-family', 'system-ui, -apple-system, sans-serif');
    titleText.textContent = title;
    svg.appendChild(titleText);
  }

  // 5. グリッド線 & エネルギー目盛りの自動生成
  if (showGrid || showAxis) {
    const gridG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    gridG.setAttribute('class', 'el-grid-group');

    // 適切な刻み幅 step を計算
    const roughStep = plotRangeE / 6;
    const mag = Math.pow(10, Math.floor(Math.log10(roughStep)));
    const rem = roughStep / mag;
    let step = mag;
    if (rem > 5) step = 5 * mag;
    else if (rem > 2) step = 2 * mag;

    const startTick = Math.ceil(plotMinE / step) * step;
    for (let e = startTick; e <= plotMaxE; e += step) {
      const y = energyToY(e);
      if (y < padTop - 5 || y > padTop + plotH + 5) continue;

      if (showGrid) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', padLeft);
        line.setAttribute('y1', y);
        line.setAttribute('x2', padLeft + plotW);
        line.setAttribute('y2', y);
        line.setAttribute('stroke', gridColor);
        line.setAttribute('stroke-width', '1');
        line.setAttribute('stroke-dasharray', '3,3');
        line.setAttribute('opacity', '0.6');
        gridG.appendChild(line);
      }

      if (showAxis) {
        // 目盛りテキスト
        const tickTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        tickTxt.setAttribute('x', padLeft - 18);
        tickTxt.setAttribute('y', y + 4.5);
        tickTxt.setAttribute('text-anchor', 'end');
        tickTxt.setAttribute('font-size', '11.5');
        tickTxt.setAttribute('font-family', 'system-ui, -apple-system, sans-serif');
        tickTxt.setAttribute('fill', subTextColor);
        // 浮動小数点誤差の丸め
        const roundedE = Math.abs(e) < 1e-9 ? 0 : parseFloat(e.toFixed(2));
        tickTxt.textContent = roundedE.toString();
        gridG.appendChild(tickTxt);

        // 目盛りピン
        const pin = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        pin.setAttribute('x1', padLeft - 8);
        pin.setAttribute('y1', y);
        pin.setAttribute('x2', padLeft);
        pin.setAttribute('y2', y);
        pin.setAttribute('stroke', axisColor);
        pin.setAttribute('stroke-width', '1.2');
        gridG.appendChild(pin);
      }
    }
    svg.appendChild(gridG);
  }

  // 6. エネルギー縦軸 (E-Axis)
  if (showAxis) {
    const axisG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    axisG.setAttribute('class', 'el-axis-group');

    // 軸矢印線
    const axisLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    axisLine.setAttribute('x1', padLeft);
    axisLine.setAttribute('y1', padTop + plotH + 15);
    axisLine.setAttribute('x2', padLeft);
    axisLine.setAttribute('y2', padTop - 18);
    axisLine.setAttribute('stroke', axisColor);
    axisLine.setAttribute('stroke-width', '2');
    axisLine.setAttribute('marker-end', 'url(#el-axis-arrow)');
    axisG.appendChild(axisLine);

    // 軸ラベル: "Energy E [eV]"
    const axisLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    axisLabel.setAttribute('x', padLeft - 12);
    axisLabel.setAttribute('y', padTop - 25);
    axisLabel.setAttribute('text-anchor', 'end');
    axisLabel.setAttribute('font-size', '13.5');
    axisLabel.setAttribute('font-weight', '700');
    axisLabel.setAttribute('fill', textColor);
    axisLabel.setAttribute('font-family', 'system-ui, -apple-system, sans-serif');
    axisLabel.textContent = `Energy [${unit}]`;
    axisG.appendChild(axisLabel);

    svg.appendChild(axisG);
  }

  // 準位線の描画可能領域
  const levelStartX = padLeft + 40;
  const levelW = plotW - 120;

  // 7. エネルギーバンド (帯) の描画
  if (bands.length > 0) {
    const bandsG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    bandsG.setAttribute('class', 'el-bands-group');

    bands.forEach((b) => {
      const yTop = energyToY(b.top);
      const yBot = energyToY(b.bottom);
      const h = Math.abs(yBot - yTop);
      const bx = b.x !== undefined ? padLeft + b.x : levelStartX;
      const bw = b.width !== undefined ? b.width : levelW;

      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', bx);
      rect.setAttribute('y', Math.min(yTop, yBot));
      rect.setAttribute('width', bw);
      rect.setAttribute('height', Math.max(4, h));
      rect.setAttribute('rx', '4');
      rect.setAttribute('fill', b.fill);
      rect.setAttribute('fill-opacity', b.opacity);
      rect.setAttribute('stroke', b.stroke);
      rect.setAttribute('stroke-width', '1.8');
      bandsG.appendChild(rect);

      // バンドラベル
      const bTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      bTxt.setAttribute('x', bx + bw / 2);
      bTxt.setAttribute('y', Math.min(yTop, yBot) + h / 2 + 5);
      bTxt.setAttribute('text-anchor', 'middle');
      bTxt.setAttribute('font-size', '13');
      bTxt.setAttribute('font-weight', '700');
      bTxt.setAttribute('fill', textColor);
      bTxt.setAttribute('font-family', 'system-ui, -apple-system, sans-serif');
      bTxt.textContent = `${b.name} (${b.bottom} ~ ${b.top} ${unit})`;
      bandsG.appendChild(bTxt);
    });
    svg.appendChild(bandsG);
  }

  // 8. 離散エネルギー準位 (Levels) の描画
  const levelsG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  levelsG.setAttribute('class', 'el-levels-group');

  levels.forEach((lvl) => {
    const y = energyToY(lvl.energy);
    const lx = lvl.x !== undefined ? padLeft + lvl.x : levelStartX;
    const lw = lvl.width !== undefined ? lvl.width : levelW;

    // グロー背景線（発光ネオン効果）
    if (isDark && lvl.style === 'solid') {
      const glowLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      glowLine.setAttribute('x1', lx);
      glowLine.setAttribute('y1', y);
      glowLine.setAttribute('x2', lx + lw);
      glowLine.setAttribute('y2', y);
      glowLine.setAttribute('stroke', lvl.color);
      glowLine.setAttribute('stroke-width', '6');
      glowLine.setAttribute('stroke-opacity', '0.25');
      glowLine.setAttribute('filter', 'url(#el-glow)');
      levelsG.appendChild(glowLine);
    }

    // 準位実線/破線
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', lx);
    line.setAttribute('y1', y);
    line.setAttribute('x2', lx + lw);
    line.setAttribute('y2', y);
    line.setAttribute('stroke', lvl.color);
    line.setAttribute('stroke-width', '2.5');
    if (lvl.style === 'dashed') {
      line.setAttribute('stroke-dasharray', '8,5');
    } else if (lvl.style === 'dotted') {
      line.setAttribute('stroke-dasharray', '3,4');
    }
    levelsG.appendChild(line);

    // 準位ラベル（右端または指定位置）
    const lblX = lx + lw + 12;
    const nameTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    nameTxt.setAttribute('x', lblX);
    nameTxt.setAttribute('y', y + 4.5);
    nameTxt.setAttribute('text-anchor', 'start');
    nameTxt.setAttribute('font-size', '12.5');
    nameTxt.setAttribute('font-weight', '700');
    nameTxt.setAttribute('fill', textColor);
    nameTxt.setAttribute('font-family', 'system-ui, -apple-system, sans-serif');
    nameTxt.textContent = lvl.name;
    levelsG.appendChild(nameTxt);

    // エネルギー値バッジ
    const valTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    valTxt.setAttribute('x', lx - 10);
    valTxt.setAttribute('y', y + 4.5);
    valTxt.setAttribute('text-anchor', 'end');
    valTxt.setAttribute('font-size', '11.5');
    valTxt.setAttribute('font-weight', '600');
    valTxt.setAttribute('fill', lvl.color);
    valTxt.setAttribute('font-family', 'system-ui, -apple-system, sans-serif');
    valTxt.textContent = `${lvl.energy} ${unit}`;
    levelsG.appendChild(valTxt);
  });
  svg.appendChild(levelsG);

  // 9. バンドギャップ (Gap) の描画（両端矢印）
  if (gaps.length > 0) {
    const gapsG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    gapsG.setAttribute('class', 'el-gaps-group');

    gaps.forEach((g, idx) => {
      const yTop = energyToY(g.top);
      const yBot = energyToY(g.bottom);
      const gx = g.x !== undefined ? padLeft + g.x : levelStartX + levelW - 60 - idx * 70;

      // ギャップ寸法線
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', gx);
      line.setAttribute('y1', yBot - 4);
      line.setAttribute('x2', gx);
      line.setAttribute('y2', yTop + 4);
      line.setAttribute('stroke', g.color);
      line.setAttribute('stroke-width', '1.8');
      line.setAttribute('marker-start', 'url(#el-gap-arrow-start)');
      line.setAttribute('marker-end', 'url(#el-gap-arrow-end)');
      gapsG.appendChild(line);

      // 上下ガイドヒゲ線
      const topBar = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      topBar.setAttribute('x1', gx - 8);
      topBar.setAttribute('y1', yTop);
      topBar.setAttribute('x2', gx + 8);
      topBar.setAttribute('y2', yTop);
      topBar.setAttribute('stroke', g.color);
      topBar.setAttribute('stroke-width', '1.5');
      gapsG.appendChild(topBar);

      const botBar = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      botBar.setAttribute('x1', gx - 8);
      botBar.setAttribute('y1', yBot);
      botBar.setAttribute('x2', gx + 8);
      botBar.setAttribute('y2', yBot);
      botBar.setAttribute('stroke', g.color);
      botBar.setAttribute('stroke-width', '1.5');
      gapsG.appendChild(botBar);

      // ラベルテキスト
      const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      txt.setAttribute('x', gx + 8);
      txt.setAttribute('y', (yTop + yBot) / 2 + 4.5);
      txt.setAttribute('text-anchor', 'start');
      txt.setAttribute('font-size', '11.5');
      txt.setAttribute('font-weight', '700');
      txt.setAttribute('fill', g.color);
      txt.setAttribute('font-family', 'system-ui, -apple-system, sans-serif');
      txt.textContent = g.label;
      gapsG.appendChild(txt);
    });
    svg.appendChild(gapsG);
  }

  // 10. 遷移・光子過程 (Transitions) の描画
  if (transitions.length > 0) {
    const transG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    transG.setAttribute('class', 'el-transitions-group');

    // 遷移矢印のX座標自動分散
    const transCount = transitions.length;
    const transSpacing = Math.min(110, (levelW * 0.7) / Math.max(1, transCount));
    const transStartX = levelStartX + 60;

    transitions.forEach((tr, idx) => {
      // 始点と終点のエネルギー取得
      let fromE = null;
      let toE = null;

      if (levelMap.has(tr.from)) fromE = levelMap.get(tr.from).energy;
      else if (/^-?\d+(?:\.\d+)?$/.test(tr.from)) fromE = parseFloat(tr.from);

      if (levelMap.has(tr.to)) toE = levelMap.get(tr.to).energy;
      else if (/^-?\d+(?:\.\d+)?$/.test(tr.to)) toE = parseFloat(tr.to);

      if (fromE === null || toE === null) return;

      const yFrom = energyToY(fromE);
      const yTo = energyToY(toE);
      const isDown = yTo > yFrom; // Y大 = エネルギー小 (放出/緩和)
      const isEmission = tr.type === 'emission' || (isDown && tr.type !== 'relax');
      const isRelax = tr.type === 'relax' || tr.type === 'nonradiative';

      const tx = tr.x !== undefined ? padLeft + tr.x : transStartX + idx * transSpacing;
      const tColor = tr.color || (isRelax ? '#94a3b8' : (isEmission ? '#ef4444' : '#38bdf8'));

      if (isRelax) {
        // 無放射緩和: ジグザグまたは波線の下向き矢印
        const zigPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const numZigs = 6;
        const dy = (yTo - yFrom) / numZigs;
        let d = `M ${tx} ${yFrom}`;
        for (let i = 1; i <= numZigs; i++) {
          const cx = tx + (i % 2 === 1 ? 6 : -6);
          const cy = yFrom + (i - 0.5) * dy;
          d += ` Q ${cx} ${cy}, ${tx} ${yFrom + i * dy}`;
        }
        zigPath.setAttribute('d', d);
        zigPath.setAttribute('fill', 'none');
        zigPath.setAttribute('stroke', tColor);
        zigPath.setAttribute('stroke-width', '2');
        zigPath.setAttribute('stroke-dasharray', '4,3');
        transG.appendChild(zigPath);

        // 先端の矢印
        const arr = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        arr.setAttribute('points', `${tx},${yTo} ${tx - 4},${yTo - 8} ${tx + 4},${yTo - 8}`);
        arr.setAttribute('fill', tColor);
        transG.appendChild(arr);
      } else {
        // 放射遷移 (Emission/Absorption): 直線矢印
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', tx);
        line.setAttribute('y1', yFrom);
        line.setAttribute('x2', tx);
        line.setAttribute('y2', yTo);
        line.setAttribute('stroke', tColor);
        line.setAttribute('stroke-width', '2.2');
        if (tr.style === 'dashed') line.setAttribute('stroke-dasharray', '5,4');
        transG.appendChild(line);

        // 矢印の先端
        const arr = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        if (isDown) {
          arr.setAttribute('points', `${tx},${yTo} ${tx - 4.5},${yTo - 9} ${tx + 4.5},${yTo - 9}`);
        } else {
          arr.setAttribute('points', `${tx},${yTo} ${tx - 4.5},${yTo + 9} ${tx + 4.5},${yTo + 9}`);
        }
        arr.setAttribute('fill', tColor);
        transG.appendChild(arr);

        // フォトン波線（サイン波 hν の放出/入射演出）
        const waveG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        const waveMidY = (yFrom + yTo) / 2;
        const wavePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const waveDir = isEmission ? 1 : -1; // 放出は右へ飛ぶ、吸収は左から入る
        const waveStartX = tx + (isEmission ? 10 : -45);
        let waveD = `M ${waveStartX} ${waveMidY}`;
        for (let w = 0; w < 4; w++) {
          const wx1 = waveStartX + (w * 8 + 2) * waveDir;
          const wy1 = waveMidY - 5;
          const wx2 = waveStartX + (w * 8 + 6) * waveDir;
          const wy2 = waveMidY + 5;
          const wxEnd = waveStartX + (w + 1) * 8 * waveDir;
          waveD += ` Q ${wx1} ${wy1}, ${(wx1 + wx2) / 2} ${waveMidY} Q ${wx2} ${wy2}, ${wxEnd} ${waveMidY}`;
        }
        wavePath.setAttribute('d', waveD);
        wavePath.setAttribute('fill', 'none');
        wavePath.setAttribute('stroke', tColor);
        wavePath.setAttribute('stroke-width', '1.6');
        waveG.appendChild(wavePath);
        transG.appendChild(waveG);
      }

      // 遷移ラベル
      if (tr.label) {
        const midY = (yFrom + yTo) / 2;
        const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        txt.setAttribute('x', tx + 8);
        txt.setAttribute('y', midY - 6);
        txt.setAttribute('text-anchor', 'start');
        txt.setAttribute('font-size', '11.5');
        txt.setAttribute('font-weight', '700');
        txt.setAttribute('fill', tColor);
        txt.setAttribute('font-family', 'system-ui, -apple-system, sans-serif');
        txt.textContent = tr.label;
        transG.appendChild(txt);
      }
    });
    svg.appendChild(transG);
  }

  container.appendChild(svg);

  if (labelText) {
    const lbl = document.createElement('div');
    lbl.className = 'chem-structure-label';
    lbl.textContent = labelText;
    container.appendChild(lbl);
  }
}

/**
 * 簡易 key-value パーサー
 */
function parseKeyValueProps(text) {
  const result = {};
  const lines = text
    .split(/[\n;]+/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('//') && !l.startsWith('#'));
  lines.forEach((l) => {
    const m = l.match(/^([a-zA-Z0-9_\-]+)\s*[:=]\s*(.+)$/);
    if (m) {
      const k = m[1].toLowerCase();
      let v = m[2].trim().replace(/^["']|["']$/g, '');
      result[k] = v;
    }
  });
  return result;
}

// ==========================================
// 1. pn接合エネルギーバンド図 (熱平衡・バイアスなし) 描画
// ==========================================
function renderPnJunctionSvg(codeText, container, labelText) {
  const props = parseKeyValueProps(codeText);
  const title = props.title || 'pn接合のエネルギーバンド図（熱平衡状態・バイアスなし）';
  const pRegion = props.p_region || 'p型領域（正孔が多数）';
  const depletion = props.depletion || '空乏層（キャリアなし）';
  const nRegion = props.n_region || 'n型領域（電子が多数）';
  const vbiLabel = props.vbi_label || 'qVbi（内蔵電位）';
  const vbiSub = props.vbi_sub || 'Siで約0.6〜0.7 V';
  const barrierText = props.barrier_text || '障壁qVbiを越えられない';
  const holeLabel = props.hole_label || '正孔（多数キャリア）';
  const electronLabel = props.electron_label || '電子（多数キャリア）';
  const efNote = props.ef_note || '熱平衡ではEFは一直線';
  const wLabel = props.w_label || '空乏層幅 W';
  const note1 = props.note1 || '・接合するとn側の電子とp側の正孔が拡散・再結合し、接合部に空乏層と内蔵電位qVbiが形成されバンドが曲がる';
  const note2 = props.note2 || '・この障壁が拡散を止めた状態が熱平衡 ─ 順バイアスで障壁が下がると電流が流れる（整流作用の起源）';

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 860 480');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.setAttribute('class', 'energylevel-svg');
  svg.style.maxWidth = '860px';
  svg.style.margin = '0 auto';
  svg.style.display = 'block';
  svg.style.background = '#f8fafc';
  svg.style.borderRadius = '14px';
  svg.style.border = '1px solid #e2e8f0';

  svg.innerHTML = `
    <defs>
      <marker id="pn-arr-down" viewBox="0 0 10 10" refX="5" refY="8" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 1 1 L 5 9 L 9 1 Z" fill="#475569" />
      </marker>
      <marker id="pn-arr-up" viewBox="0 0 10 10" refX="5" refY="2" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 1 9 L 5 1 L 9 9 Z" fill="#475569" />
      </marker>
      <marker id="pn-w-left" viewBox="0 0 10 10" refX="2" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 9 1 L 1 5 L 9 9 Z" fill="#475569" />
      </marker>
      <marker id="pn-w-right" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 1 1 L 9 5 L 1 9 Z" fill="#475569" />
      </marker>
    </defs>

    <!-- タイトル -->
    <text x="430" y="38" text-anchor="middle" font-size="18" font-weight="700" fill="#0f172a" font-family="system-ui, -apple-system, sans-serif">${title}</text>

    <!-- 領域タブ -->
    <g transform="translate(0, 54)">
      <!-- p型領域 -->
      <rect x="60" y="0" width="245" height="30" rx="6" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.2" />
      <text x="182" y="20" text-anchor="middle" font-size="13" font-weight="700" fill="#92400e" font-family="system-ui, -apple-system, sans-serif">${pRegion}</text>

      <!-- 空乏層 -->
      <rect x="312" y="0" width="186" height="30" rx="6" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1.2" />
      <text x="405" y="20" text-anchor="middle" font-size="13" font-weight="700" fill="#475569" font-family="system-ui, -apple-system, sans-serif">${depletion}</text>

      <!-- n型領域 -->
      <rect x="505" y="0" width="245" height="30" rx="6" fill="#dbeafe" stroke="#93c5fd" stroke-width="1.2" />
      <text x="627" y="20" text-anchor="middle" font-size="13" font-weight="700" fill="#1e40af" font-family="system-ui, -apple-system, sans-serif">${nRegion}</text>
    </g>

    <!-- 空乏層境界縦破線 -->
    <line x1="312" y1="84" x2="312" y2="395" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4,4" />
    <line x1="498" y1="84" x2="498" y2="395" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4,4" />

    <!-- 伝導帯 Ec -->
    <path d="M 60 125 L 312 125 C 375 125, 435 215, 498 215 L 750 215" fill="none" stroke="#1d4ed8" stroke-width="3.5" stroke-linecap="round" />
    <text x="68" y="115" font-size="15" font-weight="700" fill="#1d4ed8" font-family="system-ui, -apple-system, sans-serif">Ec</text>

    <!-- 価電子帯 Ev -->
    <path d="M 60 275 L 312 275 C 375 275, 435 365, 498 365 L 750 365" fill="none" stroke="#b45309" stroke-width="3.5" stroke-linecap="round" />
    <text x="68" y="295" font-size="15" font-weight="700" fill="#b45309" font-family="system-ui, -apple-system, sans-serif">Ev</text>

    <!-- フェルミ準位 EF -->
    <line x1="60" y1="248" x2="750" y2="248" stroke="#7c3aed" stroke-width="2" stroke-dasharray="6,4" />
    <text x="756" y="253" font-size="14" font-weight="700" fill="#7c3aed" font-family="system-ui, -apple-system, sans-serif">EF</text>
    <text x="745" y="234" text-anchor="end" font-size="11" fill="#7c3aed" font-family="system-ui, -apple-system, sans-serif">${efNote}</text>

    <!-- キャリア (正孔多数キャリア: Ev下) -->
    <g transform="translate(120, 295)">
      <circle cx="0" cy="0" r="8" fill="#ffffff" stroke="#dc2626" stroke-width="1.8" />
      <text x="0" y="4" text-anchor="middle" font-size="13" font-weight="700" fill="#dc2626">+</text>
    </g>
    <g transform="translate(170, 295)">
      <circle cx="0" cy="0" r="8" fill="#ffffff" stroke="#dc2626" stroke-width="1.8" />
      <text x="0" y="4" text-anchor="middle" font-size="13" font-weight="700" fill="#dc2626">+</text>
    </g>
    <g transform="translate(220, 295)">
      <circle cx="0" cy="0" r="8" fill="#ffffff" stroke="#dc2626" stroke-width="1.8" />
      <text x="0" y="4" text-anchor="middle" font-size="13" font-weight="700" fill="#dc2626">+</text>
    </g>
    <text x="170" y="328" text-anchor="middle" font-size="11.5" fill="#b45309" font-family="system-ui, -apple-system, sans-serif">${holeLabel}</text>

    <!-- キャリア (電子多数キャリア: Ec上) -->
    <g transform="translate(630, 195)">
      <circle cx="0" cy="0" r="8" fill="#2563eb" />
      <text x="0" y="4" text-anchor="middle" font-size="14" font-weight="700" fill="#ffffff">-</text>
    </g>
    <g transform="translate(675, 195)">
      <circle cx="0" cy="0" r="8" fill="#2563eb" />
      <text x="0" y="4" text-anchor="middle" font-size="14" font-weight="700" fill="#ffffff">-</text>
    </g>
    <g transform="translate(720, 195)">
      <circle cx="0" cy="0" r="8" fill="#2563eb" />
      <text x="0" y="4" text-anchor="middle" font-size="14" font-weight="700" fill="#ffffff">-</text>
    </g>
    <text x="675" y="165" text-anchor="middle" font-size="11.5" fill="#1d4ed8" font-family="system-ui, -apple-system, sans-serif">${electronLabel}</text>

    <!-- 内蔵電位 qVbi 障壁 -->
    <line x1="312" y1="125" x2="525" y2="125" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="3,3" />
    <line x1="525" y1="125" x2="525" y2="215" stroke="#475569" stroke-width="1.6" marker-start="url(#pn-arr-up)" marker-end="url(#pn-arr-down)" />
    <text x="532" y="156" font-size="11.5" font-weight="700" fill="#dc2626" font-family="system-ui, -apple-system, sans-serif">${vbiLabel}</text>
    <text x="532" y="172" font-size="10.5" fill="#64748b" font-family="system-ui, -apple-system, sans-serif">${vbiSub}</text>

    <!-- 障壁を越えられない電子の斜め点線と×印 -->
    <path d="M 500 200 L 435 135" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="3,3" />
    <text x="450" y="138" text-anchor="middle" font-size="16" font-weight="700" fill="#dc2626">×</text>
    <text x="450" y="120" text-anchor="middle" font-size="11" fill="#64748b" font-family="system-ui, -apple-system, sans-serif">${barrierText}</text>

    <!-- 空乏層幅 W -->
    <line x1="312" y1="395" x2="498" y2="395" stroke="#475569" stroke-width="1.5" marker-start="url(#pn-w-left)" marker-end="url(#pn-w-right)" />
    <text x="405" y="388" text-anchor="middle" font-size="12" font-weight="700" fill="#475569" font-family="system-ui, -apple-system, sans-serif">${wLabel}</text>

    <!-- 下部説明枠 -->
    <rect x="60" y="415" width="740" height="50" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" />
    <text x="75" y="435" font-size="11.5" fill="#475569" font-family="system-ui, -apple-system, sans-serif">${note1}</text>
    <text x="75" y="453" font-size="11.5" fill="#475569" font-family="system-ui, -apple-system, sans-serif">${note2}</text>
  `;

  container.appendChild(svg);
  if (labelText) {
    const lbl = document.createElement('div');
    lbl.className = 'chem-structure-label';
    lbl.textContent = labelText;
    container.appendChild(lbl);
  }
}

// ==========================================
// 2. pn接合バイアス比較 (順バイアス vs 逆バイアス) 描画
// ==========================================
function renderPnBiasComparisonSvg(codeText, container, labelText) {
  const props = parseKeyValueProps(codeText);
  const title = props.title || 'pn接合のバイアスとバンドの変化 ─ 順バイアス vs 逆バイアス';

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 860 480');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.setAttribute('class', 'energylevel-svg');
  svg.style.maxWidth = '860px';
  svg.style.margin = '0 auto';
  svg.style.display = 'block';
  svg.style.background = '#f8fafc';
  svg.style.borderRadius = '14px';
  svg.style.border = '1px solid #e2e8f0';

  svg.innerHTML = `
    <defs>
      <marker id="bias-arr-up" viewBox="0 0 10 10" refX="5" refY="2" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 1 9 L 5 1 L 9 9 Z" fill="#475569" />
      </marker>
      <marker id="bias-arr-down" viewBox="0 0 10 10" refX="5" refY="8" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 1 1 L 5 9 L 9 1 Z" fill="#475569" />
      </marker>
      <marker id="bias-arr-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 1 1 L 9 5 L 1 9 Z" fill="#059669" />
      </marker>
      <marker id="bias-arr-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 1 1 L 9 5 L 1 9 Z" fill="#dc2626" />
      </marker>
      <marker id="bias-w-left" viewBox="0 0 10 10" refX="2" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 9 1 L 1 5 L 9 9 Z" fill="#475569" />
      </marker>
      <marker id="bias-w-right" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 1 1 L 9 5 L 1 9 Z" fill="#475569" />
      </marker>
    </defs>

    <!-- タイトル -->
    <text x="430" y="34" text-anchor="middle" font-size="18" font-weight="700" fill="#0f172a" font-family="system-ui, -apple-system, sans-serif">${title}</text>

    <!-- ================= 左カード: 順バイアス ================= -->
    <g transform="translate(30, 52)">
      <!-- カード枠 -->
      <rect x="0" y="0" width="385" height="405" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.2" />
      <!-- ヘッダー -->
      <path d="M 0 10 Q 0 0, 10 0 L 375 0 Q 385 0, 385 10 L 385 40 L 0 40 Z" fill="#059669" />
      <text x="192" y="25" text-anchor="middle" font-size="13.5" font-weight="700" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif">順バイアス（p側に＋）→ 電流が流れる</text>

      <!-- 狭い空乏層背景 -->
      <rect x="160" y="40" width="70" height="300" fill="#f1f5f9" opacity="0.8" />

      <!-- Ec (青線) -->
      <path d="M 20 160 L 160 160 C 180 160, 210 205, 230 205 L 365 205" fill="none" stroke="#1d4ed8" stroke-width="3" stroke-linecap="round" />
      <text x="25" y="152" font-size="13" font-weight="700" fill="#1d4ed8" font-family="system-ui, -apple-system, sans-serif">Ec</text>

      <!-- Ev (茶線) -->
      <path d="M 20 280 L 160 280 C 180 280, 210 325, 230 325 L 365 325" fill="none" stroke="#b45309" stroke-width="3" stroke-linecap="round" />
      <text x="25" y="295" font-size="13" font-weight="700" fill="#b45309" font-family="system-ui, -apple-system, sans-serif">Ev</text>

      <!-- 障壁寸法 (上下両矢印) -->
      <line x1="160" y1="160" x2="270" y2="160" stroke="#94a3b8" stroke-width="1" stroke-dasharray="3,3" />
      <line x1="270" y1="164" x2="270" y2="201" stroke="#475569" stroke-width="1.4" />
      <polygon points="266,166 270,160 274,166" fill="#475569" />
      <polygon points="266,199 270,205 274,199" fill="#475569" />
      <text x="278" y="195" font-size="11" font-weight="700" fill="#059669" font-family="system-ui, -apple-system, sans-serif">q(Vbi - VF)</text>
      <text x="270" y="150" font-size="10.5" fill="#059669" font-family="system-ui, -apple-system, sans-serif">障壁が低くなる</text>

      <!-- 電子キャリア & 注入矢印 (右から左へ) -->
      <circle cx="320" cy="195" r="7" fill="#2563eb" />
      <text x="320" y="199" text-anchor="middle" font-size="12" font-weight="700" fill="#ffffff">-</text>
      <circle cx="345" cy="195" r="7" fill="#2563eb" />
      <text x="345" y="199" text-anchor="middle" font-size="12" font-weight="700" fill="#ffffff">-</text>

      <path d="M 300 168 C 240 144, 150 140, 60 140" fill="none" stroke="#059669" stroke-width="2.5" marker-end="url(#bias-arr-green)" />
      <text x="180" y="126" text-anchor="middle" font-size="11.5" font-weight="700" fill="#059669" font-family="system-ui, -apple-system, sans-serif">電子が注入される</text>

      <!-- 正孔キャリア & 注入矢印 (左から右へ) -->
      <circle cx="55" cy="300" r="7" fill="#ffffff" stroke="#dc2626" stroke-width="1.6" />
      <text x="55" y="304" text-anchor="middle" font-size="12" font-weight="700" fill="#dc2626">+</text>
      <circle cx="80" cy="300" r="7" fill="#ffffff" stroke="#dc2626" stroke-width="1.6" />
      <text x="80" y="304" text-anchor="middle" font-size="12" font-weight="700" fill="#dc2626">+</text>

      <path d="M 95 310 C 170 330, 240 345, 330 345" fill="none" stroke="#dc2626" stroke-width="2.5" marker-end="url(#bias-arr-red)" />
      <text x="200" y="358" text-anchor="middle" font-size="11.5" font-weight="700" fill="#dc2626" font-family="system-ui, -apple-system, sans-serif">正孔が注入される</text>

      <!-- 下部テキスト -->
      <text x="195" y="372" text-anchor="middle" font-size="11" fill="#64748b" font-family="system-ui, -apple-system, sans-serif">空乏層は狭くなる</text>
      <text x="192" y="392" text-anchor="middle" font-size="12.5" font-weight="700" fill="#059669" font-family="system-ui, -apple-system, sans-serif">障壁を越えてキャリアが移動 ─ 順方向電流</text>
    </g>

    <!-- ================= 右カード: 逆バイアス ================= -->
    <g transform="translate(445, 52)">
      <!-- カード枠 -->
      <rect x="0" y="0" width="385" height="405" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.2" />
      <!-- ヘッダー -->
      <path d="M 0 10 Q 0 0, 10 0 L 375 0 Q 385 0, 385 10 L 385 40 L 0 40 Z" fill="#dc2626" />
      <text x="192" y="25" text-anchor="middle" font-size="13.5" font-weight="700" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif">逆バイアス（p側にー）→ 電流はほぼ流れない</text>

      <!-- 広い空乏層背景 -->
      <rect x="110" y="40" width="165" height="300" fill="#f1f5f9" opacity="0.8" />

      <!-- Ec (青線) -->
      <path d="M 20 130 L 110 130 C 160 130, 220 260, 275 260 L 365 260" fill="none" stroke="#1d4ed8" stroke-width="3" stroke-linecap="round" />
      <text x="25" y="122" font-size="13" font-weight="700" fill="#1d4ed8" font-family="system-ui, -apple-system, sans-serif">Ec</text>

      <!-- Ev (茶線) -->
      <path d="M 20 250 L 110 250 C 160 250, 220 380, 275 380 L 365 380" fill="none" stroke="#b45309" stroke-width="3" stroke-linecap="round" />
      <text x="25" y="265" font-size="13" font-weight="700" fill="#b45309" font-family="system-ui, -apple-system, sans-serif">Ev</text>

      <!-- 障壁寸法 (上下両矢印) -->
      <line x1="110" y1="130" x2="305" y2="130" stroke="#94a3b8" stroke-width="1" stroke-dasharray="3,3" />
      <line x1="305" y1="134" x2="305" y2="256" stroke="#475569" stroke-width="1.4" />
      <polygon points="301,136 305,130 309,136" fill="#475569" />
      <polygon points="301,254 305,260 309,254" fill="#475569" />
      <text x="313" y="190" font-size="11.5" font-weight="700" fill="#dc2626" font-family="system-ui, -apple-system, sans-serif">q(Vbi + VR)</text>
      <text x="313" y="208" font-size="10.5" fill="#dc2626" font-family="system-ui, -apple-system, sans-serif">障壁が高くなる</text>

      <!-- 越えられない電子と×印 -->
      <circle cx="325" cy="245" r="7" fill="#2563eb" />
      <text x="325" y="249" text-anchor="middle" font-size="12" font-weight="700" fill="#ffffff">-</text>

      <path d="M 315 235 L 210 150" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="3,3" />
      <text x="220" y="152" text-anchor="middle" font-size="16" font-weight="700" fill="#dc2626">×</text>
      <text x="220" y="135" text-anchor="middle" font-size="11" fill="#64748b" font-family="system-ui, -apple-system, sans-serif">障壁を越えられない</text>

      <!-- 空乏層幅矢印 -->
      <line x1="110" y1="365" x2="275" y2="365" stroke="#475569" stroke-width="1.4" marker-start="url(#bias-w-left)" marker-end="url(#bias-w-right)" />
      <text x="192" y="358" text-anchor="middle" font-size="11" fill="#64748b" font-family="system-ui, -apple-system, sans-serif">空乏層が広がる</text>
      <text x="192" y="392" text-anchor="middle" font-size="12.5" font-weight="700" fill="#dc2626" font-family="system-ui, -apple-system, sans-serif">キャリアは移動できず微小なリーク電流のみ</text>
    </g>
  `;

  container.appendChild(svg);
  if (labelText) {
    const lbl = document.createElement('div');
    lbl.className = 'chem-structure-label';
    lbl.textContent = labelText;
    container.appendChild(lbl);
  }
}

// ==========================================
// 3. 状態密度 (DOS) の概念図 描画
// ==========================================
function renderDosDiagramSvg(codeText, container, labelText) {
  const props = parseKeyValueProps(codeText);
  const title = props.title || '【状態密度の概念図】';
  const yaxis = props.yaxis || '状態密度(UPスピン)';
  const xaxis = props.xaxis || 'エネルギー';
  const fermiLabel = props.fermi || 'フェルミ準位';
  const gapLabel = props.gap || 'バンドギャップ';
  const valenceLabel = props.valence || '価電子帯';
  const conductionLabel = props.conduction || '伝導電子帯';
  const note1 = props.note1 || 'N-2p状態から磁性不純物準位への電子移動';
  const note2 = props.note2 || '→ 価電子状態上端(VBM)に正孔(h+)が導入';
  const note3 = props.note3 || '→ 低抵抗p型伝導の発生';

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 860 520');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.setAttribute('class', 'energylevel-svg');
  svg.style.maxWidth = '860px';
  svg.style.margin = '0 auto';
  svg.style.display = 'block';
  svg.style.background = '#ffffff';
  svg.style.borderRadius = '14px';
  svg.style.border = '1px solid #e2e8f0';

  svg.innerHTML = `
    <defs>
      <marker id="dos-axis-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
        <path d="M 1 1 L 9 5 L 1 9 Z" fill="#000000" />
      </marker>
      <marker id="dos-axis-arr-x" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
        <path d="M 1 2 L 8 5 L 1 8 Z" fill="#000000" />
      </marker>
      <marker id="dos-red-up" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 1 1 L 9 5 L 1 9 Z" fill="#dc2626" />
      </marker>
      <marker id="dos-gap-left" viewBox="0 0 10 10" refX="2" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 9 1 L 1 5 L 9 9 Z" fill="#000000" />
      </marker>
      <marker id="dos-gap-right" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 1 1 L 9 5 L 1 9 Z" fill="#000000" />
      </marker>
    </defs>

    <!-- タイトル -->
    <text x="430" y="44" text-anchor="middle" font-size="20" font-weight="700" fill="#000000" font-family="system-ui, -apple-system, sans-serif">${title}</text>

    <!-- 座標軸 -->
    <!-- 縦軸: 状態密度 -->
    <line x1="140" y1="400" x2="140" y2="115" stroke="#000000" stroke-width="3.5" marker-end="url(#dos-axis-arr)" />
    <text x="175" y="100" text-anchor="middle" font-size="14.5" font-weight="700" fill="#000000" font-family="system-ui, -apple-system, sans-serif">${yaxis}</text>

    <!-- 横軸: エネルギー -->
    <line x1="135" y1="400" x2="800" y2="400" stroke="#000000" stroke-width="3.5" marker-end="url(#dos-axis-arr-x)" />
    <text x="740" y="435" text-anchor="middle" font-size="16" font-weight="700" fill="#000000" font-family="system-ui, -apple-system, sans-serif">${xaxis}</text>

    <!-- 価電子帯 外形エンベロープ (黒破線) -->
    <path d="M 195 400 Q 365 140, 545 400" fill="none" stroke="#000000" stroke-width="2.2" stroke-dasharray="6,4" />
    <text x="390" y="195" font-size="15" font-weight="700" fill="#000000" font-family="system-ui, -apple-system, sans-serif">${valenceLabel}</text>

    <!-- 左の山: 結合状態 (4f/3d) 成分 (オレンジ塗り) -->
    <path d="M 198 400 C 220 220, 275 190, 305 190 C 335 190, 370 310, 400 355 C 420 385, 430 400, 445 400 Z" fill="#fed7aa" stroke="#ea580c" stroke-width="2.8" />
    <!-- 赤上向き矢印 -->
    <line x1="305" y1="265" x2="305" y2="200" stroke="#dc2626" stroke-width="3.8" marker-end="url(#dos-red-up)" />
    <text x="305" y="288" text-anchor="middle" font-size="14" font-weight="700" fill="#000000" font-family="system-ui, -apple-system, sans-serif">結合状態</text>
    <text x="305" y="308" text-anchor="middle" font-size="14" font-weight="700" fill="#dc2626" font-family="system-ui, -apple-system, sans-serif">(4f/3d) 成分</text>

    <!-- 左下の重なり: N-2p成分 (青塗り) -->
    <path d="M 205 400 Q 285 365, 375 400 Z" fill="#bfdbfe" stroke="#3b82f6" stroke-width="1.8" />
    <text x="290" y="392" text-anchor="middle" font-size="13" font-weight="700" fill="#1d4ed8" font-family="system-ui, -apple-system, sans-serif">N-2p成分</text>

    <!-- 右の山: 反結合状態 N-2p 成分 (薄青塗り) -->
    <path d="M 405 400 C 415 250, 465 180, 490 180 C 515 180, 535 285, 545 400 Z" fill="#bfdbfe" fill-opacity="0.85" stroke="#2563eb" stroke-width="2.8" />
    <!-- 赤上向き矢印 -->
    <line x1="485" y1="265" x2="485" y2="195" stroke="#dc2626" stroke-width="3.8" marker-end="url(#dos-red-up)" />
    <text x="480" y="150" text-anchor="middle" font-size="14" font-weight="700" fill="#000000" font-family="system-ui, -apple-system, sans-serif">反結合状態</text>
    <text x="480" y="170" text-anchor="middle" font-size="14" font-weight="700" fill="#2563eb" font-family="system-ui, -apple-system, sans-serif">N-2p成分</text>

    <!-- 右下の重なり: (4f/3d)成分 (赤山塗り) -->
    <path d="M 390 400 C 415 325, 445 365, 460 400 Z" fill="#fee2e2" stroke="#ef4444" stroke-width="1.8" />
    <text x="440" y="392" text-anchor="middle" font-size="11.5" font-weight="700" fill="#dc2626" font-family="system-ui, -apple-system, sans-serif">(4f/3d)成分</text>

    <!-- フェルミ準位 (黒太線) -->
    <line x1="520" y1="90" x2="520" y2="400" stroke="#000000" stroke-width="2.6" />
    <text x="520" y="75" text-anchor="middle" font-size="15" font-weight="700" fill="#000000" font-family="system-ui, -apple-system, sans-serif">${fermiLabel}</text>

    <!-- 正孔吹き出し枠 -->
    <rect x="548" y="332" width="75" height="42" rx="6" fill="#ffffff" stroke="#000000" stroke-width="1.8" />
    <text x="585" y="359" text-anchor="middle" font-size="15" font-weight="700" fill="#000000" font-family="system-ui, -apple-system, sans-serif">正孔</text>
    <path d="M 548 358 L 532 362" stroke="#000000" stroke-width="1.6" />

    <!-- バンドギャップ両矢印 -->
    <line x1="545" y1="110" x2="545" y2="400" stroke="#000000" stroke-width="1.2" stroke-dasharray="2,2" />
    <line x1="645" y1="110" x2="645" y2="400" stroke="#000000" stroke-width="1.2" stroke-dasharray="2,2" />
    <line x1="545" y1="125" x2="645" y2="125" stroke="#000000" stroke-width="2.2" marker-start="url(#dos-gap-left)" marker-end="url(#dos-gap-right)" />
    <text x="655" y="118" font-size="14" font-weight="700" fill="#000000" font-family="system-ui, -apple-system, sans-serif">バンド</text>
    <text x="655" y="136" font-size="14" font-weight="700" fill="#000000" font-family="system-ui, -apple-system, sans-serif">ギャップ</text>

    <!-- 伝導電子帯 (黒破線) -->
    <path d="M 645 400 Q 710 240, 790 175" fill="none" stroke="#000000" stroke-width="2.2" stroke-dasharray="6,4" />
    <text x="715" y="295" font-size="14.5" font-weight="700" fill="#000000" font-family="system-ui, -apple-system, sans-serif">${conductionLabel}</text>

    <!-- 下部黄色説明ボックス -->
    <rect x="180" y="425" width="460" height="78" rx="0" fill="#ffff00" stroke="#000000" stroke-width="1.5" />
    <text x="190" y="446" font-size="13" font-weight="700" fill="#000000" font-family="system-ui, -apple-system, sans-serif">${note1}</text>
    <text x="190" y="468" font-size="13" font-weight="700" fill="#000000" font-family="system-ui, -apple-system, sans-serif">${note2}</text>
    <text x="190" y="490" font-size="13" font-weight="700" fill="#000000" font-family="system-ui, -apple-system, sans-serif">${note3}</text>
  `;

  container.appendChild(svg);
  if (labelText) {
    const lbl = document.createElement('div');
    lbl.className = 'chem-structure-label';
    lbl.textContent = labelText;
    container.appendChild(lbl);
  }
}

/**
 * 4. 電子殻模型から結晶バンド形成 & ボーア量子条件 (Band Formation & Bohr Condition)
 */
function renderBandFormationSvg(codeText, container, labelText) {
  let title = '電子殻モデルからエネルギーバンド形成（単一原子から結晶へ）';
  const mTitle = codeText.match(/title\s*:\s*["']?([^"';]+)["']?/i);
  if (mTitle) title = mTitle[1].trim();

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 940 550');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.setAttribute('class', 'el-diagram-svg');
  svg.style.display = 'block';
  svg.style.background = '#ffffff';

  // ド・ブロイ波 (4倍波) パス生成: r(θ) = 75 + 16 * cos(4θ)
  let waveD = '';
  const cxWave = 770;
  const cyWave = 395;
  const baseR = 75;
  const amp = 16;
  const steps = 180;
  for (let i = 0; i <= steps; i++) {
    const th = (i / steps) * 2 * Math.PI;
    const r = baseR + amp * Math.cos(4 * th);
    const x = cxWave + r * Math.cos(th);
    const y = cyWave + r * Math.sin(th);
    waveD += (i === 0 ? 'M ' : 'L ') + x.toFixed(2) + ' ' + y.toFixed(2) + ' ';
  }
  waveD += 'Z';

  // 電子波上の電子位置 (th = π/4 付近)
  const eTh = Math.PI / 4;
  const eR = baseR + amp * Math.cos(4 * eTh);
  const eX = cxWave + eR * Math.cos(eTh);
  const eY = cyWave + eR * Math.sin(eTh);

  svg.innerHTML = `
    <defs>
      <!-- 原子核用赤球グラデーション -->
      <radialGradient id="bf-nucleus-grad" cx="35%" cy="35%" r="65%">
        <stop offset="0%" stop-color="#fca5a5" />
        <stop offset="50%" stop-color="#ef4444" />
        <stop offset="100%" stop-color="#b91c1c" />
      </radialGradient>
      <!-- 電子青球グラデーション -->
      <radialGradient id="bf-electron-grad" cx="35%" cy="35%" r="65%">
        <stop offset="0%" stop-color="#93c5fd" />
        <stop offset="60%" stop-color="#3b82f6" />
        <stop offset="100%" stop-color="#1d4ed8" />
      </radialGradient>
      <!-- 青色軸矢印 -->
      <marker id="bf-blue-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 1 1 L 9 5 L 1 9 Z" fill="#0284c7" />
      </marker>
      <!-- ピンク矢印 (フェルミ準位) -->
      <marker id="bf-pink-arr" viewBox="0 0 10 10" refX="2" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 9 1 L 1 5 L 9 9 Z" fill="#d946ef" />
      </marker>
      <!-- 黒矢印 (引き出し線用) -->
      <marker id="bf-black-arr" viewBox="0 0 10 10" refX="2" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 9 1 L 1 5 L 9 9 Z" fill="#0f172a" />
      </marker>
      <!-- 寸法両矢印 (上下) -->
      <marker id="bf-dim-up" viewBox="0 0 10 10" refX="5" refY="2" markerWidth="5" markerHeight="5" orient="auto">
        <path d="M 1 9 L 5 1 L 9 9 Z" fill="#0284c7" />
      </marker>
      <marker id="bf-dim-down" viewBox="0 0 10 10" refX="5" refY="8" markerWidth="5" markerHeight="5" orient="auto">
        <path d="M 1 1 L 5 9 L 9 1 Z" fill="#0284c7" />
      </marker>
      <!-- 禁制帯寸法矢印 (黒) -->
      <marker id="bf-gap-up" viewBox="0 0 10 10" refX="5" refY="2" markerWidth="5" markerHeight="5" orient="auto">
        <path d="M 1 9 L 5 1 L 9 9 Z" fill="#000000" />
      </marker>
      <marker id="bf-gap-down" viewBox="0 0 10 10" refX="5" refY="8" markerWidth="5" markerHeight="5" orient="auto">
        <path d="M 1 1 L 5 9 L 9 1 Z" fill="#000000" />
      </marker>
    </defs>

    <!-- タイトル -->
    <text x="470" y="32" text-anchor="middle" font-size="18" font-weight="700" fill="#0f172a" font-family="system-ui, -apple-system, sans-serif">${title}</text>

    <!-- ==================================================== -->
    <!-- 左側: 電子殻模型 (X0 = 210, Y0 = 275) -->
    <!-- ==================================================== -->
    <g class="bf-atom-shell">
      <!-- 中心十字線 -->
      <line x1="30" y1="275" x2="390" y2="275" stroke="#cbd5e1" stroke-width="1.2" stroke-dasharray="3,3" />
      <line x1="210" y1="95" x2="210" y2="455" stroke="#cbd5e1" stroke-width="1.2" stroke-dasharray="3,3" />

      <!-- 同心円軌道 -->
      <!-- k殻 (r=45) -->
      <circle cx="210" cy="275" r="45" fill="none" stroke="#64748b" stroke-width="1.2" stroke-dasharray="4,4" />
      <!-- l殻 (r=85) -->
      <circle cx="210" cy="275" r="85" fill="none" stroke="#64748b" stroke-width="1.2" stroke-dasharray="4,4" />
      <!-- m殻 / 価電子帯 (r=125) -->
      <circle cx="210" cy="275" r="125" fill="none" stroke="#64748b" stroke-width="1.4" stroke-dasharray="4,4" />
      <!-- フェルミ準位 (r=144) マゼンタ破線 -->
      <circle cx="210" cy="275" r="144" fill="none" stroke="#d946ef" stroke-width="1.8" stroke-dasharray="5,4" />
      <!-- n殻 / 伝導帯 (r=162) -->
      <circle cx="210" cy="275" r="162" fill="none" stroke="#64748b" stroke-width="1.4" stroke-dasharray="4,4" />

      <!-- 原子核 -->
      <circle cx="210" cy="275" r="18" fill="url(#bf-nucleus-grad)" stroke="#dc2626" stroke-width="1.4" />

      <!-- k殻の電子 (2個: 上下) -->
      <circle cx="210" cy="230" r="5" fill="url(#bf-electron-grad)" stroke="#1d4ed8" stroke-width="1" />
      <circle cx="210" cy="320" r="5" fill="url(#bf-electron-grad)" stroke="#1d4ed8" stroke-width="1" />

      <!-- l殻の電子 (8個) -->
      <circle cx="210" cy="190" r="5" fill="url(#bf-electron-grad)" stroke="#1d4ed8" stroke-width="1" />
      <circle cx="210" cy="360" r="5" fill="url(#bf-electron-grad)" stroke="#1d4ed8" stroke-width="1" />
      <circle cx="125" cy="275" r="5" fill="url(#bf-electron-grad)" stroke="#1d4ed8" stroke-width="1" />
      <circle cx="295" cy="275" r="5" fill="url(#bf-electron-grad)" stroke="#1d4ed8" stroke-width="1" />
      <circle cx="150" cy="215" r="5" fill="url(#bf-electron-grad)" stroke="#1d4ed8" stroke-width="1" />
      <circle cx="270" cy="215" r="5" fill="url(#bf-electron-grad)" stroke="#1d4ed8" stroke-width="1" />
      <circle cx="150" cy="335" r="5" fill="url(#bf-electron-grad)" stroke="#1d4ed8" stroke-width="1" />
      <circle cx="270" cy="335" r="5" fill="url(#bf-electron-grad)" stroke="#1d4ed8" stroke-width="1" />

      <!-- m殻の電子 (最外殻電子・価電子: 8個) -->
      <circle cx="210" cy="150" r="5" fill="url(#bf-electron-grad)" stroke="#1d4ed8" stroke-width="1" />
      <circle cx="210" cy="400" r="5" fill="url(#bf-electron-grad)" stroke="#1d4ed8" stroke-width="1" />
      <circle cx="85" cy="275" r="5" fill="url(#bf-electron-grad)" stroke="#1d4ed8" stroke-width="1" />
      <circle cx="335" cy="275" r="5" fill="url(#bf-electron-grad)" stroke="#1d4ed8" stroke-width="1" />
      <circle cx="122" cy="187" r="5" fill="url(#bf-electron-grad)" stroke="#1d4ed8" stroke-width="1" />
      <circle cx="298" cy="187" r="5" fill="url(#bf-electron-grad)" stroke="#1d4ed8" stroke-width="1" />
      <circle cx="122" cy="363" r="5" fill="url(#bf-electron-grad)" stroke="#1d4ed8" stroke-width="1" />
      <circle cx="298" cy="363" r="5" fill="url(#bf-electron-grad)" stroke="#1d4ed8" stroke-width="1" />

      <!-- 最外殻電子の注目赤破線枠 (上部電子) -->
      <rect x="193" y="133" width="34" height="34" rx="4" fill="none" stroke="#ef4444" stroke-width="1.8" stroke-dasharray="4,3" />

      <!-- ラベル & 引き出し線 -->
      <!-- n 殻 / 伝導帯 -->
      <line x1="165" y1="80" x2="195" y2="114" stroke="#000000" stroke-width="1.2" marker-end="url(#bf-black-arr)" />
      <text x="165" y="65" text-anchor="middle" font-size="13.5" font-weight="700" fill="#000000">n 殻</text>
      <text x="165" y="82" text-anchor="middle" font-size="13" font-weight="600" fill="#000000">伝導帯</text>

      <!-- m 殻 / 価電子帯 -->
      <line x1="100" y1="125" x2="155" y2="160" stroke="#000000" stroke-width="1.2" marker-end="url(#bf-black-arr)" />
      <text x="95" y="110" text-anchor="middle" font-size="13.5" font-weight="700" fill="#000000">m 殻</text>
      <text x="95" y="127" text-anchor="middle" font-size="13" font-weight="600" fill="#000000">価電子帯</text>

      <!-- 最外殻電子 (価電子) -->
      <line x1="50" y1="210" x2="80" y2="265" stroke="#000000" stroke-width="1.2" marker-end="url(#bf-black-arr)" />
      <text x="45" y="195" text-anchor="middle" font-size="13.5" font-weight="700" fill="#000000">最外殻電子</text>
      <text x="45" y="213" text-anchor="middle" font-size="13" font-weight="600" fill="#000000">（価電子）</text>

      <!-- k 殻 -->
      <line x1="60" y1="355" x2="175" y2="305" stroke="#000000" stroke-width="1.2" marker-end="url(#bf-black-arr)" />
      <text x="50" y="365" text-anchor="middle" font-size="13.5" font-weight="700" fill="#000000">k 殻</text>

      <!-- l 殻 -->
      <line x1="75" y1="410" x2="150" y2="340" stroke="#000000" stroke-width="1.2" marker-end="url(#bf-black-arr)" />
      <text x="70" y="425" text-anchor="middle" font-size="13.5" font-weight="700" fill="#000000">l 殻</text>

      <!-- フェルミ準位 (ピンク矢印) -->
      <line x1="410" y1="365" x2="315" y2="330" stroke="#d946ef" stroke-width="1.8" marker-end="url(#bf-pink-arr)" />
      <text x="415" y="372" font-size="14" font-weight="700" fill="#d946ef">フェルミ準位</text>

      <!-- 禁制帯 (m殻とn殻の間の上下矢印) -->
      <line x1="335" y1="375" x2="335" y2="425" stroke="#000000" stroke-width="1.4" marker-start="url(#bf-gap-up)" marker-end="url(#bf-gap-down)" />
      <text x="350" y="405" font-size="13.5" font-weight="700" fill="#000000">禁制帯</text>
    </g>

    <!-- ==================================================== -->
    <!-- 右上: 赤点線角丸枠 (単一原子 → N個の原子 → 結晶) -->
    <!-- ==================================================== -->
    <g class="bf-energy-levels">
      <!-- ズーム引き出し線 (赤点線) -->
      <line x1="227" y1="133" x2="445" y2="45" stroke="#ef4444" stroke-width="1.4" stroke-dasharray="4,4" />
      <line x1="227" y1="167" x2="445" y2="255" stroke="#ef4444" stroke-width="1.4" stroke-dasharray="4,4" />

      <!-- 赤点線角丸外枠 -->
      <rect x="445" y="45" width="475" height="215" rx="18" fill="#ffffff" stroke="#ef4444" stroke-width="2.2" stroke-dasharray="6,4" />

      <!-- 縦軸: 電子のエネルギーレベル -->
      <line x1="475" y1="210" x2="475" y2="70" stroke="#0284c7" stroke-width="2" stroke-dasharray="4,3" marker-end="url(#bf-blue-arr)" />
      <text x="455" y="65" font-size="12" font-weight="700" fill="#0284c7">電子のエネルギーレベル</text>

      <!-- 1. 単一原子 (離散準位) -->
      <g>
        <rect x="500" y="85" width="55" height="9" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.8" />
        <rect x="500" y="172" width="55" height="9" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.8" />
        <text x="527" y="235" text-anchor="middle" font-size="13" font-weight="700" fill="#000000">単一原子</text>
      </g>

      <!-- 遷移矢印 1 (太白抜き) -->
      <path d="M 570 135 L 585 135 L 585 128 L 600 140 L 585 152 L 585 145 L 570 145 Z" fill="#ffffff" stroke="#0284c7" stroke-width="1.8" />

      <!-- 2. N 個の原子 (準位分裂・密集) -->
      <g>
        <!-- 伝導帯側準位ブロック (7本) -->
        <rect x="618" y="72" width="52" height="4" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.2" />
        <rect x="618" y="78" width="52" height="4" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.2" />
        <rect x="618" y="84" width="52" height="4" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.2" />
        <rect x="618" y="90" width="52" height="4" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.2" />
        <rect x="618" y="96" width="52" height="4" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.2" />
        <rect x="618" y="102" width="52" height="4" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.2" />
        <rect x="618" y="108" width="52" height="4" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.2" />

        <!-- 価電子帯側準位ブロック (7本) -->
        <rect x="618" y="158" width="52" height="4" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.2" />
        <rect x="618" y="164" width="52" height="4" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.2" />
        <rect x="618" y="170" width="52" height="4" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.2" />
        <rect x="618" y="176" width="52" height="4" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.2" />
        <rect x="618" y="182" width="52" height="4" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.2" />
        <rect x="618" y="188" width="52" height="4" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.2" />
        <rect x="618" y="194" width="52" height="4" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.2" />

        <text x="644" y="235" text-anchor="middle" font-size="13" font-weight="700" fill="#000000">N 個の原子</text>
      </g>

      <!-- 遷移矢印 2 (太白抜き) -->
      <path d="M 688 135 L 703 135 L 703 128 L 718 140 L 703 152 L 703 145 L 688 145 Z" fill="#ffffff" stroke="#0284c7" stroke-width="1.8" />

      <!-- 3. 結晶 (バンド形成) -->
      <g>
        <!-- 伝導帯 -->
        <rect x="735" y="68" width="85" height="52" fill="#ffffff" stroke="#0284c7" stroke-width="2" />
        <text x="777" y="100" text-anchor="middle" font-size="13.5" font-weight="700" fill="#000000">伝導帯</text>

        <!-- 禁制帯 -->
        <text x="777" y="145" text-anchor="middle" font-size="13" font-weight="700" fill="#000000">禁制帯</text>

        <!-- バンドギャップ両矢印 -->
        <line x1="835" y1="124" x2="835" y2="158" stroke="#0284c7" stroke-width="2" marker-start="url(#bf-dim-up)" marker-end="url(#bf-dim-down)" />
        <text x="848" y="145" font-size="12" font-weight="700" fill="#000000">バンドギャップ</text>

        <!-- 価電子帯 -->
        <rect x="735" y="160" width="85" height="52" fill="#ffffff" stroke="#0284c7" stroke-width="2" />
        <text x="777" y="192" text-anchor="middle" font-size="13.5" font-weight="700" fill="#000000">価電子帯</text>

        <text x="777" y="235" text-anchor="middle" font-size="13" font-weight="700" fill="#000000">結晶</text>
      </g>
    </g>

    <!-- ==================================================== -->
    <!-- 右下: ボーアの量子条件 & ド・ブロイ波 (X0 = 770, Y0 = 395) -->
    <!-- ==================================================== -->
    <g class="bf-bohr-condition">
      <!-- 中心十字線 -->
      <line x1="655" y1="395" x2="885" y2="395" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="3,3" />
      <line x1="770" y1="280" x2="770" y2="510" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="3,3" />

      <!-- 半径 r の基準円 (黒破線) -->
      <circle cx="${cxWave}" cy="${cyWave}" r="${baseR}" fill="none" stroke="#000000" stroke-width="1.4" stroke-dasharray="4,4" />

      <!-- ド・ブロイ波 4倍波 (青太線) -->
      <path d="${waveD}" fill="none" stroke="#2563eb" stroke-width="2.6" />

      <!-- 電子波上の電子球 -->
      <circle cx="${eX.toFixed(2)}" cy="${eY.toFixed(2)}" r="6" fill="url(#bf-electron-grad)" stroke="#1d4ed8" stroke-width="1.2" />

      <!-- 半径 r 矢印線 -->
      <line x1="${cxWave}" y1="${cyWave}" x2="${cxWave + baseR * Math.cos(Math.PI / 6)}" y2="${cyWave - baseR * Math.sin(Math.PI / 6)}" stroke="#000000" stroke-width="1.4" marker-end="url(#bf-black-arr)" />
      <text x="${cxWave + 42}" y="${cyWave - 12}" font-size="15" font-weight="700" font-style="italic" fill="#000000">r</text>

      <!-- 波長 λ 寸法表示 -->
      <text x="685" y="325" font-size="14" font-weight="700" font-style="italic" fill="#000000">λ</text>
      <text x="855" y="325" font-size="14" font-weight="700" font-style="italic" fill="#000000">λ</text>
      <text x="685" y="475" font-size="14" font-weight="700" font-style="italic" fill="#000000">λ</text>
      <text x="855" y="475" font-size="14" font-weight="700" font-style="italic" fill="#000000">λ</text>

      <!-- 原子核 -->
      <circle cx="${cxWave}" cy="${cyWave}" r="13" fill="url(#bf-nucleus-grad)" stroke="#dc2626" stroke-width="1.2" />

      <!-- 左側説明テキスト -->
      <text x="430" y="435" font-size="13" font-weight="700" fill="#000000">軌道長が電子の波長の整数倍のときのみ安定状態となる。</text>
      <text x="430" y="460" font-size="13" font-weight="700" fill="#000000">右図は 4 倍の時のイメージ図</text>
      <text x="500" y="500" font-size="17" font-weight="700" fill="#000000" font-family="system-ui, -apple-system, sans-serif">2 × π × r = n × λ</text>
    </g>
  `;

  container.appendChild(svg);
  if (labelText) {
    const lbl = document.createElement('div');
    lbl.className = 'chem-structure-label';
    lbl.textContent = labelText;
    container.appendChild(lbl);
  }
}

/**
 * 5. ボーア原子模型の光吸収・電子励起遷移 (Photo-Excitation in Bohr Atom Model)
 */
function renderBohrExcitationSvg(codeText, container, labelText) {
  let title = '光吸収による電子の励起遷移（ボーア原子模型）';
  const mTitle = codeText.match(/title\s*:\s*["']?([^"';]+)["']?/i);
  if (mTitle) title = mTitle[1].trim();

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 680 540');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.setAttribute('class', 'el-diagram-svg');
  svg.style.display = 'block';
  svg.style.background = '#ffffff';

  const cx = 350;
  const cy = 270;
  const r1 = 68;
  const r2 = 138;
  const r3 = 210;

  // 励起元空孔の位置 (角度 -65度)
  const angleEx = -65 * (Math.PI / 180);
  const xFrom = cx + r2 * Math.cos(angleEx);
  const yFrom = cy + r2 * Math.sin(angleEx);

  // 励起先電子の位置 (角度 -65度、軌道3)
  const xTo = cx + r3 * Math.cos(angleEx);
  const yTo = cy + r3 * Math.sin(angleEx);

  // 電子（白丸＋マイナス記号）生成ヘルパー
  const renderElectron = (ex, ey, isHole = false) => {
    if (isHole) {
      return `
        <circle cx="${ex.toFixed(1)}" cy="${ey.toFixed(1)}" r="10" fill="#ffffff" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="3,3" />
      `;
    }
    return `
      <g>
        <circle cx="${ex.toFixed(1)}" cy="${ey.toFixed(1)}" r="10" fill="#ffffff" stroke="#000000" stroke-width="1.6" />
        <line x1="${(ex - 6).toFixed(1)}" y1="${ey.toFixed(1)}" x2="${(ex + 6).toFixed(1)}" y2="${ey.toFixed(1)}" stroke="#000000" stroke-width="1.8" />
      </g>
    `;
  };

  svg.innerHTML = `
    <defs>
      <!-- 原子核用グラデーション (シルバー/グレー) -->
      <radialGradient id="bohr-nuc-grad" cx="35%" cy="35%" r="65%">
        <stop offset="0%" stop-color="#cbd5e1" />
        <stop offset="60%" stop-color="#64748b" />
        <stop offset="100%" stop-color="#334155" />
      </radialGradient>
      <!-- 励起矢印用マーカー -->
      <marker id="bohr-arr-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 1 1 L 9 5 L 1 9 Z" fill="#2563eb" />
      </marker>
      <!-- 光子矢印用マーカー -->
      <marker id="bohr-arr-photon" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 1 1 L 9 5 L 1 9 Z" fill="#2563eb" />
      </marker>
      <!-- 引き出し線用黒マーカー -->
      <marker id="bohr-arr-black" viewBox="0 0 10 10" refX="2" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 9 1 L 1 5 L 9 9 Z" fill="#000000" />
      </marker>
    </defs>

    <!-- タイトル -->
    <text x="340" y="32" text-anchor="middle" font-size="18" font-weight="700" fill="#000000" font-family="system-ui, -apple-system, sans-serif">${title}</text>

    <!-- ==================================================== -->
    <!-- 軌道円 -->
    <!-- ==================================================== -->
    <!-- 軌道1: E1 (実線黒) -->
    <circle cx="${cx}" cy="${cy}" r="${r1}" fill="none" stroke="#000000" stroke-width="1.6" />
    <text x="${cx - 15}" y="${cy - r1 + 22}" font-size="19" font-weight="700" fill="#000000">E₁</text>

    <!-- 軌道2: E2 (破線黒) -->
    <circle cx="${cx}" cy="${cy}" r="${r2}" fill="none" stroke="#000000" stroke-width="1.5" stroke-dasharray="3,3" />
    <text x="${cx - 15}" y="${cy - r2 + 22}" font-size="19" font-weight="700" fill="#000000">E₂</text>

    <!-- 軌道3: 外側軌道 (破線黒) -->
    <circle cx="${cx}" cy="${cy}" r="${r3}" fill="none" stroke="#000000" stroke-width="1.3" stroke-dasharray="3,3" />

    <!-- ==================================================== -->
    <!-- 原子核 -->
    <!-- ==================================================== -->
    <circle cx="${cx}" cy="${cy}" r="22" fill="url(#bohr-nuc-grad)" stroke="#1e293b" stroke-width="1.8" />

    <!-- ==================================================== -->
    <!-- 電子配置 -->
    <!-- ==================================================== -->
    <!-- 軌道1の電子 (2個) -->
    ${renderElectron(cx + r1 * Math.cos(1.2), cy + r1 * Math.sin(1.2))}
    ${renderElectron(cx + r1 * Math.cos(-2.0), cy + r1 * Math.sin(-2.0))}

    <!-- 軌道2の電子 (複数個) -->
    ${renderElectron(cx + r2 * Math.cos(0.0), cy + r2 * Math.sin(0.0))}
    ${renderElectron(cx + r2 * Math.cos(0.9), cy + r2 * Math.sin(0.9))}
    ${renderElectron(cx + r2 * Math.cos(1.9), cy + r2 * Math.sin(1.9))}
    ${renderElectron(cx + r2 * Math.cos(2.8), cy + r2 * Math.sin(2.8))}
    ${renderElectron(cx + r2 * Math.cos(-1.9), cy + r2 * Math.sin(-1.9))}
    ${renderElectron(cx + r2 * Math.cos(-2.9), cy + r2 * Math.sin(-2.9))}

    <!-- 励起前の抜け殻 (空孔: 破線白丸) -->
    ${renderElectron(xFrom, yFrom, true)}

    <!-- 参考: 右下の空孔イメージ -->
    ${renderElectron(cx + r2 * Math.cos(0.85), cy + r2 * Math.sin(0.85), true)}

    <!-- 軌道3上の励起電子 -->
    ${renderElectron(xTo, yTo)}

    <!-- ==================================================== -->
    <!-- 励起遷移矢印 (青太矢印) & ラベル -->
    <!-- ==================================================== -->
    <line x1="${(xFrom + 3).toFixed(1)}" y1="${(yFrom - 6).toFixed(1)}" x2="${(xTo - 4).toFixed(1)}" y2="${(yTo + 8).toFixed(1)}" stroke="#2563eb" stroke-width="3.6" marker-end="url(#bohr-arr-blue)" />
    <text x="${(xTo - 10).toFixed(1)}" y="${(yTo + 40).toFixed(1)}" font-size="20" font-weight="700" fill="#2563eb">励起</text>

    <!-- 入射光子 (青い正弦波矢印) -->
    <path d="M 320 85 Q 330 65 340 85 T 360 85 T 375 85" fill="none" stroke="#2563eb" stroke-width="2.6" marker-end="url(#bohr-arr-photon)" />

    <!-- ==================================================== -->
    <!-- 引き出し線 & ラベル -->
    <!-- ==================================================== -->
    <!-- 電子引き出し線 -->
    <line x1="85" y1="270" x2="200" y2="270" stroke="#000000" stroke-width="1.4" marker-end="url(#bohr-arr-black)" />
    <text x="75" y="277" text-anchor="end" font-size="22" font-weight="700" fill="#000000">電子</text>

    <!-- 原子核引き出し線 -->
    <line x1="125" y1="410" x2="330" y2="280" stroke="#000000" stroke-width="1.4" marker-end="url(#bohr-arr-black)" />
    <text x="115" y="420" text-anchor="end" font-size="22" font-weight="700" fill="#000000">原子核</text>
  `;

  container.appendChild(svg);
  if (labelText) {
    const lbl = document.createElement('div');
    lbl.className = 'chem-structure-label';
    lbl.textContent = labelText;
    container.appendChild(lbl);
  }
}


