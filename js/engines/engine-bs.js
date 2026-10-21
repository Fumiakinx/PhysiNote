// ==========================================
// 決算書サンキーダイアグラム (B/S) パーサー & SVG描画エンジン
// ==========================================
function parseBalanceSheet(text) {
  const lines = text.split(/[\n;]+/).map((l) => l.trim()).filter((l) => l && !l.startsWith('//') && !l.startsWith('#'));
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
    if (!bracketStr) return { value: null, percent: null, color: null, side: null, highlight: false };
    const parts = bracketStr.split(',').map((p) => p.trim()).filter(Boolean);
    let value = null;
    let percent = null;
    let color = null;
    let side = null;
    let highlight = false;

    parts.forEach((p) => {
      if (/^(highlight|強調)$/i.test(p)) {
        highlight = true;
      } else if (/^-?[\d,]+(?:\.\d+)?%$/.test(p)) {
        percent = p;
      } else if (/^-?[\d,]+(?:\.\d+)?$/.test(p)) {
        value = parseFloat(p.replace(/,/g, ''));
      } else if (/^(above|below|left|right)$/i.test(p)) {
        side = p.toLowerCase();
      } else if (/^#[0-9a-fA-F]{3,8}$/.test(p) || /^[a-zA-Z]+$/.test(p)) {
        color = p;
      }
    });
    if (highlight && !color) {
      color = '#ef4444';
    }
    return { value, percent, color, side, highlight };
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
        nodeMeta[name] = Object.assign(nodeMeta[name] || {}, props, { isExplicit: true });
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

      let trailingColor = null;
      const colorMatch = rightPart.match(/\s+(#[a-fA-F0-9]{3,8})$/);
      if (colorMatch) {
        trailingColor = colorMatch[1];
        rightPart = rightPart.replace(/\s+#[a-fA-F0-9]{3,8}$/, '').trim();
      }

      const src = leftPart.replace(/^["']|["']$/g, '').trim();
      const tgt = rightPart.replace(/^["']|["']$/g, '').trim();

      const val = tgtProps.value !== null ? tgtProps.value : (srcProps.value !== null ? srcProps.value : 10);
      const linkColor = tgtProps.color || srcProps.color || trailingColor || null;
      const linkPercent = tgtProps.percent || srcProps.percent || null;
      const isHighlight = srcProps.highlight || tgtProps.highlight;

      if (src && tgt) {
        links.push({
          source: src,
          target: tgt,
          value: val,
          color: linkColor,
          percent: linkPercent,
          highlight: isHighlight
        });
        nodeNamesSet.add(src);
        nodeNamesSet.add(tgt);

        if (!nodeMeta[src]) nodeMeta[src] = {};
        if (srcProps.highlight) nodeMeta[src].highlight = true;
        if (!nodeMeta[src].isExplicit) {
          if (srcProps.side && !nodeMeta[src].side) nodeMeta[src].side = srcProps.side;
        }

        if (!nodeMeta[tgt]) nodeMeta[tgt] = {};
        if (tgtProps.highlight) nodeMeta[tgt].highlight = true;
        if (!nodeMeta[tgt].isExplicit) {
          if (tgtProps.side && !nodeMeta[tgt].side) nodeMeta[tgt].side = tgtProps.side;
        }
      }
    }
  });

  return { company, code, period, unit, consolidated, title, subtitle, note, links, nodes: Array.from(nodeNamesSet), nodeMeta };
}

function drawBalanceSheetSvg(bsText, container, labelText) {
  const parsed = parseBalanceSheet(bsText);
  const { company, code, period, unit, consolidated, title, subtitle, note, links, nodes, nodeMeta } = parsed;

  if (links.length === 0 || nodes.length === 0) {
    container.innerHTML = '<span style="color:#ef4444; font-size:12px;">決算書サンキー図の構文を解析できませんでした（例: \\bs{ company: "TEST"; 流動資産 -> 資産; }）</span>';
    return;
  }

  // 1. ヘッダー情報の構成
  const headerLeftMain = title || (company ? (code ? `${company} | ${code}` : company) : '連結貸借対照表');
  const headerRightMain = subtitle || `${consolidated ? '連結貸借対照表' : '貸借対照表'}${period ? ' ' + period : ''}${unit ? ' (' + unit + ')' : ''}`;
  const headerRightSub = /USD|ドル|\$/i.test(unit || '') ? 'US Balance Sheet' : 'Balance Sheet';

  // 2. 金額およびパーセントの集計・正規化
  const inSum = {};
  const outSum = {};
  const nodeVal = {};
  const nodePct = {};

  nodes.forEach((n) => {
    inSum[n] = 0;
    outSum[n] = 0;
  });

  links.forEach((l) => {
    outSum[l.source] = (outSum[l.source] || 0) + l.value;
    inSum[l.target] = (inSum[l.target] || 0) + l.value;
  });

  // 総資産（基準値 = 100%）の特定
  let assetNodeName = nodes.find((n) => /^(資産|資産合計|総資産)$/i.test(n)) || nodes.find((n) => /資産/i.test(n)) || '資産';
  let totalAssetVal = 0;
  if (nodeMeta[assetNodeName] && nodeMeta[assetNodeName].isExplicit && typeof nodeMeta[assetNodeName].value === 'number') {
    totalAssetVal = Math.abs(nodeMeta[assetNodeName].value);
  } else if (inSum[assetNodeName] > 0) {
    totalAssetVal = Math.abs(inSum[assetNodeName]);
  } else if (outSum[assetNodeName] > 0) {
    totalAssetVal = Math.abs(outSum[assetNodeName]);
  } else {
    const initialNodes = nodes.filter((n) => inSum[n] === 0);
    totalAssetVal = initialNodes.reduce((acc, n) => acc + Math.abs(outSum[n] || 0), 0) || 100;
  }
  if (totalAssetVal <= 0) totalAssetVal = 100;

  nodes.forEach((n) => {
    if (nodeMeta[n] && nodeMeta[n].isExplicit && nodeMeta[n].value !== null && nodeMeta[n].value !== undefined) {
      nodeVal[n] = nodeMeta[n].value;
    } else if (inSum[n] > 0 && outSum[n] === 0) {
      nodeVal[n] = inSum[n];
    } else if (outSum[n] > 0 && inSum[n] === 0) {
      nodeVal[n] = outSum[n];
    } else {
      nodeVal[n] = Math.abs(outSum[n]) >= Math.abs(inSum[n]) ? outSum[n] : inSum[n];
    }

    if (nodeMeta[n] && nodeMeta[n].isExplicit && nodeMeta[n].percent) {
      nodePct[n] = parseFloat(nodeMeta[n].percent.replace('%', ''));
    } else {
      nodePct[n] = Math.round((nodeVal[n] / totalAssetVal) * 1000) / 10;
    }
  });

  // 3. カラム（ステージ）への分類
  const stages = {};
  nodes.forEach((n) => {
    if (inSum[n] === 0) stages[n] = 0;
  });
  if (Object.keys(stages).length === 0 && links.length > 0) stages[links[0].source] = 0;

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

  const actualMaxStage = Math.max(1, ...Object.values(stages));
  const isTraditionalBs = actualMaxStage >= 4 && stages[assetNodeName] === 2;
  const maxStage = isTraditionalBs ? Math.max(5, actualMaxStage) : actualMaxStage;

  const stageGroups = [];
  for (let s = 0; s <= maxStage; s++) stageGroups[s] = [];
  nodes.forEach((n) => stageGroups[stages[n]].push(n));

  // 4. カラーパレットの決定
  const nodeColors = {};
  nodes.forEach((n) => {
    let specified = nodeMeta[n] && nodeMeta[n].color;
    if (nodeMeta[n] && nodeMeta[n].highlight && !specified) {
      specified = '#ef4444';
    }
    // 旧グレーデフォルト指定（#94a3b8）がある場合は付箋紙ブルーへ更新
    if (specified === '#94a3b8' || specified === '#475569') specified = '#38bdf8';

    if (specified) {
      nodeColors[n] = specified;
    } else {
      const inLink = links.find((l) => l.target === n && (l.color || l.highlight));
      const outLink = links.find((l) => l.source === n && (l.color || l.highlight));
      if (inSum[n] > 0 && outSum[n] === 0 && inLink) {
        nodeColors[n] = inLink.highlight && !inLink.color ? '#ef4444' : inLink.color;
      } else if (outSum[n] > 0 && inSum[n] === 0 && outLink) {
        nodeColors[n] = outLink.highlight && !outLink.color ? '#ef4444' : outLink.color;
      } else if (/利益剰余金/i.test(n)) {
        nodeColors[n] = '#34d399';
      } else if (/その他株主資本/i.test(n)) {
        nodeColors[n] = (nodePct[n] < 0 || nodeVal[n] < 0) ? '#f87171' : '#34d399';
      } else if (/純資産|株主資本|その他純資産/i.test(n)) {
        nodeColors[n] = (nodePct[n] < 0 || nodeVal[n] < 0) ? '#f87171' : '#34d399';
      } else if (/負債|借入|債務/i.test(n)) {
        nodeColors[n] = '#f87171';
      } else if (/^資産(合計)?$/i.test(n)) {
        nodeColors[n] = '#0284c7';
      } else {
        nodeColors[n] = '#38bdf8';
      }
    }
  });

  // 4.5 グロス拡張ノード（子にマイナスリンクを持つノード）の検出
  const grossMeta = {};
  nodes.forEach((n) => {
    const outL = links.filter((l) => l.source === n);
    const hasNeg = outL.some((l) => (l.value !== null && l.value < 0) || (l.percent && l.percent.trim().startsWith('-')));
    if (hasNeg) {
      let posPctSum = 0;
      let negPctSum = 0;
      let posValSum = 0;
      let negValSum = 0;
      outL.forEach((l) => {
        const p = l.percent ? parseFloat(l.percent.replace('%', '')) : (nodePct[l.target] || 5);
        const v = l.value !== null ? l.value : (nodeVal[l.target] || 0);
        if (p < 0 || v < 0) {
          negPctSum += Math.abs(p);
          negValSum += Math.abs(v);
        } else {
          posPctSum += p;
          posValSum += v;
        }
      });
      grossMeta[n] = {
        hasNeg: true,
        posPct: posPctSum,
        negPct: negPctSum,
        posVal: posValSum,
        negVal: negValSum,
        netPct: Math.max(0.1, posPctSum - negPctSum),
        grossPct: posPctSum
      };
    }
  });

  // 5. 幾何レイアウト・座標計算
  const padTop = 90;
  const padBottom = 50;
  const padX = 145;
  const svgWidth = 940;
  const nodeWidth = 10;

  const baseAssetHeight = 220;
  const scalePxPerPct = baseAssetHeight / 100;

  const colX = [];
  for (let s = 0; s <= maxStage; s++) {
    colX[s] = padX + (maxStage > 0 ? (s / maxStage) * (svgWidth - padX * 2 - nodeWidth) : 0);
  }

  const assetY = padTop + 70;
  const nodeGeom = {};

  if (isTraditionalBs) {
    // (A) Stage 2: 資産
    const assetH = Math.max(16, baseAssetHeight);
    nodeGeom[assetNodeName] = { x: colX[2], y: assetY, w: nodeWidth, h: assetH, stage: 2 };

    // (B) Stage 1: 流動資産 / 固定資産（非流動資産）
    let st1Y = assetY;
    stageGroups[1].forEach((n) => {
      const pct = Math.abs(nodePct[n] || 10);
      const nh = Math.max(8, pct * scalePxPerPct);
      nodeGeom[n] = { x: colX[1], y: st1Y, w: nodeWidth, h: nh, stage: 1 };
      st1Y += nh + 12;
    });

    // (C) Stage 0: 資産の内訳（テキスト衝突回避: 最小ピッチ44px保証で3行テキストの重なりを防止）
    const st0Current = [];
    const st0Fixed = [];
    stageGroups[0].forEach((n) => {
      const tgtLinks = links.filter((l) => l.source === n);
      const isCurrent = tgtLinks.some((l) => /流動/i.test(l.target));
      if (isCurrent) st0Current.push(n);
      else st0Fixed.push(n);
    });

    let st0Y = assetY;
    const minPitch = 44;
    st0Current.forEach((n) => {
      const pct = Math.abs(nodePct[n] || 5);
      const nh = Math.max(4, pct * scalePxPerPct);
      nodeGeom[n] = { x: colX[0], y: st0Y, w: nodeWidth, h: nh, stage: 0 };
      st0Y += Math.max(nh + 6, minPitch);
    });

    const fixedAssetNode = stageGroups[1].find((n) => !/流動/i.test(n));
    if (fixedAssetNode && nodeGeom[fixedAssetNode]) {
      st0Y = Math.max(st0Y + 8, nodeGeom[fixedAssetNode].y);
    } else {
      st0Y = Math.max(st0Y + 8, assetY + baseAssetHeight * 0.4);
    }
    st0Fixed.forEach((n) => {
      const pct = Math.abs(nodePct[n] || 5);
      const nh = Math.max(4, pct * scalePxPerPct);
      nodeGeom[n] = { x: colX[0], y: st0Y, w: nodeWidth, h: nh, stage: 0 };
      st0Y += Math.max(nh + 6, minPitch);
    });

    // (D) Stage 3: 負債 / 純資産
    let st3Y = assetY;
    stageGroups[3].forEach((n) => {
      const pct = Math.abs(nodePct[n] || 10);
      const nh = Math.max(10, pct * scalePxPerPct);
      nodeGeom[n] = { x: colX[3], y: st3Y, w: nodeWidth, h: nh, stage: 3 };
      st3Y += nh + 12;
    });

    // (E) Stage 4 & Stage 5 の協調配置
    const debtStage3Node = stageGroups[3].find((n) => /負債/i.test(n)) || stageGroups[3][0];
    const equityStage3Node = stageGroups[3].find((n) => /純資産|株主資本/i.test(n)) || stageGroups[3][1];

    const debtIncomingSet = new Set(links.filter((l) => l.source === debtStage3Node).map((l) => l.target));
    const equityIncomingSet = new Set(links.filter((l) => l.source === equityStage3Node).map((l) => l.target));

    const st4Debts = stageGroups[4].filter((n) => debtIncomingSet.has(n) || (/負債/i.test(n) && !equityIncomingSet.has(n)));
    const st4Equities = stageGroups[4].filter((n) => equityIncomingSet.has(n) || (!st4Debts.includes(n) && !/負債/i.test(n)));

    // 1. Stage 4 負債（流動負債・固定負債等）の配置
    let st4DebtY = assetY;
    st4Debts.forEach((n) => {
      const pct = Math.abs(nodePct[n] || 10);
      const nh = Math.max(12, pct * scalePxPerPct);
      nodeGeom[n] = { x: colX[4], y: st4DebtY, w: nodeWidth, h: nh, stage: 4 };
      st4DebtY += Math.max(nh + 12, minPitch);
    });

    const st4DebtSet = new Set(st4Debts);
    const st4EquitySet = new Set(st4Equities);

    const st5Debts = stageGroups[5].filter((n) => {
      const parentLinks = links.filter((l) => l.target === n);
      if (parentLinks.some((l) => st4DebtSet.has(l.source))) return true;
      if (parentLinks.some((l) => st4EquitySet.has(l.source))) return false;
      return !/利益|剰余金|株主資本|純資産/i.test(n);
    });
    const st5Equities = stageGroups[5].filter((n) => !st5Debts.includes(n));

    // 2. Stage 5 負債内訳の配置（最小ピッチ50pxで3行ラベル重なり防止）
    const st5MinPitch = 50;
    let st5Y = assetY;
    st5Debts.forEach((n) => {
      const pct = Math.abs(nodePct[n] || 5);
      const nh = Math.max(8, pct * scalePxPerPct);
      nodeGeom[n] = { x: colX[5], y: st5Y, w: nodeWidth, h: nh, stage: 5 };
      st5Y += Math.max(nh + 8, st5MinPitch);
    });

    // 3. 純資産側の基準開始Y座標（負債側と十分な間隔を確保）
    const eqStartY = Math.max(
      nodeGeom[equityStage3Node] ? nodeGeom[equityStage3Node].y : assetY + baseAssetHeight * 0.6,
      st4DebtY + 16
    );

    // 4. Stage 5 純資産内訳の配置
    let st5EqY = Math.max(st5Y + 16, eqStartY);
    st5Equities.forEach((n) => {
      const pct = Math.abs(nodePct[n] || 5);
      const nh = Math.max(8, pct * scalePxPerPct);
      nodeGeom[n] = { x: colX[5], y: st5EqY, w: nodeWidth, h: nh, stage: 5 };
      st5EqY += Math.max(nh + 8, st5MinPitch);
    });

    // 5. Stage 4 純資産ノード群（株主資本、その他純資産など）の配置
    if (st4Equities.length === 1 && st5Equities.length >= 2) {
      const n = st4Equities[0];
      const gInfo = grossMeta[n];
      if (gInfo && gInfo.hasNeg) {
        const netH = Math.max(16, gInfo.netPct * scalePxPerPct);
        const grossH = Math.max(16, gInfo.grossPct * scalePxPerPct);
        const parentEquityY = nodeGeom[equityStage3Node] ? nodeGeom[equityStage3Node].y : assetY + baseAssetHeight * 0.6;
        
        // 株主資本: Stage 4 の上部に配置（純額ネット高さ）
        nodeGeom[n] = { x: colX[4], y: parentEquityY, w: nodeWidth, h: netH, stage: 4 };

        // 正の子項目（政府出資金）: 最右列（Stage 5）に全高（grossH）で配置
        const posChild = st5Equities.find((c) => {
          const l = links.find((link) => link.source === n && link.target === c);
          return l && ((l.value !== null && l.value >= 0) && (!l.percent || !l.percent.trim().startsWith('-')));
        }) || st5Equities[0];

        if (nodeGeom[posChild]) {
          nodeGeom[posChild] = { x: colX[5], y: parentEquityY, w: nodeWidth, h: grossH, stage: 5 };
        }

        // 負の子項目（欠損金等）: パターン2として株主資本の真下（Stage 4）に配置（ラベル余白44px確保）
        const negChildren = st5Equities.filter((c) => c !== posChild);
        let curNegY = parentEquityY + netH + 44;
        negChildren.forEach((curN) => {
          const curPct = Math.abs(nodePct[curN] || 5);
          const curH = Math.max(8, curPct * scalePxPerPct);
          nodeGeom[curN] = { x: colX[4], y: curNegY, w: nodeWidth, h: curH, stage: 4 };
          curNegY += curH + 8;
        });
      } else {
        const firstY = nodeGeom[st5Equities[0]].y;
        const lastChild = nodeGeom[st5Equities[st5Equities.length - 1]];
        const totalH = (lastChild.y + lastChild.h) - firstY;
        const midY = firstY + totalH / 2;
        const nh = Math.max(48, Math.min(80, totalH * 0.4));
        nodeGeom[n] = { x: colX[4], y: midY - nh / 2, w: nodeWidth, h: nh, stage: 4 };
      }
    } else if (st4Equities.length > 1) {
      let prevBottomY = eqStartY;
      st4Equities.forEach((n) => {
        const pct = Math.abs(nodePct[n] || 10);
        const nh = Math.max(12, pct * scalePxPerPct);
        const childLinks = links.filter((l) => l.source === n && nodeGeom[l.target]);
        let targetY;
        if (childLinks.length > 0) {
          const firstChildY = nodeGeom[childLinks[0].target].y;
          const lastChild = nodeGeom[childLinks[childLinks.length - 1].target];
          const lastChildY = lastChild.y + lastChild.h;
          const midChildY = (firstChildY + lastChildY) / 2;
          targetY = Math.max(prevBottomY, midChildY - nh / 2);
        } else {
          targetY = prevBottomY;
        }
        nodeGeom[n] = { x: colX[4], y: targetY, w: nodeWidth, h: nh, stage: 4 };
        prevBottomY = targetY + nh + 18;
      });
    } else {
      let st4EqY = eqStartY;
      st4Equities.forEach((n) => {
        const pct = Math.abs(nodePct[n] || 10);
        const nh = Math.max(12, pct * scalePxPerPct);
        nodeGeom[n] = { x: colX[4], y: st4EqY, w: nodeWidth, h: nh, stage: 4 };
        st4EqY += Math.max(nh + 16, minPitch);
      });
    }
  } else {
    // 汎用多段サンキーレイアウト
    const minPitch = 44;
    for (let s = 0; s <= maxStage; s++) {
      const group = stageGroups[s] || [];
      if (group.length === 0) continue;

      if (group.length === 1 && s > 0 && s < maxStage) {
        // 中間の単一集約ノード（例: 資産合計）
        const n = group[0];
        const pct = Math.abs(nodePct[n] || 100);
        const nh = Math.max(baseAssetHeight, pct * scalePxPerPct);
        nodeGeom[n] = { x: colX[s], y: assetY, w: nodeWidth, h: nh, stage: s };
      } else {
        let currY = assetY;
        group.forEach((n) => {
          const pct = Math.abs(nodePct[n] || 5);
          const nh = Math.max(4, pct * scalePxPerPct);
          nodeGeom[n] = { x: colX[s], y: currY, w: nodeWidth, h: nh, stage: s };
          currY += Math.max(nh + 6, minPitch);
        });
      }
    }
  }

  let maxContentY = assetY + baseAssetHeight;
  nodes.forEach((n) => {
    const g = nodeGeom[n];
    if (g && g.y + g.h > maxContentY) maxContentY = g.y + g.h;
  });
  const svgHeight = Math.max(480, maxContentY + padBottom + 20);

  // 6. SVG 要素生成
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);
  svg.setAttribute('width', svgWidth);
  svg.setAttribute('height', svgHeight);
  svg.style.maxWidth = '100%';
  svg.style.height = 'auto';
  svg.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Hiragino Kaku Gothic ProN", Meiryo, sans-serif';

  // 7. ヘッダー描画
  const headerG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  headerG.setAttribute('class', 'bs-header');

  const titleEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  titleEl.setAttribute('x', '24');
  titleEl.setAttribute('y', '38');
  titleEl.setAttribute('font-size', '17');
  titleEl.setAttribute('font-weight', '800');
  titleEl.setAttribute('fill', '#0f172a');
  titleEl.textContent = headerLeftMain;
  headerG.appendChild(titleEl);

  const subEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  subEl.setAttribute('x', (svgWidth - 24).toFixed(1));
  subEl.setAttribute('y', '32');
  subEl.setAttribute('text-anchor', 'end');
  subEl.setAttribute('font-size', '14');
  subEl.setAttribute('font-weight', '700');
  subEl.setAttribute('fill', '#334155');
  subEl.textContent = headerRightMain;
  headerG.appendChild(subEl);

  const subEnEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  subEnEl.setAttribute('x', (svgWidth - 24).toFixed(1));
  subEnEl.setAttribute('y', '48');
  subEnEl.setAttribute('text-anchor', 'end');
  subEnEl.setAttribute('font-size', '11');
  subEnEl.setAttribute('font-weight', '600');
  subEnEl.setAttribute('fill', '#94a3b8');
  subEnEl.textContent = headerRightSub;
  headerG.appendChild(subEnEl);

  svg.appendChild(headerG);

  // 8. リンク（帯）描画
  const sourceOffsets = {};
  const targetOffsets = {};
  nodes.forEach((n) => {
    sourceOffsets[n] = 0;
    targetOffsets[n] = 0;
  });

  // 単一流入で受入ノードが高い場合のみ中央寄せ初期オフセット（例: 純資産から株主資本へ）
  links.forEach((l) => {
    const inLinks = links.filter((link) => link.target === l.target);
    if (inLinks.length === 1) {
      const srcG = nodeGeom[l.source];
      const tgtG = nodeGeom[l.target];
      if (srcG && tgtG && tgtG.h > srcG.h * 1.5 && targetOffsets[l.target] === 0 && !grossMeta[l.target]) {
        const inPct = Math.abs(parseFloat(l.percent || nodePct[l.source] || 5));
        const inH = Math.max(3, inPct * scalePxPerPct);
        targetOffsets[l.target] = Math.max(0, (tgtG.h - inH) / 2);
      }
    }
  });

  const linksG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  linksG.setAttribute('class', 'bs-links-group');

  links.forEach((link) => {
    const srcG = nodeGeom[link.source];
    const tgtG = nodeGeom[link.target];
    if (!srcG || !tgtG) return;

    let pctVal = 5;
    if (link.percent) {
      pctVal = Math.abs(parseFloat(link.percent.replace('%', '')));
    } else if (nodePct[link.target] !== undefined) {
      pctVal = Math.abs(nodePct[link.target]);
    } else if (link.value) {
      pctVal = Math.abs(link.value / totalAssetVal * 100);
    }

    const bandH = Math.max(4, pctVal * scalePxPerPct);

    const isNegLink = (link.value !== null && link.value < 0) || (link.percent && link.percent.trim().startsWith('-'));
    const srcGross = grossMeta[link.source];
    const tgtGross = grossMeta[link.target];

    let y1_top, y1_bot, y2_top, y2_bot;

    if (srcGross && srcGross.hasNeg) {
      const netH = srcGross.netPct * scalePxPerPct;
      const grossH = srcGross.grossPct * scalePxPerPct;
      if (isNegLink) {
        // パターン2: 欠損金ノード（tgtG: Stage 4）への赤の控除フロー
        // 左端は欠損金ノード [tgtG.y, tgtG.y + tgtG.h]
        y1_top = tgtG.y;
        y1_bot = tgtG.y + tgtG.h;
        // 右端は政府出資金（Stage 5）の下部 [srcG.y + netH, srcG.y + grossH]（緑帯と隙間なく直結）
        y2_top = srcG.y + netH;
        y2_bot = srcG.y + grossH;
      } else {
        // 正の主項目（政府出資金）: 左端は株主資本（srcG）、右端は政府出資金の上部 [y, y + netH]（水平直結）
        y1_top = srcG.y;
        y1_bot = srcG.y + netH;
        y2_top = tgtG.y;
        y2_bot = tgtG.y + netH;
      }
    } else {
      const outLinks = links.filter((l) => l.source === link.source);
      let srcBandH = bandH;
      if (outLinks.length > 1) {
        const sumOutPct = outLinks.reduce((sum, l) => {
          const p = l.percent ? Math.abs(parseFloat(l.percent.replace('%', ''))) : Math.abs(nodePct[l.target] || 5);
          return sum + p;
        }, 0);
        srcBandH = Math.max(2, srcG.h * (pctVal / (sumOutPct || 1)));
      } else {
        srcBandH = srcG.h;
      }
      y1_top = srcG.y + sourceOffsets[link.source];
      y1_bot = y1_top + srcBandH;
      sourceOffsets[link.source] += srcBandH;
    }

    if (tgtGross && tgtGross.hasNeg) {
      // 純資産 -> 株主資本 の流入: 株主資本の上部ネット部分 [y, y + netH] へ流入（手前と幅・位置が完全一致）
      const netH = tgtGross.netPct * scalePxPerPct;
      y2_top = tgtG.y;
      y2_bot = tgtG.y + netH;
    } else if (srcGross && srcGross.hasNeg) {
      // 既に上の srcGross ブロックで y2_top, y2_bot を正確に算出済みなので上書きしない！
    } else {
      const inLinks = links.filter((l) => l.target === link.target);
      let tgtBandH = bandH;
      if (inLinks.length > 1) {
        const sumInPct = inLinks.reduce((sum, l) => {
          const p = l.percent ? Math.abs(parseFloat(l.percent.replace('%', ''))) : Math.abs(nodePct[l.source] || 5);
          return sum + p;
        }, 0);
        tgtBandH = Math.max(2, tgtG.h * (pctVal / (sumInPct || 1)));
      } else {
        tgtBandH = tgtG.h;
      }
      y2_top = tgtG.y + targetOffsets[link.target];
      y2_bot = y2_top + tgtBandH;
      targetOffsets[link.target] += tgtBandH;
    }

    // 境界クランプガード（マイナス項目を持つ拡張ノードの場合は grossH まで許容）
    if (!(srcGross && srcGross.hasNeg && isNegLink)) {
      const maxSrcH = (srcGross && srcGross.hasNeg) ? Math.max(srcG.h, srcGross.grossPct * scalePxPerPct) : srcG.h;
      const maxTgtH = (tgtGross && tgtGross.hasNeg) ? Math.max(tgtG.h, tgtGross.grossPct * scalePxPerPct) : tgtG.h;
      y1_top = Math.max(srcG.y, Math.min(srcG.y + maxSrcH, y1_top));
      y1_bot = Math.max(y1_top, Math.min(srcG.y + maxSrcH, y1_bot));
      y2_top = Math.max(tgtG.y, Math.min(tgtG.y + maxTgtH, y2_top));
      y2_bot = Math.max(y2_top, Math.min(tgtG.y + maxTgtH, y2_bot));
    }

    let x1 = srcG.x + srcG.w;
    let x2 = tgtG.x;
    if (srcGross && srcGross.hasNeg && isNegLink) {
      // パターン2: 欠損金は Stage 4 にあるため、x1 を欠損金の右側、x2 を Stage 5（政府出資金）の左側に設定
      x1 = tgtG.x + tgtG.w;
      x2 = colX[5];
    }
    const midX = (x1 + x2) / 2;
    const pathD = `M ${x1.toFixed(1)} ${y1_top.toFixed(1)} ` +
      `C ${midX.toFixed(1)} ${y1_top.toFixed(1)}, ${midX.toFixed(1)} ${y2_top.toFixed(1)}, ${x2.toFixed(1)} ${y2_top.toFixed(1)} ` +
      `L ${x2.toFixed(1)} ${y2_bot.toFixed(1)} ` +
      `C ${midX.toFixed(1)} ${y2_bot.toFixed(1)}, ${midX.toFixed(1)} ${y1_bot.toFixed(1)}, ${x1.toFixed(1)} ${y1_bot.toFixed(1)} ` +
      `Z`;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathD);

    let linkColor = link.color;
    if (link.highlight) {
      linkColor = linkColor || '#ef4444';
    } else if (linkColor === '#94a3b8' || linkColor === '#475569') {
      linkColor = '#bae6fd';
    } else if (linkColor === '#22c55e') {
      linkColor = '#a7f3d0';
    }

    if (!linkColor) {
      if (/利益剰余金/i.test(link.target)) linkColor = '#a7f3d0';
      else if (/その他株主資本/i.test(link.target)) linkColor = (link.value < 0 || (link.percent && link.percent.startsWith('-'))) ? '#fecdd3' : '#a7f3d0';
      else if (/負債|借入|債務/i.test(link.target) || /負債/i.test(link.source)) linkColor = '#fecdd3';
      else if (/純資産|株主資本/i.test(link.target)) linkColor = (link.value < 0 || (link.percent && link.percent.startsWith('-'))) ? '#fecdd3' : '#a7f3d0';
      else linkColor = '#bae6fd';
    }

    path.setAttribute('fill', linkColor);
    path.setAttribute('fill-opacity', link.highlight ? '0.65' : '0.42');
    path.setAttribute('stroke', linkColor);
    path.setAttribute('stroke-width', link.highlight ? '1.2' : '0.5');
    path.setAttribute('stroke-opacity', link.highlight ? '0.85' : '0.25');

    const formattedVal = Number(link.value).toLocaleString('ja-JP');
    const titleToolTip = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    titleToolTip.textContent = `${link.source} → ${link.target}: ${formattedVal}${link.percent ? ' (' + link.percent + ')' : ''}`;
    path.appendChild(titleToolTip);

    linksG.appendChild(path);
  });
  svg.appendChild(linksG);

  // 9. ノード矩形およびラベル描画
  const nodesG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  nodesG.setAttribute('class', 'bs-nodes-group');

  nodes.forEach((n) => {
    const geom = nodeGeom[n];
    if (!geom) return;

    const color = nodeColors[n] || '#38bdf8';

    const isHighlight = !!(nodeMeta[n] && nodeMeta[n].highlight);

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', geom.x.toFixed(1));
    rect.setAttribute('y', geom.y.toFixed(1));
    rect.setAttribute('width', (geom.w + (isHighlight ? 2 : 0)).toFixed(1));
    rect.setAttribute('height', geom.h.toFixed(1));
    rect.setAttribute('rx', '2.5');
    rect.setAttribute('ry', '2.5');
    rect.setAttribute('fill', color);
    if (isHighlight) {
      rect.setAttribute('stroke', '#b91c1c');
      rect.setAttribute('stroke-width', '1.2');
    }
    rect.setAttribute('class', 'bs-node');

    const dispVal = nodeVal[n];
    const formattedVal = typeof dispVal === 'number' ? dispVal.toLocaleString('ja-JP') : String(dispVal);

    const titleToolTip = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    titleToolTip.textContent = `${n}: ${formattedVal}`;
    rect.appendChild(titleToolTip);
    nodesG.appendChild(rect);

    const pctNum = nodePct[n];
    const percentStr = (nodeMeta[n] && nodeMeta[n].percent) ? nodeMeta[n].percent : `${pctNum.toFixed(1)}%`;

    const textG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    textG.setAttribute('class', 'bs-node-label-group');

    let labelTextColor = color || '#0369a1';
    let percentTextColor = color || '#0284c7';

    if (isHighlight || color === '#ef4444' || color === '#dc2626') {
      labelTextColor = '#dc2626';
      percentTextColor = '#dc2626';
    } else if (color === '#a7f3d0' || color === '#6ee7b7' || color === '#d1fae5') {
      labelTextColor = '#047857';
      percentTextColor = '#059669';
    } else if (color === '#93c5fd' || color === '#bfdbfe' || color === '#bae6fd') {
      labelTextColor = '#1d4ed8';
      percentTextColor = '#2563eb';
    } else if (color === '#f59e0b' || color === '#d97706' || color === '#b45309' || color === '#f97316' || color === '#ea580c' || color === '#c2410c' || color === '#fbbf24') {
      labelTextColor = '#b45309';
      percentTextColor = '#d97706';
    } else if (color === '#f87171' || pctNum < 0) {
      labelTextColor = '#b91c1c';
      percentTextColor = '#b91c1c';
    } else if (color === '#34d399' || color === '#22c55e') {
      labelTextColor = '#15803d';
      percentTextColor = '#15803d';
    } else if (color === '#38bdf8') {
      labelTextColor = '#0369a1';
      percentTextColor = '#0284c7';
    } else if (!color) {
      if (/負債|借入|債務/i.test(n)) {
        labelTextColor = '#b91c1c';
        percentTextColor = '#b91c1c';
      } else if (/利益剰余金|株主資本|純資産/i.test(n)) {
        labelTextColor = '#15803d';
        percentTextColor = '#15803d';
      } else {
        labelTextColor = '#0369a1';
        percentTextColor = '#0284c7';
      }
    }

    const nameWeight = isHighlight ? '900' : '700';
    const pctWeight = isHighlight ? '900' : '700';
    const valWeight = isHighlight ? '800' : '600';
    const nameSize = isHighlight ? '13.5' : '12.5';
    const pctSize = isHighlight ? '12' : '11';
    const valSize = isHighlight ? '12' : '11';

    if (geom.stage === 0) {
      const anchorX = geom.x - 8;
      const centerY = geom.y + geom.h / 2;
      const startY = centerY - 11;

      const pctEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      pctEl.setAttribute('x', anchorX.toFixed(1));
      pctEl.setAttribute('y', startY.toFixed(1));
      pctEl.setAttribute('text-anchor', 'end');
      pctEl.setAttribute('font-size', pctSize);
      pctEl.setAttribute('font-weight', pctWeight);
      pctEl.setAttribute('fill', percentTextColor);
      pctEl.textContent = percentStr;
      textG.appendChild(pctEl);

      const nameEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      nameEl.setAttribute('x', anchorX.toFixed(1));
      nameEl.setAttribute('y', (startY + 12).toFixed(1));
      nameEl.setAttribute('text-anchor', 'end');
      nameEl.setAttribute('font-size', nameSize);
      nameEl.setAttribute('font-weight', nameWeight);
      nameEl.setAttribute('fill', labelTextColor);
      nameEl.textContent = n;
      textG.appendChild(nameEl);

      const valEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      valEl.setAttribute('x', anchorX.toFixed(1));
      valEl.setAttribute('y', (startY + 24).toFixed(1));
      valEl.setAttribute('text-anchor', 'end');
      valEl.setAttribute('font-size', valSize);
      valEl.setAttribute('font-weight', valWeight);
      valEl.setAttribute('fill', labelTextColor);
      valEl.textContent = formattedVal;
      textG.appendChild(valEl);

    } else if (geom.stage === maxStage) {
      const anchorX = geom.x + geom.w + 8;
      const centerY = geom.y + geom.h / 2;
      const startY = centerY - 11;

      const pctEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      pctEl.setAttribute('x', anchorX.toFixed(1));
      pctEl.setAttribute('y', startY.toFixed(1));
      pctEl.setAttribute('text-anchor', 'start');
      pctEl.setAttribute('font-size', pctSize);
      pctEl.setAttribute('font-weight', pctWeight);
      pctEl.setAttribute('fill', percentTextColor);
      pctEl.textContent = percentStr;
      textG.appendChild(pctEl);

      const nameEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      nameEl.setAttribute('x', anchorX.toFixed(1));
      nameEl.setAttribute('y', (startY + 12).toFixed(1));
      nameEl.setAttribute('text-anchor', 'start');
      nameEl.setAttribute('font-size', nameSize);
      nameEl.setAttribute('font-weight', nameWeight);
      nameEl.setAttribute('fill', labelTextColor);
      nameEl.textContent = n;
      textG.appendChild(nameEl);

      const valEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      valEl.setAttribute('x', anchorX.toFixed(1));
      valEl.setAttribute('y', (startY + 24).toFixed(1));
      valEl.setAttribute('text-anchor', 'start');
      valEl.setAttribute('font-size', valSize);
      valEl.setAttribute('font-weight', valWeight);
      valEl.setAttribute('fill', labelTextColor);
      valEl.textContent = formattedVal;
      textG.appendChild(valEl);

    } else {
      const meta = nodeMeta[n] || {};
      const isGrossParent = !!(grossMeta[n] && grossMeta[n].hasNeg);
      const isNegChild = links.some((l) => grossMeta[l.source] && grossMeta[l.source].hasNeg && l.target === n && ((l.value !== null && l.value < 0) || (l.percent && l.percent.trim().startsWith('-'))));
      let side = meta.side;
      if (isGrossParent) {
        side = 'below';
      } else if (isNegChild) {
        side = 'below';
      } else if (!side) {
        side = (/純資産|株主資本|その他非流動/i.test(n) ? 'below' : 'above');
      }
      const centerX = geom.x + geom.w / 2;

      let startY;
      if (side === 'above') {
        startY = geom.y - 28;
      } else {
        startY = geom.y + geom.h + 13;
      }

      const pctEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      pctEl.setAttribute('x', centerX.toFixed(1));
      pctEl.setAttribute('y', startY.toFixed(1));
      pctEl.setAttribute('text-anchor', 'middle');
      pctEl.setAttribute('font-size', pctSize);
      pctEl.setAttribute('font-weight', pctWeight);
      pctEl.setAttribute('fill', percentTextColor);
      pctEl.textContent = percentStr;
      textG.appendChild(pctEl);

      const nameEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      nameEl.setAttribute('x', centerX.toFixed(1));
      nameEl.setAttribute('y', (startY + 13).toFixed(1));
      nameEl.setAttribute('text-anchor', 'middle');
      nameEl.setAttribute('font-size', nameSize);
      nameEl.setAttribute('font-weight', nameWeight);
      nameEl.setAttribute('fill', labelTextColor);
      nameEl.textContent = n;
      textG.appendChild(nameEl);

      const valEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      valEl.setAttribute('x', centerX.toFixed(1));
      valEl.setAttribute('y', (startY + 25).toFixed(1));
      valEl.setAttribute('text-anchor', 'middle');
      valEl.setAttribute('font-size', valSize);
      valEl.setAttribute('font-weight', valWeight);
      valEl.setAttribute('fill', labelTextColor);
      valEl.textContent = formattedVal;
      textG.appendChild(valEl);
    }

    nodesG.appendChild(textG);
  });
  svg.appendChild(nodesG);

  // 10. フッタークレジット（note）描画
  if (note) {
    const noteEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    noteEl.setAttribute('x', (svgWidth / 2).toFixed(1));
    noteEl.setAttribute('y', (svgHeight - 12).toFixed(1));
    noteEl.setAttribute('text-anchor', 'middle');
    noteEl.setAttribute('font-size', '10.5');
    noteEl.setAttribute('font-weight', '500');
    noteEl.setAttribute('fill', '#94a3b8');
    noteEl.textContent = note;
    svg.appendChild(noteEl);
  }

  container.innerHTML = '';
  container.appendChild(svg);

  if (labelText) {
    const lbl = document.createElement('div');
    lbl.className = 'chem-structure-label';
    lbl.textContent = labelText;
    container.appendChild(lbl);
  }
}
