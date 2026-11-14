import { useApp } from '../app/AppContext';
import { Permission } from '../types';

export function usePermissions() {
  const { currentManager, activeRole, hasPermission } = useApp();
  return {
    role: activeRole,
    roles: currentManager.roles,
    permissions: currentManager.permissions,
    can: (permission: Permission) => hasPermission(permission),
    canApprove: hasPermission(Permission.Approve),
    canAssign: hasPermission(Permission.Assign),
    canManageShifts: hasPermission(Permission.ManageShifts),
    canManageTeam: hasPermission(Permission.ManageTeam),
    canExport: hasPermission(Permission.Export),
    canViewReports: hasPermission(Permission.ViewReports),
  };
}
