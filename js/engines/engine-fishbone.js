// ==========================================
// フィッシュボーン図 (特性要因図 / イシカワダイアグラム) エンジン
// ==========================================

/**
 * 文字列幅の概算計算（全角・半角判定）
 */
function calcFishboneTextWidth(str, isBold = false) {
  if (!str) return 0;
  let w = 0;
  for (let i = 0; i < str.length; i++) {
    w += str.charCodeAt(i) > 255 ? (isBold ? 13.5 : 12.5) : (isBold ? 8 : 7.2);
  }
  return w;
}

/**
 * フィッシュボーン図構文のパーサー
 * @param {string} rawText
 * @returns {object}
 */
function parseFishbone(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;

  let content = rawText.trim();
  let title = '';
  let subtitle = '';

  // % title: / % subtitle: の抽出
  const commentTitleMatch = content.match(/%\s*title\s*:\s*(.+)$/m);
  if (commentTitleMatch) title = commentTitleMatch[1].trim();
  const commentSubMatch = content.match(/%\s*subtitle\s*:\s*(.+)$/m);
  if (commentSubMatch) subtitle = commentSubMatch[1].trim();

  // 1. LaTeX TikZ ネイティブ環境 (\begin{tikzpicture} ... \end{tikzpicture}) の判定
  const tikzMatch = content.match(/\\begin\{tikzpicture\}([\s\S]*?)\\end\{tikzpicture\}/i);
  if (tikzMatch) {
    content = tikzMatch[1];
  } else {
    // 2. \fishbone{...} / \ishikawa{...} / \causeeffect{...}
    const cmdMatch = content.match(/^\\(?:fishbone|ishikawa|causeeffect)\s*\{([\s\S]*)\}\s*$/i);
    if (cmdMatch) {
      content = cmdMatch[1];
    }
  }

  // コメント行の除去
  const cleanContent = content
    .split('\n')
    .filter(l => !l.trim().startsWith('//') && !l.trim().startsWith('#') && !l.trim().startsWith('%'))
    .join('\n');

  // セミコロンでステートメント分割（引用符や角括弧内のセミコロンを考慮）
  const statements = [];
  let curStmt = '';
  let inQuotes = false;
  let bracketDepth = 0;

  for (let i = 0; i < cleanContent.length; i++) {
    const char = cleanContent[i];
    if (char === '"' || char === "'") inQuotes = !inQuotes;
    else if (char === '[' && !inQuotes) bracketDepth++;
    else if (char === ']' && !inQuotes) bracketDepth = Math.max(0, bracketDepth - 1);
    else if (char === ';' && !inQuotes && bracketDepth === 0) {
      if (curStmt.trim()) statements.push(curStmt.trim());
      curStmt = '';
      continue;
    }
    curStmt += char;
  }
  if (curStmt.trim()) statements.push(curStmt.trim());

  let effect = '問題・結果 (Effect)';
  let type = 'classic'; // 'classic' | 'hierarchical' | 'pill'
  const rawCategories = [];

  const defaultColors = [
    '#3b82f6', // blue
    '#10b981', // emerald
    '#f59e0b', // amber
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#06b6d4'  // cyan
  ];

  statements.forEach(rawStmt => {
    // 複数行にまたがる可能性のあるステートメントから行を取り出す
    const stmtLines = rawStmt.split('\n').map(l => l.trim()).filter(Boolean);
    const nonDirectiveLines = [];

    stmtLines.forEach(line => {
      const typeMatch = line.match(/^type\s*:\s*([a-zA-Z0-9_\-]+)/i);
      if (typeMatch) {
        type = typeMatch[1].toLowerCase();
        return;
      }

      const titleMatch = line.match(/^title\s*:\s*(.+)$/i);
      if (titleMatch) {
        title = titleMatch[1].trim().replace(/^["']|["']$/g, '');
        return;
      }

      const subMatch = line.match(/^subtitle\s*:\s*(.+)$/i);
      if (subMatch) {
        subtitle = subMatch[1].trim().replace(/^["']|["']$/g, '');
        return;
      }

      const effectMatch = line.match(/^(?:effect|problem|result|head)\s*:\s*(.+)$/i);
      if (effectMatch) {
        effect = effectMatch[1].trim().replace(/^["']|["']$/g, '');
        return;
      }

      nonDirectiveLines.push(line);
    });

    if (nonDirectiveLines.length === 0) return;

    // カテゴリと要因の定義（複数行をスペースで連結）
    const fullLine = nonDirectiveLines.join(' ');
    const catMatch = fullLine.match(/^(?:category\s+)?["']?([^:"'\[]+)["']?(?:\s*\[(.*?)\])?\s*:\s*([\s\S]+)$/i);
    if (catMatch) {
      const name = catMatch[1].trim();
      const optStr = (catMatch[2] || '').toLowerCase();
      const rest = catMatch[3].trim();

      let pos = null;
      if (optStr.includes('top') || optStr.includes('up')) pos = 'top';
      else if (optStr.includes('bottom') || optStr.includes('down')) pos = 'bottom';

      let color = null;
      const colorM = optStr.match(/color\s*:\s*([#a-zA-Z0-9]+)/);
      if (colorM) color = colorM[1];

      // 要因トークンの抽出（小骨リスト [] も考慮）
      const causes = [];
      const causeTokens = [];
      let curToken = '';
      let inQ = false;
      let bDepth = 0;

      for (let i = 0; i < rest.length; i++) {
        const char = rest[i];
        if (char === '"' || char === "'") inQ = !inQ;
        else if (char === '[' && !inQ) bDepth++;
        else if (char === ']' && !inQ) bDepth = Math.max(0, bDepth - 1);
        else if (char === ',' && !inQ && bDepth === 0) {
          if (curToken.trim()) causeTokens.push(curToken.trim());
          curToken = '';
          continue;
        }
        curToken += char;
      }
      if (curToken.trim()) causeTokens.push(curToken.trim());

      causeTokens.forEach(token => {
        let isHl = false;
        let cText = token;
        const subCauses = [];

        const bracketMatch = token.match(/\[([\s\S]*?)\]/);
        if (bracketMatch) {
          const bContent = bracketMatch[1].trim();
          if (bContent.toLowerCase().includes('highlight') || bContent.toLowerCase().includes('root') || bContent.toLowerCase().includes('important')) {
            isHl = true;
          }
          // サブ項目（小骨）の抽出
          const subItems = bContent.split(/,\s*(?=(?:[^"]*"[^"]*")*[^"]*$)/)
            .map(s => s.trim().replace(/^["']|["']$/g, ''))
            .filter(s => s && !['highlight', 'root', 'important', 'top', 'bottom'].includes(s.toLowerCase()));
          if (subItems.length > 0) {
            subCauses.push(...subItems);
          }
          cText = token.replace(/\[[\s\S]*?\]/, '').trim();
        }
        cText = cText.replace(/^["']|["']$/g, '').trim();
        if (cText) {
          causes.push({ text: cText, isHighlight: isHl, subCauses });
        }
      });

      rawCategories.push({
        name,
        pos,
        color,
        causes
      });
      return;
    }
  });

  // 上下位置（pos）の自動割り振り
  const topCount = rawCategories.filter(c => c.pos === 'top').length;
  const bottomCount = rawCategories.filter(c => c.pos === 'bottom').length;

  let curTop = topCount;
  let curBottom = bottomCount;

  rawCategories.forEach((cat, idx) => {
    if (!cat.pos) {
      if (curTop <= curBottom) {
        cat.pos = 'top';
        curTop++;
      } else {
        cat.pos = 'bottom';
        curBottom++;
      }
    }
    if (!cat.color) {
      cat.color = defaultColors[idx % defaultColors.length];
    }
  });

  return {
    type,
    title,
    subtitle,
    effect,
    categories: rawCategories
  };
}

/**
 * フィッシュボーン図のSVG描画
 * @param {string} text
 * @param {HTMLElement} container
 * @param {string} [labelText]
 */
function drawFishboneSvg(text, container, labelText) {
  if (!container) return;
  container.innerHTML = '';

  const parsed = parseFishbone(text);
  if (!parsed || parsed.categories.length === 0) {
    container.innerHTML = '<div style="color:#ef4444; font-size:13px; padding:12px;">フィッシュボーン図の構文を解析できませんでした。<br>例: <code>\\fishbone{ effect: "不良品率増加"; "人": "疲労", "不注意" [highlight]; "機械": "摩耗"; }</code></div>';
    return;
  }

  const svgNS = 'http://www.w3.org/2000/svg';
  const type = parsed.type;

  if (type === 'hierarchical') {
    renderHierarchicalFishbone(parsed, container, svgNS);
  } else if (type === 'pill') {
    renderPillFishbone(parsed, container, svgNS);
  } else {
    renderClassicFishbone(parsed, container, svgNS);
  }
}

/**
 * 形式1: クラシック線画型フィッシュボーン
 */
function renderClassicFishbone(parsed, container, svgNS) {
  const { title, subtitle, effect, categories } = parsed;
  const topCats = categories.filter(c => c.pos === 'top');
  const bottomCats = categories.filter(c => c.pos === 'bottom');
  const maxCol = Math.max(topCats.length, bottomCats.length, 2);

  const approxEffectTextW = calcFishboneTextWidth(effect, true);
  const effectW = Math.max(Math.round(approxEffectTextW + 36), 140);
  const effectH = 46;

  const boneAreaW = maxCol * 240 + 70;
  const spineStartX = 50;
  const spineEndX = spineStartX + boneAreaW;
  const effectX = spineEndX + 14;

  const rightPad = 36;
  const width = Math.max(880, effectX + effectW + rightPad);
  const height = title ? 530 : 480;

  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.style.maxWidth = `${width}px`;
  svg.style.display = 'block';
  svg.style.margin = '0 auto';
  svg.setAttribute('class', 'fishbone-svg');

  const defs = document.createElementNS(svgNS, 'defs');
  defs.innerHTML = `
    <marker id="fishbone-spine-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#334155" />
    </marker>
    <marker id="fishbone-bone-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
      <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#64748b" />
    </marker>
    <filter id="fishbone-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#0f172a" flood-opacity="0.08" />
    </filter>
  `;
  svg.appendChild(defs);

  renderTitle(svg, svgNS, title, subtitle, width);

  const spineY = (title ? 70 : 35) + (height - (title ? 70 : 35)) / 2;

  const boneGroup = document.createElementNS(svgNS, 'g');
  boneGroup.setAttribute('class', 'fishbone-bones');
  svg.appendChild(boneGroup);

  const textGroup = document.createElementNS(svgNS, 'g');
  textGroup.setAttribute('class', 'fishbone-texts');
  svg.appendChild(textGroup);

  // 背骨
  const spine = document.createElementNS(svgNS, 'line');
  spine.setAttribute('x1', spineStartX.toString());
  spine.setAttribute('y1', spineY.toString());
  spine.setAttribute('x2', spineEndX.toString());
  spine.setAttribute('y2', spineY.toString());
  spine.setAttribute('stroke', '#334155');
  spine.setAttribute('stroke-width', '3.5');
  spine.setAttribute('stroke-linecap', 'round');
  spine.setAttribute('marker-end', 'url(#fishbone-spine-arrow)');
  boneGroup.appendChild(spine);

  // 特性ボックス（魚の頭）
  const effectY = spineY;
  const effectG = document.createElementNS(svgNS, 'g');
  effectG.setAttribute('class', 'fishbone-effect-box');

  const effectBg = document.createElementNS(svgNS, 'rect');
  effectBg.setAttribute('x', effectX.toString());
  effectBg.setAttribute('y', (effectY - effectH / 2).toString());
  effectBg.setAttribute('width', effectW.toString());
  effectBg.setAttribute('height', effectH.toString());
  effectBg.setAttribute('rx', '8');
  effectBg.setAttribute('ry', '8');
  effectBg.setAttribute('fill', '#ffffff');
  effectBg.setAttribute('stroke', '#e11d48');
  effectBg.setAttribute('stroke-width', '2.2');
  effectBg.setAttribute('filter', 'url(#fishbone-shadow)');
  effectG.appendChild(effectBg);

  const effectBar = document.createElementNS(svgNS, 'rect');
  effectBar.setAttribute('x', effectX.toString());
  effectBar.setAttribute('y', (effectY - effectH / 2).toString());
  effectBar.setAttribute('width', '6');
  effectBar.setAttribute('height', effectH.toString());
  effectBar.setAttribute('rx', '3');
  effectBar.setAttribute('fill', '#e11d48');
  effectG.appendChild(effectBar);

  const effectTxt = document.createElementNS(svgNS, 'text');
  effectTxt.setAttribute('x', (effectX + effectW / 2 + 3).toString());
  effectTxt.setAttribute('y', (effectY + 5).toString());
  effectTxt.setAttribute('text-anchor', 'middle');
  effectTxt.setAttribute('font-family', "'Outfit', 'Inter', 'Noto Sans JP', sans-serif");
  effectTxt.setAttribute('font-size', '14');
  effectTxt.setAttribute('font-weight', '700');
  effectTxt.setAttribute('fill', '#9f1239');
  effectTxt.textContent = effect;
  effectG.appendChild(effectTxt);
  textGroup.appendChild(effectG);

  function renderCats(catList, isTop) {
    const numCats = catList.length;
    if (numCats === 0) return;
    const availStart = spineStartX + 90;
    const availEnd = spineEndX - 60;
    const stepX = (availEnd - availStart) / Math.max(numCats, 1);

    catList.forEach((cat, idx) => {
      const rootX = availStart + (idx + 0.5) * stepX + 30;
      const boneLengthY = 145;
      const boneDeltaX = 75;
      const headX = rootX - boneDeltaX;
      const headY = isTop ? (spineY - boneLengthY) : (spineY + boneLengthY);

      const mainBone = document.createElementNS(svgNS, 'line');
      mainBone.setAttribute('x1', headX.toString());
      mainBone.setAttribute('y1', headY.toString());
      mainBone.setAttribute('x2', rootX.toString());
      mainBone.setAttribute('y2', spineY.toString());
      mainBone.setAttribute('stroke', cat.color);
      mainBone.setAttribute('stroke-width', '2.4');
      mainBone.setAttribute('stroke-linecap', 'round');
      mainBone.setAttribute('marker-end', 'url(#fishbone-bone-arrow)');
      boneGroup.appendChild(mainBone);

      const catCardW = Math.max(Math.round(calcFishboneTextWidth(cat.name, true) + 24), 92);
      const catCardH = 30;
      const cardCenterY = isTop ? (headY - 17) : (headY + 17);

      const catCardG = document.createElementNS(svgNS, 'g');
      const cardBg = document.createElementNS(svgNS, 'rect');
      cardBg.setAttribute('x', (headX - catCardW / 2).toString());
      cardBg.setAttribute('y', (cardCenterY - catCardH / 2).toString());
      cardBg.setAttribute('width', catCardW.toString());
      cardBg.setAttribute('height', catCardH.toString());
      cardBg.setAttribute('rx', '6');
      cardBg.setAttribute('ry', '6');
      cardBg.setAttribute('fill', '#ffffff');
      cardBg.setAttribute('stroke', cat.color);
      cardBg.setAttribute('stroke-width', '1.8');
      cardBg.setAttribute('filter', 'url(#fishbone-shadow)');
      catCardG.appendChild(cardBg);

      const cardTxt = document.createElementNS(svgNS, 'text');
      cardTxt.setAttribute('x', headX.toString());
      cardTxt.setAttribute('y', (cardCenterY + 4.5).toString());
      cardTxt.setAttribute('text-anchor', 'middle');
      cardTxt.setAttribute('font-family', "'Outfit', 'Inter', 'Noto Sans JP', sans-serif");
      cardTxt.setAttribute('font-size', '13.5');
      cardTxt.setAttribute('font-weight', '700');
      cardTxt.setAttribute('fill', '#0f172a');
      cardTxt.textContent = cat.name;
      catCardG.appendChild(cardTxt);
      textGroup.appendChild(catCardG);

      const numCauses = cat.causes.length;
      if (numCauses === 0) return;

      cat.causes.forEach((cause, cIdx) => {
        const t = (cIdx + 1) / (numCauses + 1);
        const branchX = headX + (rootX - headX) * t;
        const branchY = headY + (spineY - headY) * t;

        const isHl = cause.isHighlight;
        const textW = calcFishboneTextWidth(cause.text, isHl);
        const boneGap = 18;
        const badgePadX = 8;
        const badgeW = Math.max(Math.round(textW + badgePadX * 2), 64);
        const badgeH = 22;

        const endBranchX = isHl ? (branchX - boneGap) : (branchX - (boneGap + textW + 8));
        const endBranchY = branchY;

        const subBone = document.createElementNS(svgNS, 'line');
        subBone.setAttribute('x1', endBranchX.toString());
        subBone.setAttribute('y1', endBranchY.toString());
        subBone.setAttribute('x2', branchX.toString());
        subBone.setAttribute('y2', branchY.toString());
        subBone.setAttribute('stroke', isHl ? '#ef4444' : '#94a3b8');
        subBone.setAttribute('stroke-width', isHl ? '2.0' : '1.3');
        subBone.setAttribute('stroke-linecap', 'round');
        boneGroup.appendChild(subBone);

        if (isHl) {
          const bgX = branchX - boneGap - badgeW;
          const bgY = branchY - badgeH / 2;
          const bgRect = document.createElementNS(svgNS, 'rect');
          bgRect.setAttribute('x', bgX.toString());
          bgRect.setAttribute('y', bgY.toString());
          bgRect.setAttribute('width', badgeW.toString());
          bgRect.setAttribute('height', badgeH.toString());
          bgRect.setAttribute('rx', '4');
          bgRect.setAttribute('ry', '4');
          bgRect.setAttribute('fill', '#fef2f2');
          bgRect.setAttribute('stroke', '#f87171');
          bgRect.setAttribute('stroke-width', '1');
          textGroup.appendChild(bgRect);

          const causeTxt = document.createElementNS(svgNS, 'text');
          causeTxt.setAttribute('x', (bgX + badgeW / 2).toString());
          causeTxt.setAttribute('y', (branchY + 4.5).toString());
          causeTxt.setAttribute('text-anchor', 'middle');
          causeTxt.setAttribute('font-family', "'Outfit', 'Inter', 'Noto Sans JP', sans-serif");
          causeTxt.setAttribute('font-size', '12.5');
          causeTxt.setAttribute('font-weight', '700');
          causeTxt.setAttribute('fill', '#b91c1c');
          causeTxt.textContent = cause.text;
          textGroup.appendChild(causeTxt);
        } else {
          const textX = branchX - boneGap;
          const textY = branchY - 4;
          const causeTxt = document.createElementNS(svgNS, 'text');
          causeTxt.setAttribute('x', textX.toString());
          causeTxt.setAttribute('y', textY.toString());
          causeTxt.setAttribute('text-anchor', 'end');
          causeTxt.setAttribute('font-family', "'Outfit', 'Inter', 'Noto Sans JP', sans-serif");
          causeTxt.setAttribute('font-size', '12.5');
          causeTxt.setAttribute('font-weight', '500');
          causeTxt.setAttribute('fill', '#334155');
          causeTxt.textContent = cause.text;
          textGroup.appendChild(causeTxt);
        }
      });
    });
  }

  renderCats(topCats, true);
  renderCats(bottomCats, false);

  appendSvg(container, svg);
}

/**
 * 形式2: 階層サブボックス型（Hierarchical / 2枚目画像準拠）
 */
function renderHierarchicalFishbone(parsed, container, svgNS) {
  const { title, subtitle, effect, categories } = parsed;
  const topCats = categories.filter(c => c.pos === 'top');
  const bottomCats = categories.filter(c => c.pos === 'bottom');
  const numCols = Math.max(topCats.length, bottomCats.length, 2);

  const width = 980;
  const height = title ? 620 : 570;
  const spineY = title ? 330 : 290;

  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.style.maxWidth = `${width}px`;
  svg.style.display = 'block';
  svg.style.margin = '0 auto';
  svg.setAttribute('class', 'fishbone-svg');

  renderTitle(svg, svgNS, title, subtitle, width);

  const spineStartX = 40;
  const spineEndX = 770;

  // 背骨（太い水色の水平ライン）
  const spine = document.createElementNS(svgNS, 'line');
  spine.setAttribute('x1', spineStartX.toString());
  spine.setAttribute('y1', spineY.toString());
  spine.setAttribute('x2', spineEndX.toString());
  spine.setAttribute('y2', spineY.toString());
  spine.setAttribute('stroke', '#0ea5e9');
  spine.setAttribute('stroke-width', '5.5');
  spine.setAttribute('stroke-linecap', 'round');
  svg.appendChild(spine);

  // 右端の円形ヘッド（問題提示）
  const circleCenterX = 875;
  const circleRadius = 56;

  // 上部の「問題提示」テキスト
  const labelTxt = document.createElementNS(svgNS, 'text');
  labelTxt.setAttribute('x', circleCenterX.toString());
  labelTxt.setAttribute('y', (spineY - circleRadius - 10).toString());
  labelTxt.setAttribute('text-anchor', 'middle');
  labelTxt.setAttribute('font-family', "'Outfit', 'Inter', 'Noto Sans JP', sans-serif");
  labelTxt.setAttribute('font-size', '13.5');
  labelTxt.setAttribute('font-weight', '700');
  labelTxt.setAttribute('fill', '#0284c7');
  labelTxt.textContent = '問題提示';
  svg.appendChild(labelTxt);

  // 円ノード
  const circle = document.createElementNS(svgNS, 'circle');
  circle.setAttribute('cx', circleCenterX.toString());
  circle.setAttribute('cy', spineY.toString());
  circle.setAttribute('r', circleRadius.toString());
  circle.setAttribute('fill', '#0284c7');
  svg.appendChild(circle);

  // 円内テキスト（2行に分割して中央揃え）
  const effectTxt = document.createElementNS(svgNS, 'text');
  effectTxt.setAttribute('x', circleCenterX.toString());
  effectTxt.setAttribute('text-anchor', 'middle');
  effectTxt.setAttribute('font-family', "'Outfit', 'Inter', 'Noto Sans JP', sans-serif");
  effectTxt.setAttribute('font-size', '13');
  effectTxt.setAttribute('font-weight', '700');
  effectTxt.setAttribute('fill', '#ffffff');

  // テキストの簡易改行
  let line1 = effect;
  let line2 = '';
  if (effect.length > 7) {
    const half = Math.ceil(effect.length / 2);
    line1 = effect.substring(0, half);
    line2 = effect.substring(half);
  }

  if (line2) {
    const tspan1 = document.createElementNS(svgNS, 'tspan');
    tspan1.setAttribute('x', circleCenterX.toString());
    tspan1.setAttribute('y', (spineY - 5).toString());
    tspan1.textContent = line1;
    const tspan2 = document.createElementNS(svgNS, 'tspan');
    tspan2.setAttribute('x', circleCenterX.toString());
    tspan2.setAttribute('y', (spineY + 14).toString());
    tspan2.textContent = line2;
    effectTxt.appendChild(tspan1);
    effectTxt.appendChild(tspan2);
  } else {
    effectTxt.setAttribute('y', (spineY + 5).toString());
    effectTxt.textContent = line1;
  }
  svg.appendChild(effectTxt);

  // カテゴリ（大骨）の描画
  function renderHierarchicalCats(catList, isTop) {
    const count = catList.length;
    if (count === 0) return;
    const colWidth = (spineEndX - spineStartX - 40) / count;

    catList.forEach((cat, cIdx) => {
      const colX = spineStartX + 40 + (cIdx + 0.5) * colWidth;
      const boneLineX = colX - 70;

      // 背骨上の二重円ノード (◎)
      const outerRing = document.createElementNS(svgNS, 'circle');
      outerRing.setAttribute('cx', boneLineX.toString());
      outerRing.setAttribute('cy', spineY.toString());
      outerRing.setAttribute('r', '13');
      outerRing.setAttribute('fill', '#e0f2fe');
      outerRing.setAttribute('stroke', '#0ea5e9');
      outerRing.setAttribute('stroke-width', '2.5');
      svg.appendChild(outerRing);

      const innerDot = document.createElementNS(svgNS, 'circle');
      innerDot.setAttribute('cx', boneLineX.toString());
      innerDot.setAttribute('cy', spineY.toString());
      innerDot.setAttribute('r', '5');
      innerDot.setAttribute('fill', '#0284c7');
      svg.appendChild(innerDot);

      // 大骨の垂直ライン
      const headerY = isTop ? (title ? 70 : 40) : (height - 45);
      const mainBone = document.createElementNS(svgNS, 'line');
      mainBone.setAttribute('x1', boneLineX.toString());
      mainBone.setAttribute('y1', spineY.toString());
      mainBone.setAttribute('x2', boneLineX.toString());
      mainBone.setAttribute('y2', (isTop ? headerY + 28 : headerY).toString());
      mainBone.setAttribute('stroke', '#0ea5e9');
      mainBone.setAttribute('stroke-width', '3');
      svg.appendChild(mainBone);

      // カテゴリヘッダー（四角いバナー）
      const headW = 140;
      const headH = 30;
      const headRect = document.createElementNS(svgNS, 'rect');
      headRect.setAttribute('x', (boneLineX - 10).toString());
      headRect.setAttribute('y', (isTop ? headerY : headerY - 5).toString());
      headRect.setAttribute('width', headW.toString());
      headRect.setAttribute('height', headH.toString());
      headRect.setAttribute('rx', '2');
      headRect.setAttribute('fill', '#0284c7');
      svg.appendChild(headRect);

      const headTxt = document.createElementNS(svgNS, 'text');
      headTxt.setAttribute('x', (boneLineX - 10 + headW / 2).toString());
      headTxt.setAttribute('y', (isTop ? headerY + 20 : headerY + 15).toString());
      headTxt.setAttribute('text-anchor', 'middle');
      headTxt.setAttribute('font-family', "'Outfit', 'Inter', 'Noto Sans JP', sans-serif");
      headTxt.setAttribute('font-size', '13.5');
      headTxt.setAttribute('font-weight', '700');
      headTxt.setAttribute('fill', '#ffffff');
      headTxt.textContent = cat.name;
      svg.appendChild(headTxt);

      // 要因（サブボックス & 小骨リスト）
      const numCauses = cat.causes.length;
      if (numCauses === 0) return;

      const boxW = 210;
      const boxH = 24;
      const startY = isTop ? (headerY + 45) : (spineY + 25);
      const totalAvailableH = isTop ? (spineY - headerY - 55) : (headerY - spineY - 35);
      const stepY = totalAvailableH / numCauses;

      cat.causes.forEach((cause, idx) => {
        const itemY = startY + idx * stepY;
        const boxX = boneLineX + 8;

        // 水平接続線
        const connLine = document.createElementNS(svgNS, 'line');
        connLine.setAttribute('x1', boneLineX.toString());
        connLine.setAttribute('y1', (itemY + boxH / 2).toString());
        connLine.setAttribute('x2', boxX.toString());
        connLine.setAttribute('y2', (itemY + boxH / 2).toString());
        connLine.setAttribute('stroke', '#0ea5e9');
        connLine.setAttribute('stroke-width', '1.8');
        svg.appendChild(connLine);

        // サブボックス
        const box = document.createElementNS(svgNS, 'rect');
        box.setAttribute('x', boxX.toString());
        box.setAttribute('y', itemY.toString());
        box.setAttribute('width', boxW.toString());
        box.setAttribute('height', boxH.toString());
        box.setAttribute('rx', '2');
        box.setAttribute('fill', '#ffffff');
        box.setAttribute('stroke', cause.isHighlight ? '#ef4444' : '#0ea5e9');
        box.setAttribute('stroke-width', '1.6');
        svg.appendChild(box);

        // ボックステキスト
        const bTxt = document.createElementNS(svgNS, 'text');
        bTxt.setAttribute('x', (boxX + 8).toString());
        bTxt.setAttribute('y', (itemY + 16).toString());
        bTxt.setAttribute('font-family', "'Outfit', 'Inter', 'Noto Sans JP', sans-serif");
        bTxt.setAttribute('font-size', '11.5');
        bTxt.setAttribute('font-weight', '600');
        bTxt.setAttribute('fill', cause.isHighlight ? '#b91c1c' : '#0f172a');
        bTxt.textContent = cause.text;
        svg.appendChild(bTxt);

        // 小骨リスト（subCauses）がある場合
        if (cause.subCauses && cause.subCauses.length > 0) {
          cause.subCauses.forEach((subText, sIdx) => {
            const subY = itemY + boxH + 14 + sIdx * 13;
            // 折れ線インジケータ
            const subLine = document.createElementNS(svgNS, 'line');
            subLine.setAttribute('x1', (boxX + 16).toString());
            subLine.setAttribute('y1', subY.toString());
            subLine.setAttribute('x2', (boxX + 26).toString());
            subLine.setAttribute('y2', subY.toString());
            subLine.setAttribute('stroke', '#38bdf8');
            subLine.setAttribute('stroke-width', '1.2');
            svg.appendChild(subLine);

            const sTxt = document.createElementNS(svgNS, 'text');
            sTxt.setAttribute('x', (boxX + 30).toString());
            sTxt.setAttribute('y', (subY + 3.5).toString());
            sTxt.setAttribute('font-family', "'Outfit', 'Inter', 'Noto Sans JP', sans-serif");
            sTxt.setAttribute('font-size', '10.5');
            sTxt.setAttribute('font-weight', '500');
            sTxt.setAttribute('fill', '#475569');
            sTxt.textContent = subText;
            svg.appendChild(sTxt);
          });
        }
      });
    });
  }

  renderHierarchicalCats(topCats, true);
  renderHierarchicalCats(bottomCats, false);

  appendSvg(container, svg);
}

/**
 * 形式3: モダンピル・カード型（Pill / 3枚目画像準拠）
 */
function renderPillFishbone(parsed, container, svgNS) {
  const { title, subtitle, effect, categories } = parsed;
  const topCats = categories.filter(c => c.pos === 'top');
  const bottomCats = categories.filter(c => c.pos === 'bottom');

  // 右端の「結果 / 事実」カードの寸法を文字長に応じて動的計算
  const approxEffectW = calcFishboneTextWidth(effect, true);
  const effectW = Math.max(Math.round(approxEffectW + 52), 160);
  const effectH = 68;

  const spineStartX = 170;
  const spineEndX = 750;
  const effectX = spineEndX + 36;

  // 右端の余白を十分に確保した全体寸法
  const width = Math.max(1040, effectX + effectW + 48);
  const height = title ? 600 : 540;
  const spineY = title ? 295 : 260;

  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.style.maxWidth = `${width}px`;
  svg.style.display = 'block';
  svg.style.margin = '0 auto';
  svg.setAttribute('class', 'fishbone-svg');

  renderTitle(svg, svgNS, title, subtitle, width);

  // 背骨（太い矢印）
  const spineBody = document.createElementNS(svgNS, 'rect');
  spineBody.setAttribute('x', spineStartX.toString());
  spineBody.setAttribute('y', (spineY - 8).toString());
  spineBody.setAttribute('width', (spineEndX - spineStartX).toString());
  spineBody.setAttribute('height', '16');
  spineBody.setAttribute('rx', '8');
  spineBody.setAttribute('fill', '#6366f1');
  svg.appendChild(spineBody);

  const spineHead = document.createElementNS(svgNS, 'polygon');
  spineHead.setAttribute('points', `${spineEndX},${spineY - 20} ${spineEndX + 28},${spineY} ${spineEndX},${spineY + 20}`);
  spineHead.setAttribute('fill', '#6366f1');
  svg.appendChild(spineHead);

  // 右端の「結果 / 事実」カード
  const effectCardY = spineY - effectH / 2;

  const effectRect = document.createElementNS(svgNS, 'rect');
  effectRect.setAttribute('x', effectX.toString());
  effectRect.setAttribute('y', effectCardY.toString());
  effectRect.setAttribute('width', effectW.toString());
  effectRect.setAttribute('height', effectH.toString());
  effectRect.setAttribute('rx', '10');
  effectRect.setAttribute('fill', '#4f46e5');
  svg.appendChild(effectRect);

  const effectTxt = document.createElementNS(svgNS, 'text');
  effectTxt.setAttribute('x', (effectX + effectW / 2).toString());
  effectTxt.setAttribute('y', (spineY + 5.5).toString());
  effectTxt.setAttribute('text-anchor', 'middle');
  effectTxt.setAttribute('font-family', "'Outfit', 'Inter', 'Noto Sans JP', sans-serif");
  effectTxt.setAttribute('font-size', '14.5');
  effectTxt.setAttribute('font-weight', '700');
  effectTxt.setAttribute('fill', '#ffffff');
  effectTxt.textContent = effect;
  svg.appendChild(effectTxt);

  // 番号バッジ「①」
  renderBadge(svg, svgNS, effectX + effectW + 6, effectCardY - 4, '1');

  // 大骨と中骨の描画
  function renderPillCats(catList, isTop) {
    const count = catList.length;
    if (count === 0) return;
    const stepX = (spineEndX - spineStartX - 70) / count;

    catList.forEach((cat, idx) => {
      const rootX = spineStartX + 50 + (idx + 0.6) * stepX;
      const boneLenY = 135;
      const boneDeltaX = 90;
      const headX = rootX - boneDeltaX;
      const headY = isTop ? (spineY - boneLenY) : (spineY + boneLenY);

      // 大骨の太い矢印ライン
      const boneLine = document.createElementNS(svgNS, 'line');
      boneLine.setAttribute('x1', headX.toString());
      boneLine.setAttribute('y1', headY.toString());
      boneLine.setAttribute('x2', (rootX - (isTop ? 14 : 14)).toString());
      boneLine.setAttribute('y2', (spineY - (isTop ? 12 : -12)).toString());
      boneLine.setAttribute('stroke', '#818cf8');
      boneLine.setAttribute('stroke-width', '10');
      boneLine.setAttribute('stroke-linecap', 'round');
      svg.appendChild(boneLine);

      // 先端の矢印三角
      const arrowTip = document.createElementNS(svgNS, 'polygon');
      if (isTop) {
        arrowTip.setAttribute('points', `${rootX - 4},${spineY - 4} ${rootX - 22},${spineY - 26} ${rootX},${spineY - 18}`);
      } else {
        arrowTip.setAttribute('points', `${rootX - 4},${spineY + 4} ${rootX - 22},${spineY + 26} ${rootX},${spineY + 18}`);
      }
      arrowTip.setAttribute('fill', '#818cf8');
      svg.appendChild(arrowTip);

      // 大骨先端のカード（原因 / 要因）: 文字長に応じて動的に幅を計算
      const cardW = Math.max(Math.round(calcFishboneTextWidth(cat.name, true) + 36), 130);
      const cardH = 34;
      const cardX = headX - cardW / 2;
      const cardY = isTop ? (headY - cardH - 8) : (headY + 8);

      const catCard = document.createElementNS(svgNS, 'rect');
      catCard.setAttribute('x', cardX.toString());
      catCard.setAttribute('y', cardY.toString());
      catCard.setAttribute('width', cardW.toString());
      catCard.setAttribute('height', cardH.toString());
      catCard.setAttribute('rx', '8');
      catCard.setAttribute('fill', '#4f46e5');
      svg.appendChild(catCard);

      const catTxt = document.createElementNS(svgNS, 'text');
      catTxt.setAttribute('x', (cardX + cardW / 2).toString());
      catTxt.setAttribute('y', (cardY + 21.5).toString());
      catTxt.setAttribute('text-anchor', 'middle');
      catTxt.setAttribute('font-family', "'Outfit', 'Inter', 'Noto Sans JP', sans-serif");
      catTxt.setAttribute('font-size', '13.5');
      catTxt.setAttribute('font-weight', '700');
      catTxt.setAttribute('fill', '#ffffff');
      catTxt.textContent = cat.name;
      svg.appendChild(catTxt);

      // 番号バッジ「②」
      renderBadge(svg, svgNS, cardX + cardW + 4, cardY - 4, '2');

      // 中骨（角丸ピル形状カード）
      const numCauses = cat.causes.length;
      if (numCauses === 0) return;

      cat.causes.forEach((cause, cIdx) => {
        const t = (cIdx + 1) / (numCauses + 1);
        const bx = headX + (rootX - headX) * t;
        const by = headY + (spineY - headY) * t;

        // ピルの左右パディングを 36px に広げて文字にゆとりを持たせる
        const pillW = Math.max(Math.round(calcFishboneTextWidth(cause.text, true) + 36), 104);
        const pillH = 26;
        const pillX = bx - pillW - 20;
        const pillY = by - pillH / 2;

        const pillBg = document.createElementNS(svgNS, 'rect');
        pillBg.setAttribute('x', pillX.toString());
        pillBg.setAttribute('y', pillY.toString());
        pillBg.setAttribute('width', pillW.toString());
        pillBg.setAttribute('height', pillH.toString());
        pillBg.setAttribute('rx', '13');
        pillBg.setAttribute('ry', '13');
        pillBg.setAttribute('fill', cause.isHighlight ? '#ef4444' : '#3b82f6');
        svg.appendChild(pillBg);

        const pillTxt = document.createElementNS(svgNS, 'text');
        pillTxt.setAttribute('x', (pillX + pillW / 2).toString());
        pillTxt.setAttribute('y', (pillY + 17.5).toString());
        pillTxt.setAttribute('text-anchor', 'middle');
        pillTxt.setAttribute('font-family', "'Outfit', 'Inter', 'Noto Sans JP', sans-serif");
        pillTxt.setAttribute('font-size', '12');
        pillTxt.setAttribute('font-weight', '600');
        pillTxt.setAttribute('fill', '#ffffff');
        pillTxt.textContent = cause.text;
        svg.appendChild(pillTxt);

        // 番号バッジ「③」
        if (cIdx === 0 && idx === 0) {
          renderBadge(svg, svgNS, pillX - 10, pillY + pillH / 2, '3');
        }
      });
    });
  }

  renderPillCats(topCats, true);
  renderPillCats(bottomCats, false);

  appendSvg(container, svg);
}

/**
 * 補助: タイトル描画
 */
function renderTitle(svg, svgNS, title, subtitle, width) {
  if (!title) return;
  const titleEl = document.createElementNS(svgNS, 'text');
  titleEl.setAttribute('x', (width / 2).toString());
  titleEl.setAttribute('y', '32');
  titleEl.setAttribute('text-anchor', 'middle');
  titleEl.setAttribute('font-family', "'Outfit', 'Inter', 'Noto Sans JP', sans-serif");
  titleEl.setAttribute('font-size', '17');
  titleEl.setAttribute('font-weight', '700');
  titleEl.setAttribute('fill', '#0f172a');
  titleEl.textContent = title;
  svg.appendChild(titleEl);

  if (subtitle) {
    const subEl = document.createElementNS(svgNS, 'text');
    subEl.setAttribute('x', (width / 2).toString());
    subEl.setAttribute('y', '52');
    subEl.setAttribute('text-anchor', 'middle');
    subEl.setAttribute('font-family', "'Outfit', 'Inter', 'Noto Sans JP', sans-serif");
    subEl.setAttribute('font-size', '12');
    subEl.setAttribute('font-weight', '400');
    subEl.setAttribute('fill', '#64748b');
    subEl.textContent = subtitle;
    svg.appendChild(subEl);
  }
}

/**
 * 補助: 丸番号バッジ描画
 */
function renderBadge(svg, svgNS, cx, cy, numStr) {
  const g = document.createElementNS(svgNS, 'g');
  const circle = document.createElementNS(svgNS, 'circle');
  circle.setAttribute('cx', cx.toString());
  circle.setAttribute('cy', cy.toString());
  circle.setAttribute('r', '10.5');
  circle.setAttribute('fill', '#f87171');
  g.appendChild(circle);

  const txt = document.createElementNS(svgNS, 'text');
  txt.setAttribute('x', cx.toString());
  txt.setAttribute('y', (cy + 4).toString());
  txt.setAttribute('text-anchor', 'middle');
  txt.setAttribute('font-family', "'Outfit', 'Inter', 'Noto Sans JP', sans-serif");
  txt.setAttribute('font-size', '11.5');
  txt.setAttribute('font-weight', '700');
  txt.setAttribute('fill', '#ffffff');
  txt.textContent = numStr;
  g.appendChild(txt);

  svg.appendChild(g);
}

/**
 * 補助: コンテナへのSVGマウント
 */
function appendSvg(container, svg) {
  const wrapper = document.createElement('div');
  wrapper.className = 'fishbone-container';
  wrapper.style.display = 'flex';
  wrapper.style.justifyContent = 'center';
  wrapper.style.alignItems = 'center';
  wrapper.style.width = '100%';
  wrapper.style.overflowX = 'auto';
  wrapper.appendChild(svg);
  container.appendChild(wrapper);
}

function drawFishbone(text, container, labelText) {
  drawFishboneSvg(text, container, labelText);
}
