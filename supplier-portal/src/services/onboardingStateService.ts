export interface BuyerOnboardingProgressState {
  id: string;
  buyerName: string;
  invitationCode: string;
  completedStepsCount: number;
  totalSteps: number;
  progressPercent: number;
  stageLabel: string;
  stageNum: number;
  statusKey: 'ACTION_REQUIRED' | 'IN_PROGRESS' | 'UNDER_REVIEW' | 'APPROVED';
  statusLabel: string;
  isSubmitted: boolean;
  isEditing: boolean;
  submittedAt?: string;
  updatedAt?: string;
}

const STORAGE_KEY = 'verisource_buyer_onboarding_states';

export const DEFAULT_ONBOARDING_PROGRESS: Record<string, BuyerOnboardingProgressState> = {
  'inv-apex-01': {
    id: 'inv-apex-01',
    buyerName: 'Apex Global Enterprises',
    invitationCode: 'INV-APEX-2026',
    completedStepsCount: 8,
    totalSteps: 9,
    progressPercent: 89,
    stageLabel: 'Stage 2 of 5: Form Submission',
    stageNum: 2,
    statusKey: 'IN_PROGRESS',
    statusLabel: 'In Progress (89%)',
    isSubmitted: false,
    isEditing: false,
  },
  'inv-meridian-03': {
    id: 'inv-meridian-03',
    buyerName: 'Meridian Health Network',
    invitationCode: 'INV-MERIDIAN-4011',
    completedStepsCount: 4,
    totalSteps: 9,
    progressPercent: 44,
    stageLabel: 'Stage 2 of 5: Form Submission',
    stageNum: 2,
    statusKey: 'IN_PROGRESS',
    statusLabel: 'In Progress (44%)',
    isSubmitted: false,
    isEditing: false,
  },
  'inv-novatech-02': {
    id: 'inv-novatech-02',
    buyerName: 'NovaTech Aerospace & Defense',
    invitationCode: 'INV-NOVATECH-8820',
    completedStepsCount: 0,
    totalSteps: 9,
    progressPercent: 0,
    stageLabel: 'Stage 1 of 5: Registration Completed',
    stageNum: 1,
    statusKey: 'ACTION_REQUIRED',
    statusLabel: 'Action Needed',
    isSubmitted: false,
    isEditing: false,
  }
};

export const getBuyerOnboardingProgressMap = (): Record<string, BuyerOnboardingProgressState> => {
  if (typeof window === 'undefined') return DEFAULT_ONBOARDING_PROGRESS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_ONBOARDING_PROGRESS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_ONBOARDING_PROGRESS, ...parsed };
  } catch (e) {
    return DEFAULT_ONBOARDING_PROGRESS;
  }
};

export const getBuyerOnboardingProgress = (id: string): BuyerOnboardingProgressState => {
  const map = getBuyerOnboardingProgressMap();
  return map[id] || DEFAULT_ONBOARDING_PROGRESS[id] || {
    id,
    buyerName: 'Enterprise Buyer',
    invitationCode: 'INV-ONBOARD',
    completedStepsCount: 0,
    totalSteps: 9,
    progressPercent: 0,
    stageLabel: 'Stage 1 of 5: Registration Completed',
    stageNum: 1,
    statusKey: 'ACTION_REQUIRED',
    statusLabel: 'Action Needed',
    isSubmitted: false,
    isEditing: false,
  };
};

export const saveBuyerOnboardingProgress = (
  id: string,
  progress: Partial<BuyerOnboardingProgressState>
) => {
  if (typeof window === 'undefined') return;
  try {
    const current = getBuyerOnboardingProgressMap();
    const existing = current[id] || DEFAULT_ONBOARDING_PROGRESS[id] || {
      id,
      buyerName: 'Enterprise Buyer',
      invitationCode: 'INV-ONBOARD',
      completedStepsCount: 0,
      totalSteps: 9,
      progressPercent: 0,
      stageLabel: 'Stage 2 of 5: Form Submission',
      stageNum: 2,
      statusKey: 'IN_PROGRESS' as const,
      statusLabel: 'In Progress',
      isSubmitted: false,
      isEditing: false,
    };
    const updated = {
      ...current,
      [id]: {
        ...existing,
        ...progress,
        updatedAt: new Date().toISOString()
      }
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('verisource_onboarding_states_updated', { detail: updated }));
  } catch (e) {
    console.warn('Failed to save buyer onboarding progress:', e);
  }
};
