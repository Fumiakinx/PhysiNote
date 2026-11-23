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

    // 画像保存と共通のルールで拡張子付きファイル名を生成
    function generateFileName(text) {
      const previewEl = document.getElementById('formula-preview');
      return window.resolvePhysiNoteFileName('pnt', text, previewEl);
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

      triggerFileDownload(url, fileName);
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
