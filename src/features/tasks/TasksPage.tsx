import React, { useMemo, useState } from 'react';
import { Check, CheckSquare, Clock, ListTodo, X } from 'lucide-react';
import { useApp } from '../../app/AppContext';
import { ActivityTimeline } from '../../components/ui/ActivityTimeline';
import { ColumnDef, DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { TODAY_ISO } from '../../mock-data/seedData';
import { PriorityLevel, WorkTask } from '../../types';
import { formatDateShort } from '../../utils/formatters';

type QueueTab = 'my-tasks' | 'pending-approvals' | 'assigned' | 'overdue' | 'completed';

interface QueueRow {
  id: string;
  title: string;
  category: string;
  employeeName: string;
  dueDate: string;
  priority: PriorityLevel;
  status: string;
  relatedRecord: string;
  source: 'task' | 'leave' | 'overtime' | 'regularisation' | 'swap';
  rawTask?: WorkTask;
}

export const TasksPage: React.FC = () => {
  const {
    scopedTasks,
    scopedLeaves,
    scopedOvertime,
    scopedRegularisations,
    scopedShiftSwaps,
    auditLogs,
    updateTaskStatus,
    decideLeaveRequest,
    decideOvertimeRequest,
    decideRegularisation,
    decideShiftSwap,
  } = useApp();

  const [activeTab, setActiveTab] = useState<QueueTab>('my-tasks');

  const unifiedRows = useMemo<QueueRow[]>(() => {
    const taskRows: QueueRow[] = scopedTasks.map((t) => ({
      id: t.id,
      title: t.title,
      category: t.category,
      employeeName: t.assignedEmployeeName,
      dueDate: t.dueDate,
      priority: t.priority,
      status: t.status,
      relatedRecord: t.projectId || t.siteId || t.departmentName,
      source: 'task',
      rawTask: t,
    }));

    const approvalRows: QueueRow[] = [
      ...scopedLeaves
        .filter((l) => l.status === 'Pending')
        .map((l) => ({
          id: l.id,
          title: `${l.leaveType} (${l.requestedDays}d)`,
          category: 'Leave Approval',
          employeeName: l.employeeName,
          dueDate: l.startDate,
          priority: l.priority,
          status: l.status,
          relatedRecord: 'Leave Balance',
          source: 'leave' as const,
        })),
      ...scopedOvertime
        .filter((o) => o.status === 'Pending')
        .map((o) => ({
          id: o.id,
          title: `Overtime +${o.overtimeHours}h`,
          category: 'Overtime Approval',
          employeeName: o.employeeName,
          dueDate: o.date,
          priority: o.priority,
          status: o.status,
          relatedRecord: 'Attendance Log',
          source: 'overtime' as const,
        })),
      ...scopedRegularisations
        .filter((r) => r.status === 'Pending')
        .map((r) => ({
          id: r.id,
          title: `Punch Correction (${r.requestedPunch})`,
          category: 'Attendance Approval',
          employeeName: r.employeeName,
          dueDate: r.date,
          priority: 'High' as PriorityLevel,
          status: r.status,
          relatedRecord: 'Terminal Log',
          source: 'regularisation' as const,
        })),
      ...scopedShiftSwaps
        .filter((s) => s.status === 'Pending')
        .map((s) => ({
          id: s.id,
          title: `Swap ${s.currentShift} <-> ${s.requestedShift}`,
          category: 'Shift Change',
          employeeName: s.employeeName,
          dueDate: s.date,
          priority: 'Medium' as PriorityLevel,
          status: s.status,
          relatedRecord: `With ${s.swapWithName}`,
          source: 'swap' as const,
        })),
    ];

    if (activeTab === 'pending-approvals') return approvalRows;
    if (activeTab === 'assigned') return taskRows.filter((t) => ['Created', 'Assigned', 'Accepted', 'In Progress', 'Blocked'].includes(t.status));
    if (activeTab === 'overdue') return taskRows.filter((t) => t.dueDate < TODAY_ISO && !['Completed', 'Verified', 'Cancelled'].includes(t.status));
    if (activeTab === 'completed') return taskRows.filter((t) => ['Completed', 'Verified'].includes(t.status));
    return [...approvalRows, ...taskRows.filter((t) => !['Completed', 'Verified', 'Cancelled'].includes(t.status))];
  }, [activeTab, scopedTasks, scopedLeaves, scopedOvertime, scopedRegularisations, scopedShiftSwaps]);

  const columns: ColumnDef<QueueRow>[] = [
    { key: 'id', header: 'ID', render: (r) => <span className="font-mono text-xs font-semibold text-[#7050F5]">{r.id}</span> },
    {
      key: 'title',
      header: 'Work Item / Request',
      render: (r) => (
        <div>
          <p className="font-semibold text-[#0B1230]">{r.title}</p>
          <p className="text-[11px] text-[#69718A]">{r.category} · {r.relatedRecord}</p>
        </div>
      ),
    },
    { key: 'emp', header: 'Employee', render: (r) => <span className="text-xs font-medium">{r.employeeName}</span> },
    { key: 'due', header: 'Due / Date', render: (r) => <span className="text-xs tabular-nums">{formatDateShort(r.dueDate)}</span> },
    { key: 'prio', header: 'Priority', render: (r) => <StatusBadge status={r.priority} compact /> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} compact /> },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (r) => (
        <div className="inline-flex items-center gap-1">
          {r.source === 'task' ? (
            <button
              type="button"
              onClick={() => updateTaskStatus(r.id, 'Completed')}
              className="px-2.5 py-1 text-xs font-semibold text-[#16A36A] hover:bg-[#16A36A]/10 rounded-md"
            >
              Complete
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  if (r.source === 'leave') decideLeaveRequest(r.id, 'Approved');
                  else if (r.source === 'overtime') decideOvertimeRequest(r.id, 'Approved');
                  else if (r.source === 'regularisation') decideRegularisation(r.id, 'Approved');
                  else if (r.source === 'swap') decideShiftSwap(r.id, 'Approved');
                }}
                className="p-1.5 rounded-md text-[#16A36A] hover:bg-[#16A36A]/10"
                title="Approve"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (r.source === 'leave') decideLeaveRequest(r.id, 'Rejected');
                  else if (r.source === 'overtime') decideOvertimeRequest(r.id, 'Rejected');
                  else if (r.source === 'regularisation') decideRegularisation(r.id, 'Rejected');
                  else if (r.source === 'swap') decideShiftSwap(r.id, 'Rejected');
                }}
                className="p-1.5 rounded-md text-[#E05252] hover:bg-[#E05252]/10"
                title="Reject"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#0B1230]">Unified Task & Approval Queue</h1>
        <p className="text-xs text-[#5A627A] mt-0.5">
          Consolidated supervisor action queue combining operational tasks, approvals, and overdue follow-ups
        </p>
      </div>

      <div className="flex items-center gap-1 overflow-x-auto p-1 bg-white border border-[#E4E6F0] rounded-xl w-full sm:w-fit">
        {(
          [
            ['my-tasks', 'My Action Queue', ListTodo],
            ['pending-approvals', 'Pending Approvals', CheckSquare],
            ['assigned', 'Assigned Tasks', Clock],
            ['overdue', 'Overdue Tasks', Clock],
            ['completed', 'Completed Tasks', Check],
          ] as const
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 transition-colors ${
              activeTab === id ? 'bg-[#7050F5] text-white' : 'text-[#5A627A] hover:text-[#0B1230]'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2">
          <DataTable data={unifiedRows} columns={columns} rowKey={(r) => `${r.source}-${r.id}`} pageSize={10} />
        </div>
        <div className="bg-white border border-[#E4E6F0] rounded-xl p-5 h-fit">
          <h3 className="text-sm font-semibold text-[#0B1230] mb-3">Audited Activity Timeline</h3>
          <ActivityTimeline
            events={auditLogs.slice(0, 8).map((a) => ({
              id: a.id,
              title: a.action,
              description: a.details,
              timestamp: a.timestamp,
              actor: `${a.actorName} (${a.actorRole})`,
              category: a.targetId,
            }))}
          />
        </div>
      </div>
    </div>
  );
};
