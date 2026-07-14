import { useEffect, useRef, useState, type ReactElement } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ChevronDown, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useRelease } from '../../hooks/useRelease';
import { cn } from '../../utils/cn';

const ROLE_LABELS: Record<string, string> = {
  ReleaseCoordinator: 'Release Coordinator',
  ReleaseManager: 'Release Manager',
  QALead: 'QA Lead',
  DevOpsEngineer: 'DevOps Engineer',
  Administrator: 'Administrator',
};

function useBreadcrumb(): ReactElement {
  const location = useLocation();
  const { id } = useParams<{ id?: string }>();
  const { data: release } = useRelease(id);
  const label = release?.name ?? id;

  if (id && location.pathname.endsWith('/report')) {
    return (
      <>
        Releases / {label} / <span className="font-medium text-text-primary">Report</span>
      </>
    );
  }
  if (id) {
    return (
      <>
        Releases / <span className="font-medium text-text-primary">{label}</span>
      </>
    );
  }
  return <span className="font-medium text-text-primary">Dashboard</span>;
}

/** Topbar with a route-aware breadcrumb and a user menu (avatar, role, sign out). */
export function Topbar(): ReactElement {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const breadcrumb = useBreadcrumb();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) {
      return undefined;
    }
    function handleClickOutside(event: MouseEvent): void {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  function handleSignOut(): void {
    setMenuOpen(false);
    logout();
    navigate('/login');
  }

  const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : '?';
  const roleLabel = (user && ROLE_LABELS[user.role]) ?? user?.role ?? '';

  return (
    <header className="flex h-12 shrink-0 items-center gap-3 border-b border-border-default bg-surface-card px-4 print:hidden">
      <span className="truncate text-xs text-text-muted">{breadcrumb}</span>

      <div className="relative ml-auto flex items-center gap-2" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          className="flex items-center gap-2 rounded-md px-2 py-1 text-left transition-colors hover:bg-surface-subtle"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-teal text-[11px] font-semibold text-white">
            {initials}
          </span>
          <span className="hidden flex-col leading-tight sm:flex">
            <span className="text-xs font-medium text-text-primary">{user?.username}</span>
            <span className="text-[10px] text-text-muted">{roleLabel}</span>
          </span>
          <ChevronDown
            size={14}
            aria-hidden="true"
            className={cn('text-text-muted transition-transform', menuOpen && 'rotate-180')}
          />
        </button>

        {menuOpen && (
          <div
            role="menu"
            className="animate-fade-in-up absolute right-0 top-full z-10 mt-2 w-44 rounded-md border border-border-default bg-surface-card py-1 shadow-lg"
          >
            <button
              type="button"
              role="menuitem"
              onClick={handleSignOut}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-text-secondary transition-colors hover:bg-surface-subtle hover:text-text-primary"
            >
              <LogOut size={14} aria-hidden="true" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
