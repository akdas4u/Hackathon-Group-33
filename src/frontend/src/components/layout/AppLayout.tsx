import type { ReactElement } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

/**
 * Route-level shell for every protected page (Dashboard, ReleaseDetail,
 * Report): icon-rail sidebar + topbar, wrapping whatever the matched leaf
 * route renders via <Outlet />. Sidebar/Topbar are both `print:hidden` so
 * Report.tsx's print/PDF flow is unaffected.
 */
export function AppLayout(): ReactElement {
  return (
    <div className="flex h-screen overflow-hidden bg-surface-page">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
