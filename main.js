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
      { symbol: '$\\rho \\boldsymbol{v}$', desc: '単位面積あたりの質量流束（フラックスベクトル）' },
      { symbol: '$\\nabla \\cdot (\\rho \\boldsymbol{v})$', desc: '微小体積からの正味の流出量（発散）' },
      { symbol: '$= 0$', desc: '質量の生成・消滅が起きない厳密保存条件' }
    ],
    domain: '流体を連続体として扱える全領域（局所的な質量保存）。',
    limitSignal: '原子核反応など質量がエネルギーへ転換する領域、または分子スケールの希薄気体。',
    timeReversibility: '時間反転（$t \\to -t, \\boldsymbol{v} \\to -\\boldsymbol{v}$）に対して方程式の形が保たれ時間反転可逆。'
  },
  {
    id: 'navier-stokes',
    pattern: /\\rho.*\\partial/,
    name: 'ナビエ–ストークス方程式',
    desc: '粘性流体の運動を記述する流体力学の基礎方程式。運動量の保存則を表す。',
    purpose: '粘性流体の要素に作用する圧力勾配・粘性拡散・外力から、流速場の局所加速度を算出する運動方程式。',
    elements: [
      { symbol: '$\\rho (\\frac{\\partial \\boldsymbol{v}}{\\partial t} + (\\boldsymbol{v}\\cdot\\nabla)\\boldsymbol{v})$', desc: '流体微小要素の実質加速度と慣性力項' },
      { symbol: '$-\\nabla P$', desc: '周囲との圧力差によって流体を押し出す圧力勾配力' },
      { symbol: '$\\mu \\nabla^2 \\boldsymbol{v}$', desc: '流体間の摩擦（粘性）による運動量の空間拡散・減速項' },
      { symbol: '$\\boldsymbol{f}$', desc: '重力や遠心力などの外力体積力' }
    ],
    domain: '流体を連続体として近似できる領域（クヌーセン数が十分小さい環境）。',
    limitSignal: '希薄気体（宇宙空間など）では分子衝突モデルが必要。また数学的には3次元における滑らかな解の存在と一意性（ミレニアム懸賞問題）が未解決。',
    timeReversibility: '粘性によるエネルギー散逸があるため、基本的には未来方向（不可逆）。'
  },
  {
    id: 'quantum_schrodinger',
    pattern: /i\\hbar.*\\partial.*\\psi/,
    name: 'シュレーディンガー方程式（$i\\hbar \\frac{\\partial}{\\partial t}\\psi = \\hat{H}\\psi$）',
    desc: '微視的な粒子の状態（波動関数）の時間発展を決定づける量子力学の基本方程式。',
    purpose: 'ハミルトニアン $\\hat{H}$ が規定するエネルギー構造に基づいて、量子波動関数 $\\psi$ の複素位相回転・時間発展を決定する。',
    elements: [
      { symbol: '$\\psi$', desc: '系の状態を表す複素確率振幅（波動関数）' },
      { symbol: '$\\hat{H}$', desc: 'ハミルトニアン（系の全エネルギー演算子）' },
      { symbol: '$i\\hbar$', desc: '量子的な複素位相回転速度を規定する作用素スケール' },
      { symbol: '$\\frac{\\partial}{\\partial t}\\psi$', desc: '波動関数の瞬時時間微分（未来の状態を紡ぎ出す出力）' }
    ],
    domain: '非相対論的エネルギー領域（粒子数保存が成り立つ単一または少数量子系）。',
    limitSignal: '光速に近い高速粒子（ディラック方程式が必要）、素粒子の生成・消滅（場の量子論が必要）。',
    timeReversibility: 'ユニタリ発展（$t \\to -t$ と複素共役 $\\psi \\to \\psi^*$ の組み合わせ）により微視的には時間反転可逆。'
  },
  {
    id: 'quantum_uncertainty',
    pattern: /\\Delta\s*x\s*\\Delta\s*p/,
    name: '不確定性原理（$\\Delta x \\Delta p \\ge \\frac{\\hbar}{2}$）',
    desc: '粒子の位置と運動量を同時に無限の精度で確定することはできないことを示す原理。',
    purpose: '位置 $x$ の広がりと運動量 $p$ のゆらぎの積に存在する、量子力学固有の理論的下限境界を規定する。',
    elements: [
      { symbol: '$\\Delta x$', desc: '位置の測定の不確定さ（波動関数の空間的広がり）' },
      { symbol: '$\\Delta p$', desc: '運動量の測定の不確定さ（波数の分散・スペクトル幅）' },
      { symbol: '$\\frac{\\hbar}{2}$', desc: '交換関係 $[\\hat{x}, \\hat{p}] = i\\hbar$ から導かれる最小の量子ゆらぎ限界値' },
      { symbol: '$\\ge$', desc: '両者を同時にこれ以上狭めることができない不等式制約' }
    ],
    domain: '非可換な物理量（正準共役対）を持つすべての量子力学的状態。',
    limitSignal: 'マクロ系（$\\hbar \\to 0$ の極限）では不確定性幅が日常スケールに対して無視可能となり古典極限へ移行。',
    timeReversibility: '状態の測定前後の統計的散らばりの限界関係式（時間発展自体とは独立な固有の不等式）。'
  },
  {
    id: 'quantum_de_broglie',
    pattern: /\\lambda\s*=\s*\\frac\{\s*h\s*\}\{\s*p\s*\}/,
    name: 'ド・ブロイ波の波長（$\\lambda = \\frac{h}{p}$）',
    desc: '物質粒子が波動としての性質（物質波）を併せ持つことを表す式。',
    purpose: '運動量 $p$ を持つ任意の粒子が空間中で示す物質波の空間波長 $\\lambda$ を算出する。',
    elements: [
      { symbol: '$p$', desc: '粒子の運動量', varKey: 'p', unit: 'kg·m/s', defaultVal: 1.0e-24 },
      { symbol: '$h$', desc: 'プランク定数', varKey: 'h', unit: 'J·s', defaultVal: 6.626e-34, isConstant: true },
      { symbol: '$\\lambda$', desc: '物質波の波長（出力結果）', varKey: 'lambda', unit: 'nm', defaultVal: 0.6626, target: true }
    ],
    solve: (vals, trig) => (trig === 'lambda' && vals.lambda > 0 ? { p: vals.h / (vals.lambda * 1e-9) } : (vals.p > 0 ? { lambda: (vals.h / vals.p) * 1e9 } : null)),
    domain: '運動量 $p$ を持つあらゆる自由粒子（電子・中性子・原子線など）。',
    limitSignal: '巨視的物体（質量が極めて大きく $\\lambda$ がプランク長スケールに埋もれる領域）では波動性が観測不能。'
  },
  {
    id: 'quantum-photoelectric',
    pattern: /(E\s*=\s*h\s*\\nu|E\s*=\s*\\hbar\s*\\omega)/,
    name: 'アインシュタインの光量子仮説（$E = h\\nu = \\hbar \\omega$）',
    desc: '光（電磁波）が振動数に比例したエネルギーの塊（光子）として振る舞う関係式。',
    purpose: '電磁波の振動数 $\\nu$ から、光子1粒子が担う離散化されたエネルギー $E$ を算出する。',
    elements: [
      { symbol: '$\\nu$', desc: '電磁波の振動数', varKey: 'nu', unit: 'THz', defaultVal: 500 },
      { symbol: '$h$', desc: 'プランク定数', varKey: 'h', unit: 'J·s', defaultVal: 6.626e-34, isConstant: true },
      { symbol: '$E$', desc: '光子1個のエネルギー（出力結果）', varKey: 'E', unit: 'eV', defaultVal: 2.07, target: true }
    ],
    solve: (vals, trig) => (trig === 'E' ? { nu: (vals.E * 1.602e-19 / vals.h) / 1e12 } : { E: (vals.h * (vals.nu * 1e12)) / 1.602e-19 }),
    domain: '電磁相互作用における光子のエネルギー授受過程（光電効果・コンプトン散乱）。',
    limitSignal: '極端に強い古典的コヒーレント電磁場（無数の光子が重なり波動として振る舞う巨視的領域）。',
    timeReversibility: '光子の放出・吸収の微視的素過程は時間反転可逆。'
  },
  {
    id: 'quantum-commutation-relation',
    pattern: /\\hat\{x\}.*\\hat\{p\}.*=.*i\\hbar/,
    name: '正準交換関係（$[\\hat{x}, \\hat{p}] = i\\hbar$）',
    desc: '位置と運動量の演算子が非可換であることを示し、不確定性原理の数学的根底をなす基本関係式。',
    purpose: '位置と運動量の観測順序の入れ替え不可能性（非可換性）から、量子ゆらぎ定数 $i\\hbar$ を生成する代数方程式。',
    elements: [
      { symbol: '$\\hat{x}$', desc: '位置作用素（座標値の掛け算作用）' },
      { symbol: '$\\hat{p}$', desc: '運動量作用素（微分演算子 $-i\\hbar\\frac{\\partial}{\\partial x}$）' },
      { symbol: '$[\\hat{x}, \\hat{p}]$', desc: '交換子 $\\hat{x}\\hat{p} - \\hat{p}\\hat{x}$（作用順序の差分測定）' },
      { symbol: '$i\\hbar$', desc: '順序の食い違いから発生する量子位相変位（出力定数）' }
    ],
    domain: '標準的な正準量子化が成立するヒルベルト空間上の量子力学系。',
    limitSignal: '古典極限 $\\hbar \\to 0$ でポアソン括弧へと漸近。離散時空などの極限量子重力理論。',
    timeReversibility: '時間依存性を持たない代数的交換関係（不変）。'
  },
  {
    id: 'wave_wave_equation',
    pattern: /\\partial\^2\s*u.*\\partial\s*t\^2.*\\partial\^2\s*u.*\\partial\s*x\^2/,
    name: '1次元波動方程式（$\\frac{\\partial^2 u}{\\partial t^2} = v^2 \\frac{\\partial^2 u}{\\partial x^2}$）',
    desc: '波が空間中を一定の速さで伝播していく様子を記述する偏微分方程式。',
    purpose: '空間変位の曲率（歪み）から媒質の時間加速度を誘起し、波形を位相速度 $v$ で無歪み伝播させる偏微分方程式。',
    elements: [
      { symbol: '$\\frac{\\partial^2 u}{\\partial x^2}$', desc: '波形変位の空間曲率（近傍要素からの復元張力）' },
      { symbol: '$v^2$', desc: '媒質の位相速度の2乗（伝播の応答特性定数）' },
      { symbol: '$\\frac{\\partial^2 u}{\\partial t^2}$', desc: '媒質各点における時間加速度（波を進行させる駆動力出力）' }
    ],
    domain: '媒質の分散性や減衰が無視できる均質媒質中の微小振幅波。',
    limitSignal: '大振幅時の媒質の非線形性（衝撃波の形成）、周波数依存の分散（波形崩れ）、媒質抵抗による減衰で破綻。',
    timeReversibility: '2階時間微分のため時間反転可逆（$t \\to -t$ でも方程式が保存され、波の巻き戻しが可能）。'
  },
  {
    id: 'optics_snell',
    pattern: /n_1\s*\\sin\s*\\theta_1/,
    name: 'スネルの法則（屈折の法則）（$n_1 \\sin \\theta_1 = n_2 \\sin \\theta_2$）',
    desc: '屈折率が異なる媒質の境界を光が通過する際の入射角と屈折角の関係式。',
    purpose: '媒質境界における光の波面の連続性（位相整合）から、入射角 $\\theta_1$ に対する屈折角 $\\theta_2$ を決定する。',
    elements: [
      { symbol: '$n_1$', desc: '媒質1の屈折率', varKey: 'n1', unit: '', defaultVal: 1.0 },
      { symbol: '$\\theta_1$', desc: '媒質1の入射角', varKey: 'theta1', unit: '°', defaultVal: 30 },
      { symbol: '$n_2$', desc: '媒質2の屈折率', varKey: 'n2', unit: '', defaultVal: 1.5 },
      { symbol: '$\\theta_2$', desc: '媒質2の屈折角（出力結果）', varKey: 'theta2', unit: '°', defaultVal: 19.47, target: true }
    ],
    solve: (vals) => {
      const rad1 = (vals.theta1 * Math.PI) / 180;
      const sin2 = (vals.n1 * Math.sin(rad1)) / vals.n2;
      if (Math.abs(sin2) <= 1) {
        return { theta2: (Math.asin(sin2) * 180) / Math.PI };
      }
      return null;
    },
    domain: '幾何光学が成り立つ波長より十分大きなスケールの等方性・均質媒質境界。',
    limitSignal: '全反射領域（臨界角超え）、境界の厚みが光の波長と同等以下のナノスケール（波動光学・回折が必要）。',
    timeReversibility: '光路可逆の原理により時間反転可逆（光線を逆向きに入射させても同一の経路を辿る）。'
  },
  {
    id: 'wave-grating-interference',
    pattern: /d\s*\\sin\s*\\theta\s*=\s*m\s*\\lambda/,
    name: '回折・干渉条件（$d \\sin \\theta = m \\lambda$）',
    desc: '波がスリットや回折格子を通過した際に位相が揃い強め合う条件を表す波動光学の基本式。',
    purpose: '周期構造 $d$ を通過した散乱波の光路差が波長 $\\lambda$ の整数倍に一致する回折強め合い角度 $\\theta$ を決定する。',
    elements: [
      { symbol: '$d$', desc: '格子のスリット間隔', varKey: 'd', unit: 'μm', defaultVal: 2.0 },
      { symbol: '$m$', desc: '干渉次数', varKey: 'm', unit: '次', defaultVal: 1 },
      { symbol: '$\\lambda$', desc: '入射光の波長', varKey: 'lambda', unit: 'nm', defaultVal: 500 },
      { symbol: '$\\theta$', desc: '回折角度（出力結果）', varKey: 'theta', unit: '°', defaultVal: 14.48, target: true }
    ],
    solve: (vals) => {
      const sinTheta = (vals.m * (vals.lambda * 1e-9)) / (vals.d * 1e-6);
      if (Math.abs(sinTheta) <= 1) {
        return { theta: (Math.asin(sinTheta) * 180) / Math.PI };
      }
      return null;
    },
    domain: '単色コヒーレント波、遠方回折（フラウンホーファー回折）領域。',
    limitSignal: 'スリット間隔 $d$ が波長 $\\lambda$ より小さい場合（$\\sin \\theta > 1$ となり回折光が生じない）、またはインコヒーレント光。',
    timeReversibility: '光路可逆の原理により時間反転可逆。'
  },
  {
    id: 'wave-doppler-effect',
    pattern: /f'\s*=\s*f.*v/,
    name: 'ドップラー効果の式（$f\' = f \\frac{v \\pm v_o}{v \\mp v_s}$）',
    desc: '観測者や波源の相対運動によって観測される振動数が変化する現象を記述する式。',
    purpose: '波源と観測者の相対的な移動速度から、単位時間あたりに受波される見かけの周波数 $f\'$ を換算する。',
    elements: [
      { symbol: '$f$', desc: '音源の固有周波数', varKey: 'f', unit: 'Hz', defaultVal: 440 },
      { symbol: '$v$', desc: '媒質中の音速', varKey: 'v', unit: 'm/s', defaultVal: 340 },
      { symbol: '$v_o$', desc: '観測者の移動速度', varKey: 'vo', unit: 'm/s', defaultVal: 0 },
      { symbol: '$v_s$', desc: '音源の移動速度（接近時正）', varKey: 'vs', unit: 'm/s', defaultVal: 20 },
      { symbol: '$f\'$', desc: '観測される受信周波数（出力結果）', varKey: 'fp', unit: 'Hz', defaultVal: 467.5, target: true }
    ],
    solve: (vals) => (vals.v !== vals.vs ? { fp: vals.f * ((vals.v + vals.vo) / (vals.v - vals.vs)) } : null),
    domain: '音速 $v$ 以下の媒質中における波源・観測者の一次元相対運動。',
    limitSignal: '波源の速度が音速を超える場合（$v_s \\ge v$：衝撃波の発生）、または光の相対論的ドップラー効果。',
    timeReversibility: '音波の減衰・空気抵抗を無視すれば時間反転可逆。'
  },
  {
    id: 'thermo_stat_boltzmann',
    pattern: /S\s*=\s*k_B\s*\\ln\s*W/,
    name: 'ボルツマンの原理（$S = k_B \\ln W$）',
    desc: '微視的な状態数と巨視的なエントロピーを結びつける統計力学の基礎式。',
    purpose: '微視的な取りうる状態数 $W$ の情報量（対数）から、巨視的熱力学エントロピー $S$ を導出する架橋方程式。',
    elements: [
      { symbol: '$W$', desc: '取りうる微視的状態数', varKey: 'W', unit: '', defaultVal: 1.0e20 },
      { symbol: '$k_B$', desc: 'ボルツマン定数', varKey: 'kB', unit: 'J/K', defaultVal: 1.381e-23, isConstant: true },
      { symbol: '$S$', desc: '巨視的エントロピー（出力結果）', varKey: 'S', unit: 'J/K', defaultVal: 6.359e-22, target: true }
    ],
    solve: (vals) => (vals.W > 0 ? { S: vals.kB * Math.log(vals.W) } : null),
    domain: '等確率の原理が成り立つ孤立した平衡熱力学系（小正準集団）。',
    limitSignal: '状態数が極めて少なく統計的平均が取れない極小少数粒子系、または非平衡定常状態。',
    timeReversibility: '平衡状態における静的状態量関係式（時間依存性なし）。'
  },
  {
    id: 'thermo_stat_distribution',
    pattern: /P_i.*e\^/,
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

// ==========================================
// 化学構造式（chemfig / SMILES）の変換・描画エンジン
// ==========================================
function chemfigToSmiles(chemfigStr) {
  if (!chemfigStr) return null;
  const trimmed = chemfigStr.trim();

  // 1. ベンゼン環および置換ベンゼン環（トルエン、アスピリン等）の解析
  const ringMatch = trimmed.match(/^\*6\s*\((.+)\)$/);
  if (ringMatch) {
    const inner = ringMatch[1];

    // トップレベルの枝分かれ括弧（ネスト深度=1）を完全抽出
    const branches = [];
    let depth = 0;
    let startIdx = -1;
    for (let i = 0; i < inner.length; i++) {
      if (inner[i] === '(') {
        if (depth === 0) startIdx = i;
        depth++;
      } else if (inner[i] === ')') {
        depth--;
        if (depth === 0 && startIdx !== -1) {
          branches.push(inner.slice(startIdx + 1, i));
          startIdx = -1;
        }
      }
    }

    if (branches.length > 0) {
      // 置換基を正規化・SMILESフラグメント化するヘルパー
      const parseSub = (raw) => {
        const clean = raw
          .replace(/^[-=]+/, '')
          .replace(/\[:?[^\]]*\]/g, '')
          .replace(/_/g, '')
          .trim();

        // カルボキシ基: -C(=[1]O)-[7]OH, COOH, C(=O)O
        if (/^C\(=?O\)\s*-?O\s*H?$/i.test(clean) || clean === 'COOH') {
          return { smiles: 'C(=O)O', type: 'COOH' };
        }
        // アセトキシ基: -O-C(=[1]O)-[7]CH3, OCOCH3, OAc
        if (/^O-?C\(=?O\)\s*-?CH3?$/i.test(clean) || clean === 'OCOCH3' || clean === 'OAc') {
          return { smiles: 'OC(=O)C', type: 'OCOCH3' };
        }
        // メチル基: -CH3
        if (/^CH3?$/i.test(clean)) return { smiles: 'C', type: 'CH3' };
        // エチル基: -CH2CH3, -C2H5
        if (/^CH2CH3$|^C2H5$/i.test(clean)) return { smiles: 'CC', type: 'C2H5' };
        // ヒドロキシ基: -OH
        if (/^OH$/i.test(clean)) return { smiles: 'O', type: 'OH' };
        // アミノ基: -NH2
        if (/^NH2?$/i.test(clean)) return { smiles: 'N', type: 'NH2' };
        // アルデヒド基: -CHO
        if (/^CHO$/i.test(clean)) return { smiles: 'C=O', type: 'CHO' };
        // ニトロ基: -NO2
        if (/^NO2?$/i.test(clean)) return { smiles: '[N+](=O)[O-]', type: 'NO2' };
        // スルホン酸基: -SO3H
        if (/^SO3H$/i.test(clean)) return { smiles: 'S(=O)(=O)O', type: 'SO3H' };
        // ハロゲン
        if (clean === 'Cl') return { smiles: 'Cl', type: 'Cl' };
        if (clean === 'Br') return { smiles: 'Br', type: 'Br' };
        if (clean === 'F') return { smiles: 'F', type: 'F' };
        if (clean === 'I') return { smiles: 'I', type: 'I' };

        return { smiles: clean, type: clean };
      };

      const parsedSubs = branches.map(parseSub);

      // 2置換ベンゼンの特別判定（アスピリン、サリチル酸等）
      if (parsedSubs.length === 2) {
        const types = parsedSubs.map((s) => s.type);
        // アスピリン（アセチルサリチル酸）: COOH + OCOCH3
        if (types.includes('COOH') && types.includes('OCOCH3')) {
          return { smiles: 'O=C(O)c1ccccc1OC(=O)C', name: 'アスピリン（アセチルサリチル酸）' };
        }
        // サリチル酸: COOH + OH
        if (types.includes('COOH') && types.includes('OH')) {
          return { smiles: 'O=C(O)c1ccccc1O', name: 'サリチル酸' };
        }
        // 一般的な2置換体
        return {
          smiles: `${parsedSubs[0].smiles}c1ccccc1${parsedSubs[1].smiles}`,
          name: `2置換ベンゼン（-${parsedSubs[0].type}, -${parsedSubs[1].type}）`
        };
      }

      // 単一置換ベンゼン
      const singleSub = parsedSubs[0];
      const singleNameMap = {
        'CH3': 'トルエン（C₇H₈）',
        'C2H5': 'エチルベンゼン',
        'OH': 'フェノール（C₆H₅OH）',
        'NH2': 'アニリン（C₆H₅NH₂）',
        'COOH': '安息香酸（C₆H₅COOH）',
        'CHO': 'ベンズアルデヒド',
        'NO2': 'ニトロベンゼン',
        'SO3H': 'ベンゼンスルホン酸',
        'Cl': 'クロロベンゼン',
        'Br': 'ブロモベンゼン',
        'F': 'フルオロベンゼン',
        'I': 'ヨードベンゼン'
      };

      return {
        smiles: `${singleSub.smiles}c1ccccc1`,
        name: singleNameMap[singleSub.type] || `置換ベンゼン（-${singleSub.type}）`
      };
    }

    // 括弧（置換基）のない純粋な六員環
    if (/^[-=]{5,6}$/.test(inner.replace(/\s+/g, ''))) {
      if (inner.includes('=')) {
        return { smiles: 'c1ccccc1', name: 'ベンゼン環（C₆H₆）' };
      }
      return { smiles: 'C1CCCCC1', name: 'シクロヘキサン' };
    }
  }

  // 2. シクロペンタン
  if (trimmed === '*5(-----)') {
    return { smiles: 'C1CCCC1', name: 'シクロペンタン' };
  }
  // 4. 水分子（折れ線型: [:30] 度数指定および [1] 等の整数方位指定に対応）
  if (/H\s*-\s*(?:\[:?[^\]]+\]\s*)?O\s*-\s*(?:\[:?[^\]]+\]\s*)?H/i.test(trimmed) || trimmed === 'H-O-H') {
    return { smiles: 'WATER', name: '水分子（H₂O 折れ線型）' };
  }
  // 5. メタン
  if (/^CH4$/i.test(trimmed) || /C\(.*H.*\)/.test(trimmed)) {
    return { smiles: 'C', name: 'メタン（CH₄）' };
  }
  // 6. エタノール
  if (/ethanol/i.test(trimmed) || trimmed.includes('C-C-OH') || trimmed.includes('CH3-CH2-OH')) {
    return { smiles: 'CCO', name: 'エタノール' };
  }
  // 7. 酢酸
  if (trimmed.includes('C(=O)OH') || trimmed.includes('CH3-COOH')) {
    return { smiles: 'CC(=O)O', name: '酢酸' };
  }

  // 簡易抽出：角度や方位ブラケットを取り除いてSMILESとして解釈可能か試行
  const simplified = trimmed.replace(/\[:?[^\]]*\]/g, '').replace(/[()]/g, '');
  if (simplified && /^[A-Za-z0-9=#\-+]+$/.test(simplified)) {
    return { smiles: simplified, name: '化学構造' };
  }

  return null;
}

// 水分子専用の高品位折れ線型（104.5度）SVG描画
function createWaterMoleculeSvg() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 180 120');
  svg.setAttribute('width', '180');
  svg.setAttribute('height', '120');
  svg.setAttribute('class', 'chem-structure-svg');

  svg.innerHTML = `
    <!-- 結合線（折れ線型 104.5度） -->
    <line x1="78" y1="48" x2="42" y2="82" stroke="#334155" stroke-width="3" stroke-linecap="round"/>
    <line x1="102" y1="48" x2="138" y2="82" stroke="#334155" stroke-width="3" stroke-linecap="round"/>
    <!-- 元素記号 -->
    <circle cx="90" cy="42" r="16" fill="#fee2e2"/>
    <text x="90" y="48" font-family="'KaTeX_Main', sans-serif" font-size="20" font-weight="bold" fill="#dc2626" text-anchor="middle">O</text>
    <circle cx="34" cy="90" r="14" fill="#e0f2fe"/>
    <text x="34" y="96" font-family="'KaTeX_Main', sans-serif" font-size="18" font-weight="bold" fill="#0284c7" text-anchor="middle">H</text>
    <circle cx="146" cy="90" r="14" fill="#e0f2fe"/>
    <text x="146" y="96" font-family="'KaTeX_Main', sans-serif" font-size="18" font-weight="bold" fill="#0284c7" text-anchor="middle">H</text>
  `;
  return svg;
}

// ベンゼン環のフォールバックSVG描画
function createBenzeneSvg() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 160 160');
  svg.setAttribute('width', '160');
  svg.setAttribute('height', '160');
  svg.setAttribute('class', 'chem-structure-svg');

  svg.innerHTML = `
    <!-- 外側六角形 -->
    <polygon points="80,18 135,50 135,110 80,142 25,110 25,50" fill="none" stroke="#1e293b" stroke-width="3" stroke-linejoin="round"/>
    <!-- 内側二重結合線（ケクレ構造） -->
    <line x1="80" y1="30" x2="123" y2="55" stroke="#1e293b" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="123" y1="105" x2="80" y2="130" stroke="#1e293b" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="37" y1="105" x2="37" y2="55" stroke="#1e293b" stroke-width="2.5" stroke-linecap="round"/>
  `;
  return svg;
}

// SMILES文字列からSVGを描画するヘルパー
function drawSmilesToElement(smiles, container, labelText) {
  if (!container) return;
  container.innerHTML = '';

  // 1. 水分子特化
  if (smiles === 'WATER') {
    container.appendChild(createWaterMoleculeSvg());
    if (labelText) {
      const lbl = document.createElement('div');
      lbl.className = 'chem-structure-label';
      lbl.textContent = labelText;
      container.appendChild(lbl);
    }
    return;
  }

  // 2. ベンゼン環特化（SmilesDrawerが遅延している場合も確実に綺麗に表示）
  if (smiles === 'c1ccccc1' && typeof SmilesDrawer === 'undefined') {
    container.appendChild(createBenzeneSvg());
    if (labelText) {
      const lbl = document.createElement('div');
      lbl.className = 'chem-structure-label';
      lbl.textContent = labelText;
      container.appendChild(lbl);
    }
    return;
  }

  // 3. SmilesDrawer による動的描画
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'chem-structure-svg');
  svg.setAttribute('width', '220');
  svg.setAttribute('height', '160');
  container.appendChild(svg);

  if (typeof SmilesDrawer !== 'undefined' && SmilesDrawer.SvgDrawer) {
    try {
      const drawer = new SmilesDrawer.SvgDrawer({
        width: 220,
        height: 160,
        bondThickness: 2.2,
        bondLength: 22,
        fontSizeLarge: 14,
        fontSizeSmall: 10,
        compactDrawing: false
      });
      SmilesDrawer.parse(smiles, (tree) => {
        drawer.draw(tree, svg, 'light');
      }, (err) => {
        console.warn('SmilesDrawer解析エラー:', err);
        container.innerHTML = `<span style="color:#ef4444; font-size:12px;">構文確認中: ${smiles}</span>`;
      });
    } catch (e) {
      console.error(e);
      container.appendChild(createBenzeneSvg());
    }
  } else {
    // ライブラリ準備中のフォールバック
    if (smiles === 'c1ccccc1') {
      container.innerHTML = '';
      container.appendChild(createBenzeneSvg());
    } else {
      svg.setAttribute('viewBox', '0 0 160 50');
      svg.innerHTML = `<text x="80" y="30" text-anchor="middle" font-size="14" fill="#64748b">${smiles}</text>`;
    }
  }

  if (labelText) {
    const lbl = document.createElement('div');
    lbl.className = 'chem-structure-label';
    lbl.textContent = labelText;
    container.appendChild(lbl);
  }
}

// ==========================================
// 電子回路図（CircuiTikZ風）構文パーサー & SVG描画エンジン
// ==========================================
function parseCircuiTikz(text) {
  // \circuit{...} の中身、または直接の \draw コマンドを抽出
  let clean = text.replace(/\\circuit\{([\s\S]*)\}/g, '$1');
  const commands = clean.split(';').map((c) => c.trim()).filter((c) => c.length > 0);
  const elements = [];

  for (const cmd of commands) {
    if (!cmd.startsWith('\\draw')) continue;
    const rest = cmd.slice(5).trim();
    const startMatch = rest.match(/^\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)/);
    if (!startMatch) continue;

    let curX = parseFloat(startMatch[1]);
    let curY = parseFloat(startMatch[2]);
    let remain = rest.slice(startMatch[0].length).trim();

    const segRegex = /^(to\s*\[([^\]]+)\]|--)\s*\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)/;

    while (remain.length > 0) {
      const match = remain.match(segRegex);
      if (!match) break;

      const isWire = match[1] === '--';
      const toTypeStr = isWire ? '' : match[2];
      const nextX = parseFloat(match[3]);
      const nextY = parseFloat(match[4]);

      let type = 'wire';
      let label = '';
      let yshift = 0;
      if (!isWire) {
        const opts = toTypeStr.split(',').map((s) => s.trim());
        const mainPart = opts[0];
        const parts = mainPart.split('=');
        type = parts[0].trim();
        if (parts.length > 1) {
          let rawLabel = parts.slice(1).join('=').trim();
          rawLabel = rawLabel
            .replace(/\$/g, '')
            .replace(/\\text\{([^}]*)\}/g, '$1')
            .replace(/_\{([^}]+)\}/g, '_$1');
          label = rawLabel;
        }

        for (let i = 1; i < opts.length; i++) {
          const opt = opts[i];
          const mY = opt.match(/^yshift\s*=\s*(-?\d+(?:\.\d+)?)/i);
          if (mY) yshift = parseFloat(mY[1]);
        }
      }

      elements.push({
        x1: curX,
        y1: curY,
        x2: nextX,
        y2: nextY,
        type: type,
        label: label,
        yshift: yshift
      });

      curX = nextX;
      curY = nextY;
      remain = remain.slice(match[0].length).trim();
    }
  }

  return elements;
}

function drawCircuitSvg(circuitText, container, labelText) {
  container.innerHTML = '';
  const elements = parseCircuiTikz(circuitText);
  if (!elements || elements.length === 0) {
    container.innerHTML = '<span style="color:#ef4444; font-size:12px;">回路構文を解析できませんでした</span>';
    return;
  }

  // 座標変換：LaTeXのy軸（上が正）をSVGのy軸（下が正）に反転（scale: 1単位 = 60px）
  const scale = 60;
  const pts = [];

  // まず回路素子の基本端点を登録
  elements.forEach((el) => {
    pts.push({ x: el.x1 * scale, y: -el.y1 * scale });
    pts.push({ x: el.x2 * scale, y: -el.y2 * scale });
  });

  // 回路の重心を暫定計算（法線ベクトルの外向き判定用）
  const initMinX = Math.min(...pts.map((p) => p.x));
  const initMaxX = Math.max(...pts.map((p) => p.x));
  const initMinY = Math.min(...pts.map((p) => p.y));
  const initMaxY = Math.max(...pts.map((p) => p.y));
  const centerX = (initMinX + initMaxX) / 2;
  const centerY = (initMinY + initMaxY) / 2;

  // ラベル位置を事前計算し、pts にバウンディングボックスを追加（viewBox見切れ防止）
  const labelLayouts = [];
  elements.forEach((el) => {
    if (!el.label) {
      labelLayouts.push(null);
      return;
    }

    const p1 = { x: el.x1 * scale, y: -el.y1 * scale };
    const p2 = { x: el.x2 * scale, y: -el.y2 * scale };
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len = Math.hypot(dx, dy);
    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;
    const normDx = len > 0 ? dx / len : 0;
    const normDy = len > 0 ? dy / len : 0;
    const normType = el.type.toLowerCase();

    let nx = -normDy;
    let ny = normDx;
    const toOutX = midX - centerX;
    const toOutY = midY - centerY;

    if (nx * toOutX + ny * toOutY < 0) {
      nx = -nx;
      ny = -ny;
    } else if (nx * toOutX + ny * toOutY === 0) {
      if (Math.abs(normDx) >= Math.abs(normDy)) {
        if (ny > 0) { nx = -nx; ny = -ny; }
      } else {
        if (nx > 0) { nx = -nx; ny = -ny; }
      }
    }

    let offsetDist = 20;
    if (normType === 'sv' || normType === 'ac' || normType === 'battery' || normType === 'v') {
      offsetDist = 24;
    } else if (normType === 'c' || normType === 'capacitor') {
      offsetDist = 20;
    }

    let autoYShift = 0;
    // 垂直素子の場合（中点からの水平分岐線との重なりを回避するため上方に自動シフト）
    if (Math.abs(normDx) < Math.abs(normDy)) {
      autoYShift = -14;
    }
    const manualYShift = el.yshift ? -el.yshift : 0;

    const lx = midX + nx * offsetDist;
    const ly = midY + ny * offsetDist + autoYShift + manualYShift;

    let textAnchor = 'middle';
    let dominantBaseline = 'central';
    if (Math.abs(nx) > Math.abs(ny)) {
      if (nx < 0) textAnchor = 'end';
      else textAnchor = 'start';
    } else {
      textAnchor = 'middle';
      if (ny < 0) dominantBaseline = 'auto';
      else dominantBaseline = 'hanging';
    }

    const textW = Math.max(el.label.length * 8.5 + 8, 22);
    const textH = 18;

    let rx = lx - textW / 2;
    if (textAnchor === 'start') rx = lx - 2;
    else if (textAnchor === 'end') rx = lx - textW + 2;

    let ry = ly - textH / 2;
    if (dominantBaseline === 'auto') ry = ly - textH + 3;
    else if (dominantBaseline === 'hanging') ry = ly - 3;

    // バウンディングボックスを pts に登録（viewBox に反映）
    pts.push({ x: rx, y: ry });
    pts.push({ x: rx + textW, y: ry + textH });

    labelLayouts.push({ lx, ly, rx, ry, textW, textH, textAnchor, dominantBaseline, label: el.label });
  });

  // 全要素（素子＋端点＋ラベル）を含む真のバウンディングボックス
  let minX = Math.min(...pts.map((p) => p.x));
  let maxX = Math.max(...pts.map((p) => p.x));
  let minY = Math.min(...pts.map((p) => p.y));
  let maxY = Math.max(...pts.map((p) => p.y));

  const pad = 24;
  let width = maxX - minX;
  let height = maxY - minY;
  if (width < 60) width = 60;
  if (height < 40) height = 40;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const vbX = minX - pad;
  const vbY = minY - pad;
  const vbW = width + pad * 2;
  const vbH = height + pad * 2;
  svg.setAttribute('viewBox', `${vbX} ${vbY} ${vbW} ${vbH}`);
  svg.setAttribute('width', Math.min(vbW, 460));
  svg.setAttribute('height', Math.min(vbH, 300));
  svg.style.maxWidth = '100%';
  svg.style.height = 'auto';
  svg.style.overflow = 'visible';

  const strokeColor = '#1e293b';
  const strokeWidth = 2;

  elements.forEach((el) => {
    const p1 = { x: el.x1 * scale, y: -el.y1 * scale };
    const p2 = { x: el.x2 * scale, y: -el.y2 * scale };

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len = Math.hypot(dx, dy);
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const compLen = 36;
    const halfComp = compLen / 2;
    const normType = el.type.toLowerCase();

    if (normType === 'wire' || normType === '--' || len <= compLen) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', p1.x);
      line.setAttribute('y1', p1.y);
      line.setAttribute('x2', p2.x);
      line.setAttribute('y2', p2.y);
      line.setAttribute('stroke', strokeColor);
      line.setAttribute('stroke-width', strokeWidth);
      line.setAttribute('stroke-linecap', 'round');
      g.appendChild(line);
    } else {
      const inX = midX - (halfComp * dx) / len;
      const inY = midY - (halfComp * dy) / len;
      const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line1.setAttribute('x1', p1.x);
      line1.setAttribute('y1', p1.y);
      line1.setAttribute('x2', inX);
      line1.setAttribute('y2', inY);
      line1.setAttribute('stroke', strokeColor);
      line1.setAttribute('stroke-width', strokeWidth);
      line1.setAttribute('stroke-linecap', 'round');
      g.appendChild(line1);

      const outX = midX + (halfComp * dx) / len;
      const outY = midY + (halfComp * dy) / len;
      const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line2.setAttribute('x1', outX);
      line2.setAttribute('y1', outY);
      line2.setAttribute('x2', p2.x);
      line2.setAttribute('y2', p2.y);
      line2.setAttribute('stroke', strokeColor);
      line2.setAttribute('stroke-width', strokeWidth);
      line2.setAttribute('stroke-linecap', 'round');
      g.appendChild(line2);

      const compG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      compG.setAttribute('transform', `translate(${midX}, ${midY}) rotate(${angle})`);

      if (normType === 'r' || normType === 'resistor') {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M -18,0 L -12,-7 L -6,7 L 0,-7 L 6,7 L 12,-7 L 18,0');
        path.setAttribute('stroke', strokeColor);
        path.setAttribute('stroke-width', strokeWidth);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke-linejoin', 'round');
        compG.appendChild(path);
      } else if (normType === 'c' || normType === 'capacitor') {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M -18,0 L -4,0 M -4,-12 L -4,12 M 4,-12 L 4,12 M 4,0 L 18,0');
        path.setAttribute('stroke', strokeColor);
        path.setAttribute('stroke-width', strokeWidth);
        path.setAttribute('fill', 'none');
        compG.appendChild(path);
      } else if (normType === 'l' || normType === 'inductor') {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M -18,0 C -18,-9 -9,-9 -9,0 C -9,-9 0,-9 0,0 C 0,-9 9,-9 9,0 C 9,-9 18,-9 18,0');
        path.setAttribute('stroke', strokeColor);
        path.setAttribute('stroke-width', strokeWidth);
        path.setAttribute('fill', 'none');
        compG.appendChild(path);
      } else if (normType === 'battery' || normType === 'v') {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M -18,0 L -4,0 M -4,-14 L -4,14 M 4,-8 L 4,8 M 4,0 L 18,0');
        path.setAttribute('stroke', strokeColor);
        path.setAttribute('stroke-width', strokeWidth);
        path.setAttribute('fill', 'none');
        compG.appendChild(path);
      } else if (normType === 'sv' || normType === 'ac' || normType === 'sinusoidal') {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', 0);
        circle.setAttribute('cy', 0);
        circle.setAttribute('r', 13);
        circle.setAttribute('stroke', strokeColor);
        circle.setAttribute('stroke-width', strokeWidth);
        circle.setAttribute('fill', '#ffffff');
        compG.appendChild(circle);

        const wave = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        wave.setAttribute('d', 'M -7,0 Q -3.5,-7 0,0 Q 3.5,7 7,0');
        wave.setAttribute('stroke', strokeColor);
        wave.setAttribute('stroke-width', strokeWidth);
        wave.setAttribute('fill', 'none');
        compG.appendChild(wave);

        const wIn = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        wIn.setAttribute('x1', -18);
        wIn.setAttribute('y1', 0);
        wIn.setAttribute('x2', -13);
        wIn.setAttribute('y2', 0);
        wIn.setAttribute('stroke', strokeColor);
        wIn.setAttribute('stroke-width', strokeWidth);
        compG.appendChild(wIn);

        const wOut = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        wOut.setAttribute('x1', 13);
        wOut.setAttribute('y1', 0);
        wOut.setAttribute('x2', 18);
        wOut.setAttribute('y2', 0);
        wOut.setAttribute('stroke', strokeColor);
        wOut.setAttribute('stroke-width', strokeWidth);
        compG.appendChild(wOut);
      } else if (normType === 'd' || normType === 'diode') {
        const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        poly.setAttribute('points', '-6,-10 8,0 -6,10');
        poly.setAttribute('fill', strokeColor);
        compG.appendChild(poly);

        const bar = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        bar.setAttribute('x1', 8);
        bar.setAttribute('y1', -10);
        bar.setAttribute('x2', 8);
        bar.setAttribute('y2', 10);
        bar.setAttribute('stroke', strokeColor);
        bar.setAttribute('stroke-width', strokeWidth);
        compG.appendChild(bar);

        const w1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        w1.setAttribute('x1', -18);
        w1.setAttribute('y1', 0);
        w1.setAttribute('x2', -6);
        w1.setAttribute('y2', 0);
        w1.setAttribute('stroke', strokeColor);
        w1.setAttribute('stroke-width', strokeWidth);
        compG.appendChild(w1);

        const w2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        w2.setAttribute('x1', 8);
        w2.setAttribute('y1', 0);
        w2.setAttribute('x2', 18);
        w2.setAttribute('y2', 0);
        w2.setAttribute('stroke', strokeColor);
        w2.setAttribute('stroke-width', strokeWidth);
        compG.appendChild(w2);
      } else if (normType === 'gnd' || normType === 'ground') {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M -18,0 L 0,0 M 0,-12 L 0,12 M 4,-8 L 4,8 M 8,-4 L 8,4');
        path.setAttribute('stroke', strokeColor);
        path.setAttribute('stroke-width', strokeWidth);
        path.setAttribute('fill', 'none');
        compG.appendChild(path);
      } else {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', -14);
        rect.setAttribute('y', -8);
        rect.setAttribute('width', 28);
        rect.setAttribute('height', 16);
        rect.setAttribute('stroke', strokeColor);
        rect.setAttribute('stroke-width', strokeWidth);
        rect.setAttribute('fill', '#ffffff');
        compG.appendChild(rect);
      }

      g.appendChild(compG);
    }

    const dot1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot1.setAttribute('cx', p1.x);
    dot1.setAttribute('cy', p1.y);
    dot1.setAttribute('r', 2.5);
    dot1.setAttribute('fill', strokeColor);
    g.appendChild(dot1);

    const dot2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot2.setAttribute('cx', p2.x);
    dot2.setAttribute('cy', p2.y);
    dot2.setAttribute('r', 2.5);
    dot2.setAttribute('fill', strokeColor);
    g.appendChild(dot2);

    svg.appendChild(g);
  });

  // ラベルレイヤー（素子・配線の上に白座布団＋文字を描画）
  elements.forEach((el, idx) => {
    const layout = labelLayouts[idx];
    if (!layout) return;

    const labelG = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    // 1. 白座布団（背景マスク）
    const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bgRect.setAttribute('x', layout.rx);
    bgRect.setAttribute('y', layout.ry);
    bgRect.setAttribute('width', layout.textW);
    bgRect.setAttribute('height', layout.textH);
    bgRect.setAttribute('fill', '#ffffff');
    bgRect.setAttribute('rx', 4);
    bgRect.setAttribute('ry', 4);
    bgRect.setAttribute('opacity', '0.92');
    bgRect.setAttribute('class', 'circuit-label-mask');
    labelG.appendChild(bgRect);

    // 2. ラベルテキスト
    const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textEl.setAttribute('class', 'circuit-label-text');
    textEl.setAttribute('x', layout.lx);
    textEl.setAttribute('y', layout.ly);
    textEl.setAttribute('text-anchor', layout.textAnchor);
    textEl.setAttribute('dominant-baseline', layout.dominantBaseline);
    textEl.setAttribute('font-size', '13');
    textEl.setAttribute('font-weight', '700');
    textEl.setAttribute('fill', '#d97706');
    textEl.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
    textEl.textContent = layout.label;
    labelG.appendChild(textEl);

    svg.appendChild(labelG);
  });

  container.appendChild(svg);

  if (labelText) {
    const lbl = document.createElement('div');
    lbl.className = 'chem-structure-label';
    lbl.textContent = labelText;
    container.appendChild(lbl);
  }
}

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

  const stepW = 44;
  const nameW = 75;
  const rowH = 38;
  const headerH = 22;
  const pad = 16;
  const totalW = nameW + maxSteps * stepW + pad * 2;
  const totalH = headerH + signals.length * rowH + pad * 2;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${totalW} ${totalH}`);
  svg.setAttribute('width', Math.min(totalW, 640));
  svg.setAttribute('height', Math.min(totalH, 360));
  svg.style.maxWidth = '100%';
  svg.style.height = 'auto';
  svg.style.overflow = 'visible';

  const strokeColor = '#1e293b';
  const strokeWidth = 2;
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
      cycleNum.setAttribute('y', pad + headerH - 6);
      cycleNum.setAttribute('text-anchor', 'middle');
      cycleNum.setAttribute('font-size', '11');
      cycleNum.setAttribute('font-family', 'monospace');
      cycleNum.setAttribute('fill', '#94a3b8');
      cycleNum.textContent = s;
      svg.appendChild(cycleNum);
    }
  }

  // 2. 各シグナル波形を描画
  signals.forEach((sig, rIdx) => {
    const rowY = pad + headerH + rIdx * rowH;
    const yHigh = rowY + 6;
    const yLow = rowY + rowH - 10;
    const yMid = (yHigh + yLow) / 2;

    // 信号名（左端）
    const nameText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    nameText.setAttribute('x', pad + nameW - 12);
    nameText.setAttribute('y', yMid + 4);
    nameText.setAttribute('text-anchor', 'end');
    nameText.setAttribute('font-size', '12.5');
    nameText.setAttribute('font-weight', '700');
    nameText.setAttribute('font-family', 'ui-monospace, SFMono-Regular, Menlo, monospace');
    nameText.setAttribute('fill', '#0d9488');
    nameText.textContent = sig.name;
    svg.appendChild(nameText);

    const startX = pad + nameW;
    let pathD = '';
    let curState = null;
    const transW = 3.5;

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
          lbl.setAttribute('y', yMid + 4);
          lbl.setAttribute('text-anchor', 'middle');
          lbl.setAttribute('font-size', '11.5');
          lbl.setAttribute('font-weight', '600');
          lbl.setAttribute('font-family', 'sans-serif');
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

// ==========================================
// 状態遷移図（オートマトン）構文パーサー & SVG描画エンジン
// ==========================================
function parseFsmChart(fsmText) {
  const lines = fsmText.split(/[\n;]+/).map((l) => l.trim()).filter(Boolean);
  const statesMap = new Map();
  const transitions = [];

  lines.forEach((line) => {
    if (line.includes('->')) {
      const transMatch = line.match(/^(?:trans:?\s*)?([a-zA-Z0-9_\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]+)\s*->\s*([a-zA-Z0-9_\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]+)(?:\s*:\s*([^\[]+))?(?:\s*\[(.*)\])?$/i);
      if (transMatch) {
        const from = transMatch[1].trim();
        const to = transMatch[2].trim();
        let label = (transMatch[3] || '').trim().replace(/^["']|["']$/g, '');
        const opts = (transMatch[4] || '').toLowerCase();
        const bend = opts.includes('bend');
        transitions.push({ from, to, label, bend });

        if (!statesMap.has(from)) statesMap.set(from, { id: from, x: null, y: null, isStart: false, isAccept: false });
        if (!statesMap.has(to)) statesMap.set(to, { id: to, x: null, y: null, isStart: false, isAccept: false });
      }
    } else {
      const stateMatch = line.match(/^(?:state:?\s*)?([a-zA-Z0-9_\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]+)(?:\s*\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\))?(.*)$/i);
      if (stateMatch) {
        const id = stateMatch[1].trim();
        const x = stateMatch[2] !== undefined ? parseFloat(stateMatch[2]) : null;
        const y = stateMatch[3] !== undefined ? parseFloat(stateMatch[3]) : null;
        const flags = (stateMatch[4] || '').toLowerCase();
        const isStart = flags.includes('start') || flags.includes('init');
        const isAccept = flags.includes('accept') || flags.includes('final') || flags.includes('end');

        const existing = statesMap.get(id) || {};
        statesMap.set(id, {
          id,
          x: x !== null ? x : existing.x ?? null,
          y: y !== null ? y : existing.y ?? null,
          isStart: isStart || existing.isStart || false,
          isAccept: isAccept || existing.isAccept || false
        });
      }
    }
  });

  const states = Array.from(statesMap.values());
  let unpositionedIdx = 0;
  states.forEach((st) => {
    if (st.x === null || st.y === null) {
      st.x = unpositionedIdx * 130;
      st.y = 0;
      unpositionedIdx++;
    }
  });

  return { states, transitions };
}

function drawFsmSvg(fsmText, container, labelText) {
  container.innerHTML = '';
  const parsed = parseFsmChart(fsmText);
  const { states, transitions } = parsed;

  if (states.length === 0) {
    container.innerHTML = '<span style="color:#ef4444; font-size:12px;">状態遷移図の構文を解析できませんでした（例: \\fsm{ state: q0 start; state: q1 accept; q0 -> q1: 1; }）</span>';
    return;
  }

  const R = 23;
  const strokeColor = '#1e293b';
  const strokeWidth = 2;
  const stateLookup = new Map(states.map((s) => [s.id, s]));

  const edgePairCount = new Map();
  transitions.forEach((t) => {
    if (t.from !== t.to) {
      const key = [t.from, t.to].sort().join('___');
      edgePairCount.set(key, (edgePairCount.get(key) || 0) + 1);
    }
  });

  const pts = [];
  states.forEach((s) => {
    pts.push({ x: s.x - R - (s.isStart ? 36 : 0), y: s.y - R });
    pts.push({ x: s.x + R, y: s.y + R });
  });

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.style.overflow = 'visible';

  function renderArrowHead(tipX, tipY, angleRad, color) {
    const len = 8.5;
    const width = 5;
    const x1 = tipX - len * Math.cos(angleRad) + width * Math.sin(angleRad);
    const y1 = tipY - len * Math.sin(angleRad) - width * Math.cos(angleRad);
    const x2 = tipX - len * Math.cos(angleRad) - width * Math.sin(angleRad);
    const y2 = tipY - len * Math.sin(angleRad) + width * Math.cos(angleRad);

    const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    poly.setAttribute('points', `${tipX.toFixed(1)},${tipY.toFixed(1)} ${x1.toFixed(1)},${y1.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`);
    poly.setAttribute('fill', color);
    svg.appendChild(poly);
  }

  function renderLabel(cx, cy, text) {
    if (!text) return;
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    const tw = Math.max(text.length * 8 + 8, 16);
    const th = 16;
    const rx = cx - tw / 2;
    const ry = cy - th / 2;

    pts.push({ x: rx, y: ry });
    pts.push({ x: rx + tw, y: ry + th });

    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bg.setAttribute('x', rx);
    bg.setAttribute('y', ry);
    bg.setAttribute('width', tw);
    bg.setAttribute('height', th);
    bg.setAttribute('rx', 3);
    bg.setAttribute('ry', 3);
    bg.setAttribute('fill', '#ffffff');
    bg.setAttribute('opacity', '0.92');
    bg.setAttribute('class', 'fsm-label-mask');
    g.appendChild(bg);

    const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    txt.setAttribute('x', cx);
    txt.setAttribute('y', cy + 4);
    txt.setAttribute('text-anchor', 'middle');
    txt.setAttribute('font-size', '12');
    txt.setAttribute('font-weight', '600');
    txt.setAttribute('font-family', 'ui-monospace, monospace');
    txt.setAttribute('fill', '#4338ca');
    txt.setAttribute('class', 'fsm-label-text');
    txt.textContent = text;
    g.appendChild(txt);

    svg.appendChild(g);
  }

  transitions.forEach((t) => {
    const s1 = stateLookup.get(t.from);
    const s2 = stateLookup.get(t.to);
    if (!s1 || !s2) return;

    if (t.from === t.to) {
      const loopR = 26;
      const x0 = s1.x - 9;
      const y0 = s1.y - R;
      const x1 = s1.x + 9;
      const y1 = s1.y - R;

      const c1x = s1.x - loopR;
      const c1y = s1.y - R - 36;
      const c2x = s1.x + loopR;
      const c2y = s1.y - R - 36;

      pts.push({ x: c1x, y: c1y });
      pts.push({ x: c2x, y: c2y });

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', `M ${x0},${y0} C ${c1x},${c1y} ${c2x},${c2y} ${x1},${y1}`);
      path.setAttribute('stroke', strokeColor);
      path.setAttribute('stroke-width', strokeWidth);
      path.setAttribute('fill', 'none');
      svg.appendChild(path);

      renderArrowHead(x1, y1, Math.PI / 2 + 0.3, strokeColor);
      renderLabel(s1.x, s1.y - R - 30, t.label);
    } else {
      const dx = s2.x - s1.x;
      const dy = s2.y - s1.y;
      const dist = Math.hypot(dx, dy);
      if (dist === 0) return;

      const ux = dx / dist;
      const uy = dy / dist;
      const nx = -uy;
      const ny = ux;

      const key = [t.from, t.to].sort().join('___');
      const isBiDirectional = (edgePairCount.get(key) || 0) > 1;
      const shouldBend = t.bend || isBiDirectional;

      if (shouldBend) {
        const bendOffset = 26;
        const midX = (s1.x + s2.x) / 2 + nx * bendOffset;
        const midY = (s1.y + s2.y) / 2 + ny * bendOffset;

        pts.push({ x: midX, y: midY });

        const angleStart = Math.atan2(midY - s1.y, midX - s1.x);
        const pStartX = s1.x + R * Math.cos(angleStart);
        const pStartY = s1.y + R * Math.sin(angleStart);

        const angleEnd = Math.atan2(midY - s2.y, midX - s2.x);
        const pEndX = s2.x + R * Math.cos(angleEnd);
        const pEndY = s2.y + R * Math.sin(angleEnd);

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', `M ${pStartX.toFixed(1)},${pStartY.toFixed(1)} Q ${midX.toFixed(1)},${midY.toFixed(1)} ${pEndX.toFixed(1)},${pEndY.toFixed(1)}`);
        path.setAttribute('stroke', strokeColor);
        path.setAttribute('stroke-width', strokeWidth);
        path.setAttribute('fill', 'none');
        svg.appendChild(path);

        const arrowAngle = Math.atan2(pEndY - midY, pEndX - midX);
        renderArrowHead(pEndX, pEndY, arrowAngle, strokeColor);

        const labelX = (pStartX + 2 * midX + pEndX) / 4;
        const labelY = (pStartY + 2 * midY + pEndY) / 4 + (ny >= 0 ? 3 : -3);
        renderLabel(labelX, labelY, t.label);
      } else {
        const pStartX = s1.x + ux * R;
        const pStartY = s1.y + uy * R;
        const pEndX = s2.x - ux * R;
        const pEndY = s2.y - uy * R;

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', pStartX.toFixed(1));
        line.setAttribute('y1', pStartY.toFixed(1));
        line.setAttribute('x2', pEndX.toFixed(1));
        line.setAttribute('y2', pEndY.toFixed(1));
        line.setAttribute('stroke', strokeColor);
        line.setAttribute('stroke-width', strokeWidth);
        svg.appendChild(line);

        const arrowAngle = Math.atan2(uy, ux);
        renderArrowHead(pEndX, pEndY, arrowAngle, strokeColor);

        const labelDist = 13;
        const labelX = (pStartX + pEndX) / 2 + nx * labelDist;
        const labelY = (pStartY + pEndY) / 2 + ny * labelDist;
        renderLabel(labelX, labelY, t.label);
      }
    }
  });

  states.forEach((st) => {
    const nodeG = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    if (st.isStart) {
      const arrLen = 28;
      const startX = st.x - R - arrLen;
      const endX = st.x - R;
      const startLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      startLine.setAttribute('x1', startX);
      startLine.setAttribute('y1', st.y);
      startLine.setAttribute('x2', endX);
      startLine.setAttribute('y2', st.y);
      startLine.setAttribute('stroke', strokeColor);
      startLine.setAttribute('stroke-width', strokeWidth);
      nodeG.appendChild(startLine);
      renderArrowHead(endX, st.y, 0, strokeColor);
    }

    const outerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    outerCircle.setAttribute('cx', st.x);
    outerCircle.setAttribute('cy', st.y);
    outerCircle.setAttribute('r', R);
    outerCircle.setAttribute('fill', '#ffffff');
    outerCircle.setAttribute('stroke', strokeColor);
    outerCircle.setAttribute('stroke-width', strokeWidth);
    nodeG.appendChild(outerCircle);

    if (st.isAccept) {
      const innerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      innerCircle.setAttribute('cx', st.x);
      innerCircle.setAttribute('cy', st.y);
      innerCircle.setAttribute('r', R - 4.5);
      innerCircle.setAttribute('fill', 'none');
      innerCircle.setAttribute('stroke', strokeColor);
      innerCircle.setAttribute('stroke-width', 1.8);
      nodeG.appendChild(innerCircle);
    }

    const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textEl.setAttribute('x', st.x);
    textEl.setAttribute('y', st.y + 4.5);
    textEl.setAttribute('text-anchor', 'middle');
    textEl.setAttribute('font-size', '13');
    textEl.setAttribute('font-weight', '700');
    textEl.setAttribute('font-family', 'ui-monospace, SFMono-Regular, Menlo, monospace');
    textEl.setAttribute('fill', strokeColor);
    textEl.textContent = st.id;
    nodeG.appendChild(textEl);

    svg.appendChild(nodeG);
  });

  const minX = Math.min(...pts.map((p) => p.x));
  const maxX = Math.max(...pts.map((p) => p.x));
  const minY = Math.min(...pts.map((p) => p.y));
  const maxY = Math.max(...pts.map((p) => p.y));

  const pad = 24;
  let w = maxX - minX;
  let h = maxY - minY;
  if (w < 80) w = 80;
  if (h < 60) h = 60;

  const vbX = minX - pad;
  const vbY = minY - pad;
  const vbW = w + pad * 2;
  const vbH = h + pad * 2;

  svg.setAttribute('viewBox', `${vbX.toFixed(1)} ${vbY.toFixed(1)} ${vbW.toFixed(1)} ${vbH.toFixed(1)}`);
  svg.setAttribute('width', Math.min(vbW, 580));
  svg.setAttribute('height', Math.min(vbH, 360));
  svg.style.maxWidth = '100%';
  svg.style.height = 'auto';

  container.appendChild(svg);

  if (labelText) {
    const lbl = document.createElement('div');
    lbl.className = 'chem-structure-label';
    lbl.textContent = labelText;
    container.appendChild(lbl);
  }
}

// ==========================================
// ファインマン・ダイアグラム構文パーサー & SVG描画エンジン
// ==========================================
function parseFeynmanDiagram(feynmanText) {
  const lines = feynmanText.split(/[\n;]+/).map((l) => l.trim()).filter(Boolean);
  const elements = [];

  lines.forEach((line) => {
    const match = line.match(/^([a-zA-Z0-9_-]+)\s*:\s*\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)\s*to\s*\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)(?:\s*(?:["']([^"']*)["']|([^\s;\[]+)))?(?:\s*\[(.*)\])?/i);
    if (match) {
      const type = match[1].toLowerCase().trim();
      const x1 = parseFloat(match[2]);
      const y1 = parseFloat(match[3]);
      const x2 = parseFloat(match[4]);
      const y2 = parseFloat(match[5]);
      let label = (match[6] || match[7] || '').trim();
      const opts = (match[8] || '').toLowerCase();

      elements.push({ type, x1, y1, x2, y2, label, opts });
    }
  });

  return elements;
}

function formatFeynmanLabel(raw) {
  if (!raw) return '';
  let str = raw.replace(/[¥￥]/g, '\\');

  // 1. 複合修飾（\bar など）を最優先で処理
  str = str
    .replace(/\\bar\{?\\nu\}?/g, 'ν̄')
    .replace(/\\bar\{?nu\}?/g, 'ν̄')
    .replace(/\\bar\{?([a-zA-Z])\}?/g, '$1̄');

  // 2. 単独ギリシャ文字・素粒子記号
  str = str
    .replace(/\\gamma/g, 'γ')
    .replace(/\\mu/g, 'μ')
    .replace(/\\nu/g, 'ν')
    .replace(/\\tau/g, 'τ')
    .replace(/\\alpha/g, 'α')
    .replace(/\\beta/g, 'β')
    .replace(/\\pi/g, 'π');

  // 3. 上付き文字（電荷・符号など）
  str = str
    .replace(/\^\{?([+-])\}?/g, (m, sign) => (sign === '+' ? '⁺' : '⁻'))
    .replace(/\^([+-])/g, (m, sign) => (sign === '+' ? '⁺' : '⁻'))
    .replace(/\^\{?0\}?/g, '⁰')
    .replace(/\^0/g, '⁰');

  // 4. 下付き文字（フレーバー・世代など）
  const subMap = {
    '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
    '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
    'e': 'ₑ', 'μ': 'ᵤ', 'mu': 'ᵤ', 'τ': 'ᵧ', 'tau': 'ᵧ'
  };
  str = str.replace(/_\{?([0-9a-zA-Zμ]+)\}?/g, (m, sub) => {
    return subMap[sub] || sub;
  });

  return str;
}

function drawFeynmanSvg(feynmanText, container, labelText) {
  container.innerHTML = '';
  const elements = parseFeynmanDiagram(feynmanText);
  if (!elements || elements.length === 0) {
    container.innerHTML = '<span style="color:#ef4444; font-size:12px;">ファインマン図の構文を解析できませんでした（例: \\feynman{ fermion: (0,30) to (50,0) "e^-"; photon: (50,0) to (120,0) "\\gamma"; }）</span>';
    return;
  }

  const strokeColor = '#1e293b';
  const strokeWidth = 2;
  const pts = [];

  elements.forEach((el) => {
    pts.push({ x: el.x1, y: el.y1 });
    pts.push({ x: el.x2, y: el.y2 });
  });

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.style.overflow = 'visible';

  function renderArrowHead(tipX, tipY, angleRad, color) {
    const len = 8.5;
    const width = 4.8;
    const x1 = tipX - len * Math.cos(angleRad) + width * Math.sin(angleRad);
    const y1 = tipY - len * Math.sin(angleRad) - width * Math.cos(angleRad);
    const x2 = tipX - len * Math.cos(angleRad) - width * Math.sin(angleRad);
    const y2 = tipY - len * Math.sin(angleRad) + width * Math.cos(angleRad);

    const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    poly.setAttribute('points', `${tipX.toFixed(1)},${tipY.toFixed(1)} ${x1.toFixed(1)},${y1.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`);
    poly.setAttribute('fill', color);
    svg.appendChild(poly);
  }

  // 1. すべての粒子線を描画（背景レイヤー）
  elements.forEach((el) => {
    const dx = el.x2 - el.x1;
    const dy = el.y2 - el.y1;
    const len = Math.hypot(dx, dy);
    if (len === 0) return;

    const ux = dx / len;
    const uy = dy / len;
    const nx = -uy;
    const ny = ux;

    const midX = (el.x1 + el.x2) / 2;
    const midY = (el.y1 + el.y2) / 2;
    const angleRad = Math.atan2(dy, dx);

    const normType = el.type.toLowerCase();

    if (normType === 'photon' || normType === 'wavy' || normType === 'boson') {
      const numWaves = Math.max(2, Math.round(len / 12));
      const halfW = len / (numWaves * 2);
      const amp = 4.2;

      let d = `M ${el.x1.toFixed(1)},${el.y1.toFixed(1)} `;
      for (let i = 0; i < numWaves * 2; i++) {
        const sign = i % 2 === 0 ? 1 : -1;
        const segStartX = el.x1 + (i * halfW) * ux;
        const segStartY = el.y1 + (i * halfW) * uy;
        const segEndX = el.x1 + ((i + 1) * halfW) * ux;
        const segEndY = el.y1 + ((i + 1) * halfW) * uy;

        const c1x = segStartX + (halfW * 0.36) * ux + sign * amp * nx;
        const c1y = segStartY + (halfW * 0.36) * uy + sign * amp * ny;
        const c2x = segEndX - (halfW * 0.36) * ux + sign * amp * nx;
        const c2y = segEndY - (halfW * 0.36) * uy + sign * amp * ny;

        d += `C ${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${segEndX.toFixed(1)},${segEndY.toFixed(1)} `;
        pts.push({ x: c1x, y: c1y });
      }

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d.trim());
      path.setAttribute('stroke', strokeColor);
      path.setAttribute('stroke-width', strokeWidth);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke-linecap', 'round');
      svg.appendChild(path);
    } else if (normType === 'gluon' || normType === 'curly') {
      const numLoops = Math.max(3, Math.round(len / 14));
      const step = len / numLoops;
      const loopR = 4.5;

      let d = `M ${el.x1.toFixed(1)},${el.y1.toFixed(1)} `;
      for (let i = 0; i < numLoops; i++) {
        const segStartX = el.x1 + i * step * ux;
        const segStartY = el.y1 + i * step * uy;
        const segEndX = el.x1 + (i + 1) * step * ux;
        const segEndY = el.y1 + (i + 1) * step * uy;

        const c1x = segStartX + step * 0.5 * ux + loopR * 1.5 * nx;
        const c1y = segStartY + step * 0.5 * uy + loopR * 1.5 * ny;
        const c2x = segEndX - step * 0.1 * ux + loopR * 1.5 * nx;
        const c2y = segEndY - step * 0.1 * uy + loopR * 1.5 * ny;

        d += `C ${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${segEndX.toFixed(1)},${segEndY.toFixed(1)} `;
        pts.push({ x: c1x, y: c1y });
      }

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d.trim());
      path.setAttribute('stroke', strokeColor);
      path.setAttribute('stroke-width', strokeWidth);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke-linecap', 'round');
      svg.appendChild(path);
    } else if (normType === 'scalar' || normType === 'higgs') {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', el.x1.toFixed(1));
      line.setAttribute('y1', el.y1.toFixed(1));
      line.setAttribute('x2', el.x2.toFixed(1));
      line.setAttribute('y2', el.y2.toFixed(1));
      line.setAttribute('stroke', strokeColor);
      line.setAttribute('stroke-width', strokeWidth);
      line.setAttribute('stroke-dasharray', '5,4');
      svg.appendChild(line);
    } else {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', el.x1.toFixed(1));
      line.setAttribute('y1', el.y1.toFixed(1));
      line.setAttribute('x2', el.x2.toFixed(1));
      line.setAttribute('y2', el.y2.toFixed(1));
      line.setAttribute('stroke', strokeColor);
      line.setAttribute('stroke-width', strokeWidth);
      svg.appendChild(line);

      const isAnti = normType === 'antifermion' || normType === 'positron' || normType.startsWith('anti');
      if (normType !== 'line') {
        const arrAngle = isAnti ? angleRad + Math.PI : angleRad;
        renderArrowHead(midX, midY, arrAngle, strokeColor);
      }
    }
  });

  // 2. 頂点（Vertex: 線の接合点）を描画
  const pointCounts = new Map();
  elements.forEach((el) => {
    const k1 = `${Math.round(el.x1)},${Math.round(el.y1)}`;
    const k2 = `${Math.round(el.x2)},${Math.round(el.y2)}`;
    pointCounts.set(k1, (pointCounts.get(k1) || 0) + 1);
    pointCounts.set(k2, (pointCounts.get(k2) || 0) + 1);
  });

  pointCounts.forEach((count, key) => {
    if (count >= 2) {
      const [vx, vy] = key.split(',').map(Number);
      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('cx', vx);
      dot.setAttribute('cy', vy);
      dot.setAttribute('r', 3);
      dot.setAttribute('fill', strokeColor);
      svg.appendChild(dot);
    }
  });

  // 3. すべてのラベル（座布団＋文字）を最前面レイヤーに描画
  elements.forEach((el) => {
    if (!el.label) return;

    const dx = el.x2 - el.x1;
    const dy = el.y2 - el.y1;
    const len = Math.hypot(dx, dy);
    if (len === 0) return;

    const ux = dx / len;
    const uy = dy / len;
    let nx = -uy;
    let ny = ux;

    // flip / below / right オプションで法線の向きを反対側に反転
    if (el.opts && (el.opts.includes('flip') || el.opts.includes('below') || el.opts.includes('right') || el.opts.includes('rev'))) {
      nx = -nx;
      ny = -ny;
    }

    const midX = (el.x1 + el.x2) / 2;
    const midY = (el.y1 + el.y2) / 2;

    const formatted = formatFeynmanLabel(el.label);
    const labelDist = 16;
    const lx = midX + nx * labelDist;
    const ly = midY + ny * labelDist;

    const tw = Math.max(formatted.length * 8.5 + 8, 18);
    const th = 17;
    const rx = lx - tw / 2;
    const ry = ly - th / 2;

    pts.push({ x: rx, y: ry });
    pts.push({ x: rx + tw, y: ry + th });

    const labelG = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bg.setAttribute('x', rx.toFixed(1));
    bg.setAttribute('y', ry.toFixed(1));
    bg.setAttribute('width', tw.toFixed(1));
    bg.setAttribute('height', th.toFixed(1));
    bg.setAttribute('rx', 4);
    bg.setAttribute('ry', 4);
    bg.setAttribute('fill', '#ffffff');
    bg.setAttribute('opacity', '0.94');
    bg.setAttribute('class', 'feynman-label-mask');
    labelG.appendChild(bg);

    const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    txt.setAttribute('x', lx.toFixed(1));
    txt.setAttribute('y', (ly + 4.5).toFixed(1));
    txt.setAttribute('text-anchor', 'middle');
    txt.setAttribute('font-size', '13');
    txt.setAttribute('font-weight', '700');
    txt.setAttribute('font-family', 'ui-monospace, SFMono-Regular, Menlo, monospace');
    txt.setAttribute('fill', '#9d174d');
    txt.setAttribute('class', 'feynman-label-text');
    txt.textContent = formatted;
    labelG.appendChild(txt);

    svg.appendChild(labelG);
  });


  const minX = Math.min(...pts.map((p) => p.x));
  const maxX = Math.max(...pts.map((p) => p.x));
  const minY = Math.min(...pts.map((p) => p.y));
  const maxY = Math.max(...pts.map((p) => p.y));

  const pad = 20;
  let w = maxX - minX;
  let h = maxY - minY;
  if (w < 80) w = 80;
  if (h < 60) h = 60;

  const vbX = minX - pad;
  const vbY = minY - pad;
  const vbW = w + pad * 2;
  const vbH = h + pad * 2;

  svg.setAttribute('viewBox', `${vbX.toFixed(1)} ${vbY.toFixed(1)} ${vbW.toFixed(1)} ${vbH.toFixed(1)}`);
  svg.setAttribute('width', Math.min(vbW, 580));
  svg.setAttribute('height', Math.min(vbH, 360));
  svg.style.maxWidth = '100%';
  svg.style.height = 'auto';

  container.appendChild(svg);

  if (labelText) {
    const lbl = document.createElement('div');
    lbl.className = 'chem-structure-label';
    lbl.textContent = labelText;
    container.appendChild(lbl);
  }
}

// ==========================================
// サンキーダイアグラム（Sankey Diagram）解析・描画エンジン
// ==========================================
function parseSankeyDiagram(text) {
  const lines = text.split(/[\n;]+/).map((l) => l.trim()).filter((l) => l && !l.startsWith('//') && !l.startsWith('#'));
  const links = [];
  const nodeNamesSet = new Set();

  lines.forEach((line) => {
    const match = line.match(/^(.+?)\s*(?:\[([\d.]+)\])?\s*->\s*(?:\[([\d.]+)\])?\s*(.+?)(?:\s*\[([\d.]+)\])?(?:\s+(#[a-fA-F0-9]{3,6}|[a-zA-Z]+))?$/);
    if (match) {
      const srcRaw = match[1].trim();
      let tgtRaw = match[4].trim();
      let color = match[5] || null;

      const valStr = match[2] || match[3] || match[5] || '10';
      let value = parseFloat(valStr);
      if (isNaN(value) || value <= 0) value = 10;

      const src = srcRaw.replace(/^["']|["']$/g, '').trim();
      let tgt = tgtRaw.replace(/^["']|["']$/g, '').replace(/\[[\d.]+\]/g, '').trim();

      const colorMatch = tgt.match(/\s+(#[a-fA-F0-9]{3,6})$/);
      if (colorMatch) {
        color = colorMatch[1];
        tgt = tgt.replace(/\s+#[a-fA-F0-9]{3,6}$/, '').trim();
      }

      if (src && tgt) {
        links.push({ source: src, target: tgt, value, color });
        nodeNamesSet.add(src);
        nodeNamesSet.add(tgt);
      }
    }
  });

  return { links, nodes: Array.from(nodeNamesSet) };
}

function drawSankeySvg(sankeyText, container, labelText) {
  const { links, nodes } = parseSankeyDiagram(sankeyText);
  if (links.length === 0 || nodes.length === 0) {
    container.innerHTML = '<span style="color:#ef4444; font-size:12px;">サンキー図の構文を解析できませんでした（例: \\sankey{ 投入熱量 [100] -> 有効仕事 [40]; 投入熱量 -> 排熱 [60]; }）</span>';
    return;
  }

  const inSum = {};
  const outSum = {};
  nodes.forEach((n) => {
    inSum[n] = 0;
    outSum[n] = 0;
  });

  links.forEach((l) => {
    outSum[l.source] = (outSum[l.source] || 0) + l.value;
    inSum[l.target] = (inSum[l.target] || 0) + l.value;
  });

  const nodeValue = {};
  nodes.forEach((n) => {
    nodeValue[n] = Math.max(inSum[n], outSum[n]);
    if (nodeValue[n] <= 0) nodeValue[n] = 1;
  });

  const stages = {};
  nodes.forEach((n) => {
    if (inSum[n] === 0) stages[n] = 0;
  });
  if (Object.keys(stages).length === 0) {
    stages[links[0].source] = 0;
  }

  for (let iter = 0; iter < nodes.length; iter++) {
    let changed = false;
    links.forEach((l) => {
      const srcStage = stages[l.source] !== undefined ? stages[l.source] : 0;
      const expectedTgtStage = srcStage + 1;
      if (stages[l.target] === undefined || stages[l.target] < expectedTgtStage) {
        stages[l.target] = expectedTgtStage;
        changed = true;
      }
    });
    if (!changed) break;
  }

  nodes.forEach((n) => {
    if (stages[n] === undefined) stages[n] = 0;
  });

  const maxStage = Math.max(1, ...Object.values(stages));

  const stageGroups = [];
  for (let s = 0; s <= maxStage; s++) {
    stageGroups[s] = [];
  }
  nodes.forEach((n) => {
    stageGroups[stages[n]].push(n);
  });

  const palette = [
    '#0284c7', '#0d9488', '#10b981', '#f59e0b', '#ef4444',
    '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6', '#f97316',
    '#3b82f6', '#84cc16'
  ];
  const nodeColors = {};
  nodes.forEach((n, idx) => {
    if (/排熱|損失|ロス|廃熱|放出|摩擦|抵抗/i.test(n)) {
      nodeColors[n] = '#f59e0b';
    } else if (/有効|仕事|電力|発電|生成|出力|回収/i.test(n)) {
      nodeColors[n] = '#10b981';
    } else {
      nodeColors[n] = palette[idx % palette.length];
    }
  });

  const maxLabelLength = Math.max(...nodes.map((n) => `${n} (${nodeValue[n]})`.length), 8);
  const padX = Math.max(140, Math.ceil(maxLabelLength * 8.5 + 20));
  const svgWidth = Math.max(720, (maxStage + 1) * 240 + padX * 2);
  const padY = 36;
  const nodeWidth = 14;
  const nodeGap = 18;

  let maxStageFlowSum = 0;
  stageGroups.forEach((group) => {
    const sum = group.reduce((acc, n) => acc + nodeValue[n], 0);
    if (sum > maxStageFlowSum) maxStageFlowSum = sum;
  });
  if (maxStageFlowSum <= 0) maxStageFlowSum = 100;

  const maxNodesInStage = Math.max(...stageGroups.map((g) => g.length), 1);
  const baseUsableHeight = 220;
  const svgHeight = Math.max(260, baseUsableHeight + (maxNodesInStage - 1) * nodeGap + padY * 2);
  const usableH = svgHeight - padY * 2;
  const flowScale = Math.max(0.2, (usableH - (maxNodesInStage - 1) * nodeGap) / maxStageFlowSum);

  const nodeGeom = {};
  stageGroups.forEach((group, s) => {
    const groupTotalH = group.reduce((acc, n) => acc + Math.max(10, nodeValue[n] * flowScale), 0) + (group.length - 1) * nodeGap;
    let currY = padY + Math.max(0, (usableH - groupTotalH) / 2);
    const currX = padX + (s / maxStage) * (svgWidth - padX * 2 - nodeWidth);

    group.forEach((n) => {
      const nh = Math.max(10, nodeValue[n] * flowScale);
      nodeGeom[n] = { x: currX, y: currY, w: nodeWidth, h: nh, stage: s };
      currY += nh + nodeGap;
    });
  });

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);
  svg.setAttribute('width', svgWidth);
  svg.setAttribute('height', svgHeight);
  svg.style.maxWidth = '100%';
  svg.style.height = 'auto';

  const sourceOffsets = {};
  const targetOffsets = {};
  nodes.forEach((n) => {
    sourceOffsets[n] = 0;
    targetOffsets[n] = 0;
  });

  const linksG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  linksG.setAttribute('class', 'sankey-links-group');

  links.forEach((link) => {
    const srcG = nodeGeom[link.source];
    const tgtG = nodeGeom[link.target];
    if (!srcG || !tgtG) return;

    const bandH = Math.max(2, link.value * flowScale);

    const x1 = srcG.x + srcG.w;
    const y1_top = srcG.y + sourceOffsets[link.source];
    const y1_bot = y1_top + bandH;
    sourceOffsets[link.source] += bandH;

    const x2 = tgtG.x;
    const y2_top = tgtG.y + targetOffsets[link.target];
    const y2_bot = y2_top + bandH;
    targetOffsets[link.target] += bandH;

    const midX = (x1 + x2) / 2;
    const pathD = `M ${x1.toFixed(1)} ${y1_top.toFixed(1)} ` +
      `C ${midX.toFixed(1)} ${y1_top.toFixed(1)}, ${midX.toFixed(1)} ${y2_top.toFixed(1)}, ${x2.toFixed(1)} ${y2_top.toFixed(1)} ` +
      `L ${x2.toFixed(1)} ${y2_bot.toFixed(1)} ` +
      `C ${midX.toFixed(1)} ${y2_bot.toFixed(1)}, ${midX.toFixed(1)} ${y1_bot.toFixed(1)}, ${x1.toFixed(1)} ${y1_bot.toFixed(1)} ` +
      `Z`;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathD);
    const linkColor = link.color || nodeColors[link.source] || '#0891b2';
    path.setAttribute('fill', linkColor);
    path.setAttribute('fill-opacity', '0.45');
    path.setAttribute('stroke', linkColor);
    path.setAttribute('stroke-width', '0.5');
    path.setAttribute('stroke-opacity', '0.35');
    path.setAttribute('class', 'sankey-link');

    const titleEl = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    titleEl.textContent = `${link.source} → ${link.target}: ${link.value}`;
    path.appendChild(titleEl);

    linksG.appendChild(path);
  });
  svg.appendChild(linksG);

  const nodesG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  nodesG.setAttribute('class', 'sankey-nodes-group');

  nodes.forEach((n) => {
    const geom = nodeGeom[n];
    if (!geom) return;

    const color = nodeColors[n] || '#0891b2';

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', geom.x.toFixed(1));
    rect.setAttribute('y', geom.y.toFixed(1));
    rect.setAttribute('width', geom.w.toFixed(1));
    rect.setAttribute('height', geom.h.toFixed(1));
    rect.setAttribute('rx', '3');
    rect.setAttribute('ry', '3');
    rect.setAttribute('fill', color);
    rect.setAttribute('class', 'sankey-node');

    const titleEl = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    titleEl.textContent = `${n}: 合計 ${nodeValue[n]}`;
    rect.appendChild(titleEl);

    nodesG.appendChild(rect);

    const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    const isFirstStage = geom.stage === 0;
    const isLastStage = geom.stage === maxStage;

    let textX;
    let anchor;
    if (isFirstStage) {
      textX = geom.x - 8;
      anchor = 'end';
    } else if (isLastStage) {
      textX = geom.x + geom.w + 8;
      anchor = 'start';
    } else {
      textX = geom.x + geom.w / 2;
      anchor = 'middle';
    }

    const textY = geom.y + geom.h / 2 + 4.5;
    textEl.setAttribute('x', textX.toFixed(1));
    textEl.setAttribute('y', textY.toFixed(1));
    textEl.setAttribute('text-anchor', anchor);
    textEl.setAttribute('font-size', '12');
    textEl.setAttribute('font-weight', '600');
    textEl.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
    textEl.setAttribute('fill', '#1e293b');
    textEl.setAttribute('class', 'sankey-node-label');
    textEl.textContent = `${n} (${nodeValue[n]})`;

    nodesG.appendChild(textEl);
  });
  svg.appendChild(nodesG);

  container.innerHTML = '';
  container.appendChild(svg);

  if (labelText) {
    const lbl = document.createElement('div');
    lbl.className = 'chem-structure-label';
    lbl.textContent = labelText;
    container.appendChild(lbl);
  }
}

// ==========================================
// フローチャート構文パーサー & SVG描画エンジン
// ==========================================
function parseFlowchart(flowText) {
  const lines = flowText.split(/[\n;]+/).map((l) => l.trim()).filter(Boolean);
  const nodesMap = new Map();
  const edges = [];

  lines.forEach((line) => {
    // 1. コネクタ（接続）行: A -> B
    if (line.includes('->')) {
      const arrowIdx = line.indexOf('->');
      const from = line.substring(0, arrowIdx).trim();
      let rest = line.substring(arrowIdx + 2).trim();

      let opts = '';
      const optMatch = rest.match(/\[(.*)\]$/);
      if (optMatch) {
        opts = optMatch[1].toLowerCase();
        rest = rest.substring(0, optMatch.index).trim();
      }

      let label = '';
      const colonIdx = rest.indexOf(':');
      let to = rest;
      if (colonIdx !== -1) {
        to = rest.substring(0, colonIdx).trim();
        label = rest.substring(colonIdx + 1).trim().replace(/^["']|["']$/g, '');
      }

      if (from && to) {
        edges.push({ from, to, label, opts });

        if (!nodesMap.has(from)) {
          nodesMap.set(from, { id: from, text: from, x: null, y: null, type: 'proc' });
        }
        if (!nodesMap.has(to)) {
          nodesMap.set(to, { id: to, text: to, x: null, y: null, type: 'proc' });
        }
      }
    } else {
      // 2. ノード定義行
      let cleaned = line;
      let nodeType = 'proc';

      // タイプ [start / cond / io / proc / end / sub] の抽出
      const typeMatch = cleaned.match(/\[([a-zA-Z0-9_\-]+)\]/);
      if (typeMatch) {
        const t = typeMatch[1].toLowerCase();
        if (/start|begin|terminal/i.test(t)) nodeType = 'start';
        else if (/end|finish|stop/i.test(t)) nodeType = 'end';
        else if (/cond|branch|decision|if|diamond/i.test(t)) nodeType = 'cond';
        else if (/io|input|output|data|parallelogram/i.test(t)) nodeType = 'io';
        else if (/sub|subroutine|prep/i.test(t)) nodeType = 'sub';
        else nodeType = 'proc';
        cleaned = cleaned.replace(typeMatch[0], '').trim();
      }

      // 座標 (x, y) の抽出
      let posX = null;
      let posY = null;
      const coordMatch = cleaned.match(/\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)/);
      if (coordMatch) {
        posX = parseFloat(coordMatch[1]);
        posY = parseFloat(coordMatch[2]);
        cleaned = cleaned.replace(coordMatch[0], '').trim();
      }

      // プレフィックス (node: や state:) の除去
      cleaned = cleaned.replace(/^(?:node|state|box|step):\s*/i, '').trim();

      // ID と 表示ラベルの分離: 例 ID: "ラベル" または ID
      let id = cleaned;
      let label = cleaned;
      const colonIdx = cleaned.indexOf(':');
      if (colonIdx !== -1) {
        id = cleaned.substring(0, colonIdx).trim();
        label = cleaned.substring(colonIdx + 1).trim();
      }
      label = label.replace(/^["']|["']$/g, '');

      if (id) {
        const existing = nodesMap.get(id) || {};
        nodesMap.set(id, {
          id,
          text: label || existing.text || id,
          x: posX !== null ? posX : (existing.x ?? null),
          y: posY !== null ? posY : (existing.y ?? null),
          type: nodeType !== 'proc' ? nodeType : (existing.type || 'proc')
        });
      }
    }
  });

  const nodes = Array.from(nodesMap.values());

  // 自動レイアウト（座標未指定ノードがある場合）
  let needsLayout = nodes.some((n) => n.x === null || n.y === null);
  if (needsLayout) {
    const inDegrees = new Map();
    const childrenMap = new Map();
    nodes.forEach((n) => {
      inDegrees.set(n.id, 0);
      childrenMap.set(n.id, []);
    });

    edges.forEach((e) => {
      if (inDegrees.has(e.to)) {
        inDegrees.set(e.to, inDegrees.get(e.to) + 1);
      }
      if (childrenMap.has(e.from)) {
        childrenMap.get(e.from).push(e.to);
      }
    });

    const levels = new Map();
    const queue = [];
    nodes.forEach((n) => {
      if (inDegrees.get(n.id) === 0 || n.type === 'start') {
        levels.set(n.id, 0);
        queue.push(n.id);
      }
    });

    if (queue.length === 0 && nodes.length > 0) {
      levels.set(nodes[0].id, 0);
      queue.push(nodes[0].id);
    }

    const visited = new Set();
    while (queue.length > 0) {
      const curr = queue.shift();
      visited.add(curr);
      const currLevel = levels.get(curr) || 0;
      const children = childrenMap.get(curr) || [];
      children.forEach((chId) => {
        const chLevel = levels.get(chId);
        if (chLevel === undefined || chLevel <= currLevel) {
          levels.set(chId, currLevel + 1);
        }
        if (!visited.has(chId) && !queue.includes(chId)) {
          queue.push(chId);
        }
      });
    }

    let maxAssignedLevel = 0;
    levels.forEach((l) => { if (l > maxAssignedLevel) maxAssignedLevel = l; });
    nodes.forEach((n) => {
      if (!levels.has(n.id)) {
        maxAssignedLevel++;
        levels.set(n.id, maxAssignedLevel);
      }
    });

    const levelGroups = new Map();
    nodes.forEach((n) => {
      const l = levels.get(n.id);
      if (!levelGroups.has(l)) levelGroups.set(l, []);
      levelGroups.get(l).push(n);
    });

    levelGroups.forEach((groupNodes, lvl) => {
      const count = groupNodes.length;
      groupNodes.forEach((n, idx) => {
        if (n.x === null) {
          n.x = Math.round((idx - (count - 1) / 2) * 160);
        }
        if (n.y === null) {
          n.y = lvl * 85;
        }
      });
    });
  }

  return { nodes, edges };
}

function drawFlowchartSvg(flowText, container, labelText) {
  container.innerHTML = '';
  const { nodes, edges } = parseFlowchart(flowText);

  if (nodes.length === 0) {
    container.innerHTML = '<span style="color:#ef4444; font-size:12px;">フローチャートの構文を解析できませんでした（例: \\flowchart{ 開始 [start]; 処理 [proc]; 開始 -> 処理; }）</span>';
    return;
  }

  const nodeLookup = new Map();
  nodes.forEach((n) => {
    let w, h;
    const rawStr = n.text || n.id;
    const textLines = rawStr.split(/\\n|\n/);
    n.textLines = textLines;
    const maxLineLen = Math.max(...textLines.map((l) => l.length));
    const extraH = (textLines.length - 1) * 16;

    if (n.type === 'start' || n.type === 'end') {
      w = Math.max(110, maxLineLen * 9 + 36);
      h = 38 + extraH;
    } else if (n.type === 'cond') {
      w = Math.max(124, maxLineLen * 8.5 + 56);
      h = 48 + extraH * 1.2;
    } else if (n.type === 'io') {
      w = Math.max(120, maxLineLen * 9 + 40);
      h = 40 + extraH;
    } else if (n.type === 'sub') {
      w = Math.max(130, maxLineLen * 9 + 42);
      h = 42 + extraH;
    } else {
      w = Math.max(120, maxLineLen * 9 + 32);
      h = 42 + extraH;
    }
    n.w = w;
    n.h = h;
    nodeLookup.set(n.id, n);
  });

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.style.overflow = 'visible';

  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
  marker.setAttribute('id', 'flowchart-arrow');
  marker.setAttribute('viewBox', '0 0 10 10');
  marker.setAttribute('refX', '7');
  marker.setAttribute('refY', '5');
  marker.setAttribute('markerWidth', '6');
  marker.setAttribute('markerHeight', '6');
  marker.setAttribute('orient', 'auto-start-reverse');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M 0 1.5 L 8 5 L 0 8.5 z');
  path.setAttribute('fill', '#475569');
  marker.appendChild(path);
  defs.appendChild(marker);
  svg.appendChild(defs);

  const pts = [];

  const edgesG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  edgesG.setAttribute('class', 'flowchart-edges');

  edges.forEach((e) => {
    const s1 = nodeLookup.get(e.from);
    const s2 = nodeLookup.get(e.to);
    if (!s1 || !s2) return;

    let pathD = '';
    let labelPos = null;

    const dx = s2.x - s1.x;
    const dy = s2.y - s1.y;

    if (dy > 0 && Math.abs(dx) < 40) {
      const startX = s1.x;
      const startY = s1.y + s1.h / 2;
      const endX = s2.x;
      const endY = s2.y - s2.h / 2;
      pathD = `M ${startX} ${startY} L ${endX} ${endY}`;
      labelPos = { x: (startX + endX) / 2 + 14, y: (startY + endY) / 2 };
    } else if (dy > 0) {
      if (s1.type === 'cond') {
        const isRight = dx > 0;
        const startX = isRight ? (s1.x + s1.w / 2) : (s1.x - s1.w / 2);
        const startY = s1.y;
        const endX = s2.x;
        const endY = s2.y - s2.h / 2;
        pathD = `M ${startX} ${startY} H ${endX} V ${endY}`;
        labelPos = { x: (startX + endX) / 2, y: startY - 10 };
      } else {
        const startX = s1.x;
        const startY = s1.y + s1.h / 2;
        const midY = (startY + (s2.y - s2.h / 2)) / 2;
        const endX = s2.x;
        const endY = s2.y - s2.h / 2;
        pathD = `M ${startX} ${startY} V ${midY} H ${endX} V ${endY}`;
        labelPos = { x: (startX + endX) / 2, y: midY - 10 };
      }
    } else {
      const outerX = Math.min(s1.x - s1.w / 2, s2.x - s2.w / 2) - 45;
      const startX = s1.x - s1.w / 2;
      const startY = s1.y;
      const endX = s2.x - s2.w / 2;
      const endY = s2.y;
      pathD = `M ${startX} ${startY} H ${outerX} V ${endY} H ${endX}`;
      labelPos = { x: outerX - 16, y: (startY + endY) / 2 };
      pts.push({ x: outerX - 25, y: startY });
      pts.push({ x: outerX, y: endY });
    }

    const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pathEl.setAttribute('d', pathD);
    pathEl.setAttribute('fill', 'none');
    pathEl.setAttribute('stroke', '#475569');
    pathEl.setAttribute('stroke-width', '2');
    pathEl.setAttribute('marker-end', 'url(#flowchart-arrow)');
    edgesG.appendChild(pathEl);

    if (e.label && labelPos) {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      const tw = Math.max(e.label.length * 8 + 10, 24);
      const th = 16;
      const rx = labelPos.x - tw / 2;
      const ry = labelPos.y - th / 2;

      const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bg.setAttribute('x', rx);
      bg.setAttribute('y', ry);
      bg.setAttribute('width', tw);
      bg.setAttribute('height', th);
      bg.setAttribute('rx', '3');
      bg.setAttribute('ry', '3');
      bg.setAttribute('fill', '#ffffff');
      bg.setAttribute('stroke', '#cbd5e1');
      bg.setAttribute('stroke-width', '1');
      g.appendChild(bg);

      const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      txt.setAttribute('x', labelPos.x);
      txt.setAttribute('y', labelPos.y + 4.5);
      txt.setAttribute('text-anchor', 'middle');
      txt.setAttribute('font-size', '11');
      txt.setAttribute('font-weight', '700');
      txt.setAttribute('font-family', 'ui-monospace, monospace');
      txt.setAttribute('fill', '#0284c7');
      txt.textContent = e.label;
      g.appendChild(txt);

      edgesG.appendChild(g);
      pts.push({ x: rx, y: ry });
      pts.push({ x: rx + tw, y: ry + th });
    }
  });

  svg.appendChild(edgesG);

  const nodesG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  nodesG.setAttribute('class', 'flowchart-nodes');

  nodes.forEach((n) => {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const x0 = n.x - n.w / 2;
    const y0 = n.y - n.h / 2;

    pts.push({ x: x0, y: y0 });
    pts.push({ x: x0 + n.w, y: y0 + n.h });

    let shapeEl;
    let fill = '#eff6ff';
    let stroke = '#3b82f6';
    let textColor = '#1e40af';

    if (n.type === 'start' || n.type === 'end') {
      fill = '#ecfdf5';
      stroke = '#10b981';
      textColor = '#065f46';
      shapeEl = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      shapeEl.setAttribute('x', x0);
      shapeEl.setAttribute('y', y0);
      shapeEl.setAttribute('width', n.w);
      shapeEl.setAttribute('height', n.h);
      shapeEl.setAttribute('rx', n.h / 2);
      shapeEl.setAttribute('ry', n.h / 2);
    } else if (n.type === 'cond') {
      fill = '#fffbeb';
      stroke = '#f59e0b';
      textColor = '#92400e';
      shapeEl = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      const topP = `${n.x},${y0}`;
      const rightP = `${n.x + n.w / 2},${n.y}`;
      const bottomP = `${n.x},${y0 + n.h}`;
      const leftP = `${n.x - n.w / 2},${n.y}`;
      shapeEl.setAttribute('points', `${topP} ${rightP} ${bottomP} ${leftP}`);
    } else if (n.type === 'io') {
      fill = '#f5f3ff';
      stroke = '#8b5cf6';
      textColor = '#5b21b6';
      shapeEl = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      const skew = 14;
      const p1 = `${x0 + skew},${y0}`;
      const p2 = `${x0 + n.w},${y0}`;
      const p3 = `${x0 + n.w - skew},${y0 + n.h}`;
      const p4 = `${x0},${y0 + n.h}`;
      shapeEl.setAttribute('points', `${p1} ${p2} ${p3} ${p4}`);
    } else if (n.type === 'sub') {
      fill = '#f0fdfa';
      stroke = '#14b8a6';
      textColor = '#115e59';
      shapeEl = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      shapeEl.setAttribute('x', x0);
      shapeEl.setAttribute('y', y0);
      shapeEl.setAttribute('width', n.w);
      shapeEl.setAttribute('height', n.h);
      shapeEl.setAttribute('rx', '4');
      shapeEl.setAttribute('ry', '4');
    } else {
      shapeEl = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      shapeEl.setAttribute('x', x0);
      shapeEl.setAttribute('y', y0);
      shapeEl.setAttribute('width', n.w);
      shapeEl.setAttribute('height', n.h);
      shapeEl.setAttribute('rx', '5');
      shapeEl.setAttribute('ry', '5');
    }

    shapeEl.setAttribute('fill', fill);
    shapeEl.setAttribute('stroke', stroke);
    shapeEl.setAttribute('stroke-width', '2');
    g.appendChild(shapeEl);

    if (n.type === 'sub') {
      const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line1.setAttribute('x1', x0 + 10);
      line1.setAttribute('y1', y0);
      line1.setAttribute('x2', x0 + 10);
      line1.setAttribute('y2', y0 + n.h);
      line1.setAttribute('stroke', stroke);
      line1.setAttribute('stroke-width', '1.5');
      g.appendChild(line1);

      const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line2.setAttribute('x1', x0 + n.w - 10);
      line2.setAttribute('y1', y0);
      line2.setAttribute('x2', x0 + n.w - 10);
      line2.setAttribute('y2', y0 + n.h);
      line2.setAttribute('stroke', stroke);
      line2.setAttribute('stroke-width', '1.5');
      g.appendChild(line2);
    }

    const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textEl.setAttribute('x', n.x);
    textEl.setAttribute('text-anchor', 'middle');
    textEl.setAttribute('font-size', '12');
    textEl.setAttribute('font-weight', '600');
    textEl.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
    textEl.setAttribute('fill', textColor);

    const tLines = n.textLines || [n.text || n.id];
    if (tLines.length === 1) {
      textEl.setAttribute('y', n.y + 4.5);
      textEl.textContent = tLines[0];
    } else {
      const lineH = 15;
      const startY = n.y - ((tLines.length - 1) * lineH) / 2 + 4.5;
      textEl.setAttribute('y', startY.toFixed(1));
      tLines.forEach((lineText, idx) => {
        const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
        tspan.setAttribute('x', n.x);
        if (idx > 0) {
          tspan.setAttribute('dy', lineH);
        }
        tspan.textContent = lineText;
        textEl.appendChild(tspan);
      });
    }
    g.appendChild(textEl);

    nodesG.appendChild(g);
  });

  svg.appendChild(nodesG);

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  pts.forEach((p) => {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  });

  const padX = 18;
  const padY = 12;
  const vbX = minX - padX;
  const vbY = minY - padY;
  const vbW = Math.max(120, maxX - minX + padX * 2);
  const vbH = Math.max(60, maxY - minY + padY * 2);

  svg.setAttribute('viewBox', `${vbX.toFixed(1)} ${vbY.toFixed(1)} ${vbW.toFixed(1)} ${vbH.toFixed(1)}`);
  svg.setAttribute('width', vbW.toFixed(1));
  svg.setAttribute('height', vbH.toFixed(1));
  svg.style.maxWidth = '100%';
  svg.style.height = 'auto';

  container.innerHTML = '';
  container.appendChild(svg);

  if (labelText) {
    const lbl = document.createElement('div');
    lbl.className = 'chem-structure-label';
    lbl.textContent = labelText;
    container.appendChild(lbl);
  }
}

// ==========================================
// 表（テーブル：LaTeX tabular / Markdown / CSV / TSV）パーサー & レンダラー
// ==========================================
function parseAnyTable(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;
  let text = rawText.trim();

  // \table{...} ラッパーのアンラップ
  const tableWrapperMatch = text.match(/^\\table\{([\s\S]*)\}$/i);
  if (tableWrapperMatch) {
    text = tableWrapperMatch[1].trim();
  }

  // 1. LaTeX tabular / array 環境の判定
  const latexMatch = text.match(/\\begin\{(tabular|array)\}(?:\{([^}]*)\})?([\s\S]*?)\\end\{(tabular|array)\}/i);
  if (latexMatch) {
    const colSpec = latexMatch[2] || '';
    const body = latexMatch[3] || '';
    const aligns = [];
    for (const ch of colSpec) {
      if (ch === 'l') aligns.push('left');
      else if (ch === 'c') aligns.push('center');
      else if (ch === 'r') aligns.push('right');
    }

    const rawRows = body.split(/\\\\/);
    const parsedRows = [];
    for (const raw of rawRows) {
      const cleaned = raw.replace(/\\(hline|toprule|midrule|bottomrule)\b/g, '').trim();
      if (!cleaned) continue;
      const cells = cleaned.split('&').map((cell) => cell.trim());
      if (cells.length > 0 && cells.some((c) => c.length > 0)) {
        parsedRows.push(cells);
      }
    }

    if (parsedRows.length > 0) {
      const headers = parsedRows[0];
      const rows = parsedRows.slice(1);
      return { headers, rows, aligns };
    }
  }

  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return null;

  // 2. Markdown 表の判定
  const isMdLike = lines.every((l) => l.includes('|'));
  if (isMdLike) {
    const splitMdRow = (line) => {
      let trimmed = line;
      if (trimmed.startsWith('|')) trimmed = trimmed.substring(1);
      if (trimmed.endsWith('|')) trimmed = trimmed.substring(0, trimmed.length - 1);
      return trimmed.split('|').map((c) => c.trim());
    };

    const firstRow = splitMdRow(lines[0]);
    if (firstRow.length >= 2) {
      let aligns = [];
      let rowsStartIndex = 1;

      if (lines.length >= 2 && /^\|?(\s*:?-+:?\s*\|?)+$/.test(lines[1])) {
        const sepCols = splitMdRow(lines[1]);
        aligns = sepCols.map((c) => {
          const l = c.startsWith(':');
          const r = c.endsWith(':');
          if (l && r) return 'center';
          if (r) return 'right';
          if (l) return 'left';
          return 'left';
        });
        rowsStartIndex = 2;
      }

      const headers = firstRow;
      const rows = [];
      for (let i = rowsStartIndex; i < lines.length; i++) {
        rows.push(splitMdRow(lines[i]));
      }
      return { headers, rows, aligns };
    }
  }

  // 3. CSV / TSV の判定
  const delimiter = lines[0].includes('\t') ? '\t' : (lines[0].includes(',') ? ',' : null);
  if (delimiter) {
    const parseCsvLine = (line, delim) => {
      const result = [];
      let current = '';
      let inQuote = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          inQuote = !inQuote;
        } else if (ch === delim && !inQuote) {
          result.push(current.trim().replace(/^["']|["']$/g, ''));
          current = '';
        } else {
          current += ch;
        }
      }
      result.push(current.trim().replace(/^["']|["']$/g, ''));
      return result;
    };

    const firstRow = parseCsvLine(lines[0], delimiter);
    if (firstRow.length >= 2) {
      const rows = [];
      let valid = true;
      for (let i = 1; i < lines.length; i++) {
        const row = parseCsvLine(lines[i], delimiter);
        if (row.length >= 2) {
          rows.push(row);
        } else {
          valid = false;
          break;
        }
      }
      if (valid && rows.length > 0) {
        return { headers: firstRow, rows, aligns: [] };
      }
    }
  }

  return null;
}

function renderTableCellHtml(rawCellText) {
  if (!rawCellText) return '';
  let str = rawCellText.trim();

  // 1. $式$ のインライン数式置換（数式と通常テキスト・改行の混在に対応）
  const mathRegex = /\$([^$]+)\$/g;
  if (mathRegex.test(str)) {
    str = str.replace(mathRegex, (_, expr) => {
      if (typeof katex !== 'undefined') {
        try {
          return katex.renderToString(expr.trim(), { throwOnError: false });
        } catch {
          return expr;
        }
      }
      return expr;
    });
  } else if (/^\\(text|frac|sqrt|vec|dot|theta|alpha|beta|omega|mu|sigma|lambda|Delta|nabla|partial|approx|pm|times|div)/i.test(str)) {
    // 先頭が LaTeX コマンドの場合
    if (typeof katex !== 'undefined') {
      try {
        str = katex.renderToString(str, { throwOnError: false });
      } catch {
        // fallback
      }
    }
  }

  // 2. KaTeX 未変換のテキストに対する HTML エスケープ
  if (!str.includes('<span class="katex">')) {
    str = str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // 3. セル内改行: \n または <br> を <br> タグへ展開
  str = str.replace(/\\n/g, '<br>').replace(/&lt;br\s*\/?&gt;/gi, '<br>');

  return str;
}

function renderTableElement(tableData, container, labelText) {
  container.innerHTML = '';
  if (!tableData || !tableData.headers || tableData.headers.length === 0) return;

  const table = document.createElement('table');
  table.className = 'physi-table';

  const thead = document.createElement('thead');
  const headTr = document.createElement('tr');
  tableData.headers.forEach((hText, colIdx) => {
    const th = document.createElement('th');
    th.innerHTML = renderTableCellHtml(hText);
    const align = (tableData.aligns && tableData.aligns[colIdx]) || 'left';
    th.style.textAlign = align;
    headTr.appendChild(th);
  });
  thead.appendChild(headTr);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  tableData.rows.forEach((row) => {
    const tr = document.createElement('tr');
    row.forEach((cText, colIdx) => {
      const td = document.createElement('td');
      td.innerHTML = renderTableCellHtml(cText);
      const align = (tableData.aligns && tableData.aligns[colIdx]) || 'left';
      td.style.textAlign = align;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  container.appendChild(table);

  if (labelText) {
    const lbl = document.createElement('div');
    lbl.className = 'chem-structure-label';
    lbl.textContent = labelText;
    container.appendChild(lbl);
  }
}

// ==========================================
// 2軸マップ・マトリクス図（ポジショニングマップ）パーサー & レンダラー
// ==========================================
function parseMatrixMap(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;
  const lines = rawText.split(/[\n;]+/).map((l) => l.trim()).filter(Boolean);

  let title = '';
  let axisX = { label: 'X軸', left: '', right: '' };
  let axisY = { label: 'Y軸', bottom: '', top: '' };
  const quadrants = { tr: '', tl: '', br: '', bl: '' };
  const items = [];

  lines.forEach((line) => {
    // 1. タイトル
    const titleMatch = line.match(/^title\s*:\s*(.+)$/i);
    if (titleMatch) {
      title = titleMatch[1].trim().replace(/^["']|["']$/g, '');
      return;
    }

    // 2. X軸 (例: axis-x: 価格帯 (低価格 -> 高価格);)
    const xMatch = line.match(/^axis-x\s*:\s*(.+)$/i);
    if (xMatch) {
      const val = xMatch[1].trim();
      const parenMatch = val.match(/^([^()]+)\s*(?:\(([^->()]+)\s*->\s*([^()]+)\))?/);
      if (parenMatch) {
        axisX.label = parenMatch[1].trim();
        axisX.left = (parenMatch[2] || '').trim();
        axisX.right = (parenMatch[3] || '').trim();
      } else {
        axisX.label = val;
      }
      return;
    }

    // 3. Y軸 (例: axis-y: 品質 (標準的 -> 高品質);)
    const yMatch = line.match(/^axis-y\s*:\s*(.+)$/i);
    if (yMatch) {
      const val = yMatch[1].trim();
      const parenMatch = val.match(/^([^()]+)\s*(?:\(([^->()]+)\s*->\s*([^()]+)\))?/);
      if (parenMatch) {
        axisY.label = parenMatch[1].trim();
        axisY.bottom = (parenMatch[2] || '').trim();
        axisY.top = (parenMatch[3] || '').trim();
      } else {
        axisY.label = val;
      }
      return;
    }

    // 4. 象限ラベル
    const quadMatch = line.match(/^quadrant\s*:\s*(.+)$/i);
    if (quadMatch) {
      const val = quadMatch[1];
      const qTokens = val.split(',').map((t) => t.trim());
      qTokens.forEach((tok) => {
        const m = tok.match(/\[([^\]]+)\]\s*(.+)/);
        if (m) {
          const pos = m[1].toLowerCase();
          const name = m[2].trim().replace(/^["']|["']$/g, '');
          if (/右上|tr|top-right|1|第一/i.test(pos)) quadrants.tr = name;
          else if (/左上|tl|top-left|2|第二/i.test(pos)) quadrants.tl = name;
          else if (/左下|bl|bottom-left|3|第三/i.test(pos)) quadrants.bl = name;
          else if (/右下|br|bottom-right|4|第四/i.test(pos)) quadrants.br = name;
        }
      });
      return;
    }

    // 5. プロット項目
    const itemLine = line.replace(/^item\s*:\s*/i, '');
    const coordMatch = itemLine.match(/^([^()\[\]]+)\s*\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)(?:\s*\[(.*)\])?/);
    if (coordMatch) {
      const name = coordMatch[1].trim().replace(/^["']|["']$/g, '');
      const x = parseFloat(coordMatch[2]);
      const y = parseFloat(coordMatch[3]);
      const styleTag = (coordMatch[4] || '').toLowerCase().trim();
      items.push({ name, x, y, styleTag });
    }
  });

  return { title, axisX, axisY, quadrants, items };
}

function drawMatrixMapSvg(mapText, container, labelText) {
  container.innerHTML = '';
  const data = parseMatrixMap(mapText);
  if (!data) {
    container.innerHTML = '<span style="color:#ef4444; font-size:12px;">2軸マップの構文を解析できませんでした</span>';
    return;
  }

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const svgW = 600;
  const svgH = 480;
  svg.setAttribute('viewBox', `0 0 ${svgW} ${svgH}`);
  svg.setAttribute('width', `${svgW}`);
  svg.setAttribute('height', `${svgH}`);
  svg.style.maxWidth = '100%';
  svg.style.height = 'auto';

  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
  marker.setAttribute('id', 'matrix-axis-arrow');
  marker.setAttribute('viewBox', '0 0 10 10');
  marker.setAttribute('refX', '6');
  marker.setAttribute('refY', '5');
  marker.setAttribute('markerWidth', '6');
  marker.setAttribute('markerHeight', '6');
  marker.setAttribute('orient', 'auto-start-reverse');
  const arrPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  arrPath.setAttribute('d', 'M 0 2 L 7 5 L 0 8 z');
  arrPath.setAttribute('fill', '#475569');
  marker.appendChild(arrPath);
  defs.appendChild(marker);
  svg.appendChild(defs);

  // プロット幾何領域（上下左右に軸ラベルクリアランスを確保）
  const plotLeft = 65;
  const plotRight = 465;
  const plotTop = 92;
  const plotBottom = 432;
  const originX = (plotLeft + plotRight) / 2;
  const originY = (plotTop + plotBottom) / 2;
  const halfW = (plotRight - plotLeft) / 2;
  const halfH = (plotBottom - plotTop) / 2;

  // 1. 象限背景四角形
  const quadConfigs = [
    { x: originX, y: plotTop, w: halfW, h: halfH, fill: '#ecfdf5', label: data.quadrants.tr, tx: plotRight - 10, ty: plotTop + 16, anchor: 'end' },
    { x: plotLeft, y: plotTop, w: halfW, h: halfH, fill: '#f0f9ff', label: data.quadrants.tl, tx: plotLeft + 10, ty: plotTop + 16, anchor: 'start' },
    { x: plotLeft, y: originY, w: halfW, h: halfH, fill: '#f8fafc', label: data.quadrants.bl, tx: plotLeft + 10, ty: plotBottom - 10, anchor: 'start' },
    { x: originX, y: originY, w: halfW, h: halfH, fill: '#fffbeb', label: data.quadrants.br, tx: plotRight - 10, ty: plotBottom - 10, anchor: 'end' }
  ];

  const quadG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  quadConfigs.forEach((q) => {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('class', 'matrix-quadrant-bg');
    rect.setAttribute('x', q.x);
    rect.setAttribute('y', q.y);
    rect.setAttribute('width', q.w);
    rect.setAttribute('height', q.h);
    rect.setAttribute('fill', q.fill);
    rect.setAttribute('stroke', '#e2e8f0');
    rect.setAttribute('stroke-width', '1');
    quadG.appendChild(rect);

    if (q.label) {
      const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      txt.setAttribute('x', q.tx);
      txt.setAttribute('y', q.ty);
      txt.setAttribute('text-anchor', q.anchor);
      txt.setAttribute('font-size', '10.5');
      txt.setAttribute('font-weight', '700');
      txt.setAttribute('fill', '#94a3b8');
      txt.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
      txt.textContent = q.label;
      quadG.appendChild(txt);
    }
  });
  svg.appendChild(quadG);

  // 2. グリッド目盛り（補助点線）
  const gridG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  [-0.5, 0.5].forEach((frac) => {
    const gx = originX + frac * halfW;
    const gy = originY - frac * halfH;

    const vLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    vLine.setAttribute('x1', gx);
    vLine.setAttribute('y1', plotTop);
    vLine.setAttribute('x2', gx);
    vLine.setAttribute('y2', plotBottom);
    vLine.setAttribute('stroke', '#cbd5e1');
    vLine.setAttribute('stroke-dasharray', '3,3');
    vLine.setAttribute('stroke-width', '1');
    gridG.appendChild(vLine);

    const hLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    hLine.setAttribute('x1', plotLeft);
    hLine.setAttribute('y1', gy);
    hLine.setAttribute('x2', plotRight);
    hLine.setAttribute('y2', gy);
    hLine.setAttribute('stroke', '#cbd5e1');
    hLine.setAttribute('stroke-dasharray', '3,3');
    hLine.setAttribute('stroke-width', '1');
    gridG.appendChild(hLine);
  });
  svg.appendChild(gridG);

  // 3. メイン十字軸（矢印線）
  const axisG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  xAxis.setAttribute('x1', plotLeft - 12);
  xAxis.setAttribute('y1', originY);
  xAxis.setAttribute('x2', plotRight + 14);
  xAxis.setAttribute('y2', originY);
  xAxis.setAttribute('stroke', '#475569');
  xAxis.setAttribute('stroke-width', '2');
  xAxis.setAttribute('marker-end', 'url(#matrix-axis-arrow)');
  axisG.appendChild(xAxis);

  const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  yAxis.setAttribute('x1', originX);
  yAxis.setAttribute('y1', plotBottom + 12);
  yAxis.setAttribute('x2', originX);
  yAxis.setAttribute('y2', plotTop - 12);
  yAxis.setAttribute('stroke', '#475569');
  yAxis.setAttribute('stroke-width', '2');
  yAxis.setAttribute('marker-end', 'url(#matrix-axis-arrow)');
  axisG.appendChild(yAxis);

  svg.appendChild(axisG);

  // 4. 軸タイトル & 端点ラベル
  const labelG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  labelG.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');

  if (data.title) {
    const tEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    tEl.setAttribute('x', originX);
    tEl.setAttribute('y', 30);
    tEl.setAttribute('text-anchor', 'middle');
    tEl.setAttribute('font-size', '16');
    tEl.setAttribute('font-weight', '700');
    tEl.setAttribute('fill', '#0f172a');
    tEl.textContent = data.title;
    labelG.appendChild(tEl);
  }

  const xTitle = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  xTitle.setAttribute('x', plotRight + 28);
  xTitle.setAttribute('y', originY + 4);
  xTitle.setAttribute('text-anchor', 'start');
  xTitle.setAttribute('font-size', '12');
  xTitle.setAttribute('font-weight', '700');
  xTitle.setAttribute('fill', '#1e293b');
  xTitle.textContent = data.axisX.label;
  labelG.appendChild(xTitle);

  if (data.axisX.right) {
    const xr = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    xr.setAttribute('x', plotRight + 28);
    xr.setAttribute('y', originY + 18);
    xr.setAttribute('text-anchor', 'start');
    xr.setAttribute('font-size', '10.5');
    xr.setAttribute('fill', '#64748b');
    xr.textContent = `[${data.axisX.right}]`;
    labelG.appendChild(xr);
  }
  if (data.axisX.left) {
    const xl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    xl.setAttribute('x', plotLeft - 22);
    xl.setAttribute('y', originY + 4);
    xl.setAttribute('text-anchor', 'end');
    xl.setAttribute('font-size', '10.5');
    xl.setAttribute('fill', '#64748b');
    xl.textContent = data.axisX.left;
    labelG.appendChild(xl);
  }

  const yTitle = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  yTitle.setAttribute('x', originX);
  yTitle.setAttribute('y', 50);
  yTitle.setAttribute('text-anchor', 'middle');
  yTitle.setAttribute('font-size', '12');
  yTitle.setAttribute('font-weight', '700');
  yTitle.setAttribute('fill', '#1e293b');
  yTitle.textContent = data.axisY.label;
  labelG.appendChild(yTitle);

  if (data.axisY.top) {
    const yt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    yt.setAttribute('x', originX);
    yt.setAttribute('y', 66);
    yt.setAttribute('text-anchor', 'middle');
    yt.setAttribute('font-size', '10.5');
    yt.setAttribute('fill', '#64748b');
    yt.textContent = `[${data.axisY.top}]`;
    labelG.appendChild(yt);
  }
  if (data.axisY.bottom) {
    const yb = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    yb.setAttribute('x', originX);
    yb.setAttribute('y', plotBottom + 28);
    yb.setAttribute('text-anchor', 'middle');
    yb.setAttribute('font-size', '10.5');
    yb.setAttribute('fill', '#64748b');
    yb.textContent = data.axisY.bottom;
    labelG.appendChild(yb);
  }

  svg.appendChild(labelG);

  // 5. プロットアイテムの描画（スマート衝突回避 + レイヤー順最適化）
  const labelsG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const dotsG = document.createElementNS('http://www.w3.org/2000/svg', 'g');

  const resolvedItems = data.items.map((item) => {
    const cx = originX + Math.max(-1.0, Math.min(1.0, item.x)) * halfW;
    const cy = originY - Math.max(-1.0, Math.min(1.0, item.y)) * halfH;

    let color = '#2563eb';
    let isAccent = false;
    if (/accent|highlight|red|pink/i.test(item.styleTag)) {
      color = '#e11d48';
      isAccent = true;
    } else if (/warning|orange|yellow/i.test(item.styleTag)) {
      color = '#f59e0b';
    } else if (/success|green/i.test(item.styleTag)) {
      color = '#10b981';
    } else if (/danger|alert/i.test(item.styleTag)) {
      color = '#dc2626';
    } else if (/muted|gray/i.test(item.styleTag)) {
      color = '#64748b';
    }

    const tw = Math.max(item.name.length * 11 + 14, 32);
    const th = 20;

    return {
      raw: item,
      name: item.name,
      x: item.x,
      y: item.y,
      cx,
      cy,
      color,
      isAccent,
      tw,
      th
    };
  });

  const placedLabels = [];

  resolvedItems.forEach((item, i) => {
    const { cx, cy, tw, th } = item;

    // 基本Y座標（上部・下部の初期退避）
    let baseLy = cy - 10;
    if (item.y > 0.45) {
      baseLy = cy + 8;
    } else if (item.y < -0.7) {
      baseLy = cy - 26;
    }

    // 4方向の配置候補
    const candidates = [
      { lx: cx + 8, ly: baseLy, cost: 0 }, // 右
      { lx: cx - tw - 8, ly: baseLy, cost: 10 }, // 左
      { lx: Math.max(plotLeft - 10, Math.min(plotRight - tw + 10, cx - tw / 2)), ly: cy + 10, cost: 25 }, // 下中央
      { lx: Math.max(plotLeft - 10, Math.min(plotRight - tw + 10, cx - tw / 2)), ly: cy - th - 10, cost: 35 } // 上中央
    ];

    let bestCand = candidates[0];
    let minPenalty = Infinity;

    candidates.forEach((cand) => {
      let penalty = cand.cost;
      const x1 = cand.lx;
      const x2 = cand.lx + tw;
      const y1 = cand.ly;
      const y2 = cand.ly + th;

      // 1. 他の全ドットとの衝突ペナルティ（最優先で回避）
      resolvedItems.forEach((other, j) => {
        if (i === j) return;
        if (x1 - 6 <= other.cx && other.cx <= x2 + 6 && y1 - 6 <= other.cy && other.cy <= y2 + 6) {
          penalty += 1200;
        }
      });

      // 2. 既に配置された他ラベルとの重なりペナルティ
      placedLabels.forEach((placed) => {
        const overlap = !(x2 < placed.x1 || x1 > placed.x2 || y2 < placed.y1 || y1 > placed.y2);
        if (overlap) {
          penalty += 500;
        }
      });

      // 3. マップ境界はみ出しペナルティ
      if (x2 > plotRight + 15) penalty += 200;
      if (x1 < plotLeft - 25) penalty += 200;
      if (y1 < plotTop - 5) penalty += 300; // 上部象限名との重複防止
      if (y2 > plotBottom + 15) penalty += 150;

      if (penalty < minPenalty) {
        minPenalty = penalty;
        bestCand = cand;
      }
    });

    // 決定した配置を保存
    const finalLx = bestCand.lx;
    const finalLy = bestCand.ly;
    placedLabels.push({ x1: finalLx, x2: finalLx + tw, y1: finalLy, y2: finalLy + th });

    // ラベル背景
    const labelBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    labelBg.setAttribute('x', finalLx);
    labelBg.setAttribute('y', finalLy);
    labelBg.setAttribute('width', tw);
    labelBg.setAttribute('height', th);
    labelBg.setAttribute('rx', '4');
    labelBg.setAttribute('fill', item.isAccent ? '#ffe4e6' : '#ffffff');
    labelBg.setAttribute('stroke', item.isAccent ? '#fda4af' : '#cbd5e1');
    labelBg.setAttribute('stroke-width', '1');
    labelsG.appendChild(labelBg);

    // ラベルテキスト
    const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    txt.setAttribute('x', finalLx + tw / 2);
    txt.setAttribute('y', finalLy + 14);
    txt.setAttribute('text-anchor', 'middle');
    txt.setAttribute('font-size', '11');
    txt.setAttribute('font-weight', item.isAccent ? '700' : '600');
    txt.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
    txt.setAttribute('fill', item.isAccent ? '#9f1239' : '#1e293b');
    txt.textContent = item.name;
    labelsG.appendChild(txt);

    // ドット（丸）とアクセントリング（最前面レイヤーへ配置）
    if (item.isAccent) {
      const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      ring.setAttribute('cx', cx);
      ring.setAttribute('cy', cy);
      ring.setAttribute('r', '10');
      ring.setAttribute('fill', 'none');
      ring.setAttribute('stroke', item.color);
      ring.setAttribute('stroke-width', '1.5');
      ring.setAttribute('opacity', '0.5');
      dotsG.appendChild(ring);
    }

    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('cx', cx);
    dot.setAttribute('cy', cy);
    dot.setAttribute('r', item.isAccent ? '6' : '5');
    dot.setAttribute('fill', item.color);
    dot.setAttribute('stroke', '#ffffff');
    dot.setAttribute('stroke-width', '2');
    dotsG.appendChild(dot);
  });

  svg.appendChild(labelsG);
  svg.appendChild(dotsG);

  container.appendChild(svg);

  if (labelText) {
    const lbl = document.createElement('div');
    lbl.className = 'chem-structure-label';
    lbl.textContent = labelText;
    container.appendChild(lbl);
  }
}

// ==========================================
// ピラミッド図・階層図 パーサー & レンダラー
// ==========================================
function parsePyramid(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;
  const lines = rawText.split(/[\n;]+/).map((l) => l.trim()).filter(Boolean);

  let title = '';
  const layers = [];

  lines.forEach((line) => {
    // 1. タイトル
    const titleMatch = line.match(/^title\s*:\s*(.+)$/i);
    if (titleMatch) {
      title = titleMatch[1].trim().replace(/^["']|["']$/g, '');
      return;
    }

    // 2. 階層定義 (例: layer: ジョックス & クイーンビーズ [gold] (運動部花形スター...);)
    let rest = line.replace(/^(?:layer|level|step)\s*:\s*/i, '').trim();
    let styleTag = '';

    // 角括弧 [color/style] の抽出（位置に依存せず抽出して除去）
    const tagMatch = rest.match(/\[([^\]]+)\]/);
    if (tagMatch) {
      styleTag = tagMatch[1].toLowerCase().trim();
      rest = rest.replace(/\[([^\]]+)\]/, '').trim();
    }

    // 丸括弧 (note/description) の抽出
    let note = '';
    const noteMatch = rest.match(/\(([^)]+)\)/);
    if (noteMatch) {
      note = noteMatch[1].trim().replace(/^["']|["']$/g, '');
      rest = rest.replace(/\(([^)]+)\)/, '').trim();
    }

    const name = rest.trim().replace(/^["']|["']$/g, '');
    if (name) {
      layers.push({ name, note, styleTag });
    }
  });

  return { title, layers };
}

function drawPyramidSvg(pyramidText, container, labelText) {
  container.innerHTML = '';
  const data = parsePyramid(pyramidText);
  if (!data || data.layers.length === 0) {
    container.innerHTML = '<span style="color:#ef4444; font-size:12px;">ピラミッド図の構文を解析できませんでした（例: \\pyramid{ layer: 頂点 [gold]; layer: 底辺 [primary]; }）</span>';
    return;
  }

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const svgW = 600;
  const svgH = 460;
  svg.setAttribute('viewBox', `0 0 ${svgW} ${svgH}`);
  svg.setAttribute('width', `${svgW}`);
  svg.setAttribute('height', `${svgH}`);
  svg.style.maxWidth = '100%';
  svg.style.height = 'auto';

  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  svg.appendChild(defs);

  // ピラミッド幾何パラメータ（左寄りに配置し、右側に引き出し線＋テキストを展開）
  const pyrCenterX = 180;
  const topY = 70;
  const bottomY = 425;
  const totalH = bottomY - topY; // 355
  const baseW = 260; // 底辺の全幅（左右130ずつ: X=50〜310）
  const N = data.layers.length;
  const layerH = totalH / N;
  const gap = N > 5 ? 2.5 : 3.5;

  // デフォルトパレット
  const defaultColors = [
    '#f59e0b', // ゴールド/アンバー
    '#ea580c', // オレンジ
    '#2563eb', // ブルー
    '#0891b2', // シアン
    '#059669', // エメラルド
    '#6366f1', // インディゴ
    '#64748b'  // スレート
  ];

  // タイトル描画
  if (data.title) {
    const tEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    tEl.setAttribute('x', svgW / 2);
    tEl.setAttribute('y', 36);
    tEl.setAttribute('text-anchor', 'middle');
    tEl.setAttribute('font-size', '16');
    tEl.setAttribute('font-weight', '700');
    tEl.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
    tEl.setAttribute('fill', '#0f172a');
    tEl.textContent = data.title;
    svg.appendChild(tEl);
  }

  const layersG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const labelsG = document.createElementNS('http://www.w3.org/2000/svg', 'g');

  data.layers.forEach((layer, i) => {
    const t0 = i / N;
    const t1 = (i + 1) / N;

    const y0 = topY + t0 * totalH + (i > 0 ? gap / 2 : 0);
    const y1 = topY + t1 * totalH - (i < N - 1 ? gap / 2 : 0);
    const w0 = t0 * baseW;
    const w1 = t1 * baseW;

    // カラー判定
    let color = defaultColors[i % defaultColors.length];
    if (/gold|yellow/i.test(layer.styleTag)) color = '#f59e0b';
    else if (/accent|red|rose|danger/i.test(layer.styleTag)) color = '#e11d48';
    else if (/primary|blue/i.test(layer.styleTag)) color = '#2563eb';
    else if (/success|green|emerald/i.test(layer.styleTag)) color = '#059669';
    else if (/warning|orange/i.test(layer.styleTag)) color = '#ea580c';
    else if (/purple|violet/i.test(layer.styleTag)) color = '#8b5cf6';
    else if (/muted|gray|slate/i.test(layer.styleTag)) color = '#64748b';
    else if (/cyan|teal/i.test(layer.styleTag)) color = '#0891b2';

    // パス生成
    const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    let d = '';
    let rightEdgeX = 0;
    if (i === 0) {
      // 頂点三角形
      d = `M ${pyrCenterX} ${y0.toFixed(1)} L ${(pyrCenterX + w1 / 2).toFixed(1)} ${y1.toFixed(1)} L ${(pyrCenterX - w1 / 2).toFixed(1)} ${y1.toFixed(1)} Z`;
      rightEdgeX = pyrCenterX + w1 / 4;
    } else {
      // 台形
      d = `M ${(pyrCenterX - w0 / 2).toFixed(1)} ${y0.toFixed(1)} L ${(pyrCenterX + w0 / 2).toFixed(1)} ${y0.toFixed(1)} L ${(pyrCenterX + w1 / 2).toFixed(1)} ${y1.toFixed(1)} L ${(pyrCenterX - w1 / 2).toFixed(1)} ${y1.toFixed(1)} Z`;
      rightEdgeX = pyrCenterX + (w0 + w1) / 4;
    }
    pathEl.setAttribute('d', d);
    pathEl.setAttribute('fill', color);
    pathEl.setAttribute('stroke', '#ffffff');
    pathEl.setAttribute('stroke-width', '1.5');
    layersG.appendChild(pathEl);

    const midY = (y0 + y1) / 2;

    // ピラミッド内の階層番号バッジ（白文字）
    const badgeText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    badgeText.setAttribute('x', pyrCenterX);
    badgeText.setAttribute('y', (midY + 4.5).toFixed(1));
    badgeText.setAttribute('text-anchor', 'middle');
    badgeText.setAttribute('fill', '#ffffff');
    badgeText.setAttribute('font-weight', '800');
    badgeText.setAttribute('font-size', N > 5 ? '12' : '13');
    badgeText.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
    badgeText.textContent = (i + 1).toString();
    layersG.appendChild(badgeText);

    // 右側への引き出し線（アノテーション）
    const lineX0 = rightEdgeX + 8;
    const lineX1 = 330;
    const textStartX = 340;

    // ガイド引き出し線
    const guideLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    guideLine.setAttribute('x1', lineX0.toFixed(1));
    guideLine.setAttribute('y1', midY.toFixed(1));
    guideLine.setAttribute('x2', lineX1.toFixed(1));
    guideLine.setAttribute('y2', midY.toFixed(1));
    guideLine.setAttribute('stroke', '#cbd5e1');
    guideLine.setAttribute('stroke-width', '1.2');
    guideLine.setAttribute('stroke-dasharray', '2 2');
    labelsG.appendChild(guideLine);

    // 引き出し線端点の丸ドット
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('cx', lineX0.toFixed(1));
    dot.setAttribute('cy', midY.toFixed(1));
    dot.setAttribute('r', '2.5');
    dot.setAttribute('fill', color);
    labelsG.appendChild(dot);

    // 右側のテキストグループ
    const textG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    textG.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');

    const nameEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    nameEl.setAttribute('x', textStartX);
    nameEl.setAttribute('text-anchor', 'start');
    nameEl.setAttribute('font-weight', '700');
    nameEl.setAttribute('fill', '#0f172a');
    nameEl.setAttribute('font-size', N > 5 ? '12' : '13');

    if (layer.note && layerH >= 32) {
      nameEl.setAttribute('y', (midY - 3).toFixed(1));
      nameEl.textContent = layer.name;
      textG.appendChild(nameEl);

      const noteEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      noteEl.setAttribute('x', textStartX);
      noteEl.setAttribute('y', (midY + 13).toFixed(1));
      noteEl.setAttribute('text-anchor', 'start');
      noteEl.setAttribute('fill', '#64748b');
      noteEl.setAttribute('font-size', N > 5 ? '10.5' : '11.5');
      noteEl.setAttribute('font-weight', '500');
      noteEl.textContent = layer.note;
      textG.appendChild(noteEl);
    } else {
      nameEl.setAttribute('y', (midY + 4.5).toFixed(1));
      nameEl.textContent = layer.note ? `${layer.name} (${layer.note})` : layer.name;
      textG.appendChild(nameEl);
    }

    labelsG.appendChild(textG);
  });

  svg.appendChild(layersG);
  svg.appendChild(labelsG);
  container.appendChild(svg);

  if (labelText) {
    const lbl = document.createElement('div');
    lbl.className = 'chem-structure-label';
    lbl.textContent = labelText;
    container.appendChild(lbl);
  }
}

function autoResizeInput() {
  if (!inputArea) return;
  inputArea.style.height = 'auto';
  const nextH = Math.min(Math.max(inputArea.scrollHeight, 96), 420);
  inputArea.style.height = `${nextH}px`;
}

// ==========================================
// 入力欄の構文書式 リアルタイム判定インジケーター
// ==========================================
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

  // 1. 独自書式（PhysiNote DSL）の検出
  if (/\\(matrixmap|positioning|matrix)\{/i.test(trimmed)) {
    badgeEl.textContent = '独自書式 (2軸マップ)';
    badgeEl.className = 'syntax-badge badge-custom';
    descEl.textContent = '\\matrixmap{ title: ...; axis-x: ...; axis-y: ...; quadrant: ...; item: 名前(x, y); }';
    return;
  }
  if (/\\(pyramid|hierarchy)\{/i.test(trimmed)) {
    badgeEl.textContent = '独自書式 (ピラミッド図)';
    badgeEl.className = 'syntax-badge badge-custom';
    descEl.textContent = '\\pyramid{ title: ...; layer: 項目名 [色] (説明); }';
    return;
  }
  if (/\\(flowchart|flow)\{/i.test(trimmed)) {
    badgeEl.textContent = '独自書式 (フローチャート)';
    badgeEl.className = 'syntax-badge badge-custom';
    descEl.textContent = '\\flowchart{ ノード名 [種類]; ノードA -> ノードB; }';
    return;
  }
  if (/\\sankey\{/i.test(trimmed)) {
    badgeEl.textContent = '独自書式 (サンキー図)';
    badgeEl.className = 'syntax-badge badge-custom';
    descEl.textContent = '\\sankey{ 流量: 起点 -> 終点; }';
    return;
  }
  if (/\\(fsm|automaton)\{/i.test(trimmed)) {
    badgeEl.textContent = '独自書式 (状態遷移図)';
    badgeEl.className = 'syntax-badge badge-custom';
    descEl.textContent = '\\fsm{ 状態A -> 状態B: イベント; }';
    return;
  }
  if (/\\timing\{/i.test(trimmed)) {
    badgeEl.textContent = '独自書式 (波形チャート)';
    badgeEl.className = 'syntax-badge badge-custom';
    descEl.textContent = '\\timing{ 信号名: H.L...; }';
    return;
  }
  if (/\\circuit\{/i.test(trimmed)) {
    badgeEl.textContent = '独自書式 (電気回路図)';
    badgeEl.className = 'syntax-badge badge-custom';
    descEl.textContent = '\\circuit{ R1 [resistor]; ノードA -- ノードB; }';
    return;
  }
  if (/\\feynman\{/i.test(trimmed)) {
    badgeEl.textContent = '独自書式 (ファインマン図)';
    badgeEl.className = 'syntax-badge badge-custom';
    descEl.textContent = '\\feynman{ 粒子 [fermion]; 光子 [photon]; }';
    return;
  }
  if (/\\(chemfig|smiles)\{/i.test(trimmed)) {
    badgeEl.textContent = '化学構造式 (平面構造式)';
    badgeEl.className = 'syntax-badge badge-chem-struct';
    descEl.textContent = 'SMILES / ChemFig (例: \\smiles{...})';
    return;
  }
  if (/\\ce\{/i.test(trimmed)) {
    badgeEl.textContent = '化学式 (分子式・反応式)';
    badgeEl.className = 'syntax-badge badge-chem-formula';
    descEl.textContent = 'mhchem準拠 (例: \\ce{H2O}, \\ce{C8H10N4O2}, \\ce{2H2 + O2 -> 2H2O})';
    return;
  }

  // 2. 表形式の検出 (parseAnyTable で判定)
  if (typeof parseAnyTable === 'function' && parseAnyTable(trimmed) !== null) {
    badgeEl.textContent = '表形式 (Table)';
    badgeEl.className = 'syntax-badge badge-table';
    descEl.textContent = 'Markdown表 (| a | b |)、CSV、TSV、または LaTeX tabular環境';
    return;
  }

  // 3. デフォルトは LaTeX数式
  badgeEl.textContent = 'LaTeX数式';
  badgeEl.className = 'syntax-badge badge-latex';
  descEl.textContent = 'KaTeX準拠 (例: F = m * a, \\frac{a}{b}, \\int, 行列)';
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
  // 電子回路図 (\circuit / \draw) の検出と処理
  // ==========================================
  const circuitRegex = /(\\circuit\{((?:[^{}]|\{[^{}]*\})*)\}|\\draw\s*\([^;]+;)/g;
  const circuitMatches = [];
  let circuitMatch;
  while ((circuitMatch = circuitRegex.exec(text)) !== null) {
    const raw = circuitMatch[0];
    const content = circuitMatch[2] ? circuitMatch[2] : raw;
    circuitMatches.push({ raw, content, label: '電子回路図' });
  }

  // 入力が回路図のみの場合：直接SVG描画
  const textWithoutCircuit = text.replace(circuitRegex, '').trim();
  if (circuitMatches.length > 0 && textWithoutCircuit === '') {
    previewArea.innerHTML = '';
    circuitMatches.forEach((item) => {
      const container = document.createElement('div');
      container.className = 'circuit-preview-container';
      drawCircuitSvg(item.content, container, item.label);
      previewArea.appendChild(container);
    });

    warningBadge.style.display = 'none';
    previewBox.style.opacity = '1.0';
    previewBox.removeAttribute('data-formula-tip');
    if (explanationCard) explanationCard.style.display = 'none';
    return;
  }

  // ==========================================
  // タイミングチャート (\timing) の検出と処理
  // ==========================================
  const timingRegex = /\\timing\{((?:[^{}]|\{[^{}]*\})*)\}/g;
  const timingMatches = [];
  let timingMatch;
  while ((timingMatch = timingRegex.exec(text)) !== null) {
    timingMatches.push({ raw: timingMatch[0], content: timingMatch[1], label: 'タイミングチャート' });
  }

  // 入力が波形のみの場合：直接SVG描画
  const textWithoutTiming = text.replace(timingRegex, '').trim();
  if (timingMatches.length > 0 && textWithoutTiming === '' && circuitMatches.length === 0) {
    previewArea.innerHTML = '';
    timingMatches.forEach((item) => {
      const container = document.createElement('div');
      container.className = 'timing-preview-container';
      drawTimingSvg(item.content, container, item.label);
      previewArea.appendChild(container);
    });

    warningBadge.style.display = 'none';
    previewBox.style.opacity = '1.0';
    previewBox.removeAttribute('data-formula-tip');
    if (explanationCard) explanationCard.style.display = 'none';
    return;
  }

  // ==========================================
  // 状態遷移図 (\fsm / \automaton) の検出と処理
  // ==========================================
  const fsmRegex = /\\(fsm|automaton)\{((?:[^{}]|\{[^{}]*\})*)\}/g;
  const fsmMatches = [];
  let fsmMatch;
  while ((fsmMatch = fsmRegex.exec(text)) !== null) {
    fsmMatches.push({ raw: fsmMatch[0], content: fsmMatch[2], label: '状態遷移図' });
  }

  // 入力が状態遷移図のみの場合：直接SVG描画
  const textWithoutFsm = text.replace(fsmRegex, '').trim();
  if (fsmMatches.length > 0 && textWithoutFsm === '' && circuitMatches.length === 0 && timingMatches.length === 0) {
    previewArea.innerHTML = '';
    fsmMatches.forEach((item) => {
      const container = document.createElement('div');
      container.className = 'fsm-preview-container';
      drawFsmSvg(item.content, container, item.label);
      previewArea.appendChild(container);
    });

    warningBadge.style.display = 'none';
    previewBox.style.opacity = '1.0';
    previewBox.removeAttribute('data-formula-tip');
    if (explanationCard) explanationCard.style.display = 'none';
    return;
  }

  // ==========================================
  // ファインマン・ダイアグラム (\feynman) の検出と処理
  // ==========================================
  const feynmanRegex = /\\feynman\{((?:[^{}]|\{[^{}]*\})*)\}/g;
  const feynmanMatches = [];
  let feynmanMatch;
  while ((feynmanMatch = feynmanRegex.exec(text)) !== null) {
    feynmanMatches.push({ raw: feynmanMatch[0], content: feynmanMatch[1], label: 'ファインマン・ダイアグラム' });
  }

  // 入力がファインマン図のみの場合：直接SVG描画
  const textWithoutFeynman = text.replace(feynmanRegex, '').trim();
  if (feynmanMatches.length > 0 && textWithoutFeynman === '' && circuitMatches.length === 0 && timingMatches.length === 0 && fsmMatches.length === 0) {
    previewArea.innerHTML = '';
    feynmanMatches.forEach((item) => {
      const container = document.createElement('div');
      container.className = 'feynman-preview-container';
      drawFeynmanSvg(item.content, container, item.label);
      previewArea.appendChild(container);
    });

    warningBadge.style.display = 'none';
    previewBox.style.opacity = '1.0';
    previewBox.removeAttribute('data-formula-tip');
    if (explanationCard) explanationCard.style.display = 'none';
    return;
  }

  // ==========================================
  // サンキーダイアグラム (\sankey) の検出と処理
  // ==========================================
  const sankeyRegex = /\\sankey\{((?:[^{}]|\{[^{}]*\})*)\}/g;
  const sankeyMatches = [];
  let sankeyMatch;
  while ((sankeyMatch = sankeyRegex.exec(text)) !== null) {
    sankeyMatches.push({ raw: sankeyMatch[0], content: sankeyMatch[1], label: 'サンキーダイアグラム' });
  }

  // ==========================================
  // フローチャート (\flowchart / \flow) の検出と処理
  // ==========================================
  const flowchartRegex = /\\(flowchart|flow)\{((?:[^{}]|\{[^{}]*\})*)\}/g;
  const flowchartMatches = [];
  let flowchartMatch;
  while ((flowchartMatch = flowchartRegex.exec(text)) !== null) {
    flowchartMatches.push({ raw: flowchartMatch[0], content: flowchartMatch[2], label: 'フローチャート' });
  }

  // 入力がフローチャートのみの場合：直接SVG描画
  const textWithoutFlowchart = text.replace(flowchartRegex, '').trim();
  if (flowchartMatches.length > 0 && textWithoutFlowchart === '' && circuitMatches.length === 0 && timingMatches.length === 0 && fsmMatches.length === 0 && feynmanMatches.length === 0 && sankeyMatches.length === 0) {
    previewArea.innerHTML = '';
    flowchartMatches.forEach((item) => {
      const container = document.createElement('div');
      container.className = 'flowchart-preview-container';
      drawFlowchartSvg(item.content, container, item.label);
      previewArea.appendChild(container);
    });

    warningBadge.style.display = 'none';
    previewBox.style.opacity = '1.0';
    previewBox.removeAttribute('data-formula-tip');
    if (explanationCard) explanationCard.style.display = 'none';
    return;
  }

  // 入力がサンキー図のみの場合：直接SVG描画
  const textWithoutSankey = text.replace(sankeyRegex, '').trim();
  if (sankeyMatches.length > 0 && textWithoutSankey === '' && circuitMatches.length === 0 && timingMatches.length === 0 && fsmMatches.length === 0 && feynmanMatches.length === 0 && flowchartMatches.length === 0) {
    previewArea.innerHTML = '';
    sankeyMatches.forEach((item) => {
      const container = document.createElement('div');
      container.className = 'sankey-preview-container';
      drawSankeySvg(item.content, container, item.label);
      previewArea.appendChild(container);
    });

    warningBadge.style.display = 'none';
    previewBox.style.opacity = '1.0';
    previewBox.removeAttribute('data-formula-tip');
    if (explanationCard) explanationCard.style.display = 'none';
    return;
  }

  // ==========================================
  // 2軸マップ・マトリクス図 (\matrixmap / \positioning) の検出と処理
  // ==========================================
  const matrixRegex = /\\(matrixmap|positioning|matrix)\{((?:[^{}]|\{[^{}]*\})*)\}/g;
  const matrixMatches = [];
  let matrixMatch;
  while ((matrixMatch = matrixRegex.exec(text)) !== null) {
    matrixMatches.push({ raw: matrixMatch[0], content: matrixMatch[2], label: '2軸マップ' });
  }

  // 入力が2軸マップのみの場合：直接SVG描画
  const textWithoutMatrix = text.replace(matrixRegex, '').trim();
  if (matrixMatches.length > 0 && textWithoutMatrix === '' && circuitMatches.length === 0 && timingMatches.length === 0 && fsmMatches.length === 0 && feynmanMatches.length === 0 && sankeyMatches.length === 0 && flowchartMatches.length === 0) {
    previewArea.innerHTML = '';
    matrixMatches.forEach((item) => {
      const container = document.createElement('div');
      container.className = 'matrix-preview-container';
      drawMatrixMapSvg(item.content, container, item.label);
      previewArea.appendChild(container);
    });

    warningBadge.style.display = 'none';
    previewBox.style.opacity = '1.0';
    previewBox.removeAttribute('data-formula-tip');
    if (explanationCard) explanationCard.style.display = 'none';
    return;
  }

  // ==========================================
  // ピラミッド図・階層図 (\pyramid / \hierarchy) の検出と処理
  // ==========================================
  const pyramidRegex = /\\(pyramid|hierarchy)\{((?:[^{}]|\{[^{}]*\})*)\}/g;
  const pyramidMatches = [];
  let pyramidMatch;
  while ((pyramidMatch = pyramidRegex.exec(text)) !== null) {
    pyramidMatches.push({ raw: pyramidMatch[0], content: pyramidMatch[2], label: 'ピラミッド図' });
  }

  // 入力がピラミッド図のみの場合：直接SVG描画
  const textWithoutPyramid = text.replace(pyramidRegex, '').trim();
  if (pyramidMatches.length > 0 && textWithoutPyramid === '' && circuitMatches.length === 0 && timingMatches.length === 0 && fsmMatches.length === 0 && feynmanMatches.length === 0 && sankeyMatches.length === 0 && flowchartMatches.length === 0 && matrixMatches.length === 0) {
    previewArea.innerHTML = '';
    pyramidMatches.forEach((item) => {
      const container = document.createElement('div');
      container.className = 'pyramid-preview-container';
      drawPyramidSvg(item.content, container, item.label);
      previewArea.appendChild(container);
    });

    warningBadge.style.display = 'none';
    previewBox.style.opacity = '1.0';
    previewBox.removeAttribute('data-formula-tip');
    if (explanationCard) explanationCard.style.display = 'none';
    return;
  }

  // ==========================================
  // 表（テーブル：Markdown / CSV / TSV / LaTeX tabular）の検出と処理
  // ==========================================
  const tableData = parseAnyTable(text);
  if (tableData && circuitMatches.length === 0 && timingMatches.length === 0 && fsmMatches.length === 0 && feynmanMatches.length === 0 && sankeyMatches.length === 0 && flowchartMatches.length === 0 && matrixMatches.length === 0 && pyramidMatches.length === 0) {
    previewArea.innerHTML = '';
    const container = document.createElement('div');
    container.className = 'table-preview-container';
    renderTableElement(tableData, container, 'データ表');
    previewArea.appendChild(container);

    warningBadge.style.display = 'none';
    previewBox.style.opacity = '1.0';
    previewBox.removeAttribute('data-formula-tip');
    if (explanationCard) explanationCard.style.display = 'none';
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

// 数式ライブラリのプリセットデータ定義（全42公式）
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

// 化学式（分子式・反応式）ライブラリモーダルの制御
const chemFormulaLibraryModal = document.getElementById('chem-formula-library-modal');
const closeChemFormulaXBtn = document.getElementById('chem-formula-modal-close-x');
const closeChemFormulaFooterBtn = document.getElementById('chem-formula-modal-close-footer');
const chemFormulaSearchInput = document.getElementById('chem-formula-library-search-input');
const chemFormulaCategoryTabs = document.querySelectorAll('.chem-formula-category-tab');
const chemFormulaCardGrid = document.getElementById('chem-formula-library-card-grid');
const chemFormulaEmptyMessage = document.getElementById('chem-formula-library-empty-message');

let currentChemFormulaCategory = 'すべて';

function openChemFormulaModal() {
  if (!chemFormulaLibraryModal) return;
  chemFormulaLibraryModal.classList.add('active');
  chemFormulaLibraryModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  if (chemFormulaSearchInput) chemFormulaSearchInput.value = '';
  currentChemFormulaCategory = 'すべて';
  chemFormulaCategoryTabs.forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.category === 'すべて');
  });
  renderChemFormulaCards();
  if (chemFormulaSearchInput) chemFormulaSearchInput.focus();
}

function closeChemFormulaModal() {
  if (!chemFormulaLibraryModal) return;
  chemFormulaLibraryModal.classList.remove('active');
  chemFormulaLibraryModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

function renderChemFormulaCards() {
  if (!chemFormulaCardGrid || !chemFormulaSearchInput) return;
  const query = chemFormulaSearchInput.value.trim().toLowerCase();
  chemFormulaCardGrid.innerHTML = '';

  const filtered = chemFormulaLibrary.filter((item) => {
    const matchCategory = currentChemFormulaCategory === 'すべて' || item.category === currentChemFormulaCategory;
    const matchTags = Array.isArray(item.tags) && item.tags.some((t) => t.toLowerCase().includes(query));
    const matchQuery =
      !query ||
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.code.toLowerCase().includes(query) ||
      matchTags;
    return matchCategory && matchQuery;
  });

  if (filtered.length === 0) {
    if (chemFormulaEmptyMessage) chemFormulaEmptyMessage.style.display = 'block';
  } else {
    if (chemFormulaEmptyMessage) chemFormulaEmptyMessage.style.display = 'none';
    filtered.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'formula-card chem-formula-card';

      const top = document.createElement('div');
      top.className = 'card-top';

      const name = document.createElement('span');
      name.className = 'card-name';
      name.textContent = item.name;

      const tag = document.createElement('span');
      tag.className = 'card-tag chem-formula-card-tag';
      tag.textContent = item.category;

      top.appendChild(name);
      top.appendChild(tag);

      const preview = document.createElement('div');
      preview.className = 'card-preview';
      if (typeof katex !== 'undefined') {
        try {
          katex.render(item.code, preview, { throwOnError: false, displayMode: true });
        } catch {
          preview.textContent = item.code;
        }
      } else {
        preview.textContent = item.code;
      }

      const desc = document.createElement('p');
      desc.className = 'card-desc';
      desc.textContent = item.description;

      card.appendChild(top);
      card.appendChild(preview);
      card.appendChild(desc);

      card.addEventListener('click', () => {
        inputArea.value = item.code;
        closeChemFormulaModal();
        updatePreview();
      });

      chemFormulaCardGrid.appendChild(card);
    });
  }
}

if (closeChemFormulaXBtn) closeChemFormulaXBtn.addEventListener('click', closeChemFormulaModal);
if (closeChemFormulaFooterBtn) closeChemFormulaFooterBtn.addEventListener('click', closeChemFormulaModal);

if (chemFormulaLibraryModal) {
  chemFormulaLibraryModal.addEventListener('click', (e) => {
    if (e.target === chemFormulaLibraryModal) {
      closeChemFormulaModal();
    }
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && chemFormulaLibraryModal && chemFormulaLibraryModal.classList.contains('active')) {
    closeChemFormulaModal();
  }
});

if (chemFormulaSearchInput) {
  chemFormulaSearchInput.addEventListener('input', renderChemFormulaCards);
}

chemFormulaCategoryTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    chemFormulaCategoryTabs.forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');
    currentChemFormulaCategory = tab.dataset.category;
    renderChemFormulaCards();
  });
});

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
  },
  {
    id: 'chem-hydrochloric-acid',
    name: '塩酸（塩化水素, HCl）',
    category: '無機化合物',
    description: '塩化水素の水溶液。水中で完全に電離（強酸性）し、強い刺激臭を持つ。',
    code: '\\ce{HCl}',
    renderType: 'katex',
    tags: ['塩酸', '塩化水素', '強酸', 'ハロゲン']
  },
  {
    id: 'chem-sulfuric-acid',
    name: '硫酸（H₂SO₄）',
    category: '無機化合物',
    description: '脱水性・吸湿性・強酸性・不揮発性を兼ね備える極めて重要な二価の強酸。',
    code: '\\ce{H2SO4}',
    renderType: 'katex',
    tags: ['硫酸', '強酸', '脱水作用', '無機酸']
  },
  {
    id: 'chem-sodium-hydroxide',
    name: '水酸化ナトリウム（NaOH）',
    category: '無機化合物',
    description: '苛性ソーダとも呼ばれる強塩基。空気中の水分を吸って溶ける潮解性を持つ。',
    code: '\\ce{NaOH}',
    renderType: 'katex',
    tags: ['水酸化ナトリウム', '強塩基', '潮解性']
  },
  {
    id: 'chem-nitric-acid',
    name: '硝酸（HNO₃）',
    category: '無機化合物',
    description: '強力な酸化作用を持ち、銅や銀をも酸化溶解させる代表的な一価の強酸。',
    code: '\\ce{HNO3}',
    renderType: 'katex',
    tags: ['硝酸', '強酸', '酸化力']
  },

  // --- 化学反応式 ---
  {
    id: 'chem-neutralization',
    name: '中和反応（強酸＋強塩基）',
    category: '化学反応式',
    description: '塩酸と水酸化ナトリウムが反応して中性の塩と水を生じる基礎的反応。',
    code: '\\ce{HCl + NaOH -> NaCl + H2O}',
    renderType: 'katex',
    tags: ['中和', '酸塩基', '反応式', '塩']
  },
  {
    id: 'chem-water-ionization',
    name: '水の自己電離平衡',
    category: '化学反応式',
    description: '水分子間でプロトンが授受されオキソニウムイオンと水酸化物イオンが生じる平衡。',
    code: '\\ce{2H2O <=> H3O+ + OH-}',
    renderType: 'katex',
    tags: ['自己電離', '電離平衡', 'イオン積', 'pH']
  },
  {
    id: 'chem-esterification',
    name: '酢酸エチルのエステル化',
    category: '化学反応式',
    description: '酢酸とエタノールから酸触媒存在下で酢酸エチルと水が可逆的に生じる縮合反応。',
    code: '\\ce{CH3COOH + C2H5OH <=> CH3COOC2H5 + H2O}',
    renderType: 'katex',
    tags: ['エステル化', '可逆反応', '縮合', '有機化学']
  },
  {
    id: 'chem-habber-bosch',
    name: 'ハーバー・ボッシュ法',
    category: '化学反応式',
    description: '鉄触媒と高温高圧下で大気中の窒素と水素から直接アンモニアを合成する平衡反応。',
    code: '\\ce{N2 + 3H2 <=> 2NH3}',
    renderType: 'katex',
    tags: ['ハーバーボッシュ法', 'アンモニア合成', '平衡', 'ルシャトリエ']
  },
  {
    id: 'chem-photosynthesis',
    name: '光合成の全体反応式',
    category: '化学反応式',
    description: '植物が光エネルギーを吸収して二酸化炭素と水からグルコースと酸素を産生する代謝反応。',
    code: '\\ce{6CO2 + 6H2O -> C6H12O6 + 6O2}',
    renderType: 'katex',
    tags: ['光合成', '炭水化物', '生化学', '代謝']
  }
];

// 化学式ライブラリモーダルの制御
const chemLibraryModal = document.getElementById('chem-library-modal');
const closeChemLibraryXBtn = document.getElementById('chem-modal-close-x');
const closeChemLibraryFooterBtn = document.getElementById('chem-modal-close-footer');
const chemSearchInput = document.getElementById('chem-library-search-input');
const chemCategoryTabs = document.querySelectorAll('.chem-category-tab');
const chemCardGrid = document.getElementById('chem-library-card-grid');
const chemEmptyMessage = document.getElementById('chem-library-empty-message');

let currentChemCategory = 'すべて';

function openChemModal() {
  if (!chemLibraryModal) return;
  chemLibraryModal.classList.add('active');
  chemLibraryModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  if (chemSearchInput) chemSearchInput.value = '';
  currentChemCategory = 'すべて';
  chemCategoryTabs.forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.category === 'すべて');
  });
  renderChemCards();
  if (chemSearchInput) chemSearchInput.focus();
}

function closeChemModal() {
  if (!chemLibraryModal) return;
  chemLibraryModal.classList.remove('active');
  chemLibraryModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

function renderChemCards() {
  if (!chemCardGrid || !chemSearchInput) return;
  const query = chemSearchInput.value.trim().toLowerCase();
  chemCardGrid.innerHTML = '';

  const filtered = chemLibrary.filter((item) => {
    const matchCategory = currentChemCategory === 'すべて' || item.category === currentChemCategory;
    const matchTags = Array.isArray(item.tags) && item.tags.some((t) => t.toLowerCase().includes(query));
    const matchQuery =
      !query ||
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.code.toLowerCase().includes(query) ||
      matchTags;
    return matchCategory && matchQuery;
  });

  if (filtered.length === 0) {
    if (chemEmptyMessage) chemEmptyMessage.style.display = 'block';
  } else {
    if (chemEmptyMessage) chemEmptyMessage.style.display = 'none';
    filtered.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'formula-card chem-card';

      const top = document.createElement('div');
      top.className = 'card-top';

      const name = document.createElement('span');
      name.className = 'card-name';
      name.textContent = item.name;

      const tag = document.createElement('span');
      tag.className = 'card-tag chem-card-tag';
      tag.textContent = item.category;

      top.appendChild(name);
      top.appendChild(tag);

      const preview = document.createElement('div');
      preview.className = 'card-preview chem-card-preview';

      if (item.renderType === 'smiles' && item.smiles) {
        drawSmilesToElement(item.smiles, preview, item.name);
      } else {
        if (typeof katex !== 'undefined') {
          try {
            katex.render(item.code, preview, {
              throwOnError: false,
              displayMode: true
            });
          } catch {
            preview.textContent = item.code;
          }
        } else {
          preview.textContent = item.code;
        }
      }

      const desc = document.createElement('p');
      desc.className = 'card-desc';
      desc.textContent = item.description;

      card.appendChild(top);
      card.appendChild(preview);
      card.appendChild(desc);

      card.addEventListener('click', () => {
        inputArea.value = item.code;
        closeChemModal();
        updatePreview();
      });

      chemCardGrid.appendChild(card);
    });
  }
}

if (closeChemLibraryXBtn) closeChemLibraryXBtn.addEventListener('click', closeChemModal);
if (closeChemLibraryFooterBtn) closeChemLibraryFooterBtn.addEventListener('click', closeChemModal);

if (chemLibraryModal) {
  chemLibraryModal.addEventListener('click', (e) => {
    if (e.target === chemLibraryModal) {
      closeChemModal();
    }
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && chemLibraryModal && chemLibraryModal.classList.contains('active')) {
    closeChemModal();
  }
});

if (chemSearchInput) {
  chemSearchInput.addEventListener('input', renderChemCards);
}

chemCategoryTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    chemCategoryTabs.forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');
    currentChemCategory = tab.dataset.category;
    renderChemCards();
  });
});

// ==========================================
// 電子回路ライブラリ データ
// ==========================================
const circuitLibrary = [
  // --- 基本回路・受動回路 ---
  {
    id: 'circ-rc-series',
    name: 'RC直列回路（過渡現象・充放電）',
    category: '基本回路・受動回路',
    description: '抵抗とコンデンサが直列接続された基本回路。時定数 τ = RC で電荷の蓄積・放電が行われる。',
    code: '\\circuit{\\draw (0,0) to[battery=$E$] (0,2) to[R=$R$] (3,2) to[C=$C$] (3,0) -- (0,0);}',
    tags: ['RC回路', '過渡現象', '時定数', 'コンデンサ', '充放電']
  },
  {
    id: 'circ-voltage-divider',
    name: '分圧回路（抵抗分圧）',
    category: '基本回路・受動回路',
    description: '2つの抵抗値の比により入力電圧を出力電圧に減衰させる基本受動回路。',
    code: '\\circuit{\\draw (0,0) to[battery=$V_{in}$] (0,3) to[R=$R_1$] (2,3) to[R=$R_2$] (2,0) -- (0,0); \\draw (2,1.5) -- (3.5,1.5);}',
    tags: ['分圧回路', '抵抗', 'オームの法則', '基準電圧']
  },
  {
    id: 'circ-rl-series',
    name: 'RL直列回路（インダクタ過渡現象）',
    category: '基本回路・受動回路',
    description: '抵抗とインダクタが直列接続された回路。時定数 τ = L/R に従って自己誘導起電力が立ち上がる。',
    code: '\\circuit{\\draw (0,0) to[battery=$E$] (0,2) to[R=$R$] (3,2) to[L=$L$] (3,0) -- (0,0);}',
    tags: ['RL回路', 'コイル', 'インダクタンス', '過渡現象']
  },

  // --- 交流・共振回路 ---
  {
    id: 'circ-rlc-series',
    name: 'RLC直列共振回路',
    category: '交流・共振回路',
    description: '共振角周波数 ω₀ = 1/√(LC) で回路のインピーダンスが最小（純抵抗）となる交流基本回路。',
    code: '\\circuit{\\draw (0,0) to[sV=$v(t)$] (0,2) to[R=$R$] (2,2) to[L=$L$] (4,2) to[C=$C$] (4,0) -- (0,0);}',
    tags: ['RLC', '共振', '交流回路', 'インピーダンス', 'Q値']
  },
  {
    id: 'circ-lc-parallel',
    name: 'LC並列共振回路（タンク回路）',
    category: '交流・共振回路',
    description: 'コイルとコンデンサが並列接続され、特定の共振周波数で電磁エネルギーが相互変換される発振・選択回路。',
    code: '\\circuit{\\draw (0,0) to[sV=$v$] (0,2) -- (2,2); \\draw (2,2) to[L=$L$] (2,0); \\draw (2,2) -- (4,2) to[C=$C$] (4,0) -- (0,0);}',
    tags: ['LC回路', 'タンク回路', '並列共振', '発振回路']
  },

  // --- 半導体・能動素子 ---
  {
    id: 'circ-half-wave-rectifier',
    name: 'ダイオード半波整流回路',
    category: '半導体・能動素子',
    description: 'ダイオードの一方向導通性を利用し、交流電圧の正の半サイクルのみを負荷抵抗に取り出す整流回路。',
    code: '\\circuit{\\draw (0,0) to[sV=$v_{in}$] (0,2) to[D=$D$] (3,2) to[R=$R_L$] (3,0) -- (0,0);}',
    tags: ['ダイオード', '整流回路', 'AC-DC', '半導体']
  },
  {
    id: 'circ-rc-lpf',
    name: 'RCローパスフィルタ（LPF）',
    category: '半導体・能動素子',
    description: 'カットオフ周波数 fc = 1/(2πRC) より低い周波数を通過させ、高周波ノイズを減衰させるフィルタ回路。',
    code: '\\circuit{\\draw (0,0) to[sV=$V_{in}$] (0,2) to[R=$R$] (2.5,2) to[C=$C$] (2.5,0) -- (0,0); \\draw (2.5,2) -- (4,2);}',
    tags: ['フィルタ', 'LPF', '周波数応答', 'カットオフ周波数']
  }
];

// 電子回路ライブラリモーダルの制御
const circuitLibraryModal = document.getElementById('circuit-library-modal');
const closeCircuitLibraryXBtn = document.getElementById('circuit-modal-close-x');
const closeCircuitLibraryFooterBtn = document.getElementById('circuit-modal-close-footer');
const circuitSearchInput = document.getElementById('circuit-library-search-input');
const circuitCategoryTabs = document.querySelectorAll('.circuit-category-tab');
const circuitCardGrid = document.getElementById('circuit-library-card-grid');
const circuitEmptyMessage = document.getElementById('circuit-library-empty-message');

let currentCircuitCategory = 'すべて';

function openCircuitModal() {
  if (!circuitLibraryModal) return;
  circuitLibraryModal.classList.add('active');
  circuitLibraryModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  if (circuitSearchInput) circuitSearchInput.value = '';
  currentCircuitCategory = 'すべて';
  circuitCategoryTabs.forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.category === 'すべて');
  });
  renderCircuitCards();
  if (circuitSearchInput) circuitSearchInput.focus();
}

function closeCircuitModal() {
  if (!circuitLibraryModal) return;
  circuitLibraryModal.classList.remove('active');
  circuitLibraryModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

function renderCircuitCards() {
  if (!circuitCardGrid || !circuitSearchInput) return;
  const query = circuitSearchInput.value.trim().toLowerCase();
  circuitCardGrid.innerHTML = '';

  const filtered = circuitLibrary.filter((item) => {
    const matchCategory = currentCircuitCategory === 'すべて' || item.category === currentCircuitCategory;
    const matchTags = Array.isArray(item.tags) && item.tags.some((t) => t.toLowerCase().includes(query));
    const matchQuery =
      !query ||
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.code.toLowerCase().includes(query) ||
      matchTags;
    return matchCategory && matchQuery;
  });

  if (filtered.length === 0) {
    if (circuitEmptyMessage) circuitEmptyMessage.style.display = 'block';
  } else {
    if (circuitEmptyMessage) circuitEmptyMessage.style.display = 'none';
    filtered.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'formula-card circuit-card';

      const top = document.createElement('div');
      top.className = 'card-top';

      const name = document.createElement('span');
      name.className = 'card-name';
      name.textContent = item.name;

      const tag = document.createElement('span');
      tag.className = 'card-tag circuit-card-tag';
      tag.textContent = item.category;

      top.appendChild(name);
      top.appendChild(tag);

      const preview = document.createElement('div');
      preview.className = 'card-preview circuit-card-preview';
      drawCircuitSvg(item.code, preview, null);

      const desc = document.createElement('p');
      desc.className = 'card-desc';
      desc.textContent = item.description;

      card.appendChild(top);
      card.appendChild(preview);
      card.appendChild(desc);

      card.addEventListener('click', () => {
        inputArea.value = item.code;
        closeCircuitModal();
        updatePreview();
      });

      circuitCardGrid.appendChild(card);
    });
  }
}

if (closeCircuitLibraryXBtn) closeCircuitLibraryXBtn.addEventListener('click', closeCircuitModal);
if (closeCircuitLibraryFooterBtn) closeCircuitLibraryFooterBtn.addEventListener('click', closeCircuitModal);

if (circuitLibraryModal) {
  circuitLibraryModal.addEventListener('click', (e) => {
    if (e.target === circuitLibraryModal) {
      closeCircuitModal();
    }
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && circuitLibraryModal && circuitLibraryModal.classList.contains('active')) {
    closeCircuitModal();
  }
});

if (circuitSearchInput) {
  circuitSearchInput.addEventListener('input', renderCircuitCards);
}

circuitCategoryTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    circuitCategoryTabs.forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');
    currentCircuitCategory = tab.dataset.category;
    renderCircuitCards();
  });
});

// ==========================================
// タイミングチャート（波形）ライブラリ データ
// ==========================================
const timingLibrary = [
  // --- 基本ロジック・同期回路 ---
  {
    id: 'timing-dff',
    name: 'Dフリップフロップ（クロック同期動作）',
    category: '基本ロジック・同期回路',
    description: 'クロックの立ち上がりエッジで入力Dの値をラッチし、出力Qへと伝搬させる同期基本回路。',
    code: '\\timing{\n  CLK: P P P P P P;\n  D:   0 1 1 0 1 0;\n  Q:   0 0 1 1 0 1;\n}',
    tags: ['D-FF', 'フリップフロップ', 'クロック同期', 'ラッチ', 'セットアップ時間']
  },
  {
    id: 'timing-clock-div2',
    name: '2分周クロック回路（周波数1/2）',
    category: '基本ロジック・同期回路',
    description: '入力クロックの立ち上がりごとに状態が反転し、周期が2倍（周波数が半分）になる分周動作。',
    code: '\\timing{\n  CLK_IN:  P P P P P P P P;\n  CLK_OUT: 0 0 1 1 0 0 1 1;\n}',
    tags: ['分周', 'クロック', 'カウンタ', 'トグル']
  },

  // --- シリアル通信 ---
  {
    id: 'timing-spi',
    name: 'SPI通信（Mode 0: 4線式シリアルバス）',
    category: 'シリアル通信',
    description: 'CS#がアクティブ（LOW）の期間に、SCKの立ち上がりでMOSI/MISOのデータビットをサンプリング。',
    code: '\\timing{\n  CS#:  1 0 0 0 0 0 1;\n  SCK:  0 P P P P 0 0;\n  MOSI: =IDLE =B3 =B2 =B1 =B0 =IDLE;\n  MISO: Z =D3 =D2 =D1 =D0 Z;\n}',
    tags: ['SPI', 'シリアル通信', 'MOSI', 'MISO', 'SCK', 'CS']
  },
  {
    id: 'timing-i2c',
    name: 'I2C通信（スタート条件＆バイト転送）',
    category: 'シリアル通信',
    description: 'SCLがHIGHの間にSDAが立ち下がるスタート条件、クロック同期データ転送、ACKの返答。',
    code: '\\timing{\n  SCL: 1 P P P P 1;\n  SDA: 1 =START =D7 =D6 =ACK 1;\n}',
    tags: ['I2C', 'SCL', 'SDA', 'スタート条件', 'ACK', '2線式']
  },
  {
    id: 'timing-uart',
    name: 'UART調歩同期通信（1フレーム転送）',
    category: 'シリアル通信',
    description: 'アイドル（HIGH）からスタートビット（LOW）、8ビットデータ、ストップビット（HIGH）へと続く非同期シリアル。',
    code: '\\timing{\n  TXD: 1 =START =D0 =D1 =D2 =STOP 1;\n}',
    tags: ['UART', 'シリアル通信', '調歩同期', 'ボーレート', 'スタートビット']
  },

  // --- バス制御・メモリ ---
  {
    id: 'timing-sram-read',
    name: 'SRAMリードサイクル（非同期メモリ読み出し）',
    category: 'バス制御・メモリ',
    description: 'アドレス確定後、チップセレクトCE#と出力イネーブルOE#をアサートしてデータバスからデータを読み出す。',
    code: '\\timing{\n  ADDR: =A0 =ADDR =ADDR =A1;\n  CE#:  1 0 0 1;\n  OE#:  1 0 0 1;\n  DATA: Z =VALID =VALID Z;\n}',
    tags: ['メモリ', 'SRAM', 'リードサイクル', 'アドレスバス', 'データバス']
  }
];

// タイミングチャートライブラリモーダルの制御
const timingLibraryModal = document.getElementById('timing-library-modal');
const closeTimingLibraryXBtn = document.getElementById('timing-modal-close-x');
const closeTimingLibraryFooterBtn = document.getElementById('timing-modal-close-footer');
const timingSearchInput = document.getElementById('timing-library-search-input');
const timingCategoryTabs = document.querySelectorAll('.timing-category-tab');
const timingCardGrid = document.getElementById('timing-library-card-grid');
const timingEmptyMessage = document.getElementById('timing-library-empty-message');

let currentTimingCategory = 'すべて';

function openTimingModal() {
  if (!timingLibraryModal) return;
  timingLibraryModal.classList.add('active');
  timingLibraryModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  if (timingSearchInput) timingSearchInput.value = '';
  currentTimingCategory = 'すべて';
  timingCategoryTabs.forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.category === 'すべて');
  });
  renderTimingCards();
  if (timingSearchInput) timingSearchInput.focus();
}

function closeTimingModal() {
  if (!timingLibraryModal) return;
  timingLibraryModal.classList.remove('active');
  timingLibraryModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

function renderTimingCards() {
  if (!timingCardGrid || !timingSearchInput) return;
  const query = timingSearchInput.value.trim().toLowerCase();
  timingCardGrid.innerHTML = '';

  const filtered = timingLibrary.filter((item) => {
    const matchCategory = currentTimingCategory === 'すべて' || item.category === currentTimingCategory;
    const matchTags = Array.isArray(item.tags) && item.tags.some((t) => t.toLowerCase().includes(query));
    const matchQuery =
      !query ||
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.code.toLowerCase().includes(query) ||
      matchTags;
    return matchCategory && matchQuery;
  });

  if (filtered.length === 0) {
    if (timingEmptyMessage) timingEmptyMessage.style.display = 'block';
  } else {
    if (timingEmptyMessage) timingEmptyMessage.style.display = 'none';
    filtered.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'formula-card timing-card';

      const top = document.createElement('div');
      top.className = 'card-top';

      const name = document.createElement('span');
      name.className = 'card-name';
      name.textContent = item.name;

      const tag = document.createElement('span');
      tag.className = 'card-tag timing-card-tag';
      tag.textContent = item.category;

      top.appendChild(name);
      top.appendChild(tag);

      const preview = document.createElement('div');
      preview.className = 'card-preview timing-card-preview';
      drawTimingSvg(item.code, preview, null);

      const desc = document.createElement('p');
      desc.className = 'card-desc';
      desc.textContent = item.description;

      card.appendChild(top);
      card.appendChild(preview);
      card.appendChild(desc);

      card.addEventListener('click', () => {
        inputArea.value = item.code;
        closeTimingModal();
        updatePreview();
      });

      timingCardGrid.appendChild(card);
    });
  }
}

if (closeTimingLibraryXBtn) closeTimingLibraryXBtn.addEventListener('click', closeTimingModal);
if (closeTimingLibraryFooterBtn) closeTimingLibraryFooterBtn.addEventListener('click', closeTimingModal);

if (timingLibraryModal) {
  timingLibraryModal.addEventListener('click', (e) => {
    if (e.target === timingLibraryModal) {
      closeTimingModal();
    }
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && timingLibraryModal && timingLibraryModal.classList.contains('active')) {
    closeTimingModal();
  }
});

if (timingSearchInput) {
  timingSearchInput.addEventListener('input', renderTimingCards);
}

timingCategoryTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    timingCategoryTabs.forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');
    currentTimingCategory = tab.dataset.category;
    renderTimingCards();
  });
});

// ==========================================
// 状態遷移図（オートマトン）ライブラリデータ定義
// ==========================================
const fsmLibrary = [
  // --- 有限オートマトン (DFA/NFA) ---
  {
    id: 'fsm-even-parity',
    name: '偶数パリティ判定オートマトン（DFA）',
    category: '有限オートマトン(DFA/NFA)',
    description: '入力ビット列に含まれる「1」の個数が偶数個であるか判定。Evenが初期状態かつ受理状態。',
    code: '\\fsm{\n  state: Even (0, 0) start, accept;\n  state: Odd  (140, 0);\n  Even -> Odd: "1" [bend];\n  Odd  -> Even: "1" [bend];\n  Even -> Even: "0";\n  Odd  -> Odd:  "0";\n}',
    tags: ['DFA', 'オートマトン', 'パリティ', '偶数', '奇数', '2進数']
  },
  {
    id: 'fsm-pattern-01',
    name: 'パターン「01」検出オートマトン',
    category: '有限オートマトン(DFA/NFA)',
    description: '入力文字列の中から部分列 "01" が現れたことを検出して受理状態 q2 に遷移する決定性オートマトン。',
    code: '\\fsm{\n  state: q0 (0, 0) start;\n  state: q1 (120, 0);\n  state: q2 (240, 0) accept;\n  q0 -> q1: "0";\n  q0 -> q0: "1";\n  q1 -> q2: "1";\n  q1 -> q1: "0";\n  q2 -> q2: "0, 1";\n}',
    tags: ['パターン検出', 'DFA', '文字列検索', '受理状態', '01']
  },

  // --- 論理回路・順序回路 ---
  {
    id: 'fsm-t-ff',
    name: 'Tフリップフロップ状態遷移図',
    category: '論理回路・順序回路',
    description: '入力T=1のクロックパルスで出力Qが0と1の間をトグル（反転）し、T=0で状態を保持する順序回路。',
    code: '\\fsm{\n  state: Q0 (0, 0) start;\n  state: Q1 (140, 0);\n  Q0 -> Q1: "T=1" [bend];\n  Q1 -> Q0: "T=1" [bend];\n  Q0 -> Q0: "T=0";\n  Q1 -> Q1: "T=0";\n}',
    tags: ['T-FF', 'フリップフロップ', 'トグル', '順序回路', '状態遷移']
  },
  {
    id: 'fsm-modulo3-counter',
    name: '3進カウンタ（Modulo-3 Counter）',
    category: '論理回路・順序回路',
    description: 'クロック入力ごとに S0 → S1 → S2 → S0 と循環し、3回に1回キャリー（受理）を出力する順序回路。',
    code: '\\fsm{\n  state: S0 (0, 50) start;\n  state: S1 (120, -20);\n  state: S2 (240, 50) accept;\n  S0 -> S1: "CLK";\n  S1 -> S2: "CLK";\n  S2 -> S0: "CLK" [bend];\n}',
    tags: ['カウンタ', '3進', 'クロック', '同期回路', '状態マシン']
  },

  // --- システム・制御モデル ---
  {
    id: 'fsm-vending-machine',
    name: '簡易自動販売機（50円/100円投入モデル）',
    category: 'システム・制御モデル',
    description: '50円硬貨と100円硬貨の投入により残高が遷移し、100円以上で商品排出状態（Buy）に到達するモデル。',
    code: '\\fsm{\n  state: 0円   (0, 0) start;\n  state: 50円  (120, 0);\n  state: 100円 (240, 0) accept;\n  0円   -> 50円:  "+50";\n  0円   -> 100円: "+100" [bend];\n  50円  -> 100円: "+50";\n  100円 -> 0円:   "購入/返却" [bend];\n}',
    tags: ['自動販売機', '状態機械', '制御', '組み込み', 'イベント駆動']
  },
  {
    id: 'fsm-traffic-light',
    name: '交通信号機コントローラ（青・黄・赤遷移）',
    category: 'システム・制御モデル',
    description: 'タイマー割り込みにより、青（Green）→ 黄（Yellow）→ 赤（Red）→ 青へと順次循環する状態遷移。',
    code: '\\fsm{\n  state: 青 (0, 0) start;\n  state: 黄 (120, -30);\n  state: 赤 (240, 0);\n  青 -> 黄: "タイマー";\n  黄 -> 赤: "タイマー";\n  赤 -> 青: "タイマー" [bend];\n}',
    tags: ['信号機', '制御システム', 'タイマー', '組込みシステム']
  }
];

// 状態遷移図（オートマトン）ライブラリモーダルの制御
const fsmLibraryModal = document.getElementById('fsm-library-modal');
const closeFsmLibraryXBtn = document.getElementById('fsm-modal-close-x');
const closeFsmLibraryFooterBtn = document.getElementById('fsm-modal-close-footer');
const fsmSearchInput = document.getElementById('fsm-library-search-input');
const fsmCategoryTabs = document.querySelectorAll('.fsm-category-tab');
const fsmCardGrid = document.getElementById('fsm-library-card-grid');
const fsmEmptyMessage = document.getElementById('fsm-library-empty-message');

let currentFsmCategory = 'すべて';

function openFsmModal() {
  if (!fsmLibraryModal) return;
  fsmLibraryModal.classList.add('active');
  fsmLibraryModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  if (fsmSearchInput) fsmSearchInput.value = '';
  currentFsmCategory = 'すべて';
  fsmCategoryTabs.forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.category === 'すべて');
  });
  renderFsmCards();
  if (fsmSearchInput) fsmSearchInput.focus();
}

function closeFsmModal() {
  if (!fsmLibraryModal) return;
  fsmLibraryModal.classList.remove('active');
  fsmLibraryModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

function renderFsmCards() {
  if (!fsmCardGrid || !fsmSearchInput) return;
  const query = fsmSearchInput.value.trim().toLowerCase();
  fsmCardGrid.innerHTML = '';

  const filtered = fsmLibrary.filter((item) => {
    const matchCategory = currentFsmCategory === 'すべて' || item.category === currentFsmCategory;
    const matchTags = Array.isArray(item.tags) && item.tags.some((t) => t.toLowerCase().includes(query));
    const matchQuery =
      !query ||
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.code.toLowerCase().includes(query) ||
      matchTags;
    return matchCategory && matchQuery;
  });

  if (filtered.length === 0) {
    if (fsmEmptyMessage) fsmEmptyMessage.style.display = 'block';
  } else {
    if (fsmEmptyMessage) fsmEmptyMessage.style.display = 'none';
    filtered.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'formula-card fsm-card';

      const top = document.createElement('div');
      top.className = 'card-top';

      const name = document.createElement('span');
      name.className = 'card-name';
      name.textContent = item.name;

      const tag = document.createElement('span');
      tag.className = 'card-tag fsm-card-tag';
      tag.textContent = item.category;

      top.appendChild(name);
      top.appendChild(tag);

      const preview = document.createElement('div');
      preview.className = 'card-preview fsm-card-preview';
      drawFsmSvg(item.code, preview, null);

      const desc = document.createElement('p');
      desc.className = 'card-desc';
      desc.textContent = item.description;

      card.appendChild(top);
      card.appendChild(preview);
      card.appendChild(desc);

      card.addEventListener('click', () => {
        inputArea.value = item.code;
        closeFsmModal();
        updatePreview();
      });

      fsmCardGrid.appendChild(card);
    });
  }
}

if (closeFsmLibraryXBtn) closeFsmLibraryXBtn.addEventListener('click', closeFsmModal);
if (closeFsmLibraryFooterBtn) closeFsmLibraryFooterBtn.addEventListener('click', closeFsmModal);

if (fsmLibraryModal) {
  fsmLibraryModal.addEventListener('click', (e) => {
    if (e.target === fsmLibraryModal) {
      closeFsmModal();
    }
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && fsmLibraryModal && fsmLibraryModal.classList.contains('active')) {
    closeFsmModal();
  }
});

if (fsmSearchInput) {
  fsmSearchInput.addEventListener('input', renderFsmCards);
}

fsmCategoryTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    fsmCategoryTabs.forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');
    currentFsmCategory = tab.dataset.category;
    renderFsmCards();
  });
});

// ==========================================
// ファインマン・ダイアグラム ライブラリデータ定義
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

// ファインマン・ダイアグラム ライブラリモーダルの制御
const feynmanLibraryModal = document.getElementById('feynman-library-modal');
const closeFeynmanLibraryXBtn = document.getElementById('feynman-modal-close-x');
const closeFeynmanLibraryFooterBtn = document.getElementById('feynman-modal-close-footer');
const feynmanSearchInput = document.getElementById('feynman-library-search-input');
const feynmanCategoryTabs = document.querySelectorAll('.feynman-category-tab');
const feynmanCardGrid = document.getElementById('feynman-library-card-grid');
const feynmanEmptyMessage = document.getElementById('feynman-library-empty-message');

let currentFeynmanCategory = 'すべて';

function openFeynmanModal() {
  if (!feynmanLibraryModal) return;
  feynmanLibraryModal.classList.add('active');
  feynmanLibraryModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  if (feynmanSearchInput) feynmanSearchInput.value = '';
  currentFeynmanCategory = 'すべて';
  feynmanCategoryTabs.forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.category === 'すべて');
  });
  renderFeynmanCards();
  if (feynmanSearchInput) feynmanSearchInput.focus();
}

function closeFeynmanModal() {
  if (!feynmanLibraryModal) return;
  feynmanLibraryModal.classList.remove('active');
  feynmanLibraryModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

function renderFeynmanCards() {
  if (!feynmanCardGrid || !feynmanSearchInput) return;
  const query = feynmanSearchInput.value.trim().toLowerCase();
  feynmanCardGrid.innerHTML = '';

  const filtered = feynmanLibrary.filter((item) => {
    const matchCategory = currentFeynmanCategory === 'すべて' || item.category === currentFeynmanCategory;
    const matchTags = Array.isArray(item.tags) && item.tags.some((t) => t.toLowerCase().includes(query));
    const matchQuery =
      !query ||
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.code.toLowerCase().includes(query) ||
      matchTags;
    return matchCategory && matchQuery;
  });

  if (filtered.length === 0) {
    if (feynmanEmptyMessage) feynmanEmptyMessage.style.display = 'block';
  } else {
    if (feynmanEmptyMessage) feynmanEmptyMessage.style.display = 'none';
    filtered.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'formula-card feynman-card';

      const top = document.createElement('div');
      top.className = 'card-top';

      const name = document.createElement('span');
      name.className = 'card-name';
      name.textContent = item.name;

      const tag = document.createElement('span');
      tag.className = 'card-tag feynman-card-tag';
      tag.textContent = item.category;

      top.appendChild(name);
      top.appendChild(tag);

      const preview = document.createElement('div');
      preview.className = 'card-preview feynman-card-preview';
      drawFeynmanSvg(item.code, preview, null);

      const desc = document.createElement('p');
      desc.className = 'card-desc';
      desc.textContent = item.description;

      card.appendChild(top);
      card.appendChild(preview);
      card.appendChild(desc);

      card.addEventListener('click', () => {
        inputArea.value = item.code;
        closeFeynmanModal();
        updatePreview();
      });

      feynmanCardGrid.appendChild(card);
    });
  }
}

if (closeFeynmanLibraryXBtn) closeFeynmanLibraryXBtn.addEventListener('click', closeFeynmanModal);
if (closeFeynmanLibraryFooterBtn) closeFeynmanLibraryFooterBtn.addEventListener('click', closeFeynmanModal);

if (feynmanLibraryModal) {
  feynmanLibraryModal.addEventListener('click', (e) => {
    if (e.target === feynmanLibraryModal) {
      closeFeynmanModal();
    }
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && feynmanLibraryModal && feynmanLibraryModal.classList.contains('active')) {
    closeFeynmanModal();
  }
});

if (feynmanSearchInput) {
  feynmanSearchInput.addEventListener('input', renderFeynmanCards);
}

feynmanCategoryTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    feynmanCategoryTabs.forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');
    currentFeynmanCategory = tab.dataset.category;
    renderFeynmanCards();
  });
});

// ==========================================
// サンキーダイアグラム プリセットライブラリ
// ==========================================
const sankeyLibrary = [
  // --- 熱機関・エネルギー収支 ---
  {
    id: 'sankey-carnot-heat-engine',
    name: '熱機関（カルノーサイクル）の熱収支',
    category: '熱機関・エネルギー収支',
    description: '高温熱源から吸熱したエネルギーが、有効な外部仕事と低温熱源への排熱に分配される基本収支。',
    code: '\\sankey{\n  高温熱源Q_H [100] -> 有効仕事W [40];\n  高温熱源Q_H -> 低温排熱Q_L [60];\n}',
    tags: ['熱力学', 'カルノーサイクル', '熱効率', '排熱', '仕事']
  },
  {
    id: 'sankey-thermal-power-plant',
    name: '火力発電所のエネルギー損失フロー',
    category: '熱機関・エネルギー収支',
    description: '燃料燃焼熱からボイラー・蒸気タービンを経て発電に至る多段損失フロー。',
    code: '\\sankey{\n  燃料化学エネルギー [100] -> ボイラー熱量 [88];\n  燃料化学エネルギー -> 排煙・不完全燃焼損失 [12];\n  ボイラー熱量 -> 蒸気タービン仕事 [42];\n  ボイラー熱量 -> 配管放熱・内部損失 [46];\n  蒸気タービン仕事 -> 発電電力出力 [38];\n  蒸気タービン仕事 -> 発電機機械摩擦 [4];\n}',
    tags: ['火力発電', 'ボイラー', 'タービン', '発電', '熱損失']
  },
  {
    id: 'sankey-internal-combustion-engine',
    name: '自動車ガソリンエンジンの熱効率配分',
    category: '熱機関・エネルギー収支',
    description: '燃料ガソリンの熱エネルギーが駆動出力、冷却水排熱、排気ガス熱、機械摩擦に分配される実測モデル。',
    code: '\\sankey{\n  燃料燃焼熱 [100] -> 車両駆動軸出力 [28];\n  燃料燃焼熱 -> 冷却水損失 [30];\n  燃料燃焼熱 -> 排気ガス熱損失 [34];\n  燃料燃焼熱 -> 機械摩擦損失 [8];\n}',
    tags: ['自動車', '内燃機関', 'ガソリン', '冷却水', '駆動仕事']
  },
  {
    id: 'sankey-heat-pump',
    name: 'ヒートポンプ（暖房サイクル）の成績係数(COP)',
    category: '熱機関・エネルギー収支',
    description: '消費電力と外気吸熱量を合算し、暖房供給熱量（COP = 4.0）として室内に放出する熱移動バランス。',
    code: '\\sankey{\n  消費電力 [25] -> 室内暖房熱量 [100];\n  大気・地中吸熱 [75] -> 室内暖房熱量 [100];\n}',
    tags: ['ヒートポンプ', '冷凍サイクル', 'COP', '暖房', '省エネ']
  },

  // --- 電力・発電システム ---
  {
    id: 'sankey-solar-photovoltaic',
    name: '太陽光発電（メガソーラー）の変換損失',
    category: '電力・発電システム',
    description: '受光日射エネルギーから太陽電池セル変換、パワーコンディショナー(PCS)変換を経て売電されるフロー。',
    code: '\\sankey{\n  入射日射エネルギー [100] -> PVセルDC電力 [20];\n  入射日射エネルギー -> 反射・未吸収熱損失 [80];\n  PVセルDC電力 -> インバータAC系統出力 [18];\n  PVセルDC電力 -> パワコン変換損失 [2];\n}',
    tags: ['太陽光発電', '再生可能エネルギー', 'インバータ', '光電効果']
  },
  {
    id: 'sankey-nuclear-power-plant',
    name: '軽水炉（原子力発電所）の熱・電力バランス',
    category: '電力・発電システム',
    description: '核分裂熱出力から蒸気発生器・タービンを経て発電し、復水器により海水へ冷却放熱される収支。',
    code: '\\sankey{\n  原子炉熱出力 [100] -> タービン主蒸気 [99];\n  原子炉熱出力 -> 格納容器放熱 [1];\n  タービン主蒸気 -> 送電端電気出力 [33];\n  タービン主蒸気 -> 復水器海水排熱 [66];\n}',
    tags: ['原子力発電', '軽水炉', '核分裂', '復水器', '熱効率']
  },
  {
    id: 'sankey-grid-transmission-loss',
    name: '送配電系統（グリッド）の送電ジュール熱損失',
    category: '電力・発電システム',
    description: '発電所総出力から超高圧送電線、配電用変圧器を経て需要家へ届くまでの系統損失。',
    code: '\\sankey{\n  総発電量 [100] -> 超高圧送電 [97];\n  総発電量 -> 送電線ジュール熱損失 [3];\n  超高圧送電 -> 最終需要家受電 [94];\n  超高圧送電 -> 配電用変圧器損失 [3];\n}',
    tags: ['送電線', '配電網', '変電所', 'ジュール熱', '電力グリッド']
  },

  // --- 化学・プロセス工学 ---
  {
    id: 'sankey-haber-bosch',
    name: 'ハーバー・ボッシュ法（アンモニア合成）の物質収支',
    category: '化学・プロセス工学',
    description: '窒素・水素の供給ガスから高圧反応器、凝縮分離を経て生成アンモニアと循環ガスに分かれる物質収支。',
    code: '\\sankey{\n  原料ガスN2+3H2 [100] -> 反応器通過ガス [100];\n  反応器通過ガス -> 生成液体NH3 [25];\n  反応器通過ガス -> 未反応循環ガス [72];\n  反応器通過ガス -> パージオフガス [3];\n}',
    tags: ['ハーバー・ボッシュ法', 'アンモニア', '化学平衡', '物質収支', 'プロセス工学']
  },
  {
    id: 'sankey-water-electrolysis',
    name: '水電解（水素製造PEM型）のエネルギー効率',
    category: '化学・プロセス工学',
    description: '投入電気エネルギーが高位発熱量(HHV)の水素ガスエネルギーと過電圧ジュール熱に変換される収支。',
    code: '\\sankey{\n  投入電力量 [100] -> 製造水素化学エネルギー [72];\n  投入電力量 -> 過電圧・セル発熱損失 [22];\n  投入電力量 -> BOP補機電力 [6];\n}',
    tags: ['水電解', '水素', '電気化学', 'エネルギー変換', '脱炭素']
  },
  {
    id: 'sankey-methanation-biomass',
    name: 'バイオマスガス化メタネーション収支',
    category: '化学・プロセス工学',
    description: '木質バイオマス炭素源がガス化・メタン化反応を経て合成天然ガス(SNG)と残渣に移行する炭素収支。',
    code: '\\sankey{\n  バイオマス炭素 [100] -> 合成粗ガスCO+H2 [75];\n  バイオマス炭素 -> 炭化チャー・灰分 [25];\n  合成粗ガスCO+H2 -> 精製メタンSNG [58];\n  合成粗ガスCO+H2 -> CO2分離ロス [17];\n}',
    tags: ['メタネーション', 'バイオマス', '炭素循環', '合成天然ガス']
  }
];

// サンキーダイアグラム ライブラリモーダルの制御
const sankeyLibraryModal = document.getElementById('sankey-library-modal');
const closeSankeyLibraryXBtn = document.getElementById('sankey-modal-close-x');
const closeSankeyLibraryFooterBtn = document.getElementById('sankey-modal-close-footer');
const sankeySearchInput = document.getElementById('sankey-library-search-input');
const sankeyCategoryTabs = document.querySelectorAll('.sankey-category-tab');
const sankeyCardGrid = document.getElementById('sankey-library-card-grid');
const sankeyEmptyMessage = document.getElementById('sankey-library-empty-message');

let currentSankeyCategory = 'すべて';

function openSankeyModal() {
  if (!sankeyLibraryModal) return;
  sankeyLibraryModal.classList.add('active');
  sankeyLibraryModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  if (sankeySearchInput) sankeySearchInput.value = '';
  currentSankeyCategory = 'すべて';
  sankeyCategoryTabs.forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.category === 'すべて');
  });
  renderSankeyCards();
  if (sankeySearchInput) sankeySearchInput.focus();
}

function closeSankeyModal() {
  if (!sankeyLibraryModal) return;
  sankeyLibraryModal.classList.remove('active');
  sankeyLibraryModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

function renderSankeyCards() {
  if (!sankeyCardGrid || !sankeySearchInput) return;
  const query = sankeySearchInput.value.trim().toLowerCase();
  sankeyCardGrid.innerHTML = '';

  const filtered = sankeyLibrary.filter((item) => {
    const matchCategory = currentSankeyCategory === 'すべて' || item.category === currentSankeyCategory;
    const matchTags = Array.isArray(item.tags) && item.tags.some((t) => t.toLowerCase().includes(query));
    const matchQuery =
      !query ||
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.code.toLowerCase().includes(query) ||
      matchTags;
    return matchCategory && matchQuery;
  });

  if (filtered.length === 0) {
    if (sankeyEmptyMessage) sankeyEmptyMessage.style.display = 'block';
  } else {
    if (sankeyEmptyMessage) sankeyEmptyMessage.style.display = 'none';
    filtered.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'formula-card sankey-card';

      const top = document.createElement('div');
      top.className = 'card-top';

      const name = document.createElement('span');
      name.className = 'card-name';
      name.textContent = item.name;

      const tag = document.createElement('span');
      tag.className = 'card-tag sankey-card-tag';
      tag.textContent = item.category;

      top.appendChild(name);
      top.appendChild(tag);

      const preview = document.createElement('div');
      preview.className = 'card-preview sankey-card-preview';
      drawSankeySvg(item.code, preview, null);

      const desc = document.createElement('p');
      desc.className = 'card-desc';
      desc.textContent = item.description;

      card.appendChild(top);
      card.appendChild(preview);
      card.appendChild(desc);

      card.addEventListener('click', () => {
        inputArea.value = item.code;
        closeSankeyModal();
        updatePreview();
      });

      sankeyCardGrid.appendChild(card);
    });
  }
}

if (closeSankeyLibraryXBtn) closeSankeyLibraryXBtn.addEventListener('click', closeSankeyModal);
if (closeSankeyLibraryFooterBtn) closeSankeyLibraryFooterBtn.addEventListener('click', closeSankeyModal);

if (sankeyLibraryModal) {
  sankeyLibraryModal.addEventListener('click', (e) => {
    if (e.target === sankeyLibraryModal) {
      closeSankeyModal();
    }
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && sankeyLibraryModal && sankeyLibraryModal.classList.contains('active')) {
    closeSankeyModal();
  }
});

if (sankeySearchInput) {
  sankeySearchInput.addEventListener('input', renderSankeyCards);
}

sankeyCategoryTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    sankeyCategoryTabs.forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');
    currentSankeyCategory = tab.dataset.category;
    renderSankeyCards();
  });
});

// ==========================================
// フローチャート ライブラリ データ & モーダル制御
// ==========================================
const flowchartLibrary = [
  {
    id: 'flow-max-val',
    name: '2値の最大値判定（基本条件分岐）',
    category: '基本アルゴリズム',
    description: '2つの数値 a, b を入力し、条件分岐で大きい方の値を最大値として出力する基本的なアルゴリズム。',
    code: '\\flowchart{\n  node: 開始 [start];\n  node: 入力: a, b [io];\n  node: a > b ? [cond];\n  node: max = a [proc];\n  node: max = b [proc];\n  node: 出力: max [io];\n  node: 終了 [end];\n\n  開始 -> 入力: a, b;\n  入力: a, b -> a > b ?;\n  a > b ? -> max = a: "Yes";\n  a > b ? -> max = b: "No";\n  max = a -> 出力: max;\n  max = b -> 出力: max;\n  出力: max -> 終了;\n}',
    tags: ['最大値', '条件分岐', 'if文', '基本']
  },
  {
    id: 'flow-sum-loop',
    name: '1からNまでの整数の総和（ループ計算）',
    category: 'ループ・反復処理',
    description: 'カウンタ変数 i を 1 から N までインクリメントしながら、合計値 sum に累積加算する反復構造。',
    code: '\\flowchart{\n  node: 開始 (0, 0) [start];\n  node: 入力: N (0, 70) [io];\n  node: sum = 0, i = 1 (0, 140) [proc];\n  node: i <= N ? (0, 220) [cond];\n  node: sum += i, i++ (150, 300) [proc];\n  node: 出力: sum (0, 310) [io];\n  node: 終了 (0, 380) [end];\n\n  開始 -> 入力: N;\n  入力: N -> sum = 0, i = 1;\n  sum = 0, i = 1 -> i <= N ?;\n  i <= N ? -> sum += i, i++: "Yes";\n  sum += i, i++ -> i <= N ?;\n  i <= N ? -> 出力: sum: "No";\n  出力: sum -> 終了;\n}',
    tags: ['ループ', 'for文', 'while文', '累積加算', '反復']
  },
  {
    id: 'flow-binary-search',
    name: '二分探索アルゴリズム（Binary Search）',
    category: '基本アルゴリズム',
    description: 'ソート済み配列の中央値と比較しながら探索範囲を半分に絞り込む高速検索アルゴリズム。',
    code: '\\flowchart{\n  node: 開始 (0, 0) [start];\n  node: low=0, high=N-1 (0, 70) [proc];\n  node: low <= high ? (0, 150) [cond];\n  node: mid = (low+high)/2 (0, 230) [proc];\n  node: arr[mid] == key ? (0, 310) [cond];\n  node: midを返す (160, 310) [proc];\n  node: arr[mid] < key ? (0, 400) [cond];\n  node: low = mid + 1 (140, 470) [proc];\n  node: high = mid - 1 (-140, 470) [proc];\n  node: -1 (見つからず) (-180, 200) [proc];\n  node: 終了 (0, 560) [end];\n\n  開始 -> low=0, high=N-1;\n  low=0, high=N-1 -> low <= high ?;\n  low <= high ? -> mid = (low+high)/2: "Yes";\n  low <= high ? -> -1 (見つからず): "No";\n  mid = (low+high)/2 -> arr[mid] == key ?;\n  arr[mid] == key ? -> midを返す: "Yes";\n  arr[mid] == key ? -> arr[mid] < key ?: "No";\n  arr[mid] < key ? -> low = mid + 1: "Yes";\n  arr[mid] < key ? -> high = mid - 1: "No";\n  low = mid + 1 -> low <= high ?;\n  high = mid - 1 -> low <= high ?;\n  midを返す -> 終了;\n  -1 (見つからず) -> 終了;\n}',
    tags: ['二分探索', 'バイナリサーチ', '検索', 'O(log N)']
  },
  {
    id: 'flow-login-auth',
    name: 'ユーザー認証・ログイン判定フロー',
    category: 'システム・制御ロジック',
    description: 'パスワード照合、エラー回数カウント、およびアカウントロック（凍結）を含むセキュアログイン処理。',
    code: '\\flowchart{\n  node: 開始 (0, 0) [start];\n  node: ID・PW入力 (0, 70) [io];\n  node: パスワード検証 (0, 150) [sub];\n  node: 認証成功 ? (0, 230) [cond];\n  node: セッション発行 (140, 310) [proc];\n  node: マイページ表示 (140, 380) [proc];\n  node: 失敗回数++ (-140, 310) [proc];\n  node: 失敗 >= 5回 ? (-140, 380) [cond];\n  node: アカウント凍結 (-140, 460) [proc];\n  node: 終了 (0, 530) [end];\n\n  開始 -> ID・PW入力;\n  ID・PW入力 -> パスワード検証;\n  パスワード検証 -> 認証成功 ?;\n  認証成功 ? -> セッション発行: "Yes";\n  認証成功 ? -> 失敗回数++: "No";\n  セッション発行 -> マイページ表示;\n  失敗回数++ -> 失敗 >= 5回 ?;\n  失敗 >= 5回 ? -> アカウント凍結: "Yes";\n  失敗 >= 5回 ? -> ID・PW入力: "No";\n  マイページ表示 -> 終了;\n  アカウント凍結 -> 終了;\n}',
    tags: ['ログイン', '認証', 'セキュリティ', 'Webシステム']
  },
  {
    id: 'flow-vending-machine',
    name: '自動販売機 購入・返金フロー',
    category: 'システム・制御ロジック',
    description: '硬貨投入から投入金額判定、商品選択、商品排出、おつり計算・返却までの一連の組み込み制御ロジック。',
    code: '\\flowchart{\n  node: 開始 (0, 0) [start];\n  node: 硬貨投入 (0, 70) [io];\n  node: 金額 >= 価格 ? (0, 150) [cond];\n  node: ランプ点灯 (0, 230) [proc];\n  node: ボタン押下 (0, 300) [io];\n  node: 商品排出 & おつり計算 (0, 380) [proc];\n  node: おつり > 0 ? (0, 460) [cond];\n  node: おつり返却 (140, 530) [io];\n  node: 終了 (0, 600) [end];\n\n  開始 -> 硬貨投入;\n  硬貨投入 -> 金額 >= 価格 ?;\n  金額 >= 価格 ? -> ランプ点灯: "Yes";\n  金額 >= 価格 ? -> 硬貨投入: "No";\n  ランプ点灯 -> ボタン押下;\n  ボタン押下 -> 商品排出 & おつり計算;\n  商品排出 & おつり計算 -> おつり > 0 ?;\n  おつり > 0 ? -> おつり返却: "Yes";\n  おつり > 0 ? -> 終了: "No";\n  おつり返却 -> 終了;\n}',
    tags: ['自動販売機', '組込み', '制御フロー', 'ステート']
  },
  {
    id: 'flow-euclid-gcd',
    name: 'ユークリッドの互除法（最大公約数 GCD）',
    category: 'ループ・反復処理',
    description: '剰余計算を繰り返すことで2つの整数 a, b の最大公約数を高速に求める古典的アルゴリズム。',
    code: '\\flowchart{\n  node: 開始 (0, 0) [start];\n  node: 入力: a, b (0, 70) [io];\n  node: b == 0 ? (0, 150) [cond];\n  node: GCD = a (140, 230) [proc];\n  node: r = a % b (0, 230) [proc];\n  node: a = b, b = r (0, 300) [proc];\n  node: 出力: GCD (140, 370) [io];\n  node: 終了 (140, 440) [end];\n\n  開始 -> 入力: a, b;\n  入力: a, b -> b == 0 ?;\n  b == 0 ? -> GCD = a: "Yes";\n  b == 0 ? -> r = a % b: "No";\n  r = a % b -> a = b, b = r;\n  a = b, b = r -> b == 0 ?;\n  GCD = a -> 出力: GCD;\n  出力: GCD -> 終了;\n}',
    tags: ['ユークリッド', '互除法', 'GCD', '最大公約数', '数学']
  },
  {
    id: 'flow-note-support-branch',
    name: '記事サポート・リアクション判定フロー',
    category: '基本アルゴリズム',
    description: '「この文章にチップを出しますか？」の条件分岐に応じ、感謝メッセージまたはスキのお願いへ分岐して合流・終了するインタラクションフロー。',
    code: '\\flowchart{\n  node: 開始 (0, 0) [start];\n  node: この文章にチップを\\n出しますか？ (0, 80) [cond];\n  node: ありがとうございます (-120, 170) [proc];\n  node: スキは押してね (120, 170) [proc];\n  node: 終了 (0, 250) [end];\n\n  開始 -> この文章にチップを\\n出しますか？;\n  この文章にチップを\\n出しますか？ -> ありがとうございます: "Yes";\n  この文章にチップを\\n出しますか？ -> スキは押してね: "No";\n  ありがとうございます -> 終了;\n  スキは押してね -> 終了;\n}',
    tags: ['チップ', 'サポート', 'note', '条件分岐', 'インタラクション', '合流']
  }
];

// フローチャート ライブラリモーダルの制御
const flowchartLibraryModal = document.getElementById('flowchart-library-modal');
const closeFlowchartLibraryXBtn = document.getElementById('flowchart-modal-close-x');
const closeFlowchartLibraryFooterBtn = document.getElementById('flowchart-modal-close-footer');
const flowchartSearchInput = document.getElementById('flowchart-library-search-input');
const flowchartCategoryTabs = document.querySelectorAll('.flowchart-category-tab');
const flowchartCardGrid = document.getElementById('flowchart-library-card-grid');
const flowchartEmptyMessage = document.getElementById('flowchart-library-empty-message');

let currentFlowchartCategory = 'すべて';

function openFlowchartModal() {
  if (!flowchartLibraryModal) return;
  flowchartLibraryModal.classList.add('active');
  flowchartLibraryModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  if (flowchartSearchInput) flowchartSearchInput.value = '';
  currentFlowchartCategory = 'すべて';
  flowchartCategoryTabs.forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.category === 'すべて');
  });
  renderFlowchartCards();
  if (flowchartSearchInput) flowchartSearchInput.focus();
}

function closeFlowchartModal() {
  if (!flowchartLibraryModal) return;
  flowchartLibraryModal.classList.remove('active');
  flowchartLibraryModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

function renderFlowchartCards() {
  if (!flowchartCardGrid || !flowchartSearchInput) return;
  const query = flowchartSearchInput.value.trim().toLowerCase();
  flowchartCardGrid.innerHTML = '';

  const filtered = flowchartLibrary.filter((item) => {
    const matchCategory = currentFlowchartCategory === 'すべて' || item.category === currentFlowchartCategory;
    const matchTags = Array.isArray(item.tags) && item.tags.some((t) => t.toLowerCase().includes(query));
    const matchQuery =
      !query ||
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      matchTags;
    return matchCategory && matchQuery;
  });

  if (filtered.length === 0) {
    if (flowchartEmptyMessage) flowchartEmptyMessage.style.display = 'block';
  } else {
    if (flowchartEmptyMessage) flowchartEmptyMessage.style.display = 'none';
    filtered.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'formula-card flowchart-card';

      const top = document.createElement('div');
      top.className = 'card-top';

      const name = document.createElement('span');
      name.className = 'card-name';
      name.textContent = item.name;

      const tag = document.createElement('span');
      tag.className = 'card-tag flowchart-card-tag';
      tag.textContent = item.category;

      top.appendChild(name);
      top.appendChild(tag);

      const preview = document.createElement('div');
      preview.className = 'card-preview flowchart-card-preview';
      drawFlowchartSvg(item.code, preview, null);

      const desc = document.createElement('p');
      desc.className = 'card-desc';
      desc.textContent = item.description;

      card.appendChild(top);
      card.appendChild(preview);
      card.appendChild(desc);

      card.addEventListener('click', () => {
        inputArea.value = item.code;
        closeFlowchartModal();
        updatePreview();
      });

      flowchartCardGrid.appendChild(card);
    });
  }
}

if (closeFlowchartLibraryXBtn) closeFlowchartLibraryXBtn.addEventListener('click', closeFlowchartModal);
if (closeFlowchartLibraryFooterBtn) closeFlowchartLibraryFooterBtn.addEventListener('click', closeFlowchartModal);

if (flowchartLibraryModal) {
  flowchartLibraryModal.addEventListener('click', (e) => {
    if (e.target === flowchartLibraryModal) {
      closeFlowchartModal();
    }
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && flowchartLibraryModal && flowchartLibraryModal.classList.contains('active')) {
    closeFlowchartModal();
  }
});

if (flowchartSearchInput) {
  flowchartSearchInput.addEventListener('input', renderFlowchartCards);
}

flowchartCategoryTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    flowchartCategoryTabs.forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');
    currentFlowchartCategory = tab.dataset.category;
    renderFlowchartCards();
  });
});

// ==========================================
// 表（テーブル）ライブラリ データ & モーダル制御
// ==========================================
const tableLibrary = [
  {
    id: 'table-si-base-csv',
    name: 'SI基本単位一覧表（CSV形式）',
    category: 'SI単位・標準規格',
    description: 'カンマ区切り（CSV）で記述された国際単位系（SI）の7つの基本物理量と単位記号。',
    code: '物理量,記号,SI基本単位,単位記号\n長さ,L,メートル,m\n質量,M,キログラム,kg\n時間,T,秒,s\n電流,I,アンペア,A\n熱力学温度,Θ,ケルビン,K\n物質量,N,モル,mol\n光度,J,カンデラ,cd',
    tags: ['SI基本単位', 'CSV', '国際単位系', '物理量']
  },
  {
    id: 'table-si-base-md',
    name: 'SI基本単位一覧表（Markdown数式形式）',
    category: 'SI単位・標準規格',
    description: 'Markdownテーブル構文とLaTeXインライン数式（$L$, $\\text{kg}$等）を組み合わせた美麗な一覧表。',
    code: '| 物理量 | 記号 | SI基本単位 | 単位記号 |\n| :--- | :---: | :--- | :---: |\n| 長さ | $L$ | メートル | $\\text{m}$ |\n| 質量 | $M$ | キログラム | $\\text{kg}$ |\n| 時間 | $T$ | 秒 | $\\text{s}$ |\n| 電流 | $I$ | アンペア | $\\text{A}$ |\n| 熱力学温度 | $\\Theta$ | ケルビン | $\\text{K}$ |\n| 物質量 | $N$ | モル | $\\text{mol}$ |\n| 光度 | $J$ | カンデラ | $\\text{cd}$ |',
    tags: ['SI基本単位', 'Markdown', '数式', 'KaTeX']
  },
  {
    id: 'table-constants-tabular',
    name: '主要な基礎物理定数表（LaTeX tabular形式）',
    category: '物理定数・定数表',
    description: 'LaTeXのtabular環境で記述された真空中の光速度、プランク定数、電気素量などの基礎物理定数。',
    code: '\\begin{tabular}{|l|c|l|l|}\n\\hline\n物理定数名 & 記号 & 数値 & 単位 \\\\\n\\hline\n真空中の光速度 & $c$ & $2.9979 \\times 10^8$ & $\\text{m/s}$ \\\\\nプランク定数 & $h$ & $6.6261 \\times 10^{-34}$ & $\\text{J}\\cdot\\text{s}$ \\\\\n電気素量 & $e$ & $1.6022 \\times 10^{-19}$ & $\\text{C}$ \\\\\n万有引力定数 & $G$ & $6.6743 \\times 10^{-11}$ & $\\text{N}\\cdot\\text{m}^2/\\text{kg}^2$ \\\\\nボルツマン定数 & $k_B$ & $1.3806 \\times 10^{-23}$ & $\\text{J/K}$ \\\\\nアボガドロ定数 & $N_A$ & $6.0221 \\times 10^{23}$ & $\\text{mol}^{-1}$ \\\\\n\\hline\n\\end{tabular}',
    tags: ['物理定数', 'LaTeX', 'tabular', '光速', 'プランク定数']
  },
  {
    id: 'table-si-derived',
    name: '主要なSI組立単位（固有の名称を持つ単位）',
    category: 'SI単位・標準規格',
    description: 'ニュートン、ジュール、ワット、パスカル、ボルトなど他のSI単位・基本単位との対応関係。',
    code: '| 組立量 | 単位名称 | 記号 | 他のSI単位 | SI基本単位による表式 |\n| :--- | :--- | :---: | :--- | :--- |\n| 周波数 | ヘルツ | $\\text{Hz}$ | $-$ | $\\text{s}^{-1}$ |\n| 力 | ニュートン | $\\text{N}$ | $-$ | $\\text{m}\\cdot\\text{kg}\\cdot\\text{s}^{-2}$ |\n| 圧力・応力 | パスカル | $\\text{Pa}$ | $\\text{N/m}^2$ | $\\text{m}^{-1}\\cdot\\text{kg}\\cdot\\text{s}^{-2}$ |\n| エネルギー・仕事 | ジュール | $\\text{J}$ | $\\text{N}\\cdot\\text{m}$ | $\\text{m}^2\\cdot\\text{kg}\\cdot\\text{s}^{-2}$ |\n| 仕事率・電力 | ワット | $\\text{W}$ | $\\text{J/s}$ | $\\text{m}^2\\cdot\\text{kg}\\cdot\\text{s}^{-3}$ |\n| 電位・起電力 | ボルト | $\\text{V}$ | $\\text{W/A}$ | $\\text{m}^2\\cdot\\text{kg}\\cdot\\text{s}^{-3}\\cdot\\text{A}^{-1}$ |',
    tags: ['SI組立単位', 'ニュートン', 'ジュール', 'ワット', 'パスカル']
  },
  {
    id: 'table-elementary-particles',
    name: '素粒子物理学・標準模型粒子分類表',
    category: '素粒子・物質一覧',
    description: '物質を構成する基本粒子（第1〜第3世代のクォーク、レプトン）の電荷と質量の一覧。',
    code: '| 世代 | クォーク (Q) | 電荷 | 質量目安 | レプトン (L) | 電荷 |\n| :---: | :--- | :---: | :--- | :--- | :---: |\n| 第1世代 | アップ ($u$) | $+2/3$ | $\\approx 2.2\\text{ MeV}$ | 電子 ($e^-$) | $-1$ |\n| 第1世代 | ダウン ($d$) | $-1/3$ | $\\approx 4.7\\text{ MeV}$ | 電子ニュートリノ ($\\nu_e$) | $0$ |\n| 第2世代 | チャーム ($c$) | $+2/3$ | $\\approx 1.27\\text{ GeV}$ | ミューオン ($\\mu^-$) | $-1$ |\n| 第2世代 | ストレンジ ($s$) | $-1/3$ | $\\approx 96\\text{ MeV}$ | ミューニュートリノ ($\\nu_\\mu$) | $0$ |\n| 第3世代 | トップ ($t$) | $+2/3$ | $\\approx 173\\text{ GeV}$ | タウ ($ \\tau^-$) | $-1$ |\n| 第3世代 | ボトム ($b$) | $-1/3$ | $\\approx 4.18\\text{ GeV}$ | タウニュートリノ ($\\nu_\\tau$) | $0$ |',
    tags: ['素粒子', 'クォーク', 'レプトン', '標準模型', '高エネルギー物理学']
  }
];

// 表（テーブル）ライブラリモーダルの制御
const tableLibraryModal = document.getElementById('table-library-modal');
const closeTableLibraryXBtn = document.getElementById('table-modal-close-x');
const closeTableLibraryFooterBtn = document.getElementById('table-modal-close-footer');
const tableSearchInput = document.getElementById('table-library-search-input');
const tableCategoryTabs = document.querySelectorAll('.table-category-tab');
const tableCardGrid = document.getElementById('table-library-card-grid');
const tableEmptyMessage = document.getElementById('table-library-empty-message');

let currentTableCategory = 'すべて';

function openTableModal() {
  if (!tableLibraryModal) return;
  tableLibraryModal.classList.add('active');
  tableLibraryModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  if (tableSearchInput) tableSearchInput.value = '';
  currentTableCategory = 'すべて';
  tableCategoryTabs.forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.category === 'すべて');
  });
  renderTableCards();
  if (tableSearchInput) tableSearchInput.focus();
}

function closeTableModal() {
  if (!tableLibraryModal) return;
  tableLibraryModal.classList.remove('active');
  tableLibraryModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

function renderTableCards() {
  if (!tableCardGrid || !tableSearchInput) return;
  const query = tableSearchInput.value.trim().toLowerCase();
  tableCardGrid.innerHTML = '';

  const filtered = tableLibrary.filter((item) => {
    const matchCategory = currentTableCategory === 'すべて' || item.category === currentTableCategory;
    const matchTags = Array.isArray(item.tags) && item.tags.some((t) => t.toLowerCase().includes(query));
    const matchQuery =
      !query ||
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      matchTags;
    return matchCategory && matchQuery;
  });

  if (filtered.length === 0) {
    if (tableEmptyMessage) tableEmptyMessage.style.display = 'block';
  } else {
    if (tableEmptyMessage) tableEmptyMessage.style.display = 'none';
    filtered.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'formula-card table-card';

      const top = document.createElement('div');
      top.className = 'card-top';

      const name = document.createElement('span');
      name.className = 'card-name';
      name.textContent = item.name;

      const tag = document.createElement('span');
      tag.className = 'card-tag table-card-tag';
      tag.textContent = item.category;

      top.appendChild(name);
      top.appendChild(tag);

      const preview = document.createElement('div');
      preview.className = 'card-preview table-card-preview';
      const parsedData = parseAnyTable(item.code);
      if (parsedData) {
        renderTableElement(parsedData, preview, null);
      } else {
        preview.textContent = item.code.substring(0, 50);
      }

      const desc = document.createElement('p');
      desc.className = 'card-desc';
      desc.textContent = item.description;

      card.appendChild(top);
      card.appendChild(preview);
      card.appendChild(desc);

      card.addEventListener('click', () => {
        inputArea.value = item.code;
        closeTableModal();
        updatePreview();
      });

      tableCardGrid.appendChild(card);
    });
  }
}

if (closeTableLibraryXBtn) closeTableLibraryXBtn.addEventListener('click', closeTableModal);
if (closeTableLibraryFooterBtn) closeTableLibraryFooterBtn.addEventListener('click', closeTableModal);

if (tableLibraryModal) {
  tableLibraryModal.addEventListener('click', (e) => {
    if (e.target === tableLibraryModal) {
      closeTableModal();
    }
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && tableLibraryModal && tableLibraryModal.classList.contains('active')) {
    closeTableModal();
  }
});

if (tableSearchInput) {
  tableSearchInput.addEventListener('input', renderTableCards);
}

tableCategoryTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    tableCategoryTabs.forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');
    currentTableCategory = tab.dataset.category;
    renderTableCards();
  });
});

// ==========================================
// 2軸マップ・マトリクス図 ライブラリ データ & モーダル制御
// ==========================================
const matrixLibrary = [
  {
    id: 'matrix-eisenhower',
    name: 'アイゼンハワーマトリクス（時間管理・優先度）',
    category: 'タスク・優先度',
    description: '緊急度と重要度の2軸でタスクを4領域に分類し、直ちに行うべきことや削減すべきことを明確化する時間管理手法。',
    code: '\\matrixmap{\n  title: アイゼンハワーマトリクス（時間管理・タスク優先度）;\n  axis-x: 緊急度 (低い -> 高い);\n  axis-y: 重要度 (低い -> 高い);\n  quadrant: [右上] すぐ実行（危機・重要課題）, [左上] 計画・自己投資（第2領域）, [右下] 他者へ委任, [左下] 削減・やめる;\n  item: 緊急トラブル対応 (0.75, 0.85) [danger];\n  item: 健康・スキル学習 (-0.6, 0.8) [accent];\n  item: 重要プロジェクト進行 (-0.2, 0.7) [primary];\n  item: 急な頼まれ仕事 (0.65, -0.4) [warning];\n  item: 目的のないスマホ閲覧 (-0.7, -0.7) [muted];\n}',
    tags: ['時間管理', '優先順位', 'アイゼンハワー', 'タスク', '重要度', '緊急度']
  },
  {
    id: 'matrix-market-positioning',
    name: '市場ポジショニングマップ（価格 vs 品質）',
    category: 'ビジネス・戦略',
    description: '競合製品と自社製品の立ち位置を価格帯と品質・独自性の2軸で可視化し、差別化要因やブルーオーシャンを特定するマップ。',
    code: '\\matrixmap{\n  title: 市場ポジショニングマップ（価格帯 vs 品質・独自性）;\n  axis-x: 価格帯 (低価格 -> 高価格);\n  axis-y: 品質・独自性 (大衆的・コモディティ -> 高品質・独自);\n  quadrant: [右上] プレミアム・高付加価値, [左上] コスパ最強・破壊的価値, [右下] ハイエンド専門, [左下] エントリー・大衆向け;\n  item: 自社新製品 (-0.4, 0.75) [accent];\n  item: 競合A社 (0.8, 0.85) [primary];\n  item: 競合B社 (-0.7, -0.5) [muted];\n  item: 競合C社 (0.6, -0.2) [warning];\n}',
    tags: ['ポジショニング', 'マーケティング', '価格', '品質', '競合分析', '戦略']
  },
  {
    id: 'matrix-project-priority',
    name: '施策・機能優先度マトリクス（工数 vs インパクト）',
    category: 'タスク・優先度',
    description: '開発施策やアイデアを実装難易度（工数）と期待効果（インパクト）で評価し、最優先で取り組む「Quick Win」を特定。',
    code: '\\matrixmap{\n  title: 施策優先度マトリクス（工数難易度 vs 効果インパクト）;\n  axis-x: 実装難易度・工数 (容易・低工数 -> 困難・高工数);\n  axis-y: 期待効果・インパクト (小さい -> 大きい);\n  quadrant: [左上] Quick Win（最優先・即実行）, [右上] 戦略的重点施策（要計画）, [左下] 隙間時間対応, [右下] 再検討・見送り;\n  item: UI改善・導線改修 (-0.7, 0.8) [accent];\n  item: 基幹システム刷新 (0.75, 0.85) [primary];\n  item: 文言の微調整 (-0.5, -0.4) [muted];\n  item: 不要機能の複雑改修 (0.8, -0.6) [danger];\n}',
    tags: ['施策', 'プロダクト開発', 'インパクト', '工数', '優先度', 'Quick Win']
  },
  {
    id: 'matrix-ragone-plot',
    name: 'ラゴーンプロット（蓄電・電池デバイス比較）',
    category: '物理・工学比較',
    description: '電気化学デバイスの性能指標である比出力（急速充放電性能）と比エネルギー（蓄電容量・航続距離）を比較する物理プロット。',
    code: '\\matrixmap{\n  title: ラゴーンプロット（蓄電デバイス特性比較）;\n  axis-x: 比出力 [W/kg] (低出力 -> 高出力);\n  axis-y: 比エネルギー [Wh/kg] (低容量 -> 高容量);\n  quadrant: [右上] 理想的次世代蓄電, [左上] 高エネルギー型（航続距離重視）, [右下] 高出力型（急速充放電・回生）, [左下] 従来型蓄電;\n  item: リチウムイオン電池 (-0.2, 0.6) [accent];\n  item: 燃料電池 (Fuel Cell) (-0.7, 0.85) [primary];\n  item: 電気二重層キャパシタ (0.8, -0.5) [warning];\n  item: 全固体電池 (次世代目標) (0.5, 0.75) [accent];\n  item: 鉛蓄電池 (-0.6, -0.6) [muted];\n}',
    tags: ['ラゴーンプロット', 'リチウムイオン電池', 'キャパシタ', '燃料電池', '物理', '電気化学']
  },
  {
    id: 'matrix-skill-will',
    name: 'ウィル・スキル マトリクス（人材育成・マネジメント）',
    category: 'ビジネス・戦略',
    description: 'メンバーの業務習熟度（スキル）と意欲（ウィル）の2軸で状態を把握し、最適なリーダーシップや指示アプローチを選択する枠組み。',
    code: '\\matrixmap{\n  title: ウィル・スキル マトリクス（人材育成・マネジメント）;\n  axis-x: 業務スキル・習熟度 (未習熟 -> 熟練・自立);\n  axis-y: 意欲・モチベーション (低下 -> 高い);\n  quadrant: [右上] 権限委譲（リーダー育成）, [左上] ガイド・教育（熱意を活かす）, [右下] 動機づけ・対話（環境整備）, [左下] 指示・基本徹底;\n  item: 若手エース (0.7, 0.8) [accent];\n  item: 意欲的な新人 (-0.6, 0.85) [primary];\n  item: 伸び悩むベテラン (0.6, -0.4) [warning];\n  item: 研修受講生 (-0.7, -0.5) [muted];\n}',
    tags: ['マネジメント', 'ウィルスキル', '人材育成', 'リーダーシップ', '組織']
  }
];

// 2軸マップ ライブラリモーダルの制御
const matrixLibraryModal = document.getElementById('matrix-library-modal');
const closeMatrixLibraryXBtn = document.getElementById('matrix-modal-close-x');
const closeMatrixLibraryFooterBtn = document.getElementById('matrix-modal-close-footer');
const matrixSearchInput = document.getElementById('matrix-library-search-input');
const matrixCategoryTabs = document.querySelectorAll('.matrix-category-tab');
const matrixCardGrid = document.getElementById('matrix-library-card-grid');
const matrixEmptyMessage = document.getElementById('matrix-library-empty-message');

let currentMatrixCategory = 'すべて';

function openMatrixModal() {
  if (!matrixLibraryModal) return;
  matrixLibraryModal.classList.add('active');
  matrixLibraryModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  if (matrixSearchInput) matrixSearchInput.value = '';
  currentMatrixCategory = 'すべて';
  matrixCategoryTabs.forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.category === 'すべて');
  });
  renderMatrixCards();
  if (matrixSearchInput) matrixSearchInput.focus();
}

function closeMatrixModal() {
  if (!matrixLibraryModal) return;
  matrixLibraryModal.classList.remove('active');
  matrixLibraryModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

function renderMatrixCards() {
  if (!matrixCardGrid || !matrixSearchInput) return;
  const query = matrixSearchInput.value.trim().toLowerCase();
  matrixCardGrid.innerHTML = '';

  const filtered = matrixLibrary.filter((item) => {
    const matchCategory = currentMatrixCategory === 'すべて' || item.category === currentMatrixCategory;
    const matchTags = Array.isArray(item.tags) && item.tags.some((t) => t.toLowerCase().includes(query));
    const matchQuery =
      !query ||
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      matchTags;
    return matchCategory && matchQuery;
  });

  if (filtered.length === 0) {
    if (matrixEmptyMessage) matrixEmptyMessage.style.display = 'block';
  } else {
    if (matrixEmptyMessage) matrixEmptyMessage.style.display = 'none';
    filtered.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'formula-card matrix-card';

      const top = document.createElement('div');
      top.className = 'card-top';

      const name = document.createElement('span');
      name.className = 'card-name';
      name.textContent = item.name;

      const tag = document.createElement('span');
      tag.className = 'card-tag matrix-card-tag';
      tag.textContent = item.category;

      top.appendChild(name);
      top.appendChild(tag);

      const preview = document.createElement('div');
      preview.className = 'card-preview matrix-card-preview';
      drawMatrixMapSvg(item.code, preview, null);

      const desc = document.createElement('p');
      desc.className = 'card-desc';
      desc.textContent = item.description;

      card.appendChild(top);
      card.appendChild(preview);
      card.appendChild(desc);

      card.addEventListener('click', () => {
        inputArea.value = item.code;
        closeMatrixModal();
        updatePreview();
      });

      matrixCardGrid.appendChild(card);
    });
  }
}

if (closeMatrixLibraryXBtn) closeMatrixLibraryXBtn.addEventListener('click', closeMatrixModal);
if (closeMatrixLibraryFooterBtn) closeMatrixLibraryFooterBtn.addEventListener('click', closeMatrixModal);

if (matrixLibraryModal) {
  matrixLibraryModal.addEventListener('click', (e) => {
    if (e.target === matrixLibraryModal) {
      closeMatrixModal();
    }
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && matrixLibraryModal && matrixLibraryModal.classList.contains('active')) {
    closeMatrixModal();
  }
});

if (matrixSearchInput) {
  matrixSearchInput.addEventListener('input', renderMatrixCards);
}

matrixCategoryTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    matrixCategoryTabs.forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');
    currentMatrixCategory = tab.dataset.category;
    renderMatrixCards();
  });
});

// ==========================================
// ピラミッド図・階層図 ライブラリ データ & モーダル制御
// ==========================================
const pyramidLibrary = [
  {
    id: 'pyramid-school-caste',
    name: 'アメリカのスクールカースト（学園階層構造）',
    category: '社会・組織',
    description: '米国のハイスクール文化における典型的な非公式階層構造。ジョック/チアリーダーの頂点からオタク/ナードまでのステレオタイプ分類。',
    code: '\\pyramid{\n  title: アメリカのスクールカースト (American High School Hierarchy);\n  layer: ジョックス & クイーンビーズ [gold] (運動部花形スター・チアリーダー頂点);\n  layer: サイドキックス & プリンシパル [warning] (人気者の取り巻き・準人気グループ);\n  layer: フローターズ & ノーマル [primary] (一般生徒・複数のグループを往来);\n  layer: ギークス & バンドギークス [cyan] (文化部・吹奏楽・パソコンオタク);\n  layer: ナード & ターゲット [muted] (いじめの標的・ガリ勉・孤立層);\n}',
    tags: ['スクールカースト', 'アメリカ', 'ジョック', 'ナード', 'ギーク', '階層', '社会・組織', '学校']
  },
  {
    id: 'pyramid-maslow',
    name: 'マズローの欲求5段階説（自己実現理論）',
    category: '心理・思考',
    description: '人間の動機づけ・心理的欲求を低次（生理的欲求）から高次（自己実現欲求）へと積み上げた心理学の代表的ピラミッドモデル。',
    code: '\\pyramid{\n  title: マズローの欲求5段階説 (Maslow\'s Hierarchy of Needs);\n  layer: 自己実現の欲求 [gold] (自己の可能性の最大発揮・創造性);\n  layer: 承認・尊重の欲求 [warning] (他者からの評価・名誉・自己肯定感);\n  layer: 社会的欲求・愛 [primary] (集団への帰属・友情・愛情関係);\n  layer: 安全の欲求 [cyan] (身の安全・雇用や生活の安定・健康);\n  layer: 生理的欲求 [emerald] (食欲・睡眠・呼吸・生命維持の根本);\n}',
    tags: ['マズロー', '欲求5段階', '自己実現', '心理学', '動機づけ', '承認欲求', '心理・思考']
  },
  {
    id: 'pyramid-dikw',
    name: 'DIKWピラミッド（知の階層モデル）',
    category: '科学・工学',
    description: '生のデータ（Data）から文脈を与えた情報（Information）、体系化した知識（Knowledge）、行動指針となる知恵（Wisdom）への進化モデル。',
    code: '\\pyramid{\n  title: DIKWピラミッド (Data-Information-Knowledge-Wisdom);\n  layer: 知恵 (Wisdom) [gold] (本質的洞察・適切な判断と行動規範);\n  layer: 知識 (Knowledge) [warning] (情報の体系化・応用可能なノウハウ);\n  layer: 情報 (Information) [primary] (文脈・意味付けが与えられたデータ);\n  layer: データ (Data) [slate] (事実・数値・生ログ等の未加工の記号);\n}',
    tags: ['DIKW', 'データ', '情報', '知識', '知恵', '情報科学', 'ナレッジマネジメント', '科学・工学']
  },
  {
    id: 'pyramid-ecological',
    name: '生態ピラミッド（生物量・栄養段階）',
    category: '科学・工学',
    description: '生態系におけるエネルギー移動と生物量の階層構造。生産者（植物）から高次消費者（肉食動物）へのエネルギー減衰を可視化。',
    code: '\\pyramid{\n  title: 生態ピラミッド (Ecological Pyramid);\n  layer: 高次消費者 (頂点捕食者) [accent] (大型肉食動物・猛禽類);\n  layer: 二次消費者 [warning] (小型肉食動物・両生類・魚類);\n  layer: 一次消費者 [cyan] (草食動物・昆虫・動物プランクトン);\n  layer: 生産者 [success] (植物・藻類・光合成生物);\n}',
    tags: ['生態ピラミッド', '栄養段階', '生物', '食物連鎖', '生態系', '生産者', '消費者', '科学・工学']
  },
  {
    id: 'pyramid-test',
    name: 'テスト自動化ピラミッド（Testing Pyramid）',
    category: '科学・工学',
    description: 'ソフトウェア開発における費用対効果の高いテスト配分指針。基底の単体テストを最も多く、高コストなE2Eテストを最小限に抑える設計。',
    code: '\\pyramid{\n  title: テスト自動化ピラミッド (Testing Pyramid);\n  layer: E2E・UIテスト [danger] (高コスト・低速・保守負荷大);\n  layer: 統合・APIテスト [warning] (サービス間連携・中コスト);\n  layer: 単体・ユニットテスト [primary] (高速・低コスト・高カバレッジの基盤);\n}',
    tags: ['テスト自動化', 'アジャイル', '単体テスト', 'E2E', 'ソフトウェア工学', 'QA', '科学・工学']
  },
  {
    id: 'pyramid-bloom',
    name: 'ブルームのタキソノミー（思考力の6段階）',
    category: '心理・思考',
    description: '学習者の認知的思考プロセスを低次（記憶）から高次（評価・創造）へと分類した教育・研修の国際的標準フレームワーク。',
    code: '\\pyramid{\n  title: ブルームのタキソノミー (Bloom\'s Taxonomy);\n  layer: 創造 (Create) [gold] (新たな構造・アイデアの生成);\n  layer: 評価 (Evaluate) [purple] (基準に基づく判断・批評);\n  layer: 分析 (Analyze) [primary] (要素の分解・関係性の特定);\n  layer: 応用 (Apply) [cyan] (具体的事態への知識の適用);\n  layer: 理解 (Understand) [emerald] (意味の把握・説明・要約);\n  layer: 記憶 (Remember) [muted] (事実・用語・定義の想起);\n}',
    tags: ['ブルーム', 'タキソノミー', '思考力', '教育', '学習', '認知領域', '心理・思考']
  }
];

// ピラミッド図 ライブラリモーダルの制御
const pyramidLibraryModal = document.getElementById('pyramid-library-modal');
const closePyramidLibraryXBtn = document.getElementById('pyramid-modal-close-x');
const closePyramidLibraryFooterBtn = document.getElementById('pyramid-modal-close-footer');
const pyramidSearchInput = document.getElementById('pyramid-library-search-input');
const pyramidCategoryTabs = document.querySelectorAll('.pyramid-category-tab');
const pyramidCardGrid = document.getElementById('pyramid-library-card-grid');
const pyramidEmptyMessage = document.getElementById('pyramid-library-empty-message');

let currentPyramidCategory = 'すべて';

function openPyramidModal() {
  if (!pyramidLibraryModal) return;
  pyramidLibraryModal.classList.add('active');
  pyramidLibraryModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  if (pyramidSearchInput) pyramidSearchInput.value = '';
  currentPyramidCategory = 'すべて';
  pyramidCategoryTabs.forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.category === 'すべて');
  });
  renderPyramidCards();
  if (pyramidSearchInput) pyramidSearchInput.focus();
}

function closePyramidModal() {
  if (!pyramidLibraryModal) return;
  pyramidLibraryModal.classList.remove('active');
  pyramidLibraryModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

function renderPyramidCards() {
  if (!pyramidCardGrid || !pyramidSearchInput) return;
  const query = pyramidSearchInput.value.trim().toLowerCase();
  pyramidCardGrid.innerHTML = '';

  const filtered = pyramidLibrary.filter((item) => {
    const matchCategory = currentPyramidCategory === 'すべて' || item.category === currentPyramidCategory;
    const matchTags = Array.isArray(item.tags) && item.tags.some((t) => t.toLowerCase().includes(query));
    const matchQuery =
      !query ||
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      matchTags;
    return matchCategory && matchQuery;
  });

  if (filtered.length === 0) {
    if (pyramidEmptyMessage) pyramidEmptyMessage.style.display = 'block';
  } else {
    if (pyramidEmptyMessage) pyramidEmptyMessage.style.display = 'none';
    filtered.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'formula-card pyramid-card';

      const top = document.createElement('div');
      top.className = 'card-top';

      const name = document.createElement('span');
      name.className = 'card-name';
      name.textContent = item.name;

      const tag = document.createElement('span');
      tag.className = 'card-tag pyramid-card-tag';
      tag.textContent = item.category;

      top.appendChild(name);
      top.appendChild(tag);

      const preview = document.createElement('div');
      preview.className = 'card-preview pyramid-card-preview';
      drawPyramidSvg(item.code, preview, null);

      const desc = document.createElement('p');
      desc.className = 'card-desc';
      desc.textContent = item.description;

      card.appendChild(top);
      card.appendChild(preview);
      card.appendChild(desc);

      card.addEventListener('click', () => {
        inputArea.value = item.code;
        closePyramidModal();
        updatePreview();
      });

      pyramidCardGrid.appendChild(card);
    });
  }
}

if (closePyramidLibraryXBtn) closePyramidLibraryXBtn.addEventListener('click', closePyramidModal);
if (closePyramidLibraryFooterBtn) closePyramidLibraryFooterBtn.addEventListener('click', closePyramidModal);

if (pyramidLibraryModal) {
  pyramidLibraryModal.addEventListener('click', (e) => {
    if (e.target === pyramidLibraryModal) {
      closePyramidModal();
    }
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && pyramidLibraryModal && pyramidLibraryModal.classList.contains('active')) {
    closePyramidModal();
  }
});

if (pyramidSearchInput) {
  pyramidSearchInput.addEventListener('input', renderPyramidCards);
}

pyramidCategoryTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    pyramidCategoryTabs.forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');
    currentPyramidCategory = tab.dataset.category;
    renderPyramidCards();
  });
});

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
// 統合ライブラリトリガー（表・図作成 / 式作成）の制御
// ==========================================
const openDiagramBtn = document.getElementById('open-diagram-btn');
const diagramLibrarySelect = document.getElementById('diagram-library-select');

if (openDiagramBtn) {
  openDiagramBtn.addEventListener('click', () => {
    const val = diagramLibrarySelect ? diagramLibrarySelect.value : 'table';
    switch (val) {
      case 'table':
        if (typeof openTableModal === 'function') openTableModal();
        break;
      case 'matrix':
        if (typeof openMatrixModal === 'function') openMatrixModal();
        break;
      case 'pyramid':
        if (typeof openPyramidModal === 'function') openPyramidModal();
        break;
      case 'flowchart':
        if (typeof openFlowchartModal === 'function') openFlowchartModal();
        break;
      case 'sankey':
        if (typeof openSankeyModal === 'function') openSankeyModal();
        break;
      case 'fsm':
        if (typeof openFsmModal === 'function') openFsmModal();
        break;
      case 'timing':
        if (typeof openTimingModal === 'function') openTimingModal();
        break;
      case 'circuit':
        if (typeof openCircuitModal === 'function') openCircuitModal();
        break;
      default:
        if (typeof openTableModal === 'function') openTableModal();
        break;
    }
  });
}

const openFormulaBtn = document.getElementById('open-formula-btn');
const formulaLibrarySelect = document.getElementById('formula-library-select');

if (openFormulaBtn) {
  openFormulaBtn.addEventListener('click', () => {
    const val = formulaLibrarySelect ? formulaLibrarySelect.value : 'math';
    switch (val) {
      case 'math':
        if (typeof openModal === 'function') openModal();
        break;
      case 'chem-formula':
        if (typeof openChemFormulaModal === 'function') openChemFormulaModal();
        break;
      case 'chem-struct':
      case 'chem':
        if (typeof openChemModal === 'function') openChemModal();
        break;
      case 'feynman':
        if (typeof openFeynmanModal === 'function') openFeynmanModal();
        break;
      default:
        if (typeof openModal === 'function') openModal();
        break;
    }
  });
}

// ==========================================
// 画像ファイル出力モーダルの制御
// ==========================================
const exportModal = document.getElementById('export-modal');
const openExportBtn = document.getElementById('open-export-btn');
const closeExportXBtn = document.getElementById('export-modal-close-x');
const closeExportFooterBtn = document.getElementById('export-modal-close-footer');
const exportSizeSlider = document.getElementById('export-size-slider');
const exportSizeValue = document.getElementById('export-size-value');
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
  const chemSources = previewArea.querySelectorAll('.chem-structure-container');
  const circuitSources = previewArea.querySelectorAll('.circuit-preview-container');
  const timingSources = previewArea.querySelectorAll('.timing-preview-container');
  const fsmSources = previewArea.querySelectorAll('.fsm-preview-container');
  const feynmanSources = previewArea.querySelectorAll('.feynman-preview-container');
  const sankeySources = previewArea.querySelectorAll('.sankey-preview-container');
  const flowchartSources = previewArea.querySelectorAll('.flowchart-preview-container');
  const tableSources = previewArea.querySelectorAll('.table-preview-container');
  const matrixSources = previewArea.querySelectorAll('.matrix-preview-container');
  const pyramidSources = previewArea.querySelectorAll('.pyramid-preview-container');

  if (tableSources.length > 0) {
    tableSources.forEach((tblEl) => {
      exportTarget.appendChild(tblEl.cloneNode(true));
    });
  } else if (matrixSources.length > 0) {
    matrixSources.forEach((matEl) => {
      exportTarget.appendChild(matEl.cloneNode(true));
    });
  } else if (pyramidSources.length > 0) {
    pyramidSources.forEach((pyrEl) => {
      exportTarget.appendChild(pyrEl.cloneNode(true));
    });
  } else if (flowchartSources.length > 0) {
    flowchartSources.forEach((flowEl) => {
      exportTarget.appendChild(flowEl.cloneNode(true));
    });
  } else if (sankeySources.length > 0) {
    sankeySources.forEach((sanEl) => {
      exportTarget.appendChild(sanEl.cloneNode(true));
    });
  } else if (feynmanSources.length > 0) {
    feynmanSources.forEach((feyEl) => {
      exportTarget.appendChild(feyEl.cloneNode(true));
    });
  } else if (fsmSources.length > 0) {
    fsmSources.forEach((fsmEl) => {
      exportTarget.appendChild(fsmEl.cloneNode(true));
    });
  } else if (timingSources.length > 0) {
    timingSources.forEach((timEl) => {
      exportTarget.appendChild(timEl.cloneNode(true));
    });
  } else if (circuitSources.length > 0) {
    circuitSources.forEach((circEl) => {
      exportTarget.appendChild(circEl.cloneNode(true));
    });
  } else if (chemSources.length > 0) {
    chemSources.forEach((chemEl) => {
      exportTarget.appendChild(chemEl.cloneNode(true));
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

  // 表専用オプションの表示/非表示（エクスポート対象に表が含まれる場合のみ表示）
  const hasTable = exportTarget.querySelector('.physi-table') !== null;
  if (exportTableOptions) {
    exportTableOptions.style.display = hasTable ? 'block' : 'none';
  }

  // クローン内のSVGの初期基準寸法を退避
  exportTarget.querySelectorAll('svg').forEach((svg) => {
    const rawW = svg.getAttribute('width') || '';
    const rawH = svg.getAttribute('height') || '';
    let baseW = (!rawW.includes('%') && rawW) ? parseFloat(rawW) : null;
    let baseH = (!rawH.includes('%') && rawH) ? parseFloat(rawH) : null;
    if (!baseW || !baseH) {
      const vb = svg.getAttribute('viewBox');
      if (vb) {
        const parts = vb.trim().split(/\s+/).map(Number);
        if (parts.length === 4) {
          baseW = baseW || parts[2];
          baseH = baseH || parts[3];
        }
      }
    }
    svg.dataset.baseWidth = baseW || 300;
    svg.dataset.baseHeight = baseH || 200;
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

  // 1. 記号・画像サイズ（倍率）の反映
  if (exportSizeSlider && exportSizeValue) {
    const sizePercent = parseInt(exportSizeSlider.value, 10) || 100;
    exportSizeValue.textContent = `${sizePercent}%`;
    const scale = sizePercent / 100;

    // SVG（波形・回路図・化学構造式）の寸法変倍
    exportTarget.querySelectorAll('svg').forEach((svg) => {
      const baseW = parseFloat(svg.dataset.baseWidth);
      const baseH = parseFloat(svg.dataset.baseHeight);
      if (baseW && baseH) {
        svg.setAttribute('width', (baseW * scale).toFixed(1));
        svg.setAttribute('height', (baseH * scale).toFixed(1));
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
    exportTarget.querySelectorAll('.physi-table').forEach((tbl) => {
      tbl.style.fontSize = `${(14 * scale).toFixed(1)}px`;
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
  if (selectedColorMode === 'monochrome') {
    exportTarget.classList.add('monochrome-mode');
    if (exportTableThemeGroup) exportTableThemeGroup.style.display = 'none';
  } else {
    exportTarget.classList.remove('monochrome-mode');
    if (exportTableThemeGroup) exportTableThemeGroup.style.display = 'block';
  }

  // 5. 表（テーブル）専用オプションの反映（セル余白割合 & テーマカラー）
  const tableEl = exportTarget.querySelector('.physi-table');
  if (tableEl) {
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

    // テーマカラーの反映
    const selectedTheme = document.querySelector('input[name="export-table-theme"]:checked')?.value || 'blue';
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
    tableEl.classList.add(`table-theme-${selectedTheme}`);
  }
}

// コントロール変更イベント
if (exportSizeSlider) {
  exportSizeSlider.addEventListener('input', updateExportStyle);
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
