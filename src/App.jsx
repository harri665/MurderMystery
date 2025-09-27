import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'

export default function App(){
  // Control whether to redirect home page to survey
  const REDIRECT_HOME_TO_SURVEY = true
  
  const [player, setPlayer] = useState(()=>{
    try { return JSON.parse(localStorage.getItem('player')||'null') } catch { return null }
  })
  const nav = useNavigate()
  const location = useLocation()
  
  // Allow access to admin routes and survey routes without player
  const adminRoutes = ['/survey-admin', '/gm', '/survey']
  const isAdminRoute = adminRoutes.some(route => location.pathname.startsWith(route))
  
  useEffect(()=>{
    if(!player && !isAdminRoute) {
      nav('/')
    }
  },[player, isAdminRoute, nav])

  // Render survey page without any other elements (only for survey routes, not admin)
  if (location.pathname === '/survey' || (REDIRECT_HOME_TO_SURVEY && location.pathname === '/')) {
    return (
      <div className="min-h-dvh">
        <Outlet/>
      </div>
    )
  }

  return (
    <div className="min-h-dvh max-w-6xl mx-auto p-4 space-y-6">
      <header className="office-header p-6 rounded-2xl">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="text-3xl">🏢</div>
            <div>
              <Link to="/" className="text-2xl font-bold text-red-400 hover:text-red-300 transition-colors">
                BLACKWOOD CORPORATE TOWER
              </Link>
              <div className="text-sm text-neutral-400 font-mono">
                ⚠️ ACTIVE CRIME SCENE - AUTHORIZED PERSONNEL ONLY ⚠️
              </div>
            </div>
          </div>
          <nav className="flex gap-3">
            <Link to="/lobby" className="btn">
              📋 Employee Roster
            </Link>
            <Link to="/survey" className="btn btn-detective">
              🕵️ Personality Assessment 
            </Link>
            <Link to="/gm" className="btn btn-primary">
              👮 Security Office
            </Link>
            <Link to="/survey-admin" className="btn btn-office">
              📊 HR Analytics
            </Link>
          </nav>
        </div>
        
        {/* Crime tape decoration */}
        <div className="crime-tape mt-4 pt-4 border-t border-red-900/30">
          <div className="text-center text-yellow-400 font-bold text-sm tracking-wider">
            🚨 MURDER INVESTIGATION IN PROGRESS - DO NOT CROSS 🚨
          </div>
        </div>
      </header>
      
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-9">
          <Outlet/>
        </div>
        
        <div className="col-span-12 lg:col-span-3 space-y-4">
          {/* Office Directory */}
          <div className="card card-evidence">
            <h3 className="font-bold text-blue-300 mb-3 flex items-center gap-2">
              🗂️ Office Directory
            </h3>
            <div className="space-y-2 text-sm">
              <div className="suspect-item">
                <span>Floor 1: Reception</span>
                <span className="evidence-marker">CLEAR</span>
              </div>
              <div className="suspect-item">
                <span>Floor 2: Accounting</span>
                <span className="evidence-marker">SECURED</span>
              </div>
              <div className="suspect-item bloodstain">
                <span>Floor 3: Executive</span>
                <span className="evidence-marker text-red-300">⚠️ SCENE</span>
              </div>
              <div className="suspect-item">
                <span>Floor 4: IT Dept</span>
                <span className="evidence-marker">CLEAR</span>
              </div>
            </div>
          </div>
          
          {/* Evidence Log */}
          <div className="card card-danger">
            <h3 className="font-bold text-red-300 mb-3 flex items-center gap-2">
              🔍 Evidence Log
            </h3>
            <div className="space-y-2 text-sm text-neutral-300">
              <div className="flex justify-between">
                <span>Coffee cup</span>
                <span className="text-yellow-400">PROCESSED</span>
              </div>
              <div className="flex justify-between">
                <span>Keycard access</span>
                <span className="text-blue-400">ANALYZING</span>
              </div>
              <div className="flex justify-between bloodstain">
                <span>Blood sample</span>
                <span className="text-red-400">URGENT</span>
              </div>
              <div className="flex justify-between">
                <span>Security footage</span>
                <span className="text-green-400">REVIEWED</span>
              </div>
            </div>
          </div>
          
          {/* Time of Death */}
          <div className="card bg-gradient-to-br from-red-950/50 to-neutral-900 border-red-600/50">
            <h3 className="font-bold text-red-200 mb-2 text-center">⚰️ CASE FILE</h3>
            <div className="text-center space-y-1 text-sm">
              <div className="text-neutral-400">Time of Death:</div>
              <div className="font-mono text-red-300 text-lg">09:47 AM</div>
              <div className="text-neutral-400">Location:</div>
              <div className="text-red-300">Executive Conference Room</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
