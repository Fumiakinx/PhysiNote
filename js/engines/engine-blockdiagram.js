// ==========================================
// ブロック図 / システム構成図 (Block Diagram) パーサー & SVG描画エンジン
// ==========================================

function splitBlockLines(str) {
  if (!str) return [];
  return String(str)
    .split(/\\n|[¥￥]n|\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function getBlockTextWidth(str) {
  if (!str) return 0;
  const lines = splitBlockLines(str);
  if (lines.length === 0) return 0;
  return Math.max(
    ...lines.map((line) => {
      let w = 0;
      for (let i = 0; i < line.length; i++) {
        w += line.charCodeAt(i) > 255 ? 13 : 8;
      }
      return w;
    })
  );
}

function escapeBlockHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * \blockdiagram{ ... } 構文のパース
 */
function parseBlockDiagram(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;
  let text = rawText.trim();

  // \blockdiagram{...} または \sysblock{...} のラッパーを解除
  const wrapperMatch = text.match(/^\\(?:blockdiagram|sysblock|block)\{([\s\S]*)\}$/i);
  if (wrapperMatch) {
    text = wrapperMatch[1].trim();
  }

  let title = '';
  const rawEdges = []; // { from, to, label, sign }
  const definedNodes = new Map(); // id -> { name, label, type, color }

  const lines = text.split(/[\n;]+/).map((l) => l.trim()).filter(Boolean);

  lines.forEach((line) => {
    // タイトル行: title: "..."
    const titleMatch = line.match(/^title\s*:\s*["']?([^"']+)["']?$/i);
    if (titleMatch) {
      title = titleMatch[1].trim();
      return;
    }

    // ブロック明示定義: block: "名前" [ラベル/伝達関数, 色]
    const blockMatch = line.match(/^block\s*:\s*["']?([^"'\(\[\{]+?)["']?(?:\s*\[(.*?)\])?$/i);
    if (blockMatch) {
      const id = blockMatch[1].trim();
      let subLabel = '';
      let color = '';
      if (blockMatch[2]) {
        const parts = blockMatch[2].split(',').map((p) => p.trim());
        subLabel = parts[0] || '';
        color = parts[1] || '';
      }
      definedNodes.set(id, { id, name: id, subLabel, type: 'block', color });
      return;
    }

    // エッジ定義（連鎖 A -> B -> C にも対応）
    // 例: "目標値 R(s)" -> sum1 [+];
    // 例: sum1 -> "コントローラ C(s)" [偏差 E(s)];
    const edgeParts = line.split('->').map((p) => p.trim());
    if (edgeParts.length >= 2) {
      for (let i = 0; i < edgeParts.length - 1; i++) {
        let fromPart = edgeParts[i];
        let toPart = edgeParts[i + 1];

        // 前のパートの末尾にある属性ブラケットを除去
        fromPart = fromPart.replace(/\[[^\]]*\]$/, '').trim();

        // 属性 [ラベル, 符号] の抽出
        let label = '';
        let sign = '';
        const attrMatch = toPart.match(/\[(.*?)\]$/);
        if (attrMatch) {
          const rawAttr = attrMatch[1].trim();
          toPart = toPart.replace(/\[[^\]]*\]$/, '').trim();

          // 符号（+, -）または信号ラベルの判定
          if (rawAttr === '+' || rawAttr === '-' || rawAttr === '+-' || rawAttr === '-+') {
            sign = rawAttr;
          } else if (rawAttr.includes(',')) {
            const parts = rawAttr.split(',').map((p) => p.trim());
            label = parts[0] || '';
            sign = parts[1] || '';
          } else {
            label = rawAttr;
          }
        }

        const fromClean = fromPart.replace(/^["']|["']$/g, '').trim();
        const toClean = toPart.replace(/^["']|["']$/g, '').trim();

        if (fromClean && toClean) {
          rawEdges.push({ from: fromClean, to: toClean, label, sign });
        }
      }
    }
  });

  if (rawEdges.length === 0) return null;

  // ノードマップ作成
  const nodeMap = new Map();
  function getOrCreateNode(name) {
    if (!nodeMap.has(name)) {
      const isSum = /^sum\d*$/i.test(name) || name === '+' || name === '加算器' || name === '比較器';
      const def = definedNodes.get(name) || {};

      // サブラベル（伝達関数）の自動判定: "コントローラ C(s)" -> title: "コントローラ", sub: "C(s)"
      let titleName = name;
      let subLabel = def.subLabel || '';
      if (!subLabel && !isSum) {
        const parenMatch = name.match(/^(.*?)\s*[\(\（]([^\)\）]+)[\)\）]$/);
        if (parenMatch) {
          titleName = parenMatch[1].trim();
          subLabel = parenMatch[2].trim();
        }
      }

      nodeMap.set(name, {
        id: name,
        name: titleName,
        subLabel: subLabel,
        type: isSum ? 'sum' : 'block',
        color: def.color || '',
        inEdges: [],
        outEdges: [],
        x: 0,
        y: 0,
        w: isSum ? 36 : 120,
        h: isSum ? 36 : 56,
        isTerminal: false,
        isFeedback: false,
        isDisturbance: false,
      });
    }
    return nodeMap.get(name);
  }

  rawEdges.forEach((e) => {
    const fromNode = getOrCreateNode(e.from);
    const toNode = getOrCreateNode(e.to);
    fromNode.outEdges.push({ to: toNode, edge: e });
    toNode.inEdges.push({ from: fromNode, edge: e });
  });

  // 端点ノード（入次数0または出次数0で、ブロックではなく信号名そのもののノード）の判定
  nodeMap.forEach((n) => {
    if (n.type !== 'sum') {
      const isInput = n.inEdges.length === 0 && n.outEdges.length > 0;
      const isOutput = n.outEdges.length === 0 && n.inEdges.length > 0;
      const nameLines = splitBlockLines(n.name || n.id);
      const extraH = Math.max(0, nameLines.length - 1) * 16;

      // 名前に "入力", "出力", "目標", "外乱" や括弧を含む単一信号の場合、または明示端点
      if ((isInput || isOutput) && !definedNodes.has(n.id)) {
        n.isTerminal = true;
        n.w = Math.max(getBlockTextWidth(n.id) + 16, 60);
        n.h = 32 + extraH;
      } else {
        const maxTextW = Math.max(getBlockTextWidth(n.name), getBlockTextWidth(n.subLabel));
        n.w = Math.max(maxTextW + 36, 120);
        n.h = (n.subLabel ? 58 : 46) + extraH;
      }
    }
  });

  // ==========================================
  // トポロジカル・レイアウト（前進パスとフィードバックループ）
  // ==========================================
  // 1. 入力ノードの探索
  const entryNodes = [];
  nodeMap.forEach((n) => {
    if (n.inEdges.length === 0) {
      entryNodes.push(n);
    }
  });

  // 主入力ノード（外乱ではないメインの入力、通常最初のエッジのfrom）
  const mainInput = entryNodes.length > 0 ? entryNodes[0] : nodeMap.values().next().value;

  // 2. メインストリーム（前進パス）の決定
  // mainInput から順方向エッジのみを辿る
  const mainPath = [];
  const visitedMain = new Set();
  let current = mainInput;

  while (current && !visitedMain.has(current.id)) {
    visitedMain.add(current.id);
    mainPath.push(current);

    // 次の候補（フィードバック・逆流ではない前方ノード）
    let nextNode = null;
    for (const outItem of current.outEdges) {
      const cand = outItem.to;
      if (!visitedMain.has(cand.id)) {
        nextNode = cand;
        break;
      }
    }
    current = nextNode;
  }

  // 3. フィードバックノードおよび外乱ノードの分類
  const feedbackNodes = [];
  const disturbanceNodes = [];
  const feedbackEdges = [];

  rawEdges.forEach((e) => {
    const fromIdx = mainPath.findIndex((n) => n.id === e.from);
    const toIdx = mainPath.findIndex((n) => n.id === e.to);

    // メインパス上の後方から前方へのエッジ -> フィードバック
    if (fromIdx !== -1 && toIdx !== -1 && fromIdx > toIdx) {
      feedbackEdges.push(e);
      return;
    }

    // メインパス外のノードの判定
    const fromNode = nodeMap.get(e.from);
    const toNode = nodeMap.get(e.to);

    if (toIdx !== -1 && fromIdx === -1) {
      // メインパスの加算器等に入る外部ノード
      if (fromNode && !visitedMain.has(fromNode.id)) {
        // フィードバック経由か外乱かの判定
        const hasFeedbackParent = fromNode.inEdges.some((inItem) => {
          const pIdx = mainPath.findIndex((m) => m.id === inItem.from.id);
          return pIdx > toIdx;
        });

        if (hasFeedbackParent) {
          fromNode.isFeedback = true;
          feedbackNodes.push(fromNode);
        } else {
          fromNode.isDisturbance = true;
          disturbanceNodes.push(fromNode);
        }
      }
    }
  });

  // 4. メインストリームの座標計算（タイトル下余白をしっかり確保）
  const startX = 40;
  const hasDist = disturbanceNodes.length > 0;
  const distY = title ? 104 : 64; // タイトル下線 (Y=44) から約35pxの余白を空けて上段ノードを配置
  const mainY = hasDist ? distY + 95 : (title ? 125 : 90);

  let curX = startX;
  mainPath.forEach((n, idx) => {
    n.y = mainY - n.h / 2;
    n.x = curX;

    // ラベルの長さに応じてブロック間隔（gap）を自動確保し、左右のノードとの接触・重複を防止
    let gap = 52;
    if (idx < mainPath.length - 1) {
      const nextN = mainPath[idx + 1];
      const connectingEdge = rawEdges.find((e) => e.from === n.id && e.to === nextN.id);
      if (connectingEdge && connectingEdge.label) {
        const labelW = getBlockTextWidth(connectingEdge.label);
        gap = Math.max(52, Math.round(labelW + 32));
      }
    }
    curX += n.w + gap;
  });

  // 5. 外乱ノードおよびその上流ノード群の配置（加算器の上部）
  disturbanceNodes.forEach((distNode) => {
    let targetSum = null;
    if (distNode.outEdges.length > 0) {
      targetSum = distNode.outEdges[0].to;
    }
    if (targetSum) {
      distNode.x = targetSum.x + (targetSum.w - distNode.w) / 2;
      distNode.y = distY - distNode.h / 2;
    } else {
      distNode.x = startX;
      distNode.y = distY - distNode.h / 2;
    }

    // distNode の上流ノード（親ノード群）を左側に水平連鎖配置
    let childNode = distNode;
    const visitedBranch = new Set([childNode.id]);
    while (childNode.inEdges.length > 0) {
      const parentNode = childNode.inEdges[0].from;
      if (mainPath.some((m) => m.id === parentNode.id) || visitedBranch.has(parentNode.id)) break;
      visitedBranch.add(parentNode.id);

      const inEdge = childNode.inEdges[0].edge;
      let branchGap = 52;
      if (inEdge && inEdge.label) {
        branchGap = Math.max(52, Math.round(getBlockTextWidth(inEdge.label) + 32));
      }
      parentNode.x = childNode.x - parentNode.w - branchGap;
      parentNode.y = childNode.y + (childNode.h - parentNode.h) / 2;
      childNode = parentNode;
    }
  });

  // 左端が startX より左に出ていれば全体を右にシフト
  let minAllX = Infinity;
  nodeMap.forEach((n) => {
    if (n.x < minAllX) minAllX = n.x;
  });
  if (minAllX < startX) {
    const shift = startX - minAllX;
    nodeMap.forEach((n) => {
      n.x += shift;
    });
    curX += shift;
  }

  // 6. フィードバックノードの配置（メインストリームの下部）
  feedbackNodes.forEach((fbNode) => {
    // 入力元（メインパスの右側）と出力先（メインパスの左側）の中間付近
    let fromX = curX;
    let toX = startX;
    if (fbNode.inEdges.length > 0) {
      fromX = fbNode.inEdges[0].from.x;
    }
    if (fbNode.outEdges.length > 0) {
      toX = fbNode.outEdges[0].to.x;
    }
    fbNode.x = (fromX + toX) / 2 - fbNode.w / 2;
    fbNode.y = mainY + 95 - fbNode.h / 2;
  });

  // 7. 寸法算出
  let maxX = curX;
  let maxY = mainY + 120;
  nodeMap.forEach((n) => {
    if (n.x + n.w > maxX) maxX = n.x + n.w;
    if (n.y + n.h > maxY) maxY = n.y + n.h;
  });

  const totalW = Math.max(Math.round(maxX + 48), 780);
  const totalH = Math.max(Math.round(maxY + 48), hasDist ? (title ? 330 : 290) : (title ? 260 : 210));

  return {
    title,
    nodes: Array.from(nodeMap.values()),
    edges: rawEdges,
    mainPath,
    feedbackNodes,
    disturbanceNodes,
    mainY,
    totalW,
    totalH,
  };
}

/**
 * ブロック図のSVG描画
 */
function drawBlockDiagramSvg(code, container, labelText) {
  container.innerHTML = '';
  const parsed = parseBlockDiagram(code);
  if (!parsed) {
    const err = document.createElement('div');
    err.className = 'chem-render-error';
    err.textContent = 'ブロック図の構文エラー: "入力" -> sum1 -> "コントローラ" -> "出力" のような接続構文が必要です。';
    container.appendChild(err);
    return;
  }

  const { title, nodes, edges, mainPath, feedbackNodes, disturbanceNodes, mainY, totalW, totalH } = parsed;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${totalW} ${totalH}`);
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.setAttribute('class', 'blockdiagram-svg');
  svg.style.maxWidth = `${totalW}px`;
  svg.style.margin = '0 auto';
  svg.style.display = 'block';
  svg.style.background = '#ffffff';
  svg.style.borderRadius = '12px';
  svg.style.overflow = 'hidden';

  // 矢印マーカーとシャドウの定義
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  defs.innerHTML = `
    <marker id="bd-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
      <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#0f172a" />
    </marker>
    <filter id="bd-shadow" x="-10%" y="-15%" width="120%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#0f172a" flood-opacity="0.08" />
    </filter>
  `;
  svg.appendChild(defs);

  // タイトル描画
  if (title) {
    const titleG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const titleText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    titleText.setAttribute('x', totalW / 2);
    titleText.setAttribute('y', '34');
    titleText.setAttribute('text-anchor', 'middle');
    titleText.setAttribute('font-size', '17');
    titleText.setAttribute('font-weight', '800');
    titleText.setAttribute('fill', '#0f172a');
    titleText.setAttribute('font-family', 'system-ui, -apple-system, sans-serif');
    titleText.textContent = title;
    titleG.appendChild(titleText);

    const titleLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    titleLine.setAttribute('x1', totalW / 2 - 100);
    titleLine.setAttribute('y1', '44');
    titleLine.setAttribute('x2', totalW / 2 + 100);
    titleLine.setAttribute('y2', '44');
    titleLine.setAttribute('stroke', '#e2e8f0');
    titleLine.setAttribute('stroke-width', '2');
    titleG.appendChild(titleLine);

    svg.appendChild(titleG);
  }

  // 信号線グループ
  const edgeG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  edgeG.setAttribute('class', 'bd-edges');

  // ラベルグループ
  const labelG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  labelG.setAttribute('class', 'bd-labels');

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  edges.forEach((e) => {
    const p1 = nodeMap.get(e.from);
    const p2 = nodeMap.get(e.to);
    if (!p1 || !p2) return;

    // 1. 外乱ライン（上から下へ加算器に入る）
    if (p1.isDisturbance) {
      const startX = p1.x + p1.w / 2;
      const startY = p1.y + p1.h;
      const endX = p2.x + p2.w / 2;
      const endY = p2.y;

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', `M ${startX} ${startY} L ${endX} ${endY}`);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', '#0f172a');
      path.setAttribute('stroke-width', '1.8');
      path.setAttribute('marker-end', 'url(#bd-arrow)');
      edgeG.appendChild(path);

      // 符号（+または-）の描画
      if (e.sign) {
        const signTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        signTxt.setAttribute('x', endX + 8);
        signTxt.setAttribute('y', endY - 6);
        signTxt.setAttribute('font-size', '12');
        signTxt.setAttribute('font-weight', '800');
        signTxt.setAttribute('fill', '#0284c7');
        signTxt.setAttribute('font-family', 'sans-serif');
        signTxt.textContent = e.sign;
        labelG.appendChild(signTxt);
      }

      // 外乱ラインのラベル（縦線右横）
      if (e.label) {
        const lines = splitBlockLines(e.label);
        if (lines.length > 0) {
          const midY = (startY + endY) / 2;
          const lineH = 15;
          const th = lines.length * lineH + 6;
          const tw = getBlockTextWidth(e.label) + 14;
          const lx = startX + 10;
          const bgTopY = midY - th / 2;

          const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          bg.setAttribute('x', lx);
          bg.setAttribute('y', bgTopY.toFixed(1));
          bg.setAttribute('width', tw.toFixed(1));
          bg.setAttribute('height', th.toFixed(1));
          bg.setAttribute('rx', '4');
          bg.setAttribute('fill', '#ffffff');
          bg.setAttribute('fill-opacity', '0.94');
          bg.setAttribute('stroke', '#e0f2fe');
          bg.setAttribute('stroke-width', '1');
          labelG.appendChild(bg);

          const labelTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          labelTxt.setAttribute('x', (lx + tw / 2).toFixed(1));
          labelTxt.setAttribute('y', (bgTopY + lineH - 1).toFixed(1));
          labelTxt.setAttribute('text-anchor', 'middle');
          labelTxt.setAttribute('font-size', '11.5');
          labelTxt.setAttribute('font-weight', '700');
          labelTxt.setAttribute('fill', '#0284c7');
          labelTxt.setAttribute('font-family', 'system-ui, -apple-system, sans-serif');

          lines.forEach((lineStr, lineIdx) => {
            if (lineIdx === 0) {
              labelTxt.textContent = lineStr;
            } else {
              const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
              tspan.setAttribute('x', (lx + tw / 2).toFixed(1));
              tspan.setAttribute('dy', lineH.toFixed(1));
              tspan.textContent = lineStr;
              labelTxt.appendChild(tspan);
            }
          });
          labelG.appendChild(labelTxt);
        }
      }
      return;
    }

    // 2. フィードバックライン（後方から前方へ下側を迂回）
    const isFeedbackFlow = p1.isFeedback || p2.isFeedback || p1.x > p2.x;
    if (isFeedbackFlow) {
      const loopY = mainY + 95;

      // 出力側からの分岐引き出し黒丸（Pickoff point）
      if (!p1.isFeedback && p1.x > p2.x) {
        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dot.setAttribute('cx', p1.x + p1.w / 2);
        dot.setAttribute('cy', mainY);
        dot.setAttribute('r', '4');
        dot.setAttribute('fill', '#0f172a');
        edgeG.appendChild(dot);
      }

      let d = '';
      if (p1.isFeedback && p2.type === 'sum') {
        // フィードバック要素から加算器へ
        const startX = p1.x;
        const startY = p1.y + p1.h / 2;
        const targetX = p2.x + p2.w / 2;
        const targetY = p2.y + p2.h;
        d = `M ${startX} ${startY} L ${targetX} ${startY} L ${targetX} ${targetY}`;
      } else if (!p1.isFeedback && p2.isFeedback) {
        // 出力ノードからフィードバック要素へ
        const startX = p1.x + p1.w / 2;
        const startY = mainY;
        const targetX = p2.x + p2.w;
        const targetY = p2.y + p2.h / 2;
        d = `M ${startX} ${startY} L ${startX} ${targetY} L ${targetX} ${targetY}`;
      } else {
        // 直接ループ（フィードバック要素なし）
        const startX = p1.x + p1.w / 2;
        const startY = mainY;
        const endX = p2.x + p2.w / 2;
        const endY = p2.y + p2.h;
        d = `M ${startX} ${startY} L ${startX} ${loopY} L ${endX} ${loopY} L ${endX} ${endY}`;
      }

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', '#0f172a');
      path.setAttribute('stroke-width', '1.8');
      path.setAttribute('marker-end', 'url(#bd-arrow)');
      edgeG.appendChild(path);

      // 加算器の下側の符号
      if (e.sign && p2.type === 'sum') {
        const signTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        signTxt.setAttribute('x', p2.x + p2.w / 2 + 7);
        signTxt.setAttribute('y', p2.y + p2.h + 14);
        signTxt.setAttribute('font-size', '13');
        signTxt.setAttribute('font-weight', '800');
        signTxt.setAttribute('fill', '#e11d48');
        signTxt.setAttribute('font-family', 'sans-serif');
        signTxt.textContent = e.sign;
        labelG.appendChild(signTxt);
      }
      return;
    }

    // 3. 通常の前進パス（左から右への水平直線）
    const startX = p1.x + p1.w;
    const startY = p1.y + p1.h / 2;
    const endX = p2.x;
    const endY = p2.y + p2.h / 2;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M ${startX} ${startY} L ${endX} ${endY}`);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', '#0f172a');
    path.setAttribute('stroke-width', '1.8');
    path.setAttribute('marker-end', 'url(#bd-arrow)');
    edgeG.appendChild(path);

    // 加算器の左側に入る符号（+または-）
    if (e.sign && p2.type === 'sum') {
      const signTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      signTxt.setAttribute('x', endX - 10);
      signTxt.setAttribute('y', endY - 6);
      signTxt.setAttribute('font-size', '12');
      signTxt.setAttribute('font-weight', '800');
      signTxt.setAttribute('fill', '#0284c7');
      signTxt.setAttribute('font-family', 'sans-serif');
      signTxt.textContent = e.sign;
      labelG.appendChild(signTxt);
    }

    // 信号線ラベル（矢印の上部に配置）
    if (e.label) {
      const lines = splitBlockLines(e.label);
      if (lines.length > 0) {
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;
        const lineH = 15;
        const th = lines.length * lineH + 6;
        const tw = getBlockTextWidth(e.label) + 14;

        // 四角の枠（subLabelありでbaseLineY - 29）に絶対に接触しないよう、座布団の下端を上空（baseLineY - 34）に配置
        const baseLineY = Math.abs(startY - endY) < 5 ? startY : midY;
        const bgBottomY = baseLineY - 34;
        const bgTopY = bgBottomY - th;

        const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bg.setAttribute('x', (midX - tw / 2).toFixed(1));
        bg.setAttribute('y', bgTopY.toFixed(1));
        bg.setAttribute('width', tw.toFixed(1));
        bg.setAttribute('height', th.toFixed(1));
        bg.setAttribute('rx', '4');
        bg.setAttribute('fill', '#ffffff');
        bg.setAttribute('fill-opacity', '0.94');
        bg.setAttribute('stroke', '#e0f2fe');
        bg.setAttribute('stroke-width', '1');
        labelG.appendChild(bg);

        const labelTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        labelTxt.setAttribute('x', midX.toFixed(1));
        labelTxt.setAttribute('y', (bgTopY + lineH - 1).toFixed(1));
        labelTxt.setAttribute('text-anchor', 'middle');
        labelTxt.setAttribute('font-size', '11.5');
        labelTxt.setAttribute('font-weight', '700');
        labelTxt.setAttribute('fill', '#0284c7');
        labelTxt.setAttribute('font-family', 'system-ui, -apple-system, sans-serif');

        lines.forEach((lineStr, lineIdx) => {
          if (lineIdx === 0) {
            labelTxt.textContent = lineStr;
          } else {
            const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
            tspan.setAttribute('x', midX.toFixed(1));
            tspan.setAttribute('dy', lineH.toFixed(1));
            tspan.textContent = lineStr;
            labelTxt.appendChild(tspan);
          }
        });
        labelG.appendChild(labelTxt);
      }
    }
  });

  svg.appendChild(edgeG);

  // ノード描画グループ
  const nodeG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  nodeG.setAttribute('class', 'bd-nodes');

  nodes.forEach((n) => {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', `bd-node type-${n.type}`);

    if (n.type === 'sum') {
      // 加算点（比較器：円形シンボル）
      const cx = n.x + n.w / 2;
      const cy = n.y + n.h / 2;
      const r = n.w / 2;

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', cx);
      circle.setAttribute('cy', cy);
      circle.setAttribute('r', r);
      circle.setAttribute('fill', '#ffffff');
      circle.setAttribute('stroke', '#0f172a');
      circle.setAttribute('stroke-width', '2');
      circle.setAttribute('filter', 'url(#bd-shadow)');
      g.appendChild(circle);

      // 内部の十字または斜めバツ（比較点シンボル）
      const cross = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      cross.setAttribute('d', `M ${cx - 7} ${cy - 7} L ${cx + 7} ${cy + 7} M ${cx - 7} ${cy + 7} L ${cx + 7} ${cy - 7}`);
      cross.setAttribute('stroke', '#64748b');
      cross.setAttribute('stroke-width', '1.5');
      g.appendChild(cross);
    } else if (n.isTerminal) {
      // 外部入出力端子（すっきりしたプレーンテキスト / ピル）
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', n.x + n.w / 2);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('font-size', '13');
      text.setAttribute('font-weight', '700');
      text.setAttribute('fill', '#0f172a');
      text.setAttribute('font-family', 'system-ui, -apple-system, sans-serif');

      const lines = splitBlockLines(n.name || n.id);
      const lineH = 16;
      const startY = n.y + n.h / 2 - ((lines.length - 1) * lineH) / 2 + 4.5;
      text.setAttribute('y', startY.toFixed(1));

      lines.forEach((l, idx) => {
        if (idx === 0) {
          text.textContent = l;
        } else {
          const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
          tspan.setAttribute('x', n.x + n.w / 2);
          tspan.setAttribute('dy', lineH);
          tspan.textContent = l;
          text.appendChild(tspan);
        }
      });
      g.appendChild(text);
    } else {
      // 機能ブロック（角丸長方形）
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', n.x);
      rect.setAttribute('y', n.y);
      rect.setAttribute('width', n.w);
      rect.setAttribute('height', n.h);
      rect.setAttribute('rx', '6');
      rect.setAttribute('fill', '#ffffff');
      rect.setAttribute('stroke', n.color || '#0284c7');
      rect.setAttribute('stroke-width', '2');
      rect.setAttribute('filter', 'url(#bd-shadow)');
      g.appendChild(rect);

      // 上部アクセントカラーバー
      const topBar = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      topBar.setAttribute('d', `M ${n.x + 6} ${n.y} L ${n.x + n.w - 6} ${n.y}`);
      topBar.setAttribute('stroke', n.color || '#0284c7');
      topBar.setAttribute('stroke-width', '3');
      topBar.setAttribute('stroke-linecap', 'round');
      g.appendChild(topBar);

      if (n.subLabel) {
        // 機能名称（上段）
        const titleTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        titleTxt.setAttribute('x', n.x + n.w / 2);
        titleTxt.setAttribute('y', n.y + 20);
        titleTxt.setAttribute('text-anchor', 'middle');
        titleTxt.setAttribute('font-size', '11.5');
        titleTxt.setAttribute('font-weight', '700');
        titleTxt.setAttribute('fill', '#64748b');
        titleTxt.setAttribute('font-family', 'sans-serif');
        titleTxt.textContent = n.name;
        g.appendChild(titleTxt);

        // 伝達関数 / 数式（下段）
        const subTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        subTxt.setAttribute('x', n.x + n.w / 2);
        subTxt.setAttribute('y', n.y + 42);
        subTxt.setAttribute('text-anchor', 'middle');
        subTxt.setAttribute('font-size', '13.5');
        subTxt.setAttribute('font-weight', '800');
        subTxt.setAttribute('font-style', 'italic');
        subTxt.setAttribute('fill', '#0f172a');
        subTxt.setAttribute('font-family', 'Georgia, Cambria, serif');
        subTxt.textContent = n.subLabel;
        g.appendChild(subTxt);
      } else {
        // 単独名称（中央）
        const nameTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        nameTxt.setAttribute('x', n.x + n.w / 2);
        nameTxt.setAttribute('text-anchor', 'middle');
        nameTxt.setAttribute('font-size', '13');
        nameTxt.setAttribute('font-weight', '700');
        nameTxt.setAttribute('fill', '#0f172a');
        nameTxt.setAttribute('font-family', 'system-ui, -apple-system, sans-serif');

        const lines = splitBlockLines(n.name || n.id);
        const lineH = 16;
        const startY = n.y + n.h / 2 - ((lines.length - 1) * lineH) / 2 + 4.5;
        nameTxt.setAttribute('y', startY.toFixed(1));

        lines.forEach((l, idx) => {
          if (idx === 0) {
            nameTxt.textContent = l;
          } else {
            const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
            tspan.setAttribute('x', n.x + n.w / 2);
            tspan.setAttribute('dy', lineH);
            tspan.textContent = l;
            nameTxt.appendChild(tspan);
          }
        });
        g.appendChild(nameTxt);
      }
    }

    // ツールチップ
    const tip = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    tip.textContent = n.subLabel ? `${n.name} (${n.subLabel})` : n.name;
    g.appendChild(tip);

    nodeG.appendChild(g);
  });

  svg.appendChild(nodeG);
  svg.appendChild(labelG);
  container.appendChild(svg);

  if (labelText) {
    const lbl = document.createElement('div');
    lbl.className = 'chem-structure-label';
    lbl.textContent = labelText;
    container.appendChild(lbl);
  }
}
