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

  // テキスト幅の簡易推定ヘルパー（共通ユーティリティ利用）
  const estimateTextWidth = (str, sz) => estimateSvgTextWidth(str, sz, false);

  // 単位連動フォーマッター（10,000倍時の単位繰り上げ: 億円 -> 兆円、百万円 -> 億円等）
  const formatTreemapValueWithUnit = (val, u) => {
    if (val === null || val === undefined || isNaN(val)) return '';
    const num = Number(val);
    const unitStr = (u || '').trim();

    // 1. 単位が「億円」「億」の場合: 10,000億円以上は「兆円」「兆」
    if (/^億(?:円)?$/.test(unitStr)) {
      if (num >= 10000) {
        const trVal = (num / 10000).toFixed(1);
        return `${trVal}${unitStr === '億' ? '兆' : '兆円'}`;
      }
      return `${num.toLocaleString()}${unitStr}`;
    }

    // 2. 単位が「百万円」の場合: 10,000百万円以上は「億円」 (100百万円 = 1億円)
    if (/^百万円?$/.test(unitStr)) {
      if (num >= 10000) {
        const okuVal = (num / 100).toFixed(1);
        return `${okuVal}億円`;
      }
      return `${num.toLocaleString()}${unitStr}`;
    }

    // 3. 単位が「万円」「万」の場合: 10,000万円以上は「億円」「億」
    if (/^万(?:円)?$/.test(unitStr)) {
      if (num >= 10000) {
        const okuVal = (num / 10000).toFixed(1);
        return `${okuVal}${unitStr === '万' ? '億' : '億円'}`;
      }
      return `${num.toLocaleString()}${unitStr}`;
    }

    // 4. 単位が「円」の場合: 10,000円以上は「万円」、100,000,000円以上は「億円」
    if (unitStr === '円') {
      if (num >= 100000000) {
        const okuVal = (num / 100000000).toFixed(1);
        return `${okuVal}億円`;
      }
      if (num >= 10000) {
        const manVal = (num / 10000).toFixed(1);
        return `${manVal}万円`;
      }
      return `${num.toLocaleString()}円`;
    }

    // 5. その他の単位または単位なしの場合: 10,000以上なら「万」を付与
    if (num >= 10000) {
      const manVal = (num / 10000).toFixed(1);
      return `${manVal}万${unitStr}`;
    }

    return `${num.toLocaleString()}${unitStr}`;
  };

  const width = 800;
  const fullTitle = title ? (title + (unit ? `（単位: ${unit}）` : '')) : '';
  const { lines: titleLines, fontSize: titleFontSize } = layoutSvgTitleLines(fullTitle, width - 48, 16.5, 13.0);
  const titleH = titleLines.length > 1 ? 62 : (titleLines.length === 1 ? 46 : 14);
  const margin = 10;
  const plotX = margin;
  const plotY = titleH;
  const plotW = width - margin * 2;
  const plotH = 450;
  let totalH = plotY + plotH + margin;

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
  if (titleLines.length > 0) {
    const titleG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    titleLines.forEach((ln, idx) => {
      const tEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      tEl.setAttribute('x', width / 2);
      tEl.setAttribute('y', titleLines.length > 1 ? (24 + idx * 20) : 28);
      tEl.setAttribute('text-anchor', 'middle');
      tEl.setAttribute('font-size', String(titleFontSize));
      tEl.setAttribute('font-weight', '700');
      tEl.setAttribute('fill', '#1e293b');
      tEl.setAttribute('font-family', 'sans-serif');
      tEl.textContent = ln;
      titleG.appendChild(tEl);
    });
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

        // ラベル描画（グループヘッダーとの重複回避）
        const isTopLeft = Math.abs(rx - gRect.x) < 2 && Math.abs(ry - gRect.y) < 2;
        const isSameName = r.label === gRect.name;

        // 同一名称の単一子要素（例: 北海道）の場合はグループヘッダー側で1回のみ描画
        if (isTopLeft && isSameName) {
          // 子要素側の重複描画をスキップ
        } else if (rw >= 28 && rh >= 18) {
          const textG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          textG.setAttribute('fill', '#ffffff');
          textG.setAttribute('font-family', 'sans-serif');
          textG.style.pointerEvents = 'none';

          const fontSize = Math.min(Math.max(Math.floor(Math.min(rw / 4.5, rh / 2.2)), 10.5), 13.5);

          // 先頭タイルの場合、上部のグループヘッダー（高さ約14px）と重ならないよう下にずらす
          const topOffset = (isTopLeft && gRect.w >= 36 && gRect.h >= 22) ? 16 : 0;
          const textY = ry + topOffset + fontSize + 2;

          // タイル内に収まる場合のみ描画
          if (textY <= ry + rh - 2) {
            const labelTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            labelTxt.setAttribute('x', rx + 6);
            labelTxt.setAttribute('y', textY);
            labelTxt.setAttribute('font-size', String(fontSize));
            labelTxt.setAttribute('font-weight', '700');
            labelTxt.textContent = r.label;
            textG.appendChild(labelTxt);

            tileGroup.appendChild(textG);
          }
        }

        tileG.appendChild(tileGroup);
      });

      // グループ領域の左上ヘッダーラベル（「東北」「中部」「九州沖縄」など）
      if (gRect.w >= 36 && gRect.h >= 22) {
        const isSingleSame = gRect.items.length === 1 && gRect.items[0].label === gRect.name;
        const gHeader = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        gHeader.setAttribute('x', gRect.x + 6);
        gHeader.setAttribute('y', gRect.y + (isSingleSame ? 18 : 13));
        gHeader.setAttribute('fill', '#ffffff');
        gHeader.setAttribute('font-size', isSingleSame ? '14' : '11');
        gHeader.setAttribute('font-weight', '900');
        gHeader.setAttribute('font-family', 'sans-serif');
        gHeader.setAttribute('stroke', 'rgba(0,0,0,0.4)');
        gHeader.setAttribute('stroke-width', '2');
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
    const hiddenItems = [];

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
        let fontSize = Math.min(Math.max(Math.floor(Math.min(rw / 6.5, rh / 4)), 9.5), 15);
        let charW = fontSize * 0.95;
        const maxCharsPerLine = Math.max(Math.floor((rw - 6) / charW), 2);

        // 1. ラベル行の分割（明示改行 \n 優先 ＆ 記号・中央分割）
        let labelLines = [];
        const cleanLabel = String(r.label || '').replace(/\\n/g, '\n');
        if (cleanLabel.includes('\n')) {
          labelLines = cleanLabel.split('\n').map((s) => s.trim()).filter(Boolean);
        } else {
          labelLines = [cleanLabel];
        }

        const canWrap = rh >= 50 && labelLines.length === 1 && (labelLines[0].length > maxCharsPerLine || estimateTextWidth(labelLines[0], fontSize) > rw - 8);
        if (canWrap) {
          const lStr = labelLines[0];
          const sepMatch = lStr.search(/[・/ \t(（\-]/);
          if (sepMatch > 0 && sepMatch < lStr.length - 1) {
            const sepChar = lStr[sepMatch];
            if (sepChar === '・' || sepChar === '/') {
              // 中黒やスラッシュ自体を除去して自然に分割
              labelLines = [lStr.slice(0, sepMatch).trim(), lStr.slice(sepMatch + 1).trim()];
            } else {
              labelLines = [lStr.slice(0, sepMatch + 1).trim(), lStr.slice(sepMatch + 1).trim()];
            }
          } else {
            const mid = Math.ceil(lStr.length / 2);
            labelLines = [lStr.slice(0, mid), lStr.slice(mid)];
          }
        }

        // 2. ラベル文字が枠幅に収まるようフォントサイズを動的オートフィット（縮小）
        const maxAvailLabelW = Math.max(rw - 8, 20);
        const maxLineW = Math.max(...labelLines.map((line) => estimateTextWidth(line, fontSize)));
        if (maxLineW > maxAvailLabelW) {
          const fitFontSize = Math.max(fontSize * (maxAvailLabelW / maxLineW), 9.0);
          fontSize = Math.min(fontSize, fitFontSize);
          charW = fontSize * 0.95;
        }

        // 3. それでも収まらない超極小タイルの場合のみ安全ガードとして省略
        labelLines = labelLines.map((line) => {
          if (estimateTextWidth(line, fontSize) <= maxAvailLabelW) return line;
          const limit = Math.max(Math.floor(maxAvailLabelW / charW), 2);
          return line.length > limit ? line.slice(0, limit - 1) + '…' : line;
        });

        // 数値行の自動分割・幅フィット判定
        let valFontSize = Math.min(Math.max(fontSize - 2, 8.5), 13);
        const valUnitStr = formatTreemapValueWithUnit(r.value, unit);
        const pctStr = `(${r.pct.toFixed(1)}%)`;
        const fullValStr = `${valUnitStr} ${pctStr}`;

        const maxAvailW = Math.max(rw - 6, 10);
        const fullValW = estimateTextWidth(fullValStr, valFontSize);

        let valLines = [];
        if (fullValW <= maxAvailW) {
          valLines = [fullValStr];
        } else {
          // 幅が不足する場合、数値と構成比を2行に分割
          const w1 = estimateTextWidth(valUnitStr, valFontSize);
          const w2 = estimateTextWidth(pctStr, valFontSize);
          if (Math.max(w1, w2) <= maxAvailW) {
            valLines = [valUnitStr, pctStr];
          } else {
            // さらにフォントサイズを縮小して収まるか判定
            const reducedSz = 8.0;
            if (Math.max(estimateTextWidth(valUnitStr, reducedSz), estimateTextWidth(pctStr, reducedSz)) <= maxAvailW) {
              valFontSize = reducedSz;
              valLines = [valUnitStr, pctStr];
            } else if (estimateTextWidth(pctStr, valFontSize) <= maxAvailW) {
              valLines = [pctStr]; // 比率のみ表示
            }
          }
        }

        // 高さフィット判定（枠が小さい場合も段階縮小・余白圧縮で成長率を極力省略しない）
        let labelFontSize = fontSize;
        let actualValFontSize = valFontSize;
        let changeFontSize = valFontSize;
        let labelLineH = labelFontSize + 3;
        let valLineH = actualValFontSize + 2;
        let changeLineH = changeFontSize + 2;
        let blockGap = 4;
        let actualValLines = [];
        let showValue = false;
        let showChange = false;

        const calcNeededH = (lFs, vFs, cFs, vLines, hasChg, tight) => {
          const lLH = lFs + (tight ? 1.5 : 3);
          const vLH = vFs + (tight ? 1 : 2);
          const cLH = cFs + (tight ? 1 : 2);
          const gap = tight ? 2 : 4;
          const padY = tight ? 4 : 6;
          return labelLines.length * lLH
            + (vLines.length > 0 ? vLines.length * vLH + gap : 0)
            + (hasChg ? cLH + gap : 0)
            + padY;
        };

        const canFitChangeW = Boolean(r.change && rw >= 36);
        const chgFitsAt = (fs) => canFitChangeW && estimateTextWidth(r.change, fs) <= maxAvailW;

        if (r.change && canFitChangeW) {
          // 1. 通常サイズでラベル＋数値＋成長率が収まるか
          if (chgFitsAt(valFontSize) && calcNeededH(labelFontSize, valFontSize, valFontSize, valLines, true, false) <= rh) {
            actualValLines = valLines;
            showValue = valLines.length > 0;
            showChange = true;
          } else {
            // 2. フォント縮小・行間圧縮で全項目（ラベル＋数値＋成長率）が収まるか
            let matched = false;
            const tightConfigs = [
              { lMin: 9.0, vFs: Math.min(valFontSize, 8.5), cFs: Math.min(valFontSize, 9.0), vCand: valLines },
              { lMin: 8.0, vFs: 7.5, cFs: 8.0, vCand: valLines },
              { lMin: 8.0, vFs: 7.5, cFs: 7.5, vCand: valLines.length > 1 ? [valUnitStr] : valLines },
              { lMin: 8.0, vFs: 7.5, cFs: 7.5, vCand: [] }
            ];
            for (const cfg of tightConfigs) {
              const tryL = Math.min(labelFontSize, Math.max(cfg.lMin, labelFontSize * 0.85));
              if (!chgFitsAt(cfg.cFs)) continue;
              if (calcNeededH(tryL, cfg.vFs, cfg.cFs, cfg.vCand, true, true) <= rh) {
                labelFontSize = tryL;
                actualValFontSize = cfg.vFs;
                changeFontSize = cfg.cFs;
                labelLineH = labelFontSize + 1.5;
                valLineH = actualValFontSize + 1;
                changeLineH = changeFontSize + 1;
                blockGap = 2;
                actualValLines = cfg.vCand;
                showValue = cfg.vCand.length > 0;
                showChange = true;
                matched = true;
                break;
              }
            }
            if (!matched) {
              // 成長率の最小フォントでも収まらない超極小枠のみ従来フォールバック
              const neededValH = valLines.length > 0 ? (valLines.length * valLineH + 4) : 0;
              showValue = valLines.length > 0 && rh >= (labelLines.length * labelLineH + neededValH + 6) && rw >= 36;
              actualValLines = showValue ? valLines : [];
            }
          }
        } else {
          const neededValH = valLines.length > 0 ? (valLines.length * valLineH + 4) : 0;
          showValue = valLines.length > 0 && rh >= (labelLines.length * labelLineH + neededValH + 6) && rw >= 36;
          actualValLines = showValue ? valLines : [];
        }

        let totalContentH = (labelLines.length - 1) * labelLineH;
        if (showValue) totalContentH += actualValLines.length * valLineH + blockGap;
        if (showChange) totalContentH += changeLineH + blockGap;

        let curY = ry + (rh - totalContentH) / 2 + labelFontSize * 0.35;

        const labelTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        labelTxt.setAttribute('x', cx);
        labelTxt.setAttribute('y', curY);
        labelTxt.setAttribute('text-anchor', 'middle');
        labelTxt.setAttribute('font-weight', '700');
        labelTxt.setAttribute('font-size', String(labelFontSize));

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

        if (showValue && actualValLines.length > 0) {
          curY += valLineH + blockGap;
          const valTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          valTxt.setAttribute('x', cx);
          valTxt.setAttribute('y', curY);
          valTxt.setAttribute('text-anchor', 'middle');
          valTxt.setAttribute('font-size', String(actualValFontSize));
          valTxt.setAttribute('font-weight', '500');
          valTxt.setAttribute('opacity', '0.95');

          if (actualValLines.length === 1) {
            valTxt.textContent = actualValLines[0];
          } else {
            actualValLines.forEach((line, lIdx) => {
              const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
              tspan.setAttribute('x', cx);
              tspan.setAttribute('dy', lIdx === 0 ? '0' : String(valLineH));
              tspan.textContent = line;
              valTxt.appendChild(tspan);
            });
            curY += (actualValLines.length - 1) * valLineH;
          }
          textG.appendChild(valTxt);
        }

        if (showChange) {
          curY += changeLineH + blockGap;
          const chgG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          const chgTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          chgTxt.setAttribute('x', cx);
          chgTxt.setAttribute('y', curY);
          chgTxt.setAttribute('text-anchor', 'middle');
          chgTxt.setAttribute('font-size', String(changeFontSize));
          chgTxt.setAttribute('font-weight', '700');
          chgTxt.textContent = r.change;
          chgG.appendChild(chgTxt);
          textG.appendChild(chgG);
        }

        tileGroup.appendChild(textG);
      } else {
        // 枠内に収まらない極小タイルをコールアウト・凡例対象として収集
        hiddenItems.push({
          item: r,
          fillColor,
          rx,
          ry,
          rw,
          rh,
          cx: rx + rw / 2,
          bottomY: ry + rh,
          isBottomEdge: (ry + rh) >= (plotY + plotH - 8)
        });
      }

      tileG.appendChild(tileGroup);
    });

    // 極小タイル（枠外コールアウト・下部凡例）の描画
    if (hiddenItems.length > 0) {
      const calloutG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      const bottomEdgeItems = hiddenItems.filter((h) => h.isBottomEdge);
      const otherHiddenItems = hiddenItems.filter((h) => !h.isBottomEdge);

      const baseLineY = plotY + plotH + 18;
      const rowHeight = 24;
      const occupiedRangesByRow = [];

      const findAvailableRow = (x1, x2) => {
        for (let rIdx = 0; rIdx < occupiedRangesByRow.length; rIdx++) {
          const ranges = occupiedRangesByRow[rIdx];
          const conflict = ranges.some(([rx1, rx2]) => !(x2 < rx1 - 12 || x1 > rx2 + 12));
          if (!conflict) {
            ranges.push([x1, x2]);
            return rIdx;
          }
        }
        occupiedRangesByRow.push([[x1, x2]]);
        return occupiedRangesByRow.length - 1;
      };

      const appendHiddenItemTextSpans = (txtEl, item, valStr, pctStr) => {
        const spLabel = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
        spLabel.setAttribute('font-weight', '700');
        spLabel.setAttribute('fill', '#1e293b');
        spLabel.textContent = item.label;
        txtEl.appendChild(spLabel);

        const spVal = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
        spVal.setAttribute('font-weight', '500');
        spVal.setAttribute('fill', '#475569');
        spVal.textContent = `: ${valStr} ${pctStr}`;
        txtEl.appendChild(spVal);

        if (item.change) {
          const spChg = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
          spChg.setAttribute('font-weight', '700');
          const isNeg = item.change.startsWith('-');
          const isPos = item.change.startsWith('+');
          spChg.setAttribute('fill', isNeg ? '#e11d48' : (isPos ? '#059669' : '#475569'));
          spChg.textContent = ` ${item.change}`;
          txtEl.appendChild(spChg);
        }
      };

      const pendingChipAdjusts = [];

      // 1. プロット最下端に接している極小タイル: 引き出し線（リーダー線）付きコールアウト
      bottomEdgeItems.forEach((h) => {
        const valStr = formatTreemapValueWithUnit(h.item.value, unit);
        const pctStr = `(${h.item.pct.toFixed(1)}%)`;
        const chgStr = h.item.change ? ` ${h.item.change}` : '';
        const plainInfo = `${h.item.label}: ${valStr} ${pctStr}${chgStr}`;
        const estW = estimateTextWidth(plainInfo, 12);

        const isRightSide = h.cx > width / 2;
        const elbowLen = 16;
        let textX, anchor, boxX1, boxX2, elbowX;

        if (isRightSide) {
          elbowX = Math.min(h.cx - elbowLen, width - margin - 10);
          textX = elbowX - 6;
          anchor = 'end';
          boxX1 = textX - estW - 18;
          boxX2 = h.cx + 4;
        } else {
          elbowX = Math.max(h.cx + elbowLen, margin + 10);
          textX = elbowX + 20;
          anchor = 'start';
          boxX1 = h.cx - 4;
          boxX2 = textX + estW + 6;
        }

        const rIdx = findAvailableRow(boxX1, boxX2);
        const lineY = baseLineY + rIdx * rowHeight;

        const leader = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        leader.setAttribute('d', `M ${h.cx.toFixed(1)} ${h.bottomY.toFixed(1)} L ${h.cx.toFixed(1)} ${lineY.toFixed(1)} L ${elbowX.toFixed(1)} ${lineY.toFixed(1)}`);
        leader.setAttribute('fill', 'none');
        leader.setAttribute('stroke', h.fillColor);
        leader.setAttribute('stroke-width', '1.5');
        calloutG.appendChild(leader);

        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dot.setAttribute('cx', elbowX.toFixed(1));
        dot.setAttribute('cy', lineY.toFixed(1));
        dot.setAttribute('r', '2.5');
        dot.setAttribute('fill', h.fillColor);
        calloutG.appendChild(dot);

        const chip = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        chip.setAttribute('x', String(isRightSide ? textX - estW - 15 : elbowX + 6));
        chip.setAttribute('y', String(lineY - 5));
        chip.setAttribute('width', '10');
        chip.setAttribute('height', '10');
        chip.setAttribute('rx', '2');
        chip.setAttribute('fill', h.fillColor);
        calloutG.appendChild(chip);

        const txtEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        txtEl.setAttribute('x', String(textX));
        txtEl.setAttribute('y', String(lineY + 4));
        txtEl.setAttribute('text-anchor', anchor);
        txtEl.setAttribute('font-size', '12');
        txtEl.setAttribute('font-family', 'sans-serif');
        appendHiddenItemTextSpans(txtEl, h.item, valStr, pctStr);
        calloutG.appendChild(txtEl);

        if (isRightSide) {
          pendingChipAdjusts.push({ chip, txtEl, textX, estW });
        }
      });

      // 2. 下端以外の位置にある極小タイル: 下部凡例エリアに整列表示
      if (otherHiddenItems.length > 0) {
        let curRow = occupiedRangesByRow.length;
        let curX = plotX + 4;
        const maxRight = width - margin - 4;

        otherHiddenItems.forEach((h) => {
          const valStr = formatTreemapValueWithUnit(h.item.value, unit);
          const pctStr = `(${h.item.pct.toFixed(1)}%)`;
          const chgStr = h.item.change ? ` ${h.item.change}` : '';
          const plainInfo = `${h.item.label}: ${valStr} ${pctStr}${chgStr}`;
          const estW = estimateTextWidth(plainInfo, 11.5);
          const itemTotalW = 16 + estW + 18;

          if (curX + itemTotalW > maxRight && curX > plotX + 4) {
            curRow++;
            curX = plotX + 4;
          }

          const lineY = baseLineY + curRow * rowHeight;

          const chip = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          chip.setAttribute('x', String(curX));
          chip.setAttribute('y', String(lineY - 5));
          chip.setAttribute('width', '10');
          chip.setAttribute('height', '10');
          chip.setAttribute('rx', '2');
          chip.setAttribute('fill', h.fillColor);
          calloutG.appendChild(chip);

          const txtEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          txtEl.setAttribute('x', String(curX + 15));
          txtEl.setAttribute('y', String(lineY + 4));
          txtEl.setAttribute('font-size', '11.5');
          txtEl.setAttribute('font-family', 'sans-serif');
          appendHiddenItemTextSpans(txtEl, h.item, valStr, pctStr);
          calloutG.appendChild(txtEl);

          curX += itemTotalW;
        });

        occupiedRangesByRow.length = curRow + 1;
      }

      const totalRows = Math.max(1, occupiedRangesByRow.length);
      totalH = plotY + plotH + totalRows * rowHeight + margin + 4;
      svg.setAttribute('viewBox', `0 0 ${width} ${totalH}`);
      bg.setAttribute('height', String(totalH));

      tileG.appendChild(calloutG);
      svg._pendingChipAdjusts = pendingChipAdjusts;
    }
  }

  svg.appendChild(tileG);
  container.appendChild(svg);

  // DOMマウント後のテキスト幅実測による右寄せコールアウトチップ位置の精密補正
  if (svg._pendingChipAdjusts && svg._pendingChipAdjusts.length > 0) {
    svg._pendingChipAdjusts.forEach(({ chip, txtEl, textX, estW }) => {
      const actualW = (typeof txtEl.getComputedTextLength === 'function' ? txtEl.getComputedTextLength() : 0) || estW;
      chip.setAttribute('x', String(textX - actualW - 15));
    });
  }

  appendDiagramLabel(container, labelText);
}
