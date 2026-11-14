import React, { useState } from 'react';

interface AvatarBadgeProps {
  name: string;
  initials?: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_MAP = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-9 w-9 text-xs',
  lg: 'h-12 w-12 text-sm',
};

export const AvatarBadge: React.FC<AvatarBadgeProps> = ({
  name,
  initials,
  src,
  size = 'md',
}) => {
  const [imgError, setImgError] = useState(false);
  const computedInitials =
    initials ||
    name
      .split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={name}
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
        className={`${SIZE_MAP[size]} rounded-lg object-cover border border-[#E4E6F0] shrink-0 bg-[#EEF0F7]`}
      />
    );
  }

  return (
    <div
      className={`${SIZE_MAP[size]} rounded-lg bg-[#7050F5]/10 text-[#7050F5] font-semibold flex items-center justify-center shrink-0 border border-[#7050F5]/15`}
      aria-label={name}
    >
      {computedInitials}
    </div>
  );
};
