'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/toast'
import type { TrainingSession } from '@/lib/types'

const FOCUS_OPTIONS = ['Batting','Bowling','Fielding','Footwork','Grip & stance','Fitness','Net practice','Throwing']
const RATINGS = ['','😞','😐','🙂','😄','🔥']

function DelIcon() {
  return <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
}

export default function TrainingPage() {
  const { showToast } = useToast()
  const [sessions, setSessions] = useState<TrainingSession[]>([])
  const [dur, setDur] = useState('')
  const [focus, setFocus] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [rating, setRating] = useState(0)
  const [showAll, setShowAll] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    const supabase = createClient()
    const { data } = await supabase.from('training_sessions').select('*').order('created_at', { ascending: false })
    setSessions(data ?? [])
  }

  function toggleFocus(f: string) {
    setFocus(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f])
  }

  async function save() {
    if (!dur || +dur < 1) { showToast('Enter a valid duration'); return }
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const today = new Date().toISOString().split('T')[0]
    const { error } = await supabase.from('training_sessions').insert({ user_id: user.id, date: today, duration_min: +dur, focus, notes, rating })
    setSaving(false)
    if (error) { showToast('Error saving session'); return }
    setDur(''); setFocus([]); setNotes(''); setRating(0)
    load(); showToast('Session saved! 💪')
  }

  async function del(id: number) {
    const supabase = createClient()
    await supabase.from('training_sessions').delete().eq('id', id)
    setSessions(prev => prev.filter(s => s.id !== id))
    showToast('Session deleted')
  }

  const list = showAll ? sessions : sessions.slice(0, 8)

  return (
    <div className="page-content">
      <div className="stitle">Log session</div>
      <div className="card">
        <label className="flbl">Date</label>
        <input className="finput" type="text" readOnly value={new Date().toLocaleDateString('en-IN')} />
        <label className="flbl">Duration (minutes)</label>
        <input className="finput" type="number" placeholder="e.g. 90" min="1" inputMode="numeric" value={dur} onChange={e => setDur(e.target.value)} />
        <label className="flbl">Focus areas</label>
        <div style={{ padding: '4px 16px 6px', display: 'flex', flexWrap: 'wrap' }}>
          {FOCUS_OPTIONS.map(f => (
            <button key={f} className={`pill${focus.includes(f) ? ' sel' : ''}`} onClick={() => toggleFocus(f)}>{f}</button>
          ))}
        </div>
        <label className="flbl">Coach feedback / notes</label>
        <textarea className="finput" placeholder="What did coach say? What worked?" value={notes} onChange={e => setNotes(e.target.value)} />
        <label className="flbl">Session rating</label>
        <div style={{ display: 'flex', gap: 8, padding: '6px 16px 14px' }}>
          {[1,2,3,4,5].map(v => (
            <button key={v} className={`rbtn${rating === v ? ' on' : ''}`} onClick={() => setRating(v)}>{RATINGS[v]}</button>
          ))}
        </div>
        <button className="btn btn-p btn-full" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save session'}</button>
      </div>

      <div className="stitle">
        Past sessions
        <button className="stitle-btn" onClick={() => setShowAll(p => !p)}>{showAll ? 'Show less' : 'Show all'}</button>
      </div>
      {sessions.length === 0
        ? <div className="card"><div className="empty"><div className="ei">🏏</div><p>No sessions yet</p></div></div>
        : <div className="card">
            {list.map(s => (
              <div key={s.id} className="li">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="ltitle">{new Date(s.date).toLocaleDateString('en-IN')} · {s.duration_min} min</div>
                  <div className="lmeta">{s.focus?.length ? s.focus.join(', ') : 'General training'}</div>
                  {s.notes && <div className="lmeta" style={{ marginTop: 2 }}>{s.notes.substring(0, 70)}{s.notes.length > 70 ? '…' : ''}</div>}
                </div>
                <div className="li-right">
                  <span className="badge bg">{RATINGS[s.rating] || '·'}</span>
                  <button className="del-btn" onClick={() => del(s.id)}><DelIcon /></button>
                </div>
              </div>
            ))}
          </div>
      }
    </div>
  )
}
