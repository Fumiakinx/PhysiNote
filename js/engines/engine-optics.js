// ==========================================
// 光学系・実験系配置図 (Optical Bench / Setup Diagram) パーサー & SVG描画エンジン
// ==========================================

function parseOpticsDiagram(text) {
  if (!text || typeof text !== 'string') return null;
  const lines = text
    .split(/[\n;]+/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('//') && !l.startsWith('#'));

  let title = '';
  let showGrid = true;
  let beamDefaultColor = '#ef4444'; // デフォルト赤色レーザー (He-Ne / 632.8nm)
  let benchLength = 0;

  const elements = []; // { id, name, type, x, y, angle, label, subLabel, color }
  const elementMap = new Map();
  const beamPaths = []; // [ [id1, id2, id3...], ... ]
  const inlineChains = []; // [ { from, to, label } ]

  const inferTypeFromName = (name) => {
    const s = name.toLowerCase();
    if (/telescope|望遠鏡/i.test(s)) return 'telescope';
    if (/source|lamp|ランプ|点光源/i.test(s)) return 'source';
    if (/laser|レーザー|光源|laser diode/i.test(s)) return 'laser';
    if (/beamsplitter|beam splitter|ビームスプリッタ|ハーフミラー|bs|半透明鏡/i.test(s)) return 'beamsplitter';
    if (/mirror|ミラー|反射鏡/i.test(s)) return 'mirror';
    if (/lens|レンズ|凸レンズ|凹レンズ/i.test(s)) return 'lens';
    if (/double slit|二重スリット|ヤング/i.test(s)) return 'doubleslit';
    if (/slit|スリット|ピンホール|アパーチャ/i.test(s)) return 'slit';
    if (/polarizer|偏光|波長板|glan|qwp|hwp/i.test(s)) return 'polarizer';
    if (/screen|スクリーン|投影面/i.test(s)) return 'screen';
    if (/detector|ディテクタ|検出器|photodiode|pd|ccd|センサ/i.test(s)) return 'detector';
    if (/sample|試料|セル|キュベット|結晶/i.test(s)) return 'sample';
    if (/grating|回折格子|プリズム/i.test(s)) return 'grating';
    return 'generic';
  };

  const parseProps = (propStr) => {
    if (!propStr) return {};
    const res = {};
    const parts = propStr.split(',').map((p) => p.trim()).filter(Boolean);
    parts.forEach((p) => {
      const kv = p.match(/^([a-zA-Z_-]+)\s*[:=]\s*(.+)$/);
      if (kv) {
        const k = kv[1].toLowerCase();
        let v = kv[2].trim().replace(/^["']|["']$/g, '');
        if (k === 'x' || k === 'y' || k === 'angle' || k === 'rot') {
          res[k] = parseFloat(v) || 0;
        } else {
          res[k] = v;
        }
      } else if (/^#[0-9a-fA-F]{3,8}$/.test(p) || /^[a-zA-Z]+$/.test(p)) {
        res.color = p;
      } else if (/^-?\d+(?:\.\d+)?$/.test(p)) {
        if (res.x === undefined) res.x = parseFloat(p);
        else if (res.y === undefined) res.y = parseFloat(p);
      }
    });
    return res;
  };

  lines.forEach((line) => {
    // 1. タイトル
    const mTitle = line.match(/^title\s*:\s*["']?([^"']+)["']?$/i);
    if (mTitle) {
      title = mTitle[1].trim();
      return;
    }

    // 2. 定盤グリッドの有無: grid: true/false または table: true/false
    const mGrid = line.match(/^(?:grid|table|bench)\s*:\s*(true|false|1|0|yes|no)/i);
    if (mGrid) {
      const v = mGrid[1].toLowerCase();
      showGrid = v === 'true' || v === '1' || v === 'yes';
      return;
    }

    // 3. レーザー光色指定: beam_color: #...
    const mBColor = line.match(/^beam(?:_color|color)\s*:\s*(#[0-9a-fA-F]{3,8}|[a-zA-Z]+)$/i);
    if (mBColor) {
      beamDefaultColor = mBColor[1].trim();
      return;
    }

    // 4. 明示的ビーム光路指定: beam: L1 -> BS -> M1 -> BS -> Det [color: #...]
    const mBeam = line.match(/^beam\s*:\s*(.+)$/i);
    if (mBeam) {
      let bContent = mBeam[1].trim();
      let bColor = beamDefaultColor;
      const bPropMatch = bContent.match(/\[(.*?)\]$/);
      if (bPropMatch) {
        const props = parseProps(bPropMatch[1]);
        if (props.color) bColor = props.color;
        bContent = bContent.substring(0, bPropMatch.index).trim();
      }
      const rawSteps = bContent.split('->').map((s) => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
      if (rawSteps.length >= 2) {
        beamPaths.push({ steps: rawSteps, color: bColor });
      }
      return;
    }

    // 5. 明示的素子定義: type: ID "名前" [x: ..., y: ..., angle: ...]
    const mElem = line.match(/^([a-zA-Z_-]+)\s*:\s*([a-zA-Z0-9_-]+)?\s*(?:"([^"]+)"|'([^']+)')?(?:\s*\[(.*?)\])?$/i);
    if (mElem && !['title', 'beam', 'grid', 'table', 'bench'].includes(mElem[1].toLowerCase())) {
      const type = mElem[1].toLowerCase();
      const id = mElem[2] || mElem[3] || mElem[4] || `elem_${elements.length + 1}`;
      const name = mElem[3] || mElem[4] || id;
      const props = parseProps(mElem[5]);

      const elemObj = {
        id,
        name,
        type: type === 'element' || type === 'node' ? inferTypeFromName(name) : type,
        x: props.x !== undefined ? props.x : null,
        y: props.y !== undefined ? props.y : null,
        angle: props.angle !== undefined ? props.angle : (props.rot !== undefined ? props.rot : 0),
        subLabel: props.label || props.sub || '',
        color: props.color || null,
      };
      elements.push(elemObj);
      elementMap.set(id, elemObj);
      elementMap.set(name, elemObj);
      return;
    }

    // 6. インラインチェーン接続: "レーザー" -> "レンズ" -> "スクリーン"
    if (line.includes('->')) {
      const parts = line.split('->').map((p) => p.trim()).filter(Boolean);
      for (let i = 0; i < parts.length - 1; i++) {
        let pA = parts[i];
        let pB = parts[i + 1];

        let propsA = {};
        const mA = pA.match(/\[(.*?)\]$/);
        if (mA) {
          propsA = parseProps(mA[1]);
          pA = pA.substring(0, mA.index).trim();
        }
        let propsB = {};
        const mB = pB.match(/\[(.*?)\]$/);
        if (mB) {
          propsB = parseProps(mB[1]);
          pB = pB.substring(0, mB.index).trim();
        }

        const nameA = pA.replace(/^["']|["']$/g, '');
        const nameB = pB.replace(/^["']|["']$/g, '');

        if (!elementMap.has(nameA)) {
          const elA = {
            id: nameA,
            name: nameA,
            type: inferTypeFromName(nameA),
            x: propsA.x !== undefined ? propsA.x : null,
            y: propsA.y !== undefined ? propsA.y : null,
            angle: propsA.angle !== undefined ? propsA.angle : 0,
            subLabel: propsA.label || '',
            color: propsA.color || null,
          };
          elements.push(elA);
          elementMap.set(nameA, elA);
        }
        if (!elementMap.has(nameB)) {
          const elB = {
            id: nameB,
            name: nameB,
            type: inferTypeFromName(nameB),
            x: propsB.x !== undefined ? propsB.x : null,
            y: propsB.y !== undefined ? propsB.y : null,
            angle: propsB.angle !== undefined ? propsB.angle : 0,
            subLabel: propsB.label || '',
            color: propsB.color || null,
          };
          elements.push(elB);
          elementMap.set(nameB, elB);
        }

        inlineChains.push({ from: nameA, to: nameB });
      }
    }
  });

  return {
    title,
    showGrid,
    beamDefaultColor,
    elements,
    beamPaths,
    inlineChains,
  };
}

/**
 * 光学系 SVG 描画関数
 */
function drawOpticsDiagramSvg(rawText, container, labelText) {
  if (!container) return;
  container.innerHTML = '';

  let codeText = rawText.trim();
  const wrapperMatch = codeText.match(/^\\(?:optics|opticalbench)\{([\s\S]*)\}$/i);
  if (wrapperMatch) {
    codeText = wrapperMatch[1];
  }

  const parsed = parseOpticsDiagram(codeText);
  if (!parsed || parsed.elements.length === 0) {
    const err = document.createElement('div');
    err.className = 'chem-render-error';
    err.textContent = '光学系配置図の構文エラー: "レーザー" -> "レンズ" -> "スクリーン" のような光学要素が必要です。';
    container.appendChild(err);
    return;
  }

  const { title, showGrid, beamDefaultColor, elements, beamPaths, inlineChains } = parsed;

  // 1. 自動レイアウト判定（2D明示座標指定があるか、1Dリニア配置か）
  const hasCustomCoords = elements.some((e) => e.x !== null && e.y !== null);

  let totalW = 880;
  let totalH = 460;
  const padLeft = 80;
  const padRight = 80;
  const opticalAxisY = 240;

  if (!hasCustomCoords) {
    // 1次元リニア光学ベンチ自動配置
    const n = elements.length;
    const spacing = n > 1 ? Math.max(130, Math.min(220, (totalW - padLeft - padRight) / (n - 1))) : 200;
    totalW = Math.max(840, padLeft + padRight + spacing * (n - 1));

    elements.forEach((el, idx) => {
      el.x = padLeft + idx * spacing;
      el.y = opticalAxisY;
      // ビームスプリッターやミラーのデフォルト角度調整
      if (el.type === 'mirror' && el.angle === 0) el.angle = 45;
      if (el.type === 'beamsplitter' && el.angle === 0) el.angle = 45;
    });

    // 暗黙の光路（左端から右端へ直進ビーム）
    if (beamPaths.length === 0 && elements.length >= 2) {
      const steps = elements.map((e) => e.id);
      beamPaths.push({ steps, color: beamDefaultColor });
    }
  } else {
    // 2次元カスタム配置: 座標のバウンディングボックスからSVGキャンバスサイズを自動調整
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    elements.forEach((e) => {
      if (e.x === null) e.x = 100;
      if (e.y === null) e.y = 200;
      if (e.x < minX) minX = e.x;
      if (e.x > maxX) maxX = e.x;
      if (e.y < minY) minY = e.y;
      if (e.y > maxY) maxY = e.y;
    });

    totalW = Math.max(880, Math.round(maxX + 160));
    totalH = Math.max(480, Math.round(maxY + 140));

    // インラインチェーンがある場合は光路に追加
    if (beamPaths.length === 0 && inlineChains.length > 0) {
      inlineChains.forEach((c) => {
        beamPaths.push({ steps: [c.from, c.to], color: beamDefaultColor });
      });
    }
  }

  // 要素マップ構築
  const elMap = new Map();
  elements.forEach((e) => {
    elMap.set(e.id, e);
    elMap.set(e.name, e);
  });

  // 2. SVG 要素生成
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.setAttribute('viewBox', `0 0 ${totalW} ${totalH}`);
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.setAttribute('class', 'optics-svg');
  svg.style.maxWidth = `${totalW}px`;
  svg.style.margin = '0 auto';
  svg.style.display = 'block';
  svg.style.background = '#0f172a'; // 光学実験室の本格ダークベンチ背景
  svg.style.borderRadius = '12px';
  svg.style.overflow = 'hidden';

  // フィルター・マーカー定義
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  defs.innerHTML = `
    <!-- 光学ベンチ定盤ハニカムタップ穴パターン (M6/25mmピッチ風) -->
    <pattern id="optics-bench-grid" width="30" height="30" patternUnits="userSpaceOnUse">
      <circle cx="15" cy="15" r="1.8" fill="#1e293b" />
      <circle cx="15" cy="15" r="0.8" fill="#334155" />
    </pattern>

    <!-- レーザービーム発光グローフィルター -->
    <filter id="beam-glow" x="-20%" y="-40%" width="140%" height="180%">
      <feGaussianBlur stdDeviation="3.5" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <!-- 素子ドロップシャドウ -->
    <filter id="optics-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000000" flood-opacity="0.5" />
    </filter>
  `;
  svg.appendChild(defs);

  // 3. 背景（定盤グリッド）
  if (showGrid) {
    const gridRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    gridRect.setAttribute('x', '0');
    gridRect.setAttribute('y', '0');
    gridRect.setAttribute('width', totalW);
    gridRect.setAttribute('height', totalH);
    gridRect.setAttribute('fill', 'url(#optics-bench-grid)');
    svg.appendChild(gridRect);

    // ベンチの目盛り定規風のボーダー
    const benchLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    benchLine.setAttribute('x1', '20');
    benchLine.setAttribute('y1', totalH - 24);
    benchLine.setAttribute('x2', totalW - 20);
    benchLine.setAttribute('y2', totalH - 24);
    benchLine.setAttribute('stroke', '#334155');
    benchLine.setAttribute('stroke-width', '2');
    svg.appendChild(benchLine);
  }

  // 4. タイトル描画
  if (title) {
    const titleG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const titleText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    titleText.setAttribute('x', '30');
    titleText.setAttribute('y', '38');
    titleText.setAttribute('font-size', '17');
    titleText.setAttribute('font-weight', '800');
    titleText.setAttribute('fill', '#f8fafc');
    titleText.setAttribute('font-family', 'system-ui, -apple-system, sans-serif');
    titleText.textContent = `🔬 ${title}`;
    titleG.appendChild(titleText);

    const sub = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    sub.setAttribute('x', totalW - 30);
    sub.setAttribute('y', '38');
    sub.setAttribute('text-anchor', 'end');
    sub.setAttribute('font-size', '11.5');
    sub.setAttribute('font-weight', '600');
    sub.setAttribute('fill', '#64748b');
    sub.textContent = 'Optical Bench Setup Diagram';
    titleG.appendChild(sub);

    svg.appendChild(titleG);
  }

  // 5. 光路（ビーム）描画グループ
  const beamG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  beamG.setAttribute('class', 'optics-beams');

  beamPaths.forEach((bp) => {
    const pts = [];
    bp.steps.forEach((sId) => {
      const el = elMap.get(sId);
      if (el) pts.push({ x: el.x, y: el.y, el });
    });

    if (pts.length < 2) return;

    for (let i = 0; i < pts.length - 1; i++) {
      const p1 = pts[i];
      const p2 = pts[i + 1];

      // ビームの光彩（外側グロー）
      const glowLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      glowLine.setAttribute('x1', p1.x);
      glowLine.setAttribute('y1', p1.y);
      glowLine.setAttribute('x2', p2.x);
      glowLine.setAttribute('y2', p2.y);
      glowLine.setAttribute('stroke', bp.color || '#ef4444');
      glowLine.setAttribute('stroke-width', '6');
      glowLine.setAttribute('stroke-opacity', '0.35');
      glowLine.setAttribute('filter', 'url(#beam-glow)');
      glowLine.setAttribute('stroke-linecap', 'round');
      beamG.appendChild(glowLine);

      // ビームの芯（コア光線）
      const coreLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      coreLine.setAttribute('x1', p1.x);
      coreLine.setAttribute('y1', p1.y);
      coreLine.setAttribute('x2', p2.x);
      coreLine.setAttribute('y2', p2.y);
      coreLine.setAttribute('stroke', '#ffffff');
      coreLine.setAttribute('stroke-width', '1.8');
      coreLine.setAttribute('stroke-opacity', '0.9');
      coreLine.setAttribute('stroke-linecap', 'round');
      beamG.appendChild(coreLine);
    }
  });

  svg.appendChild(beamG);

  // 6. 光学素子（コンポーネント）描画グループ
  const elemG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  elemG.setAttribute('class', 'optics-elements');

  elements.forEach((el) => {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', `optics-element element-${el.type}`);
    g.setAttribute('transform', `translate(${el.x}, ${el.y}) rotate(${el.angle})`);
    g.setAttribute('filter', 'url(#optics-shadow)');

    // 光学素子のベース・支柱（ポスト）
    const post = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    post.setAttribute('cx', '0');
    post.setAttribute('cy', '0');
    post.setAttribute('r', '14');
    post.setAttribute('fill', '#1e293b');
    post.setAttribute('stroke', '#475569');
    post.setAttribute('stroke-width', '1.5');
    g.appendChild(post);

    // 素子ごとの精緻なアイコン描画
    switch (el.type) {
      case 'laser': {
        // レーザー発光ヘッド（長方形筐体）
        const box = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        box.setAttribute('x', '-24');
        box.setAttribute('y', '-16');
        box.setAttribute('width', '48');
        box.setAttribute('height', '32');
        box.setAttribute('rx', '4');
        box.setAttribute('fill', '#334155');
        box.setAttribute('stroke', '#64748b');
        box.setAttribute('stroke-width', '2');
        g.appendChild(box);

        // 出射口（アパーチャ）
        const ap = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        ap.setAttribute('x', '22');
        ap.setAttribute('y', '-6');
        ap.setAttribute('width', '6');
        ap.setAttribute('height', '12');
        ap.setAttribute('fill', '#e2e8f0');
        g.appendChild(ap);

        // パイロットランプ
        const lamp = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        lamp.setAttribute('cx', '-14');
        lamp.setAttribute('cy', '0');
        lamp.setAttribute('r', '3');
        lamp.setAttribute('fill', el.color || '#ef4444');
        g.appendChild(lamp);
        break;
      }

      case 'mirror': {
        // ミラー反射面（太いシルバー/ブルー線）
        const mLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        mLine.setAttribute('x1', '0');
        mLine.setAttribute('y1', '-24');
        mLine.setAttribute('x2', '0');
        mLine.setAttribute('y2', '24');
        mLine.setAttribute('stroke', '#38bdf8');
        mLine.setAttribute('stroke-width', '4');
        mLine.setAttribute('stroke-linecap', 'round');
        g.appendChild(mLine);

        // ミラー裏面のハッチング線 (///)
        for (let dy = -20; dy <= 20; dy += 8) {
          const hatch = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          hatch.setAttribute('x1', '0');
          hatch.setAttribute('y1', dy);
          hatch.setAttribute('x2', '-8');
          hatch.setAttribute('y2', dy - 6);
          hatch.setAttribute('stroke', '#64748b');
          hatch.setAttribute('stroke-width', '1.5');
          g.appendChild(hatch);
        }
        break;
      }

      case 'beamsplitter': {
        // キューブ型ビームスプリッター
        const cube = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        cube.setAttribute('x', '-18');
        cube.setAttribute('y', '-18');
        cube.setAttribute('width', '36');
        cube.setAttribute('height', '36');
        cube.setAttribute('rx', '2');
        cube.setAttribute('fill', '#0284c7');
        cube.setAttribute('fill-opacity', '0.25');
        cube.setAttribute('stroke', '#38bdf8');
        cube.setAttribute('stroke-width', '1.8');
        g.appendChild(cube);

        // 対角線の半透膜
        const diag = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        diag.setAttribute('x1', '-18');
        diag.setAttribute('y1', '-18');
        diag.setAttribute('x2', '18');
        diag.setAttribute('y2', '18');
        diag.setAttribute('stroke', '#f8fafc');
        diag.setAttribute('stroke-width', '2');
        diag.setAttribute('stroke-dasharray', '3 2');
        g.appendChild(diag);
        break;
      }

      case 'lens': {
        // 凸レンズ形状（両凸）
        const lensPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        lensPath.setAttribute('d', 'M 0 -26 C 10 -15, 10 15, 0 26 C -10 15, -10 -15, 0 -26 Z');
        lensPath.setAttribute('fill', '#38bdf8');
        lensPath.setAttribute('fill-opacity', '0.35');
        lensPath.setAttribute('stroke', '#bae6fd');
        lensPath.setAttribute('stroke-width', '2');
        g.appendChild(lensPath);

        // レンズ中央光軸マーカー
        const centerLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        centerLine.setAttribute('x1', '-4');
        centerLine.setAttribute('y1', '0');
        centerLine.setAttribute('x2', '4');
        centerLine.setAttribute('y2', '0');
        centerLine.setAttribute('stroke', '#ffffff');
        centerLine.setAttribute('stroke-width', '1');
        g.appendChild(centerLine);
        break;
      }

      case 'doubleslit': {
        // 二重スリット遮光板
        const plate1 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        plate1.setAttribute('x', '-3');
        plate1.setAttribute('y', '-26');
        plate1.setAttribute('width', '6');
        plate1.setAttribute('height', '20');
        plate1.setAttribute('fill', '#475569');
        g.appendChild(plate1);

        const plate2 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        plate2.setAttribute('x', '-3');
        plate2.setAttribute('y', '-3');
        plate2.setAttribute('width', '6');
        plate2.setAttribute('height', '6');
        plate2.setAttribute('fill', '#475569');
        g.appendChild(plate2);

        const plate3 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        plate3.setAttribute('x', '-3');
        plate3.setAttribute('y', '6');
        plate3.setAttribute('width', '6');
        plate3.setAttribute('height', '20');
        plate3.setAttribute('fill', '#475569');
        g.appendChild(plate3);
        break;
      }

      case 'slit': {
        // 単スリット
        const topP = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        topP.setAttribute('x', '-3');
        topP.setAttribute('y', '-26');
        topP.setAttribute('width', '6');
        topP.setAttribute('height', '23');
        topP.setAttribute('fill', '#475569');
        g.appendChild(topP);

        const botP = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        botP.setAttribute('x', '-3');
        botP.setAttribute('y', '3');
        botP.setAttribute('width', '6');
        botP.setAttribute('height', '23');
        botP.setAttribute('fill', '#475569');
        g.appendChild(botP);
        break;
      }

      case 'polarizer': {
        // 偏光子・波長板（円形リング＋偏光軸矢印）
        const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        ring.setAttribute('cx', '0');
        ring.setAttribute('cy', '0');
        ring.setAttribute('r', '20');
        ring.setAttribute('fill', '#1e293b');
        ring.setAttribute('stroke', '#a855f7');
        ring.setAttribute('stroke-width', '2');
        g.appendChild(ring);

        // 偏光軸方向の矢印
        const arr = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        arr.setAttribute('d', 'M 0 -14 L 0 14 M -4 -10 L 0 -14 L 4 -10 M -4 10 L 0 14 L 4 10');
        arr.setAttribute('stroke', '#c084fc');
        arr.setAttribute('stroke-width', '1.8');
        arr.setAttribute('fill', 'none');
        g.appendChild(arr);
        break;
      }

      case 'screen': {
        // スクリーン板
        const scr = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        scr.setAttribute('x', '-4');
        scr.setAttribute('y', '-30');
        scr.setAttribute('width', '8');
        scr.setAttribute('height', '60');
        scr.setAttribute('rx', '2');
        scr.setAttribute('fill', '#e2e8f0');
        scr.setAttribute('stroke', '#94a3b8');
        scr.setAttribute('stroke-width', '1.5');
        g.appendChild(scr);

        // 干渉縞パターン（明暗フリンジ模様）
        for (let fy = -22; fy <= 22; fy += 6) {
          const fLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          fLine.setAttribute('x1', '-3');
          fLine.setAttribute('y1', fy);
          fLine.setAttribute('x2', '3');
          fLine.setAttribute('y2', fy);
          fLine.setAttribute('stroke', '#ef4444');
          fLine.setAttribute('stroke-width', '2');
          fLine.setAttribute('stroke-opacity', 1 - Math.abs(fy) / 28);
          g.appendChild(fLine);
        }
        break;
      }

      case 'detector': {
        // 光検出器
        const detBox = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        detBox.setAttribute('x', '-14');
        detBox.setAttribute('y', '-18');
        detBox.setAttribute('width', '28');
        detBox.setAttribute('height', '36');
        detBox.setAttribute('rx', '4');
        detBox.setAttribute('fill', '#047857');
        detBox.setAttribute('stroke', '#10b981');
        detBox.setAttribute('stroke-width', '2');
        g.appendChild(detBox);

        // 受光センサ面
        const sens = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        sens.setAttribute('x', '-10');
        sens.setAttribute('y', '-12');
        sens.setAttribute('width', '8');
        sens.setAttribute('height', '24');
        sens.setAttribute('fill', '#34d399');
        g.appendChild(sens);
        break;
      }

      case 'sample': {
        // 試料キュベット（角型ガラスセル）
        const cell = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        cell.setAttribute('x', '-14');
        cell.setAttribute('y', '-18');
        cell.setAttribute('width', '28');
        cell.setAttribute('height', '36');
        cell.setAttribute('rx', '3');
        cell.setAttribute('fill', '#fef08a');
        cell.setAttribute('fill-opacity', '0.4');
        cell.setAttribute('stroke', '#facc15');
        cell.setAttribute('stroke-width', '2');
        g.appendChild(cell);
        break;
      }

      case 'telescope': {
        // 望遠鏡（観測用筒状鏡筒＋対物フード＋接眼部）
        const tube = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        tube.setAttribute('x', '-10');
        tube.setAttribute('y', '-22');
        tube.setAttribute('width', '20');
        tube.setAttribute('height', '36');
        tube.setAttribute('rx', '2');
        tube.setAttribute('fill', '#334155');
        tube.setAttribute('stroke', '#94a3b8');
        tube.setAttribute('stroke-width', '1.8');
        g.appendChild(tube);

        // 対物レンズ枠（上部フード）
        const hood = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        hood.setAttribute('x', '-13');
        hood.setAttribute('y', '-26');
        hood.setAttribute('width', '26');
        hood.setAttribute('height', '5');
        hood.setAttribute('rx', '1');
        hood.setAttribute('fill', '#475569');
        hood.setAttribute('stroke', '#cbd5e1');
        hood.setAttribute('stroke-width', '1.5');
        g.appendChild(hood);

        // 接眼ドローチューブ
        const eyepiece = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        eyepiece.setAttribute('x', '-5');
        eyepiece.setAttribute('y', '14');
        eyepiece.setAttribute('width', '10');
        eyepiece.setAttribute('height', '14');
        eyepiece.setAttribute('rx', '1');
        eyepiece.setAttribute('fill', '#1e293b');
        eyepiece.setAttribute('stroke', '#64748b');
        eyepiece.setAttribute('stroke-width', '1.2');
        g.appendChild(eyepiece);

        // 対物レンズのガラス反射線
        const glass = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        glass.setAttribute('x1', '-9');
        glass.setAttribute('y1', '-23.5');
        glass.setAttribute('x2', '9');
        glass.setAttribute('y2', '-23.5');
        glass.setAttribute('stroke', '#38bdf8');
        glass.setAttribute('stroke-width', '2');
        g.appendChild(glass);
        break;
      }

      case 'source':
      case 'lamp': {
        // 点光源・電球・太陽型光源（中央光球＋放射状光線）
        const rayG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        for (let a = 0; a < 360; a += 45) {
          const rad = (a * Math.PI) / 180;
          const r1 = 15;
          const r2 = 24;
          const ray = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          ray.setAttribute('x1', (r1 * Math.cos(rad)).toFixed(1));
          ray.setAttribute('y1', (r1 * Math.sin(rad)).toFixed(1));
          ray.setAttribute('x2', (r2 * Math.cos(rad)).toFixed(1));
          ray.setAttribute('y2', (r2 * Math.sin(rad)).toFixed(1));
          ray.setAttribute('stroke', el.color || '#f59e0b');
          ray.setAttribute('stroke-width', '2');
          ray.setAttribute('stroke-linecap', 'round');
          rayG.appendChild(ray);
        }
        g.appendChild(rayG);

        const orb = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        orb.setAttribute('cx', '0');
        orb.setAttribute('cy', '0');
        orb.setAttribute('r', '12');
        orb.setAttribute('fill', el.color || '#f59e0b');
        orb.setAttribute('stroke', '#fbbf24');
        orb.setAttribute('stroke-width', '2');
        g.appendChild(orb);

        const core = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        core.setAttribute('cx', '0');
        core.setAttribute('cy', '0');
        core.setAttribute('r', '5');
        core.setAttribute('fill', '#ffffff');
        g.appendChild(core);
        break;
      }

      default: {
        // 汎用光学素子（円形ホルダー）
        const gen = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        gen.setAttribute('cx', '0');
        gen.setAttribute('cy', '0');
        gen.setAttribute('r', '18');
        gen.setAttribute('fill', '#334155');
        gen.setAttribute('stroke', '#64748b');
        gen.setAttribute('stroke-width', '2');
        g.appendChild(gen);
        break;
      }
    }

    elemG.appendChild(g);

    // 7. 素子ラベル（回転の影響を受けないよう別グループで絶対配置）
    const labelG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    labelG.setAttribute('class', 'optics-label-group');

    const nameText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    nameText.setAttribute('x', el.x);
    nameText.setAttribute('y', el.y + 44);
    nameText.setAttribute('text-anchor', 'middle');
    nameText.setAttribute('font-size', '12.5');
    nameText.setAttribute('font-weight', '700');
    nameText.setAttribute('fill', '#f1f5f9');
    nameText.setAttribute('font-family', 'system-ui, -apple-system, sans-serif');
    nameText.textContent = el.name;
    labelG.appendChild(nameText);

    if (el.subLabel) {
      const subText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      subText.setAttribute('x', el.x);
      subText.setAttribute('y', el.y + 60);
      subText.setAttribute('text-anchor', 'middle');
      subText.setAttribute('font-size', '11');
      subText.setAttribute('font-weight', '500');
      subText.setAttribute('fill', '#94a3b8');
      subText.setAttribute('font-family', 'system-ui, -apple-system, sans-serif');
      subText.textContent = el.subLabel;
      labelG.appendChild(subText);
    }

    elemG.appendChild(labelG);
  });

  svg.appendChild(elemG);
  container.appendChild(svg);

  if (labelText) {
    const lbl = document.createElement('div');
    lbl.className = 'chem-structure-label';
    lbl.textContent = labelText;
    container.appendChild(lbl);
  }
}
