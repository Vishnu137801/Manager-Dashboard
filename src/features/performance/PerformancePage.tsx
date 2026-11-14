import React, { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ClipboardList, FileEdit, TrendingUp } from 'lucide-react';
import { useApp } from '../../app/AppContext';
import { ColumnDef, DataTable } from '../../components/ui/DataTable';
import { DetailDrawer } from '../../components/ui/DetailDrawer';
import { KPIStatCard } from '../../components/ui/KPIStatCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { TODAY_ISO } from '../../mock-data/seedData';
import { PerformanceKPI, PerformanceReview } from '../../types';

type PerfTab = 'analytics' | 'kpis' | 'reviews';

export const PerformancePage: React.FC = () => {
  const { scopedKPIs, scopedReviews, scopedTasks, submitPerformanceReview } = useApp();

  const [activeTab, setActiveTab] = useState<PerfTab>('analytics');
  const [jobFamilyFilter, setJobFamilyFilter] = useState<string>('all');
  const [selectedReview, setSelectedReview] = useState<PerformanceReview | null>(null);
  const [feedbackDraft, setFeedbackDraft] = useState('');
  const [ratingDraft, setRatingDraft] = useState<PerformanceReview['rating']>('Meets Expectations');

  const jobFamilies = useMemo(
    () => Array.from(new Set(scopedKPIs.map((k) => k.jobFamily))),
    [scopedKPIs]
  );

  const filteredKPIs = useMemo(
    () =>
      jobFamilyFilter === 'all'
        ? scopedKPIs
        : scopedKPIs.filter((k) => k.jobFamily === jobFamilyFilter),
    [scopedKPIs, jobFamilyFilter]
  );

  const metrics = useMemo(() => {
    const completed = scopedTasks.filter((t) => t.status === 'Completed' || t.status === 'Verified').length;
    const overdue = scopedTasks.filter(
      (t) => t.dueDate < TODAY_ISO && !['Completed', 'Verified', 'Cancelled'].includes(t.status)
    ).length;
    const avgAch =
      scopedKPIs.length > 0
        ? Math.round(scopedKPIs.reduce((acc, k) => acc + (k.actual / k.target) * 100, 0) / scopedKPIs.length)
        : 93;
    const reviewsDue = scopedReviews.filter((r) => r.status === 'Due' || r.status === 'Draft').length;
    const productivity = Math.min(100, Math.round((avgAch + (scopedTasks.length > 0 ? (completed / scopedTasks.length) * 100 : 85)) / 2));
    return { productivity, completed, avgAch, overdue, reviewsDue };
  }, [scopedKPIs, scopedTasks, scopedReviews]);

  const weeklyTrend = [
    { week: 'W42', productivity: 86, completion: 84 },
    { week: 'W43', productivity: 89, completion: 88 },
    { week: 'W44', productivity: 91, completion: 90 },
    { week: 'W45', productivity: 90, completion: 92 },
    { week: 'W46', productivity: metrics.productivity, completion: Math.min(100, metrics.avgAch) },
  ];

  const kpiColumns: ColumnDef<PerformanceKPI>[] = [
    { key: 'emp', header: 'Employee', render: (k) => <span className="font-semibold text-[#0B1230]">{k.employeeName}</span> },
    { key: 'fam', header: 'Job Family', render: (k) => <span className="text-xs text-[#5A627A]">{k.jobFamily}</span> },
    { key: 'kpi', header: 'Configured KPI', render: (k) => <span className="text-xs font-medium text-[#0B1230]">{k.kpiName}</span> },
    { key: 'target', header: 'Target', align: 'right', render: (k) => <span className="font-mono text-xs tabular-nums">{k.target}{k.unit}</span> },
    { key: 'actual', header: 'Actual', align: 'right', render: (k) => <span className="font-mono text-xs font-semibold text-[#7050F5] tabular-nums">{k.actual}{k.unit}</span> },
    {
      key: 'ach',
      header: 'Achievement',
      align: 'right',
      render: (k) => {
        const pct = Math.round((k.actual / k.target) * 100);
        return (
          <span className={`font-mono text-xs font-bold tabular-nums ${pct >= 100 ? 'text-[#16A36A]' : pct >= 90 ? 'text-[#0B1230]' : 'text-[#B97814]'}`}>
            {pct}%
          </span>
        );
      },
    },
    { key: 'period', header: 'Period', render: (k) => <span className="text-xs text-[#69718A]">{k.reviewPeriod}</span> },
  ];

  const reviewColumns: ColumnDef<PerformanceReview>[] = [
    { key: 'id', header: 'Review ID', render: (r) => <span className="font-mono text-xs font-semibold">{r.id}</span> },
    {
      key: 'emp',
      header: 'Employee',
      render: (r) => (
        <div>
          <p className="font-semibold text-[#0B1230]">{r.employeeName}</p>
          <p className="text-[11px] text-[#69718A]">{r.designation}</p>
        </div>
      ),
    },
    { key: 'period', header: 'Review Cycle', render: (r) => <span className="text-xs">{r.reviewPeriod}</span> },
    { key: 'rating', header: 'Rating', render: (r) => <StatusBadge status={r.rating} compact /> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} compact /> },
    {
      key: 'actions',
      header: 'Evaluation',
      align: 'right',
      render: (r) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedReview(r);
            setFeedbackDraft(r.managerFeedback);
            setRatingDraft(r.rating);
          }}
          className="px-3 py-1.5 text-xs font-semibold text-[#7050F5] hover:bg-[#7050F5]/10 rounded-md"
        >
          {r.status === 'Submitted' ? 'View' : 'Evaluate'}
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#0B1230]">Performance & Productivity</h1>
        <p className="text-xs text-[#5A627A] mt-0.5">
          Role-calibrated KPI tracking, manager review evaluations, and weekly productivity trends
        </p>
      </div>

      <section className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3.5">
        <KPIStatCard title="Team Productivity" primaryValue={`${metrics.productivity}%`} breakdown={[{ label: 'Index', value: 'On Track', tone: 'success' }]} />
        <KPIStatCard title="Tasks Completed" primaryValue={metrics.completed} breakdown={[{ label: 'Total', value: scopedTasks.length }]} />
        <KPIStatCard title="Target Achievement" primaryValue={`${metrics.avgAch}%`} breakdown={[{ label: 'KPI Avg', value: `${metrics.avgAch}%`, tone: 'success' }]} />
        <KPIStatCard title="Overdue Tasks" primaryValue={metrics.overdue} breakdown={[{ label: 'Attention', value: metrics.overdue, tone: metrics.overdue > 0 ? 'error' : 'default' }]} />
        <KPIStatCard title="Reviews Due" primaryValue={metrics.reviewsDue} breakdown={[{ label: 'Cycle', value: 'H2 2026' }]} onClick={() => setActiveTab('reviews')} />
      </section>

      <div className="inline-flex items-center gap-1 p-1 bg-white border border-[#E4E6F0] rounded-xl">
        {[
          { id: 'analytics' as const, label: 'Productivity Analytics', icon: TrendingUp },
          { id: 'kpis' as const, label: 'Employee KPIs', icon: ClipboardList },
          { id: 'reviews' as const, label: `Performance Reviews (${metrics.reviewsDue} Due)`, icon: FileEdit },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 transition-colors ${
                activeTab === tab.id ? 'bg-[#7050F5] text-white' : 'text-[#5A627A] hover:text-[#0B1230]'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white border border-[#E4E6F0] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-[#0B1230]">Weekly Team Productivity & Completion</h3>
            <p className="text-xs text-[#5A627A] mb-4">5-week trend within your authorised department scope</p>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F7" vertical={false} />
                  <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#69718A' }} axisLine={{ stroke: '#E4E6F0' }} tickLine={false} />
                  <YAxis domain={[60, 100]} tick={{ fontSize: 11, fill: '#69718A' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '10px', borderColor: '#E4E6F0', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Line type="monotone" dataKey="productivity" name="Productivity %" stroke="#7050F5" strokeWidth={2.5} />
                  <Line type="monotone" dataKey="completion" name="KPI Achievement %" stroke="#16A36A" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white border border-[#E4E6F0] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-[#0B1230]">Employee KPI Comparison (Same Job Family)</h3>
            <p className="text-xs text-[#5A627A] mb-4">Evaluated strictly against peer benchmarks in matching operational roles</p>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredKPIs.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F7" vertical={false} />
                  <XAxis
                    dataKey="employeeName"
                    tickFormatter={(v: string) => v.split(' ')[0]}
                    tick={{ fontSize: 11, fill: '#69718A' }}
                    axisLine={{ stroke: '#E4E6F0' }}
                    tickLine={false}
                  />
                  <YAxis domain={[0, 110]} tick={{ fontSize: 11, fill: '#69718A' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '10px', borderColor: '#E4E6F0', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="target" name="Target %" fill="#DCE0EC" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="actual" name="Actual %" fill="#478BFA" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'kpis' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 bg-white border border-[#E4E6F0] rounded-xl p-3.5">
            <span className="text-xs font-semibold text-[#5A627A]">Filter by Job Family (prevents cross-industry mismatch):</span>
            <select
              value={jobFamilyFilter}
              onChange={(e) => setJobFamilyFilter(e.target.value)}
              className="h-9 px-3 text-xs font-medium bg-[#F7F7FC] border border-[#E4E6F0] rounded-lg"
            >
              <option value="all">All Authorised Families</option>
              {jobFamilies.map((jf) => (
                <option key={jf} value={jf}>
                  {jf}
                </option>
              ))}
            </select>
          </div>
          <DataTable data={filteredKPIs} columns={kpiColumns} rowKey={(k) => k.id} />
        </div>
      )}

      {activeTab === 'reviews' && (
        <DataTable
          data={scopedReviews}
          columns={reviewColumns}
          rowKey={(r) => r.id}
          onRowClick={(r) => {
            setSelectedReview(r);
            setFeedbackDraft(r.managerFeedback);
            setRatingDraft(r.rating);
          }}
        />
      )}

      <DetailDrawer
        open={Boolean(selectedReview)}
        onClose={() => setSelectedReview(null)}
        title={selectedReview ? `Performance Review · ${selectedReview.employeeName}` : ''}
        subtitle={selectedReview ? `${selectedReview.designation} · ${selectedReview.reviewPeriod}` : ''}
      >
        {selectedReview && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-[#F7F7FC] border border-[#E4E6F0] space-y-2">
              <span className="font-semibold text-[#5A627A] block">Cycle Goals</span>
              <p className="text-[#0B1230] leading-relaxed">{selectedReview.goalsSummary}</p>
            </div>

            <div>
              <label className="block font-semibold text-[#0B1230] mb-1">Evaluation Rating</label>
              <select
                value={ratingDraft}
                onChange={(e) => setRatingDraft(e.target.value as PerformanceReview['rating'])}
                className="w-full h-10 px-3 rounded-lg border border-[#E4E6F0] bg-white"
              >
                <option value="Exceeds Expectations">Exceeds Expectations</option>
                <option value="Meets Expectations">Meets Expectations</option>
                <option value="Needs Focus">Needs Focus</option>
                <option value="Pending Review">Pending Review</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#0B1230] mb-1">Manager Feedback & Coaching Notes</label>
              <textarea
                rows={4}
                value={feedbackDraft}
                onChange={(e) => setFeedbackDraft(e.target.value)}
                placeholder="Provide constructive evaluation feedback based on verified team deliverables..."
                className="w-full p-3 rounded-lg border border-[#E4E6F0]"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  submitPerformanceReview(selectedReview.id, feedbackDraft, ratingDraft, false);
                  setSelectedReview(null);
                }}
                className="px-4 py-2 font-semibold text-[#0B1230] bg-[#F7F7FC] border border-[#E4E6F0] rounded-lg"
              >
                Save Draft
              </button>
              <button
                type="button"
                onClick={() => {
                  submitPerformanceReview(selectedReview.id, feedbackDraft, ratingDraft, true);
                  setSelectedReview(null);
                }}
                className="px-4 py-2 font-semibold text-white bg-[#7050F5] hover:bg-[#5D3EE0] rounded-lg"
              >
                Submit Evaluation
              </button>
            </div>
          </div>
        )}
      </DetailDrawer>
    </div>
  );
};
