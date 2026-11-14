import React, { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useApp } from '../../app/AppContext';

export const TeamPerformanceChart: React.FC = () => {
  const { scopedTasks, scopedKPIs } = useApp();

  const summary = useMemo(() => {
    const completed = scopedTasks.filter((t) => t.status === 'Completed' || t.status === 'Verified').length;
    const pending = scopedTasks.filter((t) => ['Created', 'Assigned', 'Accepted', 'In Progress'].includes(t.status)).length;
    const overdue = scopedTasks.filter(
      (t) => t.dueDate < '2026-11-14' && !['Completed', 'Verified', 'Cancelled'].includes(t.status)
    ).length;

    const avgAch =
      scopedKPIs.length > 0
        ? Math.round(scopedKPIs.reduce((acc, k) => acc + (k.actual / k.target) * 100, 0) / scopedKPIs.length)
        : 92;

    const bars = [
      { label: 'Completed', count: completed, fill: '#16A36A' },
      { label: 'In Progress', count: scopedTasks.filter((t) => t.status === 'In Progress').length, fill: '#478BFA' },
      { label: 'Assigned', count: scopedTasks.filter((t) => t.status === 'Assigned' || t.status === 'Created').length, fill: '#7050F5' },
      { label: 'Blocked', count: scopedTasks.filter((t) => t.status === 'Blocked').length, fill: '#E05252' },
    ];

    return { completed, pending, overdue, avgAch, bars };
  }, [scopedTasks, scopedKPIs]);

  return (
    <div className="bg-white border border-[#E4E6F0] rounded-xl p-5 flex flex-col justify-between">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <h3 className="text-sm font-semibold text-[#0B1230]">Team Performance & Task Execution</h3>
          <p className="text-xs text-[#5A627A]">Target achievement and work item completion status</p>
        </div>
        <span className="text-sm font-bold text-[#16A36A] tabular-nums">{summary.avgAch}% Target</span>
      </div>

      <div className="grid grid-cols-4 gap-2 py-2.5 border-y border-[#EEF0F7] mb-3 text-center">
        <div>
          <span className="block text-[11px] text-[#69718A]">Completed</span>
          <span className="text-base font-bold text-[#16A36A] tabular-nums">{summary.completed}</span>
        </div>
        <div>
          <span className="block text-[11px] text-[#69718A]">Pending</span>
          <span className="text-base font-bold text-[#0B1230] tabular-nums">{summary.pending}</span>
        </div>
        <div>
          <span className="block text-[11px] text-[#69718A]">Overdue</span>
          <span className="text-base font-bold text-[#E05252] tabular-nums">{summary.overdue}</span>
        </div>
        <div>
          <span className="block text-[11px] text-[#69718A]">KPI Avg</span>
          <span className="text-base font-bold text-[#7050F5] tabular-nums">{summary.avgAch}%</span>
        </div>
      </div>

      <div className="h-[155px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={summary.bars} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F7" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#69718A' }} axisLine={{ stroke: '#E4E6F0' }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#69718A' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                borderColor: '#E4E6F0',
                borderRadius: '10px',
                fontSize: '12px',
              }}
            />
            <Bar dataKey="count" name="Tasks" radius={[6, 6, 0, 0]} fill="#7050F5" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
