import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppProvider } from './app/AppContext';
import { ApprovalsPage } from './features/approvals/ApprovalsPage';
import { AttendancePage } from './features/attendance/AttendancePage';
import { BranchesPage } from './features/branches/BranchesPage';
import { CallCentrePage } from './features/call-centre/CallCentrePage';
import { CommunicationPage } from './features/communication/CommunicationPage';
import { DashboardPage } from './features/dashboards/DashboardPage';
import { PerformancePage } from './features/performance/PerformancePage';
import { ProfileSecurityPage } from './features/profile/ProfileSecurityPage';
import { ProjectsPage } from './features/projects/ProjectsPage';
import { ReportsPage } from './features/reports/ReportsPage';
import { ShiftsPage } from './features/shifts/ShiftsPage';
import { SitesPage } from './features/sites/SitesPage';
import { TasksPage } from './features/tasks/TasksPage';
import { TeamPage } from './features/team/TeamPage';
import { WorkAllocationPage } from './features/work-allocation/WorkAllocationPage';
import { ManagerLayout } from './layouts/ManagerLayout';

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <ManagerLayout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/shifts" element={<ShiftsPage />} />
            <Route path="/approvals" element={<ApprovalsPage />} />
            <Route path="/work-allocation" element={<WorkAllocationPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/sites" element={<SitesPage />} />
            <Route path="/operations/call-centre" element={<CallCentrePage />} />
            <Route path="/operations/branches" element={<BranchesPage />} />
            <Route path="/performance" element={<PerformancePage />} />
            <Route path="/communication" element={<CommunicationPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/profile" element={<ProfileSecurityPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ManagerLayout>
      </AppProvider>
    </BrowserRouter>
  );
}
