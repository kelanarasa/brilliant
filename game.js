/* =====================================================================
   WHO WANT TO BE A BRILLIANT — game.js (Tahap 1)
   Seluruh logika game: bank soal, hadiah, lifeline, alur, suara.
   Bagian 1–3 adalah logika murni (tanpa DOM) agar mudah diuji dan
   dikembangkan. Bagian 4 dst. mengatur tampilan dan interaksi.
   ===================================================================== */
'use strict';

/* ---------------------------------------------------------------------
   1. KONFIGURASI
   --------------------------------------------------------------------- */
const TOTAL_QUESTIONS = 15;
const QUESTIONS_PER_TIER = 5;           // 5 mudah + 5 sedang + 5 sangat sulit
const PRIZES = [
  100000, 200000, 300000, 500000, 1000000,          // soal 1–5
  2000000, 4000000, 8000000, 16000000, 32000000,    // soal 6–10
  64000000, 125000000, 250000000, 500000000, 1000000000 // soal 11–15
];
const SAFE_INDEXES = [4, 9];            // indeks 0-based: soal ke-5 dan ke-10
const FINAL_INDEX = TOTAL_QUESTIONS - 1;
const FRIEND_ACCURACY = 0.6;            // peluang saran teman benar
const AUDIENCE_CORRECT_LEADS = 0.85;    // peluang penonton memilih benar terbanyak
const REVEAL_DELAY_MS = 1800;           // jeda dramatis sebelum hasil
const LETTERS = ['A', 'B', 'C', 'D'];

/* ---------------------------------------------------------------------
   2. PAKET SOAL (folder soal/)
   Setiap topik = satu file JavaScript di folder soal/ (lihat soal/_template.js).
   File itu mendaftarkan dirinya ke window.PAKET_SOAL, lalu bagian ini
   memeriksa dan merapikannya. Tingkat kesulitan mengikuti nomor soal:
     mudah (soal 1–5), sedang (soal 6–10), sangatSulit (soal 11–15).
   Tiap tingkat butuh minimal 5 soal. Kalau lebih, 5 soal diambil acak
   dan sisanya menjadi cadangan untuk permainan berikutnya.
   --------------------------------------------------------------------- */
const LEVELS = [
  { key: 'mudah',       label: 'Mudah',        tier: 1 },   // soal 1–5
  { key: 'sedang',      label: 'Sedang',       tier: 2 },   // soal 6–10
  { key: 'sangatSulit', label: 'Sangat Sulit', tier: 3 }    // soal 11–15
];

/** Periksa satu soal. Mengembalikan teks masalah, atau null jika soal valid. */
function validateQuestion(q) {
  if (!q || typeof q !== 'object') return 'bukan objek soal';
  if (typeof q.question !== 'string' || !q.question.trim()) return 'pertanyaan (question) kosong';
  if (!Array.isArray(q.options) || q.options.length !== 4) return 'pilihan (options) harus tepat 4';
  if (q.options.some(o => typeof o !== 'string' || !o.trim())) return 'ada pilihan jawaban yang kosong';
  if (!Number.isInteger(q.correctAnswer) || q.correctAnswer < 0 || q.correctAnswer > 3) {
    return 'correctAnswer harus angka 0, 1, 2, atau 3';
  }
  return null;
}

/**
 * Ubah daftar mentah dari file soal/*.js menjadi daftar paket siap pakai.
 * Soal yang salah format dilewati (dicatat di warnings). Paket yang tingkatnya
 * kurang dari `perLevel` soal ditandai ready = false dan tidak bisa dipilih.
 */
function buildPaketList(rawList, perLevel = QUESTIONS_PER_TIER) {
  const list = [];
  const warnings = [];
  const seen = new Set();

  (Array.isArray(rawList) ? rawList : []).forEach((raw, n) => {
    const label = raw && typeof raw.nama === 'string' && raw.nama.trim() ? `"${raw.nama}"` : `ke-${n + 1}`;
    if (!raw || typeof raw.id !== 'string' || !raw.id.trim() ||
        typeof raw.nama !== 'string' || !raw.nama.trim()) {
      warnings.push(`Paket ${label} dilewati: id dan nama wajib diisi.`);
      return;
    }
    if (seen.has(raw.id)) {
      warnings.push(`Paket ${label} dilewati: id "${raw.id}" sudah dipakai paket lain.`);
      return;
    }
    seen.add(raw.id);

    const levels = {};
    const problems = [];
    let total = 0;
    LEVELS.forEach(lv => {
      const src = raw.soal && Array.isArray(raw.soal[lv.key]) ? raw.soal[lv.key] : [];
      levels[lv.key] = [];
      src.forEach((q, i) => {
        const err = validateQuestion(q);
        if (err) {
          warnings.push(`Paket ${label}, tingkat ${lv.label}, soal ke-${i + 1} dilewati: ${err}.`);
          return;
        }
        levels[lv.key].push({
          id: `${raw.id}-${lv.key}-${i + 1}`,
          tier: lv.tier,
          difficulty: lv.key,
          question: q.question.trim(),
          options: q.options.map(o => o.trim()),
          correctAnswer: q.correctAnswer,
          explanation: typeof q.explanation === 'string' ? q.explanation.trim() : ''
        });
      });
      total += levels[lv.key].length;
      if (levels[lv.key].length < perLevel) {
        problems.push(`tingkat ${lv.label} baru ${levels[lv.key].length} soal (butuh ${perLevel})`);
      }
    });

    list.push({
      id: raw.id.trim(),
      nama: raw.nama.trim(),
      deskripsi: typeof raw.deskripsi === 'string' ? raw.deskripsi.trim() : '',
      ikon: typeof raw.ikon === 'string' && raw.ikon.trim() ? raw.ikon.trim() : raw.nama.trim().charAt(0).toUpperCase(),
      levels,
      total,
      ready: problems.length === 0,
      problem: problems.join('; ')
    });
  });
  return { list, warnings };
}

const PAKET = buildPaketList(typeof globalThis !== 'undefined' ? globalThis.PAKET_SOAL : []);

/* ---------------------------------------------------------------------
   2b. BANK SOAL SELEKSI (tentang sekolah)
   Hanya 1 soal yang muncul tiap babak seleksi, dipilih secara acak.
   Jawaban benar ditulis di indeks 0, lalu pilihan diacak otomatis.
   --------------------------------------------------------------------- */
const SELECTION_BANK = [
  { id: 's1', question: 'Di kecamatan apakah SDIT TQ Al-Fajri berada?',
    options: ['Sawangan', 'Bojongsari', 'Limo', 'Cinere'], correctAnswer: 0,
    explanation: 'SDIT TQ Al-Fajri berada di Kecamatan Sawangan.' },
  { id: 's2', question: 'Apa warna baju SDIT TQ Al-Fajri di hari Jumat?',
    options: ['Hijau', 'Merah', 'Kuning', 'Biru'], correctAnswer: 0,
    explanation: 'Di hari Jumat, murid SDIT TQ Al-Fajri memakai baju berwarna hijau.' },
  { id: 's3', question: 'Siapakah kepala sekolah SDIT TQ Al-Fajri?',
    options: ['Ustadzah Mindri', 'Ustadzah Nurul', 'Ustadz Anugrah', 'Ustadzah Mila'], correctAnswer: 0,
    explanation: 'Kepala sekolah SDIT TQ Al-Fajri adalah Ustadzah Mindri.' },
  { id: 's4', question: 'Apa metode tahsin yang kita gunakan?',
    options: ['Metode Ummi', 'Metode Qiroat', 'Metode Tilawah', 'Metode Baru'], correctAnswer: 0,
    explanation: 'Metode tahsin yang digunakan di sekolah kita adalah Metode Ummi.' },
  { id: 's5', question: 'Di manakah ruang Tata Usaha berada?',
    options: ['Gedung A', 'Gedung B', 'Di atas aula', 'Di depan parkiran'], correctAnswer: 0,
    explanation: 'Ruang Tata Usaha berada di Gedung A.' }
];
const SELECTION_SEATS = 10;             // jumlah peserta di babak seleksi

/* ---------------------------------------------------------------------
   3. LOGIKA MURNI (tanpa DOM)
   --------------------------------------------------------------------- */

/** Acak array (Fisher-Yates). Mengembalikan array baru. */
function shuffle(arr, rng = Math.random) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function randInt(min, max, rng = Math.random) {
  return min + Math.floor(rng() * (max - min + 1));
}

/** 1000000 -> "Rp1.000.000" */
function formatRupiah(n) {
  return 'Rp' + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Hadiah yang sudah diamankan, dihitung dari jumlah soal yang dijawab benar.
 * Titik aman baru berlaku SETELAH soal ke-5 / ke-10 dijawab benar.
 */
function securedPrize(correctCount) {
  if (correctCount >= TOTAL_QUESTIONS) return PRIZES[FINAL_INDEX];
  let prize = 0;
  for (const idx of SAFE_INDEXES) {
    if (correctCount > idx) prize = PRIZES[idx];
  }
  return prize;
}

/**
 * Siapkan satu soal untuk dimainkan: acak pilihan jawaban dan simpan
 * indeks jawaban benar yang baru. Kunci jawaban dilacak lewat flag
 * isCorrect pada tiap opsi, bukan lewat posisi.
 */
function prepareQuestion(raw, rng = Math.random) {
  const opts = raw.options.map((text, i) => ({ text, isCorrect: i === raw.correctAnswer }));
  const shuffled = shuffle(opts, rng);
  return Object.assign({}, raw, {
    shuffled,
    correctIndex: shuffled.findIndex(o => o.isCorrect)
  });
}

/**
 * Pilih 15 soal dari satu paket tanpa pengulangan: 5 dari tiap tingkat
 * kesulitan (mudah, sedang, sangat sulit), urut dari mudah ke sulit,
 * urutan di dalam tingkat diacak.
 */
function pickGameQuestions(paket, rng = Math.random) {
  const picked = [];
  LEVELS.forEach(lv => {
    const pool = shuffle(paket.levels[lv.key], rng);
    picked.push(...pool.slice(0, QUESTIONS_PER_TIER));
  });
  return picked.map(q => prepareQuestion(q, rng));
}

/** Pilih 1 soal seleksi secara acak (hindari soal yang sama dengan percobaan sebelumnya). */
function pickSelectionQuestion(excludeId = null, rng = Math.random) {
  let pool = SELECTION_BANK.filter(q => q.id !== excludeId);
  if (pool.length === 0) pool = SELECTION_BANK;
  return prepareQuestion(pool[Math.floor(rng() * pool.length)], rng);
}

/** 50:50 — pilih tepat dua indeks salah untuk disembunyikan. */
function pickFiftyFiftyRemovals(correctIndex, rng = Math.random) {
  const wrong = [0, 1, 2, 3].filter(i => i !== correctIndex);
  return shuffle(wrong, rng).slice(0, 2);
}

/** Bagi `total` menjadi n bilangan bulat acak yang jumlahnya tepat `total`. */
function splitPercent(total, n, rng = Math.random) {
  if (n <= 0) return [];
  const weights = Array.from({ length: n }, () => rng() + 0.2);
  const sum = weights.reduce((a, b) => a + b, 0);
  const raw = weights.map(w => (w / sum) * total);
  const base = raw.map(Math.floor);
  let remainder = total - base.reduce((a, b) => a + b, 0);
  raw.map((v, i) => ({ i, frac: v - Math.floor(v) }))
     .sort((a, b) => b.frac - a.frac)
     .forEach(({ i }) => { if (remainder > 0) { base[i]++; remainder--; } });
  return base;
}

/**
 * Hasil suara penonton. Mengembalikan array 4 angka (A–D) berjumlah 100.
 * Opsi yang disembunyikan 50:50 mendapat 0%.
 * Biasanya jawaban benar unggul, tetapi sesekali opsi salah yang unggul.
 */
function buildAudienceVotes(correctIndex, hidden = [], rng = Math.random) {
  const visible = [0, 1, 2, 3].filter(i => !hidden.includes(i));
  const wrongVisible = visible.filter(i => i !== correctIndex);
  const correctLeads = rng() < AUDIENCE_CORRECT_LEADS || wrongVisible.length === 0;
  const leader = correctLeads
    ? correctIndex
    : wrongVisible[Math.floor(rng() * wrongVisible.length)];
  const others = visible.filter(i => i !== leader);
  const twoOptions = visible.length === 2;

  const votes = [0, 0, 0, 0];
  for (let attempt = 0; attempt < 60; attempt++) {
    const leadPct = twoOptions
      ? (correctLeads ? randInt(58, 88, rng) : randInt(52, 66, rng))
      : (correctLeads ? randInt(42, 78, rng) : randInt(34, 50, rng));
    const parts = splitPercent(100 - leadPct, others.length, rng);
    if (Math.max(...parts) < leadPct) {
      votes[leader] = leadPct;
      others.forEach((idx, k) => { votes[idx] = parts[k]; });
      return votes;
    }
  }
  // Cadangan deterministik (hampir tidak pernah terpakai)
  const leadPct = twoOptions ? 60 : 55;
  const rest = 100 - leadPct;
  const even = Math.floor(rest / others.length);
  votes[leader] = leadPct + (rest - even * others.length);
  others.forEach(idx => { votes[idx] = even; });
  return votes;
}

/**
 * Saran Phone a Friend dengan peluang benar ±60% (FRIEND_ACCURACY).
 * Saran salah hanya memilih dari opsi salah yang masih terlihat.
 */
function getFriendAdvice(correctIndex, hidden = [], rng = Math.random) {
  const visible = [0, 1, 2, 3].filter(i => !hidden.includes(i));
  const wrongVisible = visible.filter(i => i !== correctIndex);
  const gotCorrect = rng() < FRIEND_ACCURACY || wrongVisible.length === 0;
  const suggested = gotCorrect
    ? correctIndex
    : wrongVisible[Math.floor(rng() * wrongVisible.length)];
  // Keyakinan menyesuaikan hasil: saran benar cenderung yakin,
  // saran salah cenderung ragu (tetapi tidak selalu).
  const confidence = gotCorrect
    ? (rng() < 0.6 ? 'high' : 'medium')
    : (rng() < 0.7 ? 'low' : 'medium');
  return { suggested, gotCorrect, confidence };
}

/** Susun kalimat saran sesuai gaya karakter dan tingkat keyakinan. */
function composeFriendText(friend, letter, optionText, confidence, reason, rng = Math.random) {
  const pick = list => list[Math.floor(rng() * list.length)];
  const L = `${letter}. ${optionText}`;
  const why = reason ? `Alasannya: ${reason} ` : '';

  const styles = {
    ayah: {
      high: [
        `Cobadeh kita pikirin baik-baik. Kalo Menurut Ayah, jawaban yang paling masuk akal adalah ${L}. ${why}Ayah cukup yakin, nak.`
      ],
      medium: [
        `Hmmm, setelah Ayah timbang-timbang, Jawaban Ayah lebih ke ${L}. ${why}Tapi Ayah gak 100% yakin, ya.`
      ],
      low: [
        `Waduh, ini agak sulit. Kalau Ayah bandingin semua pilihan, Ayah condong ke ${L}. Tapi Ayah belum bisa memastikan, jadi pertimbangkan juga pendapat kamu sendiri.`
      ]
    },
    ibu: {
      high: [
        `Kalau menurut Ibu, kayanya ${L}, Nak. ${why}Tapi coba pertimbangkan lagi ya supaya kamu lebih yakin.`
      ],
      medium: [
        `Hmm, Kalo kata Ibu jawabannya ${L}. ${why}Ibu lumayan yakin, tapi tetap hati-hati ya, Semangat!.`
      ],
      low: [
        `Aduh, Ibu kurang yakin, Nak. Mungkin ${L}. Tapi jangan cuma percaya sama Ibu, ya. Pikirin lagi baik-baik, Coba Ingat-ingat lagi Pelajarannya.`
      ]
    },
    teman: {
      high: [
        `Wahhh, ini sih aku tau! Udah pasti jawabannya ${L}. ${why}Percaya deh sama aku!`
      ],
      medium: [
        `Hmm, kalo kata aku sih jawabannya ${L} deh. Tapi jangan salahin aku ya kalau jawabannya salah, hehe!`
      ],
      low: [
        `Waduh, aku nggak terlalu paham sama ini soal nih. Hmmmm Tebakan aku sih ${L}. Hehe plisss jangan salahin aku ya kalau salah!`
      ]
    }
  };
  return pick(styles[friend][confidence]);
}

/* ---------------------------------------------------------------------
   4. STATE GAME
   --------------------------------------------------------------------- */
const state = {
  session: 0,            // naik tiap permainan baru (membatalkan timer lama)
  paket: null,           // paket soal yang sedang dimainkan
  questions: [],         // 15 soal terpilih (sudah diacak opsinya)
  currentIndex: 0,       // 0-based
  correctCount: 0,       // jumlah soal dijawab benar
  current: null,         // soal aktif
  selected: null,        // indeks opsi yang dipilih
  hidden: [],            // indeks opsi yang disembunyikan 50:50
  phase: 'idle',         // idle | answering | locking | revealed | over
  busy: false,           // true saat modal lifeline terbuka
  lastCorrect: false,    // hasil jawaban terakhir
  lifelines: { fifty: false, phone: false, audience: false } // true = terpakai
};

/** State babak seleksi (sebelum permainan utama). */
const selection = {
  current: null,     // soal seleksi aktif
  selected: null,    // indeks opsi dipilih
  phase: 'idle',     // idle | answering | locking | revealed
  lastId: null,      // soal terakhir (agar percobaan ulang tidak sama)
  passed: false,     // lolos seleksi?
  mySeat: 0          // nomor kursi pemain (0-based)
};

let els = {};

/* ---------------------------------------------------------------------
   5. SUARA (Web Audio API — tanpa file audio)
   --------------------------------------------------------------------- */
const Sound = {
  ctx: null,
  enabled: true,

  ensure() {
    try {
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        this.ctx = new AC();
      }
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return this.ctx;
    } catch (e) {
      return null;
    }
  },

  tone(freq, dur, opts = {}) {
    if (!this.enabled) return;
    try {
      const ctx = this.ensure();
      if (!ctx) return;
      const { type = 'sine', vol = 0.12, delay = 0, slideTo = null } = opts;
      const t0 = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t0);
      if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.05);
    } catch (e) { /* audio gagal: abaikan, game tetap jalan */ }
  },

  click()   { this.tone(660, 0.07, { type: 'triangle', vol: 0.08 }); },
  lock()    { this.tone(220, 0.18, { type: 'sawtooth', vol: 0.07 });
              this.tone(330, 0.25, { type: 'triangle', vol: 0.08, delay: 0.12 }); },
  ring()    { [0, 0.5].forEach(d => { this.tone(880, 0.16, { vol: 0.07, delay: d });
                                       this.tone(988, 0.16, { vol: 0.07, delay: d + 0.2 }); }); },
  correct() { [523, 659, 784, 1047].forEach((f, i) =>
                this.tone(f, 0.22, { type: 'triangle', vol: 0.11, delay: i * 0.1 })); },
  wrong()   { this.tone(300, 0.35, { type: 'sawtooth', vol: 0.09, slideTo: 140 });
              this.tone(200, 0.45, { type: 'sawtooth', vol: 0.09, delay: 0.25, slideTo: 90 }); },
  safe()    { [523, 659, 784, 1047, 1319].forEach((f, i) =>
                this.tone(f, 0.28, { type: 'triangle', vol: 0.11, delay: i * 0.09 })); },
  win()     { [523, 659, 784, 1047, 784, 1047, 1319, 1568].forEach((f, i) =>
                this.tone(f, 0.3, { type: 'triangle', vol: 0.12, delay: i * 0.13 })); }
};

/* ---------------------------------------------------------------------
   5b. MUSIK LATAR (BGM) + INTRO SOAL — disintesis Web Audio, tanpa file.
   Tiga tingkat ketegangan: soal 1–5, soal 6–10, soal 11–15.
   Tempo, lapisan suara, dan nada naik setiap melewati titik aman.
   --------------------------------------------------------------------- */
const INTRO_INDEXES = [0, 5, 10];       // soal yang diawali intro tegang
function tensionTier(qIndex) { return qIndex >= 10 ? 2 : qIndex >= 5 ? 1 : 0; }

const SynthMusic = {
  master: null,
  timer: null,
  playing: false,
  tier: 0,
  step: 0,
  nextTime: 0,
  base: 0.55,
  _f: 1,
  _tok: 0,
  noise: null,

  TIERS: [
    { bpm: 80,  pad: [0, 7],           padVol: 0.035, bassVol: 0.16, arp: null,                         arpVol: 0,     hat: false, kick: false },
    { bpm: 96,  pad: [0, 7, 15],       padVol: 0.040, bassVol: 0.19, arp: [0, 3, 7, 3],                  arpVol: 0.035, hat: true,  kick: false },
    { bpm: 112, pad: [0, 7, 15, 13],   padVol: 0.045, bassVol: 0.22, arp: [0, 3, 7, 12, 7, 3, 1, 0],     arpVol: 0.045, hat: true,  kick: true  }
  ],
  ROOTS: [55, 55, 43.65, 41.2],         // A1, A1, F1, E1 (progresi minor yang menggantung)

  start(tier) {
    const ctx = Sound.ensure();
    if (!ctx) return;
    this.tier = tier;
    if (this.playing) return;
    this.playing = true;
    this.master = ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(ctx.destination);
    this.step = 0;
    this.nextTime = ctx.currentTime + 0.1;
    this.level(1, 0.4);
    this.timer = setInterval(() => this._tick(), 60);
  },

  setTier(t) { this.tier = t; },

  stop(fade = 0.6) {
    if (!this.playing) return;
    this.playing = false;
    clearInterval(this.timer);
    this.timer = null;
    this._tok++;
    try {
      this.master.gain.setTargetAtTime(0, Sound.ctx.currentTime, fade / 3);
    } catch (e) { /* abaikan */ }
  },

  /** Atur volume relatif (0–1). tc = kecepatan transisi. */
  level(f, tc = 0.15) {
    this._f = f;
    this._tok++;
    this._apply(tc);
  },
  _apply(tc) {
    if (!this.master || !Sound.ctx) return;
    const target = Sound.enabled ? this.base * this._f : 0;
    try { this.master.gain.setTargetAtTime(target, Sound.ctx.currentTime, tc); } catch (e) {}
  },
  /** Kecilkan sementara lalu naik perlahan. */
  duck(f, ms) {
    this.level(f, 0.05);
    const t = this._tok;
    setTimeout(() => { if (t === this._tok && this.playing) this.level(1, 0.5); }, ms);
  },
  refresh() { this._apply(0.05); },

  _tick() {
    const ctx = Sound.ctx;
    if (!ctx || !this.playing) return;
    if (this.nextTime < ctx.currentTime - 0.5) this.nextTime = ctx.currentTime;
    while (this.nextTime < ctx.currentTime + 0.25) {
      this._schedule(this.step, this.nextTime);
      this.nextTime += 60 / this.TIERS[this.tier].bpm / 2;   // satu langkah = not 1/8
      this.step++;
    }
  },

  _voice(freq, t, dur, o = {}) {
    const ctx = Sound.ctx;
    const { type = 'sawtooth', vol = 0.1, lp = 1200, attack = 0.01, detune = 0 } = o;
    const osc = ctx.createOscillator();
    const filt = ctx.createBiquadFilter();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    osc.detune.value = detune;
    filt.type = 'lowpass';
    filt.frequency.value = lp;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(filt).connect(g).connect(this.master);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  },

  _hat(t, vol) {
    const ctx = Sound.ctx;
    if (!this.noise) {
      const len = Math.floor(ctx.sampleRate * 0.25);
      this.noise = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = this.noise.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    const src = ctx.createBufferSource();
    const hp = ctx.createBiquadFilter();
    const g = ctx.createGain();
    src.buffer = this.noise;
    hp.type = 'highpass';
    hp.frequency.value = 7000;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
    src.connect(hp).connect(g).connect(this.master);
    src.start(t);
    src.stop(t + 0.1);
  },

  _kick(t, vol) {
    const ctx = Sound.ctx;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(130, t);
    osc.frequency.exponentialRampToValueAtTime(42, t + 0.14);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    osc.connect(g).connect(this.master);
    osc.start(t);
    osc.stop(t + 0.25);
  },

  _schedule(step, t) {
    if (!Sound.enabled) return;
    const T = this.TIERS[this.tier];
    const eighth = 60 / T.bpm / 2;
    const barStep = step % 8;
    const root = this.ROOTS[Math.floor(step / 8) % 4];
    const semi = s => Math.pow(2, s / 12);

    // Bas berdenyut
    const mult = this.tier >= 2
      ? [1, 1, 2, 1, 1, 2, 1.0595, 1.0595]
      : [1, 1, 2, 1, 1, 2, 1, 1.5];
    this._voice(root * mult[barStep], t, eighth * 0.9, {
      type: 'sawtooth', lp: 380 + this.tier * 120,
      vol: T.bassVol * (barStep === 0 ? 1.25 : 0.85)
    });

    // Pad panjang tiap awal birama (dua lapis sedikit sumbang)
    if (barStep === 0) {
      T.pad.forEach(s => {
        const f = root * 2 * semi(s);
        this._voice(f, t, eighth * 8, { type: 'sawtooth', vol: T.padVol, lp: 700 + this.tier * 250, attack: eighth * 3, detune: -7 });
        this._voice(f, t, eighth * 8, { type: 'sawtooth', vol: T.padVol, lp: 700 + this.tier * 250, attack: eighth * 3, detune: 7 });
      });
    }

    // Arpeggio gelisah (mulai tingkat 2)
    if (T.arp) {
      const s = T.arp[step % T.arp.length];
      this._voice(root * 4 * semi(s), t, eighth * 0.7, { type: 'square', vol: T.arpVol, lp: 1700 });
    }

    // Hi-hat tipis di ketukan lemah
    if (T.hat && barStep % 2 === 1) this._hat(t, 0.035 + this.tier * 0.01);

    // Detak jantung (tingkat 3)
    if (T.kick) {
      if (barStep % 4 === 0) this._kick(t, 0.32);
      else if (barStep % 4 === 3) this._kick(t, 0.16);
    }
  }
};

/* ---------------------------------------------------------------------
   5c. MUSIK MP3 SENDIRI (folder audio/)
   Jika file mp3 tersedia, file itu dipakai. Jika file tidak ada,
   game otomatis memakai suara buatan di atas, jadi tidak pernah senyap/error.
   --------------------------------------------------------------------- */
const AUDIO_DIR = 'audio/';
const AUDIO_FILES = {
  menu:   'main-theme.mp3',                       // menu sampai klik "Naik ke Panggung"
  bgm0:   'bgm-1.mp3',                            // permainan soal 1-5
  bgm1:   'bgm-2.mp3',                            // permainan soal 6-10
  bgm2:   'bgm-3.mp3',                            // permainan soal 11-15
  intro0: 'intro-1.mp3',                          // intro soal 1
  intro1: 'intro-2.mp3',                          // intro soal 6
  intro2: 'intro-3.mp3',                          // intro soal 11
  benar:  'benar.mp3',                            // sfx jawaban benar
  menang: 'menang.mp3'                            // sfx menang
};
// Volume dasar tiap file (0-1). Ubah angka ini jika ada file yang terlalu keras/pelan.
const AUDIO_BASE = {
  menu: 0.6, bgm0: 0.5, bgm1: 0.5, bgm2: 0.5,
  intro0: 0.9, intro1: 0.9, intro2: 0.9, benar: 1, menang: 1
};

const Mp3 = {
  t: {},

  init() {
    if (typeof Audio === 'undefined') return;
    Object.keys(AUDIO_FILES).forEach(name => {
      const el = new Audio();
      el.preload = 'auto';
      el.loop = name === 'menu' || name.indexOf('bgm') === 0;
      const e = { el, missing: false, timer: null, wasPlaying: false };
      el.addEventListener('error', () => { e.missing = true; });
      el.src = AUDIO_DIR + AUDIO_FILES[name];
      this.t[name] = e;
    });
  },

  has(name) { const e = this.t[name]; return !!e && !e.missing; },
  isPlaying(name) { const e = this.t[name]; return !!e && !e.el.paused && !e.el.ended; },
  _target(name, f) { return Sound.enabled ? Math.min(1, (AUDIO_BASE[name] || 1) * f) : 0; },
  _play(el) { const p = el.play(); if (p && p.catch) p.catch(() => {}); },

  _fade(name, target, ms, done) {
    const e = this.t[name];
    clearInterval(e.timer);
    const from = e.el.volume;
    if (ms <= 0 || Math.abs(from - target) < 0.01) {
      e.el.volume = target;
      if (done) done();
      return;
    }
    const t0 = performance.now();
    e.timer = setInterval(() => {
      const k = Math.min(1, (performance.now() - t0) / ms);
      e.el.volume = Math.max(0, Math.min(1, from + (target - from) * k));
      if (k >= 1) { clearInterval(e.timer); if (done) done(); }
    }, 40);
  },

  playLoop(name, f = 1) {
    const e = this.t[name];
    if (!e) return;
    clearInterval(e.timer);
    try { e.el.currentTime = 0; } catch (err) { /* abaikan */ }
    e.el.volume = 0;
    this._play(e.el);
    this._fade(name, this._target(name, f), 500);
  },
  stopLoop(name, sec = 0.6) {
    const e = this.t[name];
    if (!e) return;
    this._fade(name, 0, sec * 1000, () => { e.el.pause(); });
  },
  setLevel(name, f, ms = 150) {
    if (this.t[name]) this._fade(name, this._target(name, f), ms);
  },

  /** Putar sekali dari awal (intro, sfx). Mengembalikan elemen audio atau null. */
  once(name) {
    const e = this.t[name];
    if (!e || e.missing || !Sound.enabled) return null;
    clearInterval(e.timer);
    try { e.el.currentTime = 0; } catch (err) { /* abaikan */ }
    e.el.volume = this._target(name, 1);
    this._play(e.el);
    return e.el;
  },

  pauseAll() {
    Object.keys(this.t).forEach(n => {
      const e = this.t[n];
      e.wasPlaying = !e.el.paused;
      if (e.wasPlaying) e.el.pause();
    });
  },
  resumeAll() {
    Object.keys(this.t).forEach(n => {
      const e = this.t[n];
      if (e.wasPlaying) this._play(e.el);
      e.wasPlaying = false;
    });
  }
};

/** Musik menu (main-theme.mp3): dari halaman pembuka sampai klik "Naik ke Panggung". */
const Menu = {
  on: false,
  start() { if (this.on || !Mp3.has('menu')) return; this.on = true; Mp3.playLoop('menu', 1); },
  stop(sec = 0.8) { if (!this.on) return; this.on = false; Mp3.stopLoop('menu', sec); },
  refresh() { if (this.on) Mp3.setLevel('menu', 1, 50); }
};

/** BGM permainan: memakai mp3 jika ada, jika tidak memakai musik buatan. API sama seperti sebelumnya. */
const Music = {
  mode: null, tier: -1, cur: null, playing: false, _f: 1, _tok: 0,

  start(tier) {
    const name = 'bgm' + tier;
    if (Mp3.has(name)) {
      if (this.mode === 'synth') SynthMusic.stop(0.4);
      if (this.mode === 'mp3' && this.tier === tier) return;
      if (this.mode === 'mp3') Mp3.stopLoop(this.cur, 0.6);
      this.mode = 'mp3'; this.tier = tier; this.cur = name;
      Mp3.playLoop(name, this._f);
    } else {
      if (this.mode === 'mp3') { Mp3.stopLoop(this.cur, 0.6); this.cur = null; }
      this.mode = 'synth'; this.tier = tier;
      SynthMusic.start(tier);
      SynthMusic.setTier(tier);
      if (this._f !== 1) SynthMusic.level(this._f, 0.2);
    }
    this.playing = true;
  },
  setTier() { /* tingkat dipilih lewat start(tier) */ },
  stop(fade = 0.6) {
    if (!this.playing) return;
    this.playing = false;
    this._tok++;
    this._f = 1;
    if (this.mode === 'mp3') Mp3.stopLoop(this.cur, fade); else SynthMusic.stop(fade);
    this.mode = null; this.cur = null; this.tier = -1;
  },
  level(f, tc = 0.15) {
    this._f = f;
    this._tok++;
    if (this.mode === 'mp3') Mp3.setLevel(this.cur, f, tc * 1000);
    else if (this.mode === 'synth') SynthMusic.level(f, tc);
  },
  duck(f, ms) {
    this.level(f, 0.05);
    const t = this._tok;
    setTimeout(() => { if (t === this._tok && this.playing) this.level(1, 0.5); }, ms);
  },
  refresh() {
    if (this.mode === 'mp3') Mp3.setLevel(this.cur, this._f, 50);
    else if (this.mode === 'synth') SynthMusic.refresh();
  }
};

/** Intro tegang sebelum soal 1, 6, dan 11 — makin dramatis tiap tingkat. */
Sound.intro = function (tier) {
  if (!this.enabled) return;
  const motifs = [
    { total: 2.7, hitAt: 1.3, hitDur: 1.3,
      notes: [[220, 0], [261.63, 0.28], [246.94, 0.56], [329.63, 0.84]],
      chord: [110, 164.81, 220, 261.63] },
    { total: 3.2, hitAt: 1.5, hitDur: 1.6,
      notes: [[220, 0], [261.63, 0.2], [329.63, 0.4], [293.66, 0.6], [392, 0.8], [349.23, 1.0]],
      chord: [110, 164.81, 220, 261.63, 329.63] },
    { total: 4.0, hitAt: 1.7, hitDur: 2.1,
      notes: [[220, 0], [233.08, 0.15], [220, 0.3], [261.63, 0.45], [311.13, 0.6],
              [329.63, 0.75], [440, 0.9], [415.3, 1.05], [466.16, 1.2]],
      chord: [110, 164.81, 220, 261.63, 233.08] }
  ];
  const m = motifs[tier] || motifs[0];
  Music.duck(0.1, m.total * 1000);

  // Dentuman rendah + gelombang naik
  this.tone(65, 1.1, { type: 'sine', vol: 0.28, slideTo: 38 });
  this.tone(110, m.hitAt + 0.1, { type: 'sawtooth', vol: 0.045, slideTo: 330 + tier * 110 });

  // Motif nada naik yang gelisah
  m.notes.forEach(([f, d]) => {
    this.tone(f, 0.3, { type: 'triangle', vol: 0.13, delay: 0.1 + d });
    this.tone(f / 2, 0.3, { type: 'sawtooth', vol: 0.035, delay: 0.1 + d });
  });

  // Akor penutup yang menggantung
  this.tone(55, m.hitDur, { type: 'sine', vol: 0.26, delay: m.hitAt, slideTo: 45 });
  m.chord.forEach(f => this.tone(f, m.hitDur, { type: 'sawtooth', vol: 0.05, delay: m.hitAt }));
};

/** SFX bantuan: 50:50 — dua jawaban salah "tersedot" hilang, lalu bunyi konfirmasi. */
Sound.fifty = function () {
  this.tone(900, 0.28, { type: 'sawtooth', vol: 0.07, slideTo: 180 });
  this.tone(700, 0.28, { type: 'sawtooth', vol: 0.07, slideTo: 140, delay: 0.16 });
  this.tone(1319, 0.12, { type: 'triangle', vol: 0.09, delay: 0.5 });
  this.tone(1760, 0.2,  { type: 'triangle', vol: 0.09, delay: 0.62 });
};

/** SFX Phone a Friend: jawaban teman muncul — telepon tersambung lalu denting. */
Sound.friendReveal = function () {
  this.tone(1000, 0.07, { type: 'square', vol: 0.05 });
  this.tone(1250, 0.07, { type: 'square', vol: 0.05, delay: 0.1 });
  this.tone(784, 0.35, { type: 'triangle', vol: 0.1, delay: 0.28 });
  this.tone(988, 0.45, { type: 'triangle', vol: 0.1, delay: 0.4 });
};

/** SFX Ask the Audience: penghitungan suara naik, lalu hasil muncul. */
Sound.audience = function () {
  [0, 1, 2, 3].forEach(i =>
    this.tone(440 + i * 110, 0.12, { type: 'triangle', vol: 0.08, delay: i * 0.12 }));
  for (let i = 0; i < 6; i++)
    this.tone(300 + i * 60, 0.06, { type: 'square', vol: 0.04, delay: 0.55 + i * 0.06 });
  [523.25, 659.25, 783.99].forEach(f =>
    this.tone(f, 0.7, { type: 'triangle', vol: 0.09, delay: 0.95 }));
};

/* ---- Jika ada file mp3, pakai itu untuk intro, jawaban benar, dan menang ---- */
(function () {
  const synthIntro = Sound.intro, synthCorrect = Sound.correct, synthSafe = Sound.safe, synthWin = Sound.win;

  Sound.intro = function (tier) {
    const name = Mp3.has('intro' + tier) ? 'intro' + tier : (Mp3.has('intro0') ? 'intro0' : null);
    if (!name) return synthIntro.call(this, tier);
    const el = Mp3.once(name);
    if (!el) return;
    const ms = isFinite(el.duration) && el.duration > 0 ? el.duration * 1000 : 3500;
    Music.duck(0.12, ms);
  };
  Sound.correct = function () { if (Mp3.has('benar')) Mp3.once('benar'); else synthCorrect.call(this); };
  Sound.safe    = function () { if (Mp3.has('benar')) Mp3.once('benar'); else synthSafe.call(this); };
  Sound.win     = function () {
    if (Mp3.has('menang')) { if (!Mp3.isPlaying('menang')) Mp3.once('menang'); }
    else synthWin.call(this);
  };
})();

/* ---------------------------------------------------------------------
   6. UTILITAS TAMPILAN
   --------------------------------------------------------------------- */
const $ = id => document.getElementById(id);

function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $('screen-' + name).classList.add('active');
  window.scrollTo(0, 0);
}

function openModal(modal) {
  modal.hidden = false;
  requestAnimationFrame(() => modal.classList.add('open'));
  const focusTarget = modal.querySelector('button:not([hidden])');
  if (focusTarget) focusTarget.focus();
}

function closeModal(modal) {
  modal.classList.remove('open');
  modal.hidden = true;
}

let bannerTimer = null;
function showBanner(text, extraClass = '') {
  els.banner.textContent = text;
  els.banner.className = 'banner' + (extraClass ? ' ' + extraClass : '');
  els.banner.hidden = false;
  void els.banner.offsetWidth; // restart animasi
  els.banner.classList.add('show');
  clearTimeout(bannerTimer);
  bannerTimer = setTimeout(() => { els.banner.hidden = true; }, 3200);
}

/** Jalankan fungsi setelah jeda, tetapi batal jika permainan sudah di-reset. */
function later(ms, fn) {
  const sid = state.session;
  setTimeout(() => { if (sid === state.session) fn(); }, ms);
}

/* ---------------------------------------------------------------------
   7. TANGGA HADIAH
   --------------------------------------------------------------------- */
function buildLadder() {
  els.ladder.innerHTML = '';
  for (let i = TOTAL_QUESTIONS - 1; i >= 0; i--) {
    const li = document.createElement('li');
    li.dataset.index = i;
    if (SAFE_INDEXES.includes(i)) li.classList.add('safe');
    if (i === FINAL_INDEX) li.classList.add('final');

    const lvl = document.createElement('span');
    lvl.className = 'lvl';
    lvl.textContent = i + 1;

    const wrap = document.createElement('span');
    wrap.className = 'amt-wrap';
    const amt = document.createElement('span');
    amt.className = 'amt';
    amt.textContent = formatRupiah(PRIZES[i]);
    wrap.appendChild(amt);

    if (SAFE_INDEXES.includes(i) || i === FINAL_INDEX) {
      const tag = document.createElement('span');
      tag.className = 'tag';
      tag.textContent = i === FINAL_INDEX ? 'HADIAH UTAMA' : 'TITIK AMAN';
      wrap.appendChild(tag);
    }
    li.append(lvl, wrap);
    els.ladder.appendChild(li);
  }
}

/** Status tangga mengikuti progres nyata: passed / current / upcoming. */
function updatePrizeLadder(animateIndex = null) {
  els.ladder.querySelectorAll('li').forEach(li => {
    const i = Number(li.dataset.index);
    li.classList.remove('passed', 'current', 'pop');
    if (i < state.correctCount) li.classList.add('passed');
    else if (i === state.currentIndex && state.phase !== 'over') li.classList.add('current');
    if (animateIndex === i) {
      void li.offsetWidth;
      li.classList.add('pop');
    }
  });
  els.ladderSummary.textContent =
    `Soal ${Math.min(state.currentIndex + 1, TOTAL_QUESTIONS)} • ${formatRupiah(PRIZES[Math.min(state.currentIndex, FINAL_INDEX)])}`;
}

/* ---------------------------------------------------------------------
   7b. PILIH TOPIK SOAL (menu utama + jendela pop-up)
   --------------------------------------------------------------------- */
const PAKET_STORAGE_KEY = 'brilliant.paket';

const Paket = {
  list: PAKET.list,
  activeId: null,

  get active() { return this.list.find(p => p.id === this.activeId) || null; },

  /** Pakai paket yang terakhir dipilih (jika masih ada & lengkap), jika tidak paket lengkap pertama. */
  init() {
    let saved = null;
    try { saved = localStorage.getItem(PAKET_STORAGE_KEY); } catch (e) { /* abaikan */ }
    const ok = id => this.list.some(p => p.id === id && p.ready);
    if (saved && ok(saved)) this.activeId = saved;
    else {
      const first = this.list.find(p => p.ready);
      this.activeId = first ? first.id : null;
    }
  },

  choose(id) {
    if (!this.list.some(p => p.id === id && p.ready)) return false;
    this.activeId = id;
    try { localStorage.setItem(PAKET_STORAGE_KEY, id); } catch (e) { /* abaikan */ }
    return true;
  }
};

/** Perbarui tombol topik di menu utama dan status tombol MULAI. */
function renderTopicButton() {
  const p = Paket.active;
  els.topicIkon.textContent = p ? p.ikon : '?';
  els.topicName.textContent = p ? p.nama : (Paket.list.length ? 'Belum ada paket lengkap' : 'Belum ada paket soal');
  els.startBtn.disabled = !p;
}

/** Isi jendela pop-up dengan satu kartu untuk tiap paket. */
function renderPaketModal() {
  els.paketGrid.innerHTML = '';
  if (!Paket.list.length) {
    const p = document.createElement('p');
    p.className = 'modal-text';
    p.textContent = 'Belum ada paket soal. Tambahkan file soal di folder soal/ lalu daftarkan di index.html.';
    els.paketGrid.appendChild(p);
    return;
  }
  Paket.list.forEach(p => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'paket-card' + (p.id === Paket.activeId ? ' active' : '') + (p.ready ? '' : ' locked');
    btn.dataset.paket = p.id;
    btn.disabled = !p.ready;
    btn.setAttribute('aria-pressed', p.id === Paket.activeId ? 'true' : 'false');

    const ikon = document.createElement('span');
    ikon.className = 'paket-ikon';
    ikon.setAttribute('aria-hidden', 'true');
    ikon.textContent = p.ikon;

    const body = document.createElement('span');
    body.className = 'paket-body';
    const nama = document.createElement('span');
    nama.className = 'paket-nama';
    nama.textContent = p.nama;
    const desc = document.createElement('span');
    desc.className = 'paket-desc';
    desc.textContent = p.ready ? (p.deskripsi || `${p.total} soal`) : `Belum lengkap: ${p.problem}.`;
    body.append(nama, desc);

    btn.append(ikon, body);
    if (p.id === Paket.activeId) {
      const tag = document.createElement('span');
      tag.className = 'paket-tag';
      tag.textContent = 'DIPILIH';
      btn.appendChild(tag);
    }
    els.paketGrid.appendChild(btn);
  });
}

function openPaketModal() {
  Sound.click();
  renderPaketModal();
  openModal(els.paketModal);
}

function choosePaket(id) {
  if (!Paket.choose(id)) return;
  Sound.click();
  renderTopicButton();
  closeModal(els.paketModal);
  els.topicBtn.focus();
}

/* ---------------------------------------------------------------------
   8. ALUR PERMAINAN
   --------------------------------------------------------------------- */
function startGame() {
  state.session++;
  Menu.stop(0.8);
  state.paket = Paket.active;
  state.questions = pickGameQuestions(state.paket);
  state.currentIndex = 0;
  state.correctCount = 0;
  state.current = null;
  state.selected = null;
  state.hidden = [];
  state.busy = false;
  state.lastCorrect = false;
  state.lifelines = { fifty: false, phone: false, audience: false };
  state.phase = 'idle';

  // Bersihkan sisa tampilan permainan sebelumnya
  els.confetti.innerHTML = '';
  els.banner.hidden = true;
  [els.phoneModal, els.audienceModal, els.howtoModal, els.safeModal, els.paketModal].forEach(closeModal);

  showScreen('game');
  loadQuestion();
}

function loadQuestion() {
  state.current = state.questions[state.currentIndex];
  state.selected = null;
  state.hidden = [];
  state.busy = false;
  state.phase = 'answering';

  els.qCounter.textContent = `SOAL ${state.currentIndex + 1} DARI ${TOTAL_QUESTIONS}`;
  els.qPrize.textContent = formatRupiah(PRIZES[state.currentIndex]);
  els.safePrize.textContent = formatRupiah(securedPrize(state.correctCount));
  els.questionText.textContent = state.current.question;

  els.resultPanel.hidden = true;
  els.resultPanel.className = 'result-panel';
  els.nextBtn.hidden = true;
  els.lockBtn.hidden = false;
  els.lockBtn.disabled = true;

  renderAnswers();
  updateLifelineButtons();
  updatePrizeLadder();

  // Musik latar: tingkat ketegangan naik di soal 6 dan 11, intro tegang di soal 1, 6, 11
  const tier = tensionTier(state.currentIndex);
  Music.start(tier);
  Music.setTier(tier);
  if (INTRO_INDEXES.includes(state.currentIndex)) {
    Sound.intro(tier);
    const from = state.currentIndex + 1;
    showBanner(`Tingkat ${LEVELS[tier].label} • soal ${from}–${from + QUESTIONS_PER_TIER - 1}`, 'banner-tingkat');
  }

  // Animasi pergantian soal
  [els.questionCard, els.answers].forEach(el => {
    el.classList.remove('enter');
    void el.offsetWidth;
    el.classList.add('enter');
  });
}

function renderAnswers() {
  els.answers.innerHTML = '';
  state.current.shuffled.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'answer';
    btn.dataset.index = i;
    btn.style.setProperty('--i', i);

    const letter = document.createElement('span');
    letter.className = 'answer-letter';
    letter.textContent = LETTERS[i] + ':';
    const text = document.createElement('span');
    text.className = 'answer-text';
    text.textContent = opt.text;

    btn.append(letter, text);
    els.answers.appendChild(btn);
  });
  refreshAnswerStates();
}

/** Sinkronkan kelas tombol jawaban dengan state. */
function refreshAnswerStates() {
  const canPick = state.phase === 'answering' && !state.busy;
  els.answers.querySelectorAll('.answer').forEach(btn => {
    const i = Number(btn.dataset.index);
    const eliminated = state.hidden.includes(i);
    btn.classList.toggle('selected', state.selected === i);
    btn.classList.toggle('eliminated', eliminated);
    btn.disabled = !canPick || eliminated;
    btn.setAttribute('aria-pressed', state.selected === i ? 'true' : 'false');
  });
}

function selectAnswer(index) {
  if (state.phase !== 'answering' || state.busy) return;
  if (state.hidden.includes(index)) return;
  state.selected = index;
  els.lockBtn.disabled = false;
  refreshAnswerStates();
  Sound.click();
}

function lockAnswer() {
  if (state.phase !== 'answering' || state.busy || state.selected === null) return;
  state.phase = 'locking';            // mencegah penguncian ganda
  els.lockBtn.disabled = true;
  refreshAnswerStates();              // semua tombol jawaban nonaktif
  updateLifelineButtons();            // lifeline nonaktif
  const chosen = els.answers.querySelector(`.answer[data-index="${state.selected}"]`);
  if (chosen) chosen.classList.add('locked');
  Sound.lock();
  Music.duck(0.3, REVEAL_DELAY_MS);
  later(REVEAL_DELAY_MS, revealAnswer);
}

function revealAnswer() {
  if (state.phase !== 'locking') return;
  state.phase = 'revealed';
  const q = state.current;
  const isCorrect = state.selected === q.correctIndex;
  state.lastCorrect = isCorrect;
  if (isCorrect) Music.duck(0.35, 1600); else Music.stop(0.3);

  els.answers.querySelectorAll('.answer').forEach(btn => {
    const i = Number(btn.dataset.index);
    btn.classList.remove('locked');
    if (i === q.correctIndex) btn.classList.add('correct');
    else if (i === state.selected) btn.classList.add('wrong');
  });

  const correctOpt = `${LETTERS[q.correctIndex]}. ${q.shuffled[q.correctIndex].text}`;
  els.resultPanel.hidden = false;
  if (isCorrect) {
    state.correctCount++;
    els.resultPanel.className = 'result-panel ok';
    els.resultStatus.textContent = 'JAWABAN BENAR!';
    els.resultExplain.textContent = q.explanation;
    els.safePrize.textContent = formatRupiah(securedPrize(state.correctCount));
    updatePrizeLadder(state.currentIndex);

    const justSafe = SAFE_INDEXES.includes(state.currentIndex);
    const isFinal = state.currentIndex === FINAL_INDEX;
    if (isFinal) {
      Sound.win();
    } else if (justSafe) {
      Sound.safe();
      later(1400, showSafeModal);
    } else {
      Sound.correct();
    }
  } else {
    els.resultPanel.className = 'result-panel bad';
    els.resultStatus.textContent = 'JAWABAN KURANG TEPAT';
    els.resultExplain.textContent = `Jawaban yang benar: ${correctOpt}. ${q.explanation}`;
    Sound.wrong();
  }

  const atSafePoint = isCorrect && SAFE_INDEXES.includes(state.currentIndex);
  els.lockBtn.hidden = true;
  if (atSafePoint) {
    els.nextBtn.hidden = true;        // keputusan lanjut/berhenti diambil lewat jendela titik aman
  } else {
    els.nextBtn.hidden = false;
    els.nextBtn.focus();
  }
}

/** Jendela titik aman: lanjut bermain atau berhenti membawa hadiah. */
function showSafeModal() {
  if (state.phase !== 'revealed') return;
  const prize = formatRupiah(securedPrize(state.correctCount));
  const next = formatRupiah(PRIZES[state.currentIndex + 1]);
  els.safePrizeBig.textContent = prize;
  els.safeText.textContent =
    `Hadiah ${prize} sudah aman dan tidak akan hilang. ` +
    `Kalau kamu lanjut dan jawabanmu salah, kamu tetap membawa pulang ${prize}. ` +
    `Soal berikutnya bernilai ${next}. Mau lanjut atau berhenti sekarang?`;
  Music.level(0.3, 0.2);
  openModal(els.safeModal);
}

function safeContinue() {
  closeModal(els.safeModal);
  goNext();
}

function safeStop() {
  closeModal(els.safeModal);
  endGame(false, true);
}

function goNext() {
  if (state.phase !== 'revealed') return;
  if (!state.lastCorrect) {
    endGame(false);
  } else if (state.currentIndex === FINAL_INDEX) {
    endGame(true);
  } else {
    state.currentIndex++;
    loadQuestion();
  }
}

/* ---------------------------------------------------------------------
   8b. BABAK SELEKSI
   --------------------------------------------------------------------- */
function buildSeats() {
  els.seats.innerHTML = '';
  for (let i = 0; i < SELECTION_SEATS; i++) {
    const li = document.createElement('li');
    li.className = 'seat' + (i === selection.mySeat ? ' me' : '');
    li.style.setProperty('--i', i);
    const num = document.createElement('span');
    num.className = 'seat-num';
    num.textContent = i + 1;
    li.appendChild(num);
    if (i === selection.mySeat) {
      const tag = document.createElement('span');
      tag.className = 'seat-tag';
      tag.textContent = 'KAMU';
      li.appendChild(tag);
    }
    els.seats.appendChild(li);
  }
}

function startSelection() {
  state.session++;
  Music.stop(0.2);
  Menu.start();                    // membatalkan timer dari permainan sebelumnya
  els.confetti.innerHTML = '';
  els.banner.hidden = true;
  [els.phoneModal, els.audienceModal, els.howtoModal, els.safeModal, els.paketModal].forEach(closeModal);

  selection.mySeat = randInt(0, SELECTION_SEATS - 1);
  selection.lastId = null;
  els.selKicker.textContent = 'BABAK SELEKSI';
  els.selTitle.textContent = 'Siapa yang naik ke panggung?';
  els.selInfo.textContent = 'Ada 10 peserta, tetapi hanya 1 yang boleh naik ke panggung. Jawab pertanyaan tentang sekolah ini dengan benar!';
  buildSeats();
  showScreen('select');
  loadSelectionQuestion();
}

function loadSelectionQuestion() {
  selection.current = pickSelectionQuestion(selection.lastId);
  selection.lastId = selection.current.id;
  selection.selected = null;
  selection.passed = false;
  selection.phase = 'answering';

  els.selQuestionText.textContent = selection.current.question;
  els.selResult.hidden = true;
  els.selResult.className = 'result-panel';
  els.selNextBtn.hidden = true;
  els.selLockBtn.hidden = false;
  els.selLockBtn.disabled = true;

  els.selAnswers.innerHTML = '';
  selection.current.shuffled.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'answer';
    btn.dataset.index = i;
    btn.style.setProperty('--i', i);
    const letter = document.createElement('span');
    letter.className = 'answer-letter';
    letter.textContent = LETTERS[i] + ':';
    const text = document.createElement('span');
    text.className = 'answer-text';
    text.textContent = opt.text;
    btn.append(letter, text);
    els.selAnswers.appendChild(btn);
  });
  refreshSelectionAnswers();

  [els.selQuestionCard, els.selAnswers].forEach(el => {
    el.classList.remove('enter');
    void el.offsetWidth;
    el.classList.add('enter');
  });
}

function refreshSelectionAnswers() {
  const canPick = selection.phase === 'answering';
  els.selAnswers.querySelectorAll('.answer').forEach(btn => {
    const i = Number(btn.dataset.index);
    btn.classList.toggle('selected', selection.selected === i);
    btn.disabled = !canPick;
    btn.setAttribute('aria-pressed', selection.selected === i ? 'true' : 'false');
  });
}

function selectSelectionAnswer(index) {
  if (selection.phase !== 'answering') return;
  selection.selected = index;
  els.selLockBtn.disabled = false;
  refreshSelectionAnswers();
  Sound.click();
}

function lockSelectionAnswer() {
  if (selection.phase !== 'answering' || selection.selected === null) return;
  selection.phase = 'locking';
  els.selLockBtn.disabled = true;
  refreshSelectionAnswers();
  const chosen = els.selAnswers.querySelector(`.answer[data-index="${selection.selected}"]`);
  if (chosen) chosen.classList.add('locked');
  Sound.lock();
  later(REVEAL_DELAY_MS, revealSelectionAnswer);
}

function revealSelectionAnswer() {
  if (selection.phase !== 'locking') return;
  selection.phase = 'revealed';
  const q = selection.current;
  const ok = selection.selected === q.correctIndex;
  selection.passed = ok;

  els.selAnswers.querySelectorAll('.answer').forEach(btn => {
    const i = Number(btn.dataset.index);
    btn.classList.remove('locked');
    if (i === q.correctIndex) btn.classList.add('correct');
    else if (i === selection.selected) btn.classList.add('wrong');
  });

  els.selResult.hidden = false;
  els.selLockBtn.hidden = true;
  els.selNextBtn.hidden = false;

  if (ok) {
    els.selResult.className = 'result-panel ok';
    els.selResultStatus.textContent = 'JAWABAN BENAR!';
    els.selResultExplain.textContent = q.explanation;
    els.selKicker.textContent = 'SELAMAT';
    els.selTitle.textContent = 'Anda terpilih untuk melanjutkan kuis!';
    els.selInfo.textContent = `Peserta nomor ${selection.mySeat + 1} naik ke panggung. Semoga beruntung!`;
    els.selNextBtn.textContent = 'NAIK KE PANGGUNG';
    // Peserta lain meredup, kursi pemain menyala
    els.seats.querySelectorAll('.seat').forEach(li => {
      li.classList.add(li.classList.contains('me') ? 'chosen' : 'out');
    });
    Sound.safe();
  } else {
    const correctOpt = `${LETTERS[q.correctIndex]}. ${q.shuffled[q.correctIndex].text}`;
    els.selResult.className = 'result-panel bad';
    els.selResultStatus.textContent = 'BELUM TERPILIH';
    els.selResultExplain.textContent = `Jawaban yang benar: ${correctOpt}. ${q.explanation} Ayo coba lagi dengan pertanyaan lain!`;
    els.selNextBtn.textContent = 'COBA LAGI';
    Sound.wrong();
  }
  els.selNextBtn.focus();
}

function selectionNext() {
  if (selection.phase !== 'revealed') return;
  if (selection.passed) startGame();
  else loadSelectionQuestion();
}

/* ---------------------------------------------------------------------
   9. LIFELINE
   --------------------------------------------------------------------- */
function canUseLifeline(name) {
  return !state.lifelines[name] && state.phase === 'answering' && !state.busy;
}

function updateLifelineButtons() {
  document.querySelectorAll('.lifeline').forEach(btn => {
    const name = btn.dataset.life;
    const used = state.lifelines[name];
    btn.classList.toggle('used', used);
    btn.disabled = used || state.phase !== 'answering' || state.busy;
  });
}

/* ---- 50:50 ---- */
function use5050() {
  if (!canUseLifeline('fifty')) return;
  state.lifelines.fifty = true;
  state.hidden = pickFiftyFiftyRemovals(state.current.correctIndex);
  if (state.hidden.includes(state.selected)) {
    state.selected = null;
    els.lockBtn.disabled = true;
  }
  refreshAnswerStates();
  updateLifelineButtons();
  Sound.fifty();
}

/* ---- Phone a Friend ---- */
const FRIENDS = {
  ayah:  { name: 'Ayah',  initial: 'A' },
  ibu:   { name: 'Ibu',   initial: 'I' },
  teman: { name: 'Teman', initial: 'T' }
};

function usePhoneAFriend() {
  if (!canUseLifeline('phone')) return;
  Sound.click();
  els.phoneChoose.hidden = false;
  els.phoneCall.hidden = true;
  els.phoneModal.dataset.locked = '';
  openModal(els.phoneModal);
}

function chooseFriend(key) {
  if (!FRIENDS[key] || state.lifelines.phone || state.phase !== 'answering') return;
  const friend = FRIENDS[key];

  state.lifelines.phone = true;       // terpakai sejak karakter dipilih
  state.busy = true;
  updateLifelineButtons();
  refreshAnswerStates();

  Music.level(0.25, 0.1);
  els.phoneChoose.hidden = true;
  els.phoneCall.hidden = false;
  els.phoneModal.dataset.locked = 'true'; // tidak bisa ditutup saat menelepon
  els.callAvatar.textContent = friend.initial;
  els.callName.textContent = friend.name;
  els.callStatus.textContent = 'Menghubungi...';
  els.callStatus.classList.add('ringing');
  els.callBubble.hidden = true;
  els.phoneCloseBtn.hidden = true;
  Sound.ring();

  const q = state.current;
  const hiddenNow = state.hidden.slice();
  later(2200, () => {
    const advice = getFriendAdvice(q.correctIndex, hiddenNow);
    // Alasan hanya diberikan untuk saran benar (menggunakan penjelasan soal)
    const reason = advice.gotCorrect && key !== 'teman' ? q.explanation
                 : advice.gotCorrect && advice.confidence === 'high' ? q.explanation
                 : '';
    const text = composeFriendText(
      key, LETTERS[advice.suggested], q.shuffled[advice.suggested].text,
      advice.confidence, reason
    );
    els.callStatus.textContent = 'Tersambung';
    els.callStatus.classList.remove('ringing');
    els.callBubble.textContent = `"${text}"`;
    els.callBubble.hidden = false;
    els.phoneCloseBtn.hidden = false;
    els.phoneModal.dataset.locked = '';
    els.phoneCloseBtn.focus();
    Sound.friendReveal();
  });
}

function closePhoneModal() {
  closeModal(els.phoneModal);
  Music.level(1, 0.3);
  state.busy = false;
  refreshAnswerStates();
  updateLifelineButtons();
}

/* ---- Ask the Audience ---- */
function useAskAudience() {
  if (!canUseLifeline('audience')) return;
  state.lifelines.audience = true;
  state.busy = true;
  updateLifelineButtons();
  refreshAnswerStates();
  Sound.audience();

  Music.level(0.4, 0.1);
  const votes = buildAudienceVotes(state.current.correctIndex, state.hidden);

  els.audienceBars.innerHTML = '';
  const fills = [];
  votes.forEach((pct, i) => {
    const row = document.createElement('div');
    row.className = 'aud-row';
    const label = document.createElement('span');
    label.className = 'aud-letter';
    label.textContent = LETTERS[i];
    const track = document.createElement('div');
    track.className = 'aud-track';
    const fill = document.createElement('div');
    fill.className = 'aud-fill';
    fill.style.width = '0%';
    track.appendChild(fill);
    const value = document.createElement('span');
    value.className = 'aud-pct';
    value.textContent = pct + '%';
    row.append(label, track, value);
    els.audienceBars.appendChild(row);
    fills.push({ fill, pct, delay: i * 120 });
  });

  openModal(els.audienceModal);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    fills.forEach(({ fill, pct, delay }) => {
      fill.style.transitionDelay = delay + 'ms';
      fill.style.width = pct + '%';
    });
  }));
}

function closeAudienceModal() {
  closeModal(els.audienceModal);
  Music.level(1, 0.3);
  state.busy = false;
  refreshAnswerStates();
  updateLifelineButtons();
}

/* ---------------------------------------------------------------------
   10. AKHIR PERMAINAN
   --------------------------------------------------------------------- */
const MOTIVATION = {
  low: [
    'Tidak apa-apa! Setiap pemain hebat pernah salah. Coba lagi, pasti bisa lebih jauh.',
    'Kesalahan adalah cara terbaik untuk belajar. Ayo main lagi dan kejutkan dirimu sendiri!'
  ],
  mid: [
    'Hebat! Kamu sudah melangkah jauh. Sedikit lagi, kamu bisa meraih hadiah yang lebih besar.',
    'Perjalananmu keren sekali! Baca penjelasannya, lalu coba lagi.'
  ],
  high: [
    'Luar biasa! Kamu hampir menjadi Brilliant. Pengetahuanmu sudah sangat kuat!',
    'Hampir sampai puncak! Satu kali lagi, kamu pasti bisa.'
  ]
};

function endGame(won, quit = false) {
  state.phase = 'over';
  Music.stop(0.6);
  updatePrizeLadder();
  const prize = securedPrize(state.correctCount);

  els.endPrize.textContent = formatRupiah(prize);
  els.resultCard.classList.toggle('win', won);
  els.resultCard.classList.toggle('lose', !won);

  if (quit) {
    els.resultCard.classList.remove('lose');
    els.resultCard.classList.add('win');
    els.endKicker.textContent = `Kamu berhenti setelah menjawab ${state.correctCount} soal dengan benar`;
    els.endTitle.textContent = 'KEPUTUSAN YANG BIJAK!';
    els.endDetail.hidden = true;
    els.endMessage.textContent = 'Kamu membawa pulang hadiah titik aman. Mau mencoba meraih hadiah yang lebih besar? Ayo main lagi!';
    Sound.safe();
  } else if (won) {
    els.endKicker.textContent = 'Kamu menjawab semua 15 soal dengan benar';
    els.endTitle.textContent = 'SELAMAT! KAMU MENJADI BRILLIANT!';
    els.endDetail.hidden = true;
    els.endMessage.textContent = 'Pengetahuanmu luar biasa. Kamu layak membawa pulang hadiah tertinggi!';
    launchConfetti();
    Sound.win();
  } else {
    const q = state.current;
    els.endKicker.textContent = 'Permainan selesai';
    els.endTitle.textContent = 'GAME OVER';
    els.endDetail.hidden = false;
    els.endStopped.textContent = `Kamu berhenti di soal ${state.currentIndex + 1} dari ${TOTAL_QUESTIONS}`;
    els.endQuestion.textContent = q.question;
    els.endCorrect.textContent = `Jawaban benar: ${LETTERS[q.correctIndex]}. ${q.shuffled[q.correctIndex].text}`;
    els.endExplain.textContent = q.explanation;
    const level = state.currentIndex < 5 ? 'low' : state.currentIndex < 10 ? 'mid' : 'high';
    const msgs = MOTIVATION[level];
    els.endMessage.textContent = msgs[Math.floor(Math.random() * msgs.length)];
  }

  showScreen('result');
  // Ulang animasi kartu hasil
  els.resultCard.classList.remove('enter');
  void els.resultCard.offsetWidth;
  els.resultCard.classList.add('enter');
}

function launchConfetti() {
  const colors = ['#ffe6a0', '#f6cd62', '#e2a93a', '#ffffff', '#7fb2ff'];
  els.confetti.innerHTML = '';
  for (let i = 0; i < 90; i++) {
    const p = document.createElement('span');
    p.className = 'confetti-piece';
    p.style.left = Math.random() * 100 + '%';
    p.style.background = colors[i % colors.length];
    p.style.animationDelay = (Math.random() * 2.5) + 's';
    p.style.animationDuration = (3 + Math.random() * 3) + 's';
    p.style.setProperty('--drift', (Math.random() * 160 - 80) + 'px');
    p.style.setProperty('--spin', (360 + Math.random() * 720) + 'deg');
    els.confetti.appendChild(p);
  }
}

function restartGame() {
  startSelection();   // setiap permainan baru diawali babak seleksi
}

/* ---------------------------------------------------------------------
   11. INISIALISASI (event listener dipasang SEKALI)
   --------------------------------------------------------------------- */
/** Di HP/tablet: ajak pemain mengaktifkan layar penuh sebelum bermain. */
function setupFsPrompt() {
  const root = document.documentElement;
  const box = $('fsPrompt');
  if (!box || !window.matchMedia('(pointer: coarse)').matches) return;
  if (root.classList.contains('no-fs') || document.fullscreenElement) return;
  box.hidden = false;
  const hide = () => { box.hidden = true; };
  $('fsSkip').addEventListener('click', hide);
  const onFs = () => { if (document.fullscreenElement || document.webkitFullscreenElement) hide(); };
  document.addEventListener('fullscreenchange', onFs);
  document.addEventListener('webkitfullscreenchange', onFs);
}

function init() {
  els = {
    banner: $('banner'),
    qCounter: $('qCounter'), qPrize: $('qPrize'), safePrize: $('safePrize'),
    questionCard: $('questionCard'), questionText: $('questionText'),
    answers: $('answers'),
    resultPanel: $('resultPanel'), resultStatus: $('resultStatus'), resultExplain: $('resultExplain'),
    lockBtn: $('lockBtn'), nextBtn: $('nextBtn'),
    ladder: $('ladder'), ladderPanel: $('ladderPanel'),
    ladderToggle: $('ladderToggle'), ladderSummary: $('ladderSummary'),
    resultCard: $('resultCard'), endKicker: $('endKicker'), endTitle: $('endTitle'),
    endPrize: $('endPrize'), endDetail: $('endDetail'), endStopped: $('endStopped'),
    endQuestion: $('endQuestion'), endCorrect: $('endCorrect'), endExplain: $('endExplain'),
    endMessage: $('endMessage'),
    confetti: $('confetti'),
    howtoModal: $('howtoModal'), phoneModal: $('phoneModal'), audienceModal: $('audienceModal'),
    phoneChoose: $('phoneChoose'), phoneCall: $('phoneCall'),
    callAvatar: $('callAvatar'), callName: $('callName'), callStatus: $('callStatus'),
    callBubble: $('callBubble'), phoneCloseBtn: $('phoneCloseBtn'),
    audienceBars: $('audienceBars'), audienceCloseBtn: $('audienceCloseBtn'),
    soundBtn: $('soundBtn'),
    safeModal: $('safeModal'), safePrizeBig: $('safePrizeBig'), safeText: $('safeText'),
    seats: $('seats'), selKicker: $('selKicker'), selTitle: $('selTitle'), selInfo: $('selInfo'),
    selQuestionCard: $('selQuestionCard'), selQuestionText: $('selQuestionText'),
    selAnswers: $('selAnswers'), selResult: $('selResult'),
    selResultStatus: $('selResultStatus'), selResultExplain: $('selResultExplain'),
    selLockBtn: $('selLockBtn'), selNextBtn: $('selNextBtn'),
    startBtn: $('startBtn'), topicBtn: $('topicBtn'), topicIkon: $('topicIkon'), topicName: $('topicName'),
    paketModal: $('paketModal'), paketGrid: $('paketGrid')
  };

  // Paket soal dari folder soal/
  PAKET.warnings.forEach(w => console.warn('[Paket soal] ' + w));
  Paket.init();
  renderTopicButton();

  buildLadder();

  els.ladderToggle.addEventListener('click', () => {
    const collapsed = els.ladderPanel.classList.toggle('collapsed');
    els.ladderToggle.setAttribute('aria-expanded', String(!collapsed));
  });

  setupFsPrompt();

  // Muat file mp3 dan mulai musik menu pada sentuhan/klik pertama (aturan autoplay browser)
  Mp3.init();
  const kickMenu = () => {
    const s = document.querySelector('.screen.active');
    if (s && (s.id === 'screen-intro' || s.id === 'screen-select')) Menu.start();
  };
  ['pointerdown', 'keydown'].forEach(ev => document.addEventListener(ev, kickMenu, { once: true }));

  // Halaman pembuka
  els.topicBtn.addEventListener('click', openPaketModal);
  els.paketGrid.addEventListener('click', e => {
    const card = e.target.closest('.paket-card');
    if (card) choosePaket(card.dataset.paket);
  });
  $('startBtn').addEventListener('click', () => {
    if (!Paket.active) { openPaketModal(); return; }
    Sound.click();
    startSelection();
  });
  $('howtoBtn').addEventListener('click', () => { Sound.click(); openModal(els.howtoModal); });

  // Permainan (delegasi: satu listener untuk semua tombol jawaban)
  els.answers.addEventListener('click', e => {
    const btn = e.target.closest('.answer');
    if (btn) selectAnswer(Number(btn.dataset.index));
  });
  els.lockBtn.addEventListener('click', lockAnswer);
  els.nextBtn.addEventListener('click', goNext);

  // Babak seleksi
  els.selAnswers.addEventListener('click', e => {
    const btn = e.target.closest('.answer');
    if (btn) selectSelectionAnswer(Number(btn.dataset.index));
  });
  els.selLockBtn.addEventListener('click', lockSelectionAnswer);
  els.selNextBtn.addEventListener('click', selectionNext);

  // Titik aman
  $('safeContinueBtn').addEventListener('click', () => { Sound.click(); safeContinue(); });
  $('safeStopBtn').addEventListener('click', () => { Sound.click(); safeStop(); });

  // Lifeline
  $('ll-fifty').addEventListener('click', use5050);
  $('ll-phone').addEventListener('click', usePhoneAFriend);
  $('ll-audience').addEventListener('click', useAskAudience);

  // Modal Phone a Friend
  document.querySelectorAll('.friend-btn').forEach(btn =>
    btn.addEventListener('click', () => chooseFriend(btn.dataset.friend)));
  els.phoneCloseBtn.addEventListener('click', closePhoneModal);

  // Modal Ask the Audience
  els.audienceCloseBtn.addEventListener('click', closeAudienceModal);

  // Tombol penutup modal umum (Cara Bermain, Batal)
  document.querySelectorAll('[data-close]').forEach(btn =>
    btn.addEventListener('click', () => closeModal($(btn.dataset.close))));

  // Tutup modal dengan Esc (kecuali sedang menelepon / suara penonton)
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (!els.paketModal.hidden) closeModal(els.paketModal);
    else if (!els.howtoModal.hidden) closeModal(els.howtoModal);
    else if (!els.phoneModal.hidden && !els.phoneModal.dataset.locked) {
      if (state.lifelines.phone) { if (!els.phoneCloseBtn.hidden) closePhoneModal(); }
      else closeModal(els.phoneModal);
    } else if (!els.audienceModal.hidden) closeAudienceModal();
  });

  // Hasil akhir
  $('playAgainBtn').addEventListener('click', () => { Sound.click(); restartGame(); });

  // Suara
  els.soundBtn.addEventListener('click', () => {
    Sound.enabled = !Sound.enabled;
    els.soundBtn.textContent = Sound.enabled ? 'Suara: Hidup' : 'Suara: Mati';
    els.soundBtn.setAttribute('aria-pressed', String(Sound.enabled));
    Music.refresh();
    Menu.refresh();
    if (Sound.enabled) Sound.click();
  });
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', init);
}

// Jeda audio saat tab disembunyikan
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) Mp3.pauseAll(); else Mp3.resumeAll();
    const c = Sound.ctx;
    if (!c) return;
    if (document.hidden) c.suspend(); else c.resume();
  });
}

// Ekspor untuk pengujian logika di Node (tidak berpengaruh di browser)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    LEVELS, validateQuestion, buildPaketList, PRIZES, SAFE_INDEXES, TOTAL_QUESTIONS,
    shuffle, formatRupiah, securedPrize, prepareQuestion, pickGameQuestions,
    pickFiftyFiftyRemovals, splitPercent, buildAudienceVotes, getFriendAdvice,
    composeFriendText, SELECTION_BANK, pickSelectionQuestion
  };
}
