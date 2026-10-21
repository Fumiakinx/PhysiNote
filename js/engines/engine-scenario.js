// ==========================================
// 汎用シナリオ・概念図 (フリーフロー図 / Scenario Flow) パーサー & SVG描画エンジン
// 1対N分岐（サイバー攻撃・拡散）、N対1集約（名寄せ・プロファイリング・データ統合）、汎用業務フロー対応
// ==========================================

function parseScenarioText(text) {
  if (!text || typeof text !== 'string') return null;

  // \scenario{...} または \freeflow{...} の中身を取り出す
  const match = text.match(/\\(?:scenario|freeflow)\s*\{([\s\S]*)\}/i);
  const content = match ? match[1] : text;

  const rawLines = content.split('\n');

  let title = '';
  let icon = '';
  let theme = 'dark'; // デフォルトはセキュリティ・IT解説で映えるダーク
  let mode = 'auto';  // 'fork' (1対N), 'merge' (N対1)
  let commonKey = 'メールアドレス / 携帯電話番号';

  let sourceNode = null; // fork時の起点
  let noteText = '';     // 中間注記
  const branches = [];   // fork時のブランチ [ { target, result } ]
  const sources = [];    // merge時のソース一覧 [ { title, subLines, keys: [], data: [], style } ]
  let mergeNode = null;  // merge時の処理ノード
  let targetNode = null; // merge時の最終統合ノード

  let currentSection = '';

  for (let rawLine of rawLines) {
    let line = rawLine.trim();
    if (!line || line.startsWith('//') || line.startsWith('#')) continue;

    const lower = line.toLowerCase();

    // セクション指定の検出
    if (lower === 'fork' || lower === 'fork:' || lower.startsWith('fork:')) {
      currentSection = 'fork';
      mode = 'fork';
      continue;
    }
    if (lower === 'merge' || lower === 'merge:' || lower === 'sources' || lower === 'sources:' || lower.startsWith('merge:') || lower.startsWith('sources:')) {
      currentSection = 'merge';
      mode = 'merge';
      continue;
    }

    const colonIdx = line.indexOf(':');
    let key = '';
    let val = line;
    if (colonIdx !== -1) {
      key = line.slice(0, colonIdx).trim().toLowerCase();
      val = line.slice(colonIdx + 1).trim();
    }

    if (key === 'title') {
      title = val.replace(/^["']|["']$/g, '');
    } else if (key === 'icon') {
      icon = val.replace(/^["']|["']$/g, '');
    } else if (key === 'theme') {
      theme = val.toLowerCase().includes('light') ? 'light' : 'dark';
    } else if (key === 'mode' || key === 'layout') {
      if (val.toLowerCase().includes('merge') || val.toLowerCase().includes('tree-merge') || val.toLowerCase().includes('aggregate')) {
        mode = 'merge';
        currentSection = 'merge';
      } else {
        mode = 'fork';
        currentSection = 'fork';
      }
    } else if (key === 'common_key' || key === 'key' || key === 'keys') {
      commonKey = val.replace(/^["']|["']$/g, '');
    } else if (key === 'source' || key === 'root') {
      sourceNode = parseScenarioNode(val);
    } else if (key === 'note' || key === 'flow' || key === 'event') {
      noteText = val.replace(/^["']|["']$/g, '').replace(/\\n/g, '\n');
    } else if (key === 'process' || (key === 'merge' && val !== '')) {
      mergeNode = parseScenarioNode(val);
    } else if (key === 'target' || key === 'goal' || key === 'result') {
      targetNode = parseScenarioNode(val);
    } else if (line.startsWith('<-') || (currentSection === 'merge' && (line.startsWith('-') || line.startsWith('・') || line.startsWith('【') || line.startsWith('[')))) {
      // mergeモードのソースノード
      mode = 'merge';
      const cleanLine = line.replace(/^(?:<-\s*|-\s*|・\s*)/, '');
      if (cleanLine.includes('->') || cleanLine.includes('──>')) {
        const mparts = cleanLine.split(/\s*──*>\s*|\s*->\s*/);
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
      const parts = cleanLine.split(/\s*──*>\s*|\s*->\s*/);
      if (parts.length >= 2) {
        branches.push({ target: parseScenarioNode(parts[0]), result: parseScenarioNode(parts[1]) });
      } else if (parts.length === 1) {
        branches.push({ target: parseScenarioNode(parts[0]), result: null });
      }
    } else {
      // 暗黙判定
      if (line.includes('->') || line.includes('──>')) {
        const parts = line.split(/\s*──*>\s*|\s*->\s*/);
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
    if (sources.length > 0 || mergeNode) mode = 'merge';
    else mode = 'fork';
  }

  return {
    title,
    icon,
    theme,
    mode,
    commonKey,
    sourceNode,
    noteText,
    branches,
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
      drawStraightLine(contentGroup, leftX + srcW, wireY, busX, wireY, themeColors.line, false);
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
  // モード2: 1対多 分岐・拡散フロー (画像1: パスワードリスト攻撃)
  // ===================================================================
  const srcNode = parsed.sourceNode || {
    title: '【漏洩元：サイトA】',
    subLines: ['(セキュリティの甘いサービス)'],
    style: 'default'
  };

  const note = parsed.noteText || '▼ システムの不備からID・パスワードが流出\n[ ID: user@example.com / PW: Secret123! ]';

  const branchList = parsed.branches.length > 0 ? parsed.branches : [
    { target: { title: '【サイトB (ECサイト)】', subLines: [], style: 'default' }, result: { title: 'ログイン成功 (登録カードで不正購入)', subLines: [], style: 'warn' } },
    { target: { title: '【サイトC (金融機関)】', subLines: [], style: 'default' }, result: { title: 'ログイン成功 (不正送金リスク)', subLines: [], style: 'danger' } },
    { target: { title: '【サイトD (SNS)】', subLines: [], style: 'default' }, result: { title: 'ログイン成功 (アカウント乗っ取り・なりすまし)', subLines: [], style: 'warn' } }
  ];

  const width = 880;
  const branchCount = Math.max(branchList.length, 3);
  const height = Math.max(520, 210 + branchCount * 88);

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
  const srcX = 48;
  const srcY = 68;
  const srcW = 340;
  const srcH = 54 + (srcNode.subLines.length * 18);

  drawGenericCard(contentGroup, srcX, srcY, srcW, srcH, srcNode.title, srcNode.subLines, getNodeColors(srcNode.style), isDark, '🏢');

  // 2. 中間注記カード / バッジ (流出情報)
  const noteY = srcY + srcH + 30;
  const noteLines = note.split('\n');
  const noteH = 28 + noteLines.length * 20;
  const noteW = 460;

  drawStraightLine(contentGroup, srcX + 50, srcY + srcH, srcX + 50, noteY, themeColors.lineActive, true);
  drawNoteBox(contentGroup, srcX + 16, noteY, noteW, noteH, noteLines, themeColors, isDark);

  // 3. 分岐コネクタとブランチノード群
  const forkStartY = noteY + noteH;
  const forkColX = srcX + 50;
  const branchStartX = srcX + 85;
  const branchStartY = forkStartY + 38;
  const rowGap = 72;

  const forkEndY = branchStartY + (branchList.length - 1) * rowGap;

  // 縦幹線
  drawStraightLine(contentGroup, forkColX, forkStartY, forkColX, forkEndY, themeColors.line, false);

  branchList.forEach((br, idx) => {
    const curY = branchStartY + idx * rowGap;

    drawStraightLine(contentGroup, forkColX, curY, branchStartX - 6, curY, themeColors.line, true);

    const targetW = 210;
    const targetH = 46;
    drawGenericCard(contentGroup, branchStartX, curY - targetH / 2, targetW, targetH, br.target.title, br.target.subLines, getNodeColors(br.target.style), isDark, '🎯');

    if (br.result) {
      const arrowStartX = branchStartX + targetW;
      const resultStartX = arrowStartX + 42;
      const resultW = 380;
      const resultH = 46;

      drawStraightLine(contentGroup, arrowStartX, curY, resultStartX - 6, curY, themeColors.lineActive, true);
      const rColors = getNodeColors(br.result.style);
      drawGenericCard(contentGroup, resultStartX, curY - resultH / 2, resultW, resultH, br.result.title, br.result.subLines, rColors, isDark, br.result.style === 'danger' ? '🚨' : '⚠️');
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

// 直線を描画
function drawStraightLine(parent, x1, y1, x2, y2, color, hasArrow) {
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', x1);
  line.setAttribute('y1', y1);
  line.setAttribute('x2', x2);
  line.setAttribute('y2', y2);
  line.setAttribute('stroke', color);
  line.setAttribute('stroke-width', '2.4');
  line.setAttribute('stroke-linecap', 'round');
  if (hasArrow) {
    line.setAttribute('marker-end', color.includes('dc2626') || color.includes('e11d48') ? 'url(#scenario-arrow-danger)' : (color.includes('38bdf8') || color.includes('0284c7') ? 'url(#scenario-arrow-active)' : 'url(#scenario-arrow)'));
  }
  parent.appendChild(line);
}

function appendDefs(svg, themeColors, isDark) {
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  defs.innerHTML = `
    <marker id="scenario-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="${themeColors.line}" />
    </marker>
    <marker id="scenario-arrow-active" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="${themeColors.lineActive}" />
    </marker>
    <marker id="scenario-arrow-danger" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#e11d48" />
    </marker>
    <filter id="scenario-shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-opacity="${isDark ? '0.45' : '0.08'}" flood-color="#000000" />
    </filter>
  `;
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
  if (label) {
    const lbl = document.createElement('div');
    lbl.className = 'chem-structure-label';
    lbl.textContent = label;
    container.appendChild(lbl);
  }
}
