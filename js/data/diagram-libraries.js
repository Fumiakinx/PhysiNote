// ==============================================================================
// PhysiNote 各種ダイアグラム・公式・テーブル プリセットライブラリデータ定義
// ==============================================================================

// ==========================================
// 数式ライブラリのプリセットデータ定義（全42公式）
// ==========================================
const formulaLibrary = [
  // --- 力学 ---
  {
    id: 'mechanics-01',
    name: 'ニュートンの運動方程式',
    category: '力学',
    description: '物体に加わる力と加速度、質量の関係を表す力学の基本原理。',
    latex: 'F = m * a',
    tags: ['力学', '加速度', '質量', '運動方程式']
  },
  {
    id: 'mechanics-02',
    name: '万有引力の法則',
    category: '力学',
    description: 'すべての物体間に働く引き合う力。質量に比例し距離の2乗に反比例する。',
    latex: 'F = G \\frac{M m}{r^2}',
    tags: ['重力', '引力', '天体']
  },
  {
    id: 'mechanics-03',
    name: 'フックの法則',
    category: '力学',
    description: '弾性体の変形量と復元力の比例関係を表す法則。',
    latex: 'F = -kx',
    tags: ['弾性', 'ばね', '復元力']
  },
  {
    id: 'mechanics-04',
    name: '等加速度直線運動の速度式',
    category: '力学',
    description: '一定の加速度で運動する物体の速度の時間変化を表す式。',
    latex: 'v = v_0 + at',
    tags: ['等加速度', '速度', '直線運動']
  },
  {
    id: 'special-relativity',
    name: '特殊相対性理論（質量エネルギー等価性）',
    category: '力学',
    description: '質量とエネルギーが相互に変換可能であることを示すアインシュタインの公式。',
    latex: 'E = m * c^2',
    tags: ['相対性理論', '光速', 'エネルギー']
  },

  // --- 電磁気学 ---
  {
    id: 'em-01',
    name: 'クーロンの法則',
    category: '電磁気学',
    description: '静止した2つの荷電粒子の間に働く静電気力の大きさを表す法則。',
    latex: 'F = \\frac{1}{4\\pi\\varepsilon_0}\\frac{q_1 q_2}{r^2}',
    tags: ['静電気', '電荷', 'クーロン力']
  },
  {
    id: 'em-02',
    name: 'オームの法則',
    category: '電磁気学',
    description: '導体を流れる電流と両端の電位差、抵抗の比例関係を表す。',
    latex: 'V = IR',
    tags: ['電流', '電圧', '電気抵抗']
  },
  {
    id: 'em-03',
    name: 'ローレンツ力',
    category: '電磁気学',
    description: '電磁場中を運動する荷電粒子が受ける電場と磁場による力の合力。',
    latex: 'F = q(E + v \\times B)',
    tags: ['電磁場', '荷電粒子', '磁気力']
  },
  {
    id: 'em-04',
    name: 'ファラデーの電磁誘導の法則',
    category: '電磁気学',
    description: '磁束の変化率に比例して逆向きの起電力が発生する現象。',
    latex: 'V = -\\frac{d\\Phi}{dt}',
    tags: ['電磁誘導', '磁束', '起電力']
  },
  {
    id: 'em-maxwell-gauss',
    name: 'ガウスの法則（電場）',
    category: '電磁気学',
    description: '電荷の存在によって電場が空間へ湧き出す関係を示すマクスウェル方程式の第1式。',
    latex: '\\nabla \\cdot \\boldsymbol{E} = \\frac{\\rho}{\\varepsilon_0}',
    tags: ['電磁気学', 'マクスウェル方程式', 'ガウスの法則', '電荷密度']
  },
  {
    id: 'em-maxwell-ampere',
    name: 'アンペール・マクスウェルの法則',
    category: '電磁気学',
    description: '電流だけでなく電場の時間変化によっても磁場が誘起される関係を記述する式。',
    latex: '\\nabla \\times \\boldsymbol{B} = \\mu_0 \\boldsymbol{j} + \\mu_0 \\varepsilon_0 \\frac{\\partial \\boldsymbol{E}}{\\partial t}',
    tags: ['電磁気学', 'マクスウェル方程式', '磁場', '変位電流']
  },

  // --- 熱力学 ---
  {
    id: 'thermo-01',
    name: '理想気体の状態方程式',
    category: '熱力学',
    description: '低圧・高温気体の圧力・体積・物質量・温度の間の平衡関係式。',
    latex: 'PV = nRT',
    tags: ['気体', '状態方程式', '熱平衡']
  },
  {
    id: 'thermo-02',
    name: '熱伝導方程式',
    category: '熱力学',
    description: '均質媒質中における巨視的な熱拡散過程を記述する偏微分方程式。',
    latex: '\\frac{\\partial T}{\\partial t} = \\alpha \\nabla^2 T',
    tags: ['熱伝導', '拡散', '偏微分']
  },
  {
    id: 'thermo-03',
    name: '熱力学第一法則',
    category: '熱力学',
    description: '熱と仕事の出入りと内部エネルギー変化を関連づけるエネルギー保存則。',
    latex: '\\Delta U = Q + W',
    tags: ['エネルギー保存', '熱', '仕事']
  },
  {
    id: 'thermo-second-law',
    name: '熱力学第二法則（エントロピー増大則）',
    category: '熱力学',
    description: '熱が自発的に低温から高温へ移動しないこと、および不可逆変化に伴うエントロピーの増大を示す式。',
    latex: 'dS \\ge \\frac{dQ}{T}',
    tags: ['熱力学', 'エントロピー', '不可逆性', 'クラウジウス']
  },

  // --- 統計力学 ---
  {
    id: 'thermo_stat_boltzmann',
    name: 'ボルツマンの原理',
    category: '統計力学',
    description: '微視的な状態数と巨視的なエントロピーを結びつける統計力学の基礎式。',
    latex: 'S = k_B \\ln W',
    tags: ['エントロピー', '状態数', '統計力学']
  },
  {
    id: 'thermo_stat_distribution',
    name: 'ボルツマン分布',
    category: '統計力学',
    description: '熱平衡状態にある系において、エネルギー状態が出現する確率を表す分布則。',
    latex: 'P_i \\propto e^{-\\frac{E_i}{k_B T}}',
    tags: ['統計力学', 'エネルギー準位', '熱平衡']
  },
  {
    id: 'stat-partition-function',
    name: '分配関数（カノニカル分布）',
    category: '統計力学',
    description: 'すべての微視的状態の確率重みを足し合わせ、熱力学量を計算する土台となる式。',
    latex: 'Z = \\sum_i e^{-\\beta E_i}',
    tags: ['統計力学', '分配関数', 'カノニカル分布', '自由エネルギー']
  },
  {
    id: 'stat-equipartition',
    name: 'エネルギー等分配定理',
    category: '統計力学',
    description: '古典的な熱平衡系において、2乗形式で現れる自由度1つあたりに分配される平均エネルギーを示す式。',
    latex: '\\langle E \\rangle = \\frac{1}{2} k_B T',
    tags: ['統計力学', '等分配定理', '熱平衡', 'ボルツマン定数']
  },

  // --- 流体力学 ---
  {
    id: 'fluid_bernoulli',
    name: 'ベルヌーイの定理',
    category: '流体力学',
    description: '非圧縮・非粘性流体の定常流において、単位体積あたりの力学的エネルギーが保存されることを示す式。',
    latex: 'P + \\frac{1}{2}\\rho v^2 + \\rho gh = \\text{const}',
    tags: ['流体', 'エネルギー保存', '圧力', '流速']
  },
  {
    id: 'fluid_continuity',
    name: '連続の式（流体）',
    category: '流体力学',
    description: '流体内における質量保存則を微分形式で表現した基礎方程式。',
    latex: '\\frac{\\partial \\rho}{\\partial t} + \\nabla \\cdot (\\rho \\boldsymbol{v}) = 0',
    tags: ['流体', '質量保存', '発散']
  },
  {
    id: 'navier-stokes',
    name: 'ナビエ–ストークス方程式',
    category: '流体力学',
    description: '粘性流体の運動を記述する流体力学の基礎方程式。',
    latex: '\\begin{aligned} &\\rho \\left( \\frac{\\partial u}{\\partial t} + u \\frac{\\partial u}{\\partial x} + v \\frac{\\partial u}{\\partial y} + w \\frac{\\partial u}{\\partial z} \\right) = -\\frac{\\partial p}{\\partial x} \\\\ &\\qquad + \\mu \\left( \\frac{\\partial^2 u}{\\partial x^2} + \\frac{\\partial^2 u}{\\partial y^2} + \\frac{\\partial^2 u}{\\partial z^2} \\right) + \\rho g_x \\end{aligned}',
    tags: ['流体', '粘性', '運動方程式']
  },

  // --- 波動・光学 ---
  {
    id: 'wave_wave_equation',
    name: '1次元波動方程式',
    category: '波動・光学',
    description: '波が空間中を一定の速さで伝播していく様子を記述する偏微分方程式。',
    latex: '\\frac{\\partial^2 u}{\\partial t^2} = v^2 \\frac{\\partial^2 u}{\\partial x^2}',
    tags: ['波動', '伝播速度', '振動']
  },
  {
    id: 'optics_snell',
    name: 'スネルの法則（屈折の法則）',
    category: '波動・光学',
    description: '屈折率が異なる媒質の境界を光が通過する際の入射角と屈折角の関係式。',
    latex: 'n_1 \\sin \\theta_1 = n_2 \\sin \\theta_2',
    tags: ['光学', '屈折率', '幾何光学']
  },
  {
    id: 'wave-grating-interference',
    name: '回折・干渉条件',
    category: '波動・光学',
    description: 'スリットや回折格子によって波の位相が揃い強め合う条件を表す波動光学の基本式。',
    latex: 'd \\sin \\theta = m \\lambda',
    tags: ['波動', '光学', '干渉', '回折', 'ヤングの実験']
  },
  {
    id: 'wave-doppler-effect',
    name: 'ドップラー効果の式',
    category: '波動・光学',
    description: '波源や観測者の相対運動によって観測される振動数が変化する現象を記述する式。',
    latex: 'f\' = f \\frac{v \\pm v_o}{v \\mp v_s}',
    tags: ['波動', '音波', 'ドップラー効果', '振動数']
  },

  // --- 量子力学 ---
  {
    id: 'quantum_schrodinger',
    name: 'シュレーディンガー方程式',
    category: '量子力学',
    description: '微視的な粒子の状態（波動関数）の時間発展を決定づける量子力学の基本方程式。',
    latex: 'i\\hbar \\frac{\\partial}{\\partial t}\\psi = \\hat{H}\\psi',
    tags: ['量子力学', '波動関数', 'ハミルトニアン']
  },
  {
    id: 'quantum-photoelectric',
    name: 'アインシュタインの光量子仮説',
    category: '量子力学',
    description: '光がエネルギーの塊（光子）として振る舞う関係式。前期量子論の起点。',
    latex: 'E = h\\nu = \\hbar \\omega',
    tags: ['量子力学', '光電効果', '光子', 'プランク定数']
  },
  {
    id: 'quantum_uncertainty',
    name: '不確定性原理',
    category: '量子力学',
    description: '粒子の位置と運動量を同時に無限の精度で確定することはできないことを示す原理。',
    latex: '\\Delta x \\Delta p \\ge \\frac{\\hbar}{2}',
    tags: ['量子力学', '位置', '運動量', 'ハイゼンベルク']
  },
  {
    id: 'quantum-commutation-relation',
    name: '正準交換関係',
    category: '量子力学',
    description: '位置と運動量の演算子が非可換であることを示し、不確定性原理の根底をなす方程式。',
    latex: '[\\hat{x}, \\hat{p}] = i\\hbar',
    tags: ['量子力学', '演算子', '交換子', '不確定性']
  },
  {
    id: 'quantum_de_broglie',
    name: 'ド・ブロイ波の波長',
    category: '量子力学',
    description: '物質粒子が波動としての性質（物質波）を併せ持つことを表す式。',
    latex: '\\lambda = \\frac{h}{p}',
    tags: ['物質波', '量子力学', '波長']
  },

  // --- 解析力学 ---
  {
    id: 'analytical-euler-lagrange',
    name: 'オイラー・ラグランジュ方程式',
    category: '解析力学',
    description: '最小作用の原理から、あらゆる座標系において運動方程式を導出する解析力学の基本式。',
    latex: '\\frac{d}{dt}\\left(\\frac{\\partial L}{\\partial \\dot{q}}\\right) - \\frac{\\partial L}{\\partial q} = 0',
    tags: ['解析力学', 'ラグランジアン', '最小作用の原理', '変分法']
  },
  {
    id: 'analytical-hamilton',
    name: 'ハミルトンの正準方程式',
    category: '解析力学',
    description: '位置と運動量を対等な独立変数として扱い、位相空間上での系の時間発展を記述する式。',
    latex: '\\frac{dq}{dt} = \\frac{\\partial H}{\\partial p}, \\quad \\frac{dp}{dt} = -\\frac{\\partial H}{\\partial q}',
    tags: ['解析力学', 'ハミルトニアン', '正準変数', '位相空間']
  },

  // --- 線形代数 ---
  {
    id: 'math_eigenvalue',
    name: '固有値方程式',
    category: '線形代数',
    description: '線形変換を施しても方向が変わらないベクトル（固有ベクトル）とその拡大率（固有値）の関係式。',
    latex: 'A\\boldsymbol{x} = \\lambda \\boldsymbol{x}',
    tags: ['線形代数', '固有値', '行列']
  },
  {
    id: 'math-unitary-transformation',
    name: '直交性・ユニタリ変換',
    category: '線形代数',
    description: 'ベクトルの内積や長さを変えない回転操作。量子力学の確率保存の基本条件。',
    latex: 'U^\\dagger U = I',
    tags: ['線形代数', 'ユニタリ行列', 'エルミート共役', '内積保存']
  },
  {
    id: 'math-cauchy-schwarz',
    name: 'コーシー・シュワルツの不等式',
    category: '線形代数',
    description: '内積空間において不確定性関係などを一般的に導出する基礎不等式。',
    latex: '|\\langle \\boldsymbol{x}, \\boldsymbol{y} \\rangle|^2 \\le \\langle \\boldsymbol{x}, \\boldsymbol{x} \\rangle \\langle \\boldsymbol{y}, \\boldsymbol{y} \\rangle',
    tags: ['線形代数', '内積', 'ヒルベルト空間', '不等式']
  },

  // --- 解析学 ---
  {
    id: 'math_euler_formula',
    name: 'オイラーの公式',
    category: '解析学',
    description: '指数関数と三角関数を複素数の世界で統一的に結びつける関係式。',
    latex: 'e^{i\\theta} = \\cos\\theta + i\\sin\\theta',
    tags: ['複素数', '三角関数', '解析学']
  },
  {
    id: 'analysis_fourier',
    name: 'フーリエ変換',
    category: '解析学',
    description: '時間や空間の関数を周波数成分へと分解・変換する積分変換。',
    latex: '\\hat{f}(\\xi) = \\int_{-\\infty}^{\\infty} f(x) e^{-2\\pi i x \\xi} dx',
    tags: ['フーリエ解析', '周波数', '積分変換']
  },
  {
    id: 'analysis_gauss_divergence',
    name: 'ガウスの発散定理',
    category: '解析学',
    description: '立体領域内のベクトルの発散の総和が、閉曲面を通過する流束に一致することを示す定理。',
    latex: '\\iiint_V (\\nabla \\cdot \\boldsymbol{F}) dV = \\iint_S (\\boldsymbol{F} \\cdot \\boldsymbol{n}) dS',
    tags: ['ベクトル解析', '体積積分', '面積分']
  },
  {
    id: 'analysis-stokes-theorem',
    name: 'ストークスの定理',
    category: '解析学',
    description: '閉曲線の線積分と曲面の面積分を回転作用素（渦）を通じて結ぶ基本定理。',
    latex: '\\iint_S (\\nabla \\times \\boldsymbol{A}) \\cdot d\\boldsymbol{S} = \\oint_C \\boldsymbol{A} \\cdot d\\boldsymbol{r}',
    tags: ['解析学', 'ベクトル解析', '線積分', '面積分', '回転']
  },
  {
    id: 'analysis-dirac-delta',
    name: 'ディラックのデルタ関数',
    category: '解析学',
    description: '点電荷や瞬間的インパルスなど局在した特異点を厳密に扱う超関数の性質。',
    latex: '\\int_{-\\infty}^{\\infty} f(x)\\delta(x - a)dx = f(a)',
    tags: ['解析学', 'デルタ関数', '超関数', '積分']
  },
  {
    id: 'taylor-expansion',
    name: 'テイラー展開',
    category: '解析学',
    description: '滑らかな関数を特定の点のまわりの多項式で近似する展開公式。',
    latex: '\\begin{aligned} f(x) &= f(a) + f\'(a)(x-a) \\\\ &\\quad + \\frac{f\'\'(a)}{2!}(x-a)^2 + \\dots \\end{aligned}',
    tags: ['級数展開', '多項式近似', '微分']
  }
];

// ==========================================
// 化学式（分子式・反応式）ライブラリ データ
// ==========================================
const chemFormulaLibrary = [
  // --- 無機物質・単体 ---
  {
    id: 'cf-water',
    name: '水（Water）',
    category: '無機物質・単体',
    description: '常温常圧で液体。強い水素結合を持ち、極性溶媒として生命活動の基盤となる。',
    code: '\\ce{H2O}',
    tags: ['水', 'H2O', '酸化二水素', '無機物質']
  },
  {
    id: 'cf-carbon-dioxide',
    name: '二酸化炭素（Carbon Dioxide）',
    category: '無機物質・単体',
    description: '直線形分子。炭素の完全燃焼や生物の呼吸によって生じる温室効果ガス。',
    code: '\\ce{CO2}',
    tags: ['二酸化炭素', 'CO2', '炭酸ガス', '無機物質']
  },
  {
    id: 'cf-ammonia',
    name: 'アンモニア（Ammonia）',
    category: '無機物質・単体',
    description: '三角錐形の極性分子。刺激臭を持つ弱塩基性気体。窒素肥料の原料。',
    code: '\\ce{NH3}',
    tags: ['アンモニア', 'NH3', '無機物質', '塩基']
  },
  {
    id: 'cf-oxygen-ozone',
    name: '酸素とオゾン（同素体）',
    category: '無機物質・単体',
    description: '酸素原子の同素体。常磁性を持つ二酸素と酸化力の強い淡青色の三酸素。',
    code: '\\ce{O2 \\quad \\text{と} \\quad O3}',
    tags: ['酸素', 'オゾン', 'O2', 'O3', '同素体']
  },
  {
    id: 'cf-hydrogen-peroxide',
    name: '過酸化水素（Hydrogen Peroxide）',
    category: '無機物質・単体',
    description: 'ヒドロペルオキシド結合を持つ不安定な酸化剤。消毒薬（オキシドール）や漂白剤。',
    code: '\\ce{H2O2}',
    tags: ['過酸化水素', 'H2O2', '酸化剤']
  },

  // --- 有機化合物 ---
  {
    id: 'cf-methane',
    name: 'メタン（Methane）',
    category: '有機化合物',
    description: '正四面体構造を持つ最も単純なアルカン。天然ガスの主成分。',
    code: '\\ce{CH4}',
    tags: ['メタン', 'CH4', 'アルカン', '天然ガス']
  },
  {
    id: 'cf-ethanol',
    name: 'エタノール（Ethanol）',
    category: '有機化合物',
    description: 'ヒドロキシ基を持つ一価アルコール。酒類の主成分、消毒用アルコール。',
    code: '\\ce{C2H5OH}',
    tags: ['エタノール', 'C2H5OH', 'アルコール', '有機化合物']
  },
  {
    id: 'cf-acetic-acid',
    name: '酢酸（Acetic Acid）',
    category: '有機化合物',
    description: 'カルボキシ基を持つ代表的なカルボン酸。食酢の酸味成分。',
    code: '\\ce{CH3COOH}',
    tags: ['酢酸', 'CH3COOH', 'カルボン酸', '食酢']
  },
  {
    id: 'cf-benzene',
    name: 'ベンゼン（Benzene）',
    category: '有機化合物',
    description: '6個の炭素原子が平面正六角形を形成する代表的芳香族炭化水素。共鳴安定化。',
    code: '\\ce{C6H6}',
    tags: ['ベンゼン', 'C6H6', '芳香族', '亀の甲']
  },
  {
    id: 'cf-glucose',
    name: 'グルコース（ブドウ糖）',
    category: '有機化合物',
    description: '六炭糖（ヘキソース）のアルドース。生体の主要なエネルギー代謝源。',
    code: '\\ce{C6H12O6}',
    tags: ['グルコース', 'ブドウ糖', '糖質', '炭水化物']
  },
  {
    id: 'cf-caffeine',
    name: 'カフェイン（分子式）',
    category: '有機化合物',
    description: 'プリン環骨格を持つ中枢神経興奮性アルカロイド。コーヒーや緑茶に含まれる。',
    code: '\\ce{C8H10N4O2}',
    tags: ['カフェイン', 'C8H10N4O2', 'アルカロイド', '分子式']
  },
  {
    id: 'cf-aspirin',
    name: 'アスピリン（アセチルサリチル酸）',
    category: '有機化合物',
    description: 'サリチル酸のアセチル化誘導体。解熱・鎮痛・抗炎症作用。',
    code: '\\ce{C9H8O4}',
    tags: ['アスピリン', 'アセチルサリチル酸', '医薬品', '分子式']
  },

  // --- イオン・酸・塩 ---
  {
    id: 'cf-sulfuric-acid',
    name: '硫酸（Sulfuric Acid）',
    category: 'イオン・酸・塩',
    description: '二価の不揮発性強酸。吸湿性・脱水作用を持ち化学工業の最重要基礎原料。',
    code: '\\ce{H2SO4}',
    tags: ['硫酸', 'H2SO4', '強酸', '不揮発性']
  },
  {
    id: 'cf-hydrochloric-acid',
    name: '塩酸（塩化水素水溶液）',
    category: 'イオン・酸・塩',
    description: '塩化水素の水溶液。揮発性の代表的一価強酸。胃液に含まれる。',
    code: '\\ce{HCl}',
    tags: ['塩酸', '塩化水素', 'HCl', '強酸']
  },
  {
    id: 'cf-sodium-hydroxide',
    name: '水酸化ナトリウム（苛性ソーダ）',
    category: 'イオン・酸・塩',
    description: '潮解性を持つ代表的一価強塩基。二酸化炭素を吸収しやすい。',
    code: '\\ce{NaOH}',
    tags: ['水酸化ナトリウム', 'NaOH', '強塩基', '苛性ソーダ']
  },
  {
    id: 'cf-sodium-chloride',
    name: '塩化ナトリウム（食塩）',
    category: 'イオン・酸・塩',
    description: '面心立方格子構造をとる典型的なイオン結晶。食塩の主成分。',
    code: '\\ce{NaCl}',
    tags: ['塩化ナトリウム', 'NaCl', '食塩', '塩']
  },
  {
    id: 'cf-copper-sulfate-hydrate',
    name: '硫酸銅(II)五水和物',
    category: 'イオン・酸・塩',
    description: '青色の三斜晶系結晶。加熱すると無水物（白色粉末）となる。',
    code: '\\ce{CuSO4 . 5H2O}',
    tags: ['硫酸銅', '水和物', '無水物', '銅']
  },
  {
    id: 'cf-water-ionization',
    name: '水の自己電離（オキソニウムイオン）',
    category: 'イオン・酸・塩',
    description: '極微量の水分子がプロトン移動により解離して生成するイオン平衡。',
    code: '\\ce{2H2O <=> H3O+ + OH-}',
    tags: ['自己電離', '電離平衡', 'pH', 'オキソニウム']
  },

  // --- 化学反応式 ---
  {
    id: 'cf-water-synthesis',
    name: '水の生成反応（燃焼）',
    category: '化学反応式',
    description: '水素と酸素が爆鳴気を形成して発熱的に化合し、水を生成する基本反応。',
    code: '\\ce{2H2 + O2 -> 2H2O}',
    tags: ['水の生成', '水素燃焼', '発熱反応', '酸化還元']
  },
  {
    id: 'cf-methane-combustion',
    name: 'メタンの完全燃焼反応',
    category: '化学反応式',
    description: '都市ガスの主成分メタンが酸素と反応し、二酸化炭素と水を生じる酸化反応。',
    code: '\\ce{CH4 + 2O2 -> CO2 + 2H2O}',
    tags: ['メタン燃焼', '完全燃焼', '炭化水素', '発熱']
  },
  {
    id: 'cf-neutralization',
    name: '中和反応（塩酸と水酸化ナトリウム）',
    category: '化学反応式',
    description: '酸と塩基が反応して塩と水を生じる典型的な中和反応式。',
    code: '\\ce{HCl + NaOH -> NaCl + H2O}',
    tags: ['中和反応', '酸塩基', '塩']
  },
  {
    id: 'cf-photosynthesis',
    name: '光合成の全体化学反応式',
    category: '化学反応式',
    description: '植物が光エネルギーを用いて二酸化炭素と水からグルコースと酸素を合成。',
    code: '\\ce{6CO2 + 6H2O -> C6H12O6 + 6O2}',
    tags: ['光合成', '炭酸固定', '生化学', '葉緑体']
  },
  {
    id: 'cf-gas-evolution-caco3',
    name: '炭酸カルシウムと塩酸の気体発生反応',
    category: '化学反応式',
    description: '弱酸の塩に強酸を加えることで、二酸化炭素の気体が発生する弱酸遊離反応。',
    code: '\\ce{CaCO3 + 2HCl -> CaCl2 + H2O + CO2 ^}',
    tags: ['気体発生', '二酸化炭素発生', '弱酸の遊離', '石灰石']
  },
  {
    id: 'cf-haber-bosch',
    name: 'ハーバー・ボッシュ法（アンモニア合成平衡）',
    category: '化学反応式',
    description: '鉄触媒・高温高圧下で窒素と水素からアンモニアを合成する可逆発熱平衡反応。',
    code: '\\ce{N2 + 3H2 <=> 2NH3}',
    tags: ['ハーバーボッシュ法', 'アンモニア合成', '化学平衡', 'ルシャトリエ']
  },
  {
    id: 'cf-esterification',
    name: 'エステル化反応（酢酸エチル合成）',
    category: '化学反応式',
    description: 'カルボン酸とアルコールから酸触媒下でエステルと水が可逆的に生成。',
    code: '\\ce{CH3COOH + C2H5OH <=> CH3COOC2H5 + H2O}',
    tags: ['エステル化', '酢酸エチル', '可逆反応', '有機化学']
  }
];

// ==========================================
// 化学構造式（平面構造式）ライブラリ データ
// ==========================================
const chemLibrary = [
  // --- 医薬品・生体分子 ---
  {
    id: 'chem-aspirin',
    name: 'アスピリン（アセチルサリチル酸）',
    category: '医薬品・生体分子',
    description: '代表的な非ステロイド性抗炎症薬（NSAIDs）。解熱・鎮痛作用を持ち、サリチル酸をアセチル化して合成。',
    code: '\\chemfig{*6(-(-COOH)=-(-OCOCH3)=-=)}',
    smiles: 'O=C(O)c1ccccc1OC(=O)C',
    renderType: 'smiles',
    tags: ['アスピリン', 'アセチルサリチル酸', '医薬品', '鎮痛剤', '解熱剤', 'ベンゼン環']
  },
  {
    id: 'chem-salicylic-acid',
    name: 'サリチル酸',
    category: '医薬品・生体分子',
    description: 'カルボキシ基とフェノール性ヒドロキシ基を持つ芳香族オキシ酸。アスピリンの合成原料。',
    code: '\\chemfig{*6(-(-COOH)=-(-OH)=-=)}',
    smiles: 'O=C(O)c1ccccc1O',
    renderType: 'smiles',
    tags: ['サリチル酸', '医薬品', '芳香族', '原料']
  },
  {
    id: 'chem-acetaminophen',
    name: 'アセトアミノフェン（パラセタモール）',
    category: '医薬品・生体分子',
    description: '中枢性に作用する代表的な解熱鎮痛薬。胃腸障害が少なく広く使用される。',
    code: '\\smiles{CC(=O)Nc1ccc(O)cc1}',
    smiles: 'CC(=O)Nc1ccc(O)cc1',
    renderType: 'smiles',
    tags: ['アセトアミノフェン', 'パラセタモール', '解熱鎮痛', '医薬品']
  },
  {
    id: 'chem-caffeine',
    name: 'カフェイン',
    category: '医薬品・生体分子',
    description: 'プリン環骨格を持つ中枢神経興奮作用のあるアルカロイド。コーヒーや茶葉に含まれる。',
    code: '\\smiles{Cn1cnc2c1c(=O)n(c(=O)n2C)C}',
    smiles: 'Cn1cnc2c1c(=O)n(c(=O)n2C)C',
    renderType: 'smiles',
    tags: ['カフェイン', 'アルカロイド', 'プリン環', '興奮作用']
  },
  {
    id: 'chem-glucose',
    name: 'グルコース（ブドウ糖）',
    category: '医薬品・生体分子',
    description: '生体の主要なエネルギー源となる単糖（アルドヘキソース）。ピラノース環構造。',
    code: '\\smiles{OC[C@@H]1OC(O)[C@H](O)[C@@H](O)[C@@H]1O}',
    smiles: 'OC[C@@H]1OC(O)[C@H](O)[C@@H](O)[C@@H]1O',
    renderType: 'smiles',
    tags: ['グルコース', 'ブドウ糖', '糖質', '生化学', '六単糖']
  },
  {
    id: 'chem-adrenaline',
    name: 'アドレナリン（エピネフリン）',
    category: '医薬品・生体分子',
    description: '副腎髄質から分泌される神経伝達物質・ホルモン。心拍数や血圧を上昇させる。',
    code: '\\smiles{CNC[C@H](O)c1ccc(O)c(O)c1}',
    smiles: 'CNC[C@H](O)c1ccc(O)c(O)c1',
    renderType: 'smiles',
    tags: ['アドレナリン', 'エピネフリン', 'ホルモン', 'カテコールアミン']
  },

  // --- 芳香族化合物 ---
  {
    id: 'chem-benzene',
    name: 'ベンゼン（C₆H₆）',
    category: '芳香族化合物',
    description: '6つの炭素原子が平面正六角形を形成し、非局在化π電子により共鳴安定化した芳香族化合物。',
    code: '\\chemfig{*6(=-=-=-)}',
    smiles: 'c1ccccc1',
    renderType: 'smiles',
    tags: ['ベンゼン', '芳香族', '共鳴', '六角形']
  },
  {
    id: 'chem-toluene',
    name: 'トルエン（メチルベンゼン）',
    category: '芳香族化合物',
    description: 'ベンゼン環にメチル基が直結した構造。有機溶媒や化学原料として広く使用。',
    code: '\\chemfig{*6(-(-CH3)=-=-=-)}',
    smiles: 'Cc1ccccc1',
    renderType: 'smiles',
    tags: ['トルエン', 'メチル基', '芳香族', '溶媒']
  },
  {
    id: 'chem-phenol',
    name: 'フェノール',
    category: '芳香族化合物',
    description: 'ベンゼン環にヒドロキシ基が直結した芳香族化合物。弱酸性を示し塩化鉄(III)で青紫色に呈色。',
    code: '\\chemfig{*6(-(-OH)=-=-=-)}',
    smiles: 'Oc1ccccc1',
    renderType: 'smiles',
    tags: ['フェノール', '芳香族', 'ヒドロキシ基', '弱酸性']
  },
  {
    id: 'chem-benzoic-acid',
    name: '安息香酸',
    category: '芳香族化合物',
    description: 'ベンゼン環にカルボキシ基が結合した最も単純な芳香族カルボン酸。食品保存料等に使用。',
    code: '\\chemfig{*6(-(-COOH)=-=-=-)}',
    smiles: 'O=C(O)c1ccccc1',
    renderType: 'smiles',
    tags: ['安息香酸', 'カルボン酸', '芳香族']
  },
  {
    id: 'chem-aniline',
    name: 'アニリン',
    category: '芳香族化合物',
    description: 'ベンゼン環にアミノ基が直結した芳香族アミン。合成染料や医薬品の中間原料。',
    code: '\\chemfig{*6(-(-NH2)=-=-=-)}',
    smiles: 'Nc1ccccc1',
    renderType: 'smiles',
    tags: ['アニリン', 'アミノ基', '芳香族アミン', '染料']
  },
  {
    id: 'chem-nitrobenzene',
    name: 'ニトロベンゼン',
    category: '芳香族化合物',
    description: 'ベンゼンを混酸でニトロ化して得られる淡黄色液体。アニリンの製造原料。',
    code: '\\chemfig{*6(-(-NO2)=-=-=-)}',
    smiles: '[N+](=O)([O-])c1ccccc1',
    renderType: 'smiles',
    tags: ['ニトロベンゼン', 'ニトロ化', '芳香族']
  },

  // --- 有機化合物 ---
  {
    id: 'chem-methane',
    name: 'メタン（CH₄）',
    category: '有機化合物',
    description: '炭素原子を中心とする正四面体構造のアルカン。都市ガスや天然ガスの主成分。',
    code: '\\chemfig{C}',
    smiles: 'C',
    renderType: 'smiles',
    tags: ['メタン', 'アルカン', '炭化水素', '天然ガス']
  },
  {
    id: 'chem-ethanol',
    name: 'エタノール（C₂H₅OH）',
    category: '有機化合物',
    description: '酒類に含まれる揮発性液体。消毒薬や燃料、化学合成溶媒として汎用。',
    code: '\\chemfig{CCO}',
    smiles: 'CCO',
    renderType: 'smiles',
    tags: ['エタノール', 'アルコール', '消毒']
  },
  {
    id: 'chem-acetic-acid',
    name: '酢酸（CH₃COOH）',
    category: '有機化合物',
    description: '食酢の主成分であるカルボン酸。水溶液中で弱酸として電離する。',
    code: '\\chemfig{CC(=O)O}',
    smiles: 'CC(=O)O',
    renderType: 'smiles',
    tags: ['酢酸', 'カルボン酸', '弱酸']
  },
  {
    id: 'chem-acetone',
    name: 'アセトン（(CH₃)₂CO）',
    category: '有機化合物',
    description: 'カルボニル基を持つ最も単純なケトン。優れた溶解性を持つ有機溶媒。',
    code: '\\smiles{CC(=O)C}',
    smiles: 'CC(=O)C',
    renderType: 'smiles',
    tags: ['アセトン', 'ケトン', 'カルボニル', '溶媒']
  },
  {
    id: 'chem-ethylene',
    name: 'エチレン（エテン, C₂H₄）',
    category: '有機化合物',
    description: '炭素間二重結合を有する最も単純なアルケン。ポリエチレンの原料や植物ホルモン。',
    code: '\\smiles{C=C}',
    smiles: 'C=C',
    renderType: 'smiles',
    tags: ['エチレン', 'アルケン', '二重結合']
  },
  {
    id: 'chem-acetylene',
    name: 'アセチレン（エチン, C₂H₂）',
    category: '有機化合物',
    description: '直線構造をとる炭素間三重結合化合物。高温火炎を生じる溶接用ガス。',
    code: '\\smiles{C#C}',
    smiles: 'C#C',
    renderType: 'smiles',
    tags: ['アセチレン', 'アルキン', '三重結合']
  },
  {
    id: 'chem-cyclohexane',
    name: 'シクロヘキサン',
    category: '有機化合物',
    description: '炭素6個からなる脂環式炭化水素。イス型配座により立体ひずみが極めて小さい。',
    code: '\\chemfig{C1CCCCC1}',
    smiles: 'C1CCCCC1',
    renderType: 'smiles',
    tags: ['シクロヘキサン', '脂環式', 'イス型']
  },

  // --- 無機化合物 ---
  {
    id: 'chem-water',
    name: '水（H₂O）',
    category: '無機化合物',
    description: '折れ線型（約104.5度）の極性分子。分子間水素結合により特異的に高い沸点を示す。',
    code: '\\chemfig{H_2O}',
    smiles: 'WATER',
    renderType: 'smiles',
    tags: ['水', '水素結合', '折れ線型', '無機']
  },
  {
    id: 'chem-carbon-dioxide',
    name: '二酸化炭素（CO₂）',
    category: '無機化合物',
    description: '炭素原子を中心に酸素が対称に並ぶ直線型分子。双極子モーメントは相殺される。',
    code: '\\smiles{O=C=O}',
    smiles: 'O=C=O',
    renderType: 'smiles',
    tags: ['二酸化炭素', '直線型', '無機']
  },
  {
    id: 'chem-ammonia',
    name: 'アンモニア（NH₃）',
    category: '無機化合物',
    description: '窒素原子の孤立電子対による三角錐型分子。水に極めてよく溶け弱塩基性を示す。',
    code: '\\smiles{N}',
    smiles: 'N',
    renderType: 'smiles',
    tags: ['アンモニア', '三角錐型', '弱塩基']
  }
];

// ==========================================
// 電子回路ライブラリ データ
// ==========================================
const circuitLibrary = [
  // --- レイアウト ---
  {
    id: 'circ-rc-series',
    name: '形式1: RC直列回路（1ループ直列・充放電配置）',
    category: 'レイアウト',
    description: '抵抗とコンデンサが直列接続された基本回路。時定数 τ = RC で電荷の蓄積・放電が行われる。',
    code: '\\circuit{\\draw (0,0) to[battery=$E$] (0,2) to[R=$R$] (3,2) to[C=$C$] (3,0) -- (0,0);}',
    tags: ['形式1', 'RC回路', '過渡現象', '時定数', 'コンデンサ', '充放電', 'レイアウト']
  },
  {
    id: 'circ-voltage-divider',
    name: '形式2: 分圧回路（抵抗分圧・T型分岐配置）',
    category: 'レイアウト',
    description: '2つの抵抗値の比により入力電圧を出力電圧に減衰させる基本受動回路。',
    code: '\\circuit{\\draw (0,0) to[battery=$V_{in}$] (0,3) to[R=$R_1$] (2,3) to[R=$R_2$] (2,0) -- (0,0); \\draw (2,1.5) -- (3.5,1.5);}',
    tags: ['形式2', '分圧回路', '抵抗', 'オームの法則', '基準電圧', 'レイアウト']
  },
  {
    id: 'circ-rl-series',
    name: '形式3: RL直列回路（インダクタ過渡現象・L型配置）',
    category: 'レイアウト',
    description: '抵抗とインダクタが直列接続された回路。時定数 τ = L/R に従って自己誘導起電力が立ち上がる。',
    code: '\\circuit{\\draw (0,0) to[battery=$E$] (0,2) to[R=$R$] (3,2) to[L=$L$] (3,0) -- (0,0);}',
    tags: ['形式3', 'RL回路', 'コイル', 'インダクタンス', '過渡現象', 'レイアウト']
  },
  {
    id: 'circ-rlc-series',
    name: '形式4: RLC直列共振回路（3素子直列・インピーダンス配置）',
    category: 'レイアウト',
    description: '共振角周波数 ω₀ = 1/√(LC) で回路のインピーダンスが最小（純抵抗）となる交流基本回路。',
    code: '\\circuit{\\draw (0,0) to[sV=$v(t)$] (0,2) to[R=$R$] (2,2) to[L=$L$] (4,2) to[C=$C$] (4,0) -- (0,0);}',
    tags: ['形式4', 'RLC', '共振', '交流回路', 'インピーダンス', 'Q値', 'レイアウト']
  },
  {
    id: 'circ-lc-parallel',
    name: '形式5: LC並列共振回路（タンク回路・並列2分岐配置）',
    category: 'レイアウト',
    description: 'コイルとコンデンサが並列接続され、特定の共振周波数で電磁エネルギーが相互変換される発振・選択回路。',
    code: '\\circuit{\\draw (0,0) to[sV=$v$] (0,2) -- (2,2); \\draw (2,2) to[L=$L$] (2,0); \\draw (2,2) -- (4,2) to[C=$C$] (4,0) -- (0,0);}',
    tags: ['形式5', 'LC回路', 'タンク回路', '並列共振', '発振回路', 'レイアウト']
  },
  {
    id: 'circ-rc-lpf',
    name: '形式6: RCローパスフィルタ（LPF / 端子引き出し開放配置）',
    category: 'レイアウト',
    description: 'カットオフ周波数 fc = 1/(2πRC) より低い周波数を通過させ、高周波ノイズを減衰させるフィルタ回路。',
    code: '\\circuit{\\draw (0,0) to[sV=$V_{in}$] (0,2) to[R=$R$] (2.5,2) to[C=$C$] (2.5,0) -- (0,0); \\draw (2.5,2) -- (4,2);}',
    tags: ['形式6', 'フィルタ', 'LPF', '周波数応答', 'カットオフ周波数', 'レイアウト']
  },

  // --- 構文形式 ---
  {
    id: 'circ-half-wave-rectifier',
    name: '形式7: ダイオード半波整流回路（半導体 D・交流電源 sV 構文形式）',
    category: '構文形式',
    description: 'ダイオードの一方向導通性を利用し、交流電圧の正の半サイクルのみを負荷抵抗に取り出す整流回路。',
    code: '\\circuit{\\draw (0,0) to[sV=$v_{in}$] (0,2) to[D=$D$] (3,2) to[R=$R_L$] (3,0) -- (0,0);}',
    tags: ['形式7', 'ダイオード', '整流回路', 'AC-DC', '半導体', '構文形式']
  },
  {
    id: 'circ-rlc-transient-mesh',
    name: '形式8: RLC過渡応答回路（switch・単位[V][\\Omega][H]・メッシュ電流構文形式）',
    category: '構文形式',
    description: '直流電源とスイッチ投入時のRLC回路。各閉ループのメッシュ電流（I1, I2）と単位付き素子定数を指定する厳密構文。',
    code: '\\circuit{\\draw (0,0) to[battery=$E=12\\text{[V]}$] (0,1.5) to[switch=スイッチ\\n(t=0)] (0,3) to[L=$L=1\\text{[H]}$] (2.5,3) to[R=$R_1=4\\text{[\\Omega]}$, right] (2.5,0) -- (0,0); \\draw (2.5,3) to[C=$C=0.25\\text{[F]}$] (5,3) -- (5,0) to[R=$R_2=6\\text{[\\Omega]}$] (2.5,0); \\draw (1.25, 1.5) node[loop=$I_1$]; \\draw (3.75, 1.5) node[loop=$I_2$];}',
    tags: ['形式8', 'RLC', '過渡応答', 'メッシュ電流', 'スイッチ', '閉ループ', '回路', '構文形式']
  }
];

// ==========================================
// タイミングチャート（波形）ライブラリ データ
// ==========================================
const timingLibrary = [
  // --- レイアウト ---
  {
    id: 'timing-dff',
    name: '形式1: Dフリップフロップ（D-FF / クロック同期動作型）',
    category: 'レイアウト',
    description: 'クロックの立ち上がりエッジで入力Dの値をラッチし、出力Qへと伝搬させる同期基本回路。',
    code: '\\timing{\n  CLK: P P P P P P;\n  D:   0 1 1 0 1 0;\n  Q:   0 0 1 1 0 1;\n}',
    tags: ['形式1', 'D-FF', 'フリップフロップ', 'クロック同期', 'ラッチ', 'セットアップ時間', 'レイアウト']
  },
  {
    id: 'timing-clock-div2',
    name: '形式2: 2分周クロック回路（Clock Divider / 多段分周型）',
    category: 'レイアウト',
    description: '入力クロックの立ち上がりごとに状態が反転し、周期が2倍（周波数が半分）になる分周動作。',
    code: '\\timing{\n  CLK_IN:  P P P P P P P P;\n  CLK_OUT: 0 0 1 1 0 0 1 1;\n}',
    tags: ['形式2', '分周', 'クロック', 'カウンタ', 'トグル', 'レイアウト']
  },
  {
    id: 'timing-spi',
    name: '形式3: SPIシリアル通信 Mode 0（SPI Bus / 4線式同期型）',
    category: 'レイアウト',
    description: 'CS#がアクティブ（LOW）の期間に、SCKの立ち上がりでMOSI/MISOのデータビットをサンプリング。',
    code: '\\timing{\n  CS#:  1 0 0 0 0 0 1;\n  SCK:  0 P P P P 0 0;\n  MOSI: =IDLE =B3 =B2 =B1 =B0 =IDLE;\n  MISO: Z =D3 =D2 =D1 =D0 Z;\n}',
    tags: ['形式3', 'SPI', 'シリアル通信', 'MOSI', 'MISO', 'SCK', 'CS', 'レイアウト']
  },
  {
    id: 'timing-i2c',
    name: '形式4: I2C通信 スタート・データ転送（I2C / 2線式オープンドレイン型）',
    category: 'レイアウト',
    description: 'SCLがHIGHの間にSDAが立ち下がるスタート条件、クロック同期データ転送、ACKの返答。',
    code: '\\timing{\n  SCL: 1 P P P P 1;\n  SDA: 1 =START =D7 =D6 =ACK 1;\n}',
    tags: ['形式4', 'I2C', 'SCL', 'SDA', 'スタート条件', 'ACK', '2線式', 'レイアウト']
  },
  {
    id: 'timing-sram-read',
    name: '形式5: SRAMリードサイクル（Memory Bus / アドレス・データバス制御型）',
    category: 'レイアウト',
    description: 'アドレス確定後、チップセレクトCE#と出力イネーブルOE#をアサートしてデータバスからデータを読み出す。',
    code: '\\timing{\n  ADDR: =A0 =ADDR =ADDR =A1;\n  CE#:  1 0 0 1;\n  OE#:  1 0 0 1;\n  DATA: Z =VALID =VALID Z;\n}',
    tags: ['形式5', 'メモリ', 'SRAM', 'リードサイクル', 'アドレスバス', 'データバス', 'レイアウト']
  },

  // --- 構文形式 ---
  {
    id: 'timing-uart',
    name: '形式6: UART調歩同期フレーム（UART Frame / スタート・データ・ストップ構文形式）',
    category: '構文形式',
    description: 'アイドル（HIGH）からスタートビット（LOW）、8ビットデータ、ストップビット（HIGH）へと続く非同期シリアル構文。',
    code: '\\timing{\n  TXD: 1 =START =D0 =D1 =D2 =STOP 1;\n}',
    tags: ['形式6', 'UART', 'シリアル通信', '調歩同期', 'ボーレート', 'スタートビット', '構文形式']
  },
  {
    id: 'timing-tristate-bus',
    name: '形式7: 多重バス＆ハイインピーダンス（Tri-state Bus / Z・未定・マルチデータ構文形式）',
    category: '構文形式',
    description: 'ハイインピーダンス(Z)・バス確定値(=DATA)・クロック(P)・論理レベル(0/1)を網羅した構文形式。',
    code: '\\timing{\n  CLK:    P P P P P P;\n  OE#:    1 0 0 0 1 1;\n  DATA_A: =A0 =A1 =A2 =A3 Z Z;\n  DATA_B: Z Z =B0 =B1 =B2 =B3;\n}',
    tags: ['形式7', 'トライステート', 'Hi-Z', 'バス競合', 'ハイインピーダンス', '構文形式']
  }
];

// ==========================================
// 状態遷移図（オートマトン）ライブラリデータ定義
// ==========================================
const fsmLibrary = [
  // --- レイアウト ---
  {
    id: 'fsm-even-parity',
    name: '形式1: 偶数パリティ判定オートマトン（DFA / 相互遷移型）',
    category: 'レイアウト',
    description: '入力ビット列に含まれる「1」の個数が偶数個であるか判定。Evenが初期状態かつ二重円受理状態。',
    code: '\\fsm{\n  state: Even (0, 0) start, accept;\n  state: Odd  (140, 0);\n  Even -> Odd: "1" [bend];\n  Odd  -> Even: "1" [bend];\n  Even -> Even: "0";\n  Odd  -> Odd:  "0";\n}',
    tags: ['形式1', 'DFA', 'オートマトン', 'パリティ', '偶数', '奇数', '2進数', 'レイアウト']
  },
  {
    id: 'fsm-pattern-01',
    name: '形式2: パターン「01」検出オートマトン（直列シーケンス検出型）',
    category: 'レイアウト',
    description: '入力文字列の中から部分列 "01" が現れたことを検出して受理状態 q2 に遷移する決定性オートマトン。',
    code: '\\fsm{\n  state: q0 (0, 0) start;\n  state: q1 (120, 0);\n  state: q2 (240, 0) accept;\n  q0 -> q1: "0";\n  q0 -> q0: "1";\n  q1 -> q2: "1";\n  q1 -> q1: "0";\n  q2 -> q2: "0, 1";\n}',
    tags: ['形式2', 'パターン検出', 'DFA', '文字列検索', '受理状態', '01', 'レイアウト']
  },
  {
    id: 'fsm-t-ff',
    name: '形式3: Tフリップフロップ状態遷移図（順序回路 / トグル反転型）',
    category: 'レイアウト',
    description: '入力T=1のクロックパルスで出力Qが0と1の間をトグル（反転）し、T=0で状態を保持する順序回路。',
    code: '\\fsm{\n  state: Q0 (0, 0) start;\n  state: Q1 (140, 0);\n  Q0 -> Q1: "T=1" [bend];\n  Q1 -> Q0: "T=1" [bend];\n  Q0 -> Q0: "T=0";\n  Q1 -> Q1: "T=0";\n}',
    tags: ['形式3', 'T-FF', 'フリップフロップ', 'トグル', '順序回路', '状態遷移', 'レイアウト']
  },
  {
    id: 'fsm-modulo3-counter',
    name: '形式4: 3進カウンタ（Modulo-3 Counter / 三角形循環型）',
    category: 'レイアウト',
    description: 'クロック入力ごとに S0 → S1 → S2 → S0 と循環し、3回に1回キャリー（受理）を出力する順序回路。',
    code: '\\fsm{\n  state: S0 (0, 50) start;\n  state: S1 (120, -20);\n  state: S2 (240, 50) accept;\n  S0 -> S1: "CLK";\n  S1 -> S2: "CLK";\n  S2 -> S0: "CLK" [bend];\n}',
    tags: ['形式4', 'カウンタ', '3進', 'クロック', '同期回路', '状態マシン', 'レイアウト']
  },
  {
    id: 'fsm-vending-machine',
    name: '形式5: 簡易自動販売機（50円/100円投入モデル）',
    category: 'レイアウト',
    description: '50円硬貨と100円硬貨の投入により残高が遷移し、100円以上で商品排出状態（Buy）に到達するモデル。',
    code: '\\fsm{\n  state: 0円   (0, 0) start;\n  state: 50円  (120, 0);\n  state: 100円 (240, 0) accept;\n  0円   -> 50円:  "+50";\n  0円   -> 100円: "+100" [bend];\n  50円  -> 100円: "+50";\n  100円 -> 0円:   "購入/返却" [bend];\n}',
    tags: ['形式5', '自動販売機', '状態機械', '制御', '組み込み', 'イベント駆動', 'レイアウト']
  },
  {
    id: 'fsm-traffic-light',
    name: '形式6: 交通信号機コントローラ（青・黄・赤遷移）',
    category: 'レイアウト',
    description: 'タイマー割り込みにより、青（Green）→ 黄（Yellow）→ 赤（Red）→ 青へと順次循環する状態遷移。',
    code: '\\fsm{\n  state: 青 (0, 0) start;\n  state: 黄 (120, -30);\n  state: 赤 (240, 0);\n  青 -> 黄: "タイマー";\n  黄 -> 赤: "タイマー";\n  赤 -> 青: "タイマー" [bend];\n}',
    tags: ['形式6', '信号機', '制御システム', 'タイマー', '組込みシステム', 'レイアウト']
  },

  // --- 構文形式 ---
  {
    id: 'fsm-macro-standard',
    name: '形式7: LaTeX 独自マクロ オートマトン基本構文（\\fsm）',
    category: '構文形式',
    description: 'state（状態ノード）、start（初期矢印）、accept（二重円受理状態）、および ->（遷移線）による標準オートマトン構文。',
    code: '\\fsm{\n  state: S0 (0, 0) start;\n  state: S1 (140, 0) accept;\n  S0 -> S1: "a";\n  S1 -> S0: "b" [bend];\n  S0 -> S0: "c";\n}',
    tags: ['形式7', 'fsm', 'マクロ', '標準', '独自構文', '構文形式', '構文']
  },
  {
    id: 'fsm-macro-curved',
    name: '形式8: LaTeX 独自マクロ 曲線遷移・自己ループ構文（[bend]）',
    category: '構文形式',
    description: '同一ペア間の双方向遷移や [bend] 指定による美しいベジェ曲線遷移、自己ループを自在に制御する構文。',
    code: '\\fsm{\n  state: q0 (0, 0) start;\n  state: q1 (120, 0);\n  state: q2 (240, 0) accept;\n  q0 -> q1: "0";\n  q1 -> q2: "1";\n  q2 -> q0: "reset" [bend];\n  q0 -> q0: "loop";\n  q2 -> q2: "hold";\n}',
    tags: ['形式8', 'fsm', 'bend', '曲線', '自己ループ', 'マクロ', '構文形式', '構文']
  }
];

// ==========================================
// ファインマン・ダイアグラム ライブラリ データ
// ==========================================
const feynmanLibrary = [
  // --- 電磁相互作用 (QED) ---
  {
    id: 'feynman-muon-pair',
    name: '電子・陽電子対消滅（ミューオン対生成）',
    category: '電磁相互作用(QED)',
    description: '電子と陽電子が衝突・対消滅して仮想光子を生じ、ミューオン対（μ⁻, μ⁺）へ変換する基本過程。',
    code: '\\feynman{\n  fermion:     (0, 40) to (60, 0) "e^-";\n  antifermion: (0, -40) to (60, 0) "e^+";\n  photon:      (60, 0) to (140, 0) "\\gamma";\n  fermion:     (140, 0) to (200, 40) "\\mu^-";\n  antifermion: (140, 0) to (200, -40) "\\mu^+";\n}',
    tags: ['QED', '対消滅', '対生成', 'ミューオン', '光子', '散乱']
  },
  {
    id: 'feynman-compton',
    name: 'コンプトン散乱（電子と光子の散乱）',
    category: '電磁相互作用(QED)',
    description: '入射光子が静止電子と衝突し、エネルギーを失って散乱光子と反跳電子になる素過程。',
    code: '\\feynman{\n  fermion: (0, -30) to (60, 0) "e^-";\n  photon:  (0, 30) to (60, 0) "\\gamma";\n  fermion: (60, 0) to (130, 0) "e^-";\n  fermion: (130, 0) to (190, -30) "e^-";\n  photon:  (130, 0) to (190, 30) "\\gamma";\n}',
    tags: ['コンプトン散乱', 'QED', '電子', '光子', '散乱']
  },
  {
    id: 'feynman-bhabha',
    name: 'バーバ散乱（電子・陽電子弾性散乱）',
    category: '電磁相互作用(QED)',
    description: '電子と陽電子の弾性散乱（tチャネル光子交換過程）。',
    code: '\\feynman{\n  fermion:     (0, 40) to (80, 30) "e^-";\n  antifermion: (0, -40) to (80, -30) "e^+";\n  photon:      (80, 30) to (80, -30) "\\gamma";\n  fermion:     (80, 30) to (160, 40) "e^-";\n  antifermion: (80, -30) to (160, -40) "e^+";\n}',
    tags: ['バーバ散乱', 'QED', '電子', '陽電子', '弾性散乱']
  },

  // --- 弱相互作用 (Electroweak) ---
  {
    id: 'feynman-beta-decay',
    name: '中性子のベータ崩壊（W⁻ボソン媒介）',
    category: '弱相互作用(Electroweak)',
    description: 'dクォークがW⁻ボソンを放出してuクォークに変化し、W⁻が電子と反電子ニュートリノに崩壊。',
    code: '\\feynman{\n  fermion:     (0, 0) to (70, 0) "d";\n  fermion:     (70, 0) to (140, 35) "u";\n  boson:       (70, 0) to (140, -25) "W^-";\n  fermion:     (140, -25) to (205, -5) "e^-";\n  antifermion: (140, -25) to (205, -45) "\\bar{\\nu}_e" [flip];\n}',
    tags: ['ベータ崩壊', '弱相互作用', 'Wボソン', 'ニュートリノ', 'クォーク']
  },
  {
    id: 'feynman-muon-decay',
    name: 'ミューオン崩壊（弱相互作用崩壊過程）',
    category: '弱相互作用(Electroweak)',
    description: 'ミューオンがW⁻ボソンを放出してミューニュートリノになり、W⁻が電子と反電子ニュートリノに崩壊。',
    code: '\\feynman{\n  fermion:     (0, 0) to (60, 0) "\\mu^-";\n  fermion:     (60, 0) to (120, -25) "\\nu_\\mu";\n  boson:       (60, 0) to (120, 25) "W^-";\n  antifermion: (120, 25) to (180, 42) "\\bar{\\nu}_e";\n  fermion:     (120, 25) to (180, 8) "e^-" [flip];\n}',
    tags: ['ミューオン崩壊', '弱相互作用', 'レプトン', 'ニュートリノ']
  },

  // --- 強い相互作用(QCD)・ヒッグス ---
  {
    id: 'feynman-higgs-decay',
    name: 'ヒッグス粒子の2光子崩壊（トップループ媒介）',
    category: '強い相互作用(QCD)・ヒッグス',
    description: 'ヒッグス粒子Hがトップクォークループを経て2光子（γ, γ）へと崩壊するLHC重要発見チャンネル。',
    code: '\\feynman{\n  scalar:  (0, 0) to (60, 0) "H";\n  fermion: (60, 0) to (110, 25) "t";\n  fermion: (110, 25) to (110, -25) "t";\n  fermion: (110, -25) to (60, 0) "t";\n  photon:  (110, 25) to (170, 45) "\\gamma";\n  photon:  (110, -25) to (170, -45) "\\gamma";\n}',
    tags: ['ヒッグス', 'Higgs', 'トップクォーク', 'ループ', '光子']
  },
  {
    id: 'feynman-gluon-vertex',
    name: 'グルーオン3点自己相互作用（QCD非可換性）',
    category: '強い相互作用(QCD)・ヒッグス',
    description: '強い相互作用のゲージ対称性SU(3)により、グルーオン同士が直接結合する3点バーテックス。',
    code: '\\feynman{\n  gluon: (0, 40) to (70, 0) "g";\n  gluon: (0, -40) to (70, 0) "g";\n  gluon: (70, 0) to (150, 0) "g";\n}',
    tags: ['QCD', 'グルーオン', '強い相互作用', 'ゲージ理論', '3点相互作用']
  }
];

// ==========================================
// サンキーダイアグラム プリセットライブラリ
// ==========================================
const sankeyLibrary = [
  // --- レイアウト ---
  {
    id: 'sankey-nhk-pl',
    name: '形式1: 日本放送協会（NHK） 一般勘定 損益計算書（PLサンキー図）',
    category: 'レイアウト',
    description: '受信料等の事業収入と積立金取崩から総資金へ集約し、4大経費グループを経て国内放送費・給与・各種経費・減価償却費等へ段階的に展開するP/Lフロー。',
    code: '\\pl{\n  company: "日本放送協会（NHK）";\n  code: "一般勘定";\n  period: "2025年度 決算（令和7年度）";\n  unit: "億円";\n  consolidated: false;\n\n  // 1. 収入の内訳 -> 事業収入（合計 6,130億円）\n  受信料 [5851, 90.7%, #38bdf8] -> 事業収入;\n  副次収入等 [80, 1.2%, #38bdf8] -> 事業収入;\n  財務収入 [73, 1.1%, #38bdf8] -> 事業収入;\n  雑収入 [72, 1.1%, #38bdf8] -> 事業収入;\n  交付金収入 [40, 0.6%, #38bdf8] -> 事業収入;\n  特別収入 [14, 0.2%, #38bdf8] -> 事業収入;\n\n  // 2. 中央の集約（事業収入 6,130億円 ＋ 不足補てん 318億円 ＝ 総資金 6,449億円）\n  事業収入 [6130, 95.1%, #38bdf8] -> 総資金;\n  還元目的積立金取崩等 [318, 4.9%, #f59e0b] -> 総資金;\n  node: 総資金 [6449, 100%, #0284c7];\n\n  // 3. 総資金から大枠の経費グループへ集約\n  総資金 -> 放送・配信経費 [3679, 57.0%, #f87171];\n  総資金 -> 人件費 [1389, 21.5%, #f87171];\n  総資金 -> 営業・管理その他経費 [814, 12.6%, #f87171];\n  総資金 -> 減価償却費 [567, 8.8%, #f87171];\n\n  // 4. 放送・配信経費の内訳展開\n  放送・配信経費 -> 国内放送費 [3311, 51.3%, #f87171];\n  放送・配信経費 -> 国際放送費 [194, 3.0%, #f87171];\n  放送・配信経費 -> 国内外配信費 [174, 2.7%, #f87171];\n\n  // 5. 人件費の内訳展開\n  人件費 -> 給与 [1089, 16.9%, #f87171];\n  人件費 -> 退職手当・厚生費 [300, 4.7%, #f87171];\n\n  // 6. 営業・管理その他経費の内訳展開\n  営業・管理その他経費 -> 契約収納費 [474, 7.3%, #f87171];\n  営業・管理その他経費 -> 共通管理費 [181, 2.8%, #f87171];\n  営業・管理その他経費 -> 調査広報費 [137, 2.1%, #f87171];\n  営業・管理その他経費 -> その他・特別支出 [17, 0.3%, #f87171];\n  営業・管理その他経費 -> 受信対策費 [5, 0.1%, #f87171];\n\n  // 7. 減価償却費の内訳展開（固定資産別）\n  減価償却費 -> 放送設備・送信機等（機械装置） [346, 5.4%, #f87171];\n  減価償却費 -> 局舎・電波塔等（建物・構築物） [162, 2.5%, #f87171];\n  減価償却費 -> ソフトウェア・その他 [59, 0.9%, #f87171];\n}',
    tags: ['NHK', 'PL', '損益計算書', '財務', '決算', '受信料', '総資金', '事業収入', 'レイアウト']
  },
  {
    id: 'sankey-nhk-bs',
    name: '形式2: 日本放送協会（NHK） 連結貸借対照表（BSサンキー図）',
    category: 'レイアウト',
    description: '日本放送協会（NHK）の令和7年度決算B/Sモデル。資本・剰余金・引当金等の調達元から資産合計を経由し、有形固定資産や有価証券等の保有形態への配分を可視化。',
    code: '\\bs{\n  company: "日本放送協会（NHK）";\n  code: "連結勘定";\n  period: "令和7年度 決算（B/S）";\n  unit: "億円";\n  consolidated: true;\n\n  // 負債・純資産（調達元） -> 資産合計\n  固定資産充当資本 [5390, 39.0%, #3b82f6] -> 資産合計;\n  連結剰余金 [3706, 26.8%, highlight] -> 資産合計;\n  退職給付引当金 [1429, 10.3%, #ea580c] -> 資産合計;\n  受信料前受金 [1293, 9.4%, #f59e0b] -> 資産合計;\n  買掛・未払金等 [1455, 10.5%, #fbbf24] -> 資産合計;\n  国際催事放送権等 [499, 3.6%, #f97316] -> 資産合計;\n  その他 [43, 0.3%, #93c5fd] -> 資産合計;\n\n  // 資産合計 -> 資産（保有形態）\n  資産合計 [5265, 38.1%, #10b981] -> 有形固定資産;\n  資産合計 [2944, 21.3%, #34d399] -> 有価証券;\n  資産合計 [2082, 15.1%, #059669] -> 長期保有有価証券等;\n  資産合計 [1349, 9.8%, #047857] -> 建設積立資産;\n  資産合計 [1295, 9.4%, #6ee7b7] -> 現金及び預金;\n  資産合計 [669, 4.8%, #a7f3d0] -> 未収金・棚卸等;\n  資産合計 [211, 1.5%, #a7f3d0] -> 無形固定資産;\n}',
    tags: ['NHK', 'BS', '貸借対照表', '財務', '決算', '資産', '負債', '純資産', '連結剰余金', 'レイアウト']
  },
  {
    id: 'sankey-ipa-bs',
    name: '形式3: IPA (情報処理推進機構) 貸借対照表構造分析（欠損金・出資金BS）',
    category: 'レイアウト',
    description: '独立行政法人IPAの令和5年度B/Sモデル。政府出資金（1,200億円）と欠損金（-351億円）の代数和から株主資本（849億円）を構成する控除フローを可視化。',
    code: '\\bs{\n  company: "IPA (情報処理推進機構)";\n  period: "令和5年度 貸借対照表構造分析";\n  unit: "億円";\n  consolidated: false;\n\n  // 1. 資産内訳 -> 流動資産\n  現預金 [228, 20.3%, #38bdf8] -> 流動資産;\n  未収金・前払費用等 [25, 2.2%, #38bdf8] -> 流動資産;\n\n  // 2. 資産内訳 -> 固定資産\n  関係会社株式 [760, 67.7%, #38bdf8] -> 固定資産;\n  有形固定資産 [51, 4.5%, #38bdf8] -> 固定資産;\n  ソフトウェア [36, 3.2%, #38bdf8] -> 固定資産;\n  その他投資等 [22, 2.0%, #38bdf8] -> 固定資産;\n\n  // 3. 資産合計（中央）\n  流動資産 [253, 22.5%, #38bdf8, above] -> 資産;\n  固定資産 [869, 77.5%, #38bdf8, below] -> 資産;\n  node: 資産 [1122, 100%, #0284c7, above];\n\n  // 4. 資産 -> 負債・純資産\n  資産 -> 負債 [273, 24.3%, #f87171, above];\n  資産 -> 純資産 [849, 75.7%, #34d399, below];\n\n  // 5. 負債の内訳（最右列へ展開）\n  負債 -> 流動負債 [204, 18.2%, #f87171, above];\n  負債 -> 固定負債 [69, 6.1%, #f87171, above];\n  流動負債 -> 運営費交付金債務等 [204, 18.2%, #f87171];\n  固定負債 -> 資産見返負債等 [69, 6.1%, #f87171];\n\n  // 6. 純資産の内訳（株主資本を挟んで負債と同じ最右列へ整列）\n  純資産 -> 株主資本 [849, 75.7%, #34d399, below];\n  株主資本 -> 政府出資金 [1200, 106.9%, #34d399, above];\n  株主資本 -> 資本剰余金・欠損金等 [-351, -31.3%, #f87171, below];\n}',
    tags: ['IPA', 'BS', '貸借対照表', '財務', '欠損金', '出資金', '純資産', '控除フロー', 'レイアウト']
  },
  {
    id: 'sankey-carnot-heat-engine',
    name: '形式4: 熱機関（カルノーサイクル）の熱収支（標準2分岐型）',
    category: 'レイアウト',
    description: '高温熱源から吸熱したエネルギーが、有効な外部仕事と低温熱源への排熱に分配される基本収支。',
    code: '\\sankey{\n  高温熱源Q_H [100] -> 有効仕事W [40];\n  高温熱源Q_H -> 低温排熱Q_L [60];\n}',
    tags: ['熱力学', 'カルノーサイクル', '熱効率', '排熱', '仕事', 'レイアウト']
  },
  {
    id: 'sankey-thermal-power-plant',
    name: '形式5: 火力発電所のエネルギー損失フロー（多段収支型）',
    category: 'レイアウト',
    description: '燃料燃焼熱からボイラー・蒸気タービンを経て発電に至る多段損失フロー。',
    code: '\\sankey{\n  燃料化学エネルギー [100] -> ボイラー熱量 [88];\n  燃料化学エネルギー -> 排煙・不完全燃焼損失 [12];\n  ボイラー熱量 -> 蒸気タービン仕事 [42];\n  ボイラー熱量 -> 配管放熱・内部損失 [46];\n  蒸気タービン仕事 -> 発電電力出力 [38];\n  蒸気タービン仕事 -> 発電機機械摩擦 [4];\n}',
    tags: ['火力発電', 'ボイラー', 'タービン', '発電', '熱損失', '多段', 'レイアウト']
  },
  {
    id: 'sankey-business-breakout',
    name: '形式6: ビジネス向けパーセンテージ・ブレイクアウト（L字直角分岐型）',
    category: 'レイアウト',
    description: '起点ブロック（100%）から一部が直角に上向き（L字）に伸び、一部が水平矢印で伸びるプレゼン・ピッチ向け構成比サンキー図。',
    code: '\\sankey{\n  type: breakout;\n  title: ビジネス向けパーセンテージ サンキーダイアグラム;\n  root: "全社売上高 (100%)", 100;\n  up: "新規事業 A", 6, [6%], #dc2626;\n  up: "新規事業 B", 7, [7%], #ea580c;\n  up: "R&D投資枠", 8, [8%], #f59e0b;\n  right: "国内リテール事業", 10, [10%], #0284c7;\n  right: "法人エンタープライズ", 13, [13%], #64748b;\n  right: "海外クラウド主力", 49, [49%], #10b981;\n}',
    tags: ['ブレイクアウト', '構成比', 'L字分岐', 'プレゼン', '売上分解', 'ビジネス', 'レイアウト']
  },
  {
    id: 'sankey-cost-activity-funnel',
    name: '形式7: コストフロー費用活動製品を示すサンキー（ファネル収束・再分岐型）',
    category: 'レイアウト',
    description: '複数の原価・費用要素が中央の1つの活動（ACTIVITY）の柱に合流し、少数の製品へ再配分されるファネル型コストフロー。',
    code: '\\sankey{\n  type: funnel;\n  title: コストフロー費用活動製品を示すサンキーダイアグラム;\n  in: "材料費 (Cost 1)", 10, #0284c7;\n  in: "直接労務費 (Cost 2)", 7.5, #eab308;\n  in: "設備償却費 (Cost 3)", 5, #f97316;\n  in: "外注加工費 (Cost 4)", 4.5, #10b981;\n  in: "研究開発配賦 (Cost 5)", 8, #06b6d4;\n  activity: "製品製造・組立活動 (Activity)", 35;\n  out: "主力製品 A (Product 1)", 20, #0f766e;\n  out: "量産製品 B (Product 2)", 15, #334155;\n}',
    tags: ['コストフロー', 'ファネル', '原価計算', '活動基準原価計算', 'ABC', '収束再分岐', 'レイアウト']
  },
  {
    id: 'sankey-alluvial-customer-journey',
    name: '形式8: 多層カテゴリマッピング・顧客動線（Alluvial多段ダイアグラム）',
    category: 'レイアウト',
    description: '住宅タイプ・性別・購買チャネル・商品カテゴリの4段階にわたる顧客属性と購買行動の多層マッピング分析。',
    code: '\\sankey{\n  type: standard;\n  title: 顧客属性・購買チャネル・商品カテゴリ動線;\n  stages: Housing Type, Gender, Channel, Product Category;\n  持ち家 [45] -> 女性 [28];\n  持ち家 -> 男性 [17];\n  賃貸 [55] -> 女性 [32];\n  賃貸 -> 男性 [23];\n  女性 -> オンラインEC [40];\n  女性 -> 実店舗 [20];\n  男性 -> オンラインEC [25];\n  男性 -> 実店舗 [15];\n  オンラインEC -> アパレル・衣料 [35];\n  オンラインEC -> 自転車・アウトドア [18];\n  オンラインEC -> その他日用品 [12];\n  実店舗 -> アパレル・衣料 [15];\n  実店舗 -> 自転車・アウトドア [12];\n  実店舗 -> その他日用品 [8];\n}',
    tags: ['Alluvial', '多層マッピング', 'クロス集計', '多段フロー', '属性分析', 'レイアウト']
  },

  // --- 構文形式 ---
  {
    id: 'sankey-macro-pl',
    name: '形式9: 決算書P/L標準マクロ構文（\\pl）',
    category: '構文形式',
    description: '企業名、決算期、売上構成から営業利益・当期純利益までの展開をセミコロン区切りで記述するPhysiNote標準の\\plマクロ構文。',
    code: '\\pl{\n  company: "サンプル商事";\n  period: "2025年3月期 通期";\n  unit: "億円";\n  consolidated: true;\n\n  // 売上高への集約\n  国内事業 [700, 70%, #38bdf8] -> 売上高;\n  海外事業 [300, 30%, #38bdf8] -> 売上高;\n\n  // 費用と利益の配分\n  売上高 [1000, 100%, #0284c7] -> 売上原価 [650, 65%, #f87171, above];\n  売上高 -> 売上総利益 [350, 35%, #34d399, below];\n\n  売上総利益 -> 販管費 [200, 20%, #f87171, above];\n  売上総利益 -> 営業利益 [150, 15%, #34d399, below];\n}',
    tags: ['PL', '損益計算書', 'マクロ', '標準', '独自構文', '構文形式']
  },
  {
    id: 'sankey-macro-bs',
    name: '形式10: 決算書B/S標準マクロ構文（\\bs）',
    category: '構文形式',
    description: '流動・固定資産と負債・純資産の内訳、および中央の総資産ノードへの集約展開を定義するPhysiNote標準の\\bsマクロ構文。',
    code: '\\bs{\n  company: "サンプル製造";\n  period: "2025年3月期 決算";\n  unit: "億円";\n  consolidated: true;\n\n  // 資産サイド\n  流動資産 [400, 40%, #38bdf8, above] -> 総資産;\n  固定資産 [600, 60%, #38bdf8, below] -> 総資産;\n  node: 総資産 [1000, 100%, #0284c7, above];\n\n  // 負債・純資産サイド\n  総資産 -> 負債 [450, 45%, #f87171, above];\n  総資産 -> 純資産 [550, 55%, #34d399, below];\n\n  負債 -> 流動負債 [250, 25%, #f87171];\n  負債 -> 固定負債 [200, 20%, #f87171];\n  純資産 -> 資本金 [300, 30%, #34d399];\n  純資産 -> 利益剰余金 [250, 25%, #34d399];\n}',
    tags: ['BS', '貸借対照表', 'マクロ', '標準', '独自構文', '構文形式']
  },
  {
    id: 'sankey-macro-standard',
    name: '形式11: 独自マクロ標準構文（\\sankey）',
    category: '構文形式',
    description: 'ノード間の流量や割合、分岐カラーを直感的なアロー記法で記述するPhysiNote標準の\\sankeyマクロ構文。',
    code: '\\sankey{\n  title: 標準サンキーダイアグラム構文;\n  主熱源 [100, #38bdf8] -> 主出力 [60, #10b981];\n  主熱源 -> 排熱・損失 [40, #ef4444];\n  主出力 -> 有効利用 [50, #10b981];\n  主出力 -> 補機損失 [10, #f59e0b];\n}',
    tags: ['sankey', 'サンキー', 'マクロ', '標準', '独自構文', '構文形式']
  },
  {
    id: 'sankey-latex-tikz',
    name: '形式12: LaTeX TikZネイティブ サンキー構文（\\begin{tikzpicture}）',
    category: '構文形式',
    description: 'LaTeXのTikZ環境（\\begin{tikzpicture}）内でエネルギー・物質収支フローを記述する学術・論文標準の構文形式。',
    code: '\\begin{tikzpicture}\n  % sankey\n  title: "熱機関のエネルギー収支 (TikZ)";\n  高温熱源Q_H [100, #38bdf8] -> 有効仕事W [40, #10b981];\n  高温熱源Q_H -> 低温排熱Q_L [60, #ef4444];\n\\end{tikzpicture}',
    tags: ['TikZ', 'LaTeX', 'tikzpicture', 'エネルギー', '学術', '構文形式']
  }
];

// ==========================================
// フローチャート ライブラリ データ
// ==========================================
const flowchartLibrary = [
  // --- レイアウト ---
  {
    id: 'flow-binary-search',
    name: '形式1: 二分探索アルゴリズム（Binary Search）',
    category: 'レイアウト',
    description: 'ソート済み配列の中央値と比較しながら探索範囲を半分に絞り込む高速検索アルゴリズム。左右双方向ループ戻り線。',
    code: '\\flowchart{\n  node: 開始 (0, 0) [start];\n  node: low=0, high=N-1 (0, 75) [proc];\n  node: low <= high ? (0, 155) [cond];\n  node: mid = (low+high)/2 (0, 235) [proc];\n  node: arr[mid] == key ? (0, 315) [cond];\n  node: midを返す (190, 315) [proc];\n  node: arr[mid] < key ? (0, 410) [cond];\n  node: low = mid + 1 (160, 490) [proc];\n  node: high = mid - 1 (-160, 490) [proc];\n  node: -1 (見つからず) (-190, 200) [proc];\n  node: 終了 (0, 580) [end];\n\n  開始 -> low=0, high=N-1;\n  low=0, high=N-1 -> low <= high ?;\n  low <= high ? -> mid = (low+high)/2: "Yes";\n  low <= high ? -> -1 (見つからず): "No";\n  mid = (low+high)/2 -> arr[mid] == key ?;\n  arr[mid] == key ? -> midを返す: "Yes";\n  arr[mid] == key ? -> arr[mid] < key ?: "No";\n  arr[mid] < key ? -> low = mid + 1: "Yes";\n  arr[mid] < key ? -> high = mid - 1: "No";\n  low = mid + 1 -> low <= high ?;\n  high = mid - 1 -> low <= high ?;\n  midを返す -> 終了;\n  -1 (見つからず) -> 終了;\n}',
    tags: ['形式1', '二分探索', 'バイナリサーチ', '検索', 'O(log N)', 'レイアウト']
  },
  {
    id: 'flow-note-support-branch',
    name: '形式2: 記事サポート・リアクション判定フロー',
    category: 'レイアウト',
    description: '「この文章にチップを出しますか？」の条件分岐に応じ、感謝メッセージまたはスキのお願いへ分岐して合流・終了するインタラクションフロー。',
    code: '\\flowchart{\n  node: 開始 (0, 0) [start];\n  node: この文章にチップを\\n出しますか？ (0, 80) [cond];\n  node: ありがとうございます (-120, 170) [proc];\n  node: スキは押してね (120, 170) [proc];\n  node: 終了 (0, 250) [end];\n\n  開始 -> この文章にチップを\\n出しますか？;\n  この文章にチップを\\n出しますか？ -> ありがとうございます: "Yes";\n  この文章にチップを\\n出しますか？ -> スキは押してね: "No";\n  ありがとうございます -> 終了;\n  スキは押してね -> 終了;\n}',
    tags: ['形式2', 'チップ', 'サポート', 'note', '条件分岐', 'インタラクション', '合流', 'レイアウト']
  },
  {
    id: 'flow-sum-loop',
    name: '形式3: 1からNまでの整数の総和（ループ計算）',
    category: 'レイアウト',
    description: 'カウンタ変数 i を 1 から N までインクリメントしながら、合計値 sum に累積加算する反復構造。',
    code: '\\flowchart{\n  node: 開始 (0, 0) [start];\n  node: 入力: N (0, 70) [io];\n  node: sum = 0, i = 1 (0, 140) [proc];\n  node: i <= N ? (0, 220) [cond];\n  node: sum += i, i++ (150, 300) [proc];\n  node: 出力: sum (0, 310) [io];\n  node: 終了 (0, 380) [end];\n\n  開始 -> 入力: N;\n  入力: N -> sum = 0, i = 1;\n  sum = 0, i = 1 -> i <= N ?;\n  i <= N ? -> sum += i, i++: "Yes";\n  sum += i, i++ -> i <= N ?;\n  i <= N ? -> 出力: sum: "No";\n  出力: sum -> 終了;\n}',
    tags: ['形式3', 'ループ', 'for文', 'while文', '累積加算', '反復', 'レイアウト']
  },
  {
    id: 'flow-login-auth',
    name: '形式4: ユーザー認証・ログイン判定フロー',
    category: 'レイアウト',
    description: 'パスワード照合、エラー回数カウント、およびアカウントロック（凍結）を含むセキュアログイン処理。',
    code: '\\flowchart{\n  node: 開始 (0, 0) [start];\n  node: ID・PW入力 (0, 70) [io];\n  node: パスワード検証 (0, 150) [sub];\n  node: 認証成功 ? (0, 230) [cond];\n  node: セッション発行 (140, 310) [proc];\n  node: マイページ表示 (140, 380) [proc];\n  node: 失敗回数++ (-140, 310) [proc];\n  node: 失敗 >= 5回 ? (-140, 380) [cond];\n  node: アカウント凍結 (-140, 460) [proc];\n  node: 終了 (0, 530) [end];\n\n  開始 -> ID・PW入力;\n  ID・PW入力 -> パスワード検証;\n  パスワード検証 -> 認証成功 ?;\n  認証成功 ? -> セッション発行: "Yes";\n  認証成功 ? -> 失敗回数++: "No";\n  セッション発行 -> マイページ表示;\n  失敗回数++ -> 失敗 >= 5回 ?;\n  失敗 >= 5回 ? -> アカウント凍結: "Yes";\n  失敗 >= 5回 ? -> ID・PW入力: "No";\n  マイページ表示 -> 終了;\n  アカウント凍結 -> 終了;\n}',
    tags: ['形式4', 'ログイン', '認証', 'セキュリティ', 'Webシステム', 'レイアウト']
  },
  {
    id: 'flow-vending-machine',
    name: '形式5: 自動販売機 購入・返金フロー',
    category: 'レイアウト',
    description: '硬貨投入から投入金額判定、商品選択、商品排出、おつり計算・返却までの一連の組み込み制御ロジック。',
    code: '\\flowchart{\n  node: 開始 (0, 0) [start];\n  node: 硬貨投入 (0, 70) [io];\n  node: 金額 >= 価格 ? (0, 150) [cond];\n  node: ランプ点灯 (0, 230) [proc];\n  node: ボタン押下 (0, 300) [io];\n  node: 商品排出 & おつり計算 (0, 380) [proc];\n  node: おつり > 0 ? (0, 460) [cond];\n  node: おつり返却 (140, 530) [io];\n  node: 終了 (0, 600) [end];\n\n  開始 -> 硬貨投入;\n  硬貨投入 -> 金額 >= 価格 ?;\n  金額 >= 価格 ? -> ランプ点灯: "Yes";\n  金額 >= 価格 ? -> 硬貨投入: "No";\n  ランプ点灯 -> ボタン押下;\n  ボタン押下 -> 商品排出 & おつり計算;\n  商品排出 & おつり計算 -> おつり > 0 ?;\n  おつり > 0 ? -> おつり返却: "Yes";\n  おつり > 0 ? -> 終了: "No";\n  おつり返却 -> 終了;\n}',
    tags: ['形式5', '自動販売機', '組込み', '制御フロー', 'ステート', 'レイアウト']
  },
  {
    id: 'flow-euclid-gcd',
    name: '形式6: ユークリッドの互除法（最大公約数 GCD）',
    category: 'レイアウト',
    description: '剰余計算を繰り返すことで2つの整数 a, b の最大公約数を高速に求める古典的アルゴリズム。',
    code: '\\flowchart{\n  node: 開始 (0, 0) [start];\n  node: 入力: a, b (0, 70) [io];\n  node: b == 0 ? (0, 150) [cond];\n  node: GCD = a (140, 230) [proc];\n  node: r = a % b (0, 230) [proc];\n  node: a = b, b = r (0, 300) [proc];\n  node: 出力: GCD (140, 370) [io];\n  node: 終了 (140, 440) [end];\n\n  開始 -> 入力: a, b;\n  入力: a, b -> b == 0 ?;\n  b == 0 ? -> GCD = a: "Yes";\n  b == 0 ? -> r = a % b: "No";\n  r = a % b -> a = b, b = r;\n  a = b, b = r -> b == 0 ?;\n  GCD = a -> 出力: GCD;\n  出力: GCD -> 終了;\n}',
    tags: ['形式6', 'ユークリッド', '互除法', 'GCD', '最大公約数', '数学', 'レイアウト']
  },
  {
    id: 'flow-max-val',
    name: '形式7: 2値の最大値判定（基本条件分岐）',
    category: 'レイアウト',
    description: '2つの数値 a, b を入力し、条件分岐で大きい方の値を最大値として出力する基本的なアルゴリズム。',
    code: '\\flowchart{\n  node: 開始 [start];\n  node: 入力: a, b [io];\n  node: a > b ? [cond];\n  node: max = a [proc];\n  node: max = b [proc];\n  node: 出力: max [io];\n  node: 終了 [end];\n\n  開始 -> 入力: a, b;\n  入力: a, b -> a > b ?;\n  a > b ? -> max = a: "Yes";\n  a > b ? -> max = b: "No";\n  max = a -> 出力: max;\n  max = b -> 出力: max;\n  出力: max -> 終了;\n}',
    tags: ['形式7', '最大値', '条件分岐', 'if文', '基本', 'レイアウト']
  },

  // --- 構文形式 ---
  {
    id: 'flowchart-macro-standard',
    name: '形式8: LaTeX 独自マクロ フローチャート基本構文（\\flowchart）',
    category: '構文形式',
    description: 'ノード定義（start, io, cond, proc, end）と接続記号（->）による標準フローチャート構文（自動レイアウト対応）。',
    code: '\\flowchart{\n  node: 開始 [start];\n  node: 入力データ読込 [io];\n  node: 条件判定 ? [cond];\n  node: 処理A [proc];\n  node: 処理B [proc];\n  node: 終了 [end];\n\n  開始 -> 入力データ読込;\n  入力データ読込 -> 条件判定 ?;\n  条件判定 ? -> 処理A: "Yes";\n  条件判定 ? -> 処理B: "No";\n  処理A -> 終了;\n  処理B -> 終了;\n}',
    tags: ['形式8', 'flowchart', 'マクロ', '標準', '独自構文', '自動レイアウト', '構文形式', '構文']
  },
  {
    id: 'flowchart-macro-coordinates',
    name: '形式9: LaTeX 独自マクロ 座標指定型フローチャート構文（精密配置）',
    category: '構文形式',
    description: '各ノードに (x, y) 座標を指定して、ループ線や複雑な分岐フローを意図通りに精密配置する独自マクロ構文。',
    code: '\\flowchart{\n  node: 開始 (0, 0) [start];\n  node: 初期化 (0, 70) [proc];\n  node: 継続判定 ? (0, 150) [cond];\n  node: メイン処理 (0, 230) [proc];\n  node: 更新 (140, 230) [proc];\n  node: 終了 (0, 310) [end];\n\n  開始 -> 初期化;\n  初期化 -> 継続判定 ?;\n  継続判定 ? -> メイン処理: "Yes";\n  継続判定 ? -> 終了: "No";\n  メイン処理 -> 更新;\n  更新 -> 継続判定 ?;\n}',
    tags: ['形式9', 'flowchart', 'マクロ', '標準', '独自構文', '座標指定', '構文形式', '構文']
  }
];

// ==========================================
// 表（テーブル）ライブラリ データ
// ==========================================
const tableLibrary = [
  // --- レイアウト ---
  {
    id: 'table-layout-grid',
    name: '標準グリッドレイアウト（Grid / 角丸・薄枠線）',
    category: 'レイアウト',
    description: '全セルを細い枠線でくっきり区切り、淡いグレーのヘッダーと角丸外枠で整える最も基本的で読みやすい標準レイアウト。',
    code: '| 項目名 | 分類 | 基準値 | 備考 |\n| :--- | :--- | :---: | :--- |\n| サンプルA | 標準型 | 100 | 基本パラメータ |\n| サンプルB | 高精度型 | 250 | オプション適用 |\n| サンプルC | 経済型 | 75 | コスト重視 |',
    tags: ['grid', '標準', 'グリッド', '枠線', '角丸', 'レイアウト']
  },
  {
    id: 'table-style-academic',
    name: '学術論文スタイル（Academic / 上下太線・縦線なし）',
    category: 'レイアウト',
    description: 'style: academic を指定。上下の太罫線と中間の細横線のみで構成する、論文・学術レポート標準の伝統的booktabsレイアウト。',
    code: 'style: academic\n| 項目名 | 分類 | 基準値 | 備考 |\n| :--- | :--- | :---: | :--- |\n| サンプルA | 標準型 | 100 | 基本パラメータ |\n| サンプルB | 高精度型 | 250 | オプション適用 |\n| サンプルC | 経済型 | 75 | コスト重視 |',
    tags: ['academic', '学術', '論文', 'booktabs', '罫線', 'レイアウト']
  },
  {
    id: 'table-style-accent',
    name: 'アクセント線スタイル（Accent / 上部太線・線なし）',
    category: 'レイアウト',
    description: 'style: accent を指定。最上部に引き締まったアクセント線が入り、縦線なし・薄い横線のみで軽やかに見せるモダンレイアウト。',
    code: 'style: accent\n| 項目名 | 分類 | 基準値 | 備考 |\n| :--- | :--- | :---: | :--- |\n| サンプルA | 標準型 | 100 | 基本パラメータ |\n| サンプルB | 高精度型 | 250 | オプション適用 |\n| サンプルC | 経済型 | 75 | コスト重視 |',
    tags: ['accent', 'アクセント', 'モダン', 'ボーダーレス', 'レイアウト']
  },
  {
    id: 'table-style-dark',
    name: 'ダークヘッダースタイル（Dark / 濃灰ヘッダー・全グリッド）',
    category: 'レイアウト',
    description: 'style: dark を指定。ヘッダーを濃灰背景＋白文字にし、全セルをグリッド枠線でくっきりタイリングした重厚なデータ整理レイアウト。',
    code: 'style: dark\n| 項目名 | 分類 | 基準値 | 備考 |\n| :--- | :--- | :---: | :--- |\n| サンプルA | 標準型 | 100 | 基本パラメータ |\n| サンプルB | 高精度型 | 250 | オプション適用 |\n| サンプルC | 経済型 | 75 | コスト重視 |',
    tags: ['dark', 'チャコール', 'グリッド', '枠線', 'ダーク', 'レイアウト']
  },
  {
    id: 'table-style-index',
    name: '左列インデックス強調スタイル（Index / 行見出し強調）',
    category: 'レイアウト',
    description: 'style: index または style: blue を指定。ヘッダーと第1列（行の見出し）を同時に強調する機能比較表・マニュアル向けレイアウト。',
    code: 'style: index\n| 主要機能 | 対象モジュール | 対応状況 | 担当チーム |\n| :--- | :--- | :---: | :--- |\n| 認証基盤 | Auth / Gateway | 対応済 | セキュリティ班 |\n| 決済連携 | Billing Service | 開発中 | 決済班 |\n| 通知配信 | Message Queue | 計画中 | 基盤班 |',
    tags: ['index', 'インデックス', '比較表', '機能一覧', 'レイアウト']
  },

  // --- 構文形式 ---
  {
    id: 'table-syntax-markdown',
    name: 'Markdown テーブル構文（アライメント指定）',
    category: '構文形式',
    description: '| :--- | :---: | ---: | で列ごとに「左寄せ・中央揃え・右寄せ」を自在に指定できるMarkdown標準のテーブル構文。',
    code: '| 左寄せ (テキスト) | 中央揃え (コード) | 右寄せ (数値・金額) |\n| :--- | :---: | ---: |\n| 製品名称アルファ | P-101 | 12,800 円 |\n| 製品名称ベータ | P-102 | 8,500 円 |\n| 製品名称ガンマ | P-103 | 24,000 円 |',
    tags: ['Markdown', 'アライメント', '左寄せ', '中央揃え', '右寄せ', '構文']
  },
  {
    id: 'table-syntax-csv',
    name: 'CSV テーブル構文（カンマ区切り・最短入力）',
    category: '構文形式',
    description: 'カンマ（,）区切りテキストをそのまま貼り付けるだけで即座に美しい表へと変換する最短入力構文。',
    code: '品名,カテゴリ,単価,数量,小計\nセンサーモジュール,電子部品,1500,4,6000\nマイコンボード,制御機器,4200,2,8400\nリチウム電池パック,電源,2800,3,8400',
    tags: ['CSV', 'カンマ区切り', 'エクセル', 'シンプル', '構文']
  },
  {
    id: 'table-syntax-latex',
    name: 'LaTeX tabular 構文（\\begin{tabular}・罫線制御）',
    category: '構文形式',
    description: '\\begin{tabular}{|l|c|r|} と \\hline で縦線・横線を細部まで指定できるLaTeX互換の厳密な数式文書用テーブル構文。',
    code: '\\begin{tabular}{|l|c|r|}\n\\hline\n実験項目 & 試行回数 & 測定結果 \\\\\n\\hline\n予備実験 A & 10 回 & 98.2 \\% \\\\\n本実験 B & 50 回 & 99.4 \\% \\\\\n検証実験 C & 100 回 & 99.8 \\% \\\\\n\\hline\n\\end{tabular}',
    tags: ['LaTeX', 'tabular', '数式', 'hline', '学術', '構文']
  },

  // --- 拡張レイアウト ---
  {
    id: 'table-layout-rowspan',
    name: '縦セル結合レイアウト（\\rowspan / カテゴリ集約）',
    category: '拡張レイアウト',
    description: 'セルに \\rowspan と記述することで直前の有効なセルと縦方向に結合し、大分類やグループをすっきりまとめる実用的レイアウト。',
    code: 'style: blue\n| 大分類 | 中分類 | 項目内容 |\n| :--- | :--- | :--- |\n| フロントエンド | UI設計 | コンポーネント設計 |\n| \\rowspan | 実装 | TypeScript / Vue / React |\n| バックエンド | API | REST / GraphQL 設計 |\n| \\rowspan | DB | PostgreSQL / Redis |',
    tags: ['rowspan', 'セル結合', '結合', 'カテゴリ', 'グループ', 'レイアウト']
  },
  {
    id: 'table-layout-math',
    name: '数式・単位混在レイアウト（$式$・KaTeXインライン）',
    category: '拡張レイアウト',
    description: 'セル内に $x^2 + y^2$ や \\frac{1}{2}mv^2 などのLaTeX数式を埋め込み、科学技術計算の測定結果を美麗に表現するレイアウト。',
    code: 'style: academic\n| 物理量 | 記号 | 代表値・計算式 | 単位 |\n| :--- | :---: | :--- | :---: |\n| 運動エネルギー | $K$ | $\\frac{1}{2} m v^2$ | $\\text{J}$ |\n| 角周波数 | $\\omega$ | $2 \\pi f = \\sqrt{k/m}$ | $\\text{rad/s}$ |\n| 標準偏差 | $\\sigma$ | $\\sqrt{\\frac{1}{N} \\sum (x_i - \\mu)^2}$ | $-$ |',
    tags: ['数式', 'KaTeX', '単位', '分数', 'ギリシャ文字', 'インライン', 'レイアウト']
  },
  {
    id: 'table-latex-caption-ref',
    name: 'LaTeX 相互参照・本文一体レイアウト（\\caption・\\ref・二重罫線）',
    category: '拡張レイアウト',
    description: '\\caption（自動採番）、\\label と \\ref による文中相互参照、二重縦横罫線（||, \\hline \\hline）を前後の本文段落と一体描画する総合レイアウト。',
    code: '表\\ref{tab:menu} によると，大盛の値段は並盛の値段の倍である．\nこのことから並盛を2つ注文したほうがコストパフォーマンスはよいといえる．\n\n\\begin{table}[htb]\n  \\begin{center}\n    \\caption{価格・カロリー比較表}\n    \\label{tab:menu}\n    \\begin{tabular}{|l|c|r||r|}\n      \\hline\n      メニュー & サイズ & 値段 & カロリー \\\\\n      \\hline \\hline\n      牛丼 & 並盛 & 500円 & 600 kcal \\\\\n      牛丼 & 大盛 & 1,000円 & 800 kcal \\\\\n      牛丼 & 特盛 & 1,500円 & 1,000 kcal \\\\\n      \\hline\n    \\end{tabular}\n  \\end{center}\n\\end{table}\n\n※ カロリー表示は標準的な調理工程による推定値です。',
    tags: ['LaTeX', 'caption', 'label', 'ref', '相互参照', '二重罫線', 'table', '解説文', '構文']
  },
  {
    id: 'table-latex-booktabs',
    name: '学術論文 booktabs 罫線（\\toprule・\\midrule・\\cmidrule）',
    category: '拡張レイアウト',
    description: '学術論文標準の booktabs 罫線（\\toprule, \\midrule, \\bottomrule）と部分横罫線 \\cmidrule(lr)、水平結合 \\multicolumn を用いた上品で整然とした比較表。',
    code: '\\begin{table}[htbp]\n  \\centering\n  \\caption{機械学習モデルの性能評価比較}\n  \\label{tab:results}\n  \\begin{tabular}{lcccc}\n    \\toprule\n    \\multirow{2}{*}{モデル名} & \\multicolumn{2}{c}{検証データセット A} & \\multicolumn{2}{c}{実運用データセット B} \\\\\n    \\cmidrule(lr){2-3} \\cmidrule(lr){4-5}\n     & 正解率 (Accuracy) & F1スコア & 正解率 (Accuracy) & F1スコア \\\\\n    \\midrule\n    ベースライン & 82.4\\% & 0.81 & 78.1\\% & 0.76 \\\\\n    提案手法 (通常) & 91.5\\% & 0.90 & 88.3\\% & 0.87 \\\\\n    提案手法 (アンサンブル) & 95.2\\% & 0.94 & 93.6\\% & 0.92 \\\\\n    \\bottomrule\n  \\end{tabular}\n\\end{table}',
    tags: ['booktabs', 'toprule', 'midrule', 'bottomrule', 'cmidrule', '学術', '論文', 'LaTeX']
  },
  {
    id: 'table-latex-merged-matrix',
    name: '縦横セル結合＆部分罫線（\\multicolumn・\\multirow・\\cline）',
    category: '拡張レイアウト',
    description: '複数列結合（\\multicolumn）、縦結合（\\multirow）、特定列のみの下線（\\cline）を組み合わせ、大分類・中分類を体系的に整理した実務計画マトリクス。',
    code: '\\begin{tabular}{|c|c|l|r|}\n  \\hline\n  \\multicolumn{2}{|c|}{区分・分類} & \\multicolumn{1}{c|}{タスク概要} & \\multicolumn{1}{c|}{工数 (人日)} \\\\\n  \\hline \\hline\n  \\multirow{2}{*}{設計} & 基本設計 & 要件定義書・画面遷移の策定 & 12 \\\\\n  \\cline{2-4}\n   & 詳細設計 & DBスキーマ・API仕様書の確定 & 18 \\\\\n  \\hline\n  \\multirow{2}{*}{開発} & フロント & コンポーネント実装 & 25 \\\\\n  \\cline{2-4}\n   & バックエンド & 決済・認証API基盤構築 & 30 \\\\\n  \\hline\n  \\multicolumn{3}{|r|}{合計工数} & 85 \\\\\n  \\hline\n\\end{tabular}',
    tags: ['multicolumn', 'multirow', 'cline', 'セル結合', 'マトリクス', '工数', 'LaTeX']
  },
  {
    id: 'table-latex-styling-makecell',
    name: '配色・幅指定・セル内改行（\\rowcolor・\\cellcolor・p{幅}・\\makecell）',
    category: '拡張レイアウト',
    description: '\\rowcolor / \\cellcolor による重要度カラーハイライト、p{幅} 列による長文の自動折り返し、\\makecell によるセル内強制改行、\\arraystretch による行間調整。',
    code: '\\renewcommand{\\arraystretch}{1.3}\n\\begin{tabular}{|l|c|p{5.5cm}|}\n  \\hline\n  \\rowcolor{lightgray}\n  ステータス & \\makecell{優先度 \\\\ (Level)} & 対応方針・詳細説明 \\\\\n  \\hline \\hline\n  対応完了 & 低 & 軽微な表示スタイルの微調整。次回リリースで反映。 \\\\\n  \\hline\n  \\rowcolor{blue!20}\n  進行中 & 高 & \\makecell{主要APIのレスポンス遅延改善。\\\\キャッシュ層を再構築中。} \\\\\n  \\hline\n  \\cellcolor{red!20} 未着手 & \\cellcolor{red!20} 緊急 & セキュリティパッチの緊急適用。本日の夜間メンテナンスで即座に実行する。 \\\\\n  \\hline\n\\end{tabular}',
    tags: ['rowcolor', 'cellcolor', 'makecell', 'arraystretch', '配色', '幅指定', '改行', 'LaTeX']
  }
];

// ==========================================
// 2軸マップ・マトリクス図 ライブラリ データ
// ==========================================
const matrixLibrary = [
  // --- レイアウト ---
  {
    id: 'matrix-market-positioning',
    name: '形式1: 標準4象限ポジショニングマップ（価格帯 vs 品質・独自性）',
    category: 'レイアウト',
    description: '競合製品と自社製品の立ち位置を価格帯と品質・独自性の2軸で可視化し、差別化要因やブルーオーシャンを特定する基本マップ。',
    code: '\\matrixmap{\n  title: 市場ポジショニングマップ（価格帯 vs 品質・独自性）;\n  axis-x: 価格帯 (低価格 -> 高価格);\n  axis-y: 品質・独自性 (大衆的・コモディティ -> 高品質・独自);\n  quadrant: [右上] プレミアム・高付加価値, [左上] コスパ最強・破壊的価値, [右下] ハイエンド専門, [左下] エントリー・大衆向け;\n  item: 自社新製品 (-0.4, 0.75) [accent];\n  item: 競合A社 (0.8, 0.85) [primary];\n  item: 競合B社 (-0.7, -0.5) [muted];\n  item: 競合C社 (0.6, -0.2) [warning];\n}',
    tags: ['ポジショニング', 'マーケティング', '価格', '品質', '競合分析', 'レイアウト']
  },
  {
    id: 'matrix-bubble-positioning',
    name: '形式2: バブル型ポジショニングマップ（評価 vs 実用性・企業シェア）',
    category: 'レイアウト',
    description: '横軸に嗜好性・実用性、縦軸に評価を配し、各社シェアや売上規模を円サイズ・円内ラベルで表現するバブルマトリクス。',
    code: '\\matrixmap{\n  type: bubble;\n  axis-x: 実用性 (嗜好性 -> 実用性);\n  axis-y: 評価 (低評価 -> 高評価);\n  item: A社 (-0.6, 0.7) [bubble, r: 34, #e05656];\n  item: 自社 (0.6, 0.4) [bubble, r: 30, #408ec2];\n  item: B社 (-0.4, -0.6) [bubble, r: 25, #8cb852];\n  item: C社 (-0.1, -0.3) [bubble, r: 23, #f3ba4b];\n}',
    tags: ['バブルチャート', 'ポジショニング', 'シェア', '企業比較', 'レイアウト', '実用性']
  },
  {
    id: 'matrix-heatmap-5x5',
    name: '形式3: 5×5 リスク評価ヒートマップマトリクス（発生確率 vs 影響度）',
    category: 'レイアウト',
    description: '縦軸5段階の発生確率（稀〜極高）と横軸5段階の影響度（極小〜致命的）、および軸説明文付きのリスクカラーグリッドと付箋配置。',
    code: '\\matrixmap{\n  type: heatmap;\n  axis-x: 影響度 (極小, 軽微, 中等度, 重大, 致命的) [desc: 業務影響・損失規模];\n  axis-y: 発生確率 (稀, 低, 中, 高, 極高) [desc: 年間発生頻度];\n  item: "重大インシデント" (3.8, 3.8) [user: 茂, coral];\n  item: "決済連携遅延" (0.5, 0.8) [user: 文雄, yellow];\n  item: "認証トークン期限切れ" (1.8, 1.2) [user: 早苗, coral];\n  item: "DB負荷スパイク" (3.6, 0.6) [user: 太郎, yellow];\n  item: "定期バッチ遅延" (2.2, 2.5) [user: 晋三, yellow];\n  item: "UI表示崩れ" (1.2, 3.3) [user: 純一郎, coral];\n}',
    tags: ['ヒートマップ', 'リスクマトリクス', '5x5', '付箋', '課題管理', 'レイアウト']
  },
  {
    id: 'matrix-schedule-table',
    name: '形式4: 日程調整・出欠マトリクス表（特定日グリーンハイライト）',
    category: 'レイアウト',
    description: '参加者ごとの◯✕△出欠状況を一覧化し、確定候補日（6月3日）をエメラルドグリーンで鮮やかに強調するマトリクス表。',
    code: '\\matrix{\n  type: schedule;\n  header: "", "5月31日", "6月2日", "6月3日" [highlight], "6月5日";\n  row: "TUさん", △, ✕, ◯, △;\n  row: "ITさん", ✕, ◯, ◯, ✕;\n  row: "TAさん", △, ✕, ◯, △;\n  row: "KOさん", ✕, ◯, ◯, ✕;\n}',
    tags: ['日程調整', '出欠', 'スケジュール', 'マトリクス表', 'ハイライト', 'レイアウト']
  },

  // --- 構文形式 ---
  {
    id: 'matrix-latex-tikz',
    name: '形式5: LaTeX TikZ 4象限マトリクス構文（\\begin{tikzpicture}）',
    category: '構文形式',
    description: 'LaTeXのTikZパッケージによる学術・文書標準の4象限ポジショニングマップ構文（両端矢印・円ノード配置）。',
    code: '% title: 4象限ポジショニングマップ (TikZ)\n\\begin{tikzpicture}\n  \\draw[<->, thick] (-3,0) -- (3,0) node[right] {実用性};\n  \\node[left] at (-3,0) {嗜好性};\n  \\draw[<->, thick] (0,-3) -- (0,3) node[above] {高評価};\n  \\node[below] at (0,-3) {低評価};\n  \\node[circle, fill=red!60, text=white] at (-1.8, 2.1) {A社};\n  \\node[circle, fill=blue!60, text=white] at (1.8, 1.2) {自社};\n  \\node[circle, fill=green!60, text=white] at (-1.2, -1.8) {B社};\n  \\node[circle, fill=orange!60, text=white] at (-0.3, -0.9) {C社};\n\\end{tikzpicture}',
    tags: ['TikZ', 'LaTeX', '4象限', 'ポジショニング', '構文形式', '構文']
  }
];

// ==========================================
// ピラミッド図・階層図 ライブラリ データ
// ==========================================
const pyramidLibrary = [
  // --- レイアウト ---
  {
    id: 'pyramid-maslow',
    name: '形式1: 標準ピラミッド階層図（マズローの欲求5段階説・引き出し線）',
    category: 'レイアウト',
    description: '低次から高次への欲求階層をピラミッド段と右側引き出し線（ドット・アノテーション）で美しく整理する基本形式。',
    code: '\\pyramid{\n  title: マズローの欲求5段階説 (Maslow\'s Hierarchy of Needs);\n  layer: 自己実現の欲求 [gold] (自己の可能性の最大発揮・創造性);\n  layer: 承認・尊重の欲求 [warning] (他者からの評価・名誉・自己肯定感);\n  layer: 社会的欲求・愛 [primary] (集団への帰属・友情・愛情関係);\n  layer: 安全の欲求 [cyan] (身の安全・雇用や生活の安定・健康);\n  layer: 生理的欲求 [emerald] (食欲・睡眠・呼吸・生命維持の根本);\n}',
    tags: ['マズロー', '欲求5段階', '自己実現', 'ピラミッド', '階層', 'レイアウト']
  },
  {
    id: 'pyramid-block-wing',
    name: '形式2: ブロックウィング型ピラミッド（資格・スキル等級・右側詳細ブロック）',
    category: 'レイアウト',
    description: '左側のピラミッド段内に等級ラベル（1級〜4級）を太字白文字で表示し、右側に接続された詳細ブロック内に箇条書き要件を整理する形式。',
    code: '\\pyramid{\n  type: wing;\n  layer: 1級 [#2f6bbd] (・プロ向け\\n・内容の十分な理解・技能);\n  layer: 2級 [#427ecc] (・実務向け\\n・内容の基本的な理解・技能);\n  layer: 3級 [#6399dc] (・初心者向け\\n・内容の基本的な理解);\n  layer: 4級 [#8bb6ea] (・筆記試験のみ);\n}',
    tags: ['等級', '検定', '資格', 'スキルマップ', 'ウィング', 'ブロック', 'レイアウト']
  },

  // --- 構文形式 ---
  {
    id: 'pyramid-smartdiagram-latex',
    name: '形式3: LaTeX smartdiagram 階層ピラミッド構文（アメリカスクールカースト）',
    category: '構文形式',
    description: 'LaTeXのsmartdiagramパッケージ構文（\\smartdiagram[priority descriptive diagram]{...}）で描くアメリカのスクールカースト階層。',
    code: '% title: アメリカのスクールカースト階層図 (smartdiagram)\n\\smartdiagram[priority descriptive diagram]{\n  ジョックス＆クイーンビー/アメフト主将・チア等の学園ヒエラルキートップ,\n  サイドキックス＆プレップス/花形生徒の取り巻き・お洒落な人気者グループ,\n  レギュラー（一般生徒）/目立たず平穏に過ごすマジョリティ中間層,\n  ナード＆ギーク/勉強熱心・ITやサブカルチャーに没頭するオタク層,\n  アウトキャスト/集団に属さない孤立者・はみ出し者グループ\n}',
    tags: ['スクールカースト', 'smartdiagram', 'LaTeX', 'ピラミッド', '階層', '構文形式', '構文']
  }
];

// ==========================================
// レーダーチャート ライブラリ プリセットデータ
// ==========================================
const radarLibrary = [
  // --- レイアウト ---
  {
    id: 'radar-financial-5axes',
    name: '形式1: 財務5大指標による同業他社比較（多角形グリッド標準）',
    category: 'レイアウト',
    description: '「収益性・成長性・安全性・割安性・株主還元」の5軸で同業2社の企業特性・キャラクターの違いを多面的に可視化。',
    code: '\\radar{\n  title: 企業財務5大指標 比較評価;\n  max: 100;\n  grid: 5;\n  axis: 収益性(ROE), 成長性(売上増), 安全性(自己資本), 割安性(PER/PBR), 株主還元(配当);\n  series: A社 (高成長型) (85, 75, 90, 40, 70) [accent];\n  series: B社 (高配当・堅実型) (50, 45, 95, 80, 85) [primary];\n}',
    tags: ['財務分析', 'レーダーチャート', 'ROE', '株主還元', '同業比較', '株式投資', 'レイアウト']
  },
  {
    id: 'radar-character-status',
    name: '形式2: 能力値・ステータス六角形レーダー（ゲーム・パラメータ）',
    category: 'レイアウト',
    description: '攻撃・防御・素早さ・魔力・スタミナ・器用さの6大ステータスを六角形レーダーチャートで表現。',
    code: '\\radar{\n  title: キャラクター能力値パラメータ;\n  max: 100;\n  grid: 5;\n  axis: 攻撃力(STR), 防御力(DEF), 素早さ(AGI), 知力(INT), 体力(VIT), 器用さ(DEX);\n  series: 戦士タイプ (90, 85, 60, 30, 85, 55) [danger];\n  series: 魔法使いタイプ (35, 40, 70, 95, 50, 80) [purple];\n}',
    tags: ['ステータス', '能力値', 'ゲーム', '六角形', 'パラメータ', 'レイアウト']
  },
  {
    id: 'radar-age-preference',
    name: '形式3: 年代別 飲酒嗜好 6軸レーダー（パーセント目盛り＆右上枠付凡例）',
    category: 'レイアウト',
    description: '20代〜70代の年代別嗜好（焼酎 vs ハイボールなど）を%目盛り・右上枠付き凡例ボックスで比較する6軸レーダー。',
    code: '\\radar{\n  max: 50;\n  grid: 5;\n  unit: %;\n  legend: top-right;\n  axis: 20代, 30代, 40代, 50代, 60代, 70代;\n  series: 焼酎 (18, 14, 25, 48, 45, 40) [coral];\n  series: ハイボールなど (42, 38, 28, 46, 22, 12) [sky];\n}',
    tags: ['年代別', '飲酒傾向', '6軸', 'パーセント', '枠付凡例', 'レイアウト']
  },
  {
    id: 'radar-circle-annual-test',
    name: '形式4: 分野ごとのテスト評価（同心円グリッド＆左上凡例）',
    category: 'レイアウト',
    description: '5分野のテスト結果（1年〜4年の年次推移）を滑らかな同心円グリッドと左上チェックボックス風凡例で可視化。',
    code: '\\radar{\n  title: 分野ごとのテスト;\n  shape: circle;\n  max: 100;\n  grid: 5;\n  legend: top-left;\n  axis: コミュニケーション力, リーダーシップ力, キャリアデザイン力, 課題解決力, 一般教養・倫理;\n  series: 1年 (60, 68, 88, 38, 72) [sky];\n  series: 2年 (40, 78, 62, 42, 80) [orange];\n  series: 3年 (92, 82, 48, 32, 36) [green];\n  series: 4年 (62, 48, 38, 86, 82) [red];\n}',
    tags: ['同心円', '円形グリッド', 'テスト評価', '年次比較', '能力測定', 'レイアウト']
  },
  {
    id: 'radar-academic-subjects',
    name: '形式5: 5教科成績・学力比較（折れ線強調・右側凡例）',
    category: 'レイアウト',
    description: '国語・数学・英語・理科・社会の5教科成績を、塗りなし折れ線強調と右側ライン型凡例で個人点vs平均点をクリアに比較。',
    code: '\\radar{\n  max: 100;\n  grid: 5;\n  legend: right;\n  axis: 国語, 数学, 英語, 理科, 社会;\n  series: Aさん (85, 62, 92, 48, 78) [blue, nofill];\n  series: 平均点 (72, 60, 52, 76, 70) [red, nofill];\n}',
    tags: ['成績', '学力', '5教科', '折れ線', '平均比較', 'レイアウト']
  },
  {
    id: 'radar-ux-evaluation',
    name: '形式6: Webプロダクト UX多面評価（5軸UX分析）',
    category: 'レイアウト',
    description: '有用性・使いやすさ・魅力度・信頼性・アクセシビリティの5軸でUI/UXの強みと課題を評価。',
    code: '\\radar{\n  title: Webプロダクト UX多面評価;\n  max: 10;\n  grid: 5;\n  axis: 有用性(Value), 操作性(Usability), 魅力(Desirable), 信頼(Credible), アクセシビリティ(Access);\n  series: 新リニューアル版 (9, 8.5, 9, 8, 7.5) [success];\n  series: 旧バージョン (6, 5, 4, 7, 5) [muted];\n}',
    tags: ['UX', 'プロダクト', 'UI', 'ユーザビリティ', '評価', 'レイアウト']
  },

  // --- 構文形式 ---
  {
    id: 'radar-tkz-kiviat-style',
    name: '形式7: LaTeX tkz-kiviat標準構文（\\tkzKiviatDiagram）',
    category: '構文形式',
    description: 'LaTeXのtkz-kiviatパッケージ標準形式（\\tkzKiviatDiagram / \\tkzKiviatLine）で記述されたレーダーチャート。',
    code: '\\begin{tikzpicture}\n  \\tkzKiviatDiagram{収益性, 成長性, 安全性, 割安性, 株主還元}\n  \\tkzKiviatLine[label=A社, color=blue](80, 70, 85, 45, 75)\n  \\tkzKiviatLine[label=B社, color=orange](55, 50, 95, 80, 85)\n\\end{tikzpicture}',
    tags: ['tkz-kiviat', 'LaTeX', 'Kiviat', 'TikZ', '構文形式']
  },
  {
    id: 'radar-latex-kiviat-grad',
    name: '形式8: LaTeX TikZ/tkz-kiviat目盛り指定構文（\\tkzKiviatGrad 拡張）',
    category: '構文形式',
    description: '格子の段階数・ステップ目盛り（\\tkzKiviatGrad[unity=20]）を指定したLaTeXの本格レーダーチャート構文。',
    code: '\\begin{tikzpicture}\n  \\tkzKiviatDiagram[radial=5, gap=1]{国語, 数学, 英語, 理科, 社会}\n  \\tkzKiviatGrad[unity=20, unit=%](0)\n  \\tkzKiviatLine[label=Aさん, color=blue](85, 62, 92, 50, 78)\n  \\tkzKiviatLine[label=平均点, color=red](70, 60, 52, 75, 70)\n\\end{tikzpicture}',
    tags: ['tkz-kiviat', 'LaTeX', 'TikZ', '目盛り', '学力', '構文形式']
  }
];

// ==========================================
// ウォーターフォール図 ライブラリ プリセットデータ
// ==========================================
const waterfallLibrary = [
  // --- レイアウト ---
  {
    id: 'waterfall-operating-profit',
    name: '形式1: 営業利益 前期比 増減要因分析（標準ステップ型）',
    category: 'レイアウト',
    description: '前期営業利益から当期営業利益に至るプラス要因（為替、販売数量）とマイナス要因（原材料高、販管費）のステップ分析。',
    code: '\\waterfall{\n  title: 営業利益 前期比 増減要因分析;\n  unit: 億円;\n  bar: 前期営業利益 (120) [total];\n  bar: 為替影響 (+24) [increase];\n  bar: 販売数量増 (+18) [increase];\n  bar: 原材料高騰 (-22) [decrease];\n  bar: 販管費・人件費増 (-15) [decrease];\n  bar: 当期営業利益 [total];\n}',
    tags: ['営業利益', '増減要因', '決算', '財務分析', '為替', '原材料', 'レイアウト']
  },
  {
    id: 'waterfall-store-sales-bridge',
    name: '形式2: 店頭・オンライン売上から営業利益（密着ブロック型・内包ラベル）',
    category: 'レイアウト',
    description: '店頭売上とオンライン売上の積み上げから原価・経費を差し引く営業利益算出を、隙間ゼロのブロック連結とバー内ラベルで表現。',
    code: '\\waterfall{\n  style: block;\n  bar: 店頭売上 (200) [increase];\n  bar: オンライン売上 (500) [increase];\n  bar: 原価 (-200) [decrease];\n  bar: 経費 (-150) [decrease];\n  bar: 営業利益 (350) [total];\n}',
    tags: ['売上利益', 'ブロック型', '密着ブリッジ', '内包ラベル', '店舗売上', '営業利益', 'レイアウト']
  },

  // --- 構文形式 ---
  {
    id: 'waterfall-latex-pgfplots',
    name: '形式3: LaTeX pgfplots標準ウォーターフォール構文（\\begin{axis}[ybar stacked]）',
    category: '構文形式',
    description: 'LaTeXのpgfplotsパッケージ標準の積層棒構文（ybar stacked）で記述された増減要因ウォーターフォール。',
    code: '\\begin{tikzpicture}\n  \\begin{axis}[\n    ybar stacked,\n    title={営業利益 前期比 増減要因分析},\n    symbolic x coords={前期営業利益, 為替影響, 数量増, 原価高騰, 販管費増, 当期営業利益},\n    xtick=data,\n    ymin=0, ymax=160\n  ]\n  \\addplot[ybar, fill=cyan!70] coordinates {(前期営業利益,120) (当期営業利益,105)};\n  \\addplot[ybar, fill=emerald!70] coordinates {(為替影響,24) (数量増,18)};\n  \\addplot[ybar, fill=rose!70] coordinates {(原価高騰,-22) (販管費増,-15)};\n  \\end{axis}\n\\end{tikzpicture}',
    tags: ['pgfplots', 'LaTeX', 'ybar stacked', 'TikZ', '構文形式']
  },
  {
    id: 'waterfall-latex-tikz-draw',
    name: '形式4: LaTeX TikZネイティブ ウォーターフォール構文（\\draw rectangle）',
    category: '構文形式',
    description: 'TikZのパス矩形（\\draw rectangle）とノードラベルでダイレクトに増減ブロックを連結配置する構文。',
    code: '\\begin{tikzpicture}\n  % waterfall\n  \\draw[fill=blue!70] (0,0) rectangle (1.2,120) node[midway, white] {前期 120};\n  \\draw[fill=green!70] (1.3,120) rectangle (2.5,144) node[midway, white] {為替 +24};\n  \\draw[fill=green!70] (2.6,144) rectangle (3.8,162) node[midway, white] {数量 +18};\n  \\draw[fill=red!70] (3.9,140) rectangle (5.1,162) node[midway, white] {原価 -22};\n  \\draw[fill=red!70] (5.2,125) rectangle (6.4,140) node[midway, white] {販管 -15};\n  \\draw[fill=blue!70] (6.5,0) rectangle (7.7,105) node[midway, white] {当期 105};\n\\end{tikzpicture}',
    tags: ['TikZ', 'LaTeX', 'rectangle', '直接描画', '構文形式']
  }
];

// ==========================================
// ツリーマップ ライブラリ プリセットデータ
// ==========================================
const treemapLibrary = [
  {
    id: 'treemap-segment-revenue',
    name: '形式1: 事業セグメント別 売上構成ツリーマップ（カテゴリ配色 / ヒートマップ対応）',
    category: 'レイアウト',
    description: '各事業部門の売上規模比率と前年同期比の成長率を可視化。mode: change; を有効化すると騰落率カラー連動のヒートマップに切り替わります。',
    code: '\\treemap{\n  title: 事業セグメント別 売上構成比;\n  unit: 億円;\n  % mode: change; % 騰落率ヒートマップにする場合は有効化\n  "クラウドソリューション", 480, "+24.5%";\n  "エンタープライズIT", 320, "+8.2%";\n  "AI・データ解析", 190, "+45.0%";\n  "ハードウェア・機器保守", 110, "-10.5%";\n  "セキュリティ基盤", 85, "+18.0%";\n}',
    tags: ['セグメント', '売上高', '構成比', '事業部門', '成長率', 'ヒートマップ', 'レイアウト']
  },
  {
    id: 'treemap-japan-prefectures',
    name: '形式2: 日本地域・都道府県別 面積構成（階層グループ型ツリーマップ）',
    category: 'レイアウト',
    description: '地方ブロック（大区分）と都道府県（小区分）の2層階層を色分けとグループ境界線で整理した階層型ツリーマップ。',
    code: '\\treemap{\n  title: 日本地域・都道府県別 面積構成;\n  unit: km²;\n\n  group: "北海道" [#2563eb] {\n    "北海道", 83424;\n  }\n  group: "東北" [#f97316] {\n    "岩手県", 15275;\n    "福島県", 13783;\n    "秋田県", 11637;\n    "青森県", 9645;\n    "山形県", 9323;\n    "宮城県", 7282;\n  }\n  group: "中部" [#eab308] {\n    "長野県", 13561;\n    "新潟県", 12584;\n    "岐阜県", 10621;\n    "静岡県", 7777;\n    "愛知県", 5172;\n    "山梨県", 4465;\n    "富山県", 4247;\n    "福井県", 4190;\n    "石川県", 4186;\n  }\n  group: "関東" [#64748b] {\n    "栃木県", 6408;\n    "群馬県", 6362;\n    "茨城県", 6097;\n    "千葉県", 5157;\n    "埼玉県", 3797;\n    "神奈川県", 2416;\n    "東京都", 2194;\n  }\n  group: "近畿" [#06b6d4] {\n    "兵庫県", 8400;\n    "三重県", 5774;\n    "和歌山県", 4724;\n    "京都府", 4612;\n    "滋賀県", 4017;\n    "奈良県", 3691;\n    "大阪府", 1905;\n  }\n  group: "中国" [#10b981] {\n    "広島県", 8479;\n    "岡山県", 7114;\n    "島根県", 6708;\n    "山口県", 6112;\n    "鳥取県", 3507;\n  }\n  group: "四国" [#3b82f6] {\n    "高知県", 7103;\n    "愛媛県", 5676;\n    "徳島県", 4146;\n    "香川県", 1877;\n  }\n  group: "九州・沖縄" [#84cc16] {\n    "鹿児島県", 9187;\n    "宮崎県", 7735;\n    "熊本県", 7409;\n    "大分県", 6340;\n    "福岡県", 4986;\n    "長崎県", 4132;\n    "佐賀県", 2440;\n    "沖縄県", 2281;\n  }\n}',
    tags: ['階層グループ', '日本地図', '面積', '都道府県', '地域別', 'レイアウト']
  },
  {
    id: 'treemap-latex-tikz',
    name: '形式3: LaTeX TikZネイティブ ツリーマップ構文（\\draw rectangle）',
    category: '構文形式',
    description: 'TikZのパス矩形（\\draw rectangle）とノードラベルでダイレクトに領域分割・配置するネイティブ構文。',
    code: '\\begin{tikzpicture}\n  % treemap\n  \\draw[fill=blue!60] (0,0) rectangle (6,10) node[midway, white] {クラウド 480};\n  \\draw[fill=teal!60] (6,4) rectangle (10,10) node[midway, white] {エンタープライズ 320};\n  \\draw[fill=orange!60] (6,0) rectangle (10,4) node[midway, white] {AI解析 190};\n  \\draw[fill=purple!60] (0,10) rectangle (5,12) node[midway, white] {保守 110};\n  \\draw[fill=pink!60] (5,10) rectangle (10,12) node[midway, white] {セキュリティ 85};\n\\end{tikzpicture}',
    tags: ['TikZ', 'LaTeX', 'rectangle', '直接描画', '構文形式']
  },
  {
    id: 'treemap-macro-standard',
    name: '形式4: LaTeX 独自マクロ標準構文（\\treemap）',
    category: '構文形式',
    description: '項目名、数値、成長率/割合をセミコロン区切りで指定するPhysiNote標準の\\treemapマクロ構文。',
    code: '\\treemap{\n  title: 標準ツリーマップ構文;\n  unit: 百万円;\n  "研究開発 (R&D)", 450, "+12%";\n  "販売促進・広告", 280, "-5%";\n  "人件・組織運営", 320, "+8%";\n  "設備投資", 150, "0%";\n}',
    tags: ['マクロ', '独自構文', 'treemap', '標準', '構文形式']
  }
];

// ==========================================
// ガントチャート・ロードマップ ライブラリ プリセットデータ
// ==========================================
const ganttLibrary = [
  {
    id: 'gantt-swimlane-grid',
    name: '形式1: テーマ別スイムレーン型ガントチャート（部門横断グリッド）',
    category: 'レイアウト',
    description: '横軸に年度・四半期の期間グリッド、縦軸にテーマ/部門レーンを設け、複数チームの進行を並行管理するスイムレーン形式。',
    code: '\\roadmap{\n  type: swimlane;\n  title: "全社テーマ別 中長期開発ロードマップ";\n  subtitle: "部門横断プロジェクト・タイムライングリッド";\n  periods: "2024", "2025", "2026", "2027", "2028";\n\n  lane "テーマ 1 (プロダクト)" [#10b981]:\n    "コア機能開発" [2024 -> 2024],\n    "AI推論エンジン刷新" [2024 -> 2025],\n    "マルチプラットフォーム対応" [2025 -> 2026],\n    "グローバルAPI展開" [2026 -> 2027];\n\n  lane "テーマ 2 (マーケ)" [#6366f1]:\n    "ブランド再構築" [2024 -> 2024],\n    "Webカンファレンス開催" [2025 -> 2025],\n    "大規模デジタル広告" [2025 -> 2026],\n    "海外プロモーション" [2027 -> 2028];\n\n  lane "テーマ 3 (営業)" [#f59e0b]:\n    "直販体制立ち上げ" [2024 -> 2025],\n    "販売代理店網の構築" [2024 -> 2025],\n    "大手エンタープライズ開拓" [2025 -> 2027],\n    "海外現地パートナー提携" [2027 -> 2028];\n\n  lane "テーマ 4 (組織・採用)" [#ef4444]:\n    "エンジニア採用強化" [2024 -> 2025],\n    "海外支社設立" [2026 -> 2027],\n    "グローバル人事制度構築" [2026 -> 2028];\n}',
    tags: ['ガントチャート', 'スイムレーン', 'グリッド', 'テーマ別', '工程', '進捗', 'レイアウト']
  },
  {
    id: 'gantt-standard-project',
    name: '形式2: 標準ガントチャート（セクション・タスク進捗・マイルストーン）',
    category: 'レイアウト',
    description: 'セクションごとのタスク進捗バー（%・完了・進行中）、期間、および期日マイルストーンを一覧表示する標準工程管理レイアウト。',
    code: '\\gantt{\n  title: クラウドサービス リリーススケジュール;\n  today: 2024-07;\n  section: 設計・プロトタイプ;\n  task: 要件定義 & UI/UX設計, 2024-04, 2024-05, [完了], #10b981;\n  task: プロトタイプ開発 & 内部検証, 2024-05, 2024-06, [完了], #10b981;\n  section: 開発・テストフェーズ;\n  task: コアAPI & フロントエンド実装, 2024-06, 2024-08, [80%], #3b82f6;\n  milestone: クローズドβ版提供開始, 2024-08, #f59e0b;\n  task: 負荷テスト & 外部セキュリティ監査, 2024-08, 2024-09, [予定], #64748b;\n  milestone: 正式商用版ローンチ, 2024-10, #ec4899;\n}',
    tags: ['ガントチャート', 'プロジェクト管理', 'タスク', 'マイルストーン', '工程', '進捗', 'レイアウト']
  },
  {
    id: 'gantt-pgfgantt-latex',
    name: '形式3: LaTeX pgfgantt パッケージ標準形式（工程・マイルストーン）',
    category: '構文形式',
    description: 'LaTeXのpgfganttパッケージ構文（\\begin{ganttchart}、\\ganttbar、\\ganttmilestone）による開発計画ガントチャート。',
    code: '\\begin{ganttchart}[\n  today=7\n]{1}{12}\n  % title: 次世代プロダクト開発工程 (pgfgantt)\n  \\gantttitle{2026年 開発スケジュール}{12} \\\\\n  \\ganttgroup{フェーズ1: 企画・基盤設計}{1}{4} \\\\\n  \\ganttbar{要件定義 & UI/UX設計}{1}{3} \\\\\n  \\ganttmilestone{設計承認}{4} \\\\\n  \\ganttgroup{フェーズ2: 実装・検証}{4}{10} \\\\\n  \\ganttbar{コア機能開発}{4}{7} \\\\\n  \\ganttbar{結合テスト & 負荷検証}{7}{9} \\\\\n  \\ganttmilestone{クローズドβ版提供}{9} \\\\\n  \\ganttbar{本番環境デプロイ}{10}{11} \\\\\n  \\ganttmilestone{正式商用ローンチ}{12}\n\\end{ganttchart}',
    tags: ['pgfgantt', 'LaTeX', 'ガントチャート', 'マイルストーン', '工程', 'TikZ', '構文形式', '構文']
  }
];

// ==========================================
// 資本構成ツリー図（持株比率・グループ会社）ライブラリ プリセットデータ
// ==========================================
const capitalTreeLibrary = [
  // --- レイアウト ---
  {
    id: 'capitaltree-toyota-group',
    name: '形式1: 標準階層ツリー型（トヨタグループ 主要資本構成・持株ネットワーク）',
    category: 'レイアウト',
    description: 'トヨタ自動車を中核とする完全子会社、連結子会社、および持分法適用会社（デンソー、豊田自動織機等）の標準的な資本関係階層ツリー。',
    code: '\\capitaltree{\n  title: トヨタグループ 主要資本構成;\n  "トヨタ自動車" -> "トヨタ車体" [100%, 完全子会社];\n  "トヨタ自動車" -> "ダイハツ工業" [100%, 完全子会社];\n  "トヨタ自動車" -> "日野自動車" [50.1%, 連結子会社];\n  "トヨタ自動車" -> "デンソー" [24.2%, 持分法適用];\n  "トヨタ自動車" -> "豊田自動織機" [24.7%, 持分法適用];\n  "デンソー" -> "デンソーテン" [51.0%, 連結子会社];\n}',
    tags: ['トヨタ', '自動車', 'グループ会社', '子会社', '持分法', '資本構成', '階層ツリー', 'レイアウト']
  },
  {
    id: 'capitaltree-joint-venture',
    name: '形式2: 合弁・複数出資アライアンス型（合弁企業（JV）・戦略的提携アライアンス資本構成図）',
    category: 'レイアウト',
    description: '総合商社や通信キャリア、外部海外パートナーとの合弁会社（JV）の資本構成図。複数親会社からの出資や外部パートナー持分をスマートに表現。',
    code: '\\capitaltree{\n  title: グローバル合弁事業・アライアンス資本構成図;\n  "グローバル総合商社" -> "モビリティサービスJV" [51.0%, 連結子会社, "海外パートナー: 49.0%"];\n  "グローバル総合商社" -> "再エネ発電事業会社" [60.0%, 連結子会社, "自治体・地元ファンド: 40.0%"];\n  "グローバル総合商社" -> "サプライチェーンDX" [40.0%, 共同出資];\n  "通信メガキャリア" -> "サプライチェーンDX" [60.0%, 筆頭株主];\n  "グローバル総合商社" -> "ヘルスケアAI開発" [34.0%, 共同出資, "製薬大手: 51.0% / 創業者: 15.0%"];\n}',
    tags: ['合弁会社', 'JV', '資本構成', '共同出資', 'アライアンス', '持分法', 'ジョイントベンチャー', '提携', 'レイアウト']
  },
  {
    id: 'capitaltree-kasumigaseki-security',
    name: '形式3: 複数親会社・立体交差ジャンパー型（霞が関IT・サイバーセキュリティ擬似資本構成図）',
    category: 'レイアウト',
    description: '複数省庁（親会社）からの共同出資・多重共管関係、および配線の直角立体交差（ジャンパー線ブリッジ）を可視化した高度な資本構成ツリー。',
    code: '\\capitaltree{\n  title: 霞が関IT・サイバーセキュリティ擬似資本構成図;\n  "内閣府・内閣官房" -> "デジタル庁" [100%, 内閣府・内閣官房, "司令塔新設(調達権限のみ) / 実働部隊なし"];\n  "内閣府・内閣官房" -> "個人情報保護委員会(PPC)" [100%, 内閣府・内閣官房, "独立監視/元・経産省所管（出向者多数で影響大） / 定員237名"];\n  "内閣府・内閣官房" -> "NISC" [100%, 内閣府・内閣官房, "全省庁寄り合い出向所 / 調整専門で実働なし"];\n\n  "総務省" -> "NICT(情報通信研究機構)" [90.0%, 総務省, "通信基盤・電波利権(攻撃観測網)"];\n  "デジタル庁" -> "NICT(情報通信研究機構)" [10.0%, デジタル庁, "政策要請"];\n\n  "経済産業省" -> "IPA(情報処理推進機構)" [85.0%, 経済産業省, "産業IT本丸(啓発・試験運営・民間対策)"];\n  "デジタル庁" -> "IPA(情報処理推進機構)" [15.0%, デジタル庁, "基盤共管"];\n}',
    tags: ['霞が関', 'IT', 'サイバーセキュリティ', '複数親会社', 'ジャンパー線', '立体交差', '共管', '資本構成', 'レイアウト']
  },
  {
    id: 'capitaltree-nhk-group',
    name: '形式4: 多段折り返しグリッド型（NHK連結グループ 主要資本構成）',
    category: 'レイアウト',
    description: '日本放送協会（NHK）を頂点とし、本体直接出資会社および中間持株会社（NHKメディアHD）傘下7社へ階層的に展開する主要資本構成ツリー図。',
    code: '\\capitaltree{\n  title: NHK連結グループ 主要資本構成;\n\n  // 1. NHK本体からの直接出資・関係\n  "日本放送協会 (NHK)" -> "NHKメディアホールディングス" [100.0%, 連結子会社];\n  "日本放送協会 (NHK)" -> "NHKテクノロジーズ" [100.0%, 連結子会社];\n  "日本放送協会 (NHK)" -> "日本ブロードキャストネットワーク" [100.0%, 連結子会社];\n  "日本放送協会 (NHK)" -> "NHKビジネスクリエイト" [75.1%, 連結子会社];\n  "日本放送協会 (NHK)" -> "NHK文化センター" [100.0%, 連結子会社];\n  "日本放送協会 (NHK)" -> "NHK営業サービス" [99.0%, 連結子会社];\n  "日本放送協会 (NHK)" -> "NHK財団" [関連公益法人等];\n\n  // 2. NHKメディアホールディングス傘下の子会社（中間持株会社経由：7社）\n  "NHKメディアホールディングス" -> "NHKエンタープライズ" [100.0%, 連結子会社];\n  "NHKメディアホールディングス" -> "NHKエデュケーショナル" [100.0%, 連結子会社];\n  "NHKメディアホールディングス" -> "NHKグローバルメディアサービス" [100.0%, 連結子会社];\n  "NHKメディアホールディングス" -> "NHKプロモーション" [100.0%, 連結子会社];\n  "NHKメディアホールディングス" -> "NHKアート" [100.0%, 連結子会社];\n  "NHKメディアホールディングス" -> "NHK出版" [100.0%, 連結子会社];\n  "NHKメディアホールディングス" -> "日本国際放送" [64.1%, 連結子会社];\n}',
    tags: ['NHK', '放送', 'メディア', 'グループ会社', '子会社', '資本構成', '多段折り返し', 'グリッド', 'レイアウト']
  },
  {
    id: 'radialtree-ntt-group',
    name: '形式5: 放射状ポートフォリオ型（NTTグループ 主要資本・事業ポートフォリオ）',
    category: 'レイアウト',
    description: '持株会社（日本電信電話）を中心ハブとし、主要事業会社（ドコモ、東日本、西日本、データ、都市開発、ファシリティーズ）および子会社を同心円状・放射状に展開したポートフォリオ図。',
    code: '\\radialtree{\n  title: "NTTグループ 主要資本・事業ポートフォリオ";\n  center: "日本電信電話 (NTT)" [持株会社, #005bac];\n  "日本電信電話 (NTT)" -> "NTTドコモ" [100%, 総合ICT];\n  "日本電信電話 (NTT)" -> "NTT東日本" [100%, 地域通信];\n  "日本電信電話 (NTT)" -> "NTT西日本" [100%, 地域通信];\n  "日本電信電話 (NTT)" -> "NTTデータグループ" [58%, ITサービス];\n  "日本電信電話 (NTT)" -> "NTTアーバンソリューションズ" [100%, 不動産];\n  "日本電信電話 (NTT)" -> "NTTファシリティーズ" [100%, エネルギー];\n  "NTTドコモ" -> "NTTコミュニケーションズ" [100%, 法人ICT];\n  "NTTドコモ" -> "NTTコムウェア" [100%, システム開発];\n  "NTT東日本" -> "NTT東日本-南関東" [100%, 地域事業];\n  "NTT東日本" -> "NTT ME" [100%, 通信設備];\n  "NTT西日本" -> "NTT西日本-関西" [100%, 地域事業];\n  "NTT西日本" -> "NTTネオメイト" [100%, NW運用];\n  "NTTデータグループ" -> "NTTデータ" [100%, 国内IT];\n  "NTTデータグループ" -> "NTT DATA, Inc." [100%, 海外IT];\n  "NTTデータグループ" -> "クニエ" [100%, コンサル];\n  "NTTアーバンソリューションズ" -> "NTT都市開発" [100%, 街づくり];\n  "NTTファシリティーズ" -> "NTTアノードエナジー" [100%, 再エネ];\n}',
    tags: ['NTT', '持株会社', '放射状ツリー', 'ラディアルツリー', 'ドコモ', 'データ', '通信', 'グループ会社', 'ポートフォリオ', 'レイアウト']
  },
  {
    id: 'orgchart-standard-corporate',
    name: '形式6: 企業組織体制・マンハッタン配線型（標準企業 組織体制図）',
    category: 'レイアウト',
    description: '株主総会・取締役会を頂点とし、代表取締役社長、監査役（スタッフライン点線）、および各事業本部・配下の部課を直角マンハッタン配線で整理した標準的な企業組織図。',
    code: '\\orgchart{\n  title: "株式会社サンプル 組織体制・指揮命令系統図";\n  "株主総会" -> "取締役会";\n  "取締役会" -> "代表取締役社長 / 山田 太郎";\n  "代表取締役社長 / 山田 太郎" -- "監査役会" [監査];\n  "代表取締役社長 / 山田 太郎" -- "秘書室・法務部" [スタッフ];\n  "代表取締役社長 / 山田 太郎" -> "経営企画本部" [統括];\n  "代表取締役社長 / 山田 太郎" -> "営業統括本部" [統括];\n  "代表取締役社長 / 山田 太郎" -> "技術開発本部" [統括];\n  "営業統括本部" -> "第一営業部";\n  "営業統括本部" -> "第二営業部";\n  "技術開発本部" -> "システム基盤部";\n  "技術開発本部" -> "AIプロダクト部";\n}',
    tags: ['組織図', '組織階層図', 'Org Chart', '体制図', '役員', '取締役会', '社長', '本部', 'レイアウト']
  },

  // --- 構文形式 ---
  {
    id: 'capitaltree-macro-standard',
    name: '形式7: LaTeX 独自マクロ 資本構成ツリー標準構文（\\capitaltree）',
    category: '構文形式',
    description: 'タイトル、親会社から子会社への出資比率や区分（[100%, 完全子会社]）を矢印指定するPhysiNote標準の\\capitaltreeマクロ構文。',
    code: '\\capitaltree{\n  title: グループ企業 資本構成ツリー;\n  "持株親会社 (Holdings)" -> "中核事業子会社 A" [100%, 完全子会社];\n  "持株親会社 (Holdings)" -> "成長事業子会社 B" [65.0%, 連結子会社];\n  "持株親会社 (Holdings)" -> "持分法関連会社 C" [30.0%, 持分法適用];\n  "中核事業子会社 A" -> "孫会社 A-1" [100%, 孫会社];\n}',
    tags: ['capitaltree', '資本構成', '持株比率', 'マクロ', '標準', '独自構文', '構文形式', '構文']
  },
  {
    id: 'radialtree-macro-standard',
    name: '形式8: LaTeX 独自マクロ 放射状ポートフォリオ構文（\\radialtree）',
    category: '構文形式',
    description: '中心親会社（center: ...）から同心円状に各事業会社への出資・事業区分を展開するPhysiNote標準の\\radialtreeマクロ構文。',
    code: '\\radialtree{\n  title: "グループ事業ポートフォリオ (放射状ツリー)";\n  center: "ホールディングス本社" [持株会社, #0284c7];\n  "ホールディングス本社" -> "クラウド・IT事業" [100%, ITサービス];\n  "ホールディングス本社" -> "通信インフラ事業" [100%, 地域通信];\n  "ホールディングス本社" -> "メディア・広告事業" [60%, メディア];\n  "ホールディングス本社" -> "金融・決済事業" [100%, フィンテック];\n  "クラウド・IT事業" -> "AIソリューション" [100%, 開発];\n  "通信インフラ事業" -> "データセンター運用" [100%, 基盤];\n}',
    tags: ['radialtree', '放射状ツリー', 'ラディアル', '同心円', 'マクロ', '標準', '独自構文', '構文形式', '構文']
  },
  {
    id: 'orgchart-macro-standard',
    name: '形式9: LaTeX 独自マクロ 企業組織階層図構文（\\orgchart）',
    category: '構文形式',
    description: '指揮系統（->）およびスタッフ・監査ライン（--）を指定して企業組織図を描画するPhysiNote標準の\\orgchartマクロ構文。',
    code: '\\orgchart{\n  title: "企業組織図・指揮命令系統";\n  "取締役会" -> "代表取締役社長";\n  "代表取締役社長" -- "内部監査室" [監査];\n  "代表取締役社長" -> "事業統括本部" [統括];\n  "代表取締役社長" -> "管理統括本部" [統括];\n  "事業統括本部" -> "営業部";\n  "事業統括本部" -> "開発部";\n}',
    tags: ['orgchart', '組織図', '組織階層', 'マクロ', '標準', '独自構文', '指揮系統', '構文形式', '構文']
  }
];

// ==========================================
// コード進行 (ChordPro) ライブラリ データ
// ==========================================
const chordproLibrary = [
  {
    id: 'chordpro-jpop-royal',
    name: 'J-POP王道進行（IV - V - IIIm - VIm）',
    category: '定番進行・王道進行',
    description: '日本のヒット曲・アニソンで最も多用される王道コード進行（F - G - Em - Am）。ドラマチックで耳馴染みの良い響き。',
    code: '\\chordpro{\n  title: "J-POP王道進行";\n  key: "C";\n  tempo: "120";\n\n  [F]青い空を [G]見上げて [Em]歩き出す [Am]道\n  [Dm7]かすかな光が [G7]僕らを照らし [C]出す [C7]\n}',
    tags: ['王道進行', 'J-POP', 'コード進行', 'ChordPro', '定番', 'サビ']
  },
  {
    id: 'chordpro-canon-progression',
    name: 'パッヘルベル・カノン進行（I - V - VIm - IIIm - IV - I - IV - V）',
    category: '定番進行・王道進行',
    description: 'クラシックから現代ポップスまで世界中で愛されるカノンコード進行。小節グリッド（リードシート）表記。',
    code: '\\chordpro{\n  title: "カノン進行（リードシート表記）";\n  key: "C";\n  time: "4/4";\n\n  | [C] [G] | [Am] [Em] |\n  | [F] [C] | [F] [G] |\n  | [C] [G] | [Am] [Em] |\n  | [F] [G] | [C] [C] |\n}',
    tags: ['カノン進行', 'パッヘルベル', 'リードシート', '小節', 'クラシック', 'ポップス']
  },
  {
    id: 'chordpro-just-two-of-us',
    name: '丸サ進行（Just The Two of Us進行 / IVM7 - III7 - VIm7 - I7）',
    category: 'ポップス・ロック',
    description: '椎名林檎「丸の内サディスティック」や洋楽名曲で親しまれるお洒落でエモーショナルなアーバン進行。',
    code: '\\chordpro{\n  title: "Just The Two of Us 進行";\n  key: "C";\n  tempo: "96";\n\n  {comment: Aメロ / Verse}\n  [FM7]風に揺れる街並み [E7]通り過ぎてゆく\n  [Am7]夜が明けるまでの [Gm7]ふたりだけ[C7]のストーリー\n}',
    tags: ['丸サ進行', 'Just The Two of Us', 'オシャレ', 'ネオソウル', 'ポップス']
  },
  {
    id: 'chordpro-komuro-progression',
    name: '小室進行（VIm - IV - V - I / Am - F - G - C）',
    category: 'ポップス・ロック',
    description: '90年代J-POPや近年のEDM・ボカロ曲で定番の哀愁を帯びた疾走感あふれるマイナー始まりの進行。',
    code: '\\chordpro{\n  title: "小室進行（哀愁エモーショナル）";\n  key: "C";\n  tempo: "135";\n\n  | [Am] | [F] | [G] | [C] |\n  | [Am] | [F] | [G] | [Am] |\n}',
    tags: ['小室進行', '哀愁', 'ボカロ', 'ダンス', 'J-POP']
  },
  {
    id: 'chordpro-jazz-two-five-one',
    name: 'ジャズ ツー・ファイブ・ワン進行（IIm7 - V7 - IM7）',
    category: 'ジャズ・ブルース',
    description: 'ジャズ理論の根幹をなす最重要ケーデンス（メジャー2-5-1およびマイナー2-5-1）。',
    code: '\\chordpro{\n  title: "Jazz Major & Minor 2-5-1";\n  key: "C";\n  tempo: "110";\n\n  {comment: Major 2-5-1}\n  | [Dm7] | [G7] | [Cmaj7] | [Cmaj7] |\n\n  {comment: Minor 2-5-1}\n  | [Dm7b5] | [G7] | [Cm7] | [Cm7] |\n}',
    tags: ['ジャズ', 'ツーファイブワン', '2-5-1', '理論', 'スタンダード']
  },
  {
    id: 'chordpro-12-bar-blues',
    name: 'ブルース 12小節進行（12-Bar Blues in E）',
    category: 'ジャズ・ブルース',
    description: 'ロックやジャズのルーツである伝統的12小節ブルース進行（I7 - IV7 - V7）。',
    code: '\\chordpro{\n  title: "12-Bar Blues in E";\n  key: "E";\n  time: "4/4";\n  tempo: "116";\n\n  | [E7] | [E7] | [E7] | [E7] |\n  | [A7] | [A7] | [E7] | [E7] |\n  | [B7] | [A7] | [E7] | [B7] |\n}',
    tags: ['ブルース', '12小節', 'Blues', 'ロック', 'セッション']
  },
  {
    id: 'chordpro-minor-cadence-degree',
    name: 'マイナー循環・度数進行（Im → IVm → ♭III → Im → ♭VI → V）',
    category: '定番進行・王道進行',
    description: 'マイナーキーの代表的な機能和声進行（Roman Numeral Analysis）。LaTeX数式記法によるディグリーネーム表記。',
    code: '\\chordpro{\n  title: "マイナーコード循環（度数表記進行）";\n  key: "Am";\n  time: "4/4";\n  degree: "$$\\text{Im} \\rightarrow \\text{IVm} \\rightarrow \\flat\\text{III} \\rightarrow \\text{Im} \\rightarrow \\flat\\text{VI} \\rightarrow \\text{V}$$";\n\n  // 数式行によるアナライズ表記\n  $$\\text{Im} \\rightarrow \\text{IVm} \\rightarrow \\flat\\text{III} \\rightarrow \\text{Im} \\rightarrow \\flat\\text{VI} \\rightarrow \\text{V}$$\n\n  // Amキーでの実コード例\n  | [Am] | [Dm] | [C] | [Am] |\n  | [F]  | [E]  | [Am] | [Am] |\n}',
    tags: ['度数進行', 'ディグリー', '数式', 'マイナー', '和声理論', 'アナライズ']
  }
];

// ==========================================
// ギターコード図 (LaTeX guitarchords) ライブラリ データ
// ==========================================
const guitarchordsLibrary = [
  {
    id: 'guitar-basic-open-chords',
    name: 'アコースティックギター基本オープンコード（ローコード一覧）',
    category: '基本オープンコード',
    description: 'ギター初心者が最初に習得する主要オープンコード（C, G, Am, Em, D, A）。LaTeX guitarchords 記法。',
    code: '\\guitarchords{\n  title: "基本オープンコード（ローコード一覧）";\n  \\chord{t}{x,3,2,0,1,0}{C}\n  \\chord{t}{3,2,0,0,0,3}{G}\n  \\chord{t}{x,0,2,2,1,0}{Am}\n  \\chord{t}{0,2,2,0,0,0}{Em}\n  \\chord{t}{x,x,0,2,3,2}{D}\n  \\chord{t}{x,0,2,2,2,0}{A}\n}',
    tags: ['ギター', 'オープンコード', 'ローコード', 'アコギ', '初心者', '基本']
  },
  {
    id: 'guitar-basic-barre-chords',
    name: '基本セーハ・バレーコード（横向きフレット F・Bm・Fm・B）',
    category: 'セーハ・バレーコード',
    description: '人差し指で複数弦を同時に押さえるバレーコード（F、Bm、Fm、B）。横向きフレット指板図上にセーサーバーを強調表示。',
    code: '\\guitarchords{\n  title: "基本バレーコード（横向きフレット）";\n  orientation: horizontal;\n  \\chord{b}{1,3,3,2,1,1}{F}\n  \\chord{b}{x,2,4,4,3,2}{Bm}\n  \\chord{b}{1,3,3,1,1,1}{Fm}\n  \\chord{b}{x,2,4,4,4,2}{B}\n}',
    tags: ['ギター', 'バレーコード', 'セーハ', 'Fコード', 'Bm', '指板図', '横向きフレット']
  },
  {
    id: 'guitar-royal-progression',
    name: '王道進行ギター指板（F → G → Em → Am）',
    category: 'ギターコード進行',
    description: 'J-POP王道進行をギター指板ダイアグラムの連続フロー（矢印進行）として可視化。',
    code: '\\guitarchords{\n  title: "王道進行ギターポジション";\n  subtitle: "F → G → Em → Am";\n  F -> G -> Em -> Am;\n}',
    tags: ['ギターコード進行', '王道進行', 'ダイアグラム', 'ポジション', 'J-POP']
  },
  {
    id: 'guitar-four-chords-pop',
    name: '洋楽・邦楽ポップス定番 4 Chords（横向きフレット C → G → Am → F）',
    category: 'ギターコード進行',
    description: '世界中の無数のヒット曲で使用される定番4コード進行の横向きギターダイアグラム。',
    code: '\\guitarchords{\n  title: "ポップス定番 4 Chords（横向きフレット）";\n  subtitle: "C → G → Am → F";\n  orientation: horizontal;\n  C -> G -> Am -> F;\n}',
    tags: ['ギターコード進行', 'ポップス', '4 Chords', 'カノン', 'ヒット曲', '横向きフレット']
  },
  {
    id: 'guitar-seventh-chords',
    name: 'メジャー7th・マイナー7thコード（お洒落な響きのセブンス）',
    category: 'セーハ・バレーコード',
    description: 'シティポップ、ネオソウル、ボサノバで多用されるCmaj7、Dm7、Em7、Fmaj7、Am7のダイアグラム。',
    code: '\\guitarchords{\n  title: "メジャー＆マイナーセブンス指板一覧";\n  \\chord{t}{x,3,2,0,0,0}{Cmaj7}\n  \\chord{t}{x,x,0,2,1,1}{Dm7}\n  \\chord{t}{0,2,0,0,0,0}{Em7}\n  \\chord{t}{x,x,3,2,1,0}{Fmaj7}\n  \\chord{t}{x,0,2,0,1,0}{Am7}\n}',
    tags: ['ギター', 'セブンス', 'maj7', 'm7', 'シティポップ', 'ネオソウル']
  }
];

// ==========================================
// コード進行フロー (ChordFlow / ディグリー分析) ライブラリ データ
// ==========================================
const chordflowLibrary = [
  {
    id: 'chordflow-inmu-king-chorus',
    name: '度数（ディグリー）で見るサビの流れ（Im → IVm → ♭III → Im → ♭VI → V）',
    category: 'J-POP・アニソン',
    description: 'マイナーキーのサビ進行。トニックからサブドミナント、ドミナントモーションへの解決フロー。',
    code: '\\chordflow{\n  title: "【度数（ディグリー）で見るサビの流れ】";\n\n  Im [Fm] -> IVm [Bbm] -> bIII [Ab] -> Im [Fm] -> bVI [Db] -> V [C]\n\n  1 -> 2: "トニック";\n  4 -> 5 -> 6: "ドミナントモーションの解決 V → Im";\n}',
    tags: ['ディグリー', 'サビ', 'マイナーキー', 'ドミナントモーション', 'トニック', 'Fm', 'アナライズ']
  },
  {
    id: 'chordflow-jpop-royal',
    name: 'J-POP 王道進行（IV → V → IIIm → VIm）',
    category: '王道・定番進行',
    description: 'J-POPやアニメソングのサビで最も使われる感動的・ドラマチックなコード進行。',
    code: '\\chordflow{\n  title: "【J-POP王道進行（サビ定番）】";\n\n  IV [F] -> V [G] -> IIIm [Em] -> VIm [Am]\n\n  1 -> 2: "サブドミナント → ドミナント";\n  3 -> 4: "偽終止（トニック代理へ）";\n}',
    tags: ['王道進行', 'J-POP', 'アニソン', 'サビ', 'ディグリー', 'F G Em Am']
  },
  {
    id: 'chordflow-marusa-just-two-of-us',
    name: '丸サ進行 / Just The Two Of Us 進行（IVM7 → III7 → VIm7 → I7）',
    category: 'J-POP・アニソン',
    description: 'お洒落でエモーショナルな都会派ループ進行。セカンダリードミナントによる強烈な引き込み。',
    code: '\\chordflow{\n  title: "【丸サ進行（Just The Two Of Us）】";\n\n  IVM7 [FM7] -> III7 [E7] -> VIm7 [Am7] -> I7 [C7]\n\n  1 -> 2: "セカンダリードミナントへ";\n  2 -> 3: "ドミナントモーション解決";\n}',
    tags: ['丸サ進行', 'Just The Two Of Us', '椎名林檎', 'シティポップ', 'セカンダリードミナント']
  },
  {
    id: 'chordflow-two-five-one',
    name: 'ジャズ定番 ツー・ファイブ・ワン (II-V-I 解決)',
    category: 'ジャズ・理論',
    description: '音楽理論の基本にして最重要ケイデンス。強進行によるトニック解決。',
    code: '\\chordflow{\n  title: "【ツー・ファイブ・ワン (II - V - I)】";\n\n  IIm7 [Dm7] -> V7 [G7] -> IM7 [CM7]\n\n  1 -> 2: "サブドミナント代理";\n  2 -> 3: "ドミナントモーション解決";\n}',
    tags: ['ツーファイブワン', '2-5-1', 'ジャズ', '理論', 'ドミナントモーション', 'ケイデンス']
  },
  {
    id: 'chordflow-komuro-four-chords',
    name: '小室進行 (VIm → IV → V → I)',
    category: '王道・定番進行',
    description: '疾走感と哀愁を併せ持つ90年代J-POP・ダンスミュージックの黄金進行。',
    code: '\\chordflow{\n  title: "【小室進行 (哀愁ループ)】";\n\n  VIm [Am] -> IV [F] -> V [G] -> I [C]\n\n  1 -> 2: "平行短調から長調へ展開";\n  3 -> 4: "トニック完全終止";\n}',
    tags: ['小室進行', 'Am F G C', '哀愁', 'ダンスミュージック', '王道']
  }
];

// 音楽系ライブラリのキャメルケース互換エイリアス
const chordProLibrary = chordproLibrary;
const guitarChordsLibrary = guitarchordsLibrary;
const chordFlowLibrary = chordflowLibrary;

// ==========================================
// ブロック図 / システム構成図 (Block Diagram) ライブラリ プリセットデータ
// ==========================================
const blockDiagramLibrary = [
  {
    id: 'block-feedback-control',
    name: '形式1: フィードバック制御系 (Feedback Control System)',
    category: 'レイアウト',
    description: '目標入力と出力の偏差を比較器で算出し、コントローラ、制御対象（プラント）、センサフィードバック、外乱印加から成る標準的な閉ループ制御系。',
    code: '\\blockdiagram{\n  title: "フィードバック制御系 (Feedback Control System)";\n  "目標値 R(s)" -> sum1 [+];\n  sum1 -> "コントローラ C(s)" [偏差 E(s)];\n  "コントローラ C(s)" -> sum2 [+];\n  "外乱 D(s)" -> sum2 [+];\n  sum2 -> "制御対象 P(s)" [操作量 U(s)];\n  "制御対象 P(s)" -> "出力 Y(s)";\n  "出力 Y(s)" -> "センサ H(s)";\n  "センサ H(s)" -> sum1 [-];\n}',
    tags: ['形式1', 'フィードバック', '制御系', '閉ループ', '外乱', 'コントローラ', 'センサ', '伝達関数', 'PID', 'ブロック図', 'レイアウト']
  },
  {
    id: 'block-web-system-3tier',
    name: '形式2: Webシステム構成図 (3層クライアント・サーバ型インフラ)',
    category: 'レイアウト',
    description: 'クライアント端末（PC/スマホ/タブレット）、インターネット、Web&APサーバ、DBサーバ、社内クライアントから構成される標準的な3層Webシステムインフラ構成図。',
    code: '\\blockdiagram{\n  title: "Webシステム構成図 (3層クライアント・サーバ型インフラ)";\n  block: "Web&APサーバ" [会員登録 / サービス利用, #0284c7];\n  block: "DBサーバ" [ユーザー情報 / データ処理, #0284c7];\n  block: "社内クライアント" [データ利用 / コンテンツ更新, #0284c7];\n\n  "クライアント端末\\n(PC / タブレット / スマホ)" -> "インターネット (WAN)";\n  "インターネット (WAN)" -> "Web&APサーバ";\n  "Web&APサーバ" -> "DBサーバ";\n  "DBサーバ" -> "社内クライアント";\n}',
    tags: ['形式2', 'Webシステム', 'システム構成図', '3層', 'サーバ', 'DB', 'クライアント', 'インフラ', 'ネットワーク', 'レイアウト']
  },
  {
    id: 'block-dsp-pipeline',
    name: '形式3: ディジタル信号処理 送受信パイプライン (直列DSPチェーン)',
    category: 'レイアウト',
    description: 'アナログ音声信号入力からADC標本化、ディジタルフィルタ、QAM変調、RF電力増幅、アンテナ放射に至る直列信号処理パイプライン。',
    code: '\\blockdiagram{\n  title: "ディジタル通信 送受信パイプライン";\n  "音声入力 x(t)" -> "ADC変換部" -> "帯域フィルタ H(z)" -> "QAM変調器" -> "RF電力増幅部" -> "アンテナ放射 y(t)";\n}',
    tags: ['形式3', 'DSP', 'ディジタル信号処理', '通信', 'パイプライン', 'フィルタ', 'ADC', 'レイアウト']
  },
  {
    id: 'blockdiagram-macro-standard',
    name: '形式4: LaTeX 独自マクロ ブロック図・システム構成図構文 (\\blockdiagram)',
    category: '構文形式',
    description: 'ブロック定義（block:）、直列接続（->）、加算器（sum1）、符号（[+] / [-]）、フィードバックループを定義するPhysiNote標準の\\blockdiagramマクロ構文。',
    code: '\\blockdiagram{\n  title: "ブロック図 基本構文サンプル";\n  block: "コントローラ C(s)" [PID制御, #0284c7];\n  block: "制御対象 P(s)" [プラント, #0284c7];\n\n  "目標値 R(s)" -> sum1 [+];\n  sum1 -> "コントローラ C(s)" [偏差 E(s)];\n  "コントローラ C(s)" -> "制御対象 P(s)" [操作量 U(s)];\n  "制御対象 P(s)" -> "出力 Y(s)";\n  "出力 Y(s)" -> "センサ H(s)";\n  "センサ H(s)" -> sum1 [-];\n}',
    tags: ['形式4', 'blockdiagram', '独自マクロ', 'ブロック図', 'システム構成図', '構文形式', '構文', '標準']
  }
];

// ==========================================
// シーケンス図 (Sequence Diagram) ライブラリ プリセットデータ
// ==========================================
const sequenceLibrary = [
  // --- レイアウト ---
  {
    id: 'seq-web-auth-token',
    name: '形式1: Web API ユーザー認証・JWTトークン発行フロー',
    category: 'レイアウト',
    description: 'ブラウザSPAから認証APIサーバへID/PWをPOSTし、DB照会・ハッシュ検証を経てJWTアクセストークンを返却する標準的な認証シーケンス。',
    code: '\\sequence{\n  title: "Web API ユーザー認証・トークン発行フロー";\n  actor: "ユーザー (User)" [client];\n  actor: "Webクライアント (SPA)" [client];\n  actor: "認証API (Auth Server)" [server];\n  actor: "データベース (DB)" [database];\n\n  "ユーザー (User)" -> "Webクライアント (SPA)": ログインボタン押下 (ID/PW入力);\n  "Webクライアント (SPA)" -> "認証API (Auth Server)": POST /api/login (ID, HashPW);\n  "認証API (Auth Server)" -> "データベース (DB)": SELECT * FROM users WHERE id = ?;\n  "データベース (DB)" --> "認証API (Auth Server)": ユーザーレコード返却;\n  "認証API (Auth Server)" -> "認証API (Auth Server)": ハッシュパスワード検証 & JWT生成;\n  note: "認証API (Auth Server)": "有効期限: 24時間\\n署名: RS256";\n  "認証API (Auth Server)" --> "Webクライアント (SPA)": 200 OK (JWT Access Token);\n  "Webクライアント (SPA)" --> "ユーザー (User)": マイページ画面描画;\n}',
    tags: ['形式1', 'シーケンス図', '認証', 'JWT', 'REST API', 'SPA', 'ログイン', 'レイアウト']
  },
  {
    id: 'seq-3g-connection',
    name: '形式2: 3Gにおける接続設定シーケンス（移動通信プロトコル）',
    category: 'レイアウト',
    description: '移動端末、無線制御装置、コアネットワーク装置間の無線リソース・セキュリティ設定、ベアラ割当、ユーザデータ通信確立シーケンス。',
    code: '\\sequence{\n  title: "3Gにおける接続設定シーケンス";\n  actor: "移動端末", "無線制御装置", "コアネットワーク装置";\n\n  "移動端末" -> "無線制御装置": 無線リソース接続要求 [#0f172a];\n  "無線制御装置" -> "移動端末": 無線リソース設定要求 [#0f172a];\n  note over "移動端末", "無線制御装置": 制御データ通信 [#fef3c7];\n  "移動端末" -> "無線制御装置": 無線リソース設定応答 [#0f172a];\n  "移動端末" -> "無線制御装置": 初期直接転送信号 (NAS) [#0284c7];\n  "無線制御装置" -> "コアネットワーク装置": サービス要求 (NAS) [#0284c7];\n  "コアネットワーク装置" -> "無線制御装置": セキュリティ設定要求 [#16a34a];\n  "無線制御装置" -> "移動端末": セキュリティ設定要求 [#16a34a];\n  "移動端末" -> "無線制御装置": セキュリティ設定完了 [#16a34a];\n  "無線制御装置" -> "コアネットワーク装置": セキュリティ設定完了 [#16a34a];\n  "移動端末" -> "無線制御装置": 上り直接転送信号 (NAS) [#ca8a04];\n  "無線制御装置" -> "コアネットワーク装置": PDP Context 要求(NAS) [#ca8a04];\n  "コアネットワーク装置" -> "無線制御装置": 無線アクセスベアラ割当要求 [#0f172a];\n  "無線制御装置" -> "移動端末": 無線ベアラ設定要求 [#0f172a];\n  note over "移動端末", "無線制御装置": U-plane Establishment [#fef3c7];\n  "移動端末" -> "無線制御装置": 無線ベアラ設定応答 [#0f172a];\n  "無線制御装置" -> "コアネットワーク装置": 無線アクセスベアラ割当応答 [#0f172a];\n  "コアネットワーク装置" -> "無線制御装置": PDP Context 受付(NAS) [#ca8a04];\n  "無線制御装置" -> "移動端末": 下り直接転送信号 (NAS) [#ca8a04];\n  note over "移動端末", "コアネットワーク装置": ユーザデータ通信 [#e0f2fe];\n}',
    tags: ['形式2', '3G', '移動端末', '無線制御装置', 'コアネットワーク', '通信プロトコル', 'NAS', 'PDP Context', 'レイアウト']
  },

  // --- 構文形式 ---
  {
    id: 'seq-tcp-handshake',
    name: '形式3: TCP 3ウェイ・ハンドシェイク接続確立（双方向プロトコル構文）',
    category: '構文形式',
    description: 'クライアントとサーバ間でSYN、SYN-ACK、ACKパケットを交換し、双方向通信路を確立するTCP接続手順とnote注釈構文。',
    code: '\\sequence{\n  title: "TCP 3ウェイ・ハンドシェイク (Connection Establishment)";\n  actor: "クライアント (Client)", "サーバ (Server)";\n\n  "クライアント (Client)" -> "サーバ (Server)": SYN (seq = 1000);\n  note over "サーバ (Server)": "SYN_RCVD 状態へ遷移\\n接続受付準備";\n  "サーバ (Server)" --> "クライアント (Client)": SYN + ACK (seq = 2000, ack = 1001);\n  note over "クライアント (Client)": "ESTABLISHED 状態へ遷移";\n  "クライアント (Client)" -> "サーバ (Server)": ACK (ack = 2001);\n  note over "サーバ (Server)": "ESTABLISHED 状態へ遷移\\nデータ送受信可能";\n}',
    tags: ['形式3', 'TCP', 'ハンドシェイク', 'ネットワーク', '通信プロトコル', 'SYN', 'ACK', '構文形式', '構文']
  },
  {
    id: 'seq-ec-payment',
    name: '形式4: ECサイト クレジットカード決済フロー（多者間連携構文）',
    category: '構文形式',
    description: '購入者・ECサイト・決済ゲートウェイ・カード会社の4者間で実線要求と点線戻り値を連鎖させる多者間シーケンス構文。',
    code: '\\sequence{\n  title: "ECサイト クレジットカード決済フロー";\n  actor: "購入者 (Shopper)", "ECサイト (Shop Server)", "決済代行 (Payment Gateway)", "カード会社 (Card Issuer)";\n\n  "購入者 (Shopper)" -> "ECサイト (Shop Server)": 注文確定 & カード情報送信;\n  "ECサイト (Shop Server)" -> "決済代行 (Payment Gateway)": オーソリ（与信枠確保）要求;\n  "決済代行 (Payment Gateway)" -> "カード会社 (Card Issuer)": 有効性確認 & 与信照会;\n  "カード会社 (Card Issuer)" --> "決済代行 (Payment Gateway)": 与信承認 (Auth Code OK);\n  "決済代行 (Payment Gateway)" --> "ECサイト (Shop Server)": 決済完了通知;\n  "ECサイト (Shop Server)" -> "ECサイト (Shop Server)": 在庫引当 & 受注データ確定;\n  "ECサイト (Shop Server)" --> "購入者 (Shopper)": 注文完了画面表示 & メール送信;\n}',
    tags: ['形式4', 'EC', '決済', 'クレジットカード', 'オーソリ', '決済代行', '注文処理', '多者間', '構文形式', '構文']
  }
];

// ==========================================
// 決算書サンキーダイアグラム (P/L：損益計算書) ライブラリ プリセットデータ
// ==========================================
const plLibrary = [
  {
    id: 'pl-nhk-fy25',
    name: '日本放送協会（NHK） 一般勘定 損益計算書 (2025年度 決算)',
    category: '放送・公共メディア',
    description: '受信料等の事業収入と積立金取崩から総資金へ集約し、4大経費グループを経て国内放送費・給与・各種経費・減価償却費等へ段階的に展開する階層型P/Lフロー。',
    code: '\\pl{\n  company: "日本放送協会（NHK）";\n  code: "一般勘定";\n  period: "2025年度 決算（令和7年度）";\n  unit: "億円";\n  consolidated: false;\n\n  // 1. 収入の内訳 -> 事業収入（合計 6,130億円）\n  受信料 [5851, 90.7%, #38bdf8] -> 事業収入;\n  副次収入等 [80, 1.2%, #38bdf8] -> 事業収入;\n  財務収入 [73, 1.1%, #38bdf8] -> 事業収入;\n  雑収入 [72, 1.1%, #38bdf8] -> 事業収入;\n  交付金収入 [40, 0.6%, #38bdf8] -> 事業収入;\n  特別収入 [14, 0.2%, #38bdf8] -> 事業収入;\n\n  // 2. 中央の集約（事業収入 6,130億円 ＋ 不足補てん 318億円 ＝ 総資金 6,449億円）\n  事業収入 [6130, 95.1%, #38bdf8] -> 総資金;\n  還元目的積立金取崩等 [318, 4.9%, #f59e0b] -> 総資金;\n  node: 総資金 [6449, 100%, #0284c7];\n\n  // 3. 総資金から大枠の経費グループへ集約\n  総資金 -> 放送・配信経費 [3679, 57.0%, #f87171];\n  総資金 -> 人件費 [1389, 21.5%, #f87171];\n  総資金 -> 営業・管理その他経費 [814, 12.6%, #f87171];\n  総資金 -> 減価償却費 [567, 8.8%, #f87171];\n\n  // 4. 放送・配信経費の内訳展開\n  放送・配信経費 -> 国内放送費 [3311, 51.3%, #f87171];\n  放送・配信経費 -> 国際放送費 [194, 3.0%, #f87171];\n  放送・配信経費 -> 国内外配信費 [174, 2.7%, #f87171];\n\n  // 5. 人件費の内訳展開\n  人件費 -> 給与 [1089, 16.9%, #f87171];\n  人件費 -> 退職手当・厚生費 [300, 4.7%, #f87171];\n\n  // 6. 営業・管理その他経費の内訳展開\n  営業・管理その他経費 -> 契約収納費 [474, 7.3%, #f87171];\n  営業・管理その他経費 -> 共通管理費 [181, 2.8%, #f87171];\n  営業・管理その他経費 -> 調査広報費 [137, 2.1%, #f87171];\n  営業・管理その他経費 -> その他・特別支出 [17, 0.3%, #f87171];\n  営業・管理その他経費 -> 受信対策費 [5, 0.1%, #f87171];\n\n  // 7. 減価償却費の内訳展開（固定資産別）\n  減価償却費 -> 放送設備・送信機等（機械装置） [346, 5.4%, #f87171];\n  減価償却費 -> 局舎・電波塔等（建物・構築物） [162, 2.5%, #f87171];\n  減価償却費 -> ソフトウェア・その他 [59, 0.9%, #f87171];\n}',
    tags: ['NHK', 'P/L', '損益計算書', '放送', '決算', '受信料', '総資金']
  },
  {
    id: 'pl-toyota-fy24',
    name: 'トヨタ自動車 連結損益計算書 (2024年3月期 通期)',
    category: '製造業・自動車',
    description: '売上高45兆円から売上原価、販管費（研究開発費等）、税金を差し引き、営業利益5.3兆円、当期純利益3.9兆円を創出した日本最大企業のP/Lフロー。',
    code: '\\pl{\n  company: "トヨタ自動車";\n  code: "7203";\n  period: "2024年3月期 通期";\n  unit: "億円";\n  consolidated: true;\n\n  // 売上構成 -> 売上高\n  自動車事業 [410000, 90.9%, #38bdf8] -> 売上高;\n  金融事業 [35000, 7.8%, #38bdf8] -> 売上高;\n  その他事業 [6000, 1.3%, #38bdf8] -> 売上高;\n\n  // 売上高 -> 売上原価 & 売上総利益\n  売上高 [451000, 100%, #0284c7] -> 売上原価 [362000, 80.3%, #f87171, above];\n  売上高 -> 売上総利益 [89000, 19.7%, #34d399, below];\n\n  // 売上総利益 -> 販管費 & 営業利益\n  売上総利益 -> 販管費 [35000, 7.8%, #f87171, above];\n  売上総利益 -> 営業利益 [54000, 12.0%, #34d399, below];\n\n  販管費 -> 研究開発費 [12000, 2.7%, #f87171];\n  販管費 -> 広告宣伝費 [8000, 1.8%, #f87171];\n  販管費 -> 人件費・その他 [15000, 3.3%, #f87171];\n\n  // 営業利益 -> 法人税等 & 当期純利益\n  営業利益 -> 法人税等 [14000, 3.1%, #f87171, above];\n  営業利益 -> 当期純利益 [40000, 8.9%, #34d399, below];\n}',
    tags: ['トヨタ', 'P/L', '損益計算書', '自動車', '決算', '営業利益']
  },
  {
    id: 'pl-apple-fy23',
    name: 'Apple Inc. 連結損益計算書 (FY2023)',
    category: 'IT・ビッグテック',
    description: 'iPhone、Services、Mac、iPadの各売上高から高粗利なサービス事業とハードウェア原価、研究開発費を経て巨額の純利益970億ドルを生み出す構造。',
    code: '\\pl{\n  company: "Apple Inc.";\n  code: "AAPL";\n  period: "FY2023 Annual";\n  unit: "Million USD";\n  consolidated: true;\n\n  // 製品・サービス別売上 -> 売上高 (Revenue)\n  iPhone [200583, 52.3%, #38bdf8] -> 売上高;\n  Services [85200, 22.2%, #38bdf8] -> 売上高;\n  Wearables & Home [39845, 10.4%, #38bdf8] -> 売上高;\n  Mac [29357, 7.7%, #38bdf8] -> 売上高;\n  iPad [28300, 7.4%, #38bdf8] -> 売上高;\n\n  売上高 [383285, 100%, #0284c7] -> 売上原価 [214137, 55.9%, #f87171, above];\n  売上高 -> 売上総利益 [169148, 44.1%, #34d399, below];\n\n  売上総利益 -> 研究開発費 [29915, 7.8%, #f87171, above];\n  売上総利益 -> 一般管理・販売費 [24932, 6.5%, #f87171, above];\n  売上総利益 -> 営業利益 [114301, 29.8%, #34d399, below];\n\n  営業利益 -> 法人税等 [16741, 4.4%, #f87171, above];\n  営業利益 -> 当期純利益 [96995, 25.3%, #34d399, below];\n}',
    tags: ['Apple', 'AAPL', 'P/L', '損益計算書', 'ビッグテック', 'iPhone', '粗利率']
  }
];

// ==========================================
// エネルギー準位図 & バンド図 (Energy Level / Band Diagram) ライブラリ プリセットデータ
// ==========================================
const energyLevelLibrary = [
  {
    id: 'el-hydrogen-balmer',
    name: '水素原子のエネルギー準位とバルマー系列 (水素スペクトル)',
    category: '量子力学・原子物理',
    description: '主量子数 n=1 の基底状態 (-13.6 eV) から励起準位、および可視光線領域のバルマー系列発光（Hα, Hβ, Hγ遷移）を示す図。',
    code: '\\energylevel{\n  title: "水素原子のエネルギー準位とバルマー系列 (Balmer Series)";\n  unit: "eV";\n  axis: true;\n  grid: true;\n\n  n1: "n = 1 (基底状態)" [-13.60, #38bdf8];\n  n2: "n = 2" [-3.40, #38bdf8];\n  n3: "n = 3" [-1.51, #38bdf8];\n  n4: "n = 4" [-0.85, #38bdf8];\n  n5: "n = 5" [-0.54, #38bdf8];\n  n_inf: "n = ∞ (電離状態)" [0.00, dashed, #94a3b8];\n\n  n3 -> n2: "Hα (656 nm)" [emission, #ef4444];\n  n4 -> n2: "Hβ (486 nm)" [emission, #06b6d4];\n  n5 -> n2: "Hγ (434 nm)" [emission, #8b5cf6];\n}',
    tags: ['水素原子', 'エネルギー準位', 'バルマー系列', 'ボーアモデル', '量子力学', 'スペクトル']
  },
  {
    id: 'el-pn-junction-equilibrium',
    name: 'pn接合のエネルギーバンド図（熱平衡状態・バイアスなし）',
    category: '物性物理・半導体',
    description: 'p型領域とn型領域の接合による空乏層形成、内蔵電位qVbiによるバンドの曲がり、多数キャリア（正孔・電子）とフェルミ準位EFの一致を示すバンド図。',
    code: '\\banddiagram{\n  type: pn_junction;\n  title: "pn接合のエネルギーバンド図（熱平衡状態・バイアスなし）";\n  p_region: "p型領域（正孔が多数）";\n  depletion: "空乏層（キャリアなし）";\n  n_region: "n型領域（電子が多数）";\n  w_label: "空乏層幅 W";\n  vbi_label: "qVbi（内蔵電位）";\n  vbi_sub: "Siで約0.6〜0.7 V";\n  barrier_text: "障壁qVbiを越えられない";\n  hole_label: "正孔（多数キャリア）";\n  electron_label: "電子（多数キャリア）";\n  ef_note: "熱平衡ではEFは一直線";\n  note1: "・接合するとn側の電子とp側の正孔が拡散・再結合し、接合部に空乏層と内蔵電位qVbiが形成されバンドが曲がる";\n  note2: "・この障壁が拡散を止めた状態が熱平衡 ─ 順バイアスで障壁が下がると電流が流れる（整流作用の起源）";\n}',
    tags: ['pn接合', '半導体', 'バンド図', '空乏層', '内蔵電位', 'フェルミ準位', '熱平衡']
  },
  {
    id: 'el-pn-bias-comparison',
    name: 'pn接合のバイアスとバンドの変化 ─ 順バイアス vs 逆バイアス',
    category: '物性物理・半導体',
    description: '外部電圧印加による障壁高さと空乏層幅の変化。順バイアスでのキャリア注入・順方向電流と、逆バイアスでの障壁上昇・電流遮断の比較。',
    code: '\\banddiagram{\n  type: pn_bias_comparison;\n  title: "pn接合のバイアスとバンドの変化 ─ 順バイアス vs 逆バイアス";\n}',
    tags: ['pn接合', '順バイアス', '逆バイアス', '整流作用', '半導体', 'バンド変化', '空乏層']
  },
  {
    id: 'el-density-of-states-concept',
    name: '状態密度の概念図 (DOS: 結合状態・反結合状態・正孔導入)',
    category: '物性物理・バンド理論',
    description: 'UPスピン状態密度とエネルギーの関係。価電子帯（結合状態・反結合状態）、フェルミ準位、バンドギャップ、伝導帯、および正孔導入によるp型伝導メカニズム。',
    code: '\\banddiagram{\n  type: dos;\n  title: "【状態密度の概念図】";\n  yaxis: "状態密度(UPスピン)";\n  xaxis: "エネルギー";\n  fermi: "フェルミ準位";\n  gap: "バンドギャップ";\n  valence: "価電子帯";\n  conduction: "伝導電子帯";\n  note1: "N-2p状態から磁性不純物準位への電子移動";\n  note2: "→ 価電子状態上端(VBM)に正孔(h+)が導入";\n  note3: "→ 低抵抗p型伝導の発生";\n}',
    tags: ['状態密度', 'DOS', 'バンド構造', 'フェルミ準位', '正孔', '価電子帯', '伝導帯', '半導体']
  },
  {
    id: 'el-semiconductor-band',
    name: '半導体（シリコン Si）のバンド構造・バンドギャップ',
    category: '物性物理・半導体',
    description: '価電子帯 (Ev) と伝導帯 (Ec)、エネルギーギャップ Eg=1.12 eV、フェルミ準位 Ef、熱励起による電子-正孔対の生成を示すバンド図。',
    code: '\\energylevel{\n  title: "真性半導体のエネルギーバンド構造 (Silicon: Eg = 1.12 eV)";\n  unit: "eV";\n  axis: true;\n\n  band: "価電子帯 (Valence Band)" [-2.0, 0.0, fill: #38bdf8, opacity: 0.3];\n  band: "伝導帯 (Conduction Band)" [1.12, 3.2, fill: #ef4444, opacity: 0.3];\n\n  fermi: "真性フェルミ準位 E_i" [0.56, dashed, #10b981];\n\n  gap: "バンドギャップ E_g = 1.12 eV" [0.0, 1.12, #f59e0b];\n  0.0 -> 1.12: "熱励起 (電子・正孔対生成)" [absorption, #f59e0b];\n}',
    tags: ['半導体', 'バンド図', '価電子帯', '伝導帯', 'バンドギャップ', 'フェルミ準位', 'シリコン']
  },
  {
    id: 'el-ruby-laser-3level',
    name: '3準位レーザー（ルビーレーザー）の励起・緩和・誘導放出',
    category: 'レーザー・光エレクトロニクス',
    description: '基底準位から光励起（緑色フラッシュランプ）で励起帯へ汲み上げ、無放射高速緩和を経て準安定準位へ蓄積し、694.3 nmのレーザー発振（誘導放出）を起こす3準位モデル。',
    code: '\\energylevel{\n  title: "ルビーレーザー 3準位系の発振原理 (Ruby Laser)";\n  unit: "eV";\n  axis: true;\n\n  E1: "E1: 基底状態 (^4A_2)" [0.0, #38bdf8];\n  E2: "E2: 準安定状態 (^2E)" [1.79, #10b981];\n  E3: "E3: 励起帯 (^4F_2)" [2.25, #f59e0b];\n\n  E1 -> E3: "光ポンピング (緑色光 hν_p)" [absorption, #10b981];\n  E3 ~> E2: "無放射高速緩和 (フォノン放出)" [relax, #94a3b8];\n  E2 -> E1: "誘導放出・レーザー発振 (694.3 nm)" [emission, #ef4444];\n}',
    tags: ['レーザー', '3準位系', 'ルビーレーザー', '誘導放出', '光ポンピング', '緩和']
  },
  {
    id: 'el-band-formation',
    name: '電子殻モデルからエネルギーバンド形成 & ボーア量子条件',
    category: '物性物理・量子力学',
    description: '電子殻（k殻・l殻・m殻/価電子帯・n殻/伝導帯・フェルミ準位・禁制帯）から、単一原子→N個の原子の準位分裂→結晶バンド形成の推移、およびボーアの量子条件（ド・ブロイ波定在波 2πr = nλ）を示す総合図。',
    code: '\\banddiagram{\n  type: band_formation;\n  title: "電子殻モデルからエネルギーバンド形成（単一原子から結晶へ）";\n}',
    tags: ['バンド形成', '電子殻', 'ボーアの量子条件', 'ド・ブロイ波', '伝導帯', '価電子帯', '禁制帯', '結晶', 'フェルミ準位']
  },
  {
    id: 'el-bohr-photo-excitation',
    name: '光吸収による電子の励起遷移（ボーア原子模型）',
    category: '量子力学・原子物理',
    description: '原子核の周りの軌道準位（E1, E2, 外側軌道）において、光子エネルギーの吸収によって電子が低エネルギー軌道から高エネルギー軌道へ遷移する励起メカニズムを示す図。',
    code: '\\banddiagram{\n  type: bohr_excitation;\n  title: "光吸収による電子の励起遷移（ボーア原子模型）";\n}',
    tags: ['ボーア模型', '光吸収', '電子励起', '原子軌道', '量子条件', '遷移', 'エネルギー準位']
  }
];

// ==========================================
// ポテンシャルエネルギー曲線 (Potential Energy Curve) ライブラリ プリセットデータ
// ==========================================
const potentialLibrary = [
  // --- レイアウト ---
  {
    id: 'pot-morse-h2',
    name: '形式1: モースポテンシャルと二原子分子の束縛振動準位',
    category: 'レイアウト',
    description: '非調和振動を考慮した二原子分子のポテンシャルエネルギー曲線。平衡核間距離 re、解離エネルギー De、束縛振動準位 (v=0〜4) を表示。',
    code: '\\potential{\n  title: "モースポテンシャルと振動束縛準位 (Morse Potential)";\n  type: morse;\n  De: 4.75;\n  re: 0.74;\n  a: 1.95;\n  xaxis: "核間距離 r";\n  yaxis: "ポテンシャルエネルギー V(r)";\n  xunit: "Å";\n  yunit: "eV";\n\n  level: "v = 0 (零点エネルギー)" [-4.48, #38bdf8];\n  level: "v = 1" [-3.98, #38bdf8];\n  level: "v = 2" [-3.52, #38bdf8];\n  level: "v = 3" [-3.10, #38bdf8];\n  level: "v = 4" [-2.72, #38bdf8];\n\n  well: "結合解離エネルギー D_e = 4.75 eV" [-4.75, 0.0, #10b981];\n}',
    tags: ['モースポテンシャル', '化学結合', '解離エネルギー', '振動準位', '分子分光', '水素分子', 'レイアウト']
  },
  {
    id: 'pot-lj-argon',
    name: '形式2: レナード-ジョーンズ (12-6) ポテンシャル（アルゴン二量体）',
    category: 'レイアウト',
    description: 'パウリの排他律に基づく強い近距離反発（r^-12）と長距離ファンデルワールス引力（r^-6）の競合から生じる安定なポテンシャルの谷。',
    code: '\\potential{\n  title: "レナード-ジョーンズ (12-6) ポテンシャル (Lennard-Jones)";\n  type: lennard_jones;\n  De: 0.0104;\n  re: 3.76;\n  xaxis: "原子間距離 r";\n  yaxis: "相互作用ポテンシャル V(r)";\n  xunit: "Å";\n  yunit: "eV";\n\n  well: "井戸の深さ ε" [-0.0104, 0.0, #10b981];\n  point: "反発力支配領域 (r < σ)" [2.8, 0.005, #ef4444];\n  point: "ファンデルワールス引力支配 (r > r_e)" [5.2, -0.003, #38bdf8];\n}',
    tags: ['レナードジョーンズ', 'LJポテンシャル', 'ファンデルワールス力', '分子間力', 'アルゴン', 'レイアウト']
  },
  {
    id: 'pot-harmonic-oscillator',
    name: '形式3: 量子調和振動子ポテンシャル（放物線井戸と等間隔準位）',
    category: 'レイアウト',
    description: '微小振動を近似する放物線型ポテンシャル。等間隔な量子化振動準位 (v = 0〜4) と零点エネルギー (1/2 ħω) を表示。',
    code: '\\potential{\n  title: "量子調和振動子ポテンシャル (Harmonic Oscillator)";\n  type: harmonic;\n  De: 5.0;\n  re: 1.2;\n  k: 10.0;\n  xaxis: "変位 x";\n  yaxis: "ポテンシャルエネルギー V(x)";\n  xunit: "Å";\n  yunit: "eV";\n\n  level: "v = 0 (零点振動 E_0 = 1/2 ħω)" [-4.5, #38bdf8];\n  level: "v = 1 (E_1 = 3/2 ħω)" [-3.5, #38bdf8];\n  level: "v = 2 (E_2 = 5/2 ħω)" [-2.5, #38bdf8];\n  level: "v = 3 (E_3 = 7/2 ħω)" [-1.5, #38bdf8];\n  level: "v = 4 (E_4 = 9/2 ħω)" [-0.5, #38bdf8];\n\n  well: "ポテンシャルの底 V_0" [-5.0, 0.0, #10b981];\n}',
    tags: ['調和振動子', '量子力学', '等間隔準位', '零点エネルギー', '放物線', '振動', 'レイアウト']
  },

  // --- 構文形式 ---
  {
    id: 'pot-reaction-profile',
    name: '形式4: 化学反応プロファイル（活性化エネルギーと反応熱）',
    category: '構文形式',
    description: '原系から遷移状態（TS）を経て生成系に至る反応座標エネルギー変化。正反応の活性化エネルギー Ea と発熱反応のエンタルピー変化 ΔH を明示。',
    code: '\\potential{\n  title: "発熱化学反応のポテンシャルエネルギープロファイル";\n  type: reaction;\n  xaxis: "反応座標 (Reaction Coordinate)";\n  yaxis: "ギブズ自由エネルギー G";\n  xunit: "a.u.";\n  yunit: "kJ/mol";\n\n  stage: "原系 (A + B)" [energy: 0.0, x: 1.2, color: #38bdf8];\n  stage: "遷移状態 [AB]‡" [energy: 75.0, x: 3.0, color: #ef4444];\n  stage: "生成系 (C + D)" [energy: -45.0, x: 4.8, color: #10b981];\n\n  barrier: "活性化エネルギー E_a" [from: 0.0, to: 75.0, x: 2.1, color: #f59e0b];\n  barrier: "反応エンタルピー ΔH" [from: 0.0, to: -45.0, x: 4.0, color: #10b981];\n}',
    tags: ['化学反応', '反応速度論', '活性化エネルギー', '遷移状態', 'エンタルピー', '発熱反応', '構文形式']
  },
  {
    id: 'pot-double-well-ammonia',
    name: '形式5: 二重井戸ポテンシャル（アンモニア反転とトンネル分裂）',
    category: '構文形式',
    description: 'アンモニア分子の窒素原子反転運動を表す対称二重井戸。中央のポテンシャル障壁とトンネル効果による基底状態の二重項準位分裂を表示。',
    code: '\\potential{\n  title: "二重井戸ポテンシャルとトンネル効果 (Double Well)";\n  type: double_well;\n  De: 4.0;\n  xaxis: "反転座標 x";\n  yaxis: "ポテンシャルエネルギー V(x)";\n  xunit: "Å";\n  yunit: "eV";\n\n  level: "v = 0+ (対称基底状態)" [-3.3, #38bdf8];\n  level: "v = 0- (反対称分裂準位 ΔE)" [-3.0, #f43f5e];\n  level: "v = 1+ (第1励起 対称)" [-1.8, #38bdf8];\n  level: "v = 1- (第1励起 反対称)" [-1.4, #f43f5e];\n\n  barrier: "反転障壁高さ V_B" [-4.0, -2.0, 0.0, #f59e0b];\n  point: "極小点 (井戸 1)" [-1.2, -4.0, #10b981];\n  point: "極小点 (井戸 2)" [1.2, -4.0, #10b981];\n}',
    tags: ['二重井戸', 'アンモニア反転', 'トンネル効果', '量子力学', '準位分裂', '反転二重項', '構文形式']
  }
];

// ==========================================
// ニューラルネットワーク構造図 (Neural Network / DNN) ライブラリ プリセットデータ
// ==========================================
const neuralNetworkLibrary = [
  // --- レイアウト ---
  {
    id: 'nn-mlp-basic',
    name: '形式1: 3層多層パーセプトロン（標準MLP）',
    category: 'レイアウト',
    description: '入力層(3)、中間層(5)、出力層(2)からなる最も標準的な順伝播型ニューラルネットワーク。ReLUとSoftmaxによる2クラス分類構成。',
    code: '\\nn{\n  title: "3層多層パーセプトロン (Multilayer Perceptron)";\n  subtitle: "入力特徴量から2クラス分類確率を出力する基本構造";\n  layers: [3, 5, 2];\n  labels: ["入力層 (3)", "隠れ層 (5)", "出力層 (2)"];\n  activations: ["ReLU", "Softmax"];\n  nodes[0]: ["x₁", "x₂", "x₃"];\n  nodes[2]: ["y₁", "y₂"];\n  bias: true;\n}',
    tags: ['形式1', 'ニューラルネットワーク', 'MLP', '多層パーセプトロン', 'ディープラーニング', 'AI', 'レイアウト']
  },
  {
    id: 'nn-deep-dnn',
    name: '形式2: 深層ニューラルネットワーク（Deep DNN / 4層アーキテクチャ）',
    category: 'レイアウト',
    description: '入力層(4)、中間層1(6)、中間層2(6)、出力層(3)の多層構造。特定ニューロン間の順伝播シグナルパスをハイライト表示。',
    code: '\\nn{\n  title: "4層ディープニューラルネットワーク (DNN)";\n  subtitle: "多段階の特徴抽出を行うディープアーキテクチャ";\n  layers: [4, 6, 6, 3];\n  labels: ["入力層 (4)", "中間層 1 (6)", "中間層 2 (6)", "出力層 (3)"];\n  activations: ["ReLU", "ReLU", "Softmax"];\n  bias: true;\n  highlight: (0, 1) -> (1, 2), (1, 2) -> (2, 3), (2, 3) -> (3, 1);\n}',
    tags: ['形式2', '深層学習', 'DNN', 'ディープラーニング', '中間層', 'AI', '機械学習', 'レイアウト']
  },
  {
    id: 'nn-autoencoder',
    name: '形式3: オートエンコーダ（Autoencoder / 潜在空間ボトルネック構造）',
    category: 'レイアウト',
    description: '入力データを低次元の潜在表現へ圧縮（エンコード）し、元データを復元（デコード）する砂時計型アーキテクチャ。',
    code: '\\nn{\n  title: "オートエンコーダ (Autoencoder Architecture)";\n  subtitle: "次元圧縮と潜在特徴抽出を行う対称型ボトルネック構造";\n  layers: [6, 4, 2, 4, 6];\n  labels: ["入力 (6)", "Encoder (4)", "潜在空間 z (2)", "Decoder (4)", "再構成 (6)"];\n  activations: ["ReLU", "Linear", "ReLU", "Sigmoid"];\n  bias: true;\n  highlight: (0, 2) -> (1, 1), (1, 1) -> (2, 0), (2, 0) -> (3, 2), (3, 2) -> (4, 2);\n}',
    tags: ['形式3', 'オートエンコーダ', 'Autoencoder', '次元削減', '潜在変数', '砂時計', 'レイアウト']
  },

  // --- 構文形式 ---
  {
    id: 'nn-large-sparse',
    name: '形式4: 大規模高次元ネットワーク（自動省略 ⋮ 機構）',
    category: '構文形式',
    description: '入力128次元、隠れ層256次元、出力10クラスなどの大規模層構成を、縦ドット(⋮)で自動省略してすっきり可視化。',
    code: '\\nn{\n  title: "画像認識モデル (High-Dimensional Feature Map)";\n  subtitle: "多数のニューロンを縦3点ドット (⋮) でスマートに縮退表示";\n  layers: [8, 12, 10];\n  labels: ["入力特徴量 (128次元)", "全結合隠れ層 (256次元)", "分類出力 (10クラス)"];\n  activations: ["GELU", "Softmax"];\n  nodes[0]: ["x₁", "x₂", "x₃", "x₁₂₇", "x₁₂₈"];\n  nodes[2]: ["y₀", "y₁", "y₂", "y₈", "y₉"];\n  bias: false;\n}',
    tags: ['形式4', '大規模モデル', '高次元', '省略表示', '画像認識', 'DNN', '構文形式']
  },
  {
    id: 'nn-macro-standard',
    name: '形式5: LaTeX 独自マクロ標準構文（\\nn / 活性化関数・推論パス追跡）',
    category: '構文形式',
    description: '層構成、活性化関数バッジ、バイアスノード、特定ニューロン間の順伝播シグナルパス（highlight）を宣言的に記述する標準構文。',
    code: '\\nn{\n  title: "多層パーセプトロン推論モデル (標準マクロ構文)";\n  subtitle: "入力から出力までの活性化関数とシグナル順伝播ハイライト";\n  layers: [4, 5, 3];\n  labels: ["特徴量入力層", "隠れ層 (ReLU)", "分類確率出力 (Softmax)"];\n  activations: ["ReLU", "Softmax"];\n  nodes[0]: ["x₁", "x₂", "x₃", "x₄"];\n  nodes[2]: ["Class A", "Class B", "Class C"];\n  bias: true;\n  highlight: (0, 0) -> (1, 2), (1, 2) -> (2, 1);\n}',
    tags: ['形式5', 'nn', 'マクロ', '標準', '独自構文', 'ハイライト', '活性化関数', '構文形式', '構文']
  }
];

// ==========================================
// 有向グラフ / ネットワークグラフ (Graph / 最短経路) ライブラリ プリセットデータ
// ==========================================
const graphLibrary = [
  // --- レイアウト ---
  {
    id: 'graph-dijkstra-shortest',
    name: '形式1: ダイクストラ法による最短経路問題（S → G）',
    category: 'レイアウト',
    description: '重み付き有向グラフにおいて、始点Sから各頂点への確定最短コストを表示し、終点Gへの最短パス (S→B→D→G) を太くハイライトした図。',
    code: '\\graph{\n  title: "ダイクストラ法による最短経路探索 (Dijkstra Algorithm)";\n  subtitle: "Sから各ノードへの最短コストと最適経路 (S → B → D → G: コスト8)";\n  type: directed;\n\n  node S (80, 160) "S" [start, cost: 0];\n  node A (220, 80) "A" [cost: 4];\n  node B (220, 240) "B" [cost: 2];\n  node C (380, 80) "C" [cost: 7];\n  node D (380, 240) "D" [cost: 5];\n  node G (520, 160) "G" [goal, cost: 8];\n\n  S -> A : 4;\n  S -> B : 2 [highlight];\n  B -> A : 1;\n  B -> D : 3 [highlight];\n  A -> C : 3;\n  D -> C : 2;\n  D -> G : 3 [highlight];\n  C -> G : 2;\n}',
    tags: ['形式1', 'ダイクストラ', '最短経路', '有向グラフ', 'グラフ理論', 'アルゴリズム', 'コスト', 'レイアウト']
  },
  {
    id: 'graph-dag-topological',
    name: '形式2: 有向非巡回グラフ（DAG / タスク依存関係）',
    category: 'レイアウト',
    description: 'タスクの先行・後続依存関係を表す有向非巡回グラフ(DAG)。ビルドシステムや並行処理スケジューリングの解説に最適。',
    code: '\\graph{\n  title: "タスク依存関係 DAG (Directed Acyclic Graph)";\n  subtitle: "ビルド順序を決定するトポロジカルソートの対象ネットワーク";\n  type: directed;\n\n  node T1 (90, 100) "Task 1";\n  node T2 (90, 220) "Task 2";\n  node T3 (250, 100) "Task 3";\n  node T4 (250, 220) "Task 4";\n  node T5 (410, 160) "Task 5";\n\n  T1 -> T3 : "依存";\n  T1 -> T4;\n  T2 -> T4 : "依存";\n  T3 -> T5 : "完了後";\n  T4 -> T5 : "完了後";\n}',
    tags: ['形式2', 'DAG', 'トポロジカルソート', '依存関係', 'タスク', '有向非巡回グラフ', 'レイアウト']
  },
  {
    id: 'graph-network-flow',
    name: '形式3: 最大フロー問題（ネットワークフロー / S → T）',
    category: 'レイアウト',
    description: '容量制約のあるパイプライン網において、ソースSからシンクTへ流せる最大流量を可視化するフローネットワーク。',
    code: '\\graph{\n  title: "最大フロー・ネットワーク (Max-Flow Problem)";\n  subtitle: "始点Sから終点Tへの容量制約付き有向ネットワーク";\n  type: directed;\n\n  node S (80, 160) "Source S" [start];\n  node A (240, 80) "A" [cost: 10];\n  node B (240, 240) "B" [cost: 8];\n  node C (400, 80) "C" [cost: 9];\n  node D (400, 240) "D" [cost: 10];\n  node T (560, 160) "Sink T" [goal];\n\n  S -> A : "10/10" [highlight];\n  S -> B : "5/8";\n  A -> C : "8/9" [highlight];\n  A -> B : "2/4";\n  B -> D : "7/10";\n  C -> T : "10/10" [highlight];\n  D -> T : "5/10";\n  C -> D : "0/6";\n}',
    tags: ['形式3', '最大フロー', 'ネットワークフロー', '有向グラフ', 'Ford-Fulkerson', 'レイアウト']
  },

  // --- 構文形式 ---
  {
    id: 'graph-mst-undirected',
    name: '形式4: 無向重み付きグラフと最小全域木（MST / Kruskal）',
    category: '構文形式',
    description: 'クラスカル法やプリム法で探索される最小全域木（MST: Minimum Spanning Tree）。選ばれた辺をハイライト表示。',
    code: '\\graph{\n  title: "最小全域木 (Minimum Spanning Tree / Kruskal)";\n  subtitle: "全頂点を連結するコスト最小の木 (重み合計: 16)";\n  type: undirected;\n\n  node A (120, 80) "A";\n  node B (300, 80) "B";\n  node C (480, 80) "C";\n  node D (120, 240) "D";\n  node E (300, 240) "E";\n  node F (480, 240) "F";\n\n  A -- B : 4 [highlight];\n  B -- C : 8;\n  A -- D : 2 [highlight];\n  B -- E : 7;\n  C -- F : 5 [highlight];\n  D -- E : 3 [highlight];\n  E -- F : 2 [highlight];\n  B -- D : 6;\n}',
    tags: ['形式4', '最小全域木', 'MST', '無向グラフ', 'クラスカル法', 'プリム法', '離散数学', '構文形式']
  },
  {
    id: 'graph-macro-curved-cycle',
    name: '形式5: LaTeX 独自マクロ曲線・相互有向グラフ構文（\\graph / bend）',
    category: '構文形式',
    description: 'bend（曲線エッジ）や両方向遷移、パス一括指定（path:）を用いて循環サイクルを記述する標準構文。',
    code: '\\graph{\n  title: "相互循環グラフとフィードバックループ構文";\n  subtitle: "bend（曲線エッジ）による双方向遷移とハイライトパス指定";\n  type: directed;\n\n  node A (120, 160) "状態 A";\n  node B (300, 70) "状態 B";\n  node C (480, 160) "状態 C";\n  node D (300, 250) "状態 D";\n\n  A -> B : "遷移 1" [highlight];\n  B -> C : "遷移 2" [highlight];\n  C -> D : "遷移 3" [highlight];\n  D -> A : "ループ帰還" [highlight];\n  A -> C : "直通ショートカット" [dashed];\n  B -> D : "下方制御" [bend: 20];\n  D -> B : "上方フィードバック" [bend: 20];\n}',
    tags: ['形式5', 'graph', 'マクロ', '標準', '独自構文', 'bend', '曲線', 'サイクル', '構文形式', '構文']
  }
];

// ==========================================
// ベン図 (Venn Diagram / 集合・重複) ライブラリ プリセットデータ
// ==========================================
const vennLibrary = [
  // --- レイアウト ---
  {
    id: 'venn-set-intersection',
    name: '形式1: 2集合ベン図（2円 / A ∩ B・共通部分と差集合）',
    category: 'レイアウト',
    description: '2つの集合 A と B の要素分布と、交差する共通部分（積集合 A ∩ B）を鮮やかにハイライトした最も基本的な2円ベン図。',
    code: '\\venn{\n  title: "集合の共通部分 (A ∩ B) と和集合";\n  subtitle: "偶数と3の倍数の重複（6の倍数）";\n\n  set A "集合 A (偶数)" [color: #3b82f6];\n  set B "集合 B (3の倍数)" [color: #10b981];\n\n  A: "2, 4, 8, 10, 14";\n  B: "3, 9, 15, 21";\n  AB: "6, 12, 18\\n(A ∩ B)" [highlight];\n}',
    tags: ['2円', '2集合', '共通部分', '積集合', '数学', 'レイアウト']
  },
  {
    id: 'venn-pdm-skills',
    name: '形式2: 3集合ベン図（3円 / プロダクト開発の交差領域）',
    category: 'レイアウト',
    description: 'エンジニアリング・デザイン・ビジネスの3つの専門領域の交差から生まれる役割と、中心のプロダクトマネージャー(PdM)を示す3円ベン図。',
    code: '\\venn{\n  title: "プロダクト開発の交差領域 (3円ベン図)";\n  subtitle: "エンジニアリング・デザイン・ビジネスの融合";\n\n  set A "エンジニアリング" [color: #3b82f6];\n  set B "デザイン" [color: #f43f5e];\n  set C "ビジネス" [color: #10b981];\n\n  A: "実装技術, システム設計";\n  B: "UI/UX, ユーザーリサーチ";\n  C: "収益性, マーケティング";\n\n  AB: "デザインエンジニア";\n  BC: "サービスデザイナー";\n  CA: "テックリード / 創業";\n\n  ABC: "プロダクトマネージャー (PdM)" [highlight];\n}',
    tags: ['3円', '3集合', '交差領域', 'PdM', 'ビジネス', 'レイアウト']
  },
  {
    id: 'venn-dx-four-sets',
    name: '形式3: 4集合ベン図（4楕円 / デジタルトランスフォーメーションの4要素）',
    category: 'レイアウト',
    description: '戦略・組織文化・技術基盤・データ利活用の4領域の重なりと、全要素が融合した「真のDX成功」を示す対称4楕円ベン図。',
    code: '\\venn{\n  title: "デジタルトランスフォーメーション (4集合ベン図)";\n  subtitle: "戦略・組織・技術・データの全方位統合";\n\n  set A "戦略 (Strategy)" [color: #3b82f6];\n  set B "組織・文化 (People)" [color: #f43f5e];\n  set C "技術基盤 (Technology)" [color: #10b981];\n  set D "データ活用 (Data)" [color: #f59e0b];\n\n  A: "経営ビジョン";\n  B: "アジャイル組織";\n  C: "クラウド・API";\n  D: "BI・データ基盤";\n\n  AB: "チェンジマネジメント";\n  CD: "MLOps・AI基盤";\n  BC: "DevOps・内製化";\n  AD: "データ駆動経営";\n  AC: "エンタープライズIT";\n  BD: "データ利活用人材";\n\n  ABCD: "真のDX成功" [highlight];\n}',
    tags: ['4集合', '4楕円', '4円', 'DX', 'ビジネス', 'レイアウト']
  },

  // --- 構文形式 ---
  {
    id: 'venn-latex-package',
    name: '形式4: LaTeX venndiagram パッケージ構文（\\begin{venndiagram2sets}）',
    category: '構文形式',
    description: 'LaTeXのvenndiagramパッケージ構文（\\begin{venndiagram2sets}、\\fillACapB）で記述する学術・論文標準の2集合共通部分。',
    code: '% title: 2集合の共通部分 (LaTeX venndiagram)\n\\begin{venndiagram2sets}[labelA={事象 A}, labelB={事象 B}, labelOnlyA={Aのみ}, labelOnlyB={Bのみ}, labelOnlyAB={積集合 A ∩ B}]\n  \\fillACapB\n\\end{venndiagram2sets}',
    tags: ['venndiagram', 'LaTeX', '学術', '数学', '共通部分', '構文形式', '構文']
  },
  {
    id: 'venn-macro-standard',
    name: '形式5: LaTeX 独自マクロ標準構文（\\venndiagram）',
    category: '構文形式',
    description: '集合名、各領域の要素、ハイライトを直感的に定義するPhysiNote標準の\\venndiagramマクロ構文。',
    code: '\\venndiagram{\n  title: "3集合の相互連携マクロ構文 (venndiagram)";\n  subtitle: "標準マクロ記法による集合・共通領域の定義";\n\n  set A "エンジニアリング" [color: #3b82f6];\n  set B "デザイン" [color: #f43f5e];\n  set C "ビジネス" [color: #10b981];\n\n  only A: "システム設計・実装";\n  only B: "UI/UX・ビジュアル";\n  only C: "事業計画・マーケ";\n\n  intersect A, B: "デザインエンジニア";\n  intersect B, C: "サービスデザイナー";\n  intersect A, C: "プロダクトマネージャー";\n  intersect A, B, C: "革新製品の創出" [highlight];\n}',
    tags: ['venndiagram', 'LaTeX', 'マクロ', '標準', '独自構文', '構文形式', '構文']
  }
];

// ==========================================
// フィッシュボーン図 (特性要因図 / イシカワ) ライブラリ プリセットデータ
// ==========================================
const fishboneLibrary = [
  // --- レイアウト ---
  {
    id: 'fishbone-manufacturing-4m',
    name: '形式1: クラシック線画型（Standard / 斜め大骨・中骨ライン・製造4M分析）',
    category: 'レイアウト',
    description: '工場ラインの不良品発生原因を 4M（人・機械・方法・材料）の観点から深掘りし、根本原因をハイライトした定番QC手法の線画レイアウト。',
    code: '\\fishbone{\n  type: standard;\n  title: "製造ライン 製品寸法不良の特性要因図 (4M分析)";\n  subtitle: "不良率5%削減に向けた原因追究と重要要因の抽出";\n  effect: "製品寸法不良の多発";\n\n  "人 (Man)": "手順書の読み飛ばし", "熟練者の退職・勘依存" [highlight], "長時間の集中力低下";\n  "機械 (Machine)": "刃具の摩耗放置" [highlight], "定期キャリブレーション漏れ", "冷却機構の温度ムラ";\n  "方法 (Method)": "段取り替え手順の曖昧さ", "寸法測定サンプリング不足";\n  "材料 (Material)": "素材ロットごとの硬度ばらつき", "保管倉庫の湿度管理不備";\n}',
    tags: ['QCサークル', '4M', '製造業', '特性要因図', 'フィッシュボーン', '線画', 'レイアウト']
  },
  {
    id: 'fishbone-hierarchical-org',
    name: '形式2: 階層サブボックス型（Hierarchical / 円形ヘッド・組織根本原因分析）',
    category: 'レイアウト',
    description: '中央背骨の結合リング、右端の円形課題ヘッド、およびサブボックスと小骨箇条書きリストを備えた多階層根本原因分析レイアウト。',
    code: '\\fishbone{\n  type: hierarchical;\n  title: "従業員の生産性低下 根本原因フィッシュボーン図";\n  effect: "従業員の生産性の低下";\n\n  category "組織構造" [top, color: #0284c7]:\n    "役割と責任が不明確" ["職務の説明が曖昧", "職務の重複"],\n    "コミュニケーション チャネルが非効率" ["情報フローの遅延", "誤った解釈"],\n    "不適切な意思決定プロセス" ["承認が遅い", "権限レベルが不明確"];\n\n  category "業務環境" [top, color: #0284c7]:\n    "職場の状況が悪い" ["照明と換気が不十分", "使いにくいオフィス家具"],\n    "必要なツールとリソースの不足" ["不十分なソフトウェアツール", "重要情報へのアクセス制限"],\n    "ネガティブな企業文化" ["士気の低下", "チームワークの欠如"];\n\n  category "従業員要因" [bottom, color: #0284c7]:\n    "トレーニングと育成が不十分" ["古いスキル", "キャリアアップ機会の欠如"],\n    "仕事の満足度が低い" ["評価の欠如", "コミュニケーション不足"],\n    "個人的な問題" ["健康上の問題", "家庭の責任"];\n\n  category "管理慣行" [bottom, color: #0284c7]:\n    "リーダーシップと監督が不十分" ["ガイダンスの欠如", "一貫性のないフィードバック"],\n    "非効率な業績評価" ["偏った評価", "レビューが少ない"],\n    "戦略的方向性の欠如" ["不明確な目標", "目標の不一致"];\n}',
    tags: ['根本原因', '階層', 'サブボックス', '小骨', '組織', '業務改善', 'レイアウト']
  },
  {
    id: 'fishbone-pill-modern',
    name: '形式3: モダンピル・カード型（Pill / 角丸ピルバッジ・太矢印・ITプロジェクト）',
    category: 'レイアウト',
    description: '太い矢印の背骨・大骨と、角丸ピル形状の要因バッジカード、番号インジケータを備えたモダンなカード型レイアウト。',
    code: '\\fishbone{\n  type: pill;\n  title: "ソフトウェアリリース遅延 特性要因図 (モダンピル型)";\n  subtitle: "納期遅延の根本原因（人・プロセス・環境・要件）の分析";\n  effect: "リリース遅延 (納期超過)";\n\n  category "人 (People)" [top, color: #6366f1]:\n    "特定メンバーへの過度な依存" [highlight], "知識共有の不足", "過密日程による疲弊";\n\n  category "プロセス (Process)" [top, color: #6366f1]:\n    "コードレビューの形骸化", "手動リグレッションの肥大化";\n\n  category "技術・ツール (Tool)" [bottom, color: #6366f1]:\n    "CI/CDパイプライン不安定", "レガシー負債・密結合" [highlight];\n\n  category "要件 (Requirement)" [bottom, color: #6366f1]:\n    "仕様追加・肥大化" [highlight], "受入基準(DoD)の曖昧さ";\n}',
    tags: ['モダン', 'ピル', 'カード', '矢印', 'ソフトウェア', 'アジャイル', 'レイアウト']
  },

  // --- 構文形式 ---
  {
    id: 'fishbone-latex-tikz',
    name: '形式4: LaTeX TikZ ネイティブ 特性要因図構文（\\begin{tikzpicture}）',
    category: '構文形式',
    description: 'LaTeXのTikZ環境（\\begin{tikzpicture}）内で特性（effect）と各要因を定義する学術・論文標準の構文形式。',
    code: '\\begin{tikzpicture}\n  % fishbone\n  title: "製品寸法不良の特性要因図 (TikZ)";\n  effect: "製品寸法不良の多発";\n\n  "人 (Man)": "手順書の読み飛ばし", "熟練者の退職・勘依存" [highlight];\n  "機械 (Machine)": "刃具の摩耗放置" [highlight], "定期キャリブレーション漏れ";\n  "方法 (Method)": "段取り替え手順の曖昧さ", "寸法測定サンプリング不足";\n  "材料 (Material)": "素材ロットごとの硬度ばらつき", "保管倉庫の湿度管理不備";\n\\end{tikzpicture}',
    tags: ['TikZ', 'LaTeX', '特性要因図', 'フィッシュボーン', '4M', '学術', '構文形式', '構文']
  },
  {
    id: 'fishbone-macro-standard',
    name: '形式5: LaTeX 独自マクロ標準構文（\\fishbone）',
    category: '構文形式',
    description: 'タイトル、効果、カテゴリ別の要因一覧をセミコロン区切りで指定するPhysiNote標準の\\fishboneマクロ構文。',
    code: '\\fishbone{\n  title: "SaaS顧客解約率 (Churn Rate) 悪化要因分析";\n  subtitle: "月次解約率3%以下への改善に向けた課題整理";\n  effect: "解約率の急激な悪化";\n\n  "オンボーディング": "初期設定の複雑さ", "導入ガイドの不足" [highlight];\n  "プロダクト": "キラー機能のUI分かりにくさ", "レスポンス遅延・バグ頻発";\n  "価格・プラン": "他社競合の低価格プラン攻勢", "ROI（費用対効果）の実感不足" [highlight];\n  "サポート体制": "問い合わせ回答までのリードタイム", "CS担当のリソース不足";\n}',
    tags: ['fishbone', 'マクロ', '標準', '独自構文', 'SaaS', 'マーケティング', '構文形式', '構文']
  }
];

// ==========================================
// SWOT分析マトリクス プリセットライブラリ
// ==========================================
const swotLibrary = [
  {
    id: 'swot-layout-card',
    name: '形式1: カードリスト型（Card / 箇条書きカード・内部外部環境マップ）',
    category: 'レイアウト',
    description: '内部環境（強み・弱み）と外部環境（機会・脅威）を4枚のカードとして独立配置し、詳細な箇条書きを整理する標準レイアウト。',
    code: '\\swot{\n  type: card;\n  title: "新規事業 SWOT分析マトリクス";\n  subtitle: "事業戦略策定・市場機会とリスクの可視化";\n\n  // 強み (Strengths)\n  strengths:\n    "業界特化の独自AIアルゴリズム" [highlight],\n    "俊敏な開発体制と迅速な改善サイクル",\n    "既存顧客からの高い継続利用率";\n\n  // 弱み (Weaknesses)\n  weaknesses:\n    "ブランド知名度・市場認知の不足",\n    "営業・カスタマーサクセス体制の未整備" [highlight],\n    "リソースの分散リスク";\n\n  // 機会 (Opportunities)\n  opportunities:\n    "法改正・業務DX化に伴う需要急増" [highlight],\n    "中堅・中小企業層のクラウド導入障壁低下",\n    "API連携エコシステムの拡大";\n\n  // 脅威 (Threats)\n  threats:\n    "大手テック企業の同種機能追加・低価格化" [highlight],\n    "データセキュリティ規制の強化",\n    "急速なAI技術進化による機能陳腐化リスク";\n}',
    tags: ['SWOT', 'カード', 'マトリクス', '箇条書き', 'レイアウト', '戦略']
  },
  {
    id: 'swot-layout-tile',
    name: '形式2: 2×2 タイルブロック型（Tile / 密着ブロック・ウォーターマークS・W・O・T）',
    category: 'レイアウト',
    description: '上部にHelpful/Harmful、左側に行見出し（内部要因・外部要因）を配し、S・W・O・Tの巨大ウォーターマークを背景に持った密着2×2タイル形式。',
    code: '\\swot{\n  type: tile;\n  title: "SWOT ANALYSIS";\n\n  // 強み (Strengths)\n  strengths:\n    "高い技術力と独自特許" [highlight],\n    "高品質なサービス運営";\n\n  // 弱み (Weaknesses)\n  weaknesses:\n    "ブランド知名度の不足",\n    "営業体制の規模不足";\n\n  // 機会 (Opportunities)\n  opportunities:\n    "DX需要拡大による市場成長" [highlight],\n    "新興市場への参入余地";\n\n  // 脅威 (Threats)\n  threats:\n    "大手競合の低価格参入" [highlight],\n    "原材料コストの高騰";\n}',
    tags: ['SWOT', 'タイル', 'ブロック', '密着', 'ウォーターマーク', 'レイアウト', '2x2']
  }
];

// ==========================================
// ロードマップ図 (マイルストーン年表・タイムライン) プリセットライブラリ
// ==========================================
const roadmapLibrary = [
  {
    id: 'roadmap-timeline-saas',
    name: '形式1: ピン打ちタイムライン（Timeline / 時期ピン・箇条書き）',
    category: 'レイアウト',
    description: '横軸の上にピンを打ち、時期・マイルストーン・箇条書きアクションを上下交互に展開する基本形式。',
    code: '\\roadmap{\n  type: timeline;\n  title: "プロダクト開発ロードマップ 2026-2027";\n  subtitle: "コア機能検証からグローバル展開へのマイルストーン計画";\n  today: "2026 Q2";\n\n  "2026 Q1": "α版プロトタイプ検証" [done, above]\n    - 少数テスターへの限定公開\n    - コアアーキテクチャの性能検証;\n\n  "2026 Q2": "β版リリース・先行顧客導入" [current, below, #0284c7]\n    - UI/UXの大幅刷新\n    - フィードバック収集と高速改善;\n\n  "2026 Q3": "正式版 v1.0 クラウドローンチ" [planned, above, #10b981]\n    - エンタープライズ認証連携 (SSO)\n    - 99.9% SLA保証と決済基盤の統合;\n\n  "2026 Q4": "外部API公開 & エコシステム構築" [planned, below]\n    - 開発者ポータルとWebhook基盤\n    - サードパーティ連携マーケットプレイス;\n\n  "2027 Q1": "マルチリージョン展開 & グローバル提供" [planned, above, #8b5cf6]\n    - 北米・APAC拠点データセンター対応\n    - 多言語・多通貨ローカライズ;\n}',
    tags: ['タイムライン', 'マイルストーン', '年表', 'SaaS', 'ピン打ち', 'レイアウト']
  },
  {
    id: 'roadmap-chevron-phase',
    name: '形式2: フェーズ進行シェブロン型（Chevron / 山形矢印・下部ストリーム）',
    category: 'レイアウト',
    description: '山形プロセス矢印（シェブロン）でフェーズの推移を示し、上下に時期ピンと詳細、下部に全社推進ストリームを配置する形式。',
    code: '\\roadmap{\n  type: chevron;\n  title: "事業拡大 中期ロードマップ";\n  subtitle: "フェーズ別重点施策と全社生産体制の拡充計画";\n\n  // フェーズ山形ブロック (中央) と 上下ピン詳細\n  phase: "フェーズ1", "事業規模の拡大" [2022年, above, #3b82f6]\n    - 採用の強化\n    - 社内ルール構築;\n\n  phase: "フェーズ2", "営業利益200%増" [2024年, below, #6366f1]\n    - 各チーム目標達成\n    - 営業力強化\n    - マーケティング施策強化;\n\n  phase: "フェーズ3", "新事業展開" [2026年, above, #a855f7]\n    - 新サービスの開発\n    - プロモーション展開;\n\n  phase: "フェーズ4", "海外販路開拓" [2028年, below, #ec4899]\n    - 東南アジアでの販路開拓\n    - 海外向けプロモーション;\n\n  phase: "フェーズ5", "海外展開" [2030年, above, #f97316]\n    - 海外支社設立\n    - 現地採用;\n\n  // 下部ストリーム (複数フェーズにまたがる長期施策)\n  track: "生産体制の強化" [1 -> 2, #10b981];\n  track: "生産拠点拡大" [3 -> 5, #059669];\n}',
    tags: ['タイムライン', 'シェブロン', 'フェーズ', 'プロセス', '矢印', 'レイアウト']
  },
  {
    id: 'roadmap-chronosys-latex',
    name: '形式3: LaTeX chronosys 年表タイムライン（Chronosys）',
    category: '構文形式',
    description: 'LaTeXのchronosysパッケージ構文（\\startchronology、\\chronoperiod、\\chronoevent）で記述する年表・マイルストーンタイムライン。',
    code: '\\startchronology[startyear=2024,stopyear=2028]\n  % title: 中期事業展開 年表タイムライン (chronosys)\n  \\chronoperiod{2024}{2025}{国内基盤構築 & コア技術確立}\n  \\chronoevent[done]{2024}{プロトタイプ検証}\n  \\chronoevent[current, #0284c7]{2025}{β版ローンチ}\n  \\chronoperiod{2025}{2027}{エンタープライズ拡大 & API公開}\n  \\chronoevent{2026}{シリーズA資金調達}\n  \\chronoevent[#8b5cf6]{2027}{グローバル展開}\n\\stopchronology',
    tags: ['chronosys', 'LaTeX', 'タイムライン', '年表', 'マイルストーン', '構文形式', '構文']
  },
  {
    id: 'roadmap-smartdiagram-latex',
    name: '形式4: LaTeX smartdiagram プロセスシェブロン（Smartdiagram）',
    category: '構文形式',
    description: 'LaTeXのsmartdiagramパッケージ構文（\\smartdiagram[sequence diagram]{...}）で記述する山形フェーズ推移図。',
    code: '% title: 事業拡大 5段階フェーズ進行 (smartdiagram)\n\\smartdiagram[sequence diagram]{\n  企画・要件定義,\n  アーキテクチャ設計,\n  コア機能実装,\n  β版先行検証,\n  正式サービスローンチ\n}',
    tags: ['smartdiagram', 'LaTeX', 'シェブロン', 'フェーズ', 'プロセス', '構文形式', '構文']
  }
];

// ==========================================
// 光学系・実験系配置図 (Optics Diagram) ライブラリ プリセットデータ
// ==========================================
const opticsLibrary = [
  // --- レイアウト ---
  {
    id: 'optics-michelson-interferometer',
    name: '形式1: マイケルソン干渉計（干渉縞・精密計測直交配置）',
    category: 'レイアウト',
    description: 'レーザー光源からハーフミラーで分割し、固定ミラー・可動ミラーで反射させた2光束を再結合してスクリーン上に干渉縞を形成する直交光学系。',
    code: '\\optics{\n  title: "マイケルソン干渉計 (Michelson Interferometer)";\n  grid: true;\n  beam_color: #ef4444;\n\n  laser: L1 "He-Ne レーザー (632.8nm)" [x: 80, y: 220, color: #ef4444];\n  beamsplitter: BS "ハーフミラー (BS)" [x: 280, y: 220, angle: 45];\n  mirror: M1 "固定ミラー M1" [x: 280, y: 90, angle: 90];\n  mirror: M2 "可動ミラー M2" [x: 480, y: 220, angle: 0];\n  lens: L1 "結像レンズ" [x: 280, y: 320];\n  screen: S1 "干渉縞スクリーン" [x: 280, y: 410];\n\n  beam: L1 -> BS -> M2 -> BS -> L1 -> S1 [color: #ef4444];\n  beam: BS -> M1 -> BS [color: #ef4444];\n}',
    tags: ['形式1', 'マイケルソン干渉計', 'レーザー', 'ハーフミラー', '干渉縞', '精密計測', 'レイアウト']
  },
  {
    id: 'optics-michelson-morley-experiment',
    name: '形式2: マイケルソン・モーリーの実験（光路差・エーテル風検証配置）',
    category: 'レイアウト',
    description: '光源から半透明鏡で分割し、地球の公転速度による装置移動（aからa1）と反射鏡b・cを経て望遠鏡dへ到達する光路1（赤）と光路2（青）の検証配置。',
    code: '\\optics{\n  title: "マイケルソン・モーリーの実験 (エーテル風と光路差検証)";\n  grid: true;\n\n  source: S "光源 s" [x: 80, y: 320, color: #f59e0b];\n  beamsplitter: A "半透明鏡 a" [x: 240, y: 320, angle: 45];\n  beamsplitter: A1 "移動後 a₁" [x: 360, y: 320, angle: 45];\n  mirror: B "反射鏡 b" [x: 300, y: 80, angle: 90];\n  mirror: C "反射鏡 c" [x: 680, y: 320, angle: 0];\n  telescope: Tel "望遠鏡 d" [x: 360, y: 480, angle: 90];\n\n  beam: S -> A -> A1 -> C -> A1 -> Tel [color: #ef4444];\n  beam: A -> B -> A1 -> Tel [color: #3b82f6];\n}',
    tags: ['形式2', 'マイケルソン・モーリー', 'エーテル', '光速', '半透明鏡', '反射鏡', '望遠鏡', '相対性理論', 'レイアウト']
  },

  // --- 構文形式 ---
  {
    id: 'optics-young-double-slit',
    name: '形式3: ヤングの干渉実験（1次元リニア波動光学構文）',
    category: '構文形式',
    description: 'ピンホールと二重スリットを直線上に配置し、光の波動性とスクリーン上の等間隔明暗縞を観察するリニアインライン構文。',
    code: '\\optics{\n  title: "ヤングの干渉実験 (二重スリットと波動光学)";\n  grid: true;\n  beam_color: #10b981;\n\n  "半導体レーザー (532nm)" -> "ピンホール (アパーチャ)" -> "二重スリット" -> "干渉縞スクリーン";\n}',
    tags: ['形式3', 'ヤングの実験', '二重スリット', '波動光学', '回折', '干渉', '構文形式', '構文']
  },
  {
    id: 'optics-malus-polarization',
    name: '形式4: マリスの法則 偏光測定系（直線・円偏光素子連鎖構文）',
    category: '構文形式',
    description: 'レーザー光から偏光子、波長板、検光子を経てディテクタに至る偏光状態制御・透過光量測定の直線配置構文。',
    code: '\\optics{\n  title: "マリスの法則 偏光透過率測定系";\n  grid: true;\n  beam_color: #ef4444;\n\n  "He-Ne レーザー" -> "偏光子 (ポラライザ)" -> "1/4波長板 (QWP)" -> "検光子 (アナライザ)" -> "光ディテクタ (PD)";\n}',
    tags: ['形式4', 'マリスの法則', '偏光', '波長板', '検光子', '光検出器', '構文形式', '構文']
  }
];

// ==========================================
// 結晶構造・格子モデル ライブラリ定義 (固体物理・材料科学)
// ==========================================
const crystalLibrary = [
  {
    id: 'crystal-fcc',
    name: '面心立方格子 (FCC / Cu, Al, Au)',
    category: '3次元単位胞',
    description: '立方体の各頂点と各面の中心に原子が位置する代表的金属結晶構造（充填率74%・配位数12）。',
    code: '\\crystal{\n  type: fcc\n  title: "面心立方格子 (FCC: Cu, Al, Au)"\n  lattice: cubic\n}',
    tags: ['FCC', '面心立方', '金属結晶', '固体物理', 'ブラベ格子', '最密充填']
  },
  {
    id: 'crystal-bcc',
    name: '体心立方格子 (BCC / Fe, Cr, W)',
    category: '3次元単位胞',
    description: '立方体の各頂点と立方体の中心に原子が位置する結晶構造（充填率68%・配位数8）。',
    code: '\\crystal{\n  type: bcc\n  title: "体心立方格子 (BCC: α-Fe, Cr, W)"\n  lattice: cubic\n}',
    tags: ['BCC', '体心立方', '鉄', '金属結晶', '固体物理', 'ブラベ格子']
  },
  {
    id: 'crystal-sc',
    name: '単純立方格子 (Simple Cubic / α-Po)',
    category: '3次元単位胞',
    description: '立方体の8つの頂点のみに原子が位置する最も基本的な立方晶系格子（充填率52%・配位数6）。',
    code: '\\crystal{\n  type: sc\n  title: "単純立方格子 (Simple Cubic: SC)"\n  lattice: cubic\n}',
    tags: ['SC', '単純立方', 'ポロニウム', '固体物理', 'ブラベ格子']
  },
  {
    id: 'crystal-nacl',
    name: '塩化ナトリウム型構造 (NaCl / 岩塩型)',
    category: 'イオン結晶',
    description: 'Na+とCl-がそれぞれ面心立方格子を形成し、互いに1/2周期ずれて入り組んだ代表的イオン結晶。',
    code: '\\crystal{\n  type: nacl\n  title: "塩化ナトリウム型構造 (NaCl / 岩塩型)"\n}',
    tags: ['NaCl', '岩塩型', 'イオン結晶', '食塩', '固体物理']
  },
  {
    id: 'crystal-diamond',
    name: 'ダイヤモンド構造 (Diamond / Si, Ge)',
    category: '半導体・共有結合',
    description: 'FCC格子の内部に4つの原子が四面体配位した構造。シリコンやゲルマニウムなど半導体の基本骨格。',
    code: '\\crystal{\n  type: diamond\n  title: "ダイヤモンド構造 (Diamond / Si, Ge)"\n}',
    tags: ['ダイヤモンド', 'シリコン', '半導体', '四面体配位', '共有結合結晶']
  },
  {
    id: 'crystal-perovskite',
    name: 'ペロブスカイト型構造 (Perovskite: BaTiO₃)',
    category: '機能性セラミックス',
    description: '強誘電体や太陽電池材料として重要なABO3型酸化物結晶構造。Baが頂点、Tiが体心、Oが面心。',
    code: '\\crystal{\n  type: perovskite\n  title: "ペロブスカイト型構造 (BaTiO₃ / CaTiO₃)"\n}',
    tags: ['ペロブスカイト', 'BaTiO3', '強誘電体', '太陽電池', 'セラミックス']
  },
  {
    id: 'crystal-miller-plane',
    name: 'ミラー指数と格子面 (111面)',
    category: '結晶面・回折',
    description: '結晶格子の特定の劈開面やX線回折反射面を表すミラー指数 (h k l) の可視化。',
    code: '\\crystal{\n  type: fcc\n  title: "面心立方格子の (1 1 1) 格子面"\n  plane: (1, 1, 1)\n}',
    tags: ['ミラー指数', '結晶面', '111面', 'X線回折', 'ブラッグ反射']
  },
  {
    id: 'crystal-graphene',
    name: 'グラフェン / 蜂の巣格子 (Honeycomb)',
    category: '2次元格子',
    description: '炭素原子がsp2混成軌道で六角形ネットワークを形成した2次元物質の代名詞。ディラック電子を生む。',
    code: '\\crystal{\n  type: graphene\n  title: "グラフェン (蜂の巣格子 / Honeycomb)"\n  rows: 4\n  cols: 4\n}',
    tags: ['グラフェン', '蜂の巣格子', '2次元物質', 'ディラックコーン', '物性物理']
  },
  {
    id: 'crystal-kagome',
    name: 'カゴメ格子 (Kagome Lattice)',
    category: '2次元格子',
    description: '正三角形と正六角形が頂点を共有して敷き詰められた幾何学的フラストレーション格子。',
    code: '\\crystal{\n  type: kagome\n  title: "カゴメ格子 (Kagome Lattice: スピン液体)"\n  rows: 3\n  cols: 3\n}',
    tags: ['カゴメ格子', '幾何学的フラストレーション', '量子スピン液体', 'フラットバンド']
  },
  {
    id: 'crystal-bcc-slice',
    name: '体心立方格子 (断面・充填モデル / 1/8個・1個)',
    category: '単位格子スライス・充填モデル',
    description: '単位格子内の原子の分割状態（頂点の1/8個×8 ＋ 中心の完全球1個 ＝ 計2個）を可視化した定番モデル図。',
    code: '\\crystal{\n  type: bcc-slice\n  title: "体心立方格子 (BCC) 単位格子充填・分割モデル"\n  mode: slice\n}',
    tags: ['BCC', '体心立方', '充填モデル', 'スライスカット', '1/8個', '1個', '高校化学', '固体物理']
  },
  {
    id: 'crystal-fcc-slice',
    name: '面心立方格子 (断面・充填モデル / 1/8個・1/2個)',
    category: '単位格子スライス・充填モデル',
    description: '単位格子内の原子の分割状態（頂点の1/8個×8 ＋ 各面心の1/2個×6 ＝ 計4個）を可視化した最密充填モデル図。',
    code: '\\crystal{\n  type: fcc-slice\n  title: "面心立方格子 (FCC) 単位格子充填・分割モデル"\n  mode: slice\n}',
    tags: ['FCC', '面心立方', '充填モデル', 'スライスカット', '1/8個', '1/2個', '最密充填', '高校化学']
  },
  {
    id: 'crystal-hcp-slice',
    name: '六方最密構造 (断面・充填モデル / 1/6個・1/2個)',
    category: '単位格子スライス・充填モデル',
    description: '六角柱単位格子内の原子の分割状態（頂点の1/6個 ＋ 面心の1/2個 ＋ 内部球）を可視化した最密充填モデル図。',
    code: '\\crystal{\n  type: hcp-slice\n  title: "六方最密構造 (HCP) 充填・分割モデル"\n  mode: slice\n}',
    tags: ['HCP', '六方最密', '充填モデル', 'スライスカット', '1/6個', '1/2個', 'あわせて1個', '高校化学']
  }
];

// ==========================================
// 汎用シナリオ・概念図 (フリーフロー図) プリセット定義
// ==========================================
const scenarioLibrary = [
  {
    id: 'scenario-credential-stuffing',
    name: 'パスワードリスト攻撃 (1対N 分岐・拡散フロー)',
    category: 'サイバー攻撃・脅威',
    description: '1箇所の脆弱なサイトから漏洩したID・パスワードを悪用し、EC・金融・SNS等へ横展開して不正ログインを試みる攻撃シナリオ図。',
    code: '\\scenario{\n  title: "パスワードリスト攻撃シナリオ (アカウント使い回しの脅威)"\n  theme: dark\n  icon: "🥷"\n\n  source: "【漏洩元：サイトA】\\n(セキュリティの甘いサービス)"\n  note: "▼ システムの不備からID・パスワードが流出\\n[ ID: user@example.com / PW: Secret123! ]"\n\n  fork:\n    -> "【サイトB (ECサイト)】"   -> "ログイン成功 (登録カードで不正購入)" [warn]\n    -> "【サイトC (金融機関)】"   -> "ログイン成功 (不正送金リスク)" [danger]\n    -> "【サイトD (SNS)】"       -> "ログイン成功 (アカウント乗っ取り・なりすまし)" [warn]\n}',
    tags: ['サイバー攻撃', 'パスワードリスト攻撃', 'ハッカー', '漏洩', '脅威シナリオ', 'セキュリティ']
  },
  {
    id: 'scenario-data-profiling',
    name: '複数漏洩源からの名寄せ・プロファイリング (N対1 集約フロー)',
    category: 'データ統合・脅威分析',
    description: '通販、転職、医療、証券、遺伝子、SNS等の漏洩データを、共通するメアド・携帯電話番号で名寄せ突合し完全な個人プロファイルが復元される脅威モデル図。',
    code: '\\scenario{\n  title: "複数流出データの名寄せ・プロファイリング統合の脅威"\n  theme: dark\n  icon: "🔍"\n  layout: merge\n\n  sources:\n    - "【漏洩元A：EC通販サイト】\\n[ メールアドレス ]\\n[ 携帯電話番号 ]\\n[ 氏名・自宅住所・クレジットカード ]"\n    - "【漏洩元B：転職・就活サイト】\\n[ メールアドレス ]\\n[ 携帯電話番号 ]\\n[ 勤務先企業名・年収・職歴 ]"\n    - "【漏洩元C：医療機関・薬局】\\n[ メールアドレス ]\\n[ 携帯電話番号 ]\\n[ 通院歴・病歴・処方薬データ ]" [danger]\n    - "【漏洩元D：証券・金融口座】\\n[ メールアドレス ]\\n[ 携帯電話番号 ]\\n[ 資産状況・口座残高・取引履歴 ]" [danger]\n    - "【漏洩元E：遺伝子解析サービス】\\n[ メールアドレス ]\\n[ 携帯電話番号 ]\\n[ DNA配列・遺伝的疾患リスク ]" [danger]\n    - "【漏洩元F：SNS・マッチング】\\n[ メールアドレス ]\\n[ 携帯電話番号 ]\\n[ 顔写真・交友関係・位置情報 ]"\n\n  merge: "【名寄せ処理エンジン】\\n(メールアドレス・携帯電話番号をキーに自動突合)"\n  target: "【 統合された完全個人プロファイル 】\\n・共通キー：メールアドレス、携帯電話番号\\n・基本情報：氏名、自宅住所、顔写真、交友関係\\n・経済情報：勤務先、年収、資産状況、口座残高\\n・機微情報：通院歴、病歴、遺伝的リスク(DNA)\\n⇒ 恐喝、標的型サイバー攻撃、なりすまし犯罪への悪用" [danger]\n}',
    tags: ['名寄せ', 'プロファイリング', 'データ統合', '個人情報', '流出', '分析', '脅威']
  },
  {
    id: 'scenario-phishing-flow',
    name: 'フィッシング詐欺と不正送金フロー',
    category: 'サイバー攻撃・脅威',
    description: 'SMS/メールの偽通知から偽ログイン画面へ誘導し、ワンタイムパスワードを窃取して不正送金に至るステップ図。',
    code: '\\scenario{\n  title: "スミッシング・フィッシング不正送金フロー"\n  theme: dark\n  icon: "🎣"\n\n  source: "【攻撃者：偽SMS配信】\\n「重要：口座が凍結されました」"\n  note: "▼ 記載された短縮URLをクリック\\n[ 被害者が偽ログイン画面へアクセス ]"\n\n  fork:\n    -> "【偽フィッシングサイト】" -> "ID・パスワード・OTPをリアルタイム窃取" [danger]\n    -> "【本物オンラインバンキング】" -> "攻撃者が即座に代理ログインし不正送金実行" [danger]\n}',
    tags: ['フィッシング', 'スミッシング', 'OTP窃取', '不正送金', 'ソーシャルエンジニアリング']
  },
  {
    id: 'scenario-event-driven',
    name: 'イベント駆動・マイクロサービス並行連携',
    category: 'IT・システムアーキテクチャ',
    description: 'ユーザーの注文確定イベントを起点として、決済・在庫引落・配送手配・通知サービスへ並行配信するシステム連携図。',
    code: '\\scenario{\n  title: "イベント駆動・マイクロサービス並行配信アーキテクチャ"\n  theme: light\n  icon: "⚡"\n\n  source: "【注文受付サービス】\\n(POST /api/orders)" [info]\n  note: "▼ メッセージブローカーへ発行 (Event: OrderPlaced)\\n[ Payload: orderId, userId, items, amount ]"\n\n  fork:\n    -> "【決済サービス (Stripe)】" -> "クレジットカード即時決済完了" [success]\n    -> "【在庫管理サービス】"     -> "引当処理 & 倉庫ピッキング指示" [info]\n    -> "【通知サービス (Email/Push)】" -> "購入完了メール & レシート自動送信" [success]\n}',
    tags: ['イベント駆動', 'マイクロサービス', 'PubSub', 'メッセージング', '業務フロー', 'システム設計']
  }
];

// ==========================================
// テンソルネットワーク図 / ペンローズ記法 ライブラリデータ (量子情報・物性物理・テンソル解析)
// ==========================================
const tensorLibrary = [
  {
    id: 'tensor-basic-ranks',
    name: '形式1: 階数別基本テンソル (Rank 0〜4 / ペンローズ記法)',
    category: 'ペンローズ記法・基本階数',
    description: 'スカラー(0階)・ベクトル(1階)・行列(2階)・3階テンソル・4階テンソルの幾何学的グラフ表現。足(Leg)の数が階数を表す。',
    code: '\\tensornetwork{\n  type: basic\n  title: "ペンローズのグラフ記法: 階数別基本テンソル (Rank 0〜4)"\n  theme: dark\n}',
    tags: ['形式1', 'ペンローズ記法', '階数', 'スカラー', 'ベクトル', '行列', 'テンソル', '基本']
  },
  {
    id: 'tensor-contractions',
    name: '形式2: テンソル縮約・演算 (内積・行列積・トレース環)',
    category: 'テンソル縮約・代数演算',
    description: 'ベクトルの内積(⟨u|v⟩)、行列積(C=AB)、トレース(Tr(A))の縮約表現。ボンドによるインデックス和の可視化。',
    code: '\\tensornetwork{\n  type: contraction\n  title: "テンソル縮約・演算 (内積・行列積・トレース)"\n  theme: dark\n}',
    tags: ['形式2', 'テンソル縮約', '内積', '行列積', 'トレース', 'アインシュタイン縮約', '閉路']
  },
  {
    id: 'tensor-svd',
    name: '形式3: 特異値分解 (SVD: M = U S V†) と低ランク近似',
    category: 'テンソル分解・圧縮',
    description: '巨大行列・結合テンソルをSVDで直交テンソルU, V†と特異値対角Sに分解し、ボンド次元を圧縮する基本操作。',
    code: '\\tensornetwork{\n  type: svd\n  title: "特異値分解 (SVD: Singular Value Decomposition) と低ランク近似"\n  theme: dark\n}',
    tags: ['形式3', 'SVD', '特異値分解', '低ランク近似', 'エンタングルメント切断', 'DMRG']
  },
  {
    id: 'tensor-mps',
    name: '形式4: 行列積状態 (MPS: Matrix Product State - 1D多体系)',
    category: '1次元量子多体系',
    description: '1次元スピン鎖の基底状態を表す面積則テンソルネットワーク。水平ボンド次元χと垂直物理足dによる多体波動関数。',
    code: '\\tensornetwork{\n  type: mps\n  title: "行列積状態 (MPS: Matrix Product State - 1D多体系)"\n  theme: dark\n  sites: 5\n  bond: "χ"\n  phys: "d"\n  label: "A"\n}',
    tags: ['形式4', 'MPS', '行列積状態', '1次元スピン鎖', 'DMRG', '面積則', 'ボンド次元', '量子多体系']
  },
  {
    id: 'tensor-peps',
    name: '形式5: 射影エンタングルドペア状態 (PEPS - 2D量子格子)',
    category: '2次元量子多体系',
    description: '2次元格子系（高温超伝導・量子スピン液体）を記述するテンソルネットワーク。4つの仮想ボンドと1つの物理足。',
    code: '\\tensornetwork{\n  type: peps\n  title: "射影エンタングルドペア状態 (PEPS: Projected Entangled Pair State - 2D)"\n  theme: dark\n}',
    tags: ['形式5', 'PEPS', '2次元', '射影エンタングルドペア', '高温超伝導', '量子磁性体', '強相関']
  },
  {
    id: 'tensor-ttn',
    name: '形式6: 木状テンソルネットワーク (TTN / Tree Tensor Network)',
    category: '階層型テンソル',
    description: '二分木構造でスケール変換と階層的エンタングルメントを表現。ループがなく厳密縮約が可能なツリーモデル。',
    code: '\\tensornetwork{\n  type: ttn\n  title: "木状テンソルネットワーク (TTN: Tree Tensor Network)"\n  theme: dark\n}',
    tags: ['形式6', 'TTN', '木状テンソル', '二分木', '階層構造', '量子化学', 'ツリーネットワーク']
  },
  {
    id: 'tensor-mera',
    name: '形式7: 多重位相反転繰り込み群 (MERA / 量子臨界現象)',
    category: '臨界現象・AdS/CFT',
    description: '等長射影wと局所もつれ除去uを交互に配置し、スケール不変・長距離エンタングルメント（AdS/CFT対応）を幾何学化。',
    code: '\\tensornetwork{\n  type: mera\n  title: "多重位相反転繰り込み群 (MERA: Multi-scale Entanglement Renormalization)"\n  theme: dark\n}',
    tags: ['形式7', 'MERA', '繰り込み群', '等長射影', 'ディスエンタングラー', 'AdS/CFT', 'ホログラフィー']
  },
  {
    id: 'tensor-quantum-circuit',
    name: '形式8: 量子回路とテンソルネットワーク表現 (Quantum Gates)',
    category: '量子情報・量子回路',
    description: '1量子ビットHadamardゲート、2量子ビットCNOTゲート、汎用ユニタリ行列Uのテンソル結線・縮約表現。',
    code: '\\tensornetwork{\n  type: quantum\n  title: "量子回路とテンソルネットワーク表現 (Quantum Circuit Contraction)"\n  theme: dark\n}',
    tags: ['形式8', '量子回路', '量子ゲート', 'CNOT', 'ユニタリ行列', '量子ビット', '縮約']
  }
];

// ==========================================
// グラフ・統計チャート ライブラリデータ (棒・折れ線・円・複合・LaTeX chart系)
// ==========================================
const chartLibrary = [
  {
    id: 'chart-vertical-bar',
    name: '形式1: 縦棒グラフ (四半期別売上・複数系列比較)',
    category: '棒グラフ',
    description: '四半期ごとの売上高を前年対比（2025年度・2026年度）で比較表示する標準的な縦棒グループチャート。',
    code: '\\chart{\n  type: bar\n  title: "四半期別 売上高推移 (前年同期比)"\n  theme: light\n  unit: "百万円"\n  categories: "第1四半期", "第2四半期", "第3四半期", "第4四半期"\n  series: "2025年度", 120, 150, 180, 210, #0284c7\n  series: "2026年度", 140, 175, 205, 250, #059669\n}',
    tags: ['形式1', '棒グラフ', '縦棒', '売上', '比較', '四半期', 'ビジネス']
  },
  {
    id: 'chart-horizontal-bar',
    name: '形式2: 横棒グラフ (製品カテゴリ別 販売実績ランキング)',
    category: '棒グラフ',
    description: '項目名が長くても読みやすい横棒グラフ。製品ラインナップ別の年間販売数ランキングや達成度を一覧化。',
    code: '\\chart{\n  type: horizontal-bar\n  title: "製品カテゴリ別 年間販売実績ランキング"\n  theme: light\n  unit: "千台"\n  data: "クラウドサーバー", 85, #0284c7\n  data: "AI・分析ツール", 72, #059669\n  data: "セキュリティ製品", 58, #d97706\n  data: "モバイルデバイス", 45, #db2777\n  data: "周辺機器・その他", 28, #64748b\n}',
    tags: ['形式2', '横棒', 'バーチャート', 'ランキング', '製品別', '売上']
  },
  {
    id: 'chart-stacked-bar',
    name: '形式3: 積み上げ棒グラフ (コスト内訳推移・構成累積)',
    category: '棒グラフ',
    description: '開発費・マーケティング費・人件費などの推移を合計額と各要素の構成比で同時に可視化する積み上げ棒。',
    code: '\\chart{\n  type: stacked-bar\n  title: "四半期別 運用コスト内訳推移"\n  theme: light\n  unit: "万円"\n  categories: "1Q", "2Q", "3Q", "4Q"\n  series: "人件費", 400, 420, 430, 450, #0284c7\n  series: "開発・インフラ費", 200, 240, 260, 280, #059669\n  series: "マーケティング費", 150, 180, 210, 250, #d97706\n  series: "一般管理費", 80, 85, 90, 95, #db2777\n}',
    tags: ['形式3', '積み上げ棒', 'スタック', 'コスト', '構成比', '累積']
  },
  {
    id: 'chart-line',
    name: '形式4: 折れ線グラフ (月次KPI・アクセス推移・マーカー)',
    category: '折れ線・トレンド',
    description: '月次のユーザー推移やセッション数など、時系列の変動トレンドをデータ点マーカー付き折れ線で明快に描写。',
    code: '\\chart{\n  type: line\n  title: "月次アクティブユーザー数 (MAU) 推移"\n  theme: light\n  unit: "万人"\n  categories: "1月", "2月", "3月", "4月", "5月", "6月"\n  series: "Webサイト", 52, 58, 65, 72, 80, 92, #0284c7\n  series: "モバイルアプリ", 30, 36, 42, 55, 68, 85, #059669\n}',
    tags: ['形式4', '折れ線', 'ライン', 'MAU', '時系列', 'トレンド', 'KPI']
  },
  {
    id: 'chart-area',
    name: '形式5: エリアチャート (トラフィック総量と面推移)',
    category: '折れ線・トレンド',
    description: '折れ線の下部をグラデーションで塗りつぶし、データ量のボリューム感や総量の広がりを直感的にアピール。',
    code: '\\chart{\n  type: area\n  title: "ネットワーク総データ通信量 推移"\n  theme: light\n  unit: "TB/日"\n  categories: "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"\n  series: "国内トラフィック", 120, 135, 145, 160, 180, 210, 195, #0284c7\n  series: "海外トラフィック", 45, 52, 60, 68, 75, 95, 88, #7c3aed\n}',
    tags: ['形式5', 'エリアチャート', '面グラフ', 'トラフィック', '時系列', 'ボリューム']
  },
  {
    id: 'chart-pie',
    name: '形式6: 円グラフ (市場シェア構成比・パーセント表示)',
    category: '円・ドーナツ',
    description: '各セグメントの比率を一目で伝える円グラフ。扇形ごとのパーセントラベルと右側の詳細凡例リストを連動表示。',
    code: '\\chart{\n  type: pie\n  title: "国内クラウドインフラ市場シェア構成比"\n  theme: light\n  unit: "%"\n  data: "プラットフォームA", 42, #0284c7\n  data: "プラットフォームB", 28, #059669\n  data: "プラットフォームC", 16, #d97706\n  data: "自社サービス", 9, #db2777\n  data: "その他", 5, #64748b\n}',
    tags: ['形式6', '円グラフ', 'パイチャート', 'シェア', '構成比', 'パーセント']
  },
  {
    id: 'chart-donut',
    name: '形式7: ドーナツグラフ (予算配分比率・中央合計値)',
    category: '円・ドーナツ',
    description: '中央に合計値や主要メッセージを配置できるモダンなドーナツ型チャート。投資枠やリソースの配分比率に最適。',
    code: '\\chart{\n  type: donut\n  title: "2026年度 新規事業投資予算アロケーション"\n  theme: light\n  unit: "億円"\n  data: "生成AI・機械学習", 150, #0284c7\n  data: "サイバーセキュリティ", 90, #059669\n  data: "クラウド基盤刷新", 60, #d97706\n  data: "人材育成・R&D", 40, #7c3aed\n  data: "予備費", 20, #64748b\n}',
    tags: ['形式7', 'ドーナツ', '円グラフ', 'アロケーション', '予算', '比率']
  },
  {
    id: 'chart-combo-pareto',
    name: '形式8: パレート図・複合グラフ (棒＋折れ線 2軸複合)',
    category: '複合グラフ',
    description: '原因別の発生頻度（棒グラフ）と累積構成比率（折れ線グラフ）を同時に表示し、重点改善項目（上位80%）を特定。',
    code: '\\chart{\n  type: combo\n  title: "システム障害要因 パレート分析 (要因別件数と累積比率)"\n  theme: light\n  unit: "件"\n  categories: "設定ミス", "バグ", "負荷増大", "HW故障", "通信障害", "その他"\n  series: "発生件数", 120, 85, 45, 25, 15, 10, #0284c7 [type=bar]\n  series: "累積比率(%)", 40, 68, 83, 91, 96, 100, #d97706 [type=line]\n}',
    tags: ['形式8', 'パレート図', '複合グラフ', '品質管理', 'QC7つ道具', '累積比率']
  },
  {
    id: 'chart-latex-pgfplots',
    name: '形式9: LaTeX pgfplots 棒・折れ線構文 (\\begin{axis})',
    category: 'LaTeX構文形式',
    description: 'LaTeXの学術論文・レポートで定番のpgfplots（axis環境 / \\addplot）記法で棒グラフや折れ線を記述。',
    code: '\\begin{tikzpicture}\n  \\begin{axis}[\n    title={月別売上推移 (pgfplots)},\n    xlabel={月},\n    ylabel={売上(万円)},\n    ybar,\n    symbolic x coords={4月, 5月, 6月, 7月}\n  ]\n    \\addplot coordinates {(4月, 120) (5月, 150) (6月, 180) (7月, 210)};\n  \\end{axis}\n\\end{tikzpicture}',
    tags: ['形式9', 'LaTeX', 'pgfplots', 'axis', 'addplot', 'tikzpicture', '学術論文']
  },
  {
    id: 'chart-latex-pgfpie',
    name: '形式10: LaTeX pgf-pie 円グラフ構文 (\\pie)',
    category: 'LaTeX構文形式',
    description: 'LaTeXのpgf-pieパッケージ準拠の数値/ラベル指定構文。LaTeXユーザーになじみ深いシンプルな円グラフ表記。',
    code: '\\begin{tikzpicture}\n  % pgf-pie\n  \\pie{\n    40/製品A (40%),\n    30/製品B (30%),\n    20/製品C (20%),\n    10/その他 (10%)\n  }\n\\end{tikzpicture}',
    tags: ['形式10', 'LaTeX', 'pgf-pie', 'pie', 'tikzpicture', '円グラフ', '学術']
  },
  {
    id: 'chart-latex-pgfplots-multi',
    name: '形式11: LaTeX pgfplots 複数系列・凡例・配色構文',
    category: 'LaTeX構文形式',
    description: '\\legendや\\addplot[color=...]による配色指定と複数系列の比較。論文や技術資料で頻出の本格的グループ棒グラフ。',
    code: '\\begin{tikzpicture}\n  \\begin{axis}[\n    title={2025-2026年度 四半期別実績比較},\n    xlabel={四半期},\n    ylabel={売上高 (百万円)},\n    ybar,\n    symbolic x coords={1Q, 2Q, 3Q, 4Q},\n    legend={2025年度, 2026年度}\n  ]\n    \\addplot[color=blue!70] coordinates {(1Q, 120) (2Q, 150) (3Q, 180) (4Q, 210)};\n    \\addplot[color=green!70] coordinates {(1Q, 140) (2Q, 175) (3Q, 205) (4Q, 250)};\n  \\end{axis}\n\\end{tikzpicture}',
    tags: ['形式11', 'LaTeX', 'pgfplots', 'legend', '凡例', '配色', '複数系列', '棒グラフ']
  },
  {
    id: 'chart-latex-pgfplots-stacked',
    name: '形式12: LaTeX pgfplots 積み上げ棒グラフ (\\addlegendentry)',
    category: 'LaTeX構文形式',
    description: 'ybar stackedオプションと\\addlegendentryによる個別凡例付け。内訳構成比と全体推移を同時に可視化。',
    code: '\\begin{tikzpicture}\n  \\begin{axis}[\n    title={四半期別 コスト内訳推移 (pgfplots 積み上げ)},\n    xlabel={期},\n    ylabel={コスト (万円)},\n    ybar stacked,\n    symbolic x coords={1Q, 2Q, 3Q, 4Q}\n  ]\n    \\addplot[color=blue!80] coordinates {(1Q, 300) (2Q, 320) (3Q, 330) (4Q, 350)};\n    \\addlegendentry{開発人件費}\n    \\addplot[color=orange!80] coordinates {(1Q, 150) (2Q, 180) (3Q, 210) (4Q, 240)};\n    \\addlegendentry{マーケティング費}\n    \\addplot[color=cyan!80] coordinates {(1Q, 80) (2Q, 90) (3Q, 95) (4Q, 100)};\n    \\addlegendentry{インフラ費}\n  \\end{axis}\n\\end{tikzpicture}',
    tags: ['形式12', 'LaTeX', 'pgfplots', 'stacked', '積み上げ', 'addlegendentry', 'コスト内訳']
  },
  {
    id: 'chart-latex-pgfplots-table',
    name: '形式13: LaTeX pgfplots テーブル形式・数式プロット',
    category: 'LaTeX構文形式',
    description: '\\addplot table { x y ... } 形式による表データプロット、およびdomainサンプリングによる関数曲線描画。',
    code: '\\begin{tikzpicture}\n  \\begin{axis}[\n    title={テーブルデータプロット (pgfplots table)},\n    xlabel={経過時間 (s)},\n    ylabel={測定値 (V)}\n  ]\n    \\addplot[color=purple!80] table {\n      0 10\n      1 25\n      2 45\n      3 70\n      4 85\n      5 92\n    };\n    \\addlegendentry{実験データ}\n  \\end{axis}\n\\end{tikzpicture}',
    tags: ['形式13', 'LaTeX', 'pgfplots', 'table', 'テーブル', 'プロット', '実験データ']
  }
];
