import React from 'react';
import { Employee } from '../../types';
import { AvatarBadge } from './AvatarBadge';
import { StatusBadge } from './StatusBadge';

interface EmployeeProfileCardProps {
  employee: Employee;
  onAction?: (action: 'profile' | 'assign-work' | 'assign-shift') => void;
}

export const EmployeeProfileCard: React.FC<EmployeeProfileCardProps> = ({ employee, onAction }) => {
  return (
    <div className="bg-white border border-[#E4E6F0] rounded-xl p-4 flex flex-col justify-between gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <AvatarBadge name={employee.name} initials={employee.initials} src={employee.avatarUrl} size="md" />
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-[#0B1230] truncate">{employee.name}</h4>
            <p className="text-xs text-[#5A627A] truncate">
              {employee.designation} · {employee.employeeCode}
            </p>
          </div>
        </div>
        <StatusBadge status={employee.todayStatus} compact />
      </div>

      <div className="text-xs text-[#5A627A] flex flex-wrap items-center gap-x-2 gap-y-1">
        <span>{employee.departmentName}</span>
        <span aria-hidden="true">·</span>
        <span>{employee.shiftName}</span>
        <span aria-hidden="true">·</span>
        <span className="tabular-nums">Workload {employee.workloadPercent}%</span>
      </div>

      {onAction && (
        <div className="pt-2.5 border-t border-[#EEF0F7] flex items-center gap-2">
          <button
            type="button"
            onClick={() => onAction('profile')}
            className="px-2.5 py-1.5 text-xs font-medium text-[#0B1230] bg-[#F7F7FC] hover:bg-[#EEF0F7] rounded-md transition-colors"
          >
            Profile
          </button>
          <button
            type="button"
            onClick={() => onAction('assign-work')}
            className="px-2.5 py-1.5 text-xs font-medium text-[#7050F5] hover:bg-[#7050F5]/10 rounded-md transition-colors"
          >
            Assign Work
          </button>
          <button
            type="button"
            onClick={() => onAction('assign-shift')}
            className="px-2.5 py-1.5 text-xs font-medium text-[#478BFA] hover:bg-[#478BFA]/10 rounded-md transition-colors"
          >
            Assign Shift
          </button>
        </div>
      )}
    </div>
  );
};
