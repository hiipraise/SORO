import { NavLink } from 'react-router-dom'
import { Home, PenLine, BarChart3, BookOpen, Settings } from 'lucide-react'

const tabs = [
  { to: '/app/home', label: 'Home', icon: Home },
  { to: '/app/checkin', label: 'Check-in', icon: PenLine },
  { to: '/app/journal', label: 'Journal', icon: BookOpen },
  { to: '/app/insights', label: 'Insights', icon: BarChart3 },
  { to: '/app/settings', label: 'Settings', icon: Settings },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
      <div className="glass-card rounded-none border-x-0 border-b-0">
        <div className="flex items-center justify-around h-16 px-2">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'text-soro-ember'
                    : 'text-soro-fade hover:text-soro-mist'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <tab.icon size={20} />
                  <span className={`text-[10px] font-medium ${
                    isActive ? 'text-soro-ember' : ''
                  }`}>
                    {tab.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}
