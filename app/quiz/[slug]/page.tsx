'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { getModule, modules } from '@/lib/curriculum'
import { useProgress } from '@/components/ProgressProvider'

export default function QuizPage() {
  const params = useParams<{ slug: string }>()
  const mod = getModule(params.slug)
  const { saveQuizScore, progress } = useProgress()

  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answers, setAnswers] = useState<number[]>([])
  const [finished, setFinished] = useState(false)

  const quiz = mod?.quiz

  if (!mod || !mod.available || !quiz) {
    return (
      <div className="auth-card">
        <h1>Quiz indisponible</h1>
        <Link className="button primary" href="/">
          Retour au parcours
        </Link>
      </div>
    )
  }

  const currentModule = mod
  const question = quiz[index]

  const score = finished
    ? Math.round(
        (quiz.reduce(
          (acc, q, i) => acc + (answers[i] === q.correctIndex ? 1 : 0),
          0
        ) /
          quiz.length) *
          100
      )
    : 0

  async function next() {
    if (selected === null) return

    const nextAnswers = [...answers, selected]
    setAnswers(nextAnswers)

    if (index === quiz.length - 1) {
      const right = quiz.reduce(
        (acc, q, i) => acc + (nextAnswers[i] === q.correctIndex ? 1 : 0),
        0
      )
      const finalScore = Math.round((right / quiz.length) * 100)
      await saveQuizScore(currentModule.slug, finalScore)
      setFinished(true)
    } else {
      setIndex(index + 1)
      setSelected(null)
    }
  }

  function restart() {
    setIndex(0)
    setSelected(null)
    setAnswers([])
    setFinished(false)
  }

  const nextModule = modules.find(
    (m) => m.available && m.order > currentModule.order
  )

  if (finished) {
    const passed = score >= 70

    return (
      <div className="quiz-wrap result-wrap">
        <span className="eyebrow">RÉSULTAT · MODULE {currentModule.order}</span>

        <div className={`result-circle ${passed ? 'pass' : 'fail'}`}>
          <strong>{score}%</strong>
          <span>{passed ? 'Validé' : 'À retravailler'}</span>
        </div>

        <h1>
          {passed ? 'Module validé.' : 'Presque. Revois les points clés.'}
        </h1>

        <p className="lead">
          Ton meilleur score :{' '}
          <b>
            {Math.max(