import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  Printer, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Building2, 
  Landmark, 
  Award, 
  FileCheck2, 
  Lock, 
  ExternalLink,
  ZoomIn,
  ZoomOut,
  Maximize2,
  MessageSquare,
  Send,
  Sparkles,
  ArrowRight,
  Check
} from 'lucide-react';
import { downloadComplianceDocument, getCleanDocumentFilename } from '../../utils/documentPdfGenerator.js';
import { ApiClient } from '../../api/client.js';

export interface ComplianceDoc {
  id: string;
  title: string;
  type: string;
  issuedDate: string;
  expiryDate: string;
  daysRemaining: number;
  status: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED';
  fileSize: string;
  verifiedBy: string;
  documentCategory: string;
  previewUrl?: string;
  hasInquiry?: boolean;
}

interface DocumentPreviewModalProps {
  doc: ComplianceDoc | null;
  initialShowInquiries?: boolean;
  onClose: () => void;
  onDownload?: (doc: ComplianceDoc) => void;
  onRenew?: (docId: string) => void;
  onOpenCentralMessages?: (docId: string, docType: string) => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  doc,
  initialShowInquiries = false,
  onClose,
  onDownload,
  onRenew,
  onOpenCentralMessages
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [showInquiriesPanel, setShowInquiriesPanel] = useState<boolean>(initialShowInquiries);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [imageError, setImageError] = useState(false);

  // Synchronize initial inquiries view when modal opens
  useEffect(() => {
    setImageError(false);
    if (initialShowInquiries) {
      setShowInquiriesPanel(true);
    }
  }, [initialShowInquiries, doc]);

  // Load or initialize mock inquiries for this compliance doc
  useEffect(() => {
    if (!doc) return;

    // Default authentic contextual inquiries based on document type
    const defaultInquiries: Record<string, any[]> = {
      'CERT_INSURANCE_ACORD': [
        {
          id: 'comm-coi-1',
          authorName: 'David Miller',
          authorRole: 'Apex Global Risk & Compliance Officer',
          text: 'Notice: Certificate expires in 20 days. Apex Global requires endorsement rider naming Apex Global Enterprises Inc. as Additional Insured on the General Liability schedule ($2M aggregate limit).',
          createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
        },
        {
          id: 'comm-coi-2',
          authorName: 'Elena Rostova',
          authorRole: 'Acme Industrial Tech',
          text: 'Understood David. Our broker Marsh McLennan is issuing the endorsement rider today. Will upload before Friday.',
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
        }
      ],
      'IRS_W9': [
        {
          id: 'comm-w9-1',
          authorName: 'Tax Audit Specialist',
          authorRole: 'IRS / Compliance Verification Team',
          text: 'TIN and legal business name matched against IRS e-Services database. Verified for 2026 1099-MISC/NEC reporting.',
          createdAt: new Date(Date.now() - 86400000).toISOString()
        }
      ],
      'ISO_27001': [
        {
          id: 'comm-iso-1',
          authorName: 'Cybersecurity Assurance Officer',
          authorRole: 'Apex Global InfoSec Team',
          text: 'Surveillance Audit 2 report reviewed. ISO/IEC 27001:2022 scope covers North American and European cloud hosting regions.',
          createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
        }
      ]
    };

    setComments(defaultInquiries[doc.type] || [
      {
        id: `comm-${doc.id}-init`,
        authorName: 'Compliance Auditor',
        authorRole: 'Verification Specialist',
        text: `Document ${doc.title} verified and recorded in the audit trail. Monitored for expiration and annual attestation.`,
        createdAt: new Date(Date.now() - 86400000).toISOString()
      }
    ]);
  }, [doc]);

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !doc) return;

    const userComment = {
      id: `comm-${Date.now()}`,
      authorName: 'Elena Rostova',
      authorRole: 'Acme Industrial Tech',
      text: newComment.trim(),
      createdAt: new Date().toISOString()
    };

    setComments(prev => [...prev, userComment]);
    setNewComment('');

    try {
      await ApiClient.addTransactionComment('COMPLIANCE', doc.id, userComment.text);
    } catch (err) {
      // client-side state already updated
    }
  };

  const getDocAiSuggestions = () => {
    if (!doc) return [];
    if (doc.type.includes('INSURANCE') || doc.type.includes('ACORD')) {
      return [
        { label: 'Confirm Rider Issued', text: 'Confirmed. Marsh McLennan has issued the endorsement rider naming Apex Global as Additional Insured. Uploading now.' },
        { label: 'Request 14-Day Extension', text: 'We are awaiting final countersignature from the underwriter. Requesting a 14-day grace extension on policy verification.' },
        { label: 'Verify $2M Policy Limits', text: 'Policy limits are confirmed at $2,000,000 aggregate and $1,000,000 per occurrence with zero deductible.' }
      ];
    }
    if (doc.type.includes('W9') || doc.type.includes('TAX')) {
      return [
        { label: 'Confirm 2026 Re-Attestation', text: 'Confirmed. Form W-9 is signed under penalty of perjury with active EIN 84-2910482.' },
        { label: 'Send W-8BEN Alternate', text: 'For our international subsidiary operations, we have also filed the corresponding W-8BEN-E tax form.' }
      ];
    }
    return [
      { label: 'Acknowledge Audit Note', text: 'Thank you for the verification confirmation. Audit records updated.' },
      { label: 'Provide Updated Certificate', text: 'An updated accredited certificate has been uploaded to the Document Vault.' }
    ];
  };

  if (!doc) return null;

  const isExpired = doc.status === 'EXPIRED';
  const isWarning = doc.status === 'EXPIRING_SOON';
  const filename = getCleanDocumentFilename(doc);

  const handleDownload = () => {
    downloadComplianceDocument(doc);
    if (onDownload) {
      onDownload(doc);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 15, 140));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 15, 75));
  const handleResetZoom = () => setZoomLevel(100);

  // Render authentic document preview based on document classification
  const renderDocumentPaper = () => {
    const isBlobOrDataImage = !imageError && !!doc.previewUrl && 
      (doc.previewUrl.startsWith('blob:') || doc.previewUrl.startsWith('data:image'));

    if (isBlobOrDataImage) {
      return (
        <div className="bg-white rounded-xl shadow-2xl p-4 flex flex-col items-center justify-center border border-slate-200">
          <img 
            src={doc.previewUrl} 
            alt={doc.title} 
            onError={() => setImageError(true)}
            className="max-w-full max-h-[70vh] object-contain rounded-lg" 
          />
          <div className="mt-3 text-xs text-slate-500 font-mono flex items-center gap-2">
            <span>Direct Upload Binary Preview</span>
            <span>•</span>
            <span className="text-emerald-600 font-semibold">Integrity Verified</span>
          </div>
        </div>
      );
    }

    const type = (doc.type || '').toUpperCase();
    const title = (doc.title || '').toUpperCase();
    const docCat = (doc.documentCategory || '').toUpperCase();

    // 1. ACORD 25 Certificate of Liability Insurance
    if (
      type.includes('ACORD') || 
      type.includes('INSURANCE') || 
      type.includes('COI') || 
      title.includes('ACORD') || 
      title.includes('INSURANCE') || 
      title.includes('COI') || 
      title.includes('LIABILITY')
    ) {
      return (
        <div className="bg-white text-slate-900 border border-slate-300 shadow-2xl p-6 sm:p-10 text-[11px] font-sans relative">
          {/* Watermark / Background stamp */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
            <span className="text-8xl font-black uppercase tracking-widest text-slate-900 rotate-[-25deg]">
              VERIFIED
            </span>
          </div>

          {/* ACORD Header */}
          <div className="border-b-2 border-slate-900 pb-3 flex items-start justify-between">
            <div>
              <div className="text-2xl font-black tracking-tighter text-slate-900 font-serif">ACORD</div>
              <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-800 mt-0.5">
                Certificate of Liability Insurance
              </h2>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-mono text-slate-500">DATE (MM/DD/YYYY)</div>
              <div className="font-mono font-bold text-xs text-slate-900">11/15/2025</div>
              <div className="text-[9px] text-slate-400 mt-0.5 font-mono">ACORD 25 (2016/03)</div>
            </div>
          </div>

          {/* Producer & Insured Details */}
          <div className="grid grid-cols-2 gap-3 py-3 border-b border-slate-200 text-[10px]">
            <div className="border border-slate-200 rounded p-2 bg-slate-50/60">
              <span className="font-bold uppercase text-slate-500 block text-[9px]">Producer</span>
              <div className="font-bold text-slate-900">Marsh McLennan Agency LLC</div>
              <div className="text-slate-600">Global Technology Risk Practice</div>
              <div className="text-slate-600">1166 Avenue of the Americas, New York, NY 10036</div>
              <div className="text-slate-500 mt-1">Phone: +1 (212) 345-5000</div>
            </div>

            <div className="border border-slate-200 rounded p-2 bg-slate-50/60">
              <span className="font-bold uppercase text-slate-500 block text-[9px]">Insured</span>
              <div className="font-bold text-slate-900">Acme Industrial Tech Inc.</div>
              <div className="text-slate-600">100 Industrial Parkway, Suite 400</div>
              <div className="text-slate-600">Austin, TX 78701</div>
              <div className="text-slate-500 mt-1">Tax ID (EIN): 84-1294812</div>
            </div>
          </div>

          {/* Insurers Affording Coverage */}
          <div className="py-2 border-b border-slate-200 text-[9px] bg-slate-100/70 px-2 rounded mt-2 flex flex-wrap justify-between">
            <span><strong>INSURER A:</strong> Travelers Property Casualty Co. of America</span>
            <span><strong>INSURER B:</strong> Chubb National Insurance Company</span>
            <span><strong>INSURER C:</strong> Zurich American Insurance Company</span>
          </div>

          {/* Coverages Table */}
          <div className="mt-3 border border-slate-300 rounded overflow-hidden">
            <div className="bg-slate-900 text-white font-bold text-[9px] uppercase tracking-wider py-1 px-2">
              Coverages & Limits of Insurance
            </div>
            <table className="w-full text-left text-[10px] border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-[9px] text-slate-600 uppercase font-bold">
                  <th className="p-1.5 border-r border-slate-200">INSR</th>
                  <th className="p-1.5 border-r border-slate-200">Type of Insurance</th>
                  <th className="p-1.5 border-r border-slate-200">Policy Number</th>
                  <th className="p-1.5 border-r border-slate-200">Effective Date</th>
                  <th className="p-1.5 border-r border-slate-200">Expiration Date</th>
                  <th className="p-1.5 text-right">Limits ($ USD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono text-[9px]">
                <tr className="hover:bg-slate-50">
                  <td className="p-1.5 font-bold text-center border-r border-slate-200">A</td>
                  <td className="p-1.5 font-sans font-semibold border-r border-slate-200">
                    Commercial General Liability
                    <div className="text-[8px] text-slate-500 font-normal">Occurrence Form • Defense Outside Limits</div>
                  </td>
                  <td className="p-1.5 border-r border-slate-200">GL-9948201-25</td>
                  <td className="p-1.5 border-r border-slate-200">11/15/2025</td>
                  <td className="p-1.5 border-r border-slate-200">11/15/2026</td>
                  <td className="p-1.5 text-right space-y-0.5">
                    <div>Each Occurrence: <strong>$2,000,000</strong></div>
                    <div>General Aggregate: <strong>$4,000,000</strong></div>
                    <div>Products-Comp/Op Agg: <strong>$4,000,000</strong></div>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50">
                  <td className="p-1.5 font-bold text-center border-r border-slate-200">B</td>
                  <td className="p-1.5 font-sans font-semibold border-r border-slate-200">
                    Automobile Liability
                    <div className="text-[8px] text-slate-500 font-normal">Any Auto • Owned, Hired & Non-Owned</div>
                  </td>
                  <td className="p-1.5 border-r border-slate-200">AU-8830192-25</td>
                  <td className="p-1.5 border-r border-slate-200">11/15/2025</td>
                  <td className="p-1.5 border-r border-slate-200">11/15/2026</td>
                  <td className="p-1.5 text-right">
                    Combined Single Limit: <strong>$1,000,000</strong>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50">
                  <td className="p-1.5 font-bold text-center border-r border-slate-200">B</td>
                  <td className="p-1.5 font-sans font-semibold border-r border-slate-200">
                    Umbrella / Excess Liability
                    <div className="text-[8px] text-slate-500 font-normal">Occurrence Form</div>
                  </td>
                  <td className="p-1.5 border-r border-slate-200">UMB-441092-25</td>
                  <td className="p-1.5 border-r border-slate-200">11/15/2025</td>
                  <td className="p-1.5 border-r border-slate-200">11/15/2026</td>
                  <td className="p-1.5 text-right space-y-0.5">
                    <div>Each Occurrence: <strong>$5,000,000</strong></div>
                    <div>Aggregate: <strong>$5,000,000</strong></div>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50">
                  <td className="p-1.5 font-bold text-center border-r border-slate-200">C</td>
                  <td className="p-1.5 font-sans font-semibold border-r border-slate-200">
                    Workers Compensation
                    <div className="text-[8px] text-slate-500 font-normal">Statutory Limits • Employers Liability</div>
                  </td>
                  <td className="p-1.5 border-r border-slate-200">WC-5529104-25</td>
                  <td className="p-1.5 border-r border-slate-200">11/15/2025</td>
                  <td className="p-1.5 border-r border-slate-200">11/15/2026</td>
                  <td className="p-1.5 text-right space-y-0.5">
                    <div>E.L. Each Accident: <strong>$1,000,000</strong></div>
                    <div>E.L. Disease - EA Employee: <strong>$1,000,000</strong></div>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50">
                  <td className="p-1.5 font-bold text-center border-r border-slate-200">A</td>
                  <td className="p-1.5 font-sans font-semibold border-r border-slate-200">
                    Cyber Risk & Network Security
                    <div className="text-[8px] text-slate-500 font-normal">First & Third Party Data Privacy</div>
                  </td>
                  <td className="p-1.5 border-r border-slate-200">CYB-2025-88</td>
                  <td className="p-1.5 border-r border-slate-200">11/15/2025</td>
                  <td className="p-1.5 border-r border-slate-200">11/15/2026</td>
                  <td className="p-1.5 text-right">
                    Aggregate Limit: <strong>$5,000,000</strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Certificate Holder & Signature */}
          <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-200 text-[10px]">
            <div className="border border-slate-200 rounded p-2.5 bg-slate-50">
              <span className="font-bold uppercase text-slate-500 block text-[9px]">Certificate Holder</span>
              <div className="font-bold text-slate-900">Verisource Procurement Network & Authorized Workspaces</div>
              <div className="text-slate-600">Global Vendor Master Synchronization Center</div>
              <div className="text-slate-600">100 Enterprise Way, Suite 500</div>
              <div className="text-emerald-700 font-semibold text-[9px] mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Additional Insured & Waiver of Subrogation Endorsed
              </div>
            </div>

            <div className="border border-slate-200 rounded p-2.5 bg-slate-50 flex flex-col justify-between">
              <div>
                <span className="font-bold uppercase text-slate-500 block text-[9px]">Cancellation & Authorized Representative</span>
                <p className="text-[8px] text-slate-500 mt-0.5 leading-tight">
                  Should any of the above described policies be cancelled before the expiration date, notice will be delivered in accordance with policy provisions.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-serif italic font-bold text-slate-900 text-sm">Marcus Vance, CPCU</div>
                  <div className="text-[8px] text-slate-400">Authorized Insurance Representative</div>
                </div>
                <div className="w-12 h-12 rounded-full border border-dashed border-emerald-600 flex items-center justify-center text-[7px] text-emerald-700 font-bold uppercase text-center p-1 rotate-[-12deg]">
                  Marsh Verified Seal
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 2. IRS Form W-9 & Statutory Tax Certification
    if (
      type.includes('W9') || 
      type.includes('W-9') || 
      type.includes('IRS') || 
      type.includes('TAX') || 
      type.includes('EIN') || 
      type.includes('VAT') || 
      type.includes('GST') || 
      type.includes('TIN') || 
      title.includes('W-9') || 
      title.includes('TAX') || 
      title.includes('EIN') || 
      title.includes('VAT') || 
      title.includes('STATUTORY') || 
      docCat.includes('TAX')
    ) {
      return (
        <div className="bg-white text-slate-900 border border-slate-300 shadow-2xl p-6 sm:p-10 text-[11px] font-sans relative">
          {/* Form Header */}
          <div className="border-b-2 border-slate-900 pb-2 flex items-start justify-between">
            <div className="w-24">
              <div className="text-3xl font-black tracking-tighter text-slate-900 font-serif">W-9</div>
              <div className="text-[9px] text-slate-500 font-mono">(Rev. Oct 2024)</div>
            </div>

            <div className="text-center flex-1 px-4">
              <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-900">
                Request for Taxpayer Identification Number and Certification
              </h2>
              <p className="text-[10px] text-slate-600">Department of the Treasury • Internal Revenue Service</p>
            </div>

            <div className="w-24 text-right">
              <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-300">
                TIN MATCH 100%
              </span>
            </div>
          </div>

          {/* Form Fields */}
          <div className="mt-3 space-y-2 text-[10px]">
            <div className="border border-slate-300 rounded p-1.5 bg-slate-50/50">
              <span className="text-slate-400 font-bold text-[8px] block uppercase">1 Name of entity/individual as shown on tax return</span>
              <div className="font-bold text-slate-900 text-xs">Acme Industrial Tech Inc.</div>
            </div>

            <div className="border border-slate-300 rounded p-1.5 bg-slate-50/50">
              <span className="text-slate-400 font-bold text-[8px] block uppercase">2 Business name/disregarded entity name if different</span>
              <div className="font-semibold text-slate-800">Acme Tech Solutions</div>
            </div>

            <div className="border border-slate-300 rounded p-2 bg-slate-50/50">
              <span className="text-slate-400 font-bold text-[8px] block uppercase">3 Check appropriate box for federal tax classification</span>
              <div className="grid grid-cols-3 gap-2 mt-1 text-[9px]">
                <label className="flex items-center gap-1.5 font-bold text-slate-900">
                  <span className="w-3 h-3 rounded-xs border border-slate-900 bg-slate-900 text-white flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                  <span>C Corporation</span>
                </label>
                <label className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-3 h-3 rounded-xs border border-slate-300"></span>
                  <span>Individual / Sole Proprietor</span>
                </label>
                <label className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-3 h-3 rounded-xs border border-slate-300"></span>
                  <span>S Corporation</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="border border-slate-300 rounded p-1.5 bg-slate-50/50">
                <span className="text-slate-400 font-bold text-[8px] block uppercase">5 Address (number, street, and apt. or suite no.)</span>
                <div className="font-semibold text-slate-800">100 Industrial Parkway, Suite 400</div>
              </div>
              <div className="border border-slate-300 rounded p-1.5 bg-slate-50/50">
                <span className="text-slate-400 font-bold text-[8px] block uppercase">6 City, state, and ZIP code</span>
                <div className="font-semibold text-slate-800">Austin, TX 78701</div>
              </div>
            </div>
          </div>

          {/* Part I: Taxpayer Identification Number */}
          <div className="mt-4 border-2 border-slate-900 rounded overflow-hidden">
            <div className="bg-slate-900 text-white font-bold text-[10px] uppercase tracking-wider py-1 px-2.5 flex items-center justify-between">
              <span>Part I: Taxpayer Identification Number (TIN)</span>
              <span className="text-emerald-400 text-[9px] font-mono">IRS Real-time Validated</span>
            </div>
            <div className="p-3 bg-white flex items-center justify-between">
              <div>
                <span className="text-[9px] text-slate-500 uppercase font-bold block">Employer Identification Number (EIN)</span>
                <div className="font-mono text-base font-bold text-slate-900 tracking-widest mt-0.5">
                  84-1294812
                </div>
              </div>
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-lg text-[10px] font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>IRS TIN Match API Validated</span>
              </div>
            </div>
          </div>

          {/* Part II: Certification & Signature */}
          <div className="mt-3 border border-slate-300 rounded p-3 bg-slate-50/70 text-[9px] text-slate-600 space-y-1.5">
            <div className="font-bold uppercase text-slate-800 text-[10px]">Part II: Certification</div>
            <p className="leading-tight">
              Under penalties of perjury, I certify that: (1) The number shown on this form is my correct taxpayer identification number; (2) I am not subject to backup withholding; (3) I am a U.S. citizen or other U.S. person; and (4) The FATCA code(s) entered on this form indicating exemption are correct.
            </p>

            <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[8px] text-slate-400 uppercase block">Sign Here • Signature of U.S. Person</span>
                <div className="font-serif italic font-bold text-slate-900 text-base mt-0.5">
                  Elena Rostova
                </div>
                <div className="text-[8px] text-slate-500">VP Partnerships & Corporate Governance</div>
              </div>
              <div className="text-right">
                <span className="text-[8px] text-slate-400 uppercase block">Date Signed</span>
                <div className="font-mono font-bold text-slate-800 text-xs mt-0.5">01/15/2026</div>
                <div className="text-[8px] text-emerald-600 font-mono">PKI Timestamped</div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 3. ISO/IEC 27001 Certificate
    if (type.includes('ISO') || type.includes('27001')) {
      return (
        <div className="bg-white text-slate-900 border-8 border-emerald-900/20 shadow-2xl p-8 sm:p-12 text-center relative font-serif">
          {/* Security Border */}
          <div className="border-2 border-emerald-800 p-6 sm:p-10 relative">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 border-2 border-emerald-600 flex items-center justify-center text-emerald-800 mb-3 shadow-inner">
              <Award className="w-8 h-8 text-emerald-700" />
            </div>

            <div className="text-[10px] font-mono tracking-widest text-emerald-800 uppercase font-sans font-bold">
              International Organization for Standardization
            </div>

            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900 mt-2 font-serif">
              Certificate of Registration
            </h1>

            <p className="text-xs text-slate-500 font-sans mt-1">This is to certify that the Information Security Management System of</p>

            <div className="my-4 py-2 border-y border-slate-200">
              <h2 className="text-lg sm:text-xl font-black text-emerald-950 font-sans tracking-wide">
                ACME INDUSTRIAL TECH INC.
              </h2>
              <p className="text-[10px] font-sans text-slate-500 mt-0.5">
                100 Industrial Parkway, Suite 400, Austin, TX 78701
              </p>
            </div>

            <p className="text-xs text-slate-600 font-sans max-w-lg mx-auto">
              has been independently audited and confirmed to conform with the requirements of:
            </p>

            <div className="my-3 inline-block px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold font-sans text-sm tracking-wide">
              ISO/IEC 27001:2022
            </div>

            <div className="text-[10px] font-sans text-slate-600 max-w-md mx-auto leading-relaxed mt-2 bg-slate-50 p-2.5 rounded border border-slate-200">
              <strong>Scope:</strong> Design, engineering, deployment, and management of cloud compute nodes, zero-keying mutual TLS cryptographic protocols, and industrial sensor hardware telemetry.
            </div>

            <div className="grid grid-cols-3 gap-2 mt-6 pt-4 border-t border-slate-200 font-sans text-[10px] text-slate-600">
              <div>
                <span className="text-[8px] uppercase text-slate-400 block font-bold">Certificate No.</span>
                <span className="font-mono font-bold text-slate-900">ISMS-773910-2025</span>
              </div>
              <div>
                <span className="text-[8px] uppercase text-slate-400 block font-bold">Issue Date</span>
                <span className="font-mono font-bold text-slate-900">{doc.issuedDate}</span>
              </div>
              <div>
                <span className="text-[8px] uppercase text-slate-400 block font-bold">Valid Until</span>
                <span className="font-mono font-bold text-emerald-700">{doc.expiryDate}</span>
              </div>
            </div>

            {/* Seal & Sign-off */}
            <div className="mt-6 pt-4 flex items-center justify-between font-sans text-[10px] text-left">
              <div>
                <div className="font-serif italic font-bold text-slate-900 text-sm">Dr. Alistair Vance</div>
                <div className="text-[8px] text-slate-400">Lead ISO Auditor • BSI Group Americas</div>
              </div>

              <div className="w-14 h-14 rounded-full border-2 border-emerald-700 bg-emerald-50/50 flex flex-col items-center justify-center text-[7px] text-emerald-800 font-bold uppercase text-center p-1">
                <span>ANAB</span>
                <span className="text-[6px]">Accredited</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 4. Official Bank Account Verification Letter & Remittance Proof
    if (
      type.includes('BANK') || 
      type.includes('LETTER') || 
      type.includes('CHECK') || 
      type.includes('ACH') || 
      type.includes('ROUTING') || 
      type.includes('VOID') || 
      title.includes('BANK') || 
      title.includes('CHECK') || 
      title.includes('REMITTANCE') || 
      docCat.includes('BANK')
    ) {
      return (
        <div className="bg-white text-slate-900 border border-slate-300 shadow-2xl p-8 sm:p-12 text-[11px] font-sans relative">
          {/* Bank Letterhead */}
          <div className="border-b-2 border-blue-900 pb-3 flex items-start justify-between">
            <div>
              <div className="text-xl font-bold tracking-tight text-blue-950 font-serif flex items-center gap-2">
                <Landmark className="w-6 h-6 text-blue-900" />
                <span>JPMorgan Chase Bank, N.A.</span>
              </div>
              <p className="text-[9px] text-slate-500 font-mono mt-0.5">Commercial Client Banking • Corporate Treasury Services</p>
            </div>
            <div className="text-right text-[9px] text-slate-500">
              <div>270 Park Avenue</div>
              <div>New York, NY 10017</div>
              <div className="font-mono text-slate-700 font-semibold mt-1">SWIFT: CHASUS33</div>
            </div>
          </div>

          <div className="mt-4 text-xs font-semibold text-slate-500">
            Date: <span className="text-slate-900 font-bold">{doc.issuedDate}</span>
          </div>

          <div className="mt-3 text-slate-700 space-y-1">
            <div className="font-bold text-slate-900">To: Commercial Credit & S2P Risk Evaluation Committee</div>
            <div className="text-slate-600">Re: Corporate Depository Account Verification & Remittance Coordinates</div>
          </div>

          <div className="mt-4 text-slate-700 leading-relaxed text-xs">
            This letter certifies that <strong>Acme Industrial Tech Inc.</strong> maintains an active commercial depository relationship in good standing with JPMorgan Chase Bank, N.A.
          </div>

          {/* Account Spec Sheet */}
          <div className="mt-4 border border-blue-200 rounded-xl overflow-hidden bg-blue-50/40">
            <div className="bg-blue-950 text-white font-bold text-[10px] uppercase tracking-wider py-1.5 px-3">
              Verified Depository Account Coordinates
            </div>
            <div className="p-4 grid grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <span className="text-[9px] text-slate-500 uppercase font-sans font-bold block">Account Legal Name</span>
                <span className="font-bold text-slate-900">Acme Industrial Tech Inc.</span>
              </div>

              <div>
                <span className="text-[9px] text-slate-500 uppercase font-sans font-bold block">Account Status</span>
                <span className="font-bold text-emerald-700 font-sans flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Active & Good Standing
                </span>
              </div>

              <div>
                <span className="text-[9px] text-slate-500 uppercase font-sans font-bold block">Routing Transit Number (ABA)</span>
                <span className="font-bold text-slate-900">021000021</span>
                <span className="text-[9px] text-slate-500 font-sans block">FedACH / FedWire Direct Deposit</span>
              </div>

              <div>
                <span className="text-[9px] text-slate-500 uppercase font-sans font-bold block">Depository Account Number</span>
                <span className="font-bold text-slate-900">••••••••4921 (USD Operating)</span>
              </div>

              <div>
                <span className="text-[9px] text-slate-500 uppercase font-sans font-bold block">Client Relationship Since</span>
                <span className="font-bold text-slate-900">March 14, 2018</span>
              </div>

              <div>
                <span className="text-[9px] text-slate-500 uppercase font-sans font-bold block">Early Warning Services (EWS)</span>
                <span className="font-bold text-emerald-700 font-sans">Active Real-Time API Match</span>
              </div>
            </div>
          </div>

          {/* Sign off */}
          <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between text-xs">
            <div>
              <div className="font-serif italic font-bold text-slate-900 text-base">David M. Sterling</div>
              <div className="text-[10px] text-slate-500">Vice President, Commercial Client Treasury Services</div>
              <div className="text-[9px] text-slate-400">JPMorgan Chase Bank, N.A.</div>
            </div>

            <div className="w-14 h-14 rounded-full border-2 border-blue-900 bg-blue-50/60 flex flex-col items-center justify-center text-[7px] text-blue-900 font-bold uppercase text-center p-1">
              <span>CHASE</span>
              <span className="text-[6px]">Bank Seal</span>
            </div>
          </div>
        </div>
      );
    }

    // 5. State of Delaware Certificate of Incorporation
    if (type.includes('INCORPORATION')) {
      return (
        <div className="bg-white text-slate-900 border-4 border-slate-900 shadow-2xl p-8 sm:p-12 text-center font-serif relative">
          <div className="border border-slate-400 p-6 sm:p-10">
            <div className="text-xl font-bold tracking-widest uppercase text-slate-900">
              State of Delaware
            </div>
            <div className="text-xs uppercase tracking-widest text-slate-600 mt-0.5">
              Department of State • Division of Corporations
            </div>

            <div className="w-16 h-16 rounded-full border border-amber-600 bg-amber-50 mx-auto my-4 flex items-center justify-center font-bold text-amber-800 text-[10px] uppercase">
              Great Seal
            </div>

            <h1 className="text-lg sm:text-xl font-black uppercase text-slate-900 mt-2">
              Certificate of Incorporation
            </h1>

            <p className="text-xs text-slate-700 italic max-w-md mx-auto mt-3 leading-relaxed">
              I, JEFFREY W. BULLOCK, SECRETARY OF STATE OF THE STATE OF DELAWARE, DO HEREBY CERTIFY THAT "ACME INDUSTRIAL TECH INC." IS DULY INCORPORATED UNDER THE LAWS OF THE STATE OF DELAWARE AND IS IN GOOD STANDING.
            </p>

            <div className="my-4 py-3 border-y border-slate-200 text-xs font-sans text-left grid grid-cols-2 gap-3 bg-slate-50/70 p-3 rounded">
              <div>
                <span className="text-[9px] text-slate-400 uppercase font-bold block">State File Number</span>
                <span className="font-mono font-bold text-slate-900">DE-4920194</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 uppercase font-bold block">Date of Incorporation</span>
                <span className="font-mono font-bold text-slate-900">{doc.issuedDate}</span>
              </div>
              <div className="col-span-2">
                <span className="text-[9px] text-slate-400 uppercase font-bold block">Registered Agent & Office</span>
                <span className="text-slate-800">The Corporation Trust Company, 1209 N Orange St, Wilmington, DE 19801</span>
              </div>
            </div>

            <div className="mt-6 pt-4 flex items-center justify-between text-left text-xs font-sans">
              <div>
                <div className="font-serif italic font-bold text-slate-900 text-sm">Jeffrey W. Bullock</div>
                <div className="text-[9px] text-slate-500">Secretary of State, State of Delaware</div>
              </div>
              <div className="text-right font-mono text-[9px] text-slate-400">
                Authentication: 204918294
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 6. Deloitte SOC 2 Type II Report
    if (
      type.includes('SOC') || 
      type.includes('SOC2') || 
      type.includes('SOC_2') || 
      title.includes('SOC')
    ) {
      return (
        <div className="bg-white text-slate-900 border border-slate-300 shadow-2xl p-8 sm:p-12 text-[11px] font-sans relative">
          <div className="border-b-2 border-slate-900 pb-3 flex items-start justify-between">
            <div>
              <div className="text-2xl font-black text-slate-900 font-sans tracking-tight">Deloitte.</div>
              <p className="text-[10px] text-slate-500 mt-0.5">Deloitte & Touche LLP • Cyber Risk & Assurance Practice</p>
            </div>
            <div className="text-right text-[10px] text-slate-500">
              <div>555 Mission Street, Suite 1400</div>
              <div>San Francisco, CA 94105</div>
            </div>
          </div>

          <div className="mt-4 text-xs font-bold text-slate-900 uppercase tracking-wide">
            Independent Service Auditor's Report (SOC 2 Type II)
          </div>

          <div className="mt-2 text-slate-600 text-xs">
            To the Board of Directors & Management of <strong>Acme Industrial Tech Inc.</strong>:
          </div>

          <div className="mt-3 text-slate-700 leading-relaxed space-y-2 text-xs">
            <p>
              We have examined Acme Industrial Tech Inc.'s description of its compute infrastructure and telemetry systems throughout the period <strong>January 1, 2025 to December 31, 2025</strong>.
            </p>
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-emerald-950 font-medium">
              <strong>Opinion:</strong> In our opinion, in all material respects, the controls stated in the description operated effectively throughout the period to provide reasonable assurance that the <strong>Security, Availability, and Confidentiality</strong> trust services criteria were achieved with zero exceptions.
            </div>
          </div>

          <div className="mt-4 border border-slate-200 rounded p-3 bg-slate-50 grid grid-cols-2 gap-2 text-[10px]">
            <div>
              <span className="text-slate-400 font-bold block uppercase text-[8px]">Standard</span>
              <span className="font-semibold text-slate-800">AICPA SSAE No. 18 (AT-C Section 205)</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold block uppercase text-[8px]">Assurance Level</span>
              <span className="font-semibold text-emerald-700">Type II (Operating Effectiveness)</span>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between text-xs">
            <div>
              <div className="font-bold text-slate-900">Deloitte & Touche LLP</div>
              <div className="text-[10px] text-slate-500">Certified Public Accountants</div>
            </div>
            <div className="text-right text-[10px] font-mono text-slate-400">
              Audit Engagement #2026-DEL-9921
            </div>
          </div>
        </div>
      );
    }

    // 7. Diversity Credential Certificate (MBE / WBE / VBE / NMSDC / WBENC)
    if (
      type.includes('MBE') || 
      type.includes('WBE') || 
      type.includes('VBE') || 
      type.includes('DIVERSITY') || 
      title.includes('DIVERSITY') || 
      title.includes('MINORITY') || 
      title.includes('WOMEN')
    ) {
      return (
        <div className="bg-white text-slate-900 border-8 border-amber-900/20 shadow-2xl p-8 sm:p-12 text-center relative font-serif">
          <div className="border-2 border-amber-800 p-6 sm:p-10 relative">
            <div className="w-14 h-14 mx-auto rounded-full bg-amber-50 border-2 border-amber-600 flex items-center justify-center text-amber-800 mb-3 shadow-inner">
              <Award className="w-8 h-8 text-amber-700" />
            </div>

            <div className="text-[10px] font-mono tracking-widest text-amber-800 uppercase font-sans font-bold">
              National Minority Supplier Development Council • WBENC Certified
            </div>

            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900 mt-2 font-serif">
              Certificate of Supplier Diversity
            </h1>

            <p className="text-xs text-slate-500 font-sans mt-1">
              This is to formally certify that
            </p>

            <div className="my-4 py-2 border-y border-slate-200">
              <h2 className="text-lg sm:text-xl font-black text-amber-950 font-sans tracking-wide">
                ACME INDUSTRIAL TECH INC.
              </h2>
              <p className="text-[10px] font-sans text-slate-500 mt-0.5">
                100 Industrial Parkway, Suite 400, Austin, TX 78701
              </p>
            </div>

            <p className="text-xs text-slate-600 font-sans max-w-lg mx-auto">
              has completed the stringent vetting requirements and is officially recognized as an accredited:
            </p>

            <div className="my-3 inline-block px-4 py-1.5 rounded-full bg-amber-50 border border-amber-300 text-amber-900 font-bold font-sans text-sm tracking-wide">
              {doc.title || 'Minority / Women-Owned Business Enterprise (MWBE)'}
            </div>

            <div className="grid grid-cols-3 gap-2 mt-6 pt-4 border-t border-slate-200 font-sans text-[10px] text-slate-600">
              <div>
                <span className="text-[8px] uppercase text-slate-400 block font-bold">Certificate No.</span>
                <span className="font-mono font-bold text-slate-900">DIV-99482-2026</span>
              </div>
              <div>
                <span className="text-[8px] uppercase text-slate-400 block font-bold">Issue Date</span>
                <span className="font-mono font-bold text-slate-900">{doc.issuedDate}</span>
              </div>
              <div>
                <span className="text-[8px] uppercase text-slate-400 block font-bold">Valid Until</span>
                <span className="font-mono font-bold text-emerald-700">{doc.expiryDate}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 flex items-center justify-between font-sans text-[10px] text-left">
              <div>
                <div className="font-serif italic font-bold text-slate-900 text-sm">Candace M. Washington</div>
                <div className="text-[8px] text-slate-400">President & CEO, Regional Supplier Council</div>
              </div>

              <div className="w-14 h-14 rounded-full border-2 border-amber-700 bg-amber-50/50 flex flex-col items-center justify-center text-[7px] text-amber-800 font-bold uppercase text-center p-1">
                <span>NMSDC</span>
                <span className="text-[6px]">Verified</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 7. Generic / Custom Uploaded Document
    return (
      <div className="bg-white text-slate-900 border border-slate-300 shadow-2xl p-8 sm:p-12 text-[11px] font-sans relative">
        <div className="border-b-2 border-slate-900 pb-3 flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">{doc.title}</h2>
              <p className="text-[10px] text-slate-500 font-mono">{doc.type} • {doc.documentCategory}</p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            Digitally Verified
          </span>
        </div>

        <div className="my-6 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-[9px] text-slate-400 font-bold uppercase block">Owner Legal Entity</span>
              <span className="font-bold text-slate-900">Acme Industrial Tech Inc.</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 font-bold uppercase block">Verification Authority</span>
              <span className="font-semibold text-emerald-700">{doc.verifiedBy}</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 font-bold uppercase block">Issued Date</span>
              <span className="font-mono text-slate-800">{doc.issuedDate}</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 font-bold uppercase block">Expiration Date</span>
              <span className="font-mono text-slate-800">{doc.expiryDate}</span>
            </div>
          </div>
        </div>

        <div className="p-4 border border-slate-200 rounded-xl text-slate-600 text-xs leading-relaxed space-y-2">
          <p>
            This document record has been ingested into the Verisource Secure Vault. The authenticity of this record has been verified and registered on the corporate compliance ledger.
          </p>
          <div className="text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-100">
            SHA-256 Fingerprint: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="text-slate-500">
            Registered: {doc.issuedDate}
          </div>
          <div className="text-emerald-700 font-semibold flex items-center gap-1 text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Active Vault Asset
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[200] p-2 sm:p-4 animate-in fade-in duration-150">
      <div className={`bg-slate-900 border border-slate-750 ${showInquiriesPanel ? 'max-w-6xl' : 'max-w-4xl'} w-full h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-white transition-all duration-200`}>
        {/* Top Control Bar */}
        <div className="px-4 py-3 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              isExpired 
                ? 'bg-rose-500/20 text-rose-400'
                : isWarning 
                  ? 'bg-amber-500/20 text-amber-400' 
                  : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-xs sm:text-sm text-white truncate max-w-[240px] sm:max-w-xs md:max-w-md">
                  {doc.title}
                </h3>
                {isExpired ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-rose-400" />
                    Expired ({Math.abs(doc.daysRemaining)}d ago)
                  </span>
                ) : isWarning ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Expires in {doc.daysRemaining}d
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Verified Monitored
                  </span>
                )}
              </div>
              <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                <span className="font-mono">{filename}</span>
                <span>•</span>
                <span>{doc.fileSize}</span>
                <span>•</span>
                <span>Page 1 of 1</span>
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Zoom Controls */}
            <div className="hidden sm:flex items-center bg-slate-800/90 border border-slate-700 rounded-xl p-0.5 text-xs text-slate-300 mr-1">
              <button
                onClick={handleZoomOut}
                className="p-1 hover:text-white hover:bg-slate-700/60 rounded cursor-pointer transition"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleResetZoom}
                className="px-1.5 py-0.5 font-mono text-[10px] hover:text-white cursor-pointer"
                title="Reset Zoom"
              >
                {zoomLevel}%
              </button>
              <button
                onClick={handleZoomIn}
                className="p-1 hover:text-white hover:bg-slate-700/60 rounded cursor-pointer transition"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Toggle Compliance Inquiries */}
            <button
              onClick={() => setShowInquiriesPanel(prev => !prev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                showInquiriesPanel
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                  : 'bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700'
              }`}
              title="Audit & Compliance Inquiries"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Inquiries ({comments.length})</span>
              {comments.length > 0 && !showInquiriesPanel && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              )}
            </button>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
              title="Print Certificate"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Print</span>
            </button>

            {/* Download PDF Button */}
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="Download Official PDF Copy"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer ml-1"
              title="Close Preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Body Viewport: Document Canvas + In-Situ Inquiries Panel */}
        <div className="flex-1 flex overflow-hidden">
          {/* Scrollable Document Canvas Viewport */}
          <div className="flex-1 bg-slate-950 p-4 sm:p-8 overflow-y-auto flex justify-center items-start">
            <div 
              className="w-full max-w-[760px] transition-transform duration-150 origin-top"
              style={{ transform: `scale(${zoomLevel / 100})` }}
            >
              {renderDocumentPaper()}
            </div>
          </div>

          {/* In-Situ Document Inquiries Side Panel */}
          {showInquiriesPanel && (
            <div className="w-80 sm:w-96 border-l border-slate-800 bg-slate-900 flex flex-col h-full animate-in slide-in-from-right-4 duration-150 shrink-0">
              {/* Inquiries Header */}
              <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <MessageSquare className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Compliance Inquiries</h4>
                    <p className="text-[10px] text-slate-400">Anchored to {doc.type}</p>
                  </div>
                </div>
                {onOpenCentralMessages && (
                  <button
                    onClick={() => onOpenCentralMessages(doc.id, doc.type)}
                    className="text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
                    title="Open full thread in Central Collaboration Hub"
                  >
                    <span>Central Hub ↗</span>
                  </button>
                )}
              </div>

              {/* Message List */}
              <div className="flex-1 p-3.5 overflow-y-auto space-y-3">
                {comments.map((c) => {
                  const isMe = c.authorName === 'Elena Rostova' || (c.authorRole && c.authorRole.includes('Acme'));
                  return (
                    <div key={c.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center space-x-1 text-[10px] text-slate-400 mb-1 px-1">
                        <span className="font-semibold text-slate-300">{c.authorName}</span>
                        <span>•</span>
                        <span>{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className={`p-3 rounded-2xl text-xs leading-relaxed max-w-[90%] ${
                        isMe
                          ? 'bg-emerald-600 text-white rounded-br-none shadow-xs'
                          : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none'
                      }`}>
                        {c.text}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* AI Suggestions Chips */}
              <div className="p-2.5 bg-slate-950/80 border-t border-slate-800/80">
                <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-400 mb-1.5 uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  <span>AI Suggestions:</span>
                </div>
                <div className="space-y-1">
                  {getDocAiSuggestions().map((sugg, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setNewComment(sugg.text)}
                      className="w-full text-left px-2 py-1 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-indigo-400/50 rounded-lg text-[11px] text-slate-300 hover:text-white transition cursor-pointer truncate block"
                      title={sugg.text}
                    >
                      {sugg.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendComment} className="p-2.5 bg-slate-950 border-t border-slate-800 flex items-center space-x-2 shrink-0">
                <input
                  type="text"
                  placeholder="Reply to auditor or ask question..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 text-xs border border-slate-700 bg-slate-850 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none placeholder-slate-500"
                />
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="p-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl transition cursor-pointer shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Bottom Status & Quick Action Strip */}
        <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2 text-[11px] truncate">
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verisource Monitored Record
            </span>
            <span>•</span>
            <span className="truncate">Audited by {doc.verifiedBy}</span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {(isExpired || isWarning) && onRenew && (
              <button
                onClick={() => {
                  onRenew(doc.id);
                  onClose();
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  isExpired 
                    ? 'bg-rose-600 hover:bg-rose-500 text-white' 
                    : 'bg-amber-600 hover:bg-amber-500 text-white'
                }`}
              >
                {isExpired ? 'Replace Expired Certificate' : 'Renew Policy Now'}
              </button>
            )}
            <button
              onClick={handleDownload}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save Copy</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

