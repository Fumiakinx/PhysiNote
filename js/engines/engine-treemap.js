// ==========================================
// ツリーマップ（\treemap / 面積比・構成比・ヒートマップ）パーサー ＆ SVG描画エンジン
// ==========================================

function parseTreemap(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;
  let text = rawText.trim();

  // 1. \treemap{...} のアンラップ
  const wrapperMatch = text.match(/^\\treemap\{([\s\S]*)\}$/i);
  if (wrapperMatch) {
    text = wrapperMatch[1].trim();
  }

  let title = '';
  let unit = '';
  let mode = 'category'; // 'category' | 'change'
  const groups = [];
  const rawItems = [];

  // 2. LaTeX TikZ 構文の検出 (\begin{tikzpicture} 内の \draw rectangle)
  if (text.includes('\\draw') && text.includes('rectangle')) {
    const drawRegex = /\\draw(?:\[([^\]]*)\])?\s*\(([^)]+)\)\s*rectangle\s*\(([^)]+)\)(?:\s*node[^{]*\{([^}]+)\})?/gi;
    let dMatch;
    while ((dMatch = drawRegex.exec(text)) !== null) {
      const opts = dMatch[1] || '';
      const p1 = dMatch[2].split(',').map((v) => parseFloat(v.trim()));
      const p2 = dMatch[3].split(',').map((v) => parseFloat(v.trim()));
      const nodeText = (dMatch[4] || '').trim().replace(/\\\\/g, ' ');

      const w = Math.abs((p2[0] || 0) - (p1[0] || 0));
      const h = Math.abs((p2[1] || 0) - (p1[1] || 0));
      const calcArea = w * h;

      let color = '';
      const colMatch = opts.match(/fill\s*=\s*([a-zA-Z0-9_!#-]+)/i);
      if (colMatch) {
        color = colMatch[1].replace(/![0-9]+/g, '');
      }

      let label = nodeText;
      let val = calcArea > 0 ? calcArea * 10 : 10;
      const valMatch = nodeText.match(/(\d+(?:\.\d+)?)/);
      if (valMatch) {
        val = parseFloat(valMatch[1]);
        label = nodeText.replace(/\d+(?:\.\d+)?%?/g, '').trim().replace(/[()[\]]/g, '');
      }

      rawItems.push({ label: label || `項目 ${rawItems.length + 1}`, value: val, change: '', color });
    }
    if (rawItems.length > 0) {
      return { title, unit, mode, items: rawItems, groups: [] };
    }
  }

  // 3. group: "グループ名" [#カラー] { ... } ブロック構文の検出（階層型ツリーマップ / 画像3）
  const groupBlockRegex = /group\s*:\s*["']?([^"'{}\]]+)["']?(?:\s*\[([^\]]+)\])?\s*\{([\s\S]*?)\}/gi;
  let gMatch;
  let hasGroups = false;
  while ((gMatch = groupBlockRegex.exec(text)) !== null) {
    hasGroups = true;
    const gName = gMatch[1].trim();
    const gColor = (gMatch[2] || '').trim();
    const innerText = gMatch[3].trim();

    const gItems = [];
    const innerLines = innerText.split(/[\n;]+/).map((l) => l.trim()).filter(Boolean);
    innerLines.forEach((line) => {
      // 形式A: "ラベル", 値 [, "補足"]
      const m1 = line.match(/^["']([^"']+)["']\s*,\s*([\d.]+)(?:\s*,\s*["']([^"']*)["'])?/);
      if (m1) {
        gItems.push({
          label: m1[1].trim(),
          value: parseFloat(m1[2]),
          change: m1[3] ? m1[3].trim() : '',
          color: gColor
        });
        return;
      }
      // 形式B: ラベル (値)
      const m2 = line.match(/^(.+?)\s*\(([\d.]+)\)/);
      if (m2) {
        gItems.push({
          label: m2[1].trim().replace(/^["']|["']$/g, ''),
          value: parseFloat(m2[2]),
          change: '',
          color: gColor
        });
        return;
      }
      // 形式C: ラベル, 値
      const parts = line.split(',').map((p) => p.trim());
      if (parts.length >= 2) {
        const val = parseFloat(parts[1]);
        if (!isNaN(val) && val > 0) {
          gItems.push({
            label: parts[0].replace(/^["']|["']$/g, ''),
            value: val,
            change: parts[2] ? parts[2].replace(/^["']|["']$/g, '') : '',
            color: gColor
          });
        }
      }
    });

    if (gItems.length > 0) {
      const gTotal = gItems.reduce((sum, it) => sum + it.value, 0);
      groups.push({
        name: gName,
        color: gColor,
        items: gItems,
        value: gTotal
      });
    }
  }

  // 4. title, unit, mode 等のヘッダー解析
  const lines = text.split(/[\n;]+/).map((l) => l.trim()).filter(Boolean);
  lines.forEach((line) => {
    if (line.startsWith('%') || line.startsWith('//')) return;
    const titleMatch = line.match(/^title:\s*(.+)$/i);
    if (titleMatch) {
      title = titleMatch[1].trim().replace(/^["']|["']$/g, '');
      return;
    }
    const unitMatch = line.match(/^unit:\s*(.+)$/i);
    if (unitMatch) {
      unit = unitMatch[1].trim().replace(/^["']|["']$/g, '');
      return;
    }
    const modeMatch = line.match(/^mode:\s*(.+)$/i);
    if (modeMatch) {
      mode = modeMatch[1].trim().toLowerCase().replace(/^["']|["']$/g, '');
      return;
    }

    if (!hasGroups) {
      const itemPrefixMatch = line.match(/^(?:item|box|node):\s*(.+)$/i);
      const content = itemPrefixMatch ? itemPrefixMatch[1].trim() : line;

      // 形式A: "ラベル", 値 [, "補足"] [, "色"]
      const csvMatch = content.match(/^["']([^"']+)["']\s*,\s*([\d.]+)(?:\s*,\s*["']([^"']*)["'])?(?:\s*,\s*["']([^"']*)["'])?$/);
      if (csvMatch) {
        rawItems.push({
          label: csvMatch[1].trim(),
          value: parseFloat(csvMatch[2]),
          change: csvMatch[3] ? csvMatch[3].trim() : '',
          color: csvMatch[4] ? csvMatch[4].trim() : ''
        });
        return;
      }

      // 形式B: ラベル (値) [補足] {色}
      const parenMatch = content.match(/^(.+?)\s*\(([\d.]+)\)(?:\s*\[([^\]]+)\])?(?:\s*\{([^}]+)\})?$/);
      if (parenMatch) {
        rawItems.push({
          label: parenMatch[1].trim().replace(/^["']|["']$/g, ''),
          value: parseFloat(parenMatch[2]),
          change: parenMatch[3] ? parenMatch[3].trim() : '',
          color: parenMatch[4] ? parenMatch[4].trim() : ''
        });
        return;
      }

      // 形式C: ラベル, 値 [, 補足] [, 色]
      const parts = content.split(',').map((p) => p.trim());
      if (parts.length >= 2) {
        const val = parseFloat(parts[1]);
        if (!isNaN(val) && val > 0) {
          rawItems.push({
            label: parts[0].replace(/^["']|["']$/g, ''),
            value: val,
            change: parts[2] ? parts[2].replace(/^["']|["']$/g, '') : '',
            color: parts[3] ? parts[3].replace(/^["']|["']$/g, '') : ''
          });
        }
      }
    }
  });

  if (!hasGroups && rawItems.length === 0) return null;

  return { title, unit, mode, items: rawItems, groups };
}

// Squarified Treemap レイアウト計算
function computeSquarifiedTreemap(items, x, y, width, height) {
  const totalValue = items.reduce((sum, it) => sum + it.value, 0);
  if (totalValue <= 0) return [];

  const totalArea = width * height;
  const nodes = items.map((it) => ({
    ...it,
    area: (it.value / totalValue) * totalArea,
    pct: (it.value / totalValue) * 100
  })).sort((a, b) => b.value - a.value);

  const rects = [];

  function worst(row, w) {
    if (row.length === 0) return Infinity;
    const s = row.reduce((sum, n) => sum + n.area, 0);
    const w2 = w * w;
    const s2 = s * s;
    let maxAspect = 0;
    for (const n of row) {
      const a = n.area;
      const aspect = Math.max((w2 * a) / s2, s2 / (w2 * a));
      if (aspect > maxAspect) maxAspect = aspect;
    }
    return maxAspect;
  }

  function layoutRow(row, rx, ry, rw, rh, isHorizontal) {
    const s = row.reduce((sum, n) => sum + n.area, 0);
    if (isHorizontal) {
      const bandW = s / rh;
      let curY = ry;
      for (const n of row) {
        const itemH = n.area / bandW;
        rects.push({
          ...n,
          x: rx,
          y: curY,
          w: bandW,
          h: itemH
        });
        curY += itemH;
      }
      return { newX: rx + bandW, newY: ry, newW: rw - bandW, newH: rh };
    } else {
      const bandH = s / rw;
      let curX = rx;
      for (const n of row) {
        const itemW = n.area / bandH;
        rects.push({
          ...n,
          x: curX,
          y: ry,
          w: itemW,
          h: bandH
        });
        curX += itemW;
      }
      return { newX: rx, newY: ry + bandH, newW: rw, newH: rh - bandH };
    }
  }

  function squarify(children, row, rx, ry, rw, rh) {
    if (children.length === 0) {
      if (row.length > 0) {
        const isHoriz = rw >= rh;
        const shorter = isHoriz ? rh : rw;
        layoutRow(row, rx, ry, rw, rh, isHoriz);
      }
      return;
    }

    const isHoriz = rw >= rh;
    const shorter = isHoriz ? rh : rw;
    const nextChild = children[0];
    const newRow = [...row, nextChild];

    if (row.length === 0 || worst(newRow, shorter) <= worst(row, shorter)) {
      squarify(children.slice(1), newRow, rx, ry, rw, rh);
    } else {
      const nextArea = layoutRow(row, rx, ry, rw, rh, isHoriz);
      squarify(children, [], nextArea.newX, nextArea.newY, nextArea.newW, nextArea.newH);
    }
  }

  squarify(nodes, [], x, y, width, height);
  return rects;
}

// デフォルトカラーパレット
const TREEMAP_PALETTE = [
  '#2563eb', // ロイヤルブルー
  '#0d9488', // ティール
  '#7c3aed', // パープル
  '#d97706', // アンバー
  '#059669', // エメラルド
  '#db2777', // ピンク
  '#475569', // スレート
  '#4f46e5', // インディゴ
  '#0891b2', // シアン
  '#ea580c'  // オレンジ
];

function drawTreemapSvg(code, container, labelText) {
  container.innerHTML = '';
  const data = parseTreemap(code);
  if (!data) {
    const err = document.createElement('div');
    err.className = 'chem-render-error';
    err.textContent = 'ツリーマップの構文エラー: 有効な項目名と数値が必要です。';
    container.appendChild(err);
    return;
  }

  const { title, unit, mode, items, groups } = data;
  const isHierarchical = groups && groups.length > 0;

  const width = 800;
  const titleH = title ? 46 : 14;
  const margin = 10;
  const plotX = margin;
  const plotY = titleH;
  const plotW = width - margin * 2;
  const plotH = 450;
  const totalH = plotY + plotH + margin;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${totalH}`);
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.style.maxWidth = `${width}px`;
  svg.style.display = 'block';
  svg.style.margin = '0 auto';

  // 背景
  const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  bg.setAttribute('width', width);
  bg.setAttribute('height', totalH);
  bg.setAttribute('fill', '#f8fafc');
  bg.setAttribute('rx', '8');
  svg.appendChild(bg);

  // タイトル
  if (title) {
    const titleG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const tEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    tEl.setAttribute('x', width / 2);
    tEl.setAttribute('y', 28);
    tEl.setAttribute('text-anchor', 'middle');
    tEl.setAttribute('font-size', '16.5');
    tEl.setAttribute('font-weight', '700');
    tEl.setAttribute('fill', '#1e293b');
    tEl.setAttribute('font-family', 'sans-serif');
    tEl.textContent = title + (unit ? `（単位: ${unit}）` : '');
    titleG.appendChild(tEl);
    svg.appendChild(titleG);
  }

  const tileG = document.createElementNS('http://www.w3.org/2000/svg', 'g');

  if (isHierarchical) {
    // ==========================================
    // 階層グループ型ツリーマップ描画（画像3スタイル）
    // ==========================================
    const groupRects = computeSquarifiedTreemap(groups, plotX, plotY, plotW, plotH);

    groupRects.forEach((gRect) => {
      // 大グループ内の子要素レイアウト
      const childRects = computeSquarifiedTreemap(gRect.items, gRect.x, gRect.y, gRect.w, gRect.h);

      childRects.forEach((r, cIdx) => {
        const tileGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        tileGroup.setAttribute('class', 'treemap-tile');

        const rw = r.w;
        const rh = r.h;
        const rx = r.x;
        const ry = r.y;

        // タイル矩形
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', rx);
        rect.setAttribute('y', ry);
        rect.setAttribute('width', rw);
        rect.setAttribute('height', rh);
        rect.setAttribute('fill', r.color || gRect.color || '#2563eb');
        rect.setAttribute('stroke', '#ffffff');
        rect.setAttribute('stroke-width', '1.5');
        tileGroup.appendChild(rect);

        // ツールチップ
        const titleEl = document.createElementNS('http://www.w3.org/2000/svg', 'title');
        titleEl.textContent = `${gRect.name} - ${r.label}: ${r.value.toLocaleString()} ${unit || ''}`;
        tileGroup.appendChild(titleEl);

        // ラベル描画（画像3スタイル: 左上に都道府県名）
        if (rw >= 28 && rh >= 18) {
          const textG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          textG.setAttribute('fill', '#ffffff');
          textG.setAttribute('font-family', 'sans-serif');
          textG.style.pointerEvents = 'none';

          const fontSize = Math.min(Math.max(Math.floor(Math.min(rw / 4.5, rh / 2.2)), 10.5), 13.5);

          const labelTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          labelTxt.setAttribute('x', rx + 6);
          labelTxt.setAttribute('y', ry + fontSize + 4);
          labelTxt.setAttribute('font-size', String(fontSize));
          labelTxt.setAttribute('font-weight', '700');
          labelTxt.textContent = r.label;
          textG.appendChild(labelTxt);

          tileGroup.appendChild(textG);
        }

        tileG.appendChild(tileGroup);
      });

      // グループ領域の左上ヘッダーラベル（「東北」「中部」「九州沖縄」など）
      if (gRect.w >= 40 && gRect.h >= 24) {
        const gHeader = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        gHeader.setAttribute('x', gRect.x + 6);
        gHeader.setAttribute('y', gRect.y + 16);
        gHeader.setAttribute('fill', '#ffffff');
        gHeader.setAttribute('font-size', '13.5');
        gHeader.setAttribute('font-weight', '900');
        gHeader.setAttribute('font-family', 'sans-serif');
        gHeader.setAttribute('stroke', 'rgba(0,0,0,0.3)');
        gHeader.setAttribute('stroke-width', '1.5');
        gHeader.setAttribute('paint-order', 'stroke fill');
        gHeader.style.pointerEvents = 'none';
        gHeader.textContent = gRect.name;
        tileG.appendChild(gHeader);
      }
    });
  } else {
    // ==========================================
    // フラットツリーマップ描画（従来スタイル）
    // ==========================================
    const rects = computeSquarifiedTreemap(items, plotX, plotY, plotW, plotH);

    rects.forEach((r, idx) => {
      const tileGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      tileGroup.setAttribute('class', 'treemap-tile');

      let fillColor = r.color;
      if (!fillColor) {
        if (mode === 'change' || (r.change && (r.change.startsWith('+') || r.change.startsWith('-')))) {
          if (r.change.startsWith('+')) {
            fillColor = '#10b981'; // 増加（緑）
          } else if (r.change.startsWith('-')) {
            fillColor = '#f43f5e'; // 減少（赤）
          } else {
            fillColor = '#64748b';
          }
        } else {
          fillColor = TREEMAP_PALETTE[idx % TREEMAP_PALETTE.length];
        }
      }

      const pad = 1.5;
      const rw = Math.max(r.w - pad * 2, 2);
      const rh = Math.max(r.h - pad * 2, 2);
      const rx = r.x + pad;
      const ry = r.y + pad;

      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', rx);
      rect.setAttribute('y', ry);
      rect.setAttribute('width', rw);
      rect.setAttribute('height', rh);
      rect.setAttribute('fill', fillColor);
      rect.setAttribute('rx', '4');
      rect.setAttribute('stroke', '#ffffff');
      rect.setAttribute('stroke-width', '1.5');
      tileGroup.appendChild(rect);

      const titleEl = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      const valText = unit ? `${r.value.toLocaleString()} ${unit}` : r.value.toLocaleString();
      const chgText = r.change ? ` (${r.change})` : '';
      titleEl.textContent = `${r.label}: ${valText} [${r.pct.toFixed(1)}%]${chgText}`;
      tileGroup.appendChild(titleEl);

      if (rw >= 44 && rh >= 28) {
        const textG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        textG.setAttribute('fill', '#ffffff');
        textG.setAttribute('font-family', 'sans-serif');
        textG.style.pointerEvents = 'none';

        const cx = rx + rw / 2;
        let fontSize = Math.min(Math.max(Math.floor(Math.min(rw / 7, rh / 4)), 11), 15);
        const charW = fontSize * 0.95;
        const maxCharsPerLine = Math.max(Math.floor((rw - 6) / charW), 2);

        let labelLines = [r.label];
        const canWrap = rh >= 55 && r.label.length > maxCharsPerLine;
        if (canWrap) {
          const sepMatch = r.label.search(/[・/ \t(（\-]/);
          if (sepMatch > 0 && sepMatch < r.label.length - 1) {
            const splitIdx = sepMatch + 1;
            labelLines = [r.label.slice(0, splitIdx).trim(), r.label.slice(splitIdx).trim()];
          } else {
            const mid = Math.ceil(r.label.length / 2);
            labelLines = [r.label.slice(0, mid), r.label.slice(mid)];
          }
        }

        labelLines = labelLines.map((line) => {
          const limit = Math.max(Math.floor((rw - 6) / charW), 2);
          return line.length > limit ? line.slice(0, limit - 1) + '…' : line;
        });

        const showValue = rh >= (labelLines.length * 16 + 28) && rw >= 48;
        const showChange = r.change && rh >= (labelLines.length * 16 + (showValue ? 30 : 16) + 16) && rw >= 56;

        const labelLineH = fontSize + 3;
        const valueLineH = fontSize + 2;
        const changeLineH = fontSize + 2;

        let totalContentH = (labelLines.length - 1) * labelLineH;
        if (showValue) totalContentH += valueLineH + 4;
        if (showChange) totalContentH += changeLineH + 4;

        let curY = ry + (rh - totalContentH) / 2 + fontSize * 0.35;

        const labelTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        labelTxt.setAttribute('x', cx);
        labelTxt.setAttribute('y', curY);
        labelTxt.setAttribute('text-anchor', 'middle');
        labelTxt.setAttribute('font-weight', '700');
        labelTxt.setAttribute('font-size', String(fontSize));

        if (labelLines.length === 1) {
          labelTxt.textContent = labelLines[0];
        } else {
          labelLines.forEach((line, lIdx) => {
            const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
            tspan.setAttribute('x', cx);
            tspan.setAttribute('dy', lIdx === 0 ? '0' : String(labelLineH));
            tspan.textContent = line;
            labelTxt.appendChild(tspan);
          });
          curY += (labelLines.length - 1) * labelLineH;
        }
        textG.appendChild(labelTxt);

        if (showValue) {
          curY += valueLineH + 4;
          const valTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          valTxt.setAttribute('x', cx);
          valTxt.setAttribute('y', curY);
          valTxt.setAttribute('text-anchor', 'middle');
          valTxt.setAttribute('font-size', String(Math.max(fontSize - 2, 10.5)));
          valTxt.setAttribute('font-weight', '500');
          valTxt.setAttribute('opacity', '0.95');

          const compactVal = r.value >= 10000 ? `${(r.value / 10000).toFixed(1)}万` : String(r.value);
          valTxt.textContent = `${compactVal}${unit ? unit : ''} (${r.pct.toFixed(1)}%)`;
          textG.appendChild(valTxt);
        }

        if (showChange) {
          curY += changeLineH + 4;
          const chgG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          const chgTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          chgTxt.setAttribute('x', cx);
          chgTxt.setAttribute('y', curY);
          chgTxt.setAttribute('text-anchor', 'middle');
          chgTxt.setAttribute('font-size', String(Math.max(fontSize - 2, 10.5)));
          chgTxt.setAttribute('font-weight', '700');
          chgTxt.textContent = r.change;
          chgG.appendChild(chgTxt);
          textG.appendChild(chgG);
        }

        tileGroup.appendChild(textG);
      }

      tileG.appendChild(tileGroup);
    });
  }

  svg.appendChild(tileG);
  container.appendChild(svg);

  if (labelText) {
    const lbl = document.createElement('div');
    lbl.className = 'chem-structure-label';
    lbl.textContent = labelText;
    container.appendChild(lbl);
  }
}
