// ==========================================
// PhysiNote 画像ファイル出力マネージャー (export-manager.js)
// （出力モーダル制御、解像度倍率、PNG/SVG保存、クリップボードコピー処理）
// ==========================================

(function initExportManager() {
  const exportModal = document.getElementById('export-modal');
  const openExportBtn = document.getElementById('open-export-btn');
  const closeExportXBtn = document.getElementById('export-modal-close-x');
  const closeExportFooterBtn = document.getElementById('export-modal-close-footer');
  const exportSizeSlider = document.getElementById('export-size-slider');
  const exportSizeValue = document.getElementById('export-size-value');
  const exportWidthSlider = document.getElementById('export-width-slider');
  const exportWidthValue = document.getElementById('export-width-value');
  const exportPaddingSlider = document.getElementById('export-padding-slider');
  const exportPaddingValue = document.getElementById('export-padding-value');
  const exportTarget = document.getElementById('export-target');
  const exportDownloadBtn = document.getElementById('export-download-btn');
  const exportScaleRadios = document.querySelectorAll('input[name="export-scale"]');
  const exportBgRadios = document.querySelectorAll('input[name="export-bg"]');
  const exportColorRadios = document.querySelectorAll('input[name="export-color-mode"]');
  const exportTableOptions = document.getElementById('export-table-options');
  const exportTableThemeGroup = document.getElementById('export-table-theme-group');
  const exportCellPaddingSlider = document.getElementById('export-cell-padding-slider');
  const exportCellPaddingValue = document.getElementById('export-cell-padding-value');
  const exportTableThemeRadios = document.querySelectorAll('input[name="export-table-theme"]');

  const getPreviewArea = () => document.getElementById('formula-preview');
  const getInputArea = () => document.getElementById('formula-input');

  function openExportModal() {
    if (!exportModal || !exportTarget) return;
    exportModal.classList.add('active');
    exportModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');

    const previewArea = getPreviewArea();
    const inputArea = getInputArea();

    // メインプレビューから数式または構造式要素を複製（変倍transformをリセットして鮮明化）
    exportTarget.innerHTML = '';
    const katexSource = previewArea ? previewArea.querySelector('.katex') : null;
    const diagramContainers = previewArea ? previewArea.querySelectorAll('[class*="-preview-container"], .chem-structure-container') : [];

    if (diagramContainers.length > 0) {
      diagramContainers.forEach((containerEl) => {
        const clone = containerEl.cloneNode(true);

        // chordpro / chordflow の横幅情報を確実に引き継ぐ
        const origCp = containerEl.querySelector('.chordpro-container');
        const cloneCp = clone.querySelector('.chordpro-container');
        if (origCp && cloneCp) {
          const measuredWidth = Math.ceil(origCp.getBoundingClientRect().width);
          if (measuredWidth > 0) cloneCp.dataset.baseWidth = measuredWidth;
        }

        const origCf = containerEl.querySelector('.chordflow-container');
        const cloneCf = clone.querySelector('.chordflow-container');
        if (origCf && cloneCf) {
          const storedBase = parseFloat(origCf.dataset.baseWidth);
          const measuredWidth = Math.ceil(origCf.getBoundingClientRect().width);
          cloneCf.dataset.baseWidth = (storedBase && storedBase > 0) ? storedBase : (measuredWidth > 0 ? measuredWidth : 760);
        }

        exportTarget.appendChild(clone);
      });
    } else if (katexSource) {
      const clone = katexSource.cloneNode(true);
      clone.style.transform = 'none';
      clone.querySelectorAll('*').forEach((el) => {
        if (el.style.transform) el.style.transform = 'none';
      });
      clone.dataset.baseFontSize = '26';
      exportTarget.appendChild(clone);
    } else {
      const fallback = document.createElement('div');
      fallback.textContent = (inputArea && inputArea.value) || '数式が入力されていません';
      fallback.style.padding = '8px';
      fallback.style.color = '#64748b';
      fallback.dataset.baseFontSize = '14';
      exportTarget.appendChild(fallback);
    }

    // 横幅スライダーのリセット（初期値100%）
    if (exportWidthSlider) {
      exportWidthSlider.value = '100';
    }

    // 表の色合いラジオボタンを「デフォルト（元の指定色）」にリセット
    const defaultThemeRadio = document.querySelector('input[name="export-table-theme"][value="default"]');
    if (defaultThemeRadio) {
      defaultThemeRadio.checked = true;
    }

    // 表専用オプションの表示/非表示（エクスポート対象に表または日程表が含まれる場合のみ表示）
    const hasTable = exportTarget.querySelector('.physi-table, .matrix-schedule-table') !== null;
    if (exportTableOptions) {
      exportTableOptions.style.display = hasTable ? 'block' : 'none';
    }

    // 表の初期基準幅を退避（エディタ画面の表示幅をそのまま初期値とする）
    const targetTable = exportTarget.querySelector('.physi-table, .matrix-schedule-table');
    if (targetTable && previewArea) {
      const origTable = previewArea.querySelector('.physi-table, .matrix-schedule-table');
      const origContainer = previewArea.querySelector('.table-preview-container, .matrix-preview-container');
      let naturalWidth = 0;
      if (origTable) {
        naturalWidth = Math.round(origTable.getBoundingClientRect().width);
      }
      if (origContainer) {
        const containerStyle = window.getComputedStyle(origContainer);
        const padLeft = parseFloat(containerStyle.paddingLeft) || 0;
        const padRight = parseFloat(containerStyle.paddingRight) || 0;
        const containerInnerWidth = Math.round(origContainer.clientWidth - padLeft - padRight);
        if (containerInnerWidth > naturalWidth) {
          naturalWidth = containerInnerWidth;
        }
      }
      if (!naturalWidth || naturalWidth < 300) {
        naturalWidth = targetTable.scrollWidth || 700;
      }
      targetTable.dataset.baseTableWidth = naturalWidth.toFixed(0);
    }

    // クローン内のSVGの初期基準寸法を退避（viewBox の設計寸法を最優先とし、原寸大・高解像度を確保）
    const origSvgs = previewArea ? previewArea.querySelectorAll('svg') : [];
    exportTarget.querySelectorAll('svg').forEach((svg, idx) => {
      let baseW = null;
      let baseH = null;

      // 1. viewBox から設計寸法（ネイティブサイズ）を取得
      const vb = svg.getAttribute('viewBox');
      if (vb) {
        const parts = vb.trim().split(/\s+/).map(Number);
        if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
          baseW = parts[2];
          baseH = parts[3];
        }
      }

      // 2. SVG属性（width / height）にピクセル数値が指定されている場合
      if (!baseW || !baseH) {
        const rawW = svg.getAttribute('width') || '';
        const rawH = svg.getAttribute('height') || '';
        if (rawW && !rawW.includes('%')) baseW = parseFloat(rawW);
        if (rawH && !rawH.includes('%')) baseH = parseFloat(rawH);
      }

      // 3. 上記がない場合、エディタ画面での実測表示幅をフォールバックとして採用
      if (!baseW || !baseH) {
        const origSvg = origSvgs[idx];
        if (origSvg) {
          baseW = Math.round(origSvg.getBoundingClientRect().width);
          baseH = Math.round(origSvg.getBoundingClientRect().height);
        }
      }

      svg.dataset.baseWidth = baseW || 400;
      svg.dataset.baseHeight = baseH || 300;
    });

    updateExportStyle();
  }

  function closeExportModal() {
    if (!exportModal) return;
    exportModal.classList.remove('active');
    exportModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }

  function updateExportStyle() {
    if (!exportTarget || !exportPaddingSlider) return;

    // 横幅（倍率）の反映
    const widthPercent = (exportWidthSlider && parseInt(exportWidthSlider.value, 10)) || 100;
    if (exportWidthValue) {
      exportWidthValue.textContent = `${widthPercent}%`;
    }
    const widthRatio = widthPercent / 100;

    // 1. 記号・画像サイズ（倍率）と横幅（倍率）の反映
    if (exportSizeSlider && exportSizeValue) {
      const sizePercent = parseInt(exportSizeSlider.value, 10) || 100;
      exportSizeValue.textContent = `${sizePercent}%`;
      const scale = sizePercent / 100;

      // SVG（波形・回路図・化学構造式・ダイアグラム全般）の寸法変倍
      exportTarget.querySelectorAll('svg').forEach((svg) => {
        const baseW = parseFloat(svg.dataset.baseWidth);
        const baseH = parseFloat(svg.dataset.baseHeight);
        if (baseW && baseH) {
          svg.setAttribute('width', (baseW * scale * widthRatio).toFixed(1));
          svg.setAttribute('height', (baseH * scale).toFixed(1));
          if (widthRatio !== 1) {
            if (!svg.dataset.origPreserveAspectRatio) {
              svg.dataset.origPreserveAspectRatio = svg.getAttribute('preserveAspectRatio') || 'xMidYMid meet';
            }
            svg.setAttribute('preserveAspectRatio', 'none');
          } else if (svg.dataset.origPreserveAspectRatio) {
            svg.setAttribute('preserveAspectRatio', svg.dataset.origPreserveAspectRatio);
          }
        }
      });

      // KaTeX数式の文字サイズ変倍（最外層のみに適用し累積縮小を防止）
      exportTarget.querySelectorAll('.katex').forEach((kEl) => {
        if (kEl.parentElement && kEl.parentElement.closest('.katex')) return;
        if (kEl.closest('.physi-table')) {
          kEl.style.fontSize = '';
          return;
        }
        const baseFs = parseFloat(kEl.dataset.baseFontSize || '26');
        kEl.style.fontSize = `${(baseFs * scale).toFixed(1)}px`;
      });

      // テキスト・フォールバックの文字サイズ変倍
      exportTarget.querySelectorAll('[data-base-font-size]').forEach((el) => {
        if (!el.classList.contains('katex')) {
          const baseFs = parseFloat(el.dataset.baseFontSize);
          el.style.fontSize = `${(baseFs * scale).toFixed(1)}px`;
        }
      });

      // 表（テーブル）の文字サイズ変倍
      exportTarget.querySelectorAll('.physi-table, .matrix-schedule-table').forEach((tbl) => {
        tbl.style.fontSize = `${(14 * scale).toFixed(1)}px`;
      });

      // コード進行の文字サイズ変倍
      exportTarget.querySelectorAll('.chordpro-container').forEach((cp) => {
        cp.style.fontSize = `${(15 * scale).toFixed(1)}px`;
      });
    }

    // 2. 余白（パディング）の反映
    const padding = exportPaddingSlider.value;
    exportPaddingValue.textContent = `${padding}px`;
    exportTarget.style.padding = `${padding}px`;

    // 3. 背景色
    const selectedBg = document.querySelector('input[name="export-bg"]:checked')?.value || 'white';
    if (selectedBg === 'transparent') {
      exportTarget.classList.add('transparent-bg');
    } else {
      exportTarget.classList.remove('transparent-bg');
    }

    // 4. 配色
    const selectedColorMode = document.querySelector('input[name="export-color-mode"]:checked')?.value || 'color';
    const tableEl = exportTarget.querySelector('.physi-table, .matrix-schedule-table');
    if (selectedColorMode === 'monochrome') {
      exportTarget.classList.add('monochrome-mode');
      if (exportTableThemeGroup) exportTableThemeGroup.style.display = 'none';
    } else {
      exportTarget.classList.remove('monochrome-mode');
      if (exportTableThemeGroup) {
        exportTableThemeGroup.style.display = tableEl ? 'block' : 'none';
      }
    }

    // 5. 表（テーブル）専用オプションの反映
    if (tableEl) {
      const baseWidth = parseFloat(tableEl.dataset.baseTableWidth) || 700;
      const calcWidth = Math.round(baseWidth * widthRatio);
      tableEl.style.width = `${calcWidth}px`;
      tableEl.style.minWidth = `${calcWidth}px`;

      if (exportCellPaddingSlider && exportCellPaddingValue) {
        const padPercent = parseInt(exportCellPaddingSlider.value, 10) || 100;
        exportCellPaddingValue.textContent = `${padPercent}%`;
        const ratio = padPercent / 100;

        const padY = Math.max(1, parseFloat((9 * ratio).toFixed(1)));
        const padYtd = Math.max(1, parseFloat((8 * ratio).toFixed(1)));
        const padX = Math.max(3, parseFloat((15 * ratio).toFixed(1)));
        const lineH = Math.max(1.15, Math.min(1.6, parseFloat((1.1 + 0.35 * ratio).toFixed(2))));

        tableEl.style.setProperty('--cell-pad-y', `${padY}px`);
        tableEl.style.setProperty('--cell-pad-x', `${padX}px`);
        tableEl.style.lineHeight = `${lineH}`;

        tableEl.querySelectorAll('th').forEach((th) => {
          th.style.padding = `${padY}px ${padX}px`;
          th.style.lineHeight = `${lineH}`;
        });
        tableEl.querySelectorAll('td').forEach((td) => {
          td.style.padding = `${padYtd}px ${padX}px`;
          td.style.lineHeight = `${lineH}`;
        });
      }

      tableEl.classList.remove(
        'table-theme-blue',
        'table-theme-slate',
        'table-theme-emerald',
        'table-theme-purple',
        'table-theme-amber',
        'table-theme-rose',
        'table-theme-cyan',
        'table-theme-navy'
      );

      const selectedTheme = document.querySelector('input[name="export-table-theme"]:checked')?.value || 'default';
      if (selectedTheme !== 'default') {
        tableEl.classList.add(`table-theme-${selectedTheme}`);
      }
    }

    // 6. コード進行 (ChordPro) の横幅反映
    const chordproEl = exportTarget.querySelector('.chordpro-container');
    if (chordproEl) {
      const baseWidth = parseFloat(chordproEl.dataset.baseWidth);
      if (widthRatio === 1 || !baseWidth) {
        chordproEl.style.width = 'fit-content';
        chordproEl.style.maxWidth = 'fit-content';
      } else {
        const calcWidth = Math.round(baseWidth * widthRatio);
        chordproEl.style.width = `${calcWidth}px`;
        chordproEl.style.maxWidth = `${calcWidth}px`;
      }
    }

    // 7. ギターコード図 (guitarchords) の横幅反映
    const guitarEl = exportTarget.querySelector('.guitarchords-container');
    if (guitarEl) {
      const baseWidth = parseFloat(guitarEl.dataset.baseWidth) || 720;
      const calcWidth = Math.round(baseWidth * widthRatio);
      guitarEl.style.width = `${calcWidth}px`;
      guitarEl.style.maxWidth = `${calcWidth}px`;
    }

    // 8. コード進行フロー (ChordFlow) の横幅反映
    const chordFlowEl = exportTarget.querySelector('.chordflow-container');
    if (chordFlowEl) {
      const baseWidth = parseFloat(chordFlowEl.dataset.baseWidth) || 760;
      const calcWidth = Math.round(baseWidth * widthRatio);
      chordFlowEl.style.width = `${calcWidth}px`;
      chordFlowEl.style.maxWidth = `${calcWidth}px`;
    }
  }

  // コントロール変更イベント
  if (exportSizeSlider) exportSizeSlider.addEventListener('input', updateExportStyle);
  if (exportWidthSlider) exportWidthSlider.addEventListener('input', updateExportStyle);
  if (exportPaddingSlider) exportPaddingSlider.addEventListener('input', updateExportStyle);
  if (exportCellPaddingSlider) exportCellPaddingSlider.addEventListener('input', updateExportStyle);
  exportBgRadios.forEach((radio) => radio.addEventListener('change', updateExportStyle));
  exportColorRadios.forEach((radio) => radio.addEventListener('change', updateExportStyle));
  exportTableThemeRadios.forEach((radio) => radio.addEventListener('change', updateExportStyle));

  if (openExportBtn) openExportBtn.addEventListener('click', openExportModal);
  if (closeExportXBtn) closeExportXBtn.addEventListener('click', closeExportModal);
  if (closeExportFooterBtn) closeExportFooterBtn.addEventListener('click', closeExportModal);

  if (exportModal) {
    exportModal.addEventListener('click', (e) => {
      if (e.target === exportModal) closeExportModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && exportModal && exportModal.classList.contains('active')) {
      closeExportModal();
    }
  });

  // PNG画像の生成とダウンロード実行
  if (exportDownloadBtn) {
    exportDownloadBtn.addEventListener('click', async () => {
      if (typeof html2canvas === 'undefined') {
        alert('画像化ライブラリの読み込みに失敗しました。ページを再読み込みしてください。');
        return;
      }

      const scaleVal = parseFloat(document.querySelector('input[name="export-scale"]:checked')?.value || '2');
      const selectedBg = document.querySelector('input[name="export-bg"]:checked')?.value || 'white';
      const bgColor = selectedBg === 'transparent' ? null : '#ffffff';
      const selectedColorMode = document.querySelector('input[name="export-color-mode"]:checked')?.value || 'color';

      const originalBtnHtml = exportDownloadBtn.innerHTML;
      exportDownloadBtn.disabled = true;
      exportDownloadBtn.innerHTML = '<span class="icon">⏳</span> 画像生成中...';

      try {
        const hasKatex = exportTarget.querySelector('.katex') !== null;
        let canvas;

        if (!hasKatex && exportTarget.querySelector('svg')) {
          const targetRect = exportTarget.getBoundingClientRect();
          const targetW = Math.max(Math.round(targetRect.width), 10);
          const targetH = Math.max(Math.round(targetRect.height), 10);

          canvas = document.createElement('canvas');
          canvas.width = Math.round(targetW * scaleVal);
          canvas.height = Math.round(targetH * scaleVal);
          const ctx = canvas.getContext('2d');
          ctx.scale(scaleVal, scaleVal);

          if (bgColor) {
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, targetW, targetH);
          }

          if (selectedColorMode === 'monochrome') {
            ctx.filter = 'grayscale(100%)';
          }

          const svgs = Array.from(exportTarget.querySelectorAll('svg'));
          for (const svg of svgs) {
            if (!svg.getAttribute('xmlns')) {
              svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            }
            const xml = new XMLSerializer().serializeToString(svg);
            const blob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const img = new Image();
            await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
              img.src = url;
            });
            URL.revokeObjectURL(url);

            const svgRect = svg.getBoundingClientRect();
            const relX = svgRect.left - targetRect.left;
            const relY = svgRect.top - targetRect.top;
            ctx.drawImage(img, relX, relY, svgRect.width, svgRect.height);
          }
        } else {
          canvas = await html2canvas(exportTarget, {
            scale: scaleVal,
            backgroundColor: bgColor,
            useCORS: true,
            logging: false
          });
        }

        // ファイル名自動決定
        const getExportImageFileName = () => {
          const inputEl = getInputArea();
          const text = (inputEl && inputEl.value) ? inputEl.value : '';
          let title = '';

          const mTitle = text.match(/(?:^|[\n\r;])\s*(?:title|タイトル)\s*:\s*(?:"([^"\n\r]+)"|'([^'\n\r]+)'|([^;\n\r]+))/i);
          if (mTitle) title = (mTitle[1] || mTitle[2] || mTitle[3] || '').trim();

          if (!title) {
            const mComp = text.match(/(?:^|[\n\r;])\s*(?:company|企業名)\s*:\s*(?:"([^"\n\r]+)"|'([^'\n\r]+)'|([^;\n\r]+))/i);
            const mPeriod = text.match(/(?:^|[\n\r;])\s*(?:period|決算期)\s*:\s*(?:"([^"\n\r]+)"|'([^'\n\r]+)'|([^;\n\r]+))/i);
            if (mComp) {
              const compStr = (mComp[1] || mComp[2] || mComp[3] || '').trim();
              const periodStr = mPeriod ? (mPeriod[1] || mPeriod[2] || mPeriod[3] || '').trim() : '';
              title = periodStr ? `${compStr}_${periodStr}` : compStr;
            }
          }

          if (!title) {
            const mMacro = text.match(/\\(?:title|caption|section)\s*\{([^}]+)\}/i);
            if (mMacro && mMacro[1].trim()) title = mMacro[1].trim();
          }

          if (!title) {
            const lines = text.split(/[\r\n]+/);
            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed) continue;
              const mComm = trimmed.match(/^(?:#|\/\/)\s*(?:(?:タイトル[:：]\s*)?(.+))$/);
              if (mComm && mComm[1] && !mComm[1].startsWith('==') && !mComm[1].startsWith('--') && !mComm[1].startsWith('1.') && !mComm[1].startsWith('2.')) {
                title = mComm[1].trim();
                break;
              }
            }
          }

          if (!title && typeof exportTarget !== 'undefined' && exportTarget) {
            const titleEl = exportTarget.querySelector('.chart-title, .diagram-title, .table-title, .bs-header-title, .pl-header-title, [class*="-title"]');
            if (titleEl && titleEl.textContent && titleEl.textContent.trim()) {
              title = titleEl.textContent.trim();
            }
          }

          if (title) {
            let safeName = title.replace(/[\/\\:*?"<>|]/g, '_').replace(/[\r\n\t]+/g, ' ').trim();
            if (safeName.length > 60) safeName = safeName.substring(0, 60).trim();
            if (safeName) return `${safeName}.png`;
          }

          return `physinote_formula_${Date.now()}.png`;
        };

        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = getExportImageFileName();
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        closeExportModal();
      } catch (err) {
        console.error('画像生成エラー:', err);
        alert('画像の生成に失敗しました: ' + err.message);
      } finally {
        exportDownloadBtn.disabled = false;
        exportDownloadBtn.innerHTML = originalBtnHtml;
      }
    });
  }
})();

