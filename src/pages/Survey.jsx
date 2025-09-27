import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'

// Configure axios defaults
axios.defaults.headers.common['Content-Type'] = 'application/json'

// —————————————————————————————————————————————
// Config
// —————————————————————————————————————————————
const API = import.meta.env.VITE_API_BASE || 'http://localhost:3001'
const BRAND = {
  primary: 'blue', // Tailwind color key for the primary brand tone
}

const QUESTIONS = [
  {
    id: 1,
    question: "🔍 A witness statement contradicts the group's theory. You…",
    options: [
      { id: 'A', text: '🎭 Create a distraction; quietly test your own hunch in the shadows.', role: 'infiltrator' },
      { id: 'B', text: '📋 Stop everyone; systematically verify facts before proceeding.', role: 'detective' },
      { id: 'C', text: '📢 Diplomatically guide the narrative and maintain team morale.', role: 'narrator' },
      { id: 'D', text: '💻 Cross-reference security logs, timesheets, and digital patterns.', role: 'analyst' },
      { id: 'E', text: '🗺️ Reorganize the team: "You two check the elevator; I\'ll scout the stairwell."', role: 'coordinator' }
    ]
  },
  {
    id: 2,
    question: '🧩 Your favorite type of office investigation puzzle is…',
    options: [
      { id: 'A', text: '🕴️ Social engineering: manipulating conversations and reading body language.', role: 'infiltrator' },
      { id: 'B', text: '🔬 Logical deduction: following paper trails and concrete evidence.', role: 'detective' },
      { id: 'C', text: '💬 Interpersonal dynamics: understanding office politics and relationships.', role: 'narrator' },
      { id: 'D', text: '🖥️ Technical analysis: keycard logs, email metadata, and security systems.', role: 'analyst' },
      { id: 'E', text: '🏢 Spatial reasoning: floor plans, camera angles, and movement patterns.', role: 'coordinator' }
    ]
  },
  {
    id: 3,
    question: '⏰ Under pressure with a deadline to solve the case, you default to…',
    options: [
      { id: 'A', text: '🎯 Divide and conquer: force suspects into making mistakes.', role: 'infiltrator' },
      { id: 'B', text: '🐌 Slow and steady: confirm one solid lead before moving forward.', role: 'detective' },
      { id: 'C', text: '👥 Rally the investigation team with a clear, public action plan.', role: 'narrator' },
      { id: 'D', text: '⚡ Rapid prototyping: quickly test theories against available data.', role: 'analyst' },
      { id: 'E', text: '🏃 Sprint to high-probability locations and optimize search routes.', role: 'coordinator' }
    ]
  },
  {
    id: 4,
    question: '💼 During a tense interrogation in the conference room, you usually…',
    options: [
      { id: 'A', text: '🌱 Plant subtle doubts and carefully observe micro-expressions.', role: 'infiltrator' },
      { id: 'B', text: '❓ Ask direct, verifiable yes/no questions that can be fact-checked.', role: 'detective' },
      { id: 'C', text: '🎬 Frame the conversation so everyone stays aligned and cooperative.', role: 'narrator' },
      { id: 'D', text: '🔧 Focus on "how does this system work?" and quantify everything.', role: 'analyst' },
      { id: 'E', text: '📍 Discuss logistics: who was where, when, and how they moved around.', role: 'coordinator' }
    ]
  },
  {
    id: 5,
    question: '🃏 Which investigative tool would you grab first from the evidence room?',
    options: [
      { id: 'A', text: '🚨 "False Alarm Protocol" (create diversions and control situations).', role: 'infiltrator' },
      { id: 'B', text: '🏷️ "Truth Verification Badge" (force honest answers from suspects).', role: 'detective' },
      { id: 'C', text: '📡 "Team Communication Hub" (broadcast updates and manage narratives).', role: 'narrator' },
      { id: 'D', text: '🔍 "Digital Forensics Kit" (analyze electronic evidence and data).', role: 'analyst' },
      { id: 'E', text: '🛡️ "Security Access Card" (protect crime scenes and navigate restricted areas).', role: 'coordinator' }
    ]
  }
]

const ROLE_DESCRIPTIONS = {
  infiltrator: { name: 'The Corporate Infiltrator' },
  detective: { name: 'The Lead Investigator' },
  narrator: { name: 'The Case Coordinator' },
  analyst: { name: 'The Digital Forensics Specialist' },
  coordinator: { name: 'The Tactical Coordinator' }
}

// —————————————————————————————————————————————
// Small UI bits
// —————————————————————————————————————————————
function PrimaryButton({ children, className = '', ...props }) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      whileHover={{ y: -1 }}
      {...props}
      className={`inline-flex items-center gap-2 rounded-lg bg-${BRAND.primary}-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-${BRAND.primary}-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-${BRAND.primary}-500 ${className}`}
    >
      {children}
    </motion.button>
  )
}

function SecondaryButton({ children, className = '', ...props }) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      {...props}
      className={`inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-${BRAND.primary}-500 ${className}`}
    >
      {children}
    </motion.button>
  )
}

function Progress({ value }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        className={`h-full bg-${BRAND.primary}-600`}
      />
    </div>
  )
}

function useKeyShortcuts({ onPrev, onNext, onSelect, enabled }) {
  useEffect(() => {
    if (!enabled) return
    const handler = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return
      if (e.key === 'ArrowLeft') onPrev?.()
      if (e.key === 'ArrowRight') onNext?.()
      const num = parseInt(e.key, 10)
      if (!Number.isNaN(num) && num >= 1 && num <= 5) onSelect?.(num)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onPrev, onNext, onSelect, enabled])
}

// —————————————————————————————————————————————
// Main Component (Corporate Theme)
// —————————————————————————————————————————————
export default function Survey() {
  const [name, setName] = useState('')
  const [answers, setAnswers] = useState({})
  const [currentQuestion, setCurrentQuestion] = useState(-1)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [apiStatus, setApiStatus] = useState('checking')

  // Debug log for development
  console.log('Survey API endpoint:', API)

  const assessmentId = useMemo(
    () => `SRV-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
    []
  )

  // Check API connectivity on component mount
  useEffect(() => {
    const checkApi = async () => {
      try {
        const response = await axios.get(`${API}/health`)
        if (response.data.ok) {
          setApiStatus('connected')
        } else {
          setApiStatus('error')
        }
      } catch (err) {
        console.error('API health check failed:', err)
        setApiStatus('error')
      }
    }
    checkApi()
  }, []) // Empty dependency array to run only once

  const totalQuestions = QUESTIONS.length + 1
  const currentStep = currentQuestion + 2

  const handleAnswer = (qid, optionId, role) => {
    setAnswers((prev) => ({ ...prev, [qid]: { optionId, role } }))
  }
  const nextQuestion = () => {
    if (currentQuestion < QUESTIONS.length - 1) setCurrentQuestion(currentQuestion + 1)
  }
  const prevQuestion = () => {
    if (currentQuestion > -1) setCurrentQuestion(currentQuestion - 1)
  }

  const calculateResult = () => {
    const roleCounts = {}
    Object.values(answers).forEach((a) => {
      roleCounts[a.role] = (roleCounts[a.role] || 0) + 1
    })
    const top = Object.entries(roleCounts).sort(([, a], [, b]) => b - a)[0]?.[0]
    return {
      primaryRole: top || null,
      allCounts: roleCounts,
      answers: Object.entries(answers).map(([qId, a]) => ({
        questionId: Number(qId),
        selectedOption: a.optionId,
        role: a.role,
      })),
    }
  }

  const submitSurvey = async () => {
    if (apiStatus !== 'connected') {
      setError('Unable to connect to server. Please check your connection and try again.')
      return
    }
    
    setIsSubmitting(true)
    setError('')
    const surveyResult = calculateResult()
    
    console.log('Submitting survey data:', {
      name: name.trim(),
      result: surveyResult.primaryRole,
      roleCounts: surveyResult.allCounts,
      assessmentId,
      answers: surveyResult.answers
    })
    
    try {
      const response = await axios.post(`${API}/api/survey/submit`, {
        name: name.trim(),
        answers: surveyResult.answers,
        result: surveyResult.primaryRole,
        roleCounts: surveyResult.allCounts,
        assessmentId,
        timestamp: Date.now(),
      })
      
      console.log('Survey submitted successfully:', response.data)
      setIsSubmitted(true)
    } catch (err) {
      console.error('Survey submission error:', err)
      const errorMessage = err.response?.data?.error || err.message || 'We were unable to submit your responses. Please try again.'
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isComplete = name.trim() && Object.keys(answers).length === QUESTIONS.length

  // Keyboard shortcuts
  useKeyShortcuts({
    enabled: currentQuestion >= 0 && currentQuestion < QUESTIONS.length,
    onPrev: prevQuestion,
    onNext: () => {
      const q = QUESTIONS[currentQuestion]
      if (answers[q.id]) nextQuestion()
    },
    onSelect: (n) => {
      const q = QUESTIONS[currentQuestion]
      const opt = q?.options[n - 1]
      if (opt) handleAnswer(q.id, opt.id, opt.role)
    },
  })

  // ————————————————————————————————————————————
  // Submitted screen
  // ————————————————————————————————————————————
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto max-w-3xl p-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className={`grid h-10 w-10 place-items-center rounded-full bg-${BRAND.primary}-600 text-white`}>
                <svg className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">Thank you. Your responses have been recorded.</h1>
                <p className="text-sm text-slate-600">Reference ID: <span className="font-mono">{assessmentId}</span></p>
              </div>
            </div>

            <p className="text-sm text-slate-600">
              A confirmation has been logged. If you have questions, please contact HR Operations.
            </p>
          </motion.div>
        </div>
      </div>
    )
  }

  // ————————————————————————————————————————————
  // Main survey
  // ————————————————————————————————————————————
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Top bar */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-3">
            <div className={`grid h-9 w-9 place-items-center rounded-md bg-${BRAND.primary}-600 text-white`}>
              <span className="text-sm font-bold">BC</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Blackwood Corporation</p>
              <p className="text-xs text-slate-500">Employee Survey</p>
            </div>
            {/* API Status Indicator (Development only) */}
            {import.meta.env.DEV && (
              <div className={`ml-2 h-2 w-2 rounded-full ${
                apiStatus === 'connected' ? 'bg-green-500' : 
                apiStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
              }`} title={`API Status: ${apiStatus}`} />
            )}
          </div>
          <div className="hidden items-center gap-3 sm:flex">
            <div className="w-48"><Progress value={(currentStep / totalQuestions) * 100} /></div>
            <p className="text-xs text-slate-600">Step {currentStep} of {totalQuestions}</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl p-6">
        {/* Card */}
        <motion.section
          key={currentQuestion}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
        >
          {/* Intro / Name */}
          {currentQuestion === -1 ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Employee Information</h2>
                <p className="mt-1 text-sm text-slate-600">Please confirm your details to begin.</p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Full name <span className={`text-${BRAND.primary}-600`}>*</span></label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="First Middle Last"
                  className={`w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-${BRAND.primary}-500 focus:outline-none focus:ring-2 focus:ring-${BRAND.primary}-200`}
                  autoFocus
                />
                <p className="mt-2 text-xs text-slate-500">Your name is used for attribution only and will not be shared externally.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <p className={`text-xs font-medium uppercase tracking-wide text-${BRAND.primary}-700`}>Question {currentQuestion + 1} of {QUESTIONS.length}</p>
                <h2 className="mt-1 text-lg font-semibold text-slate-900">{QUESTIONS[currentQuestion].question}</h2>
                <p className="mt-1 text-xs text-slate-500">Use keys <kbd className="rounded border border-slate-300 bg-slate-50 px-1">1–5</kbd> to select • <kbd className="rounded border border-slate-300 bg-slate-50 px-1">←</kbd>/<kbd className="rounded border border-slate-300 bg-slate-50 px-1">→</kbd> to navigate</p>
              </div>

              <div className="grid gap-3">
                {QUESTIONS[currentQuestion].options.map((option, idx) => {
                  const q = QUESTIONS[currentQuestion]
                  const selected = answers[q.id]?.optionId === option.id
                  const inputId = `q${q.id}-${option.id}`
                  return (
                    <label key={option.id} htmlFor={inputId} className="group">
                      <input
                        id={inputId}
                        type="radio"
                        name={`question-${q.id}`}
                        value={option.id}
                        checked={selected}
                        onChange={() => handleAnswer(q.id, option.id, option.role)}
                        className="sr-only"
                      />
                      <motion.div
                        whileHover={{ y: -1 }}
                        className={`rounded-lg border p-4 transition-colors ${
                          selected
                            ? `border-${BRAND.primary}-500 bg-${BRAND.primary}-50`
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-md border ${selected ? `border-${BRAND.primary}-600 bg-${BRAND.primary}-600 text-white` : 'border-slate-300 bg-slate-50 text-slate-700'}`}>
                            <span className="text-sm font-semibold">{option.id}</span>
                          </div>
                          <div>
                            <p className="text-sm text-slate-900">{option.text}</p>
                          </div>
                        </div>
                      </motion.div>
                    </label>
                  )
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-6">
            <SecondaryButton onClick={prevQuestion} disabled={currentQuestion === -1}>
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
              Previous
            </SecondaryButton>

            <div className="hidden items-center gap-3 sm:flex">
              <div className="w-48"><Progress value={(currentStep / totalQuestions) * 100} /></div>
              <p className="text-xs text-slate-600">{Math.round((currentStep / totalQuestions) * 100)}% complete</p>
            </div>

            {currentQuestion === QUESTIONS.length - 1 ? (
              <PrimaryButton 
                onClick={submitSurvey} 
                disabled={!isComplete || isSubmitting}
                className="px-8 py-4 text-lg font-bold bg-green-600 hover:bg-green-700 shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                    Submitting…
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                    Submit Assessment
                  </>
                )}
              </PrimaryButton>
            ) : (
              <PrimaryButton
                onClick={() => {
                  if (currentQuestion === -1) return setCurrentQuestion(0)
                  const q = QUESTIONS[currentQuestion]
                  if (answers[q.id]) nextQuestion()
                }}
                disabled={currentQuestion !== -1 && !answers[QUESTIONS[currentQuestion].id]}
                className="px-8 py-4 text-lg font-bold bg-blue-600 hover:bg-blue-700 shadow-lg"
              >
                {currentQuestion === -1 ? 'Start Assessment' : 'Continue'}
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
              </PrimaryButton>
            )}
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className={`mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700`}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>
      </main>

      <footer className="mx-auto max-w-4xl px-6 pb-8">
        <p className="text-xs text-slate-500">© {new Date().getFullYear()} Blackwood Corporation • Internal survey • Do not distribute externally.</p>
      </footer>
    </div>
  )
}
