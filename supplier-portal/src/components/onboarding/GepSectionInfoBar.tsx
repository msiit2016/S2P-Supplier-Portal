import React from 'react';

export interface GepSectionInfoBarProps {
  icon: React.ComponentType<{ className?: string }>;
  category: string;
  description: string;
  pillText?: string;
  pillVariant?: 'emerald' | 'amber' | 'slate' | 'indigo';
  className?: string;
}

export const GepSectionInfoBar: React.FC<GepSectionInfoBarProps> = ({
  icon: Icon,
  category,
  description,
  pillText,
  pillVariant = 'emerald',
  className = ''
}) => {
  const pillColorClasses = {
    emerald: 'bg-white text-emerald-800 border-emerald-200',
    amber: 'bg-white text-amber-800 border-amber-200',
    slate: 'bg-white text-slate-800 border-slate-200',
    indigo: 'bg-white text-indigo-800 border-indigo-200'
  }[pillVariant];

  return (
    <div className={`p-2.5 sm:p-3 bg-slate-50/90 border border-slate-200/90 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 shadow-2xs ${className}`}>
      <div className="flex items-start sm:items-center space-x-2.5 min-w-0">
        <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
          <Icon className="w-4 h-4 text-emerald-700" />
        </div>
        <div className="leading-snug text-slate-700 min-w-0">
          <span className="font-bold text-slate-900 mr-1.5">{category}:</span>
          <span className="text-[11.5px] text-slate-600">{description}</span>
        </div>
      </div>

      {pillText && (
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border shadow-2xs shrink-0 self-start sm:self-auto font-mono tracking-wide ${pillColorClasses}`}>
          {pillText}
        </span>
      )}
    </div>
  );
};

