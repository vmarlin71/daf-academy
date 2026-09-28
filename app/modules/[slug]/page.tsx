'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { getModule, modules } from '@/lib/curriculum'
import { useProgress } from '@/components/ProgressProvider'

export default function LessonPage(){
  const params = useParams<{slug:string}>()
  const mod = getModule(params.slug)
  const {progress,markLessonRead} = useProgress()
  if(!mod || !mod.available || !mod.sections) return notFound()
  const p = progress[mod.slug]
  const previous = modules.filter(m=>m.available && m.order<mod.order).at(-1)
  const next = modules.find(m=>m.available && m.order>mod.order)

  return <article className="lesson-layout">
    <aside className="lesson-side">
      <Link href="/" className="back">← Parcours</Link>
      <div className="side-level">NIVEAU {mod.level}</div>
      <h3>{mod.title}</h3>
      <div className="side-meta"><span>{mod.duration} min</span><span>{mod.difficulty}</span></div>
      <div className="lesson-status">
        <div className={p?.lessonRead?'checked':''}><span>{p?.lessonRead?'✓':'1'}</span>Cours</div>
        <div className={p?.completed?'checked':''}><span>{p?.completed?'✓':'2'}</span>Quiz ≥ 70%</div>
      </div>
    </aside>

    <div className="lesson-content">
      <header className="lesson-header">
        <span className="eyebrow">MODULE {mod.order}</span>
        <h1>{mod.title}</h1>
        <p>{mod.description}</p>
      </header>

      {mod.objectives && <section className="objectives">
        <h3>À la fin de ce module, tu sauras…</h3>
        <div>{mod.objectives.map((o,i)=><p key={o}><span>{i+1}</span>{o}</p>)}</div>
      </section>}

      {mod.sections.map((s,i)=><section className="lesson-section" key={s.title}>
        <div className="section-index">{String(i+1).padStart(2,'0')}</div>
        <div><h2>{s.title}</h2><p>{s.body}</p>
          {s.bullets && <ul>{s.bullets.map(b=><li key={b}>{b}</li>)}</ul>}
          {s.formula && <div className="formula"><span>FORMULE</span>{s.formula}</div>}
          {s.example && <div className="example"><span>EXEMPLE</span><p>{s.example}</p></div>}
        </div>
      </section>)}

      <section className="cfo-reflex">
        <span>RÉFLEXE DAF</span>
        <h3>Ne mémorise pas seulement la définition.</h3>
        <p>Demande-toi toujours : <b>qu’est-ce qui fait bouger cet indicateur, quel impact sur le cash, et quelle décision peut-on prendre ?</b></p>
      </section>

      <div className="lesson-actions">
        {previous ? <Link className="ghost button" href={`/modules/${previous.slug}`}>← {previous.title}</Link> : <span/>}
        <Link className="button primary" onClick={()=>markLessonRead(mod.slug)} href={`/quiz/${mod.slug}`}>J’ai compris · Passer au quiz →</Link>
      </div>
      {next && p?.completed && <p className="next-hint">Prochain module après validation : <b>{next.title}</b></p>}
    </div>
  </article>
}
