import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Building2,
  Calendar,
  CheckSquare,
  Clock,
  FolderKanban,
  HardHat,
  Headphones,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useApp } from '../../app/AppContext';
import { KPIStatCard } from '../../components/ui/KPIStatCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ManagerRole } from '../../types';
import { formatDateShort, getGreeting } from '../../utils/formatters';
import { ApprovalQueue } from './ApprovalQueue';
import { DateRangeOption, TeamAttendanceCard } from './TeamAttendanceCard';
import { TeamAvailability } from './TeamAvailability';
import { TeamPerformanceChart } from './TeamPerformanceChart';
import { WorkloadChart } from './WorkloadChart';

export const DashboardPage: React.FC = () => {
  const {
    currentManager,
    activeRole,
    scopedEmployees,
    scopedLeaves,
    scopedOvertime,
    scopedRegularisations,
    scopedShiftSwaps,
    scopedTasks,
    scopedProjects,
    scopedSites,
    scopedIncidents,
    shifts,
    branches,
    teams,
    departments,
    auditLogs,
    handoverLogs,
    callCentreIntegrationConnected,
  } = useApp();

  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<DateRangeOption>('7d');

  // Derived consistent KPIs from scoped repository
  const metrics = useMemo(() => {
    const total = scopedEmployees.length;
    const allocated = scopedEmployees.filter((e) => e.projectId || e.siteId || e.workloadPercent >= 70).length;
    const present = scopedEmployees.filter((e) => e.todayStatus === 'Present' || e.todayStatus === 'On Break').length;
    const late = scopedEmployees.filter((e) => e.todayStatus === 'Late').length;
    const absent = scopedEmployees.filter((e) => e.todayStatus === 'Absent' || e.todayStatus === 'Missing Punch').length;
    const onLeave = scopedEmployees.filter((e) => e.todayStatus === 'On Leave').length;
    const attendancePct = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

    const pendingLeave = scopedLeaves.filter((l) => l.status === 'Pending').length;
    const pendingAtt = scopedRegularisations.filter((r) => r.status === 'Pending').length;
    const pendingOt = scopedOvertime.filter((o) => o.status === 'Pending').length;
    const pendingSwaps = scopedShiftSwaps.filter((s) => s.status === 'Pending').length;
    const totalPending = pendingLeave + pendingAtt + pendingOt + pendingSwaps;

    const scheduled = scopedEmployees.filter((e) => e.todayStatus !== 'Not Scheduled').length;
    const requiredShifts = Math.max(scheduled, Math.round(total * 0.92));
    const coveragePct = requiredShifts > 0 ? Math.min(100, Math.round(((present + late) / requiredShifts) * 100)) : 0;

    const completedTasks = scopedTasks.filter((t) => t.status === 'Completed' || t.status === 'Verified').length;
    const pendingTasks = scopedTasks.filter((t) => !['Completed', 'Verified', 'Cancelled'].includes(t.status)).length;
    const overdueTasks = scopedTasks.filter(
      (t) => t.dueDate < '2026-11-14' && !['Completed', 'Verified', 'Cancelled'].includes(t.status)
    ).length;
    const taskTargetPct = scopedTasks.length > 0 ? Math.round((completedTasks / scopedTasks.length) * 100) : 85;

    return {
      total,
      allocated,
      present,
      late,
      absent,
      onLeave,
      attendancePct,
      pendingLeave,
      pendingAtt,
      pendingOt,
      pendingSwaps,
      totalPending,
      scheduled,
      requiredShifts,
      coveragePct,
      completedTasks,
      pendingTasks,
      overdueTasks,
      taskTargetPct,
    };
  }, [scopedEmployees, scopedLeaves, scopedRegularisations, scopedOvertime, scopedShiftSwaps, scopedTasks]);

  const shiftCoverageRows = useMemo(() => {
    return shifts.map((sh) => {
      const assignedList = scopedEmployees.filter((e) => e.shiftId === sh.id);
      const assigned = assignedList.length;
      const required = Math.max(assigned, Math.round(assigned * 1.05));
      const present = assignedList.filter((e) => e.todayStatus === 'Present' || e.todayStatus === 'Late' || e.todayStatus === 'On Break').length;
      const missing = Math.max(0, required - present);
      const pct = required > 0 ? Math.round((present / required) * 100) : 100;
      return {
        ...sh,
        required,
        assigned,
        present,
        missing,
        pct,
        understaffed: required > 0 && pct < 85,
      };
    });
  }, [shifts, scopedEmployees]);

  const upcomingEvents = useMemo(() => {
    const events: Array<{ id: string; title: string; meta: string; date: string; category: string }> = [];

    scopedEmployees.slice(0, 2).forEach((emp) => {
      events.push({
        id: `bday-${emp.id}`,
        title: `${emp.name} — Birthday`,
        meta: `${emp.departmentName} · ${emp.teamName}`,
        date: emp.birthdayMonthDay,
        category: 'Celebration',
      });
    });

    scopedLeaves
      .filter((l) => l.status === 'Approved' || l.status === 'Pending')
      .slice(0, 2)
      .forEach((l) => {
        events.push({
          id: `lv-${l.id}`,
          title: `${l.employeeName} — ${l.leaveType}`,
          meta: `${l.requestedDays} day(s) · ${l.status}`,
          date: formatDateShort(l.startDate),
          category: 'Leave',
        });
      });

    scopedProjects.slice(0, 2).forEach((p) => {
      const nextMilestone = p.milestones.find((m) => !m.completed);
      if (nextMilestone) {
        events.push({
          id: `ms-${p.id}`,
          title: `${p.name}: ${nextMilestone.title}`,
          meta: `${p.client} · Milestone Due`,
          date: formatDateShort(nextMilestone.dueDate),
          category: 'Project',
        });
      }
    });

    return events.slice(0, 6);
  }, [scopedEmployees, scopedLeaves, scopedProjects]);

  const recentActivities = useMemo(() => {
    const items = auditLogs.slice(0, 3).map((a) => ({
      id: a.id,
      title: `${a.actorName} — ${a.action}`,
      detail: a.details,
      time: a.timestamp,
    }));

    scopedEmployees.slice(0, 3).forEach((e) => {
      items.push({
        id: `chk-${e.id}`,
        title: `${e.name} checked in (${e.shiftName})`,
        detail: `${e.workLocation} · ${e.checkInTime || 'Scheduled'}`,
        time: e.checkInTime ? `Today ${e.checkInTime}` : 'Today',
      });
    });

    return items.slice(0, 6);
  }, [auditLogs, scopedEmployees]);

  // Role-specific operational highlight card (Part 2 — 7 distinct role dashboards)
  const roleContextPanel = useMemo(() => {
    const deptNames = departments
      .filter((d) => currentManager.assignedDepartments.includes(d.id))
      .map((d) => d.name)
      .join(', ');
    const teamNames = teams
      .filter((t) => currentManager.assignedTeams.includes(t.id))
      .map((t) => t.name)
      .join(', ');

    if (activeRole === ManagerRole.ProjectManager) {
      return {
        heading: 'Project Delivery & Resource Allocation Focus',
        summary: `Managing ${scopedProjects.length} active client project(s) with ${metrics.allocated} deployed specialists.`,
        ctaLabel: 'Open Project Allocation',
        ctaRoute: '/projects',
        icon: FolderKanban,
        highlights: scopedProjects.map((p) => ({
          label: `${p.code} · ${p.name}`,
          value: `${p.progressPercent}% (${p.status})`,
        })),
      };
    }
    if (activeRole === ManagerRole.SiteManager) {
      const contractors = scopedEmployees.filter((e) => e.isContractor).length;
      const openIncidents = scopedIncidents.filter((i) => i.status !== 'Resolved').length;
      return {
        heading: 'Site Workforce & Safety Observation Focus',
        summary: `Supervising ${scopedSites.length} operational site(s) · ${contractors} contractor workers · ${openIncidents} active site incident(s).`,
        ctaLabel: 'Open Site Operations',
        ctaRoute: '/sites',
        icon: HardHat,
        highlights: scopedSites.map((s) => ({
          label: s.name,
          value: `${s.status} · ${s.activeContractorsCount} contractors`,
        })),
      };
    }
    if (activeRole === ManagerRole.ShiftSupervisor) {
      const understaffed = shiftCoverageRows.filter((s) => s.understaffed).length;
      return {
        heading: 'Shift Continuity & Handover Focus',
        summary: `${handoverLogs.length} shift handovers logged · ${understaffed} understaffed shift window(s) requiring roster balancing.`,
        ctaLabel: 'Manage Shift Roster',
        ctaRoute: '/shifts',
        icon: Clock,
        highlights: shiftCoverageRows.slice(0, 3).map((s) => ({
          label: `${s.name} (${s.startTime}–${s.endTime})`,
          value: `${s.pct}% covered`,
        })),
      };
    }
    if (activeRole === ManagerRole.BranchManager) {
      const myBranches = branches.filter((b) => currentManager.assignedBranches.includes(b.id));
      return {
        heading: 'Branch Floor Coverage & Operational Targets',
        summary: `Overseeing ${myBranches.length} branch location(s) with configurable service and work-completion targets.`,
        ctaLabel: 'Open Branch Operations',
        ctaRoute: '/operations/branches',
        icon: Building2,
        highlights: myBranches.map((b) => ({
          label: `${b.name} (${b.configuredTargetType})`,
          value: `${b.actualValue}${b.targetUnit} / Target ${b.targetValue}${b.targetUnit}`,
        })),
      };
    }
    if (activeRole === ManagerRole.CallCentreSupervisor) {
      const onCall = scopedEmployees.filter((e) => e.callLoginStatus === 'On Call').length;
      const onBreak = scopedEmployees.filter((e) => e.todayStatus === 'On Break').length;
      return {
        heading: 'Queue Staffing & Break Adherence Focus',
        summary: `Live agent supervision · ${onCall} agents active · ${onBreak} on scheduled break · Telephony ACD: ${
          callCentreIntegrationConnected ? 'Connected' : 'Not Connected'
        }.`,
        ctaLabel: 'Open Call Centre Ops',
        ctaRoute: '/operations/call-centre',
        icon: Headphones,
        highlights: [
          { label: 'Scheduled Voice Agents', value: `${scopedEmployees.length}` },
          { label: 'Scheduled Break Adherence', value: `${Math.round((scopedEmployees.filter((e) => e.breakStatus !== 'Extended').length / Math.max(1, scopedEmployees.length)) * 100)}%` },
          { label: 'ACD Telemetry Feed', value: callCentreIntegrationConnected ? 'Active' : 'Connect in Call Centre' },
        ],
      };
    }
    if (activeRole === ManagerRole.TeamLeader) {
      return {
        heading: 'Daily Team Execution & Task Coordination',
        summary: `Leading ${teamNames || 'Assigned Team'} · ${metrics.pendingTasks} active tasks (${metrics.overdueTasks} overdue).`,
        ctaLabel: 'Open Task Board',
        ctaRoute: '/work-allocation',
        icon: CheckSquare,
        highlights: [
          { label: 'Team Members Present', value: `${metrics.present + metrics.late} / ${metrics.total}` },
          { label: 'Pending Team Requests', value: `${metrics.totalPending}` },
          { label: 'Task Completion Rate', value: `${metrics.taskTargetPct}%` },
        ],
      };
    }
    return {
      heading: 'Department Workforce & Operational Supervision',
      summary: `Department scope: ${deptNames} · Teams: ${teamNames}.`,
      ctaLabel: 'View Team Directory',
      ctaRoute: '/team',
      icon: Users,
      highlights: [
        { label: 'Active Workforce', value: `${metrics.total} employees` },
        { label: 'Attendance Adherence', value: `${metrics.attendancePct}%` },
        { label: 'Pending Approvals', value: `${metrics.totalPending} items` },
      ],
    };
  }, [
    activeRole,
    branches,
    callCentreIntegrationConnected,
    currentManager,
    departments,
    handoverLogs.length,
    metrics,
    scopedEmployees,
    scopedIncidents,
    scopedProjects,
    scopedSites,
    shiftCoverageRows,
    teams,
  ]);

  const RoleIcon = roleContextPanel.icon;
  const assignedTeamLabel = teams
    .filter((t) => currentManager.assignedTeams.includes(t.id))
    .map((t) => t.name)
    .join(', ');
  const assignedDeptLabel = departments
    .filter((d) => currentManager.assignedDepartments.includes(d.id))
    .map((d) => d.name)
    .join(', ');

  return (
    <div className="space-y-6">
      {/* Header & Manager Context */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0B1230]">
            {getGreeting()}, Manager
          </h1>
          <p className="mt-1 text-sm text-[#5A627A]">
            Here&apos;s your team&apos;s workforce and operational overview.
          </p>
          <div className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[#5A627A]">
            <span className="font-semibold text-[#0B1230]">{currentManager.name}</span>
            <span aria-hidden="true">·</span>
            <span>{currentManager.designation}</span>
            <span aria-hidden="true">·</span>
            <span>{assignedDeptLabel}</span>
            <span aria-hidden="true">·</span>
            <span>Team: {assignedTeamLabel}</span>
            <span aria-hidden="true">·</span>
            <span>{currentManager.location}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">Saturday, 14 Nov 2026</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => navigate('/work-allocation')}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#7050F5] hover:bg-[#5D3EE0] rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            Assign Work
          </button>
          <button
            type="button"
            onClick={() => navigate('/approvals')}
            className="px-4 py-2 text-xs font-semibold text-[#0B1230] bg-white border border-[#E4E6F0] hover:bg-[#F7F7FC] rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            Review Approvals ({metrics.totalPending})
          </button>
        </div>
      </section>

      {/* Role-Tailored Operational Strip */}
      <section className="bg-white border border-[#E4E6F0] rounded-xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="h-10 w-10 rounded-lg bg-[#7050F5]/10 text-[#7050F5] flex items-center justify-center shrink-0">
            <RoleIcon className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-[#7050F5] font-semibold">
              <span>{activeRole} Workspace</span>
            </div>
            <h2 className="text-sm font-semibold text-[#0B1230] mt-0.5">{roleContextPanel.heading}</h2>
            <p className="text-xs text-[#5A627A] mt-0.5">{roleContextPanel.summary}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 lg:gap-6">
          {roleContextPanel.highlights.map((h) => (
            <div key={h.label} className="text-xs">
              <span className="block text-[#69718A]">{h.label}</span>
              <span className="font-semibold text-[#0B1230] tabular-nums">{h.value}</span>
            </div>
          ))}
          <button
            type="button"
            onClick={() => navigate(roleContextPanel.ctaRoute)}
            className="px-3.5 py-2 text-xs font-semibold text-[#7050F5] bg-[#7050F5]/10 hover:bg-[#7050F5]/15 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            {roleContextPanel.ctaLabel}
          </button>
        </div>
      </section>

      {/* A. Five KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <KPIStatCard
          title="My Team"
          primaryValue={metrics.total}
          primaryUnit="Assigned"
          icon={<Users className="h-4 w-4" />}
          onClick={() => navigate('/team')}
          breakdown={[
            { label: 'Active', value: metrics.total - metrics.onLeave, tone: 'success' },
            { label: 'Allocated', value: metrics.allocated },
          ]}
        />
        <KPIStatCard
          title="Present Today"
          primaryValue={`${metrics.attendancePct}%`}
          primaryUnit={`${metrics.present + metrics.late}/${metrics.total}`}
          icon={<Clock className="h-4 w-4" />}
          onClick={() => navigate('/attendance')}
          breakdown={[
            { label: 'Present', value: metrics.present, tone: 'success' },
            { label: 'Late', value: metrics.late, tone: 'warning' },
            { label: 'Leave', value: metrics.onLeave },
            { label: 'Absent', value: metrics.absent, tone: metrics.absent > 0 ? 'error' : 'default' },
          ]}
        />
        <KPIStatCard
          title="Pending Approvals"
          primaryValue={metrics.totalPending}
          primaryUnit="Queue"
          icon={<CheckSquare className="h-4 w-4" />}
          onClick={() => navigate('/approvals')}
          breakdown={[
            { label: 'Leave', value: metrics.pendingLeave },
            { label: 'Att.', value: metrics.pendingAtt },
            { label: 'OT', value: metrics.pendingOt },
            { label: 'Swap', value: metrics.pendingSwaps },
          ]}
        />
        <KPIStatCard
          title="Shift Coverage"
          primaryValue={`${metrics.coveragePct}%`}
          primaryUnit={`${metrics.present + metrics.late}/${metrics.requiredShifts}`}
          icon={<Calendar className="h-4 w-4" />}
          onClick={() => navigate('/shifts')}
          breakdown={[
            { label: 'Required', value: metrics.requiredShifts },
            { label: 'Scheduled', value: metrics.scheduled },
            { label: 'Avail.', value: metrics.present, tone: 'success' },
          ]}
        />
        <KPIStatCard
          title="Team Productivity"
          primaryValue={`${metrics.taskTargetPct}%`}
          primaryUnit="Target"
          icon={<TrendingUp className="h-4 w-4" />}
          onClick={() => navigate('/performance')}
          breakdown={[
            { label: 'Done', value: metrics.completedTasks, tone: 'success' },
            { label: 'Pending', value: metrics.pendingTasks },
            { label: 'Overdue', value: metrics.overdueTasks, tone: metrics.overdueTasks > 0 ? 'error' : 'default' },
          ]}
        />
      </section>

      {/* B & C. Attendance Trend + Team Distribution */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2">
          <TeamAttendanceCard range={dateRange} onRangeChange={setDateRange} />
        </div>
        <WorkloadChart />
      </section>

      {/* D & G & I. Shift Coverage + Team Performance + Team Availability */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Shift Coverage Card */}
        <div className="bg-white border border-[#E4E6F0] rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2 mb-4">
            <div>
              <h3 className="text-sm font-semibold text-[#0B1230]">Shift Coverage</h3>
              <p className="text-xs text-[#5A627A]">Scheduled vs present across active shift windows</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/shifts')}
              className="text-xs font-semibold text-[#7050F5] hover:underline whitespace-nowrap shrink-0"
            >
              Roster
            </button>
          </div>

          <div className="space-y-3.5">
            {shiftCoverageRows.map((sh) => (
              <div key={sh.id} className="pb-3 border-b border-[#EEF0F7] last:border-b-0 last:pb-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div>
                    <span className="text-xs font-semibold text-[#0B1230]">{sh.name}</span>
                    <span className="ml-2 text-[11px] text-[#69718A] tabular-nums">
                      {sh.startTime}–{sh.endTime}
                    </span>
                  </div>
                  {sh.understaffed ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#E05252]">
                      <AlertTriangle className="h-3 w-3" />
                      Understaffed ({sh.pct}%)
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-[#16A36A] tabular-nums">{sh.pct}%</span>
                  )}
                </div>
                <div className="h-1.5 w-full bg-[#EEF0F7] rounded-full overflow-hidden mb-1.5">
                  <div
                    className={`h-full rounded-full ${sh.understaffed ? 'bg-[#E05252]' : 'bg-[#7050F5]'}`}
                    style={{ width: `${sh.pct}%` }}
                  />
                </div>
                <div className="flex items-center gap-3 text-[11px] text-[#69718A] tabular-nums">
                  <span>Req: {sh.required}</span>
                  <span>·</span>
                  <span>Assigned: {sh.assigned}</span>
                  <span>·</span>
                  <span>Present: {sh.present}</span>
                  <span>·</span>
                  <span className={sh.missing > 0 ? 'text-[#E05252] font-medium' : ''}>Missing: {sh.missing}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <TeamPerformanceChart />
        <TeamAvailability />
      </section>

      {/* E. Pending Approvals Table */}
      <ApprovalQueue limit={6} />

      {/* F & H. Upcoming Team Events + Recent Team Activities */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white border border-[#E4E6F0] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-[#0B1230]">Upcoming Team Events</h3>
              <p className="text-xs text-[#5A627A]">Scheduled leave, project milestones, and authorised celebrations</p>
            </div>
          </div>
          <ul className="divide-y divide-[#EEF0F7]">
            {upcomingEvents.map((ev) => (
              <li key={ev.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-[#0B1230] truncate">{ev.title}</p>
                  <p className="text-xs text-[#5A627A] truncate">{ev.meta}</p>
                </div>
                <div className="text-right shrink-0">
                  <StatusBadge status={ev.category === 'Leave' ? 'On Leave' : ev.category === 'Project' ? 'Active' : 'Nominal'} compact />
                  <span className="block mt-1 text-[11px] text-[#69718A] tabular-nums">{ev.date}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white border border-[#E4E6F0] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-[#0B1230]">Recent Team Activities</h3>
              <p className="text-xs text-[#5A627A]">Live check-ins, approvals, shift handovers, and assignments</p>
            </div>
          </div>
          <ul className="divide-y divide-[#EEF0F7]">
            {recentActivities.map((act) => (
              <li key={act.id} className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-[#0B1230] truncate">{act.title}</p>
                  <p className="text-xs text-[#5A627A] truncate">{act.detail}</p>
                </div>
                <span className="text-[11px] text-[#69718A] whitespace-nowrap shrink-0 tabular-nums">{act.time}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
};
