import React, { useMemo, useState } from 'react';
import { Download, FileSpreadsheet, Printer } from 'lucide-react';
import { useApp } from '../../app/AppContext';
import { ColumnDef, DataTable } from '../../components/ui/DataTable';
import { usePermissions } from '../../hooks/usePermissions';
import { TODAY_ISO } from '../../mock-data/seedData';
import { exportToCSV, exportToExcelCompatible } from '../../utils/exportUtils';

type ReportCategory = 'team' | 'attendance' | 'shifts' | 'leave' | 'projects' | 'productivity' | 'sites';

interface ReportRow {
  id: string;
  col1: string;
  col2: string;
  col3: string;
  col4: string;
  col5: string;
}

export const ReportsPage: React.FC = () => {
  const {
    activeRole,
    scopedEmployees,
    scopedAttendance,
    scopedShiftAssignments,
    scopedLeaves,
    scopedProjects,
    scopedKPIs,
    scopedSites,
    departments,
    branches,
    pushToast,
  } = useApp();
  const { canExport } = usePermissions();

  const [category, setCategory] = useState<ReportCategory>('attendance');
  const [deptFilter, setDeptFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState(TODAY_ISO);

  const reportSpec = useMemo<{
    title: string;
    headers: [string, string, string, string, string];
    rows: ReportRow[];
  }>(() => {
    const filteredEmps = scopedEmployees
      .filter((e) => (deptFilter === 'all' ? true : e.departmentId === deptFilter))
      .filter((e) => (branchFilter === 'all' ? true : e.branchId === branchFilter));
    const empIds = new Set(filteredEmps.map((e) => e.id));

    if (category === 'team') {
      return {
        title: 'Team Headcount & Allocation Report',
        headers: ['Employee ID', 'Name', 'Department & Team', 'Branch / Location', 'Workload & Status'],
        rows: filteredEmps.map((e) => ({
          id: e.id,
          col1: e.employeeCode,
          col2: e.name,
          col3: `${e.departmentName} · ${e.teamName}`,
          col4: e.workLocation,
          col5: `${e.workloadPercent}% · ${e.todayStatus}`,
        })),
      };
    }

    if (category === 'attendance') {
      const att = scopedAttendance.filter((a) => a.date === dateFilter && empIds.has(a.employeeId));
      return {
        title: `Daily Attendance Report (${dateFilter})`,
        headers: ['Employee', 'Department', 'Shift', 'Check In / Out', 'Hours & Status'],
        rows: att.map((a) => ({
          id: a.id,
          col1: a.employeeName,
          col2: a.departmentName,
          col3: a.shiftName,
          col4: `${a.checkIn || '—'} / ${a.checkOut || '—'}`,
          col5: `${a.workingHours.toFixed(1)}h · ${a.status}`,
        })),
      };
    }

    if (category === 'shifts') {
      const sh = scopedShiftAssignments.filter((s) => empIds.has(s.employeeId));
      return {
        title: 'Shift Coverage & Roster Report',
        headers: ['Employee', 'Shift', 'Window', 'Weekly Off', 'Location'],
        rows: sh.map((s) => ({
          id: s.id,
          col1: s.employeeName,
          col2: s.shiftName,
          col3: `${s.startTime} – ${s.endTime}`,
          col4: s.weeklyOff,
          col5: s.location,
        })),
      };
    }

    if (category === 'leave') {
      const lv = scopedLeaves.filter((l) => empIds.has(l.employeeId));
      return {
        title: 'Leave Summary & Approval History Report',
        headers: ['Request ID', 'Employee', 'Leave Type', 'Dates & Days', 'Status'],
        rows: lv.map((l) => ({
          id: l.id,
          col1: l.id,
          col2: l.employeeName,
          col3: l.leaveType,
          col4: `${l.startDate} to ${l.endDate} (${l.requestedDays}d)`,
          col5: `${l.status}${l.reviewedBy ? ` · ${l.reviewedBy}` : ''}`,
        })),
      };
    }

    if (category === 'projects') {
      return {
        title: 'Project Allocation & Delivery Report',
        headers: ['Project Code', 'Project Name', 'Client', 'Manager', 'Progress & Status'],
        rows: scopedProjects.map((p) => ({
          id: p.id,
          col1: p.code,
          col2: p.name,
          col3: p.client,
          col4: p.projectManagerName,
          col5: `${p.progressPercent}% · ${p.status}`,
        })),
      };
    }

    if (category === 'productivity') {
      const kpis = scopedKPIs.filter((k) => empIds.has(k.employeeId));
      return {
        title: 'Employee KPI & Productivity Report',
        headers: ['Employee', 'Job Family', 'KPI Metric', 'Target vs Actual', 'Period'],
        rows: kpis.map((k) => ({
          id: k.id,
          col1: k.employeeName,
          col2: k.jobFamily,
          col3: k.kpiName,
          col4: `${k.actual}${k.unit} / ${k.target}${k.unit}`,
          col5: k.reviewPeriod,
        })),
      };
    }

    return {
      title: 'Site Workforce Deployment Report',
      headers: ['Site Code', 'Site Name', 'Location', 'Site Manager', 'Contractors & Status'],
      rows: scopedSites.map((s) => ({
        id: s.id,
        col1: s.code,
        col2: s.name,
        col3: s.location,
        col4: s.siteManagerName,
        col5: `${s.activeContractorsCount} contractors · ${s.status}`,
      })),
    };
  }, [
    category,
    scopedEmployees,
    scopedAttendance,
    scopedShiftAssignments,
    scopedLeaves,
    scopedProjects,
    scopedKPIs,
    scopedSites,
    deptFilter,
    branchFilter,
    dateFilter,
  ]);

  const columns: ColumnDef<ReportRow>[] = [
    { key: 'col1', header: reportSpec.headers[0], render: (r) => <span className="font-medium text-[#0B1230]">{r.col1}</span> },
    { key: 'col2', header: reportSpec.headers[1], render: (r) => <span className="text-xs">{r.col2}</span> },
    { key: 'col3', header: reportSpec.headers[2], render: (r) => <span className="text-xs text-[#5A627A]">{r.col3}</span> },
    { key: 'col4', header: reportSpec.headers[3], render: (r) => <span className="text-xs tabular-nums">{r.col4}</span> },
    { key: 'col5', header: reportSpec.headers[4], render: (r) => <span className="text-xs font-semibold tabular-nums">{r.col5}</span> },
  ];

  const handleCSV = () => {
    exportToCSV(
      `payfuse_${category}_report_${dateFilter}.csv`,
      reportSpec.headers,
      reportSpec.rows.map((r) => [r.col1, r.col2, r.col3, r.col4, r.col5])
    );
    pushToast({ title: 'CSV report exported', description: `${reportSpec.rows.length} rows downloaded.`, variant: 'success' });
  };

  const handleExcel = () => {
    exportToExcelCompatible(
      `payfuse_${category}_report_${dateFilter}.xls`,
      reportSpec.headers,
      reportSpec.rows.map((r) => [r.col1, r.col2, r.col3, r.col4, r.col5])
    );
    pushToast({ title: 'Excel report exported', description: `${reportSpec.rows.length} rows downloaded.`, variant: 'success' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        <div>
          <h1 className="text-xl font-bold text-[#0B1230]">Reports & Analytics</h1>
          <p className="text-xs text-[#5A627A] mt-0.5">
            Scoped operational exports under {activeRole} authority ({reportSpec.rows.length} records)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canExport ? (
            <>
              <button
                type="button"
                onClick={handleCSV}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#0B1230] bg-white border border-[#E4E6F0] hover:bg-[#F7F7FC] rounded-lg"
              >
                <Download className="h-3.5 w-3.5 text-[#7050F5]" />
                <span>CSV Export</span>
              </button>
              <button
                type="button"
                onClick={handleExcel}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#0B1230] bg-white border border-[#E4E6F0] hover:bg-[#F7F7FC] rounded-lg"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-[#16A36A]" />
                <span>Excel Export</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#7050F5] hover:bg-[#5D3EE0] rounded-lg"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>PDF / Print</span>
              </button>
            </>
          ) : (
            <span className="text-xs text-[#69718A]">Export permission disabled for this role</span>
          )}
        </div>
      </div>

      {/* Category & Filters */}
      <div className="bg-white border border-[#E4E6F0] rounded-xl p-4 space-y-3 no-print">
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              ['attendance', 'Attendance Reports'],
              ['team', 'Team Reports'],
              ['shifts', 'Shift Reports'],
              ['leave', 'Leave Reports'],
              ['productivity', 'Productivity Reports'],
              ['projects', 'Project Reports'],
              ['sites', 'Site Reports'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setCategory(id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                category === id ? 'bg-[#7050F5] text-white' : 'bg-[#F7F7FC] text-[#5A627A] hover:text-[#0B1230]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-[#EEF0F7]">
          <input
            type="date"
            aria-label="Report date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="h-9 px-3 text-xs rounded-lg border border-[#E4E6F0] bg-[#F7F7FC]"
          />
          <select
            aria-label="Department filter"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="h-9 px-3 text-xs rounded-lg border border-[#E4E6F0] bg-[#F7F7FC]"
          >
            <option value="all">Department: All</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <select
            aria-label="Branch filter"
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="h-9 px-3 text-xs rounded-lg border border-[#E4E6F0] bg-[#F7F7FC]"
          >
            <option value="all">Branch: All</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-[#0B1230]">{reportSpec.title}</h2>
        <DataTable data={reportSpec.rows} columns={columns} rowKey={(r) => r.id} pageSize={12} />
      </div>
    </div>
  );
};
