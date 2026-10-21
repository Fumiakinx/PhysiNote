// ==========================================
// ギターコード図 (LaTeX guitarchords準拠) パーサー & SVG描画エンジン
// ==========================================

/**
 * 標準ギターコード（オープンコード・バレーコード）のフィンガリング辞書
 * 6弦 -> 1弦 の順 (x: ミュート, 0: 開放弦, 1~: フレット番号, base: 開始フレット, barre: セーハフレット)
 */
const DEFAULT_GUITAR_CHORDS = {
  // C系
  'C':     { frets: ['x', 3, 2, 0, 1, 0], base: 1 },
  'C7':    { frets: ['x', 3, 2, 3, 1, 0], base: 1 },
  'Cmaj7': { frets: ['x', 3, 2, 0, 0, 0], base: 1 },
  'Cadd9': { frets: ['x', 3, 2, 0, 3, 0], base: 1 },
  'Cm':    { frets: ['x', 3, 5, 5, 4, 3], base: 3, barre: 3 },
  'Cm7':   { frets: ['x', 3, 5, 3, 4, 3], base: 3, barre: 3 },

  // C# / Db 系
  'Db':    { frets: ['x', 4, 6, 6, 6, 4], base: 4, barre: 4 },
  'Db7':   { frets: ['x', 4, 6, 4, 6, 4], base: 4, barre: 4 },
  'Dbm':   { frets: ['x', 4, 6, 6, 5, 4], base: 4, barre: 4 },
  'Dbm7':  { frets: ['x', 4, 6, 4, 5, 4], base: 4, barre: 4 },
  'C#':    { frets: ['x', 4, 6, 6, 6, 4], base: 4, barre: 4 },
  'C#m':   { frets: ['x', 4, 6, 6, 5, 4], base: 4, barre: 4 },
  'C#7':   { frets: ['x', 4, 6, 4, 6, 4], base: 4, barre: 4 },

  // D系
  'D':     { frets: ['x', 'x', 0, 2, 3, 2], base: 1 },
  'Dm':    { frets: ['x', 'x', 0, 2, 3, 1], base: 1 },
  'D7':    { frets: ['x', 'x', 0, 2, 1, 2], base: 1 },
  'Dm7':   { frets: ['x', 'x', 0, 2, 1, 1], base: 1 },
  'Dmaj7': { frets: ['x', 'x', 0, 2, 2, 2], base: 1 },
  'Dsus4': { frets: ['x', 'x', 0, 2, 3, 3], base: 1 },

  // D# / Eb 系
  'Eb':    { frets: ['x', 6, 8, 8, 8, 6], base: 6, barre: 6 },
  'Eb7':   { frets: ['x', 6, 8, 6, 8, 6], base: 6, barre: 6 },
  'Ebm':   { frets: ['x', 6, 8, 8, 7, 6], base: 6, barre: 6 },
  'Ebm7':  { frets: ['x', 6, 8, 6, 7, 6], base: 6, barre: 6 },
  'D#':    { frets: ['x', 6, 8, 8, 8, 6], base: 6, barre: 6 },
  'D#m':   { frets: ['x', 6, 8, 8, 7, 6], base: 6, barre: 6 },

  // E系
  'E':     { frets: [0, 2, 2, 1, 0, 0], base: 1 },
  'Em':    { frets: [0, 2, 2, 0, 0, 0], base: 1 },
  'E7':    { frets: [0, 2, 0, 1, 0, 0], base: 1 },
  'Em7':   { frets: [0, 2, 0, 0, 0, 0], base: 1 },
  'Esus4': { frets: [0, 2, 2, 2, 0, 0], base: 1 },

  // F系
  'F':     { frets: [1, 3, 3, 2, 1, 1], base: 1, barre: 1 },
  'Fm':    { frets: [1, 3, 3, 1, 1, 1], base: 1, barre: 1 },
  'F7':    { frets: [1, 3, 1, 2, 1, 1], base: 1, barre: 1 },
  'Fmaj7': { frets: ['x', 'x', 3, 2, 1, 0], base: 1 },
  'F#':    { frets: [2, 4, 4, 3, 2, 2], base: 2, barre: 2 },
  'F#m':   { frets: [2, 4, 4, 2, 2, 2], base: 2, barre: 2 },
  'F#m7':  { frets: [2, 4, 2, 2, 2, 2], base: 2, barre: 2 },
  'F#7':   { frets: [2, 4, 2, 3, 2, 2], base: 2, barre: 2 },
  'Gb':    { frets: [2, 4, 4, 3, 2, 2], base: 2, barre: 2 },
  'Gbm':   { frets: [2, 4, 4, 2, 2, 2], base: 2, barre: 2 },

  // G系
  'G':     { frets: [3, 2, 0, 0, 0, 3], base: 1 },
  'Gm':    { frets: [3, 5, 5, 3, 3, 3], base: 3, barre: 3 },
  'G7':    { frets: [3, 2, 0, 0, 0, 1], base: 1 },
  'Gm7':   { frets: [3, 5, 3, 3, 3, 3], base: 3, barre: 3 },
  'Gmaj7': { frets: [3, 2, 0, 0, 0, 2], base: 1 },
  'Gsus4': { frets: [3, 'x', 0, 0, 1, 3], base: 1 },

  // G# / Ab 系
  'Ab':    { frets: [4, 6, 6, 5, 4, 4], base: 4, barre: 4 },
  'Abm':   { frets: [4, 6, 6, 4, 4, 4], base: 4, barre: 4 },
  'Ab7':   { frets: [4, 6, 4, 5, 4, 4], base: 4, barre: 4 },
  'Abmaj7':{ frets: [4, 'x', 5, 5, 4, 'x'], base: 4, barre: 4 },
  'G#':    { frets: [4, 6, 6, 5, 4, 4], base: 4, barre: 4 },
  'G#m':   { frets: [4, 6, 6, 4, 4, 4], base: 4, barre: 4 },

  // A系
  'A':     { frets: ['x', 0, 2, 2, 2, 0], base: 1 },
  'Am':    { frets: ['x', 0, 2, 2, 1, 0], base: 1 },
  'A7':    { frets: ['x', 0, 2, 0, 2, 0], base: 1 },
  'Am7':   { frets: ['x', 0, 2, 0, 1, 0], base: 1 },
  'Amaj7': { frets: ['x', 0, 2, 1, 2, 0], base: 1 },
  'Asus4': { frets: ['x', 0, 2, 2, 3, 0], base: 1 },

  // A# / Bb 系
  'Bb':    { frets: ['x', 1, 3, 3, 3, 1], base: 1, barre: 1 },
  'Bbm':   { frets: ['x', 1, 3, 3, 2, 1], base: 1, barre: 1 },
  'Bb7':   { frets: ['x', 1, 3, 1, 3, 1], base: 1, barre: 1 },
  'Bbm7':  { frets: ['x', 1, 3, 1, 2, 1], base: 1, barre: 1 },
  'A#':    { frets: ['x', 1, 3, 3, 3, 1], base: 1, barre: 1 },
  'A#m':   { frets: ['x', 1, 3, 3, 2, 1], base: 1, barre: 1 },

  // B系
  'B':     { frets: ['x', 2, 4, 4, 4, 2], base: 2, barre: 2 },
  'Bm':    { frets: ['x', 2, 4, 4, 3, 2], base: 2, barre: 2 },
  'B7':    { frets: ['x', 2, 1, 2, 0, 2], base: 1 },
  'Bm7':   { frets: ['x', 2, 4, 2, 3, 2], base: 2, barre: 2 },
  'Bm7b5': { frets: ['x', 2, 3, 2, 3, 'x'], base: 1 }
};

// 異名同音（シャープ・フラット変換）マップ
const ENHARMONIC_MAP = {
  'A#': 'Bb', 'A#m': 'Bbm', 'A#7': 'Bb7',
  'C#': 'Db', 'C#m': 'Dbm', 'C#7': 'Db7',
  'D#': 'Eb', 'D#m': 'Ebm', 'D#7': 'Eb7',
  'F#': 'Gb', 'F#m': 'Gbm', 'F#7': 'Gb7',
  'G#': 'Ab', 'G#m': 'Abm', 'G#7': 'Ab7'
};

/**
 * guitarchords 構文テキストを解析する
 * @param {string} text 
 * @returns {object} { title, subtitle, orientation, size, chords: [ ... ], showArrows }
 */
function parseGuitarChords(text) {
  let cleanText = text.replace(/^\\guitarchords\s*\{/i, '').replace(/\}\s*$/, '');
  const lines = cleanText.split('\n');

  let title = '';
  let subtitle = '';
  let orientation = 'vertical'; // 'vertical' | 'horizontal'
  let size = 'normal';          // 'normal' | 'small'
  let showArrows = false;

  const chords = [];
  const extractedChordsSet = new Set();
  const extractedChordsList = [];

  lines.forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line || line.startsWith('//') || line.startsWith('#')) return;

    // メタディレクティブ
    const mTitle = line.match(/^(?:title|名前)\s*:\s*["']?([^;"'\n]+)["']?;?$/i);
    if (mTitle) { title = mTitle[1].trim(); return; }

    const mSub = line.match(/^(?:subtitle|caption|説明)\s*:\s*["']?([^;"'\n]+)["']?;?$/i);
    if (mSub) { subtitle = mSub[1].trim(); return; }

    // 向きディレクティブ (orientation / layout / horizontal)
    const mOrient = line.match(/^(?:orientation|layout|向き)\s*:\s*["']?([^;"'\n]+)["']?;?$/i);
    if (mOrient) {
      const val = mOrient[1].toLowerCase();
      if (/horizontal|横|横向き|landscape/i.test(val)) orientation = 'horizontal';
      return;
    }
    if (/^(?:horizontal|横向き)\s*:\s*(?:true|1);?$/i.test(line)) {
      orientation = 'horizontal';
      return;
    }

    // サイズディレクティブ (size / compact / 小さめ)
    const mSize = line.match(/^(?:size|サイズ)\s*:\s*["']?([^;"'\n]+)["']?;?$/i);
    if (mSize) {
      const val = mSize[1].toLowerCase();
      if (/small|compact|mini|小さめ|小/i.test(val)) size = 'small';
      return;
    }
    if (/^(?:compact|small|小さめ)\s*:\s*(?:true|1);?$/i.test(line)) {
      size = 'small';
      return;
    }

    // 1. LaTeX guitarchords パッケージ記法: \chord{t|b}{x,3,2,0,1,0}{C} のマッチ
    const latexRegex = /\\chord\{([tbTB])\}\{([^}]+)\}\{([^}]+)\}/g;
    let lMatch;
    let hasLatexMatch = false;
    while ((lMatch = latexRegex.exec(line)) !== null) {
      hasLatexMatch = true;
      const type = lMatch[1].toLowerCase();
      const fretsRaw = lMatch[2].split(',').map((f) => f.trim().replace(/^p/i, ''));
      const chordName = lMatch[3].trim();
      chords.push(buildChordObj(chordName, fretsRaw, type === 'b'));
    }
    if (hasLatexMatch) return;

    // 2. 矢印進行 "C -> G -> Am -> F" の分解
    if (line.includes('->')) {
      showArrows = true;
      line.split('->').forEach((cName) => {
        const trimmed = cName.replace(/;/g, '').trim();
        if (trimmed) chords.push(lookupOrBuildChord(trimmed));
      });
      return;
    }

    // 3. ChordPro 歌詞＋コード記法（例: "お前 [Fm]やります [Bbm]ねぇスギ〜 [Ab]"）の検出
    const bracketMatches = Array.from(line.matchAll(/\[([a-zA-Z0-9#b\/\+\-]+)\]/g));
    if (bracketMatches.length > 0) {
      bracketMatches.forEach((m) => {
        const cName = m[1].trim();
        // セクション見出し（Verse, Chorus等）は除外
        if (/^(intro|verse|chorus|bridge|outro|ending|サビ|aメロ|bメロ)$/i.test(cName)) return;
        if (!extractedChordsSet.has(cName)) {
          extractedChordsSet.add(cName);
          extractedChordsList.push(cName);
        }
      });
      return;
    }

    // 4. コロン簡易記法: "C: x 3 2 0 1 0;" または "C [x,3,2,0,1,0]"
    const colonStatements = line.split(';').map((s) => s.trim()).filter(Boolean);
    colonStatements.forEach((stmt) => {
      const mColon = stmt.match(/^([^:\[]+)(?:\s*:\s*([x0-9,\s]+)|\s*\[([x0-9,\s]+)\])?$/);
      if (mColon) {
        const chordName = mColon[1].trim();
        const fretDef = mColon[2] || mColon[3];
        if (fretDef) {
          const frets = fretDef.replace(/,/g, ' ').split(/\s+/).filter(Boolean);
          chords.push(buildChordObj(chordName, frets));
        } else {
          chords.push(lookupOrBuildChord(chordName));
        }
      }
    });
  });

  // ブラケットからコードが抽出された場合、一覧に追加
  if (extractedChordsList.length > 0 && chords.length === 0) {
    extractedChordsList.forEach((cName) => {
      chords.push(lookupOrBuildChord(cName));
    });
    if (!subtitle) {
      subtitle = `使用コード: ${extractedChordsList.join(', ')} (${extractedChordsList.length}コード)`;
    }
  }

  return { title, subtitle, orientation, size, chords, showArrows };
}

/**
 * フレット指定からコードオブジェクトを構築（baseフレットとbarreの自動算出含む）
 */
function buildChordObj(name, fretsRaw, isBarreHint = false) {
  const frets = fretsRaw.map((f) => {
    const s = String(f).toLowerCase();
    if (s === 'x') return 'x';
    const num = parseInt(s, 10);
    return isNaN(num) ? 0 : num;
  });

  while (frets.length < 6) frets.push(0);

  const positiveFrets = frets.filter((f) => typeof f === 'number' && f > 0);
  const minFret = positiveFrets.length > 0 ? Math.min(...positiveFrets) : 1;
  const maxFret = positiveFrets.length > 0 ? Math.max(...positiveFrets) : 1;

  let base = 1;
  if (maxFret > 4 && minFret >= 2) {
    base = minFret;
  }

  let barre = null;
  if (isBarreHint || (positiveFrets.filter((f) => f === minFret).length >= 3 && minFret > 0)) {
    barre = minFret;
  }

  return { name, frets, base, barre };
}

/**
 * コード名から辞書引き、なければ推測構築
 */
function lookupOrBuildChord(name) {
  const cleanName = name.trim();

  // 1. 直接マッチ
  if (DEFAULT_GUITAR_CHORDS[cleanName]) {
    const def = DEFAULT_GUITAR_CHORDS[cleanName];
    return { name: cleanName, frets: [...def.frets], base: def.base || 1, barre: def.barre || null };
  }

  // 2. 異名同音（シャープ・フラット変換）マッチ
  const enharmonic = ENHARMONIC_MAP[cleanName];
  if (enharmonic && DEFAULT_GUITAR_CHORDS[enharmonic]) {
    const def = DEFAULT_GUITAR_CHORDS[enharmonic];
    return { name: cleanName, frets: [...def.frets], base: def.base || 1, barre: def.barre || null };
  }

  // 3. 未知コードの推測フォールバック
  return { name: cleanName, frets: ['x', 0, 2, 2, 1, 0], base: 1, barre: null };
}

/**
 * 1つのギターコード指板を SVG 文字列として生成（縦向き/横向き、通常/小型対応）
 */
function renderSingleChordSvg(chord, orientation = 'vertical', size = 'normal') {
  const { name, frets, base, barre } = chord;

  const isSmall = size === 'small';
  const isHorizontal = orientation === 'horizontal';

  if (isHorizontal) {
    // ------------------------------------------
    // 横向き（Horizontal）レイアウト
    // ------------------------------------------
    const width = isSmall ? 115 : 160;
    const height = isSmall ? 82 : 115;
    const padTop = isSmall ? 22 : 30;
    const padLeft = isSmall ? 36 : 48;
    const fretSpacing = isSmall ? 16 : 22;
    const stringSpacing = isSmall ? 8.5 : 12;
    const numStrings = 6;
    const numFrets = 4;

    const boardWidth = numFrets * fretSpacing;
    const boardHeight = (numStrings - 1) * stringSpacing;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" class="guitar-chord-svg svg-horizontal${isSmall ? ' svg-small' : ''}">`;

    // コード名（左上または上部中央）
    svg += `<text x="${padLeft + boardWidth / 2}" y="${isSmall ? 15 : 20}" text-anchor="middle" font-size="${isSmall ? 13 : 16}" font-weight="800" fill="#0f172a" font-family="-apple-system, BlinkMacSystemFont, sans-serif">${escapeHtml(name)}</text>`;

    // 開始フレット番号（base > 1 の場合は左下または下に表示）
    if (base > 1) {
      svg += `<text x="${padLeft + fretSpacing * 0.5}" y="${padTop + boardHeight + (isSmall ? 12 : 16)}" text-anchor="middle" font-size="${isSmall ? 9.5 : 11}" font-weight="700" fill="#64748b" font-family="-apple-system, sans-serif">${base}fr</text>`;
    }

    // ナット（左端縦太線）
    const nutStrokeWidth = base === 1 ? (isSmall ? 3 : 4.5) : 1.5;
    const nutStrokeColor = base === 1 ? '#0f172a' : '#94a3b8';
    svg += `<line x1="${padLeft}" y1="${padTop}" x2="${padLeft}" y2="${padTop + boardHeight}" stroke="${nutStrokeColor}" stroke-width="${nutStrokeWidth}" stroke-linecap="round"/>`;

    // フレット縦線 (1〜4)
    for (let f = 1; f <= numFrets; f++) {
      const x = padLeft + f * fretSpacing;
      svg += `<line x1="${x}" y1="${padTop}" x2="${x}" y2="${padTop + boardHeight}" stroke="#cbd5e1" stroke-width="1.2"/>`;
    }

    // 弦横線 (上が1弦、下が6弦)
    for (let s = 0; s < numStrings; s++) {
      const y = padTop + s * stringSpacing;
      const sWidth = isSmall ? (0.9 + (5 - s) * 0.12) : (1.1 + (5 - s) * 0.18);
      svg += `<line x1="${padLeft}" y1="${y}" x2="${padLeft + boardWidth}" y2="${y}" stroke="#64748b" stroke-width="${sWidth.toFixed(2)}"/>`;
    }

    // バレーバー描画 (横向きでは縦バー)
    if (barre && barre >= base && barre < base + numFrets) {
      const fretRel = barre - base + 1;
      const xCenter = padLeft + (fretRel - 0.5) * fretSpacing;

      let firstString = 0;
      let lastString = numStrings - 1;
      for (let s = 0; s < numStrings; s++) {
        const stringIdx = 5 - s;
        if (frets[stringIdx] === barre) { firstString = s; break; }
      }
      for (let s = numStrings - 1; s >= 0; s--) {
        const stringIdx = 5 - s;
        if (frets[stringIdx] === barre) { lastString = s; break; }
      }

      if (lastString > firstString) {
        const by1 = padTop + firstString * stringSpacing;
        const by2 = padTop + lastString * stringSpacing;
        const barW = isSmall ? 6.5 : 9;
        svg += `<rect x="${xCenter - barW / 2}" y="${by1 - barW / 2}" width="${barW}" height="${by2 - by1 + barW}" rx="${barW / 2}" fill="#0284c7" opacity="0.9"/>`;
      }
    }

    // 開放弦(○)・ミュート(×)・押弦位置(●) の描画
    // frets配列は 0: 6弦, 1: 5弦, ..., 5: 1弦
    frets.forEach((fVal, sIdx) => {
      // 横向き画面では 上が1弦(sIdx=5)、下が6弦(sIdx=0)
      const visualStringIdx = 5 - sIdx;
      const y = padTop + visualStringIdx * stringSpacing;

      if (fVal === 'x') {
        const mx = padLeft - (isSmall ? 8 : 11);
        svg += `<text x="${mx}" y="${y + (isSmall ? 3.5 : 4.5)}" text-anchor="middle" font-size="${isSmall ? 9.5 : 11.5}" font-weight="800" fill="#ef4444" font-family="-apple-system, sans-serif">×</text>`;
      } else if (fVal === 0) {
        const ox = padLeft - (isSmall ? 8 : 11);
        svg += `<circle cx="${ox}" cy="${y}" r="${isSmall ? 2.5 : 3.5}" fill="none" stroke="#0284c7" stroke-width="1.5"/>`;
      } else if (typeof fVal === 'number' && fVal > 0) {
        const fretRel = fVal - base + 1;
        if (fretRel >= 1 && fretRel <= numFrets) {
          const cx = padLeft + (fretRel - 0.5) * fretSpacing;
          const dotR = isSmall ? 3.6 : 4.8;
          svg += `<circle cx="${cx}" cy="${y}" r="${dotR}" fill="#0284c7" stroke="#ffffff" stroke-width="1.2"/>`;
        }
      }
    });

    svg += `</svg>`;
    return svg;

  } else {
    // ------------------------------------------
    // 縦向き（Vertical）レイアウト
    // ------------------------------------------
    const width = isSmall ? 78 : 100;
    const height = isSmall ? 112 : 148;
    const padTop = isSmall ? 28 : 38;
    const padLeft = isSmall ? 16 : 20;
    const stringSpacing = isSmall ? 9.2 : 12;
    const fretSpacing = isSmall ? 15 : 20;
    const numStrings = 6;
    const numFrets = 4;

    const boardWidth = (numStrings - 1) * stringSpacing;
    const boardHeight = numFrets * fretSpacing;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" class="guitar-chord-svg svg-vertical${isSmall ? ' svg-small' : ''}">`;

    // コード名 (上部中央: ○や×と重ならないよう上部に配置)
    svg += `<text x="${width / 2}" y="${isSmall ? 13 : 17}" text-anchor="middle" font-size="${isSmall ? 13 : 16}" font-weight="800" fill="#0f172a" font-family="-apple-system, BlinkMacSystemFont, sans-serif">${escapeHtml(name)}</text>`;

    // 開始フレット番号
    if (base > 1) {
      svg += `<text x="${padLeft - (isSmall ? 4 : 6)}" y="${padTop + (isSmall ? 11 : 14)}" text-anchor="end" font-size="${isSmall ? 9.5 : 11}" font-weight="700" fill="#64748b" font-family="-apple-system, sans-serif">${base}fr</text>`;
    }

    // ナット
    const nutStrokeWidth = base === 1 ? (isSmall ? 3 : 4) : 1.5;
    const nutStrokeColor = base === 1 ? '#0f172a' : '#94a3b8';
    svg += `<line x1="${padLeft}" y1="${padTop}" x2="${padLeft + boardWidth}" y2="${padTop}" stroke="${nutStrokeColor}" stroke-width="${nutStrokeWidth}" stroke-linecap="round"/>`;

    // フレット横線
    for (let f = 1; f <= numFrets; f++) {
      const y = padTop + f * fretSpacing;
      svg += `<line x1="${padLeft}" y1="${y}" x2="${padLeft + boardWidth}" y2="${y}" stroke="#cbd5e1" stroke-width="1.2"/>`;
    }

    // 弦縦線 (6弦〜1弦)
    for (let s = 0; s < numStrings; s++) {
      const x = padLeft + s * stringSpacing;
      const sWidth = isSmall ? (1.3 - s * 0.12) : (1.6 - s * 0.16);
      svg += `<line x1="${x}" y1="${padTop}" x2="${x}" y2="${padTop + boardHeight}" stroke="#64748b" stroke-width="${sWidth.toFixed(2)}"/>`;
    }

    // バレーバー
    if (barre && barre >= base && barre < base + numFrets) {
      const fretRel = barre - base + 1;
      const yCenter = padTop + (fretRel - 0.5) * fretSpacing;

      let firstString = 0;
      let lastString = numStrings - 1;
      for (let s = 0; s < numStrings; s++) {
        if (frets[s] === barre) { firstString = s; break; }
      }
      for (let s = numStrings - 1; s >= 0; s--) {
        if (frets[s] === barre) { lastString = s; break; }
      }

      if (lastString > firstString) {
        const bx1 = padLeft + firstString * stringSpacing;
        const bx2 = padLeft + lastString * stringSpacing;
        const barH = isSmall ? 6.5 : 9;
        svg += `<rect x="${bx1 - barH / 2}" y="${yCenter - barH / 2}" width="${bx2 - bx1 + barH}" height="${barH}" rx="${barH / 2}" fill="#0284c7" opacity="0.9"/>`;
      }
    }

    // 開放弦(○)・ミュート(×)・押弦位置(●) の描画
    frets.forEach((fVal, sIdx) => {
      const x = padLeft + sIdx * stringSpacing;

      if (fVal === 'x') {
        const my = padTop - (isSmall ? 5 : 7);
        svg += `<text x="${x}" y="${my}" text-anchor="middle" font-size="${isSmall ? 9.5 : 11}" font-weight="800" fill="#ef4444" font-family="-apple-system, sans-serif">×</text>`;
      } else if (fVal === 0) {
        const oy = padTop - (isSmall ? 5 : 7);
        svg += `<circle cx="${x}" cy="${oy - (isSmall ? 2.5 : 3)}" r="${isSmall ? 2.5 : 3.5}" fill="none" stroke="#0284c7" stroke-width="1.5"/>`;
      } else if (typeof fVal === 'number' && fVal > 0) {
        const fretRel = fVal - base + 1;
        if (fretRel >= 1 && fretRel <= numFrets) {
          const cy = padTop + (fretRel - 0.5) * fretSpacing;
          const dotR = isSmall ? 3.6 : 4.8;
          svg += `<circle cx="${x}" cy="${cy}" r="${dotR}" fill="#0284c7" stroke="#ffffff" stroke-width="1.2"/>`;
        }
      }
    });

    svg += `</svg>`;
    return svg;
  }
}

/**
 * ギターコード群を HTML コンテナに描画する
 * @param {string} text 
 * @param {HTMLElement} container 
 * @param {string} [labelText] 
 */
function drawGuitarChords(text, container, labelText) {
  const parsed = parseGuitarChords(text);
  const { title, subtitle, orientation, size, chords, showArrows } = parsed;

  const wrapper = document.createElement('div');
  wrapper.className = `guitarchords-container layout-${orientation} size-${size}`;
  wrapper.dataset.baseWidth = orientation === 'horizontal' ? '760' : '720';

  if (title || subtitle) {
    const headerEl = document.createElement('div');
    headerEl.className = 'guitarchords-header';

    if (title) {
      const h2 = document.createElement('h2');
      h2.className = 'guitarchords-title';
      h2.textContent = title;
      headerEl.appendChild(h2);
    }
    if (subtitle) {
      const sub = document.createElement('div');
      sub.className = 'guitarchords-subtitle';
      sub.textContent = subtitle;
      headerEl.appendChild(sub);
    }
    wrapper.appendChild(headerEl);
  }

  if (chords.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'guitarchords-empty';
    empty.textContent = 'コードが指定されていません（例: \\chord{t}{x,3,2,0,1,0}{C} または C -> G -> Am -> F、歌詞付きコード譜）';
    wrapper.appendChild(empty);
  } else {
    const grid = document.createElement('div');
    grid.className = `guitarchords-grid layout-${orientation} size-${size}`;

    chords.forEach((chord, idx) => {
      const card = document.createElement('div');
      card.className = `guitarchords-card size-${size}`;
      card.innerHTML = renderSingleChordSvg(chord, orientation, size);
      grid.appendChild(card);

      // 明示的に矢印進行が指定された場合のみ矢印を表示
      if (showArrows && idx < chords.length - 1) {
        const arrow = document.createElement('div');
        arrow.className = 'guitarchords-arrow';
        arrow.textContent = '→';
        grid.appendChild(arrow);
      }
    });

    wrapper.appendChild(grid);
  }

  container.innerHTML = '';
  container.appendChild(wrapper);
}
