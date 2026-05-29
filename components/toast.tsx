'use client'
import { createContext, useContext, useRef, useState } from 'react'

type Ctx = { showToast: (msg: string) => void }
const ToastCtx = createContext<Ctx>({ showToast: () => {} })

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [msg, setMsg] = useState('')
  const [visible, setVisible] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  function showToast(m: string) {
    setMsg(m)
    setVisible(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setVisible(false), 2400)
  }

  return (
    <ToastCtx.Provider value={{ showToast }}>
      {children}
      <div className={`toast${visible ? ' show' : ''}`}>{msg}</div>
    </ToastCtx.Provider>
  )
}

export function useToast() { return useContext(ToastCtx) }
