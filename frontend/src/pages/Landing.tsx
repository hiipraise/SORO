import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Shield, Brain, LineChart, Heart, Sparkles, Users } from 'lucide-react'
import InstallPrompt from '@/components/pwa/InstallPrompt'
import CrisisButton from '@/components/ui/CrisisButton'

const problemStatements = [
  {
    icon: Brain,
    text: "1 in 4 Nigerian youth experience depression — but almost none have somewhere to say it.",
  },
  {
    icon: LineChart,
    text: "72% of Nigerians under 35 live below the poverty line. Mental health is a luxury most can't afford.",
  },
  {
    icon: Heart,
    text: "Therapy is ₦10,000–₦30,000 per session. Most people can't afford to eat that and heal.",
  },
]

const howItWorks = [
  {
    step: '01',
    title: 'Speak it',
    description: 'Check in daily. Say how you dey — in your own words.',
    icon: Sparkles,
  },
  {
    step: '02',
    title: 'Face it',
    description: 'Get a warm AI reflection built for the Nigerian experience.',
    icon: Brain,
  },
  {
    step: '03',
    title: 'Rise',
    description: 'Track your mood, build financial goals, and grow — daily.',
    icon: ArrowRight,
  },
]

const audienceCards = [
  { title: 'Student', description: 'Juggling school, family pressure, and uncertainty about tomorrow.' },
  { title: 'Young Grad', description: 'First job, low pay, high expectations from everyone.' },
  { title: 'In Debt', description: 'Small money, big problems. Trying to find a way out.' },
  { title: 'Grieving', description: 'Lost someone. Lost direction. Need space to process.' },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-soro-deep">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-40 glass-card rounded-none border-x-0 border-t-0">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/soro.png" alt="SORO" className="w-8 h-8" />
            <span className="font-display text-lg font-semibold text-soro-mist">
              SORO
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/auth/login"
              className="text-sm text-soro-fade hover:text-soro-mist transition-colors px-3 py-1.5"
            >
              Log in
            </Link>
            <Link
              to="/auth/signup"
              className="btn-ember px-4 py-2 rounded-xl text-sm font-semibold"
            >
              Start for free
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* ─── Hero ─── */}
        <section className="relative min-h-[80dvh] flex items-center justify-center px-4 pt-20 pb-16 overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-soro-ember/5 via-transparent to-soro-deep pointer-events-none" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-soro-ember/3 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-soro-earth/3 rounded-full blur-3xl" />

          <div className="relative max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-soro-safe/20 text-green-400 text-xs font-medium mb-6">
                <Heart size={12} />
                Free. Anonymous. Built for you.
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-soro-mist leading-tight mb-6">
                You dey carry
                <br />
                <span className="text-gradient">something heavy</span> today?
              </h1>

              <p className="text-lg md:text-xl text-soro-fade max-w-2xl mx-auto mb-8 leading-relaxed">
                SORO is a safe, anonymous space to process pain, track progress,
                and build financial footing — daily. Built for Nigerian youth,
                by someone who lived it.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  to="/onboarding"
                  className="btn-ember px-8 py-3 rounded-xl text-base font-semibold inline-flex items-center gap-2"
                >
                  Start — no sign up needed
                  <ArrowRight size={18} />
                </Link>
                <Link
                  to="/auth/signup"
                  className="border border-soro-earth/30 text-soro-mist px-8 py-3 rounded-xl text-base font-semibold hover:bg-soro-surface transition-all"
                >
                  Create account
                </Link>
              </div>

              <p className="text-xs text-soro-fade/60 mt-4">
                60 seconds to start. No email required.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ─── The Problem ─── */}
        <section className="px-4 py-20 md:py-28">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-display font-bold text-soro-mist mb-3">
                The hard truths nobody talks about
              </h2>
              <p className="text-soro-fade text-base max-w-lg mx-auto">
                In Nigeria, mental health is a conversation we don't have — and
                financial stress makes it worse.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {problemStatements.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="glass-card rounded-2xl p-6"
                >
                  <div className="w-10 h-10 rounded-xl bg-soro-ember/10 flex items-center justify-center mb-4">
                    <item.icon size={20} className="text-soro-ember" />
                  </div>
                  <p className="text-sm text-soro-mist leading-relaxed">
                    {item.text}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── What SORO Does ─── */}
        <section className="px-4 py-20 bg-soro-surface/30">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-display font-bold text-soro-mist mb-3">
                Two doors. One room.
              </h2>
              <p className="text-soro-fade text-base max-w-lg mx-auto">
                You can't fix someone's finances if their mind is underwater.
                You can't fix someone's mind if they're drowning financially.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="glass-card rounded-2xl p-6 md:p-8 border-soro-safe/20">
                <Shield size={28} className="text-green-400 mb-4" />
                <h3 className="text-lg font-display font-semibold text-soro-mist mb-2">
                  Mental Wellness
                </h3>
                <ul className="space-y-2 text-sm text-soro-fade">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">→</span>
                    Anonymous daily check-ins
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">→</span>
                    AI reflection built for the Nigerian experience
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">→</span>
                    Private journal with mood tracking
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">→</span>
                    Daily anchors for grounding
                  </li>
                </ul>
              </div>

              <div className="glass-card rounded-2xl p-6 md:p-8 border-soro-gold/20">
                <LineChart size={28} className="text-soro-gold mb-4" />
                <h3 className="text-lg font-display font-semibold text-soro-mist mb-2">
                  Financial Resilience
                </h3>
                <ul className="space-y-2 text-sm text-soro-fade">
                  <li className="flex items-start gap-2">
                    <span className="text-soro-gold mt-0.5">→</span>
                    Debt tracking with zero judgment
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-soro-gold mt-0.5">→</span>
                    Micro-goals with full-screen celebrations
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-soro-gold mt-0.5">→</span>
                    Curated earning paths for students
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ─── How It Works ─── */}
        <section className="px-4 py-20 md:py-28">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-display font-bold text-soro-mist mb-3">
                How it works
              </h2>
              <p className="text-soro-fade text-base">
                3 steps. 60 seconds. No pressure.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {howItWorks.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-soro-ember/10 flex items-center justify-center mx-auto mb-4">
                    <item.icon size={28} className="text-soro-ember" />
                  </div>
                  <span className="text-xs font-mono text-soro-ember mb-1 block">
                    {item.step}
                  </span>
                  <h3 className="text-lg font-display font-semibold text-soro-mist mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-soro-fade">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Who It's For ─── */}
        <section className="px-4 py-20 bg-soro-surface/30">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-display font-bold text-soro-mist mb-3">
                Who SORO is for
              </h2>
              <p className="text-soro-fade text-base">
                Built for Nigerian youth who are carrying something.
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              {audienceCards.map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="glass-card rounded-2xl p-5 text-center"
                >
                  <Users size={24} className="text-soro-ember mx-auto mb-3" />
                  <h3 className="font-display font-semibold text-soro-mist mb-1">
                    {card.title}
                  </h3>
                  <p className="text-xs text-soro-fade leading-relaxed">
                    {card.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CTA ─── */}
        <section className="px-4 py-20 md:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl md:text-4xl font-display font-bold text-soro-mist mb-4">
                E go better —{' '}
                <span className="text-gradient">but first, say it</span>
              </h2>
              <p className="text-soro-fade text-base mb-8 max-w-lg mx-auto">
                You don't have to carry it alone. SORO is free, anonymous, and
                built for you.
              </p>
              <Link
                to="/onboarding"
                className="btn-ember px-8 py-3 rounded-xl text-base font-semibold inline-flex items-center gap-2"
              >
                Start now — it's free
                <ArrowRight size={18} />
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      {/* ─── Footer ─── */}
      <footer className="border-t border-soro-earth/10 px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src="/soro.png" alt="SORO" className="w-6 h-6" />
            <span className="font-display text-base font-semibold text-soro-mist">
              SORO
            </span>
          </div>
          <p className="text-xs text-soro-fade max-w-md mx-auto leading-relaxed">
            Built in Lagos by someone who lived it.
            <br />
            Free forever. No premium. No paywall. Just a hand when you need it.
          </p>
          <div className="mt-6 text-xs text-soro-fade/50">
            &copy; {new Date().getFullYear()} SORO. All rights reserved.
          </div>
        </div>
      </footer>

      {/* PWA Install Prompt */}
      <InstallPrompt />

      {/* Crisis Button */}
      <CrisisButton />
    </div>
  )
}
