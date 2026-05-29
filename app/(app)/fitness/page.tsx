'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/toast'
import type { WeightLog } from '@/lib/types'

const FIT_ITEMS = ['Morning warm-up / stretch','Running / cardio (30+ min)','Strength & conditioning','8+ glasses of water','Protein-rich meals','7–8 hrs sleep (last night)','Avoided junk food','Cool-down & recovery']

function DelIcon() {
  return <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
}

export default function FitnessPage() {
  const { showToast } = useToast()
  const [checked, setChecked] = useState<number[]>([])
  const [weights, setWeights] = useState<WeightLog[]>([])
  const [weightInput, setWeightInput] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => { load() }, [])

  async function load() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUserId(user.id)
    const [fit, wt] = await Promise.all([
      supabase.from('fitness_checkins').select('*').eq('user_id', user.id).eq('date', today).maybeSingle(),
      supabase.from('weight_logs').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
    ])
    setChecked(fit.data?.checked_items ?? [])
    setWeights(wt.data ?? [])
  }

  async function toggleCheck(idx: number) {
    if (!userId) return
    const next = checked.includes(idx) ? checked.filter(i => i !== idx) : [...checked, idx]
    setChecked(next)
    const supabase = createClient()
    await supabase.from('fitness_checkins').upsert({ user_id: userId, date: today, checked_items: next }, { onConflict: 'user_id,date' })
  }

  async function saveWeight() {
    const w = +weightInput
    if (!w) { showToast('Enter weight first'); return }
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('weight_logs').insert({ user_id: user.id, date: today, weight_kg: w })
    setWeightInput('')
    load()
    showToast('Weight logged!')
  }

  async function delWeight(id: number) {
    const supabase = createClient()
    await supabase.from('weight_logs').delete().eq('id', id)
    setWeights(prev => prev.filter(w => w.id !== id))
    showToast('Entry deleted')
  }

  const pct = Math.round(checked.length / FIT_ITEMS.length * 100)
  const trend = weights.length > 1 ? +(weights[0].weight_kg - weights[1].weight_kg).toFixed(1) : 0

  return (
    <div className="page-content">
      <div className="stitle">Today&apos;s checklist</div>
      <div className="card">
        {FIT_ITEMS.map((item, i) => (
          <div key={i} className="crow" onClick={() => toggleCheck(i)} style={{ cursor: 'pointer' }}>
            <div className={`cbox${checked.includes(i) ? ' on' : ''}`}>
              <svg viewBox="0 0 12 12"><polyline points="1.5,6 5,9.5 10.5,2.5"/></svg>
            </div>
            <span className={`clbl${checked.includes(i) ? ' done' : ''}`}>{item}</span>
          </div>
        ))}
        <div style={{ padding: '12px 16px 4px' }}>
          <div className="pbar"><div className="pfill" style={{ width: pct + '%' }} /></div>
          <div style={{ fontSize: 12, color: 'var(--lbl3)', marginTop: 7, fontWeight: 500, paddingBottom: 14 }}>
            {checked.length} / {FIT_ITEMS.length} done · {pct}%
          </div>
        </div>
      </div>

      <div className="stitle">Weight tracker</div>
      <div className="card">
        <label className="flbl">Weight (kg)</label>
        <input className="finput" type="number" placeholder="e.g. 68.5" step="0.1" inputMode="decimal" value={weightInput} onChange={e => setWeightInput(e.target.value)} />
        <div style={{ padding: '2px 16px 14px', marginTop: 4 }}>
          <button className="btn btn-sm btn-p" onClick={saveWeight}>+ Log weight</button>
        </div>
        {weights.length > 0 && (
          <>
            <div style={{ height: '0.5px', background: 'var(--sep-l)' }} />
            {weights.map((w, i) => (
              <div key={w.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: i < weights.length - 1 ? '0.5px solid var(--sep-l)' : 'none' }}>
                <span style={{ fontSize: 13, color: 'var(--lbl3)' }}>{new Date(w.date).toLocaleDateString('en-IN')}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--lbl)' }}>
                    {w.weight_kg} kg
                    {i === 0 && trend !== 0 && (
                      <span style={{ fontSize: 11, color: trend > 0 ? 'var(--amber)' : 'var(--green-d)', marginLeft: 4 }}>
                        {trend > 0 ? '▲' : '▼'} {Math.abs(trend)}
                      </span>
                    )}
                  </span>
                  <button className="del-btn" onClick={() => delWeight(w.id)}><DelIcon /></button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
