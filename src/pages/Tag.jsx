import { useSearchParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import tagsData from '../../data/tags.json'

export default function Tag() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [tagData, setTagData] = useState(null)
  const [error, setError] = useState(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [isCorrect, setIsCorrect] = useState(false)
  const [showError, setShowError] = useState(false)
  const [attempts, setAttempts] = useState(0)

  useEffect(() => {
    const tag = searchParams.get('tag')
    
    if (!tag) {
      setError('No tag specified. URL should be: /tag?tag=number')
      return
    }

    const tagNum = parseInt(tag, 10)
    
    if (isNaN(tagNum) || tagNum < 1 || tagNum > 20) {
      setError('Invalid tag number. Must be between 1 and 20.')
      return
    }

    // Find the tag data
    const foundTag = tagsData.tags.find(t => t.id === tagNum)
    
    if (!foundTag) {
      setError(`Tag ${tagNum} data not found.`)
      return
    }

    setTagData(foundTag)
    setError(null)
  }, [searchParams])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!tagData) return

    // Normalize both strings for comparison (case-insensitive, trim whitespace)
    const normalizedAnswer = userAnswer.trim().toLowerCase()
    const normalizedPassphrase = tagData.passphrase.toLowerCase()
    const normalizedPassphraseAlt = tagData.passphraseAlt?.toLowerCase()

    if (normalizedAnswer === normalizedPassphrase || 
        (normalizedPassphraseAlt && normalizedAnswer === normalizedPassphraseAlt)) {
      setIsCorrect(true)
      setShowError(false)
      
      // Vibrate on success
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100])
      }
    } else {
      setShowError(true)
      setAttempts(prev => prev + 1)
      
      // Vibrate on error
      if (navigator.vibrate) {
        navigator.vibrate(200)
      }
      
      // Clear error after 3 seconds
      setTimeout(() => setShowError(false), 3000)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card text-center space-y-4 max-w-md">
          <div className="text-6xl">⚠️</div>
          <h2 className="text-xl font-semibold text-yellow-400">Invalid Tag</h2>
          <p className="text-neutral-300">{error}</p>
          <button 
            onClick={() => navigate('/')}
            className="btn btn-primary w-full"
          >
            Return Home
          </button>
        </div>
      </div>
    )
  }

  if (!tagData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto" />
          <h2 className="text-xl font-semibold">Loading Tag...</h2>
        </div>
      </div>
    )
  }

  if (isCorrect) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card text-center space-y-6 max-w-md">
          <div className="text-6xl">✅</div>
          <h1 className="text-3xl font-bold text-green-400">Correct!</h1>
          
          <div className="bg-green-900/30 border border-green-500/30 p-6 rounded-lg space-y-3">
            <div className="text-lg font-semibold text-green-300">
              Reward Earned: <span className="text-2xl text-white">{tagData.reward}</span>
            </div>
            <p className="text-sm text-neutral-300">
              {tagData.location}
            </p>
          </div>

          <div className="bg-neutral-800 p-6 rounded-lg text-left space-y-3">
            <h3 className="text-lg font-semibold text-blue-400">Next Location:</h3>
            <p className="text-neutral-300 italic">"{tagData.nextLocationRiddle}"</p>
            <p className="text-sm text-neutral-500 mt-2">→ {tagData.nextLocation}</p>
          </div>

          <div className="pt-4 space-y-2">
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card space-y-6 max-w-md">
        <div className="text-center">
          <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-4 ${
            tagData.route === 'BLUE' 
              ? 'bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30' 
              : 'bg-yellow-500/20 text-yellow-400 ring-1 ring-yellow-500/30'
          }`}>
            {tagData.route} Route - Stop {tagData.number}
          </div>
        </div>

        <div className="bg-neutral-800 p-6 rounded-lg space-y-4">
          <div className="flex items-start gap-3">
            <div className="text-3xl">🔐</div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-neutral-400 mb-2">Riddle:</h3>
              <p className="text-neutral-200 leading-relaxed">
                {tagData.passphraseRiddle}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="answer" className="block text-sm font-medium text-neutral-400 mb-2">
              Your Answer:
            </label>
            <input
              id="answer"
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your answer..."
              autoComplete="off"
              autoFocus
            />
          </div>

          {showError && (
            <div className="bg-red-900/30 border border-red-500/30 p-3 rounded-lg">
              <p className="text-red-400 text-sm">
                ❌ Incorrect answer. Try again! (Attempts: {attempts})
              </p>
            </div>
          )}

          <button 
            type="submit"
            className="btn btn-primary w-full"
            disabled={!userAnswer.trim()}
          >
            Submit Answer
          </button>
        </form>

        <div className="pt-4">
          <button 
            onClick={() => navigate('/')}
            className="btn btn-secondary w-full"
          >
            Return Home
          </button>
        </div>
      </div>
    </div>
  )
}
