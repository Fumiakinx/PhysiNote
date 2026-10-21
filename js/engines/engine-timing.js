// ==========================================
// タイミングチャート（波形）構文パーサー & SVG描画エンジン
// ==========================================
function parseTimingChart(text) {
  let clean = text.replace(/\\timing\{([\s\S]*)\}/g, '$1');
  const lines = clean.split(/[;\n]/).map((l) => l.trim()).filter((l) => l.length > 0 && l.includes(':'));
  const signals = [];

  for (const line of lines) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const name = line.slice(0, colonIdx).trim();
    const rawTokens = line.slice(colonIdx + 1).trim();
    if (!name) continue;

    const tokens = [];
    const parts = rawTokens.split(/\s+/);
    for (const part of parts) {
      if (!part) continue;
      if (part.startsWith('=')) {
        tokens.push({ type: 'bus', label: part.slice(1) });
      } else {
        for (let i = 0; i < part.length; i++) {
          const ch = part[i];
          if (ch === '=') {
            tokens.push({ type: 'bus', label: part.slice(i + 1) });
            break;
          } else if (ch.toUpperCase() === 'P') {
            tokens.push({ type: 'clock' });
          } else if (ch === '0' || ch.toUpperCase() === 'L') {
            tokens.push({ type: 'low' });
          } else if (ch === '1' || ch.toUpperCase() === 'H') {
            tokens.push({ type: 'high' });
          } else if (ch.toUpperCase() === 'Z') {
            tokens.push({ type: 'z' });
          } else if (ch.toUpperCase() === 'X') {
            tokens.push({ type: 'x' });
          }
        }
      }
    }

    if (tokens.length > 0) {
      signals.push({ name, tokens });
    }
  }

  return signals;
}

function drawTimingSvg(timingText, container, labelText) {
  container.innerHTML = '';
  const signals = parseTimingChart(timingText);
  if (!signals || signals.length === 0) {
    container.innerHTML = '<span style="color:#ef4444; font-size:12px;">波形構文を解析できませんでした（例: \\timing{ CLK: P P P; DATA: 0 1 0; }）</span>';
    return;
  }

  const maxSteps = Math.max(...signals.map((s) => s.tokens.length));
  if (maxSteps === 0) return;

  // ステップ数に応じた自然で迫力あるステップ幅（76px〜110px）
  const stepW = Math.max(76, Math.min(110, Math.floor(720 / maxSteps)));
  const nameW = 105;
  const rowH = 58;
  const headerH = 32;
  const pad = 18;
  const totalW = nameW + maxSteps * stepW + pad * 2;
  const totalH = headerH + signals.length * rowH + pad * 2;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${totalW} ${totalH}`);
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.style.maxWidth = `${Math.min(Math.max(totalW, 460), 860)}px`;
  svg.style.display = 'block';
  svg.style.margin = '0 auto';
  svg.style.overflow = 'visible';

  const strokeColor = '#1e293b';
  const strokeWidth = 2.4;
  const gridColor = '#e2e8f0';

  // 1. 縦グリッド線とサイクル番号ヘッダー
  for (let s = 0; s <= maxSteps; s++) {
    const gx = pad + nameW + s * stepW;
    const gridLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    gridLine.setAttribute('x1', gx);
    gridLine.setAttribute('y1', pad + headerH);
    gridLine.setAttribute('x2', gx);
    gridLine.setAttribute('y2', totalH - pad);
    gridLine.setAttribute('stroke', gridColor);
    gridLine.setAttribute('stroke-width', 1);
    gridLine.setAttribute('stroke-dasharray', '3,3');
    svg.appendChild(gridLine);

    if (s < maxSteps) {
      const cycleNum = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      cycleNum.setAttribute('x', gx + stepW / 2);
      cycleNum.setAttribute('y', pad + headerH - 10);
      cycleNum.setAttribute('text-anchor', 'middle');
      cycleNum.setAttribute('font-size', '13');
      cycleNum.setAttribute('font-weight', '600');
      cycleNum.setAttribute('font-family', 'ui-monospace, monospace');
      cycleNum.setAttribute('fill', '#64748b');
      cycleNum.textContent = s;
      svg.appendChild(cycleNum);
    }
  }

  // 2. 各シグナル波形を描画
  signals.forEach((sig, rIdx) => {
    const rowY = pad + headerH + rIdx * rowH;
    const yHigh = rowY + 8;
    const yLow = rowY + rowH - 12;
    const yMid = (yHigh + yLow) / 2;

    // 信号名（左端）
    const nameText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    nameText.setAttribute('x', pad + nameW - 14);
    nameText.setAttribute('y', yMid + 5);
    nameText.setAttribute('text-anchor', 'end');
    nameText.setAttribute('font-size', '14.5');
    nameText.setAttribute('font-weight', '700');
    nameText.setAttribute('font-family', 'ui-monospace, SFMono-Regular, Menlo, monospace');
    nameText.setAttribute('fill', '#0d9488');
    nameText.textContent = sig.name;
    svg.appendChild(nameText);

    const startX = pad + nameW;
    let pathD = '';
    let curState = null;
    const transW = 4.2;

    sig.tokens.forEach((tok, tIdx) => {
      const x0 = startX + tIdx * stepW;
      const x1 = x0 + stepW;

      if (tok.type === 'clock') {
        const xMid = (x0 + x1) / 2;
        if (tIdx === 0 || curState === null || curState === 'bus') pathD += `M ${x0},${yLow} `;
        pathD += `L ${x0 + transW},${yHigh} L ${xMid - transW},${yHigh} L ${xMid + transW},${yLow} L ${x1},${yLow} `;
        curState = 'low';
      } else if (tok.type === 'high') {
        if (curState === null || curState === 'bus') {
          pathD += `M ${x0},${yHigh} `;
        } else if (curState === 'low' || curState === 'z') {
          pathD += `L ${x0 + transW},${yHigh} `;
        }
        pathD += `L ${x1},${yHigh} `;
        curState = 'high';
      } else if (tok.type === 'low') {
        if (curState === null || curState === 'bus') {
          pathD += `M ${x0},${yLow} `;
        } else if (curState === 'high' || curState === 'z') {
          pathD += `L ${x0 + transW},${yLow} `;
        }
        pathD += `L ${x1},${yLow} `;
        curState = 'low';
      } else if (tok.type === 'z') {
        if (curState === null || curState === 'bus') {
          pathD += `M ${x0},${yMid} `;
        } else {
          pathD += `L ${x0 + transW},${yMid} `;
        }
        pathD += `L ${x1},${yMid} `;
        curState = 'z';
      } else if (tok.type === 'bus') {
        const busG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        const ptsStr = `${x0 + transW},${yHigh} ${x1 - transW},${yHigh} ${x1},${yMid} ${x1 - transW},${yLow} ${x0 + transW},${yLow} ${x0},${yMid}`;
        poly.setAttribute('points', ptsStr);
        poly.setAttribute('fill', '#f0fdfa');
        poly.setAttribute('stroke', strokeColor);
        poly.setAttribute('stroke-width', strokeWidth);
        busG.appendChild(poly);

        if (tok.label) {
          const lbl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          lbl.setAttribute('x', (x0 + x1) / 2);
          lbl.setAttribute('y', yMid + 4.5);
          lbl.setAttribute('text-anchor', 'middle');
          lbl.setAttribute('font-size', '13.5');
          lbl.setAttribute('font-weight', '700');
          lbl.setAttribute('font-family', 'ui-monospace, monospace');
          lbl.setAttribute('fill', '#0f766e');
          lbl.textContent = tok.label;
          busG.appendChild(lbl);
        }
        svg.appendChild(busG);
        curState = 'bus';
      }
    });

    if (pathD) {
      const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      pathEl.setAttribute('d', pathD.trim());
      pathEl.setAttribute('stroke', strokeColor);
      pathEl.setAttribute('stroke-width', strokeWidth);
      pathEl.setAttribute('fill', 'none');
      pathEl.setAttribute('stroke-linecap', 'round');
      pathEl.setAttribute('stroke-linejoin', 'round');
      svg.appendChild(pathEl);
    }
  });

  container.appendChild(svg);

  if (labelText) {
    const lbl = document.createElement('div');
    lbl.className = 'chem-structure-label';
    lbl.textContent = labelText;
    container.appendChild(lbl);
  }
}
