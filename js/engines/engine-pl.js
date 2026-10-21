// ==========================================
// 決算書サンキーダイアグラム (P/L：損益計算書) パーサー & SVG描画エンジン
// ==========================================

function parseProfitAndLoss(text) {
  if (!text || typeof text !== 'string') return null;
  const lines = text
    .split(/[\n;]+/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('//') && !l.startsWith('#'));

  const links = [];
  const nodeNamesSet = new Set();
  const nodeMeta = {};
  let company = null;
  let code = null;
  let period = null;
  let unit = '百万円';
  let consolidated = true;
  let title = null;
  let subtitle = null;
  let note = null;

  const extractBracketProps = (bracketStr) => {
    if (!bracketStr) return { value: null, percent: null, color: null, side: null };
    const parts = bracketStr.split(',').map((p) => p.trim()).filter(Boolean);
    let value = null;
    let percent = null;
    let color = null;
    let side = null;

    parts.forEach((p) => {
      if (/^-?[\d,]+(?:\.\d+)?%$/.test(p)) {
        percent = p;
      } else if (/^-?[\d,]+(?:\.\d+)?$/.test(p)) {
        value = parseFloat(p.replace(/,/g, ''));
      } else if (/^(above|below|left|right)$/i.test(p)) {
        side = p.toLowerCase();
      } else if (/^#[0-9a-fA-F]{3,8}$/.test(p) || /^[a-zA-Z]+$/.test(p)) {
        color = p;
      }
    });
    return { value, percent, color, side };
  };

  lines.forEach((line) => {
    const mComp = line.match(/^(?:company|企業名)\s*:\s*(?:"([^"\n]+)"|'([^'\n]+)'|([^;"'\n]+))/i);
    if (mComp) { company = (mComp[1] || mComp[2] || mComp[3] || '').trim(); return; }

    const mCode = line.match(/^(?:code|証券番号|証券コード)\s*:\s*(?:"([^"\n]+)"|'([^'\n]+)'|([^;"'\n]+))/i);
    if (mCode) { code = (mCode[1] || mCode[2] || mCode[3] || '').trim(); return; }

    const mPeriod = line.match(/^(?:period|決算期)\s*:\s*(?:"([^"\n]+)"|'([^'\n]+)'|([^;"'\n]+))/i);
    if (mPeriod) { period = (mPeriod[1] || mPeriod[2] || mPeriod[3] || '').trim(); return; }

    const mUnit = line.match(/^(?:unit|単位)\s*:\s*(?:"([^"\n]+)"|'([^'\n]+)'|([^;"'\n]+))/i);
    if (mUnit) { unit = (mUnit[1] || mUnit[2] || mUnit[3] || '').trim(); return; }

    const mCons = line.match(/^(?:consolidated|連結)\s*:\s*(true|false|1|0|有|無|単体)?/i);
    if (mCons) {
      const val = (mCons[1] || '').toLowerCase();
      consolidated = !(val === 'false' || val === '0' || val === '無' || val === '単体');
      return;
    }

    const mTitle = line.match(/^title\s*:\s*(?:"([^"\n]+)"|'([^'\n]+)'|([^;"'\n]+))/i);
    if (mTitle) { title = (mTitle[1] || mTitle[2] || mTitle[3] || '').trim(); return; }

    const mSub = line.match(/^subtitle\s*:\s*(?:"([^"\n]+)"|'([^'\n]+)'|([^;"'\n]+))/i);
    if (mSub) { subtitle = (mSub[1] || mSub[2] || mSub[3] || '').trim(); return; }

    const mNote = line.match(/^note\s*:\s*(?:"([^"\n]+)"|'([^'\n]+)'|([^;"'\n]+))/i);
    if (mNote) { note = (mNote[1] || mNote[2] || mNote[3] || '').trim(); return; }

    const mNode = line.match(/^node\s*:\s*([^\[]+)(?:\[(.*?)\])?$/i);
    if (mNode) {
      const name = mNode[1].replace(/^["']|["']$/g, '').trim();
      if (name) {
        nodeNamesSet.add(name);
        const props = extractBracketProps(mNode[2]);
        nodeMeta[name] = Object.assign(nodeMeta[name] || {}, props);
      }
      return;
    }

    if (line.includes('->')) {
      const arrowIdx = line.indexOf('->');
      let leftPart = line.substring(0, arrowIdx).trim();
      let rightPart = line.substring(arrowIdx + 2).trim();

      let srcProps = { value: null, percent: null, color: null, side: null };
      const mLeftBracket = leftPart.match(/\[(.*?)\]$/);
      if (mLeftBracket) {
        srcProps = extractBracketProps(mLeftBracket[1]);
        leftPart = leftPart.substring(0, mLeftBracket.index).trim();
      }

      let tgtProps = { value: null, percent: null, color: null, side: null };
      const mRightBracket = rightPart.match(/\[(.*?)\]$/);
      if (mRightBracket) {
        tgtProps = extractBracketProps(mRightBracket[1]);
        rightPart = rightPart.substring(0, mRightBracket.index).trim();
      }

      const srcName = leftPart.replace(/^["']|["']$/g, '').trim();
      const tgtName = rightPart.replace(/^["']|["']$/g, '').trim();

      if (srcName && tgtName) {
        nodeNamesSet.add(srcName);
        nodeNamesSet.add(tgtName);

        if (srcProps.value !== null || srcProps.percent || srcProps.color || srcProps.side) {
          nodeMeta[srcName] = Object.assign(nodeMeta[srcName] || {}, srcProps);
        }
        if (tgtProps.value !== null || tgtProps.percent || tgtProps.color || tgtProps.side) {
          nodeMeta[tgtName] = Object.assign(nodeMeta[tgtName] || {}, tgtProps);
        }

        const linkVal = tgtProps.value !== null ? tgtProps.value : (srcProps.value !== null ? srcProps.value : null);
        const linkPct = tgtProps.percent || srcProps.percent || null;
        const linkColor = tgtProps.color || srcProps.color || null;

        links.push({
          source: srcName,
          target: tgtName,
          value: linkVal,
          percent: linkPct,
          color: linkColor,
        });
      }
    }
  });

  return {
    company,
    code,
    period,
    unit,
    consolidated,
    title,
    subtitle,
    note,
    nodeMeta,
    links,
  };
}

/**
 * 損益計算書 (P/L) サンキーダイアグラム SVG 描画関数
 */
function drawProfitAndLossSvg(rawText, container, labelText) {
  if (!container) return;
  container.innerHTML = '';

  let codeText = rawText.trim();
  const wrapperMatch = codeText.match(/^\\(?:pl|incomestatement)\{([\s\S]*)\}$/i);
  if (wrapperMatch) {
    codeText = wrapperMatch[1];
  }

  const parsed = parseProfitAndLoss(codeText);
  if (!parsed || parsed.links.length === 0) {
    const err = document.createElement('div');
    err.className = 'chem-render-error';
    err.textContent = 'P/Lサンキー図の構文エラー: "売上高" -> "売上総利益" などの接続リンクが必要です。';
    container.appendChild(err);
    return;
  }

  const { company, code, period, unit, consolidated, title, subtitle, note, nodeMeta, links } = parsed;

  // 1. ノード一覧と入出力集計
  const nodesSet = new Set();
  const inSum = {};
  const outSum = {};
  links.forEach((l) => {
    nodesSet.add(l.source);
    nodesSet.add(l.target);
    inSum[l.target] = (inSum[l.target] || 0) + (l.value || 0);
    outSum[l.source] = (outSum[l.source] || 0) + (l.value || 0);
  });
  const nodes = Array.from(nodesSet);

  // 2. 売上高ノード（基準100%ノード）の特定
  let revenueNode = nodes.find((n) => /^売上(?:高|収益)$/i.test(n) || /revenue|sales/i.test(n));
  if (!revenueNode) {
    // なければ最大出力を誇るノード
    let maxOut = -1;
    nodes.forEach((n) => {
      if ((outSum[n] || 0) > maxOut) {
        maxOut = outSum[n];
        revenueNode = n;
      }
    });
  }
  if (!revenueNode) revenueNode = nodes[0];

  const revenueVal = (nodeMeta[revenueNode] && nodeMeta[revenueNode].value) || outSum[revenueNode] || inSum[revenueNode] || 100;

  // 3. 各ノードの金額とパーセント決定
  const nodeVal = {};
  const nodePct = {};
  nodes.forEach((n) => {
    const meta = nodeMeta[n] || {};
    let v = meta.value;
    if (v === null || v === undefined) {
      v = (outSum[n] && outSum[n] > 0) ? outSum[n] : (inSum[n] || 0);
    }
    nodeVal[n] = v;

    if (meta.percent) {
      const m = meta.percent.match(/^(-?[\d,]+(?:\.\d+)?)/);
      nodePct[n] = m ? parseFloat(m[1].replace(/,/g, '')) : (v / revenueVal) * 100;
    } else {
      nodePct[n] = revenueVal > 0 ? (v / revenueVal) * 100 : 0;
    }
  });

  // 4. リンクの未指定数値を補完
  links.forEach((l) => {
    if (l.value === null || l.value === undefined) {
      l.value = nodeVal[l.target] || 10;
    }
  });

  // 5. ステージ（列）の自動トポロジカル計算
  const stages = {};
  nodes.forEach((n) => {
    if ((inSum[n] || 0) === 0) stages[n] = 0;
  });
  if (Object.keys(stages).length === 0) stages[revenueNode] = 0;

  for (let iter = 0; iter < nodes.length; iter++) {
    let changed = false;
    links.forEach((l) => {
      const srcStage = stages[l.source] !== undefined ? stages[l.source] : 0;
      const expStage = srcStage + 1;
      if (stages[l.target] === undefined || stages[l.target] < expStage) {
        stages[l.target] = expStage;
        changed = true;
      }
    });
    if (!changed) break;
  }
  nodes.forEach((n) => { if (stages[n] === undefined) stages[n] = 0; });

  const maxStage = Math.max(1, ...Object.values(stages));
  const stageGroups = [];
  for (let s = 0; s <= maxStage; s++) stageGroups[s] = [];
  nodes.forEach((n) => stageGroups[stages[n]].push(n));

  // 6. 各ノードのカラーパレット判定
  const isCostOrLoss = (name) => {
    return /原価|費用|コスト|販管|費|税|損失|損|赤字|cogs|expense|tax|loss/i.test(name) && !/利益|粗利|収益|profit|income|revenue|sales/i.test(name);
  };
  const isProfit = (name) => {
    return /利益|粗利|profit|income/i.test(name);
  };

  const nodeColors = {};
  nodes.forEach((n) => {
    const meta = nodeMeta[n] || {};
    if (meta.color) {
      nodeColors[n] = meta.color;
    } else if (n === revenueNode) {
      nodeColors[n] = '#0284c7'; // 売上高（濃いブルー）
    } else if (isCostOrLoss(n) || nodePct[n] < 0 || nodeVal[n] < 0) {
      nodeColors[n] = '#f87171'; // コスト・費用・税金（ソフトコーラルレッド）
    } else if (isProfit(n) || /純利益|営業利益|経常利益|売上総利益/i.test(n)) {
      nodeColors[n] = '#34d399'; // 利益系（エメラルドグリーン）
    } else {
      nodeColors[n] = '#38bdf8'; // その他売上セグメント等（ライトブルー）
    }
  });

  // 7. 幾何レイアウト・座標計算
  const padTop = 100;
  const padBottom = 60;
  const padLeft = 110;

  // 最右列のラベル最大長を計測し、右端余白を動的確保（長文ラベルの画面外切れ防止）
  let maxRightLabelLen = 0;
  if (stageGroups[maxStage]) {
    stageGroups[maxStage].forEach((n) => {
      const len = (n || '').length;
      if (len > maxRightLabelLen) maxRightLabelLen = len;
    });
  }
  const padRight = Math.max(140, Math.min(260, maxRightLabelLen * 13 + 36));
  const svgWidth = Math.max(960, (maxStage + 1) * 210 + padRight);
  const nodeWidth = 14;
  const baseHeight = 240;
  const scalePxPerPct = baseHeight / 100;
  const minPitch = 50; // 3行ラベルの重なり防止ピッチ

  const colX = [];
  for (let s = 0; s <= maxStage; s++) {
    colX[s] = padLeft + (maxStage > 0 ? (s / maxStage) * (svgWidth - padLeft - padRight - nodeWidth) : 0);
  }

  const nodeGeom = {};
  let maxContentY = padTop + baseHeight;

  // 各ステージを順次配置（親ノードのY座標順で自動整流）
  for (let s = 0; s <= maxStage; s++) {
    const group = stageGroups[s];

    if (s > 0) {
      // 各ノードの親ノード（流入元）の平均Y座標を算出
      const getParentY = (n) => {
        const parentLinks = links.filter((l) => l.target === n && nodeGeom[l.source]);
        if (parentLinks.length === 0) return 0;
        const sumY = parentLinks.reduce((acc, l) => acc + nodeGeom[l.source].y, 0);
        return sumY / parentLinks.length;
      };

      group.sort((a, b) => {
        const pA = getParentY(a);
        const pB = getParentY(b);
        // 1. 親ノードのY座標に有意な差があれば親の高さ順（上の親から流れるノード群が上）
        if (Math.abs(pA - pB) > 8) {
          return pA - pB;
        }
        // 2. 同一の親グループ内では、コスト系が上、利益系が下
        const aIsCost = isCostOrLoss(a);
        const bIsCost = isCostOrLoss(b);
        if (aIsCost && !bIsCost) return -1;
        if (!aIsCost && bIsCost) return 1;
        // 3. 同じコスト同士、利益同士なら金額の大きい順
        return (nodeVal[b] || 0) - (nodeVal[a] || 0);
      });
    }

    let curY = padTop + 50;
    group.forEach((n) => {
      const pct = Math.abs(nodePct[n] || 5);
      const nh = Math.max(12, pct * scalePxPerPct);
      nodeGeom[n] = { x: colX[s], y: curY, w: nodeWidth, h: nh, stage: s };
      const gap = (s > 0 && s < maxStage && group.length > 1) ? 52 : Math.max(12, minPitch - nh);
      curY += nh + gap;
    });

    if (curY > maxContentY) maxContentY = curY;
  }

  const svgHeight = Math.max(520, maxContentY + padBottom);

  // 9. SVG 要素作成
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.style.maxWidth = `${svgWidth}px`;
  svg.style.margin = '0 auto';
  svg.style.display = 'block';
  svg.style.background = '#ffffff';
  svg.style.borderRadius = '12px';
  svg.style.overflow = 'hidden';
  svg.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Hiragino Kaku Gothic ProN", Meiryo, sans-serif';

  // 10. ヘッダー描画（B/Sと同一のIRスタイリッシュデザイン）
  const headerG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  headerG.setAttribute('class', 'pl-header');

  const titleEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  titleEl.setAttribute('x', '24');
  titleEl.setAttribute('y', '38');
  titleEl.setAttribute('font-size', '17');
  titleEl.setAttribute('font-weight', '800');
  titleEl.setAttribute('fill', '#0f172a');

  let titleStr = company || title || '損益計算書 (Profit & Loss Statement)';
  if (code) titleStr += `（${code}）`;
  titleEl.textContent = titleStr;
  headerG.appendChild(titleEl);

  const subEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  subEl.setAttribute('x', svgWidth - 24);
  subEl.setAttribute('y', '36');
  subEl.setAttribute('text-anchor', 'end');
  subEl.setAttribute('font-size', '13');
  subEl.setAttribute('font-weight', '700');
  subEl.setAttribute('fill', '#334155');

  const metaRightParts = [];
  if (period) metaRightParts.push(period);
  metaRightParts.push('損益計算書');
  if (unit) metaRightParts.push(`(${unit})`);
  if (!consolidated) metaRightParts.push('[単体]');
  subEl.textContent = metaRightParts.join(' ');
  headerG.appendChild(subEl);

  const sub2 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  sub2.setAttribute('x', svgWidth - 24);
  sub2.setAttribute('y', '54');
  sub2.setAttribute('text-anchor', 'end');
  sub2.setAttribute('font-size', '11');
  sub2.setAttribute('font-weight', '600');
  sub2.setAttribute('fill', '#94a3b8');
  sub2.textContent = 'Income Statement / P&L Flow';
  headerG.appendChild(sub2);

  svg.appendChild(headerG);

  // 11. サンキーバンド（リンク）描画
  const linksG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  linksG.setAttribute('class', 'pl-links-group');

  // 各ノードごとに、出力リンク（out-links）と入力リンク（in-links）を収集
  const nodeOutLinks = {};
  const nodeInLinks = {};
  nodes.forEach((n) => {
    nodeOutLinks[n] = [];
    nodeInLinks[n] = [];
  });

  links.forEach((l) => {
    if (nodeOutLinks[l.source]) nodeOutLinks[l.source].push(l);
    if (nodeInLinks[l.target]) nodeInLinks[l.target].push(l);
  });

  // 各ノードからの出力リンクを、接続先 target の Y 座標昇順（上から下へ）でソートして帯位置を割り当て
  nodes.forEach((n) => {
    const srcG = nodeGeom[n];
    if (!srcG) return;
    const outList = nodeOutLinks[n];
    outList.sort((a, b) => {
      const gA = nodeGeom[a.target];
      const gB = nodeGeom[b.target];
      if (gA && gB) return gA.y - gB.y;
      return 0;
    });

    const totalVal = outList.reduce((sum, l) => sum + (l.value || 0), 0) || 1;
    let curY = srcG.y;
    const targetBottom = srcG.y + srcG.h;
    outList.forEach((l, idx) => {
      l.srcY_top = curY;
      if (idx === outList.length - 1) {
        l.srcY_bot = targetBottom;
      } else {
        const rawH = ((l.value || 0) / totalVal) * srcG.h;
        l.srcY_bot = Math.min(targetBottom, curY + rawH);
      }
      l.srcY_top = Math.max(srcG.y, Math.min(targetBottom, l.srcY_top));
      l.srcY_bot = Math.max(l.srcY_top, Math.min(targetBottom, l.srcY_bot));
      curY = l.srcY_bot;
    });
  });

  // 各ノードへの入力リンクを、接続元 source の Y 座標昇順（上から下へ）でソートして帯位置を割り当て（交差完全解消）
  nodes.forEach((n) => {
    const tgtG = nodeGeom[n];
    if (!tgtG) return;
    const inList = nodeInLinks[n];
    if (inList.length === 0) return;
    inList.sort((a, b) => {
      const gA = nodeGeom[a.source];
      const gB = nodeGeom[b.source];
      if (gA && gB) return gA.y - gB.y;
      return 0;
    });

    const totalVal = inList.reduce((sum, l) => sum + (l.value || 0), 0) || 1;
    let curY = tgtG.y;
    const targetBottom = tgtG.y + tgtG.h;
    inList.forEach((l, idx) => {
      l.tgtY_top = curY;
      if (idx === inList.length - 1) {
        l.tgtY_bot = targetBottom;
      } else {
        const rawH = ((l.value || 0) / totalVal) * tgtG.h;
        l.tgtY_bot = Math.min(targetBottom, curY + rawH);
      }
      l.tgtY_top = Math.max(tgtG.y, Math.min(targetBottom, l.tgtY_top));
      l.tgtY_bot = Math.max(l.tgtY_top, Math.min(targetBottom, l.tgtY_bot));
      curY = l.tgtY_bot;
    });
  });

  links.forEach((link) => {
    const srcG = nodeGeom[link.source];
    const tgtG = nodeGeom[link.target];
    if (!srcG || !tgtG) return;

    const x1 = srcG.x + srcG.w;
    const rawY1Top = link.srcY_top !== undefined ? link.srcY_top : srcG.y;
    const rawY1Bot = link.srcY_bot !== undefined ? link.srcY_bot : rawY1Top + 10;
    const y1_top = Math.max(srcG.y, Math.min(srcG.y + srcG.h, rawY1Top));
    const y1_bot = Math.max(y1_top, Math.min(srcG.y + srcG.h, rawY1Bot));

    const x2 = tgtG.x;
    const rawY2Top = link.tgtY_top !== undefined ? link.tgtY_top : tgtG.y;
    const rawY2Bot = link.tgtY_bot !== undefined ? link.tgtY_bot : rawY2Top + 10;
    const y2_top = Math.max(tgtG.y, Math.min(tgtG.y + tgtG.h, rawY2Top));
    const y2_bot = Math.max(y2_top, Math.min(tgtG.y + tgtG.h, rawY2Bot));

    const midX = (x1 + x2) / 2;
    const pathD = `M ${x1.toFixed(1)} ${y1_top.toFixed(1)} ` +
      `C ${midX.toFixed(1)} ${y1_top.toFixed(1)}, ${midX.toFixed(1)} ${y2_top.toFixed(1)}, ${x2.toFixed(1)} ${y2_top.toFixed(1)} ` +
      `L ${x2.toFixed(1)} ${y2_bot.toFixed(1)} ` +
      `C ${midX.toFixed(1)} ${y2_bot.toFixed(1)}, ${midX.toFixed(1)} ${y1_bot.toFixed(1)}, ${x1.toFixed(1)} ${y1_bot.toFixed(1)} ` +
      `Z`;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathD);

    let linkColor = link.color;
    if (!linkColor) {
      if (isCostOrLoss(link.target)) linkColor = '#fecdd3';
      else if (isProfit(link.target) || /純利益|営業利益/i.test(link.target)) linkColor = '#a7f3d0';
      else linkColor = '#bae6fd';
    }

    path.setAttribute('fill', linkColor);
    path.setAttribute('fill-opacity', '0.42');
    path.setAttribute('stroke', linkColor);
    path.setAttribute('stroke-width', '0.5');
    path.setAttribute('stroke-opacity', '0.25');

    const formattedVal = Number(link.value).toLocaleString('ja-JP');
    const tip = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    tip.textContent = `${link.source} → ${link.target}: ${formattedVal}${link.percent ? ' (' + link.percent + ')' : ''}`;
    path.appendChild(tip);

    linksG.appendChild(path);
  });
  svg.appendChild(linksG);

  // 12. ノード矩形および3行ラベル描画
  const nodesG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  nodesG.setAttribute('class', 'pl-nodes-group');

  nodes.forEach((n) => {
    const geom = nodeGeom[n];
    if (!geom) return;

    const color = nodeColors[n] || '#38bdf8';

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', geom.x.toFixed(1));
    rect.setAttribute('y', geom.y.toFixed(1));
    rect.setAttribute('width', geom.w.toFixed(1));
    rect.setAttribute('height', geom.h.toFixed(1));
    rect.setAttribute('rx', '2.5');
    rect.setAttribute('ry', '2.5');
    rect.setAttribute('fill', color);
    rect.setAttribute('class', 'pl-node');

    const dispVal = nodeVal[n];
    const formattedVal = typeof dispVal === 'number' ? dispVal.toLocaleString('ja-JP') : String(dispVal);

    const tip = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    tip.textContent = `${n}: ${formattedVal}`;
    rect.appendChild(tip);
    nodesG.appendChild(rect);

    const pctNum = nodePct[n];
    const percentStr = (nodeMeta[n] && nodeMeta[n].percent) ? nodeMeta[n].percent : `${pctNum.toFixed(1)}%`;

    const textG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    textG.setAttribute('class', 'pl-node-label-group');

    let labelTextColor = '#0369a1';
    let percentTextColor = '#0284c7';
    if (color === '#f59e0b' || color === '#d97706' || color === '#b45309') {
      labelTextColor = '#b45309';
      percentTextColor = '#d97706';
    } else if (color === '#f87171' || color === '#ef4444' || isCostOrLoss(n) || pctNum < 0) {
      labelTextColor = '#b91c1c';
      percentTextColor = '#b91c1c';
    } else if (color === '#34d399' || color === '#22c55e' || isProfit(n)) {
      labelTextColor = '#15803d';
      percentTextColor = '#15803d';
    } else if (color) {
      labelTextColor = color;
      percentTextColor = color;
    }

    if (geom.stage === 0) {
      // 左端列: ノードの左側に右揃え表示
      const anchorX = geom.x - 8;
      const centerY = geom.y + geom.h / 2;
      const startY = centerY - 11;

      const pctEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      pctEl.setAttribute('x', anchorX.toFixed(1));
      pctEl.setAttribute('y', startY.toFixed(1));
      pctEl.setAttribute('text-anchor', 'end');
      pctEl.setAttribute('font-size', '11');
      pctEl.setAttribute('font-weight', '700');
      pctEl.setAttribute('fill', percentTextColor);
      pctEl.textContent = percentStr;
      textG.appendChild(pctEl);

      const nameEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      nameEl.setAttribute('x', anchorX.toFixed(1));
      nameEl.setAttribute('y', (startY + 12).toFixed(1));
      nameEl.setAttribute('text-anchor', 'end');
      nameEl.setAttribute('font-size', '12.5');
      nameEl.setAttribute('font-weight', '700');
      nameEl.setAttribute('fill', labelTextColor);
      nameEl.textContent = n;
      textG.appendChild(nameEl);

      const valEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      valEl.setAttribute('x', anchorX.toFixed(1));
      valEl.setAttribute('y', (startY + 24).toFixed(1));
      valEl.setAttribute('text-anchor', 'end');
      valEl.setAttribute('font-size', '11.5');
      valEl.setAttribute('font-weight', '600');
      valEl.setAttribute('fill', '#64748b');
      valEl.textContent = formattedVal;
      textG.appendChild(valEl);

    } else if (geom.stage === maxStage) {
      // 右端列: ノードの右側に左揃え表示
      const anchorX = geom.x + geom.w + 8;
      const centerY = geom.y + geom.h / 2;
      const startY = centerY - 11;

      const pctEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      pctEl.setAttribute('x', anchorX.toFixed(1));
      pctEl.setAttribute('y', startY.toFixed(1));
      pctEl.setAttribute('text-anchor', 'start');
      pctEl.setAttribute('font-size', '11');
      pctEl.setAttribute('font-weight', '700');
      pctEl.setAttribute('fill', percentTextColor);
      pctEl.textContent = percentStr;
      textG.appendChild(pctEl);

      const nameEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      nameEl.setAttribute('x', anchorX.toFixed(1));
      nameEl.setAttribute('y', (startY + 12).toFixed(1));
      nameEl.setAttribute('text-anchor', 'start');
      nameEl.setAttribute('font-size', '12.5');
      nameEl.setAttribute('font-weight', '700');
      nameEl.setAttribute('fill', labelTextColor);
      nameEl.textContent = n;
      textG.appendChild(nameEl);

      const valEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      valEl.setAttribute('x', anchorX.toFixed(1));
      valEl.setAttribute('y', (startY + 24).toFixed(1));
      valEl.setAttribute('text-anchor', 'start');
      valEl.setAttribute('font-size', '11.5');
      valEl.setAttribute('font-weight', '600');
      valEl.setAttribute('fill', labelTextColor);
      valEl.textContent = formattedVal;
      textG.appendChild(valEl);

    } else {
      // 中間列: above または below
      const meta = nodeMeta[n] || {};
      const side = meta.side || (isCostOrLoss(n) ? 'above' : 'below');
      const centerX = geom.x + geom.w / 2;

      let startY = side === 'above' ? geom.y - 28 : geom.y + geom.h + 13;

      const pctEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      pctEl.setAttribute('x', centerX.toFixed(1));
      pctEl.setAttribute('y', startY.toFixed(1));
      pctEl.setAttribute('text-anchor', 'middle');
      pctEl.setAttribute('font-size', '11');
      pctEl.setAttribute('font-weight', '700');
      pctEl.setAttribute('fill', percentTextColor);
      pctEl.textContent = percentStr;
      textG.appendChild(pctEl);

      const nameEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      nameEl.setAttribute('x', centerX.toFixed(1));
      nameEl.setAttribute('y', (startY + 13).toFixed(1));
      nameEl.setAttribute('text-anchor', 'middle');
      nameEl.setAttribute('font-size', '13');
      nameEl.setAttribute('font-weight', '700');
      nameEl.setAttribute('fill', labelTextColor);
      nameEl.textContent = n;
      textG.appendChild(nameEl);

      const valEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      valEl.setAttribute('x', centerX.toFixed(1));
      valEl.setAttribute('y', (startY + 25).toFixed(1));
      valEl.setAttribute('text-anchor', 'middle');
      valEl.setAttribute('font-size', '11.5');
      valEl.setAttribute('font-weight', '600');
      valEl.setAttribute('fill', labelTextColor);
      valEl.textContent = formattedVal;
      textG.appendChild(valEl);
    }

    nodesG.appendChild(textG);
  });
  svg.appendChild(nodesG);

  // 13. フッター注記（note）
  if (note) {
    const noteEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    noteEl.setAttribute('x', '24');
    noteEl.setAttribute('y', svgHeight - 16);
    noteEl.setAttribute('font-size', '11');
    noteEl.setAttribute('font-weight', '500');
    noteEl.setAttribute('fill', '#94a3b8');
    noteEl.textContent = `※ ${note}`;
    svg.appendChild(noteEl);
  }

  container.appendChild(svg);

  if (labelText) {
    const lbl = document.createElement('div');
    lbl.className = 'chem-structure-label';
    lbl.textContent = labelText;
    container.appendChild(lbl);
  }
}
