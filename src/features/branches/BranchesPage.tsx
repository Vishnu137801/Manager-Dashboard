import React, { useMemo, useState } from 'react';
import { Building2, SlidersHorizontal } from 'lucide-react';
import { useApp } from '../../app/AppContext';
import { ColumnDef, DataTable } from '../../components/ui/DataTable';
import { FormModal } from '../../components/ui/FormModal';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Branch, Employee } from '../../types';

export const BranchesPage: React.FC = () => {
  const { currentManager, branches, scopedEmployees, updateBranchTarget } = useApp();

  const authorisedBranches = useMemo(
    () => branches.filter((b) => currentManager.assignedBranches.includes(b.id)),
    [branches, currentManager]
  );

  const [selectedBranchId, setSelectedBranchId] = useState<string>(authorisedBranches[0]?.id || branches[0]?.id);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [targetInput, setTargetInput] = useState<number>(95);

  const branchEmployees = useMemo(
    () => scopedEmployees.filter((e) => e.branchId === selectedBranchId),
    [scopedEmployees, selectedBranchId]
  );

  const empColumns: ColumnDef<Employee>[] = [
    { key: 'name', header: 'Employee', render: (e) => <span className="font-semibold text-[#0B1230]">{e.name}</span> },
    { key: 'role', header: 'Job Role', render: (e) => <span className="text-xs">{e.designation}</span> },
    { key: 'dept', header: 'Department', render: (e) => <span className="text-xs text-[#5A627A]">{e.departmentName}</span> },
    { key: 'shift', header: 'Assigned Shift', render: (e) => <span className="text-xs">{e.shiftName}</span> },
    { key: 'att', header: 'Attendance', render: (e) => <StatusBadge status={e.todayStatus} compact /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#0B1230]">Branch & Store Management</h1>
        <p className="text-xs text-[#5A627A] mt-0.5">
          Monitor branch staffing coverage, daily presence, and configurable non-sales or service operational targets
        </p>
      </div>

      {/* Authorised Branch Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {authorisedBranches.map((b) => {
          const staff = scopedEmployees.filter((e) => e.branchId === b.id);
          const present = staff.filter((e) => e.todayStatus === 'Present' || e.todayStatus === 'Late').length;
          const scheduled = staff.filter((e) => e.todayStatus !== 'Not Scheduled').length;
          const coverage = scheduled > 0 ? Math.round((present / scheduled) * 100) : 0;
          const isSelected = b.id === selectedBranchId;

          return (
            <div
              key={b.id}
              onClick={() => setSelectedBranchId(b.id)}
              className={`bg-white rounded-xl p-5 cursor-pointer transition-all space-y-3 border ${
                isSelected ? 'border-[#7050F5]' : 'border-[#E4E6F0] hover:border-[#7050F5]/40'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono text-[11px] font-semibold text-[#7050F5]">{b.code}</span>
                  <h3 className="text-sm font-semibold text-[#0B1230] flex items-center gap-1.5 mt-0.5">
                    <Building2 className="h-4 w-4 text-[#5A627A]" />
                    <span>{b.name}</span>
                  </h3>
                  <p className="text-xs text-[#5A627A]">Manager: {b.managerName} · {b.city}</p>
                </div>
                <StatusBadge status={b.operationalStatus} compact />
              </div>

              <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-[#EEF0F7] text-xs tabular-nums">
                <div>
                  <span className="block text-[11px] text-[#69718A]">Workforce</span>
                  <span className="font-bold text-[#0B1230]">{staff.length}</span>
                </div>
                <div>
                  <span className="block text-[11px] text-[#69718A]">Present</span>
                  <span className="font-bold text-[#16A36A]">{present}</span>
                </div>
                <div>
                  <span className="block text-[11px] text-[#69718A]">Coverage</span>
                  <span className="font-bold text-[#7050F5]">{coverage}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="block text-[11px] text-[#69718A]">{b.configuredTargetType}</span>
                  <span className="font-semibold text-[#0B1230] tabular-nums">
                    Actual {b.actualValue}{b.targetUnit} / Target {b.targetValue}{b.targetUnit}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingBranch(b);
                    setTargetInput(b.targetValue);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#F7F7FC] hover:bg-[#EEF0F7] text-[#0B1230] font-medium"
                >
                  <SlidersHorizontal className="h-3 w-3" />
                  <span>Target</span>
                </button>
              </div>
            </div>
          );
        })}
      </section>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-[#0B1230]">
          Branch Workforce — {authorisedBranches.find((b) => b.id === selectedBranchId)?.name || 'Selected Branch'}
        </h2>
        <DataTable data={branchEmployees} columns={empColumns} rowKey={(e) => e.id} />
      </div>

      <FormModal
        open={Boolean(editingBranch)}
        onClose={() => setEditingBranch(null)}
        title="Configure Operational Target"
        subtitle={editingBranch ? `${editingBranch.name} · ${editingBranch.configuredTargetType}` : ''}
      >
        {editingBranch && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateBranchTarget(editingBranch.id, targetInput);
              setEditingBranch(null);
            }}
            className="space-y-4 text-xs"
          >
            <div>
              <label className="block font-semibold text-[#0B1230] mb-1">
                Target Value ({editingBranch.targetUnit})
              </label>
              <input
                type="number"
                min={50}
                max={100}
                value={targetInput}
                onChange={(e) => setTargetInput(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-lg border border-[#E4E6F0]"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setEditingBranch(null)} className="px-4 py-2 font-semibold text-[#5A627A] bg-[#F7F7FC] rounded-lg">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 font-semibold text-white bg-[#7050F5] hover:bg-[#5D3EE0] rounded-lg">
                Save Target
              </button>
            </div>
          </form>
        )}
      </FormModal>
    </div>
  );
};
