// ==========================================
// 資本構成ツリー図（持株比率ツリー図）パーサー & SVG描画エンジン
// ==========================================

function getApproxTextWidth(str) {
  if (!str) return 0;
  let w = 0;
  for (let i = 0; i < str.length; i++) {
    w += str.charCodeAt(i) > 255 ? 12 : 7;
  }
  return w;
}

function splitNodeText(name) {
  if (!name) return [''];
  if (name.includes('\n')) {
    return name.split('\n').map((s) => s.trim()).filter(Boolean);
  }
  // " / " のようなスラッシュ区切りがある場合
  if (name.includes(' / ')) {
    const parts = name.split(' / ').map((s) => s.trim()).filter(Boolean);
    if (parts.length === 2) {
      return [`${parts[0]} /`, parts[1]];
    }
    return parts;
  }
  // 文字列幅が120px以上（全角約10文字以上）なら自動折り返し
  if (getApproxTextWidth(name) >= 120) {
    // スペース、中黒、丸括弧などの区切り文字で分割可能か試行
    const delimMatch = name.match(/^(.*?[（\(・\s])(.*)$/);
    if (delimMatch && getApproxTextWidth(delimMatch[1]) >= 36 && getApproxTextWidth(delimMatch[2]) >= 36) {
      return [delimMatch[1].trim(), delimMatch[2].trim()];
    }
    const mid = Math.ceil(name.length / 2);
    return [name.slice(0, mid), name.slice(mid)];
  }
  return [name];
}

function wrapCapitalTreeNote(noteText, maxCharUnits = 28) {
  if (!noteText) return [];
  const segments = noteText.includes(' / ') ? noteText.split(' / ') : [noteText];
  const lines = [];
  segments.forEach((seg, sIdx) => {
    const segText = sIdx < segments.length - 1 ? `${seg.trim()} /` : seg.trim();
    let curLine = '';
    let curUnits = 0;
    for (let i = 0; i < segText.length; i++) {
      const ch = segText[i];
      const unit = ch.charCodeAt(0) > 255 ? 2 : 1;
      if (curUnits + unit > maxCharUnits && curLine.length > 0) {
        lines.push(curLine.trim());
        curLine = ch;
        curUnits = unit;
      } else {
        curLine += ch;
        curUnits += unit;
      }
    }
    if (curLine.trim()) lines.push(curLine.trim());
  });
  return lines;
}

function isColorString(str) {
  if (!str) return false;
  if (/^#(?:[0-9a-fA-F]{3,8})$/.test(str)) return true;
  return /^(?:red|green|blue|orange|amber|yellow|purple|violet|gray|grey|dark|black|rose|emerald|cyan)$/i.test(str);
}

function parseCapitalTree(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;
  let text = rawText.trim();

  // \capitaltree{...} または \holdingtree{...} のアンラップ
  const wrapperMatch = text.match(/^\\(?:capitaltree|holdingtree)\{([\s\S]*)\}$/i);
  if (wrapperMatch) {
    text = wrapperMatch[1].trim();
  }

  let title = '';
  let wrapRows = 0;
  let wrapCols = 0;
  const rawEdges = [];
  const rawNodes = new Map(); // id -> { name, type, note, color }

  const lines = text.split(/[\n;]+/).map((l) => l.trim()).filter(Boolean);

  lines.forEach((line) => {
    // 1. title:
    const titleMatch = line.match(/^title:\s*(.+)$/i);
    if (titleMatch) {
      title = titleMatch[1].trim().replace(/^["']|["']$/g, '');
      return;
    }

    // 1-b. cols: または rows: / wrap:
    const colsMatch = line.match(/^cols:\s*(\d+)$/i);
    if (colsMatch) {
      wrapCols = parseInt(colsMatch[1], 10);
      return;
    }
    const wrapMatch = line.match(/^(?:wrap|rows):\s*(\d+)$/i);
    if (wrapMatch) {
      wrapRows = parseInt(wrapMatch[1], 10);
      return;
    }

    // 2. root: または node: "会社名" [属性]
    const rootMatch = line.match(/^(?:root|node):\s*(?:"([^"]+)"|'([^']+)'|([^\s\[;]+))(?:\s*\[([^\]]*)\])?/i);
    if (rootMatch && !line.includes('->')) {
      const name = (rootMatch[1] || rootMatch[2] || rootMatch[3] || '').trim();
      const meta = rootMatch[4] || '';
      if (name) {
        rawNodes.set(name, parseNodeMeta(name, meta));
      }
      return;
    }

    // 3. エッジ関係: "親会社" -> "子会社" [比率, 区分, 色]
    const edgeMatch = line.match(/^(?:"([^"]+)"|'([^']+)'|([^\s\->\[;]+))\s*->\s*(?:"([^"]+)"|'([^']+)'|([^\s\->\[;]+))(?:\s*\[([^\]]*)\])?/);
    if (edgeMatch) {
      const from = (edgeMatch[1] || edgeMatch[2] || edgeMatch[3] || '').trim();
      const to = (edgeMatch[4] || edgeMatch[5] || edgeMatch[6] || '').trim();
      const attrStr = edgeMatch[7] || '';

      if (from && to) {
        if (!rawNodes.has(from)) rawNodes.set(from, { id: from, name: from });
        if (!rawNodes.has(to)) rawNodes.set(to, { id: to, name: to });

        const edgeAttrs = parseEdgeMeta(attrStr);
        rawEdges.push({
          from,
          to,
          ...edgeAttrs
        });
      }
    }
  });

  if (rawEdges.length === 0 && rawNodes.size === 0) return null;

  return { title, rawNodes, rawEdges, wrapRows, wrapCols };
}

function parseNodeMeta(name, metaStr) {
  let type = '';
  let note = '';
  let color = '';

  if (metaStr) {
    const parts = metaStr.split(',').map((p) => p.trim()).filter(Boolean);
    parts.forEach((p) => {
      if (isColorString(p)) {
        color = p;
      } else if (!type) {
        type = p;
      } else if (!note) {
        note = p;
      } else {
        note += `, ${p}`;
      }
    });
  }

  return { id: name, name, type, note, color };
}

function parseEdgeMeta(attrStr) {
  let ratio = '';
  let type = '';
  let color = '';
  let note = '';
  const extraLines = [];
  const labels = [];

  if (attrStr) {
    // クォート内のカンマで分割しないよう分割
    const parts = attrStr.split(/,\s*(?=(?:[^"]*"[^"]*")*[^"]*$)/).map((p) => p.trim()).filter(Boolean);
    parts.forEach((rawP) => {
      let p = rawP.replace(/^["']|["']$/g, '').trim();
      // 明示的な改行 \n が含まれている場合
      if (p.includes('\\n') || p.includes('\n')) {
        const subLines = p.split(/\\n|\n/).map((s) => s.trim()).filter(Boolean);
        extraLines.push(...subLines);
        return;
      }

      if (/^\d+(?:\.\d+)?%?$/.test(p)) {
        ratio = p.endsWith('%') ? p : `${p}%`;
      } else if (isColorString(p)) {
        color = p;
      } else {
        // 他社・外部出資（合弁パートナー、浮動株など）か判定
        if (/他社|外部|パートナー|合弁|残|浮動株|ファンド|持株会|自治体|有志/i.test(p) || (p.includes('%') && labels.length >= 1)) {
          extraLines.push(p);
        } else {
          labels.push(p);
        }
      }
    });
  }

  let edgeTypeLabel = '';
  if (labels.length > 0) {
    type = labels[0];
    edgeTypeLabel = labels[0];
    if (labels.length > 1) {
      // 第3引数以降はノード側詳細メモ (note) として扱う
      note = labels.slice(1).join(' / ');
    }
  }

  // エッジバッジの1行目は出資比率と区分 (type) のみ
  let mainLine = '';
  if (ratio && edgeTypeLabel) {
    mainLine = `${ratio} [${edgeTypeLabel}]`;
  } else if (ratio) {
    mainLine = ratio;
  } else if (edgeTypeLabel) {
    mainLine = edgeTypeLabel;
  }

  const labelLines = [];
  if (mainLine) labelLines.push(mainLine);
  if (extraLines.length > 0) {
    labelLines.push(...extraLines);
  }

  const labelText = labelLines.join('\n');

  return { ratio, type, color, note, labelText, labelLines };
}

function getCapitalTreeNodeTheme(colorKey, isRoot, type) {
  let fillBg = '#f8fafc';
  let strokeCol = '#cbd5e1';
  let textCol = '#0f172a';
  let tagBg = '#e2e8f0';
  let tagTextCol = '#475569';

  if (isRoot) {
    fillBg = '#0f172a';
    strokeCol = '#334155';
    textCol = '#ffffff';
    tagBg = '#334155';
    tagTextCol = '#94a3b8';
  } else if (/完全|100%/i.test(type || '')) {
    fillBg = '#f0fdf4';
    strokeCol = '#22c55e';
    textCol = '#14532d';
    tagBg = '#dcfce7';
    tagTextCol = '#15803d';
  } else if (/連結/i.test(type || '')) {
    fillBg = '#f0f9ff';
    strokeCol = '#0284c7';
    textCol = '#0c4a6e';
    tagBg = '#e0f2fe';
    tagTextCol = '#0369a1';
  } else if (/持分法|関連/i.test(type || '')) {
    fillBg = '#fffbeb';
    strokeCol = '#f59e0b';
    textCol = '#78350f';
    tagBg = '#fef3c7';
    tagTextCol = '#b45309';
  }

  if (colorKey) {
    const c = colorKey.toLowerCase();
    if (c === 'red' || c === 'danger' || c.startsWith('#e') || c.startsWith('#f4') || c.startsWith('#dc') || c.startsWith('#b9')) {
      fillBg = '#fef2f2';
      strokeCol = '#ef4444';
      textCol = '#991b1b';
      tagBg = '#fee2e2';
      tagTextCol = '#dc2626';
    } else if (c === 'green' || c === 'success' || c.startsWith('#16a') || c.startsWith('#10b') || c.startsWith('#22c') || c.startsWith('#059')) {
      fillBg = '#f0fdf4';
      strokeCol = '#16a34a';
      textCol = '#14532d';
      tagBg = '#dcfce7';
      tagTextCol = '#15803d';
    } else if (c === 'blue' || c === 'info' || c.startsWith('#028') || c.startsWith('#256') || c.startsWith('#3b8')) {
      fillBg = '#f0f9ff';
      strokeCol = '#0284c7';
      textCol = '#0c4a6e';
      tagBg = '#e0f2fe';
      tagTextCol = '#0369a1';
    } else if (c === 'orange' || c === 'amber' || c === 'warning' || c.startsWith('#f59') || c.startsWith('#ea5') || c.startsWith('#d97')) {
      fillBg = '#fffbeb';
      strokeCol = '#f59e0b';
      textCol = '#78350f';
      tagBg = '#fef3c7';
      tagTextCol = '#b45309';
    } else if (c === 'purple' || c === 'violet' || c.startsWith('#8b5') || c.startsWith('#7c3') || c.startsWith('#933')) {
      fillBg = '#faf5ff';
      strokeCol = '#a855f7';
      textCol = '#581c87';
      tagBg = '#f3e8ff';
      tagTextCol = '#7e22ce';
    } else if (c === 'dark' || c === 'black' || c.startsWith('#0f') || c.startsWith('#1e') || c.startsWith('#33')) {
      fillBg = '#1e293b';
      strokeCol = '#475569';
      textCol = '#f8fafc';
      tagBg = '#334155';
      tagTextCol = '#cbd5e1';
    } else {
      strokeCol = colorKey;
    }
  }

  return { fillBg, strokeCol, textCol, tagBg, tagTextCol };
}

// 階層木構造のレイアウト計算
function buildCapitalTreeLayout(parsed) {
  const { title, rawNodes, rawEdges } = parsed;

  const nodeMap = new Map();
  rawNodes.forEach((val, key) => {
    const lines = splitNodeText(val.name);
    let maxLineWidth = 0;
    lines.forEach((l) => {
      const w = getApproxTextWidth(l);
      if (w > maxLineWidth) maxLineWidth = w;
    });

    const nodeWidth = Math.max(164, Math.min(220, maxLineWidth + 28));

    nodeMap.set(key, {
      ...val,
      lines,
      children: [],
      parents: [],
      incomingEdges: [],
      edgeFromParent: null,
      width: nodeWidth,
      height: lines.length > 1 ? (val.type ? 66 : 56) : (val.type ? 52 : 46),
      x: 0,
      y: 0,
      depth: 0,
      subtreeWidth: 0
    });
  });

  rawEdges.forEach((e) => {
    const parentNode = nodeMap.get(e.from);
    const childNode = nodeMap.get(e.to);
    if (parentNode && childNode) {
      if (!parentNode.children.includes(childNode)) parentNode.children.push(childNode);
      if (!childNode.parents.includes(parentNode)) childNode.parents.push(parentNode);
      childNode.incomingEdges.push({ ...e, parentNode });
      childNode.edgeFromParent = e;
      if (!childNode.type && e.type) {
        childNode.type = e.type;
      }
      if (e.note) {
        childNode.note = childNode.note ? `${childNode.note} / ${e.note}` : e.note;
      }
      if (!childNode.color && e.color) childNode.color = e.color;

      // エッジのバッジ幅に合わせてノード幅を調整（バッジ衝突防止）
      let maxBadgeLineW = 0;
      (e.labelLines || [e.labelText || '']).forEach((l) => {
        const w = getApproxTextWidth(l);
        if (w > maxBadgeLineW) maxBadgeLineW = w;
      });
      const badgeW = maxBadgeLineW + 24;
      if (badgeW > childNode.width) {
        childNode.width = Math.min(badgeW + 12, 250);
      }
    }
  });

  // 各ノードの寸法最適化（詳細メモ・内訳タグ・複数行テキスト対応）
  nodeMap.forEach((n) => {
    n.noteLines = n.note ? wrapCapitalTreeNote(n.note, 28) : [];
    const hasNote = n.noteLines.length > 0;
    const isMultiParent = n.incomingEdges && n.incomingEdges.length > 1;
    const hasSubLabel = isMultiParent || Boolean(n.type);

    let maxNoteLineW = 0;
    n.noteLines.forEach((l) => {
      const w = getApproxTextWidth(l);
      if (w > maxNoteLineW) maxNoteLineW = w;
    });

    if (isMultiParent) {
      // 各バッジの幅を計算
      const badgeWidths = n.incomingEdges.map((ie) => {
        let maxL = 0;
        (ie.labelLines || [ie.labelText || '']).forEach((l) => {
          const w = getApproxTextWidth(l);
          if (w > maxL) maxL = w;
        });
        return Math.max(maxL + 18, 46);
      });

      // 複数バッジが横に並ぶために必要な合計分散幅（バッジ幅合計 + 14pxマージン）
      let neededSpread = 0;
      for (let i = 0; i < badgeWidths.length - 1; i++) {
        neededSpread += (badgeWidths[i] + badgeWidths[i + 1]) / 2 + 14;
      }
      n.neededSpread = neededSpread;

      let totalTagsW = 0;
      n.incomingEdges.forEach((ie) => {
        let pName = ie.from.trim();
        if (pName.length > 6) {
          pName = pName.replace(/[\(（].*?[\)）]/g, '').trim() || pName.slice(0, 6);
        }
        const text = `${pName} ${ie.ratio || ''}`.trim();
        totalTagsW += getApproxTextWidth(text) + 14;
      });

      // タグおよびバッジ分散を収めるための幅と高さを確保
      n.width = Math.max(n.width, neededSpread + 36, Math.min(totalTagsW + 24, 300), maxNoteLineW + 28, 180);
      const noteH = hasNote ? n.noteLines.length * 14 + 10 : 0;
      n.height = (n.lines.length > 1 ? 52 : 38) + 22 + noteH;
    } else {
      const noteH = hasNote ? n.noteLines.length * 14 + 10 : 0;
      n.width = Math.max(n.width, maxNoteLineW + 28);
      n.height = (n.lines.length > 1 ? 38 : 24) + (hasSubLabel ? 22 : 0) + noteH + 16;
    }
  });

  // 親ノードの子ノード順序の整理（単独の子を先に、複数親と共有している合弁ノードを末尾側に配置して空洞化を防止）
  nodeMap.forEach((parentNode) => {
    if (parentNode.children.length > 1) {
      parentNode.children.sort((a, b) => {
        const aShared = a.parents.length > 1 ? 1 : 0;
        const bShared = b.parents.length > 1 ? 1 : 0;
        return aShared - bShared;
      });
    }
  });

  // ルートノード（親を持たないノード）を特定
  let roots = Array.from(nodeMap.values()).filter((n) => n.parents.length === 0);
  if (roots.length === 0 && nodeMap.size > 0) {
    roots = [Array.from(nodeMap.values())[0]];
  }

  // ルートノードのタイプを補完
  roots.forEach((r) => {
    if (!r.type) r.type = '親会社';
  });

  // 多段折り返し（グリッド配置）の判定と設定
  nodeMap.forEach((parentNode) => {
    if (parentNode.children.length === 0) return;

    const allLeaf = parentNode.children.every((c) => c.children.length === 0);
    const count = parentNode.children.length;
    const shouldWrap = allLeaf && (count >= 7 || parsed.wrapRows > 1 || parsed.wrapCols > 0);

    if (shouldWrap) {
      let cols = 6;
      if (parsed.wrapCols > 0) {
        cols = parsed.wrapCols;
      } else if (parsed.wrapRows > 0) {
        cols = Math.ceil(count / parsed.wrapRows);
      } else {
        // 自動判定: 7〜14社なら2行、15社以上なら3行
        cols = count <= 14 ? Math.ceil(count / 2) : Math.ceil(count / 3);
      }
      cols = Math.max(2, cols);
      const rows = Math.ceil(count / cols);

      // 多段配置用の子ノード幅・間隔の最適化（横長になりすぎず文字を大きく保つ）
      parentNode.children.forEach((c) => {
        let maxL = 0;
        (c.lines || [c.name]).forEach((l) => {
          const w = getApproxTextWidth(l);
          if (w > maxL) maxL = w;
        });
        c.width = Math.max(134, Math.min(176, maxL + 20));
      });

      const rowChildren = [];
      for (let r = 0; r < rows; r++) {
        const slice = parentNode.children.slice(r * cols, (r + 1) * cols);
        slice.forEach((c) => {
          c.rowInParent = r;
          c.totalRowsInParent = rows;
        });
        rowChildren.push(slice);
      }

      parentNode.wrapInfo = {
        cols,
        rows,
        rowChildren,
        gapX: 16
      };
    }
  });

  // 各ノードの階層深さ（depth）を計算
  const visited = new Set();
  function assignDepth(node, currentDepth) {
    node.depth = Math.max(node.depth, currentDepth);
    visited.add(node);
    node.children.forEach((c) => {
      if (!visited.has(c)) {
        assignDepth(c, currentDepth + 1);
      }
    });
  }
  roots.forEach((r) => assignDepth(r, 0));

  // 各階層の最大高さを計算
  const depthMaxHeights = [];
  nodeMap.forEach((n) => {
    depthMaxHeights[n.depth] = Math.max(depthMaxHeights[n.depth] || 0, n.height);
  });

  const nodeGapX = 28;
  const nodeGapY = 96;

  const depthOffsets = [0];
  for (let d = 0; d < depthMaxHeights.length; d++) {
    depthOffsets[d + 1] = depthOffsets[d] + (depthMaxHeights[d] || 52) + nodeGapY;
  }

  // 各サブツリーの必要幅（subtreeWidth）をボトムアップで計算
  function calcSubtreeWidth(node, seen = new Set()) {
    seen.add(node);
    if (node.children.length === 0) {
      node.subtreeWidth = node.width + nodeGapX;
      return node.subtreeWidth;
    }

    if (node.wrapInfo) {
      const gX = node.wrapInfo.gapX || 16;
      let maxRowW = 0;
      node.wrapInfo.rowChildren.forEach((rowList) => {
        let rW = 0;
        rowList.forEach((c) => {
          rW += c.width;
        });
        rW += (rowList.length - 1) * gX;
        if (rW > maxRowW) maxRowW = rW;
      });
      node.subtreeWidth = Math.max(node.width + nodeGapX, maxRowW + gX * 2);
      return node.subtreeWidth;
    }

    let sumWidth = 0;
    node.children.forEach((c) => {
      if (!seen.has(c)) {
        sumWidth += calcSubtreeWidth(c, seen);
      }
    });

    node.subtreeWidth = Math.max(node.width + nodeGapX, sumWidth);
    return node.subtreeWidth;
  }

  // ルートノード間でseenを共有して幅を算出
  const rootSeenForWidth = new Set();
  roots.forEach((r) => calcSubtreeWidth(r, rootSeenForWidth));

  // 座標配置（X, Y）
  const titleH = title ? 44 : 16;
  let startX = 24;

  const globalSeen = new Set();
  function layoutNode(node, leftBound) {
    globalSeen.add(node);
    const w = node.subtreeWidth;
    node.y = titleH + 24 + depthOffsets[node.depth];

    if (node.children.length === 0) {
      node.x = Math.round(leftBound + (w - node.width) / 2);
    } else if (node.wrapInfo) {
      // 多段折り返しの親ノード
      node.x = Math.round(leftBound + (w - node.width) / 2);
      const pBottomY = node.y + node.height;
      let curY = pBottomY + 70; // 1段目の上端（親ノード下端 + バス線・バッジ・余白）
      const gX = node.wrapInfo.gapX || 16;

      node.wrapInfo.rowChildren.forEach((rowList) => {
        let rW = 0;
        let maxH = 0;
        rowList.forEach((c) => {
          rW += c.width;
          if (c.height > maxH) maxH = c.height;
        });
        rW += (rowList.length - 1) * gX;

        let curX = Math.round(leftBound + (w - rW) / 2);
        rowList.forEach((c) => {
          c.x = curX;
          c.y = curY;
          curX += c.width + gX;
        });

        // 次の行のY座標: ノードの最大高さ + 行間余白（バス線・バッジ用 76px）
        curY += maxH + 76;
      });
    } else {
      let curLeft = leftBound;
      const laidChildren = [];
      node.children.forEach((c) => {
        if (!globalSeen.has(c)) {
          layoutNode(c, curLeft);
          curLeft += c.subtreeWidth;
          laidChildren.push(c);
        } else {
          // 他親で配置済みの共有ノード（空洞を作らず位置を認識）
          laidChildren.push(c);
        }
      });

      if (laidChildren.length > 0) {
        let minCX = Infinity;
        let maxCX = -Infinity;
        laidChildren.forEach((c) => {
          const cMid = c.x + c.width / 2;
          if (cMid < minCX) minCX = cMid;
          if (cMid > maxCX) maxCX = cMid;
        });
        node.x = Math.round((minCX + maxCX) / 2 - node.width / 2);
      } else {
        node.x = Math.round(leftBound + (w - node.width) / 2);
      }
    }
  }

  roots.forEach((r) => {
    layoutNode(r, startX);
    let maxSubRight = r.x + r.width;
    r.children.forEach((c) => {
      if (c.x + c.width > maxSubRight) maxSubRight = c.x + c.width;
    });
    startX = Math.max(startX + r.subtreeWidth + 24, maxSubRight + 24);
  });

  // 同一階層ノード（特に親ノード同士）の横方向最小間隔確保・衝突回避パス
  const minNodeGap = 28;
  const nodesByDepth = new Map();
  nodeMap.forEach((n) => {
    if (!nodesByDepth.has(n.depth)) nodesByDepth.set(n.depth, []);
    nodesByDepth.get(n.depth).push(n);
  });

  function shiftSubtree(node, amount, visited) {
    if (visited.has(node)) return;
    visited.add(node);
    node.children.forEach((c) => {
      if (c.parents.length <= 1) {
        c.x += amount;
        shiftSubtree(c, amount, visited);
      }
    });
  }

  nodesByDepth.forEach((depthNodes) => {
    depthNodes.sort((a, b) => a.x - b.x);
    for (let i = 0; i < depthNodes.length - 1; i++) {
      const cur = depthNodes[i];
      const next = depthNodes[i + 1];
      const curRight = cur.x + cur.width;
      if (curRight + minNodeGap > next.x) {
        const diff = (curRight + minNodeGap) - next.x;
        for (let j = i + 1; j < depthNodes.length; j++) {
          depthNodes[j].x += diff;
          shiftSubtree(depthNodes[j], diff, new Set());
        }
      }
    }
  });

  // 全体寸法の算出
  let minX = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  nodeMap.forEach((n) => {
    if (n.x < minX) minX = n.x;
    if (n.x + n.width > maxX) maxX = n.x + n.width;
    if (n.y + n.height > maxY) maxY = n.y + n.height;
  });

  const totalW = Math.max(Math.round(maxX + 24), 780);
  const totalH = Math.max(Math.round(maxY + 32), 260);

  return { title, nodes: Array.from(nodeMap.values()), edges: rawEdges, totalW, totalH, titleH };
}

function drawCapitalTreeSvg(code, container, labelText) {
  container.innerHTML = '';
  const parsed = parseCapitalTree(code);
  if (!parsed) {
    const err = document.createElement('div');
    err.className = 'chem-render-error';
    err.textContent = '資本構成ツリー図の構文エラー: ノードや関係性（例: "親会社" -> "子会社" [100%, 連結];）が必要です。';
    container.appendChild(err);
    return;
  }

  const layout = buildCapitalTreeLayout(parsed);
  const { title, nodes, edges, totalW, totalH } = layout;

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
    tEl.setAttribute('y', 28);
    tEl.setAttribute('text-anchor', 'middle');
    tEl.setAttribute('font-size', '16.5');
    tEl.setAttribute('font-weight', '700');
    tEl.setAttribute('fill', '#0f172a');
    tEl.setAttribute('font-family', 'sans-serif');
    tEl.textContent = title;
    svg.appendChild(tEl);
  }

  const nodeLookup = new Map();
  nodes.forEach((n) => nodeLookup.set(n.id, n));

  const edgeG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  edgeG.setAttribute('class', 'tree-edges');

  const badgeG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  badgeG.setAttribute('class', 'tree-badges');

  // 比率・注釈バッジ描画ヘルパー（複数行・合弁他社出資対応）
  function renderBadgeElement(e, badgeX, badgeY) {
    const labelLines = e.labelLines && e.labelLines.length > 0
      ? e.labelLines
      : (e.labelText ? e.labelText.split(/\\n|\n/) : (e.ratio ? [e.ratio] : []));

    if (labelLines.length === 0) return;

    let maxLineW = 0;
    labelLines.forEach((l) => {
      const w = getApproxTextWidth(l);
      if (w > maxLineW) maxLineW = w;
    });

    const isMultiLine = labelLines.length > 1;
    const labelW = Math.max(maxLineW + (isMultiLine ? 20 : 16), 46);
    const lineHeight = 13.5;
    const labelH = isMultiLine ? labelLines.length * lineHeight + 10 : 19;

    const isAlertEdge = Boolean(e.color && /red|danger|#e|#f4|#dc/i.test(e.color));
    let strokeCol = '#cbd5e1';
    let textCol = '#475569';
    if (isAlertEdge) {
      strokeCol = '#ef4444';
      textCol = '#dc2626';
    } else if (e.color) {
      strokeCol = e.color;
      textCol = e.color;
    } else if (e.ratio && parseFloat(e.ratio) >= 50) {
      strokeCol = '#0284c7';
      textCol = '#0369a1';
    }

    const badgeBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    badgeBg.setAttribute('x', badgeX - labelW / 2);
    badgeBg.setAttribute('y', badgeY - labelH / 2);
    badgeBg.setAttribute('width', labelW);
    badgeBg.setAttribute('height', labelH);
    badgeBg.setAttribute('rx', isMultiLine ? '6' : '9.5');
    badgeBg.setAttribute('fill', '#ffffff');
    badgeBg.setAttribute('stroke', strokeCol);
    badgeBg.setAttribute('stroke-width', '1.2');
    badgeG.appendChild(badgeBg);

    if (!isMultiLine) {
      const badgeTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      badgeTxt.setAttribute('x', badgeX);
      badgeTxt.setAttribute('y', badgeY + 4.5);
      badgeTxt.setAttribute('text-anchor', 'middle');
      badgeTxt.setAttribute('font-size', '11');
      badgeTxt.setAttribute('font-weight', '700');
      badgeTxt.setAttribute('fill', textCol);
      badgeTxt.setAttribute('font-family', 'sans-serif');
      badgeTxt.textContent = labelLines[0];
      badgeG.appendChild(badgeTxt);
    } else {
      const startY = badgeY - (labelLines.length - 1) * (lineHeight / 2) + 3.5;
      labelLines.forEach((ln, lIdx) => {
        const txtEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        txtEl.setAttribute('x', badgeX);
        txtEl.setAttribute('y', startY + lIdx * lineHeight);
        txtEl.setAttribute('text-anchor', 'middle');
        txtEl.setAttribute('font-family', 'sans-serif');
        if (lIdx === 0) {
          txtEl.setAttribute('font-size', '10.5');
          txtEl.setAttribute('font-weight', '700');
          txtEl.setAttribute('fill', textCol);
        } else {
          txtEl.setAttribute('font-size', '9.5');
          txtEl.setAttribute('font-weight', '600');
          txtEl.setAttribute('fill', '#64748b');
        }
        txtEl.textContent = ln;
        badgeG.appendChild(txtEl);
      });
    }
  }

  // 多段折り返し（wrapInfo）を持つ親ノードのエッジ描画
  const wrappedParentIds = new Set();
  nodes.forEach((parentNode) => {
    if (!parentNode.wrapInfo) return;
    wrappedParentIds.add(parentNode.id);

    const pX = Math.round(parentNode.x + parentNode.width / 2);
    const pY = parentNode.y + parentNode.height;
    const { rowChildren } = parentNode.wrapInfo;

    // 1段目用バス線のY座標
    const busY0 = pY + 28;

    // 親から1段目バス線への垂直幹
    const rootPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    rootPath.setAttribute('d', `M ${pX} ${pY} L ${pX} ${busY0}`);
    rootPath.setAttribute('fill', 'none');
    rootPath.setAttribute('stroke', '#94a3b8');
    rootPath.setAttribute('stroke-width', '1.5');
    edgeG.appendChild(rootPath);

    const busYList = [];

    rowChildren.forEach((rowList, r) => {
      let busY;
      if (r === 0) {
        busY = busY0;
      } else {
        const prevRow = rowChildren[r - 1];
        let prevBottomY = 0;
        prevRow.forEach((c) => {
          if (c.y + c.height > prevBottomY) prevBottomY = c.y + c.height;
        });
        busY = prevBottomY + 28;
      }
      busYList[r] = busY;

      const firstX = Math.round(rowList[0].x + rowList[0].width / 2);
      const lastX = Math.round(rowList[rowList.length - 1].x + rowList[rowList.length - 1].width / 2);

      let trunkX = pX;
      if (r > 0) {
        const prevRow = rowChildren[r - 1];
        // 前段のノード間ギャップのうち、pX に最も近い位置を検索
        let minDiff = Infinity;
        for (let i = 0; i < prevRow.length - 1; i++) {
          const gapX = Math.round((prevRow[i].x + prevRow[i].width + prevRow[i + 1].x) / 2);
          if (Math.abs(gapX - pX) < minDiff) {
            minDiff = Math.abs(gapX - pX);
            trunkX = gapX;
          }
        }
        // 前段バス線から今段バス線への垂直トランク（隙間を通過）
        const trunkPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        trunkPath.setAttribute('d', `M ${trunkX} ${busYList[r - 1]} L ${trunkX} ${busY}`);
        trunkPath.setAttribute('fill', 'none');
        trunkPath.setAttribute('stroke', '#94a3b8');
        trunkPath.setAttribute('stroke-width', '1.5');
        edgeG.appendChild(trunkPath);
      }

      // 水平バス線
      const busMinX = Math.min(firstX, trunkX);
      const busMaxX = Math.max(lastX, trunkX);
      const hBusPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      hBusPath.setAttribute('d', `M ${busMinX} ${busY} L ${busMaxX} ${busY}`);
      hBusPath.setAttribute('fill', 'none');
      hBusPath.setAttribute('stroke', '#94a3b8');
      hBusPath.setAttribute('stroke-width', '1.5');
      edgeG.appendChild(hBusPath);

      // 各子ノードへのドロップ線 & バッジ
      rowList.forEach((childNode) => {
        const e = childNode.edgeFromParent;
        const cX = Math.round(childNode.x + childNode.width / 2);
        const cY = childNode.y;

        const isAlertEdge = Boolean(e && e.color && /red|danger|#e|#f4|#dc/i.test(e.color));
        const edgeStroke = (e && e.color) || '#94a3b8';

        const dropPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        dropPath.setAttribute('d', `M ${cX} ${busY} L ${cX} ${cY}`);
        dropPath.setAttribute('fill', 'none');
        dropPath.setAttribute('stroke', edgeStroke);
        dropPath.setAttribute('stroke-width', isAlertEdge ? '2.2' : (e && e.color ? '2' : '1.5'));
        if (isAlertEdge) {
          dropPath.setAttribute('stroke-dasharray', '5,3');
        }
        edgeG.appendChild(dropPath);

        // 比率・注釈バッジ
        if (e && (e.labelText || e.ratio || e.type)) {
          const badgeX = cX;
          const badgeY = Math.round(busY + (cY - busY) / 2);
          renderBadgeElement(e, badgeX, badgeY);
        }
      });
    });
  });

  // 通常のエッジ・コネクタ描画（wrapInfoを持たない親ノード用）
  // 1. 各エッジの座標パラメータ算出と垂直線分リストの収集
  const edgeDataList = [];
  const verticalSegments = [];

  edges.forEach((e, edgeIdx) => {
    if (wrappedParentIds.has(e.from)) return;

    const parentNode = nodeLookup.get(e.from);
    const childNode = nodeLookup.get(e.to);
    if (!parentNode || !childNode) return;

    const pX = Math.round(parentNode.x + parentNode.width / 2);
    const pY = Math.round(parentNode.y + parentNode.height);

    let cX = Math.round(childNode.x + childNode.width / 2);
    if (childNode.parents.length > 1) {
      const sortedParents = [...childNode.parents].sort((a, b) => (a.x + a.width / 2) - (b.x + b.width / 2));
      const parentIdx = sortedParents.indexOf(parentNode);
      const totalP = sortedParents.length;
      const spread = childNode.neededSpread
        ? Math.min(childNode.width - 24, childNode.neededSpread)
        : Math.min(childNode.width - 36, totalP * 54);
      const step = totalP > 1 ? spread / (totalP - 1) : 0;
      cX = Math.round((childNode.x + childNode.width / 2) - spread / 2 + parentIdx * step);
    }

    const cY = Math.round(childNode.y);
    const midY = Math.round(pY + (cY - pY) * 0.40);

    const isDirectVertical = (pX === cX);
    edgeDataList.push({ e, edgeIdx, pX, pY, cX, cY, midY, isDirectVertical });

    // 他エッジとの交差判定用垂直セグメント
    if (isDirectVertical) {
      verticalSegments.push({ x: pX, y1: Math.min(pY, cY), y2: Math.max(pY, cY), edgeIdx });
    } else {
      verticalSegments.push({ x: pX, y1: Math.min(pY, midY), y2: Math.max(pY, midY), edgeIdx });
      verticalSegments.push({ x: cX, y1: Math.min(midY, cY), y2: Math.max(midY, cY), edgeIdx });
    }
  });

  // 2. 各エッジの描画（水平線と垂直線の交差部にジャンパー飛び越え円弧を描画）
  edgeDataList.forEach((data) => {
    const { e, edgeIdx, pX, pY, cX, cY, midY, isDirectVertical } = data;
    const isAlertEdge = Boolean(e.color && /red|danger|#e|#f4|#dc/i.test(e.color));
    const edgeStroke = e.color || '#94a3b8';

    let d = `M ${pX} ${pY}`;

    if (isDirectVertical) {
      d += ` L ${cX} ${cY}`;
    } else {
      d += ` L ${pX} ${midY}`;

      // 水平線部分（midY）において交差する垂直線を検出
      const minX = Math.min(pX, cX);
      const maxX = Math.max(pX, cX);
      const crossingXs = [];

      verticalSegments.forEach((v) => {
        if (v.edgeIdx === edgeIdx) return; // 自エッジの垂直線とは交差判定しない
        if (v.x > minX + 6 && v.x < maxX - 6 && midY > v.y1 + 4 && midY < v.y2 - 4) {
          crossingXs.push(v.x);
        }
      });

      const r = 5; // ジャンパー線ブリッジの円弧半径
      if (crossingXs.length > 0) {
        if (pX < cX) {
          crossingXs.sort((a, b) => a - b);
          crossingXs.forEach((vX) => {
            // 背景白マスクを描画して下にある垂直線を隠す
            const bridgeMask = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            bridgeMask.setAttribute('cx', vX);
            bridgeMask.setAttribute('cy', midY);
            bridgeMask.setAttribute('r', '4.5');
            bridgeMask.setAttribute('fill', '#ffffff');
            edgeG.appendChild(bridgeMask);

            d += ` L ${vX - r} ${midY} A ${r} ${r} 0 0 1 ${vX + r} ${midY}`;
          });
        } else {
          crossingXs.sort((a, b) => b - a);
          crossingXs.forEach((vX) => {
            const bridgeMask = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            bridgeMask.setAttribute('cx', vX);
            bridgeMask.setAttribute('cy', midY);
            bridgeMask.setAttribute('r', '4.5');
            bridgeMask.setAttribute('fill', '#ffffff');
            edgeG.appendChild(bridgeMask);

            d += ` L ${vX + r} ${midY} A ${r} ${r} 0 0 0 ${vX - r} ${midY}`;
          });
        }
      }

      d += ` L ${cX} ${midY} L ${cX} ${cY}`;
    }

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', edgeStroke);
    path.setAttribute('stroke-width', isAlertEdge ? '2.2' : (e.color ? '2' : '1.5'));
    if (isAlertEdge) {
      path.setAttribute('stroke-dasharray', '5,3');
    }
    path.setAttribute('stroke-linejoin', 'round');
    edgeG.appendChild(path);

    // 比率・注釈バッジ
    if (e.labelText || e.ratio || e.type) {
      const badgeX = cX;
      const badgeY = Math.round((midY + cY) / 2);
      renderBadgeElement(e, badgeX, badgeY);
    }
  });

  svg.appendChild(edgeG);
  svg.appendChild(badgeG);

  // ノードボックス描画
  const nodeG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  nodeG.setAttribute('class', 'tree-nodes');

  nodes.forEach((n) => {
    const isRoot = n.parents.length === 0;
    const subLabel = n.type || '';
    const theme = getCapitalTreeNodeTheme(n.color, isRoot, subLabel);

    // ノード枠
    const box = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    box.setAttribute('x', n.x);
    box.setAttribute('y', n.y);
    box.setAttribute('width', n.width);
    box.setAttribute('height', n.height);
    box.setAttribute('rx', '6');
    box.setAttribute('fill', theme.fillBg);
    box.setAttribute('stroke', theme.strokeCol);
    box.setAttribute('stroke-width', isRoot || n.color ? '2' : '1.5');
    nodeG.appendChild(box);

    // 会社名・組織名テキスト（改行・複数行対応）
    const lines = n.lines && n.lines.length > 0 ? n.lines : [n.name];
    const nameTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    nameTxt.setAttribute('x', n.x + n.width / 2);
    nameTxt.setAttribute('text-anchor', 'middle');
    nameTxt.setAttribute('font-size', '13');
    nameTxt.setAttribute('font-weight', '700');
    nameTxt.setAttribute('fill', theme.textCol);
    nameTxt.setAttribute('font-family', 'sans-serif');

    const hasBottomMeta = (n.incomingEdges && n.incomingEdges.length > 1) || Boolean(subLabel) || (n.noteLines && n.noteLines.length > 0);
    if (lines.length === 1) {
      nameTxt.setAttribute('y', n.y + (hasBottomMeta ? 21 : Math.round(n.height / 2 + 4)));
      nameTxt.textContent = lines[0];
    } else {
      const startY = n.y + (hasBottomMeta ? 17 : Math.round((n.height - lines.length * 14) / 2 + 10));
      nameTxt.setAttribute('y', startY);
      lines.forEach((lineStr, idx) => {
        const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
        tspan.setAttribute('x', n.x + n.width / 2);
        if (idx > 0) {
          tspan.setAttribute('dy', '15');
        }
        tspan.textContent = lineStr;
        nameTxt.appendChild(tspan);
      });
    }
    nodeG.appendChild(nameTxt);

    let nextContentY = lines.length > 1 ? n.y + 36 : n.y + 24;

    // 複数出資元（共同出資）の内訳タグ表示
    const isMultiParent = n.incomingEdges && n.incomingEdges.length > 1;
    if (isMultiParent) {
      const tagList = n.incomingEdges.map((ie) => {
        let pName = ie.from.trim();
        if (pName.length > 6) {
          pName = pName.replace(/[\(（].*?[\)）]/g, '').trim() || pName.slice(0, 6);
        }
        const text = `${pName} ${ie.ratio || ''}`.trim();
        const w = getApproxTextWidth(text) + 12;
        const isMajor = ie.ratio && parseFloat(ie.ratio) >= 50;
        return { text, width: w, isMajor, color: ie.color };
      });

      const tagH = 16;
      const tagGap = 6;
      const totalTagsW = tagList.reduce((acc, t) => acc + t.width, 0) + (tagList.length - 1) * tagGap;
      const tagY = nextContentY + 4;

      if (totalTagsW <= n.width - 12) {
        let curTagX = n.x + (n.width - totalTagsW) / 2;
        tagList.forEach((t) => {
          const tRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          tRect.setAttribute('x', curTagX);
          tRect.setAttribute('y', tagY);
          tRect.setAttribute('width', t.width);
          tRect.setAttribute('height', tagH);
          tRect.setAttribute('rx', '4');
          tRect.setAttribute('fill', t.isMajor ? '#e0f2fe' : '#f1f5f9');
          tRect.setAttribute('stroke', t.isMajor ? '#0284c7' : '#cbd5e1');
          tRect.setAttribute('stroke-width', '1');
          nodeG.appendChild(tRect);

          const tTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          tTxt.setAttribute('x', curTagX + t.width / 2);
          tTxt.setAttribute('y', tagY + 11.5);
          tTxt.setAttribute('text-anchor', 'middle');
          tTxt.setAttribute('font-size', '10');
          tTxt.setAttribute('font-weight', '700');
          tTxt.setAttribute('fill', t.isMajor ? '#0369a1' : '#475569');
          tTxt.setAttribute('font-family', 'sans-serif');
          tTxt.textContent = t.text;
          nodeG.appendChild(tTxt);

          curTagX += t.width + tagGap;
        });
        nextContentY = tagY + tagH;
      } else {
        // 2行分割
        tagList.forEach((t, tIdx) => {
          const rowY = tagY + tIdx * (tagH + 3);
          const tW = Math.min(t.width, n.width - 16);
          const tX = n.x + (n.width - tW) / 2;

          const tRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          tRect.setAttribute('x', tX);
          tRect.setAttribute('y', rowY);
          tRect.setAttribute('width', tW);
          tRect.setAttribute('height', tagH);
          tRect.setAttribute('rx', '4');
          tRect.setAttribute('fill', t.isMajor ? '#e0f2fe' : '#f1f5f9');
          tRect.setAttribute('stroke', t.isMajor ? '#0284c7' : '#cbd5e1');
          tRect.setAttribute('stroke-width', '1');
          nodeG.appendChild(tRect);

          const tTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          tTxt.setAttribute('x', n.x + n.width / 2);
          tTxt.setAttribute('y', rowY + 11.5);
          tTxt.setAttribute('text-anchor', 'middle');
          tTxt.setAttribute('font-size', '9.5');
          tTxt.setAttribute('font-weight', '700');
          tTxt.setAttribute('fill', t.isMajor ? '#0369a1' : '#475569');
          tTxt.setAttribute('font-family', 'sans-serif');
          tTxt.textContent = t.text;
          nodeG.appendChild(tTxt);
        });
        nextContentY = tagY + tagList.length * (tagH + 3);
      }
    } else if (subLabel) {
      const tagW = Math.min(getApproxTextWidth(subLabel) + 12, n.width - 16);
      const tagH = 15;
      const tagX = n.x + (n.width - tagW) / 2;
      const tagY = nextContentY + 4;

      const tagRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      tagRect.setAttribute('x', tagX);
      tagRect.setAttribute('y', tagY);
      tagRect.setAttribute('width', tagW);
      tagRect.setAttribute('height', tagH);
      tagRect.setAttribute('rx', '3');
      tagRect.setAttribute('fill', theme.tagBg);
      nodeG.appendChild(tagRect);

      const tagTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      tagTxt.setAttribute('x', n.x + n.width / 2);
      tagTxt.setAttribute('y', tagY + 11);
      tagTxt.setAttribute('text-anchor', 'middle');
      tagTxt.setAttribute('font-size', '10.5');
      tagTxt.setAttribute('font-weight', '600');
      tagTxt.setAttribute('fill', theme.tagTextCol);
      tagTxt.setAttribute('font-family', 'sans-serif');
      tagTxt.textContent = subLabel;
      nodeG.appendChild(tagTxt);

      nextContentY = tagY + tagH;
    }

    // 詳細メモ（noteLines）の描画
    if (n.noteLines && n.noteLines.length > 0) {
      nextContentY += 6;

      const sepLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      sepLine.setAttribute('x1', (n.x + 14).toString());
      sepLine.setAttribute('y1', nextContentY.toString());
      sepLine.setAttribute('x2', (n.x + n.width - 14).toString());
      sepLine.setAttribute('y2', nextContentY.toString());
      sepLine.setAttribute('stroke', isRoot ? '#475569' : '#e2e8f0');
      sepLine.setAttribute('stroke-width', '0.8');
      sepLine.setAttribute('stroke-dasharray', '3,2');
      nodeG.appendChild(sepLine);

      nextContentY += 12;

      n.noteLines.forEach((nl, nlIdx) => {
        const noteTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        noteTxt.setAttribute('x', (n.x + n.width / 2).toString());
        noteTxt.setAttribute('y', (nextContentY + nlIdx * 14).toString());
        noteTxt.setAttribute('text-anchor', 'middle');
        noteTxt.setAttribute('font-size', '10.5');
        noteTxt.setAttribute('font-weight', '500');
        noteTxt.setAttribute('fill', isRoot ? '#94a3b8' : '#64748b');
        noteTxt.setAttribute('font-family', 'sans-serif');
        noteTxt.textContent = nl;
        nodeG.appendChild(noteTxt);
      });
    }

    // ツールチップ
    const tip = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    const tipDesc = [n.name];
    if (subLabel) tipDesc.push(`[${subLabel}]`);
    if (n.note) tipDesc.push(`(${n.note})`);
    if (n.edgeFromParent && n.edgeFromParent.ratio) tipDesc.push(`出資比率: ${n.edgeFromParent.ratio}`);
    tip.textContent = tipDesc.join(' ');
    nodeG.appendChild(tip);
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

