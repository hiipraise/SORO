import { NavLink } from 'react-router-dom'
import {
  Home,
  PenLine,
  BookOpen,
  BarChart3,
  Anchor,
  Settings,
  MessageSquare,
  Heart,
  Sparkles,
  Wallet,
  Target,
  Users,
} from 'lucide-react'

const mainNav = [
  { to: '/app/home', label: 'Home', icon: Home },
  { to: '/app/checkin', label: 'Check-in', icon: PenLine },
  { to: '/app/reflect', label: 'Reflect', icon: Sparkles },
  { to: '/app/journal', label: 'Journal', icon: BookOpen },
  { to: '/app/insights', label: 'Insights', icon: BarChart3 },
  { to: '/app/anchor', label: 'Anchor', icon: Anchor },
  { to: '/app/settings', label: 'Settings', icon: Settings },
]

const financeNav = [
  { to: '/app/finance', label: 'Finance', icon: Wallet },
  { to: '/app/finance/debt', label: 'Debt Tracker', icon: Target },
  { to: '/app/finance/goals', label: 'Micro-Goals', icon: Sparkles },
]

const communityNav = [
  { to: '/app/community', label: 'Vent Wall', icon: MessageSquare },
  { to: '/app/circles', label: 'Peer Circles', icon: Users },
]

export default function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-64 h-full fixed left-0 top-0 z-30 border-r border-soro-earth/10 bg-soro-deep/95 backdrop-blur-sm">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-soro-earth/10">
        <NavLink to="/app/home" className="flex items-center gap-2">
          <img src="/soro.png" alt="SORO" className="w-8 h-8" />
          <span className="font-display text-lg font-semibold text-soro-mist">
            SORO
          </span>
        </NavLink>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="px-3 text-xs font-medium text-soro-fade uppercase tracking-wider mb-2">
          Main
        </p>
        <div className="flex flex-col gap-0.5">
          {mainNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-soro-ember/10 text-soro-ember'
                    : 'text-soro-fade hover:text-soro-mist hover:bg-soro-surface/50'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </div>

        <p className="px-3 text-xs font-medium text-soro-fade uppercase tracking-wider mt-6 mb-2">
          Finance
        </p>
        <div className="flex flex-col gap-0.5">
          {financeNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-soro-ember/10 text-soro-ember'
                    : 'text-soro-fade hover:text-soro-mist hover:bg-soro-surface/50'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </div>

        <p className="px-3 text-xs font-medium text-soro-fade uppercase tracking-wider mt-6 mb-2">
          Community
        </p>
        <div className="flex flex-col gap-0.5">
          {communityNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-soro-ember/10 text-soro-ember'
                    : 'text-soro-fade hover:text-soro-mist hover:bg-soro-surface/50'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-soro-earth/10">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-soro-safe/20">
          <Heart size={14} className="text-green-400" />
          <p className="text-xs text-soro-fade">
            You're not alone in this.
          </p>
        </div>
      </div>
    </aside>
  )
}
