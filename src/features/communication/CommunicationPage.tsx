import React, { useMemo, useState } from 'react';
import { Archive, Megaphone, MessageSquare, Paperclip, Plus, Send } from 'lucide-react';
import { useApp } from '../../app/AppContext';
import { FormModal } from '../../components/ui/FormModal';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { TODAY_ISO } from '../../mock-data/seedData';
import { PriorityLevel, TeamAnnouncement } from '../../types';
import { formatDateShort } from '../../utils/formatters';

export const CommunicationPage: React.FC = () => {
  const {
    currentManager,
    teams,
    scopedAnnouncements,
    messages,
    createAnnouncement,
    archiveAnnouncement,
    sendTeamMessage,
  } = useApp();

  const authorisedTeams = useMemo(
    () => teams.filter((t) => currentManager.assignedTeams.includes(t.id)),
    [teams, currentManager]
  );

  const [composeOpen, setComposeOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<TeamAnnouncement['category']>('Team Announcement');
  const [targetTeamId, setTargetTeamId] = useState(authorisedTeams[0]?.id || teams[0].id);
  const [priority, setPriority] = useState<PriorityLevel>('Medium');
  const [publishDate, setPublishDate] = useState(TODAY_ISO);
  const [expiryDate, setExpiryDate] = useState('2026-11-30');
  const [attachmentName, setAttachmentName] = useState('');

  const [activeChatTeamId, setActiveChatTeamId] = useState(authorisedTeams[0]?.id || teams[0].id);
  const [chatText, setChatText] = useState('');
  const [isEscalation, setIsEscalation] = useState(false);

  const teamMessages = useMemo(
    () => messages.filter((m) => m.teamId === activeChatTeamId),
    [messages, activeChatTeamId]
  );

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    const target = authorisedTeams.find((t) => t.id === targetTeamId);
    if (!target || !title.trim() || !message.trim()) return;
    createAnnouncement({
      title: title.trim(),
      message: message.trim(),
      category,
      targetTeamId: target.id,
      targetTeamName: target.name,
      priority,
      publishDate,
      expiryDate,
      status: 'Published',
      attachmentName: attachmentName || undefined,
    });
    setTitle('');
    setMessage('');
    setAttachmentName('');
    setPreviewMode(false);
    setComposeOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#0B1230]">Team Communication</h1>
          <p className="text-xs text-[#5A627A] mt-0.5">
            Broadcast announcements, work instructions, shift notices, and escalations strictly to authorised teams
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setTargetTeamId(authorisedTeams[0]?.id || teams[0].id);
            setComposeOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#7050F5] hover:bg-[#5D3EE0] rounded-lg whitespace-nowrap shrink-0"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Create Announcement</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Announcements Feed */}
        <section className="lg:col-span-3 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#0B1230] inline-flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-[#7050F5]" />
              <span>Team Announcements & Notices</span>
            </h2>
          </div>

          {scopedAnnouncements.length === 0 ? (
            <div className="bg-white border border-[#E4E6F0] rounded-xl p-8 text-center text-xs text-[#5A627A]">
              No announcements published for your assigned teams yet.
            </div>
          ) : (
            <div className="space-y-3">
              {scopedAnnouncements.map((ann) => (
                <article key={ann.id} className="bg-white border border-[#E4E6F0] rounded-xl p-5 space-y-2.5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 text-[11px] text-[#5A627A]">
                        <span className="font-semibold text-[#7050F5]">{ann.category}</span>
                        <span aria-hidden="true">·</span>
                        <span>{ann.targetTeamName}</span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">Published {formatDateShort(ann.publishDate)}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-[#0B1230] mt-1">{ann.title}</h3>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <StatusBadge status={ann.priority} compact />
                      <StatusBadge status={ann.status} compact />
                    </div>
                  </div>

                  <p className="text-xs text-[#5A627A] leading-relaxed">{ann.message}</p>

                  <div className="pt-2.5 border-t border-[#EEF0F7] flex items-center justify-between text-[11px] text-[#69718A]">
                    <div className="flex items-center gap-3">
                      <span>By {ann.authorName}</span>
                      {ann.attachmentName && (
                        <span className="inline-flex items-center gap-1 text-[#478BFA]">
                          <Paperclip className="h-3 w-3" /> {ann.attachmentName}
                        </span>
                      )}
                    </div>
                    {ann.status !== 'Archived' && (
                      <button
                        type="button"
                        onClick={() => archiveAnnouncement(ann.id)}
                        className="inline-flex items-center gap-1 text-[#5A627A] hover:text-[#0B1230] font-medium"
                      >
                        <Archive className="h-3 w-3" />
                        <span>Archive</span>
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Team Messages & Escalations */}
        <section className="lg:col-span-2 bg-white border border-[#E4E6F0] rounded-xl flex flex-col h-[520px]">
          <div className="p-4 border-b border-[#EEF0F7] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-[#7050F5]" />
              <h2 className="text-sm font-semibold text-[#0B1230]">Team Channel</h2>
            </div>
            <select
              aria-label="Select team channel"
              value={activeChatTeamId}
              onChange={(e) => setActiveChatTeamId(e.target.value)}
              className="h-8 px-2.5 text-xs font-medium bg-[#F7F7FC] border border-[#E4E6F0] rounded-lg"
            >
              {authorisedTeams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-3">
            {teamMessages.length === 0 ? (
              <p className="text-xs text-[#69718A] text-center py-10">No messages in this team channel yet.</p>
            ) : (
              teamMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-xl border text-xs space-y-1 ${
                    msg.isEscalation
                      ? 'bg-[#E05252]/[0.04] border-[#E05252]/30'
                      : 'bg-[#F7F7FC] border-[#E4E6F0]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-[#0B1230]">
                      {msg.senderName} · <span className="font-normal text-[#5A627A]">{msg.senderRole}</span>
                    </span>
                    <span className="text-[10px] text-[#69718A] tabular-nums">{msg.timestamp}</span>
                  </div>
                  <p className="text-[#0B1230] leading-relaxed">{msg.content}</p>
                  {msg.isEscalation && <StatusBadge status="Escalated to Ops" compact />}
                </div>
              ))
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendTeamMessage(activeChatTeamId, chatText, isEscalation);
              setChatText('');
              setIsEscalation(false);
            }}
            className="p-3 border-t border-[#EEF0F7] space-y-2"
          >
            <label className="inline-flex items-center gap-1.5 text-[11px] text-[#5A627A] cursor-pointer">
              <input
                type="checkbox"
                checked={isEscalation}
                onChange={(e) => setIsEscalation(e.target.checked)}
                className="rounded border-[#E4E6F0]"
              />
              <span>Flag as Support Escalation</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
                placeholder="Write a team update or instruction..."
                className="flex-1 h-9 px-3 text-xs rounded-lg border border-[#E4E6F0]"
              />
              <button
                type="submit"
                className="h-9 px-3 rounded-lg bg-[#7050F5] hover:bg-[#5D3EE0] text-white text-xs font-semibold inline-flex items-center gap-1"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Send</span>
              </button>
            </div>
          </form>
        </section>
      </div>

      {/* Create Announcement Modal */}
      <FormModal
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        title="Create Team Communication"
        subtitle="Publish updates strictly to your authorised team members"
      >
        <form onSubmit={handlePublish} className="space-y-4 text-xs">
          {previewMode ? (
            <div className="p-4 rounded-xl bg-[#F7F7FC] border border-[#E4E6F0] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#7050F5]">{category}</span>
                <StatusBadge status={priority} compact />
              </div>
              <h4 className="text-sm font-bold text-[#0B1230]">{title || 'Untitled Communication'}</h4>
              <p className="text-[#5A627A] leading-relaxed">{message || 'No message body entered.'}</p>
            </div>
          ) : (
            <>
              <div>
                <label className="block font-semibold text-[#0B1230] mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Weekend shift checklist update"
                  className="w-full h-10 px-3 rounded-lg border border-[#E4E6F0]"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#0B1230] mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TeamAnnouncement['category'])}
                    className="w-full h-10 px-3 rounded-lg border border-[#E4E6F0] bg-white"
                  >
                    <option value="Team Announcement">Team Announcement</option>
                    <option value="Work Instruction">Work Instruction</option>
                    <option value="Shift Notice">Shift Notice</option>
                    <option value="Project Update">Project Update</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#0B1230] mb-1">Target Team</label>
                  <select
                    value={targetTeamId}
                    onChange={(e) => setTargetTeamId(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-[#E4E6F0] bg-white"
                  >
                    {authorisedTeams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#0B1230] mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as PriorityLevel)}
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
                <label className="block font-semibold text-[#0B1230] mb-1">Message</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write clear operational instructions or notice..."
                  className="w-full p-3 rounded-lg border border-[#E4E6F0]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#0B1230] mb-1">Publish Date</label>
                  <input type="date" value={publishDate} onChange={(e) => setPublishDate(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-[#E4E6F0]" />
                </div>
                <div>
                  <label className="block font-semibold text-[#0B1230] mb-1">Expiry Date</label>
                  <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-[#E4E6F0]" />
                </div>
              </div>
              <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#E4E6F0] bg-[#F7F7FC] cursor-pointer text-[#5A627A]">
                <Paperclip className="h-3.5 w-3.5" />
                <span>{attachmentName || 'Attach reference document (optional)'}</span>
                <input type="file" className="hidden" onChange={(e) => setAttachmentName(e.target.files?.[0]?.name || '')} />
              </label>
            </>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setPreviewMode((v) => !v)}
              className="px-3.5 py-2 font-semibold text-[#7050F5] bg-[#7050F5]/10 rounded-lg"
            >
              {previewMode ? 'Back to Editor' : 'Preview'}
            </button>
            <div className="flex gap-2">
              <button type="button" onClick={() => setComposeOpen(false)} className="px-4 py-2 font-semibold text-[#5A627A] bg-[#F7F7FC] rounded-lg">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 font-semibold text-white bg-[#7050F5] hover:bg-[#5D3EE0] rounded-lg">
                Publish
              </button>
            </div>
          </div>
        </form>
      </FormModal>
    </div>
  );
};
