import React from 'react';
import dumperTruckBgUrl from '../assets/dumper-truck-bg.svg';
import { Eye, EyeOff } from 'lucide-react';

interface DumperBackgroundProps {
  unblurPreview?: boolean;
  onTogglePreview?: () => void;
}

export const DumperBackground: React.FC<DumperBackgroundProps> = ({
  unblurPreview = false,
  onTogglePreview,
}) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Heavy Blurred Dumper Truck Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <img
          src={dumperTruckBgUrl}
          alt="Heavy Industrial Dumper Truck in Mining Quarry"
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover object-center transition-all duration-700 ease-out ${
            unblurPreview
              ? 'filter blur-0 scale-100 opacity-90'
              : 'filter blur-[28px] md:blur-[42px] scale-105 opacity-35'
          }`}
        />
      </div>

      {/* Industrial Dark Mesh & Contrast Scrim Gradients */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${
          unblurPreview
            ? 'bg-gradient-to-t from-[#0B0E14]/80 via-transparent to-[#0B0E14]/70'
            : 'bg-gradient-to-b from-[#0B0E14]/90 via-[#0E1422]/80 to-[#0B0E14]/95'
        }`}
      />

      {/* Subtle Mining Strata Grid Texture */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#f59e0b 1px, transparent 1px), linear-gradient(90deg, #f59e0b 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Industrial Vignette Border Glow */}
      <div className="absolute inset-0 ring-1 ring-inset ring-amber-500/10 pointer-events-none" />

      {/* Optional Interactive Floating Toggle to inspect background */}
      {onTogglePreview && (
        <div className="pointer-events-auto fixed bottom-3 right-3 z-50">
          <button
            type="button"
            onClick={onTogglePreview}
            title={unblurPreview ? 'Restore heavy blur for readability' : 'Temporarily inspect unblurred dumper truck'}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-[#131926]/90 border border-amber-500/30 text-amber-300 hover:text-amber-200 hover:bg-[#1A2234] shadow-lg backdrop-blur-md transition-colors"
          >
            {unblurPreview ? <EyeOff className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5 text-amber-400" />}
            <span className="hidden sm:inline">
              {unblurPreview ? 'Blur Dumper Truck' : 'View Dumper Truck'}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
