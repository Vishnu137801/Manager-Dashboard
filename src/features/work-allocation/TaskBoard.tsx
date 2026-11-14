import React from 'react';
import { TaskStatus, WorkTask } from '../../types';
import { TaskCard } from './TaskCard';

interface TaskBoardProps {
  tasks: WorkTask[];
  canMove: boolean;
  onMoveStatus: (taskId: string, newStatus: TaskStatus) => void;
  onSelectTask: (task: WorkTask) => void;
}

const COLUMNS: Array<{ title: string; status: TaskStatus; match: TaskStatus[] }> = [
  { title: 'To Do', status: 'Created', match: ['Created'] },
  { title: 'Assigned', status: 'Assigned', match: ['Assigned', 'Accepted'] },
  { title: 'In Progress', status: 'In Progress', match: ['In Progress'] },
  { title: 'Blocked', status: 'Blocked', match: ['Blocked'] },
  { title: 'Completed', status: 'Completed', match: ['Completed', 'Verified'] },
];

export const TaskBoard: React.FC<TaskBoardProps> = ({
  tasks,
  canMove,
  onMoveStatus,
  onSelectTask,
}) => {
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    if (!canMove) return;
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onMoveStatus(taskId, targetStatus);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
      {COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => col.match.includes(t.status));
        return (
          <div
            key={col.title}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, col.status)}
            className="bg-[#EEF0F7]/70 border border-[#E4E6F0] rounded-xl p-3 flex flex-col min-h-[340px]"
          >
            <div className="flex items-center justify-between px-1 pb-2.5 mb-2.5 border-b border-[#DCE0EC]">
              <h3 className="text-xs font-bold text-[#0B1230]">{col.title}</h3>
              <span className="text-xs font-semibold text-[#5A627A] tabular-nums">{colTasks.length}</span>
            </div>
            <div className="space-y-2.5 flex-1">
              {colTasks.length === 0 ? (
                <p className="text-[11px] text-[#8E95AA] text-center py-8">Drop task here</p>
              ) : (
                colTasks.map((t) => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    draggable={canMove}
                    onDragStart={handleDragStart}
                    onSelect={onSelectTask}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
