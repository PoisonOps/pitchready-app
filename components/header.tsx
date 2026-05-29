'use client'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function Header({ name }: { name?: string | null }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [date, setDate] = useState('')
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    setDate(new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))
  }, [])

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const isDark = mounted && resolvedTheme === 'dark'

  return (
    <>
      <div className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="app-logo">🏏</div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--lbl)', letterSpacing: '-0.4px', lineHeight: 1.1 }}>PitchReady</div>
              <div style={{ fontSize: 12, color: 'var(--lbl3)', marginTop: 1 }}>{name || 'Cricket Academy'}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            {mounted && (
              <button className="icon-btn" onClick={() => setTheme(isDark ? 'light' : 'dark')} title="Toggle theme">
                <svg viewBox="0 0 24 24">
                  {isDark
                    ? <><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></>
                    : <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                  }
                </svg>
              </button>
            )}
            <button className="icon-btn" onClick={signOut} title="Sign out">
              <svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
          </div>
        </div>
      </div>
      <div className="date-strip">{date}</div>
    </>
  )
}
