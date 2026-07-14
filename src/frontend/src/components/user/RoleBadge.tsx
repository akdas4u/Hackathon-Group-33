import type { ReactElement } from 'react';
import { cn } from '../../utils/cn';
import type { Role } from '../../types';

export const ROLE_LABELS: Record<string, string> = {
  ReleaseCoordinator: 'Release Coordinator',
  ReleaseManager: 'Release Manager',
  QALead: 'QA Lead',
  DevOpsEngineer: 'DevOps Engineer',
  Administrator: 'Administrator',
};

/**
 * Colour coding per the approved prototype: Coordinator=info, Manager=brand
 * teal, QALead=purple, DevOps=warning, Administrator=danger. Purple has no
 * semantic design token (it isn't part of the go/no-go palette), so this is
 * the one place a plain Tailwind `purple-*` is used intentionally.
 */
const ROLE_CLASSES: Record<string, string> = {
  ReleaseCoordinator: 'bg-info-bg text-info',
  ReleaseManager: 'bg-brand-teal/10 text-brand-teal',
  QALead: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  DevOpsEngineer: 'bg-warning-bg text-warning',
  Administrator: 'bg-danger-bg text-danger',
};

export interface RoleBadgeProps {
  readonly role: Role;
  readonly size?: 'sm' | 'md';
  readonly className?: string;
}

export function RoleBadge({ role, size = 'md', className }: RoleBadgeProps): ReactElement {
  const label = ROLE_LABELS[role] ?? role;
  const colorClasses = ROLE_CLASSES[role] ?? 'bg-surface-subtle text-text-secondary';
  const sizeClasses = size === 'sm' ? 'h-5 px-2 text-[10px]' : 'h-6 px-2.5 text-[11px]';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-semibold',
        sizeClasses,
        colorClasses,
        className,
      )}
    >
      {label}
    </span>
  );
}
