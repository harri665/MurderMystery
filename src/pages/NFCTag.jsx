import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from 'axios'
const API = import.meta.env.VITE_API_BASE

export default function NFCTag(){
  const { id } = useParams()
  const [data,setData] = useState(null)
  const [pass,setPass] = useState('')
  const [result,setResult] = useState(null)
  const player = JSON.parse(localStorage.getItem('player')||'null')

  useEffect(()=>{
    (async()=>{
      const { data } = await axios.get(`${API}/api/nfc/${id}`)
      setData(data)
    })()
  },[id])

  async function submit(e){
    e.preventDefault()
    const { data:resp } = await axios.post(`${API}/api/nfc/${id}/attempt`, { playerId: player?.id, passphrase: pass })
    setResult(resp)
  }

  if(!data) return <div className="card">Loading tag...</div>
  return (
    <div className="card space-y-3">
      <div className="text-sm text-neutral-400">#{data.route} {data.index} • {data.title} {data.poisoned? <span className="text-red-400">(POISONED)</span>:''} {data.safe? <span className="text-green-400">(SAFE)</span>:''}</div>
      <h2 className="text-xl font-semibold">Next-Location Riddle</h2>
      <p className="text-neutral-300">{data.nextRiddle}</p>
      <h3 className="font-semibold mt-2">Passphrase</h3>
      <p className="text-neutral-300 text-sm">{data.passPrompt}</p>
      <form onSubmit={submit} className="flex gap-2">
        <input value={pass} onChange={e=>setPass(e.target.value)} className="flex-1 p-2 rounded bg-neutral-800 border border-neutral-700" placeholder="Enter passphrase..." />
        <button className="btn btn-primary">Unlock</button>
      </form>
      {result && (result.ok ?
        <div className="text-green-400">Unlocked! Reward character: <b>{result.letter}</b></div> :
        <div className="text-red-400">Nope. That didn't work.</div>
      )}
    </div>
  )
}
