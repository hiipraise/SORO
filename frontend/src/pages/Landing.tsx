import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Menu,
  X,
  Shield,
  Brain,
  LineChart,
  Heart,
  Sparkles,
} from "lucide-react";
import InstallPrompt from "@/components/pwa/InstallPrompt";
import CrisisButton from "@/components/ui/CrisisButton";
import Card from "@/components/shared/Card";
import ProblemInfographic from "@/components/shared/ProblemInfographic";
import HowItWorksInfographic from "@/components/shared/HowItWorksInfographic";
import HeroMosaic from "@/components/shared/HeroMosaic";
import {
  ScribbleCircle,
  ScribbleUnderline,
  MarkerHighlightBehind,
} from "@/components/shared/ScribbleHighlight";
import {
  StudentAvatar,
  GradAvatar,
  DebtAvatar,
  GrievingAvatar,
} from "@/components/ui/PersonaAvatars";
import { staggerContainer, staggerItem } from "@/lib/motion";

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
];

const howItWorks = [
  {
    step: "01",
    title: "Speak it",
    description: "Check in daily. Say how you dey — in your own words.",
    icon: Sparkles,
  },
  {
    step: "02",
    title: "Face it",
    description: "Get a warm AI reflection built for the Nigerian experience.",
    icon: Brain,
  },
  {
    step: "03",
    title: "Rise",
    description: "Track your mood, build financial goals, and grow — daily.",
    icon: ArrowRight,
  },
];

const audienceCards = [
  {
    title: "Student",
    description:
      "Juggling school, family pressure, and uncertainty about tomorrow.",
    Avatar: StudentAvatar,
    image: "student.jpg",
    fallbackBg: "from-soro-ember/20 to-soro-ember/5",
    span: "md:row-span-2",
  },
  {
    title: "Young Grad",
    description: "First job, low pay, high expectations from everyone.",
    Avatar: GradAvatar,
    image: "young_grad.jpg",
    fallbackBg: "from-soro-gold/15 to-soro-gold/5",
    span: "",
  },
  {
    title: "Grieving",
    description: "Lost someone. Lost direction. Need space to process.",
    Avatar: GrievingAvatar,
    image: "grieving.jpg",
    fallbackBg: "from-soro-info/15 to-soro-info/5",
    span: "md:row-span-2",
  },
  {
    title: "In Debt",
    description: "Small money, big problems. Trying to find a way out.",
    Avatar: DebtAvatar,
    image: "in_debt.jpg",
    fallbackBg: "from-soro-earth/20 to-soro-earth/5",
    span: "",
  },
];

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-soro-deep">
      {/* Floating Navigation */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-40 w-[min(90vw,900px)] rounded-full bg-soro-surface/80 backdrop-blur-xl border border-soro-earth/15 shadow-lg shadow-black/20">
        <div className="flex items-center justify-between px-4 sm:px-6 py-2.5">
          <div className="flex items-center gap-2 shrink-0">
            <img src="/soro.png" alt="SORO" className="w-7 h-7 md:w-8 md:h-8" />
            <span className="font-display text-base md:text-lg font-semibold text-soro-mist">
              SORO
            </span>
          </div>

          {/* Desktop nav links */}
          <nav className="hidden sm:flex items-center gap-2">
            <Link
              to="/auth/login"
              className="btn-ember px-3 py-1.5 rounded-full text-sm"
            >
              Log in
            </Link>
            <Link
              to="/auth/signup"
              className="btn-ember px-4 py-2 rounded-full text-sm font-semibold"
            >
              Start for free
            </Link>
          </nav>

          {/* Mobile hamburger toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2 rounded-full text-soro-fade hover:text-soro-mist hover:bg-soro-surface/50 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile dropdown menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="fixed top-[72px] left-1/2 -translate-x-1/2 z-40 w-[min(90vw,400px)] rounded-2xl bg-soro-deep/90 backdrop-blur-xl border border-soro-earth/15 shadow-lg shadow-black/20 p-2 sm:hidden"
          >
            <div className="flex flex-col gap-1">
              <Link
                to="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center btn-ember px-4 py-3 rounded-xl text-sm"
              >
                Log in
              </Link>
              <Link
                to="/auth/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center btn-ember px-4 py-3 rounded-xl text-sm font-semibold"
              >
                Start for free
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main>
        {/* ─── Hero ─── */}
        <section className="relative min-h-[90dvh] flex items-end md:items-center justify-center px-4 pt-20 pb-16 overflow-hidden">
          {/* Mosaic — full-bleed background, no box */}
          <div className="absolute inset-0">
            <HeroMosaic
              images={[
                { src: "/assets/img/in_debt.jpg", alt: "" },
                { src: "/assets/img/student.jpg", alt: "" },
                { src: "/assets/img/hero.jpg", alt: "" },
                { src: "/assets/img/young_grad.jpg", alt: "" },
                { src: "/assets/img/grieving.jpg", alt: "" },
              ]}
              className="grayscale contrast-125"
            />
            {/* Fade the mosaic into soro-deep at every edge */}
            <div className="absolute inset-0 bg-gradient-to-t from-soro-deep via-soro-deep/70 to-soro-deep/20" />
            <div className="absolute inset-0 bg-gradient-to-b from-soro-deep/90 via-transparent to-transparent h-32" />
            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-soro-deep to-transparent" />
            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-soro-deep to-transparent hidden md:block" />
            <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-soro-deep to-transparent hidden md:block" />
          </div>

          {/* Text column — sits on top of the mosaic */}
          <div className="relative max-w-3xl mx-auto text-center z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-soro-mist leading-tight mb-6">
                You dey carry
                <br />
                <ScribbleCircle className="text-gradient">
                  something heavy
                </ScribbleCircle>{" "}
                today?
              </h1>

              <p className="text-lg md:text-xl text-soro-fade/80 max-w-xl mb-8 leading-relaxed mx-auto">
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
                <ScribbleUnderline>
                  In Nigeria, mental health is a conversation we don't have —
                  and financial stress makes it worse.
                </ScribbleUnderline>
              </p>
            </div>

            {/* Mobile: original stacked cards */}
            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid gap-4 md:hidden"
            >
              {problemStatements.map((item, i) => (
                <motion.div key={i} variants={staggerItem}>
                  <Card padding="lg">
                    <div className="w-10 h-10 rounded-xl bg-soro-ember/10 flex items-center justify-center mb-4">
                      <item.icon size={20} className="text-soro-ember" />
                    </div>
                    <p className="text-sm text-soro-mist leading-relaxed">
                      {item.text}
                    </p>{" "}
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* Desktop: connected infographic */}
            <div className="hidden md:flex justify-center">
              <ProblemInfographic items={problemStatements} />
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
                <ScribbleUnderline>
                  You can't fix someone's finances if their mind is underwater.
                  You can't fix someone's mind if they're drowning financially.
                </ScribbleUnderline>
              </p>
            </div>

            <div className="relative grid md:grid-cols-2 gap-x-10 gap-y-14 md:gap-y-0 max-w-3xl mx-auto">
              {/* Dotted connector — desktop only, sits between the two cards */}
              <svg
                className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                width="80"
                height="2"
                viewBox="0 0 80 2"
              >
                <line
                  x1="0" y1="1" x2="80" y2="1"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray="4 5"
                  strokeLinecap="round"
                  className="text-soro-fade/40"
                />
              </svg>

              {/* ── Card 1: Mental Wellness — icon badge bottom, number top-right ── */}
              <div className="relative pt-2 pr-6">
                {/* Outlined number, floating top-right, outside the card */}
                <span
                  className="absolute -top-6 -right-2 md:-right-4 text-6xl font-display font-black leading-none select-none pointer-events-none"
                  style={{
                    WebkitTextStroke: "1.5px rgba(74, 222, 128, 0.5)",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  01
                </span>

                <div className="relative rounded-[2rem] border-2 border-green-400/40 pt-8 pb-10 px-6">
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

                  {/* Icon badge — overlaps the bottom border, like a notch */}
                  <div className="absolute -bottom-6 left-8 w-14 h-14 rounded-full bg-soro-deep border-2 border-green-400/40 flex items-center justify-center">
                    <Shield size={22} className="text-green-400" />
                  </div>
                </div>
              </div>

              {/* ── Card 2: Financial Resilience — icon badge top, number bottom-right ── */}
              <div className="relative pt-8 pr-6">
                {/* Icon badge — overlaps the top border */}
                <div className="absolute -top-6 left-8 w-14 h-14 rounded-full bg-soro-deep border-2 border-soro-gold/40 flex items-center justify-center z-10">
                  <LineChart size={22} className="text-soro-gold" />
                </div>

                <div className="relative rounded-[2rem] border-2 border-soro-gold/40 pt-10 pb-10 px-6">
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

                {/* Outlined number, floating bottom-right, outside the card */}
                <span
                  className="absolute -bottom-8 -right-2 md:-right-4 text-6xl font-display font-black leading-none select-none pointer-events-none"
                  style={{
                    WebkitTextStroke: "1.5px rgba(245, 200, 66, 0.5)",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  02
                </span>
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
                <ScribbleUnderline>
                  3 steps. 60 seconds. No pressure.
                </ScribbleUnderline>
              </p>
            </div>

            {/* Mobile: original stacked grid */}
            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid gap-6 md:hidden"
            >
              {howItWorks.map((item, i) => (
                <motion.div key={i} variants={staggerItem} className="text-center">
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
            </motion.div>

            {/* Desktop: wavy connected infographic */}
            <div className="hidden md:flex justify-center">
              <HowItWorksInfographic items={howItWorks} />
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
                <ScribbleUnderline>
                  Built for Nigerian youth who are carrying something.
                </ScribbleUnderline>
              </p>
            </div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid grid-cols-2 md:grid-cols-3 auto-rows-[140px] gap-4"
            >
              {audienceCards.map((card, i) => (
                <motion.div
                  key={i}
                  variants={staggerItem}
                  className={card.span}
                >
                  <motion.div
                    whileHover={{ y: -6, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="relative h-full rounded-2xl overflow-hidden border border-soro-earth/15 bg-soro-surface/60 group cursor-default"
                  >
                    {/* Base layer: gradient fallback (always rendered, shows if image fails) */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${card.fallbackBg} opacity-60`}
                    />
                    {/* Top layer: actual image (fades out on error, revealing gradient) */}
                    <img
                      src={`/assets/img/${card.image}`}
                      alt={card.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.opacity = "0";
                      }}
                    />
                    {/* Dark gradient overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-soro-deep/95 via-soro-deep/60 to-soro-deep/20" />

                    {/* Content */}
                    <div className="relative h-full flex flex-col justify-end p-4">
                      <card.Avatar className="w-7 h-7 mb-2" />
                      <h3 className="font-display font-semibold text-soro-mist mb-1">
                        {card.title}
                      </h3>
                      <p className="text-xs text-soro-fade leading-relaxed">
                        {card.description}
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ─── CTA ─── */}
        <section className="relative px-4 py-20 md:py-28 overflow-hidden">
          {/* Warm overlapping circles background */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden>
            <div className="absolute top-1/2 left-1/4 w-72 h-72 bg-soro-ember/5 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-soro-gold/5 rounded-full blur-3xl" />
            <div className="absolute top-1/3 right-1/3 w-48 h-48 bg-soro-earth/5 rounded-full blur-3xl" />
            {/* Two small overlapping circles suggesting connection */}
            <div className="absolute bottom-1/3 left-1/3 w-32 h-32 bg-soro-ember/8 rounded-full blur-2xl" />
            <div className="absolute bottom-1/3 left-[calc(33%+20px)] w-32 h-32 bg-soro-gold/8 rounded-full blur-2xl" />
          </div>
          <div className="relative max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl md:text-4xl font-display font-bold text-soro-mist mb-4">
                E go better —{" "}
                <MarkerHighlightBehind className="text-gradient">
                  but first, say it
                </MarkerHighlightBehind>
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
            Free forever. Supported by non-intrusive ads, never in your
            check-ins or journal. No premium. No paywall. Just a hand when you
            need it.
          </p>
        </div>
      </footer>
      {/* ─── Giant Hollow SORO ─── */}
      {/* ─── Giant Hollow SORO ─── */}
      <section className="relative overflow-hidden flex items-end justify-center select-none pointer-events-none -mt-4 md:-mt-6 h-[28vw] md:h-[24vw] lg:h-[20vw]">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="font-display font-black text-[48vw] md:text-[40vw] lg:text-[34vw] leading-none tracking-tighter translate-y-[55%]"
          style={{
            WebkitTextStroke: "1.5px rgba(232, 131, 74, 0.22)",
            WebkitTextFillColor: "transparent",
          }}
        >
          SORO
        </motion.h2>
      </section>
      {/* PWA Install Prompt */}
      <InstallPrompt />

      {/* Crisis Button */}
      <CrisisButton />

      <div className="text-center pb-6 pt-2">
        <p className="text-xs text-soro-fade/50">
          &copy; {new Date().getFullYear()} SORO. All rights reserved.
        </p>
      </div>
    </div>
  );
}
