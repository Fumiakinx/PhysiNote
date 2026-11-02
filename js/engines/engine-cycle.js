// ==========================================
// サイクル図・バブル図 (Circular / Bubble Diagram) エンジン
// LaTeX smartdiagram ([circular diagram], [bubble diagram]) & 独自構文 (\cycle, \bubble)
// ==========================================

/**
 * テキスト自動折り返しヘルパー
 */
function wrapCycleText(str, maxChars = 14) {
  if (!str) return [];
  if (str.includes('\\n') || str.includes('\n')) {
    return str.split(/\\n|\n/).map(s => s.trim()).filter(Boolean);
  }
  const lines = [];
  let cur = '';
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    cur += ch;
    const len = cur.replace(/[^\x00-\xff]/g, 'aa').length;
    if (len >= maxChars * 2 && i < str.length - 1) {
      lines.push(cur.trim());
      cur = '';
    }
  }
  if (cur.trim()) lines.push(cur.trim());
  return lines;
}

/**
 * テキストの推定ピクセル幅計算ヘルパー
 */
function getApproxCycleTextWidth(str) {
  if (!str) return 0;
  let len = 0;
  for (let i = 0; i < str.length; i++) {
    len += str.charCodeAt(i) > 255 ? 12 : 7;
  }
  return len;
}

/**
 * サイクル・バブル図パーサー
 * @param {string} rawText
 * @returns {object|null}
 */
function parseCycle(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;

  const defaultColors = [
    { bg: '#eff6ff', border: '#3b82f6', text: '#1e40af', badge: '#2563eb' }, // Blue
    { bg: '#ecfdf5', border: '#10b981', text: '#065f46', badge: '#059669' }, // Emerald
    { bg: '#fffbeb', border: '#f59e0b', text: '#92400e', badge: '#d97706' }, // Amber
    { bg: '#fef2f2', border: '#ef4444', text: '#991b1b', badge: '#dc2626' }, // Rose/Red
    { bg: '#f5f3ff', border: '#8b5cf6', text: '#5b21b6', badge: '#7c3aed' }, // Purple
    { bg: '#fdf2f8', border: '#ec4899', text: '#9d174d', badge: '#db2777' }, // Pink
    { bg: '#ecfeff', border: '#06b6d4', text: '#155e75', badge: '#0891b2' }, // Cyan
    { bg: '#f0fdf4', border: '#22c55e', text: '#166534', badge: '#16a34a' }  // Green
  ];

  // 1. LaTeX smartdiagram 構文判定
  // \smartdiagram[circular diagram]{Plan, Do, Check, Act}
  // \smartdiagram[bubble diagram]{中心概念, アイデア1, アイデア2, ...}
  const smartMatch = rawText.match(/\\smartdiagram\s*\[\s*([^\]]+)\]\s*\{([\s\S]*?)\}/i);
  if (smartMatch) {
    const kind = smartMatch[1].trim().toLowerCase();
    const content = smartMatch[2].trim();

    let title = '';
    const titleM = rawText.match(/(?:%|#|\/\/)\s*title\s*:\s*(.+)$/im);
    if (titleM) {
      title = titleM[1].trim().replace(/;$/, '').replace(/^["']|["']$/g, '');
    }

    // カンマまたはセミコロン・改行で分割（引用符考慮）
    const rawItems = content.split(/,\s*(?=(?:[^"]*"[^"]*")*[^"]*$)|[\n;]+/)
      .map(s => s.trim().replace(/^["']|["']$/g, ''))
      .filter(Boolean);

    if (kind.includes('bubble') || kind.includes('constellation')) {
      // バブル図: 最初の要素が中心
      const centerText = rawItems[0] || '中心概念';
      const satellites = rawItems.slice(1).map((name, idx) => ({
        name,
        desc: '',
        color: defaultColors[idx % defaultColors.length]
      }));

      return {
        type: 'bubble',
        title: title || 'バブル連想図 (smartdiagram)',
        center: { name: centerText, desc: '' },
        items: satellites
      };
    } else {
      // 循環・サイクル図
      const items = rawItems.map((itemStr, idx) => {
        let name = itemStr;
        let desc = '';
        if (itemStr.includes('/')) {
          const parts = itemStr.split('/');
          name = parts[0].trim();
          desc = parts[1].trim();
        }
        return {
          name,
          desc,
          color: defaultColors[idx % defaultColors.length]
        };
      });

      return {
        type: 'circular',
        title: title || '循環サイクル図 (smartdiagram)',
        items
      };
    }
  }

  // 2. 独自構文判定 (\cycle{...}, \circular{...}, \bubble{...})
  let content = rawText.trim();
  const cmdMatch = content.match(/^\\(?:cycle|circular|bubble)\s*\{([\s\S]*)\}\s*$/i);
  let isBubbleCommand = /^\\bubble/i.test(content);
  if (cmdMatch) {
    content = cmdMatch[1];
  }

  const lines = content.split('\n');
  let title = '';
  let subtitle = '';
  let centerName = '';
  let centerDesc = '';
  let diagramType = isBubbleCommand ? 'bubble' : 'circular';
  const items = [];

  lines.forEach(rawLine => {
    let line = rawLine.trim();
    if (!line || line.startsWith('//') || line.startsWith('#') || line.startsWith('%')) return;

    if (line.endsWith(';')) line = line.slice(0, -1).trim();

    // title: ...
    const tM = line.match(/^title\s*:\s*(.+)$/i);
    if (tM) {
      title = tM[1].trim().replace(/^["']|["']$/g, '');
      return;
    }
    // subtitle: ...
    const subM = line.match(/^sub(?:title)?\s*:\s*(.+)$/i);
    if (subM) {
      subtitle = subM[1].trim().replace(/^["']|["']$/g, '');
      return;
    }
    // type: circular | bubble
    const typeM = line.match(/^type\s*:\s*(circular|bubble|cycle)/i);
    if (typeM) {
      diagramType = typeM[1].toLowerCase() === 'bubble' ? 'bubble' : 'circular';
      return;
    }
    // center: "コア" (説明)
    const centerM = line.match(/^center\s*:\s*(.+)$/i);
    if (centerM) {
      let val = centerM[1].trim();
      const parenM = val.match(/\((.*?)\)/);
      if (parenM) {
        centerDesc = parenM[1].trim();
        val = val.replace(/\(.*?\)/, '').trim();
      }
      centerName = val.replace(/^["']|["']$/g, '').trim();
      diagramType = 'bubble';
      return;
    }

    // step: "Plan" (説明) [color] または 単純な "項目名" (説明)
    let text = line.replace(/^(?:step|node|item)\s*:\s*/i, '').trim();
    let desc = '';
    const descM = text.match(/\((.*?)\)/);
    if (descM) {
      desc = descM[1].trim();
      text = text.replace(/\(.*?\)/, '').trim();
    }

    let customColor = null;
    const colM = text.match(/\[(.*?)\]/);
    if (colM) {
      const cTag = colM[1].trim();
      text = text.replace(/\[.*?\]/, '').trim();
      if (/^#[0-9a-fA-F]{3,8}$/.test(cTag)) {
        customColor = { bg: cTag + '18', border: cTag, text: cTag, badge: cTag };
      }
    }

    const name = text.replace(/^["']|["']$/g, '').trim();
    if (name) {
      const idx = items.length;
      items.push({
        name,
        desc,
        color: customColor || defaultColors[idx % defaultColors.length]
      });
    }
  });

  if (diagramType === 'bubble' && !centerName && items.length > 0) {
    const first = items.shift();
    centerName = first.name;
    centerDesc = first.desc;
  }

  return {
    type: diagramType,
    title: title || (diagramType === 'bubble' ? 'バブル連想図' : '循環サイクル図'),
    subtitle,
    center: { name: centerName || 'コア概念', desc: centerDesc },
    items
  };
}

/**
 * サイクル図・バブル図 SVG 描画エンジン
 * @param {string} text - 入力ソースコード
 * @param {HTMLElement} container - 描画先DOMコンテナ
 * @param {string|null} labelText - 右下表示用キャプション
 */
function drawCycleSvg(text, container, labelText) {
  if (!container) return;
  container.innerHTML = '';

  const data = parseCycle(text);
  if (!data || (!data.items.length && !data.center?.name)) {
    container.innerHTML = '<div style="color: #ef4444; padding: 12px; font-size: 13px;">サイクル図の構文を認識できませんでした。</div>';
    return;
  }

  const svgNS = 'http://www.w3.org/2000/svg';
  const N = data.items.length;

  const width = 720;
  const height = 620;
  const cx = width / 2;
  const cy = 320;

  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.setAttribute('style', 'max-width: 100%; height: auto; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif; display: block; margin: 0 auto; background: #ffffff; border-radius: 8px;');

  // 定義 (矢印マーカー, フィルタ)
  const defs = document.createElementNS(svgNS, 'defs');

  // シャドウフィルタ
  const filter = document.createElementNS(svgNS, 'filter');
  filter.setAttribute('id', 'cycle-shadow');
  filter.setAttribute('x', '-15%');
  filter.setAttribute('y', '-15%');
  filter.setAttribute('width', '130%');
  filter.setAttribute('height', '130%');
  filter.innerHTML = `
    <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#0f172a" flood-opacity="0.08" />
  `;
  defs.appendChild(filter);

  // マーカー (円弧矢印用)
  const marker = document.createElementNS(svgNS, 'marker');
  marker.setAttribute('id', 'cycle-arrow');
  marker.setAttribute('viewBox', '0 0 10 10');
  marker.setAttribute('refX', '7');
  marker.setAttribute('refY', '5');
  marker.setAttribute('markerWidth', '6');
  marker.setAttribute('markerHeight', '6');
  marker.setAttribute('orient', 'auto-start-reverse');
  const arrowPath = document.createElementNS(svgNS, 'path');
  arrowPath.setAttribute('d', 'M 0 1 L 9 5 L 0 9 z');
  arrowPath.setAttribute('fill', '#64748b');
  marker.appendChild(arrowPath);
  defs.appendChild(marker);

  svg.appendChild(defs);

  // タイトル描画
  if (data.title) {
    const titleText = document.createElementNS(svgNS, 'text');
    titleText.setAttribute('x', cx);
    titleText.setAttribute('y', '32');
    titleText.setAttribute('text-anchor', 'middle');
    titleText.setAttribute('font-size', '17');
    titleText.setAttribute('font-weight', '700');
    titleText.setAttribute('fill', '#0f172a');
    titleText.textContent = data.title;
    svg.appendChild(titleText);
  }

  if (data.subtitle) {
    const subText = document.createElementNS(svgNS, 'text');
    subText.setAttribute('x', cx);
    subText.setAttribute('y', '52');
    subText.setAttribute('text-anchor', 'middle');
    subText.setAttribute('font-size', '12');
    subText.setAttribute('font-weight', '400');
    subText.setAttribute('fill', '#64748b');
    subText.textContent = data.subtitle;
    svg.appendChild(subText);
  }

  if (data.type === 'circular') {
    // ----------------------------------------------------
    // 1. 循環サイクル図 (Circular Diagram)
    // ----------------------------------------------------
    const R = N <= 3 ? 140 : (N <= 5 ? 165 : 185);
    const nodeW = N <= 4 ? 130 : 115;
    const nodeH = N <= 4 ? 60 : 54;

    // 各ノードの中心座標を事前計算
    const coords = [];
    for (let i = 0; i < N; i++) {
      // 12時位置（-PI/2）から時計回りに配置
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / N;
      const nx = cx + R * Math.cos(angle);
      const ny = cy + R * Math.sin(angle);
      coords.push({ angle, nx, ny });
    }

    // 接続円弧矢印の描画 (ノード間)
    if (N >= 2) {
      const arrowGroup = document.createElementNS(svgNS, 'g');
      for (let i = 0; i < N; i++) {
        const nextIdx = (i + 1) % N;
        const curA = coords[i].angle;
        let nextA = coords[nextIdx].angle;
        if (nextA <= curA) nextA += 2 * Math.PI;

        // ノードの枠分だけ角度をオフセット
        const angleSpan = nextA - curA;
        const offsetA = Math.min(angleSpan * 0.28, 0.45);
        const startA = curA + offsetA;
        const endA = nextA - offsetA;

        const sx = cx + R * Math.cos(startA);
        const sy = cy + R * Math.sin(startA);
        const ex = cx + R * Math.cos(endA);
        const ey = cy + R * Math.sin(endA);

        const arcPath = document.createElementNS(svgNS, 'path');
        // A rx ry x-axis-rotation large-arc-flag sweep-flag x y
        arcPath.setAttribute('d', `M ${sx.toFixed(1)} ${sy.toFixed(1)} A ${R} ${R} 0 0 1 ${ex.toFixed(1)} ${ey.toFixed(1)}`);
        arcPath.setAttribute('fill', 'none');
        arcPath.setAttribute('stroke', '#94a3b8');
        arcPath.setAttribute('stroke-width', '2.5');
        arcPath.setAttribute('stroke-dasharray', 'none');
        arcPath.setAttribute('marker-end', 'url(#cycle-arrow)');
        arrowGroup.appendChild(arcPath);
      }
      svg.appendChild(arrowGroup);
    }

    // 中央のサイクルアイコン・装飾（中央空スペース）
    const centerIconGroup = document.createElementNS(svgNS, 'g');
    centerIconGroup.setAttribute('opacity', '0.18');
    const centerCircle = document.createElementNS(svgNS, 'circle');
    centerCircle.setAttribute('cx', cx);
    centerCircle.setAttribute('cy', cy);
    centerCircle.setAttribute('r', R * 0.42);
    centerCircle.setAttribute('fill', 'none');
    centerCircle.setAttribute('stroke', '#64748b');
    centerCircle.setAttribute('stroke-width', '2');
    centerCircle.setAttribute('stroke-dasharray', '5 4');
    centerIconGroup.appendChild(centerCircle);

    const centerLabel = document.createElementNS(svgNS, 'text');
    centerLabel.setAttribute('x', cx);
    centerLabel.setAttribute('y', cy + 5);
    centerLabel.setAttribute('text-anchor', 'middle');
    centerLabel.setAttribute('font-size', '14');
    centerLabel.setAttribute('font-weight', '700');
    centerLabel.setAttribute('fill', '#475569');
    centerLabel.setAttribute('letter-spacing', '2px');
    centerLabel.textContent = 'CYCLE';
    centerIconGroup.appendChild(centerLabel);
    svg.appendChild(centerIconGroup);

    // ノード描画
    const nodesGroup = document.createElementNS(svgNS, 'g');
    for (let i = 0; i < N; i++) {
      const it = data.items[i];
      const { nx, ny } = coords[i];

      const g = document.createElementNS(svgNS, 'g');
      g.setAttribute('transform', `translate(${(nx - nodeW / 2).toFixed(1)}, ${(ny - nodeH / 2).toFixed(1)})`);

      // カード外枠
      const rect = document.createElementNS(svgNS, 'rect');
      rect.setAttribute('width', nodeW);
      rect.setAttribute('height', nodeH);
      rect.setAttribute('rx', '8');
      rect.setAttribute('fill', it.color.bg || '#ffffff');
      rect.setAttribute('stroke', it.color.border || '#cbd5e1');
      rect.setAttribute('stroke-width', '2');
      rect.setAttribute('filter', 'url(#cycle-shadow)');
      g.appendChild(rect);

      // 上部番号バッジ
      const badge = document.createElementNS(svgNS, 'circle');
      badge.setAttribute('cx', '14');
      badge.setAttribute('cy', '14');
      badge.setAttribute('r', '8.5');
      badge.setAttribute('fill', it.color.badge || '#3b82f6');
      g.appendChild(badge);

      const numText = document.createElementNS(svgNS, 'text');
      numText.setAttribute('x', '14');
      numText.setAttribute('y', '17.5');
      numText.setAttribute('text-anchor', 'middle');
      numText.setAttribute('font-size', '10');
      numText.setAttribute('font-weight', '700');
      numText.setAttribute('fill', '#ffffff');
      numText.textContent = String(i + 1);
      g.appendChild(numText);

      // テキスト
      const titleLines = wrapCycleText(it.name, 9);
      if (it.desc) {
        // タイトル + サブ説明
        const tEl = document.createElementNS(svgNS, 'text');
        tEl.setAttribute('x', nodeW / 2 + 6);
        tEl.setAttribute('y', nodeH / 2 - 3);
        tEl.setAttribute('text-anchor', 'middle');
        tEl.setAttribute('font-size', '12.5');
        tEl.setAttribute('font-weight', '700');
        tEl.setAttribute('fill', it.color.text || '#0f172a');
        tEl.textContent = titleLines[0] || it.name;
        g.appendChild(tEl);

        const dEl = document.createElementNS(svgNS, 'text');
        dEl.setAttribute('x', nodeW / 2);
        dEl.setAttribute('y', nodeH / 2 + 15);
        dEl.setAttribute('text-anchor', 'middle');
        dEl.setAttribute('font-size', '10.5');
        dEl.setAttribute('font-weight', '500');
        dEl.setAttribute('fill', '#64748b');
        dEl.textContent = it.desc;
        g.appendChild(dEl);
      } else {
        // タイトルのみ（複数行対応）
        const startY = nodeH / 2 - (titleLines.length - 1) * 7.5 + 4;
        titleLines.forEach((tl, lIdx) => {
          const tEl = document.createElementNS(svgNS, 'text');
          tEl.setAttribute('x', nodeW / 2 + (lIdx === 0 ? 5 : 0));
          tEl.setAttribute('y', startY + lIdx * 15);
          tEl.setAttribute('text-anchor', 'middle');
          tEl.setAttribute('font-size', '12.5');
          tEl.setAttribute('font-weight', '700');
          tEl.setAttribute('fill', it.color.text || '#0f172a');
          tEl.textContent = tl;
          g.appendChild(tEl);
        });
      }

      nodesGroup.appendChild(g);
    }
    svg.appendChild(nodesGroup);

  } else {
    // ----------------------------------------------------
    // 2. バブル連想図 (Bubble Diagram)
    // ----------------------------------------------------
    const centerR = 64;
    const satR = N <= 4 ? 62 : (N <= 6 ? 56 : (N <= 8 ? 48 : 42));
    const orbitR = N <= 4 ? 195 : (N <= 6 ? 205 : 215);

    // 接続線描画 (中心バブル -> 各衛星バブル)
    const linesGroup = document.createElementNS(svgNS, 'g');
    const satCoords = [];

    for (let i = 0; i < N; i++) {
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / N;
      const sx = cx + orbitR * Math.cos(angle);
      const sy = cy + orbitR * Math.sin(angle);
      satCoords.push({ angle, sx, sy });

      const line = document.createElementNS(svgNS, 'line');
      line.setAttribute('x1', cx);
      line.setAttribute('y1', cy);
      line.setAttribute('x2', sx.toFixed(1));
      line.setAttribute('y2', sy.toFixed(1));
      line.setAttribute('stroke', '#cbd5e1');
      line.setAttribute('stroke-width', '2');
      line.setAttribute('stroke-dasharray', '4 3');
      linesGroup.appendChild(line);
    }
    svg.appendChild(linesGroup);

    // 衛星バブル描画
    const satGroup = document.createElementNS(svgNS, 'g');
    for (let i = 0; i < N; i++) {
      const it = data.items[i];
      const { sx, sy } = satCoords[i];

      const g = document.createElementNS(svgNS, 'g');
      g.setAttribute('transform', `translate(${sx.toFixed(1)}, ${sy.toFixed(1)})`);

      const circle = document.createElementNS(svgNS, 'circle');
      circle.setAttribute('r', satR);
      circle.setAttribute('fill', it.color.bg || '#f8fafc');
      circle.setAttribute('stroke', it.color.border || '#3b82f6');
      circle.setAttribute('stroke-width', '2.5');
      circle.setAttribute('filter', 'url(#cycle-shadow)');
      g.appendChild(circle);

      // テキスト描画（円の直径に応じた安全幅計算）
      const maxSafeWidth = satR * 1.62;
      const lines = wrapCycleText(it.name, satR > 50 ? 8 : 6);

      // タイトル行の最大推定幅
      let maxTitleW = 0;
      lines.forEach((l) => {
        const w = getApproxCycleTextWidth(l);
        if (w > maxTitleW) maxTitleW = w;
      });

      // タイトルフォントサイズの自動スケーリング
      let titleFs = satR > 50 ? 12.5 : 11;
      if (maxTitleW * (titleFs / 12) > maxSafeWidth) {
        titleFs = Math.max(9.5, Math.floor(maxSafeWidth / (maxTitleW / 12)));
      }

      // 説明文（desc）フォントサイズの自動スケーリング
      let descFs = satR > 50 ? 10 : 9;
      if (it.desc) {
        const descW = getApproxCycleTextWidth(it.desc);
        if (descW * (descFs / 10) > maxSafeWidth) {
          descFs = Math.max(8.0, Math.floor(maxSafeWidth / (descW / 10)));
        }
      }

      const lineStep = titleFs + 2.5;
      const startY = it.desc
        ? -(lines.length * (lineStep / 2) + 2)
        : -(lines.length - 1) * (lineStep / 2) + 3;

      lines.forEach((tl, lIdx) => {
        const tEl = document.createElementNS(svgNS, 'text');
        tEl.setAttribute('x', '0');
        tEl.setAttribute('y', (startY + lIdx * lineStep).toFixed(1));
        tEl.setAttribute('text-anchor', 'middle');
        tEl.setAttribute('font-size', String(titleFs));
        tEl.setAttribute('font-weight', '700');
        tEl.setAttribute('fill', it.color.text || '#0f172a');
        tEl.textContent = tl;
        g.appendChild(tEl);
      });

      if (it.desc) {
        const dEl = document.createElementNS(svgNS, 'text');
        dEl.setAttribute('x', '0');
        dEl.setAttribute('y', (startY + lines.length * lineStep + descFs * 0.9).toFixed(1));
        dEl.setAttribute('text-anchor', 'middle');
        dEl.setAttribute('font-size', String(descFs));
        dEl.setAttribute('font-weight', '500');
        dEl.setAttribute('fill', '#64748b');
        dEl.textContent = it.desc;
        g.appendChild(dEl);
      }

      satGroup.appendChild(g);
    }
    svg.appendChild(satGroup);

    // 中心バブル描画 (最前面)
    const centerG = document.createElementNS(svgNS, 'g');
    centerG.setAttribute('transform', `translate(${cx}, ${cy})`);

    const cCircle = document.createElementNS(svgNS, 'circle');
    cCircle.setAttribute('r', centerR);
    cCircle.setAttribute('fill', '#1e293b');
    cCircle.setAttribute('stroke', '#0f172a');
    cCircle.setAttribute('stroke-width', '3');
    cCircle.setAttribute('filter', 'url(#cycle-shadow)');
    centerG.appendChild(cCircle);

    const cHalo = document.createElementNS(svgNS, 'circle');
    cHalo.setAttribute('r', centerR + 5);
    cHalo.setAttribute('fill', 'none');
    cHalo.setAttribute('stroke', '#3b82f6');
    cHalo.setAttribute('stroke-width', '2');
    cHalo.setAttribute('stroke-dasharray', '4 3');
    cHalo.setAttribute('opacity', '0.6');
    centerG.appendChild(cHalo);

    const cLines = wrapCycleText(data.center.name, 8);
    const cStartY = data.center.desc ? -(cLines.length * 7.5) : -(cLines.length - 1) * 8 + 4;

    cLines.forEach((cl, lIdx) => {
      const cText = document.createElementNS(svgNS, 'text');
      cText.setAttribute('x', '0');
      cText.setAttribute('y', (cStartY + lIdx * 16).toFixed(1));
      cText.setAttribute('text-anchor', 'middle');
      cText.setAttribute('font-size', '13.5');
      cText.setAttribute('font-weight', '700');
      cText.setAttribute('fill', '#ffffff');
      cText.textContent = cl;
      centerG.appendChild(cText);
    });

    if (data.center.desc) {
      const cdText = document.createElementNS(svgNS, 'text');
      cdText.setAttribute('x', '0');
      cdText.setAttribute('y', (cStartY + cLines.length * 16 + 2).toFixed(1));
      cdText.setAttribute('text-anchor', 'middle');
      cdText.setAttribute('font-size', '10.5');
      cdText.setAttribute('font-weight', '400');
      cdText.setAttribute('fill', '#94a3b8');
      cdText.textContent = data.center.desc;
      centerG.appendChild(cdText);
    }

    svg.appendChild(centerG);
  }

  container.appendChild(svg);
  appendDiagramLabel(container, labelText);
}

