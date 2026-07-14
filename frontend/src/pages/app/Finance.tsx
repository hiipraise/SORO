import { Link } from 'react-router-dom'
import {
  TrendingDown, TrendingUp, ArrowRight, Wallet, Target,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import PageTransition from '@/components/layout/PageTransition'
import Card from '@/components/shared/Card'
import Button from '@/components/shared/Button'
import ProgressBar from '@/components/shared/ProgressBar'
import AdSlot from '@/components/ui/AdSlot'
import { getDebts, getGoals } from '@/lib/api'
import { motion } from 'framer-motion'
import { staggerContainer, staggerItem } from '@/lib/motion'

interface DebtData {
  id: string
  label: string
  amount: number
  amount_paid: number
  status: string
  due_date?: string
}

interface GoalData {
  id: string
  title: string
  target_amount: number
  current_amount: number
  status: string
  priority: string
  progress: number
}

export default function FinanceDashboard() {
  const { data: debtsPage, isLoading: debtsLoading } = useQuery({
    queryKey: ['debts'],
    queryFn: () => getDebts(),
  })

  const { data: goalsPage, isLoading: goalsLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: () => getGoals(),
  })

  const debts = (debtsPage?.items ?? []) as DebtData[]
  const goals = (goalsPage?.items ?? []) as GoalData[]

  const isLoading = debtsLoading || goalsLoading
  const totalDebt = debts.reduce((sum, d) => sum + (d.amount - d.amount_paid), 0)
  const activeGoals = goals.filter((g) => g.status === 'active')
  const completedGoals = goals.filter((g) => g.status === 'completed')

  const getDebtSeverity = () => {
    if (totalDebt === 0) return 'none'
    if (totalDebt < 50000) return 'low'
    if (totalDebt < 200000) return 'medium'
    return 'high'
  }

  const severityColor = {
    none: 'text-green-400',
    low: 'text-soro-gold',
    medium: 'text-soro-ember',
    high: 'text-soro-danger',
  }

  const severityLabel = {
    none: 'No outstanding debt',
    low: 'Managing well',
    medium: 'Keep going',
    high: 'Heavy load — one step at a time',
  }

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-soro-mist">
              Finance
            </h1>
            <p className="text-sm text-soro-fade mt-1">
              Track your journey to financial footing
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-2 gap-3"
        >
          <motion.div variants={staggerItem}>
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown size={18} className="text-soro-danger" />
                <span className="text-xs text-soro-fade uppercase tracking-wider">Remaining debt</span>
              </div>
              <p className={`text-2xl font-display font-bold ${severityColor[getDebtSeverity()]}`}>
                ₦{totalDebt.toLocaleString()}
              </p>
              <p className="text-xs text-soro-fade mt-1">
                {severityLabel[getDebtSeverity()]}
              </p>
            </Card>
          </motion.div>

          <motion.div variants={staggerItem}>
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={18} className="text-green-400" />
                <span className="text-xs text-soro-fade uppercase tracking-wider">Active goals</span>
              </div>
              <p className="text-2xl font-display font-bold text-soro-mist">
                {activeGoals.length}
              </p>
              <p className="text-xs text-soro-fade mt-1">
                {completedGoals.length > 0
                  ? `${completedGoals.length} completed ✨`
                  : 'No goals completed yet'}
              </p>
            </Card>
          </motion.div>
        </motion.div>

        {/* Quick Actions */}
        <div className="flex gap-3">
          <Link to="/app/finance/debt" className="flex-1">
            <Button slideFill variant="secondary" fullWidth leftIcon={<Wallet size={16} />}>
              Manage debts
            </Button>
          </Link>
          <Link to="/app/finance/goals" className="flex-1">
            <Button slideFill fullWidth leftIcon={<Target size={16} />}>
              Manage goals
            </Button>
          </Link>
        </div>

        {/* Recent Debts */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-display font-semibold text-soro-mist">
              Recent debts
            </h2>
            <Link
              to="/app/finance/debt"
              className="text-xs text-soro-ember hover:underline flex items-center gap-1"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {isLoading ? (
            <div className="glass-card rounded-2xl p-5 animate-pulse">
              <div className="h-4 bg-soro-surface rounded w-3/4" />
            </div>
          ) : debts.length === 0 ? (
            <Link
              to="/app/finance/debt"
              className="block glass-card rounded-2xl p-5 border-soro-earth/10 hover:border-soro-earth/20 transition-all"
            >
              <div className="flex items-center gap-3">
                <Wallet size={20} className="text-soro-fade" />
                <p className="text-sm text-soro-fade">
                  No debts tracked yet.{' '}
                  <span className="text-soro-ember hover:underline">Add your first debt</span>
                </p>
              </div>
            </Link>
          ) : (
            <div className="space-y-2">
              {debts.slice(0, 3).map((debt) => (
                <Link
                  key={debt.id}
                  to="/app/finance/debt"
                  className="block glass-card rounded-2xl p-4 hover:border-soro-earth/20 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-soro-mist">{debt.label}</span>
                    <span className={`text-xs font-mono font-semibold ${debt.status === 'cleared' ? 'text-green-400' : 'text-soro-fade'}`}>
                      ₦{(debt.amount - debt.amount_paid).toLocaleString()}
                    </span>
                  </div>
                  <ProgressBar
                    progress={debt.amount > 0 ? (debt.amount_paid / debt.amount) * 100 : 0}
                    size="sm"
                    color={debt.status === 'cleared' ? 'safe' : 'ember'}
                  />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Active Goals */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-display font-semibold text-soro-mist">
              Active goals
            </h2>
            <Link
              to="/app/finance/goals"
              className="text-xs text-soro-ember hover:underline flex items-center gap-1"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {isLoading ? (
            <div className="glass-card rounded-2xl p-5 animate-pulse">
              <div className="h-4 bg-soro-surface rounded w-3/4" />
            </div>
          ) : activeGoals.length === 0 ? (
            <Link
              to="/app/finance/goals"
              className="block glass-card rounded-2xl p-5 border-soro-earth/10 hover:border-soro-earth/20 transition-all"
            >
              <div className="flex items-center gap-3">
                <Target size={20} className="text-soro-fade" />
                <p className="text-sm text-soro-fade">
                  No goals yet.{' '}
                  <span className="text-soro-ember hover:underline">Create your first micro-goal</span>
                </p>
              </div>
            </Link>
          ) : (
            <div className="space-y-2">
              {activeGoals.slice(0, 3).map((goal) => (
                <Link
                  key={goal.id}
                  to="/app/finance/goals"
                  className="block glass-card rounded-2xl p-4 hover:border-soro-ember/20 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-soro-mist">{goal.title}</span>
                    <span className="text-xs font-mono text-soro-fade">
                      ₦{goal.current_amount.toLocaleString()} / ₦{goal.target_amount.toLocaleString()}
                    </span>
                  </div>
                  <ProgressBar progress={goal.progress} size="sm" color="gold" showPercent />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Ad */}
        <AdSlot className="mt-8" />
      </div>
    </PageTransition>
  )
}
