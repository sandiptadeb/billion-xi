"use strict";

// ================= CONFIG =================
const SEASONS = ["2016/17", "2017/18", "2018/19", "2019/20", "2020/21", "2021/22", "2022/23", "2023/24", "2024/25", "2025/26"];
const START_YEAR = 2016;
const WINDOWS = [3, 7, 9];                      // transfer windows: 2019/20, 2023/24, 2025/26
const FINAL = SEASONS.length;                   // pseudo-season index for the final valuation
const FINAL_LABEL = "Final valuation (summer 2026)";
const FORMATION = { GK: 1, DEF: 4, MID: 3, FWD: 3 };   // 4-3-3
const POS_ORDER = ["GK", "DEF", "MID", "FWD"];
const POS_NAME = { GK: "Goalkeeper", DEF: "Defender", MID: "Midfielder", FWD: "Forward" };
const BUDGET = 500;           // $m  (= $500 million)
// Signings per season: 2 in 2016/17, then 1 every season → 11 by 2025/26.
// A team's target squad size in season s is the running total (capped at 11), so passes and sales are caught up later.
const PICK_SCHEDULE = [2, 1, 1, 1, 1, 1, 1, 1, 1, 1];
const SQUAD_SIZE = 11;
const POOL_SIZE = 5;
const MAX_SALES = 2;          // per transfer window
const RESERVE_PER_SLOT = 5;   // $m held back for each other open slot so you can't spend everything at once
const PICK_SECONDS = 30;      // timer mode: time a human has to choose a signing before the first affordable player is auto-picked
// Scout mode: a prospect's league, age and avg rating start locked on the signing screen. Each one can be
// unlocked for a fee, paid from the player's cash and tracked as their "scouting bills". Unlocks are
// private to the team that paid. Scout mode has no pick timer.
// The fee rises with each team's total number of unlocks over the whole game:
// unlocks 1–5 cost $10m, 6–10 cost $15m, then each one costs $2m more than the last (17, 19, 21 …).
const scoutPrice = n => (n < 5 ? 10 : n < 10 ? 15 : 15 + 2 * (n - 9));   // n = unlocks already made
const SCOUT_PRICING = "$10m each for your first 5 unlocks, $15m each for the next 5, then $2m more than the last for every further unlock ($17m, $19m …)";
const SCOUT_STATS = { league: "League", age: "Age", rating: "Avg rating" };
// Special scouts (scout mode), fixed price, limited uses per player for the whole game. They add to scouting
// bills but don't move the unlock price ladder.
const SPECIAL_SCOUTS = {
  superstar: { icon: "🌟", name: "Superstar Scout", cost: 20, uses: 1, text: "reveals the valuation trend for the next two seasons" },
  amateur:   { icon: "🧢", name: "Amateur Scout",   cost: 3,  uses: 2, text: "reveals the age as a 3-year range (e.g. 21–23)" },
};
// ---- Destiny cards (scout mode) ----
// Every 3rd season (2018/19, 2021/22, 2024/25), before that season's signings, each participant picks one of
// DESTINY_CHOICES face-down cards. The card is revealed and its effect applied straight away.
// Effects live in team.fx; "next signing" effects are used up by the next player bought.
const DESTINY_SEASONS = [2, 5, 8];
const DESTINY_CHOICES = 3;
const nextWindowAfter = s => WINDOWS.find(w => w > s);
const DESTINY_CARDS = {
  golden:  { icon: "🎟", name: "Golden Ticket",     good: true,  text: "Your next signing costs half price.",
             apply: t => { t.fx.priceMult *= 0.5; } },
  curse:   { icon: "💀", name: "Curse",             good: false, text: "Your next signing costs double the price.",
             apply: t => { t.fx.priceMult *= 2; } },
  flat:    { icon: "🏷", name: "Scouting Day",      good: true,  text: "All unlocks this season cost a flat $5m and don't count towards your scouting price ladder.",
             apply: t => { t.fx.flatScoutSeason = S.season; } },
  star:    { icon: "⭐", name: "Star Billing",      good: true,  text: "Your next signing's value counts ×1.5 when you sell them or at the final valuation.",
             apply: t => { t.fx.boostNext = true; } },
  network: { icon: "🔭", name: "Scouting Network",  good: true,  text: "30% off all scouting costs for the rest of the game.",
             apply: t => { t.fx.scoutDiscount *= 0.7; } },
  agent:   { icon: "😤", name: "Agent Fallout",     good: false, text: "Your next signing costs 10% extra.",
             apply: t => { t.fx.priceMult *= 1.1; } },
  sponsor: { icon: "💰", name: "Sponsor Deal",      good: true,  text: "You get $10m cash.",
             apply: t => { t.budget += 10; } },
  ffp:     { icon: "⚖", name: "FFP Breach",        good: false, text: "Financial Fair Play fine: you lose $10m cash.",
             apply: t => { const loss = Math.min(10, Math.max(0, t.budget)); t.budget -= loss; return loss < 10 ? `You only had ${fmt(loss)} to pay.` : ""; } },
  ban:     { icon: "🚫", name: "Transfer Ban",      good: false, text: "You can't sell any players in the next transfer window.",
             apply: t => { const w = nextWindowAfter(S.season); t.fx.banWindow = w; return w !== undefined ? `Applies to the ${SEASONS[w]} window.` : ""; } },
  injury:  { icon: "🤕", name: "Injury Crisis",     good: false, text: "One random signing of yours loses 15% of their valuation.",
             apply: t => { if (!t.squad.length) return "You have no signings yet, so nobody was hurt."; const x = t.squad[rand(t.squad.length)]; x.injuries = (x.injuries || 0) + 1; return `Signing ${x.tag} (${byId[x.pid].pos}) is injured.`; } },
  leak:    { icon: "📰", name: "Leaked Report",     good: true,  text: "Two random locked stats are revealed for free on your next selection, marked as a leaked report.",
             apply: t => { t.fx.leakNext = true; } },
  poached: { icon: "🕵", name: "Scout Poached",     good: false, text: "Your next signing costs an extra $5m.",
             apply: t => { t.fx.priceAdd += 5; } },
};
const newFx = () => ({ priceMult: 1, priceAdd: 0, boostNext: false, flatScoutSeason: null, scoutDiscount: 1, banWindow: null, leakNext: false });

// Game modes, chosen before the game starts.
const GAME_MODES = {
  timer: { label: "⏱ Timer mode", desc: `You have ${PICK_SECONDS} seconds for each signing. If you don't choose in time, the first player you can afford is signed for you.` },
  scout: { label: "🔭 Scout mode", desc: `No timer. Each prospect's league, age and avg rating are locked. Unlocking costs ${SCOUT_PRICING}, paid from your cash (your scouting bills). Only you see what you unlock.` },
};
const MIN_PARTICIPANTS = 2;
const MAX_PARTICIPANTS = 4;   // limited by how many players the dataset has for 2016/17
const LETTERS = ["A", "B", "C", "D", "E"];
const BOT_NAMES = ["Robo Capital", "Algo Athletic", "Silicon Rovers", "Quant United"];

// Online play (peer-to-peer via PeerJS; its free public server only introduces the browsers to each other)
const PEER_PREFIX = "billion-dollar-xi-v1-";
const PEERJS_URL = "https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js";

const byId = Object.fromEntries(PLAYERS.map(p => [p.id, p]));
const $ = sel => document.querySelector(sel);

// ================= HELPERS =================
const fmt = m => (Math.abs(m) >= 1000 ? `$${(m / 1000).toFixed(2)}bn` : `$${Math.round(m * 10) / 10}m`);
const fmtDelta = d => (d >= 0 ? "+" : "−") + fmt(Math.abs(d));
const pct = (now, base) => (base ? `${now >= base ? "+" : "−"}${Math.abs(Math.round(((now - base) / base) * 100))}%` : "—");
const cls = d => (d > 0 ? "up" : d < 0 ? "down" : "");
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const rand = n => Math.floor(Math.random() * n);
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = rand(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const seasonLabel = s => (s >= FINAL ? "Summer 2026" : SEASONS[s]);
const bySlot = (a, b) => POS_ORDER.indexOf(byId[a.pid].pos) - POS_ORDER.indexOf(byId[b.pid].pos);
const cleanName = (s, fallback) => (String(s || "").replace(/\s+/g, " ").trim().slice(0, 20) || fallback);

function row(pid, s) {
  const r = byId[pid].s[Math.min(s, FINAL - 1)];
  if (!r) return null;
  const [club, lg, value, apps, g, a, cs, rating] = r;
  return { club, league: LEAGUES[lg] || lg, value: s >= FINAL ? byId[pid].now : value, apps, g, a, cs, rating };
}
const age = (pid, s) => START_YEAR + s - byId[pid].born;
const value = pid => row(pid, S.season).value;

// ================= STATE =================
let S = null;     // the game. Lives only on the host (online) or this device (local).
let NET = null;   // online session. Host: {role, peer, code, seats, conns}; guest: {role, peer, conn, code, name, token}
const UI = { tab: "local", hostName: "", joinName: "", joinCode: "", error: "", status: "", gameMode: "timer" };

const T = id => S.teams[id];
const humans = () => S.teams.filter(t => t.type === "human");
const soloHuman = () => { if (S.online) return null; const h = humans(); return h.length === 1 ? h[0] : null; };
const passAndPlay = () => !S.online && humans().length > 1;
const sealed = () => S.phase !== "end";
const isConnected = t => !t.remote || !!(NET && NET.conns && NET.conns.get(t.remote) && NET.conns.get(t.remote).open);
function typeLabel(t) {
  if (t.type === "bot") return `Bot · ${t.diff}`;
  if (!S.online) return "Human";
  return t.remote ? "Online" : "Host";
}

function newGame(entries, online, gameMode) {
  S = {
    online: !!online, hostSeat: online ? 0 : null, gameMode: GAME_MODES[gameMode] ? gameMode : "timer",
    season: 0, phase: "", mode: "signing", roundNo: 0, order: [], turnIdx: 0,
    actor: null, viewer: null, handoff: null, ready: new Set(),
    pool: [], pickPos: null, lastDeal: null, sales: 0, lastSale: null, sellQueue: [], history: [], log: [],
  };
  S.teams = entries.map((e, i) => ({
    id: i, name: e.name, type: e.type, diff: e.diff || "normal", remote: e.remote || null,
    budget: BUDGET, squad: [], sold: [], signings: 0, quota: 0, captain: null,
    fx: newFx(), cards: [], leaked: {},
    specialLeft: { superstar: SPECIAL_SCOUTS.superstar.uses, amateur: SPECIAL_SCOUTS.amateur.uses },
    trends: {}, ageRanges: {},            // special-scout results, keyed "pid:season"   // destiny-card effects, cards drawn, leaked stats ("pid:season:stat")
    scoutBills: 0, scoutCount: 0, scouted: {},   // scouted["pid:season"] = list of unlocked stat keys (scout mode)
  }));
  S.viewer = soloHuman() ? soloHuman().id : null;
  log(`New game (${GAME_MODES[S.gameMode].label}): ${S.teams.map(t => `${t.name} (${typeLabel(t)})`).join(", ")}. Everyone starts with ${fmt(BUDGET)}.`);
  startSeasonSignings();
}

// Squad size each team should reach by the end of season s (2, 3, 4 … 11).
const targetSize = s => Math.min(SQUAD_SIZE, PICK_SCHEDULE.slice(0, s + 1).reduce((a, b) => a + b, 0));
function setQuotas() { S.teams.forEach(t => (t.quota = Math.max(0, targetSize(S.season) - t.squad.length))); }

function startSeasonSignings() {
  S.mode = "signing";
  setQuotas();
  log(`— ${SEASONS[S.season]} signings: ${PICK_SCHEDULE[S.season]} each (squads grow to ${targetSize(S.season)}). —`);
  beginSigningStage();
}

function log(msg) { S.log.unshift({ yr: seasonLabel(S.season), msg }); }

const ownedSet = () => new Set(S.teams.flatMap(t => t.squad.map(x => x.pid)));
const countPos = (team, pos) => team.squad.filter(x => byId[x.pid].pos === pos).length;
const openSlots = team => SQUAD_SIZE - team.squad.length;
// What a signing is worth to its owner: market value adjusted by destiny cards (Star Billing ×1.5, −15% per injury).
const holdMult = x => (x.boost ? 1.5 : 1) * Math.pow(0.85, x.injuries || 0);
const holdVal = x => Math.round(value(x.pid) * holdMult(x) * 10) / 10;
// What this team pays for its next signing (Golden Ticket, Curse, Agent Fallout, Scout Poached).
const priceFor = (team, pid) => Math.round((value(pid) * team.fx.priceMult + team.fx.priceAdd) * 10) / 10;
const squadValue = team => team.squad.reduce((n, x) => n + holdVal(x), 0);
// Captain: picked just before the final reveal. Their value change (final value − price paid) counts twice,
// so the bonus is that change again: positive for a riser, negative for a faller.
const captainOf = team => team.captain && team.squad.find(x => x.pid === team.captain);
const captainBonus = team => { const c = captainOf(team); return c ? holdVal(c) - c.paid : 0; };
const netWorth = team => team.budget + squadValue(team) + captainBonus(team);
const maxSpend = team => team.budget - RESERVE_PER_SLOT * Math.max(0, openSlots(team) - 1);

function randomOpenPos(team) {
  const slots = [];
  POS_ORDER.forEach(p => { for (let i = countPos(team, p); i < FORMATION[p]; i++) slots.push(p); });
  return slots.length ? slots[rand(slots.length)] : null;
}

function drawPool(pos, team) {
  const owned = ownedSet();
  const avail = shuffle(PLAYERS.filter(p => p.pos === pos && p.s[S.season] && !owned.has(p.id)));
  const pool = avail.slice(0, POOL_SIZE);
  const max = maxSpend(team);
  if (pool.length && !pool.some(p => priceFor(team, p.id) <= max)) {   // guarantee one affordable option if any exists
    const cheap = avail.slice(POOL_SIZE).filter(p => priceFor(team, p.id) <= max);
    if (cheap.length) pool[pool.length - 1] = cheap[rand(cheap.length)];
  }
  return pool.map(p => p.id);
}

// Detailed log lines only when a single human plays locally (nobody else can read them).
const privateLog = team => team.type === "human" && soloHuman() === team;

function buy(team, pid) {
  const price = priceFor(team, pid);
  team.budget -= price;
  const tag = `#${++team.signings}`;
  team.squad.push({ pid, paid: price, season: S.season, tag, boost: team.fx.boostNext || undefined });
  team.fx.priceMult = 1; team.fx.priceAdd = 0; team.fx.boostNext = false;     // "next signing" cards are used up
  if (privateLog(team)) log(`You invested ${fmt(price)} in signing ${tag} (${[POS_NAME[byId[pid].pos],
    knowsStat(team, pid, "league") && row(pid, S.season).league, knowsStat(team, pid, "age") && `age ${age(pid, S.season)}`].filter(Boolean).join(", ")}).`);
  else log(`${team.name} signed a ${POS_NAME[byId[pid].pos]}.`);
}

function sell(team, pid) {
  const x = team.squad.find(q => q.pid === pid);
  const price = holdVal(x);
  team.budget += price;
  team.squad = team.squad.filter(q => q.pid !== pid);
  team.sold.push({ ...x, soldFor: price, soldSeason: S.season });
  if (privateLog(team)) log(`You sold signing ${x.tag} (${POS_NAME[byId[pid].pos]}) for ${fmt(price)}: ${fmtDelta(price - x.paid)} (${pct(price, x.paid)}) vs what you paid.`);
  else log(`${team.name} sold a ${POS_NAME[byId[pid].pos]}.`);
  return price;
}

function recordHistory() { S.history.push({ label: seasonLabel(S.season), worth: S.teams.map(netWorth) }); }

// ================= BOT AI =================
// Bots only see what humans see: this season's stats, age and price. They can't see the future.
function growthScore(pid) {
  const r = row(pid, S.season), a = age(pid, S.season);
  const ageF = a <= 20 ? 20 : a <= 23 ? 12 : a <= 26 ? 4 : a <= 29 ? -6 : -16;
  return ageF + (r.rating - 6.9) * 25 + Math.min(r.apps, 30) / 3;
}

function botChoose(team, pool) {
  const max = maxSpend(team);
  const aff = pool.filter(pid => priceFor(team, pid) <= max);
  if (!aff.length) return null;
  if (team.diff === "easy" && Math.random() < 0.5) return aff[rand(aff.length)];
  const target = team.budget / Math.max(1, openSlots(team));
  const w = team.diff === "hard" ? 1.3 : 1;
  const score = pid => {
    const price = priceFor(team, pid);
    let sc = growthScore(pid) * w;
    if (price > target * 1.3) sc -= ((price - target) / target) * 10;
    return sc + Math.random() * 4;
  };
  return aff.sort((a, b) => score(b) - score(a))[0];
}

function botSell(team) {
  if (team.diff === "easy" || isBanned(team)) return;
  const threshold = team.diff === "hard" ? 8 : 9;
  team.squad.map(x => {
    const a = age(x.pid, S.season), gain = (holdVal(x) - x.paid) / x.paid, r = row(x.pid, S.season);
    const s = (a >= 31 ? 10 : a >= 29 ? 5 : 0) + (gain >= 0.5 ? 5 : 0) + (r.rating < 6.8 ? 4 : 0) + (gain <= -0.4 && a >= 27 ? 4 : 0);
    return { pid: x.pid, s };
  }).filter(o => o.s >= threshold).sort((a, b) => b.s - a.s).slice(0, MAX_SALES).forEach(o => sell(team, o.pid));
}

function botTurn(team, pos) {
  team.quota--;
  const pid = botChoose(team, drawPool(pos, team));
  if (pid) buy(team, pid);
  else log(`${team.name} couldn't sign a ${POS_NAME[pos]} and skipped.`);
}

// ================= FLOW =================
// A human's private action (pick / sell). Locally with several humans, a hand-off screen comes first.
function showPrivate(id, phase) {
  S.actor = id;
  if (passAndPlay() && S.viewer !== id) { S.viewer = null; S.handoff = { id, phase }; S.phase = "handoff"; }
  else { if (!S.online) S.viewer = id; S.phase = phase; if (phase === "pick") startPickTimer(); }
  update();
}
function confirmHandoff() {
  S.viewer = S.handoff.id; S.phase = S.handoff.phase; S.handoff = null;
  if (S.phase === "pick") startPickTimer();
  update();
}

// Pick timer (runs on the host / local device only). The clock starts once the picker can see the
// options (after the hand-off screen in pass-and-play). When it runs out, the first affordable player
// in the pool is signed; if none is affordable, the turn is passed.
let pickTimer = null;
function clearPickTimer() { clearTimeout(pickTimer); pickTimer = null; if (S) S.pickDeadline = null; }
function startPickTimer() {
  clearPickTimer();
  if (S.gameMode !== "timer") return;
  const state = S, actor = S.actor;
  S.pickDeadline = Date.now() + PICK_SECONDS * 1000;
  pickTimer = setTimeout(() => {
    pickTimer = null;
    if (S !== state || S.phase !== "pick" || S.actor !== actor) return;
    const t = T(actor), max = maxSpend(t);
    const pid = S.pool.find(p => priceFor(t, p) <= max);
    log(`${t.name} ran out of time${pid ? ": the first available player was signed automatically" : ""}.`);
    humanPick(pid || null, "timeout");
  }, PICK_SECONDS * 1000);
}

// Signings go in rounds: everyone signs once per round, and the first pick rotates each round:
//   2 players: A B | B A | A B …      3 players: A B C | B C A | C A B …
// The rotation carries on across stages. Players with no signings left are skipped.
const hasPick = t => t.quota > 0 && randomOpenPos(t);
function beginSigningStage() { nextRound(); }

function nextRound() {
  S.teams.forEach(t => { if (!hasPick(t)) t.quota = 0; });
  if (!S.teams.some(hasPick)) return endSigningStage();
  const n = S.teams.length, start = S.roundNo++ % n;
  S.order = Array.from({ length: n }, (_, i) => (start + i) % n);
  S.turnIdx = 0;
  nextTurn();
}

function nextTurn() {
  while (S.turnIdx < S.order.length) {
    const t = T(S.order[S.turnIdx++]);
    const pos = t.quota > 0 ? randomOpenPos(t) : null;
    if (!pos) { t.quota = 0; continue; }
    if (t.type === "bot") { botTurn(t, pos); continue; }
    S.pickPos = pos;
    S.pool = drawPool(pos, t);
    if (S.gameMode === "scout" && t.fx.leakNext) applyLeak(t);
    return showPrivate(t.id, "pick");
  }
  nextRound();
}

function humanPick(pid, reason) {
  clearPickTimer();
  const t = T(S.actor);
  t.quota--;
  if (pid) { buy(t, pid); S.lastDeal = { pid }; }
  else {
    S.lastDeal = { skipped: reason };
    log(`${t.name} ${reason === "pass" ? "kept the cash instead of signing" : "couldn't sign anyone and skipped"} a ${POS_NAME[S.pickPos]}.`);
  }
  S.phase = "deal";
  update();
}
function afterDeal() { nextTurn(); }

// ---- Scout mode ----
const scoutKey = (pid, s) => `${pid}:${s}`;
const isUnlocked = (team, pid, stat) => S.gameMode !== "scout" || (team.scouted[scoutKey(pid, S.season)] || []).includes(stat);
// Signed players: a scout-mode stat stays hidden unless the team unlocked it for that player in some season.
const knowsStat = (team, pid, stat) => S.gameMode !== "scout"
  || Object.keys(team.scouted).some(k => k.startsWith(`${pid}:`) && team.scouted[k].includes(stat));
const LOCKED = `<span class="note" title="Not scouted">🔒</span>`;
// Scouting comes out of spendable cash, so it can't eat into the money held back for open slots.
// Scouting Day card: flat $5m this season, outside the ladder. Scouting Network card: 30% off the ladder price.
const flatScout = team => team.fx.flatScoutSeason === S.season;
const scoutCost = team => flatScout(team) ? 5 : Math.round(scoutPrice(team.scoutCount) * team.fx.scoutDiscount * 10) / 10;
const canScout = team => maxSpend(team) >= scoutCost(team);

function scout(team, pid, stat) {
  const key = scoutKey(pid, S.season);
  (team.scouted[key] = team.scouted[key] || []).push(stat);
  const cost = scoutCost(team);
  team.budget -= cost;
  team.scoutBills += cost;
  if (!flatScout(team)) team.scoutCount++;                 // Scouting Day unlocks don't move the price ladder
  if (privateLog(team)) log(`You paid ${fmt(cost)} to scout a prospect's ${SCOUT_STATS[stat].toLowerCase()} (scouting bills: ${fmt(team.scoutBills)}).`);
}

// ---- Special scouts ----
const canSpecial = (team, kind) => team.specialLeft[kind] > 0 && maxSpend(team) >= SPECIAL_SCOUTS[kind].cost;

// Direction of the market value over the next two seasons (the last step may be the final 2026 valuation).
function valueTrend(pid) {
  const out = [];
  let prev = row(pid, S.season).value;
  for (let s = S.season + 1; s <= Math.min(S.season + 2, FINAL); s++) {
    const v = row(pid, s).value, ch = prev ? (v - prev) / prev : 0;
    const dir = ch >= 0.25 ? ["📈📈", "Big rise", "up"] : ch >= 0.05 ? ["📈", "Rising", "up"] : ch > -0.05 ? ["➖", "Stable", ""]
      : ch > -0.25 ? ["📉", "Falling", "down"] : ["📉📉", "Big fall", "down"];
    out.push({ when: s >= FINAL ? "Summer 2026" : SEASONS[s], icon: dir[0], label: dir[1], cls: dir[2] });
    prev = v;
  }
  return out;
}

function specialScout(team, pid, kind) {
  const sc = SPECIAL_SCOUTS[kind], key = scoutKey(pid, S.season);
  team.specialLeft[kind]--;
  team.budget -= sc.cost;
  team.scoutBills += sc.cost;
  if (kind === "superstar") team.trends[key] = valueTrend(pid);
  else { const lo = age(pid, S.season) - rand(3); team.ageRanges[key] = [lo, lo + 2]; }
  if (privateLog(team)) log(`You hired the ${sc.name} for ${fmt(sc.cost)} (scouting bills: ${fmt(team.scoutBills)}).`);
}

// Leaked Report card: reveal two random locked stats in this pool for free.
function applyLeak(team) {
  team.fx.leakNext = false;
  const locked = [];
  S.pool.forEach(pid => Object.keys(SCOUT_STATS).forEach(stat => { if (!isUnlocked(team, pid, stat)) locked.push([pid, stat]); }));
  shuffle(locked).slice(0, 2).forEach(([pid, stat]) => {
    const key = scoutKey(pid, S.season);
    (team.scouted[key] = team.scouted[key] || []).push(stat);
    team.leaked[`${key}:${stat}`] = true;
  });
}

// Transfer Ban card: no sales in the banned window.
const isBanned = team => team.fx.banWindow === S.season && S.mode === "window";

// ---- Destiny cards ----
function applyCard(team, id) {
  const card = DESTINY_CARDS[id];
  const extra = card.apply(team) || "";
  team.cards.push({ id, season: S.season });
  return extra;
}
function startDestiny() {
  S.destinyDone = S.season;
  S.mode = "destiny";
  log(`— 🃏 Destiny cards: everyone draws one of ${DESTINY_CHOICES} face-down cards. —`);
  S.teams.filter(t => t.type === "bot").forEach(t => { const id = shuffle(Object.keys(DESTINY_CARDS))[0]; applyCard(t, id); logCard(t, id); });
  S.destinyQueue = humans().map(t => t.id);
  nextDestiny();
}
function nextDestiny() {
  if (!S.destinyQueue.length) { S.destiny = null; return afterReport(); }
  S.destiny = { cards: shuffle(Object.keys(DESTINY_CARDS)).slice(0, DESTINY_CHOICES), picked: null, extra: "" };
  showPrivate(S.destinyQueue[0], "destiny");
}
function pickDestiny(team, i) {
  S.destiny.picked = i;
  S.destiny.extra = applyCard(team, S.destiny.cards[i]);
  logCard(team, S.destiny.cards[i]);
  if (privateLog(team) && S.destiny.extra) log(S.destiny.extra);    // e.g. which signing got injured stays private
}
// Destiny draws are public: everyone sees which card each participant drew.
function logCard(team, id) {
  const c = DESTINY_CARDS[id];
  log(`🃏 ${team.name} drew ${c.icon} ${c.name}: ${c.text}`);
}
function doneDestiny() { S.destinyQueue.shift(); nextDestiny(); }

// Effects still waiting to be used, for the player's own panel and signing screen.
function pendingEffects(team) {
  const fx = team.fx, out = [];
  if (fx.priceMult !== 1) out.push(`Next signing price ×${Math.round(fx.priceMult * 100) / 100}`);
  if (fx.priceAdd) out.push(`Next signing +${fmt(fx.priceAdd)}`);
  if (fx.boostNext) out.push("⭐ Next signing counts ×1.5");
  if (fx.leakNext) out.push("📰 Leaked report on your next selection");
  if (fx.flatScoutSeason === S.season && S.mode !== "window") out.push("🏷 Unlocks cost a flat $5m this season");
  if (fx.scoutDiscount !== 1) out.push(`🔭 Scouting ${Math.round((1 - fx.scoutDiscount) * 100)}% off`);
  if (fx.banWindow !== null && fx.banWindow !== undefined && fx.banWindow >= S.season) out.push(`🚫 Transfer ban: ${SEASONS[fx.banWindow]} window`);
  return out;
}

function endSigningStage() {
  S.actor = null;
  if (S.season === 0) recordHistory();
  if (S.season === FINAL - 1) startCaptains();
  else advanceSeason();
}

// ---- Captain pick (after the last signings, before the final reveal) ----
function botCaptain(team) {
  if (!team.squad.length) return;
  const pick = team.diff === "easy" ? team.squad[rand(team.squad.length)]
    : team.squad.slice().sort((a, b) => team.diff === "hard"
        ? (holdVal(b) - b.paid) / b.paid - (holdVal(a) - a.paid) / a.paid         // hard bots read the market
        : row(b.pid, S.season).rating - row(a.pid, S.season).rating)[0];        // normal bots go on form
  team.captain = pick.pid;
}
function startCaptains() {
  S.mode = "captain";
  log("— Captain pick: each captain's value change counts double at the final valuation. —");
  S.teams.filter(t => t.type === "bot").forEach(botCaptain);
  S.captainQueue = humans().filter(t => t.squad.length).map(t => t.id);
  nextCaptain();
}
function nextCaptain() {
  if (!S.captainQueue.length) return finish();
  showPrivate(S.captainQueue[0], "captain");
}
function doneCaptain() { S.captainQueue.shift(); nextCaptain(); }

function advanceSeason() {
  S.season++;
  recordHistory();
  log(`— ${SEASONS[S.season]} season played. —`);
  S.actor = null;
  S.ready = new Set();
  if (!S.online) S.viewer = soloHuman() ? soloHuman().id : null;
  S.phase = "report";
  update();
}

function afterReport() {
  if (S.gameMode === "scout" && DESTINY_SEASONS.includes(S.season) && S.destinyDone !== S.season) return startDestiny();
  if (WINDOWS.includes(S.season)) openWindow();
  else startSeasonSignings();
}

// Online: everyone presses "Ready" on the season review; the game moves on when all humans are ready.
function checkReady() {
  if (humans().every(t => S.ready.has(t.id))) afterReport();
  else update();
}

function openWindow() {
  S.mode = "window";
  log(`— Transfer window ${SEASONS[S.season]} opens. —`);
  S.teams.filter(t => t.type === "bot").forEach(botSell);
  S.sellQueue = humans().map(t => t.id);
  nextSeller();
}

function nextSeller() {
  if (!S.sellQueue.length) {
    setQuotas();                          // this season's signing(s) plus a replacement for every player sold
    return beginSigningStage();
  }
  S.sales = 0; S.lastSale = null;
  showPrivate(S.sellQueue[0], "sell");
}
function doneSelling() { S.sellQueue.shift(); nextSeller(); }

function finish() {
  S.season = FINAL;
  S.actor = null;
  recordHistory();
  log(`— ${FINAL_LABEL}. —`);
  S.phase = "end";
  S.revealPos = {};                     // how far each viewer has stepped through the player-by-player reveal
  update();
}

// ---- Final reveal, one player at a time ----
// Online every human steps through their own squad; on one device everyone watches each human's squad in turn.
// Until a viewer finishes (or skips), standings and values stay hidden on their screen.
const revealKey = me => (S.online ? me : "local");
function revealList(me) {
  const teams = S.online ? (me !== null && me !== undefined && T(me).type === "human" ? [T(me)] : []) : humans();
  return teams.flatMap(t => t.squad.slice().sort(bySlot).map(x => ({ t, x })));
}
const revealing = me => S.phase === "end" && (S.revealPos[revealKey(me)] || 0) < revealList(me).length;

// Host only: a disconnected online player's seat is handed to a bot so the game can continue.
function botTakeover(id) {
  const t = S.teams[id];
  if (!t || t.type !== "human" || !t.remote) return;
  t.type = "bot"; t.diff = "normal"; t.remote = null;
  log(`${t.name}'s seat is now played by a bot.`);
  if (S.actor === id) {
    if (S.phase === "pick") { clearPickTimer(); botTurn(t, S.pickPos); return nextTurn(); }
    if (S.phase === "deal") return afterDeal();
    if (S.phase === "sell") { botSell(t); return doneSelling(); }
    if (S.phase === "captain") { if (!t.captain) botCaptain(t); return doneCaptain(); }
    if (S.phase === "destiny") { if (S.destiny.picked === null) pickDestiny(t, rand(S.destiny.cards.length)); return doneDestiny(); }
  }
  if (S.destinyQueue) S.destinyQueue = S.destinyQueue.filter(x => x !== id);
  S.sellQueue = S.sellQueue.filter(x => x !== id);
  if (S.captainQueue) S.captainQueue = S.captainQueue.filter(x => x !== id);
  if (S.mode === "captain" && !t.captain) botCaptain(t);
  if (S.phase === "report") return checkReady();
  update();
}

// ================= ACTIONS =================
// Every game button carries data-act / data-arg. Clicks on the host (or local device) are handled here;
// clicks on a guest's device are sent to the host, which validates them here too.
// seat = team id of whoever clicked, or "local" for the local (non-online) device.
function handleAction(seat, act, arg, fromHost) {
  if (!S) return;
  const isActor = seat === "local" || seat === S.actor;
  const actor = S.actor !== null ? T(S.actor) : null;
  const leavePrivate = () => { if (passAndPlay()) S.viewer = null; };
  switch (act) {
    case "invest": {
      const pid = +arg;
      if (S.phase === "pick" && isActor && S.pool.includes(pid) && priceFor(actor, pid) <= maxSpend(actor)) humanPick(pid);
      break;
    }
    case "pass":
      if (S.phase === "pick" && isActor) humanPick(null, "pass");
      break;
    case "scout": {
      const [p, stat] = String(arg).split(":"), pid = +p;
      if (S.gameMode === "scout" && S.phase === "pick" && isActor && S.pool.includes(pid) && SCOUT_STATS[stat]
          && !isUnlocked(actor, pid, stat) && canScout(actor)) { scout(actor, pid, stat); update(); }
      break;
    }
    case "dealContinue":
      if (S.phase === "deal" && isActor) { leavePrivate(); afterDeal(); }
      break;
    case "sell": {
      if (S.phase !== "sell" || !isActor || S.sales >= MAX_SALES || isBanned(actor)) break;
      const x = actor.squad.find(q => q.pid === +arg);
      if (!x) break;
      const price = sell(actor, x.pid);
      S.lastSale = { tag: x.tag, paid: x.paid, price };
      S.sales++;
      update();
      break;
    }
    case "superScout":
    case "amateurScout": {
      const kind = act === "superScout" ? "superstar" : "amateur", pid = +arg, key = scoutKey(pid, S.season);
      const already = kind === "superstar" ? actor && actor.trends[key] : actor && (actor.ageRanges[key] || isUnlocked(actor, pid, "age"));
      if (S.gameMode === "scout" && S.phase === "pick" && isActor && S.pool.includes(pid) && !already && canSpecial(actor, kind)) { specialScout(actor, pid, kind); update(); }
      break;
    }
    case "destinyPick":
      if (S.phase === "destiny" && isActor && S.destiny.picked === null && S.destiny.cards[+arg]) { pickDestiny(actor, +arg); update(); }
      break;
    case "destinyContinue":
      if (S.phase === "destiny" && isActor && S.destiny.picked !== null) { leavePrivate(); doneDestiny(); }
      break;
    case "captain":
      if (S.phase === "captain" && isActor && actor.squad.some(x => x.pid === +arg)) { actor.captain = +arg; update(); }
      break;
    case "confirmCaptain":
      if (S.phase === "captain" && isActor && captainOf(actor)) {
        log(privateLog(actor) ? `You named signing ${captainOf(actor).tag} as captain.` : `${actor.name} named a captain.`);
        leavePrivate(); doneCaptain();
      }
      break;
    case "doneSelling":
      if (S.phase === "sell" && isActor) { S.lastSale = null; leavePrivate(); doneSelling(); }
      break;
    case "handoffReady":
      if (!S.online && S.phase === "handoff") confirmHandoff();
      break;
    case "viewPrivate":
      if (!S.online && S.phase === "report") { S.viewer = +arg; S.phase = "myreport"; update(); }
      break;
    case "hideReport":
      if (!S.online && S.phase === "myreport") { S.viewer = null; S.phase = "report"; update(); }
      break;
    case "reportContinue":
      if (S.phase !== "report") break;
      if (!S.online) afterReport();
      else if (typeof seat === "number") { S.ready.add(seat); checkReady(); }
      break;
    case "forceContinue":
      if (S.phase === "report" && fromHost) afterReport();
      break;
    case "botTakeover":
      if (fromHost && S.online) botTakeover(+arg);
      break;
    case "revealNext":
    case "revealSkip": {
      if (S.phase !== "end") break;
      const key = S.online ? seat : "local";
      if (S.online && typeof key !== "number") break;
      S.revealPos[key] = act === "revealSkip" ? Infinity : (S.revealPos[key] || 0) + 1;
      update();
      break;
    }
    case "playAgain":
      if (fromHost) reset();
      break;
  }
}

document.addEventListener("click", e => {
  const b = e.target.closest("[data-act]");
  if (!b || b.disabled) return;
  const act = b.dataset.act, arg = b.dataset.arg;
  if (NET && NET.role === "guest") {
    if (NET.conn && NET.conn.open) { NET.conn.send({ t: "act", act, arg }); b.disabled = true; }
    return;
  }
  handleAction(S && S.online ? S.hostSeat : "local", act, arg, true);
});

// ================= UPDATE / BROADCAST =================
// Redraw this device, and (when hosting) send every online player their own private view.
function update() {
  if (NET && NET.role === "guest") return;
  if (!S) { renderPreGame(); broadcastLobby(); return; }
  applyRegions(renderRegions(S.online ? S.hostSeat : S.viewer));
  $("#btn-new").hidden = false;
  $("#btn-new").textContent = S.online ? "End game" : "New game";
  if (S.online) broadcastGame();
}

function applyRegions(r) {
  $("#season-info").innerHTML = r.info;
  $("#timeline").innerHTML = r.timeline;
  $("#panel-you").innerHTML = r.left;
  $("#panel-bot").innerHTML = r.right;
  $("#history").innerHTML = r.history;
  $("#log").innerHTML = r.log;
  $("#stage").innerHTML = r.stage;
  // Countdowns carry the time left (ms) when rendered; turn that into a local deadline so guests'
  // clocks don't need to match the host's.
  document.querySelectorAll("[data-left]").forEach(el => { el.dataset.deadline = Date.now() + +el.dataset.left; });
  tickCountdowns();
  document.title = r.yourTurn ? "🔔 Your turn – Billion Dollar XI" : "Billion Dollar XI";
  afterRender(r);
}

// ---- Mobile layout: one view at a time (Play / Squad / Players / Log) with a bottom tab bar ----
const MOBILE = matchMedia("(max-width: 760px)");
const MV = { lastKey: null, moreOpen: {} };
function setView(v) {
  document.body.dataset.view = v;
  document.querySelectorAll("#tabbar [data-view]").forEach(b => b.setAttribute("aria-current", b.dataset.view === v ? "page" : "false"));
}
document.addEventListener("click", e => {
  const b = e.target.closest("#tabbar [data-view]");
  if (b) { setView(b.dataset.view); scrollTo(0, 0); }
});
setView("play");

function afterRender(r) {
  // Keep the current season visible in the timeline strip.
  const tl = $("#timeline"), now = tl && tl.querySelector(".chip.now");
  if (now) tl.scrollLeft = now.offsetLeft - (tl.clientWidth - now.offsetWidth) / 2;
  // Long help notes start folded on phones; remember if the player opened one.
  document.querySelectorAll("details.more").forEach(d => {
    const k = d.dataset.k;
    if (MOBILE.matches) d.open = !!MV.moreOpen[k];
    d.addEventListener("toggle", () => { if (MOBILE.matches) MV.moreOpen[k] = d.open; });
  });
  if (r.key && r.key !== MV.lastKey) {
    MV.lastKey = r.key;
    if (MOBILE.matches) {
      if (r.focus) setView("play");
      if (document.body.dataset.view === "play") scrollTo(0, 0);
    }
  }
}

function tickCountdowns() {
  document.querySelectorAll("[data-deadline]").forEach(el => {
    const s = Math.max(0, Math.ceil((+el.dataset.deadline - Date.now()) / 1000));
    const num = el.querySelector(".secs");
    if (num) num.textContent = s;
    el.classList.toggle("urgent", s <= 5);
  });
}
setInterval(tickCountdowns, 250);

function broadcastGame() {
  if (!NET || NET.role !== "host") return;
  S.teams.forEach(t => {
    const c = t.remote && NET.conns.get(t.remote);
    if (c && c.open) c.send({ t: "view", regions: renderRegions(t.id) });
  });
}

function broadcastLobby() {
  if (!NET || NET.role !== "host") return;
  NET.seats.forEach(seat => {
    const c = seat.token && NET.conns.get(seat.token);
    if (c && c.open) c.send({ t: "view", regions: lobbyRegionsForGuest(seat) });
  });
}

// ================= RENDER: GAME =================
// Everything is drawn for a specific viewer ("me" = team id, or null for nobody / public screens).
function renderRegions(me) {
  const myTurn = me !== null && me === S.actor && ["pick", "deal", "sell", "captain", "destiny"].includes(S.phase);
  const myReview = S.online && S.phase === "report" && me !== null && !S.ready.has(me);
  return {
    info: headerHtml(), timeline: timelineHtml(), left: leftPanelHtml(me), right: participantsHtml(me),
    history: historyHtml(me), log: logHtml(), stage: stageHtml(me), yourTurn: myTurn || myReview,
    // Mobile layout: a new screen (key) brings the player back to the Play tab when it needs them.
    key: [S.phase, S.mode, S.season, S.roundNo, S.turnIdx, S.actor, S.handoff && S.handoff.id].join("|"),
    focus: !S.online || myTurn || myReview,
  };
}

function headerHtml() {
  const what = S.phase === "end" ? FINAL_LABEL
    : S.phase === "report" || S.phase === "myreport" ? "Season review"
    : S.mode === "captain" ? "Captain pick"
    : S.mode === "destiny" ? "🃏 Destiny cards"
    : S.phase === "sell" || S.mode === "window" ? "Transfer window" : "Signings";
  return `<b>${seasonLabel(S.season)}</b> · ${what} · ${GAME_MODES[S.gameMode].label}${S.online && NET ? ` · 🌐 Room ${NET.code}` : ""}`;
}

function timelineHtml() {
  const chips = SEASONS.map((s, i) => {
    const state = i < S.season ? "done" : i === S.season ? "now" : "";
    const tag = (WINDOWS.includes(i) ? `+${PICK_SCHEDULE[i]} · Window` : `+${PICK_SCHEDULE[i]} signing${PICK_SCHEDULE[i] > 1 ? "s" : ""}`)
      + (S.gameMode === "scout" && DESTINY_SEASONS.includes(i) ? " · 🃏" : "");
    return `<div class="chip ${state}"><span>${s}</span>${tag ? `<small>${tag}</small>` : ""}</div>`;
  });
  chips.push(`<div class="chip final ${S.season >= FINAL ? "now" : ""}"><span>2026</span><small>Final</small></div>`);
  return chips.join("");
}

function shortName(n) { const parts = n.split(" "); return parts.length > 1 && n.length > 12 ? parts.slice(-1)[0] : n; }

function pitchHtml(team, open, hiPos) {
  return `<div class="pitch">${["FWD", "MID", "DEF", "GK"].map(pos => {
    const players = team.squad.filter(x => byId[x.pid].pos === pos);
    const cells = [];
    for (let i = 0; i < FORMATION[pos]; i++) {
      const x = players[i];
      if (!x) { cells.push(`<div class="slot empty ${hiPos === pos ? "highlight" : ""}"><span class="pos">${pos}</span><span>open</span></div>`); continue; }
      const p = byId[x.pid], rr = row(x.pid, S.season);
      if (open) {
        const tip = `${p.name} (${p.nat}) – ${rr.club}\nPaid ${fmt(x.paid)} in ${seasonLabel(x.season)} · Final ${fmt(rr.value)}`;
        cells.push(`<div class="slot" title="${esc(tip)}"><span class="pos">${pos}</span><span class="nm">${esc(shortName(p.name))}${team.captain === x.pid ? " ©" : ""}</span><span class="val">${fmt(rr.value)}</span><span class="d ${cls(rr.value - x.paid)}">${pct(rr.value, x.paid)}</span></div>`);
      } else {
        const kAge = knowsStat(team, x.pid, "age") ? age(x.pid, S.season) : "🔒";
        const kLeague = knowsStat(team, x.pid, "league") ? rr.league : "league 🔒";
        const kRating = knowsStat(team, x.pid, "rating") ? rr.rating : "🔒";
        const tip = `Signing ${x.tag} · ${POS_NAME[pos]}\nAge ${kAge} · ${kLeague}\n${SEASONS[S.season]}: ${rr.apps} apps, ${rr.g}G ${rr.a}A, rating ${kRating}\nPaid ${fmt(x.paid)} in ${seasonLabel(x.season)} · value sealed until 2026`;
        cells.push(`<div class="slot" title="${esc(tip)}"><span class="pos">${pos}</span><span class="nm">${x.tag}${team.captain === x.pid ? " ©" : ""}</span><span class="val">age ${kAge}</span><span class="val">paid ${fmt(x.paid)}</span></div>`);
      }
    }
    return `<div class="row">${cells.join("")}</div>`;
  }).join("")}</div>`;
}

function leftPanelHtml(me) {
  if (revealing(me)) {
    return `<h2>🔓 The reveal</h2><p class="note">Every signing is being unmasked, one by one. The winner and final standings appear once the reveal is done.</p>`;
  }
  if (S.phase === "end") {
    const w = S.teams.slice().sort((a, b) => netWorth(b) - netWorth(a))[0];
    return `<h2>🏆 ${esc(w.name)}</h2><div class="kv"><span>Portfolio total</span><b>${fmt(netWorth(w))}</b><span>Return on ${fmt(BUDGET)}</span><b class="${cls(netWorth(w) - BUDGET)}">${pct(netWorth(w), BUDGET)}</b></div>${pitchHtml(w, true)}`;
  }
  if (me === null || me === undefined) {
    return `<h2>🔒 Private</h2><p class="note">Each player's squad is shown only on their own turn, or when they press "view privately" in a season review.</p>`;
  }
  const t = T(me), invested = t.squad.reduce((n, x) => n + x.paid, 0);
  const hiPos = S.phase === "pick" && S.actor === me ? S.pickPos : null;
  return `
    <h2>${esc(t.name)}${S.online ? " (you)" : ""}</h2>
    <div class="kv">
      <span>Cash</span><b>${fmt(t.budget)}</b>
      <span>Paid for squad</span><b>${fmt(invested)}</b>
      ${S.gameMode === "scout" ? `<span>Scouting bills</span><b>${fmt(t.scoutBills)}</b>` : ""}
      <span>Squad value</span><b>sealed</b>
      <span>Players</span><b>${t.squad.length}/11</b>
    </div>
    ${effectsHtml(t)}
    ${pitchHtml(t, false, hiPos)}`;
}

// The player's active destiny-card effects (private: only drawn for the owner).
function effectsHtml(t) {
  const fx = pendingEffects(t);
  return fx.length ? `<div class="effects"><b>🃏 Active cards</b>${fx.map(e => `<span>${e}</span>`).join("")}</div>` : "";
}

function participantsHtml(me) {
  const active = S.phase === "handoff" ? S.handoff.id : ["pick", "deal", "sell", "captain", "destiny"].includes(S.phase) ? S.actor : null;
  const end = S.phase === "end" && !revealing(me);
  const list = (end ? S.teams.slice().sort((a, b) => netWorth(b) - netWorth(a)) : S.teams).map((t, i) => {
    const status = S.online && t.remote ? (isConnected(t) ? `<span class="dot on" title="connected"></span>` : `<span class="dot off" title="disconnected"></span>`) : "";
    const ready = S.online && S.phase === "report" && t.type === "human" ? (S.ready.has(t.id) ? " ✓" : " …") : "";
    return `
    <div class="pcard ${active === t.id ? "active" : ""}">
      <div class="hdr"><b>${status}${end ? `${i + 1}. ` : ""}${esc(t.name)}${S.online && t.id === me ? " (you)" : ""}${ready}</b><span class="tag">${typeLabel(t)}</span></div>
      <div class="note">${POS_ORDER.map(p => `${p} ${countPos(t, p)}/${FORMATION[p]}`).join(" · ")}</div>
      ${t.cards.length ? `<div class="pcards">${t.cards.map(c => { const d = DESTINY_CARDS[c.id]; return `<span class="tag ${d.good ? "" : "down"}" title="${esc(`${d.name} (${SEASONS[c.season]}): ${d.text}`)}">${d.icon} ${d.name}</span>`; }).join(" ")}</div>` : ""}
      ${end ? `<div class="kv"><span>Portfolio</span><b>${fmt(netWorth(t))}</b><span>Return</span><b class="${cls(netWorth(t) - BUDGET)}">${pct(netWorth(t), BUDGET)}</b></div>` : ""}
    </div>`;
  }).join("");
  return `<h2>Participants</h2>${list}${end ? "" : `<p class="note">🔒 Squads, cash and values are private until the final valuation.</p>`}`;
}

function historyHtml(me) {
  if (S.phase === "end" && revealing(me)) return `<p class="note">🔓 The portfolio history appears after the reveal.</p>`;
  if (!S.history.length) return `<p class="note">Portfolio totals appear here at the end of the game.</p>`;
  if (sealed()) return `<p class="note">🔒 Portfolio values stay sealed until the final valuation in summer 2026, when the full season-by-season history is revealed.</p>`;
  return `<div class="scroll-x"><table><tr><th>When</th>${S.teams.map(t => `<th class="num">${esc(t.name)}</th>`).join("")}</tr>
    ${S.history.map(h => { const best = Math.max(...h.worth); return `<tr><td>${h.label}</td>${h.worth.map(w => `<td class="num">${w === best ? `<b>${fmt(w)}</b>` : fmt(w)}</td>`).join("")}</tr>`; }).join("")}</table></div>`;
}

function logHtml() { return S.log.slice(0, 80).map(l => `<li><span class="yr">${l.yr}</span>${esc(l.msg)}</li>`).join(""); }

function stageHtml(me) {
  switch (S.phase) {
    case "handoff": return handoffHtml();
    case "pick": return me === S.actor ? pickHtml() : waitingHtml(me);
    case "deal": return me === S.actor ? dealHtml() : waitingHtml(me);
    case "sell": return me === S.actor ? sellHtml() : waitingHtml(me);
    case "captain": return me === S.actor ? captainHtml() : waitingHtml(me);
    case "destiny": return me === S.actor ? destinyHtml() : waitingHtml(me);
    case "report": return reportHtml(me);
    case "myreport": return myReportHtml();
    case "end": return revealing(me) ? revealHtml(me) : endHtml(me);
  }
  return "";
}

function handoffHtml() {
  const t = T(S.handoff.id);
  const what = S.handoff.phase === "sell" ? `the ${SEASONS[S.season]} transfer window`
    : S.handoff.phase === "captain" ? "picking a captain"
    : S.handoff.phase === "destiny" ? "drawing a destiny card" : `a ${SEASONS[S.season]} signing`;
  return `
    <div class="handoff">
      <div class="big-emoji">📱</div>
      <h2>Pass the device to ${esc(t.name)}</h2>
      <p class="sub">It's ${esc(t.name)}'s turn: ${what}. Everyone else, look away 👀</p>
      <button class="btn" data-act="handoffReady">I'm ${esc(t.name)}, show my screen</button>
    </div>`;
}

function waitingHtml(me) {
  const t = T(S.actor);
  const doing = S.phase === "sell" ? `using the ${SEASONS[S.season]} transfer window`
    : S.phase === "captain" ? "picking a captain"
    : S.phase === "destiny" ? "drawing a destiny card" : `making a ${SEASONS[S.season]} signing`;
  const hostView = S.online && me === S.hostSeat;
  const dropped = S.online && t.remote && !isConnected(t);
  return `
    <div class="handoff">
      <div class="big-emoji">⏳</div>
      <h2>Waiting for ${esc(t.name)}…</h2>
      <p class="sub">${esc(t.name)} is ${doing}.${me !== null ? " You can check your squad meanwhile." : ""}</p>
      ${dropped ? `<p class="down"><b>${esc(t.name)} has disconnected.</b> They can rejoin with the same room code and pick up where they left off.</p>` : ""}
      ${dropped && hostView ? `<button class="btn ghost" data-act="botTakeover" data-arg="${t.id}">Let a bot take over ${esc(t.name)}'s seat</button>` : ""}
    </div>`;
}

// In scout mode a stat the viewing team hasn't paid for is shown as a lock button instead of its value.
function scoutCell(team, pid, stat, shown) {
  if (isUnlocked(team, pid, stat)) return team.leaked[`${scoutKey(pid, S.season)}:${stat}`] ? `${shown} <span class="tag leak" title="Revealed by a Leaked Report card">📰 Leaked</span>` : shown;
  const ok = canScout(team), cost = scoutCost(team);
  const range = stat === "age" && team.ageRanges[scoutKey(pid, S.season)];
  return `${range ? `<span class="range" title="Amateur Scout estimate">🧢 ${range[0]}–${range[1]}</span> ` : ""}<button class="btn ghost small scout" data-act="scout" data-arg="${pid}:${stat}" ${ok ? "" : "disabled"}
    title="${ok ? `Unlock ${SCOUT_STATS[stat].toLowerCase()} for ${fmt(cost)}` : "Not enough spendable cash to scout"}">🔒 ${fmt(cost)}</button>`;
}

// Superstar trend (if bought) plus the two special-scout buttons on a prospect card.
function specialScoutHtml(t, pid) {
  const key = scoutKey(pid, S.season), trend = t.trends[key];
  const btn = (kind, act, done) => {
    const sc = SPECIAL_SCOUTS[kind], left = t.specialLeft[kind];
    if (done || !left) return "";
    const ok = canSpecial(t, kind);
    return `<button class="btn ghost small special" data-act="${act}" data-arg="${pid}" ${ok ? "" : "disabled"}
      title="${esc(`${sc.name}: ${sc.text}. ${fmt(sc.cost)}, ${left} use${left > 1 ? "s" : ""} left this game.`)}${ok ? "" : " Not enough spendable cash."}">${sc.icon} ${kind === "superstar" ? "Trend" : "Age range"} ${fmt(sc.cost)}</button>`;
  };
  const trendHtml = trend ? `<div class="trend"><b>🌟 Superstar report</b>${trend.map(x => `<span><span class="note">${x.when}</span> <b class="${x.cls}">${x.icon} ${x.label}</b></span>`).join("")}</div>` : "";
  const buttons = btn("superstar", "superScout", !!trend) + btn("amateur", "amateurScout", !!t.ageRanges[key] || isUnlocked(t, pid, "age"));
  return trendHtml + (buttons ? `<div class="specials">${buttons}</div>` : "");
}

function statsHtml(pid, s, pos, team) {
  const r = row(pid, s);
  const items = [["Age", scoutCell(team, pid, "age", age(pid, s))], ["Apps", r.apps], ["Goals", r.g], ["Assists", r.a]];
  if (pos === "GK" || pos === "DEF") items.push(["Clean sheets", r.cs]);
  items.push(["Avg rating", scoutCell(team, pid, "rating", r.rating.toFixed(1))]);
  return `<div class="stats">${items.map(([k, v]) => `<span>${k}</span><b>${v}</b>`).join("")}</div>`;
}

function pickHtml() {
  const t = T(S.actor), max = maxSpend(t);
  const cards = S.pool.map((pid, i) => {
    const r = row(pid, S.season), price = priceFor(t, pid), over = price > max;
    return `<div class="prospect ${over ? "over" : ""}">
      <div class="hdr"><span class="letter">Player ${LETTERS[i]}</span><span class="tag">${S.pickPos}</span></div>
      <div class="league">🏟 ${scoutCell(t, pid, "league", esc(r.league))} · ${SEASONS[S.season]}</div>
      ${statsHtml(pid, S.season, S.pickPos, t)}
      ${S.gameMode === "scout" ? specialScoutHtml(t, pid) : ""}
      <div class="price">${price !== r.value ? `<s class="was">${fmt(r.value)}</s> ` : ""}${fmt(price)}</div>
      <button class="btn" data-act="invest" data-arg="${pid}" ${over ? "disabled" : ""}>${over ? "Over budget" : "Invest"}</button>
    </div>`;
  }).join("");
  const title = `${SEASONS[S.season]} signing (player ${t.squad.length + 1} of ${SQUAD_SIZE}): ${POS_NAME[S.pickPos]}`;
  const lastChance = S.season === FINAL - 1;
  const passLabel = lastChance ? "Keep the cash (slot stays empty)" : "Keep the cash: sign next season instead";
  return `
    <h2>${humans().length > 1 ? `${esc(t.name)}: ` : ""}${title}</h2>
    ${S.pickDeadline ? `<div class="countdown" data-left="${Math.max(0, S.pickDeadline - Date.now())}">⏱ <span class="secs">${Math.max(0, Math.ceil((S.pickDeadline - Date.now()) / 1000))}</span>s left, then the first available player is signed automatically</div>` : ""}
    <p class="sub">Cash ${fmt(t.budget)} · You can spend up to <b>${fmt(Math.max(0, max))}</b> (${fmt(RESERVE_PER_SLOT)} is held back for each other open slot) · ${openSlots(t)} open slot(s)</p>
    ${S.gameMode === "scout" ? `<details class="more" data-k="scout" open><summary>🔭 Scouting: next unlock <b>${fmt(scoutCost(t))}</b></summary><p class="note">🔭 League, age and avg rating are locked. Your next unlock costs <b>${fmt(scoutCost(t))}</b>, paid from your cash (${SCOUT_PRICING}). Only you see what you unlock. Unlocks so far: <b>${t.scoutCount}</b> · Scouting bills: <b>${fmt(t.scoutBills)}</b><br>
      🌟 Superstar Scout (${fmt(SPECIAL_SCOUTS.superstar.cost)}, valuation trend for the next two seasons): <b>${t.specialLeft.superstar} use${t.specialLeft.superstar === 1 ? "" : "s"} left</b> · 🧢 Amateur Scout (${fmt(SPECIAL_SCOUTS.amateur.cost)}, age as a 3-year range): <b>${t.specialLeft.amateur} use${t.specialLeft.amateur === 1 ? "" : "s"} left</b></p></details>` : ""}
    ${effectsHtml(t)}
    ${S.pool.length ? `<div class="pool">${cards}</div>` : `<p>No ${POS_NAME[S.pickPos]}s are left this season.</p>`}
    <div class="actions"><button class="btn ghost" data-act="pass">${passLabel}</button></div>`;
}

function dealHtml() {
  const t = T(S.actor), d = S.lastDeal;
  let box;
  if (d.pid) {
    const p = byId[d.pid], r = row(d.pid, S.season), x = t.squad.find(q => q.pid === d.pid);
    box = `<div class="box you"><div class="note">${esc(t.name)} invested in</div>
      <div class="big">🔒 Signing ${x.tag}</div>
      <div>${POS_NAME[p.pos]} · ${knowsStat(t, d.pid, "league") ? esc(r.league) : "league 🔒"} · age ${knowsStat(t, d.pid, "age") ? age(d.pid, S.season) : "🔒"}</div>
      <div class="note">${r.apps} apps · ${r.g}G ${r.a}A · rating ${knowsStat(t, d.pid, "rating") ? r.rating : "🔒"}</div>
      <div class="price" style="margin-top:6px">${fmt(x.paid)}</div>
      ${x.paid !== r.value ? `<div class="note">Market value ${fmt(r.value)}; a destiny card changed what you paid.</div>` : ""}
      ${x.boost ? `<div class="note">⭐ Star Billing: this signing counts ×1.5 when sold or at the final valuation.</div>` : ""}
      <div class="note">Name, club and future value stay sealed until 2026.</div></div>`;
  } else {
    box = `<div class="box you"><div class="note">${esc(t.name)}</div><div class="big">—</div><div>${d.skipped === "pass" ? "Kept the cash." : "Skipped this pick."}</div></div>`;
  }
  return `
    <h2>Deal done</h2>
    <p class="sub">Identities stay sealed until the final valuation.</p>
    <div class="reveal" style="grid-template-columns:1fr">${box}</div>
    <div class="actions"><button class="btn" data-act="dealContinue">${passAndPlay() ? "Hide my screen & continue →" : "Continue →"}</button></div>`;
}

// Destiny-card markers on a signing.
const cardTags = x => `${x.boost ? ` <span class="tag" title="Star Billing: counts ×1.5">⭐×1.5</span>` : ""}${x.injuries ? ` <span class="tag down" title="Injury Crisis: −15% valuation${x.injuries > 1 ? " (×" + x.injuries + ")" : ""}">🤕 −15%${x.injuries > 1 ? " ×" + x.injuries : ""}</span>` : ""}`;

// Sealed view of a squad: age, league and this season's stats only, with no names, clubs or current values.
function sealedSquadTable(team, s, sellable, captainPick) {
  const extra = sellable || captainPick;
  const rows = team.squad.slice().sort(bySlot).map(x => {
    const isCap = team.captain === x.pid;
    const action = sellable ? `<td><button class="btn danger small" data-act="sell" data-arg="${x.pid}" ${sellable.left > 0 ? "" : "disabled"}>Sell</button></td>`
      : captainPick ? `<td>${isCap ? `<span class="cap">© Captain</span>` : `<button class="btn ghost small" data-act="captain" data-arg="${x.pid}">Make captain</button>`}</td>` : "";
    const p = byId[x.pid], r = row(x.pid, s), prev = s > 0 ? row(x.pid, s - 1) : null;
    const kLeague = knowsStat(team, x.pid, "league");
    const moved = kLeague && prev && x.season < s && prev.league !== r.league ? ` <span class="tag">new league</span>` : "";
    const cs = p.pos === "GK" || p.pos === "DEF" ? r.cs : "–";
    return `<tr${isCap && captainPick ? ` class="cap-row"` : ""}><td><b>${x.tag}</b>${isCap ? " ©" : ""}${cardTags(x)}</td><td>${p.pos}</td><td class="num">${knowsStat(team, x.pid, "age") ? age(x.pid, s) : LOCKED}</td><td>${kLeague ? esc(r.league) : LOCKED}${moved}</td>
      <td class="num">${r.apps}</td><td class="num">${r.g}</td><td class="num">${r.a}</td><td class="num">${cs}</td><td class="num">${knowsStat(team, x.pid, "rating") ? r.rating.toFixed(1) : LOCKED}</td>
      <td class="num">${fmt(x.paid)}<div class="note">${seasonLabel(x.season)}</div></td>
      ${action}</tr>`;
  }).join("");
  const cols = extra ? 11 : 10;
  return `<div class="scroll-x"><table>
    <tr><th>Signing</th><th>Pos</th><th class="num">${extra ? "Current age" : "Age"}</th><th>League</th><th class="num">Apps</th><th class="num">G</th><th class="num">A</th><th class="num">CS</th><th class="num">Rating</th><th class="num">Paid</th>${extra ? "<th></th>" : ""}</tr>
    ${rows || `<tr><td colspan="${cols}" class="note">No players.</td></tr>`}</table></div>`;
}

const nextLabel = () => (WINDOWS.includes(S.season) ? `the ${SEASONS[S.season]} transfer window 🔁` : `${SEASONS[S.season]} signings →`);

function reportHtml(me) {
  const intro = `<h2>Season review: ${SEASONS[S.season]}</h2>`;
  const blurb = `<p class="sub">How your signings played this season. 🔒 Names and market values stay sealed until 2026. Use age, league and form to judge who's rising and who's fading.</p>`;
  const solo = soloHuman();
  if (solo) {
    return `${intro}${blurb}
      <div class="kv" style="max-width:320px"><span>Cash</span><b>${fmt(solo.budget)}</b><span>Players</span><b>${solo.squad.length}/11</b></div>
      ${sealedSquadTable(solo, S.season)}
      <div class="actions"><button class="btn" data-act="reportContinue">Go to ${nextLabel()}</button></div>`;
  }
  if (!S.online) {
    const hs = humans();
    return `${intro}
      <p class="sub">The ${SEASONS[S.season]} season has been played. 🔒 Each player can check how their own signings did, privately.</p>
      ${hs.length ? `<div class="actions">${hs.map(t => `<button class="btn ghost" data-act="viewPrivate" data-arg="${t.id}">👁 ${esc(t.name)}: view privately</button>`).join("")}</div>` : `<p class="note">Bots only. Nothing to view.</p>`}
      <div class="actions"><button class="btn" data-act="reportContinue">Go to ${nextLabel()}</button></div>`;
  }
  // online: everyone sees their own review and presses Ready
  const t = me !== null ? T(me) : null;
  const waitingOn = humans().filter(h => !S.ready.has(h.id));
  const isReady = t && S.ready.has(t.id);
  const hostView = me === S.hostSeat;
  return `${intro}${blurb}
    ${t ? `<div class="kv" style="max-width:320px"><span>Cash</span><b>${fmt(t.budget)}</b><span>Players</span><b>${t.squad.length}/11</b></div>${sealedSquadTable(t, S.season)}` : ""}
    <div class="actions">
      ${isReady ? `<span class="note">✓ You're ready. Waiting for ${waitingOn.map(h => esc(h.name)).join(", ")}…</span>`
        : `<button class="btn" data-act="reportContinue">Ready: go to ${nextLabel()}</button>`}
      ${hostView && waitingOn.length && isReady ? `<button class="btn ghost small" data-act="forceContinue">Continue without them</button>` : ""}
    </div>`;
}

function myReportHtml() {
  const t = T(S.viewer);
  return `
    <h2>${esc(t.name)}: ${SEASONS[S.season]} review</h2>
    <p class="sub">🔒 Only ${esc(t.name)} should be looking. Names and values stay sealed until 2026.</p>
    <div class="kv" style="max-width:320px"><span>Cash</span><b>${fmt(t.budget)}</b><span>Players</span><b>${t.squad.length}/11</b></div>
    ${sealedSquadTable(t, S.season)}
    <div class="actions"><button class="btn" data-act="hideReport">Hide & go back</button></div>`;
}

function sellHtml() {
  const t = T(S.actor);
  const banned = isBanned(t);
  const left = banned ? 0 : MAX_SALES - S.sales;
  const lastSale = S.lastSale ? `<p class="up"><b>Sold ${S.lastSale.tag} for ${fmt(S.lastSale.price)}</b> (${fmtDelta(S.lastSale.price - S.lastSale.paid)}, ${pct(S.lastSale.price, S.lastSale.paid)} vs paid).</p>` : "";
  const label = passAndPlay() ? "Done, hide my screen →" : openSlots(t) ? `Done. ${openSlots(t)} open slot(s) to fill →` : "Done, no changes →";
  return `
    <h2>${humans().length > 1 ? `${esc(t.name)}: ` : ""}Transfer window ${SEASONS[S.season]}</h2>
    <p class="sub">Sell up to ${MAX_SALES} players (${left} sale(s) left). 🔒 You sell blind: the price is their current market value, revealed only after you sell. Afterwards come this season's signings: one hidden 5-player choice for the regular signing, plus one for every player you sold (or keep the cash).</p>
    ${banned ? `<p class="down"><b>🚫 Transfer ban:</b> a destiny card stops you selling anyone in this window. You can still sign players afterwards.</p>` : ""}
    <div class="kv" style="max-width:320px"><span>Cash</span><b>${fmt(t.budget)}</b></div>
    ${lastSale}
    ${sealedSquadTable(t, S.season, { left })}
    <div class="actions"><button class="btn" data-act="doneSelling">${label}</button></div>`;
}

function destinyCardHtml(id, opts = {}) {
  const c = DESTINY_CARDS[id];
  return `<div class="dcard face ${c.good ? "good" : "bad"} ${opts.dim ? "dim" : ""}">
    <div class="dicon">${c.icon}</div><div class="dname">${c.name}</div><div class="dtext">${c.text}</div></div>`;
}

function destinyHtml() {
  const t = T(S.actor), d = S.destiny;
  const head = `<h2>${humans().length > 1 ? `${esc(t.name)}: ` : ""}🃏 Destiny card</h2>`;
  if (d.picked === null) {
    return `${head}
      <p class="sub">Fate steps in. Pick one of ${d.cards.length} face-down cards. It could be a blessing or a curse, and it takes effect straight away. 👀 Your opponents will see which card you drew.</p>
      <div class="dcards">${d.cards.map((_, i) => `<button class="dcard back" data-act="destinyPick" data-arg="${i}" aria-label="Face-down card ${i + 1}"><span>🃏</span><small>Card ${i + 1}</small></button>`).join("")}</div>`;
  }
  const id = d.cards[d.picked], c = DESTINY_CARDS[id];
  const others = d.cards.filter((_, i) => i !== d.picked);
  return `${head}
    <p class="sub">${c.good ? "✨ Fortune smiles on you." : "⚡ Bad luck."} This card is now in effect.</p>
    <div class="dcards">${destinyCardHtml(id)}</div>
    ${d.extra ? `<p><b>${esc(d.extra)}</b></p>` : ""}
    ${effectsHtml(t)}
    <p class="note">The other cards were:</p>
    <div class="dcards small">${others.map(o => destinyCardHtml(o, { dim: true })).join("")}</div>
    <div class="actions"><button class="btn" data-act="destinyContinue">${passAndPlay() ? "Hide my screen & continue →" : "Continue →"}</button></div>`;
}

// Market value over the 10 seasons plus the final 2026 valuation, as an inline SVG line chart.
function valueChartSvg(x) {
  const W = 560, H = 210, L = 44, R = 14, T = 14, B = 34;
  const pts = [];
  for (let s = 0; s <= FINAL; s++) { const r = row(x.pid, s); if (r) pts.push({ s, v: r.value }); }
  const maxV = Math.max(x.paid, ...pts.map(p => p.v)) * 1.1 || 1;
  const X = s => L + (s / FINAL) * (W - L - R), Y = v => T + (1 - v / maxV) * (H - T - B);
  const final = pts[pts.length - 1].v, line = final >= x.paid ? "up" : "down";
  const grid = [0, 0.5, 1].map(f => { const v = maxV * f / 1.1; return `<line class="gl" x1="${L}" x2="${W - R}" y1="${Y(v)}" y2="${Y(v)}"/><text class="ax" x="${L - 6}" y="${Y(v) + 4}" text-anchor="end">${fmt(Math.round(v))}</text>`; }).join("");
  const labels = Array.from({ length: FINAL + 1 }, (_, s) => s % 2 === 0 || s === FINAL
    ? `<text class="ax" x="${X(s)}" y="${H - 12}" text-anchor="middle">${s === FINAL ? "2026" : SEASONS[s].replace(/^20/, "").replace("/20", "/")}</text>` : "").join("");
  const path = pts.map((p, i) => `${i ? "L" : "M"}${X(p.s).toFixed(1)},${Y(p.v).toFixed(1)}`).join(" ");
  const bought = pts.find(p => p.s === x.season);
  return `<svg class="vchart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Market value by season">
    ${grid}${labels}
    <line class="paidline" x1="${L}" x2="${W - R}" y1="${Y(x.paid)}" y2="${Y(x.paid)}"/><text class="paidlbl" x="${W - R}" y="${Y(x.paid) - 5}" text-anchor="end">paid ${fmt(x.paid)}</text>
    <path class="vline ${line}" d="${path}"/>
    ${pts.map(p => `<circle class="vdot ${p.s === FINAL ? "final " + line : ""}" cx="${X(p.s)}" cy="${Y(p.v)}" r="${p.s === FINAL ? 5 : 3}"><title>${p.s === FINAL ? "Summer 2026" : SEASONS[p.s]}: ${fmt(p.v)}</title></circle>`).join("")}
    ${bought ? `<circle class="bought" cx="${X(bought.s)}" cy="${Y(bought.v)}" r="7"/><text class="paidlbl" x="${X(bought.s)}" y="${Y(bought.v) - 11}" text-anchor="middle">signed</text>` : ""}
  </svg>`;
}

function revealHtml(me) {
  const list = revealList(me), i = S.revealPos[revealKey(me)] || 0, { t, x } = list[i];
  const p = byId[x.pid], fin = row(x.pid, FINAL), worth = holdVal(x), gain = worth - x.paid, cap = t.captain === x.pid;
  const ownIdx = list.filter(e => e.t === t).indexOf(list[i]) + 1, ownTotal = t.squad.length;
  const verdict = gain >= x.paid ? "💎 Jackpot" : gain > 0 ? "✅ Profit" : gain === 0 ? "➖ Break even" : gain > -x.paid / 2 ? "📉 Loss" : "💀 Disaster";
  const last = i === list.length - 1;
  return `
    <div class="reveal-head">
      <h2>🔓 ${S.online ? "Your squad" : `${esc(t.name)}'s squad`}: signing ${ownIdx} of ${ownTotal}</h2>
      <div class="note">Overall ${i + 1} / ${list.length}</div>
    </div>
    <div class="rcard">
      <div class="rtop">
        <div>
          <div class="note">${x.tag} · ${POS_NAME[p.pos]} · signed ${seasonLabel(x.season)} at age ${age(x.pid, x.season)}</div>
          <div class="rname">${esc(p.name)}${cap ? ` <span class="cap">© Captain ×2</span>` : ""}${cardTags(x)}</div>
          <div class="note">${esc(p.nat)} · now at ${esc(fin.club)} (${esc(fin.league)})</div>
        </div>
        <div class="stamp ${gain >= 0 ? "up" : "down"}">
          <div class="stamp-row"><span>You paid</span><b>${fmt(x.paid)}</b></div>
          <div class="stamp-row"><span>Now worth</span><b>${fmt(worth)}</b></div>
          <div class="stamp-verdict">${verdict} ${fmtDelta(gain)} (${pct(worth, x.paid)})</div>
        </div>
      </div>
      ${valueChartSvg(x)}
      ${holdMult(x) !== 1 ? `<p class="note">Market value ${fmt(fin.value)}; destiny cards adjust it to ${fmt(worth)} for you.</p>` : ""}
      ${cap ? `<p class="note">© As captain, this ${gain >= 0 ? "profit" : "loss"} counts twice: ${fmtDelta(gain)} extra.</p>` : ""}
    </div>
    <div class="actions">
      <button class="btn" data-act="revealNext">${last ? "See the final standings 🏆" : "Next signing →"}</button>
      ${last ? "" : `<button class="btn ghost" data-act="revealSkip">Skip to results</button>`}
    </div>`;
}

function captainHtml() {
  const t = T(S.actor), c = captainOf(t);
  return `
    <h2>${humans().length > 1 ? `${esc(t.name)}: ` : ""}© Pick your captain</h2>
    <p class="sub">Last decision before the final valuation. Your captain's value change counts <b>double</b>: if they're worth more than you paid, you gain that profit twice; if they're worth less, you lose twice as much. 🔒 Values are still sealed, so judge on age, league and form.</p>
    ${sealedSquadTable(t, S.season, null, true)}
    <div class="actions">
      ${c ? `<span class="note">Captain: <b>${c.tag}</b> (${byId[c.pid].pos}, paid ${fmt(c.paid)})</span>` : `<span class="note">Choose one player with "Make captain".</span>`}
      <button class="btn" data-act="confirmCaptain" ${c ? "" : "disabled"}>${passAndPlay() ? "Confirm, hide my screen →" : "Confirm captain →"}</button>
    </div>`;
}

function endHtml(me) {
  const ranked = S.teams.slice().sort((a, b) => netWorth(b) - netWorth(a));
  const top = netWorth(ranked[0]);
  const winners = ranked.filter(t => netWorth(t) === top);
  const meTeam = S.online ? T(me) : soloHuman();
  const banner = winners.length > 1 ? `🤝 Tie at the top: ${winners.map(t => esc(t.name)).join(" & ")}`
    : meTeam ? (winners[0] === meTeam ? "🏆 You built the most valuable portfolio!" : `${winners[0].type === "bot" ? "🤖" : "🏆"} ${esc(winners[0].name)} wins.`)
    : `🏆 ${esc(winners[0].name)} wins!`;
  const squadTable = t => `<table><tr><th>Player</th><th class="num">Paid</th><th class="num">Final</th><th class="num">Return</th></tr>
    ${t.squad.slice().sort(bySlot).map(x => { const v = holdVal(x), cap = t.captain === x.pid; return `<tr${cap ? ` class="cap-row"` : ""}><td><span class="note">${x.tag}</span> <b>${esc(byId[x.pid].name)}</b>${cap ? ` <span class="cap">© ×2</span>` : ""}${cardTags(x)}<div class="note">${byId[x.pid].pos} · ${esc(byId[x.pid].nat)} · ${esc(row(x.pid, FINAL).club)} · bought ${seasonLabel(x.season)}</div>${cap ? `<div class="note">Captain bonus: <b class="${cls(v - x.paid)}">${fmtDelta(v - x.paid)}</b></div>` : ""}</td><td class="num">${fmt(x.paid)}</td><td class="num">${fmt(v)}</td><td class="num ${cls(v - x.paid)}">${pct(v, x.paid)}</td></tr>`; }).join("")}
    ${t.sold.map(x => `<tr class="sold"><td><span class="note">${x.tag}</span> ${esc(byId[x.pid].name)} <span class="tag">sold</span><div class="note">${byId[x.pid].pos} · bought ${seasonLabel(x.season)}, sold ${seasonLabel(x.soldSeason)}</div></td><td class="num">${fmt(x.paid)}</td><td class="num">${fmt(x.soldFor)}</td><td class="num ${cls(x.soldFor - x.paid)}">${pct(x.soldFor, x.paid)}</td></tr>`).join("")}</table>`;
  const canRestart = !S.online || me === S.hostSeat;
  const scoutMode = S.gameMode === "scout";
  return `
    <div class="banner">${banner}</div>
    <p class="sub" style="text-align:center">🔓 All identities and values revealed. Portfolio = cash + squad value + captain bonus (the captain's value change counted a second time). The full season-by-season history is in the Portfolio history panel.</p>
    <div class="scroll-x"><table>
      <tr><th>#</th><th>Participant</th>${scoutMode ? `<th class="num">Scouting bills</th>` : ""}<th class="num">Cash</th><th class="num">Squad (summer 2026)</th><th class="num">© Captain bonus</th><th class="num">Portfolio</th><th class="num">Return</th></tr>
      ${ranked.map((t, i) => `<tr><td>${i + 1}</td><td><b>${esc(t.name)}</b> <span class="tag">${typeLabel(t)}</span></td>${scoutMode ? `<td class="num down">${t.scoutBills ? "−" + fmt(t.scoutBills) : fmt(0)}</td>` : ""}<td class="num">${fmt(t.budget)}</td><td class="num">${fmt(squadValue(t))}</td><td class="num ${cls(captainBonus(t))}">${captainOf(t) ? fmtDelta(captainBonus(t)) : "–"}</td><td class="num"><b>${fmt(netWorth(t))}</b></td><td class="num ${cls(netWorth(t) - BUDGET)}">${pct(netWorth(t), BUDGET)}</td></tr>`).join("")}
    </table></div>
    <div class="reveal" style="margin-top:14px">
      ${ranked.map(t => `<div class="box ${t.type === "human" ? "you" : "bot"}"><h3>${esc(t.name)}</h3>${t.cards.length ? `<div class="note">🃏 Destiny cards: ${t.cards.map(c => `${DESTINY_CARDS[c.id].icon} ${DESTINY_CARDS[c.id].name} (${SEASONS[c.season]})`).join(" · ")}</div>` : ""}<div class="scroll-x">${squadTable(t)}</div></div>`).join("")}
    </div>
    <div class="actions">${canRestart ? `<button class="btn" data-act="playAgain">${S.online ? "Back to the room" : "Play again"}</button>` : `<span class="note">Waiting for the host to start another game.</span>`}</div>`;
}

// ================= RENDER: SETUP / LOBBY =================
// The rules list changes with the selected game mode.
function rulesHtml(mode) {
  const scoutMode = mode === "scout";
  const signingRule = scoutMode
    ? `Every signing gives you <b>5 hidden players</b> for a random position. You see that season's apps, goals, assists, clean sheets and price (their market value). Their <b>league, age and avg rating are locked</b>, and you never see their name, nationality or club.`
    : `Every signing gives you <b>5 hidden players</b> for a random position. You see their age, league, that season's stats and price (their market value), but not their name, nationality or club.`;
  const modeRule = !mode
    ? `🎮 <b>The host picks the game mode:</b> ⏱ Timer (${PICK_SECONDS} seconds per signing) or 🔭 Scout (league, age and avg rating are locked, and unlocking them costs from $10m upwards). You'll see the full rules once you're in the room.`
    : scoutMode
    ? `🔭 <b>Scouting:</b> unlock a prospect's league, age or avg rating, paid from your cash. The price rises the more you scout over the whole game:
      <ul>
        <li>Unlocks 1–5: <b>${fmt(scoutPrice(0))}</b> each</li>
        <li>Unlocks 6–10: <b>${fmt(scoutPrice(5))}</b> each</li>
        <li>Unlock 11 onwards: <b>+$2m</b> on the previous one (${fmt(scoutPrice(10))}, ${fmt(scoutPrice(11))}, ${fmt(scoutPrice(12))} …)</li>
      </ul>
      Every unlock adds to your scouting bills and lowers your final portfolio. Only you see what you unlock, and you can only scout with cash you're free to spend. <b>No time limit</b> on signings.</li>
    <li>🕵️ <b>Special scouts</b> (fixed price, don't affect the unlock price ladder):
      <ul>
        <li>🌟 <b>Superstar Scout</b>, ${fmt(SPECIAL_SCOUTS.superstar.cost)}, <b>once per game</b>: shows whether a prospect's valuation rises or falls over the next two seasons.</li>
        <li>🧢 <b>Amateur Scout</b>, ${fmt(SPECIAL_SCOUTS.amateur.cost)}, <b>twice per game</b>: shows a prospect's age as a 3-year range (e.g. 21–23). The real age could be anywhere in it.</li>
      </ul></li>
    <li>🃏 <b>Destiny cards</b> in ${DESTINY_SEASONS.map(s => SEASONS[s]).join(", ")}: before that season's signings, everyone picks one of ${DESTINY_CHOICES} face-down cards. It takes effect straight away, and everyone sees which card you drew (in the log and the Participants list):
      <ul class="dlist">${Object.values(DESTINY_CARDS).map(c => `<li>${c.icon} <b>${c.name}</b> ${c.good ? "" : "(bad)"}: ${c.text}</li>`).join("")}</ul>`
    : `⏱ <b>${PICK_SECONDS} seconds per signing.</b> If you haven't chosen when the clock runs out, the first player you can afford is signed for you (or the turn is skipped if you can't afford any).`;
  return `
  <ul class="rules">
    <li><b>Sign players every season:</b> 2 in 2016/17, then 1 each season, so squads reach 11 by 2025/26. The first pick rotates every round: A B, B A, A B… or A B C, B C A, C A B…. You can skip a season's signing and keep the cash; the slot carries over to next season.</li>
    <li>${signingRule}</li>
    <li>${modeRule}</li>
    <li>🔒 <b>Everything stays sealed.</b> You never learn who you signed, and you never see a player's value change. Each season you only see your players' age, league and stats.</li>
    <li><b>Transfer windows: 2019/20, 2023/24 and 2025/26.</b> Sell up to ${MAX_SALES} players without knowing what they're worth. The price is revealed only once you've sold. Then sign a replacement for each open slot or keep the cash.</li>
    <li>© <b>Captain:</b> after the last signings in 2025/26, you pick one of your players as captain, still without seeing values. Their value change counts <b>double</b>: a player bought for $20m and worth $50m adds an extra $30m; one bought for $50m and worth $20m costs you an extra $30m.</li>
    <li><b>Final valuation (summer 2026):</b> everything is revealed. Portfolio = cash + squad value + captain bonus${scoutMode ? " (scouting bills have already come out of your cash)" : ""}. <b>The biggest portfolio wins.</b></li>
  </ul>`;
}

let setupRows = [
  { name: "Player 1", type: "human", diff: "normal" },
  { name: BOT_NAMES[0], type: "bot", diff: "normal" },
];

function renderPreGame() {
  $("#season-info").innerHTML = NET && NET.role === "host" ? `🌐 Room <b>${NET.code}</b>` : "";
  $("#timeline").innerHTML = "";
  $("#history").innerHTML = `<p class="note">Portfolio totals appear here at the end of the game.</p>`;
  $("#log").innerHTML = "";
  $("#panel-you").innerHTML = `<h2>Your portfolio</h2><p class="note">Start or join a game to build your squad.</p>`;
  $("#panel-bot").innerHTML = `<h2>Participants</h2><p class="note">2–${MAX_PARTICIPANTS} participants, humans or bots.</p>`;
  $("#btn-new").hidden = true;
  document.title = "Billion Dollar XI";
  if (MV.lastKey !== null) { MV.lastKey = null; setView("play"); }   // back from a game: show the setup
  const st = $("#stage");
  if (NET && NET.role === "host") return renderHostLobby(st);
  if (NET && NET.role === "guest") return renderGuestStatus(st);
  renderSetupTabs(st);
}

function renderSetupTabs(st) {
  const tabs = [["local", "📱 Play on this device"], ["host", "🌐 Host an online game"], ["join", "🔗 Join an online game"]];
  let body = "";
  if (UI.tab === "local") body = localSetupHtml();
  if (UI.tab === "host") body = `
    <p class="sub">Create a room, then send the room code to your friends. They'll play from their own phones or computers, wherever they are. Keep this tab open: your browser runs the game.</p>
    <label for="in-host-name">Your name</label>
    <input id="in-host-name" maxlength="20" value="${esc(UI.hostName)}" placeholder="e.g. Sam">
    <div class="actions"><button class="btn" id="btn-create">Create room</button></div>
    ${UI.status ? `<p class="note">${esc(UI.status)}</p>` : ""}`;
  if (UI.tab === "join") body = `
    <p class="sub">Ask the host for their room code.</p>
    <label for="in-join-name">Your name</label>
    <input id="in-join-name" maxlength="20" value="${esc(UI.joinName)}" placeholder="e.g. Alex">
    <label for="in-join-code">Room code</label>
    <input id="in-join-code" maxlength="5" value="${esc(UI.joinCode)}" placeholder="e.g. KX7P2" style="text-transform:uppercase;letter-spacing:3px">
    <div class="actions"><button class="btn" id="btn-join">Join</button></div>
    ${UI.status ? `<p class="note">${esc(UI.status)}</p>` : ""}`;
  st.innerHTML = `
    <div class="setup">
      <h2>Invest ${fmt(BUDGET)} in footballers</h2>
      <p class="sub">Every participant starts in 2016/17 with ${fmt(BUDGET)}. Build an 11-player portfolio (4-3-3) one season at a time over ten seasons, and finish with the most valuable portfolio. Budget carefully: the money has to last until 2025/26.</p>
      ${UI.tab === "join" ? rulesHtml(null) : `${modePickerHtml()}${rulesHtml(UI.gameMode)}`}
      <div class="tabs">${tabs.map(([k, l]) => `<button class="tab ${UI.tab === k ? "on" : ""}" data-tab="${k}">${l}</button>`).join("")}</div>
      ${UI.error ? `<p class="down"><b>${esc(UI.error)}</b></p>` : ""}
      ${body}
      <p class="note">Values are approximate Transfermarkt-style market values (€m, shown as $m) and approximate league stats.</p>
    </div>`;
  st.querySelectorAll("[data-tab]").forEach(b => b.onclick = () => { UI.tab = b.dataset.tab; UI.error = ""; UI.status = ""; renderPreGame(); });
  bindModePicker(st, renderPreGame);
  if (UI.tab === "local") bindLocalSetup(st);
  if (UI.tab === "host") {
    $("#in-host-name").oninput = e => (UI.hostName = e.target.value);
    $("#btn-create").onclick = () => createRoom(cleanName(UI.hostName, "Host"));
  }
  if (UI.tab === "join") {
    $("#in-join-name").oninput = e => (UI.joinName = e.target.value);
    $("#in-join-code").oninput = e => (UI.joinCode = e.target.value.toUpperCase());
    $("#btn-join").onclick = () => {
      const code = UI.joinCode.trim().toUpperCase();
      if (!/^[A-Z0-9]{5}$/.test(code)) { UI.error = "Room codes are 5 letters/numbers."; return renderPreGame(); }
      joinRoom(cleanName(UI.joinName, "Guest"), code);
    };
  }
}

function localSetupHtml() {
  const rowsHtml = setupRows.map((r, i) => `
    <div class="prow">
      <input data-i="${i}" class="in-name" maxlength="20" value="${esc(r.name)}" aria-label="Name of participant ${i + 1}">
      <select data-i="${i}" class="in-type" aria-label="Type of participant ${i + 1}">
        <option value="human" ${r.type === "human" ? "selected" : ""}>Human</option>
        <option value="easy" ${r.type === "bot" && r.diff === "easy" ? "selected" : ""}>Bot: easy</option>
        <option value="normal" ${r.type === "bot" && r.diff === "normal" ? "selected" : ""}>Bot: normal</option>
        <option value="hard" ${r.type === "bot" && r.diff === "hard" ? "selected" : ""}>Bot: hard</option>
      </select>
      <button class="btn ghost small" data-rm="${i}" ${setupRows.length <= MIN_PARTICIPANTS ? "disabled" : ""} aria-label="Remove participant ${i + 1}">✕</button>
    </div>`).join("");
  return `
    <p class="sub">Several humans on one device play pass-and-play: before each private turn the game asks you to hand the device over.</p>
    <h3>Participants (${MIN_PARTICIPANTS}–${MAX_PARTICIPANTS})</h3>
    <div class="plist">${rowsHtml}</div>
    <div class="actions">
      <button class="btn ghost" id="btn-add-human" ${setupRows.length >= MAX_PARTICIPANTS ? "disabled" : ""}>+ Add human</button>
      <button class="btn ghost" id="btn-add-bot" ${setupRows.length >= MAX_PARTICIPANTS ? "disabled" : ""}>+ Add bot</button>
    </div>
    <div class="actions"><button class="btn" id="btn-start">Start the game</button></div>`;
}

function modePickerHtml() {
  return `
    <h3>Game mode</h3>
    <div class="modes">${Object.entries(GAME_MODES).map(([k, m]) =>
      `<button class="tab ${UI.gameMode === k ? "on" : ""}" data-gamemode="${k}" aria-pressed="${UI.gameMode === k}">${m.label}</button>`).join("")}</div>
    <p class="note">${GAME_MODES[UI.gameMode].desc}</p>`;
}
function bindModePicker(st, rerender) {
  st.querySelectorAll("[data-gamemode]").forEach(b => b.onclick = () => { UI.gameMode = b.dataset.gamemode; rerender(); });
}

function uniqueNames(names) {
  const used = new Set();
  return names.map(n => { let name = n; while (used.has(name)) name += " II"; used.add(name); return name; });
}

function bindLocalSetup(st) {
  st.querySelectorAll(".in-name").forEach(inp => inp.oninput = () => { setupRows[+inp.dataset.i].name = inp.value; });
  st.querySelectorAll(".in-type").forEach(sel => sel.onchange = () => {
    const r = setupRows[+sel.dataset.i];
    if (sel.value === "human") r.type = "human"; else { r.type = "bot"; r.diff = sel.value; }
  });
  st.querySelectorAll("button[data-rm]").forEach(b => b.onclick = () => { setupRows.splice(+b.dataset.rm, 1); renderPreGame(); });
  const add = type => {
    const name = type === "human" ? `Player ${setupRows.filter(r => r.type === "human").length + 1}` : BOT_NAMES.find(b => !setupRows.some(r => r.name === b)) || `Bot ${setupRows.length + 1}`;
    setupRows.push({ name, type, diff: "normal" });
    renderPreGame();
  };
  $("#btn-add-human").onclick = () => add("human");
  $("#btn-add-bot").onclick = () => add("bot");
  $("#btn-start").onclick = () => {
    const names = uniqueNames(setupRows.map((r, i) => cleanName(r.name, r.type === "human" ? `Player ${i + 1}` : `Bot ${i + 1}`)));
    newGame(setupRows.map((r, i) => ({ name: names[i], type: r.type, diff: r.diff })), false, UI.gameMode);
  };
}

function seatLabel(seat) {
  if (seat.type === "host") return "Host";
  if (seat.type === "bot") return `Bot · ${seat.diff}`;
  return "Online";
}

function seatListHtml(forToken) {
  return NET.seats.map((seat, i) => {
    const c = seat.token && NET.conns.get(seat.token);
    const dot = seat.type === "remote" ? `<span class="dot ${c && c.open ? "on" : "off"}"></span>` : "";
    const you = (forToken && seat.token === forToken) || (!forToken && seat.type === "host") ? " (you)" : "";
    const rm = !forToken && seat.type === "bot" ? `<button class="btn ghost small" data-rmseat="${i}" aria-label="Remove ${esc(seat.name)}">✕</button>` : "";
    return `<div class="pcard"><div class="hdr"><b>${dot}${esc(seat.name)}${you}</b><span><span class="tag">${seatLabel(seat)}</span> ${rm}</span></div></div>`;
  }).join("");
}

function renderHostLobby(st) {
  const full = NET.seats.length >= MAX_PARTICIPANTS;
  st.innerHTML = `
    <div class="setup">
      <h2>🌐 Your online room</h2>
      <div class="roomcode">${NET.code}</div>
      <p class="sub">Send this code to your friends. They open the game, choose <b>Join an online game</b> and type it in. Keep this tab open while you play: your browser runs the game.</p>
      ${modePickerHtml()}
      ${rulesHtml(UI.gameMode)}
      <h3>Players (${NET.seats.length}/${MAX_PARTICIPANTS})</h3>
      <div class="plist">${seatListHtml(null)}</div>
      <div class="actions">
        <select id="in-bot-diff" aria-label="Bot difficulty"><option value="easy">Bot: easy</option><option value="normal" selected>Bot: normal</option><option value="hard">Bot: hard</option></select>
        <button class="btn ghost" id="btn-add-bot" ${full ? "disabled" : ""}>+ Add bot</button>
      </div>
      <div class="actions">
        <button class="btn" id="btn-start-online" ${NET.seats.length < MIN_PARTICIPANTS ? "disabled" : ""}>Start the game</button>
        <button class="btn ghost" id="btn-close-room">Close room</button>
      </div>
      ${NET.seats.length < MIN_PARTICIPANTS ? `<p class="note">Waiting for at least one more player. A friend can join, or you can add a bot.</p>` : ""}
      ${FORCE_RELAY ? `<p class="note">🧪 Relay-only test mode (?relay=1): connections from this tab go through the TURN relay only.</p>` : ""}
      ${hasRelay() ? "" : `<p class="note">⚠️ No relay (TURN) server is set up, so friends on a <b>different network</b> (e.g. mobile data) may not be able to connect. Friends on the same Wi-Fi are fine. See "Online play across networks" in the README.</p>`}
    </div>`;
  $("#panel-bot").innerHTML = `<h2>Participants</h2>${seatListHtml(null)}`;
  st.querySelectorAll("[data-rmseat]").forEach(b => b.onclick = () => { NET.seats.splice(+b.dataset.rmseat, 1); update(); });
  bindModePicker(st, update);   // update() also re-sends the lobby so guests see the chosen mode
  $("#btn-add-bot").onclick = () => {
    const diff = $("#in-bot-diff").value;
    const name = BOT_NAMES.find(n => !NET.seats.some(s => s.name === n)) || `Bot ${NET.seats.length + 1}`;
    NET.seats.push({ name, type: "bot", diff });
    update();
  };
  $("#btn-start-online").onclick = startOnlineGame;
  $("#btn-close-room").onclick = closeRoom;
}

// What a guest sees before the game starts (built on the host, sent to the guest).
function lobbyRegionsForGuest(seat) {
  const host = NET.seats.find(s => s.type === "host");
  return {
    info: `🌐 Room <b>${NET.code}</b>`, timeline: "", history: `<p class="note">Portfolio totals appear here at the end of the game.</p>`, log: "",
    left: `<h2>${esc(seat.name)}</h2><p class="note">You're in! Your squad will appear here once the game starts.</p>`,
    right: `<h2>Participants</h2>${seatListHtml(seat.token)}`,
    stage: `<div class="setup">
      <h2>✅ Connected to ${esc(host ? host.name : "the host")}'s room</h2>
      <div class="roomcode">${NET.code}</div>
      <p class="sub">Waiting for the host to start the game…</p>
      ${FORCE_RELAY ? `<p class="note">🧪 This room's host is in relay-only test mode.</p>` : ""}
      <p><b>Game mode: ${GAME_MODES[UI.gameMode].label}</b></p>
      ${rulesHtml(UI.gameMode)}
    </div>`,
    yourTurn: false,
  };
}

function renderGuestStatus(st) {
  st.innerHTML = `
    <div class="handoff">
      <div class="big-emoji">${NET.lost ? "📡" : "🔌"}</div>
      <h2>${NET.lost ? "Lost connection to the host" : `Connecting to room ${esc(NET.code)}…`}</h2>
      <p class="sub">${NET.lost ? "The host may have closed their tab, or the internet dropped. If the host's game is still open you can rejoin and keep your seat." : "Hold on a moment."}</p>
      ${NET.lost ? `<div class="actions" style="justify-content:center"><button class="btn" id="btn-rejoin">Rejoin room ${esc(NET.code)}</button><button class="btn ghost" id="btn-leave">Leave</button></div>` : ""}
    </div>`;
  if (NET.lost) {
    $("#btn-rejoin").onclick = () => { const { name, code } = NET; leaveNet(); joinRoom(name, code); };
    $("#btn-leave").onclick = () => { leaveNet(); renderPreGame(); };
  }
}

// ================= NETWORKING =================
let peerLoading = null;
function loadPeerJs() {
  if (window.Peer) return Promise.resolve();
  if (!peerLoading) {
    peerLoading = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = PEERJS_URL;
      s.onload = () => (window.Peer ? resolve() : reject(new Error("PeerJS missing")));
      s.onerror = () => { peerLoading = null; reject(new Error("load failed")); };
      document.head.appendChild(s);
    });
  }
  return peerLoading;
}

const randomCode = () => Array.from({ length: 5 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[rand(32)]).join("");

function guestToken() {
  try {
    let t = sessionStorage.getItem("bdxi-token");
    if (!t) { t = Math.random().toString(36).slice(2) + Date.now().toString(36); sessionStorage.setItem("bdxi-token", t); }
    return t;
  } catch (e) {
    window.__bdxiToken = window.__bdxiToken || Math.random().toString(36).slice(2) + Date.now().toString(36);
    return window.__bdxiToken;
  }
}

function netError(err) {
  const type = err && err.type;
  if (type === "peer-unavailable") return "No room with that code. Check the code, and that the host still has the game open.";
  if (type === "network" || type === "server-error" || type === "socket-error") return "Couldn't reach the connection service. Check your internet connection and try again.";
  if (type === "browser-incompatible") return "This browser doesn't support online play. Try an up-to-date Chrome, Edge, Firefox or Safari.";
  return `Connection problem (${type || err}). Please try again.`;
}

// ---- Connection servers ----
// Browsers on the same network can always connect directly. Across different networks (mobile data,
// offices, many home routers) a direct link often fails, and the traffic has to go through a TURN relay.
// STUN servers are free and built in; a TURN relay needs an account. Either:
//  - Metered (free tier): sign up at https://www.metered.ca/stun-turn, create an app, and fill in
//    METERED_APP (the "xyz" in xyz.metered.live) and METERED_API_KEY below; or
//  - paste any TURN server you have into TURN_SERVERS, e.g.
//    { urls: "turn:turn.example.com:443?transport=tcp", username: "user", credential: "pass" }
// Every player's copy of the game needs the same settings.
const METERED_APP = "billionxi";
const METERED_API_KEY = "83e36e9eebc30730e0cd2408fee234914f5a";
const TURN_SERVERS = [];
const STUN_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:stun.cloudflare.com:3478" },
];
const CONNECT_TIMEOUT_MS = 20000;
const hasRelay = () => TURN_SERVERS.length > 0 || !!(METERED_APP && METERED_API_KEY);

let iceServersCache = null;
function getIceServers() {
  if (iceServersCache) return iceServersCache;
  const base = [...STUN_SERVERS, ...TURN_SERVERS];
  iceServersCache = !(METERED_APP && METERED_API_KEY) ? Promise.resolve(base)
    : fetch(`https://${METERED_APP}.metered.live/api/v1/turn/credentials?apiKey=${encodeURIComponent(METERED_API_KEY)}`)
        .then(r => (r.ok ? r.json() : []))
        .then(list => [...base, ...(Array.isArray(list) ? list : [])])
        .catch(() => base);                               // relay unavailable: still try direct connections
  return iceServersCache;
}
// Testing aid: open the game with ?relay=1 to force this tab to connect ONLY through the TURN relay.
// If two tabs on one computer still connect, the relay works (a direct link isn't allowed).
const FORCE_RELAY = (() => { try { return new URLSearchParams(location.search).get("relay") === "1"; } catch (e) { return false; } })();
// PeerJS + our ICE servers, loaded together.
const netReady = () => Promise.all([loadPeerJs(), getIceServers()]).then(([, iceServers]) => {
  const config = { iceServers };
  if (FORCE_RELAY) { config.iceTransportPolicy = "relay"; console.info("[net] relay-only mode: connecting through TURN only"); }
  return { config };
});

function createRoom(name, attempt = 0) {
  UI.error = ""; UI.status = "Creating room…"; renderPreGame();
  netReady().then(opts => {
    const code = randomCode();
    const peer = new Peer(PEER_PREFIX + code, opts);
    peer.on("open", () => {
      NET = { role: "host", peer, code, seats: [{ name, type: "host" }], conns: new Map() };
      UI.status = "";
      update();
    });
    peer.on("connection", conn => {
      conn.on("data", msg => onHostMessage(conn, msg));
      conn.on("close", () => onConnClose(conn));
      conn.on("error", () => onConnClose(conn));
    });
    peer.on("disconnected", () => { if (NET && NET.peer === peer && !peer.destroyed) peer.reconnect(); });
    peer.on("error", err => {
      if (err.type === "unavailable-id" && attempt < 3) { peer.destroy(); return createRoom(name, attempt + 1); }
      if (NET && NET.peer === peer) return;               // errors after the room is up (e.g. one guest's connection) are non-fatal
      peer.destroy();
      UI.status = ""; UI.error = netError(err); renderPreGame();
    });
  }).catch(() => { UI.status = ""; UI.error = "Couldn't load the online-play library. Check your internet connection."; renderPreGame(); });
}

function onHostMessage(conn, msg) {
  if (!msg || typeof msg !== "object" || !NET) return;
  if (msg.t === "hello") {
    const token = String(msg.token || "").slice(0, 60);
    if (!token) return;
    conn.token = token;
    if (S) {                                              // game running: only returning players may (re)join
      const team = S.teams.find(t => t.remote === token);
      if (!team) { conn.send({ t: "error", msg: "This room's game has already started." }); setTimeout(() => conn.close(), 300); return; }
      NET.conns.set(token, conn);
      if (S.online) log(`${team.name} reconnected.`);
      return update();
    }
    let seat = NET.seats.find(s => s.token === token);
    if (!seat) {
      if (NET.seats.length >= MAX_PARTICIPANTS) { conn.send({ t: "error", msg: "This room is full." }); setTimeout(() => conn.close(), 300); return; }
      const [name] = uniqueNames([...NET.seats.map(s => s.name), cleanName(msg.name, "Guest")]).slice(-1);
      seat = { name, type: "remote", token };
      NET.seats.push(seat);
    }
    NET.conns.set(token, conn);
    return update();
  }
  if (msg.t === "act" && S && S.online) {
    const team = S.teams.find(t => t.remote && t.remote === conn.token && t.type === "human");
    if (team) handleAction(team.id, String(msg.act), msg.arg, false);
    else conn.send({ t: "view", regions: renderRegions(null) });
  }
}

function onConnClose(conn) {
  if (!NET || NET.role !== "host" || !conn.token || NET.conns.get(conn.token) !== conn) return;
  NET.conns.delete(conn.token);
  if (!S) NET.seats = NET.seats.filter(s => s.token !== conn.token);   // left the lobby
  else { const t = S.teams.find(x => x.remote === conn.token); if (t) log(`${t.name} disconnected.`); }
  update();
}

function startOnlineGame() {
  if (!NET || NET.seats.length < MIN_PARTICIPANTS) return;
  const names = uniqueNames(NET.seats.map(s => s.name));
  newGame(NET.seats.map((s, i) => ({
    name: names[i], type: s.type === "bot" ? "bot" : "human", diff: s.diff || "normal", remote: s.type === "remote" ? s.token : null,
  })), true, UI.gameMode);
}

function closeRoom() {
  if (NET && NET.peer) { NET.conns.forEach(c => { try { c.send({ t: "error", msg: "The host closed the room." }); } catch (e) {} }); setTimeout(() => NET && NET.peer && NET.peer.destroy(), 200); }
  setTimeout(() => { NET = null; S = null; renderPreGame(); }, 250);
}

function joinRoom(name, code) {
  UI.error = ""; UI.joinName = name; UI.joinCode = code;
  netReady().then(opts => {
    const peer = new Peer(opts);
    NET = { role: "guest", peer, conn: null, code, name, token: guestToken(), lost: false, gotView: false };
    renderPreGame();
    // Give up with a clear message if we never reach the host (typically: different networks, no relay).
    const fail = msg => {
      if (!NET || NET.peer !== peer || NET.gotView) return;
      leaveNet();
      UI.tab = "join"; UI.error = msg; renderPreGame();
    };
    const blockedMsg = hasRelay()
      ? "Couldn't connect to the host. Check that the host's room is still open and that you both have a working internet connection, then try again."
      : "Found the room but couldn't connect to the host. This usually happens when you're on different networks (e.g. mobile data vs. home Wi-Fi) and the game has no relay (TURN) server set up. See \"Online play across networks\" in the README.";
    const timer = setTimeout(() => fail(blockedMsg), CONNECT_TIMEOUT_MS);
    peer.on("open", () => {
      const conn = peer.connect(PEER_PREFIX + code, { reliable: true, serialization: "json" });
      NET.conn = conn;
      conn.on("open", () => { clearTimeout(timer); conn.send({ t: "hello", name, token: NET.token }); });
      conn.on("data", onGuestMessage);
      conn.on("error", () => { if (!NET || !NET.gotView) { clearTimeout(timer); fail(blockedMsg); } });
      conn.on("close", () => {
        if (!NET || NET.conn !== conn || NET.closed) return;
        if (!NET.gotView) { clearTimeout(timer); return fail(blockedMsg); }
        NET.lost = true; renderPreGame();
      });
    });
    peer.on("error", err => {
      if (!NET || NET.peer !== peer) return;
      if (NET.gotView && err.type !== "peer-unavailable") { NET.lost = true; return renderPreGame(); }
      clearTimeout(timer);
      leaveNet();
      UI.tab = "join"; UI.error = netError(err); renderPreGame();
    });
  }).catch(() => { UI.tab = "join"; UI.error = "Couldn't load the online-play library. Check your internet connection."; renderPreGame(); });
}

function onGuestMessage(msg) {
  if (!msg || typeof msg !== "object" || !NET) return;
  if (msg.t === "view" && msg.regions) { NET.gotView = true; NET.lost = false; applyRegions(msg.regions); $("#btn-new").hidden = true; }
  if (msg.t === "error") { NET.closed = true; leaveNet(); UI.tab = "join"; UI.error = String(msg.msg || "Disconnected."); renderPreGame(); }
}

function leaveNet() {
  if (NET && NET.peer) { try { NET.peer.destroy(); } catch (e) {} }
  NET = null;
}

// ================= RESET =================
function reset() {
  clearPickTimer();
  S = null;
  if (NET && NET.role === "host") NET.seats = NET.seats.filter(s => s.type !== "remote" || (NET.conns.get(s.token) && NET.conns.get(s.token).open));
  update();
}

$("#btn-new").onclick = () => { if (S && S.online) reset(); else reset(); };
window.addEventListener("beforeunload", e => {
  if ((S && S.online) || (NET && NET.role === "guest" && NET.gotView)) { e.preventDefault(); e.returnValue = ""; }
});
update();
