export enum ManagerRole {
  DepartmentManager = 'Department Manager',
  TeamLeader = 'Team Leader',
  ProjectManager = 'Project Manager',
  SiteManager = 'Site Manager',
  ShiftSupervisor = 'Shift Supervisor',
  BranchManager = 'Branch Manager',
  CallCentreSupervisor = 'Call Centre Supervisor',
}

export enum Permission {
  View = 'View',
  Create = 'Create',
  Edit = 'Edit',
  Assign = 'Assign',
  Approve = 'Approve',
  Reject = 'Reject',
  Export = 'Export',
  ManageTeam = 'Manage Team',
  ManageShifts = 'Manage Shifts',
  ViewReports = 'View Reports',
}

export type AttendanceStatus =
  | 'Present'
  | 'Absent'
  | 'On Leave'
  | 'Late'
  | 'Missing Punch'
  | 'On Break'
  | 'Not Scheduled';

export type ApprovalStatus =
  | 'Pending'
  | 'Approved'
  | 'Rejected'
  | 'Changes Requested';

export type ApprovalType =
  | 'Leave Request'
  | 'Attendance Correction'
  | 'Overtime Request'
  | 'Shift Swap';

export type TaskStatus =
  | 'Created'
  | 'Assigned'
  | 'Accepted'
  | 'In Progress'
  | 'Blocked'
  | 'Completed'
  | 'Verified'
  | 'Cancelled';

export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Urgent';

export type EmploymentType = 'Full-Time' | 'Part-Time' | 'Contract' | 'Shift Staff';

export interface ManagerAccount {
  id: string;
  name: string;
  email: string;
  designation: string;
  avatarUrl: string;
  roles: ManagerRole[];
  primaryRole: ManagerRole;
  assignedDepartments: string[];
  assignedTeams: string[];
  assignedBranches: string[];
  assignedProjects: string[];
  assignedSites: string[];
  callCentreEnabled: boolean;
  permissions: Permission[];
  lastLogin: string;
  location: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  headId: string;
}

export interface Team {
  id: string;
  name: string;
  departmentId: string;
  leaderId: string;
  focusArea: string;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  city: string;
  managerName: string;
  operationalStatus: 'Nominal' | 'Peak Load' | 'Understaffed';
  configuredTargetType: 'Customer Service Target' | 'Daily Work Completion' | 'Sales Target' | 'Service Quality';
  targetValue: number;
  actualValue: number;
  targetUnit: string;
}

export interface ShiftDefinition {
  id: string;
  name: 'Morning Shift' | 'Evening Shift' | 'Night Shift' | 'General Shift';
  code: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  requiredHeadcount: number;
}

export interface Employee {
  id: string;
  employeeCode: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  initials: string;
  designation: string;
  departmentId: string;
  departmentName: string;
  teamId: string;
  teamName: string;
  branchId: string;
  branchName: string;
  projectId?: string;
  siteId?: string;
  employmentType: EmploymentType;
  shiftId: string;
  shiftName: ShiftDefinition['name'];
  workLocation: string;
  reportingManagerId: string;
  isTeamLeader?: boolean;
  todayStatus: AttendanceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  scheduledBreak?: string;
  actualBreak?: string;
  breakStatus?: 'On Time' | 'Extended' | 'Scheduled' | 'In Break';
  workloadPercent: number;
  leaveBalanceDays: number;
  joinDate: string;
  birthdayMonthDay: string;
  isContractor?: boolean;
  assignedQueue?: string;
  callLoginStatus?: 'Available' | 'On Call' | 'After-Call Work' | 'On Break' | 'Offline';
  // Restricted fields (not exposed in manager views per Part 19)
  restrictedPayrollBand?: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  departmentName: string;
  teamId: string;
  branchId: string;
  projectId?: string;
  siteId?: string;
  date: string;
  shiftId: string;
  shiftName: string;
  shiftStart: string;
  checkIn?: string;
  checkOut?: string;
  workingHours: number;
  breakMinutes: number;
  status: AttendanceStatus;
  lateMinutes?: number;
  overtimeHours?: number;
  notes?: string;
}

export interface RegularisationRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  departmentName: string;
  teamId: string;
  branchId: string;
  date: string;
  originalPunch: string;
  requestedPunch: string;
  reason: string;
  supportingDocName?: string;
  status: ApprovalStatus;
  submittedAt: string;
  reviewedBy?: string;
  reviewComments?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  departmentName: string;
  teamId: string;
  branchId: string;
  projectId?: string;
  siteId?: string;
  leaveType: 'Annual Leave' | 'Personal Time Off' | 'Medical Leave' | 'Emergency Leave';
  startDate: string;
  endDate: string;
  requestedDays: number;
  status: ApprovalStatus;
  priority: PriorityLevel;
  submittedAt: string;
  reviewedBy?: string;
  reviewComments?: string;
}

export interface OvertimeRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  departmentName: string;
  teamId: string;
  branchId: string;
  date: string;
  regularHours: number;
  overtimeHours: number;
  reason: string;
  status: ApprovalStatus;
  priority: PriorityLevel;
  submittedAt: string;
  reviewedBy?: string;
  reviewComments?: string;
}

export interface ShiftAssignment {
  id: string;
  employeeId: string;
  employeeName: string;
  departmentName: string;
  teamId: string;
  branchId: string;
  siteId?: string;
  shiftId: string;
  shiftName: ShiftDefinition['name'];
  date: string;
  startTime: string;
  endTime: string;
  breakDuration: number;
  weeklyOff: string;
  location: string;
  notes?: string;
}

export interface ShiftSwapRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  teamId: string;
  branchId: string;
  currentShift: string;
  requestedShift: string;
  swapWithId: string;
  swapWithName: string;
  date: string;
  reason: string;
  status: ApprovalStatus;
  submittedAt: string;
  reviewedBy?: string;
}

export interface ShiftHandoverLog {
  id: string;
  shiftName: string;
  date: string;
  outgoingSupervisor: string;
  incomingSupervisor: string;
  branchId: string;
  pendingWork: string;
  incidents: string;
  importantNotes: string;
  outstandingTasksCount: number;
  attachmentName?: string;
  createdAt: string;
}

export interface TaskComment {
  id: string;
  authorName: string;
  authorRole: string;
  text: string;
  timestamp: string;
}

export interface WorkTask {
  id: string;
  title: string;
  description: string;
  category: string;
  assignedEmployeeId: string;
  assignedEmployeeName: string;
  teamId: string;
  departmentName: string;
  projectId?: string;
  siteId?: string;
  branchId: string;
  priority: PriorityLevel;
  status: TaskStatus;
  startDate: string;
  dueDate: string;
  estimatedHours: number;
  progressPercent: number;
  attachments: string[];
  comments: TaskComment[];
  createdBy: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  code: string;
  name: string;
  client: string;
  projectManagerId: string;
  projectManagerName: string;
  departmentId: string;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Completed' | 'At Risk' | 'On Hold';
  progressPercent: number;
  description: string;
  milestones: { title: string; dueDate: string; completed: boolean }[];
  documents: { name: string; updatedAt: string; size: string }[];
}

export interface ProjectAllocation {
  id: string;
  projectId: string;
  employeeId: string;
  employeeName: string;
  role: string;
  allocationPercent: number;
  startDate: string;
  endDate: string;
  assignedHours: number;
}

export interface OperationalSite {
  id: string;
  code: string;
  name: string;
  location: string;
  siteManagerId: string;
  siteManagerName: string;
  status: 'Operational' | 'Understaffed' | 'Inspection Scheduled';
  siteType: string;
  activeContractorsCount: number;
}

export interface SiteIncident {
  id: string;
  siteId: string;
  siteName: string;
  date: string;
  category: 'Equipment' | 'Operational Delay' | 'Access Control' | 'Facility Observation' | 'Near Miss';
  description: string;
  reportedBy: string;
  priority: PriorityLevel;
  status: 'Open' | 'Under Review' | 'Escalated to Ops' | 'Resolved';
  attachmentName?: string;
}

export interface PerformanceKPI {
  id: string;
  employeeId: string;
  employeeName: string;
  departmentName: string;
  teamId: string;
  jobFamily: string;
  kpiName: string;
  target: number;
  actual: number;
  unit: string;
  reviewPeriod: string;
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  teamId: string;
  reviewPeriod: string;
  goalsSummary: string;
  managerFeedback: string;
  rating: 'Exceeds Expectations' | 'Meets Expectations' | 'Needs Focus' | 'Pending Review';
  status: 'Draft' | 'Due' | 'Submitted';
  updatedAt: string;
}

export interface TeamAnnouncement {
  id: string;
  title: string;
  message: string;
  category: 'Team Announcement' | 'Work Instruction' | 'Shift Notice' | 'Project Update';
  targetTeamId: string;
  targetTeamName: string;
  priority: PriorityLevel;
  publishDate: string;
  expiryDate: string;
  authorName: string;
  status: 'Published' | 'Draft' | 'Archived';
  attachmentName?: string;
}

export interface TeamMessage {
  id: string;
  teamId: string;
  senderName: string;
  senderRole: string;
  content: string;
  timestamp: string;
  isEscalation?: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  route: string;
  category: 'Approval' | 'Shift' | 'Attendance' | 'Site' | 'Task';
}
