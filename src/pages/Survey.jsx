import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'

const API = import.meta.env.VITE_API_BASE

const QUESTIONS = [
  {
    id: 1,
    question: "🔍 A witness statement contradicts the group's theory. You…",
    options: [
      { id: 'A', text: "🎭 Create a distraction; quietly test your own hunch in the shadows.", role: 'infiltrator' },
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
  infiltrator: {
    name: '🎭 The Corporate Infiltrator',
    description:
      'You excel at reading office politics, social manipulation, and uncovering secrets through misdirection. You blend into corporate culture while gathering intelligence.'
  },
  detective: {
    name: '🔍 The Lead Investigator',
    description:
      "You methodically analyze evidence, verify facts, and solve cases through systematic logical deduction. You're the backbone of any investigation."
  },
  narrator: {
    name: '📢 The Case Coordinator',
    description:
      'You guide investigation teams, manage communication between departments, and help others stay focused on solving the case.'
  },
  analyst: {
    name: '💻 The Digital Forensics Specialist',
    description:
      'You love technical challenges, data analysis, and systematic approaches to solving complex corporate crimes through technology.'
  },
  coordinator: {
    name: '🗺️ The Tactical Coordinator',
    description:
      'You excel at logistics, spatial reasoning, and efficiently organizing people and resources throughout the office complex.'
  }
}

// —————————————————————————————————————————————
// Utility small components
// —————————————————————————————————————————————
function ShineButton({ className = '', children, ...props }) {
  return (
    <button
      {...props}
      className={`relative overflow-hidden rounded-xl px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 ${className}`}
    >
      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-white/0 via-white/25 to-white/0 opacity-60 transition-transform duration-700 group-hover:translate-x-0" />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  )
}

function Meter({ value }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-800">
      <div
        className="h-full w-0 rounded-full bg-gradient-to-r from-red-600 via-rose-500 to-pink-400 shadow-[0_0_20px_rgba(244,63,94,0.35)] transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}

function RoleLeaderboard({ counts }) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1
  const entries = Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
  return (
    <div className="space-y-3">
      {entries.map(([role, count]) => {
        const pct = (count / total) * 100
        return (
          <div key={role} className="rounded-xl border border-neutral-700/70 bg-neutral-800/60 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-neutral-200">{ROLE_DESCRIPTIONS[role]?.name || role}</span>
              <span className="text-xs font-mono text-neutral-400">{Math.round(pct)}%</span>
            </div>
            <Meter value={pct} />
          </div>
        )
      })}
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
      // 1-5 select options
      const num = parseInt(e.key, 10)
      if (!Number.isNaN(num) && num >= 1 && num <= 5) onSelect?.(num)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onPrev, onNext, onSelect, enabled])
}

// —————————————————————————————————————————————
// Main Component
// —————————————————————————————————————————————
export default function Survey() {
  const [name, setName] = useState('')
  const [answers, setAnswers] = useState({})
  const [currentQuestion, setCurrentQuestion] = useState(-1) // Start at -1 for name question
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Sticky pseudo-random assessment ID (stable per mount)
  const assessmentId = useMemo(
    () => `PSY-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
    []
  )

  const totalQuestions = QUESTIONS.length + 1 // +1 for name
  const currentStep = currentQuestion + 2 // -1 maps to Step 1

  const handleAnswer = (questionId, optionId, role) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { optionId, role }
    }))
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
        role: a.role
      }))
    }
  }

  const submitSurvey = async () => {
    setIsSubmitting(true)
    setError('')
    const surveyResult = calculateResult()
    try {
      await axios.post(`${API}/api/survey/submit`, {
        name: name.trim(),
        answers: surveyResult.answers,
        result: surveyResult.primaryRole,
        roleCounts: surveyResult.allCounts,
        assessmentId,
        timestamp: Date.now()
      })
      setIsSubmitted(true)
    } catch (err) {
      console.error('Error submitting survey:', err)
      setError('Submission failed. Please try again in a moment.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isComplete = name.trim() && Object.keys(answers).length === QUESTIONS.length

  // Keyboard shortcuts active only on question steps
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
    }
  })

  // Live counts for sidebar meter
  const sideCounts = useMemo(() => {
    const counts = { infiltrator: 0, detective: 0, narrator: 0, analyst: 0, coordinator: 0 }
    Object.values(answers).forEach((a) => (counts[a.role] += 1))
    return counts
  }, [answers])

  if (isSubmitted) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-neutral-950">
        {/* Ambient background */}
        <div className="pointer-events-none absolute inset-0 opacity-40 [background:radial-gradient(ellipse_at_top,rgba(244,63,94,0.15),rgba(0,0,0,0)_45%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:24px_24px] opacity-10" />

        <div className="relative mx-auto grid min-h-screen max-w-5xl place-items-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-neutral-900 via-neutral-900/70 to-neutral-800 p-10 shadow-[0_0_60px_-15px_rgba(16,185,129,0.35)]"
          >
            <div className="mb-8 flex items-center justify-center gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-emerald-600 text-white shadow-lg"><svg className="h-9 w-9" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg></div>
              <div className="text-center">
                <h1 className="text-3xl font-extrabold tracking-tight text-emerald-300">ASSESSMENT COMPLETE</h1>
                <p className="mt-1 text-sm font-mono text-neutral-400">Assessment ID: {assessmentId}</p>
              </div>
            </div>

            <div className="mx-auto max-w-2xl space-y-6 text-center">
              <div className="rounded-2xl border border-neutral-700/70 bg-neutral-900/70 p-6">
                <p className="mb-1 text-xl text-neutral-200">
                  Thank you, <span className="font-bold text-blue-400">{name}</span>
                </p>
                <p className="text-neutral-400">Your psychological profile has been processed and integrated into our investigation database.</p>
              </div>

              <div className="rounded-2xl border border-yellow-600/50 bg-yellow-900/20 p-5 text-left">
                <div className="mb-2 flex items-center gap-2 text-yellow-300"><span>⚠️</span><span className="font-bold">CONFIDENTIALITY NOTICE</span></div>
                <p className="text-xs leading-relaxed text-yellow-200">This assessment is part of an ongoing investigation. Your responses are confidential and will only be used for authorized security purposes. Please do not discuss the content of this assessment with other personnel.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-neutral-950">
      {/* Ambient field + grid */}
      <div className="pointer-events-none absolute inset-0 opacity-50 [background:radial-gradient(ellipse_at_top,rgba(244,63,94,0.14),rgba(0,0,0,0)_45%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:24px_24px] opacity-10" />

      <div className="relative mx-auto max-w-6xl p-6">
        {/* Header / Brand */}
        <div className="mb-6 rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6 backdrop-blur">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-rose-600 text-white shadow-lg"><span className="text-xl font-black">B</span></div>
              <div>
                <h1 className="text-xl font-bold tracking-wide text-white">BLACKWOOD CORPORATE</h1>
                <p className="text-xs text-neutral-400">Human Resources Division</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-mono text-neutral-400">Assessment ID: {assessmentId}</p>
              <p className="text-xs text-neutral-400">Progress: Step {currentStep} of {totalQuestions}</p>
              <div className="mt-2 h-2 w-60 overflow-hidden rounded-full bg-neutral-800 sm:w-80">
                <div
                  className="h-full w-0 bg-gradient-to-r from-rose-600 via-fuchsia-500 to-pink-400 transition-all duration-500"
                  style={{ width: `${(currentStep / totalQuestions) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-rose-700/40 bg-rose-950/30 p-4">
            <h2 className="text-base font-bold text-rose-200">MANDATORY PSYCHOLOGICAL ASSESSMENT</h2>
            <p className="text-sm text-rose-100/80">Due to recent security incidents, all personnel must complete this assessment as per company policy § 7.3.2</p>
          </div>
        </div>

        {/* Main grid: content + live role meter */}
        <div className="grid gap-6 md:grid-cols-[1fr_320px]">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6 backdrop-blur"
          >
            {currentQuestion === -1 ? (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-blue-600 text-white"><svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/></svg></div>
                  <h2 className="text-2xl font-bold text-blue-300">EMPLOYEE IDENTIFICATION</h2>
                  <p className="text-blue-200/80">Please provide your information for our records</p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-neutral-300">
                    Full Legal Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="First Middle Last"
                    className="w-full rounded-xl border border-neutral-700/70 bg-neutral-800/80 p-4 font-mono text-lg text-white outline-none ring-rose-500/0 placeholder:text-neutral-500 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/40"
                    autoFocus
                  />
                  <p className="mt-2 flex items-center gap-1 text-xs text-neutral-500"><span className="text-yellow-400">⚠️</span>This information will be cross-referenced with employee database</p>
                </div>

                <div className="rounded-xl border border-yellow-600/30 bg-yellow-900/10 p-3 text-xs text-yellow-300">
                  <span className="font-bold">PRIVACY NOTICE:</span> Information collected is used solely for security assessment purposes and will be handled according to company data protection policies.
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-3xl">{['🔍', '🧩', '⏰', '💼', '🃏'][currentQuestion]}</div>
                  <h2 className="mt-1 text-xl font-semibold tracking-wide text-blue-300">SCENARIO {currentQuestion + 1}</h2>
                  <p className="mt-3 text-lg leading-relaxed text-neutral-200">{QUESTIONS[currentQuestion].question}</p>
                </div>

                <div className="mx-auto grid max-w-3xl gap-4">
                  {QUESTIONS[currentQuestion].options.map((option, idx) => {
                    const q = QUESTIONS[currentQuestion]
                    const selected = answers[q.id]?.optionId === option.id
                    const inputId = `q${q.id}-${option.id}`
                    return (
                      <label key={option.id} htmlFor={inputId} className="group relative block cursor-pointer">
                        <input
                          id={inputId}
                          type="radio"
                          name={`question-${q.id}`}
                          value={option.id}
                          checked={selected}
                          onChange={() => handleAnswer(q.id, option.id, option.role)}
                          className="peer sr-only"
                        />
                        <motion.div
                          whileHover={{ y: -1, scale: 1.01 }}
                          className={`rounded-2xl border-2 p-5 transition-all duration-200 ${
                            selected
                              ? 'border-rose-500/80 bg-rose-950/30 shadow-[0_0_30px_-10px_rgba(244,63,94,0.6)]'
                              : 'border-neutral-700/70 bg-neutral-800/60 hover:border-neutral-500/80 hover:bg-neutral-700/50'
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`grid h-10 w-10 place-items-center rounded-lg font-bold ${
                              selected ? 'bg-rose-600 text-white' : 'bg-neutral-700 text-neutral-200'
                            }`}>{option.id}</div>
                            <div>
                              <div className="text-neutral-200">{option.text}</div>
                            </div>
                          </div>
                        </motion.div>
                      </label>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="mt-8 flex items-center justify-between border-t border-neutral-800 pt-6">
              <ShineButton
                onClick={prevQuestion}
                disabled={currentQuestion === -1}
                className="group disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-neutral-700 to-neutral-600 hover:from-neutral-600 hover:to-neutral-500"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                Previous
              </ShineButton>

              <div className="text-center">
                <div className="text-sm text-neutral-400">{currentQuestion === -1 ? 'Employee Information' : `Scenario ${currentQuestion + 1}`}</div>
                <div className="font-mono text-xs text-neutral-500">{Math.round((currentStep / totalQuestions) * 100)}% Complete</div>
              </div>

              {currentQuestion === QUESTIONS.length - 1 ? (
                <ShineButton
                  onClick={submitSurvey}
                  disabled={!isComplete || isSubmitting}
                  className="group disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                      Processing…
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                      Submit Assessment
                    </>
                  )}
                </ShineButton>
              ) : (
                <ShineButton
                  onClick={() => {
                    if (currentQuestion === -1) return setCurrentQuestion(0)
                    const q = QUESTIONS[currentQuestion]
                    if (answers[q.id]) nextQuestion()
                  }}
                  disabled={currentQuestion !== -1 && !answers[QUESTIONS[currentQuestion].id]}
                  className="group disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500"
                >
                  Continue
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
                </ShineButton>
              )}
            </div>

            {/* Error toast */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mt-4 rounded-xl border border-red-500/40 bg-red-950/40 p-3 text-sm text-red-200"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Sidebar: Assessment Info */}
          <div className="sticky top-6 h-fit rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6 backdrop-blur">
            <h3 className="mb-1 text-sm font-bold tracking-wide text-neutral-200">Assessment Status</h3>
            <p className="mb-5 text-xs text-neutral-400">Complete all scenarios to finish your psychological profile.</p>
            
            <div className="space-y-3">
              <div className="rounded-xl border border-neutral-700/70 bg-neutral-800/60 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-neutral-200">Questions Complete</span>
                  <span className="text-xs font-mono text-neutral-400">{Object.keys(answers).length}/{QUESTIONS.length}</span>
                </div>
              </div>
              
              <div className="rounded-xl border border-neutral-700/70 bg-neutral-800/60 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-neutral-200">Assessment ID</span>
                  <span className="text-xs font-mono text-neutral-400">{assessmentId}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
