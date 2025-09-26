import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import axios from 'axios'
const API = import.meta.env.VITE_API_BASE
const socket = io(API, { transports: ['websocket'] })

export default function Lobby(){
  const [player, setPlayer] = useState(()=>JSON.parse(localStorage.getItem('player')||'null'))
  const [game, setGame] = useState(null)
  const [online, setOnline] = useState([])
  const [chat, setChat] = useState([])
  const [text, setText] = useState('')

  useEffect(()=>{
    socket.emit('hello', { playerId: player?.id })
    socket.on('presence', (p)=> setOnline(p.online||[]))
    socket.on('chat:new', (m)=> setChat((c)=>[...c,m]))
    return ()=>{
      socket.off('presence'); socket.off('chat:new')
    }
  },[])

  useEffect(()=>{
    (async()=>{
      const { data } = await axios.get(`${API}/api/game`)
      setGame(data)
    })()
  },[])

  function send(){
    if(!text.trim()) return
    socket.emit('chat:send', { from: player?.name||'Anon', text })
    setText('')
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-neutral-400">Phase</div>
            <div className="text-lg font-semibold">{game?.phase} {game?.act?`/ ${game.act}`:''}</div>
          </div>
          <div className="text-sm text-neutral-400">Online: {online.length}</div>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold mb-2">Collected Letters</h3>
        <div className="grid grid-cols-2 gap-2">
          <RouteLetters title="BLUE" letters={game?.letters?.BLUE||[]} />
          <RouteLetters title="GOLD" letters={game?.letters?.GOLD||[]} />
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold">Chat</h3>
        <div className="h-64 overflow-auto my-2 space-y-1 text-sm">
          {chat.map(m=> <div key={m.id}><b>{m.from}:</b> {m.text}</div>)}
        </div>
        <div className="flex gap-2">
          <input value={text} onChange={e=>setText(e.target.value)} className="flex-1 p-2 rounded bg-neutral-800 border border-neutral-700" placeholder="Say something..." />
          <button onClick={send} className="btn btn-primary">Send</button>
        </div>
      </div>
    </div>
  )
}

function RouteLetters({title, letters}){
  return (
    <div>
      <div className="mb-1">{title}</div>
      <div className="grid grid-cols-10 gap-1">
        {letters.map((ch,i)=> <div key={i} className="h-10 rounded bg-neutral-900 border border-neutral-800 grid place-items-center">{ch||'—'}</div>)}
      </div>
    </div>
  )
}
