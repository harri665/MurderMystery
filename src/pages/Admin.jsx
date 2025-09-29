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
  const [assignPlayerId,setAssignPlayerId] = useState('')
  const [assignCharId,setAssignCharId] = useState('')

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
    await axios.post(`${API}/api/characters`, { name: newCharName, goals, flaws, backstory: newCharBackstory })
    const c = await axios.get(`${API}/api/characters`); setCharacters(c.data)
    setNewCharName(''); setNewCharGoals(''); setNewCharFlaws(''); setNewCharBackstory('')
  }

  async function assignCharacter(){
    await axios.post(`${API}/api/players/${assignPlayerId}/assign-character`, { characterId: assignCharId })
    const p = await axios.get(`${API}/api/players`); setPlayers(p.data.players)
    setAssignPlayerId(''); setAssignCharId('')
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

      <div className="card grid md:grid-cols-2 gap-3">
        <div>
          <h4 className="font-semibold">Create Character</h4>
          <input className="w-full p-2 rounded bg-neutral-800 border border-neutral-700 mb-2" value={newCharName} onChange={e=>setNewCharName(e.target.value)} placeholder="Character Name" />
          <input className="w-full p-2 rounded bg-neutral-800 border border-neutral-700 mb-2" value={newCharGoals} onChange={e=>setNewCharGoals(e.target.value)} placeholder="Goals (comma separated)" />
          <input className="w-full p-2 rounded bg-neutral-800 border border-neutral-700 mb-2" value={newCharFlaws} onChange={e=>setNewCharFlaws(e.target.value)} placeholder="Flaws (comma separated)" />
          <textarea className="w-full p-2 rounded bg-neutral-800 border border-neutral-700 mb-2" value={newCharBackstory} onChange={e=>setNewCharBackstory(e.target.value)} placeholder="Backstory" rows="3"></textarea>
          <button onClick={createCharacter} className="btn w-full">Create Character</button>
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
              <b>{c.name}</b>
              <div>Goals: {c.goals.join(', ')}</div>
              <div>Flaws: {c.flaws.join(', ')}</div>
              <div>Backstory: {c.backstory}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
