import {
  BarChart3,
  CheckCircle2,
  Package,
  Shield,
  TrendingUp,
  Truck,
  Zap,
} from 'lucide-react';
import { Outlet } from 'react-router';
import Logo from '../components/layout/Logo.jsx';

const FEATURES = [
  { icon: Package,    text: 'Real-time stock tracking across every location' },
  { icon: Truck,      text: 'Receipts, deliveries & transfers in one place' },
  { icon: BarChart3,  text: 'Dashboard with live KPIs and low-stock alerts' },
  { icon: TrendingUp, text: 'Full move history with an auditable ledger' },
  { icon: Shield,     text: 'Role-based access and secure JWT sessions' },
  { icon: Zap,        text: 'Inventory adjustments validated instantly' },
];

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen bg-bg">

      {/* ── Left panel: branding + feature list ─────────────────────────── */}
      <div
        className="relative hidden lg:flex lg:w-[52%] xl:w-[55%] flex-col justify-between p-12 overflow-hidden"
        style={{
          background:
            'linear-gradient(145deg, #0d0d0f 0%, #161619 55%, #1a1015 100%)',
        }}
      >
        {/* Ambient glows */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 70% 55% at 20% 10%, rgba(255,124,124,0.12) 0%, transparent 60%),' +
              'radial-gradient(ellipse 50% 40% at 80% 85%, rgba(255,124,124,0.07) 0%, transparent 55%)',
          }}
        />
        {/* Decorative grid */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,124,124,0.8) 1px, transparent 1px),' +
              'linear-gradient(90deg, rgba(255,124,124,0.8) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        {/* Logo */}
        <div className="relative z-10">
          <Logo size="lg" />
        </div>

        {/* Hero copy */}
        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-text-strong xl:text-5xl">
              Inventory that{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #ff7c7c 0%, #ffb3b3 60%, #ff7c7c 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                works for you.
              </span>
            </h1>
            <p className="mt-4 max-w-md text-base text-muted leading-relaxed">
              StockSense gives your team a clear, real-time view of every product,
              movement, and location — from the warehouse floor to the dashboard.
            </p>
          </div>

          {/* Feature list */}
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-accent/20 bg-accent-muted">
                  <Icon className="h-3.5 w-3.5 text-accent" />
                </span>
                <span className="text-sm text-muted leading-snug">{text}</span>
              </li>
            ))}
          </ul>

          {/* Social proof strip */}
          <div className="flex items-center gap-6 pt-2">
            {[
              { val: '10k+', label: 'Products tracked' },
              { val: '99.9%', label: 'Uptime' },
              { val: '< 1s', label: 'Avg response' },
            ].map(({ val, label }) => (
              <div key={label}>
                <p className="text-xl font-bold text-text-strong">{val}</p>
                <p className="text-xs text-muted">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom copyright */}
        <p className="relative z-10 text-xs text-muted/40">
          © {new Date().getFullYear()} StockSense · Built for modern inventory teams
        </p>
      </div>

      {/* ── Right panel: auth form ───────────────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-12">
        {/* Mobile logo */}
        <div className="mb-8 lg:hidden">
          <Logo size="lg" />
        </div>

        <div className="w-full max-w-[22rem] fade-in">
          {/* Auth card */}
          <div className="rounded-2xl border border-border bg-surface p-7 shadow-2xl shadow-black/50">
            <Outlet />
          </div>

          {/* Trust badges */}
          <div className="mt-5 flex items-center justify-center gap-4">
            {[
              { icon: Shield, text: 'Secure login' },
              { icon: CheckCircle2, text: 'Encrypted data' },
              { icon: Zap, text: 'Instant access' },
            ].map(({ icon: Icon, text }) => (
              <span key={text} className="flex items-center gap-1 text-xs text-muted/50">
                <Icon className="h-3 w-3" />
                {text}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
