
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
              progress[currentModule.slug]?.bestScore ?? 0,
              score
            )}
            %
          </b>
          . La validation demande 70% et la lecture du cours.
        </p>

        <div className="review-list">
          {quiz.map((q, i) => {
            const ok = answers[i] === q.correctIndex

            return (
              <div className={`review ${ok ? 'ok' : 'bad'}`} key={q.id}>
                <div className="review-icon">{ok ? '✓' : '×'}</div>
                <div>
                  <strong>{q.question}</strong>
                  <p>{q.explanation}</p>
                  <small>Bonne réponse : {q.options[q.correctIndex]}</small>
                </div>
              </div>
            )
          })}
        </div>

        <div className="lesson-actions center">
          <button className="button ghost" onClick={restart}>
            Refaire le quiz
          </button>

          <Link
            className="button"
            href={`/modules/${currentModule.slug}`}
          >
            Revoir le cours
          </Link>

          {passed && nextModule && (
            <Link
              className="button primary"
              href={`/modules/${nextModule.slug}`}
            >
              Module suivant →
            </Link>
          )}

          {passed && !nextModule && (
            <Link className="button primary" href="/">
              Retour au parcours
            </Link>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="quiz-wrap">
      <div className="quiz-top">
        <Link href={`/modules/${currentModule.slug}`}>← Cours</Link>
        <span>
          {index + 1} / {quiz.length}
        </span>
      </div>

      <div className="quiz-progress">
        <span style={{ width: `${((index + 1) / quiz.length) * 100}%` }} />
      </div>

      <span className="eyebrow">QUIZ · {currentModule.title}</span>
      <h1>{question.question}</h1>

      <div className="options">
        {question.options.map((option, i) => (
          <button
            onClick={() => setSelected(i)}
            className={selected === i ? 'selected' : ''}
            key={option}
          >
            <span>{String.fromCharCode(65 + i)}</span>
            {option}
          </button>
        ))}
      </div>

      <button
        className="button primary quiz-next"
        disabled={selected === null}
        onClick={next}
      >
        {index === quiz.length - 1
          ? 'Voir mon résultat'
          : 'Question suivante →'}
      </button>
    </div>
  )