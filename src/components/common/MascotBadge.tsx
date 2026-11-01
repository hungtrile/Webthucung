import React from 'react';
import { ASSETS } from '../../constants/assets';

interface MascotBadgeProps {
  type?: 'duo' | 'dog' | 'cat' | 'greeting' | 'success' | 'loading' | 'error';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  className?: string;
}

export const MascotBadge: React.FC<MascotBadgeProps> = ({
  type = 'duo',
  size = 'md',
  message,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
  };

  // We crop or focus on parts of the mascot sheet or banner
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div
        className={`${sizeClasses[size]} rounded-2xl overflow-hidden border-2 border-[#EDC55B] bg-[#FCF5DC] shadow-sm flex items-center justify-center shrink-0 relative`}
      >
        {type === 'dog' && (
          <img
            src={ASSETS.bgBanner}
            alt="Cún Phết"
            className="w-[240%] h-[240%] max-w-none object-cover object-[15%_40%]"
          />
        )}
        {type === 'cat' && (
          <img
            src={ASSETS.bgBanner}
            alt="Mèo Bông"
            className="w-[240%] h-[240%] max-w-none object-cover object-[85%_45%]"
          />
        )}
        {(type === 'duo' || type === 'greeting' || type === 'success' || type === 'loading' || type === 'error') && (
          <img
            src={ASSETS.bgBanner}
            alt="Cún Phết & Mèo Bông"
            className="w-[180%] h-[180%] max-w-none object-cover object-[50%_45%]"
          />
        )}
      </div>

      {message && (
        <div className="relative bg-white border border-[#E8CCAD] text-[#81451F] px-4 py-2 rounded-2xl shadow-sm text-sm font-medium">
          <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 bg-white border-l border-b border-[#E8CCAD] rotate-45" />
          {message}
        </div>
      )}
    </div>
  );
};
