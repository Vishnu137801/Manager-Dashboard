import React, { useState } from 'react';
import { ShiftAssignment, ShiftDefinition } from '../../types';

type CalendarViewMode = 'daily' | 'weekly' | 'monthly' | 'employee' | 'shift';

interface ShiftCalendarProps {
  assignments: ShiftAssignment[];
  shifts: ShiftDefinition[];
}

const WEEK_DAYS = ['Sat 14', 'Sun 15', 'Mon 16', 'Tue 17', 'Wed 18', 'Thu 19', 'Fri 20'];

export const ShiftCalendar: React.FC<ShiftCalendarProps> = ({ assignments, shifts }) => {
  const [viewMode, setViewMode] = useState<CalendarViewMode>('weekly');

  return (
    <div className="bg-white border border-[#E4E6F0] rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-[#EEF0F7] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-[#0B1230]">Shift Calendar</h3>
          <p className="text-xs text-[#5A627A]">Switch between Daily, Weekly, Monthly, Employee, and Shift perspectives</p>
        </div>

        <div className="inline-flex items-center gap-1 p-1 bg-[#F7F7FC] border border-[#E4E6F0] rounded-lg overflow-x-auto">
          {(
            [
              ['daily', 'Daily'],
              ['weekly', 'Weekly'],
              ['monthly', 'Monthly'],
              ['employee', 'Employee'],
              ['shift', 'Shift'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setViewMode(id)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
                viewMode === id ? 'bg-white text-[#0B1230] shadow-xs' : 'text-[#5A627A] hover:text-[#0B1230]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {viewMode === 'weekly' && (
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F7F7FC] border-b border-[#E4E6F0] text-[11px] font-semibold text-[#5A627A]">
                <th className="px-4 py-2.5 whitespace-nowrap">Employee</th>
                {WEEK_DAYS.map((d) => (
                  <th key={d} className="px-3 py-2.5 text-center whitespace-nowrap">
                    {d} Nov
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF0F7] text-xs">
              {assignments.slice(0, 12).map((a) => (
                <tr key={a.id} className="hover:bg-[#F7F7FC]/60">
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <p className="font-semibold text-[#0B1230]">{a.employeeName}</p>
                    <p className="text-[11px] text-[#69718A]">{a.location}</p>
                  </td>
                  {WEEK_DAYS.map((d) => {
                    const isOff = d.startsWith('Sun') && a.weeklyOff.includes('Sunday');
                    return (
                      <td key={d} className="px-2 py-2.5 text-center">
                        {isOff ? (
                          <span className="inline-block px-2 py-1 rounded bg-[#EEF0F7] text-[#69718A] text-[11px]">
                            Off
                          </span>
                        ) : (
                          <div className="inline-block px-2 py-1 rounded bg-[#7050F5]/10 text-[#7050F5] text-[11px] font-medium whitespace-nowrap">
                            {a.shiftName.replace(' Shift', '')} · {a.startTime}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewMode === 'daily' && (
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {assignments.slice(0, 12).map((a) => (
            <div key={a.id} className="p-3.5 rounded-lg border border-[#E4E6F0] bg-[#F7F7FC]/50 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#0B1230]">{a.employeeName}</span>
                <span className="font-mono text-[11px] text-[#7050F5] font-semibold">
                  {a.startTime}–{a.endTime}
                </span>
              </div>
              <p className="text-[#5A627A]">{a.shiftName} · Break {a.breakDuration}m</p>
              <p className="text-[11px] text-[#69718A]">{a.location}</p>
            </div>
          ))}
        </div>
      )}

      {viewMode === 'monthly' && (
        <div className="p-5 grid grid-cols-7 gap-2 text-xs">
          {Array.from({ length: 28 }).map((_, i) => {
            const dayNum = i + 1;
            const totalScheduled = assignments.length;
            return (
              <div key={dayNum} className="border border-[#E4E6F0] rounded-lg p-2.5 min-h-[70px] bg-white">
                <span className="font-semibold text-[#0B1230] tabular-nums">{dayNum} Nov</span>
                <p className="mt-1 text-[11px] text-[#7050F5] font-medium tabular-nums">
                  {dayNum % 7 === 0 ? Math.round(totalScheduled * 0.6) : totalScheduled} scheduled
                </p>
              </div>
            );
          })}
        </div>
      )}

      {viewMode === 'employee' && (
        <div className="divide-y divide-[#EEF0F7] text-xs">
          {assignments.slice(0, 14).map((a) => (
            <div key={a.id} className="px-5 py-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-[#0B1230]">{a.employeeName}</p>
                <p className="text-[#5A627A]">{a.departmentName} · Weekly Off: {a.weeklyOff}</p>
              </div>
              <div className="text-right tabular-nums">
                <p className="font-semibold text-[#7050F5]">{a.shiftName}</p>
                <p className="text-[#69718A]">{a.startTime} – {a.endTime} · {a.location}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewMode === 'shift' && (
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {shifts.map((sh) => {
            const assigned = assignments.filter((a) => a.shiftId === sh.id);
            return (
              <div key={sh.id} className="border border-[#E4E6F0] rounded-xl p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-[#0B1230]">{sh.name}</h4>
                    <p className="text-xs text-[#5A627A] tabular-nums">
                      {sh.startTime} – {sh.endTime} · {sh.breakMinutes}m break
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-[#7050F5] tabular-nums">{assigned.length} assigned</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {assigned.slice(0, 8).map((a) => (
                    <span key={a.id} className="px-2 py-1 rounded bg-[#F7F7FC] border border-[#E4E6F0] text-[11px] text-[#0B1230]">
                      {a.employeeName}
                    </span>
                  ))}
                  {assigned.length > 8 && (
                    <span className="px-2 py-1 text-[11px] text-[#69718A]">+{assigned.length - 8} more</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
