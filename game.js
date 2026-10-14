(() => {
'use strict';

const canvas = document.getElementById('world');
const ctx = canvas.getContext('2d');
const $ = id => document.getElementById(id);
const TILE = 16;
const COLORS = ['#d9aa61', '#719ed1', '#d77874', '#91b66a', '#b38bce'];
const NAMES = ['Aurelia', 'Frostmark', 'Redvale', 'Verdant', 'Moonfall'];
const RULERS = ['Queen Elara', 'King Torven', 'Duke Marik', 'Queen Sera', 'King Oryn'];
const HEIRS = ['Princess Lyra', 'Prince Edrin', 'Lady Veyra', 'Prince Calen', 'Princess Nyra'];
const DYNASTIES = ['House Sunmere', 'House Ironpine', 'House Redwyne', 'House Greenvale', 'House Nightfall'];
const TECHS = ['Masonry', 'Crop Rotation', 'Ironworking', 'Road Networks', 'Advanced Navigation', 'Guild Economy', 'Fortification', 'Printing Press'];
let w = 58, h = 36, tiles = [], kingdoms = [], year = 1, playing = false;
let showTerritory = true, showTerrain = true, showEvents = true, tool = 'inspect';
let selected = 0, opponent = 1, events = [], timer = null, seed = 1;
let diplomacy = { wars: [], alliances: [], tradePacts: [] };

function rand() { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; }
function idx(x, y) { return y * w + x; }
function inBounds(x, y) { return x >= 0 && y >= 0 && x < w && y < h; }
function neighbours(x, y) { return [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]].filter(p => inBounds(p[0], p[1])); }
function terrainAt(x, y) { return tiles[idx(x, y)]; }
function realm(id) { return kingdoms[id]; }
function territoryCount(id) { let n = 0; for (const t of tiles) if (t.owner === id) n++; return n; }
function settlementCount(id) { let n = 0; for (const t of tiles) if (t.owner === id && t.settlement) n++; return n; }
function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function addEvent(text) { events.unshift({ year, text }); events = events.slice(0, 80); renderEvents(); }
function samePair(t, a, b) { return (t.a === a && t.b === b) || (t.a === b && t.b === a); }
function treaty(list, a, b) { return list.find(t => samePair(t, a, b)) || null; }
function warBetween(a, b) { return treaty(diplomacy.wars, a, b); }
function adjustRelation(a, b, amount) {
  if (a === b || !kingdoms[a] || !kingdoms[b]) return;
  kingdoms[a].relations[b] = Math.max(-100, Math.min(100, (kingdoms[a].relations[b] || 0) + amount));
  kingdoms[b].relations[a] = Math.max(-100, Math.min(100, (kingdoms[b].relations[a] || 0) + amount));
}
function borderTiles(fromId, toId) {
  const out = [];
  for (let i = 0; i < tiles.length; i++) {
    if (tiles[i].owner !== fromId) continue;
    const x = i % w, y = Math.floor(i / w);
    if (neighbours(x, y).some(p => tiles[idx(p[0], p[1])].owner === toId)) out.push(i);
  }
  return out;
}
function captureBorderTile(winner, loser) {
  const candidates = borderTiles(loser.id, winner.id);
  if (!candidates.length) return false;
  const t = tiles[candidates[Math.floor(rand() * candidates.length)]];
  t.owner = winner.id; t.rebel = false;
  if (t.settlement) { winner.population += 350; loser.population = Math.max(200, loser.population - 350); }
  return true;
}
function genWorld() {
  stopSimulation();
  seed = (Date.now() ^ Math.floor(Math.random() * 1000000000)) >>> 0;
  w = Number($('mapSize').value) || 58;
  h = Math.round(w * 0.62);
  canvas.width = w * TILE; canvas.height = h * TILE;
  tiles = Array.from({ length: w * h }, (_, i) => {
    const x = i % w, y = Math.floor(i / w);
    const edge = Math.min(x, y, w - 1 - x, h - 1 - y);
    const n = rand();
    const water = (edge < 2 && n < 0.75) || n < 0.12;
    return { terrain: water ? 'water' : n > 0.91 ? 'mountain' : n > 0.70 ? 'forest' : 'grass', owner: -1, settlement: false, fort: false, resource: rand() > 0.75 ? 'ore' : rand() > 0.65 ? 'food' : 'none', rebel: false };
  });
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const t = terrainAt(x, y);
    if (x > w * 0.25 && x < w * 0.29 && y > h * 0.12 && y < h * 0.82 && rand() < 0.58) t.terrain = 'water';
    if (y > h * 0.63 && y < h * 0.67 && x > w * 0.52 && x < w * 0.84 && rand() < 0.45) t.terrain = 'water';
  }
  const starts = [[Math.round(w * 0.18), Math.round(h * 0.22)], [Math.round(w * 0.78), Math.round(h * 0.22)], [Math.round(w * 0.22), Math.round(h * 0.76)], [Math.round(w * 0.52), Math.round(h * 0.43)], [Math.round(w * 0.82), Math.round(h * 0.73)]];
  kingdoms = NAMES.map((name, i) => ({
    id: i, name, color: COLORS[i], x: starts[i][0], y: starts[i][1],
    population: Math.floor(4000 + rand() * 6000), treasury: Math.floor(100 + rand() * 400),
    military: Math.floor(250 + rand() * 300), stability: 65 + Math.floor(rand() * 30),
    food: 120 + Math.floor(rand() * 120), tech: 1, ruler: RULERS[i], heir: HEIRS[i],
    dynasty: DYNASTIES[i], rulerAge: 26 + Math.floor(rand() * 28), aggression: 0.25 + rand() * 0.65, warExhaustion: 0, civilWar: null,
    relations: Array.from({ length: 5 }, (_, j) => i === j ? 100 : Math.floor(rand() * 60)), alive: true
  }));
  kingdoms.forEach(k => {
    let placed = 0, tries = 0;
    while (placed < 35 && tries++ < 700) {
      const x = k.x + Math.floor(rand() * 13 - 6), y = k.y + Math.floor(rand() * 13 - 6);
      if (!inBounds(x, y)) continue;
      const t = terrainAt(x, y);
      if (t.terrain === 'water' || t.owner !== -1) continue;
      t.owner = k.id; placed++;
    }
    const home = terrainAt(k.x, k.y);
    home.terrain = 'grass'; home.owner = k.id; home.settlement = true; home.fort = true;
  });
  year = 1; selected = 0; opponent = 1; events = [];
  diplomacy = { wars: [], alliances: [], tradePacts: [] };
  addEvent('Five realms rose across an untamed world. The age of kingdoms begins.');
  addEvent('Rulers gathered their councils. Every alliance, ambition, and border is yet to be written.');
  renderAll();
}
function drawTile(t, x, y) {
  const px = x * TILE, py = y * TILE;
  const base = showTerrain ? ({ water: '#254a55', grass: '#426744', forest: '#294f3b', mountain: '#636b5b' }[t.terrain] || '#426744') : '#44513b';
  ctx.fillStyle = base; ctx.fillRect(px, py, TILE, TILE);
  if (showTerrain && t.terrain === 'water') {
    ctx.fillStyle = '#367080'; if ((x + y) % 3 === 0) ctx.fillRect(px + 4, py + 7, 6, 1); if ((x - y) % 5 === 0) ctx.fillRect(px + 9, py + 3, 3, 1);
  } else if (showTerrain && t.terrain === 'grass') {
    ctx.fillStyle = '#587c4b'; if ((x * 3 + y) % 5 === 0) ctx.fillRect(px + 3, py + 4, 2, 2); if ((x + y * 2) % 7 === 0) ctx.fillRect(px + 11, py + 11, 2, 2);
  } else if (showTerrain && t.terrain === 'forest') {
    ctx.fillStyle = '#182f27'; ctx.fillRect(px + 4, py + 3, 8, 8); ctx.fillRect(px + 2, py + 8, 12, 5); ctx.fillStyle = '#416e43'; ctx.fillRect(px + 6, py + 2, 4, 9);
  } else if (showTerrain && t.terrain === 'mountain') {
    ctx.fillStyle = '#9aa391'; ctx.fillRect(px + 2, py + 7, 12, 7); ctx.fillStyle = '#c0c6b4'; ctx.fillRect(px + 5, py + 3, 7, 6); ctx.fillStyle = '#737d70'; ctx.fillRect(px + 9, py + 9, 4, 4);
  }
  if (showTerritory && t.owner >= 0) {
    ctx.fillStyle = COLORS[t.owner] + '48'; ctx.fillRect(px, py, TILE, TILE);
    ctx.fillStyle = COLORS[t.owner];
    if (x === 0 || terrainAt(x - 1, y).owner !== t.owner) ctx.fillRect(px, py, 1, TILE);
    if (x === w - 1 || terrainAt(x + 1, y).owner !== t.owner) ctx.fillRect(px + TILE - 1, py, 1, TILE);
    if (y === 0 || terrainAt(x, y - 1).owner !== t.owner) ctx.fillRect(px, py, TILE, 1);
    if (y === h - 1 || terrainAt(x, y + 1).owner !== t.owner) ctx.fillRect(px, py + TILE - 1, TILE, 1);
  }
  if (t.rebel) { ctx.fillStyle = '#b83440aa'; ctx.fillRect(px, py, TILE, TILE); ctx.strokeStyle = '#ff8b8b'; ctx.lineWidth = 1; ctx.strokeRect(px + 1, py + 1, TILE - 2, TILE - 2); ctx.fillStyle = '#ffd0c6'; ctx.fillRect(px + 4, py + 4, 8, 2); ctx.fillRect(px + 7, py + 4, 2, 8); }
  if (t.owner >= 0 && t.settlement) {
    ctx.fillStyle = '#1b201b'; ctx.fillRect(px + 3, py + 5, 10, 8); ctx.fillStyle = '#d8c59a'; ctx.fillRect(px + 4, py + 6, 8, 6); ctx.fillStyle = '#8e4942'; ctx.fillRect(px + 3, py + 4, 10, 3); ctx.fillStyle = '#e7d6a5'; ctx.fillRect(px + 7, py + 8, 2, 4);
  }
  if (t.owner >= 0 && t.fort) {
    ctx.fillStyle = '#332e29'; ctx.fillRect(px + 5, py + 2, 7, 5); ctx.fillStyle = '#dad3b5'; ctx.fillRect(px + 6, py + 3, 5, 4); ctx.fillStyle = '#887d64'; ctx.fillRect(px + 5, py + 2, 7, 1);
  }
}
function renderMap() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) drawTile(terrainAt(x, y), x, y);
  ctx.save(); ctx.lineWidth = 2; ctx.setLineDash([4, 4]);
  diplomacy.tradePacts.forEach(t => {
    const a = realm(t.a), b = realm(t.b); if (!a || !b) return;
    ctx.strokeStyle = '#e4c579'; ctx.beginPath(); ctx.moveTo(a.x * TILE + 8, a.y * TILE + 8); ctx.lineTo(b.x * TILE + 8, b.y * TILE + 8); ctx.stroke();
  });
  diplomacy.alliances.forEach(t => {
    const a = realm(t.a), b = realm(t.b); if (!a || !b) return;
    ctx.strokeStyle = '#9bc98b'; ctx.beginPath(); ctx.moveTo(a.x * TILE + 8, a.y * TILE + 8); ctx.lineTo(b.x * TILE + 8, b.y * TILE + 8); ctx.stroke();
  });
  ctx.restore();
  diplomacy.wars.forEach(war => (war.sieges || []).forEach(siege => { const x = siege.tileIndex % w, y = Math.floor(siege.tileIndex / w); if (!tiles[siege.tileIndex]) return; ctx.strokeStyle = '#f5d28a'; ctx.lineWidth = 2; ctx.strokeRect(x * TILE + 2, y * TILE + 2, TILE - 4, TILE - 4); ctx.fillStyle = '#f5d28a'; ctx.fillRect(x * TILE + 5, y * TILE + 5, 6, 2); }));
  kingdoms.forEach(k => { if (!k.alive) return;
    ctx.fillStyle = '#f4e6bd'; ctx.fillRect(k.x * TILE + 5, k.y * TILE + 3, 6, 6);
    ctx.fillStyle = k.color; ctx.fillRect(k.x * TILE + 6, k.y * TILE + 4, 4, 4);
  });
}
function renderKingdoms() {
  $('kingdomList').innerHTML = kingdoms.map(k =>
    '<button class="kingdom ' + (selected === k.id ? 'selected' : '') + '" data-id="' + k.id + '">' +
    '<span class="swatch" style="background:' + k.color + '"></span><span style="flex:1"><strong>' + escapeHtml(k.name) +
    '</strong><small>' + territoryCount(k.id) + ' tiles · ' + (k.alive ? 'Standing' : 'Fallen') +
    '</small></span><span style="color:var(--gold)">›</span></button>'
  ).join('');
  $('kingdomList').querySelectorAll('[data-id]').forEach(b => b.onclick = () => {
    selected = Number(b.dataset.id);
    if (opponent === selected) opponent = (selected + 1) % kingdoms.length;
    renderKingdoms(); renderInfo();
  });
}
function meter(label, value, max, color) {
  const pct = Math.max(0, Math.min(100, value / Math.max(1, max) * 100));
  return '<div style="margin:9px 0"><div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:5px"><span>' + label +
    '</span><span>' + Math.round(value).toLocaleString() + '</span></div><div style="height:5px;background:#0e150f;border-radius:9px;overflow:hidden"><div style="height:100%;width:' +
    pct + '%;background:' + color + '"></div></div></div>';
}
function renderInfo() {
  const k = realm(selected);
  if (opponent === selected || !realm(opponent)) opponent = (selected + 1) % kingdoms.length;
  const target = realm(opponent), war = warBetween(k.id, target.id);
  const allied = !!treaty(diplomacy.alliances, k.id, target.id);
  const trading = !!treaty(diplomacy.tradePacts, k.id, target.id);
  const relation = k.relations[target.id] || 0;
  const options = kingdoms.filter(x => x.id !== selected).map(x => '<option value="' + x.id + '" ' + (x.id === opponent ? 'selected' : '') + '>' + escapeHtml(x.name) + '</option>').join('');
  const allyNames = diplomacy.alliances.filter(t => t.a === k.id || t.b === k.id).map(t => realm(t.a === k.id ? t.b : t.a).name);
  const tradeNames = diplomacy.tradePacts.filter(t => t.a === k.id || t.b === k.id).map(t => realm(t.a === k.id ? t.b : t.a).name);
  const warNames = diplomacy.wars.filter(t => t.a === k.id || t.b === k.id).map(t => realm(t.a === k.id ? t.b : t.a).name);
  $('kingdomInfo').innerHTML =
    '<div style="display:flex;align-items:center;gap:9px;margin-bottom:12px"><span class="swatch" style="width:17px;height:17px;background:' + k.color + '"></span><div><strong style="font-size:16px">' + escapeHtml(k.name) + '</strong><div class="smallnote">Realm ID · 0' + (k.id + 1) + ' · ' + territoryCount(k.id) + ' tiles</div></div></div>' +
    '<div class="realmmeta"><div><small>Ruler</small><strong>' + escapeHtml(k.ruler) + '</strong></div><div><small>Dynasty</small><strong>' + escapeHtml(k.dynasty) + '</strong></div><div><small>Heir</small><strong>' + escapeHtml(k.heir) + '</strong></div><div><small>Technology</small><strong>Level ' + k.tech + '</strong></div></div>' +
    '<div class="smallnote">POPULATION</div><div style="font-size:22px;font-weight:750;margin:2px 0 12px">' + k.population.toLocaleString() + '</div>' +
    meter('Territory', territoryCount(k.id), Math.max(1, tiles.length * 0.35), k.color) +
    meter('Treasury', k.treasury, 1000, '#d9b96f') + meter('Military', k.military, 800, '#d77874') +
    meter('Food stores', k.food, 500, '#9dc27d') + meter('Stability', k.stability, 100, '#91b66a') +
    '<div class="sectionlabel">Diplomacy & politics</div><label class="smallnote" for="opponentSelect">TARGET REALM</label>' +
    '<select id="opponentSelect" style="width:100%;margin:7px 0 10px">' + options + '</select>' +
    '<div class="realmmeta"><div><small>Relations</small><strong>' + relation + '/100</strong></div><div><small>Status</small><strong>' + (war ? 'At war' : allied ? 'Allied' : trading ? 'Trading' : 'Independent') + '</strong></div></div>' +
    '<div class="actionstack"><button id="improveRelation">✉ Improve relations<br><small>Cost: 25 treasury</small></button>' +
    '<button id="tradeAction">' + (trading ? '↯ End trade pact' : '⇄ Establish trade') + '</button>' +
    '<button id="allianceAction">' + (allied ? '⛓ End alliance' : '⚖ Propose alliance') + '</button>' +
    '<button id="warAction" class="' + (war ? 'primary' : '') + '">' + (war ? '☮ Offer peace' : '⚔ Declare war') + '</button></div>' +
    '<div class="diplomacyhint" style="font-size:10px;color:var(--muted);line-height:1.5;margin:9px 0">' +
    (war ? 'War score: ' + realm(war.a).name + ' ' + war.scoreA + ' · ' + realm(war.b).name + ' ' + war.scoreB + '. Exhaustion: ' + Math.round(war.exhaustionA || 0) + '/' + Math.round(war.exhaustionB || 0) + (war.sieges && war.sieges.length ? '. Active sieges: ' + war.sieges.map(s => realm(s.attacker).name + ' ' + Math.round(s.progress) + '%').join(', ') : '') + '.' :
      allied ? 'Defensive alliance active. Green dotted lines show allied realms.' :
      trading ? 'Trade route active. Both realms earn treasury income each year. Gold dotted line marks the route.' :
      'Improve relations to unlock alliances. Trade routes generate income over time.') + '</div>' +
    '<div class="sectionlabel">Realm relationships</div><div class="smallnote">' +
    (allyNames.length ? '🤝 Allies: ' + allyNames.map(escapeHtml).join(', ') + '<br>' : '') +
    (tradeNames.length ? '⇄ Trade partners: ' + tradeNames.map(escapeHtml).join(', ') + '<br>' : '') +
    (warNames.length ? '⚔ At war with: ' + warNames.map(escapeHtml).join(', ') : 'No active wars.') + '</div>' +
    '<button id="focusRealm" style="width:100%;margin-top:12px">⌖ Focus capital</button>' +
    '<button id="claimRealm" style="width:100%;margin-top:7px">♜ Claim nearby land</button>';
  $('opponentSelect').onchange = e => { opponent = Number(e.target.value); renderInfo(); };
  $('improveRelation').onclick = improveRelations;
  $('tradeAction').onclick = toggleTrade;
  $('allianceAction').onclick = toggleAlliance;
  $('warAction').onclick = () => war ? offerPeace() : declareWar();
  $('focusRealm').onclick = () => canvas.scrollIntoView({ behavior: 'smooth', block: 'center' });
  $('claimRealm').onclick = () => {
    tool = 'kingdom';
    document.querySelectorAll('[data-tool]').forEach(b => b.classList.toggle('active', b.dataset.tool === tool));
    addEvent('Choose an unclaimed land tile to claim for ' + k.name + '.');
  };
}
function renderEvents() {
  $('eventList').innerHTML = events.map(e => '<div class="event"><time>YEAR ' + String(e.year).padStart(3, '0') + '</time>' + escapeHtml(e.text) + '</div>').join('');
  $('eventCount').textContent = String(events.length).padStart(2, '0');
}
function renderAll() {
  renderMap(); renderKingdoms(); renderInfo(); renderEvents();
  const pop = kingdoms.reduce((sum, k) => sum + k.population, 0);
  $('popStat').textContent = pop >= 1000000 ? (pop / 1000000).toFixed(1) + 'M' : Math.round(pop / 1000) + 'K';
  $('settleStat').textContent = tiles.filter(t => t.settlement).length;
  $('kingdomStat').textContent = kingdoms.filter(k => k.alive).length;
  if ($('warStat')) $('warStat').textContent = diplomacy.wars.length;
  $('yearStat').textContent = year; $('dateTag').textContent = 'YEAR ' + String(year).padStart(3, '0');
  $('runState').textContent = playing ? '● SIMULATING' : '● PAUSED';
  $('play').innerHTML = playing ? '<span>Ⅱ</span>Pause' : '<span>▶</span>Play';
  $('play').classList.toggle('primary', !playing);
  saveLocalWorld();
}

function improveRelations() {
  const a = realm(selected), b = realm(opponent);
  if (a.treasury < 25) { addEvent(a.name + ' cannot afford a diplomatic mission to ' + b.name + '. Need 25 treasury.'); renderAll(); return; }
  a.treasury -= 25; adjustRelation(a.id, b.id, 18);
  addEvent(a.name + ' sent envoys to ' + b.name + '; relations improved.'); renderAll();
}
function toggleTrade() {
  const a = realm(selected), b = realm(opponent);
  if (warBetween(a.id, b.id)) { addEvent('Trade cannot be established while ' + a.name + ' and ' + b.name + ' are at war.'); renderAll(); return; }
  const existing = diplomacy.tradePacts.findIndex(t => samePair(t, a.id, b.id));
  if (existing >= 0) {
    diplomacy.tradePacts.splice(existing, 1); addEvent(a.name + ' ended its trade pact with ' + b.name + '.');
  } else {
    diplomacy.tradePacts.push({ a: a.id, b: b.id, formed: year }); adjustRelation(a.id, b.id, 10);
    addEvent(a.name + ' and ' + b.name + ' established a trade route. Both treasuries now benefit each year.');
  }
  renderAll();
}
function toggleAlliance() {
  const a = realm(selected), b = realm(opponent);
  if (warBetween(a.id, b.id)) { addEvent('Peace must come before an alliance can be formed.'); renderAll(); return; }
  const existing = diplomacy.alliances.findIndex(t => samePair(t, a.id, b.id));
  if (existing >= 0) {
    diplomacy.alliances.splice(existing, 1); adjustRelation(a.id, b.id, -8);
    addEvent(a.name + ' dissolved its alliance with ' + b.name + '.'); renderAll(); return;
  }
  if ((a.relations[b.id] || 0) < 35) { addEvent(b.name + ' rejected the alliance proposal. Improve relations or establish trade first.'); renderAll(); return; }
  diplomacy.alliances.push({ a: a.id, b: b.id, formed: year }); adjustRelation(a.id, b.id, 12);
  a.stability = Math.min(100, a.stability + 4); b.stability = Math.min(100, b.stability + 4);
  addEvent(a.name + ' and ' + b.name + ' signed a defensive alliance.'); renderAll();
}
function startWar(a, b, options = {}) {
  if (!a || !b || !a.alive || !b.alive || a.id === b.id || warBetween(a.id, b.id)) return false;
  const wasAllied = !!treaty(diplomacy.alliances, a.id, b.id);
  const wasTrading = !!treaty(diplomacy.tradePacts, a.id, b.id);
  diplomacy.alliances = diplomacy.alliances.filter(t => !samePair(t, a.id, b.id));
  diplomacy.tradePacts = diplomacy.tradePacts.filter(t => !samePair(t, a.id, b.id));
  diplomacy.wars.push({ a: a.id, b: b.id, started: year, scoreA: 0, scoreB: 0, exhaustionA: 0, exhaustionB: 0, sieges: [], campaigns: 0 });
  adjustRelation(a.id, b.id, -45);
  a.stability = Math.max(10, a.stability - 7); b.stability = Math.max(10, b.stability - 5);
  addEvent(options.betrayal && wasAllied
    ? a.name + ' BETRAYED its alliance with ' + b.name + ' and declared war. The old treaty is broken.'
    : a.name + ' declared war on ' + b.name + (wasAllied ? ', betraying a former ally' : '') + '. ' + (wasTrading ? 'Their trade pact has ended. ' : '') + 'Borders are now contested.');
  return true;
}
function declareWar() {
  const a = realm(selected), b = realm(opponent);
  if (!a.alive || !b.alive) { addEvent('A fallen realm cannot be targeted by a new declaration of war.'); renderAll(); return; }
  if (!startWar(a, b)) addEvent('War with ' + b.name + ' is already active.');
  renderAll();
}
function offerPeace() {
  const a = realm(selected), b = realm(opponent), war = warBetween(a.id, b.id);
  if (!war) return;
  const scoreA = war.a === a.id ? war.scoreA : war.scoreB;
  const scoreB = war.a === a.id ? war.scoreB : war.scoreA;
  if (Math.abs(scoreA - scoreB) > 8) {
    const winner = scoreA > scoreB ? a : b, loser = winner.id === a.id ? b : a;
    const captured = captureBorderTile(winner, loser);
    winner.treasury += 35; loser.treasury = Math.max(0, loser.treasury - 20);
    addEvent(winner.name + ' secured favorable peace against ' + loser.name + '. ' + (captured ? 'A border territory changed hands.' : 'The victor secured concessions.'));
    checkCollapse(loser, winner);
  } else addEvent(a.name + ' and ' + b.name + ' signed a white peace after an inconclusive war.');
  diplomacy.wars = diplomacy.wars.filter(t => t !== war); adjustRelation(a.id, b.id, 18);
  a.stability = Math.min(100, a.stability + 6); b.stability = Math.min(100, b.stability + 6);
  a.warExhaustion = Math.max(0, (a.warExhaustion || 0) - 25); b.warExhaustion = Math.max(0, (b.warExhaustion || 0) - 25);
  renderAll();
}

function sideScore(war,id){return war.a===id?war.scoreA:war.scoreB;}
function setSideScore(war,id,value){if(war.a===id)war.scoreA=value;else war.scoreB=value;}
function sideExhaustion(war,id){return war.a===id?(war.exhaustionA||0):(war.exhaustionB||0);}
function setSideExhaustion(war,id,value){if(war.a===id)war.exhaustionA=value;else war.exhaustionB=value;}
function checkCollapse(loser,conqueror){
 if(!loser||!loser.alive||territoryCount(loser.id)>0)return false;
 loser.alive=false;loser.civilWar=null;
 if(conqueror&&conqueror.alive){conqueror.population+=Math.floor(loser.population*.25);conqueror.treasury+=Math.floor(loser.treasury*.4);}
 diplomacy.alliances=diplomacy.alliances.filter(t=>t.a!==loser.id&&t.b!==loser.id);
 diplomacy.tradePacts=diplomacy.tradePacts.filter(t=>t.a!==loser.id&&t.b!==loser.id);
 diplomacy.wars=diplomacy.wars.filter(t=>t.a!==loser.id&&t.b!==loser.id);
 addEvent(loser.name+' collapsed as an independent kingdom.'+(conqueror?' '+conqueror.name+' absorbed refugees and part of the royal treasury.':' Its lands became contested frontier.'));
 return true;
}
function processSieges(war,a,b){
 war.sieges=Array.isArray(war.sieges)?war.sieges:[];
 for(const attacker of [a,b]){
  const defender=attacker.id===a.id?b:a;
  if(!attacker.alive||!defender.alive||war.sieges.some(s=>s.attacker===attacker.id)||rand()>.42)continue;
  const candidates=borderTiles(defender.id,attacker.id).filter(i=>(tiles[i].settlement||tiles[i].fort)&&!war.sieges.some(s=>s.tileIndex===i));
  if(!candidates.length)continue;
  const tileIndex=candidates[Math.floor(rand()*candidates.length)];
  war.sieges.push({tileIndex,attacker:attacker.id,defender:defender.id,progress:0,started:year});
  addEvent(attacker.name+' began a siege at a fortified frontier position held by '+defender.name+'.');
 }
 for(const siege of [...war.sieges]){
  const tile=tiles[siege.tileIndex],attacker=realm(siege.attacker),defender=realm(siege.defender);
  if(!tile||!attacker||!defender||!attacker.alive||!defender.alive||tile.owner!==defender.id||!borderTiles(defender.id,attacker.id).includes(siege.tileIndex)){
   war.sieges=war.sieges.filter(s=>s!==siege);continue;
  }
  const defense=Math.max(1,defender.military*.12+(tile.fort?24:0)+(tile.settlement?15:0)+defender.tech*2);
  const attack=Math.max(1,attacker.military*.14+attacker.tech*3);
  siege.progress=Math.min(100,siege.progress+Math.max(5,Math.min(24,13+(attack-defense)*.12+rand()*6)));
  if(siege.progress>=100){
   tile.owner=attacker.id;tile.rebel=false;setSideScore(war,attacker.id,Math.min(100,sideScore(war,attacker.id)+18));
   attacker.treasury+=tile.settlement?14:5;defender.stability=Math.max(5,defender.stability-(tile.settlement?8:4));
   attacker.military=Math.max(35,attacker.military-5);defender.military=Math.max(35,defender.military-12);
   addEvent(attacker.name+' captured a fortified district held by '+defender.name+' after a siege.');
   war.sieges=war.sieges.filter(s=>s!==siege);checkCollapse(defender,attacker);
  }
 }
}
function processWars() {
 for(const war of [...diplomacy.wars]){
  const a=realm(war.a),b=realm(war.b);
  if(!a||!b||!a.alive||!b.alive){diplomacy.wars=diplomacy.wars.filter(t=>t!==war);continue;}
  war.sieges=Array.isArray(war.sieges)?war.sieges:[];
  const strengthA=Math.max(1,a.military*(1+a.tech*.04)+territoryCount(a.id)*1.8);
  const strengthB=Math.max(1,b.military*(1+b.tech*.04)+territoryCount(b.id)*1.8);
  war.campaigns=(war.campaigns||0)+1;
  war.exhaustionA=Math.min(100,(war.exhaustionA||0)+3+rand()*2);
  war.exhaustionB=Math.min(100,(war.exhaustionB||0)+3+rand()*2);
  a.warExhaustion=Math.min(100,(a.warExhaustion||0)+2.5);b.warExhaustion=Math.min(100,(b.warExhaustion||0)+2.5);
  if(rand()<.88){
   const winner=rand()<Math.max(.12,Math.min(.88,strengthA/(strengthA+strengthB)))?a:b;
   const loser=winner.id===a.id?b:a;
   setSideScore(war,winner.id,Math.min(100,sideScore(war,winner.id)+7+Math.floor(rand()*9)));
   winner.military=Math.max(35,winner.military-Math.floor(3+rand()*7));
   loser.military=Math.max(35,loser.military-Math.floor(9+rand()*13));
   setSideExhaustion(war,loser.id,Math.min(100,sideExhaustion(war,loser.id)+6));
   setSideExhaustion(war,winner.id,Math.min(100,sideExhaustion(war,winner.id)+3));
   if(sideScore(war,winner.id)%25<12)addEvent(winner.name+' won a campaign engagement against '+loser.name+'. War score: '+sideScore(war,winner.id)+'.');
   if(sideExhaustion(war,loser.id)>=55&&rand()<.3){loser.stability=Math.max(5,loser.stability-3);addEvent('War exhaustion is undermining stability in '+loser.name+'.');}
  }
  processSieges(war,a,b);
  if(!a.alive||!b.alive||!diplomacy.wars.includes(war))continue;
  if(war.scoreA>=100||war.scoreB>=100||war.exhaustionA>=100||war.exhaustionB>=100){
   let winner;
   if(war.scoreA===war.scoreB&&war.exhaustionA!==war.exhaustionB)winner=war.exhaustionA<war.exhaustionB?a:b;
   else winner=war.scoreA>=war.scoreB?a:b;
   const loser=winner.id===a.id?b:a,captured=captureBorderTile(winner,loser);
   winner.treasury+=45;loser.treasury=Math.max(0,loser.treasury-30);
   winner.stability=Math.min(100,winner.stability+5);loser.stability=Math.max(8,loser.stability-12);
   winner.warExhaustion=Math.max(0,winner.warExhaustion-25);loser.warExhaustion=Math.max(0,loser.warExhaustion-15);
   diplomacy.wars=diplomacy.wars.filter(t=>t!==war);adjustRelation(a.id,b.id,12);
   addEvent(winner.name+' forced peace against '+loser.name+'. '+(captured?'A contested border district changed hands.':'The victor secured concessions.')+' The campaign ended.');
   checkCollapse(loser,winner);
  }
 }
}
function processEconomy(){
 for(const k of kingdoms){
  if(!k.alive)continue;
  const lands=territoryCount(k.id),settlements=settlementCount(k.id),partners=diplomacy.tradePacts.filter(t=>t.a===k.id||t.b===k.id).length;
  k.food=Math.max(0,Math.min(999,k.food+settlements*13+lands*.28+partners*7-k.population/1000*4));
  k.treasury=Math.max(0,k.treasury+partners*12+Math.floor(settlements*1.4+lands*.06));
  if(k.food<18){k.population=Math.max(200,Math.floor(k.population*.985));k.stability=Math.max(5,k.stability-3);k.food=12;if(rand()<.35)addEvent('Food shortages grip '+k.name+'. Population and stability suffer.');}
  if(k.stability<24&&!k.civilWar&&rand()<.10)launchCivilWar(k,'growing unrest and weak royal authority');
  if(k.tech<TECHS.length&&rand()<.075){k.tech++;addEvent(k.name+' advanced in '+TECHS[k.tech-2]+'. Technology is now level '+k.tech+'.');}
  if(k.stability<100&&rand()<.18)k.stability++;
 }
}
function launchCivilWar(k,cause){
 if(!k||!k.alive||k.civilWar)return false;
 const border=[];
 for(let i=0;i<tiles.length;i++)if(tiles[i].owner===k.id&&!tiles[i].settlement){
  const x=i%w,y=Math.floor(i/w);if(neighbours(x,y).some(p=>tiles[idx(p[0],p[1])].owner!==k.id))border.push(i);
 }
 if(!border.length)return false;
 border.sort(()=>rand()-.5);
 const initial=border.slice(0,Math.min(3,Math.max(1,Math.floor(border.length*.08))));
 initial.forEach(i=>{tiles[i].rebel=true;});
 k.civilWar={started:year,tiles:initial,cause,rebelStrength:24+rand()*20};
 k.stability=Math.max(4,k.stability-8);k.military=Math.max(35,Math.floor(k.military*.88));
 addEvent('CIVIL WAR: rebels rose against '+k.ruler+' in '+k.name+' amid '+cause+'. '+initial.length+' frontier districts are in revolt.');
 return true;
}
function processCivilWars(){
 for(const k of kingdoms){
  if(!k.alive||!k.civilWar)continue;
  const revolt=k.civilWar;
  revolt.tiles=revolt.tiles.filter(i=>tiles[i]&&tiles[i].owner===k.id&&tiles[i].rebel);
  if(!revolt.tiles.length){k.civilWar=null;k.stability=Math.min(100,k.stability+8);addEvent('The uprising in '+k.name+' dissolved without a lasting territorial split.');continue;}
  const years=year-revolt.started,spread=[];
  revolt.tiles.forEach(i=>{const x=i%w,y=Math.floor(i/w);neighbours(x,y).forEach(p=>{const ni=idx(p[0],p[1]);if(tiles[ni].owner===k.id&&!tiles[ni].rebel&&!tiles[ni].settlement&&!spread.includes(ni))spread.push(ni);});});
  if(spread.length&&rand()<Math.min(.78,.28+years*.045)){
   const next=spread[Math.floor(rand()*spread.length)];tiles[next].rebel=true;revolt.tiles.push(next);revolt.rebelStrength+=8+rand()*5;
   if(revolt.tiles.length%3===0)addEvent('The revolt in '+k.name+' spread to another district. Royal authority is weakening.');
  }
  const loyal=k.military*.12+k.stability*.6+territoryCount(k.id)*.5,rebel=revolt.rebelStrength+revolt.tiles.length*3;
  if(k.stability>43&&loyal>rebel*.85&&rand()<.24){
   revolt.tiles.forEach(i=>{if(tiles[i])tiles[i].rebel=false;});
   k.civilWar=null;k.stability=Math.min(100,k.stability+15);k.military=Math.max(35,Math.floor(k.military*.92));
   addEvent(k.ruler+' suppressed the civil war in '+k.name+'. Royal control returned, but the army was weakened.');continue;
  }
  if(revolt.tiles.length>=Math.max(5,Math.ceil(territoryCount(k.id)*.22))||years>=9){
   let released=0;revolt.tiles.forEach(i=>{const t=tiles[i];if(t&&t.owner===k.id&&t.rebel){t.owner=-1;t.rebel=false;t.fort=false;released++;}});
   k.civilWar=null;k.stability=Math.max(8,k.stability-18);k.population=Math.max(200,Math.floor(k.population*.92));
   addEvent('The royal army failed to reunify '+k.name+'. After a prolonged civil war, '+released+' rebel districts seceded as independent frontier territory.');
   if(territoryCount(k.id)===0)checkCollapse(k,null);
  }
 }
}
function realmStrength(k){return Math.max(1,k.military*(1+k.tech*.04)+territoryCount(k.id)*1.8);}
function thinkPolitically(){
 for(let i=0;i<kingdoms.length;i++)for(let j=i+1;j<kingdoms.length;j++){
  const a=realm(i),b=realm(j);if(!a.alive||!b.alive)continue;
  const war=warBetween(i,j),alliance=treaty(diplomacy.alliances,i,j),trade=treaty(diplomacy.tradePacts,i,j);
  if(war)continue;
  if(trade)adjustRelation(i,j,1);
  else if(alliance){if(rand()<.72)adjustRelation(i,j,1);else if(rand()<.25)adjustRelation(i,j,-1);}
  else if(rand()<.62)adjustRelation(i,j,rand()<.63?-1:1);
  const relation=Math.round(((a.relations[j]||0)+(b.relations[i]||0))/2);
  if(alliance){
   const age=year-(alliance.formed||year),stronger=realmStrength(a)>=realmStrength(b)?a:b,weaker=stronger.id===a.id?b:a;
   if(stronger.aggression>.62&&age>=5&&realmStrength(stronger)>realmStrength(weaker)*1.35&&rand()<.004+stronger.aggression*.008){
    addEvent('Court intrigue: factions in '+stronger.name+' urged the ruler to abandon its pact with '+weaker.name+'.');
    if(rand()<.48)startWar(stronger,weaker,{betrayal:true});
   }
   continue;
  }
  if(trade&&relation>=48&&rand()<.012){diplomacy.alliances.push({a:i,b:j,formed:year});adjustRelation(i,j,8);addEvent(a.name+' and '+b.name+' upgraded their partnership into a defensive alliance.');continue;}
  if(!trade&&relation>=25&&rand()<.012){diplomacy.tradePacts.push({a:i,b:j,formed:year});adjustRelation(i,j,8);addEvent(a.name+' and '+b.name+' opened an AI-negotiated trade route.');continue;}
  const adjacent=borderTiles(i,j).length>0,attacker=a.aggression>=b.aggression?a:b,defender=attacker.id===a.id?b:a;
  const hostility=relation< -12||(relation<14&&realmStrength(attacker)>realmStrength(defender)*1.12);
  if(adjacent&&relation<23&&hostility&&realmStrength(attacker)>realmStrength(defender)*.8&&rand()<.009+attacker.aggression*.022)startWar(attacker,defender);
 }
}

function processDynasties(){
 for(const k of kingdoms){
  if(!k.alive)continue;k.rulerAge++;
  if(k.rulerAge>=65&&rand()<.2){
   const former=k.ruler;k.ruler=k.heir;k.heir=['Prince Alden','Princess Mira','Lord Rowan','Lady Talia','Prince Sen'][Math.floor(rand()*5)];k.rulerAge=24+Math.floor(rand()*18);
   if(rand()<.16){
    k.stability=Math.max(8,k.stability-22);
    addEvent('A disputed succession shook '+k.name+'. '+k.ruler+' claimed the throne, while nobles challenged the dynasty.');
    if(!k.civilWar&&rand()<.55)launchCivilWar(k,'a disputed royal succession');
   }else{k.stability=Math.min(100,k.stability+4);addEvent(k.ruler+' succeeded '+former+' as ruler of '+k.name+'. The '+k.dynasty+' dynasty continues.');}
  }
 }
}
function simulateYear(){
 year++;
 for(const k of kingdoms){
  if(!k.alive)continue;
  k.population=Math.max(200,Math.floor(k.population*(1+rand()*.025-.004)));
  k.treasury=Math.max(0,k.treasury+Math.floor(k.population/1800+rand()*12-5));
  k.military=Math.max(50,Math.floor(k.military*(.98+rand()*.05)));
  k.warExhaustion=Math.max(0,(k.warExhaustion||0)-(diplomacy.wars.some(w=>w.a===k.id||w.b===k.id)?0:7));
  if(rand()<.74)expandRealm(k);
  if(rand()<.025){k.stability=Math.max(5,k.stability-Math.floor(rand()*10+3));addEvent('Unrest troubles '+k.name+'; stability falls to '+k.stability+'.');}
 }
 processWars();processEconomy();processDynasties();processCivilWars();thinkPolitically();
 if(year%5===0)addEvent('A five-year era begins. Trade, research, and borders continue to change.');
 if(year%10===0){const strongest=[...kingdoms].sort((a,b)=>territoryCount(b.id)-territoryCount(a.id))[0];addEvent(strongest.name+' controls the most territory in year '+year+'.');}
 renderAll();
}
function expandRealm(k){
 if(!k.alive)return;
 const candidates=[];
 for(let i=0;i<tiles.length;i++){
  if(tiles[i].owner!==k.id)continue;
  const x=i%w,y=Math.floor(i/w);
  for(const p of neighbours(x,y)){const ni=idx(p[0],p[1]),t=tiles[ni];if(t.owner===-1&&t.terrain!=='water'&&!t.rebel&&!candidates.includes(ni))candidates.push(ni);}
 }
 if(!candidates.length)return;
 const t=tiles[candidates[Math.floor(rand()*candidates.length)]];t.owner=k.id;t.rebel=false;
 if(rand()<.055){t.settlement=true;k.population+=Math.floor(300+rand()*900);addEvent(k.name+' founded a new frontier settlement.');}
 else if(rand()<.04)t.fort=true;
}
function saveData() { return { version: 3, w, h, year, tiles, kingdoms, events, selected, opponent, diplomacy }; }
function saveLocalWorld() { try { localStorage.setItem('pixelrealm-autosave', JSON.stringify(saveData())); } catch (err) { /* Browser storage can be unavailable for local files/private browsing. */ } }
function applyWorldState(s) {
  if (!s || !Array.isArray(s.tiles) || !Array.isArray(s.kingdoms) || !Number.isInteger(s.w) || !Number.isInteger(s.h) || s.tiles.length !== s.w * s.h || s.kingdoms.length !== 5) throw new Error('Invalid save');
  w = s.w; h = s.h; year = Number(s.year) || 1; tiles = s.tiles;
  kingdoms = s.kingdoms.map((k, i) => ({
    id: i, name: NAMES[i], color: COLORS[i], x: Math.round(w * 0.2), y: Math.round(h * 0.2),
    population: 5000, treasury: 200, military: 250, stability: 75, food: 100, tech: 1,
    ruler: RULERS[i], heir: HEIRS[i], dynasty: DYNASTIES[i], rulerAge: 35, aggression: 0.5, warExhaustion: 0, civilWar: null,
    relations: Array.from({ length: 5 }, (_, j) => i === j ? 100 : 35), alive: true, ...k, id: i, color: COLORS[i]
  })).map(k => ({ ...k, food: Number.isFinite(k.food) ? k.food : 100, tech: k.tech || 1, ruler: k.ruler || RULERS[k.id], heir: k.heir || HEIRS[k.id], dynasty: k.dynasty || DYNASTIES[k.id], rulerAge: k.rulerAge || 35, aggression: Number.isFinite(k.aggression) ? k.aggression : 0.5, warExhaustion: Number.isFinite(k.warExhaustion) ? k.warExhaustion : 0, civilWar: k.civilWar || null, relations: Array.isArray(k.relations) ? k.relations : Array.from({ length: 5 }, (_, j) => j === k.id ? 100 : 35) }));
  for (const tile of tiles) if (tile.rebel === undefined) tile.rebel = false;
  const d = s.diplomacy || {};
  diplomacy = { wars: Array.isArray(d.wars) ? d.wars : [], alliances: Array.isArray(d.alliances) ? d.alliances : [], tradePacts: Array.isArray(d.tradePacts) ? d.tradePacts : [] };
  diplomacy.wars.forEach(war => { war.sieges = Array.isArray(war.sieges) ? war.sieges : []; war.exhaustionA = Number.isFinite(war.exhaustionA) ? war.exhaustionA : 0; war.exhaustionB = Number.isFinite(war.exhaustionB) ? war.exhaustionB : 0; war.campaigns = war.campaigns || 0; });
  selected = Math.max(0, Math.min(4, Number(s.selected) || 0));
  opponent = Number.isInteger(s.opponent) ? Math.max(0, Math.min(4, s.opponent)) : (selected + 1) % 5;
  if (opponent === selected) opponent = (selected + 1) % 5;
  events = Array.isArray(s.events) ? s.events : [];
  canvas.width = w * TILE; canvas.height = h * TILE;
  const option = $('mapSize').querySelector('option[value="' + w + '"]'); if (option) $('mapSize').value = String(w);
  renderAll();
}
function loadLocalWorld() {
  try { const raw = localStorage.getItem('pixelrealm-autosave'); if (!raw) return false; applyWorldState(JSON.parse(raw)); return true; }
  catch (err) { return false; }
}
function stopSimulation() { playing = false; if (timer) clearInterval(timer); timer = null; }
function setPlaying(value) {
  playing = value; if (timer) clearInterval(timer); timer = null;
  if (playing) timer = setInterval(simulateYear, 1700 / Number($('speed').value));
  renderAll();
}

document.querySelectorAll('[data-tool]').forEach(b => b.addEventListener('click', () => {
  tool = b.dataset.tool; document.querySelectorAll('[data-tool]').forEach(x => x.classList.toggle('active', x === b));
}));
canvas.addEventListener('mousemove', e => {
  const r = canvas.getBoundingClientRect(), x = Math.floor((e.clientX - r.left) / r.width * w), y = Math.floor((e.clientY - r.top) / r.height * h);
  $('coords').textContent = 'X ' + String(x).padStart(2, '0') + ' · Y ' + String(y).padStart(2, '0');
});
canvas.addEventListener('click', e => {
  const r = canvas.getBoundingClientRect(), x = Math.floor((e.clientX - r.left) / r.width * w), y = Math.floor((e.clientY - r.top) / r.height * h);
  if (!inBounds(x, y)) return;
  const t = terrainAt(x, y);
  if (tool === 'inspect') {
    if (t.owner >= 0) { selected = t.owner; if (opponent === selected) opponent = (selected + 1) % kingdoms.length; renderKingdoms(); renderInfo(); }
    return;
  }
  if (tool === 'forest' || tool === 'mountain' || tool === 'water') {
    t.terrain = tool; t.owner = -1; t.settlement = false; t.fort = false; addEvent('Terrain reshaped at coordinates ' + x + ', ' + y + '.');
  } else if (tool === 'village') {
    if (t.terrain === 'water') { addEvent('Settlements cannot be built on water.'); renderAll(); return; }
    t.settlement = true; if (t.owner >= 0) realm(t.owner).population += 500; addEvent('A settlement was founded at ' + x + ', ' + y + '.');
  } else if (tool === 'kingdom') {
    if (t.terrain === 'water') { addEvent('Land claims cannot be made over water.'); renderAll(); return; }
    const previous = t.owner; t.owner = selected;
    if (previous !== selected) addEvent(realm(selected).name + ' claimed a tile' + (previous >= 0 ? ' from ' + realm(previous).name : ' on the frontier') + '.');
  }
  renderAll();
});
$('play').onclick = () => setPlaying(!playing);
$('step').onclick = () => { if (playing) stopSimulation(); simulateYear(); };
$('speed').oninput = () => { $('speedLabel').textContent = $('speed').value + '×'; if (playing) setPlaying(true); };
$('newWorld').onclick = genWorld;
$('reset').onclick = () => {
  stopSimulation(); year = 1;
  kingdoms.forEach(k => { k.population = 5000; k.treasury = 200; k.military = 250; k.stability = 80; k.food = 150; k.tech = 1; k.rulerAge = 35; k.warExhaustion = 0; k.civilWar = null; k.alive = true; });
  diplomacy = { wars: [], alliances: [], tradePacts: [] }; addEvent('The simulation has been reset.'); renderAll();
};
$('territory').onclick = () => { showTerritory = !showTerritory; $('territory').classList.toggle('active', showTerritory); renderMap(); };
$('terrain').onclick = () => { showTerrain = !showTerrain; $('terrain').classList.toggle('active', showTerrain); renderMap(); };
$('eventsToggle').onclick = () => { showEvents = !showEvents; $('eventPanel').style.display = showEvents ? 'block' : 'none'; };
$('mapSize').onchange = genWorld;
$('save').onclick = () => {
  const blob = new Blob([JSON.stringify(saveData(), null, 2)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'pixelrealm-world.json'; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000); addEvent('World save exported to your device.');
};
$('load').onclick = () => $('loadfile').click();
$('loadfile').onchange = async e => {
  const file = e.target.files[0]; if (!file) return;
  try { applyWorldState(JSON.parse(await file.text())); addEvent('World imported successfully.'); }
  catch (err) { alert('Could not load that world file. Please choose a valid PIXELREALM save.'); }
  e.target.value = '';
};
if (!loadLocalWorld()) genWorld();
window.addEventListener('resize', () => {
  if (innerWidth > 680) { $('leftPanel').classList.remove('show'); $('rightPanel').classList.remove('show'); }
});
})();