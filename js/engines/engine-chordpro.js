// ==========================================
// ChordPro 形式 コード進行 パーサー & 描画エンジン
// ==========================================

/**
 * ChordPro テキストを構文解析する
 * @param {string} text 
 * @returns {object} { title, subtitle, artist, key, tempo, time, degree, sections: [ { type, label, lines: [ ... ] } ] }
 */
function parseChordPro(text) {
  // \chordpro{ ... } を除去
  let cleanText = text.replace(/^\\chordpro\s*\{/i, '').replace(/\}\s*$/, '');
  const rawLines = cleanText.split('\n');

  let title = '';
  let subtitle = '';
  let artist = '';
  let key = '';
  let tempo = '';
  let time = '';
  let degree = '';

  const sections = [];
  let currentSection = { type: 'normal', label: '', lines: [] };

  rawLines.forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line || line.startsWith('//') || line.startsWith('#')) return;

    // ディレクティブ {directive: value} または directive: "value"; の解析
    const mDir = line.match(/^\{([a-zA-Z0-9_-]+)(?:\s*:\s*([^}]*))?\}$/) ||
                 line.match(/^([a-zA-Z0-9_-]+)\s*:\s*["']?([^;"'\n]+)["']?;?$/i);

    if (mDir) {
      const dName = mDir[1].toLowerCase();
      const dVal = (mDir[2] || '').trim();

      if (dName === 'title' || dName === 't') {
        title = dVal;
      } else if (dName === 'subtitle' || dName === 'st') {
        subtitle = dVal;
      } else if (dName === 'artist') {
        artist = dVal;
      } else if (dName === 'key') {
        key = dVal;
      } else if (dName === 'tempo' || dName === 'bpm') {
        tempo = dVal;
      } else if (dName === 'time') {
        time = dVal;
      } else if (dName === 'degree' || dName === 'analysis' || dName === 'roman') {
        degree = dVal;
      } else if (dName === 'comment' || dName === 'c' || dName === 'section') {
        if (currentSection.lines.length > 0 || currentSection.label) {
          sections.push(currentSection);
        }
        currentSection = { type: 'comment', label: dVal, lines: [] };
      } else if (dName === 'start_of_chorus' || dName === 'soc') {
        if (currentSection.lines.length > 0 || currentSection.label) {
          sections.push(currentSection);
        }
        currentSection = { type: 'chorus', label: dVal || 'Chorus / サビ', lines: [] };
      } else if (dName === 'end_of_chorus' || dName === 'eoc') {
        sections.push(currentSection);
        currentSection = { type: 'normal', label: '', lines: [] };
      } else if (dName === 'start_of_verse' || dName === 'sov') {
        if (currentSection.lines.length > 0 || currentSection.label) {
          sections.push(currentSection);
        }
        currentSection = { type: 'verse', label: dVal || 'Verse / Aメロ', lines: [] };
      } else if (dName === 'end_of_verse' || dName === 'eov') {
        sections.push(currentSection);
        currentSection = { type: 'normal', label: '', lines: [] };
      }
      return;
    }

    // セクション見出し [Intro] [Verse] [Chorus] [Bridge] [Outro] 等の検出
    const mSectionTag = line.match(/^\[(Intro|Verse|Chorus|Bridge|Pre-Chorus|Outro|Interlude|Ending|サビ|Aメロ|Bメロ|イントロ|間奏|エンディング)([^\]]*)\]$/i);
    if (mSectionTag) {
      if (currentSection.lines.length > 0 || currentSection.label) {
        sections.push(currentSection);
      }
      const labelName = mSectionTag[1] + (mSectionTag[2] || '');
      const sType = /chorus|サビ/i.test(labelName) ? 'chorus' : 'verse';
      currentSection = { type: sType, label: labelName, lines: [] };
      return;
    }

    // 独立した LaTeX 数式行の検出（例: $$\text{Im} \rightarrow ...$$ または $...$ や度数表記）
    if (/^\$\$.*\$\$$/s.test(line) || /^\\\[.*\\\]$/s.test(line) || (/^\$.*\$$/s.test(line) && !line.includes('[')) ||
        (/\\(text|flat|sharp|rightarrow|to)\b/.test(line) && !line.includes('['))) {
      currentSection.lines.push({ type: 'math', content: line });
      return;
    }

    // リードシート・小節区切り行 (| C | G | Am | F |) の検出
    if (line.includes('|')) {
      const bars = parseMeasureLine(line);
      currentSection.lines.push({ type: 'lead-sheet', bars });
      return;
    }

    // 通常の歌詞＋コード行 ([C]お空を[G]見上げて)
    const pairs = parseChordProLine(line);
    currentSection.lines.push({ type: 'chord-lyric', pairs });
  });

  if (currentSection.lines.length > 0 || currentSection.label) {
    sections.push(currentSection);
  }

  return { title, subtitle, artist, key, tempo, time, degree, sections };
}

/**
 * 歌詞＋コード行を [{ chord: 'C', lyric: 'お空を' }, ...] のペア配列に分割
 */
function parseChordProLine(line) {
  const pairs = [];
  const regex = /\[([^\]]+)\]/g;
  let lastIndex = 0;
  let currentChord = '';
  let match;

  while ((match = regex.exec(line)) !== null) {
    const textBefore = line.substring(lastIndex, match.index);
    if (currentChord || textBefore) {
      pairs.push({ chord: currentChord, lyric: textBefore });
      currentChord = '';
    }
    currentChord = match[1];
    lastIndex = regex.lastIndex;
  }

  const trailingText = line.substring(lastIndex);
  if (currentChord || trailingText) {
    pairs.push({ chord: currentChord, lyric: trailingText });
  }

  return pairs;
}

/**
 * 小節進行行 (| C G | Am F | 等) を解析
 */
function parseMeasureLine(line) {
  const rawBars = line.split('|').map((b) => b.trim()).filter((b, idx, arr) => {
    if ((idx === 0 || idx === arr.length - 1) && b === '') return false;
    return true;
  });

  return rawBars.map((barStr) => {
    const chords = [];
    const bracketMatches = Array.from(barStr.matchAll(/\[([^\]]+)\]/g));
    if (bracketMatches.length > 0) {
      bracketMatches.forEach((m) => chords.push(m[1].trim()));
    } else {
      const tokens = barStr.split(/\s+/).filter(Boolean);
      tokens.forEach((t) => chords.push(t));
    }
    return chords.length > 0 ? chords : ['%'];
  });
}

/**
 * テキストまたは数式をレンダリングするヘルパー（KaTeX対応）
 */
function renderChordProMathOrHtml(str, isDisplay = false) {
  if (!str) return '';
  const trimmed = str.trim();

  let mathExp = null;
  const mDisplay = trimmed.match(/^\$\$(.*)\$\$$/s) || trimmed.match(/^\\\[(.*)\\\]$/s);
  const mInline = trimmed.match(/^\$(.*)\$$/s);

  if (mDisplay) {
    mathExp = mDisplay[1].trim();
    isDisplay = true;
  } else if (mInline) {
    mathExp = mInline[1].trim();
  } else if (/\\(text|flat|sharp|rightarrow|to|frac)\b/i.test(trimmed)) {
    mathExp = trimmed;
  }

  if (mathExp !== null && typeof katex !== 'undefined') {
    try {
      return katex.renderToString(mathExp, {
        displayMode: isDisplay,
        throwOnError: false
      });
    } catch (e) {
      console.warn('KaTeX render error in ChordPro:', e);
    }
  }

  return escapeHtml(trimmed);
}

/**
 * ChordPro を HTML コンテナに描画する
 * @param {string} text 
 * @param {HTMLElement} container 
 * @param {string} [labelText] 
 */
function drawChordPro(text, container, labelText) {
  const parsed = parseChordPro(text);
  const { title, subtitle, artist, key, tempo, time, degree, sections } = parsed;

  const wrapper = document.createElement('div');
  wrapper.className = 'chordpro-container';
  wrapper.dataset.baseWidth = '620';

  // 1. ヘッダー情報（タイトル・アーティスト・キー・テンポ・ディグリー）
  if (title || subtitle || artist || key || tempo || time || degree) {
    const headerEl = document.createElement('div');
    headerEl.className = 'chordpro-header';

    const titleArea = document.createElement('div');
    titleArea.className = 'chordpro-title-area';

    if (title) {
      const h2 = document.createElement('h2');
      h2.className = 'chordpro-title';
      h2.textContent = title;
      titleArea.appendChild(h2);
    }

    const sub = subtitle || artist;
    if (sub) {
      const subEl = document.createElement('div');
      subEl.className = 'chordpro-subtitle';
      subEl.textContent = sub;
      titleArea.appendChild(subEl);
    }
    headerEl.appendChild(titleArea);

    const metaArea = document.createElement('div');
    metaArea.className = 'chordpro-meta-badges';

    if (key) {
      const badge = document.createElement('span');
      badge.className = 'chordpro-meta-badge badge-key';
      badge.innerHTML = `<strong>Key:</strong> ${escapeHtml(key)}`;
      metaArea.appendChild(badge);
    }
    if (tempo) {
      const badge = document.createElement('span');
      badge.className = 'chordpro-meta-badge badge-tempo';
      badge.innerHTML = `<strong>BPM:</strong> ${escapeHtml(tempo)}`;
      metaArea.appendChild(badge);
    }
    if (time) {
      const badge = document.createElement('span');
      badge.className = 'chordpro-meta-badge badge-time';
      badge.innerHTML = `<strong>Time:</strong> ${escapeHtml(time)}`;
      metaArea.appendChild(badge);
    }

    if (metaArea.children.length > 0) {
      headerEl.appendChild(metaArea);
    }

    // 度数・ディグリー表記（Roman Numeral Analysis）が指定されている場合
    if (degree) {
      const degreeBlock = document.createElement('div');
      degreeBlock.className = 'chordpro-degree-block';
      const degreeLabel = document.createElement('span');
      degreeLabel.className = 'chordpro-degree-label';
      degreeLabel.textContent = '度数進行 (Analysis):';
      degreeBlock.appendChild(degreeLabel);

      const mathEl = document.createElement('div');
      mathEl.className = 'chordpro-degree-math';
      mathEl.innerHTML = renderChordProMathOrHtml(degree, true);
      degreeBlock.appendChild(mathEl);

      headerEl.appendChild(degreeBlock);
    }

    wrapper.appendChild(headerEl);
  }

  // 2. 本文セクション群
  if (sections.length === 0) {
    const emptyEl = document.createElement('div');
    emptyEl.className = 'chordpro-empty';
    emptyEl.textContent = 'コード進行または歌詞が入力されていません（例: [C]お空を [G]見上げて）';
    wrapper.appendChild(emptyEl);
  } else {
    sections.forEach((sec) => {
      const secEl = document.createElement('div');
      secEl.className = `chordpro-section section-${sec.type}`;

      if (sec.label) {
        const labelEl = document.createElement('div');
        labelEl.className = 'chordpro-section-label';
        labelEl.textContent = sec.label;
        secEl.appendChild(labelEl);
      }

      sec.lines.forEach((l) => {
        if (l.type === 'math') {
          // 独立数式行（ディグリーネーム等）
          const mathRow = document.createElement('div');
          mathRow.className = 'chordpro-math-row';
          mathRow.innerHTML = renderChordProMathOrHtml(l.content, true);
          secEl.appendChild(mathRow);

        } else if (l.type === 'lead-sheet') {
          // 小節進行グリッド行
          const rowEl = document.createElement('div');
          rowEl.className = 'chordpro-leadsheet-row';

          l.bars.forEach((barChords) => {
            const barEl = document.createElement('div');
            barEl.className = 'chordpro-measure-bar';
            barChords.forEach((c) => {
              const chordTag = document.createElement('span');
              chordTag.className = 'chordpro-bar-chord';
              chordTag.innerHTML = renderChordProMathOrHtml(c, false);
              barEl.appendChild(chordTag);
            });
            rowEl.appendChild(barEl);
          });
          secEl.appendChild(rowEl);

        } else if (l.type === 'chord-lyric') {
          // 歌詞＋コード行
          const lineEl = document.createElement('div');
          lineEl.className = 'chordpro-line';

          const hasAnyChord = l.pairs.some((p) => p.chord);

          l.pairs.forEach((p) => {
            const pairEl = document.createElement('span');
            const isChordOnly = p.chord && (!p.lyric || p.lyric.trim() === '');
            pairEl.className = `chordpro-pair${isChordOnly ? ' chord-only' : ''}`;

            if (hasAnyChord) {
              const chordEl = document.createElement('span');
              chordEl.className = 'chordpro-chord';
              chordEl.innerHTML = p.chord ? renderChordProMathOrHtml(p.chord, false) : '\u00A0';
              pairEl.appendChild(chordEl);
            }

            const lyricEl = document.createElement('span');
            lyricEl.className = 'chordpro-lyric';
            lyricEl.innerHTML = p.lyric ? escapeHtml(p.lyric) : (p.chord ? '\u00A0' : '');
            pairEl.appendChild(lyricEl);

            lineEl.appendChild(pairEl);
          });

          secEl.appendChild(lineEl);
        }
      });

      wrapper.appendChild(secEl);
    });
  }

  container.innerHTML = '';
  container.appendChild(wrapper);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
