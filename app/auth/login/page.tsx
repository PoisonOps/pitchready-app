'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    const supabase = createClient()
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (err) { setError(err.message); return }
    router.push('/')
    router.refresh()
  }

  return (
    <div className="auth-wrap">
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(140deg,#34C759,#009E40)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, margin: '0 auto 12px', boxShadow: '0 4px 16px rgba(52,199,89,.35)' }}>🏏</div>
        <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--lbl)', letterSpacing: '-0.6px' }}>PitchReady</div>
        <div style={{ fontSize: 14, color: 'var(--lbl3)', marginTop: 4 }}>Your cricket performance tracker</div>
      </div>
      <div className="auth-card">
        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--lbl)', marginBottom: 20, letterSpacing: '-0.4px' }}>Sign in</div>
        {error && <div className="auth-err">{error}</div>}
        <form onSubmit={handleLogin}>
          <input className="auth-input" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
          <input className="auth-input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
          <button className="auth-btn" type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 18, fontSize: 14, color: 'var(--lbl3)' }}>
          No account?{' '}
          <Link href="/auth/signup" style={{ color: 'var(--green-d)', fontWeight: 600 }}>Sign up</Link>
        </p>
      </div>
    </div>
  )
}
