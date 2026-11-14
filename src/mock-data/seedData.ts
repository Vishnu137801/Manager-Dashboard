import {
  AttendanceRecord,
  AttendanceStatus,
  AuditLogEntry,
  Branch,
  Department,
  Employee,
  EmploymentType,
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
  ShiftDefinition,
  ShiftHandoverLog,
  ShiftSwapRequest,
  SiteIncident,
  Team,
  TeamAnnouncement,
  TeamMessage,
  WorkTask,
} from '../types';

export const TODAY_ISO = '2026-11-14';

export const DEPARTMENTS: Department[] = [
  { id: 'dept-eng', name: 'Engineering & Delivery', code: 'ENG', headId: 'mgr-dept' },
  { id: 'dept-ops', name: 'Field & Site Operations', code: 'OPS', headId: 'mgr-site' },
  { id: 'dept-cs', name: 'Customer Support Centre', code: 'SUP', headId: 'mgr-cc' },
  { id: 'dept-ret', name: 'Branch & Store Operations', code: 'RET', headId: 'mgr-branch' },
  { id: 'dept-mfg', name: 'Production & Quality', code: 'MFG', headId: 'mgr-shift' },
];

export const TEAMS: Team[] = [
  { id: 'team-alpha', name: 'Platform Implementation', departmentId: 'dept-eng', leaderId: 'mgr-tl', focusArea: 'Enterprise Rollouts' },
  { id: 'team-bravo', name: 'Site Assembly Crew', departmentId: 'dept-ops', leaderId: 'mgr-site', focusArea: 'Field Installations' },
  { id: 'team-charlie', name: 'Tier-1 Voice & Escalations', departmentId: 'dept-cs', leaderId: 'mgr-cc', focusArea: 'Inbound Queue SLA' },
  { id: 'team-delta', name: 'Flagship Store Associates', departmentId: 'dept-ret', leaderId: 'mgr-branch', focusArea: 'Floor Coverage & Service' },
  { id: 'team-echo', name: 'Line B Shift Unit', departmentId: 'dept-mfg', leaderId: 'mgr-shift', focusArea: 'Batch Assembly & QA' },
];

export const BRANCHES: Branch[] = [
  {
    id: 'br-blr',
    name: 'Bengaluru Central Hub',
    code: 'BLR-01',
    city: 'Bengaluru',
    managerName: 'Priya Nair',
    operationalStatus: 'Nominal',
    configuredTargetType: 'Customer Service Target',
    targetValue: 95,
    actualValue: 96,
    targetUnit: '% SLA',
  },
  {
    id: 'br-mum',
    name: 'Mumbai West Flagship',
    code: 'MUM-02',
    city: 'Mumbai',
    managerName: 'Ananya Deshmukh',
    operationalStatus: 'Peak Load',
    configuredTargetType: 'Daily Work Completion',
    targetValue: 92,
    actualValue: 88,
    targetUnit: '% Tasks',
  },
  {
    id: 'br-pune',
    name: 'Pune Industrial Park',
    code: 'PUN-03',
    city: 'Pune',
    managerName: 'David Chen',
    operationalStatus: 'Understaffed',
    configuredTargetType: 'Service Quality',
    targetValue: 98,
    actualValue: 94,
    targetUnit: '% QA Pass',
  },
];

export const SHIFTS: ShiftDefinition[] = [
  { id: 'sh-morning', name: 'Morning Shift', code: 'MS-06', startTime: '06:00', endTime: '14:00', breakMinutes: 45, requiredHeadcount: 32 },
  { id: 'sh-general', name: 'General Shift', code: 'GS-09', startTime: '09:00', endTime: '18:00', breakMinutes: 60, requiredHeadcount: 36 },
  { id: 'sh-evening', name: 'Evening Shift', code: 'ES-14', startTime: '14:00', endTime: '22:00', breakMinutes: 45, requiredHeadcount: 24 },
  { id: 'sh-night', name: 'Night Shift', code: 'NS-22', startTime: '22:00', endTime: '06:00', breakMinutes: 45, requiredHeadcount: 14 },
];

export const PROJECTS: Project[] = [
  {
    id: 'proj-1',
    code: 'PRJ-401',
    name: 'Enterprise Payroll Migration',
    client: 'Meridian Logistics Group',
    projectManagerId: 'mgr-proj',
    projectManagerName: 'Elena Vance',
    departmentId: 'dept-eng',
    startDate: '2026-09-01',
    endDate: '2026-12-20',
    status: 'Active',
    progressPercent: 72,
    description: 'Multi-region workforce migration and shift rule harmonisation across 14 distribution centres.',
    milestones: [
      { title: 'Shift Template Harmonisation', dueDate: '2026-10-15', completed: true },
      { title: 'Parallel Attendance Verification', dueDate: '2026-11-22', completed: false },
      { title: 'Final Cutover Sign-Off', dueDate: '2026-12-18', completed: false },
    ],
    documents: [
      { name: 'Rollout_Runbook_v3.pdf', updatedAt: '2026-11-10', size: '1.8 MB' },
      { name: 'Client_Shift_Matrix.xlsx', updatedAt: '2026-11-12', size: '640 KB' },
    ],
  },
  {
    id: 'proj-2',
    code: 'PRJ-408',
    name: 'Smart Warehouse Telemetry',
    client: 'Kestrel Cold Chain',
    projectManagerId: 'mgr-proj',
    projectManagerName: 'Elena Vance',
    departmentId: 'dept-ops',
    startDate: '2026-10-05',
    endDate: '2027-01-30',
    status: 'At Risk',
    progressPercent: 48,
    description: 'Sensor commissioning, dock scanner deployment, and operator training across two cold-storage hubs.',
    milestones: [
      { title: 'Dock Gateway Installation', dueDate: '2026-11-01', completed: true },
      { title: 'Shift Supervisor Handover Training', dueDate: '2026-11-19', completed: false },
      { title: 'Live Operations Verification', dueDate: '2027-01-15', completed: false },
    ],
    documents: [
      { name: 'Site_Installation_Checklist.pdf', updatedAt: '2026-11-08', size: '920 KB' },
    ],
  },
  {
    id: 'proj-3',
    code: 'PRJ-415',
    name: 'Omnichannel Service Rollout',
    client: 'Veridian Retail Partners',
    projectManagerId: 'mgr-dept',
    projectManagerName: 'Marcus Vance',
    departmentId: 'dept-cs',
    startDate: '2026-08-12',
    endDate: '2026-11-30',
    status: 'Active',
    progressPercent: 86,
    description: 'Queue routing upgrade and break compliance alignment for flagship store and contact centre teams.',
    milestones: [
      { title: 'Queue Taxonomy Finalised', dueDate: '2026-09-25', completed: true },
      { title: 'Break Schedule Calibration', dueDate: '2026-11-05', completed: true },
      { title: 'Store Handover Review', dueDate: '2026-11-28', completed: false },
    ],
    documents: [
      { name: 'Queue_Coverage_SOP.pdf', updatedAt: '2026-11-11', size: '1.1 MB' },
    ],
  },
];

export const SITES: OperationalSite[] = [
  {
    id: 'site-1',
    code: 'SITE-PUN-A',
    name: 'Pune Plant & Assembly Site A',
    location: 'Chakan Industrial Corridor, Pune',
    siteManagerId: 'mgr-site',
    siteManagerName: 'David Chen',
    status: 'Understaffed',
    siteType: 'Manufacturing & Assembly',
    activeContractorsCount: 8,
  },
  {
    id: 'site-2',
    code: 'SITE-NAV-B',
    name: 'Navi Mumbai Logistics Hub B',
    location: 'Taloja Freight Terminal, Navi Mumbai',
    siteManagerId: 'mgr-site',
    siteManagerName: 'David Chen',
    status: 'Operational',
    siteType: 'Distribution & Field Logistics',
    activeContractorsCount: 6,
  },
];

const ALL_MANAGER_PERMS: Permission[] = [
  Permission.View,
  Permission.Create,
  Permission.Edit,
  Permission.Assign,
  Permission.Approve,
  Permission.Reject,
  Permission.Export,
  Permission.ManageTeam,
  Permission.ManageShifts,
  Permission.ViewReports,
];

export const MANAGER_ACCOUNTS: ManagerAccount[] = [
  {
    id: 'mgr-dept',
    name: 'Priya Nair',
    email: 'priya.nair@payfuse-demo.io',
    designation: 'Department Manager — Delivery & Service',
    avatarUrl: '/src/assets/images/avatar_manager_priya_1794670170509.jpg',
    roles: [ManagerRole.DepartmentManager, ManagerRole.ProjectManager],
    primaryRole: ManagerRole.DepartmentManager,
    assignedDepartments: ['dept-eng', 'dept-cs'],
    assignedTeams: ['team-alpha', 'team-charlie'],
    assignedBranches: ['br-blr', 'br-mum'],
    assignedProjects: ['proj-1', 'proj-3'],
    assignedSites: [],
    callCentreEnabled: true,
    permissions: ALL_MANAGER_PERMS,
    lastLogin: '2026-11-14 08:12 IST · Bengaluru',
    location: 'Bengaluru Central Hub',
  },
  {
    id: 'mgr-tl',
    name: 'Marcus Sterling',
    email: 'marcus.sterling@payfuse-demo.io',
    designation: 'Team Leader — Platform Implementation',
    avatarUrl: '/src/assets/images/avatar_manager_marcus_1794670169903.jpg',
    roles: [ManagerRole.TeamLeader],
    primaryRole: ManagerRole.TeamLeader,
    assignedDepartments: ['dept-eng'],
    assignedTeams: ['team-alpha'],
    assignedBranches: ['br-blr'],
    assignedProjects: ['proj-1'],
    assignedSites: [],
    callCentreEnabled: false,
    permissions: [
      Permission.View,
      Permission.Create,
      Permission.Edit,
      Permission.Assign,
      Permission.Approve,
      Permission.Reject,
      Permission.ViewReports,
    ],
    lastLogin: '2026-11-14 08:40 IST · Bengaluru',
    location: 'Bengaluru Central Hub',
  },
  {
    id: 'mgr-proj',
    name: 'Elena Vance',
    email: 'elena.vance@payfuse-demo.io',
    designation: 'Senior Project Manager',
    avatarUrl: '/src/assets/images/avatar_manager_elena_1794670170662.jpg',
    roles: [ManagerRole.ProjectManager, ManagerRole.DepartmentManager],
    primaryRole: ManagerRole.ProjectManager,
    assignedDepartments: ['dept-eng', 'dept-ops'],
    assignedTeams: ['team-alpha', 'team-bravo'],
    assignedBranches: ['br-blr', 'br-pune'],
    assignedProjects: ['proj-1', 'proj-2'],
    assignedSites: ['site-2'],
    callCentreEnabled: false,
    permissions: ALL_MANAGER_PERMS,
    lastLogin: '2026-11-14 07:55 IST · Bengaluru',
    location: 'Bengaluru Central Hub',
  },
  {
    id: 'mgr-site',
    name: 'David Chen',
    email: 'david.chen@payfuse-demo.io',
    designation: 'Site Operations Manager',
    avatarUrl: '/src/assets/images/avatar_supervisor_david_1794670171039.jpg',
    roles: [ManagerRole.SiteManager, ManagerRole.ShiftSupervisor],
    primaryRole: ManagerRole.SiteManager,
    assignedDepartments: ['dept-ops', 'dept-mfg'],
    assignedTeams: ['team-bravo', 'team-echo'],
    assignedBranches: ['br-pune', 'br-mum'],
    assignedProjects: ['proj-2'],
    assignedSites: ['site-1', 'site-2'],
    callCentreEnabled: false,
    permissions: ALL_MANAGER_PERMS,
    lastLogin: '2026-11-14 06:08 IST · Pune Site A',
    location: 'Pune Plant & Assembly Site A',
  },
  {
    id: 'mgr-shift',
    name: 'Rohan Kulkarni',
    email: 'rohan.kulkarni@payfuse-demo.io',
    designation: 'Shift Supervisor — Production & Quality',
    avatarUrl: '/src/assets/images/avatar_supervisor_david_1794670171039.jpg',
    roles: [ManagerRole.ShiftSupervisor],
    primaryRole: ManagerRole.ShiftSupervisor,
    assignedDepartments: ['dept-mfg'],
    assignedTeams: ['team-echo'],
    assignedBranches: ['br-pune'],
    assignedProjects: [],
    assignedSites: ['site-1'],
    callCentreEnabled: false,
    permissions: [
      Permission.View,
      Permission.Create,
      Permission.Edit,
      Permission.Assign,
      Permission.Approve,
      Permission.Reject,
      Permission.ManageShifts,
      Permission.ViewReports,
    ],
    lastLogin: '2026-11-14 05:50 IST · Pune',
    location: 'Pune Industrial Park',
  },
  {
    id: 'mgr-branch',
    name: 'Ananya Deshmukh',
    email: 'ananya.deshmukh@payfuse-demo.io',
    designation: 'Branch & Store Manager — Mumbai West',
    avatarUrl: '/src/assets/images/avatar_manager_priya_1794670170509.jpg',
    roles: [ManagerRole.BranchManager, ManagerRole.ShiftSupervisor],
    primaryRole: ManagerRole.BranchManager,
    assignedDepartments: ['dept-ret'],
    assignedTeams: ['team-delta'],
    assignedBranches: ['br-mum'],
    assignedProjects: ['proj-3'],
    assignedSites: [],
    callCentreEnabled: false,
    permissions: ALL_MANAGER_PERMS,
    lastLogin: '2026-11-14 08:30 IST · Mumbai',
    location: 'Mumbai West Flagship',
  },
  {
    id: 'mgr-cc',
    name: 'Kavita Menon',
    email: 'kavita.menon@payfuse-demo.io',
    designation: 'Call Centre Supervisor — Voice & Escalations',
    avatarUrl: '/src/assets/images/avatar_manager_elena_1794670170662.jpg',
    roles: [ManagerRole.CallCentreSupervisor, ManagerRole.TeamLeader],
    primaryRole: ManagerRole.CallCentreSupervisor,
    assignedDepartments: ['dept-cs'],
    assignedTeams: ['team-charlie'],
    assignedBranches: ['br-blr'],
    assignedProjects: ['proj-3'],
    assignedSites: [],
    callCentreEnabled: true,
    permissions: [
      Permission.View,
      Permission.Create,
      Permission.Edit,
      Permission.Assign,
      Permission.Approve,
      Permission.Reject,
      Permission.ManageShifts,
      Permission.ViewReports,
      Permission.Export,
    ],
    lastLogin: '2026-11-14 07:45 IST · Bengaluru',
    location: 'Bengaluru Central Hub',
  },
];

const FIRST_NAMES = [
  'Aarav', 'Aditi', 'Arjun', 'Bhavna', 'Chetan', 'Deepika', 'Dev', 'Divya', 'Eshan', 'Farah',
  'Gaurav', 'Harini', 'Ishan', 'Jaya', 'Karan', 'Keerthi', 'Lakshmi', 'Manish', 'Meera', 'Nikhil',
  'Nandini', 'Omkar', 'Pallavi', 'Pranav', 'Pooja', 'Rahul', 'Rashmi', 'Rishabh', 'Ritu', 'Sagar',
  'Sahil', 'Sana', 'Sanjay', 'Shreya', 'Siddharth', 'Sneha', 'Suresh', 'Tanvi', 'Tarun', 'Uday',
  'Vaishnavi', 'Varun', 'Vidya', 'Vikram', 'Yash', 'Zoya', 'Kunal', 'Neha', 'Vivek', 'Anjali',
];

const LAST_NAMES = [
  'Sharma', 'Patel', 'Iyer', 'Verma', 'Reddy', 'Kapoor', 'Joshi', 'Gupta', 'Mehta', 'Bhat',
  'Rao', 'Kulkarni', 'Malhotra', 'Chopra', 'Sen', 'Bose', 'Pillai', 'Nambiar', 'Saxena', 'Desai',
];

const DESIGNATIONS_BY_DEPT: Record<string, string[]> = {
  'dept-eng': ['Implementation Specialist', 'Systems Analyst', 'Integration Engineer', 'QA Lead'],
  'dept-ops': ['Field Technician', 'Site Coordinator', 'Commissioning Specialist', 'Safety & Access Officer'],
  'dept-cs': ['Customer Support Specialist', 'Escalation Desk Agent', 'Queue Coordinator', 'Quality Coach'],
  'dept-ret': ['Store Associate', 'Floor Supervisor', 'Inventory Specialist', 'Client Advisor'],
  'dept-mfg': ['Line Operator', 'Quality Inspector', 'Machine Technician', 'Packaging Lead'],
};

const QUEUES = ['Enterprise Priority', 'Payroll Support', 'Billing & Compliance', 'Technical Escalations'];

function generate100Employees(): Employee[] {
  const employees: Employee[] = [];
  const statuses: AttendanceStatus[] = [
    'Present', 'Present', 'Present', 'Present', 'Present', 'Present', 'Present',
    'Late', 'Present', 'Present', 'On Leave', 'Present', 'Missing Punch', 'Absent',
    'Present', 'On Break', 'Not Scheduled', 'Present', 'Present', 'Present',
  ];

  for (let i = 0; i < 100; i++) {
    const teamIndex = i % 5; // 20 employees per team/department
    const team = TEAMS[teamIndex];
    const dept = DEPARTMENTS[teamIndex];
    const branch = BRANCHES[i % 3];
    const shift = SHIFTS[i % 4];
    const first = FIRST_NAMES[i % FIRST_NAMES.length];
    const last = LAST_NAMES[(i * 3 + Math.floor(i / 5)) % LAST_NAMES.length];
    const name = `${first} ${last}`;
    const initials = `${first[0]}${last[0]}`;
    const codeNum = 1001 + i;
    const designationList = DESIGNATIONS_BY_DEPT[dept.id];
    const designation = designationList[i % designationList.length];
    const status = statuses[i % statuses.length];
    const empTypes: EmploymentType[] = ['Full-Time', 'Full-Time', 'Full-Time', 'Shift Staff', 'Contract'];
    const employmentType = empTypes[i % empTypes.length];

    let projectId: string | undefined;
    if (dept.id === 'dept-eng') projectId = i % 2 === 0 ? 'proj-1' : 'proj-3';
    else if (dept.id === 'dept-ops') projectId = 'proj-2';
    else if (dept.id === 'dept-cs' && i % 2 === 0) projectId = 'proj-3';

    let siteId: string | undefined;
    if (dept.id === 'dept-ops') siteId = i % 2 === 0 ? 'site-1' : 'site-2';
    else if (dept.id === 'dept-mfg') siteId = 'site-1';

    let checkInTime: string | undefined;
    if (status === 'Present' || status === 'On Break') {
      checkInTime = shift.startTime;
    } else if (status === 'Late') {
      const [hh, mm] = shift.startTime.split(':').map(Number);
      const lateMin = 14 + (i % 25);
      const total = hh * 60 + mm + lateMin;
      checkInTime = `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
    }

    const workloadPercent = 55 + ((i * 11) % 55); // ranges 55..109%
    const managerForDept =
      dept.id === 'dept-eng'
        ? 'mgr-tl'
        : dept.id === 'dept-ops'
        ? 'mgr-site'
        : dept.id === 'dept-cs'
        ? 'mgr-cc'
        : dept.id === 'dept-ret'
        ? 'mgr-branch'
        : 'mgr-shift';

    const bDayMonth = i < 6 ? 'Nov' : ['Dec', 'Jan', 'Feb', 'Mar'][i % 4];
    const bDayDay = 15 + (i % 12);

    employees.push({
      id: `emp-${codeNum}`,
      employeeCode: `PF-${codeNum}`,
      name,
      email: `${first.toLowerCase()}.${last.toLowerCase()}${i % 3 === 0 ? '' : i}@payfuse-demo.io`,
      phone: `+91 98${String(10000000 + i * 7919).slice(0, 8)}`,
      initials,
      designation,
      departmentId: dept.id,
      departmentName: dept.name,
      teamId: team.id,
      teamName: team.name,
      branchId: branch.id,
      branchName: branch.name,
      projectId,
      siteId,
      employmentType,
      shiftId: shift.id,
      shiftName: shift.name,
      workLocation: siteId ? (siteId === 'site-1' ? 'Pune Site A' : 'Navi Mumbai Hub B') : branch.name,
      reportingManagerId: managerForDept,
      isTeamLeader: i < 5,
      todayStatus: status,
      checkInTime,
      checkOutTime: status === 'Present' && shift.id === 'sh-morning' ? '14:02' : undefined,
      scheduledBreak: shift.id === 'sh-morning' ? '10:30 – 11:15' : shift.id === 'sh-general' ? '13:00 – 14:00' : '18:00 – 18:45',
      actualBreak: status === 'On Break' ? 'Active now' : status === 'Present' ? '45 min' : '—',
      breakStatus: status === 'On Break' ? 'In Break' : i % 7 === 0 ? 'Extended' : status === 'Present' ? 'On Time' : 'Scheduled',
      workloadPercent,
      leaveBalanceDays: 4 + (i % 14),
      joinDate: `202${1 + (i % 5)}-0${1 + (i % 9)}-${String(10 + (i % 18)).padStart(2, '0')}`,
      birthdayMonthDay: `${bDayMonth} ${bDayDay}`,
      isContractor: employmentType === 'Contract' && Boolean(siteId),
      assignedQueue: dept.id === 'dept-cs' ? QUEUES[i % QUEUES.length] : undefined,
      callLoginStatus:
        dept.id === 'dept-cs'
          ? status === 'On Break'
            ? 'On Break'
            : status === 'Absent' || status === 'On Leave'
            ? 'Offline'
            : i % 3 === 0
            ? 'On Call'
            : 'Available'
          : undefined,
      restrictedPayrollBand: 'RESTRICTED_HR_ONLY',
    });
  }

  return employees;
}

export const INITIAL_EMPLOYEES: Employee[] = generate100Employees();

function buildAttendanceRecords(employees: Employee[]): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const dates: string[] = [];
  for (let offset = 13; offset >= 0; offset--) {
    const d = new Date('2026-11-14T00:00:00');
    d.setDate(d.getDate() - offset);
    dates.push(d.toISOString().slice(0, 10));
  }

  dates.forEach((date, dayIdx) => {
    const isToday = date === TODAY_ISO;
    employees.forEach((emp, empIdx) => {
      const shift = SHIFTS.find((s) => s.id === emp.shiftId) || SHIFTS[1];
      let status: AttendanceStatus = emp.todayStatus;
      if (!isToday) {
        const mod = (empIdx + dayIdx * 7) % 25;
        if (mod === 0) status = 'Absent';
        else if (mod === 1 || mod === 2) status = 'On Leave';
        else if (mod === 3 || mod === 4) status = 'Late';
        else status = 'Present';
      }

      const lateMinutes = status === 'Late' ? 12 + ((empIdx + dayIdx) % 24) : 0;
      const workingHours =
        status === 'Present' || status === 'Late'
          ? 8 + ((empIdx + dayIdx) % 9 === 0 ? 1.5 : 0)
          : status === 'On Break'
          ? 4.5
          : 0;

      records.push({
        id: `att-${date}-${emp.id}`,
        employeeId: emp.id,
        employeeName: emp.name,
        departmentName: emp.departmentName,
        teamId: emp.teamId,
        branchId: emp.branchId,
        projectId: emp.projectId,
        siteId: emp.siteId,
        date,
        shiftId: shift.id,
        shiftName: shift.name,
        shiftStart: shift.startTime,
        checkIn:
          status === 'Present' || status === 'On Break'
            ? shift.startTime
            : status === 'Late'
            ? emp.checkInTime || '09:18'
            : undefined,
        checkOut: !isToday && (status === 'Present' || status === 'Late') ? shift.endTime : emp.checkOutTime,
        workingHours,
        breakMinutes: status === 'Present' || status === 'Late' ? shift.breakMinutes : 0,
        status,
        lateMinutes,
        overtimeHours: workingHours > 8 ? Number((workingHours - 8).toFixed(1)) : 0,
        notes: status === 'Late' ? 'Transit delay reported on check-in' : status === 'Missing Punch' ? 'Exit punch pending verification' : undefined,
      });
    });
  });

  return records;
}

export const INITIAL_ATTENDANCE_RECORDS: AttendanceRecord[] = buildAttendanceRecords(INITIAL_EMPLOYEES);

export const INITIAL_REGULARISATIONS: RegularisationRequest[] = INITIAL_EMPLOYEES
  .filter((e) => e.todayStatus === 'Missing Punch' || e.todayStatus === 'Late')
  .slice(0, 10)
  .map((emp, idx) => ({
    id: `REG-${301 + idx}`,
    employeeId: emp.id,
    employeeName: emp.name,
    departmentName: emp.departmentName,
    teamId: emp.teamId,
    branchId: emp.branchId,
    date: idx % 2 === 0 ? TODAY_ISO : '2026-11-13',
    originalPunch: emp.todayStatus === 'Missing Punch' ? '09:02 / Missing Out' : `${emp.checkInTime || '09:24'} / 18:05`,
    requestedPunch: '09:00 / 18:05',
    reason:
      emp.todayStatus === 'Missing Punch'
        ? 'Biometric terminal offline at gate B during shift exit'
        : 'Client call handover delayed check-in at floor terminal',
    supportingDocName: idx % 3 === 0 ? 'gate_visitor_slip.pdf' : undefined,
    status: idx < 6 ? 'Pending' : 'Approved',
    submittedAt: '2026-11-14 09:15',
    reviewedBy: idx >= 6 ? 'Priya Nair' : undefined,
  }));

export const INITIAL_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: 'LVR-801',
    employeeId: INITIAL_EMPLOYEES[0].id,
    employeeName: INITIAL_EMPLOYEES[0].name,
    departmentName: INITIAL_EMPLOYEES[0].departmentName,
    teamId: INITIAL_EMPLOYEES[0].teamId,
    branchId: INITIAL_EMPLOYEES[0].branchId,
    projectId: INITIAL_EMPLOYEES[0].projectId,
    leaveType: 'Annual Leave',
    startDate: '2026-11-18',
    endDate: '2026-11-20',
    requestedDays: 3,
    status: 'Pending',
    priority: 'High',
    submittedAt: '2026-11-13 16:40',
  },
  {
    id: 'LVR-802',
    employeeId: INITIAL_EMPLOYEES[1].id,
    employeeName: INITIAL_EMPLOYEES[1].name,
    departmentName: INITIAL_EMPLOYEES[1].departmentName,
    teamId: INITIAL_EMPLOYEES[1].teamId,
    branchId: INITIAL_EMPLOYEES[1].branchId,
    siteId: INITIAL_EMPLOYEES[1].siteId,
    leaveType: 'Personal Time Off',
    startDate: '2026-11-16',
    endDate: '2026-11-17',
    requestedDays: 2,
    status: 'Pending',
    priority: 'Medium',
    submittedAt: '2026-11-13 11:20',
  },
  {
    id: 'LVR-803',
    employeeId: INITIAL_EMPLOYEES[2].id,
    employeeName: INITIAL_EMPLOYEES[2].name,
    departmentName: INITIAL_EMPLOYEES[2].departmentName,
    teamId: INITIAL_EMPLOYEES[2].teamId,
    branchId: INITIAL_EMPLOYEES[2].branchId,
    leaveType: 'Medical Leave',
    startDate: '2026-11-14',
    endDate: '2026-11-15',
    requestedDays: 2,
    status: 'Pending',
    priority: 'Urgent',
    submittedAt: '2026-11-14 07:10',
  },
  {
    id: 'LVR-804',
    employeeId: INITIAL_EMPLOYEES[3].id,
    employeeName: INITIAL_EMPLOYEES[3].name,
    departmentName: INITIAL_EMPLOYEES[3].departmentName,
    teamId: INITIAL_EMPLOYEES[3].teamId,
    branchId: INITIAL_EMPLOYEES[3].branchId,
    leaveType: 'Annual Leave',
    startDate: '2026-11-23',
    endDate: '2026-11-25',
    requestedDays: 3,
    status: 'Pending',
    priority: 'Low',
    submittedAt: '2026-11-12 14:05',
  },
  {
    id: 'LVR-805',
    employeeId: INITIAL_EMPLOYEES[4].id,
    employeeName: INITIAL_EMPLOYEES[4].name,
    departmentName: INITIAL_EMPLOYEES[4].departmentName,
    teamId: INITIAL_EMPLOYEES[4].teamId,
    branchId: INITIAL_EMPLOYEES[4].branchId,
    siteId: INITIAL_EMPLOYEES[4].siteId,
    leaveType: 'Emergency Leave',
    startDate: '2026-11-15',
    endDate: '2026-11-15',
    requestedDays: 1,
    status: 'Pending',
    priority: 'High',
    submittedAt: '2026-11-14 06:55',
  },
  {
    id: 'LVR-806',
    employeeId: INITIAL_EMPLOYEES[5].id,
    employeeName: INITIAL_EMPLOYEES[5].name,
    departmentName: INITIAL_EMPLOYEES[5].departmentName,
    teamId: INITIAL_EMPLOYEES[5].teamId,
    branchId: INITIAL_EMPLOYEES[5].branchId,
    leaveType: 'Annual Leave',
    startDate: '2026-11-10',
    endDate: '2026-11-11',
    requestedDays: 2,
    status: 'Approved',
    priority: 'Medium',
    submittedAt: '2026-11-05 10:15',
    reviewedBy: 'Priya Nair',
    reviewComments: 'Coverage verified with backup specialist.',
  },
  {
    id: 'LVR-807',
    employeeId: INITIAL_EMPLOYEES[7].id,
    employeeName: INITIAL_EMPLOYEES[7].name,
    departmentName: INITIAL_EMPLOYEES[7].departmentName,
    teamId: INITIAL_EMPLOYEES[7].teamId,
    branchId: INITIAL_EMPLOYEES[7].branchId,
    leaveType: 'Personal Time Off',
    startDate: '2026-11-19',
    endDate: '2026-11-19',
    requestedDays: 1,
    status: 'Pending',
    priority: 'Medium',
    submittedAt: '2026-11-14 08:05',
  },
];

export const INITIAL_OVERTIME_REQUESTS: OvertimeRequest[] = [
  {
    id: 'OTR-410',
    employeeId: INITIAL_EMPLOYEES[0].id,
    employeeName: INITIAL_EMPLOYEES[0].name,
    departmentName: INITIAL_EMPLOYEES[0].departmentName,
    teamId: INITIAL_EMPLOYEES[0].teamId,
    branchId: INITIAL_EMPLOYEES[0].branchId,
    date: '2026-11-13',
    regularHours: 8,
    overtimeHours: 2.5,
    reason: 'Meridian Payroll cutover script validation after shift hours',
    status: 'Pending',
    priority: 'High',
    submittedAt: '2026-11-13 21:05',
  },
  {
    id: 'OTR-411',
    employeeId: INITIAL_EMPLOYEES[1].id,
    employeeName: INITIAL_EMPLOYEES[1].name,
    departmentName: INITIAL_EMPLOYEES[1].departmentName,
    teamId: INITIAL_EMPLOYEES[1].teamId,
    branchId: INITIAL_EMPLOYEES[1].branchId,
    date: '2026-11-13',
    regularHours: 8,
    overtimeHours: 3.0,
    reason: 'Dock bay scanner calibration before morning dispatch',
    status: 'Pending',
    priority: 'Medium',
    submittedAt: '2026-11-13 22:10',
  },
  {
    id: 'OTR-412',
    employeeId: INITIAL_EMPLOYEES[4].id,
    employeeName: INITIAL_EMPLOYEES[4].name,
    departmentName: INITIAL_EMPLOYEES[4].departmentName,
    teamId: INITIAL_EMPLOYEES[4].teamId,
    branchId: INITIAL_EMPLOYEES[4].branchId,
    date: '2026-11-12',
    regularHours: 8,
    overtimeHours: 2.0,
    reason: 'Batch QA audit sign-off for Line B shipment',
    status: 'Pending',
    priority: 'Medium',
    submittedAt: '2026-11-12 20:30',
  },
  {
    id: 'OTR-413',
    employeeId: INITIAL_EMPLOYEES[2].id,
    employeeName: INITIAL_EMPLOYEES[2].name,
    departmentName: INITIAL_EMPLOYEES[2].departmentName,
    teamId: INITIAL_EMPLOYEES[2].teamId,
    branchId: INITIAL_EMPLOYEES[2].branchId,
    date: '2026-11-13',
    regularHours: 8,
    overtimeHours: 1.5,
    reason: 'Inbound escalation queue clearance during peak evening window',
    status: 'Pending',
    priority: 'High',
    submittedAt: '2026-11-13 23:10',
  },
  {
    id: 'OTR-414',
    employeeId: INITIAL_EMPLOYEES[3].id,
    employeeName: INITIAL_EMPLOYEES[3].name,
    departmentName: INITIAL_EMPLOYEES[3].departmentName,
    teamId: INITIAL_EMPLOYEES[3].teamId,
    branchId: INITIAL_EMPLOYEES[3].branchId,
    date: '2026-11-11',
    regularHours: 8,
    overtimeHours: 2.0,
    reason: 'Store inventory reconciliation ahead of audit',
    status: 'Approved',
    priority: 'Low',
    submittedAt: '2026-11-11 21:00',
    reviewedBy: 'Ananya Deshmukh',
  },
];

export const INITIAL_SHIFT_ASSIGNMENTS: ShiftAssignment[] = INITIAL_EMPLOYEES.map((emp, idx) => {
  const shift = SHIFTS.find((s) => s.id === emp.shiftId) || SHIFTS[1];
  const weeklyOffs = ['Sunday', 'Saturday & Sunday', 'Wednesday', 'Monday'];
  return {
    id: `SA-${500 + idx}`,
    employeeId: emp.id,
    employeeName: emp.name,
    departmentName: emp.departmentName,
    teamId: emp.teamId,
    branchId: emp.branchId,
    siteId: emp.siteId,
    shiftId: shift.id,
    shiftName: shift.name,
    date: TODAY_ISO,
    startTime: shift.startTime,
    endTime: shift.endTime,
    breakDuration: shift.breakMinutes,
    weeklyOff: weeklyOffs[idx % weeklyOffs.length],
    location: emp.workLocation,
    notes: idx % 9 === 0 ? 'Cross-trained backup coverage' : undefined,
  };
});

export const INITIAL_SHIFT_SWAPS: ShiftSwapRequest[] = [
  {
    id: 'SWP-201',
    employeeId: INITIAL_EMPLOYEES[2].id,
    employeeName: INITIAL_EMPLOYEES[2].name,
    teamId: INITIAL_EMPLOYEES[2].teamId,
    branchId: INITIAL_EMPLOYEES[2].branchId,
    currentShift: 'Evening Shift (14:00–22:00)',
    requestedShift: 'Morning Shift (06:00–14:00)',
    swapWithId: INITIAL_EMPLOYEES[7].id,
    swapWithName: INITIAL_EMPLOYEES[7].name,
    date: '2026-11-16',
    reason: 'Coordinated swap for family medical appointment',
    status: 'Pending',
    submittedAt: '2026-11-13 15:20',
  },
  {
    id: 'SWP-202',
    employeeId: INITIAL_EMPLOYEES[4].id,
    employeeName: INITIAL_EMPLOYEES[4].name,
    teamId: INITIAL_EMPLOYEES[4].teamId,
    branchId: INITIAL_EMPLOYEES[4].branchId,
    currentShift: 'Night Shift (22:00–06:00)',
    requestedShift: 'Morning Shift (06:00–14:00)',
    swapWithId: INITIAL_EMPLOYEES[9].id,
    swapWithName: INITIAL_EMPLOYEES[9].name,
    date: '2026-11-17',
    reason: 'Line B certification handoff requirement',
    status: 'Pending',
    submittedAt: '2026-11-14 06:40',
  },
  {
    id: 'SWP-203',
    employeeId: INITIAL_EMPLOYEES[3].id,
    employeeName: INITIAL_EMPLOYEES[3].name,
    teamId: INITIAL_EMPLOYEES[3].teamId,
    branchId: INITIAL_EMPLOYEES[3].branchId,
    currentShift: 'Morning Shift (06:00–14:00)',
    requestedShift: 'Evening Shift (14:00–22:00)',
    swapWithId: INITIAL_EMPLOYEES[8].id,
    swapWithName: INITIAL_EMPLOYEES[8].name,
    date: '2026-11-18',
    reason: 'Store peak-hour floor coverage swap',
    status: 'Approved',
    submittedAt: '2026-11-12 12:15',
    reviewedBy: 'Ananya Deshmukh',
  },
];

export const INITIAL_HANDOVER_LOGS: ShiftHandoverLog[] = [
  {
    id: 'HND-901',
    shiftName: 'Night Shift -> Morning Shift',
    date: TODAY_ISO,
    outgoingSupervisor: 'Rohan Kulkarni',
    incomingSupervisor: 'David Chen',
    branchId: 'br-pune',
    pendingWork: 'Complete calibration check on Assembly Station 4 before 10:00 batch run.',
    incidents: 'Minor conveyor sensor reset at 03:15; resolved and logged under INC-102.',
    importantNotes: 'Two contractors arriving at 09:30 for dock bay gate alignment.',
    outstandingTasksCount: 3,
    attachmentName: 'night_shift_checklist_14nov.pdf',
    createdAt: '2026-11-14 06:05',
  },
  {
    id: 'HND-902',
    shiftName: 'Evening Shift -> Night Shift',
    date: '2026-11-13',
    outgoingSupervisor: 'Kavita Menon',
    incomingSupervisor: 'Priya Nair',
    branchId: 'br-blr',
    pendingWork: 'Follow up on 4 escalated enterprise payroll tickets in Queue 2.',
    incidents: 'None reported.',
    importantNotes: 'Updated break staggered schedule active for weekend coverage.',
    outstandingTasksCount: 4,
    createdAt: '2026-11-13 22:00',
  },
];

export const INITIAL_TASKS: WorkTask[] = [
  {
    id: 'TSK-101',
    title: 'Validate November shift roster import for Meridian',
    description: 'Cross-check 140 shift templates against regional holiday calendar before parallel run.',
    category: 'Implementation',
    assignedEmployeeId: INITIAL_EMPLOYEES[0].id,
    assignedEmployeeName: INITIAL_EMPLOYEES[0].name,
    teamId: 'team-alpha',
    departmentName: 'Engineering & Delivery',
    projectId: 'proj-1',
    branchId: 'br-blr',
    priority: 'High',
    status: 'In Progress',
    startDate: '2026-11-11',
    dueDate: '2026-11-15',
    estimatedHours: 12,
    progressPercent: 65,
    attachments: ['meridian_roster_mapping.csv'],
    comments: [
      { id: 'c1', authorName: 'Marcus Sterling', authorRole: 'Team Leader', text: 'Focus on night shift differential rules first.', timestamp: '2026-11-13 14:20' },
    ],
    createdBy: 'Marcus Sterling',
    updatedAt: '2026-11-14 08:15',
  },
  {
    id: 'TSK-102',
    title: 'Commission Cold Bay 3 handheld barcode scanners',
    description: 'Pair 18 handheld units with dock gateway and verify offline punch buffer.',
    category: 'Field Deployment',
    assignedEmployeeId: INITIAL_EMPLOYEES[1].id,
    assignedEmployeeName: INITIAL_EMPLOYEES[1].name,
    teamId: 'team-bravo',
    departmentName: 'Field & Site Operations',
    projectId: 'proj-2',
    siteId: 'site-2',
    branchId: 'br-pune',
    priority: 'Urgent',
    status: 'Blocked',
    startDate: '2026-11-10',
    dueDate: '2026-11-13',
    estimatedHours: 10,
    progressPercent: 40,
    attachments: ['dock_gateway_diag.txt'],
    comments: [
      { id: 'c2', authorName: 'David Chen', authorRole: 'Site Manager', text: 'Waiting on replacement PoE injector for Bay 3.', timestamp: '2026-11-13 17:45' },
    ],
    createdBy: 'Elena Vance',
    updatedAt: '2026-11-14 07:30',
  },
  {
    id: 'TSK-103',
    title: 'Stagger peak-hour break slots for Tier-1 Voice Queue',
    description: 'Rebalance 11:00–15:00 break windows to maintain minimum 85% queue staffing.',
    category: 'Queue Operations',
    assignedEmployeeId: INITIAL_EMPLOYEES[2].id,
    assignedEmployeeName: INITIAL_EMPLOYEES[2].name,
    teamId: 'team-charlie',
    departmentName: 'Customer Support Centre',
    projectId: 'proj-3',
    branchId: 'br-blr',
    priority: 'High',
    status: 'Assigned',
    startDate: '2026-11-14',
    dueDate: '2026-11-16',
    estimatedHours: 6,
    progressPercent: 20,
    attachments: [],
    comments: [],
    createdBy: 'Kavita Menon',
    updatedAt: '2026-11-14 08:00',
  },
  {
    id: 'TSK-104',
    title: 'Weekend floor coverage & stock replenishment plan',
    description: 'Assign 6 floor associates across cosmetics, checkout, and pickup desk for weekend surge.',
    category: 'Store Operations',
    assignedEmployeeId: INITIAL_EMPLOYEES[3].id,
    assignedEmployeeName: INITIAL_EMPLOYEES[3].name,
    teamId: 'team-delta',
    departmentName: 'Branch & Store Operations',
    projectId: 'proj-3',
    branchId: 'br-mum',
    priority: 'Medium',
    status: 'In Progress',
    startDate: '2026-11-12',
    dueDate: '2026-11-15',
    estimatedHours: 8,
    progressPercent: 75,
    attachments: ['floor_zone_map.pdf'],
    comments: [],
    createdBy: 'Ananya Deshmukh',
    updatedAt: '2026-11-14 08:45',
  },
  {
    id: 'TSK-105',
    title: 'Line B torque calibration & batch inspection log',
    description: 'Verify torque limits on Stations 1–6 prior to afternoon production batch.',
    category: 'Quality Assurance',
    assignedEmployeeId: INITIAL_EMPLOYEES[4].id,
    assignedEmployeeName: INITIAL_EMPLOYEES[4].name,
    teamId: 'team-echo',
    departmentName: 'Production & Quality',
    siteId: 'site-1',
    branchId: 'br-pune',
    priority: 'High',
    status: 'Completed',
    startDate: '2026-11-13',
    dueDate: '2026-11-14',
    estimatedHours: 5,
    progressPercent: 100,
    attachments: ['line_b_qa_cert.pdf'],
    comments: [],
    createdBy: 'Rohan Kulkarni',
    updatedAt: '2026-11-14 06:15',
  },
  {
    id: 'TSK-106',
    title: 'Audit missing biometric punches for Pune Plant Shift A',
    description: 'Collect supervisor sign-off for 4 workers affected by Gate B reader maintenance.',
    category: 'Attendance Ops',
    assignedEmployeeId: INITIAL_EMPLOYEES[9].id,
    assignedEmployeeName: INITIAL_EMPLOYEES[9].name,
    teamId: 'team-echo',
    departmentName: 'Production & Quality',
    siteId: 'site-1',
    branchId: 'br-pune',
    priority: 'Medium',
    status: 'Created',
    startDate: '2026-11-14',
    dueDate: '2026-11-16',
    estimatedHours: 4,
    progressPercent: 0,
    attachments: [],
    comments: [],
    createdBy: 'David Chen',
    updatedAt: '2026-11-14 07:10',
  },
  {
    id: 'TSK-107',
    title: 'Prepare parallel payroll discrepancy summary',
    description: 'Document overtime rounding variances across shifts for Meridian client review.',
    category: 'Implementation',
    assignedEmployeeId: INITIAL_EMPLOYEES[5].id,
    assignedEmployeeName: INITIAL_EMPLOYEES[5].name,
    teamId: 'team-alpha',
    departmentName: 'Engineering & Delivery',
    projectId: 'proj-1',
    branchId: 'br-blr',
    priority: 'Medium',
    status: 'Verified',
    startDate: '2026-11-08',
    dueDate: '2026-11-12',
    estimatedHours: 9,
    progressPercent: 100,
    attachments: ['variance_report_v2.xlsx'],
    comments: [],
    createdBy: 'Elena Vance',
    updatedAt: '2026-11-12 18:00',
  },
  {
    id: 'TSK-108',
    title: 'Contractor badge verification for Dock Wing B',
    description: 'Verify temporary contractor shift rosters and supervisor escort assignments.',
    category: 'Site Coordination',
    assignedEmployeeId: INITIAL_EMPLOYEES[6].id,
    assignedEmployeeName: INITIAL_EMPLOYEES[6].name,
    teamId: 'team-bravo',
    departmentName: 'Field & Site Operations',
    projectId: 'proj-2',
    siteId: 'site-1',
    branchId: 'br-pune',
    priority: 'High',
    status: 'Assigned',
    startDate: '2026-11-14',
    dueDate: '2026-11-13',
    estimatedHours: 4,
    progressPercent: 15,
    attachments: [],
    comments: [],
    createdBy: 'David Chen',
    updatedAt: '2026-11-14 06:50',
  },
  {
    id: 'TSK-109',
    title: 'Update escalation playbook for SLA breach alerts',
    description: 'Revise callback routing steps for Tier-1 agents when wait time exceeds 90 seconds.',
    category: 'Queue Operations',
    assignedEmployeeId: INITIAL_EMPLOYEES[7].id,
    assignedEmployeeName: INITIAL_EMPLOYEES[7].name,
    teamId: 'team-charlie',
    departmentName: 'Customer Support Centre',
    projectId: 'proj-3',
    branchId: 'br-blr',
    priority: 'Low',
    status: 'Completed',
    startDate: '2026-11-09',
    dueDate: '2026-11-13',
    estimatedHours: 5,
    progressPercent: 100,
    attachments: [],
    comments: [],
    createdBy: 'Kavita Menon',
    updatedAt: '2026-11-13 15:00',
  },
  {
    id: 'TSK-110',
    title: 'Click-and-collect counter staffing calibration',
    description: 'Align midday break rotations for Mumbai West pickup desk.',
    category: 'Store Operations',
    assignedEmployeeId: INITIAL_EMPLOYEES[8].id,
    assignedEmployeeName: INITIAL_EMPLOYEES[8].name,
    teamId: 'team-delta',
    departmentName: 'Branch & Store Operations',
    branchId: 'br-mum',
    priority: 'Medium',
    status: 'Created',
    startDate: '2026-11-14',
    dueDate: '2026-11-18',
    estimatedHours: 3,
    progressPercent: 0,
    attachments: [],
    comments: [],
    createdBy: 'Ananya Deshmukh',
    updatedAt: '2026-11-14 08:25',
  },
];

export const INITIAL_PROJECT_ALLOCATIONS: ProjectAllocation[] = INITIAL_EMPLOYEES
  .filter((e) => e.projectId)
  .slice(0, 24)
  .map((emp, idx) => ({
    id: `PA-${700 + idx}`,
    projectId: emp.projectId!,
    employeeId: emp.id,
    employeeName: emp.name,
    role: emp.designation,
    allocationPercent: idx % 6 === 0 ? 110 : idx % 3 === 0 ? 80 : 60,
    startDate: '2026-10-01',
    endDate: '2026-12-20',
    assignedHours: idx % 6 === 0 ? 44 : 32,
  }));

export const INITIAL_SITE_INCIDENTS: SiteIncident[] = [
  {
    id: 'INC-101',
    siteId: 'site-1',
    siteName: 'Pune Plant & Assembly Site A',
    date: TODAY_ISO,
    category: 'Access Control',
    description: 'Gate B biometric punch terminal lost network sync between 06:00 and 06:45; manual supervisor log maintained.',
    reportedBy: 'Rohan Kulkarni',
    priority: 'High',
    status: 'Under Review',
    attachmentName: 'gate_b_manual_log.pdf',
  },
  {
    id: 'INC-102',
    siteId: 'site-1',
    siteName: 'Pune Plant & Assembly Site A',
    date: '2026-11-13',
    category: 'Equipment',
    description: 'Assembly conveyor sensor #4 triggered intermittent stop during night run; maintenance reset completed.',
    reportedBy: 'David Chen',
    priority: 'Medium',
    status: 'Resolved',
  },
  {
    id: 'INC-103',
    siteId: 'site-2',
    siteName: 'Navi Mumbai Logistics Hub B',
    date: TODAY_ISO,
    category: 'Operational Delay',
    description: 'PoE switch fault in Cold Bay 3 delaying dock scanner pairing for morning loading crew.',
    reportedBy: 'Elena Vance',
    priority: 'Urgent',
    status: 'Escalated to Ops',
    attachmentName: 'bay3_switch_photo.jpg',
  },
];

export const INITIAL_KPIS: PerformanceKPI[] = INITIAL_EMPLOYEES.slice(0, 30).map((emp, idx) => {
  const isSupport = emp.departmentId === 'dept-cs';
  const isSite = emp.departmentId === 'dept-ops' || emp.departmentId === 'dept-mfg';
  const isBranch = emp.departmentId === 'dept-ret';

  const kpiName = isSupport
    ? 'Scheduled Adherence'
    : isSite
    ? 'Daily Job Completion Rate'
    : isBranch
    ? 'Floor Service Quality'
    : 'Milestone Task Delivery';

  const target = isSupport ? 95 : isSite ? 92 : 90;
  const actual = Math.min(104, 78 + ((idx * 7) % 24));

  return {
    id: `KPI-${900 + idx}`,
    employeeId: emp.id,
    employeeName: emp.name,
    departmentName: emp.departmentName,
    teamId: emp.teamId,
    jobFamily: emp.departmentName,
    kpiName,
    target,
    actual,
    unit: '%',
    reviewPeriod: 'Q4 2026',
  };
});

export const INITIAL_REVIEWS: PerformanceReview[] = INITIAL_EMPLOYEES.slice(0, 15).map((emp, idx) => ({
  id: `REV-${400 + idx}`,
  employeeId: emp.id,
  employeeName: emp.name,
  designation: emp.designation,
  teamId: emp.teamId,
  reviewPeriod: 'H2 2026 Mid-Cycle',
  goalsSummary: `Maintain >=94% attendance adherence and complete assigned ${emp.teamName} deliverables on schedule.`,
  managerFeedback:
    idx % 3 === 0
      ? 'Consistently supports shift handovers and mentors newly onboarded team associates.'
      : idx % 3 === 1
      ? 'Strong task accuracy; focus on earlier flagging of blocked dependencies.'
      : '',
  rating: idx % 3 === 0 ? 'Exceeds Expectations' : idx % 3 === 1 ? 'Meets Expectations' : 'Pending Review',
  status: idx % 3 === 2 ? 'Due' : idx % 3 === 1 ? 'Draft' : 'Submitted',
  updatedAt: '2026-11-12',
}));

export const INITIAL_ANNOUNCEMENTS: TeamAnnouncement[] = [
  {
    id: 'ANN-01',
    title: 'Weekend Shift Handover Checklist Update',
    message: 'All shift supervisors must attach the updated station verification sheet prior to morning sign-off effective Nov 15.',
    category: 'Shift Notice',
    targetTeamId: 'team-echo',
    targetTeamName: 'Line B Shift Unit',
    priority: 'High',
    publishDate: '2026-11-14',
    expiryDate: '2026-11-28',
    authorName: 'David Chen',
    status: 'Published',
    attachmentName: 'Handover_Checklist_Nov2026.pdf',
  },
  {
    id: 'ANN-02',
    title: 'Meridian Parallel Payroll Cutover Window',
    message: 'Platform Implementation team members allocated to PRJ-401 should avoid scheduling unapproved breaks between 14:00 and 16:00 on Nov 18.',
    category: 'Project Update',
    targetTeamId: 'team-alpha',
    targetTeamName: 'Platform Implementation',
    priority: 'Urgent',
    publishDate: '2026-11-13',
    expiryDate: '2026-11-20',
    authorName: 'Priya Nair',
    status: 'Published',
  },
  {
    id: 'ANN-03',
    title: 'Staggered Break Windows — Peak Voice Queue',
    message: 'Break rotations for Tier-1 Voice & Escalations have been calibrated to 15-minute staggered slots during 11:00–15:00.',
    category: 'Work Instruction',
    targetTeamId: 'team-charlie',
    targetTeamName: 'Tier-1 Voice & Escalations',
    priority: 'Medium',
    publishDate: '2026-11-12',
    expiryDate: '2026-12-12',
    authorName: 'Kavita Menon',
    status: 'Published',
  },
];

export const INITIAL_MESSAGES: TeamMessage[] = [
  {
    id: 'MSG-01',
    teamId: 'team-alpha',
    senderName: 'Marcus Sterling',
    senderRole: 'Team Leader',
    content: 'Morning everyone — please log any Meridian shift-mapping edge cases on TSK-101 before 15:00.',
    timestamp: '2026-11-14 08:45',
  },
  {
    id: 'MSG-02',
    teamId: 'team-alpha',
    senderName: 'Priya Nair',
    senderRole: 'Department Manager',
    content: 'Confirmed with client PMO: parallel attendance verification starts Monday 09:00 IST.',
    timestamp: '2026-11-14 09:02',
  },
  {
    id: 'MSG-03',
    teamId: 'team-bravo',
    senderName: 'David Chen',
    senderRole: 'Site Manager',
    content: 'Escalated Bay 3 PoE switch fault to IT Infrastructure (INC-103). Temporary manual scan sheet at Dock 3.',
    timestamp: '2026-11-14 07:40',
    isEscalation: true,
  },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'NOT-1',
    title: '3 Urgent Leave & Shift Swap Requests',
    description: 'Medical and emergency leave requests require coverage verification today.',
    timestamp: '12 min ago',
    read: false,
    route: '/approvals',
    category: 'Approval',
  },
  {
    id: 'NOT-2',
    title: 'Night Shift Handover Logged',
    description: 'Rohan Kulkarni submitted handover HND-901 for Pune Plant Site A.',
    timestamp: '1 hr ago',
    read: false,
    route: '/shifts',
    category: 'Shift',
  },
  {
    id: 'NOT-3',
    title: 'Site Incident Escalated (INC-103)',
    description: 'Cold Bay 3 scanner gateway fault flagged Urgent at Navi Mumbai Hub B.',
    timestamp: '2 hrs ago',
    read: false,
    route: '/sites',
    category: 'Site',
  },
  {
    id: 'NOT-4',
    title: 'Missing Punch Regularisations',
    description: 'Gate B terminal sync delay generated 6 attendance correction requests.',
    timestamp: '3 hrs ago',
    read: true,
    route: '/attendance',
    category: 'Attendance',
  },
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'AUD-1001',
    timestamp: '2026-11-14 08:15',
    actorName: 'Ananya Deshmukh',
    actorRole: 'Branch Manager',
    action: 'Approved Shift Swap',
    targetType: 'ShiftSwap',
    targetId: 'SWP-203',
    details: 'Approved swap for Nov 18 after verifying floor coverage at Mumbai West Flagship.',
  },
  {
    id: 'AUD-1002',
    timestamp: '2026-11-14 06:08',
    actorName: 'Rohan Kulkarni',
    actorRole: 'Shift Supervisor',
    action: 'Submitted Shift Handover',
    targetType: 'Handover',
    targetId: 'HND-901',
    details: 'Logged 3 outstanding station tasks and Gate B access notice.',
  },
  {
    id: 'AUD-1003',
    timestamp: '2026-11-13 19:20',
    actorName: 'Priya Nair',
    actorRole: 'Department Manager',
    action: 'Approved Leave Request',
    targetType: 'LeaveRequest',
    targetId: 'LVR-806',
    details: 'Approved 2-day Annual Leave with backup specialist assigned.',
  },
];
