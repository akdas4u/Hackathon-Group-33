import { useEffect, type ReactElement } from 'react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle, type LucideIcon } from 'lucide-react';
import { useUiStore, type Toast, type ToastVariant } from '../../store/uiStore';
import { cn } from '../../utils/cn';

const ICONS: Record<ToastVariant, LucideIcon> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
};

const CLASSES: Record<ToastVariant, string> = {
  info: 'bg-info-bg text-info border-info-border',
  success: 'bg-success-bg text-success border-success-border',
  warning: 'bg-warning-bg text-warning border-warning-border',
  error: 'bg-danger-bg text-danger border-danger-border',
};

function ToastItem({ toast }: { readonly toast: Toast }): ReactElement {
  const dismissToast = useUiStore((state) => state.dismissToast);
  const Icon = ICONS[toast.variant];

  useEffect(() => {
    const timer = window.setTimeout(() => dismissToast(toast.id), 5000);
    return () => window.clearTimeout(timer);
  }, [toast.id, dismissToast]);

  return (
    <div
      className={cn(
        'animate-slide-in-right flex items-start gap-2 rounded-md border px-3 py-2 shadow-md',
        CLASSES[toast.variant],
      )}
    >
      <Icon size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
      <p className="flex-1 text-sm">{toast.message}</p>
      <button
        type="button"
        onClick={() => dismissToast(toast.id)}
        aria-label="Dismiss notification"
        className="shrink-0 opacity-70 transition-opacity hover:opacity-100"
      >
        <X size={14} aria-hidden="true" />
      </button>
    </div>
  );
}

/**
 * Self-contained toast renderer. There is no global toast renderer mounted in
 * AppLayout/App.tsx yet (nothing else in the app calls pushToast), so this is
 * mounted locally in SettingsPage. If a global one is added to AppLayout
 * later, remove this to avoid double-rendering toasts pushed from Settings.
 */
export function ToastStack(): ReactElement {
  const toasts = useUiStore((state) => state.toasts);

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed bottom-4 right-4 z-50 flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
