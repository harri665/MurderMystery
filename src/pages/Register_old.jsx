import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
const API = import.meta.env.VITE_API_BASE

export default function Register(){
  const [name,setName] = useState('')
  const [roleId,setRoleId] = useState('')
  const nav = useNavigate()

  async function submit(e){
    e.preventDefault()
    const { data } = await axios.post(`${API}/api/register`, { name, roleId: roleId||undefined })
    localStorage.setItem('player', JSON.stringify(data.player))
    nav('/lobby')
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <form onSubmit={submit} className="card space-y-3">
        <h2 className="text-lg font-semibold">Join Game</h2>
        <input className="w-full p-2 rounded bg-neutral-800 border border-neutral-700" placeholder="Your name" value={name} onChange={e=>setName(e.target.value)} />
        <input className="w-full p-2 rounded bg-neutral-800 border border-neutral-700" placeholder="(Optional) Role ID from GM" value={roleId} onChange={e=>setRoleId(e.target.value)} />
        <button className="btn btn-primary w-full">Enter Lobby</button>
      </form>
      <div className="card">
        <h3 className="font-semibold mb-2">How it works</h3>
        <ol className="list-decimal ml-5 space-y-1 text-sm text-neutral-300">
          <li>Register your name (GM can later assign roles).</li>
          <li>Scan NFCs around the neighborhood via this app.</li>
          <li>Enter passphrases sourced from teammates’ backstories.</li>
          <li>Beware poisoned tags; the Detective can un-poison.</li>
          <li>Combine letters to unlock the final 20‑char code.</li>
        </ol>
      </div>
    </div>
  )
}
