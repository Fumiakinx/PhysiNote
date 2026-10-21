// ==========================================
// ガントチャート・ロードマップ（\gantt）パーサー ＆ SVG描画エンジン
// ==========================================

function parseTimePoint(rawStr) {
  if (!rawStr || typeof rawStr !== 'string') return null;
  const s = rawStr.trim();

  // 1. 四半期: 2024-Q1, 2024/Q2, 2025Q3, 2025-1Q 等
  const qMatch = s.match(/^(\d{4})[-/]?([1-4])?Q([1-4])?$/i) || s.match(/^(\d{4})[-/]?Q([1-4])$/i);
  if (qMatch) {
    const y = parseInt(qMatch[1], 10);
    const q = parseInt(qMatch[2] || qMatch[3] || '1', 10);
    return { type: 'quarter', year: y, quarter: q, val: y * 4 + (q - 1), raw: s };
  }

  // 2. 年月日: 2024-04-15, 2024/4/15
  const dateMatch = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (dateMatch) {
    const y = parseInt(dateMatch[1], 10);
    const m = parseInt(dateMatch[2], 10);
    const d = parseInt(dateMatch[3], 10);
    const timeMs = new Date(y, m - 1, d).getTime();
    return { type: 'date', year: y, month: m, day: d, val: timeMs, raw: s };
  }

  // 3. 年月: 2024-04, 2024/4
  const mMatch = s.match(/^(\d{4})[-/](\d{1,2})$/);
  if (mMatch) {
    const y = parseInt(mMatch[1], 10);
    const m = parseInt(mMatch[2], 10);
    return { type: 'month', year: y, month: m, val: y * 12 + (m - 1), raw: s };
  }

  // 4. 年単体: 2024, 2025
  const yMatch = s.match(/^(\d{4})$/);
  if (yMatch) {
    const y = parseInt(yMatch[1], 10);
    return { type: 'year', year: y, val: y, raw: s };
  }

  // 5. 単なる数値・期・ステップ: 1, 2, Q1, 1Q, FY24
  const numMatch = s.match(/^(\d+(\.\d+)?)$/);
  if (numMatch) {
    const val = parseFloat(numMatch[1]);
    return { type: 'number', val, raw: s };
  }

  return null;
}

/**
 * LaTeX pgfgantt パッケージ構文パーサー
 * @param {string} rawText 
 * @returns {object|null}
 */
function parsePgfGantt(rawText) {
  if (!/\\begin\{ganttchart\}/i.test(rawText)) return null;

  let title = 'ガントチャート (pgfgantt)';
  let todayStr = '';
  const items = [];

  // コメントからタイトル抽出
  const titleComment = rawText.match(/(?:%|#|\/\/)\s*title:\s*(.+)$/im);
  if (titleComment) {
    title = titleComment[1].trim().replace(/^["']|["']$/g, '');
  }

  // today オプション抽出
  const todayMatch = rawText.match(/today\s*=\s*([^,\]\s]+)/i);
  if (todayMatch) {
    todayStr = todayMatch[1].trim();
  }

  // 行ごとにパース
  const lines = rawText.split('\n');
  lines.forEach((line) => {
    const l = line.trim();
    if (!l || l.startsWith('%') || l.startsWith('//')) return;

    // \gantttitle{タイトル}{幅}
    const titleM = l.match(/\\gantttitle\{([^}]+)\}/i);
    if (titleM && title === 'ガントチャート (pgfgantt)') {
      title = titleM[1].trim().replace(/^["']|["']$/g, '');
    }

    // \ganttgroup{グループ名}{開始}{終了}
    const groupM = l.match(/\\ganttgroup(?:\[([^\]]*)\])?\s*\{([^}]+)\}\s*\{([^}]+)\}\s*\{([^}]+)\}/i);
    if (groupM) {
      items.push({
        type: 'section',
        title: groupM[2].trim().replace(/^["']|["']$/g, '')
      });
      return;
    }

    // \ganttbar{タスク名}{開始}{終了}
    const barM = l.match(/\\ganttbar(?:\[([^\]]*)\])?\s*\{([^}]+)\}\s*\{([^}]+)\}\s*\{([^}]+)\}/i);
    if (barM) {
      const name = barM[2].trim().replace(/^["']|["']$/g, '');
      const sPt = parseTimePoint(barM[3].trim());
      const ePt = parseTimePoint(barM[4].trim());
      if (sPt && ePt) {
        items.push({
          type: 'task',
          name,
          start: sPt,
          end: ePt,
          progress: null,
          color: '#0284c7'
        });
      }
      return;
    }

    // \ganttmilestone{マイルストーン名}{時期}
    const msM = l.match(/\\ganttmilestone(?:\[([^\]]*)\])?\s*\{([^}]+)\}\s*\{([^}]+)\}/i);
    if (msM) {
      const name = msM[2].trim().replace(/^["']|["']$/g, '');
      const tPt = parseTimePoint(msM[3].trim());
      if (tPt) {
        items.push({
          type: 'milestone',
          name,
          time: tPt,
          color: '#f59e0b'
        });
      }
      return;
    }
  });

  return {
    title,
    today: todayStr ? parseTimePoint(todayStr) : null,
    todayStr,
    items
  };
}

function parseGantt(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;

  // LaTeX pgfgantt 構文の自動ディスパッチ
  if (/\\begin\{ganttchart\}/i.test(rawText)) {
    const pgfData = parsePgfGantt(rawText);
    if (pgfData) return pgfData;
  }

  let text = rawText.trim();

  // \gantt{...} のアンラップ
  const wrapperMatch = text.match(/^\\gantt\{([\s\S]*)\}$/i);
  if (wrapperMatch) {
    text = wrapperMatch[1].trim();
  }

  let title = '';
  let todayStr = '';
  const items = []; // { type: 'section'|'task'|'milestone', ... }

  const lines = text.split(/[\n;]+/).map((l) => l.trim()).filter(Boolean);

  lines.forEach((line) => {
    // title:
    const titleMatch = line.match(/^title:\s*(.+)$/i);
    if (titleMatch) {
      title = titleMatch[1].trim().replace(/^["']|["']$/g, '');
      return;
    }

    // today: / now:
    const todayMatch = line.match(/^(?:today|now):\s*(.+)$/i);
    if (todayMatch) {
      todayStr = todayMatch[1].trim().replace(/^["']|["']$/g, '');
      return;
    }

    // section:
    const secMatch = line.match(/^section:\s*(.+)$/i);
    if (secMatch) {
      items.push({
        type: 'section',
        title: secMatch[1].trim().replace(/^["']|["']$/g, '')
      });
      return;
    }

    // milestone: "名前", 時期 [, "カラー"]
    const msMatch = line.match(/^milestone:\s*(.+)$/i);
    if (msMatch) {
      const parts = msMatch[1].split(',').map((p) => p.trim());
      if (parts.length >= 2) {
        const name = parts[0].replace(/^["']|["']$/g, '');
        const timePt = parseTimePoint(parts[1].replace(/^["']|["']$/g, ''));
        const color = parts[2] ? parts[2].replace(/^["']|["']$/g, '') : '#f59e0b';
        if (timePt) {
          items.push({
            type: 'milestone',
            name,
            time: timePt,
            color
          });
        }
      }
      return;
    }

    // task: "名前", 開始, 終了 [, [進捗]] [, 色]
    const taskPrefixMatch = line.match(/^(?:task|item|bar):\s*(.+)$/i);
    const content = taskPrefixMatch ? taskPrefixMatch[1].trim() : line;

    // カンマ区切り分解
    // 形式例: "第I相試験", 2024-Q1, 2024-Q3, [100% 完了], #10b981
    const commaParts = [];
    let cur = '';
    let inQuote = false;
    let inBracket = false;
    for (let i = 0; i < content.length; i++) {
      const ch = content[i];
      if (ch === '"' || ch === "'") inQuote = !inQuote;
      else if (ch === '[') inBracket = true;
      else if (ch === ']') inBracket = false;
      else if (ch === ',' && !inQuote && !inBracket) {
        commaParts.push(cur.trim());
        cur = '';
        continue;
      }
      cur += ch;
    }
    if (cur.trim()) commaParts.push(cur.trim());

    if (commaParts.length >= 3) {
      const name = commaParts[0].replace(/^["']|["']$/g, '');
      const startPt = parseTimePoint(commaParts[1].replace(/^["']|["']$/g, ''));
      const endPt = parseTimePoint(commaParts[2].replace(/^["']|["']$/g, ''));

      if (startPt && endPt) {
        let progressStr = '';
        let progressPct = null;
        let color = '';

        for (let j = 3; j < commaParts.length; j++) {
          const p = commaParts[j];
          if (p.startsWith('[') && p.endsWith(']')) {
            progressStr = p.slice(1, -1).trim();
            const pctMatch = progressStr.match(/(\d+)%/);
            if (pctMatch) {
              progressPct = parseInt(pctMatch[1], 10);
            }
          } else if (p.startsWith('#') || /^[a-z]+$/i.test(p)) {
            color = p;
          } else if (!progressStr) {
            progressStr = p.replace(/^["']|["']$/g, '');
            const pctMatch = progressStr.match(/(\d+)%/);
            if (pctMatch) {
              progressPct = parseInt(pctMatch[1], 10);
            }
          }
        }

        items.push({
          type: 'task',
          name,
          start: startPt,
          end: endPt,
          progressStr,
          progressPct,
          color: color || '#3b82f6'
        });
      }
    }
  });

  if (items.filter((it) => it.type === 'task' || it.type === 'milestone').length === 0) {
    return null;
  }

  const today = todayStr ? parseTimePoint(todayStr) : null;

  return { title, today, items };
}

// タイムラインの最小・最大・目盛りヘッダー生成
function buildTimelineTicks(items, today) {
  let timeType = null;
  const allTimePts = [];

  items.forEach((it) => {
    if (it.type === 'task') {
      allTimePts.push({ ...it.start, isStart: true });
      allTimePts.push({ ...it.end, isEnd: true });
      if (!timeType) timeType = it.start.type;
    } else if (it.type === 'milestone') {
      allTimePts.push({ ...it.time, isMilestone: true });
      if (!timeType) timeType = it.time.type;
    }
  });

  if (today) {
    allTimePts.push(today);
  }

  if (allTimePts.length === 0) return null;
  if (!timeType) timeType = allTimePts[0].type;

  let minVal = Math.min(...allTimePts.map((p) => p.val));
  let maxVal = Math.max(...allTimePts.map((p) => p.val));

  // 終了時点は 1 単位分含めて幅を持たせる
  const endInclusiveOffset = (timeType === 'quarter' || timeType === 'month' || timeType === 'year') ? 1 : 0;
  maxVal += endInclusiveOffset;

  const ticks = [];

  if (timeType === 'quarter') {
    for (let v = minVal; v < maxVal; v++) {
      const y = Math.floor(v / 4);
      const q = (v % 4) + 1;
      ticks.push({
        val: v,
        label: `${y} Q${q}`,
        shortLabel: `Q${q}`,
        year: y
      });
    }
  } else if (timeType === 'month') {
    for (let v = minVal; v < maxVal; v++) {
      const y = Math.floor(v / 12);
      const m = (v % 12) + 1;
      ticks.push({
        val: v,
        label: `${y}/${m}月`,
        shortLabel: `${m}月`,
        year: y
      });
    }
  } else if (timeType === 'year') {
    for (let v = minVal; v < maxVal; v++) {
      ticks.push({
        val: v,
        label: `${v}年`,
        shortLabel: `${v}`,
        year: v
      });
    }
  } else if (timeType === 'date') {
    const dayMs = 24 * 60 * 60 * 1000;
    const count = Math.min(Math.max(Math.ceil((maxVal - minVal) / (7 * dayMs)), 4), 10);
    const step = (maxVal - minVal) / count;
    for (let i = 0; i <= count; i++) {
      const d = new Date(minVal + step * i);
      const m = d.getMonth() + 1;
      const date = d.getDate();
      ticks.push({
        val: minVal + step * i,
        label: `${m}/${date}`,
        shortLabel: `${m}/${date}`
      });
    }
  } else {
    const count = Math.max(Math.ceil(maxVal - minVal), 4);
    for (let v = minVal; v <= maxVal; v++) {
      ticks.push({
        val: v,
        label: `${v}`,
        shortLabel: `${v}`
      });
    }
  }

  return { timeType, minVal, maxVal, ticks };
}

function drawGanttSvg(code, container, labelText) {
  container.innerHTML = '';
  const data = parseGantt(code);
  if (!data) {
    const err = document.createElement('div');
    err.className = 'chem-render-error';
    err.textContent = 'ガントチャートの構文エラー: 少なくとも1つの task または milestone が必要です。';
    container.appendChild(err);
    return;
  }

  const { title, today, items } = data;
  const timeline = buildTimelineTicks(items, today);
  if (!timeline) return;

  const { timeType, minVal, maxVal, ticks } = timeline;
  const valRange = maxVal - minVal || 1;

  // レイアウト寸法
  // タスク名・マイルストーン名の最大幅を動的計算（全角1文字=約12px、半角1文字=約6.8px）
  let maxLabelWidth = 0;
  items.forEach((it) => {
    if (it.type === 'task' || it.type === 'milestone') {
      const name = it.name || '';
      let w = it.type === 'milestone' ? 18 : 0;
      for (let i = 0; i < name.length; i++) {
        w += name.charCodeAt(i) > 255 ? 12 : 6.8;
      }
      if (w > maxLabelWidth) maxLabelWidth = w;
    }
  });

  // 左カラム幅を最大ラベル幅に合わせて動的拡張（最小210px、最大340px、パディング加算）
  const labelColW = Math.max(210, Math.min(340, Math.round(maxLabelWidth + 36)));
  const chartW = 540;
  const totalW = labelColW + chartW + 24;
  const headerH = 44;
  const rowH = 34;
  const secH = 28;

  let totalContentH = 0;
  items.forEach((it) => {
    totalContentH += it.type === 'section' ? secH : rowH;
  });

  const titleH = title ? 42 : 12;
  const totalH = titleH + headerH + totalContentH + 20;

  const timeToX = (val) => labelColW + ((val - minVal) / valRange) * chartW;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${totalW} ${totalH}`);
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.style.maxWidth = `${totalW}px`;
  svg.style.display = 'block';
  svg.style.margin = '0 auto';

  // 背景
  const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  bg.setAttribute('width', totalW);
  bg.setAttribute('height', totalH);
  bg.setAttribute('fill', '#ffffff');
  bg.setAttribute('rx', '8');
  svg.appendChild(bg);

  // タイトル
  if (title) {
    const tEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    tEl.setAttribute('x', totalW / 2);
    tEl.setAttribute('y', 26);
    tEl.setAttribute('text-anchor', 'middle');
    tEl.setAttribute('font-size', '16.5');
    tEl.setAttribute('font-weight', '700');
    tEl.setAttribute('fill', '#1e293b');
    tEl.setAttribute('font-family', 'sans-serif');
    tEl.textContent = title;
    svg.appendChild(tEl);
  }

  const startY = titleH;

  // タイムラインヘッダー背景
  const headerBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  headerBg.setAttribute('x', labelColW);
  headerBg.setAttribute('y', startY);
  headerBg.setAttribute('width', chartW);
  headerBg.setAttribute('height', headerH);
  headerBg.setAttribute('fill', '#f8fafc');
  headerBg.setAttribute('stroke', '#e2e8f0');
  headerBg.setAttribute('stroke-width', '1');
  svg.appendChild(headerBg);

  // ヘッダーラベル & 縦グリッド線
  const gridG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const tickCount = ticks.length;
  const tickW = chartW / tickCount;

  let lastYearShown = null;
  const isNarrowQuarter = (timeType === 'quarter' || timeType === 'month') && tickW < 58;

  ticks.forEach((tk, idx) => {
    const x = labelColW + idx * tickW;

    // 縦グリッド
    const vLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    vLine.setAttribute('x1', x);
    vLine.setAttribute('y1', startY);
    vLine.setAttribute('x2', x);
    vLine.setAttribute('y2', startY + headerH + totalContentH);
    vLine.setAttribute('stroke', '#f1f5f9');
    vLine.setAttribute('stroke-width', '1');
    gridG.appendChild(vLine);

    // ヘッダーテキスト
    if (isNarrowQuarter) {
      // 狭い場合は2段表示（上段: 年、下段: 四半期/月）
      const cx = x + tickW / 2;

      // 年の表示（年が切り替わる最初の目盛り、または先頭）
      if (tk.year && tk.year !== lastYearShown) {
        lastYearShown = tk.year;
        const yTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        yTxt.setAttribute('x', x + 4);
        yTxt.setAttribute('y', startY + 16);
        yTxt.setAttribute('text-anchor', 'start');
        yTxt.setAttribute('font-size', '10.5');
        yTxt.setAttribute('font-weight', '700');
        yTxt.setAttribute('fill', '#0284c7');
        yTxt.setAttribute('font-family', 'sans-serif');
        yTxt.textContent = `${tk.year}年`;
        gridG.appendChild(yTxt);
      }

      // 期/月表示
      const subTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      subTxt.setAttribute('x', cx);
      subTxt.setAttribute('y', startY + 34);
      subTxt.setAttribute('text-anchor', 'middle');
      subTxt.setAttribute('font-size', '11');
      subTxt.setAttribute('font-weight', '600');
      subTxt.setAttribute('fill', '#64748b');
      subTxt.setAttribute('font-family', 'sans-serif');
      subTxt.textContent = tk.shortLabel || tk.label;
      gridG.appendChild(subTxt);
    } else {
      // 十分な幅がある場合は1行中央表示
      const hTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      hTxt.setAttribute('x', x + tickW / 2);
      hTxt.setAttribute('y', startY + 26);
      hTxt.setAttribute('text-anchor', 'middle');
      hTxt.setAttribute('font-size', '12');
      hTxt.setAttribute('font-weight', '600');
      hTxt.setAttribute('fill', '#64748b');
      hTxt.setAttribute('font-family', 'sans-serif');
      hTxt.textContent = tk.label;
      gridG.appendChild(hTxt);
    }
  });

  // 右端のグリッド線
  const rLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  rLine.setAttribute('x1', labelColW + chartW);
  rLine.setAttribute('y1', startY);
  rLine.setAttribute('x2', labelColW + chartW);
  rLine.setAttribute('y2', startY + headerH + totalContentH);
  rLine.setAttribute('stroke', '#e2e8f0');
  rLine.setAttribute('stroke-width', '1');
  gridG.appendChild(rLine);

  svg.appendChild(gridG);

  // 左カラムヘッダー
  const leftHeaderBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  leftHeaderBg.setAttribute('x', 12);
  leftHeaderBg.setAttribute('y', startY);
  leftHeaderBg.setAttribute('width', labelColW - 12);
  leftHeaderBg.setAttribute('height', headerH);
  leftHeaderBg.setAttribute('fill', '#f1f5f9');
  leftHeaderBg.setAttribute('stroke', '#e2e8f0');
  leftHeaderBg.setAttribute('stroke-width', '1');
  svg.appendChild(leftHeaderBg);

  const leftHeaderTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  leftHeaderTxt.setAttribute('x', 24);
  leftHeaderTxt.setAttribute('y', startY + 26);
  leftHeaderTxt.setAttribute('font-size', '13.5');
  leftHeaderTxt.setAttribute('font-weight', '700');
  leftHeaderTxt.setAttribute('fill', '#475569');
  leftHeaderTxt.setAttribute('font-family', 'sans-serif');
  leftHeaderTxt.textContent = 'タスク / マイルストーン';
  svg.appendChild(leftHeaderTxt);

  // 各行の描画
  let curY = startY + headerH;
  const rowG = document.createElementNS('http://www.w3.org/2000/svg', 'g');

  items.forEach((it, idx) => {
    const isSec = it.type === 'section';
    const thisRowH = isSec ? secH : rowH;

    // 行背景
    const rowBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rowBg.setAttribute('x', 12);
    rowBg.setAttribute('y', curY);
    rowBg.setAttribute('width', totalW - 24);
    rowBg.setAttribute('height', thisRowH);
    rowBg.setAttribute('fill', isSec ? '#e2e8f0' : (idx % 2 === 0 ? '#ffffff' : '#f8fafc'));
    rowG.appendChild(rowBg);

    if (isSec) {
      // セクション見出し
      const secTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      secTxt.setAttribute('x', 20);
      secTxt.setAttribute('y', curY + 18);
      secTxt.setAttribute('font-size', '13');
      secTxt.setAttribute('font-weight', '700');
      secTxt.setAttribute('fill', '#1e293b');
      secTxt.setAttribute('font-family', 'sans-serif');
      secTxt.textContent = `📁 ${it.title}`;
      rowG.appendChild(secTxt);
    } else if (it.type === 'task') {
      // タスク名ラベル（左カラム）
      const labelTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      labelTxt.setAttribute('x', 24);
      labelTxt.setAttribute('y', curY + 21);
      labelTxt.setAttribute('font-size', '12.5');
      labelTxt.setAttribute('font-weight', '600');
      labelTxt.setAttribute('fill', '#334155');
      labelTxt.setAttribute('font-family', 'sans-serif');

      // 枠幅を超える極端な長文のみ安全に省略、通常は全文表示
      const maxAllowablePx = labelColW - 32;
      let dispName = it.name;
      let textPx = 0;
      for (let i = 0; i < dispName.length; i++) {
        textPx += dispName.charCodeAt(i) > 255 ? 12 : 6.8;
      }
      if (textPx > maxAllowablePx) {
        let curPx = 0;
        let cutIdx = 0;
        for (let i = 0; i < dispName.length; i++) {
          const charW = dispName.charCodeAt(i) > 255 ? 12 : 6.8;
          if (curPx + charW + 12 > maxAllowablePx) break;
          curPx += charW;
          cutIdx = i + 1;
        }
        dispName = dispName.slice(0, cutIdx) + '…';
      }
      labelTxt.textContent = dispName;
      rowG.appendChild(labelTxt);

      // タスクバー
      const offset = (timeType === 'quarter' || timeType === 'month' || timeType === 'year') ? 1 : 0;
      const x1 = timeToX(it.start.val);
      const x2 = timeToX(it.end.val + offset);
      const barW = Math.max(x2 - x1, 8);
      const barH = 20;
      const barY = curY + (thisRowH - barH) / 2;

      const barGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');

      // 背景バー（淡色）
      const baseBar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      baseBar.setAttribute('x', x1);
      baseBar.setAttribute('y', barY);
      baseBar.setAttribute('width', barW);
      baseBar.setAttribute('height', barH);
      baseBar.setAttribute('rx', '4');
      baseBar.setAttribute('fill', it.color);
      baseBar.setAttribute('opacity', it.progressPct !== null ? '0.35' : '0.9');
      barGroup.appendChild(baseBar);

      // 進捗バー（濃色）
      if (it.progressPct !== null && it.progressPct > 0) {
        const progW = barW * (Math.min(it.progressPct, 100) / 100);
        const progBar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        progBar.setAttribute('x', x1);
        progBar.setAttribute('y', barY);
        progBar.setAttribute('width', progW);
        progBar.setAttribute('height', barH);
        progBar.setAttribute('rx', '4');
        progBar.setAttribute('fill', it.color);
        barGroup.appendChild(progBar);
      }

      // 進捗テキスト / 状態
      if (it.progressStr) {
        const pTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        pTxt.setAttribute('font-size', '11');
        pTxt.setAttribute('font-weight', '600');
        pTxt.setAttribute('font-family', 'sans-serif');

        if (barW >= 70) {
          pTxt.setAttribute('x', x1 + 8);
          pTxt.setAttribute('y', barY + 14);
          pTxt.setAttribute('fill', '#ffffff');
          pTxt.textContent = it.progressStr;
        } else {
          pTxt.setAttribute('x', x1 + barW + 6);
          pTxt.setAttribute('y', barY + 14);
          pTxt.setAttribute('fill', '#475569');
          pTxt.textContent = it.progressStr;
        }
        barGroup.appendChild(pTxt);
      }

      // ツールチップ
      const tip = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      tip.textContent = `${it.name}: ${it.start.raw} 〜 ${it.end.raw}${it.progressStr ? ` (${it.progressStr})` : ''}`;
      barGroup.appendChild(tip);

      rowG.appendChild(barGroup);
    } else if (it.type === 'milestone') {
      // マイルストーン行
      const labelTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      labelTxt.setAttribute('x', 24);
      labelTxt.setAttribute('y', curY + 21);
      labelTxt.setAttribute('font-size', '12.5');
      labelTxt.setAttribute('font-weight', '700');
      labelTxt.setAttribute('fill', it.color || '#f59e0b');
      labelTxt.setAttribute('font-family', 'sans-serif');

      // 枠幅を超える極端な長文のみ安全に省略、通常は全文表示
      const maxAllowablePx = labelColW - 32;
      let dispName = it.name;
      let textPx = 18;
      for (let i = 0; i < dispName.length; i++) {
        textPx += dispName.charCodeAt(i) > 255 ? 12 : 6.8;
      }
      if (textPx > maxAllowablePx) {
        let curPx = 18;
        let cutIdx = 0;
        for (let i = 0; i < dispName.length; i++) {
          const charW = dispName.charCodeAt(i) > 255 ? 12 : 6.8;
          if (curPx + charW + 12 > maxAllowablePx) break;
          curPx += charW;
          cutIdx = i + 1;
        }
        dispName = dispName.slice(0, cutIdx) + '…';
      }
      labelTxt.textContent = `◇ ${dispName}`;
      rowG.appendChild(labelTxt);

      // ダイヤマーク（◇）
      const cx = timeToX(it.time.val);
      const cy = curY + thisRowH / 2;
      const size = 7;

      const diamond = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      diamond.setAttribute('points', `${cx},${cy - size} ${cx + size},${cy} ${cx},${cy + size} ${cx - size},${cy}`);
      diamond.setAttribute('fill', it.color || '#f59e0b');
      diamond.setAttribute('stroke', '#ffffff');
      diamond.setAttribute('stroke-width', '1.5');

      const msGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      msGroup.appendChild(diamond);

      const msTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      msTxt.setAttribute('x', cx + size + 5);
      msTxt.setAttribute('y', cy + 4);
      msTxt.setAttribute('font-size', '12');
      msTxt.setAttribute('font-weight', '700');
      msTxt.setAttribute('fill', it.color || '#f59e0b');
      msTxt.setAttribute('font-family', 'sans-serif');
      msTxt.textContent = it.name;
      msGroup.appendChild(msTxt);

      const tip = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      tip.textContent = `マイルストーン: ${it.name} (${it.time.raw})`;
      msGroup.appendChild(tip);

      rowG.appendChild(msGroup);
    }

    // 行境界線
    const hLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    hLine.setAttribute('x1', 12);
    hLine.setAttribute('y1', curY + thisRowH);
    hLine.setAttribute('x2', totalW - 12);
    hLine.setAttribute('y2', curY + thisRowH);
    hLine.setAttribute('stroke', '#e2e8f0');
    hLine.setAttribute('stroke-width', '1');
    rowG.appendChild(hLine);

    curY += thisRowH;
  });

  svg.appendChild(rowG);

  // Today（現在）の縦線破線とバッジ
  if (today) {
    const todayX = timeToX(today.val);
    if (todayX >= labelColW && todayX <= labelColW + chartW) {
      const todayG = document.createElementNS('http://www.w3.org/2000/svg', 'g');

      const tLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      tLine.setAttribute('x1', todayX);
      tLine.setAttribute('y1', startY);
      tLine.setAttribute('x2', todayX);
      tLine.setAttribute('y2', startY + headerH + totalContentH);
      tLine.setAttribute('stroke', '#ef4444');
      tLine.setAttribute('stroke-width', '2');
      tLine.setAttribute('stroke-dasharray', '4 3');
      todayG.appendChild(tLine);

      // バッジ
      const badgeW = 38;
      const badgeH = 16;
      const bRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bRect.setAttribute('x', todayX - badgeW / 2);
      bRect.setAttribute('y', startY - 8);
      bRect.setAttribute('width', badgeW);
      bRect.setAttribute('height', badgeH);
      bRect.setAttribute('rx', '4');
      bRect.setAttribute('fill', '#ef4444');
      todayG.appendChild(bRect);

      const bTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      bTxt.setAttribute('x', todayX);
      bTxt.setAttribute('y', startY + 4);
      bTxt.setAttribute('text-anchor', 'middle');
      bTxt.setAttribute('font-size', '10.5');
      bTxt.setAttribute('font-weight', '700');
      bTxt.setAttribute('fill', '#ffffff');
      bTxt.setAttribute('font-family', 'sans-serif');
      bTxt.textContent = 'NOW';
      todayG.appendChild(bTxt);

      svg.appendChild(todayG);
    }
  }

  container.appendChild(svg);

  if (labelText) {
    const lbl = document.createElement('div');
    lbl.className = 'chem-structure-label';
    lbl.textContent = labelText;
    container.appendChild(lbl);
  }
}
