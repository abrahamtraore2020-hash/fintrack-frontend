import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, Currency, Lang, Notification, Coffre, Objectif, Account, Transaction } from '@/types'

interface AppState {
  // Auth
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  logout: () => void

  // Préférences
  currency: Currency
  lang: Lang
  setCurrency: (c: Currency) => void
  setLang: (l: Lang) => void

  // Notifications
  notifications: Notification[]
  unreadCount: number
  addNotification: (n: Notification) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void

  // Coffres
  coffres: Coffre[]
  setCoffres: (coffres: Coffre[]) => void
  addCoffre: (c: Coffre) => void
  deleteCoffre: (id: string) => void
  updateCoffre: (id: string, data: Partial<Coffre>) => void

  // Objectifs
  objectifs: Objectif[]
  setObjectifs: (objectifs: Objectif[]) => void
  addObjectif: (o: Objectif) => void
  deleteObjectif: (id: string) => void

  // Comptes / Intégrations
  accounts: (Account & { visible?: boolean })[]
  setAccounts: (accounts: (Account & { visible?: boolean })[]) => void
  addAccount: (a: Account & { visible?: boolean }) => void
  deleteAccount: (id: string) => void
  toggleAccountVisible: (id: string) => void

  // Transactions
  transactions: Transaction[]
  setTransactions: (txs: Transaction[]) => void
  addTransactions: (txs: Transaction[]) => void

  // UI
  sidebarOpen: boolean
  toggleSidebar: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      logout: () => set({ user: null, isAuthenticated: false, coffres: [], objectifs: [], accounts: [], transactions: [] }),

      currency: 'XOF',
      lang: 'fr',
      setCurrency: (currency) => set({ currency }),
      setLang: (lang) => set({ lang }),

      notifications: [],
      unreadCount: 0,
      addNotification: (n) => set((s) => ({ notifications: [n, ...s.notifications], unreadCount: s.unreadCount + 1 })),
      markAsRead: (id) => set((s) => ({ notifications: s.notifications.map(n => n.id === id ? { ...n, isRead: true } : n), unreadCount: Math.max(0, s.unreadCount - 1) })),
      markAllAsRead: () => set((s) => ({ notifications: s.notifications.map(n => ({ ...n, isRead: true })), unreadCount: 0 })),

      coffres: [],
      setCoffres: (coffres) => set({ coffres }),
      addCoffre: (c) => set((s) => ({ coffres: [...s.coffres, c] })),
      deleteCoffre: (id) => set((s) => ({ coffres: s.coffres.filter(c => c.id !== id) })),
      updateCoffre: (id, data) => set((s) => ({ coffres: s.coffres.map(c => c.id === id ? { ...c, ...data } : c) })),

      objectifs: [],
      setObjectifs: (objectifs) => set({ objectifs }),
      addObjectif: (o) => set((s) => ({ objectifs: [...s.objectifs, o] })),
      deleteObjectif: (id) => set((s) => ({ objectifs: s.objectifs.filter(o => o.id !== id) })),

      accounts: [],
      setAccounts: (accounts) => set({ accounts }),
      addAccount: (a) => set((s) => ({ accounts: [...s.accounts, a] })),
      deleteAccount: (id) => set((s) => ({ accounts: s.accounts.filter(a => a.id !== id) })),
      toggleAccountVisible: (id) => set((s) => ({ accounts: s.accounts.map(a => a.id === id ? { ...a, visible: !a.visible } : a) })),

      transactions: [],
      setTransactions: (transactions) => set({ transactions }),
      addTransactions: (txs) => set((s) => ({ transactions: [...txs, ...s.transactions] })),

      sidebarOpen: true,
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
    }),
    {
      name: 'fintrack-store-v2',
      partialize: (s) => ({ currency: s.currency, lang: s.lang, coffres: s.coffres, objectifs: s.objectifs, accounts: s.accounts, transactions: s.transactions }),
    }
  )
)
