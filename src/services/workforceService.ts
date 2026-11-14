import {
  AttendanceRecord,
  Employee,
  LeaveRequest,
  ManagerAccount,
  ManagerRole,
  OperationalSite,
  OvertimeRequest,
  PerformanceKPI,
  PerformanceReview,
  Permission,
  Project,
  RegularisationRequest,
  ShiftAssignment,
  ShiftSwapRequest,
  SiteIncident,
  TeamAnnouncement,
  WorkTask,
} from '../types';

/**
 * WorkforceService
 * Microservice-ready data scoping and permission boundary layer.
 * Enforces Part 19 security rules:
 * - Managers only view employees within authorised departments, teams, branches, projects, or sites.
 * - Restricted HR/payroll/bank fields are stripped from all manager-facing DTOs.
 */
export const workforceService = {
  hasPermission(manager: ManagerAccount, permission: Permission): boolean {
    return manager.permissions.includes(permission);
  },

  canViewEmployee(manager: ManagerAccount, emp: Employee, activeRole: ManagerRole): boolean {
    if (activeRole === ManagerRole.DepartmentManager) {
      return manager.assignedDepartments.includes(emp.departmentId) || manager.assignedTeams.includes(emp.teamId);
    }
    if (activeRole === ManagerRole.TeamLeader) {
      return manager.assignedTeams.includes(emp.teamId);
    }
    if (activeRole === ManagerRole.ProjectManager) {
      return Boolean(emp.projectId && manager.assignedProjects.includes(emp.projectId));
    }
    if (activeRole === ManagerRole.SiteManager) {
      return Boolean(emp.siteId && manager.assignedSites.includes(emp.siteId));
    }
    if (activeRole === ManagerRole.ShiftSupervisor) {
      return (
        manager.assignedTeams.includes(emp.teamId) ||
        manager.assignedBranches.includes(emp.branchId) ||
        Boolean(emp.siteId && manager.assignedSites.includes(emp.siteId))
      );
    }
    if (activeRole === ManagerRole.BranchManager) {
      return manager.assignedBranches.includes(emp.branchId);
    }
    if (activeRole === ManagerRole.CallCentreSupervisor) {
      return emp.departmentId === 'dept-cs' && manager.assignedTeams.includes(emp.teamId);
    }
    return false;
  },

  getScopedEmployees(
    employees: Employee[],
    manager: ManagerAccount,
    activeRole: ManagerRole,
    teamFilter?: string,
    branchFilter?: string
  ): Employee[] {
    return employees
      .filter((emp) => this.canViewEmployee(manager, emp, activeRole))
      .filter((emp) => (!teamFilter || teamFilter === 'all' ? true : emp.teamId === teamFilter))
      .filter((emp) => (!branchFilter || branchFilter === 'all' ? true : emp.branchId === branchFilter))
      .map((emp) => {
        // Strip restricted HR/salary fields per Part 19
        const { restrictedPayrollBand: _hidden, ...safeEmp } = emp;
        return safeEmp;
      });
  },

  getScopedAttendance(
    records: AttendanceRecord[],
    scopedEmployeeIds: Set<string>
  ): AttendanceRecord[] {
    return records.filter((r) => scopedEmployeeIds.has(r.employeeId));
  },

  getScopedLeaves(
    leaves: LeaveRequest[],
    scopedEmployeeIds: Set<string>
  ): LeaveRequest[] {
    return leaves.filter((l) => scopedEmployeeIds.has(l.employeeId));
  },

  getScopedOvertime(
    requests: OvertimeRequest[],
    scopedEmployeeIds: Set<string>
  ): OvertimeRequest[] {
    return requests.filter((o) => scopedEmployeeIds.has(o.employeeId));
  },

  getScopedRegularisations(
    requests: RegularisationRequest[],
    scopedEmployeeIds: Set<string>
  ): RegularisationRequest[] {
    return requests.filter((r) => scopedEmployeeIds.has(r.employeeId));
  },

  getScopedShiftAssignments(
    assignments: ShiftAssignment[],
    scopedEmployeeIds: Set<string>
  ): ShiftAssignment[] {
    return assignments.filter((s) => scopedEmployeeIds.has(s.employeeId));
  },

  getScopedShiftSwaps(
    swaps: ShiftSwapRequest[],
    scopedEmployeeIds: Set<string>
  ): ShiftSwapRequest[] {
    return swaps.filter((s) => scopedEmployeeIds.has(s.employeeId));
  },

  getScopedTasks(
    tasks: WorkTask[],
    scopedEmployeeIds: Set<string>,
    manager: ManagerAccount
  ): WorkTask[] {
    return tasks.filter(
      (t) =>
        scopedEmployeeIds.has(t.assignedEmployeeId) ||
        manager.assignedTeams.includes(t.teamId) ||
        (t.projectId && manager.assignedProjects.includes(t.projectId)) ||
        (t.siteId && manager.assignedSites.includes(t.siteId))
    );
  },

  getScopedProjects(projects: Project[], manager: ManagerAccount): Project[] {
    if (manager.assignedProjects.length === 0) return [];
    return projects.filter((p) => manager.assignedProjects.includes(p.id));
  },

  getScopedSites(sites: OperationalSite[], manager: ManagerAccount): OperationalSite[] {
    if (manager.assignedSites.length === 0) return [];
    return sites.filter((s) => manager.assignedSites.includes(s.id));
  },

  getScopedIncidents(incidents: SiteIncident[], manager: ManagerAccount): SiteIncident[] {
    return incidents.filter((inc) => manager.assignedSites.includes(inc.siteId));
  },

  getScopedKPIs(kpis: PerformanceKPI[], scopedEmployeeIds: Set<string>): PerformanceKPI[] {
    return kpis.filter((k) => scopedEmployeeIds.has(k.employeeId));
  },

  getScopedReviews(reviews: PerformanceReview[], scopedEmployeeIds: Set<string>): PerformanceReview[] {
    return reviews.filter((r) => scopedEmployeeIds.has(r.employeeId));
  },

  getScopedAnnouncements(announcements: TeamAnnouncement[], manager: ManagerAccount): TeamAnnouncement[] {
    return announcements.filter((a) => manager.assignedTeams.includes(a.targetTeamId));
  },
};
