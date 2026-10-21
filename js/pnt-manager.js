// ==========================================
// PhysiNote - 構文ファイル (.pnt) 保存・読込マネージャー
// ==========================================

(function () {
  'use strict';

  function initPntManager() {
    const saveBtn = document.getElementById('save-pnt-btn');
    const loadBtn = document.getElementById('load-pnt-btn');
    const fileInput = document.getElementById('pnt-file-input');
    const inputArea = document.getElementById('formula-input');

    if (!saveBtn || !loadBtn || !fileInput || !inputArea) {
      return;
    }

    // テキストから適切なファイル名を推測・サニタイズ生成
    function generateFileName(text) {
      const now = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const timeStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`;

      let baseName = '';
      const lines = text.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        // タイトルやコメントの抽出
        const titleMatch = trimmed.match(/^(?:#|\/\/|title:|タイトル[:：])\s*(.+)$/i);
        if (titleMatch && titleMatch[1].trim()) {
          baseName = titleMatch[1].trim();
          break;
        }
      }

      if (baseName) {
        // 使用禁止文字をアンダースコアに置換
        baseName = baseName.replace(/[\/\\:*?"<>|]/g, '_').substring(0, 50).trim();
      }

      if (!baseName) {
        baseName = `diagram_${timeStr}`;
      }

      return `${baseName}.pnt`;
    }

    // 構文テキストをエディタに反映してプレビューを再描画
    function applyTextToEditor(text) {
      inputArea.value = text;
      inputArea.dispatchEvent(new Event('input'));
      // スクロールを先頭に戻す
      inputArea.scrollTop = 0;
    }

    // ファイル読込処理（.pnt または .txt）
    function handleFile(file) {
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        applyTextToEditor(content);
      };
      reader.onerror = () => {
        alert('ファイルの読み込みに失敗しました。');
      };
      reader.readAsText(file, 'UTF-8');
    }

    // 1. 保存 (.pnt)
    saveBtn.addEventListener('click', () => {
      const text = inputArea.value;
      if (!text.trim()) {
        alert('保存する構文が入力されていません。');
        return;
      }

      const fileName = generateFileName(text);
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });

    // 2. 開く (ファイルダイアログ)
    loadBtn.addEventListener('click', () => {
      fileInput.value = '';
      fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        handleFile(file);
      }
    });

    // 3. テキストエリアへのドラッグ＆ドロップ対応
    ['dragenter', 'dragover'].forEach((eventName) => {
      inputArea.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        inputArea.classList.add('drag-over');
      });
    });

    ['dragleave', 'dragend', 'drop'].forEach((eventName) => {
      inputArea.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        inputArea.classList.remove('drag-over');
      });
    });

    inputArea.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      if (dt && dt.files && dt.files.length > 0) {
        handleFile(dt.files[0]);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPntManager);
  } else {
    initPntManager();
  }
})();
