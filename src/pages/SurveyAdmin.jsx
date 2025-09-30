import { useState, useEffect } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_BASE || 'http://localhost:8080'

const ROLE_NAMES = {
  infiltrator: "🎭 Corporate Infiltrator",
  detective: "🔍 Lead Investigator", 
  narrator: "📢 Case Coordinator",
  analyst: "💻 Digital Forensics Specialist",
  coordinator: "🗺️ Tactical Coordinator"
}

const QUESTIONS = [
  "🔍 A witness statement contradicts the group's theory. You…",
  "🧩 Your favorite type of office investigation puzzle is…",
  "⏰ Under pressure with a deadline to solve the case, you default to…",
  "💼 During a tense interrogation in the conference room, you usually…",
  "🃏 Which investigative tool would you grab first from the evidence room?"
]

export default function SurveyAdmin() {
  const [surveyData, setSurveyData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchSurveyResults()
  }, [])

  const fetchSurveyResults = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get(`${API}/api/survey/results`)
      setSurveyData(data)
    } catch (err) {
      setError('Error loading survey results: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const clearResults = async () => {
    if (!confirm('Are you sure you want to clear all survey results? This cannot be undone.')) {
      return
    }
    
    try {
      await axios.post(`${API}/api/survey/clear`)
      await fetchSurveyResults()
    } catch (err) {
      setError('Error clearing results: ' + err.message)
    }
  }

  const exportResults = () => {
    if (!surveyData) return
    
    const dataStr = JSON.stringify(surveyData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `survey_results_${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="card text-center">
          <div className="animate-pulse">Loading survey results...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="card bg-red-900/20 border-red-800">
          <h1 className="text-xl font-bold mb-2">Error</h1>
          <p className="text-red-300">{error}</p>
          <button onClick={fetchSurveyResults} className="btn mt-4">
            Retry
          </button>
        </div>
      </div>
    )
  }

  const totalResponses = surveyData?.responses?.length || 0
  const roleStats = surveyData?.roleStats || {}
  const questionStats = surveyData?.questionStats || {}

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="interrogation-room">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="text-3xl">👮‍♀️</div>
              <h1 className="text-3xl font-bold text-red-400">HR ANALYTICS DASHBOARD</h1>
            </div>
            <p className="text-neutral-400 font-mono">Employee Psychological Assessment Results</p>
          </div>
          <div className="flex gap-3">
            <button onClick={exportResults} className="btn btn-office" disabled={totalResponses === 0}>
              📊 Export Data
            </button>
            <button onClick={clearResults} className="btn bg-red-900/30 border-red-700 text-red-300 hover:bg-red-800/40" disabled={totalResponses === 0}>
              🗑️ Purge Records
            </button>
            <button onClick={fetchSurveyResults} className="btn-detective">
              🔄 Refresh
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card card-evidence">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">👥</span>
              <h3 className="text-lg font-bold text-blue-300">Total Personnel</h3>
            </div>
            <div className="text-4xl font-bold text-blue-400">{totalResponses}</div>
            <div className="text-sm text-neutral-400">Processed Employees</div>
          </div>
          <div className="card card-danger">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">🎯</span>
              <h3 className="text-lg font-bold text-red-300">Primary Profile</h3>
            </div>
            <div className="text-lg font-semibold text-red-400">
              {Object.entries(roleStats).length > 0 
                ? ROLE_NAMES[Object.entries(roleStats).sort(([,a], [,b]) => b - a)[0][0]]
                : 'No Data'
              }
            </div>
          </div>
          <div className="card bg-gradient-to-br from-yellow-950/50 to-neutral-900 border-yellow-600/30">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">⏱️</span>
              <h3 className="text-lg font-bold text-yellow-300">Avg. Processing Time</h3>
            </div>
            <div className="text-lg font-semibold text-yellow-400">
              {surveyData?.averageTimeMinutes ? `${surveyData.averageTimeMinutes}m` : 'N/A'}
            </div>
          </div>
        </div>

        {/* Employee Profile Distribution */}
        <div className="card card-evidence mb-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">📈</span>
            <h2 className="text-xl font-bold text-blue-300">Employee Profile Distribution</h2>
          </div>
          <div className="space-y-4">
            {Object.entries(roleStats).map(([role, count]) => {
              const percentage = totalResponses > 0 ? (count / totalResponses * 100).toFixed(1) : 0
              return (
                <div key={role} className="suspect-item">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{ROLE_NAMES[role].split(' ')[0]}</span>
                    <span className="font-medium text-neutral-200">{ROLE_NAMES[role]}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32 bg-neutral-700 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-red-600 to-red-400 h-3 transition-all duration-700"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="w-20 text-right">
                      <span className="font-bold text-red-400">{count}</span>
                      <span className="text-neutral-400 text-sm ml-1">({percentage}%)</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Scenario Response Analysis */}
        <div className="card card-danger mb-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">🔍</span>
            <h2 className="text-xl font-bold text-red-300">Scenario Response Analysis</h2>
          </div>
          <div className="space-y-8">
            {QUESTIONS.map((question, questionIndex) => {
              const qStats = questionStats[questionIndex + 1] || {}
              const questionTotal = Object.values(qStats).reduce((sum, count) => sum + count, 0)
              
              return (
                <div key={questionIndex} className="bg-neutral-800/50 p-5 rounded-xl border border-neutral-700">
                  <h3 className="font-bold text-neutral-200 mb-4 flex items-center gap-2">
                    <span className="evidence-marker">Q{questionIndex + 1}</span>
                    {question}
                  </h3>
                  <div className="grid grid-cols-5 gap-3">
                    {['A', 'B', 'C', 'D', 'E'].map(option => {
                      const count = qStats[option] || 0
                      const percentage = questionTotal > 0 ? (count / questionTotal * 100).toFixed(1) : 0
                      return (
                        <div key={option} className="text-center p-3 bg-neutral-800 rounded-lg border border-neutral-600">
                          <div className="font-bold text-xl text-red-400 mb-2">{option}</div>
                          <div className="text-2xl font-bold text-white">{count}</div>
                          <div className="text-xs text-neutral-400">{percentage}%</div>
                          <div className="mt-2 bg-neutral-700 rounded-full h-2 overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-red-600 to-red-400 h-2 transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent Personnel Files */}
        <div className="interrogation-room">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">📁</span>
            <h2 className="text-xl font-bold text-yellow-300">Recent Personnel Files</h2>
          </div>
          {surveyData?.responses?.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {surveyData.responses
                .sort((a, b) => b.timestamp - a.timestamp)
                .slice(0, 20)
                .map((response, index) => (
                <div key={index} className="suspect-item bg-neutral-800 border-neutral-600 hover:border-red-500/50">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {response.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-bold text-white">{response.name}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-red-400 font-medium">→ {ROLE_NAMES[response.result]}</span>
                      </div>
                      <div className="text-xs text-neutral-500 font-mono">
                        Response Pattern: [{response.answers.map(a => a.selectedOption).join(', ')}]
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-neutral-400">
                      {new Date(response.timestamp).toLocaleString()}
                    </div>
                    <div className="text-xs text-green-400 font-mono">
                      ✓ PROCESSED
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📄</div>
              <div className="text-neutral-400 text-lg">No personnel files found</div>
              <div className="text-neutral-500 text-sm mt-2">No employees have completed assessments yet</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}