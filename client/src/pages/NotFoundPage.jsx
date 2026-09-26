import { ArrowLeft, Box } from 'lucide-react';
import { Link } from 'react-router';
import { PATHS } from '../routes/paths.js';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center fade-in">
      {/* Big 404 */}
      <div className="relative mb-6">
        <p
          className="select-none text-[10rem] font-black leading-none tracking-tighter"
          style={{
            background: 'linear-gradient(135deg, #ff7c7c22 0%, #ff7c7c08 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
          aria-hidden="true"
        >
          404
        </p>
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-accent/20 bg-accent-muted">
            <Box className="h-8 w-8 text-accent" />
          </span>
        </span>
      </div>

      <h1 className="text-2xl font-bold text-text-strong">Page not found</h1>
      <p className="mt-2 max-w-sm text-sm text-muted leading-relaxed">
        The page you're looking for doesn't exist or may have been moved.
      </p>

      <Link
        to={PATHS.DASHBOARD}
        className="mt-8 inline-flex items-center gap-2 rounded-xl border border-accent/50 bg-accent-muted px-5 py-2.5 text-sm font-semibold text-accent hover:bg-accent-muted/80 hover:border-accent transition-all"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>
    </div>
  );
}
