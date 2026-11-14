import React from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Info,
  MinusCircle,
  PauseCircle,
  XCircle,
} from 'lucide-react';
import { classNames } from '../../utils/formatters';

interface StatusBadgeProps {
  status: string;
  compact?: boolean;
}

const STATUS_CONFIG: Record<string, { text: string; bg: string; icon: React.ComponentType<{ className?: string }> }> = {
  Present: { text: 'text-[#16A36A]', bg: 'bg-[#16A36A]/10', icon: CheckCircle2 },
  Approved: { text: 'text-[#16A36A]', bg: 'bg-[#16A36A]/10', icon: CheckCircle2 },
  Completed: { text: 'text-[#16A36A]', bg: 'bg-[#16A36A]/10', icon: CheckCircle2 },
  Verified: { text: 'text-[#16A36A]', bg: 'bg-[#16A36A]/10', icon: CheckCircle2 },
  Operational: { text: 'text-[#16A36A]', bg: 'bg-[#16A36A]/10', icon: CheckCircle2 },
  Nominal: { text: 'text-[#16A36A]', bg: 'bg-[#16A36A]/10', icon: CheckCircle2 },
  Active: { text: 'text-[#478BFA]', bg: 'bg-[#478BFA]/10', icon: CheckCircle2 },
  Published: { text: 'text-[#16A36A]', bg: 'bg-[#16A36A]/10', icon: CheckCircle2 },
  Submitted: { text: 'text-[#16A36A]', bg: 'bg-[#16A36A]/10', icon: CheckCircle2 },
  'On Time': { text: 'text-[#16A36A]', bg: 'bg-[#16A36A]/10', icon: CheckCircle2 },
  'Exceeds Expectations': { text: 'text-[#16A36A]', bg: 'bg-[#16A36A]/10', icon: CheckCircle2 },
  'Meets Expectations': { text: 'text-[#478BFA]', bg: 'bg-[#478BFA]/10', icon: CheckCircle2 },
  Available: { text: 'text-[#16A36A]', bg: 'bg-[#16A36A]/10', icon: CheckCircle2 },
  'On Call': { text: 'text-[#7050F5]', bg: 'bg-[#7050F5]/10', icon: CheckCircle2 },
  Resolved: { text: 'text-[#16A36A]', bg: 'bg-[#16A36A]/10', icon: CheckCircle2 },

  Late: { text: 'text-[#B97814]', bg: 'bg-[#E9A23B]/15', icon: Clock },
  Pending: { text: 'text-[#B97814]', bg: 'bg-[#E9A23B]/15', icon: Clock },
  'Pending Review': { text: 'text-[#B97814]', bg: 'bg-[#E9A23B]/15', icon: Clock },
  Due: { text: 'text-[#B97814]', bg: 'bg-[#E9A23B]/15', icon: Clock },
  'In Progress': { text: 'text-[#478BFA]', bg: 'bg-[#478BFA]/10', icon: Clock },
  Assigned: { text: 'text-[#7050F5]', bg: 'bg-[#7050F5]/10', icon: Info },
  'On Leave': { text: 'text-[#478BFA]', bg: 'bg-[#478BFA]/10', icon: PauseCircle },
  'On Break': { text: 'text-[#B97814]', bg: 'bg-[#E9A23B]/15', icon: PauseCircle },
  'In Break': { text: 'text-[#B97814]', bg: 'bg-[#E9A23B]/15', icon: PauseCircle },
  Extended: { text: 'text-[#B97814]', bg: 'bg-[#E9A23B]/15', icon: AlertCircle },
  'Peak Load': { text: 'text-[#B97814]', bg: 'bg-[#E9A23B]/15', icon: AlertCircle },
  'Under Review': { text: 'text-[#478BFA]', bg: 'bg-[#478BFA]/10', icon: Info },
  'Changes Requested': { text: 'text-[#B97814]', bg: 'bg-[#E9A23B]/15', icon: AlertCircle },
  High: { text: 'text-[#B97814]', bg: 'bg-[#E9A23B]/15', icon: AlertCircle },
  Medium: { text: 'text-[#478BFA]', bg: 'bg-[#478BFA]/10', icon: Info },

  Absent: { text: 'text-[#E05252]', bg: 'bg-[#E05252]/10', icon: XCircle },
  Rejected: { text: 'text-[#E05252]', bg: 'bg-[#E05252]/10', icon: XCircle },
  Blocked: { text: 'text-[#E05252]', bg: 'bg-[#E05252]/10', icon: AlertCircle },
  'Missing Punch': { text: 'text-[#E05252]', bg: 'bg-[#E05252]/10', icon: AlertCircle },
  Understaffed: { text: 'text-[#E05252]', bg: 'bg-[#E05252]/10', icon: AlertCircle },
  'At Risk': { text: 'text-[#E05252]', bg: 'bg-[#E05252]/10', icon: AlertCircle },
  Urgent: { text: 'text-[#E05252]', bg: 'bg-[#E05252]/10', icon: AlertCircle },
  'Escalated to Ops': { text: 'text-[#E05252]', bg: 'bg-[#E05252]/10', icon: AlertCircle },
  'Needs Focus': { text: 'text-[#E05252]', bg: 'bg-[#E05252]/10', icon: AlertCircle },

  'Not Scheduled': { text: 'text-[#5A627A]', bg: 'bg-[#EEF0F7]', icon: MinusCircle },
  Created: { text: 'text-[#5A627A]', bg: 'bg-[#EEF0F7]', icon: MinusCircle },
  Draft: { text: 'text-[#5A627A]', bg: 'bg-[#EEF0F7]', icon: MinusCircle },
  Archived: { text: 'text-[#5A627A]', bg: 'bg-[#EEF0F7]', icon: MinusCircle },
  Offline: { text: 'text-[#5A627A]', bg: 'bg-[#EEF0F7]', icon: MinusCircle },
  Low: { text: 'text-[#5A627A]', bg: 'bg-[#EEF0F7]', icon: MinusCircle },
  Scheduled: { text: 'text-[#5A627A]', bg: 'bg-[#EEF0F7]', icon: Clock },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, compact = false }) => {
  const cfg = STATUS_CONFIG[status] || { text: 'text-[#5A627A]', bg: 'bg-[#EEF0F7]', icon: Info };
  const Icon = cfg.icon;

  return (
    <span
      className={classNames(
        'inline-flex items-center gap-1.5 rounded-md font-medium whitespace-nowrap shrink-0',
        compact ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
        cfg.bg,
        cfg.text
      )}
    >
      <Icon className={compact ? 'h-3 w-3 shrink-0' : 'h-3.5 w-3.5 shrink-0'} />
      <span>{status}</span>
    </span>
  );
};
