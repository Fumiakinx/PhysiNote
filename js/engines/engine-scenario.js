// ==========================================
// 汎用シナリオ・概念図 (フリーフロー図 / Scenario Flow) パーサー & SVG描画エンジン
// 1対N分岐（サイバー攻撃・拡散）、N対1集約（名寄せ・プロファイリング・データ統合）、汎用業務フロー対応
// ==========================================

function splitTopLevelArrows(line) {
  const parts = [];
  let cur = '';
  let quote = null;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quote) {
      cur += ch;
      if (ch === quote && line[i - 1] !== '\\') quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      cur += ch;
      continue;
    }
    const rest = line.slice(i);
    const arrowMatch = rest.match(/^(?:──*>|->)/);
    if (arrowMatch) {
      parts.push(cur.trim());
      cur = '';
      i += arrowMatch[0].length - 1;
      continue;
    }
    cur += ch;
  }
  if (cur.trim() || parts.length > 0) {
    parts.push(cur.trim());
  }
  return parts;
}

function parseScenarioEdgeMeta(str) {
  if (!str) return { text: '', lines: [], style: 'default', dashed: false };
  let text = str.trim();
  let style = 'default';
  let dashed = false;

  const attrMatch = text.match(/(?:["']\s*)?\[([^\]]+)\]\s*["']?$/i);
  if (attrMatch) {
    const tokens = attrMatch[1].split(/[\s,]+/).map((t) => t.trim().toLowerCase()).filter(Boolean);
    tokens.forEach((tok) => {
      if (tok === 'dashed' || tok === 'dotted' || tok === 'dash') dashed = true;
      else if (/^(danger|warn|warning|info|success|neutral|accent)$/.test(tok)) style = tok;
    });
    text = text.slice(0, attrMatch.index).trim();
  }

  text = text.replace(/^["']+|["']+$/g, '').trim().replace(/\\n/g, '\n');
  const lines = text ? text.split('\n').map((l) => l.trim()).filter(Boolean) : [];
  return { text, lines, style, dashed };
}

function parseScenarioText(text) {
  if (!text || typeof text !== 'string') return null;

  // \scenario{...} または \freeflow{...} の中身を取り出す
  const match = text.match(/\\(?:scenario|freeflow)\s*\{([\s\S]*)\}/i);
  const content = match ? match[1] : text;

  const rawLines = content.split('\n');

  let title = '';
  let icon = '';
  let theme = 'dark'; // デフォルトはセキュリティ・IT解説で映えるダーク
  let mode = 'auto';  // 'fork' (1対N), 'merge' (N対1), 'platform' (縦長中継1→N→1)
  let direction = 'TD'; // 'TD' (上から下) または 'LR' (左から右)
  let commonKey = 'メールアドレス / 携帯電話番号';

  let topNode = null;    // platform時の上段アクターノード
  let topEdge = null;    // topNode -> sourceNode の矢印ラベル・属性
  let sourceNode = null; // fork/platform時の起点
  let sourceNote = '';   // platform時の左列上部注記
  let middleNode = null; // LR/3カラム時の中間ノード
  let noteText = '';     // 中間注記
  const branches = [];   // fork時のブランチ [ { target, result } ]
  const sources = [];    // merge時のソース一覧 [ { title, subLines, keys: [], data: [], style } ]
  const platformFlows = []; // platform時の行 [ { leftEdge, card, rightEdge } ]
  const legendItems = [];   // 下部凡例 [ { kind, text, style, dashed } ]
  let mergeNode = null;  // merge時の処理ノード
  let targetNode = null; // merge/platform時の最終統合ノード

  let currentSection = '';

  for (let rawLine of rawLines) {
    let line = rawLine.trim();
    if (!line || line.startsWith('//') || line.startsWith('#')) continue;

    const lower = line.toLowerCase();

    // セクション指定の検出
    if (lower === 'fork' || lower === 'fork:' || lower.startsWith('fork:')) {
      currentSection = 'fork';
      if (mode !== 'platform') mode = 'fork';
      continue;
    }
    if (lower === 'flow' || lower === 'flow:' || lower === 'flows' || lower === 'flows:') {
      currentSection = 'flow';
      mode = 'platform';
      continue;
    }
    if (lower === 'legend' || lower === 'legend:' || lower === 'legends' || lower === 'legends:') {
      currentSection = 'legend';
      continue;
    }
    if (lower === 'merge' || lower === 'merge:' || lower === 'sources' || lower === 'sources:' || lower.startsWith('merge:') || lower.startsWith('sources:')) {
      currentSection = 'merge';
      mode = 'merge';
      continue;
    }

    if (currentSection === 'flow') {
      const cleanFlow = line.replace(/^(?:-\s*|・\s*|->\s*)/, '').trim();
      const parts = splitTopLevelArrows(cleanFlow);
      if (parts.length >= 3) {
        platformFlows.push({
          leftEdge: parseScenarioEdgeMeta(parts[0]),
          card: parseScenarioNode(parts[1]),
          rightEdge: parseScenarioEdgeMeta(parts[2])
        });
      } else if (parts.length === 2) {
        platformFlows.push({
          leftEdge: parseScenarioEdgeMeta(parts[0]),
          card: parseScenarioNode(parts[1]),
          rightEdge: null
        });
      } else if (parts.length === 1 && parts[0]) {
        platformFlows.push({
          leftEdge: null,
          card: parseScenarioNode(parts[0]),
          rightEdge: null
        });
      }
      continue;
    }

    if (currentSection === 'legend') {
      const cleanLeg = line.replace(/^(?:-\s*|・\s*)/, '').trim();
      const legMatch = cleanLeg.match(/^(arrow|line|box|card|rect)\b\s*(.*)$/i);
      const kind = legMatch && /^(box|card|rect)$/i.test(legMatch[1]) ? 'box' : 'arrow';
      const bodyStr = legMatch ? legMatch[2].trim() : cleanLeg;
      const meta = parseScenarioEdgeMeta(bodyStr);
      if (meta.text) {
        legendItems.push({ kind, text: meta.text, style: meta.style, dashed: meta.dashed });
      }
      continue;
    }

    // key: value 判定（ただし引用符内のコロンや先頭引用符行は key とみなさない）
    const startsQuoted = line.startsWith('"') || line.startsWith("'") || line.startsWith('->') || line.startsWith('<-');
    const colonIdx = startsQuoted ? -1 : line.indexOf(':');
    let key = '';
    let val = line;
    if (colonIdx !== -1) {
      const candidateKey = line.slice(0, colonIdx).trim();
      if (/^[a-zA-Z0-9_-]+$/.test(candidateKey)) {
        key = candidateKey.toLowerCase();
        val = line.slice(colonIdx + 1).trim();
      }
    }

    if (key === 'title') {
      title = val.replace(/^["']|["']$/g, '');
    } else if (key === 'icon') {
      icon = val.replace(/^["']|["']$/g, '');
    } else if (key === 'theme') {
      theme = val.toLowerCase().includes('light') ? 'light' : 'dark';
    } else if (key === 'direction' || key === 'dir') {
      direction = val.trim().toUpperCase();
    } else if (key === 'middle' || key === 'center' || key === 'hub') {
      middleNode = parseScenarioNode(val);
    } else if (key === 'mode' || key === 'layout') {
      const lowerVal = val.toLowerCase();
      if (lowerVal.includes('platform') || lowerVal.includes('impact') || lowerVal.includes('hub')) {
        mode = 'platform';
      } else if (lowerVal.includes('merge') || lowerVal.includes('tree-merge') || lowerVal.includes('aggregate')) {
        mode = 'merge';
        currentSection = 'merge';
      } else {
        mode = 'fork';
        currentSection = 'fork';
      }
    } else if (key === 'common_key' || key === 'key' || key === 'keys') {
      commonKey = val.replace(/^["']|["']$/g, '');
    } else if (key === 'top' || key === 'actor' || key === 'attacker') {
      const topParts = splitTopLevelArrows(val);
      topNode = parseScenarioNode(topParts[0]);
      if (topParts.length >= 2) {
        topEdge = parseScenarioEdgeMeta(topParts[1]);
        if (topEdge.style === 'default' && topNode && topNode.style === 'danger') {
          topEdge.style = 'danger';
        }
      }
    } else if (key === 'source_note' || key === 'top_note') {
      sourceNote = val.replace(/^["']|["']$/g, '').replace(/\\n/g, '\n');
    } else if (key === 'source' || key === 'root') {
      sourceNode = parseScenarioNode(val);
    } else if (key === 'note' || key === 'flow' || key === 'event') {
      noteText = val.replace(/^["']|["']$/g, '').replace(/\\n/g, '\n');
    } else if (key === 'process' || (key === 'merge' && val !== '')) {
      mergeNode = parseScenarioNode(val);
    } else if (key === 'target' || key === 'goal' || key === 'result' || key === 'sink') {
      targetNode = parseScenarioNode(val);
    } else if (line.startsWith('<-') || (currentSection === 'merge' && (line.startsWith('-') || line.startsWith('・') || line.startsWith('【') || line.startsWith('[')))) {
      // mergeモードのソースノード
      mode = 'merge';
      const cleanLine = line.replace(/^(?:<-\s*|-\s*|・\s*)/, '');
      if (cleanLine.includes('->') || cleanLine.includes('──>')) {
        const mparts = splitTopLevelArrows(cleanLine);
        if (mparts.length >= 2) {
          mergeNode = parseScenarioNode(mparts[0]);
          targetNode = parseScenarioNode(mparts[1]);
        }
      } else {
        sources.push(parseScenarioNode(cleanLine, commonKey));
      }
    } else if (line.startsWith('->') || line.startsWith('|->') || line.startsWith('├') || line.startsWith('└') || currentSection === 'fork') {
      // forkモードのブランチ
      mode = 'fork';
      const cleanLine = line.replace(/^(?:->|\|->|[├└]─*>)\s*/, '');
      const parts = splitTopLevelArrows(cleanLine);
      if (parts.length >= 2) {
        branches.push({ target: parseScenarioNode(parts[0]), result: parseScenarioNode(parts[1]) });
      } else if (parts.length === 1) {
        branches.push({ target: parseScenarioNode(parts[0]), result: null });
      }
    } else {
      // 暗黙判定
      if (line.includes('->') || line.includes('──>')) {
        const parts = splitTopLevelArrows(line);
        if (parts.length >= 2) {
          if (mode === 'merge') {
            mergeNode = parseScenarioNode(parts[0]);
            targetNode = parseScenarioNode(parts[1]);
          } else {
            branches.push({ target: parseScenarioNode(parts[0]), result: parseScenarioNode(parts[1]) });
          }
        }
      } else if (!sourceNode && (line.startsWith('【') || line.startsWith('['))) {
        sourceNode = parseScenarioNode(line);
      }
    }
  }

  if (mode === 'auto') {
    if (platformFlows.length > 0 || topNode) mode = 'platform';
    else if (sources.length > 0 || mergeNode) mode = 'merge';
    else mode = 'fork';
  }

  return {
    title,
    icon,
    theme,
    mode,
    direction,
    commonKey,
    topNode,
    topEdge,
    sourceNode,
    sourceNote,
    middleNode,
    noteText,
    branches,
    platformFlows,
    legendItems,
    sources,
    mergeNode,
    targetNode
  };
}

// ノード文字列からラベル、サブタイトル、共通キー、データ項目を構造化パース
function parseScenarioNode(str, defaultCommonKey) {
  if (!str) return null;
  let text = str.trim();

  // スタイル指定 [danger], [warn] 等の抽出（末尾のクォートの外側・内側の両方に対応）
  let style = 'default';
  const badgeMatch = text.match(/(?:["']\s*)?\[\s*(danger|warn|warning|info|success|neutral|accent)\s*\]\s*["']?$/i);
  if (badgeMatch) {
    style = badgeMatch[1].toLowerCase();
    text = text.slice(0, badgeMatch.index).trim();
  }

  // 前後の引用符を完全除去
  text = text.replace(/^["']+|["']+$/g, '').trim();

  // 改行コード正規化
  text = text.replace(/\\n/g, '\n');
  const rawLines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  const rawTitle = rawLines[0] || '';
  const title = rawTitle.replace(/^["']+|["']+$/g, '').trim();
  const subLines = rawLines.slice(1);

  // 漏洩データカード用のキー分離（メールアドレス、電話番号など）
  const keys = [];
  const data = [];

  subLines.forEach((line) => {
    // 各行の前後の括弧 [] や引用符 "'、行頭記号 ・- を完全除去
    const cleanItem = line.replace(/^[\[\・\-\s"']+|[\]\・\-\s"']+$/g, '').trim();
    if (!cleanItem) return;
    if (cleanItem.includes('メール') || cleanItem.includes('電話') || cleanItem.includes('ID') || cleanItem.includes('PW') || cleanItem.includes('パスワード')) {
      keys.push(cleanItem);
    } else {
      data.push(cleanItem);
    }
  });

  return {
    raw: text,
    title,
    subLines: subLines.map(l => l.replace(/^[\[\・\-\s"']+|[\]\・\-\s"']+$/g, '').trim()).filter(Boolean),
    keys,
    data,
    style
  };
}

// -------------------------------------------------------------------
// テキスト概算幅・高さ計算ヘルパー（可変カード幅・高さ用）
// -------------------------------------------------------------------
function calcTextWidthPx(str, fontSize) {
  return estimateSvgTextWidth(str, fontSize, false);
}

function calcScenarioNodeWidth(node, defaultIcon, minW) {
  if (!node) return minW || 210;
  const icon = defaultIcon || '';
  const fullTitle = icon && !node.title.includes(icon) ? `${icon} ${node.title}` : node.title;
  let maxW = calcTextWidthPx(fullTitle, 13.5) + 36;

  if (node.subLines && node.subLines.length > 0) {
    node.subLines.forEach(sub => {
      const subW = calcTextWidthPx(sub, 12) + 38;
      if (subW > maxW) maxW = subW;
    });
  }
  return Math.max(minW || 210, Math.ceil(maxW));
}

function calcScenarioNodeHeight(node) {
  if (!node) return 46;
  const subCount = (node.subLines && node.subLines.length > 0) ? node.subLines.length : 0;
  if (subCount === 0) return 46;
  return 46 + subCount * 22;
}

// ==========================================
// SVG レンダリングメイン関数
// ==========================================
function drawScenarioSvg(text, container, label) {
  if (!container) return;
  container.innerHTML = '';

  const parsed = parseScenarioText(text);
  if (!parsed) {
    container.innerHTML = '<div style="color:#ef4444;padding:12px;">構文エラー: シナリオ図の定義が見つかりません。</div>';
    return;
  }

  const isDark = parsed.theme === 'dark';
  const themeColors = {
    bg: isDark ? '#0b0f19' : '#ffffff',
    cardBg: isDark ? '#111827' : '#f8fafc',
    cardBorder: isDark ? '#1e293b' : '#e2e8f0',
    textMain: isDark ? '#f8fafc' : '#0f172a',
    textMuted: isDark ? '#94a3b8' : '#64748b',
    line: isDark ? '#334155' : '#94a3b8',
    lineActive: isDark ? '#38bdf8' : '#0284c7',
    keyBadgeBg: isDark ? '#0c4a6e' : '#e0f2fe',
    keyBadgeText: isDark ? '#7dd3fc' : '#0369a1',
    keyBadgeBorder: isDark ? '#0284c7' : '#bae6fd',
    badgeDangerBg: isDark ? '#450a0a' : '#fee2e2',
    badgeDangerText: isDark ? '#fca5a5' : '#b91c1c',
    badgeDangerBorder: isDark ? '#dc2626' : '#fca5a5',
    badgeWarnBg: isDark ? '#451a03' : '#fef3c7',
    badgeWarnText: isDark ? '#fcd34d' : '#d97706',
    badgeWarnBorder: isDark ? '#d97706' : '#fde68a',
    badgeSuccessBg: isDark ? '#064e3b' : '#d1fae5',
    badgeSuccessText: isDark ? '#6ee7b7' : '#047857',
    badgeSuccessBorder: isDark ? '#059669' : '#a7f3d0',
    badgeInfoBg: isDark ? '#0f172a' : '#f1f5f9',
    badgeInfoText: isDark ? '#38bdf8' : '#0284c7',
    badgeInfoBorder: isDark ? '#0284c7' : '#cbd5e1'
  };

  const getNodeColors = (style) => {
    switch (style) {
      case 'danger':
        return { bg: themeColors.badgeDangerBg, text: themeColors.badgeDangerText, border: themeColors.badgeDangerBorder };
      case 'warn':
      case 'warning':
        return { bg: themeColors.badgeWarnBg, text: themeColors.badgeWarnText, border: themeColors.badgeWarnBorder };
      case 'success':
        return { bg: themeColors.badgeSuccessBg, text: themeColors.badgeSuccessText, border: themeColors.badgeSuccessBorder };
      case 'info':
      case 'accent':
        return { bg: themeColors.badgeInfoBg, text: themeColors.badgeInfoText, border: themeColors.badgeInfoBorder };
      default:
        return { bg: themeColors.cardBg, text: themeColors.textMain, border: themeColors.cardBorder };
    }
  };

  // ===================================================================
  // モード0: プラットフォーム中継・影響/再開フロー (layout: platform)
  // ===================================================================
  if (parsed.mode === 'platform') {
    drawPlatformFlowSvg(parsed, container, label, themeColors, isDark, getNodeColors);
    return;
  }

  // ===================================================================
  // モード1: 多対1 集約・名寄せフロー (漏洩元A〜F → 名寄せ処理 → 統合プロファイル)
  // ===================================================================
  if (parsed.mode === 'merge') {
    const srcList = parsed.sources.length > 0 ? parsed.sources : [
      { title: '【漏洩元A：EC通販サイト】', keys: ['メールアドレス', '携帯電話番号'], data: ['氏名', '自宅住所', 'クレジットカード情報'], style: 'default' },
      { title: '【漏洩元B：転職・就職サイト】', keys: ['メールアドレス', '携帯電話番号'], data: ['勤務先企業名', '年収', '学歴・職歴'], style: 'default' },
      { title: '【漏洩元C：医療・オンライン薬局】', keys: ['メールアドレス', '携帯電話番号'], data: ['通院歴', '既往症', '処方薬データ'], style: 'danger' },
      { title: '【漏洩元D：証券・金融取引所】', keys: ['メールアドレス', '携帯電話番号'], data: ['資産状況', '保有口座残高', '取引履歴'], style: 'danger' },
      { title: '【漏洩元E：遺伝子解析サービス】', keys: ['メールアドレス', '携帯電話番号'], data: ['DNA配列データ', '遺伝的疾患リスク'], style: 'danger' },
      { title: '【漏洩元F：SNS・コミュニティ】', keys: ['メールアドレス', '携帯電話番号'], data: ['顔写真', '交友関係', '趣味・位置情報'], style: 'default' }
    ];

    const mNode = parsed.mergeNode || {
      title: '【名寄せ処理（突合エンジン）】',
      subLines: ['メールアドレス / 携帯電話番号', 'を共通キーとして完全自動突合'],
      style: 'info'
    };

    const tNode = parsed.targetNode || {
      title: '【 統合された完全個人プロファイル 】',
      subLines: [
        '🔑 共通識別子: メールアドレス、携帯電話番号',
        '🏢 基本情報: 氏名、自宅住所、顔写真、交友関係',
        '💰 経済情報: 勤務先、推定年収、資産状況、口座残高',
        '🧬 極秘情報: 通院歴、病歴、遺伝的リスク(DNA)',
        '⚠️ 脅威: 標的型恐喝、不正送金、完全なりすまし犯罪'
      ],
      style: 'danger'
    };

    const width = 1040;
    const cardHeight = 94;
    const cardGap = 16;
    const srcCount = srcList.length;
    const totalListHeight = srcCount * cardHeight + (srcCount - 1) * cardGap;
    const height = Math.max(720, totalListHeight + 110);

    container.dataset.baseWidth = width;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.style.maxWidth = '100%';
    svg.style.height = 'auto';
    svg.style.display = 'block';

    appendDefs(svg, themeColors, isDark);

    // 背景
    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bg.setAttribute('width', width);
    bg.setAttribute('height', height);
    bg.setAttribute('rx', '12');
    bg.setAttribute('fill', themeColors.bg);
    svg.appendChild(bg);

    // レイアウト座標（左右余白 40px で均等化）
    const leftX = 40;
    const startY = 68;
    const srcW = 320;
    const busX = leftX + srcW + 40; // 400

    const mergeX = busX + 44; // 444
    const mergeW = 210;
    const mergeH = 110;
    const mergeY = startY + (totalListHeight - mergeH) / 2;
    const mergeCenterY = mergeY + mergeH / 2;

    const targetX = mergeX + mergeW + 46; // 700
    const targetW = 300;
    const targetH = Math.min(360, totalListHeight - 20);
    const targetY = startY + (totalListHeight - targetH) / 2;
    // 右余白: 1040 - (700 + 300) = 40px（左余白 40px と完全一致）

    // タイトル（左マージンをカード左端と統一）
    const mainIcon = parsed.icon || '🔍';
    const mainTitle = parsed.title || '複数流出データの名寄せ・プロファイリング統合の脅威';
    appendTitle(svg, mainIcon, mainTitle, themeColors.textMain, leftX);

    const contentGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    svg.appendChild(contentGroup);

    let minBusY = Infinity, maxBusY = -Infinity;

    // 1. 左側：各漏洩元カードの描画
    srcList.forEach((src, idx) => {
      const curY = startY + idx * (cardHeight + cardGap);
      const wireY = curY + cardHeight / 2;
      minBusY = Math.min(minBusY, wireY);
      maxBusY = Math.max(maxBusY, wireY);

      drawLeakSourceCard(contentGroup, leftX, curY, srcW, cardHeight, src, themeColors, isDark);

      // カード右端から合流バスへの水平線
      drawStraightLine(contentGroup, leftX + srcW, wireY, busX, wireY, themeColors.lineActive, false);
    });

    // 2. 縦の合流バスライン（すべての流出データが集まるコネクタ）
    drawStraightLine(contentGroup, busX, minBusY, busX, maxBusY, themeColors.lineActive, false);

    // 3. 合流バス中央から【名寄せ処理】への矢印
    drawStraightLine(contentGroup, busX, mergeCenterY, mergeX - 6, mergeCenterY, themeColors.lineActive, true);

    // 4. 中央：【名寄せ処理】カード
    drawMergeNodeCard(contentGroup, mergeX, mergeY, mergeW, mergeH, mNode, themeColors, isDark);

    // 5. 【名寄せ処理】から【統合プロファイル】への矢印
    drawStraightLine(contentGroup, mergeX + mergeW, mergeCenterY, targetX - 6, mergeCenterY, themeColors.badgeDangerBorder, true);

    // 6. 右側：【統合された完全個人プロファイル】カード
    drawTargetProfileCard(contentGroup, targetX, targetY, targetW, targetH, tNode, themeColors, isDark);

    container.appendChild(svg);
    appendLabel(container, label);
    return;
  }

  // ===================================================================
  // モード2: 1対多 分岐・拡散フロー / 3カラム・LRレイアウト
  // ===================================================================
  const isLR = parsed.direction === 'LR' || parsed.middleNode != null;
  const middleNode = parsed.middleNode;
  const hasNote = Boolean(parsed.noteText && parsed.noteText.trim());
  const note = parsed.noteText || '';

  // -----------------------------------------------------------------
  // パターンA: 左右配置 (LR / 3カラム: 左[source] → 中央[middle] → 右[fork])
  // -----------------------------------------------------------------
  if (isLR) {
    const srcNode = parsed.sourceNode || {
      title: '【起点】',
      subLines: [],
      style: 'default'
    };

    const branchList = parsed.branches.length > 0 ? parsed.branches : [
      { target: { title: '【分岐A】', subLines: [], style: 'default' }, result: null }
    ];

    // 幅と高さの計算
    const srcW = Math.max(260, calcScenarioNodeWidth(srcNode, '👤', 260));
    const srcH = calcScenarioNodeHeight(srcNode);

    const midW = middleNode ? Math.max(260, calcScenarioNodeWidth(middleNode, '🏢', 260)) : 0;
    const midH = middleNode ? calcScenarioNodeHeight(middleNode) : 0;

    let maxTargetW = 240;
    branchList.forEach(br => {
      if (br.target) {
        const tw = calcScenarioNodeWidth(br.target, '🎯', 240);
        if (tw > maxTargetW) maxTargetW = tw;
      }
    });

    const hasAnyResult = branchList.some(br => br.result != null);
    let maxResultW = 320;
    if (hasAnyResult) {
      branchList.forEach(br => {
        if (br.result) {
          const icon = br.result.style === 'danger' ? '🚨' : '⚠️';
          const rw = calcScenarioNodeWidth(br.result, icon, 260);
          if (rw > maxResultW) maxResultW = rw;
        }
      });
    }

    // ブランチの累積高さと配置計算
    const branchGap = 16;
    let totalForkH = 0;
    const branchHeights = branchList.map(br => {
      const tH = calcScenarioNodeHeight(br.target);
      const rH = br.result ? calcScenarioNodeHeight(br.result) : 0;
      const bH = Math.max(tH, rH, 46);
      totalForkH += bH;
      return bH;
    });
    totalForkH += (branchList.length - 1) * branchGap;

    const topHeaderY = 72;
    const contentMaxH = Math.max(srcH, midH, totalForkH);
    const height = Math.max(500, topHeaderY + contentMaxH + 50);

    const contentCenterY = topHeaderY + contentMaxH / 2;

    const srcX = 48;
    const srcY = contentCenterY - srcH / 2;

    const colGap = 56;
    let midX = 0;
    let midY = 0;
    let forkX = 0;

    if (middleNode) {
      midX = srcX + srcW + colGap;
      midY = contentCenterY - midH / 2;
      forkX = midX + midW + colGap;
    } else {
      forkX = srcX + srcW + colGap;
    }

    const forkRight = forkX + maxTargetW + (hasAnyResult ? (42 + maxResultW) : 0);
    const width = Math.max(1040, forkRight + 48);

    container.dataset.baseWidth = width;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.style.maxWidth = '100%';
    svg.style.height = 'auto';
    svg.style.display = 'block';

    appendDefs(svg, themeColors, isDark);

    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bg.setAttribute('width', width);
    bg.setAttribute('height', height);
    bg.setAttribute('rx', '12');
    bg.setAttribute('fill', themeColors.bg);
    svg.appendChild(bg);

    const mainIcon = parsed.icon || '⚖️';
    const mainTitle = parsed.title || 'シナリオフロー';
    appendTitle(svg, mainIcon, mainTitle, themeColors.textMain, 46);

    const contentGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    svg.appendChild(contentGroup);

    // 1. 左列: source カード描画
    drawGenericCard(contentGroup, srcX, srcY, srcW, srcH, srcNode.title, srcNode.subLines, getNodeColors(srcNode.style), isDark, '👤');

    // 2. 中央列: middle カード（ある場合）
    let hubRightX = srcX + srcW;
    let hubCenterY = contentCenterY;

    if (middleNode) {
      // source -> middle への矢印
      drawStraightLine(contentGroup, srcX + srcW, contentCenterY, midX - 6, contentCenterY, themeColors.lineActive, true);
      drawGenericCard(contentGroup, midX, midY, midW, midH, middleNode.title, middleNode.subLines, getNodeColors(middleNode.style), isDark, '🏢');
      hubRightX = midX + midW;
      hubCenterY = contentCenterY;
    }

    // 3. 右列: fork ブランチ群
    const forkStartY = contentCenterY - totalForkH / 2;
    const busX = hubRightX + 24;
    let curBranchY = forkStartY;
    const branchCenters = [];

    branchList.forEach((br, idx) => {
      const bH = branchHeights[idx];
      const bCenterY = curBranchY + bH / 2;
      branchCenters.push(bCenterY);

      // バス線からブランチへの矢印
      drawStraightLine(contentGroup, busX, bCenterY, forkX - 6, bCenterY, themeColors.lineActive, true);

      // ブランチカード
      drawGenericCard(contentGroup, forkX, curBranchY, maxTargetW, bH, br.target.title, br.target.subLines, getNodeColors(br.target.style), isDark, '🎯');

      if (br.result) {
        const arrowStartX = forkX + maxTargetW;
        const resultStartX = arrowStartX + 42;
        drawStraightLine(contentGroup, arrowStartX, bCenterY, resultStartX - 6, bCenterY, themeColors.lineActive, true);
        const rColors = getNodeColors(br.result.style);
        drawGenericCard(contentGroup, resultStartX, curBranchY, maxResultW, bH, br.result.title, br.result.subLines, rColors, isDark, br.result.style === 'danger' ? '🚨' : '⚠️');
      }

      curBranchY += bH + branchGap;
    });

    // ハブからバス線への水平線
    drawStraightLine(contentGroup, hubRightX, hubCenterY, busX, hubCenterY, themeColors.lineActive, false);

    // 縦のバス線
    const firstCenter = branchCenters[0] || hubCenterY;
    const lastCenter = branchCenters[branchCenters.length - 1] || hubCenterY;
    drawStraightLine(contentGroup, busX, Math.min(firstCenter, hubCenterY), busX, Math.max(lastCenter, hubCenterY), themeColors.lineActive, false);

    container.appendChild(svg);
    appendLabel(container, label);
    return;
  }

  // -----------------------------------------------------------------
  // パターンB: 上下配置 (従来のTDレイアウト)
  // -----------------------------------------------------------------
  const srcNode = parsed.sourceNode || {
    title: '【漏洩元：サイトA】',
    subLines: ['(セキュリティの甘いサービス)'],
    style: 'default'
  };

  const branchList = parsed.branches.length > 0 ? parsed.branches : [
    { target: { title: '【サイトB (ECサイト)】', subLines: [], style: 'default' }, result: { title: 'ログイン成功 (登録カードで不正購入)', subLines: [], style: 'warn' } },
    { target: { title: '【サイトC (金融機関)】', subLines: [], style: 'default' }, result: { title: 'ログイン成功 (不正送金リスク)', subLines: [], style: 'danger' } },
    { target: { title: '【サイトD (SNS)】', subLines: [], style: 'default' }, result: { title: 'ログイン成功 (アカウント乗っ取り・なりすまし)', subLines: [], style: 'warn' } }
  ];

  // 1. トップソースカード (漏洩元)
  const srcX = 48;
  const srcY = 68;
  const srcW = Math.max(340, calcScenarioNodeWidth(srcNode, '🏢', 340));
  const srcH = 54 + (srcNode.subLines.length * 20);

  // 2. 中間注記カード (指定がある場合のみ)
  const noteLines = hasNote ? note.split('\n') : [];
  const noteH = hasNote ? Math.max(48, 28 + noteLines.length * 20) : 0;
  let maxNoteW = 460;
  if (hasNote) {
    noteLines.forEach(l => {
      const lw = calcTextWidthPx(l, 12) + 36;
      if (lw > maxNoteW) maxNoteW = lw;
    });
  }
  const noteW = Math.ceil(maxNoteW);
  const noteY = hasNote ? (srcY + srcH + 30) : 0;

  // 3. 分岐ブランチ群のサイズ計算
  const hasAnyResult = branchList.some(br => br.result != null);

  let maxTargetW = 210;
  branchList.forEach(br => {
    if (br.target) {
      const tw = calcScenarioNodeWidth(br.target, '🎯', 210);
      if (tw > maxTargetW) maxTargetW = tw;
    }
  });

  let maxResultW = 380;
  if (hasAnyResult) {
    branchList.forEach(br => {
      if (br.result) {
        const icon = br.result.style === 'danger' ? '🚨' : '⚠️';
        const rw = calcScenarioNodeWidth(br.result, icon, 300);
        if (rw > maxResultW) maxResultW = rw;
      }
    });
  }

  const forkStartY = hasNote ? (noteY + noteH) : (srcY + srcH + 24);
  const forkColX = srcX + 50;
  const branchStartX = srcX + 85;
  const branchStartY = forkStartY + 38;
  const branchGap = 20;

  // 各ブランチの位置とサイズを計算
  const branchPositions = [];
  let curY = branchStartY;

  branchList.forEach((br) => {
    const tH = calcScenarioNodeHeight(br.target);
    const rH = br.result ? calcScenarioNodeHeight(br.result) : 0;
    const bH = Math.max(tH, rH, 46);
    const centerY = curY + bH / 2;

    branchPositions.push({
      br,
      topY: curY,
      centerY,
      bH
    });

    curY += bH + branchGap;
  });

  const lastBranch = branchPositions[branchPositions.length - 1];
  const forkEndY = lastBranch ? lastBranch.centerY : branchStartY;

  // 全体幅・高さの動的決定
  const contentRight = branchStartX + maxTargetW + (hasAnyResult ? (42 + maxResultW) : 0) + 60;
  const topCardsRight = Math.max(srcX + srcW + 60, hasNote ? (srcX + 16 + noteW + 60) : 0);
  const width = Math.max(880, Math.ceil(contentRight), Math.ceil(topCardsRight));
  const height = Math.max(520, curY + 30);

  container.dataset.baseWidth = width;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.style.maxWidth = '100%';
  svg.style.height = 'auto';
  svg.style.display = 'block';

  appendDefs(svg, themeColors, isDark);

  const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  bg.setAttribute('width', width);
  bg.setAttribute('height', height);
  bg.setAttribute('rx', '12');
  bg.setAttribute('fill', themeColors.bg);
  svg.appendChild(bg);

  const mainIcon = parsed.icon || '🥷';
  const mainTitle = parsed.title || 'パスワードリスト攻撃シナリオ (アカウント使い回しの脅威)';
  appendTitle(svg, mainIcon, mainTitle, themeColors.textMain, 48);

  const contentGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  svg.appendChild(contentGroup);

  // 1. トップソースカード (漏洩元)
  drawGenericCard(contentGroup, srcX, srcY, srcW, srcH, srcNode.title, srcNode.subLines, getNodeColors(srcNode.style), isDark, '🏢');

  // 2. 中間注記カード (ある場合のみ描画)
  if (hasNote) {
    drawStraightLine(contentGroup, srcX + 50, srcY + srcH, srcX + 50, noteY, themeColors.lineActive, true);
    drawNoteBox(contentGroup, srcX + 16, noteY, noteW, noteH, noteLines, themeColors, isDark);
  } else {
    drawStraightLine(contentGroup, srcX + 50, srcY + srcH, srcX + 50, forkStartY, themeColors.lineActive, false);
  }

  // 3. 分岐コネクタとブランチノード群
  drawStraightLine(contentGroup, forkColX, forkStartY, forkColX, forkEndY, themeColors.lineActive, false);

  branchPositions.forEach(pos => {
    const { br, topY, centerY, bH } = pos;

    drawStraightLine(contentGroup, forkColX, centerY, branchStartX - 6, centerY, themeColors.lineActive, true);
    drawGenericCard(contentGroup, branchStartX, topY, maxTargetW, bH, br.target.title, br.target.subLines, getNodeColors(br.target.style), isDark, '🎯');

    if (br.result) {
      const arrowStartX = branchStartX + maxTargetW;
      const resultStartX = arrowStartX + 42;

      drawStraightLine(contentGroup, arrowStartX, centerY, resultStartX - 6, centerY, themeColors.lineActive, true);
      const rColors = getNodeColors(br.result.style);
      drawGenericCard(contentGroup, resultStartX, topY, maxResultW, bH, br.result.title, br.result.subLines, rColors, isDark, br.result.style === 'danger' ? '🚨' : '⚠️');
    }
  });

  container.appendChild(svg);
  appendLabel(container, label);
}

// -------------------------------------------------------------------
// 共通描画部品・コンポーネント
// -------------------------------------------------------------------

// 漏洩元カード（メール・電話番号を共通キーとして強調）
function drawLeakSourceCard(parent, x, y, w, h, src, colors, isDark) {
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('filter', 'url(#scenario-shadow)');

  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('x', x);
  rect.setAttribute('y', y);
  rect.setAttribute('width', w);
  rect.setAttribute('height', h);
  rect.setAttribute('rx', '8');
  rect.setAttribute('fill', colors.cardBg);
  rect.setAttribute('stroke', src.style === 'danger' ? colors.badgeDangerBorder : colors.cardBorder);
  rect.setAttribute('stroke-width', '1.6');
  g.appendChild(rect);

  // 会社・サイト名
  const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  title.setAttribute('x', x + 12);
  title.setAttribute('y', y + 24);
  title.setAttribute('fill', colors.textMain);
  title.setAttribute('font-size', '13.5');
  title.setAttribute('font-weight', '700');
  title.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
  title.textContent = `📁 ${src.title}`;
  g.appendChild(title);

  // 共通キーバッジ（メールアドレス、携帯電話番号）
  const keyBadge = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const kbRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  kbRect.setAttribute('x', x + 12);
  kbRect.setAttribute('y', y + 34);
  kbRect.setAttribute('width', w - 24);
  kbRect.setAttribute('height', '24');
  kbRect.setAttribute('rx', '4');
  kbRect.setAttribute('fill', colors.keyBadgeBg);
  kbRect.setAttribute('stroke', colors.keyBadgeBorder);
  kbRect.setAttribute('stroke-width', '1');
  keyBadge.appendChild(kbRect);

  const kbText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  kbText.setAttribute('x', x + 18);
  kbText.setAttribute('y', y + 50);
  kbText.setAttribute('fill', colors.keyBadgeText);
  kbText.setAttribute('font-size', '11');
  kbText.setAttribute('font-weight', 'bold');
  kbText.setAttribute('font-family', 'Consolas, Monaco, "Courier New", monospace');
  kbText.textContent = '🔑 [メールアドレス] [携帯電話番号]';
  keyBadge.appendChild(kbText);
  g.appendChild(keyBadge);

  // その他漏洩データ
  const dataText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  dataText.setAttribute('x', x + 14);
  dataText.setAttribute('y', y + 76);
  dataText.setAttribute('fill', src.style === 'danger' ? colors.badgeDangerText : colors.textMuted);
  dataText.setAttribute('font-size', '11.5');
  dataText.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
  const dataItems = src.data.length > 0 ? src.data.join(', ') : src.subLines.join(', ');
  dataText.textContent = `└ 漏洩項目: ${dataItems}`;
  g.appendChild(dataText);

  parent.appendChild(g);
}

// 名寄せ処理ノードカード
function drawMergeNodeCard(parent, x, y, w, h, node, colors, isDark) {
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('filter', 'url(#scenario-shadow)');

  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('x', x);
  rect.setAttribute('y', y);
  rect.setAttribute('width', w);
  rect.setAttribute('height', h);
  rect.setAttribute('rx', '10');
  rect.setAttribute('fill', isDark ? '#0f172a' : '#f1f5f9');
  rect.setAttribute('stroke', colors.lineActive);
  rect.setAttribute('stroke-width', '2');
  g.appendChild(rect);

  const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  title.setAttribute('x', x + w / 2);
  title.setAttribute('y', y + 32);
  title.setAttribute('fill', colors.textMain);
  title.setAttribute('font-size', '14');
  title.setAttribute('font-weight', '700');
  title.setAttribute('text-anchor', 'middle');
  title.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
  title.textContent = '⚙️ 名寄せ処理エンジン';
  g.appendChild(title);

  const sub1 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  sub1.setAttribute('x', x + w / 2);
  sub1.setAttribute('y', y + 58);
  sub1.setAttribute('fill', colors.keyBadgeText);
  sub1.setAttribute('font-size', '11.5');
  sub1.setAttribute('font-weight', 'bold');
  sub1.setAttribute('text-anchor', 'middle');
  sub1.textContent = 'メアド・電話番号で';
  g.appendChild(sub1);

  const sub2 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  sub2.setAttribute('x', x + w / 2);
  sub2.setAttribute('y', y + 78);
  sub2.setAttribute('fill', colors.keyBadgeText);
  sub2.setAttribute('font-size', '11.5');
  sub2.setAttribute('font-weight', 'bold');
  sub2.setAttribute('text-anchor', 'middle');
  sub2.textContent = '全データを完全突合 ──>';
  g.appendChild(sub2);

  parent.appendChild(g);
}

// 統合された個人プロファイルカード（最終結果）
function drawTargetProfileCard(parent, x, y, w, h, node, colors, isDark) {
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('filter', 'url(#scenario-shadow)');

  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('x', x);
  rect.setAttribute('y', y);
  rect.setAttribute('width', w);
  rect.setAttribute('height', h);
  rect.setAttribute('rx', '10');
  rect.setAttribute('fill', isDark ? '#260505' : '#fff1f2');
  rect.setAttribute('stroke', '#e11d48');
  rect.setAttribute('stroke-width', '2.5');
  g.appendChild(rect);

  // タイトル
  const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  title.setAttribute('x', x + 16);
  title.setAttribute('y', y + 32);
  title.setAttribute('fill', '#f43f5e');
  title.setAttribute('font-size', '14.5');
  title.setAttribute('font-weight', '800');
  title.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
  title.textContent = '👤 統合された完全プロファイル';
  g.appendChild(title);

  // 危険バッジ
  const warnBadge = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  warnBadge.setAttribute('x', x + 16);
  warnBadge.setAttribute('y', y + 44);
  warnBadge.setAttribute('width', w - 32);
  warnBadge.setAttribute('height', '24');
  warnBadge.setAttribute('rx', '4');
  warnBadge.setAttribute('fill', '#4c0519');
  warnBadge.setAttribute('stroke', '#be123c');
  warnBadge.setAttribute('stroke-width', '1');
  g.appendChild(warnBadge);

  const warnText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  warnText.setAttribute('x', x + 24);
  warnText.setAttribute('y', y + 60);
  warnText.setAttribute('fill', '#fda4af');
  warnText.setAttribute('font-size', '11');
  warnText.setAttribute('font-weight', 'bold');
  warnText.textContent = '🚨 超高精度プロファイリング完成';
  g.appendChild(warnText);

  // 各統合データ項目
  const items = node.subLines.length > 0 ? node.subLines : [
    '🔑 共通キー: メアド、携帯電話番号',
    '🏢 基本情報: 氏名、自宅住所、顔写真',
    '💰 経済情報: 勤務先、年収、資産状況、口座',
    '🧬 機微情報: 通院歴、病歴、遺伝的リスク(DNA)',
    '⚠️ 被害: 標的型恐喝、不正送金、なりすまし'
  ];

  items.forEach((item, idx) => {
    const itxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    itxt.setAttribute('x', x + 16);
    itxt.setAttribute('y', y + 96 + idx * 24);
    itxt.setAttribute('fill', isDark ? '#fecdd3' : '#9f1239');
    itxt.setAttribute('font-size', '11.5');
    itxt.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
    itxt.textContent = item;
    g.appendChild(itxt);
  });

  parent.appendChild(g);
}

// 汎用カード描画
function drawGenericCard(parent, x, y, w, h, title, subLines, colors, isDark, icon) {
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('filter', 'url(#scenario-shadow)');

  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('x', x);
  rect.setAttribute('y', y);
  rect.setAttribute('width', w);
  rect.setAttribute('height', h);
  rect.setAttribute('rx', '8');
  rect.setAttribute('fill', colors.bg);
  rect.setAttribute('stroke', colors.border);
  rect.setAttribute('stroke-width', '1.6');
  g.appendChild(rect);

  const tText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  tText.setAttribute('x', x + 12);
  tText.setAttribute('y', y + 26);
  tText.setAttribute('fill', colors.text);
  tText.setAttribute('font-size', '13.5');
  tText.setAttribute('font-weight', '700');
  tText.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');

  let titleStr = title;
  if (icon && !titleStr.includes(icon)) {
    titleStr = `${icon} ${titleStr}`;
  }
  tText.textContent = titleStr;
  g.appendChild(tText);

  if (subLines && subLines.length > 0) {
    subLines.forEach((sub, sIdx) => {
      const sText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      sText.setAttribute('x', x + 16);
      sText.setAttribute('y', y + 48 + sIdx * 20);
      sText.setAttribute('fill', isDark ? '#cbd5e1' : '#475569');
      sText.setAttribute('font-size', '12');
      sText.setAttribute('font-family', 'Consolas, Monaco, "Courier New", monospace');
      sText.textContent = sub;
      g.appendChild(sText);
    });
  }

  parent.appendChild(g);
}

// 注記ボックス
function drawNoteBox(parent, x, y, w, h, lines, themeColors, isDark) {
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('x', x);
  rect.setAttribute('y', y);
  rect.setAttribute('width', w);
  rect.setAttribute('height', h);
  rect.setAttribute('rx', '6');
  rect.setAttribute('fill', isDark ? '#1e1b4b' : '#e0e7ff');
  rect.setAttribute('stroke', isDark ? '#4338ca' : '#818cf8');
  rect.setAttribute('stroke-width', '1.4');
  rect.setAttribute('stroke-dasharray', '4 3');
  g.appendChild(rect);

  lines.forEach((line, idx) => {
    const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    txt.setAttribute('x', x + 14);
    txt.setAttribute('y', y + 22 + idx * 20);
    txt.setAttribute('fill', isDark ? '#c7d2fe' : '#3730a3');
    txt.setAttribute('font-size', '12');
    txt.setAttribute('font-weight', idx === 0 ? '600' : '400');
    txt.setAttribute('font-family', 'Consolas, Monaco, "Courier New", monospace');
    txt.textContent = line;
    g.appendChild(txt);
  });

  parent.appendChild(g);
}

// 直線を描画（実線/破線およびカスタム矢印マーカー対応）
function drawStraightLine(parent, x1, y1, x2, y2, color, hasArrow, dashed = false, customMarkerId = null) {
  let markerEnd = null;
  if (hasArrow) {
    markerEnd = customMarkerId || (
      color.includes('dc2626') || color.includes('e11d48') || color.includes('991b1b')
        ? 'scenario-arrow-danger'
        : (color.includes('38bdf8') || color.includes('0284c7') ? 'scenario-arrow-active' : 'scenario-arrow')
    );
  }
  drawSvgConnector(parent, { x1, y1, x2, y2 }, {
    stroke: color,
    strokeWidth: '2.2',
    dasharray: dashed ? '5 4' : null,
    markerEnd
  });
}

// テキスト折り返し（プラットフォームフロー・長文ラベル用）
function wrapScenarioText(text, maxWidthPx, fontSize) {
  return wrapSvgTextLines(text, maxWidthPx, fontSize);
}

function splitLeadingEmoji(text) {
  const m = String(text || '').trim().match(/^([\u{1F1E6}-\u{1F1FF}\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}][\u{FE0F}\u{200D}]*)\s*(.+)$/u);
  if (m) return { emoji: m[1], body: m[2] };
  return { emoji: '', body: String(text || '').trim() };
}

function drawPlatformFlowSvg(parsed, container, label, themeColors, isDark, getNodeColors) {
  const svgNS = 'http://www.w3.org/2000/svg';
  const getEdgeStyle = (styleKey) => {
    switch (styleKey) {
      case 'danger':
        return {
          stroke: isDark ? '#f87171' : '#991b1b',
          text: isDark ? '#fca5a5' : '#7f1d1d',
          marker: 'scenario-arrow-crimson'
        };
      case 'success':
        return {
          stroke: isDark ? '#34d399' : '#4a7c59',
          text: isDark ? '#a7f3d0' : '#334155',
          marker: 'scenario-arrow-success'
        };
      case 'info':
      case 'accent':
        return {
          stroke: isDark ? '#60a5fa' : '#5b829e',
          text: isDark ? '#cbd5e1' : '#334155',
          marker: 'scenario-arrow-steel'
        };
      case 'warn':
      case 'warning':
        return {
          stroke: isDark ? '#fbbf24' : '#d97706',
          text: isDark ? '#fde68a' : '#92400e',
          marker: 'scenario-arrow-warn'
        };
      default:
        return {
          stroke: themeColors.line,
          text: themeColors.textMuted,
          marker: 'scenario-arrow'
        };
    }
  };

  const flows = parsed.platformFlows || [];
  const srcNode = parsed.sourceNode || { title: '基盤システム', subLines: [], style: 'default' };
  const tgtNode = parsed.targetNode;
  const hasTarget = Boolean(tgtNode);

  const padX = 34;
  const leftW = 166;
  const midW = 304;
  const rightW = hasTarget ? 148 : 0;

  const sourceNoteLines = parsed.sourceNote ? wrapScenarioText(parsed.sourceNote, 128, 11) : [];
  const leftArrowGap = 128;
  const hasAnyRightEdge = flows.some((f) => f.rightEdge && (f.rightEdge.text || f.rightEdge.style !== 'default'));
  const rightArrowGap = hasTarget ? 210 : (hasAnyRightEdge ? 190 : 0);

  const cardInnerW = midW - 32;
  const rowGap = 16;
  const labelLineH = 15;
  const cardSubLineH = 17;

  const preparedRows = flows.map((f, idx) => {
    const card = f.card || { title: `サービス ${idx + 1}`, subLines: [], style: 'default' };
    const { emoji, body } = splitLeadingEmoji(card.title);
    const titleMaxW = emoji ? cardInnerW - 26 : cardInnerW;
    const titleLines = wrapScenarioText(body || card.title, titleMaxW, 14);
    const wrappedSubs = [];
    (card.subLines || []).forEach((s) => {
      wrappedSubs.push(...wrapScenarioText(s, cardInnerW, 11.5));
    });

    const leftLines = [];
    if (f.leftEdge && f.leftEdge.text) {
      leftLines.push(...wrapScenarioText(f.leftEdge.text, leftArrowGap - 18, 11.5));
    }
    const rightLines = [];
    if (f.rightEdge && f.rightEdge.text) {
      rightLines.push(...wrapScenarioText(f.rightEdge.text, Math.max(150, rightArrowGap - 22), 11.5));
    }

    const titleH = Math.max(1, titleLines.length) * 19;
    const subH = wrappedSubs.length > 0 ? 6 + wrappedSubs.length * cardSubLineH : 0;
    const cardTextH = 16 + titleH + subH + 14;
    const rightNeedH = rightLines.length > 0 ? rightLines.length * labelLineH + 24 : 0;
    const leftNeedH = leftLines.length > 0 ? leftLines.length * labelLineH + 24 : 0;
    const rowH = Math.max(72, cardTextH, rightNeedH, leftNeedH);

    return {
      card,
      emoji,
      titleLines,
      wrappedSubs,
      leftEdge: f.leftEdge,
      leftLines,
      rightEdge: f.rightEdge,
      rightLines,
      rowH
    };
  });

  const leftX = padX;
  const midX = leftX + leftW + leftArrowGap;
  const rightX = midX + midW + rightArrowGap;
  const width = Math.max(760, (hasTarget ? rightX + rightW : midX + midW + rightArrowGap) + padX);

  const titleBottomY = parsed.title ? 52 : 16;
  const topActorNode = parsed.topNode;
  const topActorLines = topActorNode ? wrapScenarioText(splitLeadingEmoji(topActorNode.title).body, leftW - 36, 14) : [];
  const topActorH = topActorNode ? Math.max(54, 24 + topActorLines.length * 19) : 0;
  const topActorY = titleBottomY + 14;
  const topArrowGap = topActorNode ? 44 : 0;

  const stackTopY = topActorNode ? (topActorY + topActorH + topArrowGap) : (titleBottomY + 18);
  const firstRowTopOffset = sourceNoteLines.length > 0 ? (sourceNoteLines.length * 15 + 14) : 0;

  let curY = stackTopY + firstRowTopOffset;
  preparedRows.forEach((r) => {
    r.y = curY;
    curY += r.rowH + rowGap;
  });
  const stackBottomY = preparedRows.length > 0 ? (curY - rowGap) : (stackTopY + 180);
  const tallH = Math.max(140, stackBottomY - stackTopY);

  // 下部凡例の配置事前計算
  const legendItems = parsed.legendItems || [];
  const legendTopY = stackBottomY + 30;
  const legendRows = [];
  if (legendItems.length > 0) {
    let lx = leftX;
    let ly = legendTopY;
    const maxLegRight = width - padX;
    legendItems.forEach((item) => {
      const sampleW = item.kind === 'box' ? 30 : 40;
      const itemW = sampleW + calcTextWidthPx(item.text, 12) + 28;
      if (lx > leftX && lx + itemW > maxLegRight) {
        lx = leftX;
        ly += 28;
      }
      legendRows.push({ ...item, x: lx, y: ly });
      lx += itemW;
    });
  }
  const legendBottomY = legendRows.length > 0 ? (legendRows[legendRows.length - 1].y + 26) : stackBottomY;
  const height = Math.max(420, legendBottomY + 24);

  container.dataset.baseWidth = width;

  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.style.maxWidth = '100%';
  svg.style.height = 'auto';
  svg.style.display = 'block';

  appendDefs(svg, themeColors, isDark);

  const bg = document.createElementNS(svgNS, 'rect');
  bg.setAttribute('width', width);
  bg.setAttribute('height', height);
  bg.setAttribute('rx', '12');
  bg.setAttribute('fill', themeColors.bg);
  svg.appendChild(bg);

  if (parsed.title) {
    const tEl = document.createElementNS(svgNS, 'text');
    tEl.setAttribute('x', leftX);
    tEl.setAttribute('y', '36');
    tEl.setAttribute('font-size', '18');
    tEl.setAttribute('font-weight', '700');
    tEl.setAttribute('fill', themeColors.textMain);
    tEl.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
    tEl.textContent = parsed.icon ? `${parsed.icon} ${parsed.title}` : parsed.title;
    svg.appendChild(tEl);
  }

  const cardStrokeDefault = isDark ? '#475569' : '#64748b';
  const cardBgDefault = isDark ? '#111827' : '#ffffff';

  const drawCleanBox = (x, y, w, h, nodeStyle) => {
    const rect = document.createElementNS(svgNS, 'rect');
    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('width', w);
    rect.setAttribute('height', h);
    rect.setAttribute('rx', '4');
    if (nodeStyle === 'danger') {
      rect.setAttribute('fill', isDark ? '#450a0a' : '#fbf1f1');
      rect.setAttribute('stroke', isDark ? '#f87171' : '#8b2626');
    } else if (nodeStyle && nodeStyle !== 'default') {
      const nc = getNodeColors(nodeStyle);
      rect.setAttribute('fill', nc.bg);
      rect.setAttribute('stroke', nc.border);
    } else {
      rect.setAttribute('fill', cardBgDefault);
      rect.setAttribute('stroke', cardStrokeDefault);
    }
    rect.setAttribute('stroke-width', '1.5');
    svg.appendChild(rect);
  };

  // 1. 上段アクターノード + 下向き矢印
  if (topActorNode) {
    drawCleanBox(leftX, topActorY, leftW, topActorH, topActorNode.style || 'danger');
    const { emoji, body } = splitLeadingEmoji(topActorNode.title);
    const labelStr = emoji ? `${emoji} ${body}` : body;
    const tTxt = document.createElementNS(svgNS, 'text');
    tTxt.setAttribute('x', leftX + leftW / 2);
    tTxt.setAttribute('y', topActorY + topActorH / 2 + 5);
    tTxt.setAttribute('text-anchor', 'middle');
    tTxt.setAttribute('font-size', '14.5');
    tTxt.setAttribute('font-weight', '700');
    tTxt.setAttribute('fill', themeColors.textMain);
    tTxt.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
    tTxt.textContent = labelStr;
    svg.appendChild(tTxt);

    const arrowX = leftX + leftW / 2;
    const topEdgeInfo = parsed.topEdge || { lines: [], style: 'danger', dashed: false };
    const topEdgeStyle = getEdgeStyle(topEdgeInfo.style || 'danger');
    drawStraightLine(svg, arrowX, topActorY + topActorH, arrowX, stackTopY - 5, topEdgeStyle.stroke, true, topEdgeInfo.dashed, topEdgeStyle.marker);

    if (topEdgeInfo.lines && topEdgeInfo.lines.length > 0) {
      topEdgeInfo.lines.forEach((ln, li) => {
        const lTxt = document.createElementNS(svgNS, 'text');
        lTxt.setAttribute('x', arrowX + 10);
        lTxt.setAttribute('y', topActorY + topActorH + topArrowGap / 2 + 4 + li * 15);
        lTxt.setAttribute('font-size', '12');
        lTxt.setAttribute('font-weight', '500');
        lTxt.setAttribute('fill', topEdgeStyle.text);
        lTxt.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
        lTxt.textContent = ln;
        svg.appendChild(lTxt);
      });
    }
  }

  // 2. 左側の縦長プラットフォーム枠 (source) と上部注記 (source_note)
  const drawTallSideCard = (x, y, w, h, node) => {
    drawCleanBox(x, y, w, h, node.style);
    const { emoji, body } = splitLeadingEmoji(node.title);
    const titleLines = wrapScenarioText(body || node.title, w - 24, 14.5);
    const subLines = [];
    (node.subLines || []).forEach((s) => {
      subLines.push(...wrapScenarioText(s, w - 24, 11.5));
    });

    const emojiH = emoji ? 28 : 0;
    const tH = titleLines.length * 19;
    const sH = subLines.length > 0 ? 8 + subLines.length * 16 : 0;
    const totalInnerH = emojiH + tH + sH;
    let curTextY = y + Math.max(20, (h - totalInnerH) / 2);

    if (emoji) {
      const eTxt = document.createElementNS(svgNS, 'text');
      eTxt.setAttribute('x', x + w / 2);
      eTxt.setAttribute('y', curTextY + 18);
      eTxt.setAttribute('text-anchor', 'middle');
      eTxt.setAttribute('font-size', '22');
      eTxt.textContent = emoji;
      svg.appendChild(eTxt);
      curTextY += emojiH;
    }

    titleLines.forEach((ln) => {
      const lTxt = document.createElementNS(svgNS, 'text');
      lTxt.setAttribute('x', x + w / 2);
      lTxt.setAttribute('y', curTextY + 14);
      lTxt.setAttribute('text-anchor', 'middle');
      lTxt.setAttribute('font-size', '14.5');
      lTxt.setAttribute('font-weight', '700');
      lTxt.setAttribute('fill', themeColors.textMain);
      lTxt.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
      lTxt.textContent = ln;
      svg.appendChild(lTxt);
      curTextY += 19;
    });

    if (subLines.length > 0) {
      curTextY += 8;
      subLines.forEach((ln) => {
        const sTxt = document.createElementNS(svgNS, 'text');
        sTxt.setAttribute('x', x + w / 2);
        sTxt.setAttribute('y', curTextY + 11);
        sTxt.setAttribute('text-anchor', 'middle');
        sTxt.setAttribute('font-size', '11.5');
        sTxt.setAttribute('fill', themeColors.textMuted);
        sTxt.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
        sTxt.textContent = ln;
        svg.appendChild(sTxt);
        curTextY += 16;
      });
    }
  };

  drawTallSideCard(leftX, stackTopY, leftW, tallH, srcNode);

  if (sourceNoteLines.length > 0) {
    sourceNoteLines.forEach((ln, li) => {
      const nTxt = document.createElementNS(svgNS, 'text');
      nTxt.setAttribute('x', leftX + leftW + 14);
      nTxt.setAttribute('y', stackTopY + 14 + li * 15);
      nTxt.setAttribute('font-size', '11.5');
      nTxt.setAttribute('font-weight', '500');
      nTxt.setAttribute('fill', themeColors.textMain);
      nTxt.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
      nTxt.textContent = ln;
      svg.appendChild(nTxt);
    });
  }

  // 3. 右側の縦長ターゲット枠 (target)
  if (hasTarget) {
    drawTallSideCard(rightX, stackTopY, rightW, tallH, tgtNode);
  }

  // 4. 中央カード群と左右の矢印 + ラベル
  preparedRows.forEach((r) => {
    drawCleanBox(midX, r.y, midW, r.rowH, r.card.style);

    let textY = r.y + 24;
    if (r.emoji) {
      const eEl = document.createElementNS(svgNS, 'text');
      eEl.setAttribute('x', midX + 16);
      eEl.setAttribute('y', textY);
      eEl.setAttribute('font-size', '16');
      eEl.textContent = r.emoji;
      svg.appendChild(eEl);
    }

    const titleStartX = r.emoji ? midX + 42 : midX + 16;
    r.titleLines.forEach((tl, ti) => {
      const tEl = document.createElementNS(svgNS, 'text');
      tEl.setAttribute('x', titleStartX);
      tEl.setAttribute('y', textY + ti * 19);
      tEl.setAttribute('font-size', '14.5');
      tEl.setAttribute('font-weight', '700');
      tEl.setAttribute('fill', themeColors.textMain);
      tEl.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
      tEl.textContent = tl;
      svg.appendChild(tEl);
    });

    textY += r.titleLines.length * 19 + 4;
    r.wrappedSubs.forEach((sl, si) => {
      const sEl = document.createElementNS(svgNS, 'text');
      sEl.setAttribute('x', midX + 16);
      sEl.setAttribute('y', textY + si * cardSubLineH);
      sEl.setAttribute('font-size', '11.5');
      sEl.setAttribute('fill', themeColors.textMuted);
      sEl.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
      sEl.textContent = sl;
      svg.appendChild(sEl);
    });

    // 左列 -> 中央カード矢印
    if (r.leftEdge) {
      const st = getEdgeStyle(r.leftEdge.style);
      const arrowY = r.y + Math.round(r.rowH * 0.56);
      drawStraightLine(svg, leftX + leftW, arrowY, midX - 5, arrowY, st.stroke, true, r.leftEdge.dashed, st.marker);

      if (r.leftLines.length > 0) {
        const labelTopY = arrowY - 8 - (r.leftLines.length - 1) * labelLineH;
        r.leftLines.forEach((ln, li) => {
          const lEl = document.createElementNS(svgNS, 'text');
          lEl.setAttribute('x', leftX + leftW + 14);
          lEl.setAttribute('y', labelTopY + li * labelLineH);
          lEl.setAttribute('font-size', '11.5');
          lEl.setAttribute('fill', st.text);
          lEl.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
          lEl.textContent = ln;
          svg.appendChild(lEl);
        });
      }
    }

    // 中央カード -> 右列矢印
    if (r.rightEdge && (hasTarget || r.rightLines.length > 0)) {
      const st = getEdgeStyle(r.rightEdge.style || 'success');
      const neededLabelH = r.rightLines.length * labelLineH;
      const arrowY = Math.min(r.y + r.rowH - 12, Math.max(r.y + Math.round(r.rowH * 0.62), r.y + neededLabelH + 12));
      const arrowEndX = hasTarget ? (rightX - 5) : (midX + midW + rightArrowGap - 10);
      drawStraightLine(svg, midX + midW, arrowY, arrowEndX, arrowY, st.stroke, true, r.rightEdge.dashed, st.marker);

      if (r.rightLines.length > 0) {
        const labelTopY = arrowY - 8 - (r.rightLines.length - 1) * labelLineH;
        r.rightLines.forEach((ln, li) => {
          const lEl = document.createElementNS(svgNS, 'text');
          lEl.setAttribute('x', midX + midW + 12);
          lEl.setAttribute('y', labelTopY + li * labelLineH);
          lEl.setAttribute('font-size', '11.5');
          lEl.setAttribute('fill', st.text);
          lEl.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
          lEl.textContent = ln;
          svg.appendChild(lEl);
        });
      }
    }
  });

  // 5. 下部凡例
  if (legendRows.length > 0) {
    const legSep = document.createElementNS(svgNS, 'line');
    legSep.setAttribute('x1', leftX);
    legSep.setAttribute('y1', legendTopY - 14);
    legSep.setAttribute('x2', width - padX);
    legSep.setAttribute('y2', legendTopY - 14);
    legSep.setAttribute('stroke', isDark ? '#1e293b' : '#e2e8f0');
    legSep.setAttribute('stroke-width', '1');
    svg.appendChild(legSep);

    legendRows.forEach((item) => {
      if (item.kind === 'box') {
        drawCleanBox(item.x, item.y + 1, 22, 14, item.style || 'danger');
        const txt = document.createElementNS(svgNS, 'text');
        txt.setAttribute('x', item.x + 29);
        txt.setAttribute('y', item.y + 12);
        txt.setAttribute('font-size', '11.5');
        txt.setAttribute('fill', themeColors.textMuted);
        txt.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
        txt.textContent = item.text;
        svg.appendChild(txt);
      } else {
        const st = getEdgeStyle(item.style);
        drawStraightLine(svg, item.x, item.y + 8, item.x + 28, item.y + 8, st.stroke, true, item.dashed, st.marker);
        const txt = document.createElementNS(svgNS, 'text');
        txt.setAttribute('x', item.x + 38);
        txt.setAttribute('y', item.y + 12);
        txt.setAttribute('font-size', '11.5');
        txt.setAttribute('fill', themeColors.textMuted);
        txt.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
        txt.textContent = item.text;
        svg.appendChild(txt);
      }
    });
  }

  container.appendChild(svg);
  appendLabel(container, label);
}

function appendDefs(svg, themeColors, isDark) {
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  defs.innerHTML = `
    <filter id="scenario-shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-opacity="${isDark ? '0.45' : '0.08'}" flood-color="#000000" />
    </filter>
  `;
  const arrPath = 'M 0 1.5 L 8 5 L 0 8.5 z';
  registerSvgArrowMarkers(defs, [
    { id: 'scenario-arrow', color: themeColors.line, d: arrPath },
    { id: 'scenario-arrow-active', color: themeColors.lineActive, d: arrPath },
    { id: 'scenario-arrow-danger', color: '#e11d48', d: arrPath },
    { id: 'scenario-arrow-crimson', color: isDark ? '#f87171' : '#991b1b', d: arrPath },
    { id: 'scenario-arrow-steel', color: isDark ? '#60a5fa' : '#5b829e', d: arrPath },
    { id: 'scenario-arrow-success', color: isDark ? '#34d399' : '#4a7c59', d: arrPath },
    { id: 'scenario-arrow-warn', color: isDark ? '#fbbf24' : '#d97706', d: arrPath }
  ]);
  svg.appendChild(defs);
}

function appendTitle(svg, icon, title, textColor, leftMargin = 36) {
  const titleGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  titleGroup.innerHTML = `
    <text x="${leftMargin}" y="38" font-size="20" font-weight="800" fill="${textColor}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">
      <tspan font-size="22">${icon}</tspan> ${title}
    </text>
  `;
  svg.appendChild(titleGroup);
}

function appendLabel(container, label) {
  appendDiagramLabel(container, label);
}
