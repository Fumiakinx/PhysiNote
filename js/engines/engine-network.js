// ==========================================
// PhysiNote ネットワーク構成図 (Network Topology) パーサー & SVG描画エンジン
// Cisco準拠トポロジ＋モノトーン線画＋リスク箇所のみカラー強調対応
// ==========================================

function parseNetworkText(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;
  const match = rawText.match(/\\(?:network|netdiag)\s*\{([\s\S]*)\}/i);
  const content = match ? match[1] : rawText;

  const lines = content.split('\n');
  let title = '';
  let theme = 'light';
  let direction = 'LR'; // 'LR' | 'TD' | 'GRID'
  let cols = 0;

  const zones = [];
  const zoneMap = new Map();
  const nodes = [];
  const nodeMap = new Map();
  const edges = [];
  const legendItems = [];

  let currentZoneId = null;
  let inLegend = false;

  const ensureZone = (id, label, style) => {
    const key = id.trim();
    if (!zoneMap.has(key)) {
      const z = { id: key, label: label || key, style: style || 'safe' };
      zoneMap.set(key, z);
      zones.push(z);
    } else if (label) {
      const existing = zoneMap.get(key);
      existing.label = label;
      if (style) existing.style = style;
    }
    return zoneMap.get(key);
  };

  const parseAttrs = (str) => {
    const attrs = { style: 'default', dashed: false, dotted: false, wifi: false, lan: false, badge: '', bus: false };
    if (!str) return attrs;
    const raw = str.trim();
    // badge: "..." を先に抽出
    const badgeM = raw.match(/badge\s*:\s*["']([^"']+)["']/i);
    if (badgeM) {
      attrs.badge = badgeM[1].trim();
    }
    const stripped = raw.replace(/badge\s*:\s*["'][^"']+["']/gi, '');
    stripped.split(/[\s,]+/).map((s) => s.trim().toLowerCase()).filter(Boolean).forEach((tok) => {
      if (tok === 'danger' || tok === 'vuln' || tok === 'cve' || tok === 'attack' || tok === 'critical') attrs.style = 'danger';
      else if (tok === 'warn' || tok === 'warning' || tok === 'update' || tok === 'outdated' || tok === 'dmz') attrs.style = 'warn';
      else if (tok === 'safe' || tok === 'patch' || tok === 'patched' || tok === 'ok' || tok === 'secure') attrs.style = 'safe';
      else if (tok === 'info' || tok === 'lan' && attrs.style === 'default' && !attrs.lan) attrs.style = 'info';
      if (tok === 'dashed' || tok === 'dash') attrs.dashed = true;
      if (tok === 'dotted' || tok === 'dot') attrs.dotted = true;
      if (tok === 'wifi' || tok === 'wireless') attrs.wifi = true;
      if (tok === 'lan' || tok === 'wired' || tok === 'cable') attrs.lan = true;
      if (tok === 'bus') attrs.bus = true;
    });
    return attrs;
  };

  const ensureImplicitNode = (id) => {
    const clean = id.trim();
    if (!nodeMap.has(clean)) {
      const n = {
        id: clean,
        type: 'desktop',
        label: clean,
        subLabel: '',
        style: 'default',
        badge: '',
        zoneId: currentZoneId,
        col: null,
        row: null
      };
      nodeMap.set(clean, n);
      nodes.push(n);
    }
    return nodeMap.get(clean);
  };

  const splitCsvRespectQuotes = (str) => {
    const res = [];
    let cur = '';
    let q = null;
    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      if (q) {
        cur += ch;
        if (ch === q && str[i - 1] !== '\\') q = null;
      } else if (ch === '"' || ch === "'") {
        q = ch;
        cur += ch;
      } else if (ch === ',') {
        res.push(cur.trim());
        cur = '';
      } else {
        cur += ch;
      }
    }
    if (cur.trim()) res.push(cur.trim());
    return res;
  };

  for (let rawLine of lines) {
    let line = rawLine.trim();
    if (!line || line.startsWith('//') || line.startsWith('#')) continue;

    // ゾーン閉じ括弧
    if (line === '}') {
      currentZoneId = null;
      inLegend = false;
      continue;
    }

    const lower = line.toLowerCase();
    if (lower === 'legend:' || lower === 'legend') {
      inLegend = true;
      continue;
    }

    if (inLegend) {
      const cleanLeg = line.replace(/^(?:-\s*|・\s*)/, '').trim();
      const attrM = cleanLeg.match(/\[([^\]]+)\]\s*$/);
      const attrs = attrM ? parseAttrs(attrM[1]) : parseAttrs('');
      const textPart = (attrM ? cleanLeg.slice(0, attrM.index) : cleanLeg).trim();
      const kindM = textPart.match(/^(arrow|line|dotted|wifi|box|zone|badge)\b\s*(.*)$/i);
      const kind = kindM ? kindM[1].toLowerCase() : 'line';
      const legLabel = (kindM ? kindM[2] : textPart).replace(/^["']|["']$/g, '').trim();
      if (legLabel) {
        legendItems.push({ kind, label: legLabel, ...attrs });
      }
      continue;
    }

    // メタ設定
    const metaM = line.match(/^(title|theme|direction|dir|layout|cols)\s*:\s*(.+)$/i);
    if (metaM && !line.includes('->') && !line.includes('<->') && !line.includes('--') && !line.includes('..')) {
      const k = metaM[1].toLowerCase();
      const v = metaM[2].trim().replace(/;$/, '').replace(/^["']|["']$/g, '').trim();
      if (k === 'title') title = v;
      else if (k === 'theme') theme = v.toLowerCase().includes('dark') ? 'dark' : 'light';
      else if (k === 'direction' || k === 'dir') direction = v.toUpperCase() === 'TD' ? 'TD' : 'LR';
      else if (k === 'layout') direction = v.toLowerCase().includes('grid') ? 'GRID' : (v.toUpperCase() === 'TD' ? 'TD' : 'LR');
      else if (k === 'cols') cols = parseInt(v, 10) || 0;
      continue;
    }

    // ゾーン定義: zone id: "ラベル" [safe|danger|warn] {?
    const zoneM = line.match(/^zone\s+([a-zA-Z0-9_-]+)\s*:\s*(.+)$/i);
    if (zoneM) {
      const zId = zoneM[1].trim();
      let rest = zoneM[2].trim();
      const opensBlock = rest.endsWith('{');
      if (opensBlock) rest = rest.slice(0, -1).trim();
      const attrM = rest.match(/\[([^\]]+)\]\s*$/);
      const attrs = attrM ? parseAttrs(attrM[1]) : { style: 'safe' };
      const labelStr = (attrM ? rest.slice(0, attrM.index) : rest).trim().replace(/^["']|["']$/g, '').replace(/\\n/g, '\n');
      ensureZone(zId, labelStr, attrs.style === 'default' ? 'safe' : attrs.style);
      if (opensBlock) currentZoneId = zId;
      continue;
    }

    // 接続定義: A -> B, A <-> B, A -- B, A .. B, A -(wifi)-> B, A -> [B, C]
    const edgeM = line.match(/^([a-zA-Z0-9_-]+)\s*(<->|<--|-->|->|--|\.\.|-\([a-zA-Z0-9_-]+\)->|-\([a-zA-Z0-9_-]+\)--)\s*(.+)$/);
    if (edgeM) {
      const fromId = edgeM[1].trim();
      const op = edgeM[2].trim();
      let rest = edgeM[3].trim().replace(/;$/, '');

      let attrs = parseAttrs('');
      const attrM = rest.match(/\[([^\]]+)\]\s*$/);
      // 末尾の [...] がノードリストではなく属性か判定（コロンの前後にターゲットがあるかで区別）
      const colonIdx = rest.indexOf(':');
      let targetsRaw = rest;
      let edgeLabel = '';
      if (colonIdx !== -1) {
        targetsRaw = rest.slice(0, colonIdx).trim();
        let labelAndAttr = rest.slice(colonIdx + 1).trim();
        const lAttrM = labelAndAttr.match(/\[([^\]]+)\]\s*$/);
        if (lAttrM) {
          attrs = parseAttrs(lAttrM[1]);
          labelAndAttr = labelAndAttr.slice(0, lAttrM.index).trim();
        }
        edgeLabel = labelAndAttr.replace(/^["']|["']$/g, '').replace(/\\n/g, '\n').trim();
      } else if (attrM && !targetsRaw.startsWith('[')) {
        attrs = parseAttrs(attrM[1]);
        targetsRaw = rest.slice(0, attrM.index).trim();
      }

      if (op.includes('..')) attrs.dotted = true;
      const midTagM = op.match(/-\(([a-zA-Z0-9_-]+)\)-/);
      if (midTagM) {
        const tag = midTagM[1].toLowerCase();
        if (tag === 'wifi') attrs.wifi = true;
        if (tag === 'lan') attrs.lan = true;
        if (tag === 'dotted') attrs.dotted = true;
        if (tag === 'dashed') attrs.dashed = true;
      }

      const arrowDir = op === '<->' ? 'both' : (op.includes('>') ? 'forward' : (op.includes('<') ? 'back' : 'none'));

      // ターゲット複数指定 [b, c, d] または単一 b
      let targetIds = [];
      const multiM = targetsRaw.match(/^\[([^\]]+)\]$/);
      if (multiM) {
        targetIds = multiM[1].split(',').map((s) => s.trim()).filter(Boolean);
        attrs.bus = targetIds.length > 1;
      } else {
        targetIds = [targetsRaw.trim()];
      }

      ensureImplicitNode(fromId);
      targetIds.forEach((tId) => {
        ensureImplicitNode(tId);
        edges.push({
          from: fromId,
          to: tId,
          arrow: arrowDir,
          label: edgeLabel,
          ...attrs
        });
      });
      continue;
    }

    // ノード定義: (node )?id: type, "Label", "Sub" @(col,row) (in: zoneId) [attrs]
    const nodeM = line.match(/^(?:node\s+)?([a-zA-Z0-9_-]+)\s*:\s*(.+)$/i);
    if (nodeM) {
      const id = nodeM[1].trim();
      let rest = nodeM[2].trim().replace(/;$/, '');

      let zoneId = currentZoneId;
      const inM = rest.match(/\(\s*in\s*:\s*([a-zA-Z0-9_-]+)\s*\)/i);
      if (inM) {
        zoneId = inM[1].trim();
        rest = rest.replace(inM[0], '').trim();
      }

      let col = null;
      let row = null;
      const posM = rest.match(/@\(\s*(\d+)\s*,\s*(\d+)\s*\)/);
      if (posM) {
        col = parseInt(posM[1], 10);
        row = parseInt(posM[2], 10);
        rest = rest.replace(posM[0], '').trim();
      }

      let attrs = parseAttrs('');
      const attrM = rest.match(/\[([^\]]+)\]\s*$/);
      if (attrM) {
        attrs = parseAttrs(attrM[1]);
        rest = rest.slice(0, attrM.index).trim();
      }

      const parts = splitCsvRespectQuotes(rest);
      const type = (parts[0] || 'desktop').toLowerCase().replace(/^["']|["']$/g, '').trim();
      const label = (parts[1] || id).replace(/^["']|["']$/g, '').replace(/\\n/g, '\n').trim();
      const subLabel = (parts[2] || '').replace(/^["']|["']$/g, '').replace(/\\n/g, '\n').trim();

      const nodeObj = {
        id,
        type,
        label,
        subLabel,
        style: attrs.style,
        badge: attrs.badge,
        zoneId,
        col,
        row
      };

      if (nodeMap.has(id)) {
        Object.assign(nodeMap.get(id), nodeObj);
      } else {
        nodeMap.set(id, nodeObj);
        nodes.push(nodeObj);
      }
      continue;
    }
  }

  return { title, theme, direction, cols, zones, nodes, edges, legendItems };
}

// ==========================================
// Cisco準拠＋モノトーン統一 ベクターアイコン描画
// （viewBox空間: 0..48 x 0..48 基準）
// ==========================================
function renderNetworkIconGlyph(type, strokeColor, fillBg, accentFill, svgNS) {
  const g = document.createElementNS(svgNS, 'g');
  const add = (tag, attrs) => {
    const el = document.createElementNS(svgNS, tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, String(v)));
    g.appendChild(el);
    return el;
  };

  const baseStroke = {
    stroke: strokeColor,
    'stroke-width': '1.8',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round'
  };

  const normType = String(type || 'desktop').toLowerCase().replace(/[\s_-]/g, '');

  switch (normType) {
    // Cisco Router: 円柱に4方向矢印
    case 'router': {
      add('path', { d: 'M8,16 L8,33 A16,6 0 0,0 40,33 L40,16 Z', fill: fillBg, ...baseStroke });
      add('ellipse', { cx: 24, cy: 16, rx: 16, ry: 6, fill: accentFill, ...baseStroke });
      // 上面の4方向矢印（イン/アウト対角）
      add('path', { d: 'M15,13 L21,15 M21,15 L17,15.8 M21,15 L19.5,12.5', fill: 'none', ...baseStroke, 'stroke-width': '1.5' });
      add('path', { d: 'M33,19 L27,17 M27,17 L31,16.2 M27,17 L28.5,19.5', fill: 'none', ...baseStroke, 'stroke-width': '1.5' });
      add('path', { d: 'M15,19 L21,17 M21,17 L19.5,19.5 M21,17 L17,16.2', fill: 'none', ...baseStroke, 'stroke-width': '1.5' });
      add('path', { d: 'M33,13 L27,15 M27,15 L28.5,12.5 M27,15 L31,15.8', fill: 'none', ...baseStroke, 'stroke-width': '1.5' });
      break;
    }

    // Cisco Switch / L2SW / Hub: 平たい箱に左右矢印
    case 'switch':
    case 'l2sw':
    case 'l2switch':
    case 'switchinghub':
    case 'hub': {
      add('polygon', { points: '5,22 13,14 43,14 35,22', fill: accentFill, ...baseStroke });
      add('rect', { x: 5, y: 22, width: 30, height: 12, rx: 1, fill: fillBg, ...baseStroke });
      add('polygon', { points: '35,22 43,14 43,26 35,34', fill: accentFill, ...baseStroke });
      // 上面の左右対向矢印
      add('path', { d: 'M13,17 L26,17 M23,15 L26,17 L23,19', fill: 'none', ...baseStroke, 'stroke-width': '1.5' });
      add('path', { d: 'M33,19.5 L19,19.5 M22,17.5 L19,19.5 L22,21.5', fill: 'none', ...baseStroke, 'stroke-width': '1.5' });
      // 前面ポートドット
      for (let px = 9; px <= 30; px += 4.5) {
        add('rect', { x: px, y: 26.5, width: 2.5, height: 3, fill: strokeColor });
      }
      break;
    }

    // Cisco L3 Switch: 平たい箱に交差4矢印
    case 'l3switch':
    case 'l3sw':
    case 'coreswitch': {
      add('polygon', { points: '5,22 13,13 43,13 35,22', fill: accentFill, ...baseStroke });
      add('rect', { x: 5, y: 22, width: 30, height: 13, rx: 1, fill: fillBg, ...baseStroke });
      add('polygon', { points: '35,22 43,13 43,26 35,35', fill: accentFill, ...baseStroke });
      add('circle', { cx: 24, cy: 17.5, r: 3.2, fill: fillBg, ...baseStroke, 'stroke-width': '1.4' });
      add('path', { d: 'M14,17.5 L20.5,17.5 M27.5,17.5 L34,17.5 M21,15 L24,13.5 L27,15 M21,20 L24,21.5 L27,20', fill: 'none', ...baseStroke, 'stroke-width': '1.4' });
      break;
    }

    // Cisco Firewall / UTM: レンガの壁
    case 'firewall':
    case 'fw':
    case 'utm': {
      add('rect', { x: 7, y: 12, width: 34, height: 24, rx: 2, fill: fillBg, ...baseStroke });
      // 横目地
      add('line', { x1: 7, y1: 20, x2: 41, y2: 20, ...baseStroke, 'stroke-width': '1.5' });
      add('line', { x1: 7, y1: 28, x2: 41, y2: 28, ...baseStroke, 'stroke-width': '1.5' });
      // 縦目地（千鳥配列）
      add('line', { x1: 18, y1: 12, x2: 18, y2: 20, ...baseStroke, 'stroke-width': '1.5' });
      add('line', { x1: 30, y1: 12, x2: 30, y2: 20, ...baseStroke, 'stroke-width': '1.5' });
      add('line', { x1: 13, y1: 20, x2: 13, y2: 28, ...baseStroke, 'stroke-width': '1.5' });
      add('line', { x1: 24, y1: 20, x2: 24, y2: 28, ...baseStroke, 'stroke-width': '1.5' });
      add('line', { x1: 35, y1: 20, x2: 35, y2: 28, ...baseStroke, 'stroke-width': '1.5' });
      add('line', { x1: 18, y1: 28, x2: 18, y2: 36, ...baseStroke, 'stroke-width': '1.5' });
      add('line', { x1: 30, y1: 28, x2: 30, y2: 36, ...baseStroke, 'stroke-width': '1.5' });
      if (normType === 'utm') {
        add('path', { d: 'M32,26 L40,26 L40,32 C40,36 36,39 36,39 C36,39 32,36 32,32 Z', fill: fillBg, ...baseStroke, 'stroke-width': '1.6' });
      }
      break;
    }

    // 無線LAN親機 / アクセスポイント
    case 'ap':
    case 'wifiap':
    case 'wireless':
    case 'wificonnect': {
      add('rect', { x: 10, y: 27, width: 28, height: 10, rx: 3, fill: fillBg, ...baseStroke });
      add('circle', { cx: 16, cy: 32, r: 1.4, fill: strokeColor });
      add('circle', { cx: 21, cy: 32, r: 1.4, fill: strokeColor });
      add('path', { d: 'M13,18 A15,15 0 0,1 35,18', fill: 'none', ...baseStroke });
      add('path', { d: 'M17,21.5 A9.5,9.5 0 0,1 31,21.5', fill: 'none', ...baseStroke });
      add('circle', { cx: 24, cy: 24.5, r: 1.5, fill: strokeColor });
      break;
    }

    // ONU / モデム
    case 'onu':
    case 'modem':
    case 'hgw': {
      add('rect', { x: 8, y: 24, width: 32, height: 13, rx: 2, fill: fillBg, ...baseStroke });
      add('line', { x1: 34, y1: 24, x2: 34, y2: 10, ...baseStroke });
      add('circle', { cx: 34, cy: 9.5, r: 1.8, fill: strokeColor });
      add('circle', { cx: 14, cy: 30.5, r: 1.3, fill: strokeColor });
      add('circle', { cx: 19, cy: 30.5, r: 1.3, fill: strokeColor });
      add('circle', { cx: 24, cy: 30.5, r: 1.3, fill: strokeColor });
      add('rect', { x: 29, y: 28.5, width: 7, height: 4, rx: 0.8, fill: accentFill, ...baseStroke, 'stroke-width': '1.4' });
      break;
    }

    // VPN ゲートウェイ
    case 'vpn':
    case 'gateway': {
      add('rect', { x: 9, y: 20, width: 30, height: 18, rx: 3, fill: fillBg, ...baseStroke });
      add('path', { d: 'M17,20 L17,15 A7,7 0 0,1 31,15 L31,20', fill: 'none', ...baseStroke });
      add('circle', { cx: 24, cy: 27.5, r: 2.3, fill: strokeColor });
      add('line', { x1: 24, y1: 29.5, x2: 24, y2: 33.5, ...baseStroke });
      break;
    }

    // インターネット (地球儀)
    case 'internet':
    case 'wan':
    case 'globe': {
      add('circle', { cx: 24, cy: 24, r: 15, fill: fillBg, ...baseStroke });
      add('ellipse', { cx: 24, cy: 24, rx: 6.5, ry: 15, fill: 'none', ...baseStroke, 'stroke-width': '1.5' });
      add('line', { x1: 9, y1: 24, x2: 39, y2: 24, ...baseStroke, 'stroke-width': '1.5' });
      add('path', { d: 'M11.5,16.5 Q24,19.5 36.5,16.5', fill: 'none', ...baseStroke, 'stroke-width': '1.4' });
      add('path', { d: 'M11.5,31.5 Q24,28.5 36.5,31.5', fill: 'none', ...baseStroke, 'stroke-width': '1.4' });
      break;
    }

    // クラウド / 基盤
    case 'cloud':
    case 'infra': {
      add('path', {
        d: 'M14,34 L35,34 A7,7 0 0,0 36,20.2 A10,10 0 0,0 17,16 A8,8 0 0,0 14,34 Z',
        fill: fillBg,
        ...baseStroke
      });
      break;
    }

    // サーバー（タワー）
    case 'server': {
      add('rect', { x: 14, y: 7, width: 20, height: 34, rx: 2, fill: fillBg, ...baseStroke });
      add('line', { x1: 18, y1: 13, x2: 30, y2: 13, ...baseStroke, 'stroke-width': '1.6' });
      add('line', { x1: 18, y1: 18, x2: 30, y2: 18, ...baseStroke, 'stroke-width': '1.6' });
      add('line', { x1: 18, y1: 23, x2: 30, y2: 23, ...baseStroke, 'stroke-width': '1.6' });
      add('circle', { cx: 24, cy: 33, r: 2, fill: strokeColor });
      break;
    }

    // ラックマウントサーバー
    case 'rack':
    case 'rackserver': {
      [9, 19.5, 30].forEach((ry) => {
        add('rect', { x: 8, y: ry, width: 32, height: 8.5, rx: 1.5, fill: fillBg, ...baseStroke });
        add('circle', { cx: 13, cy: ry + 4.2, r: 1.3, fill: strokeColor });
        add('line', { x1: 19, y1: ry + 4.2, x2: 35, y2: ry + 4.2, ...baseStroke, 'stroke-width': '1.4' });
      });
      break;
    }

    // 仮想サーバー (VM)
    case 'vm':
    case 'virtualserver': {
      add('rect', { x: 9, y: 12, width: 22, height: 26, rx: 2, fill: fillBg, ...baseStroke });
      add('rect', { x: 17, y: 8, width: 22, height: 26, rx: 2, fill: accentFill, ...baseStroke, 'stroke-dasharray': '3 2' });
      add('line', { x1: 21, y1: 15, x2: 35, y2: 15, ...baseStroke, 'stroke-width': '1.5' });
      add('line', { x1: 21, y1: 20, x2: 35, y2: 20, ...baseStroke, 'stroke-width': '1.5' });
      add('circle', { cx: 28, cy: 27.5, r: 1.8, fill: strokeColor });
      break;
    }

    // データベース
    case 'db':
    case 'database': {
      add('path', { d: 'M12,13 L12,34 A12,4.5 0 0,0 36,34 L36,13 Z', fill: fillBg, ...baseStroke });
      add('ellipse', { cx: 24, cy: 13, rx: 12, ry: 4.5, fill: accentFill, ...baseStroke });
      add('path', { d: 'M12,20 A12,4.5 0 0,0 36,20', fill: 'none', ...baseStroke, 'stroke-width': '1.5' });
      add('path', { d: 'M12,27 A12,4.5 0 0,0 36,27', fill: 'none', ...baseStroke, 'stroke-width': '1.5' });
      break;
    }

    // NAS / ストレージ
    case 'nas':
    case 'storage': {
      add('rect', { x: 10, y: 11, width: 28, height: 26, rx: 2, fill: fillBg, ...baseStroke });
      [15, 20.5, 26, 31.5].forEach((bx) => {
        add('rect', { x: bx, y: 15, width: 3.5, height: 15, rx: 0.7, fill: accentFill, ...baseStroke, 'stroke-width': '1.3' });
      });
      add('circle', { cx: 16.5, cy: 33.5, r: 1.2, fill: strokeColor });
      break;
    }

    // UPS（無停電電源装置）
    case 'ups': {
      add('rect', { x: 13, y: 9, width: 22, height: 30, rx: 2, fill: fillBg, ...baseStroke });
      add('path', { d: 'M25.5,14 L20,23 L24.5,23 L22.5,31 L28.5,21 L24,21 Z', fill: strokeColor });
      add('line', { x1: 18, y1: 35, x2: 30, y2: 35, ...baseStroke, 'stroke-width': '1.5' });
      break;
    }

    // デスクトップPC
    case 'desktop':
    case 'pc':
    case 'workstation': {
      add('rect', { x: 7, y: 12, width: 24, height: 17, rx: 2, fill: fillBg, ...baseStroke });
      add('line', { x1: 19, y1: 29, x2: 19, y2: 34, ...baseStroke });
      add('line', { x1: 13, y1: 34, x2: 25, y2: 34, ...baseStroke });
      add('rect', { x: 33.5, y: 13, width: 8.5, height: 21, rx: 1.5, fill: accentFill, ...baseStroke });
      add('circle', { cx: 37.8, cy: 29, r: 1.3, fill: strokeColor });
      break;
    }

    // ノートPC
    case 'laptop':
    case 'notebook': {
      add('rect', { x: 11, y: 12, width: 26, height: 17, rx: 2, fill: fillBg, ...baseStroke });
      add('polygon', { points: '7,34 11,29 37,29 41,34', fill: accentFill, ...baseStroke });
      add('line', { x1: 19, y1: 32, x2: 29, y2: 32, ...baseStroke, 'stroke-width': '1.4' });
      break;
    }

    // タブレット
    case 'tablet': {
      add('rect', { x: 12, y: 8, width: 24, height: 32, rx: 3, fill: fillBg, ...baseStroke });
      add('rect', { x: 15, y: 12, width: 18, height: 22, rx: 1, fill: accentFill, ...baseStroke, 'stroke-width': '1.2' });
      add('circle', { cx: 24, cy: 37, r: 1.3, fill: strokeColor });
      break;
    }

    // スマートフォン
    case 'mobile':
    case 'smartphone':
    case 'phone': {
      add('rect', { x: 16, y: 8, width: 16, height: 32, rx: 3, fill: fillBg, ...baseStroke });
      add('line', { x1: 21.5, y1: 11.5, x2: 26.5, y2: 11.5, ...baseStroke, 'stroke-width': '1.4' });
      add('circle', { cx: 24, cy: 36.5, r: 1.3, fill: strokeColor });
      break;
    }

    // 監視カメラ
    case 'camera':
    case 'cctv': {
      add('polygon', { points: '10,16 32,12 35,23 13,27', fill: fillBg, ...baseStroke });
      add('line', { x1: 34, y1: 17, x2: 39, y2: 15.5, ...baseStroke });
      add('path', { d: 'M17,26.5 L17,34 L10,34', fill: 'none', ...baseStroke });
      add('circle', { cx: 39.5, cy: 15.5, r: 1.6, fill: strokeColor });
      break;
    }

    // プリンター
    case 'printer': {
      add('rect', { x: 14, y: 9, width: 20, height: 9, fill: accentFill, ...baseStroke });
      add('rect', { x: 8, y: 18, width: 32, height: 14, rx: 2, fill: fillBg, ...baseStroke });
      add('rect', { x: 14, y: 27, width: 20, height: 11, fill: fillBg, ...baseStroke });
      add('circle', { cx: 34, cy: 22, r: 1.3, fill: strokeColor });
      break;
    }

    // 脆弱性 / 攻撃者 / 警告アイコン単体
    case 'attacker':
    case 'hacker': {
      add('circle', { cx: 24, cy: 18, r: 7, fill: fillBg, ...baseStroke });
      add('path', { d: 'M11,38 C11,29 37,29 37,38 Z', fill: accentFill, ...baseStroke });
      add('path', { d: 'M18,17 L22,19 L26,19 L30,17', fill: 'none', ...baseStroke, 'stroke-width': '1.6' });
      break;
    }

    default: {
      add('rect', { x: 11, y: 11, width: 26, height: 26, rx: 4, fill: fillBg, ...baseStroke });
      add('circle', { cx: 24, cy: 24, r: 5, fill: accentFill, ...baseStroke });
      break;
    }
  }

  return g;
}

// ギザギザ危険エリア枠のSVGパス生成
function buildJaggedZonePath(x, y, w, h, tooth = 10) {
  const pts = [];
  const stepX = Math.max(12, Math.round(w / Math.max(6, Math.round(w / 18))));
  const stepY = Math.max(12, Math.round(h / Math.max(4, Math.round(h / 18))));
  // 上辺
  for (let cx = x; cx < x + w; cx += stepX) {
    const nx = Math.min(x + w, cx + stepX / 2);
    pts.push(`${cx},${y}`, `${nx},${y - tooth * 0.55}`);
  }
  pts.push(`${x + w},${y}`);
  // 右辺
  for (let cy = y; cy < y + h; cy += stepY) {
    const ny = Math.min(y + h, cy + stepY / 2);
    pts.push(`${x + w},${cy}`, `${x + w + tooth * 0.55},${ny}`);
  }
  pts.push(`${x + w},${y + h}`);
  // 下辺
  for (let cx = x + w; cx > x; cx -= stepX) {
    const nx = Math.max(x, cx - stepX / 2);
    pts.push(`${cx},${y + h}`, `${nx},${y + h + tooth * 0.55}`);
  }
  pts.push(`${x},${y + h}`);
  // 左辺
  for (let cy = y + h; cy > y; cy -= stepY) {
    const ny = Math.max(y, cy - stepY / 2);
    pts.push(`${x},${cy}`, `${x - tooth * 0.55},${ny}`);
  }
  return `M ${pts.join(' L ')} Z`;
}

// ==========================================
// ネットワーク構成図 メインSVG描画関数
// ==========================================
function drawNetworkSvg(rawCode, container, labelText) {
  if (!container) return;
  container.innerHTML = '';

  const parsed = parseNetworkText(rawCode);
  if (!parsed || parsed.nodes.length === 0) {
    container.innerHTML = '<div style="color:#ef4444;padding:12px;font-size:12px;">ネットワーク構成図の構文エラー</div>';
    return;
  }

  const isDark = parsed.theme === 'dark';
  const palette = {
    bg: isDark ? '#0b0f19' : '#ffffff',
    cardBg: isDark ? '#111827' : '#ffffff',
    cardBorder: isDark ? '#334155' : '#cbd5e1',
    iconStroke: isDark ? '#e2e8f0' : '#1e293b',
    iconFill: isDark ? '#1e293b' : '#ffffff',
    iconAccent: isDark ? '#334155' : '#f1f5f9',
    textMain: isDark ? '#f8fafc' : '#0f172a',
    textMuted: isDark ? '#94a3b8' : '#475569',
    line: isDark ? '#64748b' : '#475569',
    dangerStroke: isDark ? '#f87171' : '#dc2626',
    dangerBg: isDark ? '#450a0a' : '#fef2f2',
    dangerText: isDark ? '#fca5a5' : '#b91c1c',
    warnStroke: isDark ? '#fbbf24' : '#d97706',
    warnBg: isDark ? '#451a03' : '#fffbeb',
    warnText: isDark ? '#fde68a' : '#b45309',
    safeStroke: isDark ? '#34d399' : '#059669',
    safeBg: isDark ? 'rgba(6, 78, 59, 0.24)' : 'rgba(240, 253, 244, 0.65)',
    safeText: isDark ? '#6ee7b7' : '#047857',
    infoStroke: isDark ? '#60a5fa' : '#0284c7',
    infoBg: isDark ? 'rgba(12, 74, 110, 0.22)' : 'rgba(240, 249, 255, 0.65)'
  };

  const getStyleColors = (styleKey) => {
    switch (styleKey) {
      case 'danger':
        return { stroke: palette.dangerStroke, bg: palette.dangerBg, text: palette.dangerText, iconStroke: palette.dangerStroke };
      case 'warn':
        return { stroke: palette.warnStroke, bg: palette.warnBg, text: palette.warnText, iconStroke: palette.warnStroke };
      case 'safe':
        return { stroke: palette.safeStroke, bg: palette.safeBg, text: palette.safeText, iconStroke: palette.iconStroke };
      case 'info':
        return { stroke: palette.infoStroke, bg: palette.infoBg, text: palette.infoStroke, iconStroke: palette.iconStroke };
      default:
        return { stroke: palette.cardBorder, bg: palette.cardBg, text: palette.textMain, iconStroke: palette.iconStroke };
    }
  };

  const svgNS = 'http://www.w3.org/2000/svg';
  const nodes = parsed.nodes;
  const edges = parsed.edges;
  const zones = parsed.zones;

  const nodeById = new Map(nodes.map((n) => [n.id, n]));
  const nodeW = 138;
  const nodeH = 104;
  const colGap = 78;
  const rowGap = 28;
  const zonePadX = 22;
  const zonePadTop = 32;
  const zonePadBottom = 18;
  const zoneBandGap = 32;

  // 1. レイアウト座標 (col, row) 決定
  if (parsed.direction === 'GRID') {
    const gridCols = parsed.cols > 0 ? parsed.cols : Math.min(6, Math.max(3, Math.ceil(Math.sqrt(nodes.length * 1.4))));
    nodes.forEach((n, idx) => {
      if (n.col == null) n.col = idx % gridCols;
      if (n.row == null) n.row = Math.floor(idx / gridCols);
    });
  } else {
    // エッジに基づくトポロジカル階層算出
    const outAdj = new Map();
    const inDeg = new Map();
    nodes.forEach((n) => {
      outAdj.set(n.id, []);
      inDeg.set(n.id, 0);
    });
    edges.forEach((e) => {
      if (nodeById.has(e.from) && nodeById.has(e.to)) {
        outAdj.get(e.from).push(e.to);
        inDeg.set(e.to, (inDeg.get(e.to) || 0) + 1);
      }
    });

    const layerMap = new Map();
    nodes.forEach((n) => layerMap.set(n.id, n.col != null ? n.col : 0));

    // DAG的最長パスで列（層）を決定（循環ガード付き）
    for (let iter = 0; iter < nodes.length; iter++) {
      let changed = false;
      edges.forEach((e) => {
        const toNode = nodeById.get(e.to);
        if (toNode && toNode.col == null && nodeById.has(e.from)) {
          const nextL = (layerMap.get(e.from) || 0) + 1;
          if (nextL > (layerMap.get(e.to) || 0)) {
            layerMap.set(e.to, nextL);
            changed = true;
          }
        }
      });
      if (!changed) break;
    }
    nodes.forEach((n) => {
      if (n.col == null) n.col = layerMap.get(n.id) || 0;
    });

    // ゾーンが重ならないよう縦バンド（row帯域）へ分離配置
    const hasExplicitRows = nodes.every((n) => n.row != null);
    if (!hasExplicitRows) {
      let nextBandRow = 0;
      const zoneBandInfo = new Map();

      // ゾーンがある場合はゾーン単位で縦バンドを割り当て（ゾーン外の骨幹ノードは中央後配置）
      zones.forEach((z) => {
        const members = nodes.filter((n) => n.zoneId === z.id);
        if (members.length === 0) return;
        const byCol = new Map();
        members.forEach((m) => {
          if (!byCol.has(m.col)) byCol.set(m.col, []);
          byCol.get(m.col).push(m);
        });
        let maxStack = 1;
        byCol.forEach((list) => {
          if (list.length > maxStack) maxStack = list.length;
        });
        byCol.forEach((list) => {
          if (list.length === 1 && maxStack > 1) {
            if (list[0].row == null) list[0].row = nextBandRow + (maxStack - 1) / 2;
          } else {
            list.forEach((m, rIdx) => {
              if (m.row == null) m.row = nextBandRow + rIdx;
            });
          }
        });
        zoneBandInfo.set(z.id, { startRow: nextBandRow, rows: maxStack });
        nextBandRow += maxStack;
      });

      // ゾーン未所属ノードを列ごとに配置（ゾーンバンドが複数なら接続先中心付近へ）
      const unzoned = nodes.filter((n) => !n.zoneId);
      const unzonedByCol = new Map();
      unzoned.forEach((u) => {
        if (!unzonedByCol.has(u.col)) unzonedByCol.set(u.col, []);
        unzonedByCol.get(u.col).push(u);
      });
      const totalBandRows = Math.max(1, nextBandRow);
      unzonedByCol.forEach((list) => {
        list.forEach((u, idx) => {
          if (u.row != null) return;
          if (zones.length > 0 && list.length === 1) {
            u.row = (totalBandRows - 1) / 2;
          } else if (zones.length > 0) {
            const step = totalBandRows / (list.length + 1);
            u.row = step * (idx + 1) - 0.5;
          } else {
            u.row = idx;
          }
        });
      });
    }
  }

  // 2. ピクセル座標変換（LR: col->X, row->Y / TD: row->X, col->Y）
  const padLeft = 40;
  const padTop = parsed.title ? 66 : 30;
  const stepX = nodeW + colGap;
  const stepY = nodeH + rowGap;

  // ゾーンバンド間の追加余白を計算（LR時は縦並びゾーン間に余白を確保）
  const zoneYShift = new Map();
  if (parsed.direction !== 'GRID' && zones.length > 1) {
    // ゾーンごとの最小row順で追加Yギャップを蓄積
    const orderedZones = zones
      .map((z) => {
        const mems = nodes.filter((n) => n.zoneId === z.id);
        const minR = mems.length ? Math.min(...mems.map((m) => m.row)) : 0;
        return { z, minR, mems };
      })
      .filter((item) => item.mems.length > 0)
      .sort((a, b) => a.minR - b.minR);

    orderedZones.forEach((item, zIdx) => {
      const extra = zIdx * zoneBandGap;
      item.mems.forEach((m) => zoneYShift.set(m.id, extra));
    });
  }

  nodes.forEach((n) => {
    if (parsed.direction === 'TD') {
      n.x = padLeft + n.row * (nodeW + 34);
      n.y = padTop + n.col * (nodeH + 54);
    } else {
      n.x = padLeft + n.col * stepX;
      n.y = padTop + n.row * stepY + (zoneYShift.get(n.id) || 0);
    }
    n.w = nodeW;
    n.h = nodeH;
  });

  // ゾーンがある列に左右余白が必要なら、後続ノードや全体座標を微調整せずゾーン背景をパディング付き算出
  const zoneBoxes = [];
  zones.forEach((z) => {
    const members = nodes.filter((n) => n.zoneId === z.id);
    if (members.length === 0) return;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    members.forEach((m) => {
      minX = Math.min(minX, m.x);
      minY = Math.min(minY, m.y);
      maxX = Math.max(maxX, m.x + m.w);
      maxY = Math.max(maxY, m.y + m.h);
    });
    zoneBoxes.push({
      zone: z,
      x: minX - zonePadX,
      y: minY - zonePadTop,
      w: (maxX - minX) + zonePadX * 2,
      h: (maxY - minY) + zonePadTop + zonePadBottom
    });
  });

  // 全体の最小X・Yを正領域へシフト（上/左にはみ出たゾーン枠も収める）
  let globalMinX = Infinity, globalMinY = Infinity, globalMaxX = -Infinity, globalMaxY = -Infinity;
  nodes.forEach((n) => {
    globalMinX = Math.min(globalMinX, n.x);
    globalMinY = Math.min(globalMinY, n.y);
    globalMaxX = Math.max(globalMaxX, n.x + n.w);
    globalMaxY = Math.max(globalMaxY, n.y + n.h);
  });
  zoneBoxes.forEach((zb) => {
    globalMinX = Math.min(globalMinX, zb.x - 10);
    globalMinY = Math.min(globalMinY, zb.y - 10);
    globalMaxX = Math.max(globalMaxX, zb.x + zb.w + 10);
    globalMaxY = Math.max(globalMaxY, zb.y + zb.h + 10);
  });

  const shiftX = globalMinX < 32 ? (32 - globalMinX) : 0;
  const shiftY = globalMinY < padTop ? (padTop - globalMinY) : 0;
  if (shiftX !== 0 || shiftY !== 0) {
    nodes.forEach((n) => { n.x += shiftX; n.y += shiftY; });
    zoneBoxes.forEach((zb) => { zb.x += shiftX; zb.y += shiftY; });
    globalMaxX += shiftX;
    globalMaxY += shiftY;
  }

  const width = Math.max(760, Math.ceil(globalMaxX + 36));
  const legendItems = parsed.legendItems || [];
  let legendH = 0;
  const legendLayout = [];
  if (legendItems.length > 0) {
    let lx = 32;
    let ly = globalMaxY + 34;
    legendItems.forEach((item) => {
      const itemW = 36 + item.label.length * 12 + 24;
      if (lx > 32 && lx + itemW > width - 32) {
        lx = 32;
        ly += 26;
      }
      legendLayout.push({ ...item, x: lx, y: ly });
      lx += itemW;
    });
    legendH = (legendLayout[legendLayout.length - 1].y - globalMaxY) + 28;
  }

  const height = Math.max(360, Math.ceil(globalMaxY + 28 + legendH));

  container.dataset.baseWidth = width;

  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.style.maxWidth = '100%';
  svg.style.height = 'auto';
  svg.style.display = 'block';

  // Defs（統一モノトーン矢印 + リスク強調赤/黄矢印 + シャドウ）
  const defs = document.createElementNS(svgNS, 'defs');
  defs.innerHTML = `
    <marker id="net-arrow-default" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8.5 5 L 0 8.5 z" fill="${palette.line}" />
    </marker>
    <marker id="net-arrow-danger" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8.5 5 L 0 8.5 z" fill="${palette.dangerStroke}" />
    </marker>
    <marker id="net-arrow-warn" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8.5 5 L 0 8.5 z" fill="${palette.warnStroke}" />
    </marker>
    <marker id="net-arrow-safe" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8.5 5 L 0 8.5 z" fill="${palette.safeStroke}" />
    </marker>
    <filter id="net-shadow" x="-8%" y="-8%" width="116%" height="116%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="${isDark ? '0.35' : '0.06'}" />
    </filter>
  `;
  svg.appendChild(defs);

  // 背景
  const bg = document.createElementNS(svgNS, 'rect');
  bg.setAttribute('width', width);
  bg.setAttribute('height', height);
  bg.setAttribute('rx', '10');
  bg.setAttribute('fill', palette.bg);
  svg.appendChild(bg);

  // タイトル
  if (parsed.title) {
    const tEl = document.createElementNS(svgNS, 'text');
    tEl.setAttribute('x', '32');
    tEl.setAttribute('y', '34');
    tEl.setAttribute('font-size', '18');
    tEl.setAttribute('font-weight', '700');
    tEl.setAttribute('fill', palette.textMain);
    tEl.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
    tEl.textContent = parsed.title;
    svg.appendChild(tEl);
  }

  // 3. ゾーン枠描画
  zoneBoxes.forEach(({ zone, x, y, w, h }) => {
    const zStyle = zone.style || 'safe';
    const sc = getStyleColors(zStyle);

    if (zStyle === 'danger') {
      const path = document.createElementNS(svgNS, 'path');
      path.setAttribute('d', buildJaggedZonePath(x, y, w, h, 9));
      path.setAttribute('fill', sc.bg);
      path.setAttribute('stroke', sc.stroke);
      path.setAttribute('stroke-width', '1.8');
      svg.appendChild(path);
    } else {
      const rect = document.createElementNS(svgNS, 'rect');
      rect.setAttribute('x', x);
      rect.setAttribute('y', y);
      rect.setAttribute('width', w);
      rect.setAttribute('height', h);
      rect.setAttribute('rx', '12');
      rect.setAttribute('fill', sc.bg);
      rect.setAttribute('stroke', sc.stroke);
      rect.setAttribute('stroke-width', '1.6');
      rect.setAttribute('stroke-dasharray', '6 4');
      svg.appendChild(rect);
    }

    const zLbl = document.createElementNS(svgNS, 'text');
    zLbl.setAttribute('x', x + 12);
    zLbl.setAttribute('y', y + 19);
    zLbl.setAttribute('font-size', '12');
    zLbl.setAttribute('font-weight', '700');
    zLbl.setAttribute('fill', sc.text);
    zLbl.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
    zLbl.textContent = zone.label;
    svg.appendChild(zLbl);
  });

  // 4. エッジ描画（直交バス配線＋Wi-Fi電波アイコン＋色強調）
  const edgeG = document.createElementNS(svgNS, 'g');
  edges.forEach((e) => {
    const src = nodeById.get(e.from);
    const dst = nodeById.get(e.to);
    if (!src || !dst) return;

    const eColor = e.style === 'danger' ? palette.dangerStroke
      : (e.style === 'warn' ? palette.warnStroke
        : (e.style === 'safe' ? palette.safeStroke : palette.line));
    const markerId = e.style === 'danger' ? 'net-arrow-danger'
      : (e.style === 'warn' ? 'net-arrow-warn'
        : (e.style === 'safe' ? 'net-arrow-safe' : 'net-arrow-default'));

    let x1, y1, x2, y2, dStr;
    if (parsed.direction === 'TD') {
      x1 = src.x + src.w / 2;
      y1 = src.y + src.h;
      x2 = dst.x + dst.w / 2;
      y2 = dst.y;
      const midY = (y1 + y2) / 2;
      dStr = Math.abs(x1 - x2) < 2 ? `M ${x1} ${y1} L ${x2} ${y2}` : `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`;
    } else {
      x1 = src.x + src.w;
      y1 = src.y + src.h / 2;
      x2 = dst.x;
      y2 = dst.y + dst.h / 2;
      if (dst.x < src.x) {
        x1 = src.x;
        x2 = dst.x + dst.w;
      }
      const midX = Math.round((x1 + x2) / 2);
      dStr = Math.abs(y1 - y2) < 2 ? `M ${x1} ${y1} L ${x2} ${y2}` : `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
    }

    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('d', dStr);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', eColor);
    path.setAttribute('stroke-width', e.style === 'danger' || e.style === 'warn' ? '2.2' : '1.8');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    if (e.dotted) path.setAttribute('stroke-dasharray', '2.5 4.5');
    else if (e.dashed || e.wifi) path.setAttribute('stroke-dasharray', '5 4');
    if (e.arrow === 'forward' || e.arrow === 'both') {
      path.setAttribute('marker-end', `url(#${markerId})`);
    }
    if (e.arrow === 'back' || e.arrow === 'both') {
      path.setAttribute('marker-start', `url(#${markerId})`);
    }
    edgeG.appendChild(path);

    // Wi-Fi電波ミニアイコン（中点表示）
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    if (e.wifi) {
      const wg = document.createElementNS(svgNS, 'g');
      wg.setAttribute('transform', `translate(${mx - 9}, ${my - 11})`);
      const wBg = document.createElementNS(svgNS, 'rect');
      wBg.setAttribute('x', '0');
      wBg.setAttribute('y', '0');
      wBg.setAttribute('width', '18');
      wBg.setAttribute('height', '16');
      wBg.setAttribute('rx', '4');
      wBg.setAttribute('fill', palette.bg);
      wg.appendChild(wBg);
      const a1 = document.createElementNS(svgNS, 'path');
      a1.setAttribute('d', 'M2,7 A9,9 0 0,1 16,7 M4.5,10 A5.5,5.5 0 0,1 13.5,10');
      a1.setAttribute('fill', 'none');
      a1.setAttribute('stroke', eColor);
      a1.setAttribute('stroke-width', '1.6');
      a1.setAttribute('stroke-linecap', 'round');
      wg.appendChild(a1);
      const dot = document.createElementNS(svgNS, 'circle');
      dot.setAttribute('cx', '9');
      dot.setAttribute('cy', '13');
      dot.setAttribute('r', '1.3');
      dot.setAttribute('fill', eColor);
      wg.appendChild(dot);
      edgeG.appendChild(wg);
    }

    // エッジラベル
    if (e.label) {
      const labelLines = e.label.split('\n');
      labelLines.forEach((ln, li) => {
        const lEl = document.createElementNS(svgNS, 'text');
        lEl.setAttribute('x', mx);
        lEl.setAttribute('y', my - (e.wifi ? 14 : 7) - (labelLines.length - 1 - li) * 13);
        lEl.setAttribute('text-anchor', 'middle');
        lEl.setAttribute('font-size', '10.5');
        lEl.setAttribute('font-weight', e.style === 'danger' || e.style === 'warn' ? '700' : '500');
        lEl.setAttribute('fill', e.style === 'default' ? palette.textMuted : eColor);
        lEl.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
        lEl.textContent = ln;
        edgeG.appendChild(lEl);
      });
    }
  });
  svg.appendChild(edgeG);

  // 5. ノード（モノトーン機器アイコン＋リスク箇所バッジ強調）
  const nodeG = document.createElementNS(svgNS, 'g');
  nodes.forEach((n) => {
    const sc = getStyleColors(n.style);
    const cardG = document.createElementNS(svgNS, 'g');
    cardG.setAttribute('filter', 'url(#net-shadow)');

    const rect = document.createElementNS(svgNS, 'rect');
    rect.setAttribute('x', n.x);
    rect.setAttribute('y', n.y);
    rect.setAttribute('width', n.w);
    rect.setAttribute('height', n.h);
    rect.setAttribute('rx', '8');
    rect.setAttribute('fill', sc.bg);
    rect.setAttribute('stroke', sc.stroke);
    rect.setAttribute('stroke-width', n.style === 'danger' || n.style === 'warn' ? '2' : '1.3');
    cardG.appendChild(rect);

    // 48x48 アイコンをカード上中央へ配置
    const iconWrap = document.createElementNS(svgNS, 'g');
    iconWrap.setAttribute('transform', `translate(${n.x + (n.w - 46) / 2}, ${n.y + 8}) scale(0.95)`);
    iconWrap.appendChild(renderNetworkIconGlyph(n.type, sc.iconStroke, palette.iconFill, palette.iconAccent, svgNS));
    cardG.appendChild(iconWrap);

    // ノード名（最大2行）
    const lblLines = n.label.split('\n').slice(0, 2);
    lblLines.forEach((ln, idx) => {
      const t = document.createElementNS(svgNS, 'text');
      t.setAttribute('x', n.x + n.w / 2);
      t.setAttribute('y', n.y + 67 + idx * 14);
      t.setAttribute('text-anchor', 'middle');
      t.setAttribute('font-size', '11.5');
      t.setAttribute('font-weight', '700');
      t.setAttribute('fill', n.style === 'danger' ? palette.dangerText : palette.textMain);
      t.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
      t.textContent = ln;
      cardG.appendChild(t);
    });

    // サブテキスト (IPアドレス・補記)
    if (n.subLabel) {
      const subY = n.y + 67 + lblLines.length * 14;
      const st = document.createElementNS(svgNS, 'text');
      st.setAttribute('x', n.x + n.w / 2);
      st.setAttribute('y', subY);
      st.setAttribute('text-anchor', 'middle');
      st.setAttribute('font-size', '10');
      st.setAttribute('fill', n.style === 'warn' ? palette.warnText : (n.style === 'danger' ? palette.dangerText : palette.textMuted));
      st.setAttribute('font-family', 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace');
      st.textContent = n.subLabel;
      cardG.appendChild(st);
    }

    // リスク・ステータスバッジ（danger / warn / safe のときのみ強調）
    if (n.style === 'danger' || n.style === 'warn' || n.badge) {
      const bx = n.x + n.w - 16;
      const by = n.y + 4;
      const bColor = n.style === 'danger' ? palette.dangerStroke : (n.style === 'warn' ? palette.warnStroke : palette.safeStroke);
      if (n.badge) {
        const bw = Math.max(46, n.badge.length * 10 + 12);
        const br = document.createElementNS(svgNS, 'rect');
        br.setAttribute('x', n.x + n.w - bw + 6);
        br.setAttribute('y', n.y - 9);
        br.setAttribute('width', bw);
        br.setAttribute('height', '18');
        br.setAttribute('rx', '9');
        br.setAttribute('fill', bColor);
        cardG.appendChild(br);

        const bt = document.createElementNS(svgNS, 'text');
        bt.setAttribute('x', n.x + n.w - bw / 2 + 6);
        bt.setAttribute('y', n.y + 3);
        bt.setAttribute('text-anchor', 'middle');
        bt.setAttribute('font-size', '9.5');
        bt.setAttribute('font-weight', '700');
        bt.setAttribute('fill', '#ffffff');
        bt.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
        bt.textContent = n.badge;
        cardG.appendChild(bt);
      } else {
        // 三角警告マーク (!)
        const tri = document.createElementNS(svgNS, 'polygon');
        tri.setAttribute('points', `${bx},${by - 10} ${bx + 11},${by + 9} ${bx - 11},${by + 9}`);
        tri.setAttribute('fill', bColor);
        tri.setAttribute('stroke', palette.bg);
        tri.setAttribute('stroke-width', '1.5');
        cardG.appendChild(tri);

        const ex = document.createElementNS(svgNS, 'text');
        ex.setAttribute('x', bx);
        ex.setAttribute('y', by + 6);
        ex.setAttribute('text-anchor', 'middle');
        ex.setAttribute('font-size', '11');
        ex.setAttribute('font-weight', '800');
        ex.setAttribute('fill', '#ffffff');
        ex.textContent = '!';
        cardG.appendChild(ex);
      }
    } else if (n.style === 'safe') {
      // 対策済・安全チェック小バッジ
      const bx = n.x + n.w - 14;
      const by = n.y + 12;
      const c = document.createElementNS(svgNS, 'circle');
      c.setAttribute('cx', bx);
      c.setAttribute('cy', by);
      c.setAttribute('r', '7.5');
      c.setAttribute('fill', palette.safeStroke);
      cardG.appendChild(c);
      const ck = document.createElementNS(svgNS, 'path');
      ck.setAttribute('d', `M${bx - 3.5},${by} L${bx - 1},${by + 2.8} L${bx + 4},${by - 2.5}`);
      ck.setAttribute('fill', 'none');
      ck.setAttribute('stroke', '#ffffff');
      ck.setAttribute('stroke-width', '1.8');
      ck.setAttribute('stroke-linecap', 'round');
      cardG.appendChild(ck);
    }

    nodeG.appendChild(cardG);
  });
  svg.appendChild(nodeG);

  // 6. 凡例描画
  if (legendLayout.length > 0) {
    const sep = document.createElementNS(svgNS, 'line');
    sep.setAttribute('x1', '32');
    sep.setAttribute('y1', legendLayout[0].y - 16);
    sep.setAttribute('x2', width - 32);
    sep.setAttribute('y2', legendLayout[0].y - 16);
    sep.setAttribute('stroke', palette.cardBorder);
    sep.setAttribute('stroke-width', '1');
    svg.appendChild(sep);

    legendLayout.forEach((item) => {
      const col = item.style === 'danger' ? palette.dangerStroke
        : (item.style === 'warn' ? palette.warnStroke
          : (item.style === 'safe' ? palette.safeStroke : palette.line));
      if (item.kind === 'box' || item.kind === 'zone') {
        const r = document.createElementNS(svgNS, 'rect');
        r.setAttribute('x', item.x);
        r.setAttribute('y', item.y - 9);
        r.setAttribute('width', '20');
        r.setAttribute('height', '13');
        r.setAttribute('rx', '3');
        r.setAttribute('fill', item.style === 'danger' ? palette.dangerBg : (item.style === 'warn' ? palette.warnBg : palette.safeBg));
        r.setAttribute('stroke', col);
        r.setAttribute('stroke-width', '1.5');
        if (item.kind === 'zone') r.setAttribute('stroke-dasharray', '4 2');
        svg.appendChild(r);
      } else {
        const ln = document.createElementNS(svgNS, 'line');
        ln.setAttribute('x1', item.x);
        ln.setAttribute('y1', item.y - 2);
        ln.setAttribute('x2', item.x + 24);
        ln.setAttribute('y2', item.y - 2);
        ln.setAttribute('stroke', col);
        ln.setAttribute('stroke-width', '2');
        if (item.kind === 'dotted' || item.dotted) ln.setAttribute('stroke-dasharray', '2 3');
        else if (item.kind === 'wifi' || item.dashed) ln.setAttribute('stroke-dasharray', '4 3');
        if (item.kind === 'arrow') {
          const mk = item.style === 'danger' ? 'net-arrow-danger' : (item.style === 'warn' ? 'net-arrow-warn' : 'net-arrow-default');
          ln.setAttribute('marker-end', `url(#${mk})`);
        }
        svg.appendChild(ln);
      }

      const txt = document.createElementNS(svgNS, 'text');
      txt.setAttribute('x', item.x + 30);
      txt.setAttribute('y', item.y + 2);
      txt.setAttribute('font-size', '11');
      txt.setAttribute('fill', palette.textMuted);
      txt.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
      txt.textContent = item.label;
      svg.appendChild(txt);
    });
  }

  container.appendChild(svg);

  if (labelText) {
    const lbl = document.createElement('div');
    lbl.className = 'chem-structure-label';
    lbl.textContent = labelText;
    container.appendChild(lbl);
  }
}
