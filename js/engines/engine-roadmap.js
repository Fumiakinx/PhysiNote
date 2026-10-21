// ==============================================================================
// PhysiNote ロードマップ図 (3形式統合エンジン: Timeline / Chevron / Swimlane)
// ==============================================================================

/**
 * テキストの推定ピクセル幅計算ヘルパー
 */
function getApproxRoadmapTextWidth(str) {
  if (!str) return 0;
  let w = 0;
  for (let i = 0; i < str.length; i++) {
    w += str.charCodeAt(i) > 255 ? 12 : 7;
  }
  return w;
}

/**
 * テキスト自動折り返しヘルパー
 */
function wrapRoadmapText(str, maxCharUnits = 24) {
  if (!str) return [];
  if (str.includes('\\n') || str.includes('\n')) {
    return str.split(/\\n|\n/).map((s) => s.trim()).filter(Boolean);
  }

  const lines = [];
  let curLine = '';
  let curUnits = 0;

  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
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
  return lines;
}

/**
 * LaTeX chronosys パッケージ構文パーサー
 * @param {string} text 
 * @returns {object|null}
 */
function parseChronosys(text) {
  if (!/\\(?:startchronology|chronoevent|chronoperiod)/i.test(text)) return null;

  let title = '年表タイムライン (chronosys)';
  let subtitle = '';
  const milestones = [];
  const tracks = [];

  // タイトル指定コメント (% title: ... または title: ...)
  const titleM = text.match(/(?:%|#|\/\/)?\s*title:\s*(.+)$/im);
  if (titleM) {
    title = titleM[1].trim().replace(/;$/, '').trim().replace(/^["']|["']$/g, '');
  }

  // 1. \chronoevent[options]{year/date}{label}
  const eventRegex = /\\chronoevent(?:\[([^\]]*)\])?\s*\{([^}]+)\}\s*\{([^}]+)\}/gi;
  let evMatch;
  while ((evMatch = eventRegex.exec(text)) !== null) {
    const opt = evMatch[1] || '';
    const date = evMatch[2].trim();
    const label = evMatch[3].trim().replace(/^["']|["']$/g, '');
    let status = 'planned';
    let color = '';
    let side = 'auto';

    if (opt.includes('done') || opt.includes('complete')) status = 'done';
    if (opt.includes('current') || opt.includes('today')) status = 'current';
    if (opt.includes('above')) side = 'above';
    if (opt.includes('below')) side = 'below';
    const cM = opt.match(/#(?:[0-9a-fA-F]{3,8})/);
    if (cM) color = cM[0];

    milestones.push({
      date,
      title: label,
      side,
      status,
      color,
      bullets: []
    });
  }

  // 2. \chronoperiod[options]{start}{end}{label}
  const periodRegex = /\\chronoperiod(?:\[([^\]]*)\])?\s*\{([^}]+)\}\s*\{([^}]+)\}\s*\{([^}]+)\}/gi;
  let pMatch;
  while ((pMatch = periodRegex.exec(text)) !== null) {
    const opt = pMatch[1] || '';
    const startYear = pMatch[2].trim();
    const endYear = pMatch[3].trim();
    const label = pMatch[4].trim().replace(/^["']|["']$/g, '');
    let color = '#0284c7';
    const cM = opt.match(/#(?:[0-9a-fA-F]{3,8})/);
    if (cM) color = cM[0];

    milestones.push({
      date: `${startYear} - ${endYear}`,
      title: label,
      side: 'auto',
      status: 'planned',
      color,
      bullets: []
    });
  }

  return {
    type: 'timeline',
    title,
    subtitle,
    today: '',
    periods: [],
    milestones,
    phases: [],
    tracks,
    lanes: []
  };
}

/**
 * LaTeX smartdiagram パッケージ構文パーサー
 * @param {string} text 
 * @returns {object|null}
 */
function parseSmartdiagram(text) {
  const match = text.match(/\\smartdiagram\s*(?:\[([^\]]*)\])?\s*\{([\s\S]*?)\}/i);
  if (!match) return null;

  const diagramType = (match[1] || '').trim().toLowerCase();
  const content = match[2].trim();

  let title = 'フェーズ進行プロセス (smartdiagram)';
  let subtitle = '';

  const titleM = text.match(/(?:%|#|\/\/)?\s*title:\s*(.+)$/im);
  if (titleM) {
    title = titleM[1].trim().replace(/;$/, '').trim().replace(/^["']|["']$/g, '');
  }

  // カンマまたは改行で項目を分割
  const rawItems = content.split(/,\s*(?=(?:[^"]*"[^"]*")*[^"]*$)|[\n;]+/).map((s) => s.trim()).filter(Boolean);
  const phases = [];

  const defaultColors = ['#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#f97316', '#10b981'];

  rawItems.forEach((it, idx) => {
    let clean = it.replace(/^["']|["']$/g, '').trim();
    if (!clean) return;

    phases.push({
      phaseNum: `フェーズ${idx + 1}`,
      title: clean,
      date: '',
      side: idx % 2 === 0 ? 'above' : 'below',
      color: defaultColors[idx % defaultColors.length],
      bullets: []
    });
  });

  return {
    type: 'chevron',
    title,
    subtitle,
    today: '',
    periods: [],
    milestones: [],
    phases,
    tracks: [],
    lanes: []
  };
}

/**
 * 構文パーサー
 * @param {string} rawText 
 * @returns {object|null}
 */
function parseRoadmap(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;

  // LaTeX パッケージ構文の自動ディスパッチ
  if (/\\(?:startchronology|chronoevent|chronoperiod)/i.test(rawText)) {
    const chronoData = parseChronosys(rawText);
    if (chronoData) return chronoData;
  }
  if (/\\smartdiagram/i.test(rawText)) {
    const smartData = parseSmartdiagram(rawText);
    if (smartData) return smartData;
  }

  let text = rawText.trim();
  const wrapperMatch = text.match(/^\\(?:roadmap|timeline)\{([\s\S]*)\}$/i);
  if (wrapperMatch) {
    text = wrapperMatch[1].trim();
  }

  let type = 'timeline'; // 'timeline' | 'chevron' | 'swimlane'
  let title = '';
  let subtitle = '';
  let today = '';
  let periods = [];
  const milestones = [];
  const phases = [];
  const tracks = [];
  const lanes = [];

  // 事前判定: type の明示指定または暗黙判定
  const typeMatch = text.match(/type:\s*["']?(timeline|chevron|phase|swimlane|grid|lane)["']?/i);
  if (typeMatch) {
    const t = typeMatch[1].toLowerCase();
    if (t === 'chevron' || t === 'phase') type = 'chevron';
    else if (t === 'swimlane' || t === 'grid' || t === 'lane') type = 'swimlane';
    else type = 'timeline';
  } else {
    if (/^\s*phase\s*:/m.test(text)) type = 'chevron';
    else if (/^\s*(?:periods|lane\s)/m.test(text)) type = 'swimlane';
  }

  const rawLines = text.split('\n');
  let currentTarget = null; // 箇条書き紐付け先 (milestone | phase)
  let currentLane = null;   // swimlaneの現在レーン

  for (let idx = 0; idx < rawLines.length; idx++) {
    let line = rawLines[idx].trim();
    if (!line || line.startsWith('//') || line.startsWith('#')) continue;

    // 末尾のセミコロンを除去した作業用文字列
    let cleanLine = line.replace(/;$/, '').trim();

    // 1. type:
    if (/^type:\s*/i.test(cleanLine)) continue;

    // 2. title:
    const titleMatch = cleanLine.match(/^title:\s*(.+)$/i);
    if (titleMatch) {
      title = titleMatch[1].trim().replace(/^["']|["']$/g, '');
      continue;
    }

    // 3. subtitle:
    const subMatch = cleanLine.match(/^subtitle:\s*(.+)$/i);
    if (subMatch) {
      subtitle = subMatch[1].trim().replace(/^["']|["']$/g, '');
      continue;
    }

    // 4. today: / now: / current:
    const todayMatch = cleanLine.match(/^(?:today|now|current):\s*(.+)$/i);
    if (todayMatch && !cleanLine.includes('->') && !cleanLine.includes('[')) {
      today = todayMatch[1].trim().replace(/^["']|["']$/g, '');
      continue;
    }

    // 5. periods: (swimlane用 列リスト)
    // 例: periods: "2024", "2025", "2026", "2027", "2028";
    const periodsMatch = cleanLine.match(/^periods:\s*(.+)$/i);
    if (periodsMatch) {
      periods = periodsMatch[1]
        .split(',')
        .map((p) => p.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean);
      continue;
    }

    // 6. 箇条書き行 (- 項目 または * 項目)
    const bulletMatch = cleanLine.match(/^[-*•]\s*(.+)$/);
    if (bulletMatch) {
      const bText = bulletMatch[1].trim().replace(/^["']|["']$/g, '');
      if (currentTarget && Array.isArray(currentTarget.bullets)) {
        currentTarget.bullets.push(bText);
      }
      continue;
    }

    // 7. track: (chevron用 下部長期ストリーム)
    // 例: track: "生産体制の強化" [1 -> 2, #10b981];
    const trackMatch = cleanLine.match(/^track:\s*(.+)$/i);
    if (trackMatch) {
      let trkStr = trackMatch[1].trim();
      let attr = '';
      const bM = trkStr.match(/\[([^\]]*)\]/);
      if (bM) {
        attr = bM[1].trim();
        trkStr = trkStr.slice(0, bM.index).trim();
      }
      const trkName = trkStr.replace(/^["']|["']$/g, '');
      let startIdx = 1;
      let endIdx = 1;
      let color = '#10b981';

      if (attr) {
        const parts = attr.split(',').map((p) => p.trim());
        parts.forEach((p) => {
          const arrowM = p.match(/^(\d+)\s*(?:->|~|-)\s*(\d+)$/);
          if (arrowM) {
            startIdx = parseInt(arrowM[1], 10);
            endIdx = parseInt(arrowM[2], 10);
          } else if (/^#[0-9a-fA-F]{3,8}$/.test(p)) {
            color = p;
          }
        });
      }
      tracks.push({ name: trkName, startIdx, endIdx, color });
      continue;
    }

    // 8. phase: (chevron用 フェーズ定義)
    // 例: phase: "フェーズ1", "事業規模の拡大" [2022年, above, #3b82f6]
    const phaseMatch = cleanLine.match(/^phase:\s*(.+)$/i);
    if (phaseMatch) {
      let phStr = phaseMatch[1].trim();
      let attr = '';
      const bM = phStr.match(/\[([^\]]*)\]/);
      if (bM) {
        attr = bM[1].trim();
        phStr = phStr.slice(0, bM.index).trim();
      }

      // カンマでフェーズ名とサブタイトルを分割
      const tokens = phStr.split(/,\s*(?=(?:[^"]*"[^"]*")*[^"]*$)/).map((t) => t.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
      const phaseNum = tokens[0] || `フェーズ${phases.length + 1}`;
      const phaseTitle = tokens[1] || '';

      let date = '';
      let side = 'auto';
      let color = '';

      if (attr) {
        const props = attr.split(',').map((p) => p.trim());
        props.forEach((p) => {
          const lp = p.toLowerCase();
          if (/^(above|top|up|上)$/i.test(lp)) side = 'above';
          else if (/^(below|bottom|down|下)$/i.test(lp)) side = 'below';
          else if (/^#[0-9a-fA-F]{3,8}$/.test(p)) color = p;
          else if (!date) date = p.replace(/^["']|["']$/g, '');
        });
      }

      const phaseObj = {
        phaseNum,
        title: phaseTitle,
        date,
        side,
        color,
        bullets: []
      };
      phases.push(phaseObj);
      currentTarget = phaseObj;
      continue;
    }

    // 9. lane: (swimlane用 テーマレーン開始)
    // 例: lane "テーマ1 (プロダクト)" [#10b981]:
    const laneMatch = cleanLine.match(/^lane\s+["']?([^"':\[]+)["']?\s*(?:\[([^\]]*)\])?\s*:?/i);
    if (laneMatch) {
      const laneName = laneMatch[1].trim();
      let color = '#3b82f6';
      if (laneMatch[2]) {
        const c = laneMatch[2].trim();
        if (/^#[0-9a-fA-F]{3,8}$/.test(c)) color = c;
      }
      currentLane = {
        name: laneName,
        color,
        tasks: []
      };
      lanes.push(currentLane);
      currentTarget = null;
      continue;
    }

    // 10. swimlane用 タスク行
    // 例: "コア機能開発" [2024 -> 2025], "AIエンジン刷新" [2025 -> 2026];
    if (type === 'swimlane' && currentLane) {
      // 複数のタスクがカンマ区切りで並んでいる可能性がある
      const taskEntries = cleanLine.split(/;\s*|,\s*(?=(?:[^"]*"[^"]*")*[^"]*$)/).map((t) => t.trim()).filter(Boolean);
      taskEntries.forEach((entry) => {
        let eStr = entry.trim();
        const bM = eStr.match(/\[([^\]]*)\]/);
        let taskName = eStr;
        let startPeriod = '';
        let endPeriod = '';
        let tColor = '';

        if (bM) {
          taskName = eStr.slice(0, bM.index).trim().replace(/^["']|["']$/g, '');
          const attr = bM[1].trim();
          const parts = attr.split(',').map((p) => p.trim());
          parts.forEach((p) => {
            const arrowM = p.match(/^([^->~]+)\s*(?:->|~|-)\s*([^->~]+)$/);
            if (arrowM) {
              startPeriod = arrowM[1].trim().replace(/^["']|["']$/g, '');
              endPeriod = arrowM[2].trim().replace(/^["']|["']$/g, '');
            } else if (/^#[0-9a-fA-F]{3,8}$/.test(p)) {
              tColor = p;
            } else if (!startPeriod) {
              startPeriod = p.replace(/^["']|["']$/g, '');
              endPeriod = startPeriod;
            }
          });
        } else {
          taskName = taskName.replace(/^["']|["']$/g, '');
        }

        if (taskName) {
          currentLane.tasks.push({
            name: taskName,
            start: startPeriod || (periods[0] || '1'),
            end: endPeriod || startPeriod || (periods[0] || '1'),
            color: tColor || currentLane.color
          });
        }
      });
      continue;
    }

    // 11. マイルストーン行 (timeline用)
    // 例: "2026 Q1": "α版プロトタイプ検証" [done, above, #0284c7]
    let attrStr = '';
    const bracketM = cleanLine.match(/\[([^\]]*)\]\s*$/);
    if (bracketM) {
      attrStr = bracketM[1].trim();
      cleanLine = cleanLine.slice(0, bracketM.index).trim();
    }

    let date = '';
    let itemTitle = '';

    const colonIdx = cleanLine.indexOf(':');
    if (colonIdx > 0 && colonIdx < 30) {
      date = cleanLine.substring(0, colonIdx).trim().replace(/^["']|["']$/g, '');
      itemTitle = cleanLine.substring(colonIdx + 1).trim().replace(/^["']|["']$/g, '');
    } else {
      const tokens = cleanLine.split(/,\s*(?=(?:[^"]*"[^"]*")*[^"]*$)/).map((t) => t.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
      if (tokens.length >= 1) date = tokens[0];
      if (tokens.length >= 2) itemTitle = tokens[1];
    }

    if (!date && !itemTitle) continue;

    let status = 'planned';
    let side = 'auto';
    let color = '';

    if (attrStr) {
      const props = attrStr.split(',').map((p) => p.trim()).filter(Boolean);
      props.forEach((p) => {
        const lp = p.toLowerCase();
        if (/^(done|完了|済|complete|completed|pass)$/i.test(lp)) status = 'done';
        else if (/^(current|進行中|now|active|進行|現在|今日)$/i.test(lp)) status = 'current';
        else if (/^(planned|予定|pending|todo)$/i.test(lp)) status = 'planned';
        else if (/^(above|top|up|上)$/i.test(lp)) side = 'above';
        else if (/^(below|bottom|down|下)$/i.test(lp)) side = 'below';
        else if (/^#[0-9a-fA-F]{3,8}$/.test(p)) color = p;
      });
    }

    const milestoneObj = {
      date,
      title: itemTitle || date,
      status,
      side,
      color,
      bullets: []
    };
    milestones.push(milestoneObj);
    currentTarget = milestoneObj;
  }

  return {
    type,
    title,
    subtitle,
    today,
    periods,
    milestones,
    phases,
    tracks,
    lanes
  };
}

// ==========================================
// 形式1: ピン打ち＆交互カード型タイムライン
// ==========================================
function renderRoadmapTimelineSvg(data, svg) {
  const { title, subtitle, today, milestones } = data;
  const count = milestones.length;
  if (count === 0) return;

  // 上下配置の自動決定 (未指定なら上・下・上・下...)
  milestones.forEach((m, idx) => {
    if (m.side === 'auto') {
      m.side = idx % 2 === 0 ? 'above' : 'below';
    }
  });

  // コンパクトなレイアウト計算（余白とステップ幅を詰める）
  const padX = 70;
  const cardW = 160;
  const stepX = Math.max(150, Math.min(190, 750 / Math.max(count - 1, 1)));
  const totalW = Math.max(760, padX * 2 + (count - 1) * stepX);

  // 各カードの高さを事前計算
  let maxAboveH = 90;
  let maxBelowH = 90;

  milestones.forEach((m) => {
    const titleLines = wrapRoadmapText(m.title, 18);
    let cardH = 34 + titleLines.length * 16;
    if (m.bullets && m.bullets.length > 0) {
      cardH += 8;
      m.bullets.forEach((b) => {
        const bLines = wrapRoadmapText(b, 20);
        cardH += bLines.length * 14 + 3;
      });
    }
    m._cardH = cardH;
    if (m.side === 'above' && cardH > maxAboveH) maxAboveH = cardH;
    if (m.side === 'below' && cardH > maxBelowH) maxBelowH = cardH;
  });

  const titleAreaH = title ? (subtitle ? 65 : 45) : 25;
  const timelineY = titleAreaH + maxAboveH + 40;
  const totalH = timelineY + maxBelowH + 50;

  svg.setAttribute('viewBox', `0 0 ${totalW} ${totalH}`);
  svg.setAttribute('width', '100%');
  svg.setAttribute('style', `max-width: ${totalW}px; height: auto; display: block; margin: 0 auto;`);

  // 定義 (グラデーション・シャドウ)
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  defs.innerHTML = `
    <filter id="rm-card-shadow" x="-8%" y="-8%" width="116%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#0f172a" flood-opacity="0.08" />
    </filter>
    <marker id="rm-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#0284c7" />
    </marker>
  `;
  svg.appendChild(defs);

  // タイトル部
  if (title) {
    const tEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    tEl.setAttribute('x', totalW / 2);
    tEl.setAttribute('y', 26);
    tEl.setAttribute('text-anchor', 'middle');
    tEl.setAttribute('font-size', '17');
    tEl.setAttribute('font-weight', '700');
    tEl.setAttribute('fill', '#0f172a');
    tEl.textContent = title;
    svg.appendChild(tEl);

    if (subtitle) {
      const sEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      sEl.setAttribute('x', totalW / 2);
      sEl.setAttribute('y', 46);
      sEl.setAttribute('text-anchor', 'middle');
      sEl.setAttribute('font-size', '12');
      sEl.setAttribute('fill', '#64748b');
      sEl.textContent = subtitle;
      svg.appendChild(sEl);
    }
  }

  // タイムラインベースライン
  const startX = padX - 25;
  const endX = totalW - padX + 35;

  const baseLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  baseLine.setAttribute('x1', startX);
  baseLine.setAttribute('y1', timelineY);
  baseLine.setAttribute('x2', endX);
  baseLine.setAttribute('y2', timelineY);
  baseLine.setAttribute('stroke', '#cbd5e1');
  baseLine.setAttribute('stroke-width', '3');
  baseLine.setAttribute('stroke-linecap', 'round');
  baseLine.setAttribute('marker-end', 'url(#rm-arrow)');
  svg.appendChild(baseLine);

  // 進捗ライン (done / current の最終位置までハイライト)
  let lastDoneIdx = -1;
  milestones.forEach((m, idx) => {
    if (m.status === 'done' || m.status === 'current') lastDoneIdx = idx;
    if (today && (m.date.includes(today) || m.title.includes(today))) lastDoneIdx = Math.max(lastDoneIdx, idx);
  });

  if (lastDoneIdx >= 0) {
    const progX = padX + lastDoneIdx * stepX;
    const progLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    progLine.setAttribute('x1', startX);
    progLine.setAttribute('y1', timelineY);
    progLine.setAttribute('x2', progX);
    progLine.setAttribute('y2', timelineY);
    progLine.setAttribute('stroke', '#0284c7');
    progLine.setAttribute('stroke-width', '3.5');
    progLine.setAttribute('stroke-linecap', 'round');
    svg.appendChild(progLine);
  }

  // 各マイルストーンの描画
  milestones.forEach((m, idx) => {
    const pinX = padX + idx * stepX;
    const isAbove = m.side === 'above';
    const cardH = m._cardH || 80;

    let pinColor = m.color || (m.status === 'done' ? '#10b981' : m.status === 'current' ? '#0284c7' : '#94a3b8');
    if (m.status === 'current' && !m.color) pinColor = '#0284c7';

    // 垂直引き出し線
    const cardEdgeY = isAbove ? timelineY - 24 : timelineY + 24;
    const vLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    vLine.setAttribute('x1', pinX);
    vLine.setAttribute('y1', timelineY);
    vLine.setAttribute('x2', pinX);
    vLine.setAttribute('y2', cardEdgeY);
    vLine.setAttribute('stroke', pinColor);
    vLine.setAttribute('stroke-width', '1.5');
    vLine.setAttribute('stroke-dasharray', m.status === 'planned' ? '3,3' : 'none');
    svg.appendChild(vLine);

    // ピン（丸）
    if (m.status === 'current') {
      const pulseRing = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      pulseRing.setAttribute('cx', pinX);
      pulseRing.setAttribute('cy', timelineY);
      pulseRing.setAttribute('r', '11');
      pulseRing.setAttribute('fill', pinColor);
      pulseRing.setAttribute('fill-opacity', '0.2');
      svg.appendChild(pulseRing);
    }

    const pinCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    pinCircle.setAttribute('cx', pinX);
    pinCircle.setAttribute('cy', timelineY);
    pinCircle.setAttribute('r', '5.5');
    pinCircle.setAttribute('fill', '#ffffff');
    pinCircle.setAttribute('stroke', pinColor);
    pinCircle.setAttribute('stroke-width', '2.5');
    svg.appendChild(pinCircle);

    // カード描画
    const cardX = pinX - cardW / 2;
    const cardY = isAbove ? cardEdgeY - cardH : cardEdgeY;

    const cardG = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    const cardRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    cardRect.setAttribute('x', cardX);
    cardRect.setAttribute('y', cardY);
    cardRect.setAttribute('width', cardW);
    cardRect.setAttribute('height', cardH);
    cardRect.setAttribute('rx', '6');
    cardRect.setAttribute('ry', '6');
    cardRect.setAttribute('fill', '#ffffff');
    cardRect.setAttribute('stroke', m.status === 'current' ? pinColor : '#e2e8f0');
    cardRect.setAttribute('stroke-width', m.status === 'current' ? '1.8' : '1');
    cardRect.setAttribute('filter', 'url(#rm-card-shadow)');
    cardG.appendChild(cardRect);

    // 上部ヘッダー（時期ピルバッジ）
    const badgeH = 18;
    const badgeW = Math.max(54, getApproxRoadmapTextWidth(m.date) + 14);
    const badgeX = cardX + 8;
    const badgeY = cardY + 7;

    const badgeRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    badgeRect.setAttribute('x', badgeX);
    badgeRect.setAttribute('y', badgeY);
    badgeRect.setAttribute('width', badgeW);
    badgeRect.setAttribute('height', badgeH);
    badgeRect.setAttribute('rx', '9');
    badgeRect.setAttribute('fill', pinColor);
    badgeRect.setAttribute('fill-opacity', '0.12');
    cardG.appendChild(badgeRect);

    const badgeTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    badgeTxt.setAttribute('x', badgeX + badgeW / 2);
    badgeTxt.setAttribute('y', badgeY + 13);
    badgeTxt.setAttribute('text-anchor', 'middle');
    badgeTxt.setAttribute('font-size', '10');
    badgeTxt.setAttribute('font-weight', '700');
    badgeTxt.setAttribute('fill', pinColor);
    badgeTxt.textContent = m.date;
    cardG.appendChild(badgeTxt);

    // ステータステキスト（右上）
    const statusLabel = m.status === 'done' ? '済' : m.status === 'current' ? 'NOW' : '予定';
    const stTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    stTxt.setAttribute('x', cardX + cardW - 8);
    stTxt.setAttribute('y', cardY + 19);
    stTxt.setAttribute('text-anchor', 'end');
    stTxt.setAttribute('font-size', '9.5');
    stTxt.setAttribute('font-weight', '600');
    stTxt.setAttribute('fill', pinColor);
    stTxt.textContent = statusLabel;
    cardG.appendChild(stTxt);

    // タイトル
    let curY = cardY + 36;
    const titleLines = wrapRoadmapText(m.title, 18);
    titleLines.forEach((tl) => {
      const tEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      tEl.setAttribute('x', cardX + 10);
      tEl.setAttribute('y', curY);
      tEl.setAttribute('font-size', '12');
      tEl.setAttribute('font-weight', '700');
      tEl.setAttribute('fill', '#1e293b');
      tEl.textContent = tl;
      cardG.appendChild(tEl);
      curY += 16;
    });

    // 箇条書き
    if (m.bullets && m.bullets.length > 0) {
      curY += 2;
      m.bullets.forEach((bullet) => {
        const bLines = wrapRoadmapText(bullet, 20);
        bLines.forEach((bl, blIdx) => {
          const bEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          bEl.setAttribute('x', cardX + (blIdx === 0 ? 12 : 20));
          bEl.setAttribute('y', curY);
          bEl.setAttribute('font-size', '10.5');
          bEl.setAttribute('fill', '#475569');
          bEl.textContent = (blIdx === 0 ? '• ' : '') + bl;
          cardG.appendChild(bEl);
          curY += 14;
        });
        curY += 2;
      });
    }

    svg.appendChild(cardG);
  });
}

// ==========================================
// 形式2: フェーズ進行シェブロン型
// ==========================================
function renderRoadmapChevronSvg(data, svg) {
  const { title, subtitle, phases, tracks } = data;
  const count = phases.length;
  if (count === 0) return;

  // 上下配置の決定
  phases.forEach((ph, idx) => {
    if (ph.side === 'auto') {
      ph.side = idx % 2 === 0 ? 'above' : 'below';
    }
  });

  const padX = 50;
  const totalW = 920;
  const contentW = totalW - padX * 2;
  const phaseW = contentW / count;
  const chevronH = 68;
  const tip = 18; // 山形の突起量

  // 上下ピンの高さを計算
  let maxAboveH = 80;
  let maxBelowH = 80;
  phases.forEach((ph) => {
    let h = 30 + (ph.bullets ? ph.bullets.length * 15 : 0);
    if (ph.side === 'above' && h > maxAboveH) maxAboveH = h;
    if (ph.side === 'below' && h > maxBelowH) maxBelowH = h;
  });

  const titleAreaH = title ? (subtitle ? 65 : 45) : 25;
  const chevronY = titleAreaH + maxAboveH + 35;
  const trackAreaH = tracks.length > 0 ? 55 : 20;
  const totalH = chevronY + chevronH + maxBelowH + trackAreaH + 20;

  svg.setAttribute('viewBox', `0 0 ${totalW} ${totalH}`);
  svg.setAttribute('width', '100%');
  svg.setAttribute('style', `max-width: ${totalW}px; height: auto; display: block; margin: 0 auto;`);

  // タイトル
  if (title) {
    const tEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    tEl.setAttribute('x', totalW / 2);
    tEl.setAttribute('y', 26);
    tEl.setAttribute('text-anchor', 'middle');
    tEl.setAttribute('font-size', '17');
    tEl.setAttribute('font-weight', '700');
    tEl.setAttribute('fill', '#0f172a');
    tEl.textContent = title;
    svg.appendChild(tEl);

    if (subtitle) {
      const sEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      sEl.setAttribute('x', totalW / 2);
      sEl.setAttribute('y', 46);
      sEl.setAttribute('text-anchor', 'middle');
      sEl.setAttribute('font-size', '12');
      sEl.setAttribute('fill', '#64748b');
      sEl.textContent = subtitle;
      svg.appendChild(sEl);
    }
  }

  // デフォルトカラーパレット (青 -> 藍 -> 紫 -> ローズ -> オレンジ)
  const defaultColors = ['#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#f97316', '#10b981'];

  // シェブロン本体とピンの描画
  phases.forEach((ph, i) => {
    const color = ph.color || defaultColors[i % defaultColors.length];
    const x = padX + i * phaseW;
    const y = chevronY;
    const w = phaseW;
    const h = chevronH;

    // シェブロンのSVGパス生成
    let d = '';
    if (i === 0) {
      // 最初のブロック (左端フラット、右端山形)
      d = `M ${x} ${y} L ${x + w} ${y} L ${x + w + tip} ${y + h / 2} L ${x + w} ${y + h} L ${x} ${y + h} Z`;
    } else {
      // 2番目以降 (左凹み、右山形)
      d = `M ${x} ${y} L ${x + w} ${y} L ${x + w + tip} ${y + h / 2} L ${x + w} ${y + h} L ${x} ${y + h} L ${x + tip} ${y + h / 2} Z`;
    }

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    path.setAttribute('fill', color);
    path.setAttribute('stroke', '#ffffff');
    path.setAttribute('stroke-width', '2');
    svg.appendChild(path);

    // シェブロン内部テキスト (フェーズ番号 & タイトル)
    const textCenterX = x + (i === 0 ? w / 2 : (w + tip) / 2);
    const numEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    numEl.setAttribute('x', textCenterX);
    numEl.setAttribute('y', y + (ph.title ? 27 : 38));
    numEl.setAttribute('text-anchor', 'middle');
    numEl.setAttribute('font-size', '13');
    numEl.setAttribute('font-weight', '700');
    numEl.setAttribute('fill', '#ffffff');
    numEl.textContent = ph.phaseNum;
    svg.appendChild(numEl);

    if (ph.title) {
      const titEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      titEl.setAttribute('x', textCenterX);
      titEl.setAttribute('y', y + 48);
      titEl.setAttribute('text-anchor', 'middle');
      titEl.setAttribute('font-size', '12');
      titEl.setAttribute('font-weight', '600');
      titEl.setAttribute('fill', '#ffffff');
      titEl.textContent = ph.title;
      svg.appendChild(titEl);
    }

    // 上下ピン & アクション詳細
    const pinX = textCenterX;
    const isAbove = ph.side === 'above';
    const pinColor = '#f59e0b'; // ピンのアクセント色 (暖色アンバー)

    const lineStartY = isAbove ? y : y + h;
    const pinY = isAbove ? y - 26 : y + h + 26;

    // 垂直引き出し線
    const vLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    vLine.setAttribute('x1', pinX);
    vLine.setAttribute('y1', lineStartY);
    vLine.setAttribute('x2', pinX);
    vLine.setAttribute('y2', pinY);
    vLine.setAttribute('stroke', '#cbd5e1');
    vLine.setAttribute('stroke-width', '1.5');
    svg.appendChild(vLine);

    // ピン丸
    const pinCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    pinCircle.setAttribute('cx', pinX);
    pinCircle.setAttribute('cy', pinY);
    pinCircle.setAttribute('r', '6');
    pinCircle.setAttribute('fill', pinColor);
    svg.appendChild(pinCircle);

    // 時期テキスト
    let textY = isAbove ? pinY - 14 : pinY + 22;
    if (ph.date) {
      const dtEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      dtEl.setAttribute('x', pinX);
      dtEl.setAttribute('y', textY);
      dtEl.setAttribute('text-anchor', 'middle');
      dtEl.setAttribute('font-size', '13');
      dtEl.setAttribute('font-weight', '700');
      dtEl.setAttribute('fill', '#1e293b');
      dtEl.textContent = ph.date;
      svg.appendChild(dtEl);
      textY += isAbove ? -16 : 16;
    }

    // 箇条書きアクション
    if (ph.bullets && ph.bullets.length > 0) {
      if (isAbove) {
        // 上方向へ積み上げ
        let bY = textY - (ph.bullets.length - 1) * 15;
        ph.bullets.forEach((b) => {
          const bEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          bEl.setAttribute('x', pinX - 45);
          bEl.setAttribute('y', bY);
          bEl.setAttribute('text-anchor', 'start');
          bEl.setAttribute('font-size', '11');
          bEl.setAttribute('fill', '#475569');
          bEl.textContent = `• ${b}`;
          svg.appendChild(bEl);
          bY += 15;
        });
      } else {
        // 下方向へ展開
        ph.bullets.forEach((b) => {
          const bEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          bEl.setAttribute('x', pinX - 45);
          bEl.setAttribute('y', textY);
          bEl.setAttribute('text-anchor', 'start');
          bEl.setAttribute('font-size', '11');
          bEl.setAttribute('fill', '#475569');
          bEl.textContent = `• ${b}`;
          svg.appendChild(bEl);
          textY += 15;
        });
      }
    }
  });

  // 最下部 長期継続ストリーム（トラック）
  if (tracks.length > 0) {
    const trackY = chevronY + chevronH + maxBelowH + 25;
    tracks.forEach((trk) => {
      const sIdx = Math.max(1, Math.min(count, trk.startIdx)) - 1;
      const eIdx = Math.max(sIdx + 1, Math.min(count, trk.endIdx)) - 1;

      const tx = padX + sIdx * phaseW;
      const tw = (eIdx - sIdx + 1) * phaseW;
      const th = 34;

      const tPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      let td = '';
      if (sIdx === 0) {
        td = `M ${tx} ${trackY} L ${tx + tw} ${trackY} L ${tx + tw + tip} ${trackY + th / 2} L ${tx + tw} ${trackY + th} L ${tx} ${trackY + th} Z`;
      } else {
        td = `M ${tx} ${trackY} L ${tx + tw} ${trackY} L ${tx + tw + tip} ${trackY + th / 2} L ${tx + tw} ${trackY + th} L ${tx} ${trackY + th} L ${tx + tip} ${trackY + th / 2} Z`;
      }
      tPath.setAttribute('d', td);
      tPath.setAttribute('fill', trk.color || '#10b981');
      svg.appendChild(tPath);

      // トラック名
      const trkTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      trkTxt.setAttribute('x', tx + 20);
      trkTxt.setAttribute('y', trackY + 22);
      trkTxt.setAttribute('font-size', '12');
      trkTxt.setAttribute('font-weight', '700');
      trkTxt.setAttribute('fill', '#ffffff');
      trkTxt.textContent = trk.name;
      svg.appendChild(trkTxt);
    });
  }
}

// ==========================================
// 形式3: テーマ別スイムレーン型
// ==========================================
function renderRoadmapSwimlaneSvg(data, svg) {
  const { title, subtitle, periods, lanes } = data;
  if (!periods || periods.length === 0 || !lanes || lanes.length === 0) return;

  const totalW = 920;
  const padLeft = 140; // 左テーマ列幅
  const padRight = 30;
  const gridW = totalW - padLeft - padRight;
  const colCount = periods.length;
  const colW = gridW / colCount;

  const headerH = 40;
  const titleAreaH = title ? (subtitle ? 65 : 45) : 25;

  // 各レーンの高さをタスク数に応じて計算（タスクが複数ある場合は2段・3段にする）
  const laneHeights = lanes.map((lane) => {
    // スロット配置計算
    const slots = [];
    lane.tasks.forEach((t) => {
      let sIdx = periods.indexOf(t.start);
      let eIdx = periods.indexOf(t.end);
      if (sIdx === -1) sIdx = 0;
      if (eIdx === -1) eIdx = sIdx;
      if (eIdx < sIdx) eIdx = sIdx;
      t._sIdx = sIdx;
      t._eIdx = eIdx;

      // 既存スロットで衝突しない段を探す
      let placedSlot = -1;
      for (let si = 0; si < slots.length; si++) {
        const canFit = slots[si].every((prev) => prev._eIdx < t._sIdx || prev._sIdx > t._eIdx);
        if (canFit) {
          slots[si].push(t);
          placedSlot = si;
          break;
        }
      }
      if (placedSlot === -1) {
        slots.push([t]);
        placedSlot = slots.length - 1;
      }
      t._slot = placedSlot;
    });

    const slotCount = Math.max(1, slots.length);
    lane._slotCount = slotCount;
    return Math.max(70, slotCount * 36 + 20);
  });

  const gridH = laneHeights.reduce((sum, h) => sum + h, 0);
  const totalH = titleAreaH + headerH + gridH + 30;

  svg.setAttribute('viewBox', `0 0 ${totalW} ${totalH}`);
  svg.setAttribute('width', '100%');
  svg.setAttribute('style', `max-width: ${totalW}px; height: auto; display: block; margin: 0 auto;`);

  // タイトル
  if (title) {
    const tEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    tEl.setAttribute('x', totalW / 2);
    tEl.setAttribute('y', 26);
    tEl.setAttribute('text-anchor', 'middle');
    tEl.setAttribute('font-size', '17');
    tEl.setAttribute('font-weight', '700');
    tEl.setAttribute('fill', '#0f172a');
    tEl.textContent = title;
    svg.appendChild(tEl);

    if (subtitle) {
      const sEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      sEl.setAttribute('x', totalW / 2);
      sEl.setAttribute('y', 46);
      sEl.setAttribute('text-anchor', 'middle');
      sEl.setAttribute('font-size', '12');
      sEl.setAttribute('fill', '#64748b');
      sEl.textContent = subtitle;
      svg.appendChild(sEl);
    }
  }

  const startY = titleAreaH + 10;

  // ヘッダー行 (期間列ヘッダー)
  periods.forEach((p, idx) => {
    const colX = padLeft + idx * colW;
    const colRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    colRect.setAttribute('x', colX);
    colRect.setAttribute('y', startY);
    colRect.setAttribute('width', colW);
    colRect.setAttribute('height', headerH);
    colRect.setAttribute('fill', '#1e40af');
    colRect.setAttribute('stroke', '#ffffff');
    colRect.setAttribute('stroke-width', '2');
    svg.appendChild(colRect);

    const colTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    colTxt.setAttribute('x', colX + colW / 2);
    colTxt.setAttribute('y', startY + 25);
    colTxt.setAttribute('text-anchor', 'middle');
    colTxt.setAttribute('font-size', '14');
    colTxt.setAttribute('font-weight', '700');
    colTxt.setAttribute('fill', '#ffffff');
    colTxt.textContent = p;
    svg.appendChild(colTxt);
  });

  // レーン描画
  let curLaneY = startY + headerH;
  const defaultLaneColors = ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#06b6d4'];

  lanes.forEach((lane, lIdx) => {
    const lH = laneHeights[lIdx];
    const lColor = lane.color || defaultLaneColors[lIdx % defaultLaneColors.length];

    // 左テーマラベルブロック
    const labelRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    labelRect.setAttribute('x', padLeft - 130);
    labelRect.setAttribute('y', curLaneY);
    labelRect.setAttribute('width', 125);
    labelRect.setAttribute('height', lH - 4);
    labelRect.setAttribute('rx', '4');
    labelRect.setAttribute('fill', lColor);
    svg.appendChild(labelRect);

    const labelTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    labelTxt.setAttribute('x', padLeft - 130 + 62);
    labelTxt.setAttribute('y', curLaneY + lH / 2 + 5);
    labelTxt.setAttribute('text-anchor', 'middle');
    labelTxt.setAttribute('font-size', '13');
    labelTxt.setAttribute('font-weight', '700');
    labelTxt.setAttribute('fill', '#ffffff');
    labelTxt.textContent = lane.name;
    svg.appendChild(labelTxt);

    // 右グリッド背景 (薄い水色背景と列区切り線)
    periods.forEach((p, cIdx) => {
      const colX = padLeft + cIdx * colW;
      const gRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      gRect.setAttribute('x', colX);
      gRect.setAttribute('y', curLaneY);
      gRect.setAttribute('width', colW);
      gRect.setAttribute('height', lH);
      gRect.setAttribute('fill', cIdx % 2 === 0 ? '#f0f9ff' : '#e0f2fe');
      gRect.setAttribute('stroke', '#ffffff');
      gRect.setAttribute('stroke-width', '2');
      svg.appendChild(gRect);
    });

    // タスクバーの描画
    const slotH = 28;
    const slotGap = 8;

    lane.tasks.forEach((task) => {
      const barX = padLeft + task._sIdx * colW + 8;
      const barW = Math.max(30, (task._eIdx - task._sIdx + 1) * colW - 16);
      const barY = curLaneY + 12 + task._slot * (slotH + slotGap);

      const bRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bRect.setAttribute('x', barX);
      bRect.setAttribute('y', barY);
      bRect.setAttribute('width', barW);
      bRect.setAttribute('height', slotH);
      bRect.setAttribute('rx', '4');
      bRect.setAttribute('fill', task.color || lColor);
      svg.appendChild(bRect);

      const bTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      bTxt.setAttribute('x', barX + barW / 2);
      bTxt.setAttribute('y', barY + 19);
      bTxt.setAttribute('text-anchor', 'middle');
      bTxt.setAttribute('font-size', '11.5');
      bTxt.setAttribute('font-weight', '600');
      bTxt.setAttribute('fill', '#ffffff');
      bTxt.textContent = task.name;
      svg.appendChild(bTxt);
    });

    curLaneY += lH;
  });
}

/**
 * ロードマップSVG描画エンジン
 * @param {string} rawText 
 * @param {HTMLElement} container 
 * @param {string} labelText 
 */
function drawRoadmapSvg(rawText, container, labelText) {
  const data = parseRoadmap(rawText);
  if (!data) {
    container.innerHTML = '<span style="color:#ef4444; font-size:12px;">ロードマップ図の構文を解析できませんでした（例: \\roadmap{ 2024-Q1: "発足" [done]; }）</span>';
    return;
  }

  container.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'roadmap-container';
  wrapper.style.display = 'flex';
  wrapper.style.flexDirection = 'column';
  wrapper.style.alignItems = 'center';
  wrapper.style.width = '100%';
  wrapper.style.padding = '10px 0';

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'roadmap-svg');
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

  // タイプに応じた描画ルーチンのディスパッチ
  if (data.type === 'chevron') {
    renderRoadmapChevronSvg(data, svg);
  } else if (data.type === 'swimlane') {
    renderRoadmapSwimlaneSvg(data, svg);
  } else {
    renderRoadmapTimelineSvg(data, svg);
  }

  wrapper.appendChild(svg);
  container.appendChild(wrapper);
}

/**
 * 外部公開描画関数エイリアス
 */
function drawRoadmap(text, container, labelText) {
  drawRoadmapSvg(text, container, labelText);
}
