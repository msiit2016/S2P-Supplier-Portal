// Centralized Country Data with Flags, Codes, and Search Aliases

export interface CountryInfo {
  code: string;
  name: string;
  flag: string;
  dialCode: string;
  region: string;
}

export const COUNTRY_DATA_LIST: CountryInfo[] = [
  { code: 'US', name: 'United States', flag: '🇺🇸', dialCode: '+1', region: 'North America' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', dialCode: '+44', region: 'Europe' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', dialCode: '+49', region: 'European Union' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', dialCode: '+81', region: 'Asia-Pacific' },
  { code: 'IN', name: 'India', flag: '🇮🇳', dialCode: '+91', region: 'South Asia' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', dialCode: '+1', region: 'North America' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', dialCode: '+61', region: 'Oceania' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', dialCode: '+65', region: 'Southeast Asia' },
  { code: 'FR', name: 'France', flag: '🇫🇷', dialCode: '+33', region: 'European Union' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', dialCode: '+31', region: 'European Union' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭', dialCode: '+41', region: 'Europe' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', dialCode: '+55', region: 'Latin America' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', dialCode: '+52', region: 'Latin America' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', dialCode: '+971', region: 'Middle East' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', dialCode: '+966', region: 'Middle East' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', dialCode: '+39', region: 'European Union' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', dialCode: '+34', region: 'European Union' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷', dialCode: '+82', region: 'East Asia' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪', dialCode: '+46', region: 'Nordics' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴', dialCode: '+47', region: 'Nordics' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰', dialCode: '+45', region: 'Nordics' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮', dialCode: '+358', region: 'Nordics' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪', dialCode: '+353', region: 'European Union' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱', dialCode: '+48', region: 'European Union' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪', dialCode: '+32', region: 'European Union' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹', dialCode: '+43', region: 'European Union' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', dialCode: '+64', region: 'Oceania' },
  { code: 'TW', name: 'Taiwan', flag: '🇹🇼', dialCode: '+886', region: 'East Asia' },
  { code: 'IL', name: 'Israel', flag: '🇮🇱', dialCode: '+972', region: 'Middle East' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', dialCode: '+27', region: 'Africa' },
  { code: 'CN', name: 'China', flag: '🇨🇳', dialCode: '+86', region: 'East Asia' },
  { code: 'HK', name: 'Hong Kong', flag: '🇭🇰', dialCode: '+852', region: 'East Asia' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', dialCode: '+60', region: 'Southeast Asia' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', dialCode: '+62', region: 'Southeast Asia' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭', dialCode: '+63', region: 'Southeast Asia' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', dialCode: '+66', region: 'Southeast Asia' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳', dialCode: '+84', region: 'Southeast Asia' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', dialCode: '+351', region: 'European Union' },
  { code: 'GR', name: 'Greece', flag: '🇬🇷', dialCode: '+30', region: 'European Union' },
  { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿', dialCode: '+420', region: 'European Union' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷', dialCode: '+90', region: 'Middle East' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', dialCode: '+54', region: 'Latin America' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱', dialCode: '+56', region: 'Latin America' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴', dialCode: '+57', region: 'Latin America' }
];

/**
 * Returns flag emoji for a given 2-letter ISO country code or country name.
 */
export function getCountryFlag(codeOrName: string): string {
  if (!codeOrName) return '🌐';
  const clean = codeOrName.trim().toUpperCase();
  const directMatch = COUNTRY_DATA_LIST.find(
    (c) => c.code === clean || c.name.toUpperCase() === clean
  );
  if (directMatch) return directMatch.flag;

  // Try generating from 2-letter code
  if (clean.length === 2 && /^[A-Z]{2}$/.test(clean)) {
    try {
      return String.fromCodePoint(...[...clean].map((c) => 127397 + c.charCodeAt(0)));
    } catch {
      return '🌐';
    }
  }

  // Check partial name match
  const partialMatch = COUNTRY_DATA_LIST.find((c) =>
    clean.includes(c.name.toUpperCase()) || c.name.toUpperCase().includes(clean)
  );
  return partialMatch ? partialMatch.flag : '🌐';
}

/**
 * Formatted country options for SearchableSelect with flag logos.
 * Stored value is the clean country name (e.g. "United States").
 */
export const COUNTRY_REGISTRATION_OPTIONS = COUNTRY_DATA_LIST.map((c) => ({
  value: c.name,
  label: `${c.flag}  ${c.name}`,
  code: c.code,
  sublabel: `${c.region} · ${c.dialCode}`
}));

/**
 * Formatted ISO country options with flag logos (e.g. "🇺🇸 United States (US)").
 */
export const GLOBAL_ISO_COUNTRY_OPTIONS = COUNTRY_DATA_LIST.map((c) => ({
  value: `${c.name} (${c.code})`,
  label: `${c.flag}  ${c.name} (${c.code})`,
  code: c.code,
  sublabel: `ISO 3166-1 · ${c.region}`
}));

/**
 * Plain string array with flags and ISO codes for compatibility with existing string-based selectors.
 */
export const AVAILABLE_COUNTRIES_WITH_FLAGS = COUNTRY_DATA_LIST.map(
  (c) => `${c.flag} ${c.name} (${c.code})`
);
