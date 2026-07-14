import type { ReactElement } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { LayoutDashboard, GitBranch, FileBarChart, Settings } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { ThemeToggle } from '../ui/ThemeToggle';
import { cn } from '../../utils/cn';

interface NavItem {
  readonly label: string;
  readonly to: string;
  readonly icon: typeof LayoutDashboard;
  readonly isActive: (pathname: string) => boolean;
  readonly disabled?: boolean;
}

/** Icon-rail sidebar on the brand-black surface, matching the prototype's `.sidebar`/`.nav-icon`. */
export function Sidebar(): ReactElement {
  const location = useLocation();
  const { id } = useParams<{ id?: string }>();
  const user = useAuthStore((state) => state.user);

  const reportHref = id ? `/releases/${id}/report` : '/dashboard';

  const navItems: readonly NavItem[] = [
    {
      label: 'Dashboard',
      to: '/dashboard',
      icon: LayoutDashboard,
      isActive: (pathname) => pathname === '/dashboard',
    },
    {
      label: 'Releases',
      to: '/dashboard',
      icon: GitBranch,
      isActive: (pathname) => pathname.startsWith('/releases'),
    },
    {
      label: 'Reports',
      to: reportHref,
      icon: FileBarChart,
      isActive: (pathname) => pathname.endsWith('/report'),
      disabled: !id,
    },
  ];

  const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : '?';

  return (
    <aside
      aria-label="Primary"
      className="flex h-screen w-16 shrink-0 flex-col items-center gap-2 bg-brand-black py-4 print:hidden"
    >
      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-md bg-brand-teal text-xs font-bold text-white">
        V1
      </div>

      <nav className="flex flex-col items-center gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive(location.pathname);
          if (item.disabled) {
            return (
              <span
                key={item.label}
                aria-hidden="true"
                title={item.label}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-white/20"
              >
                <Icon size={17} aria-hidden="true" />
              </span>
            );
          }
          return (
            <Link
              key={item.label}
              to={item.to}
              title={item.label}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
                active
                  ? 'border-l-2 border-brand-teal bg-brand-teal/20 text-brand-teal'
                  : 'text-white/50 hover:bg-white/10 hover:text-white',
              )}
            >
              <Icon size={17} aria-hidden="true" />
            </Link>
          );
        })}
      </nav>

      <div className="flex-1" />

      <ThemeToggle size="sm" className="mb-2" />

      <Link
        to="/settings"
        title="Settings"
        aria-label="Settings"
        className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/10 hover:text-white"
      >
        <Settings size={17} aria-hidden="true" />
      </Link>

      <div
        title={user?.username}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-teal text-[11px] font-semibold text-white"
      >
        {initials}
      </div>
    </aside>
  );
}
