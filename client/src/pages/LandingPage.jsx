import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  History,
  Package,
  Shield,
  Truck,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router';
import Logo from '../components/layout/Logo.jsx';
import { PATHS } from '../routes/paths.js';

/* ─── Feature cards ──────────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: Package,
    title: 'Real-time Stock',
    desc: "See every product's on-hand, reserved and free-to-use quantities update the moment a document is validated.",
  },
  {
    icon: Truck,
    title: 'Receipts & Deliveries',
    desc: 'Track goods coming in from vendors and going out to customers — with full pick, pack and validate workflows.',
  },
  {
    icon: ClipboardList,
    title: 'Internal Transfers',
    desc: 'Move stock between racks, rooms and warehouses with automatic availability checks and reservations.',
  },
  {
    icon: BarChart3,
    title: 'Live Dashboard',
    desc: 'KPI strip, low-stock alerts, pending operation counts and a filterable operations table — all at a glance.',
  },
  {
    icon: History,
    title: 'Audit Ledger',
    desc: 'Every stock movement is logged with direction, quantity, location and the user who triggered it.',
  },
  {
    icon: Shield,
    title: 'Secure & Reliable',
    desc: 'JWT-based sessions, automatic token refresh, and encrypted credentials. Your data stays yours.',
  },
];

/* ─── Stats ──────────────────────────────────────────────────────────────── */
const STATS = [
  { val: '10k+',  label: 'Products tracked' },
  { val: '99.9%', label: 'Uptime SLA' },
  { val: '< 1s',  label: 'Avg. response time' },
  { val: '5 min', label: 'Setup time' },
];

/* ─── Workflow steps ─────────────────────────────────────────────────────── */
const STEPS = [
  { n: '01', title: 'Create your warehouse', desc: 'Add a warehouse and its locations — racks, floors or rooms — in under a minute.' },
  { n: '02', title: 'Add your products',     desc: 'Import SKUs, set reorder levels and assign categories. Initial stock goes straight to the ledger.' },
  { n: '03', title: 'Run operations',        desc: 'Create receipts, deliveries and transfers. Confirm, validate and watch stock update live.' },
  { n: '04', title: 'Stay on top',           desc: 'The dashboard flags low stock and late operations so your team always knows what needs attention.' },
];

/* ─── Nav ────────────────────────────────────────────────────────────────── */
function Navbar() {
  return (
    <nav className="sticky top-0 z-30 border-b border-border/50 bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Logo />
        <div className="flex items-center gap-3">
          <Link
            to={PATHS.LOGIN}
            className="text-sm font-medium text-muted hover:text-text-strong transition-colors"
          >
            Sign in
          </Link>
          <Link
            to={PATHS.SIGNUP}
            className="inline-flex items-center gap-1.5 rounded-xl border border-accent/50 bg-accent-muted px-4 py-1.5 text-sm font-semibold text-accent hover:bg-accent-muted/80 hover:border-accent transition-all"
          >
            Get started
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-5 pt-20 pb-28 sm:px-8 text-center">
        {/* Ambient glows */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 70% 50% at 50% -5%, rgba(255,124,124,0.18) 0%, transparent 65%),' +
              'radial-gradient(ellipse 40% 30% at 80% 80%, rgba(255,124,124,0.06) 0%, transparent 60%)',
          }}
        />
        {/* Grid texture */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,124,124,1) 1px, transparent 1px),' +
              'linear-gradient(90deg, rgba(255,124,124,1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative z-10 mx-auto max-w-3xl fade-in">
          {/* Pill tag */}
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent-muted px-3.5 py-1 text-xs font-semibold text-accent">
            <Zap className="h-3 w-3" />
            Inventory management, reimagined
          </span>

          {/* Headline */}
          <h1 className="mt-3 text-5xl font-extrabold leading-[1.1] tracking-tight text-text-strong sm:text-6xl lg:text-7xl">
            Stock that{' '}
            <span
              style={{
                background:
                  'linear-gradient(130deg, #ff7c7c 0%, #ffb3b3 50%, #ff7c7c 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              moves fast.
            </span>
            <br />
            Ops that{' '}
            <span
              style={{
                background:
                  'linear-gradient(130deg, #ff9999 0%, #ff7c7c 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              stay clear.
            </span>
          </h1>

          {/* Sub-headline */}
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted leading-relaxed">
            StockSense gives your team a single source of truth for every product,
            warehouse and movement — from receiving to delivery, in real time.
          </p>

          {/* CTAs */}
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Link
              to={PATHS.SIGNUP}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-bold text-bg shadow-lg shadow-accent/25 hover:bg-accent-hover hover:shadow-accent/35 transition-all active:scale-[0.98]"
            >
              Start for free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to={PATHS.LOGIN}
              className="inline-flex items-center gap-2 rounded-xl border border-border-2 bg-surface px-6 py-3 text-sm font-semibold text-text hover:bg-surface-2 hover:border-border-2 transition-all"
            >
              Sign in to your account
            </Link>
          </div>
        </div>

        {/* Mock dashboard preview card */}
        <div className="relative z-10 mx-auto mt-16 max-w-4xl">
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-2xl shadow-black/50">
            {/* Fake header bar */}
            <div className="mb-4 flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-danger/60" />
              <span className="h-3 w-3 rounded-full bg-warning/60" />
              <span className="h-3 w-3 rounded-full bg-success/60" />
              <span className="ml-3 flex-1 rounded-md bg-surface-2 px-3 py-1 text-xs text-muted">
                stocksense.app/dashboard
              </span>
            </div>
            {/* Fake KPI row */}
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
              {[
                { l: 'In Stock',    v: '284',  c: 'text-text-strong' },
                { l: 'Low Stock',   v: '12',   c: 'text-warning' },
                { l: 'Out of Stock',v: '3',    c: 'text-danger' },
                { l: 'Receipts',    v: '7',    c: 'text-text-strong' },
                { l: 'Deliveries',  v: '14',   c: 'text-text-strong' },
                { l: 'Transfers',   v: '5',    c: 'text-text-strong' },
              ].map((k) => (
                <div key={k.l} className="rounded-xl border border-border bg-surface-2 p-3">
                  <p className="text-xs text-muted">{k.l}</p>
                  <p className={`mt-1.5 text-xl font-bold tabular-nums ${k.c}`}>{k.v}</p>
                </div>
              ))}
            </div>
            {/* Fake table rows */}
            <div className="mt-4 space-y-2">
              {[
                { ref: 'WH/IN/0042', type: 'Receipt',  status: 'Ready',   tone: 'text-info' },
                { ref: 'WH/OUT/0031',type: 'Delivery', status: 'Waiting', tone: 'text-warning' },
                { ref: 'WH/INT/0019',type: 'Transfer', status: 'Done',    tone: 'text-success' },
              ].map((r) => (
                <div
                  key={r.ref}
                  className="flex items-center justify-between rounded-xl border border-border/60 bg-surface-2/50 px-4 py-2.5 text-sm"
                >
                  <span className="font-semibold text-text-strong font-mono">{r.ref}</span>
                  <span className="text-muted">{r.type}</span>
                  <span className={`text-xs font-semibold ${r.tone}`}>{r.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────────────────── */}
      <section className="border-y border-border/50 bg-surface-2/30 py-10">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-6 px-5 sm:grid-cols-4 sm:px-8 text-center">
          {STATS.map(({ val, label }) => (
            <div key={label}>
              <p className="text-3xl font-extrabold text-text-strong">{val}</p>
              <p className="mt-1 text-sm text-muted">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────────────── */}
      <section className="px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-accent">
              Everything you need
            </p>
            <h2 className="text-3xl font-extrabold text-text-strong sm:text-4xl">
              Built for warehouse teams
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted">
              One platform covering the full inventory lifecycle — from vendor receipt to
              customer delivery — with a real-time ledger keeping it all auditable.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group rounded-2xl border border-border bg-surface p-6 shadow-sm hover:border-accent/30 hover:shadow-accent/5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-accent/20 bg-accent-muted">
                  <Icon className="h-5 w-5 text-accent" />
                </span>
                <h3 className="mb-2 text-sm font-bold text-text-strong">{title}</h3>
                <p className="text-sm text-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section className="border-t border-border/50 bg-surface-2/20 px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-accent">
              Get started in minutes
            </p>
            <h2 className="text-3xl font-extrabold text-text-strong sm:text-4xl">
              How StockSense works
            </h2>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(({ n, title, desc }) => (
              <div key={n} className="relative">
                {/* connector line */}
                <div className="mb-4 flex items-center gap-3">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-mono text-sm font-extrabold text-accent"
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(255,124,124,0.18) 0%, rgba(255,124,124,0.06) 100%)',
                      border: '1px solid rgba(255,124,124,0.2)',
                    }}
                  >
                    {n}
                  </span>
                </div>
                <h3 className="mb-1.5 text-sm font-bold text-text-strong">{title}</h3>
                <p className="text-sm text-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-5 py-24 sm:px-8 text-center">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(255,124,124,0.10) 0%, transparent 70%)',
          }}
        />
        <div className="relative z-10 mx-auto max-w-2xl">
          <h2 className="text-3xl font-extrabold text-text-strong sm:text-4xl">
            Ready to take control of your inventory?
          </h2>
          <p className="mt-4 text-muted text-lg">
            Create a free account and have your first warehouse running in minutes.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to={PATHS.SIGNUP}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-7 py-3.5 text-sm font-bold text-bg shadow-xl shadow-accent/25 hover:bg-accent-hover transition-all active:scale-[0.98]"
            >
              Create free account
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to={PATHS.LOGIN}
              className="text-sm font-medium text-accent hover:underline"
            >
              Already have an account →
            </Link>
          </div>

          {/* Trust row */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-muted/60">
            {[
              { icon: CheckCircle2, text: 'No credit card required' },
              { icon: Shield,       text: 'Secure by default' },
              { icon: Zap,         text: 'Ready in 5 minutes' },
            ].map(({ icon: Icon, text }) => (
              <span key={text} className="flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5" />
                {text}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-border/50 px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <Logo />
          <div className="flex items-center gap-5 text-xs text-muted">
            <Link to={PATHS.LOGIN}  className="hover:text-text-strong transition-colors">Sign in</Link>
            <Link to={PATHS.SIGNUP} className="hover:text-text-strong transition-colors">Sign up</Link>
          </div>
          <p className="w-full text-center text-xs text-muted/40 sm:w-auto sm:text-right">
            © {new Date().getFullYear()} StockSense · All rights reserved
          </p>
        </div>
      </footer>
    </div>
  );
}
