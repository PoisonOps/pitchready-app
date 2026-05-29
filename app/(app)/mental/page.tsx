'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/toast'
import type { MentalCheckin } from '@/lib/types'

const MOODS = [['😰','Anxious'],['😴','Tired'],['😐','Neutral'],['🎯','Focused'],['🔥','Fired up']]
const AFFS = [
  "Every great cricketer started exactly where you are.",
  "Consistency beats talent when talent doesn't work hard.",
  "One session at a time. Show up today.",
  "Trust the process. Your academy hours will pay off.",
  "Pressure is a privilege — only the best feel it.",
  "Your bat tells the story your mind writes.",
  "Champions train when no one is watching.",
  "Stay humble, train hard, play bold.",
  "Every drop of sweat is a step closer to your dream.",
  "Focus on what you can control: effort and attitude.",
  "The nets don't lie. Put in the work.",
  "Great fielders are made, not born. Move your feet.",
  "Doubt your doubts before you doubt yourself.",
  "Hard work beats talent when talent stops working hard.",
  "The pitch doesn't care about your excuses.",
]

function DelIcon() {
  return <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
}

export default function MentalPage() {
  const { showToast } = useToast()
  const [checkins, setCheckins] = useState<MentalCheckin[]>([])
  const [conf, setConf] = useState(7)
  const [mood, setMood] = useState('')
  const [goal, setGoal] = useState(''); const [notes, setNotes] = useState('')
  const [affIdx, setAffIdx] = useState(() => Math.floor(Math.random() * AFFS.length))
  const [showAll, setShowAll] = useState(false); const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    const supabase = createClient()
    const { data } = await supabase.from('mental_checkins').select('*').order('created_at', { ascending: false })
    setCheckins(data ?? [])
  }

  async function save() {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    const today = new Date().toISOString().split('T')[0]
    await supabase.from('mental_checkins').insert({ user_id: user.id, date: today, confidence: conf, mood, goal, notes })
    setSaving(false)
    setConf(7); setMood(''); setGoal(''); setNotes('')
    load(); showToast('Check-in saved! 🧠')
  }

  async function del(id: number) {
    const supabase = createClient()
    await supabase.from('mental_checkins').delete().eq('id', id)
    setCheckins(prev => prev.filter(c => c.id !== id))
    showToast('Entry deleted')
  }

  const list = showAll ? checkins : checkins.slice(0, 6)

  return (
    <div className="page-content">
      <div className="stitle">Daily check-in</div>
      <div className="card">
        <label className="flbl">Today&apos;s confidence (1–10)</label>
        <div className="cslider" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 16px 14px' }}>
          <input type="range" min="1" max="10" value={conf} step="1" onChange={e => setConf(+e.target.value)} style={{ flex: 1 }} />
          <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--green)', minWidth: 30, textAlign: 'center', letterSpacing: '-0.5px' }}>{conf}</span>
        </div>
        <label className="flbl">How do you feel?</label>
        <div style={{ display: 'flex', gap: 8, padding: '6px 16px 14px', flexWrap: 'wrap' }}>
          {MOODS.map(([emoji, label]) => (
            <button key={label} className={`mbtn${mood === label ? ' on' : ''}`} onClick={() => setMood(mood === label ? '' : label)}>{emoji}</button>
          ))}
        </div>
        <label className="flbl">Today&apos;s goal (one thing)</label>
        <input className="finput" type="text" placeholder="e.g. Keep my head still on every ball" value={goal} onChange={e => setGoal(e.target.value)} />
        <label className="flbl">Reflection / thoughts</label>
        <textarea className="finput" placeholder="What went well? What will you do differently?" value={notes} onChange={e => setNotes(e.target.value)} />
        <button className="btn btn-p btn-full" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save check-in'}</button>
      </div>

      <div className="stitle">Affirmations</div>
      <div className="card aff-card" onClick={() => setAffIdx(i => (i + 1) % AFFS.length)}>
        <div style={{ fontSize: 28, marginBottom: 10 }}>💬</div>
        <div style={{ fontSize: 15.5, color: 'var(--lbl)', lineHeight: 1.68, fontStyle: 'italic', fontWeight: 400, letterSpacing: '-0.2px' }}>{AFFS[affIdx]}</div>
        <div style={{ fontSize: 11, color: 'var(--lbl4)', marginTop: 12, fontWeight: 500 }}>Tap for next</div>
      </div>

      <div className="stitle">
        Past check-ins
        <button className="stitle-btn" onClick={() => setShowAll(p => !p)}>{showAll ? 'Show less' : 'Show all'}</button>
      </div>
      {checkins.length === 0
        ? <div className="card"><div className="empty"><div className="ei">🧠</div><p>No check-ins yet</p></div></div>
        : list.map(c => (
          <div key={c.id} className="card" style={{ marginBottom: 8 }}>
            <div className="cpad">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--lbl3)', fontWeight: 500 }}>{new Date(c.date).toLocaleDateString('en-IN')}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span className="badge bg">Conf: {c.confidence}/10</span>
                  <button className="del-btn" onClick={() => del(c.id)}><DelIcon /></button>
                </div>
              </div>
              {c.mood && <div style={{ fontSize: 13, color: 'var(--lbl3)', marginTop: 5 }}>{c.mood}</div>}
              {c.goal && <div style={{ fontSize: 15, color: 'var(--lbl)', marginTop: 6, fontWeight: 500 }}>🎯 {c.goal}</div>}
              {c.notes && <div style={{ fontSize: 13, color: 'var(--lbl2)', marginTop: 4, lineHeight: 1.5 }}>{c.notes.substring(0, 120)}{c.notes.length > 120 ? '…' : ''}</div>}
            </div>
          </div>
        ))
      }
    </div>
  )
}
