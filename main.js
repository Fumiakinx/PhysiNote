// 記号辞書（説明文 + カラークラス）
const physicsDictionary = {
  // 力学・流体力学・解析力学（黄・オレンジ）
  'F': { desc: '力（Force） [単位: N]', cls: 'color-force' },
  'a': { desc: '加速度 [単位: m/s²] / 展開の中心点', cls: 'color-force' },
  'k': { desc: 'ばね定数（Spring constant） [単位: N/m]', cls: 'color-force' },
  'p': { desc: '圧力 [単位: Pa] / 運動量・一般化運動量 [単位: kg·m/s]', cls: 'color-force' },
  'P': { desc: '圧力（Pressure） [単位: Pa] / 確率（Probability）', cls: 'color-force' },
  'P_i': { desc: '状態iの出現確率', cls: 'color-force' },
  'g': { desc: '重力加速度 [約 9.8 m/s²]', cls: 'color-force' },
  '\\mu': { desc: '粘性係数 [単位: Pa·s]', cls: 'color-force' },
  'g_x': { desc: 'x方向の重力加速度 [単位: m/s²]', cls: 'color-force' },
  '\\tau': { desc: 'トルク [単位: N·m] / 時定数 [単位: s]', cls: 'color-force' },
  '\\boldsymbol{F}': { desc: '力ベクトル / ベクトル場 [単位: N]', cls: 'color-force' },
  '\\boldsymbol{A}': { desc: 'ベクトルポテンシャル / 任意のベクトル場', cls: 'color-force' },
  'L': { desc: 'ラグランジアン（L = T - V） [単位: J]', cls: 'color-force' },
  'H': { desc: 'ハミルトニアン（H = T + V） [単位: J]', cls: 'color-force' },

  // 質量・密度・物質量（グレー）
  'm': { desc: '質量 [単位: kg] / 干渉の次数', cls: 'color-mass' },
  'M': { desc: '天体等の質量 [単位: kg]', cls: 'color-mass' },
  'n': { desc: '物質量（Amount of substance） [単位: mol] / 屈折率', cls: 'color-mass' },
  'n_1': { desc: '媒質1の屈折率', cls: 'color-mass' },
  'n_2': { desc: '媒質2の屈折率', cls: 'color-mass' },
  '\\rho': { desc: '流体の密度 [単位: kg/m³]', cls: 'color-mass' },

  // 速度・流速・磁束・波動（緑）
  'v_0': { desc: '初速度 [単位: m/s]', cls: 'color-velocity' },
  'v': { desc: '速度 / 音速・波の位相速度 [単位: m/s]', cls: 'color-velocity' },
  'v_o': { desc: '観測者の移動速度 [単位: m/s]', cls: 'color-velocity' },
  'v_s': { desc: '波源の移動速度 [単位: m/s]', cls: 'color-velocity' },
  'u': { desc: 'x方向の流速 [単位: m/s] / 波動の変位', cls: 'color-velocity' },
  'w': { desc: 'z方向の流速 [単位: m/s]', cls: 'color-velocity' },
  'B': { desc: '磁束密度 [単位: T]', cls: 'color-velocity' },
  '\\boldsymbol{B}': { desc: '磁束密度ベクトル [単位: T]', cls: 'color-velocity' },
  '\\Phi': { desc: '磁束（Magnetic flux） [単位: Wb]', cls: 'color-velocity' },
  '\\lambda': { desc: '波長 [単位: m] / 行列の固有値', cls: 'color-velocity' },
  '\\omega': { desc: '角振動数・角速度 [単位: rad/s]', cls: 'color-velocity' },
  '\\nu': { desc: '振動数 [単位: Hz] / 動粘性係数', cls: 'color-velocity' },
  '\\boldsymbol{v}': { desc: '速度ベクトル [単位: m/s]', cls: 'color-velocity' },
  '\\dot{q}': { desc: '一般化速度 [dq/dt]', cls: 'color-velocity' },

  // 空間・距離・体積・電位・角度（水色）
  'r': { desc: '距離（distance） [単位: m]', cls: 'color-space' },
  'x': { desc: '位置・変位（position） [単位: m]', cls: 'color-space' },
  'y': { desc: '位置・変位（y座標） [単位: m]', cls: 'color-space' },
  'z': { desc: '位置・変位（z座標） [単位: m]', cls: 'color-space' },
  'd': { desc: '格子定数・スリット間隔 / 距離 [単位: m]', cls: 'color-space' },
  'h': { desc: '高さ [単位: m] / プランク定数', cls: 'color-space' },
  'V': { desc: '電位・電圧 [単位: V] / 体積 [単位: m³]', cls: 'color-space' },
  '\\theta': { desc: '角度・位相 [単位: rad]', cls: 'color-space' },
  '\\theta_1': { desc: '入射角 [単位: rad]', cls: 'color-space' },
  '\\theta_2': { desc: '屈折角 [単位: rad]', cls: 'color-space' },
  '\\boldsymbol{x}': { desc: '位置ベクトル / 固有ベクトル', cls: 'color-space' },
  '\\boldsymbol{y}': { desc: 'ベクトル（y成分・任意ベクトル）', cls: 'color-space' },
  '\\boldsymbol{n}': { desc: '法線単位ベクトル', cls: 'color-space' },

  // 時間・周波数（紫）
  't': { desc: '時間（time） [単位: s]', cls: 'color-time' },
  'f': { desc: '振動数・周波数 [単位: Hz] / 関数', cls: 'color-time' },
  "f'": { desc: '観測される見かけの振動数 [単位: Hz]', cls: 'color-time' },
  '\\xi': { desc: '周波数変数（Frequency variable）', cls: 'color-time' },

  // エネルギー・熱・電荷・電流・量子（赤）
  'E': { desc: 'エネルギー [単位: J] / 電場 [単位: V/m]', cls: 'color-thermal' },
  '\\boldsymbol{E}': { desc: '電場ベクトル [単位: V/m または N/C]', cls: 'color-thermal' },
  'E_i': { desc: '状態iのエネルギー準位 [単位: J]', cls: 'color-thermal' },
  'T': { desc: '絶対温度 [単位: K]', cls: 'color-thermal' },
  'U': { desc: '内部エネルギー [単位: J] / ユニタリ演算子', cls: 'color-thermal' },
  'Q': { desc: '熱量（Heat） [単位: J]', cls: 'color-thermal' },
  'W': { desc: '仕事（Work） [単位: J] / 微視的状態数', cls: 'color-thermal' },
  'S': { desc: 'エントロピー [単位: J/K] / 閉曲面の面積', cls: 'color-thermal' },
  'I': { desc: '電流 [単位: A] / 単位行列（Identity）', cls: 'color-thermal' },
  '\\boldsymbol{j}': { desc: '電流密度ベクトル [単位: A/m²]', cls: 'color-thermal' },
  'q_1': { desc: '点電荷1の電気量 [単位: C]', cls: 'color-thermal' },
  'q_2': { desc: '点電荷2の電気量 [単位: C]', cls: 'color-thermal' },
  'q': { desc: '電荷 [単位: C] / 一般化座標', cls: 'color-thermal' },
  '\\alpha': { desc: '熱拡散率 [単位: m²/s]', cls: 'color-thermal' },
  '\\sigma': { desc: '導電率 / 応力 / シュテファン・ボルツマン定数', cls: 'color-thermal' },
  '\\beta': { desc: '逆温度（1/k_B T） [単位: 1/J]', cls: 'color-thermal' },
  'Z': { desc: '分配関数（Partition function）', cls: 'color-thermal' },

  // 物理定数・抵抗・数学定数（金）
  'G': { desc: '万有引力定数 [約 6.674×10⁻¹¹ N·m²/kg²]', cls: 'color-const' },
  'c': { desc: '真空中の光速度 [約 3.0×10⁸ m/s]', cls: 'color-const' },
  '\\hbar': { desc: '換算プランク定数（h/2π） [約 1.055×10⁻³⁴ J·s]', cls: 'color-const' },
  'k_B': { desc: 'ボルツマン定数 [約 1.381×10⁻²³ J/K]', cls: 'color-const' },
  'R': { desc: '気体定数 [約 8.314 J/(mol·K)] / 電気抵抗 [単位: Ω]', cls: 'color-const' },
  '\\varepsilon_0': { desc: '真空の誘電率 [約 8.854×10⁻¹² F/m]', cls: 'color-const' },
  '\\mu_0': { desc: '真空の透磁率 [約 4π×10⁻⁷ N/A²]', cls: 'color-const' },
  '\\gamma': { desc: 'ローレンツ因子 [無次元]', cls: 'color-const' },
  'R_n': { desc: '剰余項（近似誤差）', cls: 'color-const' },
  'i': { desc: '虚数単位（i² = -1）', cls: 'color-const' },
  'e': { desc: '自然対数の底（ネイピア数 e ≈ 2.718） / 電気素量', cls: 'color-const' },
  '\\pi': { desc: '円周率（π ≈ 3.14159）', cls: 'color-const' },

  // 演算記号・微分作用素・量子演算子（インディゴ）
  '\\partial': { desc: '偏微分記号 [演算子: 他の変数を固定して微分]', cls: 'color-operator' },
  '\\nabla': { desc: 'ナブラ演算子 [空間微分作用素]', cls: 'color-operator' },
  '\\Delta': { desc: '変化量・差分作用素', cls: 'color-operator' },
  '\\delta': { desc: 'ディラックのデルタ関数 / 微小変化量', cls: 'color-operator' },
  '\\psi': { desc: '波動関数（Probability amplitude）', cls: 'color-operator' },
  '\\hat{H}': { desc: 'ハミルトニアン（全エネルギー演算子）', cls: 'color-operator' },
  '\\hat{x}': { desc: '位置演算子', cls: 'color-operator' },
  '\\hat{p}': { desc: '運動量演算子（-iℏ∇）', cls: 'color-operator' },
  '\\hat{f}': { desc: 'フーリエ変換後の関数', cls: 'color-operator' },
  'A': { desc: '正方行列・線形変換作用素', cls: 'color-operator' }
};

// 数式全体の意味・物理的考察（有効範囲・限界境界・時間発展）の規格化データ定義
const formulaDictionary = [
  // --- 1. 力学 ---
  {
    id: 'mechanics-01',
    pattern: /F\s*=\s*m\s*(\*|\\cdot)?\s*a/,
    name: 'ニュートンの運動方程式（$F = ma$）',
    desc: '物体に加わる力 F は質量 m と加速度 a の積に等しいという力学の基本原理。',
    purpose: '物体に作用する合力 $F$ から、生じる加速度 $a$ を決定する古典力学の基本運動方程式。',
    elements: [
      { symbol: '$F$', desc: '物体に加えられる外力の合力（入力・加速の原因）', varKey: 'F', unit: 'N', defaultVal: 19.6, target: true },
      { symbol: '$m$', desc: '物体の慣性質量（動きにくさ・系のパラメータ）', varKey: 'm', unit: 'kg', defaultVal: 2.0 },
      { symbol: '$a$', desc: '物体に生じる加速度（出力・運動の変化率 $\\frac{d^2 x}{dt^2}$）', varKey: 'a', unit: 'm/s²', defaultVal: 9.8 }
    ],
    solve: (vals, trig) => (trig === 'F' && vals.m > 0 ? { a: vals.F / vals.m } : { F: vals.m * vals.a }),
    domain: '光速より十分遅く（$v \\ll c$）、原子スケールより十分大きいマクロな質点系（慣性系）。',
    limitSignal: '$v \\to c$ で質量増加や相対論効果が無視できなくなり破綻。ナノスケールでは量子ゆらぎにより破綻。',
    timeReversibility: '時間反転可逆（$t$ を $-t$ に反転しても加速度 $a$ の符号が変わらず方程式の形が保存される）。'
  },
  {
    id: 'mechanics-02',
    pattern: /F\s*=\s*G\s*\\frac/,
    name: '万有引力の法則（$F = G \\frac{M m}{r^2}$）',
    desc: 'すべての物体間に働く引き合う力。質量同士の積に比例し距離の2乗に反比例する。',
    purpose: '質量を持つ2物体間に働く重力相互作用の大きさを距離と質量から算出する法則。',
    elements: [
      { symbol: '$M$', desc: '天体・親星の質量', varKey: 'M', unit: 'kg', defaultVal: 5.972e24 },
      { symbol: '$m$', desc: '物体・試験質量', varKey: 'm', unit: 'kg', defaultVal: 70 },
      { symbol: '$r$', desc: '2物体の重心間距離', varKey: 'r', unit: 'm', defaultVal: 6.371e6 },
      { symbol: '$G$', desc: '万有引力定数', varKey: 'G', unit: 'N·m²/kg²', defaultVal: 6.674e-11, isConstant: true },
      { symbol: '$F$', desc: '2物体間に働く引力（出力結果）', varKey: 'F', unit: 'N', defaultVal: 686.2, target: true }
    ],
    solve: (vals) => (vals.r > 0 ? { F: (vals.G * vals.M * vals.m) / (vals.r ** 2) } : null),
    domain: '球対称な2物体間の重力相互作用。弱重力場かつ $r$ が物体サイズより十分大きい領域。',
    limitSignal: '$r \\to 0$ でゼロ除算・無限大発散。ブラックホール近傍など極限の強重力場（一般相対性理論が必要）。',
    timeReversibility: '時間依存性なし（空間的な距離 $r$ のみで決定する保存力場）。'
  },
  {
    id: 'mechanics-03',
    pattern: /F\s*=\s*-\s*k\s*(\*|\\cdot)?\s*x/,
    name: 'フックの法則（$F = -kx$）',
    desc: '弾性体の変形量と復元力の比例関係を表す法則。',
    purpose: '弾性体の変位 $x$ に比例して反対向きに生じる線形復元力 $F$ を決定する式。',
    elements: [
      { symbol: '$x$', desc: '自然長からの変位・変形量（入力変位）', varKey: 'x', unit: 'm', defaultVal: 0.1 },
      { symbol: '$k$', desc: 'ばね定数・剛性（復元特性パラメータ）', varKey: 'k', unit: 'N/m', defaultVal: 50 },
      { symbol: '$-$', desc: '変位と逆向きに働くことを示す復元性の符号' },
      { symbol: '$F$', desc: '生じる弾性復元力（出力結果）', varKey: 'F', unit: 'N', defaultVal: -5.0, target: true }
    ],
    solve: (vals, trig) => (trig === 'F' && vals.k !== 0 ? { x: -vals.F / vals.k } : { F: -vals.k * vals.x }),
    domain: '弾性体の変形量 $x$ が微小な線形弾性域内部。',
    limitSignal: '変形量 $x$ が比例限度・弾性限度を超えると非線形化し、塑性変形や破断に至る（線形近似の崩壊）。',
    timeReversibility: 'エネルギー散逸（減衰・摩擦）を含まない理想バネモデルでは時間反転可逆。'
  },
  {
    id: 'mechanics-04',
    pattern: /v\s*=\s*v_0\s*\+\s*a\s*(\*|\\cdot)?\s*t/,
    name: '等加速度直線運動の速度式（$v = v_0 + at$）',
    desc: '一定の加速度で運動する物体の速度の時間変化を表す関係式。',
    purpose: '一定の加速度 $a$ のもとで運動する物体の時刻 $t$ における速度 $v$ を追跡する線形時間発展式。',
    elements: [
      { symbol: '$v_0$', desc: '時刻 $t=0$ における初期速度', varKey: 'v0', unit: 'm/s', defaultVal: 0 },
      { symbol: '$a$', desc: '一定の加速度', varKey: 'a', unit: 'm/s²', defaultVal: 9.8 },
      { symbol: '$t$', desc: '経過時間', varKey: 't', unit: 's', defaultVal: 3.0 },
      { symbol: '$v$', desc: '時刻 $t$ における瞬時速度（出力結果）', varKey: 'v', unit: 'm/s', defaultVal: 29.4, target: true }
    ],
    solve: (vals, trig) => (trig === 'v' && vals.a !== 0 ? { t: (vals.v - vals.v0) / vals.a } : { v: vals.v0 + vals.a * vals.t }),
    domain: '加速度 $a$ が時間によらず一定（定数）とみなせる一次元運動系。',
    limitSignal: '速度依存の空気抵抗が存在する場合や、推力が連続変化する系では $a$ が定数でなくなり解が破綻。',
    timeReversibility: '外力による散逸がなければ時間反転可逆（$t$ の符号反転で過去の軌跡を完全逆追跡可能）。'
  },

  // --- 2. 電磁気学 ---
  {
    id: 'em-01',
    pattern: /(4\\pi\s*\\varepsilon|q_1\s*q_2)/,
    name: 'クーロンの法則（$F = \\frac{1}{4\\pi\\varepsilon_0}\\frac{q_1 q_2}{r^2}$）',
    desc: '静止した2つの荷電粒子間に働く静電気力を表す基本法則。',
    purpose: '2つの静止荷電粒子間に作用する静電気力（引力または斥力）を電荷量と距離から算出する。',
    elements: [
      { symbol: '$q_1$', desc: '第1荷電粒子の電気量', varKey: 'q1', unit: 'μC', defaultVal: 1.0 },
      { symbol: '$q_2$', desc: '第2荷電粒子の電気量', varKey: 'q2', unit: 'μC', defaultVal: 1.0 },
      { symbol: '$r$', desc: '2電荷間の中心距離', varKey: 'r', unit: 'm', defaultVal: 0.1 },
      { symbol: '$\\varepsilon_0$', desc: '真空の誘電率', varKey: 'eps0', unit: 'F/m', defaultVal: 8.854e-12, isConstant: true },
      { symbol: '$F$', desc: '荷電粒子間に働く静電気力（出力結果）', varKey: 'F', unit: 'N', defaultVal: 0.8988, target: true }
    ],
    solve: (vals) => (vals.r > 0 ? { F: (1 / (4 * Math.PI * vals.eps0)) * ((vals.q1 * 1e-6) * (vals.q2 * 1e-6)) / (vals.r ** 2) } : null),
    domain: '電荷が静止または低速で移動している静電場。距離 $r$ が素粒子・原子核スケールより十分大きい領域。',
    limitSignal: '$r \\to 0$ でゼロ除算（クーロン力が無限大発散）。電荷が高速移動する場合は電磁波の遅延効果により破綻。',
    timeReversibility: '静的な力（静止場）の記述であるため時間依存性なし（空間配置のみで決定）。'
  },
  {
    id: 'em-02',
    pattern: /V\s*=\s*I\s*(\*|\\cdot)?\s*R/,
    name: 'オームの法則（$V = IR$）',
    desc: '導体を流れる電流と両端の電位差、電気抵抗の線形比例関係を表す。',
    purpose: '導体に流れる電流 $I$ と抵抗 $R$ から、両端に発生する電位降下 $V$ を決定する線形応答方程式。',
    elements: [
      { symbol: '$I$', desc: '導体を流れる電流', varKey: 'I', unit: 'A', defaultVal: 2.0 },
      { symbol: '$R$', desc: '導体の電気抵抗', varKey: 'R', unit: 'Ω', defaultVal: 10.0 },
      { symbol: '$V$', desc: '導体両端の電位差・電圧降下（出力結果）', varKey: 'V', unit: 'V', defaultVal: 20.0, target: true }
    ],
    solve: (vals, trig) => (trig === 'V' && vals.R > 0 ? { I: vals.V / vals.R } : { V: vals.I * vals.R }),
    domain: '温度が一定で、電気伝導特性が線形な等方性導体（抵抗体）。',
    limitSignal: 'ダイオード等の非線形半導体素子、過大電流によるジュール熱での抵抗変化、超伝導転移（$R = 0$）。',
    timeReversibility: '時間不可逆（電気エネルギーがジュール熱として不可逆散逸するため、時間の巻き戻しは不可）。'
  },
  {
    id: 'em-03',
    pattern: /F\s*=\s*q\s*\(\s*E/,
    name: 'ローレンツ力（$F = q(E + v \\times B)$）',
    desc: '電磁場中を運動する荷電粒子が受ける電場と磁場による力の合力。',
    purpose: '電磁場中を運動する荷電粒子が受ける力（静電推進力と磁気偏向力）をベクトル合成して算出する。',
    elements: [
      { symbol: '$q$', desc: '粒子の電荷量', varKey: 'q', unit: 'C', defaultVal: 1.602e-19 },
      { symbol: '$\\boldsymbol{E}$', desc: '局所的な電場', varKey: 'E', unit: 'V/m', defaultVal: 100 },
      { symbol: '$\\boldsymbol{v}$', desc: '粒子の速度', varKey: 'v', unit: 'm/s', defaultVal: 1e5 },
      { symbol: '$\\boldsymbol{B}$', desc: '垂直磁場', varKey: 'B', unit: 'T', defaultVal: 0.05 },
      { symbol: '$\\boldsymbol{F}$', desc: '粒子が受けるローレンツ力（出力結果）', varKey: 'F', unit: 'N', defaultVal: 8.01e-16, target: true }
    ],
    solve: (vals) => ({ F: vals.q * (vals.E + vals.v * vals.B) }),
    domain: '外場（電場 $E$・磁場 $B$）中を移動する荷電粒子。非相対論的〜準相対論的エネルギー領域。',
    limitSignal: '粒子が急激な加減速を行う際の「制動放射（放射減衰）」によるエネルギー損失を無視したモデル。',
    timeReversibility: '電磁場の方程式と組み合わせた場合、磁場 $B$ を $-B$ に反転させると時間反転対称性が成立。'
  },
  {
    id: 'em-04',
    pattern: /V\s*=\s*-\s*\\frac\{\s*d\s*\\Phi\s*\}\{\s*d\s*t\s*\}/,
    name: 'ファラデーの電磁誘導の法則（$V = -\\frac{d\\Phi}{dt}$）',
    desc: '回路を貫く磁束の変化率に比例して逆向きの誘導起電力が発生する現象。',
    purpose: '回路を貫通する磁束 $\\Phi$ の時間変化率から、誘起される起電力 $V$ の大きさと極性を導出する。',
    elements: [
      { symbol: '$\\Delta\\Phi$', desc: '貫く磁束の変化量', varKey: 'dPhi', unit: 'Wb', defaultVal: 0.5 },
      { symbol: '$\\Delta t$', desc: '磁束変化に要した時間', varKey: 'dt', unit: 's', defaultVal: 0.1 },
      { symbol: '$-$', desc: '磁束変化を打ち消す向きを示すレンツの法則の符号' },
      { symbol: '$V$', desc: '回路に生じる誘導起電力（出力起電力）', varKey: 'V', unit: 'V', defaultVal: -5.0, target: true }
    ],
    solve: (vals) => (vals.dt > 0 ? { V: -vals.dPhi / vals.dt } : null),
    domain: '閉回路を貫く磁束 $\\Phi$ の時間変化が緩やかな準定常状態。',
    limitSignal: '高周波領域で変位電流や空間への電磁放射（アンテナ効果）が無視できなくなる領域で誤差が増大。',
    timeReversibility: '回路抵抗によるジュール熱損失がなければ時間反転可逆。'
  },
  {
    id: 'em-maxwell-gauss',
    pattern: /\\nabla\s*\\cdot\s*\\boldsymbol\{E\}/,
    name: 'ガウスの法則（電場）（$\\nabla \\cdot \\boldsymbol{E} = \\frac{\\rho}{\\varepsilon_0}$）',
    desc: '電荷の存在によって電場が空間へ湧き出す関係を示すマクスウェル方程式の第1式。',
    purpose: '局所的な電荷密度 $\\rho$ をソース項として、電場 $\\boldsymbol{E}$ の空間的な湧き出し量（発散）を決定する。',
    elements: [
      { symbol: '$\\rho$', desc: '空間の電荷密度（電場を湧き出させる源泉ソース）' },
      { symbol: '$\\varepsilon_0$', desc: '真空の誘電率（真空の電場応答定数）' },
      { symbol: '$\\nabla \\cdot$', desc: '発散作用素（微小体積からの正味の空間湧き出し率）' },
      { symbol: '$\\boldsymbol{E}$', desc: '空間全体に分布する電場ベクトル場' }
    ],
    domain: 'マクロな古典電磁気学。電荷密度 $\\rho$ が滑らかに分布する領域。',
    limitSignal: '素粒子スケール（量子電磁力学領域）では真空偏極や不確定性により古典場としての記述が破綻。点電荷では $r \\to 0$ で発散。',
    timeReversibility: '時間反転に対して電荷・電場は不変であり、時間反転可逆。'
  },
  {
    id: 'em-maxwell-ampere',
    pattern: /\\nabla\s*\\times\s*\\boldsymbol\{B\}/,
    name: 'アンペール・マクスウェルの法則（$\\nabla \\times \\boldsymbol{B} = \\mu_0 \\boldsymbol{j} + \\mu_0 \\varepsilon_0 \\frac{\\partial \\boldsymbol{E}}{\\partial t}$）',
    desc: '電流だけでなく電場の時間変化（変位電流）によっても磁場が誘起される関係を記述する方程式。',
    purpose: '伝導電流 $\\boldsymbol{j}$ および電場の時間変化（変位電流）から、空間に誘起される磁場の渦（回転）を生成する。',
    elements: [
      { symbol: '$\\boldsymbol{j}$', desc: '伝導電流密度（自由電荷の実移動による流束）' },
      { symbol: '$\\frac{\\partial \\boldsymbol{E}}{\\partial t}$', desc: '電場の時間変化率（変位電流項・真空中での電磁波自己伝播の源）' },
      { symbol: '$\\nabla \\times \\boldsymbol{B}$', desc: '磁場の空間的回転（ローテーション・渦の強さと軸方向）' },
      { symbol: '$\\mu_0, \\varepsilon_0$', desc: '真空の透磁率と誘電率（光速 $c = 1/\\sqrt{\\mu_0 \\varepsilon_0}$ を結びつける係数）' }
    ],
    domain: '定常電流系および電磁波が真空中や媒質中を伝播する時間変動電磁場。',
    limitSignal: 'プランクスケール等の極限強電磁場や量子光学的領域では非線形量子効果により破綻。',
    timeReversibility: '磁場と電流は時間反転で符号反転するため（$t \\to -t$ で $\\boldsymbol{B} \\to -\\boldsymbol{B}, \\boldsymbol{j} \\to -\\boldsymbol{j}$）、方程式の形が保存され時間反転可逆。'
  },

  // --- 3. 熱力学 ---
  {
    id: 'thermo-01',
    pattern: /P\s*V\s*=\s*n\s*R\s*T/,
    name: '理想気体の状態方程式（$PV = nRT$）',
    desc: '理想気体の圧力、体積、物質量、絶対温度の間の熱力学的平衡関係。',
    purpose: '気体の巨視的状態量（圧力 $P$・体積 $V$・温度 $T$・物質量 $n$）が満たすべき熱力学的平衡条件を決定する。',
    elements: [
      { symbol: '$P$', desc: '気体の圧力', varKey: 'P', unit: 'kPa', defaultVal: 101.56, target: true },
      { symbol: '$V$', desc: '占有体積', varKey: 'V', unit: 'm³', defaultVal: 0.024 },
      { symbol: '$n$', desc: '気体の物質量', varKey: 'n', unit: 'mol', defaultVal: 1.0 },
      { symbol: '$R$', desc: '気体定数', varKey: 'R', unit: 'J/(mol·K)', defaultVal: 8.314, isConstant: true },
      { symbol: '$T$', desc: '絶対温度', varKey: 'T', unit: 'K', defaultVal: 293.15 }
    ],
    solve: (vals, trig) => {
      if (trig === 'P' && vals.P > 0) {
        return { V: (vals.n * vals.R * vals.T) / (vals.P * 1000) };
      } else if (vals.V > 0) {
        return { P: (vals.n * vals.R * vals.T) / vals.V / 1000 };
      }
      return null;
    },
    domain: '低圧・高温領域。気体分子自身の体積と分子間相互作用（ファンデルワールス力）を無視できる状態。',
    limitSignal: '高圧・極低温下で実在気体の体積排除効果と引力が顕在化し破綻（相転移・液化する領域）。',
    timeReversibility: '熱平衡状態を結ぶ静的関係式であるため時間依存性は直接なし。'
  },
  {
    id: 'thermo-02',
    pattern: /(\\partial.*T.*\\partial.*t|\\alpha.*\\nabla)/,
    name: '熱伝導方程式（$\\frac{\\partial T}{\\partial t} = \\alpha \\nabla^2 T$）',
    desc: '均質媒質中における巨視的な熱拡散過程を記述する偏微分方程式。',
    purpose: '温度分布の曲率（ラプラシアン）から、熱が均一化へ向かう時間的拡散速度を決定する放物型偏微分方程式。',
    elements: [
      { symbol: '$\\nabla^2 T$', desc: '温度の空間曲率・ラプラシアン（周囲平均との温度差）' },
      { symbol: '$\\alpha$', desc: '熱拡散率（媒質の熱伝導率・比熱・密度から決まる拡散速度係数）' },
      { symbol: '$\\frac{\\partial T}{\\partial t}$', desc: '局所温度の時間変化率（温度勾配を平滑化する出力）' }
    ],
    domain: '均質・等方的な連続媒質における巨視的な熱拡散現象（未来方向 $t \\ge 0$）。',
    limitSignal: '過去方向（$t < 0$）への逆算を行うと微小ノイズが指数関数的に増幅され解が無限大に爆発（クラッシュ）。',
    timeReversibility: '時間不可逆（放熱によるエントロピー増大を記述するモデルのため、過去へのロールバック不可）。'
  },
  {
    id: 'thermo-03',
    pattern: /\\Delta\s*U\s*=\s*Q\s*\+\s*W/,
    name: '熱力学第一法則（$\\Delta U = Q + W$）',
    desc: '系に流入した熱量と外部からされた仕事の和が内部エネルギー変化に等しいというエネルギー保存則。',
    purpose: '系に出入りする熱エネルギー $Q$ と力学的仕事 $W$ から、系の内部エネルギー変化 $\\Delta U$ を精算する保存則。',
    elements: [
      { symbol: '$Q$', desc: '系が外界から吸収した熱量', varKey: 'Q', unit: 'J', defaultVal: 500 },
      { symbol: '$W$', desc: '系が外界からされた仕事', varKey: 'W', unit: 'J', defaultVal: -200 },
      { symbol: '$\\Delta U$', desc: '内部エネルギー変化量（出力結果）', varKey: 'dU', unit: 'J', defaultVal: 300, target: true }
    ],
    solve: (vals, trig) => (trig === 'dU' ? { Q: vals.dU - vals.W } : { dU: vals.Q + vals.W }),
    domain: '巨視的な閉じた熱力学系におけるエネルギー保存則。',
    limitSignal: '相対論的な質量-エネルギー変換（核反応）や、開放系での物質移動を伴う系にはそのまま適用不可。',
    timeReversibility: 'エネルギー収支自体は保存則だが、実際の熱移動 $Q$ は第二法則（エントロピー増大）の制約を受ける。'
  },
  {
    id: 'thermo-second-law',
    pattern: /dS\s*\\ge\s*\\frac\{\s*dQ\s*\}\{\s*T\s*\}/,
    name: '熱力学第二法則（$dS \\ge \\frac{dQ}{T}$）',
    desc: '熱が自発的に低温から高温へ移動しないこと、および孤立系の不可逆変化に伴いエントロピーが増大する制約を示す。',
    purpose: '熱の移動に伴うエントロピー変化の理論的下限を規定し、自然界のプロセスの不可逆性と進行方向を律速する。',
    elements: [
      { symbol: '$dQ$', desc: '温度 $T$ の境界を通して系へ出入りする微小熱量' },
      { symbol: '$T$', desc: '熱源の絶対温度' },
      { symbol: '$\\frac{dQ}{T}$', desc: '外界との熱交換に伴う可逆エントロピー授受量' },
      { symbol: '$dS$', desc: '系の全エントロピー変化（等号は可逆過程、不等号は不可逆な散逸を伴う過程）' }
    ],
    domain: '巨視的な熱力学系（アボガドロ数程度の多数の粒子系）。',
    limitSignal: 'ナノスケールの微小系では熱揺らぎにより一時的なエントロピー減少が観測される（ゆらぎの定理が必要）。',
    timeReversibility: '時間反転不可逆（自然界の時間の矢・非対称性を規定する不可逆基本法則）。'
  },

  // --- その他発展的公式 ---
  {
    id: 'special-relativity',
    pattern: /(E\s*=\s*m\s*(\*|\\cdot)?\s*c\^2|\\gamma\s*=)/,
    name: '特殊相対性理論（ローレンツ因子 / 質量エネルギー等価性）',
    desc: 'アインシュタインの特殊相対性理論。光速不変の原理に基づく時空の変換法則。',
    purpose: '質量 $m$ を持った物質が潜在的に保有している全エネルギー $E$ の換算レートを規定する。',
    elements: [
      { symbol: '$m$', desc: '物体の静止質量', varKey: 'm', unit: 'kg', defaultVal: 0.001 },
      { symbol: '$c$', desc: '真空中の光速度', varKey: 'c', unit: 'm/s', defaultVal: 299792458, isConstant: true },
      { symbol: '$c^2$', desc: 'エネルギー換算増幅ファクター' },
      { symbol: '$E$', desc: '全静止エネルギー（換算出力結果）', varKey: 'E', unit: 'J', defaultVal: 8.988e13, target: true }
    ],
    solve: (vals, trig) => (trig === 'E' && vals.c > 0 ? { m: vals.E / (vals.c ** 2) } : { E: vals.m * (vals.c ** 2) }),
    domain: '重力の影響が無視できる平坦な時空、かつ物体の速度が光速未満（$v < c$）。',
    limitSignal: '$v \\ge c$（因果律の逆転・分母の虚数化）、重力が極めて強い領域（一般相対論が必要）。',
    timeReversibility: '未来へ進む時間のテンポ（遅れ）を計算。因果関係のある事象間の逆転は不可。'
  },
  {
    id: 'fluid_bernoulli',
    pattern: /P\s*\+\s*\\frac\{1\}\{2\}\s*\\rho/,
    name: 'ベルヌーイの定理（$P + \\frac{1}{2}\\rho v^2 + \\rho gh = \\text{const}$）',
    desc: '非圧縮・非粘性流体の定常流における力学的エネルギー保存則。',
    purpose: '同一流線上の各点において、静圧・動圧・重力位置圧の総和（全圧）が一定保存されることを示す関係式。',
    elements: [
      { symbol: '$P$', desc: '流体の静圧', varKey: 'P', unit: 'Pa', defaultVal: 101325 },
      { symbol: '$v$', desc: '流速', varKey: 'v', unit: 'm/s', defaultVal: 2.0 },
      { symbol: '$\\rho$', desc: '流体密度', varKey: 'rho', unit: 'kg/m³', defaultVal: 1000 },
      { symbol: '$h$', desc: '基準面からの高さ', varKey: 'h', unit: 'm', defaultVal: 5.0 },
      { symbol: '$\\text{const}$', desc: '流線全体の全圧（保存出力値）', varKey: 'C', unit: 'Pa', defaultVal: 152325, target: true }
    ],
    solve: (vals) => ({ C: vals.P + 0.5 * vals.rho * (vals.v ** 2) + vals.rho * 9.8 * vals.h }),
    domain: '非圧縮性（マッハ数 $M < 0.3$）・非粘性・定常流の同一流線上。',
    limitSignal: '流速が音速に近づく圧縮性効果、粘性摩擦損失、乱流や非定常流で破綻。',
    timeReversibility: '粘性散逸のない理想流体モデルのため時間反転可逆。'
  },
  {
    id: 'fluid_continuity',
    pattern: /\\partial\s*\\rho.*\\partial\s*t.*\\nabla\s*\\cdot/,
    name: '連続の式（流体）（$\\frac{\\partial \\rho}{\\partial t} + \\nabla \\cdot (\\rho \\boldsymbol{v}) = 0$）',
    desc: '流体内における質量保存則を微分形式で表現した基礎方程式。',
    purpose: '空間内の微小体積要素における密度の時間変化と、境界からの質量流出入フラックスの完全均衡（質量保存）を表す。',
    elements: [
      { symbol: '$\\frac{\\partial \\rho}{\\partial t}$', desc: '局所的な流体密度の時間変化率' },
      { symbol: '$\\nabla \\cdot (\\rho \\boldsymbol{v})$', desc: '境界からの正味の質量流出フラックス' }
    ],
    domain: '質量保存が成り立つすべての流体連続体。',
    limitSignal: '連続体近似が破綻する希薄気体や核反応系。',
    timeReversibility: '時間反転可逆。'
  },
  {
    id: 'thermo_stat_distribution',
    pattern: /P_i\s*\\propto\s*e\^/,
    name: 'ボルツマン分布（$P_i \\propto e^{-\\frac{E_i}{k_B T}}$）',
    desc: '熱平衡状態にある系において、エネルギー状態が出現する確率を表す分布則。',
    purpose: '温度 $T$ の熱浴と熱平衡にある系が、特定エネルギー準位 $E_i$ をとる統計的出現確率重みを算出する。',
    elements: [
      { symbol: '$E_i$', desc: '微視的状態 $i$ が持つエネルギー準位' },
      { symbol: '$k_B T$', desc: '系の熱揺らぎの代表エネルギースケール' },
      { symbol: '$-\\frac{E_i}{k_B T}$', desc: '熱エネルギーに対する励起エネルギーの相対比率' },
      { symbol: '$e^{-\\frac{E_i}{k_B T}}$', desc: 'エネルギーが高い状態ほど指数関数的に確率を抑制する重み因子' }
    ],
    domain: '熱浴（温度 $T$ 一定）と接触した平衡状態の古典統計系（正準集団）。',
    limitSignal: '量子縮退が顕著な低温・高密度系（フェルミ・ディラック統計またはボース・アインシュタイン統計が必要）。',
    timeReversibility: '時間依存性を持たない定常平衡確率分布。'
  },
  {
    id: 'stat-partition-function',
    pattern: /Z\s*=\s*\\sum.*e\^/,
    name: '分配関数（カノニカル分布）（$Z = \\sum_i e^{-\\beta E_i}$）',
    desc: '系のすべての微視的状態の確率重みを足し合わせ、自由エネルギーや比熱などの熱力学量を計算するための土台となる式。',
    purpose: '全微視的状態のボルツマン統計重みを合算し、あらゆる熱力学関数を微分から導き出す母関数 $Z$ を生成する。',
    elements: [
      { symbol: '$\\beta$', desc: '逆温度（$\\frac{1}{k_B T}$）' },
      { symbol: '$E_i$', desc: '各状態 $i$ のエネルギー値' },
      { symbol: '$e^{-\\beta E_i}$', desc: '状態 $i$ のボルツマン因子' },
      { symbol: '$\\sum_i$', desc: '取りうるすべての量子微視的状態にわたる総合算作用' },
      { symbol: '$Z$', desc: 'カノニカル分配関数（全確率の規格化分母・熱力学母関数出力）' }
    ],
    domain: '熱浴と熱平衡にある粒子数・体積一定の閉鎖系（カノニカル集団）。',
    limitSignal: '粒子数が非保存の開放系（大正準集団）や孤立系（小正準集団）では定式化の変更が必要。',
    timeReversibility: '熱平衡状態の統計的平均のため時間依存性なし。'
  },
  {
    id: 'stat-equipartition',
    pattern: /(\\langle\s*E\s*\\rangle|E).*=\s*\\frac\{1\}\{2\}\s*k_B\s*T/,
    name: 'エネルギー等分配定理（$\\langle E \\rangle = \\frac{1}{2} k_B T$）',
    desc: '古典的な熱平衡系において、ハミルトニアンの2乗形式で現れる自由度1つあたりに分配される平均エネルギーを示す。',
    purpose: '古典熱平衡系において、運動エネルギー等の二次自由度1個あたりに均等に配分される熱エネルギー期待値を算出する。',
    elements: [
      { symbol: '$k_B$', desc: 'ボルツマン定数', varKey: 'kB', unit: 'J/K', defaultVal: 1.381e-23, isConstant: true },
      { symbol: '$T$', desc: '熱平衡系の絶対温度', varKey: 'T', unit: 'K', defaultVal: 300 },
      { symbol: '$\\frac{1}{2} k_B T$', desc: '二次形式自由度1つあたりの平均熱エネルギー' },
      { symbol: '$\\langle E \\rangle$', desc: '蓄えられる平均エネルギー（出力結果）', varKey: 'E', unit: 'zJ', defaultVal: 2.072, target: true }
    ],
    solve: (vals, trig) => (trig === 'E' ? { T: (vals.E * 1e-21) / (0.5 * vals.kB) } : { E: (0.5 * vals.kB * vals.T) * 1e21 }),
    domain: '高温・低密度で量子効果が無視できる古典統計力学の平衡系。',
    limitSignal: '低温領域ではエネルギーの量子化（離散性）により自由度の凍結が発生し、比熱の急激な低下（破綻）が起こる。',
    timeReversibility: '熱平衡状態の統計平均値のため時間依存性なし。'
  },
  {
    id: 'analytical-euler-lagrange',
    pattern: /\\frac\{d\}\{dt\}.*\\frac\{\\partial\s*L\}/,
    name: 'オイラー・ラグランジュ方程式（$\\frac{d}{dt}\\left(\\frac{\\partial L}{\\partial \\dot{q}}\\right) - \\frac{\\partial L}{\\partial q} = 0$）',
    desc: '作用が極値をとるという最小作用の原理から、任意の一般化座標系において運動方程式を導出する解析力学の基本方程式。',
    purpose: 'ラグランジアン $L$ に対する変分原理（最小作用の原理）から、任意の一般化座標 $q$ における力学運動方程式を自動導出する。',
    elements: [
      { symbol: '$L(q, \\dot{q}, t)$', desc: 'ラグランジアン（運動エネルギー $T$ とポテンシャル $V$ の差）' },
      { symbol: '$\\frac{\\partial L}{\\partial \\dot{q}}$', desc: '一般化運動量（速度微分に対する応答感度）' },
      { symbol: '$\\frac{d}{dt}(\\dots)$', desc: '一般化運動量の時間微分（慣性力項）' },
      { symbol: '$\\frac{\\partial L}{\\partial q}$', desc: '一般化力（ポテンシャル等の位置変化勾配力）' }
    ],
    domain: 'ホロノミックな束縛条件を持つ保存力学系。',
    limitSignal: '非ホロノミック拘束や摩擦・粘性などの非保存散逸系ではラグランジアン単体での変分原理がそのままでは不成立。',
    timeReversibility: 'ラグランジアンが陽に時間に依存せず速度の2乗に依存する場合、時間反転可逆。'
  },
  {
    id: 'analytical-hamilton',
    pattern: /(\\frac\{dq\}\{dt\}|\partial\s*H)/,
    name: 'ハミルトンの正準方程式（$\\frac{dq}{dt} = \\frac{\\partial H}{\\partial p}, \\quad \\frac{dp}{dt} = -\\frac{\\partial H}{\\partial q}$）',
    desc: '位置と運動量を対等な独立変数として扱い、位相空間上での系の時間発展を記述する1階連立微分方程式。',
    purpose: '全エネルギー曲面 $H(q, p)$ の勾配から、位置 $q$ と運動量 $p$ が位相空間上を流れる時間発展速度ベクトル場を出力する。',
    elements: [
      { symbol: '$H(q, p)$', desc: 'ハミルトニアン（位相空間上の全エネルギー関数）' },
      { symbol: '$\\frac{\\partial H}{\\partial p}$', desc: '運動量勾配（座標の移動速度 $\\frac{dq}{dt}$ を生成）' },
      { symbol: '$-\\frac{\\partial H}{\\partial q}$', desc: '位置勾配（運動量の変化速度 $\\frac{dp}{dt}$ を生成する保存力）' },
      { symbol: '$\\frac{dq}{dt}, \\frac{dp}{dt}$', desc: '位相空間上における系の瞬時軌道ベクトル（出力微分）' }
    ],
    domain: '保存力学系、正準変換が適用可能な位相空間幾何（シンプレクティック構造）。',
    limitSignal: '摩擦・散逸力がある場合、正準形式から外れ位相空間の体積保存（リウヴィルの定理）が崩れる。',
    timeReversibility: 'ハミルトニアンが時間反転対称な場合、時間反転可逆（過去と未来の決定論的軌跡）。'
  },
  {
    id: 'math_eigenvalue',
    pattern: /A\\boldsymbol\{x\}\s*=\s*\\lambda\s*\\boldsymbol\{x\}/,
    name: '固有値方程式（$A\\boldsymbol{x} = \\lambda \\boldsymbol{x}$）',
    desc: '線形変換を施しても方向が変わらないベクトル（固有ベクトル）とその拡大率（固有値）の関係式。',
    purpose: '行列作用素 $A$ による変換を受けても方向が変わらず、単なるスカラー倍 $\\lambda$ の伸縮にとどまる不変軸を抽出する。',
    elements: [
      { symbol: '$A$', desc: '線形変換作用素（正方行列・作用パイプライン）' },
      { symbol: '$\\boldsymbol{x}$', desc: '方向が維持される固有ベクトル（ゼロでない入力ベクトル）' },
      { symbol: '$\\lambda$', desc: '線形変換による固有ベクトルの伸縮倍率（固有値スカラー出力）' }
    ],
    domain: '任意の線形空間上の線形変換（正方行列作用素）。',
    limitSignal: '非線形な写像や作用素に対しては固有値の線形重ね合わせが破綻。',
    timeReversibility: '純粋な代数構造であり時間変数に依存しない数学的一致関係。'
  },
  {
    id: 'math-unitary-transformation',
    pattern: /U\^\\dagger\s*U\s*=\s*I/,
    name: 'ユニタリ変換（$U^\\dagger U = I$）',
    desc: '複素内積空間においてベクトルの内積やノルム（確率の総和）を完全に保存する基底変換条件。',
    purpose: '複素ベクトル空間において、内積の大きさ・ベクトルの長さ・全確率の和を厳密に不変に保つ全単射変換条件を規定する。',
    elements: [
      { symbol: '$U$', desc: '複素線形基底変換演算子（時間発展演算子など）' },
      { symbol: '$U^\\dagger$', desc: 'エルミート共役（随伴作用素・逆回転作用）' },
      { symbol: '$I$', desc: '恒等演算子（恒等写像）' },
      { symbol: '$U^\\dagger U = I$', desc: '情報の散逸がなく完全に逆変換復元できるユニタリ保存条件' }
    ],
    domain: '複素ヒルベルト空間上の有界線形作用素（量子力学の時間発展演算子など）。',
    limitSignal: '散逸系・開放量子系（非エルミートハミルトニアン）ではユニタリ性が破綻。',
    timeReversibility: '逆写像 $U^{-1} = U^\\dagger$ が存在し、情報が完全保存される可逆変換。'
  },
  {
    id: 'math-cauchy-schwarz',
    pattern: /(\\langle\s*\\boldsymbol\{x\}.*\\boldsymbol\{y\}\s*\\rangle.*\\le|\\vert\s*\\langle)/,
    name: 'コーシー・シュワルツの不等式（$|\\langle \\boldsymbol{x}, \\boldsymbol{y} \\rangle|^2 \\le \\langle \\boldsymbol{x}, \\boldsymbol{x} \\rangle \\langle \\boldsymbol{y}, \\boldsymbol{y} \\rangle$）',
    desc: '内積の大きさが各ベクトルのノルムの積以下であることを示す内積空間の幾何学的基礎不等式。',
    purpose: '2つのベクトルの内積の大きさが、それぞれのベクトルの長さ（ノルム）の積を決して超えられない幾何学的上限境界を規定する。',
    elements: [
      { symbol: '$\\langle \\boldsymbol{x}, \\boldsymbol{y} \\rangle$', desc: '2つのベクトル間の内積（相互の重なり・射影成分）' },
      { symbol: '$\\langle \\boldsymbol{x}, \\boldsymbol{x} \\rangle, \\langle \\boldsymbol{y}, \\boldsymbol{y} \\rangle$', desc: '各ベクトルの自乗ノルム（自己の長さ・エネルギーの2乗）' },
      { symbol: '$\\le$', desc: '方向のコサイン制約（$|\\cos\\theta| \\le 1$）から必然的に導かれる普遍的上限制約' }
    ],
    domain: '任意の実・複素内積空間（ヒルベルト空間含む）。',
    limitSignal: '等号成立は2つのベクトルが線形従属（平行）である場合に限る（幾何学的普遍不等式）。',
    timeReversibility: '静的な幾何構造のため時間依存性なし。'
  },
  {
    id: 'analysis_fourier',
    pattern: /\\hat\{f\}\s*\(\s*\\xi\s*\)\s*=/ ,
    name: 'フーリエ変換（$\\hat{f}(\\xi) = \\int_{-\\infty}^{\\infty} f(x) e^{-2\\pi i x \\xi} dx$）',
    desc: '時間や空間の関数を周波数成分へと分解・変換する積分変換。',
    purpose: '時間や空間の波形 $f(x)$ を、周波数成分 $\\hat{f}(\\xi)$ へ分解・翻訳する変換処理。',
    elements: [
      { symbol: '$f(x)$', desc: '入力信号（時間や位置ごとの波形の強さ）' },
      { symbol: '$e^{-2\\pi i x \\xi}$', desc: '特定の周波数 $\\xi$ で回転する基準の波（探査用フィルター）' },
      { symbol: '$\\int_{-\\infty}^{\\infty} \\dots dx$', desc: '全区間にわたる「重なり具合（相関）」の足し合わせ' },
      { symbol: '$\\hat{f}(\\xi)$', desc: '抽出された周波数成分の強さと位相（出力結果）' }
    ],
    domain: '絶対可積分（$L^1$ 空間）または自乗可積分（$L^2$ 空間）な滑らかな関数。',
    limitSignal: '無限遠で減衰しない関数（多項式や周期関数単体）では通常の積分が発散（超関数論が必要）。',
    timeReversibility: '逆変換が存在する全単射変換（情報が完全に保存される可逆な数学的操作）。'
  },
  {
    id: 'analysis_gauss_divergence',
    pattern: /(\\iiint|\\iint).*\\nabla\s*\\cdot/,
    name: 'ガウスの発散定理（$\\iiint_V (\\nabla \\cdot \\boldsymbol{F}) dV = \\iint_S (\\boldsymbol{F} \\cdot \\boldsymbol{n}) dS$）',
    desc: '立体領域内のベクトルの発散の総和が、閉曲面を通過する流束に一致することを示す定理。',
    purpose: '立体領域 $V$ の内部で湧き出したベクトル場の総和（体積積分）が、境界面 $S$ を突き抜けて外部へ流出する全流束（面積分）に厳密一致することを示す。',
    elements: [
      { symbol: '$\\nabla \\cdot \\boldsymbol{F}$', desc: '領域内部各点におけるベクトル場 $\\boldsymbol{F}$ の局所的な湧き出し密度' },
      { symbol: '$\\iiint_V \\dots dV$', desc: '有界立体領域 $V$ 全体にわたる局所湧き出しの総積分合算' },
      { symbol: '$\\boldsymbol{n} dS$', desc: '境界曲面 $S$ の外向き単位法線ベクトルと微小面積要素' },
      { symbol: '$\\iint_S (\\boldsymbol{F} \\cdot \\boldsymbol{n}) dS$', desc: '境界表面全体を貫いて外へ流出する正味の総フラックス' }
    ],
    domain: '境界が区分的になめらかな有界閉領域 $V$、および連続微分可能なベクトル場 $\\boldsymbol{F}$。',
    limitSignal: '領域内に特異点（点電荷による無限大発散など）が存在する場合、通常の積分が破綻（デルタ関数的処理が必要）。',
    timeReversibility: '静的な幾何学・多変量微積分の一致定理のため時間依存性なし。'
  },
  {
    id: 'analysis-stokes-theorem',
    pattern: /(\\iint_S.*\\nabla\s*\\times|\\oint_C.*\\boldsymbol\{A\})/,
    name: 'ストークスの定理（$\\iint_S (\\nabla \\times \\boldsymbol{A}) \\cdot d\\boldsymbol{S} = \\oint_C \\boldsymbol{A} \\cdot d\\boldsymbol{r}$）',
    desc: '閉曲線の線積分とそれを張る曲面の面積分を回転作用素（渦）を通じて結ぶベクトル解析の積分定理。',
    purpose: '曲面 $S$ 全体にわたるベクトル場の渦度（回転）の総流束が、その境界ループ $C$ を周回する線積分（循環量）に一致することを示す。',
    elements: [
      { symbol: '$\\nabla \\times \\boldsymbol{A}$', desc: 'ベクトル場 $\\boldsymbol{A}$ の局所的な回転・渦の強さと軸方向' },
      { symbol: '$\\iint_S \\dots \\cdot d\\boldsymbol{S}$', desc: '曲面全体にわたる微小渦フラックスの面積分総和' },
      { symbol: '$d\\boldsymbol{r}$', desc: '境界閉曲線 $C$ に沿った微小接線変位ベクトル' },
      { symbol: '$\\oint_C \\boldsymbol{A} \\cdot d\\boldsymbol{r}$', desc: '境界ループを一巡したときのベクトルの仕事・循環量出力' }
    ],
    domain: '区分的になめらかな境界曲線 $C$ を持つ向き付け可能な曲面 $S$、および $C^1$ 級ベクトル場 $\\boldsymbol{A}$。',
    limitSignal: '曲面内に特異線（渦糸や特異磁束）が存在する場合、通常の微積分が破綻。',
    timeReversibility: '静的な幾何学・場の一致関係のため時間依存性なし。'
  },
  {
    id: 'analysis-dirac-delta',
    pattern: /\\int.*\\delta\s*\(.*x\s*-\s*a\s*\)/,
    name: 'ディラックのデルタ関数の性質（$\\int_{-\\infty}^{\\infty} f(x)\\delta(x - a)dx = f(a)$）',
    desc: '点電荷や瞬間的インパルスなど局在した極限的特異点を厳密に扱う超関数のふるい分け特性。',
    purpose: '任意関数 $f(x)$ から特定の位置 $x = a$ における値をピンポイントで標本抽出（ふるい分けサンプリング）する超関数作用。',
    elements: [
      { symbol: '$f(x)$', desc: '任意の連続・滑らかなテスト関数（入力信号）' },
      { symbol: '$\\delta(x - a)$', desc: '$x = a$ のみで無限大に局在し、積分が1となる理想インパルス（サンプラー）' },
      { symbol: '$\\int_{-\\infty}^{\\infty} \\dots dx$', desc: '全空間にわたる畳み込み積分' },
      { symbol: '$f(a)$', desc: '点 $x=a$ でピンポイント抽出された標本値（出力結果）' }
    ],
    domain: '試験関数 $f(x)$ が $x = a$ で連続かつ滑らかな超関数空間（シュワルツ空間）。',
    limitSignal: 'デルタ関数同士の非線形積（$\\delta(x)^2$ 等）は通常の超関数論では定義できず発散。',
    timeReversibility: '静的な超関数作用素の特性のため時間依存性なし。'
  },
  {
    id: 'math_euler_formula',
    pattern: /e\^\{\s*i\\theta\s*\}\s*=\s*\\cos/,
    name: 'オイラーの公式（$e^{i\\theta} = \\cos\\theta + i\\sin\\theta$）',
    desc: '指数関数と三角関数を複素数の世界で統一的に結びつける関係式。',
    purpose: '複素指数関数を、複素平面上における単位円周回転（同相の実部 $\\cos$ と直交虚部 $\\sin$ の合成）として幾何学的に展開する。',
    elements: [
      { symbol: '$\\theta$', desc: '回転角・位相パラメータ', varKey: 'theta', unit: 'rad', defaultVal: 3.1416 },
      { symbol: '$e^{i\\theta}$', desc: '単位円周回転作用素' },
      { symbol: '$\\cos\\theta$', desc: '実軸投影（水平成分）', varKey: 'cos', unit: '', defaultVal: -1.0, target: true },
      { symbol: '$i\\sin\\theta$', desc: '虚軸投影（垂直成分）', varKey: 'sin', unit: '', defaultVal: 0.0, target: true }
    ],
    solve: (vals) => ({ cos: Math.cos(vals.theta), sin: Math.sin(vals.theta) }),
    domain: '任意の実数および複素数 $\\theta$（複素平面全体）。',
    limitSignal: '数学的な恒等式のため適用限界なし（あらゆる複素数値に対して厳密に成立）。',
    timeReversibility: '数学的恒等式のため時間依存性は直接なし。'
  },
  {
    id: 'taylor-expansion',
    pattern: /f\s*\(\s*x\s*\)\s*&?=/,
    name: 'テイラー展開',
    desc: '滑らかな関数を特定の一点まわりの多項式で近似展開する解析学の基本定理。',
    purpose: '任意の滑らかな関数 $f(x)$ を、基準点 $a$ まわりの多階導関数（勾配・曲率等）を用いた多項式級数の和として段階的に近似復元する。',
    elements: [
      { symbol: '$f(a)$', desc: '基準点 $a$ での関数の値（0次項・高さの基準）' },
      { symbol: '$f\'(a)(x-a)$', desc: '1階導関数による一次接線補正（傾き・線形近似）' },
      { symbol: '$\\frac{f\'\'(a)}{2!}(x-a)^2$', desc: '2階導関数による二次曲率補正（放物線近似）' },
      { symbol: '$\\frac{f^{(n)}(a)}{n!}(x-a)^n$', desc: '高次導関数による微細形状の漸近補正項' }
    ],
    domain: '展開中心点 $a$ の近傍で関数 $f(x)$ が無限回微分可能（$C^\\infty$ 級）かつ収束半径 $|x - a| < R$ の内部。',
    limitSignal: '特異点（発散点・不連続点）を超えると級数は発散し近似が破綻。非解析的滑らかな関数では剰余項がゼロに収束しない。',
    timeReversibility: '静的な数学構造のため時間依存性は直接なし。'
  }
];

const inputArea = document.getElementById('formula-input');
const previewArea = document.getElementById('formula-preview');
const warningBadge = document.getElementById('syntax-warning');
const floatingTooltip = document.getElementById('symbol-tooltip');

function hideSymbolTooltip() {
  if (!floatingTooltip) return;
  floatingTooltip.classList.remove('visible');
  floatingTooltip.setAttribute('aria-hidden', 'true');
}

// 解説文中のインラインLaTeX（$...$）をKaTeX描画する関数
function renderExplanationText(el, text) {
  if (!el) return;
  if (!text) {
    el.innerHTML = '';
    return;
  }
  const parts = text.split(/(\$[^$]+\$)/g);
  el.innerHTML = '';
  parts.forEach((part) => {
    if (part.startsWith('$') && part.endsWith('$')) {
      const math = part.slice(1, -1);
      const span = document.createElement('span');
      if (typeof katex !== 'undefined') {
        try {
          katex.render(math, span, { throwOnError: false, displayMode: false });
        } catch {
          span.textContent = part;
        }
      } else {
        span.textContent = part;
      }
      el.appendChild(span);
    } else if (part) {
      el.appendChild(document.createTextNode(part));
    }
  });
}

// 未知数・連動計算を実行するソルバーヘルパー関数
function runSolver(formula, inputsMap, triggerKey) {
  if (!formula || typeof formula.solve !== 'function') return;
  const currentValues = {};
  for (const [key, input] of Object.entries(inputsMap)) {
    const num = parseFloat(input.value);
    currentValues[key] = isNaN(num) ? 0 : num;
  }

  const result = formula.solve(currentValues, triggerKey);
  if (result && typeof result === 'object') {
    for (const [key, val] of Object.entries(result)) {
      const targetInput = inputsMap[key];
      if (targetInput && typeof val === 'number' && !isNaN(val) && isFinite(val)) {
        const formatted = (Math.abs(val) >= 1e6 || (Math.abs(val) > 0 && Math.abs(val) < 1e-3))
          ? val.toExponential(4)
          : parseFloat(val.toFixed(4)).toString();
        targetInput.value = formatted;
        targetInput.classList.add('computed-target');
      }
    }
  }
}

// 各要素の役割リストおよび数値シミュレーション入力を描画する関数
function renderElementsList(container, elements, formula) {
  if (!container) return;
  container.innerHTML = '';
  if (!Array.isArray(elements) || elements.length === 0) return;

  const inputsMap = {};

  elements.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'element-row';

    // 左側：記号＋説明
    const infoDiv = document.createElement('div');
    infoDiv.className = 'element-info';

    const symbolSpan = document.createElement('span');
    symbolSpan.className = 'element-symbol';
    renderExplanationText(symbolSpan, item.symbol);

    const descSpan = document.createElement('span');
    descSpan.className = 'element-desc';
    renderExplanationText(descSpan, item.desc);

    infoDiv.appendChild(symbolSpan);
    infoDiv.appendChild(descSpan);
    row.appendChild(infoDiv);

    // 右側：数値入力＋単位（varKeyが定義されている場合）
    if (item.varKey) {
      const calcDiv = document.createElement('div');
      calcDiv.className = 'element-calc-control';

      if (item.isConstant) {
        const constTag = document.createElement('span');
        constTag.className = 'constant-tag';
        constTag.textContent = '定数';
        calcDiv.appendChild(constTag);
      }

      const input = document.createElement('input');
      input.type = 'number';
      input.className = 'element-input';
      input.dataset.varKey = item.varKey;
      if (item.defaultVal !== undefined) {
        input.value = item.defaultVal;
      }
      if (item.isConstant) {
        input.readOnly = true;
      }
      if (item.target) {
        input.classList.add('computed-target');
      }

      calcDiv.appendChild(input);

      if (item.unit) {
        const unitSpan = document.createElement('span');
        unitSpan.className = 'element-unit';
        unitSpan.textContent = item.unit;
        calcDiv.appendChild(unitSpan);
      }

      inputsMap[item.varKey] = input;

      input.addEventListener('input', () => {
        input.classList.remove('computed-target');
        if (formula && formula.solve) {
          runSolver(formula, inputsMap, item.varKey);
        }
      });

      row.appendChild(calcDiv);
    }

    container.appendChild(row);
  });

  // 初回描画時に初期計算を実行して整合性を取る
  if (formula && formula.solve) {
    runSolver(formula, inputsMap);
  }
}





function autoResizeInput() {
  if (!inputArea) return;
  inputArea.style.height = 'auto';
  const nextH = Math.min(Math.max(inputArea.scrollHeight, 96), 420);
  inputArea.style.height = `${nextH}px`;
}

// ==========================================
// 独自ダイアグラム & チャート 統合マスターレジストリ
// （入力欄インジケーター判定 & プレビュー描画ルーティングの一元化）
// ==========================================
const DIAGRAM_DEFINITIONS = [
  // 1. グラフ・統計チャート（pgfplots / pgf-pie / 独自 \chart）※最優先
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
  // 4. ウォーターフォール図 (pgfplots / TikZ または \waterfall)
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
  // 9. 組織階層図
  {
    id: 'orgchart',
    match: (t) => /\\(orgchart|organization|org)\{/i.test(t),
    badge: {
      text: '独自書式 (組織階層図)',
      cls: 'badge-custom',
      desc: '\\orgchart{ title: ...; "親" -> "子"; "親" -- "スタッフ" [タグ]; }'
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
  // 11. シーケンス図
  {
    id: 'sequence',
    match: (t) => /\\(sequence|seq)\{/i.test(t),
    badge: {
      text: '独自書式 (シーケンス図)',
      cls: 'badge-custom',
      desc: '\\sequence{ title: ...; actor: "クライアント"; "クライアント" -> "サーバ": 要求; }'
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
  // 19. 状態遷移図 (FSM)
  {
    id: 'fsm',
    match: (t) => /\\(fsm|automaton)\{/i.test(t),
    badge: {
      text: '独自書式 (状態遷移図)',
      cls: 'badge-custom',
      desc: '\\fsm{ 状態A -> 状態B: イベント; }'
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
  // 31. ロードマップ図 (マイルストーン年表・タイムライン)
  {
    id: 'roadmap',
    match: (t) => /\\(roadmap|timeline)\{|\\(?:startchronology|chronoevent|chronoperiod)|\\smartdiagram(?!\s*\[\s*priority)/i.test(t),
    badge: {
      text: 'ロードマップ図 (マイルストーン年表・タイムライン)',
      cls: 'badge-custom',
      desc: '\\roadmap{ title: "開発計画"; "2026 Q1": "αリリース"; } または chronosys'
    },
    cls: 'roadmap-preview-container',
    label: 'ロードマップ図',
    getFn: () => typeof drawRoadmapSvg === 'function' ? drawRoadmapSvg : null
  },
  // 32. 結晶構造・格子モデル
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
  // 33. 汎用シナリオ・概念図 (フリーフロー)
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
  // 34. テンソルネットワーク・ペンローズ記法
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
  // 35. 2軸マップ独自書式
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
  // 36. LaTeX TikZ 4象限ポジショニングマップ・マトリクス図
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
  }
];

function updateSyntaxIndicator(rawText) {
  const badgeEl = document.getElementById('syntax-type-badge');
  const descEl = document.getElementById('syntax-type-desc');
  if (!badgeEl || !descEl) return;

  const trimmed = (rawText || '').trim();
  if (!trimmed) {
    badgeEl.textContent = '未入力';
    badgeEl.className = 'syntax-badge badge-empty';
    descEl.textContent = '数式・表・図表のコードを入力してください';
    return;
  }

  // 1. マスターレジストリから走査
  for (const def of DIAGRAM_DEFINITIONS) {
    if (def.match(trimmed)) {
      badgeEl.textContent = def.badge.text;
      badgeEl.className = `syntax-badge ${def.badge.cls}`;
      descEl.textContent = def.badge.desc;
      return;
    }
  }

  // 2. 表形式の検出 (parseAnyTable で判定)
  if (typeof parseAnyTable === 'function' && parseAnyTable(trimmed) !== null) {
    badgeEl.textContent = '表形式 (Table)';
    badgeEl.className = 'syntax-badge badge-table';
    descEl.textContent = 'Markdown表 (| a | b |)、CSV、TSV、または LaTeX tabular環境';
    return;
  }

  // 3. 化学構造式 (平面構造式)
  if (/\\(chemfig|smiles)\{/i.test(trimmed)) {
    badgeEl.textContent = '化学構造式 (平面構造式)';
    badgeEl.className = 'syntax-badge badge-chem-struct';
    descEl.textContent = 'SMILES / ChemFig (例: \\smiles{...})';
    return;
  }

  // 4. 化学式 (分子式・反応式)
  if (/\\ce\{/i.test(trimmed)) {
    badgeEl.textContent = '化学式 (分子式・反応式)';
    badgeEl.className = 'syntax-badge badge-chem-formula';
    descEl.textContent = 'mhchem準拠 (例: \\ce{H2O}, \\ce{C8H10N4O2}, \\ce{2H2 + O2 -> 2H2O})';
    return;
  }

  // 5. 汎用 LaTeX TikZ 図形環境
  if (/\\begin\{tikzpicture\}/i.test(trimmed)) {
    badgeEl.textContent = 'LaTeX (TikZ 図形)';
    badgeEl.className = 'syntax-badge badge-latex';
    descEl.textContent = '\\begin{tikzpicture} ... \\end{tikzpicture} (汎用TikZ描画環境)';
    return;
  }

  // 6. デフォルトは LaTeX数式
  badgeEl.textContent = 'LaTeX数式';
  badgeEl.className = 'syntax-badge badge-latex';
  descEl.textContent = 'KaTeX準拠 (例: F = m * a, \\frac{a}{b}, \\int, 行列)';
}

// ==========================================
// 独自ダイアグラムのプレビュー描画共通ヘルパー
// ==========================================
function renderCustomDiagramElement(containerClass, label, drawFn, text, previewArea, warningBadge, previewBox, explanationCard) {
  previewArea.innerHTML = '';
  const container = document.createElement('div');
  container.className = containerClass;
  drawFn(text, container, label);
  previewArea.appendChild(container);

  if (warningBadge) warningBadge.style.display = 'none';
  if (previewBox) {
    previewBox.style.opacity = '1.0';
    previewBox.removeAttribute('data-formula-tip');
  }
  if (explanationCard) explanationCard.style.display = 'none';
  return true;
}

function updatePreview() {
  autoResizeInput();
  hideSymbolTooltip();
  updateSyntaxIndicator(inputArea ? inputArea.value : '');
  if (typeof katex === 'undefined') {
    return;
  }

  let rawText = inputArea.value;

  // 1. 円マークを半角バックスラッシュに統一
  let text = rawText.replace(/[¥￥]/g, '\\');

  const previewBox = previewArea.parentElement;
  const explanationCard = document.getElementById('formula-explanation');
  const explanationTitle = document.getElementById('explanation-title');
  const explanationPurpose = document.getElementById('explanation-purpose');
  const explanationPurposeItem = document.getElementById('explanation-purpose-item');
  const explanationElements = document.getElementById('explanation-elements');
  const explanationElementsItem = document.getElementById('explanation-elements-item');
  const explanationRange = document.getElementById('explanation-range');
  const explanationLimit = document.getElementById('explanation-limit');
  const explanationTime = document.getElementById('explanation-time');

  // ==========================================
  // ダイアグラム・チャート（DIAGRAM_DEFINITIONS）の一括判定＆描画
  // ==========================================
  for (const def of DIAGRAM_DEFINITIONS) {
    if (def.match(text)) {
      const fn = def.getFn();
      if (fn) {
        renderCustomDiagramElement(def.cls, def.label, fn, text, previewArea, warningBadge, previewBox, explanationCard);
        return;
      }
    }
  }

  // ==========================================
  // 表（テーブル：Markdown / CSV / TSV / LaTeX tabular）の検出と処理
  // ==========================================
  const tableData = parseAnyTable(text);
  if (tableData) {
    renderCustomDiagramElement('table-preview-container', 'データ表', (t, c, l) => renderTableElement(tableData, c, l), text, previewArea, warningBadge, previewBox, explanationCard);
    return;
  }

  // ==========================================
  // 化学構造式 (\chemfig / \smiles) の検出と処理
  // ==========================================
  const chemRegex = /\\(chemfig|smiles)\{((?:[^{}]|\{[^{}]*\})*)\}/g;
  const chemMatches = [];
  let chemMatch;
  while ((chemMatch = chemRegex.exec(text)) !== null) {
    const type = chemMatch[1];
    const content = chemMatch[2];
    let smiles = '';
    let label = '';
    if (type === 'smiles') {
      smiles = content.trim();
      label = '';
    } else {
      const res = chemfigToSmiles(content);
      if (res) {
        smiles = res.smiles;
        label = res.name;
      } else {
        smiles = content.trim();
        label = `chemfig: ${content}`;
      }
    }
    chemMatches.push({ raw: chemMatch[0], type, content, smiles, label });
  }

  // 入力が構造式のみの場合：KaTeXを通さず直接SVG描画
  const textWithoutChem = text.replace(/\\(chemfig|smiles)\{((?:[^{}]|\{[^{}]*\})*)\}/g, '').trim();
  if (chemMatches.length > 0 && textWithoutChem === '') {
    previewArea.innerHTML = '';
    chemMatches.forEach((item) => {
      const container = document.createElement('div');
      container.className = 'chem-structure-container';
      drawSmilesToElement(item.smiles, container, item.label);
      previewArea.appendChild(container);
    });

    warningBadge.style.display = 'none';
    previewBox.style.opacity = '1.0';
    previewBox.removeAttribute('data-formula-tip');
    if (explanationCard) explanationCard.style.display = 'none';
    return;
  }

  // 数式と混在している場合：KaTeX用の一時プレースホルダーに置換
  if (chemMatches.length > 0) {
    let chemIdx = 0;
    text = text.replace(/\\(chemfig|smiles)\{((?:[^{}]|\{[^{}]*\})*)\}/g, () => {
      const id = chemIdx++;
      return `\\htmlClass{chem-structure-slot chem-slot-${id}}{\\phantom{WW}}`;
    });
  }

  // 1-2. 外側数式デリミタ ($$ ... $$ または $ ... $) の自動除去
  const trimmedFormula = text.trim();
  if (trimmedFormula.startsWith('$$') && trimmedFormula.endsWith('$$') && trimmedFormula.length >= 4) {
    text = trimmedFormula.slice(2, -2).trim();
  } else if (trimmedFormula.startsWith('$') && trimmedFormula.endsWith('$') && trimmedFormula.length >= 2) {
    text = trimmedFormula.slice(1, -1).trim();
  }

  // 2. 数式全体の意味・物理的解説を検知してセット
  let matchedFormula = formulaDictionary.find((item) => item.pattern.test(text));
  if (matchedFormula) {
    previewBox.setAttribute('data-formula-tip', `【${matchedFormula.name}】 ${matchedFormula.desc}`);
    const domainText = matchedFormula.domain || matchedFormula.validRange;
    const limitText = matchedFormula.limitSignal;
    const timeText = matchedFormula.timeReversibility || matchedFormula.timeAllowance;
    if (domainText && explanationCard) {
      explanationCard.style.display = 'block';
      renderExplanationText(explanationTitle, `📘 ${matchedFormula.name} の物理的考察・構造分解`);

      // 数式の目的（全体像）の描画
      if (matchedFormula.purpose && explanationPurposeItem && explanationPurpose) {
        explanationPurposeItem.style.display = 'flex';
        renderExplanationText(explanationPurpose, matchedFormula.purpose);
      } else if (explanationPurposeItem) {
        explanationPurposeItem.style.display = 'none';
      }

      // 各要素の役割（引数・内部変数・数値入力）の描画
      if (matchedFormula.elements && explanationElementsItem && explanationElements) {
        explanationElementsItem.style.display = 'flex';
        renderElementsList(explanationElements, matchedFormula.elements, matchedFormula);
      } else if (explanationElementsItem) {
        explanationElementsItem.style.display = 'none';
      }

      renderExplanationText(explanationRange, domainText);
      renderExplanationText(explanationLimit, limitText);
      renderExplanationText(explanationTime, timeText);
    } else if (explanationCard) {
      explanationCard.style.display = 'none';
    }
  } else {
    previewBox.removeAttribute('data-formula-tip');
    if (explanationCard) {
      explanationCard.style.display = 'none';
    }
  }

  // 3. 各記号へのクラス名の付与（連続記号・添字・TeXコマンドを安全に個別認識）
  const placeholders = [];
  const createPlaceholder = (content) => {
    const id = placeholders.length;
    placeholders.push(content);
    return `§#${id}#§`;
  };

  // 3-1. LaTeX環境・テキスト構文・化学式の保護
  text = text.replace(/\\begin\{[^}]+\}|\\end\{[^}]+\}|\\text\{[^}]*\}|\\mathrm\{[^}]*\}|\\operatorname\{[^}]*\}|\\ce\{(?:[^{}]|\{[^{}]*\})*\}/g, (match) => {
    return createPlaceholder(match);
  });

  // 3-2. 数学関数名・定数単語の保護（sin, cos, ln, const など英字単語）
  text = text.replace(/\\?(?:sin|cos|tan|arcsin|arccos|arctan|sinh|cosh|tanh|log|ln|exp|det|lim|max|min|const|deg)(?![a-zA-Z])/g, (match) => {
    return createPlaceholder(match);
  });

  // 3-3. 辞書に含まれるTeXコマンド（\boldsymbol{v}, \theta, \partial 等）を長さ降順で置換
  const dictTexCommands = Object.keys(physicsDictionary)
    .filter((k) => k.startsWith('\\'))
    .sort((a, b) => b.length - a.length);

  for (const symbol of dictTexCommands) {
    const info = physicsDictionary[symbol];
    const safeId = symbol.replace(/[^a-zA-Z0-9_-]/g, '_');
    const escaped = symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`${escaped}(?![a-zA-Z])`, 'g');
    text = text.replace(regex, () => {
      return createPlaceholder(`\\htmlClass{symbol-tip ${info.cls} symbol-id-${safeId}}{${symbol}}`);
    });
  }

  // 3-4. 辞書以外の残りの汎用TeXコマンド（\frac, \cdot 等）を保護
  text = text.replace(/\\[a-zA-Z]+(?![a-zA-Z])/g, (match) => {
    return createPlaceholder(match);
  });

  // 3-5. 辞書にある添字付き英字記号や特殊複合記号（v_0, q_1, k_B, f' 等）を置換
  const multiCharSymbols = Object.keys(physicsDictionary)
    .filter((k) => !k.startsWith('\\') && (k.length > 1 || !/^[a-zA-Z]$/.test(k)))
    .sort((a, b) => b.length - a.length);

  for (const symbol of multiCharSymbols) {
    const info = physicsDictionary[symbol];
    const safeId = symbol.replace(/[^a-zA-Z0-9_-]/g, '_');
    const escaped = symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`${escaped}(?![a-zA-Z0-9'])`, 'g');
    text = text.replace(regex, () => {
      return createPlaceholder(`\\htmlClass{symbol-tip ${info.cls} symbol-id-${safeId}}{${symbol}}`);
    });
  }

  // 3-6. 辞書に未定義の添字（_{...} または _[a-zA-Z0-9]+）を一時保護（添字文字の誤認識防止）
  text = text.replace(/_(?:\{[^}]+\}|[a-zA-Z0-9]+)/g, (match) => {
    return createPlaceholder(match);
  });

  // 3-7. 1文字の英字記号（F, k, x, m, a, c, I, R 等）の置換（kx, PV, IR 等の連続した変数も個別置換）
  const singleCharSymbols = Object.keys(physicsDictionary)
    .filter((k) => !k.startsWith('\\') && /^[a-zA-Z]$/.test(k));

  const singleCharMap = new Map();
  for (const sym of singleCharSymbols) {
    singleCharMap.set(sym, physicsDictionary[sym]);
  }

  text = text.replace(/[a-zA-Z]/g, (char) => {
    if (singleCharMap.has(char)) {
      const info = singleCharMap.get(char);
      const safeId = char.replace(/[^a-zA-Z0-9_-]/g, '_');
      return createPlaceholder(`\\htmlClass{symbol-tip ${info.cls} symbol-id-${safeId}}{${char}}`);
    }
    return char;
  });

  // 3-8. プレースホルダーをすべて復元（ネストにも対応）
  while (/§#(\d+)#§/.test(text)) {
    text = text.replace(/§#(\d+)#§/g, (_, id) => placeholders[parseInt(id, 10)]);
  }

  // 4. かけ算記号の正規化
  text = text.replace(/\*/g, '\\cdot');

  // 5. 改行コード（\\）が含まれており、かつ環境指定がない場合は gathered 環境で補完
  let renderText = text;
  if (/\\\\/.test(renderText) && !/\\begin\{/.test(renderText)) {
    renderText = `\\begin{gathered} ${renderText} \\end{gathered}`;
  }

  // 6. KaTeX描画処理
  try {
    katex.render(renderText, previewArea, {
      throwOnError: true,
      displayMode: true,
      trust: true
    });

    // レンダリング成功後：DOM走査により安全にTips属性を付与
    previewArea.querySelectorAll('.symbol-tip').forEach((el) => {
      for (const [symbol, info] of Object.entries(physicsDictionary)) {
        const safeId = symbol.replace(/[^a-zA-Z0-9_-]/g, '_');
        if (el.classList.contains(`symbol-id-${safeId}`)) {
          el.setAttribute('data-tip', info.desc);
          break;
        }
      }
    });

    // 混在構造式スロットへのSVG注入
    if (chemMatches.length > 0) {
      chemMatches.forEach((item, idx) => {
        const slotEl = previewArea.querySelector(`.chem-slot-${idx}`);
        if (slotEl) {
          slotEl.innerHTML = '';
          drawSmilesToElement(item.smiles, slotEl, item.label);
        }
      });
    }

    // 枠幅に応じた自動スケール調整（枠幅を超えた場合に縮小）
    const katexEl = previewArea.querySelector('.katex');
    if (katexEl) {
      katexEl.style.transform = 'none';
      const containerWidth = previewArea.clientWidth - 32;
      const formulaWidth = katexEl.scrollWidth;
      if (formulaWidth > containerWidth && containerWidth > 0) {
        const scale = Math.max(0.4, containerWidth / formulaWidth);
        katexEl.style.transform = `scale(${scale})`;
      } else {
        katexEl.style.transform = 'none';
      }
    }

    // 正常描画：警告を非表示にし、数式の透明度を通常化
    warningBadge.style.display = 'none';
    previewBox.style.opacity = '1.0';

  } catch (err) {
    // エラー時：警告バッジを表示し、詳細メッセージをTipsとして格納
    warningBadge.style.display = 'inline-flex';
    warningBadge.setAttribute('data-error-detail', `構文確認中: ${err.message}`);
    previewBox.style.opacity = '0.55'; // 直前の数式をうっすら維持
  }
}

function showSymbolTooltip(targetEl, text) {
  if (!floatingTooltip || !text) return;
  floatingTooltip.textContent = text;
  floatingTooltip.classList.add('visible');
  floatingTooltip.setAttribute('aria-hidden', 'false');

  const rect = targetEl.getBoundingClientRect();
  const left = rect.left + rect.width / 2;
  const top = rect.top;

  floatingTooltip.style.left = `${left}px`;
  floatingTooltip.style.top = `${top}px`;
}

previewArea.addEventListener('mouseover', (e) => {
  const targetSymbol = e.target.closest('.symbol-tip[data-tip]');
  console.log('[mouseover]', {
    target: e.target,
    targetSymbol: targetSymbol,
    tip: targetSymbol ? targetSymbol.getAttribute('data-tip') : null,
    rect: targetSymbol ? targetSymbol.getBoundingClientRect() : null
  });
  if (targetSymbol) {
    showSymbolTooltip(targetSymbol, targetSymbol.getAttribute('data-tip'));
  }
});

previewArea.addEventListener('mouseout', (e) => {
  const targetSymbol = e.target.closest('.symbol-tip[data-tip]');
  console.log('[mouseout]', {
    target: e.target,
    relatedTarget: e.relatedTarget,
    targetSymbol: targetSymbol
  });
  if (targetSymbol) {
    hideSymbolTooltip();
  }
});

// 入力イベントに合わせてリアルタイム更新
inputArea.addEventListener('input', () => {
  hideSymbolTooltip();
  updatePreview();
});

// ==========================================
// プレビュー全画面表示（拡大）切り替え制御
// ==========================================
const previewContainer = document.querySelector('.preview-container');
const previewFullscreenBtn = document.getElementById('preview-fullscreen-btn');

function togglePreviewFullscreen() {
  if (!previewContainer || !previewFullscreenBtn) return;
  const isFullscreen = previewContainer.classList.toggle('is-fullscreen');
  document.body.classList.toggle('preview-fullscreen-active', isFullscreen);

  const iconEl = previewFullscreenBtn.querySelector('.fullscreen-btn-icon');
  const textEl = previewFullscreenBtn.querySelector('.fullscreen-btn-text');

  if (isFullscreen) {
    if (iconEl) iconEl.textContent = '✕';
    if (textEl) textEl.textContent = '戻る';
    previewFullscreenBtn.title = '通常表示に戻る (Esc)';
    previewFullscreenBtn.setAttribute('aria-label', '通常表示に戻る');
  } else {
    if (iconEl) iconEl.textContent = '⛶';
    if (textEl) textEl.textContent = '全画面';
    previewFullscreenBtn.title = '全画面表示（拡大）';
    previewFullscreenBtn.setAttribute('aria-label', '全画面表示');
  }
}

if (previewFullscreenBtn) {
  previewFullscreenBtn.addEventListener('click', togglePreviewFullscreen);
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && previewContainer && previewContainer.classList.contains('is-fullscreen')) {
    togglePreviewFullscreen();
  }
});



// 数式ライブラリモーダルの制御
const libraryModal = document.getElementById('library-modal');
const closeLibraryXBtn = document.getElementById('modal-close-x');
const closeLibraryFooterBtn = document.getElementById('modal-close-footer');
const searchInput = document.getElementById('library-search-input');
const categoryTabs = document.querySelectorAll('.category-tab');
const cardGrid = document.getElementById('library-card-grid');
const emptyMessage = document.getElementById('library-empty-message');

let currentCategory = 'すべて';

function openModal() {
  libraryModal.classList.add('active');
  libraryModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  searchInput.value = '';
  currentCategory = 'すべて';
  categoryTabs.forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.category === 'すべて');
  });
  renderFormulaCards();
  searchInput.focus();
}

function closeModal() {
  libraryModal.classList.remove('active');
  libraryModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

function renderFormulaCards() {
  const query = searchInput.value.trim().toLowerCase();
  cardGrid.innerHTML = '';

  const filtered = formulaLibrary.filter((item) => {
    const matchCategory = currentCategory === 'すべて' || item.category === currentCategory;
    const matchTags = Array.isArray(item.tags) && item.tags.some((t) => t.toLowerCase().includes(query));
    const matchQuery =
      !query ||
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      matchTags;
    return matchCategory && matchQuery;
  });

  if (filtered.length === 0) {
    emptyMessage.style.display = 'block';
  } else {
    emptyMessage.style.display = 'none';
    filtered.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'formula-card';

      const top = document.createElement('div');
      top.className = 'card-top';

      const name = document.createElement('span');
      name.className = 'card-name';
      name.textContent = item.name;

      const tag = document.createElement('span');
      tag.className = 'card-tag';
      tag.textContent = item.category;

      top.appendChild(name);
      top.appendChild(tag);

      const preview = document.createElement('div');
      preview.className = 'card-preview';
      if (typeof katex !== 'undefined') {
        try {
          katex.render(item.latex.replace(/\*/g, '\\cdot'), preview, {
            throwOnError: false,
            displayMode: true
          });
        } catch {
          preview.textContent = item.latex;
        }
      } else {
        preview.textContent = item.latex;
      }

      const desc = document.createElement('p');
      desc.className = 'card-desc';
      desc.textContent = item.description;

      card.appendChild(top);
      card.appendChild(preview);
      card.appendChild(desc);

      card.addEventListener('click', () => {
        inputArea.value = item.latex;
        closeModal();
        updatePreview();
      });

      cardGrid.appendChild(card);
    });
  }
}

if (closeLibraryXBtn) closeLibraryXBtn.addEventListener('click', closeModal);
if (closeLibraryFooterBtn) closeLibraryFooterBtn.addEventListener('click', closeModal);

libraryModal.addEventListener('click', (e) => {
  if (e.target === libraryModal) {
    closeModal();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && libraryModal.classList.contains('active')) {
    closeModal();
  }
});

searchInput.addEventListener('input', renderFormulaCards);

categoryTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    categoryTabs.forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');
    currentCategory = tab.dataset.category;
    renderFormulaCards();
  });
});


// ==========================================
// 共通 図表・ライブラリ モーダル制御
// ==========================================

const diagramLibraryModal = document.getElementById('diagram-library-modal');
const diagramModalTitle = document.getElementById('diagram-modal-title');
const diagramModalCloseX = document.getElementById('diagram-modal-close-x');
const diagramModalCloseFooter = document.getElementById('diagram-modal-close-footer');
const diagramSearchInput = document.getElementById('diagram-library-search-input');
const diagramCategoryTabs = document.getElementById('diagram-library-category-tabs');
const diagramCardGrid = document.getElementById('diagram-library-card-grid');
const diagramEmptyMessage = document.getElementById('diagram-library-empty-message');

let currentDiagramType = '';
let currentDiagramCategory = 'すべて';

const diagramLibraryConfigs = {
  'chem-formula': {
    modalTitle: '化学式（分子式・反応式）ライブラリ',
    getData: () => (typeof chemFormulaLibrary !== 'undefined' ? chemFormulaLibrary : []),
    cardClass: 'chem-formula-card',
    tagClass: 'chem-formula-card-tag',
    renderPreview: (item, el) => {
      if (typeof katex !== 'undefined') {
        katex.render(item.code, el, { throwOnError: false, displayMode: true });
      } else {
        el.textContent = item.code;
      }
    }
  },
  chem: {
    modalTitle: '化学構造式ライブラリ',
    getData: () => (typeof chemLibrary !== 'undefined' ? chemLibrary : []),
    cardClass: 'chem-card',
    tagClass: 'chem-card-tag',
    previewClass: 'chem-card-preview',
    renderPreview: (item, el) => {
      if (item.renderType === 'smiles' && item.smiles) {
        drawSmilesToElement(item.smiles, el, item.name);
      } else if (typeof katex !== 'undefined') {
        katex.render(item.code, el, { throwOnError: false, displayMode: true });
      } else {
        el.textContent = item.code;
      }
    }
  },
  circuit: {
    modalTitle: '電子回路ライブラリ',
    getData: () => (typeof circuitLibrary !== 'undefined' ? circuitLibrary : []),
    cardClass: 'circuit-card',
    tagClass: 'circuit-card-tag',
    previewClass: 'circuit-card-preview',
    columnTop: true,
    renderPreview: (item, el) => drawCircuitSvg(item.code, el, null)
  },
  timing: {
    modalTitle: 'タイミングチャート ライブラリ',
    getData: () => (typeof timingLibrary !== 'undefined' ? timingLibrary : []),
    cardClass: 'timing-card',
    tagClass: 'timing-card-tag',
    previewClass: 'timing-card-preview',
    columnTop: true,
    renderPreview: (item, el) => drawTimingSvg(item.code, el, null)
  },
  fsm: {
    modalTitle: '状態遷移図（オートマトン）ライブラリ',
    getData: () => (typeof fsmLibrary !== 'undefined' ? fsmLibrary : []),
    cardClass: 'fsm-card',
    tagClass: 'fsm-card-tag',
    previewClass: 'fsm-card-preview',
    columnTop: true,
    renderPreview: (item, el) => drawFsmSvg(item.code, el, null)
  },
  feynman: {
    modalTitle: 'ファインマン・ダイアグラム ライブラリ',
    getData: () => (typeof feynmanLibrary !== 'undefined' ? feynmanLibrary : []),
    cardClass: 'feynman-card',
    tagClass: 'feynman-card-tag',
    previewClass: 'feynman-card-preview',
    renderPreview: (item, el) => drawFeynmanSvg(item.code, el, null)
  },
  sankey: {
    modalTitle: 'サンキーダイアグラム ライブラリ',
    getData: () => (typeof sankeyLibrary !== 'undefined' ? sankeyLibrary : []),
    cardClass: 'sankey-card',
    tagClass: 'sankey-card-tag',
    previewClass: 'sankey-card-preview',
    renderPreview: (item, el) => {
      if (/\\(bs|balancesheet|sankeybs)\{/i.test(item.code)) {
        drawBalanceSheetSvg(item.code, el, null);
      } else if (/\\(pl|incomestatement)\{/i.test(item.code)) {
        drawProfitAndLossSvg(item.code, el, null);
      } else {
        drawSankeySvg(item.code, el, null);
      }
    }
  },
  flowchart: {
    modalTitle: 'フローチャート ライブラリ',
    getData: () => (typeof flowchartLibrary !== 'undefined' ? flowchartLibrary : []),
    cardClass: 'flowchart-card',
    tagClass: 'flowchart-card-tag',
    previewClass: 'flowchart-card-preview',
    columnTop: true,
    renderPreview: (item, el) => drawFlowchartSvg(item.code, el, null)
  },
  table: {
    modalTitle: '表（テーブル）ライブラリ',
    getData: () => (typeof tableLibrary !== 'undefined' ? tableLibrary : []),
    cardClass: 'table-card',
    tagClass: 'table-card-tag',
    previewClass: 'table-card-preview',
    renderPreview: (item, el) => {
      const parsed = parseAnyTable(item.code);
      if (parsed) {
        renderTableElement(parsed, el, null);
      } else {
        el.textContent = item.code.substring(0, 50);
      }
    }
  },
  matrix: {
    modalTitle: '2軸マップ ライブラリ',
    getData: () => (typeof matrixLibrary !== 'undefined' ? matrixLibrary : []),
    cardClass: 'matrix-card',
    tagClass: 'matrix-card-tag',
    previewClass: 'matrix-card-preview',
    renderPreview: (item, el) => drawMatrixMapSvg(item.code, el, null)
  },
  pyramid: {
    modalTitle: 'ピラミッドチャート ライブラリ',
    getData: () => (typeof pyramidLibrary !== 'undefined' ? pyramidLibrary : []),
    cardClass: 'pyramid-card',
    tagClass: 'pyramid-card-tag',
    previewClass: 'pyramid-card-preview',
    renderPreview: (item, el) => drawPyramidSvg(item.code, el, null)
  },
  radar: {
    modalTitle: 'レーダーチャート ライブラリ',
    getData: () => (typeof radarLibrary !== 'undefined' ? radarLibrary : []),
    cardClass: 'radar-card',
    tagClass: 'radar-card-tag',
    previewClass: 'radar-card-preview',
    renderPreview: (item, el) => drawRadarSvg(item.code, el, null)
  },
  waterfall: {
    modalTitle: 'ウォーターフォールチャート ライブラリ',
    getData: () => (typeof waterfallLibrary !== 'undefined' ? waterfallLibrary : []),
    cardClass: 'waterfall-card',
    tagClass: 'waterfall-card-tag',
    previewClass: 'waterfall-card-preview',
    renderPreview: (item, el) => drawWaterfallSvg(item.code, el, null)
  },
  treemap: {
    modalTitle: 'ツリーマップ ライブラリ',
    getData: () => (typeof treemapLibrary !== 'undefined' ? treemapLibrary : []),
    cardClass: 'treemap-card',
    tagClass: 'treemap-card-tag',
    previewClass: 'treemap-card-preview',
    renderPreview: (item, el) => drawTreemapSvg(item.code, el, null)
  },
  gantt: {
    modalTitle: 'ガントチャート ライブラリ',
    getData: () => (typeof ganttLibrary !== 'undefined' ? ganttLibrary : []),
    cardClass: 'gantt-card',
    tagClass: 'gantt-card-tag',
    previewClass: 'gantt-card-preview',
    renderPreview: (item, el) => {
      if (/\\roadmap\{/i.test(item.code)) {
        drawRoadmapSvg(item.code, el, null);
      } else {
        drawGanttSvg(item.code, el, null);
      }
    }
  },
  capitaltree: {
    modalTitle: '資本系統樹・組織図 ライブラリ',
    getData: () => (typeof capitalTreeLibrary !== 'undefined' ? capitalTreeLibrary : []),
    cardClass: 'capitaltree-card',
    tagClass: 'capitaltree-card-tag',
    previewClass: 'capitaltree-card-preview',
    columnTop: true,
    renderPreview: (item, el) => {
      if (/\\radialtree\{/i.test(item.code)) {
        drawRadialTreeSvg(item.code, el, null);
      } else if (/\\orgchart\{/i.test(item.code)) {
        drawOrgChartSvg(item.code, el, null);
      } else {
        drawCapitalTreeSvg(item.code, el, null);
      }
    }
  },
  blockdiagram: {
    modalTitle: 'ブロック線図 ライブラリ',
    getData: () => (typeof blockDiagramLibrary !== 'undefined' ? blockDiagramLibrary : []),
    cardClass: 'blockdiagram-card',
    tagClass: 'blockdiagram-card-tag',
    previewClass: 'blockdiagram-card-preview',
    columnTop: true,
    renderPreview: (item, el) => drawBlockDiagramSvg(item.code, el, null)
  },
  roadmap: {
    modalTitle: 'ロードマップ ライブラリ',
    getData: () => (typeof roadmapLibrary !== 'undefined' ? roadmapLibrary : []),
    cardClass: 'roadmap-card',
    tagClass: 'roadmap-card-tag',
    previewClass: 'roadmap-card-preview',
    columnTop: true,
    previewStyle: { minHeight: '140px', background: '#fff', padding: '8px' },
    renderPreview: (item, el) => drawRoadmapSvg(item.code, el, null)
  },
  sequence: {
    modalTitle: 'シーケンス図 ライブラリ',
    getData: () => (typeof sequenceLibrary !== 'undefined' ? sequenceLibrary : []),
    cardClass: 'sequence-card',
    tagClass: 'sequence-card-tag',
    previewClass: 'sequence-card-preview',
    columnTop: true,
    renderPreview: (item, el) => drawSequenceDiagramSvg(item.code, el, null)
  },
  optics: {
    modalTitle: '光学系ダイアグラム ライブラリ',
    getData: () => (typeof opticsLibrary !== 'undefined' ? opticsLibrary : []),
    cardClass: 'optics-card',
    tagClass: 'optics-card-tag',
    previewClass: 'optics-card-preview',
    columnTop: true,
    renderPreview: (item, el) => drawOpticsDiagramSvg(item.code, el, null)
  },
  swot: {
    modalTitle: 'SWOT分析 ライブラリ',
    getData: () => (typeof swotLibrary !== 'undefined' ? swotLibrary : []),
    cardClass: 'swot-card',
    tagClass: 'swot-card-tag',
    previewClass: 'swot-card-preview',
    columnTop: true,
    renderPreview: (item, el) => drawSwotSvg(item.code, el, null)
  },
  chordpro: {
    modalTitle: 'ChordPro（コード譜）ライブラリ',
    getData: () => (typeof chordproLibrary !== 'undefined' ? chordproLibrary : (typeof chordProLibrary !== 'undefined' ? chordProLibrary : [])),
    cardClass: 'chordpro-card',
    tagClass: 'chordpro-card-tag',
    previewClass: 'chordpro-card-preview',
    renderPreview: (item, el) => {
      if (typeof drawChordPro === 'function') {
        const container = document.createElement('div');
        drawChordPro(item.code, container);
        container.style.zoom = '0.7';
        container.style.transformOrigin = 'top left';
        el.appendChild(container);
      } else {
        el.textContent = item.code;
      }
    }
  },
  guitarchords: {
    modalTitle: 'ギターコード進行 ライブラリ',
    getData: () => (typeof guitarchordsLibrary !== 'undefined' ? guitarchordsLibrary : (typeof guitarChordsLibrary !== 'undefined' ? guitarChordsLibrary : [])),
    cardClass: 'guitarchords-card',
    tagClass: 'guitarchords-card-tag',
    previewClass: 'guitarchords-card-preview',
    renderPreview: (item, el) => {
      if (typeof drawGuitarChords === 'function') {
        const container = document.createElement('div');
        drawGuitarChords(item.code, container);
        container.style.zoom = '0.65';
        container.style.transformOrigin = 'top left';
        el.appendChild(container);
      } else {
        el.textContent = item.code;
      }
    }
  },
  chordflow: {
    modalTitle: 'コード進行フロー ライブラリ',
    getData: () => (typeof chordflowLibrary !== 'undefined' ? chordflowLibrary : (typeof chordFlowLibrary !== 'undefined' ? chordFlowLibrary : [])),
    cardClass: 'chordflow-card',
    tagClass: 'chordflow-card-tag',
    previewClass: 'chordflow-card-preview',
    renderPreview: (item, el) => {
      if (typeof drawChordFlow === 'function') {
        const container = document.createElement('div');
        drawChordFlow(item.code, container);
        container.style.zoom = '0.65';
        container.style.transformOrigin = 'top left';
        el.appendChild(container);
      } else {
        el.textContent = item.code;
      }
    }
  },
  venn: {
    modalTitle: 'ベン図・集合図 ライブラリ',
    getData: () => (typeof vennLibrary !== 'undefined' ? vennLibrary : []),
    cardClass: 'venn-card',
    tagClass: 'venn-card-tag',
    previewClass: 'venn-card-preview',
    columnTop: true,
    renderPreview: (item, el) => drawVennSvg(item.code, el, null)
  },
  fishbone: {
    modalTitle: 'フィッシュボーン（特性要因図）ライブラリ',
    getData: () => (typeof fishboneLibrary !== 'undefined' ? fishboneLibrary : []),
    cardClass: 'fishbone-card',
    tagClass: 'fishbone-card-tag',
    previewClass: 'fishbone-card-preview',
    columnTop: true,
    renderPreview: (item, el) => drawFishboneSvg(item.code, el, null)
  },
  energylevel: {
    modalTitle: 'エネルギー準位図・バンド図 ライブラリ',
    getData: () => (typeof energyLevelLibrary !== 'undefined' ? energyLevelLibrary : []),
    cardClass: 'energylevel-card',
    tagClass: 'energylevel-card-tag',
    previewClass: 'energylevel-card-preview',
    columnTop: true,
    renderPreview: (item, el) => {
      if (typeof drawEnergyLevelDiagramSvg === 'function') {
        drawEnergyLevelDiagramSvg(item.code, el, null);
      } else {
        el.textContent = item.code;
      }
    }
  },
  potential: {
    modalTitle: 'ポテンシャルエネルギー曲線 ライブラリ',
    getData: () => (typeof potentialLibrary !== 'undefined' ? potentialLibrary : []),
    cardClass: 'potential-card',
    tagClass: 'potential-card-tag',
    previewClass: 'potential-card-preview',
    columnTop: true,
    renderPreview: (item, el) => {
      if (typeof drawPotentialDiagramSvg === 'function') {
        drawPotentialDiagramSvg(item.code, el, null);
      } else {
        el.textContent = item.code;
      }
    }
  },
  nn: {
    modalTitle: 'ニューラルネットワーク構造図 ライブラリ',
    getData: () => (typeof neuralNetworkLibrary !== 'undefined' ? neuralNetworkLibrary : []),
    cardClass: 'neuralnet-card',
    tagClass: 'neuralnet-card-tag',
    previewClass: 'neuralnet-card-preview',
    columnTop: true,
    renderPreview: (item, el) => {
      if (typeof drawNeuralNetworkSvg === 'function') {
        drawNeuralNetworkSvg(item.code, el, null);
      } else {
        el.textContent = item.code;
      }
    }
  },
  graph: {
    modalTitle: '有向グラフ・ネットワーク図 ライブラリ',
    getData: () => (typeof graphLibrary !== 'undefined' ? graphLibrary : []),
    cardClass: 'graph-card',
    tagClass: 'graph-card-tag',
    previewClass: 'graph-card-preview',
    columnTop: true,
    renderPreview: (item, el) => {
      if (typeof drawGraphSvg === 'function') {
        drawGraphSvg(item.code, el, null);
      } else {
        el.textContent = item.code;
      }
    }
  },
  crystal: {
    modalTitle: '結晶構造・格子モデル ライブラリ (固体物理・材料科学)',
    getData: () => (typeof crystalLibrary !== 'undefined' ? crystalLibrary : []),
    cardClass: 'crystal-card',
    tagClass: 'crystal-card-tag',
    previewClass: 'crystal-card-preview',
    columnTop: true,
    renderPreview: (item, el) => {
      if (typeof drawCrystalSvg === 'function') {
        drawCrystalSvg(item.code, el, null);
      } else {
        el.textContent = item.code;
      }
    }
  },
  scenario: {
    modalTitle: '汎用シナリオ・概念図 ライブラリ (フリーフロー)',
    getData: () => (typeof scenarioLibrary !== 'undefined' ? scenarioLibrary : []),
    cardClass: 'scenario-card',
    tagClass: 'scenario-card-tag',
    previewClass: 'scenario-card-preview',
    columnTop: true,
    renderPreview: (item, el) => {
      if (typeof drawScenarioSvg === 'function') {
        drawScenarioSvg(item.code, el, null);
      } else {
        el.textContent = item.code;
      }
    }
  },
  tensor: {
    modalTitle: 'テンソルネットワーク図 / ペンローズ記法 (量子情報・物性物理)',
    getData: () => (typeof tensorLibrary !== 'undefined' ? tensorLibrary : []),
    cardClass: 'tensor-card',
    tagClass: 'tensor-card-tag',
    previewClass: 'tensor-card-preview',
    columnTop: true,
    renderPreview: (item, el) => {
      if (typeof drawTensorSvg === 'function') {
        drawTensorSvg(item.code, el, null);
      } else {
        el.textContent = item.code;
      }
    }
  },
  chart: {
    modalTitle: 'グラフ・統計チャート ライブラリ (棒・折れ線・円・複合)',
    getData: () => (typeof chartLibrary !== 'undefined' ? chartLibrary : []),
    cardClass: 'chart-card',
    tagClass: 'chart-card-tag',
    previewClass: 'chart-card-preview',
    columnTop: true,
    renderPreview: (item, el) => {
      if (typeof drawChartSvg === 'function') {
        drawChartSvg(item.code, el, null);
      } else {
        el.textContent = item.code;
      }
    }
  }
};

function openDiagramLibraryModal(type) {
  const config = diagramLibraryConfigs[type];
  if (!config || !diagramLibraryModal) return;

  currentDiagramType = type;
  currentDiagramCategory = 'すべて';

  if (diagramModalTitle) diagramModalTitle.textContent = config.modalTitle;
  if (diagramSearchInput) diagramSearchInput.value = '';

  if (diagramCategoryTabs) {
    diagramCategoryTabs.innerHTML = '';
    const rawList = typeof config.getData === 'function' ? config.getData() : [];
    const catSet = new Set();
    rawList.forEach((item) => {
      if (item.category) catSet.add(item.category);
    });
    const categories = ['すべて', ...Array.from(catSet)];

    categories.forEach((cat) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'category-tab' + (cat === 'すべて' ? ' active' : '');
      btn.dataset.category = cat;
      btn.textContent = cat;
      btn.addEventListener('click', () => {
        diagramCategoryTabs.querySelectorAll('.category-tab').forEach((t) => t.classList.remove('active'));
        btn.classList.add('active');
        currentDiagramCategory = cat;
        renderDiagramCards();
      });
      diagramCategoryTabs.appendChild(btn);
    });
  }

  diagramLibraryModal.classList.add('active');
  diagramLibraryModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');

  renderDiagramCards();
  if (diagramSearchInput) diagramSearchInput.focus();
}

function closeDiagramLibraryModal() {
  if (!diagramLibraryModal) return;
  diagramLibraryModal.classList.remove('active');
  diagramLibraryModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

function renderDiagramCards() {
  if (!diagramCardGrid || !diagramLibraryConfigs[currentDiagramType]) return;
  const config = diagramLibraryConfigs[currentDiagramType];
  const query = (diagramSearchInput ? diagramSearchInput.value : '').trim().toLowerCase();
  diagramCardGrid.innerHTML = '';

  const rawList = typeof config.getData === 'function' ? config.getData() : [];
  const filtered = rawList.filter((item) => {
    const itemCat = item.category || '';
    const matchCategory = currentDiagramCategory === 'すべて' || itemCat === currentDiagramCategory;
    const matchTags = Array.isArray(item.tags) && item.tags.some((t) => t.toLowerCase().includes(query));
    const titleText = (item.name || item.title || '').toLowerCase();
    const descText = (item.description || item.desc || '').toLowerCase();
    const codeText = (item.code || '').toLowerCase();
    const matchQuery =
      !query ||
      titleText.includes(query) ||
      descText.includes(query) ||
      itemCat.toLowerCase().includes(query) ||
      codeText.includes(query) ||
      matchTags;
    return matchCategory && matchQuery;
  });

  if (diagramEmptyMessage) {
    diagramEmptyMessage.style.display = filtered.length === 0 ? 'block' : 'none';
  }

  filtered.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'formula-card ' + (config.cardClass || '');

    const top = document.createElement('div');
    top.className = 'card-top';
    if (config.columnTop) {
      top.style.flexDirection = 'column';
      top.style.alignItems = 'flex-start';
      top.style.gap = '6px';
    }

    const name = document.createElement('span');
    name.className = 'card-name';
    name.textContent = item.name || item.title || '';

    const tag = document.createElement('span');
    tag.className = 'card-tag ' + (config.tagClass || '');
    tag.textContent = item.category || '';

    if (config.columnTop) {
      top.appendChild(tag);
      top.appendChild(name);
    } else {
      top.appendChild(name);
      top.appendChild(tag);
    }

    const preview = document.createElement('div');
    preview.className = 'card-preview ' + (config.previewClass || '');
    if (config.previewStyle) {
      Object.assign(preview.style, config.previewStyle);
    }

    try {
      if (typeof config.renderPreview === 'function') {
        config.renderPreview(item, preview);
      } else {
        preview.textContent = item.code || '';
      }
    } catch (err) {
      console.error('Preview error for', item.name || item.title, err);
      preview.textContent = item.code || '';
    }

    const desc = document.createElement('p');
    desc.className = 'card-desc';
    desc.textContent = item.description || item.desc || '';

    card.appendChild(top);
    card.appendChild(preview);
    card.appendChild(desc);

    card.addEventListener('click', () => {
      inputArea.value = item.code || '';
      closeDiagramLibraryModal();
      updatePreview();
    });

    diagramCardGrid.appendChild(card);
  });
}

if (diagramModalCloseX) diagramModalCloseX.addEventListener('click', closeDiagramLibraryModal);
if (diagramModalCloseFooter) diagramModalCloseFooter.addEventListener('click', closeDiagramLibraryModal);

if (diagramLibraryModal) {
  diagramLibraryModal.addEventListener('click', (e) => {
    if (e.target === diagramLibraryModal) {
      closeDiagramLibraryModal();
    }
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && diagramLibraryModal && diagramLibraryModal.classList.contains('active')) {
    closeDiagramLibraryModal();
  }
});

if (diagramSearchInput) {
  diagramSearchInput.addEventListener('input', renderDiagramCards);
}

// 既存互換ラッパー関数群
function openChemFormulaModal() { openDiagramLibraryModal('chem-formula'); }
function openChemModal() { openDiagramLibraryModal('chem'); }
function openCircuitModal() { openDiagramLibraryModal('circuit'); }
function openTimingModal() { openDiagramLibraryModal('timing'); }
function openFsmModal() { openDiagramLibraryModal('fsm'); }
function openFeynmanModal() { openDiagramLibraryModal('feynman'); }
function openSankeyModal() { openDiagramLibraryModal('sankey'); }
function openFlowchartModal() { openDiagramLibraryModal('flowchart'); }
function openTableModal() { openDiagramLibraryModal('table'); }
function openMatrixModal() { openDiagramLibraryModal('matrix'); }
function openPyramidModal() { openDiagramLibraryModal('pyramid'); }
function openRadarModal() { openDiagramLibraryModal('radar'); }
function openWaterfallModal() { openDiagramLibraryModal('waterfall'); }
function openTreemapModal() { openDiagramLibraryModal('treemap'); }
function openGanttModal() { openDiagramLibraryModal('gantt'); }
function openCapitalTreeModal() { openDiagramLibraryModal('capitaltree'); }
function openBlockDiagramModal() { openDiagramLibraryModal('blockdiagram'); }
function openRoadmapModal() { openDiagramLibraryModal('roadmap'); }
function openSequenceModal() { openDiagramLibraryModal('sequence'); }
function openOpticsModal() { openDiagramLibraryModal('optics'); }
function openSwotModal() { openDiagramLibraryModal('swot'); }
function openChordProModal() { openDiagramLibraryModal('chordpro'); }
function openGuitarChordsModal() { openDiagramLibraryModal('guitarchords'); }
function openChordFlowModal() { openDiagramLibraryModal('chordflow'); }
function openVennModal() { openDiagramLibraryModal('venn'); }
function openFishboneModal() { openDiagramLibraryModal('fishbone'); }
function openEnergyLevelModal() { openDiagramLibraryModal('energylevel'); }
function openPotentialModal() { openDiagramLibraryModal('potential'); }
function openNeuralNetworkModal() { openDiagramLibraryModal('nn'); }
const openNnModal = openNeuralNetworkModal;
function openGraphModal() { openDiagramLibraryModal('graph'); }
function openCrystalModal() { openDiagramLibraryModal('crystal'); }
function openScenarioModal() { openDiagramLibraryModal('scenario'); }
function openTensorModal() { openDiagramLibraryModal('tensor'); }
function openChartModal() { openDiagramLibraryModal('chart'); }

const closeChemFormulaModal = closeDiagramLibraryModal;
const closeChemModal = closeDiagramLibraryModal;
const closeCircuitModal = closeDiagramLibraryModal;
const closeTimingModal = closeDiagramLibraryModal;
const closeFsmModal = closeDiagramLibraryModal;
const closeFeynmanModal = closeDiagramLibraryModal;
const closeSankeyModal = closeDiagramLibraryModal;
const closeFlowchartModal = closeDiagramLibraryModal;
const closeTableModal = closeDiagramLibraryModal;
const closeMatrixModal = closeDiagramLibraryModal;
const closePyramidModal = closeDiagramLibraryModal;
const closeRadarModal = closeDiagramLibraryModal;
const closeWaterfallModal = closeDiagramLibraryModal;
const closeTreemapModal = closeDiagramLibraryModal;
const closeGanttModal = closeDiagramLibraryModal;
const closeCapitalTreeModal = closeDiagramLibraryModal;
const closeBlockDiagramModal = closeDiagramLibraryModal;
const closeRoadmapModal = closeDiagramLibraryModal;
const closeSequenceModal = closeDiagramLibraryModal;
const closeOpticsModal = closeDiagramLibraryModal;
const closeSwotModal = closeDiagramLibraryModal;
const closeChordProModal = closeDiagramLibraryModal;
const closeGuitarChordsModal = closeDiagramLibraryModal;
const closeChordFlowModal = closeDiagramLibraryModal;
const closeVennModal = closeDiagramLibraryModal;
const closeFishboneModal = closeDiagramLibraryModal;
const closeEnergyLevelModal = closeDiagramLibraryModal;
const closePotentialModal = closeDiagramLibraryModal;
const closeNeuralNetworkModal = closeDiagramLibraryModal;
const closeNnModal = closeDiagramLibraryModal;
const closeGraphModal = closeDiagramLibraryModal;


// ペースト時に円記号（半角・全角）を強制的に半角バックスラッシュへ置換する処理
inputArea.addEventListener('paste', (event) => {
  event.preventDefault(); // 通常の貼り付けを一旦キャンセル

  // クリップボードのテキストを取得し、円記号をバックスラッシュへ変換
  const clipboardData = (event.clipboardData || window.clipboardData).getData('text');
  const sanitizedText = clipboardData.replace(/[¥￥]/g, '\\');

  // カーソル位置へ安全に挿入
  const selectionStart = inputArea.selectionStart;
  const selectionEnd = inputArea.selectionEnd;
  const originalValue = inputArea.value;

  inputArea.value =
    originalValue.substring(0, selectionStart) +
    sanitizedText +
    originalValue.substring(selectionEnd);

  // カーソルの位置を挿入後の末尾に合わせる
  inputArea.selectionStart = inputArea.selectionEnd = selectionStart + sanitizedText.length;

  // プレビューを即時更新
  updatePreview();
});

// 初回読み込み時の実行
window.addEventListener('DOMContentLoaded', updatePreview);

// ウィンドウリサイズ時にスケールを再調整
window.addEventListener('resize', updatePreview);

// ==========================================
// 統合ヘッダーメニュー（表・図作成 / 式作成）の制御
// ==========================================
const diagramMenuBtn = document.getElementById('diagram-menu-btn');
const diagramMenuPanel = document.getElementById('diagram-menu-panel');
const formulaMenuBtn = document.getElementById('formula-menu-btn');
const formulaMenuPanel = document.getElementById('formula-menu-panel');

function closeAllHeaderMenus() {
  if (diagramMenuPanel) diagramMenuPanel.classList.remove('active');
  if (diagramMenuBtn) {
    diagramMenuBtn.classList.remove('active');
    diagramMenuBtn.setAttribute('aria-expanded', 'false');
  }
  if (formulaMenuPanel) formulaMenuPanel.classList.remove('active');
  if (formulaMenuBtn) {
    formulaMenuBtn.classList.remove('active');
    formulaMenuBtn.setAttribute('aria-expanded', 'false');
  }
}

if (diagramMenuBtn && diagramMenuPanel) {
  diagramMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const willOpen = !diagramMenuPanel.classList.contains('active');
    closeAllHeaderMenus();
    if (willOpen) {
      diagramMenuPanel.classList.add('active');
      diagramMenuBtn.classList.add('active');
      diagramMenuBtn.setAttribute('aria-expanded', 'true');
    }
  });
}

if (formulaMenuBtn && formulaMenuPanel) {
  formulaMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const willOpen = !formulaMenuPanel.classList.contains('active');
    closeAllHeaderMenus();
    if (willOpen) {
      formulaMenuPanel.classList.add('active');
      formulaMenuBtn.classList.add('active');
      formulaMenuBtn.setAttribute('aria-expanded', 'true');
    }
  });
}

// ドロップダウンメニュー外クリックまたはEscキーで非表示
document.addEventListener('click', (e) => {
  if (!e.target.closest('#diagram-dropdown-wrapper') && !e.target.closest('#formula-dropdown-wrapper')) {
    closeAllHeaderMenus();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeAllHeaderMenus();
  }
});

// 表・図作成の種別マッピング
const DIAGRAM_MODAL_TYPE_MAP = {
  table: 'table',
  matrix: 'matrix',
  pyramid: 'pyramid',
  radar: 'radar',
  waterfall: 'waterfall',
  treemap: 'treemap',
  gantt: 'gantt',
  capitaltree: 'capitaltree',
  radialtree: 'capitaltree',
  orgchart: 'capitaltree',
  blockdiagram: 'blockdiagram',
  sequence: 'sequence',
  optics: 'optics',
  energylevel: 'energylevel',
  potential: 'potential',
  nn: 'nn',
  graph: 'graph',
  venn: 'venn',
  fishbone: 'fishbone',
  swot: 'swot',
  timeline: 'roadmap',
  roadmap: 'roadmap',
  flowchart: 'flowchart',
  sankey: 'sankey',
  bs: 'sankey',
  pl: 'sankey',
  fsm: 'fsm',
  timing: 'timing',
  circuit: 'circuit',
  crystal: 'crystal',
  scenario: 'scenario',
  tensor: 'tensor',
  chart: 'chart',
  barchart: 'chart',
  linechart: 'chart',
  piechart: 'chart'
};

// 表・図作成の項目ディスパッチ
function triggerDiagram(val) {
  const type = DIAGRAM_MODAL_TYPE_MAP[val] || 'table';
  if (typeof openDiagramLibraryModal === 'function') {
    openDiagramLibraryModal(type);
  } else if (typeof openTableModal === 'function') {
    openTableModal();
  }
}

// 式作成の種別マッピング
const FORMULA_MODAL_TYPE_MAP = {
  'chem-formula': 'chem-formula',
  'chem-struct': 'chem',
  chem: 'chem',
  feynman: 'feynman',
  chordpro: 'chordpro',
  guitarchords: 'guitarchords',
  chordflow: 'chordflow',
  crystal: 'crystal',
  scenario: 'scenario',
  tensor: 'tensor'
};

// 式作成の項目ディスパッチ
function triggerFormula(val) {
  const diagramType = FORMULA_MODAL_TYPE_MAP[val];
  if (diagramType && typeof openDiagramLibraryModal === 'function') {
    openDiagramLibraryModal(diagramType);
  } else if (typeof openModal === 'function') {
    openModal();
  }
}

// メニュー項目のクリックイベント登録
document.querySelectorAll('#diagram-menu-panel .menu-item-btn').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const diagramType = btn.dataset.diagram;
    closeAllHeaderMenus();
    if (diagramType) {
      triggerDiagram(diagramType);
    }
  });
});

document.querySelectorAll('#formula-menu-panel .menu-item-btn').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const formulaType = btn.dataset.formula;
    closeAllHeaderMenus();
    if (formulaType) {
      triggerFormula(formulaType);
    }
  });
});

// ==========================================
// 画像ファイル出力モーダルの制御
// ==========================================
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

function openExportModal() {
  if (!exportModal) return;
  exportModal.classList.add('active');
  exportModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');

  // メインプレビューから数式または構造式要素を複製（変倍transformをリセットして鮮明化）
  exportTarget.innerHTML = '';
  const katexSource = previewArea.querySelector('.katex');
  const diagramContainers = previewArea.querySelectorAll('[class*="-preview-container"], .chem-structure-container');

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
    fallback.textContent = inputArea.value || '数式が入力されていません';
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
  if (targetTable) {
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
  const origSvgs = previewArea.querySelectorAll('svg');
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
      // 表（テーブル）内のインライン数式はテーブル全体のフォントサイズを継承
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

  // 5. 表（テーブル）専用オプションの反映（表の横幅 & セル余白割合 & テーマカラー）
  const tableEl = exportTarget.querySelector('.physi-table, .matrix-schedule-table');
  const hasCustomTableStyle = tableEl && (
    tableEl.classList.contains('table-style-dark') ||
    tableEl.classList.contains('table-style-academic') ||
    tableEl.classList.contains('table-style-accent') ||
    tableEl.classList.contains('table-style-blue') ||
    tableEl.classList.contains('table-style-rose') ||
    tableEl.classList.contains('matrix-schedule-table')
  );

  // 4. 配色
  const selectedColorMode = document.querySelector('input[name="export-color-mode"]:checked')?.value || 'color';
  if (selectedColorMode === 'monochrome') {
    exportTarget.classList.add('monochrome-mode');
    if (exportTableThemeGroup) exportTableThemeGroup.style.display = 'none';
  } else {
    exportTarget.classList.remove('monochrome-mode');
    if (exportTableThemeGroup) {
      exportTableThemeGroup.style.display = tableEl ? 'block' : 'none';
    }
  }

  if (tableEl) {
    // 表の横幅の反映
    const baseWidth = parseFloat(tableEl.dataset.baseTableWidth) || 700;
    const calcWidth = Math.round(baseWidth * widthRatio);
    tableEl.style.width = `${calcWidth}px`;
    tableEl.style.minWidth = `${calcWidth}px`;

    // セル余白割合の反映
    if (exportCellPaddingSlider && exportCellPaddingValue) {
      const padPercent = parseInt(exportCellPaddingSlider.value, 10) || 100;
      exportCellPaddingValue.textContent = `${padPercent}%`;
      const ratio = padPercent / 100;

      // 10%〜200% に応じた上下余白（最小1px）・左右余白（最小3px）の算出
      const padY = Math.max(1, parseFloat((9 * ratio).toFixed(1)));
      const padYtd = Math.max(1, parseFloat((8 * ratio).toFixed(1)));
      const padX = Math.max(3, parseFloat((15 * ratio).toFixed(1)));

      // 余白に連動した行間（line-height）の圧縮（10%で1.15、100%で1.45）
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

    // テーマカラーの反映（既存のテーマカラーをリセット）
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

    // 選択されたテーマカラー（デフォルト以外）を適用し、各スタイルの構造を維持したまま色付け
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
if (exportSizeSlider) {
  exportSizeSlider.addEventListener('input', updateExportStyle);
}
if (exportWidthSlider) {
  exportWidthSlider.addEventListener('input', updateExportStyle);
}
if (exportPaddingSlider) {
  exportPaddingSlider.addEventListener('input', updateExportStyle);
}
if (exportCellPaddingSlider) {
  exportCellPaddingSlider.addEventListener('input', updateExportStyle);
}
exportBgRadios.forEach((radio) => radio.addEventListener('change', updateExportStyle));
exportColorRadios.forEach((radio) => radio.addEventListener('change', updateExportStyle));
exportTableThemeRadios.forEach((radio) => radio.addEventListener('change', updateExportStyle));

if (openExportBtn) {
  openExportBtn.addEventListener('click', openExportModal);
}
if (closeExportXBtn) {
  closeExportXBtn.addEventListener('click', closeExportModal);
}
if (closeExportFooterBtn) {
  closeExportFooterBtn.addEventListener('click', closeExportModal);
}

if (exportModal) {
  exportModal.addEventListener('click', (e) => {
    if (e.target === exportModal) {
      closeExportModal();
    }
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
        // SVGダイアグラム（化学構造式・回路図等）：ブラウザ標準Canvas APIで直接描画
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
        // 数式（KaTeX）を含む場合：html2canvasを使用
        canvas = await html2canvas(exportTarget, {
          scale: scaleVal,
          backgroundColor: bgColor,
          useCORS: true,
          logging: false
        });
      }

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `physinote_formula_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // PNG保存完了後に設定ウィンドウを自動で閉じる
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

// 🏠 ローカル環境でのポータル戻るリンクの切り替え
window.addEventListener('DOMContentLoaded', () => {
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (isLocal) {
    const portalLink = document.getElementById('portalTopLink');
    if (portalLink) portalLink.href = "../FumiPortal/index.html";
  }
});

// 昔風アクセスカウンタ（https://fumiakinx.github.io/PhysiNote/ の本番環境のみ表示・カウント）
(function initRetroCounter() {
  const isTarget =
    window.location.hostname === 'fumiakinx.github.io' &&
    window.location.href.includes('PhysiNote');
  if (!isTarget) return;

  const counterContainer = document.getElementById('retroAccessCounter');
  const counterBox = document.getElementById('retroCounterBox');
  if (!counterContainer || !counterBox) return;

  counterContainer.style.display = 'block';

  fetch('https://countapi.mileshilliard.com/api/v1/hit/fumiakinx_physinote')
    .then((res) => {
      if (!res.ok) throw new Error('HTTP error');
      return res.json();
    })
    .then((data) => {
      const val = typeof data.value === 'number' ? data.value : 1;
      const strVal = String(val).padStart(6, '0');
      counterBox.innerHTML = strVal
        .split('')
        .map((digit) => `<span class="retro-counter-digit">${digit}</span>`)
        .join('');
    })
    .catch((err) => {
      console.warn('アクセスカウンタ取得スキップ:', err);
      counterContainer.style.display = 'none';
    });
})();
