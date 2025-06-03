'use client';
import React, { useMemo } from 'react';
import { shiftLightness } from '@/lib/color';

type Props = {
  color: string;                // base HEX
  children: React.ReactElement; // Lucide-React icon
};

/** Perfect-square coloured tile with depth-aware gradient */
export const ColoredIcon: React.FC<Props> = React.memo(({ color, children }) => {
  const gradient = useMemo(() => {
    const light = shiftLightness(color, +24); // +24 % lighter
    const dark  = shiftLightness(color, -12); // –12 % darker
    return `linear-gradient(145deg, ${light} 0%, ${color} 60%, ${dark} 100%)`;
  }, [color]);

  return (
    <div
      className="flex items-center justify-center rounded-lg shadow-md"
      style={{ width: 32, height: 32, background: gradient }}
    >
      {children}
    </div>
  );
});

ColoredIcon.displayName = 'ColoredIcon';
