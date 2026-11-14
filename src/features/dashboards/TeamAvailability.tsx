import React, { useMemo } from 'react';
import { useApp } from '../../app/AppContext';

export const TeamAvailability: React.FC = () => {
  const { scopedEmployees } = useApp();

  const stats = useMemo(() => {
    const total = Math.max(1, scopedEmployees.length);
    const onShift = scopedEmployees.filter((e) => e.todayStatus === 'Present' || e.todayStatus === 'Late').length;
    const available = scopedEmployees.filter((e) => e.todayStatus === 'Present').length;
    const onLeave = scopedEmployees.filter((e) => e.todayStatus === 'On Leave').length;
    const onBreak = scopedEmployees.filter((e) => e.todayStatus === 'On Break').length;
    const notScheduled = scopedEmployees.filter((e) => e.todayStatus === 'Not Scheduled').length;

    return [
      { label: 'Available Now', count: available, pct: Math.round((available / total) * 100), bar: 'bg-[#16A36A]' },
      { label: 'Active on Shift', count: onShift, pct: Math.round((onShift / total) * 100), bar: 'bg-[#7050F5]' },
      { label: 'On Break', count: onBreak, pct: Math.round((onBreak / total) * 100), bar: 'bg-[#E9A23B]' },
      { label: 'On Approved Leave', count: onLeave, pct: Math.round((onLeave / total) * 100), bar: 'bg-[#478BFA]' },
      { label: 'Not Scheduled', count: notScheduled, pct: Math.round((notScheduled / total) * 100), bar: 'bg-[#8E95AA]' },
    ];
  }, [scopedEmployees]);

  return (
    <div className="bg-white border border-[#E4E6F0] rounded-xl p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-[#0B1230]">Team Availability</h3>
        <p className="text-xs text-[#5A627A]">Live workforce allocation across your authorised team</p>
      </div>
      <div className="space-y-3">
        {stats.map((row) => (
          <div key={row.label} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-[#0B1230]">{row.label}</span>
              <span className="font-semibold text-[#0B1230] tabular-nums">
                {row.count} <span className="text-[#69718A] font-normal">({row.pct}%)</span>
              </span>
            </div>
            <div className="h-2 w-full bg-[#EEF0F7] rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${row.bar}`} style={{ width: `${row.pct}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
