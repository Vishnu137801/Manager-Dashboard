import React, { useMemo, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useApp } from '../../app/AppContext';

type DistributionDimension = 'department' | 'employmentType' | 'shift' | 'project';

const PALETTE = ['#7050F5', '#478BFA', '#16A36A', '#E9A23B', '#0B1230', '#8C74FA'];

export const WorkloadChart: React.FC = () => {
  const { scopedEmployees, scopedProjects } = useApp();
  const [dimension, setDimension] = useState<DistributionDimension>('department');

  const distribution = useMemo(() => {
    const counts = new Map<string, number>();
    const projectMap = new Map(scopedProjects.map((p) => [p.id, p.name]));

    scopedEmployees.forEach((emp) => {
      let key = emp.departmentName;
      if (dimension === 'employmentType') key = emp.employmentType;
      else if (dimension === 'shift') key = emp.shiftName;
      else if (dimension === 'project') key = emp.projectId ? projectMap.get(emp.projectId) || 'Assigned Project' : 'Unassigned';
      counts.set(key, (counts.get(key) || 0) + 1);
    });

    return Array.from(counts.entries()).map(([name, value], idx) => ({
      name,
      value,
      color: PALETTE[idx % PALETTE.length],
    }));
  }, [scopedEmployees, scopedProjects, dimension]);

  return (
    <div className="bg-white border border-[#E4E6F0] rounded-xl p-5 flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div>
          <h3 className="text-sm font-semibold text-[#0B1230]">Team Distribution</h3>
          <p className="text-xs text-[#5A627A]">Headcount breakdown by category</p>
        </div>
        <select
          aria-label="Distribution category"
          value={dimension}
          onChange={(e) => setDimension(e.target.value as DistributionDimension)}
          className="h-8 px-2.5 text-xs font-medium bg-[#F7F7FC] border border-[#E4E6F0] rounded-lg text-[#0B1230] focus:outline-none focus:border-[#7050F5]"
        >
          <option value="department">By Department</option>
          <option value="employmentType">By Employment Type</option>
          <option value="shift">By Shift</option>
          <option value="project">By Project</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4">
        <div className="h-[190px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={distribution}
                dataKey="value"
                nameKey="name"
                innerRadius={52}
                outerRadius={78}
                paddingAngle={2}
              >
                {distribution.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E4E6F0',
                  borderRadius: '10px',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <ul className="space-y-2 text-xs">
          {distribution.map((item) => {
            const pct = scopedEmployees.length > 0 ? Math.round((item.value / scopedEmployees.length) * 100) : 0;
            return (
              <li key={item.name} className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 min-w-0">
                  <span
                    className="h-2.5 w-2.5 rounded-xs shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-[#0B1230] truncate">{item.name}</span>
                </span>
                <span className="font-semibold text-[#0B1230] tabular-nums shrink-0">
                  {item.value} <span className="text-[#69718A] font-normal">({pct}%)</span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};
