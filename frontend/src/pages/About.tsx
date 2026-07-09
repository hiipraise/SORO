import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Heart, Shield, Target, Globe, Quote, ArrowRight,
} from 'lucide-react'
import { CRISIS_NUMBER, CRISIS_ORGANIZATION } from '@/lib/crisis'
import CrisisButton from '@/components/ui/CrisisButton'

const values = [
  {
    icon: Heart,
    title: 'Radical honesty',
    desc: 'You don\'t have to perform wellness here. Say how you really dey.',
  },
  {
    icon: Shield,
    title: 'Complete anonymity',
    desc: 'No names, no profiles, no judgment. Just your words.',
  },
  {
    icon: Target,
    title: 'Free forever',
    desc: 'No premium tier. No paywall. No "upgrade to heal."',
  },
  {
    icon: Globe,
    title: 'Built for Nigeria',
    desc: 'The language, the context, the reality — this is yours.',
  },
]

const faqs = [
  {
    q: 'Who is SORO for?',
    a: 'Nigerian youth aged 18–28. Students, fresh graduates, young workers — anyone carrying something they can\'t say out loud.',
  },
  {
    q: 'Is SORO really free?',
    a: 'Yes. 100%. No premium tier. No subscriptions. No "buy crystals to unlock journaling." Ads pay the bills, and they\'re structured to never interrupt your safe spaces.',
  },
  {
    q: 'Is my data private?',
    a: 'Yes. You can use SORO completely anonymously — no email required. Journal entries are private. Community posts are anonymous by design with no usernames attached.',
  },
  {
    q: 'Is SORO a therapy app?',
    a: 'No. SORO is not a replacement for professional mental health care. It\'s a companion — a space to check in, track your patterns, and find daily grounding.',
  },
  {
    q: 'How does the AI reflection work?',
    a: 'After each check-in, SORO\'s AI (powered by Groq) generates a warm, Nigerian-aware response. It\'s not a therapist — it\'s a witness. All processing is done securely server-side.',
  },
  {
    q: 'I\'m in crisis right now. What do I do?',
    a: `Please reach out to ${CRISIS_ORGANIZATION} at ${CRISIS_NUMBER}. Help is available 24/7. There\'s always a crisis button at the bottom-right of every page.`,
  },
]

export default function About() {
  return (
    <div className="min-h-screen bg-soro-deep">
      {/* Simple nav */}
      <header className="fixed top-0 left-0 right-0 z-40 glass-card rounded-none border-x-0 border-t-0">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/soro.png" alt="SORO" className="w-8 h-8" />
            <span className="font-display text-lg font-semibold text-soro-mist">SORO</span>
          </Link>
          <Link
            to="/onboarding"
            className="btn-ember px-4 py-2 rounded-xl text-sm font-semibold"
          >
            Start for free
          </Link>
        </div>
      </header>

      <main className="pt-16">
        {/* Hero */}
        <section className="px-4 py-20 md:py-28 text-center">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl font-display font-bold text-soro-mist mb-4">
                Built in Lagos.{' '}
                <span className="text-gradient">For the ones grinding.</span>
              </h1>
              <p className="text-lg text-soro-fade max-w-xl mx-auto leading-relaxed">
                SORO was created because mental wellness and financial resilience
                shouldn't be luxuries. They're survival tools — and everyone deserves them.
              </p>
            </motion.div>
          </div>
        </section>

        {/* The story */}
        <section className="px-4 py-16 bg-soro-surface/30">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <Quote size={20} className="text-soro-ember" />
              <h2 className="text-xl font-display font-semibold text-soro-mist">The story</h2>
            </div>
            <div className="space-y-4 text-sm text-soro-fade leading-relaxed">
              <p>
                SORO started in a small room in Yaba, Lagos. The kind of room where the rent
                is three months late, the generator just cut, and you're staring at your phone
                wondering how to explain to your mother that you don't have school fees — again.
              </p>
              <p>
                I built SORO because I needed it. I needed somewhere to say "I'm not okay"
                without someone telling me to pray harder. I needed to track my money without
                feeling shame. I needed to see that other people were in the same boat —
                not on Instagram, but in real life.
              </p>
              <p>
                The name SORO means "Speak" in Yoruba. Also "Rise." Both are the point.
              </p>
              <p className="text-soro-mist font-medium">
                You cannot fix someone's finances if their mind is underwater.
                You cannot fix someone's mind if they're drowning financially.
                Both doors lead to the same room.
              </p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="px-4 py-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-display font-bold text-soro-mist text-center mb-12">
              What we believe
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {values.map((v, i) => (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card rounded-2xl p-6"
                >
                  <v.icon size={24} className="text-soro-ember mb-3" />
                  <h3 className="font-display font-semibold text-soro-mist mb-1">{v.title}</h3>
                  <p className="text-sm text-soro-fade">{v.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="px-4 py-20 bg-soro-surface/30">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-display font-bold text-soro-mist text-center mb-12">
              Common questions
            </h2>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <motion.details
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card rounded-2xl overflow-hidden group"
                >
                  <summary className="px-5 py-4 text-sm font-medium text-soro-mist cursor-pointer hover:text-soro-ember transition-colors list-none flex items-center justify-between">
                    {faq.q}
                    <ArrowRight size={16} className="text-soro-fade group-open:rotate-90 transition-transform shrink-0" />
                  </summary>
                  <div className="px-5 pb-4">
                    <p className="text-sm text-soro-fade leading-relaxed">{faq.a}</p>
                  </div>
                </motion.details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 py-20 text-center">
          <div className="max-w-lg mx-auto">
            <h2 className="text-2xl font-display font-bold text-soro-mist mb-3">
              You don't have to carry it alone
            </h2>
            <p className="text-sm text-soro-fade mb-6">
              SORO is free. Anonymous. Built for you. 60 seconds to start.
            </p>
            <Link
              to="/onboarding"
              className="btn-ember inline-flex items-center gap-2 px-8 py-3 rounded-xl text-base font-semibold"
            >
              Start now
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-soro-earth/10 px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs text-soro-fade">
            Built in Lagos by someone who lived it.
            <br />
            &copy; {new Date().getFullYear()} SORO. All rights reserved.
          </p>
        </div>
      </footer>

      <CrisisButton />
    </div>
  )
}
