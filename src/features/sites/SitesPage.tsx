import React, { useMemo, useState } from 'react';
import { AlertCircle, Plus } from 'lucide-react';
import { useApp } from '../../app/AppContext';
import { ColumnDef, DataTable } from '../../components/ui/DataTable';
import { DetailDrawer } from '../../components/ui/DetailDrawer';
import { EmptyState } from '../../components/ui/EmptyState';
import { FormModal } from '../../components/ui/FormModal';
import { KPIStatCard } from '../../components/ui/KPIStatCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { TODAY_ISO } from '../../mock-data/seedData';
import { OperationalSite, PriorityLevel, SiteIncident } from '../../types';
import { formatDateShort } from '../../utils/formatters';
import { SiteCard } from './SiteCard';

type SiteDetailTab = 'overview' | 'workforce' | 'attendance' | 'shifts' | 'contractors' | 'incidents' | 'work';

export const SitesPage: React.FC = () => {
  const {
    scopedSites,
    scopedEmployees,
    scopedAttendance,
    scopedIncidents,
    scopedTasks,
    reportSiteIncident,
    updateIncidentStatus,
  } = useApp();

  const [selectedSite, setSelectedSite] = useState<OperationalSite | null>(null);
  const [detailTab, setDetailTab] = useState<SiteDetailTab>('overview');
  const [incidentModalOpen, setIncidentModalOpen] = useState(false);

  const [incSiteId, setIncSiteId] = useState(scopedSites[0]?.id || '');
  const [incCategory, setIncCategory] = useState<SiteIncident['category']>('Operational Delay');
  const [incPriority, setIncPriority] = useState<PriorityLevel>('High');
  const [incDescription, setIncDescription] = useState('');

  const stats = useMemo(() => {
    const active = scopedSites.length;
    const deployed = scopedEmployees.filter((e) => Boolean(e.siteId)).length;
    const contractors = scopedEmployees.filter((e) => Boolean(e.siteId) && e.isContractor).length;
    const present = scopedEmployees.filter(
      (e) => Boolean(e.siteId) && (e.todayStatus === 'Present' || e.todayStatus === 'Late')
    ).length;
    const understaffed = scopedSites.filter((s) => s.status === 'Understaffed').length;
    return { active, deployed, contractors, present, understaffed };
  }, [scopedSites, scopedEmployees]);

  if (scopedSites.length === 0) {
    return (
      <EmptyState
        title="No Operational Sites Assigned"
        description="Your active manager role does not have field or plant sites assigned. Switch to Site Manager or Shift Supervisor to manage site operations."
      />
    );
  }

  const siteColumns: ColumnDef<OperationalSite>[] = [
    { key: 'code', header: 'Site ID', render: (s) => <span className="font-mono text-xs font-semibold text-[#7050F5]">{s.code}</span> },
    {
      key: 'name',
      header: 'Site Name',
      render: (s) => (
        <div>
          <p className="font-semibold text-[#0B1230]">{s.name}</p>
          <p className="text-[11px] text-[#69718A]">{s.location}</p>
        </div>
      ),
    },
    { key: 'mgr', header: 'Site Manager', render: (s) => <span className="text-xs">{s.siteManagerName}</span> },
    {
      key: 'wf',
      header: 'Workforce',
      align: 'right',
      render: (s) => <span className="font-semibold tabular-nums">{scopedEmployees.filter((e) => e.siteId === s.id).length}</span>,
    },
    {
      key: 'present',
      header: 'Present Today',
      align: 'right',
      render: (s) => (
        <span className="font-semibold text-[#16A36A] tabular-nums">
          {scopedEmployees.filter((e) => e.siteId === s.id && (e.todayStatus === 'Present' || e.todayStatus === 'Late')).length}
        </span>
      ),
    },
    { key: 'status', header: 'Status', render: (s) => <StatusBadge status={s.status} compact /> },
  ];

  const incidentColumns: ColumnDef<SiteIncident>[] = [
    { key: 'id', header: 'Incident ID', render: (i) => <span className="font-mono text-xs font-semibold">{i.id}</span> },
    { key: 'site', header: 'Site', render: (i) => <span className="text-xs font-medium">{i.siteName}</span> },
    { key: 'date', header: 'Date', render: (i) => <span className="text-xs tabular-nums">{formatDateShort(i.date)}</span> },
    { key: 'cat', header: 'Category', render: (i) => <span className="text-xs">{i.category}</span> },
    { key: 'desc', header: 'Description', render: (i) => <p className="text-xs text-[#5A627A] max-w-xs truncate">{i.description}</p> },
    { key: 'prio', header: 'Priority', render: (i) => <StatusBadge status={i.priority} compact /> },
    { key: 'status', header: 'Status', render: (i) => <StatusBadge status={i.status} compact /> },
    {
      key: 'action',
      header: 'Workflow',
      align: 'right',
      render: (i) => (
        <select
          aria-label={`Update status for ${i.id}`}
          value={i.status}
          onChange={(e) => updateIncidentStatus(i.id, e.target.value as SiteIncident['status'])}
          className="h-8 px-2 text-xs rounded border border-[#E4E6F0] bg-white"
        >
          <option value="Open">Open</option>
          <option value="Under Review">Under Review</option>
          <option value="Escalated to Ops">Escalated to Ops</option>
          <option value="Resolved">Resolved</option>
        </select>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#0B1230]">Site Management</h1>
          <p className="text-xs text-[#5A627A] mt-0.5">
            Coordinate plant, logistics, and field-site attendance, contractor headcount, and operational incident logs
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setIncSiteId(scopedSites[0]?.id || '');
            setIncidentModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#7050F5] hover:bg-[#5D3EE0] rounded-lg whitespace-nowrap shrink-0"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Report Site Incident</span>
        </button>
      </div>

      {/* Explicit Scope Disclaimer per Part 12 */}
      <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white border border-[#E4E6F0] text-xs text-[#5A627A]">
        <AlertCircle className="h-3.5 w-3.5 text-[#E9A23B] shrink-0" />
        <span>
          Site observation logs support internal operational escalation only and do not constitute certified occupational safety or regulatory compliance records.
        </span>
      </div>

      {/* 5 Site KPI Cards */}
      <section className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3.5">
        <KPIStatCard title="Active Sites" primaryValue={stats.active} breakdown={[{ label: 'Assigned', value: stats.active }]} />
        <KPIStatCard title="Employees Deployed" primaryValue={stats.deployed} breakdown={[{ label: 'Regular', value: stats.deployed - stats.contractors }]} />
        <KPIStatCard title="Contractors" primaryValue={stats.contractors} breakdown={[{ label: 'On Roster', value: stats.contractors }]} />
        <KPIStatCard title="Present Workers" primaryValue={stats.present} breakdown={[{ label: 'Active Today', value: stats.present, tone: 'success' }]} />
        <KPIStatCard title="Understaffed Sites" primaryValue={stats.understaffed} breakdown={[{ label: 'Alert', value: stats.understaffed, tone: stats.understaffed > 0 ? 'error' : 'default' }]} />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scopedSites.map((site) => {
          const siteEmps = scopedEmployees.filter((e) => e.siteId === site.id);
          const present = siteEmps.filter((e) => e.todayStatus === 'Present' || e.todayStatus === 'Late').length;
          return (
            <SiteCard
              key={site.id}
              site={site}
              workforceCount={siteEmps.length}
              presentToday={present}
              onSelect={(s) => {
                setSelectedSite(s);
                setDetailTab('overview');
              }}
            />
          );
        })}
      </section>

      <DataTable
        data={scopedSites}
        columns={siteColumns}
        rowKey={(s) => s.id}
        onRowClick={(s) => {
          setSelectedSite(s);
          setDetailTab('overview');
        }}
      />

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-[#0B1230]">Operational Incidents & Escalations</h2>
        <DataTable data={scopedIncidents} columns={incidentColumns} rowKey={(i) => i.id} />
      </div>

      {/* Site Details 7-Tab Drawer */}
      <DetailDrawer
        open={Boolean(selectedSite)}
        onClose={() => setSelectedSite(null)}
        title={selectedSite ? `${selectedSite.code} · ${selectedSite.name}` : ''}
        subtitle={selectedSite ? `${selectedSite.location} · Manager: ${selectedSite.siteManagerName}` : ''}
      >
        {selectedSite && (
          <div className="space-y-5 text-xs">
            <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-[#EEF0F7]">
              {(
                [
                  ['overview', 'Overview'],
                  ['workforce', 'Workforce'],
                  ['attendance', 'Attendance'],
                  ['shifts', 'Shifts'],
                  ['contractors', 'Contractors'],
                  ['incidents', 'Incidents'],
                  ['work', 'Work Assignments'],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setDetailTab(id)}
                  className={`px-3 py-1.5 font-semibold rounded-md whitespace-nowrap shrink-0 ${
                    detailTab === id ? 'bg-[#7050F5] text-white' : 'text-[#5A627A] hover:text-[#0B1230]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {detailTab === 'overview' && (
              <div className="p-4 rounded-xl bg-[#F7F7FC] border border-[#E4E6F0] grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[#69718A] block">Site Classification</span>
                  <span className="font-semibold text-[#0B1230]">{selectedSite.siteType}</span>
                </div>
                <div>
                  <span className="text-[#69718A] block">Operational Status</span>
                  <StatusBadge status={selectedSite.status} compact />
                </div>
                <div>
                  <span className="text-[#69718A] block">Site Manager</span>
                  <span className="font-semibold text-[#0B1230]">{selectedSite.siteManagerName}</span>
                </div>
                <div>
                  <span className="text-[#69718A] block">Active Contractors</span>
                  <span className="font-semibold text-[#0B1230] tabular-nums">{selectedSite.activeContractorsCount}</span>
                </div>
              </div>
            )}

            {detailTab === 'workforce' && (
              <div className="divide-y divide-[#EEF0F7]">
                {scopedEmployees
                  .filter((e) => e.siteId === selectedSite.id)
                  .map((e) => (
                    <div key={e.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-[#0B1230]">{e.name}</p>
                        <p className="text-[#69718A]">{e.designation} · {e.employmentType}</p>
                      </div>
                      <StatusBadge status={e.todayStatus} compact />
                    </div>
                  ))}
              </div>
            )}

            {detailTab === 'attendance' && (
              <div className="divide-y divide-[#EEF0F7]">
                {scopedAttendance
                  .filter((a) => a.siteId === selectedSite.id && a.date === TODAY_ISO)
                  .map((a) => (
                    <div key={a.id} className="py-2.5 flex items-center justify-between">
                      <span>{a.employeeName} · In {a.checkIn || '—'}</span>
                      <StatusBadge status={a.status} compact />
                    </div>
                  ))}
              </div>
            )}

            {detailTab === 'shifts' && (
              <div className="divide-y divide-[#EEF0F7]">
                {scopedEmployees
                  .filter((e) => e.siteId === selectedSite.id)
                  .map((e) => (
                    <div key={e.id} className="py-2.5 flex items-center justify-between">
                      <span className="font-medium text-[#0B1230]">{e.name}</span>
                      <span className="text-[#7050F5] font-medium">{e.shiftName}</span>
                    </div>
                  ))}
              </div>
            )}

            {detailTab === 'contractors' && (
              <div className="divide-y divide-[#EEF0F7]">
                {scopedEmployees
                  .filter((e) => e.siteId === selectedSite.id && e.isContractor)
                  .map((e) => (
                    <div key={e.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-[#0B1230]">{e.name}</p>
                        <p className="text-[#69718A]">{e.designation} · {e.shiftName}</p>
                      </div>
                      <StatusBadge status={e.todayStatus} compact />
                    </div>
                  ))}
              </div>
            )}

            {detailTab === 'incidents' && (
              <div className="space-y-2.5">
                {scopedIncidents
                  .filter((i) => i.siteId === selectedSite.id)
                  .map((i) => (
                    <div key={i.id} className="p-3 rounded-lg border border-[#E4E6F0] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-semibold text-[#0B1230]">{i.id} · {i.category}</span>
                        <StatusBadge status={i.status} compact />
                      </div>
                      <p className="text-[#5A627A]">{i.description}</p>
                    </div>
                  ))}
              </div>
            )}

            {detailTab === 'work' && (
              <div className="space-y-2">
                {scopedTasks
                  .filter((t) => t.siteId === selectedSite.id)
                  .map((t) => (
                    <div key={t.id} className="p-3 rounded-lg border border-[#E4E6F0] flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-[#0B1230]">{t.title}</p>
                        <p className="text-[#69718A]">{t.assignedEmployeeName}</p>
                      </div>
                      <StatusBadge status={t.status} compact />
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </DetailDrawer>

      {/* Report Site Incident Modal */}
      <FormModal
        open={incidentModalOpen}
        onClose={() => setIncidentModalOpen(false)}
        title="Report Operational Site Incident"
        subtitle="Log an operational observation or site delay for escalation"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const site = scopedSites.find((s) => s.id === incSiteId);
            if (!site || !incDescription.trim()) return;
            reportSiteIncident({
              siteId: site.id,
              siteName: site.name,
              date: TODAY_ISO,
              category: incCategory,
              description: incDescription.trim(),
              priority: incPriority,
            });
            setIncDescription('');
            setIncidentModalOpen(false);
          }}
          className="space-y-4 text-xs"
        >
          <div>
            <label className="block font-semibold text-[#0B1230] mb-1">Site</label>
            <select
              value={incSiteId}
              onChange={(e) => setIncSiteId(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-[#E4E6F0] bg-white"
            >
              {scopedSites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#0B1230] mb-1">Category</label>
              <select
                value={incCategory}
                onChange={(e) => setIncCategory(e.target.value as SiteIncident['category'])}
                className="w-full h-10 px-3 rounded-lg border border-[#E4E6F0] bg-white"
              >
                <option value="Operational Delay">Operational Delay</option>
                <option value="Equipment">Equipment</option>
                <option value="Access Control">Access Control</option>
                <option value="Facility Observation">Facility Observation</option>
                <option value="Near Miss">Near Miss</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-[#0B1230] mb-1">Priority</label>
              <select
                value={incPriority}
                onChange={(e) => setIncPriority(e.target.value as PriorityLevel)}
                className="w-full h-10 px-3 rounded-lg border border-[#E4E6F0] bg-white"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block font-semibold text-[#0B1230] mb-1">Incident Description</label>
            <textarea
              rows={3}
              required
              value={incDescription}
              onChange={(e) => setIncDescription(e.target.value)}
              placeholder="Describe what happened, affected station/gate, and immediate containment..."
              className="w-full p-3 rounded-lg border border-[#E4E6F0]"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setIncidentModalOpen(false)} className="px-4 py-2 font-semibold text-[#5A627A] bg-[#F7F7FC] rounded-lg">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 font-semibold text-white bg-[#7050F5] hover:bg-[#5D3EE0] rounded-lg">
              Log Incident
            </button>
          </div>
        </form>
      </FormModal>
    </div>
  );
};
