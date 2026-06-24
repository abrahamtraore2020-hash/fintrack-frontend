import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 md:p-5 overflow-y-auto animate-fade-in pb-24 md:pb-5">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
