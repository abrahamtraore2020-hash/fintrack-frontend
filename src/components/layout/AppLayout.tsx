import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { BackgroundDecor } from '@/components/ui/AfricanIllustrations'

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <BackgroundDecor />
      <Navbar />
      <div className="flex flex-1 relative z-10">
        <Sidebar />
        <main className="flex-1 p-4 md:p-5 overflow-y-auto animate-fade-in pb-24 md:pb-5">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
