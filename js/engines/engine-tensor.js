// ==========================================
// テンソルネットワーク図 / ペンローズのグラフ記法 (Tensor Network Diagram / Penrose Graphical Notation)
// パーサー & SVG描画エンジン
// 量子情報・物性物理 (MPS, PEPS, TTN, MERA, DMRG)・機械学習テンソル分解・ペンローズ表記
// ==========================================

function parseTensorText(text) {
  if (!text || typeof text !== 'string') return null;

  // \tensornetwork{...}, \penrose{...}, \tensor{...} の中身を取り出す
  const match = text.match(/\\(?:tensornetwork|penrose|tensor)\s*\{([\s\S]*)\}/i);
  const content = match ? match[1] : text;

  const lines = content
    .split(/[\n;]+/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('//') && !l.startsWith('#'));

  let type = 'mps'; // デフォルトは代表的な行列積状態(MPS)
  let title = '';
  let theme = 'dark'; // 'dark' | 'light'
  let sites = 5;
  let bondLabel = 'χ';
  let physLabel = 'd';
  let nodePrefix = 'A';
  let note = '';
  let showSummary = true;

  const nodes = [];  // { id, x, y, shape, label, fill, r, w, h }
  const edges = [];  // { from, to, label, style, curve, bend }
  const legs = [];   // { node, dir, len, label, arrow }
  const loops = [];  // { node, label }

  for (const line of lines) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) {
      const single = line.toLowerCase();
      if (/^(mps|peps|ttn|mera|svd|contraction|basic|rank|trace|quantum)$/.test(single)) {
        type = single;
      }
      continue;
    }

    const key = line.slice(0, colonIdx).trim().toLowerCase();
    const val = line.slice(colonIdx + 1).trim();

    if (key === 'type' || key === 'structure' || key === 'model') {
      type = val.toLowerCase();
    } else if (key === 'title') {
      title = val.replace(/^["']|["']$/g, '');
    } else if (key === 'theme') {
      theme = val.toLowerCase();
    } else if (key === 'sites' || key === 'length' || key === 'n') {
      sites = Math.max(2, Math.min(10, parseInt(val, 10) || 5));
    } else if (key === 'bond' || key === 'bonddim' || key === 'chi') {
      bondLabel = val.replace(/^["']|["']$/g, '');
    } else if (key === 'phys' || key === 'physdim' || key === 'd') {
      physLabel = val.replace(/^["']|["']$/g, '');
    } else if (key === 'nodeprefix' || key === 'label') {
      nodePrefix = val.replace(/^["']|["']$/g, '');
    } else if (key === 'note' || key === 'desc') {
      note = val.replace(/^["']|["']$/g, '');
    } else if (key === 'summary') {
      showSummary = val.toLowerCase() !== 'false' && val !== '0';
    } else if (key === 'node') {
      // 例: node: A1 (0, 0) [shape=circle, fill=#38bdf8, label="A₁", r=22]
      const nMatch = val.match(/^([a-zA-Z0-9_-]+)\s*(?:\(([^,]+),\s*([^)]+)\))?\s*(?:\[(.*)\])?$/);
      if (nMatch) {
        const id = nMatch[1];
        const x = nMatch[2] !== undefined ? parseFloat(nMatch[2]) : 0;
        const y = nMatch[3] !== undefined ? parseFloat(nMatch[3]) : 0;
        const optStr = nMatch[4] || '';
        
        let shape = 'circle';
        let label = id;
        let fill = '';
        let r = 22;
        let w = 44;
        let h = 44;

        optStr.split(',').forEach(part => {
          const [k, v] = part.split('=').map(s => s.trim());
          if (!k || !v) return;
          const kLow = k.toLowerCase();
          const cleanV = v.replace(/^["']|["']$/g, '');
          if (kLow === 'shape') shape = cleanV;
          else if (kLow === 'label') label = cleanV;
          else if (kLow === 'fill' || kLow === 'color') fill = cleanV;
          else if (kLow === 'r') r = parseFloat(cleanV) || 22;
          else if (kLow === 'w') w = parseFloat(cleanV) || 44;
          else if (kLow === 'h') h = parseFloat(cleanV) || 44;
        });

        nodes.push({ id, x, y, shape, label, fill, r, w, h });
      }
    } else if (key === 'edge' || key === 'bond_line') {
      // 例: edge: A1 -- A2 [label="χ", bend=20]
      const eMatch = val.match(/^([a-zA-Z0-9_-]+)\s*(?:--|->|-)\s*([a-zA-Z0-9_-]+)\s*(?:\[(.*)\])?$/);
      if (eMatch) {
        const from = eMatch[1];
        const to = eMatch[2];
        const optStr = eMatch[3] || '';
        let label = '';
        let style = 'solid';
        let bend = 0;

        optStr.split(',').forEach(part => {
          const [k, v] = part.split('=').map(s => s.trim());
          if (!k || !v) return;
          const kLow = k.toLowerCase();
          const cleanV = v.replace(/^["']|["']$/g, '');
          if (kLow === 'label') label = cleanV;
          else if (kLow === 'style') style = cleanV;
          else if (kLow === 'bend') bend = parseFloat(cleanV) || 0;
        });

        edges.push({ from, to, label, style, bend });
      }
    } else if (key === 'leg' || key === 'physical') {
      // 例: leg: A1 (down) [len=35, label="s₁"]
      const lMatch = val.match(/^([a-zA-Z0-9_-]+)\s*(?:\(([^)]+)\))?\s*(?:\[(.*)\])?$/);
      if (lMatch) {
        const node = lMatch[1];
        const dir = (lMatch[2] || 'down').trim().toLowerCase();
        const optStr = lMatch[3] || '';
        let len = 40;
        let label = '';
        let arrow = false;

        optStr.split(',').forEach(part => {
          const [k, v] = part.split('=').map(s => s.trim());
          if (!k || !v) return;
          const kLow = k.toLowerCase();
          const cleanV = v.replace(/^["']|["']$/g, '');
          if (kLow === 'len') len = parseFloat(cleanV) || 40;
          else if (kLow === 'label') label = cleanV;
          else if (kLow === 'arrow') arrow = cleanV !== 'false';
        });

        legs.push({ node, dir, len, label, arrow });
      }
    } else if (key === 'loop' || key === 'trace') {
      // 例: loop: M [label="i"]
      const loopMatch = val.match(/^([a-zA-Z0-9_-]+)\s*(?:\[(.*)\])?$/);
      if (loopMatch) {
        const node = loopMatch[1];
        const optStr = loopMatch[2] || '';
        let label = 'Tr';
        optStr.split(',').forEach(part => {
          const [k, v] = part.split('=').map(s => s.trim());
          if (k && v && k.toLowerCase() === 'label') label = v.replace(/^["']|["']$/g, '');
        });
        loops.push({ node, label });
      }
    }
  }

  return {
    type,
    title,
    theme,
    sites,
    bondLabel,
    physLabel,
    nodePrefix,
    note,
    showSummary,
    nodes,
    edges,
    legs,
    loops
  };
}

// 数式文字列をSVGの整形済みtspan/文字に変換
function formatTensorMathLabel(str) {
  if (!str) return '';
  // ギリシャ文字変換
  let s = str
    .replace(/\\chi/g, 'χ')
    .replace(/\\psi/g, 'ψ')
    .replace(/\\phi/g, 'φ')
    .replace(/\\sigma/g, 'σ')
    .replace(/\\alpha/g, 'α')
    .replace(/\\beta/g, 'β')
    .replace(/\\gamma/g, 'γ')
    .replace(/\\dagger/g, '†')
    .replace(/\\tau/g, 'τ')
    .replace(/\\lambda/g, 'λ');

  // 下付き・上付き文字のUnicode変換
  const subMap = { '0':'₀','1':'₁','2':'₂','3':'₃','4':'₄','5':'₅','6':'₆','7':'₇','8':'₈','9':'₉','i':'ᵢ','j':'ⱼ','k':'ₖ','l':'ₗ','m':'ₘ','n':'ₙ','s':'ₛ','t':'ₜ','x':'ₓ','y':'ᵧ','z':'ᵤ' };
  const supMap = { '0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹','+':'⁺','-':'⁻','*':'*','dagger':'†','T':'ᵀ' };

  s = s.replace(/_([0-9ijklmnstxyz])/g, (_, ch) => subMap[ch] || ('_' + ch));
  s = s.replace(/_\{([^}]+)\}/g, (_, inner) => {
    return inner.split('').map(c => subMap[c] || c).join('');
  });
  s = s.replace(/\^([0-9\+\-T\*])/g, (_, ch) => supMap[ch] || ('^' + ch));
  s = s.replace(/\^\{([^}]+)\}/g, (_, inner) => {
    if (inner === '\\dagger' || inner === 'dagger') return '†';
    return inner.split('').map(c => supMap[c] || c).join('');
  });

  return s;
}

// ==========================================
// SVG レンダリングエンジン
// ==========================================
function drawTensorSvg(text, container, label) {
  if (!container) return;
  container.innerHTML = '';

  const parsed = parseTensorText(text);
  if (!parsed) {
    container.innerHTML = '<div style="color:red;padding:12px;">テンソル構文エラー</div>';
    return;
  }

  const isDark = parsed.theme === 'dark';
  const colors = {
    bg: isDark ? '#080c16' : '#ffffff',
    cardBg: isDark ? '#0f172a' : '#f8fafc',
    cardBorder: isDark ? '#1e293b' : '#e2e8f0',
    textMain: isDark ? '#f8fafc' : '#0f172a',
    textMuted: isDark ? '#94a3b8' : '#64748b',
    bondLine: isDark ? '#38bdf8' : '#0284c7',        // 縮約ボンド（シアン/濃青）
    physLine: isDark ? '#ec4899' : '#db2777',        // 物理足（ピンク/マゼンタ）
    auxLine: isDark ? '#a855f7' : '#9333ea',         // 補助線・境界
    bondText: isDark ? '#7dd3fc' : '#0369a1',
    physText: isDark ? '#f472b6' : '#be185d',
    nodeStroke: isDark ? '#ffffff' : '#0f172a',
    nodeFillDefault: isDark ? '#0284c7' : '#38bdf8', // テンソル基本色
    nodeIsometry: isDark ? '#10b981' : '#34d399',    // 等長写像（エメラルド）
    nodeDisentangler: isDark ? '#f59e0b' : '#fbbf24',// ディスエンタングラー（アンバー）
    nodeSvdS: isDark ? '#ef4444' : '#f87171',        // 特異値対角（レッド）
    gridLine: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'
  };

  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  const viewBoxWidth = 840;
  let viewBoxHeight = 520;

  // 定義 (defs): グラデーション・マーカー・ドロップシャドウ
  const defs = document.createElementNS(svgNS, 'defs');
  defs.innerHTML = `
    <linearGradient id="tensor-cyan-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#0284c7" />
    </linearGradient>
    <linearGradient id="tensor-emerald-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#34d399" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>
    <linearGradient id="tensor-amber-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>
    <linearGradient id="tensor-purple-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#c084fc" />
      <stop offset="100%" stop-color="#7e22ce" />
    </linearGradient>
    <linearGradient id="tensor-rose-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f43f5e" />
      <stop offset="100%" stop-color="#be123c" />
    </linearGradient>
    <filter id="tensor-shadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#000000" flood-opacity="${isDark ? '0.6' : '0.15'}" />
    </filter>
    <filter id="tensor-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
    <marker id="tensor-arrow-phys" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="${colors.physLine}" />
    </marker>
    <marker id="tensor-arrow-bond" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="${colors.bondLine}" />
    </marker>
  `;
  svg.appendChild(defs);

  // 背景
  const bgRect = document.createElementNS(svgNS, 'rect');
  bgRect.setAttribute('width', '100%');
  bgRect.setAttribute('height', '100%');
  bgRect.setAttribute('fill', colors.bg);
  svg.appendChild(bgRect);

  // ヘッダー情報（タイトル・バッジ）
  const headerG = document.createElementNS(svgNS, 'g');
  const titleText = parsed.title || getDefaultTitle(parsed.type);

  headerG.innerHTML = `
    <text x="24" y="38" font-size="20" font-weight="bold" fill="${colors.textMain}" font-family="system-ui, -apple-system, sans-serif">
      ${titleText}
    </text>
    <rect x="24" y="48" width="80" height="3" rx="1.5" fill="#38bdf8" />
  `;
  svg.appendChild(headerG);

  // コンテンツ描画グループ
  const contentG = document.createElementNS(svgNS, 'g');
  contentG.setAttribute('transform', 'translate(0, 60)');
  svg.appendChild(contentG);

  // 描画モードごとのディスパッチ
  let renderedSummary = '';

  switch (parsed.type) {
    case 'basic':
    case 'rank':
      renderedSummary = renderBasicTensors(contentG, parsed, colors, svgNS);
      viewBoxHeight = 480;
      break;

    case 'contraction':
    case 'product':
    case 'trace':
      renderedSummary = renderTensorContractions(contentG, parsed, colors, svgNS);
      viewBoxHeight = 520;
      break;

    case 'svd':
      renderedSummary = renderSvdModel(contentG, parsed, colors, svgNS);
      viewBoxHeight = 490;
      break;

    case 'mps':
    default:
      if (parsed.type === 'peps') {
        renderedSummary = renderPepsModel(contentG, parsed, colors, svgNS);
        viewBoxHeight = 560;
      } else if (parsed.type === 'ttn') {
        renderedSummary = renderTtnModel(contentG, parsed, colors, svgNS);
        viewBoxHeight = 530;
      } else if (parsed.type === 'mera') {
        renderedSummary = renderMeraModel(contentG, parsed, colors, svgNS);
        viewBoxHeight = 550;
      } else if (parsed.type === 'quantum') {
        renderedSummary = renderQuantumTensorModel(contentG, parsed, colors, svgNS);
        viewBoxHeight = 500;
      } else if (parsed.nodes.length > 0) {
        // カスタムノード指定モード
        renderedSummary = renderCustomTensorNetwork(contentG, parsed, colors, svgNS);
        viewBoxHeight = 520;
      } else {
        // デフォルト: 行列積状態 (MPS)
        renderedSummary = renderMpsModel(contentG, parsed, colors, svgNS);
        viewBoxHeight = 490;
      }
      break;
  }

  // 下部サマリーカード（解説・数式・縮約規則）
  if (parsed.showSummary && renderedSummary) {
    const summaryG = document.createElementNS(svgNS, 'g');
    const sumY = viewBoxHeight - 95;
    summaryG.setAttribute('transform', `translate(24, ${sumY})`);
    summaryG.innerHTML = `
      <rect x="0" y="0" width="${viewBoxWidth - 48}" height="80" rx="8" fill="${colors.cardBg}" stroke="${colors.cardBorder}" stroke-width="1.5" />
      <g transform="translate(16, 22)">
        <circle cx="6" cy="6" r="4" fill="#38bdf8" />
        <text x="18" y="10" font-size="13" font-weight="bold" fill="${colors.textMain}" font-family="system-ui, sans-serif">
          ペンローズ記法・テンソル縮約の物理的意義
        </text>
        <text x="18" y="32" font-size="12" fill="${colors.textMuted}" font-family="system-ui, sans-serif">
          ${renderedSummary.line1}
        </text>
        <text x="18" y="50" font-size="12" fill="${colors.textMuted}" font-family="system-ui, sans-serif">
          ${renderedSummary.line2}
        </text>
      </g>
    `;
    svg.appendChild(summaryG);
  }

  svg.setAttribute('viewBox', `0 0 ${viewBoxWidth} ${viewBoxHeight}`);
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.style.maxWidth = `${viewBoxWidth}px`;
  svg.style.display = 'block';
  svg.style.margin = '0 auto';

  container.appendChild(svg);
}

function getDefaultTitle(type) {
  switch (type) {
    case 'basic':
    case 'rank':
      return 'ペンローズのグラフ記法: 階数別基本テンソル (Rank 0〜4)';
    case 'contraction':
    case 'product':
      return 'テンソル縮約・演算 (内積・行列積・トレース)';
    case 'svd':
      return '特異値分解 (SVD: Singular Value Decomposition) と低ランク近似';
    case 'peps':
      return '射影エンタングルドペア状態 (PEPS: Projected Entangled Pair State - 2D)';
    case 'ttn':
      return '木状テンソルネットワーク (TTN: Tree Tensor Network)';
    case 'mera':
      return '多重位相反転繰り込み群 (MERA: Multi-scale Entanglement Renormalization Ansatz)';
    case 'quantum':
      return '量子ゲートとテンソルネットワーク表現';
    case 'mps':
    default:
      return '行列積状態 (MPS: Matrix Product State - 1D多体系)';
  }
}

// 共通ヘルパー: ノードの描画
function drawNode(g, x, y, shape, r, label, fill, stroke, textColor, svgNS) {
  const nodeG = document.createElementNS(svgNS, 'g');
  nodeG.setAttribute('transform', `translate(${x}, ${y})`);
  nodeG.setAttribute('filter', 'url(#tensor-shadow)');

  if (shape === 'rect' || shape === 'box') {
    const w = r * 2.2;
    const h = r * 1.8;
    const rect = document.createElementNS(svgNS, 'rect');
    rect.setAttribute('x', -w / 2);
    rect.setAttribute('y', -h / 2);
    rect.setAttribute('width', w);
    rect.setAttribute('height', h);
    rect.setAttribute('rx', 6);
    rect.setAttribute('fill', fill);
    rect.setAttribute('stroke', stroke);
    rect.setAttribute('stroke-width', '2.5');
    nodeG.appendChild(rect);
  } else if (shape === 'triangle' || shape === 'isometry') {
    // 等長写像（Isometry: 上に1脚、下に2脚などの三角/台形）
    const path = document.createElementNS(svgNS, 'path');
    const h = r * 1.8;
    const w = r * 2.0;
    path.setAttribute('d', `M 0 ${-h/1.4} L ${w/1.6} ${h/2} L ${-w/1.6} ${h/2} Z`);
    path.setAttribute('fill', fill);
    path.setAttribute('stroke', stroke);
    path.setAttribute('stroke-width', '2.5');
    nodeG.appendChild(path);
  } else if (shape === 'disentangler') {
    // 正方形/ダイヤモンド
    const rect = document.createElementNS(svgNS, 'rect');
    const s = r * 1.7;
    rect.setAttribute('x', -s / 2);
    rect.setAttribute('y', -s / 2);
    rect.setAttribute('width', s);
    rect.setAttribute('height', s);
    rect.setAttribute('rx', 4);
    rect.setAttribute('fill', fill);
    rect.setAttribute('stroke', stroke);
    rect.setAttribute('stroke-width', '2.5');
    nodeG.appendChild(rect);
  } else {
    // デフォルト: 円
    const circle = document.createElementNS(svgNS, 'circle');
    circle.setAttribute('r', r);
    circle.setAttribute('fill', fill);
    circle.setAttribute('stroke', stroke);
    circle.setAttribute('stroke-width', '2.5');
    nodeG.appendChild(circle);
  }

  if (label) {
    const txt = document.createElementNS(svgNS, 'text');
    txt.setAttribute('text-anchor', 'middle');
    txt.setAttribute('dominant-baseline', 'central');
    txt.setAttribute('fill', textColor || '#ffffff');
    txt.setAttribute('font-size', r > 20 ? '14' : '12');
    txt.setAttribute('font-weight', 'bold');
    txt.setAttribute('font-family', 'Cambria Math, KaTeX_Math, Times New Roman, serif');
    txt.textContent = formatTensorMathLabel(label);
    nodeG.appendChild(txt);
  }

  g.appendChild(nodeG);
  return nodeG;
}

// 共通ヘルパー: ボンド（線）の描画
function drawBond(g, x1, y1, x2, y2, color, strokeWidth, label, labelColor, svgNS, isDashed = false) {
  const line = document.createElementNS(svgNS, 'line');
  line.setAttribute('x1', x1);
  line.setAttribute('y1', y1);
  line.setAttribute('x2', x2);
  line.setAttribute('y2', y2);
  line.setAttribute('stroke', color);
  line.setAttribute('stroke-width', strokeWidth || 3);
  line.setAttribute('stroke-linecap', 'round');
  if (isDashed) line.setAttribute('stroke-dasharray', '5,4');
  g.appendChild(line);

  if (label) {
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    const txt = document.createElementNS(svgNS, 'text');
    txt.setAttribute('x', mx);
    txt.setAttribute('y', my - 8);
    txt.setAttribute('text-anchor', 'middle');
    txt.setAttribute('font-size', '12');
    txt.setAttribute('font-weight', 'bold');
    txt.setAttribute('fill', labelColor || color);
    txt.setAttribute('font-family', 'Cambria Math, KaTeX_Math, serif');
    txt.textContent = formatTensorMathLabel(label);
    g.appendChild(txt);
  }
}

// 共通ヘルパー: 開いた足（外部レグ）の描画
function drawLeg(g, x, y, dx, dy, color, strokeWidth, label, labelColor, svgNS) {
  const line = document.createElementNS(svgNS, 'line');
  const x2 = x + dx;
  const y2 = y + dy;
  line.setAttribute('x1', x);
  line.setAttribute('y1', y);
  line.setAttribute('x2', x2);
  line.setAttribute('y2', y2);
  line.setAttribute('stroke', color);
  line.setAttribute('stroke-width', strokeWidth || 3);
  line.setAttribute('stroke-linecap', 'round');
  g.appendChild(line);

  if (label) {
    const lx = x2 + (dx !== 0 ? Math.sign(dx) * 12 : 0);
    const ly = y2 + (dy !== 0 ? Math.sign(dy) * 14 : 0);
    const txt = document.createElementNS(svgNS, 'text');
    txt.setAttribute('x', lx);
    txt.setAttribute('y', ly);
    txt.setAttribute('text-anchor', dx < 0 ? 'end' : (dx > 0 ? 'start' : 'middle'));
    txt.setAttribute('dominant-baseline', dy > 0 ? 'hanging' : (dy < 0 ? 'auto' : 'central'));
    txt.setAttribute('font-size', '12');
    txt.setAttribute('font-weight', 'bold');
    txt.setAttribute('fill', labelColor || color);
    txt.setAttribute('font-family', 'Cambria Math, KaTeX_Math, serif');
    txt.textContent = formatTensorMathLabel(label);
    g.appendChild(txt);
  }
}

// ==========================================
// 1. 階数別基本テンソル (Rank 0〜4)
// ==========================================
function renderBasicTensors(g, parsed, colors, svgNS) {
  const items = [
    { title: 'スカラー (Rank 0)', formula: 's ∈ ℝ, ℂ', desc: '脚なし（点・数値）', x: 80, legs: [] },
    { title: 'ベクトル (Rank 1)', formula: 'v_i ∈ ℝ^d', desc: '脚 1本（1階テンソル）', x: 230, legs: [{ dx: 0, dy: 45, l: 'i' }] },
    { title: '行列 (Rank 2)', formula: 'M_{ij} ∈ ℝ^{d×d}', desc: '脚 2本（演算子・写像）', x: 400, legs: [{ dx: -45, dy: 0, l: 'i' }, { dx: 45, dy: 0, l: 'j' }] },
    { title: '3階テンソル (Rank 3)', formula: 'T_{ijk}', desc: '脚 3本（Y字/状態）', x: 570, legs: [{ dx: 0, dy: -42, l: 'k' }, { dx: -38, dy: 30, l: 'i' }, { dx: 38, dy: 30, l: 'j' }] },
    { title: '4階テンソル (Rank 4)', formula: 'A_{ijkl}', desc: '脚 4本（2Dサイト演算子）', x: 740, legs: [{ dx: 0, dy: -42, l: 'k' }, { dx: 0, dy: 42, l: 'l' }, { dx: -42, dy: 0, l: 'i' }, { dx: 42, dy: 0, l: 'j' }] }
  ];

  const yCenter = 170;

  items.forEach((item, idx) => {
    // タイトル & 数式
    const cardG = document.createElementNS(svgNS, 'g');
    cardG.innerHTML = `
      <text x="${item.x}" y="50" text-anchor="middle" font-size="13" font-weight="bold" fill="${colors.textMain}">${item.title}</text>
      <text x="${item.x}" y="72" text-anchor="middle" font-size="13" fill="#38bdf8" font-family="Cambria Math, KaTeX_Math, serif">${item.formula}</text>
      <text x="${item.x}" y="92" text-anchor="middle" font-size="10.5" fill="${colors.textMuted}">${item.desc}</text>
    `;
    g.appendChild(cardG);

    // 脚（レグ）の描画
    item.legs.forEach(leg => {
      drawLeg(g, item.x, yCenter, leg.dx, leg.dy, colors.physLine, 3.2, leg.l, colors.physText, svgNS);
    });

    // テンソルノード
    const labels = ['s', 'v', 'M', 'T', 'A'];
    drawNode(g, item.x, yCenter, 'circle', 24, labels[idx], 'url(#tensor-cyan-grad)', colors.nodeStroke, '#ffffff', svgNS);
  });

  return {
    line1: '• ノード（図形）はテンソルを表し、そこから出る「脚（Leg / Index）」の総数がテンソルの階数（Rank）を決定します。',
    line2: '• 脚の自由端（開いた足）は外部インデックスを表し、脚の接合（結合線）はアインシュタインの縮約（総和記号 ∑）を直観化します。'
  };
}

// ==========================================
// 2. テンソル縮約・積・トレース
// ==========================================
function renderTensorContractions(g, parsed, colors, svgNS) {
  // 左: ベクトル内積 ⟨u|v⟩ = ∑ u_i v_i
  const g1 = document.createElementNS(svgNS, 'g');
  g1.setAttribute('transform', 'translate(100, 30)');
  g1.innerHTML = `
    <text x="70" y="20" text-anchor="middle" font-size="14" font-weight="bold" fill="${colors.textMain}">① ベクトルの内積</text>
    <text x="70" y="40" text-anchor="middle" font-size="13" fill="#38bdf8" font-family="Cambria Math, serif">⟨u|v⟩ = ∑ᵢ uᵢ vᵢ</text>
    <text x="70" y="58" text-anchor="middle" font-size="11" fill="${colors.textMuted}">脚が1本で結ばれ閉じたスカラー</text>
  `;
  drawBond(g1, 25, 120, 115, 120, colors.bondLine, 3.5, 'i', colors.bondText, svgNS);
  drawNode(g1, 25, 120, 'circle', 22, 'u†', 'url(#tensor-purple-grad)', colors.nodeStroke, '#ffffff', svgNS);
  drawNode(g1, 115, 120, 'circle', 22, 'v', 'url(#tensor-cyan-grad)', colors.nodeStroke, '#ffffff', svgNS);
  g.appendChild(g1);

  // 中央: 行列積 C_ik = ∑_j A_ij B_jk
  const g2 = document.createElementNS(svgNS, 'g');
  g2.setAttribute('transform', 'translate(360, 30)');
  g2.innerHTML = `
    <text x="80" y="20" text-anchor="middle" font-size="14" font-weight="bold" fill="${colors.textMain}">② 行列の積 (結合・縮約)</text>
    <text x="80" y="40" text-anchor="middle" font-size="13" fill="#38bdf8" font-family="Cambria Math, serif">C_{ik} = ∑ⱼ A_{ij} B_{jk}</text>
    <text x="80" y="58" text-anchor="middle" font-size="11" fill="${colors.textMuted}">内部足 j で縮約され、両端に開いた足 i, k</text>
  `;
  drawLeg(g2, 25, 120, -40, 0, colors.physLine, 3.2, 'i', colors.physText, svgNS);
  drawBond(g2, 25, 120, 135, 120, colors.bondLine, 3.5, 'j', colors.bondText, svgNS);
  drawLeg(g2, 135, 120, 40, 0, colors.physLine, 3.2, 'k', colors.physText, svgNS);
  drawNode(g2, 25, 120, 'rect', 22, 'A', 'url(#tensor-cyan-grad)', colors.nodeStroke, '#ffffff', svgNS);
  drawNode(g2, 135, 120, 'rect', 22, 'B', 'url(#tensor-emerald-grad)', colors.nodeStroke, '#ffffff', svgNS);
  g.appendChild(g2);

  // 右: トレース Tr(A) = ∑_i A_ii
  const g3 = document.createElementNS(svgNS, 'g');
  g3.setAttribute('transform', 'translate(640, 30)');
  g3.innerHTML = `
    <text x="60" y="20" text-anchor="middle" font-size="14" font-weight="bold" fill="${colors.textMain}">③ 行列のトレース (閉路環)</text>
    <text x="60" y="40" text-anchor="middle" font-size="13" fill="#38bdf8" font-family="Cambria Math, serif">Tr(A) = ∑ᵢ A_{ii}</text>
    <text x="60" y="58" text-anchor="middle" font-size="11" fill="${colors.textMuted}">2本の脚がループして自己結合</text>
  `;
  // ループパス
  const loopPath = document.createElementNS(svgNS, 'path');
  loopPath.setAttribute('d', 'M 35 120 C -25 70, -25 170, 35 120');
  loopPath.setAttribute('fill', 'none');
  loopPath.setAttribute('stroke', colors.bondLine);
  loopPath.setAttribute('stroke-width', '3.5');
  g3.appendChild(loopPath);

  const loopTxt = document.createElementNS(svgNS, 'text');
  loopTxt.setAttribute('x', -22);
  loopTxt.setAttribute('y', 124);
  loopTxt.setAttribute('text-anchor', 'middle');
  loopTxt.setAttribute('font-size', '12');
  loopTxt.setAttribute('font-weight', 'bold');
  loopTxt.setAttribute('fill', colors.bondText);
  loopTxt.textContent = 'i';
  g3.appendChild(loopTxt);

  drawNode(g3, 60, 120, 'rect', 22, 'A', 'url(#tensor-amber-grad)', colors.nodeStroke, '#ffffff', svgNS);
  g.appendChild(g3);

  return {
    line1: '• 結合線（Bond）は、2つのインデックスを同一視して和をとる「縮約（Contraction）」を表現します。',
    line2: '• ループはトレース（自己縮約）を表し、開いた足が一切残らないネットワーク全体の値は厳密に「スカラー量」となります。'
  };
}

// ==========================================
// 3. 特異値分解 (SVD: M = U S V†)
// ==========================================
function renderSvdModel(g, parsed, colors, svgNS) {
  // 左: 分解前の行列 M
  const gLeft = document.createElementNS(svgNS, 'g');
  gLeft.setAttribute('transform', 'translate(140, 60)');
  gLeft.innerHTML = `
    <text x="0" y="0" text-anchor="middle" font-size="14" font-weight="bold" fill="${colors.textMain}">巨大行列 / 結合テンソル M</text>
    <text x="0" y="22" text-anchor="middle" font-size="13" fill="#38bdf8" font-family="Cambria Math, serif">M_{ij} ∈ ℝ^{d_1 × d_2}</text>
  `;
  drawLeg(gLeft, 0, 90, -50, 0, colors.physLine, 3.5, 'i', colors.physText, svgNS);
  drawLeg(gLeft, 0, 90, 50, 0, colors.physLine, 3.5, 'j', colors.physText, svgNS);
  drawNode(gLeft, 0, 90, 'circle', 28, 'M', 'url(#tensor-purple-grad)', colors.nodeStroke, '#ffffff', svgNS);
  g.appendChild(gLeft);

  // 中央の矢印: SVD による特異値分解
  const arrowG = document.createElementNS(svgNS, 'g');
  arrowG.setAttribute('transform', 'translate(310, 150)');
  arrowG.innerHTML = `
    <line x1="0" y1="0" x2="60" y2="0" stroke="${colors.textMuted}" stroke-width="2.5" marker-end="url(#tensor-arrow-bond)" />
    <text x="30" y="-12" text-anchor="middle" font-size="12" font-weight="bold" fill="#38bdf8">SVD 分解</text>
    <text x="30" y="20" text-anchor="middle" font-size="10.5" fill="${colors.textMuted}">低ランク近似</text>
  `;
  g.appendChild(arrowG);

  // 右: SVD 分解後 U - S - V†
  const gRight = document.createElementNS(svgNS, 'g');
  gRight.setAttribute('transform', 'translate(560, 60)');
  gRight.innerHTML = `
    <text x="50" y="0" text-anchor="middle" font-size="14" font-weight="bold" fill="${colors.textMain}">SVD表現: M = U S V†</text>
    <text x="50" y="22" text-anchor="middle" font-size="13" fill="#38bdf8" font-family="Cambria Math, serif">∑_α U_{iα} S_α V†_{αj}</text>
  `;

  // 脚とボンド
  drawLeg(gRight, -50, 90, -45, 0, colors.physLine, 3.5, 'i', colors.physText, svgNS);
  drawBond(gRight, -50, 90, 50, 90, colors.bondLine, 3.5, 'α', colors.bondText, svgNS);
  drawBond(gRight, 50, 90, 150, 90, colors.bondLine, 3.5, 'α', colors.bondText, svgNS);
  drawLeg(gRight, 150, 90, 45, 0, colors.physLine, 3.5, 'j', colors.physText, svgNS);

  // U, S, V† ノード
  drawNode(gRight, -50, 90, 'isometry', 24, 'U', 'url(#tensor-emerald-grad)', colors.nodeStroke, '#ffffff', svgNS);
  drawNode(gRight, 50, 90, 'circle', 16, 'S', 'url(#tensor-rose-grad)', colors.nodeStroke, '#ffffff', svgNS);
  drawNode(gRight, 150, 90, 'isometry', 24, 'V†', 'url(#tensor-cyan-grad)', colors.nodeStroke, '#ffffff', svgNS);
  g.appendChild(gRight);

  return {
    line1: '• 特異値分解 (SVD) は、テンソルネットワークにおいてエンタングルメントの切断やボンド次元圧縮（DMRG）の中核アルゴリズムです。',
    line2: '• 中央の特異値ノード S の上位 χ 個のみを残すことで、指数関数的な状態空間を多項式計算量へと極限まで圧縮します。'
  };
}

// ==========================================
// 4. 行列積状態 (MPS: Matrix Product State)
// ==========================================
function renderMpsModel(g, parsed, colors, svgNS) {
  const n = parsed.sites || 5;
  const spacing = Math.min(130, Math.floor(660 / (n - 1)));
  const startX = 420 - ((n - 1) * spacing) / 2;
  const yNode = 120;
  const legLen = 50;

  const mpsG = document.createElementNS(svgNS, 'g');

  // サブヘッダー解説
  const subHead = document.createElementNS(svgNS, 'g');
  subHead.innerHTML = `
    <text x="420" y="15" text-anchor="middle" font-size="14" fill="#38bdf8" font-family="Cambria Math, serif">
      |Ψ⟩ = ∑_{s₁…s_N} Tr(A^{[1]}_{s₁} A^{[2]}_{s₂} … A^{[N]}_{s_N}) |s₁s₂…s_N⟩
    </text>
    <text x="420" y="38" text-anchor="middle" font-size="11.5" fill="${colors.textMuted}">
      1次元量子スピン鎖（局所物理次元 d、仮想エンタングルメント次元 χ / D）
    </text>
  `;
  g.appendChild(subHead);

  // ボンド（水平仮想ボンド線）
  for (let i = 0; i < n - 1; i++) {
    const x1 = startX + i * spacing;
    const x2 = startX + (i + 1) * spacing;
    drawBond(mpsG, x1, yNode, x2, yNode, colors.bondLine, 4, parsed.bondLabel || 'χ', colors.bondText, svgNS);
  }

  // 物理足（下向き開放レグ）
  for (let i = 0; i < n; i++) {
    const x = startX + i * spacing;
    const pLabel = `${parsed.physLabel || 's'}${i + 1}`;
    drawLeg(mpsG, x, yNode, 0, legLen, colors.physLine, 3.5, pLabel, colors.physText, svgNS);
  }

  // テンソルノード (A1, A2, ...)
  for (let i = 0; i < n; i++) {
    const x = startX + i * spacing;
    const label = `${parsed.nodePrefix || 'A'}${i + 1}`;
    // 端点は境界ベクトル、中央は3階テンソル
    const isBoundary = (i === 0 || i === n - 1);
    const grad = isBoundary ? 'url(#tensor-purple-grad)' : 'url(#tensor-cyan-grad)';
    drawNode(mpsG, x, yNode, 'circle', 25, label, grad, colors.nodeStroke, '#ffffff', svgNS);
  }

  // エンタングルメントカット境界の図示（破線）
  const cutX = startX + Math.floor(n / 2) * spacing - spacing / 2;
  const cutLine = document.createElementNS(svgNS, 'line');
  cutLine.setAttribute('x1', cutX);
  cutLine.setAttribute('y1', yNode - 55);
  cutLine.setAttribute('x2', cutX);
  cutLine.setAttribute('y2', yNode + 55);
  cutLine.setAttribute('stroke', '#ef4444');
  cutLine.setAttribute('stroke-width', '2');
  cutLine.setAttribute('stroke-dasharray', '4,4');
  mpsG.appendChild(cutLine);

  const cutTxt = document.createElementNS(svgNS, 'text');
  cutTxt.setAttribute('x', cutX);
  cutTxt.setAttribute('y', yNode - 65);
  cutTxt.setAttribute('text-anchor', 'middle');
  cutTxt.setAttribute('font-size', '11');
  cutTxt.setAttribute('font-weight', 'bold');
  cutTxt.setAttribute('fill', '#f87171');
  cutTxt.textContent = '二分割カット (S_vN ≤ ln χ)';
  mpsG.appendChild(cutTxt);

  g.appendChild(mpsG);

  return {
    line1: '• MPS（行列積状態）は、1次元量子スピン鎖の基底状態を「面積則（Area Law）」に従って効率よく厳密近似する標準表現です。',
    line2: '• 水平ボンド次元 χ がエンタングルメントの上限（S_vN ≤ ln χ）を制御し、DMRG（密度行列繰り込み群）の基礎構造をなします。'
  };
}

// ==========================================
// 5. 射影エンタングルドペア状態 (PEPS - 2D)
// ==========================================
function renderPepsModel(g, parsed, colors, svgNS) {
  const rows = 3;
  const cols = 4;
  const cellW = 140;
  const cellH = 75;
  const startX = 420 - ((cols - 1) * cellW) / 2;
  const startY = 70;

  const pepsG = document.createElementNS(svgNS, 'g');

  // 水平ボンド
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols - 1; c++) {
      const x1 = startX + c * cellW;
      const y1 = startY + r * cellH;
      const x2 = startX + (c + 1) * cellW;
      drawBond(pepsG, x1, y1, x2, y1, colors.bondLine, 3.5, r === 0 ? 'D' : '', colors.bondText, svgNS);
    }
  }

  // 垂直ボンド
  for (let r = 0; r < rows - 1; r++) {
    for (let c = 0; c < cols; c++) {
      const x1 = startX + c * cellW;
      const y1 = startY + r * cellH;
      const y2 = startY + (r + 1) * cellH;
      drawBond(pepsG, x1, y1, x1, y2, colors.bondLine, 3.5, c === 0 ? 'D' : '', colors.bondText, svgNS);
    }
  }

  // 物理足（各ノードから斜め手前に突き出る脚）
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = startX + c * cellW;
      const y = startY + r * cellH;
      drawLeg(pepsG, x, y, -16, 26, colors.physLine, 3.2, (r === 2 && c === 0) ? 's_{3,1}' : '', colors.physText, svgNS);
    }
  }

  // テンソルノード
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = startX + c * cellW;
      const y = startY + r * cellH;
      const label = `T_{${r+1}${c+1}}`;
      drawNode(pepsG, x, y, 'circle', 20, label, 'url(#tensor-cyan-grad)', colors.nodeStroke, '#ffffff', svgNS);
    }
  }

  g.appendChild(pepsG);

  return {
    line1: '• PEPS（2次元テンソルネットワーク）は、量子磁性体や高温超伝導など2次元強相関電子系の面積則を満たす自然な拡張です。',
    line2: '• 各格子点テンソルは4つの仮想ボンド（D）と1つの物理足（d）を持ち、合計5階テンソルとして2次元空間の相関を完全に担います。'
  };
}

// ==========================================
// 6. 木状テンソルネットワーク (TTN)
// ==========================================
function renderTtnModel(g, parsed, colors, svgNS) {
  const ttnG = document.createElementNS(svgNS, 'g');

  // 3層二分木
  // 根: (420, 60)
  // 中間層: (260, 140), (580, 140)
  // 葉層: (180, 220), (340, 220), (500, 220), (660, 220)
  const root = { x: 420, y: 50, label: 'Ψ' };
  const l2 = [
    { x: 280, y: 130, label: 'W₁' },
    { x: 560, y: 130, label: 'W₂' }
  ];
  const l3 = [
    { x: 180, y: 210, label: 'U₁' },
    { x: 380, y: 210, label: 'U₂' },
    { x: 460, y: 210, label: 'U₃' },
    { x: 660, y: 210, label: 'U₄' }
  ];

  // 根 -> L2
  l2.forEach(n => drawBond(ttnG, root.x, root.y, n.x, n.y, colors.bondLine, 3.5, 'χ', colors.bondText, svgNS));
  // L2 -> L3
  drawBond(ttnG, l2[0].x, l2[0].y, l3[0].x, l3[0].y, colors.bondLine, 3.5, '', colors.bondText, svgNS);
  drawBond(ttnG, l2[0].x, l2[0].y, l3[1].x, l3[1].y, colors.bondLine, 3.5, '', colors.bondText, svgNS);
  drawBond(ttnG, l2[1].x, l2[1].y, l3[2].x, l3[2].y, colors.bondLine, 3.5, '', colors.bondText, svgNS);
  drawBond(ttnG, l2[1].x, l2[1].y, l3[3].x, l3[3].y, colors.bondLine, 3.5, '', colors.bondText, svgNS);

  // L3 (葉) から下への物理足
  l3.forEach((n, idx) => {
    drawLeg(ttnG, n.x - 18, n.y, 0, 45, colors.physLine, 3.2, `s_{${idx*2+1}}`, colors.physText, svgNS);
    drawLeg(ttnG, n.x + 18, n.y, 0, 45, colors.physLine, 3.2, `s_{${idx*2+2}}`, colors.physText, svgNS);
  });

  // ノード描画
  l3.forEach(n => drawNode(ttnG, n.x, n.y, 'isometry', 22, n.label, 'url(#tensor-emerald-grad)', colors.nodeStroke, '#ffffff', svgNS));
  l2.forEach(n => drawNode(ttnG, n.x, n.y, 'isometry', 23, n.label, 'url(#tensor-amber-grad)', colors.nodeStroke, '#ffffff', svgNS));
  drawNode(ttnG, root.x, root.y, 'circle', 26, root.label, 'url(#tensor-purple-grad)', colors.nodeStroke, '#ffffff', svgNS);

  g.appendChild(ttnG);

  return {
    line1: '• TTN（木状テンソルネットワーク）は、階層的なスケール変換と幾何学的繰り込みを木構造（二分木）でモデル化します。',
    line2: '• ループが存在しないため縮約が厳密かつ高速に実行でき、量子化学の多参照電子状態計算や量子回路圧縮に広く利用されます。'
  };
}

// ==========================================
// 7. 多重位相反転繰り込み群 (MERA)
// ==========================================
function renderMeraModel(g, parsed, colors, svgNS) {
  const meraG = document.createElementNS(svgNS, 'g');

  // MERA層: 等長射影(Isometry: 三角/台形) と ディスエンタングラー(Disentangler: 四角) の交互配置
  // 最上部: 頂点テンソル
  const topX = 420;
  const topY = 40;

  // 層1: 等長射影 (2個)
  const iso1 = [{ x: 300, y: 110 }, { x: 540, y: 110 }];
  // 層1.5: ディスエンタングラー (1個)
  const dis1 = [{ x: 420, y: 170 }];
  // 層2: 等長射影 (4個)
  const iso2 = [{ x: 180, y: 220 }, { x: 340, y: 220 }, { x: 500, y: 220 }, { x: 660, y: 220 }];

  // 結線
  drawBond(meraG, topX, topY, iso1[0].x, iso1[0].y, colors.bondLine, 3, '', colors.bondText, svgNS);
  drawBond(meraG, topX, topY, iso1[1].x, iso1[1].y, colors.bondLine, 3, '', colors.bondText, svgNS);

  drawBond(meraG, iso1[0].x, iso1[0].y, dis1[0].x, dis1[0].y, colors.bondLine, 3, '', colors.bondText, svgNS);
  drawBond(meraG, iso1[1].x, iso1[1].y, dis1[0].x, dis1[0].y, colors.bondLine, 3, '', colors.bondText, svgNS);

  drawBond(meraG, iso1[0].x, iso1[0].y, iso2[0].x, iso2[0].y, colors.bondLine, 3, '', colors.bondText, svgNS);
  drawBond(meraG, dis1[0].x, dis1[0].y, iso2[1].x, iso2[1].y, colors.bondLine, 3, '', colors.bondText, svgNS);
  drawBond(meraG, dis1[0].x, dis1[0].y, iso2[2].x, iso2[2].y, colors.bondLine, 3, '', colors.bondText, svgNS);
  drawBond(meraG, iso1[1].x, iso1[1].y, iso2[3].x, iso2[3].y, colors.bondLine, 3, '', colors.bondText, svgNS);

  // 物理足（最下層）
  iso2.forEach((n, idx) => {
    drawLeg(meraG, n.x - 20, n.y, 0, 40, colors.physLine, 3.2, `s_{${idx*2+1}}`, colors.physText, svgNS);
    drawLeg(meraG, n.x + 20, n.y, 0, 40, colors.physLine, 3.2, `s_{${idx*2+2}}`, colors.physText, svgNS);
  });

  // ノード描画
  iso2.forEach(n => drawNode(meraG, n.x, n.y, 'isometry', 20, 'w', 'url(#tensor-emerald-grad)', colors.nodeStroke, '#ffffff', svgNS));
  dis1.forEach(n => drawNode(meraG, n.x, n.y, 'disentangler', 18, 'u', 'url(#tensor-amber-grad)', colors.nodeStroke, '#ffffff', svgNS));
  iso1.forEach(n => drawNode(meraG, n.x, n.y, 'isometry', 22, 'w', 'url(#tensor-emerald-grad)', colors.nodeStroke, '#ffffff', svgNS));
  drawNode(meraG, topX, topY, 'circle', 24, 'Ψ', 'url(#tensor-purple-grad)', colors.nodeStroke, '#ffffff', svgNS);

  // 凡例
  const legendG = document.createElementNS(svgNS, 'g');
  legendG.setAttribute('transform', 'translate(50, 40)');
  legendG.innerHTML = `
    <rect x="0" y="0" width="140" height="70" rx="6" fill="${colors.cardBg}" stroke="${colors.cardBorder}" />
    <polygon points="15,20 25,32 5,32" fill="${colors.nodeIsometry}" />
    <text x="35" y="28" font-size="11" fill="${colors.textMain}">等長写像 w (Isometry)</text>
    <rect x="7" y="44" width="16" height="16" rx="2" fill="${colors.nodeDisentangler}" />
    <text x="35" y="56" font-size="11" fill="${colors.textMain}">局所もつれ除去 u</text>
  `;
  meraG.appendChild(legendG);

  g.appendChild(meraG);

  return {
    line1: '• MERAは、量子臨界点（共形場理論 CFT）における長距離エンタングルメントとAdS/CFT対応（ホログラフィー）を捉える構造です。',
    line2: '• ディスエンタングラー u が短距離の局所もつれを取り除き、等長写像 w がスケール変換を行うことで双曲的時空（AdS）を幾何学化します。'
  };
}

// ==========================================
// 8. 量子回路・量子ゲートテンソル
// ==========================================
function renderQuantumTensorModel(g, parsed, colors, svgNS) {
  const qG = document.createElementNS(svgNS, 'g');
  qG.setAttribute('transform', 'translate(80, 50)');

  // 2本の量子ビット線 (q0, q1)
  const y0 = 60;
  const y1 = 150;

  // 量子ビット初期状態 |0⟩
  qG.innerHTML = `
    <text x="0" y="${y0 + 5}" font-size="14" font-weight="bold" fill="${colors.textMain}">|q₀⟩</text>
    <text x="0" y="${y1 + 5}" font-size="14" font-weight="bold" fill="${colors.textMain}">|q₁⟩</text>
  `;

  // ワイヤ（量子状態の流れ）
  drawBond(qG, 40, y0, 620, y0, colors.bondLine, 3, '', colors.bondText, svgNS);
  drawBond(qG, 40, y1, 620, y1, colors.bondLine, 3, '', colors.bondText, svgNS);

  // ゲートノード (H, CNOT, U)
  // 1. Hadamard ゲート
  drawNode(qG, 130, y0, 'rect', 20, 'H', 'url(#tensor-cyan-grad)', colors.nodeStroke, '#ffffff', svgNS);

  // 2. 2量子ビット相互作用テンソル (CNOT / 制御U)
  const cnotLine = document.createElementNS(svgNS, 'line');
  cnotLine.setAttribute('x1', 280);
  cnotLine.setAttribute('y1', y0);
  cnotLine.setAttribute('x2', 280);
  cnotLine.setAttribute('y2', y1);
  cnotLine.setAttribute('stroke', colors.physLine);
  cnotLine.setAttribute('stroke-width', '3.5');
  qG.appendChild(cnotLine);

  // コントロール点
  const ctrlDot = document.createElementNS(svgNS, 'circle');
  ctrlDot.setAttribute('cx', 280);
  ctrlDot.setAttribute('cy', y0);
  ctrlDot.setAttribute('r', 7);
  ctrlDot.setAttribute('fill', colors.physLine);
  qG.appendChild(ctrlDot);

  // ターゲットノード (X)
  drawNode(qG, 280, y1, 'circle', 18, '⊕', 'url(#tensor-rose-grad)', colors.nodeStroke, '#ffffff', svgNS);

  // 3. 汎用2量子ビットテンソル U_{ij}^{kl}
  const bigUG = document.createElementNS(svgNS, 'g');
  bigUG.setAttribute('transform', 'translate(470, 105)');
  const uRect = document.createElementNS(svgNS, 'rect');
  uRect.setAttribute('x', -35);
  uRect.setAttribute('y', -65);
  uRect.setAttribute('width', 70);
  uRect.setAttribute('height', 130);
  uRect.setAttribute('rx', 8);
  uRect.setAttribute('fill', 'url(#tensor-purple-grad)');
  uRect.setAttribute('stroke', colors.nodeStroke);
  uRect.setAttribute('stroke-width', '2.5');
  bigUG.appendChild(uRect);

  const uTxt = document.createElementNS(svgNS, 'text');
  uTxt.setAttribute('text-anchor', 'middle');
  uTxt.setAttribute('dominant-baseline', 'central');
  uTxt.setAttribute('fill', '#ffffff');
  uTxt.setAttribute('font-size', '16');
  uTxt.setAttribute('font-weight', 'bold');
  uTxt.textContent = 'U';
  bigUG.appendChild(uTxt);
  qG.appendChild(bigUG);

  // 右端の測定記号
  qG.innerHTML += `
    <text x="640" y="${y0 + 5}" font-size="14" fill="#38bdf8" font-family="Cambria Math, serif">⟨m₀|</text>
    <text x="640" y="${y1 + 5}" font-size="14" fill="#38bdf8" font-family="Cambria Math, serif">⟨m₁|</text>
  `;

  g.appendChild(qG);

  return {
    line1: '• 量子回路のあらゆる量子ゲート（ユニタリ演算子）は、入力と出力のインデックスを持つテンソルとして厳密にモデル化できます。',
    line2: '• ゲートの直列接続は行列積、並列実行はテンソル積（Kronecker積 ⊗）に対応し、回路全体の縮約計算はテンソル縮約順序最適化問題に帰着します。'
  };
}

// ==========================================
// 9. カスタム自由ノード指定モード
// ==========================================
function renderCustomTensorNetwork(g, parsed, colors, svgNS) {
  const customG = document.createElementNS(svgNS, 'g');

  // ノードマップ
  const nodeMap = {};
  parsed.nodes.forEach(n => {
    nodeMap[n.id] = n;
  });

  // エッジ描画
  parsed.edges.forEach(e => {
    const fromNode = nodeMap[e.from];
    const toNode = nodeMap[e.to];
    if (fromNode && toNode) {
      drawBond(customG, fromNode.x, fromNode.y, toNode.x, toNode.y, colors.bondLine, 3.5, e.label, colors.bondText, svgNS, e.style === 'dashed');
    }
  });

  // レグ描画
  parsed.legs.forEach(l => {
    const n = nodeMap[l.node];
    if (n) {
      let dx = 0;
      let dy = 0;
      const len = l.len || 40;
      if (l.dir === 'up') dy = -len;
      else if (l.dir === 'down') dy = len;
      else if (l.dir === 'left') dx = -len;
      else if (l.dir === 'right') dx = len;
      drawLeg(customG, n.x, n.y, dx, dy, colors.physLine, 3.2, l.label, colors.physText, svgNS);
    }
  });

  // ループ描画
  parsed.loops.forEach(lp => {
    const n = nodeMap[lp.node];
    if (n) {
      const loopPath = document.createElementNS(svgNS, 'path');
      loopPath.setAttribute('d', `M ${n.x} ${n.y - n.r} C ${n.x - 50} ${n.y - 70}, ${n.x - 50} ${n.y + 70}, ${n.x} ${n.y + n.r}`);
      loopPath.setAttribute('fill', 'none');
      loopPath.setAttribute('stroke', colors.bondLine);
      loopPath.setAttribute('stroke-width', '3');
      customG.appendChild(loopPath);
    }
  });

  // ノード描画
  parsed.nodes.forEach(n => {
    const fill = n.fill || 'url(#tensor-cyan-grad)';
    drawNode(customG, n.x, n.y, n.shape, n.r, n.label, fill, colors.nodeStroke, '#ffffff', svgNS);
  });

  g.appendChild(customG);

  return {
    line1: parsed.note || '• ユーザー指定のテンソルノードとボンド（縮約線）・レグ（物理足）によるカスタム構成図です。',
    line2: '• ペンローズ記法に従い、幾何学的結合関係からテンソルの縮約順序や対称性を直観的に把握できます。'
  };
}
