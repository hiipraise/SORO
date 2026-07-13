import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { NavLink } from 'react-router-dom'

const mobileNavItems = [
  { to: '/app/home', label: 'Home' },
  { to: '/app/checkin', label: 'Check-in' },
  { to: '/app/reflect', label: 'Reflect' },
  { to: '/app/journal', label: 'Journal' },
  { to: '/app/insights', label: 'Insights' },
  { to: '/app/anchor', label: 'Anchor' },
  { to: '/app/finance', label: 'Finance' },
  { to: '/app/settings', label: 'Settings' },
]

export default function TopBar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <>
      {/* Top Bar */}
      <header className="sticky top-0 z-30 md:hidden">
        <div className="glass-card rounded-none border-x-0 border-t-0 px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-soro-mist">{getGreeting()}</p>
            <p className="text-xs text-soro-fade">How you dey today?</p>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-soro-fade hover:text-soro-mist hover:bg-soro-surface transition-colors"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 md:hidden"
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative bg-soro-surface border-b border-soro-earth/20 rounded-b-2xl mx-2 mt-2 p-4">
              <div className="flex flex-col gap-1">
                {mobileNavItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-soro-ember/10 text-soro-ember'
                          : 'text-soro-fade hover:text-soro-mist hover:bg-soro-surface/50'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
