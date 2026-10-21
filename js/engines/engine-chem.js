// ==========================================
// 化学構造式（chemfig / SMILES）の変換・描画エンジン
// ==========================================
function chemfigToSmiles(chemfigStr) {
  if (!chemfigStr) return null;
  const trimmed = chemfigStr.trim();

  // 1. ベンゼン環および置換ベンゼン環（トルエン、アスピリン等）の解析
  const ringMatch = trimmed.match(/^\*6\s*\((.+)\)$/);
  if (ringMatch) {
    const inner = ringMatch[1];

    // トップレベルの枝分かれ括弧（ネスト深度=1）を完全抽出
    const branches = [];
    let depth = 0;
    let startIdx = -1;
    for (let i = 0; i < inner.length; i++) {
      if (inner[i] === '(') {
        if (depth === 0) startIdx = i;
        depth++;
      } else if (inner[i] === ')') {
        depth--;
        if (depth === 0 && startIdx !== -1) {
          branches.push(inner.slice(startIdx + 1, i));
          startIdx = -1;
        }
      }
    }

    if (branches.length > 0) {
      const parseSub = (raw) => {
        const clean = raw
          .replace(/^[-=]+/, '')
          .replace(/\[:?[^\]]*\]/g, '')
          .replace(/_/g, '')
          .trim();

        if (/^C\(=?O\)\s*-?O\s*H?$/i.test(clean) || clean === 'COOH') {
          return { smiles: 'C(=O)O', type: 'COOH' };
        }
        if (/^O-?C\(=?O\)\s*-?CH3?$/i.test(clean) || clean === 'OCOCH3' || clean === 'OAc') {
          return { smiles: 'OC(=O)C', type: 'OCOCH3' };
        }
        if (/^CH3?$/i.test(clean)) return { smiles: 'C', type: 'CH3' };
        if (/^CH2CH3$|^C2H5$/i.test(clean)) return { smiles: 'CC', type: 'C2H5' };
        if (/^OH$/i.test(clean)) return { smiles: 'O', type: 'OH' };
        if (/^NH2?$/i.test(clean)) return { smiles: 'N', type: 'NH2' };
        if (/^CHO$/i.test(clean)) return { smiles: 'C=O', type: 'CHO' };
        if (/^NO2?$/i.test(clean)) return { smiles: '[N+](=O)[O-]', type: 'NO2' };
        if (/^SO3H$/i.test(clean)) return { smiles: 'S(=O)(=O)O', type: 'SO3H' };
        if (clean === 'Cl') return { smiles: 'Cl', type: 'Cl' };
        if (clean === 'Br') return { smiles: 'Br', type: 'Br' };
        if (clean === 'F') return { smiles: 'F', type: 'F' };
        if (clean === 'I') return { smiles: 'I', type: 'I' };

        return { smiles: clean, type: clean };
      };

      const parsedSubs = branches.map(parseSub);

      if (parsedSubs.length === 2) {
        const types = parsedSubs.map((s) => s.type);
        if (types.includes('COOH') && types.includes('OCOCH3')) {
          return { smiles: 'O=C(O)c1ccccc1OC(=O)C', name: 'アスピリン（アセチルサリチル酸）' };
        }
        if (types.includes('COOH') && types.includes('OH')) {
          return { smiles: 'O=C(O)c1ccccc1O', name: 'サリチル酸' };
        }
        return {
          smiles: `${parsedSubs[0].smiles}c1ccccc1${parsedSubs[1].smiles}`,
          name: `2置換ベンゼン（-${parsedSubs[0].type}, -${parsedSubs[1].type}）`
        };
      }

      const singleSub = parsedSubs[0];
      const singleNameMap = {
        'CH3': 'トルエン（C₇H₈）',
        'C2H5': 'エチルベンゼン',
        'OH': 'フェノール（C₆H₅OH）',
        'NH2': 'アニリン（C₆H₅NH₂）',
        'COOH': '安息香酸（C₆H₅COOH）',
        'CHO': 'ベンズアルデヒド',
        'NO2': 'ニトロベンゼン',
        'SO3H': 'ベンゼンスルホン酸',
        'Cl': 'クロロベンゼン',
        'Br': 'ブロモベンゼン',
        'F': 'フルオロベンゼン',
        'I': 'ヨードベンゼン'
      };

      return {
        smiles: `${singleSub.smiles}c1ccccc1`,
        name: singleNameMap[singleSub.type] || `置換ベンゼン（-${singleSub.type}）`
      };
    }

    // 括弧（置換基）のない純粋な六員環
    if (/^[-=]{5,6}$/.test(inner.replace(/\s+/g, ''))) {
      if (inner.includes('=')) {
        return { smiles: 'c1ccccc1', name: 'ベンゼン環（C₆H₆）' };
      }
      return { smiles: 'C1CCCCC1', name: 'シクロヘキサン' };
    }
  }

  // 2. シクロペンタン
  if (trimmed === '*5(-----)') {
    return { smiles: 'C1CCCC1', name: 'シクロペンタン' };
  }
  // 4. 水分子（折れ線型: [:30] 度数指定および [1] 等の整数方位指定に対応）
  if (/H\s*-\s*(?:\[:?[^\]]+\]\s*)?O\s*-\s*(?:\[:?[^\]]+\]\s*)?H/i.test(trimmed) || trimmed === 'H-O-H') {
    return { smiles: 'WATER', name: '水分子（H₂O 折れ線型）' };
  }
  // 5. メタン
  if (/^CH4$/i.test(trimmed) || /C\(.*H.*\)/.test(trimmed)) {
    return { smiles: 'C', name: 'メタン（CH₄）' };
  }
  // 6. エタノール
  if (/ethanol/i.test(trimmed) || trimmed.includes('C-C-OH') || trimmed.includes('CH3-CH2-OH')) {
    return { smiles: 'CCO', name: 'エタノール' };
  }
  // 7. 酢酸
  if (trimmed.includes('C(=O)OH') || trimmed.includes('CH3-COOH')) {
    return { smiles: 'CC(=O)O', name: '酢酸' };
  }

  // 簡易抽出：角度や方位ブラケットを取り除いてSMILESとして解釈可能か試行
  const simplified = trimmed.replace(/\[:?[^\]]*\]/g, '').replace(/[()]/g, '');
  if (simplified && /^[A-Za-z0-9=#\-+]+$/.test(simplified)) {
    return { smiles: simplified, name: '化学構造' };
  }

  return null;
}

// 水分子専用の高品位折れ線型（104.5度）SVG描画
function createWaterMoleculeSvg() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 180 120');
  svg.setAttribute('width', '180');
  svg.setAttribute('height', '120');
  svg.setAttribute('class', 'chem-structure-svg');

  svg.innerHTML = `
    <!-- 結合線（折れ線型 104.5度） -->
    <line x1="78" y1="48" x2="42" y2="82" stroke="#334155" stroke-width="3" stroke-linecap="round"/>
    <line x1="102" y1="48" x2="138" y2="82" stroke="#334155" stroke-width="3" stroke-linecap="round"/>
    <!-- 元素記号 -->
    <circle cx="90" cy="42" r="16" fill="#fee2e2"/>
    <text x="90" y="48" font-family="'KaTeX_Main', sans-serif" font-size="20" font-weight="bold" fill="#dc2626" text-anchor="middle">O</text>
    <circle cx="34" cy="90" r="14" fill="#e0f2fe"/>
    <text x="34" y="96" font-family="'KaTeX_Main', sans-serif" font-size="18" font-weight="bold" fill="#0284c7" text-anchor="middle">H</text>
    <circle cx="146" cy="90" r="14" fill="#e0f2fe"/>
    <text x="146" y="96" font-family="'KaTeX_Main', sans-serif" font-size="18" font-weight="bold" fill="#0284c7" text-anchor="middle">H</text>
  `;
  return svg;
}

// ベンゼン環のフォールバックSVG描画
function createBenzeneSvg() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 160 160');
  svg.setAttribute('width', '160');
  svg.setAttribute('height', '160');
  svg.setAttribute('class', 'chem-structure-svg');

  svg.innerHTML = `
    <!-- 外側六角形 -->
    <polygon points="80,18 135,50 135,110 80,142 25,110 25,50" fill="none" stroke="#1e293b" stroke-width="3" stroke-linejoin="round"/>
    <!-- 内側二重結合線（ケクレ構造） -->
    <line x1="80" y1="30" x2="123" y2="55" stroke="#1e293b" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="123" y1="105" x2="80" y2="130" stroke="#1e293b" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="37" y1="105" x2="37" y2="55" stroke="#1e293b" stroke-width="2.5" stroke-linecap="round"/>
  `;
  return svg;
}

// SMILES文字列からSVGを描画するヘルパー
function drawSmilesToElement(smiles, container, labelText) {
  if (!container) return;
  container.innerHTML = '';

  // 1. 水分子特化
  if (smiles === 'WATER') {
    container.appendChild(createWaterMoleculeSvg());
    if (labelText) {
      const lbl = document.createElement('div');
      lbl.className = 'chem-structure-label';
      lbl.textContent = labelText;
      container.appendChild(lbl);
    }
    return;
  }

  // 2. ベンゼン環特化（SmilesDrawerが遅延している場合も確実に綺麗に表示）
  if (smiles === 'c1ccccc1' && typeof SmilesDrawer === 'undefined') {
    container.appendChild(createBenzeneSvg());
    if (labelText) {
      const lbl = document.createElement('div');
      lbl.className = 'chem-structure-label';
      lbl.textContent = labelText;
      container.appendChild(lbl);
    }
    return;
  }

  // 3. SmilesDrawer による動的描画
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'chem-structure-svg');
  svg.setAttribute('width', '220');
  svg.setAttribute('height', '160');
  container.appendChild(svg);

  if (typeof SmilesDrawer !== 'undefined' && SmilesDrawer.SvgDrawer) {
    try {
      const drawer = new SmilesDrawer.SvgDrawer({
        width: 220,
        height: 160,
        bondThickness: 2.2,
        bondLength: 22,
        fontSizeLarge: 14,
        fontSizeSmall: 10,
        compactDrawing: false
      });
      SmilesDrawer.parse(smiles, (tree) => {
        drawer.draw(tree, svg, 'light');
      }, (err) => {
        console.warn('SmilesDrawer解析エラー:', err);
        container.innerHTML = `<span style="color:#ef4444; font-size:12px;">構文確認中: ${smiles}</span>`;
      });
    } catch (e) {
      console.error(e);
      container.appendChild(createBenzeneSvg());
    }
  } else {
    // ライブラリ準備中のフォールバック
    if (smiles === 'c1ccccc1') {
      container.innerHTML = '';
      container.appendChild(createBenzeneSvg());
    } else {
      svg.setAttribute('viewBox', '0 0 160 50');
      svg.innerHTML = `<text x="80" y="30" text-anchor="middle" font-size="14" fill="#64748b">${smiles}</text>`;
    }
  }

  if (labelText) {
    const lbl = document.createElement('div');
    lbl.className = 'chem-structure-label';
    lbl.textContent = labelText;
    container.appendChild(lbl);
  }
}
