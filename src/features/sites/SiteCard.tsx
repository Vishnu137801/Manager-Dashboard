import React from 'react';
import { HardHat, MapPin, Users } from 'lucide-react';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { OperationalSite } from '../../types';

interface SiteCardProps {
  site: OperationalSite;
  workforceCount: number;
  presentToday: number;
  onSelect: (site: OperationalSite) => void;
}

export const SiteCard: React.FC<SiteCardProps> = ({
  site,
  workforceCount,
  presentToday,
  onSelect,
}) => {
  return (
    <div
      onClick={() => onSelect(site)}
      className="bg-white border border-[#E4E6F0] hover:border-[#7050F5]/50 rounded-xl p-5 cursor-pointer transition-all space-y-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="font-mono text-[11px] font-semibold text-[#7050F5]">{site.code}</span>
          <h3 className="text-sm font-semibold text-[#0B1230] truncate mt-0.5">{site.name}</h3>
          <p className="text-xs text-[#5A627A] inline-flex items-center gap-1 mt-0.5">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{site.location}</span>
          </p>
        </div>
        <StatusBadge status={site.status} compact />
      </div>

      <div className="pt-2.5 border-t border-[#EEF0F7] flex flex-wrap items-center justify-between gap-2 text-xs text-[#5A627A]">
        <span className="inline-flex items-center gap-1 tabular-nums">
          <Users className="h-3.5 w-3.5" /> {presentToday}/{workforceCount} present
        </span>
        <span className="inline-flex items-center gap-1 tabular-nums">
          <HardHat className="h-3.5 w-3.5" /> {site.activeContractorsCount} contractors
        </span>
      </div>
    </div>
  );
};
