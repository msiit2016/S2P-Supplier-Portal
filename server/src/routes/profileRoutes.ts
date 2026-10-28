import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { GlobalSupplierProfile, BuyerSpecificProfile } from '../models/types.js';

const router = Router();

// In-memory profiles storage
const globalProfiles: Record<string, GlobalSupplierProfile> = {
  'supp-org-1': {
    id: 'gprof-001',
    supplierOrgId: 'supp-org-1',
    legalName: 'Acme Industrial Tech Inc.',
    tradeName: 'Acme Tech Solutions',
    dunsNumber: '08-112-9482',
    taxIdMasked: 'XX-XXX8812',
    incorporationDate: '2016-04-12',
    country: 'United States',
    hqAddress: '100 Industrial Parkway, Suite 400, Austin, TX 78701',
    website: 'https://acmeindustrialtech.example.com',
    businessEmail: 'elena@acmeindustrial.com',
    phone: '+1 (512) 555-0199',
    industryCategory: 'IT Hardware, Cloud Infrastructure & Advanced Engineering',
    employeeCountRange: '100-250 Employees',
    description: 'Leading provider of enterprise cloud compute nodes, specialized cybersecurity architecture, and high-tolerance industrial sensor hardware.',
    publicPassportSlug: 'acme-industrial-tech',
    passportUrl: 'https://verisource.network/p/acme-industrial-tech',
    isPubliclyListed: true,
    profileCompletionScore: 98,
    verificationBadges: {
      tinVerified: true,
      bankVerified: true,
      sanctionsClear: true,
      securityAssured: true,
      diversityCertified: 'Minority-Owned Business Enterprise (MBE Certified)'
    },
    masterVault: {
      w9Status: 'VERIFIED',
      insuranceStatus: 'VERIFIED',
      insuranceExpiryDate: '2027-06-30',
      insuranceCoverageAmount: '$5,000,000 Aggregate Commercial General Liability',
      iso27001Status: 'VERIFIED',
      soc2Status: 'VERIFIED',
      bankLetterStatus: 'VERIFIED'
    },
    defaultPaymentTerms: 'Net 30 Days',
    updatedAt: new Date().toISOString()
  }
};

const buyerProfiles: Record<string, BuyerSpecificProfile[]> = {
  'supp-org-1': [
    {
      id: 'bprof-apex',
      supplierOrgId: 'supp-org-1',
      buyerOrgId: 'buyer-org-1',
      buyerName: 'Apex Global Enterprises',
      buyerLogoText: 'APEX',
      relationshipStatus: 'ACTIVE',
      erpVendorId: 'VEND-8821',
      connectedSince: 'Jan 2024',
      annualSpendVolume: 485000,
      customRemittanceAccount: {
        bankName: 'JPMorgan Chase Bank, N.A.',
        accountEnding: '4921',
        routingNumberMasked: '021000021',
        currency: 'USD',
        accountNickName: 'Primary Corporate Operating Account'
      },
      negotiatedTerms: {
        paymentTerms: '2/10 Net 30',
        earlyPaymentEligible: true,
        customDiscountRate: 1.5,
        preferredPaymentMethod: 'ACH_CREDIT'
      },
      customQuestionnaires: [
        {
          questionId: 'q-apex-1',
          questionText: 'Apex Global Supplier Human Rights & Labor Standards Code of Conduct',
          answer: 'Fully Attested & Signed by Legal Counsel on Jan 14, 2026',
          category: 'Ethics & Compliance'
        },
        {
          questionId: 'q-apex-2',
          questionText: 'Subcontractor Information Security Screening Protocol',
          answer: 'All Tier-2 subcontractors pass NIST 800-171 compliant background checks',
          category: 'Cybersecurity'
        }
      ],
      customDocumentOverrides: [
        {
          docType: 'NDA',
          documentName: 'Apex Global Mutual Non-Disclosure Agreement (Executed)',
          status: 'COMPLIANT'
        },
        {
          docType: 'CERT_INSURANCE',
          documentName: 'ACORD 25 with Apex Global Named as Additional Insured',
          status: 'COMPLIANT'
        }
      ],
      customCatalogTier: 'Tier-1 Enterprise Preferred (12% Master Volume Discount)',
      lastSyncedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      syncCompletenessScore: 100
    },
    {
      id: 'bprof-starlight',
      supplierOrgId: 'supp-org-1',
      buyerOrgId: 'buyer-org-2',
      buyerName: 'Starlight Aerospace & Defense',
      buyerLogoText: 'STAR',
      relationshipStatus: 'ACTIVE',
      erpVendorId: 'VEND-4019',
      connectedSince: 'Aug 2024',
      annualSpendVolume: 215000,
      customRemittanceAccount: {
        bankName: 'Silicon Valley Bank (Division of First Citizens)',
        accountEnding: '1109',
        routingNumberMasked: '121140399',
        currency: 'USD',
        accountNickName: 'Specialized Defense Tech Escrow Account'
      },
      negotiatedTerms: {
        paymentTerms: 'Net 45 Standard',
        earlyPaymentEligible: true,
        customDiscountRate: 1.25,
        preferredPaymentMethod: 'WIRE'
      },
      customQuestionnaires: [
        {
          questionId: 'q-star-1',
          questionText: 'ITAR Compliance & Export Control Administration Registration',
          answer: 'Registered with Directorate of Defense Trade Controls (DDTC)',
          category: 'Export Compliance'
        },
        {
          questionId: 'q-star-2',
          questionText: 'Scope 1, 2, and 3 Greenhouse Gas Emissions Tracking',
          answer: 'Carbon footprint audited via EcoVadis Gold Medal rating',
          category: 'Sustainability & ESG'
        }
      ],
      customDocumentOverrides: [
        {
          docType: 'ITAR_CERT',
          documentName: 'DDTC Export Registration Letter M-39218',
          status: 'COMPLIANT'
        }
      ],
      customCatalogTier: 'Defense & Aerospace Precision Rate Card 2026',
      lastSyncedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      syncCompletenessScore: 96
    },
    {
      id: 'bprof-omni',
      supplierOrgId: 'supp-org-1',
      buyerOrgId: 'buyer-org-3',
      buyerName: 'OmniRetail Logistics Network',
      buyerLogoText: 'OMNI',
      relationshipStatus: 'CHANGES_REQUESTED',
      erpVendorId: 'Pending Activation',
      connectedSince: 'Oct 2026',
      annualSpendVolume: 0,
      customRemittanceAccount: {
        bankName: 'JPMorgan Chase Bank, N.A.',
        accountEnding: '4921',
        routingNumberMasked: '021000021',
        currency: 'USD',
        accountNickName: 'Primary Corporate Operating Account'
      },
      negotiatedTerms: {
        paymentTerms: 'Net 30',
        earlyPaymentEligible: true,
        preferredPaymentMethod: 'ACH_CREDIT'
      },
      customQuestionnaires: [
        {
          questionId: 'q-omni-1',
          questionText: 'Automated EDI 850 / 810 Integration Protocol Readiness',
          answer: 'Native AS2 & REST Webhooks Configured on Verisource Network',
          category: 'Integration'
        },
        {
          questionId: 'q-omni-2',
          questionText: 'Dock & Cross-Dock Liability Insurance Addendum ($5M Cargo)',
          answer: 'ACTION REQUIRED: Current policy covers $2M. AI Agent drafted broker endorsement for $5M.',
          category: 'Risk Management'
        }
      ],
      customDocumentOverrides: [
        {
          docType: 'CARGO_INSURANCE',
          documentName: 'OmniRetail Dedicated Dock Liability Endorsement',
          status: 'OVERRIDE_REQUIRED',
          note: 'Requires $5M specific cross-dock rider before final vendor code generation'
        }
      ],
      customCatalogTier: 'OmniRetail Supply Chain Standard Catalog',
      lastSyncedAt: new Date().toISOString(),
      syncCompletenessScore: 88
    }
  ]
};

// GET Global Profile
router.get('/global', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  const supplierOrgId = user?.organizationId || 'supp-org-1';

  let profile = globalProfiles[supplierOrgId];
  if (!profile) {
    // Return default scaffold
    profile = {
      ...globalProfiles['supp-org-1'],
      supplierOrgId,
      legalName: user?.organizationName || 'My Supplier Organization',
      tradeName: user?.organizationName || 'My Supplier Organization'
    };
    globalProfiles[supplierOrgId] = profile;
  }

  res.json({ profile });
});

// PUT Global Profile
router.put('/global', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  const supplierOrgId = user?.organizationId || 'supp-org-1';

  const existing = globalProfiles[supplierOrgId] || globalProfiles['supp-org-1'];
  const updated: GlobalSupplierProfile = {
    ...existing,
    ...req.body,
    supplierOrgId,
    updatedAt: new Date().toISOString()
  };

  globalProfiles[supplierOrgId] = updated;
  res.json({ profile: updated, message: 'Global Master Profile & B2B Trust Passport updated successfully.' });
});

// GET all Connected Buyer Profiles
router.get('/buyers', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  const supplierOrgId = user?.organizationId || 'supp-org-1';

  const buyers = buyerProfiles[supplierOrgId] || buyerProfiles['supp-org-1'];
  res.json({ buyerProfiles: buyers });
});

// GET specific Buyer Profile
router.get('/buyers/:buyerOrgId', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  const supplierOrgId = user?.organizationId || 'supp-org-1';
  const { buyerOrgId } = req.params;

  const buyers = buyerProfiles[supplierOrgId] || buyerProfiles['supp-org-1'];
  const found = buyers.find(b => b.buyerOrgId === buyerOrgId || b.id === buyerOrgId);

  if (!found) {
    res.status(404).json({ error: 'Buyer relationship profile not found' });
    return;
  }

  res.json({ buyerProfile: found });
});

// PUT update specific Buyer Profile
router.put('/buyers/:buyerOrgId', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  const supplierOrgId = user?.organizationId || 'supp-org-1';
  const { buyerOrgId } = req.params;

  const buyers = buyerProfiles[supplierOrgId] || buyerProfiles['supp-org-1'];
  const index = buyers.findIndex(b => b.buyerOrgId === buyerOrgId || b.id === buyerOrgId);

  if (index === -1) {
    res.status(404).json({ error: 'Buyer relationship profile not found' });
    return;
  }

  const updated: BuyerSpecificProfile = {
    ...buyers[index],
    ...req.body,
    lastSyncedAt: new Date().toISOString()
  };

  buyers[index] = updated;
  res.json({ buyerProfile: updated, message: `Profile for ${updated.buyerName} updated successfully.` });
});

// POST Agentic Profile Sync: Auto-populate buyer requirements from Global Profile
router.post('/buyers/:buyerOrgId/sync-ai', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  const supplierOrgId = user?.organizationId || 'supp-org-1';
  const { buyerOrgId } = req.params;

  const global = globalProfiles[supplierOrgId] || globalProfiles['supp-org-1'];
  const buyers = buyerProfiles[supplierOrgId] || buyerProfiles['supp-org-1'];
  const buyer = buyers.find(b => b.buyerOrgId === buyerOrgId || b.id === buyerOrgId);

  if (!buyer) {
    res.status(404).json({ error: 'Buyer relationship profile not found' });
    return;
  }

  // Autonomous Agentic Sync Logic
  const syncedFields = [
    { field: 'legalName', source: 'Global Master Passport', status: 'AUTO_POPULATED', confidence: 1.0 },
    { field: 'taxId', source: 'IRS W-9 Master Vault (TIN Verified)', status: 'AUTO_POPULATED', confidence: 1.0 },
    { field: 'hqAddress', source: 'Corporate Registration', status: 'AUTO_POPULATED', confidence: 0.99 },
    { field: 'dunsNumber', source: 'D&B Verified Master Record', status: 'AUTO_POPULATED', confidence: 1.0 },
    { field: 'iso27001Certificate', source: 'Universal Compliance Vault', status: 'AUTO_POPULATED', confidence: 0.98 },
    { field: 'bankCoordinates', source: 'Plaid / Early Warning Tokenized Direct Deposit', status: 'AUTO_POPULATED', confidence: 1.0 },
    { field: 'diversityStatus', source: 'MBE Council National Certification', status: 'AUTO_POPULATED', confidence: 0.95 }
  ];

  const unfulfilledDeltas = buyer.customDocumentOverrides
    .filter(d => d.status === 'OVERRIDE_REQUIRED')
    .map(d => ({
      document: d.documentName,
      requirement: d.note || 'Buyer-specific rider required',
      suggestedAction: 'AI Agent drafted endorsement request to broker'
    }));

  buyer.lastSyncedAt = new Date().toISOString();
  buyer.syncCompletenessScore = unfulfilledDeltas.length === 0 ? 100 : 92;

  res.json({
    message: `Agentic Sync Complete for ${buyer.buyerName}`,
    syncScore: buyer.syncCompletenessScore,
    syncedFieldsCount: syncedFields.length,
    syncedFields,
    unfulfilledDeltas,
    autonomousAgentNote: `Verisource Copilot auto-mapped ${syncedFields.length} master fields from your Global Passport with 99.4% confidence. ${unfulfilledDeltas.length} buyer-specific requirement(s) flagged for final review.`
  });
});

// POST Connect New Buyer
router.post('/buyers/connect', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  const supplierOrgId = user?.organizationId || 'supp-org-1';
  const { buyerName, buyerDomain, invitationCode } = req.body;

  if (!buyerName) {
    res.status(400).json({ error: 'buyerName is required' });
    return;
  }

  const newBuyerId = `buyer-org-${Date.now().toString().slice(-4)}`;
  const newProfile: BuyerSpecificProfile = {
    id: `bprof-${Date.now().toString().slice(-4)}`,
    supplierOrgId,
    buyerOrgId: newBuyerId,
    buyerName,
    buyerLogoText: buyerName.slice(0, 4).toUpperCase(),
    relationshipStatus: 'INVITED',
    connectedSince: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    customRemittanceAccount: {
      bankName: 'JPMorgan Chase Bank, N.A.',
      accountEnding: '4921',
      routingNumberMasked: '021000021',
      currency: 'USD',
      accountNickName: 'Primary Corporate Operating Account'
    },
    negotiatedTerms: {
      paymentTerms: 'Net 30',
      earlyPaymentEligible: true,
      preferredPaymentMethod: 'ACH_CREDIT'
    },
    customQuestionnaires: [
      {
        questionId: 'q-new-1',
        questionText: `${buyerName} Standard Vendor Code of Conduct & ESG Declarations`,
        answer: 'Auto-accepted via Verisource Master B2B Trust Passport',
        category: 'Compliance'
      }
    ],
    customDocumentOverrides: [],
    customCatalogTier: 'Standard Enterprise Commercial Price List',
    lastSyncedAt: new Date().toISOString(),
    syncCompletenessScore: 95
  };

  if (!buyerProfiles[supplierOrgId]) {
    buyerProfiles[supplierOrgId] = [...buyerProfiles['supp-org-1']];
  }
  buyerProfiles[supplierOrgId].unshift(newProfile);

  res.status(201).json({
    message: `Enterprise connection established with ${buyerName}! Master Passport credentials shared.`,
    buyerProfile: newProfile
  });
});

// POST Bi-directional Sync: Push updates from a Buyer Workspace back to Master Profile
router.post('/sync-to-master', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  const supplierOrgId = user?.organizationId || 'supp-org-1';
  const { updates, sourceBuyerName } = req.body;

  const current = globalProfiles[supplierOrgId] || globalProfiles['supp-org-1'];
  const updated: GlobalSupplierProfile = {
    ...current,
    ...updates,
    masterVault: {
      ...current.masterVault,
      ...(updates?.masterVault || {})
    },
    verificationBadges: {
      ...current.verificationBadges,
      ...(updates?.verificationBadges || {})
    },
    updatedAt: new Date().toISOString()
  };
  globalProfiles[supplierOrgId] = updated;

  res.json({
    message: `🎉 Master Profile successfully synchronized with updates from ${sourceBuyerName || 'Buyer Workspace'}! All future buyer onboardings will reflect these changes.`,
    profile: updated,
    syncedBackFields: Object.keys(updates || {})
  });
});

export default router;

