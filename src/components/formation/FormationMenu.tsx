'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

export function FormationMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const close = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false)
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const logout = async () => {
    await fetch('/api/formation/logout', { method: 'POST' })
    window.location.href = '/formation/acces'
  }

  const item = 'block w-full px-4 py-2.5 text-left hover:bg-lion-gold/15'
  return (
    <div ref={ref} className="relative">
      <button
        aria-label="Menu"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-lg border border-lion-blue/20 hover:bg-lion-blue/5"
      >
        <span className="block h-0.5 w-5 bg-lion-blue" />
        <span className="block h-0.5 w-5 bg-lion-blue" />
        <span className="block h-0.5 w-5 bg-lion-blue" />
      </button>
      {open && (
        <div className="absolute right-0 z-40 mt-2 w-56 overflow-hidden rounded-xl border border-lion-blue/15 bg-white shadow-lg">
          <Link href="/formation" className={item} onClick={() => setOpen(false)}>📚 Mes formations</Link>
          <Link href="/formation/profil" className={item} onClick={() => setOpen(false)}>👤 Mon profil</Link>
          <button onClick={logout} className={`${item} border-t border-lion-blue/10 text-red-600`}>🚪 Se déconnecter</button>
        </div>
      )}
    </div>
  )
}
