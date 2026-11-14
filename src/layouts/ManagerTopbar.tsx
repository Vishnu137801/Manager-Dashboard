import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  Building2,
  ChevronDown,
  HelpCircle,
  LogOut,
  Menu,
  Search,
  Shield,
  User,
  Users,
  X,
} from 'lucide-react';
import { useApp } from '../app/AppContext';
import { AvatarBadge } from '../components/ui/AvatarBadge';
import { ManagerRole } from '../types';

const ROUTE_TITLES: Record<string, string> = {
  '/dashboard': 'Manager Dashboard',
  '/tasks': 'Task & Approval Queue',
  '/team': 'Team Management',
  '/attendance': 'Attendance Management',
  '/shifts': 'Shift Management',
  '/approvals': 'Leave & Approvals',
  '/work-allocation': 'Work Allocation',
  '/projects': 'Project Management',
  '/sites': 'Site Management',
  '/operations/branches': 'Branch & Store Operations',
  '/operations/call-centre': 'Call Centre Operations',
  '/performance': 'Performance & Productivity',
  '/reports': 'Reports & Analytics',
  '/communication': 'Team Communication',
  '/profile': 'Profile & Security',
};

interface ManagerTopbarProps {
  onOpenMobileSidebar: () => void;
}

export const ManagerTopbar: React.FC<ManagerTopbarProps> = ({ onOpenMobileSidebar }) => {
  const {
    managerAccounts,
    currentManager,
    activeRole,
    switchManagerAccount,
    switchActiveRole,
    selectedTeamFilter,
    setSelectedTeamFilter,
    selectedBranchFilter,
    setSelectedBranchFilter,
    teams,
    branches,
    scopedEmployees,
    scopedTasks,
    scopedProjects,
    scopedLeaves,
    pendingApprovalsCount,
    notifications,
    unreadNotificationsCount,
    markAllNotificationsRead,
    markNotificationRead,
    pushToast,
  } = useApp();

  const location = useLocation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const pageTitle = ROUTE_TITLES[location.pathname] || 'Workspace';

  const managerTeams = useMemo(
    () => teams.filter((t) => currentManager.assignedTeams.includes(t.id)),
    [teams, currentManager]
  );

  const managerBranches = useMemo(
    () => branches.filter((b) => currentManager.assignedBranches.includes(b.id)),
    [branches, currentManager]
  );

  const globalResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return { employees: [], tasks: [], projects: [], requests: [] };
    return {
      employees: scopedEmployees
        .filter((e) => e.name.toLowerCase().includes(q) || e.employeeCode.toLowerCase().includes(q) || e.designation.toLowerCase().includes(q))
        .slice(0, 4),
      tasks: scopedTasks
        .filter((t) => t.title.toLowerCase().includes(q) || t.id.toLowerCase().includes(q))
        .slice(0, 3),
      projects: scopedProjects
        .filter((p) => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q))
        .slice(0, 3),
      requests: scopedLeaves
        .filter((l) => l.employeeName.toLowerCase().includes(q) || l.id.toLowerCase().includes(q))
        .slice(0, 3),
    };
  }, [searchQuery, scopedEmployees, scopedTasks, scopedProjects, scopedLeaves]);

  const hasSearchResults =
    globalResults.employees.length +
      globalResults.tasks.length +
      globalResults.projects.length +
      globalResults.requests.length >
    0;

  return (
    <header className="sticky top-0 z-20 h-16 bg-white border-b border-[#E4E6F0] px-4 lg:px-6 flex items-center justify-between gap-4 no-print">
      {/* Left: Mobile toggle + Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-[#0B1230] hover:bg-[#F7F7FC]"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-[#69718A] truncate">
            <span className="font-medium text-[#5A627A]">PayFuse</span>
            <span aria-hidden="true">/</span>
            <span className="truncate">{activeRole}</span>
            <span aria-hidden="true">/</span>
            <span className="font-semibold text-[#0B1230] truncate">{pageTitle}</span>
          </div>
        </div>
      </div>

      {/* Centre: Global Search */}
      <div className="hidden md:block relative flex-1 max-w-md">
        <div className="relative flex items-center">
          <Search className="h-4 w-4 text-[#69718A] absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onFocus={() => setSearchOpen(true)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSearchOpen(true);
            }}
            placeholder="Search employees, shifts, projects, or requests..."
            className="w-full h-9 pl-9 pr-8 text-xs bg-[#F7F7FC] border border-[#E4E6F0] rounded-lg text-[#0B1230] placeholder:text-[#8E95AA] focus:outline-none focus:bg-white focus:border-[#7050F5] transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSearchOpen(false);
              }}
              className="absolute right-2.5 text-[#69718A] hover:text-[#0B1230]"
              aria-label="Clear global search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {searchOpen && searchQuery.trim().length > 0 && (
          <div className="absolute left-0 right-0 mt-1.5 bg-white border border-[#E4E6F0] rounded-xl shadow-xl p-3 z-50 max-h-96 overflow-y-auto">
            {!hasSearchResults ? (
              <p className="text-xs text-[#69718A] py-3 text-center">
                No scoped records matching "{searchQuery}"
              </p>
            ) : (
              <div className="space-y-3 text-xs">
                {globalResults.employees.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold text-[#69718A] px-2 mb-1">Employees</p>
                    {globalResults.employees.map((e) => (
                      <button
                        key={e.id}
                        type="button"
                        onClick={() => {
                          setSearchOpen(false);
                          setSearchQuery('');
                          navigate(`/team?employee=${e.id}`);
                        }}
                        className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-[#F7F7FC] flex items-center justify-between"
                      >
                        <span className="font-medium text-[#0B1230]">{e.name}</span>
                        <span className="text-[#69718A]">{e.employeeCode} · {e.teamName}</span>
                      </button>
                    ))}
                  </div>
                )}
                {globalResults.tasks.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold text-[#69718A] px-2 mb-1">Work Tasks</p>
                    {globalResults.tasks.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setSearchOpen(false);
                          setSearchQuery('');
                          navigate('/work-allocation');
                        }}
                        className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-[#F7F7FC] flex items-center justify-between gap-2"
                      >
                        <span className="font-medium text-[#0B1230] truncate">{t.title}</span>
                        <span className="text-[#69718A] shrink-0">{t.id}</span>
                      </button>
                    ))}
                  </div>
                )}
                {globalResults.projects.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold text-[#69718A] px-2 mb-1">Projects</p>
                    {globalResults.projects.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setSearchOpen(false);
                          setSearchQuery('');
                          navigate('/projects');
                        }}
                        className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-[#F7F7FC] flex items-center justify-between"
                      >
                        <span className="font-medium text-[#0B1230]">{p.name}</span>
                        <span className="text-[#69718A]">{p.code}</span>
                      </button>
                    ))}
                  </div>
                )}
                {globalResults.requests.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold text-[#69718A] px-2 mb-1">Requests</p>
                    {globalResults.requests.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => {
                          setSearchOpen(false);
                          setSearchQuery('');
                          navigate('/approvals');
                        }}
                        className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-[#F7F7FC] flex items-center justify-between"
                      >
                        <span className="font-medium text-[#0B1230]">{r.employeeName} · {r.leaveType}</span>
                        <span className="text-[#69718A]">{r.id}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Scope, Role Switcher, Notifications, Profile */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Team / Branch Scope Filter on Desktop */}
        {managerTeams.length > 1 && (
          <select
            aria-label="Filter by assigned team"
            value={selectedTeamFilter}
            onChange={(e) => setSelectedTeamFilter(e.target.value)}
            className="hidden xl:block h-9 px-2.5 text-xs font-medium bg-[#F7F7FC] border border-[#E4E6F0] rounded-lg text-[#0B1230] focus:outline-none focus:border-[#7050F5]"
          >
            <option value="all">All Assigned Teams</option>
            {managerTeams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        )}

        {managerBranches.length > 1 && (
          <select
            aria-label="Filter by assigned branch"
            value={selectedBranchFilter}
            onChange={(e) => setSelectedBranchFilter(e.target.value)}
            className="hidden 2xl:block h-9 px-2.5 text-xs font-medium bg-[#F7F7FC] border border-[#E4E6F0] rounded-lg text-[#0B1230] focus:outline-none focus:border-[#7050F5]"
          >
            <option value="all">All Branches</option>
            {managerBranches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        )}

        {/* Role & Demo Account Switcher */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setRoleMenuOpen((v) => !v);
              setNotifOpen(false);
              setProfileOpen(false);
            }}
            className="h-9 px-3 rounded-lg border border-[#E4E6F0] bg-[#F7F7FC] hover:bg-[#EEF0F7] text-xs font-semibold text-[#0B1230] flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <Building2 className="h-3.5 w-3.5 text-[#7050F5]" />
            <span className="hidden sm:inline">{activeRole}</span>
            <span className="sm:hidden">Role</span>
            <ChevronDown className="h-3.5 w-3.5 text-[#5A627A]" />
          </button>

          {roleMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-[#E4E6F0] rounded-xl shadow-xl p-3 z-50">
              {currentManager.roles.length > 1 && (
                <div className="pb-2.5 mb-2.5 border-b border-[#EEF0F7]">
                  <p className="text-[11px] font-semibold text-[#69718A] px-2 mb-1.5">
                    Assigned Roles ({currentManager.name})
                  </p>
                  <div className="space-y-1">
                    {currentManager.roles.map((r: ManagerRole) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => {
                          switchActiveRole(r);
                          setRoleMenuOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between ${
                          activeRole === r
                            ? 'bg-[#7050F5]/10 text-[#7050F5] font-semibold'
                            : 'text-[#0B1230] hover:bg-[#F7F7FC]'
                        }`}
                      >
                        <span>{r}</span>
                        {activeRole === r && <span className="text-[11px]">Active</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-[11px] font-semibold text-[#69718A] px-2 mb-1.5">
                  Demo Manager Accounts (7 Roles)
                </p>
                <div className="space-y-1 max-h-60 overflow-y-auto scrollbar-thin">
                  {managerAccounts.map((acc) => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => {
                        switchManagerAccount(acc.id);
                        setRoleMenuOpen(false);
                        navigate('/dashboard');
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center gap-2.5 ${
                        acc.id === currentManager.id
                          ? 'bg-[#0B1230] text-white'
                          : 'text-[#0B1230] hover:bg-[#F7F7FC]'
                      }`}
                    >
                      <AvatarBadge name={acc.name} src={acc.avatarUrl} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold truncate">{acc.name}</p>
                        <p className={`text-[11px] truncate ${acc.id === currentManager.id ? 'text-white/75' : 'text-[#5A627A]'}`}>
                          {acc.primaryRole}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pending Approvals Quick Link */}
        <button
          type="button"
          onClick={() => navigate('/approvals')}
          className="hidden sm:inline-flex items-center gap-1.5 h-9 px-2.5 rounded-lg border border-[#E4E6F0] hover:border-[#7050F5]/50 bg-white text-xs font-medium text-[#0B1230] whitespace-nowrap shrink-0"
          title="Pending Approvals"
        >
          <span>Approvals</span>
          <span className="px-1.5 py-0.5 rounded bg-[#7050F5]/10 text-[#7050F5] font-semibold tabular-nums">
            {pendingApprovalsCount}
          </span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setNotifOpen((v) => !v);
              setProfileOpen(false);
              setRoleMenuOpen(false);
            }}
            className="relative h-9 w-9 rounded-lg border border-[#E4E6F0] bg-white hover:bg-[#F7F7FC] flex items-center justify-center text-[#0B1230]"
            aria-label="Open notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded bg-[#E05252] text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E4E6F0] rounded-xl shadow-xl p-3 z-50">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#EEF0F7]">
                <span className="text-xs font-semibold text-[#0B1230]">Notification Centre</span>
                <button
                  type="button"
                  onClick={markAllNotificationsRead}
                  className="text-[11px] font-medium text-[#7050F5] hover:underline"
                >
                  Mark all read
                </button>
              </div>
              <div className="space-y-1.5 max-h-72 overflow-y-auto scrollbar-thin">
                {notifications.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => {
                      markNotificationRead(n.id);
                      setNotifOpen(false);
                      navigate(n.route);
                    }}
                    className={`w-full text-left p-2.5 rounded-lg transition-colors ${
                      n.read ? 'bg-white hover:bg-[#F7F7FC]' : 'bg-[#7050F5]/[0.05] hover:bg-[#7050F5]/10'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-[#0B1230] truncate">{n.title}</span>
                      <span className="text-[11px] text-[#69718A] shrink-0">{n.timestamp}</span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-[#5A627A] leading-snug">{n.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Help Button */}
        <button
          type="button"
          onClick={() => setHelpOpen((v) => !v)}
          className="hidden sm:flex h-9 w-9 rounded-lg border border-[#E4E6F0] bg-white hover:bg-[#F7F7FC] items-center justify-center text-[#5A627A] hover:text-[#0B1230]"
          aria-label="Portal guide"
        >
          <HelpCircle className="h-4 w-4" />
        </button>

        {/* Profile Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setProfileOpen((v) => !v);
              setNotifOpen(false);
              setRoleMenuOpen(false);
            }}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-[#F7F7FC] transition-colors"
          >
            <AvatarBadge name={currentManager.name} src={currentManager.avatarUrl} size="sm" />
            <div className="hidden lg:block text-left leading-tight">
              <span className="block text-xs font-semibold text-[#0B1230] whitespace-nowrap">
                {currentManager.name}
              </span>
              <span className="block text-[11px] text-[#5A627A] whitespace-nowrap">
                {activeRole}
              </span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-[#5A627A] hidden lg:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E4E6F0] rounded-xl shadow-xl py-2 z-50 text-xs">
              <div className="px-3.5 py-2 border-b border-[#EEF0F7]">
                <p className="font-semibold text-[#0B1230]">{currentManager.name}</p>
                <p className="text-[11px] text-[#5A627A] truncate">{currentManager.email}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false);
                  navigate('/profile');
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-[#F7F7FC] flex items-center gap-2 text-[#0B1230]"
              >
                <User className="h-3.5 w-3.5 text-[#5A627A]" />
                <span>My Profile & Assigned Roles</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false);
                  navigate('/team');
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-[#F7F7FC] flex items-center gap-2 text-[#0B1230]"
              >
                <Users className="h-3.5 w-3.5 text-[#5A627A]" />
                <span>My Team ({scopedEmployees.length})</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false);
                  navigate('/profile?tab=workload');
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-[#F7F7FC] flex items-center gap-2 text-[#0B1230]"
              >
                <Shield className="h-3.5 w-3.5 text-[#5A627A]" />
                <span>Login History & Security</span>
              </button>
              <div className="my-1 border-t border-[#EEF0F7]" />
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false);
                  pushToast({
                    title: 'Session locked for demo preview',
                    description: 'Use the Role menu in the top bar to switch manager personas.',
                    variant: 'info',
                  });
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-[#F7F7FC] flex items-center gap-2 text-[#E05252]"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Help Popover Modal */}
      {helpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1230]/40 p-4">
          <div className="bg-white border border-[#E4E6F0] rounded-xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[#0B1230]">PayFuse Manager Portal Guide</h3>
              <button type="button" onClick={() => setHelpOpen(false)} className="text-[#5A627A] hover:text-[#0B1230]">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2.5 text-xs text-[#5A627A] leading-relaxed">
              <p>
                <strong className="text-[#0B1230]">Demo Dataset Notice:</strong> This portal uses a 100-employee multi-industry sample dataset across 5 departments, 3 branches, 3 projects, and 2 operational sites.
              </p>
              <p>
                <strong className="text-[#0B1230]">Role & Scope Isolation:</strong> Use the role switcher in the header to test all 7 supervisor personas. Each persona only views authorised teams, sites, projects, or branches, with HR salary/bank fields protected.
              </p>
              <p>
                <strong className="text-[#0B1230]">Auditable Actions:</strong> Every approval, shift assignment, regularisation, and incident escalation is logged in the audit trail.
              </p>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setHelpOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#7050F5] hover:bg-[#5D3EE0] rounded-lg"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
