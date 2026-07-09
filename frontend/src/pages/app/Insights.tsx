import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3,
  TrendingUp,
  Brain,
  Wallet,
  Calendar,
} from 'lucide-react'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  BarChart,
  Bar,
} from 'recharts'
import { useQuery } from '@tanstack/react-query'
import PageTransition from '@/components/layout/PageTransition'
import AdSlot from '@/components/ui/AdSlot'
import CheckinHeatmap from '@/components/ui/CheckinHeatmap'
import { useCheckinStore, MOOD_LABELS } from '@/stores/checkinStore'
import { getMoodInsights } from '@/lib/api'

const moodScore: Record<string, number> = {
  at_limit: 1,
  managing: 2,
  mixed: 3,
  okay: 4,
  good: 5,
}

function buildDayLabels(days: number): string[] {
  const labels: string[] = []
  for (let i = 0; i < days; i++) {
    const d = new Date()
    d.setDate(d.getDate() - (days - 1 - i))
    labels.push(
      days <= 7
        ? d.toLocaleDateString('en-US', { weekday: 'short' })
        : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    )
  }
  return labels
}

function formatDateStr(date: Date): string {
  return date.toISOString().split('T')[0]
}

interface MoodDataPoint {
  date: string
  mood_state: string
  score: number
}

interface MoodStats {
  total_checkins: number
  average_score: number
  streak: number
}

interface CorrelationData {
  avg_mood_with_financial_stress: number
  avg_mood_without_financial_stress: number
  gap: number
  financial_checkin_count: number
  total_checkin_count: number
}

interface DebtStats {
  total_debt: number
  total_paid: number
  remaining: number
  cleared_count: number
  active_count: number
}

export default function Insights() {
  const { checkinHistory } = useCheckinStore()
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week')
  const [correlation, setCorrelation] = useState<CorrelationData | null>(null)
  const [debtStats, setDebtStats] = useState<DebtStats | null>(null)
  const [financeLoading, setFinanceLoading] = useState(true)

  // Fetch mood insights from server
  const { data: moodResponse, isLoading: moodLoading, isError: moodError } = useQuery({
    queryKey: ['mood-insights'],
    queryFn: getMoodInsights,
  })

  const anyMoodResponse = moodResponse as any
  const moodData: MoodDataPoint[] = anyMoodResponse?.data ?? []
  const moodStats: MoodStats | null = anyMoodResponse?.stats ?? null

  // Fetch finance insights independently
  const { data: financeData } = useQuery({
    queryKey: ['finance-insights'],
    queryFn: async () => {
      const { api } = await import('@/lib/api')
      return api('/insights/finance') as any
    },
    enabled: !!moodStats && ((moodStats.streak ?? 0) > 0 || checkinHistory.length > 0),
  })

  useEffect(() => {
    if (financeData) {
      if (financeData.mood_correlation) {
        setCorrelation(financeData.mood_correlation)
      }
      if (financeData.debt_stats) {
        setDebtStats(financeData.debt_stats)
      }
      setFinanceLoading(false)
    } else if (moodStats && !financeData) {
      const hasAnyData = (moodStats.streak ?? 0) > 0 || checkinHistory.length > 0
      if (!hasAnyData) {
        setFinanceLoading(false)
      }
    }
  }, [financeData, moodStats, checkinHistory.length])

  // Build chart data from server mood data
  const windowDays = timeRange === 'month' ? 30 : 7
  const dayLabels = buildDayLabels(windowDays)
  const chartData = dayLabels.map((label, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (windowDays - 1 - i))
    const dateStr = formatDateStr(date)
    const dp = moodData.find((d) => d.date.startsWith(dateStr))

    return {
      day: label,
      score: dp ? dp.score : null,
      label: dp ? (MOOD_LABELS[dp.mood_state as keyof typeof MOOD_LABELS] ?? dp.mood_state.replace('_', ' ')) : 'No check-in',
    }
  })

  const hasData = chartData.some((d) => d.score !== null)

  // Stats from server
  const totalCheckins = moodStats?.total_checkins ?? checkinHistory.length
  const streak = moodStats?.streak ?? 0
  const averageMood = moodStats?.average_score ?? 0

  const trendDirection =
    chartData.length >= 2 &&
    (chartData[chartData.length - 1].score || 0) >= (chartData[0].score || 0)
      ? 'up'
      : chartData.length >= 2
        ? 'down'
        : 'neutral'

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card rounded-xl px-4 py-3 border-soro-earth/20">
          <p className="text-xs text-soro-fade">{label}</p>
          <p className="text-sm font-semibold text-soro-mist mt-1">
            {payload[0].value ? `Level ${payload[0].value}/5` : 'No data'}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-soro-mist">
            Insights
          </h1>
          <p className="text-sm text-soro-fade mt-1">
            See your patterns over time
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="glass-card rounded-2xl p-4 text-center">
            <p className="text-xs text-soro-fade mb-1">Check-ins</p>
            <p className="text-2xl font-display font-bold text-soro-mist">
              {totalCheckins}
            </p>
          </div>
          <div className="glass-card rounded-2xl p-4 text-center">
            <p className="text-xs text-soro-fade mb-1">Streak</p>
            <p className="text-2xl font-display font-bold text-soro-gold">
              {streak}
            </p>
            <p className="text-[10px] text-soro-fade/60">days</p>
          </div>
          <div className="glass-card rounded-2xl p-4 text-center">
            <p className="text-xs text-soro-fade mb-1">Avg mood</p>
            <p className="text-2xl font-display font-bold text-soro-mist">
              {averageMood > 0 ? averageMood : '—'}
            </p>
            <p className="text-[10px] text-soro-fade/60">/ 5</p>
          </div>
        </div>

        {/* Trend */}
        {hasData && (
          <div className="glass-card rounded-2xl p-4 border-soro-earth/10">
            <div className="flex items-center gap-2">
              <TrendingUp
                size={18}
                className={
                  trendDirection === 'up'
                    ? 'text-green-400'
                    : trendDirection === 'down'
                      ? 'text-soro-danger'
                      : 'text-soro-fade'
                }
              />
              <p className="text-sm text-soro-mist">
                {trendDirection === 'up'
                  ? 'Your mood is trending upward. Keep going.'
                  : trendDirection === 'down'
                    ? 'Things have been heavy. It\'s okay to reach out.'
                    : 'Your mood has been steady.'}
              </p>
            </div>
          </div>
        )}

        {/* Mood Graph */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold text-soro-mist">
              Mood over time
            </h2>
            <div className="flex items-center gap-1">
              {(['week', 'month'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    timeRange === range
                      ? 'bg-soro-ember/10 text-soro-ember'
                      : 'text-soro-fade hover:text-soro-mist'
                  }`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 md:p-6">
            {hasData ? (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#E8834A" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#E8834A" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(139, 94, 60, 0.1)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    interval={timeRange === 'month' ? 4 : 0}
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                  />
                  <YAxis
                    domain={[0, 6]}
                    ticks={[1, 2, 3, 4, 5]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                    tickFormatter={(v) => `${v}/5`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#E8834A"
                    strokeWidth={2}
                    fill="url(#moodGradient)"
                    dot={{ fill: '#E8834A', r: 4, strokeWidth: 0 }}
                    activeDot={{ fill: '#E8834A', r: 6, strokeWidth: 2, stroke: '#0D1117' }}
                    connectNulls
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <BarChart3 size={40} className="text-soro-fade/30 mb-3" />
                <p className="text-sm text-soro-fade">
                  No mood data yet. Start checking in to see your patterns.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Check-in Heatmap (GitHub-style calendar) */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 size={16} className="text-soro-ember" />
            <h2 className="text-lg font-display font-semibold text-soro-mist">
              Check-in calendar
            </h2>
          </div>
          {hasData ? (
            <CheckinHeatmap checkinHistory={checkinHistory} />
          ) : (
            <div className="glass-card rounded-2xl p-6 text-center">
              <Calendar size={24} className="text-soro-fade/30 mx-auto mb-2" />
              <p className="text-sm text-soro-fade">
                Start checking in to build your calendar.
              </p>
            </div>
          )}
        </div>

        {/* Financial Insights */}
        {!financeLoading && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Wallet size={16} className="text-soro-gold" />
              <h2 className="text-lg font-display font-semibold text-soro-mist">
                Financial insights
              </h2>
            </div>

            {debtStats && debtStats.total_debt > 0 && (
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="glass-card rounded-2xl p-4">
                  <p className="text-xs text-soro-fade mb-1">Total debt</p>
                  <p className="text-xl font-display font-bold text-soro-danger">
                    ₦{debtStats.total_debt.toLocaleString()}
                  </p>
                </div>
                <div className="glass-card rounded-2xl p-4">
                  <p className="text-xs text-soro-fade mb-1">Paid off</p>
                  <p className="text-xl font-display font-bold text-green-400">
                    ₦{debtStats.total_paid.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-soro-fade/60">
                    {debtStats.cleared_count} debts cleared
                  </p>
                </div>
              </div>
            )}

            {/* Mood correlation */}
            {correlation && correlation.financial_checkin_count > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-5 border-soro-earth/10"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Brain size={18} className="text-soro-ember" />
                  <h3 className="text-sm font-semibold text-soro-mist">
                    Mood & financial stress
                  </h3>
                </div>

                {/* Comparison bar chart */}
                <div className="mb-4">
                  <ResponsiveContainer width="100%" height={120}>
                    <BarChart
                      data={[
                        {
                          name: 'With financial stress',
                          value: correlation.avg_mood_with_financial_stress,
                          fill: '#C0392B',
                        },
                        {
                          name: 'Without financial stress',
                          value: correlation.avg_mood_without_financial_stress,
                          fill: '#2E8B57',
                        },
                      ]}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(139, 94, 60, 0.1)" horizontal={false} />
                      <XAxis type="number" domain={[0, 5]} tick={{ fill: '#6B7280', fontSize: 11 }} />
                      <YAxis type="category" dataKey="name" tick={{ fill: '#E8EDF2', fontSize: 11 }} width={140} />
                      <Tooltip
                        content={({ active, payload }) =>
                          active && payload && payload.length ? (
                            <div className="glass-card rounded-xl px-3 py-2 border-soro-earth/20">
                              <p className="text-xs text-soro-mist">{payload[0].name}</p>
                              <p className="text-sm font-bold text-soro-mist">{Number(payload[0].value).toFixed(1)} / 5</p>
                            </div>
                          ) : null
                        }
                      />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <p className="text-sm text-soro-fade leading-relaxed">
                  {correlation.gap > 0.5
                    ? 'Your moods tend to be lower on days when you\'re dealing with financial stress. This is normal — and you\'re not alone in it.'
                    : correlation.gap > 0
                      ? 'There\'s a slight difference in your mood around financial topics. Keep tracking — patterns take time to show.'
                      : 'Your mood stays consistent even around financial topics. That\'s real resilience.'}
                </p>

                <p className="text-xs text-soro-fade/60 mt-3">
                  Based on {correlation.financial_checkin_count} check-ins mentioning money or debt
                  out of {correlation.total_checkin_count} total check-ins.
                </p>
              </motion.div>
            )}

            {/* No finance data */}
            {!debtStats && !correlation && (
              <div className="glass-card rounded-2xl p-6 text-center">
                <Wallet size={24} className="text-soro-fade/30 mx-auto mb-2" />
                <p className="text-sm text-soro-fade">
                  Track debts and goals to see how your finances affect your mood.
                </p>
              </div>
            )}
          </div>
        )}

        {/* AI Observation */}
        {hasData && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-2xl p-5 border-soro-earth/10"
          >
            <div className="flex items-center gap-2 mb-3">
              <Brain size={18} className="text-soro-ember" />
              <h3 className="text-sm font-semibold text-soro-mist">
                SORO's observation
              </h3>
            </div>
            <p className="text-sm text-soro-fade leading-relaxed">
              {trendDirection === 'up'
                ? 'Your week has been trending upward. Notice what\'s been helping — the small things matter.'
                : correlation && correlation.gap > 0.5
                  ? 'Your lowest moods often follow financial stress entries. Addressing one may help the other.'
                  : 'Keep showing up. Every check-in is a step forward, even on the hard days.'}
            </p>
          </motion.div>
        )}

        {/* Ad Slot */}
        <AdSlot format="rectangle" className="hidden md:flex" />
      </div>
    </PageTransition>
  )
}
