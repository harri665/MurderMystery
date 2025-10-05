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
import webPush from 'web-push';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Web Push VAPID configuration
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'BBdvZpojnEEPWl2T7hvJoFdmL13yA3CmjEmdzOre3ZKzClI_lrgmO2YmTHKrE1M7eR-jGvvBwBnEN1Gyqrel_ck';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'mjIAB-XhXmHGhovH7TYkhxxBq64qKQdb5BOBD7AIp_c';
const VAPID_EMAIL = process.env.VAPID_EMAIL || 'mailto:admin@murdermystery.game';

webPush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

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

// Helper function to send push notifications to specific players
async function sendPushNotification({ title, body, targetPlayerIds, url, icon, badge }) {
  try {
    const payload = JSON.stringify({
      title,
      body,
      icon: icon || '/images/seal.png',
      badge: badge || '/images/seal.png',
      data: {
        url: url || '/',
        timestamp: Date.now(),
        type: 'game-event'
      }
    });

    let targetSubscriptions = pushSubscriptions.subscriptions;

    // Filter by target players if specified
    if (targetPlayerIds && Array.isArray(targetPlayerIds) && targetPlayerIds.length > 0) {
      targetSubscriptions = pushSubscriptions.subscriptions.filter(
        sub => targetPlayerIds.includes(sub.playerId)
      );
    }

    if (targetSubscriptions.length === 0) {
      console.log(`⚠️ No subscriptions found for target players`);
      return { success: false, sent: 0 };
    }

    console.log(`📢 Sending push notification to ${targetSubscriptions.length} player(s)...`);

    const results = await Promise.allSettled(
      targetSubscriptions.map(async (sub) => {
        try {
          await webPush.sendNotification(sub.subscription, payload);
          console.log(`  ✅ Notification sent to ${sub.playerName}`);
          return { success: true };
        } catch (error) {
          console.error(`  ❌ Failed to send to ${sub.playerName}:`, error.message);
          
          // Remove invalid subscriptions
          if (error.statusCode === 410 || error.statusCode === 404) {
            pushSubscriptions.subscriptions = pushSubscriptions.subscriptions.filter(
              s => s.playerId !== sub.playerId
            );
            await writeJSON('push_subscriptions.json', pushSubscriptions);
            console.log(`  🗑️ Removed invalid subscription for ${sub.playerName}`);
          }
          
          return { success: false };
        }
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    return { success: true, sent: successful, total: results.length };
  } catch (error) {
    console.error('Error in sendPushNotification:', error);
    return { success: false, sent: 0 };
  }
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
let pushSubscriptions = await readJSON('push_subscriptions.json', { subscriptions: [] });

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

// Web Push Notification endpoints
app.get('/api/vapid-public-key', (req, res) => {
  res.json({ publicKey: VAPID_PUBLIC_KEY });
});

app.post('/api/push/subscribe', async (req, res) => {
  try {
    const { subscription, playerId, playerName } = req.body;
    
    if (!subscription || !playerId) {
      return res.status(400).json({ error: 'Subscription and playerId required' });
    }

    // Check if subscription already exists for this player
    const existingIndex = pushSubscriptions.subscriptions.findIndex(
      sub => sub.playerId === playerId
    );

    if (existingIndex >= 0) {
      // Update existing subscription
      pushSubscriptions.subscriptions[existingIndex] = {
        playerId,
        playerName,
        subscription,
        subscribedAt: Date.now()
      };
    } else {
      // Add new subscription
      pushSubscriptions.subscriptions.push({
        playerId,
        playerName,
        subscription,
        subscribedAt: Date.now()
      });
    }

    await writeJSON('push_subscriptions.json', pushSubscriptions);
    console.log(`✅ Push subscription saved for player: ${playerName} (${playerId})`);
    res.json({ ok: true, message: 'Subscription saved successfully' });
  } catch (error) {
    console.error('Error saving push subscription:', error);
    res.status(500).json({ error: 'Failed to save subscription' });
  }
});

app.post('/api/push/unsubscribe', async (req, res) => {
  try {
    const { playerId } = req.body;
    
    if (!playerId) {
      return res.status(400).json({ error: 'playerId required' });
    }

    pushSubscriptions.subscriptions = pushSubscriptions.subscriptions.filter(
      sub => sub.playerId !== playerId
    );

    await writeJSON('push_subscriptions.json', pushSubscriptions);
    console.log(`🔕 Push subscription removed for player: ${playerId}`);
    res.json({ ok: true, message: 'Subscription removed' });
  } catch (error) {
    console.error('Error removing push subscription:', error);
    res.status(500).json({ error: 'Failed to remove subscription' });
  }
});

// GM route to send notifications
app.post('/api/gm/notify', async (req, res) => {
  try {
    const { title, body, targetPlayers, url, icon, badge } = req.body;

    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body are required' });
    }

    const payload = JSON.stringify({
      title,
      body,
      icon: icon || '/images/seal.png',
      badge: badge || '/images/seal.png',
      data: {
        url: url || '/',
        timestamp: Date.now(),
        type: 'gm-notification'
      }
    });

    let targetSubscriptions = pushSubscriptions.subscriptions;

    // Filter by target players if specified
    if (targetPlayers && Array.isArray(targetPlayers) && targetPlayers.length > 0) {
      targetSubscriptions = pushSubscriptions.subscriptions.filter(
        sub => targetPlayers.includes(sub.playerId)
      );
    }

    if (targetSubscriptions.length === 0) {
      return res.status(400).json({ 
        error: 'No subscribed players found',
        targetPlayers,
        totalSubscriptions: pushSubscriptions.subscriptions.length
      });
    }

    console.log(`📢 Sending notification to ${targetSubscriptions.length} player(s)...`);

    const results = await Promise.allSettled(
      targetSubscriptions.map(async (sub) => {
        try {
          await webPush.sendNotification(sub.subscription, payload);
          console.log(`  ✅ Sent to ${sub.playerName}`);
          return { success: true, playerName: sub.playerName, playerId: sub.playerId };
        } catch (error) {
          console.error(`  ❌ Failed to send to ${sub.playerName}:`, error.message);
          
          // Remove invalid subscriptions (e.g., expired or unsubscribed)
          if (error.statusCode === 410 || error.statusCode === 404) {
            pushSubscriptions.subscriptions = pushSubscriptions.subscriptions.filter(
              s => s.playerId !== sub.playerId
            );
            await writeJSON('push_subscriptions.json', pushSubscriptions);
            console.log(`  🗑️ Removed invalid subscription for ${sub.playerName}`);
          }
          
          return { 
            success: false, 
            playerName: sub.playerName, 
            playerId: sub.playerId,
            error: error.message 
          };
        }
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.length - successful;

    res.json({
      ok: true,
      message: `Notification sent to ${successful} player(s)`,
      successful,
      failed,
      total: results.length,
      results: results.map(r => r.status === 'fulfilled' ? r.value : r.reason)
    });

  } catch (error) {
    console.error('Error sending notifications:', error);
    res.status(500).json({ error: 'Failed to send notifications' });
  }
});

app.get('/api/players', async (req,res)=>{
  res.json(players);
});

app.post('/api/players', async (req,res)=>{
  const { name, role } = req.body || {};
  if(!name) return res.status(400).json({error:"name required"});
  const roleId = (players.players.find(p=>p.roleId===role) && role) ? role : null;
  const id = crypto.randomUUID();
  const p = {
    id, name,
    roleId: roleId,
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
  const { name, goals, flaws, backstory, avatar, isKiller, isDetective } = req.body || {};
  if(!name) return res.status(400).json({error:"name required"});
  const id = crypto.randomUUID();
  const char = { 
    id, 
    name, 
    goals: goals || [], 
    flaws: flaws || [], 
    backstory: backstory || '', 
    avatar: avatar || null,
    isKiller: isKiller || false,
    isDetective: isDetective || false
  };
  characters.push(char);
  await writeJSON('characters.json', characters);
  res.json({ character: char });
});

app.delete('/api/characters/:characterId', async (req,res)=>{
  const { characterId } = req.params;
  const index = characters.findIndex(c => c.id === characterId);
  if(index === -1) return res.status(404).json({error:"character not found"});
  characters.splice(index, 1);
  await writeJSON('characters.json', characters);
  res.json({ ok: true });
});

app.post('/api/players/:playerId/assign-character', async (req,res)=>{
  const { playerId } = req.params;
  const { characterId } = req.body || {};
  const player = players.players.find(p => p.id === playerId);
  if(!player) return res.status(404).json({error:"player not found"});
  const char = characters.find(c => c.id === characterId);
  if(!char) return res.status(404).json({error:"character not found"});
  player.characterId = characterId;
  // Note: Player roles (isKiller, isDetective) are now independent of characters
  await writeJSON('players.json', players);
  res.json({ ok: true });
});

app.post('/api/players/:playerId/set-role', async (req,res)=>{
  const { playerId } = req.params;
  const { isKiller, isDetective } = req.body || {};
  const player = players.players.find(p => p.id === playerId);
  if(!player) return res.status(404).json({error:"player not found"});
  
  // Set player role - if both are false, they're a citizen
  player.isKiller = Boolean(isKiller);
  player.isDetective = Boolean(isDetective);
  
  // Ensure only one role is active (killer takes precedence if both are set)
  if (player.isKiller && player.isDetective) {
    player.isDetective = false;
  }
  
  await writeJSON('players.json', players);
  res.json({ ok: true, player });
});

app.delete('/api/players/:playerId', async (req,res)=>{
  const { playerId } = req.params;
  const index = players.players.findIndex(p => p.id === playerId);
  if(index === -1) return res.status(404).json({error:"player not found"});
  players.players.splice(index, 1);
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
  
  // Send push notification to victim
  await sendPushNotification({
    title: '💀 You\'ve Been Eliminated!',
    body: `You've been killed! You're down for ${game.downMinutes} minutes. Get to the medbay!`,
    targetPlayerIds: [target.id],
    url: '/profile',
    icon: '/images/seal.png',
    badge: '/images/seal.png'
  });
  
  res.json({ ok:true });
});

// Kill via URL with victim's first name (e.g., /kill?victim=harrison)
app.get('/kill', async (req, res) => {
  try {
    const victimFirstName = req.query.victim;
    
    if (!victimFirstName || !victimFirstName.trim()) {
      return res.status(400).json({ error: 'Victim first name required in query parameter: /kill?victim=firstname' });
    }

    const searchName = victimFirstName.toLowerCase().trim();

    // Find player by first name (case-insensitive)
    const victim = players.players.find(p => {
      const playerFirstName = p.name.split(' ')[0].toLowerCase().trim();
      return playerFirstName === searchName;
    });

    if (!victim) {
      return res.status(404).json({ error: `Player with first name "${victimFirstName}" not found` });
    }

    // Send push notification to victim (no down system, just notify)
    const notificationResult = await sendPushNotification({
      title: '💀 You\'ve Been Eliminated!',
      body: `You've been killed! Check your phone for details.`,
      targetPlayerIds: [victim.id],
      url: '/profile',
      icon: '/images/seal.png',
      badge: '/images/seal.png'
    });

    console.log(`🎯 ${victim.name} has been notified of kill via URL!`);

    res.json({ 
      ok: true, 
      message: `${victim.name} has been notified!`,
      victim: {
        id: victim.id,
        name: victim.name
      },
      notificationSent: notificationResult.sent > 0
    });
  } catch (error) {
    console.error('Error in /kill route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
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

// JSON File Editor endpoints
const ALLOWED_JSON_FILES = ['game', 'players', 'characters', 'messages', 'nfc_cards', 'contacts', 'survey_data', 'push_subscriptions'];

app.get('/api/json/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    
    if (!ALLOWED_JSON_FILES.includes(filename)) {
      return res.status(403).json({ error: 'Access denied to this file' });
    }
    
    let data;
    switch (filename) {
      case 'game':
        data = game;
        break;
      case 'players':
        data = players;
        break;
      case 'characters':
        data = characters;
        break;
      case 'messages':
        data = messages;
        break;
      case 'nfc_cards':
        data = nfcCards;
        break;
      case 'contacts':
        data = contacts;
        break;
      case 'survey_data':
        data = surveyData;
        break;
      case 'push_subscriptions':
        data = pushSubscriptions;
        break;
      default:
        return res.status(404).json({ error: 'File not found' });
    }
    
    res.json(data);
  } catch (error) {
    console.error(`Error reading ${req.params.filename}.json:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/json/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const newData = req.body;
    
    if (!ALLOWED_JSON_FILES.includes(filename)) {
      return res.status(403).json({ error: 'Access denied to this file' });
    }
    
    // Validate JSON structure (basic validation)
    if (typeof newData !== 'object' || newData === null) {
      return res.status(400).json({ error: 'Invalid JSON data' });
    }
    
    // Update the in-memory data and save to file
    switch (filename) {
      case 'game':
        // Preserve some runtime state that shouldn't be overwritten
        const preservedState = {
          playersOnline: game.playersOnline,
          startedAt: game.startedAt,
          phase: game.phase
        };
        game = { ...newData, ...preservedState };
        await writeJSON('game.json', game);
        break;
      case 'players':
        players = newData;
        await writeJSON('players.json', players);
        break;
      case 'characters':
        characters = newData;
        await writeJSON('characters.json', characters);
        break;
      case 'messages':
        messages = newData;
        await writeJSON('messages.json', messages);
        break;
      case 'nfc_cards':
        nfcCards = newData;
        await writeJSON('nfc_cards.json', nfcCards);
        break;
      case 'contacts':
        contacts = newData;
        await writeJSON('contacts.json', contacts);
        break;
      case 'survey_data':
        surveyData = newData;
        await writeJSON('survey_data.json', surveyData);
        break;
      case 'push_subscriptions':
        pushSubscriptions = newData;
        await writeJSON('push_subscriptions.json', pushSubscriptions);
        break;
    }
    
    // Emit socket events for real-time updates if needed
    if (filename === 'game') {
      io.emit('game:phase', { phase: game.phase, startedAt: game.startedAt });
    }
    
    res.json({ ok: true, message: `${filename}.json updated successfully` });
  } catch (error) {
    console.error(`Error writing ${req.params.filename}.json:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve simple health
app.get('/health', (req,res)=>res.json({ok:true, time: Date.now()}));

const PORT = Number(process.env.PORT || 8080);
server.listen(PORT, ()=> console.log('Server on', PORT));
