import React, { createContext, useContext, useMemo, useState } from 'react';
import {
  BRANCHES,
  DEPARTMENTS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_ATTENDANCE_RECORDS,
  INITIAL_AUDIT_LOGS,
  INITIAL_EMPLOYEES,
  INITIAL_HANDOVER_LOGS,
  INITIAL_KPIS,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_MESSAGES,
  INITIAL_NOTIFICATIONS,
  INITIAL_OVERTIME_REQUESTS,
  INITIAL_PROJECT_ALLOCATIONS,
  INITIAL_REGULARISATIONS,
  INITIAL_REVIEWS,
  INITIAL_SHIFT_ASSIGNMENTS,
  INITIAL_SHIFT_SWAPS,
  INITIAL_SITE_INCIDENTS,
  INITIAL_TASKS,
  MANAGER_ACCOUNTS,
  PROJECTS,
  SHIFTS,
  SITES,
  TEAMS,
  TODAY_ISO,
} from '../mock-data/seedData';
import { workforceService } from '../services/workforceService';
import {
  ApprovalStatus,
  AttendanceRecord,
  AuditLogEntry,
  Branch,
  Employee,
  LeaveRequest,
  ManagerAccount,
  ManagerRole,
  NotificationItem,
  OperationalSite,
  OvertimeRequest,
  PerformanceKPI,
  PerformanceReview,
  Permission,
  Project,
  ProjectAllocation,
  RegularisationRequest,
  ShiftAssignment,
  ShiftHandoverLog,
  ShiftSwapRequest,
  SiteIncident,
  TaskStatus,
  TeamAnnouncement,
  TeamMessage,
  WorkTask,
} from '../types';

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant: 'success' | 'warning' | 'error' | 'info';
}

export interface ConfirmDialogState {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  variant?: 'primary' | 'danger';
  onConfirm: () => void;
}

interface AppContextValue {
  // Accounts, Roles & Scoping
  managerAccounts: ManagerAccount[];
  currentManager: ManagerAccount;
  activeRole: ManagerRole;
  switchManagerAccount: (managerId: string) => void;
  switchActiveRole: (role: ManagerRole) => void;
  selectedTeamFilter: string;
  setSelectedTeamFilter: (teamId: string) => void;
  selectedBranchFilter: string;
  setSelectedBranchFilter: (branchId: string) => void;
  hasPermission: (p: Permission) => boolean;

  // Master Data & Scoped Views
  allEmployeesCount: number;
  scopedEmployees: Employee[];
  scopedAttendance: AttendanceRecord[];
  scopedLeaves: LeaveRequest[];
  scopedOvertime: OvertimeRequest[];
  scopedRegularisations: RegularisationRequest[];
  scopedShiftAssignments: ShiftAssignment[];
  scopedShiftSwaps: ShiftSwapRequest[];
  scopedTasks: WorkTask[];
  scopedProjects: Project[];
  scopedSites: OperationalSite[];
  scopedIncidents: SiteIncident[];
  scopedKPIs: PerformanceKPI[];
  scopedReviews: PerformanceReview[];
  scopedAnnouncements: TeamAnnouncement[];
  handoverLogs: ShiftHandoverLog[];
  projectAllocations: ProjectAllocation[];
  branches: Branch[];
  departments: typeof DEPARTMENTS;
  teams: typeof TEAMS;
  shifts: typeof SHIFTS;
  messages: TeamMessage[];
  auditLogs: AuditLogEntry[];
  notifications: NotificationItem[];

  // Pending Counts
  pendingApprovalsCount: number;
  unreadNotificationsCount: number;

  // Call Centre Verified Integration Flag (Part 13)
  callCentreIntegrationConnected: boolean;
  toggleCallCentreIntegration: () => void;

  // Mutations with Audit Trail + Toast
  decideLeaveRequest: (id: string, decision: ApprovalStatus, comment?: string) => void;
  decideOvertimeRequest: (id: string, decision: ApprovalStatus, comment?: string) => void;
  decideRegularisation: (id: string, decision: ApprovalStatus, comment?: string) => void;
  decideShiftSwap: (id: string, decision: ApprovalStatus) => void;
  assignShift: (payload: Omit<ShiftAssignment, 'id'>) => void;
  addHandoverLog: (payload: Omit<ShiftHandoverLog, 'id' | 'createdAt'>) => void;
  createTask: (payload: Omit<WorkTask, 'id' | 'comments' | 'createdBy' | 'updatedAt'>) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  reassignTask: (taskId: string, employeeId: string) => void;
  addTaskComment: (taskId: string, text: string) => void;
  allocateProjectResource: (payload: Omit<ProjectAllocation, 'id'>) => void;
  updateProjectStatus: (projectId: string, status: Project['status']) => void;
  reportSiteIncident: (payload: Omit<SiteIncident, 'id' | 'status' | 'reportedBy'>) => void;
  updateIncidentStatus: (incidentId: string, status: SiteIncident['status']) => void;
  submitPerformanceReview: (reviewId: string, feedback: string, rating: PerformanceReview['rating'], submit: boolean) => void;
  createAnnouncement: (payload: Omit<TeamAnnouncement, 'id' | 'authorName'>) => void;
  archiveAnnouncement: (id: string) => void;
  sendTeamMessage: (teamId: string, content: string, isEscalation?: boolean) => void;
  updateBranchTarget: (branchId: string, targetValue: number) => void;
  requestEmployeeTransfer: (employeeId: string, targetTeamId: string, reason: string) => void;
  markAllNotificationsRead: () => void;
  markNotificationRead: (id: string) => void;

  // UI Overlays
  toasts: ToastItem[];
  pushToast: (toast: Omit<ToastItem, 'id'>) => void;
  dismissToast: (id: string) => void;
  confirmDialog: ConfirmDialogState;
  openConfirmDialog: (opts: Omit<ConfirmDialogState, 'open'>) => void;
  closeConfirmDialog: () => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentManagerId, setCurrentManagerId] = useState<string>(MANAGER_ACCOUNTS[0].id);
  const currentManager = useMemo(
    () => MANAGER_ACCOUNTS.find((m) => m.id === currentManagerId) || MANAGER_ACCOUNTS[0],
    [currentManagerId]
  );

  const [activeRole, setActiveRole] = useState<ManagerRole>(currentManager.primaryRole);
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>('all');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('all');

  // State Stores
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE_RECORDS);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(INITIAL_LEAVE_REQUESTS);
  const [overtimeRequests, setOvertimeRequests] = useState<OvertimeRequest[]>(INITIAL_OVERTIME_REQUESTS);
  const [regularisations, setRegularisations] = useState<RegularisationRequest[]>(INITIAL_REGULARISATIONS);
  const [shiftAssignments, setShiftAssignments] = useState<ShiftAssignment[]>(INITIAL_SHIFT_ASSIGNMENTS);
  const [shiftSwaps, setShiftSwaps] = useState<ShiftSwapRequest[]>(INITIAL_SHIFT_SWAPS);
  const [handoverLogs, setHandoverLogs] = useState<ShiftHandoverLog[]>(INITIAL_HANDOVER_LOGS);
  const [tasks, setTasks] = useState<WorkTask[]>(INITIAL_TASKS);
  const [projects, setProjects] = useState<Project[]>(PROJECTS);
  const [projectAllocations, setProjectAllocations] = useState<ProjectAllocation[]>(INITIAL_PROJECT_ALLOCATIONS);
  const [incidents, setIncidents] = useState<SiteIncident[]>(INITIAL_SITE_INCIDENTS);
  const [reviews, setReviews] = useState<PerformanceReview[]>(INITIAL_REVIEWS);
  const [announcements, setAnnouncements] = useState<TeamAnnouncement[]>(INITIAL_ANNOUNCEMENTS);
  const [messages, setMessages] = useState<TeamMessage[]>(INITIAL_MESSAGES);
  const [branches, setBranches] = useState<Branch[]>(BRANCHES);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [callCentreIntegrationConnected, setCallCentreIntegrationConnected] = useState<boolean>(false);

  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    open: false,
    title: '',
    message: '',
    confirmLabel: 'Confirm',
    onConfirm: () => {},
  });

  const pushToast = (toast: Omit<ToastItem, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3600);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const openConfirmDialog = (opts: Omit<ConfirmDialogState, 'open'>) => {
    setConfirmDialog({ ...opts, open: true });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog((prev) => ({ ...prev, open: false }));
  };

  const appendAudit = (action: string, targetType: string, targetId: string, details: string) => {
    const now = new Date();
    const stamp = `${TODAY_ISO} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setAuditLogs((prev) => [
      {
        id: `AUD-${1004 + prev.length}`,
        timestamp: stamp,
        actorName: currentManager.name,
        actorRole: activeRole,
        action,
        targetType,
        targetId,
        details,
      },
      ...prev,
    ]);
  };

  const switchManagerAccount = (managerId: string) => {
    const next = MANAGER_ACCOUNTS.find((m) => m.id === managerId);
    if (!next) return;
    setCurrentManagerId(managerId);
    setActiveRole(next.primaryRole);
    setSelectedTeamFilter('all');
    setSelectedBranchFilter('all');
    pushToast({
      title: `Switched account to ${next.name}`,
      description: `Active role: ${next.primaryRole}`,
      variant: 'info',
    });
  };

  const switchActiveRole = (role: ManagerRole) => {
    if (!currentManager.roles.includes(role)) return;
    setActiveRole(role);
    setSelectedTeamFilter('all');
    setSelectedBranchFilter('all');
    pushToast({
      title: `Active role changed to ${role}`,
      description: 'Dashboard and data scope updated.',
      variant: 'info',
    });
  };

  const hasPermission = (p: Permission) => workforceService.hasPermission(currentManager, p);

  // Scoped selectors
  const scopedEmployees = useMemo(
    () =>
      workforceService.getScopedEmployees(
        employees,
        currentManager,
        activeRole,
        selectedTeamFilter,
        selectedBranchFilter
      ),
    [employees, currentManager, activeRole, selectedTeamFilter, selectedBranchFilter]
  );

  const scopedEmployeeIds = useMemo(() => new Set(scopedEmployees.map((e) => e.id)), [scopedEmployees]);

  const scopedAttendance = useMemo(
    () => workforceService.getScopedAttendance(attendanceRecords, scopedEmployeeIds),
    [attendanceRecords, scopedEmployeeIds]
  );

  const scopedLeaves = useMemo(
    () => workforceService.getScopedLeaves(leaveRequests, scopedEmployeeIds),
    [leaveRequests, scopedEmployeeIds]
  );

  const scopedOvertime = useMemo(
    () => workforceService.getScopedOvertime(overtimeRequests, scopedEmployeeIds),
    [overtimeRequests, scopedEmployeeIds]
  );

  const scopedRegularisations = useMemo(
    () => workforceService.getScopedRegularisations(regularisations, scopedEmployeeIds),
    [regularisations, scopedEmployeeIds]
  );

  const scopedShiftAssignments = useMemo(
    () => workforceService.getScopedShiftAssignments(shiftAssignments, scopedEmployeeIds),
    [shiftAssignments, scopedEmployeeIds]
  );

  const scopedShiftSwaps = useMemo(
    () => workforceService.getScopedShiftSwaps(shiftSwaps, scopedEmployeeIds),
    [shiftSwaps, scopedEmployeeIds]
  );

  const scopedTasks = useMemo(
    () => workforceService.getScopedTasks(tasks, scopedEmployeeIds, currentManager),
    [tasks, scopedEmployeeIds, currentManager]
  );

  const scopedProjects = useMemo(
    () => workforceService.getScopedProjects(projects, currentManager),
    [projects, currentManager]
  );

  const scopedSites = useMemo(
    () => workforceService.getScopedSites(SITES, currentManager),
    [currentManager]
  );

  const scopedIncidents = useMemo(
    () => workforceService.getScopedIncidents(incidents, currentManager),
    [incidents, currentManager]
  );

  const scopedKPIs = useMemo(
    () => workforceService.getScopedKPIs(INITIAL_KPIS, scopedEmployeeIds),
    [scopedEmployeeIds]
  );

  const scopedReviews = useMemo(
    () => workforceService.getScopedReviews(reviews, scopedEmployeeIds),
    [reviews, scopedEmployeeIds]
  );

  const scopedAnnouncements = useMemo(
    () => workforceService.getScopedAnnouncements(announcements, currentManager),
    [announcements, currentManager]
  );

  const pendingApprovalsCount = useMemo(() => {
    const l = scopedLeaves.filter((x) => x.status === 'Pending').length;
    const o = scopedOvertime.filter((x) => x.status === 'Pending').length;
    const r = scopedRegularisations.filter((x) => x.status === 'Pending').length;
    const s = scopedShiftSwaps.filter((x) => x.status === 'Pending').length;
    return l + o + r + s;
  }, [scopedLeaves, scopedOvertime, scopedRegularisations, scopedShiftSwaps]);

  const unreadNotificationsCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  // Mutations
  const decideLeaveRequest = (id: string, decision: ApprovalStatus, comment?: string) => {
    setLeaveRequests((prev) =>
      prev.map((req) =>
        req.id === id
          ? { ...req, status: decision, reviewedBy: currentManager.name, reviewComments: comment }
          : req
      )
    );
    appendAudit(`${decision} Leave Request`, 'LeaveRequest', id, comment || `Marked as ${decision}`);
    pushToast({
      title: `Leave request ${id} ${decision.toLowerCase()}`,
      description: comment || 'Employee balance and team calendar updated.',
      variant: decision === 'Approved' ? 'success' : decision === 'Rejected' ? 'error' : 'warning',
    });
  };

  const decideOvertimeRequest = (id: string, decision: ApprovalStatus, comment?: string) => {
    setOvertimeRequests((prev) =>
      prev.map((req) =>
        req.id === id
          ? { ...req, status: decision, reviewedBy: currentManager.name, reviewComments: comment }
          : req
      )
    );
    appendAudit(`${decision} Overtime Request`, 'OvertimeRequest', id, comment || `Marked as ${decision}`);
    pushToast({
      title: `Overtime request ${id} ${decision.toLowerCase()}`,
      variant: decision === 'Approved' ? 'success' : 'warning',
    });
  };

  const decideRegularisation = (id: string, decision: ApprovalStatus, comment?: string) => {
    const target = regularisations.find((r) => r.id === id);
    setRegularisations((prev) =>
      prev.map((req) =>
        req.id === id
          ? { ...req, status: decision, reviewedBy: currentManager.name, reviewComments: comment }
          : req
      )
    );
    if (decision === 'Approved' && target) {
      setAttendanceRecords((prev) =>
        prev.map((att) =>
          att.employeeId === target.employeeId && att.date === target.date
            ? { ...att, status: 'Present', workingHours: 8, notes: `Regularised via ${id}` }
            : att
        )
      );
      if (target.date === TODAY_ISO) {
        setEmployees((prev) =>
          prev.map((emp) => (emp.id === target.employeeId ? { ...emp, todayStatus: 'Present' } : emp))
        );
      }
    }
    appendAudit(`${decision} Attendance Correction`, 'Regularisation', id, comment || `Regularisation ${decision}`);
    pushToast({
      title: `Correction ${id} ${decision.toLowerCase()}`,
      description: decision === 'Approved' ? 'Attendance record updated via authorised workflow.' : undefined,
      variant: decision === 'Approved' ? 'success' : 'warning',
    });
  };

  const decideShiftSwap = (id: string, decision: ApprovalStatus) => {
    setShiftSwaps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: decision, reviewedBy: currentManager.name } : s))
    );
    appendAudit(`${decision} Shift Swap`, 'ShiftSwap', id, `Shift swap ${decision.toLowerCase()}`);
    pushToast({
      title: `Shift swap ${id} ${decision.toLowerCase()}`,
      variant: decision === 'Approved' ? 'success' : 'warning',
    });
  };

  const assignShift = (payload: Omit<ShiftAssignment, 'id'>) => {
    const newId = `SA-${500 + shiftAssignments.length + 1}`;
    setShiftAssignments((prev) => [{ ...payload, id: newId }, ...prev]);
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === payload.employeeId
          ? { ...emp, shiftId: payload.shiftId, shiftName: payload.shiftName, workLocation: payload.location }
          : emp
      )
    );
    appendAudit('Assigned Shift', 'ShiftAssignment', newId, `Assigned ${payload.employeeName} to ${payload.shiftName}`);
    pushToast({
      title: 'Shift assigned',
      description: `${payload.employeeName} scheduled on ${payload.shiftName}.`,
      variant: 'success',
    });
  };

  const addHandoverLog = (payload: Omit<ShiftHandoverLog, 'id' | 'createdAt'>) => {
    const newId = `HND-${903 + handoverLogs.length}`;
    const now = new Date();
    const createdAt = `${TODAY_ISO} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setHandoverLogs((prev) => [{ ...payload, id: newId, createdAt }, ...prev]);
    appendAudit('Logged Shift Handover', 'Handover', newId, `${payload.shiftName} handover recorded`);
    pushToast({ title: 'Shift handover saved', description: `Reference ${newId}`, variant: 'success' });
  };

  const createTask = (payload: Omit<WorkTask, 'id' | 'comments' | 'createdBy' | 'updatedAt'>) => {
    const newId = `TSK-${111 + tasks.length}`;
    const now = new Date();
    const updatedAt = `${TODAY_ISO} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setTasks((prev) => [
      { ...payload, id: newId, comments: [], createdBy: currentManager.name, updatedAt },
      ...prev,
    ]);
    appendAudit('Created Work Assignment', 'WorkTask', newId, `Assigned "${payload.title}" to ${payload.assignedEmployeeName}`);
    pushToast({ title: 'Work assignment created', description: `${newId} assigned to ${payload.assignedEmployeeName}`, variant: 'success' });
  };

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status,
              progressPercent: status === 'Completed' || status === 'Verified' ? 100 : status === 'In Progress' ? Math.max(t.progressPercent, 50) : t.progressPercent,
              updatedAt: `${TODAY_ISO} Just now`,
            }
          : t
      )
    );
    appendAudit('Updated Task Status', 'WorkTask', taskId, `Moved task to ${status}`);
    pushToast({ title: `Task ${taskId} moved to ${status}`, variant: 'success' });
  };

  const reassignTask = (taskId: string, employeeId: string) => {
    const emp = employees.find((e) => e.id === employeeId);
    if (!emp) return;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, assignedEmployeeId: emp.id, assignedEmployeeName: emp.name, updatedAt: `${TODAY_ISO} Just now` } : t
      )
    );
    appendAudit('Reassigned Task', 'WorkTask', taskId, `Reassigned to ${emp.name}`);
    pushToast({ title: `Task ${taskId} reassigned to ${emp.name}`, variant: 'info' });
  };

  const addTaskComment = (taskId: string, text: string) => {
    if (!text.trim()) return;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              comments: [
                ...t.comments,
                {
                  id: `c-${Date.now()}`,
                  authorName: currentManager.name,
                  authorRole: activeRole,
                  text: text.trim(),
                  timestamp: `${TODAY_ISO} Just now`,
                },
              ],
            }
          : t
      )
    );
    pushToast({ title: 'Comment posted', variant: 'success' });
  };

  const allocateProjectResource = (payload: Omit<ProjectAllocation, 'id'>) => {
    const newId = `PA-${730 + projectAllocations.length}`;
    setProjectAllocations((prev) => [{ ...payload, id: newId }, ...prev]);
    appendAudit('Allocated Project Resource', 'ProjectAllocation', newId, `${payload.employeeName} (${payload.allocationPercent}%)`);
    pushToast({ title: 'Resource allocated to project', description: `${payload.employeeName} · ${payload.allocationPercent}%`, variant: 'success' });
  };

  const updateProjectStatus = (projectId: string, status: Project['status']) => {
    setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, status } : p)));
    appendAudit('Updated Project Status', 'Project', projectId, `Status updated to ${status}`);
    pushToast({ title: `Project status set to ${status}`, variant: 'info' });
  };

  const reportSiteIncident = (payload: Omit<SiteIncident, 'id' | 'status' | 'reportedBy'>) => {
    const newId = `INC-${104 + incidents.length}`;
    setIncidents((prev) => [
      { ...payload, id: newId, status: 'Open', reportedBy: currentManager.name },
      ...prev,
    ]);
    appendAudit('Reported Site Incident', 'SiteIncident', newId, `${payload.category} at ${payload.siteName}`);
    pushToast({ title: `Incident ${newId} logged`, description: 'Available for review and escalation.', variant: 'warning' });
  };

  const updateIncidentStatus = (incidentId: string, status: SiteIncident['status']) => {
    setIncidents((prev) => prev.map((inc) => (inc.id === incidentId ? { ...inc, status } : inc)));
    appendAudit('Updated Site Incident', 'SiteIncident', incidentId, `Status changed to ${status}`);
    pushToast({ title: `Incident ${incidentId} updated to ${status}`, variant: 'info' });
  };

  const submitPerformanceReview = (
    reviewId: string,
    feedback: string,
    rating: PerformanceReview['rating'],
    submit: boolean
  ) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? { ...r, managerFeedback: feedback, rating, status: submit ? 'Submitted' : 'Draft', updatedAt: TODAY_ISO }
          : r
      )
    );
    appendAudit(submit ? 'Submitted Performance Review' : 'Saved Review Draft', 'PerformanceReview', reviewId, `Rating: ${rating}`);
    pushToast({ title: submit ? 'Performance evaluation submitted' : 'Review draft saved', variant: 'success' });
  };

  const createAnnouncement = (payload: Omit<TeamAnnouncement, 'id' | 'authorName'>) => {
    const newId = `ANN-${10 + announcements.length}`;
    setAnnouncements((prev) => [{ ...payload, id: newId, authorName: currentManager.name }, ...prev]);
    appendAudit('Published Team Communication', 'Announcement', newId, `${payload.category}: ${payload.title}`);
    pushToast({ title: 'Team communication published', description: payload.targetTeamName, variant: 'success' });
  };

  const archiveAnnouncement = (id: string) => {
    setAnnouncements((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'Archived' } : a)));
    appendAudit('Archived Announcement', 'Announcement', id, 'Moved announcement to archive');
    pushToast({ title: 'Announcement archived', variant: 'info' });
  };

  const sendTeamMessage = (teamId: string, content: string, isEscalation = false) => {
    if (!content.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `MSG-${Date.now()}`,
        teamId,
        senderName: currentManager.name,
        senderRole: activeRole,
        content: content.trim(),
        timestamp: `${TODAY_ISO} Just now`,
        isEscalation,
      },
    ]);
    if (isEscalation) {
      appendAudit('Raised Support Escalation', 'Escalation', teamId, content.trim().slice(0, 80));
    }
    pushToast({ title: isEscalation ? 'Escalation logged' : 'Message sent to team', variant: 'success' });
  };

  const updateBranchTarget = (branchId: string, targetValue: number) => {
    setBranches((prev) => prev.map((b) => (b.id === branchId ? { ...b, targetValue } : b)));
    appendAudit('Updated Branch Operational Target', 'Branch', branchId, `Target updated to ${targetValue}`);
    pushToast({ title: 'Branch operational target updated', variant: 'success' });
  };

  const requestEmployeeTransfer = (employeeId: string, targetTeamId: string, reason: string) => {
    const emp = employees.find((e) => e.id === employeeId);
    const targetTeam = TEAMS.find((t) => t.id === targetTeamId);
    if (!emp || !targetTeam) return;
    appendAudit('Requested Employee Transfer', 'TransferRequest', employeeId, `Requested transfer of ${emp.name} to ${targetTeam.name}: ${reason}`);
    pushToast({
      title: 'Transfer request submitted to HR',
      description: `${emp.name} -> ${targetTeam.name} (pending HR confirmation).`,
      variant: 'info',
    });
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const toggleCallCentreIntegration = () => {
    setCallCentreIntegrationConnected((prev) => {
      const next = !prev;
      pushToast({
        title: next ? 'Telephony ACD connector verified' : 'Telephony ACD connector disconnected',
        description: next ? 'Queue SLA feed enabled for authorised supervisors.' : 'Live call metrics hidden until integration is connected.',
        variant: 'info',
      });
      return next;
    });
  };

  return (
    <AppContext.Provider
      value={{
        managerAccounts: MANAGER_ACCOUNTS,
        currentManager,
        activeRole,
        switchManagerAccount,
        switchActiveRole,
        selectedTeamFilter,
        setSelectedTeamFilter,
        selectedBranchFilter,
        setSelectedBranchFilter,
        hasPermission,
        allEmployeesCount: employees.length,
        scopedEmployees,
        scopedAttendance,
        scopedLeaves,
        scopedOvertime,
        scopedRegularisations,
        scopedShiftAssignments,
        scopedShiftSwaps,
        scopedTasks,
        scopedProjects,
        scopedSites,
        scopedIncidents,
        scopedKPIs,
        scopedReviews,
        scopedAnnouncements,
        handoverLogs,
        projectAllocations,
        branches,
        departments: DEPARTMENTS,
        teams: TEAMS,
        shifts: SHIFTS,
        messages,
        auditLogs,
        notifications,
        pendingApprovalsCount,
        unreadNotificationsCount,
        callCentreIntegrationConnected,
        toggleCallCentreIntegration,
        decideLeaveRequest,
        decideOvertimeRequest,
        decideRegularisation,
        decideShiftSwap,
        assignShift,
        addHandoverLog,
        createTask,
        updateTaskStatus,
        reassignTask,
        addTaskComment,
        allocateProjectResource,
        updateProjectStatus,
        reportSiteIncident,
        updateIncidentStatus,
        submitPerformanceReview,
        createAnnouncement,
        archiveAnnouncement,
        sendTeamMessage,
        updateBranchTarget,
        requestEmployeeTransfer,
        markAllNotificationsRead,
        markNotificationRead,
        toasts,
        pushToast,
        dismissToast,
        confirmDialog,
        openConfirmDialog,
        closeConfirmDialog,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
