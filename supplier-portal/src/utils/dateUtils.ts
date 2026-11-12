/**
 * Standard Date Formatting Utilities for Supplier Onboarding Portal
 * Guarantees uniform MM-DD-YYYY date presentation across all grids, forms, and cards.
 */

export const formatDateMMDDYYYY = (dateInput: string | Date | undefined | null): string => {
  if (!dateInput) return '';
  const str = String(dateInput).trim();
  if (str === 'Permanent' || str.toLowerCase() === 'n/a' || str.toLowerCase() === 'today') return str;

  // Match YYYY-MM-DD or YYYY/MM/DD directly to avoid timezone day-shift bugs
  const ymdMatch = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (ymdMatch) {
    const [, year, month, day] = ymdMatch;
    return `${month.padStart(2, '0')}-${day.padStart(2, '0')}-${year}`;
  }

  // Match MM-DD-YYYY or MM/DD/YYYY - ensure standard hyphenated MM-DD-YYYY
  const mdyMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (mdyMatch) {
    const [, month, day, year] = mdyMatch;
    return `${month.padStart(2, '0')}-${day.padStart(2, '0')}-${year}`;
  }

  const d = new Date(str);
  if (isNaN(d.getTime())) return str;
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${mm}-${dd}-${yyyy}`;
};

export interface ExpiryStatusResult {
  status: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED';
  daysRemaining: number;
  label: string;
}

export const parseDateToMidnight = (dateStr: string | Date | undefined | null): Date | null => {
  if (!dateStr) return null;
  if (typeof dateStr !== 'string') {
    return new Date(dateStr.getFullYear(), dateStr.getMonth(), dateStr.getDate(), 0, 0, 0);
  }
  const str = dateStr.trim();
  if (str === 'Permanent' || str.toLowerCase() === 'permanent' || str.toLowerCase() === 'n/a') return null;

  // Match YYYY-MM-DD or YYYY/MM/DD
  const ymdMatch = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (ymdMatch) {
    const [, y, m, d] = ymdMatch;
    return new Date(Number(y), Number(m) - 1, Number(d), 0, 0, 0);
  }

  // Match MM-DD-YYYY or MM/DD/YYYY
  const mdyMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (mdyMatch) {
    const [, m, d, y] = mdyMatch;
    return new Date(Number(y), Number(m) - 1, Number(d), 0, 0, 0);
  }

  const parsed = new Date(str);
  if (isNaN(parsed.getTime())) return null;
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate(), 0, 0, 0);
};

export const calculateDocExpiryStatus = (dateInput: string | Date | undefined | null): ExpiryStatusResult => {
  if (!dateInput || dateInput === 'Permanent' || String(dateInput).toLowerCase() === 'permanent') {
    return {
      status: 'ACTIVE',
      daysRemaining: 9999,
      label: 'Permanent Record'
    };
  }

  const targetDate = parseDateToMidnight(dateInput);
  if (!targetDate || isNaN(targetDate.getTime())) {
    return {
      status: 'ACTIVE',
      daysRemaining: 365,
      label: 'Verified'
    };
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      status: 'EXPIRED',
      daysRemaining: diffDays,
      label: `Expired (${Math.abs(diffDays)}d ago)`
    };
  }

  if (diffDays === 0) {
    return {
      status: 'EXPIRING_SOON',
      daysRemaining: 0,
      label: 'Expires Today'
    };
  }

  if (diffDays <= 30) {
    return {
      status: 'EXPIRING_SOON',
      daysRemaining: diffDays,
      label: `Expires in ${diffDays}d`
    };
  }

  return {
    status: 'ACTIVE',
    daysRemaining: diffDays,
    label: 'Verified'
  };
};

export interface DaysLeftResult {
  days: number;
  text: string;
  urgent: boolean;
  isOverdue: boolean;
}

/**
 * Calculates remaining days from today's current date to a target deadline date.
 * Accurately handles midnight normalization across timezones.
 */
export const calculateDaysRemaining = (dateInput: string | Date | undefined | null): DaysLeftResult => {
  if (!dateInput) {
    return { days: 0, text: 'No deadline', urgent: false, isOverdue: false };
  }

  const targetDate = parseDateToMidnight(dateInput);
  if (!targetDate || isNaN(targetDate.getTime())) {
    return { days: 0, text: 'N/A', urgent: false, isOverdue: false };
  }

  // Count dynamically from today's date
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      days: diffDays,
      text: `${Math.abs(diffDays)}d overdue`,
      urgent: true,
      isOverdue: true
    };
  }

  if (diffDays === 0) {
    return {
      days: 0,
      text: 'Closes today',
      urgent: true,
      isOverdue: false
    };
  }

  if (diffDays === 1) {
    return {
      days: 1,
      text: '1d left',
      urgent: true,
      isOverdue: false
    };
  }

  return {
    days: diffDays,
    text: `${diffDays}d left`,
    urgent: diffDays <= 7,
    isOverdue: false
  };
};

