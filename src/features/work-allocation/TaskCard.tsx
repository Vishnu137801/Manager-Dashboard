import React from 'react';
import { Calendar, Paperclip } from 'lucide-react';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { WorkTask } from '../../types';
import { formatDateShort } from '../../utils/formatters';

interface TaskCardProps {
  task: WorkTask;
  onSelect: (task: WorkTask) => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent, taskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onSelect,
  draggable = false,
  onDragStart,
}) => {
  const isOverdue = task.dueDate < '2026-11-14' && !['Completed', 'Verified', 'Cancelled'].includes(task.status);

  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart ? (e) => onDragStart(e, task.id) : undefined}
      onClick={() => onSelect(task)}
      className="bg-white border border-[#E4E6F0] hover:border-[#7050F5]/50 rounded-xl p-3.5 cursor-pointer transition-all space-y-2.5"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] font-semibold text-[#5A627A]">{task.id}</span>
        <StatusBadge status={task.priority} compact />
      </div>

      <h4 className="text-[13px] font-semibold text-[#0B1230] leading-snug line-clamp-2">
        {task.title}
      </h4>

      <div className="text-[11px] text-[#5A627A] flex items-center gap-1.5 truncate">
        <span>{task.assignedEmployeeName}</span>
        <span aria-hidden="true">·</span>
        <span>{task.category}</span>
      </div>

      <div className="pt-2 border-t border-[#EEF0F7] flex items-center justify-between text-[11px]">
        <span className={`inline-flex items-center gap-1 tabular-nums ${isOverdue ? 'text-[#E05252] font-semibold' : 'text-[#69718A]'}`}>
          <Calendar className="h-3 w-3" />
          {formatDateShort(task.dueDate)}
        </span>
        <div className="flex items-center gap-2 text-[#69718A] tabular-nums">
          {task.attachments.length > 0 && (
            <span className="inline-flex items-center gap-0.5">
              <Paperclip className="h-3 w-3" /> {task.attachments.length}
            </span>
          )}
          <span>{task.estimatedHours}h</span>
        </div>
      </div>
    </div>
  );
};
