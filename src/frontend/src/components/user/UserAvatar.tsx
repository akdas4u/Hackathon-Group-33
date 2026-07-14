import type { ReactElement } from 'react';
import { cn } from '../../utils/cn';

export interface UserAvatarProps {
  readonly fullName: string;
  readonly size?: 'sm' | 'md' | 'lg';
  readonly className?: string;
}

const SIZE_CLASSES: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'h-7 w-7 text-[11px]',
  md: 'h-10 w-10 text-sm',
  lg: 'h-16 w-16 text-xl',
};

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return '?';
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/** Teal-to-black gradient circle with initials, matching the prototype's `.avatar-lg`. */
export function UserAvatar({ fullName, size = 'md', className }: UserAvatarProps): ReactElement {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-bold text-white',
        'bg-gradient-to-br from-brand-teal to-brand-black',
        SIZE_CLASSES[size],
        className,
      )}
    >
      {getInitials(fullName)}
    </div>
  );
}
