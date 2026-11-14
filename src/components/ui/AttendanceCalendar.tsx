import React, { useMemo } from 'react';
import { AttendanceRecord } from '../../types';

interface AttendanceCalendarProps {
  records: AttendanceRecord[];
}

export const AttendanceCalendar: React.FC<AttendanceCalendarProps> = ({ records }) => {
  const dailySummary = useMemo(() => {
    const map = new Map<string, { present: number; late: number; leave: number; absent: number }>();
    records.forEach((r) => {
      const cur = map.get(r.date) || { present: 0, late: 0, leave: 0, absent: 0 };
      if (r.status === 'Present' || r.status === 'On Break') cur.present += 1;
      else if (r.status === 'Late') cur.late += 1;
      else if (r.status === 'On Leave') cur.leave += 1;
      else if (r.status === 'Absent' || r.status === 'Missing Punch') cur.absent += 1;
      map.set(r.date, cur);
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, stats]) => ({ date, ...stats }));
  }, [records]);

  return (
    <div className="bg-white border border-[#E4E6F0] rounded-xl p-5">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-[#0B1230]">14-Day Attendance History Grid</h3>
          <p className="text-xs text-[#5A627A]">Daily headcount totals derived from verified terminal punches</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
        {dailySummary.map((day) => {
          const d = new Date(day.date + 'T00:00:00');
          return (
            <div
              key={day.date}
              className="border border-[#E4E6F0] rounded-lg p-3 bg-[#F7F7FC]/60 text-xs space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#0B1230] tabular-nums">
                  {d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                </span>
                <span className="text-[11px] text-[#69718A]">
                  {d.toLocaleDateString('en-GB', { weekday: 'short' })}
                </span>
              </div>
              <div className="space-y-0.5 text-[11px] tabular-nums">
                <div className="flex justify-between">
                  <span className="text-[#5A627A]">Present</span>
                  <span className="font-semibold text-[#16A36A]">{day.present}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5A627A]">Late</span>
                  <span className="font-semibold text-[#B97814]">{day.late}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5A627A]">Leave</span>
                  <span className="font-semibold text-[#478BFA]">{day.leave}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5A627A]">Absent</span>
                  <span className="font-semibold text-[#E05252]">{day.absent}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
