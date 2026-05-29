'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/toast'
import type { TechniqueNote } from '@/lib/types'

const AREAS = [
  { key: 'batting', emoji: '🏏', label: 'Batting', desc: 'Bat grip, stance, drives, pulls, cuts' },
  { key: 'bowling', emoji: '⚡', label: 'Bowling', desc: 'Action, run-up, seam, spin, yorkers' },
  { key: 'fielding', emoji: '🤸', label: 'Fielding', desc: 'Ground fielding, throwing, catching' },
  { key: 'wicketkeeping', emoji: '🧤', label: 'Wicketkeeping', desc: 'Stance, glove work, positioning' },
]

function safeUrl(u: string) {
  try { const p = new URL(u); return (p.protocol === 'https:' || p.protocol === 'http:') ? p.href : null } catch { return null }
}
function DelIcon() {
  return <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
}

export default function TechniquePage() {
  const { showToast } = useToast()
  const [notes, setNotes] = useState<TechniqueNote[]>([])
  const [activeArea, setActiveArea] = useState<string | null>(null)
  const [note, setNote] = useState(''); const [link, setLink] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    const supabase = createClient()
    const { data } = await supabase.from('technique_notes').select('*').order('created_at', { ascending: false })
    setNotes(data ?? [])
  }

  function openArea(area: string) {
    setActiveArea(area); setNote(''); setLink('')
    setTimeout(() => document.getElementById('tech-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  async function save() {
    if (!note.trim()) { showToast('Add a note first'); return }
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    const today = new Date().toISOString().split('T')[0]
    await supabase.from('technique_notes').insert({ user_id: user.id, area: activeArea, note, video_url: link || null, date: today })
    setSaving(false)
    setNote(''); setLink('')
    load(); showToast('Note saved!')
  }

  async function del(id: number) {
    const supabase = createClient()
    await supabase.from('technique_notes').delete().eq('id', id)
    setNotes(prev => prev.filter(n => n.id !== id))
    showToast('Note deleted')
  }

  const areaNotes = notes.filter(n => n.area === activeArea)
  const countMap = Object.fromEntries(AREAS.map(a => [a.key, notes.filter(n => n.area === a.key).length]))

  return (
    <div className="page-content">
      <div className="stitle">Technique areas</div>
      <div className="card" style={{ overflow: 'hidden' }}>
        {AREAS.map((a, i) => (
          <button key={a.key} className="tech-btn" onClick={() => openArea(a.key)} style={i === AREAS.length - 1 ? { borderBottom: 'none' } : {}}>
            <div className="ticon">{a.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--lbl)', letterSpacing: '-0.2px' }}>{a.label}</div>
              <div style={{ fontSize: 12.5, color: 'var(--lbl3)', marginTop: 2 }}>{countMap[a.key]} {countMap[a.key] === 1 ? 'note' : 'notes'}</div>
            </div>
            <span style={{ color: 'var(--sep)', fontSize: 22, fontWeight: 200, flexShrink: 0, marginLeft: 'auto' }}>›</span>
          </button>
        ))}
      </div>

      {activeArea && (
        <div id="tech-form">
          <div className="stitle">{AREAS.find(a => a.key === activeArea)?.label} notes</div>
          <div className="card">
            <label className="flbl">Coach tip / focus point</label>
            <textarea className="finput" placeholder="e.g. Keep head still, eyes level on the drive..." value={note} onChange={e => setNote(e.target.value)} />
            <label className="flbl">Video reference (YouTube URL)</label>
            <input className="finput" type="text" placeholder="https://youtube.com/watch?v=..." inputMode="url" value={link} onChange={e => setLink(e.target.value)} />
            <button className="btn btn-p btn-full" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save note'}</button>
          </div>
          {areaNotes.map(n => {
            const safe = safeUrl(n.video_url ?? '')
            return (
              <div key={n.id} className="card" style={{ marginBottom: 8 }}>
                <div className="cpad">
                  <div style={{ fontSize: 12, color: 'var(--lbl3)', fontWeight: 500 }}>{new Date(n.date).toLocaleDateString('en-IN')}</div>
                  <div style={{ fontSize: 15, color: 'var(--lbl)', marginTop: 5, lineHeight: 1.55 }}>{n.note}</div>
                  {safe && <a href={safe} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: 'var(--green-d)', display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 8, fontWeight: 500 }}>▶ Watch video</a>}
                  <div style={{ marginTop: 10 }}>
                    <button className="btn btn-sm btn-danger" onClick={() => del(n.id)}>Delete note</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
