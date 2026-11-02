// ==========================================
// PhysiNote 描画エンジン動的遅延ローダー (engine-loader.js)
// （file:// プロトコルおよび Web サーバーの両方で安全に非同期ロード）
// ==========================================

const EngineLoader = (() => {
  const loadedEngines = new Set();
  const loadingPromises = new Map();

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
    'chem-struct': 'engine-chem.js'
  };

  /**
   * 指定されたエンジンを非同期ロード
   * @param {string} engineId 
   * @returns {Promise<void>}
   */
  function loadEngine(engineId) {
    const fileName = ENGINE_MAP[engineId] || (engineId.startsWith('engine-') ? `${engineId}.js` : `engine-${engineId}.js`);
    
    if (loadedEngines.has(fileName)) {
      return Promise.resolve();
    }
    if (loadingPromises.has(fileName)) {
      return loadingPromises.get(fileName);
    }

    const promise = new Promise((resolve, reject) => {
      // 既存のスクリプトタグがあればそれを確認
      const existingScript = document.querySelector(`script[src*="${fileName}"]`);
      if (existingScript && loadedEngines.has(fileName)) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `js/engines/${fileName}`;
      script.async = true;
      script.onload = () => {
        loadedEngines.add(fileName);
        loadingPromises.delete(fileName);
        resolve();
      };
      script.onerror = (err) => {
        loadingPromises.delete(fileName);
        console.error(`エンジン [${fileName}] の読み込みに失敗しました:`, err);
        reject(err);
      };
      document.head.appendChild(script);
    });

    loadingPromises.set(fileName, promise);
    return promise;
  }

  /**
   * 指定されたエンジンがロード済みか判定
   * @param {string} engineId 
   * @returns {boolean}
   */
  function isLoaded(engineId) {
    const fileName = ENGINE_MAP[engineId] || (engineId.startsWith('engine-') ? `${engineId}.js` : `engine-${engineId}.js`);
    return loadedEngines.has(fileName);
  }

  return {
    loadEngine,
    isLoaded,
    ENGINE_MAP
  };
})();

if (typeof window !== 'undefined') {
  window.EngineLoader = EngineLoader;
}

