'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/toast'
import type { TrainingSession, Match, FitnessCheckin, MentalCheckin, Profile } from '@/lib/types'

const FIT_ITEMS = ['Morning warm-up / stretch','Running / cardio (30+ min)','Strength & conditioning','8+ glasses of water','Protein-rich meals','7–8 hrs sleep (last night)','Avoided junk food','Cool-down & recovery']

function calcStreak(dates: string[]): number {
  const today = new Date()
  const todayStr = today.toLocaleDateString('en-IN')
  const hasToday = dates.includes(todayStr)
  let streak = 0
  for (let i = hasToday ? 0 : 1; i <= 365; i++) {
    const d = new Date(today); d.setDate(d.getDate() - i)
    if (dates.includes(d.toLocaleDateString('en-IN'))) streak++
    else break
  }
  return streak
}

export default function HomePage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [sessions, setSessions] = useState<TrainingSession[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [fitness, setFitness] = useState<FitnessCheckin | null>(null)
  const [mental, setMental] = useState<MentalCheckin[]>([])
  const [name, setName] = useState('')
  const [weeklyTarget, setWeeklyTarget] = useState(5)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    const supabase = createClient()
    const today = new Date().toISOString().split('T')[0]
    const [p, s, m, f, me] = await Promise.all([
      supabase.from('profiles').select('*').single(),
      supabase.from('training_sessions').select('date,duration_min,focus,rating,created_at').order('created_at', { ascending: false }),
      supabase.from('matches').select('opponent,result,date,created_at').order('created_at', { ascending: false }),
      supabase.from('fitness_checkins').select('*').eq('date', today).maybeSingle(),
      supabase.from('mental_checkins').select('confidence,mood,date,created_at').order('created_at', { ascending: false }).limit(1),
    ])
    setProfile(p.data); setName(p.data?.name ?? ''); setWeeklyTarget(p.data?.weekly_target ?? 5)
    setSessions((s.data ?? []) as TrainingSession[]); setMatches((m.data ?? []) as Match[])
    setFitness(f.data); setMental((me.data ?? []) as MentalCheckin[])
    setLoading(false)
  }

  async function saveName() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').upsert({ id: user.id, name, weekly_target: weeklyTarget })
    showToast('Name saved!')
  }

  async function saveTarget(v: number) {
    setWeeklyTarget(v)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').upsert({ id: user.id, name, weekly_target: v })
  }

  if (loading) return <div className="page-content"><div className="empty"><div className="ei">🏏</div><p>Loading…</p></div></div>

  const today = new Date()
  const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7)
  const weekSessions = sessions.filter(s => new Date(s.date) >= weekAgo).length
  const fitPct = fitness ? Math.round(fitness.checked_items.length / FIT_ITEMS.length * 100) : 0
  const lastConf = mental[0]?.confidence
  const streak = calcStreak(sessions.map(s => new Date(s.date).toLocaleDateString('en-IN')))
  const streakDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today); d.setDate(d.getDate() - (6 - i))
    const ds = d.toLocaleDateString('en-IN')
    const has = sessions.some(s => new Date(s.date).toLocaleDateString('en-IN') === ds)
    return { ds, has, isToday: i === 6 }
  })

  const recent: { label: string; meta: string; cls: string; txt: string }[] = []
  sessions.slice(0, 2).forEach(s => recent.push({ label: `Training — ${s.duration_min} min`, meta: new Date(s.date).toLocaleDateString('en-IN'), cls: 'bg', txt: 'Session' }))
  matches.slice(0, 2).forEach(m => recent.push({ label: `${m.opponent} — ${m.result}`, meta: new Date(m.date).toLocaleDateString('en-IN'), cls: m.result === 'Won' ? 'bg' : m.result === 'Lost' ? 'br' : 'bb', txt: 'Match' }))
  mental.slice(0, 1).forEach(m => recent.push({ label: `Check-in — Conf ${m.confidence}/10`, meta: new Date(m.date).toLocaleDateString('en-IN'), cls: 'bb', txt: 'Mental' }))

  return (
    <div className="page-content">
      {/* Streak */}
      <div style={{ margin: '16px 14px 4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--lbl)' }}>Training streak</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--green-d)' }}>{streak} {streak === 1 ? 'day' : 'days'}</span>
        </div>
        <div style={{ display: 'flex', gap: 5 }}>
          {streakDays.map((d, i) => <div key={i} className={`sday${d.has ? (d.isToday ? ' today' : ' done') : ''}`} />)}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--lbl4)', marginTop: 5, fontWeight: 500 }}>
          <span>7 days ago</span><span>Today</span>
        </div>
      </div>

      {/* Stats */}
      <div className="sgrid">
        <div className="sc sc-hi">
          <div className="slbl">Sessions this week</div>
          <div className="sval">{weekSessions}</div>
          <div className="strend">{weekSessions >= weeklyTarget ? '✓ Goal reached!' : `Goal: ${weekSessions}/${weeklyTarget}`}</div>
        </div>
        <div className="sc">
          <div className="slbl">Total matches</div>
          <div className="sval">{matches.length}</div>
        </div>
        <div className="sc">
          <div className="slbl">Fitness today</div>
          <div className="sval">{fitPct}<span className="sunit">%</span></div>
        </div>
        <div className="sc">
          <div className="slbl">Last confidence</div>
          <div className="sval" style={{ fontSize: 20 }}>{lastConf ? <>{lastConf}<span className="sunit">/10</span></> : '—'}</div>
        </div>
      </div>

      {/* Quick log */}
      <div className="stitle">Quick log</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: '0 14px 4px' }}>
        {[['training','Training'],['match','Match'],['fitness','Fitness'],['mental','Mental']].map(([href, label]) => (
          <button key={href} className="qbtn" onClick={() => router.push(`/${href}`)}>
            <svg viewBox="0 0 24 24">{href === 'training' ? <><path d="M13 5l7 7-7 7M5 5l7 7-7 7"/></> : href === 'match' ? <><circle cx="12" cy="12" r="9"/><path d="M12 3c3 3 3 6 0 9s-3 6 0 9"/></> : href === 'fitness' ? <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/> : <><path d="M12 2a7 7 0 0 1 7 7c0 3-1.5 5-3 6.5V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-1.5C6.5 14 5 12 5 9a7 7 0 0 1 7-7z"/><path d="M9 21h6"/></>}</svg>
            {label}
          </button>
        ))}
      </div>

      {/* Recent */}
      <div className="stitle">Recent activity</div>
      <div className="card">
        {recent.length === 0
          ? <div className="empty"><div className="ei">📋</div><p>No logs yet — start adding!</p></div>
          : recent.map((a, i) => (
            <div key={i} className="li">
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="ltitle">{a.label}</div>
                <div className="lmeta">{a.meta}</div>
              </div>
              <span className={`badge ${a.cls}`} style={{ flexShrink: 0, marginLeft: 8 }}>{a.txt}</span>
            </div>
          ))}
      </div>

      {/* Settings */}
      <div className="stitle">Settings</div>
      <div className="card">
        <label className="flbl">Your name</label>
        <input className="finput" type="text" placeholder="Enter your name" value={name} onChange={e => setName(e.target.value)} onBlur={saveName} />
        <label className="flbl">Weekly session goal</label>
        <select className="finput" value={weeklyTarget} onChange={e => saveTarget(+e.target.value)} style={{ marginBottom: 14 }}>
          {[3,4,5,6,7].map(n => <option key={n} value={n}>{n} sessions{n === 7 ? ' (daily)' : ''}</option>)}
        </select>
      </div>
    </div>
  )
}
