import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import {fileURLToPath} from 'url';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server as IOServer } from 'socket.io';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new IOServer(server, {
  cors: { origin: process.env.ORIGIN?.split(',') || ["http://localhost:5173"] }
});

app.use(cors({ origin: process.env.ORIGIN?.split(',') || ["http://localhost:5173"], credentials: true }));
app.use(express.json());

const DATA_DIR = path.join(__dirname, 'data');

// Ensure data directory exists
try {
  await fs.mkdir(DATA_DIR, { recursive: true });
} catch (err) {
  console.log('Data directory already exists or created successfully');
}

// ----- helpers -----
async function readJSON(fname, fallback) {
  try {
    const p = path.join(DATA_DIR, fname);
    const s = await fs.readFile(p, 'utf8');
    return JSON.parse(s);
  } catch (e) {
    return fallback;
  }
}
async function writeJSON(fname, obj) {
  const p = path.join(DATA_DIR, fname);
  await fs.writeFile(p, JSON.stringify(obj, null, 2));
}
function now(){ return Date.now(); }
function minutes(n){ return n*60*1000; }
function getAct(startedAt) {
  const t = now() - (startedAt || now());
  if (t < minutes(30)) return 'ACT_I';
  if (t < minutes(75)) return 'ACT_II';
  return 'ACT_III';
}

// ----- load state -----
let game = await readJSON('game.json', {
  startedAt: null,
  phase: 'LOBBY',
  medbay: { name: "Park with 4 orange benches" },
  killCooldownMinutes: Number(process.env.KILL_COOLDOWN || 8),
  downMinutes: Number(process.env.DOWN_MINUTES || 5),
  unpoisonCooldownMinutes: Number(process.env.UNPOISON_COOLDOWN || 8),
  safeMarkMinutes: Number(process.env.SAFE_MARK_MINUTES || 10),
  truthBadgesLeft: 2,
  safeMarksLeft: 2,
  clueSyncLeft: { BLUE: 1, GOLD: 1 },
  detectiveRevives: { ACT_I: 1, ACT_II: 1, ACT_III: 1 },
  letters: { BLUE: Array(10).fill(null), GOLD: Array(10).fill(null) },
  finalCode: process.env.FINAL_CODE || 'BLUEROUTE2GOLDROUTE5',
  nfcState: {}, // id -> { poisonedBy, poisonedUntil, safeUntil, lastPoisonedBy }
  playersOnline: {} // socket.id -> playerId
});
let players = await readJSON('players.json', { players: [] });
let messages = await readJSON('messages.json', { messages: [] });
let contacts = await readJSON('contacts.json', { submissions: [] });
let nfcCards = await readJSON('nfc_cards.json', { cards: [] });
let surveyData = await readJSON('survey_data.json', { responses: [] });
let characters = await readJSON('characters.json', []);

// quick index
const playersById = () => Object.fromEntries(players.players.map(p=>[p.id,p]));
const cardsById = () => Object.fromEntries(nfcCards.cards.map(c=>[c.id,c]));

// ----- Socket.IO chat and presence -----
io.on('connection', (socket) => {
  socket.on('hello', (payload) => {
    game.playersOnline[socket.id] = payload?.playerId || null;
    io.emit('presence', { online: Object.values(game.playersOnline).filter(Boolean) });
  });
  socket.on('chat:send', (msg) => {
    const m = { id: crypto.randomUUID(), ...msg, at: Date.now() };
    messages.messages.push(m);
    io.emit('chat:new', m);
    writeJSON('messages.json', messages).catch(()=>{});
  });
  socket.on('disconnect', () => {
    delete game.playersOnline[socket.id];
    io.emit('presence', { online: Object.values(game.playersOnline).filter(Boolean) });
  });
});

// ----- JWT Auth Middleware -----
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// ----- API routes -----

// Auth endpoints
app.post('/api/auth/signin', async (req, res) => {
  try {
    const { name } = req.body || {};
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'First name is required' });
    }

    const searchName = name.toLowerCase().trim();

    // Find player by first name (case-insensitive)
    // Check if the search name matches the beginning of any player's full name
    const player = players.players.find(p => {
      const playerFirstName = p.name.split(' ')[0].toLowerCase().trim();
      return playerFirstName === searchName;
    });

    if (!player) {
      return res.status(404).json({ error: 'First name not found. Please register first or check your first name.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        playerId: player.id, 
        name: player.name,
        roleId: player.roleId 
      }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.json({ 
      token, 
      player: {
        id: player.id,
        name: player.name,
        roleId: player.roleId,
        characterId: player.characterId,
        isKiller: player.isKiller,
        isDetective: player.isDetective,
        surveyResult: player.surveyResult,
        surveyCompleted: player.surveyCompleted
      }
    });
  } catch (error) {
    console.error('Sign in error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/auth/verify', authenticateToken, async (req, res) => {
  try {
    // Find current player data
    const player = players.players.find(p => p.id === req.user.playerId);
    
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    res.json({ 
      player: {
        id: player.id,
        name: player.name,
        roleId: player.roleId,
        characterId: player.characterId,
        isKiller: player.isKiller,
        isDetective: player.isDetective,
        surveyResult: player.surveyResult,
        surveyCompleted: player.surveyCompleted
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/game', async (req,res)=>{
  res.json({
    phase: game.phase,
    startedAt: game.startedAt,
    act: game.startedAt ? getAct(game.startedAt) : null,
    letters: game.letters,
    truthBadgesLeft: game.truthBadgesLeft,
    safeMarksLeft: game.safeMarksLeft,
    clueSyncLeft: game.clueSyncLeft,
    medbay: game.medbay,
  });
});

app.post('/api/gm/start', async (req,res)=>{
  game.startedAt = Date.now();
  game.phase = 'RUN';
  await writeJSON('game.json', game);
  io.emit('game:phase', { phase: game.phase, startedAt: game.startedAt });
  res.json({ ok:true });
});

app.get('/api/players', async (req,res)=>{
  res.json(players);
});

app.post('/api/register', async (req,res)=>{
  const { name, roleId } = req.body || {};
  if(!name) return res.status(400).json({error:"name required"});
  const role = (players.players.find(p=>p.roleId===roleId) && roleId) ? roleId : null;
  const id = crypto.randomUUID();
  const p = {
    id, name,
    roleId: role,
    characterId: null,
    isKiller: false, isDetective: false,
    lastKillAt: 0,
    downUntil: 0,
    abilities: { unpoisonLastAt: 0, revives: { ACT_I:0, ACT_II:0, ACT_III:0 } }
  };
  players.players.push(p);
  await writeJSON('players.json', players);
  res.json({ player: p });
});

app.post('/api/contact', async (req,res)=>{
  const sub = { id: crypto.randomUUID(), ...req.body, at: Date.now() };
  contacts.submissions.push(sub);
  await writeJSON('contacts.json', contacts);
  res.json({ ok:true });
});

// Survey endpoints
app.post('/api/survey/submit', async (req,res)=>{
  try {
    const { name, answers, result, roleCounts, timestamp } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Name is required" });
    }
    
    // Validate required fields
    if (!answers || !result) {
      return res.status(400).json({ error: "Missing required survey data" });
    }
    
    // Create account/player based on name and survey result
    const playerId = crypto.randomUUID();
    const player = {
      id: playerId,
      name: name.trim(),
      roleId: result, // Use survey result as roleId
      characterId: null,
      isKiller: false,
      isDetective: false,
      lastKillAt: 0,
      downUntil: 0,
      abilities: { unpoisonLastAt: 0, revives: { ACT_I:0, ACT_II:0, ACT_III:0 } },
      surveyResult: result,
      surveyCompleted: true
    };
    
    // Add player to players list
    players.players.push(player);
    await writeJSON('players.json', players);
    
    // Store survey response
    const submission = { 
      id: crypto.randomUUID(),
      name: name.trim(),
      playerId: playerId,
      answers,
      result,
      roleCounts,
      timestamp
    };
    surveyData.responses.push(submission);
    await writeJSON('survey_data.json', surveyData);
    
    res.json({ ok: true, player: player });
  } catch (error) {
    console.error('Survey submission error:', error);
    res.status(500).json({ error: 'Internal server error during survey submission' });
  }
});

app.get('/api/survey/results', async (req,res)=>{
  // Calculate statistics
  const roleStats = {};
  const questionStats = {};
  
  surveyData.responses.forEach(response => {
    // Count roles
    roleStats[response.result] = (roleStats[response.result] || 0) + 1;
    
    // Count question answers
    response.answers.forEach(answer => {
      if (!questionStats[answer.questionId]) {
        questionStats[answer.questionId] = {};
      }
      questionStats[answer.questionId][answer.selectedOption] = 
        (questionStats[answer.questionId][answer.selectedOption] || 0) + 1;
    });
  });
  
  res.json({
    responses: surveyData.responses,
    roleStats,
    questionStats,
    totalResponses: surveyData.responses.length
  });
});

app.post('/api/survey/clear', async (req,res)=>{
  surveyData.responses = [];
  await writeJSON('survey_data.json', surveyData);
  res.json({ ok: true });
});

// Character endpoints
app.get('/api/characters', async (req,res)=>{
  res.json(characters);
});

app.post('/api/characters', async (req,res)=>{
  const { name, goals, flaws, backstory } = req.body || {};
  if(!name) return res.status(400).json({error:"name required"});
  const id = crypto.randomUUID();
  const char = { id, name, goals: goals || [], flaws: flaws || [], backstory: backstory || '' };
  characters.push(char);
  await writeJSON('characters.json', characters);
  res.json({ character: char });
});

app.post('/api/players/:playerId/assign-character', async (req,res)=>{
  const { playerId } = req.params;
  const { characterId } = req.body || {};
  const player = players.players.find(p => p.id === playerId);
  if(!player) return res.status(404).json({error:"player not found"});
  const char = characters.find(c => c.id === characterId);
  if(!char) return res.status(404).json({error:"character not found"});
  player.characterId = characterId;
  await writeJSON('players.json', players);
  res.json({ ok: true });
});

// Resolve passphrase answer (static string or player field reference)
function resolveAnswer(ans) {
  if (!ans) return null;
  if (typeof ans === 'string') return ans;
  if (ans.type === 'playerField') {
    const p = players.players.find(pp => pp.id === ans.playerId);
    if (!p) return null;
    const v = p?.fields?.[ans.field];
    return v ?? null;
  }
  return null;
}

// NFC public view
app.get('/api/nfc/:id', async (req,res)=>{
  const id = req.params.id;
  const card = cardsById()[id];
  if(!card) return res.status(404).json({error:"not found"});

  const st = game.nfcState[id] || {};
  const poisoned = st.poisonedUntil && st.poisonedUntil > now();
  const safe = st.safeUntil && st.safeUntil > now();

  const content = poisoned ? card.decoy : card.normal;

  res.json({
    id: card.id,
    title: card.title,
    route: card.route,
    index: card.index,
    poisoned, safe,
    nextRiddle: content.nextRiddle,
    passPrompt: content.passPrompt
  });
});

// Attempt passphrase
app.post('/api/nfc/:id/attempt', async (req,res)=>{
  const id = req.params.id;
  const { playerId, passphrase } = req.body || {};
  const card = cardsById()[id];
  if(!card) return res.status(404).json({error:"not found"});
  const st = game.nfcState[id] || {};
  const poisoned = st.poisonedUntil && st.poisonedUntil > now();
  const content = poisoned ? card.decoy : card.normal;
  const expected = resolveAnswer(content.answer);
  
  let ok = false;
  if (expected && typeof passphrase === 'string') {
    ok = expected.toString().trim().toLowerCase() === passphrase.toString().trim().toLowerCase();
  }

  if(!ok){
    return res.json({ ok:false });
  }
  // success: award letter
  const letter = card.rewardChar;
  const route = card.route;
  const idx = card.index;
  game.letters[route][idx-1] = letter;
  await writeJSON('game.json', game);
  io.emit('letter:collected', { id, route, index: idx, letter });
  res.json({ ok:true, letter });
});

// Poison
app.post('/api/poison', async (req,res)=>{
  const { killerId, nfcId } = req.body || {};
  const killer = playersById()[killerId];
  if(!killer || !killer.isKiller) return res.status(403).json({error:"not killer"});

  const st = game.nfcState[nfcId] || {};
  if (st.safeUntil && st.safeUntil > now()) return res.status(400).json({error:"tag is SAFE"});
  if (st.lastPoisonedBy === killerId && st.poisonedUntil && st.poisonedUntil > now()) {
    return res.status(400).json({error:"no re-poison same tag twice"});
  }
  // Limit poisons per killer (3 distinct tags); we count distinct tags they've poisoned today
  const distinct = Object.entries(game.nfcState).filter(([,s]) => s.lastPoisonedBy === killerId).length;
  if (distinct >= 3 && !st.poisonedUntil) return res.status(400).json({error:"poison limit reached"});

  st.poisonedUntil = now() + minutes(5);
  st.lastPoisonedBy = killerId;
  game.nfcState[nfcId] = st;
  await writeJSON('game.json', game);
  io.emit('nfc:poisoned', { nfcId, until: st.poisonedUntil });
  res.json({ ok:true });
});

// Unpoison (Detective)
app.post('/api/unpoison', async (req,res)=>{
  const { detectiveId, nfcId } = req.body || {};
  const det = playersById()[detectiveId];
  if(!det || !det.isDetective) return res.status(403).json({error:"not detective"});
  const last = det.abilities?.unpoisonLastAt || 0;
  if (now() - last < minutes(game.unpoisonCooldownMinutes)) {
    return res.status(400).json({error:"cooldown"});
  }
  const st = game.nfcState[nfcId] || {};
  st.poisonedUntil = 0;
  game.nfcState[nfcId] = st;
  det.abilities.unpoisonLastAt = now();
  await writeJSON('players.json', players);
  await writeJSON('game.json', game);
  io.emit('nfc:unpoisoned', { nfcId });
  res.json({ ok:true });
});

// Safe Mark (team, 2x total)
app.post('/api/safe-mark', async (req,res)=>{
  const { playerId, nfcId } = req.body || {};
  if (game.safeMarksLeft <= 0) return res.status(400).json({error:"no safe marks left"});
  const st = game.nfcState[nfcId] || {};
  st.safeUntil = now() + minutes(game.safeMarkMinutes);
  game.nfcState[nfcId] = st;
  game.safeMarksLeft -= 1;
  await writeJSON('game.json', game);
  io.emit('nfc:safe', { nfcId, until: st.safeUntil });
  res.json({ ok:true });
});

// Kill / revive
app.post('/api/kill', async (req,res)=>{
  const { killerId, targetId } = req.body || {};
  const killer = playersById()[killerId];
  const target = playersById()[targetId];
  if(!killer || !killer.isKiller) return res.status(403).json({error:"not killer"});
  if(!target) return res.status(404).json({error:"no target"});
  if (now() - (killer.lastKillAt||0) < minutes(game.killCooldownMinutes)) {
    return res.status(400).json({error:"cooldown"});
  }
  target.downUntil = now() + minutes(game.downMinutes);
  killer.lastKillAt = now();
  await writeJSON('players.json', players);
  io.emit('player:down', { targetId });
  res.json({ ok:true });
});

app.post('/api/revive', async (req,res)=>{
  const { detectiveId, targetId } = req.body || {};
  const det = playersById()[detectiveId];
  const t = playersById()[targetId];
  if(!det || !det.isDetective) return res.status(403).json({error:"not detective"});
  if(!t) return res.status(404).json({error:"no target"});
  const act = getAct(game.startedAt);
  if ((det.abilities.revives[act]||0) >= 1) return res.status(400).json({error:"act revive used"});
  t.downUntil = 0;
  det.abilities.revives[act] = (det.abilities.revives[act]||0)+1;
  await writeJSON('players.json', players);
  io.emit('player:revive', { targetId });
  res.json({ ok:true });
});

// Final code check
app.post('/api/final', async (req,res)=>{
  const { code, accused } = req.body || {};
  const ok = (code||'').trim().toUpperCase() === (game.finalCode||'').trim().toUpperCase();
  res.json({ ok });
  if (ok) io.emit('game:win', { accused });
});

// Serve simple health
app.get('/health', (req,res)=>res.json({ok:true, time: Date.now()}));

const PORT = Number(process.env.PORT || 8080);
server.listen(PORT, ()=> console.log('Server on', PORT));
