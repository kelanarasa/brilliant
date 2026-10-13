/* Uji logika Motion Tennis tanpa browser:  node tests/logic-test.js
   Menguji: SwingDetector (lintasan tangan sintetis), lintasan bola, skor, dan satu
   pertandingan penuh dengan pemain bot. TIDAK menguji kamera/MediaPipe/tampilan. */
const fs = require("fs"), vm = require("vm"), path = require("path"), assert = require("assert");
const code = fs.readFileSync(path.join(__dirname, "..", "game.js"), "utf8");
const ctx = vm.createContext({ console, performance, Math, Object, Array, Number, String, Symbol });
vm.runInContext(code + "\n;globalThis.__api = { SwingDetector, Score, launchBall, advanceBall, newBall, COURT, settings, match, ball, input, startMatch, updateMatch, playerSwing, hooks, currentServer, evaluateContact, player, Rand, PLAYER_Z, PLAYER_MAX_X, rndn, clamp, cpu, input2, isVersus, otherSide, statsOf, mirrorBall, evaluateServeContact, Leaderboard, formatRupiah, parsePrize, cleanName, groupDigits, PRIZE_MAX };", ctx);
const A = ctx.__api;
let pass = 0, fail = 0;
const same = (a, b) => assert.strictEqual(JSON.stringify(a), JSON.stringify(b));
const test = (name, fn) => { try { fn(); pass++; console.log("  ok   " + name); } catch (e) { fail++; console.log("  GAGAL " + name + "\n       " + e.message); } };

/* ---------- Pembuat lintasan tangan sintetis (30 fps, satuan = panjang badan atas) ---------- */
const FPS = 30, DT = 1000 / FPS;
const ease = (u) => u * u * (3 - 2 * u);
const lerp = (a, b, u) => a + (b - a) * u;
/** keyframes: [{t(ms), rx, ry, ex, ey}] -> sampel tiap frame dari 0..total */
function track(kf, total, noise) {
  const out = [];
  for (let t = 0; t <= total; t += DT) {
    let i = 0; while (i < kf.length - 2 && t > kf[i + 1].t) i++;
    const a = kf[i], b = kf[i + 1], u = Math.min(1, Math.max(0, (t - a.t) / (b.t - a.t))), e = ease(u);
    const n = () => (noise ? (Math.random() - 0.5) * 2 * noise : 0);
    out.push({ t: 1000 + t, rx: lerp(a.rx, b.rx, e) + n(), ry: lerp(a.ry, b.ry, e) + n(), ex: lerp(a.ex, b.ex, e) + n(), ey: lerp(a.ey, b.ey, e) + n(), headH: 0.6 });
  }
  return out;
}
const REST = { rx: 0.35, ry: 1.2, ex: 0.3, ey: 0.65 };           // lengan turun (y positif = di bawah bahu)
function run(samples, hand, dir) {
  A.settings.hand = hand || "right"; A.settings.swingDir = dir || "across";
  A.settings.forehandSpeed = 3.2; A.settings.overheadSpeed = 3.0; A.settings.backhandSpeed = 3.6; A.settings.swingCooldown = 550;
  const det = new A.SwingDetector(() => ({ handSign: A.settings.hand === "right" ? 1 : -1, forehandSpeed: A.settings.forehandSpeed, overheadSpeed: A.settings.overheadSpeed, backhandSpeed: A.settings.backhandSpeed, cooldown: A.settings.swingCooldown, swingDir: A.settings.swingDir }));
  const ev = [];
  for (const s of samples) { const e = det.update(s, s.t); if (e) ev.push(e.type); }
  return ev;
}
const mirror = (s) => s.map((x) => Object.assign({}, x, { rx: -x.rx, ex: -x.ex }));

console.log("SwingDetector");
// Forehand tangan kanan: dari kanan-belakang melintang ke kiri, setinggi dada/bahu, ~0,25 detik.
const BACK = { rx: 1.0, ry: 0.3, ex: 0.6, ey: 0.55 }, FWD = { rx: -0.8, ry: 0.4, ex: 0.0, ey: 0.6 };
// persiapan lambat (backswing ~0,5 detik), ayunan maju cepat (~0,25 detik), lalu kembali pelan
const FH = [{ t: 0, ...REST }, { t: 300, ...REST }, { t: 1000, ...BACK }, { t: 1100, ...BACK }, { t: 1350, ...FWD }, { t: 2400, ...REST }, { t: 2700, ...REST }];
test("forehand tangan kanan terdeteksi tepat 1 kali", () => same(run(track(FH, 2700)), ["forehand"]));
test("forehand tetap terdeteksi dengan noise kamera", () => same(run(track(FH, 2700, 0.02)), ["forehand"]));
test("forehand tangan kiri (cermin) terdeteksi", () => same(run(mirror(track(FH, 2700)), "left"), ["forehand"]));
test("ayunan kanan-ke-kiri pada tangan kiri = ke luar badan = backhand (bukan forehand)", () => same(run(track(FH, 2700), "left"), ["backhand"]));
const FH_OUT = [{ t: 0, ...REST }, { t: 300, ...REST }, { t: 1000, ...FWD }, { t: 1100, ...FWD }, { t: 1350, ...BACK }, { t: 2400, ...REST }];
test("ayunan ke luar badan pada mode 'melintang' = backhand, bukan forehand", () => same(run(track(FH_OUT, 2400)), ["backhand"]));
test("backhand tangan kiri (cermin) terdeteksi", () => same(run(mirror(track(FH_OUT, 2400)), "left"), ["backhand"]));
test("backhand tetap terdeteksi dengan noise kamera", () => same(run(track(FH_OUT, 2400, 0.02)), ["backhand"]));
test("mode 'outward': ayunan ke luar = forehand, melintang = backhand", () => {
  same(run(track(FH_OUT, 2400), "right", "outward"), ["forehand"]);
  same(run(track(FH, 2700), "right", "outward"), ["backhand"]);
});
test("mode 'either': kedua arah forehand, backhand mati", () => {
  same(run(track(FH_OUT, 2400), "right", "either"), ["forehand"]);
  same(run(track(FH, 2700), "right", "either"), ["forehand"]);
});
test("ayunan ke luar yang lambat (di bawah ambang backhand) tidak terdeteksi", () => {
  const slow = [{ t: 0, ...REST }, { t: 300, ...REST }, { t: 1000, ...FWD }, { t: 1100, ...FWD }, { t: 2100, ...BACK }, { t: 3000, ...REST }];
  same(run(track(slow, 3000)), []);
});
// Overhead: tangan di atas kepala (ry negatif besar) lalu turun cepat.
const OH = [{ t: 0, ...REST }, { t: 300, rx: 0.2, ry: -1.0, ex: 0.3, ey: -0.5 }, { t: 500, rx: 0.2, ry: -1.0, ex: 0.3, ey: -0.5 },
            { t: 750, rx: -0.1, ry: 0.5, ex: 0.2, ey: 0.3 }, { t: 1500, ...REST }];
test("overhead terdeteksi tepat 1 kali (dan bukan forehand)", () => same(run(track(OH, 1500)), ["overhead"]));
test("overhead tetap terdeteksi dengan noise", () => same(run(track(OH, 1500, 0.02)), ["overhead"]));

console.log("Gerakan yang TIDAK boleh dianggap pukulan");
const RAISE_SLOW = [{ t: 0, ...REST }, { t: 2000, rx: 0.2, ry: -1.0, ex: 0.3, ey: -0.5 }, { t: 3500, rx: 0.2, ry: -1.0, ex: 0.3, ey: -0.5 }];
test("mengangkat tangan perlahan", () => same(run(track(RAISE_SLOW, 3500)), []));
const RAISE_FAST = [{ t: 0, ...REST }, { t: 300, ...REST }, { t: 550, rx: 0.2, ry: -1.0, ex: 0.3, ey: -0.5 }, { t: 1500, rx: 0.2, ry: -1.0, ex: 0.3, ey: -0.5 }];
test("mengangkat tangan cepat (ke atas, bukan turun)", () => same(run(track(RAISE_FAST, 1500)), []));
const LOWER_SLOW = [{ t: 0, rx: 0.2, ry: -1.0, ex: 0.3, ey: -0.5 }, { t: 600, rx: 0.2, ry: -1.0, ex: 0.3, ey: -0.5 }, { t: 3000, ...REST }];
test("menurunkan tangan perlahan dari atas kepala", () => same(run(track(LOWER_SLOW, 3000)), []));
const WAVE = [{ t: 0, ...REST }, { t: 1500, rx: 0.9, ry: 0.2, ex: 0.5, ey: 0.4 }, { t: 3000, rx: -0.6, ry: 0.3, ex: 0.1, ey: 0.5 }];
test("melambai pelan melintang badan", () => same(run(track(WAVE, 3000)), []));
test("diam dengan jitter kamera selama 30 detik", () => {
  const n = []; for (let t = 0; t < 30000; t += DT) n.push({ t: 1000 + t, rx: REST.rx + (Math.random() - 0.5) * 0.06, ry: REST.ry + (Math.random() - 0.5) * 0.06, ex: REST.ex + (Math.random() - 0.5) * 0.06, ey: REST.ey + (Math.random() - 0.5) * 0.06, headH: 0.6 });
  same(run(n), []);
});
test("badan bergeser tanpa ayunan (koordinat relatif bahu tetap)", () => same(run(track([{ t: 0, ...REST }, { t: 2000, ...REST }], 2000)), []));

console.log("Cooldown & satu ayunan = satu pukulan");
const DOUBLE = [{ t: 0, ...REST }, { t: 300, ...REST }, { t: 1000, ...BACK }, { t: 1100, ...BACK }, { t: 1350, ...FWD },
                { t: 1450, ...BACK }, { t: 1600, ...FWD }, { t: 2800, ...REST }];
test("dua ayunan beruntun cepat: hanya satu pukulan", () => same(run(track(DOUBLE, 2800)), ["forehand"]));
const TWO = [{ t: 0, ...REST }, { t: 300, ...REST }, { t: 1000, ...BACK }, { t: 1100, ...BACK }, { t: 1350, ...FWD }, { t: 2400, ...REST }, { t: 2800, ...REST },
             { t: 3500, ...BACK }, { t: 3600, ...BACK }, { t: 3850, ...FWD }, { t: 4900, ...REST }];
test("dua ayunan terpisah jelas: dua pukulan", () => same(run(track(TWO, 4900)), ["forehand", "forehand"]));

console.log("Lintasan bola & aturan");
test("bola mendarat tepat di target dan melewati net", () => {
  const b = A.newBall(); b.x = 0; b.y = 1; b.z = -0.6;
  A.launchBall(b, 2, 18, 1.2);
  let n = 0, landing = null, net = false;
  for (let t = 0; t < 4 && !landing; t += 1 / 120) { const ev = A.advanceBall(b, 1 / 120); if (ev.net) net = true; if (ev.bounce) landing = { x: b.x, z: b.z }; }
  assert(!net, "menyangkut net"); assert(Math.abs(landing.x - 2) < 0.05 && Math.abs(landing.z - 18) < 0.05, JSON.stringify(landing));
});
test("skor: deuce, advantage, game, set pendek, poin setelah selesai diabaikan", () => {
  const s = new A.Score(2); [0, 0, 0, 1, 1, 1].forEach((i) => s.pointWon(i));
  same(s.display().p, ["40", "40"]); assert.strictEqual(s.display().label, "Deuce");
  s.pointWon(0); same(s.display().p, ["Ad", "40"]);
  s.pointWon(1); assert.strictEqual(s.display().label, "Deuce");
  s.pointWon(0); const r = s.pointWon(0); assert(r.gameWon && !r.matchWon); same(s.games, [1, 0]);
  for (let k = 0; k < 4; k++) s.pointWon(0); assert.strictEqual(s.winner, 0);
  const before = JSON.stringify(s.games); s.pointWon(1); assert.strictEqual(JSON.stringify(s.games), before);
});
test("pertandingan penuh dengan bot: selesai, setiap poin dihitung tepat sekali", () => {
  let seed = 7; A.Rand.fn = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  A.settings.difficulty = "normal"; A.settings.gamesToWin = 2; A.settings.hand = "right";
  let calls = 0; A.hooks.onPoint = () => { calls++; }; A.hooks.onOver = () => {};
  A.startMatch();
  let t = 0, last = null, plan = null, swung = false, swungServe = false, serves = 0;
  while (A.match.phase !== "over" && t < 3000) {
    if (A.match.phase === "serving" && A.match.serve.server === "player") {
      if (!A.match.serve.tossed) swungServe = false;
      else if (!swungServe && A.match.phaseT >= A.match.serve.tossAt + 0.55) { swungServe = true; serves++; A.playerSwing("overhead"); }
    }
    if (A.match.phase === "rally" && A.ball.lastHitter === "cpu" && A.ball.shot && A.ball.shot.serve) { /* servis lawan: dibalas seperti biasa */ }
    if (A.match.phase === "rally" && A.ball.lastHitter === "cpu") {
      if (A.ball.shot !== last) { last = A.ball.shot; swung = false; const b = Object.assign({}, A.ball); let bn = 0, px = b.x, py = b.y;
        for (let i = 0; i < 1200; i++) { const ev = A.advanceBall(b, 1 / 120); if (ev.bounce) bn++; if (bn >= 1 && b.z <= A.PLAYER_Z) { px = b.x; py = b.y; break; } }
        plan = { x: px + A.rndn() * 0.4, y: py, jit: A.rndn() * 0.4 }; }
      A.input.moveNorm = A.clamp((plan.x - 0.3) / A.PLAYER_MAX_X, -1, 1);
      if (!swung && A.ball.bounces >= 1 && (A.ball.z - A.ball.vz * 0.1 - A.PLAYER_Z) <= plan.jit + 0.2) { swung = true; A.playerSwing(plan.y > 1.9 ? "overhead" : "forehand"); }
    } else A.input.moveNorm = 0;
    A.updateMatch(1 / 60); t += 1 / 60;
  }
  assert.strictEqual(A.match.phase, "over");
  assert.strictEqual(calls, A.match.stats.points[0] + A.match.stats.points[1]);
  assert(A.match.stats.serves.made > 0, "bot tidak pernah berhasil servis");
});

console.log("Servis & backhand (aturan)");
function freshMatch(games) {
  let seed = 11; A.Rand.fn = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  A.settings.difficulty = "normal"; A.settings.gamesToWin = games || 3; A.settings.hand = "right";
  A.hooks.onPoint = () => {}; A.hooks.onOver = () => {};
  A.startMatch(); A.input.moveNorm = 0;
  while (A.match.phase === "countdown") A.updateMatch(1 / 60);
}
test("pemain servis di game pertama dan servis bergantian tiap game", () => {
  freshMatch(3);
  assert.strictEqual(A.match.serve.server, "player");
  A.match.score.games = [1, 0]; assert.strictEqual(A.currentServer(), "cpu");
  A.match.score.games = [1, 1]; assert.strictEqual(A.currentServer(), "player");
});
function toTossed() { let n = 0; while (!A.match.serve.tossed && n++ < 1000) A.updateMatch(1 / 60); }
test("servis overhead di puncak lemparan: masuk, keras, mendarat di kotak servis lawan", () => {
  freshMatch(3); assert.strictEqual(A.match.phase, "serving"); toTossed();
  while (A.match.phaseT < A.match.serve.tossAt + 0.62 + 0.1) A.updateMatch(1 / 120);   // puncak + kompensasi tunda
  A.playerSwing("overhead");
  A.updateMatch(1 / 60);
  assert.strictEqual(A.match.phase, "rally"); assert.strictEqual(A.ball.lastHitter, "player");
  assert(A.ball.shot.serve && A.ball.shot.type === "overhead");
  const b = Object.assign({}, A.ball); let land = null, net = false;
  for (let t = 0; t < 3 && !land; t += 1 / 240) { const e = A.advanceBall(b, 1 / 240); if (e.net) net = true; if (e.bounce) land = { x: b.x, z: b.z }; }
  assert(!net && land, "servis menyangkut net"); assert(land.z > A.COURT.NET_Z && land.z <= A.COURT.SERVICE_FAR && Math.abs(land.x) <= A.COURT.HALF_W, JSON.stringify(land));
  assert(A.ball.vz > 20, "servis overhead harus keras, vz=" + A.ball.vz);
});
test("servis forehand lebih pelan dari servis overhead", () => {
  const speed = (type) => { freshMatch(3); toTossed(); while (A.match.phaseT < A.match.serve.tossAt + 0.73) A.updateMatch(1 / 120); A.playerSwing(type); A.updateMatch(1 / 60); return A.ball.vz; };
  const o = speed("overhead"), f = speed("forehand");
  assert(f < o * 0.8, "forehand " + f + " vs overhead " + o);
});
test("ayunan terlalu awal (bola masih rendah) tidak jadi servis", () => {
  freshMatch(3); toTossed(); A.playerSwing("overhead"); A.updateMatch(1 / 60);
  assert.strictEqual(A.match.phase, "serving");
});
test("servis gagal: servis kedua, lalu double fault = poin lawan", () => {
  freshMatch(3); toTossed();
  let n = 0; while (A.match.serve.faults < 1 && n++ < 600) A.updateMatch(1 / 60);
  assert.strictEqual(A.match.serve.faults, 1); assert.strictEqual(A.match.phase, "serving"); assert(!A.match.serve.tossed);
  toTossed(); n = 0; while (A.match.phase === "serving" && n++ < 600) A.updateMatch(1 / 60);
  assert.strictEqual(A.match.phase, "pointEnd"); assert.strictEqual(A.match.score.points[1], 1);
  assert.strictEqual(A.match.stats.serves.doubles, 1);
});
test("backhand menjangkau sisi sebaliknya dari forehand", () => {
  freshMatch(3); A.match.phase = "rally"; A.ball.active = true; A.ball.lastHitter = "cpu"; A.ball.bounces = 1;
  A.player.x = 0; A.ball.x = -2.0; A.ball.y = 1; A.ball.z = A.PLAYER_Z; A.ball.vz = 0;      // sisi kiri; tangan kanan
  assert.strictEqual(A.evaluateContact("forehand").ok, false);
  assert.strictEqual(A.evaluateContact("backhand").ok, true);
  A.ball.x = 2.0;
  assert.strictEqual(A.evaluateContact("forehand").ok, true);
  assert.strictEqual(A.evaluateContact("backhand").ok, false);
});
test("backhand: bola dikembalikan ke lawan dan mendarat di dalam lapangan", () => {
  freshMatch(3); A.match.phase = "rally"; A.ball.active = true; A.ball.lastHitter = "cpu"; A.ball.bounces = 1;
  A.player.x = 0; A.ball.x = -1.0; A.ball.y = 1; A.ball.z = A.PLAYER_Z; A.ball.vz = 0; A.ball.vx = 0; A.ball.vy = 0;
  A.playerSwing("backhand");
  assert.strictEqual(A.ball.lastHitter, "player"); assert.strictEqual(A.ball.shot.type, "backhand");
  assert.strictEqual(A.match.stats.hits.backhand, 1);
});


console.log("Mode versus (dua pemain)");
function freshVersus(p2Serves, games) {
  let seed = 23; A.Rand.fn = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  A.settings.mode = "versus"; A.settings.difficulty = "normal"; A.settings.gamesToWin = games || 3; A.settings.hand = "right"; A.settings.hand2 = "right";
  A.hooks.onPoint = () => {}; A.hooks.onOver = () => {};
  A.startMatch(); A.input.moveNorm = 0; A.input2.moveNorm = 0;
  if (p2Serves) A.match.score.games = [1, 0];
  while (A.match.phase === "countdown") A.updateMatch(1 / 60);
}
test("startMatch memakai mode dari pengaturan", () => {
  freshVersus(false); assert.strictEqual(A.match.mode, "versus"); assert(A.isVersus());
  A.settings.mode = "cpu"; A.startMatch(); assert.strictEqual(A.match.mode, "cpu"); assert(!A.isVersus());
});
test("versus: Pemain 2 menjangkau bola di sisi seberang (kontak dicerminkan)", () => {
  freshVersus(false); A.match.phase = "rally"; A.ball.active = true; A.ball.lastHitter = "player"; A.ball.bounces = 1;
  A.cpu.x = 0; A.ball.x = 2.0; A.ball.y = 1; A.ball.z = A.COURT.LEN - A.PLAYER_Z; A.ball.vz = 0; A.ball.vx = 0; A.ball.vy = 0;
  assert.strictEqual(A.evaluateContact("forehand", "cpu").ok, true);      // tangan kanan = sisi kanan layar, sama seperti Pemain 1
  assert.strictEqual(A.evaluateContact("backhand", "cpu").ok, false);
  A.ball.x = -2.0;
  assert.strictEqual(A.evaluateContact("forehand", "cpu").ok, false);
  assert.strictEqual(A.evaluateContact("backhand", "cpu").ok, true);
  assert.strictEqual(A.evaluateContact("forehand", "player").ok, false, "Pemain 1 tidak boleh memukul bola yang terakhir dipukulnya sendiri");
});
test("versus: pukulan Pemain 2 mengarah ke sisi Pemain 1 dan mendarat di dalam lapangan", () => {
  freshVersus(false); A.match.phase = "rally"; A.ball.active = true; A.ball.lastHitter = "player"; A.ball.bounces = 1;
  A.cpu.x = 0; A.ball.x = 1.0; A.ball.y = 1; A.ball.z = A.COURT.LEN - A.PLAYER_Z; A.ball.vz = 0; A.ball.vx = 0; A.ball.vy = 0;
  A.playerSwing("forehand", "cpu");
  assert.strictEqual(A.ball.lastHitter, "cpu"); assert.strictEqual(A.ball.shot.type, "forehand");
  assert(A.ball.vz < 0, "bola harus melaju ke arah Pemain 1, vz=" + A.ball.vz);
  assert.strictEqual(A.match.stats2.hits.forehand, 1); assert.strictEqual(A.match.stats.hits.forehand, 0);
  const b = Object.assign({}, A.ball); let land = null, net = false;
  for (let t = 0; t < 4 && !land; t += 1 / 240) { const e = A.advanceBall(b, 1 / 240); if (e.net) net = true; if (e.bounce) land = { x: b.x, z: b.z }; }
  assert(!net && land, "menyangkut net"); assert(land.z < A.COURT.NET_Z && land.z > 0, JSON.stringify(land));
});
test("versus: Pemain 2 servis (game bergantian), overhead masuk kotak servis Pemain 1", () => {
  freshVersus(true); assert.strictEqual(A.match.phase, "serving"); assert.strictEqual(A.match.serve.server, "cpu");
  let n = 0; while (!A.match.serve.tossed && n++ < 1000) A.updateMatch(1 / 60);
  assert(A.ball.z > A.COURT.LEN - 1.5, "bola harus dilempar di sisi Pemain 2, z=" + A.ball.z);
  while (A.match.phaseT < A.match.serve.tossAt + 0.62 + 0.1) A.updateMatch(1 / 120);
  A.playerSwing("overhead", "cpu"); A.updateMatch(1 / 60);
  assert.strictEqual(A.match.phase, "rally"); assert.strictEqual(A.ball.lastHitter, "cpu");
  assert(A.ball.shot.serve && A.ball.vz < 0);
  const b = Object.assign({}, A.ball); let land = null, net = false;
  for (let t = 0; t < 3 && !land; t += 1 / 240) { const e = A.advanceBall(b, 1 / 240); if (e.net) net = true; if (e.bounce) land = { x: b.x, z: b.z }; }
  assert(!net && land, "servis menyangkut net");
  assert(land.z < A.COURT.NET_Z && land.z >= A.COURT.LEN - A.COURT.SERVICE_FAR - 0.05 && Math.abs(land.x) <= A.COURT.HALF_W, JSON.stringify(land));
  assert.strictEqual(A.match.stats2.serves.made, 1); assert.strictEqual(A.match.stats.serves.made, 0);
});
test("versus: Pemain 1 tidak bisa menservis saat giliran Pemain 2", () => {
  freshVersus(true); let n = 0; while (!A.match.serve.tossed && n++ < 1000) A.updateMatch(1 / 60);
  while (A.match.phaseT < A.match.serve.tossAt + 0.73) A.updateMatch(1 / 120);
  A.playerSwing("overhead", "player"); A.updateMatch(1 / 60);
  assert.strictEqual(A.match.phase, "serving");
});
test("versus: double fault Pemain 2 = poin Pemain 1, dicatat di statistik Pemain 2", () => {
  freshVersus(true); let n = 0; while (!A.match.serve.tossed && n++ < 1000) A.updateMatch(1 / 60);
  n = 0; while (A.match.serve.faults < 1 && n++ < 600) A.updateMatch(1 / 60);
  assert.strictEqual(A.match.serve.faults, 1); assert.strictEqual(A.match.phase, "serving");
  n = 0; while (!A.match.serve.tossed && n++ < 1000) A.updateMatch(1 / 60);
  n = 0; while (A.match.phase === "serving" && n++ < 600) A.updateMatch(1 / 60);
  assert.strictEqual(A.match.phase, "pointEnd"); assert.strictEqual(A.match.score.points[0], 1);
  assert.strictEqual(A.match.stats2.serves.doubles, 1); assert.strictEqual(A.match.stats.serves.doubles, 0);
});
test("versus: pertandingan penuh dengan dua bot, selesai dan setiap poin dihitung sekali", () => {
  freshVersus(false, 2);
  let calls = 0; A.hooks.onPoint = () => { calls++; };
  const zl = (side, b) => (side === "player" ? b.z - b.vz * 0.1 : (A.COURT.LEN - b.z) + b.vz * 0.1);
  const bot = { player: { last: null, plan: null, swung: false, swungServe: false }, cpu: { last: null, plan: null, swung: false, swungServe: false } };
  const inp = { player: A.input, cpu: A.input2 };
  let t = 0;
  while (A.match.phase !== "over" && t < 4000) {
    for (const side of ["player", "cpu"]) {
      const B = bot[side], opp = A.otherSide(side), mir = side === "cpu";
      if (A.match.phase === "serving" && A.match.serve.server === side) {
        if (!A.match.serve.tossed) B.swungServe = false;
        else if (!B.swungServe && A.match.phaseT >= A.match.serve.tossAt + 0.55) { B.swungServe = true; A.playerSwing("overhead", side); }
      }
      if (A.match.phase === "rally" && A.ball.lastHitter === opp) {
        if (A.ball.shot !== B.last) {
          B.last = A.ball.shot; B.swung = false;
          const c = Object.assign({}, A.ball); let bn = 0, px = c.x, py = c.y;
          for (let i = 0; i < 1500; i++) { const ev = A.advanceBall(c, 1 / 120); if (ev.bounce) bn++; if (bn >= 1 && zl(side, c) <= A.PLAYER_Z) { px = c.x; py = c.y; break; } }
          B.plan = { x: px + A.rndn() * 0.4, y: py, jit: A.rndn() * 0.4, skip: A.Rand.fn() < 0.2 };   // bot sesekali sengaja tidak memukul
        }
        inp[side].moveNorm = A.clamp((B.plan.x - 0.3) / A.PLAYER_MAX_X, -1, 1);
        if (!B.swung && !B.plan.skip && A.ball.bounces >= 1 && (zl(side, A.ball) - A.PLAYER_Z) <= B.plan.jit + 0.2) { B.swung = true; A.playerSwing(B.plan.y > 1.9 ? "overhead" : "forehand", side); }
      } else inp[side].moveNorm = 0;
    }
    A.updateMatch(1 / 60); t += 1 / 60;
  }
  assert.strictEqual(A.match.phase, "over", "pertandingan tidak selesai");
  assert.strictEqual(calls, A.match.stats.points[0] + A.match.stats.points[1]);
  assert(A.match.stats.serves.made > 0 && A.match.stats2.serves.made > 0, "kedua pemain harus pernah berhasil servis: " + A.match.stats.serves.made + "/" + A.match.stats2.serves.made);
  const h = (st) => st.hits.forehand + st.hits.overhead + st.hits.backhand;
  assert(h(A.match.stats) > 3 && h(A.match.stats2) > 3, "kedua pemain harus bisa membalas: " + h(A.match.stats) + "/" + h(A.match.stats2));
  assert(A.match.stats.longestRally >= 3, "harus ada reli minimal 3 pukulan, longest=" + A.match.stats.longestRally);
});
test("mode komputer tidak terpengaruh: ayunan Pemain 2 diabaikan", () => {
  A.settings.mode = "cpu"; A.startMatch(); A.input.moveNorm = 0; while (A.match.phase === "countdown") A.updateMatch(1 / 60);
  A.playerSwing("overhead", "cpu"); assert.strictEqual(A.cpu.swing, null); assert.strictEqual(A.match.stats2.swings.overhead, 0);
});
A.settings.mode = "cpu";


console.log("Papan skor (hadiah)");
const LB = A.Leaderboard;
function memStore(init) { const d = Object.assign({}, init || {}); return { d: d, getItem(k) { return k in d ? d[k] : null; }, setItem(k, v) { d[k] = String(v); } }; }
function freshBoard(init) { LB.store = memStore(init); LB.entries = []; LB.nextId = 1; LB.persistOk = true; LB.load(); return LB.store; }
const names = () => LB.sorted().map((e) => e.name).join(",");
test("format Rupiah dengan pemisah ribuan", () => {
  assert.strictEqual(A.formatRupiah(0), "Rp 0"); assert.strictEqual(A.formatRupiah(50000), "Rp 50.000");
  assert.strictEqual(A.formatRupiah(1250000), "Rp 1.250.000"); assert.strictEqual(A.formatRupiah(NaN), "Rp 0"); assert.strictEqual(A.formatRupiah(-5), "Rp 0");
  assert.strictEqual(A.formatRupiah(999), "Rp 999"); assert.strictEqual(A.formatRupiah(1000), "Rp 1.000");
});
test("parsePrize: hanya angka dibaca, nilai ekstrem dibatasi", () => {
  assert.strictEqual(A.parsePrize("50.000"), 50000); assert.strictEqual(A.parsePrize("Rp 1.500"), 1500);
  assert.strictEqual(A.parsePrize(""), 0); assert.strictEqual(A.parsePrize("abc"), 0); assert.strictEqual(A.parsePrize(null), 0);
  assert.strictEqual(A.parsePrize("-200"), 200);
  assert.strictEqual(A.parsePrize("9".repeat(40)), A.PRIZE_MAX);
});
test("cleanName: rapikan spasi, buang karakter kontrol, maksimal 24 karakter, emoji tidak terpotong", () => {
  assert.strictEqual(A.cleanName("  Budi   Santoso \n"), "Budi Santoso");
  assert.strictEqual(A.cleanName("a\u0000b\u0007c"), "a b c");
  assert.strictEqual(A.cleanName("x".repeat(40)).length, 24);
  const e = A.cleanName("\u{1F600}".repeat(30)); assert.strictEqual(Array.from(e).length, 24); assert(!/[\ud800-\udbff](?![\udc00-\udfff])/.test(e), "pasangan surrogate terpotong");
  assert.strictEqual(A.cleanName(null), ""); assert.strictEqual(A.cleanName("   "), "");
});
test("urutan: hadiah terbesar di atas; hadiah sama -> yang paling baru di atas", () => {
  freshBoard();
  LB.add("A", 100); LB.add("B", 300); LB.add("C", 100); LB.add("D", 300); LB.add("E", 200);   // semua tersimpan dalam milidetik yang sama
  assert.strictEqual(names(), "D,B,E,C,A");
  LB.add("F", 300); assert.strictEqual(names(), "F,D,B,E,C,A");
  LB.add("G", 100); assert.strictEqual(names(), "F,D,B,E,G,C,A");
});
test("urutan tetap benar walau jam perangkat mundur", () => {
  freshBoard(); const real = Date.now;
  try { Date.now = () => 2e12; LB.add("Lama", 500); Date.now = () => 1e12; LB.add("Baru", 500); } finally { Date.now = real; }
  assert.strictEqual(names(), "Baru,Lama");
});
test("data tidak valid ditolak (nama kosong, hadiah 0 / negatif / bukan angka)", () => {
  freshBoard();
  assert.strictEqual(LB.add("", 100), null); assert.strictEqual(LB.add("   ", 100), null);
  assert.strictEqual(LB.add("Budi", 0), null); assert.strictEqual(LB.add("Budi", -5), null);
  assert.strictEqual(LB.add("Budi", NaN), null); assert.strictEqual(LB.add("Budi", "abc"), null);
  assert.strictEqual(LB.entries.length, 0);
  const e = LB.add("  Sari  ", 1234.9, "versus"); assert.strictEqual(e.name, "Sari"); assert.strictEqual(e.prize, 1234); assert.strictEqual(e.mode, "versus");
});
test("tersimpan dan terbaca kembali; nomor urut berlanjut sehingga data baru tetap di atas yang sama hadiahnya", () => {
  const st = freshBoard();
  LB.add("A", 100); LB.add("B", 200);
  assert(JSON.parse(st.getItem(LB.KEY)).entries.length === 2);
  LB.entries = []; LB.nextId = 1; LB.load();                    // simulasi buka ulang halaman
  assert.strictEqual(names(), "B,A");
  LB.add("C", 100); assert.strictEqual(names(), "B,C,A");
});
test("dua tab: tambah dari tab lain tidak saling menimpa", () => {
  const st = freshBoard(); LB.add("Tab1", 100);
  const other = JSON.parse(st.getItem(LB.KEY)); other.entries.push({ id: 50, name: "Tab2", prize: 100, at: 1, mode: "cpu" }); st.setItem(LB.KEY, JSON.stringify(other));
  LB.add("Tab1b", 100);
  assert.strictEqual(names(), "Tab1b,Tab2,Tab1");
});
test("data rusak di penyimpanan: mulai kosong tanpa error, lalu bisa dipakai lagi", () => {
  const st = freshBoard({ [LB.KEY]: "{bukan json" }); assert.strictEqual(LB.entries.length, 0);
  const e = LB.add("Budi", 100); assert(e); assert.strictEqual(JSON.parse(st.getItem(LB.KEY)).entries.length, 1);
});
test("data tidak valid disaring saat dibaca", () => {
  freshBoard({ [LB.KEY]: JSON.stringify({ entries: [
    { id: 1, name: "", prize: 5 }, { id: 2, name: "Ok", prize: "x" }, { id: 0, name: "Nol", prize: 5 }, null, 7,
    { id: 3, name: "Bagus", prize: 500, at: 5, mode: "versus" }, { id: 4, name: "  Rapi   Nama ", prize: "700" } ] }) });
  assert.strictEqual(names(), "Rapi Nama,Bagus"); assert.strictEqual(LB.nextId, 5);
});
test("penyimpanan penuh / dilarang: tetap bekerja di memori dan memberi tanda", () => {
  const bad = { getItem() { return null; }, setItem() { throw new Error("quota"); } };
  LB.store = bad; LB.entries = []; LB.nextId = 1; LB.persistOk = true; LB.load();
  const e = LB.add("Budi", 100); assert(e); assert.strictEqual(LB.persistOk, false);
  LB.add("Sari", 100); assert.strictEqual(names(), "Sari,Budi");
  LB.store = null; LB.load(); assert.strictEqual(LB.persistOk, false); assert.strictEqual(names(), "Sari,Budi");
  const thrower = { getItem() { throw new Error("blocked"); }, setItem() {} }; LB.store = thrower; LB.load(); assert.strictEqual(LB.persistOk, false);
});
test("hapus semua mengosongkan papan dan penyimpanan", () => {
  const st = freshBoard(); LB.add("A", 1); LB.add("B", 2); LB.clear();
  assert.strictEqual(LB.entries.length, 0); assert.strictEqual(JSON.parse(st.getItem(LB.KEY)).entries.length, 0);
});
test("batas 200 data: peringkat paling bawah yang dibuang", () => {
  freshBoard(); for (let i = 1; i <= 205; i++) LB.add("P" + i, i * 10);
  assert.strictEqual(LB.entries.length, 200); const top = LB.sorted();
  assert.strictEqual(top[0].name, "P205"); assert.strictEqual(top[199].name, "P6");
});
LB.store = undefined;

console.log("\n" + pass + " lulus, " + fail + " gagal");
process.exit(fail ? 1 : 0);
