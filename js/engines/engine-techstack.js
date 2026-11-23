// ==========================================
// PhysiNote ソフトウェアスタック図（技術スタック図）パーサー & SVG描画エンジン
// ==========================================

function parseTechStackText(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;
  const match = rawText.match(/\\(?:techstack|softwarestack|stack)\s*\{([\s\S]*)\}/i);
  const content = match ? match[1] : rawText;

  const lines = content.split('\n');
  let title = '';
  let containerTitle = '';
  let theme = 'light';
  let arrows = 'up'; // 'up' | 'down' | 'none'

  const tiers = []; // 各階層: { items: [ { icon, title, sub, style, badge } ] }
  const legendItems = [];

  let currentRow = null;
  let inLegend = false;

  const parseStackItem = (rawStr) => {
    let text = rawStr.trim().replace(/;$/, '');
    let style = 'default';
    let badge = '';

    const attrM = text.match(/\[([^\]]+)\]\s*$/);
    if (attrM) {
      const attrRaw = attrM[1];
      const badgeM = attrRaw.match(/badge\s*:\s*["']([^"']+)["']/i);
      if (badgeM) badge = badgeM[1].replace(/\\n/g, '\n').trim();
      const stripped = attrRaw.replace(/badge\s*:\s*["'][^"']+["']/gi, '');
      stripped.split(/[\s,]+/).map((s) => s.trim().toLowerCase()).filter(Boolean).forEach((tok) => {
        if (tok === 'danger' || tok === 'vuln' || tok === 'cve' || tok === 'critical') style = 'danger';
        else if (tok === 'warn' || tok === 'warning' || tok === 'update') style = 'warn';
        else if (tok === 'safe' || tok === 'ok' || tok === 'patch') style = 'safe';
        else if (tok === 'base' || tok === 'hardware' || tok === 'gray' || tok === 'neutral') style = 'base';
      });
      text = text.slice(0, attrM.index).trim();
    }

    // CSV分割（引用符考慮）
    const parts = splitCsvRespectQuotes(text);

    const clean = (s) => (s || '').replace(/^["']|["']$/g, '').replace(/\\n/g, '\n').trim();
    if (parts.length >= 3) {
      return { icon: clean(parts[0]).toLowerCase(), title: clean(parts[1]), sub: clean(parts[2]), style, badge };
    }
    if (parts.length === 2) {
      return { icon: 'app', title: clean(parts[0]), sub: clean(parts[1]), style, badge };
    }
    return { icon: 'app', title: clean(parts[0] || 'レイヤー'), sub: '', style, badge };
  };

  for (let rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('//') || line.startsWith('#')) continue;

    const lower = line.toLowerCase();
    if (lower === 'legend:' || lower === 'legend') {
      currentRow = null;
      inLegend = true;
      continue;
    }
    if (lower === 'row:' || lower === 'row' || lower === 'split:' || lower === 'split') {
      inLegend = false;
      currentRow = { items: [] };
      tiers.push(currentRow);
      continue;
    }

    if (inLegend) {
      const cleanLeg = line.replace(/^(?:-\s*|・\s*)/, '').trim();
      let style = 'default';
      let body = cleanLeg;
      const attrM = cleanLeg.match(/\[([^\]]+)\]\s*$/);
      if (attrM) {
        const tok = attrM[1].toLowerCase();
        if (tok.includes('danger') || tok.includes('cve')) style = 'danger';
        else if (tok.includes('warn')) style = 'warn';
        else if (tok.includes('safe')) style = 'safe';
        body = cleanLeg.slice(0, attrM.index).trim();
      }
      body = body.replace(/^(?:box|rect|square)\b\s*/i, '').replace(/^["']|["']$/g, '').trim();
      if (body) legendItems.push({ label: body, style });
      continue;
    }

    if (currentRow && (line.startsWith('-') || line.startsWith('・'))) {
      const itemBody = line.replace(/^(?:-\s*|・\s*)/, '').trim();
      if (itemBody) currentRow.items.push(parseStackItem(itemBody));
      continue;
    }

    const metaM = line.match(/^(title|container|group|theme|arrows|arrow|layer)\s*:\s*(.+)$/i);
    if (metaM) {
      const k = metaM[1].toLowerCase();
      const v = metaM[2].trim();
      if (k === 'layer') {
        currentRow = null;
        tiers.push({ items: [parseStackItem(v)] });
      } else {
        const cleanV = v.replace(/;$/, '').replace(/^["']|["']$/g, '').trim();
        if (k === 'title') title = cleanV;
        else if (k === 'container' || k === 'group') containerTitle = cleanV;
        else if (k === 'theme') theme = cleanV.toLowerCase().includes('dark') ? 'dark' : 'light';
        else if (k === 'arrows' || k === 'arrow') {
          const lv = cleanV.toLowerCase();
          arrows = lv === 'down' ? 'down' : (lv === 'none' || lv === 'off' ? 'none' : 'up');
        }
      }
      continue;
    }

    // パイプ区切り分割行: A | B | C
    if (line.includes('|')) {
      currentRow = null;
      const segs = line.split('|').map((s) => s.trim()).filter(Boolean);
      tiers.push({ items: segs.map(parseStackItem) });
      continue;
    }

    // 暗黙単一レイヤー行
    currentRow = null;
    tiers.push({ items: [parseStackItem(line)] });
  }

  return { title, containerTitle, theme, arrows, tiers: tiers.filter((t) => t.items.length > 0), legendItems };
}

// 統一モノトーン ベクターアイコン（48x48 基準）
function renderTechStackIcon(iconType, strokeCol, fillCol, svgNS) {
  const g = document.createElementNS(svgNS, 'g');
  const add = (tag, attrs) => {
    const el = document.createElementNS(svgNS, tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, String(v)));
    g.appendChild(el);
    return el;
  };
  const base = { stroke: strokeCol, 'stroke-width': '1.7', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
  const t = String(iconType || 'app').toLowerCase().replace(/[\s_-]/g, '');

  switch (t) {
    case 'app':
    case 'cms':
    case 'ui':
    case 'frontend': {
      add('rect', { x: 6, y: 10, width: 24, height: 19, rx: 2, fill: fillCol, ...base });
      add('line', { x1: 6, y1: 15, x2: 30, y2: 15, ...base, 'stroke-width': '1.4' });
      add('circle', { cx: 18, cy: 22, r: 4.5, fill: 'none', ...base, 'stroke-width': '1.3' });
      add('rect', { x: 20, y: 18, width: 22, height: 19, rx: 2, fill: fillCol, ...base });
      add('line', { x1: 20, y1: 23, x2: 42, y2: 23, ...base, 'stroke-width': '1.4' });
      add('line', { x1: 24, y1: 27, x2: 34, y2: 27, ...base, 'stroke-width': '1.4' });
      add('line', { x1: 24, y1: 31, x2: 31, y2: 31, ...base, 'stroke-width': '1.4' });
      break;
    }
    case 'web':
    case 'webserver':
    case 'nginx':
    case 'apache': {
      add('circle', { cx: 20, cy: 22, r: 12, fill: fillCol, ...base });
      add('ellipse', { cx: 20, cy: 22, rx: 5, ry: 12, fill: 'none', ...base, 'stroke-width': '1.3' });
      add('line', { x1: 8, y1: 22, x2: 32, y2: 22, ...base, 'stroke-width': '1.3' });
      add('rect', { x: 24, y: 20, width: 17, height: 18, rx: 1.5, fill: fillCol, ...base });
      add('line', { x1: 27, y1: 25, x2: 38, y2: 25, ...base, 'stroke-width': '1.4' });
      add('line', { x1: 27, y1: 29, x2: 38, y2: 29, ...base, 'stroke-width': '1.4' });
      add('circle', { cx: 36, cy: 34, r: 1.3, fill: strokeCol });
      break;
    }
    case 'runtime':
    case 'lang':
    case 'language':
    case 'php':
    case 'java':
    case 'ruby':
    case 'node':
    case 'python': {
      // ランタイムコード＆カップ象徴シルエット
      add('path', { d: 'M16,17 L28,17 L27,25 A5,5 0 0,1 17,25 Z', fill: fillCol, ...base });
      add('path', { d: 'M28,18.5 C31.5,18.5 31.5,23.5 27.5,23.5', fill: 'none', ...base });
      add('path', { d: 'M20,10 Q18.5,12.5 20.5,14.5 M24.5,9.5 Q23,12 25,14', fill: 'none', ...base, 'stroke-width': '1.4' });
      add('ellipse', { cx: 24, cy: 33, rx: 14, ry: 5.5, fill: fillCol, ...base });
      add('path', { d: 'M17,33 L20,30.5 M17,33 L20,35.5 M31,33 L28,30.5 M31,33 L28,35.5 M25,30 L23,36', fill: 'none', ...base, 'stroke-width': '1.3' });
      break;
    }
    case 'db':
    case 'database':
    case 'cache':
    case 'sql': {
      add('path', { d: 'M12,13 L12,34 A12,4.5 0 0,0 36,34 L36,13 Z', fill: fillCol, ...base });
      add('ellipse', { cx: 24, cy: 13, rx: 12, ry: 4.5, fill: fillCol, ...base });
      add('path', { d: 'M12,20 A12,4.5 0 0,0 36,20', fill: 'none', ...base, 'stroke-width': '1.4' });
      add('path', { d: 'M12,27 A12,4.5 0 0,0 36,27', fill: 'none', ...base, 'stroke-width': '1.4' });
      break;
    }
    case 'lib':
    case 'library':
    case 'middleware':
    case 'puzzle':
    case 'sdk': {
      add('path', { d: 'M10,12 L19,12 L19,15 A2.5,2.5 0 1,1 24,15 L24,12 L31,12 L31,20 L28,20 A2.5,2.5 0 1,1 28,25 L31,25 L31,33 L10,33 Z', fill: fillCol, ...base });
      add('circle', { cx: 34, cy: 31, r: 6.5, fill: fillCol, ...base });
      add('circle', { cx: 34, cy: 31, r: 2.3, fill: 'none', ...base, 'stroke-width': '1.4' });
      break;
    }
    case 'os':
    case 'kernel':
    case 'linux':
    case 'terminal': {
      add('rect', { x: 8, y: 12, width: 32, height: 24, rx: 3, fill: fillCol, ...base });
      add('line', { x1: 8, y1: 18, x2: 40, y2: 18, ...base, 'stroke-width': '1.4' });
      add('path', { d: 'M14,23 L19,26.5 L14,30', fill: 'none', ...base, 'stroke-width': '2' });
      add('line', { x1: 22, y1: 30, x2: 30, y2: 30, ...base, 'stroke-width': '2' });
      break;
    }
    case 'hardware':
    case 'infra':
    case 'cpu':
    case 'vm':
    case 'server': {
      // サーバー + CPUチップ + ストレージの組み合わせ
      add('rect', { x: 7, y: 12, width: 12, height: 24, rx: 1.5, fill: fillCol, ...base });
      add('line', { x1: 10, y1: 17, x2: 16, y2: 17, ...base, 'stroke-width': '1.4' });
      add('circle', { cx: 13, cy: 30, r: 1.4, fill: strokeCol });
      add('rect', { x: 23, y: 15, width: 16, height: 16, rx: 2, fill: fillCol, ...base });
      [27, 31, 35].forEach((p) => {
        add('line', { x1: p, y1: 12, x2: p, y2: 15, ...base, 'stroke-width': '1.4' });
        add('line', { x1: p, y1: 31, x2: p, y2: 34, ...base, 'stroke-width': '1.4' });
      });
      add('text', { x: 31, y: 25.5, 'text-anchor': 'middle', 'font-size': '6.5', 'font-weight': '700', fill: strokeCol }).textContent = 'CPU';
      break;
    }
    case 'cloud':
    case 'saas': {
      add('path', { d: 'M14,33 L35,33 A7,7 0 0,0 36,19.5 A10,10 0 0,0 17,15 A8,8 0 0,0 14,33 Z', fill: fillCol, ...base });
      break;
    }
    case 'container':
    case 'docker':
    case 'k8s': {
      [11, 20, 29].forEach((bx) => add('rect', { x: bx, y: 16, width: 7, height: 7, rx: 1, fill: fillCol, ...base }));
      add('rect', { x: 15.5, y: 25, width: 17, height: 9, rx: 1.5, fill: fillCol, ...base });
      break;
    }
    case 'security':
    case 'auth':
    case 'waf': {
      add('path', { d: 'M24,9 L37,14 L37,24 C37,31.5 24,38 24,38 C24,38 11,31.5 11,24 L11,14 Z', fill: fillCol, ...base });
      add('path', { d: 'M18.5,23.5 L22.5,27.5 L30,19.5', fill: 'none', ...base, 'stroke-width': '2' });
      break;
    }
    default: {
      add('rect', { x: 10, y: 12, width: 28, height: 24, rx: 3, fill: fillCol, ...base });
      add('line', { x1: 15, y1: 20, x2: 33, y2: 20, ...base, 'stroke-width': '1.5' });
      add('line', { x1: 15, y1: 27, x2: 27, y2: 27, ...base, 'stroke-width': '1.5' });
      break;
    }
  }
  return g;
}

let _techStackUid = 0;

function drawTechStackSvg(rawCode, container, labelText) {
  if (!container) return;
  container.innerHTML = '';

  const parsed = parseTechStackText(rawCode);
  if (!parsed || parsed.tiers.length === 0) {
    container.innerHTML = '<div style="color:#ef4444;padding:12px;font-size:12px;">ソフトウェアスタック図の構文エラー</div>';
    return;
  }

  const isDark = parsed.theme === 'dark';
  const palette = {
    bg: isDark ? '#0b0f19' : '#ffffff',
    frameBg: isDark ? '#111827' : '#e4eef7',
    frameBorder: isDark ? '#334155' : '#334155',
    cardBg: isDark ? '#1e293b' : '#f2f7fc',
    cardBorder: isDark ? '#475569' : '#334155',
    baseBg: isDark ? '#334155' : '#dadbdd',
    dangerBg: isDark ? '#450a0a' : '#fae8e8',
    dangerBorder: isDark ? '#f87171' : '#b91c1c',
    dangerBadge: isDark ? '#dc2626' : '#b91c1c',
    warnBg: isDark ? '#451a03' : '#fef3c7',
    warnBorder: isDark ? '#fbbf24' : '#d97706',
    warnBadge: isDark ? '#d97706' : '#d97706',
    safeBg: isDark ? '#064e3b' : '#ecfdf5',
    safeBorder: isDark ? '#34d399' : '#059669',
    textMain: isDark ? '#f8fafc' : '#0f172a',
    textSub: isDark ? '#cbd5e1' : '#334155',
    iconStroke: isDark ? '#e2e8f0' : '#1e293b',
    iconFill: isDark ? '#1e293b' : '#ffffff',
    arrow: isDark ? '#94a3b8' : '#334155'
  };

  const svgNS = 'http://www.w3.org/2000/svg';
  const width = 880;
  const frameX = 28;
  const frameW = width - frameX * 2;
  const innerPadX = 22;
  const innerW = frameW - innerPadX * 2;
  const colGap = 16;
  const tierGap = parsed.arrows === 'none' ? 16 : 28;

  // 各段・各ボックスの高さと折り返しを事前計算
  const layoutTiers = parsed.tiers.map((tier) => {
    const count = tier.items.length;
    const itemW = Math.floor((innerW - (count - 1) * colGap) / count);
    const isSplit = count > 1;
    let tierH = 66;

    const preparedItems = tier.items.map((item, idx) => {
      const x = frameX + innerPadX + idx * (itemW + colGap);
      const iconSpace = isSplit ? 52 : 68;
      const badgeExtraPad = (!isSplit && item.badge) ? 140 : 18;
      const availTextW = Math.max(80, itemW - iconSpace - badgeExtraPad);
      const titleFs = isSplit ? 15 : 17;
      const subFs = isSplit ? 12.5 : 13;

      const titleLines = wrapSvgTextLines(item.title, availTextW, titleFs);
      const subLines = wrapSvgTextLines(item.sub, availTextW, subFs);
      const badgeLines = item.badge ? item.badge.split('\n').map((s) => s.trim()).filter(Boolean) : [];
      const badgeH = badgeLines.length > 0 ? (badgeLines.length * 13 + 10) : 0;
      const badgeInBox = (isSplit && badgeH > 0) ? (badgeH - Math.round(badgeH * 0.55)) : 0;
      const topPad = Math.max(12, badgeInBox + 8);

      const textH = titleLines.length * (titleFs + 5) + (subLines.length > 0 ? 4 + subLines.length * (subFs + 4) : 0);
      const boxH = Math.max(66, textH + topPad + 12);
      if (boxH > tierH) tierH = boxH;

      return { ...item, x, w: itemW, isSplit, titleFs, subFs, titleLines, subLines, badgeLines, topPad };
    });

    return { items: preparedItems, h: tierH };
  });

  const titleLayout = parsed.title ? layoutSvgTitleLines(parsed.title, width - 48, 21, 14.5) : { lines: [], fontSize: 21 };
  const titleSpace = titleLayout.lines.length > 1 ? 68 : (titleLayout.lines.length === 1 ? 52 : 18);
  const containerHeaderH = parsed.containerTitle ? 40 : 18;
  let curY = titleSpace + containerHeaderH;

  layoutTiers.forEach((tier, tIdx) => {
    // 分割ボックス上部にバッジが突き出す場合用の追加余裕
    const maxTopProtrude = tier.items.reduce((mx, it) => {
      if (!it.isSplit || it.badgeLines.length === 0) return mx;
      const bh = it.badgeLines.length * 13 + 10;
      return Math.max(mx, Math.round(bh * 0.55));
    }, 0);
    if (maxTopProtrude > 0) {
      curY += tIdx === 0 ? (maxTopProtrude + 6) : Math.max(12, maxTopProtrude - 4);
    }
    tier.y = curY;
    tier.items.forEach((it) => { it.y = curY; it.h = tier.h; });
    curY += tier.h + (tIdx < layoutTiers.length - 1 ? tierGap : 22);
  });

  const frameY = titleSpace;
  const frameH = curY - frameY;
  const legendY = frameY + frameH + 24;
  const hasLegend = parsed.legendItems.length > 0;
  const height = Math.max(360, hasLegend ? legendY + 28 : frameY + frameH + 22);

  container.dataset.baseWidth = width;
  const uid = `ts${++_techStackUid}`;

  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.style.maxWidth = '100%';
  svg.style.height = 'auto';
  svg.style.display = 'block';

  const defs = document.createElementNS(svgNS, 'defs');
  createSvgArrowMarker(defs, `${uid}-arrow`, palette.arrow, {
    refX: 6, width: 6.5, height: 6.5, d: 'M 1 1.5 L 8.5 5 L 1 8.5 L 3 5 Z'
  });
  svg.appendChild(defs);

  // 背景
  const bg = document.createElementNS(svgNS, 'rect');
  bg.setAttribute('width', width);
  bg.setAttribute('height', height);
  bg.setAttribute('rx', '10');
  bg.setAttribute('fill', palette.bg);
  svg.appendChild(bg);

  // タイトル
  if (titleLayout.lines.length > 0) {
    titleLayout.lines.forEach((ln, idx) => {
      const tEl = document.createElementNS(svgNS, 'text');
      tEl.setAttribute('x', width / 2);
      tEl.setAttribute('y', String(titleLayout.lines.length > 1 ? (27 + idx * 23) : 34));
      tEl.setAttribute('text-anchor', 'middle');
      tEl.setAttribute('font-size', String(titleLayout.fontSize));
      tEl.setAttribute('font-weight', '800');
      tEl.setAttribute('fill', palette.textMain);
      tEl.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
      tEl.textContent = ln;
      svg.appendChild(tEl);
    });
  }

  // 外枠コンテナ
  const frameRect = document.createElementNS(svgNS, 'rect');
  frameRect.setAttribute('x', frameX);
  frameRect.setAttribute('y', frameY);
  frameRect.setAttribute('width', frameW);
  frameRect.setAttribute('height', frameH);
  frameRect.setAttribute('rx', '12');
  frameRect.setAttribute('fill', palette.frameBg);
  frameRect.setAttribute('stroke', palette.frameBorder);
  frameRect.setAttribute('stroke-width', '1.5');
  svg.appendChild(frameRect);

  if (parsed.containerTitle) {
    const ct = document.createElementNS(svgNS, 'text');
    ct.setAttribute('x', width / 2);
    ct.setAttribute('y', frameY + 26);
    ct.setAttribute('text-anchor', 'middle');
    ct.setAttribute('font-size', '15.5');
    ct.setAttribute('font-weight', '700');
    ct.setAttribute('fill', palette.textMain);
    ct.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
    ct.textContent = parsed.containerTitle;
    svg.appendChild(ct);
  }

  // レイヤー間矢印（デフォルト ↑: 下層が上層を支える）
  if (parsed.arrows !== 'none') {
    for (let tIdx = 0; tIdx < layoutTiers.length - 1; tIdx++) {
      const upper = layoutTiers[tIdx];
      const lower = layoutTiers[tIdx + 1];
      const yTop = upper.y + upper.h;
      const yBot = lower.y;

      const colCenters = [];
      if (upper.items.length >= lower.items.length) {
        upper.items.forEach((it) => colCenters.push(it.x + it.w / 2));
      } else {
        lower.items.forEach((it) => colCenters.push(it.x + it.w / 2));
      }

      colCenters.forEach((cx) => {
        const isDown = parsed.arrows === 'down';
        drawSvgConnector(svg, {
          x1: cx,
          y1: isDown ? (yTop + 3) : (yBot - 3),
          x2: cx,
          y2: isDown ? (yBot - 5) : (yTop + 5)
        }, {
          stroke: palette.arrow,
          strokeWidth: '1.5',
          markerEnd: `${uid}-arrow`
        });
      });
    }
  }

  // 各ボックス描画
  layoutTiers.forEach((tier) => {
    tier.items.forEach((item) => {
      let boxFill = palette.cardBg;
      let boxStroke = palette.cardBorder;
      let isDashed = false;
      let badgeFill = palette.dangerBadge;

      if (item.style === 'danger') {
        boxFill = palette.dangerBg;
        boxStroke = palette.dangerBorder;
        isDashed = false;
        badgeFill = palette.dangerBadge;
      } else if (item.style === 'warn') {
        boxFill = palette.warnBg;
        boxStroke = palette.warnBorder;
        isDashed = true;
        badgeFill = palette.warnBadge;
      } else if (item.style === 'safe') {
        boxFill = palette.safeBg;
        boxStroke = palette.safeBorder;
        isDashed = true;
        badgeFill = palette.safeBorder;
      } else if (item.style === 'base') {
        boxFill = palette.baseBg;
      }

      const rect = document.createElementNS(svgNS, 'rect');
      rect.setAttribute('x', item.x);
      rect.setAttribute('y', item.y);
      rect.setAttribute('width', item.w);
      rect.setAttribute('height', item.h);
      rect.setAttribute('rx', '10');
      rect.setAttribute('fill', boxFill);
      rect.setAttribute('stroke', boxStroke);
      rect.setAttribute('stroke-width', item.style === 'danger' ? '1.8' : (isDashed ? '1.6' : '1.4'));
      if (isDashed) rect.setAttribute('stroke-dasharray', '5 4');
      svg.appendChild(rect);

      // 左アイコン
      const iconScale = item.isSplit ? 0.96 : 1.1;
      const iconX = item.x + (item.isSplit ? 10 : 18);
      const iconY = item.y + (item.h - 48 * iconScale) / 2;
      const iconG = document.createElementNS(svgNS, 'g');
      iconG.setAttribute('transform', `translate(${iconX.toFixed(1)}, ${iconY.toFixed(1)}) scale(${iconScale})`);
      iconG.appendChild(renderTechStackIcon(item.icon, palette.iconStroke, palette.iconFill, svgNS));
      svg.appendChild(iconG);

      // テキストブロック（全幅はバー中央、分割はアイコン右エリア中央）
      const textCenterX = item.isSplit
        ? (item.x + 58 + (item.w - 64) / 2)
        : (item.x + item.w / 2);

      const titleBlockH = item.titleLines.length * (item.titleFs + 5);
      const subBlockH = item.subLines.length > 0 ? 4 + item.subLines.length * (item.subFs + 4) : 0;
      const totalTH = titleBlockH + subBlockH;
      const textTopOffset = Math.max((item.h - totalTH) / 2, item.topPad);
      let textY = item.y + textTopOffset + item.titleFs;

      item.titleLines.forEach((ln) => {
        const t = document.createElementNS(svgNS, 'text');
        t.setAttribute('x', textCenterX);
        t.setAttribute('y', textY);
        t.setAttribute('text-anchor', 'middle');
        t.setAttribute('font-size', String(item.titleFs));
        t.setAttribute('font-weight', '700');
        t.setAttribute('fill', palette.textMain);
        t.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
        t.textContent = ln;
        svg.appendChild(t);
        textY += item.titleFs + 5;
      });

      if (item.subLines.length > 0) {
        textY += 4;
        item.subLines.forEach((ln) => {
          const st = document.createElementNS(svgNS, 'text');
          st.setAttribute('x', textCenterX);
          st.setAttribute('y', textY);
          st.setAttribute('text-anchor', 'middle');
          st.setAttribute('font-size', String(item.subFs));
          st.setAttribute('font-weight', '500');
          st.setAttribute('fill', palette.textSub);
          st.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
          st.textContent = ln;
          svg.appendChild(st);
          textY += item.subFs + 4;
        });
      }

      // リスク・CVEピルバッジ
      if (item.badgeLines.length > 0) {
        const maxBLen = Math.max(...item.badgeLines.map((l) => estimateSvgTextWidth(l, 10.5, false)));
        const bw = Math.max(82, Math.ceil(maxBLen + 20));
        const bh = item.badgeLines.length * 13 + 10;
        const bx = item.isSplit
          ? (item.x + item.w - bw - 6)
          : (item.x + item.w - bw - 14);
        const by = item.isSplit
          ? (item.y - Math.round(bh * 0.55))
          : (item.y + (item.h - bh) / 2);

        const br = document.createElementNS(svgNS, 'rect');
        br.setAttribute('x', bx);
        br.setAttribute('y', by);
        br.setAttribute('width', bw);
        br.setAttribute('height', bh);
        br.setAttribute('rx', '6');
        br.setAttribute('fill', badgeFill);
        svg.appendChild(br);

        item.badgeLines.forEach((bl, bi) => {
          const bt = document.createElementNS(svgNS, 'text');
          bt.setAttribute('x', bx + bw / 2);
          bt.setAttribute('y', by + 14 + bi * 13);
          bt.setAttribute('text-anchor', 'middle');
          bt.setAttribute('font-size', '10.5');
          bt.setAttribute('font-weight', '700');
          bt.setAttribute('fill', '#ffffff');
          bt.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
          bt.textContent = bl;
          svg.appendChild(bt);
        });
      }
    });
  });

  // 下部凡例（右寄せ）
  if (hasLegend) {
    let lx = frameX + frameW;
    for (let i = parsed.legendItems.length - 1; i >= 0; i--) {
      const li = parsed.legendItems[i];
      const textW = estimateSvgTextWidth(`: ${li.label}`, 11.5, false);
      lx -= (textW + 18);

      const txt = document.createElementNS(svgNS, 'text');
      txt.setAttribute('x', lx + 16);
      txt.setAttribute('y', legendY);
      txt.setAttribute('font-size', '11.5');
      txt.setAttribute('font-weight', '600');
      txt.setAttribute('fill', li.style === 'danger' ? palette.dangerBorder : palette.textMain);
      txt.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
      txt.textContent = `: ${li.label}`;
      svg.appendChild(txt);

      const sq = document.createElementNS(svgNS, 'rect');
      sq.setAttribute('x', lx);
      sq.setAttribute('y', legendY - 10);
      sq.setAttribute('width', '12');
      sq.setAttribute('height', '12');
      sq.setAttribute('rx', '2');
      sq.setAttribute('fill', li.style === 'danger' ? palette.dangerBadge : (li.style === 'warn' ? palette.warnBadge : palette.baseBg));
      sq.setAttribute('stroke', li.style === 'danger' ? palette.dangerBorder : palette.cardBorder);
      sq.setAttribute('stroke-width', '1');
      svg.appendChild(sq);

      lx -= 20;
    }
  }

  container.appendChild(svg);

  appendDiagramLabel(container, labelText);
}
