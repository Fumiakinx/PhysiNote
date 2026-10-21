// ==========================================
// 組織階層図（オーガニゼーションチャート / Org Chart）パーサー & SVG描画エンジン
// ==========================================

function getOrgTextWidth(str) {
  if (!str) return 0;
  let w = 0;
  for (let i = 0; i < str.length; i++) {
    w += str.charCodeAt(i) > 255 ? 13 : 7.5;
  }
  return w;
}

function escapeOrgHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const ORG_THEMES = {
  executive: { bg: '#1e3a8a', titleCol: '#ffffff', subCol: '#bfdbfe', border: '#1e40af', tagBg: '#3b82f6', tagCol: '#ffffff' }, // 役員・トップ
  management: { bg: '#ffffff', titleCol: '#1e293b', subCol: '#475569', border: '#0284c7', tagBg: '#e0f2fe', tagCol: '#0369a1' }, // 本部・統括
  staff: { bg: '#f8fafc', titleCol: '#334155', subCol: '#64748b', border: '#94a3b8', tagBg: '#f1f5f9', tagCol: '#475569' }, // 監査・スタッフ
  department: { bg: '#ffffff', titleCol: '#0f172a', subCol: '#475569', border: '#cbd5e1', tagBg: '#f1f5f9', tagCol: '#334155' }, // 部・課
};

/**
 * \orgchart{ ... } 構文のパース
 */
function parseOrgChart(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;
  let text = rawText.trim();

  // \orgchart{...} または \organization{...} のラッパーを解除
  const wrapperMatch = text.match(/^\\(?:orgchart|organization|org)\{([\s\S]*)\}$/i);
  if (wrapperMatch) {
    text = wrapperMatch[1].trim();
  }

  let title = '';
  const nodeDefs = new Map(); // id -> { name, tag, color, type }
  const rawEdges = []; // { from, to, type: 'direct' | 'staff', tag, color }

  const lines = text.split(/[\n;]+/).map((l) => l.trim()).filter(Boolean);

  lines.forEach((line) => {
    // タイトル行: title: "..."
    const titleMatch = line.match(/^title\s*:\s*["']?([^"']+)["']?$/i);
    if (titleMatch) {
      title = titleMatch[1].trim();
      return;
    }

    // スタッフ/監査ライン（点線）: "親" -- "子" [タグ, 色]
    const staffMatch = line.match(/^["']?([^"'\-]+?)["']?\s*--\s*["']?([^"'\[]+?)["']?(?:\s*\[(.*?)\])?$/);
    if (staffMatch) {
      const from = staffMatch[1].trim();
      const to = staffMatch[2].trim();
      let tag = '';
      let color = '';
      if (staffMatch[3]) {
        const parts = staffMatch[3].split(',').map((p) => p.trim());
        tag = parts[0] || '';
        color = parts[1] || '';
      }
      rawEdges.push({ from, to, type: 'staff', tag, color });
      return;
    }

    // 直属ライン（実線）: "親" -> "子" [タグ, 色]
    const edgeMatch = line.match(/^["']?([^"'\->]+?)["']?\s*->\s*["']?([^"'\[]+?)["']?(?:\s*\[(.*?)\])?$/);
    if (edgeMatch) {
      const from = edgeMatch[1].trim();
      const to = edgeMatch[2].trim();
      let tag = '';
      let color = '';
      if (edgeMatch[3]) {
        const parts = edgeMatch[3].split(',').map((p) => p.trim());
        tag = parts[0] || '';
        color = parts[1] || '';
      }
      rawEdges.push({ from, to, type: 'direct', tag, color });
    }
  });

  if (rawEdges.length === 0) return null;

  // ノードマップ作成
  const nodeMap = new Map();
  function getOrCreateNode(name) {
    if (!nodeMap.has(name)) {
      // "役職 / 氏名" の分割判定
      let role = '';
      let personName = name;
      if (name.includes(' / ')) {
        const parts = name.split(' / ').map((s) => s.trim());
        role = parts[0];
        personName = parts[1];
      } else if (name.includes('\n')) {
        const parts = name.split('\n').map((s) => s.trim());
        role = parts[0];
        personName = parts[1];
      }

      nodeMap.set(name, {
        id: name,
        name: personName,
        role: role,
        tag: '',
        color: '',
        parents: [],
        directChildren: [],
        staffChildren: [],
        depth: 0,
        x: 0,
        y: 0,
        w: 160,
        h: 56,
        subtreeW: 0,
      });
    }
    return nodeMap.get(name);
  }

  rawEdges.forEach((e) => {
    const p = getOrCreateNode(e.from);
    const c = getOrCreateNode(e.to);
    if (e.tag && !c.tag) c.tag = e.tag;
    if (e.color && !c.color) c.color = e.color;

    if (e.type === 'staff') {
      p.staffChildren.push({ node: c, edge: e });
      c.parents.push({ node: p, edge: e, type: 'staff' });
    } else {
      p.directChildren.push({ node: c, edge: e });
      c.parents.push({ node: p, edge: e, type: 'direct' });
    }
  });

  // ルートノードの特定（直属の親を持たないノード）
  let root = null;
  for (const n of nodeMap.values()) {
    const hasDirectParent = n.parents.some((p) => p.type === 'direct');
    if (!hasDirectParent) {
      root = n;
      break;
    }
  }
  if (!root && nodeMap.size > 0) {
    root = nodeMap.values().next().value;
  }
  if (!root) return null;

  // 階層（Depth）とカード寸法の算出
  nodeMap.forEach((n) => {
    // 役職＋氏名、または長い部署名に応じた寸法
    const maxTextW = Math.max(getOrgTextWidth(n.role), getOrgTextWidth(n.name));
    n.w = Math.max(maxTextW + 36, 150);
    n.h = n.role ? 62 : (n.tag ? 54 : 46);
  });

  // BFSで各ノードのDepth（階層深度）を計算
  const queue = [{ node: root, depth: 0 }];
  const visited = new Set([root.id]);
  root.depth = 0;

  while (queue.length > 0) {
    const cur = queue.shift();
    cur.node.depth = cur.depth;

    // スタッフノードは親と同じ階層（または微差）
    cur.node.staffChildren.forEach((st) => {
      if (!visited.has(st.node.id)) {
        visited.add(st.node.id);
        st.node.depth = cur.depth;
      }
    });

    cur.node.directChildren.forEach((ch) => {
      if (!visited.has(ch.node.id)) {
        visited.add(ch.node.id);
        queue.push({ node: ch.node, depth: cur.depth + 1 });
      }
    });
  }

  // サブツリー幅の計算（直属の子供たちの合計幅）
  const hGap = 28; // 兄弟ノード間の水平余白
  function calcSubtreeWidth(node) {
    if (node.directChildren.length === 0) {
      // スタッフノードがある場合はその分を加味
      const staffWidth = node.staffChildren.reduce((acc, st) => acc + st.node.w + hGap, 0);
      node.subtreeW = node.w + staffWidth;
      return node.subtreeW;
    }

    let childrenW = 0;
    node.directChildren.forEach((ch, idx) => {
      const cw = calcSubtreeWidth(ch.node);
      childrenW += cw + (idx > 0 ? hGap : 0);
    });

    const staffWidth = node.staffChildren.reduce((acc, st) => acc + st.node.w + hGap, 0);
    node.subtreeW = Math.max(node.w + staffWidth, childrenW);
    return node.subtreeW;
  }
  calcSubtreeWidth(root);

  // 垂直位置（Y座標）の基準
  const vGap = 64; // 階層間の垂直余白
  const startY = title ? 80 : 36;

  // 再帰レイアウト（X, Y の決定）
  function layoutNode(node, leftX, topY) {
    node.y = topY;

    if (node.directChildren.length === 0) {
      node.x = leftX + (node.subtreeW - node.w) / 2;

      // スタッフノードの配置（親の右側）
      let staffOffset = node.x + node.w + hGap;
      node.staffChildren.forEach((st) => {
        st.node.x = staffOffset;
        st.node.y = topY;
        staffOffset += st.node.w + hGap;
      });
      return;
    }

    // 直属の子ノードの配置
    let curX = leftX;
    let sumChildCenterX = 0;

    node.directChildren.forEach((ch) => {
      layoutNode(ch.node, curX, topY + node.h + vGap);
      sumChildCenterX += ch.node.x + ch.node.w / 2;
      curX += ch.node.subtreeW + hGap;
    });

    // 親ノードの X 座標は子ノード群の中心
    const avgCenterX = sumChildCenterX / node.directChildren.length;
    node.x = avgCenterX - node.w / 2;

    // スタッフノードの配置（親の右横に横出し）
    let staffOffset = node.x + node.w + hGap;
    node.staffChildren.forEach((st) => {
      st.node.x = staffOffset;
      st.node.y = topY;
      staffOffset += st.node.w + hGap;
    });
  }

  layoutNode(root, 36, startY);

  // 全体寸法の算出
  let minX = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  nodeMap.forEach((n) => {
    if (n.x < minX) minX = n.x;
    if (n.x + n.w > maxX) maxX = n.x + n.w;
    if (n.y + n.h > maxY) maxY = n.y + n.h;
  });

  // 左マージンが詰まりすぎないようオフセット補正
  const xOffset = minX < 36 ? 36 - minX : 0;
  if (xOffset > 0) {
    nodeMap.forEach((n) => {
      n.x += xOffset;
    });
    maxX += xOffset;
  }

  const totalW = Math.max(Math.round(maxX + 48), 780);
  const totalH = Math.max(Math.round(maxY + 48), 380);

  return {
    title,
    root,
    nodes: Array.from(nodeMap.values()),
    edges: rawEdges,
    totalW,
    totalH,
  };
}

/**
 * 組織階層図のSVG描画
 */
function drawOrgChartSvg(code, container, labelText) {
  container.innerHTML = '';
  const parsed = parseOrgChart(code);
  if (!parsed) {
    const err = document.createElement('div');
    err.className = 'chem-render-error';
    err.textContent = '組織階層図の構文エラー: "取締役会" -> "代表取締役社長" のような関係性が必要です。';
    container.appendChild(err);
    return;
  }

  const { title, root, nodes, edges, totalW, totalH } = parsed;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${totalW} ${totalH}`);
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.setAttribute('class', 'orgchart-svg');
  svg.style.maxWidth = `${totalW}px`;
  svg.style.margin = '0 auto';
  svg.style.display = 'block';
  svg.style.background = '#ffffff';
  svg.style.borderRadius = '12px';
  svg.style.overflow = 'hidden';

  // フィルタ・シャドウ定義
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  defs.innerHTML = `
    <filter id="org-shadow" x="-15%" y="-20%" width="130%" height="150%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#0f172a" flood-opacity="0.07" />
    </filter>
    <filter id="org-shadow-top" x="-20%" y="-20%" width="140%" height="150%">
      <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#1e3a8a" flood-opacity="0.22" />
    </filter>
  `;
  svg.appendChild(defs);

  // タイトル描画
  if (title) {
    const titleG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const titleText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    titleText.setAttribute('x', totalW / 2);
    titleText.setAttribute('y', '38');
    titleText.setAttribute('text-anchor', 'middle');
    titleText.setAttribute('font-size', '17');
    titleText.setAttribute('font-weight', '800');
    titleText.setAttribute('fill', '#0f172a');
    titleText.setAttribute('font-family', 'system-ui, -apple-system, sans-serif');
    titleText.textContent = title;
    titleG.appendChild(titleText);

    const titleLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    titleLine.setAttribute('x1', totalW / 2 - 120);
    titleLine.setAttribute('y1', '48');
    titleLine.setAttribute('x2', totalW / 2 + 120);
    titleLine.setAttribute('y2', '48');
    titleLine.setAttribute('stroke', '#e2e8f0');
    titleLine.setAttribute('stroke-width', '2');
    titleG.appendChild(titleLine);

    svg.appendChild(titleG);
  }

  // コネクタ線グループ
  const edgeG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  edgeG.setAttribute('class', 'org-edges');

  // 比率/タグバッジグループ
  const badgeG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  badgeG.setAttribute('class', 'org-badges');

  nodes.forEach((node) => {
    // 1. スタッフライン（点線横出し）の描画
    node.staffChildren.forEach((st) => {
      const child = st.node;
      const startX = node.x + node.w;
      const startY = node.y + node.h / 2;
      const endX = child.x;
      const endY = child.y + child.h / 2;

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', `M ${startX} ${startY} L ${endX} ${endY}`);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', '#64748b');
      path.setAttribute('stroke-width', '1.8');
      path.setAttribute('stroke-dasharray', '4 4');
      edgeG.appendChild(path);

      if (st.edge.tag) {
        const midX = (startX + endX) / 2;
        const midY = startY;
        const bw = getOrgTextWidth(st.edge.tag) + 12;
        const bh = 17;

        const bRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bRect.setAttribute('x', midX - bw / 2);
        bRect.setAttribute('y', midY - bh / 2);
        bRect.setAttribute('width', bw);
        bRect.setAttribute('height', bh);
        bRect.setAttribute('rx', '4');
        bRect.setAttribute('fill', '#f1f5f9');
        bRect.setAttribute('stroke', '#94a3b8');
        bRect.setAttribute('stroke-width', '1');
        badgeG.appendChild(bRect);

        const bTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        bTxt.setAttribute('x', midX);
        bTxt.setAttribute('y', midY + 4);
        bTxt.setAttribute('text-anchor', 'middle');
        bTxt.setAttribute('font-size', '10.5');
        bTxt.setAttribute('font-weight', '700');
        bTxt.setAttribute('fill', '#475569');
        bTxt.setAttribute('font-family', 'sans-serif');
        bTxt.textContent = st.edge.tag;
        badgeG.appendChild(bTxt);
      }
    });

    // 2. 直属ライン（直角マンハッタン配線）の描画
    if (node.directChildren.length > 0) {
      const parentBottomX = node.x + node.w / 2;
      const parentBottomY = node.y + node.h;
      const childrenTopY = node.directChildren[0].node.y;
      const midY = (parentBottomY + childrenTopY) / 2;

      // 親の下から中間Yまでの垂直幹
      const mainStem = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      mainStem.setAttribute('d', `M ${parentBottomX} ${parentBottomY} L ${parentBottomX} ${midY}`);
      mainStem.setAttribute('fill', 'none');
      mainStem.setAttribute('stroke', '#94a3b8');
      mainStem.setAttribute('stroke-width', '2');
      edgeG.appendChild(mainStem);

      // 子供たちのX座標の最小値と最大値
      let minChildX = Infinity;
      let maxChildX = -Infinity;
      node.directChildren.forEach((ch) => {
        const cx = ch.node.x + ch.node.w / 2;
        if (cx < minChildX) minChildX = cx;
        if (cx > maxChildX) maxChildX = cx;
      });

      // 中間Yの水平バスライン
      if (node.directChildren.length > 1) {
        const busLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        busLine.setAttribute('d', `M ${minChildX} ${midY} L ${maxChildX} ${midY}`);
        busLine.setAttribute('fill', 'none');
        busLine.setAttribute('stroke', '#94a3b8');
        busLine.setAttribute('stroke-width', '2');
        edgeG.appendChild(busLine);
      }

      // 各子ノードへ下りる垂直枝
      node.directChildren.forEach((ch) => {
        const childTopX = ch.node.x + ch.node.w / 2;
        const branch = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        branch.setAttribute('d', `M ${childTopX} ${midY} L ${childTopX} ${childrenTopY}`);
        branch.setAttribute('fill', 'none');
        branch.setAttribute('stroke', '#94a3b8');
        branch.setAttribute('stroke-width', '2');
        edgeG.appendChild(branch);
      });
    }
  });

  svg.appendChild(edgeG);
  svg.appendChild(badgeG);

  // ノードカード描画グループ
  const nodeG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  nodeG.setAttribute('class', 'org-nodes');

  nodes.forEach((node) => {
    const isTop = node.depth === 0;
    const isStaff = node.parents.some((p) => p.type === 'staff');
    const isManagement = node.directChildren.length > 0 && !isTop;

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', `org-node depth-${node.depth}`);
    g.style.cursor = 'pointer';

    // テーマ選択
    let theme = ORG_THEMES.department;
    if (isTop) theme = ORG_THEMES.executive;
    else if (isStaff) theme = ORG_THEMES.staff;
    else if (isManagement) theme = ORG_THEMES.management;

    // カード外枠
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', node.x);
    rect.setAttribute('y', node.y);
    rect.setAttribute('width', node.w);
    rect.setAttribute('height', node.h);
    rect.setAttribute('rx', isTop ? '8' : '6');
    rect.setAttribute('fill', theme.bg);
    rect.setAttribute('stroke', theme.border);
    rect.setAttribute('stroke-width', isTop ? '2' : '1.5');
    rect.setAttribute('filter', isTop ? 'url(#org-shadow-top)' : 'url(#org-shadow)');
    g.appendChild(rect);

    // トップ以外の管理職/本部カードは上部アクセントライン
    if (isManagement) {
      const topBar = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      topBar.setAttribute('d', `M ${node.x + 6} ${node.y} L ${node.x + node.w - 6} ${node.y}`);
      topBar.setAttribute('stroke', theme.border);
      topBar.setAttribute('stroke-width', '3.5');
      topBar.setAttribute('stroke-linecap', 'round');
      g.appendChild(topBar);
    }

    // 役職テキスト（上段）
    if (node.role) {
      const roleText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      roleText.setAttribute('x', node.x + node.w / 2);
      roleText.setAttribute('y', node.y + 20);
      roleText.setAttribute('text-anchor', 'middle');
      roleText.setAttribute('font-size', '11.5');
      roleText.setAttribute('font-weight', '700');
      roleText.setAttribute('fill', theme.subCol);
      roleText.setAttribute('font-family', 'sans-serif');
      roleText.textContent = node.role;
      g.appendChild(roleText);

      // 氏名テキスト（下段）
      const nameText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      nameText.setAttribute('x', node.x + node.w / 2);
      nameText.setAttribute('y', node.y + 42);
      nameText.setAttribute('text-anchor', 'middle');
      nameText.setAttribute('font-size', '14');
      nameText.setAttribute('font-weight', '800');
      nameText.setAttribute('fill', theme.titleCol);
      nameText.setAttribute('font-family', 'system-ui, -apple-system, sans-serif');
      nameText.textContent = node.name;
      g.appendChild(nameText);
    } else {
      // 部署名テキスト（単独）
      const nameText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      nameText.setAttribute('x', node.x + node.w / 2);
      nameText.setAttribute('y', node.tag ? node.y + 24 : node.y + node.h / 2 + 5);
      nameText.setAttribute('text-anchor', 'middle');
      nameText.setAttribute('font-size', isTop ? '15' : '13.5');
      nameText.setAttribute('font-weight', '800');
      nameText.setAttribute('fill', theme.titleCol);
      nameText.setAttribute('font-family', 'system-ui, -apple-system, sans-serif');
      nameText.textContent = node.name;
      g.appendChild(nameText);
    }

    // タグバッジ
    if (node.tag) {
      const tagW = Math.min(getOrgTextWidth(node.tag) + 12, node.w - 16);
      const tagH = 16;
      const tagX = node.x + (node.w - tagW) / 2;
      const tagY = node.role ? node.y + node.h - 18 : node.y + 32;

      const tagRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      tagRect.setAttribute('x', tagX);
      tagRect.setAttribute('y', tagY);
      tagRect.setAttribute('width', tagW);
      tagRect.setAttribute('height', tagH);
      tagRect.setAttribute('rx', '3');
      tagRect.setAttribute('fill', theme.tagBg);
      g.appendChild(tagRect);

      const tagText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      tagText.setAttribute('x', tagX + tagW / 2);
      tagText.setAttribute('y', tagY + 12);
      tagText.setAttribute('text-anchor', 'middle');
      tagText.setAttribute('font-size', '10.5');
      tagText.setAttribute('font-weight', '700');
      tagText.setAttribute('fill', theme.tagCol);
      tagText.setAttribute('font-family', 'sans-serif');
      tagText.textContent = node.tag;
      g.appendChild(tagText);
    }

    // ツールチップ
    const tip = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    const tipDesc = [node.role ? `${node.role} ${node.name}` : node.name];
    if (node.tag) tipDesc.push(`[${node.tag}]`);
    tip.textContent = tipDesc.join(' ');
    g.appendChild(tip);

    nodeG.appendChild(g);
  });

  svg.appendChild(nodeG);
  container.appendChild(svg);

  if (labelText) {
    const lbl = document.createElement('div');
    lbl.className = 'chem-structure-label';
    lbl.textContent = labelText;
    container.appendChild(lbl);
  }
}
