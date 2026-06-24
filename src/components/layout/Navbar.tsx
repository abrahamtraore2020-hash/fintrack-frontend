'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, Wallet, Menu, Sun, Moon, Search } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useAppStore } from '@/store/useAppStore'
import { cn } from '@/lib/utils'
import { SearchModal } from '@/components/ui/SearchModal'

export function Navbar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const { unreadCount, lang, setLang, toggleSidebar, user } = useAppStore()
  const [searchOpen, setSearchOpen] = useState(false)

  const navLinks = [
    { href: '/dashboard',    label: 'Dashboard' },
    { href: '/coffres',      label: 'Coffres' },
    { href: '/objectifs',    label: 'Objectifs' },
    { href: '/integrations', label: 'Intégrations' },
    { href: '/notifications',label: 'Alertes' },
    { href: '/pricing',      label: 'Plans' },
  ]

  const initials = user?.firstName && user?.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`
    : 'FT'

  return (
    <header className="h-14 bg-white dark:bg-dark-card border-b border-gray-100 dark:border-dark-border flex items-center px-4 gap-3 sticky top-0 z-50">
      {/* Sidebar toggle — desktop only */}
      <button onClick={toggleSidebar} className="hidden md:flex p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
        <Menu size={18} />
      </button>

      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-2">
        <div className="w-7 h-7 bg-gold rounded-lg flex items-center justify-center">
          <Wallet size={14} className="text-[#1A1A2E]" />
        </div>
        <span className="font-bold text-gray-800 dark:text-white text-sm">Fin<span className="text-gold">Track</span></span>
      </Link>

      {/* Desktop nav links */}
      <nav className="hidden md:flex items-center gap-1 flex-1 ml-2">
        {navLinks.map(l => (
          <Link key={l.href} href={l.href}
            className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              pathname === l.href
                ? 'bg-gold-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-dark-bg dark:hover:text-gray-300')}>
            {l.label}
          </Link>
        ))}
      </nav>

      {/* Search bar */}
      <button onClick={() => setSearchOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-dark-bg text-gray-400 hover:text-gray-600 text-xs transition-colors ml-auto">
        <Search size={13} />
        <span>Rechercher...</span>
        <span className="ml-2 text-[10px] bg-white dark:bg-dark-card px-1.5 py-0.5 rounded border border-gray-200 dark:border-dark-border">⌘K</span>
      </button>

      {/* Right actions */}
      <div className="flex items-center gap-1.5 md:ml-3 ml-auto">
        <button onClick={() => setSearchOpen(true)} className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-bg text-gray-500">
          <Search size={16} />
        </button>
        {/* Lang switcher — hidden on mobile */}
        <div className="hidden md:flex bg-gray-100 dark:bg-dark-bg rounded-lg p-0.5">
          {(['fr', 'en'] as const).map(l => (
            <button key={l} onClick={() => setLang(l)}
              className={cn('px-2 py-1 rounded text-xs font-medium transition-all',
                lang === l ? 'bg-white dark:bg-dark-card text-gray-800 dark:text-white shadow-sm' : 'text-gray-500')}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Theme toggle */}
        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-bg text-gray-500">
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Notifications */}
        <Link href="/notifications" className="relative p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-bg text-gray-500">
          <Bell size={16} />
          {unreadCount > 0 && (
            <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
          )}
        </Link>

        {/* Avatar */}
        <Link href="/parametres">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gold to-orange-400 flex items-center justify-center text-[10px] font-bold text-[#1A1A2E]">
            {initials}
          </div>
        </Link>
      </div>
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  )
}
