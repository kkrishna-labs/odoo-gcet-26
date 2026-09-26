import {
  ChevronDown,
  ClipboardList,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  User,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router';
import useAuth from '../../hooks/useAuth.js';
import { PATHS } from '../../routes/paths.js';
import Logo from './Logo.jsx';

const NAV_ITEMS = [
  { label: 'Dashboard', to: PATHS.DASHBOARD, icon: LayoutDashboard },
  {
    label: 'Operations',
    icon: ClipboardList,
    children: [
      { label: 'Receipts', to: PATHS.RECEIPTS },
      { label: 'Delivery Orders', to: PATHS.DELIVERIES },
      { label: 'Internal Transfers', to: PATHS.TRANSFERS },
      { label: 'Inventory Adjustments', to: PATHS.ADJUSTMENTS },
    ],
  },
  {
    label: 'Products',
    icon: Package,
    children: [
      { label: 'Stock', to: PATHS.PRODUCTS },
      { label: 'Categories', to: PATHS.CATEGORIES },
    ],
  },
  { label: 'Move History', to: PATHS.MOVE_HISTORY, icon: History },
  {
    label: 'Settings',
    icon: Settings,
    children: [
      { label: 'Warehouses', to: PATHS.WAREHOUSES },
      { label: 'Locations', to: PATHS.LOCATIONS },
    ],
  },
];

function isGroupActive(item, pathname) {
  return item.children.some((child) => pathname.startsWith(child.to));
}

function usePopover() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (e) =>
      ref.current && !ref.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return { open, setOpen, ref };
}

function DropdownPanel({ children, align = 'left' }) {
  return (
    <div
      className={`absolute top-full z-30 mt-2 min-w-52 rounded-xl border border-border bg-surface/95 backdrop-blur-xl p-1.5 shadow-2xl shadow-black/50 fade-in ${
        align === 'right' ? 'right-0' : 'left-0'
      }`}
    >
      {children}
    </div>
  );
}

function menuItemClass({ isActive }) {
  return `block rounded-lg px-3 py-2 text-sm transition-colors ${
    isActive
      ? 'bg-accent-muted text-accent font-medium'
      : 'text-text hover:bg-surface-2 hover:text-text-strong'
  }`;
}

const linkBase =
  'rounded-lg px-3 py-2 text-sm font-medium transition-colors';
const linkIdle = 'text-text hover:bg-surface-2 hover:text-text-strong';
const linkActive = 'text-accent bg-accent-muted';

function NavGroup({ item }) {
  const { open, setOpen, ref } = usePopover();
  const { pathname } = useLocation();
  const active = isGroupActive(item, pathname);
  const Icon = item.icon;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className={`${linkBase} inline-flex items-center gap-1.5 ${active ? linkActive : linkIdle}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <Icon className="h-3.5 w-3.5" />
        {item.label}
        <ChevronDown
          className={`h-3 w-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <DropdownPanel>
          {item.children.map((child) => (
            <NavLink key={child.to} to={child.to} className={menuItemClass}>
              {child.label}
            </NavLink>
          ))}
        </DropdownPanel>
      )}
    </div>
  );
}

function ProfileMenu() {
  const { open, setOpen, ref } = usePopover();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const displayName = user?.name || user?.loginId || 'Guest';
  const initial = displayName.charAt(0).toUpperCase();

  const handleLogout = () => {
    logout();
    navigate(PATHS.LOGIN, { replace: true });
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="flex h-8 w-8 items-center justify-center rounded-xl border border-accent/40 bg-accent-muted text-sm font-bold text-accent hover:bg-accent-muted/80 hover:border-accent/60 transition-all"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Profile menu"
        onClick={() => setOpen((v) => !v)}
      >
        {initial}
      </button>
      {open && (
        <DropdownPanel align="right">
          <div className="border-b border-border px-3 py-2.5 mb-1">
            <p className="truncate text-sm font-semibold text-text-strong">{displayName}</p>
            {user?.email && (
              <p className="truncate text-xs text-muted mt-0.5">{user.email}</p>
            )}
          </div>
          <NavLink to={PATHS.PROFILE} className={menuItemClass}>
            <span className="flex items-center gap-2">
              <User className="h-3.5 w-3.5" />
              My Profile
            </span>
          </NavLink>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-danger hover:bg-surface-2 transition-colors mt-0.5"
          >
            <LogOut className="h-3.5 w-3.5" />
            Logout
          </button>
        </DropdownPanel>
      )}
    </div>
  );
}

function MobileNav() {
  const { open, setOpen, ref } = usePopover();
  const { pathname } = useLocation();

  return (
    <div className="md:hidden" ref={ref}>
      <button
        type="button"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-text hover:bg-surface-2 transition-colors"
        aria-label={open ? 'Close navigation' : 'Open navigation'}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>
      {open && (
        <nav className="absolute inset-x-0 top-full z-30 border-b border-border bg-surface/95 backdrop-blur-xl px-4 py-3 shadow-2xl shadow-black/40 fade-in">
          {NAV_ITEMS.map((item) =>
            item.children ? (
              <div key={item.label} className="py-1">
                <p className="px-3 pt-2 pb-1 text-xs font-semibold tracking-widest text-muted uppercase">
                  {item.label}
                </p>
                {item.children.map((child) => (
                  <NavLink key={child.to} to={child.to} className={menuItemClass}>
                    {child.label}
                  </NavLink>
                ))}
              </div>
            ) : (
              <NavLink key={item.to} to={item.to} className={menuItemClass}>
                <span className="flex items-center gap-2">
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                </span>
              </NavLink>
            )
          )}
        </nav>
      )}
    </div>
  );
}

export default function Header() {
  return (
    <header className="sticky top-0 z-20 print:hidden border-b border-border/60 bg-bg/80 backdrop-blur-xl">
      <div className="relative flex h-14 w-full items-center gap-4 px-4 sm:px-6 lg:px-10 xl:px-14">
        <MobileNav />

        <Link
          to={PATHS.DASHBOARD}
          className="shrink-0 transition-opacity hover:opacity-80"
          aria-label="StockSense home"
        >
          <Logo />
        </Link>

        <nav className="ml-6 hidden items-center gap-0.5 md:flex" aria-label="Main">
          {NAV_ITEMS.map((item) =>
            item.children ? (
              <NavGroup key={item.label} item={item} />
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `${linkBase} inline-flex items-center gap-1.5 ${isActive ? linkActive : linkIdle}`
                }
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </NavLink>
            )
          )}
        </nav>

        <div className="ml-auto">
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}
