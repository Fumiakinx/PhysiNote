// ==========================================
// シーケンス図 (Sequence Diagram) パーサー & SVG描画エンジン
// ==========================================

function getSeqTextWidth(str) {
  if (!str) return 0;
  let w = 0;
  for (let i = 0; i < str.length; i++) {
    w += str.charCodeAt(i) > 255 ? 13 : 7.5;
  }
  return w;
}

function escapeSeqHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * \sequence{ ... } 構文のパース
 */
function parseSequenceDiagram(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;
  let text = rawText.trim();

  // \sequence{...} または \seq{...} のラッパーを解除
  const wrapperMatch = text.match(/^\\(?:sequence|seq)\{([\s\S]*)\}$/i);
  if (wrapperMatch) {
    text = wrapperMatch[1].trim();
  }

  let title = '';
  const declaredActors = [];
  const events = []; // { type: 'msg' | 'note', from, to, text, isDotted, isSelf, noteType, actors }
  const actorMap = new Map();

  function recordActor(name) {
    if (!name) return;
    const clean = name.replace(/^["']|["']$/g, '').trim();
    if (!actorMap.has(clean)) {
      actorMap.set(clean, {
        id: clean,
        name: clean,
        x: 0,
        w: 120,
        h: 44,
      });
    }
  }

  const lines = text.split(/[\n;]+/).map((l) => l.trim()).filter(Boolean);

  lines.forEach((line) => {
    // タイトル行: title: "..."
    const titleMatch = line.match(/^title\s*:\s*["']?([^"']+)["']?$/i);
    if (titleMatch) {
      title = titleMatch[1].trim();
      return;
    }

    // アクター明示定義: actor: "A", "B", "C" または participant: "A", "B"
    const actMatch = line.match(/^(?:actor|participant)\s*:\s*(.+)$/i);
    if (actMatch) {
      const parts = actMatch[1].split(',').map((p) => p.trim());
      parts.forEach((p) => {
        let clean = p.replace(/\[[^\]]*\]/g, '').trim();
        clean = clean.replace(/^["']|["']$/g, '').trim();
        if (clean) {
          recordActor(clean);
          declaredActors.push(clean);
        }
      });
      return;
    }

    // ノート行: note over A, B: "..." または note: A: "..."
    const noteMatch = line.match(/^note(?:\s*:\s*|\s+(?:over\s+)?)([^:]+)\s*:\s*["']?([^"']+)["']?$/i);
    if (noteMatch) {
      const rawTarget = noteMatch[1].trim();
      let noteText = noteMatch[2].trim();
      let noteColor = null;
      const noteColMatch = noteText.match(/\[(#?[a-zA-Z0-9]+)\]$/);
      if (noteColMatch) {
        noteColor = noteColMatch[1];
        noteText = noteText.replace(/\[#?[a-zA-Z0-9]+\]$/, '').trim();
      }
      const targets = rawTarget.split(',').map((t) => t.replace(/\[[^\]]*\]/g, '').replace(/^["']|["']$/g, '').trim());
      targets.forEach((t) => recordActor(t));
      events.push({
        type: 'note',
        targets: targets,
        text: noteText,
        color: noteColor,
      });
      return;
    }

    // メッセージ行（点線戻り値 --> または 実線呼び出し ->）
    // 例: "クライアント" -> "サーバー": "GET /data"
    // 例: "サーバー" --> "クライアント": "200 OK"
    // 例: "移動端末" -> "無線制御装置": 初期直接転送信号 (NAS) [#0284c7]
    const msgMatch = line.match(/^["']?([^"'\-]+?)["']?\s*(-{1,2}>)\s*["']?([^"':]+?)["']?\s*(?::\s*["']?([^"']*)["']?)?$/);
    if (msgMatch) {
      const from = msgMatch[1].trim();
      const arrow = msgMatch[2].trim();
      const to = msgMatch[3].trim();
      let msgText = msgMatch[4] ? msgMatch[4].trim() : '';
      let color = null;
      const colMatch = msgText.match(/\[(#?[a-zA-Z0-9]+)\]$/);
      if (colMatch) {
        color = colMatch[1];
        msgText = msgText.replace(/\[#?[a-zA-Z0-9]+\]$/, '').trim();
      }
      const isDotted = arrow === '-->';
      const isSelf = from === to;

      recordActor(from);
      recordActor(to);

      events.push({
        type: 'msg',
        from,
        to,
        text: msgText,
        isDotted,
        isSelf,
        color,
      });
    }
  });

  if (actorMap.size === 0 || events.length === 0) return null;

  // アクターの表示順序（明示定義優先、それ以外はイベント出現順）
  const allActorKeys = Array.from(actorMap.keys());
  const orderedActors = [];
  declaredActors.forEach((a) => {
    if (!orderedActors.includes(a) && actorMap.has(a)) {
      orderedActors.push(a);
    }
  });
  allActorKeys.forEach((a) => {
    if (!orderedActors.includes(a)) {
      orderedActors.push(a);
    }
  });

  // 各アクターの寸法とX座標の算出
  const actorObjs = orderedActors.map((k) => actorMap.get(k));
  actorObjs.forEach((act) => {
    const textW = getSeqTextWidth(act.name);
    act.w = Math.max(textW + 36, 120);
    act.h = 44;
  });

  const startX = 40;
  const hGap = 60; // アクター間の余白
  let curX = startX;

  actorObjs.forEach((act) => {
    act.x = curX;
    curX += act.w + hGap;
  });

  // 垂直タイムラインの算出
  const startY = title ? 80 : 40;
  const stepH = 50; // 各イベント（メッセージ／ノート）の垂直間隔
  let curY = startY + 44 + 30; // アクターボックスの下部余白

  events.forEach((ev) => {
    ev.y = curY;
    if (ev.isSelf) {
      curY += stepH + 16; // 自己呼び出しは少し高さを確保
    } else if (ev.type === 'note') {
      curY += stepH + 8;
    } else {
      curY += stepH;
    }
  });

  const bottomActorY = curY + 20;
  const totalH = bottomActorY + 44 + 40;
  const totalW = Math.max(curX - hGap + startX, 760);

  return {
    title,
    actors: actorObjs,
    events,
    startY,
    bottomActorY,
    totalW,
    totalH,
  };
}

/**
 * シーケンス図のSVG描画
 */
function drawSequenceDiagramSvg(code, container, labelText) {
  container.innerHTML = '';
  const parsed = parseSequenceDiagram(code);
  if (!parsed) {
    const err = document.createElement('div');
    err.className = 'chem-render-error';
    err.textContent = 'シーケンス図の構文エラー: "アクターA" -> "アクターB": "メッセージ"; のような関係式が必要です。';
    container.appendChild(err);
    return;
  }

  const { title, actors, events, startY, bottomActorY, totalW, totalH } = parsed;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${totalW} ${totalH}`);
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.setAttribute('class', 'sequence-svg');
  svg.style.maxWidth = `${totalW}px`;
  svg.style.margin = '0 auto';
  svg.style.display = 'block';
  svg.style.background = '#ffffff';
  svg.style.borderRadius = '12px';
  svg.style.overflow = 'hidden';

  // 矢印マーカーとドロップシャドウの定義
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  defs.innerHTML = `
    <!-- アクターカードシャドウ -->
    <filter id="seq-actor-shadow" x="-15%" y="-20%" width="130%" height="150%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#0f172a" flood-opacity="0.08" />
    </filter>
    <!-- ノートシャドウ -->
    <filter id="seq-note-shadow" x="-15%" y="-20%" width="130%" height="150%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#b45309" flood-opacity="0.12" />
    </filter>
  `;
  svg.appendChild(defs);

  const createdMarkers = new Set();
  function ensureMarker(color, isDotted) {
    const cleanColor = color || (isDotted ? '#64748b' : '#0284c7');
    const safeId = cleanColor.replace(/[^a-zA-Z0-9]/g, '_');
    const markerId = isDotted ? `seq-marker-open-${safeId}` : `seq-marker-filled-${safeId}`;
    if (!createdMarkers.has(markerId)) {
      createdMarkers.add(markerId);
      const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
      marker.setAttribute('id', markerId);
      marker.setAttribute('viewBox', '0 0 10 10');
      marker.setAttribute('refX', '9');
      marker.setAttribute('refY', '5');
      marker.setAttribute('markerWidth', '6.5');
      marker.setAttribute('markerHeight', '6.5');
      marker.setAttribute('orient', 'auto-start-reverse');
      if (isDotted) {
        const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        p.setAttribute('d', 'M 1 1.5 L 9 5 L 1 8.5');
        p.setAttribute('fill', 'none');
        p.setAttribute('stroke', cleanColor);
        p.setAttribute('stroke-width', '1.8');
        p.setAttribute('stroke-linecap', 'round');
        p.setAttribute('stroke-linejoin', 'round');
        marker.appendChild(p);
      } else {
        const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        p.setAttribute('d', 'M 0 1.5 L 10 5 L 0 8.5 z');
        p.setAttribute('fill', cleanColor);
        marker.appendChild(p);
      }
      defs.appendChild(marker);
    }
    return markerId;
  }

  // タイトル描画
  if (title) {
    const titleG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const titleText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    titleText.setAttribute('x', totalW / 2);
    titleText.setAttribute('y', '36');
    titleText.setAttribute('text-anchor', 'middle');
    titleText.setAttribute('font-size', '17');
    titleText.setAttribute('font-weight', '800');
    titleText.setAttribute('fill', '#0f172a');
    titleText.setAttribute('font-family', 'system-ui, -apple-system, sans-serif');
    titleText.textContent = title;
    titleG.appendChild(titleText);

    const titleLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    titleLine.setAttribute('x1', totalW / 2 - 120);
    titleLine.setAttribute('y1', '46');
    titleLine.setAttribute('x2', totalW / 2 + 120);
    titleLine.setAttribute('y2', '46');
    titleLine.setAttribute('stroke', '#e2e8f0');
    titleLine.setAttribute('stroke-width', '2');
    titleG.appendChild(titleLine);

    svg.appendChild(titleG);
  }

  // ライフライン（破線の垂直線）描画グループ
  const lifelineG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  lifelineG.setAttribute('class', 'seq-lifelines');

  const actorCenterMap = new Map();

  actors.forEach((act) => {
    const cx = act.x + act.w / 2;
    actorCenterMap.set(act.id, cx);

    const topY = startY + act.h;
    const botY = bottomActorY;

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', cx);
    line.setAttribute('y1', topY);
    line.setAttribute('x2', cx);
    line.setAttribute('y2', botY);
    line.setAttribute('stroke', '#cbd5e1');
    line.setAttribute('stroke-width', '1.8');
    line.setAttribute('stroke-dasharray', '5 4');
    lifelineG.appendChild(line);
  });
  svg.appendChild(lifelineG);

  // イベント（メッセージ矢印・自己呼び出し・ノート）描画グループ
  const eventG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  eventG.setAttribute('class', 'seq-events');

  events.forEach((ev) => {
    if (ev.type === 'note') {
      // ノート（付箋注釈カード）
      let targetX = 0;
      let noteW = 160;
      if (ev.targets.length === 1) {
        const cx = actorCenterMap.get(ev.targets[0]) || 100;
        targetX = cx - noteW / 2;
      } else if (ev.targets.length >= 2) {
        const x1 = actorCenterMap.get(ev.targets[0]) || 60;
        const x2 = actorCenterMap.get(ev.targets[1]) || 200;
        const left = Math.min(x1, x2);
        const right = Math.max(x1, x2);
        noteW = Math.max(right - left + 40, 160);
        targetX = (left + right) / 2 - noteW / 2;
      }

      const noteH = 32;
      const noteY = ev.y - noteH / 2;

      let noteFill = '#fef9c3';
      let noteStroke = '#facc15';
      let noteTextColor = '#854d0e';
      if (ev.color) {
        if (ev.color.startsWith('#e0f2fe') || ev.color === 'blue' || ev.color === 'skyblue') {
          noteFill = '#e0f2fe';
          noteStroke = '#38bdf8';
          noteTextColor = '#0369a1';
        } else if (ev.color.startsWith('#fef3c7') || ev.color === 'orange' || ev.color === 'amber') {
          noteFill = '#fef3c7';
          noteStroke = '#f59e0b';
          noteTextColor = '#92400e';
        } else {
          noteFill = ev.color;
          noteStroke = ev.color;
          noteTextColor = '#0f172a';
        }
      }

      const nRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      nRect.setAttribute('x', targetX);
      nRect.setAttribute('y', noteY);
      nRect.setAttribute('width', noteW);
      nRect.setAttribute('height', noteH);
      nRect.setAttribute('rx', '5');
      nRect.setAttribute('fill', noteFill);
      nRect.setAttribute('stroke', noteStroke);
      nRect.setAttribute('stroke-width', '1.2');
      nRect.setAttribute('filter', 'url(#seq-note-shadow)');
      eventG.appendChild(nRect);

      const nTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      nTxt.setAttribute('x', targetX + noteW / 2);
      nTxt.setAttribute('y', noteY + 20);
      nTxt.setAttribute('text-anchor', 'middle');
      nTxt.setAttribute('font-size', '11.5');
      nTxt.setAttribute('font-weight', '700');
      nTxt.setAttribute('fill', noteTextColor);
      nTxt.setAttribute('font-family', 'sans-serif');
      nTxt.textContent = ev.text;
      eventG.appendChild(nTxt);
      return;
    }

    // メッセージ描画
    const fromX = actorCenterMap.get(ev.from) || 0;
    const toX = actorCenterMap.get(ev.to) || 0;
    const msgColor = ev.color || (ev.isDotted ? '#64748b' : '#0284c7');
    const markerId = ensureMarker(msgColor, ev.isDotted);

    if (ev.isSelf) {
      // 自己呼び出し（右へのコの字ループ）
      const loopW = 34;
      const loopH = 24;
      const startX = fromX;
      const startY = ev.y - loopH / 2;
      const cornerX = fromX + loopW;
      const endY = ev.y + loopH / 2;

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', `M ${startX} ${startY} L ${cornerX} ${startY} L ${cornerX} ${endY} L ${startX} ${endY}`);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', msgColor);
      path.setAttribute('stroke-width', '1.8');
      path.setAttribute('marker-end', `url(#${markerId})`);
      eventG.appendChild(path);

      if (ev.text) {
        const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        txt.setAttribute('x', cornerX + 8);
        txt.setAttribute('y', ev.y + 4.5);
        txt.setAttribute('font-size', '12.5');
        txt.setAttribute('font-weight', '700');
        txt.setAttribute('fill', ev.color || '#0f172a');
        txt.setAttribute('font-family', 'system-ui, -apple-system, sans-serif');
        txt.textContent = ev.text;
        eventG.appendChild(txt);
      }
    } else {
      // 通常メッセージ（水平矢印）
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      path.setAttribute('x1', fromX);
      path.setAttribute('y1', ev.y);
      path.setAttribute('x2', toX);
      path.setAttribute('y2', ev.y);
      path.setAttribute('stroke', msgColor);
      path.setAttribute('stroke-width', '1.8');
      if (ev.isDotted) {
        path.setAttribute('stroke-dasharray', '5 4');
      }
      path.setAttribute('marker-end', `url(#${markerId})`);
      eventG.appendChild(path);

      if (ev.text) {
        const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        txt.setAttribute('x', (fromX + toX) / 2);
        txt.setAttribute('y', ev.y - 7);
        txt.setAttribute('text-anchor', 'middle');
        txt.setAttribute('font-size', '12.5');
        txt.setAttribute('font-weight', '700');
        txt.setAttribute('fill', ev.color || (ev.isDotted ? '#475569' : '#0f172a'));
        txt.setAttribute('font-family', 'system-ui, -apple-system, sans-serif');
        txt.textContent = ev.text;
        eventG.appendChild(txt);
      }
    }
  });

  svg.appendChild(eventG);

  // アクターカード描画関数（上部・下部で再利用）
  function renderActorCards(topY) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'seq-actors');

    actors.forEach((act) => {
      const actG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      actG.setAttribute('class', 'seq-actor-item');

      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', act.x);
      rect.setAttribute('y', topY);
      rect.setAttribute('width', act.w);
      rect.setAttribute('height', act.h);
      rect.setAttribute('rx', '7');
      rect.setAttribute('fill', '#ffffff');
      rect.setAttribute('stroke', '#0284c7');
      rect.setAttribute('stroke-width', '2');
      rect.setAttribute('filter', 'url(#seq-actor-shadow)');
      actG.appendChild(rect);

      // 上部アクセントストライプ
      const stripe = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      stripe.setAttribute('d', `M ${act.x + 6} ${topY} L ${act.x + act.w - 6} ${topY}`);
      stripe.setAttribute('stroke', '#0284c7');
      stripe.setAttribute('stroke-width', '3');
      stripe.setAttribute('stroke-linecap', 'round');
      actG.appendChild(stripe);

      const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      txt.setAttribute('x', act.x + act.w / 2);
      txt.setAttribute('y', topY + act.h / 2 + 5);
      txt.setAttribute('text-anchor', 'middle');
      txt.setAttribute('font-size', '13.5');
      txt.setAttribute('font-weight', '800');
      txt.setAttribute('fill', '#0f172a');
      txt.setAttribute('font-family', 'system-ui, -apple-system, sans-serif');
      txt.textContent = act.name;
      actG.appendChild(txt);

      g.appendChild(actG);
    });

    return g;
  }

  // 上部アクターカード
  svg.appendChild(renderActorCards(startY));
  // 最下部アクターカード（視認性向上）
  svg.appendChild(renderActorCards(bottomActorY));

  container.appendChild(svg);

  if (labelText) {
    const lbl = document.createElement('div');
    lbl.className = 'chem-structure-label';
    lbl.textContent = labelText;
    container.appendChild(lbl);
  }
}
