import axios from 'axios'
import { useEffect, useState } from 'react'
const API = import.meta.env.VITE_API_BASE

export default function Admin(){
  const [game,setGame] = useState(null)
  const [players,setPlayers] = useState([])
  const [characters,setCharacters] = useState([])
  const [nfcId,setNfcId] = useState('')
  const [killerId,setKillerId] = useState('')
  const [detId,setDetId] = useState('')
  const [poisonTarget,setPoisonTarget] = useState('')
  const [safeTarget,setSafeTarget] = useState('')
  const [newCharName,setNewCharName] = useState('')
  const [newCharGoals,setNewCharGoals] = useState('')
  const [newCharFlaws,setNewCharFlaws] = useState('')
  const [newCharBackstory,setNewCharBackstory] = useState('')
  const [newCharAvatar,setNewCharAvatar] = useState('')
  const [newCharIsKiller,setNewCharIsKiller] = useState(false)
  const [newCharIsDetective,setNewCharIsDetective] = useState(false)
  const [assignPlayerId,setAssignPlayerId] = useState('')
  const [assignCharId,setAssignCharId] = useState('')
  const [newPlayerName,setNewPlayerName] = useState('')
  const [newPlayerRole,setNewPlayerRole] = useState('')
  const [removePlayerId,setRemovePlayerId] = useState('')
  const [removeCharacterId,setRemoveCharacterId] = useState('')
  const [setRolePlayerId,setSetRolePlayerId] = useState('')
  const [setRoleType,setSetRoleType] = useState('')

  // Notification state
  const [notificationTitle, setNotificationTitle] = useState('')
  const [notificationBody, setNotificationBody] = useState('')
  const [notificationTargets, setNotificationTargets] = useState([])
  const [notificationUrl, setNotificationUrl] = useState('/')
  const [sendingNotification, setSendingNotification] = useState(false)
  const [notificationResult, setNotificationResult] = useState(null)

  // JSON Editor state
  const [jsonFiles, setJsonFiles] = useState({
    game: '',
    players: '',
    characters: '',
    messages: '',
    nfc_cards: '',
    contacts: '',
    survey_data: '',
    push_subscriptions: ''
  })
  const [activeJsonTab, setActiveJsonTab] = useState('game')
  const [jsonLoading, setJsonLoading] = useState(false)
  const [jsonSaving, setJsonSaving] = useState('')

  useEffect(()=>{
    (async()=>{
      const g = await axios.get(`${API}/api/game`); setGame(g.data)
      const p = await axios.get(`${API}/api/players`); setPlayers(p.data.players)
      const c = await axios.get(`${API}/api/characters`); setCharacters(c.data)
    })()
  },[])

  async function start(){
    await axios.post(`${API}/api/gm/start`); const g = await axios.get(`${API}/api/game`); setGame(g.data)
  }
  async function poison(){
    await axios.post(`${API}/api/poison`, { killerId, nfcId: poisonTarget })
  }
  async function unpoison(){
    await axios.post(`${API}/api/unpoison`, { detectiveId: detId, nfcId })
  }
  async function safeMark(){
    await axios.post(`${API}/api/safe-mark`, { playerId: detId, nfcId: safeTarget })
  }

  async function createCharacter(){
    const goals = newCharGoals.split(',').map(g=>g.trim()).filter(Boolean)
    const flaws = newCharFlaws.split(',').map(f=>f.trim()).filter(Boolean)
    await axios.post(`${API}/api/characters`, { 
      name: newCharName, 
      goals, 
      flaws, 
      backstory: newCharBackstory, 
      avatar: newCharAvatar || null,
      isKiller: newCharIsKiller,
      isDetective: newCharIsDetective
    })
    const c = await axios.get(`${API}/api/characters`); setCharacters(c.data)
    setNewCharName(''); setNewCharGoals(''); setNewCharFlaws(''); setNewCharBackstory(''); setNewCharAvatar('')
    setNewCharIsKiller(false); setNewCharIsDetective(false)
  }

  async function assignCharacter(){
    await axios.post(`${API}/api/players/${assignPlayerId}/assign-character`, { characterId: assignCharId })
    const p = await axios.get(`${API}/api/players`); setPlayers(p.data.players)
    setAssignPlayerId(''); setAssignCharId('')
  }

  async function createPlayer(){
    await axios.post(`${API}/api/players`, { 
      name: newPlayerName, 
      role: newPlayerRole || null
    })
    const p = await axios.get(`${API}/api/players`); setPlayers(p.data.players)
    setNewPlayerName(''); setNewPlayerRole('')
  }

  async function removePlayer(){
    if (!removePlayerId) return
    await axios.delete(`${API}/api/players/${removePlayerId}`)
    const p = await axios.get(`${API}/api/players`); setPlayers(p.data.players)
    setRemovePlayerId('')
  }

  async function removeCharacter(){
    if (!removeCharacterId) return
    await axios.delete(`${API}/api/characters/${removeCharacterId}`)
    const c = await axios.get(`${API}/api/characters`); setCharacters(c.data)
    setRemoveCharacterId('')
  }

  async function setPlayerRole(){
    if (!setRolePlayerId || !setRoleType) return
    const isKiller = setRoleType === 'killer'
    const isDetective = setRoleType === 'detective'
    await axios.post(`${API}/api/players/${setRolePlayerId}/set-role`, { isKiller, isDetective })
    const p = await axios.get(`${API}/api/players`); setPlayers(p.data.players)
    setSetRolePlayerId(''); setSetRoleType('')
  }

  // JSON Editor functions
  async function loadJsonFile(filename) {
    try {
      const response = await axios.get(`${API}/api/json/${filename}`)
      setJsonFiles(prev => ({
        ...prev,
        [filename]: JSON.stringify(response.data, null, 2)
      }))
    } catch (error) {
      console.error(`Error loading ${filename}.json:`, error)
      alert(`Error loading ${filename}.json`)
    }
  }

  async function saveJsonFile(filename) {
    try {
      setJsonSaving(filename)
      const data = JSON.parse(jsonFiles[filename])
      await axios.post(`${API}/api/json/${filename}`, data)
      
      // Refresh the relevant state if needed
      if (filename === 'game') {
        const g = await axios.get(`${API}/api/game`); setGame(g.data)
      } else if (filename === 'players') {
        const p = await axios.get(`${API}/api/players`); setPlayers(p.data.players)
      } else if (filename === 'characters') {
        const c = await axios.get(`${API}/api/characters`); setCharacters(c.data)
      }
      
      alert(`${filename}.json saved successfully!`)
    } catch (error) {
      console.error(`Error saving ${filename}.json:`, error)
      alert(`Error saving ${filename}.json: ${error.message}`)
    } finally {
      setJsonSaving('')
    }
  }

  async function loadAllJsonFiles() {
    setJsonLoading(true)
    try {
      await Promise.all(Object.keys(jsonFiles).map(filename => loadJsonFile(filename)))
    } catch (error) {
      console.error('Error loading JSON files:', error)
    } finally {
      setJsonLoading(false)
    }
  }

  // Notification functions
  async function sendNotification() {
    if (!notificationTitle || !notificationBody) {
      alert('Title and body are required')
      return
    }

    setSendingNotification(true)
    setNotificationResult(null)

    try {
      const response = await axios.post(`${API}/api/gm/notify`, {
        title: notificationTitle,
        body: notificationBody,
        targetPlayers: notificationTargets.length > 0 ? notificationTargets : undefined,
        url: notificationUrl || '/',
        icon: '/images/seal.png',
        badge: '/images/seal.png'
      })

      setNotificationResult({
        success: true,
        message: response.data.message,
        details: response.data
      })

      // Clear form on success
      setNotificationTitle('')
      setNotificationBody('')
      setNotificationTargets([])
      setNotificationUrl('/')
    } catch (error) {
      console.error('Error sending notification:', error)
      setNotificationResult({
        success: false,
        message: error.response?.data?.error || 'Failed to send notification',
        details: error.response?.data
      })
    } finally {
      setSendingNotification(false)
    }
  }

  function toggleNotificationTarget(playerId) {
    setNotificationTargets(prev => {
      if (prev.includes(playerId)) {
        return prev.filter(id => id !== playerId)
      } else {
        return [...prev, playerId]
      }
    })
  }

  function selectAllPlayers() {
    setNotificationTargets(players.map(p => p.id))
  }

  function clearAllPlayers() {
    setNotificationTargets([])
  }

  return (
    <div className="grid gap-4">
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-neutral-400">Phase</div>
            <div className="text-lg font-semibold">{game?.phase} {game?.act?`/ ${game.act}`:''}</div>
          </div>
          <button onClick={start} className="btn btn-primary">Start Game</button>
        </div>
      </div>

      {/* Notification Section */}
      <div className="card">
        <h3 className="font-semibold mb-3 text-xl">📢 Send Push Notifications</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Notification Title</label>
            <input
              className="w-full p-2 rounded bg-neutral-800 border border-neutral-700"
              value={notificationTitle}
              onChange={e => setNotificationTitle(e.target.value)}
              placeholder="e.g., Important Game Update"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notification Body</label>
            <textarea
              className="w-full p-2 rounded bg-neutral-800 border border-neutral-700"
              value={notificationBody}
              onChange={e => setNotificationBody(e.target.value)}
              placeholder="e.g., A new clue has been discovered..."
              rows="3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notification URL (optional)</label>
            <input
              className="w-full p-2 rounded bg-neutral-800 border border-neutral-700"
              value={notificationUrl}
              onChange={e => setNotificationUrl(e.target.value)}
              placeholder="/profile or /nfc/tag123"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">Target Players</label>
              <div className="flex gap-2">
                <button
                  onClick={selectAllPlayers}
                  className="text-xs px-2 py-1 rounded bg-blue-600 hover:bg-blue-700"
                >
                  Select All
                </button>
                <button
                  onClick={clearAllPlayers}
                  className="text-xs px-2 py-1 rounded bg-neutral-700 hover:bg-neutral-600"
                >
                  Clear All
                </button>
              </div>
            </div>
            <div className="text-xs text-neutral-400 mb-2">
              Leave empty to send to all subscribed players
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 bg-neutral-900 rounded border border-neutral-700">
              {players.map(p => (
                <label key={p.id} className="flex items-center gap-2 cursor-pointer hover:bg-neutral-800 p-1 rounded">
                  <input
                    type="checkbox"
                    checked={notificationTargets.includes(p.id)}
                    onChange={() => toggleNotificationTarget(p.id)}
                    className="rounded border-neutral-700"
                  />
                  <span className="text-sm truncate">{p.name}</span>
                </label>
              ))}
            </div>
            {notificationTargets.length > 0 && (
              <div className="text-xs text-blue-400 mt-1">
                {notificationTargets.length} player(s) selected
              </div>
            )}
          </div>

          <button
            onClick={sendNotification}
            disabled={sendingNotification || !notificationTitle || !notificationBody}
            className="btn btn-primary w-full"
          >
            {sendingNotification ? '📤 Sending...' : '📢 Send Notification'}
          </button>

          {notificationResult && (
            <div className={`p-3 rounded border ${
              notificationResult.success 
                ? 'bg-green-900/20 border-green-600 text-green-400' 
                : 'bg-red-900/20 border-red-600 text-red-400'
            }`}>
              <div className="font-semibold mb-1">
                {notificationResult.success ? '✅ Success' : '❌ Error'}
              </div>
              <div className="text-sm">{notificationResult.message}</div>
              {notificationResult.details && (
                <details className="text-xs mt-2">
                  <summary className="cursor-pointer">Details</summary>
                  <pre className="mt-1 overflow-auto">
                    {JSON.stringify(notificationResult.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="card grid md:grid-cols-2 gap-3">
        <div>
          <h3 className="font-semibold mb-1">Known roles</h3>
          <ul className="text-sm space-y-1">
            {players.map(p=>{
              const char = characters.find(c=>c.id === p.characterId);
              return (
                <li key={p.id}>
                  <b>{p.name}</b> <span className="text-neutral-400">({p.roleId||'—'})</span>
                  {char && <span className="ml-2 text-blue-400">[{char.name}]</span>}
                  {p.isKiller && <span className="ml-2 text-red-400">KILLER</span>}
                  {p.isDetective && <span className="ml-2 text-green-400">DETECTIVE</span>}
                </li>
              );
            })}
          </ul>
        </div>
        <div className="space-y-2">
          <label className="block text-sm">Detective Player ID
            <input className="w-full p-2 rounded bg-neutral-800 border border-neutral-700" value={detId} onChange={e=>setDetId(e.target.value)} placeholder="iris" />
          </label>
          <label className="block text-sm">Killer Player ID
            <input className="w-full p-2 rounded bg-neutral-800 border border-neutral-700" value={killerId} onChange={e=>setKillerId(e.target.value)} placeholder="mara or jax" />
          </label>
        </div>
      </div>

      <div className="card grid md:grid-cols-3 gap-3">
        <div>
          <h4 className="font-semibold">Poison Tag</h4>
          <input className="w-full p-2 rounded bg-neutral-800 border border-neutral-700" value={poisonTarget} onChange={e=>setPoisonTarget(e.target.value)} placeholder="nfc id e.g., blue4" />
          <button onClick={poison} className="btn w-full mt-2">Poison</button>
        </div>
        <div>
          <h4 className="font-semibold">Unpoison Tag</h4>
          <input className="w-full p-2 rounded bg-neutral-800 border border-neutral-700" value={nfcId} onChange={e=>setNfcId(e.target.value)} placeholder="nfc id" />
          <button onClick={unpoison} className="btn w-full mt-2">Unpoison</button>
        </div>
        <div>
          <h4 className="font-semibold">Safe Mark</h4>
          <input className="w-full p-2 rounded bg-neutral-800 border border-neutral-700" value={safeTarget} onChange={e=>setSafeTarget(e.target.value)} placeholder="nfc id" />
          <button onClick={safeMark} className="btn w-full mt-2">Mark SAFE</button>
        </div>
      </div>

      <div className="card grid md:grid-cols-2 lg:grid-cols-6 gap-3">
        <div>
          <h4 className="font-semibold">Create Player</h4>
          <input className="w-full p-2 rounded bg-neutral-800 border border-neutral-700 mb-2" value={newPlayerName} onChange={e=>setNewPlayerName(e.target.value)} placeholder="Player Name" />
          <input className="w-full p-2 rounded bg-neutral-800 border border-neutral-700 mb-2" value={newPlayerRole} onChange={e=>setNewPlayerRole(e.target.value)} placeholder="Role (optional)" />
          <button onClick={createPlayer} className="btn w-full">Create Player</button>
        </div>
        <div>
          <h4 className="font-semibold">Remove Player</h4>
          <select className="w-full p-2 rounded bg-neutral-800 border border-neutral-700 mb-2" value={removePlayerId} onChange={e=>setRemovePlayerId(e.target.value)}>
            <option value="">Select Player to Remove</option>
            {players.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <button onClick={removePlayer} className="btn w-full bg-red-600 hover:bg-red-700">Remove Player</button>
        </div>
        <div>
          <h4 className="font-semibold">Set Player Role</h4>
          <select className="w-full p-2 rounded bg-neutral-800 border border-neutral-700 mb-2" value={setRolePlayerId} onChange={e=>setSetRolePlayerId(e.target.value)}>
            <option value="">Select Player</option>
            {players.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select className="w-full p-2 rounded bg-neutral-800 border border-neutral-700 mb-2" value={setRoleType} onChange={e=>setSetRoleType(e.target.value)}>
            <option value="">Select Role</option>
            <option value="citizen">Citizen</option>
            <option value="detective">Detective</option>
            <option value="killer">Killer</option>
          </select>
          <button onClick={setPlayerRole} className="btn w-full">Set Role</button>
        </div>
        <div>
          <h4 className="font-semibold">Create Character</h4>
          <input className="w-full p-2 rounded bg-neutral-800 border border-neutral-700 mb-2" value={newCharName} onChange={e=>setNewCharName(e.target.value)} placeholder="Character Name" />
          <input className="w-full p-2 rounded bg-neutral-800 border border-neutral-700 mb-2" value={newCharAvatar} onChange={e=>setNewCharAvatar(e.target.value)} placeholder="Avatar URL (optional)" />
          <input className="w-full p-2 rounded bg-neutral-800 border border-neutral-700 mb-2" value={newCharGoals} onChange={e=>setNewCharGoals(e.target.value)} placeholder="Goals (comma separated)" />
          <input className="w-full p-2 rounded bg-neutral-800 border border-neutral-700 mb-2" value={newCharFlaws} onChange={e=>setNewCharFlaws(e.target.value)} placeholder="Flaws (comma separated)" />
          <textarea className="w-full p-2 rounded bg-neutral-800 border border-neutral-700 mb-2" value={newCharBackstory} onChange={e=>setNewCharBackstory(e.target.value)} placeholder="Backstory" rows="3"></textarea>
          <div className="flex gap-4 mb-2">
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={newCharIsKiller} 
                onChange={e=>setNewCharIsKiller(e.target.checked)}
                className="rounded border-neutral-700"
              />
              <span className="text-red-400 font-semibold">Killer</span>
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={newCharIsDetective} 
                onChange={e=>setNewCharIsDetective(e.target.checked)}
                className="rounded border-neutral-700"
              />
              <span className="text-blue-400 font-semibold">Detective</span>
            </label>
          </div>
          <button onClick={createCharacter} className="btn w-full">Create Character</button>
        </div>
        <div>
          <h4 className="font-semibold">Remove Character</h4>
          <select className="w-full p-2 rounded bg-neutral-800 border border-neutral-700 mb-2" value={removeCharacterId} onChange={e=>setRemoveCharacterId(e.target.value)}>
            <option value="">Select Character to Remove</option>
            {characters.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button onClick={removeCharacter} className="btn w-full bg-red-600 hover:bg-red-700">Remove Character</button>
        </div>
        <div>
          <h4 className="font-semibold">Assign Character to Player</h4>
          <select className="w-full p-2 rounded bg-neutral-800 border border-neutral-700 mb-2" value={assignPlayerId} onChange={e=>setAssignPlayerId(e.target.value)}>
            <option value="">Select Player</option>
            {players.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select className="w-full p-2 rounded bg-neutral-800 border border-neutral-700 mb-2" value={assignCharId} onChange={e=>setAssignCharId(e.target.value)}>
            <option value="">Select Character</option>
            {characters.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button onClick={assignCharacter} className="btn w-full">Assign</button>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold mb-1">Characters</h3>
        <ul className="text-sm space-y-2">
          {characters.map(c=>(
            <li key={c.id} className="border-b border-neutral-700 pb-2">
              <div className="flex items-center gap-2 mb-1">
                <b>{c.name}</b>
                {c.isKiller && <span className="text-red-400 font-semibold">KILLER</span>}
                {c.isDetective && <span className="text-blue-400 font-semibold">DETECTIVE</span>}
              </div>
              <div>Goals: {c.goals.join(', ')}</div>
              <div>Flaws: {c.flaws.join(', ')}</div>
              <div>Backstory: {c.backstory}</div>
            </li>
          ))}
        </ul>
      </div>

      {/* JSON Editor Section */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">JSON File Editor</h3>
          <button 
            onClick={loadAllJsonFiles} 
            disabled={jsonLoading}
            className="btn btn-secondary"
          >
            {jsonLoading ? 'Loading...' : 'Load All JSON Files'}
          </button>
        </div>

        {/* JSON File Tabs */}
        <div className="flex flex-wrap gap-2 mb-4 border-b border-neutral-700 pb-2">
          {Object.keys(jsonFiles).map(filename => (
            <button
              key={filename}
              onClick={() => setActiveJsonTab(filename)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                activeJsonTab === filename
                  ? 'bg-blue-600 text-white'
                  : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
              }`}
            >
              {filename}.json
            </button>
          ))}
        </div>

        {/* JSON Editor */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-lg">{activeJsonTab}.json</h4>
            <div className="flex gap-2">
              <button 
                onClick={() => loadJsonFile(activeJsonTab)}
                className="btn btn-secondary text-sm"
              >
                Reload
              </button>
              <button 
                onClick={() => saveJsonFile(activeJsonTab)}
                disabled={jsonSaving === activeJsonTab}
                className="btn btn-primary text-sm"
              >
                {jsonSaving === activeJsonTab ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          <textarea
            value={jsonFiles[activeJsonTab]}
            onChange={(e) => setJsonFiles(prev => ({
              ...prev,
              [activeJsonTab]: e.target.value
            }))}
            className="w-full h-96 p-4 rounded bg-neutral-900 border border-neutral-700 font-mono text-sm text-green-400"
            placeholder={`JSON content for ${activeJsonTab}.json will appear here...`}
            spellCheck={false}
          />

          <div className="text-xs text-neutral-500">
            ⚠️ Warning: Invalid JSON will cause errors. Make sure your JSON is valid before saving.
          </div>
        </div>
      </div>
    </div>
  )
}
