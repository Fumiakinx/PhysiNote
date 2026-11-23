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
  let iconTheme = 'mono'; // 'mono' | 'cisco' | 'modern'
  let direction = 'LR'; // 'LR' | 'TD' | 'GRID'
  let cols = 0;

  const zones = [];
  const zoneMap = new Map();
  const nodes = [];
  const nodeMap = new Map();
  const edges = [];
  const legendItems = [];
  let nextBusGroupId = 1;

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

  // CSV分割は svg-utils.js の共通 splitCsvRespectQuotes を使用

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
      const kindM = textPart.match(/^(arrow|line|dotted|wifi|box|zone|badge|alert)\b\s*(.*)$/i);
      const kind = kindM ? kindM[1].toLowerCase() : 'line';
      const legLabel = (kindM ? kindM[2] : textPart).replace(/^["']|["']$/g, '').trim();
      if (legLabel) {
        legendItems.push({ kind, label: legLabel, ...attrs });
      }
      continue;
    }

    // メタ設定
    const metaM = line.match(/^(title|theme|icons|icon_style|direction|dir|layout|cols)\s*:\s*(.+)$/i);
    if (metaM && !line.includes('->') && !line.includes('<->') && !line.includes('--') && !line.includes('..')) {
      const k = metaM[1].toLowerCase();
      const v = metaM[2].trim().replace(/;$/, '').replace(/^["']|["']$/g, '').trim();
      if (k === 'title') title = v;
      else if (k === 'theme') theme = v.toLowerCase().includes('dark') ? 'dark' : 'light';
      else if (k === 'icons' || k === 'icon_style') {
        const lv = v.toLowerCase();
        if (lv.includes('cisco')) iconTheme = 'cisco';
        else if (lv.includes('modern') || lv.includes('3d') || lv.includes('rich') || lv.includes('color')) iconTheme = 'modern';
        else iconTheme = 'mono';
      }
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

      const busGroup = targetIds.length > 1 ? nextBusGroupId++ : null;
      ensureImplicitNode(fromId);
      targetIds.forEach((tId) => {
        ensureImplicitNode(tId);
        edges.push({
          from: fromId,
          to: tId,
          arrow: arrowDir,
          label: edgeLabel,
          busGroup,
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

  return { title, theme, iconTheme, direction, cols, zones, nodes, edges, legendItems };
}

let _networkSvgUidSeq = 0;

// ==========================================
// 3系統アイコン描画ディスパッチャ (mono / cisco / modern)
// （viewBox空間: 0..48 x 0..48 基準）
// ==========================================
function renderNetworkIconGlyph(type, iconTheme, strokeColor, fillBg, accentFill, gradIds, svgNS) {
  if (iconTheme === 'cisco') {
    return renderCiscoIconGlyph(type, gradIds, svgNS);
  }
  if (iconTheme === 'modern') {
    return renderModernIconGlyph(type, gradIds, svgNS);
  }
  return renderMonoIconGlyph(type, strokeColor, fillBg, accentFill, svgNS);
}

// 1. Cisco風 3Dブルー＋白抜きアイコン
function renderCiscoIconGlyph(type, gradIds, svgNS) {
  const g = document.createElementNS(svgNS, 'g');
  const add = (tag, attrs) => {
    const el = document.createElementNS(svgNS, tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, String(v)));
    g.appendChild(el);
    return el;
  };
  const edge = { stroke: '#0c4a6e', 'stroke-width': '1.2', 'stroke-linejoin': 'round', 'stroke-linecap': 'round' };
  const wLine = { stroke: '#ffffff', 'stroke-width': '1.8', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', fill: 'none' };
  const bodyFill = `url(#${gradIds.ciscoBody})`;
  const topFill = `url(#${gradIds.ciscoTop})`;
  const brickFill = `url(#${gradIds.ciscoBrick})`;
  const normType = String(type || 'desktop').toLowerCase().replace(/[\s_-]/g, '');

  switch (normType) {
    case 'router': {
      add('path', { d: 'M7,16 L7,33 A17,6.5 0 0,0 41,33 L41,16 Z', fill: bodyFill, ...edge });
      add('ellipse', { cx: 24, cy: 16, rx: 17, ry: 6.5, fill: topFill, ...edge });
      add('path', { d: 'M14,13 L21,15 M21,15 L17,15.8 M21,15 L19.5,12.5', ...wLine, 'stroke-width': '1.6' });
      add('path', { d: 'M34,19 L27,17 M27,17 L31,16.2 M27,17 L28.5,19.5', ...wLine, 'stroke-width': '1.6' });
      add('path', { d: 'M14,19 L21,17 M21,17 L19.5,19.5 M21,17 L17,16.2', ...wLine, 'stroke-width': '1.6' });
      add('path', { d: 'M34,13 L27,15 M27,15 L28.5,12.5 M27,15 L31,15.8', ...wLine, 'stroke-width': '1.6' });
      break;
    }
    case 'switch':
    case 'l2sw':
    case 'l2switch':
    case 'switchinghub':
    case 'hub': {
      add('polygon', { points: '5,22 13,14 43,14 35,22', fill: topFill, ...edge });
      add('rect', { x: 5, y: 22, width: 30, height: 12, fill: bodyFill, ...edge });
      add('polygon', { points: '35,22 43,14 43,26 35,34', fill: '#075985', ...edge });
      add('path', { d: 'M13,16.8 L27,16.8 M24,15 L27,16.8 L24,18.6', ...wLine, 'stroke-width': '1.6' });
      add('path', { d: 'M34,19.6 L19,19.6 M22,17.8 L19,19.6 L22,21.4', ...wLine, 'stroke-width': '1.6' });
      for (let px = 9; px <= 29; px += 5) {
        add('rect', { x: px, y: 26.5, width: 2.8, height: 3, fill: '#bae6fd' });
      }
      break;
    }
    case 'l3switch':
    case 'l3sw':
    case 'coreswitch': {
      add('polygon', { points: '5,22 13,13 43,13 35,22', fill: topFill, ...edge });
      add('rect', { x: 5, y: 22, width: 30, height: 13, fill: bodyFill, ...edge });
      add('polygon', { points: '35,22 43,13 43,26 35,35', fill: '#075985', ...edge });
      add('circle', { cx: 24, cy: 17.5, r: 3.3, fill: '#ffffff' });
      add('path', { d: 'M14,17.5 L20,17.5 M28,17.5 L34,17.5 M21,15 L24,13.5 L27,15 M21,20 L24,21.5 L27,20', ...wLine, 'stroke-width': '1.5' });
      break;
    }
    case 'firewall':
    case 'fw':
    case 'utm': {
      add('rect', { x: 7, y: 12, width: 34, height: 24, rx: 1.5, fill: brickFill, stroke: '#7f1d1d', 'stroke-width': '1.3' });
      [20, 28].forEach((ly) => add('line', { x1: 7, y1: ly, x2: 41, y2: ly, stroke: '#fee2e2', 'stroke-width': '1.3' }));
      [[18, 12, 20], [30, 12, 20], [13, 20, 28], [24, 20, 28], [35, 20, 28], [18, 28, 36], [30, 28, 36]].forEach(([vx, y1, y2]) => {
        add('line', { x1: vx, y1, x2: vx, y2, stroke: '#fee2e2', 'stroke-width': '1.3' });
      });
      if (normType === 'utm') {
        add('path', { d: 'M32,26 L40,26 L40,32 C40,36 36,39 36,39 C36,39 32,36 32,32 Z', fill: topFill, stroke: '#ffffff', 'stroke-width': '1.3' });
      }
      break;
    }
    case 'ap':
    case 'wifiap':
    case 'wireless':
    case 'wificonnect': {
      add('rect', { x: 9, y: 27, width: 30, height: 10, rx: 2, fill: bodyFill, ...edge });
      add('path', { d: 'M13,18 A15,15 0 0,1 35,18', stroke: '#0284c7', 'stroke-width': '2', fill: 'none', 'stroke-linecap': 'round' });
      add('path', { d: 'M17,21.5 A9.5,9.5 0 0,1 31,21.5', stroke: '#0284c7', 'stroke-width': '2', fill: 'none', 'stroke-linecap': 'round' });
      add('circle', { cx: 24, cy: 24.5, r: 1.6, fill: '#0284c7' });
      add('circle', { cx: 15, cy: 32, r: 1.4, fill: '#ffffff' });
      add('circle', { cx: 20, cy: 32, r: 1.4, fill: '#ffffff' });
      break;
    }
    case 'onu':
    case 'modem':
    case 'hgw': {
      add('rect', { x: 8, y: 24, width: 32, height: 13, rx: 1.5, fill: bodyFill, ...edge });
      add('line', { x1: 34, y1: 24, x2: 34, y2: 10, stroke: '#0369a1', 'stroke-width': '2.2', 'stroke-linecap': 'round' });
      add('circle', { cx: 34, cy: 9.5, r: 2, fill: '#0284c7' });
      [14, 19, 24].forEach((cx) => add('circle', { cx, cy: 30.5, r: 1.4, fill: '#bae6fd' }));
      break;
    }
    case 'vpn':
    case 'gateway': {
      add('rect', { x: 9, y: 19, width: 30, height: 19, rx: 2, fill: bodyFill, ...edge });
      add('path', { d: 'M17,19 L17,14.5 A7,7 0 0,1 31,14.5 L31,19', stroke: '#0369a1', 'stroke-width': '2.4', fill: 'none' });
      add('circle', { cx: 24, cy: 27, r: 2.4, fill: '#ffffff' });
      add('line', { x1: 24, y1: 29, x2: 24, y2: 33.5, ...wLine });
      break;
    }
    case 'internet':
    case 'wan':
    case 'globe': {
      add('circle', { cx: 24, cy: 24, r: 15, fill: topFill, ...edge });
      add('ellipse', { cx: 24, cy: 24, rx: 6.5, ry: 15, ...wLine, 'stroke-width': '1.4' });
      add('line', { x1: 9, y1: 24, x2: 39, y2: 24, ...wLine, 'stroke-width': '1.4' });
      add('path', { d: 'M11.5,16.5 Q24,19.5 36.5,16.5', ...wLine, 'stroke-width': '1.3' });
      add('path', { d: 'M11.5,31.5 Q24,28.5 36.5,31.5', ...wLine, 'stroke-width': '1.3' });
      break;
    }
    case 'cloud':
    case 'infra': {
      add('path', { d: 'M14,34 L35,34 A7,7 0 0,0 36,20.2 A10,10 0 0,0 17,16 A8,8 0 0,0 14,34 Z', fill: topFill, ...edge });
      break;
    }
    case 'server': {
      add('polygon', { points: '13,10 19,6 35,6 29,10', fill: topFill, ...edge });
      add('rect', { x: 13, y: 10, width: 16, height: 30, fill: bodyFill, ...edge });
      add('polygon', { points: '29,10 35,6 35,36 29,40', fill: '#075985', ...edge });
      [15, 19.5, 24].forEach((ly) => add('line', { x1: 16, y1: ly, x2: 26, y2: ly, ...wLine, 'stroke-width': '1.5' }));
      add('circle', { cx: 21, cy: 33, r: 1.8, fill: '#bae6fd' });
      break;
    }
    case 'rack':
    case 'rackserver': {
      [9, 19.5, 30].forEach((ry) => {
        add('rect', { x: 8, y: ry, width: 32, height: 8.5, rx: 1, fill: bodyFill, ...edge });
        add('circle', { cx: 13, cy: ry + 4.2, r: 1.3, fill: '#bae6fd' });
        add('line', { x1: 19, y1: ry + 4.2, x2: 35, y2: ry + 4.2, ...wLine, 'stroke-width': '1.4' });
      });
      break;
    }
    case 'vm':
    case 'virtualserver': {
      add('rect', { x: 9, y: 12, width: 22, height: 26, rx: 1.5, fill: '#075985', ...edge });
      add('rect', { x: 17, y: 8, width: 22, height: 26, rx: 1.5, fill: topFill, stroke: '#ffffff', 'stroke-width': '1.4', 'stroke-dasharray': '3 2' });
      add('line', { x1: 21, y1: 15, x2: 35, y2: 15, ...wLine, 'stroke-width': '1.5' });
      add('line', { x1: 21, y1: 20, x2: 35, y2: 20, ...wLine, 'stroke-width': '1.5' });
      break;
    }
    case 'db':
    case 'database': {
      add('path', { d: 'M12,13 L12,34 A12,4.5 0 0,0 36,34 L36,13 Z', fill: bodyFill, ...edge });
      add('ellipse', { cx: 24, cy: 13, rx: 12, ry: 4.5, fill: topFill, ...edge });
      add('path', { d: 'M12,20 A12,4.5 0 0,0 36,20', ...wLine, 'stroke-width': '1.3' });
      add('path', { d: 'M12,27 A12,4.5 0 0,0 36,27', ...wLine, 'stroke-width': '1.3' });
      break;
    }
    case 'nas':
    case 'storage': {
      add('rect', { x: 10, y: 11, width: 28, height: 26, rx: 1.5, fill: bodyFill, ...edge });
      [14.5, 20, 25.5, 31].forEach((bx) => {
        add('rect', { x: bx, y: 15, width: 3.5, height: 15, rx: 0.6, fill: topFill, stroke: '#ffffff', 'stroke-width': '1.1' });
      });
      break;
    }
    case 'ups': {
      add('rect', { x: 13, y: 9, width: 22, height: 30, rx: 1.5, fill: bodyFill, ...edge });
      add('path', { d: 'M25.5,14 L20,23 L24.5,23 L22.5,31 L28.5,21 L24,21 Z', fill: '#fde047' });
      break;
    }
    case 'desktop':
    case 'pc':
    case 'workstation':
    case 'imac':
    case 'monitor':
    case 'lcd': {
      add('rect', { x: 7, y: 12, width: 25, height: 18, rx: 1.5, fill: bodyFill, ...edge });
      add('rect', { x: 10, y: 15, width: 19, height: 12, fill: '#bae6fd' });
      add('line', { x1: 19.5, y1: 30, x2: 19.5, y2: 35, stroke: '#0c4a6e', 'stroke-width': '2.4' });
      add('line', { x1: 13, y1: 35, x2: 26, y2: 35, stroke: '#0c4a6e', 'stroke-width': '2.2', 'stroke-linecap': 'round' });
      if (normType !== 'imac' && normType !== 'monitor' && normType !== 'lcd') {
        add('rect', { x: 34, y: 13, width: 8, height: 22, rx: 1, fill: topFill, ...edge });
      }
      break;
    }
    case 'laptop':
    case 'notebook': {
      add('rect', { x: 11, y: 12, width: 26, height: 17, rx: 1.5, fill: bodyFill, ...edge });
      add('rect', { x: 13.5, y: 14.5, width: 21, height: 12, fill: '#bae6fd' });
      add('polygon', { points: '7,35 11,29 37,29 41,35', fill: topFill, ...edge });
      break;
    }
    case 'tablet': {
      add('rect', { x: 12, y: 8, width: 24, height: 32, rx: 2.5, fill: bodyFill, ...edge });
      add('rect', { x: 15, y: 12, width: 18, height: 22, fill: '#bae6fd' });
      add('circle', { cx: 24, cy: 36.8, r: 1.3, fill: '#ffffff' });
      break;
    }
    case 'mobile':
    case 'smartphone':
    case 'phone': {
      add('rect', { x: 16, y: 8, width: 16, height: 32, rx: 2.5, fill: bodyFill, ...edge });
      add('rect', { x: 18, y: 12, width: 12, height: 21, fill: '#bae6fd' });
      add('circle', { cx: 24, cy: 36.5, r: 1.3, fill: '#ffffff' });
      break;
    }
    case 'macmini': {
      add('rect', { x: 8, y: 21, width: 32, height: 12, rx: 2, fill: topFill, ...edge });
      add('line', { x1: 14, y1: 27, x2: 34, y2: 27, ...wLine, 'stroke-width': '1.6' });
      break;
    }
    case 'kiosk': {
      add('polygon', { points: '14,12 34,12 32,26 16,26', fill: bodyFill, ...edge });
      add('rect', { x: 18, y: 15, width: 12, height: 8, fill: '#bae6fd' });
      add('rect', { x: 19, y: 26, width: 10, height: 12, fill: topFill, ...edge });
      break;
    }
    case 'camera':
    case 'cctv': {
      add('polygon', { points: '10,16 32,12 35,23 13,27', fill: bodyFill, ...edge });
      add('line', { x1: 34, y1: 17, x2: 39, y2: 15.5, stroke: '#0c4a6e', 'stroke-width': '2' });
      add('path', { d: 'M17,26.5 L17,34 L10,34', stroke: '#0c4a6e', 'stroke-width': '2', fill: 'none' });
      break;
    }
    case 'printer': {
      add('rect', { x: 14, y: 9, width: 20, height: 9, fill: '#e0f2fe', ...edge });
      add('rect', { x: 8, y: 18, width: 32, height: 14, rx: 1.5, fill: bodyFill, ...edge });
      add('rect', { x: 14, y: 27, width: 20, height: 11, fill: '#ffffff', ...edge });
      break;
    }
    case 'attacker':
    case 'hacker': {
      add('circle', { cx: 24, cy: 18, r: 7, fill: brickFill, stroke: '#7f1d1d', 'stroke-width': '1.3' });
      add('path', { d: 'M11,38 C11,29 37,29 37,38 Z', fill: brickFill, stroke: '#7f1d1d', 'stroke-width': '1.3' });
      add('path', { d: 'M18,17 L22,19 L26,19 L30,17', ...wLine, 'stroke-width': '1.6' });
      break;
    }
    default: {
      add('rect', { x: 11, y: 11, width: 26, height: 26, rx: 3, fill: bodyFill, ...edge });
      add('circle', { cx: 24, cy: 24, r: 5, fill: '#ffffff' });
      break;
    }
  }
  return g;
}

// 2. 現代風（立体グラデーション＋鮮やかな青LCDスクリーン＋シルバー/ダーク筐体）アイコン
function renderModernIconGlyph(type, gradIds, svgNS) {
  const g = document.createElementNS(svgNS, 'g');
  const add = (tag, attrs) => {
    const el = document.createElementNS(svgNS, tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, String(v)));
    g.appendChild(el);
    return el;
  };
  const screenFill = `url(#${gradIds.modScreen})`;
  const silverFill = `url(#${gradIds.modSilver})`;
  const darkFill = `url(#${gradIds.modDark})`;
  const skyFill = `url(#${gradIds.modSky})`;
  const brickFill = `url(#${gradIds.modBrick})`;
  const darkRim = { stroke: '#334155', 'stroke-width': '1.2', 'stroke-linejoin': 'round', 'stroke-linecap': 'round' };
  const silverRim = { stroke: '#64748b', 'stroke-width': '1.2', 'stroke-linejoin': 'round', 'stroke-linecap': 'round' };
  const drawGloss = (x, y, w, h) => {
    add('polygon', { points: `${x},${y} ${x + w * 0.6},${y} ${x + w * 0.2},${y + h} ${x},${y + h}`, fill: '#ffffff', opacity: '0.2' });
  };

  const normType = String(type || 'desktop').toLowerCase().replace(/[\s_-]/g, '');

  switch (normType) {
    case 'desktop':
    case 'pc':
    case 'workstation': {
      // 右タワー本体（3Dメタリック）
      add('rect', { x: 31, y: 12, width: 11, height: 25, rx: 1.5, fill: darkFill, ...darkRim });
      add('line', { x1: 33.5, y1: 16, x2: 39.5, y2: 16, stroke: '#94a3b8', 'stroke-width': '1.2' });
      add('circle', { cx: 36.5, cy: 31, r: 1.4, fill: '#38bdf8' });
      // 左ワイド液晶モニター
      add('line', { x1: 18, y1: 30, x2: 18, y2: 35, stroke: '#475569', 'stroke-width': '3' });
      add('ellipse', { cx: 18, cy: 36, rx: 7, ry: 2, fill: silverFill, ...silverRim });
      add('rect', { x: 5, y: 12, width: 26, height: 18, rx: 1.5, fill: darkFill, ...darkRim });
      add('rect', { x: 7, y: 14, width: 22, height: 14, rx: 0.8, fill: screenFill });
      drawGloss(7, 14, 22, 14);
      break;
    }
    case 'imac': {
      add('polygon', { points: '20,31 28,31 30,38 18,38', fill: silverFill, ...silverRim });
      add('rect', { x: 7, y: 10, width: 34, height: 22, rx: 2, fill: silverFill, ...silverRim });
      add('rect', { x: 9, y: 12, width: 30, height: 15, rx: 1, fill: screenFill, stroke: '#1e293b', 'stroke-width': '1' });
      drawGloss(9, 12, 30, 15);
      add('circle', { cx: 24, cy: 29.5, r: 1.1, fill: '#475569' });
      break;
    }
    case 'monitor':
    case 'lcd': {
      add('rect', { x: 21, y: 31, width: 6, height: 5, fill: darkFill });
      add('ellipse', { cx: 24, cy: 37, rx: 8.5, ry: 2.2, fill: darkFill, ...darkRim });
      add('rect', { x: 6, y: 10, width: 36, height: 22, rx: 1.8, fill: darkFill, ...darkRim });
      add('rect', { x: 8.5, y: 12.5, width: 31, height: 17, rx: 0.8, fill: screenFill });
      drawGloss(8.5, 12.5, 31, 17);
      break;
    }
    case 'macmini': {
      add('rect', { x: 7, y: 20, width: 34, height: 12, rx: 3, fill: silverFill, ...silverRim });
      add('line', { x1: 14, y1: 27, x2: 34, y2: 27, stroke: '#475569', 'stroke-width': '1.6', 'stroke-linecap': 'round' });
      add('circle', { cx: 36, cy: 27, r: 1.1, fill: '#38bdf8' });
      break;
    }
    case 'laptop':
    case 'notebook': {
      add('rect', { x: 10, y: 10, width: 28, height: 18, rx: 1.8, fill: darkFill, ...darkRim });
      add('rect', { x: 12, y: 12, width: 24, height: 14, rx: 0.8, fill: screenFill });
      drawGloss(12, 12, 24, 14);
      add('polygon', { points: '5,35 10,28 38,28 43,35', fill: silverFill, ...silverRim });
      add('polygon', { points: '12,30 36,30 38,33 10,33', fill: '#334155' });
      break;
    }
    case 'tablet': {
      add('rect', { x: 11, y: 7, width: 26, height: 34, rx: 3.5, fill: darkFill, ...darkRim });
      add('rect', { x: 13.5, y: 10, width: 21, height: 26, rx: 1, fill: screenFill });
      drawGloss(13.5, 10, 21, 26);
      add('circle', { cx: 24, cy: 38.2, r: 1.2, fill: '#94a3b8' });
      break;
    }
    case 'mobile':
    case 'smartphone':
    case 'phone': {
      add('rect', { x: 15, y: 7, width: 18, height: 34, rx: 3.5, fill: darkFill, ...darkRim });
      add('rect', { x: 17, y: 10, width: 14, height: 26, rx: 1.2, fill: screenFill });
      drawGloss(17, 10, 14, 26);
      add('line', { x1: 21, y1: 38.2, x2: 27, y2: 38.2, stroke: '#94a3b8', 'stroke-width': '1.4', 'stroke-linecap': 'round' });
      break;
    }
    case 'kiosk': {
      add('polygon', { points: '12,38 36,38 33,34 15,34', fill: silverFill, ...silverRim });
      add('polygon', { points: '19,34 29,34 27,22 21,22', fill: silverFill, ...silverRim });
      add('polygon', { points: '12,10 36,10 33,24 15,24', fill: silverFill, ...silverRim });
      add('polygon', { points: '14.5,12 33.5,12 31.2,22 16.8,22', fill: screenFill });
      break;
    }
    case 'server': {
      add('polygon', { points: '13,9 20,6 35,6 28,9', fill: silverFill, ...darkRim });
      add('rect', { x: 13, y: 9, width: 15, height: 31, rx: 1, fill: darkFill, ...darkRim });
      add('polygon', { points: '28,9 35,6 35,36 28,40', fill: '#334155', ...darkRim });
      [13, 17, 21].forEach((ly) => add('line', { x1: 16, y1: ly, x2: 25, y2: ly, stroke: '#94a3b8', 'stroke-width': '1.4' }));
      add('circle', { cx: 20.5, cy: 33, r: 1.8, fill: '#38bdf8' });
      break;
    }
    case 'rack':
    case 'rackserver': {
      [9, 19.5, 30].forEach((ry) => {
        add('rect', { x: 8, y: ry, width: 32, height: 8.5, rx: 1.5, fill: darkFill, ...darkRim });
        add('circle', { cx: 12.5, cy: ry + 4.2, r: 1.4, fill: '#38bdf8' });
        add('rect', { x: 17, y: ry + 2.5, width: 19, height: 3.5, rx: 0.7, fill: '#475569' });
      });
      break;
    }
    case 'vm':
    case 'virtualserver': {
      add('rect', { x: 9, y: 12, width: 22, height: 26, rx: 2, fill: darkFill, ...darkRim });
      add('rect', { x: 17, y: 8, width: 22, height: 26, rx: 2, fill: skyFill, stroke: '#0284c7', 'stroke-width': '1.4', 'stroke-dasharray': '3 2' });
      add('line', { x1: 21, y1: 15, x2: 35, y2: 15, stroke: '#ffffff', 'stroke-width': '1.5' });
      add('line', { x1: 21, y1: 20, x2: 35, y2: 20, stroke: '#ffffff', 'stroke-width': '1.5' });
      add('circle', { cx: 28, cy: 27.5, r: 1.8, fill: '#ffffff' });
      break;
    }
    case 'db':
    case 'database': {
      add('path', { d: 'M12,13 L12,34 A12,4.5 0 0,0 36,34 L36,13 Z', fill: silverFill, ...silverRim });
      add('ellipse', { cx: 24, cy: 13, rx: 12, ry: 4.5, fill: skyFill, stroke: '#0284c7', 'stroke-width': '1.3' });
      add('path', { d: 'M12,20 A12,4.5 0 0,0 36,20', fill: 'none', stroke: '#0284c7', 'stroke-width': '1.4' });
      add('path', { d: 'M12,27 A12,4.5 0 0,0 36,27', fill: 'none', stroke: '#0284c7', 'stroke-width': '1.4' });
      break;
    }
    case 'nas':
    case 'storage': {
      add('rect', { x: 10, y: 11, width: 28, height: 26, rx: 2.5, fill: darkFill, ...darkRim });
      [14.5, 20, 25.5, 31].forEach((bx) => {
        add('rect', { x: bx, y: 15, width: 3.5, height: 15, rx: 0.7, fill: silverFill });
        add('circle', { cx: bx + 1.75, cy: 33.5, r: 1.1, fill: '#38bdf8' });
      });
      break;
    }
    case 'ups': {
      add('rect', { x: 13, y: 9, width: 22, height: 30, rx: 2, fill: darkFill, ...darkRim });
      add('path', { d: 'M25.5,14 L20,23 L24.5,23 L22.5,31 L28.5,21 L24,21 Z', fill: '#38bdf8' });
      add('circle', { cx: 24, cy: 35, r: 1.4, fill: '#34d399' });
      break;
    }
    case 'router': {
      add('line', { x1: 15, y1: 23, x2: 15, y2: 11, stroke: '#334155', 'stroke-width': '2', 'stroke-linecap': 'round' });
      add('line', { x1: 33, y1: 23, x2: 33, y2: 11, stroke: '#334155', 'stroke-width': '2', 'stroke-linecap': 'round' });
      add('rect', { x: 8, y: 23, width: 32, height: 13, rx: 3, fill: silverFill, ...silverRim });
      [14, 19, 24].forEach((cx) => add('circle', { cx, cy: 29.5, r: 1.5, fill: '#0284c7' }));
      add('rect', { x: 29, y: 27.5, width: 7, height: 4, rx: 0.8, fill: '#334155' });
      break;
    }
    case 'switch':
    case 'l2sw':
    case 'l2switch':
    case 'l3switch':
    case 'l3sw':
    case 'hub': {
      add('rect', { x: 6, y: 18, width: 36, height: 13, rx: 2, fill: silverFill, ...silverRim });
      for (let px = 10; px <= 34; px += 4.5) {
        add('rect', { x: px, y: 22, width: 2.8, height: 4, rx: 0.5, fill: '#1e293b' });
        add('circle', { cx: px + 1.4, cy: 28.5, r: 1, fill: '#10b981' });
      }
      break;
    }
    case 'firewall':
    case 'fw':
    case 'utm': {
      add('rect', { x: 7, y: 13, width: 34, height: 23, rx: 2, fill: brickFill, stroke: '#7f1d1d', 'stroke-width': '1.2' });
      [20.5, 28].forEach((ly) => add('line', { x1: 7, y1: ly, x2: 41, y2: ly, stroke: '#fecaca', 'stroke-width': '1.2' }));
      [[18, 13, 20.5], [30, 13, 20.5], [13, 20.5, 28], [24, 20.5, 28], [35, 20.5, 28], [18, 28, 36], [30, 28, 36]].forEach(([vx, y1, y2]) => {
        add('line', { x1: vx, y1, x2: vx, y2, stroke: '#fecaca', 'stroke-width': '1.2' });
      });
      add('path', { d: 'M34,37 C38,37 40,33 38.5,29 C37,26 35,23 35,23 C35,23 32,26 31,29.5 C30,33 31.5,37 34,37 Z', fill: '#f59e0b', stroke: '#ffffff', 'stroke-width': '1' });
      break;
    }
    case 'ap':
    case 'wifiap':
    case 'wireless': {
      add('rect', { x: 10, y: 27, width: 28, height: 10, rx: 4, fill: silverFill, ...silverRim });
      add('path', { d: 'M13,18 A15,15 0 0,1 35,18', stroke: '#0284c7', 'stroke-width': '2.2', fill: 'none', 'stroke-linecap': 'round' });
      add('path', { d: 'M17,21.5 A9.5,9.5 0 0,1 31,21.5', stroke: '#0284c7', 'stroke-width': '2.2', fill: 'none', 'stroke-linecap': 'round' });
      add('circle', { cx: 24, cy: 24.5, r: 1.8, fill: '#0284c7' });
      add('circle', { cx: 24, cy: 32, r: 1.5, fill: '#0284c7' });
      break;
    }
    case 'onu':
    case 'modem': {
      add('rect', { x: 8, y: 24, width: 32, height: 13, rx: 2, fill: silverFill, ...silverRim });
      add('line', { x1: 34, y1: 24, x2: 34, y2: 10, stroke: '#475569', 'stroke-width': '2' });
      add('circle', { cx: 14, cy: 30.5, r: 1.4, fill: '#10b981' });
      add('circle', { cx: 19, cy: 30.5, r: 1.4, fill: '#10b981' });
      add('circle', { cx: 24, cy: 30.5, r: 1.4, fill: '#38bdf8' });
      break;
    }
    case 'internet':
    case 'wan':
    case 'globe': {
      add('circle', { cx: 24, cy: 24, r: 15, fill: screenFill, stroke: '#1d4ed8', 'stroke-width': '1.2' });
      add('ellipse', { cx: 24, cy: 24, rx: 6.5, ry: 15, fill: 'none', stroke: '#e0f2fe', 'stroke-width': '1.3' });
      add('line', { x1: 9, y1: 24, x2: 39, y2: 24, stroke: '#e0f2fe', 'stroke-width': '1.3' });
      add('path', { d: 'M11.5,16.5 Q24,19.5 36.5,16.5', fill: 'none', stroke: '#e0f2fe', 'stroke-width': '1.2' });
      add('path', { d: 'M11.5,31.5 Q24,28.5 36.5,31.5', fill: 'none', stroke: '#e0f2fe', 'stroke-width': '1.2' });
      break;
    }
    case 'cloud':
    case 'infra': {
      add('path', { d: 'M14,34 L35,34 A7,7 0 0,0 36,20.2 A10,10 0 0,0 17,16 A8,8 0 0,0 14,34 Z', fill: skyFill, stroke: '#0284c7', 'stroke-width': '1.3' });
      break;
    }
    default:
      return renderMonoIconGlyph(type, '#334155', '#f8fafc', '#e2e8f0', svgNS);
  }
  return g;
}

// 3. 統一モノトーン線画アイコン（現行デフォルト）
function renderMonoIconGlyph(type, strokeColor, fillBg, accentFill, svgNS) {
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

    // モノトーン側でも新規機器タイプに対応（imac / monitor / macmini / kiosk）
    case 'imac':
    case 'monitor':
    case 'lcd': {
      add('rect', { x: 7, y: 11, width: 34, height: 21, rx: 2, fill: fillBg, ...baseStroke });
      add('line', { x1: 24, y1: 32, x2: 24, y2: 37, ...baseStroke });
      add('line', { x1: 16, y1: 37, x2: 32, y2: 37, ...baseStroke });
      break;
    }
    case 'macmini': {
      add('rect', { x: 8, y: 21, width: 32, height: 11, rx: 2.5, fill: fillBg, ...baseStroke });
      add('line', { x1: 14, y1: 27, x2: 34, y2: 27, ...baseStroke, 'stroke-width': '1.5' });
      break;
    }
    case 'kiosk': {
      add('polygon', { points: '14,12 34,12 32,25 16,25', fill: fillBg, ...baseStroke });
      add('rect', { x: 20, y: 25, width: 8, height: 12, fill: accentFill, ...baseStroke });
      add('line', { x1: 14, y1: 37, x2: 34, y2: 37, ...baseStroke });
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

  const measureNetTextW = (s, fs = 10, isBold = false) => estimateSvgTextWidth(s, fs, isBold) * 1.03;
  const wrapNetText = (text, maxW = 92, fs = 10, isBold = false) =>
    wrapSvgTextLines(text, maxW, fs, { isBold, safety: 1.03, extraPrevChars: 'の時' });

  const nodeById = new Map(nodes.map((n) => [n.id, n]));
  const nodeW = 152;
  const nodeH = 114;
  const rowGap = 26;
  const zonePadX = 18;
  const zonePadTop = 30;
  const zonePadBottom = 14;
  const zoneBandGap = 28;

  // 列間ラベル幅・分岐数に応じて列間余白 colGap を動的確保（分岐線とラベルの窮屈な近接を防止）
  let colGap = 198;
  if (parsed.direction !== 'GRID' && parsed.direction !== 'TD') {
    const outDegTemp = new Map();
    let maxBadgeW = 0;
    edges.forEach((e) => {
      outDegTemp.set(e.from, (outDegTemp.get(e.from) || 0) + 1);
      if (e.label) {
        const lns = wrapNetText(e.label, 92, 10, false);
        const w = lns.length > 0 ? Math.max(...lns.map((ln) => measureNetTextW(ln, 10, false))) + 16 : 0;
        if (w > maxBadgeW) maxBadgeW = w;
      }
    });
    const maxOutDeg = outDegTemp.size > 0 ? Math.max(...outDegTemp.values()) : 1;
    if (maxBadgeW > 0) {
      const laneReserve = maxOutDeg > 1 ? (maxOutDeg * 16 + 52) : 44;
      const neededGap = zonePadX * 2 + Math.ceil(maxBadgeW) + laneReserve;
      colGap = Math.max(198, Math.min(268, neededGap));
    }
  }

  // 各ノードのタイトル・サブテキストを事前折り返しし、切れずに収まる高さを算出
  let effectiveNodeH = nodeH;
  nodes.forEach((n) => {
    n._lblLines = wrapNetText(n.label, nodeW - 16, 11.5, true);
    n._subLines = n.subLabel ? wrapNetText(n.subLabel, nodeW - 16, 9.5, false) : [];
    const neededH = 80 + Math.max(1, n._lblLines.length) * 14 + (n._subLines.length > 0 ? (n._subLines.length - 1) * 12 + 12 : 4);
    if (neededH > effectiveNodeH) effectiveNodeH = neededH;
  });

  const verticalStackEdgeSet = new Set();
  const collapsedToTarget = new Map();
  const verticalParentOf = new Map();

  // 1. レイアウト座標 (col, row) 決定
  if (parsed.direction === 'GRID') {
    const gridCols = parsed.cols > 0 ? parsed.cols : Math.min(6, Math.max(3, Math.ceil(Math.sqrt(nodes.length * 1.4))));
    nodes.forEach((n, idx) => {
      if (n.col == null) n.col = idx % gridCols;
      if (n.row == null) n.row = Math.floor(idx / gridCols);
    });
  } else {
    // DFSによるサイクル検出（戻り辺を除外し、双方向エッジによる列の無限右送りを防止）
    const outAdj = new Map();
    const inDeg = new Map();
    nodes.forEach((n) => {
      outAdj.set(n.id, []);
      inDeg.set(n.id, 0);
    });
    edges.forEach((e, idx) => {
      if (nodeById.has(e.from) && nodeById.has(e.to)) {
        outAdj.get(e.from).push({ to: e.to, idx });
        inDeg.set(e.to, (inDeg.get(e.to) || 0) + 1);
      }
    });

    const companionEdgeSet = new Set();
    const companionTargetOf = new Map();

    // LR時: 外部回線系起点（入次数0・出次数1）が別ゾーンの境界機器(Firebox等)へ繋がる場合は同列直上に縦積み
    if (parsed.direction === 'LR') {
      const upstreamTypes = new Set(['internet', 'cloud', 'wan']);
      const gatewayTypes = new Set(['firewall', 'utm', 'router', 'waf', 'proxy', 'gateway']);
      edges.forEach((e, idx) => {
        const src = nodeById.get(e.from);
        const dst = nodeById.get(e.to);
        if (!src || !dst) return;
        if (src.col != null || src.row != null || dst.row != null) return;
        if (src.zoneId === dst.zoneId) return;
        if ((inDeg.get(src.id) || 0) !== 0 || (outAdj.get(src.id) || []).length !== 1) return;
        if ((outAdj.get(dst.id) || []).length < 1) return;
        if (!(upstreamTypes.has(src.type) || gatewayTypes.has(dst.type))) return;
        if (verticalParentOf.has(dst.id)) return;
        collapsedToTarget.set(src.id, dst.id);
        verticalParentOf.set(dst.id, src.id);
        verticalStackEdgeSet.add(idx);
      });

      // LR時: `--`（無向関連）のみで別経路から入力を持つ末端ターゲットに付随する孤立ノードは右側コンパニオン列へ配置
      edges.forEach((e, idx) => {
        if (e.arrow !== 'none' || verticalStackEdgeSet.has(idx)) return;
        const src = nodeById.get(e.from);
        const dst = nodeById.get(e.to);
        if (!src || !dst || src.col != null) return;
        if (collapsedToTarget.has(src.id) || verticalParentOf.has(src.id)) return;
        if ((inDeg.get(src.id) || 0) !== 0 || (outAdj.get(src.id) || []).length !== 1) return;
        if ((inDeg.get(dst.id) || 0) <= 1 || (outAdj.get(dst.id) || []).length > 0) return;
        companionTargetOf.set(src.id, dst.id);
        companionEdgeSet.add(idx);
      });
    }

    const dfsState = new Map(); // 0:未訪問, 1:探索中, 2:完了
    const backEdgeSet = new Set();
    const dfsWalk = (id) => {
      dfsState.set(id, 1);
      (outAdj.get(id) || []).forEach(({ to, idx }) => {
        if (verticalStackEdgeSet.has(idx) || companionEdgeSet.has(idx)) return;
        const st = dfsState.get(to) || 0;
        if (st === 1) {
          backEdgeSet.add(idx);
        } else if (st === 0) {
          dfsWalk(to);
        }
      });
      dfsState.set(id, 2);
    };

    // 入力次数0のノード（起点）から優先的にDFS
    nodes.filter((n) => (inDeg.get(n.id) || 0) === 0 && !collapsedToTarget.has(n.id) && !companionTargetOf.has(n.id)).forEach((n) => {
      if ((dfsState.get(n.id) || 0) === 0) dfsWalk(n.id);
    });
    nodes.forEach((n) => {
      if ((dfsState.get(n.id) || 0) === 0) dfsWalk(n.id);
    });

    const layerMap = new Map();
    nodes.forEach((n) => layerMap.set(n.id, n.col != null ? n.col : 0));

    // 戻り辺・縦積み辺・右側コンパニオン辺を除いたDAG上で最長パス列を決定
    for (let iter = 0; iter < nodes.length; iter++) {
      let changed = false;
      edges.forEach((e, idx) => {
        if (backEdgeSet.has(idx) || verticalStackEdgeSet.has(idx) || companionEdgeSet.has(idx)) return;
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

    // 入力辺を持たない末端起点ノードは接続先直前（minOutCol - 1）へ寄せて線を短縮
    nodes.forEach((n) => {
      if (n.col != null || collapsedToTarget.has(n.id) || companionTargetOf.has(n.id)) return;
      if ((inDeg.get(n.id) || 0) === 0) {
        const outs = (outAdj.get(n.id) || []).map((o) => layerMap.get(o.to)).filter((c) => typeof c === 'number');
        if (outs.length > 0) {
          const minTargetCol = Math.min(...outs);
          if (minTargetCol > 1) {
            layerMap.set(n.id, minTargetCol - 1);
          }
        }
      }
    });

    // 右側コンパニオンノードを接続先の右列へ配置
    companionTargetOf.forEach((dstId, srcId) => {
      const dstNode = nodeById.get(dstId);
      const targetCol = dstNode && dstNode.col != null ? dstNode.col : (layerMap.get(dstId) || 0);
      layerMap.set(srcId, targetCol + 1);
    });

    // 縦積み起点ノードを接続先ターゲットと同列へ揃える
    collapsedToTarget.forEach((dstId, srcId) => {
      const dstNode = nodeById.get(dstId);
      const targetCol = dstNode && dstNode.col != null ? dstNode.col : (layerMap.get(dstId) || 0);
      layerMap.set(srcId, targetCol);
    });

    // 空列を詰めてコンパクトな連続列番号 (0, 1, 2, ...) へ正規化
    const allAutoCols = nodes.every((n) => n.col == null);
    if (allAutoCols) {
      const sortedUnique = Array.from(new Set(Array.from(layerMap.values()))).sort((a, b) => a - b);
      const colRemap = new Map(sortedUnique.map((c, idx) => [c, idx]));
      nodes.forEach((n) => {
        n.col = colRemap.get(layerMap.get(n.id) || 0) || 0;
      });
    } else {
      nodes.forEach((n) => {
        if (n.col == null) n.col = layerMap.get(n.id) || 0;
      });
    }

    // ゾーン同士が同列で重ならない範囲でコンパクトに行を割り当て（接続先の平均行へ寄せて水平直線化）
    const hasExplicitRows = nodes.every((n) => n.row != null);
    if (!hasExplicitRows) {
      const colOccupiedRows = new Map();
      const isBandFree = (minC, maxC, startR, spanH) => {
        for (let c = minC; c <= maxC; c++) {
          const used = colOccupiedRows.get(c);
          if (!used) continue;
          for (let r = startR; r < startR + spanH; r++) {
            if (used.has(r)) return false;
          }
        }
        return true;
      };
      const markBand = (minC, maxC, startR, spanH) => {
        for (let c = minC; c <= maxC; c++) {
          if (!colOccupiedRows.has(c)) colOccupiedRows.set(c, new Set());
          for (let r = startR; r < startR + spanH; r++) {
            colOccupiedRows.get(c).add(r);
          }
        }
      };

      // 明示行があるノード分の占有を先に登録
      nodes.forEach((n) => {
        if (n.row != null) markBand(n.col, n.col, Math.round(n.row), 1);
      });

      zones.forEach((z) => {
        const members = nodes.filter((n) => n.zoneId === z.id);
        if (members.length === 0) return;
        const byCol = new Map();
        let minC = Infinity;
        let maxC = -Infinity;
        members.forEach((m) => {
          if (!byCol.has(m.col)) byCol.set(m.col, []);
          byCol.get(m.col).push(m);
          minC = Math.min(minC, m.col);
          maxC = Math.max(maxC, m.col);
        });
        let maxStack = 1;
        byCol.forEach((list) => {
          if (list.length > maxStack) maxStack = list.length;
        });

        // 既に配置済みの接続相手行（および縦積み子機器の推定行）から理想開始行を算出
        const neighborRows = [];
        const memberSet = new Set(members.map((m) => m.id));
        edges.forEach((e) => {
          const otherId = memberSet.has(e.from) ? e.to : (memberSet.has(e.to) ? e.from : null);
          if (!otherId || memberSet.has(otherId)) return;
          const otherN = nodeById.get(otherId);
          if (!otherN) return;
          if (otherN.row != null) {
            neighborRows.push(otherN.row);
          } else if (verticalParentOf.has(otherN.id)) {
            const vp = nodeById.get(verticalParentOf.get(otherN.id));
            if (vp && vp.row != null) neighborRows.push(vp.row + 1.3);
          }
        });
        const idealStart = neighborRows.length > 0
          ? Math.max(0, Math.round(neighborRows.reduce((a, b) => a + b, 0) / neighborRows.length - (maxStack - 1) / 2))
          : 0;

        let chosenStart = 0;
        const rowCandidates = [];
        for (let r = 0; r <= 20; r++) rowCandidates.push(r);
        rowCandidates.sort((a, b) => (Math.abs(a - idealStart) - Math.abs(b - idealStart)) || (a - b));
        for (const cand of rowCandidates) {
          if (isBandFree(minC, maxC, cand, maxStack)) {
            chosenStart = cand;
            break;
          }
        }

        byCol.forEach((list) => {
          if (list.length === 1 && maxStack > 1) {
            if (list[0].row == null) list[0].row = chosenStart + (maxStack - 1) / 2;
          } else {
            list.forEach((m, rIdx) => {
              if (m.row == null) m.row = chosenStart + rIdx;
            });
          }
        });
        markBand(minC, maxC, chosenStart, maxStack);

        // 同ゾーン内に直下縦積みターゲット(Firebox等)が繋がる場合、直下1行分を予約して重なりを防ぐ
        members.forEach((m) => {
          if (collapsedToTarget.has(m.id)) {
            const child = nodeById.get(collapsedToTarget.get(m.id));
            if (child && !child.zoneId) markBand(child.col, child.col, chosenStart + maxStack, 1);
          }
        });
      });
    }
  }

  // ゾーン見出しを推定幅で自動改行し、複数行時は上余白を拡張
  zones.forEach((z) => {
    const members = nodes.filter((n) => n.zoneId === z.id);
    const minC = members.length ? Math.min(...members.map((m) => m.col || 0)) : 0;
    const maxC = members.length ? Math.max(...members.map((m) => m.col || 0)) : 0;
    const estHeaderW = Math.max(140, (maxC - minC) * (nodeW + colGap) + nodeW + zonePadX * 2 - 22);
    z._hdrLines = wrapNetText(z.label, estHeaderW, 12, true);
    z._padTop = z._hdrLines.length > 1 ? (32 + (z._hdrLines.length - 1) * 16) : zonePadTop;
  });

  // 2. ピクセル座標変換（LR: col->X, row->Y / TD: row->X, col->Y）
  const estMaxCol = nodes.length ? Math.max(...nodes.map((n) => n.col || 0)) : 0;
  const estMinSvgW = Math.max(760, 40 + (estMaxCol + 1) * (nodeW + colGap) - colGap + 72);
  const titleLayout = parsed.title ? layoutSvgTitleLines(parsed.title, estMinSvgW - 64, 18, 12.5) : { lines: [], fontSize: 18 };
  const padLeft = 40;
  const padTop = titleLayout.lines.length > 1 ? 84 : (titleLayout.lines.length === 1 ? 66 : 30);
  const stepX = nodeW + colGap;
  const stepY = effectiveNodeH + rowGap;

  // 列範囲が重なりつつ縦に並ぶゾーン間のみ追加余白を確保（列非重複ゾーンは行Yを揃えて水平直通を維持）
  const zoneYShift = new Map();
  if (parsed.direction !== 'GRID' && zones.length > 1) {
    const orderedZones = zones
      .map((z) => {
        const mems = nodes.filter((n) => n.zoneId === z.id && n.row != null);
        const minR = mems.length ? Math.min(...mems.map((m) => m.row)) : 0;
        const maxR = mems.length ? Math.max(...mems.map((m) => m.row)) : 0;
        const minC = mems.length ? Math.min(...mems.map((m) => m.col)) : 0;
        const maxC = mems.length ? Math.max(...mems.map((m) => m.col)) : 0;
        return { z, minR, maxR, minC, maxC, mems, shift: 0 };
      })
      .filter((item) => item.mems.length > 0)
      .sort((a, b) => (a.minR - b.minR) || (a.minC - b.minC));

    orderedZones.forEach((item, idx) => {
      let extra = 0;
      const itemPadTop = item.z._padTop || zonePadTop;
      const itemTopBase = padTop + item.minR * stepY - itemPadTop;
      const itemIds = new Set(item.mems.map((m) => m.id));
      for (let prevIdx = 0; prevIdx < idx; prevIdx++) {
        const prev = orderedZones[prevIdx];
        const colOverlap = !(prev.maxC < item.minC || item.maxC < prev.minC);
        if (colOverlap && item.minR > prev.maxR) {
          const prevBottomPx = padTop + prev.maxR * stepY + effectiveNodeH + prev.shift + zonePadBottom;
          const prevIds = new Set(prev.mems.map((m) => m.id));
          const hasSameColCrossEdge = edges.some((e) => {
            const s = nodeById.get(e.from);
            const d = nodeById.get(e.to);
            return s && d && s.col === d.col && ((prevIds.has(s.id) && itemIds.has(d.id)) || (itemIds.has(s.id) && prevIds.has(d.id)));
          });
          const requiredGap = hasSameColCrossEdge ? 62 : 22;
          extra = Math.max(extra, Math.ceil((prevBottomPx + requiredGap) - itemTopBase));
        }
      }
      item.shift = extra;
      item.mems.forEach((m) => zoneYShift.set(m.id, extra));
    });
  }

  // 先にゾーン所属ノード・明示座標ノードのピクセル位置とゾーン外枠を確定
  nodes.forEach((n) => {
    n.w = nodeW;
    n.h = effectiveNodeH;
    if (parsed.direction === 'TD') {
      n.x = padLeft + (n.row || 0) * (nodeW + 34);
      n.y = padTop + n.col * (effectiveNodeH + 54);
    } else {
      n.x = padLeft + n.col * stepX;
      if (n.row != null) {
        n.y = padTop + n.row * stepY + (zoneYShift.get(n.id) || 0);
      }
    }
  });

  const zoneBoxes = [];
  const computeZoneBoxes = () => {
    zoneBoxes.length = 0;
    zones.forEach((z) => {
      const members = nodes.filter((n) => n.zoneId === z.id && n.y != null);
      if (members.length === 0) return;
      const pTop = z._padTop || zonePadTop;
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
        y: minY - pTop,
        w: (maxX - minX) + zonePadX * 2,
        h: (maxY - minY) + pTop + zonePadBottom
      });
    });
  };
  computeZoneBoxes();

  // 未所属ノードを配置（直上縦積み親がいる場合はその直下にラベル余白込みで配置）
  if (parsed.direction !== 'GRID' && parsed.direction !== 'TD') {
    const unzoned = nodes.filter((n) => n.y == null);
    unzoned.forEach((u) => {
      const blocked = [];
      zoneBoxes.forEach((zb) => {
        if (!(zb.x + zb.w + 10 < u.x || u.x + u.w + 10 < zb.x)) {
          blocked.push({ top: zb.y - 20, bottom: zb.y + zb.h + 20 });
        }
      });
      nodes.forEach((other) => {
        if (other !== u && other.y != null && other.col === u.col) {
          blocked.push({ top: other.y - 20, bottom: other.y + other.h + 20 });
        }
      });
      const isYFree = (cy) => !blocked.some((b) => !(cy + u.h <= b.top || cy >= b.bottom));

      if (verticalParentOf.has(u.id)) {
        const pNode = nodeById.get(verticalParentOf.get(u.id));
        const pZone = pNode && pNode.zoneId ? zoneBoxes.find((zb) => zb.zone.id === pNode.zoneId) : null;
        const pBottom = pZone ? (pZone.y + pZone.h) : (pNode ? pNode.y + pNode.h : padTop);
        const targetY = Math.round(pBottom + 58);
        u.y = targetY;

        // 親ゾーンと縦積み子機器の間に他ゾーンが割り込んでいれば、他ゾーンを下へ押し下げて直下配置を維持
        const overlapZones = zoneBoxes.filter((zb) =>
          zb.zone.id !== (pNode ? pNode.zoneId : null) &&
          !(zb.x + zb.w + 10 < u.x || u.x + u.w + 10 < zb.x) &&
          zb.y + zb.h > (pZone ? pZone.y : pBottom) &&
          zb.y < targetY + u.h + 24
        );
        if (overlapZones.length > 0) {
          overlapZones.forEach((oz) => {
            const delta = Math.max(0, Math.round(targetY + u.h + 26 - oz.y));
            if (delta > 0) {
              nodes.forEach((mn) => {
                if (mn.zoneId === oz.zone.id && mn.y != null) mn.y += delta;
              });
            }
          });
          computeZoneBoxes();
        }
        return;
      }

      const neighborYs = [];
      edges.forEach((e) => {
        const toN = nodeById.get(e.to);
        const fromN = nodeById.get(e.from);
        if (e.from === u.id && toN && toN.y != null) neighborYs.push(toN.y);
        if (e.to === u.id && fromN && fromN.y != null) neighborYs.push(fromN.y);
      });

      const idealY = neighborYs.length > 0
        ? neighborYs.reduce((a, b) => a + b, 0) / neighborYs.length
        : padTop;

      const candidates = [...neighborYs, idealY, padTop];
      zoneBoxes.forEach((zb) => {
        candidates.push(zb.y - u.h - 22, zb.y + zb.h + 22);
      });
      nodes.forEach((other) => {
        if (other !== u && other.y != null && other.col === u.col) {
          candidates.push(other.y + other.h + rowGap, other.y - u.h - rowGap);
        }
      });

      const valid = candidates.filter((cy) => cy >= padTop && isYFree(cy));
      if (valid.length > 0) {
        valid.sort((a, b) => {
          const aMatch = neighborYs.some((ny) => Math.abs(ny - a) < 1) ? -24 : 0;
          const bMatch = neighborYs.some((ny) => Math.abs(ny - b) < 1) ? -24 : 0;
          return (Math.abs(a - idealY) + aMatch) - (Math.abs(b - idealY) + bMatch);
        });
        u.y = Math.round(valid[0]);
      } else {
        const maxBot = blocked.reduce((m, b) => Math.max(m, b.bottom), padTop);
        u.y = Math.round(maxBot + 4);
      }
    });
    computeZoneBoxes();
  }

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

  // 列跨ぎエッジで中間列ノード・ゾーン枠と交差するものを下側迂回パスとして事前計算（凡例Y確保も兼ねる）
  const bypassInfoByEdge = new Map();
  if (parsed.direction !== 'TD') {
    let bypassStack = 0;
    edges.forEach((e, idx) => {
      const s = nodeById.get(e.from);
      const d = nodeById.get(e.to);
      if (!s || !d || Math.abs(d.col - s.col) <= 1) return;
      const minC = Math.min(s.col, d.col);
      const maxC = Math.max(s.col, d.col);
      const obstacles = [];
      nodes.forEach((n) => {
        if (n.col > minC && n.col < maxC) obstacles.push({ top: n.y, bottom: n.y + n.h });
      });
      zoneBoxes.forEach((zb) => {
        const hasMidMember = nodes.some((n) => n.zoneId === zb.zone.id && n.col > minC && n.col < maxC);
        if (hasMidMember) obstacles.push({ top: zb.y, bottom: zb.y + zb.h });
      });
      if (obstacles.length === 0) return;
      const obsTop = Math.min(...obstacles.map((o) => o.top));
      const obsBot = Math.max(...obstacles.map((o) => o.bottom));
      const yMin = Math.min(s.y + s.h / 2, d.y + d.h / 2);
      const yMax = Math.max(s.y + s.h / 2, d.y + d.h / 2);
      if (!(yMax < obsTop - 16 || yMin > obsBot + 16)) {
        const bypassY = Math.round(obsBot + 32 + bypassStack * 26);
        bypassInfoByEdge.set(idx, { bypassY });
        bypassStack++;
        globalMaxY = Math.max(globalMaxY, bypassY + 22);
      }
    });
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

  const uid = `n${++_networkSvgUidSeq}`;
  const gradIds = {
    ciscoTop: `${uid}-cisco-top`,
    ciscoBody: `${uid}-cisco-body`,
    ciscoBrick: `${uid}-cisco-brick`,
    modScreen: `${uid}-mod-screen`,
    modSilver: `${uid}-mod-silver`,
    modDark: `${uid}-mod-dark`,
    modSky: `${uid}-mod-sky`,
    modBrick: `${uid}-mod-brick`,
    shadow: `${uid}-shadow`,
    arrDefault: `${uid}-arr-default`,
    arrDanger: `${uid}-arr-danger`,
    arrWarn: `${uid}-arr-warn`,
    arrSafe: `${uid}-arr-safe`
  };

  // Defs（3系統アイコン用グラデーション + 矢印マーカー + シャドウ）
  const defs = document.createElementNS(svgNS, 'defs');
  defs.innerHTML = `
    <linearGradient id="${gradIds.ciscoTop}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#0284c7" />
    </linearGradient>
    <linearGradient id="${gradIds.ciscoBody}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0284c7" />
      <stop offset="100%" stop-color="#0c4a6e" />
    </linearGradient>
    <linearGradient id="${gradIds.ciscoBrick}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#dc2626" />
      <stop offset="100%" stop-color="#991b1b" />
    </linearGradient>
    <linearGradient id="${gradIds.modScreen}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="55%" stop-color="#0284c7" />
      <stop offset="100%" stop-color="#1d4ed8" />
    </linearGradient>
    <linearGradient id="${gradIds.modSilver}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f8fafc" />
      <stop offset="55%" stop-color="#e2e8f0" />
      <stop offset="100%" stop-color="#94a3b8" />
    </linearGradient>
    <linearGradient id="${gradIds.modDark}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#475569" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <linearGradient id="${gradIds.modSky}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#e0f2fe" />
      <stop offset="100%" stop-color="#38bdf8" />
    </linearGradient>
    <linearGradient id="${gradIds.modBrick}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ef4444" />
      <stop offset="100%" stop-color="#991b1b" />
    </linearGradient>
    <filter id="${gradIds.shadow}" x="-8%" y="-8%" width="116%" height="116%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="${isDark ? '0.35' : '0.06'}" />
    </filter>
  `;
  registerSvgArrowMarkers(defs, [
    { id: gradIds.arrDefault, color: palette.line, refX: 8, d: 'M 0 1.5 L 8.5 5 L 0 8.5 z' },
    { id: gradIds.arrDanger, color: palette.dangerStroke, refX: 8, d: 'M 0 1.5 L 8.5 5 L 0 8.5 z' },
    { id: gradIds.arrWarn, color: palette.warnStroke, refX: 8, d: 'M 0 1.5 L 8.5 5 L 0 8.5 z' },
    { id: gradIds.arrSafe, color: palette.safeStroke, refX: 8, d: 'M 0 1.5 L 8.5 5 L 0 8.5 z' }
  ]);
  svg.appendChild(defs);

  // 背景
  const bg = document.createElementNS(svgNS, 'rect');
  bg.setAttribute('width', width);
  bg.setAttribute('height', height);
  bg.setAttribute('rx', '10');
  bg.setAttribute('fill', palette.bg);
  svg.appendChild(bg);

  // タイトル
  if (titleLayout.lines.length > 0) {
    titleLayout.lines.forEach((ln, idx) => {
      const tEl = document.createElementNS(svgNS, 'text');
      tEl.setAttribute('x', '32');
      tEl.setAttribute('y', String(titleLayout.lines.length > 1 ? (26 + idx * 21) : 34));
      tEl.setAttribute('font-size', String(titleLayout.fontSize));
      tEl.setAttribute('font-weight', '700');
      tEl.setAttribute('fill', palette.textMain);
      tEl.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
      tEl.textContent = ln;
      svg.appendChild(tEl);
    });
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

    const hdrLines = zone._hdrLines && zone._hdrLines.length > 0 ? zone._hdrLines : [zone.label];
    hdrLines.forEach((hLn, hIdx) => {
      const zLbl = document.createElementNS(svgNS, 'text');
      zLbl.setAttribute('x', x + 12);
      zLbl.setAttribute('y', y + 18 + hIdx * 15);
      zLbl.setAttribute('font-size', '12');
      zLbl.setAttribute('font-weight', '700');
      zLbl.setAttribute('fill', sc.text);
      zLbl.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
      zLbl.textContent = hLn;
      svg.appendChild(zLbl);
    });
  });

  // 4. エッジ描画（線レイヤー先描画 → 角丸ピルバッジ後描画 + 2D重なり回避）
  const colHasZone = new Set(nodes.filter((n) => n.zoneId).map((n) => n.col));
  const outEdgeCount = new Map();
  const inEdgeCount = new Map();
  const pairEdges = new Map();
  edges.forEach((e, idx) => {
    outEdgeCount.set(e.from, (outEdgeCount.get(e.from) || 0) + 1);
    inEdgeCount.set(e.to, (inEdgeCount.get(e.to) || 0) + 1);
    const pairKey = [e.from, e.to].sort().join('::');
    if (!pairEdges.has(pairKey)) pairEdges.set(pairKey, []);
    pairEdges.get(pairKey).push(idx);
  });

  // 同一列間ギャップを通る斜め・段差エッジへ個別の垂直幹レーンを割り当て（同列縦線・迂回線・分岐バスは除外）
  const gapEdgeLanes = new Map();
  const fanOutGapLanes = new Map();
  edges.forEach((e, idx) => {
    const s = nodeById.get(e.from);
    const d = nodeById.get(e.to);
    if (!s || !d || s.col === d.col || bypassInfoByEdge.has(idx) || e.busGroup != null) return;
    if (Math.abs((s.y + s.h / 2) - (d.y + d.h / 2)) >= 2) {
      const gapKey = `${Math.min(s.col, d.col)}-${Math.max(s.col, d.col)}`;
      if (!gapEdgeLanes.has(gapKey)) gapEdgeLanes.set(gapKey, []);
      gapEdgeLanes.get(gapKey).push(idx);
      if ((outEdgeCount.get(e.from) || 0) > 1 && (inEdgeCount.get(e.to) || 0) <= 1 && d.x >= s.x) {
        const foKey = `${e.from}::${gapKey}`;
        if (!fanOutGapLanes.has(foKey)) fanOutGapLanes.set(foKey, []);
        fanOutGapLanes.get(foKey).push(idx);
      }
    }
  });
  // 同一ギャップ内で上昇・下降線の垂直幹が不要に交差しないようレーン順を整列
  const getEdgeCenterYs = (idx) => {
    const s = nodeById.get(edges[idx].from);
    const d = nodeById.get(edges[idx].to);
    return { sy: s.y + s.h / 2, ty: d.y + d.h / 2 };
  };
  gapEdgeLanes.forEach((list) => {
    sortOrthogonalGapLaneIndices(list, getEdgeCenterYs);
  });
  fanOutGapLanes.forEach((list) => {
    sortOrthogonalGapLaneIndices(list, getEdgeCenterYs);
  });

  const edgeLineG = document.createElementNS(svgNS, 'g');
  const edgeLabelG = document.createElementNS(svgNS, 'g');
  const placedBadges = [];

  // 分岐バス対象グループ（LR時：同一始点・全ターゲットが右列・非迂回）
  const busGroupsMap = new Map();
  const busSplitOffsetByGroup = new Map();
  if (parsed.direction !== 'TD') {
    const grouped = new Map();
    edges.forEach((e, idx) => {
      if (e.busGroup == null) return;
      if (!grouped.has(e.busGroup)) grouped.set(e.busGroup, []);
      grouped.get(e.busGroup).push(idx);
    });
    const byGapCol = new Map();
    grouped.forEach((idxs, gid) => {
      if (idxs.length <= 1) return;
      const valid = idxs.every((idx) => {
        const s = nodeById.get(edges[idx].from);
        const d = nodeById.get(edges[idx].to);
        return s && d && d.x > s.x && !bypassInfoByEdge.has(idx);
      });
      if (valid) {
        busGroupsMap.set(gid, idxs);
        const s0 = nodeById.get(edges[idxs[0]].from);
        const minTargetCol = Math.min(...idxs.map((i) => nodeById.get(edges[i].to).col));
        const gKey = `${s0.col}-${minTargetCol}`;
        if (!byGapCol.has(gKey)) byGapCol.set(gKey, []);
        const avgDistY = Math.abs(
          idxs.reduce((acc, i) => acc + nodeById.get(edges[i].to).y + nodeById.get(edges[i].to).h / 2, 0) / idxs.length -
          (s0.y + s0.h / 2)
        );
        byGapCol.get(gKey).push({ gid, avgDistY });
      }
    });
    // 同列ギャップに複数分岐バスがある場合、縦距離が遠いグループほど左側の分岐Xに配置して交差を防ぐ
    byGapCol.forEach((list) => {
      if (list.length <= 1) return;
      list.sort((a, b) => b.avgDistY - a.avgDistY);
      list.forEach((item, pos) => {
        busSplitOffsetByGroup.set(item.gid, (list.length - 1 - pos) * 14);
      });
    });
  }

  // ノード左右端へ集まる複数エッジの接続点Yを進入高さ順に割り当て、線同士の交差を防止
  const leftPortOffsetByEdge = new Map();
  const rightPortOffsetByEdge = new Map();
  if (parsed.direction !== 'TD') {
    const leftPortsMap = new Map();
    const rightPortsMap = new Map();
    const busTrunkAdded = new Set();
    edges.forEach((e, idx) => {
      const s = nodeById.get(e.from);
      const d = nodeById.get(e.to);
      if (!s || !d || s.col === d.col) return;
      const rightHost = d.x >= s.x ? d : s;
      const leftHost = d.x >= s.x ? s : d;
      if (rightHost.x > leftHost.x) {
        const bp = bypassInfoByEdge.get(idx);
        const approachLeftY = bp ? bp.bypassY : (leftHost.y + leftHost.h / 2);
        if (!leftPortsMap.has(rightHost.id)) leftPortsMap.set(rightHost.id, []);
        leftPortsMap.get(rightHost.id).push({ idx, approachY: approachLeftY, otherY: leftHost.y + leftHost.h / 2, isBack: d.x < s.x });

        if (e.busGroup != null && busGroupsMap.has(e.busGroup)) {
          if (!busTrunkAdded.has(e.busGroup)) {
            busTrunkAdded.add(e.busGroup);
            const gIdxs = busGroupsMap.get(e.busGroup);
            const avgY = gIdxs.reduce((acc, i) => {
              const t = nodeById.get(edges[i].to);
              return acc + t.y + t.h / 2;
            }, 0) / gIdxs.length;
            if (!rightPortsMap.has(leftHost.id)) rightPortsMap.set(leftHost.id, []);
            rightPortsMap.get(leftHost.id).push({ idx, groupIdxs: gIdxs, approachY: avgY });
          }
        } else {
          const approachRightY = bp ? bp.bypassY : (rightHost.y + rightHost.h / 2);
          if (!rightPortsMap.has(leftHost.id)) rightPortsMap.set(leftHost.id, []);
          rightPortsMap.get(leftHost.id).push({ idx, approachY: approachRightY });
        }
      }
    });

    leftPortsMap.forEach((list, hostId) => {
      const host = nodeById.get(hostId);
      const portOffs = assignNodeSidePortOffsets(
        list.map((it) => ({ key: it.idx, approachY: it.approachY, priority: (it.isBack ? 10000 : 0) + it.idx })),
        host.y + host.h / 2,
        { mode: 'in' }
      );
      portOffs.forEach((val, idx) => leftPortOffsetByEdge.set(idx, val));
    });

    rightPortsMap.forEach((list, hostId) => {
      const host = nodeById.get(hostId);
      const portOffs = assignNodeSidePortOffsets(
        list.map((it, i) => ({ key: i, approachY: it.approachY, priority: it.idx })),
        host.y + host.h / 2,
        { mode: 'out' }
      );
      portOffs.forEach((val, i) => {
        const it = list[i];
        if (it.groupIdxs) it.groupIdxs.forEach((gi) => rightPortOffsetByEdge.set(gi, val));
        else rightPortOffsetByEdge.set(it.idx, val);
      });
    });
  }

  edges.forEach((e, edgeIdx) => {
    const busIdxs = e.busGroup != null ? busGroupsMap.get(e.busGroup) : null;
    if (busIdxs && busIdxs[0] !== edgeIdx) return;

    const src = nodeById.get(e.from);
    const dst = nodeById.get(e.to);
    if (!src || !dst) return;

    const eColor = e.style === 'danger' ? palette.dangerStroke
      : (e.style === 'warn' ? palette.warnStroke
        : (e.style === 'safe' ? palette.safeStroke : palette.line));
    const markerId = e.style === 'danger' ? gradIds.arrDanger
      : (e.style === 'warn' ? gradIds.arrWarn
        : (e.style === 'safe' ? gradIds.arrSafe : gradIds.arrDefault));

    const appendEdgePath = (dVal, withStart, withEnd) => {
      drawSvgConnector(edgeLineG, dVal, {
        stroke: eColor,
        strokeWidth: e.style === 'danger' || e.style === 'warn' ? '2.2' : '1.8',
        dasharray: e.dotted ? '2.5 4.5' : ((e.dashed || e.wifi) ? '5 4' : null),
        markerStart: withStart ? markerId : null,
        markerEnd: withEnd ? markerId : null
      });
    };

    const pairKey = [e.from, e.to].sort().join('::');
    const pList = pairEdges.get(pairKey) || [edgeIdx];
    const pPos = pList.indexOf(edgeIdx);
    const pairOffset = pList.length > 1 ? (pPos - (pList.length - 1) / 2) * 42 : 0;

    const isFanOut = (outEdgeCount.get(e.from) || 0) > 1;
    const isFanIn = (inEdgeCount.get(e.to) || 0) > 1;
    let x1, y1, x2, y2, anchorX, anchorY;
    let busClampRange = null;
    let labelMinX = null;
    let labelMaxX = null;

    const isSameColVertical = parsed.direction !== 'TD' && src.col === dst.col;

    if (busIdxs) {
      x1 = src.x + src.w;
      y1 = src.y + src.h / 2 + (rightPortOffsetByEdge.get(edgeIdx) || 0);
      const branches = busIdxs.map((bIdx) => {
        const tNode = nodeById.get(edges[bIdx].to);
        const lOff = leftPortOffsetByEdge.get(bIdx) || 0;
        return { tNode, bx: tNode.x, by: tNode.y + tNode.h / 2 + lOff };
      });
      const minTargetX = Math.min(...branches.map((b) => b.bx));
      const minTargetCol = Math.min(...branches.map((b) => b.tNode.col));
      const splitOff = (colHasZone.has(minTargetCol) ? (zonePadX + 18) : 24) + (busSplitOffsetByGroup.get(e.busGroup) || 0);
      const splitX = Math.max(x1 + 36, Math.round(minTargetX - splitOff));
      const spineYs = [y1, ...branches.map((b) => b.by)];
      const spineTop = Math.min(...spineYs);
      const spineBot = Math.max(...spineYs);

      // 共有幹 → 分岐点ドット → 垂直スパイン → 各ターゲット枝線
      appendEdgePath(`M ${x1} ${y1} L ${splitX} ${y1}`, e.arrow === 'back' || e.arrow === 'both', false);
      if (Math.abs(spineBot - spineTop) >= 1) {
        appendEdgePath(`M ${splitX} ${spineTop} L ${splitX} ${spineBot}`, false, false);
      }
      const jDot = document.createElementNS(svgNS, 'circle');
      jDot.setAttribute('cx', splitX);
      jDot.setAttribute('cy', y1);
      jDot.setAttribute('r', '2.8');
      jDot.setAttribute('fill', eColor);
      edgeLineG.appendChild(jDot);

      branches.forEach((b) => {
        appendEdgePath(`M ${splitX} ${b.by} L ${b.bx} ${b.by}`, false, e.arrow === 'forward' || e.arrow === 'both');
      });

      x2 = minTargetX;
      anchorX = Math.round((x1 + 18 + splitX) / 2);
      anchorY = y1;
      busClampRange = [x1 + 8, splitX - 8];
    } else if (parsed.direction === 'TD' || isSameColVertical) {
      x1 = src.x + src.w / 2 + pairOffset;
      x2 = dst.x + dst.w / 2 + pairOffset;
      if (dst.y < src.y) {
        y1 = src.y;
        y2 = dst.y + dst.h;
      } else {
        y1 = src.y + src.h;
        y2 = dst.y;
      }
      const orthV = buildOrthogonalEdgePath(x1, y1, x2, y2, { orientation: 'V' });
      appendEdgePath(orthV.d, e.arrow === 'back' || e.arrow === 'both', e.arrow === 'forward' || e.arrow === 'both');
      anchorX = orthV.anchorX;
      if (isSameColVertical && dst.y >= src.y) {
        const sZb = src.zoneId ? zoneBoxes.find((zb) => zb.zone.id === src.zoneId) : null;
        const dZb = dst.zoneId ? zoneBoxes.find((zb) => zb.zone.id === dst.zoneId) : null;
        const effTop = sZb ? (sZb.y + sZb.h) : y1;
        const effBot = dZb ? dZb.y : y2;
        anchorY = (effTop + effBot) / 2;
      } else {
        anchorY = (y1 + y2) / 2;
      }
    } else {
      const rPortOff = rightPortOffsetByEdge.get(edgeIdx);
      const lPortOff = leftPortOffsetByEdge.get(edgeIdx);
      const isSameLevelPair = pList.length > 1 && Math.abs((src.y + src.h / 2) - (dst.y + dst.h / 2)) < 4;
      if (dst.x < src.x) {
        x1 = src.x;
        y1 = src.y + src.h / 2 + (lPortOff != null ? lPortOff : pairOffset);
        x2 = dst.x + dst.w;
        y2 = dst.y + dst.h / 2 + (isSameLevelPair && lPortOff != null ? lPortOff : (rPortOff != null ? rPortOff : pairOffset));
      } else {
        x1 = src.x + src.w;
        y1 = src.y + src.h / 2 + (isSameLevelPair && lPortOff != null ? lPortOff : (rPortOff != null ? rPortOff : pairOffset));
        x2 = dst.x;
        y2 = dst.y + dst.h / 2 + (lPortOff != null ? lPortOff : pairOffset);
      }

      const bypass = bypassInfoByEdge.get(edgeIdx);
      let dStr;
      if (bypass) {
        const leftX = Math.min(x1, x2);
        const rightX = Math.max(x1, x2);
        const leftN = dst.x < src.x ? dst : src;
        const rightN = dst.x < src.x ? src : dst;
        const lane1X = Math.round(leftX + (colHasZone.has(leftN.col) ? (zonePadX + 14) : 20));
        const lane2X = Math.round(rightX - (colHasZone.has(rightN.col) ? (zonePadX + 28) : 26));
        const bpRes = buildOrthogonalEdgePath(x1, y1, x2, y2, {
          bypassY: bypass.bypassY,
          lane1X,
          lane2X
        });
        dStr = bpRes.d;
        anchorX = bpRes.anchorX;
        anchorY = bpRes.anchorY;
      } else {
        const gapKey = `${Math.min(src.col, dst.col)}-${Math.max(src.col, dst.col)}`;
        const gLanes = gapEdgeLanes.get(gapKey) || [];
        const gIdx = gLanes.indexOf(edgeIdx);
        const gapLeft = Math.min(x1, x2);
        const gapRight = Math.max(x1, x2);
        const gapW = Math.max(40, gapRight - gapLeft);
        const leftNode = dst.x < src.x ? dst : src;
        const rightNode = dst.x < src.x ? src : dst;
        const rightZoneOff = colHasZone.has(rightNode.col) ? (zonePadX + 18) : 16;
        const leftZoneOff = colHasZone.has(leftNode.col) ? (zonePadX + 10) : 10;

        let midX;
        if (Math.abs(y1 - y2) < 2) {
          midX = Math.round((x1 + x2) / 2);
          anchorX = Math.round((gapLeft + leftZoneOff + gapRight - rightZoneOff) / 2);
          anchorY = y1;
        } else if (isFanOut && !isFanIn && dst.x >= src.x) {
          const fLanes = fanOutGapLanes.get(`${e.from}::${gapKey}`) || [];
          const fIdx = Math.max(0, fLanes.indexOf(edgeIdx));
          const laneSpanAvail = Math.max(0, gapW - leftZoneOff - rightZoneOff - 84);
          const laneStep = fLanes.length > 1 ? Math.min(16, Math.max(11, Math.floor(laneSpanAvail / (fLanes.length - 1)))) : 0;
          midX = Math.round(gapLeft + leftZoneOff + 10 + fIdx * laneStep);
          labelMinX = midX + 16;
          anchorX = Math.round((labelMinX + gapRight - rightZoneOff) / 2);
          anchorY = y2;
        } else if (dst.x < src.x) {
          const laneOff = rightZoneOff + (gLanes.length > 1 ? gIdx * 12 : 4);
          midX = Math.round(gapRight - Math.min(gapW * 0.36, laneOff));
          labelMaxX = midX - 16;
          anchorX = Math.round((gapLeft + leftZoneOff + labelMaxX) / 2);
          anchorY = y2;
        } else if (gLanes.length > 1 && Math.abs(y1 - y2) >= 2) {
          const laneOff = rightZoneOff + gIdx * 12;
          midX = Math.round(gapRight - Math.min(gapW * 0.36, laneOff));
          labelMaxX = midX - 16;
          anchorX = Math.round((gapLeft + leftZoneOff + labelMaxX) / 2);
          anchorY = y1;
        } else {
          // 単一ギャップエッジはゾーン余白内の中央を通し、両側ゾーン枠と広い隙間を確保
          midX = Math.round((gapLeft + leftZoneOff + gapRight - rightZoneOff) / 2);
          anchorX = midX;
          anchorY = (y1 + y2) / 2;
        }
        dStr = buildOrthogonalEdgePath(x1, y1, x2, y2, { orientation: 'H', midX }).d;
      }
      appendEdgePath(dStr, e.arrow === 'back' || e.arrow === 'both', e.arrow === 'forward' || e.arrow === 'both');
    }

    let mx = anchorX;
    const my = anchorY;

    // エッジラベル（角丸ピルバッジ：左右ゾーン破線枠・曲がり角との隙間確保＋2D衝突回避）
    if (e.label) {
      let fitRangeX = null;
      if (busClampRange) {
        fitRangeX = busClampRange;
      } else if (parsed.direction !== 'TD') {
        const gLeft = Math.min(x1, x2);
        const gRight = Math.max(x1, x2);
        const lNode = dst.x < src.x ? dst : src;
        const rNode = dst.x < src.x ? src : dst;
        const lPad = colHasZone.has(lNode.col) ? (zonePadX + 8) : 8;
        const rPad = colHasZone.has(rNode.col) ? (zonePadX + 8) : 8;
        const safeLeft = labelMinX != null ? Math.max(gLeft + lPad, labelMinX) : (gLeft + lPad);
        const safeRight = labelMaxX != null ? Math.min(gRight - rPad, labelMaxX) : (gRight - rPad);
        fitRangeX = [
          [safeLeft, safeRight],
          [labelMinX ?? (gLeft + 8), labelMaxX ?? (gRight - 8)],
          [gLeft + 8, gRight - 8]
        ];
      }

      const badgeRes = drawSvgEdgeBadge(edgeLabelG, mx, e.wifi ? (my + 8) : my, e.label, {
        fontSize: 10,
        lineHeight: 13,
        wrapWidth: 92,
        wrapSafety: 1,
        fontWeight: '600',
        fill: e.style === 'default' ? palette.textMuted : eColor,
        bgFill: palette.cardBg,
        stroke: e.style === 'default' ? '#cbd5e1' : eColor,
        strokeWidth: '1.2',
        padX: 16,
        multiPadY: 8,
        minWidth: 40,
        singleHeight: 19,
        placedBoxes: placedBadges,
        fitRangeX
      });
      if (badgeRes) mx = badgeRes.centerX;
    }

    // Wi-Fi電波ミニアイコン（ピルがある場合は線の上側へずらして非重なり）
    if (e.wifi) {
      const wg = document.createElementNS(svgNS, 'g');
      const wifiY = e.label ? (my - 19) : (my - 11);
      wg.setAttribute('transform', `translate(${mx - 9}, ${wifiY})`);
      const wBg = document.createElementNS(svgNS, 'rect');
      wBg.setAttribute('x', '0');
      wBg.setAttribute('y', '0');
      wBg.setAttribute('width', '18');
      wBg.setAttribute('height', '15');
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
      edgeLabelG.appendChild(wg);
    }
  });
  svg.appendChild(edgeLineG);
  svg.appendChild(edgeLabelG);

  // 5. ノード（モノトーン機器アイコン＋リスク箇所バッジ強調）
  const nodeG = document.createElementNS(svgNS, 'g');
  nodes.forEach((n) => {
    const sc = getStyleColors(n.style);
    const cardG = document.createElementNS(svgNS, 'g');
    cardG.setAttribute('filter', `url(#${gradIds.shadow})`);

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

    // 48x48 アイコンをカード上中央へ配置 (mono / cisco / modern 切替対応)
    const iconScale = 1.28;
    const iconWrap = document.createElementNS(svgNS, 'g');
    iconWrap.setAttribute('transform', `translate(${(n.x + (n.w - 48 * iconScale) / 2).toFixed(1)}, ${n.y + 7}) scale(${iconScale})`);
    iconWrap.appendChild(renderNetworkIconGlyph(n.type, parsed.iconTheme || 'mono', sc.iconStroke, palette.iconFill, palette.iconAccent, gradIds, svgNS));
    cardG.appendChild(iconWrap);

    // ノード名（自動折り返し・全行表示）
    const lblLines = n._lblLines && n._lblLines.length > 0 ? n._lblLines : n.label.split('\n');
    lblLines.forEach((ln, idx) => {
      const t = document.createElementNS(svgNS, 'text');
      t.setAttribute('x', n.x + n.w / 2);
      t.setAttribute('y', n.y + 80 + idx * 14);
      t.setAttribute('text-anchor', 'middle');
      t.setAttribute('font-size', '11.5');
      t.setAttribute('font-weight', '700');
      t.setAttribute('fill', n.style === 'danger' ? palette.dangerText : palette.textMain);
      t.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
      t.textContent = ln;
      cardG.appendChild(t);
    });

    // サブテキスト (IPアドレス・補記：カード幅に応じて全行自動折り返し)
    if (n.subLabel) {
      const subLines = n._subLines && n._subLines.length > 0 ? n._subLines : wrapNetText(n.subLabel, n.w - 16, 9.5, false);
      subLines.forEach((sln, sIdx) => {
        const subY = n.y + 80 + lblLines.length * 14 + sIdx * 12;
        const st = document.createElementNS(svgNS, 'text');
        st.setAttribute('x', n.x + n.w / 2);
        st.setAttribute('y', subY);
        st.setAttribute('text-anchor', 'middle');
        st.setAttribute('font-size', '9.5');
        st.setAttribute('fill', n.style === 'warn' ? palette.warnText : (n.style === 'danger' ? palette.dangerText : palette.textMuted));
        st.setAttribute('font-family', 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace');
        st.textContent = sln;
        cardG.appendChild(st);
      });
    }

    // リスク・ステータスバッジ（danger / warn 時は △！ 三角マークを必ず表示）
    const drawAlertTriangle = (parent, cx, cy, fillCol, scale = 1) => {
      const tw = 11 * scale;
      const thTop = 10 * scale;
      const thBot = 9 * scale;
      const tri = document.createElementNS(svgNS, 'polygon');
      tri.setAttribute('points', `${cx},${cy - thTop} ${cx + tw},${cy + thBot} ${cx - tw},${cy + thBot}`);
      tri.setAttribute('fill', fillCol);
      tri.setAttribute('stroke', palette.bg);
      tri.setAttribute('stroke-width', '1.5');
      parent.appendChild(tri);

      const ex = document.createElementNS(svgNS, 'text');
      ex.setAttribute('x', cx);
      ex.setAttribute('y', cy + 6 * scale);
      ex.setAttribute('text-anchor', 'middle');
      ex.setAttribute('font-size', String(11 * scale));
      ex.setAttribute('font-weight', '800');
      ex.setAttribute('fill', '#ffffff');
      ex.textContent = '!';
      parent.appendChild(ex);
    };

    if (n.style === 'danger' || n.style === 'warn' || n.badge) {
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

        if (n.style === 'danger' || n.style === 'warn') {
          drawAlertTriangle(cardG, n.x + 14, n.y + 4, bColor, 1);
        }
      } else {
        drawAlertTriangle(cardG, n.x + n.w - 16, n.y + 4, bColor, 1);
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
          : (item.style === 'safe' ? palette.safeStroke
            : (item.style === 'info' ? palette.infoStroke : palette.line)));
      if (item.kind === 'alert') {
        const ac = item.style === 'warn' ? palette.warnStroke : palette.dangerStroke;
        const cx = item.x + 12;
        const cy = item.y - 2;
        const tri = document.createElementNS(svgNS, 'polygon');
        tri.setAttribute('points', `${cx},${cy - 7} ${cx + 8},${cy + 6} ${cx - 8},${cy + 6}`);
        tri.setAttribute('fill', ac);
        svg.appendChild(tri);
        const ex = document.createElementNS(svgNS, 'text');
        ex.setAttribute('x', cx);
        ex.setAttribute('y', cy + 4);
        ex.setAttribute('text-anchor', 'middle');
        ex.setAttribute('font-size', '8.5');
        ex.setAttribute('font-weight', '800');
        ex.setAttribute('fill', '#ffffff');
        ex.textContent = '!';
        svg.appendChild(ex);
      } else if (item.kind === 'box' || item.kind === 'zone') {
        const r = document.createElementNS(svgNS, 'rect');
        r.setAttribute('x', item.x);
        r.setAttribute('y', item.y - 9);
        r.setAttribute('width', '20');
        r.setAttribute('height', '13');
        r.setAttribute('rx', '3');
        r.setAttribute('fill', item.style === 'danger' ? palette.dangerBg
          : (item.style === 'warn' ? palette.warnBg
            : (item.style === 'info' ? palette.infoBg : palette.safeBg)));
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
          const mk = item.style === 'danger' ? gradIds.arrDanger : (item.style === 'warn' ? gradIds.arrWarn : gradIds.arrDefault);
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

  appendDiagramLabel(container, labelText);
}
