// ==========================================
// PhysiNote 描画エンジン動的遅延ローダー (engine-loader.js)
// （file:// プロトコルおよび Web サーバーの両方で安全に非同期ロード）
// ==========================================

const EngineLoader = (() => {
  const loadedEngines = new Set();
  const loadingPromises = new Map();
  const LIBRARY_SCRIPT_SRC = 'js/data/diagram-libraries.js';

  // 図種 ID とエンジンファイル名のマッピング定義
  const ENGINE_MAP = {
    chart: 'engine-chart.js',
    pyramid: 'engine-pyramid.js',
    radar: 'engine-radar.js',
    waterfall: 'engine-waterfall.js',
    treemap: 'engine-treemap.js',
    gantt: 'engine-gantt.js',
    capitaltree: 'engine-capitaltree.js',
    radialtree: 'engine-radialtree.js',
    orgchart: 'engine-orgchart.js',
    blockdiagram: 'engine-blockdiagram.js',
    sequence: 'engine-sequence.js',
    optics: 'engine-optics.js',
    energylevel: 'engine-energylevel.js',
    potential: 'engine-potential.js',
    flowchart: 'engine-flowchart.js',
    sankey: 'engine-sankey.js',
    bs: 'engine-bs.js',
    pl: 'engine-pl.js',
    fsm: 'engine-fsm.js',
    timing: 'engine-timing.js',
    circuit: 'engine-circuit.js',
    feynman: 'engine-feynman.js',
    chordpro: 'engine-chordpro.js',
    guitarchords: 'engine-guitarchords.js',
    chordflow: 'engine-chordflow.js',
    neuralnet: 'engine-nn.js',
    nn: 'engine-nn.js',
    graph: 'engine-graph.js',
    venn: 'engine-venn.js',
    fishbone: 'engine-fishbone.js',
    swot: 'engine-swot.js',
    cycle: 'engine-cycle.js',
    roadmap: 'engine-roadmap.js',
    crystal: 'engine-crystal.js',
    scenario: 'engine-scenario.js',
    tensor: 'engine-tensor.js',
    matrixmap: 'engine-matrix.js',
    'tikz-matrix': 'engine-matrix.js',
    matrix: 'engine-matrix.js',
    bytefield: 'engine-bytefield.js',
    table: 'engine-table.js',
    chem: 'engine-chem.js',
    'chem-struct': 'engine-chem.js',
    code: 'engine-code.js',
    terminal: 'engine-code.js',
    network: 'engine-network.js',
    netdiag: 'engine-network.js',
    techstack: 'engine-techstack.js',
    softwarestack: 'engine-techstack.js',
    stack: 'engine-techstack.js'
  };

  /**
   * 任意のスクリプトを一度だけ非同期ロードする内部ヘルパー
   * @param {string} cacheKey
   * @param {string} src
   * @returns {Promise<void>}
   */
  function loadScriptOnce(cacheKey, src) {
    if (loadedEngines.has(cacheKey)) {
      return Promise.resolve();
    }
    if (loadingPromises.has(cacheKey)) {
      return loadingPromises.get(cacheKey);
    }

    const promise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector(`script[src*="${src}"]`);
      if (existingScript && loadedEngines.has(cacheKey)) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = () => {
        loadedEngines.add(cacheKey);
        loadingPromises.delete(cacheKey);
        resolve();
      };
      script.onerror = (err) => {
        loadingPromises.delete(cacheKey);
        console.error(`スクリプト [${src}] の読み込みに失敗しました:`, err);
        reject(err);
      };
      document.head.appendChild(script);
    });

    loadingPromises.set(cacheKey, promise);
    return promise;
  }

  /**
   * 図種 ID からエンジンファイル名を解決する
   * @param {string} engineId
   * @returns {string}
   */
  function resolveEngineFileName(engineId) {
    return ENGINE_MAP[engineId] || (engineId.startsWith('engine-') ? `${engineId}.js` : `engine-${engineId}.js`);
  }

  /**
   * 指定されたエンジンを非同期ロード
   * @param {string} engineId 
   * @returns {Promise<void>}
   */
  function loadEngine(engineId) {
    const fileName = resolveEngineFileName(engineId);
    return loadScriptOnce(fileName, `js/engines/${fileName}`);
  }

  /**
   * ダイアグラム・数式ライブラリプリセットデータを遅延ロード
   * @returns {Promise<void>}
   */
  function loadLibraries() {
    if (typeof formulaLibrary !== 'undefined') {
      loadedEngines.add(LIBRARY_SCRIPT_SRC);
      return Promise.resolve();
    }
    return loadScriptOnce(LIBRARY_SCRIPT_SRC, LIBRARY_SCRIPT_SRC);
  }

  /**
   * 指定されたエンジンがロード済みか判定
   * @param {string} engineId 
   * @returns {boolean}
   */
  function isLoaded(engineId) {
    return loadedEngines.has(resolveEngineFileName(engineId));
  }

  return {
    loadEngine,
    loadLibraries,
    isLoaded,
    ENGINE_MAP
  };
})();

if (typeof window !== 'undefined') {
  window.EngineLoader = EngineLoader;
}

