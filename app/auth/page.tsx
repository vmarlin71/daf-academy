'use client'

import { FormEvent, useMemo, useState } from 'react'
import Link from 'next/link'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'

export default function AuthPage(){
  const supabase=useMemo(()=>createClient(),[])
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [mode,setMode]=useState<'signin'|'signup'>('signin')
  const [message,setMessage]=useState('')
  const [busy,setBusy]=useState(false)

  async function submit(e:FormEvent){
    e.preventDefault(); if(!supabase) return
    setBusy(true);setMessage('')
    const result = mode==='signin'
      ? await supabase.auth.signInWithPassword({email,password})
      : await supabase.auth.signUp({email,password})
    setBusy(false)
    if(result.error) setMessage(result.error.message)
    else if(mode==='signup') setMessage('Compte créé. Vérifie ton email si la confirmation est activée dans Supabase.')
    else window.location.href='/'
  }

  if(!isSupabaseConfigured) return <div className="auth-card"><span className="eyebrow">CLOUD SYNC</span><h1>Supabase n’est pas encore connecté.</h1><p>La V2 reste entièrement utilisable en mode invité. Pour activer les comptes et la synchronisation, suis <b>SETUP_SUPABASE.md</b> dans le projet.</p><Link className="button primary" href="/">Retour au parcours</Link></div>

  return <div className="auth-card">
    <span className="eyebrow">{mode==='signin'?'CONNEXION':'CRÉATION DE COMPTE'}</span>
    <h1>{mode==='signin'?'Retrouve ta progression partout.':'Crée ton compte gratuit.'}</h1>
    <p>Ton cours reste gratuit ; le compte sert uniquement à synchroniser progression, scores et série.</p>
    <form onSubmit={submit}>
      <label>Email<input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="toi@email.com"/></label>
      <label>Mot de passe<input type="password" required minLength={6} value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••"/></label>
      {message && <div className="auth-message">{message}</div>}
      <button disabled={busy} className="button primary" type="submit">{busy?'…':mode==='signin'?'Se connecter':'Créer mon compte'}</button>
    </form>
    <button className="textbutton" onClick={()=>setMode(mode==='signin'?'signup':'signin')}>{mode==='signin'?'Pas encore de compte ? Créer un compte':'Déjà un compte ? Se connecter'}</button>
  </div>
}
