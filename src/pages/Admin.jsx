import axios from 'axios'
import { useEffect, useState } from 'react'
const API = import.meta.env.VITE_API_BASE

export default function Admin(){
  const [game,setGame] = useState(null)
  const [players,setPlayers] = useState([])
  const [nfcId,setNfcId] = useState('')
  const [killerId,setKillerId] = useState('')
  const [detId,setDetId] = useState('')
  const [poisonTarget,setPoisonTarget] = useState('')
  const [safeTarget,setSafeTarget] = useState('')

  useEffect(()=>{
    (async()=>{
      const g = await axios.get(`${API}/api/game`); setGame(g.data)
      const p = await axios.get(`${API}/api/players`); setPlayers(p.data.players)
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
            {players.map(p=>(
              <li key={p.id}>
                <b>{p.name}</b> <span className="text-neutral-400">({p.roleId||'—'})</span>
                {p.isKiller && <span className="ml-2 text-red-400">KILLER</span>}
                {p.isDetective && <span className="ml-2 text-green-400">DETECTIVE</span>}
              </li>
            ))}
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
    </div>
  )
}
