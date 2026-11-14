import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Activity,
  BarChart3,
  Building2,
  CalendarClock,
  CheckSquare,
  ClipboardCheck,
  Clock,
  FolderKanban,
  HardHat,
  Headphones,
  LayoutDashboard,
  ListTodo,
  Megaphone,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';
import { useApp } from '../app/AppContext';
import { ManagerRole, Permission } from '../types';
import { classNames } from '../utils/formatters';

interface NavGroup {
  label: string;
  items: Array<{
    label: string;
    to: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    visible?: boolean;
  }>;
}

interface ManagerSidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const ManagerSidebar: React.FC<ManagerSidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const {
    currentManager,
    activeRole,
    pendingApprovalsCount,
    scopedProjects,
    scopedSites,
    hasPermission,
  } = useApp();
  const location = useLocation();

  const showProjects =
    scopedProjects.length > 0 ||
    activeRole === ManagerRole.ProjectManager ||
    activeRole === ManagerRole.DepartmentManager;
  const showSites =
    scopedSites.length > 0 ||
    activeRole === ManagerRole.SiteManager ||
    activeRole === ManagerRole.ShiftSupervisor;
  const showCallCentre =
    currentManager.callCentreEnabled || activeRole === ManagerRole.CallCentreSupervisor;

  const navGroups: NavGroup[] = [
    {
      label: 'Overview',
      items: [
        { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
        { label: 'Task & Approval Queue', to: '/tasks', icon: ListTodo },
        { label: 'Workload & Activity', to: '/profile?tab=workload', icon: Activity },
      ],
    },
    {
      label: 'Workforce',
      items: [
        { label: 'My Team', to: '/team', icon: Users, visible: hasPermission(Permission.View) },
        { label: 'Attendance', to: '/attendance', icon: Clock, visible: hasPermission(Permission.View) },
        { label: 'Shift Management', to: '/shifts', icon: CalendarClock, visible: hasPermission(Permission.View) },
        {
          label: 'Leave & Approvals',
          to: '/approvals',
          icon: CheckSquare,
          badge: pendingApprovalsCount,
          visible: hasPermission(Permission.Approve) || hasPermission(Permission.View),
        },
      ],
    },
    {
      label: 'Execution & Operations',
      items: [
        { label: 'Work Allocation', to: '/work-allocation', icon: ClipboardCheck },
        { label: 'Projects', to: '/projects', icon: FolderKanban, visible: showProjects },
        { label: 'Site Management', to: '/sites', icon: HardHat, visible: showSites },
        { label: 'Branch & Store Ops', to: '/operations/branches', icon: Building2 },
        { label: 'Call Centre Ops', to: '/operations/call-centre', icon: Headphones, visible: showCallCentre },
      ],
    },
    {
      label: 'Insights & Comms',
      items: [
        { label: 'Performance & KPIs', to: '/performance', icon: TrendingUp },
        { label: 'Reports & Exports', to: '/reports', icon: BarChart3, visible: hasPermission(Permission.ViewReports) },
        { label: 'Team Communication', to: '/communication', icon: Megaphone },
      ],
    },
  ];

  const renderContent = () => (
    <div className="flex flex-col h-full bg-[#0B1230] text-white w-[245px] select-none">
      {/* Brand header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-white/10 shrink-0">
        <NavLink to="/dashboard" onClick={onCloseMobile} className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-[#7050F5] flex items-center justify-center font-bold text-sm tracking-tight text-white">
            PF
          </div>
          <div className="leading-tight">
            <span className="block text-sm font-bold tracking-tight text-white">PayFuse</span>
            <span className="block text-[11px] text-white/60">Manager Portal</span>
          </div>
        </NavLink>
        <button
          type="button"
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
          aria-label="Close sidebar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Navigation groups */}
      <nav className="flex-1 overflow-y-auto scrollbar-navy px-3 py-4 space-y-5" aria-label="Primary sidebar">
        {navGroups.map((group) => {
          const visibleItems = group.items.filter((i) => i.visible !== false);
          if (visibleItems.length === 0) return null;
          return (
            <div key={group.label}>
              <div className="px-2.5 mb-1.5 text-[11px] font-medium text-white/45 tracking-wide">
                {group.label}
              </div>
              <ul className="space-y-0.5">
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const targetPath = item.to.split('?')[0];
                  const isActive =
                    item.to.includes('?')
                      ? location.pathname + location.search === item.to
                      : location.pathname === targetPath;
                  return (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        onClick={onCloseMobile}
                        className={classNames(
                          'flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-colors whitespace-nowrap',
                          isActive
                            ? 'bg-[#7050F5] text-white'
                            : 'text-white/75 hover:text-white hover:bg-white/[0.07]'
                        )}
                      >
                        <span className="flex items-center gap-2.5 min-w-0">
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </span>
                        {typeof item.badge === 'number' && item.badge > 0 && (
                          <span
                            className={classNames(
                              'px-1.5 py-0.5 text-[11px] font-semibold rounded tabular-nums',
                              isActive ? 'bg-white/20 text-white' : 'bg-[#7050F5]/30 text-[#C8BEFF]'
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* Role & Scope Indicator Footer */}
      <div className="p-3.5 border-t border-white/10 text-xs">
        <div className="rounded-lg bg-white/[0.06] px-3 py-2.5">
          <p className="text-[11px] text-white/55">Active Role Scope</p>
          <p className="mt-0.5 font-semibold text-white truncate">{activeRole}</p>
          <p className="mt-1 text-[11px] text-white/65 truncate">{currentManager.location}</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop fixed 245px sidebar */}
      <aside className="hidden lg:block w-[245px] shrink-0 border-r border-[#1A244D]">
        <div className="fixed top-0 left-0 bottom-0 w-[245px] z-30">{renderContent()}</div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-[#0B1230]/50" onClick={onCloseMobile} aria-hidden="true" />
          <div className="relative z-10 h-full">{renderContent()}</div>
        </div>
      )}
    </>
  );
};
