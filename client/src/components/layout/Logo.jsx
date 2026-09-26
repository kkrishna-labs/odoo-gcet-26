import { APP_NAME } from '../../utils/constants.js';

export default function Logo({ size = 'md' }) {
  const box = size === 'lg' ? 'h-10 w-10' : 'h-8 w-8';
  const text = size === 'lg' ? 'text-xl' : 'text-base';

  return (
    <span className="inline-flex items-center gap-2.5">
      {/* Layered box icon with accent glow */}
      <span className={`${box} relative flex items-center justify-center`}>
        <svg viewBox="0 0 36 36" className="w-full h-full" aria-hidden="true">
          <defs>
            <linearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ff7c7c" />
              <stop offset="100%" stopColor="#ff4d4d" />
            </linearGradient>
          </defs>
          {/* Background */}
          <rect width="36" height="36" rx="9" fill="#1c1c1f" />
          {/* Box layers icon */}
          <g fill="none" stroke="url(#logoGrad)" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
            <path d="M8 13l10-5 10 5-10 5-10-5z" />
            <path d="M8 18l10 5 10-5" />
            <path d="M8 23l10 5 10-5" />
            <path d="M8 13v10M28 13v10" />
          </g>
        </svg>
      </span>
      <span className={`${text} font-bold tracking-tight text-text-strong`}>
        {APP_NAME}
      </span>
    </span>
  );
}
