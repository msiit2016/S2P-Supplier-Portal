import React, { useState } from 'react';
import { 
  X, 
  Zap, 
  Check, 
  CheckCircle2, 
  ShieldCheck, 
  Building2, 
  FileText, 
  Users, 
  MapPin, 
  CreditCard, 
  Scale, 
  Award,
  RefreshCw,
  Lock,
  Sparkles
} from 'lucide-react';

export type SyncStrategy = 'UNIVERSAL_REFRESH' | 'SMART_MERGE' | 'CUSTOM';

export interface SyncSectionConfig {
  num: number;
  id: string;
  title: string;
  icon: any;
  isUniversal: boolean;
  fieldsCount: number;
  defaultChecked: boolean;
}

export interface MasterProfileSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  buyerName: string;
  invitationCode: string;
  isLocked: boolean;
  onApplySync: (options: {
    strategy: SyncStrategy;
    selectedSections: number[];
    unlockRevision: boolean;
  }) => void;
}

const SECTIONS_CONFIG: SyncSectionConfig[] = [
  { num: 1, id: 'basic-details', title: 'Basic Details & Identity', icon: Building2, isUniversal: true, fieldsCount: 6, defaultChecked: true },
  { num: 2, id: 'business-info', title: 'Business Info & Operations', icon: FileText, isUniversal: true, fieldsCount: 8, defaultChecked: true },
  { num: 3, id: 'tax-ids', title: 'Tax & Identifications', icon: ShieldCheck, isUniversal: true, fieldsCount: 4, defaultChecked: true },
  { num: 4, id: 'contacts', title: 'Contact Directory & Roles', icon: Users, isUniversal: true, fieldsCount: 4, defaultChecked: true },
  { num: 5, id: 'locations', title: 'Facility Locations', icon: MapPin, isUniversal: true, fieldsCount: 2, defaultChecked: true },
  { num: 6, id: 'banking', title: 'Banking & Remittance', icon: CreditCard, isUniversal: true, fieldsCount: 1, defaultChecked: true },
  { num: 7, id: 'commercial', title: 'Commercial Payment Terms', icon: Scale, isUniversal: false, fieldsCount: 3, defaultChecked: false },
  { num: 8, id: 'diversity-certs', title: 'Diversity & Certificates', icon: Award, isUniversal: true, fieldsCount: 4, defaultChecked: true }
];

export const MasterProfileSyncModal: React.FC<MasterProfileSyncModalProps> = ({
  isOpen,
  onClose,
  buyerName,
  invitationCode,
  isLocked,
  onApplySync
}) => {
  const [strategy, setStrategy] = useState<SyncStrategy>('UNIVERSAL_REFRESH');
  const [selectedSections, setSelectedSections] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
    6: true,
    7: false, // Buyer-scoped protected
    8: true
  });

  if (!isOpen) return null;

  const handleToggleSection = (num: number) => {
    setStrategy('CUSTOM');
    setSelectedSections(prev => ({
      ...prev,
      [num]: !prev[num]
    }));
  };

  const handleSelectStrategy = (strat: SyncStrategy) => {
    setStrategy(strat);
    if (strat === 'UNIVERSAL_REFRESH' || strat === 'SMART_MERGE') {
      setSelectedSections({
        1: true,
        2: true,
        3: true,
        4: true,
        5: true,
        6: true,
        7: false,
        8: true
      });
    }
  };

  const selectedCount = Object.values(selectedSections).filter(Boolean).length;
  const totalFieldsToSync = SECTIONS_CONFIG.reduce((acc, sec) => {
    return selectedSections[sec.num] ? acc + sec.fieldsCount : acc;
  }, 0);

  const handleExecute = () => {
    const sectionNums = Object.entries(selectedSections)
      .filter(([_, isSelected]) => isSelected)
      .map(([num]) => Number(num));

    onApplySync({
      strategy,
      selectedSections: sectionNums,
      unlockRevision: isLocked
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-[200] p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 max-w-xl w-full rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-900 transition-all duration-200 animate-in zoom-in-95">
        
        {/* Minimal Header */}
        <div className="px-5 py-3.5 border-b border-slate-200/90 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 fill-amber-500 text-amber-600" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-900">
                  Sync with Master Profile
                </h3>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-md">
                  Verified
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                Target: <strong className="text-slate-700">{buyerName}</strong> ({invitationCode})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-3.5 bg-slate-50/50">
          
          {/* Locked Application Alert Guard */}
          {isLocked && (
            <div className="p-2.5 bg-amber-50/90 border border-amber-300 rounded-xl text-amber-950 flex items-center gap-2.5 text-xs shadow-2xs">
              <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>
                Application is submitted (Stage 3). Syncing will automatically enable <strong>Revision Mode</strong>.
              </span>
            </div>
          )}

          {/* Minimal Strategy Switcher */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Sync Mode</span>
              <span className="text-[11px] text-slate-500">
                {strategy === 'UNIVERSAL_REFRESH' && 'Overwrites universal modules • Protects buyer terms'}
                {strategy === 'SMART_MERGE' && 'Fills empty fields only'}
                {strategy === 'CUSTOM' && 'Custom section selection'}
              </span>
            </div>

            <div className="grid grid-cols-3 p-1 bg-slate-100 rounded-xl border border-slate-200/80 text-xs font-semibold gap-1 select-none">
              <button
                type="button"
                onClick={() => handleSelectStrategy('UNIVERSAL_REFRESH')}
                className={`py-1.5 px-2 rounded-lg text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  strategy === 'UNIVERSAL_REFRESH'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <RefreshCw className="w-3 h-3 text-amber-600" />
                <span>Universal Sync</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectStrategy('SMART_MERGE')}
                className={`py-1.5 px-2 rounded-lg text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  strategy === 'SMART_MERGE'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>Fill Missing Only</span>
              </button>

              <button
                type="button"
                onClick={() => setStrategy('CUSTOM')}
                className={`py-1.5 px-2 rounded-lg text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  strategy === 'CUSTOM'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Check className="w-3 h-3 text-indigo-600" />
                <span>Custom Select</span>
              </button>
            </div>
          </div>

          {/* Minimal Clean Single-Line Section List */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 shadow-2xs">
            {SECTIONS_CONFIG.map((section) => {
              const IconComponent = section.icon;
              const isChecked = Boolean(selectedSections[section.num]);

              return (
                <div
                  key={section.num}
                  onClick={() => handleToggleSection(section.num)}
                  className={`px-3 py-2 flex items-center justify-between gap-3 transition cursor-pointer ${
                    isChecked ? 'bg-white hover:bg-slate-50/80' : 'bg-slate-50/40 hover:bg-slate-100/50 opacity-55'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleSection(section.num)}
                      onClick={(e) => e.stopPropagation()}
                      className="rounded text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5 cursor-pointer shrink-0"
                    />

                    <div className="w-6 h-6 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                      <IconComponent className="w-3.5 h-3.5" />
                    </div>

                    <span className="text-xs font-medium text-slate-800 truncate">
                      {section.num}. {section.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {section.isUniversal ? (
                      <span className="text-[10px] font-mono text-slate-400">
                        {section.fieldsCount} {section.fieldsCount === 1 ? 'record' : 'fields'}
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5 text-amber-600" />
                        <span>Buyer Specific (Protected)</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Minimal Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <span className="text-xs text-slate-500">
            <strong>{selectedCount} of 8</strong> sections selected ({totalFieldsToSync} fields)
          </span>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer shadow-2xs"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleExecute}
              disabled={selectedCount === 0}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-xs cursor-pointer ${
                selectedCount === 0
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>{isLocked ? 'Unlock & Sync' : 'Apply Sync'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
