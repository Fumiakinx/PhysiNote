// ==========================================
// コード進行フロー / ディグリー分析 (ChordFlow) エンジン
// ==========================================

/**
 * 音名から半音インデックス (0~11: C=0, C#/Db=1, ...) を取得
 */
const CF_NOTE_PITCH = {
  'c': 0, 'b#': 0,
  'c#': 1, 'db': 1,
  'd': 2,
  'd#': 3, 'eb': 3,
  'e': 4, 'fb': 4,
  'f': 5, 'e#': 5,
  'f#': 6, 'gb': 6,
  'g': 7,
  'g#': 8, 'ab': 8,
  'a': 9,
  'a#': 10, 'bb': 10,
  'b': 11, 'cb': 11
};

/**
 * フラット・シャープ記号を美しい音楽記号に変換
 */
function cfFormatSymbols(str) {
  if (!str) return '';
  return str
    .replace(/\bb([I|V|X]+)/g, '♭$1')   // bIII -> ♭III
    .replace(/^b([A-G])/i, '♭$1')        // bVI -> ♭VI
    .replace(/#([I|V|X]+)/g, '♯$1')      // #IV -> ♯IV
    .replace(/([A-G])b\b/g, '$1♭')       // Bb -> B♭
    .replace(/([A-G])#\b/g, '$1♯');      // F# -> F♯
}

/**
 * キー（根音＋メジャー/マイナー）からコードの度数（ディグリーネーム）を推測
 */
function cfGuessDegree(chordName, keyStr) {
  if (!chordName || !keyStr) return '';
  const cleanKey = keyStr.trim();
  const isMinorKey = /m\b|minor|マイナー/i.test(cleanKey);
  const keyRootMatch = cleanKey.match(/^([A-Ga-g][#b]?)/);
  if (!keyRootMatch) return '';
  
  const keyRoot = keyRootMatch[1].toLowerCase();
  const keyPitch = CF_NOTE_PITCH[keyRoot];
  if (keyPitch === undefined) return '';

  const chordMatch = chordName.trim().match(/^([A-Ga-g][#b]?)(.*)/);
  if (!chordMatch) return '';

  const chordRoot = chordMatch[1].toLowerCase();
  const chordQuality = chordMatch[2] || '';
  const chordPitch = CF_NOTE_PITCH[chordRoot];
  if (chordPitch === undefined) return '';

  const semitones = (chordPitch - keyPitch + 12) % 12;

  // メジャーキー基準
  const majorDegrees = {
    0: 'I', 1: '♭II', 2: 'IIm', 3: '♭III', 4: 'IIIm',
    5: 'IV', 6: '♯IV', 7: 'V', 8: '♭VI', 9: 'VIm',
    10: '♭VII', 11: 'VIIm7b5'
  };

  // マイナーキー基準
  const minorDegrees = {
    0: 'Im', 1: '♭II', 2: 'IIdim', 3: '♭III', 4: 'III',
    5: 'IVm', 6: '♯IV', 7: 'V', 8: '♭VI', 9: 'VI',
    10: '♭VII', 11: 'VII'
  };

  const table = isMinorKey ? minorDegrees : majorDegrees;
  let deg = table[semitones] || 'I';

  // セブンス等のテンション付加
  if (/7/.test(chordQuality) && !deg.includes('7')) {
    deg += '7';
  }
  return cfFormatSymbols(deg);
}

/**
 * ChordFlow テキストの構文解析
 * @param {string} text 
 * @returns {object} { title, key, nodes: [{ degree, chord, rawIndex }], annotations: [{ from, to, label, fullSequence }] }
 */
function parseChordFlow(text) {
  // \chordflow{ ... } を除去
  let cleanText = text.replace(/^\\chordflow\s*\{/i, '').replace(/\}\s*$/, '');
  const lines = cleanText.split('\n');

  let title = '';
  let key = '';
  let subtitle = '';

  const nodes = [];
  const annotations = [];

  let rawDegrees = null;
  let rawChords = null;

  lines.forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line || line.startsWith('//') || line.startsWith('#')) return;

    // ディレクティブ title: "..."; key: "...";
    const mDir = line.match(/^([a-zA-Z0-9_-]+)\s*:\s*["']?([^;"'\n]+)["']?;?$/i);
    if (mDir) {
      const k = mDir[1].toLowerCase();
      const v = mDir[2].trim();
      if (k === 'title' || k === 't') {
        title = v;
        return;
      }
      if (k === 'key' || k === 'k') {
        key = v;
        return;
      }
      if (k === 'subtitle' || k === 'st') {
        subtitle = v;
        return;
      }
      if (k === 'degrees') {
        rawDegrees = v.split(/\s*->\s*|\s*→\s*/).map(s => s.trim()).filter(Boolean);
        return;
      }
      if (k === 'chords') {
        rawChords = v.split(/\s*->\s*|\s*→\s*/).map(s => s.trim()).filter(Boolean);
        return;
      }
    }

    // アノテーション行の解析:
    // 例: 1 -> 2: "トニック"; または 4 -> 5 -> 6: "ドミナントモーションの解決 V → Im";
    // 例: [1 -> 2]: "トニック";
    // 例: arrow: 1 -> 2, "トニック";
    const mAnnot = line.match(/^(?:arrow\s*:\s*|\[)?([0-9\s->→A-Za-z#b]+?)(?:\])?\s*[:=,]\s*["']([^"']+)["'];?$/i);
    if (mAnnot) {
      const seqStr = mAnnot[1].trim();
      const label = mAnnot[2].trim();
      const steps = seqStr.split(/\s*->\s*|\s*→\s*/).map(s => s.trim()).filter(Boolean);
      
      if (steps.length >= 2) {
        annotations.push({
          steps: steps,
          label: label
        });
      }
      return;
    }

    // コード進行ノード行（矢印で繋がれた列）
    // 例: Im [Fm] -> IVm [Bbm] -> bIII [Ab] -> Im [Fm] -> bVI [Db] -> V [C]
    // または Fm -> Bbm -> Ab -> Fm -> Db -> C
    if (line.includes('->') || line.includes('→')) {
      const tokens = line.split(/\s*->\s*|\s*→\s*/).map(s => s.trim()).filter(Boolean);
      tokens.forEach((tok, idx) => {
        // パターン1: Degree [Chord] または Degree(Chord)
        const mBracket = tok.match(/^([^\s\[\(]+)\s*[\[\(]([^\]\)]+)[\]\)]$/);
        if (mBracket) {
          nodes.push({
            degree: cfFormatSymbols(mBracket[1].trim()),
            chord: mBracket[2].trim(),
            rawIndex: idx + 1
          });
          return;
        }

        // パターン2: 単体コードまたは単体度数
        // ローマ数字（I, II, III, IV, V, VI, VII）を含む場合は度数とみなす
        const isRoman = /^[b#♭♯]?[IVX]+[a-zA-Z0-9]*$/i.test(tok);
        if (isRoman) {
          nodes.push({
            degree: cfFormatSymbols(tok),
            chord: '',
            rawIndex: idx + 1
          });
        } else {
          // 実コードとみなす
          nodes.push({
            degree: '',
            chord: tok,
            rawIndex: idx + 1
          });
        }
      });
    }
  });

  // rawDegrees と rawChords の統合（もし分離指定されていた場合）
  if (rawDegrees || rawChords) {
    const maxLen = Math.max(rawDegrees ? rawDegrees.length : 0, rawChords ? rawChords.length : 0);
    for (let i = 0; i < maxLen; i++) {
      const deg = rawDegrees && rawDegrees[i] ? cfFormatSymbols(rawDegrees[i]) : '';
      const ch = rawChords && rawChords[i] ? rawChords[i] : '';
      if (i < nodes.length) {
        if (!nodes[i].degree && deg) nodes[i].degree = deg;
        if (!nodes[i].chord && ch) nodes[i].chord = ch;
      } else {
        nodes.push({
          degree: deg,
          chord: ch,
          rawIndex: i + 1
        });
      }
    }
  }

  // キーが指定されていて度数が空のノードがあれば自動推測
  if (key) {
    nodes.forEach(n => {
      if (!n.degree && n.chord) {
        n.degree = cfGuessDegree(n.chord, key);
      }
    });
  }

  return { title, subtitle, key, nodes, annotations };
}

/**
 * ChordFlow を SVG としてコンテナに描画する
 * @param {string} text 
 * @param {HTMLElement} container 
 * @param {string} [labelText] 
 */
function drawChordFlow(text, container, labelText) {
  const parsed = parseChordFlow(text);
  const { title, subtitle, nodes, annotations } = parsed;

  const wrapper = document.createElement('div');
  wrapper.className = 'chordflow-container';

  if (nodes.length === 0) {
    wrapper.innerHTML = `
      <div class="chordflow-empty">
        コード進行が指定されていません。<br>
        例: <code>\\chordflow{ Im [Fm] -&gt; IVm [Bbm] -&gt; bIII [Ab] -&gt; Im [Fm] -&gt; bVI [Db] -&gt; V [C] }</code>
      </div>
    `;
    container.innerHTML = '';
    container.appendChild(wrapper);
    return;
  }

/**
 * テキストの描画横幅（px）を概算
 */
function cfEstimateTextWidth(str, fontSize = 13) {
  if (!str) return 0;
  let w = 0;
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    w += (code > 255) ? fontSize * 1.05 : fontSize * 0.6;
  }
  return w;
}

  // レイアウト座標の計算
  const nodeCount = nodes.length;
  const cardPaddingX = 40;
  const titleHeight = title ? 55 : (subtitle ? 35 : 20);

  // 各アノテーションのテキスト幅から必要な最小間隔を推定
  let requiredSpacing = 140;
  if (annotations.length > 0) {
    annotations.forEach((annot) => {
      const w = cfEstimateTextWidth(annot.label, 13);
      const span = Math.max(1, (annot.steps ? annot.steps.length - 1 : 1));
      requiredSpacing = Math.max(requiredSpacing, Math.ceil(w / span) + 36);
    });

    for (let i = 0; i < annotations.length - 1; i++) {
      const a1 = annotations[i];
      const a2 = annotations[i + 1];
      const w1 = cfEstimateTextWidth(a1.label, 13);
      const w2 = cfEstimateTextWidth(a2.label, 13);
      requiredSpacing = Math.max(requiredSpacing, Math.ceil((w1 + w2) / 2) + 28);
    }
  }

  // ノード数に応じた基本ピッチ（少ノード時はカード幅を活かしてゆったり配置）
  let baseSpacing;
  if (nodeCount <= 2) {
    baseSpacing = 240;
  } else if (nodeCount <= 3) {
    baseSpacing = 210;
  } else if (nodeCount <= 4) {
    baseSpacing = 180;
  } else {
    baseSpacing = Math.max(120, Math.floor(660 / Math.max(1, nodeCount)));
  }

  const nodeSpacing = Math.max(baseSpacing, requiredSpacing);
  const contentWidth = nodeSpacing * Math.max(1, nodeCount - 1);
  const totalWidth = Math.max(580, contentWidth + cardPaddingX * 2);
  const startX = (totalWidth - contentWidth) / 2;

  // Y座標レイアウト
  const yDegree = titleHeight + 25;       // 度数ネーム
  const yChord = yDegree + 32;            // 実コードネーム
  const yDot = yChord + 22;               // 下段ノード（円）
  
  // アノテーション用スペース計算
  let maxAnnotationDepth = 0;
  if (annotations.length > 0) {
    maxAnnotationDepth = 55;
  }
  const totalHeight = yDot + 30 + maxAnnotationDepth;

  wrapper.dataset.baseWidth = totalWidth.toString();
  wrapper.style.width = '100%';
  wrapper.style.maxWidth = `${Math.max(totalWidth, 680)}px`;

  // ノードごとの中心 X 座標を記録
  const nodePositions = nodes.map((n, i) => {
    return {
      x: startX + i * nodeSpacing,
      node: n,
      index: i + 1 // 1-based
    };
  });

  // SVG 作成
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${totalWidth} ${totalHeight}`);
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.setAttribute('class', 'chordflow-svg');

  // defs (矢印マーカー等)
  const defs = document.createElementNS(svgNS, 'defs');
  defs.innerHTML = `
    <marker id="cf-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#94a3b8" />
    </marker>
    <marker id="cf-arrow-accent" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#6366f1" />
    </marker>
  `;
  svg.appendChild(defs);

  // 背景パネル
  const bgRect = document.createElementNS(svgNS, 'rect');
  bgRect.setAttribute('class', 'chordflow-bg');
  bgRect.setAttribute('x', '0');
  bgRect.setAttribute('y', '0');
  bgRect.setAttribute('width', totalWidth.toString());
  bgRect.setAttribute('height', totalHeight.toString());
  bgRect.setAttribute('rx', '14');
  bgRect.setAttribute('fill', '#ffffff');
  bgRect.setAttribute('stroke', '#e2e8f0');
  bgRect.setAttribute('stroke-width', '1.5');
  svg.appendChild(bgRect);

  // 1. タイトル
  if (title) {
    const titleText = document.createElementNS(svgNS, 'text');
    titleText.setAttribute('x', cardPaddingX.toString());
    titleText.setAttribute('y', '36');
    titleText.setAttribute('font-family', "'Outfit', 'Inter', 'Noto Sans JP', sans-serif");
    titleText.setAttribute('font-size', '19');
    titleText.setAttribute('font-weight', '700');
    titleText.setAttribute('fill', '#0f172a');
    titleText.textContent = title;
    svg.appendChild(titleText);
  }

  // 2. ノード間の進行矢印（上段: →）
  for (let i = 0; i < nodePositions.length - 1; i++) {
    const currentPos = nodePositions[i];
    const nextPos = nodePositions[i + 1];
    const midX = (currentPos.x + nextPos.x) / 2;

    const arrowText = document.createElementNS(svgNS, 'text');
    arrowText.setAttribute('x', midX.toString());
    arrowText.setAttribute('y', (yDegree - 1).toString());
    arrowText.setAttribute('text-anchor', 'middle');
    arrowText.setAttribute('font-family', "'Inter', system-ui, sans-serif");
    arrowText.setAttribute('font-size', '20');
    arrowText.setAttribute('font-weight', '700');
    arrowText.setAttribute('fill', '#1e293b');
    arrowText.textContent = '→';
    svg.appendChild(arrowText);
  }

  // 3. 各ノードの描画（ディグリー、実コード、円ドット）
  nodePositions.forEach((pos) => {
    const { x, node } = pos;

    // 上段: ディグリーネーム (Im, IVm, ♭III, etc.)
    if (node.degree) {
      const degText = document.createElementNS(svgNS, 'text');
      degText.setAttribute('x', x.toString());
      degText.setAttribute('y', yDegree.toString());
      degText.setAttribute('text-anchor', 'middle');
      degText.setAttribute('font-family', "'Outfit', 'Inter', 'Noto Sans JP', sans-serif");
      degText.setAttribute('font-size', '24');
      degText.setAttribute('font-weight', '800');
      degText.setAttribute('fill', '#0a192f');
      degText.setAttribute('letter-spacing', '-0.5px');
      degText.textContent = node.degree;
      svg.appendChild(degText);
    }

    // 中段: 実コードネーム (Fm, Bbm, Ab, etc.)
    if (node.chord) {
      const chordText = document.createElementNS(svgNS, 'text');
      chordText.setAttribute('x', x.toString());
      chordText.setAttribute('y', yChord.toString());
      chordText.setAttribute('text-anchor', 'middle');
      chordText.setAttribute('font-family', "'Outfit', 'Inter', system-ui, sans-serif");
      chordText.setAttribute('font-size', '17');
      chordText.setAttribute('font-weight', '600');
      chordText.setAttribute('fill', '#334155');
      chordText.textContent = node.chord;
      svg.appendChild(chordText);
    }

    // 下段: ドットノード
    const circle = document.createElementNS(svgNS, 'circle');
    circle.setAttribute('cx', x.toString());
    circle.setAttribute('cy', yDot.toString());
    circle.setAttribute('r', '7.5');
    circle.setAttribute('fill', '#cbd5e1');
    svg.appendChild(circle);
  });

  // 4. 下段アノテーション（カーブ矢印と解説ラベル）
  annotations.forEach((annot) => {
    const rawSteps = annot.steps;
    const label = annot.label;

    // ステップ番号またはコード名からノード位置インデックスを解決
    const stepIndices = [];
    rawSteps.forEach(stepStr => {
      const num = parseInt(stepStr, 10);
      if (!isNaN(num) && num >= 1 && num <= nodePositions.length) {
        stepIndices.push(num - 1);
      } else {
        // コード名やディグリー名で検索
        const foundIdx = nodePositions.findIndex(p => 
          p.node.chord.toLowerCase() === stepStr.toLowerCase() ||
          p.node.degree.toLowerCase() === stepStr.toLowerCase()
        );
        if (foundIdx !== -1) {
          stepIndices.push(foundIdx);
        }
      }
    });

    if (stepIndices.length < 2) return;

    const arcSegments = [];
    for (let i = 0; i < stepIndices.length - 1; i++) {
      arcSegments.push({
        from: stepIndices[i],
        to: stepIndices[i + 1]
      });
    }

    // 各セグメントのカーブ矢印を描画
    let minX = Infinity;
    let maxX = -Infinity;

    arcSegments.forEach(seg => {
      const p1 = nodePositions[seg.from];
      const p2 = nodePositions[seg.to];
      if (!p1 || !p2) return;

      minX = Math.min(minX, p1.x, p2.x);
      maxX = Math.max(maxX, p1.x, p2.x);

      const isForward = seg.to > seg.from;
      const x1 = isForward ? p1.x + 2 : p1.x - 2;
      const y1 = yDot + 8;
      const x2 = isForward ? p2.x - 3 : p2.x + 3;
      const y2 = yDot + 8;

      const span = Math.abs(seg.to - seg.from);
      const arcHeight = Math.min(32, 18 + span * 6);
      const ctrlX = (x1 + x2) / 2;
      const ctrlY = yDot + arcHeight;

      // 滑らかな二次ベジェ曲線
      const path = document.createElementNS(svgNS, 'path');
      path.setAttribute('d', `M ${x1} ${y1} Q ${ctrlX} ${ctrlY} ${x2} ${y2}`);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', '#94a3b8');
      path.setAttribute('stroke-width', '2');
      path.setAttribute('marker-end', 'url(#cf-arrow)');
      svg.appendChild(path);
    });

    // 解説テキスト（弧の下の中央に配置）
    if (label && minX !== Infinity) {
      const labelX = (minX + maxX) / 2;
      const labelY = yDot + 36;

      const labelEl = document.createElementNS(svgNS, 'text');
      labelEl.setAttribute('x', labelX.toString());
      labelEl.setAttribute('y', labelY.toString());
      labelEl.setAttribute('text-anchor', 'middle');
      labelEl.setAttribute('font-family', "'Outfit', 'Inter', 'Noto Sans JP', sans-serif");
      labelEl.setAttribute('font-size', '13');
      labelEl.setAttribute('font-weight', '500');
      labelEl.setAttribute('fill', '#334155');
      labelEl.textContent = label;
      svg.appendChild(labelEl);
    }
  });

  wrapper.appendChild(svg);
  container.innerHTML = '';
  container.appendChild(wrapper);
}
