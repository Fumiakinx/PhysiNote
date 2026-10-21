// ==========================================
// 結晶構造・格子モデル (Crystal Structure & Lattice Model) パーサー & SVG描画エンジン
// 固体物理・材料科学（ブラベ格子、面心立方、体心立方、NaCl型、グラフェン、カゴメ格子等）
// ==========================================

function parseCrystalText(text) {
  if (!text || typeof text !== 'string') return null;

  // \crystal{...} または \lattice{...} の中身を取り出す
  const match = text.match(/\\(?:crystal|lattice)\s*\{([\s\S]*)\}/i);
  const content = match ? match[1] : text;

  const lines = content
    .split(/[\n;]+/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('//') && !l.startsWith('#'));

  let type = 'fcc'; // デフォルトは代表的な面心立方
  let mode = 'normal'; // 'normal' (骨格), 'slice' (充填・分割), 'compare' (上下比較)
  let title = '';
  let showAxes = true;
  let showBonds = true;
  let showUnitCell = true;
  let showLabels = true;
  let plane = null; // ミラー指数面例: [1, 1, 1]
  let rows = 3;
  let cols = 4;
  let theme = 'light';
  let a = 1.0;
  let b = 1.0;
  let c = 1.0;

  const customAtoms = []; // { name, color, radius, positions: [[x,y,z], ...] }

  for (const line of lines) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) {
      // 構文タイプ単体指定（例: "fcc", "bcc", "bcc-slice", "slice"）
      const single = line.toLowerCase();
      if (single.includes('slice') || single.includes('packing') || single.includes('fill')) {
        mode = 'slice';
        type = single.replace(/[-_](?:slice|packing|fill)/, '') || 'bcc';
      } else if (single === 'compare') {
        mode = 'compare';
      } else if (/^(sc|bcc|fcc|hcp|nacl|cscl|diamond|zns|perovskite|graphene|honeycomb|square|triangular|kagome)$/.test(single)) {
        type = single;
      }
      continue;
    }

    const key = line.slice(0, colonIdx).trim().toLowerCase();
    const val = line.slice(colonIdx + 1).trim();

    if (key === 'type' || key === 'structure' || key === 'lattice') {
      const vLow = val.toLowerCase();
      if (vLow.includes('slice') || vLow.includes('packing') || vLow.includes('fill')) {
        mode = 'slice';
        type = vLow.replace(/[-_](?:slice|packing|fill)/, '') || 'bcc';
      } else {
        type = vLow;
      }
    } else if (key === 'mode' || key === 'style' || key === 'model') {
      const vLow = val.toLowerCase();
      if (vLow.includes('slice') || vLow.includes('packing') || vLow.includes('fill')) {
        mode = 'slice';
      } else if (vLow.includes('compare')) {
        mode = 'compare';
      } else {
        mode = 'normal';
      }
    } else if (key === 'title' || key === 'name') {
      title = val.replace(/^["']|["']$/g, '');
    } else if (key === 'axes' || key === 'showaxes') {
      showAxes = val.toLowerCase() !== 'false' && val !== '0';
    } else if (key === 'bonds' || key === 'showbonds') {
      showBonds = val.toLowerCase() !== 'false' && val !== '0';
    } else if (key === 'unitcell' || key === 'box') {
      showUnitCell = val.toLowerCase() !== 'false' && val !== '0';
    } else if (key === 'labels' || key === 'showlabels') {
      showLabels = val.toLowerCase() !== 'false' && val !== '0';
    } else if (key === 'plane' || key === 'miller') {
      // ミラー指数 (h k l) または (h,k,l)
      const mMatch = val.match(/\(?\s*(-?\d+)\s*[, ]\s*(-?\d+)\s*[, ]\s*(-?\d+)\s*\)?/);
      if (mMatch) {
        plane = [parseInt(mMatch[1], 10), parseInt(mMatch[2], 10), parseInt(mMatch[3], 10)];
      }
    } else if (key === 'rows') {
      rows = Math.max(1, parseInt(val, 10) || 3);
    } else if (key === 'cols') {
      cols = Math.max(1, parseInt(val, 10) || 4);
    } else if (key === 'theme') {
      theme = val.toLowerCase();
    } else if (key === 'a') {
      a = parseFloat(val) || 1.0;
    } else if (key === 'b') {
      b = parseFloat(val) || 1.0;
    } else if (key === 'c') {
      c = parseFloat(val) || 1.0;
    } else if (key === 'atom') {
      // atom: Name, color: #..., r: 12, pos: (0,0,0), (1,1,0)...
      const atomObj = { name: 'Atom', color: '#3b82f6', radius: 14, positions: [] };
      const parts = val.split(',').map((p) => p.trim());
      
      let posCollecting = false;
      let posBuffer = '';

      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        if (i === 0 && !p.includes(':') && !p.includes('(')) {
          atomObj.name = p;
          continue;
        }
        const kv = p.match(/^([a-zA-Z_-]+)\s*[:=]\s*(.+)$/);
        if (kv) {
          const k = kv[1].toLowerCase();
          const v = kv[2].trim();
          if (k === 'color' || k === 'c') atomObj.color = v;
          else if (k === 'radius' || k === 'r') atomObj.radius = parseFloat(v) || 14;
          else if (k === 'pos' || k === 'positions') {
            posCollecting = true;
            posBuffer = v;
          }
        } else if (posCollecting || p.includes('(') || p.includes(')')) {
          posBuffer += ',' + p;
        }
      }

      // posBuffer から (x,y,z) を抽出
      const coordRegex = /\(\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)(?:\s*,\s*(-?[\d.]+))?\s*\)/g;
      let cMatch;
      while ((cMatch = coordRegex.exec(posBuffer || val)) !== null) {
        const px = parseFloat(cMatch[1]);
        const py = parseFloat(cMatch[2]);
        const pz = cMatch[3] !== undefined ? parseFloat(cMatch[3]) : 0;
        atomObj.positions.push([px, py, pz]);
      }
      if (atomObj.positions.length > 0) {
        customAtoms.push(atomObj);
      }
    }
  }

  return {
    type,
    mode,
    title,
    showAxes,
    showBonds,
    showUnitCell,
    showLabels,
    plane,
    rows,
    cols,
    theme,
    a,
    b,
    c,
    customAtoms
  };
}

// 結晶構造モデルの定義ジェネレータ
function getCrystalModelData(parsed) {
  const t = parsed.type;
  const atoms = []; // { name, color, radius, x, y, z, label }
  const bonds = []; // [ [i, j, style] ]
  let is2D = false;
  let defaultTitle = '結晶格子モデル';
  let unitCellBounds = { x: 1, y: 1, z: 1 };

  // -------------------------------------------------------------
  // 1. 2D 格子モデル (グラフェン、蜂の巣、正方格子、カゴメ格子等)
  // -------------------------------------------------------------
  if (t === 'graphene' || t === 'honeycomb') {
    is2D = true;
    defaultTitle = 'グラフェン / 蜂の巣格子 (Honeycomb Lattice)';
    const rRows = parsed.rows || 3;
    const rCols = parsed.cols || 4;
    const a0 = 50; // 結合長
    const dy = a0 * Math.sqrt(3);

    const atomIndices = new Map();
    let idx = 0;

    for (let r = 0; r < rRows; r++) {
      for (let c = 0; c < rCols; c++) {
        // サブラティス A と B
        const xA = c * 3 * a0 + (r % 2) * 1.5 * a0;
        const yA = r * dy;
        const xB = xA + a0;
        const yB = yA;

        atoms.push({ name: 'A', color: '#3b82f6', radius: 10, x: xA, y: yA, z: 0, sub: 'A' });
        atomIndices.set(`${r},${c},A`, idx++);
        atoms.push({ name: 'B', color: '#f59e0b', radius: 10, x: xB, y: yB, z: 0, sub: 'B' });
        atomIndices.set(`${r},${c},B`, idx++);

        // A-B 結合
        bonds.push([idx - 2, idx - 1, 'solid']);
      }
    }

    // 上下方向の六角形結合を接続
    for (let r = 0; r < rRows - 1; r++) {
      for (let c = 0; c < rCols; c++) {
        const curA = atomIndices.get(`${r},${c},A`);
        const curB = atomIndices.get(`${r},${c},B`);
        const nextA = atomIndices.get(`${r + 1},${c},A`);
        const nextB = atomIndices.get(`${r + 1},${c},B`);

        if (curB !== undefined && nextA !== undefined) {
          bonds.push([curB, nextA, 'solid']);
        }
      }
    }
    return { is2D, atoms, bonds, title: parsed.title || defaultTitle };
  }

  if (t === 'square') {
    is2D = true;
    defaultTitle = '2次元正方格子 (2D Square Lattice)';
    const rRows = parsed.rows || 4;
    const rCols = parsed.cols || 4;
    const spacing = 55;
    for (let r = 0; r < rRows; r++) {
      for (let c = 0; c < rCols; c++) {
        atoms.push({ name: '•', color: '#0284c7', radius: 9, x: c * spacing, y: r * spacing, z: 0 });
        const cur = r * rCols + c;
        if (c < rCols - 1) bonds.push([cur, cur + 1, 'solid']);
        if (r < rRows - 1) bonds.push([cur, cur + rCols, 'solid']);
      }
    }
    return { is2D, atoms, bonds, title: parsed.title || defaultTitle };
  }

  if (t === 'triangular') {
    is2D = true;
    defaultTitle = '2次元三角格子 (Triangular Lattice)';
    const rRows = parsed.rows || 4;
    const rCols = parsed.cols || 4;
    const a0 = 55;
    const dy = a0 * (Math.sqrt(3) / 2);
    for (let r = 0; r < rRows; r++) {
      for (let c = 0; c < rCols; c++) {
        const x = c * a0 + (r % 2) * (a0 / 2);
        const y = r * dy;
        atoms.push({ name: '•', color: '#10b981', radius: 9, x, y, z: 0 });
        const cur = r * rCols + c;
        if (c < rCols - 1) bonds.push([cur, cur + 1, 'solid']);
      }
    }
    return { is2D, atoms, bonds, title: parsed.title || defaultTitle };
  }

  if (t === 'kagome') {
    is2D = true;
    defaultTitle = 'カゴメ格子 (Kagome Lattice)';
    const a0 = 60;
    const dy = a0 * Math.sqrt(3);
    const rRows = parsed.rows || 3;
    const rCols = parsed.cols || 3;
    let idx = 0;
    for (let r = 0; r < rRows; r++) {
      for (let c = 0; c < rCols; c++) {
        const ox = c * 2 * a0 + (r % 2) * a0;
        const oy = r * dy;
        const i1 = idx++;
        const i2 = idx++;
        const i3 = idx++;
        atoms.push({ name: '1', color: '#ec4899', radius: 8, x: ox, y: oy, z: 0 });
        atoms.push({ name: '2', color: '#8b5cf6', radius: 8, x: ox + a0, y: oy, z: 0 });
        atoms.push({ name: '3', color: '#06b6d4', radius: 8, x: ox + a0 / 2, y: oy + a0 * (Math.sqrt(3) / 2), z: 0 });
        bonds.push([i1, i2, 'solid'], [i2, i3, 'solid'], [i3, i1, 'solid']);
      }
    }
    return { is2D, atoms, bonds, title: parsed.title || defaultTitle };
  }

  // -------------------------------------------------------------
  // 2. 3D 単位胞モデル (立方晶系、ブラベ格子、代表的化合物)
  // -------------------------------------------------------------
  if (parsed.customAtoms && parsed.customAtoms.length > 0) {
    defaultTitle = 'カスタム結晶格子構造';
    parsed.customAtoms.forEach((grp) => {
      grp.positions.forEach((pos) => {
        atoms.push({
          name: grp.name,
          color: grp.color,
          radius: grp.radius,
          x: pos[0],
          y: pos[1],
          z: pos[2]
        });
      });
    });
    return { is2D: false, atoms, bonds, unitCellBounds, title: parsed.title || defaultTitle };
  }

  if (t === 'sc' || t === 'simple_cubic') {
    defaultTitle = '単純立方格子 (Simple Cubic: SC / α-Po)';
    const c1 = '#0284c7';
    const rad = 14;
    // 頂点8個
    const coords = [
      [0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0],
      [0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]
    ];
    coords.forEach((p) => atoms.push({ name: 'Po', color: c1, radius: rad, x: p[0], y: p[1], z: p[2] }));
  } else if (t === 'bcc' || t === 'body_centered_cubic') {
    defaultTitle = '体心立方格子 (BCC: Fe, Cr, W)';
    const cCorner = '#2563eb';
    const cBody = '#f59e0b';
    const rad = 14;
    // 頂点8個
    const corners = [
      [0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0],
      [0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]
    ];
    corners.forEach((p) => atoms.push({ name: 'Fe', color: cCorner, radius: rad, x: p[0], y: p[1], z: p[2] }));
    // 体心1個
    const bodyIdx = atoms.length;
    atoms.push({ name: 'Fe', color: cBody, radius: rad + 1, x: 0.5, y: 0.5, z: 0.5, isBody: true });
    // 体心から各頂点への対角線結合
    corners.forEach((_, i) => bonds.push([bodyIdx, i, 'dash']));
  } else if (t === 'fcc' || t === 'face_centered_cubic') {
    defaultTitle = '面心立方格子 (FCC: Cu, Al, Au, Ag)';
    const cCorner = '#0ea5e9';
    const cFace = '#ea580c';
    const rad = 14;
    // 頂点8個
    const corners = [
      [0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0],
      [0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]
    ];
    corners.forEach((p) => atoms.push({ name: 'Cu', color: cCorner, radius: rad, x: p[0], y: p[1], z: p[2] }));
    // 各面心6個
    const faces = [
      [0.5, 0.5, 0], // 底面
      [0.5, 0.5, 1], // 上面
      [0.5, 0, 0.5], // 前面
      [0.5, 1, 0.5], // 背面
      [0, 0.5, 0.5], // 左面
      [1, 0.5, 0.5]  // 右面
    ];
    faces.forEach((p) => atoms.push({ name: 'Cu', color: cFace, radius: rad, x: p[0], y: p[1], z: p[2], isFace: true }));
  } else if (t === 'nacl' || t === 'rocksalt') {
    defaultTitle = '塩化ナトリウム型構造 (NaCl / 岩塩型)';
    const cNa = '#818cf8'; // Na+ (小)
    const cCl = '#10b981'; // Cl- (大)
    const rNa = 11;
    const rCl = 16;
    // Na: 頂点(8) + 面心(6) = FCC配置
    const naPos = [
      [0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0],
      [0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1],
      [0.5, 0.5, 0], [0.5, 0.5, 1], [0.5, 0, 0.5],
      [0.5, 1, 0.5], [0, 0.5, 0.5], [1, 0.5, 0.5]
    ];
    naPos.forEach((p) => atoms.push({ name: 'Na⁺', color: cNa, radius: rNa, x: p[0], y: p[1], z: p[2] }));

    // Cl: 稜心(12) + 体心(1)
    const clPos = [
      [0.5, 0, 0], [0, 0.5, 0], [0.5, 1, 0], [1, 0.5, 0],
      [0.5, 0, 1], [0, 0.5, 1], [0.5, 1, 1], [1, 0.5, 1],
      [0, 0, 0.5], [1, 0, 0.5], [0, 1, 0.5], [1, 1, 0.5],
      [0.5, 0.5, 0.5]
    ];
    clPos.forEach((p) => atoms.push({ name: 'Cl⁻', color: cCl, radius: rCl, x: p[0], y: p[1], z: p[2] }));
  } else if (t === 'cscl') {
    defaultTitle = '塩化セシウム型構造 (CsCl)';
    const cCs = '#6366f1';
    const cCl = '#10b981';
    const corners = [
      [0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0],
      [0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]
    ];
    corners.forEach((p) => atoms.push({ name: 'Cl⁻', color: cCl, radius: 15, x: p[0], y: p[1], z: p[2] }));
    const bodyIdx = atoms.length;
    atoms.push({ name: 'Cs⁺', color: cCs, radius: 18, x: 0.5, y: 0.5, z: 0.5 });
    corners.forEach((_, i) => bonds.push([bodyIdx, i, 'dash']));
  } else if (t === 'diamond') {
    defaultTitle = 'ダイヤモンド構造 (Diamond / Si, Ge)';
    const cC = '#475569';
    const rad = 13;
    // FCC骨格
    const fccPos = [
      [0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0],
      [0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1],
      [0.5, 0.5, 0], [0.5, 0.5, 1], [0.5, 0, 0.5],
      [0.5, 1, 0.5], [0, 0.5, 0.5], [1, 0.5, 0.5]
    ];
    fccPos.forEach((p) => atoms.push({ name: 'C', color: cC, radius: rad, x: p[0], y: p[1], z: p[2] }));
    // 内部四面体位置 (1/4, 1/4, 1/4) 系 4原子
    const tetraPos = [
      [0.25, 0.25, 0.25],
      [0.75, 0.75, 0.25],
      [0.75, 0.25, 0.75],
      [0.25, 0.75, 0.75]
    ];
    tetraPos.forEach((p) => atoms.push({ name: 'C', color: '#0284c7', radius: rad, x: p[0], y: p[1], z: p[2], isTetra: true }));
  } else if (t === 'perovskite') {
    defaultTitle = 'ペロブスカイト型構造 (Perovskite: CaTiO₃ / BaTiO₃)';
    const cA = '#10b981'; // Ca/Ba 頂点
    const cB = '#ec4899'; // Ti 体心
    const cO = '#ef4444'; // O 面心
    // 頂点 A
    const corners = [
      [0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0],
      [0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]
    ];
    corners.forEach((p) => atoms.push({ name: 'Ba²⁺', color: cA, radius: 16, x: p[0], y: p[1], z: p[2] }));
    // 体心 B
    atoms.push({ name: 'Ti⁴⁺', color: cB, radius: 12, x: 0.5, y: 0.5, z: 0.5 });
    // 面心 O (6個)
    const faces = [
      [0.5, 0.5, 0], [0.5, 0.5, 1],
      [0.5, 0, 0.5], [0.5, 1, 0.5],
      [0, 0.5, 0.5], [1, 0.5, 0.5]
    ];
    faces.forEach((p) => atoms.push({ name: 'O²⁻', color: cO, radius: 14, x: p[0], y: p[1], z: p[2] }));
  } else if (t === 'hcp') {
    defaultTitle = '六方最密構造 (HCP: Mg, Zn, Ti)';
    unitCellBounds = { x: 1, y: 1, z: 1.633 }; // c/a = 1.633
    const cAtom = '#06b6d4';
    const rad = 14;
    // 底面正六角形 + 中心
    const hexAngles = [0, 60, 120, 180, 240, 300];
    const rHex = 0.5;
    const addHexLayer = (zLevel) => {
      atoms.push({ name: 'Mg', color: cAtom, radius: rad, x: 0.5, y: 0.5, z: zLevel });
      hexAngles.forEach((deg) => {
        const radAng = (deg * Math.PI) / 180;
        atoms.push({
          name: 'Mg',
          color: cAtom,
          radius: rad,
          x: 0.5 + rHex * Math.cos(radAng),
          y: 0.5 + rHex * Math.sin(radAng),
          z: zLevel
        });
      });
    };
    addHexLayer(0); // 底面
    addHexLayer(1.633); // 上面
    // 中間層 (3原子の三角形)
    const midZ = 1.633 / 2;
    const midTriAngles = [30, 150, 270];
    midTriAngles.forEach((deg) => {
      const radAng = (deg * Math.PI) / 180;
      atoms.push({
        name: 'Mg',
        color: '#f59e0b',
        radius: rad,
        x: 0.5 + (rHex * 0.58) * Math.cos(radAng),
        y: 0.5 + (rHex * 0.58) * Math.sin(radAng),
        z: midZ
      });
    });
  } else {
    // デフォルト FCC
    defaultTitle = '面心立方格子 (FCC)';
    const corners = [
      [0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0],
      [0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]
    ];
    corners.forEach((p) => atoms.push({ name: 'Atom', color: '#0ea5e9', radius: 14, x: p[0], y: p[1], z: p[2] }));
    const faces = [
      [0.5, 0.5, 0], [0.5, 0.5, 1], [0.5, 0, 0.5],
      [0.5, 1, 0.5], [0, 0.5, 0.5], [1, 0.5, 0.5]
    ];
    faces.forEach((p) => atoms.push({ name: 'Atom', color: '#ea580c', radius: 14, x: p[0], y: p[1], z: p[2] }));
  }

  return {
    is2D,
    atoms,
    bonds,
    unitCellBounds,
    title: parsed.title || defaultTitle
  };
}

// ==========================================
// SVG レンダリングメイン関数
// ==========================================
function drawCrystalSvg(text, container, label) {
  if (!container) return;
  container.innerHTML = '';

  const parsed = parseCrystalText(text);
  if (!parsed) {
    container.innerHTML = '<div style="color:#ef4444;padding:12px;">構文エラー: 結晶構造の定義が見つかりません。</div>';
    return;
  }

  // 充填・スライスカットモデル（1/8個, 1/2個, 1/6個, 1個分割モデル）の描画
  if (parsed.mode === 'slice') {
    renderCrystalSliceModel(container, parsed, label);
    return;
  }

  const model = getCrystalModelData(parsed);

  const width = 640;
  const height = 460;
  container.dataset.baseWidth = width;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.style.maxWidth = '100%';
  svg.style.height = 'auto';
  svg.style.display = 'block';

  // 背景用グラデーション定義と球体ハイライト用放射状グラデーション
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  defs.innerHTML = `
    <!-- 格子面ハイライト用パターン -->
    <pattern id="crystal-plane-pattern" width="10" height="10" patternUnits="userSpaceOnUse">
      <path d="M 0 10 L 10 0 M 0 0 L 10 10" stroke="#f43f5e" stroke-width="0.8" stroke-opacity="0.35" />
    </pattern>
    <filter id="atom-shadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="2" dy="4" stdDeviation="3" flood-opacity="0.25" flood-color="#0f172a" />
    </filter>
  `;
  svg.appendChild(defs);

  // 固有色の球体グラデーションを動的に作成
  const sphereGradients = new Map();
  const getOrCreateSphereGrad = (hexColor) => {
    if (sphereGradients.has(hexColor)) return sphereGradients.get(hexColor);
    const gradId = 'grad-' + hexColor.replace(/[^a-zA-Z0-9]/g, '');
    const radGrad = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
    radGrad.setAttribute('id', gradId);
    radGrad.setAttribute('cx', '35%');
    radGrad.setAttribute('cy', '35%');
    radGrad.setAttribute('r', '65%');
    radGrad.innerHTML = `
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.85" />
      <stop offset="40%" stop-color="${hexColor}" stop-opacity="1" />
      <stop offset="100%" stop-color="#0f172a" stop-opacity="0.9" />
    `;
    defs.appendChild(radGrad);
    sphereGradients.set(hexColor, gradId);
    return gradId;
  };

  // 背景描画（わずかに柔らかなグリッド・カード背景）
  const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  bg.setAttribute('width', width);
  bg.setAttribute('height', height);
  bg.setAttribute('rx', '10');
  bg.setAttribute('fill', '#ffffff');
  svg.appendChild(bg);

  // タイトル表示
  if (model.title) {
    const titleText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    titleText.setAttribute('x', '24');
    titleText.setAttribute('y', '32');
    titleText.setAttribute('fill', '#1e293b');
    titleText.setAttribute('font-size', '15');
    titleText.setAttribute('font-weight', '700');
    titleText.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
    titleText.textContent = model.title;
    svg.appendChild(titleText);
  }

  const mainGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  svg.appendChild(mainGroup);

  // -------------------------------------------------------------------
  // A. 2D 格子レンダリング
  // -------------------------------------------------------------------
  if (model.is2D) {
    // センタリング計算
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    model.atoms.forEach((a) => {
      minX = Math.min(minX, a.x);
      maxX = Math.max(maxX, a.x);
      minY = Math.min(minY, a.y);
      maxY = Math.max(maxY, a.y);
    });
    const gw = maxX - minX || 1;
    const gh = maxY - minY || 1;
    const scale = Math.min((width - 120) / gw, (height - 120) / gh, 1.2);
    const offsetX = (width - gw * scale) / 2 - minX * scale;
    const offsetY = (height - gh * scale) / 2 - minY * scale + 15;

    // 結合線 (Bonds)
    model.bonds.forEach(([i, j]) => {
      const a1 = model.atoms[i];
      const a2 = model.atoms[j];
      if (!a1 || !a2) return;
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', a1.x * scale + offsetX);
      line.setAttribute('y1', a1.y * scale + offsetY);
      line.setAttribute('x2', a2.x * scale + offsetX);
      line.setAttribute('y2', a2.y * scale + offsetY);
      line.setAttribute('stroke', '#cbd5e1');
      line.setAttribute('stroke-width', '3');
      line.setAttribute('stroke-linecap', 'round');
      mainGroup.appendChild(line);
    });

    // 原子ノード
    model.atoms.forEach((a) => {
      const cx = a.x * scale + offsetX;
      const cy = a.y * scale + offsetY;
      const gradId = getOrCreateSphereGrad(a.color);

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', cx);
      circle.setAttribute('cy', cy);
      circle.setAttribute('r', a.radius);
      circle.setAttribute('fill', `url(#${gradId})`);
      circle.setAttribute('filter', 'url(#atom-shadow)');
      mainGroup.appendChild(circle);

      // サブラティス名表示
      if (parsed.showLabels && a.sub) {
        const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        txt.setAttribute('x', cx);
        txt.setAttribute('y', cy + 3.5);
        txt.setAttribute('fill', '#ffffff');
        txt.setAttribute('font-size', '10');
        txt.setAttribute('font-weight', 'bold');
        txt.setAttribute('text-anchor', 'middle');
        txt.setAttribute('font-family', 'sans-serif');
        txt.textContent = a.sub;
        mainGroup.appendChild(txt);
      }
    });

    container.appendChild(svg);
    if (label) {
      const lbl = document.createElement('div');
      lbl.className = 'chem-structure-label';
      lbl.textContent = label;
      container.appendChild(lbl);
    }
    return;
  }

  // -------------------------------------------------------------------
  // B. 3D 単位胞・結晶格子レンダリング (斜め見下ろし立体投影)
  // -------------------------------------------------------------------
  const originX = width / 2;
  const originY = height / 2 + 25;
  const boxScale = 185;

  // 3D等角斜投影変換 (x: 右下, y: 左下, z: 真上)
  // 角度設定: ax=30度, ay=15度 で見栄え良く立体化
  const cos30 = Math.cos((25 * Math.PI) / 180);
  const sin30 = Math.sin((25 * Math.PI) / 180);
  const cos15 = Math.cos((18 * Math.PI) / 180);
  const sin15 = Math.sin((18 * Math.PI) / 180);

  const project3D = (x, y, z) => {
    // 中心を (0.5, 0.5, 0.5) として正規化
    const nx = (x - 0.5);
    const ny = (y - 0.5);
    const nz = (z - (model.unitCellBounds.z / 2));

    const screenX = originX + (nx * cos30 - ny * cos15) * boxScale;
    const screenY = originY + (nx * sin30 + ny * sin15) * boxScale - nz * boxScale * 0.95;
    const depth = nx * 0.5 + ny * 0.8 + nz * 1.0; // 手前ほど大

    return { x: screenX, y: screenY, depth };
  };

  // 1. 単位胞 (Unit Cell) ワイヤーフレーム枠線の描画
  if (parsed.showUnitCell) {
    const bz = model.unitCellBounds.z || 1.0;
    const boxVertices = [
      project3D(0, 0, 0), project3D(1, 0, 0), project3D(1, 1, 0), project3D(0, 1, 0),
      project3D(0, 0, bz), project3D(1, 0, bz), project3D(1, 1, bz), project3D(0, 1, bz)
    ];

    const boxEdges = [
      // 底面 4辺
      [0, 1], [1, 2], [2, 3], [3, 0],
      // 上面 4辺
      [4, 5], [5, 6], [6, 7], [7, 4],
      // 柱 4本
      [0, 4], [1, 5], [2, 6], [3, 7]
    ];

    boxEdges.forEach(([v1, v2]) => {
      const p1 = boxVertices[v1];
      const p2 = boxVertices[v2];
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', p1.x);
      line.setAttribute('y1', p1.y);
      line.setAttribute('x2', p2.x);
      line.setAttribute('y2', p2.y);
      line.setAttribute('stroke', '#94a3b8');
      line.setAttribute('stroke-width', '1.8');
      line.setAttribute('stroke-dasharray', (v1 === 0 && v2 === 3) || (v1 === 0 && v2 === 1) || (v1 === 0 && v2 === 4) ? '4 3' : 'none');
      line.setAttribute('stroke-opacity', '0.7');
      mainGroup.appendChild(line);
    });

    // 2. ミラー指数格子面の表示 (例: (1, 1, 1), (1, 0, 0))
    if (parsed.plane) {
      const [h, k, l] = parsed.plane;
      const pts = [];
      if (h !== 0) pts.push(project3D(1 / h, 0, 0));
      if (k !== 0) pts.push(project3D(0, 1 / k, 0));
      if (l !== 0) pts.push(project3D(0, 0, (1 / l) * bz));

      if (pts.length >= 3) {
        const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        poly.setAttribute('points', pts.map((p) => `${p.x},${p.y}`).join(' '));
        poly.setAttribute('fill', '#f43f5e');
        poly.setAttribute('fill-opacity', '0.28');
        poly.setAttribute('stroke', '#e11d48');
        poly.setAttribute('stroke-width', '2');
        mainGroup.appendChild(poly);

        // ミラー指数のラベル (h k l)
        const centroid = {
          x: (pts[0].x + pts[1].x + pts[2].x) / 3,
          y: (pts[0].y + pts[1].y + pts[2].y) / 3
        };
        const plabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        plabel.setAttribute('x', centroid.x);
        plabel.setAttribute('y', centroid.y - 6);
        plabel.setAttribute('fill', '#be123c');
        plabel.setAttribute('font-size', '12');
        plabel.setAttribute('font-weight', 'bold');
        plabel.setAttribute('text-anchor', 'middle');
        plabel.textContent = `(${h} ${k} ${l}) 面`;
        mainGroup.appendChild(plabel);
      }
    }
  }

  // 3. 内部結合線（対角線など）
  if (parsed.showBonds && model.bonds.length > 0) {
    model.bonds.forEach(([i, j, style]) => {
      const a1 = model.atoms[i];
      const a2 = model.atoms[j];
      if (!a1 || !a2) return;
      const p1 = project3D(a1.x, a1.y, a1.z);
      const p2 = project3D(a2.x, a2.y, a2.z);

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', p1.x);
      line.setAttribute('y1', p1.y);
      line.setAttribute('x2', p2.x);
      line.setAttribute('y2', p2.y);
      line.setAttribute('stroke', '#cbd5e1');
      line.setAttribute('stroke-width', style === 'dash' ? '1.5' : '2.5');
      if (style === 'dash') line.setAttribute('stroke-dasharray', '4 3');
      mainGroup.appendChild(line);
    });
  }

  // 4. 原子球を深度ソート (Painter's Algorithm: 奥から手前へ描画)
  const renderedAtoms = model.atoms.map((a, idx) => {
    const proj = project3D(a.x, a.y, a.z);
    return { ...a, proj, idx };
  });

  renderedAtoms.sort((a, b) => a.proj.depth - b.proj.depth);

  renderedAtoms.forEach((a) => {
    const cx = a.proj.x;
    const cy = a.proj.y;
    const gradId = getOrCreateSphereGrad(a.color);

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', cx);
    circle.setAttribute('cy', cy);
    circle.setAttribute('r', a.radius);
    circle.setAttribute('fill', `url(#${gradId})`);
    circle.setAttribute('filter', 'url(#atom-shadow)');
    mainGroup.appendChild(circle);

    // 元素記号などのラベル
    if (parsed.showLabels && a.name && a.name !== 'Atom' && a.name !== '•') {
      const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      txt.setAttribute('x', cx);
      txt.setAttribute('y', cy + 3.5);
      txt.setAttribute('fill', '#ffffff');
      txt.setAttribute('font-size', a.radius > 12 ? '10' : '8');
      txt.setAttribute('font-weight', 'bold');
      txt.setAttribute('text-anchor', 'middle');
      txt.setAttribute('font-family', 'sans-serif');
      txt.textContent = a.name;
      mainGroup.appendChild(txt);
    }
  });

  // 5. 格子軸インジケータ (x, y, z 矢印)
  if (parsed.showAxes) {
    const axesOrigin = { x: 50, y: height - 55 };
    const axisLen = 32;

    const drawAxis = (angleDeg, label, color) => {
      const rad = (angleDeg * Math.PI) / 180;
      const ex = axesOrigin.x + axisLen * Math.cos(rad);
      const ey = axesOrigin.y - axisLen * Math.sin(rad);

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', axesOrigin.x);
      line.setAttribute('y1', axesOrigin.y);
      line.setAttribute('x2', ex);
      line.setAttribute('y2', ey);
      line.setAttribute('stroke', color);
      line.setAttribute('stroke-width', '2.5');
      line.setAttribute('stroke-linecap', 'round');
      svg.appendChild(line);

      const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      txt.setAttribute('x', ex + 6 * Math.cos(rad));
      txt.setAttribute('y', ey - 4 * Math.sin(rad) + 4);
      txt.setAttribute('fill', color);
      txt.setAttribute('font-size', '11');
      txt.setAttribute('font-weight', 'bold');
      txt.setAttribute('font-family', 'sans-serif');
      txt.textContent = label;
      svg.appendChild(txt);
    };

    drawAxis(-25, 'a (x)', '#ef4444');
    drawAxis(195, 'b (y)', '#10b981');
    drawAxis(90, 'c (z)', '#3b82f6');
  }

  // 6. 凡例 (元素リスト)
  const uniqueSpecies = [];
  const speciesSet = new Set();
  model.atoms.forEach((a) => {
    if (a.name && !speciesSet.has(a.name) && a.name !== 'Atom' && a.name !== '•') {
      speciesSet.add(a.name);
      uniqueSpecies.push({ name: a.name, color: a.color });
    }
  });

  if (uniqueSpecies.length > 0) {
    const legendG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    let lx = width - 25;
    const ly = 32;
    uniqueSpecies.slice().reverse().forEach((sp) => {
      const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      t.setAttribute('x', lx);
      t.setAttribute('y', ly);
      t.setAttribute('fill', '#475569');
      t.setAttribute('font-size', '12');
      t.setAttribute('font-weight', '600');
      t.setAttribute('text-anchor', 'end');
      t.textContent = sp.name;
      legendG.appendChild(t);

      const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      c.setAttribute('cx', lx - sp.name.length * 8 - 12);
      c.setAttribute('cy', ly - 4);
      c.setAttribute('r', '6');
      c.setAttribute('fill', sp.color);
      legendG.appendChild(c);

      lx -= sp.name.length * 8 + 36;
    });
    svg.appendChild(legendG);
  }

  container.appendChild(svg);

  if (label) {
    const lbl = document.createElement('div');
    lbl.className = 'chem-structure-label';
    lbl.textContent = label;
    container.appendChild(lbl);
  }
}

// ==========================================
// 単位格子スライスカット・空間充填モデル描画エンジン (BCC, FCC, HCP)
// 参考図の立体イラスト調（太黒枠線＋ソリッドブロック充填スタイル）
// ==========================================
function renderCrystalSliceModel(container, parsed, label) {
  const width = 640;
  const height = 520;
  container.dataset.baseWidth = width;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.style.maxWidth = '100%';
  svg.style.height = 'auto';
  svg.style.display = 'block';

  const t = (parsed.type || 'fcc').toLowerCase();
  const isBcc = t.includes('bcc');
  const isHcp = t.includes('hcp');
  const isFcc = !isBcc && !isHcp;

  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  defs.innerHTML = `
    <!-- 白球ハイライトグラデーション (BCC中央完全球) -->
    <radialGradient id="bcc-center-sphere" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="60%" stop-color="#f1f5f9" />
      <stop offset="100%" stop-color="#cbd5e1" />
    </radialGradient>

    <!-- 水色球面シェーディング (BCC内側球面・FCC半球ドーム) -->
    <radialGradient id="slice-cyan-sphere" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="55%" stop-color="#0284c7" />
      <stop offset="100%" stop-color="#0369a1" />
    </radialGradient>

    <!-- 白角ブロック用シェーディング (FCC頂点球片) -->
    <radialGradient id="fcc-white-corner" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="65%" stop-color="#f8fafc" />
      <stop offset="100%" stop-color="#cbd5e1" />
    </radialGradient>

    <!-- メタリック球用グラデーション (HCP内部球) -->
    <radialGradient id="hcp-metal-sphere" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="45%" stop-color="#94a3b8" />
      <stop offset="100%" stop-color="#475569" />
    </radialGradient>

    <!-- 立体ドロップシャドウ -->
    <filter id="crystal-block-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="5" stdDeviation="5" flood-opacity="0.1" flood-color="#000000" />
    </filter>
  `;
  svg.appendChild(defs);

  // 背景
  const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  bg.setAttribute('width', width);
  bg.setAttribute('height', height);
  bg.setAttribute('rx', '10');
  bg.setAttribute('fill', '#ffffff');
  svg.appendChild(bg);

  // タイトル
  const defaultTitle = isBcc
    ? '体心立方格子 (BCC) 単位格子充填・分割モデル'
    : (isHcp ? '六方最密構造 (HCP) 充填・分割モデル' : '面心立方格子 (FCC) 単位格子充填・分割モデル');
  const titleText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  titleText.setAttribute('x', '24');
  titleText.setAttribute('y', '32');
  titleText.setAttribute('fill', '#0f172a');
  titleText.setAttribute('font-size', '16');
  titleText.setAttribute('font-weight', '800');
  titleText.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
  titleText.textContent = parsed.title || defaultTitle;
  svg.appendChild(titleText);

  const mainG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  mainG.setAttribute('filter', 'url(#crystal-block-shadow)');
  svg.appendChild(mainG);

  // ===================================================================
  // 1. 体心立方格子 (BCC: 画像2の完全再現)
  // ===================================================================
  if (isBcc) {
    const ox = width / 2 - 20;
    const oy = 225;
    const L = 195;
    const ang = (26 * Math.PI) / 180;
    const cosA = Math.cos(ang);
    const sinA = Math.sin(ang);

    // 射影関数 (-1〜+1)
    const p = (x, y, z) => ({
      x: ox + (x - y) * cosA * (L * 0.48),
      y: oy + (x + y) * sinA * (L * 0.48) - z * (L * 0.52)
    });

    const cyanFlat = '#00a2ea';
    const cyanCurve = '#0070ba';
    const strokeW = '3.2';

    // (A) 奥側の1/8球ブロックの丸み（奥上、奥下）
    const pBackTop = p(-1, -1, 1);
    const backArc1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    backArc1.setAttribute('cx', pBackTop.x + 20);
    backArc1.setAttribute('cy', pBackTop.y + 25);
    backArc1.setAttribute('r', '40');
    backArc1.setAttribute('fill', cyanCurve);
    backArc1.setAttribute('stroke', '#000000');
    backArc1.setAttribute('stroke-width', strokeW);
    mainG.appendChild(backArc1);

    // (B) 中央の巨大な完全球（白球）
    const centerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    centerCircle.setAttribute('cx', ox);
    centerCircle.setAttribute('cy', oy);
    centerCircle.setAttribute('r', '84');
    centerCircle.setAttribute('fill', 'url(#bcc-center-sphere)');
    centerCircle.setAttribute('stroke', '#000000');
    centerCircle.setAttribute('stroke-width', '3.5');
    mainG.appendChild(centerCircle);

    // 中心の「1 個」ラベル
    const centerText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    centerText.setAttribute('x', ox);
    centerText.setAttribute('y', oy + 8);
    centerText.setAttribute('fill', '#0f172a');
    centerText.setAttribute('font-size', '20');
    centerText.setAttribute('font-weight', '900');
    centerText.setAttribute('text-anchor', 'middle');
    centerText.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
    centerText.textContent = '1 個';
    mainG.appendChild(centerText);

    // (C) 8箇所の水色 1/8球ブロック（手前・上面・側面）
    const drawBccCorner = (x, y, z, config) => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      const cp = p(x, y, z);
      const signX = x >= 0 ? 1 : -1;
      const signY = y >= 0 ? 1 : -1;
      const signZ = z >= 0 ? 1 : -1;

      const vx = { x: cosA * 55 * signX, y: sinA * 55 * signX };
      const vy = { x: -cosA * 55 * signY, y: sinA * 55 * signY };
      const vz = { x: 0, y: -58 * signZ };

      // 内側の球面曲面（ドーム）
      if (config.hasDome) {
        const dome = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const d1 = { x: cp.x - vx.x * 0.9, y: cp.y - vx.y * 0.9 };
        const d2 = { x: cp.x - vy.x * 0.9, y: cp.y - vy.y * 0.9 };
        const dMid = { x: cp.x - (vx.x + vy.x) * 0.6, y: cp.y - (vx.y + vy.y) * 0.6 - vz.y * 0.4 };
        dome.setAttribute('d', `M ${d1.x} ${d1.y} Q ${dMid.x} ${dMid.y} ${d2.x} ${d2.y} L ${cp.x} ${cp.y} Z`);
        dome.setAttribute('fill', cyanCurve);
        dome.setAttribute('stroke', '#000000');
        dome.setAttribute('stroke-width', strokeW);
        dome.setAttribute('stroke-linejoin', 'round');
        g.appendChild(dome);
      }

      // 上面平坦扇形
      if (config.top) {
        const topFace = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const p1 = { x: cp.x - vx.x, y: cp.y - vx.y };
        const p2 = { x: cp.x - vy.x, y: cp.y - vy.y };
        topFace.setAttribute('d', `M ${cp.x} ${cp.y} L ${p1.x} ${p1.y} Q ${cp.x - vx.x - vy.x * 0.7} ${cp.y - vx.y - vy.y * 0.7} ${p2.x} ${p2.y} Z`);
        topFace.setAttribute('fill', cyanFlat);
        topFace.setAttribute('stroke', '#000000');
        topFace.setAttribute('stroke-width', strokeW);
        topFace.setAttribute('stroke-linejoin', 'round');
        g.appendChild(topFace);
      }

      // 左前面平坦扇形
      if (config.left) {
        const leftFace = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const p1 = { x: cp.x - vx.x, y: cp.y - vx.y };
        const p2 = { x: cp.x - vz.x, y: cp.y - vz.y };
        leftFace.setAttribute('d', `M ${cp.x} ${cp.y} L ${p1.x} ${p1.y} Q ${cp.x - vx.x} ${cp.y - vx.y - vz.y * 0.7} ${p2.x} ${p2.y} Z`);
        leftFace.setAttribute('fill', cyanFlat);
        leftFace.setAttribute('stroke', '#000000');
        leftFace.setAttribute('stroke-width', strokeW);
        leftFace.setAttribute('stroke-linejoin', 'round');
        g.appendChild(leftFace);
      }

      // 右前面平坦扇形
      if (config.right) {
        const rightFace = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const p1 = { x: cp.x - vy.x, y: cp.y - vy.y };
        const p2 = { x: cp.x - vz.x, y: cp.y - vz.y };
        rightFace.setAttribute('d', `M ${cp.x} ${cp.y} L ${p1.x} ${p1.y} Q ${cp.x - vy.x} ${cp.y - vy.y - vz.y * 0.7} ${p2.x} ${p2.y} Z`);
        rightFace.setAttribute('fill', cyanFlat);
        rightFace.setAttribute('stroke', '#000000');
        rightFace.setAttribute('stroke-width', strokeW);
        rightFace.setAttribute('stroke-linejoin', 'round');
        g.appendChild(rightFace);
      }

      mainG.appendChild(g);
    };

    // 8隅の配置 (奥から手前へ Painter's order)
    drawBccCorner(-1, -1, 1, { top: true, hasDome: true });             // 奥上
    drawBccCorner(-1, 1, 1, { top: true, left: true, hasDome: true });   // 左上
    drawBccCorner(1, -1, 1, { top: true, right: true, hasDome: true });  // 右上
    drawBccCorner(-1, 1, -1, { left: true, hasDome: true });            // 左下
    drawBccCorner(1, -1, -1, { right: true, hasDome: true });           // 右下
    drawBccCorner(1, 1, -1, { left: true, right: true, hasDome: true }); // 手前下
    drawBccCorner(1, 1, 1, { top: true, left: true, right: true, hasDome: true }); // 最も手前上

    // (D) 注記リーダー線と「1/8 個」ラベル
    const pTopLeft = p(-1, 1, 1);
    const l1 = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    l1.setAttribute('points', `${pTopLeft.x - 10},${pTopLeft.y + 10} ${pTopLeft.x - 45},${pTopLeft.y + 10}`);
    l1.setAttribute('stroke', '#0284c7');
    l1.setAttribute('stroke-width', '2.2');
    l1.setAttribute('fill', 'none');
    mainG.appendChild(l1);

    const txt1 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    txt1.setAttribute('x', pTopLeft.x - 52);
    txt1.setAttribute('y', pTopLeft.y + 16);
    txt1.setAttribute('fill', '#0284c7');
    txt1.setAttribute('font-size', '17');
    txt1.setAttribute('font-weight', '900');
    txt1.setAttribute('text-anchor', 'end');
    txt1.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
    txt1.textContent = '1/8 個';
    mainG.appendChild(txt1);

  } else if (isFcc) {
    // ===================================================================
    // 2. 面心立方格子 (FCC: 画像3の完全再現)
    // ===================================================================
    const ox = width / 2 - 20;
    const oy = 225;
    const L = 195;
    const ang = (26 * Math.PI) / 180;
    const cosA = Math.cos(ang);
    const sinA = Math.sin(ang);

    const p = (x, y, z) => ({
      x: ox + (x - y) * cosA * (L * 0.48),
      y: oy + (x + y) * sinA * (L * 0.48) - z * (L * 0.52)
    });

    const cyanFace = '#00a2ea';
    const blueDome = '#006cb8';
    const whiteCorner = '#ffffff';
    const greyCurve = '#e2e8f0';
    const strokeW = '3.2';

    // (A) 奥側の面心半球のお椀ドーム（奥・底面）
    const pBackDome = p(-0.3, -0.3, 0);
    const bDome = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    bDome.setAttribute('cx', pBackDome.x);
    bDome.setAttribute('cy', pBackDome.y);
    bDome.setAttribute('rx', '45');
    bDome.setAttribute('ry', '30');
    bDome.setAttribute('fill', blueDome);
    bDome.setAttribute('stroke', '#000000');
    bDome.setAttribute('stroke-width', strokeW);
    mainG.appendChild(bDome);

    // (B) 8隅の白い1/8球ブロック（角ブロック）
    const drawFccWhiteCorner = (x, y, z, config) => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      const cp = p(x, y, z);
      const signX = x >= 0 ? 1 : -1;
      const signY = y >= 0 ? 1 : -1;
      const signZ = z >= 0 ? 1 : -1;

      const vx = { x: cosA * 45 * signX, y: sinA * 45 * signX };
      const vy = { x: -cosA * 45 * signY, y: sinA * 45 * signY };
      const vz = { x: 0, y: -48 * signZ };

      // 内側の丸い曲面
      if (config.hasDome) {
        const dome = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const d1 = { x: cp.x - vx.x * 0.85, y: cp.y - vx.y * 0.85 };
        const d2 = { x: cp.x - vy.x * 0.85, y: cp.y - vy.y * 0.85 };
        const dMid = { x: cp.x - (vx.x + vy.x) * 0.55, y: cp.y - (vx.y + vy.y) * 0.55 - vz.y * 0.35 };
        dome.setAttribute('d', `M ${d1.x} ${d1.y} Q ${dMid.x} ${dMid.y} ${d2.x} ${d2.y} L ${cp.x} ${cp.y} Z`);
        dome.setAttribute('fill', greyCurve);
        dome.setAttribute('stroke', '#000000');
        dome.setAttribute('stroke-width', strokeW);
        dome.setAttribute('stroke-linejoin', 'round');
        g.appendChild(dome);
      }

      // 上面平坦扇形
      if (config.top) {
        const topFace = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const p1 = { x: cp.x - vx.x, y: cp.y - vx.y };
        const p2 = { x: cp.x - vy.x, y: cp.y - vy.y };
        topFace.setAttribute('d', `M ${cp.x} ${cp.y} L ${p1.x} ${p1.y} Q ${cp.x - vx.x - vy.x * 0.65} ${cp.y - vx.y - vy.y * 0.65} ${p2.x} ${p2.y} Z`);
        topFace.setAttribute('fill', whiteCorner);
        topFace.setAttribute('stroke', '#000000');
        topFace.setAttribute('stroke-width', strokeW);
        topFace.setAttribute('stroke-linejoin', 'round');
        g.appendChild(topFace);
      }

      // 左前面扇形
      if (config.left) {
        const leftFace = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const p1 = { x: cp.x - vx.x, y: cp.y - vx.y };
        const p2 = { x: cp.x - vz.x, y: cp.y - vz.y };
        leftFace.setAttribute('d', `M ${cp.x} ${cp.y} L ${p1.x} ${p1.y} Q ${cp.x - vx.x} ${cp.y - vx.y - vz.y * 0.65} ${p2.x} ${p2.y} Z`);
        leftFace.setAttribute('fill', whiteCorner);
        leftFace.setAttribute('stroke', '#000000');
        leftFace.setAttribute('stroke-width', strokeW);
        leftFace.setAttribute('stroke-linejoin', 'round');
        g.appendChild(leftFace);
      }

      // 右前面扇形
      if (config.right) {
        const rightFace = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const p1 = { x: cp.x - vy.x, y: cp.y - vy.y };
        const p2 = { x: cp.x - vz.x, y: cp.y - vz.y };
        rightFace.setAttribute('d', `M ${cp.x} ${cp.y} L ${p1.x} ${p1.y} Q ${cp.x - vy.x} ${cp.y - vy.y - vz.y * 0.65} ${p2.x} ${p2.y} Z`);
        rightFace.setAttribute('fill', whiteCorner);
        rightFace.setAttribute('stroke', '#000000');
        rightFace.setAttribute('stroke-width', strokeW);
        rightFace.setAttribute('stroke-linejoin', 'round');
        g.appendChild(rightFace);
      }

      mainG.appendChild(g);
    };

    // 白ブロックの描画
    drawFccWhiteCorner(-1, -1, 1, { top: true, hasDome: true });
    drawFccWhiteCorner(-1, 1, 1, { top: true, left: true, hasDome: true });
    drawFccWhiteCorner(1, -1, 1, { top: true, right: true, hasDome: true });
    drawFccWhiteCorner(-1, 1, -1, { left: true, hasDome: true });
    drawFccWhiteCorner(1, -1, -1, { right: true, hasDome: true });
    drawFccWhiteCorner(1, 1, -1, { left: true, right: true, hasDome: true });
    drawFccWhiteCorner(1, 1, 1, { top: true, left: true, right: true, hasDome: true });

    // (C) 3面の面心半球（水色の大きな楕円切断面＋青いドーム）
    // 1. 上面心 (Z=1)
    const pFaceTop = p(0, 0, 1);
    const topDome = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    topDome.setAttribute('cx', pFaceTop.x);
    topDome.setAttribute('cy', pFaceTop.y + 16);
    topDome.setAttribute('rx', '66');
    topDome.setAttribute('ry', '34');
    topDome.setAttribute('fill', blueDome);
    topDome.setAttribute('stroke', '#000000');
    topDome.setAttribute('stroke-width', strokeW);
    mainG.appendChild(topDome);

    const topEllipse = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    topEllipse.setAttribute('cx', pFaceTop.x);
    topEllipse.setAttribute('cy', pFaceTop.y);
    topEllipse.setAttribute('rx', '66');
    topEllipse.setAttribute('ry', '30');
    topEllipse.setAttribute('fill', cyanFace);
    topEllipse.setAttribute('stroke', '#000000');
    topEllipse.setAttribute('stroke-width', strokeW);
    mainG.appendChild(topEllipse);

    // 2. 右前面心 (X=1)
    const pFaceRight = p(1, 0, 0);
    const rDome = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    rDome.setAttribute('cx', pFaceRight.x - 12);
    rDome.setAttribute('cy', pFaceRight.y);
    rDome.setAttribute('rx', '36');
    rDome.setAttribute('ry', '65');
    rDome.setAttribute('transform', `rotate(-22 ${pFaceRight.x - 12} ${pFaceRight.y})`);
    rDome.setAttribute('fill', blueDome);
    rDome.setAttribute('stroke', '#000000');
    rDome.setAttribute('stroke-width', strokeW);
    mainG.appendChild(rDome);

    const rEllipse = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    rEllipse.setAttribute('cx', pFaceRight.x);
    rEllipse.setAttribute('cy', pFaceRight.y);
    rEllipse.setAttribute('rx', '35');
    rEllipse.setAttribute('ry', '65');
    rEllipse.setAttribute('transform', `rotate(-22 ${pFaceRight.x} ${pFaceRight.y})`);
    rEllipse.setAttribute('fill', cyanFace);
    rEllipse.setAttribute('stroke', '#000000');
    rEllipse.setAttribute('stroke-width', strokeW);
    mainG.appendChild(rEllipse);

    // 3. 左前面心 (Y=1)
    const pFaceLeft = p(0, 1, 0);
    const lDome = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    lDome.setAttribute('cx', pFaceLeft.x + 12);
    lDome.setAttribute('cy', pFaceLeft.y);
    lDome.setAttribute('rx', '36');
    lDome.setAttribute('ry', '65');
    lDome.setAttribute('transform', `rotate(22 ${pFaceLeft.x + 12} ${pFaceLeft.y})`);
    lDome.setAttribute('fill', blueDome);
    lDome.setAttribute('stroke', '#000000');
    lDome.setAttribute('stroke-width', strokeW);
    mainG.appendChild(lDome);

    const lEllipse = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    lEllipse.setAttribute('cx', pFaceLeft.x);
    lEllipse.setAttribute('cy', pFaceLeft.y);
    lEllipse.setAttribute('rx', '35');
    lEllipse.setAttribute('ry', '65');
    lEllipse.setAttribute('transform', `rotate(22 ${pFaceLeft.x} ${pFaceLeft.y})`);
    lEllipse.setAttribute('fill', cyanFace);
    lEllipse.setAttribute('stroke', '#000000');
    lEllipse.setAttribute('stroke-width', strokeW);
    mainG.appendChild(lEllipse);

    // 左前面心の中央ラベル「1/2 個」
    const faceText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    faceText.setAttribute('x', pFaceLeft.x);
    faceText.setAttribute('y', pFaceLeft.y + 7);
    faceText.setAttribute('fill', '#0f172a');
    faceText.setAttribute('font-size', '19');
    faceText.setAttribute('font-weight', '900');
    faceText.setAttribute('text-anchor', 'middle');
    faceText.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
    faceText.textContent = '1/2 個';
    mainG.appendChild(faceText);

    // (D) 注記リーダー線と「1/8 個」ラベル
    const pTopLeft = p(-1, 1, 1);
    const l1 = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    l1.setAttribute('points', `${pTopLeft.x - 10},${pTopLeft.y + 10} ${pTopLeft.x - 45},${pTopLeft.y + 10}`);
    l1.setAttribute('stroke', '#c2410c');
    l1.setAttribute('stroke-width', '2.2');
    l1.setAttribute('fill', 'none');
    mainG.appendChild(l1);

    const txt1 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    txt1.setAttribute('x', pTopLeft.x - 52);
    txt1.setAttribute('y', pTopLeft.y + 16);
    txt1.setAttribute('fill', '#c2410c');
    txt1.setAttribute('font-size', '17');
    txt1.setAttribute('font-weight', '900');
    txt1.setAttribute('text-anchor', 'end');
    txt1.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
    txt1.textContent = '1/8 個';
    mainG.appendChild(txt1);

  } else {
    // ===================================================================
    // 3. 六方最密構造 (HCP: 画像4の完全再現)
    // ===================================================================
    const ox = width / 2 - 20;
    const oy = 215;
    const R_hex = 115;
    const H_hex = 210;

    const hexProj = (angleDeg, zFrac) => {
      const rad = (angleDeg * Math.PI) / 180;
      const rx = R_hex * Math.cos(rad);
      const ry = R_hex * Math.sin(rad) * 0.44;
      const zOffset = - (zFrac - 0.5) * H_hex;
      return { x: ox + rx, y: oy + ry + zOffset };
    };

    const angles = [0, 60, 120, 180, 240, 300];
    const topPts = angles.map((deg) => hexProj(deg, 1.0));
    const botPts = angles.map((deg) => hexProj(deg, 0.0));
    const pCenterTop = { x: ox, y: oy - H_hex * 0.5 };
    const pCenterBot = { x: ox, y: oy + H_hex * 0.5 };

    const strokeW = '3.2';

    // (A) 六角柱の底面と柱
    for (let i = 0; i < 6; i++) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', botPts[i].x);
      line.setAttribute('y1', botPts[i].y);
      line.setAttribute('x2', botPts[(i + 1) % 6].x);
      line.setAttribute('y2', botPts[(i + 1) % 6].y);
      line.setAttribute('stroke', '#000000');
      line.setAttribute('stroke-width', strokeW);
      mainG.appendChild(line);
    }
    for (let i = 0; i < 6; i++) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', botPts[i].x);
      line.setAttribute('y1', botPts[i].y);
      line.setAttribute('x2', topPts[i].x);
      line.setAttribute('y2', topPts[i].y);
      line.setAttribute('stroke', '#000000');
      line.setAttribute('stroke-width', strokeW);
      mainG.appendChild(line);
    }

    // (B) 側面の半球ブロック（円形スライス）
    const drawSideSphere = (p1, p2, zFrac) => {
      const cx = (p1.x + p2.x) / 2;
      const cy = (p1.y + p2.y) / 2 + (zFrac - 0.5) * -40;
      const ell = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
      ell.setAttribute('cx', cx);
      ell.setAttribute('cy', cy);
      ell.setAttribute('rx', '34');
      ell.setAttribute('ry', '42');
      ell.setAttribute('fill', '#94a3b8');
      ell.setAttribute('stroke', '#000000');
      ell.setAttribute('stroke-width', strokeW);
      mainG.appendChild(ell);
    };
    drawSideSphere(botPts[0], topPts[0], 0.5);
    drawSideSphere(botPts[5], topPts[5], 0.5);
    drawSideSphere(botPts[1], topPts[1], 0.5);

    // (C) 中間層内部球（完全球・メタリックグレー）
    const innerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    innerCircle.setAttribute('cx', ox - 14);
    innerCircle.setAttribute('cy', oy + 8);
    innerCircle.setAttribute('r', '46');
    innerCircle.setAttribute('fill', 'url(#hcp-metal-sphere)');
    innerCircle.setAttribute('stroke', '#000000');
    innerCircle.setAttribute('stroke-width', '3.5');
    mainG.appendChild(innerCircle);

    // (D) 上面六角形の枠と頂点スライス
    for (let i = 0; i < 6; i++) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', topPts[i].x);
      line.setAttribute('y1', topPts[i].y);
      line.setAttribute('x2', topPts[(i + 1) % 6].x);
      line.setAttribute('y2', topPts[(i + 1) % 6].y);
      line.setAttribute('stroke', '#000000');
      line.setAttribute('stroke-width', strokeW);
      mainG.appendChild(line);
    }

    // 上面中心の半球 (1/2個)
    const topCenterSphere = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    topCenterSphere.setAttribute('cx', pCenterTop.x);
    topCenterSphere.setAttribute('cy', pCenterTop.y);
    topCenterSphere.setAttribute('rx', '52');
    topCenterSphere.setAttribute('ry', '24');
    topCenterSphere.setAttribute('fill', '#e2e8f0');
    topCenterSphere.setAttribute('stroke', '#000000');
    topCenterSphere.setAttribute('stroke-width', strokeW);
    mainG.appendChild(topCenterSphere);

    // 6頂点の1/6球スライス
    topPts.forEach((pt) => {
      const sliceEl = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
      sliceEl.setAttribute('cx', pt.x);
      sliceEl.setAttribute('cy', pt.y);
      sliceEl.setAttribute('rx', '26');
      sliceEl.setAttribute('ry', '14');
      sliceEl.setAttribute('fill', '#f1f5f9');
      sliceEl.setAttribute('stroke', '#000000');
      sliceEl.setAttribute('stroke-width', strokeW);
      mainG.appendChild(sliceEl);
    });

    // (E) 画像4の最大の特徴：単位格子（菱形柱）の極太黒枠（幅 4.5px）
    const pRhombTop1 = pCenterTop;
    const pRhombTop2 = topPts[0];
    const pRhombTop3 = topPts[5];
    const pRhombTop4 = { x: topPts[0].x + (topPts[5].x - pCenterTop.x), y: topPts[0].y + (topPts[5].y - pCenterTop.y) };

    const pRhombBot1 = pCenterBot;
    const pRhombBot2 = botPts[0];
    const pRhombBot3 = botPts[5];
    const pRhombBot4 = { x: botPts[0].x + (botPts[5].x - pCenterBot.x), y: botPts[0].y + (botPts[5].y - pCenterBot.y) };

    const drawUnitCellEdge = (p1, p2, isDashed = false) => {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', p1.x);
      line.setAttribute('y1', p1.y);
      line.setAttribute('x2', p2.x);
      line.setAttribute('y2', p2.y);
      line.setAttribute('stroke', '#000000');
      line.setAttribute('stroke-width', '4.5');
      line.setAttribute('stroke-linecap', 'round');
      if (isDashed) line.setAttribute('stroke-dasharray', '6 5');
      mainG.appendChild(line);
    };

    // 上面ひし形
    drawUnitCellEdge(pRhombTop1, pRhombTop2);
    drawUnitCellEdge(pRhombTop2, pRhombTop4);
    drawUnitCellEdge(pRhombTop4, pRhombTop3);
    drawUnitCellEdge(pRhombTop3, pRhombTop1);

    // 4本の縦柱
    drawUnitCellEdge(pRhombTop1, pRhombBot1, true); // 奥の柱
    drawUnitCellEdge(pRhombTop2, pRhombBot2);
    drawUnitCellEdge(pRhombTop3, pRhombBot3);
    drawUnitCellEdge(pRhombTop4, pRhombBot4);

    // 下面ひし形
    drawUnitCellEdge(pRhombBot1, pRhombBot2, true);
    drawUnitCellEdge(pRhombBot1, pRhombBot3, true);
    drawUnitCellEdge(pRhombBot2, pRhombBot4);
    drawUnitCellEdge(pRhombBot3, pRhombBot4);

    // (F) 注記リーダー線とラベル
    // 1. 上面中心「1/2 個」
    const l1 = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    l1.setAttribute('points', `${pCenterTop.x + 24},${pCenterTop.y} ${pCenterTop.x + 80},${pCenterTop.y - 28} ${pCenterTop.x + 125},${pCenterTop.y - 28}`);
    l1.setAttribute('stroke', '#000000');
    l1.setAttribute('stroke-width', '2.2');
    l1.setAttribute('fill', 'none');
    mainG.appendChild(l1);

    const txt1 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    txt1.setAttribute('x', pCenterTop.x + 130);
    txt1.setAttribute('y', pCenterTop.y - 23);
    txt1.setAttribute('fill', '#0f172a');
    txt1.setAttribute('font-size', '17');
    txt1.setAttribute('font-weight', '900');
    txt1.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
    txt1.textContent = '1/2 個';
    mainG.appendChild(txt1);

    // 2. 頂点「1/6 個」
    const pCorner = topPts[0];
    const l2 = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    l2.setAttribute('points', `${pCorner.x + 10},${pCorner.y} ${pCorner.x + 45},${pCorner.y + 18} ${pCorner.x + 85},${pCorner.y + 18}`);
    l2.setAttribute('stroke', '#000000');
    l2.setAttribute('stroke-width', '2.2');
    l2.setAttribute('fill', 'none');
    mainG.appendChild(l2);

    const txt2 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    txt2.setAttribute('x', pCorner.x + 90);
    txt2.setAttribute('y', pCorner.y + 23);
    txt2.setAttribute('fill', '#0f172a');
    txt2.setAttribute('font-size', '17');
    txt2.setAttribute('font-weight', '900');
    txt2.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
    txt2.textContent = '1/6 個';
    mainG.appendChild(txt2);

    // 3. 内部「あわせて 1 個」
    const l3 = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    l3.setAttribute('points', `${ox - 4},${oy + 16} ${ox + 60},${oy + 48} ${ox + 120},${oy + 48}`);
    l3.setAttribute('stroke', '#000000');
    l3.setAttribute('stroke-width', '2.2');
    l3.setAttribute('fill', 'none');
    mainG.appendChild(l3);

    const txt3 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    txt3.setAttribute('x', ox + 126);
    txt3.setAttribute('y', oy + 53);
    txt3.setAttribute('fill', '#0f172a');
    txt3.setAttribute('font-size', '16');
    txt3.setAttribute('font-weight', '900');
    txt3.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
    txt3.textContent = 'あわせて 1 個 (単位格子換算)';
    mainG.appendChild(txt3);
  }

  // ===================================================================
  // 下部要約・公式解説カード
  // ===================================================================
  const cardY = height - 88;
  const cardW = width - 48;
  const cardH = 70;

  const cardRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  cardRect.setAttribute('x', '24');
  cardRect.setAttribute('y', cardY);
  cardRect.setAttribute('width', cardW);
  cardRect.setAttribute('height', cardH);
  cardRect.setAttribute('rx', '8');
  cardRect.setAttribute('fill', isBcc ? '#f0f9ff' : isFcc ? '#fff7ed' : '#f8fafc');
  cardRect.setAttribute('stroke', isBcc ? '#bae6fd' : isFcc ? '#fed7aa' : '#cbd5e1');
  cardRect.setAttribute('stroke-width', '1.6');
  svg.appendChild(cardRect);

  const summaryTitle = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  summaryTitle.setAttribute('x', '38');
  summaryTitle.setAttribute('y', cardY + 26);
  summaryTitle.setAttribute('fill', isBcc ? '#0284c7' : isFcc ? '#ea580c' : '#334155');
  summaryTitle.setAttribute('font-size', '13.5');
  summaryTitle.setAttribute('font-weight', 'bold');
  summaryTitle.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
  summaryTitle.textContent = isBcc
    ? '【単位格子内の原子数】 1/8 × 8 (頂点) ＋ 1 (体心) ＝ 2 個'
    : (isHcp
        ? '【単位格子内の原子数】 1/6 × 12 (頂点) ＋ 1/2 × 2 (面心) ＋ 1 (内部) ＝ 2 個 (六角柱全体: 6個)'
        : '【単位格子内の原子数】 1/8 × 8 (頂点) ＋ 1/2 × 6 (面心) ＝ 4 個');
  svg.appendChild(summaryTitle);

  const summarySub = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  summarySub.setAttribute('x', '38');
  summarySub.setAttribute('y', cardY + 50);
  summarySub.setAttribute('fill', '#475569');
  summarySub.setAttribute('font-size', '12');
  summarySub.setAttribute('font-weight', '600');
  summarySub.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
  summarySub.textContent = isBcc
    ? '・配位数: 8　・充填率: 約 68%　・代表例: α-Fe, Na, K, Cr, W (結晶半径 R = √3/4 a)'
    : (isHcp
        ? '・配位数: 12　・充填率: 約 74% (最密充填)　・代表例: Mg, Zn, Ti, Be'
        : '・配位数: 12　・充填率: 約 74% (最密充填)　・代表例: Cu, Al, Au, Ag, Ni (結晶半径 R = √2/4 a)');
  svg.appendChild(summarySub);

  container.appendChild(svg);
  if (label) {
    const lbl = document.createElement('div');
    lbl.className = 'chem-structure-label';
    lbl.textContent = label;
    container.appendChild(lbl);
  }
}
