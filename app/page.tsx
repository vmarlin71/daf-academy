'use client'

import Link from 'next/link'
import { levels, modules } from '@/lib/curriculum'
import { useProgress } from '@/components/ProgressProvider'

export default function Home(){
  const {progress,activity,user,cloudEnabled} = useProgress()
  const available = modules.filter(m=>m.available)
  const completed = available.filter(m=>progress[m.slug]?.completed).length
  const overall = available.length ? Math.round(completed/available.length*100) : 0
  const next = available.find(m=>!progress[m.slug]?.completed) ?? available[available.length-1]

  return <>
    <section className="hero">
      <div>
        <span className="eyebrow">PARCOURS DAF · 50 MODULES</span>
        <h1>De débutant à DAF,<br/>une compétence à la fois.</h1>
        <p className="lead">Cours courts, exemples concrets, quiz et progression. Les 16 premiers modules sont déjà entièrement jouables ; le parcours complet est structuré jusqu’au niveau CFO.</p>
        <div className="hero-actions">
          <Link className="button primary" href={`/modules/${next.slug}`}>Continuer · {next.title}</Link>
          <span className="sync-status">{user ? '☁ Progression synchronisée' : cloudEnabled ? '○ Compte disponible' : '○ Progression sur cet appareil'}</span>
        </div>
      </div>
      <div className="scorecard">
        <div className="scoretop"><span>Progression actuelle</span><strong>{overall}%</strong></div>
        <div className="progressbar"><span style={{width:`${overall}%`}} /></div>
        <div className="statsgrid">
          <div><strong>{completed}</strong><span>modules validés</span></div>
          <div><strong>{activity.xp}</strong><span>XP gagnés</span></div>
          <div><strong>{activity.streak}</strong><span>jours de série</span></div>
        </div>
      </div>
    </section>

    <section className="principles">
      <div><b>01</b><span><strong>Comprendre</strong>Un cours accessible, sans jargon inutile.</span></div>
      <div><b>02</b><span><strong>Appliquer</strong>Exemples, formules et réflexes finance.</span></div>
      <div><b>03</b><span><strong>Valider</strong>70% au quiz + cours lu pour valider.</span></div>
    </section>

    <div className="section-title"><div><span className="eyebrow">CURRICULUM</span><h2>Ton parcours de montée en compétence</h2></div><p>16 modules disponibles · 34 déjà planifiés</p></div>

    {levels.map(level=>{
      const list = modules.filter(m=>m.level===level.id)
      const done = list.filter(m=>progress[m.slug]?.completed).length
      const readyCount = list.filter(m=>m.available).length
      return <section className="level" key={level.id}>
        <div className="levelhead">
          <div className="levelnum">{String(level.id).padStart(2,'0')}</div>
          <div><h3>{level.title}</h3><p>{level.subtitle}</p></div>
          <div className="levelmeta">{done}/{readyCount} validés</div>
        </div>
        <div className="modulegrid">
          {list.map(m=>{
            const p=progress[m.slug]
            return m.available ? <Link href={`/modules/${m.slug}`} className={`modulecard ${p?.completed?'done':''}`} key={m.slug}>
              <div className="module-top"><span className="module-order">{m.order}</span><span className="pill">{m.duration} min</span></div>
              <h4>{m.title}</h4><p>{m.description}</p>
              <div className="module-foot"><span>{p?.completed?'✓ Validé':p?.bestScore?`Quiz ${p.bestScore}%`:p?.lessonRead?'Cours lu':'À découvrir'}</span><span>→</span></div>
            </Link> : <div className="modulecard locked" key={m.slug}>
              <div className="module-top"><span className="module-order">{m.order}</span><span className="pill">Roadmap</span></div>
              <h4>{m.title}</h4><p>{m.description}</p><div className="module-foot"><span>🔒 Prochain contenu</span><span>{m.duration} min</span></div>
            </div>
          })}
        </div>
      </section>
    })}
  </>
}
