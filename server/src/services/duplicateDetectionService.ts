import { db } from '../db/memoryDb.js';
import { SupplierOrganization } from '../models/types.js';

export interface DuplicateCheckResult {
  hasConflict: boolean;
  matchType: 'EXACT_DUPLICATE' | 'CORPORATE_SUCCESSION' | 'NEAR_MATCH' | 'NO_MATCH';
  confidence: number;
  matchedSupplier?: SupplierOrganization;
  explanation: string;
  recommendedAction: string;
}

export class DuplicateDetectionService {
  public static checkDuplicate(params: {
    legalName: string;
    tradeName?: string;
    taxId?: string;
    country?: string;
    businessEmail?: string;
  }): DuplicateCheckResult {
    const existingSuppliers = db.getAllSupplierOrgs();
    const cleanName = params.legalName.trim().toLowerCase();
    const cleanTax = params.taxId ? params.taxId.replace(/[^a-zA-Z0-9]/g, '') : '';

    // 1. Check exact or sanitized Tax ID match
    if (cleanTax) {
      const taxMatches = existingSuppliers.filter(sup => sup.taxId && sup.taxId.replace(/[^a-zA-Z0-9]/g, '') === cleanTax);
      const exactMatch = taxMatches.find(sup => sup.legalName.trim().toLowerCase() === cleanName);

      if (exactMatch) {
        return {
          hasConflict: true,
          matchType: 'EXACT_DUPLICATE',
          confidence: 0.99,
          matchedSupplier: exactMatch,
          explanation: `Identical Tax ID (${exactMatch.taxId}) and Legal Name match active master record: ${exactMatch.legalName} (${exactMatch.erpVendorId || exactMatch.id}).`,
          recommendedAction: 'ABORT_NEW_RECORD_USE_EXISTING'
        };
      } else if (taxMatches.length > 0) {
        const sup = taxMatches[0];
        return {
          hasConflict: true,
          matchType: 'CORPORATE_SUCCESSION',
          confidence: 0.94,
          matchedSupplier: sup,
          explanation: `Tax ID (${sup.taxId}) matches existing master vendor '${sup.legalName}' (${sup.erpVendorId || 'Active'}), but proposed legal name differs ('${params.legalName}'). This indicates corporate succession, statutory rebrand, or legal merger.`,
          recommendedAction: 'AUTHORIZE_SUCCESSION_MERGE_LINEAGE'
        };
      }
    }

    // 2. Check Name & Email Domain Similarity
    for (const sup of existingSuppliers) {
      const supName = sup.legalName.trim().toLowerCase();
      
      // Token overlap
      const nameTokens = new Set(cleanName.replace(/[^a-z0-9 ]/g, '').split(/\s+/));
      const supTokens = new Set(supName.replace(/[^a-z0-9 ]/g, '').split(/\s+/));
      
      // Remove generic corp stopwords
      const stopwords = new Set(['inc', 'llc', 'corp', 'corporation', 'ltd', 'limited', 'co', 'company', 'services', 'global', 'technologies']);
      const filtered1 = Array.from(nameTokens).filter(t => !stopwords.has(t) && t.length > 2);
      const filtered2 = Array.from(supTokens).filter(t => !stopwords.has(t) && t.length > 2);
      
      const common = filtered1.filter(t => filtered2.includes(t));
      if (filtered1.length > 0 && common.length >= Math.min(filtered1.length, filtered2.length)) {
        return {
          hasConflict: true,
          matchType: 'NEAR_MATCH',
          confidence: 0.78,
          matchedSupplier: sup,
          explanation: `Strong lexical name overlap with existing supplier '${sup.legalName}'. Common keywords: ${common.join(', ')}.`,
          recommendedAction: 'REVIEW_POSSIBLE_DUPLICATE'
        };
      }
    }

    return {
      hasConflict: false,
      matchType: 'NO_MATCH',
      confidence: 0.0,
      explanation: 'No duplicate Tax IDs, corporate lineages, or active supplier names found.',
      recommendedAction: 'PROCEED_WITH_NEW_SUPPLIER'
    };
  }
}
