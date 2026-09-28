'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ProgressProvider, useProgress } from './ProgressProvider'
import { useEffect } from 'react'

function Shell({children}:{children:React.ReactNode}){
  const path = usePathname()
  const {activity,user,cloudEnabled,signOut} = useProgress()

  useEffect(()=>{
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(()=>{})
  },[])

  return <>
    <header className="topbar">
      <div className="shell navrow">
        <Link href="/" className="brand"><span className="brandmark">D</span><span>DAF Academy</span></Link>
        <nav className="navlinks">
          <Link className={path==='/'?'active':''} href="/">Parcours</Link>
          <span className="xp">⚡ {activity.xp} XP</span>
          <span className="streak">🔥 {activity.streak}</span>
          {cloudEnabled ? (
            user ? <button className="ghost small" onClick={signOut}>Déconnexion</button> : <Link href="/auth" className="button small">Se connecter</Link>
          ) : <span className="cloud-note">Mode invité</span>}
        </nav>
      </div>
    </header>
    <main className="shell main">{children}</main>
    <footer className="footer">DAF Academy · Apprendre → pratiquer → maîtriser</footer>
  </>
}

export function AppShell({children}:{children:React.ReactNode}){
  return <ProgressProvider><Shell>{children}</Shell></ProgressProvider>
}
