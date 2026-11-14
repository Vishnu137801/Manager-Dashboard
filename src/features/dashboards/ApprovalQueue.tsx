import React, { useMemo, useState } from 'react';
import { Check, Eye, MessageSquare, X } from 'lucide-react';
import { useApp } from '../../app/AppContext';
import { DetailDrawer } from '../../components/ui/DetailDrawer';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { usePermissions } from '../../hooks/usePermissions';
import { ApprovalStatus, PriorityLevel } from '../../types';
import { formatDateShort } from '../../utils/formatters';

interface UnifiedRequest {
  id: string;
  employeeName: string;
  departmentName: string;
  requestType: 'Leave Request' | 'Attendance Correction' | 'Overtime Request' | 'Shift Swap';
  submittedAt: string;
  priority: PriorityLevel;
  status: ApprovalStatus;
  summary: string;
}

export const ApprovalQueue: React.FC<{ limit?: number }> = ({ limit = 6 }) => {
  const {
    scopedLeaves,
    scopedOvertime,
    scopedRegularisations,
    scopedShiftSwaps,
    decideLeaveRequest,
    decideOvertimeRequest,
    decideRegularisation,
    decideShiftSwap,
    openConfirmDialog,
  } = useApp();
  const { canApprove } = usePermissions();

  const [selectedReq, setSelectedReq] = useState<UnifiedRequest | null>(null);
  const [commentText, setCommentText] = useState('');

  const items = useMemo<UnifiedRequest[]>(() => {
    const list: UnifiedRequest[] = [
      ...scopedLeaves
        .filter((l) => l.status === 'Pending')
        .map((l) => ({
          id: l.id,
          employeeName: l.employeeName,
          departmentName: l.departmentName,
          requestType: 'Leave Request' as const,
          submittedAt: l.submittedAt.slice(0, 10),
          priority: l.priority,
          status: l.status,
          summary: `${l.leaveType} · ${formatDateShort(l.startDate)} to ${formatDateShort(l.endDate)} (${l.requestedDays}d)`,
        })),
      ...scopedRegularisations
        .filter((r) => r.status === 'Pending')
        .map((r) => ({
          id: r.id,
          employeeName: r.employeeName,
          departmentName: r.departmentName,
          requestType: 'Attendance Correction' as const,
          submittedAt: r.submittedAt.slice(0, 10),
          priority: 'High' as PriorityLevel,
          status: r.status,
          summary: `${formatDateShort(r.date)} · ${r.originalPunch} -> ${r.requestedPunch} (${r.reason})`,
        })),
      ...scopedOvertime
        .filter((o) => o.status === 'Pending')
        .map((o) => ({
          id: o.id,
          employeeName: o.employeeName,
          departmentName: o.departmentName,
          requestType: 'Overtime Request' as const,
          submittedAt: o.submittedAt.slice(0, 10),
          priority: o.priority,
          status: o.status,
          summary: `${formatDateShort(o.date)} · +${o.overtimeHours} hrs (${o.reason})`,
        })),
      ...scopedShiftSwaps
        .filter((s) => s.status === 'Pending')
        .map((s) => ({
          id: s.id,
          employeeName: s.employeeName,
          departmentName: 'Shift Roster',
          requestType: 'Shift Swap' as const,
          submittedAt: s.submittedAt.slice(0, 10),
          priority: 'Medium' as PriorityLevel,
          status: s.status,
          summary: `${formatDateShort(s.date)} · ${s.currentShift} <-> ${s.requestedShift} with ${s.swapWithName}`,
        })),
    ];
    return list.slice(0, limit);
  }, [scopedLeaves, scopedRegularisations, scopedOvertime, scopedShiftSwaps, limit]);

  const handleDecision = (req: UnifiedRequest, decision: ApprovalStatus, note?: string) => {
    const apply = () => {
      if (req.requestType === 'Leave Request') decideLeaveRequest(req.id, decision, note);
      else if (req.requestType === 'Attendance Correction') decideRegularisation(req.id, decision, note);
      else if (req.requestType === 'Overtime Request') decideOvertimeRequest(req.id, decision, note);
      else if (req.requestType === 'Shift Swap') decideShiftSwap(req.id, decision);
      setSelectedReq(null);
      setCommentText('');
    };

    if (decision === 'Rejected') {
      openConfirmDialog({
        title: `Reject ${req.requestType}?`,
        message: `This will reject request ${req.id} from ${req.employeeName} and record the decision in the audit log.`,
        confirmLabel: 'Reject Request',
        variant: 'danger',
        onConfirm: apply,
      });
    } else {
      apply();
    }
  };

  return (
    <>
      <div className="bg-white border border-[#E4E6F0] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#EEF0F7] flex items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-[#0B1230]">Pending Approvals</h3>
            <p className="text-xs text-[#5A627A]">Authorised team leave, attendance corrections, overtime, and shift swaps</p>
          </div>
          <span className="text-xs font-semibold text-[#7050F5] tabular-nums">{items.length} awaiting review</span>
        </div>

        {items.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#5A627A]">
            All pending requests in your scope have been reviewed.
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F7F7FC] border-b border-[#E4E6F0] text-[11px] font-semibold text-[#5A627A]">
                  <th className="px-4 py-2.5 whitespace-nowrap">Request ID</th>
                  <th className="px-4 py-2.5 whitespace-nowrap">Employee</th>
                  <th className="px-4 py-2.5 whitespace-nowrap">Request Type</th>
                  <th className="px-4 py-2.5 whitespace-nowrap">Submitted</th>
                  <th className="px-4 py-2.5 whitespace-nowrap">Priority</th>
                  <th className="px-4 py-2.5 whitespace-nowrap">Status</th>
                  <th className="px-4 py-2.5 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF0F7] text-[13px]">
                {items.map((req) => (
                  <tr key={req.id} className="hover:bg-[#F7F7FC]/60 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-[#0B1230] whitespace-nowrap">
                      {req.id}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#0B1230] whitespace-nowrap">{req.employeeName}</p>
                      <p className="text-[11px] text-[#69718A] truncate max-w-[180px]">{req.departmentName}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#0B1230] whitespace-nowrap">{req.requestType}</td>
                    <td className="px-4 py-3 text-xs text-[#5A627A] tabular-nums whitespace-nowrap">
                      {formatDateShort(req.submittedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={req.priority} compact />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={req.status} compact />
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setSelectedReq(req)}
                          className="p-1.5 rounded-md text-[#5A627A] hover:text-[#0B1230] hover:bg-[#EEF0F7]"
                          title="View Details"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        {canApprove && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleDecision(req, 'Approved')}
                              className="p-1.5 rounded-md text-[#16A36A] hover:bg-[#16A36A]/10"
                              title="Approve"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDecision(req, 'Rejected')}
                              className="p-1.5 rounded-md text-[#E05252] hover:bg-[#E05252]/10"
                              title="Reject"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedReq(req)}
                              className="p-1.5 rounded-md text-[#B97814] hover:bg-[#E9A23B]/15"
                              title="Request Changes"
                            >
                              <MessageSquare className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <DetailDrawer
        open={Boolean(selectedReq)}
        onClose={() => setSelectedReq(null)}
        title={selectedReq ? `${selectedReq.requestType} · ${selectedReq.id}` : ''}
        subtitle={selectedReq ? `${selectedReq.employeeName} · ${selectedReq.departmentName}` : ''}
      >
        {selectedReq && (
          <div className="space-y-5 text-sm">
            <div className="bg-[#F7F7FC] border border-[#E4E6F0] rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#5A627A]">Status & Priority</span>
                <div className="flex items-center gap-2">
                  <StatusBadge status={selectedReq.priority} compact />
                  <StatusBadge status={selectedReq.status} compact />
                </div>
              </div>
              <p className="text-xs text-[#0B1230] leading-relaxed">{selectedReq.summary}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0B1230] mb-1.5">
                Reviewer Notes / Clarification Request
              </label>
              <textarea
                rows={3}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add approval notes or specify requested changes..."
                className="w-full rounded-lg border border-[#E4E6F0] p-3 text-xs text-[#0B1230] focus:outline-none focus:border-[#7050F5]"
              />
            </div>

            {canApprove && (
              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => handleDecision(selectedReq, 'Approved', commentText)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#16A36A] hover:bg-[#138A58] rounded-lg"
                >
                  Approve Request
                </button>
                <button
                  type="button"
                  onClick={() => handleDecision(selectedReq, 'Changes Requested', commentText || 'Please provide additional details')}
                  className="px-4 py-2 text-xs font-semibold text-[#B97814] bg-[#E9A23B]/15 hover:bg-[#E9A23B]/25 rounded-lg"
                >
                  Request Changes
                </button>
                <button
                  type="button"
                  onClick={() => handleDecision(selectedReq, 'Rejected', commentText)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#E05252] hover:bg-[#C94141] rounded-lg"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        )}
      </DetailDrawer>
    </>
  );
};
