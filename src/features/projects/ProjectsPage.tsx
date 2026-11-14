import React, { useMemo, useState } from 'react';
import { AlertTriangle, FileText, Lock, Plus } from 'lucide-react';
import { useApp } from '../../app/AppContext';
import { ColumnDef, DataTable } from '../../components/ui/DataTable';
import { DetailDrawer } from '../../components/ui/DetailDrawer';
import { EmptyState } from '../../components/ui/EmptyState';
import { FormModal } from '../../components/ui/FormModal';
import { KPIStatCard } from '../../components/ui/KPIStatCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Project } from '../../types';
import { formatDateShort } from '../../utils/formatters';
import { ProjectCard } from './ProjectCard';

type ProjectDetailTab = 'overview' | 'team' | 'work' | 'attendance' | 'timeline' | 'performance' | 'documents';

export const ProjectsPage: React.FC = () => {
  const {
    scopedProjects,
    scopedEmployees,
    scopedTasks,
    scopedAttendance,
    projectAllocations,
    allocateProjectResource,
    updateProjectStatus,
  } = useApp();

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [detailTab, setDetailTab] = useState<ProjectDetailTab>('overview');
  const [allocModalOpen, setAllocModalOpen] = useState(false);

  const [allocProjectId, setAllocProjectId] = useState(scopedProjects[0]?.id || '');
  const [allocEmpId, setAllocEmpId] = useState(scopedEmployees[0]?.id || '');
  const [allocRole, setAllocRole] = useState('Implementation Specialist');
  const [allocPercent, setAllocPercent] = useState(50);
  const [allocHours, setAllocHours] = useState(20);

  const stats = useMemo(() => {
    const active = scopedProjects.filter((p) => p.status === 'Active').length;
    const completed = scopedProjects.filter((p) => p.status === 'Completed').length;
    const delayed = scopedProjects.filter((p) => p.status === 'At Risk').length;
    const allocatedIds = new Set(
      projectAllocations
        .filter((a) => scopedProjects.some((p) => p.id === a.projectId))
        .map((a) => a.employeeId)
    );
    const pendingTasks = scopedTasks.filter(
      (t) => t.projectId && !['Completed', 'Verified', 'Cancelled'].includes(t.status)
    ).length;
    return { active, completed, allocated: allocatedIds.size, pendingTasks, delayed };
  }, [scopedProjects, projectAllocations, scopedTasks]);

  const conflictCheck = useMemo(() => {
    const existing = projectAllocations
      .filter((a) => a.employeeId === allocEmpId)
      .reduce((acc, a) => acc + a.allocationPercent, 0);
    return {
      existing,
      projected: existing + allocPercent,
      hasConflict: existing + allocPercent > 100,
    };
  }, [projectAllocations, allocEmpId, allocPercent]);

  const columns: ColumnDef<Project>[] = [
    { key: 'code', header: 'Project ID', render: (p) => <span className="font-mono text-xs font-semibold text-[#7050F5]">{p.code}</span> },
    {
      key: 'name',
      header: 'Project Name',
      render: (p) => (
        <div>
          <p className="font-semibold text-[#0B1230]">{p.name}</p>
          <p className="text-[11px] text-[#69718A]">{p.client}</p>
        </div>
      ),
    },
    { key: 'pm', header: 'Project Manager', render: (p) => <span className="text-xs">{p.projectManagerName}</span> },
    { key: 'start', header: 'Start Date', render: (p) => <span className="text-xs tabular-nums">{formatDateShort(p.startDate)}</span> },
    { key: 'end', header: 'End Date', render: (p) => <span className="text-xs tabular-nums">{formatDateShort(p.endDate)}</span> },
    {
      key: 'size',
      header: 'Team Size',
      align: 'right',
      render: (p) => (
        <span className="font-semibold text-xs tabular-nums">
          {projectAllocations.filter((a) => a.projectId === p.id).length}
        </span>
      ),
    },
    { key: 'status', header: 'Status', render: (p) => <StatusBadge status={p.status} compact /> },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (p) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedProject(p);
            setDetailTab('overview');
          }}
          className="px-2.5 py-1 text-xs font-semibold text-[#7050F5] hover:bg-[#7050F5]/10 rounded-md"
        >
          View
        </button>
      ),
    },
  ];

  if (scopedProjects.length === 0) {
    return (
      <EmptyState
        title="No Projects Assigned"
        description="Your current manager role does not have client projects assigned in this scope. Switch to Project Manager or Department Manager to inspect project allocations."
      />
    );
  }

  const activeProject = selectedProject
    ? scopedProjects.find((p) => p.id === selectedProject.id) || selectedProject
    : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#0B1230]">Project Management</h1>
          <p className="text-xs text-[#5A627A] mt-0.5">
            Track authorised project delivery, member deployment, attendance, and allocation conflicts
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setAllocProjectId(scopedProjects[0]?.id || '');
            setAllocEmpId(scopedEmployees[0]?.id || '');
            setAllocModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#7050F5] hover:bg-[#5D3EE0] rounded-lg whitespace-nowrap shrink-0"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Allocate Resource</span>
        </button>
      </div>

      {/* Policy Restriction Banner */}
      <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white border border-[#E4E6F0] text-xs text-[#5A627A]">
        <Lock className="h-3.5 w-3.5 text-[#7050F5] shrink-0" />
        <span>
          Company-wide budgets, billing rates, and payroll settings remain restricted to Finance and Company Admin.
        </span>
      </div>

      {/* 5 Project KPI Cards */}
      <section className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3.5">
        <KPIStatCard title="Active Projects" primaryValue={stats.active} breakdown={[{ label: 'Total', value: scopedProjects.length }]} />
        <KPIStatCard title="Completed Projects" primaryValue={stats.completed} breakdown={[{ label: 'Delivered', value: stats.completed, tone: 'success' }]} />
        <KPIStatCard title="Employees Allocated" primaryValue={stats.allocated} breakdown={[{ label: 'Scope', value: scopedEmployees.length }]} />
        <KPIStatCard title="Pending Assignments" primaryValue={stats.pendingTasks} breakdown={[{ label: 'Project Tasks', value: stats.pendingTasks }]} />
        <KPIStatCard title="Delayed / At Risk" primaryValue={stats.delayed} breakdown={[{ label: 'Watchlist', value: stats.delayed, tone: stats.delayed > 0 ? 'error' : 'default' }]} />
      </section>

      {/* Project Cards Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {scopedProjects.map((p) => (
          <ProjectCard
            key={p.id}
            project={p}
            teamCount={projectAllocations.filter((a) => a.projectId === p.id).length}
            onSelect={(proj) => {
              setSelectedProject(proj);
              setDetailTab('overview');
            }}
          />
        ))}
      </section>

      {/* Project Listing Table */}
      <DataTable
        data={scopedProjects}
        columns={columns}
        rowKey={(p) => p.id}
        onRowClick={(p) => {
          setSelectedProject(p);
          setDetailTab('overview');
        }}
      />

      {/* Project Detail 7-Tab Drawer */}
      <DetailDrawer
        open={Boolean(activeProject)}
        onClose={() => setSelectedProject(null)}
        title={activeProject ? `${activeProject.code} · ${activeProject.name}` : ''}
        subtitle={activeProject ? `Client: ${activeProject.client} · PM: ${activeProject.projectManagerName}` : ''}
      >
        {activeProject && (
          <div className="space-y-5 text-xs">
            <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-[#EEF0F7]">
              {(
                [
                  ['overview', 'Overview'],
                  ['team', 'Team'],
                  ['work', 'Work Allocation'],
                  ['attendance', 'Attendance'],
                  ['timeline', 'Timeline'],
                  ['performance', 'Performance'],
                  ['documents', 'Documents'],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setDetailTab(id)}
                  className={`px-3 py-1.5 font-semibold rounded-md whitespace-nowrap shrink-0 ${
                    detailTab === id ? 'bg-[#7050F5] text-white' : 'text-[#5A627A] hover:text-[#0B1230]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {detailTab === 'overview' && (
              <div className="space-y-4">
                <p className="text-[#0B1230] leading-relaxed">{activeProject.description}</p>
                <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-[#F7F7FC] border border-[#E4E6F0]">
                  <div>
                    <span className="text-[#69718A] block">Timeline</span>
                    <span className="font-semibold tabular-nums">
                      {formatDateShort(activeProject.startDate)} – {formatDateShort(activeProject.endDate)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#69718A] block">Status</span>
                    <select
                      value={activeProject.status}
                      onChange={(e) => updateProjectStatus(activeProject.id, e.target.value as Project['status'])}
                      className="mt-0.5 h-8 px-2 rounded border border-[#E4E6F0] bg-white font-semibold"
                    >
                      <option value="Active">Active</option>
                      <option value="At Risk">At Risk</option>
                      <option value="On Hold">On Hold</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {detailTab === 'team' && (
              <div className="divide-y divide-[#EEF0F7]">
                {projectAllocations
                  .filter((a) => a.projectId === activeProject.id)
                  .map((a) => (
                    <div key={a.id} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-[#0B1230]">{a.employeeName}</p>
                        <p className="text-[#69718A]">{a.role} · {a.assignedHours}h/wk</p>
                      </div>
                      <span className={`font-semibold tabular-nums ${a.allocationPercent > 100 ? 'text-[#E05252]' : 'text-[#7050F5]'}`}>
                        {a.allocationPercent}%
                      </span>
                    </div>
                  ))}
              </div>
            )}

            {detailTab === 'work' && (
              <div className="space-y-2">
                {scopedTasks
                  .filter((t) => t.projectId === activeProject.id)
                  .map((t) => (
                    <div key={t.id} className="p-3 rounded-lg border border-[#E4E6F0] flex items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold text-[#0B1230]">{t.title}</p>
                        <p className="text-[#69718A]">{t.assignedEmployeeName} · Due {formatDateShort(t.dueDate)}</p>
                      </div>
                      <StatusBadge status={t.status} compact />
                    </div>
                  ))}
              </div>
            )}

            {detailTab === 'attendance' && (
              <div className="space-y-2">
                {scopedAttendance
                  .filter((a) => a.projectId === activeProject.id && a.date === '2026-11-14')
                  .slice(0, 10)
                  .map((a) => (
                    <div key={a.id} className="py-2 border-b border-[#EEF0F7] flex items-center justify-between">
                      <span>{a.employeeName} · {a.shiftName}</span>
                      <StatusBadge status={a.status} compact />
                    </div>
                  ))}
              </div>
            )}

            {detailTab === 'timeline' && (
              <div className="space-y-2.5">
                {activeProject.milestones.map((m) => (
                  <div key={m.title} className="p-3 rounded-lg border border-[#E4E6F0] flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-[#0B1230]">{m.title}</p>
                      <p className="text-[#69718A] tabular-nums">Target: {formatDateShort(m.dueDate)}</p>
                    </div>
                    <StatusBadge status={m.completed ? 'Completed' : 'In Progress'} compact />
                  </div>
                ))}
              </div>
            )}

            {detailTab === 'performance' && (
              <div className="p-4 rounded-xl bg-[#F7F7FC] border border-[#E4E6F0] space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#5A627A]">Overall Delivery Completion</span>
                  <span className="font-bold text-[#0B1230] tabular-nums">{activeProject.progressPercent}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5A627A]">Milestones Completed</span>
                  <span className="font-bold text-[#16A36A] tabular-nums">
                    {activeProject.milestones.filter((m) => m.completed).length} / {activeProject.milestones.length}
                  </span>
                </div>
              </div>
            )}

            {detailTab === 'documents' && (
              <div className="space-y-2">
                {activeProject.documents.map((doc) => (
                  <div key={doc.name} className="p-3 rounded-lg border border-[#E4E6F0] flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 font-medium text-[#0B1230]">
                      <FileText className="h-4 w-4 text-[#7050F5]" /> {doc.name}
                    </span>
                    <span className="text-[#69718A] tabular-nums">{doc.size} · {formatDateShort(doc.updatedAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </DetailDrawer>

      {/* Resource Allocation Modal with Conflict Detection */}
      <FormModal
        open={allocModalOpen}
        onClose={() => setAllocModalOpen(false)}
        title="Project Resource Allocation"
        subtitle="Deploy an authorised team member and detect overlapping capacity conflicts"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const emp = scopedEmployees.find((em) => em.id === allocEmpId);
            if (!emp) return;
            allocateProjectResource({
              projectId: allocProjectId,
              employeeId: emp.id,
              employeeName: emp.name,
              role: allocRole,
              allocationPercent: allocPercent,
              startDate: '2026-11-15',
              endDate: '2026-12-20',
              assignedHours: allocHours,
            });
            setAllocModalOpen(false);
          }}
          className="space-y-4 text-xs"
        >
          <div>
            <label className="block font-semibold text-[#0B1230] mb-1">Project</label>
            <select
              value={allocProjectId}
              onChange={(e) => setAllocProjectId(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-[#E4E6F0] bg-white"
            >
              {scopedProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} · {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold text-[#0B1230] mb-1">Employee</label>
            <select
              value={allocEmpId}
              onChange={(e) => setAllocEmpId(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-[#E4E6F0] bg-white"
            >
              {scopedEmployees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.designation})
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#0B1230] mb-1">Project Role</label>
              <input
                type="text"
                value={allocRole}
                onChange={(e) => setAllocRole(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-[#E4E6F0]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#0B1230] mb-1">Allocation (%)</label>
              <input
                type="number"
                min={10}
                max={100}
                value={allocPercent}
                onChange={(e) => setAllocPercent(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-lg border border-[#E4E6F0]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#0B1230] mb-1">Assigned Weekly Hours</label>
              <input
                type="number"
                min={4}
                max={48}
                value={allocHours}
                onChange={(e) => setAllocHours(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-lg border border-[#E4E6F0]"
              />
            </div>
          </div>

          {conflictCheck.hasConflict && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-[#E9A23B]/15 text-[#B97814]">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                Allocation Conflict: Employee already has {conflictCheck.existing}% allocated across active projects (projected total {conflictCheck.projected}%).
              </span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setAllocModalOpen(false)} className="px-4 py-2 font-semibold text-[#5A627A] bg-[#F7F7FC] rounded-lg">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 font-semibold text-white bg-[#7050F5] hover:bg-[#5D3EE0] rounded-lg">
              Confirm Allocation
            </button>
          </div>
        </form>
      </FormModal>
    </div>
  );
};
