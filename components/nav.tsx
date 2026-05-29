'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: 'Home', icon: <><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M9 21V12h6v9"/></> },
  { href: '/training', label: 'Train', icon: <><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/></> },
  { href: '/match', label: 'Match', icon: <><circle cx="12" cy="12" r="9"/><path d="M12 3c3 3 3 6 0 9s-3 6 0 9"/><path d="M3 12h18"/></> },
  { href: '/fitness', label: 'Fitness', icon: <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/> },
  { href: '/technique', label: 'Skills', icon: <><path d="M14.5 10c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5z"/><path d="M20.5 10H19V8.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/><path d="M9.5 14c.83 0 1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5S8 21.33 8 20.5v-5c0-.83.67-1.5 1.5-1.5z"/><path d="M3.5 14H5v1.5c0 .83-.67 1.5-1.5 1.5S2 16.33 2 15.5 2.67 14 3.5 14z"/><path d="M14 14.5c0-.83.67-1.5 1.5-1.5h5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-5c-.83 0-1.5-.67-1.5-1.5z"/><path d="M15.5 19H14v1.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"/><path d="M10 9.5C10 8.67 9.33 8 8.5 8h-5C2.67 8 2 8.67 2 9.5S2.67 11 3.5 11h5c.83 0 1.5-.67 1.5-1.5z"/><path d="M8.5 5H10V3.5C10 2.67 9.33 2 8.5 2S7 2.67 7 3.5 7.67 5 8.5 5z"/></> },
  { href: '/mental', label: 'Mental', icon: <><path d="M12 2a7 7 0 0 1 7 7c0 3.5-2 5.5-3.5 7H8.5C7 16.5 5 14.5 5 9a7 7 0 0 1 7-7z"/><path d="M8.5 21h7M9 18v3M15 18v3"/></> },
]

export function Nav() {
  const pathname = usePathname()
  return (
    <nav className="app-nav">
      {links.map(l => (
        <Link key={l.href} href={l.href} className={`nav-btn${pathname === l.href ? ' active' : ''}`}>
          <svg viewBox="0 0 24 24">{l.icon}</svg>
          {l.label}
        </Link>
      ))}
    </nav>
  )
}
