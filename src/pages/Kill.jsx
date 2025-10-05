import axios from 'axios'
import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
const API = import.meta.env.VITE_API_BASE

export default function Kill(){
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const victim = searchParams.get('victim')
    
    if (!victim) {
      setError('No victim specified. URL should be: /kill?victim=firstname')
      setLoading(false)
      return
    }

    // Execute the kill
    executeKill(victim)
  }, [searchParams])

  async function executeKill(victimFirstName) {
    try {
      setLoading(true)
      const { data } = await axios.get(`${API}/kill?victim=${encodeURIComponent(victimFirstName)}`)
      setResult(data)
      setError(null)
    } catch (err) {
      console.error('Kill failed:', err)
      
      // Get detailed error message from backend
      const errorMsg = err?.response?.data?.error || err?.message || 'Failed to send notification'
      setError(errorMsg)
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card text-center space-y-4">
          <div className="w-16 h-16 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mx-auto" />
          <h2 className="text-xl font-semibold">Processing Kill...</h2>
          <p className="text-neutral-400">Sending notification to victim</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card text-center space-y-4 max-w-md">
          <div className="text-6xl">❌</div>
          <h2 className="text-xl font-semibold text-red-400">Kill Failed</h2>
          <p className="text-neutral-300 whitespace-pre-line">{error}</p>
          <div className="pt-4 space-y-2">
            <button 
              onClick={() => window.location.reload()}
              className="btn btn-secondary w-full"
            >
              Try Again
            </button>
            <button 
              onClick={() => navigate('/')}
              className="btn btn-primary w-full"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (result) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card text-center space-y-4 max-w-md">
          <div className="text-6xl">💀</div>
          <h2 className="text-2xl font-bold text-red-400">Kill Notification Sent!</h2>
          <div className="space-y-2">
            <p className="text-lg font-semibold">{result.message}</p>
            {result.notificationSent ? (
              <p className="text-green-400 text-sm">✅ Push notification sent to victim</p>
            ) : (
              <p className="text-yellow-400 text-sm">⚠️ Victim not subscribed to notifications</p>
            )}
          </div>
          {result.victim && (
            <div className="bg-neutral-800 p-4 rounded-lg text-left space-y-1 text-sm">
              <div><span className="text-neutral-400">Victim:</span> <span className="font-semibold">{result.victim.name}</span></div>
              <div><span className="text-neutral-400">Status:</span> <span className="text-red-400">Notified</span></div>
            </div>
          )}
          <div className="pt-4 space-y-2">
            <button 
              onClick={() => window.location.reload()}
              className="btn btn-secondary w-full"
            >
              Notify Another Player
            </button>
            <button 
              onClick={() => navigate('/')}
              className="btn btn-primary w-full"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
