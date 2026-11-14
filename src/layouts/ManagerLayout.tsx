import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { CalendarClock, CheckSquare, LayoutDashboard, ListTodo, Users } from 'lucide-react';
import { useApp } from '../app/AppContext';
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog';
import { ToastNotifications } from '../components/ui/ToastNotifications';
import { ManagerSidebar } from './ManagerSidebar';
import { ManagerTopbar } from './ManagerTopbar';

export const ManagerLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pendingApprovalsCount, activeRole, scopedEmployees, allEmployeesCount } = useApp();

  return (
    <div className="min-h-screen flex bg-[#F7F7FC] text-[#0B1230]">
      <ManagerSidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <ManagerTopbar onOpenMobileSidebar={() => setMobileOpen(true)} />

        <main className="flex-1 px-4 lg:px-7 py-6 pb-24 lg:pb-8 max-w-[1440px] w-full mx-auto">
          {children}

          {/* Subtle Demo Dataset & Scope Attribution Footer */}
          <footer className="mt-10 pt-4 border-t border-[#E4E6F0] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-[#69718A] no-print">
            <span>
              PayFuse Workforce Supervision · Demo Dataset ({scopedEmployees.length} of {allEmployeesCount} employees authorised under {activeRole})
            </span>
            <span>All approvals and workforce edits are logged for audit compliance.</span>
          </footer>
        </main>
      </div>

      {/* Mobile Bottom Navigation (within 15% mobile sticky cap) */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-30 h-14 bg-white border-t border-[#E4E6F0] flex items-center justify-around px-2 no-print"
        aria-label="Mobile quick navigation"
      >
        {[
          { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
          { to: '/team', label: 'Team', icon: Users },
          { to: '/approvals', label: `Approvals${pendingApprovalsCount > 0 ? ` (${pendingApprovalsCount})` : ''}`, icon: CheckSquare },
          { to: '/shifts', label: 'Shifts', icon: CalendarClock },
          { to: '/tasks', label: 'Queue', icon: ListTodo },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 min-w-[56px] py-1 text-[10px] font-medium whitespace-nowrap ${
                  isActive ? 'text-[#7050F5]' : 'text-[#5A627A]'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <ToastNotifications />
      <ConfirmationDialog />
    </div>
  );
};
