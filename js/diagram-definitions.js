// ==========================================
// PhysiNote ダイアグラム定義マスター (diagram-definitions.js)
// （入力欄インジケーター判定 & プレビュー描画ルーティングの一元管理）
// ==========================================

const DIAGRAM_DEFINITIONS = [
  // 1. ウォーターフォール図 (pgfplots / TikZ または \waterfall) ※\begin{axis}より優先
  {
    id: 'waterfall',
    match: (t) => /\\(waterfall|cascade)\{/i.test(t) || (t.includes('\\begin{tikzpicture}') && (t.includes('ybar stacked') || /waterfall|滝/i.test(t))),
    badge: {
      text: '独自書式 / LaTeX (ウォーターフォール図)',
      cls: 'badge-custom',
      desc: '\\waterfall{ title: ...; unit: 単位; bar: 項目名 (値) [type]; } または pgfplots / TikZ'
    },
    cls: 'waterfall-preview-container',
    label: 'ウォーターフォール図',
    getFn: () => typeof drawWaterfallSvg === 'function' ? drawWaterfallSvg : null
  },
  // 2. グラフ・統計チャート（pgfplots / pgf-pie / 独自 \chart）
  {
    id: 'chart',
    match: (t) => /\\(chart|barchart|linechart|piechart|donutchart|areachart)\{|\\pie(?:\[[^\]]*\])?\{|\\begin\{axis\}|\\addplot/i.test(t),
    badge: {
      text: 'グラフ・統計チャート (棒・折れ線・円)',
      cls: 'badge-custom',
      desc: '\\chart{ type: bar; categories: "A","B"; series: "値", 10, 20; } または \\begin{axis}'
    },
    cls: 'chart-preview-container',
    label: 'グラフ・統計チャート',
    getFn: () => typeof drawChartSvg === 'function' ? drawChartSvg : null
  },
  // 2. ピラミッド図・階層図 (smartdiagram priority または \pyramid)
  {
    id: 'pyramid',
    match: (t) => /\\smartdiagram\[priority/i.test(t) || (/\\(pyramid|hierarchy)\{/i.test(t) && t.replace(/\\(pyramid|hierarchy)\{((?:[^{}]|\{[^{}]*\})*)\}/g, '').trim() === ''),
    badge: {
      text: '独自書式 / LaTeX (ピラミッド図)',
      cls: 'badge-custom',
      desc: '\\pyramid{ title: ...; layer: 項目名 [色] (説明); } または smartdiagram'
    },
    cls: 'pyramid-preview-container',
    label: 'ピラミッド図',
    getFn: () => typeof drawPyramidSvg === 'function' ? drawPyramidSvg : null
  },
  // 3. レーダーチャート (tkz-kiviat または \radar)
  {
    id: 'radar',
    match: (t) => /\\(radar|spider)\{/i.test(t) || t.includes('\\tkzKiviatDiagram'),
    badge: {
      text: '独自書式 / LaTeX (レーダーチャート)',
      cls: 'badge-custom',
      desc: '\\radar{ title: ...; axis: 軸1, 軸2; series: 系列(値1, 値2); } または tkz-kiviat'
    },
    cls: 'radar-preview-container',
    label: 'レーダーチャート',
    getFn: () => typeof drawRadarSvg === 'function' ? drawRadarSvg : null
  },
  // 5. ツリーマップ
  {
    id: 'treemap',
    match: (t) => /\\(treemap)\{/i.test(t) || (t.includes('\\begin{tikzpicture}') && (t.includes('treemap') || /ツリーマップ/i.test(t))),
    badge: {
      text: '独自書式 / LaTeX (ツリーマップ)',
      cls: 'badge-custom',
      desc: '\\treemap{ title: ...; unit: 単位; "項目名", 値, "騰落率"; } または TikZ'
    },
    cls: 'treemap-preview-container',
    label: 'ツリーマップ',
    getFn: () => typeof drawTreemapSvg === 'function' ? drawTreemapSvg : null
  },
  // 6. ガントチャート (pgfgantt または \gantt)
  {
    id: 'gantt',
    match: (t) => /\\gantt\{|\\begin\{ganttchart\}/i.test(t),
    badge: {
      text: '独自書式 / LaTeX (ガントチャート)',
      cls: 'badge-custom',
      desc: '\\gantt{ title: ...; task: タスク, 開始, 終了; } または pgfgantt'
    },
    cls: 'gantt-preview-container',
    label: 'ガントチャート',
    getFn: () => typeof drawGanttSvg === 'function' ? drawGanttSvg : null
  },
  // 7. 資本構成ツリー図
  {
    id: 'capitaltree',
    match: (t) => /\\(capitaltree|holdingtree)\{/i.test(t),
    badge: {
      text: '独自書式 (資本構成ツリー図)',
      cls: 'badge-custom',
      desc: '\\capitaltree{ title: ...; "親会社" -> "子会社" [比率, 区分]; }'
    },
    cls: 'capitaltree-preview-container',
    label: '資本構成ツリー図',
    getFn: () => typeof drawCapitalTreeSvg === 'function' ? drawCapitalTreeSvg : null
  },
  // 8. 放射状ツリー図
  {
    id: 'radialtree',
    match: (t) => /\\(radialtree|radial)\{/i.test(t),
    badge: {
      text: '独自書式 (放射状ツリー図)',
      cls: 'badge-custom',
      desc: '\\radialtree{ title: ...; center: ...; "親会社" -> "子会社" [比率, 区分]; }'
    },
    cls: 'radialtree-preview-container',
    label: '放射状ツリー図',
    getFn: () => typeof drawRadialTreeSvg === 'function' ? drawRadialTreeSvg : null
  },
  // 9. 組織階層図 (LaTeX forest / tikz-qtree / 独自 \orgchart)
  {
    id: 'orgchart',
    match: (t) => /\\(orgchart|organization|org)\{|\\begin\{forest\}|\\Forest\{|\\Tree\s+\[/i.test(t),
    badge: {
      text: '独自書式 / LaTeX (組織階層図・ツリー構造)',
      cls: 'badge-custom',
      desc: '\\begin{forest} または \\Tree または \\orgchart{ "親" -> "子"; }'
    },
    cls: 'orgchart-preview-container',
    label: '組織階層図',
    getFn: () => typeof drawOrgChartSvg === 'function' ? drawOrgChartSvg : null
  },
  // 10. ブロック図
  {
    id: 'blockdiagram',
    match: (t) => /\\(blockdiagram|sysblock|block)\{/i.test(t),
    badge: {
      text: '独自書式 (ブロック図)',
      cls: 'badge-custom',
      desc: '\\blockdiagram{ title: ...; "入力" -> sum1 [+] -> "ブロック" -> "出力"; }'
    },
    cls: 'blockdiagram-preview-container',
    label: 'ブロック図',
    getFn: () => typeof drawBlockDiagramSvg === 'function' ? drawBlockDiagramSvg : null
  },
  // 11. シーケンス図 (LaTeX pgf-umlsd / 独自 \sequence)
  {
    id: 'sequence',
    match: (t) => /\\(sequence|seq)\{|\\begin\{sequencediagram\}/i.test(t),
    badge: {
      text: '独自書式 / LaTeX (シーケンス図)',
      cls: 'badge-custom',
      desc: '\\begin{sequencediagram} または \\sequence{ A -> B: 要求; }'
    },
    cls: 'sequence-preview-container',
    label: 'シーケンス図',
    getFn: () => typeof drawSequenceDiagramSvg === 'function' ? drawSequenceDiagramSvg : null
  },
  // 12. 光学系配置図
  {
    id: 'optics',
    match: (t) => /\\(optics|opticalbench)\{/i.test(t),
    badge: {
      text: '独自書式 (光学系配置図)',
      cls: 'badge-custom',
      desc: '\\optics{ title: ...; "レーザー" -> "レンズ" -> "スクリーン"; }'
    },
    cls: 'optics-preview-container',
    label: '光学系配置図',
    getFn: () => typeof drawOpticsDiagramSvg === 'function' ? drawOpticsDiagramSvg : null
  },
  // 13. エネルギー準位図
  {
    id: 'energylevel',
    match: (t) => /\\(energylevel|energy|banddiagram)\{/i.test(t),
    badge: {
      text: '独自書式 (エネルギー準位図)',
      cls: 'badge-custom',
      desc: '\\energylevel{ title: ...; n1: "基底" [-13.6]; n2 -> n1: "放出"; }'
    },
    cls: 'energylevel-preview-container',
    label: 'エネルギー準位図',
    getFn: () => typeof drawEnergyLevelDiagramSvg === 'function' ? drawEnergyLevelDiagramSvg : null
  },
  // 14. ポテンシャル曲線
  {
    id: 'potential',
    match: (t) => /\\(potential|potentialcurve|potentialwell)\{/i.test(t),
    badge: {
      text: '独自書式 (ポテンシャル曲線)',
      cls: 'badge-custom',
      desc: '\\potential{ type: morse; De: 4.5; re: 1.2; level: "v=0" [-4.2]; }'
    },
    cls: 'potential-preview-container',
    label: 'ポテンシャルエネルギー曲線',
    getFn: () => typeof drawPotentialDiagramSvg === 'function' ? drawPotentialDiagramSvg : null
  },
  // 15. フローチャート
  {
    id: 'flowchart',
    match: (t) => /\\(flowchart|flow)\{/i.test(t),
    badge: {
      text: '独自書式 (フローチャート)',
      cls: 'badge-custom',
      desc: '\\flowchart{ ノード名 [種類]; ノードA -> ノードB; }'
    },
    cls: 'flowchart-preview-container',
    label: 'フローチャート',
    getFn: () => typeof drawFlowchartSvg === 'function' ? (text, container, label) => {
      const m = text.match(/\\(?:flowchart|flow)\{([\s\S]*)\}/i);
      drawFlowchartSvg(m ? m[1] : text, container, label);
    } : null
  },
  // 16. サンキーダイアグラム
  {
    id: 'sankey',
    match: (t) => /\\sankey\{/i.test(t) || (t.includes('\\begin{tikzpicture}') && (t.includes('sankey') || /サンキー/i.test(t))),
    badge: {
      text: '独自書式 / LaTeX (サンキー図)',
      cls: 'badge-custom',
      desc: '\\sankey{ 流量: 起点 -> 終点; } または TikZ'
    },
    cls: 'sankey-preview-container',
    label: 'サンキーダイアグラム',
    getFn: () => typeof drawSankeySvg === 'function' ? drawSankeySvg : null
  },
  // 17. 決算書B/Sサンキー図
  {
    id: 'bs',
    match: (t) => /\\(bs|balancesheet|sankeybs)\{/i.test(t),
    badge: {
      text: '独自書式 (決算書B/Sサンキー図)',
      cls: 'badge-custom',
      desc: '\\bs{ company: ...; period: ...; 資産 -> 負債; ... }'
    },
    cls: 'sankey-preview-container bs-preview-container',
    label: '決算書サンキーダイアグラム',
    getFn: () => typeof drawBalanceSheetSvg === 'function' ? (text, container, label) => {
      const m = text.match(/\\(?:bs|balancesheet|sankeybs)\{([\s\S]*)\}/i);
      drawBalanceSheetSvg(m ? m[1] : text, container, label);
    } : null
  },
  // 18. 決算書P/L損益計算書
  {
    id: 'pl',
    match: (t) => /\\(pl|incomestatement)\{/i.test(t),
    badge: {
      text: '独自書式 (決算書P/L損益計算書)',
      cls: 'badge-custom',
      desc: '\\pl{ company: ...; period: ...; 売上高 -> 売上総利益; ... }'
    },
    cls: 'sankey-preview-container pl-preview-container',
    label: '決算書P/Lサンキー図',
    getFn: () => typeof drawProfitAndLossSvg === 'function' ? (text, container, label) => {
      const m = text.match(/\\(?:pl|incomestatement)\{([\s\S]*)\}/i);
      drawProfitAndLossSvg(m ? m[1] : text, container, label);
    } : null
  },
  // 19. 状態遷移図 (FSM / LaTeX TikZ automata)
  {
    id: 'fsm',
    match: (t) => /\\(fsm|automaton)\{/i.test(t) ||
      (/\\begin\{tikzpicture\}/i.test(t) && /(?:\\node\s*\[[^\]]*state|\\usetikzlibrary\{automata\}|accepting)/i.test(t)),
    badge: {
      text: '独自書式 / LaTeX (状態遷移図・オートマトン)',
      cls: 'badge-custom',
      desc: '\\begin{tikzpicture} (node[state]) または \\fsm{ A -> B: イベント; }'
    },
    cls: 'fsm-preview-container',
    label: '状態遷移図',
    getFn: () => typeof drawFsmSvg === 'function' ? (text, container, label) => {
      const m = text.match(/\\(?:fsm|automaton)\{([\s\S]*)\}/i);
      drawFsmSvg(m ? m[1] : text, container, label);
    } : null
  },
  // 20. タイミングチャート（波形）
  {
    id: 'timing',
    match: (t) => /\\timing\{/i.test(t),
    badge: {
      text: '独自書式 (波形チャート)',
      cls: 'badge-custom',
      desc: '\\timing{ 信号名: H.L...; }'
    },
    cls: 'timing-preview-container',
    label: 'タイミングチャート',
    getFn: () => typeof drawTimingSvg === 'function' ? drawTimingSvg : null
  },
  // 21. 電気回路図 (CircuiTikZ / \circuit)
  {
    id: 'circuit',
    match: (t) => /\\circuit\{|\\begin\{circuitikz\}/i.test(t) ||
      (/\\begin\{tikzpicture\}/i.test(t) && /to\s*\[|node\s*\[\s*loop/i.test(t)) ||
      (/\\draw\s*\([^;]+;/i.test(t) && !/\\begin\{tikzpicture\}/i.test(t)),
    badge: {
      text: '独自書式 / LaTeX (電気回路図)',
      cls: 'badge-custom',
      desc: '\\circuit{ R1 [resistor]; ノードA -- ノードB; } または CircuiTikZ'
    },
    cls: 'circuit-preview-container',
    label: '電子回路図',
    getFn: () => typeof drawCircuitSvg === 'function' ? drawCircuitSvg : null
  },
  // 22. ファインマン・ダイアグラム
  {
    id: 'feynman',
    match: (t) => /\\feynman\{/i.test(t),
    badge: {
      text: '独自書式 (ファインマン図)',
      cls: 'badge-custom',
      desc: '\\feynman{ 粒子 [fermion]; 光子 [photon]; }'
    },
    cls: 'feynman-preview-container',
    label: 'ファインマン・ダイアグラム',
    getFn: () => typeof drawFeynmanSvg === 'function' ? (text, container, label) => {
      const m = text.match(/\\feynman\{([\s\S]*)\}/i);
      drawFeynmanSvg(m ? m[1] : text, container, label);
    } : null
  },
  // 23. コード進行 (ChordPro)
  {
    id: 'chordpro',
    match: (t) => /\\chordpro\{/i.test(t),
    badge: {
      text: 'コード進行 (ChordPro)',
      cls: 'badge-custom',
      desc: '\\chordpro{ [C]歌詞 [G]歌詞; } または小節進行 (| C | G |)'
    },
    cls: 'chordpro-preview-container',
    label: 'コード進行',
    getFn: () => typeof drawChordPro === 'function' ? drawChordPro : null
  },
  // 24. ギターコード図 (guitarchords)
  {
    id: 'guitarchords',
    match: (t) => /\\(guitarchords|chord)\{/i.test(t),
    badge: {
      text: 'ギターコード図 (guitarchords)',
      cls: 'badge-custom',
      desc: '\\guitarchords{ \\chord{t}{x,3,2,0,1,0}{C} } または C -> G -> Am -> F'
    },
    cls: 'guitarchords-preview-container',
    label: 'ギターコード図',
    getFn: () => typeof drawGuitarChords === 'function' ? drawGuitarChords : null
  },
  // 25. コード進行フロー (ChordFlow)
  {
    id: 'chordflow',
    match: (t) => /\\chordflow\{/i.test(t),
    badge: {
      text: 'コード進行フロー (ChordFlow)',
      cls: 'badge-custom',
      desc: '\\chordflow{ Im [Fm] -> IVm [Bbm] -> bIII [Ab]; }'
    },
    cls: 'chordflow-preview-container',
    label: 'コード進行フロー',
    getFn: () => typeof drawChordFlow === 'function' ? drawChordFlow : null
  },
  // 26. ニューラルネットワーク構造図 (NN)
  {
    id: 'neuralnet',
    match: (t) => /\\(nn|neuralnet|neuralnetwork)\{/i.test(t),
    badge: {
      text: 'ニューラルネットワーク構造図 (NN)',
      cls: 'badge-custom',
      desc: '\\nn{ layers: [4, 6, 6, 2]; labels: ["入力層", "中間層1", "中間層2", "出力層"]; }'
    },
    cls: 'neuralnet-preview-container',
    label: 'ニューラルネットワーク構造図',
    getFn: () => typeof drawNeuralNetworkSvg === 'function' ? drawNeuralNetworkSvg : null
  },
  // 27. 有向グラフ / ネットワーク図 (Graph)
  {
    id: 'graph',
    match: (t) => /\\(graph|digraph|network)\{/i.test(t),
    badge: {
      text: '有向グラフ / ネットワーク図 (Graph)',
      cls: 'badge-custom',
      desc: '\\graph{ S -> A : 4; S -> B : 2; A -> G : 3; B -> G : 5; }'
    },
    cls: 'graph-preview-container',
    label: '有向グラフ・ネットワーク図',
    getFn: () => typeof drawGraphSvg === 'function' ? drawGraphSvg : null
  },
  // 28. ベン図 (Venn Diagram / LaTeX)
  {
    id: 'venn',
    match: (t) => /\\(venn|venndiagram)\{|\\begin\{venndiagram[23]sets\}|(?:\\begin\{tikzpicture\}[\s\S]*?(?:venn|ベン図))/i.test(t),
    badge: {
      text: 'ベン図 (Venn Diagram / LaTeX)',
      cls: 'badge-custom',
      desc: '\\venn{ set A "A"; set B "B"; AB: "共通部分"; } または \\begin{venndiagram2sets}'
    },
    cls: 'venn-preview-container',
    label: 'ベン図',
    getFn: () => typeof drawVennSvg === 'function' ? drawVennSvg : null
  },
  // 29. フィッシュボーン図 (特性要因図 / LaTeX)
  {
    id: 'fishbone',
    match: (t) => /\\(fishbone|ishikawa|causeeffect)\{|(?:\\begin\{tikzpicture\}[\s\S]*?(?:fishbone|ishikawa|特性要因))/i.test(t),
    badge: {
      text: 'フィッシュボーン図 (特性要因図 / LaTeX)',
      cls: 'badge-custom',
      desc: '\\fishbone{ effect: "結果"; "人": "要因1", "要因2"; } または \\begin{tikzpicture}'
    },
    cls: 'fishbone-preview-container',
    label: '特性要因図 (フィッシュボーン)',
    getFn: () => typeof drawFishboneSvg === 'function' ? drawFishboneSvg : null
  },
  // 30. SWOT分析マトリクス
  {
    id: 'swot',
    match: (t) => /\\(swot|swotmatrix)\{/i.test(t),
    badge: {
      text: 'SWOT分析マトリクス (2×2 戦略マップ)',
      cls: 'badge-custom',
      desc: '\\swot{ title: "戦略SWOT"; S: "強み"; W: "弱み"; O: "機会"; T: "脅威"; }'
    },
    cls: 'swot-preview-container',
    label: 'SWOT分析マトリクス',
    getFn: () => typeof drawSwotSvg === 'function' ? drawSwotSvg : null
  },
  // 31. サイクル図・バブル図 (LaTeX smartdiagram circular/bubble, 独自 \cycle, \bubble)
  {
    id: 'cycle',
    match: (t) => /\\(cycle|circular|bubble)\{|\\smartdiagram\s*\[\s*(?:circular|bubble|constellation)/i.test(t),
    badge: {
      text: 'サイクル図・バブル図 (LaTeX smartdiagram)',
      cls: 'badge-custom',
      desc: '\\smartdiagram[circular diagram]{Plan, Do, Check, Act} または \\cycle{...}'
    },
    cls: 'cycle-preview-container',
    label: 'サイクル・バブル図',
    getFn: () => typeof drawCycleSvg === 'function' ? drawCycleSvg : null
  },
  // 32. ロードマップ図 (マイルストーン年表・タイムライン)
  {
    id: 'roadmap',
    match: (t) => (/\\(roadmap|timeline)\{|\\(?:startchronology|chronoevent|chronoperiod)|\\smartdiagram(?!\s*\[\s*priority)/i.test(t)) && !/\\smartdiagram\s*\[\s*(?:circular|bubble|constellation)/i.test(t),
    badge: {
      text: 'ロードマップ図 (マイルストーン年表・タイムライン)',
      cls: 'badge-custom',
      desc: '\\roadmap{ title: "開発計画"; "2026 Q1": "αリリース"; } または chronosys'
    },
    cls: 'roadmap-preview-container',
    label: 'ロードマップ図',
    getFn: () => typeof drawRoadmapSvg === 'function' ? drawRoadmapSvg : null
  },
  // 33. 結晶構造・格子モデル
  {
    id: 'crystal',
    match: (t) => /\\(crystal|lattice)\{/i.test(t),
    badge: {
      text: '独自書式 (結晶構造・格子モデル)',
      cls: 'badge-custom',
      desc: '\\crystal{ type: fcc; title: ...; plane: (1,1,1); } (固体物理・ブラベ格子)'
    },
    cls: 'crystal-preview-container',
    label: '結晶構造・格子モデル',
    getFn: () => typeof drawCrystalSvg === 'function' ? drawCrystalSvg : null
  },
  // 34. 汎用シナリオ・概念図 (フリーフロー)
  {
    id: 'scenario',
    match: (t) => /\\(scenario|freeflow)\{/i.test(t),
    badge: {
      text: '汎用シナリオ・概念図 (フリーフロー)',
      cls: 'badge-custom',
      desc: '\\scenario{ title: ...; fork: -> ...; または merge: <- ...; } (攻撃・業務シナリオ)'
    },
    cls: 'scenario-preview-container',
    label: '汎用シナリオ・概念図',
    getFn: () => typeof drawScenarioSvg === 'function' ? drawScenarioSvg : null
  },
  // 35. テンソルネットワーク・ペンローズ記法
  {
    id: 'tensor',
    match: (t) => /\\(tensornetwork|penrose|tensor)\{/i.test(t),
    badge: {
      text: '独自書式 (テンソルネットワーク・ペンローズ記法)',
      cls: 'badge-custom',
      desc: '\\tensornetwork{ type: mps; sites: 5; bond: χ; } (量子情報・物性物理)'
    },
    cls: 'tensor-preview-container',
    label: 'テンソルネットワーク図',
    getFn: () => typeof drawTensorSvg === 'function' ? drawTensorSvg : null
  },
  // 36. 2軸マップ独自書式
  {
    id: 'matrixmap',
    match: (t) => /\\(matrixmap|positioning|matrix)\{/i.test(t),
    badge: {
      text: '独自書式 (2軸マップ)',
      cls: 'badge-custom',
      desc: '\\matrixmap{ title: ...; axis-x: ...; axis-y: ...; quadrant: ...; item: 名前(x, y); }'
    },
    cls: 'matrix-preview-container',
    label: '2軸マップ',
    getFn: () => typeof drawMatrixMapSvg === 'function' ? drawMatrixMapSvg : null
  },
  // 37. LaTeX TikZ 4象限ポジショニングマップ・マトリクス図
  {
    id: 'tikz-matrix',
    match: (t) => /\\begin\{tikzpicture\}/i.test(t) &&
      /(?:<->|<--|-->|node\s*\[\s*(?:above|below|left|right)\s*\]|positioning|4象限|マトリクス)/i.test(t) &&
      !/\\begin\{axis\}|\\addplot|\\pie(?:\[[^\]]*\])?\{|fishbone|ishikawa|特性要因|venn|venndiagram|sankey|サンキー|waterfall|滝|treemap|ツリーマップ|gantt|pgfgantt|kiviat|circuit|circuitikz|to\s*\[/i.test(t),
    badge: {
      text: 'LaTeX (TikZ マトリクス図)',
      cls: 'badge-latex',
      desc: '\\begin{tikzpicture} ... \\draw[<->] ... \\node ... \\end{tikzpicture}'
    },
    cls: 'matrix-preview-container',
    label: 'LaTeX TikZ マトリクス',
    getFn: () => typeof drawMatrixMapSvg === 'function' ? drawMatrixMapSvg : null
  },
  // 38. パケットヘッダ・メモリレイアウト図 (bytefield)
  {
    id: 'bytefield',
    match: (t) => /\\(bytefield|packet|memorymap)\{|\\begin\{bytefield\}/i.test(t),
    badge: {
      text: 'パケットヘッダ・メモリ図 (LaTeX bytefield)',
      cls: 'badge-custom',
      desc: '\\begin{bytefield}{32} または \\packet{ [16] ポート; ... }'
    },
    cls: 'bytefield-preview-container',
    label: 'パケットヘッダ・メモリ図',
    getFn: () => typeof drawBytefieldSvg === 'function' ? drawBytefieldSvg : null
  },
  // 39. レトロPC / ソースコード (Code / Terminal)
  {
    id: 'code',
    match: (t) => /\\(code|terminal|retrocode|sourcecode)\{/i.test(t),
    badge: {
      text: 'レトロPC / ソースコード (Code)',
      cls: 'badge-custom',
      desc: '\\code{ title: ...; theme: pc98; /* ソースコード */ } または \\terminal{ ... }'
    },
    cls: 'code-preview-container',
    label: 'レトロPC / コード枠',
    getFn: () => typeof drawCodeSvg === 'function' ? drawCodeSvg : null
  }
];

