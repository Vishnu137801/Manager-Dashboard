import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowRightLeft,
  CalendarDays,
  ClipboardPlus,
  Eye,
  GitBranch,
  Lock,
  Megaphone,
  Users,
} from 'lucide-react';
import { useApp } from '../../app/AppContext';
import { ActivityTimeline } from '../../components/ui/ActivityTimeline';
import { AvatarBadge } from '../../components/ui/AvatarBadge';
import { ColumnDef, DataTable } from '../../components/ui/DataTable';
import { DetailDrawer } from '../../components/ui/DetailDrawer';
import { EmployeeProfileCard } from '../../components/ui/EmployeeProfileCard';
import { FilterBar } from '../../components/ui/FilterBar';
import { FormModal } from '../../components/ui/FormModal';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Employee } from '../../types';
import { formatDateShort } from '../../utils/formatters';

type TeamTab = 'directory' | 'organisation' | 'availability';
type ProfileTab = 'overview' | 'attendance' | 'leave' | 'shifts' | 'assignments' | 'performance' | 'activity';

export const TeamPage: React.FC = () => {
  const {
    currentManager,
    scopedEmployees,
    scopedAttendance,
    scopedLeaves,
    scopedShiftAssignments,
    scopedTasks,
    scopedKPIs,
    auditLogs,
    teams,
    departments,
    shifts,
    branches,
    scopedProjects,
    requestEmployeeTransfer,
  } = useApp();

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState<TeamTab>('directory');
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [shiftFilter, setShiftFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [profileTab, setProfileTab] = useState<ProfileTab>('overview');

  const [transferTarget, setTransferTarget] = useState<Employee | null>(null);
  const [transferTeamId, setTransferTeamId] = useState('');
  const [transferReason, setTransferReason] = useState('');

  useEffect(() => {
    const empId = searchParams.get('employee');
    if (empId) {
      const found = scopedEmployees.find((e) => e.id === empId);
      if (found) setSelectedEmployee(found);
    }
    const tabParam = searchParams.get('tab');
    if (tabParam === 'organisation' || tabParam === 'availability' || tabParam === 'directory') {
      setActiveTab(tabParam);
    }
  }, [searchParams, scopedEmployees]);

  const filteredEmployees = useMemo(() => {
    const q = search.trim().toLowerCase();
    return scopedEmployees.filter((e) => {
      if (q && !e.name.toLowerCase().includes(q) && !e.employeeCode.toLowerCase().includes(q) && !e.designation.toLowerCase().includes(q)) {
        return false;
      }
      if (deptFilter !== 'all' && e.departmentId !== deptFilter) return false;
      if (shiftFilter !== 'all' && e.shiftId !== shiftFilter) return false;
      if (statusFilter !== 'all' && e.todayStatus !== statusFilter) return false;
      if (locationFilter !== 'all' && e.branchId !== locationFilter) return false;
      if (typeFilter !== 'all' && e.employmentType !== typeFilter) return false;
      if (projectFilter !== 'all' && e.projectId !== projectFilter) return false;
      return true;
    });
  }, [scopedEmployees, search, deptFilter, shiftFilter, statusFilter, locationFilter, typeFilter, projectFilter]);

  const columns: ColumnDef<Employee>[] = [
    {
      key: 'code',
      header: 'Employee ID',
      sortValue: (r) => r.employeeCode,
      render: (r) => <span className="font-mono text-xs font-semibold text-[#0B1230]">{r.employeeCode}</span>,
    },
    {
      key: 'name',
      header: 'Employee',
      sortValue: (r) => r.name,
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <AvatarBadge name={r.name} initials={r.initials} src={r.avatarUrl} size="sm" />
          <div className="min-w-0">
            <p className="font-semibold text-[#0B1230] whitespace-nowrap">{r.name}</p>
            <p className="text-[11px] text-[#5A627A] truncate">{r.designation}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'dept',
      header: 'Department / Team',
      sortValue: (r) => r.departmentName,
      render: (r) => (
        <div>
          <p className="text-xs font-medium text-[#0B1230] whitespace-nowrap">{r.departmentName}</p>
          <p className="text-[11px] text-[#69718A] whitespace-nowrap">{r.teamName}</p>
        </div>
      ),
    },
    {
      key: 'shift',
      header: 'Assigned Shift',
      sortValue: (r) => r.shiftName,
      render: (r) => <span className="text-xs text-[#0B1230] whitespace-nowrap">{r.shiftName}</span>,
    },
    {
      key: 'location',
      header: 'Work Location',
      sortValue: (r) => r.workLocation,
      render: (r) => <span className="text-xs text-[#5A627A] whitespace-nowrap">{r.workLocation}</span>,
    },
    {
      key: 'status',
      header: 'Attendance',
      sortValue: (r) => r.todayStatus,
      render: (r) => <StatusBadge status={r.todayStatus} compact />,
    },
    {
      key: 'workload',
      header: 'Workload',
      align: 'right',
      sortValue: (r) => r.workloadPercent,
      render: (r) => (
        <div className="inline-flex items-center gap-2 justify-end">
          <div className="w-16 h-1.5 bg-[#EEF0F7] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                r.workloadPercent > 95 ? 'bg-[#E05252]' : r.workloadPercent < 65 ? 'bg-[#478BFA]' : 'bg-[#7050F5]'
              }`}
              style={{ width: `${Math.min(100, r.workloadPercent)}%` }}
            />
          </div>
          <span className="text-xs font-semibold tabular-nums">{r.workloadPercent}%</span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (r) => (
        <div className="inline-flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => {
              setSelectedEmployee(r);
              setProfileTab('overview');
            }}
            className="p-1.5 rounded-md text-[#5A627A] hover:text-[#7050F5] hover:bg-[#7050F5]/10"
            title="View Profile"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => navigate(`/work-allocation?assign=${r.id}`)}
            className="p-1.5 rounded-md text-[#5A627A] hover:text-[#7050F5] hover:bg-[#7050F5]/10"
            title="Assign Work"
          >
            <ClipboardPlus className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              setTransferTarget(r);
              setTransferTeamId(teams.find((t) => t.id !== r.teamId)?.id || teams[0].id);
            }}
            className="p-1.5 rounded-md text-[#5A627A] hover:text-[#0B1230] hover:bg-[#EEF0F7]"
            title="Request Transfer"
          >
            <ArrowRightLeft className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  // Availability 7-day projection matrix
  const availabilityDays = ['14 Nov', '15 Nov', '16 Nov', '17 Nov', '18 Nov', '19 Nov', '20 Nov'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#0B1230]">Team Management</h1>
          <p className="text-xs text-[#5A627A] mt-0.5">
            Authorised directory, reporting hierarchy, and availability for {scopedEmployees.length} team members
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/communication')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#0B1230] bg-white border border-[#E4E6F0] hover:bg-[#F7F7FC] rounded-lg whitespace-nowrap shrink-0"
          >
            <Megaphone className="h-3.5 w-3.5 text-[#7050F5]" />
            <span>Send Team Announcement</span>
          </button>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="inline-flex items-center gap-1 p-1 bg-white border border-[#E4E6F0] rounded-xl">
        {[
          { id: 'directory' as const, label: 'Team Directory', icon: Users },
          { id: 'organisation' as const, label: 'Team Organisation', icon: GitBranch },
          { id: 'availability' as const, label: 'Employee Availability', icon: CalendarDays },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                setSearchParams({ tab: tab.id });
              }}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                active ? 'bg-[#7050F5] text-white' : 'text-[#5A627A] hover:text-[#0B1230]'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeTab === 'directory' && (
        <div className="space-y-4">
          <FilterBar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search name, ID, or designation..."
            selects={[
              {
                key: 'dept',
                label: 'Department',
                value: deptFilter,
                onChange: setDeptFilter,
                options: departments.map((d) => ({ label: d.name, value: d.id })),
              },
              {
                key: 'shift',
                label: 'Shift',
                value: shiftFilter,
                onChange: setShiftFilter,
                options: shifts.map((s) => ({ label: s.name, value: s.id })),
              },
              {
                key: 'status',
                label: 'Status',
                value: statusFilter,
                onChange: setStatusFilter,
                options: ['Present', 'Late', 'On Leave', 'Absent', 'Missing Punch', 'On Break', 'Not Scheduled'].map(
                  (s) => ({ label: s, value: s })
                ),
              },
              {
                key: 'location',
                label: 'Branch',
                value: locationFilter,
                onChange: setLocationFilter,
                options: branches.map((b) => ({ label: b.name, value: b.id })),
              },
              {
                key: 'type',
                label: 'Type',
                value: typeFilter,
                onChange: setTypeFilter,
                options: ['Full-Time', 'Shift Staff', 'Contract', 'Part-Time'].map((t) => ({ label: t, value: t })),
              },
              {
                key: 'project',
                label: 'Project',
                value: projectFilter,
                onChange: setProjectFilter,
                options: scopedProjects.map((p) => ({ label: p.name, value: p.id })),
              },
            ]}
            onReset={() => {
              setSearch('');
              setDeptFilter('all');
              setShiftFilter('all');
              setStatusFilter('all');
              setLocationFilter('all');
              setTypeFilter('all');
              setProjectFilter('all');
            }}
          />

          <DataTable
            data={filteredEmployees}
            columns={columns}
            rowKey={(r) => r.id}
            onRowClick={(r) => {
              setSelectedEmployee(r);
              setProfileTab('overview');
            }}
            pageSize={10}
          />
        </div>
      )}

      {activeTab === 'organisation' && (
        <div className="space-y-5">
          {/* Visual Reporting Tree */}
          <div className="bg-white border border-[#E4E6F0] rounded-xl p-6">
            <h2 className="text-sm font-semibold text-[#0B1230] mb-4">Reporting Hierarchy</h2>
            <div className="flex flex-col items-start gap-4">
              {/* Manager Root */}
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#0B1230] text-white w-full sm:w-auto min-w-[280px]">
                <AvatarBadge name={currentManager.name} src={currentManager.avatarUrl} size="md" />
                <div>
                  <p className="text-sm font-semibold">{currentManager.name}</p>
                  <p className="text-xs text-white/70">{currentManager.designation}</p>
                </div>
              </div>

              {/* Team Leaders & Members */}
              <div className="pl-4 sm:pl-8 border-l border-[#D4D8E8] space-y-5 w-full">
                {teams
                  .filter((t) => scopedEmployees.some((e) => e.teamId === t.id))
                  .map((team) => {
                    const members = scopedEmployees.filter((e) => e.teamId === team.id);
                    const lead = members.find((m) => m.isTeamLeader) || members[0];
                    return (
                      <div key={team.id} className="space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#EEF0F7]">
                          <div>
                            <h3 className="text-xs font-semibold text-[#7050F5]">{team.name}</h3>
                            <p className="text-xs text-[#5A627A]">
                              Team Lead: <span className="font-medium text-[#0B1230]">{lead?.name || 'Assigned Lead'}</span> ·{' '}
                              {members.length} authorised members
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                          {members.slice(0, 6).map((emp) => (
                            <EmployeeProfileCard
                              key={emp.id}
                              employee={emp}
                              onAction={(action) => {
                                if (action === 'profile') {
                                  setSelectedEmployee(emp);
                                  setProfileTab('overview');
                                } else if (action === 'assign-work') {
                                  navigate(`/work-allocation?assign=${emp.id}`);
                                } else {
                                  navigate('/shifts');
                                }
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'availability' && (
        <div className="bg-white border border-[#E4E6F0] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#EEF0F7] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-[#0B1230]">7-Day Workforce Availability Calendar</h2>
              <p className="text-xs text-[#5A627A]">Scheduled shifts, approved leave, breaks, and unscheduled capacity</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#5A627A]">
              <span>Present / Available</span>
              <span>·</span>
              <span className="text-[#478BFA] font-medium">On Leave</span>
              <span>·</span>
              <span className="text-[#B97814] font-medium">On Break</span>
              <span>·</span>
              <span className="text-[#7050F5] font-medium">Shift Assigned</span>
            </div>
          </div>
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F7F7FC] border-b border-[#E4E6F0] text-[11px] font-semibold text-[#5A627A]">
                  <th className="px-4 py-2.5 whitespace-nowrap">Employee</th>
                  {availabilityDays.map((d) => (
                    <th key={d} className="px-3 py-2.5 text-center whitespace-nowrap">
                      {d}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF0F7] text-xs">
                {filteredEmployees.slice(0, 15).map((emp, idx) => (
                  <tr key={emp.id} className="hover:bg-[#F7F7FC]/50">
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <p className="font-medium text-[#0B1230]">{emp.name}</p>
                      <p className="text-[11px] text-[#69718A]">{emp.shiftName}</p>
                    </td>
                    {availabilityDays.map((day, dIdx) => {
                      const state =
                        dIdx === 0
                          ? emp.todayStatus
                          : dIdx === 1 && idx % 5 === 0
                          ? 'Not Scheduled'
                          : (idx + dIdx) % 9 === 0
                          ? 'On Leave'
                          : 'Shift Assigned';
                      return (
                        <td key={day} className="px-2 py-2.5 text-center">
                          <span
                            className={`inline-block px-2 py-1 rounded text-[11px] font-medium whitespace-nowrap ${
                              state === 'Present'
                                ? 'bg-[#16A36A]/10 text-[#16A36A]'
                                : state === 'On Leave'
                                ? 'bg-[#478BFA]/10 text-[#478BFA]'
                                : state === 'On Break' || state === 'Late'
                                ? 'bg-[#E9A23B]/15 text-[#B97814]'
                                : state === 'Not Scheduled'
                                ? 'bg-[#EEF0F7] text-[#69718A]'
                                : 'bg-[#7050F5]/10 text-[#7050F5]'
                            }`}
                          >
                            {state === 'Shift Assigned' ? emp.shiftName.replace(' Shift', '') : state}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Employee Profile 7-Tab Authorised Drawer */}
      <DetailDrawer
        open={Boolean(selectedEmployee)}
        onClose={() => {
          setSelectedEmployee(null);
          searchParams.delete('employee');
          setSearchParams(searchParams);
        }}
        title={selectedEmployee?.name || ''}
        subtitle={
          selectedEmployee
            ? `${selectedEmployee.employeeCode} · ${selectedEmployee.designation} · ${selectedEmployee.teamName}`
            : ''
        }
      >
        {selectedEmployee && (
          <div className="space-y-5">
            {/* Protected HR Data Notice */}
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg bg-[#F7F7FC] border border-[#E4E6F0] text-xs text-[#5A627A]">
              <Lock className="h-3.5 w-3.5 text-[#7050F5] shrink-0" />
              <span>
                Salary, bank account, and confidential HR documents are restricted to HR Operations and hidden from manager views.
              </span>
            </div>

            {/* 7 Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-[#EEF0F7]">
              {(
                [
                  ['overview', 'Overview'],
                  ['attendance', 'Attendance'],
                  ['leave', 'Leave'],
                  ['shifts', 'Shift Schedule'],
                  ['assignments', 'Work Assignments'],
                  ['performance', 'Performance'],
                  ['activity', 'Activity History'],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setProfileTab(id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap shrink-0 transition-colors ${
                    profileTab === id
                      ? 'bg-[#7050F5] text-white'
                      : 'text-[#5A627A] hover:text-[#0B1230] hover:bg-[#F7F7FC]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {profileTab === 'overview' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4 bg-[#F7F7FC] border border-[#E4E6F0] rounded-xl p-4">
                  <div>
                    <span className="text-[#69718A] block">Department</span>
                    <span className="font-semibold text-[#0B1230]">{selectedEmployee.departmentName}</span>
                  </div>
                  <div>
                    <span className="text-[#69718A] block">Assigned Team</span>
                    <span className="font-semibold text-[#0B1230]">{selectedEmployee.teamName}</span>
                  </div>
                  <div>
                    <span className="text-[#69718A] block">Work Location</span>
                    <span className="font-semibold text-[#0B1230]">{selectedEmployee.workLocation}</span>
                  </div>
                  <div>
                    <span className="text-[#69718A] block">Employment Type</span>
                    <span className="font-semibold text-[#0B1230]">{selectedEmployee.employmentType}</span>
                  </div>
                  <div>
                    <span className="text-[#69718A] block">Work Email</span>
                    <span className="font-semibold text-[#0B1230]">{selectedEmployee.email}</span>
                  </div>
                  <div>
                    <span className="text-[#69718A] block">Join Date</span>
                    <span className="font-semibold text-[#0B1230] tabular-nums">{formatDateShort(selectedEmployee.joinDate)}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => navigate(`/work-allocation?assign=${selectedEmployee.id}`)}
                    className="px-3.5 py-2 text-xs font-semibold text-white bg-[#7050F5] hover:bg-[#5D3EE0] rounded-lg"
                  >
                    Assign Work
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/shifts')}
                    className="px-3.5 py-2 text-xs font-semibold text-[#0B1230] bg-white border border-[#E4E6F0] hover:bg-[#F7F7FC] rounded-lg"
                  >
                    Manage Shift
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTransferTarget(selectedEmployee);
                      setTransferTeamId(teams.find((t) => t.id !== selectedEmployee.teamId)?.id || teams[0].id);
                    }}
                    className="px-3.5 py-2 text-xs font-semibold text-[#0B1230] bg-white border border-[#E4E6F0] hover:bg-[#F7F7FC] rounded-lg"
                  >
                    Request Transfer
                  </button>
                </div>
              </div>
            )}

            {profileTab === 'attendance' && (
              <div className="space-y-2 text-xs">
                {scopedAttendance
                  .filter((a) => a.employeeId === selectedEmployee.id)
                  .slice(-7)
                  .reverse()
                  .map((rec) => (
                    <div
                      key={rec.id}
                      className="flex items-center justify-between py-2.5 border-b border-[#EEF0F7]"
                    >
                      <div>
                        <p className="font-semibold text-[#0B1230] tabular-nums">{formatDateShort(rec.date)}</p>
                        <p className="text-[#69718A] tabular-nums">
                          {rec.shiftName} · In {rec.checkIn || '—'} / Out {rec.checkOut || '—'}
                        </p>
                      </div>
                      <StatusBadge status={rec.status} compact />
                    </div>
                  ))}
              </div>
            )}

            {profileTab === 'leave' && (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-lg bg-[#F7F7FC] border border-[#E4E6F0] flex items-center justify-between">
                  <span className="text-[#5A627A]">Available Annual / PTO Balance</span>
                  <span className="text-sm font-bold text-[#0B1230] tabular-nums">
                    {selectedEmployee.leaveBalanceDays} days
                  </span>
                </div>
                {scopedLeaves.filter((l) => l.employeeId === selectedEmployee.id).length === 0 ? (
                  <p className="text-[#69718A]">No recent leave requests logged for this employee.</p>
                ) : (
                  scopedLeaves
                    .filter((l) => l.employeeId === selectedEmployee.id)
                    .map((l) => (
                      <div key={l.id} className="flex items-center justify-between py-2 border-b border-[#EEF0F7]">
                        <div>
                          <p className="font-semibold text-[#0B1230]">{l.leaveType}</p>
                          <p className="text-[#69718A] tabular-nums">
                            {formatDateShort(l.startDate)} – {formatDateShort(l.endDate)} ({l.requestedDays}d)
                          </p>
                        </div>
                        <StatusBadge status={l.status} compact />
                      </div>
                    ))
                )}
              </div>
            )}

            {profileTab === 'shifts' && (
              <div className="space-y-2 text-xs">
                {scopedShiftAssignments
                  .filter((s) => s.employeeId === selectedEmployee.id)
                  .map((s) => (
                    <div key={s.id} className="p-3 rounded-lg border border-[#E4E6F0] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#0B1230]">{s.shiftName}</span>
                        <span className="tabular-nums text-[#5A627A]">{s.startTime} – {s.endTime}</span>
                      </div>
                      <p className="text-[#5A627A]">
                        Location: {s.location} · Break: {s.breakDuration} min · Weekly Off: {s.weeklyOff}
                      </p>
                    </div>
                  ))}
              </div>
            )}

            {profileTab === 'assignments' && (
              <div className="space-y-2 text-xs">
                {scopedTasks.filter((t) => t.assignedEmployeeId === selectedEmployee.id).length === 0 ? (
                  <p className="text-[#69718A]">No active work assignments currently assigned.</p>
                ) : (
                  scopedTasks
                    .filter((t) => t.assignedEmployeeId === selectedEmployee.id)
                    .map((t) => (
                      <div key={t.id} className="p-3 rounded-lg border border-[#E4E6F0] flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-[#0B1230] truncate">{t.title}</p>
                          <p className="text-[#69718A] tabular-nums">Due {formatDateShort(t.dueDate)} · {t.estimatedHours}h</p>
                        </div>
                        <StatusBadge status={t.status} compact />
                      </div>
                    ))
                )}
              </div>
            )}

            {profileTab === 'performance' && (
              <div className="space-y-2 text-xs">
                {scopedKPIs.filter((k) => k.employeeId === selectedEmployee.id).length === 0 ? (
                  <p className="text-[#69718A]">KPI tracking follows team cycle metrics ({selectedEmployee.departmentName}).</p>
                ) : (
                  scopedKPIs
                    .filter((k) => k.employeeId === selectedEmployee.id)
                    .map((k) => (
                      <div key={k.id} className="p-3 rounded-lg border border-[#E4E6F0] flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-[#0B1230]">{k.kpiName}</p>
                          <p className="text-[#69718A]">{k.reviewPeriod} · Target {k.target}{k.unit}</p>
                        </div>
                        <span className="text-sm font-bold text-[#7050F5] tabular-nums">{k.actual}{k.unit}</span>
                      </div>
                    ))
                )}
              </div>
            )}

            {profileTab === 'activity' && (
              <ActivityTimeline
                events={auditLogs
                  .filter((a) => a.details.includes(selectedEmployee.name))
                  .map((a) => ({
                    id: a.id,
                    title: a.action,
                    description: a.details,
                    timestamp: a.timestamp,
                    actor: a.actorName,
                  }))}
                emptyMessage="No recent audited changes recorded for this employee."
              />
            )}
          </div>
        )}
      </DetailDrawer>

      {/* Request Transfer Modal */}
      <FormModal
        open={Boolean(transferTarget)}
        onClose={() => setTransferTarget(null)}
        title="Request Team Transfer"
        subtitle={transferTarget ? `Submit transfer proposal for ${transferTarget.name} to HR Operations` : ''}
      >
        {transferTarget && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              requestEmployeeTransfer(transferTarget.id, transferTeamId, transferReason || 'Workload rebalancing');
              setTransferTarget(null);
              setTransferReason('');
            }}
            className="space-y-4 text-xs"
          >
            <div>
              <label className="block font-semibold text-[#0B1230] mb-1">Current Team</label>
              <input
                type="text"
                readOnly
                value={transferTarget.teamName}
                className="w-full h-10 px-3 rounded-lg border border-[#E4E6F0] bg-[#F7F7FC] text-[#5A627A]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#0B1230] mb-1">Target Team</label>
              <select
                value={transferTeamId}
                onChange={(e) => setTransferTeamId(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-[#E4E6F0] bg-white text-[#0B1230]"
              >
                {teams
                  .filter((t) => t.id !== transferTarget.teamId)
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-[#0B1230] mb-1">Operational Justification</label>
              <textarea
                rows={3}
                required
                value={transferReason}
                onChange={(e) => setTransferReason(e.target.value)}
                placeholder="Explain project or shift staffing reason for transfer..."
                className="w-full p-3 rounded-lg border border-[#E4E6F0] text-[#0B1230] focus:outline-none focus:border-[#7050F5]"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTransferTarget(null)}
                className="px-4 py-2 font-semibold text-[#5A627A] bg-[#F7F7FC] rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 font-semibold text-white bg-[#7050F5] hover:bg-[#5D3EE0] rounded-lg"
              >
                Submit Transfer Request
              </button>
            </div>
          </form>
        )}
      </FormModal>
    </div>
  );
};
