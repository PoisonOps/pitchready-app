'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/toast'
import type { Match } from '@/lib/types'

function DelIcon() {
  return <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
}

export default function MatchPage() {
  const { showToast } = useToast()
  const [matches, setMatches] = useState<Match[]>([])
  const [opp, setOpp] = useState('')
  const [role, setRole] = useState('Batsman')
  const [runs, setRuns] = useState(''); const [balls, setBalls] = useState(''); const [howOut, setHowOut] = useState('Not out')
  const [overs, setOvers] = useState(''); const [wkts, setWkts] = useState(''); const [runsc, setRunsc] = useState('')
  const [catches, setCatches] = useState(''); const [result, setResult] = useState('Won'); const [notes, setNotes] = useState('')
  const [showAll, setShowAll] = useState(false); const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    const supabase = createClient()
    const { data } = await supabase.from('matches').select('*').order('created_at', { ascending: false })
    setMatches(data ?? [])
  }

  async function save() {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    const today = new Date().toISOString().split('T')[0]
    const { error } = await supabase.from('matches').insert({
      user_id: user.id, date: today, opponent: opp || 'Match', role,
      runs: +runs || 0, balls: +balls || 0, how_out: howOut,
      overs: +overs || 0, wickets: +wkts || 0, runs_conceded: +runsc || 0,
      catches: +catches || 0, result, notes,
    })
    setSaving(false)
    if (error) { showToast('Error saving match'); return }
    setOpp(''); setRuns(''); setBalls(''); setOvers(''); setWkts(''); setRunsc(''); setCatches(''); setNotes('')
    load(); showToast('Match logged! 🏆')
  }

  async function del(id: number) {
    const supabase = createClient()
    await supabase.from('matches').delete().eq('id', id)
    setMatches(prev => prev.filter(m => m.id !== id))
    showToast('Match deleted')
  }

  const showBat = role !== 'Bowler'
  const showBowl = role === 'Bowler' || role === 'All-rounder'
  const list = showAll ? matches : matches.slice(0, 8)

  // Career stats
  const totalRuns = matches.reduce((s, m) => s + (m.runs || 0), 0)
  const totalWkts = matches.reduce((s, m) => s + (m.wickets || 0), 0)
  const wins = matches.filter(m => m.result === 'Won').length
  const hs = matches.length ? Math.max(...matches.map(m => m.runs || 0)) : 0
  const batInnings = matches.filter(m => m.role !== 'Bowler' && m.how_out !== 'Not out')
  const batAvg = batInnings.length ? (totalRuns / batInnings.length).toFixed(1) : '—'
  const totalBalls = matches.reduce((s, m) => s + (m.balls || 0), 0)
  const sr = totalBalls ? ((totalRuns / totalBalls) * 100).toFixed(1) : '—'
  const totalOvers = matches.reduce((s, m) => s + (m.overs || 0), 0)
  const totalRC = matches.reduce((s, m) => s + (m.runs_conceded || 0), 0)
  const eco = totalOvers ? (totalRC / totalOvers).toFixed(2) : '—'
  const winPct = matches.length ? Math.round((wins / matches.length) * 100) : 0

  return (
    <div className="page-content">
      <div className="stitle">Log match</div>
      <div className="card">
        <label className="flbl">Opponent / match</label>
        <input className="finput" type="text" placeholder="e.g. vs Green Club Academy" value={opp} onChange={e => setOpp(e.target.value)} />
        <label className="flbl">My role</label>
        <select className="finput" value={role} onChange={e => setRole(e.target.value)}>
          {['Batsman','Bowler','All-rounder','Wicketkeeper-Batsman'].map(r => <option key={r}>{r}</option>)}
        </select>
        {showBat && <>
          <label className="flbl">Runs scored</label>
          <input className="finput" type="number" placeholder="0" min="0" inputMode="numeric" value={runs} onChange={e => setRuns(e.target.value)} />
          <label className="flbl">Balls faced</label>
          <input className="finput" type="number" placeholder="0" min="0" inputMode="numeric" value={balls} onChange={e => setBalls(e.target.value)} />
          <label className="flbl">How out</label>
          <select className="finput" value={howOut} onChange={e => setHowOut(e.target.value)}>
            {['Not out','Bowled','Caught','LBW','Run out','Stumped'].map(h => <option key={h}>{h}</option>)}
          </select>
        </>}
        {showBowl && <>
          <label className="flbl">Overs bowled</label>
          <input className="finput" type="number" placeholder="0" min="0" step="0.1" inputMode="decimal" value={overs} onChange={e => setOvers(e.target.value)} />
          <label className="flbl">Wickets taken</label>
          <input className="finput" type="number" placeholder="0" min="0" inputMode="numeric" value={wkts} onChange={e => setWkts(e.target.value)} />
          <label className="flbl">Runs conceded</label>
          <input className="finput" type="number" placeholder="0" min="0" inputMode="numeric" value={runsc} onChange={e => setRunsc(e.target.value)} />
        </>}
        <label className="flbl">Catches / run-outs</label>
        <input className="finput" type="number" placeholder="0" min="0" inputMode="numeric" value={catches} onChange={e => setCatches(e.target.value)} />
        <label className="flbl">Match result</label>
        <select className="finput" value={result} onChange={e => setResult(e.target.value)}>
          {['Won','Lost','Draw / No result'].map(r => <option key={r}>{r}</option>)}
        </select>
        <label className="flbl">Notes / what to improve</label>
        <textarea className="finput" placeholder="Key moments, decisions, areas to work on..." value={notes} onChange={e => setNotes(e.target.value)} />
        <button className="btn btn-p btn-full" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save match'}</button>
      </div>

      {matches.length > 0 && <>
        <div className="stitle">Career stats</div>
        <div className="card" style={{ margin: '0 14px 4px' }}>
          <table className="ctable">
            <tbody>
              {[['Matches', matches.length],['Total runs', totalRuns],['High score', hs],['Batting avg', batAvg],['Strike rate', sr],['Wickets', totalWkts],['Economy', eco],['Win rate', winPct + '%']].map(([k, v]) => (
                <tr key={k as string}><td>{k}</td><td>{v}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </>}

      <div className="stitle">
        Match history
        <button className="stitle-btn" onClick={() => setShowAll(p => !p)}>{showAll ? 'Show less' : 'Show all'}</button>
      </div>
      {matches.length === 0
        ? <div className="card"><div className="empty"><div className="ei">🏆</div><p>No matches yet</p></div></div>
        : <div className="card">
            {list.map(m => {
              const bCls = m.result === 'Won' ? 'bg' : m.result === 'Lost' ? 'br' : 'bb'
              const bTxt = m.result === 'Won' ? 'W' : m.result === 'Lost' ? 'L' : 'D'
              const bat = m.role !== 'Bowler'; const bowl = m.role === 'Bowler' || m.role === 'All-rounder'
              let stats = ''; if (bat) stats += `${m.runs} runs (${m.balls}b)`; if (bat && bowl) stats += ' · '; if (bowl) stats += `${m.wickets}/${m.overs}ov`
              return (
                <div key={m.id} className="li">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="ltitle">{m.opponent}</div>
                    <div className="lmeta">{new Date(m.date).toLocaleDateString('en-IN')} · {m.role} · {stats}</div>
                    {m.notes && <div className="lmeta" style={{ marginTop: 2 }}>{m.notes.substring(0, 60)}{m.notes.length > 60 ? '…' : ''}</div>}
                  </div>
                  <div className="li-right">
                    <span className={`badge ${bCls}`}>{bTxt}</span>
                    <button className="del-btn" onClick={() => del(m.id)}><DelIcon /></button>
                  </div>
                </div>
              )
            })}
          </div>
      }
    </div>
  )
}
