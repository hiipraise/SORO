import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'
import TopBar from './TopBar'
import CrisisButton from '@/components/ui/CrisisButton'
import OfflineBanner from '@/components/pwa/OfflineBanner'
import UpdatePrompt from '@/components/pwa/UpdatePrompt'

export default function AppShell() {
  return (
    <div className="min-h-screen bg-soro-deep">
      {/* PWA — online/offline state & update prompt */}
      <OfflineBanner />
      <UpdatePrompt />

      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Top Bar */}
      <TopBar />

      {/* Main Content */}
      <main className="md:ml-64 pb-20 md:pb-0 pt-14 md:pt-0 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-4 md:py-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <BottomNav />

      {/* Crisis Button — always visible */}
      <CrisisButton />
    </div>
  )
}
