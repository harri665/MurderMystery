import axios from 'axios'
import { useState } from 'react'
const API = import.meta.env.VITE_API_BASE

export default function Kill(){
  const [killerId,setKillerId] = useState('')
  const [targetId,setTargetId] = useState('')
  const [msg,setMsg] = useState('')

  async function submit(e){
    e.preventDefault()
    try{
      const { data } = await axios.post(`${API}/api/kill`, { killerId, targetId })
      setMsg('Downed!')
    }catch(err){
      setMsg(err?.response?.data?.error || 'Error')
    }
  }

  return (
    <div className="card space-y-3">
      <h2 className="text-xl font-semibold">Kill Tool (Killer‑only)</h2>
      <form onSubmit={submit} className="grid md:grid-cols-2 gap-2">
        <input className="p-2 rounded bg-neutral-800 border border-neutral-700" placeholder="Your Killer ID (mara/jax)" value={killerId} onChange={e=>setKillerId(e.target.value)} />
        <input className="p-2 rounded bg-neutral-800 border border-neutral-700" placeholder="Target Player ID" value={targetId} onChange={e=>setTargetId(e.target.value)} />
        <button className="btn btn-primary md:col-span-2">Confirm</button>
      </form>
      {msg && <div className="text-sm text-neutral-300">{msg}</div>}
      <p className="text-sm text-neutral-400">GM: replace this with QR scanner if desired.</p>
    </div>
  )
}
