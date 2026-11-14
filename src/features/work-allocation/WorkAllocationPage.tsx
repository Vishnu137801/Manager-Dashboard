import React, { useEffect, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { BarChart3, CheckCircle2, Columns3, List, Plus, Send } from 'lucide-react';
import { useApp } from '../../app/AppContext';
import { ColumnDef, DataTable } from '../../components/ui/DataTable';
import { DetailDrawer } from '../../components/ui/DetailDrawer';
import { FormModal } from '../../components/ui/FormModal';
import { KPIStatCard } from '../../components/ui/KPIStatCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { usePermissions } from '../../hooks/usePermissions';
import { TODAY_ISO } from '../../mock-data/seedData';
import { PriorityLevel, TaskStatus, WorkTask } from '../../types';
import { formatDateShort } from '../../utils/formatters';
import { TaskBoard } from './TaskBoard';

const taskSchema = z.object({
  title: z.string().min(3, 'Enter a task title'),
  description: z.string().min(5, 'Describe the work assignment'),
  category: z.string().min(2),
  assignedEmployeeId: z.string().min(1),
  projectId: z.string().optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']),
  startDate: z.string().min(1),
  dueDate: z.string().min(1),
  estimatedHours: z.coerce.number().min(1).max(120),
});

type TaskFormValues = z.infer<typeof taskSchema>;
type WorkTab = 'board' | 'list' | 'workload';

export const WorkAllocationPage: React.FC = () => {
  const {
    scopedEmployees,
    scopedTasks,
    scopedProjects,
    branches,
    createTask,
    updateTaskStatus,
    reassignTask,
    addTaskComment,
  } = useApp();
  const { canAssign } = usePermissions();
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState<WorkTab>('board');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<WorkTask | null>(null);
  const [commentInput, setCommentInput] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema) as never,
    defaultValues: {
      title: '',
      description: '',
      category: 'Operations',
      assignedEmployeeId: scopedEmployees[0]?.id || '',
      projectId: '',
      priority: 'Medium',
      startDate: TODAY_ISO,
      dueDate: '2026-11-18',
      estimatedHours: 6,
    },
  });

  useEffect(() => {
    const assignEmp = searchParams.get('assign');
    if (assignEmp && scopedEmployees.some((e) => e.id === assignEmp)) {
      setValue('assignedEmployeeId', assignEmp);
      setCreateModalOpen(true);
    }
    const tabParam = searchParams.get('tab');
    if (tabParam === 'board' || tabParam === 'list' || tabParam === 'workload') {
      setActiveTab(tabParam);
    }
  }, [searchParams, scopedEmployees, setValue]);

  const metrics = useMemo(() => {
    const total = scopedTasks.length;
    const assigned = scopedTasks.filter((t) => t.status === 'Assigned' || t.status === 'Accepted').length;
    const inProgress = scopedTasks.filter((t) => t.status === 'In Progress').length;
    const completed = scopedTasks.filter((t) => t.status === 'Completed' || t.status === 'Verified').length;
    const overdue = scopedTasks.filter(
      (t) => t.dueDate < TODAY_ISO && !['Completed', 'Verified', 'Cancelled'].includes(t.status)
    ).length;
    const unassigned = scopedTasks.filter((t) => t.status === 'Created').length;
    return { total, assigned, inProgress, completed, overdue, unassigned };
  }, [scopedTasks]);

  const workloadRows = useMemo(() => {
    return scopedEmployees.map((emp) => {
      const empTasks = scopedTasks.filter((t) => t.assignedEmployeeId === emp.id);
      const completed = empTasks.filter((t) => t.status === 'Completed' || t.status === 'Verified').length;
      const pending = empTasks.filter((t) => !['Completed', 'Verified', 'Cancelled'].includes(t.status)).length;
      const overdue = empTasks.filter(
        (t) => t.dueDate < TODAY_ISO && !['Completed', 'Verified', 'Cancelled'].includes(t.status)
      ).length;
      const estHours = empTasks
        .filter((t) => !['Completed', 'Verified', 'Cancelled'].includes(t.status))
        .reduce((acc, t) => acc + t.estimatedHours, 0);

      const state =
        emp.workloadPercent > 95 || estHours > 20
          ? 'Overloaded'
          : emp.workloadPercent < 65 && pending === 0
          ? 'Underutilised'
          : 'Balanced';

      return {
        id: emp.id,
        name: emp.name,
        designation: emp.designation,
        teamName: emp.teamName,
        assignedCount: empTasks.length,
        completed,
        pending,
        overdue,
        estHours,
        workloadPercent: emp.workloadPercent,
        state,
      };
    });
  }, [scopedEmployees, scopedTasks]);

  const onCreateSubmit = (values: TaskFormValues) => {
    const emp = scopedEmployees.find((e) => e.id === values.assignedEmployeeId);
    if (!emp) return;
    createTask({
      title: values.title,
      description: values.description,
      category: values.category,
      assignedEmployeeId: emp.id,
      assignedEmployeeName: emp.name,
      teamId: emp.teamId,
      departmentName: emp.departmentName,
      projectId: values.projectId || undefined,
      siteId: emp.siteId,
      branchId: emp.branchId || branches[0].id,
      priority: values.priority as PriorityLevel,
      status: 'Assigned',
      startDate: values.startDate,
      dueDate: values.dueDate,
      estimatedHours: values.estimatedHours,
      progressPercent: 0,
      attachments: [],
    });
    reset();
    setCreateModalOpen(false);
  };

  // Keep drawer synced with task store
  const activeTask = useMemo(
    () => (selectedTask ? scopedTasks.find((t) => t.id === selectedTask.id) || selectedTask : null),
    [selectedTask, scopedTasks]
  );

  const listColumns: ColumnDef<WorkTask>[] = [
    { key: 'id', header: 'ID', render: (t) => <span className="font-mono text-xs font-semibold">{t.id}</span> },
    {
      key: 'title',
      header: 'Work Assignment',
      sortValue: (t) => t.title,
      render: (t) => (
        <div>
          <p className="font-semibold text-[#0B1230]">{t.title}</p>
          <p className="text-[11px] text-[#69718A]">{t.category} · {t.departmentName}</p>
        </div>
      ),
    },
    { key: 'assignee', header: 'Assigned To', render: (t) => <span className="text-xs font-medium">{t.assignedEmployeeName}</span> },
    { key: 'priority', header: 'Priority', render: (t) => <StatusBadge status={t.priority} compact /> },
    { key: 'due', header: 'Due Date', render: (t) => <span className="text-xs tabular-nums">{formatDateShort(t.dueDate)}</span> },
    { key: 'hrs', header: 'Est. Hours', align: 'right', render: (t) => <span className="font-mono text-xs tabular-nums">{t.estimatedHours}h</span> },
    { key: 'status', header: 'Status', render: (t) => <StatusBadge status={t.status} compact /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#0B1230]">Work Allocation & Task Management</h1>
          <p className="text-xs text-[#5A627A] mt-0.5">
            Industry-neutral operational task planning, Kanban tracking, and employee workload balancing
          </p>
        </div>
        {canAssign && (
          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#7050F5] hover:bg-[#5D3EE0] rounded-lg whitespace-nowrap shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Work Assignment</span>
          </button>
        )}
      </div>

      {/* 6 Work Allocation KPI Cards */}
      <section className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3.5">
        <KPIStatCard title="Total Tasks" primaryValue={metrics.total} breakdown={[{ label: 'Scope', value: 'Active' }]} />
        <KPIStatCard title="Assigned" primaryValue={metrics.assigned} breakdown={[{ label: 'Queued', value: metrics.assigned }]} />
        <KPIStatCard title="In Progress" primaryValue={metrics.inProgress} breakdown={[{ label: 'Active', value: metrics.inProgress }]} />
        <KPIStatCard title="Completed" primaryValue={metrics.completed} breakdown={[{ label: 'Verified', value: metrics.completed, tone: 'success' }]} />
        <KPIStatCard title="Overdue" primaryValue={metrics.overdue} breakdown={[{ label: 'Action Req', value: metrics.overdue, tone: metrics.overdue > 0 ? 'error' : 'default' }]} />
        <KPIStatCard title="Unassigned" primaryValue={metrics.unassigned} breakdown={[{ label: 'To Do', value: metrics.unassigned }]} />
      </section>

      {/* Tabs */}
      <div className="inline-flex items-center gap-1 p-1 bg-white border border-[#E4E6F0] rounded-xl">
        {[
          { id: 'board' as const, label: 'Task Board', icon: Columns3 },
          { id: 'list' as const, label: 'Work Assignments', icon: List },
          { id: 'workload' as const, label: 'Workload Distribution', icon: BarChart3 },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 transition-colors ${
                activeTab === tab.id ? 'bg-[#7050F5] text-white' : 'text-[#5A627A] hover:text-[#0B1230]'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeTab === 'board' && (
        <TaskBoard
          tasks={scopedTasks}
          canMove={canAssign}
          onMoveStatus={updateTaskStatus}
          onSelectTask={setSelectedTask}
        />
      )}

      {activeTab === 'list' && (
        <DataTable data={scopedTasks} columns={listColumns} rowKey={(t) => t.id} onRowClick={setSelectedTask} />
      )}

      {activeTab === 'workload' && (
        <DataTable
          data={workloadRows}
          rowKey={(r) => r.id}
          columns={[
            {
              key: 'name',
              header: 'Employee',
              sortValue: (r) => r.name,
              render: (r) => (
                <div>
                  <p className="font-semibold text-[#0B1230]">{r.name}</p>
                  <p className="text-[11px] text-[#69718A]">{r.designation} · {r.teamName}</p>
                </div>
              ),
            },
            { key: 'assigned', header: 'Assigned', align: 'right', render: (r) => <span className="tabular-nums">{r.assignedCount}</span> },
            { key: 'completed', header: 'Completed', align: 'right', render: (r) => <span className="text-[#16A36A] font-semibold tabular-nums">{r.completed}</span> },
            { key: 'pending', header: 'Pending', align: 'right', render: (r) => <span className="tabular-nums">{r.pending}</span> },
            { key: 'overdue', header: 'Overdue', align: 'right', render: (r) => <span className={r.overdue > 0 ? 'text-[#E05252] font-semibold tabular-nums' : 'tabular-nums'}>{r.overdue}</span> },
            { key: 'hours', header: 'Est. Work Hrs', align: 'right', render: (r) => <span className="font-mono text-xs tabular-nums">{r.estHours}h</span> },
            {
              key: 'util',
              header: 'Capacity Utilisation',
              render: (r) => (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold tabular-nums">{r.workloadPercent}%</span>
                  <span
                    className={`text-[11px] font-semibold ${
                      r.state === 'Overloaded'
                        ? 'text-[#E05252]'
                        : r.state === 'Underutilised'
                        ? 'text-[#478BFA]'
                        : 'text-[#16A36A]'
                    }`}
                  >
                    ({r.state})
                  </span>
                </div>
              ),
            },
          ]}
        />
      )}

      {/* Create Work Assignment Modal */}
      <FormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Work Assignment"
        subtitle="Assign a task to an authorised team member with start, due date, and estimated hours"
      >
        <form onSubmit={handleSubmit(onCreateSubmit)} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#0B1230] mb-1">Task Title</label>
            <input
              type="text"
              {...register('title')}
              placeholder="e.g., Audit evening shift handover checklist"
              className="w-full h-10 px-3 rounded-lg border border-[#E4E6F0]"
            />
            {errors.title && <p className="mt-1 text-[#E05252]">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block font-semibold text-[#0B1230] mb-1">Task Description</label>
            <textarea
              rows={3}
              {...register('description')}
              placeholder="Scope, deliverable expectations, and verification notes..."
              className="w-full p-3 rounded-lg border border-[#E4E6F0]"
            />
            {errors.description && <p className="mt-1 text-[#E05252]">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#0B1230] mb-1">Assigned Employee</label>
              <select {...register('assignedEmployeeId')} className="w-full h-10 px-3 rounded-lg border border-[#E4E6F0] bg-white">
                {scopedEmployees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.teamName})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-[#0B1230] mb-1">Category</label>
              <input type="text" {...register('category')} className="w-full h-10 px-3 rounded-lg border border-[#E4E6F0]" />
            </div>
            <div>
              <label className="block font-semibold text-[#0B1230] mb-1">Project (Optional)</label>
              <select {...register('projectId')} className="w-full h-10 px-3 rounded-lg border border-[#E4E6F0] bg-white">
                <option value="">Operational / Non-Project</option>
                {scopedProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code} · {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-[#0B1230] mb-1">Priority</label>
              <select {...register('priority')} className="w-full h-10 px-3 rounded-lg border border-[#E4E6F0] bg-white">
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-[#0B1230] mb-1">Start Date</label>
              <input type="date" {...register('startDate')} className="w-full h-10 px-3 rounded-lg border border-[#E4E6F0]" />
            </div>
            <div>
              <label className="block font-semibold text-[#0B1230] mb-1">Due Date</label>
              <input type="date" {...register('dueDate')} className="w-full h-10 px-3 rounded-lg border border-[#E4E6F0]" />
            </div>
            <div>
              <label className="block font-semibold text-[#0B1230] mb-1">Estimated Hours</label>
              <input type="number" {...register('estimatedHours')} className="w-full h-10 px-3 rounded-lg border border-[#E4E6F0]" />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 font-semibold text-[#5A627A] bg-[#F7F7FC] rounded-lg"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 font-semibold text-white bg-[#7050F5] hover:bg-[#5D3EE0] rounded-lg">
              Assign Work
            </button>
          </div>
        </form>
      </FormModal>

      {/* Task Details Drawer */}
      <DetailDrawer
        open={Boolean(activeTask)}
        onClose={() => {
          setSelectedTask(null);
          setCommentInput('');
        }}
        title={activeTask ? `${activeTask.id} · ${activeTask.title}` : ''}
        subtitle={activeTask ? `${activeTask.category} · Due ${formatDateShort(activeTask.dueDate)}` : ''}
      >
        {activeTask && (
          <div className="space-y-5 text-xs">
            <div className="bg-[#F7F7FC] border border-[#E4E6F0] rounded-xl p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <StatusBadge status={activeTask.status} />
                <StatusBadge status={activeTask.priority} />
              </div>
              <p className="text-[#0B1230] leading-relaxed">{activeTask.description}</p>
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#E4E6F0]">
                <div>
                  <span className="text-[#69718A] block">Assigned Employee</span>
                  <span className="font-semibold text-[#0B1230]">{activeTask.assignedEmployeeName}</span>
                </div>
                <div>
                  <span className="text-[#69718A] block">Estimated Effort</span>
                  <span className="font-semibold text-[#0B1230] tabular-nums">{activeTask.estimatedHours} hrs</span>
                </div>
              </div>
            </div>

            {canAssign && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#0B1230] mb-1">Update Status</label>
                  <select
                    value={activeTask.status}
                    onChange={(e) => updateTaskStatus(activeTask.id, e.target.value as TaskStatus)}
                    className="w-full h-9 px-3 rounded-lg border border-[#E4E6F0] bg-white"
                  >
                    {(['Created', 'Assigned', 'Accepted', 'In Progress', 'Blocked', 'Completed', 'Verified', 'Cancelled'] as TaskStatus[]).map(
                      (st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      )
                    )}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#0B1230] mb-1">Reassign Employee</label>
                  <select
                    value={activeTask.assignedEmployeeId}
                    onChange={(e) => reassignTask(activeTask.id, e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-[#E4E6F0] bg-white"
                  >
                    {scopedEmployees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {canAssign && activeTask.status !== 'Verified' && (
              <button
                type="button"
                onClick={() => updateTaskStatus(activeTask.id, 'Verified')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 font-semibold text-white bg-[#16A36A] hover:bg-[#138A58] rounded-lg"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Verify Completion</span>
              </button>
            )}

            {/* Comments */}
            <div className="pt-3 border-t border-[#EEF0F7] space-y-3">
              <h4 className="font-semibold text-[#0B1230]">Comments & Activity ({activeTask.comments.length})</h4>
              {activeTask.comments.length === 0 ? (
                <p className="text-[#69718A]">No comments yet.</p>
              ) : (
                <ul className="space-y-2.5">
                  {activeTask.comments.map((c) => (
                    <li key={c.id} className="p-3 rounded-lg bg-[#F7F7FC] border border-[#E4E6F0]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-[#0B1230]">
                          {c.authorName} · <span className="font-normal text-[#5A627A]">{c.authorRole}</span>
                        </span>
                        <span className="text-[11px] text-[#69718A]">{c.timestamp}</span>
                      </div>
                      <p className="text-[#0B1230]">{c.text}</p>
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="Add an operational note or instruction..."
                  className="flex-1 h-9 px-3 rounded-lg border border-[#E4E6F0]"
                />
                <button
                  type="button"
                  onClick={() => {
                    addTaskComment(activeTask.id, commentInput);
                    setCommentInput('');
                  }}
                  className="h-9 px-3 rounded-lg bg-[#7050F5] text-white font-semibold inline-flex items-center gap-1"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Post</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </DetailDrawer>
    </div>
  );
};
