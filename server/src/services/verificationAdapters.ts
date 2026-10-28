export interface VerificationResult {
  adapter: string;
  isMock: boolean;
  status: 'VERIFIED' | 'FAILED' | 'FLAGGED';
  confidence: number;
  details: Record<string, any>;
  verifiedAt: string;
}

export class ExternalVerificationAdapters {
  public static verifyTaxId(taxId: string, legalName: string): VerificationResult {
    const cleanTax = taxId.replace(/[^0-9]/g, '');
    const isMock = true; // explicitly labeled as required by Section L

    if (cleanTax.length < 9) {
      return {
        adapter: 'IRS_TIN_MATCH_ADAPTER',
        isMock,
        status: 'FAILED',
        confidence: 0.1,
        details: { message: 'Invalid EIN/TIN format or length (must be 9 digits)', cleanTax },
        verifiedAt: new Date().toISOString()
      };
    }

    return {
      adapter: 'IRS_TIN_MATCH_ADAPTER',
      isMock,
      status: 'VERIFIED',
      confidence: 0.99,
      details: {
        irsResponseCode: 'TIN_NAME_MATCH',
        registeredEntity: legalName,
        tinMatched: true,
        notice: 'SIMULATED ADAPTER: Verified against mock IRS e-Services database'
      },
      verifiedAt: new Date().toISOString()
    };
  }

  public static screenSanctions(legalName: string): VerificationResult {
    const isMock = true;
    const lower = legalName.toLowerCase();
    
    // Check if name contains sanctioned test tokens
    if (lower.includes('sanction') || lower.includes('embargo') || lower.includes('denied entity')) {
      return {
        adapter: 'OFAC_SDN_SCREENING_ADAPTER',
        isMock,
        status: 'FLAGGED',
        confidence: 0.95,
        details: {
          listName: 'OFAC Specially Designated Nationals (SDN)',
          hitScore: 98,
          recommendation: 'Immediate human compliance officer escalation required',
          notice: 'SIMULATED ADAPTER: High-confidence sanctions collision'
        },
        verifiedAt: new Date().toISOString()
      };
    }

    return {
      adapter: 'OFAC_SDN_SCREENING_ADAPTER',
      isMock,
      status: 'VERIFIED',
      confidence: 0.99,
      details: {
        sanctionsList: ['OFAC_SDN', 'EU_CONSOLIDATED', 'UN_SANCTIONS'],
        hitsCount: 0,
        result: 'CLEAR',
        notice: 'SIMULATED ADAPTER: Zero collisions detected against global watchlists'
      },
      verifiedAt: new Date().toISOString()
    };
  }

  public static verifyBankAccount(routing: string, account: string, name: string): VerificationResult {
    const isMock = true;
    const cleanRouting = routing.replace(/[^0-9]/g, '');

    // Standard US routing Fed check (9 digits)
    if (cleanRouting.length !== 9) {
      return {
        adapter: 'PLAID_FEDACH_VERIFICATION_ADAPTER',
        isMock,
        status: 'FAILED',
        confidence: 0.2,
        details: { message: 'Invalid ABA routing number format' },
        verifiedAt: new Date().toISOString()
      };
    }

    return {
      adapter: 'PLAID_FEDACH_VERIFICATION_ADAPTER',
      isMock,
      status: 'VERIFIED',
      confidence: 0.96,
      details: {
        financialInstitution: 'Silicon Valley Bank / First Citizens Bank NA',
        routingValid: true,
        accountMatchConfidence: 0.96,
        beneficiaryMatch: 'CONFIRMED',
        notice: 'SIMULATED ADAPTER: Confirmed active commercial deposit account'
      },
      verifiedAt: new Date().toISOString()
    };
  }
}
