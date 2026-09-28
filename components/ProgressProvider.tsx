'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { ProgressRecord } from '@/lib/types'

const STORAGE_KEY = 'daf-academy-v2-progress'
const ACTIVITY_KEY = 'daf-academy-v2-activity'

type ActivityState = { xp:number; streak:number; lastActive:string | null }

type ProgressContextType = {
  progress: Record<string, ProgressRecord>
  activity: ActivityState
  user: User | null
  cloudEnabled: boolean
  loading: boolean
  markLessonRead: (slug:string)=>Promise<void>
  saveQuizScore: (slug:string, score:number)=>Promise<void>
  signOut: ()=>Promise<void>
}

const ProgressContext = createContext<ProgressContextType | null>(null)

function today(){ return new Date().toISOString().slice(0,10) }
function yesterday(){ const d = new Date(); d.setDate(d.getDate()-1); return d.toISOString().slice(0,10) }

function loadLocalProgress(): Record<string, ProgressRecord> {
  if (typeof window === 'undefined') return {}
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') } catch { return {} }
}
function loadActivity(): ActivityState {
  if (typeof window === 'undefined') return {xp:0,streak:0,lastActive:null}
  try { return JSON.parse(localStorage.getItem(ACTIVITY_KEY) || '{"xp":0,"streak":0,"lastActive":null}') } catch { return {xp:0,streak:0,lastActive:null} }
}

export function ProgressProvider({children}:{children:React.ReactNode}) {
  const [progress,setProgress] = useState<Record<string,ProgressRecord>>({})
  const [activity,setActivity] = useState<ActivityState>({xp:0,streak:0,lastActive:null})
  const [user,setUser] = useState<User|null>(null)
  const [loading,setLoading] = useState(true)
  const supabase = useMemo(()=>createClient(),[])

  useEffect(()=>{
    setProgress(loadLocalProgress())
    setActivity(loadActivity())
    if (!supabase) { setLoading(false); return }

    supabase.auth.getUser().then(async ({data})=>{
      setUser(data.user ?? null)
      if (data.user) await hydrateFromCloud(data.user.id)
      setLoading(false)
    })
    const {data:{subscription}} = supabase.auth.onAuthStateChange(async (_event, session)=>{
      setUser(session?.user ?? null)
      if (session?.user) await hydrateFromCloud(session.user.id)
    })
    return ()=>subscription.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[supabase])

  async function hydrateFromCloud(userId:string){
    if (!supabase) return
    const localProgress = loadLocalProgress()
    const localActivity = loadActivity()
    const [{data:rows},{data:stats}] = await Promise.all([
      supabase.from('user_progress').select('*').eq('user_id',userId),
      supabase.from('user_stats').select('*').eq('user_id',userId).maybeSingle()
    ])

    const cloud: Record<string, ProgressRecord> = Object.fromEntries((rows ?? []).map((r:any)=>[r.module_slug,{
      moduleSlug:r.module_slug,
      lessonRead:r.lesson_read,
      bestScore:r.best_score,
      attempts:r.attempts,
      completed:r.completed,
      updatedAt:r.updated_at
    }]))

    // Merge device + cloud instead of overwriting a learner's existing guest progress.
    const merged: Record<string, ProgressRecord> = {...cloud}
    for (const [slug, local] of Object.entries(localProgress)) {
      const remote = cloud[slug]
      if (!remote || new Date(local.updatedAt).getTime() > new Date(remote.updatedAt).getTime()) merged[slug] = local
    }
    setProgress(merged)
    localStorage.setItem(STORAGE_KEY,JSON.stringify(merged))

    const toUpload = Object.values(merged).filter(r=>{
      const remote = cloud[r.moduleSlug]
      return !remote || new Date(r.updatedAt).getTime() > new Date(remote.updatedAt).getTime()
    })
    if (toUpload.length) {
      await supabase.from('user_progress').upsert(toUpload.map(r=>({
        user_id:userId,module_slug:r.moduleSlug,lesson_read:r.lessonRead,best_score:r.bestScore,
        attempts:r.attempts,completed:r.completed,updated_at:r.updatedAt
      })))
    }

    const cloudActivity: ActivityState | null = stats ? {xp:stats.xp,streak:stats.streak,lastActive:stats.last_active_date} : null
    const a = !cloudActivity || (localActivity.lastActive && (!cloudActivity.lastActive || localActivity.lastActive >= cloudActivity.lastActive))
      ? localActivity : cloudActivity
    setActivity(a)
    localStorage.setItem(ACTIVITY_KEY,JSON.stringify(a))
    await supabase.from('user_stats').upsert({user_id:userId,xp:a.xp,streak:a.streak,last_active_date:a.lastActive})
  }

  function bumpActivity(xpGain:number){
    setActivity(prev=>{
      const t = today()
      let streak = prev.streak
      if (prev.lastActive !== t) {
        streak = prev.lastActive === yesterday() ? Math.max(1,prev.streak+1) : 1
      }
      const next = {xp:prev.xp+xpGain,streak,lastActive:t}
      localStorage.setItem(ACTIVITY_KEY,JSON.stringify(next))
      if (supabase && user) {
        supabase.from('user_stats').upsert({user_id:user.id,xp:next.xp,streak:next.streak,last_active_date:next.lastActive}).then(()=>{})
      }
      return next
    })
  }

  async function persistRecord(record:ProgressRecord){
    setProgress(prev=>{
      const next = {...prev,[record.moduleSlug]:record}
      localStorage.setItem(STORAGE_KEY,JSON.stringify(next))
      return next
    })
    if (supabase && user){
      await supabase.from('user_progress').upsert({
        user_id:user.id,
        module_slug:record.moduleSlug,
        lesson_read:record.lessonRead,
        best_score:record.bestScore,
        attempts:record.attempts,
        completed:record.completed,
        updated_at:record.updatedAt
      })
    }
  }

  async function markLessonRead(slug:string){
    const old = progress[slug]
    const first = !old?.lessonRead
    const record: ProgressRecord = {
      moduleSlug:slug, lessonRead:true, bestScore:old?.bestScore ?? 0, attempts:old?.attempts ?? 0,
      completed: old?.completed ?? false, updatedAt:new Date().toISOString()
    }
    await persistRecord(record)
    if (first) bumpActivity(20)
  }

  async function saveQuizScore(slug:string,score:number){
    const old = progress[slug]
    const best = Math.max(old?.bestScore ?? 0, score)
    const completed = Boolean(old?.lessonRead) && best >= 70
    const firstCompletion = completed && !old?.completed
    const record: ProgressRecord = {
      moduleSlug:slug, lessonRead:old?.lessonRead ?? false, bestScore:best,
      attempts:(old?.attempts ?? 0)+1, completed, updatedAt:new Date().toISOString()
    }
    await persistRecord(record)
    bumpActivity(10 + (firstCompletion ? 50 : 0))
    if (supabase && user){
      await supabase.from('quiz_attempts').insert({user_id:user.id,module_slug:slug,score})
    }
  }

  async function signOut(){ if(supabase) await supabase.auth.signOut(); setUser(null) }

  return <ProgressContext.Provider value={{progress,activity,user,cloudEnabled:isSupabaseConfigured,loading,markLessonRead,saveQuizScore,signOut}}>{children}</ProgressContext.Provider>
}

export function useProgress(){
  const ctx = useContext(ProgressContext)
  if(!ctx) throw new Error('useProgress must be used inside ProgressProvider')
  return ctx
}
