import React from 'react';
import { 
  MapPin, 
  ChevronDown
} from 'lucide-react';
import { GepCommercialSettings } from '../../types/index.js';
import { SearchableSelect } from '../common/SearchableSelect.js';

interface GepCommercialTermsProps {
  settings: GepCommercialSettings;
  onChange: (settings: GepCommercialSettings) => void;
  readOnly?: boolean;
}

export const GepCommercialTerms: React.FC<GepCommercialTermsProps> = ({
  settings,
  onChange,
  readOnly = false
}) => {
  const updateSetting = <K extends keyof GepCommercialSettings>(key: K, val: GepCommercialSettings[K]) => {
    onChange({
      ...settings,
      [key]: val
    });
  };

  const isMilestone = settings.billingScheduleStructure === 'MILESTONE_PROGRESS';
  const hasEInvoicing = Boolean(
    settings.eInvoicingFramework && 
    !settings.eInvoicingFramework.includes('None') &&
    !settings.eInvoicingFramework.includes('Standard Document Billing')
  );

  // Normalization helpers for clean matching with existing or new values
  const currentMatching = (() => {
    const val = settings.matchingType || '';
    if (val.includes('3-Way')) return '3-Way Match';
    if (val.includes('2-Way')) return '2-Way Match';
    if (val.includes('4-Way')) return '4-Way Match';
    if (val.includes('ERS')) return 'ERS (Evaluated Receipt Settlement)';
    return '3-Way Match';
  })();

  const currentTriggerDate = (() => {
    const val = settings.baselineTriggerDate || '';
    if (val.includes('Receipt') || val.includes('GR')) return 'Goods Receipt Date (GR Date)';
    if (val.includes('Issue')) return 'Invoice Issue Date';
    if (val.includes('Acceptance') || val.includes('Approval')) return 'Invoice Approval Date';
    return 'Goods Receipt Date (GR Date)';
  })();

  const currentPaymentTerms = (() => {
    const val = settings.paymentTerms || '';
    if (val.includes('2/10 Net 30')) return '2/10 Net 30';
    if (val.includes('2/10 Net 45')) return '2/10 Net 45';
    if (val.includes('1/10 Net 30')) return '1/10 Net 30';
    if (val.includes('Net 30')) return 'Net 30';
    if (val.includes('Net 45')) return 'Net 45';
    if (val.includes('Net 60')) return 'Net 60';
    if (val.includes('Net 90')) return 'Net 90';
    return '2/10 Net 30';
  })();

  const currentCurrency = (() => {
    const val = settings.primaryCurrency || '';
    if (val.includes('USD')) return 'USD ($)';
    if (val.includes('EUR')) return 'EUR (€)';
    if (val.includes('GBP')) return 'GBP (£)';
    if (val.includes('CAD')) return 'CAD ($)';
    if (val.includes('JPY')) return 'JPY (¥)';
    return 'USD ($)';
  })();

  const currentDisbursement = (() => {
    const val = settings.disbursementMethod || '';
    if (val.includes('ACH')) return 'ACH / Direct Deposit';
    if (val.includes('Domestic Wire')) return 'Domestic Wire Transfer';
    if (val.includes('International Wire') || val.includes('SWIFT')) return 'International Wire (SWIFT)';
    if (val.includes('Card') || val.includes('vCard')) return 'Virtual Card (vCard)';
    if (val.includes('Check')) return 'Check';
    return 'ACH / Direct Deposit';
  })();

  const currentIngestion = (() => {
    const val = settings.ingestionChannel || '';
    if (val.includes('Portal')) return 'Supplier Portal Upload';
    if (val.includes('cXML')) return 'cXML / ERP Integration';
    if (val.includes('EDI')) return 'EDI (ANSI X12 / EDIFACT)';
    if (val.includes('PDF')) return 'PDF via OCR Ingestion';
    return 'Supplier Portal Upload';
  })();

  const currentFramework = (() => {
    const val = settings.eInvoicingFramework || '';
    if (val.includes('PEPPOL')) return 'PEPPOL Network';
    if (val.includes('FatturaPA')) return 'FatturaPA (Italy)';
    if (val.includes('ZUGFeRD') || val.includes('XRechnung')) return 'ZUGFeRD / XRechnung (Germany)';
    if (val.includes('CFDI')) return 'CFDI (Mexico)';
    return 'Standard Document Billing';
  })();

  const currentIncoterm = (() => {
    const val = settings.incoTerms || '';
    if (val.includes('FCA')) return 'FCA - Free Carrier';
    if (val.includes('DDP')) return 'DDP - Delivered Duty Paid';
    if (val.includes('CPT')) return 'CPT - Carriage Paid To';
    if (val.includes('CIP')) return 'CIP - Carriage & Insurance Paid To';
    if (val.includes('DAP')) return 'DAP - Delivered At Place';
    if (val.includes('EXW')) return 'EXW - Ex Works';
    if (val.includes('FOB')) return 'FOB - Free On Board';
    return 'FCA - Free Carrier';
  })();

  return (
    <div className="space-y-4">
      {/* ========================================================
          COMMERCIAL TERMS & PROTOCOLS (UNIFIED SINGLE GRID)
         ======================================================== */}
      <div className="border border-slate-200 rounded-xl bg-white shadow-2xs p-4 sm:p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 1. Invoice Matching Protocol */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Invoice Matching <span className="text-red-500">*</span>
            </label>
            <SearchableSelect
              disabled={readOnly}
              value={currentMatching}
              onChange={(val) => updateSetting('matchingType', val)}
              placeholder="Select Matching Protocol..."
              options={[
                '3-Way Match',
                '2-Way Match',
                '4-Way Match',
                'ERS (Evaluated Receipt Settlement)'
              ]}
            />
          </div>

          {/* 2. Baseline Trigger Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Baseline Trigger Date <span className="text-red-500">*</span>
            </label>
            <SearchableSelect
              disabled={readOnly}
              value={currentTriggerDate}
              onChange={(val) => updateSetting('baselineTriggerDate', val)}
              placeholder="Select Trigger Date..."
              options={[
                'Goods Receipt Date (GR Date)',
                'Invoice Issue Date',
                'Invoice Approval Date'
              ]}
            />
          </div>

          {/* 3. Standard Payment Terms */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Payment Terms <span className="text-red-500">*</span>
            </label>
            <SearchableSelect
              disabled={readOnly}
              value={currentPaymentTerms}
              onChange={(val) => updateSetting('paymentTerms', val)}
              placeholder="Select Payment Terms..."
              searchPlaceholder="Search terms (e.g. Net 30, 2/10)..."
              options={[
                '2/10 Net 30',
                '2/10 Net 45',
                '1/10 Net 30',
                '1/15 Net 30',
                '3/15 Net 60',
                'Net 30',
                'Net 45',
                'Net 60',
                'Net 90',
                'End of Month (EOM)',
                'Due Upon Receipt'
              ]}
            />
          </div>

          {/* 4. Billing Schedule Structure */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Billing Schedule <span className="text-red-500">*</span>
            </label>
            <div className="h-[38px] flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200">
              <button
                type="button"
                disabled={readOnly}
                onClick={() => updateSetting('billingScheduleStructure', 'STANDARD_PO')}
                className={`h-full flex-1 rounded-md text-xs font-semibold text-center transition cursor-pointer flex items-center justify-center ${
                  !isMilestone
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Standard PO
              </button>
              <button
                type="button"
                disabled={readOnly}
                onClick={() => updateSetting('billingScheduleStructure', 'MILESTONE_PROGRESS')}
                className={`h-full flex-1 rounded-md text-xs font-semibold text-center transition cursor-pointer flex items-center justify-center ${
                  isMilestone
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Milestone Progress
              </button>
            </div>
          </div>

          {/* 5. Primary Settlement Currency */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Settlement Currency <span className="text-red-500">*</span>
            </label>
            <SearchableSelect
              disabled={readOnly}
              value={currentCurrency}
              onChange={(val) => updateSetting('primaryCurrency', val.split(' ')[0])}
              placeholder="Select Currency..."
              searchPlaceholder="Search currency..."
              options={[
                'USD ($)',
                'EUR (€)',
                'GBP (£)',
                'CAD ($)',
                'JPY (¥)',
                'CHF (CHF)',
                'AUD ($)',
                'SGD ($)',
                'INR (₹)'
              ]}
            />
          </div>

          {/* 6. Preferred Disbursement Method */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Disbursement Method <span className="text-red-500">*</span>
            </label>
            <SearchableSelect
              disabled={readOnly}
              value={currentDisbursement}
              onChange={(val) => updateSetting('disbursementMethod', val)}
              placeholder="Select Disbursement Method..."
              options={[
                'ACH / Direct Deposit',
                'Domestic Wire Transfer',
                'International Wire (SWIFT)',
                'Virtual Card (vCard)',
                'Check'
              ]}
            />
          </div>

          {/* Conditional Milestone Billing Protocol */}
          {isMilestone && (
            <div className="md:col-span-3 space-y-1.5 animate-in fade-in">
              <label className="text-xs font-semibold text-slate-700">
                Milestone Schedule Tranches <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={2}
                disabled={readOnly}
                value={settings.milestoneBillingProtocol || ''}
                onChange={(e) => updateSetting('milestoneBillingProtocol', e.target.value)}
                placeholder="e.g. 30% PO Acceptance, 40% Factory Testing, 30% Final Commissioning"
                className={`w-full px-3 py-2 text-xs rounded-lg border transition resize-none ${
                  readOnly
                    ? 'bg-slate-50 text-slate-700 border-slate-200 cursor-default'
                    : 'bg-white text-slate-900 border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600'
                }`}
              />
            </div>
          )}

          {/* 7. Invoice Ingestion Channel */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Ingestion Channel <span className="text-red-500">*</span>
            </label>
            <SearchableSelect
              disabled={readOnly}
              value={currentIngestion}
              onChange={(val) => updateSetting('ingestionChannel', val)}
              placeholder="Select Ingestion Channel..."
              options={[
                'Supplier Portal Upload',
                'cXML / ERP Integration',
                'EDI (ANSI X12 / EDIFACT)',
                'PDF via OCR Ingestion'
              ]}
            />
          </div>

          {/* 8. Cross-Border E-Invoicing Framework */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              E-Invoicing Framework <span className="text-red-500">*</span>
            </label>
            <SearchableSelect
              disabled={readOnly}
              value={currentFramework}
              onChange={(val) => updateSetting('eInvoicingFramework', val)}
              placeholder="Select Framework..."
              searchPlaceholder="Search e-invoicing framework..."
              options={[
                'Standard Document Billing',
                'PEPPOL Network',
                'FatturaPA (Italy)',
                'ZUGFeRD / XRechnung (Germany)',
                'CFDI (Mexico)',
                'Chorus Pro (France)',
                'KSeF (Poland)',
                'Finvoice (Finland)'
              ]}
            />
          </div>

          {/* 9. Endpoint ID (Col 3 when hasEInvoicing is true) */}
          {hasEInvoicing && (
            <div className="space-y-1.5 animate-in fade-in">
              <label className="text-xs font-semibold text-slate-700">
                Endpoint ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                disabled={readOnly}
                value={settings.eInvoicingEndpointId || '0088:1234567890123'}
                onChange={(e) => updateSetting('eInvoicingEndpointId', e.target.value)}
                placeholder="e.g. 0088:1234567890123"
                className={`w-full px-3 py-2 text-xs font-mono font-medium rounded-lg border transition ${
                  readOnly
                    ? 'bg-slate-50 text-slate-700 border-slate-200 cursor-default'
                    : 'bg-white text-slate-900 border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600'
                }`}
              />
            </div>
          )}

          {/* 10. Incoterm Code */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Incoterms (Delivery Terms) <span className="text-red-500">*</span>
            </label>
            <SearchableSelect
              disabled={readOnly}
              value={currentIncoterm}
              onChange={(val) => updateSetting('incoTerms', val)}
              placeholder="Select Incoterm..."
              searchPlaceholder="Search Incoterms (e.g. FCA, DDP, FOB)..."
              options={[
                'FCA - Free Carrier',
                'DDP - Delivered Duty Paid',
                'CPT - Carriage Paid To',
                'CIP - Carriage & Insurance Paid To',
                'DAP - Delivered At Place',
                'EXW - Ex Works',
                'FOB - Free On Board',
                'FAS - Free Alongside Ship',
                'CFR - Cost and Freight',
                'CIF - Cost, Insurance and Freight',
                'DPU - Delivered at Place Unloaded'
              ]}
            />
          </div>

          {/* 11. Named Delivery Place */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-slate-700">
              Named Delivery Place <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <input
                type="text"
                disabled={readOnly}
                value={settings.namedDeliveryPlace || 'Austin Logistics Facility, TX'}
                onChange={(e) => updateSetting('namedDeliveryPlace', e.target.value)}
                placeholder="e.g. Austin Logistics Facility, TX"
                className={`w-full pl-8 pr-3 py-2 text-xs rounded-lg border transition ${
                  readOnly
                    ? 'bg-slate-50 text-slate-700 border-slate-200 cursor-default'
                    : 'bg-white text-slate-900 border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600'
                }`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
