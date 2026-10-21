// ==========================================
// ニューラルネットワーク構造図 (DNN / MLP) エンジン
// ==========================================

/**
 * 下付き数字の変換マップ (0-9, i, n)
 */
const NN_SUBSCRIPTS = {
  '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
  '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
  'i': 'ᵢ', 'n': 'ₙ'
};

function nnToSubscript(numStr) {
  return String(numStr).split('').map(c => NN_SUBSCRIPTS[c] || c).join('');
}

/**
 * ニューラルネットワーク構文のパーサー
 * @param {string} rawText
 * @returns {object}
 */
function parseNeuralNetwork(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;

  // \nn{ ... } または \neuralnetwork{ ... } の内側を抽出
  let content = rawText.trim();
  const cmdMatch = content.match(/^\\(?:nn|neuralnet|neuralnetwork)\s*\{([\s\S]*)\}\s*$/i);
  if (cmdMatch) {
    content = cmdMatch[1];
  }

  const lines = content.split(/;|\n/).map(l => l.trim()).filter(Boolean);

  let title = '';
  let subtitle = '';
  let layers = [3, 4, 2]; // デフォルト層構成
  let labels = [];
  let activations = [];
  let nodeLabels = {}; // { layerIndex: [labels] }
  let bias = false;
  let biasPos = 'top';
  let theme = 'modern';
  let direction = 'lr';
  const highlights = []; // [{ fromLayer, fromNode, toLayer, toNode }]
  const highlightedNodes = new Set(); // Set of "layer-node"

  lines.forEach(line => {
    // 1. タイトル
    const titleMatch = line.match(/^title\s*:\s*(.+)$/i);
    if (titleMatch) {
      title = titleMatch[1].trim().replace(/^["']|["']$/g, '');
      return;
    }

    // 2. サブタイトル
    const subMatch = line.match(/^subtitle\s*:\s*(.+)$/i);
    if (subMatch) {
      subtitle = subMatch[1].trim().replace(/^["']|["']$/g, '');
      return;
    }

    // 3. レイヤー構成 (layers: [4, 6, 6, 2] または layers: 4, 6, 6, 2)
    const layersMatch = line.match(/^layers?\s*:\s*(?:\[(.*?)\]|(.*))$/i);
    if (layersMatch) {
      const listStr = (layersMatch[1] || layersMatch[2] || '').trim();
      const parsedLayers = listStr
        .split(/[,\s]+/)
        .map(s => parseInt(s.trim(), 10))
        .filter(n => !isNaN(n) && n > 0);
      if (parsedLayers.length >= 2) {
        layers = parsedLayers;
      }
      return;
    }

    // 4. レイヤー名ラベル (labels: ["入力層", "中間層", "出力層"] または labels: 入力層, 中間層, 出力層)
    const labelsMatch = line.match(/^labels?\s*:\s*(?:\[(.*?)\]|(.*))$/i);
    if (labelsMatch) {
      const listStr = (labelsMatch[1] || labelsMatch[2] || '').trim();
      labels = listStr
        .split(/,\s*(?=(?:[^"]*"[^"]*")*[^"]*$)/) // カンマ区切り（クォート考慮）
        .map(s => s.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean);
      return;
    }

    // 5. 活性化関数 (activations: ["ReLU", "Softmax"] または activations: ReLU, Softmax)
    const actMatch = line.match(/^activations?\s*:\s*(?:\[(.*?)\]|(.*))$/i);
    if (actMatch) {
      const listStr = (actMatch[1] || actMatch[2] || '').trim();
      activations = listStr
        .split(/,\s*(?=(?:[^"]*"[^"]*")*[^"]*$)/)
        .map(s => s.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean);
      return;
    }

    // 6. バイアスノード有無 (bias: true / false)
    const biasMatch = line.match(/^bias\s*:\s*(true|false|top|bottom)/i);
    if (biasMatch) {
      const val = biasMatch[1].toLowerCase();
      if (val === 'true' || val === 'top') {
        bias = true;
        biasPos = 'top';
      } else if (val === 'bottom') {
        bias = true;
        biasPos = 'bottom';
      } else {
        bias = false;
      }
      return;
    }

    // 7. テーマ (theme: modern / cyber / paper)
    const themeMatch = line.match(/^theme\s*:\s*(.+)$/i);
    if (themeMatch) {
      theme = themeMatch[1].trim().toLowerCase().replace(/^["']|["']$/g, '');
      return;
    }

    // 8. ノードラベル定義 (nodes[0]: ["x₁", "x₂"] または nodes: { 0: [...] })
    const nodeIdxMatch = line.match(/^(?:nodes?\[(\d+)\]|layer\[(\d+)\]\.nodes?)\s*:\s*(?:\[(.*?)\]|(.*))$/i);
    if (nodeIdxMatch) {
      const lIdx = parseInt(nodeIdxMatch[1] || nodeIdxMatch[2], 10);
      const listStr = (nodeIdxMatch[3] || nodeIdxMatch[4] || '').trim();
      const nLabels = listStr
        .split(/,\s*(?=(?:[^"]*"[^"]*")*[^"]*$)/)
        .map(s => s.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean);
      nodeLabels[lIdx] = nLabels;
      return;
    }

    // 9. ハイライト (highlight: 0-0->1-1, 1-1->2-0 または highlight: (0,0)->(1,1))
    const hlMatch = line.match(/^highlights?\s*:\s*(.+)$/i);
    if (hlMatch) {
      const rawPairs = hlMatch[1].split(/[,;]+/);
      rawPairs.forEach(pair => {
        // エッジハイライト: (l1, n1) -> (l2, n2) または l1-n1 -> l2-n2
        const edgeM = pair.match(/(?:\(?\s*(\d+)\s*[,-]\s*(\d+)\s*\)?)\s*->\s*(?:\(?\s*(\d+)\s*[,-]\s*(\d+)\s*\)?)/);
        if (edgeM) {
          highlights.push({
            fromL: parseInt(edgeM[1], 10),
            fromN: parseInt(edgeM[2], 10),
            toL: parseInt(edgeM[3], 10),
            toN: parseInt(edgeM[4], 10)
          });
          highlightedNodes.add(`${edgeM[1]}-${edgeM[2]}`);
          highlightedNodes.add(`${edgeM[3]}-${edgeM[4]}`);
          return;
        }

        // 単一ノードハイライト: (l, n) または l-n
        const nodeM = pair.match(/(?:\(?\s*(\d+)\s*[,-]\s*(\d+)\s*\)?)/);
        if (nodeM) {
          highlightedNodes.add(`${nodeM[1]}-${nodeM[2]}`);
        }
      });
      return;
    }
  });

  return {
    title,
    subtitle,
    layers,
    labels,
    activations,
    nodeLabels,
    bias,
    biasPos,
    theme,
    direction,
    highlights,
    highlightedNodes
  };
}

/**
 * ニューラルネットワーク図のSVGをコンテナへ描画する
 * @param {string} text
 * @param {HTMLElement} container
 * @param {string} [labelText]
 */
function drawNeuralNetworkSvg(text, container, labelText) {
  if (!container) return;
  container.innerHTML = '';

  const parsed = parseNeuralNetwork(text);
  if (!parsed || !parsed.layers || parsed.layers.length < 2) {
    container.innerHTML = '<div style="color:#ef4444; font-size:13px; padding:12px;">ニューラルネットワークの層構成が正しく指定されていません。<br>例: <code>\\nn{ layers: [4, 6, 6, 2]; }</code></div>';
    return;
  }

  const {
    title,
    subtitle,
    layers,
    labels,
    activations,
    nodeLabels,
    bias,
    biasPos,
    theme,
    highlights,
    highlightedNodes
  } = parsed;

  const numLayers = layers.length;
  const maxNodeDisplay = 6; // 1層あたり実際に描画する最大ノード数（超える場合は中央を縦ドット⋮に省略）

  // 各レイヤーの描画ノード情報を構築
  // nodeItem: { id: "l-n", rawIndex: n, isEllipsis: bool, isBias: bool, label: str }
  const layerNodes = [];

  for (let l = 0; l < numLayers; l++) {
    const count = layers[l];
    const nodes = [];
    const isInput = (l === 0);
    const isOutput = (l === numLayers - 1);
    const customLabels = nodeLabels[l] || [];

    // バイアスノード（入力層または中間層）
    if (bias && !isOutput && biasPos === 'top') {
      nodes.push({
        id: `${l}-b`,
        rawIndex: -1,
        isEllipsis: false,
        isBias: true,
        label: '+1'
      });
    }

    if (count <= maxNodeDisplay) {
      for (let n = 0; n < count; n++) {
        let label = customLabels[n];
        if (!label) {
          if (isInput) label = `x${nnToSubscript(n + 1)}`;
          else if (isOutput) label = `y${nnToSubscript(n + 1)}`;
          else label = `h${nnToSubscript(n + 1)}`;
        }
        nodes.push({
          id: `${l}-${n}`,
          rawIndex: n,
          isEllipsis: false,
          isBias: false,
          label
        });
      }
    } else {
      // 省略表示: 上から3個、下から2個、中央に1個の省略ドット
      const topCount = 3;
      const bottomCount = 2;

      for (let n = 0; n < topCount; n++) {
        let label = customLabels[n] || (isInput ? `x${nnToSubscript(n + 1)}` : isOutput ? `y${nnToSubscript(n + 1)}` : `h${nnToSubscript(n + 1)}`);
        nodes.push({
          id: `${l}-${n}`,
          rawIndex: n,
          isEllipsis: false,
          isBias: false,
          label
        });
      }

      // 省略記号
      nodes.push({
        id: `${l}-ellipsis`,
        rawIndex: -99,
        isEllipsis: true,
        isBias: false,
        label: '⋮'
      });

      for (let n = count - bottomCount; n < count; n++) {
        let label = customLabels[n] || (isInput ? `x${nnToSubscript(n + 1)}` : isOutput ? `y${nnToSubscript(n + 1)}` : `h${nnToSubscript(n + 1)}`);
        nodes.push({
          id: `${l}-${n}`,
          rawIndex: n,
          isEllipsis: false,
          isBias: false,
          label
        });
      }
    }

    // バイアスノード（下部配置）
    if (bias && !isOutput && biasPos === 'bottom') {
      nodes.push({
        id: `${l}-b`,
        rawIndex: -1,
        isEllipsis: false,
        isBias: true,
        label: '+1'
      });
    }

    layerNodes.push(nodes);
  }

  // レイアウト寸法の計算
  const nodeRadius = 18;
  const nodeDiameter = nodeRadius * 2;
  const minTargetW = 780;
  const baseWidth = Math.max(minTargetW, 60 + 60 + (numLayers - 1) * 180);
  const layerSpacing = numLayers > 1 ? (baseWidth - 120) / (numLayers - 1) : 0;
  
  // 最大表示ノード数から高さを決定
  const maxDrawnNodes = Math.max(...layerNodes.map(arr => arr.length));
  const nodeSpacingY = Math.max(48, Math.min(64, 380 / Math.max(maxDrawnNodes, 1)));

  const marginTop = title ? 90 : 70;
  const marginBottom = 50;
  const marginLeft = 60;
  const marginRight = 60;

  const width = baseWidth;
  const height = marginTop + marginBottom + Math.max(maxDrawnNodes * nodeSpacingY, 260);

  // 各ノードの幾何中心座標を計算
  const nodePositions = new Map(); // id -> { x, y, isEllipsis, isBias, label, layerIdx }

  for (let l = 0; l < numLayers; l++) {
    const x = marginLeft + l * layerSpacing;
    const nodes = layerNodes[l];
    const layerTotalHeight = (nodes.length - 1) * nodeSpacingY;
    const startY = marginTop + (height - marginTop - marginBottom - layerTotalHeight) / 2;

    nodes.forEach((node, idx) => {
      const y = startY + idx * nodeSpacingY;
      nodePositions.set(node.id, {
        x,
        y,
        isEllipsis: node.isEllipsis,
        isBias: node.isBias,
        label: node.label,
        rawIndex: node.rawIndex,
        layerIdx: l,
        nodeIdx: idx
      });
    });
  }

  // SVG要素生成
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.style.maxWidth = `${width}px`;
  svg.style.display = 'block';
  svg.style.margin = '0 auto';
  svg.setAttribute('class', 'neuralnet-svg');

  // 背景グラデーション・スタイル定義
  const defs = document.createElementNS(svgNS, 'defs');
  defs.innerHTML = `
    <!-- 入力ノードのグラデーション (Emerald) -->
    <linearGradient id="nn-grad-input" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ecfdf5" />
      <stop offset="100%" stop-color="#d1fae5" />
    </linearGradient>

    <!-- 中間ノードのグラデーション (Indigo/Blue) -->
    <linearGradient id="nn-grad-hidden" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#eff6ff" />
      <stop offset="100%" stop-color="#dbeafe" />
    </linearGradient>

    <!-- 出力ノードのグラデーション (Rose/Coral) -->
    <linearGradient id="nn-grad-output" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff1f2" />
      <stop offset="100%" stop-color="#ffe4e6" />
    </linearGradient>

    <!-- バイアスノードのグラデーション (Amber) -->
    <linearGradient id="nn-grad-bias" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fffbeb" />
      <stop offset="100%" stop-color="#fef3c7" />
    </linearGradient>

    <!-- 強調ノードのグラデーション (Accent Gold/Purple) -->
    <linearGradient id="nn-grad-highlight" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#e0e7ff" />
      <stop offset="100%" stop-color="#c7d2fe" />
    </linearGradient>

    <!-- 影フィルタ (Drop Shadow) -->
    <filter id="nn-node-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#0f172a" flood-opacity="0.08" />
    </filter>
    <filter id="nn-pill-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="1.5" stdDeviation="2" flood-color="#0f172a" flood-opacity="0.06" />
    </filter>
  `;
  svg.appendChild(defs);

  // タイトル & サブタイトル描画
  if (title) {
    const titleEl = document.createElementNS(svgNS, 'text');
    titleEl.setAttribute('x', (width / 2).toString());
    titleEl.setAttribute('y', '30');
    titleEl.setAttribute('text-anchor', 'middle');
    titleEl.setAttribute('font-family', "'Outfit', 'Inter', 'Noto Sans JP', sans-serif");
    titleEl.setAttribute('font-size', '17');
    titleEl.setAttribute('font-weight', '700');
    titleEl.setAttribute('fill', '#1e293b');
    titleEl.textContent = title;
    svg.appendChild(titleEl);

    if (subtitle) {
      const subEl = document.createElementNS(svgNS, 'text');
      subEl.setAttribute('x', (width / 2).toString());
      subEl.setAttribute('y', '48');
      subEl.setAttribute('text-anchor', 'middle');
      subEl.setAttribute('font-family', "'Outfit', 'Inter', 'Noto Sans JP', sans-serif");
      subEl.setAttribute('font-size', '11.5');
      subEl.setAttribute('font-weight', '400');
      subEl.setAttribute('fill', '#64748b');
      subEl.textContent = subtitle;
      svg.appendChild(subEl);
    }
  }

  // レイヤーグループコンテナ
  const edgeGroup = document.createElementNS(svgNS, 'g');
  edgeGroup.setAttribute('class', 'nn-edges');
  svg.appendChild(edgeGroup);

  const edgeHighlightGroup = document.createElementNS(svgNS, 'g');
  edgeHighlightGroup.setAttribute('class', 'nn-edges-highlight');
  svg.appendChild(edgeHighlightGroup);

  const nodeGroup = document.createElementNS(svgNS, 'g');
  nodeGroup.setAttribute('class', 'nn-nodes');
  svg.appendChild(nodeGroup);

  // エッジ描画用のハイライトマップ作成
  const highlightKeySet = new Set(
    highlights.map(h => `${h.fromL}-${h.fromN}->${h.toL}-${h.toN}`)
  );

  // 全結合エッジの描画
  for (let l = 0; l < numLayers - 1; l++) {
    const sourceNodes = layerNodes[l];
    const targetNodes = layerNodes[l + 1];

    sourceNodes.forEach(src => {
      if (src.isEllipsis) return; // 省略ドットからは線を引かない
      const pSrc = nodePositions.get(src.id);
      if (!pSrc) return;

      targetNodes.forEach(tgt => {
        if (tgt.isEllipsis) return; // 省略ドットへは線を引かない
        if (tgt.isBias) return; // 次の層のバイアスノードへの逆流入結合は引かない

        const pTgt = nodePositions.get(tgt.id);
        if (!pTgt) return;

        // ハイライト判定
        const isHl = highlightKeySet.has(`${l}-${src.rawIndex}->${l + 1}-${tgt.rawIndex}`);

        const line = document.createElementNS(svgNS, 'line');
        line.setAttribute('x1', pSrc.x.toString());
        line.setAttribute('y1', pSrc.y.toString());
        line.setAttribute('x2', pTgt.x.toString());
        line.setAttribute('y2', pTgt.y.toString());

        if (isHl) {
          line.setAttribute('stroke', '#6366f1');
          line.setAttribute('stroke-width', '2.6');
          line.setAttribute('stroke-opacity', '0.9');
          line.setAttribute('stroke-linecap', 'round');
          edgeHighlightGroup.appendChild(line);
        } else {
          line.setAttribute('stroke', '#94a3b8');
          line.setAttribute('stroke-width', '1.2');
          line.setAttribute('stroke-opacity', '0.35');
          edgeGroup.appendChild(line);
        }
      });
    });
  }

  // ノードの描画
  nodePositions.forEach((pos, id) => {
    const isInput = (pos.layerIdx === 0);
    const isOutput = (pos.layerIdx === numLayers - 1);
    const isHlNode = highlightedNodes.has(`${pos.layerIdx}-${pos.rawIndex}`);

    if (pos.isEllipsis) {
      // 縦3点リーダー（⋮）
      const txt = document.createElementNS(svgNS, 'text');
      txt.setAttribute('x', pos.x.toString());
      txt.setAttribute('y', (pos.y + 6).toString());
      txt.setAttribute('text-anchor', 'middle');
      txt.setAttribute('font-family', "'Outfit', 'Inter', sans-serif");
      txt.setAttribute('font-size', '20');
      txt.setAttribute('font-weight', '700');
      txt.setAttribute('fill', '#94a3b8');
      txt.textContent = '⋮';
      nodeGroup.appendChild(txt);
      return;
    }

    // ニューロン円
    const circle = document.createElementNS(svgNS, 'circle');
    circle.setAttribute('cx', pos.x.toString());
    circle.setAttribute('cy', pos.y.toString());
    circle.setAttribute('r', nodeRadius.toString());
    circle.setAttribute('filter', 'url(#nn-node-shadow)');

    let fillColor = 'url(#nn-grad-hidden)';
    let strokeColor = '#3b82f6';
    let textColor = '#1e40af';

    if (pos.isBias) {
      fillColor = 'url(#nn-grad-bias)';
      strokeColor = '#f59e0b';
      textColor = '#92400e';
      circle.setAttribute('stroke-dasharray', '3.5 2');
    } else if (isHlNode) {
      fillColor = 'url(#nn-grad-highlight)';
      strokeColor = '#6366f1';
      textColor = '#3730a3';
    } else if (isInput) {
      fillColor = 'url(#nn-grad-input)';
      strokeColor = '#10b981';
      textColor = '#065f46';
    } else if (isOutput) {
      fillColor = 'url(#nn-grad-output)';
      strokeColor = '#f43f5e';
      textColor = '#9f1239';
    }

    circle.setAttribute('fill', fillColor);
    circle.setAttribute('stroke', strokeColor);
    circle.setAttribute('stroke-width', isHlNode ? '2.5' : '1.8');
    nodeGroup.appendChild(circle);

    // ノード内ラベルテキスト
    const textEl = document.createElementNS(svgNS, 'text');
    textEl.setAttribute('x', pos.x.toString());
    textEl.setAttribute('y', (pos.y + 4.5).toString());
    textEl.setAttribute('text-anchor', 'middle');
    textEl.setAttribute('font-family', "'Outfit', 'Inter', 'Noto Sans JP', sans-serif");
    textEl.setAttribute('font-size', pos.label.length > 3 ? '11.5' : '12.5');
    textEl.setAttribute('font-weight', '600');
    textEl.setAttribute('fill', textColor);
    textEl.textContent = pos.label;
    nodeGroup.appendChild(textEl);
  });

  // レイヤーラベル（上部カード表示）の描画
  const defaultLayerNames = (l) => {
    if (l === 0) return `入力層 (${layers[0]})`;
    if (l === numLayers - 1) return `出力層 (${layers[l]})`;
    return `中間層 ${l} (${layers[l]})`;
  };

  for (let l = 0; l < numLayers; l++) {
    const x = marginLeft + l * layerSpacing;
    const labelY = title ? 64 : 44;
    const rawLabel = labels[l] || defaultLayerNames(l);

    // ラベル背景ピル
    const tw = Math.max(rawLabel.length * 9 + 18, 76);
    const th = 22;

    const bgRect = document.createElementNS(svgNS, 'rect');
    bgRect.setAttribute('x', (x - tw / 2).toString());
    bgRect.setAttribute('y', (labelY - th / 2).toString());
    bgRect.setAttribute('width', tw.toString());
    bgRect.setAttribute('height', th.toString());
    bgRect.setAttribute('rx', '6');
    bgRect.setAttribute('ry', '6');
    bgRect.setAttribute('fill', '#f8fafc');
    bgRect.setAttribute('stroke', '#e2e8f0');
    bgRect.setAttribute('stroke-width', '1');
    bgRect.setAttribute('filter', 'url(#nn-pill-shadow)');
    svg.appendChild(bgRect);

    // ラベルテキスト
    const lbl = document.createElementNS(svgNS, 'text');
    lbl.setAttribute('x', x.toString());
    lbl.setAttribute('y', (labelY + 4).toString());
    lbl.setAttribute('text-anchor', 'middle');
    lbl.setAttribute('font-family', "'Outfit', 'Inter', 'Noto Sans JP', sans-serif");
    lbl.setAttribute('font-size', '12.5');
    lbl.setAttribute('font-weight', '600');
    lbl.setAttribute('fill', '#334155');
    lbl.textContent = rawLabel;
    svg.appendChild(lbl);
  }

  // 活性化関数バッジ（層間の上部ピル）の描画
  if (activations && activations.length > 0) {
    for (let l = 0; l < Math.min(activations.length, numLayers - 1); l++) {
      const actName = activations[l];
      if (!actName) continue;

      const x = marginLeft + l * layerSpacing + layerSpacing / 2;
      const actY = (title ? 64 : 44) + 24;

      const pw = Math.max(actName.length * 8 + 16, 56);
      const ph = 19;

      const pill = document.createElementNS(svgNS, 'rect');
      pill.setAttribute('x', (x - pw / 2).toString());
      pill.setAttribute('y', (actY - ph / 2).toString());
      pill.setAttribute('width', pw.toString());
      pill.setAttribute('height', ph.toString());
      pill.setAttribute('rx', '9.5');
      pill.setAttribute('ry', '9.5');
      pill.setAttribute('fill', '#f1f5f9');
      pill.setAttribute('stroke', '#cbd5e1');
      pill.setAttribute('stroke-width', '1');
      svg.appendChild(pill);

      const actTxt = document.createElementNS(svgNS, 'text');
      actTxt.setAttribute('x', x.toString());
      actTxt.setAttribute('y', (actY + 3.5).toString());
      actTxt.setAttribute('text-anchor', 'middle');
      actTxt.setAttribute('font-family', "'Outfit', 'Inter', sans-serif");
      actTxt.setAttribute('font-size', '10.5');
      actTxt.setAttribute('font-weight', '600');
      actTxt.setAttribute('fill', '#475569');
      actTxt.textContent = actName;
      svg.appendChild(actTxt);
    }
  }

  // 下部の凡例（入力・中間・出力・バイアス）
  const legendY = height - 18;
  const legendItems = [
    { label: '入力', color: '#10b981', bg: '#ecfdf5' },
    { label: '隠れ層', color: '#3b82f6', bg: '#eff6ff' },
    { label: '出力', color: '#f43f5e', bg: '#fff1f2' }
  ];
  if (bias) {
    legendItems.push({ label: 'バイアス', color: '#f59e0b', bg: '#fffbeb', dashed: true });
  }

  const legendGroup = document.createElementNS(svgNS, 'g');
  legendGroup.setAttribute('class', 'nn-legend');

  const itemWidth = 72;
  const totalLegW = legendItems.length * itemWidth;
  const legStartX = (width - totalLegW) / 2;

  legendItems.forEach((item, idx) => {
    const lx = legStartX + idx * itemWidth;

    const dot = document.createElementNS(svgNS, 'circle');
    dot.setAttribute('cx', (lx + 6).toString());
    dot.setAttribute('cy', legendY.toString());
    dot.setAttribute('r', '5');
    dot.setAttribute('fill', item.bg);
    dot.setAttribute('stroke', item.color);
    dot.setAttribute('stroke-width', '1.5');
    if (item.dashed) dot.setAttribute('stroke-dasharray', '2 1.5');
    legendGroup.appendChild(dot);

    const txt = document.createElementNS(svgNS, 'text');
    txt.setAttribute('x', (lx + 16).toString());
    txt.setAttribute('y', (legendY + 3.5).toString());
    txt.setAttribute('font-family', "'Outfit', 'Inter', 'Noto Sans JP', sans-serif");
    txt.setAttribute('font-size', '11.5');
    txt.setAttribute('font-weight', '500');
    txt.setAttribute('fill', '#64748b');
    txt.textContent = item.label;
    legendGroup.appendChild(txt);
  });

  svg.appendChild(legendGroup);

  // コンテナへの配置
  const wrapper = document.createElement('div');
  wrapper.className = 'neuralnet-container';
  wrapper.style.display = 'flex';
  wrapper.style.justifyContent = 'center';
  wrapper.style.alignItems = 'center';
  wrapper.style.width = '100%';
  wrapper.style.overflowX = 'auto';
  wrapper.style.padding = '8px 0';
  wrapper.appendChild(svg);

  container.appendChild(wrapper);
}

// エイリアス関数
function drawNeuralNetwork(text, container, labelText) {
  drawNeuralNetworkSvg(text, container, labelText);
}
