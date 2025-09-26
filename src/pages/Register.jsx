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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="interrogation-room">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🏢</div>
          <h2 className="text-2xl font-bold text-red-400 mb-2">EMPLOYEE CHECK-IN</h2>
          <p className="text-neutral-400">Blackwood Corporate Tower Security</p>
        </div>
        
        <form onSubmit={submit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              👤 Full Name <span className="text-red-400">*</span>
            </label>
            <input 
              className="w-full p-4 rounded-lg bg-neutral-800 border-2 border-neutral-600 
                         focus:border-red-500 focus:outline-none text-white
                         placeholder-neutral-500" 
              placeholder="Enter your legal name" 
              value={name} 
              onChange={e=>setName(e.target.value)}
              required 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              🔑 Security Clearance ID <span className="text-neutral-500">(Optional)</span>
            </label>
            <input 
              className="w-full p-4 rounded-lg bg-neutral-800 border-2 border-neutral-600 
                         focus:border-yellow-500 focus:outline-none text-white font-mono
                         placeholder-neutral-500" 
              placeholder="e.g. SEC-7739, EXEC-2156" 
              value={roleId} 
              onChange={e=>setRoleId(e.target.value.toUpperCase())} 
            />
            <p className="text-xs text-neutral-500 mt-1">
              💡 Provided by Security Office if you have special access
            </p>
          </div>
          
          <button className="btn-primary w-full py-4 text-lg font-bold">
            🚪 Enter Building
          </button>
        </form>
      </div>
      
      <div className="card card-evidence">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">📋</span>
          <h3 className="font-bold text-blue-300">Building Access Protocols</h3>
        </div>
        
        <div className="space-y-4">
          <div className="bg-neutral-800/50 p-4 rounded-lg border-l-4 border-yellow-500">
            <div className="font-semibold text-yellow-300 mb-2">⚠️ SECURITY ALERT</div>
            <p className="text-sm text-neutral-300">
              Due to ongoing investigation, all personnel must check in through this terminal.
            </p>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-neutral-200 flex items-center gap-2">
              <span>📍</span> Access Instructions:
            </h4>
            <ol className="list-decimal ml-6 space-y-2 text-sm text-neutral-300">
              <li>🆔 Register your identity in the building system</li>
              <li>📱 Use your mobile device to scan NFC badges throughout the building</li>
              <li>🔍 Solve access codes using information from employee profiles</li>
              <li>⚠️ Be aware: some access points may be compromised or monitored</li>
              <li>🏆 Piece together evidence to unlock the master security code</li>
            </ol>
          </div>
          
          <div className="bg-red-950/30 p-4 rounded-lg border border-red-600/30 mt-6">
            <div className="font-semibold text-red-300 mb-2 flex items-center gap-2">
              <span>🚨</span> CRITICAL NOTICE
            </div>
            <p className="text-xs text-red-200">
              A serious incident occurred in Executive Conference Room at 09:47 AM. 
              All employees are considered persons of interest until investigation concludes.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}