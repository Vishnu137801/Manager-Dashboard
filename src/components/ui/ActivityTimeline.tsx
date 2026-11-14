import React from 'react';
import { Clock } from 'lucide-react';

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  actor?: string;
  category?: string;
}

interface ActivityTimelineProps {
  events: TimelineEvent[];
  emptyMessage?: string;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  events,
  emptyMessage = 'No recorded activity yet.',
}) => {
  if (events.length === 0) {
    return <p className="text-xs text-[#69718A] py-4">{emptyMessage}</p>;
  }

  return (
    <ol className="divide-y divide-[#EEF0F7]">
      {events.map((ev) => (
        <li key={ev.id} className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-medium text-[#0B1230]">{ev.title}</p>
            <p className="mt-0.5 text-xs text-[#5A627A] leading-relaxed">{ev.description}</p>
            {(ev.actor || ev.category) && (
              <div className="mt-1 flex items-center gap-2 text-[11px] text-[#69718A]">
                {ev.actor && <span>{ev.actor}</span>}
                {ev.actor && ev.category && <span aria-hidden="true">·</span>}
                {ev.category && <span>{ev.category}</span>}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[#69718A] whitespace-nowrap shrink-0 tabular-nums">
            <Clock className="h-3 w-3" />
            <span>{ev.timestamp}</span>
          </div>
        </li>
      ))}
    </ol>
  );
};
