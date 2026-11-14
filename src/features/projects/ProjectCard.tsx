import React from 'react';
import { Calendar, Users } from 'lucide-react';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Project } from '../../types';
import { formatDateShort } from '../../utils/formatters';

interface ProjectCardProps {
  project: Project;
  teamCount: number;
  onSelect: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, teamCount, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(project)}
      className="bg-white border border-[#E4E6F0] hover:border-[#7050F5]/50 rounded-xl p-5 cursor-pointer transition-all space-y-3.5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="font-mono text-[11px] font-semibold text-[#7050F5]">{project.code}</span>
          <h3 className="text-sm font-semibold text-[#0B1230] truncate mt-0.5">{project.name}</h3>
          <p className="text-xs text-[#5A627A] truncate">{project.client}</p>
        </div>
        <StatusBadge status={project.status} compact />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#5A627A]">Delivery Progress</span>
          <span className="font-semibold text-[#0B1230] tabular-nums">{project.progressPercent}%</span>
        </div>
        <div className="h-1.5 w-full bg-[#EEF0F7] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${project.status === 'At Risk' ? 'bg-[#E05252]' : 'bg-[#7050F5]'}`}
            style={{ width: `${project.progressPercent}%` }}
          />
        </div>
      </div>

      <div className="pt-2.5 border-t border-[#EEF0F7] flex items-center justify-between text-xs text-[#5A627A]">
        <span className="inline-flex items-center gap-1 tabular-nums">
          <Users className="h-3.5 w-3.5" /> {teamCount} members
        </span>
        <span className="inline-flex items-center gap-1 tabular-nums">
          <Calendar className="h-3.5 w-3.5" /> Due {formatDateShort(project.endDate)}
        </span>
      </div>
    </div>
  );
};
