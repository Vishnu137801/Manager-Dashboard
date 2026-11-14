import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { classNames } from '../../utils/formatters';

interface KPIStatCardProps {
  title: string;
  primaryValue: string | number;
  primaryUnit?: string;
  breakdown: Array<{ label: string; value: string | number; tone?: 'default' | 'success' | 'warning' | 'error' }>;
  onClick?: () => void;
  icon?: React.ReactNode;
}

export const KPIStatCard: React.FC<KPIStatCardProps> = ({
  title,
  primaryValue,
  primaryUnit,
  breakdown,
  onClick,
  icon,
}) => {
  const Wrapper = onClick ? 'button' : 'div';
  return (
    <Wrapper
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={classNames(
        'w-full text-left bg-white border border-[#E4E6F0] rounded-xl p-5 transition-all duration-150',
        onClick && 'hover:border-[#7050F5]/50 hover:shadow-sm cursor-pointer focus-visible:outline-2 focus-visible:outline-[#7050F5] group'
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className="text-xs font-semibold text-[#5A627A] tracking-tight">{title}</span>
        <div className="flex items-center gap-1.5 text-[#5A627A]">
          {icon}
          {onClick && (
            <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 text-[#7050F5] transition-opacity" />
          )}
        </div>
      </div>

      <div className="flex items-baseline gap-1.5 mb-3.5">
        <span className="text-2xl font-bold tracking-tight text-[#0B1230] tabular-nums">
          {primaryValue}
        </span>
        {primaryUnit && <span className="text-xs font-medium text-[#5A627A]">{primaryUnit}</span>}
      </div>

      <div className="pt-3 border-t border-[#EEF0F7] flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        {breakdown.map((item, idx) => (
          <div key={item.label} className="flex items-center gap-1.5">
            {idx > 0 && <span className="text-[#C8CDD9]" aria-hidden="true">·</span>}
            <span className="text-[#69718A]">{item.label}:</span>
            <span
              className={classNames(
                'font-semibold tabular-nums',
                item.tone === 'success' && 'text-[#16A36A]',
                item.tone === 'warning' && 'text-[#B97814]',
                item.tone === 'error' && 'text-[#E05252]',
                (!item.tone || item.tone === 'default') && 'text-[#0B1230]'
              )}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </Wrapper>
  );
};
